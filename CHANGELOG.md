# BRGYWEBSAAS Changelog

All meaningful project changes are recorded here.

## 2026-08-31 — Verified working baseline
- Super Admin Login is separate from the Super Admin Dashboard.
- Barangay Admin Login is separate from the Barangay Admin Dashboard and shows the assigned Barangay.
- Barangay Admin access is scoped by `barangay_id`.
- Super Admin Barangay Directory supports add/edit/activate/deactivate/delete and Barangay-specific Admin Login / Public View actions.
- Barangay Admin approval UI supports pending/approved states with Approve / Reject actions.
- Live Supabase project is `brgywebsaas` and is currently `ACTIVE_HEALTHY`.
- Live lifecycle test passed: temporary Barangay created, default design settings automatically created, temporary Barangay deleted, and its design settings cleaned up. The production SIBULAN tenant remained intact.
- Default tenant design behavior is now recorded as a baseline: new Barangays must start with isolated default settings and must not inherit another Barangay's customization.

## 2026-08-31 — Admin verification and storage rules
- Each Barangay supports a maximum of 2 pending/approved Barangay Admin slots.
- When a Barangay reaches 2 slots, new admin applications must show `FULL / UNAVAILABLE` and the application form must not be submittable.
- Admin applications collect designation, mobile number, and application reason for Super Admin review.
- Verification signup requires exactly 1 Valid ID image and 1 selfie image.
- Verification files accept images only (JPG, PNG, or WebP) and have a hard maximum of 1 MB per file.
- Signup compresses/resizes images locally before upload and rejects unreadable/unsupported/oversized results.
- Verification files are stored in the private `admin-verification` Supabase Storage bucket under the applicant user ID.
- Storage RLS limits applicants to their own verification folder.
- Database stores verification file paths/references rather than image binaries.
- Storage efficiency must never compromise system stability or verification-image readability.

## 2026-08-31 — Design change isolation rule
- UI/design work must be isolated from business logic and data-layer behavior.
- Design-only changes must not modify Supabase queries, CRUD operations, authentication/authorization, admin-slot rules, approval logic, storage rules, or existing event handlers unless the user explicitly requests a functional change.
- Existing verified functionality is treated as a protected baseline before visual changes are committed.
- Before declaring a design change complete, verify that existing navigation handlers, CRUD actions, authentication, admin management, and Supabase data operations remain intact.
- Prefer dedicated CSS/theme/configuration layers for visual changes instead of rewriting working application logic.
- Do not hide broken/nonfunctional features with CSS or JavaScript and call them fixed; remove them from navigation or implement their real function first.

## Known / next work
- Barangay Admin Design Studio currently exists but its saved settings are not yet fully applied to the actual public page, Barangay Admin dashboard, and Barangay Admin login page.
- Super Admin Design Studio currently exists but its saved settings are not yet fully applied to the actual Super Admin dashboard and Super Admin login page.
- Full end-to-end live admin request submission/approval needs a dedicated test account before being marked complete.
- Super Admin verification preview still needs to be wired to display the private ID/selfie files for review.
- Future changes must preserve the verified baseline above and must be tested before being declared done.

### Git Workflow
- Repository uses the `main` branch only.
- Meaningful commits should explain what changed and why.
- `CHECKLIST.md` is the regression baseline and must be updated after meaningful changes.

