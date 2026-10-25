/* Marhan Filo - quick trip entry helpers v2 */
(function(){
 const q=s=>document.querySelector(s);
 const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 function norm(v){return String(v||'').trim().toLocaleLowerCase('tr-TR')}
 function formatPlate(v){
  const s=String(v||'').toLocaleUpperCase('tr-TR').replace(/[^0-9A-ZÇĞİÖŞÜ]/g,'');
  const m=s.match(/^(\d{1,2})([A-ZÇĞİÖŞÜ]{1,3})(\d{1,4})$/);
  return m?m.slice(1).join(' '):s;
 }
 function enhance(){
  const input=q('#mhD'),box=q('#mh'),plate=q('#mhP'),msg=q('#mhMsg');
  if(!input||!box)return;
  if(!input.dataset.dumpSitesReady){
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
  if(plate&&!plate.dataset.plateFormatReady){
   plate.dataset.plateFormatReady='1';
   const apply=()=>{const f=formatPlate(plate.value);if(f!==plate.value)plate.value=f};
   plate.addEventListener('input',apply);plate.addEventListener('blur',apply);
  }
  if(msg&&!msg.dataset.tripSuccessReady){
   msg.dataset.tripSuccessReady='1';
   new MutationObserver(()=>{
    if(!msg.textContent.includes('✓ 1 sefer kaydedildi.'))return;
    const p=q('#mhP'),d=q('#mhD'),n=q('#mhNote');
    if(p)p.value='';if(n)n.value='';
    if(p)p.focus();
    if(!q('#mhAfterSave')){
     const actions=document.createElement('div');actions.id='mhAfterSave';actions.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px';
     actions.innerHTML='<button type="button" id="mhAnother" class="secondary">＋ Yeni Sefer</button><button type="button" id="mhShowTrips" class="secondary">📊 Seferleri Gör</button>';
     msg.insertAdjacentElement('afterend',actions);
     q('#mhAnother').onclick=()=>{if(p)p.focus()};
     q('#mhShowTrips').onclick=()=>{const ctl=[...document.querySelectorAll('button')].find(b=>/Durumu Gör|Kontrol Et/.test(b.textContent));if(ctl)ctl.click();else history.back()};
    }
   }).observe(msg,{childList:true,subtree:true,characterData:true});
  }
 }
 new MutationObserver(enhance).observe(document.documentElement,{childList:true,subtree:true});enhance();
})();