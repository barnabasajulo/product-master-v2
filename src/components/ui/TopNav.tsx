'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { AuthUser } from '@/types'

interface Props {
  user: AuthUser
  showAdminLink?: boolean
}

export default function TopNav({ user, showAdminLink }: Props) {
  const router = useRouter()
  const [imgOk, setImgOk] = useState(true)

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <nav
      className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur"
      style={{ borderBottomColor: '#E5E7EB' }}
    >
      <div className="max-w-screen-2xl mx-auto px-6 h-20 flex items-center justify-between gap-4">

        {/* Logo + wordmark */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-20 h-40 relative rounded overflow-hidden">
            {imgOk ? (
              <Image
                src="/logo.png"
                alt="MEBS 4PL"
                fill
                className="object-contain"
                onError={() => setImgOk(false)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#0F2044] text-white font-bold text-xs rounded">
                M
              </div>
            )}
          </div>
          <span className="font-semibold text-[#0F2044] text-sm tracking-tight hidden sm:block">
            MEBS 4PL
          </span>
          <span className="text-gray-300 text-xs hidden md:block">|</span>
          <span className="text-gray-500 text-xs hidden md:block">Product Data Portal</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {showAdminLink && (
            <a
              href="/admin"
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-[#1A56DB] text-[#1A56DB]
                         hover:bg-[#E8F0FE] transition-colors"
            >
              Admin Panel
            </a>
          )}

          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: '#0F2044' }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-right leading-tight">
              <p className="text-xs font-medium text-gray-800">{user.name}</p>
              <p className="text-[10px] text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-600
                       hover:border-gray-400 hover:text-gray-800 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
