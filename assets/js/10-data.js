/* ================================================================
   FILE: assets/js/10-data.js
   Dipecah dari index.html monolit. Urutan load = urutan nama file.
   Jangan ubah urutan <script> di index.html.
   ================================================================ */
/* =====================================================================
   TEACHER PLANNER SD 2026 - APP SCRIPT
   Struktur:
     1. Data awal (seed) - dari dokumen resmi terlampir
     2. Storage engine (localStorage) + util
     3. Icon set (SVG)
     4. Router & Sidebar
     5. Komponen generik: CRUD table, Modal, Toast, Export
     6. Halaman-halaman (Dashboard, Sekolah, Guru, Siswa, ... )
     7. Kalender, Kehadiran, Rekap Nilai, Rapor, Modul Ajar
     8. Digital Pen
     9. Backup/Restore, Keamanan (PIN), Pengaturan
     10. Boot
   ===================================================================== */

/* ============================================================
   1. SEED DATA - diambil dari dokumen resmi (bukan data fiktif)
   ============================================================ */
const SEED_SISWA = [{"id": "s1", "no": 3, "nama": "Azmi Safiq Al-Farizi", "jk": "L", "ttl": "Banyumas, 19 Maret 2020", "anakKe": "1", "jmlSdr": "-", "bb": "16.5", "tb": "115", "ayah": "Tekad", "ibu": "Indah Lestari", "pendidikanOrtu": "SMP", "pekerjaanOrtu": "Buruh", "alamat": "Gerduren RT 03/07", "ket": "6 th 4 bln", "nis": "", "nisn": "", "agama": "Islam"}, {"id": "s2", "no": 13, "nama": "Muhammad Arfan as Shafar", "jk": "L", "ttl": "Banyumas, 8 Oktober 2019", "anakKe": "1", "jmlSdr": "-", "bb": "21", "tb": "118", "ayah": "Kristianto", "ibu": "Ana Agus Pryatin", "pendidikanOrtu": "SMA", "pekerjaanOrtu": "Buruh", "alamat": "Gerduren RT 01/08", "ket": "6 th 9 bln", "nis": "", "nisn": "", "agama": "Islam"}, {"id": "s3", "no": 5, "nama": "Eza Fathurrohman", "jk": "L", "ttl": "Banyumas, 9 April 2020", "anakKe": "1", "jmlSdr": "-", "bb": "17", "tb": "110", "ayah": "Edi Prayoga", "ibu": "Dwi Novita", "pendidikanOrtu": "SMK", "pekerjaanOrtu": "Buruh", "alamat": "Gerduren RT 03/07", "ket": "6 th 3 bln", "nis": "", "nisn": "", "agama": "Islam"}, {"id": "s4", "no": 20, "nama": "Zany Izz Hana", "jk": "P", "ttl": "Banyumas, 3 Sept 2019", "anakKe": "1", "jmlSdr": "-", "bb": "17", "tb": "111", "ayah": "Rudi Affanda", "ibu": "Dyah Cayaning", "pendidikanOrtu": "SMP", "pekerjaanOrtu": "Buruh", "alamat": "Gerduren RT 01/07", "ket": "6 th 10 bln", "nis": "", "nisn": "", "agama": "Islam"}, {"id": "s5", "no": 11, "nama": "Muhammad Aksa Adzkiya Geza Kurniawan", "jk": "L", "ttl": "Banyumas, 22 Mei 2019", "anakKe": "2", "jmlSdr": "2", "bb": "34", "tb": "130", "ayah": "Renga Kurniawan", "ibu": "Irawati Handini", "pendidikanOrtu": "STM", "pekerjaanOrtu": "TNI/GONZU", "alamat": "Gerduren RT 02/08", "ket": "7 th 2 bln", "nis": "", "nisn": "", "agama": "Islam"}, {"id": "s6", "no": 18, "nama": "Nuha Shakila Atmarini", "jk": "P", "ttl": "Banyumas, 13 Maret 2019", "anakKe": "1", "jmlSdr": "-", "bb": "28", "tb": "124", "ayah": "Ahmad Daya Klabi", "ibu": "Tri Diyanti", "pendidikanOrtu": "SMK", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "Gerduren RT 03/04", "ket": "7 th 4 bln", "nis": "", "nisn": "", "agama": "Islam"}, {"id": "s7", "no": 9, "nama": "Kenzie Azraqi Shaidar Akbar", "jk": "L", "ttl": "Banyumas, 12 Nov 2019", "anakKe": "2", "jmlSdr": "2", "bb": "19", "tb": "113", "ayah": "Ramdani Akbar", "ibu": "Dian Apriyanti", "pendidikanOrtu": "SLTA/SMA", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "Gerduren RT 03/06", "ket": "6 th 8 bln", "nis": "", "nisn": "", "agama": "Islam"}, {"id": "s8", "no": 15, "nama": "Muhammad Lathif Al Fatih", "jk": "L", "ttl": "Banyumas, 20 Feb 2019", "anakKe": "1", "jmlSdr": "-", "bb": "20", "tb": "116", "ayah": "Rokhman", "ibu": "Atun Widianingsih", "pendidikanOrtu": "SMK", "pekerjaanOrtu": "Buruh", "alamat": "Gerduren RT 02/06", "ket": "", "nis": "", "nisn": "", "agama": "Islam"}, {"id": "s9", "no": 14, "nama": "Muhammad Falih Aqmar", "jk": "L", "ttl": "Bekasi, 13 Sep 2019", "anakKe": "2", "jmlSdr": "1", "bb": "17", "tb": "110", "ayah": "Ermanto", "ibu": "Sariyanti", "pendidikanOrtu": "SMP", "pekerjaanOrtu": "Buruh", "alamat": "Gerduren RT 04/07", "ket": "", "nis": "", "nisn": "", "agama": "Islam"}, {"id": "s10", "no": 4, "nama": "Denis Ardiansyah", "jk": "L", "ttl": "Banyumas, 17 Des 2019", "anakKe": "1", "jmlSdr": "-", "bb": "20", "tb": "120", "ayah": "Fuad Solihin", "ibu": "Leni Wulandari", "pendidikanOrtu": "SLTP/SLTA", "pekerjaanOrtu": "Buruh", "alamat": "Gerduren RT 04/07", "ket": "", "nis": "", "nisn": "", "agama": "Islam"}, {"id": "s11", "no": 16, "nama": "Muhammad Rizki Wahyu Aji", "jk": "L", "ttl": "Banyumas, 17 April 2020", "anakKe": "", "jmlSdr": "", "bb": "25", "tb": "125", "ayah": "Wahyu Hidayat", "ibu": "Puti Asih", "pendidikanOrtu": "SMP/SMA", "pekerjaanOrtu": "Buruh", "alamat": "Gerduren RT 01/07", "ket": "", "nis": "", "nisn": "", "agama": "Islam"}, {"id": "s12", "no": 7, "nama": "Farell Adhitama", "jk": "L", "ttl": "Banyumas, 3 Maret 2020", "anakKe": "1", "jmlSdr": "1", "bb": "18", "tb": "113", "ayah": "Agung Prasetiyo", "ibu": "Miken Melani", "pendidikanOrtu": "SMP/SMK", "pekerjaanOrtu": "Buruh", "alamat": "Gerduren RT 03/08", "ket": "", "nis": "", "nisn": "", "agama": "Islam"}, {"id": "s13", "no": 1, "nama": "Aji Pratama Putra", "jk": "L", "ttl": "Banyumas, 27 Jun 2019", "anakKe": "1", "jmlSdr": "-", "bb": "18", "tb": "112", "ayah": "Nasikun", "ibu": "Enah Susilowati", "pendidikanOrtu": "SD", "pekerjaanOrtu": "Buruh", "alamat": "Gerduren RT 03/07", "ket": "", "nis": "", "nisn": "", "agama": "Islam"}, {"id": "s14", "no": 6, "nama": "Fadli Hardi Yanto", "jk": "L", "ttl": "Banyumas, 6 Jun 2019", "anakKe": "2", "jmlSdr": "1", "bb": "29", "tb": "108", "ayah": "Dodi Yulianto", "ibu": "Egin Lestari", "pendidikanOrtu": "STM/SO", "pekerjaanOrtu": "Buruh", "alamat": "Gerduren RT 02/07", "ket": "", "nis": "", "nisn": "", "agama": "Islam"}, {"id": "s15", "no": 17, "nama": "Naura Nurfatiyah", "jk": "P", "ttl": "Banyumas, 19 Nov 2019", "anakKe": "2", "jmlSdr": "2", "bb": "", "tb": "", "ayah": "Saeng Pramono", "ibu": "Kamiyati", "pendidikanOrtu": "SMP", "pekerjaanOrtu": "Sopir", "alamat": "Gerduren RT 01/07", "ket": "", "nis": "", "nisn": "", "agama": "Islam"}, {"id": "s16", "no": 8, "nama": "Ishaq Abrori", "jk": "L", "ttl": "Banyumas, 8 Sep 2019", "anakKe": "3", "jmlSdr": "2", "bb": "20", "tb": "116", "ayah": "Sukirno", "ibu": "Markhamah", "pendidikanOrtu": "SD/SLTP", "pekerjaanOrtu": "Buruh", "alamat": "Gerduren RT 04/06", "ket": "", "nis": "", "nisn": "", "agama": "Islam"}, {"id": "s17", "no": 10, "nama": "Mahruri Nur Azziz", "jk": "L", "ttl": "Banyumas, 24 Jul 2019", "anakKe": "2", "jmlSdr": "1", "bb": "17", "tb": "116", "ayah": "Khadirin Dirin", "ibu": "Asmirah", "pendidikanOrtu": "SLTP", "pekerjaanOrtu": "Buruh", "alamat": "Gerduren RT 04/07", "ket": "", "nis": "", "nisn": "", "agama": "Islam"}, {"id": "s18", "no": 2, "nama": "Aksan Abjun Alvaro", "jk": "L", "ttl": "Banyumas, 17 Jan 2020", "anakKe": "3", "jmlSdr": "2", "bb": "21", "tb": "116", "ayah": "Juniarto", "ibu": "Ari Murti", "pendidikanOrtu": "SMP/SD", "pekerjaanOrtu": "Sopir", "alamat": "Gerduren RT 03/06", "ket": "", "nis": "", "nisn": "", "agama": "Islam"}, {"id": "s19", "no": 19, "nama": "Syarif Seh Hidayat Tulloh", "jk": "L", "ttl": "Cirebon, 29 Mei 2020", "anakKe": "3", "jmlSdr": "2", "bb": "16", "tb": "109", "ayah": "-", "ibu": "Oktaviani", "pendidikanOrtu": "SLTP", "pekerjaanOrtu": "IRT", "alamat": "Gerduren RT 01/08", "ket": "", "nis": "", "nisn": "", "agama": "Islam"}, {"id": "s20", "no": 12, "nama": "Muhammad Alfan Rafisqi", "jk": "L", "ttl": "Banyumas, 17 Feb 2020", "anakKe": "1", "jmlSdr": "-", "bb": "17", "tb": "", "ayah": "Dwi Prastiawan", "ibu": "Yuliati", "pendidikanOrtu": "SLTP", "pekerjaanOrtu": "Buruh", "alamat": "Gerduren 03/09", "ket": "", "nis": "", "nisn": "", "agama": "Islam"}];
const SEED_SISWA_KELAS = {"kelas-2": [{"nama": "Atha Zafran Ramadhan", "jk": "L", "nis": "", "nisn": "", "ttl": "Banyumas, 20 Mei 2018", "ayah": "Mukheron", "ibu": "Maryanti", "pekerjaanOrtu": "WIRASWASTA", "alamat": "Gerduren, Gerduren"}, {"nama": "Cakra Abiyasa", "jk": "L", "nis": "", "nisn": "", "ttl": "Banyumas, 2 Sep 2018", "ayah": "Komari", "ibu": "Susmiyati", "pekerjaanOrtu": "WIRASWASTA", "alamat": "Gerduren, Gerduren"}, {"nama": "Delia Zahra Salsabila", "jk": "P", "nis": "", "nisn": "", "ttl": "Banyumas, 19 Apr 2019", "ayah": "Salahudin", "ibu": "Mugiarti", "pekerjaanOrtu": "BURUH", "alamat": "Gerduren, Gerduren"}, {"nama": "Elvano Akmal Dwitama", "jk": "L", "nis": "", "nisn": "", "ttl": "Banyumas, 11 Sep 2018", "ayah": "Tri Marsudi", "ibu": "Bhetavia Biarawati", "pekerjaanOrtu": "WIRASWASTA", "alamat": "Gerduren, Gerduren"}, {"nama": "Fajar Askari Ramdani", "jk": "L", "nis": "", "nisn": "", "ttl": "Banyumas, 15 Jun 2018", "ayah": "Sukiwan", "ibu": "Sumarti", "pekerjaanOrtu": "BURUH", "alamat": "Gerduren, Gerduren"}, {"nama": "Farra Aysha Azzahra", "jk": "P", "nis": "", "nisn": "", "ttl": "Banyumas, 25 Jul 2019", "ayah": "Dwi Purwanto Prasetyo", "ibu": "Sulastri", "pekerjaanOrtu": "BURUH", "alamat": "Gerduren, Gerduren"}, {"nama": "Fauziah Hasni Faiq Syarif", "jk": "P", "nis": "", "nisn": "", "ttl": "Banyumas,  ", "ayah": "Solehudin Syarif", "ibu": "Sochatun Hasanah", "pekerjaanOrtu": "WIRASWASTA", "alamat": "Gerduren, Gerduren"}, {"nama": "Fellisa Putri Hidayat", "jk": "P", "nis": "", "nisn": "", "ttl": "Banyumas, 17 Nov 2017", "ayah": "Rahmat Hidayat", "ibu": "Siti Masuroh", "pekerjaanOrtu": "WIRASWASTA", "alamat": "Gerduren, Gerduren"}, {"nama": "Ghali Nufail Tsamaradanie", "jk": "L", "nis": "", "nisn": "", "ttl": "Banyumas, 3 Agu 2019", "ayah": "Danie Tofik", "ibu": "Enggah Wuryanti", "pekerjaanOrtu": "WIRASWASTA", "alamat": "Gerduren, Gerduren"}, {"nama": "Gilang Arjuna Ramadhan", "jk": "L", "nis": "", "nisn": "", "ttl": "Banyumas, 23 Mei 2018", "ayah": "Juniarto", "ibu": "Ari Murti", "pekerjaanOrtu": "WIRASWASTA", "alamat": "Gerduren, Gerduren"}, {"nama": "Hafit Ramadhani Safutra", "jk": "L", "nis": "", "nisn": "", "ttl": "Banyumas, 22 Mei 2018", "ayah": "Sugeng Riyadi", "ibu": "Ulpiyanah", "pekerjaanOrtu": "BURUH", "alamat": "Gerduren, Gerduren"}, {"nama": "Kesya Lutfia Alhanisputri", "jk": "P", "nis": "", "nisn": "", "ttl": "Banyumas, 29 Mar 2019", "ayah": "", "ibu": "Mulyaningsih", "pekerjaanOrtu": "", "alamat": "Gerduren, Gerduren"}, {"nama": "Maulana Yusuf Alfarizqi", "jk": "L", "nis": "", "nisn": "", "ttl": "Banyumas, 8 Sep 2018", "ayah": "Solihin", "ibu": "Nurisma Yanti", "pekerjaanOrtu": "BURUH", "alamat": "Gerduren, Gerduren"}, {"nama": "Muhammad Abdilah Muzaqi", "jk": "L", "nis": "", "nisn": "", "ttl": "Banyumas, 19 Jun 2018", "ayah": "Supriatna", "ibu": "Reniasih", "pekerjaanOrtu": "BURUH", "alamat": "Gerduren, Gerduren"}, {"nama": "Muhammad Syarif Budi Nurjati", "jk": "L", "nis": "", "nisn": "", "ttl": "Banyumas, 26 Okt 2018", "ayah": "Budi Setiawan", "ibu": "Lisa Niswatun", "pekerjaanOrtu": "WIRASWASTA", "alamat": "Gerduren, Gerduren"}, {"nama": "Rafasya Alvin Faaz", "jk": "L", "nis": "", "nisn": "", "ttl": "Banyumas, 8 Feb 2019", "ayah": "Arianto", "ibu": "Nofi Nurrohmawati", "pekerjaanOrtu": "BURUH", "alamat": "Gerduren, Gerduren"}, {"nama": "Randy Prasetya", "jk": "L", "nis": "", "nisn": "", "ttl": "Banyumas, 15 Jan 2019", "ayah": "Didit Prayitno", "ibu": "Noviatun", "pekerjaanOrtu": "BURUH", "alamat": "Gerduren, Gerduren"}, {"nama": "Rivandra Luja Anugrah", "jk": "L", "nis": "", "nisn": "", "ttl": "Banyumas, 3 Jan 2019", "ayah": "Didit Riyanto", "ibu": "Nuraeni", "pekerjaanOrtu": "BURUH", "alamat": "Gerduren, Gerduren"}, {"nama": "Wisnu Arya Kencana", "jk": "L", "nis": "", "nisn": "", "ttl": "Banyumas, 27 Nov 2018", "ayah": "Rasum", "ibu": "Diah Purwati", "pekerjaanOrtu": "BURUH", "alamat": ""}, {"nama": "Yusuf Afka Riansyah", "jk": "L", "nis": "", "nisn": "", "ttl": "Banyumas, 22 Feb 2018", "ayah": "Setiyono", "ibu": "Feni", "pekerjaanOrtu": "BURUH", "alamat": ""}], "kelas-3": [{"nama": "Afifah Nahda Ramadhani", "jk": "P", "nis": "3515", "nisn": "3189501511", "ttl": "Banyumas, 18 Mei 2018", "ayah": "Haryono", "ibu": "Riani", "pekerjaanOrtu": "Petani", "alamat": "Gerduren, Sukasari, Kec. Kota Bogor Timur"}, {"nama": "Arziki Akbar Kurniawan", "jk": "L", "nis": "3516", "nisn": "3181164450", "ttl": "Banyumas, 1 Feb 2018", "ayah": "Bambang Kurniawan", "ibu": "Asmiyati", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "Jl. Garut, Desa/Kel. Gerduren, Kec. Purwojati"}, {"nama": "AZKA FAIZAN MUZAKI", "jk": "L", "nis": "3517", "nisn": "3181056803", "ttl": "BANYUMAS, 4 Jan 2018", "ayah": "RISNO", "ibu": "RASINI", "pekerjaanOrtu": "Petani", "alamat": "GERDUREN, Gerduren, Kec. Purwojati"}, {"nama": "BILLI ALBAITH", "jk": "L", "nis": "3518", "nisn": "3185657369", "ttl": "BANYUMAS, 26 Jul 2018", "ayah": "SUHUD TABI'IN", "ibu": "LINDAWATI", "pekerjaanOrtu": "Buruh", "alamat": "GERDUREN, Gerduren, Kec. Purwojati"}, {"nama": "DEFARIZ GIBRAN ALGAFARI", "jk": "L", "nis": "3519", "nisn": "3169612164", "ttl": "Banyumas, 26 Jun 2017", "ayah": "NURDIANSYAH", "ibu": "TRI KARMILAH", "pekerjaanOrtu": "Wiraswasta", "alamat": "Jalan Raya Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "FAIZA SAFIYATUN NISA", "jk": "P", "nis": "3520", "nisn": "3178545117", "ttl": "BANYUMAS, 25 Agu 2017", "ayah": "SISWO", "ibu": "MURTIYAH", "pekerjaanOrtu": "Petani", "alamat": "GERDUREN, Desa/Kel. Gerduren, Kec. Purwojati"}, {"nama": "FREBYAN PUTRA MAHADIKA", "jk": "L", "nis": "3521", "nisn": "3180736771", "ttl": "BANYUMAS, 8 Feb 2018", "ayah": "TRI AGUS PRASETIYO", "ibu": "RASITI", "pekerjaanOrtu": "Wiraswasta", "alamat": "BLEBER, Gerduren, Kec. Purwojati"}, {"nama": "HAFIZA KHAIRA LUBNA", "jk": "P", "nis": "3522", "nisn": "3173203802", "ttl": "BANYUMAS, 5 Jul 2017", "ayah": "HANDONO ADI SAPUTRO", "ibu": "USRIAH", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "KEMLAKA, Gerduren, Kec. Purwojati"}, {"nama": "KENZIE PIO ARGANI", "jk": "L", "nis": "3523", "nisn": "3188429026", "ttl": "Banyumas, 19 Jan 2018", "ayah": "", "ibu": "Dwi Haryanti", "pekerjaanOrtu": "Wiraswasta", "alamat": "Jalan Raya Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "KHANSA MEISYA", "jk": "P", "nis": "3524", "nisn": "3172681365", "ttl": "BANYUMAS, 22 Mei 2017", "ayah": "WARDOYO", "ibu": "SURTINI", "pekerjaanOrtu": "Buruh", "alamat": "GERDUREN, Gerduren, Kec. Purwojati"}, {"nama": "KHANZA KHAIRUNNISA AKBAR", "jk": "P", "nis": "3525", "nisn": "3176378279", "ttl": "BANYUMAS, 24 Nov 2017", "ayah": "RAMDANI", "ibu": "DIAN APRIYANTI", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "BLEBER, Gerduren, Kec. Purwojati"}, {"nama": "KHINANTI NADHIRA ONNIYA", "jk": "P", "nis": "3526", "nisn": "3176001398", "ttl": "Banyumas, 4 Agu 2017", "ayah": "karso", "ibu": "Saonah", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "bleber, Gerduren, Kec. Purwojati"}, {"nama": "MAKAYLA RADYA", "jk": "P", "nis": "3527", "nisn": "3183029950", "ttl": "BANYUMAS, 3 Mar 2018", "ayah": "SARNO", "ibu": "MISWATI", "pekerjaanOrtu": "Buruh", "alamat": "GERDUREN, Gerduren, Kec. Purwojati"}, {"nama": "MOHAMAD DANA", "jk": "L", "nis": "3528", "nisn": "3182261618", "ttl": "BANYUMAS, 4 Feb 2018", "ayah": "SUPRIYONO", "ibu": "RAKINEM", "pekerjaanOrtu": "Buruh", "alamat": "GERDUREN, Gerduren, Kec. Purwojati"}, {"nama": "MOHAMAD DANU", "jk": "L", "nis": "3529", "nisn": "3187394121", "ttl": "BANYUMAS, 4 Feb 2018", "ayah": "SUPRIYONO", "ibu": "RAKINEM", "pekerjaanOrtu": "Buruh", "alamat": "GERDUREN, Gerduren, Kec. Purwojati"}, {"nama": "MUHAMMAD ERHAN REYZA", "jk": "L", "nis": "3530", "nisn": "3183507125", "ttl": "BANYUMAS, 3 Jan 2018", "ayah": "ROSIDIN", "ibu": "TUNISAH", "pekerjaanOrtu": "Buruh", "alamat": "GERDUREN, Gerduren, Kec. Purwojati"}, {"nama": "Nafisha Khirani Zayba", "jk": "P", "nis": "3531", "nisn": "3187828605", "ttl": "Banyumas, 9 Mar 2018", "ayah": "Miskam", "ibu": "Warsiti", "pekerjaanOrtu": "Wiraswasta", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "NATHAN ABRISAM SATRIA RAMADHAN", "jk": "L", "nis": "3532", "nisn": "3181172648", "ttl": "BANYUMAS, 27 Mei 2018", "ayah": "JUPRIYONO", "ibu": "SULASTRI", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "JLN RAYA GERDUREN, Gerduren, Kec. Purwojati"}, {"nama": "NOVIA PUTRI MAHARANI", "jk": "P", "nis": "3533", "nisn": "3178365838", "ttl": "Banyumas, 28 Nov 2017", "ayah": "Sigit Hernawan", "ibu": "Saniyah", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "Bleber, Gerduren, Kec. Purwojati"}, {"nama": "NUR ASIFA AROATI", "jk": "P", "nis": "3534", "nisn": "3179781281", "ttl": "BANYUMAS, 21 Agu 2017", "ayah": "MUKHIBUN", "ibu": "SUTRIYANI", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "GERDUREN, Gerduren, Kec. Purwojati"}, {"nama": "Nusa Pratama Ramadhan", "jk": "L", "nis": "3535", "nisn": "3183978208", "ttl": "Banyumas, 13 Jun 2018", "ayah": "Indra Lukita", "ibu": "Endah Trilestari", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "Rafania Azahra Alfatunisa", "jk": "P", "nis": "3536", "nisn": "3170993546", "ttl": "Banyumas, 11 Nov 2017", "ayah": "Hariyanto", "ibu": "Lusiyanti", "pekerjaanOrtu": "Lainnya", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "RASYA MUTAQIN ATHALLA", "jk": "L", "nis": "3537", "nisn": "3185154369", "ttl": "BANYUMAS, 27 Jun 2018", "ayah": "SUDAYAT", "ibu": "IDA JUMIATI", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "GERDUREN, Gerduren, Kec. Purwojati"}, {"nama": "Rezky Arya Putra Wicaksana", "jk": "L", "nis": "3538", "nisn": "3189679462", "ttl": "Banyumas, 4 Mar 2018", "ayah": "Wahyu Ari Siswandi", "ibu": "Yunita Ria Permata Sari", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "Shivanya Kanza Zahira", "jk": "P", "nis": "3539", "nisn": "3175857922", "ttl": "Banyumas, 19 Mei 2017", "ayah": "Nasikun", "ibu": "Sriyani", "pekerjaanOrtu": "Buruh", "alamat": "j; gerduren, Gerduren, Kec. Purwojati"}, {"nama": "SITI NUR AFIFAH", "jk": "P", "nis": "3540", "nisn": "3183982589", "ttl": "BANYUMAS, 4 Apr 2018", "ayah": "MARSONO", "ibu": "ALFIAH", "pekerjaanOrtu": "Tidak bekerja", "alamat": "JALAN RAYA GERDUREN, GERDUREN, Kec. Purwojati"}, {"nama": "Wisnu Faeyza Pratama", "jk": "L", "nis": "3541", "nisn": "3179578994", "ttl": "Jakarta, 9 Mar 2017", "ayah": "Tugiono", "ibu": "Winda Susanti", "pekerjaanOrtu": "Petani", "alamat": "Gerduren, Sukasari, Kec. Kota Bogor Timur"}, {"nama": "Zafran Nazril Althaf", "jk": "L", "nis": "3542", "nisn": "3186565553", "ttl": "Banyumas, 20 Mei 2018", "ayah": "Sardi", "ibu": "Novi Irdanti", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "Jl. gerduren, Desa/Kel. Gerduren, Kec. Purwojati"}], "kelas-4": [{"nama": "Ananda Alula Sabira", "jk": "P", "nis": "", "nisn": "3174816193", "ttl": "Tangerang, 1 Mar 2017", "ayah": "Aris Ariyantoro", "ibu": "Imas", "pekerjaanOrtu": "Wiraswasta", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "ANDHARA AQMALIA DEWANTI", "jk": "P", "nis": "", "nisn": "0166138844", "ttl": "BANYUMAS, 22 Agu 2016", "ayah": "SUWARKO", "ibu": "DEVI KOMALASARI", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "JALAN RAYA GERDUREN, GERDUREN, Kec. Purwojati"}, {"nama": "Anggun Setia Ningrum", "jk": "P", "nis": "", "nisn": "3167228604", "ttl": "Banyumas, 8 Mar 2016", "ayah": "Sukirno", "ibu": "Markhamah", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "Anindia Faranisa Putri", "jk": "P", "nis": "", "nisn": "3165881311", "ttl": "Banyumas, 3 Des 2016", "ayah": "", "ibu": "Triyanti", "pekerjaanOrtu": "Petani", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "Aqila Raka Pranaja", "jk": "L", "nis": "", "nisn": "3169471595", "ttl": "Banyumas, 11 Feb 2016", "ayah": "Riyadi", "ibu": "Karyanti", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "Aqilla Keisha Sallsabilla", "jk": "P", "nis": "", "nisn": "3165338895", "ttl": "Banyumas, 1 Nov 2016", "ayah": "", "ibu": "Mundi Lestari", "pekerjaanOrtu": "Wiraswasta", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "Arshaka Khalif Setiawan", "jk": "L", "nis": "", "nisn": "3173215883", "ttl": "Banyumas, 4 Jan 2017", "ayah": "Sudarno", "ibu": "Supriyani", "pekerjaanOrtu": "Wiraswasta", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "ARSYLLA AURA PUTRI", "jk": "P", "nis": "", "nisn": "3170816857", "ttl": "Bogor, 6 Jun 2017", "ayah": "Suyono", "ibu": "Elit Sopianti", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "Bleber, Gerduren, Kec. Purwojati"}, {"nama": "Faizal Aji ratama", "jk": "L", "nis": "", "nisn": "3160209484", "ttl": "Banyumas, 22 Sep 2016", "ayah": "Dwi Susanto", "ibu": "Erita Oktafel Yani", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "MANNAF AL FARIZZI", "jk": "L", "nis": "", "nisn": "3165398546", "ttl": "BANYUMAS, 6 Okt 2016", "ayah": "KORIB", "ibu": "MIRNAWATI", "pekerjaanOrtu": "Buruh", "alamat": "JALAN RAYA GERDUREN, GERDUREN, Kec. Purwojati"}, {"nama": "Mohamad Cahyono", "jk": "L", "nis": "", "nisn": "3167634848", "ttl": "Banyumas, 9 Nov 2016", "ayah": "", "ibu": "Tumirah", "pekerjaanOrtu": "Petani", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "Mohamad Firli Alfiansyah", "jk": "L", "nis": "", "nisn": "3160454303", "ttl": "Banyumas, 26 Agu 2016", "ayah": "Mahfudin", "ibu": "Mursiyam", "pekerjaanOrtu": "Petani", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "NAJWA INARA AZZAHRA", "jk": "P", "nis": "3543", "nisn": "3161392120", "ttl": "TANGERANG, 14 Apr 2016", "ayah": "", "ibu": "SUPRIYANTI", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "JALAN RAYA GERDUREN, GERDUREN, Kec. Purwojati"}, {"nama": "SHILAH MUNIRUDDIN", "jk": "L", "nis": "", "nisn": "3179944298", "ttl": "Banyumas, 26 Mar 2017", "ayah": "AHMAD SUDARSAN", "ibu": "ASMIAH", "pekerjaanOrtu": "Petani", "alamat": "Bleber, Gerduren, Kec. Purwojati"}], "kelas-5": [{"nama": "Achazia Ghathfan Adinugra", "jk": "L", "nis": "", "nisn": "3161391348", "ttl": "Banyumas, 27 Jan 2016", "ayah": "Adi Priyanto", "ibu": "Ernis Rujianti", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "Jl. Raya Timur, Gerduren, Kec. Purwojati"}, {"nama": "ADABY TSAQIB TSAMARADANIE", "jk": "L", "nis": "", "nisn": "3162629988", "ttl": "BANYUMAS, 13 Jan 2016", "ayah": "DANIE TOFIK", "ibu": "ENGGAH WURYANTI", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "GERDUREN, GERDUREN, Kec. Purwojati"}, {"nama": "Alena Ramadani", "jk": "P", "nis": "3469", "nisn": "3168737490", "ttl": "Banyumas, 4 Jun 2016", "ayah": "", "ibu": "Suriyah", "pekerjaanOrtu": "Petani", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "Alifa Ayundia Huriyah", "jk": "P", "nis": "3470", "nisn": "3156316539", "ttl": "Banyumas, 17 Des 2015", "ayah": "Niswanto", "ibu": "Septi Endang Astuti ningsih", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "Desa Gerduren, Desa/Kel. Gerduren, Kec. Purwojati"}, {"nama": "Alissa Yuna Ramadhani", "jk": "P", "nis": "3471", "nisn": "3165678189", "ttl": "Pemalang, 18 Jun 2016", "ayah": "", "ibu": "Daniasih", "pekerjaanOrtu": "Buruh", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "Alvaizi Bagus Perwira Putra", "jk": "L", "nis": "3472", "nisn": "3169285319", "ttl": "Banyumas, 5 Jan 2016", "ayah": "", "ibu": "Tumirah", "pekerjaanOrtu": "Petani", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "Arsen Hafidz El Fatta", "jk": "L", "nis": "3473", "nisn": "3165198904", "ttl": "Banyumas, 25 Apr 2016", "ayah": "Farhan Maulana Yusuf", "ibu": "Theodora Vistana Astrid Mayasari", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "Jl. Bleber, Gerduren, Kec. Purwojati"}, {"nama": "Chayra Prida Nadhifa", "jk": "P", "nis": "3474", "nisn": "3162672205", "ttl": "Banyumas, 17 Apr 2016", "ayah": "Damas Subandi", "ibu": "Supriyatni", "pekerjaanOrtu": "Sudah Meninggal", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "Fatah Zahro Maulana", "jk": "L", "nis": "3475", "nisn": "0152485950", "ttl": "Banyumas, 5 Jun 2015", "ayah": "Suratno", "ibu": "Mei Suswati", "pekerjaanOrtu": "Lainnya", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "HAFIZH NAZRIL FARZANA", "jk": "L", "nis": "3476", "nisn": "3167830647", "ttl": "BANYUMAS, 2 Mar 2016", "ayah": "SUGENG RIYADI", "ibu": "ULPIYANAH", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "MASJID MUJAHIDIN, Gerduren, Kec. Purwojati"}, {"nama": "Kenzie Prodi Dwi Pradika", "jk": "L", "nis": "3477", "nisn": "3161977657", "ttl": "Banyumas, 15 Mar 2016", "ayah": "Prodi Oktovan Nugroho Putro", "ibu": "Indriyati", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "KHALIQA SALSABILA PUTRI", "jk": "P", "nis": "", "nisn": "0167070419", "ttl": "Banyumas, 12 Mar 2016", "ayah": "Samsul Widodo", "ibu": "Sri Hartati", "pekerjaanOrtu": "Petani", "alamat": "Batubintang, Batubintang, Kec. Batu Marmar"}, {"nama": "Leila Nurul Aini", "jk": "P", "nis": "3478", "nisn": "3150408778", "ttl": "Banyumas, 28 Des 2015", "ayah": "", "ibu": "Tuniyah", "pekerjaanOrtu": "Petani", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "Narendra Serin Al Faqih", "jk": "L", "nis": "3479", "nisn": "3164220360", "ttl": "Banyumas, 23 Okt 2016", "ayah": "", "ibu": "Septianingrum", "pekerjaanOrtu": "", "alamat": "Gerduren RT 04 RW 07, Gerduren, Kec. Purwojati"}, {"nama": "PRITA HARYATI PERMATASARI", "jk": "P", "nis": "3480", "nisn": "3164368563", "ttl": "BANYUMAS, 16 Apr 2016", "ayah": "WAGINO ANTRASENA", "ibu": "BASRIYAH", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "BLEBER, Desa/Kel. Gerduren, Kec. Purwojati"}, {"nama": "RAMADHAN ADIT SAMUDRA", "jk": "L", "nis": "3481", "nisn": "0159751280", "ttl": "Banyumas, 9 Jul 2015", "ayah": "SIGIT HERNAWAN", "ibu": "SANIYAH", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "GERDUREN, Gerduren, Kec. Purwojati"}, {"nama": "Revalinamaya Dinda Risqi", "jk": "P", "nis": "3482", "nisn": "3167244541", "ttl": "Banyumas, 10 Feb 2016", "ayah": "", "ibu": "Sartinah", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "Rimbun Nawacita Rahayu", "jk": "P", "nis": "3483", "nisn": "3152347590", "ttl": "Banyumas, 30 Sep 2015", "ayah": "Sudarsono", "ibu": "Sutarsih", "pekerjaanOrtu": "Pedagang Kecil", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "RISKI SAPUTRA", "jk": "L", "nis": "", "nisn": "3150082968", "ttl": "BANYUMAS, 10 Sep 2015", "ayah": "", "ibu": "RUSMIATUN", "pekerjaanOrtu": "Petani", "alamat": "TINGGARJAYA, Tinggarjaya, Kec. Jatilawang"}, {"nama": "Rosmalina Ayu Saputri", "jk": "P", "nis": "3484", "nisn": "3159374743", "ttl": "Banyumas, 15 Des 2015", "ayah": "", "ibu": "Jasirah", "pekerjaanOrtu": "", "alamat": "Gerduren RT 02 RW 08, Gerduren, Kec. Purwojati"}, {"nama": "SABRINA AYU ROSMALINA", "jk": "P", "nis": "3485", "nisn": "3150438206", "ttl": "BANYUMAS, 31 Mei 2015", "ayah": "JULIYANTO", "ibu": "RINA FATMAWATI", "pekerjaanOrtu": "Buruh", "alamat": "GERDUREN, Desa/Kel. Gerduren, Kec. Purwojati"}, {"nama": "Sakti Izam Muhammad", "jk": "L", "nis": "", "nisn": "0157737296", "ttl": "Banyumas, 12 Jun 2015", "ayah": "Amin Yulianto", "ibu": "Ismi Jefriani", "pekerjaanOrtu": "Wiraswasta", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "Shakila Al Rahma", "jk": "P", "nis": "3487", "nisn": "3163022221", "ttl": "Banyumas, 26 Mei 2016", "ayah": "", "ibu": "Tarsini Iin Sarinda", "pekerjaanOrtu": "Wiraswasta", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "Zaron Hidayat", "jk": "L", "nis": "3489", "nisn": "0155354577", "ttl": "Banyumas, 13 Des 2015", "ayah": "Arif Nurhayat", "ibu": "Isroinah", "pekerjaanOrtu": "Wiraswasta", "alamat": "Gerduren, Desa/Kel. Gerduren, Kec. Purwojati"}], "kelas-6": [{"nama": "Abimanyu Rizki Wijaya", "jk": "L", "nis": "", "nisn": "0142419050", "ttl": "Banyumas, 18 Des 2014", "ayah": "Mukmin", "ibu": "Tuti Riani", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "ADELIA FITRI FARANISA", "jk": "P", "nis": "", "nisn": "0155084073", "ttl": "BANYUMAS, 19 Jul 2015", "ayah": "PUJIANTO", "ibu": "DWI APRIYANI", "pekerjaanOrtu": "Pedagang Kecil", "alamat": "JALAN RAYA GERDUREN, Desa/Kel. Gerduren, Kec. Purwojati"}, {"nama": "Afiqah Hasna Humaira", "jk": "P", "nis": "", "nisn": "0143262696", "ttl": "Bekasi, 18 Des 2014", "ayah": "JAEDIN", "ibu": "Supriyatin", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "GERDUREN, Desa/Kel. Gerduren, Kec. Purwojati"}, {"nama": "ALDHONY GHALY MARETIN", "jk": "L", "nis": "", "nisn": "3158595232", "ttl": "BANYUMAS, 20 Mar 2015", "ayah": "WARDOYO", "ibu": "SURTINI", "pekerjaanOrtu": "Buruh", "alamat": "GERDUREN, Desa/Kel. Gerduren, Kec. Purwojati"}, {"nama": "Alika Naila Putri", "jk": "P", "nis": "", "nisn": "0157159066", "ttl": "Banyumas, 3 Jun 2015", "ayah": "Kuwatno", "ibu": "Eka Agustina", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "Cikakak, Desa/Kel. Cikakak, Kec. Wangon"}, {"nama": "Aulia Nur Inayah", "jk": "P", "nis": "", "nisn": "3156852404", "ttl": "Banyumas, 11 Mei 2015", "ayah": "Yulianto", "ibu": "Vaezatul Anisah", "pekerjaanOrtu": "Buruh", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "David Cahyo Walidi", "jk": "L", "nis": "", "nisn": "3152073170", "ttl": "Banyumas, 21 Agu 2015", "ayah": "Sunidi", "ibu": "Kunisah", "pekerjaanOrtu": "Wiraswasta", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "Farid Azam", "jk": "L", "nis": "", "nisn": "3146912994", "ttl": "Banyumas, 23 Nov 2014", "ayah": "Muhamad Rohmat", "ibu": "Sariyanti", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "Jl. Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "Fathia Aulia", "jk": "P", "nis": "", "nisn": "0152340719", "ttl": "Banyumas, 18 Jun 2015", "ayah": "Dani Wahyudi", "ibu": "Purwati", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "MUHAMMAD DANISH ABYANTO", "jk": "L", "nis": "", "nisn": "3141939240", "ttl": "BANYUMAS, 26 Nov 2014", "ayah": "WARYANTO", "ibu": "INDRIYANI", "pekerjaanOrtu": "Wiraswasta", "alamat": "GERDUREN, Gerduren, Kec. Purwojati"}, {"nama": "Myesha Flighsalesha Feriz", "jk": "P", "nis": "", "nisn": "0156751811", "ttl": "Banyumas, 13 Feb 2015", "ayah": "Anjar Khairul Anwar", "ibu": "Irma Prasetyowati", "pekerjaanOrtu": "PNS/TNI/Polri", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "Nadin Adresia Ardani", "jk": "P", "nis": "", "nisn": "3152075517", "ttl": "Banyumas, 13 Jun 2015", "ayah": "Tasman", "ibu": "Suherni", "pekerjaanOrtu": "Petani", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "Natisha Nisa Khaira", "jk": "P", "nis": "3458", "nisn": "3157746653", "ttl": "Banyumas, 23 Apr 2015", "ayah": "Pujianto", "ibu": "DEWI KURNIAWATI", "pekerjaanOrtu": "Wiraswasta", "alamat": "Jl. Gerduren, Desa/Kel. Gerduren, Kec. Purwojati"}, {"nama": "NAYLA PUTRI ARDANI", "jk": "P", "nis": "", "nisn": "0145618635", "ttl": "BANYUMAS, 14 Des 2014", "ayah": "NURDIN HIDAYAT", "ibu": "EKA ROHMADANI", "pekerjaanOrtu": "Buruh", "alamat": "GARUT, Desa/Kel. Gerduren, Kec. Purwojati"}, {"nama": "Putri Afriani", "jk": "P", "nis": "", "nisn": "3155818841", "ttl": "Banyumas, 10 Apr 2015", "ayah": "Karsono", "ibu": "Wagiarti", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "Jl. Raya Gerduren, Desa/Kel. Gerduren, Kec. Purwojati"}, {"nama": "Qois Naufal Hari Pratama", "jk": "L", "nis": "", "nisn": "3154993867", "ttl": "Banyumas, 26 Feb 2015", "ayah": "Juhari", "ibu": "Tri Puji Lestari", "pekerjaanOrtu": "Pedagang Kecil", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "Rico Dwi Kahesang", "jk": "L", "nis": "", "nisn": "3143347377", "ttl": "Cilacap, 17 Des 2014", "ayah": "Surahman", "ibu": "Rumiyati", "pekerjaanOrtu": "Petani", "alamat": "Mentasan, Desa/Kel. Mentasan, Kec. Kawunganten"}, {"nama": "Rizcha Aryani Saputri", "jk": "P", "nis": "", "nisn": "3159021467", "ttl": "Banyumas, 1 Okt 2015", "ayah": "Wahyu Ari Siswandi", "ibu": "Yunita Ria Permatasari", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "Gerduren, Gerduren, Kec. Purwojati"}, {"nama": "Ruby Anggraini", "jk": "P", "nis": "", "nisn": "3155480042", "ttl": "Tangerang, 7 Jan 2015", "ayah": "Nur Yasin", "ibu": "Ika Susanti", "pekerjaanOrtu": "Wiraswasta", "alamat": "jl H Siri, Sudimara Pinang, Kec. Pinang"}, {"nama": "Sofyan Dhani Prasetyo", "jk": "L", "nis": "", "nisn": "3136819010", "ttl": "Banyumas, 13 Sep 2013", "ayah": "Ngaliman", "ibu": "Oktaviani", "pekerjaanOrtu": "Karyawan Swasta", "alamat": "Jl Pedati Selatan, Gerduren, Kec. Purwojati"}]};
/* Data siswa Kelas 2-6 di atas diekstrak apa adanya dari file
   DATA_SISWA_KELAS_2-6_SDN1_GERDUREN.xlsx yang diunggah, sheet
   dipetakan sesuai label kelasnya ("Kelas 2".."Kelas 6"). Ejaan
   nama TIDAK diubah dari sumber, walau ada perbedaan kapitalisasi
   antar baris (mengikuti data asli Dapodik). NIS/NISN dikosongkan
   apabila memang tidak tersedia pada sumber, bukan dikarang. */

const SEED_STAFF = {"guru": [{"id": "g1", "nama": "Ahmad Riyanto", "nip": "198602182019021001", "nuptk": "2550764665200002", "jk": "L", "tempatLahir": "Cilacap", "tglLahir": "1986-02-18", "status": "PNS", "jenisPTK": "Guru", "jabatan": "Bendahara BOS/BOP", "agama": "Islam", "alamat": "Jl. M.Dahuri , SALEBU, Kec. Majenang", "hp": "085640309040", "email": "ahmadriyanto.riyan86@gmail.com", "pangkat": "III/b"}, {"id": "g2", "nama": "AZIZAH FARA ZAHRA", "nip": "", "nuptk": "4746780681230012", "jk": "P", "tempatLahir": "BANYUMAS", "tglLahir": "2002-04-14", "status": "Guru Honor Sekolah", "jenisPTK": "Guru", "jabatan": "", "agama": "Islam", "alamat": "Desa Purwojati RT 01 RW 09, Purwojati, Kec. Purwojati", "hp": "082220417752", "email": "azizahfara796@gmail.com", "pangkat": ""}, {"id": "g3", "nama": "Guntur Prasongko", "nip": "198303222025211037", "nuptk": "8654761662130162", "jk": "L", "tempatLahir": "Banyumas", "tglLahir": "1983-03-22", "status": "PPPK", "jenisPTK": "Guru", "jabatan": "", "agama": "Islam", "alamat": "Gerduren, Gerduren, Kec. Purwojati", "hp": "085726229924", "email": "iguntur01@gmail.com", "pangkat": ""}, {"id": "g4", "nama": "Rusminah", "nip": "196610091991022002", "nuptk": "6341744647300013", "jk": "P", "tempatLahir": "Banyumas", "tglLahir": "1966-10-09", "status": "PNS", "jenisPTK": "Guru", "jabatan": "", "agama": "Islam", "alamat": "Gentawangi, Gentawangi, Kec. Jatilawang", "hp": "081327727857", "email": "burusminah01@gmail.com", "pangkat": "IV/c"}, {"id": "g5", "nama": "Sri Sudaryanti", "nip": "198701222022212010", "nuptk": "0852764665210152", "jk": "P", "tempatLahir": "Sukoharjo", "tglLahir": "1987-01-22", "status": "PPPK", "jenisPTK": "Guru", "jabatan": "", "agama": "Islam", "alamat": "Gerduren, Gerduren, Kec. Purwojati", "hp": "082220214021", "email": "mayarta83@gmail.com", "pangkat": "IX"}, {"id": "g6", "nama": "Zaenul Kirom Anggi Pamukti", "nip": "198803082023211004", "nuptk": "4640766667130082", "jk": "L", "tempatLahir": "Banyumas", "tglLahir": "1988-03-08", "status": "PPPK", "jenisPTK": "Guru", "jabatan": "", "agama": "Islam", "alamat": "Jalan Raya Nasional III, Wangon, Kec. Wangon", "hp": "081392859258", "email": "arsipkuanggi@gmail.com", "pangkat": "IX"}], "tendik": [{"id": "t1", "nama": "AENAL FITRI HABIBAH", "nip": "", "nuptk": "", "jk": "P", "tempatLahir": "Banyumas", "tglLahir": "2003-05-02", "status": "Tenaga Honor Sekolah", "jenisPTK": "Tenaga Kependidikan", "jabatan": "", "agama": "Islam", "alamat": "Rt 03 Rw 06 Gerduren, Gerduren, Kec. Purwojati", "hp": "085773044649", "email": "aenalhabibah97@gmail.com", "pangkat": ""}, {"id": "t2", "nama": "LINGGARJATI GARY SANDIKA", "nip": "", "nuptk": "", "jk": "L", "tempatLahir": "BANYUMAS", "tglLahir": "1996-04-26", "status": "Tenaga Honor Sekolah", "jenisPTK": "Tenaga Kependidikan", "jabatan": "", "agama": "Islam", "alamat": "Tunjung RT 04 RW 03, Tunjung, Kec. Jatilawang", "hp": "081904962660", "email": "linggarjati240@gmail.com", "pangkat": ""}, {"id": "t3", "nama": "Sunartam", "nip": "197405182025211016", "nuptk": "", "jk": "L", "tempatLahir": "Banyumas", "tglLahir": "1974-05-18", "status": "PPPK", "jenisPTK": "Tenaga Kependidikan", "jabatan": "", "agama": "Islam", "alamat": "Gerduren, Gerduren, Kec. Purwojati", "hp": "081327369517", "email": "Sunartam01@gmail.com", "pangkat": ""}, {"id": "t4", "nama": "Yudhy Idapriyanto", "nip": "198312192006041005", "nuptk": "2551761663200003", "jk": "L", "tempatLahir": "Banyumas", "tglLahir": "1983-12-19", "status": "PNS", "jenisPTK": "Kepala Sekolah", "jabatan": "Kepala Sekolah", "agama": "Islam", "alamat": "Jl. GOR Cigolat No. 27, Sindangsari, Sindangsari", "hp": "082225006292", "email": "yudicell@ymail.com", "pangkat": "III/d"}]};

// Jadwal Pelajaran Kelas I - Tahun Ajaran 2026/2027 Semester 1, sesuai dokumen
// resmi "Jadwal Pelajaran Kelas I" SD Negeri 1 Gerduren yang ditandatangani
// Kepala Sekolah Yudhy Idapriyanto, S.Pd.SD. (NIP 198312192006041005),
// Gerduren, 13 Juli 2026.
const SEED_JADWAL_KELAS1 = {
  "Senin": [
    {jam:"06.30 - 07.00", mapel:"UPACARA"},
    {jam:"07.00 - 07.35", mapel:"PABP"},
    {jam:"07.35 - 08.10", mapel:"PABP"},
    {jam:"08.10 - 08.45", mapel:"PABP"},
    {jam:"08.45 - 09.00", mapel:"Istirahat/Sholat Dhuha"},
    {jam:"09.00 - 09.35", mapel:"Ko. PABP"},
    {jam:"09.35 - 10.10", mapel:"PEND. PANCASILA"},
    {jam:"10.10 - 10.45", mapel:"PEND. PANCASILA"},
    {jam:"10.45 - 11.20", mapel:"PEND. PANCASILA"},
  ],
  "Selasa": [
    {jam:"06.30 - 07.00", mapel:"Literasi"},
    {jam:"07.00 - 07.35", mapel:"PJOK"},
    {jam:"07.35 - 08.10", mapel:"PJOK"},
    {jam:"08.10 - 08.45", mapel:"PJOK"},
    {jam:"08.45 - 09.00", mapel:"Istirahat"},
    {jam:"09.00 - 09.35", mapel:"Ko. PJOK"},
    {jam:"09.35 - 10.10", mapel:"B. INDONESIA"},
    {jam:"10.10 - 10.45", mapel:"B. INDONESIA"},
    {jam:"10.45 - 11.20", mapel:"B. INDONESIA"},
  ],
  "Rabu": [
    {jam:"06.30 - 07.00", mapel:"Senam"},
    {jam:"07.00 - 07.35", mapel:"MATEMATIKA"},
    {jam:"07.35 - 08.10", mapel:"MATEMATIKA"},
    {jam:"08.10 - 08.45", mapel:"PEND. PANCASILA"},
    {jam:"08.45 - 09.00", mapel:"Istirahat"},
    {jam:"09.00 - 09.35", mapel:"B. JAWA"},
    {jam:"09.35 - 10.10", mapel:"B. JAWA"},
    {jam:"10.10 - 10.45", mapel:"KOKURIKULER"},
    {jam:"10.45 - 11.20", mapel:"KOKURIKULER"},
  ],
  "Kamis": [
    {jam:"06.30 - 07.00", mapel:"Literasi"},
    {jam:"07.00 - 07.35", mapel:"B. INDONESIA"},
    {jam:"07.35 - 08.10", mapel:"B. INDONESIA"},
    {jam:"08.10 - 08.45", mapel:"B. INDONESIA"},
    {jam:"08.45 - 09.00", mapel:"Istirahat"},
    {jam:"09.00 - 09.35", mapel:"SENI RUPA"},
    {jam:"09.35 - 10.10", mapel:"SENI RUPA"},
    {jam:"10.10 - 10.45", mapel:"SENI RUPA"},
  ],
  "Jumat": [
    {jam:"06.30 - 07.00", mapel:"Tadarus"},
    {jam:"07.00 - 07.35", mapel:"MATEMATIKA"},
    {jam:"07.35 - 08.10", mapel:"MATEMATIKA"},
    {jam:"08.10 - 08.45", mapel:"B. INDONESIA"},
    {jam:"08.45 - 09.00", mapel:"Istirahat"},
    {jam:"09.00 - 09.35", mapel:"KOKURIKULER"},
    {jam:"09.35 - 10.10", mapel:"KOKURIKULER"},
  ],
  "Sabtu": [],
};
const SEED_SEKOLAH = {
  namaSekolah: "SEKOLAH DASAR NEGERI 1 GERDUREN",
  npsn: "[Belum tersedia]",
  alamat: "Jl. Ki Wargalaksana No. 08",
  desa: "Gerduren",
  kecamatan: "Purwojati",
  kabupaten: "Banyumas",
  provinsi: "Jawa Tengah",
  kodePos: "53175",
  telp: "[Belum tersedia]",
  email: "sdngerduren01@gmail.com",
  website: "[Belum tersedia]",
  kepalaSekolah: "Yudhy Idapriyanto",
  nipKepsek: "198312192006041005",
  akreditasi: "[Belum tersedia]",
  tahunAjaran: "2026/2027",
  semester: "1 (Ganjil)",
  kelas: "1 (Satu)",
  waliKelasId: "",
  logoDataUrl: ""
};

// ============================================================
// CAPAIAN PEMBELAJARAN (CP) - MULTI-FASE (A/B/C), REVISI 2026
// ------------------------------------------------------------
// Dasar hukum:
// 1. Keputusan Kepala BSKAP Kemendikdasmen No. 046/H/KR/2025 tentang
//    Capaian Pembelajaran pada PAUD, Jenjang Pendidikan Dasar, dan
//    Jenjang Pendidikan Menengah (CP seluruh mata pelajaran, berlaku
//    sejak ditetapkan tahun 2025).
// 2. Keputusan Kepala Badan Kebijakan Pendidikan Dasar dan Menengah
//    (BKPDM) No. 020 Tahun 2026 tentang Perubahan atas Kepka BSKAP
//    No. 046/H/KR/2025, ditetapkan dan berlaku sejak 11 Juni 2026.
//    Perubahan ini KHUSUS mengubah Lampiran II & Lampiran V, yaitu
//    Capaian Pembelajaran mata pelajaran Pendidikan Agama dan Budi
//    Pekerti (seluruh agama) serta Pendidikan Khusus Pendidikan
//    Agama dan Budi Pekerti, pada seluruh fase (A-F). CP mata
//    pelajaran lain TIDAK berubah dan tetap mengacu pada Kepka BSKAP
//    No. 046/H/KR/2025. Satuan pendidikan agar meninjau ulang ATP,
//    modul ajar, dan asesmen mapel Pendidikan Agama & Budi Pekerti
//    agar selaras dengan CP hasil revisi 2026 ini.
// Pembagian fase SD: Fase A = Kelas 1-2, Fase B = Kelas 3-4,
// Fase C = Kelas 5-6. Setiap kelas otomatis memakai CP sesuai
// fasenya lewat fungsi faseForClassId() / cpSeedForFase() di bawah.
// ============================================================
const CP_LEGAL_NOTE = "CP mata pelajaran Pendidikan Agama dan Budi Pekerti pada halaman ini mengikuti Keputusan Kepala BKPDM No. 020 Tahun 2026 (perubahan atas Kepka BSKAP No. 046/H/KR/2025, berlaku sejak 11 Juni 2026, khusus Lampiran II & V). CP mata pelajaran lainnya tetap mengacu Kepka BSKAP No. 046/H/KR/2025 dan tidak mengalami perubahan pada revisi 2026 ini.";

function faseForClassId(classId){
  const c = classInfo(classId);
  if(c.angka<=2) return "A";
  if(c.angka<=4) return "B";
  return "C";
}
function faseLabel(fase){
  return fase==="A" ? "Fase A (Kelas 1-2)" : fase==="B" ? "Fase B (Kelas 3-4)" : "Fase C (Kelas 5-6)";
}

// ---------- FASE A (Kelas 1-2) ----------
const SEED_CP_FASE_A = [
 {fase:"A", mapel:"Pendidikan Agama Islam dan Budi Pekerti", elemen:"Al-Qur'an Hadis", cp:"Membaca dan membedakan huruf hijaiah berharakat serta huruf hijaiah bersambung; menghafal Surah al-Fatihah dan beberapa surah pendek Al-Qur'an; memahami hadis tentang kebersihan sebagai bagian dari cinta kepada Al-Qur'an dan Hadis Nabi.", revisi2026:true},
 {fase:"A", mapel:"Pendidikan Agama Islam dan Budi Pekerti", elemen:"Akidah", cp:"Menjelaskan dan meyakini enam rukun iman, iman kepada Allah Swt., beberapa asmaulhusna, dan iman kepada malaikat, sebagai fondasi kecenderungan kepada kebaikan (al-hanifiyyah).", revisi2026:true},
 {fase:"A", mapel:"Pendidikan Agama Islam dan Budi Pekerti", elemen:"Akhlak", cp:"Menerapkan akhlak terhadap Allah Swt. dengan menyucikan dan memuji-Nya, serta akhlak terhadap diri sendiri melalui pembiasaan perilaku terpuji (mahmudah) sehari-hari, sebagai wujud akhlak mulia (makarim al-akhlaq).", revisi2026:true},
 {fase:"A", mapel:"Pendidikan Agama Islam dan Budi Pekerti", elemen:"Fikih", cp:"Memahami rukun Islam, syahadatain, tata cara bersuci, salat fardu, azan, ikamah, zikir, dan berdoa setelah salat sebagai pembiasaan ibadah dasar (ubudiyyah).", revisi2026:true},
 {fase:"A", mapel:"Pendidikan Agama Islam dan Budi Pekerti", elemen:"Sejarah Peradaban Islam", cp:"Memahami kisah beberapa nabi dan rasul sebagai keteladanan akhlak dan semangat keilmuan dalam kehidupan sehari-hari.", revisi2026:true},
 {fase:"A", mapel:"Pendidikan Pancasila", elemen:"Pancasila", cp:"Mengenal bendera negara, lagu kebangsaan, simbol dan sila-sila Pancasila dalam lambang negara Garuda Pancasila; menerapkan nilai-nilai Pancasila di lingkungan keluarga."},
 {fase:"A", mapel:"Pendidikan Pancasila", elemen:"UUD NRI Tahun 1945", cp:"Mengenal aturan di lingkungan keluarga; menunjukkan dan menceritakan sikap mematuhi aturan di lingkungan keluarga."},
 {fase:"A", mapel:"Pendidikan Pancasila", elemen:"Bhinneka Tunggal Ika", cp:"Mengenal semboyan Bhinneka Tunggal Ika; mengidentifikasi dan menghargai identitas dirinya sesuai jenis kelamin, hobi, bahasa, serta agama dan kepercayaan di lingkungan sekitar."},
 {fase:"A", mapel:"Pendidikan Pancasila", elemen:"NKRI", cp:"Mengenal karakteristik lingkungan tempat tinggal dan sekolah sebagai bagian dari wilayah NKRI; mempraktikkan kerja sama menjaga lingkungan sekitar dalam keberagaman."},
 {fase:"A", mapel:"Bahasa Indonesia", elemen:"Menyimak", cp:"Memahami informasi dari teks aural (dibacakan/didengarkan) berupa percakapan tentang diri, keluarga, dan/atau lingkungan sekitar; memahami pesan teks sastra berbentuk aural."},
 {fase:"A", mapel:"Bahasa Indonesia", elemen:"Membaca dan Memirsa", cp:"Membaca kata-kata sederhana dengan fasih tentang diri, keluarga, kesehatan, dan/atau lingkungan sekitar; memahami isi bacaan dan/atau tayangan yang dipirsa."},
 {fase:"A", mapel:"Bahasa Indonesia", elemen:"Berbicara dan Mempresentasikan", cp:"Merespons dengan bertanya, menjawab, dan menanggapi komentar orang lain secara santun; mengungkapkan perasaan dan gagasan secara lisan."},
 {fase:"A", mapel:"Bahasa Indonesia", elemen:"Menulis", cp:"Menulis permulaan dengan benar di atas kertas dan/atau media digital; mengembangkan tulisan tangan; menulis berbagai tipe teks sederhana tentang diri, keluarga, dan/atau lingkungan sekitar."},
 {fase:"A", mapel:"Matematika", elemen:"Bilangan", cp:"Menunjukkan pemahaman bilangan cacah sampai 100; membaca, menulis, menentukan nilai tempat, membandingkan, mengurutkan bilangan; operasi penjumlahan-pengurangan sampai 20; memahami pecahan setengah dan seperempat."},
 {fase:"A", mapel:"Matematika", elemen:"Aljabar", cp:"Memahami makna simbol \"=\" pada penjumlahan/pengurangan bilangan cacah sampai 20 menggunakan gambar; mengenali dan melanjutkan pola bukan bilangan."},
 {fase:"A", mapel:"Matematika", elemen:"Pengukuran", cp:"Membandingkan panjang, berat, dan durasi waktu secara langsung; mengukur dan mengestimasi panjang/berat benda dengan satuan tidak baku."},
 {fase:"A", mapel:"Matematika", elemen:"Geometri", cp:"Mengenal bangun datar dan bangun ruang; melakukan komposisi/dekomposisi bangun datar; menentukan posisi benda relatif (kanan, kiri, depan, belakang, atas, bawah)."},
 {fase:"A", mapel:"Matematika", elemen:"Analisis Data dan Peluang", cp:"Mengurutkan, menyortir, mengelompokkan, dan menyajikan data dari banyak benda menggunakan turus dan piktogram maksimal 4 kategori."},
 {fase:"A", mapel:"PJOK", elemen:"Terampil Bergerak", cp:"Mempraktikkan keterampilan gerak fundamental dan menerapkannya dalam berbagai situasi gerak yang berbeda."},
 {fase:"A", mapel:"PJOK", elemen:"Belajar Melalui Gerak", cp:"Menaati peraturan untuk menumbuhkan fair play dalam aktivitas jasmani; menerapkan strategi kolaborasi sederhana."},
 {fase:"A", mapel:"PJOK", elemen:"Bergaya Hidup Aktif", cp:"Berpartisipasi dalam berbagai aktivitas jasmani dan mengidentifikasi manfaatnya bagi tubuh."},
 {fase:"A", mapel:"PJOK", elemen:"Memilih Hidup yang Menyehatkan", cp:"Mengenali gaya hidup aktif dan sehat, manfaat makanan bergizi seimbang, serta strategi mencari bantuan kepada orang dewasa terpercaya saat berisiko."},
 {fase:"A", mapel:"Seni Musik", elemen:"Mengalami", cp:"Mengenali unsur-unsur musik (nada dan irama) menggunakan anggota tubuh maupun alat musik."},
 {fase:"A", mapel:"Seni Musik", elemen:"Menciptakan", cp:"Membuat pola irama menggunakan anggota tubuh atau alat musik ritmis yang tersedia di lingkungan sekitar."},
 {fase:"A", mapel:"Seni Rupa", elemen:"Mengalami", cp:"Mengenali dan menyebutkan unsur-unsur rupa dalam benda-benda di sekitar/karya seni rupa."},
 {fase:"A", mapel:"Seni Rupa", elemen:"Menciptakan", cp:"Membuat karya seni rupa berdasarkan pengalaman dan hasil pengamatan terhadap lingkungan sekitar."},
];

// ---------- FASE B (Kelas 3-4) ----------
const SEED_CP_FASE_B = [
 {fase:"B", mapel:"Pendidikan Agama Islam dan Budi Pekerti", elemen:"Al-Qur'an Hadis", cp:"Membaca surah-surah pendek/ayat Al-Qur'an dengan lebih tartil dan menjelaskan pesan pokoknya; mengenal hadis tentang kewajiban salat dan menjaga hubungan baik dengan sesama serta menerapkannya dalam kehidupan sehari-hari.", revisi2026:true},
 {fase:"B", mapel:"Pendidikan Agama Islam dan Budi Pekerti", elemen:"Akidah", cp:"Memahami sifat-sifat wajib bagi Allah, beberapa asmaulhusna, mengenal kitab-kitab Allah, serta para nabi dan rasul yang wajib diimani.", revisi2026:true},
 {fase:"B", mapel:"Pendidikan Agama Islam dan Budi Pekerti", elemen:"Akhlak", cp:"Menghormati dan berbakti kepada orang tua dan guru, menyampaikan ungkapan positif (kalimah tayyibah) dalam keseharian, serta memahami keragaman sebagai ketentuan Allah Swt. (sunnatullah), dengan penekanan pada kerja sama dan tanggung jawab.", revisi2026:true},
 {fase:"B", mapel:"Pendidikan Agama Islam dan Budi Pekerti", elemen:"Fikih", cp:"Melaksanakan ibadah puasa dan salat dengan lebih memahami tata caranya, serta mengaitkan ibadah wajib dengan realitas kehidupan sehari-hari.", revisi2026:true},
 {fase:"B", mapel:"Pendidikan Agama Islam dan Budi Pekerti", elemen:"Sejarah Peradaban Islam", cp:"Mengenal norma di lingkungan sekitar dan lingkungan lebih luas, percaya diri mengungkapkan pendapat, serta memahami pentingnya musyawarah dan persatuan melalui teladan sejarah Islam.", revisi2026:true},
 {fase:"B", mapel:"Pendidikan Pancasila", elemen:"Pancasila", cp:"Memahami dan menganalisis hubungan antarsila dalam Pancasila; menerapkan nilai-nilai Pancasila dalam kehidupan sehari-hari di lingkungan sekolah dan masyarakat."},
 {fase:"B", mapel:"Pendidikan Pancasila", elemen:"UUD NRI Tahun 1945", cp:"Mengidentifikasi aturan/norma yang berlaku di lingkungan sekolah dan masyarakat; menunjukkan perilaku patuh terhadap aturan/tata tertib di sekolah."},
 {fase:"B", mapel:"Pendidikan Pancasila", elemen:"Bhinneka Tunggal Ika", cp:"Mengidentifikasi dan menampilkan keragaman budaya, suku, agama di lingkungan sekitar; menunjukkan sikap toleransi dan kerja sama antar teman yang beragam."},
 {fase:"B", mapel:"Pendidikan Pancasila", elemen:"NKRI", cp:"Mengenal wilayah, kondisi geografis, dan keragaman budaya sebagai bagian dari NKRI; menunjukkan sikap cinta tanah air dalam kehidupan sehari-hari."},
 {fase:"B", mapel:"Bahasa Indonesia", elemen:"Menyimak", cp:"Memahami dan menganalisis informasi berupa gagasan, pikiran, dan pandangan dari teks aural sesuai tujuan, tentang topik yang beragam."},
 {fase:"B", mapel:"Bahasa Indonesia", elemen:"Membaca dan Memirsa", cp:"Membaca kata-kata baru dengan pola kombinasi huruf yang dikenali secara tepat; memahami ide pokok dan ide pendukung pada teks informasional dan teks naratif."},
 {fase:"B", mapel:"Bahasa Indonesia", elemen:"Berbicara dan Mempresentasikan", cp:"Menyampaikan gagasan lisan dengan santun menggunakan volume dan intonasi yang tepat sesuai konteks; berpartisipasi aktif dalam diskusi kelompok."},
 {fase:"B", mapel:"Bahasa Indonesia", elemen:"Menulis", cp:"Menulis teks eksposisi, narasi, dan deskripsi hasil pengamatan dengan struktur yang lebih lengkap serta menggunakan kosakata baru dari teks yang dibaca/didengar."},
 {fase:"B", mapel:"Matematika", elemen:"Bilangan", cp:"Membaca, menulis, membandingkan bilangan cacah sampai 10.000; melakukan operasi hitung penjumlahan, pengurangan, perkalian, dan pembagian; memahami pecahan sederhana dan desimal."},
 {fase:"B", mapel:"Matematika", elemen:"Aljabar", cp:"Mengisi nilai yang belum diketahui dalam kalimat matematika berupa persamaan sederhana; mengenali, meniru, dan mengembangkan pola bilangan maupun pola gambar."},
 {fase:"B", mapel:"Matematika", elemen:"Pengukuran", cp:"Mengukur panjang, berat, waktu, dan volume menggunakan satuan baku; menyelesaikan masalah yang berkaitan dengan pengukuran dalam kehidupan sehari-hari."},
 {fase:"B", mapel:"Matematika", elemen:"Geometri", cp:"Mengklasifikasi berbagai bangun datar dan bangun ruang berdasarkan ciri-cirinya; menentukan keliling dan luas bangun datar sederhana."},
 {fase:"B", mapel:"Matematika", elemen:"Analisis Data dan Peluang", cp:"Mengumpulkan, menyajikan, dan menafsirkan data dalam bentuk tabel, diagram batang, dan piktogram."},
 {fase:"B", mapel:"Ilmu Pengetahuan Alam dan Sosial (IPAS)", elemen:"Pemahaman IPAS", cp:"Mengidentifikasi ciri makhluk hidup, siklus hidup, ekosistem sederhana, wujud dan perubahan zat, gaya, energi, serta keragaman sosial-budaya, ekonomi, dan sejarah di lingkungan sekitar."},
 {fase:"B", mapel:"Ilmu Pengetahuan Alam dan Sosial (IPAS)", elemen:"Keterampilan Proses", cp:"Mengamati, mempertanyakan, memprediksi, merencanakan dan melakukan penyelidikan sederhana, memproses/menganalisis data, mengevaluasi, serta mengomunikasikan hasil penyelidikan secara sederhana."},
 {fase:"B", mapel:"PJOK", elemen:"Terampil Bergerak", cp:"Mempraktikkan variasi dan kombinasi berbagai gerak dasar (lokomotor, non-lokomotor, manipulatif) dalam berbagai bentuk permainan."},
 {fase:"B", mapel:"PJOK", elemen:"Belajar Melalui Gerak", cp:"Menerapkan konsep gerak dan strategi permainan sederhana secara sportif; bekerja sama dalam kelompok."},
 {fase:"B", mapel:"PJOK", elemen:"Bergaya Hidup Aktif", cp:"Menunjukkan aktivitas fisik yang teratur untuk kebugaran jasmani; mengidentifikasi manfaat pola hidup aktif."},
 {fase:"B", mapel:"PJOK", elemen:"Memilih Hidup yang Menyehatkan", cp:"Menerapkan pola makan sehat dan menjaga kebersihan diri; mengenali bahaya dari perilaku berisiko dan cara menghindarinya."},
 {fase:"B", mapel:"Seni Musik", elemen:"Mengalami", cp:"Mengidentifikasi unsur musik (irama, melodi, dinamika) melalui bernyanyi dan/atau bermain alat musik ritmis maupun melodis sederhana."},
 {fase:"B", mapel:"Seni Musik", elemen:"Menciptakan", cp:"Menciptakan pola irama dan melodi sederhana secara individu maupun kelompok."},
 {fase:"B", mapel:"Seni Rupa", elemen:"Mengalami", cp:"Mengenal dan bereksperimen dengan berbagai unsur, bahan, dan teknik dasar dalam berkarya seni rupa dua dan tiga dimensi."},
 {fase:"B", mapel:"Seni Rupa", elemen:"Menciptakan", cp:"Membuat karya seni rupa dua dan tiga dimensi berdasarkan pengamatan, imajinasi, dan pengalaman diri sendiri maupun lingkungan sekitar."},
 {fase:"B", mapel:"Bahasa Inggris", elemen:"Menyimak-Berbicara", cp:"Memahami dan merespons instruksi/pertanyaan sederhana dalam Bahasa Inggris terkait diri, keluarga, dan lingkungan sekitar dengan bantuan visual."},
 {fase:"B", mapel:"Bahasa Inggris", elemen:"Membaca-Memirsa", cp:"Memahami kata dan kalimat sederhana dalam teks bergambar tentang topik yang dekat dengan kehidupan murid."},
];

// ---------- FASE C (Kelas 5-6) ----------
const SEED_CP_FASE_C = [
 {fase:"C", mapel:"Pendidikan Agama Islam dan Budi Pekerti", elemen:"Al-Qur'an Hadis", cp:"Membaca Al-Qur'an secara mandiri dengan menerapkan dasar-dasar ilmu tajwid; menghafal dan memahami makna hadis-hadis pilihan terkait akhlak dan muamalah.", revisi2026:true},
 {fase:"C", mapel:"Pendidikan Agama Islam dan Budi Pekerti", elemen:"Akidah", cp:"Mengenal Allah melalui asmaulhusna secara lebih mendalam, memahami keniscayaan hari akhir, serta qada dan qadar sebagai landasan tauhid yang mandiri.", revisi2026:true},
 {fase:"C", mapel:"Pendidikan Agama Islam dan Budi Pekerti", elemen:"Akhlak", cp:"Mengenal dialog antaragama dan kepercayaan, menyadari peluang dan tantangan dari keragaman di Indonesia, serta membangun kesadaran sosial berlandaskan toleransi (tasamuh) secara mandiri.", revisi2026:true},
 {fase:"C", mapel:"Pendidikan Agama Islam dan Budi Pekerti", elemen:"Fikih", cp:"Melaksanakan ibadah wajib dan sunnah secara mandiri dengan pemahaman hukum syariat, serta memahami muamalah (hubungan baik antarsesama manusia) dalam kehidupan bermasyarakat.", revisi2026:true},
 {fase:"C", mapel:"Pendidikan Agama Islam dan Budi Pekerti", elemen:"Sejarah Peradaban Islam", cp:"Menganalisis sejarah peradaban Islam dan meneladani kepemimpinan tokoh sejarah untuk mengambil hikmah (ibrah) bagi kehidupan masa kini dan masa depan bangsa.", revisi2026:true},
 {fase:"C", mapel:"Pendidikan Pancasila", elemen:"Pancasila", cp:"Menganalisis penerapan nilai-nilai Pancasila dalam kehidupan bermasyarakat, berbangsa, dan bernegara; menunjukkan sikap yang mencerminkan nilai-nilai Pancasila secara konsisten."},
 {fase:"C", mapel:"Pendidikan Pancasila", elemen:"UUD NRI Tahun 1945", cp:"Menganalisis norma dan aturan yang berlaku di lingkungan sekolah, masyarakat, bangsa, dan negara; menunjukkan sikap taat hukum dalam kehidupan sehari-hari."},
 {fase:"C", mapel:"Pendidikan Pancasila", elemen:"Bhinneka Tunggal Ika", cp:"Menganalisis keberagaman suku, agama, ras, dan antargolongan sebagai kekayaan bangsa; menunjukkan sikap menghargai perbedaan dan anti-perundungan."},
 {fase:"C", mapel:"Pendidikan Pancasila", elemen:"NKRI", cp:"Menganalisis peran dan tanggung jawab warga negara dalam menjaga keutuhan NKRI; berpartisipasi aktif dalam kegiatan yang memperkuat persatuan bangsa."},
 {fase:"C", mapel:"Bahasa Indonesia", elemen:"Menyimak", cp:"Menganalisis dan mengevaluasi informasi dari teks aural yang lebih kompleks, termasuk membedakan fakta dan opini."},
 {fase:"C", mapel:"Bahasa Indonesia", elemen:"Membaca dan Memirsa", cp:"Membaca dan memahami berbagai jenis teks (fiksi dan nonfiksi) secara kritis, termasuk menemukan informasi tersurat dan tersirat serta menyimpulkan isi teks."},
 {fase:"C", mapel:"Bahasa Indonesia", elemen:"Berbicara dan Mempresentasikan", cp:"Mempresentasikan gagasan dan hasil karya secara percaya diri dengan struktur yang runtut dan bahasa yang santun di berbagai konteks."},
 {fase:"C", mapel:"Bahasa Indonesia", elemen:"Menulis", cp:"Menulis teks argumentasi, eksplanasi, dan naratif yang lebih kompleks dengan memperhatikan struktur, kaidah kebahasaan, dan tujuan penulisan."},
 {fase:"C", mapel:"Matematika", elemen:"Bilangan", cp:"Membaca, menulis, dan membandingkan bilangan cacah, pecahan, dan desimal; melakukan operasi hitung campuran termasuk pada bilangan pecahan dan desimal."},
 {fase:"C", mapel:"Matematika", elemen:"Aljabar", cp:"Menyatakan hubungan antara dua besaran dalam bentuk persamaan sederhana; menyelesaikan masalah yang melibatkan pola dan hubungan antar bilangan."},
 {fase:"C", mapel:"Matematika", elemen:"Pengukuran", cp:"Menghitung luas dan volume bangun datar/ruang gabungan; menyelesaikan masalah pengukuran dalam konteks kehidupan sehari-hari."},
 {fase:"C", mapel:"Matematika", elemen:"Geometri", cp:"Menganalisis sifat-sifat bangun datar dan bangun ruang serta hubungan antarbangun; menentukan koordinat pada bidang kartesius sederhana."},
 {fase:"C", mapel:"Matematika", elemen:"Analisis Data dan Peluang", cp:"Mengumpulkan, mengorganisasi, menyajikan, dan menganalisis data dalam bentuk diagram; memahami konsep dasar peluang suatu kejadian."},
 {fase:"C", mapel:"Ilmu Pengetahuan Alam dan Sosial (IPAS)", elemen:"Pemahaman IPAS", cp:"Menganalisis hubungan antarmakhluk hidup dan lingkungan, sistem organ tubuh, sifat dan perubahan energi, fenomena alam, serta dinamika sosial, ekonomi, dan sejarah bangsa Indonesia dan dunia."},
 {fase:"C", mapel:"Ilmu Pengetahuan Alam dan Sosial (IPAS)", elemen:"Keterampilan Proses", cp:"Merancang dan melakukan penyelidikan ilmiah sederhana secara sistematis, menganalisis data dengan alat bantu sederhana, serta mengomunikasikan hasil secara lisan/tulisan dengan argumen yang didukung data."},
 {fase:"C", mapel:"PJOK", elemen:"Terampil Bergerak", cp:"Mempraktikkan keterampilan gerak spesifik dalam berbagai permainan dan olahraga dengan kontrol yang baik."},
 {fase:"C", mapel:"PJOK", elemen:"Belajar Melalui Gerak", cp:"Menerapkan strategi dan taktik permainan secara kolaboratif dan sportif dalam pertandingan sederhana."},
 {fase:"C", mapel:"PJOK", elemen:"Bergaya Hidup Aktif", cp:"Merancang dan melaksanakan aktivitas fisik secara mandiri untuk menjaga kebugaran jasmani secara berkelanjutan."},
 {fase:"C", mapel:"PJOK", elemen:"Memilih Hidup yang Menyehatkan", cp:"Menganalisis dampak pilihan gaya hidup (pola makan, aktivitas fisik, penggunaan gawai) terhadap kesehatan fisik dan mental."},
 {fase:"C", mapel:"Seni Musik", elemen:"Mengalami", cp:"Menganalisis unsur-unsur musik yang lebih kompleks melalui apresiasi berbagai genre musik nusantara dan mancanegara."},
 {fase:"C", mapel:"Seni Musik", elemen:"Menciptakan", cp:"Menciptakan komposisi musik sederhana secara mandiri maupun kolaboratif dengan memanfaatkan alat musik yang tersedia."},
 {fase:"C", mapel:"Seni Rupa", elemen:"Mengalami", cp:"Mengeksplorasi berbagai teknik, bahan, dan media dalam berkarya seni rupa dua dan tiga dimensi secara lebih mandiri."},
 {fase:"C", mapel:"Seni Rupa", elemen:"Menciptakan", cp:"Menciptakan karya seni rupa yang mengekspresikan gagasan dan perasaan pribadi berdasarkan pengamatan dan refleksi terhadap lingkungan sekitar."},
 {fase:"C", mapel:"Bahasa Inggris", elemen:"Menyimak-Berbicara", cp:"Memahami dan menyampaikan informasi sederhana dalam Bahasa Inggris pada interaksi sosial sehari-hari dengan kepercayaan diri yang meningkat."},
 {fase:"C", mapel:"Bahasa Inggris", elemen:"Membaca-Menulis", cp:"Membaca dan menulis teks pendek sederhana dalam Bahasa Inggris terkait topik yang dekat dengan kehidupan murid."},
];

function cpSeedForFase(fase){
  return fase==="A" ? SEED_CP_FASE_A : fase==="B" ? SEED_CP_FASE_B : SEED_CP_FASE_C;
}
// SEED_CP dipertahankan (alias ke Fase A) demi kompatibilitas kode lama yang mungkin masih merujuknya.
const SEED_CP = SEED_CP_FASE_A;

// Struktur Kurikulum Kelas 1 SD - Permendikbudristek No. 12 Tahun 2024 tentang
// Kurikulum pada PAUD, Dikdas, dan Dikmen, sebagaimana diperkuat pendekatan
// Pembelajaran Mendalam melalui Permendikdasmen No. 13 Tahun 2025 (berlaku
// 15 Juli 2025). Asumsi 1 tahun ajaran = 36 minggu efektif, 1 JP = 35 menit.
// Kokurikuler (dahulu P5) kini berbentuk pembelajaran kolaboratif lintas
// disiplin / Gerakan 7 Kebiasaan Anak Indonesia Hebat sesuai Pasal 16-19
// Permendikdasmen No. 13/2025. Catatan: satuan pendidikan agar tetap
// menyesuaikan alokasi definitif dengan kebijakan Dinas Pendidikan setempat.
const JP_STRUKTUR_KELAS1 = [
 {mapel:"Pendidikan Agama Islam dan Budi Pekerti", intra:108, koku:36, total:144, jpMinggu:4},
 {mapel:"Pendidikan Pancasila", intra:108, koku:36, total:144, jpMinggu:4},
 {mapel:"Bahasa Indonesia", intra:144, koku:72, total:216, jpMinggu:6},
 {mapel:"Matematika", intra:108, koku:36, total:144, jpMinggu:4},
 {mapel:"PJOK", intra:108, koku:36, total:144, jpMinggu:4},
 {mapel:"Seni Musik", intra:72, koku:36, total:108, jpMinggu:3},
 {mapel:"Seni Rupa", intra:0, koku:0, total:0, jpMinggu:0, catatan:"Satuan pendidikan memilih salah satu jenis seni (musik/rupa/teater/tari); baris ini tampil sebagai opsi alternatif Seni Musik."},
 {mapel:"Muatan Lokal", intra:72, koku:0, total:72, jpMinggu:2, catatan:"Mata pelajaran pilihan (mis. Bahasa Jawa), menyesuaikan kebijakan daerah."},
];

// Kalender Pendidikan Provinsi Jawa Tengah T.A. 2026/2027 (jenjang SD, 5 hari
// sekolah) - dikutip dari Keputusan Kepala Dinas Pendidikan Provinsi Jawa
// Tengah Nomor 400.3/23862/2026 tentang Pedoman Penyusunan Kalender
// Pendidikan Tahun Ajaran 2026/2027, ditetapkan 29 Mei 2026. Kabupaten
// Banyumas mengikuti kalender provinsi ini kecuali ada penyesuaian dari
// Dinas Pendidikan Kabupaten Banyumas / Kantor Kemenag setempat.
const SEED_KALENDER = [
 {tanggal:"2026-07-13", judul:"Hari Pertama Masuk Sekolah T.A. 2026/2027", jenis:"Kegiatan Sekolah", keterangan:"Awal Semester 1 (Ganjil)."},
 {tanggal:"2026-07-13", judul:"Masa Pengenalan Lingkungan Sekolah (MPLS)", jenis:"Kegiatan Sekolah", keterangan:"MPLS 13-17 Juli 2026 bagi murid baru."},
 {tanggal:"2026-08-17", judul:"Upacara HUT Kemerdekaan RI ke-81", jenis:"Hari Efektif", keterangan:"Libur umum, upacara bendera."},
 {tanggal:"2026-09-05", judul:"Libur Umum: Maulid Nabi Muhammad SAW", jenis:"Libur Nasional", keterangan:""},
 {tanggal:"2026-10-01", judul:"Upacara Hari Kesaktian Pancasila", jenis:"Hari Efektif", keterangan:""},
 {tanggal:"2026-10-28", judul:"Upacara Hari Sumpah Pemuda", jenis:"Hari Efektif", keterangan:""},
 {tanggal:"2026-11-10", judul:"Upacara Hari Pahlawan", jenis:"Hari Efektif", keterangan:""},
 {tanggal:"2026-12-01", judul:"Perkiraan Awal Asesmen Sumatif Akhir Semester 1", jenis:"Ujian/Asesmen", keterangan:"Sesuaikan jadwal definitif dengan satuan pendidikan."},
 {tanggal:"2026-12-18", judul:"Penyerahan Rapor Semester 1 (Ganjil)", jenis:"Kegiatan Sekolah", keterangan:""},
 {tanggal:"2026-12-21", judul:"Libur Akhir Semester 1", jenis:"Libur Semester", keterangan:"21 Desember 2026 - 1 Januari 2027."},
 {tanggal:"2026-12-24", judul:"Cuti Bersama Hari Raya Natal", jenis:"Libur Nasional", keterangan:""},
 {tanggal:"2026-12-25", judul:"Libur Umum: Hari Raya Natal", jenis:"Libur Nasional", keterangan:""},
 {tanggal:"2027-01-01", judul:"Libur Umum: Tahun Baru Masehi", jenis:"Libur Nasional", keterangan:""},
 {tanggal:"2027-01-04", judul:"Hari Pertama Masuk Sekolah Semester 2 (Genap)", jenis:"Kegiatan Sekolah", keterangan:""},
 {tanggal:"2027-01-05", judul:"Libur Umum: Isra Mikraj Nabi Muhammad SAW", jenis:"Libur Nasional", keterangan:""},
 {tanggal:"2027-02-06", judul:"Libur Umum: Tahun Baru Imlek", jenis:"Libur Nasional", keterangan:""},
 {tanggal:"2027-02-10", judul:"Perkiraan Awal Bulan Ramadan 1448 H", jenis:"Kegiatan Sekolah", keterangan:"Pembelajaran Ramadan sesuai edaran bersama Kemendikdasmen-Kemenag."},
 {tanggal:"2027-03-08", judul:"Libur Umum: Hari Suci Nyepi", jenis:"Libur Nasional", keterangan:""},
 {tanggal:"2027-03-09", judul:"Libur Sebelum Hari Raya Idulfitri", jenis:"Libur Nasional", keterangan:""},
 {tanggal:"2027-03-10", judul:"Libur Umum: Hari Raya Idulfitri 1448 H (Hari ke-1)", jenis:"Libur Nasional", keterangan:""},
 {tanggal:"2027-03-11", judul:"Libur Umum: Hari Raya Idulfitri 1448 H (Hari ke-2)", jenis:"Libur Nasional", keterangan:""},
 {tanggal:"2027-03-12", judul:"Libur Sesudah Hari Raya Idulfitri", jenis:"Libur Nasional", keterangan:"12-13 Maret 2027."},
 {tanggal:"2027-03-26", judul:"Libur Umum: Wafat Isa Almasih", jenis:"Libur Nasional", keterangan:""},
 {tanggal:"2027-04-19", judul:"Perkiraan Tes Kemampuan Akademik (TKA) SD", jenis:"Ujian/Asesmen", keterangan:"19-29 April 2027, sesuaikan jadwal resmi."},
 {tanggal:"2027-04-21", judul:"Upacara Hari Kartini", jenis:"Hari Efektif", keterangan:""},
 {tanggal:"2027-05-01", judul:"Libur Umum: Hari Buruh Internasional", jenis:"Libur Nasional", keterangan:""},
 {tanggal:"2027-05-02", judul:"Upacara Hari Pendidikan Nasional", jenis:"Hari Efektif", keterangan:""},
 {tanggal:"2027-05-06", judul:"Libur Umum: Kenaikan Isa Almasih", jenis:"Libur Nasional", keterangan:""},
 {tanggal:"2027-05-17", judul:"Libur Umum: Hari Raya Iduladha 1448 H", jenis:"Libur Nasional", keterangan:""},
 {tanggal:"2027-05-20", judul:"Upacara Hari Kebangkitan Nasional & Libur Umum Hari Raya Waisak", jenis:"Hari Efektif", keterangan:""},
 {tanggal:"2027-06-01", judul:"Upacara Hari Lahir Pancasila", jenis:"Hari Efektif", keterangan:""},
 {tanggal:"2027-06-06", judul:"Libur Umum: Tahun Baru Islam 1449 H", jenis:"Libur Nasional", keterangan:""},
 {tanggal:"2027-06-07", judul:"Perkiraan Pengumuman Kelulusan", jenis:"Kegiatan Sekolah", keterangan:""},
 {tanggal:"2027-06-18", judul:"Penyerahan Rapor Semester 2 (Genap)", jenis:"Kegiatan Sekolah", keterangan:"Akhir Tahun Ajaran 2026/2027."},
 {tanggal:"2027-06-21", judul:"Libur Akhir Semester 2 / Tahun Ajaran", jenis:"Libur Semester", keterangan:"21 Juni - 10 Juli 2027."},
].map(e=>({...e, id:"cal_"+e.tanggal+"_"+Math.random().toString(36).slice(2,6)}));

/* ============================================================
   1B. GENERATOR ATP & KKTP LANGSUNG DARI CP RESMI
   TP diturunkan langsung dari setiap klausa Capaian Pembelajaran (CP)
   Fase A (Kepbadan BSKAP No. 046/H/KR/2025) yang sudah dikutip di atas,
   dipasangkan dengan alokasi JP per Struktur Kurikulum Kelas 1 (lihat
   JP_STRUKTUR_KELAS1) dan dibagi proporsional ke Semester 1 / Semester 2.
   ============================================================ */
function lowerFirstChar(s){ return s ? s.charAt(0).toLowerCase()+s.slice(1) : s; }
function splitCPClauses(text){
  return text.split(/;\s+/).map(s=>s.trim().replace(/\.$/,"")).filter(Boolean);
}
function jpMingguForMapel(mapel){
  const row = JP_STRUKTUR_KELAS1.find(r=>r.mapel===mapel && r.jpMinggu>0);
  return row ? row.jpMinggu : 2;
}
function generateSeedATP(cpList){
  const list = cpList || SEED_CP_FASE_A;
  const out = [];
  const runningIndexByMapel = {};
  list.forEach(row=>{
    const clauses = splitCPClauses(row.cp).slice(0,2); // maksimal 2 TP per elemen agar ATP tetap ringkas dan terkelola
    clauses.forEach(clause=>{
      const idx = runningIndexByMapel[row.mapel] = (runningIndexByMapel[row.mapel]||0)+1;
      out.push({
        id: uid("atp"),
        mapel: row.mapel,
        elemen: row.elemen,
        tp: "Peserta didik mampu " + lowerFirstChar(clause) + ", melalui pengalaman belajar memahami, mengaplikasi, dan merefleksi (Pembelajaran Mendalam).",
        alokasiWaktu: String(jpMingguForMapel(row.mapel)),
        semester: (idx % 2 === 1) ? "1" : "2",
        fase: row.fase || "A",
      });
    });
  });
  return out;
}
function generateSeedKKTP(cpList){
  const list = cpList || SEED_CP_FASE_A;
  const mapels = [...new Set(list.map(r=>r.mapel))];
  const out = [];
  mapels.forEach(m=>{
    out.push({
      id: uid("kktp"), mapel:m,
      tp: "Seluruh Tujuan Pembelajaran (TP) mata pelajaran "+m+" pada Semester berjalan (lihat menu ATP).",
      kriteria: "Peserta didik menunjukkan pemahaman dan penerapan konsep sesuai indikator pada tiap TP, dinilai melalui observasi guru, unjuk kerja, dan hasil karya, mengacu pada 3 prinsip Pembelajaran Mendalam (berkesadaran, bermakna, menggembirakan) serta 8 Dimensi Profil Lulusan (Permendikdasmen No. 10/2025).",
      interval: "Berkembang Sesuai Harapan (70-84)"
    });
  });
  return out;
}

// 8 Dimensi Profil Lulusan - Permendikdasmen No.10/2025 Pasal 4
const DIMENSI_PROFIL = [
 {kode:"keimanan", nama:"Keimanan & Ketakwaan terhadap Tuhan YME", desk:"Memiliki keyakinan dan mengamalkan ajaran agama/kepercayaannya, berakhlak mulia, serta menjaga hubungan dengan Tuhan YME, sesama manusia, dan lingkungan."},
 {kode:"kewargaan", nama:"Kewargaan", desk:"Bangga akan identitas dan budayanya, menghargai keberagaman, menjaga persatuan bangsa, menaati aturan bernegara dan bermasyarakat."},
 {kode:"penalaran", nama:"Penalaran Kritis", desk:"Memiliki rasa ingin tahu, berpikir logis dan analitis, mampu menganalisis dan menyelesaikan permasalahan, memanfaatkan literasi dan numerasi."},
 {kode:"kreativitas", nama:"Kreativitas", desk:"Mampu berperilaku produktif, menciptakan inovasi, dan merumuskan solusi bagi permasalahan di sekitarnya."},
 {kode:"kolaborasi", nama:"Kolaborasi", desk:"Membiasakan diri untuk peduli dan berbagi, serta membangun kerja sama dengan berbagai kalangan di lingkungan sekitar."},
 {kode:"kemandirian", nama:"Kemandirian", desk:"Mampu bertanggung jawab, berinisiatif, dan beradaptasi dalam pembelajaran dan pengembangan diri."},
 {kode:"kesehatan", nama:"Kesehatan", desk:"Menjalankan pola hidup bersih dan sehat, memahami kebugaran, kesehatan fisik dan mental, berkontribusi positif terhadap lingkungan."},
 {kode:"komunikasi", nama:"Komunikasi", desk:"Memiliki kemampuan menyimak, membaca, berbicara, dan menulis dengan baik dan benar sesuai etika dalam beragam konteks dan moda."},
];

const MAPEL_LIST = ["Pendidikan Agama Islam dan Budi Pekerti","Pendidikan Pancasila","Bahasa Indonesia","Matematika","PJOK","Seni Musik","Seni Rupa","Bahasa Inggris","Muatan Lokal"];

