# BRGYWEBSAAS Errors & Fix Log

Document significant errors, root causes, fixes, and validation results here.

## Resolved Errors

### Error #001 — Static app configuration blocked loading
- Date: 2026-08-31
- Module: Static frontend / Supabase configuration
- Error: Frontend remained on a loading/configuration state.
- Cause: The static app expected `js/config.js`, which was missing.
- Fix: Added the Supabase publishable configuration for the static frontend.
- Validation: Static pages loaded and connected to Supabase.
- Status: RESOLVED

### Error #002 — Super Admin profile verification failed after valid login
- Date: 2026-08-31
- Module: Authentication / profiles
- Error: `Unable to verify your profile.` after valid Super Admin sign-in.
- Cause: Authenticated users could not read the required profile row through the browser-side Supabase request.
- Fix: Corrected the profile read permissions/policy needed by the authenticated flow.
- Validation: Super Admin login reached the Super Admin dashboard.
- Status: RESOLVED

### Error #003 — Next.js files conflicted with the actual deployment architecture
- Date: 2026-08-31
- Module: Repository structure
- Error: Repository contained an unused Next.js application structure while the deployed target was static GitHub Pages.
- Cause: Earlier scaffold files were not removed when the project architecture changed.
- Fix: Removed the obsolete Next.js application/tooling files and kept the static HTML/CSS/JS + Supabase architecture.
- Validation: `main` contains the static application entry pages and no `app/` directory.
- Status: RESOLVED

### Error #004 — Barangay Admin dashboard was too close to the Super Admin dashboard
- Date: 2026-08-31
- Module: Barangay Admin UI
- Error: Barangay Admin view did not clearly communicate its tenant-scoped purpose.
- Cause: The dashboard foundation was initially too generic.
- Fix: Separated the Barangay Admin dashboard content and labeling from the system-wide Super Admin dashboard.
- Validation: `admin.html` is a dedicated Barangay Admin dashboard and `superadmin.html` remains system-wide.
- Status: RESOLVED

### Error #005 — Super Admin login entry was routed ambiguously from Barangay Admin
- Date: 2026-08-31
- Module: Login routing
- Error: Barangay login flow was being confused with the Super Admin login flow.
- Cause: The same generic login context was being used without a clear role distinction.
- Fix: Added a dedicated Super Admin login page and explicit `Super Admin Sign in` entry from the Barangay Admin page. Super Admin role is detected before tenant-specific checks.
- Validation: A valid `super_admin` session is routed to `superadmin.html`; Barangay Admin accounts remain tenant-scoped.
- Status: RESOLVED

## Current Rule
The authoritative architecture is static HTML/CSS/JavaScript + Bootstrap 5/custom CSS + Supabase + GitHub Pages. Do not reintroduce Next.js, Node.js, Railway, or another runtime unless the project owner explicitly changes the architecture.

## Format for Future Entries

### Error #NNN
- Date:
- Module:
- Error:
- Cause:
- Fix:
- Validation:
- Status: OPEN / RESOLVED
