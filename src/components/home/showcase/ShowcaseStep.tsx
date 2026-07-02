'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

interface ShowcaseStepProps {
  step: number
  title: string
  text: string
  /** Visual auf großen Screens links statt rechts */
  reverse?: boolean
  children: React.ReactNode
}

/**
 * Ein Abschnitt der Scroll-Experience: Text und UI-Mock gleiten sanft ins
 * Bild, sobald der Schritt in den Viewport scrollt (einmalig, kein Flackern).
 */
export function ShowcaseStep({ step, title, text, reverse = false, children }: ShowcaseStepProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25, rootMargin: '0px 0px -10% 0px' }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        'grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24',
        reverse && 'lg:[&>*:first-child]:order-2'
      )}
    >
      <div
        className={cn(
          'transition-[opacity,transform] duration-700 ease-out',
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        )}
      >
        <span className="text-accent font-display text-sm font-semibold tracking-widest">
          {String(step).padStart(2, '0')}
        </span>
        <h3 className="text-text-on-dark mt-2 text-2xl lg:text-3xl">{title}</h3>
        <p className="text-text-on-dark-muted mt-3 max-w-md text-sm leading-relaxed lg:text-base">
          {text}
        </p>
      </div>

      {/* UI-Mock ist rein dekorativ — Screenreader lesen nur den Text daneben */}
      <div
        aria-hidden
        className={cn(
          'transition-[opacity,transform] delay-150 duration-700 ease-out',
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        )}
      >
        {children}
      </div>
    </div>
  )
}
