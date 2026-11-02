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
export function visibleRelations(items,relations,mapId,visibleIds){
 const byId=new Map(items.filter(r=>!r.deleted).map(r=>[r.id,r])),visible=new Set(visibleIds),out=[],seen=new Set();
 const cover=id=>{const r=byId.get(id);return r?.parentId&&byId.has(r.parentId)?r.parentId:id};
 for(const e of allRelations(items,relations)){const from=mapId?e.from:cover(e.from),to=mapId?e.to:cover(e.to),key=pair({from,to});if(from!==to&&visible.has(from)&&visible.has(to)&&!seen.has(key)){seen.add(key);out.push({...e,sourceFrom:e.from,sourceTo:e.to,from,to})}}return out;
}
