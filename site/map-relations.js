export const RELATION_TYPES={derived:{ko:'여기서 파생됨',en:'Derived from',reverseKo:'여기서 파생된 자료',reverseEn:'Derivatives'},'same-format':{ko:'같은 포맷',en:'Same format'},combined:{ko:'결합됨',en:'Combined with'},reference:{ko:'인용·응답',en:'References / responds to',reverseKo:'이 자료를 인용·응답',reverseEn:'Referenced by'}};
export function validRelations(relations,items){
 if(relations==null)return true;if(!Array.isArray(relations)||relations.length>20000)return false;
 const ids=new Set(items.map(r=>r.id)),seen=new Set(),pairs=new Set();
 return relations.every(r=>{if(!r||typeof r.id!=='string'||!/^[-\w]{1,100}$/.test(r.id)||seen.has(r.id)||!ids.has(r.from)||!ids.has(r.to)||r.from===r.to||!Object.hasOwn(RELATION_TYPES,r.type))return false;seen.add(r.id);const ends=['same-format','combined'].includes(r.type)?[r.from,r.to].sort():[r.from,r.to],key=[...ends,r.type].join(':');if(pairs.has(key))return false;pairs.add(key);return true});
}
export function allRelations(items,relations=[]){const active=new Map(items.filter(r=>!r.deleted).map(r=>[r.id,r]));return [...relations.filter(r=>active.has(r.from)&&active.has(r.to)&&Object.hasOwn(RELATION_TYPES,r.type)),...items.filter(r=>!r.deleted&&r.parentId&&active.has(r.parentId)&&!relations.some(e=>e.type==='derived'&&e.from===r.parentId&&e.to===r.id)).map(r=>({id:'child-'+r.id,from:r.parentId,to:r.id,type:'derived',implicit:true}))]}
// Directed edges store the source/origin first; symmetric relations ignore direction.
export function relationLabel(edge,selected,lang='ko'){
 const t=RELATION_TYPES[edge.type];if(!t)return '';const source=edge.from===selected;
 if(edge.type==='derived')return source?(lang==='en'?t.reverseEn:t.reverseKo):(lang==='en'?t.en:t.ko);
 if(edge.type==='reference')return source?(lang==='en'?t.en:t.ko):(lang==='en'?t.reverseEn:t.reverseKo);
 return lang==='en'?t.en:t.ko;
}
export function visibleRelations(items,relations,mapId,visibleIds){
 const byId=new Map(items.filter(r=>!r.deleted).map(r=>[r.id,r])),visible=new Set(visibleIds),out=[];
 const cover=id=>{const r=byId.get(id);return r?.parentId&&byId.has(r.parentId)?r.parentId:id};
 for(const e of allRelations(items,relations)){const from=mapId?e.from:cover(e.from),to=mapId?e.to:cover(e.to);if(from!==to&&visible.has(from)&&visible.has(to))out.push({...e,sourceFrom:e.from,sourceTo:e.to,from,to})}return out;
}
