import { NextResponse } from 'next/server'
import { z } from 'zod'
import { suggestLocations } from '@/lib/jobs/openplz'

const querySchema = z.object({ q: z.string().min(2).max(50) })

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const parsed = querySchema.safeParse({ q: searchParams.get('q') })

  if (!parsed.success) {
    return NextResponse.json({ orte: [] })
  }

  const orte = await suggestLocations(parsed.data.q)
  return NextResponse.json({ orte })
}
