((root,factory)=>{
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  else root.DotsMath=api;
})(globalThis,()=>{
  "use strict";
  const unit=1000;
  function read(value){
    const text=String(value).trim().replace(/^−/,"-");
    if(!/^[+-]?(?:\d{1,5}(?:\.\d{1,3})?|\.\d{1,3})$/.test(text))
      throw new RangeError("Use numbers with at most five whole digits and three decimal places.");
    const [whole,tail=""]=text.replace(/^[+-]/,"").split(".");
    return (Number(whole||0)*unit+Number(tail.padEnd(3,"0")))*(text.startsWith("-")?-1:1);
  }
  function parse(text,limit=30){
    if(!text.trim())return [];
    const tokens=text.trim().split(/[\s,;]+/);
    if(tokens.length>limit)throw new RangeError("Enter up to "+limit+" observations.");
    return tokens.map(read);
  }
  const format=n=>String(n/unit);
  function ratio(n,d){
    const quotient=n/(unit*d);
    const rounded=Math.round(Math.abs(quotient)*10000)*Math.sign(quotient);
    return (n*10===rounded*d?"":"≈ ")+String(rounded/10000);
  }
  function summary(values){
    if(!values.length)return null;
    const sorted=values.slice().sort((a,b)=>a-b),count=sorted.length;
    const total=sorted.reduce((sum,value)=>sum+value,0);
    const low=sorted[0],high=sorted.at(-1),middle=Math.floor(count/2);
    const pair=count%2?[sorted[middle]]:[sorted[middle-1],sorted[middle]];
    return {sorted,count,total,low,high,range:high-low,pair,median:pair.reduce((sum,value)=>sum+value,0)/pair.length,mean:total/count};
  }
  function frequencies(values){
    const counts=new Map();
    for(const n of values)counts.set(n,(counts.get(n)||0)+1);
    return [...counts].sort(([a],[b])=>a-b);
  }
  function scale(min,max){
    if(min===max){min-=unit;max+=unit;}
    const raw=(max-min)/6,power=10**Math.floor(Math.log10(raw));
    const factor=[1,2,2.5,5,10].find(x=>x*power>=raw);
    const step=Math.max(1,Math.round(factor*power));
    return {min:Math.floor(min/step)*step,max:Math.ceil(max/step)*step,step};
  }
  function parseGroups(text){
    const lines=text.trim().split(/\r?\n/).filter(line=>line.trim());
    if(lines.length<1||lines.length>6)throw new RangeError("Enter 1 to 6 category rows.");
    let size;
    const used=new Set();
    return lines.map(line=>{
      const [name,...raw]=line.split(",");
      const label=name.trim(),values=raw.map(read);
      size??=values.length;
      if(!label||label.length>14||used.has(label))throw new RangeError("Use distinct category names of 1–14 characters.");
      if(values.length!==size||size<2||size>3||values.some(value=>value<0))throw new RangeError("Each row needs the same two or three nonnegative values.");
      used.add(label);
      return {label,values};
    });
  }
  return {unit,read,parse,format,ratio,summary,frequencies,scale,parseGroups};
});
