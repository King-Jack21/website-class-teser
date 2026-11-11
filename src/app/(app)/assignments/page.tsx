import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { submitAssignment } from "@/app/actions";
import { formatDate } from "@/lib/utils";

export default async function AssignmentsPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const profile = (await getCurrentProfile())!;
  const supabase = await createClient();
  let query = supabase.from("assignments").select("*, classes(name)").order("created_at", { ascending: false });

  if (profile.role === "teacher") {
    const { data: owned } = await supabase.from("classes").select("id").eq("teacher_id", profile.id);
    query = query.in("class_id", (owned || []).map((c) => c.id));
  } else if (profile.role === "student") {
    const { data: memberships } = await supabase.from("class_members").select("class_id").eq("student_id", profile.id);
    query = query.in("class_id", (memberships || []).map((m) => m.class_id));
  }

  const { data: assignments } = await query;
  const { data: submissions } = profile.role === "student"
    ? await supabase.from("submissions").select("assignment_id,status,score").eq("student_id", profile.id)
    : { data: [] as any[] };
  const submitted = new Map((submissions || []).map((s: any) => [s.assignment_id, s]));
  const params = await searchParams;

  return <div className="space-y-6">
    <div><span className="pill">Pembelajaran</span><h1 className="mt-3 text-3xl font-black">Tugas</h1><p className="mt-2 text-sm text-slate-500">Daftar tugas dari kelas yang terhubung denganmu.</p></div>
    {params.error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{params.error}</p>}
    {params.message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{params.message}</p>}
    <div className="space-y-4">{(assignments || []).map((a: any) => <article className="card" key={a.id}>
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase text-blue-600">{a.classes?.name || "Kelas"}</p><h2 className="mt-1 text-lg font-black">{a.title}</h2></div><span className="pill">Maks. {a.max_score}</span></div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{a.description || "Tidak ada deskripsi."}</p>
      <p className="mt-3 text-xs text-slate-500">Tenggat: {formatDate(a.deadline)}</p>
      {profile.role === "student" && <div className="mt-4 border-t border-slate-100 pt-4">
        {submitted.has(a.id) ? <p className="text-sm font-bold text-emerald-700">Jawaban terkirim · Status: {submitted.get(a.id).status}</p> :
          <form action={submitAssignment} className="space-y-2"><input type="hidden" name="assignment_id" value={a.id}/><label className="label">Jawaban kamu</label><textarea className="field min-h-24" name="answer_text" required placeholder="Tuliskan jawaban tugas..."/><button className="btn btn-primary">Kirim jawaban</button></form>}
      </div>}
    </article>)}</div>
    {!assignments?.length && <div className="card py-12 text-center"><p className="font-bold">Belum ada tugas</p><p className="mt-2 text-sm text-slate-500">Tugas dari kelasmu akan muncul di sini.</p></div>}
  </div>;
}
