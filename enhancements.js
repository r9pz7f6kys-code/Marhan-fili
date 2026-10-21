/* Marhan compatibility shell v3
   Keeps the existing fleet data forms, but makes them visually consistent with
   the new operations dashboard. It intentionally does NOT create a second
   operations/navigation system. */
(function(){
  window.MARHAN_LEGACY_ENHANCEMENTS_DISABLED = true;
  const RELEASE='2026.10.22-1';
  document.documentElement.dataset.marhanRelease=RELEASE;

  const css=document.createElement('style');
  css.id='marhanUnifiedShell';
  css.textContent=`
    :root{--mh-gold:#f2b632;--mh-bg:#0c0e11;--mh-panel:#171b20;--mh-panel2:#222830;--mh-line:#36414c}
    body{background:var(--mh-bg)}
    header{position:sticky;top:0;z-index:35;background:#11161bcc;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
    main{padding-bottom:calc(24px + env(safe-area-inset-bottom))}
    .page>.backBtn{position:sticky;top:78px;z-index:20;width:auto!important;margin:0 0 12px!important;background:#29313a!important;color:#fff!important;border:1px solid #3c4650!important;box-shadow:0 8px 24px #0005}
    .page>.card{border-color:var(--mh-line);box-shadow:0 12px 30px #0002}
    .page>.card>h2{font-size:22px;margin-bottom:14px}
    input,select,textarea{min-height:48px;background:#101419;border-color:#3a4652}
    button{min-height:48px}
    .nav button{min-height:48px}
    .box{border:1px solid #333e49}
    #quickPage .grid button{min-height:72px;font-size:17px}
    #reportsPage .card:after{content:'Gelişmiş raporlama yeni sistemle birlikte genişletilecek.';display:block;margin-top:12px;color:#aeb6c0;font-size:13px}
    .mhRelease{font-size:10px;color:#77818c;margin-top:10px;text-align:center}
    @media(max-width:500px){header{padding-top:calc(10px + env(safe-area-inset-top))}.page>.backBtn{top:76px}.card{border-radius:16px}}
  `;
  document.head.appendChild(css);

  function stamp(){
    const drawer=document.querySelector('#drawer');
    if(drawer && !drawer.querySelector('.mhRelease')){
      const x=document.createElement('div');x.className='mhRelease';x.textContent='Marhan • '+RELEASE;drawer.appendChild(x);
    }
  }
  stamp();

  // Old installed iPhone versions can retain obsolete service-worker caches.
  // The app does not depend on a service worker, so stale registrations are removed safely.
  if('serviceWorker' in navigator){
    navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister())).catch(()=>{});
  }

  // Keep legacy forms as data-entry modules only. home-v2.js owns the dashboard,
  // Şantiye, Yakıt and Tamir entry routing; this file never adds competing handlers.
  window.MARHAN_UI_RELEASE=RELEASE;
})();
