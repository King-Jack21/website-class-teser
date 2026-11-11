import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { changeUserRole } from "@/app/actions";

export default async function OwnerUsersPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  await requireRole(["owner"]);
  const admin = createAdminClient();
  const { data: users, error } = await admin.from("profiles").select("id,email,full_name,role,is_active,created_at").order("created_at", { ascending: false });
  const params = await searchParams;

  return <div className="space-y-6">
    <div><span className="pill">Area Owner</span><h1 className="mt-3 text-3xl font-black">Kelola Pengguna</h1><p className="mt-2 text-sm text-slate-500">Atur akun Guru dan Siswa Vantrex Class.</p></div>
    {params.error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{params.error}</p>}
    {params.message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{params.message}</p>}
    {error && <p className="text-sm text-rose-600">Gagal memuat pengguna: {error.message}</p>}
    <div className="card overflow-x-auto !p-0">
      <table className="w-full min-w-[650px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-4">Pengguna</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4">Ubah role</th></tr></thead>
        <tbody>{(users || []).map((user) => <tr key={user.id} className="border-t border-slate-100">
          <td className="p-4"><p className="font-bold">{user.full_name}</p><p className="text-xs text-slate-500">{user.email}</p></td>
          <td className="p-4"><span className="pill">{user.role}</span></td>
          <td className="p-4">{user.is_active ? "Aktif" : "Nonaktif"}</td>
          <td className="p-4">{user.role === "owner" ? <span className="text-xs text-slate-400">Dilindungi</span> : <form action={changeUserRole} className="flex items-center gap-2"><input type="hidden" name="user_id" value={user.id}/><select className="field max-w-32" name="role" defaultValue={user.role}><option value="student">Siswa</option><option value="teacher">Guru</option></select><button className="btn btn-secondary">Simpan</button></form>}</td>
        </tr>)}</tbody>
      </table>
      {!users?.length && <p className="p-6 text-sm text-slate-500">Belum ada pengguna.</p>}
    </div>
  </div>;
}
