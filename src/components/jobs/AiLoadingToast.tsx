'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

export function AiLoadingToast() {
  useEffect(() => {
    const id = toast.loading('KI fasst das Stellenangebot zusammen …')
    return () => {
      toast.dismiss(id)
    }
  }, [])

  return null
}
