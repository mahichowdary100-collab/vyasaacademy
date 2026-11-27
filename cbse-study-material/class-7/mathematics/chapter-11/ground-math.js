(function (root, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.CommonGroundMath = factory();
})(globalThis, () => {
  "use strict";
  function factors(n) {
    const small=[],large=[];
    for(let d=1;d*d<=n;d++){
      if(n%d!==0)continue;
      small.push(d);
      if(d*d!==n)large.unshift(n/d);
    }
    return small.concat(large);
  }
  function primeFactors(n) {
    const result=[];
    for(let d=2;d*d<=n;d+=(d===2?1:2)){
      while(n%d===0){result.push(d);n/=d;}
    }
    if(n>1)result.push(n);
    return result;
  }
  function gcd(a,b){while(b)[a,b]=[b,a%b];return a;}
  function lcm(a,b){return a/gcd(a,b)*b;}
  const hcf=values=>values.reduce(gcd);
  const least=values=>values.reduce(lcm);
  const isPrime=n=>n>1&&primeFactors(n).length===1;
  function exponents(values) {
    const lists=values.map(primeFactors);
    return [...new Set(lists.flat())].sort((a,b)=>a-b).map(prime=>{
      const counts=lists.map(items=>items.filter(p=>p===prime).length);
      return {prime,counts,min:Math.min(...counts),max:Math.max(...counts)};
    });
  }
  const format=list=>{
    const counts=new Map();
    for(const p of list)counts.set(p,(counts.get(p)||0)+1);
    const digits="⁰¹²³⁴⁵⁶⁷⁸⁹";
    return [...counts].map(([p,n])=>String(p)+(n>1?String(n).split("").map(d=>digits[Number(d)]).join(""):"")).join(" × ")||"1";
  };
  function divisibility(n) {
    const str=String(n), digits=Array.from(str,Number);
    const sum=digits.reduce((a,b)=>a+b,0), last=digits.at(-1);
    const odd=digits.filter((_,i)=>i%2===0).reduce((a,b)=>a+b,0);
    const even=sum-odd;
    const end2=Number(str.slice(-2)),end3=Number(str.slice(-3));
    return [
      [2,last%2===0,"Last digit "+last+(last%2===0?" is even.":" is odd.")],
      [3,sum%3===0,"Digit sum "+sum+" gives remainder "+sum%3+" on division by 3."],
      [4,end2%4===0,"Last two digits give "+end2+", with remainder "+end2%4+" on division by 4."],
      [5,last%5===0,"Last digit "+last+(last%5===0?" is 0 or 5.":" is neither 0 nor 5.")],
      [6,last%2===0&&sum%3===0,"Both tests must pass: even last digit "+last+" and digit sum "+sum+" divisible by 3."],
      [8,end3%8===0,"Last three digits give "+end3+", with remainder "+end3%8+" on division by 8."],
      [9,sum%9===0,"Digit sum "+sum+" gives remainder "+sum%9+" on division by 9."],
      [10,last===0,"Last digit "+last+(last===0?" is zero.":" is nonzero.")],
      [11,(odd-even)%11===0,"Alternate sums "+odd+" and "+even+" differ by "+(odd-even)+"."]
    ];
  }
  return {factors,primeFactors,gcd,lcm,hcf,least,isPrime,exponents,format,divisibility};
});
