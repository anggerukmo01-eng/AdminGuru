/* ============================================================
   4B. RENCANA PEMBELAJARAN TERINTEGRASI — KELAS 1 FASE A
   Semester Gasal T.A. 2026/2027 (periode 12 Okt – 20 Nov 2026)
   ------------------------------------------------------------
   v3 (11 Okt 2026): dihitung penuh dari JJM & kalender semester gasal.
   MPLS 13-17 Jul 2026 -> Bab 1: 20 Jul-2 Okt (11 minggu; 17 Agu libur,
   Senin off) -> STS 5-9 Okt -> Bab 2: 12 Okt-20 Nov (6 minggu) ->
   Review 23-27 Nov -> SAS mulai 1 Des 2026 (semua dari SEED_KALENDER
   & perintah guru). Total 178 entri:
     PAI 17 | Pancasila 17 | PJOK 18 | B.Indo 36 | MTK 36 |
     Mulok 18 | Seni Rupa 18 | Kokurikuler 18.
   Hari sesuai jadwal: Sen PAI+Pancasila, Sel PJOK+B.Indo,
   Rab MTK+Mulok, Kam B.Indo+Seni Rupa, Jum MTK+Kokurikuler.
   Mengintegrasikan Rencana Pembelajaran ke:
   1. Kalender Pendidikan (db.kalender, data BERSAMA semua kelas)
      - jenis "Rencana Pembelajaran", lengkap: Mapel, Materi, CP, TP
      - pengingat aktif: H-1 pukul 19.00 (persiapan mengajar)
   2. Agenda / Jurnal Mengajar (db.agenda, data PER-KELAS: kelas-1)
      - materi terisi "Materi + TP + CP", penilaian terisi fokus asesmen
      - kolom kegiatan/refleksi dikosongkan untuk diisi guru seusai mengajar
      - pengingat aktif: H-1 pukul 19.00
   Sumber materi : Buku Siswa masing-masing mapel + CP Fase A
   (SEED_CP_FASE_A, selaras Kep. Kepala BSKAP No. 046/H/KR/2025).
   Penanaman data IDEMPOTEN (flag localStorage v2) — aman dibuka berulang.
   Migrasi v1->v2: entri v1 (semua bertanggal Senin) otomatis diganti v2.
   Menghapus integrasi: panggil window.hapusRencanaPbl() dari konsol,
   atau hapus manual entri berjenis "Rencana Pembelajaran" / berjudul
   "[Kelas 1]" melalui menu Kalender & Jurnal.
   ============================================================ */
const RENCANA_PBL_FLAG = "tpsd2026_rencana_pbl_k1_2426_v3";
const RENCANA_PBL_TAG = "pbl-k1-2426-v3";
const RENCANA_PBL_TAG_LAMA = ["pbl-k1-2426","pbl-k1-2426-v2"];
function rencanaHari(tglISO){
  const d = new Date(tglISO+"T00:00:00").getDay();
  return ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"][d]||"";
}

/* ---- CP Fase A per elemen (disalin dari SEED_CP_FASE_A) ---- */
const RENCANA_CP = {
  PAI_QURAN:{elemen:"Al-Qur'an Hadis", teks:"Membaca dan membedakan huruf hijaiah berharakat serta huruf hijaiah bersambung; menghafal Surah al-Fatihah dan beberapa surah pendek Al-Qur'an; memahami hadis tentang kebersihan sebagai bagian dari cinta kepada Al-Qur'an dan Hadis Nabi."},
  PAI_FIKIH:{elemen:"Fikih", teks:"Memahami rukun Islam, syahadatain, tata cara bersuci, salat fardu, azan, ikamah, zikir, dan berdoa setelah salat sebagai pembiasaan ibadah dasar (ubudiyyah)."},
  PAI_AKHLAK:{elemen:"Akhlak", teks:"Menerapkan akhlak terhadap Allah Swt. dengan menyucikan dan memuji-Nya, serta akhlak terhadap diri sendiri melalui pembiasaan perilaku terpuji (mahmudah) sehari-hari, sebagai wujud akhlak mulia (makarim al-akhlaq)."},
  PP_UUD:{elemen:"UUD NRI Tahun 1945", teks:"Mengenal aturan di lingkungan keluarga; menunjukkan dan menceritakan sikap mematuhi aturan di lingkungan keluarga."},
  PP_BHINNEKA:{elemen:"Bhinneka Tunggal Ika", teks:"Mengenal semboyan Bhinneka Tunggal Ika; mengidentifikasi dan menghargai identitas dirinya sesuai jenis kelamin, hobi, bahasa, serta agama dan kepercayaan di lingkungan sekitar."},
  PP_NKRI:{elemen:"NKRI", teks:"Mengenal karakteristik lingkungan tempat tinggal dan sekolah sebagai bagian dari wilayah NKRI; mempraktikkan kerja sama menjaga lingkungan sekitar dalam keberagaman."},
  BI_BACA:{elemen:"Membaca dan Memirsa", teks:"Membaca kata-kata sederhana dengan fasih tentang diri, keluarga, kesehatan, dan/atau lingkungan sekitar; memahami isi bacaan dan/atau tayangan yang dipirsa."},
  BI_TULIS:{elemen:"Menulis", teks:"Menulis permulaan dengan benar di atas kertas dan/atau media digital; mengembangkan tulisan tangan; menulis berbagai tipe teks sederhana tentang diri, keluarga, dan/atau lingkungan sekitar."},
  BI_BICARA:{elemen:"Berbicara dan Mempresentasikan", teks:"Merespons dengan bertanya, menjawab, dan menanggapi komentar orang lain secara santun; mengungkapkan perasaan dan gagasan secara lisan."},
  MTK_BIL:{elemen:"Bilangan", teks:"Menunjukkan pemahaman bilangan cacah sampai 100; membaca, menulis, menentukan nilai tempat, membandingkan, mengurutkan bilangan; operasi penjumlahan-pengurangan sampai 20; memahami pecahan setengah dan seperempat."},
  MTK_UKUR:{elemen:"Pengukuran", teks:"Membandingkan panjang, berat, dan durasi waktu secara langsung; mengukur dan mengestimasi panjang/berat benda dengan satuan tidak baku."},
  MTK_GEO:{elemen:"Geometri", teks:"Mengenal bangun datar dan bangun ruang; melakukan komposisi/dekomposisi bangun datar; menentukan posisi benda relatif (kanan, kiri, depan, belakang, atas, bawah)."},
  SR_ALAMI:{elemen:"Mengalami", teks:"Mengenali dan menyebutkan unsur-unsur rupa dalam benda-benda di sekitar/karya seni rupa."},
  SR_CIPTA:{elemen:"Menciptakan", teks:"Membuat karya seni rupa berdasarkan pengalaman dan hasil pengamatan terhadap lingkungan sekitar."},
  PJOK_GERAK:{elemen:"Terampil Bergerak", teks:"Mempraktikkan keterampilan gerak fundamental dan menerapkannya dalam berbagai situasi gerak yang berbeda."},
  PJOK_FAIR:{elemen:"Belajar Melalui Gerak", teks:"Menaati peraturan untuk menumbuhkan fair play dalam aktivitas jasmani; menerapkan strategi kolaborasi sederhana."},
  PJOK_AKTIF:{elemen:"Bergaya Hidup Aktif", teks:"Berpartisipasi dalam berbagai aktivitas jasmani dan mengidentifikasi manfaatnya bagi tubuh."},
  PJOK_SEHAT:{elemen:"Memilih Hidup yang Menyehatkan", teks:"Mengenali gaya hidup aktif dan sehat, manfaat makanan bergizi seimbang, serta strategi mencari bantuan kepada orang dewasa terpercaya saat berisiko."},
  MULOK:{elemen:"Muatan Lokal", teks:"Mengikuti CP/TP muatan lokal Bahasa Jawa sesuai kurikulum daerah dan ketentuan sekolah (tidak ada CP nasional untuk muatan lokal)."},
  KOKURIKULER:{elemen:"Kokurikuler / Projek Penguatan Profil Pelajar Pancasila", teks:"Mengembangkan dimensi Profil Pelajar Pancasila (beriman-bertakwa dan berakhlak mulia, berkebinekaan global, bergotong royong, mandiri, bernalar kritis, kreatif) melalui projek kokurikuler."}
};

/* ---- 178 rencana v3: dihitung dari JJM & kalender semester gasal ---- */
const RENCANA_PBL = [
 {m:"Pendidikan Agama Islam dan Budi Pekerti",per:"Bab 1",t:"2026-07-20",mat:"Huruf hijaiyah berharakat fathah: mengenal, membaca & menulis",cp:"PAI_QURAN",tp:"Peserta didik mampu membaca dan menulis huruf hijaiyah berharakat fathah dengan benar.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Agama Islam dan Budi Pekerti",per:"Bab 1",t:"2026-07-27",mat:"Huruf hijaiyah berharakat kasrah dan dammah",cp:"PAI_QURAN",tp:"Peserta didik mampu membaca dan membedakan huruf hijaiyah berharakat kasrah dan dammah.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Agama Islam dan Budi Pekerti",per:"Bab 1",t:"2026-08-03",mat:"Latihan membaca & menulis huruf hijaiyah berharakat",cp:"PAI_QURAN",tp:"Peserta didik mampu membaca dan menulis huruf hijaiyah berharakat dengan lancar.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Agama Islam dan Budi Pekerti",per:"Bab 1",t:"2026-08-10",mat:"Huruf hijaiyah bersambung: bentuk awal, tengah & akhir",cp:"PAI_QURAN",tp:"Peserta didik mampu mengenali bentuk huruf hijaiyah bersambung di awal, tengah, dan akhir kata.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Agama Islam dan Budi Pekerti",per:"Bab 1",t:"2026-08-24",mat:"Membaca & menulis kata berhijaiyah bersambung",cp:"PAI_QURAN",tp:"Peserta didik mampu membaca dan menulis kata berhijaiyah bersambung dengan benar.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Agama Islam dan Budi Pekerti",per:"Bab 1",t:"2026-08-31",mat:"Hafalan Surah Al-Fatihah ayat 1-4",cp:"PAI_QURAN",tp:"Peserta didik mampu menghafal Surah Al-Fatihah ayat 1-4 dengan tartil.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Agama Islam dan Budi Pekerti",per:"Bab 1",t:"2026-09-07",mat:"Hafalan Surah Al-Fatihah ayat 5-7 & arti sederhana",cp:"PAI_QURAN",tp:"Peserta didik mampu menghafal Surah Al-Fatihah ayat 5-7 dan menyebutkan artinya secara sederhana.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Agama Islam dan Budi Pekerti",per:"Bab 1",t:"2026-09-14",mat:"Hafalan Surah Al-Ikhlas",cp:"PAI_QURAN",tp:"Peserta didik mampu menghafal Surah Al-Ikhlas dengan tartil.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Agama Islam dan Budi Pekerti",per:"Bab 1",t:"2026-09-21",mat:"Hafalan Surah Al-Kautsar",cp:"PAI_QURAN",tp:"Peserta didik mampu menghafal Surah Al-Kautsar dengan tartil.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Agama Islam dan Budi Pekerti",per:"Bab 1",t:"2026-09-28",mat:"Hadis tentang kebersihan; doa sebelum & sesudah makan; review Bab 1",cp:"PAI_QURAN",tp:"Peserta didik mampu menyebutkan hadis tentang kebersihan dan melafalkan doa sebelum dan sesudah makan.",n:"Sumatif lingkup materi (persiapan STS)"},
 {m:"Pendidikan Agama Islam dan Budi Pekerti",per:"Bab 2",t:"2026-10-12",mat:"Rukun Islam: pengertian & urutannya",cp:"PAI_FIKIH",tp:"Peserta didik mampu menyebutkan rukun Islam secara urut.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Agama Islam dan Budi Pekerti",per:"Bab 2",t:"2026-10-19",mat:"Syahadatain: lafal, arti & maknanya",cp:"PAI_FIKIH",tp:"Peserta didik mampu melafalkan syahadatain beserta artinya.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Agama Islam dan Budi Pekerti",per:"Bab 2",t:"2026-10-26",mat:"Bersuci: tata cara wudu yang benar",cp:"PAI_FIKIH",tp:"Peserta didik mampu menyebutkan tata cara wudu secara urut.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Agama Islam dan Budi Pekerti",per:"Bab 2",t:"2026-11-02",mat:"Praktik wudu berkelompok",cp:"PAI_FIKIH",tp:"Peserta didik mampu mempraktikkan wudu dengan benar.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Agama Islam dan Budi Pekerti",per:"Bab 2",t:"2026-11-09",mat:"Salat fardu: nama, waktu & gerakan dasarnya",cp:"PAI_FIKIH",tp:"Peserta didik mampu menyebutkan nama salat fardu dan waktu pelaksanaannya.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Agama Islam dan Budi Pekerti",per:"Bab 2",t:"2026-11-16",mat:"Doa setelah salat; akhlak terpuji (jujur & hormat); review Bab 2",cp:"PAI_AKHLAK",tp:"Peserta didik mampu menunjukkan akhlak terpuji (jujur, hormat kepada orang tua dan guru) dalam kehidupan sehari-hari.",n:"Sumatif lingkup materi (persiapan SAS)"},
 {m:"Pendidikan Agama Islam dan Budi Pekerti",per:"Review SAS",t:"2026-11-23",mat:"Review menyeluruh semester gasal & persiapan SAS",cp:"PAI_QURAN",tp:"Peserta didik siap mengikuti SAS dengan review materi semester gasal.",n:"Persiapan SAS"},
 {m:"Pendidikan Pancasila",per:"Bab 1",t:"2026-07-20",mat:"Identitas diri: nama, ciri fisik & kesukaan",cp:"PP_BHINNEKA",tp:"Peserta didik mampu mengidentifikasi dan menceritakan identitas dirinya dengan percaya diri.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Pancasila",per:"Bab 1",t:"2026-07-27",mat:"Berkenalan dengan teman sekelas",cp:"PP_BHINNEKA",tp:"Peserta didik mampu berkenalan dan menyebutkan identitas temannya.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Pancasila",per:"Bab 1",t:"2026-08-03",mat:"Menghargai perbedaan hobi & bahasa teman",cp:"PP_BHINNEKA",tp:"Peserta didik mampu menghargai perbedaan hobi dan bahasa teman di sekitarnya.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Pancasila",per:"Bab 1",t:"2026-08-10",mat:"Menghargai perbedaan agama & kepercayaan",cp:"PP_BHINNEKA",tp:"Peserta didik mampu menghargai perbedaan agama dan kepercayaan di lingkungan sekitar.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Pancasila",per:"Bab 1",t:"2026-08-24",mat:"Aturan di kelas: contoh & manfaatnya",cp:"PP_UUD",tp:"Peserta didik mampu menyebutkan contoh aturan di kelas dan manfaatnya.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Pancasila",per:"Bab 1",t:"2026-08-31",mat:"Mematuhi aturan kelas sehari-hari",cp:"PP_UUD",tp:"Peserta didik mampu menunjukkan sikap mematuhi aturan kelas.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Pancasila",per:"Bab 1",t:"2026-09-07",mat:"Aturan permainan bersama teman",cp:"PP_UUD",tp:"Peserta didik mampu menyebutkan dan mematuhi aturan permainan dengan tertib dan sportif.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Pancasila",per:"Bab 1",t:"2026-09-14",mat:"Aturan di rumah: contoh & manfaatnya",cp:"PP_UUD",tp:"Peserta didik mampu menyebutkan contoh aturan di lingkungan keluarga.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Pancasila",per:"Bab 1",t:"2026-09-21",mat:"Mematuhi aturan di rumah",cp:"PP_UUD",tp:"Peserta didik mampu menceritakan sikap mematuhi aturan di rumah.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Pancasila",per:"Bab 1",t:"2026-09-28",mat:"Kerja sama di kelas; review Bab 1",cp:"PP_NKRI",tp:"Peserta didik mampu mempraktikkan kerja sama dengan teman di kelas.",n:"Sumatif lingkup materi (persiapan STS)"},
 {m:"Pendidikan Pancasila",per:"Bab 2",t:"2026-10-12",mat:"Lingkungan rumah & sekolahku",cp:"PP_NKRI",tp:"Peserta didik mampu mengenali karakteristik lingkungan rumah dan sekolahnya.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Pancasila",per:"Bab 2",t:"2026-10-19",mat:"Menjaga kebersihan lingkungan",cp:"PP_NKRI",tp:"Peserta didik mampu menyebutkan cara menjaga kebersihan lingkungan.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Pancasila",per:"Bab 2",t:"2026-10-26",mat:"Kerja sama menjaga lingkungan sekitar",cp:"PP_NKRI",tp:"Peserta didik mampu mempraktikkan kerja sama menjaga kebersihan lingkungan.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Pancasila",per:"Bab 2",t:"2026-11-02",mat:"Aturan di sekolah",cp:"PP_UUD",tp:"Peserta didik mampu menyebutkan contoh aturan di sekolah.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Pancasila",per:"Bab 2",t:"2026-11-09",mat:"Mematuhi aturan di sekolah",cp:"PP_UUD",tp:"Peserta didik mampu menunjukkan sikap mematuhi aturan di sekolah.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Pancasila",per:"Bab 2",t:"2026-11-16",mat:"Peduli tempat tinggal; review Bab 2",cp:"PP_NKRI",tp:"Peserta didik mampu menunjukkan kepedulian terhadap tempat tinggalnya.",n:"Sumatif lingkup materi (persiapan SAS)"},
 {m:"Pendidikan Pancasila",per:"Review SAS",t:"2026-11-23",mat:"Review & persiapan SAS",cp:"PP_BHINNEKA",tp:"Peserta didik siap mengikuti SAS.",n:"Persiapan SAS"},
 {m:"PJOK",per:"Bab 1",t:"2026-07-21",mat:"Gerak lokomotor: berjalan & berlari",cp:"PJOK_GERAK",tp:"Peserta didik mampu mempraktikkan gerak berjalan dan berlari dengan benar.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"PJOK",per:"Bab 1",t:"2026-07-28",mat:"Gerak lokomotor: melompat & meloncat",cp:"PJOK_GERAK",tp:"Peserta didik mampu mempraktikkan gerak melompat dan meloncat.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"PJOK",per:"Bab 1",t:"2026-08-04",mat:"Gerak non-lokomotor: membungkuk & memutar",cp:"PJOK_GERAK",tp:"Peserta didik mampu mempraktikkan gerak membungkuk dan memutar.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"PJOK",per:"Bab 1",t:"2026-08-11",mat:"Gerak non-lokomotor: meliuk & mengayun",cp:"PJOK_GERAK",tp:"Peserta didik mampu mempraktikkan gerak meliuk dan mengayun.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"PJOK",per:"Bab 1",t:"2026-08-18",mat:"Gerak manipulatif: melempar bola",cp:"PJOK_GERAK",tp:"Peserta didik mampu mempraktikkan gerak melempar bola dengan tepat.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"PJOK",per:"Bab 1",t:"2026-08-25",mat:"Gerak manipulatif: menangkap bola",cp:"PJOK_GERAK",tp:"Peserta didik mampu mempraktikkan gerak menangkap bola.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"PJOK",per:"Bab 1",t:"2026-09-01",mat:"Gerak manipulatif: menendang bola",cp:"PJOK_GERAK",tp:"Peserta didik mampu mempraktikkan gerak menendang bola.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"PJOK",per:"Bab 1",t:"2026-09-08",mat:"Kombinasi gerak dasar lokomotor, non-lokomotor & manipulatif",cp:"PJOK_GERAK",tp:"Peserta didik mampu mempraktikkan kombinasi gerak dasar.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"PJOK",per:"Bab 1",t:"2026-09-15",mat:"Permainan sederhana: fair play",cp:"PJOK_FAIR",tp:"Peserta didik mampu bermain permainan sederhana dengan menaati peraturan (fair play).",n:"Formatif: observasi dan unjuk kerja"},
 {m:"PJOK",per:"Bab 1",t:"2026-09-22",mat:"Latihan keseimbangan tubuh",cp:"PJOK_AKTIF",tp:"Peserta didik mampu mempraktikkan latihan keseimbangan tubuh.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"PJOK",per:"Bab 1",t:"2026-09-29",mat:"Pola hidup sehat; review Bab 1",cp:"PJOK_SEHAT",tp:"Peserta didik mampu menyebutkan pola hidup sehat sehari-hari.",n:"Sumatif lingkup materi (persiapan STS)"},
 {m:"PJOK",per:"Bab 2",t:"2026-10-13",mat:"Permainan bola kecil: menggiring bola",cp:"PJOK_FAIR",tp:"Peserta didik mampu menggiring bola kecil dengan terkendali.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"PJOK",per:"Bab 2",t:"2026-10-20",mat:"Permainan bola kecil: menendang ke sasaran",cp:"PJOK_FAIR",tp:"Peserta didik mampu menendang bola ke sasaran dengan tepat.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"PJOK",per:"Bab 2",t:"2026-10-27",mat:"Permainan tradisional: gobak sodor sederhana",cp:"PJOK_FAIR",tp:"Peserta didik mampu bermain gobak sodor sederhana dengan sportif.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"PJOK",per:"Bab 2",t:"2026-11-03",mat:"Permainan tradisional: engklek",cp:"PJOK_AKTIF",tp:"Peserta didik mampu bermain engklek dengan gembira.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"PJOK",per:"Bab 2",t:"2026-11-10",mat:"Latihan kelenturan tubuh",cp:"PJOK_AKTIF",tp:"Peserta didik mampu mempraktikkan latihan kelenturan tubuh.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"PJOK",per:"Bab 2",t:"2026-11-17",mat:"Manfaat aktivitas fisik; review Bab 2",cp:"PJOK_SEHAT",tp:"Peserta didik mampu menyebutkan manfaat aktivitas fisik bagi tubuh.",n:"Sumatif lingkup materi (persiapan SAS)"},
 {m:"PJOK",per:"Review SAS",t:"2026-11-24",mat:"Praktik & persiapan SAS",cp:"PJOK_GERAK",tp:"Peserta didik siap mengikuti SAS praktik.",n:"Persiapan SAS"},
 {m:"Bahasa Indonesia",per:"Bab 1",t:"2026-07-21",mat:"Suku kata terbuka: ba-bi-bu-be-bo",cp:"BI_BACA",tp:"Peserta didik mampu membaca suku kata terbuka ba-bi-bu-be-bo dengan fasih.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 1",t:"2026-07-23",mat:"Membaca kata bermakna bersuku terbuka",cp:"BI_BACA",tp:"Peserta didik mampu membaca kata-kata sederhana bermakna.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 1",t:"2026-07-28",mat:"Suku kata terbuka: ca-ci-cu & ma-mi-mu",cp:"BI_BACA",tp:"Peserta didik mampu membaca suku kata terbuka lainnya dengan fasih.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 1",t:"2026-07-30",mat:"Permainan kartu suku kata",cp:"BI_BACA",tp:"Peserta didik mampu menyusun kata dari kartu suku kata.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 1",t:"2026-08-04",mat:"Kata bersuku tertutup pola KVK: membaca",cp:"BI_BACA",tp:"Peserta didik mampu membaca kata bersuku kata tertutup pola KVK.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 1",t:"2026-08-06",mat:"Menulis kata berpola KVK",cp:"BI_TULIS",tp:"Peserta didik mampu menulis kata berpola KVK dengan benar.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 1",t:"2026-08-11",mat:"Membaca kalimat sederhana (2-3 kata)",cp:"BI_BACA",tp:"Peserta didik mampu membaca kalimat sederhana dengan fasih.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 1",t:"2026-08-13",mat:"Menjawab pertanyaan isi bacaan",cp:"BI_BACA",tp:"Peserta didik mampu menjawab pertanyaan tentang isi bacaan.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 1",t:"2026-08-18",mat:"Membaca kalimat (4-5 kata)",cp:"BI_BACA",tp:"Peserta didik mampu membaca kalimat yang lebih panjang dengan fasih.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 1",t:"2026-08-20",mat:"Menceritakan isi bacaan",cp:"BI_BICARA",tp:"Peserta didik mampu menceritakan kembali isi bacaan secara sederhana.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 1",t:"2026-08-25",mat:"Menyalin kalimat dengan benar",cp:"BI_TULIS",tp:"Peserta didik mampu menyalin kalimat dengan tulisan yang benar.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 1",t:"2026-08-27",mat:"Melengkapi kalimat rumpang",cp:"BI_TULIS",tp:"Peserta didik mampu melengkapi kalimat rumpang dengan kata yang tepat.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 1",t:"2026-09-01",mat:"Kata sifat: besar-kecil, panjang-pendek",cp:"BI_BACA",tp:"Peserta didik mampu menyebutkan kata sifat dalam konteks kalimat.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 1",t:"2026-09-03",mat:"Kata sifat dalam kalimat",cp:"BI_BACA",tp:"Peserta didik mampu menggunakan kata sifat dalam kalimat sederhana.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 1",t:"2026-09-08",mat:"Lawan kata sederhana",cp:"BI_BACA",tp:"Peserta didik mampu menyebutkan lawan kata sederhana.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 1",t:"2026-09-10",mat:"Menggunakan lawan kata dalam kalimat",cp:"BI_BICARA",tp:"Peserta didik mampu menggunakan lawan kata dalam kalimat lisan.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 1",t:"2026-09-15",mat:"Membaca nyaring teks pendek",cp:"BI_BACA",tp:"Peserta didik mampu membaca nyaring teks pendek dengan lafal tepat.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 1",t:"2026-09-17",mat:"Berbicara: memperkenalkan diri",cp:"BI_BICARA",tp:"Peserta didik mampu memperkenalkan diri secara lisan dengan santun.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 1",t:"2026-09-22",mat:"Berbicara: bercerita tentang keluarga",cp:"BI_BICARA",tp:"Peserta didik mampu bercerita tentang keluarganya secara runtut.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 1",t:"2026-09-24",mat:"Berbicara: bercerita tentang pengalaman",cp:"BI_BICARA",tp:"Peserta didik mampu bercerita tentang pengalamannya secara lisan.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 1",t:"2026-09-29",mat:"Review membaca & menulis",cp:"BI_BACA",tp:"Peserta didik mampu menunjukkan kemampuan membaca dan menulis permulaan.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 1",t:"2026-10-01",mat:"Review berbicara; persiapan STS",cp:"BI_BICARA",tp:"Peserta didik siap mengikuti STS.",n:"Sumatif lingkup materi (persiapan STS)"},
 {m:"Bahasa Indonesia",per:"Bab 2",t:"2026-10-13",mat:"Membaca teks pendek bertema sekolah",cp:"BI_BACA",tp:"Peserta didik mampu membaca teks pendek bertema sekolah dengan fasih.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 2",t:"2026-10-15",mat:"Menjawab pertanyaan isi teks",cp:"BI_BACA",tp:"Peserta didik mampu menjawab pertanyaan tentang isi teks.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 2",t:"2026-10-20",mat:"Kosakata baru dari bacaan",cp:"BI_BACA",tp:"Peserta didik mampu menyebutkan arti kosakata baru dari bacaan.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 2",t:"2026-10-22",mat:"Menulis kalimat dari kosakata",cp:"BI_TULIS",tp:"Peserta didik mampu menulis kalimat sederhana menggunakan kosakata baru.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 2",t:"2026-10-27",mat:"Teks deskripsi sederhana",cp:"BI_BACA",tp:"Peserta didik mampu membaca teks deskripsi sederhana.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 2",t:"2026-10-29",mat:"Menulis deskripsi teman",cp:"BI_TULIS",tp:"Peserta didik mampu menulis deskripsi singkat tentang temannya.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 2",t:"2026-11-03",mat:"Membaca puisi anak sederhana",cp:"BI_BACA",tp:"Peserta didik mampu membaca puisi anak dengan intonasi tepat.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 2",t:"2026-11-05",mat:"Mendeklamasikan puisi",cp:"BI_BICARA",tp:"Peserta didik mampu mendeklamasikan puisi anak dengan percaya diri.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 2",t:"2026-11-10",mat:"Berbicara: menyampaikan pesan",cp:"BI_BICARA",tp:"Peserta didik mampu menyampaikan pesan secara lisan dengan jelas.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 2",t:"2026-11-12",mat:"Bermain peran: dialog sederhana",cp:"BI_BICARA",tp:"Peserta didik mampu bermain peran dialog sederhana dengan santun.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 2",t:"2026-11-17",mat:"Review Bab 2",cp:"BI_BACA",tp:"Peserta didik mampu menunjukkan pemahaman materi Bab 2.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",per:"Bab 2",t:"2026-11-19",mat:"Persiapan SAS",cp:"BI_BICARA",tp:"Peserta didik siap mengikuti SAS.",n:"Sumatif lingkup materi (persiapan SAS)"},
 {m:"Bahasa Indonesia",per:"Review SAS",t:"2026-11-24",mat:"Review membaca permulaan",cp:"BI_BACA",tp:"Peserta didik siap mengikuti SAS.",n:"Persiapan SAS"},
 {m:"Bahasa Indonesia",per:"Review SAS",t:"2026-11-26",mat:"Review menulis & berbicara",cp:"BI_TULIS",tp:"Peserta didik siap mengikuti SAS.",n:"Persiapan SAS"},
 {m:"Matematika",per:"Bab 1",t:"2026-07-22",mat:"Bilangan 11-15: membaca & menulis",cp:"MTK_BIL",tp:"Peserta didik mampu membaca dan menulis lambang bilangan 11-15.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 1",t:"2026-07-24",mat:"Bilangan 16-20: membaca & menulis",cp:"MTK_BIL",tp:"Peserta didik mampu membaca dan menulis lambang bilangan 16-20.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 1",t:"2026-07-29",mat:"Membandingkan bilangan (lebih dari/kurang dari)",cp:"MTK_BIL",tp:"Peserta didik mampu membandingkan dua bilangan 11-20.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 1",t:"2026-07-31",mat:"Mengurutkan bilangan 11-20",cp:"MTK_BIL",tp:"Peserta didik mampu mengurutkan bilangan 11-20.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 1",t:"2026-08-05",mat:"Nilai tempat: puluhan",cp:"MTK_BIL",tp:"Peserta didik mampu menentukan nilai tempat puluhan.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 1",t:"2026-08-07",mat:"Nilai tempat: satuan",cp:"MTK_BIL",tp:"Peserta didik mampu menentukan nilai tempat satuan.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 1",t:"2026-08-12",mat:"Penjumlahan dengan benda konkret (hasil <= 10)",cp:"MTK_BIL",tp:"Peserta didik mampu menjumlahkan dua bilangan sampai 10 dengan benda konkret.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 1",t:"2026-08-14",mat:"Penjumlahan dengan garis bilangan (hasil <= 20)",cp:"MTK_BIL",tp:"Peserta didik mampu menjumlahkan dua bilangan sampai 20 dengan garis bilangan.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 1",t:"2026-08-19",mat:"Pengurangan dengan benda konkret (<= 10)",cp:"MTK_BIL",tp:"Peserta didik mampu mengurangkan dua bilangan sampai 10 dengan benda konkret.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 1",t:"2026-08-21",mat:"Pengurangan dengan garis bilangan (<= 20)",cp:"MTK_BIL",tp:"Peserta didik mampu mengurangkan dua bilangan sampai 20 dengan garis bilangan.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 1",t:"2026-08-26",mat:"Latihan campuran penjumlahan & pengurangan",cp:"MTK_BIL",tp:"Peserta didik mampu menyelesaikan latihan campuran penjumlahan dan pengurangan.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 1",t:"2026-08-28",mat:"Soal cerita penjumlahan",cp:"MTK_BIL",tp:"Peserta didik mampu menyelesaikan soal cerita penjumlahan sehari-hari.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 1",t:"2026-09-02",mat:"Soal cerita pengurangan",cp:"MTK_BIL",tp:"Peserta didik mampu menyelesaikan soal cerita pengurangan sehari-hari.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 1",t:"2026-09-04",mat:"Soal cerita campuran",cp:"MTK_BIL",tp:"Peserta didik mampu menyelesaikan soal cerita campuran sehari-hari.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 1",t:"2026-09-09",mat:"Pecahan: setengah (benda konkret)",cp:"MTK_BIL",tp:"Peserta didik mampu memahami pecahan setengah melalui benda konkret.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 1",t:"2026-09-11",mat:"Pecahan: seperempat (benda konkret)",cp:"MTK_BIL",tp:"Peserta didik mampu memahami pecahan seperempat melalui benda konkret.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 1",t:"2026-09-16",mat:"Review bilangan 11-20",cp:"MTK_BIL",tp:"Peserta didik mampu menunjukkan pemahaman bilangan 11-20.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 1",t:"2026-09-18",mat:"Review operasi hitung",cp:"MTK_BIL",tp:"Peserta didik mampu menunjukkan kemampuan operasi hitung sampai 20.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 1",t:"2026-09-23",mat:"Latihan soal Bab 1 (1)",cp:"MTK_BIL",tp:"Peserta didik mampu menyelesaikan latihan soal Bab 1.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 1",t:"2026-09-25",mat:"Latihan soal Bab 1 (2)",cp:"MTK_BIL",tp:"Peserta didik mampu menyelesaikan latihan soal Bab 1.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 1",t:"2026-09-30",mat:"Remedial & pengayaan Bab 1",cp:"MTK_BIL",tp:"Peserta didik mengikuti remedial/pengayaan sesuai kebutuhan.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 1",t:"2026-10-02",mat:"Persiapan STS",cp:"MTK_BIL",tp:"Peserta didik siap mengikuti STS.",n:"Sumatif lingkup materi (persiapan STS)"},
 {m:"Matematika",per:"Bab 2",t:"2026-10-14",mat:"Membandingkan panjang secara langsung",cp:"MTK_UKUR",tp:"Peserta didik mampu membandingkan panjang dua benda secara langsung.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 2",t:"2026-10-16",mat:"Mengukur dengan jengkal (satuan tidak baku)",cp:"MTK_UKUR",tp:"Peserta didik mampu mengukur panjang dengan satuan tidak baku (jengkal).",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 2",t:"2026-10-21",mat:"Mengukur dengan langkah & pensil",cp:"MTK_UKUR",tp:"Peserta didik mampu mengukur dengan satuan tidak baku lainnya.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 2",t:"2026-10-23",mat:"Membandingkan berat dua benda",cp:"MTK_UKUR",tp:"Peserta didik mampu membandingkan berat dua benda.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 2",t:"2026-10-28",mat:"Waktu: pagi, siang, sore, malam; nama-nama hari",cp:"MTK_UKUR",tp:"Peserta didik mampu menyebutkan bagian waktu sehari dan nama hari.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 2",t:"2026-10-30",mat:"Membaca jam tepat",cp:"MTK_UKUR",tp:"Peserta didik mampu membaca jam tepat.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 2",t:"2026-11-04",mat:"Bangun datar: segitiga & segiempat",cp:"MTK_GEO",tp:"Peserta didik mampu mengenali bangun datar segitiga dan segiempat.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 2",t:"2026-11-06",mat:"Bangun datar: lingkaran; mengelompokkan",cp:"MTK_GEO",tp:"Peserta didik mampu mengenali lingkaran dan mengelompokkan bangun datar.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 2",t:"2026-11-11",mat:"Bangun ruang: kubus & balok",cp:"MTK_GEO",tp:"Peserta didik mampu mengenali bangun ruang kubus dan balok.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 2",t:"2026-11-13",mat:"Posisi benda: kanan-kiri, depan-belakang, atas-bawah",cp:"MTK_GEO",tp:"Peserta didik mampu menentukan posisi benda relatif.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 2",t:"2026-11-18",mat:"Review Bab 2",cp:"MTK_UKUR",tp:"Peserta didik mampu menunjukkan pemahaman materi Bab 2.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",per:"Bab 2",t:"2026-11-20",mat:"Persiapan SAS",cp:"MTK_GEO",tp:"Peserta didik siap mengikuti SAS.",n:"Sumatif lingkup materi (persiapan SAS)"},
 {m:"Matematika",per:"Review SAS",t:"2026-11-25",mat:"Review bilangan & operasi hitung",cp:"MTK_BIL",tp:"Peserta didik siap mengikuti SAS.",n:"Persiapan SAS"},
 {m:"Matematika",per:"Review SAS",t:"2026-11-27",mat:"Review pengukuran & geometri",cp:"MTK_GEO",tp:"Peserta didik siap mengikuti SAS.",n:"Persiapan SAS"},
 {m:"Muatan Lokal",per:"Bab 1",t:"2026-07-22",mat:"Salam & perkenalan diri nganggo basa Jawa ngoko",cp:"MULOK",tp:"Peserta didik mampu mengucapkan salam dan memperkenalkan diri nganggo basa Jawa ngoko.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Muatan Lokal",per:"Bab 1",t:"2026-07-29",mat:"Jeneng anggota kulawarga",cp:"MULOK",tp:"Peserta didik mampu menyebutkan nama anggota keluarga nganggo basa Jawa.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Muatan Lokal",per:"Bab 1",t:"2026-08-05",mat:"Wilangan 1-10",cp:"MULOK",tp:"Peserta didik mampu menyebutkan wilangan 1-10 nganggo basa Jawa.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Muatan Lokal",per:"Bab 1",t:"2026-08-12",mat:"Wilangan 11-20",cp:"MULOK",tp:"Peserta didik mampu menyebutkan wilangan 11-20 nganggo basa Jawa.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Muatan Lokal",per:"Bab 1",t:"2026-08-19",mat:"Warna-warna",cp:"MULOK",tp:"Peserta didik mampu menyebutkan nama warna nganggo basa Jawa.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Muatan Lokal",per:"Bab 1",t:"2026-08-26",mat:"Tembang dolanan 'Cublak-cublak suweng'",cp:"MULOK",tp:"Peserta didik mampu menyanyikan tembang dolanan 'Cublak-cublak suweng'.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Muatan Lokal",per:"Bab 1",t:"2026-09-02",mat:"Tembang dolanan 'Gundul-gundul pacul'",cp:"MULOK",tp:"Peserta didik mampu menyanyikan tembang dolanan 'Gundul-gundul pacul'.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Muatan Lokal",per:"Bab 1",t:"2026-09-09",mat:"Unggah-ungguh marang wong tuwa",cp:"MULOK",tp:"Peserta didik mampu mempraktikkan unggah-ungguh kepada orang tua.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Muatan Lokal",per:"Bab 1",t:"2026-09-16",mat:"Unggah-ungguh marang guru & kanca",cp:"MULOK",tp:"Peserta didik mampu mempraktikkan unggah-ungguh kepada guru dan teman.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Muatan Lokal",per:"Bab 1",t:"2026-09-23",mat:"Crita cekak sederhana",cp:"MULOK",tp:"Peserta didik mampu menceritakan kembali crita cekak secara sederhana.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Muatan Lokal",per:"Bab 1",t:"2026-09-30",mat:"Review Bab 1; persiapan STS",cp:"MULOK",tp:"Peserta didik siap mengikuti STS.",n:"Sumatif lingkup materi (persiapan STS)"},
 {m:"Muatan Lokal",per:"Bab 2",t:"2026-10-14",mat:"Jeneng kewan (hewan)",cp:"MULOK",tp:"Peserta didik mampu menyebutkan nama hewan nganggo basa Jawa.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Muatan Lokal",per:"Bab 2",t:"2026-10-21",mat:"Jeneng tetuwuhan (tumbuhan)",cp:"MULOK",tp:"Peserta didik mampu menyebutkan nama tumbuhan nganggo basa Jawa.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Muatan Lokal",per:"Bab 2",t:"2026-10-28",mat:"Panganan tradisional Banyumas",cp:"MULOK",tp:"Peserta didik mampu menyebutkan panganan tradisional Banyumas.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Muatan Lokal",per:"Bab 2",t:"2026-11-04",mat:"Dolanan tradisional",cp:"MULOK",tp:"Peserta didik mampu menyebutkan dolanan tradisional.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Muatan Lokal",per:"Bab 2",t:"2026-11-11",mat:"Crita rakyat Banyumas",cp:"MULOK",tp:"Peserta didik mampu menceritakan kembali crita rakyat secara sederhana.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Muatan Lokal",per:"Bab 2",t:"2026-11-18",mat:"Review Bab 2; persiapan SAS",cp:"MULOK",tp:"Peserta didik siap mengikuti SAS.",n:"Sumatif lingkup materi (persiapan SAS)"},
 {m:"Muatan Lokal",per:"Review SAS",t:"2026-11-25",mat:"Review & persiapan SAS",cp:"MULOK",tp:"Peserta didik siap mengikuti SAS.",n:"Persiapan SAS"},
 {m:"Seni Rupa",per:"Bab 1",t:"2026-07-23",mat:"Garis: lurus, lengkung & zigzag",cp:"SR_ALAMI",tp:"Peserta didik mampu membuat berbagai jenis garis.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Seni Rupa",per:"Bab 1",t:"2026-07-30",mat:"Bentuk: lingkaran, segitiga & segiempat",cp:"SR_ALAMI",tp:"Peserta didik mampu membuat berbagai bentuk dasar.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Seni Rupa",per:"Bab 1",t:"2026-08-06",mat:"Warna primer: merah, kuning, biru",cp:"SR_ALAMI",tp:"Peserta didik mampu mengenali warna primer.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Seni Rupa",per:"Bab 1",t:"2026-08-13",mat:"Mencampur warna primer",cp:"SR_ALAMI",tp:"Peserta didik mampu mencampur warna primer menjadi warna baru.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Seni Rupa",per:"Bab 1",t:"2026-08-20",mat:"Menggambar bebas: diriku",cp:"SR_CIPTA",tp:"Peserta didik mampu menggambar dirinya sendiri.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Seni Rupa",per:"Bab 1",t:"2026-08-27",mat:"Menggambar: keluargaku",cp:"SR_CIPTA",tp:"Peserta didik mampu menggambar keluarganya.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Seni Rupa",per:"Bab 1",t:"2026-09-03",mat:"Menggambar: rumahku",cp:"SR_CIPTA",tp:"Peserta didik mampu menggambar rumahnya.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Seni Rupa",per:"Bab 1",t:"2026-09-10",mat:"Menggambar: hewan kesukaan",cp:"SR_CIPTA",tp:"Peserta didik mampu menggambar hewan kesukaannya.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Seni Rupa",per:"Bab 1",t:"2026-09-17",mat:"Kolase kertas warna",cp:"SR_CIPTA",tp:"Peserta didik mampu membuat kolase dari kertas warna.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Seni Rupa",per:"Bab 1",t:"2026-09-24",mat:"Kolase biji-bijian",cp:"SR_CIPTA",tp:"Peserta didik mampu membuat kolase dari biji-bijian.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Seni Rupa",per:"Bab 1",t:"2026-10-01",mat:"Pameran kecil karya kelas; persiapan STS",cp:"SR_CIPTA",tp:"Peserta didik mampu mempresentasikan karyanya.",n:"Sumatif lingkup materi (persiapan STS)"},
 {m:"Seni Rupa",per:"Bab 2",t:"2026-10-15",mat:"Melipat kertas (origami sederhana)",cp:"SR_CIPTA",tp:"Peserta didik mampu membuat lipatan kertas sederhana.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Seni Rupa",per:"Bab 2",t:"2026-10-22",mat:"Menggunting & menempel bentuk",cp:"SR_CIPTA",tp:"Peserta didik mampu menggunting dan menempel bentuk.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Seni Rupa",per:"Bab 2",t:"2026-10-29",mat:"Karya dari daun kering",cp:"SR_CIPTA",tp:"Peserta didik mampu membuat karya dari daun kering.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Seni Rupa",per:"Bab 2",t:"2026-11-05",mat:"Karya dari bahan daur ulang",cp:"SR_CIPTA",tp:"Peserta didik mampu membuat karya dari bahan daur ulang.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Seni Rupa",per:"Bab 2",t:"2026-11-12",mat:"Membuat topeng sederhana",cp:"SR_CIPTA",tp:"Peserta didik mampu membuat topeng sederhana.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Seni Rupa",per:"Bab 2",t:"2026-11-19",mat:"Pameran karya; persiapan SAS",cp:"SR_CIPTA",tp:"Peserta didik mampu mempresentasikan karya semester gasal.",n:"Sumatif lingkup materi (persiapan SAS)"},
 {m:"Seni Rupa",per:"Review SAS",t:"2026-11-26",mat:"Review & persiapan SAS",cp:"SR_CIPTA",tp:"Peserta didik siap mengikuti SAS.",n:"Persiapan SAS"},
 {m:"Kokurikuler",per:"Bab 1",t:"2026-07-24",mat:"Pengenalan projek: Sekolahku Bersih & Sehat",cp:"KOKURIKULER",tp:"Peserta didik mampu menjelaskan tujuan projek dengan antusias.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Kokurikuler",per:"Bab 1",t:"2026-07-31",mat:"Mengamati sampah di lingkungan sekolah",cp:"KOKURIKULER",tp:"Peserta didik mampu mengamati dan mencatat jenis sampah di sekolah.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Kokurikuler",per:"Bab 1",t:"2026-08-07",mat:"Memilah sampah organik & anorganik",cp:"KOKURIKULER",tp:"Peserta didik mampu memilah sampah organik dan anorganik.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Kokurikuler",per:"Bab 1",t:"2026-08-14",mat:"Membuat tempat sampah kelas",cp:"KOKURIKULER",tp:"Peserta didik mampu bekerja sama membuat tempat sampah kelas.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Kokurikuler",per:"Bab 1",t:"2026-08-21",mat:"Piket kebersihan kelas terjadwal",cp:"KOKURIKULER",tp:"Peserta didik mampu melaksanakan piket kebersihan sesuai jadwal.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Kokurikuler",per:"Bab 1",t:"2026-08-28",mat:"Menanam tanaman kelas",cp:"KOKURIKULER",tp:"Peserta didik mampu menanam tanaman secara gotong royong.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Kokurikuler",per:"Bab 1",t:"2026-09-04",mat:"Merawat tanaman",cp:"KOKURIKULER",tp:"Peserta didik mampu merawat tanaman secara mandiri.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Kokurikuler",per:"Bab 1",t:"2026-09-11",mat:"Bekal sehat vs jajan sembarangan",cp:"KOKURIKULER",tp:"Peserta didik mampu membedakan bekal sehat dan jajan sembarangan.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Kokurikuler",per:"Bab 1",t:"2026-09-18",mat:"Membuat poster kebersihan",cp:"KOKURIKULER",tp:"Peserta didik mampu membuat poster ajakan menjaga kebersihan.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Kokurikuler",per:"Bab 1",t:"2026-09-25",mat:"Dolanan tradisional bersama",cp:"KOKURIKULER",tp:"Peserta didik mampu bermain dolanan tradisional dengan sportif.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Kokurikuler",per:"Bab 1",t:"2026-10-02",mat:"Refleksi & pameran projek; persiapan STS",cp:"KOKURIKULER",tp:"Peserta didik mampu menyampaikan refleksi projeknya.",n:"Sumatif lingkup materi (persiapan STS)"},
 {m:"Kokurikuler",per:"Bab 2",t:"2026-10-16",mat:"Pengenalan projek: Kearifan Lokal Banyumas",cp:"KOKURIKULER",tp:"Peserta didik mampu menjelaskan tujuan projek.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Kokurikuler",per:"Bab 2",t:"2026-10-23",mat:"Mengenal panganan khas Banyumas",cp:"KOKURIKULER",tp:"Peserta didik mampu menyebutkan panganan khas Banyumas.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Kokurikuler",per:"Bab 2",t:"2026-10-30",mat:"Basa Jawa dalam dolanan",cp:"KOKURIKULER",tp:"Peserta didik mampu menggunakan basa Jawa dalam permainan.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Kokurikuler",per:"Bab 2",t:"2026-11-06",mat:"Tembang dolanan Banyumasan",cp:"KOKURIKULER",tp:"Peserta didik mampu menyanyikan tembang dolanan Banyumasan.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Kokurikuler",per:"Bab 2",t:"2026-11-13",mat:"Membuat mainan tradisional",cp:"KOKURIKULER",tp:"Peserta didik mampu membuat mainan tradisional sederhana.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Kokurikuler",per:"Bab 2",t:"2026-11-20",mat:"Gelar karya & refleksi; persiapan SAS",cp:"KOKURIKULER",tp:"Peserta didik mampu mempresentasikan hasil projeknya.",n:"Sumatif lingkup materi (persiapan SAS)"},
 {m:"Kokurikuler",per:"Review SAS",t:"2026-11-27",mat:"Refleksi projek semester & persiapan SAS",cp:"KOKURIKULER",tp:"Peserta didik siap mengikuti SAS.",n:"Persiapan SAS"},
];
const RENCANA_MAPEL_SINGKAT = {
  "Pendidikan Agama Islam dan Budi Pekerti":"PAI",
  "Pendidikan Pancasila":"Pancasila",
  "Bahasa Indonesia":"B. Indonesia",
  "Matematika":"Matematika",
  "Seni Rupa":"Seni Rupa",
  "PJOK":"PJOK",
  "Muatan Lokal":"Mulok B. Jawa",
  "Kokurikuler":"Kokurikuler"
};
function rencanaJudul(it){
  const mk = RENCANA_MAPEL_SINGKAT[it.m] || it.m;
  const mat = it.mat.length>55 ? it.mat.slice(0,55)+"…" : it.mat;
  return "[Kelas 1] "+mk+": "+mat;
}
function rencanaCPText(it){
  const cp = RENCANA_CP[it.cp];
  return "CP Fase A ("+cp.elemen+"): "+cp.teks;
}

/* ---- Penanaman data (idempoten) ----
   v3 (11 Okt 2026): 178 entri dihitung dari JJM & kalender semester gasal
   2026/2027 — MPLS 13-17 Jul, Bab 1: 20 Jul-2 Okt (11 minggu; 17 Agu libur,
   Senin off), STS 5-9 Okt, Bab 2: 12 Okt-20 Nov (6 minggu),
   Review: 23-27 Nov, SAS mulai 1 Des 2026.
   Migrasi: entri v1/v2 otomatis diganti v3. */
function runRencanaPblSeedIfNeeded(){
  if(localStorage.getItem(RENCANA_PBL_FLAG)) return;
  if(localStorage.getItem("tpsd2026_rencana_pbl_k1_2426_v1")==="deleted" ||
     localStorage.getItem("tpsd2026_rencana_pbl_k1_2426_v2")==="deleted"){
    localStorage.setItem(RENCANA_PBL_FLAG, "deleted");
    return;
  }
  try{
    const shared = loadSharedDB();
    shared.kalender = shared.kalender || [];
    const nKalLama = shared.kalender.filter(e=>RENCANA_PBL_TAG_LAMA.includes(e._rencana)).length;
    shared.kalender = shared.kalender.filter(e=>!RENCANA_PBL_TAG_LAMA.includes(e._rencana));
    const cls1 = loadClassDB("kelas-1");
    cls1.agenda = cls1.agenda || [];
    const nAgLama = cls1.agenda.filter(e=>RENCANA_PBL_TAG_LAMA.includes(e._rencana)).length;
    cls1.agenda = cls1.agenda.filter(e=>!RENCANA_PBL_TAG_LAMA.includes(e._rencana));
    RENCANA_PBL.forEach(it=>{
      const cpText = rencanaCPText(it);
      const hari = rencanaHari(it.t);
      shared.kalender.push({
        id: uid("kalender"),
        tanggal: it.t,
        judul: rencanaJudul(it),
        jenis: "Rencana Pembelajaran",
        keterangan: "[Kelas 1] Rencana Pembelajaran — "+hari+", "+fmtDate(it.t)+" ("+it.per+")\nMapel: "+it.m+"\nMateri: "+it.mat+"\n"+cpText+"\nTP: "+it.tp,
        pengingatAktif: "Ya", pengingatJam: "19:00", pengingatMenit: "1440",
        _rencana: RENCANA_PBL_TAG
      });
      cls1.agenda.push({
        id: uid("agenda"),
        tanggal: it.t,
        mapel: it.m,
        materi: "Materi: "+it.mat+"\nTP: "+it.tp+"\n"+cpText,
        kegiatan: "",
        penilaian: it.n,
        refleksi: "",
        catatan: "",
        pengingatAktif: "Ya", pengingatJam: "19:00", pengingatMenit: "1440",
        _rencana: RENCANA_PBL_TAG
      });
    });
    saveSharedDB(shared);
    saveClassDB("kelas-1", cls1);
    localStorage.setItem(RENCANA_PBL_FLAG, "1");
    console.log("[RencanaPbl v3] lama dibersihkan ("+nKalLama+" kalender, "+nAgLama+" agenda); v3 ditanam "+RENCANA_PBL.length+" entri.");
  }catch(e){ console.warn("Gagal menanam Rencana Pembelajaran Kelas 1.", e); }
}

/* ---- Hapus integrasi (dipanggil manual dari konsol) ---- */
window.hapusRencanaPbl = function(){
  try{
    const tags = [RENCANA_PBL_TAG].concat(RENCANA_PBL_TAG_LAMA);
    const shared = loadSharedDB();
    const n1 = (shared.kalender||[]).length;
    shared.kalender = (shared.kalender||[]).filter(e=>!(tags.includes(e._rencana) || e.jenis==="Rencana Pembelajaran"));
    saveSharedDB(shared);
    const cls1 = loadClassDB("kelas-1");
    const n2 = (cls1.agenda||[]).length;
    cls1.agenda = (cls1.agenda||[]).filter(e=>!tags.includes(e._rencana));
    saveClassDB("kelas-1", cls1);
    // Tandai "deleted" (bukan hapus flag) agar seed otomatis tidak menanam ulang.
    localStorage.setItem(RENCANA_PBL_FLAG, "deleted");
    try{ db = loadDB(); }catch(e){}
    return "Dihapus: "+(n1-shared.kalender.length)+" agenda kalender, "+(n2-cls1.agenda.length)+" jurnal. Muat ulang halaman.";
  }catch(e){ return "Gagal: "+e.message; }
};

/* ---- Pengingat Jurnal Mengajar (kelas-1) ---- */
function agendaNotifiedKey(entryId){ return "ag_"+entryId+"_"+todayISO(); }
function agendaGetNotifiedSet(){
  try{ return new Set(JSON.parse(localStorage.getItem("tpsd2026_agenda_notified")||"[]")); }
  catch(e){ return new Set(); }
}
function agendaSaveNotifiedSet(set){
  localStorage.setItem("tpsd2026_agenda_notified", JSON.stringify([...set]));
}
function agendaTriggerReminder(entry){
  const judul = "Jurnal "+(entry.mapel||"")+" — "+fmtDate(entry.tanggal);
  toast("Pengingat Jurnal: "+(entry.mapel||"")+" ("+(entry.pengingatJam||"")+")");
  try{ kalPlayBeep(); }catch(e){}
  try{ if(navigator.vibrate) navigator.vibrate([200,100,200]); }catch(e){}
  if(typeof Notification!=="undefined" && Notification.permission==="granted"){
    try{
      new Notification("Pengingat Jurnal: "+judul, {
        body: "Siapkan materi & isi jurnal mengajar. ("+fmtDate(entry.tanggal)+")",
        tag: "ag_"+entry.id
      });
    }catch(e){}
  }
}
function checkAgendaReminders(){
  try{
    const cls = loadClassDB("kelas-1");
    const list = cls.agenda || [];
    const now = new Date();
    const notified = agendaGetNotifiedSet();
    let changed = false;
    list.forEach(entry=>{
      if(entry.pengingatAktif!=="Ya" || !entry.pengingatJam) return;
      const key = agendaNotifiedKey(entry.id);
      if(notified.has(key)) return;
      const parts = String(entry.pengingatJam).split(":");
      const hh = parseInt(parts[0],10)||0, mm = parseInt(parts[1],10)||0;
      const target = new Date(entry.tanggal+"T00:00:00");
      target.setHours(hh, mm, 0, 0);
      target.setMinutes(target.getMinutes() - (parseInt(entry.pengingatMenit,10)||0));
      const diffMs = now - target;
      if(diffMs >= 0 && diffMs <= 3*60*1000){
        agendaTriggerReminder(entry);
        notified.add(key); changed = true;
      }
    });
    if(changed) agendaSaveNotifiedSet(notified);
  }catch(e){ console.warn("Gagal memeriksa pengingat jurnal.", e); }
}
