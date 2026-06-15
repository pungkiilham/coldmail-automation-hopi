# Cold Mail Automation — Hopi Digital

A web-based cold email outreach system built with **Next.js 16**, **Prisma**, and **PostgreSQL**. Designed for Hopi Digital's Odoo implementation sales pipeline.

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL via Prisma 5 |
| Email | nodemailer (SMTP) |
| Styling | Tailwind CSS 4 |
| Language | TypeScript |

## Project Structure

```
cold-mail-app/
├── prisma/
│   ├── schema.prisma          ← Database models (PostgreSQL)
│   ├── seed.ts                ← Seed script (24 leads, settings, template)
│   └── migrations/            ← Migration files for deployment
├── src/
│   ├── app/
│   │   ├── page.tsx                  ← Dashboard (stats + recent logs)
│   │   ├── layout.tsx                ← Nav layout
│   │   ├── leads/page.tsx            ← Lead CRUD + CSV import
│   │   ├── campaigns/page.tsx        ← Campaign list
│   │   ├── campaigns/new/page.tsx    ← Compose & send campaign
│   │   ├── logs/page.tsx             ← Send history table
│   │   ├── settings/page.tsx         ← SMTP & sender config
│   │   └── api/
│   │       ├── leads/route.ts        ← GET/POST/DELETE leads
│   │       ├── leads/import/route.ts ← CSV import
│   │       ├── campaigns/route.ts    ← POST campaign (send via SSE stream)
│   │       ├── logs/route.ts         ← GET send logs
│   │       └── settings/route.ts     ← GET/PUT settings
│   └── lib/
│       ├── prisma.ts                 ← Prisma client singleton
│       └── email.ts                  ← SMTP helpers
├── vercel.json
├── .env.example
├── package.json
├── tsconfig.json
└── next.config.ts
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard — stats cards (total leads, sent, replies, campaigns) + recent activity |
| `/leads` | Manage leads — add, delete, bulk import from CSV |
| `/campaigns` | List all campaigns with status badges |
| `/campaigns/new` | Compose email, pick leads, set delay/limit, send with live stream log |
| `/logs` | Full email send history with status & error details |
| `/settings` | SMTP credentials + sender info (stored in DB via Prisma) |

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
- **SMTP defaults**: host `smtp.gmail.com`, port `587`, sender `pungki@hopidigital.com`
- **Sample campaign**: "Odoo Services — Cold Outreach" with Odoo-focused template text
- Placeholder emails (e.g. `lead-thien-thuy-moc@placeholder.com`) — fill in real ones via the Leads page

## To Send Emails

1. Open **Settings** → enter SMTP password (use a [Gmail App Password](https://myaccount.google.com/apppasswords))
2. Open **Leads** → update placeholder emails to real ones
3. Go to **Campaigns** → click **+ New Campaign** → select leads → **Start Campaign**
4. Watch live logs stream in the browser

## Safety

- Daily send limit (default 20) and per-email delay (default 30s) prevent spam flags
- Campaigns auto-pause when daily limit is reached — resume later
- SMTP password stored in database, never exposed client-side

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
