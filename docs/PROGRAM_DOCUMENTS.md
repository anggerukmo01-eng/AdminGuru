# Program Tahunan dan Program Semester — 27 Oktober 2026

Menu kini menghasilkan DOCX asli menggunakan mesin docx 9.6.1 yang sudah tersedia, lalu merender **blob yang sama** secara lokal dengan docx-preview 0.3.7 dan JSZip 3.10.1. Unduhan adalah DOCX bertabel yang dapat diedit di Word, bukan HTML berekstensi .doc. Pratinjau memiliki halaman A4 landscape; pembagian halaman dan letak baris browser dapat berbeda dari Word; besar perbedaannya belum diukur di Microsoft Word. Bila renderer gagal, tabel HTML menjadi fallback dan DOCX tetap dapat diunduh jika generator berhasil.

## Data dan perhitungan

- TP/elemen/mapel berasal langsung dari ATP kelas aktif, tanpa memotong teks. Fase berasal dari kelas, bukan selalu A.
- Semester dipilih eksplisit. Bulan mengikuti tahun ajaran profil (YYYY/YYYY+1); tanpa tanggal tetap 2026/2027.
- Alokasi sumber ATP ambigu: label lama menyebut JP/mgg, input menyebut JP. Nilai integer ditampilkan sebagai draf; guru harus mengonfirmasi **total JP per TP**. Ekspresi seperti `2 x 35 menit` tidak dikonversi diam-diam menjadi JP.
- Total JP, sebaran 6 bulan dan catatan disimpan bersama Prota/Promes dalam `programDocumentsV1[tahunAjaran]`, di penyimpanan kelas yang sudah ada. TP tetap dikelola di menu ATP.
- Target JP intrakurikuler per mapel/semester ditetapkan guru dari struktur kurikulum kelas dan kalender efektif sekolah. JP kokurikuler tidak ikut dihitung. Tidak memakai tabel struktur khusus kelas 1 untuk semua kelas.
- Selisih rencana-target, TP belum dikonfirmasi, dan TP belum terjadwal ditandai sebagai draf. Total distribusi tidak boleh melebihi JP TP. Nol dan belum diisi dibedakan.
- Agenda diambil dari Kalender Pendidikan pada rentang bulan yang sesuai, bukan dianggap otomatis sebagai perhitungan minggu efektif.
- Naskah lama `programTahunan.isi`/`programSemester.isi` dipertahankan dalam arsip baca-saja; tidak dikonversi atau dihapus secara diam-diam.

## Pedoman dan batas klaim

Rujukan diperiksa 27 Oktober 2026:

1. PSKP Kemendikdasmen, Standar Proses: https://pskp.kemendikdasmen.go.id/standar-nasional-pendidikan-a/standar-proses — memuat Permendikdasmen 1/2026, tujuan, langkah pembelajaran, dan asesmen sebagai isi minimal dokumen perencanaan.
2. Penjelasan BBPMP Jawa Tengah: https://bbpmpjateng.kemendikdasmen.go.id/permendikdasmen-nomor-1-tahun-2026-paradigma-baru-standar-proses-pembelajaran/ — regulasi 1/2026 menggantikan 16/2022.
3. Panduan Pembelajaran dan Asesmen revisi 2025: https://kurikulum.kemendikdasmen.go.id/file/1755668120_manage_file.pdf (tautan rujukan resmi; unduhan penuh tidak berhasil saat audit).
4. Struktur kurikulum: Permendikbudristek 12/2024 sebagaimana diubah dengan Permendikdasmen 13/2025; CP yang berlaku per mapel dan kalender pendidikan satuan pendidikan.

Tidak ditemukan ketentuan dalam rujukan yang diperiksa yang mewajibkan satu format tabel Prota/Promes nasional. Tabel aplikasi adalah format operasional pemetaan TP dan JP, bukan pengganti dokumen perencanaan pembelajaran lengkap. Aplikasi tidak mengesahkan keakuratan seluruh CP/ATP tersimpan, kalender daerah, atau angka JP yang diinput pengguna.

## Verifikasi

Verifikasi terarah dan kriteria penerimaan: [PROGRAM_VERIFICATION.md](PROGRAM_VERIFICATION.md). Jalankan `npm run test:program:consistency` untuk model dan DOCX riil tanpa browser, lalu `npm run test:program:pagination` untuk unduhan/pratinjau dan dokumen panjang.

`npm test`, `npm run test:program`, dan `npm run test:browser` (Playwright, Chromium; bisa menggunakan CHROMIUM_PATH). Uji program mencakup DOCX riil dan XML tabel/header/orientasi, renderer lokal tanpa internet, konsistensi JP, persistensi, pemisahan kelas/tahun, semester ganjil/genap, arsip, empty state, dan viewport HP.

Vendor: lisensi disertakan di assets/vendor/docx-preview. Satu perubahan namespace UMD docx-preview dari `global.docx` menjadi `global.docxPreview` mencegah benturan dengan generator docx. Tidak mengubah mesin generator atau memuat dokumen ke layanan pihak ketiga.
