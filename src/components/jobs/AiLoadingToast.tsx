'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

export function AiLoadingToast() {
  useEffect(() => {
    const id = toast.loading('KI erstellt Zusammenfassung & Anschreiben …')
    return () => {
      toast.dismiss(id)
    }
  }, [])

  return null
}
