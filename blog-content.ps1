# =====================================================================
# VYASA ACADEMY - BLOG CONTENT
# Pure data file, dot-sourced by generate-blog.ps1.
# Rules: ASCII only. No $ signs, backticks or double quotes inside
# content strings. Use <a href='/path/'> for links inside prose.
# =====================================================================

$script:blogCategories = @(
  @{
    slug  = 'mathematics'
    name  = 'Mathematics'
    short = 'Problem-solving, conceptual clarity and exam technique for CBSE, ICSE, KCET and Olympiads.'
    desc  = 'Mathematics study tips and guides for CBSE and ICSE students: problem-solving techniques, common mistakes, and board exam strategy by the teachers at Vyasa Academy.'
  },
  @{
    slug  = 'physics'
    name  = 'Physics'
    short = 'Concepts, numericals and revision plans for physics from Class 6 to Class 12.'
    desc  = 'Physics study guides for CBSE and ICSE students: mastering concepts, solving numericals, and a practical revision plan for board exams.'
  },
  @{
    slug  = 'chemistry'
    name  = 'Chemistry'
    short = 'Memorisation tricks, reaction practice and board exam preparation for chemistry.'
    desc  = 'Chemistry study tips for CBSE and ICSE students: memorisation tricks, reaction practice, and focused board exam preparation guidance.'
  },
  @{
    slug  = 'biology'
    name  = 'Biology'
    short = 'Diagrams, flowcharts and memory techniques to master biology for boards.'
    desc  = 'Biology study guides for CBSE and ICSE students: diagrams, flowcharts, memory techniques, and board exam preparation tips explained simply.'
  },
  @{
    slug  = 'science'
    name  = 'Science'
    short = 'Hands-on learning and study habits that build strong science foundations early.'
    desc  = 'Science foundations for young learners: experiments, observation habits, and study routines that build lasting understanding from Classes 6 to 8.'
  },
  @{
    slug  = 'cbse-class-10-board-exam-tips'
    name  = 'CBSE Class 10 Board Exam Tips'
    short = 'Subject-wise strategies, revision plans and time management for the Class 10 boards.'
    desc  = 'CBSE Class 10 board exam preparation: subject-wise strategies, revision plans, and time management tips that help students score well.'
  },
  @{
    slug  = 'cbse-class-12-board-exam-tips'
    name  = 'CBSE Class 12 Board Exam Tips'
    short = 'Focus areas, revision plans and exam strategy for maths, physics, chemistry and biology.'
    desc  = 'CBSE Class 12 board exam preparation: focus areas, revision plans, and exam strategy for mathematics, physics, chemistry and biology.'
  },
  @{
    slug  = 'study-tips'
    name  = 'Study Tips'
    short = 'Routines, focus techniques and learning methods that help students study smarter.'
    desc  = 'Effective study routines, focus techniques, and learning methods that help CBSE and ICSE students study smarter, not longer.'
  }
)

$script:blogAuthors = @(
  @{
    key      = 'mahendra'
    name     = 'Mahendra Babu Chennupati'
    jobTitle = 'Founder & Lead Mathematics Faculty'
    bio      = 'Founder of Vyasa Academy with 10+ years of mathematics teaching experience across CBSE, ICSE, KCET and Olympiads.'
  },
  @{
    key      = 'venu'
    name     = 'Venu Chennupati'
    jobTitle = 'Co-Founder & Mathematics Faculty'
    bio      = 'Co-Founder of Vyasa Academy specialising in mathematics coaching with a focus on problem-solving and conceptual clarity.'
  }
)

$script:blogArticles = @(

  @{
    slug     = 'how-to-score-90-plus-in-cbse-class-10-maths'
    title    = 'How to Score 90+ in CBSE Class 10 Maths: A Step-by-Step Plan'
    cat      = 'mathematics'
    author   = 'mahendra'
    pub      = '2026-08-18'
    upd      = '2026-09-01'
    excerpt  = 'Scoring 90+ in CBSE Class 10 maths is about the right plan, not natural talent. Here is a step-by-step strategy from a maths teacher.'
    keywords = @('CBSE Class 10 Maths','Class 10 board exam preparation','maths study plan','scoring 90 in maths')
    related  = @('10-common-mistakes-in-maths-and-how-to-fix-them','cbse-class-10-board-exam-preparation-strategy','how-to-build-a-study-routine')
    courses  = @(
      @{ label = 'Class 10 Tuition in Hulimavu';  url = '/class-10-tuition-hulimavu/' },
      @{ label = 'Maths Tuition in Hulimavu';     url = '/maths-tuition-hulimavu/' },
      @{ label = 'CBSE Tuition in Hulimavu';      url = '/cbse-tuition-hulimavu/' }
    )
    body = @(
      @{ t = 'p'; s = @('A score of 90+ in CBSE Class 10 mathematics is a realistic target for almost every student who is willing to follow a disciplined plan for six to eight months.','It is less about intelligence and more about consistency, the right practice, and honest self-assessment.','Here is the plan we use with students at our tuition centre in Hulimavu, broken into simple steps.') },
      @{ t = 'h2'; s = 'Why the marking scheme changes everything' },
      @{ t = 'p'; s = @('Before you solve a single extra question, read the latest CBSE sample papers and marking scheme for Class 10 maths.','They tell you how many marks each chapter carries and how steps are awarded.','A CBSE maths paper rarely tests a single difficult concept in isolation.','Most questions check whether you can apply a standard method correctly and show your steps clearly.') },
      @{ t = 'p'; s = @('When you know that construction carries only a few marks while algebra and geometry carry the bulk, you can prioritise your time without guilt.','This is the single biggest time-saver for most students.') },
      @{ t = 'h2'; s = 'Step 1: Build concept-first notes, not summary notes' },
      @{ t = 'p'; s = @('For each chapter, write one page of notes that answers three questions: what is the idea, why does it work, and where do students usually slip up.','Most toppers keep short notes focused on methods and common errors instead of copying the textbook.','Your notes are for revision, not for the first read.') },
      @{ t = 'ul'; i = @('Keep a formula sheet per chapter, and update it whenever you find a new formula in practice.','Twice a week, rewrite your notes from memory before checking them.','Fix the error log approach: every mistake you make goes into a list with its fix.') },
      @{ t = 'h2'; s = 'Step 2: Practice in exam conditions' },
      @{ t = 'p'; s = @('From at least 60 days before the pre-boards, solve one full sample paper every week in a single sitting of three hours.','No phone, no music, no peeking.','After the paper, spend 45 minutes mapping every lost mark to either a concept gap, a calculation slip, or a time-management problem.','Each category needs a different fix, so do not treat them the same.') },
      @{ t = 'h2'; s = 'Step 3: Fix mistakes with an error log' },
      @{ t = 'p'; s = @('Most students who plateau around the 70-80 mark do so because they repeat the same mistakes in different papers.','An error log breaks that cycle.','Every wrong answer gets one line: the question reference, the wrong step, and the correction.','Before every practice session, read the log for one minute.','Students who do this consistently see a visible jump in two to three weeks.') },
      @{ t = 'h2'; s = 'Step 4: Revise the last 30 days with precision' },
      @{ t = 'ol'; i = @('Days 30-20: one chapter each day, notes plus 20 selected questions from your error areas.','Days 20-10: full sample papers on alternate days, lightweight revision in between.','Days 10-2: solve previous-year questions chapter-wise and review your formula sheet daily.','Day 1: rest well, and only skim your error log and formulas.') },
      @{ t = 'p'; s = @('The final day matters more than people think.','A student who reaches the exam hall fresh and calm answers better than one who spent the night cramming.','If you want the plan with live doubt clearing and weekly mock tests, our class 10 tuition program in Hulimavu is built exactly around these steps.') },
      @{ t = 'h3'; s = 'A note on handwriting and presentation' },
      @{ t = 'p'; s = @('Simple presentation habits earn easy marks: draw the rough figure, label axes on graphs, write the final answer inside a box, and underline the unit.','These take seconds but are visible on every scanned answer sheet.') }
    )
  },

  @{
    slug     = '10-common-mistakes-in-maths-and-how-to-fix-them'
    title    = '10 Common Maths Mistakes Students Make (And How to Fix Them)'
    cat      = 'mathematics'
    author   = 'venu'
    pub      = '2026-08-25'
    upd      = '2026-08-25'
    excerpt  = 'Most maths marks are lost to a handful of repeatable slips. Fix these ten mistakes and watch your scores improve quickly.'
    keywords = @('maths mistakes','common calculation errors','maths exam tips','avoid silly mistakes in maths')
    related  = @('how-to-score-90-plus-in-cbse-class-10-maths','how-to-build-a-study-routine','how-to-clear-doubts-faster')
    courses  = @(
      @{ label = 'Maths Tuition in Hulimavu';  url = '/maths-tuition-hulimavu/' },
      @{ label = 'CBSE Tuition in Hulimavu';   url = '/cbse-tuition-hulimavu/' }
    )
    body = @(
      @{ t = 'p'; s = @('After years of teaching maths to CBSE and ICSE students, one pattern is undeniable: a small set of mistakes repeats across students, classes, and papers.','Fix these ten, and you will see marks climb faster than with any new book or video.') },
      @{ t = 'h2'; s = '1. Skipping the rough work discipline' },
      @{ t = 'p'; s = @('Sloppy rough work on the side of the page causes most sign errors and misread digits.','Do rough work in a neat column, one step per line, so you can actually check it.') },
      @{ t = 'h2'; s = '2. Not rewriting the question in symbols' },
      @{ t = 'p'; s = @('Word problems punish students who save ink.','Translate the question into a small diagram, a table, or an equation before touching numbers.','The few seconds spent on this prevent the biggest category of wrong answers.') },
      @{ t = 'h2'; s = '3. Ignoring units and the final answer box' },
      @{ t = 'p'; s = @('A correct calculation with a missing unit is a lost mark.','Box the final answer, write the unit, and underline the quantity the question asked for.','Marks are also given for presentation, not just the result.') },
      @{ t = 'h2'; s = '4. Plugging values into the wrong identity' },
      @{ t = 'p'; s = @('Students memorise identities but forget the variable names change.','Write the identity in symbols first, then substitute.','If (a+b) squared becomes (x-3) squared, keep the pattern visible.') },
      @{ t = 'h2'; s = '5. Rushing the last three minutes' },
      @{ t = 'p'; s = @('The final minutes cause more silly errors than the entire paper.','Reserve five minutes to check signs and signs only: plus/minus, brackets, and powers across the whole answer sheet.','Do not re-solve anything. Just scan for sign changes.') },
      @{ t = 'h2'; s = '6. Practising without a timing plan' },
      @{ t = 'p'; s = @('Students who practise in unlimited time panic in timed exams.','Divide the paper into sections with a time budget before you start, and rehearse that budget in every mock paper.') },
      @{ t = 'h2'; s = '7. Avoiding the chapters you are weak in' },
      @{ t = 'p'; s = @('It feels good to revise trigonometry when you are good at it.','The marks are in the chapters you avoid.','Give your weakest chapter ten extra minutes every single day for three weeks and the gap closes fast.') },
      @{ t = 'h2'; s = '8. Copying steps without understanding them' },
      @{ t = 'p'; s = @('Copying a solution feels like learning and is not.','After you copy a method, close the book and reproduce it from scratch.','If you cannot, you have found a real gap to fix in your notes.') },
      @{ t = 'h2'; s = '9. Letting one hard question eat your time' },
      @{ t = 'p'; s = @('A stuck question is a time trap.','Mark it, move on, and return only if every other attempt is done.','Missing three easy 3-mark questions to attempt one 5-mark question is a bad trade in every exam.') },
      @{ t = 'h2'; s = '10. Never reviewing marked papers' },
      @{ t = 'p'; s = @('The paper you got back is your best teacher.','Go through every red mark and sort it into concept gap, calculation slip, or presentation issue.','Then fix the biggest category first.','This is exactly the review habit we build into maths coaching at Vyasa Academy in Hulimavu.','If you want guided practice with a teacher watching for these patterns, book a visit to our centre.') }
    )
  },

  @{
    slug     = 'how-to-study-physics-for-cbse-class-12'
    title    = 'How to Study Physics for CBSE Class 12: Concepts and Numericals'
    cat      = 'physics'
    author   = 'mahendra'
    pub      = '2026-09-02'
    upd      = '2026-09-02'
    excerpt  = 'Physics rewards understanding over cramming. Learn how to build concepts, tame numericals, and revise smartly for the Class 12 boards.'
    keywords = @('Class 12 physics','CBSE physics preparation','physics numericals','physics revision plan')
    related  = @('cbse-class-12-board-exam-revision-plan','science-foundations-for-classes-6-to-8','how-to-build-a-study-routine')
    courses  = @(
      @{ label = 'Class 12 Tuition in Hulimavu';   url = '/class-12-tuition-hulimavu/' },
      @{ label = 'Science Tuition in Hulimavu';    url = '/science-tuition-hulimavu/' },
      @{ label = 'CBSE Tuition in Hulimavu';       url = '/cbse-tuition-hulimavu/' }
    )
    body = @(
      @{ t = 'p'; s = @('Physics in Class 12 is where many students first discover that reading a textbook is not the same as understanding it.','The good news is that the CBSE paper is predictable in structure, and the subject becomes easier once you learn how to study it.','Here is the method we use with Class 12 students in Hulimavu.') },
      @{ t = 'h2'; s = 'Build physics as a story, not a list of formulas' },
      @{ t = 'p'; s = @('Every topic in Class 12 physics is an explanation of how something works: how charges move, how fields bend space, how circuits behave.','Before memorising a formula, ask three questions: what does each symbol mean, what is the physics behind it, and what would break if we changed one term.','When a formula has a story, it stays in memory for months instead of days.') },
      @{ t = 'h2'; s = 'The two-pass method for numericals' },
      @{ t = 'p'; s = @('First pass: solve numericals with the formula sheet open.','The goal is to understand the mapping between a situation and a formula.','Second pass: solve the same numericals blind, without any help, and time yourself.','The second pass is the one that builds exam confidence.','Students who skip it often stare at the paper in the exam hall because the formulas looked familiar but were never truly theirs.') },
      @{ t = 'h2'; s = 'Chapter weightage tells you where to push' },
      @{ t = 'ul'; i = @('Electrostatic and magnetic fields carry heavy weightage in most recent papers: aim for mastery early.','Optics and modern physics are high-yield and scoring if concepts are clear.','Semiconductors and communication systems are short chapters that fetch easy marks in board exams.','Devices, diagrams and graphs deserve dedicated practice: they appear every year.') },
      @{ t = 'p'; s = @('Use the latest CBSE sample paper to confirm the current pattern instead of relying on older assumptions.') },
      @{ t = 'h2'; s = 'A revision cycle that actually sticks' },
      @{ t = 'ol'; i = @('Week 1 per chapter: learn the concept and solve numericals in two passes.','Week 2: the derivations that frequently appear, written from memory.','Week 3: previous-year questions for the chapter, timed.','Week 4: one full sample paper covering everything, in exam conditions.') },
      @{ t = 'p'; s = @('Doing this for all chapters in parallel looks slower at first, but the overlaps between chapters make later revision dramatically faster.') },
      @{ t = 'h2'; s = 'Diagrams, derivations and presentation' },
      @{ t = 'p'; s = @('Draw every diagram neatly with a pencil: circuit diagrams, ray diagrams, field lines.','Label the parts explicitly.','For derivations, write one logical step per line and state the approximations you used.','These habits consistently convert average students into top scorers.','If you want structured Class 12 physics coaching with weekly tests and doubt clearing near Bannerghatta Road, our science tuition program is built around this method.') }
    )
  },

  @{
    slug     = 'how-to-memorise-the-periodic-table'
    title    = 'How to Memorise the Periodic Table: Simple Tricks That Work'
    cat      = 'chemistry'
    author   = 'venu'
    pub      = '2026-08-11'
    upd      = '2026-08-11'
    excerpt  = 'The periodic table is not a memory test, it is a map. Learn the tricks that make the elements stay in your head.'
    keywords = @('memorise periodic table','periodic table tricks','chemistry study tips','mendeleev periodic table')
    related  = @('how-to-study-biology-for-cbse-boards','how-to-build-a-study-routine','10-common-mistakes-in-maths-and-how-to-fix-them')
    courses  = @(
      @{ label = 'Science Tuition in Hulimavu';  url = '/science-tuition-hulimavu/' },
      @{ label = 'CBSE Tuition in Hulimavu';     url = '/cbse-tuition-hulimavu/' }
    )
    body = @(
      @{ t = 'p'; s = @('Students fear the periodic table because they treat it as a list of 118 names to memorise.','In reality it is a layout of patterns: when you understand the layout, memorisation becomes a side effect.','Here is the approach that works for the first 30 elements and the common groups.') },
      @{ t = 'h2'; s = 'Learn the map before the names' },
      @{ t = 'p'; s = @('Rows are periods and columns are groups.','Elements in the same group share similar chemical behaviour because they have the same number of valence electrons.','When you memorise a group, you memorise the chemical character of every element in it at once.','Start with group names: alkali metals, alkaline earth metals, halogens, and noble gases.') },
      @{ t = 'h2'; s = 'Mnemonics for the first 30 elements' },
      @{ t = 'p'; s = @('Mnemonics work because your brain keeps stories better than labels.','Invent your own, or use short memorable phrases where the first letters line up with element symbols.','The sillier the story, the longer it stays.') },
      @{ t = 'h2'; s = 'Associate families with behaviour' },
      @{ t = 'ul'; i = @('Group 1 alkali metals react vigorously with water: link them to reactive, silvery metals.','Group 17 halogens exist as diatomic molecules like chlorine and iodine: picture them in pairs.','Group 18 noble gases are unreactive: mentally place them in a bubble that does not react.','Transition metals form coloured compounds and ions: connect iron, copper and zinc to colours you have seen in the lab.') },
      @{ t = 'h2'; s = 'Use spaced recall instead of marathon revision' },
      @{ t = 'p'; s = @('Review the table for five minutes at fixed times: after a class, before dinner, and before bed.','Each review should try to say or write the elements from memory before checking.','Repetition with recall beats reading the table ten times in a row.') },
      @{ t = 'h2'; s = 'What about the exams?' },
      @{ t = 'p'; s = @('Board exams do not ask you to recite 118 elements.','They test trends: atomic radius, electronegativity, metallic character, and ionisation energy across a period and down a group.','Memorise the table once, then practise answering these trend questions with reasoning.','That is where the actual marks come from.','Attend our science tuition in Hulimavu for a guided, hands-on approach to chemistry that makes concepts like these click early.') }
    )
  },

  @{
    slug     = 'how-to-study-biology-for-cbse-boards'
    title    = 'How to Study Biology for CBSE Boards: Diagrams, Flowcharts and Memory'
    cat      = 'biology'
    author   = 'venu'
    pub      = '2026-08-28'
    upd      = '2026-08-28'
    excerpt  = 'Biology is memorising and reasoning at the same time. Use diagrams and flowcharts to learn it half as fast and remember it twice as long.'
    keywords = @('biology board preparation','how to study biology','biology diagrams','biology revision')
    related  = @('how-to-memorise-the-periodic-table','cbse-class-10-board-exam-preparation-strategy','how-to-build-a-study-routine')
    courses  = @(
      @{ label = 'Science Tuition in Hulimavu';  url = '/science-tuition-hulimavu/' },
      @{ label = 'CBSE Tuition in Hulimavu';     url = '/cbse-tuition-hulimavu/' }
    )
    body = @(
      @{ t = 'p'; s = @('Biology trips up many students because it feels like an endless list of facts.','But the students who score full marks treat it as a subject of relationships: structure to function, pathway to outcome, diagram to process.','Here is how to study it that way.') },
      @{ t = 'h2'; s = 'Draw every diagram twice' },
      @{ t = 'p'; s = @('First, draw from the textbook with the labels open.','Second, draw from memory with no help, and then compare.','The gap between your two drawings is exactly what you still need to learn.','Board examiners look for clearly labelled diagrams: a neat, labelled figure earns reliable marks.') },
      @{ t = 'h2'; s = 'Turn paragraphs into flowcharts' },
      @{ t = 'p'; s = @('Processes like digestion, circulation, respiration and excretion are sequences.','Convert each textbook paragraph into a four to six step flowchart with arrows.','Once a process is a flowchart, revision takes minutes instead of hours, because you only need to rebuild the chain from memory.') },
      @{ t = 'h2'; s = 'Link structure to function' },
      @{ t = 'ul'; i = @('Ask why each structure exists: the alveoli have thin walls because gases must diffuse quickly.','Ask what happens when the structure is damaged: that is how exam questions test application.','Connect related systems: respiratory and circulatory systems work together, and questions love to test that link.') },
      @{ t = 'h2'; s = 'The memory bank method' },
      @{ t = 'p'; s = @('Keep a small notebook of one-liners: a term, its definition in your own words, and one example.','Review this notebook daily for five minutes.','Over a month, this builds a bank of 200 one-liners that covers most one-mark and two-mark questions.') },
      @{ t = 'h2'; s = 'Practise in the board format' },
      @{ t = 'p'; s = @('Write short answers in your own words within the word limit.','Practise long answers with a rough outline first: key terms, sequence, and diagram.','The writing plan is what makes your answer complete and organised on the day of the exam.','For guided biology coaching with personalised feedback on diagrams and answers, visit our science tuition centre in Hulimavu, Bangalore.') }
    )
  },

  @{
    slug     = 'science-foundations-for-classes-6-to-8'
    title    = 'Science Foundations for Classes 6 to 8: Habits That Pay Off Later'
    cat      = 'science'
    author   = 'mahendra'
    pub      = '2026-07-30'
    upd      = '2026-08-10'
    excerpt  = 'The concepts behind Class 11 and 12 science start in Classes 6 to 8. Build these three habits now and every later year gets easier.'
    keywords = @('science for class 6','science for class 7','science for class 8','science foundation')
    related  = @('how-to-study-physics-for-cbse-class-12','how-to-build-a-study-routine','how-to-clear-doubts-faster')
    courses  = @(
      @{ label = 'Science Tuition in Hulimavu';  url = '/science-tuition-hulimavu/' },
      @{ label = 'CBSE Tuition in Hulimavu';     url = '/cbse-tuition-hulimavu/' }
    )
    body = @(
      @{ t = 'p'; s = @('Parents often ask us when serious science preparation should start.','The honest answer: the foundation years of Classes 6 to 8 are when curiosity turns into understanding.','Students who learn certain habits in these years find physics, chemistry and biology much easier in senior school.') },
      @{ t = 'h2'; s = 'Habit 1: Observe before you memorise' },
      @{ t = 'p'; s = @('A candle going out under a jar, ice melting on a warm surface, a magnet picking up paper clips: these small observations are the seeds of later concepts.','Encourage your child to describe what they see in one complete sentence before reaching for an explanation.','Students who can observe precisely can also read questions precisely.') },
      @{ t = 'h2'; s = 'Habit 2: Question everything safely' },
      @{ t = 'p'; s = @('Train children to ask why, what if, and what happens next.','Classroom experiments are the perfect place: ask what would change if one variable changed.','The ability to form a hypothesis is a skill, not a talent, and it develops with practice.','It also makes science lessons at actual tuition centres far more productive.') },
      @{ t = 'h2'; s = 'Habit 3: Keep a learning log' },
      @{ t = 'p'; s = @('A simple notebook with one page per week, listing one new thing learned and one question they still have, builds powerful revision material.','By Class 9 your child will have a personal science summary that no textbook can match.','It also quietly teaches the most important study skill of all: spaced repetition.') },
      @{ t = 'h2'; s = 'Why these years decide senior-school grades' },
      @{ t = 'p'; s = @('Concepts like energy, force, cells and chemical change introduced in middle school reappear in Class 10 boards and in Class 11 and 12 with more depth.','A student who understood them as ideas, not as paragraphs, will not fear the senior syllabus.','A student who memorised them will have to relearn everything later.','That difference is exactly what our science foundation program in Hulimavu is designed to prevent.','If you want to build these habits with expert guidance and small batches, talk to us about our classes for Classes 6 to 8.') }
    )
  },

  @{
    slug     = 'cbse-class-10-board-exam-preparation-strategy'
    title    = 'CBSE Class 10 Board Exam 2026: Complete Preparation Strategy'
    cat      = 'cbse-class-10-board-exam-tips'
    author   = 'mahendra'
    pub      = '2026-09-05'
    upd      = '2026-09-05'
    excerpt  = 'A complete, subject-wise preparation strategy for the CBSE Class 10 board exams, from a six-month timeline down to exam-day routine.'
    keywords = @('CBSE Class 10 boards 2026','Class 10 exam strategy','board exam preparation','CBSE Class 10 tips')
    related  = @('how-to-score-90-plus-in-cbse-class-10-maths','how-to-build-a-study-routine','how-to-study-biology-for-cbse-boards')
    courses  = @(
      @{ label = 'Class 10 Tuition in Hulimavu';  url = '/class-10-tuition-hulimavu/' },
      @{ label = 'CBSE Tuition in Hulimavu';      url = '/cbse-tuition-hulimavu/' }
    )
    body = @(
      @{ t = 'p'; s = @('Class 10 board exams are the first national-level test most students face.','The pressure is real, but so is the advantage of starting early with a clear subject-wise strategy.','This guide gives you the same six-month plan our Class 10 students in Hulimavu follow.') },
      @{ t = 'h2'; s = 'The six-month high-level plan' },
      @{ t = 'ul'; i = @('Months 6-4: finish the syllabus with concept clarity, chapter by chapter, with quick tests after each unit.','Months 4-2: solve NCERT exercises and one sample paper per subject every two weeks.','Months 2-1: chapter-wise previous-year questions and your first full mock exams.','Final month: timed full papers in exam conditions and targeted revision of weak areas.') },
      @{ t = 'h2'; s = 'Mathematics: accuracy before speed' },
      @{ t = 'p'; s = @('Maths rewards students who practise daily for 45 minutes with full attention over students who cram.','Solve problems step by step, keep an error log, and time your mocks.','The full method is in our detailed guide to scoring 90+ in Class 10 maths, linked at the bottom of this article.') },
      @{ t = 'h2'; s = 'Science: diagrams and definitions matter' },
      @{ t = 'p'; s = @('Practice diagrams freehand until they come clean without the textbook.','Learn definitions word-perfect but write examples in your own words.','For numericals in physics and chemistry, do a timed second pass of every solved example.') },
      @{ t = 'h2'; s = 'Social Science: write to remember' },
      @{ t = 'p'; s = @('Bullet points, timelines and maps are the three weapons.','Practise map work every weekend, and write full-length answers under word limits so your handwriting and speed stay sharp.') },
      @{ t = 'h2'; s = 'Languages: the marks you should not lose' },
      @{ t = 'p'; s = @('Grammar rules and writing formats are predictable.','Prepare formats for letters, notices, and analytical paragraphs patiently, and revise the reading-comprehension technique: read questions first, then passage.') },
      @{ t = 'h2'; s = 'The mock exam discipline' },
      @{ t = 'p'; s = @('Treat every mock like the real paper: same time, same desk arrangement, same no-phone rule.','After each mock, spend 30 minutes on a mistake map, and adjust the next week plan around it.','Students who repeat this ritual walk into the real board hall already familiar with the pressure.','Want this plan executed with a teacher who reviews your mocks personally? Join our Class 10 tuition program in Hulimavu, Bangalore.') }
    )
  },

  @{
    slug     = 'cbse-class-12-board-exam-revision-plan'
    title    = 'CBSE Class 12 Board Exam 2026: A Realistic Revision Plan'
    cat      = 'cbse-class-12-board-exam-tips'
    author   = 'mahendra'
    pub      = '2026-09-06'
    upd      = '2026-09-06'
    excerpt  = 'The final months before Class 12 boards decide your rank. Here is a realistic, week-by-week revision plan that covers everything without burnout.'
    keywords = @('CBSE Class 12 boards 2026','Class 12 revision plan','board exam revision','Class 12 exam strategy')
    related  = @('how-to-study-physics-for-cbse-class-12','how-to-build-a-study-routine','how-to-clear-doubts-faster')
    courses  = @(
      @{ label = 'Class 12 Tuition in Hulimavu';  url = '/class-12-tuition-hulimavu/' },
      @{ label = 'Science Tuition in Hulimavu';   url = '/science-tuition-hulimavu/' }
    )
    body = @(
      @{ t = 'p'; s = @('Class 12 board exams carry double weight: they decide your final score and shape your entrance exam plans.','The last two to three months are when consistent revision beats fresh learning.','Here is a realistic plan that covers the syllabus, builds mock discipline, and keeps you sane.') },
      @{ t = 'h2'; s = 'Week 1-2: Complete one full revision pass' },
      @{ t = 'p'; s = @('Go textbook chapter by chapter, but only through your notes, formulas, and solved examples.','Mark every topic as strong, medium, or weak.','Do not open a new book now.','A full pass done honestly gives you a map of exactly where the next weeks should go.') },
      @{ t = 'h2'; s = 'Week 3-6: Attack weak topics in the morning' },
      @{ t = 'p'; s = @('Mornings are when your brain is freshest.','Use the first 90 minutes each day for your weak list, one topic at a time, ending with five solved problems.','Evenings alternate: one day of boards-style full papers, one day of previous-year questions chapter-wise.','This two-week rhythm produces the biggest jump in most students.') },
      @{ t = 'h2'; s = 'Week 7-9: Full mocks in exam conditions' },
      @{ t = 'ul'; i = @('Solve at least one full paper of a core subject every two days.','Use the exact official timings and sit without interruptions.','Review each paper within 24 hours and add every lost mark to a one-line error list.','Repeat the error list at the start of each study session.') },
      @{ t = 'h2'; s = 'Subject-specific final-week shortcuts' },
      @{ t = 'p'; s = @('For maths and physics: redo your formula sheet and the derivations you drew from memory at least once more.','For chemistry and biology: revise reaction maps, name reactions, and one-line definitions from your memory bank.','For languages and electives: formats, values-based answers, and previous-year questions are the highest-yield revision.') },
      @{ t = 'h2'; s = 'The week before the exam' },
      @{ t = 'p'; s = @('Do not try anything new in the final seven days.','Alternate light revision with confidence-building papers you have already scored well on.','Sleep eight hours, and time your answers so you finish fifteen minutes early.','A calm, well-rested student outperforms a panicked crammer every single time.','If you want a teacher to mark your mocks and guide the weak-topic list, our Class 12 program in Hulimavu exists for exactly that.') }
    )
  },

  @{
    slug     = 'how-to-build-a-study-routine'
    title    = 'How to Build a Study Routine That Actually Sticks'
    cat      = 'study-tips'
    author   = 'venu'
    pub      = '2026-08-20'
    upd      = '2026-09-01'
    excerpt  = 'Most study plans fail in the first week. These five principles make a routine that students can actually keep through exam season.'
    keywords = @('study routine','study schedule','how to study effectively','study habits for students')
    related  = @('how-to-clear-doubts-faster','10-common-mistakes-in-maths-and-how-to-fix-them','how-to-score-90-plus-in-cbse-class-10-maths')
    courses  = @(
      @{ label = 'CBSE Tuition in Hulimavu';  url = '/cbse-tuition-hulimavu/' },
      @{ label = 'Maths Tuition in Hulimavu'; url = '/maths-tuition-hulimavu/' }
    )
    body = @(
      @{ t = 'p'; s = @('Ask any topper how they study and you will hear a variation of the same answer: not a magical technique, but a routine they never broke.','The hard part is not making a plan, it is making one that survives real life.','These five principles come from watching thousands of students try and succeed at exactly this.') },
      @{ t = 'h2'; s = '1. Start smaller than feels right' },
      @{ t = 'p'; s = @('A five-hour schedule that dies on day three is worth less than a 45-minute block you keep for a year.','For the first two weeks, aim for two focused blocks of 45 minutes each.','Consistency establishes the habit; the hours can come later.','You can always add time, but you cannot add back a broken habit.') },
      @{ t = 'h2'; s = '2. Anchor study to an existing habit' },
      @{ t = 'p'; s = @('Link your first study block to something you already do daily: finishing dinner, returning from school, or the evening walk.','The anchor removes the decision of when to start, and decisions are where routines die.') },
      @{ t = 'h2'; s = '3. Protect the 25-minute start' },
      @{ t = 'p'; s = @('The first 25 minutes are the hardest.','Set a timer, put the phone in another room, and commit to just those minutes.','Almost every student, once past the 25-minute mark, continues on their own.','The phone is not a reward for finishing; it is the enemy of starting.') },
      @{ t = 'h2'; s = '4. Schedule the hardest subject first' },
      @{ t = 'p'; s = @('Willpower is highest in the morning and right when you start.','Put your weakest subject first in each session and your favourite, lighter work at the end as a natural finish line.','This single swap changes how much hard work actually gets done.') },
      @{ t = 'h2'; s = '5. Review the week, then plan the week' },
      @{ t = 'p'; s = @('Every Sunday, spend ten minutes asking what worked and what slipped.','Adjust the plan around life instead of abandoning it.','A routine is a living tool, not a contract you signed with yourself.','Students who review their week keep improving it, which is why their grades climb before the exams even arrive.','If structure is what you need, our tuition programs in Hulimavu provide the fixed batch schedule and accountability that make these habits automatic.') }
    )
  },

  @{
    slug     = 'how-to-clear-doubts-faster'
    title    = 'How to Clear Doubts Faster: A Two-Minute Framework for Students'
    cat      = 'study-tips'
    author   = 'venu'
    pub      = '2026-09-03'
    upd      = '2026-09-03'
    excerpt  = 'Unresolved doubts silently wreck focus. Use this simple framework to clear every doubt quickly, in class or at home.'
    keywords = @('clear doubts','study doubts','ask questions in class','effective study')
    related  = @('how-to-build-a-study-routine','10-common-mistakes-in-maths-and-how-to-fix-them','how-to-study-physics-for-cbse-class-12')
    courses  = @(
      @{ label = 'CBSE Tuition in Hulimavu';  url = '/cbse-tuition-hulimavu/' },
      @{ label = 'Science Tuition in Hulimavu'; url = '/science-tuition-hulimavu/' }
    )
    body = @(
      @{ t = 'p'; s = @('A doubt that survives the day becomes a gap in the next chapter.','Most students do not lack the courage to ask; they lack a quick way to make their doubt crisp.','This two-minute framework makes every doubt small enough to fix in the moment.') },
      @{ t = 'h2'; s = 'Step 1: Locate the exact moment of confusion (30 seconds)' },
      @{ t = 'p'; s = @('Close your notes and replay the explanation in your head.','Stop at the exact sentence or step where the thread breaks.','Most students realise their doubt is usually one line, one sign, or one definition, not the whole topic.','Write that line down as the doubt.') },
      @{ t = 'h2'; s = 'Step 2: Ask in one sentence (30 seconds)' },
      @{ t = 'p'; s = @('Frame the question as: I understood X, but why does Y follow from it.','A precise question gets a precise answer and respects the teacher time.','Compare with: I do not understand this topic, which is vague and hard to answer well.') },
      @{ t = 'h2'; s = 'Step 3: Repeat back in your own words (60 seconds)' },
      @{ t = 'p'; s = @('After the teacher answers, say the explanation back in one sentence before moving on.','This confirms understanding and fixes it in memory.','If you cannot repeat it, you have found a deeper gap, which is valuable information.') },
      @{ t = 'h2'; s = 'Where doubts usually hide' },
      @{ t = 'ul'; i = @('The one line above the formula: what each symbol means in context.','The step everyone skips in the textbook solution: usually a small algebraic move.','The words every, only, or except in the question: they change the entire answer.','The relationship between two similar-looking processes, like respiration and photosynthesis.') },
      @{ t = 'h2'; s = 'Make doubt-clearing a habit' },
      @{ t = 'p'; s = @('Keep a running doubt list in the back of your notebook: one line per doubt, framed with step 1.','Clear them in class, with a friend, or with a teacher.','An empty doubt list at the end of the week is the best possible sign of a healthy study week.','Small batches at Vyasa Academy in Hulimavu give you exactly the environment for this: every doubt gets answered quickly and personally.') }
    )
  },

  @{
    slug     = 'why-students-are-afraid-of-mathematics'
    title    = 'Why Students Are Afraid of Mathematics and How Teachers Can Change It'
    cat      = 'mathematics'
    author   = 'mahendra'
    pub      = '2026-09-08'
    upd      = '2026-09-08'
    excerpt  = 'Math fear is rarely about ability. It grows from rushed foundations, public mistakes, and pace. Here is what feeds it and how teachers can reverse it.'
    keywords = @('math anxiety','fear of mathematics','why students fear maths','how to show maths as approachable')
    related  = @('how-to-overcome-fear-of-mathematics','understanding-concepts-vs-memorising-mathematics','how-to-improve-mathematics-problem-solving-skills','how-to-build-a-study-routine')
    cta      = 'If your child has started to say I hate maths, earlier is better. Small-batch Mathematics coaching at Vyasa Academy in Hulimavu rebuilds confidence one step at a time.'
    courses  = @(
      @{ label = 'Maths Tuition in Hulimavu'; url = '/maths-tuition-hulimavu/' },
      @{ label = 'CBSE Tuition in Hulimavu'; url = '/cbse-tuition-hulimavu/' }
    )
    body = @(
      @{ t = 'p'; s = @('Every few weeks a new student arrives at our centre already decided that maths is not for them.','The interesting part is that few of them struggled from the start.','Somewhere between Class 3 and Class 9, a chain of small experiences stacked up into a fixed belief.','That belief, more than any topic, is what holds them back.') },
      @{ t = 'h2'; s = 'What math fear looks like in a real classroom' },
      @{ t = 'p'; s = @('Fear rarely announces itself as a raised hand.','It shows up as second-guessing every answer, erasing until the page wears out, staring down instead of at the board, or rushing so a mistake gets blamed on speed instead of effort.','Teachers and parents notice the behaviour first and the emotion behind it second.') },
      @{ t = 'h3'; s = 'Signs a student is quietly afraid of maths' },
      @{ t = 'ul'; i = @('Avoids volunteering and looks away when a maths question is asked.','Hides answers or refuses to share working, even when correct.','Memorises methods instead of asking why, so there is nothing to explain.','Panics during timed work though the same problems go fine untimed.','Announces I am just not a maths person, usually after one bad paper.') },
      @{ t = 'h2'; s = 'Where the fear actually comes from' },
      @{ t = 'h3'; s = 'Rushed foundations' },
      @{ t = 'p'; s = @('Fractions in Class 3, tables in Class 4, algebra in Class 6: each new topic leans on the last.','When a foundation topic is rushed, every later topic feels like a wall.','Most anxious students are not weak, they are carrying three years of unfinished ideas.') },
      @{ t = 'h3'; s = 'Mistakes treated as failure' },
      @{ t = 'p'; s = @('If a wrong answer is met with a sigh, a red cross, or a comparison, the student learns to avoid being wrong at any cost.','That avoidance is the beginning of memorising without understanding.','Mistakes are where maths is actually learned, so they need a safe place to happen.') },
      @{ t = 'h3'; s = 'A pace set by someone else' },
      @{ t = 'p'; s = @('A 40-student classroom moves at the speed of the middle.','The quick students get bored, the slower ones get left behind, and both quietly disengage.','Small-group teaching exists precisely because no single speed fits a whole class.') },
      @{ t = 'h2'; s = 'How a teacher can change the pattern' },
      @{ t = 'p'; s = @('The same teacher who controls the environment can reverse it.','Start a lesson from a question students can almost answer, let them get it wrong safely, and then show the correction.','Praise the process, the attempt, and the recovery, not just the final number.','Walk through the working instead of only the answer.','This shift sounds small and changes the whole relationship with the subject.') },
      @{ t = 'h2'; s = 'A practical note for parents' },
      @{ t = 'p'; s = @('You do not need to be a maths expert to help.','Ask open questions: what did you try, where did you get stuck, what would you do differently.','Compare the child with their own past, not with a sibling or a classmate.','And if the fear is deep, a smaller learning group with a patient teacher is often the fastest reset.','Seeing one teacher who is calm and unhurried can undo years of anxiety.') },
      @{ t = 'h2'; s = 'The takeaway' },
      @{ t = 'p'; s = @('Removing the fear does not require a special method.','It requires time, a safe place for mistakes, and rebuilt foundations.','Students who get those three things usually rediscover that maths is just patterns you learn step by step.') }
    )
  },

  @{
    slug     = 'how-to-improve-mathematics-problem-solving-skills'
    title    = 'How to Improve Mathematics Problem-Solving Skills'
    cat      = 'mathematics'
    author   = 'mahendra'
    pub      = '2026-09-07'
    upd      = '2026-09-07'
    excerpt  = 'Strong problem solvers are not faster thinkers, they are more organised thinkers. Learn a simple four-step method that works on any maths problem.'
    keywords = @('problem solving in mathematics','how to solve maths problems','mathematical thinking','maths strategy for exams')
    related  = @('common-mistakes-in-mathematics-exams','how-to-improve-calculation-speed-and-accuracy','understanding-concepts-vs-memorising-mathematics','10-common-mistakes-in-maths-and-how-to-fix-them')
    cta      = 'Problem-solving grows fastest with consistent guided practice. The Mathematics programs at Vyasa Academy, Hulimavu, are built around learning by doing, not just listening.'
    courses  = @(
      @{ label = 'Maths Tuition in Hulimavu'; url = '/maths-tuition-hulimavu/' },
      @{ label = 'CBSE Tuition in Hulimavu'; url = '/cbse-tuition-hulimavu/' }
    )
    body = @(
      @{ t = 'p'; s = @('When students say they cannot solve a problem, they usually mean they looked at it and nothing came to mind.','Most adults do the same thing.','The difference between a confident solver and a stuck one is rarely speed or IQ, it is having a sequence to follow.','Here is the sequence we drill with students at every level.') },
      @{ t = 'h2'; s = 'The four steps of organised solving' },
      @{ t = 'ol'; i = @('Understand: put the question in your own words and list everything that is given and everything that is asked.','Plan: name the method you expect to use, out loud or on paper, before you calculate.','Execute: do the working one clean step at a time and write each step.','Review: re-read the question and ask whether the answer makes sense as a number.') },
      @{ t = 'p'; s = @('Students who skip the first step are the ones who solve the wrong problem perfectly.','The plan step is where most marks live, because examiners reward the route you took, not only the destination.') },
      @{ t = 'h2'; s = 'Techniques that unlock hard problems' },
      @{ t = 'h3'; s = 'Draw what the words say' },
      @{ t = 'p'; s = @('A sketch turns a word problem into a picture.','Label every quantity on the diagram or table.','Most Class 10 and 12 problems become obvious once the situation is drawn.') },
      @{ t = 'h3'; s = 'Work backwards from the answer form' },
      @{ t = 'p'; s = @('Think about what the final result should look like: a time in hours, a cost in rupees, a length in metres.','Work backwards from that shape to decide what you need to find first.','This reverse thinking clears a lot of confusion.') },
      @{ t = 'h3'; s = 'Try smaller or simpler numbers' },
      @{ t = 'p'; s = @('If a variable stays scary, substitute a simple number, solve, and then generalise.','For example, work a rate problem with 2 units per hour before tackling the algebra version.','The pattern usually appears quickly.') },
      @{ t = 'h2'; s = 'Building the habit with deliberate practice' },
      @{ t = 'p'; s = @('Problem-solving improves with volume only if the volume includes the four steps.','Solve ten problems slowly with the full sequence over ten easy ones solved by instinct.','Keep a small notebook titled route maps: for each problem type, record the steps that worked.','Within a month you will have a personal playbook for every topic.') },
      @{ t = 'h2'; s = 'How to check your answer fast' },
      @{ t = 'ul'; i = @('Round the numbers and recompute roughly to see if your exact answer is in the right ballpark.','Substitute your answer back into the original statement.','Check units: hours times speed should give distance, not anything else.','Ask a friend to trace your working, a fresh set of eyes spots slips in seconds.') },
      @{ t = 'h2'; s = 'The bottom line' },
      @{ t = 'p'; s = @('You cannot think your way to better problem-solving; you build it with a repeatable method applied daily.','Master the four steps, draw the problem, and keep a route map notebook.','That routine turns most feared questions into familiar ones.') }
    )
  },

  @{
    slug     = 'how-to-prepare-for-cbse-mathematics-exams'
    title    = 'How to Prepare for CBSE Mathematics Exams'
    cat      = 'mathematics'
    author   = 'venu'
    pub      = '2026-09-06'
    upd      = '2026-09-06'
    excerpt  = 'A calm, ordered preparation plan beats panic no matter how much time is left. Cover syllabus, practice, and mocks in the right sequence for CBSE maths.'
    keywords = @('CBSE maths exam preparation','how to prepare for maths exam','CBSE syllabus maths','board exam maths plan')
    related  = @('how-to-score-higher-marks-in-cbse-class-10-mathematics','how-to-score-better-in-cbse-class-12-mathematics','how-to-manage-time-in-mathematics-board-exam','best-way-to-study-mathematics-for-board-exams')
    cta      = 'Want your CBSE mathematics syllabus covered at the right pace, with regular tests and honest feedback? Explore the preparation programs at Vyasa Academy in Hulimavu.'
    courses  = @(
      @{ label = 'CBSE Tuition in Hulimavu'; url = '/cbse-tuition-hulimavu/' },
      @{ label = 'Maths Tuition in Hulimavu'; url = '/maths-tuition-hulimavu/' }
    )
    body = @(
      @{ t = 'p'; s = @('A maths paper rewards preparation spread over weeks, not a heroic all-nighter.','The syllabus is long, but the pattern of the exam is stable.','Read the current CBSE sample paper and marking scheme first, then prepare backwards from it.','That single habit keeps all your efforts pointed in the right direction.') },
      @{ t = 'h2'; s = 'Step 1: Map the syllabus before you touch a book' },
      @{ t = 'p'; s = @('Open the syllabus PDF and list every chapter.','Mark each as strong, medium, or weak based on your recent test scores, not your feelings.','Assign weak chapters double time in your plan.','Most students waste the first month rediscovering that they are bad at the same topics they already knew they were bad at.') },
      @{ t = 'h2'; s = 'Step 2: Follow the right book order' },
      @{ t = 'ul'; i = @('NCERT first: the board paper starts from this book, so master its exercises completely.','One well-chosen practice book for extra questions, not three half-used ones.','Previous-year papers, because they show how questions are actually asked.','Sample papers only in the last two months, in full exam conditions.') },
      @{ t = 'h2'; s = 'Step 3: Use a three-pass revision cycle' },
      @{ t = 'ol'; i = @('Pass 1, month one: finish every chapter with concept clarity and solve all NCERT examples.','Pass 2, month two: redo weak chapters and solve previous-year questions chapter-wise.','Pass 3, final month: full timed papers, then fix only what the papers expose.') },
      @{ t = 'p'; s = @('The error log proves which pass knows what.','Track every lost mark in a one-line list, sorted by cause: concept gap, slip, or time trouble.','Read the list before every practice session, not after.') },
      @{ t = 'h2'; s = 'Step 4: Build mock exam discipline' },
      @{ t = 'p'; s = @('A mock paper done honestly tells you exactly what the real paper will feel like.','Sit for the full duration, no phone, no hints.','After it, spend more time reviewing than you spent solving.','Students who complete four or five honest mocks rarely feel nervous on the actual morning.') },
      @{ t = 'h2'; s = 'What not to do in the final week' },
      @{ t = 'p'; s = @('Do not start new topics, do not switch books, do not chase a friend into a different plan.','Revise your formula list, your error log, and the chapter summaries you already made.','Shorten practice sessions as the exam approaches and protect your sleep.','A rested mind recalls methods; a tired one fumbles them.') },
      @{ t = 'h2'; s = 'The final thought' },
      @{ t = 'p'; s = @('CBSE maths is a marathon planned in advance, not a sprint decided on the day.','Map, practise in passes, run honest mocks, and protect the last week.','Follow the plan and the paper feels like a familiar road.') }
    )
  },

  @{
    slug     = 'common-mistakes-in-mathematics-exams'
    title    = 'Common Mistakes Students Make in Mathematics Exams'
    cat      = 'mathematics'
    author   = 'venu'
    pub      = '2026-09-05'
    upd      = '2026-09-05'
    excerpt  = 'Most marks are lost before the hard questions are reached. Fix these exam-day mistakes in reading, presentation, and checking to protect easy marks.'
    keywords = @('mistakes in maths exam','exam day maths tips','losing marks in maths','math exam presentation')
    related  = @('how-to-score-higher-marks-in-cbse-class-10-mathematics','how-to-manage-time-in-mathematics-board-exam','how-to-improve-calculation-speed-and-accuracy','how-to-score-90-plus-in-cbse-class-10-maths')
    cta      = 'An experienced teacher watching your full-length maths papers catches the silent mark leaks. The Mathematics batches at Vyasa Academy in Hulimavu review every mock with you.'
    courses  = @(
      @{ label = 'Maths Tuition in Hulimavu'; url = '/maths-tuition-hulimavu/' },
      @{ label = 'Best Tuition Centre in Hulimavu'; url = '/best-tuition-centre-hulimavu/' }
    )
    body = @(
      @{ t = 'p'; s = @('When a paper comes back, most lost marks do not come from questions you could not do.','They come from small, repeatable exam-day habits: reading too fast, writing too little, and checking too late.','This list is about those marks, because easy marks are the ones that decide higher bands.') },
      @{ t = 'h2'; s = 'Misreading the question under pressure' },
      @{ t = 'p'; s = @('Students solve what they expect the question to ask.','Circle the instruction word: find, prove, evaluate, or hence.','If a question says show that, the working matters more than the conclusion.','Rewriting the question in your own words in one line is worth the ten seconds it costs.') },
      @{ t = 'h2'; s = 'Skipping steps and losing method marks' },
      @{ t = 'p'; s = @('Boards award method marks inside your working.','A wrong final answer with correct steps still earns most of the marks; a blank page earns none.','Write one logical step per line, name the formula you are using, and keep the answer line clean.') },
      @{ t = 'h2'; s = 'Rounding too early' },
      @{ t = 'p'; s = @('Round at the end, never at the start.','If a question involves multiple computations, carry full precision until the final step, then round once.','Early rounding is the silent killer of chemistry and physics numericals too.') },
      @{ t = 'h2'; s = 'Forgetting units, boxes, and final statements' },
      @{ t = 'ul'; i = @('Write the unit in the final answer: cm, hours, rupees, km per hour.','Box the final answer so the examiner can see it at a glance.','End word problems with a sentence: the boat took 3 hours.','Underline the quantity asked in the question before you start.') },
      @{ t = 'h2'; s = 'Diagram mistakes that cost double' },
      @{ t = 'p'; s = @('In geometry and trigonometry, a messy figure hides the relationships you need.','Draw with a pencil, label every vertex and angle, and keep the figure near your working.','An unlabelled diagram loses marks even when the calculation is correct.') },
      @{ t = 'h2'; s = 'Checking in the wrong order' },
      @{ t = 'p'; s = @('Most students check by re-reading, which means seeing what they expect.','Instead, check top to bottom for signs and brackets only, then re-solve any answer that looks odd.','Reverse-check: start from the answer and work it back into the question.','Five minutes of this beats twenty minutes of re-reading.') },
      @{ t = 'h2'; s = 'Speed as the enemy' },
      @{ t = 'p'; s = @('Going fast in the first hour usually creates slips you pay for in the third.','Set a steady pace by budgeting minutes per section in advance.','Accuracy buys speed: students who stop rushing usually finish with time to spare.') }
    )
  },

  @{
    slug     = 'how-to-score-higher-marks-in-cbse-class-10-mathematics'
    title    = 'How to Score Higher Marks in CBSE Class 10 Mathematics'
    cat      = 'mathematics'
    author   = 'mahendra'
    pub      = '2026-09-04'
    upd      = '2026-09-04'
    excerpt  = 'Moving from passing to scoring well in Class 10 maths is about allocation: which chapters, which steps, and which habits earn the marks.'
    keywords = @('CBSE Class 10 maths marks','score high in class 10 maths','class 10 maths strategy','board exam scoring tips')
    related  = @('how-to-prepare-for-cbse-mathematics-exams','how-to-master-trigonometry-class-10','common-mistakes-in-mathematics-exams','how-to-score-90-plus-in-cbse-class-10-maths')
    cta      = 'Class 10 maths is where structured coaching shows results. The Class 10 Mathematics program at Vyasa Academy in Hulimavu combines weekly tests with personal error review.'
    courses  = @(
      @{ label = 'Class 10 Tuition in Hulimavu'; url = '/class-10-tuition-hulimavu/' },
      @{ label = 'Maths Tuition in Hulimavu'; url = '/maths-tuition-hulimavu/' },
      @{ label = 'CBSE Tuition in Hulimavu'; url = '/cbse-tuition-hulimavu/' }
    )
    body = @(
      @{ t = 'p'; s = @('Class 10 mathematics rewards students who treat the exam as a job of allocation instead of a test of talent.','Every student has limited weeks.','The difference between a 70 and a 95 often comes down to where those weeks went, not how talented the student is.') },
      @{ t = 'h2'; s = 'Study the pattern before studying the syllabus' },
      @{ t = 'p'; s = @('Look at the latest CBSE sample paper and see how the marks are spread across sections and chapters.','Recent papers typically put weight on algebra, geometry, and trigonometry, with shorter chapters like statistics and probability compact in their share.','Check your current year sample paper rather than trusting second-hand summaries.','Mark your strongest chapters in those weighted areas and build from there.') },
      @{ t = 'h2'; s = 'Chapters worth more of your planning' },
      @{ t = 'ul'; i = @('Algebra: linear equations, quadratic equations, and arithmetic progressions reward steady daily practice.','Geometry: triangles, circles, and constructions carry marks that are very achievable with neat figures.','Trigonometry: identities and heights and distances are learnable by pattern, and score reliably.','Coordinate geometry and mensuration reward formula fluency and neat working.','Statistics and probability are compact chapters that protect easy marks.') },
      @{ t = 'h2'; s = 'Present your working like marks depend on it, because they do' },
      @{ t = 'p'; s = @('Method marks are why two students can have different final answers yet similar scores.','Write formulas before substituting, keep one step per line, and state conclusions.','A clean, guided solution earns partial credit even when the very last step slips.') },
      @{ t = 'h2'; s = 'Turn practice into a metric' },
      @{ t = 'p'; s = @('Track three numbers per mock paper: total score, marks lost to slips, and marks lost to not knowing.','Your target each week is to shrink the second number.','The third number tells you where the next study block goes.','Students surprised by how many marks leak to slips usually gain ten points in a month by fixing checking habits alone.') },
      @{ t = 'h2'; s = 'A weekly rhythm that compounds' },
      @{ t = 'ol'; i = @('Monday and Wednesday: 45 minutes of chapter practice focused on your weak list.','Friday: one timed section or a full paper, alternating each week.','Saturday: review the paper with the error log, sorted by cause.','Sunday: five minutes on your formula sheet and a look at next week plan.') },
      @{ t = 'h2'; s = 'The honest summary' },
      @{ t = 'p'; s = @('Higher marks in Class 10 maths come from studying the pattern, weighting your weak chapters, presenting working cleanly, and tracking leaks.','No shortcut replaces the weekly rhythm.','Keep the rhythm honest for two months and your marks will follow.') }
    )
  },

  @{
    slug     = 'how-to-score-better-in-cbse-class-12-mathematics'
    title    = 'How to Score Better in CBSE Class 12 Mathematics'
    cat      = 'mathematics'
    author   = 'mahendra'
    pub      = '2026-09-03'
    upd      = '2026-09-03'
    excerpt  = 'Class 12 maths is scored across many chapters, so organisation beats panic. A chapter plan, step discipline, and full-length rehearsals lift scores.'
    keywords = @('CBSE Class 12 maths','score well in class 12 maths','class 12 board maths strategy','mathematics board preparation')
    related  = @('how-to-prepare-calculus-class-12-cbse','how-to-remember-mathematical-formulas-easily','best-way-to-study-mathematics-for-board-exams','cbse-class-12-board-exam-revision-plan')
    cta      = 'Class 12 maths benefits from consistent coaching with regular tests. The Class 12 Mathematics program at Vyasa Academy in Hulimavu reviews every full-length paper with students.'
    courses  = @(
      @{ label = 'Class 12 Tuition in Hulimavu'; url = '/class-12-tuition-hulimavu/' },
      @{ label = 'Maths Tuition in Hulimavu'; url = '/maths-tuition-hulimavu/' }
    )
    body = @(
      @{ t = 'p'; s = @('Class 12 mathematics spreads its marks across a long list of chapters, so a student who rushes into favourites leaves large sections unguarded.','The secret to a better score is simple on paper: cover more chapters competently than the average student does.','That needs a plan, not talent.') },
      @{ t = 'h2'; s = 'Chapter planning for Class 12 maths' },
      @{ t = 'ul'; i = @('Relations and functions: compact theory, regularly tested.','Matrices and determinants: mechanical but rewarding with neat layout.','Calculus units (continuity, differentiation, integrals, applications, differential equations): the largest share of marks, learn carefully and earlier.','Vectors and three-dimensional geometry: formula-driven and very doable.','Probability: logical and short to revise.','Linear programming: a diagram-based chapter that fetches comfortable marks when drawn neatly.') },
      @{ t = 'p'; s = @('Check the current sample paper for the exact distribution, and plan your weeks around it.','Aim to finish the syllabus one month before the exam so revision never fights new learning.') },
      @{ t = 'h2'; s = 'Step discipline beats answer accuracy' },
      @{ t = 'p'; s = @('In Class 12, derivations and multi-step problems are graded on the journey.','Write the formula or theorem being used before you substitute numbers.','Keep one step per line and label the final result.','A partial solution with visible method earns most of the credit, which is exactly why blanks are expensive.') },
      @{ t = 'h2'; s = 'Make discrete units your easy wins' },
      @{ t = 'p'; s = @('Topics like matrices, vectors, and probability do not build on deep theory, they build on practice.','Two focused weeks on each can convert them into reliable marks.','Most Class 12 students underestimate how much these chapters lift the total when other sections wobble.') },
      @{ t = 'h2'; s = 'Full-length rehearsals from mid-year' },
      @{ t = 'ol'; i = @('From two to three months before boards, solve one full mathematics paper every week.','Alternate previous-year papers and freshly published sample papers.','Mark every lost mark by cause in an error log, then plan the next week around the largest cause.','In the final month, review the formula list daily and redo your worst paper sections from memory.') },
      @{ t = 'h2'; s = 'Balancing KCET and board preparation' },
      @{ t = 'p'; s = @('Many Class 12 students also prepare for KCET.','The good news is they reinforce each other: board practice builds the speed KCET rewards.','Keep the board syllabus primary until the boards are done, then sharpen speed and previous-year KCET practice.','Chasing both at full intensity too early usually weakens both.') },
      @{ t = 'h2'; s = 'The closing note' },
      @{ t = 'p'; s = @('A better Class 12 maths score is an organisational achievement.','Plan the chapters, learn the earlier calculus units first, write visible steps, and rehearse full papers on schedule.','Do that consistently and the board paper stops being unpredictable.') }
    )
  },

  @{
    slug     = 'best-way-to-study-mathematics-for-board-exams'
    title    = 'Best Way to Study Mathematics for Board Exams'
    cat      = 'mathematics'
    author   = 'venu'
    pub      = '2026-09-02'
    upd      = '2026-09-02'
    excerpt  = 'The most effective maths study method is a loop: understand, practise, recall, and test. See how to run that loop across weeks, not just days.'
    keywords = @('how to study maths for boards','best maths study method','effective maths revision','study techniques for board exams')
    related  = @('how-to-prepare-for-cbse-mathematics-exams','how-to-manage-time-in-mathematics-board-exam','how-daily-practice-improves-mathematics-performance','how-to-overcome-fear-of-mathematics')
    cta      = 'Looking for structured Mathematics guidance and regular practice? Explore the Mathematics learning programs at Vyasa Academy in Hulimavu, built around this study loop.'
    courses  = @(
      @{ label = 'Maths Tuition in Hulimavu'; url = '/maths-tuition-hulimavu/' },
      @{ label = 'CBSE Tuition in Hulimavu'; url = '/cbse-tuition-hulimavu/' }
    )
    body = @(
      @{ t = 'p'; s = @('Ask toppers what they actually do and you hear the same loop, repeated: understand a topic, practise it, recall it from memory, and test it under exam conditions.','The method is not mysterious.','What separates strong scores is running that loop for months instead of days.') },
      @{ t = 'h2'; s = 'Stage 1: Understand before you touch a problem' },
      @{ t = 'p'; s = @('Read one section, close the book, and explain the idea in your own words.','If you cannot explain it, you have only seen it.','Write one line under each method: what it is for and where it tends to go wrong.','Understanding keeps later stages fast because memory attaches to meaning.') },
      @{ t = 'h2'; s = 'Stage 2: Practise with the book closed' },
      @{ t = 'p'; s = @('Practising with the example open teaches nothing.','Solve fresh problems from a blank sheet.','Then compare your working with the text and mark exactly where you deviated.','The deviation, not the correct answer, is what you should study.') },
      @{ t = 'h2'; s = 'Stage 3: Recall instead of re-read' },
      @{ t = 'ul'; i = @('After a chapter, write everything you remember on a blank page, method names, formulas, and warnings.','Check only afterwards and add the missing items in a different colour.','Repeat the recall a day later, a week later, and a month later.','This spaced recall is what moves a method from familiar to permanent.') },
      @{ t = 'h2'; s = 'Stage 4: Test in exam conditions' },
      @{ t = 'p'; s = @('Timed practice changes everything.','A 40-minute section solved under the clock exposes where you slow down, panic, or slip.','Do this from a few weeks before the boards, and treat every test as data for the next study block, not as a verdict on your ability.') },
      @{ t = 'h2'; s = 'A realistic weekly schedule using the loop' },
      @{ t = 'ol'; i = @('Monday: understand one new topic with a self-explanation.','Tuesday and Wednesday: practise 20 problems on it, book closed, deviations marked.','Thursday: write the recall page for everything studied this month.','Friday: one timed section covering the week topics.','Saturday: review the test with the error log and queue fixes for next week.') },
      @{ t = 'h2'; s = 'Why rest is part of the method' },
      @{ t = 'p'; s = @('Memory consolidates during sleep, so all-nighters delete the recall stage you worked for.','Keep routines regular, protect seven to eight hours of sleep, and let gaps between reviews do the strengthening.','The best method fails when the student is exhausted.') }
    )
  },

  @{
    slug     = 'how-to-overcome-fear-of-mathematics'
    title    = 'How to Overcome Fear of Mathematics'
    cat      = 'mathematics'
    author   = 'venu'
    pub      = '2026-09-01'
    upd      = '2026-09-01'
    excerpt  = 'Fear of maths shrinks with small, repeated wins, not with a dramatic decision. A practical step-by-step plan for students who dread the subject.'
    keywords = @('overcome maths fear','afraid of maths','math anxiety help','build maths confidence')
    related  = @('why-students-are-afraid-of-mathematics','understanding-concepts-vs-memorising-mathematics','how-to-build-a-study-routine','how-to-improve-mathematics-problem-solving-skills')
    cta      = 'A student who is afraid of maths needs a patient teacher and a small group. The Mathematics batches at Vyasa Academy in Hulimavu are designed for exactly that.'
    courses  = @(
      @{ label = 'Maths Tuition in Hulimavu'; url = '/maths-tuition-hulimavu/' },
      @{ label = 'CBSE Tuition in Hulimavu'; url = '/cbse-tuition-hulimavu/' }
    )
    body = @(
      @{ t = 'p'; s = @('If the sight of a maths problem tightens your chest, this article is for you.','Fear of maths is a learned response, and learned responses can be unlearned.','The strategy that works is not courage, it is a series of small, safe wins that slowly rewrite the association.') },
      @{ t = 'h2'; s = 'Name the exact moment it starts' },
      @{ t = 'p'; s = @('Next time you feel the fear, pause and name it: it starts when you see a word problem, when the timer starts, or when the teacher asks a question you cannot answer.','Finding the trigger turns a fog into a target.','Most students discover their fear is attached to two or three specific situations, not to maths itself.') },
      @{ t = 'h2'; s = 'Rebuild from a level you can win at' },
      @{ t = 'p'; s = @('Go back two chapters, or one, until you find problems you can solve almost every time.','Solve thirty of them.','This is not wasting time; it is restoring the evidence that you can do maths.','Confidence is built from evidence, so create evidence on purpose.') },
      @{ t = 'h2'; s = 'Use the 10-minute start rule' },
      @{ t = 'p'; s = @('Commit to ten minutes of maths with one rule: the phone stays away and the timer is visible.','Most anxious students discover that once they are three minutes in, the dread drops sharply.','The fear lives before you start, not while you are working.') },
      @{ t = 'h2'; s = 'Change how you talk to yourself about it' },
      @{ t = 'ul'; i = @('Replace I cannot do maths with I have not practised this type yet.','Replace I am not a maths person with I am still learning the patterns.','After each session, note one thing that went well, however small.','Ask I got this far, what do I do next instead of why is this so hard.') },
      @{ t = 'h2'; s = 'Manage fear during the exam itself' },
      @{ t = 'p'; s = @('On paper day, start with the questions you are most sure of.','The early wins settle the nervous system before the harder work.','If panic rises, stop for ten seconds, breathe out slowly, and re-read the question into one line.','Then continue.','Anxiety fades far faster when the pen is moving.') },
      @{ t = 'h2'; s = 'What not to do' },
      @{ t = 'p'; s = @('Do not start with the hardest chapter on your first brave day, do not compare your pace to a friend, and do not skip maths for a month and promise to start again after the test.','Small and steady beats brave and rare, every single time.') },
      @{ t = 'h2'; s = 'The practical close' },
      @{ t = 'p'; s = @('Overcoming maths fear is a project you run over weeks, with tiny wins as your building blocks.','Find the trigger, rebuild from an easy level, start with ten minutes, and keep a record of progress.','Give it a month and the association starts to flip.') }
    )
  },

  @{
    slug     = 'how-to-improve-calculation-speed-and-accuracy'
    title    = 'How to Improve Calculation Speed and Accuracy'
    cat      = 'mathematics'
    author   = 'mahendra'
    pub      = '2026-08-31'
    upd      = '2026-08-31'
    excerpt  = 'Fast, accurate calculation is a trained skill, not a gift. A daily ten-minute drill, estimation habits, and neat layout will transform your arithmetic.'
    keywords = @('calculation speed','calculate fast','accuracy in maths','mental arithmetic practice')
    related  = @('how-to-remember-mathematical-formulas-easily','common-mistakes-in-mathematics-exams','how-to-improve-mathematics-problem-solving-skills','10-common-mistakes-in-maths-and-how-to-fix-them')
    cta      = 'Calculation discipline is drilled in the Mathematics batches at Vyasa Academy in Hulimavu. Students practise timed arithmetic weekly until it becomes automatic.'
    courses  = @(
      @{ label = 'Maths Tuition in Hulimavu'; url = '/maths-tuition-hulimavu/' },
      @{ label = 'CBSE Tuition in Hulimavu'; url = '/cbse-tuition-hulimavu/' }
    )
    body = @(
      @{ t = 'p'; s = @('Most students lose far more marks to arithmetic slips than to missing knowledge.','The good news is that speed and accuracy are trainable, like typing or dribbling.','A small daily drill changes both in two to three weeks.','Here is exactly what to practise and how.') },
      @{ t = 'h2'; s = 'The ten-minute daily warm-up' },
      @{ t = 'ol'; i = @('Two minutes: tables up to 20 and squares up to 30, from memory.','Three minutes: vertical addition and subtraction of five-to-six digit numbers, repeated until clean.','Three minutes: one mental multiplication like 34 x 27, plus a division check by working backwards.','Two minutes: mark your slips and redo only the wrong lines.') },
      @{ t = 'p'; s = @('Do this every school day for three weeks.','Do not time to impress; time to measure.','The point is fewer red marks each day.') },
      @{ t = 'h2'; s = 'Estimate before you calculate' },
      @{ t = 'p'; s = @('Rounding once quickly gives a ballpark: 412 x 18 is roughly 400 x 20, so about 8000.','If your exact answer is far from the estimate, a slip happened.','Estimation turns a blind calculation into a checked one, and it is the fastest accuracy habit there is.') },
      @{ t = 'h2'; s = 'Layout is a calculation tool' },
      @{ t = 'p'; s = @('Most serious slips come from cramped, chaotic working.','Write digits in clear columns, align place values, and keep carry digits small but legible.','A neat vertical layout surfaces errors quickly when you re-check, and re-checking becomes fast because you can follow your own trail.') },
      @{ t = 'h2'; s = 'Check by working backwards' },
      @{ t = 'ul'; i = @('Addition: subtract the smaller addend from the total.','Multiplication: divide the product by one factor.','Division: multiply the quotient by the divisor and add the remainder.','Percentage: recompute one part mentally with simpler numbers.') },
      @{ t = 'h2'; s = 'Watch the common slip points' },
      @{ t = 'p'; s = @('Carries after a zero, decimal point placement, and signs in subtraction top the list.','Create a personal slip list and read it for ten seconds before every practice session.','Predicting your own weak points makes you slow enough to catch them.') },
      @{ t = 'h2'; s = 'The honest result' },
      @{ t = 'p'; s = @('You will not double your speed in a week, and you do not need to.','A ten-minute daily drill, estimation before every calculation, and clean layout will quietly lift both speed and accuracy.','Keep the habit through the exam and the paper feels lighter.') }
    )
  },

  @{
    slug     = 'how-to-remember-mathematical-formulas'
    title    = 'How to Remember Mathematical Formulas Easily'
    cat      = 'mathematics'
    author   = 'venu'
    pub      = '2026-08-30'
    upd      = '2026-08-30'
    excerpt  = 'Formulas stick when they make sense, come with a story, and are recalled often. A practical system for formula retention that beats rereading.'
    keywords = @('remember maths formulas','formula memorisation','maths formula sheet','how to memorise formulas')
    related  = @('how-to-master-trigonometry-class-10','how-to-prepare-calculus-class-12-cbse','how-to-improve-calculation-speed-and-accuracy','understanding-concepts-vs-memorising-mathematics')
    cta      = 'Formula recall is exercised systematically in Mathematics coaching at Vyasa Academy in Hulimavu, with periodic formula tests before every major board practice.'
    courses  = @(
      @{ label = 'Maths Tuition in Hulimavu'; url = '/maths-tuition-hulimavu/' },
      @{ label = 'CBSE Tuition in Hulimavu'; url = '/cbse-tuition-hulimavu/' }
    )
    body = @(
      @{ t = 'p'; s = @('Students treat formulas as a list to memorise, which is exactly why they forget them.','A formula that is understood, given a memory hook, and recalled on schedule stays for months.','Here is the system, starting with the most important step.') },
      @{ t = 'h2'; s = 'Understand the formula before you trust it' },
      @{ t = 'p'; s = @('Every formula describes a relationship.','Area is length times breadth because a rectangle fills with unit squares; distance is speed times time because you travel your speed once per hour.','Spend two minutes making each formula make sense and the memorising is half done.','A formula you can derive or explain is nearly impossible to forget.') },
      @{ t = 'h2'; s = 'Attach a small personal hook' },
      @{ t = 'p'; s = @('Where meaning does not hold, use a story.','For the trigonometric table, a mnemonic with the sines and cosines arranged in halves of square roots at standard angles.','The sillier the hook, the easier it stays.','Invent your own, because your own hooks are the strongest.') },
      @{ t = 'h2'; s = 'Build a live formula sheet' },
      @{ t = 'ul'; i = @('Keep one running page per subject with every formula you meet, written by hand.','Next to each, write one line: what it does and the classic mistake around it.','Add formulas as you learn them and cross out nothing from earlier.','Review the whole sheet for five minutes daily in the final month.') },
      @{ t = 'h2'; s = 'Recall, do not reread' },
      @{ t = 'p'; s = @('Cover the sheet and write every formula you can from memory.','Then compare and highlight only the gaps.','A reread feels productive and stores little; a recall session feels harder and stores much more.','Run this recall the evening you learn a formula, then every three days, then weekly.') },
      @{ t = 'h2'; s = 'Use the unit to check yourself' },
      @{ t = 'p'; s = @('Dimensions are a built-in alarm.','If you are not sure whether volume is length squared or cubed, look at the unit: volume is cubic, so the formula must combine three length factors.','Students who check formulas by their units make almost no wrong-choice errors.') },
      @{ t = 'h2'; s = 'Practise retrieval under time' },
      @{ t = 'p'; s = @('In the weeks before exams, quiz yourself: give the formula sheet to a study partner or set a two-minute timer for a chapter list.','Formulas recalled under gentle time pressure are the ones that survive the board hall.') },
      @{ t = 'h2'; s = 'Closing thought' },
      @{ t = 'p'; s = @('Formula memory is a system of understand, hook, sheet, and recall.','Run the four steps together and you stop depending on luck, because the formulas live in your head, not in the book.') }
    )
  },

  @{
    slug     = 'how-daily-practice-improves-mathematics-performance'
    title    = 'How Daily Practice Improves Mathematics Performance'
    cat      = 'mathematics'
    author   = 'mahendra'
    pub      = '2026-08-29'
    upd      = '2026-08-29'
    excerpt  = 'Thirty focused minutes every day beats a heroic weekend session. Here is how daily practice changes memory, speed, and confidence in mathematics.'
    keywords = @('daily maths practice','mathematics practice routine','why daily practice matters','maths habit building')
    related  = @('how-to-improve-mathematics-problem-solving-skills','how-to-improve-calculation-speed-and-accuracy','best-way-to-study-mathematics-for-board-exams','how-to-build-a-study-routine')
    cta      = 'Daily practice works best with the right problems and feedback. The Mathematics batches at Vyasa Academy in Hulimavu give students a structured daily practice routine.'
    courses  = @(
      @{ label = 'Maths Tuition in Hulimavu'; url = '/maths-tuition-hulimavu/' },
      @{ label = 'Class 10 Tuition in Hulimavu'; url = '/class-10-tuition-hulimavu/' }
    )
    body = @(
      @{ t = 'p'; s = @('If a student revises maths for five hours on Sunday and not at all the rest of the week, the brain treats Monday as a fresh start.','Daily practice works because it uses the way memory actually consolidates: in small doses with sleep in between.','The maths itself is secondary; the rhythm is the method.') },
      @{ t = 'h2'; s = 'What daily practice changes' },
      @{ t = 'ul'; i = @('Memory: revisiting a method within 24 hours moves it into long-term storage.','Speed: arithmetic and formula recall become automatic with repetition.','Confidence: small daily successes replace exam-week panic.','Mistake visibility: slips that used to hide for a week get caught the same day.','Stamina: the brain learns to hold focus on maths for a stretch, which is what a paper demands.') },
      @{ t = 'h2'; s = 'A realistic 30-minute daily block' },
      @{ t = 'ol'; i = @('Minutes 1-5: five quick review problems from the error log or formula sheet recall.','Minutes 6-20: fifteen minutes on the current chapter, ten problems is ideal.','Minutes 21-25: three problems from a previous chapter to fight forgetting.','Minutes 26-30: mark today line in a practice log: date, topic, problems done, slips found.') },
      @{ t = 'p'; s = @('Thirty minutes done every school day is about two and a half hours of good practice a week, distributed for memory instead of dumped for show.') },
      @{ t = 'h2'; s = 'Why the practice log matters' },
      @{ t = 'p'; s = @('A log turns practice into data.','After three weeks you can see which topics are still leaking marks, which slips keep repeating, and whether the rhythm actually happened.','Students who keep the log find their own improvement visible, and visible improvement is what keeps the habit alive.') },
      @{ t = 'h2'; s = 'How to keep the habit from dying' },
      @{ t = 'p'; s = @('Anchor the block to a fixed trigger: right after dinner, or right after returning home.','If a day is genuinely overloaded, shrink the block to ten minutes instead of skipping it.','Consistency is the habit; the minutes are negotiable.','Never let a full miss become two, because two misses are the beginning of the story you are trying to avoid.') },
      @{ t = 'h2'; s = 'The midpoint check' },
      @{ t = 'p'; s = @('After two weeks of steady daily practice, most students report that maths feels more predictable.','That is the memory system working.','Keep going and the same effect shows up on the paper itself.') }
    )
  },

  @{
    slug     = 'how-to-master-trigonometry-class-10'
    title    = 'How to Master Trigonometry for Class 10'
    cat      = 'mathematics'
    author   = 'venu'
    pub      = '2026-08-28'
    upd      = '2026-08-28'
    excerpt  = 'Trigonometry in Class 10 is learnable by pattern: three ratios, a table of standard angles, and a few identities. Here is the method that works.'
    keywords = @('CBSE Class 10 trigonometry','trigonometry class 10','learn trigonometry easily','trigonometric identities class 10')
    related  = @('how-to-score-higher-marks-in-cbse-class-10-mathematics','how-to-remember-mathematical-formulas-easily','how-to-prepare-for-cbse-mathematics-exams','how-to-score-90-plus-in-cbse-class-10-maths')
    cta      = 'Trigonometry is one of the highest-weightage Class 10 chapters and very coachable. The Class 10 Mathematics program at Vyasa Academy in Hulimavu drills it to mastery.'
    courses  = @(
      @{ label = 'Class 10 Tuition in Hulimavu'; url = '/class-10-tuition-hulimavu/' },
      @{ label = 'Maths Tuition in Hulimavu'; url = '/maths-tuition-hulimavu/' }
    )
    body = @(
      @{ t = 'p'; s = @('Trigonometry looks like a wall of new words until you notice how small the toolkit is.','Class 10 trigonometry rests on three ratios, one table, and a small set of identities derived from definitions.','Master those pieces in order and the chapter turns into pattern practice.') },
      @{ t = 'h2'; s = 'Start from a right triangle, not from memory' },
      @{ t = 'p'; s = @('Draw a right triangle and label an acute angle theta.','Sine is opposite over hypotenuse, cosine is adjacent over hypotenuse, tangent is opposite over adjacent.','Practise reading these off three different triangles until it is automatic.','Never write a trigonometric value you could not picture in a triangle.') },
      @{ t = 'h2'; s = 'Learn the standard angle table by step' },
      @{ t = 'p'; s = @('The values for 0, 30, 45, 60 and 90 degrees can be learned through the familiar pattern of square roots of 0, 1, 2, 3 and 4 over 2 for sine, descending for cosine, and their ratios for tangent.','Check the table in your textbook and reproduce it from memory, then verify a few values against an actual triangle.','Do not memorise rows blindly; each entry should make sense.') },
      @{ t = 'h2'; s = 'Identities: start from the definitions' },
      @{ t = 'p'; s = @('The basic identities are conventions, not mysteries: sine and cosine combine through the Pythagorean idea, and tangent is sine over cosine.','When a question asks you to prove an identity, convert everything to sines and cosines first, then simplify.','Most Class 10 identity problems collapse that way within four or five lines.') },
      @{ t = 'h2'; s = 'A practice pattern for heights and distances' },
      @{ t = 'ol'; i = @('Draw the situation from the question and mark the angle and the distance given.','Choose the ratio that connects the side you have with the side you need.','Substitute the standard value for the angle.','Solve and write the final statement in a sentence with the unit.') },
      @{ t = 'p'; s = @('The common trap is picking the wrong ratio.','Label opposite, adjacent, and hypotenuse on your figure first and the right choice stops being a guess.') },
      @{ t = 'h2'; s = 'A quick daily drill' },
      @{ t = 'ul'; i = @('Tonight and tomorrow: write the standard table from memory twice a day.','Then: simplify 5 identity problems by converting to sines and cosines.','Then: solve three heights-and-distances past paper questions with full figures.','Finally: one full exercise from the chapter, timed at 45 minutes.') },
      @{ t = 'h2'; s = 'The wrap up' },
      @{ t = 'p'; s = @('Trigonometry rewards students who go back to the triangle every time they are stuck.','Learn the three ratios from pictures, reproduce the table, and reduce identity proofs to sines and cosines.','Do that and the chapter stops being scary and starts being marks.') }
    )
  },

  @{
    slug     = 'how-to-prepare-calculus-class-12-cbse'
    title    = 'How to Prepare Calculus for Class 12 CBSE'
    cat      = 'mathematics'
    author   = 'mahendra'
    pub      = '2026-08-27'
    upd      = '2026-08-27'
    excerpt  = 'Calculus carries a large share of Class 12 maths marks. Build it in order: derivatives first, then integration, then applications and differential equations.'
    keywords = @('Class 12 calculus preparation','CBSE calculus','integration class 12','differentiation class 12','differential equations class 12')
    related  = @('how-to-score-better-in-cbse-class-12-mathematics','how-to-remember-mathematical-formulas-easily','how-to-improve-mathematics-problem-solving-skills','cbse-class-12-board-exam-revision-plan')
    cta      = 'Calculus is the biggest Class 12 maths contributor, and it is highly coachable. The Class 12 Mathematics program at Vyasa Academy in Hulimavu walks students through it step by step.'
    courses  = @(
      @{ label = 'Class 12 Tuition in Hulimavu'; url = '/class-12-tuition-hulimavu/' },
      @{ label = 'Maths Tuition in Hulimavu'; url = '/maths-tuition-hulimavu/' }
    )
    body = @(
      @{ t = 'p'; s = @('In most recent Class 12 papers, calculus units account for a large share of the mathematics marks.','That makes preparation order matter: work through differentiation fluently before integration, because integration leans on it.','Here is how to structure the whole block.') },
      @{ t = 'h2'; s = 'Own differentiation before anything else' },
      @{ t = 'p'; s = @('Build automatic differentiation of algebraic, trigonometric, exponential, and logarithmic functions.','Practise chain, product, and quotient rules until you can apply the right rule without hesitation.','Differentiation is the engine of calculus, and every later unit rewards this fluency.') },
      @{ t = 'h2'; s = 'Build a technique bank for integration' },
      @{ t = 'ol'; i = @('Direct standard integrals first: get familiar with the basic list in the syllabus.','Substitution: learn the patterns that signal it, such as recognising a function and its derivative together.','By parts: practise the standard choices like logarithmic before algebraic before exponential.','Partial fractions and trigonometric identities: learn when the structure signals them.') },
      @{ t = 'p'; s = @('Keep an integration playbook: for each technique, one example problem that shows the signal for using it.','When you are stuck on a question in the exam, scan the signals to pick the technique.') },
      @{ t = 'h2'; s = 'Applications turn theory into marks' },
      @{ t = 'p'; s = @('Application of derivatives covers rate of change, increasing and decreasing behaviour, and maxima and minima, most of which become easy once differentiation is fluent.','Application of integrals involves finding areas between curves, heavily dependent on neat diagrams and correct limits.','Practise the figure first for every area problem, and the limits are far harder to get wrong.') },
      @{ t = 'h2'; s = 'Differential equations: pattern and practice' },
      @{ t = 'p'; s = @('Separable variables, homogeneous, and linear differential equations are each a small repeated procedure.','Practise ten of each type and the chapter becomes more mechanical than any other in calculus.','Write the standard form before you start so you know which pattern you are applying.') },
      @{ t = 'h2'; s = 'The final weeks for calculus' },
      @{ t = 'ul'; i = @('Redo your differentiation rules and integration playbook from memory twice a week.','Solve two full differentiation and two full integration exercises under a timer.','Mark every slip by cause and redo only the patterns that gave trouble.','Leave no blank in a mock: a written partial attempt earns method marks.') },
      @{ t = 'h2'; s = 'The summary' },
      @{ t = 'p'; s = @('Calculus rewards orderly preparation: fluent differentiation, a written technique bank for integration, diagrams for applications, and pattern practice for differential equations.','Follow that order, practise on schedule, and calculus becomes the strongest part of the paper.') }
    )
  },

  @{
    slug     = 'how-to-manage-time-in-mathematics-board-exam'
    title    = 'How to Manage Time in a Mathematics Board Exam'
    cat      = 'mathematics'
    author   = 'mahendra'
    pub      = '2026-08-26'
    upd      = '2026-08-26'
    excerpt  = 'Maths papers are lost to poor pacing before they are lost to hard questions. A simple time budget and first-pass strategy protects every section.'
    keywords = @('time management in maths exam','board exam time allocation','how to pace maths paper','exam timing strategy')
    related  = @('how-to-prepare-for-cbse-mathematics-exams','common-mistakes-in-mathematics-exams','how-to-score-higher-marks-in-cbse-class-10-mathematics','how-to-score-better-in-cbse-class-12-mathematics')
    cta      = 'Pacing is practised in every mock paper at Vyasa Academy in Hulimavu. The Mathematics batches rehearse the exact time budget until students finish calm and on time.'
    courses  = @(
      @{ label = 'Maths Tuition in Hulimavu'; url = '/maths-tuition-hulimavu/' },
      @{ label = 'CBSE Tuition in Hulimavu'; url = '/cbse-tuition-hulimavu/' }
    )
    body = @(
      @{ t = 'p'; s = @('Almost every student who runs out of time in a maths paper lost the time to pacing, not to difficulty.','They spent twenty minutes on a question worth four marks and then rushed the easy ones.','A simple budget fixed before the exam solves this.') },
      @{ t = 'h2'; s = 'Budget minutes by marks, not by order' },
      @{ t = 'p'; s = @('Count only the minutes you allocate, about one and a half minutes per mark for the working time left after setting aside a buffer.','Write your budget on the cover page: section A by the clock, section B by the clock, and so on.','The budget is not optional advice; it is the plan you created when calm, and calm plans beat panicked choices.') },
      @{ t = 'h2'; s = 'Three passes through the paper' },
      @{ t = 'ol'; i = @('First pass: answer everything you know immediately.','Second pass: attempt everything you know you can do with some work, with method visible.','Third pass: attempt the remaining questions with partial working, then use the leftover minutes to check signs.') },
      @{ t = 'p'; s = @('The first pass banks easy marks early, which settles nerves and guarantees a floor score.','Most time disasters come from treating questions in printed order.') },
      @{ t = 'h2'; s = 'A hard limit per question' },
      @{ t = 'p'; s = @('Set a personal red line: if a question has eaten its marks-worth of minutes, mark it and move on.','You can return after the first pass, when the mind is freer and the easy marks are safe.','Students who obey the red line finish more of the paper almost every time.') },
      @{ t = 'h2'; s = 'Leave a buffer to check like an examiner' },
      @{ t = 'ul'; i = @('Reserve the last five minutes for sign and bracket scanning across the whole paper.','Spot-check one reworked answer to confirm the method, not the arithmetic.','Verify units and final statements on word problems.','A tidy paper scans fast, which is why neat layout returns time on the final pass.') },
      @{ t = 'h2'; s = 'Train the budget in mocks' },
      @{ t = 'p'; s = @('A budget written on paper day but never practised is just hope.','Run it in every mock: write the budget, follow the passes, obey the red line.','Within three mocks the routine becomes automatic, and the real exam feels like another rehearsal.') },
      @{ t = 'h2'; s = 'The bottom line' },
      @{ t = 'p'; s = @('Time in a maths paper is a resource you allocate, in advance, calmly.','Budget by marks, run three passes, respect the red line, and check like an examiner in the final minutes.','Do those and the paper finishes you instead of the other way around.') }
    )
  },

  @{
    slug     = 'understanding-concepts-vs-memorising-mathematics'
    title    = 'Understanding Concepts vs Memorising Mathematics'
    cat      = 'mathematics'
    author   = 'venu'
    pub      = '2026-08-25'
    upd      = '2026-08-25'
    excerpt  = 'Memory and understanding are not enemies in maths, but they are not equal either. Learn when each works, and how to tell which one you are using.'
    keywords = @('maths concepts vs memorisation','understand mathematics','deep learning maths','rote learning maths')
    related  = @('why-students-are-afraid-of-mathematics','how-to-overcome-fear-of-mathematics','how-to-remember-mathematical-formulas-easily','how-to-improve-mathematics-problem-solving-skills')
    cta      = 'Concept-first teaching is the core of Mathematics coaching at Vyasa Academy in Hulimavu. Students learn the why before the how, and the how becomes permanent.'
    courses  = @(
      @{ label = 'Maths Tuition in Hulimavu'; url = '/maths-tuition-hulimavu/' },
      @{ label = 'CBSE Tuition in Hulimavu'; url = '/cbse-tuition-hulimavu/' }
    )
    body = @(
      @{ t = 'p'; s = @('Students often ask whether maths should be memorised or understood, as if they were rivals.','They are not rivals.','Memory is the tape that holds a method in place; understanding is the map that tells you when to use it.','The trouble starts only when the tape has no map.') },
      @{ t = 'h2'; s = 'What memorisation is actually good at' },
      @{ t = 'ul'; i = @('Multiplication tables, squares, cubes and standard angle values: learned by heart, used instantly.','Standard formulas whose derivation is time-consuming: memorised with a hook, verified once.','Exam formats like steps for constructing a geometry figure: rehearsed exactly.','Common definitions in exact words: learned deliberately.') },
      @{ t = 'h2'; s = 'Where memorisation alone fails' },
      @{ t = 'p'; s = @('The failing moment is the unfamiliar question.','A memorised student has methods but no way to choose between them, so a small variation in a word problem creates a blank page.','The examiner who wrote the paper assumes the student understands, and understanding is the only thing a fresh question can test.') },
      @{ t = 'h2'; s = 'Three ways to build real understanding' },
      @{ t = 'h3'; s = 'Explain the why once' },
      @{ t = 'p'; s = @('When you meet a new formula, spend two minutes on why it works.','Area of a triangle is half the rectangle because two triangles tile the rectangle.','Negative times negative is positive can be reasoned from opposites on a number line.','One paragraph of why removes pages of later confusion.') },
      @{ t = 'h3'; s = 'Test with change, not repetition' },
      @{ t = 'p'; s = @('If you can solve a problem, change something: turn a number into a variable, swap the known and unknown, reverse the question.','A student who can ride those changes has understanding; a student who cannot has only the template.') },
      @{ t = 'h3'; s = 'Teach it back' },
      @{ t = 'p'; s = @('Explain the method aloud to a study partner, a sibling, or a wall.','Understanding appears at the moment you can teach it, and gaps appear at the exact sentence where you stall.','The stall is the learning point.') },
      @{ t = 'h2'; s = 'A healthy mix that works' },
      @{ t = 'ol'; i = @('Memorise the small building blocks: tables, squares, standard values.','Understand the relationships: why formulas exist and when they apply.','Memorise the exam routine around the understanding: the layout, the two-step checking, the time budget.','Refresh recall on a schedule so the map never fades.') },
      @{ t = 'h2'; s = 'How to tell which one you have' },
      @{ t = 'p'; s = @('Open the book, close it, and attempt a problem that was not assigned as homework.','If you breeze through because you know what to do next, you understand.','If you stall until you peek at the answer, you were memorising.','That honest test will tell you exactly which chapter needs the why-step next.') },
      @{ t = 'h2'; s = 'The concluding advice' },
      @{ t = 'p'; s = @('Use memory as the tape and understanding as the map, and the two work together.','Commit the tables and routines to memory, invest two minutes in every why, and test yourself with changed problems.','That balance is what turns mathematics from a list into a skill.') }
    )
  }
)