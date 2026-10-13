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

## Perpustakaan digital

Menu **Perpustakaan Buku** memuat katalog Kurikulum Merdeka dari
[SIBI Kemendikdasmen](https://buku.kemendikdasmen.go.id/katalog/buku-kurikulum-merdeka).
Salinan metadata tanggal 13 Oktober 2026 berisi 642 buku PDF, termasuk
174 buku SD/MI. Buku tetap dibaca dari server sumber; PDF tidak disalin ke
repositori. Tombol **Perbarui katalog** mengambil metadata terbaru dari API
yang dipakai situs resmi. Salinan katalog tetap dapat dicari saat API gagal.

- Sampul, filter jenjang/kelas/mapel/jenis, pencarian judul/penulis/ISBN,
  pagination, favorit, lanjut baca, dan rak catatan.
- Ejaan mapel disatukan untuk filter. Panduan guru yang bertipe generik atau
  salah label pada metadata dikenali dari judul; jenis yang belum pasti
  ditampilkan sebagai Buku PDF.
- Pembaca PDF.js 5.6.205 dimuat hanya saat buku dibuka. Satu halaman dirender
  setiap kali, dengan pembatasan sekitar enam juta piksel untuk penggunaan memori.
- Zoom, sesuai layar, layar penuh, kertas/sepia/gelap, nomor halaman PDF,
  serta daftar isi interaktif jika PDF menyediakannya.
- Pensil dengan jari/mouse/stylus, stabilo, catatan teks pada titik halaman,
  warna/ketebalan, hapus, urungkan/ulangi, dan penanda halaman.
- Goresan menggunakan koordinat proporsional sehingga mengikuti zoom/ukuran
  layar. Catatan terkait fingerprint PDF; versi baru tidak menimpa versi lama.
- Teks catatan yang belum kosong disimpan saat berpindah halaman atau menutup
  pembaca. Tombol Batal membuang draf teks yang belum disimpan.

Catatan dan progres disimpan di IndexedDB `adminguru_library_v1`; favorit dan
preferensi pembaca memakai kunci `adminguru_library_*` / `adminguru_reader_*`.
Data ini tidak dikirim ke SIBI dan terpisah dari database kelas serta backup
cloud lama. Gunakan **Cadangkan catatan** / **Pulihkan catatan** untuk memindah
catatan dan favorit antarperangkat. Cadangan JSON tidak memuat berkas PDF.
Catatan versi lama ikut dalam cadangan dan tetap tersimpan saat PDF berubah.

**Simpan PDF di perangkat** mengurangi unduhan ulang. PDF tersimpan bisa dibaca
saat sumbernya gagal jika aplikasi dan mesin PDF sudah tersedia. Membuka
GitHub Pages dan memuat mesin PDF pertama kali masih memerlukan internet;
fitur ini bukan instalasi PWA offline penuh. PDF lokal dapat ditambahkan
tanpa unggah dengan batas 100 MB per berkas. Untuk memulihkan catatan PDF lokal
di perangkat baru, tambahkan PDF yang sama, lalu pulihkan JSON catatannya.
Ruang penyimpanan mengikuti batas browser; jika penyimpanan gagal, pembaca
menampilkan status gagal dan menyediakan cadangan JSON.

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
| `assets/css/library.css` | Rak buku dan ruang baca responsif |
| `assets/data/library/` | Manifest dan salinan metadata katalog SIBI |
| `assets/js/86-library.js` | Katalog, filter, rak pribadi, penyimpanan, cadangan |
| `assets/js/87-book-reader.js` | PDF.js, halaman, coretan, catatan dan penanda |
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

Tes unit mencakup fase CP, prompt V3, tanggal lokal, kehadiran,
streaming/timeout/error AI, metadata katalog dan validasi cadangan catatan.
Tes browser memakai server lokal dan fixture endpoint eksternal: seluruh
79 menu, prompt 16 generator lama, pemilih CP, CRUD, keyboard, serta layout
desktop/ponsel/tablet. Pembaca memakai mesin/worker PDF.js nyata dan PDF dua
halaman untuk menguji goresan, zoom, pemulihan, cache PDF, pergantian versi,
PDF lokal, serta pemisahan data sekolah. Layanan AI berbayar, Dropbox dan
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
