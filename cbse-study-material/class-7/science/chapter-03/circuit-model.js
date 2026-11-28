(function(root,factory){
  const model=factory();
  if(typeof module==="object"&&module.exports)module.exports=model;
  else root.ElectricCircuit=model;
})(globalThis,function(){
  "use strict";
  const columns=11, rows=7;
  const types={cell:"Cell",battery:"Two-cell battery",lamp:"Filament lamp",led:"Protected LED",switch:"Switch",metal:"Conducting sample",insulator:"Insulating sample"};
  const rotations=[[1,0],[0,1],[-1,0],[0,-1]];
  const key=(x,y)=>y*columns+x;
  const point=node=>[node%columns,Math.floor(node/columns)];
  const validNode=node=>Number.isInteger(node)&&node>=0&&node<columns*rows;
  function terminals(part){
    const [x,y]=point(part.at),[dx,dy]=rotations[part.turn];
    const tx=x+dx,ty=y+dy;
    return tx>=0&&tx<columns&&ty>=0&&ty<rows?[part.at,key(tx,ty)]:null;
  }
  function position(state,part){
    const pair=terminals(part);
    if(!pair)return false;
    if(state.parts.some(other=>terminals(other).some(node=>pair.includes(node))))return false;
    return !state.wires.some(wire=>pair.every(node=>wire.includes(node)));
  }
  function valid(state){
    if(!state||!Array.isArray(state.parts)||!Array.isArray(state.wires)||state.parts.length>12||state.wires.length>24)return false;
    const partial={parts:[],wires:[]};
    for(const item of state.parts){
      if(!item||!Object.hasOwn(types,item.kind)||!validNode(item.at)||!Number.isInteger(item.turn)||item.turn<0||item.turn>3||typeof item.on!=="boolean"||!position(partial,item))return false;
      partial.parts.push(item);
    }
    for(const wire of state.wires){
      if(!Array.isArray(wire)||wire.length!==2||!wire.every(validNode)||wire[0]===wire[1]||partial.wires.some(w=>wire[0]===w[0]&&wire[1]===w[1]||wire[0]===w[1]&&wire[1]===w[0]))return false;
      partial.wires.push(wire);
    }
    return true;
  }
  const clone=state=>({parts:state.parts.map(p=>({...p})),wires:state.wires.map(w=>w.slice())});
  const blank=()=>({parts:[],wires:[]});
  function preset(name){
    const data=blank();
    const add=(kind,x,y,turn=0,on=true)=>data.parts.push({kind,at:key(x,y),turn,on});
    const join=(x,y,X,Y)=>data.wires.push([key(x,y),key(X,Y)]);
    if(name==="blank")return data;
    const led=["led","reverse","weak","torch"].includes(name);
    add(led&&name!=="weak"?"battery":"cell",2,4);
    add(led?"led":"lamp",name==="reverse"?4:3,1,name==="reverse"?2:0,name!=="broken");
    add("switch",7,4,0,name!=="open");
    if(["metal","insulator"].includes(name))add(name,7,1);
    join(2,4,0,4);join(0,4,0,1);join(0,1,3,1);
    if(name==="gap")return data;
    if(name==="metal"||name==="insulator"){join(4,1,7,1);join(8,1,9,1);}
    else join(4,1,9,1);
    join(9,1,9,4);join(9,4,8,4);join(7,4,3,4);
    return data;
  }
  function analyse(state){
    const result={short:false,lit:[],segments:[],activeParts:[],source:false,reason:""};
    const conductor=Array.from({length:columns*rows},()=>[]);
    const bind=(a,b,index=null)=>{conductor[a].push([b,index]);conductor[b].push([a,index]);};
    state.wires.forEach(([a,b],index)=>bind(a,b,index));
    state.parts.forEach((part,index)=>{if(part.kind==="metal"||part.kind==="switch"&&part.on)bind(...terminals(part),-index-1);});
    const group=Array(conductor.length).fill(-1);
    conductor.forEach((_,start)=>{
      if(group[start]>=0)return;
      group[start]=start;
      const pending=[start];
      for(let i=0;i<pending.length;i++)for(const [next] of conductor[pending[i]])if(group[next]<0){group[next]=start;pending.push(next);}
    });
    const edges=[];
    state.parts.forEach((part,id)=>{
      if(!part.on&&part.kind==="lamp")return;
      const [a,b]=terminals(part),[from,to]=[group[a],group[b]];
      if(part.kind==="cell"||part.kind==="battery"){
        result.source=true;
        const emf=part.kind==="cell"?1:2;
        edges.push({id,a,b,from,to,emf,load:false,led:false});
      }else if((part.kind==="lamp"||part.kind==="led")&&from!==to)edges.push({id,a,b,from,to,emf:0,load:true,led:part.kind==="led"});
    });
    if(!result.source){result.reason="Add a working cell or battery.";return result;}
    const directed=Array.from({length:conductor.length},()=>[]);
    edges.forEach(e=>{
      directed[e.from].push(e);
      if(!e.led)directed[e.to].push({...e,a:e.b,b:e.a,from:e.to,to:e.from,emf:-e.emf});
    });
    const wires=new Map(),lit=new Set(),activeParts=new Set();
    function trace(a,b){
      if(a===b)return;
      const previous=new Map([[a,null]]),queue=[a];
      for(let i=0;i<queue.length&&!previous.has(b);i++){
        const parent=queue[i];
        for(const [n,index] of conductor[parent]){
          if(previous.has(n))continue;
          previous.set(n,[parent,index]);queue.push(n);
        }
      }
      for(let p=b;p!==a;){
        const [from,index]=previous.get(p);
        if(index<0)activeParts.add(-index-1); else if(index!==null&&!wires.has(index))wires.set(index,[from,p]);
        p=from;
      }
    }
    for(const first of edges.filter(e=>!e.load)){
      if(first.from===first.to){result.short=true;break;}
      const visited=new Set([first.from,first.to]);
      const path=[];
      function walk(node,origin,emf,loadCount,ledCount){
        for(const e of directed[node]){
          if(e.id===first.id)continue;
          const sum=emf+e.emf,loads=loadCount+Number(e.load),leds=ledCount+Number(e.led);
          if(e.to===origin){
            if(!loads&&sum!==0){result.short=true;return;}
            if(loads&&sum<0&&-sum>=Math.max(1,leds*2)){
              const cycle=[...path,e];
              cycle.filter(c=>c.load).forEach(c=>lit.add(c.id));
              cycle.forEach((c,i)=>trace(c.b,cycle[(i+1)%cycle.length].a));
            }
          }else if(!visited.has(e.to)){
            visited.add(e.to);path.push(e);walk(e.to,origin,sum,loads,leds);path.pop();visited.delete(e.to);
            if(result.short)return;
          }
        }
      }
      // Positive conventional current leaves the positive source terminal.
      // Traversing the source from its negative terminal to its positive terminal subtracts emf here.
      const reverse={...first,a:first.b,b:first.a,from:first.to,to:first.from,emf:-first.emf};
      for(const oriented of [first,reverse]){
        path[0]=oriented;
        walk(oriented.to,oriented.from,oriented.emf,0,0);
        if(result.short)break;
      }
      if(result.short)break;
    }
    if(result.short){
      result.reason="Unsafe virtual short: a conducting path bypasses the load. Simulation stopped. Keep physical cell terminals apart.";
      return result;
    }
    result.lit=[...lit];result.segments=[...wires.values()];result.activeParts=[...activeParts];
    result.reason=lit.size?lit.size+" load"+(lit.size===1?" has":"s have")+" a complete, suitably powered path.":"No load lights. Check for gaps, an open switch, poor contacts, source orientation or insufficient supply. An LED must face the right way.";
    return result;
  }
  return {columns,rows,types,key,point,terminals,position,valid,clone,blank,preset,analyse};
});
