# CramCards

CramCards helps university students turn lecture notes into flashcards so they can review before exams instead of cramming.

Built with Next.js (App Router) and Supabase (Auth + Postgres with Row Level Security).

## Run locally

1. Install Node.js 20 or newer (https://nodejs.org, LTS installer).
2. Create `.env.local` (see `.env.example`) with your Supabase URL and publishable key.
3. Run `supabase/schema.sql` in Supabase > SQL Editor.
4. In Supabase > Authentication > Sign In / Providers > Email, turn **off** "Confirm email".
5. Then:

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Pages

- `/`: public landing page
- `/signup`, `/login`: email + password auth
- `/app`: your private flashcards (logged-in only)
