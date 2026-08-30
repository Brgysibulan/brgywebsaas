# BRGYWEBSAAS

Multi-tenant Barangay Website and Digital Services Platform.

## Foundation

The project uses Next.js and Supabase. The Super Admin foundation includes Barangay Management with add, edit, and activate/deactivate flows. The database is designed around `barangay_id` tenant isolation and PostgreSQL Row Level Security.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Current milestone

Super Admin → Barangay Management → Add/Edit/Activate/Deactivate Barangay.
