'use client'

import Image from 'next/image'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: { w: 28, h: 28, text: 'text-sm' },
  md: { w: 36, h: 36, text: 'text-base' },
  lg: { w: 56, h: 56, text: 'text-xl' },
}

export default function OrgLogo({ size = 'md', className = '' }: Props) {
  const s = sizes[size]

  // If you place your logo at /public/logo.png, it will appear here.
  // Otherwise the text fallback renders.
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="relative flex-shrink-0 rounded overflow-hidden"
        style={{ width: s.w, height: s.h }}
      >
        {/* Replace /logo.png with your actual logo file in /public/ */}
        <Image
          src="/logo.png"
          alt="MEBS 4PL logo"
          fill
          className="object-contain"
          onError={(e) => {
            // Hide broken image; fallback div shows instead
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
        {/* Text fallback shown when logo.png is absent */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-[#0F2044] text-white font-bold"
          style={{ fontSize: s.w * 0.38 }}
        >
          M
        </div>
      </div>
      <div className="leading-tight">
        <p className={`font-bold text-[#0F2044] ${s.text}`}>MEBS 4PL</p>
        <p className="text-[10px] text-gray-500 tracking-wide">Product Data Portal</p>
      </div>
    </div>
  )
}
