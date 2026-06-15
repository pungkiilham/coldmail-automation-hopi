# Cold Mail Automation — Hopi Digital

A web-based cold email outreach system built with **Next.js 16**, **Prisma**, and **SQLite**. Designed for Hopi Digital's Odoo implementation sales pipeline.

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Database | SQLite via Prisma 5 |
| Email | nodemailer (SMTP) |
| Styling | Tailwind CSS 4 |
| Language | TypeScript |

## Project Structure

```
cold-mail-app/
├── prisma/
│   ├── schema.prisma      ← Database models
│   ├── seed.ts            ← Seed script (24 leads, settings, template)
│   └── dev.db             ← SQLite database file
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
| `/settings` | SMTP credentials + sender info (stored in SQLite via Prisma) |

## Database Models

- **Lead** — Target companies (company name, email, industry, region, status)
- **Campaign** — Email campaigns (name, subject, body, delay, max per day, status)
- **EmailLog** — Send history (lead, campaign, status, error, timestamp)
- **Setting** — Key-value store for SMTP & sender config

## Quick Start

```bash
npm install            # Installs deps + generates Prisma client + pushes schema
npm run seed           # Seeds 24 leads, default SMTP settings, sample campaign
npm run dev            # Starts on http://localhost:3000
npm run build          # Production build
```

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
- SMTP password is stored in local SQLite, never exposed client-side

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
