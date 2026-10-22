/* Marhan Excel export v1 - Sefer / Yakit / Tamir raporlari */
(function(){
  const q=s=>document.querySelector(s);
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const n=v=>v==null||v===''?'':Number(v);
  let xlsxPromise=null;
  function loadXLSX(){
    if(window.XLSX)return Promise.resolve(window.XLSX);
    if(xlsxPromise)return xlsxPromise;
    xlsxPromise=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';s.onload=()=>window.XLSX?resolve(window.XLSX):reject(new Error('Excel kütüphanesi açılamadı.'));s.onerror=()=>reject(new Error('Excel kütüphanesi indirilemedi. İnternet bağlantısını kontrol et.'));document.head.appendChild(s)});
    return xlsxPromise;
  }
  function dateOK(v,a,b){const d=String(v||'').slice(0,10);return(!a||d>=a)&&(!b||d<=b)}
  async function allRows(table,order='id'){
    const out=[];let from=0;const size=1000;
    while(true){const r=await db.from(table).select('*').order(order,{ascending:true}).range(from,from+size-1);if(r.error)throw r.error;const rows=r.data||[];out.push(...rows);if(rows.length<size)break;from+=size;if(from>100000)throw new Error('Rapor 100.000 kaydı geçti. Tarih aralığını daralt.')}
    return out;
  }
  function maps(rows,key='id',label='ad'){return new Map(rows.map(x=>[String(x[key]),x[label]||'']))}
  async function getData(from,to){
    const [v,s,ys,tr,fu,ba,pa]=await Promise.all([allRows('araclar'),allRows('santiyeler'),allRows('yakit_santiyeleri'),allRows('seferler'),allRows('yakitlar'),allRows('bakimlar'),allRows('parcalar')]);
    const vm=maps(v,'id','plaka'),sm=maps(s),ym=maps(ys),partsByMaintenance=new Map();
    pa.forEach(p=>{if(!p.bakim_id)return;const k=String(p.bakim_id),a=partsByMaintenance.get(k)||[];a.push(p);partsByMaintenance.set(k,a)});
    return {
      trips:tr.filter(x=>dateOK(x.tarih,from,to)).map(x=>({'Tarih':x.tarih||'','Saat':x.saat||'','Plaka':x.plaka||vm.get(String(x.arac_id))||'','Şantiye':sm.get(String(x.santiye_id))||'','Döküm Yeri':x.dokum_yeri||'','Sefer Sayısı':n(x.sefer_sayisi),'Malzeme':x.malzeme||'','Miktar':n(x.miktar),'Birim':x.birim||'','Birim Fiyat ₺':n(x.birim_fiyat),'Gelir ₺':n(x.gelir),'Yakıt Litre':n(x.yakit_litre),'Ödeme Türü':x.odeme_turu||'','Açıklama':x.aciklama||''})),
      fuel:fu.filter(x=>dateOK(x.tarih,from,to)).map(x=>({'Tarih':x.tarih||'','Saat':x.saat||'','Plaka':vm.get(String(x.arac_id))||'','Yakıt Şantiyesi':ym.get(String(x.yakit_santiye_id))||sm.get(String(x.santiye_id))||'','Hareket':x.hareket||'','Litre':n(x.litre),'Tutar ₺':n(x.tutar),'KM / Saat':n(x.km_saat),'Açıklama':x.aciklama||''})),
      repairs:ba.filter(x=>dateOK(x.tarih,from,to)).map(x=>{const pp=partsByMaintenance.get(String(x.id))||[];return {'Tarih':x.tarih||'','Plaka':vm.get(String(x.arac_id))||'','KM / Saat':n(x.km_saat),'Bakım Türü':x.bakim_turu||'','Yapılan İşlem':x.yapilan_islem||'','Kullanılan Parçalar':pp.map(p=>(p.parca_adi||'')+(p.adet?' x'+p.adet:'')).filter(Boolean).join(', '),'Parça Toplam ₺':pp.reduce((a,p)=>a+Number(p.toplam_fiyat||0),0),'Servis / Usta':x.servis_usta||'','Sonraki Bakım':n(x.sonraki_bakim),'Maliyet ₺':n(x.maliyet),'Açıklama':x.aciklama||''}}
      )
    };
  }
  function sheet(X,rows){const ws=X.utils.json_to_sheet(rows.length?rows:[{'Bilgi':'Bu tarih aralığında kayıt yok.'}]);ws['!cols']=Object.keys(rows[0]||{'Bilgi':''}).map(k=>({wch:Math.min(42,Math.max(12,k.length+4))}));return ws}
  function save(X,type,data,from,to){const wb=X.utils.book_new();if(type==='trips'||type==='all')X.utils.book_append_sheet(wb,sheet(X,data.trips),'Seferler');if(type==='fuel'||type==='all')X.utils.book_append_sheet(wb,sheet(X,data.fuel),'Yakıt');if(type==='repairs'||type==='all')X.utils.book_append_sheet(wb,sheet(X,data.repairs),'Tamir-Bakım');const names={trips:'Seferler',fuel:'Yakit',repairs:'Tamir-Bakim',all:'Marhan-Filo'};const range=(from||to)?'-'+(from||'baslangic')+'-'+(to||'bugun'):'';X.writeFile(wb,names[type]+range+'.xlsx',{compression:true})}
  async function run(type){const st=q('#mhExcelStatus'),from=q('#mhExcelFrom')?.value||'',to=q('#mhExcelTo')?.value||'';if(from&&to&&from>to){st.textContent='Başlangıç tarihi bitiş tarihinden sonra olamaz.';return}const buttons=[...document.querySelectorAll('[data-mh-excel]')];buttons.forEach(b=>b.disabled=true);st.textContent='Excel hazırlanıyor…';try{const [X,data]=await Promise.all([loadXLSX(),getData(from,to)]);save(X,type,data,from,to);st.textContent='✓ Excel hazırlandı. Sefer: '+data.trips.length+' • Yakıt: '+data.fuel.length+' • Tamir: '+data.repairs.length}catch(e){console.error(e);st.textContent='Excel oluşturulamadı: '+(e.message||e)}finally{buttons.forEach(b=>b.disabled=false)}}
  function mount(){const card=q('#reportsPage .card');if(!card||q('#mhExcelBox'))return;const box=document.createElement('div');box.id='mhExcelBox';box.innerHTML='<hr style="border:0;border-top:1px solid #303841;margin:18px 0"><h3>📊 Excel Raporları</h3><p class="muted">Tarih aralığını boş bırakırsan tüm kayıtlar aktarılır.</p><div class="row"><div><label class="muted">Başlangıç</label><input id="mhExcelFrom" type="date"></div><div><label class="muted">Bitiş</label><input id="mhExcelTo" type="date"></div></div><div class="grid"><button data-mh-excel="trips">Seferleri Excel’e Aktar</button><button data-mh-excel="fuel">Yakıtı Excel’e Aktar</button><button data-mh-excel="repairs">Tamir / Bakımı Aktar</button><button data-mh-excel="all">Tümünü Tek Excel’e Aktar</button></div><div id="mhExcelStatus" class="muted" style="margin-top:10px"></div>';card.appendChild(box);box.querySelectorAll('[data-mh-excel]').forEach(b=>b.onclick=()=>run(b.dataset.mhExcel))}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();new MutationObserver(mount).observe(document.documentElement,{childList:true,subtree:true});
})();
