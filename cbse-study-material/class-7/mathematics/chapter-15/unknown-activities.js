(() => {
  "use strict";
  const M=window.UnknownMath;
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
  const key="vyasa-class7-finding-the-unknown-v1";
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
  const {q,plus,minus,times,over,neg,same,number,write,plain,simplify,evaluate,affineText,eqText,parse,constant,solve,equivalent,apply,clearFactor,steps}=M;
  const positiveTile="#c7dfff",negativeTile="#ead8fb",positiveUnit="#bce9d7",negativeUnit="#ffe2cf",mystery="#ffe0a1";
  const scene=new Map(),views=new Map(),init={};
  function show(id,message,lines=[]){
    say(id,message);
    const area=$(id+"-work");area.replaceChildren();
    if(!lines.length)return;
    const list=document.createElement("ol");list.className="unknown-chain";
    for(const line of lines){
      const li=document.createElement("li");li.textContent=line;list.append(li);
    }
    area.append(list);
  }
  function run(id,fn){
    try{fn();}catch(e){if(!(e instanceof RangeError))throw e;show(id,e.message);}
  }
  const wire=(id,action,fn)=>click(id+"-"+action,()=>run(id,fn));
  const change=(id,key,fn)=>on(id+"-"+key,"change",()=>run(id,fn));
  const read=id=>constant(value(id));
  function whole(id,min,max){
    const x=read(id);
    if(x.d!==1n||x.n<BigInt(min)||x.n>BigInt(max))throw new RangeError("Enter a whole number from "+min+" to "+max+".");
    return Number(x.n);
  }
  const equation=id=>parse(value(id+"-equation"));
  const signed=x=>x.n<0n?write(x):"+"+write(x);
  const scaleOps={add:"Add",sub:"Subtract",addx:"Add",subx:"Subtract",mul:"Multiply",div:"Divide"};
  const explainOp=(type,amount,v)=>scaleOps[type]+" "+((type==="mul"||type==="div")?"both sides by ":"")+write(amount)+(type.endsWith("x")?" times "+v:"")+((type==="add"||type==="addx")?" to both sides":(type==="sub"||type==="subx")?" from both sides":"")+".";
  function describe(e){
    const s=solve(e);
    if(s.kind==="all")return "Every value is a solution.";
    if(s.kind==="none")return "No solution: the variable terms cancel but the constants differ.";
    return e.v+" = "+write(s.answer)+". Substitution gives "+write(evaluate(e.left,s.answer))+" on each original side.";
  }
  function preview(id,draw){
    const view=surface(id,(g,t)=>draw(g,t,scene.get(id)));
    views.set(id,view);return view;
  }
  function present(id,data,animate=true){
    scene.set(id,data);const view=views.get(id);
    if(view){if(animate)view.animate(680);else view.redraw();}
  }
  const fontsize=(text,max=29)=>Math.max(12,Math.min(max,Math.floor(810/String(text).length)));
  function caption(g,text,y,colour=ink,max=29){g.text(text,300,y,colour,fontsize(text,max));}
  function block(g,x,y,w,h,label,colour,negative=false){
    g.box(x,y,w,h,colour,ink);
    if(negative){
      for(let j=8;j<h-4;j+=7)g.line([x+3,y+j],[x+12,y+j],"#886d92",1.5);
    }
    g.text(label,x+w/2,y+h/2,ink,Math.min(18,Math.floor(w/Math.max(2,label.length)*1.25)));
  }
  function items(g,centre,base,groups,t){
    const rows=[[]];let width=0,index=0;
    for(const tile of groups.slice(0,13)){
      const w=tile[0].length>4?84:tile[0].length>2?66:49;
      if(width+w>208){rows.push([]);width=0;}
      rows.at(-1).push({w,tile,index:index++});width+=w+4;
    }
    rows.forEach((row,i)=>{
      let x=centre-(row.reduce((total,t)=>total+t.w+4,0)-4)/2;
      for(const {w,tile,index} of row){
        if(index<Math.ceil(groups.length*t))block(g,x,base-35-i*32,w,30,...tile);
        x+=w+4;
      }
    });
  }
  function termTiles(p,v){
    const result=[];
    for(const [part,letter,yes,no] of [[p.a,v,positiveTile,negativeTile],[p.b,"",positiveUnit,negativeUnit]]){
      if(!part.n)continue;
      const sign=part.n<0n?"−":"+",colour=part.n<0n?no:yes,abs=part.n<0n?neg(part):part;
      if(abs.d===1n&&abs.n<=5n)for(let i=0;i<Number(abs.n);i++)result.push([sign+(letter||"1"),colour,part.n<0n]);
      else result.push([sign+write(abs)+(letter?" "+letter:""),colour,part.n<0n]);
    }
    return result.length?result:[["0",paper]];
  }
  function physicalTokens(p,v,name){
    const tokens=[];
    if(p.a.n>0n){
      const value=p.a.n<=4n?Number(p.a.n):1;
      for(let i=0;i<value;i++)tokens.push([value===1&&p.a.n>1n?p.a.n+" "+v:name??v,mystery]);
    }
    if(p.b.n>0n)tokens.push([String(p.b.n),positiveUnit]);
    return tokens.length?tokens:[["0",paper]];
  }
  const paper="#eef4fd",gold="#a85b18";
  function displayEquation(g,t,data){
    if(!data)return;
    const {e,mode="abstract",label,step}=data;
    const physical=mode==="physical"&&[e.left.a,e.left.b,e.right.a,e.right.b].every(k=>k.d===1n&&k.n>=0n);
    caption(g,eqText(e),41,blue,33);
    if(physical){
      const angle=data.tilt??0,offset=30*angle*(.75+.25*t),lx=165,rx=435,base=224;
      g.poly([[300,201],[266,287],[334,287]],"#dce9fb",ink);
      g.dot(300,202,7,ink);
      g.line([lx,202+offset],[rx,202-offset],ink,6);
      for(const [x,y,p] of [[lx,base+offset,e.left],[rx,base-offset,e.right]]){
        g.line([x,202+(x===lx?offset:-offset)],[x,y],ink,3);
        g.box(x-104,y,208,11,"#8fc3d7",ink);
        items(g,x,y,physicalTokens(p,e.v,label),t);
      }
      caption(g,angle?"The lower pan is heavier.":"Both pans stay level.",333,good,21);
    }else{
      g.box(44,112,227,165,"#f1f6ff","#91a9ce");
      g.box(329,112,227,165,"#f1f6ff","#91a9ce");
      g.text("LHS",156,133,ink,18);g.text("RHS",443,133,ink,18);
      g.text("=",300,211,teal,35);
      const tileData=data.tiles??[termTiles(e.left,e.v),termTiles(e.right,e.v)];
      items(g,157,263,tileData[0],t);items(g,443,263,tileData[1],t);
      caption(g,step??"Signed terms represent algebraic quantities.",330,good,19);
    }
  }
  for(const id of ["balance","weight","tiles","transpose","brahma"])preview(id,displayEquation);
  wire("balance","save",()=>{
    if(!scene.has("balance"))return;
    const canvas=document.createElement("canvas");canvas.width=2400;canvas.height=1480;
    const ctx=canvas.getContext("2d");ctx.setTransform(4,0,0,4,0,0);
    ctx.fillStyle=wash;ctx.fillRect(0,0,600,370);displayEquation(pen(ctx),1,scene.get("balance"));
    canvas.toBlob(blob=>{
      if(!blob){say("balance","Your browser could not export the diagram.");return;}
      const url=URL.createObjectURL(blob),link=document.createElement("a");
      link.href=url;link.download="vyasa-equation-balance.png";
      document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
    },"image/png");
  });
  function isolated(e){
    return same(e.left.a,q(1))&&!e.left.b.n&&!e.right.a.n;
  }
  function guidedMove(e){
    if(e.right.a.n)return ["subx",e.right.a];
    if(e.left.b.n)return e.left.b.n<0n?["add",neg(e.left.b)]:["sub",e.left.b];
    if(e.left.a.n&&!same(e.left.a,q(1)))return ["div",e.left.a];
    return null;
  }
  let balanceStart,balanceNow,balanceCount=0;
  function balanceReset(){
    const guided=value("balance-mode")==="guided";
    const a=rand(2,6),b=rand(1,11),x=rand(2,10);
    balanceStart=parse(guided?"3x + 6 = 21":a+"x + "+b+" = "+(a*x+b));
    balanceNow=balanceStart;drawBalance("Start with "+eqText(balanceNow)+".");
  }
  function drawBalance(message,details=[],animate=true){
    present("balance",{e:balanceNow,mode:"physical"},animate);
    show("balance",message,details);
  }
  init.balance=balanceReset;change("balance","mode",balanceReset);wire("balance","new",balanceReset);
  wire("balance","hint",()=>{
    const move=guidedMove(balanceNow);
    if(move){$("balance-op").value=move[0];$("balance-amount").value=plain(move[1]);}
    drawBalance(move?explainOp(...move,balanceNow.v):"The variable is isolated. Verify it in the starting equation.",[],false);
  });
  wire("balance","apply",()=>{
    const op=value("balance-op"),amount=read("balance-amount"),before=balanceNow;
    balanceNow=apply(before,op,amount);
    drawBalance(eqText(balanceNow),[explainOp(op,amount,balanceNow.v),"The change preserves the solution of "+eqText(before)+"."]);
  });
  wire("balance","check",()=>{
    if(!isolated(balanceNow)){
      const move=guidedMove(balanceNow);
      return drawBalance("The unknown still needs isolating.",move?[explainOp(...move,balanceNow.v)]:[],false);
    }
    const x=balanceNow.right.b,s=solve(balanceStart);
    if(!same(x,s.answer))throw new RangeError("The value does not satisfy the starting equation.");
    const key=eqText(balanceStart);
    if(saved.balanceLast!==key){saved.balanceLast=key;balanceCount++;saved.balanceCompleted=(saved.balanceCompleted||0)+1;store();}
    drawBalance("Correct. "+describe(balanceStart),["Guided and independent equations completed on this device: "+(saved.balanceCompleted??balanceCount)+"."],false);
  });
  let weight,weightRight=0,weightAttempts=0,weightDone=false;
  const objects=["sack","coin bag","book stack","treasure box","fruit basket"];
  function weightNew(){
    const level=Number(value("weight-level")),item=pick(objects),qty=rand(2,level+3),x=rand(2,12),addon=rand(1,5),packet=level===1?0:rand(2,6);
    const e=parse(qty+"x + "+(addon+packet)+" = "+(qty*x+addon+packet));
    weight={item,e,qty,x,addon,packet};weightDone=false;$("weight-answer").value="";
    const line=packet?"A smaller scale shows that one packet weighs "+packet+" units.":"The added units are shown separately.";
    show("weight","Find the weight of one "+item+".",[
      line,qty+" identical "+item+" objects plus "+addon+" units"+(packet?" and the packet":"")+" balance "+(qty*x+addon+packet)+" units.",
      "Accuracy: "+weightRight+" correct in "+weightAttempts+" attempts."
    ]);
    present("weight",{e,mode:"physical",label:"?"});
  }
  init.weight=weightNew;wire("weight","new",weightNew);change("weight","level",weightNew);
  wire("weight","hint",()=>show("weight","Find the weight of one "+weight.item+".",[eqText(weight.e),"Remove "+(weight.addon+weight.packet)+" units from both sides, then divide by "+weight.qty+"."]));
  wire("weight","check",()=>{
    if(weightDone)return;
    const result=read("weight-answer"),right=same(result,q(weight.x));
    weightAttempts++;if(right){weightDone=true;weightRight++;}
    show("weight",right?"Correct. One "+weight.item+" weighs "+weight.x+" units.":"Try again. Match the original two pan totals.",[right?describe(weight.e):eqText(weight.e),"Accuracy: "+weightRight+" correct in "+weightAttempts+" attempts."]);
  });
  wire("weight","reveal",()=>{
    show("weight",weight.x+" units per "+weight.item+".",steps(weight.e).map(s=>s.reason+" "+s.equation+"."));
    present("weight",{e:parse("x = "+weight.x),mode:"physical",label:"?"});
  });
  let tileLists=[[],[]],tileHistory=[];
  const tileValue={ "x+":1,"x-":-1,"u+":1,"u-":-1 };
  function makeTiles(list){
    return simplify(q(list.filter(x=>x.startsWith("x")).reduce((sum,x)=>sum+tileValue[x],0)),q(list.filter(x=>x.startsWith("u")).reduce((sum,x)=>sum+tileValue[x],0)));
  }
  function visibleTiles(list){
    return list.length?list.map(k=>[k.endsWith("-")?(k.startsWith("x")?"−x":"−1"):(k.startsWith("x")?"+x":"+1"),k==="x+"?positiveTile:k==="x-"?negativeTile:k==="u+"?positiveUnit:negativeUnit,k.endsWith("-")]):[["0",paper]];
  }
  const currentTiles=()=>({left:makeTiles(tileLists[0]),right:makeTiles(tileLists[1]),v:"x"});
  function tilesReport(message,detail){
    const e=currentTiles();
    show("tiles",message??eqText(e),detail??["Left tiles: "+visibleTiles(tileLists[0]).map(t=>t[0]).join(", ")+".","Right tiles: "+visibleTiles(tileLists[1]).map(t=>t[0]).join(", ")+".","An opposite pair sums to zero. A unit and a variable tile are unlike terms."]);
    present("tiles",{e,tiles:tileLists.map(visibleTiles)});
  }
  function tileRemember(){
    tileHistory.push(tileLists.map(a=>a.slice()));if(tileHistory.length>30)tileHistory.shift();
  }
  function tileAdd(both=false,pair=false){
    const side=value("tiles-side")==="L"?0:1,kind=value("tiles-kind"),indices=both?[0,1]:[side];
    if(indices.some(i=>tileLists[i].length+(pair?2:1)>13))throw new RangeError("Use up to 13 tiles per side. Combine opposite pairs to make space.");
    tileRemember();
    for(const i of indices){
      tileLists[i].push(kind);
      if(pair)tileLists[i].push(kind[0]+(kind[1]==="+"?"-":"+"));
    }
    tilesReport();
  }
  function fromInteger(a,b){
    return [[a,"x"],[b,"u"]].flatMap(([c,k])=>Array(Math.abs(c)).fill(k+(c<0?"-":"+")));
  }
  wire("tiles","add",()=>tileAdd());wire("tiles","both",()=>tileAdd(true));wire("tiles","zero",()=>tileAdd(false,true));
  wire("tiles","undo",()=>{if(tileHistory.length)tileLists=tileHistory.pop();tilesReport();});
  wire("tiles","clear",()=>{tileRemember();tileLists=[[],[]];tilesReport();});
  wire("tiles","combine",()=>{
    tileRemember();const e=currentTiles(),count=tileLists.flat().length;
    tileLists=[e.left,e.right].map(side=>fromInteger(number(side.a),number(side.b)));
    tilesReport("Cancelled "+(count-tileLists.flat().length)+" tiles in zero pairs. "+eqText(e));
  });
  wire("tiles","expand",()=>{
    tileRemember();tileLists=[fromInteger(-2,6),fromInteger(0,4)];
    tilesReport("−2(x − 3) expands to −2x + 6.",["Multiply x by −2, giving two negative x tiles.","Multiply −3 by −2, giving six positive unit tiles.","The demonstration’s right side is 4. Solve −2x + 6 = 4 to get x = 1."]);
  });
  wire("tiles","solve",()=>{
    const e=currentTiles();
    tilesReport(describe(e),steps(e).map(s=>s.reason+" "+s.equation+"."));
  });
  init.tiles=()=>{tileLists=[fromInteger(2,2),fromInteger(0,10)];tilesReport();};
  function timeline(id,prepare){
    let data,index=0,timer=0,reveal=false,trying=false;
    function halt(){
      clearTimeout(timer);timer=0;
    }
    function draw(g,t,data){
      if(!data)return;
      caption(g,data.label,55,blue,26);
      const gradient=data.trying?"#fff1d7":"#e2f3f4";
      g.box(55,118,490,123,gradient,"#7ca7b8");
      caption(g,data.trying?"Predict the next equation":data.equation,178,ink,32);
      caption(g,data.reveal?data.reason:"Equivalent transformations",310,good,20);
    }
    preview(id,draw);
    function render(animation=false){
      const row=data.lines[index],explanation=reveal?row.reason:"Reveal the explanation or move to the next step.";
      show(id,"Step "+(index+1)+" of "+data.lines.length+" · "+(trying?"Predict the next equation.":row.equation),
        [explanation,...(!trying&&index>=data.lines.length-1?[data.final]:[])]);
      present(id,{label:trying?"Try it first":row.title??(index===0?"Starting equation":"Keep both sides equal"),equation:row.equation,reason:row.reason,reveal,trying},animation);
      $(id+"-prev").disabled=index===0;
      $(id+"-next").disabled=index===data.lines.length-1;
    }
    function start(){
      halt();data=prepare();index=0;reveal=false;trying=false;render();
    }
    function forward(){
      if(index<data.lines.length-1)index++;
      reveal=false;trying=false;render(true);
    }
    function loop(){
      if(!$(("tool-")+id).open||index>=data.lines.length-1){halt();return;}
      if(index<data.lines.length-1)index++;
      reveal=true;trying=false;render(true);
      timer=setTimeout(loop,1300*Number(value(id+"-speed")));
    }
    function play(){
      halt();if(index>=data.lines.length-1)index=0;
      reveal=true;trying=false;render();timer=setTimeout(loop,950*Number(value(id+"-speed")));
    }
    wire(id,"start",start);wire(id,"next",()=>{halt();forward();});
    wire(id,"prev",()=>{halt();index=Math.max(0,index-1);reveal=false;trying=false;render();});
    wire(id,"restart",()=>{halt();index=0;reveal=false;trying=false;render();});
    wire(id,"play",play);wire(id,"pause",halt);
    wire(id,"try",()=>{halt();trying=true;reveal=false;render();});
    wire(id,"why",()=>{reveal=true;trying=false;render();});
    on("tool-"+id,"toggle",()=>{if(!$("tool-"+id).open)halt();});
    init[id]=start;
  }
  function solveSetup(id,clear=false){
    const e=equation(id),initial=value(id+"-equation").trim().replace(/\s+/g," ");
    return {lines:[{equation:initial,reason:"Read both sides as expressions. Identify terms with the same unknown."},...steps(e,{denominators:clear})],final:describe(e)};
  }
  timeline("solver",()=>solveSetup("solver"));
  timeline("fraction",()=>solveSetup("fraction",true));
  timeline("bracket",()=>{
    const factor=read("bracket-factor"),a=read("bracket-a"),b=read("bracket-b"),rhs=read("bracket-rhs");
    const inside=affineText(simplify(a,b)),L="("+plain(factor)+")("+inside+")",raw=L+" = "+write(rhs),e=parse(raw);
    const expand={equation:eqText(e),reason:write(factor)+" × "+write(a)+" gives coefficient "+write(times(factor,a))+"; "+write(factor)+" × "+write(b)+" gives constant "+write(times(factor,b))+"."};
    return {lines:[{equation:raw,reason:"The outside factor multiplies each term inside the bracket."},expand,...steps(e).slice(1)],final:describe(e)};
  });
  let transposeStack=[];
  function transposeReport(message,details=[]){
    const e=transposeStack.at(-1);
    show("transpose",message??eqText(e),details);
    present("transpose",{e,step:"Same operation on both sides"});
  }
  function transposeStart(){transposeStack=[equation("transpose")];transposeReport();}
  init.transpose=transposeStart;wire("transpose","start",transposeStart);
  wire("transpose","back",()=>{if(transposeStack.length>1)transposeStack.pop();transposeReport();});
  wire("transpose","apply",()=>{
    if(transposeStack.length>20)throw new RangeError("Reset before making more transformations.");
    const e=transposeStack.at(-1),target=value("transpose-term");
    let valueUsed,operator,short;
    if(target==="constant"){
      valueUsed=e.left.b;operator="sub";
      short="Short form: move "+write(valueUsed)+" to the right with the opposite sign.";
    }else if(target==="variable"){
      valueUsed=e.right.a;operator="subx";
      short="Short form: subtract the right-side variable term on the left.";
    }else{
      if(e.left.b.n||e.right.a.n)throw new RangeError("First collect variable terms on the left and remove the left-side constant.");
      valueUsed=e.left.a;operator="div";short="Short form: the multiplying coefficient becomes the divisor.";
    }
    if(!valueUsed.n)throw new RangeError("There is no nonzero term or factor of that type to remove.");
    const next=apply(e,operator,valueUsed);transposeStack.push(next);
    transposeReport(eqText(next),[explainOp(operator,valueUsed,e.v),short,isolated(next)?describe(transposeStack[0]):"Continue until the unknown is alone."]);
  });
  function generate(){
    const x=read("generator-target"),b=read("generator-add"),factor=read("generator-factor"),c=read("generator-variable");
    if(!factor.n)throw new RangeError("Choose a nonzero multiplier.");
    const initial={v:"x",left:simplify(q(1)),right:simplify(q(0),x)},one=apply(initial,"add",b),two=apply(one,"mul",factor),three=apply(two,"addx",c);
    const all=[one,two,three];
    if(!all.every(t=>equivalent(initial,t)))throw Error("Generated equation lost its solution.");
    const coefficient=factor.d===1n?write(factor):"("+write(factor)+")";
    const bracket=coefficient+"("+affineText(one.left)+") = "+write(two.right.b);
    show("generator","Generated equations with x = "+write(x)+".",[
      "Add a constant: "+eqText(one)+".",
      "Multiply both sides: "+bracket+".",
      "Expanded form: "+eqText(two)+".",
      "Add the same variable term to both sides: "+eqText(three)+".",
      "Substitution check: all four equalities hold at x = "+write(x)+"."
    ]);
  }
  wire("generator","build",generate);init.generator=generate;
  let chainStack=[];
  function chainReport(){
    show("chain","Current equation: "+eqText(chainStack.at(-1).e)+".",
      chainStack.map((r,i)=>(i===0?"Start: ":r.reason+" ")+eqText(r.e)));
  }
  function chainStart(){chainStack=[{e:equation("chain"),reason:""}];chainReport();}
  init.chain=chainStart;wire("chain","start",chainStart);
  wire("chain","apply",()=>{
    if(chainStack.length>=18)throw new RangeError("This chain holds up to 18 links. Reverse one or start again.");
    const e=chainStack.at(-1).e,amount=read("chain-amount"),operation=value("chain-op");
    const next=apply(e,operation,amount);
    chainStack.push({e:next,reason:explainOp(operation,amount,e.v)});chainReport();
  });
  wire("chain","back",()=>{if(chainStack.length>1)chainStack.pop();chainReport();});
  function brahma(){
    const [A,B,C,D]=["a","b","c","d"].map(k=>read("brahma-"+k));
    const e={v:"x",left:simplify(A,B),right:simplify(C,D)},result=solve(e);
    const numerator=minus(D,B),denominator=minus(A,C);
    show("brahma",describe(e),["Ax + B = Cx + D becomes "+eqText(e)+".",
      "D − B = "+write(D)+" − ("+write(B)+") = "+write(numerator)+".",
      "A − C = "+write(A)+" − ("+write(C)+") = "+write(denominator)+".",
      result.kind==="one"?"Divide the constant difference by the coefficient difference to get "+write(result.answer)+".":"A = C, so do not divide. Compare the constants instead."]);
    present("brahma",{e,step:"(A − C)x = D − B"});
  }
  init.brahma=brahma;wire("brahma","run",brahma);
  let patternState;
  function drawPattern(g,t,d){
    if(!d)return;
    const n=d.shown,style=d.kind;
    const side=Math.min(82,510/(style==="teeth"?(n+1)/2:n));
    const width=style==="teeth"?side*(n+1)/2:side*n,left=(600-width)/2,base=236;
    const sticks=new Map();
    const pointKey=p=>p.map(x=>x.toFixed(5)).join(",");
    function stick(a,b){
      const k=[pointKey(a),pointKey(b)].sort().join("/");
      if(!sticks.has(k))sticks.set(k,[a,b]);
    }
    for(let i=0;i<n;i++){
      let corners;
      if(style==="teeth"){
        const top=base-Math.sqrt(3)*side/2,x=left+i*side/2;
        corners=[[x,i%2?top:base],[x+side/2,i%2?base:top],[x+side,i%2?top:base]];
      }else{
        const x=left+i*side;
        corners=[[x,base],[x,base-side],[x+side,base-side],[x+side,base]];
      }
      corners.forEach((p,j)=>stick(p,corners[(j+1)%corners.length]));
    }
    caption(g,"Position "+d.pos+(d.pos>d.shown?" · first "+d.shown+" units shown":""),67,blue,29);
    [...sticks.values()].forEach(([a,b],i)=>{
      if(i>=Math.ceil(sticks.size*t))return;
      g.line(a,b,"#995f1a",Math.max(3,Math.min(7,side/8)));g.dot(...b,Math.max(2,Math.min(5,side/13)),red);
    });
    caption(g,d.rule+" → "+d.total+" sticks",307,good,28);
  }
  preview("pattern",drawPattern);
  function pattern(message,details){
    const kind=value("pattern-kind"),pos=whole("pattern-position",1,100),s=kind==="teeth"?2:3,rule=s+"n + 1",total=s*pos+1;
    patternState={kind,pos,rule,total,shown:Math.min(pos,14)};
    show("pattern",message??("Position "+pos+" uses "+total+" sticks."),details??[
      "First unit: "+(s+1)+" sticks. Each added unit shares one edge and adds "+s+" sticks.",
      "Total: "+rule+"."
    ]);
    present("pattern",patternState);
  }
  init.pattern=pattern;change("pattern","kind",pattern);wire("pattern","draw",pattern);
  for(const [key,by] of [["plus",1],["minus",-1]])wire("pattern",key,()=>{
    const n=whole("pattern-position",1,100)+by;
    if(n<1||n>100)throw new RangeError("Choose a position from 1 to 100.");
    $("pattern-position").value=n;pattern();
  });
  wire("pattern","solve",()=>{
    const s=value("pattern-kind")==="teeth"?2:3,target=whole("pattern-target",1,301);
    const n=over(q(target-1),q(s)),possible=n.d===1n&&n.n>0n&&n.n<=100n;
    if(possible)$("pattern-position").value=write(n);
    pattern(possible?"Position "+write(n)+" uses exactly "+target+" sticks.":"No allowed whole-number position for "+target+" sticks.",[
      "Equation: "+s+"n + 1 = "+target+". Subtract 1 and divide by "+s+".",
      "Computed position: "+write(n)+". This activity draws positions 1 through 100."
    ]);
  });
  const formations=[
    {token:"x",story:"Five more than twice a number is nineteen.",eq:"2x + 5 = 19",hint:"Double the unknown first, then add 5."},
    {token:"x",story:"A bag and four units balance twelve units.",eq:"x + 4 = 12",hint:"The bag contributes its weight once."},
    {token:"x",story:"Three notebooks and a fixed charge of 12 rupees cost 87 rupees.",eq:"3x + 12 = 87",hint:"Use one fixed charge plus three item prices."},
    {token:"x",story:"A student has seven more cards than a friend. Their total is 45. Let your variable represent the smaller amount.",eq:"x + (x + 7) = 45",hint:"Model both quantities using the same variable."},
    {token:"x",story:"Two plans cost 150 + 25 per month and 230 + 15 per month. When do they cost the same?",eq:"150 + 25x = 230 + 15x",hint:"Set the full amounts equal."}
  ];
  let formationIndex=0;
  function formationPrompt(){
    const row=formations[formationIndex],v=value("formation-variable");
    show("formation",row.story,["Use "+v+" for the unknown quantity."]);
  }
  init.formation=formationPrompt;change("formation","variable",formationPrompt);
  function newFormation(){
    const level=Number(value("formation-level")),list=level===1?[0,1]:level===2?[1,2,3]:[3,4];
    formationIndex=pick(list.filter(i=>i!==formationIndex));$("formation-equation").value="";formationPrompt();
  }
  wire("formation","new",newFormation);change("formation","level",newFormation);
  wire("formation","hint",()=>show("formation",formations[formationIndex].story,[formations[formationIndex].hint]));
  wire("formation","check",()=>{
    const actual=equation("formation"),row=formations[formationIndex],v=value("formation-variable"),target= M.parse(row.eq.replaceAll("x",v));
    const accepted=equivalent(actual,target);
    show("formation",accepted?"Correct. Your equation has the required solution.":"The model gives a different solution.",[
      "A model for this problem is "+row.eq.replaceAll("x",v)+".",accepted?describe(target):row.hint
    ]);
  });
  function insertSymbol(text){
    const field=$("formation-equation");
    if(!/^[xmp0-9+\-−×÷()=]$/.test(text))return;
    const start=field.selectionStart??field.value.length,end=field.selectionEnd??start;
    if(field.value.length>=180)return;
    field.setRangeText(text,start,end,"end");field.focus();
  }
  for(const b of $("formation-symbols").querySelectorAll("[data-symbol]")){
    const symbol=()=>b.dataset.symbol==="x"?value("formation-variable"):b.dataset.symbol;
    b.addEventListener("click",()=>insertSymbol(symbol()));
    b.addEventListener("dragstart",e=>e.dataTransfer.setData("text/plain",symbol()));
  }
  on("formation-equation","dragover",e=>e.preventDefault());
  on("formation-equation","drop",e=>{e.preventDefault();insertSymbol(e.dataTransfer.getData("text/plain"));});
  let magic;
  preview("magic",(g,t,d)=>{
    if(!d)return;
    caption(g,"A fixed result from many starting values",49,blue,26);
    const x=48,w=116;
    ["Start","Multiply","Add","Divide"].forEach((name,i)=>{
      const xpos=x+i*132;
      g.box(xpos,119,w,103,i<=d.index?"#dbf2e8":"#e6eef9",ink);
      g.text(name,xpos+w/2,151,ink,19);
      g.text(i<=d.index?write(d.values[i]):"?",xpos+w/2,190,ink,19);
    });
    caption(g,d.index===4?"Subtract the start → "+write(d.values[4]):"The original variable cancels in the last step.",293,good,22);
  });
  function orderMagic(){
    const x=read("magic-x"),mode=value("magic-mode");
    const k=mode==="custom"?read("magic-k"):q(mode==="twice"?2:3);
    const final=mode==="custom"?read("magic-t"):q(mode==="twice"?-3:4);
    if(!k.n)throw new RangeError("A magic trick needs a nonzero multiplier.");
    const difference=times(k,final),a=times(x,k),b=plus(a,difference),c=over(b,k),d=minus(c,x);
    magic={x,k,final,difference,index:0,values:[x,a,b,c,d]};
    $("magic-answer").value="";magicStage();
  }
  function magicStage(message){
    const {values,index,k,difference}=magic;
    const ops=["Multiply the starting number by "+write(k)+".","Add "+write(difference)+".","Divide by "+write(k)+".","Subtract the original starting number.","Finished. The final value is "+write(values[4])+"."];
    show("magic",message??ops[index],[index<4?"Current number: "+write(values[index])+". "+ops[index]:"The original number cancels and the result is fixed."]);
    present("magic",magic);
  }
  init.magic=orderMagic;wire("magic","start",orderMagic);change("magic","mode",orderMagic);
  wire("magic","check",()=>{
    if(magic.index>=4)return magicStage();
    if(!same(read("magic-answer"),magic.values[magic.index+1]))return magicStage("Try again. Do just the next operation.");
    magic.index++;$("magic-answer").value="";magicStage(magic.index===4?null:"Correct. Continue with the next instruction.");
  });
  wire("magic","reveal",()=>{
    const {k,final,difference}=magic;magic.index=4;present("magic",magic);
    show("magic","The result is always "+write(final)+".",[
      "Start with x, multiply by "+write(k)+" and add "+write(difference)+".",
      "Dividing by "+write(k)+" gives x + ("+write(final)+").",
      "Subtract the original x to leave "+write(final)+"."
    ]);
  });
  const markets={
    books:{title:"Bookshop order",story:"Three identical books and a fixed delivery charge of 30 rupees cost 210 rupees. What is one book’s price?",eq:"3x + 30 = 210",items:["Book","Book","Book"],charge:"Delivery: 30",total:"Bill: 210 rupees",answer:"60 rupees per book"},
    compare:{title:"Compare offers",story:"Shop A costs 2x + 12 rupees. Shop B costs 3x − 8 rupees. At what item price x are the two offers equal?",eq:"2x + 12 = 3x − 8",items:["Shop A","Shop B"],charge:"Compare",total:"Equal purchase costs",answer:"20 rupees per item"},
    budget:{title:"Budget at the till",story:"You have 300 rupees, buy four same-price notebooks and have 60 rupees left. What is the price per notebook?",eq:"4x + 60 = 300",items:["Book","Book","Book","Book"],charge:"Change: 60",total:"Budget: 300 rupees",answer:"60 rupees per notebook"}
  };
  let market;
  preview("market",(g,t,d)=>{
    if(!d)return;
    caption(g,d.title,46,blue,28);
    const w=100,m=102,start=(600-m*d.items.length)/2;
    g.box(59,107,482,155,"#f1eddf","#9d7e58");
    for(let i=0;i<Math.ceil(d.items.length*t);i++){
      g.box(start+i*m,135,w-12,80,mystery,ink);
      g.text(d.items[i],start+i*m+(w-12)/2,161,ink,17);
      g.text(d.items.length===2?(i?"3x − 8":"2x + 12"):(d.reveal?"60":"x"),start+i*m+(w-12)/2,190,ink,18);
    }
    caption(g,d.charge+" · "+d.total,294,good,23);
    if(d.reveal)caption(g,d.answer,335,ink,20);
  });
  function marketPrompt(){
    market=markets[value("market-mode")];
    $("market-answer").value="";
    show("market",market.story,["Keep the fixed part separate from the repeated price."]);
    present("market",{...market,reveal:false});
  }
  init.market=marketPrompt;change("market","mode",marketPrompt);
  function revealMarket(){
    const e=parse(market.eq);
    show("market",market.answer+".",["Model: "+market.eq+".",...steps(e).map(r=>r.reason+" "+r.equation+".")]);
    present("market",{...market,reveal:true});
  }
  wire("market","show",revealMarket);
  wire("market","check",()=>{
    if(same(read("market-answer"),solve(parse(market.eq)).answer))revealMarket();
    else show("market","Try again. "+market.story,["Use an x term for each identical item and add the fixed charge once."]);
  });
  const ages={
    future:{story:"Mira’s sister is four years older. In three years they will total 32 years. Find Mira’s current age.",shift:3,gap:4,eq:"(x + 3) + (x + 7) = 32",names:["Mira","Sister"]},
    past:{story:"Lina is five years older than Veena. Two years ago they totalled 25. Find Veena’s current age.",shift:-2,gap:5,eq:"(x − 2) + (x + 3) = 25",names:["Veena","Lina"]},
    ratio:{story:"Arun’s uncle is twenty years older. In five years the uncle will be twice Arun’s age. Find Arun’s current age.",shift:5,gap:20,eq:"x + 25 = 2(x + 5)",names:["Arun","Uncle"]}
  };
  let age;
  preview("age",(g,t,d)=>{
    if(!d)return;
    caption(g,"Both ages change by the same time interval",49,blue,26);
    for(let i=0;i<2;i++){
      const y=139+i*97,before=d.reveal?number(d.x)+i*d.gap:i?"x + "+d.gap:"x";
      const after=d.reveal?Number(before)+d.shift:String(before)+(d.shift<0?" − ":" + ")+Math.abs(d.shift);
      g.line([128,y],[472,y],purple,4);
      g.dot(163,y,8,teal);g.dot(441,y,8,blue);
      g.text(d.names[i]+" now: "+before,163,y-27,ink,17);
      g.text(String(after),441,y-27,ink,17);
      g.text(d.shift<0?"−"+Math.abs(d.shift)+" years":"+"+d.shift+" years",300,y+22,ink,17);
    }
    caption(g,d.shift<0?"Second column: past ages":"Second column: future ages",330,good,20);
  });
  function agePrompt(){
    age=ages[value("age-mode")];
    $("age-answer").value="";show("age",age.story,["Define x as "+age.names[0]+"’s current age."]);
    present("age",{...age,reveal:false});
  }
  init.age=agePrompt;change("age","mode",agePrompt);
  function revealAge(){
    const e=parse(age.eq),x=solve(e).answer,older=plus(x,q(age.gap));
    show("age",age.names[0]+": "+write(x)+" years. "+age.names[1]+": "+write(older)+" years.",[
      "Model: "+age.eq+".",...steps(e).map(r=>r.reason+" "+r.equation+"."),
      "Compare both ages after applying the same time shift."
    ]);
    present("age",{...age,x,reveal:true});
  }
  wire("age","show",revealAge);wire("age","check",()=>{
    if(same(read("age-answer"),solve(parse(age.eq)).answer))revealAge();
    else show("age","Try again. "+age.story,["The same shift applies to both people."]);
  });
  const geometryTasks={
    rectangle:{q:"The width is x cm, the length is x + 3 cm, and the perimeter is 30 cm.",eq:"2x + 2(x + 3) = 30",form:"rectangle",dims:[6,9]},
    square:{q:"A square has side x cm and perimeter 44 cm.",eq:"4x = 44",form:"square",dims:[11,11]},
    triangle:{q:"A triangle has angles x, x + 10 and 2x − 10 degrees.",eq:"x + (x + 10) + (2x − 10) = 180",form:"triangle",dims:[45,55,80]}
  };
  let geometry;
  preview("geometry",(g,t,d)=>{
    if(!d)return;
    caption(g,d.form==="triangle"?"Triangle angle sum":"All side lengths count",50,blue,28);
    if(d.form==="triangle"){
      const A=[160,275],B=[440,275];
      const ar=d.reveal?Math.PI*d.dims[0]/180:Math.PI/4,br=d.reveal?Math.PI*d.dims[1]/180:Math.PI*55/180;
      const y=(B[0]-A[0])/(1/Math.tan(ar)+1/Math.tan(br));
      const C=[A[0]+y/Math.tan(ar),A[1]-y];
      g.poly([A,B,C],"#e7f3ff",ink);
      g.text(d.reveal?d.dims[0]+"°":"x",186,295,ink,19);
      g.text(d.reveal?d.dims[1]+"°":"x + 10°",414,295,ink,19);
      g.text(d.reveal?d.dims[2]+"°":"2x − 10°",C[0],C[1]-19,ink,19);
    }else{
      const w=d.form==="square"?176:276,h=d.form==="square"?176:d.reveal?w*d.dims[0]/d.dims[1]:153;
      g.box(300-w/2,185-h/2,w,h,"#e6f3ff",ink);
      g.text(d.reveal?d.dims[1]+" cm":d.form==="square"?"x":"x + 3",300,185-h/2-20,ink,19);
      g.text(d.reveal?d.dims[0]+" cm":"x",300+w/2+46,185,ink,19);
    }
    caption(g,d.reveal?"The dimensions satisfy the original condition.":"Use the stated perimeter or angle sum.",336,good,19);
  });
  function geometryPrompt(){
    geometry=geometryTasks[value("geometry-mode")];$("geometry-equation").value="";
    show("geometry",geometry.q,["Use a single variable in the equation."]);
    present("geometry",{...geometry,reveal:false});
  }
  init.geometry=geometryPrompt;change("geometry","mode",geometryPrompt);
  function geometryReveal(){
    const e=parse(geometry.eq);
    const valid=geometry.dims.every(x=>x>0)&&(geometry.form!=="triangle"||geometry.dims.reduce((sum,d)=>sum+d,0)===180);
    show("geometry",valid?"Verified dimensions: "+geometry.dims.join(geometry.form==="triangle"?"°, ":" cm, ")+(geometry.form==="triangle"?"°":" cm")+".":"This would not form a valid figure.",[
      "Model: "+geometry.eq+".",...steps(e).map(r=>r.reason+" "+r.equation+".")
    ]);
    present("geometry",{...geometry,reveal:valid});
  }
  wire("geometry","show",geometryReveal);wire("geometry","check",()=>{
    if(equivalent(equation("geometry"),parse(geometry.eq)))geometryReveal();
    else show("geometry","The equation gives a different result.",[geometry.q,geometry.form==="triangle"?"The three angles sum to 180°.":"Add all the side lengths."]);
  });
  const rooms=[
    {name:"Mystery Weight Chamber",prompt:"Two identical boxes and 2 units balance 8 units. Find each box’s weight.",hint:"Subtract 2 from both pans.",eq:"2x + 2 = 8",digit:"3"},
    {name:"Matchstick Vault",prompt:"The textbook pattern has 2n + 1 sticks. Find the position that uses 15 sticks.",hint:"Subtract 1, then divide by 2.",eq:"2n + 1 = 15",digit:"7"},
    {name:"Equation Lock",prompt:"Solve 5x + 1 = 2x + 13.",hint:"Remove the 2x on both sides first.",eq:"5x + 1 = 2x + 13",digit:"4"},
    {name:"Brahmagupta’s Ancient Library",prompt:"Apply the coefficient and constant differences to 8x − 5 = 6x + 7.",hint:"Subtract −5 from 7 and subtract 6 from 8.",eq:"8x − 5 = 6x + 7",digit:"6"},
    {name:"Mathematical Magic Chamber",prompt:"Double a starting value, add 4, halve it and subtract the original value. What result is left?",hint:"After halving, what was added to the original value?",eq:"x = 2",digit:"2"}
  ];
  const got=()=>Math.min(5,Math.max(0,Number.isInteger(saved.room)?saved.room:0));
  preview("escape",(g,t,d)=>{
    if(!d)return;
    caption(g,"Algebra detective",52,blue,31);
    for(let i=0;i<rooms.length;i++){
      const x=63+i*97,y=127,c=i<d.count?"#d7f2e3":i===d.count?"#ffe4a7":"#dfebfb";
      g.box(x,y,88,110,c,ink);
      g.text("Room "+(i+1),x+44,y+30,ink,16);
      g.text(i<d.count?rooms[i].digit:"?",x+44,y+72,i<d.count?good:purple,29);
    }
    caption(g,d.count===5?"Code unlocked: "+rooms.map(x=>x.digit).join(""):d.count+" of 5 rooms open",299,good,27);
  });
  function escapeReport(message){
    const count=got(),room=rooms[count];
    show("escape",message??(room?"Room "+(count+1)+" · "+room.name:"All rooms unlocked. Code: "+rooms.map(x=>x.digit).join("")+"."),
      room?[room.prompt]:["Achievement: Algebra Detective. Every lock used a checked solution."]);
    present("escape",{count});
  }
  init.escape=escapeReport;
  wire("escape","hint",()=>{
    const i=got(),r=rooms[i];
    if(r)show("escape","Hint · "+r.name,[r.prompt,r.hint]);
  });
  wire("escape","reset",()=>{saved.room=0;store();$("escape-answer").value="";escapeReport();});
  wire("escape","check",()=>{
    const i=got(),r=rooms[i];
    if(!r)return escapeReport();
    if(!same(read("escape-answer"),solve(parse(r.eq)).answer)){
      show("escape","Try the current lock again.",[r.prompt,r.hint]);return;
    }
    saved.room=i+1;store();$("escape-answer").value="";
    escapeReport(i===4?"All rooms unlocked. Code: "+rooms.map(x=>x.digit).join("")+".":"Correct. Room "+(i+1)+" unlocked digit "+r.digit+".");
    const explanation=document.createElement("p");
    explanation.textContent=i===4?"The expression becomes (2n + 4)/2 − n = 2.":describe(parse(r.eq));
    $("escape-work").append(explanation);
  });
  const errors=[
    {start:"4x + 6 = 22",lines:["4x + 6 = 22","4x = 22 + 6","x = 7"],first:"2",why:"sub",right:"Subtract 6 from both sides, then divide by 4. The solution is x = 4."},
    {start:"6x + 9 = 33",lines:["x + 9 = 11","x = 11 − 9","x = 2"],first:"1",why:"all",right:"Dividing every term by 3 gives 2x + 3 = 11, leading to x = 4."},
    {start:"−5x = 20",lines:["−5x = 20","x = 20/5","x = 4"],first:"2",why:"sign",right:"Divide by −5. The exact result is x = −4."},
    {start:"x = 9",lines:["x = 9","0x = 0","Every value is a solution of the starting equation."],first:"2",why:"zero",right:"Multiplying by zero changes the solution set. The original allows only x = 9."}
  ];
  let mistake=0;
  function error(){
    const t=errors[mistake];
    show("error","Starting equation: "+t.start+".",t.lines.map((s,i)=>"Line "+(i+1)+": "+s));
  }
  init.error=error;wire("error","new",()=>{mistake=(mistake+1)%errors.length;error();});
  wire("error","check",()=>{
    const t=errors[mistake],ok=t.first===value("error-line")&&t.why===value("error-fix");
    show("error",ok?"Correct. Line "+t.first+" is the first invalid step.":"Review where the equation first changes its solutions.",[...t.lines,t.right]);
  });
  let round,timer;
  function arenaQuestion(level){
    const x=rand(-8,14),a=rand(2,8),b=rand(2,11);
    const modes=level===1?["add","mul","two"]:level===2?["two","negative","fraction","model"]:["negative","fraction","bracket","twoSides","model","error"];
    const mode=pick(modes);
    let raw,message;
    if(mode==="add")raw="x + "+b+" = "+(x+b);
    if(mode==="mul")raw=a+"x = "+a*x;
    if(mode==="two")raw=a+"x + "+b+" = "+(a*x+b);
    if(mode==="negative")raw="−"+a+"x + "+b+" = "+(-a*x+b);
    if(mode==="fraction")raw="x/"+a+" + 1/2 = "+(2*x+a)+"/"+(2*a);
    if(mode==="bracket")raw=a+"(x − "+b+") = "+a*(x-b);
    if(mode==="twoSides")raw=(a+2)+"x + "+b+" = 2x + ("+(a*x+b)+")";
    if(mode==="model"){
      raw=a+"x + "+b+" = "+(a*Math.abs(x)+b);
      message="A delivery fee of "+b+" and "+a+" equal prices give a total of "+(a*Math.abs(x)+b)+". Find one price.";
    }
    if(mode==="error"){raw="−"+a+"x = "+(-a*x);message="A learner divides by "+a+" in "+raw+". Give the corrected value of x.";}
    const e=parse(raw);
    return {prompt:message??"Solve "+raw+".",e,answer:solve(e).answer};
  }
  function arenaStats(){
    $("arena-score").textContent=(round?round.points+" points · "+round.correct+"/"+round.attempts+" correct · streak "+round.streak+". ":"")+"Best score: "+saved.best+".";
    if(!$("tool-escape").querySelector(".ground-live").hidden&&$("tool-escape").open&&got()===0)escapeReport();
  }
  function nextArena(){
    if(!round?.active)return;
    round.task=arenaQuestion(Number(value("arena-level")));round.locked=false;$("arena-answer").value="";
    show("arena",round.task.prompt);
  }
  function arenaStop(msg){
    clearInterval(timer);timer=null;if(round)round.active=false;show("arena",msg);arenaStats();
  }
  wire("arena","start",()=>{
    clearInterval(timer);
    const seconds=Number(value("arena-mode")),deadline=Date.now()+1000*seconds;
    round={active:true,locked:false,points:0,attempts:0,correct:0,streak:0};
    $("arena-clock").textContent=seconds?seconds+" seconds":"Untimed";
    if(seconds)timer=setInterval(()=>{
      const left=Math.max(0,Math.ceil((deadline-Date.now())/1000));
      $("arena-clock").textContent=left+" seconds";if(!left)arenaStop("Time is up. Try a new round to practise again.");
    },250);
    nextArena();arenaStats();
  });
  wire("arena","next",nextArena);wire("arena","stop",()=>arenaStop("Round ended."));
  wire("arena","check",()=>{
    if(!round?.active||round.locked)return;
    const guess=read("arena-answer"),task=round.task,ok=same(guess,task.answer);
    round.locked=true;round.attempts++;
    if(ok){
      round.correct++;round.streak++;round.points+=10+(round.streak%3===0?5:0);
      if(round.points>saved.best){saved.best=round.points;store();}
      const tool=$("tool-arena");tool.classList.remove("ground-celebrate");requestAnimationFrame(()=>tool.classList.add("ground-celebrate"));
    }else round.streak=0;
    show("arena",(ok?"Correct. ":"The bot gives ")+describe(task.e),[
      ...steps(task.e).map(r=>r.reason+" "+r.equation+"."),
      ...(ok&&round.streak%3===0?["Achievement: "+round.streak+" correct in a row. Five bonus points."]:[])
    ]);arenaStats();
  });
  for(const id of ["weight","magic","market","age","escape","arena"])
    on(id+"-answer","keydown",e=>{if(e.key==="Enter")$(id+"-check").click();});
  document.querySelector(".ground-hero").addEventListener("click",event=>{
    const link=event.target.closest("[data-open-tool]");if(link)document.querySelector(link.hash).open=true;
  });
  for(const [id,setup] of Object.entries(init)){
    const panel=$("tool-"+id);
    function open(){
      if(!panel.open)return;
      panel.removeEventListener("toggle",open);run(id,setup);
    }
    panel.addEventListener("toggle",open);open();
  }
  article.querySelectorAll(".ground-live").forEach(node=>{node.hidden=false;});
  arenaStats();
})();
