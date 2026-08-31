# BRGYWEBSAAS Development Checklist

## Project Foundation
- [x] GitHub repository
- [x] Static HTML/CSS/JavaScript architecture
- [x] GitHub Pages deployment
- [x] Bootstrap 5 UI foundation
- [x] Custom CSS variables / theme engine
- [x] Supabase project connection for static frontend
- [x] No Next.js runtime
- [x] No Railway dependency
- [x] No paid hosting required for current target

## Authentication & RBAC
- [x] Supabase Auth
- [x] Static session handling
- [x] Single Super Admin account model
- [x] Super Admin role check
- [x] Barangay Admin role check
- [ ] Editor role
- [ ] Staff role
- [ ] End-to-end live auth regression test

## Multi-Tenant Security
- [x] Barangays table
- [x] Profiles / user-to-barangay relationship
- [x] barangay_id tenant scope
- [x] Tenant-aware login routing
- [x] Per-barangay design settings table
- [x] Automatic default design settings for new Barangays
- [x] Existing Barangay design backfill without overwriting custom settings
- [ ] Verify PostgreSQL RLS for every future CRUD table
- [ ] Tenant isolation security test suite

## Verified Baseline / Do Not Regress
- [x] Super Admin Login is a dedicated page
- [x] Super Admin Dashboard is separate from Barangay Admin Dashboard
- [x] Barangay Admin Login is barangay-specific and shows the assigned Barangay name
- [x] Barangay Admin Dashboard resolves the user's assigned Barangay via barangay_id
- [x] Super Admin can add/edit/activate/deactivate/delete Barangays
- [x] Super Admin Directory has Barangay Admin Login / Public View controls
- [x] Super Admin Admins area can view pending/approved Barangay Admin accounts
- [x] Admin approval controls are present (Approve / Reject)
- [x] Temporary test Barangay lifecycle verified live: create → default design → delete → cleanup
- [x] Live Supabase project verified ACTIVE_HEALTHY
- [x] No production test Barangay remains after lifecycle test
- [ ] Barangay Admin Design Studio fully applies saved design to live public/admin/login pages
- [ ] Super Admin Design Studio fully applies saved design to Super Admin dashboard/login pages
- [ ] Full end-to-end approval test with a dedicated test account

## Super Admin
- [x] Dashboard foundation
- [x] Manage Barangays
- [x] Barangay add/edit/activate/deactivate
- [x] Barangay delete control
- [x] Barangay-specific Admin Login links
- [x] Admin account management foundation
- [x] System Settings foundation
- [x] System-level Design Studio entry
- [ ] Audit Logs
- [ ] Platform Reports
- [ ] Expanded user/account management

## Barangay Admin
- [x] Dedicated Barangay Admin login page
- [x] Barangay name shown on login
- [x] Assigned-barangay authorization check
- [x] Dedicated Barangay Admin dashboard
- [ ] Barangay Profile
- [ ] Contact / Email / Facebook
- [ ] Smart Map Analyzer
- [ ] Announcements
- [ ] Events
- [ ] Officials
- [ ] Services
- [ ] ID Record Management CRUD
- [ ] Documents / Forms
- [ ] Requests
- [ ] Complaints / Concerns
- [ ] Residents / Users
- [ ] Emergency Information
- [ ] Gallery
- [ ] Barangay Website Customizer

## Public Website
- [ ] Home
- [ ] Announcements
- [ ] About
- [ ] Barangay Profile
- [ ] Directory
- [ ] Services
- [ ] ID Verification
- [ ] Downloadable Forms
- [ ] Barangay Disclosure

## Notifications
- [ ] In-App Notifications
- [ ] Email Notifications
- [x] SMS removed from roadmap

## Documentation
- [x] README.md
- [x] CHECKLIST.md
- [x] CHANGELOG.md
- [x] ERRORS.md
- [x] GitHub Issue #1 as roadmap source of truth

## Git Workflow
- [x] Single branch: main
- [x] Clear commit descriptions
- [x] Record verified baseline before changing working features
- [ ] Test live behavior before declaring done
- [ ] Update checklist after meaningful work
- [ ] Document significant errors and fixes
