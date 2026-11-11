# Vantrex Class

Starter LMS berbasis Next.js 15 + Supabase untuk tiga role: Owner, Guru, dan Siswa.

## Fitur starter

- Registrasi publik otomatis menjadi `student`.
- Login email/password melalui Supabase Auth.
- Dashboard terpisah berdasarkan role.
- Owner dapat mengangkat Siswa menjadi Guru atau mengembalikannya menjadi Siswa.
- Guru dapat membuat kelas.
- Siswa dapat bergabung ke kelas menggunakan kode.
- Guru dapat membuat tugas.
- Siswa dapat mengirim jawaban teks.
- Supabase Row Level Security (RLS) untuk membatasi akses data.
- UI responsive dengan tema modern biru.

> Ini adalah fondasi MVP yang dapat dijalankan dan dikembangkan. Fitur upload file, kuis/ujian bertimer, notifikasi realtime, Google OAuth, absensi, dan ekspor laporan belum diimplementasikan pada starter ini.

## 1. Persiapan

Buat project di Supabase, lalu buka **Project Settings → API** dan salin:
- Project URL
- Publishable key (atau anon key pada project lama)
- Service role key (server-only)

Salin `.env.example` menjadi `.env.local`, lalu isi nilainya.

## 2. Siapkan database

Buka Supabase **SQL Editor**, jalankan seluruh isi `supabase/schema.sql`.

Schema membuat tabel, trigger profil otomatis, fungsi keamanan, dan RLS policies.

## 3. Buat akun Owner pertama

1. Jalankan aplikasi dan daftarkan akun menggunakan email Owner yang kamu kendalikan.
2. Verifikasi email jika Supabase meminta verifikasi.
3. Di Supabase SQL Editor, jalankan query berikut dengan email yang tepat:

```sql
update public.profiles
set role = 'owner'
where email = lower('email-owner-kamu@example.com');
```

Jalankan ini hanya untuk akun Owner pertama yang benar-benar kamu kendalikan. Jangan pernah memberikan service role key kepada pengguna atau memasukkannya ke frontend.

Setelah itu, Owner dapat mengubah role pengguna lain dari menu **Kelola Pengguna**.

## 4. Jalankan lokal

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

## 5. Deploy GitHub → Vercel

1. Buat repository GitHub bernama `vantrex-class`.
2. Upload/push seluruh isi folder project.
3. Di Vercel pilih **Add New → Project**, lalu import repository.
4. Tambahkan environment variables yang sama seperti `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (isi URL production Vercel)
5. Deploy.

Setiap push ke branch production (biasanya `main`) akan memicu deployment baru.

## Keamanan penting

- Jangan commit `.env.local`.
- Jangan pernah menggunakan `SUPABASE_SERVICE_ROLE_KEY` pada komponen client.
- Role publik selalu dibuat `student` oleh trigger database.
- Pengguna tidak bisa memilih role ketika registrasi.
- Perubahan role hanya tersedia melalui server action Owner.
- RLS tetap memeriksa role dan kepemilikan data di database.
- Sebelum dipakai sekolah/organisasi sungguhan, lakukan pengujian keamanan dan backup database.

## Struktur ringkas

```text
src/
  app/
    (auth)/login, register
    (app)/dashboard, classes, teacher, owner
    actions.ts
  components/
  lib/supabase/
supabase/schema.sql
```
