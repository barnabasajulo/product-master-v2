'use client'

import { PROGRAM_LABELS, type ProgramKey } from '@/types'

// ── Status Badge ─────────────────────────────────────────────────
const statusStyles: Record<string, string> = {
  Active:   'bg-green-100 text-green-800 border-green-200',
  Inactive: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Retired:  'bg-red-100 text-red-800 border-red-200',
}

export function StatusBadge({ status }: { status: string }) {
  const cls = statusStyles[status] ?? 'bg-gray-100 text-gray-700 border-gray-200'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {status}
    </span>
  )
}

// ── Program Badge ────────────────────────────────────────────────
const programStyles: Record<string, string> = {
  GF_MAL:  'bg-blue-100 text-blue-800 border-blue-200',
  GF_HIV:  'bg-purple-100 text-purple-800 border-purple-200',
  GF_NACA: 'bg-teal-100 text-teal-800 border-teal-200',
}

export function ProgramBadge({ program }: { program: string }) {
  const cls = programStyles[program] ?? 'bg-gray-100 text-gray-700 border-gray-200'
  const label = PROGRAM_LABELS[program as ProgramKey] ?? program
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {label}
    </span>
  )
}
