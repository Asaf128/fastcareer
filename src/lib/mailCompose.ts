interface MailComposeParams {
  to: string
  subject: string
  body: string
}

export interface MailComposeLink {
  href: string
  label: string
}

// Web-Compose-URLs großer Mail-Provider: registrieren auf Mobilgeräten
// Android App Links / iOS Universal Links, öffnen also direkt die
// zugehörige App im Compose-Modus statt nur den Browser. Für alle anderen
// bzw. unbekannten Domains (iCloud, GMX, web.de, t-online, ...) bleibt der
// universelle mailto:-Link, der überall funktioniert, aber keinen
// bestimmten Anbieter erkennt.
const PROVIDER_COMPOSERS: ReadonlyArray<{
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
  }
}

/**
 * Baut den passenden "Compose"-Link für den Mail-Anbieter, mit dem sich der
 * Nutzer angemeldet hat (erkannt an der Domain der Login-Mail, meist auch
 * die Bewerbungs-Adresse). Bekannte Anbieter öffnen so direkt die App im
 * Compose-Modus mit vorausgefülltem Empfänger/Betreff/Text; sonst der
 * universelle mailto:-Link als Fallback.
 */
export function getMailComposeLink(
  userEmail: string | null | undefined,
  params: MailComposeParams
): MailComposeLink {
  const domain = userEmail?.split('@')[1]?.toLowerCase()
  const provider = domain ? PROVIDER_COMPOSERS.find((p) => p.domains.includes(domain)) : undefined
  if (!provider) return mailtoFallback(params)
  return { href: provider.buildHref(params), label: provider.label }
}
