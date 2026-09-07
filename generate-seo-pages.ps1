$base = $PSScriptRoot
$html = Get-Content (Join-Path $base "index.html") -Raw -Encoding UTF8

$pages = @(
  @{
    slug = "cbse-tuition-hulimavu"
    title = "CBSE Tuition in Hulimavu, Bangalore | Vyasa Academy"
    desc = "CBSE tuition in Hulimavu, Bangalore for Classes VI-XII. Expert maths and science coaching in small batches near Bilekahalli and MICO Layout. Enquire today."
    h1 = 'CBSE Tuition in <span class="highlight">Hulimavu</span>'
    hero = "Expert CBSE tuition for Classes VI to XII"
    sub = "Focused CBSE coaching at Vyasa Academy, Hulimavu - experienced faculty, small batches, and proven board results for students across Hulimavu, Bilekahalli, and MICO Layout."
    about = "Vyasa Academy is a trusted CBSE tuition centre in Hulimavu, Bangalore, providing affordable, high-quality coaching for Classes VI to XII. We specialise in CBSE maths and science, with KCET and Olympiad preparation built in."
  },
  @{
    slug = "icse-tuition-hulimavu"
    title = "ICSE Tuition in Hulimavu, Bangalore | Vyasa Academy"
    desc = "ICSE tuition in Hulimavu, Bangalore for Classes VI-XII. Experienced faculty, individual attention, and a strong foundation for board exams at Vyasa Academy."
    h1 = 'ICSE Tuition in <span class="highlight">Hulimavu</span>'
    hero = "Expert ICSE tuition for Classes VI to XII"
    sub = "Subject-wise ICSE coaching at Vyasa Academy, Hulimavu - experienced faculty and personal attention to help students excel in board exams and beyond."
    about = "Vyasa Academy is a dedicated ICSE tuition centre in Hulimavu, Bangalore, offering affordable, high-quality coaching for Classes VI to XII across maths and science subjects, with individual attention in small batches."
  },
  @{
    slug = "maths-tuition-hulimavu"
    title = "Maths Tuition in Hulimavu, Bangalore | Vyasa Academy"
    desc = "Maths tuition in Hulimavu, Bangalore for CBSE and ICSE Classes VI-XII. Led by Mahendra Babu Chennupati with 10+ years of experience and proven results."
    h1 = 'Maths Tuition in <span class="highlight">Hulimavu</span>'
    hero = "Strong maths foundations for CBSE and ICSE"
    sub = "Led by Mahendra Babu Chennupati with 10+ years of experience, our maths tuition in Hulimavu builds strong foundations and exam confidence for Classes VI to XII."
    about = "Vyasa Academy offers specialised maths tuition in Hulimavu, Bangalore, led by Mahendra Babu Chennupati with 10+ years of experience across CBSE, ICSE, KCET, and Olympiads - from Class VI to XII."
  },
  @{
    slug = "science-tuition-hulimavu"
    title = "Science Tuition in Hulimavu, Bangalore | Vyasa Academy"
    desc = "Science tuition in Hulimavu for CBSE and ICSE Classes VI-XII. Physics, Chemistry and Biology coaching with practical clarity and exam focus."
    h1 = 'Science Tuition in <span class="highlight">Hulimavu</span>'
    hero = "Physics, Chemistry and Biology coaching"
    sub = "Practical clarity, problem-solving, and exam-focused preparation for CBSE and ICSE students in Hulimavu, Bangalore - Classes VI to XII."
    about = "Vyasa Academy provides comprehensive science tuition in Hulimavu, Bangalore - physics, chemistry, and biology coaching for CBSE and ICSE students, with practical lab clarity and exam-focused preparation."
  },
  @{
    slug = "kcet-coaching-hulimavu"
    title = "KCET Coaching in Hulimavu, Bangalore | Vyasa Academy"
    desc = "KCET coaching in Hulimavu, Bangalore for PCM aspirants. Structured classes, practice papers, and mock tests with exam strategy at Vyasa Academy."
    h1 = 'KCET Coaching in <span class="highlight">Hulimavu</span>'
    hero = "Structured KCET preparation for aspiring engineers"
    sub = "PCM foundations, mock tests, and exam strategy built into a structured KCET coaching program at Vyasa Academy, Hulimavu."
    about = "Vyasa Academy offers focused KCET coaching in Hulimavu, Bangalore for aspiring engineers - strong PCM foundations, regular mock tests, and personalised exam strategy."
  },
  @{
    slug = "class-10-tuition-hulimavu"
    title = "Class 10 Tuition in Hulimavu, Bangalore | Vyasa Academy"
    desc = "Class 10 board exam tuition in Hulimavu for CBSE and ICSE. Maths and science coaching with mock tests, practice papers and doubt clearing at Vyasa Academy."
    h1 = 'Class 10 Tuition in <span class="highlight">Hulimavu</span>'
    hero = "Board exam preparation for CBSE and ICSE"
    sub = "Class 10 maths and science coaching in Hulimavu with mock tests, practice papers, and one-on-one doubt clearing at Vyasa Academy."
    about = "Vyasa Academy specialises in Class 10 tuition in Hulimavu, Bangalore - maths and science coaching for CBSE and ICSE with downloadable practice papers, mock tests, and individual doubt clearing."
  },
  @{
    slug = "class-12-tuition-hulimavu"
    title = "Class 12 Tuition in Hulimavu, Bangalore | Vyasa Academy"
    desc = "Class 12 tuition in Hulimavu for PU, CBSE and ICSE. Advanced maths and science coaching with structured exam strategy and KCET preparation."
    h1 = 'Class 12 Tuition in <span class="highlight">Hulimavu</span>'
    hero = "Advanced coaching for PU, CBSE and ICSE"
    sub = "Class 12 advanced maths and science coaching in Hulimavu with focused exam strategy and KCET preparation at Vyasa Academy."
    about = "Vyasa Academy provides Class 12 tuition in Hulimavu, Bangalore for PU, CBSE and ICSE students - advanced maths and science coaching with focused exam strategy and KCET preparation."
  },
  @{
    slug = "tuition-centre-bangalore"
    title = "Best Tuition Centre in Bangalore | Vyasa Academy"
    desc = "Best tuition centre in Bangalore for Classes VI-XII. CBSE and ICSE maths and science coaching, KCET and Olympiad prep in Hulimavu, Bangalore."
    h1 = 'Best Tuition Centre in <span class="highlight">Bangalore</span>'
    hero = "Premier tuition for CBSE and ICSE students"
    sub = "Recognised as one of the best tuition centres in Bangalore for Classes VI to XII - expert faculty, small batches, and a proven record of top scores at Vyasa Academy, Hulimavu."
    about = "Vyasa Academy is one of the best tuition centres in Bangalore, offering affordable, high-quality CBSE and ICSE coaching for Classes VI to XII. From mathematics and science to KCET and Olympiad preparation, we help students across Bangalore achieve academic excellence."
  },
  @{
    slug = "tuition-in-jp-nagar"
    title = "Tuition in JP Nagar, Bangalore | Vyasa Academy"
    desc = "Tuition classes in JP Nagar, Bangalore for CBSE and ICSE Classes VI-XII. Maths and science coaching with proven results near JP Nagar, Hulimavu."
    h1 = 'Tuition Classes in <span class="highlight">JP Nagar</span>'
    hero = "CBSE and ICSE coaching for JP Nagar students"
    sub = "Conveniently located near JP Nagar, Vyasa Academy offers expert maths and science tuition for Classes VI to XII - small batches and a proven track record in Bangalore."
    about = "Students from JP Nagar trust Vyasa Academy for high-quality CBSE and ICSE tuition in Bangalore. Located in Hulimavu near JP Nagar, we offer maths and science coaching for Classes VI to XII with small batches and personal attention."
  },
  @{
    slug = "tuition-in-bilekahalli"
    title = "Tuition in Bilekahalli, Bangalore | Vyasa Academy"
    desc = "Tuition classes in Bilekahalli, Bangalore for CBSE and ICSE Classes VI-XII. Expert maths and science coaching near Bilekahalli with proven board results."
    h1 = 'Tuition Classes in <span class="highlight">Bilekahalli</span>'
    hero = "CBSE and ICSE coaching for Bilekahalli students"
    sub = "Located in Hulimavu, right next to Bilekahalli, Vyasa Academy provides expert maths and science tuition for Classes VI to XII with a proven record of board toppers."
    about = "Vyasa Academy is a trusted tuition centre for CBSE and ICSE students from Bilekahalli and nearby areas in Bangalore. Maths and science coaching for Classes VI to XII, exam-focused preparation, and small class sizes."
  },
  @{
    slug = "tuition-in-mico-layout"
    title = "Tuition in MICO Layout, Bangalore | Vyasa Academy"
    desc = "Tuition classes in MICO Layout, Bangalore for CBSE and ICSE Classes VI-XII. Maths and science coaching near MICO Layout with proven academic results."
    h1 = 'Tuition Classes in <span class="highlight">MICO Layout</span>'
    hero = "CBSE and ICSE coaching for MICO Layout students"
    sub = "Families from MICO Layout trust Vyasa Academy for quality maths and science tuition in Bangalore - Classes VI to XII, competitive exam prep, and proven results."
    about = "Vyasa Academy offers CBSE and ICSE tuition for students from MICO Layout and surrounding areas in Bangalore. Conveniently located in Hulimavu, we provide maths and science coaching for Classes VI to XII with a strong record of academic success."
  },
  @{
    slug = "tuition-in-arekere"
    title = "Tuition in Arekere, Bangalore | Vyasa Academy"
    desc = "Tuition classes in Arekere, Bangalore for CBSE and ICSE Classes VI-XII. Maths and science coaching near Arekere with small batches. Visit Vyasa Academy."
    h1 = 'Tuition Classes in <span class="highlight">Arekere</span>'
    hero = "CBSE and ICSE coaching for Arekere students"
    sub = "Located close to Arekere, Vyasa Academy delivers expert maths and science tuition for Classes VI to XII in Bangalore - small batches, KCET and Olympiad preparation."
    about = "Students from Arekere choose Vyasa Academy for high-quality CBSE and ICSE tuition in Bangalore. Based in Hulimavu, we offer maths and science coaching for Classes VI to XII with individual attention and proven board results."
  },
  @{
    slug = "best-tuition-centre-hulimavu"
    title = "Best Tuition Centre in Hulimavu | Vyasa Academy"
    desc = "Best tuition centre in Hulimavu, Bangalore for Classes VI-XII. Expert CBSE and ICSE maths and science coaching in small batches with proven results."
    h1 = 'Best Tuition Centre in <span class="highlight">Hulimavu</span>'
    hero = "A tuition centre Hulimavu parents trust"
    sub = "Vyasa Academy is recognised as the best tuition centre in Hulimavu for Classes VI to XII - experienced faculty, small batches, and a proven record of top scores."
    about = "Vyasa Academy is the best tuition centre in Hulimavu, Bangalore for CBSE and ICSE students. We offer expert maths and science coaching for Classes VI to XII with small batches, KCET and Olympiad preparation, and a strong record of exam toppers."
  },
  @{
    slug = "best-coaching-centre-hulimavu"
    title = "Best Coaching Centre in Hulimavu | Vyasa Academy"
    desc = "Best coaching centre in Hulimavu, Bangalore. CBSE and ICSE coaching for Classes VI-XII with experienced faculty, small batches, and proven results."
    h1 = 'Best Coaching Centre in <span class="highlight">Hulimavu</span>'
    hero = "Coaching centre known for student success"
    sub = "One of the best coaching centres in Hulimavu for Classes VI to XII - disciplined approach, expert faculty, and consistent results in CBSE, ICSE and KCET."
    about = "Vyasa Academy has earned a reputation as the best coaching centre in Hulimavu, Bangalore. Our CBSE and ICSE coaching for Classes VI to XII blends experienced faculty, small batches, and personal attention for proven academic results."
  },
  @{
    slug = "tuition-classes-near-bannerghatta-road"
    title = "Tuition Classes near Bannerghatta Road | Vyasa Academy"
    desc = "Tuition classes near Bannerghatta Road, Bangalore for CBSE and ICSE Classes VI-XII. Maths and science coaching in Hulimavu, Bangalore. Book a visit."
    h1 = 'Tuition Classes near <span class="highlight">Bannerghatta Road</span>'
    hero = "Convenient CBSE and ICSE coaching off Bannerghatta Road"
    sub = "Located in Hulimavu just off Bannerghatta Road, Vyasa Academy offers expert maths and science tuition for Classes VI to XII with proven results."
    about = "Vyasa Academy is a leading tuition centre near Bannerghatta Road, Bangalore. Based in Hulimavu, we offer CBSE and ICSE maths and science coaching for Classes VI to XII, close to Bannerghatta Road and easy to reach for families in the area."
  },
  @{
    slug = "cbse-tuition-bangalore"
    title = "CBSE Tuition in Bangalore | Vyasa Academy"
    desc = "CBSE tuition in Bangalore for Classes VI-XII. Expert maths and science coaching, small batches, KCET and Olympiad prep in Hulimavu, Bangalore."
    h1 = 'CBSE Tuition in <span class="highlight">Bangalore</span>'
    hero = "Quality CBSE coaching for Bangalore students"
    sub = "Vyasa Academy offers expert CBSE tuition in Bangalore for Classes VI to XII - experienced faculty, small batches, and a proven record of top board scores."
    about = "Vyasa Academy provides trusted CBSE tuition in Bangalore for Classes VI to XII. Located in Hulimavu, we specialise in maths and science coaching with small batches, KCET and Olympiad preparation, and consistent academic results."
  }
)

function Set-ContentUtf8 {
  param([string]$Path, [string]$Value)
  [System.IO.File]::WriteAllText($Path, $Value, [System.Text.UTF8Encoding]::new($false))
}

$nl = "`n"

foreach ($p in $pages) {
  $dir = Join-Path $base $p.slug
  New-Item -ItemType Directory -Path $dir -Force | Out-Null
  $pageUrl = "https://www.vyasaacademy.in/$($p.slug)/"
  $pageTitle = $p.title
  $pageDesc = $p.desc

  $titleOld = '<title>Vyasa Academy | CBSE &amp; ICSE Tuitions for VI-XII</title>'
  $titleNew = "<title>$pageTitle</title>$nl  <meta name=`"description`" content=`"$pageDesc`" />$nl  <link rel=`"canonical`" href=`"$pageUrl`" />$nl  <meta property=`"og:type`" content=`"website`" />$nl  <meta property=`"og:site_name`" content=`"Vyasa Academy`" />$nl  <meta property=`"og:title`" content=`"$pageTitle`" />$nl  <meta property=`"og:description`" content=`"$pageDesc`" />$nl  <meta property=`"og:url`" content=`"$pageUrl`" />$nl  <meta property=`"og:image`" content=`"https://www.vyasaacademy.in/images/classroom.png`" />$nl  <meta property=`"og:locale`" content=`"en_IN`" />$nl  <meta name=`"twitter:card`" content=`"summary_large_image`" />$nl  <meta name=`"twitter:title`" content=`"$pageTitle`" />$nl  <meta name=`"twitter:description`" content=`"$pageDesc`" />$nl  <meta name=`"twitter:image`" content=`"https://www.vyasaacademy.in/images/classroom.png`" />"

  $crumbOld = '<script type="application/ld+json">' + $nl + '  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.vyasaacademy.in/"
      }
    ]
  }
  </script>'
  $crumbNew = '<script type="application/ld+json">' + $nl + '  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.vyasaacademy.in/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "' + $p.title.Replace(' | Vyasa Academy', '') + '",
        "item": "' + $pageUrl + '"
      }
    ]
  }
  </script>'

  $h1Old = '<h1>Welcome to <span class="highlight">Vyasa Academy</span></h1>'
  $h1New = "<h1>$($p.h1)</h1>"

  $heroOld = '<p>Excellence in CBSE &amp; ICSE tuitions for Classes VI to XII</p>'
  $heroNew = "<p>$($p.hero)</p>"

  $subOld = '<p class="hero-sub">Empowering students with quality education, individual attention, and a proven track record of academic success.</p>'
  $subNew = "<p class=`"hero-sub`">$($p.sub)</p>"

  $aboutOld = '<p>Vyasa Academy was founded with a vision to provide affordable, high-quality academic support that helps students realise their full potential. We specialise in CBSE, ICSE, PU, KCET, and Olympiad coaching.</p>'
  $aboutNew = "<p>$($p.about)</p>"

  $page = $html
  $page = $page.Replace($titleOld, $titleNew)
  $page = $page.Replace($crumbOld, $crumbNew)
  $page = $page.Replace($h1Old, $h1New)
  $page = $page.Replace($heroOld, $heroNew)
  $page = $page.Replace($subOld, $subNew)
  $page = $page.Replace($aboutOld, $aboutNew)

  $page = $page.Replace('src="images/', 'src="/images/')
  $page = $page.Replace('href="styles.css"', 'href="/styles.css"')
  $page = $page.Replace('src="script.js"', 'src="/script.js"')

  Set-ContentUtf8 -Path (Join-Path $dir "index.html") -Value $page
  Write-Host "Generated $($p.slug)/index.html"
}