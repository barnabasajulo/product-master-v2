import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromCookie } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createUser } from '@/lib/users'

// GET  /api/users  — list all users (admin only)
export async function GET() {
  const auth = await getAuthFromCookie()
  if (!auth)                return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  if (auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden' },    { status: 403 })

  const users = await prisma.user.findMany({
    select: { id: true, username: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(
    users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))
  )
}

// POST /api/users  — create a new user (admin only)
export async function POST(req: NextRequest) {
  const auth = await getAuthFromCookie()
  if (!auth)                return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  if (auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden' },    { status: 403 })

  try {
    const { username, name, email, password, role } = await req.json()

    if (!username || !name || !email || !password || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }
    if (!['admin', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Role must be admin or viewer' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const user = await createUser({ username, name, email, password, role })
    return NextResponse.json(user, { status: 201 })
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Username or email already exists' }, { status: 409 })
    }
    console.error('[users POST]', err)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
