# Luxury Homes Calgary

The Rivers Real Estate / Luxury Homes Calgary platform. React + Vite client,
Express + SQLite (Drizzle) server, deployed on Fly.io.

## Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind, wouter, TanStack Query
- **Backend:** Express 5, SQLite via better-sqlite3 + Drizzle ORM
- **Hosting:** Fly.io with persistent volume mounted at `/data`
- **MLS feed:** Pillar 9 RETS
- **Email:** Resend (riversrealestate.ca verified)
- **Maps + POIs:** Leaflet + Overpass API + OSRM routing

## Local development

```sh
npm install
npm run dev
```

The app runs on http://localhost:5173 (client) with the Express server on
:3001 by default. Vite proxies `/api/*` through.

## Deploy

Pushes to `main` automatically deploy to Fly via the
`.github/workflows/fly-deploy.yml` Action. The Action calls
`flyctl deploy --remote-only` so the build runs on Fly's builders, not on
the GitHub runner.

To deploy from a feature branch, use `workflow_dispatch` from the Actions tab.

### Manual deploy (fallback)

```sh
fly deploy
```

### Required secrets (GitHub repo → Settings → Secrets → Actions)

| Secret           | What it's for                                |
|------------------|----------------------------------------------|
| `FLY_API_TOKEN`  | Generated via `fly tokens create deploy`     |

### Required Fly secrets (set with `fly secrets set KEY=val`)

| Secret                   | What it's for                  |
|--------------------------|--------------------------------|
| `RESEND_API_KEY`         | Transactional email            |
| `OPENAI_API_KEY`         | Condo hero image generation    |
| `PILLAR9_USER` / `_PASS` | RETS feed credentials          |
| `MAKE_WEBHOOK_URL`       | Social composer outbound hook  |
| `GOOGLE_CLIENT_ID` / `_SECRET` | Calendar OAuth          |

## Project layout

```
client/      Vite + React frontend
server/      Express + Drizzle backend
shared/      Drizzle schema (shared types)
script/      Standalone scripts (image generation, etc.)
fly.toml     Fly.io config
Dockerfile   Production build
```
