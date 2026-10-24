/* Marhan Filo - yakit manuel giris v2: aktif yakit santiyesi kesin baglanir */
(function(){
  function q(s){return document.querySelector(s)}
  function upper(v){return String(v||'').trim().toLocaleUpperCase('tr-TR').replace(/\s+/g,' ')}
  function enhance(){
    const save=q('#mhFS'),wrap=q('#mhVehicleWrap');
    if(!save||!wrap||save.dataset.manualFuelReady)return;
    save.dataset.manualFuelReady='1';
    const activeId=save.dataset.fuelSiteId||q('#mh')?.dataset?.fuelSiteId||'';
    if(activeId) window.__mhFuelSiteId=activeId;
    const box=document.createElement('div');
    box.id='mhManualFuelWrap';
    box.innerHTML='<div class="mhHint" style="margin-top:8px">Araç listede yoksa aşağıya plaka / makine no yaz.</div><input id="mhFManual" autocomplete="off" autocapitalize="characters" placeholder="Manuel plaka / makine no (örn. 34 ABC 123)">';
    wrap.appendChild(box);
    q('#mhFManual').oninput=e=>e.target.value=e.target.value.toLocaleUpperCase('tr-TR');
    save.addEventListener('click',async function(e){
      const mode=q('#mhFM')?.value,manual=upper(q('#mhFManual')?.value),veh=q('#mhFV')?.value||'';
      if(mode!=='giden'||!manual||veh)return;
      e.preventDefault();e.stopImmediatePropagation();
      const lit=Number(q('#mhFL')?.value||0),msg=q('#mhFMsg');
      const siteId=Number(save.dataset.fuelSiteId||q('#mh')?.dataset?.fuelSiteId||window.__mhFuelSiteId||0);
      if(!siteId){if(msg)msg.textContent='Yakıt şantiyesi belirlenemedi. Ekranı kapatıp şantiyeyi yeniden seç.';return}
      if(lit<=0){if(msg)msg.textContent='Litre gir.';return}
      save.disabled=true;const old=save.textContent;save.textContent='Kaydediliyor...';
      try{
        const r=await db.from('yakitlar').insert({tarih:q('#mhFD')?.value,saat:q('#mhFT')?.value||null,hareket:'giden',yakit_santiye_id:siteId,santiye_id:null,arac_id:null,plaka:manual,litre:lit,tutar:q('#mhFA')?.value?Number(q('#mhFA').value):0,aciklama:q('#mhFN')?.value.trim()||null}).select('id,yakit_santiye_id').single();
        if(r.error)throw r.error;
        if(String(r.data?.yakit_santiye_id)!==String(siteId))throw new Error('Kayıt yanlış yakıt şantiyesine bağlandı.');
        if(msg)msg.textContent='✓ Yakıt '+manual+' için kaydedildi.';
        q('#mhFL').value='';q('#mhFA').value='';q('#mhFN').value='';q('#mhFManual').value='';
        if(typeof window.MarhanDataRefresh==='function')await window.MarhanDataRefresh();
      }catch(err){if(msg)msg.textContent='Kaydedilemedi: '+(err.message||err)}
      finally{save.disabled=false;save.textContent=old}
    },true);
  }
  new MutationObserver(enhance).observe(document.documentElement,{childList:true,subtree:true});
  enhance();
})();
