import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromCookie } from '@/lib/auth'
import { getProductById, updateProduct, retireProduct } from '@/lib/products'

type Params = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const auth = await getAuthFromCookie()
  if (!auth) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const product = await getProductById(Number(params.id))
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(product)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromCookie()
  if (!auth)                return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  if (auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden' },    { status: 403 })

  try {
    const updates = await req.json()
    const product = await updateProduct(Number(params.id), updates, auth.username)
    return NextResponse.json(product)
  } catch (err: any) {
    console.error('[products PATCH]', err)
    if (err.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await getAuthFromCookie()
  if (!auth)                return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  if (auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden' },    { status: 403 })

  try {
    const product = await retireProduct(Number(params.id), auth.username)
    return NextResponse.json(product)
  } catch (err: any) {
    console.error('[products DELETE]', err)
    if (err.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ error: 'Retire failed' }, { status: 500 })
  }
}
