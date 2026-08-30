# BRGYWEBSAAS Development Checklist

## Project Foundation
- [ ] Next.js + TypeScript foundation
- [x] GitHub repository
- [ ] Supabase project connection
- [ ] Vercel deployment
- [ ] Environment variables

## Authentication & RBAC
- [ ] Supabase Auth
- [ ] Session handling
- [ ] Superadmin role
- [ ] Barangay Admin role
- [ ] Editor role
- [ ] Staff role

## Multi-Tenant Security
- [ ] Barangays table
- [ ] Profiles / user-to-barangay relationship
- [ ] barangay_id tenant scope
- [ ] Tenant resolver
- [ ] Server-side authorization
- [ ] PostgreSQL RLS
- [ ] Tenant isolation security test

## Superadmin
- [ ] Dashboard
- [ ] Manage Clients / Barangays
- [ ] Barangay CRUD
- [ ] Domain setup
- [ ] Status monitoring
- [ ] Admin Requests
- [ ] Manage Admin Accounts
- [ ] Manage Users
- [ ] System Settings
- [ ] Audit Logs
- [ ] Platform Reports

## Barangay Admin
- [ ] Dashboard
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
- [ ] Website Customizer

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
- [ ] CHANGELOG.md
- [ ] ERRORS.md

## Git Workflow
- [x] Single branch: main
- [ ] Clear commit descriptions
- [ ] Test before commit
- [ ] Update checklist after meaningful work
- [ ] Document errors and fixes
