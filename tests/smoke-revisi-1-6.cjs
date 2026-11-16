/* Smoke test revisi butir 1-6: halaman Modul Ajar + detail B.Indo.
   Pakai: node tests/smoke-revisi-1-6.cjs   (dari ~/workspace/adminguru-github) */
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/ERR_TUNNEL_CONNECTION_FAILED|Failed to load resource/.test(m.text())) {
      errors.push('console: ' + m.text());
    }
  });
  await page.goto('http://127.0.0.1:8765/', { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => db && document.getElementById('pageContent'), null, { timeout: 15000 });
  await page.waitForTimeout(800);
  // Buka halaman Modul Ajar lewat navigasi aplikasi (id halaman: modulajar)
  await page.evaluate(() => navigate('modulajar'));
  await page.waitForTimeout(1000);
  const state = await page.evaluate(() => {
    const store = db;
    const list = store.modulAjar || [];
    return {
      kelasAktif: window.activeClassId,
      jumlahModul: list.length,
      judul: list.map((m) => m.judul),
      atpK1: (store.atp || []).length,
      bodyHas: document.getElementById('pageContent').innerText.slice(0, 400),
    };
  });
  console.log('kelas aktif:', state.kelasAktif, '| jumlah modul:', state.jumlahModul, '(harusnya 8)');
  console.log('ATP (kelas aktif):', state.atpK1, 'TP (harusnya 56)');
  for (const t of state.judul) console.log(' -', t.slice(0, 60));
  // Buka detail modul B.Indo lewat tombol edit (crudEdit) — render modal
  const bindo = await page.evaluate(() => {
    const m = (db.modulAjar || []).find((x) => /Bahasa Indonesia/.test(x.judul));
    if (!m) return { found: false };
    crudEdit('modulAjar', m.id);
    return { found: true, id: m.id };
  });
  console.log('modul B.Indo ditemukan:', bindo.found ? 'YA' : 'TIDAK');
  await page.waitForTimeout(1000);
  const detail = await page.evaluate(() => {
    const modal = document.getElementById('activeModal');
    const vals = modal ? [...modal.querySelectorAll('input, textarea, select')].map((e) => e.value).join('\n') : '';
    return document.body.innerText + '\n' + vals;
  });
  for (const probe of [
    "33. 17 Nov 2026 — Bab 3 'Awas Kuman!': cerita Dilo sakit pilek",
    '36. 26 Nov 2026 — Bab 3',
    'ka-ki-ku-ke-ko',
    "Bola Boni",
    'la-li-lu-le-lo',
    'KOREKSI: urutan huruf M/N/P/S',
  ]) console.log('detail B.Indo —', probe, ':', detail.includes(probe) ? 'YA' : 'TIDAK');
  // Detail modul PAI: Akidah + kisah nabi
  await page.evaluate(() => { closeModal(); });
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const m = (db.modulAjar || []).find((x) => /Agama Islam/.test(x.judul));
    if (m) crudEdit('modulAjar', m.id);
  });
  await page.waitForTimeout(1000);
  const detailPai = await page.evaluate(() => {
    const modal = document.getElementById('activeModal');
    const vals = modal ? [...modal.querySelectorAll('input, textarea, select')].map((e) => e.value).join('\n') : '';
    return document.body.innerText + '\n' + vals;
  });
  for (const probe of ['rukun iman', 'Kisah Nabi Muhammad saw.', '(CP 1.2)', '(CP 1.5)']) {
    console.log('detail PAI —', probe, ':', detailPai.includes(probe) ? 'YA' : 'TIDAK');
  }
  console.log('JS error:', errors.length ? errors.join(' | ') : 'tidak ada');
  await browser.close();
  if (state.jumlahModul !== 8 || state.atpK1 !== 56) { console.error('SMOKE: jumlah modul/ATP tidak sesuai'); process.exit(1); }
})().catch((e) => { console.error('SMOKE GAGAL:', e.message); process.exit(1); });
