/* ============================================================
   Vyasa Academy Assistant - Knowledge Base
   ------------------------------------------------------------
   Single source of truth for the chatbot's deterministic
   answers. UMD module: works in the browser (window.VyasaChatbotKB)
   and in Node (module.exports) so the frontend fallback and the
   server-side API share the same verified content.

   Every fact below is taken from the Vyasa Academy website
   (index.html, study-data.json, indexable-urls.txt). Nothing is
   invented. Fee, results, ratings, reviews and guarantees are
   intentionally NOT present and resolve to a contact prompt.
   ============================================================ */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.VyasaChatbotKB = factory();
  }
}(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* ---------- Verified academy facts ---------- */
  var FACTS = {
    name: "Vyasa Academy",
    tagline: "Learn \u2022 Understand \u2022 Excel",
    founded: "2020",
    location: "53/2D, Vyasa Academy, Raghavendra Layout, Hulimavu, Bangalore - 560076",
    phone: "+91 94949 01006",
    whatsappLink: "https://wa.me/919494901006",
    email: "vyasacareeracademy@gmail.com",
    hours: "Monday - Saturday, 4:00 PM - 9:00 PM",
    classes: "Class 6 to Class 12 (VI - XII)",
    boards: "CBSE and ICSE (also PU, KCET and Olympiad coaching)",
    subjects: "Mathematics, Physics, Chemistry, Biology and Science",
    streams: "Science, Commerce and Humanities",
    areasServed: ["Hulimavu", "Bilekahalli", "MICO Layout", "JP Nagar", "Arekere", "Bannerghatta Road", "Bangalore"],
    facultyShort: "Mahendra Babu Chennupati (Founder, Mathematics, 10+ years), Venu Chennupati (Co-Founder, JEE Mathematics), and a dedicated Chemistry, Biology, Physics and Mathematics faculty."
  };

  var CLASS10_MATHS = {
    slug: "class-10",
    subject: "mathematics",
    chapters: [
      { slug: "real-numbers", label: "Real Numbers" },
      { slug: "polynomials", label: "Polynomials" },
      { slug: "pair-of-linear-equations-in-two-variables", label: "Pair of Linear Equations in Two Variables" },
      { slug: "quadratic-equations", label: "Quadratic Equations" },
      { slug: "arithmetic-progressions", label: "Arithmetic Progressions" },
      { slug: "triangles", label: "Triangles" },
      { slug: "coordinate-geometry", label: "Coordinate Geometry" },
      { slug: "introduction-to-trigonometry", label: "Introduction to Trigonometry" },
      { slug: "some-applications-of-trigonometry", label: "Some Applications of Trigonometry" },
      { slug: "circles", label: "Circles" },
      { slug: "areas-related-to-circles", label: "Areas Related to Circles" },
      { slug: "surface-areas-and-volumes", label: "Surface Areas and Volumes" },
      { slug: "statistics", label: "Statistics" },
      { slug: "probability", label: "Probability" }
    ]
  };

  var CLASS10_SCIENCE = {
    slug: "class-10",
    subject: "science",
    chapters: [
      { slug: "chemical-reactions-and-equations", label: "Chemical Reactions and Equations" },
      { slug: "acids-bases-and-salts", label: "Acids, Bases and Salts" },
      { slug: "metals-and-non-metals", label: "Metals and Non-metals" },
      { slug: "carbon-and-its-compounds", label: "Carbon and its Compounds" },
      { slug: "life-processes", label: "Life Processes" },
      { slug: "control-and-coordination", label: "Control and Coordination" },
      { slug: "how-do-organisms-reproduce", label: "How do Organisms Reproduce?" },
      { slug: "heredity", label: "Heredity" },
      { slug: "light-reflection-and-refraction", label: "Light - Reflection and Refraction" },
      { slug: "the-human-eye-and-the-colourful-world", label: "The Human Eye and the Colourful World" },
      { slug: "electricity", label: "Electricity" },
      { slug: "magnetic-effects-of-electric-current", label: "Magnetic Effects of Electric Current" },
      { slug: "our-environment", label: "Our Environment" }
    ]
  };

  /* ---------- Available (real-content) resources per Class 10 chapter.
     Derived from indexable-urls.txt - do not add an entry unless the
     built page is truly indexable content. ---------- */
  var AVAILABLE = {
    "real-numbers": ["notes", "practice-paper", "quiz", "test"],
    "polynomials": ["notes", "practice-paper", "quiz", "test"],
    "pair-of-linear-equations-in-two-variables": ["notes", "practice-paper", "quiz", "test"],
    "quadratic-equations": ["notes", "practice-paper", "quiz", "test"],
    "arithmetic-progressions": ["notes", "quiz"],
    "triangles": ["notes", "quiz", "test"],
    "coordinate-geometry": ["notes", "quiz"],
    "introduction-to-trigonometry": ["notes", "quiz"],
    "some-applications-of-trigonometry": ["quiz"]
  };

  var AVAILABLE_SCIENCE = {
    "chemical-reactions-and-equations": ["notes"],
    "acids-bases-and-salts": ["notes"],
    "metals-and-non-metals": ["notes"],
    "carbon-and-its-compounds": ["notes"],
    "life-processes": ["notes"],
    "control-and-coordination": ["notes"],
    "how-do-organisms-reproduce": ["notes"],
    "heredity": ["notes"],
    "light-reflection-and-refraction": ["notes"],
    "the-human-eye-and-the-colourful-world": ["notes"],
    "electricity": ["notes"],
    "magnetic-effects-of-electric-current": ["notes"],
    "our-environment": ["notes"]
  };

  var RESOURCE_LABELS = {
    "notes": "Notes",
    "practice-paper": "Practice Paper",
    "quiz": "Quiz",
    "test": "Chapter Test"
  };

  var LINK = {
    home: "https://www.vyasaacademy.in/",
    sm: "https://www.vyasaacademy.in/cbse-study-material/",
    maths: "https://www.vyasaacademy.in/cbse-study-material/class-10/mathematics/",
    science: "https://www.vyasaacademy.in/cbse-study-material/class-10/science/",
    blogMaths: "https://www.vyasaacademy.in/blog/mathematics/",
    blogScience: "https://www.vyasaacademy.in/blog/science/"
  };

  function chapterLink(class10, chapterSlug) {
    return "https://www.vyasaacademy.in/cbse-study-material/class-10/" + class10.subject + "/" + chapterSlug + "/";
  }
  function chapterResourceLink(class10, chapterSlug, resSlug) {
    return chapterLink(class10, chapterSlug) + resSlug + "/";
  }

  function chapterSearchMap(mathsChapters, scienceChapters) {
    var map = {};
    for (var i = 0; i < mathsChapters.length; i++) {
      var c = mathsChapters[i];
      map[c.slug] = { slug: c.slug, label: c.label, subject: "maths", class10: CLASS10_MATHS };
    }
    for (var j = 0; j < scienceChapters.length; j++) {
      var s = scienceChapters[j];
      map[s.slug] = { slug: s.slug, label: s.label, subject: "science", class10: CLASS10_SCIENCE };
    }
    return map;
  }
  var CHAPTER_INDEX = chapterSearchMap(CLASS10_MATHS.chapters, CLASS10_SCIENCE.chapters);

  /* ---------- URL fragment for a found chapter ---------- */
  function findChapter(q) {
    var keys = Object.keys(CHAPTER_INDEX);
    for (var i = 0; i < keys.length; i++) {
      var slug = keys[i];
      var info = CHAPTER_INDEX[slug];
      var label = info.label.toLowerCase();
      var cooked = label.replace(/[^a-z0-9]+/g, " ");
      var spacing = label.split(" ").join(" ");
      if (q.indexOf(label) !== -1 || (label.length > 8 && q.indexOf(spacing) !== -1) || q.indexOf(cooked) !== -1) {
        return { info: info };
      }
      var words = label.split(" ");
      if (words.length > 1 && q.indexOf(words.join(" ")) !== -1) return { info: info };
    }
    return null;
  }

  function resourceSentence(class10, chapterSlug, availableMap) {
    var avail = availableMap[chapterSlug] || [];
    if (!avail.length) {
      return "Study resources are being added for this chapter. You can still visit the chapter page: " + chapterLink(class10, chapterSlug);
    }
    var parts = [];
    for (var i = 0; i < avail.length; i++) {
      parts.push(RESOURCE_LABELS[avail[i]] + " (" + chapterResourceLink(class10, chapterSlug, avail[i]) + ")");
    }
    return "Available now: " + parts.join(", ") + ". You can also open the chapter page: " + chapterLink(class10, chapterSlug);
  }

  /* ---------- Academic explainers (Class 10 level) ---------- */
  var TOPICS = {
    ap: {
      title: "Arithmetic Progressions (AP)",
      summary: "An arithmetic progression is a sequence in which the difference between any two consecutive terms is constant. That fixed difference is called the common difference (d). The nth term is a + (n - 1)d and the sum of the first n terms is n/2 [2a + (n - 1)d], where a is the first term.",
      example: "Example: 2, 5, 8, 11, 14 is an AP with first term 2 and common difference 3. The 10th term = 2 + (10 - 1) x 3 = 29. Try writing the first 6 terms of an AP with a = 5 and d = 4, then check the chapter notes.",
      link: "https://www.vyasaacademy.in/cbse-study-material/class-10/mathematics/arithmetic-progressions/",
      suggest: "You can practise this in the Arithmetic Progressions study material (notes and quiz): https://www.vyasaacademy.in/cbse-study-material/class-10/mathematics/arithmetic-progressions/"
    },
    quadratic: {
      title: "Quadratic Equations",
      summary: "A quadratic equation is of the form ax2 + bx + c = 0 where a, b and c are real numbers and a is not 0. You can solve it by factorisation or with the quadratic formula: x = [-b +- sqrt(b2 - 4ac)] / 2a. The expression b2 - 4ac is the discriminant: if it is positive there are two distinct real roots, if zero the roots are equal, and if negative there are no real roots.",
      example: "Example: solve x2 - 5x + 6 = 0. It factorises as (x - 2)(x - 3) = 0, so x = 2 or x = 3. Check by substituting each value back into the equation.",
      link: "https://www.vyasaacademy.in/cbse-study-material/class-10/mathematics/quadratic-equations/",
      suggest: "Practise more with the Quadratic Equations resources on the site: https://www.vyasaacademy.in/cbse-study-material/class-10/mathematics/quadratic-equations/"
    },
    distance: {
      title: "Distance Formula",
      summary: "The distance between two points A(x1, y1) and B(x2, y2) is given by sqrt((x2 - x1)2 + (y2 - y1)2). It comes straight from the Pythagoras theorem applied to the right triangle formed by the points in the coordinate plane.",
      example: "Example: distance between A(1, 2) and B(4, 6) = sqrt((4 - 1)2 + (6 - 2)2) = sqrt(9 + 16) = 5 units.",
      link: "https://www.vyasaacademy.in/cbse-study-material/class-10/mathematics/coordinate-geometry/",
      suggest: "This is part of Coordinate Geometry. Notes and a quiz are available here: https://www.vyasaacademy.in/cbse-study-material/class-10/mathematics/coordinate-geometry/"
    },
    elevation: {
      title: "Angle of Elevation and Depression",
      summary: "When you look up at an object, the angle between the horizontal line of sight and the line to the object is the angle of elevation. When you look down, it is the angle of depression. These are used with trigonometric ratios, most often tan = opposite/adjacent, to find heights and horizontal distances.",
      example: "Example: if the angle of elevation of a tower is 45 degrees when viewed from a point 20 m away, then tan 45 degrees = height / 20, so height = 20 m.",
      link: "https://www.vyasaacademy.in/cbse-study-material/class-10/mathematics/some-applications-of-trigonometry/",
      suggest: "This is the core of Some Applications of Trigonometry. There is a quiz with verified CBSE questions here: https://www.vyasaacademy.in/cbse-study-material/class-10/mathematics/some-applications-of-trigonometry/quiz/"
    }
  };

  var FOLLOW_UP_PATTERNS = [
    /example/, /give me an example/, /show me an example/, /more detail/, /tell me more/, /explain further/, /elaborate/, /can you elaborate/, /what about it/, /could you explain/, /explain more/
  ];

  /* ---------- Intent list (checked in order) ---------- */
  var INTENTS = [
    {
      id: "greet",
      keywords: [/^hi\b/, /^hello\b/, /^hey\b/, /greetings/, /^namaste/, /good morning/, /good afternoon/, /good evening/],
      make: function () {
        return {
          text: "Hello! I am the Vyasa Academy Assistant. Ask me about our classes (VI - XII), subjects (Mathematics, Physics, Chemistry, Biology and Science), admissions, contact details, or the free CBSE study material on our website. How can I help?",
          topic: null
        };
      }
    },
    {
      id: "classes",
      keywords: [/what classes/, /which classes/, /classes do you offer/, /classes offered/, /what classes do you teach/, /grades do you teach/, /standards do you teach/, /do you teach class/, /which standards/, /which grades/, /what standards/, /what grades/, /classes (6|vi|six).*(12|xii|twelve)/, /6 to 12/, /vi to xii/],
      make: function () {
        return {
          text: "Vyasa Academy offers tuition for Classes 6 to 12 (VI - XII) for CBSE and ICSE. Courses are split into Foundation (VI - VIII), Board Preparation (IX - X) and Advanced (XI - XII) batches, and we also provide KCET and Olympiad coaching. Tree-structured CBSE study material (notes, practice papers, quizzes and chapter tests) is free on our website for Classes 6 to 12: https://www.vyasaacademy.in/cbse-study-material/",
          topic: null
        };
      }
    },
    {
      id: "subjects",
      keywords: [/what subjects/, /which subjects/, /subjects do you teach/, /subjects offered/, /subjects you cover/, /what do you teach/, /do you teach maths/, /physics|chemistry|biology/, /do you teach science/],
      make: function () {
        return {
          text: "We teach Mathematics, Physics, Chemistry, Biology and Science for CBSE and ICSE students from Class 6 to Class 12, with KCET and Olympiad coaching. The website also offers chapter-wise CBSE study material for Mathematics and Science: https://www.vyasaacademy.in/cbse-study-material/",
          topic: null
        };
      }
    },
    {
      id: "join",
      keywords: [/how (do|can) i join/, /how (do|can) i (enroll|enrol|take) admission/, /admission/, /enroll/, /enrol/, /admissions process/, /how to join/, /how to take admission/, /how can my (child|son|daughter) join/, /apply/],
      make: function () {
        return {
          text: "Here is how admission works at Vyasa Academy: 1) Enquiry and registration - call us or fill the enquiry form and we will schedule a visit. 2) Assessment - a brief diagnostic assessment to understand the student's strengths. 3) Batch allocation - we assign the right batch and faculty based on class, curriculum and assessment. 4) Enrolment - complete the formalities and join. Seats are limited per batch. For the next step, contact us at +91 94949 01006 or +91 94949 01006 on WhatsApp: https://wa.me/919494901006",
          topic: null
        };
      }
    },
    {
      id: "location",
      keywords: [/located/, /location/, /address/, /nearest/, /where (is|are) (the )?(academy|school|you|your)/, /where (do|can) i (reach|come|visit)/, /your place/, /near me/],
      make: function () {
        return {
          text: "Vyasa Academy is at: 53/2D, Vyasa Academy, Raghavendra Layout, Hulimavu, Bangalore - 560076. We serve Hulimavu, Bilekahalli, MICO Layout, JP Nagar, Arekere, Bannerghatta Road and surrounding Bangalore areas. You can see the map on our homepage: https://www.vyasaacademy.in/#contact",
          topic: null
        };
      }
    },
    {
      id: "contact",
      keywords: [/contact/, /phone/, /whatsapp/, /phone number/, /contact number/, /call/, /reach (you|the academy|them)/, /email/, /mail/, /get in touch/, /talk to/],
      make: function () {
        return {
          text: "You can reach Vyasa Academy at: Phone / WhatsApp: +91 94949 01006 (https://wa.me/919494901006), Email: vyasacareeracademy@gmail.com. We are open Monday - Saturday, 4:00 PM - 9:00 PM.",
          topic: null
        };
      }
    },
    {
      id: "hours",
      keywords: [/timing/, /hours/, /when are you open/, /what time/, /opening time/, /closing time/, /open on sunday/, /working days/, /weekend/],
      make: function () {
        return {
          text: "Vyasa Academy is open Monday - Saturday, 4:00 PM - 9:00 PM. We are closed on Sundays.",
          topic: null
        };
      }
    },
    {
      id: "faculty",
      keywords: [/faculty/, /teachers/, /who teaches/, /mentors/, /trainers/, /founder/, /co-founder/],
      make: function () {
        return {
          text: "Vyasa Academy's faculty includes: Mahendra Babu Chennupati (Founder - Mathematics, CBSE, ICSE, KCET and Olympiads, 10+ years), Venu Chennupati (Co-Founder - JEE Mathematics, KCET, CBSE and ICSE, 9 years), Rashmi (Chemistry, M.Sc, B.Ed, 7 years), Nishi Srivastava (Biology, 15 years), Ramya (Physics, 8 years), Bharathi (Mathematics, 12 years) and Poojitha (Mathematics, 2 years).",
          topic: null
        };
      }
    },
    {
      id: "fee",
      keywords: [/fee/, /fees/, /cost/, /price/, /charge/, /what is the fee/, /pricing/],
      make: function () {
        return {
          text: "I don't have that information yet. Please contact Vyasa Academy directly at +91 94949 01006 or vyasacareeracademy@gmail.com for the current fee details.",
          topic: null
        };
      }
    },
    {
      id: "results",
      keywords: [/result/, /results/, /topper/, /rating/, /ratings/, /review/, /reviews/, /success rate/, /percentage/, /rank/, /award/, /placement/, /guarantee/, /cracked/, /scored 9/, /scored 10/],
      make: function () {
        return {
          text: "I don't have verified information about individual results, ratings or reviews to share. Please contact Vyasa Academy directly at +91 94949 01006 if you would like to speak with us.",
          topic: null
        };
      }
    },
    {
      id: "kcet",
      keywords: [/kcet/, /olympiad/, /jee/, /competitive exam/],
      make: function () {
        return {
          text: "Yes - Vyasa Academy provides KCET and Olympiad coaching alongside regular CBSE and ICSE tuition for Classes 6 to 12. JEE Mathematics coaching is also available. For details and batch timing, contact +91 94949 01006.",
          topic: null
        };
      }
    },
    {
      id: "icse",
      keywords: [/icse/],
      make: function () {
        return {
          text: "Vyasa Academy offers tuition for both CBSE and ICSE students. The free study material on our website is currently built for CBSE (NCERT) classes 6 to 12. For ICSE-specific help, contact +91 94949 01006.",
          topic: null
        };
      }
    },
    {
      id: "ap",
      keywords: [/arithmetic progress/, /\bap\b/, /what is ap/, /common difference/],
      make: function (state) {
        var t = TOPICS.ap;
        state.topic = "ap";
        return { text: t.summary + " " + t.suggest, topic: "ap" };
      }
    },
    {
      id: "quadratic",
      keywords: [/quadratic/, /find the roots/, /discriminant/],
      make: function (state) {
        var t = TOPICS.quadratic;
        state.topic = "quadratic";
        return { text: t.summary + " " + t.suggest, topic: "quadratic" };
      }
    },
    {
      id: "coordinate",
      keywords: [/distance formula/, /distance between/, /coordinates/, /section formula/, /midpoint/],
      make: function (state) {
        var t = TOPICS.distance;
        state.topic = "distance";
        return { text: t.summary + " " + t.suggest, topic: "distance" };
      }
    },
    {
      id: "elevation",
      keywords: [/angle of elevation/, /angle of depression/, /height of (a |the )?(tower|building|tree|pole)/, /line of sight/],
      make: function (state) {
        var t = TOPICS.elevation;
        state.topic = "elevation";
        return { text: t.summary + " " + t.suggest, topic: "elevation" };
      }
    },
    {
      id: "chapter_find",
      keywords: [],
      find: findChapter,
      make: function (state, q, found) {
        var cls = found.info.class10;
        var slug = found.info.slug;
        var isMaths = found.info.subject === "maths";
        var avail = isMaths ? AVAILABLE[slug] : AVAILABLE_SCIENCE[slug];
        var chapterName = found.info.label;
        var sentence;
        if (avail && avail.indexOf("notes") !== -1) {
          sentence = "Yes - the " + chapterName + " chapter notes are available here: " + chapterResourceLink(cls, slug, "notes");
        } else if (avail && avail.length) {
          sentence = "The " + chapterName + " chapter has resources on our site. " + resourceSentence(cls, slug, isMaths ? AVAILABLE : AVAILABLE_SCIENCE);
        } else {
          sentence = "Study material for " + chapterName + " is being added and is not available yet. You can check the chapter page: " + chapterLink(cls, slug);
        }
        if (isMaths && avail && avail.indexOf("quiz") !== -1) {
          sentence += " There is also a quiz: " + chapterResourceLink(cls, slug, "quiz");
        }
        return { text: sentence + ". Would you like to explore the Class 10 " + (isMaths ? "Mathematics" : "Science") + " hub instead? " + (isMaths ? "https://www.vyasaacademy.in/cbse-study-material/class-10/mathematics/" : "https://www.vyasaacademy.in/cbse-study-material/class-10/science/"), topic: null };
      }
    },
    {
      id: "sm_general",
      keywords: [/study material/, /study-material/, /sm\b/, /practice paper/, /practice papers/, /quiz\b/, /chapter test/, /notes\b/, /free (material|resources|study)/, /downloads/, /download/],
      make: function () {
        return {
          text: "We have free chapter-wise CBSE study material for Classes 6 to 12 (Mathematics and Science) - each chapter can have Notes, a Practice Paper, a Quiz and a Chapter Test. Start here: https://www.vyasaacademy.in/cbse-study-material/ For Class 10: Mathematics at https://www.vyasaacademy.in/cbse-study-material/class-10/mathematics/ and Science at https://www.vyasaacademy.in/cbse-study-material/class-10/science/",
          topic: null
        };
      }
    },
    {
      id: "ch10_maths",
      keywords: [/class 10 maths chapter/, /class 10 (math|mathematics) chapter/, /maths chapters/, /mathematics chapters/, /chapters.*class 10/, /what chapters/, /list.*chapters/, /all (the )?chapters/, /which chapters/],
      make: function () {
        var list = [];
        for (var i = 0; i < CLASS10_MATHS.chapters.length; i++) {
          list.push((i + 1) + ". " + CLASS10_MATHS.chapters[i].label);
        }
        return {
          text: "Class 10 Mathematics has 14 chapters on our site: " + list.join("; ") + ". Explore them all with notes, quizzes, practice papers and tests here: https://www.vyasaacademy.in/cbse-study-material/class-10/mathematics/",
          topic: null
        };
      }
    },
    {
      id: "ch10_science",
      keywords: [/class 10 science/, /science chapter/, /science notes/, /science material/, /science quiz/, /science study/, /electricity/, /magnetic effects/, /heredity/, /life processes/, /chemical reactions/],
      make: function () {
        return {
          text: "Yes. We have Class 10 Science study material with notes for all 13 chapters (Chemical Reactions and Equations, Acids Bases and Salts, Metals and Non-metals, Carbon and its Compounds, Life Processes, Control and Coordination, How do Organisms Reproduce?, Heredity, Light - Reflection and Refraction, The Human Eye and the Colourful World, Electricity, Magnetic Effects of Electric Current, Our Environment). Start here: https://www.vyasaacademy.in/cbse-study-material/class-10/science/",
          topic: null
        };
      }
    },
    {
      id: "chapters_other",
      keywords: [/chapters available/, /material.*class (6|7|8|9|11|12)/, /class 11/, /class 12/, /class 9/, /class 8/, /class 7/, /class 6/],
      make: function (state, q) {
        var m = q.match(/class\s*(\d{1,2})/);
        var num = m ? m[1] : null;
        var clsList = ["6", "7", "8", "9", "11", "12"];
        if (num && clsList.indexOf(num) !== -1) {
          return {
            text: "CBSE study material for Class " + num + " (Mathematics and Science) is available on our website, and new chapters are being added regularly. Open it here: https://www.vyasaacademy.in/cbse-study-material/class-" + num + "/",
            topic: null
          };
        }
        return {
          text: "We publish CBSE study material for Classes 6 to 12, with chapter-level content being added regularly. Pick your class here: https://www.vyasaacademy.in/cbse-study-material/",
          topic: null
        };
      }
    },
    {
      id: "sm_general",
      keywords: [/blog/, /article/, /exam tip/, /study tip/, /how to prepare/, /board exam/, /preparation (guide|strategy|tips)/],
      make: function () {
        return {
          text: "The Vyasa Academy blog has practical guides for students - board exam preparation, study techniques and subject-specific strategy. Browse it here: https://www.vyasaacademy.in/blog/ (Mathematics guides: https://www.vyasaacademy.in/blog/mathematics/ and Science guides: https://www.vyasaacademy.in/blog/science/)",
          topic: null
        };
      }
    },
    {
      id: "help",
      keywords: [/help/, /what can you do/, /who are you/, /what are you/, /about you/, /how do you work/, /assistant/],
      make: function () {
        return {
          text: "I am the Vyasa Academy Assistant. I can answer questions about our classes, subjects, admissions, contact details, and point you to the right CBSE study material - notes, practice papers, quizzes and chapter tests. You can also ask me to explain a Class 10 topic like arithmetic progressions, quadratic equations, the distance formula, or angle of elevation.",
          topic: null
        };
      }
    }
  ];

  function isFollowUp(q, state) {
    if (!state || !state.topic) return false;
    for (var i = 0; i < FOLLOW_UP_PATTERNS.length; i++) {
      if (FOLLOW_UP_PATTERNS[i].test(q)) return true;
    }
    return q.indexOf("example") !== -1 || q.indexOf("more") !== -1;
  }

  /* ---------- Public API ---------- */
  return {
    FACTS: FACTS,
    CLASS10_MATHS: CLASS10_MATHS,
    CLASS10_SCIENCE: CLASS10_SCIENCE,
    AVAILABLE: AVAILABLE,
    AVAILABLE_SCIENCE: AVAILABLE_SCIENCE,
    LINKS: LINK,

    answer: function (message, state) {
      var q = String(message || "").toLowerCase().trim().replace(/\s+/g, " ");

      /* Follow-up that refers to the previous topic */
      if (isFollowUp(q, state) && state.topic && TOPICS[state.topic]) {
        var t = TOPICS[state.topic];
        return {
          text: t.example + " " + t.suggest,
          topic: state.topic,
          source: "knowledge"
        };
      }

      var i, intent;
      for (i = 0; i < INTENTS.length; i++) {
        intent = INTENTS[i];
        if (intent.keywords && intent.keywords.length) {
          for (var k = 0; k < intent.keywords.length; k++) {
            if (intent.keywords[k].test(q)) {
              var res = intent.make(state, q, null);
              if (res && res.text) {
                res.source = "knowledge";
                return res;
              }
            }
          }
        }
        if (intent.find) {
          var found = intent.find(q);
          if (found) {
            var r2 = intent.make(state, q, found);
            if (r2 && r2.text) {
              r2.source = "knowledge";
              return r2;
            }
          }
        }
      }

      return null;
    },

    noAnswerText: "I don't have that information yet. Please contact Vyasa Academy directly.",
    uncertainText: "I don't have enough verified information to answer that accurately. Please contact Vyasa Academy at +91 94949 01006 if you would like direct help.",
    staleQuery: function () {
      return null;
    }
  };
}));