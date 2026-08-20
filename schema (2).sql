-- P80 V2 — baza prywatnych raportów i zdjęć.
-- Uruchom cały plik w Supabase: SQL Editor → New query → Run.

create extension if not exists pgcrypto;

create table if not exists public.daily_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  report_date date not null,
  data jsonb not null default '{}'::jsonb,
  total_calories numeric(8,2) not null default 0,
  keto boolean,
  verdict text check (verdict in ('DOWIEZIONE', 'NIEDOWIEZIONE') or verdict is null),
  ai_evaluation jsonb,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, report_date)
);

alter table public.daily_reports enable row level security;

revoke all on table public.daily_reports from anon;
grant select, insert, update, delete on table public.daily_reports to authenticated;

drop policy if exists "reports_select_own" on public.daily_reports;
create policy "reports_select_own"
  on public.daily_reports for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "reports_insert_own" on public.daily_reports;
create policy "reports_insert_own"
  on public.daily_reports for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "reports_update_own" on public.daily_reports;
create policy "reports_update_own"
  on public.daily_reports for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "reports_delete_own" on public.daily_reports;
create policy "reports_delete_own"
  on public.daily_reports for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists daily_reports_set_updated_at on public.daily_reports;
create trigger daily_reports_set_updated_at
before update on public.daily_reports
for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'report-photos',
  'report-photos',
  false,
  12582912,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "photos_select_own" on storage.objects;
create policy "photos_select_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'report-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "photos_insert_own" on storage.objects;
create policy "photos_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'report-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "photos_update_own" on storage.objects;
create policy "photos_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'report-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'report-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "photos_delete_own" on storage.objects;
create policy "photos_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'report-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create index if not exists daily_reports_user_date_idx
  on public.daily_reports (user_id, report_date desc);
