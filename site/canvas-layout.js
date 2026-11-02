// Equal, upright slots keep the initial outer map clear of overlaps.
// Versioned positions preserve future manual moves without restoring the old scatter.
export function outerGridLayout(items) {
 const columns=Math.max(1,Math.ceil(Math.sqrt(items.length*1.4)));
 const rows=Math.ceil(items.length/columns);
 return new Map(items.map((item,index)=>{
  const saved=item.canvasPosition;
  const position={x:(index%columns-(columns-1)/2)*250-100,y:(Math.floor(index/columns)-(rows-1)/2)*250-100,w:200,h:200,rotate:0};
  if(saved?.layoutVersion===2&&Number.isFinite(saved.x)&&Number.isFinite(saved.y)){position.x=saved.x;position.y=saved.y}
  return [item.id,position];
 }));
}
