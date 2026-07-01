# Setup — Neues Projekt einrichten

Du hast dieses Template gerade geklont oder als Basis verwendet. Diese 6 Schritte sind nötig bevor du startest:

## 1. Dependencies installieren

```bash
pnpm install
```

## 2. Umgebungsvariablen

```bash
cp .env.example .env.local
```

Werte aus dem [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API eintragen:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` → `http://localhost:3000` für lokale Entwicklung

## 3. Supabase Types generieren

In `package.json` → `db:types` Script → `YOUR_PROJECT_ID` durch deine Supabase Project ID ersetzen, dann:

```bash
pnpm db:types
```

## 4. App-Infos anpassen

- `src/constants/config.ts` → `APP_NAME` ändern
- `src/app/layout.tsx` → `metadata` (title, description, siteName) anpassen
- `src/app/globals.css` → Akzentfarbe unter `:root` tauschen falls nötig

## 5. Vercel verbinden

1. Repo in [Vercel](https://vercel.com) importieren
2. Environment Variables im Vercel Dashboard setzen (gleiche Werte wie `.env.local`)

## 6. GitHub einrichten

**Secrets für CI** — Repo → Settings → Secrets → Actions → drei Secrets anlegen:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

**Branch Protection auf `main`** — Repo → Settings → Branches:

- „Require a pull request before merging" ✓
- „Require status checks to pass" → `Prettier`, `ESLint`, `TypeScript`, `Build` auswählen ✓
- „Do not allow bypassing" ✓

**Security** — Repo → Settings → Security:

- Dependabot alerts aktivieren ✓
- Secret Scanning + Push Protection aktivieren ✓

---

Du kannst diese Datei danach löschen oder behalten — sie hat keinen Einfluss auf die App.
