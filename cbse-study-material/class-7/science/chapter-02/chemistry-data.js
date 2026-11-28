(function (root, factory) {
  const data = factory();
  if (typeof module === "object" && module.exports) module.exports = data;
  else root.ChemistryData = data;
})(globalThis, function () {
  const samples = [
    ["lemon","Lemon juice","acid"], ["amla","Amla juice","acid"], ["tamarind","Tamarind water","acid"], ["vinegar","Vinegar","acid"],
    ["baking","Baking soda solution","base"], ["soap","Typical basic soap solution","base"], ["lime","Lime water","base"],
    ["washing","Typical washing powder solution","base"], ["water","Pure water","neutral"], ["sugar","Sugar solution","neutral"],
    ["salt","Pure table salt solution","neutral"], ["tap","Tap water (simulated sample)","neutral"]
  ];
  const categories = {acid:"Acidic",base:"Basic",neutral:"Neutral"};
  const swatches = {
    Red:"#bd2148", Blue:"#326cc2", Pink:"#da6c9b", Green:"#3b9160", Yellow:"#efbf35",
    "Reddish-brown":"#ad5133", Purple:"#8261a9", "Blue-green":"#158b86", Clear:"#d4eeef"
  };
  const indicators = [
    ["blue","Blue litmus","Blue",{acid:"Red",base:"Blue",neutral:"Blue"},"A red result supports acidic behaviour. Unchanged blue includes basic and neutral samples."],
    ["red","Red litmus","Red",{acid:"Red",base:"Blue",neutral:"Red"},"A blue result supports basic behaviour. Unchanged red includes acidic and neutral samples."],
    ["rose","Red rose extract","Pink",{acid:"Red",base:"Green",neutral:"Pink"},"These are textbook example shades. Real preparations, sample colours and lighting affect the appearance."],
    ["turmeric","Turmeric paper","Yellow",{acid:"Yellow",base:"Reddish-brown",neutral:"Yellow"},"An unchanged yellow result cannot distinguish acidic from neutral."],
    ["onion","Onion strip","Usual onion odour",{acid:"Odour remains noticeable",base:"Odour may weaken",neutral:"Odour remains noticeable"},"This strip comparison represents a qualitative odour observation. Use only the simulated comparison here."],
    ["cabbage","Red cabbage (optional)","Purple",{acid:"Pink",base:"Blue-green",neutral:"Purple"},"Representative shades vary with extract and pH. This is an optional example."]
  ];
  const modes = [
    ["lab","Virtual Acid–Base Chemistry Laboratory","Choose a known sample and an indicator. Predict the group, run the test and support a conclusion with the recorded result.","setup",samples,indicators],
    ["litmus","Interactive Litmus Testing Laboratory","Test both strips on separate portions of the same sample.","litmus",samples,indicators.slice(0,2)],
    ["turmeric","Turmeric Colour Magic Laboratory","Compare the dry yellow paper with the tested strip.","turmeric",samples,indicators.filter(x=>x[0]==="turmeric")],
    ["garden","Natural Indicator Garden","Choose red rose, turmeric, onion or optional red cabbage. Compare with the starting appearance or odour.","rose",samples,indicators.slice(2)],
    ["explorer","Indicator Colour-Change Explorer","Use the same indicator on an acid, a base and a neutral reference side by side.","evidence",samples,indicators],
    ["kitchen","Kitchen Chemistry Explorer","Compare examples of food acids, a basic baking ingredient and neutral sugar solution.","samples",samples.filter(x=>["lemon","amla","tamarind","vinegar","baking","sugar","salt"].includes(x[0])),indicators.slice(0,4)]
  ];
  const scenes = {
    soil: {
      title:"Virtual Soil Chemistry Laboratory",art:"soil",label:"Tested soil extract",cases:[
        ["Overly acidic for the crop","Acidic","Consider a suitable liming material after testing and local soil guidance.","Red"],
        ["Near neutral","Neutral","Check soil nutrients, water and drainage before choosing a treatment.","Green"],
        ["Overly basic for the crop","Basic","Consult soil guidance. NCERT discusses suitable organic matter as a possible measure.","Blue"]
      ]},
    antacid: {
      title:"Antacid Science Animation",art:"antacid",label:"Conceptual stage",cases:[
        ["Before interaction","Stomach contains acid","Acid occurs naturally in the stomach and helps digestion.","Red"],
        ["With an antacid","Some stomach acid reacts","Certain antacids supply a base. This is an educational model without treatment guidance.","Pink"],
        ["After some acid reacts","Acid amount reduced","The model does not assume the stomach becomes neutral or predict symptoms.","Purple"]
      ]},
    effluent: {
      title:"Environmental Neutralisation Simulator",art:"water",label:"Treatment stage",cases:[
        ["Sampling","Acidic example effluent","Professionals test the incoming stream and check contaminants.","Red"],
        ["Controlled treatment","Acidity is adjusted","Adjustments are monitored with measurements in the treatment plant.","Purple"],
        ["Check again","Verify before permitted discharge","Even acceptable pH does not establish that other contaminants are below limits.","Blue"]
      ]}
  };
  const quiz = {
    hook:["Opening challenge","Which liquid could reveal a basic soap message with reddish-brown letters?",["Turmeric liquid","Plain water","Salt solution"],0,"A suitable basic ink changes the yellow turmeric indicator to reddish-brown.","turmeric"],
    mystery:["Mystery Substance Detective","Blue litmus becomes red; red litmus remains red. How does sample A behave?",["Basic","Acidic","Neutral"],1,"Blue-to-red litmus independently supports acidity.","evidence"],
    classify:["Chemistry Classification Challenge","Which result places a liquid in the basic group?",["Both strips unchanged","Blue strip turns red","Red strip turns blue"],2,"A red strip turning blue is evidence for basic behaviour.","samples"],
    mistake:["Find the Scientific Mistake","Which statement needs correcting?",["Every clear solution is neutral","Test with fresh strips","A control shows the starting colour"],0,"Appearance alone cannot tell you a liquid’s group.","evidence"],
    knowledge:["Quick Knowledge Check","What products are named in the usual school-level acid–base word equation?",["Water alone","Salt and water","Acid and oxygen"],1,"A typical neutralisation forms salt and water and can release heat.","reaction"]
  };
  const challenges = [
    ["Room 1 · Litmus bench","Red paper becomes blue. What is the group?",["Acidic","Basic","Neutral"],1,"Red-to-blue litmus indicates a base."],
    ["Room 2 · Turmeric drawer","Which sample could keep turmeric yellow?",["Vinegar","Only a strong base","No possible sample"],0,"Acids and neutral samples may leave it yellow."],
    ["Room 3 · Rose cabinet","Which result supports basic behaviour with the NCERT rose extract?",["Green","No change","Red"],0,"A green shade is expected in suitable basic conditions."],
    ["Room 4 · Reaction bench","The reaction mixture turns blue with litmus. Why?",["A base is now in excess","Exactly neutral is always blue","Acid cannot change an indicator"],0,"Blue in this demonstration shows basic behaviour."],
    ["Room 5 · Soil gate","Which evidence comes before deciding on soil treatment?",["Colour of the packet","Condition of the soil and crop","Number of plants sold"],1,"Testing and crop requirements inform soil decisions."]
  ];
  const bot = [
    ["Foundation","A sour food commonly contains which type of substance?",["A base","An acid","Only pure water"],1,"Familiar sour foods often contain acids. A lab test uses an indicator."],
    ["Application","A diluted liquid turns turmeric reddish-brown. What would support that result?",["Blue litmus turning red","Red litmus turning blue","Unchanged indicators in every trial"],1,"Both results support basic behaviour."],
    ["Challenge","Why can apparently neutral effluent still need treatment?",["Other contaminants can remain","Every pollutant is an acid","Neutral means oxygen is absent"],0,"An indicator measures one chemical property."]
  ];
  return {samples,categories,swatches,indicators,modes,scenes,quiz,challenges,bot};
});
