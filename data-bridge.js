/* Marhan Filo data bridge v2.
   Eski sites/trips kopyalari kaldirildi. Sefer/yakit/tamir ekranlarinin tek veri
   kaynagi ilgili ekranin Supabase sorgusudur. Bu dosya artik ikinci bir cache
   olusturmaz ve eski kayitlarin yeni ekranlara karismasini engeller. */
(function(){
  window.refreshMarhanDashboardData = async function(){
    try{
      if(typeof window.MarhanDataRefresh === 'function'){
        return await window.MarhanDataRefresh();
      }
      return true;
    }catch(e){
      console.error('Marhan merkezi veri yenileme hatasi',e);
      return false;
    }
  };
})();
