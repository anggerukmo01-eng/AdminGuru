/* ================================================================
   FILE: assets/js/90-boot.js
   Dipecah dari index.html monolit. Urutan load = urutan nama file.
   Jangan ubah urutan <script> di index.html.
   ================================================================ */
/* ============================================================
   9. BOOT
   ============================================================ */
/* Flag migrasi roster Dapodik sekali pakai (2 Nov 2026). */
const ROSTER_DAPODIK_FLAG = "tpsd2026_roster_dapodik_sync_20261102";
/* Flag pengaman seed (13 Nov 2026, Fase 1): diset bila APK (file://)
   berjalan TANPA seed Dapodik padahal penyimpanan masih kosong — supaya
   Beranda menampilkan peringatan keras dan aplikasi tidak diam-diam
   memakai data tersamar lama. Dihapus bila seed ditemukan. */
const SEED_DAPODIK_MISSING_FLAG = "tpsd2026_seed_dapodik_hilang_20261113";
/* Flag migrasi sinkronisasi BI sekali pakai (13 Nov 2026, Fase 2). */
const SISWA_BI_SYNC_FLAG = "tpsd2026_siswa_bi_sync_20261113";
/* Flag migrasi PTK lengkap sekali pakai (13 Nov 2026, Fase 1 — APK uji v1.0.18). */
const PTK_SYNC_FLAG = "tpsd2026_ptk_lengkap_sync_20261113";
const NAMA_EYD_FLAG = "tpsd2026_nama_eyd_dedup_20261102";
const JURNAL_SIMULASI_FLAG = "tpsd2026_jurnal_simulasi_20261102";
/* Gabungkan roster Dapodik ke roster tablet.
   - Cocok: NISN (persis) lalu nama ternormalisasi unik dalam kelas.
   - Rekaman tablet yang cocok DIPERBARUI di tempat (id & nomor absen
     dipertahankan); nilai seed yang kosong tidak menimpa data manual.
   - Siswa Dapodik tanpa pasangan DITAMBAHKAN (id seed, nomor urut lanjut).
   - Siswa tablet tanpa pasangan DIBIARKAN (tidak dihapus).
   Mengembalikan {siswa, tambah, perbarui, takCocok}. */
function mergeRosterDapodik(lama, seed){
  const norm = v => String(v||"").toLowerCase().replace(/[^a-z0-9]/g, "");
  const takosong = v => v!==undefined && v!==null && String(v)!=="";
  const parseTgl = v => {
    const s = String(v||"").trim();
    let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if(m) return m[1]+"-"+String(+m[2]).padStart(2,"0")+"-"+String(+m[3]).padStart(2,"0");
    m = s.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
    if(m){
      const bln = {januari:1,jan:1,februari:2,feb:2,maret:3,mar:3,april:4,apr:4,mei:5,juni:6,jun:6,juli:7,jul:7,agustus:8,agu:8,september:9,sept:9,sep:9,oktober:10,okt:10,november:11,nov:11,desember:12,des:12};
      const b = bln[m[2].toLowerCase()];
      if(b) return m[3]+"-"+String(b).padStart(2,"0")+"-"+String(+m[1]).padStart(2,"0");
    }
    return "";
  };
  const lev = (a,b) => {
    a = norm(a); b = norm(b);
    if(a===b) return 0;
    let prev = [], cur = [];
    for(let j=0;j<=b.length;j++) prev[j] = j;
    for(let i=1;i<=a.length;i++){
      cur[0] = i;
      for(let j=1;j<=b.length;j++)
        cur[j] = Math.min(prev[j]+1, cur[j-1]+1, prev[j-1]+(a[i-1]===b[j-1]?0:1));
      const tmp = prev; prev = cur; cur = tmp;
    }
    return prev[b.length];
  };
  const gabungObj = (tujuan, asal) => {
    Object.keys(asal||{}).forEach(k=>{
      const v = asal[k];
      if(v && typeof v==="object" && !Array.isArray(v)){
        tujuan[k] = gabungObj(tujuan[k] && typeof tujuan[k]==="object" ? tujuan[k] : {}, v);
      } else if(takosong(v)){
        tujuan[k] = v;
      }
    });
    return tujuan;
  };
  const daftar = (lama||[]).slice();
  const sudahCocok = new Set(), seedCocok = new Set();
  const byNisn = new Map(), byNama = new Map(), namaGanda = new Set();
  daftar.forEach(s=>{
    if(s.nisn) byNisn.set(String(s.nisn), s);
    const n = norm(s.nama);
    if(n){ if(byNama.has(n)) namaGanda.add(n); else byNama.set(n, s); }
  });
  let tambah = 0, perbarui = 0;
  let noMax = daftar.reduce((m,s)=>Math.max(m, Number(s.no)||0), 0);
  const pasangkan = (t, sd) => {
    sudahCocok.add(t); seedCocok.add(sd); perbarui++;
    ["nama","jk","nis","nisn","ttl","agama","alamat","ayah","ibu","pekerjaanOrtu"].forEach(k=>{
      if(takosong(sd[k])) t[k] = sd[k];
    });
    t.bi = gabungObj(t.bi && typeof t.bi==="object" ? t.bi : {}, sd.bi||{});
  };
  /* Tingkat 1: NISN persis. Tingkat 2: nama ternormalisasi persis & unik. */
  (seed||[]).forEach(sd=>{
    let t = (sd.nisn && byNisn.get(String(sd.nisn))) || null;
    if(!t){
      const n = norm(sd.nama);
      const kandidat = n && !namaGanda.has(n) ? byNama.get(n) : null;
      if(kandidat && !sudahCocok.has(kandidat)) t = kandidat;
    }
    if(t && !sudahCocok.has(t)) pasangkan(t, sd);
  });
  /* Tingkat 3: tanggal lahir sama + nama mirip (jarak ≤ 3, minimum unik).
     Menangkap varian ejaan (mis. satu-dua huruf beda) yang lolos tingkat 1–2. */
  (seed||[]).forEach(sd=>{
    if(seedCocok.has(sd)) return;
    const tgl = parseTgl((sd.bi&&sd.bi.tanggalLahir) || "");
    if(!tgl) return;
    let terbaik = null, jarakTerbaik = 99, jumlahTerbaik = 0;
    daftar.forEach(t=>{
      if(sudahCocok.has(t)) return;
      const tglT = parseTgl((t.bi&&t.bi.tanggalLahir) || t.ttl || "");
      if(tglT!==tgl) return;
      const d = lev(t.nama, sd.nama);
      if(d < jarakTerbaik){ jarakTerbaik = d; terbaik = t; jumlahTerbaik = 1; }
      else if(d === jarakTerbaik){ jumlahTerbaik++; }
    });
    if(terbaik && jarakTerbaik <= 3 && jumlahTerbaik === 1) pasangkan(terbaik, sd);
  });
  /* Sisa seed tanpa pasangan ditambahkan; sisa tablet dibiarkan. */
  (seed||[]).forEach(sd=>{
    if(seedCocok.has(sd)) return;
    tambah++;
    const salin = JSON.parse(JSON.stringify(sd));
    salin.no = ++noMax;
    daftar.push(salin);
  });
  return {siswa: daftar, tambah, perbarui, takCocok: daftar.length - sudahCocok.size - tambah};
}
function boot(){
  /* SEED DAPODIK (suntik lokal build APK, TIDAK ada di GitHub):
     - Penyimpanan masih kosong: tanam data Dapodik sekali pakai (perilaku
       lama). Flag seed BI lama diset dulu supaya seed BI lama tidak
       menimpa roster Dapodik.
     - Penyimpanan SUDAH berisi data (kasus tablet): gabungkan roster
       Dapodik ke tiap bucket kelas TANPA menyentuh rencana/nilai/jurnal/
       kehadiran/agenda (migrasi sekali pakai, flag ROSTER_DAPODIK_FLAG).
     Keduanya inert di web (tidak ada seed). Berjalan SEBELUM loadDB
     supaya data yang dibaca aplikasi sudah hasil gabungan. */
  if(typeof SEED_DAPODIK_2026!=="undefined" && typeof localStorage!=="undefined"
     && typeof classKey==="function" && typeof CLASS_LIST!=="undefined"
     && typeof BI_SEED_FLAG!=="undefined" && !localStorage.getItem(ROSTER_DAPODIK_FLAG)){
    try{
      localStorage.setItem(BI_SEED_FLAG, "1");
      if(typeof applyFullBackupPayload==="function"
         && CLASS_LIST.every(c=>!localStorage.getItem(classKey(c.id)))){
        applyFullBackupPayload(SEED_DAPODIK_2026);
        localStorage.setItem(ROSTER_DAPODIK_FLAG, "penuh");
      } else {
        const daftar = (SEED_DAPODIK_2026.classes||{});
        const ringkas = {tambah:0, perbarui:0, takCocok:0, hadirDiisi:0};
        /* Isi kehadiran Juli–Oktober 2026 dengan H pada hari efektif
           (Senin–Jumat di luar libur nasional), HANYA untuk sel yang
           masih kosong — S/I/A/H yang sudah ada tidak diubah; akhir
           pekan, hari libur, dan November ke atas tidak disentuh. */
        const liburSet = new Set((typeof LIBUR_NASIONAL!=="undefined" && Array.isArray(LIBUR_NASIONAL)) ? LIBUR_NASIONAL : ["2026-08-17","2026-08-25"]);
        const isiKehadiran = (bucket) => {
          if(!bucket || !bucket.siswa || !bucket.siswa.length) return;
          bucket.kehadiran = bucket.kehadiran || {};
          const d = new Date(2026, 6, 1);
          const akhir = new Date(2026, 9, 31);
          for(; d <= akhir; d.setDate(d.getDate()+1)){
            const dow = d.getDay(); if(dow===0 || dow===6) continue;
            const iso = d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
            if(liburSet.has(iso)) continue;
            const hari = bucket.kehadiran[iso] || (bucket.kehadiran[iso] = {});
            bucket.siswa.forEach(s=>{ if(!hari[s.id]){ hari[s.id] = "H"; ringkas.hadirDiisi++; } });
          }
        };
        /* Isi jadwal piket & kelompok belajar dari seed (2 Nov 2026,
           perintah Anggi; kelompok = tim piket Senin–Jumat): bila bucket
           belum punya datanya (kosong/tidak ada), isi dari seed —
           dicocokkan lewat NAMA ke roster hasil gabungan (id tablet
           dipertahankan, bukan id seed). Data yang sudah diisi guru
           tidak diubah. */
        const isiStoreDariSeed = (bucket, seedClass, key, grupKey) => {
          if(!bucket || !Array.isArray(bucket.siswa)) return;
          if(Array.isArray(bucket[key]) && bucket[key].length) return;
          const seedRows = (seedClass && seedClass[key]) || [];
          if(!seedRows.length) return;
          const norm = v => String(v||"").toLowerCase().replace(/[^a-z0-9]/g, "");
          const seedNama = {};
          (seedClass.siswa||[]).forEach(s=>{ if(s.id) seedNama[s.id] = s.nama; });
          const byNama = {};
          bucket.siswa.forEach(s=>{ const n = norm(s.nama); if(n && !byNama[n]) byNama[n] = s; });
          const rows = [];
          seedRows.forEach(r=>{
            const t = byNama[norm(seedNama[r.siswaId]||"")];
            if(t){ const row = {id: r.id, siswaId: t.id, keterangan: r.keterangan || ""}; row[grupKey] = r[grupKey]; rows.push(row); }
          });
          if(rows.length) bucket[key] = rows;
        };
        Object.keys(daftar).forEach(cid=>{
          let raw = null;
          try{ const s = localStorage.getItem(classKey(cid)); if(s) raw = JSON.parse(s); }catch(e){}
          const hasil = mergeRosterDapodik((raw && raw.siswa) || [], (daftar[cid].siswa||[]));
          ringkas.tambah += hasil.tambah; ringkas.perbarui += hasil.perbarui; ringkas.takCocok += hasil.takCocok;
          if(raw){ raw.siswa = hasil.siswa; isiKehadiran(raw); isiStoreDariSeed(raw, daftar[cid], "jadwalPiket", "hari"); isiStoreDariSeed(raw, daftar[cid], "kelompokBelajar", "kelompok"); localStorage.setItem(classKey(cid), JSON.stringify(raw)); }
          else if(hasil.siswa.length){ const nb = {siswa: hasil.siswa}; isiKehadiran(nb); isiStoreDariSeed(nb, daftar[cid], "jadwalPiket", "hari"); isiStoreDariSeed(nb, daftar[cid], "kelompokBelajar", "kelompok"); localStorage.setItem(classKey(cid), JSON.stringify(nb)); }
        });
        localStorage.setItem(ROSTER_DAPODIK_FLAG, JSON.stringify(ringkas));
      }
    }catch(e){}
  }

  /* PENGAMAN SEED (13 Nov 2026, Fase 1): bila aplikasi berjalan sebagai
     APK (file://) TETAPI seed Dapodik tidak ditemukan DAN penyimpanan
     masih kosong — mis. build lupa menyuntik seed-dapodik.js — tandai
     supaya Beranda menampilkan peringatan keras. Tanpa ini, aplikasi
     jatuh diam-diam ke data tersamar lama (SEED_BI_TXT, 7 Sep 2026).
     Di web (https) tidak pernah aktif; bila seed ada, penanda dihapus. */
  if(typeof localStorage!=="undefined" && typeof classKey==="function"
     && typeof CLASS_LIST!=="undefined"){
    try{
      if(typeof SEED_DAPODIK_2026==="undefined"
         && typeof location!=="undefined" && location.protocol==="file:"
         && CLASS_LIST.every(c=>!localStorage.getItem(classKey(c.id)))){
        localStorage.setItem(SEED_DAPODIK_MISSING_FLAG, "1");
      } else if(typeof SEED_DAPODIK_2026!=="undefined"){
        localStorage.removeItem(SEED_DAPODIK_MISSING_FLAG);
      }
    }catch(e){}
  }

  /* MIGRASI SINKRONISASI BI (13 Nov 2026, Fase 2): siswa yang dulu
     ditambah lewat form cepat/CSV menyimpan BB/TB/anak-ke/jumlah-saudara
     dan TTL sebagai field datar — tabel 66 kolom membaca dari s.bi,
     sehingga nilai itu tidak tampil. Sekali pakai: salin field datar ke
     bi bila bi masih kosong. Data seed (bi sudah terisi) tidak berubah. */
  if(typeof localStorage!=="undefined" && typeof classKey==="function"
     && typeof CLASS_LIST!=="undefined" && typeof syncSiswaFlatKeBi==="function"
     && !localStorage.getItem(SISWA_BI_SYNC_FLAG)){
    try{
      let diperbaiki = 0;
      CLASS_LIST.forEach(c=>{
        let raw = null;
        try{ const s = localStorage.getItem(classKey(c.id)); if(s) raw = JSON.parse(s); }catch(e){}
        if(!raw || !Array.isArray(raw.siswa)) return;
        raw.siswa.forEach(s=>{
          const sebelum = JSON.stringify(s.bi||{});
          syncSiswaFlatKeBi(s);
          if(JSON.stringify(s.bi||{})!==sebelum) diperbaiki++;
        });
        localStorage.setItem(classKey(c.id), JSON.stringify(raw));
      });
      localStorage.setItem(SISWA_BI_SYNC_FLAG, JSON.stringify({diperbaiki}));
    }catch(e){}
  }

  /* MIGRASI PTK LENGKAP (13 Nov 2026, Fase 1 — APK uji v1.0.18): seed
     Dapodik 13 Nov membawa data guru/tendik LENGKAP (51 field), sedangkan
     perangkat yang sudah memakai APK lama hanya menyimpan 15 field — hook
     roster tidak menyentuh data PTK (flag-nya sudah terpasang di perangkat
     lama). Sekali pakai: padankan tiap PTK seed ke data tersimpan lewat
     id (atau nama), lalu isi/perbarui field dari seed, mengikuti pola
     migrasi roster: Dapodik adalah sumber utama, nilai seed yang kosong
     tidak menimpa data manual, id dipertahankan. PTK yang hanya ada di
     perangkat (tidak ada di seed) tidak dihapus; PTK baru dari seed
     ditambahkan. Telepon sekolah hanya dibersihkan bila masih placeholder
     "[Belum tersedia]" (bukan nomor yang diketik guru). */
  if(typeof localStorage!=="undefined" && typeof SEED_DAPODIK_2026!=="undefined"
     && typeof loadSharedDB==="function" && typeof saveSharedDB==="function"
     && !localStorage.getItem(PTK_SYNC_FLAG)){
    try{
      const shared = loadSharedDB();
      const norm = v => String(v||"").toLowerCase().replace(/[^a-z0-9]/g, "");
      const ringkas = {perbarui: 0, tambah: 0};
      ["guru", "tendik"].forEach(tab=>{
        const daftar = Array.isArray(shared[tab]) ? shared[tab] : (shared[tab] = []);
        const seed = (SEED_DAPODIK_2026.shared && SEED_DAPODIK_2026.shared[tab]) || [];
        seed.forEach(sp=>{
          let row = daftar.find(r=>r.id===sp.id);
          if(!row) row = daftar.find(r=>norm(r.nama)===norm(sp.nama));
          if(row){
            let berubah = false;
            Object.keys(sp).forEach(k=>{
              if(k==="id") return;
              const v = sp[k];
              if(v!==undefined && v!==null && String(v)!=="" && row[k]!==v){ row[k] = v; berubah = true; }
            });
            if(berubah) ringkas.perbarui++;
          } else {
            daftar.push(JSON.parse(JSON.stringify(sp)));
            ringkas.tambah++;
          }
        });
      });
      if(shared.sekolah && shared.sekolah.telp==="[Belum tersedia]"){
        shared.sekolah.telp = (SEED_DAPODIK_2026.shared && SEED_DAPODIK_2026.shared.sekolah && SEED_DAPODIK_2026.shared.sekolah.telp) || "";
      }
      saveSharedDB(shared);
      localStorage.setItem(PTK_SYNC_FLAG, JSON.stringify(ringkas));
    }catch(e){}
  }

  /* PERBAIKAN DATA SISWA (2 Nov 2026, perintah Anggi) — sekali pakai,
     bekerja dari data tersimpan saja (tidak butuh seed), SETELAH blok
     migrasi roster di atas dan SEBELUM loadDB:
     (a) DATA GANDA: migrasi roster bisa gagal memasangkan satu anak
         bila ejaan DAN tanggal lahirnya beda dari Dapodik (contoh
         Kelas 1: "Fadli Hardi Yanto" tablet, ttl 6 Jun 2019, vs
         "Fadli Hardy Yanto" Dapodik, lahir 6 Jul 2019 — lolos dari
         ketiga tingkat pencocokan, sehingga keduanya tampil).
         Bila dalam satu kelas ada pasangan (id Dapodik dp*-* + id lama)
         yang namanya mirip (jarak edit <= 3, dan jarak itu unik),
         gabungkan: riwayat id lama (kehadiran dan struktur per-siswa
         lain) dipindah ke id Dapodik — riwayat lama MENANG atas isian
         migrasi bila bentrok — id Dapodik mewarisi nomor absen dan
         posisi id lama, lalu id lama dihapus. Siswa tanpa pasangan
         Dapodik tetap dipertahankan (bukan data ganda).
     (b) EYD: nama yang tersimpan KAPITAL SEMUA (bawaan Dapodik)
         ditulis ulang Title Case: huruf pertama tiap kata kapital,
         sisanya kecil; tanda hubung membuka kata baru, apostrof tidak
         ("AL-FARIZI" -> "Al-Farizi", "AL'FARIZZI" -> "Al'farizzi").
         Berlaku untuk nama siswa, nama ayah/ibu/wali, tempat lahir,
         dan ttl. Ejaan dan data Dapodik tidak diubah, hanya
         kapitalisasinya. */
  if(typeof localStorage!=="undefined" && typeof classKey==="function"
     && typeof CLASS_LIST!=="undefined" && !localStorage.getItem(NAMA_EYD_FLAG)){
    try{
      const eyd = s => String(s||"").split(" ").map(w => w.split("-").map(p => p ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : p).join("-")).join(" ");
      const norm = v => String(v||"").toLowerCase().replace(/[^a-z0-9]/g, "");
      const lev = (a,b) => {
        a = norm(a); b = norm(b);
        if(a===b) return 0;
        let prev = [], cur = [];
        for(let j=0;j<=b.length;j++) prev[j] = j;
        for(let i=1;i<=a.length;i++){
          cur[0] = i;
          for(let j=1;j<=b.length;j++)
            cur[j] = Math.min(prev[j]+1, cur[j-1]+1, prev[j-1]+(a[i-1]===b[j-1]?0:1));
          const tmp = prev; prev = cur; cur = tmp;
        }
        return prev[b.length];
      };
      const ringkas = {hapus: 0, gabung: 0, nama: 0};
      const gelarNama = s => {
        let n = 0;
        const baru = eyd(s.nama);
        if(baru !== s.nama){ s.nama = baru; n++; }
        ["ayah","ibu"].forEach(k => {
          if(s[k] && eyd(s[k]) !== s[k]){ s[k] = eyd(s[k]); n++; }
        });
        if(s.ttl && eyd(s.ttl) !== s.ttl){ s.ttl = eyd(s.ttl); n++; }
        if(s.bi && typeof s.bi === "object"){
          if(s.bi.tempatLahir && eyd(s.bi.tempatLahir) !== s.bi.tempatLahir){ s.bi.tempatLahir = eyd(s.bi.tempatLahir); n++; }
          ["ayah","ibu","wali"].forEach(r => {
            const o = s.bi[r];
            if(o && o.nama && eyd(o.nama) !== o.nama){ o.nama = eyd(o.nama); n++; }
          });
        }
        return n;
      };
      CLASS_LIST.forEach(c => {
        const raw = localStorage.getItem(classKey(c.id));
        if(!raw) return;
        let bucket;
        try{ bucket = JSON.parse(raw); }catch(e){ return; }
        if(!bucket || !Array.isArray(bucket.siswa)) return;
        bucket.siswa.forEach(s => { ringkas.nama += gelarNama(s); });
        const isDp = s => /^dp\d+-/.test(s.id || "");
        const terpakai = new Set();
        const pasangan = [];
        bucket.siswa.forEach(dp => {
          if(!isDp(dp)) return;
          let terbaik = null, jarakTerbaik = 99, jumlahTerbaik = 0;
          bucket.siswa.forEach(t => {
            if(isDp(t) || t === dp || terpakai.has(t)) return;
            const d = lev(t.nama, dp.nama);
            if(d < jarakTerbaik){ jarakTerbaik = d; terbaik = t; jumlahTerbaik = 1; }
            else if(d === jarakTerbaik){ jumlahTerbaik++; }
          });
          if(terbaik && jarakTerbaik <= 3 && jumlahTerbaik === 1){
            terpakai.add(terbaik); pasangan.push([terbaik, dp]);
          }
        });
        pasangan.forEach(pair => {
          const lama = pair[0], baru = pair[1];
          const idxLama = bucket.siswa.indexOf(lama);
          baru.no = lama.no;
          const pindah = o => {
            if(!o || typeof o !== "object") return;
            if(Array.isArray(o)){ o.forEach(pindah); return; }
            Object.keys(o).forEach(k => {
              const v = o[k];
              if(k === "siswaId" && v === lama.id){ o[k] = baru.id; }
              else if(k === lama.id){ o[baru.id] = v; delete o[k]; }
              else pindah(v);
            });
          };
          Object.keys(bucket).forEach(k => { if(k !== "siswa") pindah(bucket[k]); });
          bucket.siswa.splice(idxLama, 1);
          const idxBaru = bucket.siswa.indexOf(baru);
          bucket.siswa.splice(idxBaru, 1);
          bucket.siswa.splice(idxLama, 0, baru);
          ringkas.hapus++; ringkas.gabung++;
        });
        localStorage.setItem(classKey(c.id), JSON.stringify(bucket));
      });
      localStorage.setItem(NAMA_EYD_FLAG, JSON.stringify(ringkas));
    }catch(e){}
  }

  db = loadDB(); saveDB();
  /* ISI JURNAL SIMULASI (2 Nov 2026, perintah Anggi): bila berkas
     jurnal-simulasi ada dan flag belum diset, isi kegiatan & refleksi
     entri agenda Kelas 1 Juli–Oktober 2026 yang masih kosong dari
     daftar simulasi. Cocok tanggal+mapel+materi dulu; fallback
     tanggal+mapel HANYA untuk entri bertanda rencana v4 (supaya entri
     manual guru — mis. Seni Rupa 27 Agu yang tanggal & mapelnya sama
     dengan entri rencana — tidak ikut terisi). Entri yang sudah
     ditulis guru tidak diubah; entri November, hari libur, dan entri
     manual tidak disentuh. Berjalan SETELAH loadDB supaya agenda sudah
     hasil migrasi v4. Sekali pakai (flag). */
  try{
    if(typeof JURNAL_SIMULASI_2026!=="undefined" && typeof localStorage!=="undefined"
       && typeof classKey==="function" && !localStorage.getItem(JURNAL_SIMULASI_FLAG)){
      const rawS = localStorage.getItem(classKey("kelas-1"));
      if(rawS){
        const bucket = JSON.parse(rawS);
        const agenda = bucket.agenda || [];
        const daftar = JURNAL_SIMULASI_2026;
        const pakai = new Set();
        const byKunci = {}; const byTM = {};
        daftar.forEach((s,i)=>{
          (byKunci[s.t+"|"+s.m+"|"+s.mat] = byKunci[s.t+"|"+s.m+"|"+s.mat] || []).push(i);
          (byTM[s.t+"|"+s.m] = byTM[s.t+"|"+s.m] || []).push(i);
        });
        const tagV4 = (typeof RENCANA_PBL_TAG!=="undefined") ? RENCANA_PBL_TAG : null;
        let diisiKeg = 0, diisiRef = 0;
        agenda.forEach(e=>{
          if(!e.tanggal || e.tanggal < "2026-07-01" || e.tanggal > "2026-10-31") return;
          const matAgenda = String(e.materi||"").replace(/^Materi:\s*/, "").split("\nTP:")[0].trim();
          let idx = -1;
          const kk = byKunci[e.tanggal+"|"+e.mapel+"|"+matAgenda];
          if(kk){ for(const i of kk){ if(!pakai.has(i)){ idx = i; break; } } }
          if(idx < 0 && tagV4 && e._rencana === tagV4){
            const tt = byTM[e.tanggal+"|"+e.mapel];
            if(tt){ for(const i of tt){ if(!pakai.has(i)){ idx = i; break; } } }
          }
          if(idx < 0) return;
          const s = daftar[idx];
          let ubah = false;
          if(!e.kegiatan && s.keg){ e.kegiatan = s.keg; diisiKeg++; ubah = true; }
          if(!e.refleksi && s.ref){ e.refleksi = s.ref; diisiRef++; ubah = true; }
          if(ubah){ e._simulasi = 1; pakai.add(idx); }
        });
        localStorage.setItem(classKey("kelas-1"), JSON.stringify(bucket));
        localStorage.setItem(JURNAL_SIMULASI_FLAG, JSON.stringify({kegiatan: diisiKeg, refleksi: diisiRef}));
      }
    }
  }catch(e){}
  settings = loadSettings();
  applyTheme();
  buildSidebar();
  if(typeof renderPapanInfo==="function") setInterval(renderPapanInfo, 1000);
  showLockScreen();
  const requested=new URLSearchParams(location.search).get('page');
  navigate(NAV.some(g=>g.items.some(i=>i.id===requested))?requested:'dashboard');
  if(cloudConfigured()){ cloudCheckSession().then(()=>{ if(cloudUser && currentPage==="dashboard") renderPage("dashboard"); }); }
  if(typeof cloudHandleRecoveryLink==="function") cloudHandleRecoveryLink();
  window.addEventListener("resize", ()=>{ if(window.innerWidth>960) toggleSidebar(false); });
  checkKalenderReminders();
  setInterval(checkKalenderReminders, 60*1000);
  if(typeof checkAgendaReminders==="function"){
    checkAgendaReminders();
    setInterval(checkAgendaReminders, 60*1000);
  }
}
document.addEventListener("DOMContentLoaded", boot);
