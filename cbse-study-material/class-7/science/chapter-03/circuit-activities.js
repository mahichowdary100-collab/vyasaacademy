(() => {
  "use strict";
  const M=window.ElectricCircuit;
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
  const key="vyasa-class7-electricity-progress-v1";
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

  const L=window.CircuitLessons;
  if(!L)return;
  const work=id=>$(id+"-work");
  const choose=id=>Number(value(id));
  const example=name=>M.preset(name);
  const boardPoint=node=>{const [x,y]=M.point(node);return [45+x*51,45+y*46];};
  const nodeName=node=>{const [x,y]=M.point(node);return String.fromCharCode(65+x)+(y+1);};
  const paint="#16436f", copper="#a45228", glow="#e8aa31", soft="#dbe9f6";

  function wirePath(a,b) {
    const [x,y]=boardPoint(a),[tx,ty]=boardPoint(b);
    return [[x,y],[tx,y],[tx,ty]].filter((point,i,pts)=>i===0||point[0]!==pts[i-1][0]||point[1]!==pts[i-1][1]);
  }
  function wireSegment(g,points,colour,width){
    for(let i=1;i<points.length;i++)g.line(points[i-1],points[i],colour,width);
  }
  function symbol(g,kind,a,b,physical=false,active=false,on=true) {
    const [x,y]=a,dx=b[0]-x,dy=b[1]-y,len=Math.hypot(dx,dy);
    const at=(u,v)=>[x+dx*u-dy/len*v,y+dy*u+dx/len*v];
    const line=(u,v,w,z,c=ink,thickness=2)=>g.line(at(u,v),at(w,z),c,thickness);
    const dot=(u,v,r,color,stroke)=>g.dot(...at(u,v),r,color,stroke);
    if(kind==="wire"){line(0,0,1,0);return;}
    if(kind==="cell"||kind==="battery"){
      if(physical){
        line(.11,0,.9,0,paint,16);line(.09,0,.21,0,copper,10);line(.79,0,.91,0,grey,10);
      }else{
        const marks=kind==="cell"?[[.42,13],[.56,7]]:[[.27,13],[.42,7],[.58,13],[.73,7]];
        line(0,0,marks[0][0],0);line(marks.at(-1)[0],0,1,0);
        marks.forEach(([offset,half])=>line(offset,-half,offset,half));
      }
      g.text("+",...at(.08,-13),ink,11);g.text("−",...at(.92,-13),ink,11);
    }else if(kind==="lamp"){
      const radius=Math.min(13,len*.23),tail=radius/len;
      line(0,0,.5-tail,0);line(.5+tail,0,1,0);
      if(active)dot(.5,0,radius+6,"#fff0af");
      dot(.5,0,radius,active?"#ffde70":"#edf5fb",ink);
      if(physical)g.line(at(.41,3),at(.59,-3),on?copper:red,3);
      else{line(.5-tail*.65,-radius*.65,.5+tail*.65,radius*.65);line(.5-tail*.65,radius*.65,.5+tail*.65,-radius*.65);}
      if(!on)line(.32,-12,.69,13,red,3);
    }else if(kind==="led"){
      line(0,0,.24,0);line(.73,0,1,0);
      if(active)dot(.52,0,16,"#fff0af");
      if(physical){dot(.49,0,9,active?"#f3af21":"#7bceaa",ink);}
      else{
        g.poly([at(.26,-7),at(.26,7),at(.72,0)],active?"#ffde70":"#e3f3f7",ink);
        line(.73,-8,.73,8);
        for(const offset of [.43,.63]){line(offset,-9,offset-.13,-17,teal,1.5);line(offset-.13,-17,offset-.13,-13,teal,1.5);}
      }
    }else if(kind==="switch"||kind==="open"){
      line(0,0,.23,0);line(.77,0,1,0);
      dot(.23,0,3,"#fff",ink);dot(.77,0,3,"#fff",ink);
      line(.29,0,.71,on&&kind!=="open"?0:-11,physical?copper:ink,3);
    }else{
      line(0,0,.22,0);line(.78,0,1,0);
      line(.25,0,.75,0,kind==="metal"?grey:"#b27a5a",10);
    }
  }
  const grey="#5b7292";
  function boardDraw(g,state,result,{physical=false,grid=false,selected=-1,cursor=-1,phase=0}={}){
    if(grid){
      for(let n=0;n<M.columns*M.rows;n++){
        const [x,y]=boardPoint(n);g.dot(x,y,2,"#a5b9cc");
        if(n<M.columns)g.text(nodeName(n)[0],x,24,grey,13);
        if(n%M.columns===0)g.text(String(M.point(n)[1]+1),23,y,grey,13);
      }
    }
    state.wires.forEach(([a,b],i)=>{
      const pts=wirePath(a,b);
      wireSegment(g,pts,selected===state.parts.length+i?"#007796":ink,selected===state.parts.length+i?4:2);
      [pts[0],pts.at(-1)].forEach(p=>g.dot(...p,3,paint));
    });
    state.parts.forEach((part,i)=>{
      const [a,b]=M.terminals(part).map(boardPoint);
      if(selected===i){g.dot(...a,7,"#eedb68",paint);g.dot(...b,7,"#eedb68",paint);}
      symbol(g,part.kind,a,b,physical,result.lit.includes(i),part.on);
      g.dot(...a,3,paint);g.dot(...b,3,paint);
    });
    if(cursor>=0)g.dot(...boardPoint(cursor),8,"#fce9a1",ink);
    for(const [a,b] of result.segments){
      const forward=state.wires.some(([x,y])=>x===a&&y===b);
      const route=forward?wirePath(a,b):wirePath(b,a).reverse();
      const lengths=route.slice(1).map((p,i)=>Math.hypot(p[0]-route[i][0],p[1]-route[i][1]));
      let progress=phase*lengths.reduce((sum,n)=>sum+n,0);
      lengths.some((len,i)=>{
        const [from,to]=[route[i],route[i+1]];
        if(progress>len){progress-=len;return false;}
        const [dx,dy]=[to[0]-from[0],to[1]-from[1]],x=from[0]+dx*progress/len,y=from[1]+dy*progress/len;
        g.dot(x,y,4,"#087f73");
        if(dx||dy){
          g.line([x-dx/len*8+dy/len*3,y-dy/len*8-dx/len*3],[x,y],teal,2);
          g.line([x-dx/len*8-dy/len*3,y-dy/len*8+dx/len*3],[x,y],teal,2);
        }
        return true;
      });
    }
    g.text(result.short?"Unsafe virtual short · simulation paused":result.lit.length?result.lit.length+" load"+(result.lit.length===1?" lights":"s light"):"No load lights",300,345,result.short?red:teal,17);
  }
  function showDownloads(name,url){
    const link=document.createElement("a");
    link.download=name;link.href=url;link.click();
  }
  const showing=element=>{const r=element.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight;};

  function editor(id,defaultName){
    let state=example(defaultName),result=M.analyse(state),selected=-1,wireStart=-1,physical=id==="build",phase=.25,frame=0,playing=false;
    const past=[],future=[];
    const key="vyasa-class7-circuit-"+id+"-v1";
    const redraw=surface(id,(g)=>boardDraw(g,state,result,{physical,grid:true,selected,cursor:wireStart,phase}));

    function push(next){
      if(!M.valid(next)){say(id,"This layout exceeds the supported circuit size or has an invalid connection.");return;}
      past.push(M.clone(state));if(past.length>40)past.shift();
      future.length=0;state=next;wireStart=-1;render();
    }
    function checkGoal(){
      const goal=value(id+"-goal");
      const match=goal==="led"?result.lit.some(i=>state.parts[i]?.kind==="led"):result.lit.some(i=>state.parts[i]?.kind==="lamp")&&
        (goal==="switch"?result.activeParts.some(i=>state.parts[i].kind==="switch"):result.activeParts.some(i=>state.parts[i].kind==="metal"));
      return match?" Challenge passed.":" Challenge still open. Use the named load and required component.";
    }
    function render(message=""){
      result=M.analyse(state);
      if(result.short)stop();
      const item=$(id+"-item");
      const partNames=state.parts.map(p=>M.types[p.kind]+" "+M.terminals(p).map(nodeName).join("–"));
      const wireNames=state.wires.map(w=>"Wire "+w.map(nodeName).join("–"));
      const names=[...partNames,...wireNames];
      item.replaceChildren(new Option(names.length?"Select an item":"None","-1"),...names.map((n,i)=>new Option(n,String(i))));
      if(selected>=names.length)selected=-1;
      item.value=String(selected);
      $(id+"-undo").disabled=!past.length;$(id+"-redo").disabled=!future.length;
      work(id).textContent=state.parts.length+" components and "+state.wires.length+" wires. "+(value(id+"-mode")==="guided"?"Start at the positive contact. Follow one wire at a time through the load and back to the negative contact. ":value(id+"-mode")==="challenge"?"Check the circuit when you have met the target. ":"")+(names.length?names.join("; ")+".":"Empty workspace.");
      say(id,message||result.reason);
      redraw.redraw();
    }
    function place(node,tool=value(id+"-tool")){
      if(tool==="select"){
        selected=state.parts.findIndex(p=>M.terminals(p).includes(node));
        render(selected<0?"No component at "+nodeName(node)+".":"Selected "+M.types[state.parts[selected].kind]+".");
        return;
      }
      const next=M.clone(state);
      if(tool==="wire"){
        if(wireStart<0){
          wireStart=node;
          say(id,"Wire starts at "+nodeName(node)+". Select its second endpoint.");redraw.redraw();return;
        }
        if(wireStart===node){wireStart=-1;say(id,"Choose two different endpoints for a wire.");redraw.redraw();return;}
        if(state.wires.some(w=>w.includes(node)&&w.includes(wireStart))){say(id,"Those endpoints already have a wire.");return;}
        next.wires.push([wireStart,node]);
        push(next);return;
      }
      const part={kind:tool,at:node,turn:choose(id+"-direction"),on:true};
      if(!M.position(next,part)){say(id,"Choose an empty pair of grid points inside the board.");return;}
      next.parts.push(part);selected=next.parts.length-1;push(next);
    }
    const canvas=redraw.canvas;
    function pointed(event){
      const r=canvas.getBoundingClientRect();
      const x=Math.round(((event.clientX-r.left)*600/r.width-45)/51),y=Math.round(((event.clientY-r.top)*370/r.height-45)/46);
      if(x>=0&&x<M.columns&&y>=0&&y<M.rows){
        $(id+"-col").value=x;$(id+"-row").value=y;return M.key(x,y);
      }
      return -1;
    }
    canvas.addEventListener("click",e=>{const node=pointed(e);if(node>=0)place(node);});
    canvas.addEventListener("dragover",e=>{e.preventDefault();e.dataTransfer.dropEffect="copy";});
    canvas.addEventListener("drop",e=>{
      e.preventDefault();const tool=e.dataTransfer.getData("text/plain"),node=pointed(e);
      if(node>=0&&Object.hasOwn(M.types,tool))place(node,tool);
    });
    const palette=[...$("tool-"+id).querySelectorAll("[data-part]")];
    function arm(tool){$(id+"-tool").value=tool;palette.forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.part===tool)));wireStart=-1;redraw.redraw();}
    palette.forEach(button=>{
      button.addEventListener("click",()=>{arm(button.dataset.part);say(id,"Select an empty grid point for "+button.textContent+".");});
      button.addEventListener("dragstart",e=>{e.dataTransfer.setData("text/plain",button.dataset.part);e.dataTransfer.effectAllowed="copy";});
    });
    on(id+"-tool","change",()=>arm(value(id+"-tool")));
    click(id+"-apply",()=>place(M.key(choose(id+"-col"),choose(id+"-row"))));
    on(id+"-item","change",()=>{selected=choose(id+"-item");redraw.redraw();});
    on(id+"-mode","change",()=>render());
    click(id+"-load",()=>{selected=-1;push(example(value(id+"-preset")));});
    click(id+"-clear",()=>{selected=-1;push(M.blank());});
    click(id+"-undo",()=>{if(past.length){future.push(M.clone(state));state=past.pop();selected=-1;wireStart=-1;render("Undo applied.");}});
    click(id+"-redo",()=>{if(future.length){past.push(M.clone(state));state=future.pop();selected=-1;wireStart=-1;render("Redo applied.");}});
    click(id+"-delete",()=>{
      if(selected<0){say(id,"Choose a component or wire to delete.");return;}
      const next=M.clone(state);
      if(selected<next.parts.length)next.parts.splice(selected,1);
      else next.wires.splice(selected-next.parts.length,1);
      selected=-1;push(next);
    });
    click(id+"-rotate",()=>{
      const part=state.parts[selected];if(!part){say(id,"Select a component to rotate.");return;}
      const next=M.clone(state),rotated={...part,turn:(part.turn+1)%4};
      next.parts.splice(selected,1);
      if(!M.position(next,rotated)){say(id,"There is no free grid point in that rotation.");return;}
      next.parts.splice(selected,0,rotated);push(next);
    });
    click(id+"-toggle",()=>{
      if(state.parts[selected]?.kind!=="switch"){say(id,"Select a switch from the component list.");return;}
      const next=M.clone(state);next.parts[selected].on=!next.parts[selected].on;push(next);
    });
    click(id+"-validate",()=>say(id,result.reason+(value(id+"-mode")==="challenge"&&!result.short?checkGoal():"")));
    click(id+"-toggle-view",()=>{physical=!physical;redraw.redraw();say(id,(physical?"Component view. ":"Symbol view. ")+result.reason);});
    click(id+"-save",()=>{
      try{localStorage.setItem(key,JSON.stringify(state));say(id,"Circuit saved on this device.");}
      catch{say(id,"Browser storage is unavailable. Export an image to keep this circuit.");}
    });
    click(id+"-restore",()=>{
      try{
        const data=JSON.parse(localStorage.getItem(key));
        if(M.valid(data)){selected=-1;push(data);say(id,"Saved circuit loaded. "+result.reason);return;}
      }catch{/* Fall through to explanation. */}
      say(id,"There is no valid saved circuit on this device.");
    });
    click(id+"-export",()=>{
      const copy=document.createElement("canvas");
      copy.width=1800;copy.height=1110;
      const ctx=copy.getContext("2d");ctx.scale(3,3);ctx.fillStyle="#f8fafc";ctx.fillRect(0,0,600,370);
      boardDraw(pen(ctx),state,result,{grid:true,physical});
      showDownloads("vyasa-circuit.png",copy.toDataURL("image/png"));say(id,"PNG export requested.");
    });
    function stop(){playing=false;cancelAnimationFrame(frame);}
    click(id+"-flow",()=>{
      if(playing){stop();say(id,"Current animation paused.");return;}
      if(!result.segments.length||result.short){say(id,result.reason);return;}
      if(motion.matches){redraw.redraw();say(id,"Current direction is shown with stationary arrows in reduced-motion mode.");return;}
      playing=true;
      let last=0;
      function tick(now){
        if(!playing||!showing(canvas)||!result.segments.length||motion.matches){stop();return;}
        if(now-last>=32){phase=(now%1260)/1260;last=now;redraw.redraw();}
        frame=requestAnimationFrame(tick);
      }
      frame=requestAnimationFrame(tick);say(id,"Conventional current is shown along the complete path.");
    });
    on("tool-"+id,"toggle",()=>{if(!$("tool-"+id).open)stop();});
    arm(Object.keys(M.types)[0]);render();
  }
  editor("build","closed");editor("drawing","blank");

  function opposing(){
    const data=example("closed");
    data.parts.push({kind:"cell",at:M.key(6,4),turn:2,on:true});
    data.wires.pop();data.wires.push([M.key(7,4),M.key(6,4)],[M.key(5,4),M.key(3,4)]);
    return data;
  }
  function illustration(g,kind,label,t,physical=false){
    if(kind==="torch")kind="lamp";
    if(kind==="wire"){
      g.line([100,172],[500,172],copper,8);g.line([155,172],[440,172],paint,28);
    }else if(kind==="cell"||kind==="battery"){
      if(physical){
        g.box(177,129,247,91,"#377cb2",ink);g.box(416,151,20,47,"#c4d5df",ink);
        g.text("−",200,173,"#fff",27);g.text("+",398,173,"#fff",27);
        g.dot(label.startsWith("Negative")?177:437,175,8+4*t,"#f6cd4e");
      }else{
        symbol(g,kind,[170,175],[430,175]);
        g.text("Long plate: positive",300,231,ink,16);
      }
    }else{
      symbol(g,kind,[160,165],[440,165],physical,false,kind!=="open");
    }
    g.text(label,300,305,teal,18);
  }

  Object.entries(L.demos).forEach(([id,[,image,,cases]])=>{
    let selected=0,timer=0,physical=id!=="symbols"&&id!=="flow",state=example("closed"),result=M.analyse(state);
    const individual=["cell","symbols","devices"].includes(id);
    const diagram=surface(id,(g,t)=>{
      const [label,,preset]=cases[selected];
      if(individual){
        const kind=id==="cell"?"cell":id==="devices"?(preset==="closed"?"torch":preset):preset;
        illustration(g,kind,label,t,physical);return;
      }
      boardDraw(g,state,result,{physical,phase:id==="flow"||t<1?t:.6});
      g.text(label,300,31,ink,18);
    });
    function pause(){clearTimeout(timer);timer=0;}
    function show(animate=true){
      selected=choose(id+"-case");
      const [label,note,preset]=cases[selected];
      if(!individual){state=preset==="opposing"?opposing():example(preset);result=M.analyse(state);}
      say(id,label+". "+note);
      work(id).textContent=individual?"":result.reason;
      if(animate)diagram.animate(980*Number(value(id+"-speed")));else diagram.redraw();
      $(id+"-prev").disabled=selected===0;$(id+"-next").disabled=selected===cases.length-1;
    }
    function go(n){$(id+"-case").value=n;show();}
    function playNext(){
      if(!$("tool-"+id).open||selected>=cases.length-1){pause();return;}
      timer=setTimeout(()=>{
        if(!showing(diagram.canvas)){pause();return;}
        go(selected+1);playNext();
      },1250*Number(value(id+"-speed")));
    }
    click(id+"-show",()=>{pause();show();});
    on(id+"-case","change",()=>{pause();show();});
    click(id+"-prev",()=>{pause();go(selected-1);});
    click(id+"-next",()=>{pause();go(selected+1);});
    click(id+"-restart",()=>{pause();go(0);});
    click(id+"-play",()=>{pause();if(selected===cases.length-1)go(0);else show();playNext();});
    click(id+"-pause",()=>{pause();diagram.stop();});
    on("tool-"+id,"toggle",()=>{if(!$("tool-"+id).open)pause();});
    on(id+"-speed","change",()=>{if(timer){pause();playNext();}});
    if(id==="converter")click(id+"-view",()=>{physical=!physical;show(false);say(id,(physical?"Component view. ":"Symbol view. ")+cases[selected][1]);});
    show(false);
  });

  Object.entries(L.quiz).forEach(([id,[,,questions]])=>{
    let index=0,completed=false;
    const correct=new Set();
    const escapeKey="vyasa-class7-electricity-escape-v1";
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
        const text="VYASA ACADEMY\nYoung Electrical Engineer\nClass 7 CBSE Science · Electricity: Circuits and their Components\nAll five Circuit Engineer Escape Room challenges completed.\n";
        const url=URL.createObjectURL(new Blob([text],{type:"text/plain;charset=utf-8"}));
        showDownloads("vyasa-young-electrical-engineer-certificate.txt",url);
        setTimeout(()=>URL.revokeObjectURL(url),1000);
      });
    }
    function renderQuestion(){
      const [prompt,choices]=questions[index];
      work(id).textContent=id==="escape"&&completed?"Young Electrical Engineer achievement earned.":prompt;
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

  const notesLabels=["Investigation question","Prediction","Components and material","Procedure and circuit connections","Observation and result","Conclusion and follow-up"];
  const bookKey="vyasa-class7-electricity-notebook-v1";
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
    showDownloads("electricity-observation.txt",url);
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    say("notebook","Text export requested.");
  });
  click("notebook-print",()=>{
    if(!draft().some(Boolean)){say("notebook","Enter an investigation before printing.");return;}
    const record=document.createElement("section"),heading=document.createElement("h1"),fields=document.createElement("p");
    record.className="discovery-print-record";heading.textContent="Vyasa Academy · Electrical investigation";fields.textContent=toText();
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
