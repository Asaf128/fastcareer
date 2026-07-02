import { NextResponse } from 'next/server'
import { z } from 'zod'
import { suggestBerufe } from '@/lib/jobs/berufe'

const querySchema = z.object({ q: z.string().min(2).max(100) })

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const parsed = querySchema.safeParse({ q: searchParams.get('q') })

  if (!parsed.success) {
    return NextResponse.json({ berufe: [] })
  }

  const berufe = await suggestBerufe(parsed.data.q)
  return NextResponse.json({ berufe })
}
