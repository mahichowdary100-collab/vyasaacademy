(() => {
  "use strict";
  const get = id => document.getElementById(id);
  const number = id => get(id).valueAsNumber;
  const value = id => get(id).value;
  const on = (id, event, fn) => get(id).addEventListener(event, fn);
  const click = (id, fn) => on(id, "click", fn);
  const say = (id, words) => {
    const output = get(id + "-status");
    if (output.textContent !== words) output.textContent = words;
  };
  const showPrompt = (id, text) => { get(id + "-prompt").textContent = text; };
  const rad = angle => angle * Math.PI / 180;
  const deg = angle => angle * 180 / Math.PI;
  const round = x => Number(x.toFixed(2));
  const add = (a, b, m = 1) => [a[0] + b[0] * m, a[1] + b[1] * m];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const vector = a => [Math.cos(a), Math.sin(a)];
  const len = a => Math.hypot(...a);
  const dot = (a,b) => a[0]*b[0] + a[1]*b[1];
  const cross = (a,b) => a[0]*b[1] - a[1]*b[0];
  const unit = a => add([0,0],a,1/len(a));
  const bearing = a => Math.atan2(a[1],a[0]);
  const angle = (a,b,c) => Math.atan2(Math.abs(cross(sub(b,a),sub(c,a))),dot(sub(b,a),sub(c,a)));
  const close = (a,b) => Math.abs(a-b) < 1e-8;
  const edges = points => points.map((a,i)=>len(sub(a,points[(i+1)%points.length])));
  const angles = points => points.map((p,i)=>deg(angle(p,points[(i+1)%3],points[(i+2)%3])));
  const period = 2*Math.PI;
  const hue = {ink:"#192d4b", blue:"#285cb0", teal:"#08766e", purple:"#7441ad", amber:"#a64d17", wash:"#f8fafc"};
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const right = (base,height) => [[0,0],[base,0],[0,-height]];
  const presets = {sss:[7,5,6],sas:[7,5,52],asa:[7,48,67],aas:[8,44,65],rhs:[4,5]};
  const fieldNames = {
    sss:[["Base AB (cm)",30,.1],["Side AC (cm)",30,.1],["Side BC (cm)",30,.1]],
    sas:[["Base AB (cm)",30,.1],["Side AC (cm)",30,.1],["Angle A (°)",179,1]],
    asa:[["Base AB (cm)",30,.1],["Angle A (°)",179,1],["Angle B (°)",179,1]],
    aas:[["Base AB (cm)",30,.1],["Angle A (°)",179,1],["Angle C (°)",179,1]],
    rhs:[["Leg AB (cm)",30,.1],["Hypotenuse BC (cm)",30,.1]]
  };
  function triangle(mode, data) {
    const [base, b, c] = data;
    if (mode === "sss") {
      if (base >= b+c || b >= base+c || c >= base+b) return null;
      const x = (base*base + b*b - c*c)/(2*base);
      return [[0,0],[base,0],[x,-Math.sqrt(b*b-x*x)]];
    }
    if (mode === "sas") return [[0,0],[base,0],add([0,0],vector(-rad(c)),b)];
    if (mode === "rhs") return base < b ? right(base, Math.sqrt((b-base)*(b+base))) : null;
    if (b+c >= 180) return null;
    const atB = mode === "asa" ? c : 180-b-c;
    const ray = vector(-rad(b));
    return [[0,0],[base,0],add([0,0],ray,base*Math.sin(rad(atB))/Math.sin(rad(b+atB)))];
  }
  const flip = points => points.map(([x,y])=>[x,-y]);
  const rotate = (points,a) => points.map(([x,y])=>[x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)]);
  function bounds(points) {
    const xs = points.map(p=>p[0]), ys = points.map(p=>p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    return {centre:[(x0+x1)/2,(y0+y1)/2], width:x1-x0, height:y1-y0};
  }
  function frame(points,limits=[420,215],mid=[300,175],scale) {
    const {centre,width,height} = bounds(points);
    const factor = scale ?? Math.min(limits[0]/Math.max(.001,width),limits[1]/Math.max(.001,height));
    return points.map(p=>add(mid,sub(p,centre),factor));
  }
  function pairFrame(a,b) {
    const ba=bounds(a),bb=bounds(b);
    const scale=Math.min(205/Math.max(ba.width,bb.width),200/Math.max(ba.height,bb.height));
    return [frame(a,undefined,[151,168],scale),frame(b,undefined,[449,168],scale)];
  }
  function drawing(context) {
    const line = (a,b,colour=hue.ink,width=3,dashes=[]) => {
      context.save();context.setLineDash(dashes);context.beginPath();
      context.moveTo(...a);context.lineTo(...b);context.strokeStyle=colour;context.lineWidth=width;
      context.stroke();context.restore();
    };
    const text = (p,words,colour=hue.ink,size=22) => {
      context.font="700 "+size+"px system-ui";context.textAlign="center";context.textBaseline="middle";
      context.strokeStyle=hue.wash;context.lineWidth=4;context.lineJoin="round";context.strokeText(words,...p,550);
      context.fillStyle=colour;context.fillText(words,...p,550);
    };
    const marker = (p,colour=hue.ink,r=4) => {
      context.beginPath();context.arc(...p,r,0,period);context.fillStyle=colour;context.fill();
    };
    const arc = (p,r,b,e,colour=hue.purple,w=2) => {
      context.beginPath();context.arc(...p,r,b,e);context.strokeStyle=colour;context.lineWidth=w;context.stroke();
    };
    const wedge = (p,q,r,label="",colour=hue.purple,size=26) => {
      const a=bearing(sub(q,p)), b=bearing(sub(r,p));
      const delta=(b-a+3*Math.PI)%period-Math.PI;
      const radius=Math.min(size,.23*len(sub(q,p)),.23*len(sub(r,p)));
      if (close(Math.abs(delta),Math.PI/2)) {
        const u=vector(a),v=vector(b),step=Math.max(6,radius*.62);
        const corner=add(add(p,u,step),v,step);
        line(add(p,u,step),corner,colour,2);line(corner,add(p,v,step),colour,2);
      } else {
        arc(p,radius,a+Math.min(0,delta),a+Math.max(0,delta),colour);
      }
      if (label) text(add(p,vector(a+delta/2),radius+20),label,colour,17);
    };
    const tick = (p,q,count) => {
      const u=unit(sub(q,p)),v=[-u[1],u[0]];
      const mid=add(p,sub(q,p),.5);
      for(let j=0;j<count;j++) {
        const centre=add(mid,u,(j-(count-1)/2)*6);
        line(add(centre,v,-7),add(centre,v,7),hue.teal,2);
      }
    };
    const polygon = (points, names="",options={}) => {
      const {fill="#e9f1fd", colour=hue.ink, ticks=[], wedges=[], dashed=false}=options;
      context.beginPath();context.moveTo(...points[0]);points.slice(1).forEach(p=>context.lineTo(...p));context.closePath();
      if (fill) { context.fillStyle=fill;context.fill(); }
      const centre=points.reduce((sum,p)=>add(sum,p,1/points.length),[0,0]);
      points.forEach((p,i)=>{
        const q=points[(i+1)%points.length], r=points[(i+2)%points.length];
        line(p,q,colour,dashed?2:3,dashed?[7,5]:[]);
        if (ticks.includes(i)) tick(p,q,i+1);
        if (wedges.includes(i)) wedge(p,q,r);
        if (names) { marker(p,colour);text(add(p,unit(sub(p,centre)),20),names[i],colour,20); }
      });
    };
    return {line,text,marker,arc,wedge,polygon};
  }
  const dialog=document.querySelector(".twins-dialog");
  const enlarged=dialog.querySelector(".twins-dialog-content");
  let zoomDraw=null;
  function showZoom(element, redraw=null) {
    zoomDraw=redraw;enlarged.replaceChildren(element);dialog.showModal();
    if (redraw) redraw();
  }
  dialog.querySelector("button").addEventListener("click",()=>dialog.close());
  dialog.addEventListener("close",()=>{zoomDraw=null;enlarged.replaceChildren();});
  document.querySelector(".twins-notes").addEventListener("click",event=>{
    const answer=event.target.closest("[data-open-answer]");
    if (answer) document.querySelector(answer.hash).open=true;
    const link=event.target.closest('a[href$=".png"]');
    if (!link || !dialog.showModal || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const photo=new Image();photo.src=link.href;photo.alt=link.querySelector("img").alt;
    showZoom(photo);
  });
  document.querySelectorAll(".twins-check").forEach(group=>{
    group.addEventListener("click",event=>{
      const selected=event.target.closest("button");
      if (!selected) return;
      group.querySelectorAll("button").forEach(button=>button.setAttribute("aria-pressed",String(button===selected)));
      group.querySelector("[role=status]").textContent=(selected.dataset.correct==="true"?"Correct. ":"Review this. ")+group.querySelector("template").content.textContent;
    });
  });
  if ("IntersectionObserver" in window) new IntersectionObserver(([entry])=>entry.target.classList.toggle("is-visible",entry.isIntersecting))
    .observe(document.querySelector(".twins-cover"));
  function paint(canvas,draw) {
    const width=canvas.clientWidth;
    if (!width) return;
    const w=Math.round(width*(window.devicePixelRatio||1)),h=Math.round(w*370/600);
    if (canvas.width!==w || canvas.height!==h) {canvas.width=w;canvas.height=h;}
    const ctx=canvas.getContext("2d");
    ctx.setTransform(w/600,0,0,h/370,0,0);ctx.fillStyle=hue.wash;ctx.fillRect(0,0,600,370);
    draw(drawing(ctx));
  }
  function surface(id,draw) {
    const detail=get("tool-"+id), canvas=get(id+"-canvas");
    let enlargedDraw;
    const redraw=()=>{
      if (detail.open) paint(canvas,draw);
      if (zoomDraw && zoomDraw===enlargedDraw && dialog.open) enlargedDraw();
    };
    detail.addEventListener("toggle",redraw);
    if ("ResizeObserver" in window) new ResizeObserver(redraw).observe(canvas);
    window.addEventListener("resize",redraw,{passive:true});
    click(id+"-zoom",()=>{
      const c=document.createElement("canvas");
      c.style.aspectRatio="600 / 370";c.setAttribute("role","img");
      c.setAttribute("aria-label",canvas.getAttribute("aria-label"));c.setAttribute("aria-describedby",id+"-status");
      enlargedDraw=()=>paint(c,draw);showZoom(c,enlargedDraw);
    });
    canvas.closest(".twins-live").hidden=false;
    return {detail,canvas,redraw};
  }
  function position(event,canvas) {
    const rect=canvas.getBoundingClientRect();
    return [(event.clientX-rect.left)*600/rect.width,(event.clientY-rect.top)*370/rect.height];
  }

  const silhouette=[[-104,47],[-88,-52],[69,-38],[101,43]];
  const targetPosition=[197,178];
  const chosenPose=()=>[number("overlay-x"),number("overlay-y"),number("overlay-turn"),get("overlay-flip").checked];
  let animation=0;
  const overlay=surface("overlay",draw=>{
    const [x,y,turn,mirrored]=chosenPose(), larger=value("overlay-kind")==="larger";
    const target=silhouette.map(p=>add(targetPosition,p));
    const shape=rotate(silhouette.map(([a,b])=>[(mirrored?-a:a)*(larger?1.23:1),b*(larger?1.23:1)]),rad(turn));
    const moving=shape.map(p=>add(add(targetPosition,[x,y]),p));
    const aligns=moving.every((p,i)=>len(sub(p,target[i]))<.01);
    draw.polygon(target,"ABCD",{fill:null,colour:hue.blue,dashed:true});
    draw.polygon(moving,aligns?"":"PQRS",{fill:"#c6abe75e",colour:hue.purple});
    if(aligns) target.forEach((p,i)=>{draw.marker(p,hue.teal,7);draw.text(add(p,[0,35]),["A/P","B/Q","C/R","D/S"][i],hue.teal,19);});
    say("overlay",aligns?"Exact match. A aligns with P, B with Q, C with R and D with S.":larger?"No exact overlap is possible. This copy was enlarged by a factor of 1.23.":"The figures have equal corresponding lengths. Adjust position, turn and reflection to bring corresponding vertices together.");
  });
  const setPose=(x,y,turn,mirrored)=>{
    get("overlay-x").value=Math.max(-240,Math.min(240,Math.round(x)));
    get("overlay-y").value=Math.max(-100,Math.min(100,Math.round(y)));
    get("overlay-turn").value=Math.round(turn);get("overlay-flip").checked=mirrored;
    overlay.redraw();
  };
  for(const field of ["x","y","turn","flip","kind"]) on("overlay-"+field,"input",()=>{cancelAnimationFrame(animation);overlay.redraw();});
  click("overlay-reset",()=>{cancelAnimationFrame(animation);setPose(200,0,60,false);});
  click("overlay-go",()=>{
    cancelAnimationFrame(animation);
    const [x,y,turn,mirror]=chosenPose();
    if(reduced.matches){setPose(0,0,0,false);return;}
    const began=performance.now();
    const next=time=>{
      const t=Math.min(1,(time-began)/550),r=(1-t)**2;
      setPose(x*r,y*r,turn*r,mirror && t<.5);
      if(t<1 && overlay.detail.open) animation=requestAnimationFrame(next);
    };
    animation=requestAnimationFrame(next);
  });
  overlay.detail.addEventListener("toggle",()=>{if(!overlay.detail.open)cancelAnimationFrame(animation);});
  let drag=null;
  overlay.canvas.addEventListener("pointerdown",event=>{
    cancelAnimationFrame(animation);drag=[position(event,overlay.canvas),chosenPose()];overlay.canvas.setPointerCapture(event.pointerId);
  });
  overlay.canvas.addEventListener("pointermove",event=>{
    if(!drag)return;
    const diff=sub(position(event,overlay.canvas),drag[0]);
    setPose(drag[1][0]+diff[0],drag[1][1]+diff[1],drag[1][2],drag[1][3]);
  });
  for (const name of ["pointerup","pointercancel","lostpointercapture"]) overlay.canvas.addEventListener(name,()=>{drag=null;});

  const formatList=values=>values.map(round).join(", ");
  const evidence={
    SSS:{ticks:[0,1,2],wedges:[]},SAS:{ticks:[0,2],wedges:[0]},ASA:{ticks:[0],wedges:[0,1]},
    AAS:{ticks:[0],wedges:[0,2]},RHS:{ticks:[0,1],wedges:[0]},AAA:{ticks:[],wedges:[0,1,2]},SSA:{ticks:[0,1],wedges:[0]}
  };
  function showPair(draw,a,b,marks="SSS",names="PQR"){
    const [p,q]=pairFrame(a,b);
    draw.polygon(p,"ABC",evidence[marks]);
    draw.polygon(q,names,{...evidence[marks],fill:"#e1f6ef"});
  }
  const compareIds=["a","b"].map(letter=>["base","side","angle"].map(k=>"compare-"+letter+"-"+k));
  const compare=surface("compare",draw=>{
    if (!compareIds.flat().every(id=>get(id).checkValidity())) {
      draw.text([300,180],"Check both side lengths and angles.",hue.amber);
      say("compare","Lengths must be positive and angles must be between 0° and 180°.");return;
    }
    const [a,b]=compareIds.map(ids=>triangle("sas",ids.map(number)));
    const ea=edges(a),eb=edges(b);
    const same=ea.every((e,i)=>close(e,eb[i]));
    const sortedA=[...ea].sort((x,y)=>x-y), sortedB=[...eb].sort((x,y)=>x-y);
    const any=sortedA.every((e,i)=>close(e,sortedB[i]));
    const options=same?evidence.SSS:{ticks:ea.flatMap((e,i)=>close(e,eb[i])?[i]:[])};
    const [p,q]=pairFrame(a,flip(b));
    draw.polygon(p,"ABC",options);draw.polygon(q,"PQR",{...options,fill:"#e1f6ef"});
    draw.text([151,306],"Sides: "+formatList(ea),hue.blue,17);
    draw.text([449,306],"Sides: "+formatList(eb),hue.teal,17);
    say("compare",(same?"Congruent in the shown order by SSS.":any?"Congruent by SSS after reordering vertices; the labelled order differs.":"Different sizes or shapes. At least one sorted side length differs.")+" First angles: "+formatList(angles(a))+" degrees. Second angles: "+formatList(angles(b))+" degrees.");
  });
  compareIds.flat().forEach(id=>on(id,"input",compare.redraw));

  const steps={
    sss:["Draw base with ruler","Draw compass arc from A","Draw compass arc from B","Join both sides to C"],
    sas:["Draw base with ruler","Draw angle with protractor","Mark AC on the ray","Join BC"],
    asa:["Draw base with ruler","Draw ray from A","Draw ray from B","Mark intersection C"],
    aas:["Find missing angle and draw base","Draw given ray from A","Draw the calculated ray from B","Mark intersection C"],
    rhs:["Draw the leg with ruler","Draw perpendicular at A","Draw hypotenuse arc from B","Mark C and join BC"]
  };
  const errors={sss:"The three lengths must satisfy strict triangle inequality.", rhs:"The hypotenuse must be longer than the leg.",asa:"The two given angles must add to less than 180°.",aas:"The two given angles must add to less than 180°."};
  function drawSSA(draw){
    const direction=vector(-rad(30)), proj=9*direction[0], spread=Math.sqrt(36-(9*direction[1])**2);
    const [a,b,c,d]=frame([[0,0],[9,0],add([0,0],direction,proj-spread),add([0,0],direction,proj+spread)]);
    draw.line(a,b);draw.line(a,add(a,sub(d,a),1.13),hue.blue);
    draw.line(b,c,hue.teal);draw.line(b,d,hue.purple);
    const headings=[bearing(sub(c,b)),bearing(sub(d,b))].sort((x,y)=>x-y);
    draw.arc(b,len(sub(c,b)),headings[0]-.18,headings[1]+.18,hue.amber);
    draw.wedge(a,b,d,"30°");
    [a,b,c,d].forEach((p,i)=>{draw.marker(p);draw.text(add(p,[0,i<2?25:-21]),["A","B","C","C′"][i]);});
  }
  function protractor(draw,cent,radius){
    draw.arc(cent,radius,Math.PI,period,hue.teal,1.5);
    for(let a=0;a<=180;a+=15){
      const v=vector(rad(180+a));
      draw.line(add(cent,v,radius-7),add(cent,v,radius),hue.teal,1);
    }
  }
  function makeLab(id, initial) {
    let mode=initial,stage=0,overlaid=false,counter=false,measure=null,progress=1,animation=0;
    const keys=["x","y","z"];
    const inputElements=()=>Array.from(get(id+"-fields").querySelectorAll("input"));
    const view=surface(id,draw=>{
      const fields=inputElements(), data=fields.map(input=>input.valueAsNumber);
      const formOK=fields.every(input=>input.checkValidity());
      const points=formOK?triangle(mode,data):null;
      get(id+"-step").disabled=!points||stage===4||counter;
      get(id+"-undo").disabled=!stage && !overlaid && !counter;
      get(id+"-overlay").disabled=!points||stage!==4||counter;
      if(get(id+"-measure")) get(id+"-measure").disabled=!points||stage!==4;
      get(id+"-step").textContent=steps[mode][stage]||"Construction complete";
      get(id+"-overlay").textContent=overlaid?"Show the construction":"Superimpose twins";
      if (counter) {
        drawSSA(draw);say(id,"SSA counterexample. A 6 cm arc meets the 30° ray twice with a 9 cm base. AC and AC′ differ.");return;
      }
      if(!points){
        const message=formOK?errors[mode]:"Enter positive lengths and angles within the field limits.";
        draw.text([300,178],"Check the given dimensions.",hue.amber);say(id,message);return;
      }
      if (stage===0) {
        const sketch=frame(points,[290,168],[300,173]);
        draw.polygon(sketch,"ABC",{colour:hue.blue,fill:null,dashed:true});
        draw.text([300,305],"Rough sketch",hue.blue);
      }
      if(stage>0 && !overlaid){
        const [a,b,c]=frame(points);
        draw.line(a,b,hue.ink,4);draw.marker(a);draw.marker(b);
        draw.text(add(a,[0,28]),"A");draw.text(add(b,[0,28]),"B");
        draw.text(add(add(a,sub(b,a),.5),[0,51]),data[0]+" cm",hue.blue,20);
        if(stage===1){
          const mid=add(a,sub(b,a),.5);
          draw.line(add(a,[0,11]),add(b,[0,11]),hue.teal,2);
          draw.line(add(mid,[0,6]),add(mid,[0,16]),hue.teal,2);
        }
        if(mode==="sss"){
          [a,b].slice(0,Math.max(0,stage-1)).forEach((start,i)=>{
            const direction=sub(c,start), heading=bearing(direction);
            draw.arc(start,len(direction),heading-.30,heading+.30,i?hue.teal:hue.purple,3);
            draw.text(add(add(start,direction,.58),[i?42:-42,-12]),data[i+1]+" cm",i?hue.teal:hue.purple,19);
          });
        }
        if(mode==="rhs" && stage>=2){
          draw.line(a,add(a,sub(c,a),1.12),hue.teal,3,[7,5]);draw.wedge(a,b,c);
          if(stage>=3){
            const direction=sub(c,b),heading=bearing(direction);
            draw.arc(b,len(direction),heading-.3,heading+.3,hue.purple,3);
            draw.text(add(add(b,direction,.54),[38,-20]),data[1]+" cm",hue.purple,19);
          }
        }
        if(["sas","asa","aas"].includes(mode)&&stage>=2){
          draw.line(a,add(a,sub(c,a),1.13),hue.blue,3,[6,4]);
          const measured=angles(points);
          draw.wedge(a,b,c,round(measured[0])+"°",hue.blue);
          if(stage===2)protractor(draw,a,69);
          if(stage>=3 && mode!=="sas"){
            draw.line(b,add(b,sub(c,b),1.13),hue.teal,3,[6,4]);
            draw.wedge(b,a,c,round(measured[1])+"°",hue.teal);
            if(stage===3)protractor(draw,b,67);
          }
          if(stage===3 && mode==="sas"){
            draw.marker(c,hue.purple);draw.text(add(c,[0,-21]),"C");
            draw.text(add(add(a,sub(c,a),.53),[-44,-6]),data[1]+" cm",hue.purple,19);
          }
        }
        if(stage===4){
          draw.line(a,c);draw.line(b,c);draw.marker(c);draw.text(add(c,[0,-24]),"C");
          if(measure!==null){
            const shown=[a,b,c];
            draw.wedge(shown[measure],shown[(measure+1)%3],shown[(measure+2)%3],round(angles(points)[measure])+"°",hue.amber,38);
          }
        }
      }
      if(overlaid){
        const p=frame(points,[265,185],[272,165]);
        const centre=bounds(p).centre;
        const offset=(1-progress)*99;
        const local=p.map(vertex=>sub(vertex,centre));
        const oriented=progress<.28?flip(local):local;
        const moving=rotate(oriented,rad(24)*(1-progress)).map(vertex=>add(add(centre,[offset,offset*.42]),vertex));
        draw.polygon(p,"ABC",{...evidence[mode.toUpperCase()],colour:hue.blue});
        draw.polygon(moving,progress===1?"":"PQR",{fill:null,colour:hue.purple,dashed:true});
        if(progress===1)p.forEach((vertex,i)=>draw.text(add(vertex,[0,31]),["A/P","B/Q","C/R"][i],hue.teal,18));
      }
      const adjusted=mode==="aas"?" The calculated base angle B is "+round(angles(points)[1])+"°.":"";
      if(measure!==null){say(id,"Angle "+ "ABC"[measure]+" measures "+round(angles(points)[measure])+"°.");return;}
      if(overlaid){
        say(id,progress===1?"The twins coincide. A ↔ P, B ↔ Q and C ↔ R. The measurements guarantee "+mode.toUpperCase()+".":"The reflected copy flips and moves to the same vertices.");
        return;
      }
      if(stage===4){
        say(id,"Construction complete. Sides AB, BC, CA: "+formatList(edges(points))+" cm. Angles A, B, C: "+formatList(angles(points))+" degrees."+adjusted);
      }else say(id,"Step "+(stage+1)+" of 4. "+steps[mode][stage]+"."+adjusted);
    });
    function reset(){cancelAnimationFrame(animation);stage=0;overlaid=false;counter=false;measure=null;view.redraw();}
    click(id+"-step",()=>{stage++;measure=null;view.redraw();});
    click(id+"-undo",()=>{
      cancelAnimationFrame(animation);
      if(counter)counter=false;else if(overlaid)overlaid=false;else if(stage)stage--;
      measure=null;view.redraw();
    });
    click(id+"-reset",reset);
    click(id+"-overlay",()=>{
      cancelAnimationFrame(animation);overlaid=!overlaid;measure=null;
      if(!overlaid || reduced.matches){progress=1;view.redraw();return;}
      const start=performance.now();
      const move=now=>{
        progress=Math.min(1,(now-start)/565);view.redraw();
        if(progress<1&&view.detail.open)animation=requestAnimationFrame(move);
      };
      animation=requestAnimationFrame(move);
    });
    view.detail.addEventListener("toggle",()=>{
      if(!view.detail.open){cancelAnimationFrame(animation);progress=1;}
    });
    get(id+"-fields").addEventListener("input",reset);
    if(id==="sas")click("sas-counter",()=>{counter=!counter;overlaid=false;measure=null;view.redraw();});
    if(id==="lab") {
      on("lab-mode","change",()=>{
        mode=value("lab-mode").toLowerCase();
        get("lab-fields").replaceChildren(...fieldNames[mode].map(([label,max,step],i)=>{
          const holder=document.createElement("label"),input=document.createElement("input");
          holder.textContent=label+" ";input.type="number";input.id="lab-"+keys[i];input.min=1;
          input.required=true;input.max=max;input.step=step;input.value=presets[mode][i];
          holder.append(input);return holder;
        }));
        reset();
      });
      click("lab-measure",()=>{measure=Number(value("lab-at"));overlaid=false;view.redraw();});
    }
  }
  for(const mode of ["sss","sas","asa","rhs"]) makeLab(mode,mode);
  makeLab("lab","sss");

  const matchOrders=["QRP","RPQ","PRQ","RQP","PQR"];
  let matchIndex=0;
  const matcher=surface("matcher",draw=>{
    const abc=triangle("sss",presets.sss);
    showPair(draw,abc,rotate(flip(abc),rad(23)),"SSS",matchOrders[matchIndex]);
  });
  const matchPrompt=()=>{
    const marks=["one and three","one and two","two and three"];
    const details=Array.from(matchOrders[matchIndex],(name,i)=>name+" meets the sides with "+marks[i]+" ticks");
    showPrompt("matcher","A meets one and three ticks, B meets one and two, and C meets two and three. Second triangle: "+details.sort().join("; ")+". Match BC to a side and ∠A to an angle.");
  };
  matchPrompt();
  click("matcher-check",()=>{
    const order=matchOrders[matchIndex];
    const side=[order[1],order[2]].sort().join("");
    const correct=value("matcher-order").replace(/\s/g,"").toUpperCase()===order&&value("matcher-side")===side&&value("matcher-angle")===order[0];
    say("matcher",(correct?"Correct. ":"Review the matching ticks. ")+"△ABC ≅ △"+order+", BC corresponds to "+side+" and ∠A to ∠"+order[0]+".");
  });
  click("matcher-next",()=>{matchIndex=(matchIndex+1)%matchOrders.length;get("matcher-order").value="";say("matcher","");matchPrompt();matcher.redraw();});

  const examples=[
    ["SSS","All three side pairs agree.","Three matching side lengths fix one shape."],
    ["SAS","AB = PQ and AC = PR. The angles at A and P agree.","The angle is between the given sides."],
    ["ASA","Angles A and P match, as do B and Q. AB = PQ.","The marked side joins the two angle vertices."],
    ["AAS","Angles A and P match, as do C and R. AB = PQ.","AB is non-included. Find B and Q and use ASA."],
    ["RHS","Angles A and P are right. BC = QR and AB = PQ.","The hypotenuses and one leg pair agree."],
    ["AAA","All three corresponding angles match.","Matching angles alone leave the size free."],
    ["SSA","AB = PQ, BC = QR and ∠A = ∠P.","The angle is outside the two given sides. A compass arc can meet its ray twice."]
  ];
  const random=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
  let current=0,variant=0;
  const criterion=surface("criterion",draw=>{
    const code=examples[current][0];
    if(code==="SSA"){drawSSA(draw);return;}
    const mode=code==="AAA"?"asa":code.toLowerCase();
    const nums=presets[mode].slice();
    if(mode==="rhs"){nums[0]+=variant;nums[1]+=variant;}
    else {nums[0]+=variant; if(mode==="sss"){nums[1]+=variant;nums[2]+=variant;}}
    const a=triangle(mode,nums);
    const b=flip(a).map(p=>add([0,0],p,code==="AAA"?1.52:1));
    showPair(draw,a,b,code);
  });
  function nextCriterion(){
    const basic=value("criterion-level")==="basic";
    const options=(basic?[0,1,2,4]:[0,1,2,3,4,5,6]).filter(i=>i!==current);
    current=options[random(0,options.length-1)];variant=random(0,3);
    showPrompt("criterion",examples[current][1]);say("criterion","");criterion.redraw();
  }
  showPrompt("criterion",examples[0][1]);
  click("criterion-next",nextCriterion);on("criterion-level","change",nextCriterion);
  click("criterion-check",()=>{
    const [code,,why]=examples[current], enough=!["SSA","AAA"].includes(code);
    say("criterion",(value("criterion-choice")===(enough?code:"none")?"Correct. ":"Review this. ")+(enough?code+" applies. ":"The information is insufficient. ")+why);
  });

  const challenges=[
    [1,25,false,"Both outlines have the same side lengths. One has been turned."],
    [1,-20,true,"The same shape was flipped and turned. The lengths are unchanged."],
    [1.5,12,false,"The right outline was scaled by a factor of 1.5. Its edges are longer."],
    [.7,-29,true,"The right outline was scaled by a factor of 0.7 and flipped."],
    [1,0,false,"The same rectangle outline was slid to the right."]
  ];
  let challenge=0;
  const compareShape=surface("challenge",draw=>{
    const [scale,turn,mirrored]=challenges[challenge];
    const a=challenge===4?[[-90,-53],[90,-53],[90,53],[-90,53]]:silhouette;
    const transform=(mirrored?flip(a):a).map(p=>add([0,0],p,scale));
    const [p,q]=pairFrame(a,rotate(transform,rad(turn)));
    draw.polygon(p,"ABCD");
    draw.polygon(q,"PQRS",{fill:"#e1f6ef"});
  });
  const challengePrompt=()=>showPrompt("challenge",challenges[challenge][3]);
  challengePrompt();
  click("challenge-next",()=>{challenge=(challenge+1)%challenges.length;say("challenge","");challengePrompt();compareShape.redraw();});
  click("challenge-check",()=>{
    const [scale,turn,mirror,words]=challenges[challenge], yes=scale===1;
    say("challenge",(value("challenge-choice")===(yes?"yes":"no")?"Correct. ":"Review this. ")+words+(yes?" Rigid moves preserve shape and size.":" Different lengths prevent exact overlap."));
  });

  let missingAngle=false, missingNumber=7, primaryAngle=48, secondaryAngle=67;
  const missing=surface("missing",draw=>{
    const p=missingAngle?triangle("asa",[7,primaryAngle,secondaryAngle]):triangle("sss",[missingNumber,6,8]);
    showPair(draw,p,flip(p),missingAngle?"ASA":"SSS");
    draw.text([151,315],missingAngle?"∠C is unknown":"AB = "+missingNumber+" cm",hue.blue,19);
    draw.text([449,315],missingAngle?"∠R is unknown":"PQ = ?",hue.teal,19);
  });
  const missingPrompt=()=>showPrompt("missing",missingAngle?
    "In congruent ABC and PQR, A and P are "+primaryAngle+"° and B and Q are "+secondaryAngle+"°. Find R.":
    "△ABC ≅ △PQR. AB = "+missingNumber+" cm. Find PQ.");
  missingPrompt();
  click("missing-next",()=>{
    missingAngle=!missingAngle;missingNumber=random(5,12);primaryAngle=random(38,60);secondaryAngle=random(55,72);
    get("missing-value").value="";missingPrompt();say("missing","");missing.redraw();
  });
  click("missing-check",()=>{
    const expected=missingAngle?180-primaryAngle-secondaryAngle:missingNumber;
    const rationale=missingAngle?"sum":"parts";
    const ok=number("missing-value")===expected && value("missing-reason")===rationale;
    say("missing",(ok?"Correct. ":"Review this. ")+(missingAngle?"The two known angles in PQR add to "+(primaryAngle+secondaryAngle)+"°. Subtract from 180° to find R = "+expected+"°.":"A matches P and B matches Q, so PQ = AB = "+expected+" cm."));
  });

  const errorsList=[
    ["included","AB and BC match two sides and ∠A matches. A student applies SAS.","The angle between AB and BC is at B. The data are SSA.","SSA"],
    ["scale","A student concludes congruence because all three angles are equal.","Changing scale preserves all angles while changing the sides.","AAA"],
    ["order","The tick marks match A with P and B with Q, but a student writes ABC ≅ QPR.","The order must retain A ↔ P and B ↔ Q. Write ABC ≅ PQR.","SSS"],
    ["right","With a right angle at A, a student uses AB as the hypotenuse.","BC lies opposite the right angle at A. AB is a leg.","RHS"]
  ];
  let mistakeIndex=0;
  const errorView=surface("error",draw=>{
    const kind=errorsList[mistakeIndex][3];
    if(kind==="SSA"){drawSSA(draw);return;}
    const a=triangle(kind==="RHS"?"rhs":"sss",kind==="RHS"?presets.rhs:presets.sss);
    showPair(draw,a,flip(a).map(p=>add([0,0],p,kind==="AAA"?1.5:1)),kind);
  });
  const mistakePrompt=()=>showPrompt("error",errorsList[mistakeIndex][1]);
  mistakePrompt();
  click("error-next",()=>{mistakeIndex=(mistakeIndex+1)%errorsList.length;mistakePrompt();say("error","");errorView.redraw();});
  click("error-check",()=>say("error",(value("error-choice")===errorsList[mistakeIndex][0]?"Correct. ":"Review this. ")+errorsList[mistakeIndex][2]));
})();
