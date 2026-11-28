(() => {
  "use strict";
  const M=window.MaterialsLessons;
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
  const key="vyasa-class7-materials-progress-v1";
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
    store();showProgress();
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

  const L=M,C=window.ElectricCircuit;
  const work=id=>$(id+"-work");
  const choose=id=>Number(value(id));
  const identify=id=>L.samples[value(id)];
  const grey="#5b7292", rusty="#ad562a", steel="#aab9c9", orange="#dd8a38";
  const family=id=>L.samples[id][1];
  function note(id,text){work(id).textContent=text;}
  function showDownloads(filename,url){
    const a=document.createElement("a");a.href=url;a.download=filename;a.click();
  }
  function visual(id,draw){
    const model=surface(id,draw);
    click(id+"-export",()=>{
      const canvas=document.createElement("canvas");
      canvas.width=1800;canvas.height=1110;
      const ctx=canvas.getContext("2d");ctx.scale(3,3);ctx.fillStyle="#f8fafc";ctx.fillRect(0,0,600,370);
      draw(pen(ctx),1);showDownloads("vyasa-materials-"+id+".png",canvas.toDataURL("image/png"));say(id,"PNG export requested.");
    });
    return model;
  }
  function patch(g,x,y,w,h,r=.9,colour=steel){
    g.poly([[x-w*.5,y+h*.25],[x-w*.36,y-h*.38],[x+w*.46,y-h*.46],[x+w*.54,y+h*.18],[x+w*.22,y+h*.49],[x-w*.33,y+h*.49]],colour,ink);
    if(r!==0)g.line([x-w*.25,y-h*.25],[x+w*.32,y-h*.3],"#f5fbff",Math.max(1,3*r));
  }
  function resultFor(key,test){
    const [,type,,shine,hard,flat,draw,ring,heat,current,,change]=L.samples[key];
    const responses={
      surface:shine+". "+hard+".",flatten:flat+".",wire:draw+".",sound:ring+".",
      heat:heat>.5?"Faster warming in the matched geometry model.":"Slower warming in the matched geometry model.",
      electric:current?"Conducting response in the model.":"No visible response in the model.",
      change
    };
    return responses[test];
  }
  function compareSamples(g,keys,t,angle=0){
    keys.forEach((key,i)=>{
      const [label,type,color]=L.samples[key],x=150+i*300;
      patch(g,x,170,(112+30*t)*Math.cos(angle*Math.PI/180),76,.9,color);
      g.text(label,x,270,ink,21);g.text(type,x,300,teal,15);
    });
  }
  let labKeys=["iron","copper"],labObservation="";
  const labVisual=visual("lab",(g,t)=>compareSamples(g,labKeys,t));
  click("lab-run",()=>{
    labKeys=["lab-a","lab-b"].map(value);
    if(labKeys[0]===labKeys[1]){say("lab","Choose different samples for a meaningful comparison.");return;}
    const test=value("lab-test");
    labObservation=labKeys.map(key=>L.samples[key][0]+": "+resultFor(key,test)).join(" ");
    note("lab",labObservation);
    const mode=value("lab-mode");
    say("lab",mode==="guided"?"Guided comparison. Use the property labels and record what differed.":mode==="challenge"?"Challenge. Use both outcomes to justify a material choice in your observation field.":"Virtual results are ready to compare with your prediction.");
    labVisual.animate();
  });
  click("lab-why",()=>say("lab",labObservation||"Run a comparison first."));
  let pair=["copper","iron"];
  const collectionVisual=visual("collection",(g,t)=>compareSamples(g,pair,t,choose("collection-angle")));
  function collection(){
    pair=["collection-a","collection-b"].map(value);
    const angle=choose("collection-angle");
    $("collection-angle-reading").value=angle;
    $("collection-textures").replaceChildren(...pair.map(key=>{
      const sample=document.createElement("span");sample.className="material-texture";
      sample.style.setProperty("--sample-color",L.samples[key][2]);sample.style.setProperty("--angle",angle+"deg");
      return sample;
    }));
    const message=pair.map(key=>{const [name,type,,shine]=L.samples[key],use=L.samples[key][10];return name+". "+type+". "+shine+". Uses: "+use+".";}).join(" ");
    note("collection",message);say("collection","Compare the labelled appearance with the property evidence.");collectionVisual.redraw();
  }
  click("collection-run",collection);on("collection-angle","input",collection);collection();

  let finishKey="iron",weathered=false;
  const finishVisual=visual("surface",(g,t)=>{
    const [name,type,color]=L.samples[finishKey];
    patch(g,173,165,164,94,.9,color);
    patch(g,427,165,164,94,weathered?0:.9,weathered?"#758691":color);
    g.text("Fresh reference",173,263);g.text(weathered?"Weathered example":"Fresh comparison",427,263);
    g.text(name+" · "+type,300,332,teal,18);
  });
  function surfaceResult(){
    finishKey=value("surface-sample");weathered=Boolean(choose("surface-finish"));
    const message=resultFor(finishKey,"surface")+(weathered?" Weathering or dirt can change the surface appearance.":"");
    say("surface",message);note("surface","Hardness is a qualitative description for this form, not a numerical hardness rating.");finishVisual.animate();
  }
  click("surface-run",surfaceResult);click("surface-why",()=>say("surface","A dull sample can still be a metal. Surface condition and hardness supply different evidence."));

  let flatKey="copper";
  const shapes={copper:0,aluminium:0,iron:0,sulfur:1,coal:1,wood:2};
  const flattenVisual=visual("flatten",(g,t)=>{
    const shape=shapes[flatKey],colour=L.samples[flatKey][2];
    patch(g,150,185,118,70,.9,colour);
    g.text("Before",150,272);g.text("After virtual compression",442,272,ink,17);
    g.line([260,184],[326,184],teal,4);g.poly([[326,180],[338,184],[326,188]],teal,teal);
    if(shape===1&&t>.38){for(const [dx,dy] of [[-45,10],[9,-23],[42,22]])patch(g,445+dx,182+dy,38,36,0,colour);}
    else patch(g,445,185,shape===0?112+t*62:111,shape===0?72-t*40:72-t*17,.65,colour);
    g.text(L.samples[flatKey][0],300,329,teal,18);
  });
  click("flatten-run",()=>{
    flatKey=value("flatten-sample");
    say("flatten",(choose("flatten-prediction")===shapes[flatKey]?"Prediction matches. ":"Check your prediction. ")+resultFor(flatKey,"flatten"));
    flattenVisual.animate();
  });
  click("flatten-why",()=>say("flatten","Malleability is the ability to flatten into a sheet. Brittle samples fracture; wood may dent or split."));

  let wireKey="copper";
  const draws=key=>["copper","aluminium","iron","gold","silver"].includes(key);
  const wireVisual=visual("wire",(g,t)=>{
    const colour=L.samples[wireKey][2];
    g.line([99,169],[284,169],colour,24);g.box(286,94,36,151,steel,ink);
    if(draws(wireKey))g.line([320,169],[320+183*t,169],colour,7);
    else for(let i=0;i<3;i++)g.dot(327+20*i*t,167+11*i,6,colour);
    g.text("Starting sample",175,279);g.text("Virtual drawing die",306,303,ink,16);
    g.text(draws(wireKey)?"Drawn wire":"No wire in model",442,279,teal,17);
  });
  click("wire-run",()=>{
    wireKey=value("wire-sample");say("wire",(choose("wire-prediction")===Number(!draws(wireKey))?"Prediction matches. ":"Check your prediction. ")+resultFor(wireKey,"wire"));wireVisual.animate();
  });
  click("wire-why",()=>say("wire","Drawing produces wire. Compressing or rolling a sample can produce a sheet."));

  let soundKey="iron",audio=null,tone=null,volumeNode=null;
  const rings=()=>["iron","copper","aluminium","brass"].includes(soundKey);
  const frequencies={iron:412,copper:496,aluminium:565,brass:615,wood:155,rubber:93};
  const soundVisual=visual("sound",(g,t)=>{
    g.line([54,175],[546,175],grey,2);
    let prev=[54,175];
    for(let i=1;i<168;i++){
      const x=54+i*2.9,y=175+65*Math.sin(i*(rings()?.35:.21))*Math.exp(-i*(rings()?.022:.074));
      const next=[x,y];g.line(prev,next,teal,2);prev=next;if(i/167>Math.max(.05,t))break;
    }
    g.text(rings()?"Illustrative ringing trace":"Illustrative muted trace",300,295,ink,19);
  });
  const stopSound=()=>{if(tone){try{tone.stop();}catch{/* It already ended. */}tone=null;}};
  click("sound-run",async()=>{
    soundKey=value("sound-sample");
    say("sound",L.samples[soundKey][0]+". "+resultFor(soundKey,"sound")+" The tone is synthesised.");
    soundVisual.animate();
    stopSound();
    if($("sound-mute").checked||!window.AudioContext)return;
    try{
      audio??=new AudioContext();
      await audio.resume();
      if(!$("tool-sound").open||$("sound-mute").checked)return;
      const osc=audio.createOscillator(),gain=audio.createGain(),stop=audio.currentTime+(rings()?.85:.23);
      const level=(choose("sound-volume")/100)*.105;
      if(!level)return;
      osc.type="sine";osc.frequency.value=frequencies[soundKey];gain.gain.setValueAtTime(level,audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(.0001,stop);
      osc.connect(gain);gain.connect(audio.destination);
      tone=osc;volumeNode=gain;
      osc.onended=()=>{osc.disconnect();gain.disconnect();if(tone===osc)tone=null;};
      osc.start();osc.stop(stop);
    }catch{/* The plot and written result are sufficient. */}
  });
  on("sound-mute","change",()=>{if($("sound-mute").checked)stopSound();});
  on("sound-volume","input",()=>{$("sound-volume-reading").value=value("sound-volume");if(tone&&volumeNode&&choose("sound-volume")===0)stopSound();});
  on("tool-sound","toggle",()=>{if(!$("tool-sound").open)stopSound();});
  click("sound-why",()=>say("sound","Shape and support affect ringing. The synthesised frequencies are examples, not measured material signatures."));

  function timeline(id,render,opinions,controls){
    let timer=0;
    const canvas=visual(id,(g,t)=>render(g,choose(id+"-time"),t));
    const visible=()=>{const r=canvas.canvas.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0;};
    const pause=()=>{clearTimeout(timer);timer=0;};
    const redraw=()=>{
      $(id+"-time-reading").value=value(id+"-time");
      say(id,opinions(choose(id+"-time")));canvas.redraw();
    };
    const advance=()=>{
      if(!visible()||!$("tool-"+id).open||choose(id+"-time")>=Number($(id+"-time").max)){pause();return;}
      timer=setTimeout(()=>{$(id+"-time").value=choose(id+"-time")+1;redraw();advance();},620);
    };
    click(id+"-run",()=>{
      pause();
      if(choose(id+"-time")>=Number($(id+"-time").max))$(id+"-time").value=0;
      redraw();
      if(!visible()){canvas.canvas.scrollIntoView({block:"center",behavior:motion.matches?"instant":"smooth"});timer=setTimeout(advance,420);}else advance();
    });
    click(id+"-pause",pause);
    click(id+"-reset",()=>{pause();$(id+"-time").value=0;redraw();});
    on(id+"-time","input",()=>{pause();redraw();});
    controls.forEach(id=>on(id,"change",redraw));
    on("tool-"+id,"toggle",()=>{if(!$("tool-"+id).open)pause();else redraw();});
    click(id+"-why",()=>say(id,id==="heat"?"With matched geometry, the warmer end transfers energy along each sample. The graph is a model index, not a temperature.":"Only the conditions with water and available oxygen show rust in this ideal model. Real rates differ."));
    redraw();
  }
  const heatIndex=(key,time)=>1-Math.exp(-L.samples[key][8]*time/4);
  timeline("heat",(g,time)=>{
    [["heat-a",114,blue],["heat-b",173,orange]].forEach(([id,y,color])=>{
      const key=value(id),index=heatIndex(key,time);
      g.box(170,y-10,282,23,"#d6e9f1",ink);g.box(171,y-9,280*index,21,color);
      g.text(L.samples[key][0],104,y,ink,17);g.text(index>.45?"Warmed further":"Cooler end",493,y,ink,13);
    });
    g.text("Heat travels from the warmer end →",304,59,teal,18);
    g.line([160,304],[454,304],grey,2);g.line([160,304],[160,216],grey,2);
    [["heat-a",blue],["heat-b",orange]].forEach(([id,color])=>{
      let from=[160,304];
      for(let i=1;i<=time;i++){const to=[160+i*29,304-80*heatIndex(value(id),i)];g.line(from,to,color,3);from=to;}
    });
    g.text("Qualitative warmth index over model time",310,343,ink,16);
  },time=>{
    const ids=["heat-a","heat-b"],values=ids.map(id=>heatIndex(value(id),time));
    const names=ids.map(id=>identify(id)[0]);
    const explanation=time===0?"Both start at the same model index.":values[0]===values[1]?"Both selected samples give the same result.":(values[0]>values[1]?names[0]:names[1])+" warms sooner at the observation point.";
    note("heat",names.join(" compared with ")+". Use the same model time and geometry.");
    return "Model time "+time+". "+explanation;
  },["heat-a","heat-b"]);

  let electricKey="iron",conducts=true;
  const electricVisual=visual("electric",(g,t)=>{
    g.line([140,112],[140,253],ink,4);g.line([460,112],[460,150],ink,4);g.line([460,205],[460,253],ink,4);
    g.line([140,112],[276,112],ink,4);g.line([324,112],[460,112],ink,4);
    g.line([140,253],[278,253],ink,4);g.line([322,253],[460,253],ink,4);
    g.line([278,236],[278,270],ink,4);g.line([322,243],[322,263],ink,4);
    if(conducts&&t>.42)g.dot(300,112,34,"#fff4a0");
    g.dot(300,112,24,conducts&&t>.42?"#f8da6e":"#e8f1f8",ink);
    g.line([288,101],[312,123],ink,2);g.line([288,123],[312,101],ink,2);
    patch(g,460,177,47,67,.8,L.samples[electricKey][2]);
    g.text(L.samples[electricKey][0],300,313,ink,20);
    g.text(conducts?"Conducting path in model":"No conducting path in model",300,341,teal,16);
  });
  click("electric-run",()=>{
    electricKey=value("electric-sample");
    const canConduct=L.samples[electricKey][9], model=C?.analyse(C.preset(canConduct?"metal":"insulator"));
    conducts=model?model.lit.length>0:false;
    const message=!model?"Circuit model unavailable. See the written reference.":(conducts?"The model lamp responds.":"The model lamp remains off.")+(electricKey==="graphite"?" Graphite is a non-metal form of carbon.":"");
    say("electric",message);
    note("electric",model?(choose("electric-prediction")===Number(!conducts)?"Prediction matches.":"Compare the result with your prediction."):"No virtual result available.");
    electricVisual.animate();
  });
  click("electric-why",()=>say("electric","The Chapter 3 model checks for a complete conducting path. Real graphite brightness depends on its resistance and contacts."));

  function nail(g,x,amount,condition="moist"){
    g.box(x-81,95,162,168,"#e6f3f9",ink);
    if(condition==="low"||condition==="dry")g.box(x-86,89,172,10,steel,ink);
    if(condition!=="dry"){
      const y=condition==="low"?124:185;
      g.box(x-77,y,154,259-y,"#aee6fa");
      if(condition==="low")g.box(x-77,119,154,10,"#eccb6a");
    }else{
      for(let i=0;i<7;i++)g.dot(x-55+i*16,246+(i%2)*5,3,"#deca75");
    }
    g.line([x,105],[x,136],grey,1.5);g.line([x,139],[x,238],steel,14);
    g.line([x-18,139],[x+18,139],grey,5);
    for(let i=0;i<Math.round(amount*12);i++)g.dot(x+(i%3-1)*4,157+i*6,3.7,rusty);
  }
  const rustAmount=(key,day)=>Math.max(0,(day-2)/8)*L.conditions[key][2];
  timeline("rust",(g,day)=>{
    ["rust-a","rust-b"].forEach((id,i)=>{
      const x=150+i*300,key=value(id),amount=rustAmount(key,day);
      nail(g,x,amount,key);
      g.text(L.conditions[key][0],x,302,ink,16);g.text(amount>.06?"Visible deposit":"No visible deposit",x,332,teal,15);
    });
  },day=>{
    const [a,b]=["rust-a","rust-b"].map(value);
    const expected=rustAmount(a,day)>.06;
    note("rust",L.conditions[a][1]+". "+L.conditions[b][1]+". Model only, not a real exposure forecast.");
    return "Model day "+day+". "+L.conditions[a][0]+" "+(expected?"shows":"does not show")+" a visible deposit."+(day===10?(choose("rust-prediction")===Number(expected)?" Prediction matches.":" Revisit your prediction."):"");
  },["rust-a","rust-b"]);

  let coating="bare";
  const coatVisual=visual("protect",(g,t)=>{
    nail(g,155,t*.85);
    nail(g,445,t*L.protections[coating][1]);
    g.text("Unprotected reference",155,301,ink,17);g.text(L.protections[coating][0],445,301,ink,17);
    g.text("Qualitative exposure comparison",300,338,teal,16);
  });
  click("protect-run",()=>{
    coating=value("protect-coating");
    const use=$("protect-use").selectedOptions[0].textContent;
    say("protect",use+". "+L.protections[coating][2]);
    note("protect","Repeated exposure, moving parts and maintenance can change which coating is suitable. The diagram is an illustrative exposure.");coatVisual.animate();
  });
  click("protect-why",()=>say("protect","A barrier works while it blocks contact with water and air. Zinc can also protect exposed iron by corroding preferentially."));

  const corrosionVisual=visual("corrosion",g=>{
    const key=value("corrosion-sample"),weather=choose("corrosion-change")/100;
    const [name,after,colour]=L.corrosion[key];
    patch(g,155,164,156,88,.8,L.samples[key][2]);patch(g,445,164,156,88,weather<.25?.8:0,L.samples[key][2]);
    for(let i=0;i<Math.round(weather*22);i++)g.dot(389+(i*37)%125,142+(i*19)%55,4+(i%6),colour);
    g.text("Clean "+name,155,272,ink,17);g.text(weather>.13?after:"Mostly clean",445,272,ink,17);
  });
  function corrosion(){
    $("corrosion-change-reading").value=value("corrosion-change");
    const [,surface,,brief]=L.corrosion[value("corrosion-sample")];
    say("corrosion",surface+". "+brief);corrosionVisual.redraw();
  }
  on("corrosion-change","input",corrosion);on("corrosion-sample","change",corrosion);click("corrosion-why",corrosion);corrosion();

  let oxideKey="magnesium",litmus="both";
  const oxideVisual=visual("oxide",(g,t)=>{
    const [product,,finalRed,finalBlue]=L.oxide[oxideKey];
    g.text(product,300,69,ink,21);
    const chosen=litmus==="both"?["red","blue"]:[litmus];
    chosen.forEach((key,i)=>{
      const x=600/chosen.length*(i+.5),initial=key==="red"?"Red":"Blue",last=key==="red"?finalRed:finalBlue;
      g.box(x-29,117,58,116,initial==="Red"?red:blue,ink);
      if(t>.45)g.box(x-26,176,52,54,last==="Red"?red:blue);
      g.text(initial+" → "+last,x,273,ink,20);
    });
    g.text("Virtual indicator result",300,329,teal,17);
  });
  click("oxide-run",()=>{
    oxideKey=value("oxide-sample");litmus=value("oxide-indicator");
    const [product,group,r,b]=L.oxide[oxideKey],expected=["magnesium","sulfur"].indexOf(oxideKey);
    say("oxide",product+". "+group+". "+(litmus!=="blue"?"Red litmus ends "+r.toLowerCase()+". ":"")+(litmus!=="red"?"Blue litmus ends "+b.toLowerCase()+".":""));
    note("oxide",choose("oxide-prediction")===(expected<0?2:expected)?"Prediction matches this model.":"Compare the label and the observations with your prediction.");
    oxideVisual.animate();
  });
  click("oxide-why",()=>say("oxide",L.oxide[oxideKey][4]));

  for(const id of ["museum","everyday"]){
    const show=()=>{
      const [name,label,brief]=L[id][choose(id+"-case")];
      say(id,name+". "+label+".");note(id,brief);
    };
    click(id+"-show",show);on(id+"-case","change",show);show();
  }

  Object.entries(L.quizzes).forEach(([id,[,,questions]])=>{
    let index=0,completed=false;
    const correct=new Set();
    const escapeKey="vyasa-class7-materials-escape-v1";
    function saveEscape(){
      try{localStorage.setItem(escapeKey,String(completed?questions.length:index));}catch{/* Keep progress for this session. */}
    }
    if(id==="escape"){
      try{
        const progress=Number(localStorage.getItem(escapeKey));
        if(Number.isInteger(progress)&&progress>=0&&progress<=questions.length){
          for(let i=0;i<progress;i++)correct.add(i);
          completed=progress===questions.length;index=Math.min(progress,questions.length-1);
        }
      }catch{/* Start a fresh challenge. */}
      click("escape-certificate",()=>{
        const text="VYASA ACADEMY\nYoung Materials Scientist\nClass 7 CBSE Science · The World of Metals and Non-metals\nAll six Materials Scientist Escape Room challenges completed.\n";
        const url=URL.createObjectURL(new Blob([text],{type:"text/plain;charset=utf-8"}));
        showDownloads("vyasa-young-materials-scientist-certificate.txt",url);
        setTimeout(()=>URL.revokeObjectURL(url),1000);
      });
    }
    function renderQuestion(){
      const [prompt,choices]=questions[index];
      work(id).textContent=id==="escape"&&completed?"Young Materials Scientist achievement earned.":prompt;
      $(id+"-answer").replaceChildren(...choices.map((c,i)=>new Option(c,String(i))));
      $(id+"-check").disabled=completed;$(id+"-hint").disabled=completed;$(id+"-next").disabled=id==="escape";
      if(id==="escape")$("escape-certificate").hidden=!completed;
    }
    click(id+"-check",()=>{
      const [,,answer,reason]=questions[index];
      if(choose(id+"-answer")!==answer){say(id,"Try again. Read the hint and follow the path or evidence.");return;}
      correct.add(index);
      if(id==="bot"){saved.best=Math.max(saved.best,correct.size);store();}
      say(id,"Correct. "+reason+" Completed "+correct.size+" of "+questions.length+"."+(id==="bot"?" Best: "+saved.best+".":""));
      if(id==="escape"){
        if(index+1<questions.length){index++;renderQuestion();}
        else{completed=true;renderQuestion();}
        saveEscape();
      }
    });
    click(id+"-hint",()=>say(id,questions[index][3]));
    click(id+"-next",()=>{index=(index+1)%questions.length;renderQuestion();say(id,"New challenge.");});
    const reset=()=>{index=0;completed=false;correct.clear();renderQuestion();say(id,"Restarted.");if(id==="escape")saveEscape();};
    click(id+"-reset",reset);
    if(id==="escape")click("ground-reset",reset);
    if(id==="bot")click("ground-reset",()=>{correct.clear();index=0;renderQuestion();say(id,"Progress reset.");});
    renderQuestion();
  });

  const notesLabels=["Investigation question","Prediction","Materials and equipment","Procedure and fair conditions","Observation and result","Conclusion and follow-up"];
  const bookKey="vyasa-class7-materials-notebook-v1";
  let records=[],activeRecord=-1;
  try {
    const parsed=JSON.parse(localStorage.getItem(bookKey));
    if(Array.isArray(parsed))records=parsed.filter(row=>Array.isArray(row)&&row.length===notesLabels.length&&row.every(v=>typeof v==="string")).slice(0,12);
  }catch{/* The notebook remains usable within this page. */}
  const bookFields=notesLabels.map((_,i)=>$("notebook-"+i));
  const draft=()=>bookFields.map(field=>field.value.trim());
  const toText=()=>draft().map((value,i)=>notesLabels[i]+"\n"+value).join("\n\n");
  function redrawBook() {
    $("notebook-record").replaceChildren(new Option("New record","-1"),...records.map((row,i)=>new Option((i+1)+". "+(row[0].slice(0,55)||"Untitled record"),String(i))));
    $("notebook-record").value=String(activeRecord);
    $("notebook-delete").disabled=activeRecord<0;
    work("notebook").textContent=records.length+" of 12 records in this notebook.";
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
  on("notebook-record","change",()=>loadBook(choose("notebook-record")));
  click("notebook-new",()=>{loadBook(-1);say("notebook","New blank record.");});
  click("notebook-delete",()=>{
    if(activeRecord<0)return;
    records.splice(activeRecord,1);loadBook(-1);
    say("notebook",writeBook()?"Selected record deleted.":"Record removed for this session only.");
  });
  click("notebook-export",()=>{
    if(!draft().some(Boolean)){say("notebook","Enter an investigation before exporting.");return;}
    const url=URL.createObjectURL(new Blob([toText()],{type:"text/plain;charset=utf-8"}));
    showDownloads("materials-observation.txt",url);
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    say("notebook","Text export requested.");
  });
  click("notebook-print",()=>{
    if(!draft().some(Boolean)){say("notebook","Enter an investigation before printing.");return;}
    const record=document.createElement("section"),heading=document.createElement("h1"),fields=document.createElement("p");
    record.className="discovery-print-record";heading.textContent="Vyasa Academy · Materials investigation";fields.textContent=toText();
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
