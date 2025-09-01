-- Create data sets table (collections of data points)
create table if not exists public.data_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data_source_id uuid not null references public.data_sources(id) on delete cascade,
  data_stream_id text not null,
  min_start_time_ns bigint not null, -- earliest data point start time
  max_end_time_ns bigint not null, -- latest data point end time
  next_page_token text, -- for pagination
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.data_sets enable row level security;

-- RLS policies for data_sets
create policy "data_sets_select_own"
  on public.data_sets for select
  using (auth.uid() = user_id);

create policy "data_sets_insert_own"
  on public.data_sets for insert
  with check (auth.uid() = user_id);

create policy "data_sets_update_own"
  on public.data_sets for update
  using (auth.uid() = user_id);

create policy "data_sets_delete_own"
  on public.data_sets for delete
  using (auth.uid() = user_id);

-- Create indexes for efficient queries
create index idx_data_sets_user_id on public.data_sets(user_id);
create index idx_data_sets_data_source_id on public.data_sets(data_source_id);
create index idx_data_sets_time_range on public.data_sets(user_id, min_start_time_ns, max_end_time_ns);
