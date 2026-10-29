// UI wiring for index.html (needs engine.js loaded first).
(function(){
const $=id=>document.getElementById(id),ex=new Set();let run=null;
function render(){const {rows,mv,def}=run,tbody=$('tb').querySelector('tbody'),best=Math.min(...rows.map(r=>r.s?r.c:99)),key=r=>r.s?Math.round(r.c*1e6):1e12,sp='<span style="width:30px;flex:none"></span>',fx='<div style="display:flex;gap:8px;align-items:flex-start">';
 tbody.innerHTML=rows.slice().sort((a,b)=>key(a)-key(b)||a.id-b.id).map(r=>{
  const L=r.on?r.p:r.s,hi=r.s&&Math.abs(r.c-best)<1e-9;let len='–',sol;
  if(!r.s)sol='(none ≤ 16)';
  else{const bp='<button data-p="'+r.id+'" title="Optimal +1 solutions" style="width:34px;height:26px;padding:0;flex:none;font-size:12px'+(r.on?';background:var(--ac);color:#fff;border-color:var(--ac)':'')+'">+1</button>';
   if(!L)sol=fx+bp+sp+'<div>no +1 solutions found</div></div>';
   else{const rd=v=>Math.round(v*1e6)/1e6,z=def?L[0].length:rd(CPFB.solCost(run.h,L[0],run.opt.cost)),xl=r.lc===undefined?undefined:rd(r.on?r.lc+1:r.lc);len=xl===undefined?(def?z:z+' ('+L[0].length+')'):xl+'+'+rd(z-xl)+'='+z+(def?'':' ('+L[0].length+')');
    sol=fx+bp+(L.length>1?'<button data-i="'+r.id+'" title="'+L.length+(L.capped?'+':'')+' equally good solutions" aria-label="Show all equally good solutions" style="width:30px;height:26px;padding:0;flex:none">'+(ex.has(r.id)?'▴':'▾')+'</button>':sp)+'<div><div>'+L[0].map(m=>mv[m].name).join(' ')+'</div>'+(L.length>1?'<div'+(ex.has(r.id)?'':' hidden')+'>'+L.slice(1).map(x=>x.map(m=>mv[m].name).join(' ')).join('<br>')+'</div>':'')+'</div></div>'}}
  return '<tr'+(hi?' class="b"':'')+'><td>'+r.o.top+' / '+r.o.front+'</td><td>'+r.o.corner+'</td><td>'+len+'</td><td class="m">'+sol+'</td></tr>'}).join('')}
$('tb').onclick=async e=>{const b=e.target.closest&&e.target.closest('button[data-i],button[data-p]');if(!b||!run)return;
 if(b.dataset.i!==undefined){const i=+b.dataset.i;ex.has(i)?ex.delete(i):ex.add(i);render();return}
 const id=+b.dataset.p,r=run.rows.find(x=>x.id===id);ex.delete(id);
 if(r.on){r.on=false;render();return}
 if(r.p===undefined){const st=$('st');st.textContent='Searching +1 …';await new Promise(q=>setTimeout(q,30));r.p=CPFB.solve(r.o,16,true,20000,Object.assign({},run.opt,run.opt.lineOpt?{plusLine:true}:{plus:{cost:r.c,F:r.s.fcount}}));st.textContent=''}
 r.on=true;render()};
$('rnd').onclick=async()=>{const st=$('st');$('rnd').disabled=true;st.textContent='Generating …';await new Promise(r=>setTimeout(r,30));$('sc').value=CPFB.randScramble();st.textContent='';$('rnd').disabled=false};
$('go').onclick=async()=>{const ms=CPFB.parse($('sc').value),st=$('st'),tb=$('tb');
 if(!ms){st.textContent="Invalid scramble. Use U R F D L B with ' or 2.";return}
 const h=$('hand').value,g3=p=>['1','2','3'].map(k=>{const v=parseFloat($(p+k).value);return isFinite(v)?Math.max(0.25,v):1}),cs={S:g3('cs'),Uw:g3('cu'),M:g3('cm')},def=[].concat(cs.S,cs.Uw,cs.M).every(v=>v===1);
 $('go').disabled=true;tb.hidden=true;st.textContent='Building tables (first run only) …';
 await new Promise(r=>setTimeout(r,30));CPFB.hand(h);
 const os=CPFB.orients(CPFB.scrState(ms),h,+$('ud').value),mv=CPFB.hand(h).mv,opt={fewF:$('minf').checked,noM:$('nom').checked,noCP:$('nocp').checked,lineOpt:$('lineopt').checked,cost:cs},cap=opt.fewF?20000:300;
 run={rows:[],mv,def,opt,h};ex.clear();tb.querySelector('tbody').innerHTML='';tb.hidden=false;
 for(let i=0;i<os.length;i++){st.textContent='Solving orientation '+(i+1)+' / '+os.length+' …';await new Promise(r=>setTimeout(r,30));
  const o=os[i],s=CPFB.solve(o,16,true,cap,opt);run.rows.push({o,s,id:i,c:s?CPFB.solCost(h,s[0],cs):0,lc:opt.lineOpt&&s?CPFB.lineCost(o,opt):undefined});render()}
 st.textContent='';$('go').disabled=false};
})();
