(() => {
  "use strict";
  const M=window.DotsMath;
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
  const key="vyasa-class7-connecting-dots-v1";
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
    return {line,text,box,dot};
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
  const {unit,read,parse,format,ratio,summary,frequencies,scale,parseGroups}=M;
  const colours=[blue,"#a65619",teal];
  const alternate=[purple,teal,"#993a22"];
  const sets=new Map();
  const setText=(tag,content)=>{
    const el=document.createElement(tag); el.textContent=content; return el;
  };
  const show=(id,message,lines=[])=>{
    say(id,message);
    const div=$(id+"-work");
    div.replaceChildren();
    if(lines.length){
      const list=document.createElement("ul");
      lines.forEach(line=>list.append(setText("li",line)));
      div.append(list);
    }
  };
  const clean=(text,fallback)=>text.trim().slice(0,40)||fallback;
  function table(id,headers,rows,caption){
    const wrap=document.createElement("div"),table=document.createElement("table"),head=table.createTHead();
    wrap.className="ground-table";wrap.tabIndex=0;wrap.setAttribute("role","region");wrap.setAttribute("aria-label",caption);
    table.createCaption().textContent=caption;
    const row=head.insertRow();
    headers.forEach(text=>{const th=setText("th",text);th.scope="col";row.append(th);});
    const body=table.createTBody();
    rows.forEach(data=>{const row=body.insertRow();data.forEach(value=>row.append(setText("td",value)));});
    wrap.append(table);$(id+"-work").append(wrap);
  }
  function run(id,fn){
    try{fn();}catch(e){if(!(e instanceof RangeError))throw e;show(id,e.message);}
  }
  const op=(id,fn)=>click(id+"-play",()=>run(id,fn));
  const normal=(id,raw,limit=30)=>{
    const values=parse(raw,limit);
    if(!values.length)throw new RangeError("Enter at least one observation.");
    return values;
  };
  const entered=(id,limit)=>normal(id,value(id),limit);
  const sorted=s=>s.sorted.map(format).join(", ");
  const overall=s=>"Count "+s.count+" · total "+format(s.total)+" · mean "+ratio(s.total,s.count)+" · median "+format(s.median)+" · range "+format(s.range);
  const summaryLines=s=>[
    "Sorted observations: "+sorted(s)+".",
    "Total "+format(s.total)+" ÷ "+s.count+" observations gives mean "+ratio(s.total,s.count)+".",
    "The middle "+(s.pair.length===1?"observation is ":"observations are ")+s.pair.map(format).join(" and ")+", giving median "+format(s.median)+".",
    "Maximum "+format(s.high)+" − minimum "+format(s.low)+" = range "+format(s.range)+"."
  ];
  function statsTable(id,groups){
    table(id,["Dataset","Count","Total","Mean","Median","Min","Max","Range"],
      groups.map(([name,numbers])=>{
        const a=summary(numbers);
        return [name,a.count,format(a.total),ratio(a.total,a.count),format(a.median),format(a.low),format(a.high),format(a.range)];
      }),"Statistical summary");
  }
  function markers(groups,extents){
    const nums=[...groups.flatMap(x=>x.values),...(extents??[])];
    return nums.length?scale(Math.min(...nums),Math.max(...nums)):scale(0,6*unit);
  }
  const left=65,right=555;
  const xpos=(n,limit)=>left+(n-limit.min)*(right-left)/(limit.max-limit.min);
  function axis(draw,y,limit){
    draw.line([left,y],[right,y],ink,2.5);
    const places=limit.max-limit.min>80*unit?14:17;
    for(let v=limit.min;v<=limit.max;v+=limit.step){
      const x=xpos(v,limit);
      draw.line([x,y-3],[x,y+8],ink,1.6);
      draw.text(format(v),x,y+20,ink,places);
    }
  }
  function stack(values,y,limit,space){
    const counts=new Map(),freq=frequencies(values),max=Math.max(1,...freq.map(([,c])=>c));
    const nearest=Math.min(Infinity,...freq.slice(1).map(([v],i)=>xpos(v,limit)-xpos(freq[i][0],limit)));
    const pitch=Math.min(24,space/(max+1)),r=Math.max(1.3,Math.min(9,pitch*.37,nearest*.4));
    return values.map(value=>{
      const rank=counts.get(value)||0;counts.set(value,rank+1);
      return {x:xpos(value,limit),y:y-12-r-rank*pitch,r};
    });
  }
  function dots(draw,t,state){
    if(!state)return;
    const {groups,limit}=state,dual=groups.length>1;
    draw.text(state.title??"One dot per observation",300,25,ink,24);
    groups.forEach(({name,values},i)=>{
      const y=dual?154+160*i:286,space=dual?83:198;
      if(dual||name)draw.text(name,300,dual?58+160*i:58,colours[i],18);
      axis(draw,y,limit);
      const placed=stack(values,y,limit,space);
      for(let j=0;j<Math.ceil(values.length*t);j++){
        const {x,y,r}=placed[j];
        if(i===0)draw.dot(x,y,r,colours[i],ink);
        else draw.box(x-r*.85,y-r*.85,r*1.7,r*1.7,colours[i],ink);
      }
    });
    if(state.unit)draw.text(state.unit,300,352,ink,16);
  }
  const dotView=(id)=>surface(id,(g,t)=>dots(g,t,sets.get(id)));
  const statsView=dotView("stats");
  function stats(){
    const a=parse(value("stats-a")),b=parse(value("stats-b"));
    const groups=[a.length&&{name:"Dataset A",values:a},b.length&&{name:"Dataset B",values:b}].filter(Boolean);
    sets.set("stats",{groups,limit:markers(groups),title:groups.length?"Compare on a shared scale":"No observations yet"});
    if(!groups.length){show("stats","Enter observations to calculate the summaries.");statsView.redraw();return;}
    show("stats",groups.map(g=>g.name+": "+overall(summary(g.values))).join(" · "),groups.flatMap(g=>[g.name,...summaryLines(summary(g.values))]));
    statsTable("stats",groups.map(g=>[g.name,g.values]));
    statsView.redraw();
  }
  let editTimer=0;
  for(const id of ["stats-a","stats-b"])on(id,"input",()=>{
    clearTimeout(editTimer);editTimer=setTimeout(()=>run("stats",stats),120);
  });
  click("stats-add",()=>run("stats",()=>{
    const a=parse(value("stats-a"));
    if(a.length>=30)throw new RangeError("Dataset A already has 30 observations.");
    a.push(read(value("stats-value")));$("stats-a").value=a.map(format).join(", ");$("stats-value").value="";stats();
  }));
  click("stats-remove",()=>run("stats",()=>{$("stats-a").value=parse(value("stats-a")).slice(0,-1).map(format).join(", ");stats();}));
  click("stats-sort",()=>run("stats",()=>{
    ["stats-a","stats-b"].forEach(id=>{$(id).value=parse(value(id)).sort((a,b)=>a-b).map(format).join(", ");});
    stats();
  }));
  const shareView=surface("share",(g,t)=>{
    const a=sets.get("share");if(!a)return;
    const width=480/a.count,scale=Math.max(1,a.high);
    g.text("The total remains "+format(a.total)+" L",300,36,ink,28);
    a.sorted.forEach((old,i)=>{
      const x=60+i*width,h=190*(old+(a.mean-old)*t)/scale;
      g.box(x+5,95,width-10,198,"#e9f0f9",blue);
      g.box(x+7,291-h,width-14,h,"#a4dec9",teal);
      g.text(t===1?ratio(a.total,a.count):format(old),x+width/2,317,ink,Math.min(17,width/3));
    });
    g.text("Redistribute the same liquid",300,350,teal,21);
  });
  function share(){
    const all=entered("share-data",10);
    if(all.some(n=>n<0))throw new RangeError("Use nonnegative amounts.");
    const s=summary(all);sets.set("share",{...s,sorted:all});
    show("share","Equal share: "+ratio(s.total,s.count)+" L per container.",["Total "+format(s.total)+" L stays unchanged.","Divide the total by "+s.count+" containers. A fractional share can be shown as part of a container."]);
    shareView.animate();
  }
  op("share",share);
  const balanceView=surface("balance",(g,t)=>{
    const s=sets.get("balance");if(!s)return;
    const limit=s.limit,where=xpos(s.mean,limit),x=left+(where-left)*t;
    g.text("Equal-weight markers",300,45,blue,30);
    for(const dot of stack(s.sorted,186,limit,105))g.dot(dot.x,dot.y,dot.r,teal,ink);
    axis(g,186,limit);
    g.line([x,222],[x,291],purple,4);
    g.text("▲",x,291,purple,32);
    g.text("Mean "+ratio(s.total,s.count),300,332,purple,26);
  });
  function balance(){
    const s=summary(entered("balance-data",14));
    sets.set("balance",{...s,limit:markers([{values:s.sorted}])});
    const numerator=s.sorted.reduce((acc,n)=>acc+Math.max(0,s.total-n*s.count),0);
    show("balance","Balance point: "+ratio(s.total,s.count)+".",[
      "Each observation has equal weight.",
      "Left distances add to "+ratio(numerator,s.count)+" units. Right distances add to the same value.",
      "Use the mean because the total of the signed distances is zero."
    ]);
    balanceView.animate();
  }
  op("balance",balance);
  on("balance-data","change",()=>run("balance",balance));
  const medianView=surface("median",(g,t)=>{
    const s=sets.get("median");if(!s)return;
    const width=520/s.count,middle=Math.floor(s.count/2);
    g.text(t<.45?"Original order":"Sorted observations",300,54,blue,30);
    (t<.45?s.original:s.sorted).forEach((n,i)=>{
      const x=40+i*width,mid=t>=.45&&(i===middle||s.count%2===0&&i===middle-1);
      g.box(x+3,134,width-6,91,mid?"#ffe08f":"#d8e8f8",ink);
      g.text(format(n),x+width/2,179,ink,Math.max(11,Math.min(27,width/3)));
      g.text(String(i+1),x+width/2,249,ink,16);
    });
    if(t>=.45)g.text("Median = "+format(s.median),300,317,teal,33);
  });
  function median(){
    const original=entered("median-data",10);
    const s={...summary(original),original};sets.set("median",s);
    show("median","Median: "+format(s.median)+".",["Start with "+s.original.map(format).join(", ")+".",...summaryLines(s).slice(0,3).filter((_,i)=>i!==1)]);
    medianView.animate();
  }
  op("median",median);
  click("median-next",()=>{
    $("median-data").value=Array.from({length:rand(4,7)},()=>rand(1,23)).join(", ");
    say("median","Predict the middle of the new list, then reveal the sorted order.");
    $("median-work").replaceChildren();
    sets.delete("median");medianView.redraw();
  });
  const outlierView=dotView("outlier");
  function outlier(){
    const values=entered("outlier-data"),after=values.slice(0,-1).concat(read(value("outlier-value")));
    const a=summary(values),b=summary(after),groups=[
      {name:"Before · mean "+ratio(a.total,a.count)+" · median "+format(a.median),values},
      {name:"After · mean "+ratio(b.total,b.count)+" · median "+format(b.median),values:after}
    ];
    sets.set("outlier",{groups,limit:markers(groups)});
    show("outlier","Mean "+ratio(a.total,a.count)+" → "+ratio(b.total,b.count)+". Median "+format(a.median)+" → "+format(b.median)+".",[
      "The total changes by "+format(b.total-a.total)+" across "+a.count+" observations.",
      "The middle position can change only if the ordered values around it change."
    ]);
    statsTable("outlier",[["Before",values],["After",after]]);outlierView.animate();
  }
  op("outlier",outlier);
  const dotCanvas=dotView("dot");
  let target=[],placed=[],drag=null;
  function updateDot(message){
    const groups=[{name:"Your dot plot",values:placed}];
    sets.set("dot",{groups,limit:markers(groups,target)});
    show("dot",message,["Target observations: "+target.map(format).join(", ")+".","Placed: "+(placed.length?placed.map(format).join(", "):"none")+"." ]);
    if(placed.length)statsTable("dot",[["Your plot",placed]]);
    dotCanvas.redraw();
  }
  function resetDots(){
    target=entered("dot-data");placed=[];
    updateDot("Place "+target.length+" dots. Repeated values share one horizontal position.");
  }
  op("dot",resetDots);
  function addDot(n){
    if(placed.length>=target.length)throw new RangeError("All positions are used. Drag a dot or undo the last one.");
    placed.push(n);updateDot(placed.length+" of "+target.length+" dots placed.");
  }
  click("dot-add",()=>run("dot",()=>addDot(read(value("dot-pos")))));
  click("dot-undo",()=>{placed.pop();updateDot(placed.length+" dots remain.");});
  click("dot-check",()=>{
    const tally=values=>JSON.stringify(frequencies(values));
    if(tally(placed)===tally(target)){
      updateDot("Correct. Each observation and stack matches the data.");
      const a=summary(target),unique=frequencies(target),tallest=Math.max(...unique.map(([,n])=>n));
      const peaks=unique.filter(([,n])=>n===tallest).map(([n])=>format(n)).join(", ");
      const gaps=unique.slice(1).map(([x],i)=>x-unique[i][0]);
      const width=Math.max(0,...gaps);
      $("dot-work").append(setText("p","Highest stack at "+peaks+". The range is "+format(a.range)+(width?", and the largest spacing between neighbouring occupied positions is "+format(width):"")+"."));
    }else updateDot("Compare your stacks with the target, including repeated values.");
  });
  click("dot-reveal",()=>{placed=target.slice();updateDot("Complete graph revealed.");});
  function point(event){
    const rect=dotCanvas.canvas.getBoundingClientRect();
    return {x:(event.clientX-rect.left)*600/rect.width,y:(event.clientY-rect.top)*370/rect.height};
  }
  on("dot-canvas","pointerdown",event=>{
    if(!target.length)return;
    const p=point(event),limit=sets.get("dot").limit;
    const distance=Math.max(16,16*600/dotCanvas.canvas.clientWidth);
    const positions=stack(placed,286,limit,198);
    const candidates=positions.map((q,i)=>({i,d:Math.hypot(p.x-q.x,p.y-q.y)})).sort((a,b)=>a.d-b.d);
    drag={index:candidates[0]?.d<distance?candidates[0].i:-1};
    dotCanvas.canvas.setPointerCapture(event.pointerId);
  });
  on("dot-canvas","pointercancel",()=>{drag=null;});
  on("dot-canvas","pointerup",event=>run("dot",()=>{
    if(!drag)return;
    const index=drag.index;drag=null;
    const p=point(event),limit=sets.get("dot").limit;
    const raw=limit.min+(p.x-left)*(limit.max-limit.min)/(right-left);
    const step=limit.step;
    const candidates=[...new Set(target)].concat(Math.round(raw/step)*step);
    const n=candidates.filter(x=>x>=limit.min&&x<=limit.max)
      .reduce((a,b)=>Math.abs(b-raw)<Math.abs(a-raw)?b:a);
    $("dot-pos").value=format(n);
    if(index>=0){placed[index]=n;updateDot("Dot moved to "+format(n)+".");}
    else addDot(n);
  }));
  function drawBars(g,t,state){
    if(!state)return;
    const {rows,names,colours,step,top,title,unitLabel,baseline}=state;
    const x0=65,x1=568,y0=300,y1=85,bands=(x1-x0)/rows.length;
    const bar=Math.min(70,bands/(names.length+1.05));
    const pos=n=>y0-(y0-y1)*(n-baseline)/(top-baseline);
    g.text(title,300,24,ink,23);
    g.text(unitLabel,110,58,ink,16);
    names.forEach((name,i)=>{
      const x=300+(i-(names.length-1)/2)*152;
      g.box(x-62,344,13,13,colours[i],ink);
      if(i)g.line([x-61,351],[x-51,351],"white",1.2);
      g.text(name,x+22,350,ink,15);
    });
    for(let v=baseline;v<=top;v+=step){
      const y=pos(v);
      g.line([x0,y],[x1,y],"#b6c8de",1.2);
      g.text(format(v),33,y,ink,14);
    }
    g.line([x0,y0],[x1,y0],ink,2.5);
    g.line([x0,y0],[x0,y1],ink,2.5);
    rows.forEach(({label,values},j)=>{
      const x=x0+(j+.5)*bands;
      const labelLimit=Math.max(5,Math.floor(bands/7));
      g.text(label.length>labelLimit?label.slice(0,labelLimit-1)+"…":label,x,319,ink,Math.max(10,Math.min(15,bands/8)));
      values.forEach((value,i)=>{
        const mid=x+(i-(names.length-1)/2)*bar,h=(y0-pos(value))*t,y=y0-h;
        g.box(mid-bar*.43,y,bar*.86,h,colours[i],ink);
        if(i){
          for(let yLine=y+5;yLine<y0-2;yLine+=i===1?6:10){
            g.line([mid-bar*.39,yLine],[mid+bar*.39,yLine],"#ffffff",1);
          }
        }
        if(t>.95&&rows.length<=4){
          const small=String(format(value)).length>5;
          g.text(format(value),mid,Math.max(72,y-8),ink,small?10:13);
        }
      });
    });
    if(baseline)g.text("Truncated baseline shown for comparison",300,76,red,15);
  }
  const views={};
  function unwrapGraph(id,title,unitLabel,names,rows,options={}){
    const max=Math.max(...rows.flatMap(row=>row.values)),baseline=options.baseline||0;
    const step=options.step||scale(0,max||unit).step;
    const top=Math.max(baseline+step,baseline+Math.ceil((max-baseline)/step)*step);
    if((top-baseline)/step>9)throw new RangeError("Choose a larger scale interval so the graph has at most nine intervals.");
    const model={rows,names,step,top,title,unitLabel,baseline,colours:options.colours||colours};
    sets.set(id,model);
    views[id].animate();
    return model;
  }
  function displayGraph(id,title,unitLabel,names,rows,message,lines,options={},includeStats=true){
    const model=unwrapGraph(id,title,unitLabel,names,rows,options);
    show(id,message,lines);
    table(id,["Category",...names],rows.map(row=>[row.label,...row.values.map(format)]),title+" data table");
    if(includeStats)statsTable(id,names.map((name,i)=>[name,rows.map(row=>row.values[i])]));
    return model;
  }
  const fromRaw=(labels,series)=>labels.map((label,i)=>({label,values:series.map(col=>M.read(col[i]))}));
  for(const id of ["bars","cricket","weather","market","rocket","detect"])
    views[id]=surface(id,(g,t)=>drawBars(g,t,sets.get(id)));
  function bars(){
    const rows=parseGroups(value("bars-data")),count=rows[0].values.length;
    const names=value("bars-legend").split(",").map(t=>t.trim());
    if(names.length!==count||new Set(names).size!==count||names.some(n=>!n||n.length>14))
      throw new RangeError("Provide one distinct series name per column, up to 14 characters each.");
    const step=value("bars-step").trim()?read(value("bars-step")):0;
    if(step<0||value("bars-step").trim()&&!step)throw new RangeError("Use a positive scale interval, or leave it blank for automatic scaling.");
    const title=clean(value("bars-title"),"Clustered bar graph"),units=clean(value("bars-unit"),"Values");
    const model=displayGraph("bars",title,units,names,rows,"Graph ready. Read exact values and compare corresponding bars.",[
      "Each group uses equal bar widths and a shared scale from zero.",
      "Use the legend to distinguish colour and stripe patterns."
    ],{step,colours:value("bars-style")==="alt"?alternate:colours});
    $("bars-work").append(setText("p","Scale: "+format(model.step)+" "+units+" per grid interval."));
  }
  op("bars",bars);
  click("bars-save",()=>run("bars",()=>{
    bars();
    const image=document.createElement("canvas");
    image.width=2400;image.height=1480;
    const ctx=image.getContext("2d");ctx.setTransform(4,0,0,4,0,0);
    ctx.fillStyle=wash;ctx.fillRect(0,0,600,370);drawBars(pen(ctx),1,sets.get("bars"));
    image.toBlob(blob=>{
      if(!blob){say("bars","The browser could not make a PNG.");return;}
      const href=URL.createObjectURL(blob),link=document.createElement("a");
      link.href=href;link.download="vyasa-clustered-bar-graph.png";
      document.body.append(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(href),1500);
    },"image/png");
  }));
  function cricket(){
    const scores=value("cricket-mode")==="Players",names=scores?["Asha","Diya"]:["Team A","Team B"];
    const rows=fromRaw(scores?["Innings 1","Innings 2","Innings 3","Innings 4","Innings 5"]:["Over 1","Over 2","Over 3","Over 4","Over 5"],
      scores?[[18,22,19,23,18],[7,28,12,35,18]]:[[4,8,3,9,6],[2,9,7,5,7]]);
    displayGraph("cricket",scores?"Fictional innings scores":"Fictional runs per over","Runs",names,rows,
      scores?"Both players average 20 runs across these innings.":"Both teams scored 30 runs across the five shown overs.",[
        scores?"Asha’s range is 23 − 18 = 5. Diya’s range is 35 − 7 = 28.":"Compare corresponding overs first. Then add each team’s bars to compare totals.",
        "Use the same set of innings or overs when comparing the players or teams."
      ]);
  }
  op("cricket",cricket);
  function weather(){
    const seasonal=value("weather-mode")==="Seasonal comparison";
    const rows=fromRaw(seasonal?["Jan","Apr","Jul","Oct"]:["Dec","Jan","Feb"],seasonal?[[8,17,28,18],[26,19,11,20]]:[[9,8,10],[25,26,24]]);
    displayGraph("weather",seasonal?"Sample seasonal temperatures":"Sample year-end temperatures","Temperature (°C)",["North City","South City"],rows,
      seasonal?"North City is warmest in July, while South City is warmest in January among the shown months.":"January is North City’s coolest and South City’s warmest shown month.",[
        "The data are fictional monthly samples. Notice that the two series can move in opposite directions.",
        "Check the requested city, month and unit before drawing a conclusion."
      ]);
  }
  op("weather",weather);
  const prices={
    January:[[32,24,20],[28,30,22]],
    February:[[35,29,23],[32,34,25]],
    March:[[29,26,25],[30,31,24]]
  };
  function market(){
    const month=value("market-mode"),rows=fromRaw(["Onion","Tomato","Potato"],prices[month]);
    const a=summary(rows.map(r=>r.values[0])),b=summary(rows.map(r=>r.values[1]));
    displayGraph("market",month+" sample market prices","Rupees per kg",["East market","West market"],rows,
      month+": mean price "+ratio(a.total,a.count)+" East and "+ratio(b.total,b.count)+" West rupees/kg.",[
        "Compare the two bars for one vegetable before comparing totals.",
        "The range is "+format(a.range)+" rupees/kg in East and "+format(b.range)+" in West for these three products."
      ]);
  }
  op("market",market);
  function rocket(){
    const all=value("rocket-mode")==="All years";
    const rows=fromRaw(["2023","2024","2025"],[[5,8,12],[8,9,10],[3,5,7]]).slice(all?0:1);
    displayGraph("rocket","Fictional rocket launches","Launches",["Orbit","Sky","Zenith"],rows,
      "Orbit has the largest increase over the shown period.",[
        "Orbit rises by "+(all?7:4)+", Sky by "+(all?2:1)+", and Zenith by "+(all?4:2)+" launches.",
        "The 2025 maximum is Orbit’s 12 launches. These counts describe launches only."
      ]);
  }
  op("rocket",rocket);
  const timeView=dotView("time"),trials={"60":[],"180":[]};
  let started=null;
  function refreshTime(message){
    const target=Number(value("time-target")),values=trials[target];
    const groups=[{name:"Attempts in seconds",values}],n=values.length;
    sets.set("time",{groups,limit:markers(groups,[target*unit]),title:"Target: "+target+" seconds",unit:"Elapsed seconds"});
    show("time",message??(n?"Recorded "+n+" attempts. "+overall(summary(values))+".":"Start a trial to collect data."),n?[
      "Attempts: "+values.map(format).join(", ")+" seconds.",
      "Mean absolute error: "+ratio(values.reduce((sum,x)=>sum+Math.abs(x-target*unit),0),n)+" seconds from target.",
      "The difference between maximum and minimum is the range."
    ]:[]);
    if(n)statsTable("time",[["Attempts",values]]);
    $("time-stop").disabled=started===null;
    timeView.redraw();
  }
  click("time-start",()=>{
    if(started!==null)return;
    if(trials[value("time-target")].length>=30){
      say("time","Thirty attempts are recorded for this target. Reset this target to continue.");return;
    }
    started=performance.now();
    $("time-target").disabled=true;$("time-start").disabled=true;
    refreshTime("Timer running. Stop when you think the target time has passed.");
  });
  click("time-stop",()=>{
    if(started===null)return;
    const elapsed=Math.min(99999999,Math.round((performance.now()-started)/100)*100);
    trials[value("time-target")].push(elapsed);started=null;
    $("time-target").disabled=false;$("time-start").disabled=false;
    refreshTime("Elapsed time: "+format(elapsed)+" s. "+overall(summary(trials[value("time-target")]))+".");
  });
  on("time-target","change",()=>refreshTime());
  click("time-reset",()=>{
    started=null;trials[value("time-target")]=[];
    $("time-target").disabled=false;$("time-start").disabled=false;refreshTime();
  });
  const investigations=[
    {title:"Heights from an unfair baseline",unit:"Centimetres",names:["Class mean"],data:fromRaw(["A","B"],[[148,150]]),options:{baseline:147*unit,step:unit},
      claims:["The second mean is three times the first.","The two means differ by 2 cm.","Every member of B is taller than every member of A."],correct:"b",
      why:"150 − 148 = 2 cm. The visible lengths of 1 and 3 come from starting at 147, which exaggerates the ratio. Group means do not establish individual order."},
    {title:"Three sample launch years",unit:"Launches",names:["Orbit","Sky"],data:fromRaw(["2023","2024","2025"],[[5,8,12],[8,9,10]]),
      claims:["Orbit had more launches than Sky in all three years.","Sky’s launches decreased from 2024 to 2025.","Orbit had two more launches than Sky in 2025."],correct:"c",
      why:"Read the matched 2025 bars: 12 − 10 = 2. Sky is higher in 2023 and 2024."},
    {title:"Books recorded in two classes",unit:"Books",names:["Books read"],data:fromRaw(["Class A","Class B"],[[28,24]]),
      claims:["Class A recorded four more books.","Every student in A read more.","Class A has the larger mean even though group sizes are unknown."],correct:"a",
      why:"The chart gives totals. 28 − 24 = 4 books. Individual counts and group sizes are unavailable."}
  ];
  let detectIndex=0;
  function detective(){
    const data=investigations[detectIndex];
    displayGraph("detect",data.title,data.unit,data.names,data.data,"Which claim has enough evidence?",data.claims.map((line,i)=>String.fromCharCode(65+i)+". "+line),data.options,false);
  }
  click("detect-next",()=>{detectIndex=(detectIndex+1)%investigations.length;detective();});
  click("detect-check",()=>{
    const d=investigations[detectIndex];
    say("detect",(value("detect-answer")===d.correct?"Correct. ":"Review the claims. ")+d.why);
  });
  const choices=[
    {values:"2, 4, 6, 8, 10",question:"How much does each group receive after redistributing all the water equally?",answer:"mean",reason:"equal",why:"The total amount is preserved, so divide the total by the number of groups."},
    {values:"21, 22, 24, 25, 80",question:"Find a typical waiting time when one delay was unusually long.",answer:"median",reason:"extreme",why:"The 80-minute delay increases the mean, while 24 describes the middle visit."},
    {values:"12, 15, 17, 20, 26, 30",question:"Choose a value between the lower and upper halves of the sorted scores.",answer:"median",reason:"position",why:"Average the two central entries, 17 and 20, to get 18.5."},
    {values:"24, 28, 29, 33, 91",question:"Which statistic would combine with the meal count to recover the full expense?",answer:"mean",reason:"equal",why:"Multiply the mean by the count to give the total, even with an unusually expensive meal."}
  ];
  let choiceIndex=0;
  function choice(){
    const q=choices[choiceIndex];
    show("choice",q.question,["Data: "+q.values+"."]);
  }
  function choiceNext(){
    const level=Number(value("choice-level")),eligible=level===1?[0,1]:level===2?[0,1,2]:[1,2,3];
    const available=eligible.filter(index=>index!==choiceIndex);
    choiceIndex=pick(available.length?available:eligible);choice();
  }
  click("choice-next",choiceNext);
  on("choice-level","change",choiceNext);
  click("choice-check",()=>{
    const q=choices[choiceIndex],s=summary(parse(q.values));
    const correct=value("choice-answer")===q.answer&&value("choice-reason")===q.reason;
    show("choice",(correct?"Correct. ":"Review your choice. ")+q.why,["Mean "+ratio(s.total,s.count)+". Median "+format(s.median)+"."]);
  });
  const errors=[
    ["The middle item of 8, 2, 5 is 2.","sort","Sort to 2, 5, 8. The median is 5."],
    ["The bars compare totals of 48 and 50 on an axis starting at 47.","scale","Start an ordinary bar graph at zero to compare magnitude."],
    ["The mean of 2, 2 and 8 is 5 because two different values appear.","repeat","Count both 2s. The total is 12 across three observations, giving a mean of 4."],
    ["A volunteer survey found 12 books on average. The claim says every student in the school reads 12 books.","scope","Describe the volunteer group, which can have different individual amounts. A sample mean describes neither everyone individually nor the whole school by itself."]
  ];
  let errorIndex=0;
  function error(){
    show("error",errors[errorIndex][0]);
  }
  click("error-next",()=>{errorIndex=(errorIndex+1)%errors.length;error();});
  click("error-check",()=>{
    const [prompt,correct,why]=errors[errorIndex];
    say("error",value("error-answer")===correct?"Correct. "+why:"Review the correction for this statement. "+prompt);
  });
  function arenaQuestion(level){
    const type=rand(1,level===1?3:6),count=level===1?5:level===2?4:6;
    const values=Array.from({length:count},()=>rand(1,level===1?18:32)*unit);
    const s=summary(values),numbers=values.map(format).join(", ");
    if(type===1)return {prompt:"What is the median of "+numbers+"?",answer:s.median,why:"Sort the values to "+sorted(s)+", then take the centre."};
    if(type===2)return {prompt:"What is the range of "+numbers+"?",answer:s.range,why:"Subtract "+format(s.low)+" from "+format(s.high)+"."};
    if(type===3){
      const a=rand(5,30),n=rand(2,12);
      if(rand(0,1))return {prompt:n+" observations total "+(a*n)+". What is the mean?",answer:a*unit,why:"Divide "+(a*n)+" by "+n+" observations."};
      return {prompt:n+" observations have mean "+a+". What is their total?",answer:a*n*unit,why:"Multiply "+a+" by "+n+"."};
    }
    if(type===4){
      const a=rand(1,12),b=rand(1,7),n=rand(2,7);
      return {prompt:"A dot plot has "+n+" dots at "+a+" and "+b+" at "+(a+2)+". How many observations are shown?",answer:(n+b)*unit,why:"One dot is one observation, so add the stack heights."};
    }
    if(type===5){
      const a=rand(10,35),b=rand(1,8);
      return {prompt:"Two bars show "+a+" and "+(a+b)+" launches. How many more does the taller bar show?",answer:b*unit,why:"Compare with the same baseline. Subtract the shorter bar’s value from the taller one."};
    }
    const a=rand(3,12),b=rand(1,a-1);
    return {prompt:"One group contains "+(a-b)+" and the other "+(a+b)+". What is their equal share?",answer:a*unit,why:"Add the two amounts and divide by 2."};
  }
  let round=null,timer=0;
  function arenaStats(){
    $("arena-score").textContent=(round?round.points+" points · "+round.correct+"/"+round.attempts+" correct · streak "+round.streak+". ":"")+"Best score: "+saved.best+".";
  }
  function arenaNext(){
    if(!round?.active)return;
    round.question=arenaQuestion(Number(value("arena-level")));round.answered=false;
    $("arena-answer").value="";show("arena",round.question.prompt);
  }
  function arenaEnd(message){
    clearInterval(timer);timer=0;
    if(round)round.active=false;
    show("arena",message);arenaStats();
  }
  click("arena-start",()=>{
    clearInterval(timer);
    const seconds=Number(value("arena-mode")),deadline=Date.now()+seconds*1000;
    round={active:true,points:0,attempts:0,correct:0,streak:0};
    $("arena-clock").textContent=seconds?seconds+" seconds":"Untimed";
    if(seconds)timer=setInterval(()=>{
      const remaining=Math.max(0,Math.ceil((deadline-Date.now())/1000));
      $("arena-clock").textContent=remaining+" seconds";
      if(!remaining)arenaEnd("Time is up. Start another round to practise again.");
    },250);
    arenaNext();arenaStats();
  });
  click("arena-stop",()=>arenaEnd("Round ended."));
  click("arena-next",arenaNext);
  click("arena-check",()=>run("arena",()=>{
    if(!round?.active||round.answered)return;
    const guess=read(value("arena-answer")),q=round.question;
    round.answered=true;round.attempts++;
    const right=guess===q.answer;
    if(right){
      round.correct++;round.streak++;round.points+=10+(round.streak%3===0?5:0);
      if(round.points>saved.best){saved.best=round.points;store();}
      const panel=$("tool-arena");panel.classList.remove("ground-celebrate");
      requestAnimationFrame(()=>panel.classList.add("ground-celebrate"));
    }else round.streak=0;
    show("arena",right?"Correct. "+q.why:"The answer is "+format(q.answer)+". "+q.why,
      right&&round.streak%3===0?["Achievement: "+round.streak+" correct in a row. Five bonus points."]:[]);
    arenaStats();
  }));
  on("arena-answer","keydown",event=>{if(event.key==="Enter")$("arena-check").click();});
  on("dot-pos","keydown",event=>{if(event.key==="Enter")$("dot-add").click();});
  on("stats-value","keydown",event=>{if(event.key==="Enter")$("stats-add").click();});
  const init={stats,share,balance,median,outlier,dot:resetDots,bars,cricket,weather,market,rocket,time:()=>refreshTime(),detect:detective,choice,error};
  for(const [id,action] of Object.entries(init)){
    const panel=$("tool-"+id);
    function open(){
      if(!panel.open)return;
      panel.removeEventListener("toggle",open);run(id,action);
    }
    panel.addEventListener("toggle",open);open();
  }
  article.querySelectorAll(".ground-live").forEach(node=>{node.hidden=false;});
  arenaStats();
})();
