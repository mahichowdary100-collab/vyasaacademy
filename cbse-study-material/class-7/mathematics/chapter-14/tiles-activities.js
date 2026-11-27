(() => {
  "use strict";
  const M=window.TilesMath;
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
  const key="vyasa-class7-constructions-and-tilings-v1";
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
    function dash(a,b,colour=ink,width=2){ctx.save();ctx.setLineDash([6,5]);line(a,b,colour,width);ctx.restore();}
    function outline(points,fill,colour,width){
      if(fill){ctx.fillStyle=fill;ctx.fill();}
      if(colour){ctx.strokeStyle=colour;ctx.lineWidth=width;ctx.stroke();}
    }
    function poly(points,fill,colour=ink,width=2){
      ctx.beginPath();ctx.moveTo(...points[0]);points.slice(1).forEach(p=>ctx.lineTo(...p));ctx.closePath();outline(points,fill,colour,width);
    }
    function arc(c,r,a,b,colour=ink,width=2){ctx.beginPath();ctx.arc(...c,r,a,b,b<a);outline(null,null,colour,width);}
    function wedge(c,r,a,b,fill,colour,width){ctx.beginPath();ctx.moveTo(...c);ctx.arc(...c,r,a,b);ctx.closePath();outline(null,fill,colour,width);}
    return {line,text,box,dot,dash,poly,arc,wedge};
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
  const {add,sub,mul,dot,cross,length,distance,mid,polar,rad,perp,circles,lineIntersection,lineCircle,polygon,area,contains,coverage,overlaps,cell,domino,interior,hexWalk,tangram}=M;
  const colours=["#bbd8fa","#abe5d2","#ffe3a0","#dbcbf3","#f2b2b4"];
  const orange="#9b4d13",paper="#edf2fa",pencil="#56647a",fill="#bfdef0";
  const basePoint=[280,245],fmt=n=>String(Number(n.toFixed(2)));
  const pointText=p=>"("+p.map(fmt).join(", ")+")";
  const tools={};
  function explain(id,message,lines=[]){
    say(id,message);
    const box=$(id+"-work");box.replaceChildren();
    if(lines.length){
      const list=document.createElement("ol");
      for(const line of lines){
        const li=document.createElement("li");li.textContent=line;list.append(li);
      }
      box.append(list);
    }
  }
  function run(id,fn){
    try{fn();}catch(error){
      if(!(error instanceof RangeError))throw error;
      explain(id,error.message);
    }
  }
  const wire=(id,name,fn)=>click(id+"-"+name,()=>run(id,fn));
  const num=id=>{
    const field=$(id),value=field.valueAsNumber;
    if(!field.checkValidity()||!Number.isFinite(value))
      throw new RangeError("Use a value in the range shown for "+field.closest("label").textContent.trim()+".");
    return value;
  };
  function oneOf(id,name,fn){
    $(id+"-"+name).addEventListener("change",()=>run(id,fn));
  }
  function point(id,event){
    const r=$(id+"-canvas").getBoundingClientRect();
    return [(event.clientX-r.left)*600/r.width,(event.clientY-r.top)*370/r.height];
  }
  function pointer(id,fn){
    on(id+"-canvas","click",event=>run(id,()=>fn(point(id,event),event)));
  }
  function polyline(g,points,colour=blue,weight=3){
    for(let i=1;i<points.length;i++)g.line(points[i-1],points[i],colour,weight);
  }
  function mark(g,p,label,offset=[0,-16],colour=ink){
    g.dot(...p,4.2,colour);if(label)g.text(label,...add(p,offset),colour,17);
  }
  function tick(g,a,b,colour=teal){
    const d=sub(b,a),span=length(d);if(span<1e-6)return;
    const centre=mid(a,b),v=mul(perp(d),7/span);
    g.line(sub(centre,v),add(centre,v),colour,2.5);
  }
  function arc(g,centre,r,start,end,colour=purple,width=2.5,t=1){
    if(r<=0)return;
    g.arc(centre,r,start,start+(end-start)*Math.max(.001,t),colour,width);
  }
  function radial(g,c,r,theta,colour=blue){
    g.line(c,add(c,polar(r,theta)),colour,2.6);
  }
  function rightMark(g,c,d=14){
    polyline(g,[[c[0]+d,c[1]],[c[0]+d,c[1]-d],[c[0],c[1]-d]],teal,2);
  }
  function preview(id,draw){
    tools[id]=surface(id,draw);return tools[id];
  }
  function exportPNG(id,draw){
    const canvas=document.createElement("canvas");canvas.width=2400;canvas.height=1480;
    const ctx=canvas.getContext("2d");ctx.setTransform(4,0,0,4,0,0);
    ctx.fillStyle=wash;ctx.fillRect(0,0,600,370);draw(pen(ctx),1);
    canvas.toBlob(blob=>{
      if(!blob){say(id,"Your browser could not export the diagram.");return;}
      const url=URL.createObjectURL(blob),link=document.createElement("a");
      link.href=url;link.download="vyasa-"+id+".png";
      document.body.append(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1500);
    },"image/png");
  }
  const labInit={};
  function timeline(id,config,params=[]){
    let scene=null,stage=0,cycle=0;
    const draw=(g,t)=>{if(scene)scene.draw(g,stage,t);};
    const view=preview(id,draw);
    function update(animation=false,complete=null){
      const step=scene.steps[stage];explain(id,"Step "+(stage+1)+" of "+scene.steps.length+" · "+step,scene.steps.slice(0,stage+1));
      $(id+"-prev").disabled=stage===0;$(id+"-next").disabled=stage===scene.steps.length-1;
      if(animation)view.animate(580,complete);else view.redraw();
    }
    function start(){
      cycle++;scene=config();stage=0;update();
    }
    wire(id,"prev",()=>{cycle++;if(stage){stage--;update();}});
    wire(id,"next",()=>{cycle++;if(stage<scene.steps.length-1){stage++;update(true);}});
    wire(id,"reset",start);
    wire(id,"play",()=>{
      if(!scene)return;
      const id=++cycle;stage=0;
      const go=()=>{
        if(id!==cycle||stage>=scene.steps.length-1)return;
        stage++;update(true,()=>setTimeout(go,300));
      };
      update();setTimeout(go,260);
    });
    params.forEach(name=>oneOf(id,name,start));labInit[id]=start;
  }
  function perpendicular(id,isRope=false){
    const length=num(id+"-length"),radius=num(id+"-radius")/(isRope?2:1);
    const scale=Math.min(29,148/radius,420/length),X=[300-length*scale/2,184],Y=[300+length*scale/2,184],m=mid(X,Y),r=scale*radius;
    const cuts=circles(X,r,Y,r),valid=cuts.length===2;
    const steps=isRope?
      ["Mark two pegs "+length+" m apart.","Fold the working rope. Each half is "+fmt(radius)+" m.",valid?"Pull the midpoint taut twice to mark P and Q.":"A half-rope of "+fmt(radius)+" m cannot make marks on both sides.",valid?"Join P and Q. Equal rope halves show each mark is on the perpendicular bisector.":"Lengthen the rope so its full working length exceeds "+length+" m."]:
      ["Draw XY = "+length+" cm.","Draw matching arcs with opening "+fmt(radius)+" cm from X and Y.",valid?"Mark both intersections P and Q.":cuts.length?"A radius of exactly half the length gives one contact.":"This radius is too small. The equal arcs do not meet.",valid?"Join PQ. XM = MY = "+fmt(length/2)+" cm and the angle at M is 90°.":"Use a common opening greater than "+fmt(length/2)+" cm."];
    return {steps,draw(g,s,t){
      g.line(X,Y,blue,3);mark(g,X,"X",[-15,16]);mark(g,Y,"Y",[15,16]);
      if(s>=1&&!isRope){
        arc(g,X,r,-1.3,1.3,purple,2.5,s===1?t:1);
        arc(g,Y,r,Math.PI-1.3,Math.PI+1.3,purple,2.5,s===1?t:1);
      }
      if(s>=2&&!valid&&cuts.length)mark(g,cuts[0],"Touch", [0,-18],red);
      if(s>=2&&valid){
        const [Q,P]=cuts;
        mark(g,P,"P",[0,-15]);mark(g,Q,"Q",[0,16]);
        if(isRope){polyline(g,[X,P,Y],purple,3);polyline(g,[X,Q,Y],purple,3);}
        if(s>=3){
          g.line(P,Q,good,4);mark(g,m,"M",[15,18]);rightMark(g,m);
          tick(g,X,m);tick(g,m,Y);
        }
      }
      g.text(isRope?"Equal working rope halves":"One common compass opening",300,351,ink,18);
    }};
  }
  timeline("perp",()=>perpendicular("perp"),["length","radius"]);
  timeline("rope",()=>perpendicular("rope",true),["length","radius"]);
  function bisectorGeometry(O,bottom,top,r){
    const X=add(O,polar(r,bottom)),Y=add(O,polar(r,top)),chord=distance(X,Y);
    const opening=Math.max(56,chord*.58);
    const points=circles(X,opening,Y,opening);
    const P=points.reduce((a,b)=>distance(O,a)>distance(O,b)?a:b);
    return {X,Y,P,opening,r};
  }
  function showBisector(g,O,a,b,r,stage,t=1){
    const {X,Y,P,opening}=bisectorGeometry(O,a,b,r);
    if(stage>=1){
      arc(g,O,r,b,a,purple,2,stage===1?t:1);
      mark(g,X,"X",[8,13]);mark(g,Y,"Y",[-6,-14]);
    }
    if(stage>=2){
      const angle=(u,v)=>Math.atan2(v[1]-u[1],v[0]-u[0]);
      for(const c of [X,Y]){
        const dir=angle(c,P);
        arc(g,c,opening,dir-.53,dir+.53,purple,2.2,stage===2?t:1);
      }
      mark(g,P,"P",[16,-10]);
    }
    if(stage>=3){
      g.line(O,add(O,mul(sub(P,O),200/distance(P,O))),good,4);
      tick(g,O,X);tick(g,O,Y);
      tick(g,X,P,pencil);tick(g,Y,P,pencil);
    }
  }
  timeline("bisect",()=>{
    const d=num("bisect-angle"),a=0,b=-rad(d),O=[263,263];
    return {steps:["Draw rays forming the given "+d+"° angle.","Mark X and Y with an arc centred at O.","Use the same second radius from X and Y. Mark an interior intersection P.","Join OP. Three matching sides give equal angles of "+fmt(d/2)+"°."],draw(g,s,t){
      radial(g,O,185,a);radial(g,O,180,b);
      mark(g,O,"O",[-13,16]);showBisector(g,O,a,b,77,s,t);
      if(s===3)g.text(fmt(d/2)+"° + "+fmt(d/2)+"°",300,338,good,28);
    }};
  },["angle"]);
  timeline("standard",()=>{
    const d=Number(value("standard-angle")),right=d===90||d===45,base=right?90:60,O=[236,279],R=122;
    const baseSteps=right?["Draw baseline through O.","Mark X and Y equally far from O.","Intersect equal endpoint arcs at P.","Join OP: XY is bisected at 90°."]:
      ["Draw a ray from O and mark X.","Draw circles of radius OX at O and X.","Mark the upper intersection P.","Join OP. OXP is equilateral, so its angle at O is 60°."];
    const extra=d===base?[]:d===15?[30,15]:[d];
    const steps=baseSteps.concat(extra.flatMap(n=>["Mark equal distances on the current rays.","Intersect equal arcs and draw the bisector: "+n+"°."]));
    const X=add(O,[-R,0]),Y=add(O,[R,0]);
    const P=right?circles(X,174,Y,174)[1]:circles(O,R,Y,R)[1];
    return {steps,draw(g,s,t){
      g.line(right?add(O,[-170,0]):O,add(O,[255,0]),blue,3);
      mark(g,O,"O",[0,18]);
      if(s>=1){mark(g,Y,right?"Y":"X",[0,18]);if(right)mark(g,X,"X",[0,18]);}
      if(s>=2){
        const centres=right?[X,Y]:[O,Y],r=right?174:R;
        for(const c of centres){
          const theta=Math.atan2(P[1]-c[1],P[0]-c[0]);
          arc(g,c,r,theta-.72,theta+.72,purple,2.5,s===2?t:1);
        }
        mark(g,P,"P",[-10,-16]);
      }
      if(s>=3){
        g.line(O,add(O,mul(sub(P,O),150/distance(P,O))),good,4);
        if(right)rightMark(g,O);else g.line(P,Y,pencil,2);
      }
      let previous=base;
      extra.forEach((n,i)=>{
        const offset=4+i*2;
        if(s>=offset)showBisector(g,O,0,-rad(previous),i?125:83,s===offset?1:3,t);
        previous=n;
      });
      if(s===steps.length-1)g.text(d+"°",477,321,good,37);
    }};
  },["angle"]);
  function copyScene(id,parallel=false){
    const d=num(id+"-angle"),r=parallel?66:num(id+"-radius"),source=parallel?[182,270]:[115,224],target=parallel?[390,132]:[345,225];
    const q=parallel?Math.atan2(target[1]-source[1],target[0]-source[0]):0;
    const toe=add(source,polar(r,q)),end=add(source,polar(r,q-rad(d))),base=add(target,polar(r,q));
    const chord=distance(toe,end),candidate=parallel?chord:num(id+"-chord")||chord;
    const cut=circles(target,r,base,candidate),selected=cut.find(p=>cross(sub(base,target),sub(p,target))<-1e-6);
    const cp=selected?Math.atan2(selected[1]-target[1],selected[0]-target[0]):0;
    const measured=selected?Math.abs(cp-q)*180/Math.PI:NaN;
    const steps=["Start with the source rays and mark the new vertex.","Use the same radius "+fmt(r)+" around each vertex.","Transfer chord "+fmt(candidate)+" from the target baseline mark.",selected?(parallel?"Equal corresponding angles ("+d+"°) prove the two lines parallel.":"The copied angle is "+fmt(measured)+"°. The source angle is "+d+"°."):"This chord gives no distinct intersection on the intended side."];
    return {steps,draw(g,s,t){
      function lineAt(origin,angle,r0,colour){
        g.line(add(origin,polar(-r0,angle)),add(origin,polar(r0,angle)),colour,2.6);
      }
      if(parallel){lineAt(mid(source,target),q,211,blue);lineAt(source,q-rad(d),112,blue);}
      else{radial(g,source,135,0);radial(g,source,145,q-rad(d));radial(g,target,156,q);}
      mark(g,source,parallel?"Q":"O",[-14,18]);mark(g,target,parallel?"P":"T",[0,16]);
      if(s>=1){
        arc(g,source,r,q-rad(d)-.2,q+.22,purple,2.6,s===1?t:1);arc(g,target,r,q-rad(125)-.05,q+.23,purple,2.6,s===1?t:1);
        mark(g,toe,"X",[7,12]);mark(g,end,"Y",[-10,-13]);mark(g,base,"X′",[5,13]);
      }
      if(s>=2){
        g.line(toe,end,orange,2);
        if(selected){const theta=Math.atan2(selected[1]-base[1],selected[0]-base[0]);arc(g,base,candidate,theta-.37,theta+.37,purple,2.4,s===2?t:1);mark(g,selected,"Y′",[0,-13]);}
      }
      if(s>=3&&selected){
        if(parallel)lineAt(target,cp,111,good);else radial(g,target,164,cp,good);
        g.text(parallel?"Equal corresponding angles":fmt(measured)+"°",300,345,good,23);
      }
    }};
  }
  timeline("copy",()=>copyScene("copy"),["angle","radius","chord"]);
  timeline("parallel",()=>copyScene("parallel",true),["angle"]);
  timeline("hex",()=>{
    const radius=num("hex-radius"),star=$("hex-star").checked,O=[300,186],vertices=hexWalk(O,radius,0);
    const steps=["Draw a circle. Mark A and keep the compass at radius "+radius+"."].concat(["B","C","D","E","F"].map(letter=>"Mark "+letter+" using the previous point as centre and the same opening.")).concat("Close the walk. Each sector gives 60° at the centre and each corner is 120°.");
    return {steps,draw(g,s,t){
      g.arc(O,radius,0,2*Math.PI,blue,2.4);mark(g,O,"O",[-13,14]);
      for(let i=0;i<=Math.min(s,5);i++){
        const q=vertices[i];
        if(i){g.line(vertices[i-1],q,s===6?good:blue,3);const a=Math.atan2(q[1]-vertices[i-1][1],q[0]-vertices[i-1][0]);arc(g,vertices[i-1],radius,a-.24,a+.24,purple,2,i===s?t:1);}
        if(s===6&&!star)g.line(O,q,pencil,1.6);
        mark(g,q,String.fromCharCode(65+i),mul(sub(q,O),18/radius));
      }
      if(s===6){g.line(vertices[5],vertices[0],good,3);if(star){g.poly([vertices[0],vertices[2],vertices[4]],null,orange,3);g.poly([vertices[1],vertices[3],vertices[5]],null,orange,3);}}
    }};
  },["radius","star"]);
  const workbenchView=preview("workbench",drawWorkbench);
  const W={A:[188,185],B:[412,185],stage:0,radius:145,shapes:[],pending:[],undo:[],redo:[]};
  function wbSnapshot(){
    return {stage:W.stage,radius:W.radius,shapes:structuredClone(W.shapes)};
  }
  function remember(){
    W.undo.push(wbSnapshot());if(W.undo.length>60)W.undo.shift();
    W.redo=[];
  }
  function restore(snapshot){
    Object.assign(W,snapshot,{pending:[]});workbenchStatus();
  }
  function guideCuts(){
    return circles(W.A,W.radius,W.B,W.radius).sort((a,b)=>a[1]-b[1]);
  }
  function transformed(p){
    const zoom=Number(value("workbench-magnify")),offset=[Number(value("workbench-pan-x"))||0,Number(value("workbench-pan-y"))||0];
    return add([300,185],add(mul(sub(p,[300,185]),zoom),offset));
  }
  function inverse(p){
    const zoom=Number(value("workbench-magnify")),offset=[Number(value("workbench-pan-x"))||0,Number(value("workbench-pan-y"))||0];
    return add([300,185],mul(sub(sub(p,[300,185]),offset),1/zoom));
  }
  function workbenchStatus(message){
    const steps=["Choose endpoint X for the first arc.","Choose endpoint Y with the same opening.","Mark upper arc intersection P.","Mark lower arc intersection Q.","Finish the construction by joining P and Q.","Complete. The line through the two intersections is the perpendicular bisector."];
    const guided=value("workbench-mode")==="guided";
    explain("workbench",message??(guided?steps[W.stage]:"Free construction · "+W.shapes.length+" object(s)."),guided?[
      "X = "+pointText(W.A)+" and Y = "+pointText(W.B)+". Choose a working radius greater than 112 drawing units.",
      ...(W.stage>=2?["P = "+pointText(guideCuts()[0])+" and Q = "+pointText(guideCuts()[1])+"."]:[]),
      ...(W.stage>=5?["Both points are equidistant from the endpoints. The result crosses at M = (300, 185) at a right angle."]:[])
    ]:W.shapes.slice(-5).map(item=>item.kind==="point"?"Point at "+pointText(item.p)+".":item.kind==="line"?"Segment "+pointText(item.a)+" to "+pointText(item.b)+".":item.kind==="pencil"?"Pencil stroke with "+item.points.length+" points.":item.kind+" at "+pointText(item.c)+" of radius "+fmt(item.r)+"."));
    workbenchView.redraw();
  }
  function drawWorkbench(g){
    const drawLine=(a,b,colour=blue,w=3)=>g.line(transformed(a),transformed(b),colour,w);
    const drawPoint=(p,label,offset,colour)=>mark(g,transformed(p),label,offset,colour);
    const factor=Number(value("workbench-magnify"));
    for(let x=0;x<=600;x+=25)drawLine([x,0],[x,370],"#d9e4f3",.7);
    for(let y=0;y<=370;y+=25)drawLine([0,y],[600,y],"#d9e4f3",.7);
    if(value("workbench-mode")==="guided"){
      const [p,q]=guideCuts();
      drawLine(W.A,W.B,blue,3);drawPoint(W.A,"X",[-12,16]);drawPoint(W.B,"Y",[12,16]);
      if(W.stage>=1)g.arc(transformed(W.A),W.radius*factor,-1.42,1.42,purple,2.5);
      if(W.stage>=2)g.arc(transformed(W.B),W.radius*factor,Math.PI-1.42,Math.PI+1.42,purple,2.5);
      if(W.stage>=3)drawPoint(p,"P",[0,-15]);
      if(W.stage>=4)drawPoint(q,"Q",[0,15]);
      if(W.stage>=5){drawLine(p,q,good,4);const m=transformed(mid(W.A,W.B));rightMark(g,m);mark(g,m,"M",[14,17]);}
      if(W.stage<4){const focus=[W.A,W.B,p,q][W.stage];if(focus)g.arc(transformed(focus),11,0,2*Math.PI,orange,3);}
      return;
    }
    for(const s of W.shapes){
      if(s.kind==="point")drawPoint(s.p,"",[0,0],ink);
      if(s.kind==="line")drawLine(s.a,s.b);
      if(s.kind==="pencil")polyline(g,s.points.map(transformed),pencil,2);
      if(s.kind==="arc"||s.kind==="circle"){
        g.arc(transformed(s.c),s.r*factor,s.start??0,s.end??2*Math.PI,purple,2.5);
        drawPoint(s.c,"",[0,0],purple);
      }
    }
    for(const p of W.pending)drawPoint(p,"",[0,0],orange);
    if(W.pending.length>1)polyline(g,W.pending.map(transformed),orange,2.5);
  }
  const modulo=v=>((v%(2*Math.PI))+2*Math.PI)%(2*Math.PI);
  function onArc(s,p){
    if(s.kind!=="arc")return true;
    return modulo(Math.atan2(p[1]-s.c[1],p[0]-s.c[0])-s.start)<=s.end-s.start+1e-6;
  }
  const circular=s=>s.kind==="arc"||s.kind==="circle";
  function intersections(){
    const shapes=W.shapes.filter(s=>s.kind==="line"||circular(s)),points=[];
    for(let i=0;i<shapes.length;i++)for(let j=0;j<i;j++){
      const a=shapes[i],b=shapes[j];
      if(circular(a)&&circular(b))points.push(...circles(a.c,a.r,b.c,b.r).filter(p=>onArc(a,p)&&onArc(b,p)));
      else if(!circular(a)&&!circular(b)){const point=lineIntersection(a.a,a.b,b.a,b.b);if(point)points.push(point);}
      else{
        const line=circular(a)?b:a,curve=circular(a)?a:b;
        points.push(...lineCircle(line.a,line.b,curve.c,curve.r).filter(p=>onArc(curve,p)));
      }
    }
    return points;
  }
  function closest(points,p){
    return points.reduce((best,q)=>!best||distance(p,q)<distance(p,best)?q:best,null);
  }
  function segmentDistance(p,a,b){
    const v=sub(b,a),len=dot(v,v);
    return len?distance(p,add(a,mul(v,Math.min(1,Math.max(0,dot(sub(p,a),v)/len))))):distance(p,a);
  }
  function freePoint(p){
    const chosen=value("workbench-tool"),known=intersections();
    const marked=W.shapes.flatMap(s=>s.kind==="point"?[s.p]:s.kind==="line"?[s.a,s.b]:circular(s)?[s.c]:s.points);
    const nearby=closest(marked.concat(known),p),tolerance=17/Number(value("workbench-magnify"));
    const q=nearby&&distance(p,nearby)<=tolerance?nearby:p;
    const insert=s=>{remember();W.shapes.push(s);W.pending=[];workbenchStatus();};
    if(W.shapes.length>=90&&!["ruler","erase","intersection"].includes(chosen))throw new RangeError("The drawing holds up to 90 objects. Erase one or save and reset.");
    if(chosen==="point")return insert({kind:"point",p:q});
    if(chosen==="intersection"){
      const found=closest(known,p);
      if(!found||distance(found,p)>tolerance*1.5)throw new RangeError("Choose near an actual intersection of your moving construction lines or circles.");
      return insert({kind:"point",p:found});
    }
    if(chosen==="erase"){
      let best=tolerance,index=-1;
      W.shapes.forEach((s,i)=>{
        const dist=s.kind==="line"?segmentDistance(p,s.a,s.b):s.kind==="point"?distance(p,s.p):circular(s)?
          (onArc(s,p)?Math.abs(distance(p,s.c)-s.r):Infinity):
          Math.min(...s.points.slice(1).map((b,j)=>segmentDistance(p,s.points[j],b)));
        if(dist<best){best=dist;index=i;}
      });
      if(index<0)throw new RangeError("Choose closer to a point, segment, arc or pencil stroke.");
      remember();W.shapes.splice(index,1);W.pending=[];return workbenchStatus("Removed one construction object.");
    }
    if(chosen==="circle")return insert({kind:"circle",c:q,r:num("workbench-radius")});
    W.pending.push(q);
    if(chosen==="pencil"){
      if(W.pending.length>50)W.pending.shift();
      return workbenchStatus("Pencil: "+W.pending.length+" point(s). Finish the stroke when ready.");
    }
    if(W.pending.length===1)return workbenchStatus("First "+(chosen==="arc"?"centre":"point")+" selected at "+pointText(q)+". Select the next point.");
    const [a,b]=W.pending;
    if(distance(a,b)<1e-7){W.pending.pop();throw new RangeError("Select a different second point.");}
    if(chosen==="line")return insert({kind:"line",a,b});
    if(chosen==="arc"){
      const start=Math.atan2(b[1]-a[1],b[0]-a[0]);
      return insert({kind:"arc",c:a,r:num("workbench-radius"),start,end:start+Math.PI/2});
    }
    W.pending=[];workbenchStatus("Distance = "+fmt(distance(a,b))+" drawing units.");
  }
  function atWorkbench(p){
    if(value("workbench-mode")==="free")return freePoint(p);
    const opening=W.stage===0?num("workbench-radius"):W.radius;
    if(opening<=112||opening>184)throw new RangeError("For this guided drawing, use 113 to 184 drawing units, above half of XY.");
    if(W.stage>=4)return workbenchStatus();
    const expected=[W.A,W.B,...circles(W.A,opening,W.B,opening).sort((a,b)=>a[1]-b[1])][W.stage];
    if(distance(p,expected)>26/Number(value("workbench-magnify")))throw new RangeError("Select the highlighted point or enter its coordinates.");
    remember();W.radius=opening;W.stage++;workbenchStatus();
  }
  wire("workbench","apply",()=>atWorkbench([num("workbench-x"),num("workbench-y")]));
  pointer("workbench",p=>atWorkbench(inverse(p)));
  oneOf("workbench","tool",()=>{W.pending=[];workbenchStatus();});
  oneOf("workbench","mode",()=>{W.pending=[];W.undo=[];W.redo=[];workbenchStatus();});
  for(const input of ["magnify","pan-x","pan-y"])oneOf("workbench",input,()=>workbenchView.redraw());
  wire("workbench","reset",()=>{
    remember();W.shapes=[];W.pending=[];W.stage=0;W.radius=num("workbench-radius");workbenchStatus();
  });
  wire("workbench","undo",()=>{if(W.undo.length){W.redo.push(wbSnapshot());restore(W.undo.pop());}});
  wire("workbench","redo",()=>{if(W.redo.length){W.undo.push(wbSnapshot());restore(W.redo.pop());}});
  wire("workbench","finish",()=>{
    if(value("workbench-mode")==="guided"){
      if(W.stage!==4)throw new RangeError("Mark all four highlighted points before joining the two intersections.");
      remember();W.stage=5;workbenchStatus();return;
    }
    if(W.pending.length<2||value("workbench-tool")!=="pencil")throw new RangeError("Place at least two points with the pencil tool.");
    remember();W.shapes.push({kind:"pencil",points:W.pending});W.pending=[];workbenchStatus();
  });
  wire("workbench","save",()=>exportPNG("construction",drawWorkbench));
  labInit.workbench=workbenchStatus;
  function arcPath(g,c,a,b,colour=good,width=4,t=1){
    const r=distance(c,a),start=Math.atan2(a[1]-c[1],a[0]-c[0]),end=Math.atan2(b[1]-c[1],b[0]-c[0]);
    const signed=modulo(end-start+Math.PI)-Math.PI;
    arc(g,c,r,start,start+signed,colour,width,t);
  }
  let arch;
  const archView=preview("arches",drawArch);
  function drawArch(g,t){
    if(!arch)return;
    const {arcs,guides,ends}=arch;
    if(guides){g.dash([300,52],[300,313],pencil,1.8);g.line(ends[0],ends[1],blue,2);
      for(const [c,a,b] of arcs){mark(g,c,"",[0,0],purple);g.dash(c,a,purple,1.5);g.dash(c,b,purple,1.5);}}
    for(const [c,a,b] of arcs){arcPath(g,c,a,b,good,5,t);if(guides){mark(g,a,"",[0,0],ink);mark(g,b,"",[0,0],ink);}}
    g.text(arch.name,300,340,ink,23);
  }
  function setArch(){
    const span=num("arches-span"),opening=num("arches-radius"),type=value("arches-mode"),guides=$("arches-guides").checked;
    const L=[300-span/2,280],R=[300+span/2,280];
    let curves,height;
    if(type==="pointed"){
      const a=[L[0]+opening,L[1]],b=[R[0]-opening,R[1]];
      if(Math.abs(a[0]-b[0])<1e-7)throw new RangeError("These centres coincide and make a semicircle. Change the opening for a pointed apex.");
      const P=circles(a,opening,b,opening).sort((x,y)=>x[1]-y[1])[0];
      if(!P||P[1]>=280)throw new RangeError("Use a larger radius to obtain two intersecting arcs and a raised apex.");
      curves=[[a,L,P],[b,R,P]];height=280-P[1];
    }else{
      const q=[300-span*.22,205],p=[300+span*.22,205];
      const c=circles(L,opening,q,opening).sort((x,y)=>y[0]-x[0])[0];
      if(!c)throw new RangeError("The opening is too short for the side chord. Increase it.");
      const reflect=v=>[600-v[0],v[1]];
      curves=[[c,L,q],[reflect(c),R,p],[[300,205],p,q]];
      height=280-(205-span*.22);
    }
    arch={name:type==="pointed"?"Symmetrical pointed arch":"Symmetrical three-lobed profile",arcs:curves,guides,ends:[L,R]};
    explain("arches",arch.name+" · span "+span+", side radius "+opening+".",[
      "Reflection across the dashed line interchanges the two side arcs.",
      "The marked top of the central construction is "+fmt(height)+" units above the baseline."
    ]);
    archView.animate();
  }
  wire("arches","next",setArch);wire("arches","save",()=>exportPNG("arch",drawArch));oneOf("arches","guides",setArch);
  labInit.arches=setArch;
  let motif;
  const artView=preview("art",(g,t)=>{
    if(!motif)return;
    const O=[300,185],{kind,count,c,guides}=motif;
    for(let i=0;i<Math.ceil(count*t);i++){
      const theta=i*2*Math.PI/count,center=add(O,polar(101,theta));
      if(guides)g.dash(O,add(O,polar(152,theta)),pencil,1);
      if(kind==="eye"){
        const a=add(center,polar(-21,theta)),b=add(center,polar(21,theta)),v=polar(17,theta+Math.PI/2);
        arcPath(g,add(center,v),a,b,c,3);arcPath(g,sub(center,v),a,b,c,3);
      }else if(kind==="flower")g.arc(center,38,0,2*Math.PI,c,3);
      else if(kind==="star"){
        const h=hexWalk(center,29,theta);
        g.poly([h[0],h[2],h[4]],null,c,2.5);g.poly([h[1],h[3],h[5]],null,c,2.5);
      }else g.poly(polygon(kind==="hex"?6:3,kind==="hex"?24:48,center,theta),null,c,3);
    }
    mark(g,O,guides?"O":"",[0,15],guides?ink:teal);
  });
  function geometricArt(){
    const lines=[blue,teal,orange,purple,red],count=num("art-count");
    motif={kind:value("art-motif"),count,c:lines[Number(value("art-colour"))],guides:$("art-guides").checked};
    explain("art",count+" identical motifs around a full turn.",["Angular step: 360° ÷ "+count+" = "+fmt(360/count)+"°.","Each copy is a rotation of the preceding one. All copies preserve lengths and angles."]);
    artView.animate(800);
  }
  wire("art","next",geometricArt);oneOf("art","guides",geometricArt);labInit.art=geometricArt;
  function dragController(id,handlers){
    let active=null;
    const canvas=$(id+"-canvas");
    on(id+"-canvas","pointerdown",event=>run(id,()=>{
      active=handlers.start(point(id,event));
      canvas.setPointerCapture(event.pointerId);
    }));
    on(id+"-canvas","pointermove",event=>{if(active)handlers.move(active,point(id,event));});
    on(id+"-canvas","pointercancel",()=>{active=null;handlers.cancel?.();});
    on(id+"-canvas","pointerup",event=>run(id,()=>{
      const saved=active;active=null;
      handlers.end(saved,point(id,event));
    }));
  }
  const centre=poly=>mul(poly.reduce(add,[0,0]),1/poly.length);
  function transform(p,angle,flip){
    const x=p[0]*(flip?-1:1),y=p[1];
    const c=Math.cos(angle),s=Math.sin(angle);
    return [x*c-y*s,x*s+y*c];
  }
  const square=[[192,77],[408,77],[408,293],[192,293]];
  const initialAngle=n=>n===4?Math.PI/4:-Math.PI/2;
  const tessellated=[];
  let tessSelected=-1;
  const tessPoly=piece=>polygon(piece.n,72).map(p=>add(piece.c,transform(p,piece.angle+initialAngle(piece.n)+Math.PI/2,piece.flip)));
  const tessView=preview("tess",drawTess);
  function drawTess(g){
    g.poly(square,"#f0f5ff",blue,3);
    for(const x of [264,336])g.dash([x,77],[x,293],"#a4b4c8",1);
    for(const y of [149,221])g.dash([192,y],[408,y],"#a4b4c8",1);
    tessellated.forEach((piece,i)=>{
      g.poly(tessPoly(piece),piece.colour,i===tessSelected?orange:ink,i===tessSelected?4:2);
      g.text(String(i+1),...piece.c,ink,17);
    });
    g.text("Target: 216 × 216 drawing units",300,337,ink,21);
  }
  function tessReport(message){
    const cv=coverage(square,tessellated.map(tessPoly));
    explain("tess",message??(cv.complete?"Verified full coverage.":tessellated.length+" piece(s) placed."),[
      "Outside target: "+cv.outside+" piece(s). Overlap: "+cv.clashes+" pair(s).",
      "Total piece area: "+fmt(cv.used)+" of "+fmt(cv.target)+" square units.",
      !cv.outside&&!cv.clashes?"Uncovered area: "+fmt(Math.max(0,cv.target-cv.used))+" square units.":"Move any outside or overlapping pieces before using an area check."
    ]);
    if(tessSelected>=0)$("tess-index").value=tessSelected+1;
    tessView.redraw();
  }
  function snapPiece(index){
    if(!$("tess-snap").checked)return;
    const current=tessellated[index],a=tessPoly(current);
    let nearest=20,shift=null;
    const compare=(b,targetCentre,boundary)=>{
      for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++){
        const a0=a[i],a1=a[(i+1)%a.length],b0=b[j],b1=b[(j+1)%b.length];
        const v=sub(a1,a0),w=sub(b1,b0);
        if(Math.abs(length(v)-length(w))>1e-6||Math.abs(cross(v,w))>1e-4)continue;
        const offset=sub(mid(b0,b1),mid(a0,a1));
        if(length(offset)>=nearest)continue;
        const toward=cross(w,sub(add(current.c,offset),b0))*cross(w,sub(targetCentre,b0));
        if(boundary?toward<=0:toward>=0)continue;
        nearest=length(offset);shift=offset;
      }
    };
    tessellated.forEach((peer,i)=>{if(i!==index)compare(tessPoly(peer),peer.c,false);});
    for(let i=0;i<square.length;i++){
      const A=square[i],B=square[(i+1)%square.length],unit=mul(sub(B,A),1/3);
      for(let j=0;j<3;j++)compare([add(A,mul(unit,j)),add(A,mul(unit,j+1))],[300,185],true);
    }
    if(shift)current.c=add(current.c,shift);
  }
  function tileIndex(){
    const i=num("tess-index")-1;
    if(!tessellated[i])throw new RangeError("Place a tile or enter its displayed number.");
    tessSelected=i;return i;
  }
  function placeTile(p,template){
    if(tessellated.length>=30)throw new RangeError("This board holds up to 30 pieces.");
    const n=Number(value("tess-shape")),colour=colours[Number(value("tess-colour"))];
    tessellated.push(template?{...template,c:p}:{n,colour,c:p,angle:0,flip:false});
    tessSelected=tessellated.length-1;snapPiece(tessSelected);tessReport();
  }
  const coordinates=id=>[num(id+"-x"),num(id+"-y")];
  wire("tess","add",()=>placeTile(coordinates("tess")));
  wire("tess","move",()=>{const i=tileIndex();tessellated[i].c=coordinates("tess");snapPiece(i);tessReport();});
  wire("tess","rotate",()=>{const i=tileIndex();tessellated[i].angle+=Math.PI/6;snapPiece(i);tessReport();});
  wire("tess","flip",()=>{const i=tileIndex();tessellated[i].flip=!tessellated[i].flip;snapPiece(i);tessReport();});
  wire("tess","repeat",()=>{const prior=tessellated.at(-1);if(!prior)throw new RangeError("Place the first tile before repeating it.");placeTile(coordinates("tess"),prior);});
  wire("tess","remove",()=>{tessellated.splice(tileIndex(),1);tessSelected=Math.min(tessSelected,tessellated.length-1);tessReport();});
  wire("tess","reset",()=>{tessellated.length=0;tessSelected=-1;tessReport();});
  wire("tess","demo",()=>{
    tessellated.length=0;
    for(let r=0;r<3;r++)for(let c=0;c<3;c++)tessellated.push({n:4,colour:colours[(r+c)%5],c:[228+c*72,113+r*72],angle:0,flip:false});
    tessSelected=-1;tessReport();
  });
  wire("tess","save",()=>exportPNG("tessellation",drawTess));
  dragController("tess",{
    start(p){
      for(let i=tessellated.length-1;i>=0;i--)if(contains(tessPoly(tessellated[i]),p)){
        tessSelected=i;tessReport();return {i,delta:sub(tessellated[i].c,p)};
      }
      return null;
    },move(state,p){tessellated[state.i].c=add(p,state.delta);tessView.redraw();},
    end(state,p){if(!state)return placeTile(p);tessellated[state.i].c=add(p,state.delta);snapPiece(state.i);tessReport();},cancel(){tessReport();}
  });
  labInit.tess=()=>tessReport();
  let corners=[];
  const vertexView=preview("vertex",(g,t)=>{
    const O=[300,205],span=corners.reduce((sum,n)=>sum+interior(n),0);
    let angle=-Math.PI/2;
    g.arc(O,113,0,2*Math.PI,pencil,2);
    for(let i=0;i<Math.ceil(corners.length*t);i++){
      const n=corners[i],r=113,d=rad(interior(n));
      g.wedge(O,r,angle,angle+d,colours[(n-3)%5],ink,1.7);
      g.text(fmt(interior(n))+"°",...add(O,polar(75,angle+d/2)),ink,20);
      angle+=d;
    }
    if(span>360)g.arc(O,125,-Math.PI/2,-Math.PI/2+Math.min(2*Math.PI,rad(span-360)),red,4);
    g.text("Total "+fmt(span)+"°",300,42,span>360?red:good,27);
    mark(g,O,"",[0,0],ink);
  });
  function vertex(){
    const total=corners.reduce((sum,n)=>sum+interior(n),0),delta=360-total;
    explain("vertex","Total "+fmt(total)+"°. "+(delta>0?fmt(delta)+"° gap.":delta<0?fmt(-delta)+"° angular overlap.":"No angular gap at this vertex."),[
      corners.length?"Interior angles: "+corners.map(n=>fmt(interior(n))+"°").join(" + ")+".":"Add a tile corner to start.",
      "Complete coverage also needs compatible edges and a repeating arrangement."
    ]);
    vertexView.animate(420);
  }
  wire("vertex","add",()=>{
    if(corners.length>=8)throw new RangeError("Use up to eight corners in one comparison.");
    corners.push(Number(value("vertex-shape")));vertex();
  });
  wire("vertex","undo",()=>{corners.pop();vertex();});
  wire("vertex","reset",()=>{corners=[];vertex();});
  labInit.vertex=vertex;
  function gridSize(rows,cols){
    const size=Math.min(55,470/cols,259/rows);
    return {s:size,x:(600-cols*size)/2,y:(364-rows*size)/2+10};
  }
  function gridPick(rows,cols,p){
    const {s,x,y}=gridSize(rows,cols),r=Math.floor((p[1]-y)/s),c=Math.floor((p[0]-x)/s);
    return r>=0&&c>=0&&r<rows&&c<cols?[r,c]:null;
  }
  const enteredCell=(id,rows,cols)=>{
    const r=num(id+"-row")-1,c=num(id+"-col")-1;
    if(r>=rows||c>=cols)throw new RangeError("Choose a row and column inside this board.");
    return [r,c];
  };
  let floor={rows:4,cols:6,shape:"square",cells:new Map(),room:"Living room"};
  const floorView=preview("floor",g=>{
    const {rows,cols,shape,cells,room}=floor,{s,x,y}=gridSize(rows,cols);
    g.text(room+" floor",300,30,blue,28);
    g.box(x-8,y-8,cols*s+16,rows*s+16,"#c6d6eb",blue);
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
      const l=x+c*s,top=y+r*s;
      g.box(l,top,s,s,"#fdf7ee","#8793a4");
      const filled=cells.get(cell(r,c))||[];
      if(shape==="square"&&filled.length)g.box(l,top,s,s,filled[0],ink);
      if(shape==="triangle"){
        const points=[[l,top],[l+s,top],[l+s,top+s],[l,top+s]];
        if(filled[0])g.poly([points[0],points[1],points[2]],filled[0],ink,1.5);
        if(filled[1])g.poly([points[0],points[2],points[3]],filled[1],ink,1.5);
        g.dash(points[0],points[2],pencil,1);
      }
    }
  });
  function floorReport(message){
    const all=floor.rows*floor.cols*(floor.shape==="square"?1:2),used=[...floor.cells.values()].reduce((sum,a)=>sum+a.length,0);
    explain("floor",message??(used===all?"Verified full floor coverage.":used+" of "+all+" tiles placed."),[
      (all-used)+" tile position(s) remain. The grid keeps every tile inside the room.",
      "Overlap is prevented. Each "+(floor.shape==="square"?"tile fills one cell.":"pair of triangles fills one cell.")
    ]);
    floorView.redraw();
  }
  function initFloor(){
    floor={rows:num("floor-rows"),cols:num("floor-cols"),shape:value("floor-shape"),cells:new Map(),room:value("floor-room")};floorReport();
  }
  function addFloor([r,c],remove=false){
    const key=cell(r,c),parts=floor.cells.get(key)||[],max=floor.shape==="square"?1:2;
    if(remove){parts.pop();if(!parts.length)floor.cells.delete(key);}
    else{
      if(parts.length===max)throw new RangeError("This part of the floor is covered. Remove a tile or choose another cell.");
      parts.push(colours[Number(value("floor-colour"))]);floor.cells.set(key,parts);
    }
    floorReport();
  }
  pointer("floor",p=>{const k=gridPick(floor.rows,floor.cols,p);if(k)addFloor(k);});
  wire("floor","cell",()=>addFloor(enteredCell("floor",floor.rows,floor.cols)));
  wire("floor","remove",()=>addFloor(enteredCell("floor",floor.rows,floor.cols),true));
  wire("floor","reset",initFloor);
  wire("floor","demo",()=>{
    for(let r=0;r<floor.rows;r++)for(let c=0;c<floor.cols;c++)
      floor.cells.set(cell(r,c),Array(floor.shape==="square"?1:2).fill(colours[(r+c)%5]));
    floorReport();
  });
  for(const opt of ["room","rows","cols","shape"])oneOf("floor",opt,initFloor);
  labInit.floor=initFloor;
  let honey;
  const honeyView=preview("honey",(g,t)=>{
    if(!honey)return;
    const {r,coordinates}=honey,O=[300,186];
    for(let i=0;i<Math.ceil(coordinates.length*t);i++){
      const [q,s]=coordinates[i],p=[O[0]+Math.sqrt(3)*r*(q+s/2),O[1]+1.5*r*s];
      g.poly(polygon(6,r,p,-Math.PI/2),colours[(i+1)%5],ink,2);
    }
    const first=polygon(6,r,O,-Math.PI/2);g.poly(first,null,good,3);
    first.forEach(p=>g.dash(O,p,teal,1.5));
    g.text("Three corners × 120° = 360°",300,344,ink,21);
  });
  function honeycomb(){
    const rings=num("honey-rings"),r=num("honey-radius"),coordinates=[];
    for(let q=-rings;q<=rings;q++)for(let s=-rings;s<=rings;s++)if(Math.abs(q+s)<=rings)coordinates.push([q,s]);
    coordinates.sort((a,b)=>Math.max(Math.abs(a[0]),Math.abs(a[1]),Math.abs(a[0]+a[1]))-Math.max(Math.abs(b[0]),Math.abs(b[1]),Math.abs(b[0]+b[1])));
    honey={r:Math.min(r,155/(1+1.5*rings)),coordinates};
    explain("honey",coordinates.length+" hexagonal cell(s).",["Each side equals the radius of its own circle.","Translated parallel edges coincide. Three equal 120° corners fill a turn."]);
    honeyView.animate(800);
  }
  wire("honey","next",honeycomb);labInit.honey=honeycomb;
  const tangramColours=["#bbd8fa","#abe5d2","#ffe3a0","#dbcbf3","#f2b2b4","#c0eafa","#eadba6"];
  const pieceNames=["Large triangle A","Large triangle B","Medium triangle","Small triangle A","Small triangle B","Square","Parallelogram"];
  const tangramSize=41,targets=[[0,0],[4,0],[4,4],[0,4]],tray=[[105,99],[493,95],[92,199],[504,193],[105,289],[499,289],[300,335]];
  let puzzlePieces=[],chosenPiece=0,tangramAngle=0;
  const puzzlePoint=(p,angle)=>add([300,182],transform(mul(sub(p,[2,2]),tangramSize),angle,false));
  const puzzleShape=piece=>piece.shape.map(p=>add(piece.c,transform(p,piece.rot,piece.flipped)));
  const tangramView=preview("tangram",g=>{
    g.poly(targets.map(p=>puzzlePoint(p,tangramAngle)),"#f5f7ff",blue,3);
    puzzlePieces.forEach((piece,i)=>{
      g.poly(puzzleShape(piece),tangramColours[i],i===chosenPiece?orange:ink,i===chosenPiece?4:2);
      g.text(String(i+1),...piece.c,ink,17);
    });
  });
  function puzzleReport(message){
    const result=coverage(targets.map(p=>puzzlePoint(p,tangramAngle)),puzzlePieces.map(puzzleShape));
    explain("tangram",message??(result.complete?"Verified. The seven pieces cover the target.":"Keep all seven rigid pieces inside without overlaps."),[
      "Selected: "+pieceNames[chosenPiece]+".",
      "Outside: "+result.outside+" piece(s). Overlap: "+result.clashes+" pair(s).",
      "A valid solution needs both counts at zero and total area equal to the target."
    ]);
    $("tangram-index").value=chosenPiece+1;tangramView.redraw();
  }
  function loadTangram(){
    tangramAngle=value("tangram-target")==="diamond"?Math.PI/4:0;chosenPiece=0;
    puzzlePieces=tangram.map((points,i)=>{
      const origin=centre(points);
      return {origin,c:tray[i],shape:points.map(v=>mul(sub(v,origin),tangramSize)),rot:0,flipped:false};
    });
    puzzleReport();
  }
  function selectPiece(){chosenPiece=num("tangram-index")-1;return puzzlePieces[chosenPiece];}
  wire("tangram","move",()=>{selectPiece().c=coordinates("tangram");puzzleReport();});
  wire("tangram","rotate",()=>{selectPiece().rot+=Math.PI/4;puzzleReport();});
  wire("tangram","flip",()=>{const piece=selectPiece();piece.flipped=!piece.flipped;puzzleReport();});
  wire("tangram","hint",()=>{const piece=selectPiece();piece.c=puzzlePoint(piece.origin,tangramAngle);piece.rot=tangramAngle;piece.flipped=false;puzzleReport();});
  wire("tangram","check",()=>{selectPiece();puzzleReport();});
  wire("tangram","reset",loadTangram);oneOf("tangram","target",loadTangram);oneOf("tangram","index",()=>{selectPiece();puzzleReport();});
  dragController("tangram",{
    start(p){
      for(let i=puzzlePieces.length-1;i>=0;i--)if(contains(puzzleShape(puzzlePieces[i]),p)){
        chosenPiece=i;puzzleReport();return {i,delta:sub(puzzlePieces[i].c,p)};
      }
      return null;
    },move(state,p){puzzlePieces[state.i].c=add(p,state.delta);tangramView.redraw();},
    end(state,p){if(state)puzzlePieces[state.i].c=add(p,state.delta);puzzleReport();},cancel(){puzzleReport();}
  });
  labInit.tangram=loadTangram;
  const puzzles={
    rectangle:[4,6,[]],corner:[5,3,["0,0"]],light:[5,3,["0,1"]],odd:[5,7,[]],split:[1,4,["0,1","0,2"]]
  };
  let board,colourBoard;
  function cellsIn(rows,cols){
    const cells=[];for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)cells.push([r,c]);return cells;
  }
  function drawBoard(g,b,colouring,solution=[]){
    if(!b)return;
    const {rows,cols,holes}=b,{s,x,y}=gridSize(rows,cols);
    g.text(colouring?"Alternate dark and light":"Place a domino edge to edge",300,30,blue,27);
    for(const [r,c] of cellsIn(rows,cols)){
      const xx=x+c*s,yy=y+r*s,key=cell(r,c),removed=holes.includes(key);
      g.box(xx,yy,s,s,removed?"#fbe3e6":colouring?(r+c)%2?"#fff6e8":"#48678e":"#e8f0fa","#7389a5");
      if(removed)g.text("×",xx+s/2,yy+s/2,red,24);
    }
    solution.forEach((pair,i)=>{
      const [a,b]=pair.map(id=>id.split(",").map(Number)),rr=Math.min(a[0],b[0]),cc=Math.min(a[1],b[1]);
      const xx=x+cc*s,yy=y+rr*s,wide=a[0]===b[0];
      g.box(xx+2,yy+2,s*(wide?2:1)-4,s*(wide?1:2)-4,colours[i%5],ink);
      g.dash(wide?[xx+s,yy+5]:[xx+5,yy+s],wide?[xx+s,yy+s-5]:[xx+s-5,yy+s],pencil,1);
    });
    for(let i=0;i<cols;i++)g.text(String(i+1),x+(i+.5)*s,y-14,ink,13);
    for(let i=0;i<rows;i++)g.text(String(i+1),x-14,y+(i+.5)*s,ink,13);
  }
  const boardView=preview("domino",g=>drawBoard(g,board,false,board?.tiles));
  const colourView=preview("colour",g=>drawBoard(g,colourBoard,true,colourBoard?.verified??[]));
  function dominoFacts(status,id){
    const total=status.dark+status.light;
    return [
      "Remaining cells: "+total+". Dark: "+status.dark+". Light: "+status.light+".",
      total%2?"Odd area blocks any complete cover.":total/2+" dominoes would use this area.",
      status.dark!==status.light?"Each domino needs one of each colour, so unequal counts prove impossibility.":
      id==="colour"?"The colour counts agree. Complete tiling also requires available adjacent pairs.":"Each domino you place must cover two free cells that share an edge."
    ];
  }
  function boardReport(message){
    const cells=board.rows*board.cols-board.holes.length-board.tiles.length*2;
    explain("domino",message??(cells===0?"Verified full cover.":cells+" cells remain uncovered."),[
      "Placed "+board.tiles.length+" domino(es).",
      cells%2?"An odd number of uncovered cells remains.":"Area requires "+cells/2+" more domino(es)."
    ]);
    boardView.redraw();
  }
  function loadBoard(){
    const [rows,cols,holes]=puzzles[value("domino-mode")];board={rows,cols,holes,tiles:[]};boardReport();
  }
  function placeDomino([r,c]){
    const horizontal=value("domino-dir")==="h",rr=r+(horizontal?0:1),cc=c+(horizontal?1:0);
    if(rr>=board.rows||cc>=board.cols)throw new RangeError("The second cell would fall outside the region.");
    const pair=[cell(r,c),cell(rr,cc)],blocked=board.holes.concat(board.tiles.flat());
    if(pair.some(v=>blocked.includes(v)))throw new RangeError("A missing or already covered cell blocks this placement.");
    board.tiles.push(pair);boardReport();
  }
  pointer("domino",p=>{const rc=gridPick(board.rows,board.cols,p);if(rc)placeDomino(rc);});
  oneOf("domino","mode",loadBoard);wire("domino","init",loadBoard);
  wire("domino","cell",()=>placeDomino(enteredCell("domino",board.rows,board.cols)));
  wire("domino","undo",()=>{board.tiles.pop();boardReport();});
  wire("domino","solve",()=>{
    const result=domino(board.rows,board.cols,board.holes);
    if(result.pairs){board.tiles=result.pairs;boardReport("Verified full cover with "+result.pairs.length+" dominoes.");return;}
    explain("domino",result.dark===result.light?"Impossible. Equal colours, but no matching of all adjacent pairs.":"Impossible to cover this region.",dominoFacts(result,"domino"));
  });
  labInit.domino=loadBoard;
  function colourReport(check){
    const b=colourBoard,result=domino(b.rows,b.cols,b.holes);
    const total=result.dark+result.light;
    b.verified=check?result.pairs:null;
    let resultText;
    if(result.dark!==result.light)resultText="Impossible · unequal colour counts.";
    else if(!check)resultText="Equal counts pass the colouring test.";
    else if(!result.pairs)resultText="Impossible · the required adjacent pairs cannot all be matched.";
    else resultText=total?"Verified cover with "+result.pairs.length+" dominoes.":"Empty region · no pieces required.";
    explain("colour",resultText,dominoFacts(result,"colour"));
    colourView.redraw();
  }
  function colourInit(){
    colourBoard={rows:num("colour-rows"),cols:num("colour-cols"),holes:[],verified:null};colourReport(false);
  }
  function changeColour([r,c]){
    const id=cell(r,c),holes=colourBoard.holes,i=holes.indexOf(id);
    if(i>=0)holes.splice(i,1);else holes.push(id);
    colourReport(false);
  }
  pointer("colour",p=>{const rc=gridPick(colourBoard.rows,colourBoard.cols,p);if(rc)changeColour(rc);});
  for(const n of ["rows","cols"])oneOf("colour",n,colourInit);
  wire("colour","init",colourInit);wire("colour","cell",()=>changeColour(enteredCell("colour",colourBoard.rows,colourBoard.cols)));
  wire("colour","solve",()=>colourReport(true));labInit.colour=colourInit;
  const errors=[
    ["For a 10 cm segment, set the compass to exactly 5 cm to get two intersections.","opening","Use more than 5 cm. Equal radius at exactly 5 cm gives one tangent contact."],
    ["I copied the two compass radii, so any ray through the new vertex copies the source angle.","chord","Copy the chord between ray marks. It supplies the third matching side for SSS."],
    ["The region contains 14 cells, so it must be possible to cover it with dominoes.","colour","Even area is necessary. Check opposite-colour counts and find adjacent pairs before claiming a cover."],
    ["The five tile corners sum to 360°, so this must tile the whole plane.","edges","The sum checks one vertex. You still need matching edges and a repeatable pattern without gaps or overlaps."]
  ];
  let mistake=0;
  function errorPrompt(){explain("error",errors[mistake][0]);}
  wire("error","next",()=>{mistake=(mistake+1)%errors.length;errorPrompt();});
  wire("error","check",()=>{
    const [question,answer,why]=errors[mistake];
    say("error",value("error-answer")===answer?"Correct. "+why:"Review the rule. "+question);
  });
  labInit.error=errorPrompt;
  let round,timer;
  function arenaStats(){
    $("arena-score").textContent=(round?round.points+" points · "+round.correct+"/"+round.attempts+" correct · streak "+round.streak+". ":"")+"Best score: "+saved.best+".";
  }
  function question(level){
    const type=rand(0,level===1?3:7);
    if(type===0){
      const d=rand(1,10)*2;
      return {prompt:"A segment is "+d+" cm. How far from an endpoint is its midpoint?",answer:d/2,proof:"Bisect the segment: "+d+" ÷ 2 = "+d/2+"."};
    }
    if(type===1){
      const angle=pick([60,90,110,120,144]);
      return {prompt:"What is one half of "+angle+"°?",answer:angle/2,proof:"An angle bisector divides the angle into two equal parts."};
    }
    if(type===2)return {prompt:"What is one central angle of a regular hexagon?",answer:60,proof:"Divide the 360° turn into six equal angles."};
    if(type===3)return {prompt:"What is one interior angle of a regular hexagon?",answer:120,proof:"Two 60° equilateral-triangle corners meet there."};
    if(type===4){
      const n=rand(2,5),m=rand(3,11);
      return {prompt:"How many dominoes cover a full "+(2*n)+" × "+m+" board?",answer:n*m,proof:"Pair the cells along the even side. The number is area divided by two."};
    }
    if(type===5){
      const n=pick([3,4,6]);
      return {prompt:"How many regular "+(n===3?"triangles":n===4?"squares":"hexagons")+" meet at one edge-to-edge vertex?",answer:360/interior(n),proof:"Divide 360° by the interior angle "+interior(n)+"°."};
    }
    if(type===6)return {prompt:"Three regular pentagon corners meet. How large is the angular gap, in degrees?",answer:36,proof:"Three 108° corners occupy 324°, leaving 36°."};
    return {prompt:"How many square corners can fill the remaining angle beside three 60° triangle corners?",answer:2,proof:"The triangles use 180° of the full turn. Two 90° square corners fill the other half."};
  }
  function nextArena(){
    if(!round?.active)return;
    round.question=question(Number(value("arena-level")));round.locked=false;
    $("arena-answer").value="";explain("arena",round.question.prompt);
  }
  function stopArena(message){
    clearInterval(timer);timer=null;
    if(round)round.active=false;
    explain("arena",message);arenaStats();
  }
  wire("arena","start",()=>{
    clearInterval(timer);
    const seconds=Number(value("arena-mode")),deadline=Date.now()+1000*seconds;
    round={active:true,locked:false,points:0,correct:0,attempts:0,streak:0};
    $("arena-clock").textContent=seconds?seconds+" seconds":"Untimed";
    if(seconds)timer=setInterval(()=>{
      const left=Math.max(0,Math.ceil((deadline-Date.now())/1000));$("arena-clock").textContent=left+" seconds";
      if(!left)stopArena("Time is up. Start a new round to practise again.");
    },250);
    nextArena();arenaStats();
  });
  wire("arena","stop",()=>stopArena("Round ended."));wire("arena","next",nextArena);
  wire("arena","check",()=>{
    if(!round?.active||round.locked)return;
    const n=num("arena-answer"),q=round.question,ok=n===q.answer;
    round.locked=true;round.attempts++;
    if(ok){
      round.streak++;round.correct++;round.points+=10+(round.streak%3===0?5:0);
      if(round.points>saved.best){saved.best=round.points;store();}
      const p=$("tool-arena");p.classList.remove("ground-celebrate");requestAnimationFrame(()=>p.classList.add("ground-celebrate"));
    }else round.streak=0;
    explain("arena",ok?"Correct. "+q.proof:"The answer is "+q.answer+". "+q.proof,
      ok&&round.streak%3===0?["Achievement: "+round.streak+" correct in a row. Five bonus points."]:[]);
    arenaStats();
  });
  on("arena-answer","keydown",e=>{if(e.key==="Enter")$("arena-check").click();});
  for(const [id,setup] of Object.entries(labInit)){
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
