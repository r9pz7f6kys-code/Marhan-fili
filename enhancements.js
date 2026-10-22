/* Marhan mount-point compatibility layer.
   home-v2.js owns all operations UI and navigation. This file only guarantees
   the DOM targets it needs exist; it does not add competing handlers. */
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

  ensureMounts();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',ensureMounts,{once:true});
})();
