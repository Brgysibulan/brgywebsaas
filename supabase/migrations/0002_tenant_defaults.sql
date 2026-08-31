-- BRGYWEBSAAS tenant defaults and safe lifecycle helpers
-- A new Barangay gets isolated default configuration; deleting a tenant
-- removes tenant-scoped configuration while protecting other tenants.

create table if not exists public.barangay_design_settings (
  id uuid primary key default gen_random_uuid(),
  barangay_id uuid not null unique references public.barangays(id) on delete cascade,
  public_page jsonb not null default '{}'::jsonb,
  admin_dashboard jsonb not null default '{}'::jsonb,
  admin_login jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.barangay_design_settings enable row level security;

create policy "super admins manage barangay designs"
on public.barangay_design_settings
for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'));

create policy "barangay admins manage own design"
on public.barangay_design_settings
for all
using (barangay_id = (select p.barangay_id from public.profiles p where p.id = auth.uid()))
with check (barangay_id = (select p.barangay_id from public.profiles p where p.id = auth.uid()));

create or replace function public.create_default_barangay_design()
returns trigger
language plpgsql
security invoker
as $$
begin
  insert into public.barangay_design_settings (barangay_id)
  values (new.id)
  on conflict (barangay_id) do nothing;
  return new;
end;
$$;

drop trigger if exists barangays_create_default_design on public.barangays;
create trigger barangays_create_default_design
after insert on public.barangays
for each row execute function public.create_default_barangay_design();

create or replace function public.set_design_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists barangay_design_settings_set_updated_at on public.barangay_design_settings;
create trigger barangay_design_settings_set_updated_at
before update on public.barangay_design_settings
for each row execute function public.set_design_updated_at();

-- Backfill a default row for existing Barangays without changing custom data.
insert into public.barangay_design_settings (barangay_id)
select b.id from public.barangays b
where not exists (select 1 from public.barangay_design_settings d where d.barangay_id = b.id)
on conflict (barangay_id) do nothing;
