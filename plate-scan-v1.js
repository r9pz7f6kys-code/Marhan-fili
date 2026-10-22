/* Marhan plaka OCR v4 - iPhone camera -> active trip plate input */
(function(){
let loading=null,busy=false;
function loadOCR(){if(window.Tesseract)return Promise.resolve();if(loading)return loading;loading=new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';s.onload=ok;s.onerror=()=>no(new Error('OCR yüklenemedi'));document.head.appendChild(s)});return loading}
function norm(s){return String(s||'').toLocaleUpperCase('tr-TR').replace(/İ/g,'I').replace(/[^A-Z0-9\s]/g,' ').replace(/\s+/g,' ').trim()}
function plateFrom(text){const c=norm(text).replace(/\s/g,'');const all=c.match(/(?:0[1-9]|[1-7][0-9]|8[01])[A-Z]{1,3}[0-9]{2,4}/g)||[];if(!all.length)return null;const p=all[0],city=p.slice(0,2),m=p.slice(2).match(/^([A-Z]{1,3})([0-9]{2,4})$/);return m?city+' '+m[1]+' '+m[2]:p}
function status(t){const e=document.querySelector('#mhScanM');if(e)e.textContent=t}
async function scan(file){if(!file||busy)return;const input=document.querySelector('#mhP');if(!input)return;busy=true;status('⏳ Fotoğraf alındı, plaka okunuyor…');try{await loadOCR();const r=await window.Tesseract.recognize(file,'eng',{logger:m=>{if(m.status==='recognizing text')status('⏳ Plaka okunuyor… %'+Math.round((m.progress||0)*100))}});const p=plateFrom(r?.data?.text);if(!p){status('Plaka net okunamadı. Tekrar çek veya manuel yaz.');return}input.value=p;input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));status('✓ Plaka bulundu: '+p);input.focus()}catch(e){console.error('Marhan OCR',e);status('Plaka okuma başlatılamadı. Tekrar dene.')}finally{busy=false}}
/* Capture phase is intentional: home-v2 assigns its own onchange later. */
document.addEventListener('change',function(e){if(e.target?.id!=='mhCam')return;const f=e.target.files?.[0];if(f)scan(f)},true);
/* Do not intercept the scan button. home-v2 opens the iPhone camera itself. */
})();