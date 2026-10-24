/* Marhan Filo - System Health Console v1 */
(function(){
const q=s=>document.querySelector(s), esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const TABLES=[['araclar','Araçlar'],['santiyeler','Şantiyeler'],['seferler','Seferler'],['yakit_santiyeleri','Yakıt Şantiyeleri'],['yakitlar','Yakıt'],['bakimlar','Bakımlar'],['stok_urunleri','Stok'],['lastikler','Lastikler'],['parcalar','Parça / Yağ'],['gelir_giderler','Masraflar']];
async function scan(){
 const out={tables:{},warnings:[],errors:[],time:new Date()};
 for(const [table,label] of TABLES){
  const r=await db.from(table).select('*');
  if(r.error){out.errors.push(label+': '+r.error.message);continue}
  out.tables[table]=r.data||[];
 }
 const t=out.tables;
 const ids=(name)=>new Set((t[name]||[]).map(x=>String(x.id)));
 const vehicleIds=ids('araclar'), siteIds=ids('santiyeler'), fuelSiteIds=ids('yakit_santiyeleri');
 (t.seferler||[]).forEach(x=>{if(x.santiye_id!=null&&!siteIds.has(String(x.santiye_id)))out.warnings.push('Şantiyesi bulunmayan sefer #'+x.id);if(!x.plaka&&x.arac_id!=null&&!vehicleIds.has(String(x.arac_id)))out.warnings.push('Aracı bulunmayan sefer #'+x.id)});
 (t.yakitlar||[]).forEach(x=>{if(x.yakit_santiye_id!=null&&!fuelSiteIds.has(String(x.yakit_santiye_id)))out.warnings.push('Yakıt şantiyesi bulunmayan yakıt #'+x.id);if(x.arac_id!=null&&!vehicleIds.has(String(x.arac_id))&&!x.plaka)out.warnings.push('Aracı/plakası bulunmayan yakıt #'+x.id)});
 (t.stok_urunleri||[]).forEach(x=>{if(Number(x.stok||0)<0)out.warnings.push('Eksi stok: '+(x.urun_adi||('#'+x.id))+' ('+x.stok+')')});
 for(const name of ['bakimlar','lastikler','parcalar','gelir_giderler']) (t[name]||[]).forEach(x=>{if(x.arac_id!=null&&!vehicleIds.has(String(x.arac_id)))out.warnings.push(name+' #'+x.id+' için araç bulunamadı')});
 return out;
}
function addPage(){
 const app=q('#appView'); if(!app||q('#healthPage'))return;
 const p=document.createElement('section');p.id='healthPage';p.className='page hidden';p.innerHTML='<button class="backBtn" data-health-back>← Geri</button><div class="card"><h2>🩺 Sistem Sağlığı</h2><p class="muted">Supabase kayıtlarını doğrudan tarar. Ekrandaki geçici listelere güvenmez.</p><button id="healthScan">Verileri Yeniden Tara</button><div id="healthResult" style="margin-top:12px"></div></div>';app.appendChild(p);
 p.querySelector('[data-health-back]').onclick=()=>{if(typeof goBack==='function')goBack();else if(typeof renderPage==='function')renderPage('home')};
 q('#healthScan').onclick=render;
}
function addMenu(){const nav=q('#drawer .nav');if(!nav||q('#healthMenu'))return;const b=document.createElement('button');b.id='healthMenu';b.textContent='🩺 Sistem Sağlığı';const logout=q('#logout');nav.insertBefore(b,logout||null);b.onclick=()=>{if(typeof showPage==='function')showPage('health');render()}}
async function render(){addPage();const w=q('#healthResult');if(!w)return;w.innerHTML='<div class="notice">Taranıyor…</div>';const x=await scan();const cards=TABLES.map(([k,l])=>'<div class="box"><div class="num">'+((x.tables[k]||[]).length)+'</div><div class="muted">'+esc(l)+'</div></div>').join('');const warns=x.warnings.length?x.warnings.map(v=>'<div class="notice bad">⚠ '+esc(v)+'</div>').join(''):'<div class="notice ok">✓ Bağlantılı kayıt kontrollerinde sorun bulunmadı.</div>';const errs=x.errors.length?x.errors.map(v=>'<div class="notice bad">✕ '+esc(v)+'</div>').join(''):'';w.innerHTML='<div class="muted">Son tarama: '+x.time.toLocaleString('tr-TR')+'</div><div class="grid">'+cards+'</div><h3>Tutarlılık Kontrolü</h3>'+warns+errs+'<div class="notice">Not: Bu ekran doğrudan Supabase sayımlarını gösterir. Uygulamadaki başka bir ekran farklı sayı gösteriyorsa o ekranın eski/geçici veri kullandığını anlayabiliriz.</div>'}
function init(){addPage();addMenu()}
new MutationObserver(init).observe(document.documentElement,{childList:true,subtree:true});setTimeout(init,300);setTimeout(init,1200);
window.marhanHealthScan=scan;
})();