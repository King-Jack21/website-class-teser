import { AppShell } from "@/components/app-shell";
import { getCurrentProfile } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.is_active) redirect("/account-disabled");
  return <AppShell profile={profile}>{children}</AppShell>;
}
