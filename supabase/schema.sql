-- VANTREX CLASS DATABASE SCHEMA
-- Jalankan seluruh file ini di Supabase SQL Editor.

create extension if not exists pgcrypto;

do $$ begin
  create type public.app_role as enum ('owner', 'teacher', 'student');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null default 'Pengguna',
  role public.app_role not null default 'student',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  class_code text not null unique,
  teacher_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.class_members (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique(class_id, student_id)
);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  title text not null,
  content text,
  file_path text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  title text not null,
  description text,
  deadline timestamptz,
  max_score integer not null default 100 check (max_score > 0 and max_score <= 1000),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  answer_text text,
  file_path text,
  status text not null default 'submitted' check (status in ('submitted', 'graded', 'returned')),
  score integer,
  feedback text,
  submitted_at timestamptz not null default now(),
  unique(assignment_id, student_id),
  check (score is null or score >= 0)
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references public.classes(id) on delete cascade,
  title text not null,
  body text not null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  title text not null,
  description text,
  duration_minutes integer not null default 30 check (duration_minutes > 0),
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question_text text not null,
  options jsonb not null default '[]'::jsonb,
  correct_answer text,
  points integer not null default 1 check (points > 0),
  sort_order integer not null default 0
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  score numeric,
  unique(quiz_id, student_id)
);

create table if not exists public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  answer text,
  unique(attempt_id, question_id)
);

-- Generate a unique class code.
create or replace function public.generate_class_code()
returns text language plpgsql as $$
declare
  new_code text;
begin
  loop
    new_code := upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8));
    exit when not exists (select 1 from public.classes where class_code = new_code);
  end loop;
  return new_code;
end;
$$;

alter table public.classes alter column class_code set default public.generate_class_code();

-- New public signups always become students. Metadata role is intentionally ignored.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    lower(coalesce(new.email, '')),
    coalesce(new.raw_user_meta_data ->> 'full_name', 'Pengguna'),
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.current_role()
returns public.app_role
language sql stable security definer set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid()) and is_active = true
$$;

create or replace function public.is_owner()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(public.current_role() = 'owner'::public.app_role, false)
$$;

create or replace function public.teaches_class(target_class uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.classes
    where id = target_class and teacher_id = (select auth.uid())
  )
$$;

create or replace function public.is_class_member(target_class uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.class_members
    where class_id = target_class and student_id = (select auth.uid())
  )
$$;

alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.materials enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.announcements enable row level security;
alter table public.notifications enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_answers enable row level security;

-- Profiles: users can read their own profile; owners can read all.
drop policy if exists "profiles_read_self_or_owner" on public.profiles;
create policy "profiles_read_self_or_owner" on public.profiles
for select to authenticated using (id = (select auth.uid()) or public.is_owner());

-- Intentionally no authenticated UPDATE policy on profiles.
-- Profile/role changes are performed only by trusted server-side code.
drop policy if exists "profiles_update_self_safe" on public.profiles;

-- Classes
drop policy if exists "classes_read_authorized" on public.classes;
create policy "classes_read_authorized" on public.classes
for select to authenticated using (
  public.is_owner() or teacher_id = (select auth.uid()) or public.is_class_member(id)
);
drop policy if exists "classes_teacher_insert" on public.classes;
create policy "classes_teacher_insert" on public.classes
for insert to authenticated with check (
  (select public.current_role()) in ('teacher', 'owner') and teacher_id = (select auth.uid())
);
drop policy if exists "classes_teacher_update" on public.classes;
create policy "classes_teacher_update" on public.classes
for update to authenticated using (public.is_owner() or teacher_id = (select auth.uid()))
with check (public.is_owner() or teacher_id = (select auth.uid()));
drop policy if exists "classes_owner_delete" on public.classes;
create policy "classes_owner_delete" on public.classes
for delete to authenticated using (public.is_owner());

-- Memberships
drop policy if exists "members_read_authorized" on public.class_members;
create policy "members_read_authorized" on public.class_members
for select to authenticated using (
  student_id = (select auth.uid()) or public.teaches_class(class_id) or public.is_owner()
);
drop policy if exists "student_join_class" on public.class_members;
create policy "student_join_class" on public.class_members
for insert to authenticated with check (
  student_id = (select auth.uid()) and (select public.current_role()) = 'student'
);
drop policy if exists "member_leave_or_owner_delete" on public.class_members;
create policy "member_leave_or_owner_delete" on public.class_members
for delete to authenticated using (student_id = (select auth.uid()) or public.is_owner());

-- Materials
drop policy if exists "materials_read" on public.materials;
create policy "materials_read" on public.materials
for select to authenticated using (public.is_owner() or public.teaches_class(class_id) or public.is_class_member(class_id));
drop policy if exists "materials_teacher_manage" on public.materials;
create policy "materials_teacher_manage" on public.materials
for all to authenticated using (public.is_owner() or public.teaches_class(class_id))
with check ((public.is_owner() or public.teaches_class(class_id)) and created_by = (select auth.uid()));

-- Assignments
drop policy if exists "assignments_read" on public.assignments;
create policy "assignments_read" on public.assignments
for select to authenticated using (public.is_owner() or public.teaches_class(class_id) or public.is_class_member(class_id));
drop policy if exists "assignments_teacher_manage" on public.assignments;
create policy "assignments_teacher_manage" on public.assignments
for all to authenticated using (public.is_owner() or public.teaches_class(class_id))
with check ((public.is_owner() or public.teaches_class(class_id)) and created_by = (select auth.uid()));

-- Submissions
drop policy if exists "submissions_read" on public.submissions;
create policy "submissions_read" on public.submissions
for select to authenticated using (
  student_id = (select auth.uid()) or public.is_owner() or exists (
    select 1 from public.assignments a where a.id = assignment_id and public.teaches_class(a.class_id)
  )
);
drop policy if exists "student_submit_own" on public.submissions;
create policy "student_submit_own" on public.submissions
for insert to authenticated with check (
  student_id = (select auth.uid()) and (select public.current_role()) = 'student'
  and exists (select 1 from public.assignments a where a.id = assignment_id and public.is_class_member(a.class_id))
);
drop policy if exists "student_update_own_submission" on public.submissions;
create policy "student_update_own_submission" on public.submissions
for update to authenticated using (student_id = (select auth.uid()))
with check (student_id = (select auth.uid()) and score is null and feedback is null);
drop policy if exists "teacher_grade_submission" on public.submissions;
create policy "teacher_grade_submission" on public.submissions
for update to authenticated using (
  public.is_owner() or exists (
    select 1 from public.assignments a where a.id = assignment_id and public.teaches_class(a.class_id)
  )
)
with check (
  public.is_owner() or exists (
    select 1 from public.assignments a where a.id = assignment_id and public.teaches_class(a.class_id)
  )
);

-- Announcements
drop policy if exists "announcements_read" on public.announcements;
create policy "announcements_read" on public.announcements
for select to authenticated using (
  public.is_owner() or class_id is null or public.teaches_class(class_id) or public.is_class_member(class_id)
);
drop policy if exists "announcements_teacher_insert" on public.announcements;
create policy "announcements_teacher_insert" on public.announcements
for insert to authenticated with check (
  created_by = (select auth.uid()) and (public.is_owner() or public.teaches_class(class_id))
);

-- Notifications
drop policy if exists "notifications_own" on public.notifications;
create policy "notifications_own" on public.notifications
for all to authenticated using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- Quizzes and questions: teachers manage, class members read quiz/questions.
drop policy if exists "quizzes_read" on public.quizzes;
create policy "quizzes_read" on public.quizzes
for select to authenticated using (public.is_owner() or public.teaches_class(class_id) or public.is_class_member(class_id));
drop policy if exists "quizzes_teacher_manage" on public.quizzes;
create policy "quizzes_teacher_manage" on public.quizzes
for all to authenticated using (public.is_owner() or public.teaches_class(class_id))
with check ((public.is_owner() or public.teaches_class(class_id)) and created_by = (select auth.uid()));

drop policy if exists "quiz_questions_read" on public.quiz_questions;
create policy "quiz_questions_read" on public.quiz_questions
for select to authenticated using (exists (
  select 1 from public.quizzes q where q.id = quiz_id and
  (public.is_owner() or public.teaches_class(q.class_id) or public.is_class_member(q.class_id))
));
drop policy if exists "quiz_questions_teacher_manage" on public.quiz_questions;
create policy "quiz_questions_teacher_manage" on public.quiz_questions
for all to authenticated using (exists (
  select 1 from public.quizzes q where q.id = quiz_id and (public.is_owner() or public.teaches_class(q.class_id))
))
with check (exists (
  select 1 from public.quizzes q where q.id = quiz_id and (public.is_owner() or public.teaches_class(q.class_id))
));

-- Quiz attempts/answers: student owns attempt; teacher/owner can inspect.
drop policy if exists "quiz_attempts_read" on public.quiz_attempts;
create policy "quiz_attempts_read" on public.quiz_attempts
for select to authenticated using (
  student_id = (select auth.uid()) or public.is_owner() or exists (
    select 1 from public.quizzes q where q.id = quiz_id and public.teaches_class(q.class_id)
  )
);
drop policy if exists "quiz_attempts_student_insert" on public.quiz_attempts;
create policy "quiz_attempts_student_insert" on public.quiz_attempts
for insert to authenticated with check (student_id = (select auth.uid()) and (select public.current_role()) = 'student');
drop policy if exists "quiz_answers_read" on public.quiz_answers;
create policy "quiz_answers_read" on public.quiz_answers
for select to authenticated using (exists (
  select 1 from public.quiz_attempts a where a.id = attempt_id and
  (a.student_id = (select auth.uid()) or public.is_owner() or exists (
    select 1 from public.quizzes q where q.id = a.quiz_id and public.teaches_class(q.class_id)
  ))
));
drop policy if exists "quiz_answers_student_write" on public.quiz_answers;
create policy "quiz_answers_student_write" on public.quiz_answers
for all to authenticated using (exists (
  select 1 from public.quiz_attempts a where a.id = attempt_id and a.student_id = (select auth.uid())
))
with check (exists (
  select 1 from public.quiz_attempts a where a.id = attempt_id and a.student_id = (select auth.uid())
));

-- Storage bucket for learning files. Create private bucket and policies.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('class-files', 'class-files', false, 20971520,
  array['application/pdf','image/jpeg','image/png','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.presentationml.presentation'])
on conflict (id) do nothing;

drop policy if exists "class_files_authenticated_read" on storage.objects;
create policy "class_files_authenticated_read" on storage.objects
for select to authenticated using (bucket_id = 'class-files');

drop policy if exists "class_files_authenticated_upload" on storage.objects;
create policy "class_files_authenticated_upload" on storage.objects
for insert to authenticated with check (bucket_id = 'class-files');
