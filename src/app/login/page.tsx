'use client'

import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (res.ok) {
        const data = await res.json()
        const from = searchParams.get('from') ?? '/dashboard'
        router.push(data.user.role === 'admin' ? '/dashboard' : from)
      } else {
        const data = await res.json()
        setError(data.error ?? 'Login failed')
      }
    } catch {
      setError('Connection error — check your network and try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel: branding ─────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[44%] p-12"
        style={{ background: 'linear-gradient(160deg, #0F2044 60%, #1A3A7A)' }}
      >
        <div>
          {/* Logo block */}
          <div className="flex items-center gap-3 mb-16">
            <LogoMark size={150}/>
            <div>
              <p className="text-white font-bold text-lg leading-none">MEBS 4PL</p>
              <p className="text-blue-300 text-xs tracking-wider mt-0.5">Product Data Portal</p>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white leading-snug mb-4">
            The single source of truth<br />for MEBS 4PL Product Data.
          </h1>
          <p className="text-blue-200 text-base leading-relaxed max-w-xs">
            Product Information, dimensions, volumes, pallet coefficients and unit pricing across GF-MAL, GF-HIV and GF-NACA Programs, accessible to everyone who needs it.
          </p>
        </div>

        <p className="text-blue-400 text-xs">
          © {new Date().getFullYear()} MEBS 4PL — All rights reserved
        </p>
      </div>

      {/* ── Right panel: login form ──────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <LogoMark size={40} />
          <div>
            <p className="font-bold text-[#0F2044] text-lg">MEBS 4PL</p>
            <p className="text-gray-400 text-xs">Product Data Portal</p>
          </div>
        </div>

        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h2>
          <p className="text-sm text-gray-500 mb-8">Enter your credentials to access the portal</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                autoFocus
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-[#1A56DB] focus:border-transparent transition"
                placeholder="your email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-[#1A56DB] focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg px-3.5 py-3 text-sm text-red-700">
                <span className="mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white transition
                         disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: loading ? '#6B93C4' : '#1A56DB' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8">
            Contact your administrator if you need access.
          </p>
        </div>
      </div>
    </div>
  )
}

/** Inline logo mark — shows org logo if /public/logo.png exists, else monogram */
function LogoMark({ size }: { size: number }) {
  const [imgOk, setImgOk] = useState(true)

  return (
    <div
      className="relative flex-shrink-0 rounded-lg overflow-hidden"
      style={{ width: size, height: 200 }}
    >
      {imgOk ? (
        <Image
          src="/logo.png"
          alt="MEBS 4PL"
          width={size}
          height={size}
          className="object-contain"
          onError={() => setImgOk(false)}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center bg-[#1A56DB] text-white font-bold rounded-lg"
          style={{ fontSize: size * 0.42 }}
        >
          M
        </div>
      )}
    </div>
  )
}
