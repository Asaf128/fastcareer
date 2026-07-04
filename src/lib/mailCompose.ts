interface MailComposeParams {
  to: string
  subject: string
  body: string
}

export interface MailComposeLink {
  href: string
  label: string
  /** true für Web-Compose-Links (neuer Tab), false für mailto: (kein neuer Tab nötig) */
  opensInNewTab: boolean
}

// Web-Compose-Links großer Mail-Provider — NUR für Windows relevant: dort
// gibt es anders als bei macOS/iOS/Android meist keinen konfigurierten
// mailto:-Handler und die meisten Nutzer mailen ohnehin im Browser.
// Für alle anderen bzw. unbekannten Domains (iCloud, GMX, web.de, ...)
// bleibt der universelle mailto:-Link als Fallback.
const WEB_COMPOSERS: ReadonlyArray<{
  domains: readonly string[]
  label: string
  buildHref: (params: MailComposeParams) => string
}> = [
  {
    domains: ['gmail.com', 'googlemail.com'],
    label: 'Mit Gmail öffnen',
    buildHref: ({ to, subject, body }) =>
      `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  },
  {
    domains: ['outlook.com', 'hotmail.com', 'live.com', 'msn.com'],
    label: 'Mit Outlook öffnen',
    buildHref: ({ to, subject, body }) =>
      `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  },
  {
    domains: ['yahoo.com', 'yahoo.de', 'ymail.com'],
    label: 'Mit Yahoo Mail öffnen',
    buildHref: ({ to, subject, body }) =>
      `https://compose.mail.yahoo.com/?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  },
]

function mailtoFallback({ to, subject, body }: MailComposeParams): MailComposeLink {
  return {
    href: `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    label: 'Per E-Mail bewerben',
    opensInNewTab: false,
  }
}

/**
 * Auf Windows: Web-Compose-Link des Mail-Anbieters, mit dem sich der
 * Nutzer angemeldet hat (erkannt an der Domain der Login-Mail). Auf
 * macOS/iOS/Android bleibt mailto: — dort öffnet das zuverlässig die vom
 * Nutzer eingestellte Standard-Mail-App im Compose-Modus (getestet auf
 * iPhone), während Windows meist keinen mailto:-Handler konfiguriert hat.
 */
export function getMailLink(
  isWindows: boolean,
  userEmail: string | null | undefined,
  params: MailComposeParams
): MailComposeLink {
  if (!isWindows) return mailtoFallback(params)
  const domain = userEmail?.split('@')[1]?.toLowerCase()
  const provider = domain ? WEB_COMPOSERS.find((p) => p.domains.includes(domain)) : undefined
  if (!provider) return mailtoFallback(params)
  return { href: provider.buildHref(params), label: provider.label, opensInNewTab: true }
}
