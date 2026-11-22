# BRANDORA

AI brand identity studio. A founder answers six questions and gets three complete brand directions, each with a logo suite, color palette, typography, brand story, Instagram posts and stories, business card and packaging mockups, and an 8‑page brand book PDF. Full English and Arabic support, including right‑to‑left layouts and Arabic typefaces.

The frontend is complete and runs on its own using a built‑in sample engine. The `server/` folder holds a working Claude backend you switch on with one environment variable.

```bash
npm install
npm run dev          # http://localhost:5173
```

```bash
npm run build        # production build in dist/
```

## What's in the app

| Route | What it does |
| --- | --- |
| `/` | Landing page: live studio hero, deliverables, how it works, showcase, pricing, FAQ |
| `/create` | Brief form: name, category, audience, personality, colors (presets + custom), brand language |
| `/project/:id` | Brand studio with six tabs: Concepts, Logo, Colors & type, Social, Mockups, Export |
| `/dashboard` | Saved projects: search, filter, sort, grid/list, favourite, rename, duplicate, delete |

Exports:

- **Logo SVG**: vector, with the exact font file embedded as base64, so it renders correctly in Illustrator, Figma or a browser without the font installed.
- **Logo PNG**: 2000 px wide, transparent background (drawn from the same SVG).
- **Instagram posts and stories**: 1080×1080 and 1080×1920 PNG.
- **Business card and packaging mockups**: high‑resolution PNG.
- **Brand book PDF**: 8 landscape A4 pages (cover, story, logo, color, typography, social, print, back cover), written in the brand's language.

## Project structure

```
src/
  main.jsx, App.jsx, index.css      Entry, routes, Tailwind v4 theme tokens
  i18n/                             EN/AR dictionaries + provider (sets <html dir/lang>)
  store/ProjectsContext.jsx         Project CRUD, persisted to localStorage (swap for a DB, see below)
  services/ai.js                    The only place the UI asks for AI output
  lib/
    generator.js, copy.js           Sample brand engine (same JSON shape as the real API)
    logoSvg.js                      Logo renderer: one SVG builder for screen, SVG, PNG and PDF
    color.js, random.js             Color math (contrast, CMYK, naming), seeded RNG
    download.js, exportPdf.js       PNG/SVG downloads, PDF assembly (jsPDF, lazy-loaded)
  data/                             Categories, personalities, colors, fonts, sample projects
  components/
    brand/ social/ mockups/ export/ Logo, Instagram designs, mockups, brand book pages
    layout/ ui/                     Navbar, footer, buttons, modal, toast, segmented control
  pages/                            Landing, Create, Dashboard, Studio (+ studio/ tabs)
server/                             Express API that calls Claude (structured output)
supabase/schema.sql                 Tables, row-level security, storage bucket
```

### Why logos are SVG, not images

Logos are drawn from structured data (`mark`, `layout`, `colorway` plus the palette and fonts), not generated as bitmaps. That keeps every logo crisp, editable and exportable as true vector, keeps the brand name spelled correctly (image models still garble text, especially Arabic), and lets the same data produce every variation (on dark, one color, icon only, stacked). The AI's job is the creative decisions: which mark, which colors, which typefaces, what the brand says. The renderer turns those decisions into files.

## 1. Connect the AI (Claude)

`src/services/ai.js` checks `VITE_API_URL`. Unset, it uses the sample engine. Set, it calls your backend, which returns the same JSON shape, so no UI code changes.

The backend in `server/index.js`:

- Calls `claude-opus-5-5` through the official `@anthropic-ai/sdk`.
- Uses **structured outputs** (`client.beta.messages.parse` + a Zod schema) so the response always matches the concept shape. Fonts and logo marks are enums limited to what the frontend can render.
- Caches the fixed system prompt (`cache_control`), so repeat requests pay less for it.
- Sets `effort: 'medium'`, a good balance for creative copy. Raise it to `high` if you want more careful strategy, at more cost and latency.
- Enables server‑side **refusal fallbacks** (`fallbacks: 'default'`): if a safety classifier declines a brief, Anthropic re-runs it on its recommended fallback model instead of failing.
- Maps SDK errors (rate limit, auth, connection) to clear messages and never sends raw API errors to the browser.

Run it:

```bash
cd server && npm install
```

```bash
cp .env.example .env   # then set ANTHROPIC_API_KEY
```

```bash
node --env-file=.env index.js    # http://localhost:8787
```

Then point the frontend at it (in the project root `.env`):

```
VITE_API_URL=http://localhost:8787
```

**Cost:** one brand generation is about 1.5K input tokens and 6–10K output tokens (three full concepts in two languages' worth of fields). At Opus 5.5 prices ($4 / $20 per million tokens) that is roughly $0.15–0.25 per generation; logo explorations are a few cents. Track real numbers from `response.usage` before setting plan limits.

**Optional extras:**
- *Photographic mockups or social imagery:* add an image model behind a new `/api/images` endpoint and pass the brand palette and logo SVG as references. Keep the vector logo as the source of truth.
- *Streaming progress:* switch `askClaude` to `client.beta.messages.stream(...)` and forward events over Server‑Sent Events if you want concepts to appear one by one.

## 2. Database (Supabase / Postgres)

`supabase/schema.sql` creates a `projects` table (the brief and concepts stored as `jsonb`), a `generations` usage log, and a private `exports` storage bucket, all protected by row‑level security so users can only reach their own rows.

To switch the store from localStorage to Supabase, keep the same context API and replace the internals of `src/store/ProjectsContext.jsx`:

```js
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

// load
const { data } = await supabase.from('projects').select('*').order('updated_at', { ascending: false });

// create
const { data: row } = await supabase.from('projects')
  .insert({ name: input.name, input, concepts, seed, user_id: user.id })
  .select().single();

// update
await supabase.from('projects').update({ selected, status, concepts }).eq('id', id);

// delete
await supabase.from('projects').delete().eq('id', id);
```

Map `created_at`/`updated_at` to the `createdAt`/`updatedAt` numbers the UI uses (`Date.parse(row.updated_at)`). Update optimistically in React state first, then write, so the dashboard stays instant.

Any Postgres works (Neon, RDS, PlanetScale Postgres) with an ORM such as Prisma or Drizzle; Supabase is recommended because it bundles auth, storage and row‑level security.

## 3. Authentication

With Supabase Auth:

1. Enable email magic links and Google (and Apple, popular in the Gulf) in the Supabase dashboard.
2. Add a sign‑in page that calls `supabase.auth.signInWithOtp({ email })` or `supabase.auth.signInWithOAuth({ provider: 'google' })`.
3. Wrap `/create`, `/dashboard` and `/project/:id` in a route guard that redirects signed‑out users. Keep the landing page public.
4. Send the session token to the API: `generateBrand(input, { token: session.access_token })`. The `token` option already exists in `services/ai.js`.
5. On the server, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. The `requireUser` middleware then rejects requests without a valid user.

Use the `generations` table to enforce plan limits (for example, count this month's rows before calling Claude and return 402 when the Starter limit is reached). Add Stripe Checkout for the Pro and Studio plans and store the plan on a `profiles` table.

## 4. Deployment

**Frontend (static):** Vercel, Netlify or Cloudflare Pages.
- Build command `npm run build`, output `dist`.
- SPA routing is already configured: `vercel.json` and `public/_redirects` (Netlify) rewrite every path to `index.html`.
- Environment: `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. These are public by design; never put the Anthropic key or service role key in `VITE_*` variables.

**API (`server/`):** any Node 20+ host: Render, Railway, Fly.io, Google Cloud Run or AWS App Runner.
- Start command `node index.js`, root directory `server`. The server imports `../src/data/options.js`, so deploy from the repository root with `server` as the working directory.
- Environment: `ANTHROPIC_API_KEY`, `CORS_ORIGIN=https://your-domain.com`, plus the Supabase variables.
- Generations take 20–60 seconds, so set the platform's request timeout to at least 120 s. On serverless platforms (Vercel Functions, Netlify Functions), raise the function's max duration accordingly, or move generation to a background job and poll.

**Database:** create a Supabase project, run `supabase/schema.sql`, and copy the URL and keys into the environments above.

### Production checklist

- Rate limit `/api/*` per user and per IP (for example `express-rate-limit`, or your platform's edge rules).
- Log `response.usage` per generation to monitor cost.
- Add error monitoring (Sentry) to both apps.
- Show a short notice that users should run a trademark search before registering a logo.
- Self‑hosted fonts are SIL Open Font License; keep the license files if you redistribute them.
