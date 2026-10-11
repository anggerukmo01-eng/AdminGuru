/* ================================================================
   FILE: assets/js/44-rencana.js
   Dipecah dari index.html monolit. Urutan load = urutan nama file.
   Jangan ubah urutan <script> di index.html.
   ================================================================ */
/* ============================================================
   4B. RENCANA PEMBELAJARAN TERINTEGRASI — KELAS 1 FASE A
   Semester Gasal T.A. 2026/2027 (periode 12 Okt – 20 Nov 2026)
   ------------------------------------------------------------
   Mengintegrasikan Rencana Pembelajaran ke:
   1. Kalender Pendidikan (db.kalender, data BERSAMA semua kelas)
      - jenis "Rencana Pembelajaran", lengkap: Mapel, Materi, CP, TP
      - pengingat aktif: H-1 pukul 19.00 (persiapan mengajar)
   2. Agenda / Jurnal Mengajar (db.agenda, data PER-KELAS: kelas-1)
      - materi terisi "Materi + TP + CP", penilaian terisi fokus asesmen
      - kolom kegiatan/refleksi dikosongkan untuk diisi guru seusai mengajar
      - pengingat aktif: H-1 pukul 19.00
   Sumber materi : Buku Siswa masing-masing mapel + CP Fase A
   (SEED_CP_FASE_A, selaras Kep. Kepala BSKAP No. 032/H/KR/2024).
   Penanaman data IDEMPOTEN (flag localStorage) — aman dibuka berulang.
   Menghapus integrasi: panggil window.hapusRencanaPbl() dari konsol,
   atau hapus manual entri berjenis "Rencana Pembelajaran" / berjudul
   "[Kelas 1]" melalui menu Kalender & Jurnal.
   ============================================================ */
const RENCANA_PBL_FLAG = "tpsd2026_rencana_pbl_k1_2426_v1";
const RENCANA_PBL_TAG = "pbl-k1-2426";

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
  MULOK:{elemen:"Muatan Lokal", teks:"Mengikuti CP/TP muatan lokal Bahasa Jawa sesuai kurikulum daerah dan ketentuan sekolah (tidak ada CP nasional untuk muatan lokal)."}
};

/* ---- 42 rencana mingguan: 7 mapel x 6 minggu ----
   m: mapel (sesuai MAPEL_LIST) | w: minggu | t: tanggal Senin (ISO) |
   tl: label rentang | mat: materi | cp: kunci RENCANA_CP |
   tp: tujuan pembelajaran | n: fokus penilaian */
const RENCANA_PBL = [
 /* ===== PAI & Budi Pekerti ===== */
 {m:"Pendidikan Agama Islam dan Budi Pekerti",w:1,t:"2026-10-12",tl:"12–16 Okt 2026",mat:"Huruf hijaiyah berharakat (fathah, kasrah, dammah): membaca & menulis",cp:"PAI_QURAN",tp:"Peserta didik mampu membaca dan membedakan huruf hijaiyah berharakat fathah, kasrah, dan dammah dengan benar.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Agama Islam dan Budi Pekerti",w:2,t:"2026-10-19",tl:"19–23 Okt 2026",mat:"Huruf hijaiyah bersambung: pengenalan & latihan menulis",cp:"PAI_QURAN",tp:"Peserta didik mampu membaca dan menulis huruf hijaiyah bersambung dengan benar.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Agama Islam dan Budi Pekerti",w:3,t:"2026-10-26",tl:"26–30 Okt 2026",mat:"Hafalan Surah Al-Fatihah beserta arti sederhana",cp:"PAI_QURAN",tp:"Peserta didik mampu menghafal Surah Al-Fatihah dengan tartil dan menyebutkan artinya secara sederhana.",n:"Formatif: hafalan dan unjuk kerja"},
 {m:"Pendidikan Agama Islam dan Budi Pekerti",w:4,t:"2026-11-02",tl:"2–6 Nov 2026",mat:"Hafalan Surah Al-Ikhlas; Hadis tentang kebersihan",cp:"PAI_QURAN",tp:"Peserta didik mampu menghafal Surah Al-Ikhlas dan menyebutkan hadis tentang kebersihan beserta maknanya.",n:"Formatif: hafalan dan unjuk kerja"},
 {m:"Pendidikan Agama Islam dan Budi Pekerti",w:5,t:"2026-11-09",tl:"9–13 Nov 2026",mat:"Doa sehari-hari: sebelum & sesudah makan, sebelum tidur",cp:"PAI_FIKIH",tp:"Peserta didik mampu melafalkan doa sebelum dan sesudah makan serta doa sebelum tidur dengan benar.",n:"Formatif: praktik dan observasi"},
 {m:"Pendidikan Agama Islam dan Budi Pekerti",w:6,t:"2026-11-16",tl:"16–20 Nov 2026",mat:"Akhlak terpuji: jujur, hormat kepada orang tua & guru; review persiapan SAS",cp:"PAI_AKHLAK",tp:"Peserta didik mampu menunjukkan akhlak terpuji (jujur, hormat kepada orang tua dan guru) dalam kehidupan sehari-hari.",n:"Sumatif lingkup materi (persiapan SAS)"},
 /* ===== Pendidikan Pancasila (mengikuti Buku Siswa Kemendikbudristek 2023) ===== */
 {m:"Pendidikan Pancasila",w:1,t:"2026-10-12",tl:"12–16 Okt 2026",mat:"Bab 1 — Aku Mengenal Diriku: identitas diri (nama, ciri, kesukaan)",cp:"PP_BHINNEKA",tp:"Peserta didik mampu mengidentifikasi dan menceritakan identitas dirinya (nama, ciri, kesukaan) dengan percaya diri.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Pancasila",w:2,t:"2026-10-19",tl:"19–23 Okt 2026",mat:"Bab 1 — Aku Mengenal Teman-Temanku: berkenalan & menghargai perbedaan",cp:"PP_BHINNEKA",tp:"Peserta didik mampu menghargai perbedaan identitas teman (hobi, bahasa, agama) di lingkungan sekitar.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Pancasila",w:3,t:"2026-10-26",tl:"26–30 Okt 2026",mat:"Bab 1 — Aturan Main Bersama Teman: aturan permainan, tertib & sportif",cp:"PP_UUD",tp:"Peserta didik mampu menyebutkan dan mematuhi aturan permainan bersama teman dengan tertib dan sportif.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Pancasila",w:4,t:"2026-11-02",tl:"2–6 Nov 2026",mat:"Bab 2 — Aturan dalam Keluargaku: contoh aturan di rumah & manfaatnya",cp:"PP_UUD",tp:"Peserta didik mampu menyebutkan contoh-contoh aturan di lingkungan keluarga dan menjelaskan manfaatnya.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Pancasila",w:5,t:"2026-11-09",tl:"9–13 Nov 2026",mat:"Bab 2 — Aku Mematuhi Aturan di Rumah: perilaku patuh sehari-hari",cp:"PP_UUD",tp:"Peserta didik mampu menunjukkan dan menceritakan sikap mematuhi aturan di rumah dalam kehidupan sehari-hari.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Pendidikan Pancasila",w:6,t:"2026-11-16",tl:"16–20 Nov 2026",mat:"Bab 2 — Aku Peduli dengan Tempat Tinggalku; review persiapan SAS",cp:"PP_NKRI",tp:"Peserta didik mampu mempraktikkan kerja sama menjaga kebersihan lingkungan tempat tinggal.",n:"Sumatif lingkup materi (persiapan SAS)"},
 /* ===== Bahasa Indonesia ===== */
 {m:"Bahasa Indonesia",w:1,t:"2026-10-12",tl:"12–16 Okt 2026",mat:"Membaca permulaan: suku kata terbuka (ba-bi-bu-be-bo) & kata bermakna",cp:"BI_BACA",tp:"Peserta didik mampu membaca suku kata terbuka dan kata-kata sederhana dengan fasih.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",w:2,t:"2026-10-19",tl:"19–23 Okt 2026",mat:"Membaca kata bersuku kata tertutup sederhana (pola KVK)",cp:"BI_BACA",tp:"Peserta didik mampu membaca kata bersuku kata tertutup sederhana dengan tepat.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",w:3,t:"2026-10-26",tl:"26–30 Okt 2026",mat:"Membaca kalimat sederhana & menjawab pertanyaan isi bacaan",cp:"BI_BACA",tp:"Peserta didik mampu membaca kalimat sederhana dan menjawab pertanyaan tentang isi bacaan.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",w:4,t:"2026-11-02",tl:"2–6 Nov 2026",mat:"Menulis permulaan: menyalin kalimat & melengkapi kalimat rumpang",cp:"BI_TULIS",tp:"Peserta didik mampu menyalin dan melengkapi kalimat sederhana dengan tulisan yang benar.",n:"Formatif: hasil kerja dan observasi"},
 {m:"Bahasa Indonesia",w:5,t:"2026-11-09",tl:"9–13 Nov 2026",mat:"Kosakata: kata sifat (besar-kecil, panjang-pendek) & lawan kata sederhana",cp:"BI_BACA",tp:"Peserta didik mampu menyebutkan kata sifat dan lawan katanya dalam konteks kalimat sederhana.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Bahasa Indonesia",w:6,t:"2026-11-16",tl:"16–20 Nov 2026",mat:"Berbicara: bercerita tentang pengalaman; membaca nyaring teks pendek; review SAS",cp:"BI_BICARA",tp:"Peserta didik mampu bercerita tentang pengalamannya secara lisan dengan runtut dan santun.",n:"Sumatif lingkup materi (persiapan SAS)"},
 /* ===== Matematika ===== */
 {m:"Matematika",w:1,t:"2026-10-12",tl:"12–16 Okt 2026",mat:"Bilangan 11–20: membaca & menulis lambang bilangan, membandingkan",cp:"MTK_BIL",tp:"Peserta didik mampu membaca, menulis, dan membandingkan bilangan 11 sampai 20.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",w:2,t:"2026-10-19",tl:"19–23 Okt 2026",mat:"Mengurutkan bilangan 11–20; pengenalan nilai tempat (puluhan & satuan)",cp:"MTK_BIL",tp:"Peserta didik mampu mengurutkan bilangan 11–20 dan menentukan nilai tempat puluhan dan satuan.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",w:3,t:"2026-10-26",tl:"26–30 Okt 2026",mat:"Penjumlahan dua bilangan (hasil ≤ 20) dengan benda konkret & garis bilangan",cp:"MTK_BIL",tp:"Peserta didik mampu melakukan penjumlahan dua bilangan dengan hasil sampai 20 menggunakan benda konkret.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",w:4,t:"2026-11-02",tl:"2–6 Nov 2026",mat:"Pengurangan bilangan (≤ 20) dengan benda konkret",cp:"MTK_BIL",tp:"Peserta didik mampu melakukan pengurangan bilangan sampai 20 menggunakan benda konkret.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Matematika",w:5,t:"2026-11-09",tl:"9–13 Nov 2026",mat:"Soal cerita penjumlahan & pengurangan dalam kehidupan sehari-hari",cp:"MTK_BIL",tp:"Peserta didik mampu menyelesaikan soal cerita penjumlahan dan pengurangan dalam kehidupan sehari-hari.",n:"Formatif: hasil kerja dan observasi"},
 {m:"Matematika",w:6,t:"2026-11-16",tl:"16–20 Nov 2026",mat:"Pengukuran panjang satuan tidak baku; bangun datar (segitiga, segiempat, lingkaran); review SAS",cp:"MTK_UKUR",tp:"Peserta didik mampu mengukur panjang benda dengan satuan tidak baku serta mengelompokkan bangun datar (segitiga, segiempat, lingkaran).",n:"Sumatif lingkup materi (persiapan SAS)"},
 /* ===== Seni Rupa ===== */
 {m:"Seni Rupa",w:1,t:"2026-10-12",tl:"12–16 Okt 2026",mat:"Unsur seni rupa: garis & bentuk (lurus, lengkung, zigzag)",cp:"SR_ALAMI",tp:"Peserta didik mampu mengenali dan menyebutkan unsur garis dan bentuk dalam benda-benda di sekitar.",n:"Formatif: observasi dan hasil karya"},
 {m:"Seni Rupa",w:2,t:"2026-10-19",tl:"19–23 Okt 2026",mat:"Warna: mengenal warna primer & mencampur warna",cp:"SR_ALAMI",tp:"Peserta didik mampu mengenali warna primer dan mencampur warna untuk menghasilkan warna baru.",n:"Formatif: observasi dan hasil karya"},
 {m:"Seni Rupa",w:3,t:"2026-10-26",tl:"26–30 Okt 2026",mat:"Menggambar bebas bertema 'Keluargaku'",cp:"SR_CIPTA",tp:"Peserta didik mampu membuat gambar bertema keluarga berdasarkan pengalaman dan pengamatannya.",n:"Formatif: hasil karya"},
 {m:"Seni Rupa",w:4,t:"2026-11-02",tl:"2–6 Nov 2026",mat:"Kolase: menempel kertas lipat/warna membentuk gambar",cp:"SR_CIPTA",tp:"Peserta didik mampu membuat karya kolase dari kertas lipat/warna.",n:"Formatif: hasil karya"},
 {m:"Seni Rupa",w:5,t:"2026-11-09",tl:"9–13 Nov 2026",mat:"Menggambar hewan & tumbuhan kesukaan",cp:"SR_CIPTA",tp:"Peserta didik mampu menggambar hewan dan tumbuhan kesukaannya berdasarkan hasil pengamatan.",n:"Formatif: hasil karya"},
 {m:"Seni Rupa",w:6,t:"2026-11-16",tl:"16–20 Nov 2026",mat:"Karya dari bahan alam/daur ulang; pameran kecil karya kelas; review SAS",cp:"SR_CIPTA",tp:"Peserta didik mampu membuat karya seni rupa dari bahan alam/daur ulang dan mempresentasikannya.",n:"Sumatif lingkup materi (persiapan SAS)"},
 /* ===== PJOK ===== */
 {m:"PJOK",w:1,t:"2026-10-12",tl:"12–16 Okt 2026",mat:"Gerak dasar lokomotor: berjalan, berlari & melompat",cp:"PJOK_GERAK",tp:"Peserta didik mampu mempraktikkan gerak dasar lokomotor (berjalan, berlari, melompat) dengan benar.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"PJOK",w:2,t:"2026-10-19",tl:"19–23 Okt 2026",mat:"Gerak dasar non-lokomotor: membungkuk, memutar & meliuk",cp:"PJOK_GERAK",tp:"Peserta didik mampu mempraktikkan gerak dasar non-lokomotor (membungkuk, memutar, meliuk) dengan benar.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"PJOK",w:3,t:"2026-10-26",tl:"26–30 Okt 2026",mat:"Gerak dasar manipulatif: melempar & menangkap bola",cp:"PJOK_GERAK",tp:"Peserta didik mampu mempraktikkan gerak manipulatif melempar dan menangkap bola dengan tepat.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"PJOK",w:4,t:"2026-11-02",tl:"2–6 Nov 2026",mat:"Permainan bola kecil: menendang & menggiring bola sederhana",cp:"PJOK_FAIR",tp:"Peserta didik mampu bermain bola kecil sederhana dengan menaati peraturan permainan (fair play).",n:"Formatif: observasi dan unjuk kerja"},
 {m:"PJOK",w:5,t:"2026-11-09",tl:"9–13 Nov 2026",mat:"Latihan keseimbangan & kelenturan; pola hidup sehat",cp:"PJOK_SEHAT",tp:"Peserta didik mampu mempraktikkan latihan keseimbangan dan menyebutkan pola hidup sehat sehari-hari.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"PJOK",w:6,t:"2026-11-16",tl:"16–20 Nov 2026",mat:"Permainan tradisional sederhana; praktik & review SAS",cp:"PJOK_FAIR",tp:"Peserta didik mampu bermain permainan tradisional sederhana dengan strategi kolaborasi bersama teman.",n:"Sumatif lingkup materi (persiapan SAS)"},
 /* ===== Muatan Lokal (Bahasa Jawa) ===== */
 {m:"Muatan Lokal",w:1,t:"2026-10-12",tl:"12–16 Okt 2026",mat:"Salam & perkenalan diri nganggo basa Jawa ngoko",cp:"MULOK",tp:"Peserta didik mampu mengucapkan salam dan memperkenalkan diri menggunakan basa Jawa ngoko dengan santun.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Muatan Lokal",w:2,t:"2026-10-19",tl:"19–23 Okt 2026",mat:"Jeneng anggota kulawarga (bapak, ibu, kakang, adhi)",cp:"MULOK",tp:"Peserta didik mampu menyebutkan nama anggota keluarga menggunakan basa Jawa.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Muatan Lokal",w:3,t:"2026-10-26",tl:"26–30 Okt 2026",mat:"Wilangan 1–20 & warna nganggo basa Jawa",cp:"MULOK",tp:"Peserta didik mampu menyebutkan wilangan 1–20 dan nama warna menggunakan basa Jawa.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Muatan Lokal",w:4,t:"2026-11-02",tl:"2–6 Nov 2026",mat:"Tembang dolanan: 'Cublak-cublak suweng'",cp:"MULOK",tp:"Peserta didik mampu menyanyikan tembang dolanan 'Cublak-cublak suweng' dengan gembira.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Muatan Lokal",w:5,t:"2026-11-09",tl:"9–13 Nov 2026",mat:"Unggah-ungguh: tata krama & sopan santun marang wong tuwa",cp:"MULOK",tp:"Peserta didik mampu mempraktikkan unggah-ungguh (tata krama) kepada orang tua menggunakan basa Jawa.",n:"Formatif: observasi dan unjuk kerja"},
 {m:"Muatan Lokal",w:6,t:"2026-11-16",tl:"16–20 Nov 2026",mat:"Crita rakyat cekak (pengenalan); review SAS",cp:"MULOK",tp:"Peserta didik mampu menceritakan kembali isi crita rakyat cekak secara sederhana menggunakan basa Jawa.",n:"Sumatif lingkup materi (persiapan SAS)"}
];

const RENCANA_MAPEL_SINGKAT = {
  "Pendidikan Agama Islam dan Budi Pekerti":"PAI",
  "Pendidikan Pancasila":"Pancasila",
  "Bahasa Indonesia":"B. Indonesia",
  "Matematika":"Matematika",
  "Seni Rupa":"Seni Rupa",
  "PJOK":"PJOK",
  "Muatan Lokal":"Mulok B. Jawa"
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

/* ---- Penanaman data (idempoten) ---- */
function runRencanaPblSeedIfNeeded(){
  if(localStorage.getItem(RENCANA_PBL_FLAG)) return;
  try{
    const shared = loadSharedDB();
    shared.kalender = shared.kalender || [];
    const cls1 = loadClassDB("kelas-1");
    cls1.agenda = cls1.agenda || [];
    RENCANA_PBL.forEach(it=>{
      const cpText = rencanaCPText(it);
      shared.kalender.push({
        id: uid("kalender"),
        tanggal: it.t,
        judul: rencanaJudul(it),
        jenis: "Rencana Pembelajaran",
        keterangan: "[Kelas 1] Rencana Pembelajaran — Minggu "+it.w+" ("+it.tl+")\nMapel: "+it.m+"\nMateri: "+it.mat+"\n"+cpText+"\nTP: "+it.tp,
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
  }catch(e){ console.warn("Gagal menanam Rencana Pembelajaran Kelas 1.", e); }
}

/* ---- Hapus integrasi (dipanggil manual dari konsol) ---- */
window.hapusRencanaPbl = function(){
  try{
    const shared = loadSharedDB();
    const n1 = (shared.kalender||[]).length;
    shared.kalender = (shared.kalender||[]).filter(e=>!(e._rencana===RENCANA_PBL_TAG || e.jenis==="Rencana Pembelajaran"));
    saveSharedDB(shared);
    const cls1 = loadClassDB("kelas-1");
    const n2 = (cls1.agenda||[]).length;
    cls1.agenda = (cls1.agenda||[]).filter(e=>e._rencana!==RENCANA_PBL_TAG);
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
