// Legacy typed connections remain readable; all new connections are undirected.
const legacyTypes=new Set(['derived','same-format','combined','reference']);
const pair=r=>[r.from,r.to].sort().join(':');
export function normalizeRelations(relations=[]){const seen=new Set();return relations.filter(r=>{const key=pair(r);if(seen.has(key))return false;seen.add(key);return true}).map(r=>({id:r.id,from:r.from,to:r.to}))}
export function validRelations(relations,items){
 if(relations==null)return true;if(!Array.isArray(relations)||relations.length>20000)return false;
 const ids=new Set(items.map(r=>r.id)),seen=new Set(),pairs=new Set();
 return relations.every(r=>{if(!r||typeof r.id!=='string'||!/^[-\w]{1,100}$/.test(r.id)||seen.has(r.id)||!ids.has(r.from)||!ids.has(r.to)||r.from===r.to||(r.type!=null&&!legacyTypes.has(r.type)))return false;seen.add(r.id);const key=pair(r);if(pairs.has(key)&&r.type==null)return false;pairs.add(key);return true});
}
export function allRelations(items,relations=[]){const active=new Map(items.filter(r=>!r.deleted).map(r=>[r.id,r]));const manual=normalizeRelations(relations.filter(r=>active.has(r.from)&&active.has(r.to))),pairs=new Set(manual.map(pair));return [...manual,...items.filter(r=>!r.deleted&&r.parentId&&active.has(r.parentId)&&!pairs.has(pair({from:r.parentId,to:r.id}))).map(r=>({id:'child-'+r.id,from:r.parentId,to:r.id,implicit:true}))]}
export function visibleRelations(items,relations,mapId,visibleIds,defs={},positions=new Map()){
 const byId=new Map(items.filter(r=>!r.deleted).map(r=>[r.id,r])),visible=new Set(visibleIds),out=[],seen=new Set();
 const cover=id=>{const r=byId.get(id);return r?.parentId&&byId.has(r.parentId)?r.parentId:id};
 for(const e of allRelations(items,relations)){const from=mapId?e.from:cover(e.from),to=mapId?e.to:cover(e.to),key=pair({from,to});if(from!==to&&visible.has(from)&&visible.has(to)&&!seen.has(key)){seen.add(key);out.push({...e,sourceFrom:e.from,sourceTo:e.to,from,to})}}
 if(!mapId)for(const e of tagRelations(items,defs,visibleIds,positions)){const key=pair(e);if(!seen.has(key)){seen.add(key);out.push(e)}}return out;
}

// A spanning tree links every visible member of a tag without a complete mesh.
export function tagRelations(items,defs,visibleIds,positions=new Map()){
 const active=new Map(items.filter(r=>!r.deleted).map(r=>[r.id,r])),visible=new Set(visibleIds),groups=new Map(),out=[];
 const cover=r=>r.parentId&&active.has(r.parentId)?r.parentId:r.id;
 for(const [key,def] of Object.entries(defs||{})){if(!def.connectOnMap)continue;for(const r of active.values()){const id=cover(r);if(!visible.has(id))continue;for(const value of r.axes?.[key]||[]){if(!def.options.includes(value))continue;const group=key+':'+value;if(!groups.has(group))groups.set(group,new Set());groups.get(group).add(id)}}}
 const point=id=>{const p=positions.get(id);if(p)return {x:p.x+p.w/2,y:p.y+p.h/2};let h=0;for(const c of id)h=(Math.imul(h,31)+c.charCodeAt(0))>>>0;return {x:h%10000,y:Math.floor(h/10000)}};
 for(const members of groups.values()){
  const ids=[...members].sort();if(ids.length<2)continue;const points=ids.map(point),used=new Set([0]),best=ids.map(()=>Infinity),parent=ids.map(()=>0);let current=0;
  while(used.size<ids.length){for(let i=0;i<ids.length;i++){if(used.has(i))continue;const d=(points[current].x-points[i].x)**2+(points[current].y-points[i].y)**2;if(d<best[i]){best[i]=d;parent[i]=current}}let next=-1;for(let i=0;i<ids.length;i++)if(!used.has(i)&&(next<0||best[i]<best[next]))next=i;if(next<0)break;out.push({id:'auto-'+ids[parent[next]]+'-'+ids[next],from:ids[parent[next]],to:ids[next],auto:true,implicit:true});used.add(next);current=next}
 }
 return out;
}
