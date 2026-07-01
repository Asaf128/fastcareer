'use client'

import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import { History } from 'lucide-react'
import {
  getRecentSearchesSnapshot,
  getServerSearchesSnapshot,
  subscribeToRecentSearches,
} from '@/lib/recentSearches'

export function RecentSearches() {
  // useSyncExternalStore liest localStorage hydration-sicher: SSR liefert
  // eine leere Liste, der Client wechselt nach der Hydration auf die echte
  const searches = useSyncExternalStore(
    subscribeToRecentSearches,
    getRecentSearchesSnapshot,
    getServerSearchesSnapshot
  )

  if (searches.length === 0) return null

  return (
    <div className="mt-6 text-center">
      <p className="text-text-secondary mb-2 flex items-center justify-center gap-1.5 text-sm">
        <History className="h-4 w-4" />
        Deine letzten Suchen:
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {searches.map((search) => {
          const query = new URLSearchParams({ was: search.was })
          if (search.wo) query.set('wo', search.wo)
          return (
            <Link
              key={`${search.was}-${search.wo}`}
              href={`/suche?${query.toString()}`}
              className="border-border text-text-secondary hover:border-accent hover:text-accent rounded-full border px-4 py-1.5 text-sm transition-colors duration-150"
            >
              {search.was}
              {search.wo && <span className="opacity-70"> · {search.wo}</span>}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
