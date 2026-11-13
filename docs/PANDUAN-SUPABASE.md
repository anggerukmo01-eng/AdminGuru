# Panduan Menyiapkan Supabase Cloud Backup

Dipindahkan dari kartu Pengaturan aplikasi AdminGuru (13 Nov 2026) —
isi panduan tetap berlaku; kartu di aplikasi sudah dihapus atas permintaan Anggi.

Fitur Backup Cloud bersifat opsional: tanpa Supabase, aplikasi tetap 100% offline.

1. Buat akun & project baru di supabase.com, pilih region terdekat, tunggu inisialisasi selesai.
2. Salin Project URL dan Anon Public Key dari menu "Project Settings → API".
3. Buka file supabase.js pada folder aplikasi ini, isi SUPABASE_URL dan SUPABASE_ANON_KEY sesuai milik Bapak/Ibu Guru.
4. Buat Storage Bucket bernama backups dengan opsi Private (bukan Public).
5. Jalankan seluruh perintah pada file supabase_setup.sql lewat SQL Editor Supabase (membuat bucket bila belum ada & mengaktifkan Row Level Security beserta policy-nya).
6. Jalankan aplikasi ini lewat alamat http/https (GitHub Pages/Netlify/Vercel/server lokal), lalu buka menu Cloud Storage → "Login / Daftar" untuk membuat akun Email & Password.
7. Klik "Backup Cloud" untuk mencadangkan pertama kali, lalu pastikan berkasnya muncul di daftar backup dan pada bucket backups di dashboard Supabase.
8. Lihat PANDUAN_SUPABASE.md yang disertakan untuk panduan lengkap langkah demi langkah.
