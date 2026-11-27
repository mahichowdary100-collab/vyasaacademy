((root,factory)=>{
  const math=factory();
  if(typeof module==="object"&&module.exports)module.exports=math;
  else root.PeekMath=math;
})(globalThis,()=>{
  "use strict";
  const pow=n=>10n**BigInt(n);
  const abs=n=>n<0n?-n:n;
  function gcd(a,b){
    a=abs(a);b=abs(b);
    while(b)[a,b]=[b,a%b];
    return a;
  }
  function fraction(n,d=1n){
    if(d===0n)throw new RangeError("Division by zero is undefined.");
    if(d<0n){n=-n;d=-d;}
    const g=gcd(n,d);
    return {n:n/g,d:d/g};
  }
  function decimal(value){
    const match=/^([+-]?)(?:(\d{1,8})(?:\.(\d{0,6}))?|\.(\d{1,6}))$/.exec(String(value).trim());
    if(!match)throw new RangeError("Enter a decimal with up to eight whole digits and six decimal places.");
    const places=match[3]??match[4]??"";
    const units=BigInt((match[2]??"0")+places)*(match[1]==="-"?-1n:1n);
    return {units,scale:places.length};
  }
  const rational=x=>fraction(x.units,pow(x.scale));
  function fixed(units,scale,trim=false){
    const digits=abs(units).toString().padStart(scale+1,"0");
    let result=scale?digits.slice(0,-scale)+"."+digits.slice(-scale):digits;
    if(trim&&scale)result=result.replace(/0+$/,"").replace(/\.$/,"");
    return (units<0n?"−":"")+result;
  }
  function add(a,b,subtract=false){
    const scale=Math.max(a.scale,b.scale);
    const left=a.units*pow(scale-a.scale),right=b.units*pow(scale-b.scale);
    return {left,right,scale,units:left+(subtract?-right:right)};
  }
  const product=(a,b)=>({units:a.units*b.units,scale:a.scale+b.scale});
  const divide=(a,b)=>fraction(a.units*pow(b.scale),b.units*pow(a.scale));
  function expansion({n,d},limit=24){
    const sign=n<0n?"−":"",m=abs(n),whole=m/d;
    let rest=m%d;
    const digits=[],seen=new Map(),rows=[];
    while(rest&&digits.length<limit&&!seen.has(rest)){
      seen.set(rest,digits.length);
      const brought=rest*10n,digit=brought/d,used=digit*d;
      rest=brought-used;
      digits.push(String(digit));
      rows.push({brought,digit,used,rest});
    }
    const cycle=rest?seen.get(rest):undefined;
    const plain=sign+whole+(digits.length?"."+digits.join(""):"");
    const text=cycle!==undefined
      ?sign+whole+"."+digits.slice(0,cycle).join("")+"("+digits.slice(cycle).join("")+")"
      :plain+(rest?"…":"");
    return {text,plain,whole,cycle,rows,rest};
  }
  function round({n,d},scale){
    const shifted=abs(n)*pow(scale);
    const units=(shifted/d+(2n*(shifted%d)>=d?1n:0n))*(n<0n?-1n:1n);
    return {units,scale};
  }
  const format=x=>fixed(x.units,x.scale,true);
  const label=x=>fixed(x.units,x.scale);
  const equal=(a,b)=>add(a,b,true).units===0n;
  const leap=y=>y%400===0||(y%4===0&&y%100!==0);
  const leapsThrough=y=>Math.floor(y/4)-Math.floor(y/100)+Math.floor(y/400);
  return {pow,abs,fraction,decimal,rational,fixed,add,product,divide,expansion,round,format,label,equal,leap,leapsThrough};
});
