import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromCookie } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/users'

type Params = { params: { id: string } }

// PATCH /api/users/:id  — change role or reset password (admin only)
export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromCookie()
  if (!auth)                return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  if (auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden' },    { status: 403 })

  const { role, password } = await req.json()
  const data: Record<string, any> = {}

  if (role) {
    if (!['admin', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }
    data.role = role
  }
  if (password) {
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }
    data.passwordHash = await hashPassword(password)
  }

  try {
    const user = await prisma.user.update({
      where: { id: Number(params.id) },
      data,
      select: { id: true, username: true, name: true, email: true, role: true },
    })
    return NextResponse.json(user)
  } catch (err: any) {
    if (err.code === 'P2025') return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

// DELETE /api/users/:id  — remove user (admin only, cannot delete self)
export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await getAuthFromCookie()
  if (!auth)                return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  if (auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden' },    { status: 403 })

  if (Number(params.id) === auth.id) {
    return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 })
  }

  try {
    await prisma.user.delete({ where: { id: Number(params.id) } })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    if (err.code === 'P2025') return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
