$base = $PSScriptRoot
$html = Get-Content (Join-Path $base "index.html") -Raw -Encoding UTF8

$pages = @(
  @{
    slug = "cbse-tuition-hulimavu"
    title = "CBSE Tuition in Hulimavu, Bangalore | Vyasa Academy"
    desc = "CBSE tuition in Hulimavu, Bangalore for Classes VI-XII. Expert maths and science coaching, small batches near Bilekahalli and MICO Layout."
    h1 = 'CBSE Tuition in <span class="highlight">Hulimavu</span>'
    hero = "Expert CBSE tuition for Classes VI to XII"
    sub = "Focused CBSE coaching at Vyasa Academy, Hulimavu - experienced faculty, small batches, and proven board results for students across Hulimavu, Bilekahalli, and MICO Layout."
    about = "Vyasa Academy is a trusted CBSE tuition centre in Hulimavu, Bangalore, providing affordable, high-quality coaching for Classes VI to XII. We specialise in CBSE maths and science, with KCET and Olympiad preparation built in."
  },
  @{
    slug = "icse-tuition-hulimavu"
    title = "ICSE Tuition in Hulimavu, Bangalore | Vyasa Academy"
    desc = "ICSE tuition in Hulimavu, Bangalore for Classes VI-XII. Experienced faculty, individual attention, and strong foundation for board exams."
    h1 = 'ICSE Tuition in <span class="highlight">Hulimavu</span>'
    hero = "Expert ICSE tuition for Classes VI to XII"
    sub = "Subject-wise ICSE coaching at Vyasa Academy, Hulimavu - experienced faculty and personal attention to help students excel in board exams and beyond."
    about = "Vyasa Academy is a dedicated ICSE tuition centre in Hulimavu, Bangalore, offering affordable, high-quality coaching for Classes VI to XII across maths and science subjects, with individual attention in small batches."
  },
  @{
    slug = "maths-tuition-hulimavu"
    title = "Maths Tuition in Hulimavu, Bangalore | Vyasa Academy"
    desc = "Maths tuition in Hulimavu, Bangalore for CBSE and ICSE Classes VI-XII. Led by Mahendra Babu Chennupati with 10+ years of experience."
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
    desc = "KCET coaching in Hulimavu, Bangalore for PCM aspirants. Structured coaching, mock tests, and strategy at Vyasa Academy."
    h1 = 'KCET Coaching in <span class="highlight">Hulimavu</span>'
    hero = "Structured KCET preparation for aspiring engineers"
    sub = "PCM foundations, mock tests, and exam strategy built into a structured KCET coaching program at Vyasa Academy, Hulimavu."
    about = "Vyasa Academy offers focused KCET coaching in Hulimavu, Bangalore for aspiring engineers - strong PCM foundations, regular mock tests, and personalised exam strategy."
  },
  @{
    slug = "class-10-tuition-hulimavu"
    title = "Class 10 Tuition in Hulimavu, Bangalore | Vyasa Academy"
    desc = "Class 10 board exam tuition in Hulimavu for CBSE and ICSE. Maths and science coaching with mock tests and doubt-clearing at Vyasa Academy."
    h1 = 'Class 10 Tuition in <span class="highlight">Hulimavu</span>'
    hero = "Board exam preparation for CBSE and ICSE"
    sub = "Class 10 maths and science coaching in Hulimavu with mock tests, practice papers, and one-on-one doubt clearing at Vyasa Academy."
    about = "Vyasa Academy specialises in Class 10 tuition in Hulimavu, Bangalore - maths and science coaching for CBSE and ICSE with downloadable practice papers, mock tests, and individual doubt clearing."
  },
  @{
    slug = "class-12-tuition-hulimavu"
    title = "Class 12 Tuition in Hulimavu, Bangalore | Vyasa Academy"
    desc = "Class 12 tuition in Hulimavu for PU, CBSE and ICSE. Advanced maths and science coaching with exam strategy at Vyasa Academy."
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
  }
)

foreach ($p in $pages) {
  $dir = Join-Path $base $p.slug
  New-Item -ItemType Directory -Path $dir -Force | Out-Null

  $titleOld = '<title>Vyasa Academy | CBSE & ICSE Tuitions for VI-XII</title>'
  $titleNew = "<title>$($p.title)</title>`r`n  <meta name=`"description`" content=`"$($p.desc)`" />`r`n  <link rel=`"canonical`" href=`"https://www.vyasaacademy.in/$($p.slug)/`" />"

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
  $page = $page.Replace($h1Old, $h1New)
  $page = $page.Replace($heroOld, $heroNew)
  $page = $page.Replace($subOld, $subNew)
  $page = $page.Replace($aboutOld, $aboutNew)

  $page = $page.Replace('src="images/', 'src="/images/')
  $page = $page.Replace('href="styles.css"', 'href="/styles.css"')
  $page = $page.Replace('src="script.js"', 'src="/script.js"')

  Set-Content -Path (Join-Path $dir "index.html") -Value $page -Encoding UTF8
  Write-Host "Generated $($p.slug)/index.html"
}