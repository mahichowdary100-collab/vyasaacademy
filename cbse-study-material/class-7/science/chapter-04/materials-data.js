(function(root,factory){
  const result=factory();
  if(typeof module==="object"&&module.exports)module.exports=result;
  else root.MaterialsLessons=result;
})(globalThis,function(){
  const samples={
    iron:["Iron","Metal","#a7b4c4","Usually lustrous when clean","Relatively hard","Flattens under suitable force","Can be drawn","Fairly sustained ring",.57,true,"Tools and ordinary steel","Rust can form; water and oxygen are needed."],
    copper:["Copper","Metal","#c67d50","Fresh reddish metallic shine","Less hard than the iron sample","Flattens under suitable force","Draws into wire","Rings when supported appropriately",.91,true,"Electrical wire and suitable cookware","May darken or develop a green patina."],
    aluminium:["Aluminium","Metal","#c5d4de","Clean pale metallic shine","Relatively soft for a metal","Flattens into foil","Draws into wire","Can ring",.77,true,"Foil and light components","A thin oxide layer can protect the surface."],
    zinc:["Zinc","Metal","#91a8b7","Blue-grey metallic lustre","Varies with sample and form","Depends strongly on form and temperature","Depends on treatment","Sound depends on shape",.67,true,"Protective coating on steel","The coating can corrode preferentially."],
    gold:["Gold","Metal","#d6b44d","Bright yellow metallic lustre","Relatively soft in pure form","Highly malleable","Highly ductile","Sound depends on shape",.86,true,"Jewellery and electrical contacts","Resists ordinary corrosion well."],
    silver:["Silver","Metal","#d1dce3","Bright silver metallic lustre","Relatively soft in pure form","Highly malleable","Highly ductile","Can ring",.97,true,"Jewellery and contacts","Can develop dark tarnish."],
    brass:["Brass","Metal alloy","#bf984d","Usually golden metallic lustre","Varies by alloy","Many brass alloys can be shaped","Some alloys can be drawn","Bell-like ring in suitable shapes",.63,true,"Bell and decorative hardware","Can tarnish under some conditions."],
    sulfur:["Sulfur","Non-metal element","#e0c749","Typically dull to resinous in this model","Soft compared with the iron sample","Brittle fragments","Does not draw into a wire","Muted sound",.09,false,"Raw material for industrial compounds","Solid sulfur shows no visible reaction with water in Activity 4.8."],
    graphite:["Graphite","Non-metal form of carbon","#4e5663","Dark grey with a possible sheen","Relatively soft","Can flake or fracture","Does not draw into a wire","Muted sound",.38,true,"Pencil cores and electrodes","A conducting non-metal. Real conductivity depends on orientation and sample."],
    coal:["Coal","Complex material","#41444d","Often dull, though some samples can shine","Variable among samples","Brittle pieces","Does not draw into a wire","Muted sound",.11,false,"Historical fuel example","Different types of coal vary in tested properties."],
    wood:["Wood","Complex material","#9c6a44","Grain with little metallic lustre","Depends on species and grain","May dent or split along the grain","Does not draw into a wire","Dull thud",.08,false,"Handles and structures","Moisture can change the electrical test."],
    plastic:["Plastic","Manufactured material","#568eb4","Finish may appear shiny or dull","Varies by formulation","May deform depending on type","Some polymers form fibres by other methods","Usually muted",.06,false,"Electrical insulation","Plastic formulation affects its properties."],
    rubber:["Rubber","Manufactured material","#586980","Usually dull in the illustrated sample","Elastic rather than rigid","Can rebound after compression","Elastic stretching differs from wire drawing","Muted thud",.05,false,"Grips and suitable insulation","Only approved electrical products are rated for protection."]
  };
  const tests={
    surface:["Lustre and hardness","form"],
    flatten:["Malleability","form"],
    wire:["Ductility","ductility"],
    sound:["Sonority","sound"],
    heat:["Heat conduction","heat"],
    electric:["Electrical conduction","tester"],
    change:["Surface change","corrosion"]
  };
  const conditions={
    dry:["A · Dry air","Air present, very little moisture",0],
    low:["B · Oxygen-reduced water","Water present, fresh air excluded",0],
    moist:["C · Oxygenated water and air","Partly submerged nail in an open jar",.78],
    humid:["Humid air","Moisture and oxygen available",.53],
    salt:["Saltwater · enrichment","Saltwater in contact with air",1]
  };
  const protections={
    bare:["Unprotected iron",1,"Moisture and oxygen reach the surface."],
    paint:["Intact paint",0,"The coating forms a barrier while intact."],
    oil:["Intact oil or grease",.1,"A continuous film limits contact with moisture."],
    zinc:["Galvanised iron",.05,"Zinc provides a barrier and can corrode preferentially."],
    scratched:["Scratched paint",.65,"Water and oxygen can reach the exposed iron along the scratch."]
  };
  const corrosion={
    iron:["Iron","Reddish-brown rust", "#a2522b","Water and oxygen can cause rust on iron."],
    copper:["Copper","Green patina in some conditions","#408d73","Copper can form green compounds with prolonged exposure to particular surroundings."],
    aluminium:["Aluminium","Thin protective oxide","#98adbf","The oxide may be inconspicuous and slow further attack."],
    silver:["Silver","Dark tarnish","#485363","Sulfur-containing substances in the environment can contribute to darkening."]
  };
  const oxide={
    magnesium:["Magnesium oxide and water","Basic mixture","Blue","Blue","Magnesium oxide produces basic behaviour in the textbook water mixture."],
    sulfur:["Dissolved sulfur dioxide","Acidic mixture","Red","Red","Dissolved sulfur dioxide produces acidic behaviour."],
    control:["Pure water control","Neutral comparison","Red","Blue","Both litmus colours stay the same near ordinary room conditions."],
    solid:["Solid sulfur and water","No visible reaction","Red","Blue","The virtual comparison preserves the water’s starting litmus response. Solid sulfur and sulfur dioxide are different."]
  };
  const museum=[
    ["Rajasthan ironsmith","Iron, wood and an anvil","Traditional tools combine a shaped metal working edge with suitable handles.","iron"],
    ["Bastar Dhokra","Chhattisgarh","One of several regional Dhokra traditions uses casting to make detailed objects.","brass"],
    ["Bidriware","Karnataka","Metal objects in this craft often feature contrasting silver inlay.","silver"],
    ["Pembarthi metalwork","Telangana","The region is known for worked brass objects.","brass"],
    ["Kamrupi metalwork","Assam","Study the local metal craft and the properties needed for vessels and decoration.","copper"],
    ["Iron Pillar of Delhi","Historical ironworking","NCERT presents this as an example of unusually durable historical metalwork.","iron"]
  ];
  const everyday=[
    ["Oxygen","Respiration","Many organisms use oxygen to release energy from food.","water"],
    ["Carbon","Living matter and graphite","Carbon occurs in organic molecules and also as elemental graphite.","graphite"],
    ["Nitrogen","Plant nutrients","Plants receive nitrogen in suitable compounds, including nutrients supplied by fertilisers.","wood"],
    ["Chlorine","Controlled water treatment","Approved chlorine compounds can disinfect water under monitored conditions.","water"],
    ["Iodine","Manufactured antiseptic products","Prepared iodine-containing products illustrate the everyday value of non-metals.","sulfur"]
  ];
  const quizzes={
    detective:["Material Property Detective","samples",[
      ["A dark sample conducts and is identified as carbon. Which sample fits?",["Sulfur","Graphite","Dry rubber"],1,"Graphite is a conducting form of carbon."],
      ["A material spreads into a sheet under compression. Which property is shown?",["Sonority","Malleability","Corrosion"],1,"Sheet formation is evidence of malleability."]]],
    choice:["Choose the Right Material Challenge","uses",[
      ["Choose the best insulating grip among these samples.",["Copper","Dry wood","Bare steel"],1,"Dry wood transfers heat relatively slowly."],
      ["Which is suitable for a conductive flexible core?",["Copper","Sulfur","Dry paper"],0,"Copper conducts and can be drawn into wire."],
      ["What makes a bell alloy useful?",["It always stays cold","It cannot change shape","It can ring when struck"],2,"Suitable bell shape and sonority support the ringing sound."]]],
    mistake:["Find the Scientific Mistake","properties",[
      ["Which rule is incorrect?",["Only metals conduct electricity","Many metals are ductile","Iron can rust in moist air"],0,"Graphite conducts electricity."],
      ["Which conclusion is invalid?",["Paint can protect iron","Every green metal coating is iron rust","Metal shapes affect resonance"],1,"Copper and other metals can form different products."]]],
    knowledge:["Quick Knowledge Check","properties",[
      ["What produces a thin sheet?",["Ductility","Sonority","Malleability"],2,"Malleability allows a material to spread under compression."],
      ["What does red-to-blue litmus indicate?",["Acidic","Basic","Always neutral"],1,"Red litmus turns blue in basic conditions."]]],
    escape:["Materials Scientist Escape Room","mind",[
      ["Room 1 · Shining materials. What term describes reflection from a fresh metal surface?",["Lustre","Brittleness","Rust"],0,"Fresh metallic surfaces often reflect light strongly."],
      ["Room 2 · Metal shaping. Which property is shown by wire drawing?",["Lustre","Ductility","Sonority"],1,"Ductility describes drawing into wire."],
      ["Room 3 · Heat and sound. Which matched spoon handle tends to warm first?",["Wood","Rubber","Metal"],2,"Most metals conduct heat faster than wood."],
      ["Room 4 · Electrical testing. Which non-metal sample can make a tester respond?",["Graphite","Dry rubber","Sulfur"],0,"Graphite is a conducting form of carbon."],
      ["Room 5 · Rust. What makes the exposed nail rust?",["Dry air only","Water and oxygen","Oil only"],1,"Both water and oxygen are needed."],
      ["Room 6 · Oxides. The basic magnesium mixture turns which paper blue?",["Only blue paper changes","Yellow turmeric becomes blue","Red litmus"],2,"The change from red to blue supports a basic mixture."]]],
    bot:["Beat the Materials Science Bot","form",[
      ["Foundation · Which property means a ringing sound?",["Sonority","Lustre","Ductility"],0,"Sonority describes ringing."],
      ["Application · Which protection can also act sacrificially?",["Zinc coating","Dry wood","Paint alone"],0,"Zinc may corrode preferentially."],
      ["Challenge · Why compare two litmus papers?",["Colour always identifies the element","One unchanged colour can fit more than one group","It measures the exact pH"],1,"The two tests give stronger classification evidence together."]]]
  };
  return {samples,tests,conditions,protections,corrosion,oxide,museum,everyday,quizzes};
});
