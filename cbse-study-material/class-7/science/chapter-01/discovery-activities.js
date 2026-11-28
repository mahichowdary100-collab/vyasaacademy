(() => {
  "use strict";
  const M=window.DiscoveryData;
  if(!M)return;
  const $=id=>document.getElementById(id);
  const value=id=>$(id).value;
  const on=(id,event,fn)=>$(id).addEventListener(event,fn);
  const click=(id,fn)=>on(id,"click",fn);
  const rand=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
  const pick=a=>a[rand(0,a.length-1)];
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
  article.addEventListener("click",event=>{
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
  for(const item of document.querySelectorAll(".worked-example")){
    const steps=[...item.querySelectorAll(".ground-steps li")],button=item.querySelector(".ground-step");
    const answer=item.querySelector(".ground-answer");
    let index=0;
    steps.forEach(s=>{s.hidden=true;});
    answer.hidden=true;button.hidden=false;
    button.addEventListener("click",()=>{
      if(index<steps.length){steps[index++].hidden=false;if(index===steps.length)button.textContent="Reveal final answer";}
      else {answer.hidden=false;button.hidden=true;}
    });
  }
  const key="vyasa-class7-science-discovery-v1";
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
  const progressFields=[...article.querySelectorAll("[data-concept],[data-question]")];
  for(const box of progressFields){
    const type=box.dataset.concept?"concepts":"questions";
    const id=box.dataset.concept||box.dataset.question;
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
  const renderers=new Map(),scenes=new Map(),init={};
  const cyan="#b7e4f5",leaf="#abdcc1",violet="#ddd5f2",gold="#ffdda0",panel="#e8f0fa";
  function show(id,message,lines=[]){
    say(id,message);
    const work=$(id+"-work");work.replaceChildren();
    if(lines.length){
      const list=document.createElement("ol");
      for(const line of lines){const li=document.createElement("li");li.textContent=line;list.append(li);}
      work.append(list);
    }
  }
  function textTable(id,head,rows,label){
    const wrap=document.createElement("div"),table=document.createElement("table"),caption=table.createCaption();
    wrap.className="ground-table";wrap.tabIndex=0;wrap.setAttribute("role","region");wrap.setAttribute("aria-label",label);
    caption.textContent=label;
    const tr=table.createTHead().insertRow();
    head.forEach(k=>{const th=document.createElement("th");th.scope="col";th.textContent=k;tr.append(th);});
    const body=table.createTBody();
    rows.forEach(values=>{const tr=body.insertRow();values.forEach(val=>{tr.insertCell().textContent=val;});});
    wrap.append(table);$(id+"-work").append(wrap);
  }
  const bind=(id,suffix,fn)=>click(id+"-"+suffix,fn);
  const change=(id,suffix,fn)=>on(id+"-"+suffix,"change",fn);
  const pickExperiment=id=>M.experiments.find(e=>e.id===value(id+"-experiment"));
  function preview(id,draw){renderers.set(id,surface(id,(g,t)=>draw(g,t,scenes.get(id))));}
  function draw(id,state,animate=true){
    scenes.set(id,state);
    const view=renderers.get(id);
    if(view){if(animate)view.animate(740);else view.redraw();}
  }
  const caption=(g,s,y,c=ink,max=25)=>g.text(s,300,y,c,Math.max(12,Math.min(max,Math.floor(780/String(s).length))));
  const sceneCaption=(g,s)=>caption(g,s,335,teal,21);
  function stagedExperiment(g,t,data){
    if(!data)return;
    const {e,step=4,row=e.example.at(-1)}=data;
    const [a,b]=row.slice(1),centres=[165,435];
    caption(g,e.name,43,blue,30);
    if(step<2){
      g.box(72,103,456,156,panel,"#9fb5d0");
      caption(g,step===0?"Ask a measurable question":"Identify what changes",146,ink,28);
      caption(g,"Change: "+e.factor,204,teal,23);
      sceneCaption(g,"Teaching model · all readings are simulated");return;
    }
    if(e.id==="shadow"){
      centres.forEach((x,i)=>{
        const len=(i?b:a)*8,y=250,back=i?62:37,sun=[x-back,188-back*62/len],tip=[x,188];
        g.dot(...sun,15,gold,ink);g.line([x-108,y],[x+111,y],ink,2);
        g.box(x-5,188,10,62,purple);
        const endpoint=[x+len,y];
        g.line(sun,tip,"#bd7725",2);g.line(tip,endpoint,"#bd7725",2);
        g.line([x,y],endpoint,step>=3?teal:ink,7);
        if(step>=3)g.text((i?b:a)+" cm",x,282,ink,20);
      });
    }else if(e.id==="seeds"){
      centres.forEach((x,side)=>{
        g.box(x-105,216,210,21,side?cyan:"#e9dbbc",ink);
        for(let j=0;j<5;j++){
          const xx=x-79+j*39;g.dot(xx,206,9,"#b36d30",ink);
          if(step>=3&&j<Math.ceil((side?b:a)*t)){
            g.line([xx,212],[xx-4,236],teal,3);g.line([xx-4,236],[xx+4,246],teal,2);
          }
        }
        g.text(side?"Damp paper":"Dry paper",x,268,ink,18);
        if(step>=3)g.text((side?b:a)+" visible roots",x,292,teal,16);
      });
    }else if(e.id==="plane"){
      centres.forEach((x,i)=>{
        const span=Math.min(214,(i?b:a)*.7),base=x-106,y=239;
        g.line([base,y],[base+216,y],ink,2);
        let prev=[base,y-24];
        for(let j=1;j<=10*t;j++){
          const k=j/10,pt=[base+span*k,y-24-Math.sin(Math.PI*k)*88+24*k];
          g.line(prev,pt,i?teal:purple,3);prev=pt;
        }
        g.poly([[prev[0]+20,prev[1]],[prev[0]-11,prev[1]-9],[prev[0]-5,prev[1]+5]],gold,ink);
        if(step>=3)g.text((i?b:a)+" cm",x,281,ink,19);
      });
    }else if(e.id==="magnet"){
      g.box(118,156,92,77,"#da767f",ink);g.text("Magnet",164,194,ink,18);
      ["Steel clip","Aluminium","Wood"].forEach((n,i)=>{
        let x=415;if(!i&&step>=3)x-=100*t;
        g.box(x-64,121+i*49,128,34,[cyan,gold,leaf][i],ink);
        g.text(n,x,138+i*49,ink,16);
      });
    }else{
      centres.forEach((x,i)=>{
        const read=i?b:a,y=119;
        g.box(x-83,y,166,135,"#eef6fd",ink);
        const h=e.id==="evap"?76-(step>=3?read*6*t:0):78;
        g.box(x-78,y+130-h,156,h,cyan);
        if(e.id==="dissolve"){
          const elapsed=t*Math.max(a,b),n=step>=3?Math.max(0,12-Math.floor(12*elapsed/read)):12;
          for(let j=0;j<n;j++)g.dot(x-53+(j%6)*21,231-Math.floor(j/6)*13,4,gold,ink);
        }
        if(e.id==="float"){
          if(i)g.poly([[x-44,173],[x+43,173],[x+26,194],[x-29,194]],"#d3dce5",ink);
          else g.dot(x,183,14,"#d3dce5",ink);
          for(let j=0;j<Math.ceil((step>=3?read:0)*t);j++)g.dot(i?x-29+(j%5)*14:x,167-Math.floor(j/5)*12,5,teal,ink);
        }
        if(step>=3)g.text(read+" "+e.unit,x,279,ink,21);
      });
    }
    if(e.id!=="seeds"&&e.id!=="magnet"&&e.id!=="plane"&&e.id!=="shadow"){
      const labels={dissolve:["Cool","Lukewarm"],evap:["Still air","Airflow"],float:["Compact foil","Boat foil"]}[e.id];
      labels.forEach((name,i)=>g.text(name,centres[i],103,blue,19));
    }
    sceneCaption(g,"Simulated teaching view · not measured evidence");
  }
  for(const id of ["lab","prediction"])preview(id,stagedExperiment);
  let testStep=0,testTimer=0,testStarted=false,testComplete=false;
  const stepLabels=["Make a prediction","Plan a fair comparison","Set up and run","Record observations","Compare and conclude"];
  function stopLab(){clearTimeout(testTimer);testTimer=0;}
  function labShow(explain=false,animate=true){
    const e=pickExperiment("lab"),guided=value("lab-mode")==="guided";
    const notes=[
      [e.question,guided?e.prediction:"Write your own prediction before starting the simulation."],
      ["Change only "+e.factor+".","Keep "+e.keep+" consistent.","Materials: "+e.materials],
      e.steps.concat(e.safety),
      ["Record the results and include the units. These readings are simulated examples."],
      ["Make a claim limited to these conditions.",e.limit]
    ][testStep];
    if(explain)notes.push(e.reason);
    testComplete=testStep===4;
    show("lab","Step "+(testStep+1)+" of 5 · "+stepLabels[testStep],notes);
    if(testStep>=3)textTable("lab",e.columns,e.example,"Simulated observations");
    $("lab-prev").disabled=testStep===0;
    $("lab-next").disabled=testStep===4;
    draw("lab",{e,step:testStep},animate);
  }
  function setupLab(){
    stopLab();testStep=0;testStarted=false;testComplete=false;
    labShow(false,false);
  }
  function validLab(){
    if(value("lab-material")!=="matched"){
      show("lab","Choose matched equipment and a suitable measuring tool.",["Changing the equipment as well as the chosen factor can make the comparison unfair."]);return false;
    }
    if(value("lab-mode")==="independent"&&!value("lab-predict").trim()){
      show("lab","Write a prediction before starting independent mode.");return false;
    }
    return true;
  }
  function advanceLab(){
    if(!testStarted&&!validLab())return false;
    testStarted=true;testStep=Math.min(4,testStep+1);labShow();return true;
  }
  init.lab=setupLab;
  for(const k of ["mode","experiment"])change("lab",k,setupLab);
  bind("lab","start",()=>{setupLab();if(validLab()) {testStarted=true;testStep=1;labShow();}});
  bind("lab","prev",()=>{stopLab();testStep=Math.max(0,testStep-1);labShow();});
  bind("lab","next",()=>{stopLab();advanceLab();});
  bind("lab","restart",setupLab);bind("lab","pause",stopLab);bind("lab","why",()=>labShow(true,false));
  bind("lab","play",()=>{
    stopLab();
    if(testStep===4)setupLab();
    if(!validLab())return;
    const play=()=>{
      if(!$("tool-lab").open||testStep===4){stopLab();return;}
      if(advanceLab())testTimer=setTimeout(play,1400*Number(value("lab-speed")));
    };
    play();
  });
  on("tool-lab","toggle",()=>{if(!$("tool-lab").open)stopLab();});
  bind("lab","check",()=>{
    if(!testComplete)return show("lab","Review the simulated observations before checking a conclusion.");
    const independent=value("lab-mode")==="independent",record=value("lab-record").trim();
    if(independent&&!record)return show("lab","Record your observation with its units before submitting.");
    if(value("lab-result")!=="0")return show("lab","Check the scope and source of the result.",["The dataset is simulated and the findings apply to the comparison shown."]);
    saved.labDone=true;store();
    show("lab","Supported conclusion. Achievement: Experiment Expert.",[
      "Use the evidence from these conditions only, and keep it labelled simulated.",
      ...(record?["Your observation: "+record]:[]),
      pickExperiment("lab").reason
    ]);
  });
  function prediction(){
    const e=pickExperiment("prediction"),level=Number(value("prediction-change")),guess=Number(value("prediction-guess"));
    if(e.id==="magnet"){
      show("prediction","Simulated observation: the steel clip moves toward this magnet.",[e.reason,e.limit]);
      textTable("prediction",e.columns,e.example,"Illustrative observation table");draw("prediction",{e,step:4});return;
    }
    const [trial,a,base]=e.example.at(-1);
    const b=level===2?a:level===1?base:Math.round((a+base)/2);
    const answer=b>a?0:b<a?1:2;
    show("prediction",guess===answer?"Prediction supported by this simulated result.":"Compare your prediction with this simulated result.",[
      "First condition "+a+" "+e.unit+"; second condition "+b+" "+e.unit+".",
      "The second reading is "+["higher","lower","the same"][answer]+". The contrast level selects sample values rather than an exact real-world forecast.",e.reason,e.limit
    ]);
    textTable("prediction",e.columns,[[trial,a,b]],"Simulated comparison");draw("prediction",{e,row:[trial,a,b],step:4});
  }
  init.prediction=prediction;bind("prediction","run",prediction);
  const method=["Observe","Ask","Predict","Plan","Test","Record","Compare","Conclude","Ask again"];
  const methods=["Notice a pattern or change.","Turn it into an investigable question.","State what you expect and why.","Choose the changed factor, controls and measure.","Carry out the safe comparison.","Write readings, units and unexpected observations.","Look for differences, patterns and spread.","State what the evidence supports.","Use the result to ask a further question."];
  let methodAt=0;
  preview("method",(g,t,data)=>{
    if(!data)return;
    caption(g,"An investigation can loop back",34,blue,28);
    for(let i=0;i<9;i++){
      const x=90+i%3*159,y=78+Math.floor(i/3)*78;
      g.box(x,y,136,57,i<data.n?leaf:i===data.n?gold:panel,ink);
      g.text(method[i],x+68,y+29,ink,18);
    }
    sceneCaption(g,"Ask again when the evidence leads to a new question");
  });
  function methodShow(message){
    show("method",message??(methodAt===9?"Cycle complete. Choose a new question to start another.":"Choose the next action."),methods.slice(0,methodAt).map((x,i)=>method[i]+": "+x));
    draw("method",{n:methodAt},false);
  }
  init.method=methodShow;
  bind("method","check",()=>{
    if(methodAt===9)return methodShow();
    if(Number(value("method-answer"))!==methodAt)return methodShow("Try again. Think about what information you have so far.");
    methodAt++;methodShow(methodAt===9?null:"Correct. "+methods[methodAt-1]);
  });
  bind("method","reset",()=>{methodAt=0;methodShow();});
  const answerSeeds=["Use half","Add milk","Use a towel","42","A cat’s teeth were uneven"];
  function curiosity(){
    const [title,seen,ask,explain,test,lesson]=M.curiosity[Number(value("curiosity-item"))];
    show("curiosity",title,["Observation: "+seen,"Question: "+ask,"Possible explanation: "+explain,"Suggested comparison: "+test,"Learning: "+lesson]);
  }
  init.curiosity=curiosity;change("curiosity","item",curiosity);bind("curiosity","example",curiosity);
  bind("curiosity","seed-show",()=>show("curiosity","Invent a question whose answer could be: "+answerSeeds[Number(value("curiosity-seed"))]+".",["Try two distinct contexts. Then choose one and identify what could be observed or measured."]));
  bind("curiosity","check",()=>{
    const question=value("curiosity-question").trim();
    show("curiosity",question.length>=8?"Question recorded for reflection.":"Write a question or choose an answer prompt first.",
      question.length>=8?[question,"Can you name what you would measure, what you would change, and what you would keep the same? This tool cannot judge every valid scientific question."]:[]);
  });
  const prompts={
    observation:[
      ["The leaf was 7 cm long.","Observation|Inference|Prediction",0,"7 cm is a direct measurement."],
      ["The ground may be wet because of rain.","Observation|Inference|Prediction",1,"Rain is an interpretation that needs more evidence."],
      ["The lower torch may produce a longer shadow.","Observation|Inference|Prediction",2,"This states an outcome expected before measurement."],
      ["Four of the five damp seeds had visible roots.","Observation|Inference|Prediction",0,"The statement records what was counted."]
    ],
    fair:[
      ["Which design tests water temperature and dissolving time?","Same sugar and water amounts; different temperatures|Different sugar amounts and temperatures|Taste the mixtures",0,"Keep everything relevant consistent except temperature and record time."],
      ["Which design tests airflow and evaporation?","Add water only to the still-air dish|Use identical dishes with equal water; vary airflow|Use two dish sizes at once",1,"Changing airflow alone helps isolate its effect."],
      ["Which design tests shadow length and lamp angle?","Change the block size and angle|Change both the lamp distance and the surface|Use the same block and distance; vary the angle",2,"Keep the relevant conditions constant except angle."],
      ["Which design tests whether foil shape changes the supported load?","Equal foil portions and equal counters; change shape|Different foil types, sizes and loads|Guess from the material name",0,"A fair comparison keeps the amount of foil and load units consistent."]
    ],
    evidence:[
      ["Illustrative times: cool 78, 82, 80 s; lukewarm 47, 44, 46 s. What follows?","Lukewarm finished sooner in these trials|Water always dissolves more sugar when warm|Real students collected these times",0,"These sample times support a difference in rate under the shown conditions only."],
      ["One of three plane trials went farther with the new fold. What claim is justified?","The fold always improves flight|Results differ and more consistent trials would help|The shorter flights should be erased",1,"Report all the trials and compare their consistency."],
      ["The ground is wet beneath a sprinkler. What is justified?","It certainly rained|It can only be a leaking pipe|Watering is a plausible explanation",2,"The location is evidence for a possible explanation, not proof of one cause."],
      ["Six litres are used in a test routine and eight in the comparison. What can you report?","This trial used two litres less|Every room will save two litres|The result was negative because the prediction differed",0,"8 − 6 = 2 L. Keep the scope to the test."]
    ],
    technology:[
      ["Which application uses a light sensor to reduce unnecessary electricity use?","A lamp that turns off in daylight|An unmarked ruler|A stopwatch with no sensor",0,"A light sensor can help control a lamp according to conditions."],
      ["Which tool helps scientists compare cloud cover across regions?","A thermometer at one desk|A satellite camera|A measuring cup",1,"An orbiting instrument records views across a broad region."],
      ["Which tool can help compare how long sugar stays visible?","Telescope|Magnifying glass only|Stopwatch",2,"Use elapsed time with the same observation endpoint."],
      ["How does improved telescope technology help science?","It gathers data that can refine explanations|It cancels the need for evidence|It makes all distant objects look the same",0,"Instrument improvements can provide new evidence."]
    ],
    environment:[
      ["How would you investigate a school water-saving routine?","Measure litres for the same task and repeat|Compare different tasks with no units|Assume the newest routine saves water",0,"Comparable measurements and repeated trials support a claim."],
      ["Which is responsible when observing birds?","Move a nest|Observe quietly from a distance|Feed an unfamiliar animal",1,"Observe without disturbing animals or their habitat."],
      ["Which number compares waste for classes of different sizes?","The total with no class sizes|The largest number on the page|Waste per student for the same task",2,"Use a common scale when comparing groups."],
      ["A classroom reports saving energy. What additional evidence is useful?","Comparable readings or recorded equipment use|A brighter poster|A different floor tile",0,"Compare like conditions and keep reliable records."]
    ],
    mistake:[
      ["A learner changed temperature and water volume and claimed only temperature mattered.","Keep volume consistent|Delete surprising readings|Treat the two factors as one",0,"Changing several factors makes it hard to identify the cause."],
      ["A model result was printed as a measurement from yesterday’s class.","Change the unit|Label the result as simulated|Remove all digital activities",1,"Model output must be distinguished from real readings."],
      ["One trial disagreed with the prediction, so it was erased.","Start with no prediction|Keep only the nicest reading|Keep the record and repeat the procedure",2,"Unexpected readings may reveal genuine variation or a procedural problem."],
      ["A pupil says the longest shadow was measured by looking at the Sun.","Measure the ground shadow instead|Look for longer directly|Use a brighter torch in the eyes",0,"Observe projected shadows safely. Never look directly at the Sun."]
    ]
  };
  function promptText(id,row,message){
    const [s,options,,reason]=row;
    show(id,message??s,options.split("|").map((t,i)=>["A","B","C"][i]+". "+t).concat(message?[reason]:[]));
  }
  for(const [id,rows] of Object.entries(prompts)){
    let at=0;
    init[id]=()=>promptText(id,rows[at]);
    bind(id,"next",()=>{at=(at+1)%rows.length;promptText(id,rows[at]);});
    bind(id,"check",()=>promptText(id,rows[at],Number(value(id+"-answer"))===rows[at][2]?"Correct. "+rows[at][3]:"Review the choices. "+rows[at][3]));
  }
  preview("timeline",(g,t,d)=>{
    if(!d)return;
    caption(g,"Evidence and instruments over time",49,blue,28);
    g.line([75,171],[525,171],ink,3);
    M.history.forEach((h,i)=>{
      const x=92+139*i;
      g.dot(x,171,i===d.i?19:12,i===d.i?gold:leaf,ink);
      g.text(h.date,x,220,ink,19);
    });
    caption(g,M.history[d.i].name,282,teal,23);
    sceneCaption(g,"The positions show order, not elapsed years");
  });
  let historyIndex=0;
  function timeline(){
    const item=M.history[historyIndex];
    $("timeline-index").value=String(historyIndex);
    show("timeline",item.date+" · "+item.name,[item.ask,"Before: "+item.before,"Instrument: "+item.tool,"Evidence: "+item.evidence,"What changed: "+item.result,"Modern link: "+item.use]);
    const p=document.createElement("p"),a=document.createElement("a");a.href=item.url;a.textContent=item.source;p.append(a);$("timeline-work").append(p);
    draw("timeline",{i:historyIndex});
  }
  init.timeline=timeline;
  bind("timeline","prev",()=>{historyIndex=(historyIndex+M.history.length-1)%M.history.length;timeline();});
  bind("timeline","next",()=>{historyIndex=(historyIndex+1)%M.history.length;timeline();});
  change("timeline","index",()=>{historyIndex=Number(value("timeline-index"));timeline();});
  function instrumentGlyph(g,index,x=300,y=192){
    if(index===0||index===2){
      g.dot(x-31,y-26,49,cyan,ink);g.line([x,y+6],[x+74,y+79],ink,12);
      if(index===2){g.line([x-12,y+41],[x-47,y+89],ink,4);g.line([x-12,y+41],[x+21,y+89],ink,4);}
    }else if(index===1){
      g.line([x+49,y-52],[x+20,y+49],blue,18);g.box(x-7,y-75,65,33,cyan,ink);g.box(x-45,y+21,100,17,violet,ink);g.box(x-64,y+72,144,17,cyan,ink);
    }else if(index===3||index===4||index===7){
      g.box(x-37,y-76,74,151,cyan,ink);
      for(let i=0;i<8;i++)g.line([x-29,y-61+i*17],[x-4+(i%2)*8,y-61+i*17],ink,2);
      if(index===3){g.line([x+9,y-16],[x+9,y+55],"#ad3055",6);g.dot(x+9,y+55,11,"#ad3055",ink);}
      if(index===4)g.box(x-3,y+12,35,57,"#75c9e2");
    }else if(index===5){
      g.line([x-90,y-25],[x+90,y-25],ink,5);g.poly([[x,y-25],[x-30,y+66],[x+30,y+66]],cyan,ink);
      g.box(x-127,y+9,72,13,gold,ink);g.box(x+56,y+9,72,13,gold,ink);
      g.line([x-90,y-25],[x-90,y+9],ink,3);g.line([x+90,y-25],[x+90,y+9],ink,3);
    }else if(index===6){
      g.dot(x,y,62,cyan,ink);g.line([x,y],[x,y-43],ink,4);g.line([x,y],[x+35,y+18],ink,4);
      g.box(x-16,y-80,32,14,violet,ink);
    }else{
      g.box(x-54,y-46,108,92,cyan,ink);g.dot(x,y,26,blue,ink);
      if(index===10){g.box(x-138,y-20,70,40,violet,ink);g.box(x+68,y-20,70,40,violet,ink);}
    }
  }
  preview("instruments",(g,t,d)=>{
    if(!d)return;
    caption(g,M.instruments[d.i][0],51,blue,28);instrumentGlyph(g,d.i);sceneCaption(g,"Schematic · "+M.instruments[d.i][1]);
  });
  function instruments(){
    const i=Number(value("instruments-index")),[name,purpose,how,example]=M.instruments[i];
    show("instruments",name,[purpose+".","Principle: "+how,"Example: "+example]);
    draw("instruments",{i});
  }
  init.instruments=instruments;change("instruments","index",instruments);bind("instruments","check",instruments);
  const micros=[
    ["Cork section","Repeated wall boundaries enclose spaces. This schematic leaves out fine details."],
    ["Onion epidermis","Elongated plant cell outlines repeat. Visibility of a nucleus in a real slide depends on preparation and contrast."],
    ["Leaf surface","A pore appears between two guard cells in a schematic stomatal view. Positions in this drawing are illustrative."]
  ];
  preview("microscope",(g,t,d)=>{
    if(!d)return;
    caption(g,micros[d.i][0]+" · illustrated specimen",48,blue,27);
    g.box(95,85,410,224,"#f1f8f2",ink);
    const step=38+d.zoom*16,cols=Math.floor(385/step),rows=Math.floor(202/step);
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
      const x=105+c*step,y=96+r*step;
      if(d.i===0||d.i===1){
        const w=step-3,h=d.i===1?step*.62:step-3;
        g.box(x,y,w,h,d.i===1?"#e6f5d3":"#f3e3bf",teal);
      }else{
        g.dot(x+step*.28,y+step*.45,step*.22,leaf,teal);
        g.dot(x+step*.68,y+step*.45,step*.22,leaf,teal);
        g.line([x+step*.48,y+step*.23],[x+step*.48,y+step*.59],ink,2);
      }
    }
    sceneCaption(g,"Schematic teaching view · not a micrograph");
  });
  function scope(){
    const i=Number(value("microscope-slide")),zoom=Number(value("microscope-level"));
    show("microscope",micros[i][0]+" · "+["Overview","Detail","Close detail"][zoom],[micros[i][1],"This zoom only changes the diagram scale and field of view. It has no claimed optical magnification."]);
    draw("microscope",{i,zoom});
  }
  init.microscope=scope;change("microscope","slide",scope);change("microscope","level",scope);bind("microscope","check",scope);
  bind("microscope","note",()=>{
    $("tool-notebook").open=true;
    requestAnimationFrame(()=>{
      const field=$("notebook-observations"),note=micros[Number(value("microscope-slide"))][1]+" Schematic teaching view.";
      field.value=[field.value,note].filter(Boolean).join("\n").slice(0,800);
      field.focus();field.scrollIntoView({block:"center"});
    });
  });
  const targets=[
    ["Moon","A bright disc can be visible.","Surface features such as bright and dark regions may be easier to distinguish."],
    ["Jupiter","Often a bright point under suitable conditions.","A suitable telescope or binoculars can show some of the Galilean moons as points."],
    ["Saturn","Appears point-like to the unaided eye.","A suitable telescope can reveal its rings under good conditions."],
    ["Andromeda galaxy","A faint patch can be seen under dark skies.","A telescope can help examine its appearance; the view depends on equipment and the sky."]
  ];
  preview("telescope",(g,t,d)=>{
    if(!d)return;
    caption(g,targets[d.i][0]+" · "+(d.mag?"telescope illustration":"unaided illustration"),48,blue,27);
    g.box(105,86,390,222,"#16233e",ink);
    [[130,120],[204,100],[420,138],[460,269],[143,276],[383,257],[176,223],[434,178]].forEach(([x,y],i)=>g.dot(x,y,i%2?2:3,"#bcd6f1"));
    if(!d.mag)g.dot(300,190,d.i===0?21:d.i===3?8:4,"#fcf1c5");
    else{
      g.dot(300,190,d.i===3?24:53,["#e6e1cc","#d8a66f","#e7bd7e","#c3bad7"][d.i],ink);
      if(d.i===0){g.dot(279,168,12,"#aeb3b4");g.dot(318,204,17,"#aeb3b4");}
      if(d.i===1)[215,231,370,395].forEach(x=>g.dot(x,190,3,"#fff4c1"));
      if(d.i===2){g.line([214,220],[386,160],"#dfbc86",7);g.line([221,222],[379,167],"#faf3ca",2);}
      if(d.i===3){g.line([253,209],[347,173],"#d8c2e4",4);g.dot(299,191,8,"#ffebd9");}
    }
    sceneCaption(g,"Simplified night sky · not a current observation");
  });
  function telescope(){
    const i=Number(value("telescope-target")),mag=value("telescope-view")==="1";
    show("telescope",targets[i][0]+" · "+(mag?"telescope illustration":"unaided illustration"),[targets[i][mag?2:1],"Details depend on instrument, conditions and object. Never aim a viewing instrument at the Sun."]);
    draw("telescope",{i,mag});
  }
  init.telescope=telescope;change("telescope","target",telescope);change("telescope","view",telescope);bind("telescope","check",telescope);
  const places=[
    ["Kitchen","How does airflow change water loss?","Evaporation and heat transfer","Measure water remaining in comparable dishes."],
    ["Garden","How does light direction affect a stem?","Plant growth and the environment","Compare two similar plants without damaging them."],
    ["Classroom","Does changing the lamp angle change a shadow?","Light and measurement","Measure a projected shadow against a ruler."],
    ["Health clinic","How is a temperature reading recorded?","Health and instruments","Record the reading and unit. Interpretation needs other information."],
    ["Transport","Does surface texture affect a toy car’s distance?","Motion and friction","Release the same car from a marked point and compare distances."],
    ["Night sky","How does a shadow explain an eclipse?","Light and astronomy","Use a safe model of alignment rather than looking at the Sun."]
  ];
  preview("map",(g,t,d)=>{
    if(!d)return;
    caption(g,"Questions connect across settings",46,blue,28);
    for(let i=0;i<places.length;i++){
      const x=67+i%3*158,y=101+Math.floor(i/3)*81;
      g.box(x,y,146,62,i===d.i?gold:panel,ink);g.text(places[i][0],x+73,y+32,ink,18);
    }
    sceneCaption(g,places[d.i][2]);
  });
  function map(){
    const i=Number(value("map-place")),row=places[i];
    show("map",row[0],row.slice(1));draw("map",{i});
  }
  init.map=map;change("map","place",map);bind("map","show",map);
  const notebookIds=["question","prediction","materials","procedure","observations","results","conclusion","next"];
  const notebookLabels=["Question","Prediction","Materials","Procedure","Observations","Results","Conclusion","New questions"];
  const notebookKey="vyasa-science7-discovery-notebook-v1";
  let records=[],recordIndex=-1;
  try{
    const stored=JSON.parse(localStorage.getItem(notebookKey));
    if(Array.isArray(stored))records=stored.slice(0,12).filter(x=>Array.isArray(x)&&x.length===8&&x.every(t=>typeof t==="string")).map(row=>row.map(t=>t.slice(0,800)));
  }catch{/* Browsers that block local storage can still use a session record. */}
  const notebookValues=()=>notebookIds.map(key=>value("notebook-"+key).trim());
  function notebookOptions(){
    const selector=$("notebook-select");
    selector.replaceChildren(new Option("New record","-1"));
    records.forEach((row,i)=>selector.add(new Option((row[0]||"Record "+(i+1)).slice(0,45),String(i))));
    selector.value=String(recordIndex);
  }
  function notebookDraft(){
    const data=records[recordIndex]??[];
    notebookIds.forEach((key,i)=>{$("notebook-"+key).value=data[i]??"";});
    notebookOptions();
  }
  init.notebook=()=>{
    recordIndex=records.length?0:-1;
    notebookDraft();show("notebook",records.length?"Choose a saved record or start another.":"Record an investigation below.");
  };
  change("notebook","select",()=>{recordIndex=Number(value("notebook-select"));notebookDraft();show("notebook",recordIndex<0?"New record.":"Saved record opened for editing.");});
  function persistNotebook(){
    try{localStorage.setItem(notebookKey,JSON.stringify(records));return true;}catch{return false;}
  }
  bind("notebook","save",()=>{
    const values=notebookValues();
    if(!values.some(Boolean))return show("notebook","Enter at least one part of an investigation.");
    if(recordIndex<0){
      if(records.length>=12)return show("notebook","This device has 12 records. Edit or delete a record before saving another.");
      recordIndex=records.length;records.push(values);
    }else records[recordIndex]=values;
    notebookOptions();show("notebook",persistNotebook()?"Investigation saved on this device.":"Record kept for this session. Export it to retain a copy.");
  });
  bind("notebook","reset",()=>{
    recordIndex=-1;notebookDraft();show("notebook","Blank draft ready. Saved records remain in the notebook list.");
  });
  bind("notebook","delete",()=>{
    if(recordIndex<0)return show("notebook","Select a saved record to delete it.");
    records.splice(recordIndex,1);recordIndex=-1;notebookDraft();
    show("notebook",persistNotebook()?"Selected record removed.":"Record removed in this session.");
  });
  function notebookText(){
    return "Young Scientist Notebook\nVyasa Academy · Class 7 Science\n\n"+notebookValues().map((t,i)=>notebookLabels[i]+"\n"+(t||"—")).join("\n\n")+"\n";
  }
  bind("notebook","export",()=>{
    const url=URL.createObjectURL(new Blob([notebookText()],{type:"text/plain;charset=utf-8"})),link=document.createElement("a");
    link.href=url;link.download="vyasa-science-notebook.txt";document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1300);show("notebook","Notebook text exported.");
  });
  bind("notebook","print",()=>{
    const panel=document.createElement("section");panel.className="discovery-print-record";
    const h=document.createElement("h1");h.textContent="Young Scientist Notebook";panel.append(h);
    notebookValues().forEach((text,i)=>{
      const title=document.createElement("h2"),line=document.createElement("p");
      title.textContent=notebookLabels[i];line.textContent=text||"—";panel.append(title,line);
    });
    document.body.append(panel);document.body.classList.add("discovery-print");
    function clean(){panel.remove();document.body.classList.remove("discovery-print");}
    addEventListener("afterprint",clean,{once:true});window.print();
  });
  const rooms=[
    ["The Curiosity Chamber",prompts.fair[3],"Look for a question answered by comparing two arrangements."],
    ["The Observation Laboratory",prompts.observation[1],"Check whether the cause was directly observed."],
    ["The Experiment Vault",prompts.fair[2],"Find the plan that changes only the requested factor."],
    ["The Evidence Detective Room",prompts.evidence[0],"Keep the conclusion limited to sample times."],
    ["The Discovery Time Machine",["Which evidence supported bodies orbiting Jupiter?","A photograph of cork|Successive changes in positions near Jupiter|A shorter playground shadow",1,"Repeated observations near Jupiter supported an orbital explanation."],"Look for measurements that change over time."]
  ];
  const progress=()=>Math.min(rooms.length,Math.max(0,Number.isInteger(saved.room)?saved.room:0));
  preview("escape",(g,t,d)=>{
    if(!d)return;
    caption(g,"Science Discovery Escape Room",51,blue,30);
    for(let i=0;i<rooms.length;i++){
      const x=64+i*95,y=126;g.box(x,y,85,111,i<d.count?leaf:i===d.count?gold:panel,ink);
      g.text("Room "+(i+1),x+42,y+33,ink,16);g.text(i<d.count?"OPEN":"?",x+42,y+79,teal,19);
    }
    sceneCaption(g,d.count===5?"Achievement unlocked · Evidence Detective":d.count+" of 5 rooms open");
  });
  function escape(message){
    const n=progress(),room=rooms[n];
    if(!room)show("escape","Achievement unlocked: Evidence Detective!",["You completed all five rooms by matching claims with evidence."]);
    else{
      const [name,row]=room;
      show("escape",message??"Room "+(n+1)+" · "+name,[row[0],...row[1].split("|").map((t,i)=>["A","B","C"][i]+". "+t)]);
    }
    draw("escape",{count:n});
  }
  init.escape=escape;
  bind("escape","hint",()=>{const room=rooms[progress()];if(room)escape("Hint. "+room[2]);});
  bind("escape","reset",()=>{saved.room=0;store();escape();});
  bind("escape","check",()=>{
    const room=rooms[progress()];if(!room)return escape();
    if(Number(value("escape-answer"))!==room[1][2])return escape("Try again. "+room[2]);
    saved.room=progress()+1;store();escape("Correct. "+room[1][3]);
  });
  let round=null,timer=0;
  function arenaStats(){
    $("arena-score").textContent=(round?round.score+" points · "+round.good+"/"+round.attempts+" correct · streak "+round.streak+". ":"")+"Best score "+saved.best+".";
  }
  function arenaNext(){
    if(!round?.active)return;
    const level=Number(value("arena-level"));
    const pool=level===0?[...prompts.observation,...prompts.technology]:level===1?[...prompts.fair,...prompts.evidence]:[...prompts.environment,...prompts.mistake,...prompts.evidence];
    round.question=pick(pool.filter(q=>q!==round.question));round.answered=false;
    promptText("arena",round.question);
  }
  function arenaStop(msg){
    clearInterval(timer);timer=0;if(round)round.active=false;
    show("arena",msg);arenaStats();
  }
  bind("arena","start",()=>{
    clearInterval(timer);
    const seconds=Number(value("arena-mode")),deadline=Date.now()+seconds*1000;
    round={active:true,score:0,good:0,attempts:0,streak:0};
    $("arena-clock").textContent=seconds?seconds+" seconds":"Untimed";
    if(seconds)timer=setInterval(()=>{
      const left=Math.max(0,Math.ceil((deadline-Date.now())/1000));
      $("arena-clock").textContent=left+" seconds";if(!left)arenaStop("Time is up. Try another investigation round.");
    },250);
    arenaNext();arenaStats();
  });
  bind("arena","next",arenaNext);bind("arena","stop",()=>arenaStop("Round ended."));
  bind("arena","check",()=>{
    if(!round?.active||round.answered)return;
    const q=round.question,ok=Number(value("arena-answer"))===q[2];
    round.answered=true;round.attempts++;
    if(ok){
      round.good++;round.streak++;round.score+=10+(round.streak%3===0?5:0);
      if(round.score>saved.best){saved.best=round.score;store();}
      const panel=$("tool-arena");panel.classList.remove("ground-celebrate");requestAnimationFrame(()=>panel.classList.add("ground-celebrate"));
    }else round.streak=0;
    promptText("arena",q,(ok?"Correct. ":"Compare the bot’s choice. ")+"The bot selects "+["A","B","C"][q[2]]+".");
    arenaStats();
  });
  for(const [id,setup] of Object.entries(init)){
    const panel=$("tool-"+id);
    function open(){
      if(!panel.open)return;
      panel.removeEventListener("toggle",open);setup();
    }
    panel.addEventListener("toggle",open);open();
  }
  article.querySelectorAll(".ground-live").forEach(node=>{node.hidden=false;});
  arenaStats();
})();
