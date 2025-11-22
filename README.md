# StockMaster — Inventory Management System

This repository contains a Next.js 14 (App Router) + Supabase inventory management scaffold implemented to match the provided requirements.

Quick notes:
- Next.js app is in the `app/` folder (App Router)
- Supabase SQL migrations are under `supabase/migrations.sql`
- Seed data is in `supabase/seed.sql`
- Server actions are in the `server/` folder and API routes under `app/api`.

Setup (local):

1. Install dependencies

```powershell
npm install
```

2. Copy `.env.example` to `.env.local` and fill in your Supabase keys

3. Run migrations in Supabase (use the SQL in `supabase/migrations.sql`) and then run `supabase/seed.sql` to add seed data.

4. Run the dev server

```powershell
npm run dev
```

Notes on transactional flows:
- RPC functions exist in `supabase/migrations.sql` named `validate_receipt`, `validate_delivery`, `validate_transfer`, and `validate_adjustment`.
- API route `/api/documents/[id]/validate` calls server RPC through `server/documentActions.ts`.

This scaffold implements the requested folder structure, core API contracts, and example pages for login, dashboard, and products. Expand UI components and pages to match the supplied wireframes.
