'use client'

import Link from 'next/link'
import { useActionState, useEffect, useRef, useState } from 'react'
import { requestLoginCode, verifyLoginCode } from '@/actions/auth.actions'
import { Button } from '@/components/shared/Button'

// Supabase ist auf 8-stellige E-Mail-Codes konfiguriert, bei dieser Länge
// wird automatisch abgeschickt. Kürzere/längere Codes gehen weiter manuell.
const OTP_AUTO_SUBMIT_LENGTH = 8
// Muss zum "Minimum interval per user" im Supabase-SMTP-Setup passen (60 s)
const RESEND_COOLDOWN_SECONDS = 60

interface LoginFormProps {
  next?: string
}

export function LoginForm({ next }: LoginFormProps) {
  const [requestState, requestAction, isRequesting] = useActionState(requestLoginCode, {
    error: null,
    success: false,
    email: '',
  })
  const [verifyState, verifyAction, isVerifying] = useActionState<
    { error: string | null },
    FormData
  >(verifyLoginCode, {
    error: null,
  })
  const formRef = useRef<HTMLFormElement>(null)
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS)

  useEffect(() => {
    if (!requestState.success || cooldown <= 0) return
    const timer = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(timer)
  }, [requestState.success, cooldown])

  function handleTokenChange(value: string) {
    if (value.length === OTP_AUTO_SUBMIT_LENGTH && /^\d+$/.test(value) && !isVerifying) {
      formRef.current?.requestSubmit()
    }
  }

  if (requestState.success) {
    return (
      <form ref={formRef} action={verifyAction} className="flex flex-col gap-4">
        <input type="hidden" name="email" value={requestState.email} />
        {next && <input type="hidden" name="next" value={next} />}
        <p className="text-text-secondary text-sm">
          Code an <span className="text-foreground">{requestState.email}</span> geschickt, bitte die
          8 Ziffern eingeben.
        </p>
        <input
          type="text"
          name="token"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{8}"
          maxLength={8}
          aria-label="8-stelliger Anmelde-Code"
          placeholder="12345678"
          required
          autoFocus
          onChange={(event) => handleTokenChange(event.target.value)}
          className="border-border bg-surface text-foreground rounded-none border px-4 py-3 text-center text-lg tracking-[0.3em]"
        />
        {verifyState.error && <p className="text-sm text-red-600">{verifyState.error}</p>}
        <Button type="submit" variant="accent" isLoading={isVerifying}>
          Bestätigen
        </Button>
        <button
          type="submit"
          formAction={requestAction}
          disabled={cooldown > 0 || isRequesting}
          onClick={() => setCooldown(RESEND_COOLDOWN_SECONDS)}
          className="text-text-secondary text-xs underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-60"
        >
          {cooldown > 0 ? `Neuen Code anfordern (in ${cooldown} s)` : 'Neuen Code anfordern'}
        </button>
      </form>
    )
  }

  return (
    <form action={requestAction} className="flex flex-col gap-4">
      <input
        type="email"
        name="email"
        aria-label="E-Mail-Adresse"
        placeholder="E-Mail-Adresse"
        required
        className="border-border bg-surface text-foreground rounded-none border px-4 py-3 text-sm"
      />
      {requestState.error && <p className="text-sm text-red-600">{requestState.error}</p>}
      <Button type="submit" variant="accent" isLoading={isRequesting}>
        Code anfordern
      </Button>
      <p className="text-text-secondary text-xs leading-relaxed">
        Mit dem Anfordern des Codes wird ein Nutzerkonto für deine E-Mail-Adresse erstellt.
        Informationen zur Verarbeitung deiner Daten findest du in der{' '}
        <Link href="/datenschutz" className="underline">
          Datenschutzerklärung
        </Link>
        .
      </p>
    </form>
  )
}
