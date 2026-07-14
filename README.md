# Ethiopia Innovation Hub — Frontend

Next.js app. See `docs/06-ui-ux-specification.md` for the design system and
screen inventory.

This repo is fully independent of `innovation-hub-backend`. You do not need
Python, Django, Postgres, or the backend repo checked out to run this.

## How this talks to the API

Via **only** `contracts/openapi.yaml` — a synced copy of the backend repo's
generated contract. Two things are built from it:

1. `src/lib/api-types.ts` — TypeScript types (`npm run generate-types`)
2. A local mock server (Prism, via `docker-compose.yml`) that serves
   schema-valid fake responses on `localhost:4010` — this is what
   `NEXT_PUBLIC_API_URL` points at by default

```bash
docker compose up --build
```

brings up `web` (localhost:3000) and `mock-api` (localhost:4010). No
backend repo, no Django, no database.

## Picking up backend API changes

When the backend team tells you the contract changed (a PR merged to
`contracts/openapi.yaml` in their repo):

```bash
export BACKEND_CONTRACT_URL=https://raw.githubusercontent.com/<org>/innovation-hub-backend/main/contracts/openapi.yaml
npm run sync-contract
```

This pulls the new `contracts/openapi.yaml` and regenerates
`src/lib/api-types.ts` in one step. Do this deliberately — it's not
automatic — so a backend change never breaks your build mid-task. Commit
both files together.

## Testing against a real backend instead of the mock

Set `NEXT_PUBLIC_API_URL` in `.env.local` to wherever a real instance is
running (a teammate's `localhost:8000`, staging, etc.) instead of the mock's
`:4010`. Nothing else changes — same types, same `api-client.ts`.

## First-time setup

```bash
cp .env.example .env.local
docker compose up --build
```

Or without Docker:

```bash
npm install
npm run dev
```
(Prism mock won't be running outside Docker — either run
`npx @stoplight/prism-cli mock contracts/openapi.yaml` yourself, or point
`NEXT_PUBLIC_API_URL` at a real backend.)

## Repository layout

```
src/
├── app/                 Next App Router — SSR public pages
├── features/            one folder per backend module (auth, hackathons,
│                        registrations, teams, submissions, judging,
│                        showcase, notifications, analytics)
├── components/ui/       shared presentational primitives — build these
│                        and the design tokens below BEFORE any feature screen
└── lib/
    ├── api-client.ts     fetch wrapper — the only thing that knows the API base URL
    └── api-types.ts      generated, do not hand-edit
contracts/
└── openapi.yaml          synced from the backend repo — do not hand-edit
scripts/
├── sync-contract.sh
└── generate-types.sh
docs/                     UI/UX spec + a reference copy of the OpenAPI doc
docker-compose.yml         web + mock-api (Prism) — no backend dependency
```

## Build order

1. **Design tokens first** (`src/app/globals.css`, Tailwind theme) — turn
   doc 06 Sec 3.2's semantic color roles (`color-primary`, `color-surface`,
   `color-text`, `color-success`/`warning`/`danger`, `color-focus`) into
   real hex values, contrast-checked to WCAG AA (4.5:1 text / 3:1 UI) per
   doc 06's NFR-ACC-001. Same for the `font-latin` + `font-ethiopic`
   typography pairing and the 4px spacing scale.
2. **`components/ui` primitives** — buttons, form fields, badges, nav,
   language toggle. Every feature screen depends on these.
3. **`features/auth`** — first real feature; most other screens sit behind
   a login.
4. From there, build features in whatever order matches the roadmap
   (doc 09) — you're not blocked by backend sequencing since you're
   talking to the mock, not the real API.
