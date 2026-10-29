// Shared archive migration and relationship rules for browser, API and backups.
export function migrateHierarchy(data){
 if(data.hierarchyVersion===1)return false;
 data.legacyGroups=[...(data.legacyGroups||[]),...(data.groups||[])];
 for(const g of data.groups||[]){
  const members=data.items.filter(r=>!r.deleted&&r.groupId===g.id);
  if(!members.length)continue;
  const root=members.find(r=>r.name===g.name)||members[0];
  if(g.description&&!root.mapDescription)root.mapDescription=g.description;
  for(const r of members)if(r.id!==root.id&&!r.parentId)r.parentId=root.id;
 }
 for(const r of data.items)delete r.groupId;
 data.groups=[];data.hierarchyVersion=1;return true;
}
export function validHierarchy(items){
 if(!Array.isArray(items)||items.some(r=>!r||typeof r!=='object'))return false;
 const map=new Map(items.map(r=>[r.id,r]));
 return items.every(r=>{
  if(r.innerPosition!=null&&(!Number.isFinite(r.innerPosition.x)||!Number.isFinite(r.innerPosition.y)))return false;
  if(!r.parentId)return true;
  const parent=map.get(r.parentId);
  return typeof r.parentId==='string'&&!!parent&&parent.id!==r.id&&!parent.parentId;
 });
}
export function childrenOf(items,id){return items.filter(r=>!r.deleted&&r.parentId===id)}
export function outerItems(items){const map=new Map(items.map(r=>[r.id,r]));return items.filter(r=>!r.deleted&&(!r.parentId||!map.get(r.parentId)||map.get(r.parentId).deleted))}
