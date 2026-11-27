(() => {
  "use strict";
  const M=window.PeekMath;
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
  const key="vyasa-class7-another-peek-v1";
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
  const {decimal:D,format:F,label:L,expansion:E,divide,product,add,pow,fixed,round,rational,fraction}=M;
  const layouts=new Map();
  function work(id,lines,stack=""){
    const target=$(id+"-work");
    target.replaceChildren();
    if(stack){
      const pre=document.createElement("pre");
      pre.tabIndex=0;
      pre.textContent=stack;
      target.append(pre);
    }
    if(!lines.length)return;
    const list=document.createElement("ol");
    for(const line of lines){
      const item=document.createElement("li");
      item.textContent=line;
      list.append(item);
    }
    target.append(list);
  }
  const read=key=>D(value(key));
  function positive(x,allowZero=false){
    if(x.units<0n||(!allowZero&&x.units===0n))throw new RangeError(allowZero?"Enter a nonnegative value.":"Enter a positive value.");
    return x;
  }
  function integer(x,min,max){
    const v=BigInt(F(x));
    if(v<BigInt(min)||v>BigInt(max))throw new RangeError("Choose a whole number from "+min+" to "+max+".");
    return Number(v);
  }
  function count(key,min,max){
    const x=read(key);
    if(x.units%pow(x.scale))throw new RangeError("Enter a whole number.");
    return integer(x,min,max);
  }
  const exact=(a,b)=>E(divide(a,b)).text;
  const money=x=>"₹"+L(round(rational(x),2));
  function compute(id,action){
    try{action();}catch(error){
      if(!(error instanceof RangeError))throw error;
      work(id,[]);say(id,error.message);
    }
  }
  const op=(id,action)=>click(id+"-play",()=>compute(id,action));
  const show=(id,answer,steps=[])=>{say(id,answer);work(id,steps);};
  function shifted(x,power){
    const scale=x.scale-power;
    return scale<0?{units:x.units*pow(-scale),scale:0}:{units:x.units,scale};
  }
  const colours=[blue,teal,purple,"#9a5316"];
  const placeView=surface("place",(g,t)=>{
    const state=layouts.get("place");
    if(!state)return;
    const {x,y,p}=state;
    g.text(F(x)+"   "+(p>0?"×":"÷")+"   "+pow(Math.abs(p)),300,47,blue,34);
    const places=["Hundreds","Tens","Ones","Tenths","Hundredths"];
    const start=54,gap=123;
    for(let i=0;i<places.length;i++){
      const cx=start+i*gap,c=colours[Math.max(0,i-2)];
      g.box(cx-47,106,95,106,"#e5eefb",c);
      g.text(places[i],cx,131,c,16);
      const exp=2-i,shift=Math.round(p*t);
      const source=exp-shift+x.scale;
      const digit=source<0?0n:(M.abs(x.units)/pow(source))%10n;
      g.text(String(digit),cx,178,c,46);
    }
    g.text("Columns shown: hundreds through hundredths",300,260,ink,20);
    g.text("Exact result: "+F(y),300,316,teal,34);
  });
  function place(){
    const x=read("place-a"),p=Number(value("place-op")),y=shifted(x,p);
    layouts.set("place",{x,y,p});
    show("place",F(x)+" "+(p>0?"×":"÷")+" "+pow(Math.abs(p))+" = "+F(y),["Each digit changes by "+Math.abs(p)+" place-value column(s).","Multiplying moves the digits to higher-valued columns. Dividing moves them to lower-valued columns."]);
    placeView.animate();
  }
  op("place",place);
  const areaView=surface("area",(g,t)=>{
    const {a,b,c}=layouts.get("area")??{};
    if(a===undefined)return;
    const cells=10*Math.max(1,Math.ceil(Math.max(a,b)/10));
    const size=270/cells,x=29,y=48;
    g.text("Unit squares",164,25,blue,22);
    for(let j=0;j<cells;j++)for(let i=0;i<cells;i++){
      const col=i<a,row=j<Math.round(t*b);
      g.box(x+i*size,y+j*size,size,size,col&&row?"#ffd478":col?"#b9e6ed":row?"#ded0f2":"#f0f5fc");
    }
    for(let k=0;k<=cells;k++){
      const width=k%10===0?2:0.45;
      g.line([x+k*size,y],[x+k*size,y+270],"#536b8c",width);
      g.line([x,y+k*size],[x+270,y+k*size],"#536b8c",width);
    }
    g.text((a/10)+" × "+(b/10),449,108,blue,40);
    g.text(a+" columns",449,165,teal,25);
    g.text(b+" rows",449,204,purple,25);
    g.text(c+" hundredths",449,255,ink,25);
    g.text("= "+fixed(BigInt(c),2,true),449,302,teal,36);
  });
  function area(){
    const cells=id=>{
      const x=positive(read(id),true),scaled=shifted(x,1);
      return integer({...scaled,units:scaled.units},0,30);
    };
    for(const id of ["area-a","area-b"]){
      const x=read(id);
      if(x.units*10n%pow(x.scale)!==0n)throw new RangeError("Use dimensions up to 3, in steps of one tenth.");
    }
    const a=cells("area-a"),b=cells("area-b"),c=a*b;
    layouts.set("area",{a,b,c});
    show("area",fixed(BigInt(a),1,true)+" × "+fixed(BigInt(b),1,true)+" = "+fixed(BigInt(c),2,true),[a+" tenths across × "+b+" tenths down creates "+c+" overlapping hundredths."]);
    areaView.animate();
  }
  op("area",area);
  function divisionSteps(a,b){
    const scaledA=shifted(a,b.scale),scaledB=shifted(b,b.scale);
    const divisor=scaledB.units,whole=scaledA.units/pow(scaledA.scale);
    const digits=(M.abs(whole).toString()+M.abs(scaledA.units%pow(scaledA.scale)).toString().padStart(scaledA.scale,"0").slice(0,scaledA.scale)).split("");
    const point=String(M.abs(whole)).length,seen=new Map(),steps=[],quotient=[];
    const indent=String(divisor).length+3;
    let remainder=0n,index=0;
    while((index<digits.length||remainder)&&index<digits.length+36){
      if(index>=digits.length){
        if(seen.has(remainder)){
          steps.push({line:"Remainder "+remainder+" has appeared before. The following quotient digits repeat.",text:steps.at(-1).text});
          break;
        }
        seen.set(remainder,index);
      }
      const digit=BigInt(digits[index]??0),brought=remainder*10n+digit,q=brought/divisor,used=q*divisor;
      remainder=brought-used;
      if(index===point)quotient.push(".");
      quotient.push(String(q));
      const dividend=L(scaledA)+(index>=digits.length?((scaledA.scale?"":".")+"0".repeat(index-digits.length+1)):"");
      const rowEnd=indent+index+1+(index>=point?1:0),qText=quotient.join("");
      steps.push({line:(index>=digits.length?"Append a zero and regroup. ":"")+
        (index===point?"Write the decimal point in the quotient. ":"")+
        brought+" ÷ "+divisor+" gives digit "+q+". Subtract "+used+" and keep remainder "+remainder+".",
      text:[" ".repeat(indent)+qText," ".repeat(indent)+"─".repeat(dividend.length),divisor+" ⟌ "+dividend,
        String(brought).padStart(rowEnd),("−"+used).padStart(rowEnd),"─".repeat(String(brought).length).padStart(rowEnd),String(remainder).padStart(rowEnd)].join("\n")});
      index++;
    }
    return {a:scaledA,b:scaledB,steps};
  }
  const divideView=surface("divide",(g,t)=>{
    const data=layouts.get("divide");
    if(!data)return;
    const {n,f,sharing,result}=data;
    g.text(sharing?"Equal parts of the dividend":"Divisor-sized parts of the dividend",300,54,blue,30);
    const actual=Number(n),frac=Number(f),max=actual>=13?1:Math.max(1,actual/12);
    const shown=Math.min(actual,12),w=490,origin=55;
    g.box(origin,147,w,83,"#f8dedc",ink);
    if(actual===0)g.text("0: no amount to split",300,189,ink,23);
    for(let i=0;i<Math.ceil(shown*t);i++){
      const part=sharing?1:Math.min(1,actual-i);
      const left=origin+i*w*max/Math.max(1,actual),span=w*part*max/Math.max(1,actual);
      if(left+span>origin+w+0.1)break;
      g.box(left,147,span,83,i%2?"#cce8f9":"#b7e9dc",ink);
    }
    if(actual>0&&actual<13&&frac>0&&!sharing)g.text("The final shorter segment is a partial group.",300,263,ink,19);
    if(actual>=13)g.text("Showing the first 12 groups in the bar.",300,263,ink,19);
    g.text(result,300,319,teal,39);
  });
  function modelDivision(){
    const a=positive(read("divide-a"),true),b=positive(read("divide-b")),sharing=value("divide-mode")==="share";
    if(sharing&&b.units%pow(b.scale)!==0n)throw new RangeError("Sharing needs a whole number of groups.");
    const q=divide(a,b),result=E(q).text;
    const n=sharing?Number(F(b)):Number(q.n)/Number(q.d);
    const data=divisionSteps(a,b);
    layouts.set("divide",{n,f:n%1,sharing,result});
    show("divide",F(a)+" ÷ "+F(b)+" = "+result+(sharing?" per group":" groups"),[
      "Multiply both quantities by "+pow(b.scale)+": "+F(data.a)+" ÷ "+F(data.b)+".",
      sharing?"Share the dividend equally among "+F(b)+" groups.":"Count how many groups of size "+F(b)+" fit in "+F(a)+".",
      "Check the ratio using the exact fraction "+q.n+"/"+q.d+"."
    ]);
    divideView.animate();
  }
  op("divide",modelDivision);
  let mul;
  function multiplication(){
    const a=positive(read("multiply-a"),true),b=positive(read("multiply-b"),true);
    const ad=a.units.toString(),bd=b.units.toString(),partials=[];
    const steps=[];
    for(const [i,d] of [...bd].reverse().entries()){
      let carry=0n;
      const details=[];
      for(const digit of [...ad].reverse()){
        const total=BigInt(digit)*BigInt(d)+carry;
        details.push(digit+" × "+d+(carry?" + "+carry:"")+" = "+total+"; write "+total%10n+", carry "+total/10n+".");
        carry=total/10n;
      }
      const row=(a.units*BigInt(d)*pow(i)).toString();
      partials.push(row);
      steps.push({details:details.join(" ")+" The place value gives partial product "+row+".",rows:partials.slice()});
    }
    mul={a,b,steps,index:0};
    say("multiply","First multiply the whole-digit versions. Reveal each partial product.");
    showMultiplication();
  }
  function showMultiplication(){
    if(!mul)return;
    const {a,b,steps,index}=mul,total=product(a,b),width=Math.max((a.units*b.units).toString().length+2,b.units.toString().length+2);
    const line=x=>String(x).padStart(width);
    const current=steps.slice(0,index);
    const finished=index>steps.length;
    const rows=[line(a.units),line("× "+b.units),"-".repeat(width),...(current.at(-1)?.rows??[]).map(line)];
    if(finished)rows.push("-".repeat(width),line(total.units));
    const explanation=current.map(x=>x.details);
    if(finished){
      explanation.push(a.scale+" + "+b.scale+" = "+total.scale+" decimal places. Write "+L(total)+".");
      say("multiply",L(a)+" × "+L(b)+" = "+F(total));
    }
    work("multiply",explanation,rows.join("\n"));
    $("multiply-next").disabled=finished;
  }
  click("multiply-start",()=>compute("multiply",multiplication));
  click("multiply-next",()=>{if(mul){mul.index++;showMultiplication();}});
  let division;
  function longDivision(){
    const a=positive(read("longdiv-a"),true),b=positive(read("longdiv-b"));
    division={original:a,divisor:b,...divisionSteps(a,b),index:0};
    say("longdiv","Scale both by "+pow(b.scale)+". Start from "+F(division.a)+" ÷ "+F(division.b)+".");
    showDivision();
  }
  function showDivision(){
    const {steps,index,a,b,original,divisor}=division;
    const visible=steps.slice(0,index),finished=index>=steps.length;
    const stack=visible.at(-1)?.text??(F(b)+" ⟌ "+L(a));
    const lines=visible.map(x=>x.line);
    if(finished){
      const q=divide(original,divisor),result=E(q);
      lines.push("Exact ratio: "+q.n+"/"+q.d+". Parentheses enclose the repeating block when shown.");
      say("longdiv",F(original)+" ÷ "+F(divisor)+" = "+result.text);
    }
    work("longdiv",lines,stack);
    $("longdiv-next").disabled=finished;
  }
  click("longdiv-start",()=>compute("longdiv",longDivision));
  click("longdiv-next",()=>{if(division){division.index++;showDivision();}});
  function calculator(){
    const a=read("calc-a"),mode=value("calc-op"),places=Number(value("calc-places"));
    if(mode==="dtf"){
      const x=rational(a);
      return show("calc",L(a)+" = "+x.n+"/"+x.d,[a.units+"/"+pow(a.scale)+" uses the original place value.","Reduce by the greatest common factor."]);
    }
    if(mode==="round"){
      const x=round(rational(a),places);
      return show("calc",L(a)+(M.equal(a,x)?" = ":" ≈ ")+L(x),["Retain "+places+" decimal places. If the next digit is at least 5, round away from zero."]);
    }
    const b=read("calc-b");
    if(mode==="+"||mode==="-"){
      const x=add(a,b,mode==="-");
      return show("calc",F(x),["Align equal place values: "+fixed(x.left,x.scale)+" "+mode+" "+fixed(x.right,x.scale)+".","Calculate using the common place-value unit and restore "+x.scale+" decimal places."]);
    }
    if(mode==="×"){
      const x=product(a,b);
      return show("calc",F(x),["Multiply whole digits: "+a.units+" × "+b.units+" = "+x.units+".","Restore "+a.scale+" + "+b.scale+" places: "+L(x)+"."]);
    }
    if(mode==="ftd"&&(a.units%pow(a.scale)||b.units%pow(b.scale)))throw new RangeError("Use whole numbers for the numerator and denominator.");
    const q=divide(a,b),x=E(q),approx=round(q,places);
    const display=x.rest&&x.cycle===undefined?"Decimal begins "+x.text:x.text;
    show("calc",display,["Multiply both terms by "+pow(b.scale)+" for equivalent division.","The exact reduced fraction is "+q.n+"/"+q.d+".",x.cycle===undefined?(x.rest?"The quotient continues beyond the displayed digits.":"The remainder reaches zero."):"The block in parentheses repeats.","To "+places+" decimal places: "+L(approx)+"."]);
  }
  op("calc",calculator);
  const products=[
    ["Apples","84.50","kg"],["Carrots","46.80","kg"],["Rice","58.75","kg"],
    ["Notebooks","36.50","items"],["Chocolate","33.25","items"],["Milk","58.40","L"]
  ];
  let basket=[];
  const shopView=surface("shop",(g,t)=>{
    const state=layouts.get("shop");
    if(!state)return;
    g.text("Basket and checkout",300,53,blue,34);
    g.box(73,108,454,185,"#e6f1ff",blue);
    for(let i=0;i<Math.ceil(Math.min(basket.length,8)*t);i++){
      g.box(95+(i%4)*109,130+Math.floor(i/4)*68,91,56,i%2?"#e6d9fa":"#bce9dc",teal);
      g.text(String(i+1),140+(i%4)*109,158+Math.floor(i/4)*68,ink,24);
    }
    g.text("Total: "+state,300,328,teal,36);
  });
  function updateBill(){
    const budget=positive(read("shop-b"),true);
    const total=basket.reduce((acc,row)=>add(acc,row.cost),D("0"));
    const change=add(budget,total,true);
    layouts.set("shop",money(total));
    show("shop","Bill "+money(total)+". "+(change.units<0n?"Over budget by "+money({...change,units:-change.units}):"Change "+money(change))+".",
      basket.map(({name,rate,unit,quantity,cost},i)=>"Item "+(i+1)+": "+name+", "+F(quantity)+" "+unit+" × "+money(rate)+" per "+unit+" = "+money(cost)+". Cost ÷ quantity gives the unit price before rounding.")
      .concat("Add each line rounded to the nearest paisa, then subtract the bill from the budget."));
    shopView.animate();
  }
  op("shop",()=>{
    if(basket.length>=12)throw new RangeError("The basket holds up to 12 purchase lines. Empty it to start again.");
    const [name,price,unit]=products[Number(value("shop-item"))],quantity=positive(read("shop-a")),rate=D(price);
    positive(read("shop-b"),true);
    if(unit==="items"&&quantity.units%pow(quantity.scale))throw new RangeError("Choose a whole number of items.");
    const cost=round(rational(product(quantity,rate)),2);
    basket.push({name,rate,unit,quantity,cost});
    updateBill();
  });
  click("shop-clear",()=>compute("shop",()=>{basket=[];updateBill();}));
  on("shop-b","change",()=>compute("shop",updateBill));
  function barLab(id,title,unit,colour){
    return surface(id,(g,t)=>{
      const state=layouts.get(id);
      if(!state)return;
      g.text(title,300,45,blue,32);
      g.box(67,116,466,104,"#e5edf8",ink);
      g.box(67,116,466*t,104,colour,ink);
      for(let i=0;i<=10;i++)g.line([67+i*46.6,220],[67+i*46.6,i%5===0?247:236],ink,2);
      g.text("0",67,271,ink,21);
      g.text("Half",300,271,ink,21);
      g.text(unit,533,271,ink,21);
      g.text(state,300,329,teal,27);
    });
  }
  const fuelView=barLab("fuel","Fuel pump","Entered litres","#c0e6ed");
  function fuel(){
    const rate=positive(read("fuel-a")),litres=positive(read("fuel-b"),true),budget=positive(read("fuel-c"),true);
    const raw=product(rate,litres),q=divide(budget,rate);
    const exactCost=F(raw),within=fixed(q.n*1000n/q.d,3);
    const cost=money(raw);
    layouts.set("fuel",cost);
    show("fuel",F(litres)+" L costs "+cost+". Budget buys up to "+within+" L at 0.001 L increments.",[
      "Multiply "+F(litres)+" L by the rate "+F(rate)+" rupees/L to get "+exactCost+" rupees before rounding.",
      "Divide "+money(budget)+" by "+F(rate)+" rupees per litre. The exact quotient is "+q.n+"/"+q.d+" L.",
      "Round the bill to the nearest paisa. Round purchasable litres down to stay within budget."
    ]);
    fuelView.animate();
  }
  op("fuel",fuel);
  const recipeView=barLab("recipe","Measuring cup","Required amount","#cae9db");
  function recipe(){
    const n=count("recipe-a",1,500),milk=product(D("0.08"),D(n)),flour=product(D("0.07"),D(n));
    layouts.set("recipe",F(milk)+" L milk · "+F(flour)+" kg flour");
    show("recipe",n+" servings need "+F(milk)+" L milk and "+F(flour)+" kg flour.",["Divide the original ingredients by 4: 0.32 ÷ 4 = 0.08 L and 0.28 ÷ 4 = 0.07 kg per serving.","Multiply each unit amount by "+n+"."]);
    recipeView.animate();
  }
  op("recipe",recipe);
  const measureView=barLab("measure","Measurement scale","Entered amount","#d8dff9");
  function measure(){
    const a=positive(read("measure-a"),true),key=value("measure-op"),[from,to]=key.split("-");
    const factors={"m-cm":2,"cm-m":-2,"kg-g":3,"g-kg":-3,"L-mL":3,"mL-L":-3,"km-m":3,"m-km":-3};
    const shift=factors[key],x=shifted(a,shift),result=F(a)+" "+from+" = "+F(x)+" "+to;
    layouts.set("measure",result);
    show("measure",result,[(shift>0?"Multiply":"Divide")+" by "+pow(Math.abs(shift))+" to express the same quantity in "+to+"."]);
    measureView.animate();
  }
  op("measure",measure);
  op("leap",()=>{
    const y=count("leap-a",1,999999),n=count("leap-b",1,999999),leaps=M.leapsThrough(n);
    const first=Math.floor(n/4),second=first-Math.floor(n/100);
    const solar=product(D(n),D("365.2422"));
    const yearRule=y%400===0?"divisible by 400":y%100===0?"a century year with a nonzero remainder after division by 400":y%4===0?"divisible by 4 and outside the century exception":"has a nonzero remainder after division by 4";
    show("leap",y+" is "+(M.leap(y)?"a leap year":"an ordinary year")+".",[
      "It is "+yearRule+".",
      "Every fourth year: "+first+" extra days.",
      "Skip all centuries: "+second+" extra days.",
      "Restore multiples of 400: "+leaps+" extra days. The calendar has "+(n*365+leaps).toLocaleString("en-IN")+" days.",
      "Solar model: close to "+F(solar)+" days for "+n+" years."
    ]);
  });
  const hidatoIds=["hidato-a","hidato-b","hidato-c","hidato-d"];
  click("hidato-check",()=>compute("hidato",()=>{
    const [a,b,c,d]=hidatoIds.map(id=>count(id,1,9)),grid=[1,a,3,b,5,c,7,d,9];
    if(new Set(grid).size!==9)return say("hidato","Use every number from 1 through 9 once.");
    const coords=x=>[Math.floor(x/3),x%3];
    for(let n=1;n<9;n++){
      const [r1,c1]=coords(grid.indexOf(n)),[r2,c2]=coords(grid.indexOf(n+1));
      if(Math.max(Math.abs(r1-r2),Math.abs(c1-c2))!==1)return say("hidato",n+" and "+(n+1)+" must share a side or a corner.");
    }
    say("hidato","Correct. All nine numbers make a continuous neighbouring path.");
  }));
  click("hidato-reveal",()=>{
    hidatoIds.forEach((id,i)=>{$(id).value=[2,6,4,8][i];});
    show("hidato","One solution is now filled in.",["Read the middle row from right to left: 4, 5, 6."]);
  });
  function randomDecimal(max,places){
    return fixed(BigInt(rand(1,max)),places,true);
  }
  function puzzle(level,type){
    const p=level===1?1:level===2?2:3;
    const b=randomDecimal(level===1?8:level===2?28:60,p),whole=rand(2,level===1?10:35);
    const c=F(product(D(b),D(whole))),d=randomDecimal(level===1?19:level===2?125:960,p);
    if(type==="division")return {prompt:c+" ÷ "+b,answer:String(whole),why:"The inverse multiplication is "+b+" × "+whole+" = "+c+"."};
    if(type==="place"){
      const exponent=rand(1,3),x=F(shifted(D(d),exponent));
      return {prompt:d+" × "+pow(exponent),answer:x,why:"Increase each digit's place value by "+pow(exponent)+"."};
    }
    if(type==="round"){
      const x=randomDecimal(5000,3),places=rand(0,2),answer=F(round(rational(D(x)),places));
      return {prompt:"Round "+x+" to "+places+" decimal place(s)",answer,why:"Use the digit after the requested place. The rounded value is "+answer+"."};
    }
    const x=product(D(c),D(d));
    return {prompt:c+" × "+d,answer:F(x),why:"Multiply the whole digits and restore "+x.scale+" decimal place(s). The exact result is "+F(x)+"."};
  }
  const matches=(id,expected)=>{
    try{return M.equal(read(id),D(expected));}catch{return false;}
  };
  let detective,detectRight=0,detectAttempts=0,detectDone=false;
  function nextDetective(){
    const level=Number(value("detect-level"));
    detective=puzzle(level,level===1?"product":pick(["product","division"]));
    detectDone=false;$("detect-answer").value="";
    show("detect",detective.prompt+" = ?  Result digits: "+detective.answer.replace(".","")+".",[
      "Hint: the result lies "+(Number(detective.answer)<1?"between 0 and 1.":Number(detective.answer)<10?"from 1 to under 10.":"at or above 10."),
      "Accuracy: "+detectRight+" of "+detectAttempts+" attempts."
    ]);
  }
  click("detect-next",nextDetective);
  on("detect-level","change",nextDetective);
  click("detect-check",()=>{
    if(detectDone)return;
    detectAttempts++;
    const ok=matches("detect-answer",detective.answer);
    if(ok){detectDone=true;detectRight++;}
    show("detect",ok?"Correct. "+detective.why:"Try again. "+detective.prompt+" = ?",["Accuracy: "+detectRight+" of "+detectAttempts+" attempts."]);
  });
  let prediction;
  function nextPrediction(){
    const a=String(rand(3,24)),b=pick(["0.1","0.25","0.5","1","1.25","2","2.5"]),times=rand(0,1)===1;
    prediction={a,b,times,sign:times?"×":"÷"};
    say("predict","Compare "+a+" "+prediction.sign+" "+b+" with "+a+".");
  }
  click("predict-next",nextPrediction);
  click("predict-check",()=>{
    const {a,b,times,sign}=prediction,x=D(a),y=D(b),q=times?rational(product(x,y)):divide(x,y);
    const cmp=q.n-x.units*q.d,answer=cmp<0n?"less":cmp>0n?"more":"same";
    show("predict",(answer===value("predict-answer")?"Correct. ":"Review your prediction. ")+a+" "+sign+" "+b+" = "+E(q).text+".",[
      "The second number is "+(b==="1"?"equal to":Number(b)<1?"below":"above")+" 1. The result is "+(answer==="less"?"smaller":answer==="more"?"larger":"equal")+"."
    ]);
  });
  let roundState=null,timer=0;
  function arenaStats(){
    const stats=roundState?roundState.score+" points · "+roundState.correct+"/"+roundState.attempts+" correct · streak "+roundState.streak+". ":"";
    $("arena-score").textContent=stats+"Best score: "+saved.best+".";
  }
  function arenaNext(){
    if(!roundState?.active)return;
    roundState.question=puzzle(Number(value("arena-level")),pick(["product","division","round","place"]));
    $("arena-answer").value="";
    roundState.answered=false;
    say("arena",roundState.question.prompt+" = ?");
  }
  function arenaFinish(text){
    clearInterval(timer);timer=0;
    if(roundState)roundState.active=false;
    say("arena",text);arenaStats();
  }
  click("arena-start",()=>{
    clearInterval(timer);
    const seconds=Number(value("arena-mode")),end=Date.now()+seconds*1000;
    roundState={active:true,score:0,correct:0,attempts:0,streak:0};
    if(seconds)timer=setInterval(()=>{
      const remaining=Math.max(0,Math.ceil((end-Date.now())/1000));
      if(!remaining)arenaFinish("Time is up. Start another round to try again.");
      $("arena-clock").textContent=remaining+" s";
    },250);
    $("arena-clock").textContent=seconds?seconds+" s":"Untimed";
    arenaNext();arenaStats();
  });
  click("arena-stop",()=>arenaFinish("Round ended."));
  click("arena-next",arenaNext);
  click("arena-check",()=>{
    if(!roundState?.active||roundState.answered)return;
    roundState.answered=true;roundState.attempts++;
    const ok=matches("arena-answer",roundState.question.answer);
    if(ok){
      const group=$("tool-arena");
      roundState.correct++;roundState.streak++;
      roundState.score+=10+(roundState.streak%3===0?5:0);
      if(roundState.score>saved.best){saved.best=roundState.score;store();}
      group.classList.remove("ground-celebrate");
      requestAnimationFrame(()=>group.classList.add("ground-celebrate"));
    }else roundState.streak=0;
    show("arena",(ok?"Correct. ":"Answer: "+roundState.question.answer+". ")+roundState.question.why,
      ok&&roundState.streak%3===0?["Achievement: "+roundState.streak+" correct in a row. Five bonus points."]:[]);
    arenaStats();
  });
  const errors=[
    ["3.75 ÷ 1.5 = 3.75 ÷ 15","scale","Scale both by 10 to get 37.5 ÷ 15 = 2.5."],
    ["0.08 × 0.02 = 0.016","places","Four places gives 0.0016."],
    ["8.08 ÷ 4 = 2.2","zero","The tenths place is zero. Keep it: 2.02."],
    ["0.375 × 8 = 0.4 × 8, so the exact answer is 3.2","round","Keep 0.375 for the exact calculation. The answer is 3."]
  ];
  let errorIndex=0;
  const showError=()=>say("error",errors[errorIndex][0]);
  click("error-next",()=>{errorIndex=(errorIndex+1)%errors.length;showError();});
  click("error-check",()=>{
    const [prompt,key,answer]=errors[errorIndex];
    say("error",value("error-answer")===key?"Correct. "+answer:"Read the calculation again: "+prompt+".");
  });
  const arenaClock=document.createElement("p");
  arenaClock.id="arena-clock";
  $("arena-score").before(arenaClock);
  article.querySelectorAll(".ground-live").forEach(node=>{node.hidden=false;});
  const initialise={
    place,area,divide:modelDivision,multiply:multiplication,longdiv:longDivision,detect:nextDetective,
    predict:nextPrediction,calc:calculator,shop:updateBill,fuel,recipe,measure,error:showError
  };
  for(const [id,fn] of Object.entries(initialise)){
    const panel=$("tool-"+id);
    function activate(){
      if(!panel.open)return;
      compute(id,fn);
      panel.removeEventListener("toggle",activate);
    }
    panel.addEventListener("toggle",activate);
    activate();
  }
  $("arena-answer").addEventListener("keydown",event=>{if(event.key==="Enter")$("arena-check").click();});
  $("detect-answer").addEventListener("keydown",event=>{if(event.key==="Enter")$("detect-check").click();});
  arenaStats();
})();
