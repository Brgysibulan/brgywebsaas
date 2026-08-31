# BRGYWEBSAAS

Multi-tenant Barangay Website and Digital Services Platform.

## Current architecture
- Static HTML/CSS/JavaScript frontend
- Bootstrap 5 + custom CSS variables + Design Studio/theme engine
- GitHub Pages deployment
- Supabase Auth, PostgreSQL, REST API, and Row Level Security
- No Next.js runtime
- No Railway dependency
- Current target architecture is usable without paid hosting

## Roles and dashboards
- **Super Admin:** system-wide dashboard, barangay management, system settings, and system-level Design Studio. Design customization is accessed from inside the authenticated Super Admin dashboard/settings area.
- **Barangay Admin:** dedicated dashboard for the admin's assigned barangay only. The dashboard must show only that barangay's data and modules.
- **Barangay users/staff:** future role-scoped access to approved modules.

Tenant isolation must be enforced in Supabase using `barangay_id` and Row Level Security. Frontend filtering is never the security boundary.

## Design direction
The Design Studio is an **authenticated admin feature**, not a public landing-page control. Super Admin controls system-level appearance. Future Barangay Admin controls will be limited to branding/customization permissions assigned to their barangay.

The Design Studio roadmap includes presets, custom colors, typography, navigation, header/footer, cards, buttons, tables, inputs, layout, spacing, density, radius, shadows, live preview, save/duplicate/reset, and import/export. Barangay-specific branding will be supported after the tenant/role model is finalized.

## Development tracking
See **GitHub Issue #1 — Project Roadmap, Fix Log & Next Targets** as the source of truth for completed work, errors, fixes, decisions, verification items, and roadmap phases.

## Roadmap summary
1. Foundation + live authentication verification
2. Super Admin dashboard
3. Full Design Studio
4. Barangay Admin dashboard scoped to assigned barangay
5. Residents, households, officials, documents, requests, announcements, reports
6. Security/RLS, audit trail, accessibility, mobile/tablet QA
