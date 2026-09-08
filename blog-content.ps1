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
  }
)