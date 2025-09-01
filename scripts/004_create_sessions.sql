-- Create sessions table (workout/activity sessions)
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null, -- unique identifier for the session
  name text,
  description text,
  start_time_millis bigint not null, -- milliseconds since epoch
  end_time_millis bigint not null,
  modified_time_millis bigint not null,
  activity_type integer not null, -- activity type code
  application_package_name text,
  active_time_millis bigint, -- time actually active during session
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, session_id)
);

alter table public.sessions enable row level security;

-- RLS policies for sessions
create policy "sessions_select_own"
  on public.sessions for select
  using (auth.uid() = user_id);

create policy "sessions_insert_own"
  on public.sessions for insert
  with check (auth.uid() = user_id);

create policy "sessions_update_own"
  on public.sessions for update
  using (auth.uid() = user_id);

create policy "sessions_delete_own"
  on public.sessions for delete
  using (auth.uid() = user_id);

-- Create indexes for efficient queries
create index idx_sessions_user_id on public.sessions(user_id);
create index idx_sessions_time_range on public.sessions(user_id, start_time_millis, end_time_millis);
create index idx_sessions_activity_type on public.sessions(activity_type);
