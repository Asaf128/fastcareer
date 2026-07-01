'use client'

import { useActionState } from 'react'
import { requestLoginCode, verifyLoginCode } from '@/actions/auth.actions'
import { Button } from '@/components/shared/Button'

export function LoginForm() {
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

  if (requestState.success) {
    return (
      <form action={verifyAction} className="flex flex-col gap-4">
        <input type="hidden" name="email" value={requestState.email} />
        <p className="text-text-secondary text-sm">
          Code an <span className="text-foreground">{requestState.email}</span> geschickt — bitte
          eingeben.
        </p>
        <input
          type="text"
          name="token"
          inputMode="numeric"
          pattern="\d{4,10}"
          maxLength={10}
          aria-label="Anmelde-Code"
          placeholder="123456"
          required
          autoFocus
          className="border-border bg-surface text-foreground rounded-none border px-4 py-3 text-center text-lg tracking-[0.3em]"
        />
        {verifyState.error && <p className="text-sm text-red-600">{verifyState.error}</p>}
        <Button type="submit" isLoading={isVerifying}>
          Bestätigen
        </Button>
        <button
          type="submit"
          formAction={requestAction}
          className="text-text-secondary text-xs underline"
        >
          Neuen Code anfordern
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
      <Button type="submit" isLoading={isRequesting}>
        Code anfordern
      </Button>
    </form>
  )
}
