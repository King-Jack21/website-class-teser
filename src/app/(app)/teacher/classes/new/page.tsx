import { createClass } from "@/app/actions";
import { requireRole } from "@/lib/auth";
import Link from "next/link";

export default async function NewClassPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireRole(["teacher", "owner"]);
  const params = await searchParams;
  return <div className="mx-auto max-w-2xl space-y-6">
    <Link href="/classes" className="text-sm font-bold text-blue-600">← Kembali ke kelas</Link>
    <div><span className="pill">Guru</span><h1 className="mt-3 text-3xl font-black">Buat kelas baru</h1><p className="mt-2 text-sm text-slate-500">Buat ruang belajar dan bagikan kode kelas kepada siswa.</p></div>
    <form action={createClass} className="card space-y-4">
      {params.error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{params.error}</p>}
      <div><label className="label">Nama kelas</label><input className="field" name="name" minLength={3} required placeholder="Contoh: Matematika Kelas X"/></div>
      <div><label className="label">Deskripsi</label><textarea className="field min-h-28" name="description" placeholder="Informasi singkat tentang kelas"/></div>
      <button className="btn btn-primary">Buat kelas</button>
    </form>
  </div>;
}
