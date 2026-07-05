import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { readAiCosts, readUserAiCosts } from '@/lib/ai/costTracking'

export interface AdminUserRow {
  id: string
  email: string
  fullName: string | null
  registeredAt: string
  lastSignInAt: string | null
  /** Jüngste Job-Ansicht, Bewerbungs- oder Credit-Aktivität */
  lastActivityAt: string | null
  lastJobViewAt: string | null
  jobViewCount: number
  applicationCount: number
  appliedCount: number
  matchCount: number
  coverLetterCount: number
  hasCv: boolean
  creditBalance: number
  purchasedCents: number
  aiCostTodayUsd: number
  aiCostTotalUsd: number
}

export interface AdminOverviewStats {
  totalUsers: number
  activeLast7Days: number
  totalApplications: number
  cachedSummaries: number
  revenueCents: number
  /** Gemini-Kosten in USD (Vertex rechnet in USD ab), heute ab 0 Uhr Berlin */
  aiCostTodayUsd: number
  aiCostTotalUsd: number
}

export interface AdminAnalytics {
  stats: AdminOverviewStats
  users: AdminUserRow[]
}

function laterOf(a: string | null, b: string | null): string | null {
  if (!a) return b
  if (!b) return a
  return a > b ? a : b
}

/**
 * Aggregiert alle Nutzerdaten für das Admin-Dashboard über den
 * Service-Role-Client (bypasst RLS — Aufruf nur nach Admin-Check!).
 * Achtung: Das Supabase-Projekt ist mit "Aurum Watches" geteilt,
 * auth.users kann daher auch Konten des Shops enthalten.
 */
export async function loadAdminAnalytics(): Promise<AdminAnalytics> {
  const supabase = createAdminClient()

  const [
    usersResult,
    profilesResult,
    applicationsResult,
    coverLettersResult,
    matchesResult,
    balancesResult,
    purchasesResult,
    usagesResult,
    summariesResult,
    viewsResult,
    aiCosts,
  ] = await Promise.all([
    supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    supabase.from('profiles').select('id, full_name, cv_path'),
    supabase.from('applications').select('user_id, updated_at, applied'),
    supabase.from('applications').select('user_id').not('cover_letter', 'is', null),
    supabase.from('applications').select('user_id').not('match_score', 'is', null),
    supabase
      .from('credit_balances')
      .select('user_id, summary_credits, match_credits, letter_credits'),
    supabase.from('credit_purchases').select('user_id, amount_cents'),
    supabase.from('credit_usages').select('user_id, created_at'),
    supabase.from('job_summaries').select('job_refnr', { count: 'exact', head: true }),
    supabase.from('job_views').select('user_id, created_at'),
    readAiCosts(),
  ])

  if (usersResult.error) throw new Error('Nutzerliste konnte nicht geladen werden.')

  const userAiCosts = await readUserAiCosts(usersResult.data.users.map((user) => user.id))

  const profileById = new Map((profilesResult.data ?? []).map((profile) => [profile.id, profile]))
  const balanceByUser = new Map(
    (balancesResult.data ?? []).map((balance) => [balance.user_id, balance])
  )

  const applicationStats = new Map<
    string,
    { count: number; applied: number; lastUpdatedAt: string | null }
  >()
  for (const application of applicationsResult.data ?? []) {
    const entry = applicationStats.get(application.user_id) ?? {
      count: 0,
      applied: 0,
      lastUpdatedAt: null,
    }
    entry.count += 1
    if (application.applied) entry.applied += 1
    entry.lastUpdatedAt = laterOf(entry.lastUpdatedAt, application.updated_at)
    applicationStats.set(application.user_id, entry)
  }

  const coverLetterCounts = new Map<string, number>()
  for (const row of coverLettersResult.data ?? []) {
    coverLetterCounts.set(row.user_id, (coverLetterCounts.get(row.user_id) ?? 0) + 1)
  }

  const matchCounts = new Map<string, number>()
  for (const row of matchesResult.data ?? []) {
    matchCounts.set(row.user_id, (matchCounts.get(row.user_id) ?? 0) + 1)
  }

  const purchasedCentsByUser = new Map<string, number>()
  for (const purchase of purchasesResult.data ?? []) {
    purchasedCentsByUser.set(
      purchase.user_id,
      (purchasedCentsByUser.get(purchase.user_id) ?? 0) + purchase.amount_cents
    )
  }

  const lastUsageByUser = new Map<string, string>()
  for (const usage of usagesResult.data ?? []) {
    const current = lastUsageByUser.get(usage.user_id) ?? null
    lastUsageByUser.set(usage.user_id, laterOf(current, usage.created_at) ?? usage.created_at)
  }

  // Solange die job_views-Migration nicht angewendet ist, liefert die Query
  // einen Fehler und data bleibt null — die Spalten zeigen dann einfach 0/—
  const viewStats = new Map<string, { count: number; lastViewedAt: string | null }>()
  for (const view of viewsResult.data ?? []) {
    const entry = viewStats.get(view.user_id) ?? { count: 0, lastViewedAt: null }
    entry.count += 1
    entry.lastViewedAt = laterOf(entry.lastViewedAt, view.created_at)
    viewStats.set(view.user_id, entry)
  }

  const users: AdminUserRow[] = usersResult.data.users.map((user) => {
    const profile = profileById.get(user.id)
    const balance = balanceByUser.get(user.id)
    const applications = applicationStats.get(user.id)
    const views = viewStats.get(user.id)
    return {
      id: user.id,
      email: user.email ?? '—',
      fullName: profile?.full_name ?? null,
      registeredAt: user.created_at,
      lastSignInAt: user.last_sign_in_at ?? null,
      lastActivityAt: laterOf(
        views?.lastViewedAt ?? null,
        laterOf(applications?.lastUpdatedAt ?? null, lastUsageByUser.get(user.id) ?? null)
      ),
      lastJobViewAt: views?.lastViewedAt ?? null,
      jobViewCount: views?.count ?? 0,
      applicationCount: applications?.count ?? 0,
      appliedCount: applications?.applied ?? 0,
      matchCount: matchCounts.get(user.id) ?? 0,
      coverLetterCount: coverLetterCounts.get(user.id) ?? 0,
      hasCv: !!profile?.cv_path,
      creditBalance: balance
        ? balance.summary_credits + balance.match_credits + balance.letter_credits
        : 0,
      purchasedCents: purchasedCentsByUser.get(user.id) ?? 0,
      aiCostTodayUsd: userAiCosts.get(user.id)?.todayUsd ?? 0,
      aiCostTotalUsd: userAiCosts.get(user.id)?.totalUsd ?? 0,
    }
  })

  // Aktivste Nutzer zuerst, Konten ohne jede Aktivität ans Ende
  users.sort((a, b) => {
    const activityA = a.lastActivityAt ?? a.lastSignInAt ?? ''
    const activityB = b.lastActivityAt ?? b.lastSignInAt ?? ''
    return activityB.localeCompare(activityA)
  })

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const stats: AdminOverviewStats = {
    totalUsers: users.length,
    activeLast7Days: users.filter(
      (user) => (user.lastActivityAt ?? user.lastSignInAt ?? '') >= sevenDaysAgo
    ).length,
    totalApplications: (applicationsResult.data ?? []).length,
    cachedSummaries: summariesResult.count ?? 0,
    revenueCents: (purchasesResult.data ?? []).reduce(
      (sum, purchase) => sum + purchase.amount_cents,
      0
    ),
    aiCostTodayUsd: aiCosts.todayUsd,
    aiCostTotalUsd: aiCosts.totalUsd,
  }

  return { stats, users }
}
