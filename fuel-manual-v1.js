/* Marhan Filo - yakit girisinde manuel plaka destegi */
(function(){
  function q(s){return document.querySelector(s)}
  function upper(v){return String(v||'').trim().toLocaleUpperCase('tr-TR').replace(/\s+/g,' ')}
  function enhance(){
    const save=q('#mhFS'), wrap=q('#mhVehicleWrap');
    if(!save||!wrap||save.dataset.manualFuelReady)return;
    save.dataset.manualFuelReady='1';
    const box=document.createElement('div');
    box.id='mhManualFuelWrap';
    box.innerHTML='<div class="mhHint" style="margin-top:8px">Araç listede yoksa aşağıya plaka / makine no yaz.</div><input id="mhFManual" autocomplete="off" autocapitalize="characters" placeholder="Manuel plaka / makine no (örn. 34 ABC 123)">';
    wrap.appendChild(box);
    const input=q('#mhFManual');
    input.oninput=e=>e.target.value=e.target.value.toLocaleUpperCase('tr-TR');

    save.addEventListener('click',async function(e){
      const mode=q('#mhFM')?.value;
      const manual=upper(q('#mhFManual')?.value);
      const veh=q('#mhFV')?.value||'';
      if(mode!=='giden'||!manual||veh)return; // normal akisi kullan
      e.preventDefault();e.stopImmediatePropagation();
      const lit=Number(q('#mhFL')?.value||0);
      const msg=q('#mhFMsg');
      if(lit<=0){if(msg)msg.textContent='Litre gir.';return}
      save.disabled=true;const old=save.textContent;save.textContent='Kaydediliyor...';
      try{
        const r=await db.from('yakitlar').insert({
          tarih:q('#mhFD')?.value,
          saat:q('#mhFT')?.value||null,
          hareket:'giden',
          yakit_santiye_id:Number((window.__mhFuelSiteId)||0)||null,
          santiye_id:null,
          arac_id:null,
          plaka:manual,
          litre:lit,
          tutar:q('#mhFA')?.value?Number(q('#mhFA').value):0,
          aciklama:q('#mhFN')?.value.trim()||null
        });
        if(r.error){if(msg)msg.textContent='Kaydedilemedi: '+r.error.message;return}
        if(msg)msg.textContent='✓ Yakıt '+manual+' için kaydedildi.';
        q('#mhFL').value='';q('#mhFA').value='';q('#mhFN').value='';q('#mhFManual').value='';
      } finally {save.disabled=false;save.textContent=old}
    },true);
  }
  // Aktif yakit santiyesi kimligini mevcut ekrandaki kayit akisi icin yakala.
  document.addEventListener('click',function(e){
    const site=e.target.closest?.('.mhSite[data-id]');
    const heading=document.querySelector('#operationsPage h2')?.textContent||'';
    if(site&&heading.includes('Yakıt'))window.__mhFuelSiteId=site.dataset.id;
  },true);
  new MutationObserver(enhance).observe(document.documentElement,{childList:true,subtree:true});
  enhance();
})();