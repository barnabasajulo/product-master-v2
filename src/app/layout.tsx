import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
// @ts-ignore -- Next.js resolves global CSS imports during compilation.
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MEBS 4PL Product Master Data Portal',
  description: 'Internal product master data management system',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
