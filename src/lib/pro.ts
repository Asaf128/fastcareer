/**
 * Pro-Status: Eine Bezahlschiene gibt es noch nicht — einzig die
 * Admin-E-Mail ist automatisch Pro und nutzt alle KI-Features unbegrenzt.
 * Alle anderen Konten (angemeldet oder nicht) haben dieselben
 * Freemium-Tageskontingente.
 */
const PRO_EMAILS = new Set(['ceb.asaf@gmail.com'])

export function isProUser(email: string | null | undefined): boolean {
  return email != null && PRO_EMAILS.has(email.toLowerCase())
}
