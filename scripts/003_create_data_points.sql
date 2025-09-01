-- Create data points table (individual fitness measurements)
create table if not exists public.data_points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data_source_id uuid not null references public.data_sources(id) on delete cascade,
  data_type_name text not null,
  start_time_nanos bigint not null, -- nanoseconds since epoch
  end_time_nanos bigint not null,
  modified_time_nanos bigint not null,
  origin_data_source_id uuid references public.data_sources(id),
  -- Value fields (only one should be populated based on data type)
  int_val bigint,
  fp_val double precision,
  string_val text,
  map_val jsonb, -- for complex values
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.data_points enable row level security;

-- RLS policies for data_points
create policy "data_points_select_own"
  on public.data_points for select
  using (auth.uid() = user_id);

create policy "data_points_insert_own"
  on public.data_points for insert
  with check (auth.uid() = user_id);

create policy "data_points_update_own"
  on public.data_points for update
  using (auth.uid() = user_id);

create policy "data_points_delete_own"
  on public.data_points for delete
  using (auth.uid() = user_id);

-- Create indexes for efficient time-based queries
create index idx_data_points_user_id on public.data_points(user_id);
create index idx_data_points_data_source_id on public.data_points(data_source_id);
create index idx_data_points_time_range on public.data_points(user_id, start_time_nanos, end_time_nanos);
create index idx_data_points_data_type on public.data_points(data_type_name);
