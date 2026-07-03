import { ImageResponse } from 'next/og'

// Social-Media-Vorschaubild (WhatsApp, LinkedIn, X …): wird beim Build
// einmalig gerendert und von Next automatisch als og:image registriert.
// Farben = Brand-Tokens aus globals.css (--accent / --background); CSS-
// Variablen sind hier nicht verfügbar, daher die Werte direkt.

export const alt = 'Fastcareer: Jobs finden in Sekunden'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const ACCENT = '#cc785c'
const CREAM = '#fbfaf8'

// Playfair Display (die Display-Schrift der Website) zur Build-Zeit von
// Google Fonts laden; schlägt der Fetch fehl, fällt satori auf die
// eingebaute Sans zurück, statt den Build zu brechen
async function loadPlayfairDisplay(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700',
      // Alter User-Agent → Google liefert TTF statt WOFF2 (satori kann kein WOFF2)
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1)' } }
    ).then((response) => response.text())
    const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1]
    if (!url) return null
    return await fetch(url).then((response) => response.arrayBuffer())
  } catch {
    return null
  }
}

// Dezente Kästchen wie im Tetris-Hero: Position/Größe in px
const SQUARES = [
  { top: 60, left: 80, size: 44 },
  { top: 160, left: 200, size: 28 },
  { top: 480, left: 130, size: 56 },
  { top: 90, left: 1040, size: 36 },
  { top: 300, left: 1100, size: 26 },
  { top: 500, left: 990, size: 48 },
]

export default async function Image() {
  const playfair = await loadPlayfairDisplay()

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ACCENT,
        fontFamily: 'Playfair Display',
        position: 'relative',
      }}
    >
      {SQUARES.map((square) => (
        <div
          key={`${square.top}-${square.left}`}
          style={{
            position: 'absolute',
            top: square.top,
            left: square.left,
            width: square.size,
            height: square.size,
            borderRadius: 6,
            backgroundColor: CREAM,
            opacity: 0.14,
          }}
        />
      ))}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            fontSize: 150,
            fontWeight: 700,
            color: CREAM,
            letterSpacing: 14,
            lineHeight: 1,
          }}
        >
          FAST
        </div>
        <div
          style={{
            fontSize: 92,
            fontWeight: 700,
            color: CREAM,
            letterSpacing: 12,
            lineHeight: 1.15,
          }}
        >
          CAREER
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 32,
            color: CREAM,
            opacity: 0.9,
          }}
        >
          Jobs finden in Sekunden, Anschreiben auf Knopfdruck
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: playfair
        ? [{ name: 'Playfair Display', data: playfair, weight: 700, style: 'normal' }]
        : undefined,
    }
  )
}
