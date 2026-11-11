export type Role = "owner" | "teacher" | "student";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  created_at: string;
};

export type ClassRecord = {
  id: string;
  name: string;
  description: string | null;
  class_code: string;
  teacher_id: string;
  created_at: string;
};

export type Assignment = {
  id: string;
  class_id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  max_score: number;
  created_at: string;
};
