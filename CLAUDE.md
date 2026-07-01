# Claude Code — Projektregeln

Diese Regeln gelten für alle Arbeiten in diesem Repo. Sie sind eine Zusammenfassung der vollständigen Instruction Files (~/.claude/instructions/) für Umgebungen ohne lokales ~/.claude/.

## Stack

Next.js 16 (App Router) · TypeScript strict · Tailwind CSS v4 · Supabase · Vercel · pnpm

## Code-Regeln (maschinell erzwungen via ESLint)

- **Max 300 Zeilen pro Datei** — bei Überschreitung sofort splitten (UI → Sub-Komponenten, Logik → Custom Hook)
- **Kein `any`** — immer korrekte Types, Union Types für feste Werte
- **Named Exports only** — kein `export default` (Ausnahme: `page.tsx`, `layout.tsx`)
- **Kein `console.log`** — nur `console.error` / `console.warn` erlaubt

## Styling

- **Nie Hex-Werte in Komponenten** — ausschließlich Tailwind-Klassen mit CSS-Variablen (`bg-accent`, `text-foreground`, etc.)
- Alle Farben in `src/app/globals.css` unter `:root` — dort einmalig ändern, überall wirksam
- Kein `style={{}}` für wiederkehrende Elemente — immer Tailwind

## Komponenten-Architektur

- **Shared Base Components** — `Button`, `Container`, `Section` in `src/components/shared/` sind die einzige Quelle. Nie ein gleiches UI-Element zweimal mit anderen Classes bauen
- Feature-Ordner unter `src/components/[feature]/` — max 6-8 Dateien pro Ordner
- `'use client'` so tief wie möglich — Server Component ist der Default

## Backend / Daten

- **Daten immer über den Server** — kein Supabase-Zugriff aus Client Components für Mutationen
- **Zod in jeder Server Action** — Input validieren bevor irgendwas passiert
- **User-ID aus Session, nie aus Input** — `supabase.auth.getUser()`, nicht aus dem Request-Body
- **RLS auf jeder Supabase-Tabelle** — ohne RLS kein Deploy

## Security

- `.env.local` niemals committen — nur `.env.example` ist im Repo
- `NEXT_PUBLIC_` nur für wirklich öffentliche Werte — `SERVICE_ROLE_KEY` niemals `NEXT_PUBLIC_`
- Security Headers sind in `next.config.ts` gesetzt — nicht entfernen

## Git

- **Conventional Commits** — `feat:`, `fix:`, `style:`, `refactor:`, `chore:`, `docs:`, `perf:`
- Commit-Message kurz, prägnant, auf Deutsch
- Immer über PR auf main — nie direkt pushen
- Nach jeder abgeschlossenen Änderung automatisch committen und pushen

## Auto-Commit

Nach JEDER abgeschlossenen Änderung automatisch committen und pushen ohne dass der User es extra sagen muss. Mit `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>` am Ende.

## Änderungs-Zusammenfassung

Nach jeder abgeschlossenen Aufgabe (nach Push/Commit) eine kompakte Zusammenfassung ausgeben — was geändert wurde und warum. Format: kurze Einleitung, dann Tabelle oder Aufzählung. Nur die wesentlichen Punkte. Beispiel:

> Gepusht. Zusammenfassung:
>
> | Datei / Punkt    | Was & Warum                                               |
> | ---------------- | --------------------------------------------------------- |
> | `ci.yml`         | `--ignore-scripts` — Build-Script-Fehler in pnpm v10      |
