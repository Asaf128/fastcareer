# Claude Code — Projektregeln

Diese Regeln gelten für alle Arbeiten in diesem Repo. Sie sind eine Zusammenfassung der vollständigen Instruction Files (~/.claude/instructions/) für Umgebungen ohne lokales ~/.claude/.

## Stack

Next.js 16 (App Router) · TypeScript strict · Tailwind CSS v4 · Supabase · Vercel · pnpm

## Struktur-Landkarte

- Startseite: `src/app/page.tsx`
- Jobsuche (Formular + Ergebnisliste): `src/app/suche/page.tsx`
- Job-Detailseite: `src/app/suche/[refnr]/page.tsx` (eigener Loading-State: `src/app/suche/[refnr]/loading.tsx`)
- Startseite Typing-Effekt (Headline/Subline): `src/components/home/TypingHeadline.tsx`
- Startseite Tetris-Hintergrund (Hero, Canvas, Pfeiltasten spielbar): `src/components/home/TetrisBackground.tsx`
- Letzte Suchen (localStorage): `src/components/home/RecentSearches.tsx`, `src/lib/recentSearches.ts` (Speichern beim Submit im JobSearchForm)
- Startseiten-Sektionen (Scroll-Experience "So funktioniert's", FAQ mit JSON-LD): `src/components/home/ScrollShowcase.tsx` + `src/components/home/showcase/` (Schritt-Daten `steps.tsx`, UI-Mock-Visuals `visuals.tsx`), `src/components/home/FaqSection.tsx`
- Match-Score (KI vergleicht Profil mit Anforderungen, on demand): `src/lib/ai/matchScore.ts`, `src/actions/matchScore.actions.ts`, `src/components/jobs/MatchScore.tsx`
- Impressum: `src/app/impressum/page.tsx`
- Datenschutz: `src/app/datenschutz/page.tsx`
- SEO (robots/sitemap): `src/app/robots.ts`, `src/app/sitemap.ts`; Social-Vorschaubild (og:image, zur Build-Zeit gerendert): `src/app/opengraph-image.tsx`
- API-Route Orte-Autocomplete: `src/app/api/orte/route.ts`
- API-Route Berufe-Autocomplete (BA-Suggest-Service): `src/app/api/berufe/route.ts`, `src/lib/jobs/berufe.ts`; gemeinsamer Debounce-Hook `src/hooks/useSuggestions.ts`, Dropdown `src/components/suche/SuggestionList.tsx`
- Header (Login-Status, Nav): `src/components/layout/Header.tsx` — delegiert an `HeaderNav.tsx` (Desktop-Inline-Links / Mobil-Profil-Icon) und `MobileProfileMenu.tsx` (Vollbild-Overlay: Profil/Bewerbungen/Abmelden)
- Footer/Layout: `src/components/layout/Footer.tsx`
- Shared Base Components (Button, Container, Section, Input, Textarea, Checkbox): `src/components/shared/`
- Jobsuche-Komponenten (JobCard, JobSearchForm): `src/components/suche/`
- Login (6-stelliger E-Mail-Code, zweistufiges Formular): `src/app/login/page.tsx`, `src/components/auth/LoginForm.tsx`
- Auth-Callback (Code-Exchange, nur noch Fallback für ältere Magic-Link-E-Mails): `src/app/auth/callback/route.ts`
- Meine Bewerbungen (Status-Pipeline gespeichert/beworben/interview/zusage/absage, Filter-Chips, Badges): `src/app/bewerbungen/page.tsx`; Status-Typen/Labels in `src/types/application.types.ts`. `/favoriten` ist ein reiner Redirect dorthin (alte Links bleiben gültig); Status-Filter mit sofortigem optimistischem Feedback (Desktop-Chips + mobiler Pfeile/Swipe-Wechsler): `src/components/bewerbungen/StatusFilterPager.tsx`
- Auth Server Actions (Code anfordern via `signInWithOtp`, Code prüfen via `verifyOtp`, Logout): `src/actions/auth.actions.ts`
- Arbeitsagentur-API-Anbindung: `src/lib/jobs/arbeitsagentur.ts`, `src/lib/jobs/arbeitsagentur-detail.ts`
- Orte/PLZ-Lookup: `src/lib/jobs/openplz.ts`
- Supabase Clients: `src/lib/supabase/` (`server.ts` Session-Client, `admin.ts` Service-Role-Client für Cache-Inserts & Konto-Löschung — nie im Client importieren)
- Konto-Löschung (DSGVO — Storage + DB + Auth-User): `src/actions/account.actions.ts`, UI: `src/components/profile/DeleteAccountSection.tsx`
- SQL-Migrationen (werden via PR reviewt, dann manuell/per MCP angewendet): `supabase/migrations/`
- Supabase-Projekt: geteilt mit "Aurum Watches" (Free-Tier-Limit); Tabellen `applications`, `profiles`, `job_summaries` sowie Storage-Bucket `cvs` gehören zu Fastcareer. `favorites` ist die alte Vorgänger-Tabelle von `applications` — Daten migriert, Drop-Migration liegt in `supabase/migrations/` (Ausführung nach User-OK)
- Job-Types: `src/types/job.types.ts`
- Bewerbungs-Types: `src/types/application.types.ts`
- Profil-Types: `src/types/profile.types.ts`
- KI-Types (Job-Zusammenfassung, CV-Parsing): `src/types/ai.types.ts`
- KI-Anbindung (Google Gemini via Vertex AI — **nicht** Claude/Anthropic, siehe Projekt-Memory): `src/lib/ai/` (`genai.ts` Client, `summarizeJob.ts`, `generateCoverLetter.ts`, `parseCv.ts` + `normalizeCvDates.ts`, `rateLimit.ts` — async, Upstash Redis mit In-Memory-Fallback)
- Anschreiben-Generierung on demand (auf Klick, sofort gespeichert — nie beim Seitenaufbau): `src/actions/coverLetter.actions.ts`
- Job-Zusammenfassung-Cache (Read-through, `job_summaries`-Tabelle): `src/lib/jobs/jobSummaryCache.ts`
- Freemium-Tageskontingente (3/Tag pro Feature: Zusammenfassung/Match/Anschreiben/CV; gilt für anonyme UND angemeldete Nutzer — anonym per IP, angemeldet per User-ID; Redis-Tageszähler): `src/lib/usage.ts`, gemeinsamer Upstash-Client `src/lib/redis.ts`, Pro-Status (Admin-E-Mail = automatisch Pro, unbegrenzt) `src/lib/pro.ts`, Limit-UI + Rest-Anzeige `src/components/jobs/UsageLimit.tsx`
- Kontingent-Kaskade + Credit-Pakete (Pro → 3 Gratis/Tag → gekaufte Credits; Guthaben `credit_balances`, Verbrauchs-Log mit Dedupe `credit_usages`, Kauf-Log `credit_purchases`, atomare Postgres-Funktionen `consume_credit`/`refund_credit`/`grant_credits`): `src/lib/quota.ts` (Kaskade), `src/lib/credits.ts` (RPC-Wrapper); durchgesetzt in `suche/[refnr]/page.tsx` + den KI-Server-Actions
- Stripe-Zahlung (Einmalkauf, kein Abo; Pakete in `src/constants/creditPackages.ts`): Client `src/lib/stripe.ts`, Checkout-Action `src/actions/checkout.actions.ts`, Webhook (einziger Ort der Gutschrift, idempotent) `src/app/api/stripe/webhook/route.ts`; Env `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`
- Credits-Kaufseite + Danke-Seite: `src/app/credits/page.tsx`, `src/app/credits/danke/page.tsx`, Komponenten `src/components/credits/` (PackageCard, BuyCreditsButton); Guthaben im Profil `src/components/profile/CreditsSection.tsx`
- AGB (inkl. Widerrufsbelehrung für Credit-Käufe): `src/app/agb/page.tsx`
- Job-Detailseite-Komponenten (Kopf+Stern, KI-Zusammenfassung, Anschreiben inkl. editierbarem Briefkopf `CoverLetterHeadFields` und PDF-Erzeugung `coverLetterPdf.ts`, Bewerbungs-Checkliste, Original-Link): `src/components/jobs/`
- Favicon: `src/app/icon.svg` (FAST/CAREER-Schriftzug in Brand-Farben)
- Bewerbungen Server Actions (speichern/entfernen/Checkliste/Notizen/Anschreiben): `src/actions/applications.actions.ts`
- Profil-Seite + Lebenslauf-Upload: `src/app/profil/page.tsx`, `src/components/profile/` (`ProfileForm`, `WorkExperienceFields`, `EducationFields`, `SkillsInput`, `CvUpload`)
- Profil Server Actions (speichern, CV hochladen & auslesen): `src/actions/profile.actions.ts`
- Admin-Analytics (nur Admin-E-Mail, `src/lib/adminAccess.ts`; Nutzerübersicht mit Aktivität/Job-Ansichten/Bewerbungen/Matches/Credits, Daten-Aggregation über Service-Role): `src/app/analytics/page.tsx`, `src/lib/adminAnalytics.ts`, `src/components/analytics/` (AnalyticsStats, UsersTable); Nav-Link in `HeaderNav.tsx`/`MobileProfileMenu.tsx`
- Job-Ansichten-Tracking (Tabelle `job_views`, Log beim Öffnen der Job-Detailseite, nur angemeldete Nutzer): `src/lib/jobs/jobViews.ts`, Aufruf in `suche/[refnr]/page.tsx`, Migration `supabase/migrations/20260705_job_views.sql`
- Navigation/Config: `src/constants/`

(Pflege: bei jeder strukturrelevanten Änderung — neue Seite, neuer Feature-Ordner, verschobene Komponente — diesen Abschnitt im selben Schritt aktualisieren.)

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

## Pre-Commit-Checks (Pflicht vor JEDEM Commit)

Bevor committet/gepusht wird, IMMER lokal durchlaufen lassen und Fehler VORHER fixen — nicht erst die CI melden lassen:

```bash
pnpm format:check   # Prettier — bei Fehlern: pnpm format, dann Diff prüfen
pnpm lint           # ESLint --max-warnings=0
pnpm typecheck      # tsc --noEmit
pnpm build          # nur bei Änderungen die den Build beeinflussen könnten
```

Zusätzlich bei UI-Änderungen: kurz auf offensichtliche Accessibility-Fehler prüfen (fehlende `aria-label`/`label` bei `input`/`select`, fehlende `alt`-Texte) — diese Dinge fallen sonst erst durch Tools wie axe/Edge DevTools auf, nicht durch `pnpm build`.

Alle 4 Checks müssen sauber durchlaufen, bevor committet wird. Erst dann `git add` + `git commit` + `git push`.

## Auto-Commit

Nach JEDER abgeschlossenen Änderung automatisch committen und pushen ohne dass der User es extra sagen muss. Mit `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>` am Ende.

## Änderungs-Zusammenfassung

Nach jeder abgeschlossenen Aufgabe (nach Push/Commit) eine kompakte Zusammenfassung ausgeben — was geändert wurde und warum. Format: kurze Einleitung, dann Tabelle oder Aufzählung. Nur die wesentlichen Punkte. Beispiel:

> Gepusht. Zusammenfassung:
>
> | Datei / Punkt    | Was & Warum                                               |
> | ---------------- | --------------------------------------------------------- |
> | `ci.yml`         | `--ignore-scripts` — Build-Script-Fehler in pnpm v10      |
