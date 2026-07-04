'use client'

import { useEffect, useRef } from 'react'

const CELL = 28
const TICK_MS = 700
// Deckkraft der Kästchen, bewusst dezent, der Hero-Content bleibt gut lesbar
const STACK_ALPHA = 0.1
const PIECE_ALPHA = 0.22

// Die 7 Tetrominos als Zell-Offsets (x, y) um den Drehpunkt
const SHAPES: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  [
    [-1, 0],
    [0, 0],
    [1, 0],
    [2, 0],
  ], // I
  [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ], // O
  [
    [-1, 0],
    [0, 0],
    [1, 0],
    [0, 1],
  ], // T
  [
    [-1, 1],
    [0, 1],
    [0, 0],
    [1, 0],
  ], // S
  [
    [-1, 0],
    [0, 0],
    [0, 1],
    [1, 1],
  ], // Z
  [
    [-1, 0],
    [-1, 1],
    [0, 0],
    [1, 0],
  ], // J
  [
    [-1, 0],
    [0, 0],
    [1, 0],
    [1, 1],
  ], // L
]

interface Piece {
  cells: Array<[number, number]>
  x: number
  y: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

// Mobiles Ersatz-Muster: verstreute Accent-Kästchen, da Klicks auf Mobil mit
// Scrollen kollidieren. Positionen/Größen fest als Tailwind-Klassen, unten
// dichter gestapelt wie ein liegengebliebenes Tetris-Brett
const MOBILE_SQUARES = [
  'top-[8%] left-[12%] h-5 w-5 bg-accent/10',
  'top-[16%] right-[10%] h-4 w-4 bg-accent/15 [animation-delay:0.8s]',
  'top-[34%] left-[6%] h-3.5 w-3.5 bg-accent/10 [animation-delay:1.6s]',
  'top-[42%] right-[16%] h-6 w-6 bg-accent/10 [animation-delay:2.4s]',
  'top-[58%] left-[15%] h-4 w-4 bg-accent/15 [animation-delay:3.2s]',
  'top-[64%] right-[7%] h-5 w-5 bg-accent/10 [animation-delay:1.2s]',
  'bottom-[14%] left-[8%] h-6 w-6 bg-accent/15 [animation-delay:2s]',
  'bottom-[10%] right-[22%] h-4 w-4 bg-accent/10 [animation-delay:0.4s]',
  'bottom-[4%] left-[28%] h-7 w-7 bg-accent/15 [animation-delay:2.8s]',
  'bottom-[6%] right-[8%] h-7 w-7 bg-accent/10 [animation-delay:3.6s]',
  'bottom-[3%] left-[55%] h-5 w-5 bg-accent/15 [animation-delay:1.4s]',
] as const

/**
 * Dezenter Tetris-Hintergrund für die Hero-Sektion: Steine in Accent-Orange
 * fallen von selbst und stapeln sich am Boden. Maustaste über dem fallenden
 * Stein halten und seitlich ziehen schiebt ihn hin und her — alles bleibt
 * auf den Canvas begrenzt, der nur in der Hero-Sektion (dort wo die Steine
 * spawnen) liegt. Rein dekorativ, pointer-events bleiben nur auf dem Canvas
 * selbst aktiv, die Animation pausiert außerhalb des Viewports.
 */
export function TetrisBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Auf Mobil ist der Canvas ausgeblendet, Animations-Loop gar nicht erst starten
    if (!window.matchMedia('(min-width: 640px)').matches) return
    const maybeCanvas = canvasRef.current
    if (!maybeCanvas) return
    // Explizite Annotation: hält den non-null-Typ auch in den Closures
    const canvas: HTMLCanvasElement = maybeCanvas
    const context = canvas.getContext('2d')
    if (!context) return
    const ctx = context

    let cols = 0
    let rows = 0
    let viewWidth = 0
    let viewHeight = 0
    let board: number[][] = []
    let piece: Piece | null = null
    // Wird in setup() aus der CSS-Variable --accent gelesen (kein Hex im Code)
    let accent = ''
    let tickTimer: ReturnType<typeof setInterval> | undefined
    let isVisible = true

    function setup() {
      const parent = canvas.parentElement
      if (!parent) return
      const width = parent.clientWidth
      const height = parent.clientHeight
      viewWidth = width
      viewHeight = height
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.max(6, Math.floor(width / CELL))
      rows = Math.max(8, Math.floor(height / CELL))
      board = Array.from({ length: rows }, () => Array<number>(cols).fill(0))
      accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
      spawn()
      draw()
    }

    function spawn() {
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)]!
      piece = {
        cells: shape.map(([x, y]) => [x, y]),
        x: 2 + Math.floor(Math.random() * Math.max(1, cols - 4)),
        y: 0,
      }
      // Kein Platz mehr → Brett leeren und von vorn (Endlos-Deko)
      if (collides(piece, 0, 0)) {
        board = Array.from({ length: rows }, () => Array<number>(cols).fill(0))
      }
    }

    function collides(p: Piece, dx: number, dy: number, cells = p.cells): boolean {
      return cells.some(([cx, cy]) => {
        const x = p.x + cx + dx
        const y = p.y + cy + dy
        if (x < 0 || x >= cols || y >= rows) return true
        if (y < 0) return false
        return board[y]![x] === 1
      })
    }

    function merge(p: Piece) {
      for (const [cx, cy] of p.cells) {
        const x = p.x + cx
        const y = p.y + cy
        if (y >= 0 && y < rows && x >= 0 && x < cols) board[y]![x] = 1
      }
      board = board.filter((row) => row.some((cell) => cell === 0))
      while (board.length < rows) board.unshift(Array<number>(cols).fill(0))
    }

    function tick() {
      if (!piece) return
      if (collides(piece, 0, 1)) {
        merge(piece)
        spawn()
      } else {
        piece.y += 1
      }
      draw()
    }

    function draw() {
      if (!accent) return
      // CSS-Pixel statt canvas.width: der Kontext ist bereits DPR-skaliert
      ctx.clearRect(0, 0, viewWidth, viewHeight)
      ctx.fillStyle = accent

      ctx.globalAlpha = STACK_ALPHA
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (board[y]![x] === 1) ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2)
        }
      }

      if (piece) {
        ctx.globalAlpha = PIECE_ALPHA
        for (const [cx, cy] of piece.cells) {
          const x = piece.x + cx
          const y = piece.y + cy
          if (y >= 0) ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2)
        }
      }
      ctx.globalAlpha = 1
    }

    // Ziehen statt Klicken: Maustaste über dem Stein halten und in jede
    // Richtung bewegen schiebt ihn — begrenzt auf den Canvas (Hero-Bereich),
    // nach unten nie durch den Boden oder bereits gestapelte Steine hindurch
    let drag: {
      pointerId: number
      startClientX: number
      startClientY: number
      startPieceX: number
      startPieceY: number
    } | null = null

    function onPointerDown(event: PointerEvent) {
      if (!isVisible || !piece) return
      drag = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startPieceX: piece.x,
        startPieceY: piece.y,
      }
      canvas.setPointerCapture(event.pointerId)
    }

    function onPointerMove(event: PointerEvent) {
      if (!drag || drag.pointerId !== event.pointerId || !piece) return
      const deltaCellsX = Math.round((event.clientX - drag.startClientX) / CELL)
      const deltaCellsY = Math.round((event.clientY - drag.startClientY) / CELL)
      let targetX = clamp(drag.startPieceX + deltaCellsX, 0, cols - 1)
      let targetY = clamp(drag.startPieceY + deltaCellsY, 0, rows - 1)
      // Falls die Zielspalte/-zeile belegt ist, so nah wie möglich in Zugrichtung heranrücken
      const dirX = Math.sign(targetX - piece.x)
      while (targetX !== piece.x && collides(piece, targetX - piece.x, 0)) targetX -= dirX
      const dirY = Math.sign(targetY - piece.y)
      while (targetY !== piece.y && collides(piece, 0, targetY - piece.y)) targetY -= dirY
      piece.x = targetX
      piece.y = targetY
      draw()
    }

    function onPointerUp(event: PointerEvent) {
      if (drag?.pointerId === event.pointerId) drag = null
    }

    function startTicking() {
      if (tickTimer === undefined) tickTimer = setInterval(tick, TICK_MS)
    }

    function stopTicking() {
      clearInterval(tickTimer)
      tickTimer = undefined
    }

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = Boolean(entry?.isIntersecting)
      if (isVisible) startTicking()
      else stopTicking()
    })
    observer.observe(canvas)

    const resizeObserver = new ResizeObserver(() => setup())
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement)

    setup()
    startTicking()
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)
    return () => {
      stopTicking()
      observer.disconnect()
      resizeObserver.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
    }
  }, [])

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Desktop: klickbares Tetris */}
      <div className="hidden h-full w-full sm:block">
        <canvas ref={canvasRef} className="pointer-events-auto cursor-pointer" />
      </div>

      {/* Mobil: ruhiges Kästchen-Muster in Accent-Orange */}
      <div className="sm:hidden">
        {MOBILE_SQUARES.map((square) => (
          <div key={square} className={`animate-square-drift absolute rounded-sm ${square}`} />
        ))}
      </div>
    </div>
  )
}
