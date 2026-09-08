# =====================================================================
# VYASA ACADEMY - BLOG GENERATOR
# Builds static blog pages from blog-content.ps1:
#   /blog/index.html                 (listing + search)
#   /blog/<category>/index.html      (8 category archives)
#   /blog/<article>/index.html       (article pages)
# Run:  powershell -NoProfile -ExecutionPolicy Bypass -File .\generate-blog.ps1
# All files written as UTF-8 (no BOM), LF line endings.
# =====================================================================

$base = $PSScriptRoot
. (Join-Path $base "blog-content.ps1")

$nl = "`n"
$domain = "https://www.vyasaacademy.in"
$ogImage = "$domain/images/classroom.png"

function Set-ContentUtf8 {
  param([string]$Path, [string]$Value)
  [System.IO.File]::WriteAllText($Path, $Value, [System.Text.UTF8Encoding]::new($false))
}

$dispMonths = @('Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec')

function Get-DispDate([string]$iso) {
  $p = $iso.Split('-')
  return ("{0} {1} {2}" -f [int]$p[2], $dispMonths[[int]$p[1] - 1], $p[0])
}

function Get-WordCount($article) {
  $wc = 0
  foreach ($b in $article.body) {
    if ($b.t -eq 'p')  { $wc += ($b.s -join ' ' -split '\s+').Count }
    if ($b.t -eq 'ul' -or $b.t -eq 'ol') { foreach ($it in $b.i) { $wc += ($it -split '\s+').Count } }
  }
  return $wc
}

function Get-ReadMins($article) {
  $m = [Math]::Round((Get-WordCount $article) / 200)
  if ($m -lt 1) { $m = 1 }
  return $m
}

# ----- lookup maps -----
$catMap = @{}
$catDesc = @{}
foreach ($c in $blogCategories) { $catMap[$c.slug] = $c.name; $catDesc[$c.slug] = $c.desc }
$artMap = @{}
$artiMap = @{}
foreach ($a in $blogArticles) {
  $artMap[$a.slug] = $a
  if (-not $artiMap.ContainsKey($a.cat)) { $artiMap[$a.cat] = @() }
  $artiMap[$a.cat] += $a
}
$authMap = @{}
foreach ($au in $blogAuthors) { $authMap[$au.key] = $au }

# ----- shared shell pieces -----

function New-Ld($obj) {
  return ($obj | ConvertTo-Json -Depth 30 -Compress)
}

function Get-NavHtml {
  return @'
<header class="navbar" id="navbar">
  <div class="container nav-container">
    <a href="/" class="logo"><i class="fas fa-graduation-cap"></i> Vyasa Academy</a>
    <nav class="nav-links" id="navLinks">
      <a href="/">Home</a>
      <a href="/#courses">Courses</a>
      <a href="/#admissions">Admissions</a>
      <a href="/blog/" class="active">Blog</a>
      <a href="/#contact">Contact</a>
    </nav>
    <button class="hamburger" id="hamburger" aria-label="Toggle navigation"><span></span><span></span><span></span></button>
  </div>
</header>
'@
}

function Get-FooterHtml {
  return @'
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
        <li><a href="/#faculty">Faculty</a></li>
        <li><a href="/#courses">Courses</a></li>
        <li><a href="/#admissions">Admissions</a></li>
        <li><a href="/blog/">Blog</a></li>
        <li><a href="/#papers">Practice Papers</a></li>
        <li><a href="/#career">Careers</a></li>
        <li><a href="/#contact">Contact</a></li>
      </ul>
    </div>
    <div class="footer-links">
      <h4>Popular Searches</h4>
      <ul>
        <li><a href="/best-tuition-centre-hulimavu/">Best Tuition Centre in Hulimavu</a></li>
        <li><a href="/best-coaching-centre-hulimavu/">Best Coaching Centre in Hulimavu</a></li>
        <li><a href="/cbse-tuition-hulimavu/">CBSE Tuition in Hulimavu</a></li>
        <li><a href="/maths-tuition-hulimavu/">Maths Tuition in Hulimavu</a></li>
        <li><a href="/science-tuition-hulimavu/">Science Tuition in Hulimavu</a></li>
        <li><a href="/kcet-coaching-hulimavu/">KCET Coaching in Hulimavu</a></li>
        <li><a href="/class-10-tuition-hulimavu/">Class 10 Tuition Hulimavu</a></li>
        <li><a href="/icse-tuition-hulimavu/">ICSE Tuition Hulimavu</a></li>
        <li><a href="/tuition-classes-near-bannerghatta-road/">Tuition near Bannerghatta Road</a></li>
        <li><a href="/cbse-tuition-bangalore/">CBSE Tuition Bangalore</a></li>
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
}

$navHtml = Get-NavHtml
$footerHtml = Get-FooterHtml

function Build-Head($title,$desc,$url,$pageType,$ldBlocks) {
  $titleHtml = $title -replace '&', '&amp;'
  $descHtml = $desc -replace '&', '&amp;'
  $s = "<!DOCTYPE html>$nl<html lang=""en"">$nl<head>$nl  <meta charset=""UTF-8"" />$nl  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />"
  $s += "$nl<title>$titleHtml</title>$nl  <meta name=""description"" content=""$descHtml"" />$nl  <link rel=""canonical"" href=""$url"" />"
  $s += "$nl  <meta property=""og:type"" content=""$pageType"" />$nl  <meta property=""og:site_name"" content=""Vyasa Academy"" />$nl  <meta property=""og:title"" content=""$titleHtml"" />$nl  <meta property=""og:description"" content=""$descHtml"" />$nl  <meta property=""og:url"" content=""$url"" />$nl  <meta property=""og:image"" content=""$ogImage"" />$nl  <meta property=""og:locale"" content=""en_IN"" />"
  $s += "$nl  <meta name=""twitter:card"" content=""summary_large_image"" />$nl  <meta name=""twitter:title"" content=""$titleHtml"" />$nl  <meta name=""twitter:description"" content=""$descHtml"" />$nl  <meta name=""twitter:image"" content=""$ogImage"" />"
  $s += "$nl  <link rel=""stylesheet"" href=""/styles.css"" />$nl  <link rel=""preconnect"" href=""https://fonts.googleapis.com"" />$nl  <link href=""https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap"" rel=""stylesheet"" />$nl  <link rel=""stylesheet"" href=""https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"" />"
  foreach ($j in $ldBlocks) {
    $s += "$nl  <script type=""application/ld+json"">$nl$j$nl  </script>"
  }
  $s += "$nl</head>"
  return $s
}

function Get-CrumbsBar($items) {
  $inner = @()
  foreach ($it in $items) { $inner += "<a href=""$($it.url)"">$($it.name)</a>" }
  return "<nav class=""blog-crumbs"" aria-label=""Breadcrumb"">$($inner -join ' / ')</nav>"
}

function Get-BreadcrumbLd($items) {
  $list = @()
  $pos = 1
  foreach ($it in $items) {
    $list += @{ '@type' = 'ListItem'; 'position' = $pos; 'name' = $it.name; 'item' = $it.url }
    $pos++
  }
  return New-Ld @{
    '@context' = 'https://schema.org'
    '@type' = 'BreadcrumbList'
    'itemListElement' = $list
  }
}

# ----- article building blocks -----

function Get-BlockHtml($b, $idx) {
  switch ($b.t) {
    'h2' { return "<h2 id=""sec-$idx"">$($b.s)</h2>" }
    'h3' { return "<h3 id=""sec-$idx"">$($b.s)</h3>" }
    'p'  { return "<p>$($b.s -join ' ')</p>" }
    'ul' { $li = ($b.i | ForEach-Object { "<li>$_</li>" }) -join "$nl" ; return "<ul>$nl$li$nl</ul>" }
    'ol' { $li = ($b.i | ForEach-Object { "<li>$_</li>" }) -join "$nl" ; return "<ol>$nl$li$nl</ol>" }
  }
  return ''
}

function Get-TocHtml($body) {
  $toc = @()
  $i = 0
  foreach ($b in $body) {
    if ($b.t -eq 'h2' -or $b.t -eq 'h3') {
      $toc += "<li><a href=""#sec-$i"" class=""toc-$($b.t)"">$($b.s)</a></li>"
    }
    $i++
  }
  if ($toc.Count -lt 3) { return '' }
  return "<nav class=""blog-toc"" aria-label=""Table of contents""><h2>On this page</h2><ul>$nl$($toc -join $nl)$nl</ul></nav>"
}

function Get-CardHtml($a) {
  $catName = $catMap[$a.cat]
  $au = $authMap[$a.author]
  $read = Get-ReadMins $a
  $date = Get-DispDate $a.pub
  $search = (($a.title + ' ' + $a.excerpt + ' ' + $catName).ToLower())
  return @"
<article class="blog-card" data-search="$search">
  <a href="/blog/$($a.slug)/">
    <div class="blog-card-top">
      <span class="blog-cat">$catName</span>
      <span class="blog-date">$date</span>
    </div>
    <h2>$($a.title)</h2>
    <p>$($a.excerpt)</p>
    <div class="blog-card-meta">
      <span><i class="fas fa-user-graduate"></i> $($au.name)</span>
      <span><i class="far fa-clock"></i> $read min read</span>
    </div>
  </a>
</article>
"@
}

function Get-CtaHtml($a) {
  $intro = 'At our tuition centre in Hulimavu, Bangalore, we teach CBSE and ICSE students in small batches with individual attention, regular mock tests and doubt clearing for Classes VI-XII.'
  if ($a.cta) { $intro = $a.cta }
  $buttons = @()
  foreach ($c in $a.courses) {
    $buttons += "<a href=""$($c.url)"" class=""btn btn-primary"">$($c.label)</a>"
  }
  $buttons += '<a href="https://wa.me/919494901006" target="_blank" rel="noopener" class="btn btn-secondary"><i class="fab fa-whatsapp"></i> WhatsApp Us</a>'
  return "<section class=""blog-cta"">$nl  <h2>Get these concepts explained properly</h2>$nl  <p>$intro</p>$nl  <div class=""blog-cta-buttons"">$nl    $($buttons -join "$nl    ")$nl  </div>$nl</section>"
}

function Get-SharingHtml($a) {
  $title = [uri]::EscapeDataString($a.title + ' | Vyasa Academy Blog')
  $u = [uri]::EscapeDataString("$domain/blog/$($a.slug)/")
  return @"
<div class="blog-share">
  <span>Share this article</span>
  <a href="https://wa.me/?text=$title%20$u" target="_blank" rel="noopener" aria-label="Share on WhatsApp"><i class="fab fa-whatsapp"></i></a>
  <a href="https://twitter.com/intent/tweet?url=$u&text=$title" target="_blank" rel="noopener" aria-label="Share on X"><i class="fab fa-x-twitter"></i></a>
  <a href="https://www.facebook.com/sharer/sharer.php?u=$u" target="_blank" rel="noopener" aria-label="Share on Facebook"><i class="fab fa-facebook-f"></i></a>
  <a href="https://www.linkedin.com/sharing/share-offsite/?url=$u" target="_blank" rel="noopener" aria-label="Share on LinkedIn"><i class="fab fa-linkedin-in"></i></a>
</div>
"@
}

function Get-AuthorBox($a) {
  $au = $authMap[$a.author]
  $avatar = "https://ui-avatars.com/api/?name=" + $au.name.Replace(' ','+') + "&amp;background=1a237e&amp;color=fff&amp;size=64"
  return "<aside class=""blog-author-box"">$nl  <img src=""$avatar"" alt=""$($au.name), author at Vyasa Academy"" width=""64"" height=""64"" loading=""lazy"" />$nl  <div>$nl    <h2>Written by $($au.name)</h2>$nl    <p class=""blog-author-role"">$($au.jobTitle)</p>$nl    <p class=""blog-author-bio"">$($au.bio)</p>$nl  </div>$nl</aside>"
}

function Get-ArticleLd($a) {
  $au = $authMap[$a.author]
  $url = "$domain/blog/$($a.slug)/"
  return New-Ld @{
    '@context' = 'https://schema.org'
    '@type' = 'BlogPosting'
    'mainEntityOfPage' = @{ '@type' = 'WebPage'; '@id' = $url }
    'headline' = $a.title
    'description' = $a.excerpt
    'image' = @{ '@type' = 'ImageObject'; 'url' = $ogImage }
    'datePublished' = $a.pub
    'dateModified' = $a.upd
    'inLanguage' = 'en-IN'
    'wordCount' = (Get-WordCount $a)
    'keywords' = ($a.keywords -join ', ')
    'articleSection' = $catMap[$a.cat]
    'author' = @{
      '@type' = 'Person'
      'name' = $au.name
      'jobTitle' = $au.jobTitle
      'url' = if ($au.url) { $au.url } else { "$domain/#person-$(if ($au.key -eq 'mahendra'){ 'mahendra' } else { 'venu' })" }
    }
    'publisher' = @{
      '@type' = 'EducationalOrganization'
      'name' = 'Vyasa Academy'
      'url' = $domain
      'logo' = @{ '@type' = 'ImageObject'; 'url' = $ogImage }
    }
  }
}

# ================= BUILD ARTICLE PAGES =================
foreach ($a in $blogArticles) {
  $catName = $catMap[$a.cat]
  $au = $authMap[$a.author]
  $dir = Join-Path $base ("blog/" + $a.slug)
  New-Item -ItemType Directory -Path $dir -Force | Out-Null

  $url = "$domain/blog/$($a.slug)/"
  $read = Get-ReadMins $a
  $pubDisp = Get-DispDate $a.pub
  $updDisp = Get-DispDate $a.upd

  $crumbItems = @(
    @{ name = 'Home'; url = "$domain/" },
    @{ name = 'Blog'; url = "$domain/blog/" },
    @{ name = $catName; url = "$domain/blog/$($a.cat)/" },
    @{ name = $a.title; url = $url }
  )

  $head = Build-Head $a.title $a.excerpt $url "article" @((Get-ArticleLd $a), (Get-BreadcrumbLd $crumbItems))

  # render body blocks
  $bodyHtml = @()
  $i = 0
  foreach ($b in $a.body) { $bodyHtml += Get-BlockHtml $b $i; $i++ }

  $relatedHtml = @()
  foreach ($rs in $a.related) {
    if ($artMap.ContainsKey($rs)) { $relatedHtml += Get-CardHtml $artMap[$rs] }
  }

  $metaLine = "By <a href=""/#about"">$($au.name)</a> | $pubDisp | $read min read"
  if ($a.upd -ne $a.pub) { $metaLine += " | Updated $updDisp" }

  $main = "<main class=""blog-page"">$nl  <div class=""container blog-container"">$nl    $(Get-CrumbsBar $crumbItems)$nl    <article class=""blog-article"">$nl      <header class=""blog-article-header"">$nl        <a class=""blog-cat-badge"" href=""/blog/$($a.cat)/"">$catName</a>$nl        <h1>$($a.title)</h1>$nl        <p class=""blog-article-meta"">$metaLine</p>$nl      </header>$nl      $(Get-TocHtml $a.body)$nl      <div class=""blog-content"">$nl$($bodyHtml -join "$nl$nl")$nl      </div>$nl      $(Get-SharingHtml $a)$nl      $(Get-AuthorBox $a)$nl      $(Get-CtaHtml $a)"
  if ($relatedHtml.Count -gt 0) {
    $main += "$nl      <section class=""blog-related"">$nl        <h2>Related reading</h2>$nl        <div class=""blog-grid"">$nl$($relatedHtml -join "$nl")$nl        </div>$nl      </section>"
  }
  $main += "$nl      <a class=""blog-back"" href=""/blog/"">All articles</a>$nl    </article>$nl  </div>$nl</main>"

  $page = "$head$nl<body>$nl$navHtml$nl$main$nl$footerHtml$nl<script src=""/blog.js""></script>$nl</body>$nl</html>"
  Set-ContentUtf8 -Path (Join-Path $dir "index.html") -Value $page
  Write-Host "Generated blog/$($a.slug)/index.html"
}

# ================= BUILD CATEGORY PAGES =================
foreach ($c in $blogCategories) {
  $dir = Join-Path $base ("blog/" + $c.slug)
  New-Item -ItemType Directory -Path $dir -Force | Out-Null
  $url = "$domain/blog/$($c.slug)/"
  $title = "$($c.name) | Vyasa Academy Blog"
  $desc = $c.desc

  $crumbItems = @(
    @{ name = 'Home'; url = "$domain/" },
    @{ name = 'Blog'; url = "$domain/blog/" },
    @{ name = $c.name; url = $url }
  )
  $id = New-Ld @{ '@context' = 'https://schema.org'; '@type' = 'CollectionPage'; 'name' = $title; 'url' = $url; 'inLanguage' = 'en-IN' }
  $head = Build-Head $title $desc $url "website" @($id, (Get-BreadcrumbLd $crumbItems))

  $cards = @()
  $arts = @($artiMap[$c.slug] | Sort-Object pub -Descending)
  foreach ($a in $arts) { $cards += Get-CardHtml $a }
  $grid = ($cards -join "$nl")

  $main = "<main class=""blog-page"">$nl  <div class=""container blog-container"">$nl    $(Get-CrumbsBar $crumbItems)$nl    <section class=""blog-hero blog-hero-slim"">$nl      <h1>$($c.name)</h1>$nl      <p>$($c.short)</p>$nl      <a class=""blog-back blog-back-inline"" href=""/blog/"">All articles</a>$nl    </section>$nl    <div class=""blog-grid"">$nl$grid$nl    </div>$nl  </div>$nl</main>"

  $page = "$head$nl<body>$nl$navHtml$nl$main$nl$footerHtml$nl<script src=""/blog.js""></script>$nl</body>$nl</html>"
  Set-ContentUtf8 -Path (Join-Path $dir "index.html") -Value $page
  Write-Host "Generated blog/$($c.slug)/index.html"
}

# ================= BUILD BLOG LISTING =================
$url = "$domain/blog/"
$title = "Exam Tips & Study Guides | Vyasa Academy Blog"
$desc = "Practical study tips, subject guides and board exam preparation advice for CBSE and ICSE students, written by the teachers at Vyasa Academy, Hulimavu, Bangalore."

$crumbItems = @(
  @{ name = 'Home'; url = "$domain/" },
  @{ name = 'Blog'; url = $url }
)

$blogPosts = @()
foreach ($a in ($blogArticles | Sort-Object pub -Descending)) {
  $blogPosts += @{
    '@type' = 'BlogPosting'
    'headline' = $a.title
    'url' = "$domain/blog/$($a.slug)/"
    'datePublished' = $a.pub
  }
}
$blogLd = New-Ld @{ '@context' = 'https://schema.org'; '@type' = 'Blog'; 'name' = 'Vyasa Academy Blog'; 'url' = $url; 'inLanguage' = 'en-IN'; 'blogPost' = $blogPosts }
$head = Build-Head $title $desc $url "website" @($blogLd, (Get-BreadcrumbLd $crumbItems))

$chips = @('<a href="/blog/" class="blog-chip is-active">All</a>')
foreach ($c in $blogCategories) { $chips += "<a href=""/blog/$($c.slug)/"" class=""blog-chip"">$($c.name)</a>" }

$cards = @()
foreach ($a in ($blogArticles | Sort-Object pub -Descending)) { $cards += Get-CardHtml $a }
$grid = ($cards -join "$nl")

$listing = "<main class=""blog-page"">$nl  <div class=""container blog-container"">$nl    $(Get-CrumbsBar $crumbItems)$nl    <section class=""blog-hero"">$nl      <p class=""blog-eyebrow"">Vyasa Academy Blog</p>$nl      <h1>Exam Tips, Subject Guides &amp; Study Strategies</h1>$nl      <p>Practical guidance for CBSE and ICSE students, written by the teachers at Vyasa Academy in Hulimavu, Bangalore. New articles added regularly.</p>$nl      <div class=""blog-search"">$nl        <i class=""fas fa-search""></i>$nl        <input type=""text"" id=""blogSearch"" placeholder=""Search articles by topic or keyword..."" aria-label=""Search articles"" />$nl      </div>$nl    </section>$nl    <nav class=""blog-chips"" aria-label=""Blog categories"">$nl$($chips -join "$nl")$nl    </nav>$nl    <div class=""blog-grid"" id=""blogGrid"">$nl$grid$nl    </div>$nl  </div>$nl</main>"

$dir = Join-Path $base "blog"
New-Item -ItemType Directory -Path $dir -Force | Out-Null
$page = "$head$nl<body>$nl$navHtml$nl$listing$nl$footerHtml$nl<script src=""/blog.js""></script>$nl</body>$nl</html>"
Set-ContentUtf8 -Path (Join-Path $dir "index.html") -Value $page
Write-Host "Generated blog/index.html"
Write-Host "Done."