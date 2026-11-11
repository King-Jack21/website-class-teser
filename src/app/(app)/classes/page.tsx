import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { joinClass } from "@/app/actions";
import Link from "next/link";

export default async function ClassesPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const profile = (await getCurrentProfile())!;
  const supabase = await createClient();
  let classes: any[] = [];

  if (profile.role === "student") {
    const { data: memberships } = await supabase.from("class_members").select("class_id, classes(*)").eq("student_id", profile.id);
    classes = (memberships || []).map((m: any) => m.classes).filter(Boolean);
  } else if (profile.role === "owner") {
    const { data } = await supabase.from("classes").select("*").order("created_at", { ascending: false });
    classes = data || [];
  } else {
    const { data } = await supabase.from("classes").select("*").eq("teacher_id", profile.id).order("created_at", { ascending: false });
    classes = data || [];
  }

  const params = await searchParams;
  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><span className="pill">Pembelajaran</span><h1 className="mt-3 text-3xl font-black">Kelas Saya</h1><p className="mt-2 text-sm text-slate-500">Semua ruang kelas yang terhubung dengan akunmu.</p></div>
      {(profile.role === "teacher" || profile.role === "owner") && <Link href="/teacher/classes/new" className="btn btn-primary">+ Buat kelas</Link>}
    </div>
    {params.error && <Notice type="error">{params.error}</Notice>}{params.message && <Notice>{params.message}</Notice>}
    {profile.role === "student" && <form action={joinClass} className="card flex flex-col gap-3 sm:flex-row"><div className="flex-1"><label className="label">Kode kelas</label><input className="field uppercase" name="class_code" placeholder="Contoh: ABC12345" required/></div><button className="btn btn-primary self-end">Gabung kelas</button></form>}
    {classes.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{classes.map((item) => <article className="card" key={item.id}><span className="pill">KELAS</span><h2 className="mt-4 text-xl font-black">{item.name}</h2><p className="mt-2 min-h-10 text-sm text-slate-500">{item.description || "Belum ada deskripsi kelas."}</p><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500"><span>Kode: <b className="tracking-wider text-slate-800">{item.class_code}</b></span><span>Aktif</span></div></article>)}</div> : <div className="card py-12 text-center"><h3 className="font-bold">Belum ada kelas</h3><p className="mt-2 text-sm text-slate-500">{profile.role === "student" ? "Masukkan kode kelas untuk mulai bergabung." : "Buat kelas pertamamu untuk memulai."}</p></div>}
  </div>;
}
function Notice({ children, type = "success" }: { children: React.ReactNode; type?: "success" | "error" }) { return <p className={`rounded-xl p-3 text-sm ${type === "error" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{children}</p>; }
                                                 
