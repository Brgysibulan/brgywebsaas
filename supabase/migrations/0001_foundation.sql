-- BRGYWEBSAAS foundation schema
-- Multi-tenant Barangay SaaS: the Super Admin creates and manages tenants.

create extension if not exists pgcrypto;

create type public.barangay_status as enum ('active', 'inactive');
create type public.user_role as enum ('super_admin', 'barangay_admin', 'editor', 'staff');

create table public.barangays (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  municipality text,
  province text,
  slug text not null unique,
  status public.barangay_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint barangays_name_not_blank check (length(trim(name)) > 0),
  constraint barangays_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.user_role not null default 'staff',
  barangay_id uuid references public.barangays(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profile_tenant_role_check check (
    (role = 'super_admin' and barangay_id is null)
    or
    (role <> 'super_admin' and barangay_id is not null)
  )
);

create index profiles_barangay_id_idx on public.profiles (barangay_id);
create index profiles_role_idx on public.profiles (role);
create index barangays_status_idx on public.barangays (status);

alter table public.barangays enable row level security;
alter table public.profiles enable row level security;

-- Super Admins can manage all tenants. Barangay users can only read their own tenant.
create policy "super admins manage barangays"
on public.barangays
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'super_admin'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'super_admin'
  )
);

create policy "barangay users read own barangay"
on public.barangays
for select
using (
  id = (
    select p.barangay_id from public.profiles p where p.id = auth.uid()
  )
);

create policy "users read own profile"
on public.profiles
for select
using (id = auth.uid());

create policy "super admins manage profiles"
on public.profiles
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'super_admin'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'super_admin'
  )
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger barangays_set_updated_at
before update on public.barangays
for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();
