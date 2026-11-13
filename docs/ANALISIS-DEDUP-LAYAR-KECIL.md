# Analisis Mendalam AdminGuru — Dedup Fitur & 3 Mode Tampilan

**Tanggal:** 13 November 2026 · **Sasaran:** APK v1.0.17 / repo `main` (8b35fad)
**Permintaan Anggi:** analisa kembali secara mendalam, tepat dan cermat; kurangi fitur
yang berganda/mirip; optimalisasi tampilan untuk layar kecil; beri opsi 3 tampilan
layar — Tablet, Kecil, dan Otomatis.

---

## 1. Ringkasan eksekutif

| Ukuran | Angka |
|---|---|
| Halaman terdaftar (renderer `PAGES`) | **81** |
| Entri menu sidebar (saat aplikasi jalan) | **79** dalam **12 grup** |
| Grup menu terbesar | **AI Teacher Suite Pro: 21 entri** (±27% dari seluruh menu) |
| Kode mati yang bisa dihapus langsung | **±1.500 baris** (1 berkas utuh + 2 definisi bayangan + 2 halaman hantu) |
| Penghematan menu dari penggabungan (konservatif, tanpa menyentuh AI) | **79 → 71 entri (−8)** |
| Penghematan bila opsi AI ikut diterapkan | **79 → 67 entri (−12)** |
| Masalah layar kecil yang terukur | **6** (2 di antaranya parah: Daftar Nilai & Rekap Absen) |
| Mode tampilan yang dirancang | **Tablet / Kecil / Otomatis** (default disarankan: Otomatis) |

**Satu koreksi penting atas dugaan awal:** Perpustakaan dan Buku Catatan Guru
**bukan** halaman yatim — keduanya dimasukkan ke sidebar secara dinamis saat
aplikasi dimuat (`86-library.js:155`). Begitu pula 6 generator AI (Prota, Promes,
Alokasi, Bahan Ajar, KKTP, Refleksi) — semuanya masuk menu lewat
`81-ai-curriculum.js:75`. Yang benar-benar yatim hanya 2 halaman hantu
(`cloudStorage`, `riwayatBackup`).

**Yang TIDAK ditemukan (dugaan yang gugur setelah diperiksa):**
- Tidak ada menu yang tidak punya halaman (semua 79 entri punya renderer).
- Asesmen Formatif/Diagnostik/Sumatif **bukan** duplikat — ketiganya mendelegasikan
  ke satu renderer bersama `asesmenPage()` (`40-pages-b.js:675`). Ini pola yang
  benar dan dijadikan contoh untuk penggabungan lain.
- Buku-buku register (Buku Tamu, Mutasi, Pengambilan Rapor, Prestasi, Tabungan,
  Inventaris, Arsip) juga **bukan** duplikat — semuanya memakai satu renderer
  generik `crudSection()` (`30-core.js:433`, dipakai ±25 kali). Sudah efisien.

---

## 2. Metode

Yang diperiksa langsung dari kode (bukan dari ingatan):

- `assets/js/30-core.js` — array `NAV` (baris 89–176), `buildSidebar()`, `crudSection()`.
- `assets/js/40-pages-a.js`, `40-pages-b.js`, `50-pages2.js`, `60-cloud.js`,
  `80-ai.js`, `81-ai-curriculum.js`, `82-ai-tools.js`, `85-workspace.js`,
  `86-library.js` — seluruh registrasi `PAGES.*` dan mutasi `NAV` runtime.
- `index.html` — urutan pemuatan skrip (baris 125–149) dan kerangka topbar.
- `assets/css/app.css`, `modern.css`, `library.css`, `program-documents.css` —
  seluruh `@media` dan aturan layout.
- Perbandingan isi fungsi (bukan nama): store yang dibaca, kolom yang
  ditampilkan, dan alur yang dijalankan.

---

## 3. Temuan A — Kode mati & definisi ganda (hapus aman, tanpa mengubah fungsi)

### A1. Berkas `82-ai-tools.js` tidak pernah dimuat — 1.444 baris, 0 fungsi unik

- `index.html` **tidak memuat** `82-ai-tools.js` (daftar skrip baris 125–149).
- Perbandingan fungsi: 80-ai.js punya 135 fungsi, 82-ai-tools.js punya 71 fungsi,
  dan **ketujuh puluh satu fungsi itu sudah ada di 80-ai.js** (0 fungsi unik).
- Termasuk di dalamnya duplikat `PAGES.kehadiran`, `PAGES.aiTP`, `PAGES.aiJurnal`.
- `README.md:97` justru menyatakan urutan "`82-ai-tools.js` mengikuti `80-ai.js`"
  — dokumen dan kenyataan bertentangan.
- **Rekomendasi:** hapus berkas `82-ai-tools.js` + perbaiki kalimat README.
  Tidak ada satu fungsi pun yang hilang.

### A2. `progtahunan` / `progsemester` didefinisikan dua kali — versi lama tertimpa

- `40-pages-b.js:394–403` mendefinisikan keduanya lewat `docEditorPage()` +
  `buildProgramTahunanText` / `buildProgramSemesterText`.
- `43-program-documents.js:62–63` mendefinisikannya ulang lewat
  `ProgramDocs.page('annual'/'semester')` — dan berkas ini dimuat **belakangan**
  (`index.html:148`), sehingga versinya yang menang.
- **Rekomendasi:** hapus definisi di `40-pages-b.js:394–403` beserta fungsi
  `buildProgram*` bila tidak dipakai di tempat lain.

### A3. Dua halaman hantu yang langsung mengalihkan diri

- `PAGES.cloudStorage` dan `PAGES.riwayatBackup` (`60-cloud.js:380–385`) hanya
  berisi `setTimeout(()=>navigate("backup"), 30)` — halaman yang isinya hanya
  "pindah ke halaman lain".
- **Rekomendasi:** hapus kedua renderer; ubah semua tautan yang mengarah ke
  keduanya langsung ke `'backup'`.

---

## 4. Temuan B — Fitur berganda / mirip (yang layak digabung)

Semua pasangan di bawah ini dibuktikan dari isi kode, bukan dari kemiripan nama.

### B1. Tiga "rekap jumlah siswa" dari sumber data yang sama

| Halaman | Isi sebenarnya |
|---|---|
| `dfjl` — Jumlah Siswa per Tahun Lahir | Hitung L/P per tahun lahir dari `db.siswa` |
| `rekapJumlahSiswa` — Rekap Jumlah Siswa Bulanan | L/P + mutasi masuk/keluar + S/I/A per bulan, dari `db.siswa` + `db.mutasi` + `db.kehadiran` |
| `rekapSeluruhKelas` — Rekap Seluruh Kelas | Kartu jumlah L/P per kelas 1–6, dari `db.siswa` tiap kelas |

Ketiganya adalah "jumlah siswa dilihat dari sudut berbeda", semuanya dihitung
otomatis (tidak ada input manual yang terpisah).
**Rekomendasi:** gabung jadi **satu halaman "Statistik Siswa" dengan 3 tab**
(Per Kelas / Per Bulan / Per Tahun Lahir). **Hemat 2 entri menu.**

### B2. Kehadiran vs Rekap Absen Bulanan — satu data, dua halaman

- `rekapAbsenTahunan` menyatakan sendiri di deskripsinya: "Dihitung otomatis
  dari data harian pada menu Kehadiran".
- Tabelnya adalah yang **terlebar di seluruh aplikasi**: 12 bulan × 3 kolom
  (S/I/A) + total = 39 kolom.
- **Rekomendasi:** jadikan **tab kedua di halaman Kehadiran**
  ("Input Harian" | "Rekap 12 Bulan"). **Hemat 1 entri menu.**

### B3. Pembinaan: 4 halaman yang strukturnya identik

`perkembangan`, `bimbingan`, `konsultasiOrtu`, `homevisit` — masing-masing hanya
±17 baris wrapper `crudSection()` dengan store berbeda. Bedanya hanya label
kolom, bukan alur.
**Rekomendasi:** gabung jadi **satu halaman "Pembinaan" dengan 4 tab**
(Perkembangan / Bimbingan / Konsultasi Ortu / Home Visit).
**Hemat 3 entri menu.** (Pola yang dipakai sama persis dengan `asesmenPage()`
yang sudah terbukti di Asesmen.)

### B4. Buku Pegangan Guru vs Buku Pegangan Siswa

Dua wrapper `crudSection()` (11 dan 16 baris), struktur sama, hanya beda store.
**Rekomendasi:** gabung jadi **satu halaman "Buku Pegangan" dengan tab
Guru / Siswa**. **Hemat 1 entri menu.**

### B5. Data Orang Tua vs Rekap Pekerjaan Orang Tua

`pekerjaanOrtu` dihitung otomatis dari field `pekerjaanOrtu` pada Data Siswa
(`50-pages2.js`) — bukan data yang diisi terpisah.
**Rekomendasi:** jadikan **tab "Rekap" di halaman Data Orang Tua**.
**Hemat 1 entri menu.**

### B6. Grup AI: 21 entri — terbesar, dan paling banyak menduplikasi halaman manual

| Generator AI | Padanan manualnya |
|---|---|
| AI: Modul Ajar | Modul Ajar |
| AI: TP / AI: ATP | ATP (Alur Tujuan Pembelajaran) |
| AI: Jurnal Mengajar | Jurnal Mengajar |
| AI: Asesmen Formatif | Asesmen Formatif |
| AI: Prota / Promes | Program Tahunan / Program Semester |
| AI: KKTP | KKTP |
| AI: Alokasi Waktu | Alokasi Waktu Mapel |
| AI: LKPD, Bank Soal, Rubrik, Pengayaan & Remedial, Surat Ortu, Bahan Ajar, Refleksi, Analisis CP, Telaah CP | (tidak punya padanan manual langsung) |

**Rekomendasi (bertahap, butuh keputusan Anggi):**
- Tahap aman: **jangan hapus satu pun generator AI** — fungsinya (membuat draf)
  berbeda dari halaman manual (mengelola data).
- Tahap penataan: pindahkan 4 generator yang punya padanan manual langsung
  (Modul Ajar, ATP, Jurnal, Asesmen Formatif) menjadi **tombol "Buat dengan AI"
  di dalam halaman manualnya** — entri sidebar-nya dihapus, fungsinya tetap ada.
  **Hemat 4 entri menu** bila diterapkan.
- Grup AI yang tersisa (LKPD, Bank Soal, Rubrik, dst.) tetap di sidebar karena
  memang tidak punya padanan manual.

### B7. Yang diputuskan TIDAK digabung (dengan alasan)

| Pasangan | Alasan tetap dipisah |
|---|---|
| Input Nilai Massal vs Asesmen Formatif | Granularitas berbeda: massal = mengisi banyak siswa sekaligus; asesmen = per asesmen/per siswa. Yang perlu diperbaiki hanya **label menu** supaya bedanya jelas. |
| Buku-buku register (Tamu, Mutasi, Rapor, Prestasi, Tabungan, Inventaris, Arsip) | Buku resmi yang berbeda; sudah efisien karena memakai satu renderer generik. |
| Backup Lokal vs Dropbox vs Supabase vs Sinkron Dapodik | Jalur yang berbeda (lokal / cloud / Dapodik); sudah satu halaman "Backup & Sinkron Data" kecuali Dapodik yang memang halaman sendiri. Catatan: kartu Supabase yang **belum dikonfigurasi sebaiknya disembunyikan** sampai diisi — jangan tampilkan opsi mati. |
| Program Tahunan vs Program Semester | Dokumen resmi yang berbeda (tahunan vs semester). |

### Rekap penghematan menu

| Langkah | Entri menu |
|---|---|
| Saat ini (saat aplikasi jalan) | 79 |
| B1 Statistik Siswa (3 → 1) | −2 |
| B2 Kehadiran + Rekap Absen (2 → 1) | −1 |
| B3 Pembinaan (4 → 1) | −3 |
| B4 Buku Pegangan (2 → 1) | −1 |
| B5 Orang Tua + Rekap (2 → 1) | −1 |
| **Total konservatif** | **71 (−8)** |
| + B6 opsi AI (4 entri jadi tombol di halaman manual) | **67 (−12)** |

Tidak satu pun fungsi yang hilang dalam penggabungan di atas — yang berkurang
hanya entri menu; isinya pindah menjadi tab di dalam halaman gabungan.

---

## 5. Temuan C — Audit layar kecil (yang sudah bagus vs yang bermasalah)

### Yang sudah bagus (jangan dirusak)

- `<meta viewport width=device-width>` sudah ada (`index.html:5`).
- Navigasi bawah ponsel sudah ada: 4 tombol (Beranda, Siswa, Kehadiran, Pusat AI)
  + tombol Menu, aktif di bawah 960 px (`85-workspace.js:14`, `modern.css:626`).
- Sidebar sudah menjadi overlay (geser dari kiri) di bawah 960 px.
- Grid sudah melipat: 4→2 kolom di ≤1100 px, 1 kolom di ≤640 px.
- Form sudah 1 kolom di ≤640 px; grid Perpustakaan sudah responsif.

### Masalah yang terukur

**C1. PARAH — Daftar Nilai: ±13 kolom, deskripsi min-width 230 px.**
`40-pages-b.js:1207–1228`: No + NISN + Nama + L/P + 4 kolom LM + NR + STS + SAS
(+ Sumatif Akhir Fase) + Nilai Akhir + Deskripsi (min-width 230 px) = lebar
efektif **>1.000 px** di layar HP 360 px. Pengguna harus menggeser horizontal
jauh untuk melihat satu baris.

**C2. PARAH — Rekap Absen Bulanan: 39 kolom.**
12 bulan × (S/I/A) + 3 total (`50-pages2.js:212`). Tabel terlebar di aplikasi.
Di HP praktis tidak terbaca sebagai tabel.

**C3. Input Nilai Massal: grid 4 LM × 4 TP + sumatif.**
`40-pages-b.js:882` (±248 baris). Di HP, grid input selebar ini tidak bisa
dipakai dengan nyaman — butuh mode kartu/accordion per siswa.

**C4. Pratinjau Program Tahunan/Semester dipaksa lebar.**
`program-documents.css`: `.program-fallback{min-width:850px}` dan
`.program-preview .program-word-wrapper{min-width:max-content}` — pratinjau
dokumen memaksa geser horizontal di HP.

**C5. Topbar sesak di HP: 7 elemen dalam 360 px.**
Hamburger + judul + kolom cari + pemilih kelas + tombol "✨ Teacher AI Pro" +
tombol tema + tombol kunci (`index.html:97–116`). Yang sudah disembunyikan
hanya kredit "Edukreativa" (≤1240 px). Tombol AI Pro duplikat dengan tombol
"Pusat AI" di navigasi bawah; kolom cari bisa menjadi ikon saja.

**C6. Papan info (marquee) terlalu panjang di HP.**
Teks berjalan berisi jadwal lengkap + piket (`30-core.js:230`). Di HP cukup
jam + piket saja.

**C7. Dua sistem CSS bertumpuk dengan breakpoint berbeda.**
`app.css` (871 baris) + `modern.css` (1.087 baris) memakai breakpoint
640 / 700 / 900 / 960 / 1.000 / 1.100 / 1.200 / 1.240 px yang tersebar.
Aturan mode layar harus terpusat di satu tempat agar tidak saling menimpa.

**Catatan APK:** WebView memakai `setUseWideViewPort(true)` + viewport
`width=device-width`, dan AdminGuru **tidak** memaksa lebar desktop 1.024 px
(berbeda dengan situs sekolah). Jadi mode layar kecil akan bekerja di APK
tanpa perubahan wrapper.

---

## 6. Rancangan 3 mode tampilan

### 6.1 Definisi mode

| Mode | Perilaku |
|---|---|
| **Tablet** | Perilaku saat ini. Sidebar 284 px tetap, konten multi-kolom, tabel penuh dengan geser horizontal, topbar lengkap. Untuk tablet ≥720 px dan untuk pengguna yang memang menginginkannya. |
| **Kecil** | Tampilan HP yang dipaksa aktif apa pun lebar layarnya. Sidebar menjadi overlay (buka lewat hamburger), navigasi bawah aktif, konten 1 kolom, topbar ringkas (hamburger + judul + kunci), tombol sentuh minimal 48 px, huruf isi 15–16 px, papan info ringkas (jam + piket). Berguna di HP, dan juga di tablet bila guru menginginkan tampilan yang lebih sederhana. |
| **Otomatis** *(default yang disarankan)* | Memilih sendiri berdasarkan lebar layar: **<720 px → Kecil, ≥720 px → Tablet**. Mengikuti perubahan ukuran secara langsung (rotasi HP, split-screen, jendela diubah). Bila pengguna pernah memilih manual (Tablet/Kecil), pilihan manual itu yang menang dan tersimpan. |

Angka 720 px dipilih karena sudah dipakai sebagai batas modal (`app.css:470`)
dan berada di antara 640 px (batas HP) dan 960 px (batas tablet) yang sudah ada.

### 6.2 Cara kerja (mengikuti pola yang sudah ada di aplikasi)

Aplikasi sudah punya pola yang persis sama untuk tema gelap/terang
(`settings.theme` + atribut `data-theme` di `70-shell.js:84`), jadi mode
tampilan mengikuti pola itu — tidak ada mekanisme baru yang perlu ditemukan:

1. **Penyimpanan:** `settings.displayMode` di localStorage —
   `"auto"` | `"tablet"` | `"kecil"` (pola `loadSettings()` di
   `20-storage.js:282`, seperti `navCollapsedGet()`).
2. **Penerapan:** `document.documentElement.setAttribute("data-display-mode", …)`
   di `70-shell.js`, dipanggil saat boot dan setiap kali berubah.
3. **Otomatis:** `window.matchMedia("(max-width: 719px)")` + listener
   `change` — bila mode = `"auto"`, atribut mengikuti hasil media query.
4. **CSS:** satu blok baru di `modern.css` dengan pemilih
   `html[data-display-mode="kecil"] …` — meminjam aturan `<960px` yang sudah
   ada (sidebar overlay, navigasi bawah, grid 1 kolom) dan menambahkan
   peringkasan topbar + papan info. Aturan `auto` tidak butuh CSS sendiri:
   JS yang menerjemahkannya menjadi `tablet`/`kecil`.
5. **Letak pengaturan:** kartu **"Tampilan"** di halaman Pengaturan
   (`60-cloud.js:406–410`, saat ini hanya berisi tombol tema) — ditambah 3
   pilihan (Otomatis / Tablet / Kecil) dengan penjelasan satu baris tiap
   pilihan. Tidak ada tombol baru di topbar (topbar sudah sesak — temuan C5).

### 6.3 Yang berubah di tiap mode (rincian)

**Mode Kecil — kerangka (Fase 1, satu perubahan CSS + JS):**
- Sidebar overlay + navigasi bawah tampil (aturan yang sudah ada).
- Semua grid menjadi 1 kolom; padding konten 16 px.
- Topbar: sembunyikan tombol "✨ Teacher AI Pro" (sudah ada di navigasi bawah)
  dan ubah kolom cari menjadi ikon; pemilih kelas tetap tampil (kecil).
- Papan info: hanya jam + piket (sembunyikan jadwal lengkap).
- Tombol aksi utama minimal 48 px; huruf isi 15 px.

**Mode Kecil — tabel menjadi kartu (Fase 2, per halaman):**
- Daftar Nilai, Rekap Absen Bulanan, dan Input Nilai Massal mendapat tampilan
  kartu per siswa di mode Kecil (satu kartu = satu siswa, nilai tersusun
  vertikal). Ini pekerjaan per halaman karena tiap tabel punya struktur
  berbeda — dikerjakan setelah kerangka Fase 1 terbukti jalan.
- Pratinjau Program Tahunan/Semester: `min-width:850px` dihapus di mode Kecil
  (dokumen mengalir vertikal).

**Mode Tablet:** tidak ada yang berubah dari perilaku saat ini.

### 6.4 Pengujian yang harus dilakukan sebelum diserahkan

- HP 360 px (mode Otomatis → Kecil): Beranda, Data Siswa, Kehadiran,
  Input Nilai, Daftar Nilai, Backup — semua bisa dipakai tanpa geser
  horizontal yang tidak disengaja.
- Tablet Mi Pad (mode Otomatis → Tablet): tampilan sama persis seperti v1.0.17.
- Ganti mode manual di Pengaturan → pilihan tersimpan setelah aplikasi
  ditutup dan dibuka lagi; rotasi HP tidak mengubah pilihan manual.
- Backup Lokal + login Dropbox tetap diuji di build yang sama (perbaikan
  v1.0.18 yang masih menunggu lampu hijau — lihat §7).

---

## 7. Rencana penerapan & keputusan yang dibutuhkan Anggi

**Urutan yang disarankan (bertahap, tiap tahap bisa diuji sendiri):**

1. **Tahap 0 — bersih-bersih (tanpa risiko):** hapus `82-ai-tools.js`,
   hapus definisi bayangan Prota/Promes, hapus halaman hantu
   `cloudStorage`/`riwayatBackup`, perbaiki README. Tidak mengubah satu pun
   fungsi yang terlihat pengguna.
2. **Tahap 1 — 3 mode tampilan, kerangka (Fase 1):** pengaturan di halaman
   Pengaturan + atribut `data-display-mode` + CSS mode Kecil untuk kerangka.
3. **Tahap 2 — penggabungan menu (B1–B5):** 5 penggabungan, 79 → 71 entri.
4. **Tahap 3 — tabel menjadi kartu (Fase 2):** Daftar Nilai, Rekap Absen,
   Input Nilai Massal di mode Kecil.
5. **Tahap 4 (opsional) — penataan AI (B6):** 4 generator jadi tombol di
   halaman manualnya.

**Dua hal yang masih menunggu lampu hijau Anggi (terpisah dari analisis ini):**
- Perbaikan Backup Lokal + login Dropbox → build **v1.0.18** (diagnosis 13 Nov
  2026 sudah diserahkan). Bisa digabung dalam build yang sama bila Tahap 0–1
  disetujui, supaya Anggi cukup menguji satu APK.
- Penerapan dikerjakan di branch baru dari `main` (bukan di
  `redesign-ui-v2`), supaya tidak tercampur dengan pekerjaan redesain V2 yang
  merge-nya masih menunggu keputusan terpisah.

**Keputusan yang diminta dari Anggi:**
1. Hapus kode mati Tahap 0? (tidak ada risiko fungsi)
2. Terapkan 3 mode tampilan (Tahap 1) sekarang?
3. Terapkan penggabungan menu B1–B5 (Tahap 2)?
4. Opsi AI B6 ikut diterapkan, atau grup AI dibiarkan apa adanya?
5. Mode default: **Otomatis** (disarankan) atau Tablet?

---

## 8. Status penerapan — DISETUJUI & DITERAPKAN 13 Nov 2026

Anggi memilih **"Terapkan semua (Tahap 0–2)"** (opsi B6 dan perbaikan
Backup/Dropbox v1.0.18 **tidak** termasuk — keduanya masih menunggu keputusan
terpisah). Dikerjakan di branch **`dedupe-tampilan`** (dari `main` 8b35fad),
**belum di-merge ke `main` dan belum di-build APK-nya**.

- **Tahap 0:** `82-ai-tools.js` dihapus; blok bayangan Prota/Promes di
  `40-pages-b.js` dihapus (173 baris, termasuk `docEditorPage` +
  `buildProgram*Text` yang terbukti tidak dipakai di tempat lain);
  `PAGES.cloudStorage`/`PAGES.riwayatBackup` dihapus, tombol Pengaturan
  diarahkan ke `backup`; README diperbaiki.
- **Tahap 1:** `settings.displayMode` (`auto`/`tablet`/`kecil`, default
  `auto`), `applyDisplayMode()`/`setDisplayMode()` di `70-shell.js`
  mengikuti pola tema, ambang 720 px, listener `matchMedia`;
  blok CSS `html[data-display-mode="kecil"]` di `modern.css`;
  3 pilihan radio di kartu Tampilan halaman Pengaturan.
  **Koreksi atas dokumen ini:** topbar di `main` tidak punya tombol
  "Teacher AI Pro" (itu milik branch `redesign-ui-v2`) — aturannya tidak
  dipakai; yang diringkas di mode Kecil adalah kolom cari (jadi ikon saja)
  dan papan info (hanya jam).
- **Tahap 2:** 5 halaman bertab — Statistik Siswa, Kehadiran (+Rekap 12
  Bulan), Pembinaan, Buku Pegangan, Data Orang Tua (+Rekap Pekerjaan);
  NAV **79 → 71 entri**; tautan dashboard disesuaikan.

**Verifikasi (13 Nov 2026):**
- Semua JS lolos `node --check`; hitungan silang: 71 entri menu semuanya
  punya renderer, 11 renderer lama semuanya masih dipanggil lewat tab.
- Tes browser (Chromium headless): Dashboard, sanitizer AI, dan
  **semua 71 rute dirender tanpa exception JS** — LULUS.
- Tes unit: `library`+`word` 11 lulus / 1 gagal; `regression` 5 lulus /
  2 gagal. **Ketiga kegagalan itu sudah ada di `main` murni**
  (dibuktikan dengan menjalankan tes yang sama di worktree `main`):
  tes pencarian perintah `bank soal` di browser.cjs:41,
  tes Word `a.download + ".doc"` di word.test.cjs:25, dan dua tes
  regresi (tanggal lewat tengah malam; retry auth AI). Bukan akibat
  perubahan ini. Satu tes regresi ("Timeout stays active…") menggantung
  lama di `main` maupun di branch ini — `npm test` penuh tidak ditunggu
  sampai selesai karena penyebabnya sudah teridentifikasi.
- APK **belum** di-build dari branch ini; perbaikan Backup Lokal +
  login Dropbox (v1.0.18) belum diterapkan — keduanya menunggu
  lampu hijau Anggi.
