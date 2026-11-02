// Deterministic, weighted attribute neighborhoods. Filters keep these positions stable.
const hash=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0};
export function attributeSimilarity(a,b,defs={}){
 let score=0,total=0;
 for(const k of Object.keys(defs)){const x=new Set(a.axes?.[k]||[]),y=new Set(b.axes?.[k]||[]);if(!x.size&&!y.size)continue;const w=k==='unit'?3:k==='reproduction'?2:k==='entity'?.6:1,union=new Set([...x,...y]).size;score+=w*[...x].filter(v=>y.has(v)).length/union;total+=w}
 return total?score/total:0;
}
export function outerClusterLayout(items,defs={}){
 if(!items.length)return new Map();
 const sorted=[...items].sort((a,b)=>hash(a.id)-hash(b.id)||a.id.localeCompare(b.id));
 const classified=sorted.filter(r=>Object.values(r.axes||{}).some(v=>v.length));
 const pool=classified.length?classified:sorted,k=Math.min(pool.length,Math.max(1,Math.min(18,Math.round(Math.sqrt(items.length/3)))));
 const seeds=[pool[0]];
 while(seeds.length<k){let best=null,distance=-1;for(const r of pool){if(seeds.includes(r))continue;const d=1-Math.max(...seeds.map(s=>attributeSimilarity(r,s,defs)));if(d>distance){best=r;distance=d}}if(!best||distance<.08)break;seeds.push(best)}
 let groups=[];
 for(let round=0;round<3;round++){
  groups=seeds.map(()=>[]);for(const r of sorted){let bi=0,bs=-1;seeds.forEach((s,i)=>{const v=r.id===s.id?2:attributeSimilarity(r,s,defs);if(v>bs){bi=i;bs=v}});groups[bi].push(r)}
  if(round<2)groups.forEach((g,i)=>{if(!g.length)return;const sample=g.filter((_,j)=>j%Math.max(1,Math.ceil(g.length/60))===0);let best=seeds[i],bs=-1;for(const r of sample){const s=sample.reduce((n,x)=>n+attributeSimilarity(r,x,defs),0);if(s>bs){bs=s;best=r}}seeds[i]=best});
 }
 const islands=groups.filter(g=>g.length).map(g=>{const ps=[];g.forEach((r,i)=>{let p;for(let t=i;t<100000;t++){const a=t*2.3999632297+(hash(r.id)%31)*.008,d=125*Math.sqrt(t);p={x:Math.cos(a)*d*1.12,y:Math.sin(a)*d*.9};if(ps.every(q=>Math.abs(q.x-p.x)>=232||Math.abs(q.y-p.y)>=232))break}ps.push({...p,r})});const minX=Math.min(...ps.map(p=>p.x)),maxX=Math.max(...ps.map(p=>p.x)),minY=Math.min(...ps.map(p=>p.y)),maxY=Math.max(...ps.map(p=>p.y));const cx=(minX+maxX)/2,cy=(minY+maxY)/2;ps.forEach(p=>{p.x-=cx;p.y-=cy});return {ps,rx:(maxX-minX)/2+150,ry:(maxY-minY)/2+150}}).sort((a,b)=>b.ps.length-a.ps.length);
 const placed=[];for(const g of islands){let x=0,y=0;for(let t=0;t<100000;t++){const a=t*2.3999632297,d=70*Math.sqrt(t);x=Math.cos(a)*d*1.2;y=Math.sin(a)*d;if(placed.every(p=>Math.abs(x-p.x)>=g.rx+p.rx+90||Math.abs(y-p.y)>=g.ry+p.ry+90))break}placed.push({...g,x,y})}
 const result=new Map();for(const g of placed)for(const p of g.ps){const saved=p.r.canvasPosition;result.set(p.r.id,{x:saved?.layoutVersion===3?saved.x:g.x+p.x-100,y:saved?.layoutVersion===3?saved.y:g.y+p.y-100,w:200,h:200,rotate:0})}return result;
}
