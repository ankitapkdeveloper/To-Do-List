-- FocusList: SAFE setup / migration script
-- This can be run even if you previously created public.tasks.

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text default '',
  due_at timestamptz,
  category text not null default 'Work',
  completed boolean not null default false,
  reminder boolean not null default false,
  created_at timestamptz not null default now()
);

-- Add missing columns when an older tasks table already exists.
alter table public.tasks add column if not exists description text default '';
alter table public.tasks add column if not exists due_at timestamptz;
alter table public.tasks add column if not exists category text default 'Work';
alter table public.tasks add column if not exists completed boolean not null default false;
alter table public.tasks add column if not exists reminder boolean not null default false;
alter table public.tasks add column if not exists created_at timestamptz not null default now();

alter table public.tasks enable row level security;

drop policy if exists "Users manage own tasks" on public.tasks;
drop policy if exists "Users can manage own tasks" on public.tasks;

create policy "Users manage own tasks"
on public.tasks
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists tasks_user_id_created_at_idx
on public.tasks (user_id, created_at desc);
