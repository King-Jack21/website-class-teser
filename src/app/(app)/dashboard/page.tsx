import Link from "next/link";
import { BookOpen, ClipboardList, Users, ArrowRight, GraduationCap } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const profile = (await getCurrentProfile())!;
  const supabase = await createClient();

  let classCount = 0;
  let taskCount = 0;
  if (profile.role === "student") {
    const { count } = await supabase.from("class_members").select("*", { count: "exact", head: true }).eq("student_id", profile.id);
    classCount = count || 0;
    const { count: tasks } = await supabase.from("assignments").select("*", { count: "exact", head: true });
    taskCount = tasks || 0;
  } else {
    const { count } = await supabase.from("classes").select("*", { count: "exact", head: true }).eq("teacher_id", profile.id);
    classCount = count || 0;
    const { count: tasks } = await supabase.from("assignments").select("*", { count: "exact", head: true });
    taskCount = tasks || 0;
  }

  const roleLabel = profile.role === "owner" ? "Owner" : profile.role === "teacher" ? "Guru" : "Siswa";
  return <div className="space-y-7">
    <div><span className="pill">Dashboard {roleLabel}</span><h1 className="mt-3 text-3xl font-black tracking-tight">Selamat datang, {profile.full_name}!</h1><p className="mt-2 text-slate-500">Berikut ringkasan aktivitas pembelajaranmu.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <Stat icon={<BookOpen/>} label={profile.role === "student" ? "Kelas diikuti" : "Kelas dikelola"} value={classCount}/>
      <Stat icon={<ClipboardList/>} label="Tugas tersedia" value={taskCount}/>
      <Stat icon={<Users/>} label="Jenis akun" value={roleLabel}/>
    </div>
    <div className="grid gap-4 lg:grid-cols-[1.4fr_.8fr]">
      <section className="card"><div className="flex items-center justify-between"><h2 className="text-lg font-black">Mulai belajar</h2><BookOpen className="text-blue-600"/></div><p className="mt-2 text-sm leading-6 text-slate-500">{profile.role === "student" ? "Lihat kelas yang kamu ikuti dan temukan tugas terbaru." : "Kelola kelas, bagikan materi, dan pantau aktivitas siswa."}</p><Link className="btn btn-primary mt-5" href="/classes">Buka kelas <ArrowRight size={16}/></Link></section>
      <section className="card bg-blue-600 text-white !border-0"><GraduationCap size={28}/><h2 className="mt-4 text-lg font-black">Terus berkembang</h2><p className="mt-2 text-sm text-blue-100">Gunakan Vantrex Class untuk belajar lebih terarah setiap hari.</p></section>
    </div>
  </div>;
}
function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return <div className="card"><div className="flex items-center justify-between text-blue-600">{icon}<span className="text-xs text-slate-400">Ringkasan</span></div><p className="mt-5 text-3xl font-black">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></div>;
}
