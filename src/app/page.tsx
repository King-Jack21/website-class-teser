import Link from "next/link";
import { BookOpen, GraduationCap, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="container flex items-center justify-between py-6">
        <Link href="/" className="flex items-center gap-3 font-black text-xl tracking-tight">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white"><GraduationCap /></span>
          Vantrex <span className="text-blue-600">Class</span>
        </Link>
        <div className="flex gap-2">
          <Link className="btn btn-secondary" href="/login">Masuk</Link>
          <Link className="btn btn-primary" href="/register">Mulai belajar <ArrowRight size={16}/></Link>
        </div>
      </header>

      <section className="container grid items-center gap-12 py-16 md:grid-cols-[1.1fr_.9fr] md:py-24">
        <div>
          <span className="pill"><Sparkles size={13} className="mr-1"/> Ruang belajar digital</span>
          <h1 className="mt-5 text-5xl font-black leading-[1.08] tracking-tight md:text-6xl">
            Belajar lebih terarah. <span className="text-blue-600">Berkembang tanpa batas.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Satu tempat untuk kelas, materi, tugas, dan perkembangan belajar. Terhubung dengan guru dan teman sekelas secara lebih mudah.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="btn btn-primary">Buat akun gratis <ArrowRight size={17}/></Link>
            <Link href="/login" className="btn btn-secondary">Saya sudah punya akun</Link>
          </div>
          <p className="mt-5 text-xs text-slate-500">Untuk siswa, guru, dan pengelola pembelajaran.</p>
        </div>
        <div className="card relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 !border-0 !p-7 text-white">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10"/>
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-blue-100">VANTREX CLASS</span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs">Learning space</span>
            </div>
            <h2 className="mt-12 text-3xl font-black">Semua proses belajar, dalam satu ruang.</h2>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-4"><BookOpen/><p className="mt-3 font-bold">Materi kelas</p><p className="mt-1 text-xs text-blue-100">Terorganisir</p></div>
              <div className="rounded-2xl bg-white/10 p-4"><GraduationCap/><p className="mt-3 font-bold">Tugas & nilai</p><p className="mt-1 text-xs text-blue-100">Terpantau</p></div>
              <div className="col-span-2 rounded-2xl bg-white/10 p-4"><ShieldCheck/><p className="mt-2 font-bold">Akses sesuai peran</p><p className="mt-1 text-xs text-blue-100">Owner, Guru, dan Siswa</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="container grid gap-4 pb-20 md:grid-cols-3">
        {[
          ["Untuk siswa","Gabung kelas, pelajari materi, dan kumpulkan tugas."],
          ["Untuk guru","Atur kelas, bagikan materi, dan berikan penilaian."],
          ["Untuk owner","Kelola pengguna dan pantau ruang pembelajaran."]
        ].map(([title, desc]) => <div className="card" key={title}><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p></div>)}
      </section>
      <footer className="border-t border-slate-200 py-7 text-center text-xs text-slate-500">© {new Date().getFullYear()} Vantrex Class. Built for learning.</footer>
    </main>
  );
                                                                                                                                                                            }
