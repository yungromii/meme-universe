import {visibleRelations} from './map-relations.js?v=20261103-themes-only';
export function createRelationMap(o){
 const canvas=o.canvas,board=o.board,dock=document.createElement('div');dock.className='relation-focus';dock.hidden=true;dock.setAttribute('aria-live','polite');canvas.parentElement.append(dock);
 let focus=null,detailOpen=false;
 const en=()=>o.lang()==='en',e=o.escape,t=(ko,english)=>en()?english:ko;
 const edges=()=>visibleRelations(o.items(),o.relations(),o.mapId(),o.visible().map(r=>r.id),o.defs?.()||{},o.layout());
 const get=id=>o.items().find(r=>r.id===id&&!r.deleted);
 function select(id){if(!get(id))return;focus=id;draw()}
 function clear(){focus=null;draw()}
 function draw(){
  const visible=o.visible(),enabled=o.enabled?.()!==false;
  if(!visible.some(r=>r.id===focus)||!enabled)focus=null;
  const connections=enabled?edges():[],connected=connections.filter(r=>r.from===focus||r.to===focus),ids=new Set(connected.flatMap(r=>[r.from,r.to]));
  board.querySelectorAll('[data-card]').forEach(card=>{card.classList.toggle('relation-selected',card.dataset.card===focus);card.classList.toggle('relation-neighbor',card.dataset.card!==focus&&ids.has(card.dataset.card));card.querySelector('[data-item]')?.setAttribute('aria-pressed',String(card.dataset.card===focus))});
  let svg=board.querySelector('.map-links');if(!svg){svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('map-links');board.prepend(svg)}svg.setAttribute('aria-hidden','true');
  svg.innerHTML=connections.map(r=>{const p=o.layout().get(r.from),q=o.layout().get(r.to);return p&&q?`<line class="relation-line${r.auto?' auto-link':''}${r.from===focus||r.to===focus?' is-active':''}" x1="${p.x+p.w/2}" y1="${p.y+p.h/2}" x2="${q.x+q.w/2}" y2="${q.y+q.h/2}"/>`:''}).join('');
  dock.hidden=!focus||o.view()!=='scatter'||detailOpen;if(dock.hidden)return;const r=get(focus);if(!r)return;
  dock.innerHTML=`<div class="relation-focus-heading"><strong data-no-translate>${e(o.name(r))}</strong><button data-focus-detail>${e(t('정보','Info'))}</button>${o.items().some(v=>!v.deleted&&v.parentId===r.id)?`<button data-focus-enter>${e(t('내부 지도','Inner map'))} ↗</button>`:''}<button data-focus-clear aria-label="${e(t('선택 해제','Clear selection'))}">×</button></div>${connected.length?`<div class="relation-neighbors">${connected.map(edge=>{const other=edge.from===focus?edge.to:edge.from;return `<button data-focus-neighbor="${e(other)}"><b data-no-translate>${e(o.name(get(other)))}</b></button>`}).join('')}</div>`:''}`;
 }
 canvas.addEventListener('click',ev=>{if(o.suppressed?.())return;const b=ev.target.closest('[data-item]');if(b&&o.enabled?.()!==false){ev.stopImmediatePropagation();const id=b.dataset.item;if(focus===id){o.onDetail(id);return}select(id);return}if(!ev.target.closest('button,[data-card]'))clear()},true);
 dock.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;if(b.hasAttribute('data-focus-clear'))clear();else if(b.hasAttribute('data-focus-detail'))o.onDetail(focus);else if(b.hasAttribute('data-focus-enter')){o.onEnter(focus);clear()}else if(b.dataset.focusNeighbor)select(b.dataset.focusNeighbor)});
 return {draw,clear,select,setDetailOpen(value){detailOpen=!!value;draw()},get focused(){return focus}};
}
