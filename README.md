# BRANDORA

AI branding studio. A founder answers six questions; BRANDORA writes a creative brief, proposes three brand directions and twelve logo directions, then builds the full identity: palette, typography, patterns, social templates, print, packaging, apparel, signage and web mockups, brand guidelines and a ZIP of production files. English and Arabic throughout, with right-to-left layouts and Arabic typefaces.

```bash
npm install
npm run dev          # http://localhost:5173, runs in sample mode with no keys
```

Sample mode uses a built-in template engine and says so on screen. Live mode adds language models, image models and vectorising through the API server in `server/` (setup below).

## Workflow

| Step | Where | Sample mode | Live mode |
|---|---|---|---|
| 1 Brief | `/create` | ✓ | ✓ |
| 2 Creative brief | Concepts tab | template | language model |
| 3 Three directions | Concepts tab | template engine | language model (background job) |
| 4 Twelve logo concepts | Logo tab | ✓ | ✓, plus AI options per direction |
| 5 Select, favourite, compare | Logo tab | ✓ | ✓ |
| 6 Refine | Logo tab | controls + offline keyword edits | controls + AI edits + AI-drawn symbols (image model → vector) |
| 7 Identity | Colors & type, Brand kit | ✓ | ✓ |
| 8 Mockups | Mockups tab | vector mockups | vector mockups + photo mockups (image model with the real logo as reference) |
| 9 Export | Export tab | ✓ | ✓ |

The stepper at the top of each project shows which steps are done.

## Logo system

Twelve directions, each a different construction rather than a recolour:

| Direction | Construction |
|---|---|
| Minimalist | quiet symbol, light lowercase, wide tracking |
| Luxury | framed crest, tracked serif capitals, hairline rules and descriptor |
| Modern geometric | grid-built symbol, geometric sans |
| Abstract symbol | non-literal mark that stands alone as an icon |
| Wordmark | name only, made ownable with one device (accent dot, coloured final letter, swash) |
| Lettermark | interlocking initials in a ring |
| Mascot | geometric fox, owl or bear built from simple shapes |
| Vintage & retro | double-ring badge, arched name, founding line |
| Futuristic | extended capitals, wide tracking, directional symbol |
| Fashion & streetwear | slanted heavy box logo |
| Corporate & tech | sturdy symbol, neutral sans, divider and descriptor |
| Creative emblem | circular emblem with the name on the arc |

There are 44 symbols (40 marks, lettermark, 3 mascots) plus AI-drawn custom symbols. Each concept can be previewed full-screen with the tests a logo has to pass: light, dark and brand backgrounds, 128/64/32/16 px, and one-colour and reversed. You can compare up to three side by side.

Logos are built as SVG from structured data (symbol, typeface, weight, case, tracking, lockup, colourway), so every logo is real vector artwork with the brand name spelled correctly in both scripts. Image models are used where they add something: custom symbols, which are vectorised to clean paths, and photographic mockups. The app never puts text over a generated image and calls it a logo.

## Typography

138 Google Fonts (108 Latin, 30 Arabic, all SIL OFL or Apache 2.0) in 12 categories: modern sans, geometric, minimalist, luxury serif, editorial, bold display, futuristic, vintage, handwritten, fashion, rounded and Arabic. Every family and weight was checked against the Google Fonts API. Fonts load on demand. Exported SVGs embed only the glyphs they use (Google Fonts `text=` subsetting), so files stay small and render anywhere.

You can preview your name in any font at any size, weight and spacing, compare curated pairings matched to your brand personality, set any font as heading or body per script, and export the specification as Markdown, CSS or JSON.

## Exports

- **ZIP package** (about 90 files): logos in 5 lockups × 4 colourways as SVG (fonts embedded) and transparent PNG, JPG previews, favicon and app icons, palette as `.ase` (Adobe), `.gpl` (GIMP/Inkscape/Affinity), CSS and JSON, typography spec, 15 backgrounds as SVG, wallpapers, and the PDF guidelines.
- **PDF brand guidelines**: 9 pages, also viewable in the app.
- Individual SVG/PNG files for every logo, post, story, cover, mockup and background.

## Architecture

```
src/                         React 18 + Vite + Tailwind v4
  services/ai.js             the only place the UI talks to AI (sample engine or API)
  services/cloud.js          optional Supabase auth + sync
  lib/logoSvg.js             logo renderer (marks, lockups, font embedding)
  lib/logoDirections.js      the 12 logo directions
  lib/logoEdits.js           offline refine interpreter
  lib/backgrounds.js         15 background/pattern styles
  lib/exportPackage.js       ZIP builder · lib/exportPdf.js PDF · lib/specExport.js ASE/GPL/CSS/JSON/MD
  data/fontLibrary.js        138 validated Google Fonts + pairings
server/                      Express API
  core/registry.js           routing per task, retry with backoff, fallback, cooldown on rate limits, cache
  core/cache.js              TTL cache + in-flight de-duplication
  core/usage.js              per-attempt usage, latency and cost estimates
  core/jobs.js               background jobs (in-memory; same interface for BullMQ/Redis)
  core/rateLimit.js          per-user / per-IP token bucket
  providers/                 anthropic, openai, gemini, vector (vectorizer.ai, potrace), fonts
  lib/schemas.js, prompts.js structured output schemas and prompts
supabase/schema.sql          projects, api_usage, storage bucket, row-level security
```

### Providers and tasks

| Task | Used for | Providers (default order) |
|---|---|---|
| `text` | brief, concepts, logo directions, refinements | Claude (`claude-opus-5-5`), then Gemini |
| `image` | custom symbol drawings | Gemini |
| `edit` | photo mockups using the real logo as reference, image edits | Gemini |
| `vector` | raster → clean SVG paths | Vectorizer.AI, Potrace (local, no key) |
| `fonts` | font discovery | Google Fonts API, curated library |

Only providers with keys are used. OpenAI is supported but off by default; add it with `TEXT_PROVIDERS=anthropic,gemini,openai` (and the image variables) if you want it. Change the order with `TEXT_PROVIDERS`, `IMAGE_PROVIDERS`, `EDIT_PROVIDERS` and `VECTOR_PROVIDERS`. Each call is retried on 408/429/5xx and network errors with exponential backoff (honouring `retry-after`), then passed to the next provider. A provider that returns a long rate limit is skipped until it expires. Identical cacheable requests (brand generation, vectorising, fonts) are served from cache, and concurrent duplicates share one call. Claude uses structured outputs and server-side refusal fallbacks; OpenAI and Gemini use JSON mode, with every response validated against the same Zod schema.

`/settings` in the app shows routing, calls, failures, average latency and estimated cost per provider.

## Setup (live mode)

```bash
cd server && npm install
```

```bash
cp .env.example .env
```

Add at least one text provider key, then:

```bash
node --env-file=.env index.js
```

In the project root `.env`:

```
VITE_API_URL=http://localhost:8787
```

### Server environment

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY`, `CLAUDE_MODEL` | Claude for text tasks (default `claude-opus-5-5`) |
| `OPENAI_API_KEY`, `OPENAI_TEXT_MODEL`, `OPENAI_IMAGE_MODEL`, `OPENAI_BASE_URL` | OpenAI text, images and edits (defaults `gpt-4.1`, `gpt-image-1`; set the models on your account) |
| `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` | Free image drawing with FLUX (symbol explorations). Used after Gemini; it cannot edit a reference image, so photo mockups still need Gemini or OpenAI |
| `GEMINI_API_KEY`, `GEMINI_TEXT_MODEL`, `GEMINI_IMAGE_MODEL` | Gemini text, images and edits (defaults `gemini-3.5-flash`, `gemini-3.1-flash-image`; the free tier covers text only, images need billing on the Google project) |
| `VECTORIZER_API_ID`, `VECTORIZER_API_SECRET`, `VECTORIZER_MODE` | Vectorizer.AI (`test` mode is free for development) |
| `GOOGLE_FONTS_API_KEY` | font discovery from the full Google Fonts catalogue |
| `TEXT_PROVIDERS` … `VECTOR_PROVIDERS` | provider order per task, comma-separated |
| `PROVIDER_RETRIES`, `JOB_CONCURRENCY`, `RATE_LIMIT_PER_MIN` | reliability and limits |
| `PRICE_ANTHROPIC_INPUT_MTOK` … `PRICE_GEMINI_IMAGE` | cost estimates. Claude defaults to $4/$20 per million tokens; set the others from your providers' pricing pages, otherwise their cost shows as unpriced |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | require signed-in users and log usage to `api_usage` |
| `CORS_ORIGIN` | your frontend origin in production |

Keys never reach the browser. `VITE_*` variables are public by design and only hold URLs and the Supabase anon key.

### Database and sign-in (Supabase)

1. Create a Supabase project and run `supabase/schema.sql`.
2. Enable email sign-in (magic links). Add Google or Apple if you like.
3. Frontend `.env`: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. A **Sign in** button appears; signed-in users' projects sync to the `projects` table (row-level security limits each user to their own rows), and projects made on the device before the first sign-in are uploaded.
4. Server `.env`: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. The API then rejects requests without a valid session and records usage in `api_usage`.

Without these variables, projects stay in the browser and the API accepts anonymous requests (fine for local development, not for production).

### API

| Method | Path | |
|---|---|---|
| POST | `/api/jobs` `{type:'brand', input}` | start a brand generation job → `{jobId}` |
| GET | `/api/jobs/:id` | status, progress, result |
| POST | `/api/brands/generate` | the same, synchronously |
| POST | `/api/logos/directions` | AI logo options inside one direction |
| POST | `/api/logos/refine` | AI edit → validated config patch |
| POST | `/api/images/symbol` | image model draws a symbol → vectorised SVG path |
| POST | `/api/images/mockup` | photo mockup from the real logo |
| POST | `/api/images/edit` | edit an image with a prompt |
| POST | `/api/vectorize` | PNG/JPG data URL → SVG |
| GET | `/api/fonts` | font catalogue |
| GET | `/api/providers/status` | routing, usage, cache and job stats |

## Deployment

### Everything on Netlify (recommended)

One Netlify site serves the website and the API. The API runs as Netlify Functions from `netlify/functions`:

- `api` is a fast function at `/api/*`. It checks the user, rate-limits, creates a job and reports status.
- `run-background` is a background function (15 minute limit). It runs the AI task, because brand generation takes 20 to 60 seconds, longer than a normal function may run.
- Job state and results live in Netlify Blobs. A random per-job secret means only the `api` function can start work in `run-background`.

Steps:

1. Put the project in a GitHub repository (Netlify must build it; drag-and-drop uploads do not install dependencies or build functions).
2. Netlify → Add new site → Import an existing project → GitHub. Settings are read from `netlify.toml`.
3. Site configuration → Environment variables. Add `ANTHROPIC_API_KEY` and `GEMINI_API_KEY` and tick "Contains secret values". Optional: `GEMINI_API_KEY`, `VECTORIZER_API_ID`/`VECTORIZER_API_SECRET`, `SUPABASE_*`, `*_MODEL`, `TEXT_PROVIDERS`…
4. Deploys → Trigger deploy → Clear cache and deploy site.
5. Open `/settings`. It shows Connected and the providers that have keys. Until a key exists the app says so and uses the sample engine.

`VITE_API_URL=/` is set in `netlify.toml`. It means "the API is on this site" and is not a secret. The app asks `/api/providers/status` at start, so features switch on by what is configured: text keys enable AI briefs, concepts and edits; an image key enables AI symbols; an image-editing key enables photo mockups.

### Frontend on Netlify, API elsewhere

Deploy the frontend as above but set `VITE_API_URL` to the API address (no trailing slash) and `CORS_ORIGIN` on the API to your site address. The `server` folder runs on any Node 20+ host (Render, Railway, Fly.io, Cloud Run); its jobs, cache and rate limit are in memory, so use one instance or back them with Redis.

## Tests

```bash
npm run test:all
```

The tests cover fallback, retry with backoff, rate-limit cooldown, caching and in-flight de-duplication, the job queue, OpenAI and Gemini request shapes and response parsing (with `fetch` stubbed), invalid JSON handling, and Potrace on a real logo PNG. `netlify/test/api.test.js` covers the Netlify job cycle (create, background run, poll), the per-job secret, safe error messages, rate limiting, ownership and URL handling, with an in-memory store. `netlify/test/local-harness.mjs` serves the built site and the same function code in one process with OpenAI stubbed, so the whole live path runs in a browser with no keys. `server/test/live-harness.mjs` does the same for the Express server.

## Known limits

- The Netlify Functions run in this repository's tests and a Netlify-like harness, and the function bundles build with esbuild, but they have not run on Netlify itself yet. Check `/settings` and one generation after your first deploy.
- The live provider calls have been tested against stubs, not the real OpenAI, Gemini or Anthropic APIs, and the Supabase sync has not been run against a real project. Run one generation, one image request and one sign-in with real credentials before launch.
- Default model names change over time; set the `*_MODEL` variables to the models on your accounts.
- Photo mockups are generated images. Use the vector mockups and logo files for print.
- Run a trademark search before registering any logo.
