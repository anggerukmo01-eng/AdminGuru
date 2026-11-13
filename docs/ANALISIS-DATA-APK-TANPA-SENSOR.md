# ANALISIS ULANG — DATA APK TANPA SENSOR + EFISIENSI INPUT

**Tanggal:** 13 November 2026
**Permintaan Anggi:** "Analisa kembali untuk data versi APK isikan semua sesuai database tanpa sensor termasuk NIK dll, karena akan dipakai internal Sekolah. Pastikan permudah dan efisien serta efektif dalam input data."
**Sumber pembanding:** `seed-dapodik.js` di APK v1.0.17 (www v1.0.17, 2 Nov 2026) vs database SQLite `sdn1gerduren-2026-11-13.db` (ekspor Dapodik 13 Nov 2026; 126 siswa / 6 guru / 4 tendik).
**Metode:** baca generator seed (`adminguru-seed-dapodik/generate_seed.py`), parse seed APK, bandingkan cakupan field dengan skema database, baca jalur boot/seed aplikasi, audit formulir input (siswa, PTK, nilai, absensi).
**Catatan privasi:** dokumen ini hanya memuat NAMA FIELD dan hitungan — tidak ada satu pun nilai NIK/nomor pribadi yang ditulis di sini. Semua data lengkap hanya boleh hidup di berkas seed lokal + APK, TIDAK PERNAH di repo GitHub (publik).

---

## STATUS PELAKSANAAN (13 Nov 2026, atas perintah Anggi "Jalankan semua")

Branch **`data-lengkap-input-efisien`** (dari `main` 8b35fad). **Sudah merge ke main + push GitHub (commit snapshot `cc7b219`) dan sudah build APK v1.0.18 (13 Nov 2026, perintah Anggi "Merge ke main + build APK uji").**

### Fase 1 — SELESAI & TERVERIFIKASI
- Generator diperbarui (`adminguru-seed-dapodik/generate_seed.py`, bisa `--src`/`--date`): sumber diganti ke ekspor 13 Nov 2026 (`data-sekolah-2026/dapodik-2026-11-13/`; profil 2 Nov dipakai untuk wali — tidak ada unduhan profil baru, wali tidak berubah); `load_ptk()` mengekstrak lengkap 52 kolom Dapodik (PTK kini 51 key/orang, dari 15); agama orang tua tidak lagi di-hardcode 'Islam' (dikosongkan); telp sekolah dikosongkan (kolom Nomor Telepon di profil memang kosong).
- Seed + backup diregenerasi: `seed-dapodik-2026.js` (373.025 byte, dari 367.142) + `backup-adminguru-dapodik-2026-11-13.json`; seed lama diarsipkan sebagai `seed-dapodik-2026-11-02.js`. Tetap lokal — tidak ada di repo GitHub.
- Verifikasi vs database 13 Nov (`/tmp/verify-seed-13nov.py`, sudah hilang saat pergantian VM — hasil tercatat di sini): 0 masker, 0 placeholder; PTK 10 orang × 52 kolom = **0 perbedaan**; email Yudhy kini ymail; lisensi Kepsek 'Tidak'; siswa hanya berubah 378 field agama ortu (3×126) — selain itu identik dengan seed 2 Nov yang sudah terverifikasi; backup JSON konsisten dengan seed. Harness seed 8/8 PASS dengan seed baru.
- Pengaman boot (`90-boot.js` + banner Beranda): bila APK (file://) berjalan tanpa seed Dapodik padahal penyimpanan kosong, flag `SEED_DAPODIK_MISSING_FLAG` diset dan Beranda menampilkan peringatan keras + tombol ke Backup & Sinkronisasi; flag dihapus bila seed ditemukan. Inert di web (https) dan di harness (location tanpa protocol).

### Fase 2 — SELESAI & TERVERIFIKASI (uji browser 10/10 lulus, tanpa JS error)
- Form siswa: tombol "Simpan & Lengkapi Buku Induk" di Tambah / Ubah / Siswa Masuk (simpan dulu, lalu buka editor BI); chip "Belum lengkap" di baris siswa yang NIK/No. KK/HP-nya kosong + filter "Data Belum Lengkap" + hitungan di deskripsi halaman.
- Editor Buku Induk: tambah **13 field** (koreksi: dokumen ini sebelumnya menulis "11" — yang benar 13): email, SKHUN, No. UN, No. Ijazah, No. Akta, bank, rekening, rekening atas nama, lintang, bujur, nama di KIP, penerima KPS, No. KPS. Agama orang tua di form tidak lagi default 'Islam' (kosong bila tidak ada sumber).
- Form + tabel PTK: tambah NIK, No. KK, NPWP, bank, rekening, rekening atas nama, lintang, bujur; kolom NIK di tabel + pencarian (nama/NIP/NIK/jabatan/HP/email) + NIK di ekspor CSV PTK. Deskripsi halaman diubah: aturan lama "NIK/NPWP/rekening sengaja tidak ditampilkan" DIGANTI atas perintah eksplisit Anggi 13 Nov 2026 (APK internal sekolah) menjadi "Data lengkap Dapodik untuk pemakaian internal sekolah (termasuk NIK). Jangan dibagikan ke luar sekolah."
- Impor CSV: template + impor menerima kolom NIK, No. KK, HP, RT, RW (langsung ke Buku Induk).
- **Tiga bug lama yang ditemukan & diperbaiki selama pekerjaan ini** (di luar daftar awal, tapi satu jalur dengan input data):
  1. Form cepat/CSV menyimpan BB/TB/anak-ke/jumlah-saudara/TTL sebagai field datar, sedangkan tabel 66 kolom membaca dari `s.bi` — nilai itu tidak pernah tampil. Diperbaiki: `syncSiswaFlatKeBi()` di semua jalur simpan + migrasi sekali pakai di boot (flag `SISWA_BI_SYNC_FLAG`) untuk data lama.
  2. Kotak pencarian (siswa, guru, ortu, alumni) hanya menangkap 1 huruf pertama — render ulang di tiap ketikan menghapus input & fokus. Diperbaiki: `cariDebounce()` (tunda 250 ms, kembalikan fokus + kursor) + nilai dipertahankan.
  3. `saveBukuInduk` menugasi `db = cls` (hanya data per-kelas) — setelah menyimpan BI, halaman Guru/Beranda/Profil crash (`db.guru` undefined) sampai aplikasi dimuat ulang. Diperbaiki: `db = loadDB()`.
- Tes regresi repo `tests/program-browser.cjs` LULUS.

### Yang masih menunggu keputusan Anggi
- ~~Merge branch ini ke `main` dan/atau build APK uji (seed baru + kode baru). Seed baru belum disuntik ke APK mana pun — APK v1.0.17 di perangkat masih memakai seed 2 Nov (data siswa identik; yang tertinggal hanya data PTK lengkap + email Yudhy).~~ **SELESAI 13 Nov 2026 (perintah "Merge ke main + build APK uji"):** merge ke main + push GitHub (commit snapshot `cc7b219`) + APK **v1.0.18** (vc19, 971.951 byte, SIGN OK, seed 13 Nov, tag aset 20261113.1; smoke test isi APK lulus). Yang tersisa: **uji v1.0.18 di tablet Anggi**.
- Terbuka dari audit sebelumnya: T1 (IPAS di MAPEL_LIST + bug edit ATP), T3 (Koding Fase C), T4, T6/T7.

## RINGKASAN PUTUSAN (analisis awal, sebelum pelaksanaan)

| Bagian | Status | Keterangan |
|---|---|---|
| **Data siswa di APK** | **SUDAH lengkap tanpa sensor** | Seed 2 Nov sudah tanpa samaran (0 masker). Semua 67 kolom DB tercakup. Tidak perlu "mengisi ulang" NIK dkk. untuk siswa. |
| **Data guru/tendik di APK** | **BELUM lengkap — temuan utama** | Seed PTK hanya 15 dari 53 kolom DB. NIK, No. KK, NPWP, rekening, lintang/bujur, lisensi Kepsek, dll. TIDAK ADA di APK. |
| **Kedaluarsa vs DB 13 Nov** | **1 field** | Email tendik Yudhy: gmail (seed) → ymail (DB terbaru). |
| **Input siswa baru** | **Tidak bisa lengkap** | Form cepat (17 field) + CSV tidak punya NIK/No. KK/HP/RT/RW/rekening; pelengkapan harus lewat Buku Induk detail (2 langkah). |
| **Edit Buku Induk** | **13 field tidak bisa diubah** | Email, SKHUN, KPS, No. UN, ijazah, akta, bank, rekening, lintang/bujur, nama di KIP tampil di tabel tapi tidak ada di form edit. |
| **Input PTK** | **Tidak bisa lengkap** | Form PTK (13 field) tidak punya NIK/No. KK/NPWP/rekening/dll. |
| **Absensi & nilai** | **Sudah efisien** | "Hadir Semua (1 Klik)" + "Absen Cepat"; Input Nilai Massal. |

**Kesimpulan satu kalimat:** siswa sudah beres tanpa sensor sejak v1.0.10; pekerjaan yang tersisa adalah (1) melengkapi data PTK dari database, (2) regenerasi seed dari DB terbaru, dan (3) membuat input data baru bisa selengkap data seed — bukan mengulang pengisian data siswa.

---

## BAGIAN A — STATUS DATA APK SAAT INI (fakta terverifikasi)

### A1. Siswa: sudah lengkap tanpa sensor sejak v1.0.10
- Seed APK (`seed-dapodik.js`, www v1.0.17): 126 siswa, **0 kemunculan masker `XXXXXXXX`**. Fungsi `mask_nik`/`mask_hp` di generator sudah menjadi fungsi identitas sejak revisi 2 Nov 2026 siang ("tanpa samaran — data lengkap apa adanya", `generate_seed.py:61-67`).
- Struktur per siswa: 13 key ringkas (nama, nis/NIPD, nisn, ttl, jk, agama, alamat, ayah, ibu, pekerjaanOrtu, no, id) + dict `bi` yang memuat seluruh kolom biodata.
- Perbandingan 13 Nov 2026 (dokumen `PERBANDINGAN-APK-v1017.md`): **0 perbedaan isi** pada 60+ field yang dibandingkan (NIK, No. KK, HP, RT/RW, rekening, koordinat, KIP/KPS, akta, data ayah/ibu/wali). Semua field yang diminta Anggi (NIK dll.) ADA di seed siswa.
- Kekosongan yang wajar di seed siswa: `nis` kosong pada 45 siswa (NIPD memang kosong di Dapodik), `ayah` kosong pada 15 siswa (nama ayah tidak terisi di Dapodik), `pekerjaanOrtu` kosong pada 3 siswa — ini kekosongan SUMBER, bukan sensor.

### A2. Guru/tendik: hanya 15 dari 53 kolom — TEMUAN UTAMA
Seed PTK hanya memuat: nama, NIP, NUPTK, JK, tempat/tanggal lahir, status kepegawaian, jenis PTK, jabatan (tugas tambahan), agama, alamat (gabungan 1 baris), HP, email, pangkat.

**Kolom database (53) yang TIDAK ADA di seed PTK:**
NIK, No. KK, NPWP, nama wajib pajak, bank, nomor rekening bank, rekening atas nama, lintang, bujur, karpeg, karis/karsu, NUKS, nama ibu kandung, status perkawinan, nama suami/istri, NIP suami/istri, pekerjaan suami/istri, TMT PNS, sudah lisensi kepala sekolah, pernah diklat kepengawasan, keahlian braille, keahlian bahasa isyarat, kewarganegaraan, SK CPNS, tanggal CPNS, SK pengangkatan, TMT pengangkatan, lembaga pengangkatan, sumber gaji, RT, RW, nama dusun, desa/kelurahan, kecamatan, kode pos, telepon (hanya HP yang dibawa), nomor urut.

**Akar masalah:** `load_ptk()` di `generate_seed.py:194` hanya mengekstrak 15 kolom di atas. Bukan sensor — memang tidak pernah dibawa.
**Dampak:** data PTK di APK tidak bisa dipakai sebagai sumber internal yang lengkap (mis. NIK untuk administrasi, rekening untuk pembayaran, status lisensi Kepsek — yang justru berubah Ya→Tidak pada 13 Nov dan tidak terpantau karena fieldnya tidak ada).

### A3. Yang kedaluwarsa vs database 13 Nov 2026
- **Email Yudhy Idapriyanto (tendik):** `yudicell@gmail.com` di seed → `yudicell@ymail.com` di DB terbaru. Satu-satunya perbedaan isi yang nyata.
- **Lisensi Kepsek Yudhy:** berubah Ya → Tidak di DB terbaru; field `sudah_lisensi_kepala_sekolah` tidak ada di seed (lihat A2) sehingga perubahan ini tidak terpantau.
- **Nomor urut siswa (`no`):** seed memakai nomor per kelas, DB memakai nomor se-sekolah — kosmetik; aplikasi menomori ulang saat penggabungan. Bukan perbedaan data.

### A4. Sisa sensor/placeholder di APK (kecil, tapi perlu diketahui)
- **`SEED_BI_TXT` tersamar MASIH TERKEMAS dalam APK** (berasal dari `10-data.js` di repo; 126 masker). Saat ini INERT: boot hook (`90-boot.js:116-133`) selalu menyetel flag `BI_SEED_FLAG` sebelum memuat data bila seed Dapodik ada, sehingga seed lama tersamar tidak pernah berjalan di APK. Risiko sisa: bila suatu build kehilangan `seed-dapodik.js`, aplikasi akan jatuh diam-diam ke data tersamar lama (7 Sep 2026) tanpa peringatan keras.
- **Generator mengosongkan/mengasumsikan sebagian field orang tua:** `ortu()` (`generate_seed.py:105`) mengisi alamat & HP orang tua dengan kosong dan agama orang tua di-hardcode 'Islam'. (Di database memang tidak ada kolom alamat/HP orang tua yang terpisah, jadi tidak ada yang bisa diisi dari DB — tapi hardcode agama adalah asumsi yang sebaiknya dihapus: kosongkan bila tidak ada sumbernya.)
- **Profil sekolah:** telepon sekolah "[Belum tersedia]" (placeholder), logo kosong (wajar — logo adalah aset terpisah). Wali kelas per rombel sudah terisi benar di bucket kelas.
- **Backup JSON restore** (`backup-adminguru-dapodik-2026-11-02.json`) segenerasi dengan seed (2 Nov) — ikut kedaluwarsa untuk email Yudhy dan tidak memuat field PTK yang hilang.

### A5. Jalur data yang aman — PERTAHANKAN
- Repo GitHub (PUBLIK) **tidak** memuat `seed-dapodik.js` (dicek: tidak ada di `git ls-files`). Seed hanya disuntik lokal saat build APK + tersedia sebagai backup JSON. Prosedur ini didokumentasikan di `adminguru-android/BUILD-DATA-DAPODIK.md` dan SUDAH BENAR.
- Regenerasi seed dari DB terbaru pun harus lewat jalur yang sama: generator lokal → berkas seed lokal → suntik saat build. **Jangan pernah** meletakkan seed tanpa sensor ke repo — GitHub Pages menayangkan berkas situs secara publik meski repo privat.
- Seed lama tersamar di repo (`SEED_BI_TXT`) PERTAHANKAN — itu yang membuat versi web aman dipakai/didemo tanpa data pribadi.

---

## BAGIAN B — AUDIT ALUR INPUT (mudah, efisien, efektif?)

### B1. Sudah efisien — tidak perlu diubah
- **Absensi harian:** tombol "Hadir Semua (1 Klik)" + "Absen Cepat" (ketik nomor/nama yang TIDAK hadir, otomatis tertandai) — `80-ai.js:1335`. Pola yang benar: kasus umum 1 klik, pengecualian diketik.
- **Nilai:** Input Nilai Massal (tabel lebar: Formatif 4 LM × 4 TP + Sumatif + NR + STS + SAS + Nilai Raport otomatis) — sudah terbukti dipakai untuk 275 nilai formatif Semester 1 Kelas 1.
- **Jadwal & piket:** pemilih kelas di login + di kepala halaman (baru, 13 Nov 2026).
- **Jalur massal data lengkap:** restore backup JSON (lokal/Dropbox/cloud) lewat `applyFullBackupPayload` — satu berkas mengisi seluruh data.
- **Pencarian siswa:** mencari nama/NIS/NISN/NIK/No. KK/alamat; tabel Data Siswa 66 kolom membaca langsung dari `bi`.

### B2. Form tambah siswa tidak bisa lengkap (17 field)
`siswaFields()` (`40-pages-a.js:237`) hanya berisi: No. Absen, Nama, JK, NIS, NISN, TTL, Anak Ke-, Jumlah Saudara, Berat/Tinggi Badan, Agama, Ayah, Ibu, Pendidikan Ortu, Pekerjaan Ortu, Alamat, Keterangan.

**Tidak ada:** NIK, No. KK, HP, telepon, RT/RW, dusun, kelurahan, kecamatan, kode pos, email, SKHUN, KPS, No. UN, ijazah, akta, bank, rekening, KIP/KKS, lintang/bujur.
**Impor CSV** (`importSiswaCSV`, `40-pages-a.js:674`) memakai 17 field yang sama — jadi impor massal pun tidak bisa melengkapi data Dapodik.
**Akibat:** siswa baru/pindahan yang diinput manual TIDAK PERNAH selengkap data seed; operator harus membuka Buku Induk detail secara terpisah (langkah ke-2) — mudah terlupa dan tidak ada penanda mana siswa yang datanya belum lengkap.

### B3. Editor Buku Induk: 13 field tampil tapi tidak bisa diubah
`saveBukuInduk` (`40-pages-a.js:1382`) menyimpan NIK, No. KK, RT/RW, telepon, HP, rekening? — TIDAK. Daftar yang disimpan: panggilan, NIK, No. KK, tempat/tanggal lahir, WN, anak ke-, jumlah saudara, status yatim, bahasa, kebutuhan khusus, RT/RW/dusun/kelurahan/kecamatan/kode pos, telepon, HP, tinggal bersama, jarak, transportasi, berat/tinggi/lingkar kepala, gol. darah, penyakit, kelainan, sekolah asal, diterima kelas/tanggal, ayah/ibu/wali, KIP, nomor KIP, nomor KKS, layak PIP, alasan PIP.

**Tidak ada di form edit (dicek: tidak ada di berkas sama sekali):** email, SKHUN, penerima KPS, No. KPS, No. Peserta UN, No. Seri Ijazah, No. Registrasi Akta, bank, nomor rekening, rekening atas nama, lintang, bujur, nama di KIP.
**Akibat:** 13 field ini tampil di tabel 66 kolom tapi TIDAK BISA dikoreksi dari dalam aplikasi — hanya bisa lewat regenerasi seed/restore dari luar. "Tanpa sensor" hari ini benar untuk tampilan, belum untuk edit.

### B4. Form PTK tidak bisa lengkap (13 field)
`staffFields()` (`40-pages-a.js:200`): nama, JK, NIP, NUPTK, tempat/tanggal lahir, status, jabatan, agama, alamat, HP, email, pangkat.
**Tidak ada:** NIK, No. KK, NPWP, bank/rekening, lintang/bujur, dan semua kolom A2. Tabel PTK hanya menampilkan 8 kolom; ekspor CSV PTK hanya 7 kolom.
**Akibat:** data PTK lengkap tidak bisa dimasukkan lewat aplikasi sama sekali — selaras dengan seed yang juga tidak membawanya (A2). Keduanya harus diperbaiki bersamaan.

### B5. Tidak ada penanda kelengkapan data
Tidak ada filter/penanda "NIK kosong", "No. KK kosong", atau "data belum lengkap" per siswa — padahal datanya ada (mis. 45 siswa tanpa NIPD; beberapa tanpa HP/rekening/koordinat). Operator tidak bisa melihat sekilas siapa yang harus dilengkapi.

---

## BAGIAN C — RENCANA PELAKSANAAN (untuk persetujuan Anggi)

### Fase 1 — Data (tanpa ubah tampilan dulu)
1. **Regenerasi seed dari ekspor Dapodik terbaru** (13 Nov 2026, atau unduhan terbaru saat eksekusi) dengan generator yang diperbarui:
   - `load_ptk()`: ekstrak SEMUA 53 kolom PTK (NIK, No. KK, NPWP, rekening, lintang/bujur, lisensi Kepsek, dst.) — menutup A2.
   - Hapus hardcode agama orang tua 'Islam' (kosongkan bila tidak ada sumber).
   - Isi telepon sekolah bila ada di profil Dapodik; bila tidak ada, biarkan kosong (bukan "[Belum tersedia]" yang tampil seperti data).
   - Regenerasi backup JSON restore dari data yang sama.
   - Verifikasi: 0 masker, bandingkan ulang vs database (siswa 0 beda, PTK lengkap, email Yudhy ymail).
   - **Tetap lokal, tidak push ke GitHub.**
2. **Pengaman boot:** bila `seed-dapodik.js` tidak ditemukan saat build APK, tampilkan peringatan keras (toast + penanda di Beranda) agar aplikasi tidak diam-diam memakai data tersamar lama.

### Fase 2 — Input (kode repo — aman, tanpa PII)
3. **Form tambah siswa tetap ramping, tapi tidak buntu:** tambah tombol "Lengkapi Buku Induk" langsung dari form tambah/edit (membuka editor BI untuk siswa itu) + chip penanda "Data belum lengkap" pada baris siswa yang NIK/No. KK/HP-nya kosong. (Alternatif: tambah 4 field NIK/No. KK/HP/RT/RW ke form cepat — diputuskan bersama Anggi; rekomendasi saya opsi tombol + penanda, supaya form cepat tetap cepat.)
4. **Editor Buku Induk:** tambah 13 field yang hilang (B3) — email, SKHUN, KPS, No. UN, ijazah, akta, bank, rekening, atas nama, lintang, bujur, nama di KIP.
5. **Form + tabel PTK:** tambah NIK, No. KK, NPWP, bank/rekening, lintang/bujur; tampilkan NIK di tabel PTK (dengan pencarian NIK seperti di tabel siswa).
6. **Impor CSV siswa:** perluas template ke NIK, No. KK, HP, RT/RW (atau dokumentasikan jelas bahwa CSV hanya untuk data dasar dan pelengkapan lewat Buku Induk).
7. **(Opsional)** Filter kelengkapan di Data Siswa: "NIK kosong" / "No. KK kosong" / "HP kosong".

### Yang TIDAK dilakukan
- Tidak mengisi ulang data siswa (sudah lengkap).
- Tidak mengubah `SEED_BI_TXT` tersamar di repo.
- Tidak memasukkan seed tanpa sensor ke GitHub dalam bentuk apa pun.
- Tidak ada build APK dalam pekerjaan ini — build dilakukan terpisah atas perintah Anggi (seperti biasa).

## LAMPIRAN — PETA FIELD (nama field saja)
- Siswa DB 67 kolom → seed: tercakup semua (13 key ringkas + dict `bi` ±45 key; `no` beda penomoran, `id` beda format).
- PTK DB 53 kolom → seed: tercakup 15; hilang 38 (daftar lengkap di A2).
- Editor Buku Induk menyimpan ±40 field; hilang 11 (daftar di B3).
- Form cepat siswa 17 field; hilang ±20 field Dapodik (daftar di B2).
