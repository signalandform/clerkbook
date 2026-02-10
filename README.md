# Citestack

Citation-first research library (save → summarize → search → cite).

## Stack
- Next.js (App Router)
- Supabase (Postgres + Storage + Auth)
- OpenAI (summaries/quotes/tags; later embeddings)
- Vercel deploy

## Local dev

1) Install deps
```bash
npm install
```

2) Create `.env.local` from `.env.example`
```bash
cp .env.example .env.local
```

3) Run
```bash
npm run dev
```

## Supabase
- Enable **Auth**
- Create Storage bucket: `library-files`
- Run SQL in `supabase/migrations/0001_init.sql`

## Credits & Billing
Credits are added to your balance each month. Unused credits roll over automatically and do not expire (unless stated otherwise at grant time). If you cancel a paid plan later, credits already granted remain available. The Account page shows plan, balance, monthly grant, and recent activity.

**What costs credits (display reference):** Enrich (full) = 2 credits; Retag = 1 credit; Compare (2 / 3 / 4 / 5 items) = 6 / 7 / 8 / 9 credits. Actual deduction logic may differ; see [lib/credits/costs.ts](lib/credits/costs.ts).

## Citations
Formatted citations (APA 7, MLA 9, Chicago) and exports (BibTeX, RIS, CSL-JSON) are available per item and for multi-selected items in the library. See [docs/citations.md](docs/citations.md) for how formatting works, data sourcing, and limitations.

## Notes
This repo is an initial scaffold. Next steps:
- Invite-code gated signup (server route + tables)
- Capture flows: URL / paste / file upload
- Async job runner (simple `jobs` table + cron-triggered worker endpoint)
