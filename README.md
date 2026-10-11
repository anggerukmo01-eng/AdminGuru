# Teacher Planner SD 2026 — Multi-Kelas (1–6)

Aplikasi administrasi guru SD: 100% offline (data di `localStorage` perangkat),
tanpa build process. Buka `index.html` langsung di browser, atau akses via
GitHub Pages.

## Struktur File (v2 — sudah dirapikan)

```
index.html               ← kerangka aplikasi (lock screen + sidebar + topbar)
assets/
  css/
    app.css              ← SELURUH TAMPILAN. Edit file ini untuk ubah warna/desain.
  js/
    10-data.js           ← data awal (seed): siswa, CP, ATP/KKTP generator
    20-storage.js        ← mesin penyimpanan multi-kelas (localStorage) + arsip IndexedDB
    30-core.js           ← ikon SVG, navigasi/sidebar, toast, modal, form, tabel CRUD, ekspor
    40-pages.js         ← halaman-halaman utama (dashboard s/d input nilai)
    50-pages2.js         ← modul tambahan administrasi (inventaris, mutasi, dsb.)
    60-cloud.js          ← backup/restore via Supabase (opsional)
    70-shell.js          ← lock screen/PIN + tema gelap/terang
    80-ai.js             ← AI Teacher Suite (generator dokumen)
    90-boot.js           ← inisialisasi aplikasi (wajib dimuat terakhir)
supabase.js              ← konfigurasi Supabase (opsional)
```

> **Urutan `<script>` di `index.html` jangan diubah** (ditandai angka `10, 20, … 90`).

## Mengubah Tampilan (cepat)

1. **Ganti warna global** → edit variabel di `:root` paling atas `assets/css/app.css`
   (`--primary`, `--accent`, `--bg`, `--surface`, …). Satu variabel = seluruh aplikasi.
2. **Mode gelap** → variabel tema gelap ada di blok `[data-theme="dark"]`.
3. **Komponen** (tombol `.btn`, kartu `.card`, tabel, badge, modal) masing-masing punya
   section berlabel jelas di `app.css` — cari dengan `Ctrl+F`.
4. **Menu sidebar** → daftar menu ada di `const NAV` (file `assets/js/30-core.js`).
   Grup sidebar bisa dilipat/dibuka; status lipatan tersimpan otomatis.

## Menambah / Mengubah Halaman

Setiap halaman = satu fungsi `PAGES.namaHalaman = function(){ return \`<html…>\`; }`
di `40-pages.js` / `50-pages2.js`, lalu daftarkan di `const NAV` (`30-core.js`).

## Catatan

- Ekspor "Word"/"Excel" memakai teknik HTML yang dibaca native Ms Word/Excel
  (tetap offline). PDF via print-to-PDF browser.
- Backup data: menu **Backup & Restore (Lokal)** atau **Cloud Storage**.
- PIN & tema tersimpan di `localStorage` perangkat masing-masing.
