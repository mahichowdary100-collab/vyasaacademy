(function(root,make){
  const data=make();
  if(typeof module==="object"&&module.exports)module.exports=data;
  else root.CircuitLessons=data;
})(globalThis,function(){
  const demos={
    cell:["Interactive Electric Cell Explorer","cell","Which terminal is under the probe?",[
      ["Positive terminal","The raised cap in the illustrated dry cell is the positive terminal. Check actual markings.","closed"],
      ["Negative terminal","The flat base in the illustrated dry cell is negative.","closed"]]],
    battery:["Battery Builder","battery","Choose a cell arrangement for the protected LED.",[
      ["Two aligned cells","The model supply has two assisting cell units. A suitable forward protected LED can light.","led"],
      ["One cell reversed","Equal opposing cells cancel in this ideal arrangement. Do not reverse cells in a physical holder.","opposing"],
      ["One cell alone","This model LED needs two units. One cell leaves it off.","weak"]]],
    bulb:["Virtual Bulb Explorer","bulb","Compare intact and broken filament paths.",[
      ["Intact filament","Current through a rated filament heats the wire and it glows.","closed"],
      ["Broken filament","The broken filament opens the only path.","broken"]]],
    polarity:["LED Polarity Laboratory","led","Choose an orientation and check the load.",[
      ["Forward with suitable supply","The anode receives the positive connection and the cathode returns to the negative terminal.","led"],
      ["Reverse polarity","The LED stays off under the model’s reverse conditions.","reverse"],
      ["Forward with insufficient supply","The loop is connected but this model needs two units for the LED.","weak"]]],
    open:["Open and Closed Circuit Simulator","loops","Compare paths with and without a gap.",[
      ["Closed path","The source connects through the load and back to the source.","closed"],
      ["Open path","The gap interrupts the loop and the lamp stays off.","gap"]]],
    switches:["Interactive Switch Laboratory","switch","Change only the switch state.",[
      ["Switch ON","A conducting arm joins the contacts and closes the loop.","closed"],
      ["Switch OFF","The arm leaves a gap and current cannot pass through the contacts.","open"]]],
    symbols:["Electrical Symbol Explorer","symbols","Compare the drawing with the textbook symbol.",[
      ["Cell","The long plate is positive.","cell"],["Battery","Repeated long-short plate pairs represent cells.","battery"],
      ["Lamp","The circle contains a cross.","lamp"],["LED","The cathode bar and light arrows identify the diode.","led"],
      ["Closed switch","The contacts are joined.","switch"],["Open switch","The arm stops short of the other contact.","open"],
      ["Wire","A straight line indicates a conducting connection.","wire"]]],
    converter:["Real Circuit to Symbol Converter","loops","Choose a circuit and compare the component and symbol views.",[
      ["Torch lamp loop","The same source, switch and lamp terminals remain connected in either view.","closed"],
      ["Forward LED loop","The symbols retain the LED’s orientation and both source terminals.","led"],
      ["Tester with a gap","The diagram keeps the disconnected conductor ends distinct.","gap"]]],
    materials:["Conductors and Insulators Testing Laboratory","tester","A known conductor should light the lamp before further tests.",[
      ["Bare metal key","The key bridges the gap and completes a conducting path.","metal"],["Copper strip","Clean copper usually gives a visible glow.","metal"],
      ["Aluminium foil","With good contacts the foil closes the path.","metal"],["Dry plastic","The lamp stays off in this low-voltage tester.","insulator"],
      ["Dry glass","The lamp shows no detectable conduction in this test.","insulator"],["Dry wood","A dry sample leaves the lamp off. Moisture can change the outcome.","insulator"],
      ["Rubber or wax","This kit gives no visible conduction.","insulator"],["Painted metal","The coating can insulate the clips from the metal underneath.","insulator"]]],
    torch:["Virtual Torch Assembly Laboratory","torch","Follow the assembly from an empty case to a working lamp.",[
      ["Place a matched power source","Leave the circuit open while placing the model cells.","gap"],
      ["Fit the lamp and contacts","Attach both lamp contacts to their distinct paths. Leave the switch open.","open"],
      ["Close the switch","The return path is complete and the torch lamp lights.","closed"]]],
    flow:["Electric Current Visualiser","loops","Dots represent conventional current along active wired paths.",[
      ["Working loop","The arrows show external conventional current from positive to negative.","closed"],
      ["Open switch","No dots move across an open loop.","open"]]],
    devices:["Electricity Around Us Explorer","torch","Match familiar devices to a source or an electrical function.",[
      ["Torch","Small dry cells supply energy. A reflector directs the light.","closed"],
      ["Remote control","A battery supplies power to send a control signal.","cell"],
      ["Rechargeable device","A rechargeable pack stores energy for later use. Leave sealed packs intact.","battery"],
      ["Solar toy fan","An approved solar panel converts light energy to electricity for a compatible motor.","wire"]]]
  };
  const quiz={
    fault:["Circuit Fault Detective","faults",[
      ["The closed loop goes dark when the bulb filament breaks. What failed?",["The return path through the filament","The reflector","The insulation on the case"],0,"The filament is part of the conducting path."],
      ["A compatible protected LED faces opposite the supply. Which virtual repair matters?",["Change glass","Reverse the LED orientation","Move the reflector"],1,"The correct polarity places the anode on the positive side."],
      ["A known bare metal control fails to light the tester. What next?",["Classify every sample","Install a mains lead","Recheck the tester’s source and contacts"],2,"An invalid control means later darkness cannot identify the material."]]],
    safety:["Electrical Safety Detective","safety",[
      ["Which source belongs in a classroom circuit kit?",["A wall outlet","Matched small cells in a holder","An opened phone battery"],1,"The classroom circuit uses an approved low-voltage supply."],
      ["What should you do if you find a leaking cell?",["Heat it","Puncture it","Leave it alone and tell the teacher"],2,"A damaged cell requires adult handling and appropriate disposal."]]],
    mistake:["Find the Scientific Mistake","faults",[
      ["Which statement is wrong?",["A switch is the source of energy","A cell has two terminals","An LED has polarity"],0,"A switch controls connections. The cell supplies the energy."],
      ["Which conclusion needs more evidence?",["The tester was checked with metal","The lamp stayed dark, so this metal must always insulate","The dry plastic left the light off"],1,"Poor contact or coatings can hide conduction."]]],
    knowledge:["Quick Knowledge Check","symbols",[
      ["What does the longer cell line show?",["Negative","Positive","An open switch"],1,"The longer line is positive."],
      ["Which sample should light a checked tester?",["Dry rubber","Dry glass","A bare copper strip"],2,"Copper conducts easily."],
      ["What do the LED arrows in a diagram show?",["Light emission","Battery orientation","Switch position"],0,"The arrows point outwards to indicate the emitted light."]]],
    escape:["Circuit Engineer Escape Room","torch",[
      ["Room 1 · Identify the source.",["Cell","Reflector","Switch"],0,"The cell supplies energy."],
      ["Room 2 · Select the open circuit.",["Contacts connected","Contacts separated","Both cell poles marked"],1,"A gap makes a path open."],
      ["Room 3 · Identify the LED anode in a new example.",["Short lead","Flat edge","Typically the long lead"],2,"Check the markings and the usual long anode lead."],
      ["Room 4 · Bridge the approved tester gap.",["Bare metal","Dry wax","Dry rubber"],0,"Metal supplies a conducting path."],
      ["Room 5 · Choose a safe power source.",["Wall socket","Damaged pack","Teacher-approved cells"],2,"Use a suitable low-voltage classroom source."]]],
    bot:["Beat the Electricity Bot","evidence",[
      ["Foundation · Identify the glowing wire.",["Filament","Casing","Coating"],0,"The filament heats sufficiently to glow."],
      ["Application · One of two lamps in one loop breaks. What happens?",["Both stay on","Both switch off","Only the good lamp lights"],1,"Either broken filament opens the only path."],
      ["Challenge · Why does moving a switch in the same branch still work?",["It switches the cell chemistry","The same path still passes through the switch","Every component becomes an insulator"],1,"Opening a switch interrupts that same branch anywhere along it."]]]
  };
  return {demos,quiz};
});
