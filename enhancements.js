/* Marhan compatibility + safe site management layer.
   home-v2.js owns operations UI/navigation. This file only provides mount points
   and independent edit/delete controls for Trip Sites and Fuel Sites. */
(function(){
  window.MARHAN_LEGACY_ENHANCEMENTS_DISABLED = true;

  function ensureMounts(){
    const home=document.querySelector('#homePage');
    if(home && !document.querySelector('#homeSplit')){
      const mount=document.createElement('div');
      mount.id='homeSplit';
      home.prepend(mount);
    }
    const app=document.querySelector('#appView');
    if(app && !document.querySelector('#operationsPage')){
      const page=document.createElement('section');
      page.id='operationsPage';
      page.className='page hidden';
      app.appendChild(page);
    }
  }

  let selected=null;
  function currentType(){
    const h=document.querySelector('#operationsPage h2')?.textContent||'';
    return h.includes('Yakıt')?'fuel':h.includes('Şantiye')?'trip':null;
  }
  function tableFor(type){return type==='fuel'?'yakit_santiyeleri':'santiyeler'}
  function labelFor(type){return type==='fuel'?'Yakıt şantiyesi':'Şantiye'}

  document.addEventListener('click',function(e){
    const b=e.target.closest?.('.mhSite[data-id]');
    if(!b)return;
    const type=currentType();
    if(type) selected={type,id:b.dataset.id};
  },true);

  async function editSelected(){
    if(!selected)return;
    const title=document.querySelector('#mh .mhTitle');
    const oldName=(title?.textContent||'').trim();
    const name=prompt(labelFor(selected.type)+' adını düzelt:',oldName);
    if(name===null)return;
    const clean=name.trim();
    if(!clean){alert('Şantiye adı boş olamaz.');return}
    const r=await db.from(tableFor(selected.type)).update({ad:clean}).eq('id',Number(selected.id));
    if(r.error){alert('Düzenlenemedi: '+r.error.message);return}
    alert('✓ Şantiye adı güncellendi.');
    location.reload();
  }

  async function deleteSelected(){
    if(!selected)return;
    const name=(document.querySelector('#mh .mhTitle')?.textContent||labelFor(selected.type)).trim();
    if(!confirm('“'+name+'” silinsin mi?\n\nŞantiye ve Yakıt listeleri birbirinden ayrıdır; bu işlem yalnızca bu listedeki kaydı siler.'))return;
    const r=await db.from(tableFor(selected.type)).delete().eq('id',Number(selected.id));
    if(r.error){
      alert('Silinemedi. Bu şantiyeye bağlı eski kayıtlar olabilir. Geçmiş kayıtların kaybolmaması için silme durduruldu.\n\n'+r.error.message);
      return;
    }
    alert('✓ Şantiye silindi.');
    location.reload();
  }

  function injectManage(){
    const w=document.querySelector('#mh');
    if(!w||!selected||document.querySelector('#mhSiteManage'))return;
    const type=currentType();
    if(type!==selected.type)return;
    const actions=w.querySelector('.mhActions');
    const title=w.querySelector('.mhTitle');
    if(!actions||!title)return;
    const bar=document.createElement('div');
    bar.id='mhSiteManage';
    bar.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px';
    bar.innerHTML='<button id="mhSiteEdit" class="secondary">✏️ Adı Düzenle</button><button id="mhSiteDelete" style="background:#5b2424;color:#fff">🗑️ Şantiyeyi Sil</button>';
    actions.insertAdjacentElement('afterend',bar);
    document.querySelector('#mhSiteEdit').onclick=editSelected;
    document.querySelector('#mhSiteDelete').onclick=deleteSelected;
  }

  ensureMounts();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',ensureMounts,{once:true});
  const obs=new MutationObserver(()=>{ensureMounts();injectManage()});
  obs.observe(document.documentElement,{childList:true,subtree:true});
})();
