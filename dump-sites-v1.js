/* Marhan Filo - quick dump site choices v1 */
(function(){
 const q=s=>document.querySelector(s);
 const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 function norm(v){return String(v||'').trim().toLocaleLowerCase('tr-TR')}
 function enhance(){
  const input=q('#mhD'),box=q('#mh');
  if(!input||!box||input.dataset.dumpSitesReady)return;
  input.dataset.dumpSitesReady='1';
  const currentSiteId=(()=>{try{const title=q('.mhTitle')?.textContent||'';const s=(typeof S!=='undefined'?S:[]).find(x=>title.includes(x.ad));return s?.id}catch(e){return null}})();
  let names=[];
  try{
   const rows=(typeof T!=='undefined'?T:[]).filter(x=>!currentSiteId||String(x.santiye_id)===String(currentSiteId));
   names=[...new Set(rows.map(x=>String(x.dokum_yeri||'').trim()).filter(Boolean))];
  }catch(e){}
  ['Boğazköy','Cebeci'].forEach(x=>{if(!names.some(n=>norm(n)===norm(x)))names.push(x)});
  const wrap=document.createElement('div');wrap.className='mhDumpQuick';wrap.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin:-4px 0 12px';
  wrap.innerHTML=names.map(x=>'<button type="button" class="mhDumpChoice" data-value="'+esc(x)+'" style="width:auto!important;margin:0!important;padding:9px 13px!important;background:#303944!important;border:1px solid #4b5865!important;color:#fff!important;border-radius:11px!important;font-weight:700">'+esc(x)+'</button>').join('');
  input.insertAdjacentElement('afterend',wrap);
  wrap.querySelectorAll('.mhDumpChoice').forEach(b=>b.onclick=()=>{input.value=b.dataset.value;input.dispatchEvent(new Event('input',{bubbles:true}))});
 }
 new MutationObserver(enhance).observe(document.documentElement,{childList:true,subtree:true});enhance();
})();