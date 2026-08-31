-- BRGYWEBSAAS tenant defaults and isolated design configuration
-- Each Barangay gets its own design row. A new tenant starts from defaults.

create table if not exists public.barangay_design_settings (
  id uuid primary key default gen_random_uuid(),
  barangay_id uuid not null unique references public.barangays(id) on delete cascade,
  settings jsonb not null default jsonb_build_object(
    'theme','default',
    'primary','#1f4d3a',
    'accent','#d9a441',
    'navbar','classic',
    'footer','classic',
    'button','rounded',
    'logo_url',null,
    'sections',jsonb_build_object('hero',true,'about',true,'services',true,'announcements',true,'officials',true,'contact',true),
    'public_page',jsonb_build_object(),
    'admin_dashboard',jsonb_build_object(),
    'admin_login',jsonb_build_object()
  ),
  is_published boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Keep this migration compatible with a pre-existing table created by an earlier build.
alter table public.barangay_design_settings add column if not exists settings jsonb;
alter table public.barangay_design_settings add column if not exists is_published boolean not null default false;

update public.barangay_design_settings
set settings=jsonb_build_object(
  'theme','default','primary','#1f4d3a','accent','#d9a441','navbar','classic','footer','classic','button','rounded',
  'logo_url',null,
  'sections',jsonb_build_object('hero',true,'about',true,'services',true,'announcements',true,'officials',true,'contact',true),
  'public_page',jsonb_build_object(),'admin_dashboard',jsonb_build_object(),'admin_login',jsonb_build_object()
)
where settings is null;

alter table public.barangay_design_settings alter column settings set default jsonb_build_object(
  'theme','default','primary','#1f4d3a','accent','#d9a441','navbar','classic','footer','classic','button','rounded',
  'logo_url',null,
  'sections',jsonb_build_object('hero',true,'about',true,'services',true,'announcements',true,'officials',true,'contact',true),
  'public_page',jsonb_build_object(),'admin_dashboard',jsonb_build_object(),'admin_login',jsonb_build_object()
);
alter table public.barangay_design_settings alter column settings set not null;

alter table public.barangay_design_settings enable row level security;

DROP POLICY IF EXISTS "super admins manage barangay designs" ON public.barangay_design_settings;
create policy "super admins manage barangay designs"
on public.barangay_design_settings
for all
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'super_admin'));

DROP POLICY IF EXISTS "barangay admins manage own design" ON public.barangay_design_settings;
create policy "barangay admins manage own design"
on public.barangay_design_settings
for all
using (barangay_id = (select p.barangay_id from public.profiles p where p.id = auth.uid() and p.role = 'barangay_admin'))
with check (barangay_id = (select p.barangay_id from public.profiles p where p.id = auth.uid() and p.role = 'barangay_admin'));

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

-- Backfill existing tenants without overwriting custom settings.
insert into public.barangay_design_settings (barangay_id)
select b.id from public.barangays b
where not exists (select 1 from public.barangay_design_settings d where d.barangay_id = b.id)
on conflict (barangay_id) do nothing;
