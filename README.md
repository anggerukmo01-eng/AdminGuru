# AdminGuru — Ruang Kerja Guru SD (Kelas 1–6)

Aplikasi administrasi guru SD tanpa build process. Data utama tersimpan di
localStorage dan arsip di IndexedDB perangkat. Fitur lokal dapat berjalan dari
salinan berkas lengkap; akses awal GitHub Pages, AI, OCR/CDN, serta sinkronisasi
cloud memerlukan internet. PIN merupakan pengunci antarmuka, bukan enkripsi data.

## Pembaruan 13 Oktober 2026

- Beranda berwarna indigo, toska, koral, dan kuning; mode terang/gelap.
- Pencarian fitur Ctrl/Cmd+K dan navigasi bawah untuk ponsel/tablet.
- Kehadiran hanya menghitung status tercatat, termasuk jumlah yang belum diisi.
  Jurnal terbaru tidak memasukkan rencana masa depan.
- Tanggal mengikuti kalender lokal perangkat. Rekap bulanan memisahkan tahun
  ajaran; jumlah siswa aktif tidak diklaim sebagai jumlah historis per bulan.
- Hasil AI dibersihkan dari HTML aktif sebelum ditampilkan, disimpan, dan
  diekspor. Timeout mencakup seluruh streaming; tersedia pembatalan.
- Referensi CP per fase, Analisis CP → TP (ABCD), dan Telaah CP–ATP.
  Lampiran CP Agama 2025 tidak otomatis dipakai dalam generator baru karena
  pembaruan BKPDM 020/2026. Pembandingan penuh dengan PDF primer masih diperlukan.
- Prompt V3, opsi PG kelas 1 a–c / kelas 2 ke atas a–d, prompt kustom,
  serta kunci penyimpanan lama dipertahankan.

## Struktur

| Berkas | Fungsi |
| --- | --- |
| `index.html` | Kerangka aplikasi dan urutan skrip |
| `assets/css/app.css` | Komponen tampilan awal |
| `assets/css/modern.css` | Desain workspace terbaru dan mode gelap |
| `assets/js/05-logo.js` | Logo sekolah |
| `assets/js/10-data.js` | Data awal dan referensi lokal |
| `assets/js/20-storage.js` | Penyimpanan multi-kelas dan arsip IndexedDB |
| `assets/js/25-safety.js` | Sanitasi dokumen dan ringkasan kehadiran |
| `assets/js/30-core.js` | Navigasi, modal, form, CRUD, ekspor |
| `assets/js/40-pages-a.js`, `40-pages-b.js` | Halaman utama |
| `assets/js/44-rencana.js`, `45-analisis.js` | Rencana pembelajaran dan analisis nilai |
| `assets/js/50-pages2.js` | Administrasi tambahan |
| `assets/js/60-cloud.js`, `62-dropbox.js` | Sinkronisasi opsional |
| `assets/js/70-shell.js` | PIN dan tema |
| `assets/js/80-ai.js` | Layanan AI, settings, riwayat, Modul/ATP/LKPD |
| `assets/js/82-ai-tools.js` | Absensi, ekspor, generator AI tambahan |
| `assets/js/cp-data.js` | Dataset CP dari lampiran handoff |
| `assets/js/81-ai-curriculum.js` | Referensi CP, Analisis CP–TP, Telaah CP–ATP |
| `assets/js/85-workspace.js` | Pencarian fitur, form aksesibel, navigasi ponsel |
| `assets/js/90-boot.js` | Inisialisasi terakhir |

Urutan skrip pada `index.html` harus dipertahankan: `82-ai-tools.js` mengikuti
`80-ai.js`; `cp-data.js` mendahului `81-ai-curriculum.js`; boot selalu terakhir.
Untuk mengubah warna, edit tokens di `modern.css`. Menu terdaftar pada NAV
(`30-core.js`), dengan tambahan kurikulum/AI di `81-ai-curriculum.js`.

## Pengujian

Frontend tidak membutuhkan instalasi npm. Untuk pengembangan dan pengujian:

```sh
npm ci
npm test
npx playwright install chromium
npm run test:browser
```

Tes unit mencakup fase CP, prompt V3, tanggal lokal, kehadiran, serta
streaming/timeout/error AI. Tes browser memakai server lokal dan memblokir
endpoint eksternal: seluruh menu, prompt 16 generator lama, pemilih CP, CRUD,
keyboard, serta layout desktop/ponsel/tablet. Layanan AI berbayar, Dropbox dan
Supabase dengan akun nyata, serta hasil ekspor di aplikasi Office perlu diuji
terpisah oleh pemilik akun. CI berjalan pada pull request dan main.

## Ekspor dan penyimpanan

Ekspor Word/Excel menggunakan HTML yang dapat dibaca aplikasi Office; berkas
tersebut bukan DOCX/XLSX native. PDF menggunakan print-to-PDF browser. Backup
lokal tersedia pada menu Backup & Sinkron Data. Kunci penyimpanan lama dan
pemisahan data kelas tidak dimigrasikan oleh pembaruan UI ini.

## Batasan privasi yang perlu ditangani

Kode awal proyek memuat data seed sekolah/siswa/buku induk. JavaScript pada
GitHub Pages publik dapat diunduh tanpa PIN. Pindahkan identitas nyata ke impor
lokal atau backend dengan autentikasi dan otorisasi sebelum memakai distribusi
publik untuk data pribadi. Penghapusan dari versi terbaru tidak menghapus
riwayat Git. Pembaruan ini tidak menghapus data sekolah atau mengubah akses
cloud pengguna.
