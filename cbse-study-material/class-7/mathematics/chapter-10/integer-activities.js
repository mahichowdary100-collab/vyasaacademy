(() => {
  "use strict";
  const M=window.IntegerLessonMath;
  if(!M)return;
  const get=id=>document.getElementById(id);
  const number=id=>get(id).valueAsNumber;
  const value=id=>get(id).value;
  const valid=(...ids)=>ids.every(id=>get(id).checkValidity()&&Number.isSafeInteger(number(id)));
  const on=(id,event,fn)=>get(id).addEventListener(event,fn);
  const click=(id,fn)=>on(id,"click",fn);
  const feedback=id=>get(id+"-status");
  const say=(id,text)=>{if(feedback(id).textContent!==text)feedback(id).textContent=text;};
  const prompt=(id,text)=>{get(id+"-prompt").textContent=text;};
  const fmt=n=>String(n).replace("-","−");
  const operand=n=>n<0?"("+fmt(n)+")":fmt(n);
  const signed=n=>n<0?fmt(n):"+"+n;
  const hue={ink:"#192d4b",blue:"#2155aa",red:"#ab3046",teal:"#08756d",purple:"#7042a8",grey:"#58657b",wash:"#f8fafc"};
  const tint=n=>n===0?hue.grey:n<0?hue.red:hue.blue;
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  const rand=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
  const pick=items=>items[rand(0,items.length-1)];
  const dialog=document.querySelector(".integer-dialog");
  const zoomContent=dialog.querySelector(".integer-dialog-content");
  let zoomUpdate=null;
  function zoom(el,redraw=null){
    zoomUpdate=redraw;zoomContent.replaceChildren(el);dialog.showModal();
    if(redraw)redraw();
  }
  dialog.querySelector("button").addEventListener("click",()=>dialog.close());
  dialog.addEventListener("close",()=>{zoomUpdate=null;zoomContent.replaceChildren();});
  document.querySelector(".integer-notes").addEventListener("click",event=>{
    const answer=event.target.closest("[data-open-answer]");
    if(answer)document.querySelector(answer.hash).open=true;
    const link=event.target.closest('a[href$=".png"]');
    if(!link||link.hasAttribute("download")||!dialog.showModal||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    event.preventDefault();
    const image=new Image();image.src=link.href;image.alt=link.querySelector("img").alt;
    zoom(image);
  });
  document.querySelectorAll(".integer-check").forEach(group=>{
    group.addEventListener("click",event=>{
      const selected=event.target.closest("button");if(!selected)return;
      group.querySelectorAll("button").forEach(button=>button.setAttribute("aria-pressed",String(button===selected)));
      group.querySelector("[role=status]").textContent=(selected.dataset.correct==="true"?"Correct. ":"Review this. ")+group.querySelector("template").content.textContent;
    });
  });
  if("IntersectionObserver" in window)new IntersectionObserver(([entry])=>entry.target.classList.toggle("is-visible",entry.isIntersecting))
    .observe(document.querySelector(".integer-cover"));
  function tools(ctx){
    const line=(x,y,X,Y,col=hue.ink,width=3)=>{
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(X,Y);ctx.lineWidth=width;ctx.strokeStyle=col;ctx.stroke();
    };
    const text=(words,x,y,col=hue.ink,size=24)=>{
      ctx.font="700 "+size+"px system-ui";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillStyle=col;ctx.fillText(words,x,y,560);
    };
    const box=(x,y,w,h,col,stroke=hue.ink)=>{
      ctx.fillStyle=col;ctx.fillRect(x,y,w,h);
      if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);}
    };
    const dot=(x,y,r,col)=>{
      ctx.beginPath();ctx.arc(x,y,r,0,2*Math.PI);ctx.fillStyle=col;ctx.fill();
    };
    const arrow=(x,y,X,Y,col=hue.purple)=>{
      line(x,y,X,Y,col,4);if(x===X&&y===Y)return;
      const a=Math.atan2(Y-y,X-x);
      ctx.beginPath();ctx.moveTo(X,Y);ctx.lineTo(X-13*Math.cos(a-.55),Y-13*Math.sin(a-.55));
      ctx.lineTo(X-13*Math.cos(a+.55),Y-13*Math.sin(a+.55));ctx.closePath();ctx.fillStyle=col;ctx.fill();
    };
    return {line,text,box,dot,arrow};
  }
  function paint(canvas,draw){
    const width=canvas.clientWidth;
    if(!width)return;
    const w=Math.round(width*(devicePixelRatio||1)),h=Math.round(w*370/600);
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    const ctx=canvas.getContext("2d");
    ctx.setTransform(w/600,0,0,h/370,0,0);ctx.fillStyle=hue.wash;ctx.fillRect(0,0,600,370);
    draw(tools(ctx));
  }
  function surface(id,draw){
    const details=get("tool-"+id),canvas=get(id+"-canvas");
    let drawZoom, frame=0, progress=1;
    const redraw=()=>{
      if(details.open)paint(canvas,pen=>draw(pen,progress));
      if(dialog.open&&zoomUpdate&&zoomUpdate===drawZoom)drawZoom();
    };
    const stop=()=>{cancelAnimationFrame(frame);progress=1;redraw();};
    details.addEventListener("toggle",()=>{if(details.open)redraw();else stop();});
    if("ResizeObserver" in window)new ResizeObserver(redraw).observe(canvas);
    window.addEventListener("resize",redraw,{passive:true});
    click(id+"-zoom",()=>{
      const el=document.createElement("canvas");
      el.setAttribute("role","img");el.setAttribute("aria-label",canvas.getAttribute("aria-label"));
      el.setAttribute("aria-describedby",id+"-status");el.style.aspectRatio="600 / 370";
      drawZoom=()=>paint(el,pen=>draw(pen,progress));zoom(el,drawZoom);
    });
    canvas.closest(".integer-live").hidden=false;
    return {canvas,redraw,stop,animate(){
      cancelAnimationFrame(frame);
      if(reduced.matches){progress=1;redraw();return;}
      const start=performance.now();
      const tick=now=>{
        const rect=details.getBoundingClientRect();
        if(!details.open||rect.bottom<0||rect.top>innerHeight){progress=1;redraw();return;}
        progress=Math.min(1,(now-start)/820);redraw();
        if(progress<1)frame=requestAnimationFrame(tick);
      };
      progress=0;redraw();frame=requestAnimationFrame(tick);
    }};
  }

  function axis(start,end){
    const rawMin=Math.min(-5,start,end), rawMax=Math.max(5,start,end);
    const span=rawMax-rawMin;
    const tickStep=span>40?5:span>24?4:span>16?2:1;
    const low=Math.floor((rawMin-1)/tickStep)*tickStep, high=Math.ceil((rawMax+1)/tickStep)*tickStep;
    return {low,high,tickStep,x:n=>48+504*(n-low)/(high-low)};
  }
  const moveLength=()=>value("line-op")==="+"?number("line-b"):-number("line-b");
  let moved=false;
  const line=surface("line",(draw,t)=>{
    if(!valid("line-start","line-b")){draw.text("Enter whole numbers from −20 to 20.",300,170);say("line","Enter valid integers.");return;}
    const a=number("line-start"),b=number("line-b"),step=moveLength(),end=a+step;
    const {x,low,high,tickStep}=axis(a,end);
    draw.arrow(x(0),210,568,210,hue.ink);draw.arrow(x(0),210,32,210,hue.ink);
    for(let n=low;n<=high;n+=tickStep){
      draw.line(x(n),199,x(n),221,tint(n),2);draw.text(fmt(n),x(n),245,tint(n),18);
    }
    draw.dot(x(a),210,7,hue.teal);
    draw.text("Start "+fmt(a),300,300,hue.teal,23);
    if(moved){
      const now=a+t*step;
      if(step){draw.line(x(a),134,x(a),195,hue.grey,1);draw.arrow(x(a),134,x(now),134,tint(step));draw.line(x(now),134,x(now),195,hue.grey,1);}
      draw.dot(x(now),210,7,hue.purple);
      draw.text(fmt(a)+" "+value("line-op")+" "+operand(b)+" = "+fmt(end),300,62,hue.purple,27);
      say("line",fmt(a)+" "+value("line-op")+" "+operand(b)+" = "+fmt(end)+". "+(step?"Move "+Math.abs(step)+(step>0?" units right.":" units left."):"Stay at the same integer."));
    }else say("line","Start at "+fmt(a)+". "+(step?"The operation calls for "+Math.abs(step)+(step>0?" units right.":" units left."):"There is no movement."));
  });
  for(const id of ["line-start","line-b","line-op"])on(id,"input",()=>{moved=false;line.stop();});
  click("line-go",()=>{moved=true;line.animate();});
  click("line-reset",()=>{get("line-start").value=-4;get("line-b").value=7;get("line-op").value="+";moved=false;line.stop();});
  line.canvas.addEventListener("click",event=>{
    if(!valid("line-start","line-b"))return;
    const a=number("line-start"),{low,high}=axis(a,a+moveLength());
    const box=line.canvas.getBoundingClientRect(), x=(event.clientX-box.left)*600/box.width;
    get("line-start").value=Math.max(-20,Math.min(20,Math.round(low+(high-low)*(x-48)/504)));
    moved=false;line.stop();
  });

  let positives=7,negatives=5,counterMessage="Add, remove or cancel counters to explore the net value.",challenge=false;
  const counters=surface("counters",draw=>{
    for(const [total,y,sign,col,label] of [[positives,115,"+",hue.blue,"Positive counters"],[negatives,242,"−",hue.red,"Negative counters"]]){
      draw.text(label+" · "+total,300,y-75,col,22);
      const cols=Math.min(12,Math.max(1,total)), radius=total>10?15:19;
      const gap=total>10?39:46;
      for(let i=0;i<total;i++){
        const count=Math.min(cols,total-Math.floor(i/cols)*cols);
        const x=300+(i%cols-(count-1)/2)*gap, at=y+Math.floor(i/cols)*35;
        draw.dot(x,at,radius,col);draw.text(sign,x,at,"#fff",23);
      }
    }
    draw.text("Net value "+fmt(positives-negatives),300,337,tint(positives-negatives),23);
    say("counters",positives+" positives and "+negatives+" negatives give "+fmt(positives-negatives)+". "+counterMessage);
  });
  function adjust(dp,dn,text){
    if(positives+dp<0||negatives+dn<0){counterMessage="That counter is absent. Add a zero pair if you need to remove a counter without changing the starting value.";counters.redraw();return;}
    if(positives+dp>24||negatives+dn>24){counterMessage="The board holds up to 24 of each sign.";counters.redraw();return;}
    positives+=dp;negatives+=dn;counterMessage=text;
    if(challenge&&positives===5&&negatives===0){counterMessage="Challenge complete. 2 − (−3) = 5.";challenge=false;}
    counters.redraw();
  }
  for(const [id,p,n,t] of [
    ["plus",1,0,"Adding a positive raises the net value by one."],["minus",0,1,"Adding a negative lowers the net value by one."],
    ["sub-plus",-1,0,"Removing a positive lowers the net value by one."],["sub-minus",0,-1,"Removing a negative raises the net value by one."],
    ["zero",1,1,"One positive and one negative add to zero."]
  ])click("counter-"+id,()=>adjust(p,n,t));
  click("counter-cancel",()=>{const count=Math.min(positives,negatives);adjust(-count,-count,count+" zero pairs cancelled. The net value stayed the same.");});
  click("counter-challenge",()=>{positives=2;negatives=0;challenge=true;counterMessage="Start at 2. Add three zero pairs, then remove three negative counters.";counters.redraw();});
  click("counter-reset",()=>{positives=7;negatives=5;challenge=false;counterMessage="Try cancelling zero pairs.";counters.redraw();});

  let hiddenFactor=-2,patternMessage="",revealed=false;
  const pattern=surface("pattern",(draw,t)=>{
    if(!valid("pattern-factor")){draw.text("Enter a fixed factor from −12 to 12.",300,169);say("pattern","Enter a valid fixed factor.");return;}
    const fixed=number("pattern-factor");
    draw.text("Multiplier     ×     Fixed factor     =     Product",300,34,hue.ink,21);
    for(let i=0;i<7;i++){
      const multiplier=3-i,y=74+i*41, result=multiplier*fixed;
      draw.box(61,y-17,478,33,multiplier===hiddenFactor?"#e7dcf8":i%2?"#edf2fa":"#f8fafc",null);
      draw.text(fmt(multiplier),131,y,tint(multiplier),23);
      draw.text("×",215,y,hue.grey,18);
      draw.text(operand(fixed),300,y,tint(fixed),23);
      draw.text("=",377,y,hue.grey,18);
      const text=(multiplier===hiddenFactor&&!revealed)||i+1>7*t+.001?"?":fmt(result);
      draw.text(text,457,y,tint(result),23);
    }
    say("pattern","Find "+operand(hiddenFactor)+" × "+operand(fixed)+". Moving down one row changes the product by "+fmt(-fixed)+". "+patternMessage);
  });
  on("pattern-factor","input",()=>{patternMessage="";revealed=false;pattern.stop();});
  click("pattern-next",()=>{hiddenFactor=hiddenFactor<=-3?3:hiddenFactor-1;patternMessage="";revealed=false;get("pattern-answer").value="";pattern.stop();});
  click("pattern-check",()=>{
    if(!valid("pattern-factor","pattern-answer")){say("pattern","Enter both a valid factor and an integer answer.");return;}
    const result=number("pattern-factor")*hiddenFactor;
    revealed=true;patternMessage=(number("pattern-answer")===result?"Correct. ":"Review this. ")+"The hidden product is "+fmt(result)+".";
    pattern.stop();
  });
  click("pattern-play",()=>pattern.animate());

  function sample(level,forSign=false){
    const bound=level==="advanced"?12:level==="mixed"?9:5;
    const a=rand(-bound,bound),b=rand(-bound,bound),c=rand(-bound,bound);
    const kind=forSign?pick(level==="advanced"?["mul","div","chain","zero"]:level==="mixed"?["mul","div","zero"]:["mul","zero"]):
      pick(level==="advanced"?["add","sub","mul","div","rational","chain","mixed"]:level==="mixed"?["add","sub","mul","div"]:["add","sub","mul"]);
    switch(kind){
      case "add":return operand(a)+" + "+operand(b);
      case "sub":return operand(a)+" − "+operand(b);
      case "mul":return operand(a)+" × "+operand(b);
      case "div":return operand(a*(b||2))+" ÷ "+operand(b||2);
      case "rational":return operand(a||3)+" ÷ "+operand(b||2);
      case "chain":return operand(a)+" × "+operand(b)+" × "+operand(c);
      case "zero":return operand(a)+" × 0"+(level==="advanced"?" × "+operand(c):"");
      default:return operand(a)+" + ["+operand(b)+" × "+operand(c)+"]";
    }
  }
  let signExpression="(−6) × (−4)";
  const nextSign=()=>{signExpression=sample(value("sign-level"),true);prompt("sign",signExpression);say("sign","");};
  prompt("sign",signExpression);
  click("sign-next",nextSign);on("sign-level","change",nextSign);
  click("sign-check",()=>{
    const outcome=M.evaluate(signExpression).result;
    const answer=outcome.n===0n?"Zero":outcome.n<0n?"Negative":"Positive";
    const reason=outcome.n===0n?(signExpression.includes("÷")?"The dividend is zero and the divisor is nonzero.":"A zero factor makes the product zero."):
      signExpression.includes("÷")?"Same signs give a positive quotient and different signs give a negative quotient.":
        "A nonzero product is positive for an even number of negative factors and negative for an odd number.";
    say("sign",(value("sign-answer")===answer?"Correct. ":"Review this. ")+answer+". "+reason+" Value: "+M.text(outcome)+".");
  });

  function calc(){
    try{
      const result=M.evaluate(value("calc-expression"));
      const ol=document.createElement("ol");
      for(const step of result.steps){const item=document.createElement("li");item.textContent=step;ol.append(item);}
      const answer=document.createElement("p");answer.className="integer-answer";answer.textContent="Answer. "+result.answer;
      feedback("calc").replaceChildren(ol,answer);
    }catch(error){say("calc",error.message);}
  }
  click("calc-go",calc);on("calc-expression","keydown",e=>{if(e.key==="Enter")calc();});

  function vertical(draw,tag,start,end,current,middle=null){
    const lo=Math.min(-2,start,end,middle??0)-1,hi=Math.max(2,start,end,middle??0)+1;
    const axis=n=>282-220*(n-lo)/(hi-lo);
    const gap=hi-lo>34?5:hi-lo>15?2:1;
    draw.text(tag==="temp"?"Temperature":"Building floors",300,35,hue.ink,24);
    draw.box(188,axis(hi)-8,43,axis(lo)-axis(hi)+16,"#e5edf7");
    if(tag==="temp"){
      draw.line(211,axis(lo),211,axis(current),tint(current),13);
      draw.dot(211,axis(lo),12,tint(current));
    }else{
      for(let n=lo;n<=hi;n++)draw.line(188,axis(n),231,axis(n),hue.grey,1);
      draw.box(190,axis(current)-8,39,16,"#557ed3");
    }
    draw.line(266,axis(lo),266,axis(hi),hue.ink,3);
    for(let n=Math.ceil(lo/gap)*gap;n<=hi;n+=gap){
      draw.line(260,axis(n),274,axis(n),tint(n),2);draw.text(fmt(n),297,axis(n),tint(n),18);
    }
    if(start!==current)draw.arrow(343,axis(start),343,axis(current),hue.purple);
    draw.text("Start "+fmt(start),431,114,hue.teal,22);
    if(middle!==null)draw.text("First stop "+fmt(middle),431,166,hue.blue,22);
    draw.text("End "+fmt(end),431,215,tint(end),22);
  }
  const model=(id,inputIds,calc,bounds,next)=>{
    let moving=false;
    const view=surface(id,(draw,t)=>{
      if(!valid(...inputIds)){draw.text("Enter whole numbers within the field limits.",300,173);say(id,"Check the input ranges.");return;}
      const {start,middle,end,expression}=calc(inputIds.map(number));
      if(bounds&&[start,middle,end].some(n=>n<bounds[0]||n>bounds[1])){
        draw.text("That route leaves the building.",300,173,hue.red);say(id,"Each stop must be between floors "+bounds[0]+" and "+bounds[1]+".");return;
      }
      const landing=middle===null?start+(end-start)*t:t<.5?start+(middle-start)*2*t:middle+(end-middle)*(2*t-1);
      vertical(draw,id,start,moving?end:start,moving?landing:start,moving?middle:null);
      const guess=number(id+"-answer");
      say(id,moving?(Number.isFinite(guess)?(guess===end?"Correct prediction. ":"Review your prediction. "):"")+expression:"Starting "+(id==="temp"?"temperature ":"floor ")+fmt(start)+". Predict the end, then run the model.");
    });
    for(const field of inputIds)on(field,"input",()=>{moving=false;view.stop();});
    click(id+"-go",()=>{moving=true;view.animate();});
    click(id+"-next",()=>{next().forEach((v,i)=>{get(inputIds[i]).value=v;});get(id+"-answer").value="";moving=false;view.stop();});
  };
  model("temp",["temp-start","temp-change"],([start,change])=>({start,middle:null,end:start+change,expression:fmt(start)+" + "+operand(change)+" = "+fmt(start+change)+" °C."}),null,()=>[rand(-14,14),rand(-12,12)]);
  model("lift",["lift-start","lift-a","lift-b"],([start,a,b])=>({start,middle:start+a,end:start+a+b,expression:fmt(start)+" + "+operand(a)+" = "+fmt(start+a)+", then "+fmt(start+a)+" + "+operand(b)+" = "+fmt(start+a+b)+". Final floor "+fmt(start+a+b)+"."}),[-5,10],()=>{
    const start=rand(-2,5);
    const move=floor=>rand(Math.max(-6,-5-floor),Math.min(6,10-floor));
    const first=move(start);
    return [start,first,move(start+first)];
  });

  let balanceMoves=[];
  const bank=surface("bank",draw=>{
    if(!valid("bank-start")){draw.text("Check the opening balance.",300,171);say("bank","Enter an opening integer from −999 to 999.");return;}
    const opening=number("bank-start");
    let total=opening;
    const log=balanceMoves.map(delta=>{const line=fmt(total)+" + "+operand(delta)+" = "+fmt(total+delta);total+=delta;return line;});
    draw.text("Opening balance · "+fmt(opening)+" rupees",300,70,tint(opening),25);
    const max=Math.max(1,Math.abs(opening),Math.abs(total));
    draw.line(63,179,537,179,hue.ink,2);draw.line(300,147,300,208,hue.ink,3);
    const x=300+total/max*202;
    draw.arrow(300,179,x,179,tint(total));draw.dot(x,179,7,tint(total));
    draw.text("0",300,230,hue.grey,20);
    draw.text("Current balance · "+fmt(total)+" rupees",300,299,tint(total),25);
    say("bank",(log.length?log.slice(-6).join(". ")+". ":"")+"Balance is "+fmt(total)+" rupees"+(total<0?", an overdraft.":"."));
  });
  function transaction(sign){
    if(!valid("bank-start","bank-amount")){say("bank","Enter a positive transaction amount from 1 to 999 and a valid opening balance.");return;}
    if(balanceMoves.length>=20){say("bank","This session holds up to 20 entries. Undo an entry or reset the account.");return;}
    balanceMoves.push(sign*number("bank-amount"));bank.redraw();
  }
  click("bank-deposit",()=>transaction(1));click("bank-withdraw",()=>transaction(-1));
  click("bank-undo",()=>{balanceMoves.pop();bank.redraw();});
  click("bank-reset",()=>{balanceMoves=[];get("bank-start").value=40;get("bank-amount").value=65;bank.redraw();});
  on("bank-start","input",()=>{balanceMoves=[];bank.redraw();});

  function properties(){
    if(!valid("props-a","props-b","props-c")){say("props","Enter three integers from −40 to 40.");return;}
    const [a,b,c]=["props-a","props-b","props-c"].map(id=>operand(number(id)));
    const show=e=>{try{return M.evaluate(e).answer;}catch{return "undefined";}};
    const compare=(first,second)=>first+" = "+show(first)+"; "+second+" = "+show(second)+".";
    let rows;
    if(value("props-mode")==="dist") rows=[
      compare(a+" × ("+b+" + "+c+")","("+a+" × "+b+") + ("+a+" × "+c+")"),
      compare(a+" × ("+b+" − "+c+")","("+a+" × "+b+") − ("+a+" × "+c+")"),
      "Distributivity works for both sums and differences."
    ];
    else{
      const comm=value("props-mode")==="comm";
      rows=["+","−","×","÷"].map(op=>compare(comm?a+" "+op+" "+b:"("+a+" "+op+" "+b+") "+op+" "+c,comm?b+" "+op+" "+a:a+" "+op+" ("+b+" "+op+" "+c+")"));
      rows.push("Addition and multiplication always preserve the result here. For subtraction and division one matching example is not proof of a general property.");
    }
    const ul=document.createElement("ul");
    for(const row of rows){const li=document.createElement("li");li.textContent=row;ul.append(li);}
    feedback("props").replaceChildren(ul);
  }
  click("props-go",properties);

  const storageKey="vyasa-class7-integer-arena-v1";
  let best=0;
  try{const saved=Number(localStorage.getItem(storageKey));if(Number.isSafeInteger(saved)&&saved>=0)best=saved;}catch{/* Storage may be disabled. */}
  let arena=null,interval=0;
  function statistics(){
    const a=arena;
    const remaining=a?.deadline?Math.max(0,Math.ceil((a.deadline-Date.now())/1000)):null;
    const percent=a?.count?Math.round(100*a.correct/a.count):0;
    get("arena-value").textContent=(remaining!==null?"Time "+remaining+" s. ":"")+"Score "+(a?.score||0)+" · Streak "+(a?.streak||0)+" · Accuracy "+percent+"% · Best score "+best+".";
  }
  function finish(message){
    if(!arena)return;
    arena.live=false;clearInterval(interval);say("arena",message);
    for(const id of ["arena-check","arena-next"])get(id).disabled=true;
    statistics();
  }
  function freshQuestion(){
    if(!arena?.live)return;
    arena.expression=sample(arena.level);arena.answered=false;
    prompt("arena",arena.expression);get("arena-answer").value="";
    say("arena","");get("arena-check").disabled=false;get("arena-next").disabled=true;
  }
  click("arena-start",()=>{
    clearInterval(interval);
    const seconds=Number(value("arena-timing"));
    arena={level:value("arena-level"),deadline:seconds?Date.now()+seconds*1000:0,live:true,score:0,count:0,correct:0,streak:0};
    freshQuestion();statistics();
    if(seconds)interval=setInterval(()=>{
      if(Date.now()>=arena.deadline)finish("Time is up. Start a new round to practise again.");
      else statistics();
    },250);
  });
  function submit(){
    if(!arena?.live||arena.answered)return;
    if(arena.deadline&&Date.now()>=arena.deadline){finish("Time is up.");return;}
    const entry=M.answer(value("arena-answer"));
    if(!entry){say("arena","Enter an integer or an exact fraction with a nonzero denominator.");return;}
    const worked=M.evaluate(arena.expression);
    const correct=M.equal(entry,worked.result);
    arena.answered=true;arena.count++;
    if(correct){
      arena.correct++;arena.streak++;
      arena.score+=10+(arena.streak%3===0?5:0);
      if(arena.score>best){best=arena.score;try{localStorage.setItem(storageKey,String(best));}catch{/* Current session remains active. */}}
    }else arena.streak=0;
    say("arena",(correct?"Correct. ":"Review this. ")+"Answer: "+worked.answer+". "+worked.steps.filter(s=>!s.startsWith("Complete the group")).join(" "));
    get("arena-check").disabled=true;get("arena-next").disabled=false;statistics();
  }
  click("arena-check",submit);click("arena-next",freshQuestion);
  click("arena-stop",()=>finish("Round ended."));
  on("arena-answer","keydown",event=>{if(event.key==="Enter"){if(arena?.answered)freshQuestion();else submit();}});
  get("arena-check").disabled=true;get("arena-next").disabled=true;statistics();

  const mistakes=[
    ["order","A student writes −9 > −3 because 9 is greater than 3.","Compare positions. −9 lies left of −3, so −9 < −3."],
    ["opp","A student writes 8 − (−3) = 5.","Subtract by adding the opposite. 8 + 3 = 11."],
    ["product","A student writes (−3) × (−4) = −12.","Two negative factors give a positive result. The product is 12."],
    ["zero","A student writes 8 ÷ 0 = 0.","The divisor is zero. No number multiplied by zero gives 8."],
    ["left","A student writes 24 ÷ 6 × 2 = 24 ÷ 12.","Work from left to right. 24 ÷ 6 = 4, then 4 × 2 = 8."]
  ];
  let mistake=0;
  prompt("error",mistakes[0][1]);
  click("error-next",()=>{mistake=(mistake+1)%mistakes.length;prompt("error",mistakes[mistake][1]);say("error","");});
  click("error-check",()=>say("error",(value("error-answer")===mistakes[mistake][0]?"Correct. ":"Review this. ")+mistakes[mistake][2]));
  for(const id of ["calc","sign","props","arena","error"]) get("tool-"+id).querySelector(".integer-live").hidden=false;
})();
