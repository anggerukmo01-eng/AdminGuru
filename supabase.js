/* ==========================================================
   KONFIGURASI SUPABASE - TEACHER PLANNER SD 2026
   ----------------------------------------------------------
   File ini HANYA berisi kredensial project Supabase Bapak/Ibu
   Guru sendiri. TIDAK ada logika aplikasi di sini.

   Cara mengisi:
   1. Buka https://supabase.com, buat/pilih project.
   2. Buka menu "Project Settings" -> "API".
   3. Salin "Project URL" ke SUPABASE_URL di bawah ini.
   4. Salin "anon public" key ke SUPABASE_ANON_KEY di bawah ini.
   5. Simpan file ini, lalu muat ulang index.html.

   Lihat PANDUAN_SUPABASE.md untuk panduan bergambar langkah
   demi langkah, termasuk cara membuat Storage Bucket "backups"
   dan menjalankan supabase_setup.sql.

   PENTING: anon public key AMAN untuk ditaruh di sisi klien
   (browser) selama Row Level Security (RLS) sudah diaktifkan
   sesuai supabase_setup.sql -- JANGAN pernah menaruh "service
   role key" di file ini atau di mana pun pada aplikasi front-end.
   ========================================================== */
const SUPABASE_URL = "https://rjvildbajfmhpauevrgc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqdmlsZGJhamZtaHBhdWV2cmdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxODQzMDgsImV4cCI6MjEwMDc2MDMwOH0.rcWLd374WaKWWK_tVbCCGM9utbFJ5zgukaVilUYpA6Q";

// Deteksi otomatis: bila kredensial belum diisi (masih placeholder "xxxxx"),
// window.supabaseClient dibiarkan null sehingga halaman "Cloud Storage" pada
// aplikasi akan menampilkan pesan "Belum Dikonfigurasi" alih-alih error,
// dan seluruh fitur lain aplikasi tetap berjalan normal 100% offline.
(function initSupabaseClient(){
  const belumDiisi =
    !SUPABASE_URL || !SUPABASE_ANON_KEY ||
    SUPABASE_URL.indexOf("xxxxx") !== -1 ||
    SUPABASE_ANON_KEY.indexOf("xxxxx") !== -1;

  if(belumDiisi){
    window.supabaseClient = null;
    console.warn("[Teacher Planner] Konfigurasi Supabase belum diisi. Edit file supabase.js untuk mengaktifkan fitur Cloud Storage.");
    return;
  }
  if(typeof supabase === "undefined" || !supabase.createClient){
    window.supabaseClient = null;
    console.warn("[Teacher Planner] Pustaka Supabase JS gagal dimuat (periksa koneksi internet).");
    return;
  }
  window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
})();
