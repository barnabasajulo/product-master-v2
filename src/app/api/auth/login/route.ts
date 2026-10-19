import { NextRequest, NextResponse } from 'next/server'
import { getUserByUsername, verifyPassword } from '@/lib/users'
import { signToken, cookieOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    const user = await getUserByUsername(username.trim().toLowerCase())
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = await signToken({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    })

    const res = NextResponse.json({
      user: { id: user.id, username: user.username, name: user.name, role: user.role },
    })

    res.cookies.set(cookieOptions().name, token, cookieOptions())
    return res
  } catch (err) {
    console.error('[login]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
