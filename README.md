# aonhassan.com

Personal site with a LinkedIn-style feed that updates on its own every day.

- React + Vite frontend, hosted on Cloudflare Pages
- Supabase for the database and the daily post job
- The feed reads from Supabase, with seed posts as a fallback so the page is never empty

## Run it locally

```bash
npm install
npm run dev
```

It opens with the seed posts. Once you connect Supabase (below) and set the env
vars, it reads live posts instead.

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/aonhassan-site.git
git push -u origin main
```

## Deploy on Cloudflare Pages

1. Cloudflare dashboard, Workers and Pages, Create, Pages, Connect to Git, pick this repo.
2. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
3. Add environment variables (Settings, Environment variables), for Production and Preview:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   These are embedded at build time, so redeploy after adding them.
4. If the build fails on a Node version, add `NODE_VERSION` = `22`.
5. Add your domain under Custom domains.

The `public/_redirects` file is already included so refreshes and deep links do not 404.

## Add your resume

Drop your PDF into `public/` named exactly `Aon_Hassan_Resume.pdf`. The Resume
buttons link to `/Aon_Hassan_Resume.pdf`.

## Connect the backend (Supabase)

Everything for the daily feed lives in `supabase/`.

1. Create a Supabase project. In the SQL Editor, run `supabase/setup.sql`
   after replacing `<PROJECT_REF>` and `<CRON_SECRET>`.
2. Create an edge function named `daily-post` and paste
   `supabase/functions/daily-post/index.ts`. Deploy it.
3. Set two function secrets (Project Settings, Edge Functions):
   - `ANTHROPIC_API_KEY`
   - `CRON_SECRET` (same value as in the SQL)
4. Grab the Project URL and publishable key from the Connect dialog and set them
   as the Cloudflare env vars above.

At 09:00 Riyadh time the job pulls a fintech story, writes a short post in your
voice, and inserts it. The site shows it on the next visit.

## What is safe to commit

Only the publishable (anon) key ever reaches the browser, and row level security
blocks browser writes. Your Supabase secret key and `ANTHROPIC_API_KEY` live only
in Supabase function secrets, never in this repo. `.env` is gitignored.

## Structure

```
.
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── _redirects            SPA fallback for Cloudflare
├── src/
│   ├── main.jsx
│   ├── App.jsx               the site, reads from Supabase with seed fallback
│   ├── supabaseClient.js
│   └── index.css
└── supabase/
    ├── setup.sql             posts table, read policy, daily schedule
    └── functions/
        └── daily-post/
            └── index.ts      the daily writer
```
