import Link from "next/link";
export default function AccountDisabledPage() {
  return <main className="auth-bg"><section className="card max-w-md text-center"><h1 className="text-2xl font-black">Akun dinonaktifkan</h1><p className="mt-3 text-sm text-slate-500">Akun ini sementara tidak dapat mengakses Vantrex Class. Hubungi Owner untuk bantuan.</p><Link className="btn btn-primary mt-6" href="/login">Kembali ke login</Link></section></main>;
}
