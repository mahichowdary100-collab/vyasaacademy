(() => {
  "use strict";
  const M=window.ChemistryData;
  if(!M)return;
  const $=id=>document.getElementById(id);
  const value=id=>$(id).value;
  const on=(id,event,fn)=>$(id).addEventListener(event,fn);
  const click=(id,fn)=>on(id,"click",fn);


  const feedback=id=>$(id+"-status");
  const say=(id,text)=>{if(feedback(id).textContent!==text)feedback(id).textContent=text;};
  const good="#126443",blue="#2358a7",purple="#6f40a7",teal="#08776d",red="#9f2e43",ink="#1b2e4e",wash="#f8fafc";
  const motion=matchMedia("(prefers-reduced-motion: reduce)");
  const article=document.querySelector(".ground-notes"),dialog=document.querySelector(".ground-dialog");
  const dialogBox=dialog.querySelector(".ground-dialog-content");
  let redrawZoom=null;
  function openZoom(el,render=null){
    redrawZoom=render;dialogBox.replaceChildren(el);dialog.showModal();
    if(render)render();
  }
  dialog.querySelector("button").addEventListener("click",()=>dialog.close());
  dialog.addEventListener("close",()=>{redrawZoom=null;dialogBox.replaceChildren();});
  document.querySelector("main").addEventListener("click",event=>{
    const answer=event.target.closest("[data-open-answer]");
    if(answer)document.querySelector(answer.hash).open=true;
    const tool=event.target.closest("[data-open-tool]");
    if(tool)document.querySelector(tool.hash).open=true;
    const link=event.target.closest('a[href$=".png"]');
    if(!link||link.hasAttribute("download")||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||!dialog.showModal)return;
    event.preventDefault();
    const image=new Image();image.src=link.href;image.alt=link.querySelector("img").alt;openZoom(image);
  });
  for(const group of document.querySelectorAll(".ground-check,.ground-question")){
    group.addEventListener("click",event=>{
      const choice=event.target.closest("button[data-correct]");
      if(!choice)return;
      const output=group.querySelector("[role=status]"),lesson=group.querySelector("template").content.textContent;
      for(const option of group.querySelectorAll("button[data-correct]"))option.setAttribute("aria-pressed",String(option===choice));
      output.textContent=choice.dataset.correct==="true"?"Correct. "+lesson:"Review the hint, then try again.";
    });
  }
  const key="vyasa-class7-science-chemistry-v1";
  let saved={concepts:[],questions:[],best:0};
  try{
    const old=JSON.parse(localStorage.getItem(key));
    if(old&&Array.isArray(old.concepts)&&Array.isArray(old.questions)&&Number.isSafeInteger(old.best))saved=old;
  }catch{/* The chapter works without storage. */}
  function store(){try{localStorage.setItem(key,JSON.stringify(saved));}catch{/* Session progress still works. */}}
  function showProgress(){
    $("ground-completed").textContent=saved.concepts.length+" of 6 studied";
    $("ground-practice-progress").textContent=saved.questions.length+" of 67 questions marked complete.";
  }
  const progressFields=[...article.querySelectorAll("[data-concept],[data-practice]")];
  for(const box of progressFields){
    const type=box.dataset.concept?"concepts":"questions";
    const id=box.dataset.concept||box.dataset.practice;
    box.checked=saved[type].includes(id);box.disabled=false;
    box.addEventListener("change",()=>{
      saved[type]=saved[type].filter(x=>x!==id);
      if(box.checked)saved[type].push(id);
      store();showProgress();
    });
  }
  document.querySelector(".ground-progress").hidden=false;showProgress();
  click("ground-reset",()=>{
    saved={concepts:[],questions:[],best:0};progressFields.forEach(box=>{box.checked=false;});
    store();showProgress();arenaStats();
  });
  const nav=document.querySelector(".ground-navigation");
  const navLinks=[...nav.querySelectorAll('a[href^="#"]')];
  navLinks.forEach(a=>a.addEventListener("click",()=>{nav.querySelector("details").open=false;}));
  let pending=false;
  function scrollUpdate(){
    const rect=article.getBoundingClientRect();
    $("ground-read").value=Math.max(0,Math.min(100,-rect.top*100/Math.max(1,rect.height-innerHeight)));
    let current=navLinks[0];
    for(const a of navLinks){if(document.querySelector(a.hash).getBoundingClientRect().top<=180)current=a;else break;}
    navLinks.forEach(a=>a===current?a.setAttribute("aria-current","location"):a.removeAttribute("aria-current"));
    pending=false;
  }
  addEventListener("scroll",()=>{if(!pending){requestAnimationFrame(scrollUpdate);pending=true;}},{passive:true});
  scrollUpdate();
  if("IntersectionObserver" in window)new IntersectionObserver(([entry])=>entry.target.classList.toggle("is-visible",entry.isIntersecting))
    .observe(document.querySelector(".ground-cover"));

  function pen(ctx){
    function line(a,b,colour=ink,width=3){ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.strokeStyle=colour;ctx.lineWidth=width;ctx.stroke();}
    function text(v,x,y,colour=ink,size=22){ctx.fillStyle=colour;ctx.font="700 "+size+"px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(v,x,y,555);}
    function box(x,y,w,h,c="#e5edf8",stroke=null){
      if(c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h);}
      if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);}
    }
    function dot(x,y,r,c,stroke=null){
      ctx.beginPath();ctx.ellipse(x,y,r,r,0,0,Math.PI*2);
      if(c){ctx.fillStyle=c;ctx.fill();}
      if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}
    }
    function poly(points,fill,stroke){ctx.beginPath();ctx.moveTo(...points[0]);points.slice(1).forEach(p=>ctx.lineTo(...p));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
    return {line,text,box,dot,poly};
  }
  function drawSurface(canvas,render,t){
    const width=canvas.clientWidth;
    if(!width)return;
    const w=Math.round(width*(devicePixelRatio||1)),h=Math.round(w*370/600);
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    const ctx=canvas.getContext("2d");
    ctx.setTransform(w/600,0,0,h/370,0,0);ctx.fillStyle=wash;ctx.fillRect(0,0,600,370);
    render(pen(ctx),t);
  }
  function surface(id,render){
    const details=$("tool-"+id),canvas=$(id+"-canvas");
    let t=1,frame=0,zoomDraw;
    const redraw=()=>{
      if(details.open)drawSurface(canvas,render,t);
      if(dialog.open&&redrawZoom===zoomDraw)zoomDraw?.();
    };
    const stop=()=>{cancelAnimationFrame(frame);t=1;redraw();};
    details.addEventListener("toggle",()=>details.open?redraw():stop());
    if("ResizeObserver" in window)new ResizeObserver(redraw).observe(canvas);
    addEventListener("resize",redraw,{passive:true});
    click(id+"-zoom",()=>{
      const el=document.createElement("canvas");el.style.aspectRatio="600 / 370";
      el.setAttribute("role","img");el.setAttribute("aria-label",canvas.getAttribute("aria-label"));el.setAttribute("aria-describedby",id+"-status");
      zoomDraw=()=>drawSurface(el,render,t);openZoom(el,zoomDraw);
    });
    canvas.closest(".ground-live").hidden=false;
    return {redraw,stop,canvas,animate(duration=850,complete=null){
      cancelAnimationFrame(frame);
      if(motion.matches){t=1;redraw();complete?.();return;}
      const started=performance.now();
      const tick=time=>{
        const r=details.getBoundingClientRect();
        if(!details.open||r.top>innerHeight||r.bottom<0){stop();return;}
        t=Math.min(1,(time-started)/duration);redraw();
        if(t<1)frame=requestAnimationFrame(tick);else complete?.();
      };
      t=0;redraw();frame=requestAnimationFrame(tick);
    }};
  }

  const work=id=>$(id+"-work");
  const choice=id=>Number(value(id));
  const swatch=name=>M.swatches[name]||null;
  const notesLabels=["Investigation question","Prediction","Materials and equipment","Indicator and sample","Starting and observed colours or odour","Results","Conclusion and follow-up"];

  function table(id, headings, rows) {
    const region=document.createElement("div");
    region.className="ground-table";
    region.tabIndex=0;
    region.setAttribute("role","region");
    region.setAttribute("aria-label","Simulated observations");
    const grid=document.createElement("table");
    const caption=grid.createCaption();
    caption.textContent="Simulated observations";
    const header=grid.createTHead().insertRow();
    headings.forEach(name=>{
      const cell=document.createElement("th");
      cell.scope="col";cell.textContent=name;header.append(cell);
    });
    const body=grid.createTBody();
    rows.forEach(row=>{
      const tr=body.insertRow();
      row.forEach(value=>{
        const cell=tr.insertCell();
        if(swatch(value)){
          const chip=document.createElement("span");
          chip.className="chem-swatch";chip.style.backgroundColor=swatch(value);chip.setAttribute("aria-hidden","true");
          cell.append(chip);
        }
        cell.append(document.createTextNode(value));
      });
    });
    region.append(grid);
    work(id).replaceChildren(region);
  }

  function vials(g,items,progress,animation=true) {
    if(!items.length){g.text("Run a test to observe a result",300,165);return;}
    items.forEach(({label,before,after,paper},i)=>{
      const x=600/items.length*(i+.5);
      const shown=progress>.48?after:before;
      const colour=swatch(shown);
      if(colour&&paper){
        g.box(x-25,109,50,115,swatch(before),ink);
        g.box(x-24,177,48,46,colour);
        if(animation&&progress<.53)g.dot(x,62+progress*137,6,teal);
      } else if(colour){
        g.box(x-30,100,60,132,"#e9f3f9",ink);
        g.box(x-26,158,52,70,colour);
        g.box(x-36,95,72,10,"#f5faff",ink);
        g.line([x-17,112],[x-17,192],"#fff",4);
        if(animation&&progress<.53)g.dot(x,45+progress*125,6,teal);
      } else {
        g.box(x-26,126,52,96,"#fff7de",ink);
        g.line([x-17,203],[x+17,203],"#b67a60",5);
      }
      g.text(label,x,265,ink,items.length===1?22:17);
      g.text(shown,x,294,ink,items.length===1?17:14);
    });
    g.text("Simulated result",300,342,teal,17);
  }

  M.modes.forEach(([id,, , ,samples,indicators])=>{
    let demonstrated=false, selectedSample=null, rows=[], visual=[], explanation="";
    const diagram=surface(id,(pen,t)=>vials(pen,visual,t));
    function run() {
      if(id==="lab"&&value("lab-equipment")==="shared"){
        demonstrated=false;rows=[];visual=[];work(id).replaceChildren();diagram.stop();
        say(id,"Use clean, separate droppers. A shared unwashed dropper could contaminate the samples.");
        return;
      }
      selectedSample=id==="explorer"?samples[0]:samples.find(x=>x[0]===value(id+"-sample"));
      const active=(id==="litmus"||id==="turmeric")?indicators:indicators.filter(x=>x[0]===value(id+"-indicator"));
      const testSamples=id==="explorer"?["acid","base","neutral"].map(group=>samples.find(s=>s[2]===group)):[selectedSample];
      rows=testSamples.flatMap(sample=>active.map(([,name,before,results])=>[sample[1],name,before,results[sample[2]]]));
      visual=rows.map((row,i)=>({label:id==="explorer"?M.categories[testSamples[i][2]]:row[1].replace(" (optional)",""),before:row[2],after:row[3],paper:row[1].includes("litmus")||row[1].includes("paper")}));
      explanation=active.map(x=>x[4]).join(" ");
      demonstrated=true;
      table(id,["Sample","Indicator","Before","After"],rows);
      const visibleResult=rows.map(r=>r[1]+": "+r[2]+" → "+r[3]).join(". ");
      say(id,(id==="lab"&&value("lab-mode")==="detective"?"Interpret the observed changes yourself. ":"Simulated test. ")+visibleResult+".");
      diagram.animate();
    }
    click(id+"-test",run);
    click(id+"-why",()=>say(id,demonstrated?explanation:"Run a test first."));
    [id+"-sample",id+"-indicator",id+"-equipment"].filter($).forEach(field=>on(field,"change",()=>{
      demonstrated=false;visual=[];work(id).replaceChildren();diagram.stop();say(id,"Selection changed. Run a fresh test.");
    }));
    if(id==="lab")click("lab-check",()=>{
      if(!demonstrated){say(id,"Run a test with clean equipment before checking the conclusion.");return;}
      if(!value("lab-observation").trim()){say(id,"Record an indicator change or unchanged result first.");return;}
      const group=selectedSample[2];
      const indicator=M.indicators.find(x=>x[0]===value("lab-indicator"));
      const possible=Object.keys(indicator[3]).filter(candidate=>indicator[3][candidate]===indicator[3][group]);
      if(possible.length>1) {
        say(id,"This observation is consistent with "+possible.map(g=>M.categories[g].toLowerCase()).join(" or ")+". Test with another indicator before choosing one group.");
        return;
      }
      say(id,(value("lab-answer")===group?"Correct. ":"Recheck the recorded evidence. ")+"The expected classification is "+M.categories[group].toLowerCase()+". Prediction: "+(value("lab-prediction")===group?"consistent with the model.":"revise it using the results."));
    });
  });

  let additions=0, events=[];
  const neutralDiagram=surface("neutral",(g,t)=>{
    const diff=Number(value("neutral-acid"))-additions;
    const state=diff>0?"Acidic":diff<0?"Basic":"Balanced in this model";
    vials(g,[{label:state,before:"Clear",after:diff>0?"Red":diff<0?"Blue":"Purple"}],t);
  });
  function neutralUpdate() {
    const acid=Number(value("neutral-acid"));
    const difference=acid-additions;
    const state=difference>0?"Acid in excess":difference===0?"Equal model capacities":"Base in excess";
    events.push([String(acid),String(additions),state]);
    table("neutral",["Starting acid units","Added base units","Result"],events.slice(-18));
    $("neutral-add").disabled=additions>=acid+3;
    $("neutral-remove").disabled=additions===0;
    say("neutral",state+". This capacity model does not calculate pH or predict the effect of real drops.");
    neutralDiagram.animate();
  }
  click("neutral-add",()=>{additions++;neutralUpdate();});
  click("neutral-remove",()=>{additions--;neutralUpdate();});
  function neutralReset(){additions=0;events=[];neutralUpdate();}
  click("neutral-reset",neutralReset);on("neutral-acid","change",neutralReset);neutralReset();

  const demo=[
    ["Set up","Diluted lemon juice starts in the test tube.","Clear"],
    ["Test for acid","Blue litmus changes to red in the acidic mixture.","Red"],
    ["Add lime water","The added base reacts with some of the acid. The indicator can pass through intermediate shades.","Purple"],
    ["Observe the final shade","Blue shows the mixture is now basic in this demonstration.","Blue"],
    ["Add more diluted lemon juice","Sufficient additional acid can change the test back to red.","Red"]
  ];
  let step=0, timer=0;
  const reactionDiagram=surface("reaction",(g,t)=>vials(g,[{label:demo[step][0],before:demo[Math.max(0,step-1)][2],after:demo[step][2]}],t));
  function pauseReaction(){clearTimeout(timer);timer=0;}
  function showStep(){
    say("reaction","Step "+(step+1)+" of "+demo.length+". "+demo[step][1]);
    $("reaction-prev").disabled=step===0;$("reaction-next").disabled=step===demo.length-1;
    reactionDiagram.animate(Number(value("reaction-speed"))*.64);
  }
  function advance() {
    if(!($("tool-reaction").open&&step<demo.length-1)) {pauseReaction();return;}
    timer=setTimeout(()=>{
      const bounds=$("reaction-canvas").getBoundingClientRect();
      if(bounds.bottom<=0||bounds.top>=innerHeight){pauseReaction();return;}
      step++;showStep();advance();
    },Number(value("reaction-speed")));
  }
  click("reaction-next",()=>{pauseReaction();step++;showStep();});
  click("reaction-prev",()=>{pauseReaction();step--;showStep();});
  click("reaction-restart",()=>{pauseReaction();step=0;showStep();});
  click("reaction-play",()=>{pauseReaction();if(step===demo.length-1)step=0;showStep();advance();});
  click("reaction-pause",pauseReaction);
  on("tool-reaction","toggle",()=>{if(!$("tool-reaction").open)pauseReaction();});
  on("reaction-speed","change",()=>{if(timer){pauseReaction();advance();}});
  showStep();

  for(const [id,scene] of Object.entries(M.scenes)){
    let selected=0;
    const diagram=surface(id,(g,t)=>{
      const [,label,,colour]=scene.cases[selected];
      if(id==="antacid"){
        g.box(271,45,38,109,"#f6c1b5","#894e55");
        g.dot(330,177,70,"#f6c1b5","#894e55");
        g.line([291,99],[303,174],"#f6c1b5",34);
        g.dot(340,189,selected===0?28:selected===1?22:16,swatch(colour));
        if(selected===1&&t<.8)g.dot(290+t*49,80+t*100,8,blue);
        g.text(label,300,286);g.text("Simplified model",300,337,teal,17);return;
      }
      if(id==="soil"){
        g.box(148,159,304,68,"#9a6248",ink);
        for(let i=0;i<5;i++)g.line([185+i*56,161],[190+i*56,111],green,8);
        g.dot(300,96,14,swatch(colour),ink);
        g.text(label,300,279);g.text("Illustrative soil test result",300,334,teal,17);return;
      }
      vials(g,scene.cases.map(([stageName,,,stageColour],i)=>({label:stageName,before:i<=selected?stageColour:"Clear",after:i<=selected?stageColour:"Clear"})),t,false);
    });
    const display=()=>{selected=choice(id+"-select");const [,label,note]=scene.cases[selected];say(id,label+". "+note);diagram.animate();};
    on(id+"-select","change",display);
    click(id+"-show",display);display();
  }

  const phColours=["#a42350","#bd3051","#d74b52","#e26e48","#ed9543","#eab847","#e4d453","#81b451","#4ca46e","#309b86","#3585a5","#496db0","#625ca6","#76539e","#683b83"];
  const phScale=surface("ph",g=>{
    const n=choice("ph-value");
    phColours.forEach((colour,i)=>{g.box(22+i*37,115,37,62,colour);g.text(String(i),40+i*37,204,ink,17);});
    g.dot(40+n*37,91,12,ink);g.text("Example pH "+n,300,267);
  });
  const updatePh=()=>{
    const n=choice("ph-value");
    $("ph-number").value=n;say("ph","Example pH "+n+". "+(n<7?"Acidic.":n>7?"Basic.":"Neutral near room temperature.")+" The scale does not assign fixed pH values to household substances.");
    phScale.redraw();
  };
  on("ph-value","input",updatePh);updatePh();

  function question(id,q,opts){
    const control=$(id+"-answer");
    control.replaceChildren(...opts.map((label,i)=>new Option(label,String(i))));
    work(id).textContent=q;
  }
  Object.entries(M.quiz).forEach(([id,[,,,correct,why]])=>{
    click(id+"-check",()=>say(id,choice(id+"-answer")===correct?"Correct. "+why:"Try again. Recheck the indicator rule or use the written notes."));
  });
  let room=0;
  function escapeQuestion(){
    const [label,q,opts]=M.challenges[room];
    question("escape",label+" — "+q,opts);
  }
  click("escape-check",()=>{
    if(room===M.challenges.length)return;
    const [, , ,right,why]=M.challenges[room];
    if(choice("escape-answer")!==right){say("escape","Try again or use the hint.");return;}
    room++;say("escape","Correct. "+why+" Rooms solved: "+room+" of "+M.challenges.length+".");
    if(room<M.challenges.length)escapeQuestion();
    else {work("escape").textContent="Chemistry Detective achievement earned.";["check","hint"].forEach(x=>$("escape-"+x).disabled=true);}
  });
  click("escape-hint",()=>say("escape",M.challenges[room]?.[4]||"All rooms solved."));
  click("escape-reset",()=>{room=0;["check","hint"].forEach(x=>$("escape-"+x).disabled=false);escapeQuestion();say("escape","Start at the litmus bench.");});
  escapeQuestion();

  const solved=new Set();
  function botQuestion(){
    const [,q,opts]=M.bot[choice("bot-level")];
    question("bot",q,opts);
  }
  function arenaStats(){
    const best=saved.best;
    say("bot","Round: "+solved.size+" of 3. Best score: "+best+" of 3.");
  }
  on("bot-level","change",botQuestion);
  click("bot-check",()=>{
    const level=choice("bot-level"),[,,,right,why]=M.bot[level];
    if(choice("bot-answer")!==right){say("bot","Try again.");return;}
    solved.add(level);saved.best=Math.max(saved.best,solved.size);store();
    say("bot","Correct. "+why+" Score: "+solved.size+" of 3. Best: "+saved.best+".");
  });
  click("bot-reset",()=>{solved.clear();arenaStats();});
  click("ground-reset",()=>{solved.clear();arenaStats();});
  botQuestion();arenaStats();

  const bookKey="vyasa-class7-chemistry-notebook-v1";
  let records=[],activeRecord=-1;
  try {
    const parsed=JSON.parse(localStorage.getItem(bookKey));
    if(Array.isArray(parsed))records=parsed.filter(row=>Array.isArray(row)&&row.length===notesLabels.length&&row.every(v=>typeof v==="string")).slice(0,12);
  }catch{/* The notebook remains usable within this page. */}
  const bookFields=notesLabels.map((_,i)=>$("notebook-"+i));
  const draft=()=>bookFields.map(field=>field.value.trim());
  const toText=()=>notesLabels.map((label,i)=>label+"\n"+draft()[i]).join("\n\n");
  function redrawBook() {
    $("notebook-record").replaceChildren(new Option("New record","-1"),...records.map((row,i)=>new Option((i+1)+". "+(row[0].slice(0,55)||"Untitled record"),String(i))));
    $("notebook-record").value=String(activeRecord);
    $("notebook-delete").disabled=activeRecord<0;
    work("notebook").textContent=records.length+" of 12 records saved on this browser.";
  }
  function loadBook(index){
    activeRecord=index;
    bookFields.forEach((field,i)=>field.value=records[index]?.[i]||"");
    redrawBook();
  }
  function writeBook(){
    redrawBook();
    try{localStorage.setItem(bookKey,JSON.stringify(records));return true;}
    catch{return false;}
  }
  click("notebook-save",()=>{
    const text=draft();
    if(!text.some(Boolean)){say("notebook","Enter an observation or investigation before saving.");return;}
    if(activeRecord<0){
      if(records.length>=12){say("notebook","Export or delete an old record before adding another.");return;}
      activeRecord=records.length;
    }
    records[activeRecord]=text;
    say("notebook",writeBook()?"Record saved on this browser.":"Browser storage is unavailable. Export a copy before leaving.");
  });
  on("notebook-record","change",()=>loadBook(choice("notebook-record")));
  click("notebook-new",()=>{loadBook(-1);say("notebook","New blank record.");});
  click("notebook-delete",()=>{
    if(activeRecord<0)return;
    records.splice(activeRecord,1);loadBook(-1);
    say("notebook",writeBook()?"Selected record deleted.":"Record removed for this session only.");
  });
  click("notebook-export",()=>{
    if(!draft().some(Boolean)){say("notebook","Enter an investigation before exporting.");return;}
    const blob=new Blob([toText()],{type:"text/plain;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const link=document.createElement("a");link.href=url;link.download="chemistry-observation.txt";link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    say("notebook","Text export requested.");
  });
  click("notebook-print",()=>{
    if(!draft().some(Boolean)){say("notebook","Enter an investigation before printing.");return;}
    const record=document.createElement("section"), heading=document.createElement("h1"), fields=document.createElement("p");
    record.className="discovery-print-record";heading.textContent="Vyasa Academy · Chemistry observation";fields.textContent=toText();
    record.append(heading,fields);document.body.append(record);document.body.classList.add("discovery-print");
    addEventListener("afterprint",()=>{record.remove();document.body.classList.remove("discovery-print");},{once:true});
    window.print();
  });
  redrawBook();
  for(const panel of document.querySelectorAll(".ground-tool")){
    const activate=()=>{if(panel.open){panel.querySelector(".ground-live").hidden=false;panel.classList.add("is-ready");}};
    panel.addEventListener("toggle",activate);activate();
  }
})();
