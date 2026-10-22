/* Marhan password recovery/change UI. */
(function(){
  function addPanel(host,recovery){
    if(!host||host.querySelector('#mhPasswordPanel'))return;
    const box=document.createElement('div');box.id='mhPasswordPanel';box.className='notice';
    const title=document.createElement('b');title.textContent=recovery?'Yeni şifre belirle':'Şifre değiştir';
    const p1=document.createElement('input');p1.type='password';p1.autocomplete='new-password';p1.placeholder='Yeni şifre (en az 8 karakter)';
    const p2=document.createElement('input');p2.type='password';p2.autocomplete='new-password';p2.placeholder='Yeni şifre tekrar';
    const button=document.createElement('button');button.textContent='Şifreyi Kaydet';
    const status=document.createElement('div');status.className='muted';
    box.append(title,p1,p2,button,status);host.appendChild(box);
    button.onclick=async()=>{if(button.disabled)return;if(p1.value.length<8){status.textContent='Şifre en az 8 karakter olmalı.';return}if(p1.value!==p2.value){status.textContent='Şifreler aynı değil.';return}button.disabled=true;button.textContent='Kaydediliyor...';const r=await db.auth.updateUser({password:p1.value});button.disabled=false;button.textContent='Şifreyi Kaydet';if(r.error){status.textContent='Şifre değiştirilemedi: '+r.error.message;return}status.textContent='✓ Şifre başarıyla değiştirildi.';p1.value='';p2.value='';if(recovery)setTimeout(()=>location.replace(location.origin+location.pathname),900)};
  }
  function settings(){addPanel(document.querySelector('#settingsPage .card'),false)}
  db.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY'){document.getElementById('appView')?.classList.add('hidden');document.getElementById('authView')?.classList.remove('hidden');addPanel(document.getElementById('authView'),true)}});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',settings,{once:true});else settings();
  const obs=new MutationObserver(settings);obs.observe(document.documentElement,{childList:true,subtree:true});
})();
