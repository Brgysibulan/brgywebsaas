# BRGYWEBSAAS Architecture Foundation

## Core model

BRGYWEBSAAS is a multi-tenant platform. A **Barangay is a tenant** and is created dynamically by the Super Admin. Barangay names are never hard-coded into application logic.

```text
Super Admin
    |
    +-- Barangay Management
          |
          +-- Add Barangay
          +-- Edit Barangay
          +-- Activate / Disable
          |
          +-- Barangay tenant
                |
                +-- Barangay Admin
                +-- Editor
                +-- Staff
                +-- Barangay-owned data
```

## Tenant isolation

Every future barangay-owned table must contain a `barangay_id` foreign key. Authorization must resolve the authenticated user's profile before accessing tenant data. PostgreSQL Row Level Security (RLS) is the final database enforcement layer.

## Roles

- `super_admin`: platform-wide management; no tenant assignment.
- `barangay_admin`: full management within one assigned barangay.
- `editor`: content management within one assigned barangay.
- `staff`: operational access within one assigned barangay.

## Foundation tables

### `barangays`

Stores tenant identity and lifecycle state. Required identity fields are `name` and a unique URL-safe `slug`; municipality and province are optional foundation metadata.

### `profiles`

Maps a Supabase Auth user to a role and, for non-Super-Admin users, exactly one barangay tenant.

## Security invariants

1. A Super Admin has `barangay_id = NULL`.
2. Every non-Super-Admin profile has a non-null `barangay_id`.
3. A tenant user can only access records belonging to their assigned `barangay_id`.
4. Client-side filtering is never treated as security.
5. RLS policies must enforce tenant boundaries at the database layer.
6. Service-role credentials must never be exposed to browser code.
