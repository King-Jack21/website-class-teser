
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth";
import type { Role } from "@/types/database";

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

// LOGIN + DETEKSI OWNER
export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = value(formData, "email").toLowerCase();
  const password = value(formData, "password");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    redirect(
      `/login?error=${encodeURIComponent(
        error?.message || "Login gagal"
      )}`
    );
  }

  // Ambil email Owner dari Environment Variables
  const ownerEmail = (process.env.OWNER_EMAIL || "")
    .trim()
    .toLowerCase();

  // Promosikan akun yang cocok menjadi Owner
  if (
    ownerEmail &&
    data.user.email?.toLowerCase() === ownerEmail &&
    data.user.email_confirmed_at
  ) {
    const admin = createAdminClient();

    const { error: ownerError } = await admin
      .from("profiles")
      .update({ role: "owner" })
      .eq("id", data.user.id);

    if (ownerError) {
      await supabase.auth.signOut();

      redirect(
        `/login?error=${encodeURIComponent(
          "Gagal mengaktifkan akun Owner: " + ownerError.message
        )}`
      );
    }
  }

  redirect("/dashboard");
}

// REGISTER
export async function register(formData: FormData) {
  const supabase = await createClient();

  const full_name = value(formData, "full_name");
  const email = value(formData, "email").toLowerCase();
  const password = value(formData, "password");

  if (password.length < 8) {
    redirect(
      "/register?error=Password%20minimal%208%20karakter"
    );
  }

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name },
    },
  });

  if (error) {
    redirect(
      `/register?error=${encodeURIComponent(error.message)}`
    );
  }

  // Semua pendaftaran baru tetap dimulai sebagai Siswa.
  // Role Owner diberikan saat login melalui pemeriksaan server.
  if (data.session) {
    redirect("/dashboard");
  }

  redirect(
    "/login?message=Periksa%20email%20untuk%20verifikasi%20akun%2C%20lalu%20login."
  );
}

// LOGOUT
export async function logout() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/login");
}

// GANTI ROLE PENGGUNA (OWNER SAJA)
export async function changeUserRole(formData: FormData) {
  await requireRole(["owner"]);

  const userId = value(formData, "user_id");
  const role = value(formData, "role") as Role;

  if (!userId || !["teacher", "student"].includes(role)) {
    redirect("/owner/users?error=Permintaan%20tidak%20valid");
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) {
    redirect(
      `/owner/users?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath("/owner/users");

  redirect("/owner/users?message=Role%20berhasil%20diperbarui");
}

// BUAT KELAS
export async function createClass(formData: FormData) {
  const profile = await requireRole(["teacher", "owner"]);
  const supabase = await createClient();

  const name = value(formData, "name");
  const description = value(formData, "description");

  if (name.length < 3) {
    redirect(
      "/teacher/classes/new?error=Nama%20kelas%20minimal%203%20karakter"
    );
  }

  const { error } = await supabase.from("classes").insert({
    name,
    description: description || null,
    teacher_id: profile.id,
  });

  if (error) {
    redirect(
      `/teacher/classes/new?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath("/classes");
  redirect("/classes");
}

// BERGABUNG KE KELAS
export async function joinClass(formData: FormData) {
  const profile = await requireRole(["student"]);
  const supabase = await createClient();

  const classCode = value(formData, "class_code").toUpperCase();

  const { data: classroom, error: findError } = await supabase
    .from("classes")
    .select("id")
    .eq("class_code", classCode)
    .maybeSingle();

  if (findError || !classroom) {
    redirect("/classes?error=Kode%20kelas%20tidak%20ditemukan");
  }

  const { error } = await supabase.from("class_members").insert({
    class_id: classroom.id,
    student_id: profile.id,
  });

  if (error) {
    redirect(
      `/classes?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath("/classes");

  redirect("/classes?message=Berhasil%20bergabung%20ke%20kelas");
}

// BUAT TUGAS
export async function createAssignment(formData: FormData) {
  const profile = await requireRole(["teacher", "owner"]);
  const supabase = await createClient();

  const class_id = value(formData, "class_id");
  const title = value(formData, "title");
  const description = value(formData, "description");
  const deadlineRaw = value(formData, "deadline");
  const max_score = Number(value(formData, "max_score") || 100);

  const { error } = await supabase.from("assignments").insert({
    class_id,
    title,
    description: description || null,
    deadline: deadlineRaw || null,
    max_score,
    created_by: profile.id,
  });

  if (error) {
    redirect(
      `/teacher/assignments/new?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath("/teacher/assignments");

  redirect("/teacher/assignments?message=Tugas%20berhasil%20dibuat");
}

// KIRIM JAWABAN TUGAS
export async function submitAssignment(formData: FormData) {
  const profile = await requireRole(["student"]);
  const supabase = await createClient();

  const assignment_id = value(formData, "assignment_id");
  const answer_text = value(formData, "answer_text");

  if (!answer_text) {
    redirect("/assignments?error=Jawaban%20tidak%20boleh%20kosong");
  }

  const { error } = await supabase.from("submissions").upsert(
    {
      assignment_id,
      student_id: profile.id,
      answer_text,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    },
    {
      onConflict: "assignment_id,student_id",
    }
  );

  if (error) {
    redirect(
      `/assignments?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath("/assignments");

  redirect("/assignments?message=Jawaban%20berhasil%20dikirim");
}
