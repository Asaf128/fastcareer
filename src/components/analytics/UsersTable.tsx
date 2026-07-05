import { Check, Minus } from 'lucide-react'
import { formatPrice } from '@/lib/formatPrice'
import type { AdminUserRow } from '@/lib/adminAnalytics'

interface UsersTableProps {
  users: AdminUserRow[]
}

const dateTimeFormat = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

function formatDateTime(iso: string | null): string {
  return iso ? dateTimeFormat.format(new Date(iso)) : '—'
}

const HEAD_CELL = 'px-3 py-2.5 text-left text-xs font-medium whitespace-nowrap'
const CELL = 'px-3 py-2.5 whitespace-nowrap'

export function UsersTable({ users }: UsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="border-border bg-surface rounded-xl border p-10 text-center">
        <p className="text-text-secondary text-sm">Noch keine Nutzer registriert.</p>
      </div>
    )
  }

  return (
    <div className="border-border overflow-x-auto rounded-xl border">
      <table className="min-w-full text-sm">
        <thead className="bg-surface text-text-secondary">
          <tr>
            <th className={HEAD_CELL}>Nutzer</th>
            <th className={HEAD_CELL}>Registriert</th>
            <th className={HEAD_CELL}>Letzter Login</th>
            <th className={HEAD_CELL}>Letzte Aktivität</th>
            <th className={HEAD_CELL}>Bewerbungen</th>
            <th className={HEAD_CELL}>Matches</th>
            <th className={HEAD_CELL}>Anschreiben</th>
            <th className={HEAD_CELL}>CV</th>
            <th className={HEAD_CELL}>Credits</th>
            <th className={HEAD_CELL}>Käufe</th>
          </tr>
        </thead>
        <tbody className="divide-border bg-background divide-y">
          {users.map((user) => (
            <tr key={user.id}>
              <td className={CELL}>
                <p className="text-foreground font-medium">{user.email}</p>
                {user.fullName && <p className="text-text-secondary text-xs">{user.fullName}</p>}
              </td>
              <td className={`${CELL} text-text-secondary tabular-nums`}>
                {formatDateTime(user.registeredAt)}
              </td>
              <td className={`${CELL} text-text-secondary tabular-nums`}>
                {formatDateTime(user.lastSignInAt)}
              </td>
              <td className={`${CELL} text-foreground tabular-nums`}>
                {formatDateTime(user.lastActivityAt)}
              </td>
              <td className={`${CELL} text-foreground tabular-nums`}>
                {user.applicationCount}
                {user.appliedCount > 0 && (
                  <span className="text-text-secondary text-xs">
                    {' '}
                    ({user.appliedCount} beworben)
                  </span>
                )}
              </td>
              <td className={`${CELL} text-foreground tabular-nums`}>{user.matchCount}</td>
              <td className={`${CELL} text-foreground tabular-nums`}>{user.coverLetterCount}</td>
              <td className={CELL}>
                {user.hasCv ? (
                  <Check className="text-success h-4 w-4" aria-label="CV hochgeladen" />
                ) : (
                  <Minus className="text-text-secondary h-4 w-4" aria-label="Kein CV" />
                )}
              </td>
              <td className={`${CELL} text-foreground tabular-nums`}>{user.creditBalance}</td>
              <td className={`${CELL} text-foreground tabular-nums`}>
                {user.purchasedCents > 0 ? formatPrice(user.purchasedCents) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
