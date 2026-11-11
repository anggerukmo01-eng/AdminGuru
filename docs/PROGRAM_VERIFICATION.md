# Verifikasi terarah Prota/Promes — 29 Oktober 2026

Dasar pemeriksaan: PR #5 telah digabung (`f352deb`); checkout main yang diperiksa `b3fa205`. Pemeriksaan ini menguji kontrak data dan keluaran, bukan mengesahkan CP, kalender efektif, atau target JP yang dipilih guru.

## Hasil yang sudah dijalankan

`npm run test:program:consistency`: **8/8 tes lulus**. Dua tes membuat ZIP DOCX riil dengan generator docx 9.6.1 dari HTML ProgramDocs melalui normalizer/sanitizer aplikasi dan DOM jsdom. Ini memeriksa XML hasil ekspor, bukan snapshot HTML atau pencarian kata pada source. jsdom tidak mengukur tata letak halaman.

| Bagian | Pemeriksaan otomatis |
| --- | --- |
| Prota | Urutan enam kolom, isi baris lengkap (termasuk `<`, `&`), elemen, semester, JP, catatan, rekap semester per mapel |
| Promes | Sembilan kolom: nomor, TP, JP, enam bulan; nilai distribusi tepat di kolomnya; Juli–Desember 2027 dan Januari–Juni 2028 |
| Header tabel | Setiap tabel data memiliki baris pertama `w:tblHeader` dan `w:cantSplit`; jumlah sel setiap baris cocok dengan grid |
| Halaman DOCX | Setiap section A4 landscape, 16838 × 11906 twip; margin kiri/kanan 1417 twip (2,5 cm); lebar grid positif, jumlah tepat, tidak melampaui area cetak |
| Identitas | Kelas 1 / Fase A dan tahun 2027/2028 benar di DOCX; kelas 4 / Fase B diperiksa pada model HTML |
| JP | Rencana/target/terjadwal/selisih tepat; mapel terpisah; nol berbeda dari belum diisi; alokasi ambigu tetap draf |
| Validasi | JP negatif, pecahan, kosong dan distribusi melebihi total ditolak; tahun ajaran tidak berurutan ditandai; jadwal kurang dari total tetap draf |
| Pemisahan data | Ganti tahun/objek penyimpanan kelas tidak membawa override lama; kembali ke tahun/kelas semula memulihkan alokasi pada model |
| Kelengkapan | Teks TP utuh, font Times New Roman dan field nomor halaman pada footer DOCX |

Tes penyimpanan kelas di atas menguji model dengan objek kelas berbeda. Persistensi localStorage sesudah reload dan pergantian kelas melalui UI tetap menjadi tanggung jawab `test:program` yang sudah ada.

## Pemeriksaan browser yang disiapkan

`npm run test:program:pagination` memeriksa unduhan DOCX identik byte demi byte dengan blob yang dibuat untuk pratinjau, struktur XML, dan fixture 72 TP / 432 JP. Setiap penanda TP harus muncul tepat sekali pada pratinjau. Hasil tersimpan di `test-results/program-consistency/`: empat DOCX, screenshot, dan `pagination.json` berisi jumlah halaman serta deteksi overflow. Jumlah halaman Word tidak diisi tanpa pengukuran Word.

**Belum berhasil dijalankan di lingkungan audit ini:** Chromium terunduh, tetapi proses browser berhenti karena `socket() failed: Operation not permitted`. `test:program` yang lama juga terhalang peluncuran browser. Ini bukan hasil lulus ataupun bukti adanya bug tata letak aplikasi. Jalankan pada host/CI yang mendukung Chromium:

```sh
npm ci
npx playwright install chromium
npm run test:program:consistency
npm run test:program
npm run test:program:pagination
```

Jika Chromium disediakan sistem, atur `CHROMIUM_PATH`. Tes browser memblokir permintaan HTTPS untuk memastikan generator/pratinjau lokal tidak membutuhkan layanan eksternal.

`npm test` keseluruhan sempat menunjukkan kegagalan tes tanggal lokal (`todayISO()` masih berbasis UTC) dan tes retry kegagalan otorisasi. Keduanya berada di luar jalur Prota/Promes yang diuji; jangan mengartikan 8 tes terarah lulus sebagai seluruh suite lulus. Audit ini tidak mengubah logika tanggal atau retry.

## Kontrak pagination dan cetak

1. DOCX dan renderer browser memakai data/berkas yang sama, tetapi mesin tata letaknya berbeda. Jumlah halaman, tinggi baris, posisi tanda tangan, pengulangan header secara visual, dan pemenggalan paragraf harus diperiksa terpisah. Tidak ada pengukuran yang mendukung klaim perbedaannya selalu “sedikit”.
2. `w:tblHeader` meminta Word mengulang header; tes XML tidak membuktikan header benar-benar tampil di setiap halaman Word. `cantSplit` saat ini hanya untuk header, sehingga baris isi yang panjang boleh melintasi halaman. Jangan memaksakan baris setinggi lebih dari satu halaman agar selalu utuh.
3. Tombol **Cetak tabel** membangun HTML tersendiri, bukan mencetak blob DOCX. CSS cetaknya saat ini memakai margin 15 mm dan tabel 10 pt; DOCX memakai margin 25 mm dan teks 11 pt. Karena itu hasil cetak browser tidak boleh dijanjikan identik dengan Word. Untuk dokumen final, gunakan DOCX yang diperiksa melalui Tata Letak Cetak Word.
4. Bila renderer gagal, fallback HTML tidak membuktikan pagination DOCX. Status harus menunjukkan fallback; unduhan tetap diperiksa di Word.

## Penerimaan Microsoft Word sebelum dipakai final

Gunakan berkas yang dihasilkan tes pagination; catat versi Word, OS, ketersediaan Times New Roman, ukuran kertas, skala cetak, serta jumlah halaman. Uji di Word yang dipakai guru (desktop/tablet); hasil dari LibreOffice atau browser tidak menggantikan uji ini.

| Sampel | Kriteria penerimaan |
| --- | --- |
| Prota pendek | Enam kolom berurutan; TP A dan TP B utuh; JP 12 dan 7; rekap masing-masing semester 12/12/12/0 dan 7/7/7/0 |
| Promes ganjil/genap | Enam bulan dan tahun benar; ganjil 8+4=12; genap Juni 7=7; tidak ada TP semester lain |
| Promes 72 TP | Semua BARIS-000 sampai BARIS-071 ada tepat sekali; rekap 432 JP; tabel tidak terpotong mendatar; header terbaca di halaman lanjutan; teks tidak tertutup footer |
| Tanda tangan/akhir dokumen | Nama, NIP, catatan dan nomor halaman terlihat; tidak ada baris hilang atau bertumpuk; pemenggalan baris panjang tetap dapat dibaca |
| Perbedaan browser–Word | Catat halaman/posisi yang berbeda dan screenshot keduanya; perbedaan jumlah halaman boleh diterima bila isi/JP/identitas utuh dan layout terbaca |

Status audit: kontrak model dan XML DOCX lulus; browser pagination dan penerimaan Word **masih terbuka**. Tidak ada klaim keluaran visual sudah identik atau siap disahkan tanpa pemeriksaan tersebut.
