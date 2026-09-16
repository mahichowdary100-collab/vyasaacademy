# =====================================================================
# VYASA ACADEMY - CBSE STUDY MATERIAL GENERATOR
# Data-driven static pages for /cbse-study-material/.
#   Source of truth : cbse-study-material/study-data.json
#   Generates       : main, class, subject, chapter and resource pages,
#                     plus indexable-urls.txt and study-tree.txt
# To add real chapters later: replace chapterCount with a `chapters`
# array (slug, label, title) inside study-data.json, re-run this script.
# Run:  powershell -NoProfile -ExecutionPolicy Bypass -File .\_build.ps1
# All files are written as UTF-8 (no BOM).
# =====================================================================

$ErrorActionPreference = 'Stop'

$smDir = $PSScriptRoot
$base  = Split-Path $PSScriptRoot -Parent

$data = Get-Content -LiteralPath (Join-Path $smDir 'study-data.json') -Raw -Encoding UTF8 | ConvertFrom-Json

$domain = 'https://www.vyasaacademy.in'
$nl = "`n"

function Set-ContentUtf8 {
  param([string]$Path, [string]$Value)
  [System.IO.File]::WriteAllText($Path, $Value, [System.Text.UTF8Encoding]::new($false))
}

function New-Ld($obj) {
  return ($obj | ConvertTo-Json -Depth 40 -Compress)
}

function Esc-Html([string]$s) {
  if ($null -eq $s) { return '' }
  return $s.Replace('&', '&amp;').Replace('<', '&lt;').Replace('>', '&gt;')
}

function Esc-Attr([string]$s) {
  return (Esc-Html $s).Replace('"', '&quot;')
}

# ----- shared shell pieces (mirrors blog generator) -----

$navHtml = @'
<header class="navbar" id="navbar">
  <div class="container nav-container">
    <a href="/" class="logo"><i class="fas fa-graduation-cap"></i> Vyasa Academy</a>
    <nav class="nav-links" id="navLinks">
      <a href="/">Home</a>
      <a href="/#courses">Courses</a>
      <a href="/#admissions">Admissions</a>
      <a href="/cbse-study-material/" class="active">Study Material</a>
      <a href="/blog/">Blog</a>
      <a href="/#contact">Contact</a>
    </nav>
    <button class="hamburger" id="hamburger" aria-label="Toggle navigation"><span></span><span></span><span></span></button>
  </div>
</header>
'@

$footerHtml = @'
<footer class="footer">
  <div class="container footer-content">
    <div class="footer-about">
      <h3><i class="fas fa-graduation-cap"></i> Vyasa Academy</h3>
      <p>Empowering students from Classes VI to XII with quality CBSE and ICSE tuition. Building foundations for a brighter tomorrow.</p>
    </div>
    <div class="footer-links">
      <h4>Quick Links</h4>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/#about">About</a></li>
        <li><a href="/#courses">Courses</a></li>
        <li><a href="/cbse-study-material/">Study Material</a></li>
        <li><a href="/blog/">Blog</a></li>
        <li><a href="/#papers">Practice Papers</a></li>
        <li><a href="/#contact">Contact</a></li>
      </ul>
    </div>
    <div class="footer-links">
      <h4>Popular Searches</h4>
      <ul>
        <li><a href="/cbse-study-material/">CBSE Study Material</a></li>
        <li><a href="/best-tuition-centre-hulimavu/">Best Tuition Centre in Hulimavu</a></li>
        <li><a href="/cbse-tuition-hulimavu/">CBSE Tuition in Hulimavu</a></li>
        <li><a href="/maths-tuition-hulimavu/">Maths Tuition in Hulimavu</a></li>
        <li><a href="/science-tuition-hulimavu/">Science Tuition in Hulimavu</a></li>
        <li><a href="/class-10-tuition-hulimavu/">Class 10 Tuition Hulimavu</a></li>
        <li><a href="/class-12-tuition-hulimavu/">Class 12 Tuition Hulimavu</a></li>
        <li><a href="/tuition-centre-bangalore/">Best Tuition Centre in Bangalore</a></li>
      </ul>
    </div>
    <div class="footer-social">
      <h4>Follow Us</h4>
      <div class="social-icons">
        <a href="https://www.facebook.com/chennupatimahendra/photos/" target="_blank" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
        <a href="https://www.instagram.com/vyasaacademy_/" target="_blank" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
        <a href="https://www.linkedin.com/company/vyasa-academy/" target="_blank" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
        <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
        <a href="https://wa.me/919494901006" target="_blank" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <p>&copy; 2026 Vyasa Academy. All rights reserved.</p>
  </div>
</footer>
'@

function Get-NavHtmlFor([bool]$active) { return $navHtml }

function Build-Head([string]$title, [string]$desc, [string]$url, [bool]$index, $ldBlocks) {
  $titleHtml = Esc-Html $title
  $descHtml  = Esc-Html $desc
  $robots = ''
  if (-not $index) { $robots = "$nl  <meta name=""robots"" content=""noindex, nofollow"" />" }
  $s = "<!DOCTYPE html>$nl<html lang=""en"">$nl<head>$nl  <meta charset=""UTF-8"" />$nl  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />"
  $s += "$nl<title>$titleHtml</title>$nl  <meta name=""description"" content=""$descHtml"" />$nl  <link rel=""canonical"" href=""$url"" />$robots"
  $s += "$nl  <meta property=""og:type"" content=""website"" />$nl  <meta property=""og:site_name"" content=""Vyasa Academy"" />$nl  <meta property=""og:title"" content=""$titleHtml"" />$nl  <meta property=""og:description"" content=""$descHtml"" />$nl  <meta property=""og:url"" content=""$url"" />$nl  <meta property=""og:image"" content=""$domain/images/classroom.png"" />$nl  <meta property=""og:locale"" content=""en_IN"" />"
  $s += "$nl  <meta name=""twitter:card"" content=""summary_large_image"" />$nl  <meta name=""twitter:title"" content=""$titleHtml"" />$nl  <meta name=""twitter:description"" content=""$descHtml"" />$nl  <meta name=""twitter:image"" content=""$domain/images/classroom.png"" />"
  $s += "$nl  <link rel=""stylesheet"" href=""/styles.css"" />$nl  <link rel=""preconnect"" href=""https://fonts.googleapis.com"" />$nl  <link href=""https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap"" rel=""stylesheet"" />$nl  <link rel=""stylesheet"" href=""https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"" />"
  foreach ($j in $ldBlocks) {
    $s += "$nl  <script type=""application/ld+json"">$nl$j$nl  </script>"
  }
  $s += "$nl</head>"
  return $s
}

function Get-SmCrumbs($items) {
  $inner = @()
  foreach ($it in $items) { $inner += "<a href=""$($it.url)"">$($it.name)</a>" }
  return "<nav class=""sm-crumbs"" aria-label=""Breadcrumb"">$($inner -join ' / ')</nav>"
}

function Get-BreadcrumbLd($items) {
  $list = @()
  $pos = 1
  foreach ($it in $items) {
    $list += @{ '@type' = 'ListItem'; 'position' = $pos; 'name' = $it.name; 'item' = $it.url }
    $pos++
  }
  return New-Ld @{ '@context' = 'https://schema.org'; '@type' = 'BreadcrumbList'; 'itemListElement' = $list }
}

function Get-ChapterList($subject) {
  $out = @()
  if ($subject.PSObject.Properties['chapters'] -and $subject.chapters.Count -gt 0) {
    foreach ($c in $subject.chapters) { $out += $c }
  } else {
    $n = [int]$subject.chapterCount
    for ($i = 1; $i -le $n; $i++) {
      $out += [pscustomobject]@{ slug = ('chapter-{0:D2}' -f $i); label = ('Chapter {0:D2}' -f $i); num = $i }
    }
  }
  return $out
}

function Get-RelatedHtml($related) {
  if (-not $related -or @($related).Count -eq 0) { return '' }
  $lis = @()
  foreach ($r in @($related)) {
    $lis += "<li><a href=""$($r.href)"">$($r.label)</a></li>"
  }
  return "<section class=""sm-related"">$nl  <h2>Related guides</h2>$nl  <ul>$nl    $($lis -join "$nl    ")$nl  </ul>$nl</section>"
}

function Get-ContentOverride([int]$classNum, [string]$subSlug, [string]$chSlug, [string]$resSlug) {
  $p = Join-Path $smDir "content\class-$classNum\$subSlug\$chSlug\$resSlug\index.html"
  if (Test-Path -LiteralPath $p) { return $p }
  return $null
}

$resourceList = $data.resources
$indexableUrls = @()
$treeLines = @()

function Add-TreeLine([int]$depth, [string]$text) {
  # simpler: collect indented lines
  $script:treeLines += (" " * ($depth * 2)) + $text
}

# ================= MAIN PAGE =================
$main = $data.main
$mainUrl = "$domain/cbse-study-material/"; $smRoot = "$domain/cbse-study-material"
push-location
$crumbMain = @(
  @{ name = 'Home'; url = "$domain/" },
  @{ name = 'CBSE Study Material'; url = $mainUrl }
)
$ldMain = @((Get-BreadcrumbLd $crumbMain))
$headMain = Build-Head $main.title $main.description $mainUrl $true $ldMain

$classCards = @()
foreach ($c in $data.classes) {
  $subLabels = @()
  foreach ($s in $c.subjects) { $subLabels += $s.label }
  $searchKey = "cbse class $($c.number) $($subLabels -join ' ') "
  $classCards += "<a class=""sm-card sm-class-card"" href=""/cbse-study-material/class-$($c.number)/"" data-search=""$searchKey"">$nl" +
    "  <span class=""sm-card-icon sm-class-num"">$($c.number)</span>$nl" +
    "  <div class=""sm-card-body"">$nl    <h3>CBSE Class $($c.number)</h3>$nl    <p>$($subLabels -join ' + ')</p>$nl    <span class=""sm-card-go"">Explore <i class=""fas fa-arrow-right""></i></span>$nl  </div>$nl</a>"
}
$relatedMain = Get-RelatedHtml $main.related

$mainBody = "<main class=""sm-page"">$nl  <div class=""container sm-container"">$nl    $(Get-SmCrumbs $crumbMain)$nl    <section class=""sm-hero"">$nl      <p class=""sm-eyebrow"">Vyasa Academy Study Material</p>$nl      <h1>CBSE Study Material - Classes 6 to 12</h1>$nl      <p>$($main.heroSub)</p>$nl      <div class=""sm-search"">$nl        <i class=""fas fa-search""></i>$nl        <input type=""text"" id=""smSearch"" placeholder=""Search by class, e.g. class 10..."" aria-label=""Search study material"" />$nl      </div>$nl    </section>$nl    <p class=""sm-empty"" id=""smEmpty"" hidden>No matching class found.</p>$nl    <div class=""sm-grid"" id=""smGrid"">$nl$($classCards -join "$nl$nl")$nl    </div>$nl    $relatedMain$nl  </div>$nl</main>"

$mainPage = "$headMain$nl<body>$nl$navHtml$nl$mainBody$nl$footerHtml$nl<script src=""/cbse-study-material/sm.js""></script>$nl</body>$nl</html>"
New-Item -ItemType Directory -Path (Join-Path $smDir '.') -Force | Out-Null
Set-ContentUtf8 -Path (Join-Path $smDir 'index.html') -Value $mainPage
Write-Host "Generated /cbse-study-material/index.html"
$indexableUrls += $mainUrl

Add-TreeLine 0 'CBSE Study Material'

# ================= CLASS / SUBJECT / CHAPTER / RESOURCE PAGES =================
foreach ($c in $data.classes) {
  Add-TreeLine 1 "Class $($c.number)"
  $classDir = Join-Path $smDir "class-$($c.number)"
  New-Item -ItemType Directory -Path $classDir -Force | Out-Null
  $classUrl = "$smRoot/class-$($c.number)/"
  $crumbClass = @(
    @{ name = 'Home'; url = "$domain/" },
    @{ name = 'CBSE Study Material'; url = $mainUrl },
    @{ name = "Class $($c.number)"; url = $classUrl }
  )
  $headClass = Build-Head $c.title $c.description $classUrl $true @((Get-BreadcrumbLd $crumbClass))

  $subCards = @()
  foreach ($s in $c.subjects) {
    $chCnt = @(Get-ChapterList $s).Count
    $subCards += "<a class=""sm-card sm-subject-card"" href=""/cbse-study-material/class-$($c.number)/$($s.slug)/"">$nl" +
      "  <span class=""sm-card-icon""><i class=""fas $($s.icon)""></i></span>$nl" +
      "  <div class=""sm-card-body"">$nl    <h3>$($s.label)</h3>$nl    <p>$chCnt chapters</p>$nl    <span class=""sm-card-go"">Open subject <i class=""fas fa-arrow-right""></i></span>$nl  </div>$nl</a>"
  }

  $classBody = "<main class=""sm-page"">$nl  <div class=""container sm-container"">$nl    $(Get-SmCrumbs $crumbClass)$nl    <section class=""sm-hero sm-hero-slim"">$nl      <p class=""sm-eyebrow"">CBSE Study Material</p>$nl      <h1>CBSE Class $($c.number)</h1>$nl      <p>$($c.heroSub)</p>$nl    </section>$nl    <div class=""sm-grid sm-grid-2"" id=""smGrid"">$nl$($subCards -join "$nl$nl")$nl    </div>$nl    <a class=""sm-back"" href=""/cbse-study-material/""><i class=""fas fa-arrow-left""></i> All classes</a>$nl  </div>$nl</main>"
  $classPage = "$headClass$nl<body>$nl$navHtml$nl$classBody$nl$footerHtml$nl<script src=""/cbse-study-material/sm.js""></script>$nl</body>$nl</html>"
  Set-ContentUtf8 -Path (Join-Path $classDir 'index.html') -Value $classPage
  Write-Host "Generated /cbse-study-material/class-$($c.number)/index.html"
  $indexableUrls += $classUrl

  foreach ($s in $c.subjects) {
    Add-TreeLine 2 $s.label
    $subDir = Join-Path $classDir $s.slug
    New-Item -ItemType Directory -Path $subDir -Force | Out-Null
    $subUrl = "$classUrl$($s.slug)/"
    $crumbSub = @(
      @{ name = 'Home'; url = "$domain/" },
      @{ name = 'CBSE Study Material'; url = $mainUrl },
      @{ name = "Class $($c.number)"; url = $classUrl },
      @{ name = $s.label; url = $subUrl }
    )
    $headSub = Build-Head $s.title $s.description $subUrl $true @((Get-BreadcrumbLd $crumbSub))

    $chapters = @(Get-ChapterList $s)
    $chCards = @()
    foreach ($ch in $chapters) {
      $chSearchKey = "cbse class $($c.number) $($s.label) $($ch.label) "
      $chCardClass = "sm-card sm-chapter-card"
      $chMedia = "<span class=""sm-card-icon""><i class=""fas fa-book""></i></span>"
      if ($ch.PSObject.Properties['image'] -and $ch.image) {
        $chCardClass += " sm-chapter-card-has-img"
        $chImage = "/images/$($ch.image).svg"
        $chMedia = "<img class=""sm-chapter-img"" src=""$chImage"" alt=""$($ch.label) - CBSE Class $($c.number) $($s.label)"" loading=""lazy"" />"
      }
      $chCards += "<a class=""$chCardClass"" href=""/cbse-study-material/class-$($c.number)/$($s.slug)/$($ch.slug)/"" data-search=""$chSearchKey"">$nl" +
        "  $chMedia$nl" +
        "  <div class=""sm-card-body"">$nl    <h3>$($ch.label)</h3>$nl    <p>CBSE Class $($c.number) &middot; $($s.label)</p>$nl    <div class=""sm-chip-row"">$nl      <span class=""sm-chip"">Notes</span><span class=""sm-chip"">Paper</span><span class=""sm-chip"">Quiz</span><span class=""sm-chip"">Test</span>$nl    </div>$nl  </div>$nl</a>"
    }

    $relatedSub = Get-RelatedHtml $s.related
    $subBody = "<main class=""sm-page"">$nl  <div class=""container sm-container"">$nl    $(Get-SmCrumbs $crumbSub)$nl    <section class=""sm-hero sm-hero-slim"">$nl      <p class=""sm-eyebrow"">CBSE Class $($c.number)</p>$nl      <h1>$($s.label)</h1>$nl      <p>$($s.heroSub)</p>$nl      <div class=""sm-search"">$nl        <i class=""fas fa-search""></i>$nl        <input type=""text"" id=""smSearch"" placeholder=""Search chapters..."" aria-label=""Search chapters"" />$nl      </div>$nl    </section>$nl    <p class=""sm-empty"" id=""smEmpty"" hidden>No matching chapter found.</p>$nl    <div class=""sm-grid"" id=""smGrid"">$nl$($chCards -join "$nl$nl")$nl    </div>$nl    $relatedSub$nl    <a class=""sm-back"" href=""/cbse-study-material/class-$($c.number)/""><i class=""fas fa-arrow-left""></i> Back to Class $($c.number)</a>$nl  </div>$nl</main>"
    $subPage = "$headSub$nl<body>$nl$navHtml$nl$subBody$nl$footerHtml$nl<script src=""/cbse-study-material/sm.js""></script>$nl</body>$nl</html>"
    Set-ContentUtf8 -Path (Join-Path $subDir 'index.html') -Value $subPage
    Write-Host "Generated /cbse-study-material/class-$($c.number)/$($s.slug)/index.html"
    $indexableUrls += $subUrl

    foreach ($ch in $chapters) {
      Add-TreeLine 3 $ch.label
      $chDir = Join-Path $subDir $ch.slug
      New-Item -ItemType Directory -Path $chDir -Force | Out-Null
      $chUrl = "$subUrl$($ch.slug)/"
      $chTitle = "$($ch.label) | CBSE Class $($c.number) $($s.label) | Vyasa Academy"
      $chDesc = "$($ch.label) resources - notes, practice paper, quiz and chapter test for CBSE Class $($c.number) $($s.label) at Vyasa Academy."
      $crumbCh = @(
        @{ name = 'Home'; url = "$domain/" },
        @{ name = 'CBSE Study Material'; url = $mainUrl },
        @{ name = "Class $($c.number)"; url = $classUrl },
        @{ name = $s.label; url = $subUrl },
        @{ name = $ch.label; url = $chUrl }
      )
      $chOverridePath = Join-Path $smDir "content\class-$($c.number)\$($s.slug)\$($ch.slug)\index.html"
      if (Test-Path -LiteralPath $chOverridePath) {
        $chPage = Get-Content -LiteralPath $chOverridePath -Raw -Encoding UTF8
        $indexableUrls += $chUrl
        Write-Host "Generated /cbse-study-material/class-$($c.number)/$($s.slug)/$($ch.slug)/index.html (chapter landing override)"
      } else {
      $headCh = Build-Head $chTitle $chDesc $chUrl $false @((Get-BreadcrumbLd $crumbCh))

      $resCards = @()
      foreach ($r in $resourceList) {
        $overridePath = Get-ContentOverride $c.number $s.slug $ch.slug $r.slug
        $pendingChip = if ($overridePath) {
          "<span class=""sm-card-go"">View <i class=""fas fa-arrow-right""></i></span>"
        } else {
          "<span class=""sm-coming-chip""><i class=""fas fa-hourglass-half""></i> Coming soon</span>"
        }
        $resCards += "<a class=""sm-card sm-resource-card sm-res-$($r.slug)"" href=""$($r.slug)/"">$nl" +
          "  <span class=""sm-card-icon""><i class=""fas $($r.icon)""></i></span>$nl" +
          "  <div class=""sm-card-body"">$nl    <h3>$($r.label)</h3>$nl    <p>$($r.blurb)</p>$nl    $pendingChip$nl  </div>$nl</a>"
      }

      $chBody = "<main class=""sm-page"">$nl  <div class=""container sm-container"">$nl    $(Get-SmCrumbs $crumbCh)$nl    <section class=""sm-hero sm-hero-slim"">$nl      <p class=""sm-eyebrow"">CBSE Class $($c.number) &middot; $($s.label)</p>$nl      <h1>$($ch.label)</h1>$nl      <p>Choose a resource for this chapter. Notes, practice paper, quiz and chapter test will be published here shortly.</p>$nl    </section>$nl    <div class=""sm-grid sm-grid-2 sm-grid-4"" id=""smGrid"">$nl$($resCards -join "$nl$nl")$nl    </div>$nl    <a class=""sm-back"" href=""/cbse-study-material/class-$($c.number)/$($s.slug)/""><i class=""fas fa-arrow-left""></i> All $($s.label) chapters</a>$nl  </div>$nl</main>"
      $chPage = "$headCh$nl<body>$nl$navHtml$nl$chBody$nl$footerHtml$nl<script src=""/cbse-study-material/sm.js""></script>$nl</body>$nl</html>"
      Write-Host "Generated /cbse-study-material/class-$($c.number)/$($s.slug)/$($ch.slug)/index.html"
      }
      Set-ContentUtf8 -Path (Join-Path $chDir 'index.html') -Value $chPage

      foreach ($r in $resourceList) {
        Add-TreeLine 4 $r.label
        $resDir = Join-Path $chDir $r.slug
        New-Item -ItemType Directory -Path $resDir -Force | Out-Null
        $resUrl = "$chUrl$($r.slug)/"
        $resTitle = "$($r.label) - $($ch.label) | CBSE Class $($c.number) $($s.label) | Vyasa Academy"
        $resDesc = "$($r.label) for $($ch.label) of CBSE Class $($c.number) $($s.label). Content is being prepared and will appear here shortly."
        $crumbRes = @(
          @{ name = 'Home'; url = "$domain/" },
          @{ name = 'CBSE Study Material'; url = $mainUrl },
          @{ name = "Class $($c.number)"; url = $classUrl },
          @{ name = $s.label; url = $subUrl },
          @{ name = $ch.label; url = $chUrl },
          @{ name = $r.label; url = $resUrl }
        )
        $headRes = Build-Head $resTitle $resDesc $resUrl $false @((Get-BreadcrumbLd $crumbRes))

        $chipLinks = @()
        foreach ($rr in $resourceList) {
          $activeClass = if ($rr.slug -eq $r.slug) { ' is-active' } else { '' }
          $chipLinks += "<a class=""sm-chip-link$activeClass"" href=""../$($rr.slug)/"">$($rr.label)</a>"
        }

        $resBody = "<main class=""sm-page"">$nl  <div class=""container sm-container"">$nl    $(Get-SmCrumbs $crumbRes)$nl    <section class=""sm-placeholder"">$nl      <span class=""sm-ph-icon""><i class=""fas $($r.icon)""></i></span>$nl      <h1>$($r.label)</h1>$nl      <p class=""sm-ph-sub"">CBSE Class $($c.number) $($s.label) &middot; $($ch.label)</p>$nl      <p class=""sm-ph-note""><i class=""fas fa-hourglass-half""></i> Content coming soon.</p>$nl      <div class=""sm-ph-actions"">$nl        <a class=""btn btn-secondary"" href=""../""><i class=""fas fa-arrow-left""></i> Back to $($ch.label)</a>$nl      </div>$nl    </section>$nl    <nav class=""sm-chips"" aria-label=""Chapter resources"">$nl$($chipLinks -join "$nl")$nl    </nav>$nl  </div>$nl</main>"
        $resPage = "$headRes$nl<body>$nl$navHtml$nl$resBody$nl$footerHtml$nl<script src=""/cbse-study-material/sm.js""></script>$nl</body>$nl</html>"
        $overridePath = Get-ContentOverride $c.number $s.slug $ch.slug $r.slug
        if ($overridePath) {
          $resPage = Get-Content -LiteralPath $overridePath -Raw -Encoding UTF8
          $indexableUrls += $resUrl
          Write-Host "Generated .../$($ch.slug)/$($r.slug)/index.html (content override)"
        } else {
          Write-Host "Generated /cbse-study-material/class-$($c.number)/$($s.slug)/$($ch.slug)/$($r.slug)/index.html"
        }
        Set-ContentUtf8 -Path (Join-Path $resDir 'index.html') -Value $resPage
      }
    }
  }
}

# ================= ARTIFACTS =================
Set-ContentUtf8 -Path (Join-Path $smDir 'indexable-urls.txt') -Value (($indexableUrls | Sort-Object -Unique) -join $nl)
Set-ContentUtf8 -Path (Join-Path $smDir 'study-tree.txt') -Value ($treeLines -join $nl)

Write-Host ""
Write-Host "Done. Indexable URLs: $($indexableUrls.Count)"
