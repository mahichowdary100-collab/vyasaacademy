(function (root, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.IntegerLessonMath = factory();
})(globalThis, () => {
  "use strict";
  const abs = n => n < 0n ? -n : n;
  function fraction(n, d = 1n) {
    if (d === 0n) throw new Error("Division by zero is undefined.");
    if (d < 0n) { n = -n; d = -d; }
    let a = abs(n), b = d;
    while (b !== 0n) [a,b] = [b,a % b];
    return { n:n/a, d:d/a };
  }
  const text = ({n,d}) => (d === 1n ? String(n) : n + "/" + d).replace("-", "−");
  const operand = v => v.n < 0n || v.d !== 1n ? "(" + text(v) + ")" : text(v);
  const opName = {"+":"+","-":"−","*":"×","/":"÷"};
  const reasons = {
    "+":"Combine the signed amounts.",
    "-":"Subtract by adding the opposite.",
    "*":"Multiply magnitudes and apply the sign rule.",
    "/":"Use the missing-factor relationship and keep an exact quotient."
  };
  function binary(op,x,y) {
    switch (op) {
      case "+": return fraction(x.n*y.d+y.n*x.d,x.d*y.d);
      case "-": return fraction(x.n*y.d-y.n*x.d,x.d*y.d);
      case "*": return fraction(x.n*y.n,x.d*y.d);
      case "/": return fraction(x.n*y.d,x.d*y.n);
      default: throw new Error("Unknown operation.");
    }
  }
  function evaluate(expression) {
    const source=String(expression).trim().replace(/−/g,"-").replace(/×/g,"*").replace(/÷/g,"/");
    if (!source || source.length>96) throw new Error("Enter an expression of up to 96 characters.");
    const parts=source.match(/\d+|[+*/()[\]-]|\s+|./g)||[];
    const tokens=parts.filter(p=>p.trim());
    if (tokens.some(p=>!/^\d{1,12}$|^[+*/()[\]-]$/.test(p))) {
      throw new Error("Use whole-number literals, the four operations and matching brackets.");
    }
    let index=0;
    const steps=[];
    function chain(next,ops) {
      let left=next();
      while (index<tokens.length && ops.includes(tokens[index])) {
        const op=tokens[index++];
        const right=next();
        const result=binary(op,left,right);
        steps.push(operand(left)+" "+opName[op]+" "+operand(right)+" = "+text(result)+". "+reasons[op]);
        left=result;
      }
      return left;
    }
    function sum(){return chain(product,["+","-"]);}
    function product(){return chain(unary,["*","/"]);}
    function unary(){
      const token=tokens[index++];
      if (token==="+" || token==="-") {
        const nextToken=tokens[index], x=unary();
        if (token==="+") return x;
        const negative=fraction(-x.n,x.d);
        if (!/^\d+$/.test(nextToken||"")) steps.push("Take the opposite of "+operand(x)+" to get "+text(negative)+".");
        return negative;
      }
      if(token==="(" || token==="["){
        const from=index;
        const result=sum();
        if(tokens[index++]!==(token==="("?")":"]")) throw new Error("Match each opening bracket with its closing bracket.");
        if (index-from>2) steps.push("Complete the group to get "+text(result)+".");
        return result;
      }
      if (token && /^\d+$/.test(token)) return fraction(BigInt(token));
      throw new Error("An integer or opening bracket is needed here.");
    }
    const result=sum();
    if (index!==tokens.length) throw new Error("Check for missing operations, extra brackets or spaces inside a number.");
    return { result, steps, answer:text(result) };
  }
  function answer(input) {
    const parts=String(input).trim().replace(/−/g,"-").match(/^([+-]?\d{1,12})(?:\s*\/\s*([+-]?\d{1,12}))?$/);
    if(!parts) return null;
    if(parts[2] && BigInt(parts[2])===0n)return null;
    return fraction(BigInt(parts[1]),parts[2]?BigInt(parts[2]):1n);
  }
  return { fraction, text, evaluate, answer, equal:(a,b)=>a.n===b.n&&a.d===b.d };
});
