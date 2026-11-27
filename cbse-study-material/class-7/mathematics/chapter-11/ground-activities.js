(() => {
  "use strict";
  const M=window.CommonGroundMath;
  if(!M)return;
  const $=id=>document.getElementById(id);
  const value=id=>$(id).value;
  const n=id=>$(id).valueAsNumber;
  const on=(id,event,fn)=>$(id).addEventListener(event,fn);
  const click=(id,fn)=>on(id,"click",fn);
  const valid=(...ids)=>ids.every(id=>$(id).checkValidity()&&Number.isSafeInteger(n(id)));
  const intAnswer=id=>/^\d+$/.test(value(id).trim())?Number(value(id)):NaN;
  const rand=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
  const pick=a=>a[rand(0,a.length-1)];
  const feedback=id=>$(id+"-status");
  const say=(id,text)=>{if(feedback(id).textContent!==text)feedback(id).textContent=text;};
  const setPrompt=(id,text)=>{$(id+"-prompt").textContent=text;};
  const numbers=(id,third=false)=>{
    const ids=[id+"-a",id+"-b",...(third?[id+"-c"]:[])];
    return valid(...ids)?ids.map(n).filter(Boolean):null;
  };
  const good="#126443",blue="#2358a7",purple="#6f40a7",teal="#08776d",red="#9f2e43",ink="#1b2e4e",wash="#f8fafc";
  const cols={2:blue,3:purple,5:teal,7:"#994f1e",11:red};
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
  const key="vyasa-class7-common-ground-v1";
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
    function chip(v,x,y,colour=cols[v]||ink,size=20){dot(x,y,size,colour);text(v,x,y,"white",size);}
    function ellipse(x,y,rx,ry,c,stroke){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=c;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=3;ctx.stroke();}
    return {line,text,box,dot,chip,ellipse};
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
  const warn=(draw,id)=>{draw.text("Enter positive whole numbers within the limits.",300,185,red);say(id,"Check the input ranges.");};
  const bind=(ids,fn)=>ids.forEach(id=>on(id,"input",fn));

  let factorIndex=0,factorFeedback="";
  const factorView=surface("factor",(draw,t)=>{
    if(!valid("factor-n"))return warn(draw,"factor");
    const x=n("factor-n"),list=M.factors(x),pairs=list.filter(d=>d*d<=x),rows=pairs[factorIndex%pairs.length],cols=x/rows;
    const unit=Math.min(34,490/cols,210/rows);
    for(let i=0;i<Math.ceil(t*x);i++){
      draw.dot(300+(i%cols-(cols-1)/2)*unit,67+(Math.floor(i/cols)+.5)*unit,Math.max(.8,unit*.35),Math.floor(i/cols)%2?teal:blue);
    }
    draw.text(rows+" × "+cols+" = "+x,300,42,blue,27);
    draw.text("Pair "+(factorIndex%pairs.length+1)+" of "+pairs.length,300,330,ink,23);
    const kind=x===1?"neither prime nor composite":M.isPrime(x)?"prime":"composite";
    say("factor",x+" is "+kind+". Its "+list.length+" factors are "+list.join(", ")+". "+factorFeedback);
  });
  on("factor-n","input",()=>{factorIndex=0;factorFeedback="";factorView.stop();});
  click("factor-next",()=>{factorIndex++;factorView.animate();});
  let countTarget=null;
  click("factor-challenge",()=>{
    countTarget=pick([18,28,36,45,64,72,81]);
    setPrompt("factor","How many positive factors does "+countTarget+" have? Try listing pairs before setting that number in the explorer.");
    $("factor-answer").value="";factorFeedback="";factorView.redraw();
  });
  click("factor-check",()=>{
    if(countTarget===null){say("factor","Start a guided challenge first.");return;}
    const answer=M.factors(countTarget);
    factorFeedback=(intAnswer("factor-answer")===answer.length?"Correct. ":"Review this. ")+countTarget+" has "+answer.length+" factors: "+answer.join(", ")+".";
    factorView.redraw();
  });

  let treeRoot,treeNodes,treeFeedback="";
  function resetTree(){
    treeRoot=valid("tree-n")?{number:n("tree-n"),children:[]}:null;
    treeFeedback="";treeNodes=[];
    if(treeRoot)treeNodes.push(treeRoot);
    syncTree();
  }
  function syncTree(){
    const select=$("tree-node");
    const old=select.value;
    const available=treeNodes.flatMap((leaf,index)=>!leaf.children.length&&!M.isPrime(leaf.number)?[[index,leaf]]:[]);
    const names=available.map(([index,leaf])=>new Option(String(leaf.number)+" (node "+(index+1)+")",String(index)));
    select.replaceChildren(...names);
    if(names.some(x=>x.value===old))select.value=old;
    $("tree-split").disabled=!names.length;
  }
  const treeView=surface("tree",(draw,t)=>{
    if(!treeRoot)return warn(draw,"tree");
    const depth=node=>node.children.length?1+Math.max(...node.children.map(depth)):0;
    const step=Math.min(82,245/Math.max(1,depth(treeRoot)));
    const nodes=[],links=[];
    let leafIndex=0;
    const leafCount=node=>node.children.length?node.children.reduce((a,c)=>a+leafCount(c),0):1;
    const count=leafCount(treeRoot);
    function layout(node,height){
      const children=node.children.map(c=>layout(c,height+1));
      const x=children.length?(children[0][0]+children[1][0])/2:58+(leafIndex+++.5)*484/count;
      const y=49+step*height;
      for(const c of children)links.push([[x,y],c]);
      nodes.push({x,y,node});
      return [x,y];
    }
    layout(treeRoot,0);
    const order=new Map(treeNodes.map((v,i)=>[v,i]));
    const show=Math.max(1,Math.ceil(t*treeNodes.length));
    for(const [a,b] of links){
      const node=nodes.find(x=>x.x===b[0]&&x.y===b[1])?.node;
      if(order.get(node)<show) draw.line(a,b,"#8494ab",2);
    }
    for(const {x,y,node} of nodes)if(order.get(node)<show)draw.chip(node.number,x,y,M.isPrime(node.number)?good:blue,Math.min(24,step*.4));
    const leaves=treeNodes.filter(x=>!x.children.length);
    const done=leaves.every(x=>M.isPrime(x.number));
    draw.text(done?"Prime factorisation: "+M.format(leaves.map(x=>x.number).sort((a,b)=>a-b)):"Green nodes are prime",300,337,good,22);
    say("tree",treeFeedback||(done?"All leaves are prime: "+M.format(M.primeFactors(treeRoot.number))+".":"Choose a composite leaf and a proper factor. Valid child values multiply to the parent."));
  });
  resetTree();
  function split(node,f){
    node.children=[{number:f,children:[]},{number:node.number/f,children:[]}];
    treeNodes.push(...node.children);
  }
  click("tree-split",()=>{
    const node=treeNodes[Number(value("tree-node"))], f=n("tree-factor");
    if(!node || node.children.length || !valid("tree-factor") || f>=node.number || node.number%f){
      treeFeedback="Choose a divisor greater than 1 and smaller than the selected composite number.";treeView.redraw();return;
    }
    split(node,f);treeFeedback=node.number+" = "+node.children.map(x=>x.number).join(" × ")+".";
    if(treeNodes.filter(x=>!x.children.length).every(x=>M.isPrime(x.number)))treeFeedback+=" Prime factorisation: "+M.format(M.primeFactors(treeRoot.number))+".";
    syncTree();treeView.animate();
  });
  click("tree-hint",()=>{
    const node=treeNodes[Number(value("tree-node"))];
    treeFeedback=node&&value("tree-node")!==""?"Try "+M.factors(node.number)[1]+" as a factor of "+node.number+".":"There are no composite leaves left.";
    treeView.redraw();
  });
  click("tree-solve",()=>{
    if(!treeRoot)return;
    const complete=node=>{
      if(M.isPrime(node.number))return;
      if(!node.children.length)split(node,M.factors(node.number)[1]);
      node.children.forEach(complete);
    };
    complete(treeRoot);treeFeedback="Every leaf is prime. "+treeRoot.number+" = "+M.format(M.primeFactors(treeRoot.number))+".";
    syncTree();treeView.animate(1200);
  });
  for(const event of ["input","reset"]){
    const action=()=>{resetTree();treeView.stop();};
    if(event==="input")on("tree-n","input",action);else click("tree-reset",action);
  }

  const venn=surface("venn",(draw,t)=>{
    const values=numbers("venn");if(!values)return warn(draw,"venn");
    const [a,b]=values,af=M.factors(a),bf=M.factors(b),shared=af.filter(x=>bf.includes(x));
    const sets=[af.filter(x=>!bf.includes(x)),shared,bf.filter(x=>!af.includes(x))];
    draw.ellipse(229,178,189,133,"#dbe9fbaf",blue);draw.ellipse(371,178,189,133,"#decdf1a0",purple);
    draw.text("Factors of "+a,140,27,blue,23);draw.text("Factors of "+b,460,27,purple,23);
    for(let i=0;i<sets.length;i++){
      const values=sets[i], cx=[138,300,462][i];
      const columns=values.length>10?3:2;
      values.forEach((number,index)=>{
        const x=cx+(index%columns-(columns-1)/2)*(columns===3?34:42),y=96+Math.floor(index/columns)*34;
        draw.text(number,i===1?x-(1-t)*82:x,y,i===1&&number===shared.at(-1)?teal:ink,19);
      });
    }
    draw.text("HCF "+shared.at(-1),300,330,teal,26);
    say("venn","Factors of "+a+": "+af.join(", ")+". Factors of "+b+": "+bf.join(", ")+". Shared: "+shared.join(", ")+". HCF "+shared.at(-1)+".");
  });
  bind(["venn-a","venn-b"],venn.stop);click("venn-play",()=>venn.animate());

  const hcf=surface("hcf",(draw,t)=>{
    const data=numbers("hcf",true);if(!data)return warn(draw,"hcf");
    const powers=M.exponents(data), choose=value("hcf-mode"), h=M.hcf(data), l=M.least(data);
    let rendered=0;
    for(const [i,num] of data.entries()){
      const row=M.primeFactors(num),y=93+i*62;
      draw.text(num+" =",77,y,ink,21);
      row.forEach((p,j)=>draw.chip(p,157+j*46,y,cols[p]||blue,17));
    }
    const selected=powers.flatMap(p=>Array(p[choose]).fill(p.prime));
    draw.text(choose==="min"?"Minimum copies for HCF":"Maximum copies for LCM",300,278,purple,24);
    for(const prime of selected){
      rendered++;
      if(rendered>Math.ceil(t*selected.length)||rendered>12)break;
      draw.chip(prime,48+(rendered-.5)*42,329,cols[prime]||teal,17);
    }
    if(!selected.length)draw.text("No shared primes · HCF 1",300,325,teal);
    say("hcf",data.map(v=>v+" = "+M.format(M.primeFactors(v))).join(". ") + ". "+(choose==="min"?"Minimum":"Maximum")+" copies: "+M.format(selected)+". HCF "+h+"; LCM "+l+".");
  });
  bind(["hcf-a","hcf-b","hcf-c","hcf-mode"],hcf.stop);click("hcf-play",()=>hcf.animate());

  function timeline(id,withThird,kind){
    let prediction="";
    const view=surface(id,(draw,t)=>{
      const values=numbers(id,withThird);
      if(!values)return warn(draw,id);
      const common=M.least(values), span=kind==="multiples"?common*2:common;
      const x=k=>84+k*468/span;
      const p=span*t;
      values.forEach((v,i)=>{
        const y=104+i*89,c=[blue,purple,teal][i];
        draw.line([x(0),y],[x(span),y],ink,2);
        draw.text(v,43,y,c,25);
        const mark=span/v>36?Math.ceil(span/v/28):1;
        const labelEvery=Math.max(1,Math.ceil(span/v/8));
        for(let j=0;j*v<=p+.001;j+=mark){
          const k=j*v;
          draw.dot(x(k),y,5,k&&k%common===0?teal:c);
          if((j%labelEvery===0||k%common===0)&&k<common)draw.text(k,x(k),y+24,c,15);
        }
        for(let k=common;k<=span;k+=common)if(k<=p+.001)draw.dot(x(k),y,8,teal);
        if(kind!=="multiples"){
          const time=Math.round(p), active=time%v===0;
          if(kind==="traffic"){
            draw.box(23,y-42,40,23,"#233550");
            draw.dot(37,y-30,7,active?"#647286":red);
            draw.dot(52,y-30,7,active?good:"#647286");
          }else{
            draw.ellipse(42,y-33,14,10,active?"#f6c84f":"#e6e3db",c);
            draw.dot(42,y-20,4,c);
          }
        }
      });
      for(let k=common;k<=span;k+=common){
        const XX=x(k);
        draw.line([XX,71],[XX,values.length===3?302:222],teal,2);
        draw.text(k,XX,53,teal,20);
      }
      draw.text("First positive meeting: "+common,300,337,teal,23);
      say(id,"Intervals: "+values.join(", ")+". LCM "+common+". "+values.map(v=>common+" ÷ "+v+" = "+common/v).join("; ")+". "+prediction);
    });
    bind([id+"-a",id+"-b",...(withThird?[id+"-c"]:[])],()=>{prediction="";view.stop();});
    let audio=null;
    function playBell(){
      if(!audio||!$("bells-sound").checked)return;
      [660,880].forEach((pitch,i)=>{
        const voice=audio.createOscillator(),gain=audio.createGain(),time=audio.currentTime;
        voice.frequency.value=pitch;gain.gain.setValueAtTime(.105,time);gain.gain.exponentialRampToValueAtTime(.001,time+.32);
        voice.connect(gain).connect(audio.destination);voice.start(time+i*.04);voice.stop(time+.34+i*.04);
      });
    }
    click(id+"-play",()=>{
      if(kind==="bells"&&$("bells-sound").checked){
        const Context=window.AudioContext||window.webkitAudioContext;
        if(Context){audio??=new Context();audio.resume().catch(()=>{});}
      }
      view.animate(1570,kind==="bells"?playBell:null);
    });
    if(kind==="multiples")click("multiple-reset",()=>{$("multiple-a").value=4;$("multiple-b").value=6;view.stop();});
    if(kind==="traffic")click("traffic-check",()=>{
      const values=numbers(id);if(!values)return;
      const answer=M.least(values);
      prediction=(intAnswer("traffic-answer")===answer?"Correct. ":"Review this. ")+"Both become green together at "+answer+" seconds because each cycle fits a whole number of times.";
      view.redraw();
    });
  }
  timeline("multiple",false,"multiples");
  timeline("bells",true,"bells");
  timeline("traffic",false,"traffic");

  let divisor=9,digitFeedback="";
  const digits=surface("digits",(draw,t)=>{
    if(!valid("digits-n"))return warn(draw,"digits");
    const num=n("digits-n"),chars=Array.from(String(num),Number),sentence=M.divisibility(num);
    const visible=Math.ceil(t*chars.length);
    chars.forEach((a,i)=>draw.chip(a,300+(i-(chars.length-1)/2)*64,115,i>=chars.length-3?blue:purple,27));
    draw.text("Digit sum: "+chars.slice(0,visible).join(" + ")+" = "+chars.slice(0,visible).reduce((s,d)=>s+d,0),300,177,ink,23);
    draw.text("Last three digits: "+String(num).slice(-3),300,222,blue,22);
    const found=sentence.filter(row=>row[1]).map(row=>row[0]);
    draw.text("Passes: "+(found.join(", ")||"none of the listed divisors"),300,279,teal,23);
    if(t<1)return;
    feedback("digits").replaceChildren();
    if(digitFeedback){
      const message=document.createElement("p");message.textContent=digitFeedback;feedback("digits").append(message);
    }
    const items=document.createElement("ul");
    sentence.forEach(([d,pass,why])=>{const li=document.createElement("li");li.textContent=d+" · "+(pass?"Pass. ":"Does not pass. ")+why;items.append(li);});
    feedback("digits").append(items);
  });
  setPrompt("digits","Does 9 divide the number exactly?");
  on("digits-n","input",()=>{digitFeedback="";digits.stop();});
  click("digits-play",()=>digits.animate());
  click("digits-next",()=>{
    divisor=pick([2,3,4,5,6,8,9,10,11]);
    $("digits-n").value=rand(22,99999);digitFeedback="";
    setPrompt("digits","Does "+divisor+" divide the number exactly?");digits.stop();
  });
  click("digits-check",()=>{
    if(!valid("digits-n"))return;
    const [,pass,why]=M.divisibility(n("digits-n")).find(row=>row[0]===divisor);
    digitFeedback=(value("digits-choice")===(pass?"yes":"no")?"Correct. ":"Review this. ")+why;
    digits.stop();
  });

  const sieves=[2,3,5,7];
  let sieveAt=0,crossed=new Set(),sieveStart=0,sieveFeedback="Keep the first uncrossed prime, 2.";
  const primes=surface("primes",draw=>{
    for(let i=1;i<=100;i++){
      const x=67+(i-1)%10*52,y=53+Math.floor((i-1)/10)*29;
      const kept=sieves.slice(0,sieveAt).includes(i)||(sieveAt===4&&!crossed.has(i)&&i!==1);
      draw.box(x-20,y-12,40,24,kept?blue:crossed.has(i)?"#eedce6":"#e7eef8",null);
      draw.text(i,x,y,kept?"white":ink,16);
      if(crossed.has(i))draw.line([x-14,y+8],[x+14,y-8],red,1);
    }
    draw.text(sieveAt===4?"25 primes remain":"Cross off larger multiples only",300,345,teal,21);
    say("primes",sieveFeedback);
  });
  click("primes-reset",()=>{sieveAt=0;crossed=new Set();sieveStart=Date.now();$("primes-p").value=2;sieveFeedback="Timer started. Enter 2 for the first pass.";primes.redraw();});
  click("primes-go",()=>{
    if(sieveAt===4)return;
    const p=n("primes-p"),expected=sieves[sieveAt];
    if(p!==expected){sieveFeedback="The first uncrossed prime at this step is "+expected+".";primes.redraw();return;}
    for(let a=p*p;a<=100;a+=p)crossed.add(a);
    sieveAt++;
    sieveFeedback=sieveAt===4?"Complete. The 25 remaining numbers above 1 have no factor at most their square root."+(sieveStart?" Time: "+Math.floor((Date.now()-sieveStart)/1000)+" seconds.":""):
      "Marked composites for "+p+". Find the next uncrossed prime.";
    primes.redraw();
  });

  let dragPoint=null;
  function setGrouping(id,visual){
    const view=surface(id,(draw,t)=>{
      const values=numbers(id);
      if(!values||!valid(id+"-size"))return warn(draw,id);
      const size=n(id+"-size"),total=Math.max(...values),x=82,scale=475/total;
      values.forEach((amount,i)=>{
        const y=112+i*108,full=Math.floor(amount/size),remainder=amount%size;
        draw.text(amount,42,y+17,ink,21);
        draw.box(x,y,amount*scale,33,"#dce6f1",ink);
        for(let part=0;part<Math.ceil(full*t);part++)draw.box(x+part*size*scale,y,size*scale,33,(part+i)%2?"#a4c6fa":"#8fd8cc",ink);
        if(remainder)draw.box(x+full*size*scale,y,remainder*scale,33,"#f3bdc5",red);
        draw.text(full+" "+(visual==="ribbon"?"pieces":"full groups")+" of "+size+" · "+remainder+" left",300,y+61,ink,19);
      });
      const h=M.hcf(values);
      draw.text((visual==="ribbon"?"Longest exact cut":"Greatest exact group")+": "+h,300,332,teal,22);
      if(visual==="group"){
        draw.dot(53,48,12,blue);
        draw.box(183,32,103,32,"#e3f1ef",teal);
        draw.text("Drop here",234,47,teal,15);
        if(dragPoint)draw.dot(dragPoint[0],dragPoint[1],13,purple);
      }
      say(id,values.map(v=>v+" = "+Math.floor(v/size)+" × "+size+" + "+v%size).join(". ")+". HCF "+h+".");
    });
    bind([id+"-a",id+"-b",id+"-size"],view.stop);
    click(id+"-best",()=>{
      const values=numbers(id);if(!values)return;
      $(id+"-size").value=M.hcf(values);view.animate();
    });
    return view;
  }
  const grouping=setGrouping("group","group"),ribbon=setGrouping("ribbon","ribbon");
  click("ribbon-play",()=>ribbon.animate());
  click("group-next",()=>{
    const g=rand(2,6);$("group-a").value=g*rand(3,8);$("group-b").value=g*rand(4,10);$("group-size").value=1;grouping.stop();
  });
  function localPos(canvas,event){
    const box=canvas.getBoundingClientRect();
    return [(event.clientX-box.left)*600/box.width,(event.clientY-box.top)*370/box.height];
  }
  const dragTolerance=()=>Math.max(24,22*600/grouping.canvas.clientWidth);
  grouping.canvas.addEventListener("pointerdown",event=>{
    const [x,y]=localPos(grouping.canvas,event);
    if(Math.hypot(x-53,y-48)>dragTolerance())return;
    dragPoint=[x,y];grouping.canvas.setPointerCapture(event.pointerId);
    grouping.canvas.style.cursor="grabbing";
    grouping.redraw();
  });
  grouping.canvas.addEventListener("pointermove",event=>{
    if(!dragPoint)return;
    dragPoint=localPos(grouping.canvas,event);grouping.redraw();
  });
  grouping.canvas.addEventListener("pointerup",event=>{
    const [x,y]=localPos(grouping.canvas,event);
    const dropped=dragPoint&&x>=176&&x<=296&&Math.abs(y-48)<=dragTolerance()&&valid("group-size");
    dragPoint=null;grouping.canvas.style.cursor="";
    if(dropped){$("group-size").value=Math.min(72,n("group-size")+1);grouping.animate();}
    else grouping.redraw();
  });
  grouping.canvas.addEventListener("lostpointercapture",()=>{dragPoint=null;grouping.canvas.style.cursor="";grouping.redraw();});

  let detective={method:"HCF",answer:6,why:"A piece of 6 cm fits three times into 18 cm and four times into 24 cm.",question:"Find the longest equal piece that can be cut without waste from ribbons of 18 cm and 24 cm."};
  function nextDetective(){
    const level=Number(value("detective-level"));
    const k=rand(2,level*5),a=k*rand(2,5),b=k*rand(4,7),c=k*rand(3,6);
    const set=level===3?[a,b,c]:[a,b];
    const h=rand(0,1)===0,method=h?"HCF":"LCM",answer=h?M.hcf(set):M.least(set);
    const units=set.join(", ");
    detective={method,answer,
      why:h?answer+" divides "+units+", with no larger shared divisor.":answer+" is the first positive time divisible by "+units+".",
      question:h?"Equal-size trays must fit materials of lengths "+units+" cm without leftovers. Find the largest tray length.":
        "Signals start green together and then repeat every "+units+" seconds. Find their first positive common start of green."
    };
    setPrompt("detective",detective.question);say("detective","");
  }
  setPrompt("detective",detective.question);
  click("detective-next",nextDetective);on("detective-level","change",nextDetective);
  click("detective-check",()=>{
    const correct=value("detective-answer")===detective.method&&value("detective-reason")===(detective.method==="HCF"?"divide":"multiple");
    say("detective",(correct?"Correct. ":"Review the structure. ")+detective.method+" = "+detective.answer+". "+detective.why);
  });

  let round=null,timer=0;
  function arenaStats(){
    const r=round;
    const remaining=r?.end?Math.max(0,Math.ceil((r.end-Date.now())/1000)):null;
    const points=r?.points||0,attempts=r?.attempts||0;
    const accuracy=attempts?Math.round(100*r.correct/attempts):0;
    const badge=saved.best>=60?" · Common Ground badge earned":saved.best>=35?" · Factor Finder badge earned":"";
    $("arena-score").textContent=(remaining!==null?"Time "+remaining+" s · ":"")+"Score "+points+" · Streak "+(r?.streak||0)+" · Accuracy "+accuracy+"% · Best "+saved.best+badge;
  }
  function arenaQuestion(){
    const r=round;
    if(!r?.live)return;
    const level=Number(value("arena-level")),a=rand(3,level*13),b=rand(4,level*11),c=rand(3,10);
    const type=pick(level===1?["factors","multiple","divisible"]:level===2?["hcf","lcm","prime","divisible"]:["hcf","lcm","prime","multiple","divisible"]);
    let question,answer,reason,prime=false;
    if(type==="factors"){
      const fs=M.factors(a);
      question="How many positive factors does "+a+" have?";answer=fs.length;reason="Factors: "+fs.join(", ")+".";
    }else if(type==="multiple"){
      question="Find positive multiple number "+c+" of "+a+".";answer=a*c;reason=a+" × "+c+" = "+answer+".";
    }else if(type==="divisible"){
      const div=pick([2,3,4,5,6,8,9,10,11]),number=rand(20,level*300);
      question="Does "+div+" divide "+number+" exactly? Enter 1 for yes or 0 for no.";
      answer=number%div===0?1:0;reason=M.divisibility(number).find(row=>row[0]===div)[2];
    }else if(type==="prime"){
      const x=a*b;answer=M.primeFactors(x);prime=true;question="Write the prime factors of "+x+" with repetitions, separated by spaces.";
      reason="The prime factorisation is "+M.format(answer)+".";
    }else{
      const values=level===3?[a,b,c]:[a,b];
      answer=type==="hcf"?M.hcf(values):M.least(values);
      question="Find the "+type.toUpperCase()+" of "+values.join(", ")+".";
      reason=values.map(x=>x+" = "+M.format(M.primeFactors(x))).join(". ")+". Use "+(type==="hcf"?"minimum":"maximum")+" exponents to get "+answer+".";
    }
    r.q={answer,reason,prime};r.answered=false;
    setPrompt("arena",question);$("arena-answer").value="";say("arena","");
    $("arena-check").disabled=false;$("arena-next").disabled=true;
  }
  function finish(text){
    if(!round)return;
    round.live=false;clearInterval(timer);say("arena",text);
    $("arena-check").disabled=true;$("arena-next").disabled=true;arenaStats();
  }
  function submit(){
    if(!round?.live||round.answered)return;
    if(round.end&&Date.now()>=round.end){finish("Time is up. Start a new round when ready.");return;}
    const {answer,reason,prime}=round.q;
    const entered=prime?value("arena-answer").trim().split(/[×*\s]+/).filter(Boolean).map(Number).sort((x,y)=>x-y):intAnswer("arena-answer");
    if(prime?entered.length===0||!entered.every(Number.isSafeInteger):!Number.isSafeInteger(entered)){
      say("arena",prime?"Enter the prime factors with repetitions.":"Enter a whole-number answer.");return;
    }
    const correct=prime?entered.join(",")===answer.join(","):entered===answer;
    round.attempts++;round.answered=true;
    if(correct){
      round.correct++;round.streak++;round.points+=10+(round.streak%3===0?5:0);
      if(round.points>saved.best){saved.best=round.points;store();}
      const box=feedback("arena");box.classList.remove("ground-celebrate");requestAnimationFrame(()=>box.classList.add("ground-celebrate"));
    }else round.streak=0;
    say("arena",(correct?"Correct. ":"Review this. ")+reason);
    $("arena-check").disabled=true;$("arena-next").disabled=false;arenaStats();
  }
  click("arena-start",()=>{
    clearInterval(timer);
    const seconds=Number(value("arena-mode"));
    round={live:true,end:seconds?Date.now()+seconds*1000:0,points:0,streak:0,correct:0,attempts:0};
    arenaQuestion();arenaStats();
    if(seconds)timer=setInterval(()=>Date.now()>=round.end?finish("Time is up. Start a new round when ready."):arenaStats(),250);
  });
  click("arena-stop",()=>finish("Round ended."));click("arena-check",submit);click("arena-next",arenaQuestion);
  on("arena-answer","keydown",event=>{if(event.key==="Enter"){if(round?.answered)arenaQuestion();else submit();}});
  $("arena-check").disabled=true;$("arena-next").disabled=true;arenaStats();

  const mistakes=[
    ["powers","A student uses 2³ × 3² for HCF(24,36).","Use minimum exponents: 2² × 3 = 12."],
    ["prime","A student stops the prime tree when it shows 8 × 9.","Both leaves are composite. Split them to get 2³ × 3²."],
    ["zero","A student picks zero as the LCM of 4 and 6.","Use the least positive common multiple. The first one is 12."],
    ["scope","A student multiplies the HCF and LCM of three inputs and expects their product.","The formula is for two inputs. HCF and LCM of 4, 6 and 12 give 2 × 12, while the input product is 288."]
  ];
  let mistake=0;
  setPrompt("error",mistakes[0][1]);
  click("error-next",()=>{mistake=(mistake+1)%mistakes.length;setPrompt("error",mistakes[mistake][1]);say("error","");});
  click("error-check",()=>say("error",(value("error-answer")===mistakes[mistake][0]?"Correct. ":"Review this. ")+mistakes[mistake][2]));
  for(const id of ["detective","arena","error"])$("tool-"+id).querySelector(".ground-live").hidden=false;
})();
