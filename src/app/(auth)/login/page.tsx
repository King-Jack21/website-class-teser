import Link from "next/link";
import { login } from "@/app/actions";

export default function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  return <main className="auth-bg">
    <section className="card w-full max-w-md">
      <Link href="/" className="text-xl font-black">Vantrex <span className="text-blue-600">Class</span></Link>
      <h1 className="mt-7 text-2xl font-black">Selamat datang kembali</h1>
      <p className="mt-2 text-sm text-slate-500">Masuk untuk melanjutkan pembelajaran.</p>
      <form action={login} className="mt-7 space-y-4">
        <div><label className="label">Email</label><input className="field" type="email" name="email" required autoComplete="email" placeholder="nama@email.com"/></div>
        <div><label className="label">Password</label><input className="field" type="password" name="password" required autoComplete="current-password" placeholder="Masukkan password"/></div>
        <button className="btn btn-primary w-full" type="submit">Masuk</button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-500">Belum punya akun? <Link className="font-bold text-blue-600" href="/register">Daftar sekarang</Link></p>
      <AuthNotice searchParams={searchParams}/>
    </section>
  </main>;
}

async function AuthNotice({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;
  if (!params.error && !params.message) return null;
  return <p className={`mt-4 rounded-xl p-3 text-sm ${params.error ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{params.error || params.message}</p>;
}
