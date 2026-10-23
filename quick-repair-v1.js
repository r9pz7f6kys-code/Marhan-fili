/* Marhan Filo - Hızlı Tamir + Kayıt Silme */
(function () {
  const $ = s => document.querySelector(s);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));

  function V() {
    try { return vehicles || []; } catch(e) { return []; }
  }

  function norm(s) {
    return String(s || '')
      .toLocaleLowerCase('tr-TR')
      .replace(/[^a-z0-9çğıöşü\s]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function findVehicle(p) {
    let n = norm(p).replace(/\s/g, '');
    return V().find(v => norm(v.plaka).replace(/\s/g, '') === n);
  }

  function vehiclePlate(id) {
    let v = V().find(x => String(x.id) === String(id));
    return v?.plaka || '';
  }

  function lines(t) {
    return String(t || '').split(/\n|,|;/).map(x => x.trim()).filter(Boolean);
  }

  function style() {
    if ($('#qrStyle')) return;

    let s = document.createElement('style');
    s.id = 'qrStyle';
    s.textContent = `
      .qrHero{background:#20262d;border:1px solid #3b4651;border-radius:18px;padding:15px}
      .qrPlate{font-size:20px!important;font-weight:900;text-transform:uppercase}
      .qrText{min-height:190px!important;font-size:17px;line-height:1.45}
      .qrPreview{margin-top:12px}
      .qrItem{padding:11px 12px;margin:7px 0;background:#29313a;border-radius:12px}
      .qrWarn{color:#f2b632}
      .qrBack{width:auto!important;background:#29313a!important;color:#fff!important}
      .qrHelp{font-size:13px;color:#aeb6c0;line-height:1.45;margin:8px 0 13px}
      .qrDetail{margin-top:12px!important;background:#29313a!important;color:#fff!important}
      .deleteManager{background:#4c302d!important;color:#fff!important;margin-top:12px!important}
      .deleteRow{background:#252c34;border:1px solid #3b4651;border-radius:13px;padding:12px;margin:9px 0}
      .deleteRow b{font-size:17px}
      .deleteBtn{background:#762c2c!important;color:#fff!important;margin-top:9px!important}
    `;
    document.head.appendChild(s);
  }

  function render() {
    style();

    if (typeof showPage === 'function') showPage('operations');

    let p = $('#operationsPage');
    if (!p) return;

    p.innerHTML = `
      <button id="qrBack" class="qrBack">← Geri</button>

      <div class="card">
        <h2>⚡ Hızlı Tamir</h2>

        <div class="qrHero">
          <div class="qrHelp">
            <b>3 adım:</b> Plakayı seç → yapılan işlemleri yaz → kaydet.
          </div>

          <label>1. Araç / Plaka</label>

          <input
            id="qrPlate"
            class="qrPlate"
            list="qrVehicles"
            placeholder="34 DTH 844"
            autocomplete="off"
          >

          <datalist id="qrVehicles">
            ${V().map(v =>
              `<option value="${esc(v.plaka || '')}">
                ${esc((v.marka || '') + ' ' + (v.model || ''))}
              </option>`
            ).join('')}
          </datalist>

          <label>2. Yapılan işlemler</label>

          <textarea
            id="qrText"
            class="qrText"
            placeholder="Baskı balata değişti
Volant değişti
1 teneke şanzıman yağı değişti"
          ></textarea>

          <button id="qrPreview">👁 Kontrol Et</button>

          <div id="qrPreviewBox" class="qrPreview"></div>

          <button id="qrSave">✓ TAMİRİ KAYDET</button>

          <button id="qrRecords" class="deleteManager">
            🗑 Tamir Kayıtlarını Gör / Sil
          </button>

          <button id="qrDetail" class="qrDetail">
            ⚙ Detaylı Tamir Girişi
          </button>

          <div id="qrMsg" class="notice hidden"></div>
        </div>
      </div>
    `;

    $('#qrBack').onclick = () => renderPage('home');

    $('#qrPlate').oninput = e => {
      e.target.value = e.target.value.toLocaleUpperCase('tr-TR');
    };

    $('#qrPreview').onclick = preview;
    $('#qrSave').onclick = save;
    $('#qrRecords').onclick = () => openRecords('repair');

    $('#qrDetail').onclick = () => {
      if (window.marhanLegacyRepair) window.marhanLegacyRepair();
      else if (typeof showPage === 'function') showPage('maintenance');
    };
  }

  function preview() {
    let a = lines($('#qrText').value);
    let b = $('#qrPreviewBox');

    b.innerHTML = a.length
      ? '<div class="muted">Kaydedilecek işlemler:</div>' +
        a.map(x => `<div class="qrItem"><b>✓ ${esc(x)}</b></div>`).join('')
      : '<div class="qrWarn">Yapılan işlemleri yaz.</div>';
  }

  function message(t, ok) {
    let m = $('#qrMsg');
    m.className = 'notice ' + (ok ? 'ok' : 'bad');
    m.textContent = t;
  }

  async function save() {
    let plate = $('#qrPlate').value
      .trim()
      .toLocaleUpperCase('tr-TR');

    let text = $('#qrText').value.trim();
    let v = findVehicle(plate);

    if (!plate)
      return message('Önce plaka seç veya yaz.', false);

    if (!v)
      return message('Bu plaka Araçlar / Makineler listesinde bulunamadı.', false);

    if (!text)
      return message('Yapılan işlemleri yaz.', false);

    let b = $('#qrSave');
    b.disabled = true;
    b.textContent = 'Kaydediliyor...';

    try {
      let d = new Date();

      let date =
        d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0');

      let r = await db.from('bakimlar').insert({
        arac_id: Number(v.id),
        tarih: date,
        bakim_turu: 'Hızlı Tamir',
        km_saat: v.guncel_deger ?? null,
        yapilan_islem: text,
        servis_usta:
          typeof currentEmail !== 'undefined'
            ? currentEmail
            : null,
        aciklama: 'Hızlı Tamir ekranından girildi'
      });

      if (r.error) throw r.error;

      message('✓ ' + plate + ' tamir kaydı başarıyla kaydedildi.', true);

      $('#qrText').value = '';
      $('#qrPreviewBox').innerHTML = '';

      if (typeof load === 'function') await load();

    } catch(e) {
      message('Kaydedilemedi: ' + (e.message || e), false);

    } finally {
      b.disabled = false;
      b.textContent = '✓ TAMİRİ KAYDET';
    }
  }

  async function openRecords(kind) {
    style();

    const cfg = {
      trip: ['seferler', 'Sefer'],
      fuel: ['yakitlar', 'Yakıt'],
      repair: ['bakimlar', 'Tamir']
    }[kind];

    if (!cfg) return;

    let r = await db
      .from(cfg[0])
      .select('*')
      .order('id', { ascending: false })
      .limit(100);

    if (r.error) {
      alert('Kayıtlar alınamadı: ' + r.error.message);
      return;
    }

    let old = $('#recordManager');

    if (old) old.remove();

    let box = document.createElement('div');

    box.id = 'recordManager';

    box.style.cssText =
      'position:fixed;z-index:9999;inset:0;background:#000d;overflow:auto;padding:18px';

    let rows = (r.data || []).map(x => {

      let name =
        x.plaka ||
        vehiclePlate(x.arac_id) ||
        cfg[1];

      let info = [
        x.tarih,
        x.saat,
        x.dokum_yeri,
        x.litre != null ? x.litre + ' L' : null,
        x.yapilan_islem,
        x.islem_turu
      ].filter(Boolean).join(' • ');

      return `
        <div class="deleteRow">
          <b>${esc(name)}</b>
          <div class="muted">${esc(info)}</div>

          <button
            class="deleteBtn"
            data-id="${x.id}">
            🗑 Bu Kaydı Sil
          </button>
        </div>
      `;
    }).join('');

    if (!rows)
      rows = '<div class="muted">Kayıt bulunamadı.</div>';

    box.innerHTML = `
      <div style="
        max-width:700px;
        margin:auto;
        background:#171b20;
        border:1px solid #3b4651;
        border-radius:18px;
        padding:15px">

        <button id="recordClose" class="secondary">
          ← Kapat
        </button>

        <h2>${cfg[1]} Kayıtları</h2>

        <div class="muted">
          Silinen kayıt geri alınamaz.
        </div>

        ${rows}
      </div>
    `;

    document.body.appendChild(box);

    $('#recordClose').onclick = () => box.remove();

    box.querySelectorAll('.deleteBtn').forEach(btn => {

      btn.onclick = async () => {

        let ok = confirm(
          'Bu ' +
          cfg[1].toLocaleLowerCase('tr-TR') +
          ' kaydını silmek istediğine emin misin?'
        );

        if (!ok) return;

        let result = await db
          .from(cfg[0])
          .delete()
          .eq('id', btn.dataset.id);

        if (result.error) {
          alert('Silinemedi: ' + result.error.message);
          return;
        }

        btn.closest('.deleteRow').remove();

        if (typeof load === 'function') {
          try { await load(); } catch(e) {}
        }
      };
    });
  }

  window.marhanQuickRepair = render;
  window.marhanRecordManager = openRecords;

  function bind() {
    let b = $('#mhR');

    if (!b || b.dataset.quickRepair === '1')
      return;

    b.dataset.quickRepair = '1';

    if (typeof b.onclick === 'function')
      window.marhanLegacyRepair = b.onclick;

    b.onclick = function(e) {
      if (e) e.preventDefault();
      render();
    };
  }

  function addDeleteButton() {
    let p = $('#operationsPage');

    if (!p || p.classList.contains('hidden'))
      return;

    if (p.querySelector('#recordDeleteShortcut'))
      return;

    let text =
      (p.textContent || '')
      .toLocaleLowerCase('tr-TR');

    let kind = null;

    if (text.includes('yakıt'))
      kind = 'fuel';

    else if (
      text.includes('sefer') ||
      text.includes('şantiye')
    )
      kind = 'trip';

    if (!kind) return;

    let b = document.createElement('button');

    b.id = 'recordDeleteShortcut';
    b.className = 'deleteManager';

    b.textContent =
      kind === 'fuel'
        ? '🗑 Yakıt Kayıtlarını Gör / Sil'
        : '🗑 Sefer Kayıtlarını Gör / Sil';

    b.onclick = () => openRecords(kind);

    (p.querySelector('.card') || p).appendChild(b);
  }

  new MutationObserver(() => {
    bind();
    setTimeout(addDeleteButton, 0);
  }).observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  bind();

  document.addEventListener('click', e => {

    let b =
      e.target.closest &&
      e.target.closest('#mhR');

    if (b) {
      e.preventDefault();
      e.stopImmediatePropagation();
      render();
      return;
    }

    setTimeout(addDeleteButton, 50);

  }, true);

})();
