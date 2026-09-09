-- FocusList database schema
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  description text default '',
  due_at timestamptz,
  category text not null default 'Work' check (category in ('Work','Study','Personal','Health')),
  completed boolean not null default false,
  reminder boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.tasks enable row level security;
create policy "Users manage own tasks" on public.tasks
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
