# Applies optimized chapter illustrations to Class 10 generated pages.
# Called at the end of _build.ps1; safe to run repeatedly.
$ErrorActionPreference = 'Stop'
$smDir = $PSScriptRoot
$data = Get-Content -LiteralPath (Join-Path $smDir 'study-data.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$class10 = @($data.classes | Where-Object { [int]$_.number -eq 10 })[0]
if (-not $class10) { throw 'Class 10 was not found in study-data.json' }

$assetBase = '/cbse-study-material/class-10/'
$imageBase = $assetBase + 'images/'
$imageDir = Join-Path $smDir 'class-10/images'
$cssPath = Join-Path $smDir 'class-10/chapter-visuals.css'
$scriptPath = Join-Path $smDir 'class-10/chapter-visuals.js'
if (-not (Test-Path $cssPath) -or -not (Test-Path $scriptPath) -or -not (Test-Path $imageDir)) {
  throw 'Class 10 chapter visual assets are missing.'
}

foreach ($artId in @('math-hub', 'science-hub') + @($class10.subjects | ForEach-Object {
  $subjectKey = if ($_.slug -eq 'mathematics') { 'math' } else { 'science' }
  for ($i = 0; $i -lt $_.chapters.Count; $i++) { $subjectKey + '-' + ($i + 1).ToString('00') }
})) {
  if (-not (Test-Path -LiteralPath (Join-Path $imageDir ($artId + '.webp')))) { throw "Class 10 chapter image is missing: $artId.webp" }
}

function Add-VisualAssets([string]$html, [string]$scope, [string]$subject, [string]$chapter) {
  $body = [regex]::Match($html, '<body\b[^>]*>')
  if (-not $body.Success) { return $html }
  $attrs = ' data-cbse-visual-scope="class-10" data-cbse-visual-page="' + $scope + '"'
  if ($subject) { $attrs += ' data-cbse-visual-subject="' + $subject + '"' }
  if ($chapter) { $attrs += ' data-cbse-visual-chapter="' + $chapter + '"' }
  $opening = $body.Value
  if ($opening -notmatch 'data-cbse-visual-scope=') {
    $html = $html.Substring(0, $body.Index) + $opening.Insert($opening.Length - 1, $attrs) + $html.Substring($body.Index + $opening.Length)
  }
  if ($html -notmatch [regex]::Escape('class-10/chapter-visuals.css')) {
    $css = '<link rel="stylesheet" href="/cbse-study-material/class-10/chapter-visuals.css?v=1" />'
    $html = [regex]::Replace($html, '(?m)(<link\s+rel="stylesheet"\s+href="/styles\.css"\s*/?>)', ('$1' + "`n  " + $css), 1)
  }
  if ($html -notmatch [regex]::Escape('class-10/chapter-visuals.js')) {
    $js = '<script src="/cbse-study-material/class-10/chapter-visuals.js?v=1" defer></script>'
    $html = $html.Replace('</body>', $js + "`n</body>")
  }
  return $html
}

function New-ArtMarkup([string]$artId, [string]$extraClass) {
  $class = 'cbse-chapter-art' + $(if ($extraClass) { ' ' + $extraClass } else { '' })
  $loading = if ($extraClass -match 'cbse-hero-art') { 'loading="eager" fetchpriority="high"' } else { 'loading="lazy"' }
  $image = $script:imageBase + $artId + '.webp'
  return '<div class="' + $class + '" data-art-id="' + $artId + '" aria-hidden="true"><img src="' + $image + '" alt="" width="640" height="320" ' + $loading + ' decoding="async" /></div>'
}

function Add-HeroBrand([string]$html) {
  $brand = '<p class="cbse-hero-brand">VYASA ACADEMY | LEARN | UNDERSTAND | EXCEL</p>'
  if ($html -match 'cbse-hero-brand') {
    return [regex]::Replace($html, '<p\b[^>]*class="[^"]*cbse-hero-brand[^"]*"[^>]*>.*?</p>', $brand, 1)
  }
  return [regex]::Replace($html, '(<section\b[^>]*class="[^"]*sm-hero[^>]*>)', ('$1' + "`n      " + $brand), 1)
}

function Refresh-ArtMarkup([string]$html) {
  $pattern = '(?s)<div class="([^"]*\bcbse-chapter-art\b[^"]*)" data-art-id="([^"]+)" aria-hidden="true">.*?</div>'
  return [regex]::Replace($html, $pattern, {
    param($match)
    $extraClass = (($match.Groups[1].Value -split '\s+') | Where-Object { $_ -and $_ -ne 'cbse-chapter-art' }) -join ' '
    New-ArtMarkup $match.Groups[2].Value $extraClass
  })
}

function Add-SubjectChapterCards([string]$html, $subject, [string]$subjectKey) {
  $chapterNumbers = @{}
  for ($i = 0; $i -lt $subject.chapters.Count; $i++) { $chapterNumbers[[string]$subject.chapters[$i].slug] = $i + 1 }
  $hrefPattern = 'href="/cbse-study-material/class-10/' + [regex]::Escape([string]$subject.slug) + '/([^/]+)/"'
  $pattern = '(?s)<a\b(?=[^>]*class="[^"]*sm-chapter-card[^\"]*")[^>]*>.*?</a>'
  return [regex]::Replace($html, $pattern, {
    param($match)
    $block = $match.Value
    $href = [regex]::Match($block, $hrefPattern)
    if (-not $href.Success -or -not $chapterNumbers.ContainsKey($href.Groups[1].Value)) { return $block }
    $number = [int]$chapterNumbers[$href.Groups[1].Value]
    $artId = $subjectKey + '-' + $number.ToString('00')
    if ($block -match 'data-art-id=') { return $block }
    $art = New-ArtMarkup $artId ''
    $imagePattern = '<img\b(?=[^>]*class="[^"]*sm-chapter-img[^"]*")[^>]*>'
    if ([regex]::IsMatch($block, $imagePattern)) {
      $block = [regex]::Replace($block, $imagePattern, $art, 1)
    } else {
      $block = [regex]::Replace($block, '^(<a\b[^>]*class="[^"]*)"', ('$1 cbse-visual-card"'), 1)
      $opening = [regex]::Match($block, '^<a\b[^>]*>')
      if ($opening.Success) { $block = $block.Insert($opening.Length, "`n  " + $art) }
    }
    if ($block -notmatch 'cbse-visual-card') { $block = [regex]::Replace($block, '^(<a\b[^>]*class="[^"]*)"', ('$1 cbse-visual-card"'), 1) }
    return $block
  })
}

function Remove-ChapterCardDescriptions([string]$html) {
  return [regex]::Replace($html, '(?is)\s*<p\b[^>]*class="[^"]*sm-chapter-desc[^"]*"[^>]*>.*?</p>', '')
}

function Add-SubjectCards([string]$html) {
  $pattern = '(?s)<a\b(?=[^>]*class="[^"]*sm-subject-card[^\"]*")[^>]*>.*?</a>'
  return [regex]::Replace($html, $pattern, {
    param($match)
    $block = $match.Value
    if ($block -match 'data-art-id=') { return $block }
    $subjectKey = if ($block -match '/mathematics/') { 'math' } else { 'science' }
    $art = New-ArtMarkup ($subjectKey + '-hub') ''
    $block = [regex]::Replace($block, '^(<a\b[^>]*class="[^"]*)"', ('$1 cbse-visual-card cbse-subject-visual-card"'), 1)
    $opening = [regex]::Match($block, '^<a\b[^>]*>')
    if ($opening.Success) { $block = $block.Insert($opening.Length, "`n  " + $art) }
    return $block
  })
}

function Save-Page([string]$path, [string]$html) {
  if (Test-Path -LiteralPath $path) {
    $html = Refresh-ArtMarkup $html
    [System.IO.File]::WriteAllText($path, $html, [System.Text.UTF8Encoding]::new($false))
  }
}

$classPage = Join-Path $smDir 'class-10/index.html'
if (Test-Path $classPage) {
  $html = [System.IO.File]::ReadAllText($classPage)
  $html = Add-VisualAssets $html 'class-home' '' ''
  $html = Add-HeroBrand $html
  $html = Add-SubjectCards $html
  Save-Page $classPage $html
}

foreach ($subject in $class10.subjects) {
  $subjectKey = if ($subject.slug -eq 'mathematics') { 'math' } else { 'science' }
  $subjectPage = Join-Path $smDir ('class-10/' + $subject.slug + '/index.html')
  if (Test-Path $subjectPage) {
    $html = [System.IO.File]::ReadAllText($subjectPage)
    $html = Add-VisualAssets $html 'subject' $subjectKey ''
    $html = Add-HeroBrand $html
    if ($html -notmatch ('data-art-id="' + $subjectKey + '-hub"')) {
      $html = $html.Replace('<section class="sm-hero sm-hero-slim">', ('<section class="sm-hero sm-hero-slim">' + "`n      " + (New-ArtMarkup ($subjectKey + '-hub') 'cbse-chapter-art--hero cbse-hero-art')))
    }
    $html = Add-SubjectChapterCards $html $subject $subjectKey
    $html = Remove-ChapterCardDescriptions $html
    Save-Page $subjectPage $html
  }

  for ($i = 0; $i -lt $subject.chapters.Count; $i++) {
    $chapter = $subject.chapters[$i]
    $chapterPage = Join-Path $smDir ('class-10/' + $subject.slug + '/' + $chapter.slug + '/index.html')
    if (-not (Test-Path $chapterPage)) { continue }
    $number = $i + 1
    $artId = $subjectKey + '-' + $number.ToString('00')
    $html = [System.IO.File]::ReadAllText($chapterPage)
    $html = Add-VisualAssets $html 'chapter' $subjectKey $number.ToString('00')
    $html = Add-HeroBrand $html
    if ($html -notmatch 'cbse-hero-art') {
      $html = [regex]::Replace($html, '(<section\b[^>]*class="[^"]*sm-hero[^>]*>)', ('$1' + "`n      " + (New-ArtMarkup $artId 'cbse-chapter-art--hero cbse-hero-art')), 1)
    }
    Save-Page $chapterPage $html
  }
}

Write-Host 'Applied chapter images and card styling to Class 10 Mathematics and Science.'
