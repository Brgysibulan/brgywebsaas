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

## Known / next work
- Barangay Admin Design Studio currently exists but its saved settings are not yet fully applied to the actual public page, Barangay Admin dashboard, and Barangay Admin login page.
- Super Admin Design Studio currently exists but its saved settings are not yet fully applied to the actual Super Admin dashboard and Super Admin login page.
- Full end-to-end live admin request submission/approval needs a dedicated test account before being marked complete.
- Future changes must preserve the verified baseline above and must be tested before being declared done.

### Git Workflow
- Repository uses the `main` branch only.
- Meaningful commits should explain what changed and why.
- `CHECKLIST.md` is the regression baseline and must be updated after meaningful changes.

