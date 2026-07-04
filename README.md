# Fastcareer

Fastcareer durchsucht die offiziellen Stellenangebote der Bundesagentur für Arbeit und nimmt Nutzer:innen mit KI die mühsamen Teile der Bewerbung ab: Job-Zusammenfassung, Match-Score gegen das eigene Profil, maßgeschneidertes Anschreiben (als DIN-Brief-PDF) und eine Bewerbungs-Pipeline zum Nachverfolgen.

## Stack

| Kategorie | Technologie |
| --------- | ----------- |
| Framework | Next.js 16 (App Router) |
| Sprache | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Backend/DB | Supabase (Postgres + Auth + Storage) |
| KI | Google Gemini via Vertex AI |
| Zahlungen | Stripe (Credit-Pakete, Einmalkauf) |
| Rate-Limiting/Kontingente | Upstash Redis |
| Hosting | Vercel |
| Icons | Lucide React |
| Validierung | Zod |

## Projekt starten

```bash
# 1. Dependencies installieren
pnpm install

# 2. Env-Datei anlegen
cp .env.example .env.local
# → Werte eintragen, siehe Abschnitt "Environment-Variablen" unten

# 3. Dev-Server starten
pnpm dev
```

## Environment-Variablen

Alle Variablen stehen mit Erklärung in `.env.example`. Kurzüberblick, woher sie kommen:

| Variable | Quelle |
| -------- | ------ |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → API (nur serverseitig, nie `NEXT_PUBLIC_`) |
| `GOOGLE_CLOUD_PROJECT` / `GOOGLE_CLOUD_LOCATION` / `GCP_SERVICE_ACCOUNT_KEY_B64` | Google Cloud Console, Service-Account mit Rolle "Vertex AI User" |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | [console.upstash.com](https://console.upstash.com) → Redis-DB anlegen (kostenloser Tier reicht). Ohne diese Werte greift lokal ein In-Memory-Fallback |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | dashboard.stripe.com → Entwickler → API-Schlüssel bzw. Webhooks |
| `NEXT_PUBLIC_APP_URL` | lokal `http://localhost:3000`, produktiv die echte Domain |

## Scripts

```bash
pnpm dev           # Dev-Server (localhost:3000)
pnpm build         # Production Build
pnpm start         # Production Server (nach build)
pnpm lint          # ESLint
pnpm lint:fix      # ESLint mit Auto-Fix
pnpm format        # Prettier
pnpm format:check  # Prettier Check (wie in CI)
pnpm typecheck     # TypeScript Check
pnpm db:types      # Supabase Types generieren (src/types/database.ts)
```

Vor jedem Commit lokal `format:check`, `lint`, `typecheck` und bei UI-relevanten Änderungen `build` durchlaufen lassen — genau das prüft auch die CI.

## Projektstruktur

```text
src/
  app/                    → Routing, Pages, Layouts (App Router)
    suche/                → Jobsuche + Job-Detailseite
    bewerbungen/          → Bewerbungs-Pipeline (Status-Filter, Notizen)
    profil/               → Profil, Lebenslauf-Upload, Credits
    credits/              → Credit-Kauf (Stripe Checkout)
    api/                  → Autocomplete-Routen (Berufe, Orte), Stripe-Webhook
  components/
    shared/               → Button, Container, Section, Input, Textarea
    layout/               → Header, Footer, Navigation
    home/                 → Startseiten-Sektionen (Scroll-Experience, FAQ)
    suche/, jobs/, bewerbungen/, profile/, credits/, auth/  → Feature-Komponenten
  hooks/                  → Globale Custom Hooks (z. B. Autocomplete-Debounce)
  lib/
    supabase/             → Server-/Browser-Clients, Admin-Client (Service-Role)
    ai/                   → Gemini-Anbindung (Job-Zusammenfassung, Anschreiben, CV-Parsing)
    jobs/                 → Arbeitsagentur-API, Orte-Lookup, Job-Summary-Cache
    usage.ts, quota.ts, credits.ts, pro.ts  → Freemium-Kontingente + Pro-Bypass
    stripe.ts             → Stripe-Client
  types/
    database.ts           → Auto-generiert von Supabase (`pnpm db:types`)
  actions/                → Server Actions (Mutationen, immer mit Zod-Validierung)
  constants/              → App-Name, Freemium-Limits, Credit-Pakete
  proxy.ts                → Supabase Auth Session-Refresh (Middleware)
supabase/
  migrations/             → SQL-Migrationen (Review per PR, Ausführung manuell im Dashboard)
```

Eine ausführliche, laufend gepflegte Landkarte aller Features samt Datei-Zuordnung steht in [`CLAUDE.md`](./CLAUDE.md) — das ist die primäre Referenz für neue Features und für KI-gestützte Entwicklung in diesem Repo.

## Regeln (maschinell erzwungen)

- **Max 300 Zeilen pro Datei** — ESLint `max-lines`
- **Kein `any`** — ESLint `@typescript-eslint/no-explicit-any`
- **Kein `console.log`** — ESLint `no-console` (nur `.error`/`.warn` erlaubt)
- **Named Exports only** — kein `export default` (Ausnahme: `page.tsx`, `layout.tsx` u. ä. Next.js-Konventionsdateien)
- **Formatting** — Prettier + `prettier-plugin-tailwindcss`
- **Conventional Commits** — commitlint als Git-Hook
- **CI** — Prettier + ESLint + tsc + Build bei jedem PR
- **Secret-Scan** — gitleaks bei jedem PR
- **TypeScript strict + noUncheckedIndexedAccess**

Ausführliche Begründung und weitere Konventionen (Komponenten-Architektur, Backend/RLS, Security) stehen in `CLAUDE.md`.

## Farbschema anpassen

Alle Farben sind CSS-Variablen in `src/app/globals.css` unter `:root`. Gesamtes Farbschema ändern = nur diese eine Stelle anpassen.

```css
/* Akzentfarbe (aktuell Terracotta-Orange) */
--accent: #cc785c;
--accent-light: #e8b8a4;
--accent-dark: #a35a41;
```

## Deployment

Produktiv auf Vercel, verbunden mit diesem Repo. `main` ist branch-protected — Änderungen laufen über Pull Requests, jeder PR bekommt automatisch eine Vercel-Preview-Deployment mit echter Datenbank. Nach dem Merge deployt Vercel `main` automatisch.

SQL-Migrationen in `supabase/migrations/` werden per PR reviewt und danach manuell im Supabase-Dashboard (SQL Editor) ausgeführt — es gibt keine automatische Migrations-Pipeline.
