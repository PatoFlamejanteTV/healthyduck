-- Create data sources table (apps, devices, etc. that generate fitness data)
create table if not exists public.data_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data_stream_id text not null, -- unique identifier for the data stream
  data_stream_name text not null,
  type text not null, -- 'raw' or 'derived'
  data_type_name text not null, -- e.g., 'com.ultimatequack.step_count.delta'
  device_uid text,
  device_type text, -- 'phone', 'watch', 'scale', etc.
  device_manufacturer text,
  device_model text,
  device_version text,
  application_package_name text,
  application_version text,
  application_details_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, data_stream_id)
);

alter table public.data_sources enable row level security;

-- RLS policies for data_sources
create policy "data_sources_select_own"
  on public.data_sources for select
  using (auth.uid() = user_id);

create policy "data_sources_insert_own"
  on public.data_sources for insert
  with check (auth.uid() = user_id);

create policy "data_sources_update_own"
  on public.data_sources for update
  using (auth.uid() = user_id);

create policy "data_sources_delete_own"
  on public.data_sources for delete
  using (auth.uid() = user_id);

-- Create index for efficient queries
create index idx_data_sources_user_id on public.data_sources(user_id);
create index idx_data_sources_data_type on public.data_sources(data_type_name);
