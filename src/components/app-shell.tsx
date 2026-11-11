import Link from "next/link";
import { BookOpen, LayoutDashboard, Users, ClipboardList, GraduationCap, Settings, LogOut, ShieldCheck } from "lucide-react";
import { logout } from "@/app/actions";
import type { Profile } from "@/types/database";

export function AppShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/classes", label: "Kelas Saya", icon: BookOpen },
    { href: "/assignments", label: "Tugas", icon: ClipboardList },
    ...(profile.role === "teacher" || profile.role === "owner" ? [{ href: "/teacher/classes/new", label: "Buat Kelas", icon: GraduationCap }] : []),
    ...(profile.role === "teacher" || profile.role === "owner" ? [{ href: "/teacher/assignments/new", label: "Buat Tugas", icon: ClipboardList }] : []),
    ...(profile.role === "owner" ? [{ href: "/owner/users", label: "Kelola Pengguna", icon: Users }] : []),
    { href: "/settings", label: "Pengaturan", icon: Settings }
  ];

  return <div className="app-shell min-h-screen md:flex">
    <aside className="app-sidebar flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-5">
      <Link href="/dashboard" className="mb-8 flex items-center gap-3 text-lg font-black">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white"><GraduationCap/></span>
        <span>Vantrex <span className="text-blue-600">Class</span></span>
      </Link>
      <p className="mb-3 text-[10px] font-black uppercase tracking-[.18em] text-slate-400">Menu utama</p>
      <nav className="app-nav flex flex-1 flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="sidebar-link"><Icon size={17}/>{label}</Link>)}
      </nav>
      <div className="mt-7 rounded-2xl bg-blue-50 p-3">
        <div className="flex items-center gap-2"><ShieldCheck size={17} className="text-blue-600"/><span className="text-xs font-bold text-blue-900">{profile.role.toUpperCase()}</span></div>
        <p className="mt-2 truncate text-xs text-slate-600">{profile.email}</p>
      </div>
      <form action={logout} className="mt-3"><button className="sidebar-link w-full" type="submit"><LogOut size={17}/>Keluar</button></form>
    </aside>
    <main className="min-w-0 flex-1">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 md:px-9">
        <div><p className="text-xs text-slate-500">Ruang belajar digital</p><p className="font-bold">Halo, {profile.full_name || "Pengguna"} 👋</p></div>
        <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-sm font-black text-blue-700">{(profile.full_name || "VC").slice(0,1).toUpperCase()}</div>
      </header>
      <div className="mx-auto max-w-6xl p-5 md:p-9">{children}</div>
    </main>
  </div>;
}
