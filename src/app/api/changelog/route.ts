import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromCookie } from '@/lib/auth'
import { getChangeLog } from '@/lib/products'

export async function GET(req: NextRequest) {
  const auth = await getAuthFromCookie()
  if (!auth)                return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  if (auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden' },    { status: 403 })

  const { searchParams } = req.nextUrl
  const productId = searchParams.get('productId')
  const log = await getChangeLog(productId ? Number(productId) : undefined)
  return NextResponse.json(log)
}
