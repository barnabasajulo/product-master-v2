import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromCookie } from '@/lib/auth'
import { getProducts, createProduct } from '@/lib/products'
import type { ProductFilters } from '@/types'

export async function GET(req: NextRequest) {
  const auth = await getAuthFromCookie()
  if (!auth) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const filters: ProductFilters = {
    search:   searchParams.get('search')   ?? undefined,
    status:   (searchParams.get('status')   ?? '') as any,
    program:  (searchParams.get('program')  ?? '') as any,
    currency: searchParams.get('currency') ?? undefined,
  }
  const page     = Number(searchParams.get('page')     ?? 1)
  const pageSize = Number(searchParams.get('pageSize') ?? 50)

  const result = await getProducts(filters, page, pageSize)
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const auth = await getAuthFromCookie()
  if (!auth)                return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  if (auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden' },    { status: 403 })

  try {
    const data = await req.json()
    const product = await createProduct(data, auth.username)
    return NextResponse.json(product, { status: 201 })
  } catch (err: any) {
    console.error('[products POST]', err)
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Product code already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
