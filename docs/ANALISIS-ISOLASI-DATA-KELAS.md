# ANALISIS ISOLASI DATA PER KELAS — AdminGuru

**Tanggal:** 13 November 2026
**Repo:** `anggerukmo01-eng/AdminGuru`, branch `main`, commit `cc7b219`
**Ruang lingkup:** audit statis (baca kode) seluruh halaman/fitur render. Tidak ada kode yang diubah, tidak ada merge, tidak ada build APK. Audit ini **tidak** menjalankan aplikasi di browser — semua temuan berasal dari pembacaan kode sumber, bukan uji runtime.
**Permintaan pengguna (13 Nov 2026):** "ketika membuka salah satu kelas, JANGAN tampilkan data kelas lain — hanya tampilkan data sesuai kelas yang dipilih, termasuk daftar siswa/klasikal, nilai, dan lain-lain" + "tambahkan pilihan kelas saat log in pertama ke aplikasi".

**STATUS PELAKSANAAN (13 Nov 2026):** Anggi menyetujui semua rekomendasi §7 dan memerintahkan "kerjakan Tahap 0 dulu". Tahap 0 (butir 0.1–0.7) **SELESAI** di branch `isolasi-tahap-0` (commit `8c16c3e` + `1e4745b`; butir 0.5 di branch `fitur-kelas-login`, commit `8719a56`). Uji browser khusus Tahap 0 **8/8 lulus tanpa JS error** (`~/workspace/tmp-tests/test-isolasi-tahap0.cjs`); tes regresi program + uji Fase 2 tetap lulus. **Belum merge ke main, belum build APK** — menunggu lampu hijau Anggi (keputusan §7 butir 9: Tahap 0 dulu, baru merge).

---

## 1. Ringkasan Eksekutif

Arsitektur dasar aplikasi **sudah benar**: data siswa, kehadiran, nilai, jurnal, dan dokumen kurikulum disimpan **per kelas** (satu bucket `localStorage` per kelas), dan hampir semua halaman hanya membaca `db` — yang isinya **hanya kelas aktif**. Dari **78 entri halaman/fitur** yang diaudit:

| Verdict | Jumlah | Keterangan |
|---|---|---|
| TERISOLASI | 49 | Hanya memakai data kelas aktif |
| BOCOR | 16 | Menampilkan/memakai data kelas lain |
| LINTAS-KELAS BY DESIGN | 13 | Memang seharusnya lintas kelas (rekap sekolah, data bersama, backup penuh, dsb.) |

**Kesimpulan utama:** fondasinya terisolasi, tetapi ada **16 titik bocor** yang melanggar permintaan pengguna — 4 di antaranya **Kritis** karena menampilkan **nama siswa** kelas lain atau **menulis ke bucket kelas lain**:

1. **Arsip Dokumen** menampilkan file semua kelas secara default (termasuk scan jurnal).
2. **Dashboard "Rekap Umur per Bulan"** hardcode menampilkan siswa **Kelas 1** apa pun kelas aktifnya — lengkap dengan nama siswa yang tidak punya tanggal lahir.
3. **Unggah Buku Induk** mencocokkan nama siswa lintas kelas dan **menulis ke bucket kelas lain**.
4. **AI "Pengayaan & Remedial"** menyisipkan **nama siswa belum tuntas dari kelas aktif** ke dalam draf untuk kelas lain yang dipilih di formulir.

Selain itu, **Riwayat Dokumen AI bersifat global** (semua kelas dalam satu daftar), **semua 16 generator AI punya pemilih kelas sendiri** yang memuat CP/ATP kelas lain, **restore backup menimpa semua 6 kelas** tanpa pilihan, dan **teks "Tentang Aplikasi" di Pengaturan mengklaim "tidak pernah tercampur"** — klaim yang saat ini tidak benar.

Branch `fitur-kelas-login` (commit `9dbfe0d`, belum merge) **sudah benar** mengimplementasikan pemilih kelas di layar kunci + kelas bawaan, termasuk untuk login pertama (storage kosong). Namun branch itu **tidak memperbaiki satu pun dari 16 titik bocor** di atas, dan teks hint-nya ("Beranda dan semua data akan menampilkan kelas ini") saat ini **overpromise**.

---

## 2. Cara Kerja Kelas Aktif Saat Ini

### 2.1 Penyimpanan: per kelas vs bersama

| Jenis data | Lokasi | Keterangan |
|---|---|---|
| Data per kelas (siswa, kehadiran, nilai, agenda, CP/ATP/KKTP, modul, rapor, dsb.) | `localStorage` kunci `tpsd2026_class_<id>_v1` | Satu bucket per kelas (`kelas-1` … `kelas-6`) — `20-storage.js:151-155` |
| Data bersama | `localStorage` kunci `tpsd2026_shared_v1` | `SHARED_FIELDS = ["sekolah","guru","tendik","kalender"]` — `20-storage.js:38` |
| Kelas aktif | `localStorage` kunci `tpsd2026_activeclass_v1` | Default `"kelas-1"` bila belum ada — `20-storage.js:33` |
| Alumni | `localStorage` kunci `tpsd2026_alumni_v1` | **Global**, bukan per kelas |
| Catatan Guru | `localStorage` kunci `tpsd2026_catatan_guru_v1` | **Global** (buku pribadi guru, tanpa field kelas) — `46-catatan-guru.js:17` |
| Riwayat Dokumen AI | `localStorage` kunci `tpsd2026_ai_history_v1` | **Global** (semua kelas) — `80-ai.js:15` |
| Dokumen AI tersimpan (`db.aiDocs`) | Bucket per kelas | Per kelas — `20-storage.js:86` |
| Arsip file (IndexedDB) | `tpsd2026_arsip_db` | Per rekaman punya field `kelasId`; nilai `"all"` diizinkan — `20-storage.js:374-384` |
| Draf Input Nilai Massal | `localStorage` kunci `tpsd2026_draftdaftarnilai_<kelas>__<mapel>__<semester>` | Per kelas+mapel+semester — `40-pages-b.js:820` |
| Pengaturan (termasuk PIN, tema) | `localStorage` settings | Global |

### 2.2 Alur kelas aktif

- `loadDB()` (`20-storage.js:223`) memuat data bersama + **satu** bucket kelas aktif, lalu menggabungkan `waliKelasId` dan label kelas dari bucket itu ke tampilan `db.sekolah` (`20-storage.js:229-231`).
- `saveDB()` (`20-storage.js:236`) memecah kembali: field bersama ke shared, sisanya ke bucket kelas aktif.
- `switchActiveClass()` (`20-storage.js:246`) menyimpan kelas lama dulu, memuat kelas baru, membangun ulang sidebar, dan me-render ulang halaman.
- Pemilih "Kelas Aktif" di atas aplikasi dibangun oleh `buildClassSwitcher()` (`30-core.js:332`).
- Helper nama/daftar siswa hanya membaca kelas aktif: `siswaSortedAlpha()` (`50-pages2.js:21`), `siswaOpts()` (`50-pages2.js:22`), `siswaName(id)` (`50-pages2.js:23`, mengembalikan `"?"` bila tidak ketemu).
- Nama file ekspor diberi tag kelas aktif via `withClassTag()` (`30-core.js:569`).
- `boot()` (`90-boot.js:122`) selalu menampilkan layar kunci (`90-boot.js:449`) dan menjalankan `checkAgendaReminders()` tiap 60 detik (`90-boot.js:457-459`).
- `index.html:118-143` — urutan load script. **`82-ai-tools.js` TIDAK dimuat** (tidak ada tag `<script>` untuknya), jadi pemakaian `loadClassDB` di berkas itu adalah dead code dan tidak berpengaruh di runtime.

**Implikasi penting untuk audit ini:** karena `db` hanya berisi kelas aktif, kebocoran nyata **hanya** bisa terjadi lewat tiga jalur: (1) pemanggilan eksplisit `loadClassDB(<kelas lain>)`, (2) iterasi eksplisit `CLASS_LIST`, atau (3) store global (shared/alumni/catatanGuru/riwayat AI/arsip IndexedDB). Semua temuan bocor di bawah memakai salah satu dari tiga jalur itu.

---

## 3. Tabel Audit per Halaman

Legenda: **TERISOLASI** = hanya data kelas aktif · **BOCOR** = menampilkan/memakai data kelas lain · **BY DESIGN** = lintas kelas memang seharusnya.

### 3.1 Beranda, profil & data pokok

| Halaman / fitur | Verdict | Bukti | Data kelas lain yang tampil / dipakai |
|---|---|---|---|
| Dashboard — sebagian besar (jumlah siswa, kehadiran hari ini, agenda, jadwal, modul) | TERISOLASI | `40-pages-a.js:50-120` (`db.siswa`, `db.kehadiran`, `db.agenda`, `db.jadwal`, `db.modulAjar`) | — |
| Dashboard — "Ringkasan sekolah & pembinaan" | **BOCOR** | `40-pages-a.js:114` | Jumlah siswa **semua 6 kelas** (`CLASS_LIST.map` + `loadClassDB(c.id).siswa.length`) + tombol "Pindah kelas" |
| Dashboard — "Rekap Umur Siswa per Bulan — Kelas 1" | **BOCOR** | `40-pages-a.js:1274-1300` | Hardcode `loadClassDB("kelas-1").siswa` — tampil apa pun kelas aktifnya; hint menyebut **nama siswa** Kelas 1 yang tanpa tanggal lahir |
| Dashboard — "Rekap Program Indonesia Pintar" | **BOCOR** | `40-pages-a.js:61` memakai `rekapPIP()` di `40-pages-a.js:1301-1322` | Agregat penerima/usulan **semua 6 kelas** (`CLASS_LIST.forEach` + `loadClassDB`); `daftarUsulan` (nama + kelas) dihitung tapi tidak dirender |
| Profil Sekolah | BY DESIGN | `40-pages-a.js:123` | `db.sekolah` + `db.guru` bersama; `waliKelasId` per kelas |
| Guru & Tendik | BY DESIGN | `40-pages-a.js:176` | `db.guru`/`db.tendik` bersama |
| Kalender Pendidikan | BY DESIGN | `40-pages-a.js:941` | `db.kalender` ada di `SHARED_FIELDS` — tapi lihat temuan S8: isinya tercampur entri "[Kelas 1]" |
| Data Siswa (+ ekspor CSV/Word/Excel/cetak) | TERISOLASI | `40-pages-a.js:386`, ekspor `40-pages-a.js:290,653,658,662` | — (semua `db.siswa`) |
| Buku Induk (form, lihat, cetak, simpan) | TERISOLASI | `40-pages-a.js:1447` (`saveBukuInduk` memuat `loadClassDB(activeClassId)`, lalu `db = loadDB()`) | — |
| Data Orang Tua | TERISOLASI | `40-pages-a.js:797` | — |
| Template Buku Induk (unduh) | **BOCOR** | `40-pages-a.js:1610-1635` | Berkas `Template_Buku_Induk_2026.xlsx` berisi siswa **semua 6 kelas** (loop kelas-1..6 + `loadClassDB` tiap kelas) |
| Unggah Buku Induk (pratinjau & terapkan) | **BOCOR** | `40-pages-a.js:1726-1790` | Membangun `allSiswa` dari **semua 6 kelas**; fallback cocok **nama saja** lintas kelas (first match menang); `applyBIImport` menulis ke bucket kelas yang cocok (`saveClassDB(match.cid)`) |
| Naik Kelas / Pindah Kelas / Lulus / Siswa Keluar | BY DESIGN | `40-pages-a.js:667,687,708` | Sengaja menulis bucket kelas lain (pemindahan siswa) |

### 3.2 Rekap & pembinaan (`50-pages2.js`)

| Halaman / fitur | Verdict | Bukti | Data kelas lain |
|---|---|---|---|
| Rekap Seluruh Kelas | BY DESIGN | `50-pages2.js:168` | Jumlah L/P per kelas 1–6 + klik kartu pindah kelas (halaman rekap sekolah) |
| Arsip Alumni | BY DESIGN | `50-pages2.js:190` | `loadAlumni()` global (lulusan Kelas 6 lintas tahun) |
| Jumlah Siswa per Tahun Lahir | TERISOLASI | `50-pages2.js:104` | — |
| Rekap Jumlah Siswa Bulanan | TERISOLASI | `50-pages2.js:131` | — |
| Rekap Pekerjaan Orang Tua | TERISOLASI | `50-pages2.js:154` | — |
| Rekap Absen Bulanan 12 Bulan | TERISOLASI | `50-pages2.js:212` | — |
| Buku Prestasi Siswa | TERISOLASI | `50-pages2.js:240` | — |
| Riwayat Kesehatan | TERISOLASI | `50-pages2.js:26` | — |
| Riwayat Kelakuan | TERISOLASI | `50-pages2.js:49` | — |
| Bakat & Minat | TERISOLASI | `50-pages2.js:70` | — |
| Ekstrakurikuler | TERISOLASI | `50-pages2.js:261` | — |
| Study Tour | TERISOLASI | `50-pages2.js:283` | — |
| Buku Pegangan Guru / Siswa | TERISOLASI | `50-pages2.js:298,312` | — |
| Denah Tempat Duduk | TERISOLASI | `50-pages2.js:331` | — |
| Jadwal Piket | TERISOLASI | `50-pages2.js:349` | — |
| Kelompok Belajar | TERISOLASI | `50-pages2.js:367` | — |
| Alokasi Waktu | TERISOLASI | `50-pages2.js:385` | — |
| Bimbingan | TERISOLASI | `50-pages2.js:399` | — |
| Konsultasi Ortu | TERISOLASI | `50-pages2.js:420` | — |
| Tabungan Siswa | TERISOLASI | `50-pages2.js:440` | — |
| Buku Pengambilan Rapor | TERISOLASI | `50-pages2.js:460` | — |
| Daftar Kenaikan Kelas | TERISOLASI | `50-pages2.js:478` | — |
| Backup & Restore (lokal) | BY DESIGN | `50-pages2.js:501-535,623,627` | Backup penuh **semua kelas** by design; restore **menimpa semua bucket kelas** + mengganti `activeClassId` dari payload (fallback `"kelas-1"`) |
| Reset Aplikasi | BY DESIGN | `50-pages2.js:640` | Menghapus **semua kelas** (dengan konfirmasi) |
| Sinkron Dapodik | BY DESIGN | `50-pages2.js:710,874` | Menarik semua rombel; `dapoApply` menulis ke **semua bucket kelas** per NISN + mengganti PTK menyeluruh |

### 3.3 Perencanaan & penilaian (`40-pages-b.js`, `43-program-documents.js`, `44-rencana.js`, `45-analisis.js`)

| Halaman / fitur | Verdict | Bukti | Data kelas lain |
|---|---|---|---|
| Jadwal Pelajaran | TERISOLASI | `40-pages-b.js:24` | — (`db.jadwal`) |
| Jurnal Mengajar — catatan teks | TERISOLASI | `40-pages-b.js:178` | — (store `agenda` per kelas; ekspor `exportJurnalSheet` hanya `db.agenda`) |
| Jurnal Mengajar — panel file/scan | **BOCOR** | `40-pages-b.js:216` | Dropdown filter punya opsi **"Semua Kelas"** (nilai kosong = tanpa filter kelas); rekaman `kelasId:"all"` selalu lolos (`20-storage.js:374-384`) |
| Program Tahunan / Program Semester | TERISOLASI | `43-program-documents.js` (`PAGES.progtahunan`/`PAGES.progsemester` didefinisikan ulang di sini, mengalahkan `40-pages-b.js:394,398`) | `rows()` memakai `db.atp` kelas aktif; `store()` per kelas+tahun ajaran |
| CP | TERISOLASI | `40-pages-b.js:404` | `db.cp` per fase kelas aktif |
| ATP | TERISOLASI | `40-pages-b.js:451` | — |
| KKTP | TERISOLASI | `40-pages-b.js:476` | — |
| Modul Ajar — teks terstruktur | TERISOLASI | `40-pages-b.js:528` | — (`db.modulAjar`) |
| Modul Ajar — panel file | **BOCOR** | `40-pages-b.js:556` | Sama seperti Jurnal: opsi **"Semua Kelas"** + rekaman `"all"` |
| Asesmen Diagnostik / Formatif / Sumatif | TERISOLASI | `40-pages-b.js:1129-1130` | — (store per kelas + `db.siswa`) |
| Input Nilai Massal | TERISOLASI | `40-pages-b.js:882` | Draf per kelas+mapel+semester (`40-pages-b.js:820`); simpan hanya ke store kelas aktif |
| Daftar Nilai | TERISOLASI | `40-pages-b.js:1207` | — (`daftarNilaiRows` dari `db.asesmenSumatif` + `db.siswa`) |
| Analisis Nilai | TERISOLASI | `45-analisis.js:65` | — (`analisisCompute` dari data kelas aktif) |
| Rapor (rekap + deskripsi) | TERISOLASI | `40-pages-b.js:1358` | — |
| Catatan Perkembangan | TERISOLASI | `40-pages-b.js:1405` | — |
| Home Visit | TERISOLASI | `40-pages-b.js:1427` | — |
| Supervisi & Refleksi Guru | TERISOLASI | `40-pages-b.js:1448` | — |
| Inventaris Kelas | TERISOLASI | `40-pages-b.js:1481` | — |
| Buku Tamu | TERISOLASI | `40-pages-b.js:1495` | — |
| Buku Mutasi | TERISOLASI | `40-pages-b.js:1509` | — |
| Arsip Dokumen — panel file | **BOCOR** | `40-pages-b.js:1539-1542` + `20-storage.js:374-384` | **Default filter `kelasId:""` = tanpa filter → menampilkan file SEMUA kelas** (berbeda dengan Jurnal/Modul yang default-nya kelas aktif) |
| Arsip Dokumen — catatan teks lama | TERISOLASI | `40-pages-b.js:1546` | — (store `arsip` per kelas) |
| Rencana PBL Kelas 1 → Kalender bersama | **BOCOR** | `44-rencana.js:289` (`runRencanaPblSeedIfNeeded`) | Menanam 178 entri berlabel `"[Kelas 1]"` ke **kalender bersama** (`shared.kalender`) — terlihat di Kalender semua kelas; hanya jurnalnya yang benar masuk bucket `kelas-1` |
| Pengingat Jurnal | **BOCOR** | `44-rencana.js:367` (`checkAgendaReminders`), dipanggil tiap 60 detik `90-boot.js:457-459` | Selalu membaca `loadClassDB("kelas-1").agenda` — toast/notifikasi jurnal Kelas 1 muncul walau kelas aktifnya kelas lain |

### 3.4 Kehadiran & AI (`80-ai.js`, `81-ai-curriculum.js`)

| Halaman / fitur | Verdict | Bukti | Data kelas lain |
|---|---|---|---|
| Kehadiran (harian + rekap bulanan) | TERISOLASI | `80-ai.js:1335`; roster dikunci ke kelas aktif `80-ai.js:1135-1136` (komentar: revisi 2 Nov 2026) | — |
| Pusat AI Guru (hub) | TERISOLASI* | `80-ai.js:294` | Statistik `db.aiDocs` per kelas; *tetapi kartu "Generate Terakhir" mengambil item terakhir dari **riwayat global** (lihat di bawah) |
| Riwayat Dokumen AI | **BOCOR** | `80-ai.js:332`; kunci global `AI_HIST_KEY` `80-ai.js:15`; `addAiHistory` `80-ai.js:62-70`; `aiRunGenerate` menyimpan ke riwayat global `80-ai.js:579-600` | Semua dokumen hasil generate **semua kelas** dalam satu daftar (judul memuat nama kelas) |
| Semua 16 generator AI (Modul, TP, ATP, Prota, Promes, Alokasi Waktu, LKPD, Bahan Ajar, Bank Soal, Asesmen Formatif, Rubrik, KKTP, Pengayaan & Remedial, Jurnal, Refleksi, Surat Ortu) | **BOCOR** | `80-ai.js:385-388` (`aiKelasSelect`: dropdown Kelas 1–6 di tiap generator); pemuatan data kelas terpilih `80-ai.js:394` (`aiCpListForKelasMapel`) dan `80-ai.js:1484` (`aiAtpListForKelasMapel`); halaman generator: `80-ai.js:745,901,962,1500,1562,1684,1761,1841,2030,2083,2133,2215,2273,2341,2406,2470` | Memilih kelas lain di formulir memuat **CP/ATP kelas itu** (dan untuk Jurnal: kehadiran + jumlah siswa kelas itu, `80-ai.js:1610`) |
| AI Jurnal — "Ambil Materi & TP dari Rencana" | **BOCOR** | `80-ai.js:1643-1665` | Mengambil dari `RENCANA_PBL` (**Khusus Kelas 1**, `44-rencana.js`) untuk kelas apa pun yang dipilih |
| AI Pengayaan & Remedial — "Ambil dari Analisis Nilai" | **BOCOR** | `80-ai.js:2075-2082` | Memakai `analisisCompute()` (kelas **aktif**, `45-analisis.js:14-17`), **bukan** kelas yang dipilih di formulir — **nama siswa belum tuntas + rata-rata kelas aktif** disisipkan ke draf kelas lain |
| AI Surat Ortu — daftar tujuan | **BOCOR** | `80-ai.js:2087-2110` | Dropdown "Ditujukan Kepada" memakai `siswaOpts()` (**kelas aktif**, `50-pages2.js:22`) sementara pemilih kelas bisa kelas lain; surat berlabel kelas lain berisi nama siswa kelas aktif, dan wali penandatangan pun wali kelas aktif |
| AI Settings | BY DESIGN | `80-ai.js:199` | Pengaturan global (API key, model) — bukan data kelas |
| Referensi CP | BY DESIGN | `81-ai-curriculum.js:20` | Teks regulasi publik; pemilih fase/kelas memang fitur acuan (default fase kelas aktif) |
| AI Analisis CP → TP / Telaah CP–ATP | **BOCOR** | `81-ai-curriculum.js:8-14` | `curriculumControls` memakai `aiKelasSelect` — CP acuan dapat dibaca/digenerate untuk kelas/fase lain (teks regulasi publik, bukan data siswa — bobot lebih ringan daripada generator lain) |

### 3.5 Lainnya

| Halaman / fitur | Verdict | Bukti | Data kelas lain |
|---|---|---|---|
| Catatan Guru | BY DESIGN | `46-catatan-guru.js:17` | Store global `tpsd2026_catatan_guru_v1` — buku pribadi guru, **tanpa field kelas**; ikut backup penuh |
| Pencarian global (Ctrl+K / "Cari fitur...") | TERISOLASI | `85-workspace.js` (`renderMenuResults`) | Hanya mencari **label menu** di `NAV`, bukan data siswa/nilai |
| Layar kunci / PIN | TERISOLASI | `70-shell.js` (`showLockScreen`, `unlockApp`) | Subjudul kunci hanya menampilkan label kelas aktif (`85-workspace.js: syncWorkspaceUi`); **belum ada pemilih kelas di `main`** (lihat §5) |
| Pengaturan | BY DESIGN | `60-cloud.js:389` | PIN/tema/suara global; tetapi teks "Tentang Aplikasi" berisi klaim yang kini tidak benar (lihat C1) |
| Backup Cloud (Supabase) | BY DESIGN | `60-cloud.js:241,302` | `cloudBackupNow` mengunggah `collectFullBackupPayload()` (semua kelas); `cloudRestore` memanggil `applyFullBackupPayload` (timpa semua kelas) |
| Backup Dropbox | BY DESIGN | `62-dropbox.js:145,195` | Sama: `dbxBackupNow`/`dbxRestore` memakai payload penuh |
| Perpustakaan | TERISOLASI | `86-library.js` (`BookLibrary.view`, filter `grade` default = angka kelas aktif) | Katalog **publik SIBI** — filter kelas 1–12 adalah filter katalog, bukan data kelas sekolah |
| Pembaca Buku (catatan per halaman) | TERISOLASI | `87-book-reader.js` | Catatan pribadi guru (IndexedDB terpisah), tanpa kaitan kelas |
| Halaman pengalihan `cloudStorage` / `riwayatBackup` | — | `60-cloud.js` | Hanya redirect ke `backup` (dead page) |

---

## 4. Temuan Berlevel

### 4.1 KRITIS

**K1 — Arsip Dokumen menampilkan file semua kelas secara default.**
`40-pages-b.js:1539-1542` — filter awal `window._arsipFilters` memakai `kelasId:""` (kosong = tanpa filter), berbeda dengan Jurnal/Modul yang default-nya `activeClassId`. `arsipFilterMatches()` (`20-storage.js:374-384`) tidak memfilter bila `kelasId` kosong. Akibat: begitu membuka menu Arsip dari kelas mana pun, pengguna langsung melihat **semua file semua kelas** — termasuk scan/foto Jurnal Mengajar yang bisa memuat nama dan kondisi siswa. Pengguna harus sadar dan memilih filter kelas secara manual. Perbaikan: satu baris — default `kelasId:activeClassId`.

**K2 — Rekap Umur Dashboard hardcode Kelas 1, lengkap dengan nama siswa.**
`40-pages-a.js:1274-1300` — `rekapUmurBulananHtml()` memakai `loadClassDB("kelas-1").siswa` secara hardcode. Komentar kode menyebut instruksi 2 Nov 2026 "Fokus Hanya Kelas 1 Saja". Akibat: saat kelas aktif Kelas 3/4/5/6, Dashboard tetap menampilkan distribusi umur **siswa Kelas 1**, dan baris hint-nya menyebut **nama-nama siswa Kelas 1** yang tidak punya tanggal lahir. Ini satu-satunya tempat di Dashboard yang menampilkan **nama** siswa kelas lain (bukan sekadar angka). Bertentangan langsung dengan instruksi baru 13 Nov 2026.

**K3 — Unggah Buku Induk mencocokkan nama lintas kelas dan menulis ke bucket kelas lain.**
`40-pages-a.js:1726-1790` — `previewBIImport()` membangun `allSiswa` dari **semua 6 kelas**. Bila NISN tidak cocok, fallback-nya adalah cocok **nama saja** lintas kelas (`allSiswa.find(x => nama sama)` — first match menang). `applyBIImport()` lalu menulis ke bucket kelas yang cocok (`saveClassDB(match.cid)`). Risiko ganda: (a) unggahan dari halaman satu kelas dapat **mengubah data kelas lain** tanpa disadari; (b) bila ada dua siswa bernama sama di kelas berbeda, data yang salah yang tertimpa. Ini relevan langsung dengan pertanyaan pengguna soal restore yang menimpa kelas yang tidak dipilih — jalur ini punya perilaku yang sama.

**K4 — AI "Pengayaan & Remedial" menyisipkan nama siswa kelas aktif ke draf kelas lain.**
`80-ai.js:2075-2082` — tombol "Ambil dari Analisis Nilai" (`aiPengRemAmbilAnalisis`) memanggil `analisisCompute(mapel, semSel)` yang membaca **`db` (kelas aktif)**, bukan kelas yang dipilih di dropdown formulir (`ap_kelas`). Hasilnya — **nama-nama siswa belum tuntas + rata-rata kelas aktif** — dimasukkan ke kolom kesulitan, lalu ikut terkirim sebagai konteks ke generator untuk kelas lain. Jadi guru yang sedang menyusun remedial untuk Kelas 3 bisa tanpa sadar menerima (dan menyimpan/mengirim ke AI) daftar nama siswa Kelas 1 yang belum tuntas. Ini bocor **dan** salah kelas sekaligus.

### 4.2 SERIUS

**S1 — Dashboard "Ringkasan sekolah & pembinaan" menampilkan jumlah siswa semua kelas.**
`40-pages-a.js:114` — `CLASS_LIST.map` + `loadClassDB(c.id).siswa.length` untuk tiap kelas, lengkap dengan tombol "Pindah kelas". Hanya angka jumlah (tanpa nama), dan tombol pindah kelas memang berguna — tapi tetap menampilkan data kelas lain di halaman kelas aktif.

**S2 — Dashboard "Rekap Program Indonesia Pintar" mengagregasi semua kelas.**
`40-pages-a.js:1301-1322`, dipakai di `40-pages-a.js:61` — `CLASS_LIST.forEach` + `loadClassDB`. Yang dirender hanya angka penerima/usulan/per kategori; `daftarUsulan` (nama + kelas) dihitung tapi **tidak pernah dirender di mana pun** (hanya `40-pages-a.js:61` yang memakai `rekapPIP()`).

**S3 — Panel file Jurnal & Modul Ajar menyediakan opsi "Semua Kelas".**
`40-pages-b.js:216` (Jurnal) dan `40-pages-b.js:556` (Modul) — dropdown filter kelas punya opsi kosong = "Semua Kelas". Ditambah `20-storage.js:374-384`: rekaman dengan `kelasId:"all"` **selalu lolos** filter kelas mana pun; dan dialog unggah (`20-storage.js:434`) menawarkan "Semua Kelas" sebagai pilihan pertama. Default-nya memang kelas aktif, jadi kebocoran di sini butuh pilihan eksplisit pengguna — tetapi pilihannya tersedia di halaman kelas.

**S4 — Riwayat Dokumen AI bersifat global.**
`80-ai.js:15` (`AI_HIST_KEY`), `80-ai.js:62-70` (`loadAiHistory`/`saveAiHistory`/`addAiHistory`), `80-ai.js:332` (`PAGES.aiHistory`), `80-ai.js:579-600` (`aiRunGenerate` menyimpan ke riwayat global). Semua dokumen hasil generate **semua kelas** tampil dalam satu daftar; kartu "Generate Terakhir" di Pusat AI (`80-ai.js:294`) juga mengambil item terakhir global. Padahal `db.aiDocs` (dokumen tersimpan) sudah per kelas (`20-storage.js:86`) — riwayat dan dokumen tersimpan tidak konsisten.

**S5 — Semua generator AI punya pemilih kelas sendiri yang memuat CP/ATP kelas lain.**
`80-ai.js:385-388` (`aiKelasSelect` — dropdown Kelas 1–6 di tiap formulir generator), `80-ai.js:394` (`aiCpListForKelasMapel` memakai `loadClassDB(kelasId)` bila bukan kelas aktif), `80-ai.js:1484` (`aiAtpListForKelasMapel`). Berlaku untuk ke-16 generator (`80-ai.js:745,901,962,1500,1562,1684,1761,1841,2030,2083,2133,2215,2273,2341,2406,2470`) dan 2 workflow kurikulum (`81-ai-curriculum.js:8-14`). Default-nya kelas aktif — tetapi satu klik mengubahnya ke kelas lain dan seluruh konteks (CP, TP, jumlah siswa, kehadiran) ikut berpindah. Ini kemungkinan besar **sengaja** sebagai fitur (guru menyiapkan perangkat untuk kelas lain), tetapi melanggar aturan baru bila dibiarkan.

**S6 — AI Surat Ortu: daftar tujuan dari kelas aktif, label dari kelas terpilih.**
`80-ai.js:2087-2110` — dropdown "Ditujukan Kepada" memakai `siswaOpts()` (`50-pages2.js:22`, hanya `db.siswa` = kelas aktif), sementara dropdown "Kelas" bisa memilih kelas lain, dan wali penandatangan diambil dari `db.sekolah.waliKelasId` (wali kelas aktif). Hasil: surat berlabel "Kelas 3" dapat berisi nama siswa Kelas 1 dan ditandatangani wali Kelas 1.

**S7 — Pengingat Jurnal selalu membaca agenda Kelas 1.**
`44-rencana.js:367` (`checkAgendaReminders` memakai `loadClassDB("kelas-1").agenda`), dipanggil saat boot dan **tiap 60 detik** (`90-boot.js:457-459`). Toast/notifikasi pengingat jurnal Kelas 1 dapat muncul kapan saja, walau kelas aktifnya kelas lain. (Fungsi ini memang ditulis khusus Kelas 1 — lihat judul komentar "Pengingat Jurnal Mengajar (kelas-1)" — tetapi pemanggilnya tidak memeriksa kelas aktif.)

**S8 — Rencana PBL Kelas 1 menanam 178 entri ke kalender bersama.**
`44-rencana.js:289` (`runRencanaPblSeedIfNeeded`) — 178 entri rencana (judul `"[Kelas 1] ..."`, materi, CP, TP) ditulis ke `shared.kalender`. Karena kalender bersifat bersama (`SHARED_FIELDS`, `20-storage.js:38`), entri-entri "[Kelas 1]" itu terlihat di halaman Kalender **semua kelas**. Hanya bagian jurnalnya yang benar masuk bucket `kelas-1`. Catatan: ini seed satu kali (flag `tpsd2026_rencana_pbl_k1_2426_v4`); membersihkannya memakai `window.hapusRencanaPbl()` (`44-rencana.js:333`).

**S9 — AI Jurnal "Ambil Materi & TP dari Rencana" hanya mengenal Rencana Kelas 1.**
`80-ai.js:1643-1665` (`aiJurnalAmbilRencana`) — mengambil dari `RENCANA_PBL` (konstanta khusus Kelas 1, `44-rencana.js`) untuk mapel+tanggal apa pun, tanpa memeriksa kelas yang dipilih di formulir. Materi/TP Kelas 1 masuk ke draf jurnal kelas lain.

**S10 — Template Buku Induk berisi siswa semua 6 kelas.**
`40-pages-a.js:1610-1635` (`downloadBITemplate`) — berkas unduhan berisi seluruh siswa sekolah (loop kelas-1..6). Template ini memang punya kolom Kelas dan alur unggahnya mencocokkan per NISN lintas kelas — jadi ini template tingkat sekolah. Namun dari sudut isolasi, satu klik di halaman satu kelas mengunduh PII semua kelas.

**S11 — Restore backup menimpa semua kelas, tanpa pilihan.**
`50-pages2.js:516-535` (`applyFullBackupPayload` menulis semua bucket kelas yang ada di payload + alumni + catatanGuru + settings, lalu mengganti `activeClassId` dari payload), dipanggil dari `restoreData()` (`50-pages2.js:627`), `cloudRestore` (`60-cloud.js:302`), dan `dbxRestore` (`62-dropbox.js:195`). Jawaban atas pertanyaan pengguna: **ya, restore memang menimpa kelas yang tidak dipilih** — bahkan mengganti kelas aktif yang sedang dibuka. Perilaku ini by design (backup selalu penuh, `50-pages2.js:501-515`), dan halaman Backup sendiri menulisnya jujur ("mencakup Kelas 1 s.d. Kelas 6", `50-pages2.js:541`) — tetapi tidak ada opsi "pulihkan hanya kelas aktif", dan restore lokal (`50-pages2.js:627`) tidak memakai dialog konfirmasi sama sekali (berbeda dengan cloud/Dropbox yang memakai `confirmDialog` + cadangan lokal otomatis).

**S12 — Sinkron Dapodik menulis ke semua bucket kelas.**
`50-pages2.js:874` (`dapoApply`) — menarik semua rombel, mencocokkan per NISN per kelas, dan mengganti daftar PTK menyeluruh. Ini sinkron tingkat sekolah by design, tetapi dari halaman mana pun, satu klik "Terapkan Data" menulis ke semua kelas tanpa pratinjau per kelas.

### 4.3 CATATAN

**C1 — Klaim "tidak pernah tercampur" di Pengaturan kini tidak benar.**
`60-cloud.js:439` (teks "Tentang Aplikasi"): "Data setiap kelas disimpan terpisah dan tidak pernah tercampur." Penyimpanannya memang terpisah, tetapi tampilannya tercampur di 16 titik di atas (Dashboard, Arsip, Riwayat AI, generator AI, dst.). Klaim ini harus diubah sampai temuan diperbaiki, supaya tidak menyesatkan.

**C2 — Dead code dengan hardcode Kelas 1 masih ada dan menyesatkan.**
(a) `82-ai-tools.js` tidak dimuat di `index.html:118-143` (1.444 baris, 0 fungsi unik) — pemakaian `loadClassDB` di dalamnya tidak berpengaruh; aman dihapus. (b) `buildProgramTahunanText`/`buildProgramSemesterText` di `40-pages-b.js` (±baris 276–393) dibayangi `43-program-documents.js` (dimuat terakhir, `index.html:142`) sehingga tidak berjalan — tetapi isinya hardcode `"Fase A"`, `"KELAS 1"`, dan `JP_STRUKTUR_KELAS1`; teks lama itu masih tampil di bagian "Arsip naskah lama" pada halaman Prota/Promes. (c) `PAGES.kehadiran` versi lama di `40-pages-b.js` sudah dihapus dengan komentar — yang aktif di `80-ai.js:1335`; `PAGES.cloudStorage`/`PAGES.riwayatBackup` (`60-cloud.js`) hanya redirect ke `backup`.

**C3 — Draf Input Nilai Massal tidak ikut backup.**
Kunci draf `tpsd2026_draftdaftarnilai_<kelas>__<mapel>__<semester>` (`40-pages-b.js:820`) **tidak tercantum** dalam `collectFullBackupPayload()` (`50-pages2.js:501-515`, isinya: `shared`, `classes`, `alumni`, `catatanGuru`, `activeClassId`, `settings`, `exportedAt`, `appVersion`). Bukan kebocoran — tetapi draf nilai yang belum disimpan hilang saat restore/ganti perangkat, padahal draf itu per kelas dan seharusnya ikut tercadangkan.

---

## 5. Evaluasi Branch `fitur-kelas-login` (commit `9dbfe0d`, belum merge)

Perintah pembanding: `git diff main...fitur-kelas-login` — 7 berkas, 44 baris ditambah, 2 diubah.

### 5.1 Apa yang diubah

| Berkas | Perubahan |
|---|---|
| `index.html` | Markup layar kunci: field `.lock-class-field` + `<select id="lockClassSelect">` + hint "Beranda dan semua data (jadwal, piket, nilai, kehadiran) akan menampilkan kelas ini." |
| `assets/css/app.css` | Gaya untuk `.lock-class-field` |
| `assets/js/70-shell.js` | `showLockScreen()`: mengisi opsi Kelas 1–6; memilih `settings.defaultClassId` bila valid, kalau tidak `activeClassId`. `unlockApp()`: menyimpan pilihan layar kunci sebagai `defaultClassId` baru (bila berubah) dan memanggil `switchActiveClass(want)` bila berbeda |
| `assets/js/20-storage.js` | `defaultSettings()` menambah `defaultClassId:""` |
| `assets/js/60-cloud.js` | Kartu "Kelas Bawaan" di Pengaturan + `saveDefaultClass(value)` (validasi terhadap `CLASS_LIST`; `""` = "Ikuti kelas terakhir dipakai") |
| `assets/js/40-pages-b.js` | `PAGES.jadwal` mendapat dropdown kelas di kepala halaman (`switchActiveClass`) |
| `assets/js/50-pages2.js` | `PAGES.jadwalPiket` mendapat bilah "Kelas aktif" + dropdown kelas |

### 5.2 Apakah mencakup login pertama dan login berikutnya?

- **Login pertama (storage kosong): ya.** `boot()` selalu menampilkan layar kunci (`90-boot.js:449`); `showLockScreen()` mengisi dropdown apa pun kondisi PIN-nya (kode pengisi dropdown berada setelah cabang PIN/tanpa-PIN). Bila `defaultClassId` kosong, dropdown terisi `activeClassId` (default `"kelas-1"`). Pengguna dapat memilih kelas **sebelum** membuka aplikasi.
- **Login berikutnya: ya.** `defaultClassId` tersimpan di settings dan dipilih otomatis sebagai nilai awal dropdown; `unlockApp()` menerapkan pilihan itu lewat `switchActiveClass()`.
- **Apakah berlaku untuk semua halaman? Ya, sejauh halaman membaca `db`.** `switchActiveClass()` memuat ulang bucket kelas terpilih dan me-render ulang, sehingga seluruh halaman yang terisolasi (49 entri di §3) otomatis mengikuti pilihan. **Tetapi** branch ini **tidak menyentuh satu pun dari 16 titik bocor** di §4 — setelah merge, Dashboard tetap menampilkan jumlah semua kelas, Arsip tetap default semua kelas, Riwayat AI tetap global, dan generator AI tetap bisa memilih kelas lain.

### 5.3 Kekurangan / celah branch ini

1. **Hint overpromise.** Teks di layar kunci — "Beranda dan semua data (jadwal, piket, nilai, kehadiran) akan menampilkan kelas ini" — belum benar untuk Dashboard (S1, S2, K2), Arsip (K1), dan Riwayat AI (S4). Perbaiki teksnya atau perbaiki dulu titik-titik itu (lihat Tahap 0).
2. **`defaultClassId` tidak stabil.** Setiap `unlockApp()` menimpa `settings.defaultClassId` dengan pilihan layar kunci saat itu. Akibatnya dropdown "Kelas Bawaan" di Pengaturan sebenarnya berarti "kelas terakhir yang dipilih di layar kunci", bukan bawaan yang dipertahankan. Bila pengguna ingin bawaan tetap (mis. selalu Kelas 1) tetapi sesekali membuka Kelas 3 dari layar kunci, bawaannya ikut berubah tanpa pemberitahuan.
3. **Hanya 2 halaman yang diberi pemilih kelas di dalam halaman** (Jadwal, Jadwal Piket). Halaman lain mengandalkan pemilih di atas aplikasi (`buildClassSwitcher`, `30-core.js:332`) — itu sudah cukup, bukan cacat; hanya dicatat agar tidak dikira semua halaman sudah dipasangi pemilih.
4. **Restore mengabaikan `defaultClassId`.** `applyFullBackupPayload()` (`50-pages2.js:516-535`) mengganti `activeClassId` dari payload dan `settings` dari payload — pilihan kelas bawaan pengguna dapat tertimpa oleh isi backup.
5. **Auto-lock memaksa memilih kelas lagi.** `showLockScreen()` juga dipanggil saat auto-lock (`70-shell.js`), sehingga setiap penguncian otomatis menampilkan lagi pemilih kelas — dapat diterima, tetapi perlu disadari sebagai perilaku baru.
6. **Tidak ada validasi silang dengan halaman yang bocor.** Branch ini tidak menambahkan penanda apa pun di halaman yang masih lintas kelas, sehingga pengguna tidak tahu bahwa pilihan kelasnya tidak berlaku di halaman-halaman itu.

**Penilaian keseluruhan branch:** implementasi pemilih kelas + kelas bawaan **sudah benar dan lengkap untuk tujuannya**. Layak di-merge **setelah** Tahap 0 (§6) — atau di-merge sekarang dengan catatan hint-nya diperbaiki terlebih dahulu, karena hint yang overpromise akan menyesatkan pengguna tepat di layar pertama yang ia lihat.

---

## 6. Rekomendasi Perbaikan Berprioritas

### Tahap 0 — Cepat, risiko kecil (disarankan sebelum merge `fitur-kelas-login`)

| # | Perbaikan | Lokasi |
|---|---|---|
| 0.1 | Arsip Dokumen: default filter `kelasId` = `activeClassId` (bukan `""`) | `40-pages-b.js:1540` |
| 0.2 | Rekap Umur Dashboard: ganti `loadClassDB("kelas-1")` menjadi `db.siswa` (atau hapus kartu bila diputuskan tetap Kelas 1 — lihat §7 butir 2) | `40-pages-a.js:1284` |
| 0.3 | AI Pengayaan & Remedial: "Ambil dari Analisis Nilai" harus memakai kelas yang dipilih di formulir; bila kelas terpilih ≠ kelas aktif, nonaktifkan tombol atau beri peringatan | `80-ai.js:2075-2082` |
| 0.4 | AI Surat Ortu: dropdown tujuan memakai roster kelas yang dipilih di formulir, dan wali penandatangan memakai wali kelas itu | `80-ai.js:2087-2110` |
| 0.5 | Perbaiki hint layar kunci di branch `fitur-kelas-login` agar jujur (atau tunda sampai S1/S2/K2 diperbaiki) | `index.html` (branch) |
| 0.6 | Ubah klaim "tidak pernah tercampur" di Pengaturan sampai temuan diperbaiki | `60-cloud.js:439` |
| 0.7 | `restoreData()` lokal: tambahkan `confirmDialog` seperti cloud/Dropbox (saat ini tanpa konfirmasi, `50-pages2.js:627`) | `50-pages2.js:627` |

### Tahap 1 — Perbaikan isolasi

| # | Perbaikan | Lokasi |
|---|---|---|
| 1.1 | Dashboard: kunci "Ringkasan sekolah" dan "Rekap PIP" ke kelas aktif, atau pindahkan keduanya ke halaman "Rekap Sekolah" tersendiri dengan label jelas (lihat §7 butir 1) | `40-pages-a.js:61,114,1301-1322` |
| 1.2 | Panel file Jurnal/Modul: hapus opsi "Semua Kelas" dari dropdown; rekaman `kelasId:"all"` hanya boleh tampil di halaman Arsip (bila diputuskan begitu), bukan di halaman kelas | `40-pages-b.js:216,556`; `20-storage.js:374-384,434` |
| 1.3 | Riwayat Dokumen AI: simpan `kelasId` pada tiap item riwayat dan filter ke kelas aktif; atau pindahkan riwayat ke `db.aiDocs` (sudah per kelas) | `80-ai.js:15,62-70,332` |
| 1.4 | Generator AI: kunci `aiKelasSelect` ke kelas aktif (hapus opsi kelas lain) **atau** beri label peringatan yang jelas; `aiCpListForKelasMapel`/`aiAtpListForKelasMapel` hanya membaca kelas aktif | `80-ai.js:385-396,1484` |
| 1.5 | Pengingat Jurnal: baca agenda kelas aktif, bukan hardcode `kelas-1` | `44-rencana.js:367` |
| 1.6 | Rencana PBL: jangan tanam ke kalender bersama; tanam ke agenda Kelas 1 saja, atau beri tag kelas dan filter kalender per kelas | `44-rencana.js:289` |
| 1.7 | Unggah Buku Induk: batasi pencocokan ke kelas aktif; hapus fallback cocok nama saja; bila NISN cocok di kelas lain, minta konfirmasi eksplisit (jangan diam-diam menulis bucket lain) | `40-pages-a.js:1726-1790` |
| 1.8 | Template Buku Induk: batasi isi unduhan ke kelas aktif (atau beri nama berkas + peringatan yang jelas bila tetap semua kelas) | `40-pages-a.js:1610-1635` |
| 1.9 | AI Jurnal "Ambil dari Rencana": nonaktifkan bila kelas terpilih bukan Kelas 1 (Rencana hanya ada untuk Kelas 1) | `80-ai.js:1643-1665` |

### Tahap 2 — Fitur pendukung isolasi

| # | Perbaikan | Lokasi |
|---|---|---|
| 2.1 | Restore per kelas: tambahkan opsi "Pulihkan hanya kelas aktif" di `applyFullBackupPayload`; jangan timpa `activeClassId` bila `defaultClassId` disetel | `50-pages2.js:516-535` |
| 2.2 | Halaman "Rekap Sekolah" khusus: pindahkan semua agregat lintas kelas (Rekap Seluruh Kelas, Ringkasan sekolah, Rekap PIP) ke satu halaman berlabel jelas, supaya halaman kelas murni kelas aktif | `40-pages-a.js:114,1301`; `50-pages2.js:168` |
| 2.3 | Sinkron Dapodik: tampilkan pratinjau per kelas dan minta konfirmasi sebelum menulis kelas selain kelas aktif | `50-pages2.js:874` |
| 2.4 | Sertakan draf Input Nilai Massal dalam backup penuh | `40-pages-b.js:820`; `50-pages2.js:501-515` |
| 2.5 | Hapus dead code: `82-ai-tools.js` dan builder Prota/Promes lama di `40-pages-b.js` (yang masih berisi hardcode "Fase A"/"KELAS 1") | `82-ai-tools.js`; `40-pages-b.js:276-393` |

---

## 7. Hal yang Perlu Keputusan Pengguna

1. **Agregat lintas kelas — tetap atau ikut terisolasi?** "Rekap Seluruh Kelas" (`50-pages2.js:168`), "Ringkasan sekolah & pembinaan" di Dashboard (`40-pages-a.js:114`), dan "Rekap PIP" (`40-pages-a.js:1301-1322`) menampilkan jumlah semua kelas. Apakah ketiganya tetap tampil semua kelas (lalu dipindah ke halaman "Rekap Sekolah" tersendiri, Tahap 2.2), atau ikut terkunci ke kelas aktif?
2. **Rekap Umur per Bulan — Kelas 1 atau kelas aktif?** Instruksi lama 2 Nov 2026: "Fokus Hanya Kelas 1 Saja" (komentar kode `40-pages-a.js:1283`). Instruksi baru 13 Nov 2026: "jangan tampilkan data kelas lain". Apakah rekap ini mengikuti kelas aktif, atau tetap Kelas 1 (lalu diberi label yang jelas dan dipindah dari Dashboard)?
3. **Template & unggah Buku Induk + backup/restore semua kelas — tetap atau dibatasi?** Ketiganya memang dirancang tingkat sekolah. Apakah boleh tetap mencakup semua 6 kelas, atau harus dibatasi ke kelas aktif (dengan opsi eksplisit bila ingin semua kelas)?
4. **Generator AI — boleh menyusun untuk kelas lain?** Semua generator punya pemilih kelas sendiri (S5). Apakah guru boleh menyiapkan dokumen untuk kelas lain dari satu formulir (fitur yang dipertahankan), atau pemilih itu dikunci ke kelas aktif?
5. **Riwayat Dokumen AI — global atau per kelas?** Saat ini satu daftar untuk semua kelas (S4). Apakah tetap global (riwayat kerja guru) atau difilter ke kelas aktif?
6. **Catatan Guru — tetap global?** Buku catatan guru saat ini tanpa field kelas (by design). Apakah tetap begitu, atau perlu pemisahan per kelas?
7. **Arsip "Semua Kelas" — adakah kebutuhan sah?** Mis. guru merangkap wali dua kelas, atau Kepala Sekolah perlu melihat file semua kelas. Bila ada, opsi "Semua Kelas" dipertahankan **hanya** di halaman Arsip (dengan default tetap kelas aktif); bila tidak ada, opsi itu dihapus dari semua halaman.
8. **Entri "[Kelas 1]" di kalender bersama — bagaimana?** Rencana PBL Kelas 1 menanam 178 entri ke kalender bersama (S8). Apakah dipindah ke agenda Kelas 1 saja, atau kalender diberi filter per kelas?
9. **Branch `fitur-kelas-login` — merge sekarang atau setelah Tahap 0?** Branch sudah benar untuk tujuannya, tetapi hint-nya overpromise selama titik bocor belum diperbaiki. Opsi: (a) merge sekarang + perbaiki hint; (b) kerjakan Tahap 0 dulu, lalu merge.

---

## Lampiran — Halaman yang tidak sempat diperiksa

Tidak ada. Semua halaman yang diminta dalam tugas (Dashboard, Data Siswa, Buku Induk, Data Orang Tua, Rekap Pekerjaan Orang Tua, Arsip Alumni, Jumlah Siswa per Tahun Lahir, Rekap Jumlah Siswa Bulanan, Riwayat Kesehatan, Riwayat Kelakuan, Bakat & Minat, Kalender Pendidikan, Jadwal Pelajaran, Jadwal Piket, Jurnal Mengajar, Program Tahunan, Program Semester, Rencana (CP/ATP/Prota/Promes), Kehadiran, Input Nilai Massal, Daftar Nilai, Analisis Nilai, Rekap Rapor, Perpustakaan, Catatan Guru, semua generator AI, dan pencarian global) sudah diperiksa dari kode sumber. Batasan: audit ini statis — tidak ada uji jalan (runtime) di browser, sehingga perilaku yang hanya muncul saat dipakai (mis. isi IndexedDB arsip yang sudah tersimpan di perangkat) tidak diuji langsung.
