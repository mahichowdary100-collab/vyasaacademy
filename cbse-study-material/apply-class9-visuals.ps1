# Applies static chapter-art fallbacks and optional progressive animation to
# generated Class 9 pages. Run at the end of _build.ps1; safe to run repeatedly.
$ErrorActionPreference = 'Stop'
$smDir = $PSScriptRoot
$data = Get-Content -LiteralPath (Join-Path $smDir 'study-data.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$class9 = @($data.classes | Where-Object { [int]$_.number -eq 9 })[0]
if (-not $class9) { throw 'Class 9 was not found in study-data.json' }
$assetBase = '/cbse-study-material/class-9/'
$sprite = $assetBase + 'chapter-art.svg'
$cssPath = Join-Path $smDir 'class-9/chapter-visuals.css'
$scriptPath = Join-Path $smDir 'class-9/chapter-visuals.js'
if (-not (Test-Path $cssPath) -or -not (Test-Path $scriptPath) -or -not (Test-Path (Join-Path $smDir 'class-9/chapter-art.svg'))) {
  throw 'Class 9 chapter visual assets are missing.'
}

function Add-VisualAssets([string]$html, [string]$scope, [string]$subject, [string]$chapter) {
  $body = [regex]::Match($html, '<body\b[^>]*>')
  if (-not $body.Success) { return $html }
  $attrs = ' data-cbse-visual-scope="class-9" data-cbse-visual-page="' + $scope + '"'
  if ($subject) { $attrs += ' data-cbse-visual-subject="' + $subject + '"' }
  if ($chapter) { $attrs += ' data-cbse-visual-chapter="' + $chapter + '"' }
  $opening = $body.Value
  if ($opening -notmatch 'data-cbse-visual-scope=') {
    $html = $html.Substring(0, $body.Index) + $opening.Insert($opening.Length - 1, $attrs) + $html.Substring($body.Index + $opening.Length)
  }
  if ($html -notmatch [regex]::Escape('chapter-visuals.css')) {
    $css = '<link rel="stylesheet" href="/cbse-study-material/class-9/chapter-visuals.css?v=1" />'
    $html = [regex]::Replace($html, '(?m)(<link\s+rel="stylesheet"\s+href="/styles\.css"\s*/?>)', ('$1' + "`n  " + $css), 1)
  }
  if ($html -notmatch [regex]::Escape('chapter-visuals.js')) {
    $js = '<script src="/cbse-study-material/class-9/chapter-visuals.js?v=1" defer></script>'
    $html = $html.Replace('</body>', $js + "`n</body>")
  }
  return $html
}

function New-ArtMarkup([string]$artId, [string]$extraClass) {
  $class = 'cbse-chapter-art' + $(if ($extraClass) { ' ' + $extraClass } else { '' })
  $use = $script:sprite + '#' + $artId
  return '<div class="' + $class + '" data-art-id="' + $artId + '" aria-hidden="true"><svg viewBox="0 0 640 300" focusable="false"><use href="' + $use + '" xlink:href="' + $use + '"></use></svg></div>'
}

function Add-HeroBrand([string]$html) {
  $brand = '<p class="cbse-hero-brand">VYASA ACADEMY | LEARN | UNDERSTAND | EXCEL</p>'
  if ($html -match 'cbse-hero-brand') {
    return [regex]::Replace($html, '<p\b[^>]*class="[^"]*cbse-hero-brand[^"]*"[^>]*>.*?</p>', $brand, 1)
  }
  return [regex]::Replace($html, '(<section\b[^>]*class="[^"]*sm-hero[^>]*>)', ('$1' + "`n      " + $brand), 1)
}

function Add-SubjectChapterCards([string]$html, [string]$subjectKey) {
  $pattern = '(?s)<a\b(?=[^>]*class="[^"]*sm-chapter-card[^"]*")[^>]*>.*?</a>'
  return [regex]::Replace($html, $pattern, {
    param($match)
    $block = $match.Value
    $href = [regex]::Match($block, 'href="[^"]*/chapter-(\d+)/"')
    if (-not $href.Success) { return $block }
    $num = [int]$href.Groups[1].Value
    $artId = $subjectKey + '-' + $num.ToString('00')
    if ($block -match 'data-art-id=') { return $block }
    $art = New-ArtMarkup $artId ''
    $block = [regex]::Replace($block, '^(<a\b[^>]*class="[^"]*)"', ('$1 cbse-visual-card"'), 1)
    $opening = [regex]::Match($block, '^<a\b[^>]*>')
    if (-not $opening.Success) { return $block }
    return $block.Insert($opening.Length, "`n  " + $art)
  })
}

function Add-SubjectCards([string]$html) {
  $pattern = '(?s)<a\b(?=[^>]*class="[^"]*sm-subject-card[^"]*")[^>]*>.*?</a>'
  return [regex]::Replace($html, $pattern, {
    param($match)
    $block = $match.Value
    if ($block -match 'data-art-id=') { return $block }
    $subject = if ($block -match '/mathematics/') { 'math' } else { 'science' }
    $art = New-ArtMarkup ($subject + '-hub') ''
    $block = [regex]::Replace($block, '^(<a\b[^>]*class="[^"]*)"', ('$1 cbse-visual-card cbse-subject-visual-card"'), 1)
    $opening = [regex]::Match($block, '^<a\b[^>]*>')
    if ($opening.Success) { $block = $block.Insert($opening.Length, "`n  " + $art) }
    return $block
  })
}

function Save-Page([string]$path, [string]$html) {
  if (Test-Path -LiteralPath $path) { [System.IO.File]::WriteAllText($path, $html, [System.Text.UTF8Encoding]::new($false)) }
}

$classPage = Join-Path $smDir 'class-9/index.html'
if (Test-Path $classPage) {
  $html = [System.IO.File]::ReadAllText($classPage)
  $html = Add-VisualAssets $html 'class-home' '' ''
  $html = Add-HeroBrand $html
  $html = Add-SubjectCards $html
  Save-Page $classPage $html
}

foreach ($subject in $class9.subjects) {
  $subjectKey = if ($subject.slug -eq 'mathematics') { 'math' } else { 'science' }
  $subjectPage = Join-Path $smDir ("class-9/" + $subject.slug + '/index.html')
  if (Test-Path $subjectPage) {
    $html = [System.IO.File]::ReadAllText($subjectPage)
    $html = Add-VisualAssets $html 'subject' $subjectKey ''
    $html = Add-HeroBrand $html
    if ($html -notmatch ('data-art-id="' + $subjectKey + '-hub"')) {
      $html = $html.Replace('<section class="sm-hero sm-hero-slim">', ('<section class="sm-hero sm-hero-slim">' + "`n      " + (New-ArtMarkup ($subjectKey + '-hub') 'cbse-chapter-art--hero cbse-hero-art')))
    }
    $html = Add-SubjectChapterCards $html $subjectKey
    Save-Page $subjectPage $html
  }

  foreach ($chapter in $subject.chapters) {
    $num = [int]$chapter.number
    $slug = [string]$chapter.slug
    $chapterPage = Join-Path $smDir ("class-9/" + $subject.slug + '/' + $slug + '/index.html')
    if (-not (Test-Path $chapterPage)) { continue }
    $artId = $subjectKey + '-' + $num.ToString('00')
    $html = [System.IO.File]::ReadAllText($chapterPage)
    $html = Add-VisualAssets $html 'chapter' $subjectKey $num.ToString('00')
    $html = Add-HeroBrand $html
    if ($html -notmatch 'cbse-hero-art') {
      $art = New-ArtMarkup $artId 'cbse-chapter-art--hero cbse-hero-art'
      $html = [regex]::Replace($html, '(<section\b[^>]*class="[^"]*sm-hero[^>]*>)', ('$1' + "`n      " + $art), 1)
    }
    Save-Page $chapterPage $html
  }
}

Write-Host 'Applied static chapter art and optional animation to Class 9 pages.'
