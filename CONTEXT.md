# Cold Mail Automation — Hopi Digital

A web-based cold email outreach system built with **Next.js 16**, **Prisma**, and **PostgreSQL**. Designed for Hopi Digital's Odoo implementation sales pipeline.

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL via Prisma 5 |
| Email | nodemailer (SMTP) |
| Styling | Tailwind CSS 4 |
| Validation | Zod |
| CSV parsing | csv-parse |
| Language | TypeScript |

## Project Structure

```
cold-mail-app/
├── prisma/
│   ├── schema.prisma          ← Database models (PostgreSQL)
│   ├── seed.ts                ← Seed script (24 leads, settings, template)
│   └── migrations/            ← Migration files for deployment
├── src/
│   ├── proxy.ts               ← Auth middleware (protects all routes except /login, /api/auth)
│   ├── components/
│   │   ├── ErrorBoundary.tsx  ← Client-side error boundary
│   │   └── LogoutButton.tsx   ← Logout button with API call
│   ├── app/
│   │   ├── page.tsx                  ← Dashboard (stats + recent logs)
│   │   ├── layout.tsx                ← Nav layout + ErrorBoundary wrapper
│   │   ├── login/page.tsx            ← Login page with show/hide password
│   │   ├── leads/page.tsx            ← Lead CRUD + CSV import
│   │   ├── campaigns/page.tsx        ← Campaign list
│   │   ├── campaigns/new/page.tsx    ← Compose & send campaign
│   │   ├── logs/page.tsx             ← Send history table
│   │   ├── settings/page.tsx         ← SMTP & sender config
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts    ← POST login (validates, sets session cookie)
│   │       │   └── logout/route.ts   ← POST logout (clears session cookie)
│   │       ├── leads/route.ts        ← GET (paginated) / POST (Zod) / DELETE leads
│   │       ├── leads/import/route.ts ← CSV import (uses csv-parse library)
│   │       ├── campaigns/route.ts    ← POST campaign (sends synchronously, returns JSON)
│   │       ├── logs/route.ts         ← GET send logs (paginated)
│   │       └── settings/route.ts     ← GET (password masked) / PUT settings (Zod)
│   └── lib/
│       ├── prisma.ts                 ← Prisma client singleton
│       └── email.ts                  ← SMTP helpers (single query for config)
├── vercel.json
├── .env.example
├── package.json
├── tsconfig.json
└── next.config.ts
```

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Login page with show/hide password toggle |
| `/` | Dashboard — stats cards (total leads, sent, replies, campaigns) + recent activity |
| `/leads` | Manage leads — add, delete, bulk import from CSV |
| `/campaigns` | List all campaigns with status badges |
| `/campaigns/new` | Compose email, pick leads, set delay/limit, send |
| `/logs` | Full email send history with status & error details |
| `/settings` | SMTP credentials + sender info (password hidden in GET response) |

## Authentication

- Static username/password auth via environment variables
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `AUTH_SECRET` must be set in Vercel env
- `src/proxy.ts` protects all routes except `/login` and `/api/auth`
- Session cookie is HTTP-only, SHA-256 signed with `AUTH_SECRET`
- Login page at `/login` — redirects back to original page after sign-in
- Logout button in navigation bar

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | Validates credentials, sets session cookie |
| POST | `/api/auth/logout` | No | Clears session cookie |
| GET | `/api/leads?page=1&limit=50` | Yes | Paginated lead list |
| POST | `/api/leads` | Yes | Create lead (Zod validated) |
| DELETE | `/api/leads?id=X` | Yes | Delete lead + its email logs |
| POST | `/api/leads/import` | Yes | CSV import (uses csv-parse) |
| POST | `/api/campaigns` | Yes | Create & send campaign (returns JSON result) |
| GET | `/api/logs?page=1&limit=50` | Yes | Paginated email log list |
| GET | `/api/settings` | Yes | Get all settings (password masked as `********`) |
| PUT | `/api/settings` | Yes | Update settings (Zod validated; empty password = keep old) |

## Database Models

- **Lead** — Target companies (company name, email, industry, region, status)
- **Campaign** — Email campaigns (name, subject, body, delay, max per day, status)
- **EmailLog** — Send history (lead, campaign, status, error, timestamp)
- **Setting** — Key-value store for SMTP & sender config

## Local Development

### 1. Database Setup

You need a PostgreSQL database. Options:

- **Local Postgres**: Install PostgreSQL locally, create a database named `coldmail`
- **Neon (recommended)**: Free hosted Postgres at https://neon.tech (no credit card)
- **Vercel Postgres**: Integrated with Vercel deployment

### 2. Environment Variables

```bash
cp .env.example .env
# Edit .env with your PostgreSQL connection string
# Set ADMIN_USERNAME, ADMIN_PASSWORD, AUTH_SECRET
```

### 3. Install & Seed

```bash
npm install
npx prisma db push          # Creates tables
npm run db:seed              # Seeds 24 leads, settings, sample campaign
npm run dev                  # http://localhost:3000
```

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/pungkiilham/coldmail-automation-hopi)

### Steps

1. Push to GitHub
2. Import into Vercel
3. Add environment variables:
   - `DATABASE_URL` — PostgreSQL connection string (from Neon or Vercel Postgres)
   - `DIRECT_DATABASE_URL` — Direct connection (for migrations)
   - `ADMIN_USERNAME` — Login username
   - `ADMIN_PASSWORD` — Login password
   - `AUTH_SECRET` — Random string for session signing
   - `FALLBACK_SENDER_EMAIL` — (optional) Fallback sender if not set in Settings page
4. Deploy — build runs automatically
5. Run `npx prisma migrate deploy` in Vercel post-deploy hook or locally:

```bash
npx prisma migrate deploy    # Applies migrations to production DB
npx tsx prisma/seed.ts       # Seeds data (optional, run once)
```

### Note on Neon/Pooled Connections

If using Neon's pooled connection string (with `?pgbouncer=true`), use it for `DATABASE_URL` and the direct (non-pooled) connection for `DIRECT_DATABASE_URL` so Prisma Migrate can run schema changes.

## Preloaded Data

- **24 leads** from the original target-leads.csv (industries: manufacturing, Odoo partners, automotive, etc.)
- **SMTP defaults**: host `smtp.gmail.com`, port `587`, sender `noreply@hopidigital.com`
- **Sample campaign**: "Odoo Services — Cold Outreach" with Odoo-focused template text
- Placeholder emails (e.g. `lead-thien-thuy-moc@placeholder.com`) — fill in real ones via the Leads page

## To Send Emails

1. Open **Settings** → enter SMTP password (use a [Gmail App Password](https://myaccount.google.com/apppasswords))
2. Open **Leads** → update placeholder emails to real ones
3. Go to **Campaigns** → click **+ New Campaign** → select leads → **Start Campaign**
4. Campaign sends synchronously (no delays between emails for serverless compat); result shows sent count

## Safety

- Daily send limit (default 20) caps emails per campaign per day
- Campaigns auto-pause when daily limit is reached — resume later
- SMTP password stored in database, hidden in API responses (returns `********`)
- All inputs validated with Zod schemas
- Session cookie is HTTP-only (not accessible via JS)

## Related Hopi Digital Assets

Located under `D:\ESTRO HUTAMA\Project Estro\Hopi Digital\`:

| File | Purpose |
|------|---------|
| `Portofolio hopi/Hopi_Digital_Company_Profile.html` | 2-page A4 PDF portfolio for attachment |
| `Portofolio hopi/CONTEXT.md` | Full project docs, design specs, export guide |
| `Sales & Marketing/via cold mail/target-leads.csv` | Master lead list (24 targets) |
| `Sales & Marketing/via cold mail/email-template-odoo.md` | Cold email copy |
| `Sales & Marketing/via cold mail/email-template-followup.md` | Follow-up sequence |
| `Cold Email Automation/send-email.py` | Original Python version |
