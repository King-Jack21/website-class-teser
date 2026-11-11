import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAssignment } from "@/app/actions";

export default async function NewAssignmentPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const profile = await requireRole(["teacher", "owner"]);
  const supabase = await createClient();
  const { data: classes } = await supabase.from("classes").select("id,name").eq("teacher_id", profile.id);
  const params = await searchParams;

  return <div className="mx-auto max-w-2xl space-y-6">
    <div><span className="pill">Guru</span><h1 className="mt-3 text-3xl font-black">Buat tugas</h1><p className="mt-2 text-sm text-slate-500">Terbitkan tugas untuk salah satu kelas yang kamu kelola.</p></div>
    <form action={createAssignment} className="card space-y-4">
      {params.error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{params.error}</p>}
      <div><label className="label">Pilih kelas</label><select className="field" name="class_id" required defaultValue=""><option value="" disabled>Pilih kelas</option>{(classes || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div><label className="label">Judul tugas</label><input className="field" name="title" required minLength={3} placeholder="Contoh: Latihan Bab 1"/></div>
      <div><label className="label">Deskripsi / instruksi</label><textarea className="field min-h-28" name="description" placeholder="Tuliskan instruksi tugas..."/></div>
      <div><label className="label">Tenggat waktu</label><input className="field" type="datetime-local" name="deadline"/></div>
      <div><label className="label">Nilai maksimal</label><input className="field" type="number" name="max_score" min="1" max="1000" defaultValue="100"/></div>
      <button className="btn btn-primary" disabled={!classes?.length}>Terbitkan tugas</button>
      {!classes?.length && <p className="text-xs text-amber-700">Buat kelas terlebih dahulu sebelum membuat tugas.</p>}
    </form>
  </div>;
}
