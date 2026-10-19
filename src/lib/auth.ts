import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import type { AuthUser } from '@/types'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'fallback-secret-change-in-production'
)
const COOKIE_NAME = 'pm_token'
const EXPIRY = '8h'

// ── Sign ────────────────────────────────────────────────────────
export async function signToken(user: AuthUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(SECRET)
}

// ── Verify ──────────────────────────────────────────────────────
export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as AuthUser
  } catch {
    return null
  }
}

// ── Read from cookie (Server Components / Route Handlers) ────────
export async function getAuthFromCookie(): Promise<AuthUser | null> {
  const token = cookies().get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

// ── Read from request headers (Middleware) ────────────────────────
export async function getAuthFromRequest(req: NextRequest): Promise<AuthUser | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

// ── Cookie helpers ───────────────────────────────────────────────
export function cookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours in seconds
  }
}
