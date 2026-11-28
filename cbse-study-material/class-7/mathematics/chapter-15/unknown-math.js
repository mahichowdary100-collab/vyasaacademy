((root,factory)=>{
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  else root.UnknownMath=api;
})(globalThis,()=>{
  "use strict";
  const magnitude=n=>n<0n?-n:n;
  function gcd(n,d){
    n=magnitude(n);d=magnitude(d);
    while(d)[n,d]=[d,n%d];
    return n;
  }
  const lcm=(n,d)=>n/gcd(n,d)*d;
  function q(n,d=1n){
    n=BigInt(n);d=BigInt(d);
    if(!d)throw new RangeError("Division by zero is undefined.");
    if(d<0n){n=-n;d=-d;}
    const f=gcd(n,d);
    n/=f;d/=f;
    if(String(magnitude(n)).length>70||String(d).length>70)throw new RangeError("Use smaller numbers.");
    return {n,d};
  }
  const plus=(a,b)=>q(a.n*b.d+b.n*a.d,a.d*b.d);
  const minus=(a,b)=>q(a.n*b.d-b.n*a.d,a.d*b.d);
  const times=(a,b)=>q(a.n*b.n,a.d*b.d);
  const over=(a,b)=>q(a.n*b.d,a.d*b.n);
  const neg=a=>q(-a.n,a.d);
  const same=(a,b)=>a.n===b.n&&a.d===b.d;
  const number=a=>Number(a.n)/Number(a.d);
  const write=a=>(a.n<0n?"−":"")+magnitude(a.n)+(a.d===1n?"":"/"+a.d);
  const plain=a=>write(a).replace("−","-");
  function decideNumber(text){
    if(!/^(?:\d{1,12}(?:\.\d{0,8})?|\.\d{1,8})$/.test(text))
      throw new RangeError("Use up to 12 whole digits and 8 decimal places per number.");
    const [first,tail=""]=text.split(".");
    return q(BigInt((first||"0")+tail),10n**BigInt(tail.length));
  }
  function simplify(a=q(0),b=q(0)){return {a,b};}
  const add=(p,r)=>simplify(plus(p.a,r.a),plus(p.b,r.b));
  const sub=(p,r)=>simplify(minus(p.a,r.a),minus(p.b,r.b));
  const scale=(p,s)=>simplify(times(p.a,s),times(p.b,s));
  const evaluate=(p,x)=>plus(times(p.a,x),p.b);
  function affineText(p,v="x"){
    const {a,b}=p;
    if(!a.n)return write(b);
    let text=a.n<0n?"−":"",mag=q(magnitude(a.n),a.d);
    if(mag.d!==1n)text+="("+write(mag)+")";
    else if(mag.n!==1n)text+=write(mag);
    text+=v;
    if(b.n)text+=(b.n<0n?" − ":" + ")+write(q(magnitude(b.n),b.d));
    return text;
  }
  const eqText=e=>affineText(e.left,e.v)+" = "+affineText(e.right,e.v);
  const normalize=text=>String(text).replace(/[−–]/g,"-").replace(/[×·]/g,"*").replace(/÷/g,"/").replace(/\[/g,"(").replace(/\]/g,")").trim();
  function tokenize(text){
    if(text.length>180)throw new RangeError("Use up to 180 characters.");
    const tokens=[];
    let i=0;
    while(i<text.length){
      if(/\s/.test(text[i])){i++;continue;}
      const token=/^(?:\d+(?:\.\d*)?|\.\d+|[A-Za-z]|[()+*/=\-])/.exec(text.slice(i));
      if(!token)throw new RangeError("Use numbers, one letter, brackets, and the four arithmetic operations.");
      const raw=token[0];
      tokens.push(raw);i+=raw.length;
    }
    return tokens;
  }
  const variable=t=>typeof t==="string"&&/^[a-z]$/i.test(t);
  const numeric=t=>typeof t==="string"&&/^[\d.]/.test(t);
  function makeParser(tokens,meta){
    let i=0,depth=0;
    function atom(){
      if(++depth>35)throw new RangeError("Use fewer nested brackets or signs.");
      const t=tokens[i++];
      let result;
      if(t==="+"||t==="-"){
        const p=atom();
        result=t==="-"?scale(p,q(-1)):p;
      }else if(t==="("){
        meta.brackets=true;result=sum();
        if(tokens[i++]!==")")throw new RangeError("Close every opening bracket.");
      }else if(numeric(t)){
        if(t.includes("."))meta.decimals=true;
        result=simplify(q(0),decideNumber(t));
      }else if(variable(t)){
        const v=t.toLowerCase();
        if(meta.v&&meta.v!==v)throw new RangeError("Use just one variable in the entire equation.");
        meta.v=v;result=simplify(q(1));
      }else throw new RangeError("A number, variable or bracket is missing.");
      depth--;return result;
    }
    function product(){
      let result=atom();
      while(i<tokens.length){
        const t=tokens[i],implicit=t==="("||variable(t);
        if(t!=="*"&&t!=="/"&&!implicit)break;
        if(!implicit)i++;
        const next=atom();
        if(t==="/"){
          if(next.a.n)throw new RangeError("The divisor must be a nonzero number.");
          if(!next.b.n)throw new RangeError("Division by zero is undefined.");
          if(next.b.d===1n)meta.denominators.push(magnitude(next.b.n));
          result=scale(result,over(q(1),next.b));
        }else{
          if(result.a.n&&next.a.n)throw new RangeError("This lesson supports linear equations only. Do not multiply variable terms together.");
          result=result.a.n?scale(result,next.b):scale(next,result.b);
        }
      }
      return result;
    }
    function sum(){
      let result=product();
      while(tokens[i]==="+"||tokens[i]==="-"){
        const operator=tokens[i++],next=product();
        result=operator==="+"?add(result,next):sub(result,next);
      }
      return result;
    }
    const answer=sum();
    if(i!==tokens.length)throw new RangeError("Check for missing operators or unmatched brackets.");
    return answer;
  }
  function parse(text){
    const tokens=tokenize(normalize(text)),i=tokens.indexOf("=");
    if(i<=0||i===tokens.length-1||tokens.lastIndexOf("=")!==i)throw new RangeError("Enter one equation with exactly one equals sign and two sides.");
    const meta={v:null,brackets:false,decimals:false,denominators:[]};
    const left=makeParser(tokens.slice(0,i),meta),right=makeParser(tokens.slice(i+1),meta);
    return {...meta,v:meta.v||"x",left,right};
  }
  function constant(text){
    const meta={v:null,brackets:false,decimals:false,denominators:[]};
    const result=makeParser(tokenize(normalize(text)),meta);
    if(meta.v)throw new RangeError("Enter a number or fraction here.");
    return result.b;
  }
  function solve(e){
    const factor=minus(e.left.a,e.right.a),total=minus(e.right.b,e.left.b);
    if(!factor.n)return {kind:total.n?"none":"all",factor,total};
    return {kind:"one",factor,total,answer:over(total,factor)};
  }
  function equivalent(a,b){
    const x=solve(a),y=solve(b);
    return x.kind===y.kind&&(x.kind!=="one"||same(x.answer,y.answer));
  }
  function apply(e,op,amount){
    if(op==="add"||op==="sub"||op==="addx"||op==="subx"){
      const term=op.endsWith("x")?simplify(amount):simplify(q(0),amount);
      const update=op.startsWith("add")?add:sub;
      return {...e,left:update(e.left,term),right:update(e.right,term)};
    }
    if(!amount.n)throw new RangeError("Choose a nonzero multiplier or divisor to preserve the solution set.");
    if(op!=="mul"&&op!=="div")throw new RangeError("Choose a valid operation.");
    const factor=op==="div"?over(q(1),amount):amount;
    return {...e,left:scale(e.left,factor),right:scale(e.right,factor)};
  }
  function clearFactor(e){
    return [e.left.a.d,e.left.b.d,e.right.a.d,e.right.b.d,...(e.denominators??[])].reduce(lcm,1n);
  }
  function steps(e,{denominators=false}={}){
    const lines=[{equation:eqText(e),reason:e.brackets?"Expand brackets using distribution, then collect like terms on each side.":"Collect variable terms and constants separately on each side."}];
    let current=e;
    const move=(op,value,reason)=>{current=apply(current,op,value);lines.push({equation:eqText(current),reason});};
    if(denominators){
      const factor=clearFactor(e);
      if(factor>1n)move("mul",q(factor),"Multiply every term on both sides by the common multiple "+factor+".");
    }
    if(!current.left.a.n&&current.right.a.n){
      current={...current,left:current.right,right:current.left};
      lines.push({equation:eqText(current),reason:"Swap the two sides of the equality."});
    }
    if(current.right.a.n){
      const term=affineText(simplify(q(magnitude(current.right.a.n),current.right.a.d)),current.v);
      move(current.right.a.n<0n?"addx":"subx",q(magnitude(current.right.a.n),current.right.a.d),
        (current.right.a.n<0n?"Add ":"Subtract ")+term+(current.right.a.n<0n?" to":" from")+" both sides.");
    }
    if(current.left.b.n){
      const amt=q(magnitude(current.left.b.n),current.left.b.d);
      move(current.left.b.n<0n?"add":"sub",amt,(current.left.b.n<0n?"Add ":"Subtract ")+write(amt)+(current.left.b.n<0n?" to":" from")+" both sides.");
    }
    if(!current.left.a.n){
      const all=!current.right.b.n;
      lines.push({equation:all?"Every value is a solution":"No solution",reason:all?"Both sides simplify to the same value for any input.":"The variable cancels and the remaining number statement is false."});
      return lines;
    }
    if(!same(current.left.a,q(1)))move("div",current.left.a,"Divide every term on both sides by "+write(current.left.a)+".");
    const answer=current.right.b;
    lines.push({equation:"LHS = RHS = "+write(evaluate(e.left,answer)),reason:"Substitute "+current.v+" = "+write(answer)+" into both original sides to verify."});
    return lines;
  }
  return {q,plus,minus,times,over,neg,same,number,write,plain,simplify,add,sub,scale,evaluate,affineText,eqText,parse,constant,solve,equivalent,apply,clearFactor,steps};
});
