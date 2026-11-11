import { getCurrentProfile } from "@/lib/auth";

export default async function SettingsPage() {
  const profile = (await getCurrentProfile())!;
  return <div className="max-w-2xl space-y-6">
    <div><span className="pill">Akun</span><h1 className="mt-3 text-3xl font-black">Pengaturan</h1><p className="mt-2 text-sm text-slate-500">Informasi akun Vantrex Class.</p></div>
    <section className="card space-y-4">
      <div><p className="text-xs text-slate-500">Nama lengkap</p><p className="mt-1 font-bold">{profile.full_name}</p></div>
      <div><p className="text-xs text-slate-500">Email</p><p className="mt-1 font-bold">{profile.email}</p></div>
      <div><p className="text-xs text-slate-500">Role akun</p><p className="mt-1"><span className="pill">{profile.role}</span></p></div>
      <div><p className="text-xs text-slate-500">Status</p><p className="mt-1 font-bold">{profile.is_active ? "Aktif" : "Nonaktif"}</p></div>
    </section>
    <p className="text-xs leading-5 text-slate-500">Untuk mengubah nama atau password, gunakan pengaturan akun Supabase yang akan ditambahkan pada iterasi berikutnya.</p>
  </div>;
}
