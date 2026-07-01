# template-next-supabase

Template-Repo für neue Projekte. Einmal klonen, loslegen — alle Regeln sind von Tag 0 erzwungen.

## Stack

| Kategorie | Technologie |
| --------- | ----------- |
| Framework | Next.js 16 (App Router) |
| Sprache | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Backend/DB | Supabase (Postgres + Auth + Storage) |
| Hosting | Vercel |
| Animationen | Framer Motion + Lenis |
| Icons | Lucide React |
| Validierung | Zod |

## Projekt starten

```bash
# 1. Dependencies installieren
pnpm install

# 2. Env-Datei anlegen
cp .env.example .env.local
# → Werte im Supabase Dashboard ausfüllen

# 3. Dev-Server starten
pnpm dev
```

## Scripts

```bash
pnpm dev           # Dev-Server (localhost:3000)
pnpm build         # Production Build
pnpm lint          # ESLint
pnpm lint:fix      # ESLint mit Auto-Fix
pnpm format        # Prettier
pnpm format:check  # Prettier Check (wie in CI)
pnpm typecheck     # TypeScript Check
pnpm db:types      # Supabase Types generieren (Project ID in package.json setzen)
```

## Neues Projekt einrichten

1. **Template verwenden** — GitHub → "Use this template" → neues Repo erstellen
2. **`.env.local` anlegen** — `cp .env.example .env.local` + Supabase-Werte eintragen
3. **Supabase-Types generieren** — `YOUR_PROJECT_ID` in `package.json` ersetzen, dann `pnpm db:types`
4. **Vercel verbinden** — Repo in Vercel importieren, Env-Vars setzen
5. **GitHub einrichten:**
   - Repo Settings → Secrets → Actions: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`
   - Repo Settings → Branches → Branch Protection auf `main` aktivieren (PR + CI required)
   - Repo Settings → Security → Dependabot + Secret Scanning aktivieren
6. **`APP_NAME` in `src/constants/config.ts` anpassen**
7. **Metadata in `src/app/layout.tsx` anpassen**

## Projektstruktur

```text
src/
  app/                    → Routing, Pages, Layouts
  components/
    shared/               → Button, Container, Section
    layout/               → Header, Footer, Navigation
    [feature]/            → Feature-Komponenten
  hooks/                  → Globale Custom Hooks
  lib/
    supabase/
      client.ts           → Browser Supabase Client
      server.ts           → Server Supabase Client
    cn.ts                 → clsx + tailwind-merge
    formatPrice.ts        → Preis-Formatierung (Cent → EUR)
  types/
    database.ts           → Auto-generiert von Supabase
  constants/
    config.ts             → App-Name, App-URL
    navigation.ts         → Nav-Links
  actions/                → Server Actions
  middleware.ts           → Supabase Auth Session-Refresh
```

## Regeln (maschinell erzwungen)

- **Max 300 Zeilen pro Datei** — ESLint `max-lines`
- **Kein `any`** — ESLint `@typescript-eslint/no-explicit-any`
- **Kein `console.log`** — ESLint `no-console` (nur `.error`/`.warn` erlaubt)
- **Formatting** — Prettier + `prettier-plugin-tailwindcss`
- **Conventional Commits** — commitlint als Git-Hook
- **CI** — Prettier + ESLint + tsc + Build bei jedem PR (parallel)
- **Secret-Scan** — gitleaks bei jedem PR
- **TypeScript strict + noUncheckedIndexedAccess**

## Farbschema anpassen

Alle Farben als CSS-Variablen in `src/app/globals.css` unter `:root`. Gesamtes Farbschema ändern = nur diese eine Stelle anpassen.

```css
/* Akzentfarbe tauschen — alles andere passt sich an */
--accent: #c5a028;
--accent-light: #e8d5a3;
--accent-dark: #8a6e1a;
```
