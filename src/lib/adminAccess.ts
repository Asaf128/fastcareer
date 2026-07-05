/**
 * Admin-Zugriff (Analytics-Dashboard): bewusst getrennt vom Pro-Status
 * in `pro.ts` — Pro-Nutzer bekommen nur unbegrenzte KI-Features,
 * Admin sieht zusätzlich nutzerübergreifende Daten. Deshalb steht hier
 * ausschließlich die eigene E-Mail, nie die komplette Pro-Liste.
 */
const ADMIN_EMAILS = new Set(['ceb.asaf@gmail.com'])

export function isAdminUser(email: string | null | undefined): boolean {
  return email != null && ADMIN_EMAILS.has(email.toLowerCase())
}
