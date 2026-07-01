'use client'

import { useActionState } from 'react'
import { sendMagicLink } from '@/actions/auth.actions'
import { Button } from '@/components/shared/Button'

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(sendMagicLink, {
    error: null,
    success: false,
  })

  if (state.success) {
    return (
      <p className="text-text-primary text-sm">
        Link verschickt — schau in dein Postfach und klick auf den Anmelde-Link.
      </p>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input
        type="email"
        name="email"
        aria-label="E-Mail-Adresse"
        placeholder="E-Mail-Adresse"
        required
        className="border-border bg-surface text-foreground rounded-none border px-4 py-3 text-sm"
      />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" isLoading={isPending}>
        Anmelde-Link senden
      </Button>
    </form>
  )
}
