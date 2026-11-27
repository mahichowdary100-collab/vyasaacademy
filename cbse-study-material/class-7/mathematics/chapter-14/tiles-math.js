((root,factory)=>{
  const geometry=factory();
  if(typeof module==="object"&&module.exports)module.exports=geometry;
  else root.TilesMath=geometry;
})(globalThis,()=>{
  "use strict";
  const eps=1e-7;
  const add=(a,b)=>[a[0]+b[0],a[1]+b[1]];
  const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]];
  const mul=(a,k)=>[a[0]*k,a[1]*k];
  const dot=(a,b)=>a[0]*b[0]+a[1]*b[1];
  const cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
  const length=a=>Math.hypot(...a);
  const distance=(a,b)=>length(sub(a,b));
  const mid=(a,b)=>mul(add(a,b),.5);
  const polar=(r,t)=>[r*Math.cos(t),r*Math.sin(t)];
  const rad=d=>d*Math.PI/180;
  const perp=a=>[-a[1],a[0]];
  const next=(a,i)=>a[(i+1)%a.length];
  function circles(a,r,b,s){
    const delta=sub(b,a),d=length(delta);
    if(d<eps||d>r+s+eps||d<Math.abs(r-s)-eps||r<=0||s<=0)return [];
    const along=(r*r-s*s+d*d)/(2*d);
    const h=Math.sqrt(Math.max(0,r*r-along*along)),v=mul(delta,1/d),base=add(a,mul(v,along));
    if(h<eps)return [base];
    return [add(base,mul(perp(v),h)),add(base,mul(perp(v),-h))];
  }
  function lineIntersection(a,b,c,d){
    const u=sub(b,a),v=sub(d,c),den=cross(u,v);
    if(Math.abs(den)<eps)return null;
    return add(a,mul(u,cross(sub(c,a),v)/den));
  }
  function lineCircle(a,b,c,r){
    const v=sub(b,a),ll=dot(v,v);
    if(ll<eps||r<=0)return [];
    const root=add(a,mul(v,dot(sub(c,a),v)/ll));
    const h2=r*r-distance(root,c)**2;
    if(h2<-eps)return [];
    if(h2<=eps)return [root];
    const step=mul(v,Math.sqrt(h2/ll));
    return [sub(root,step),add(root,step)];
  }
  function polygon(n,side,centre=[0,0],angle=-Math.PI/2){
    const r=side/(2*Math.sin(Math.PI/n));
    return Array.from({length:n},(_,i)=>add(centre,polar(r,angle+i*2*Math.PI/n)));
  }
  const area=a=>Math.abs(a.reduce((sum,p,i)=>sum+cross(p,next(a,i)),0))/2;
  function contains(a,p){
    let positive=false,negative=false;
    for(let i=0;i<a.length;i++){
      const z=cross(sub(next(a,i),a[i]),sub(p,a[i]));
      if(z>eps)positive=true;
      if(z<-eps)negative=true;
      if(positive&&negative)return false;
    }
    return true;
  }
  function overlaps(a,b){
    for(const p of [a,b])for(let i=0;i<p.length;i++){
      const axis=perp(sub(next(p,i),p[i]));
      const da=a.map(v=>dot(v,axis)),db=b.map(v=>dot(v,axis));
      const depth=Math.min(Math.max(...da),Math.max(...db))-Math.max(Math.min(...da),Math.min(...db));
      if(depth<=eps*length(axis))return false;
    }
    return true;
  }
  function coverage(region,pieces){
    const outside=pieces.filter(p=>p.some(v=>!contains(region,v))).length;
    let clashes=0;
    for(let i=0;i<pieces.length;i++)for(let j=0;j<i;j++)if(overlaps(pieces[i],pieces[j]))clashes++;
    const used=pieces.reduce((sum,p)=>sum+area(p),0),target=area(region);
    return {outside,clashes,used,target,complete:!outside&&!clashes&&Math.abs(used-target)<1e-5};
  }
  const cell=(r,c)=>r+","+c;
  function domino(rows,cols,holes=[]){
    const removed=new Set(holes),dark=[],light=[];
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
      const id=cell(r,c);
      if(!removed.has(id))((r+c)%2?light:dark).push(id);
    }
    const result={dark:dark.length,light:light.length,pairs:null};
    if(dark.length!==light.length)return result;
    const whites=new Set(light),match=new Map();
    function augment(id,seen){
      const [r,c]=id.split(",").map(Number);
      const candidates=[cell(r,c+1),cell(r,c-1),cell(r+1,c),cell(r-1,c)];
      for(const neighbour of candidates){
        if(!whites.has(neighbour)||seen.has(neighbour))continue;
        seen.add(neighbour);
        if(!match.has(neighbour)||augment(match.get(neighbour),seen)){
          match.set(neighbour,id);
          return true;
        }
      }
      return false;
    }
    for(const id of dark)if(!augment(id,new Set()))return result;
    result.pairs=[...match].map(([w,b])=>[b,w]);
    return result;
  }
  const interior=n=>180*(n-2)/n;
  function hexWalk(centre,r,angle=0){
    const first=add(centre,polar(r,angle)),vertices=[first];
    for(let i=1;i<6;i++){
      const current=vertices.at(-1);
      const [candidateA,candidateB]=circles(centre,r,current,r);
      const previous=vertices.at(-2);
      const direction=q=>cross(sub(current,centre),sub(q,centre));
      vertices.push(previous?(distance(candidateA,previous)>distance(candidateB,previous)?candidateA:candidateB)
        :direction(candidateA)>0?candidateA:candidateB);
    }
    return vertices;
  }
  const tangram=[
    [[0,0],[4,0],[2,2]],[[0,0],[0,4],[2,2]],[[4,4],[2,4],[4,2]],
    [[3,1],[4,0],[4,2]],[[1,3],[2,2],[3,3]],
    [[2,2],[3,1],[4,2],[3,3]],[[0,4],[1,3],[3,3],[2,4]]
  ];
  return {eps,add,sub,mul,dot,cross,length,distance,mid,polar,rad,perp,circles,lineIntersection,lineCircle,polygon,area,contains,overlaps,coverage,cell,domino,interior,hexWalk,tangram};
});
