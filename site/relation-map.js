import {visibleRelations,relationLabel} from './map-relations.js';
export function createRelationMap(o){
 const canvas=o.canvas,board=o.board,dock=document.createElement('div');dock.className='relation-focus';dock.hidden=true;dock.setAttribute('aria-live','polite');canvas.parentElement.append(dock);
 let focus=null,notice='',activeEdge=null;
 const en=()=>o.lang()==='en',e=o.escape,t=(ko,english)=>en()?english:ko;
 const edges=()=>visibleRelations(o.items(),o.relations(),o.mapId(),o.visible().map(r=>r.id));
 const neighbors=()=>edges().filter(r=>r.from===focus||r.to===focus);
 const get=id=>o.items().find(r=>r.id===id&&!r.deleted);
 function select(id,message=''){if(!get(id))return;focus=id;notice=message;activeEdge=null;draw();}
 function clear(){focus=null;notice='';activeEdge=null;draw()}
 function draw(){
  const visible=o.visible();if(!visible.some(r=>r.id===focus)||o.enabled?.()===false){focus=null;notice='';activeEdge=null}
  const connected=focus?neighbors():[],ids=new Set(connected.flatMap(r=>[r.from,r.to]));
  board.querySelectorAll('[data-card]').forEach(card=>{card.classList.toggle('relation-selected',card.dataset.card===focus);card.classList.toggle('relation-neighbor',card.dataset.card!==focus&&ids.has(card.dataset.card));card.querySelector('[data-item]')?.setAttribute('aria-pressed',String(card.dataset.card===focus))});
  let svg=board.querySelector('.map-links');if(!svg){svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('map-links');board.prepend(svg)}
  svg.innerHTML=connected.map(r=>{const p=o.layout().get(r.from),q=o.layout().get(r.to);if(!p||!q)return '';return `<g data-relation-edge="${e(r.id)}" role="button" tabindex="0" aria-label="${e(relationLabel(r,focus,o.lang()))}"><title>${e(relationLabel(r,focus,o.lang()))}</title><line class="relation-hit" x1="${p.x+p.w/2}" y1="${p.y+p.h/2}" x2="${q.x+q.w/2}" y2="${q.y+q.h/2}"/><line class="relation-line" x1="${p.x+p.w/2}" y1="${p.y+p.h/2}" x2="${q.x+q.w/2}" y2="${q.y+q.h/2}"/></g>`}).join('');
  board.querySelector('.relation-edge-label')?.remove();const edge=connected.find(r=>r.id===activeEdge);if(edge){const p=o.layout().get(edge.from),q=o.layout().get(edge.to),label=document.createElement('button');label.className='relation-edge-label';label.textContent=relationLabel(edge,focus,o.lang());label.style.left=((p.x+p.w/2+q.x+q.w/2)/2)+'px';label.style.top=((p.y+p.h/2+q.y+q.h/2)/2)+'px';label.onclick=ev=>{ev.stopPropagation();const id=edge.from===focus?edge.to:edge.from;select(id,edge)};board.append(label)}
  dock.hidden=!focus||o.view()!=='scatter';if(dock.hidden)return;const r=get(focus);if(!r)return;
  const unique=connected.filter((r,i,a)=>a.findIndex(v=>v.type===r.type&&(v.from===focus?v.to:v.from)===(r.from===focus?r.to:r.from))===i);
  dock.innerHTML=`<div class="relation-focus-heading"><strong data-no-translate>${e(o.name(r))}</strong><button data-focus-detail>${e(t('정보','Info'))}</button>${o.items().some(v=>!v.deleted&&v.parentId===r.id)?`<button data-focus-enter>${e(t('내부 지도','Inner map'))} ↗</button>`:''}<button data-focus-clear aria-label="${e(t('선택 해제','Clear selection'))}">×</button></div>${notice?`<div class="relation-notice">${e(relationLabel(notice,focus,o.lang()))}</div>`:''}${unique.length?`<div class="relation-neighbors">${unique.map(edge=>{const other=edge.from===focus?edge.to:edge.from;return `<button data-focus-neighbor="${e(other)}" data-edge="${e(edge.id)}"><span>${e(relationLabel(edge,focus,o.lang()))}</span><b data-no-translate>${e(o.name(get(other)))}</b></button>`}).join('')}</div>`:''}`;
 }
 function edgeClick(id){const edge=neighbors().find(r=>r.id===id);if(!edge)return;activeEdge=id;notice=edge;draw()}
 canvas.addEventListener('click',ev=>{if(o.suppressed?.())return;const edge=ev.target.closest('[data-relation-edge]');if(edge){ev.stopImmediatePropagation();edgeClick(edge.dataset.relationEdge);return}const b=ev.target.closest('[data-item]');if(b&&o.enabled?.()!==false){ev.stopImmediatePropagation();const id=b.dataset.item;if(focus===id){o.onDetail(id);return}const prior=neighbors().find(r=>r.from===id||r.to===id);select(id,prior||'');return}if(!ev.target.closest('button,[data-card]'))clear()},true);
 canvas.addEventListener('keydown',ev=>{const edge=ev.target.closest('[data-relation-edge]');if(edge&&['Enter',' '].includes(ev.key)){ev.preventDefault();ev.stopPropagation();edgeClick(edge.dataset.relationEdge)}});
 dock.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;if(b.hasAttribute('data-focus-clear'))clear();else if(b.hasAttribute('data-focus-detail'))o.onDetail(focus);else if(b.hasAttribute('data-focus-enter')){o.onEnter(focus);clear()}else if(b.dataset.focusNeighbor){const edge=neighbors().find(r=>r.id===b.dataset.edge);select(b.dataset.focusNeighbor,edge||'')}});
 return {draw,clear,select,get focused(){return focus}};
}
