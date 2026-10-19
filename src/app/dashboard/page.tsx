import { redirect } from 'next/navigation'
import { getAuthFromCookie } from '@/lib/auth'
import { getProductStats } from '@/lib/products'
import ProductTable from './ProductTable'
import TopNav from '@/components/ui/TopNav'

export default async function DashboardPage() {
  const auth = await getAuthFromCookie()
  if (!auth) redirect('/login')

  const stats = await getProductStats()

  const activeCount   = stats.byStatus.find((s) => s.status === 'Active')?._count.id ?? 0
  const retiredCount  = stats.byStatus.find((s) => s.status === 'Retired')?._count.id ?? 0
  const inactiveCount = stats.byStatus.find((s) => s.status === 'Inactive')?._count.id ?? 0

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav user={auth} showAdminLink={auth.role === 'admin'} />

      <main className="max-w-screen-2xl mx-auto px-6 py-7">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Product Master Data</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            MEBS 4PL · Product master data for GF-MAL, GF-HIV and GF-NACA programs
          </p>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatTile label="Total Products"  value={stats.total}   accent="#0F2044" />
          <StatTile label="Active"          value={activeCount}   accent="#16A34A" />
          <StatTile label="Inactive"        value={inactiveCount} accent="#CA8A04" />
          <StatTile label="Retired"         value={retiredCount}  accent="#DC2626" />
        </div>

        {/* ── Programme breakdown ── */}
        {stats.byProgram.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            {stats.byProgram.map((p) => (
              <div
                key={p.program}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2.5"
              >
                <ProgramDot program={p.program} />
                <span className="text-sm font-medium text-gray-700">
                  {p.program.replace('_', '-')}
                </span>
                <span className="text-sm font-bold text-gray-900">{p._count.id}</span>
              </div>
            ))}
          </div>
        )}

        <ProductTable />
      </main>
    </div>
  )
}

function StatTile({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-4 flex items-start gap-3">
      <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: accent }} />
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

function ProgramDot({ program }: { program: string }) {
  const colors: Record<string, string> = {
    GF_MAL:  '#1D4ED8',
    GF_HIV:  '#7C3AED',
    GF_NACA: '#0D9488',
  }
  return (
    <span
      className="w-2 h-2 rounded-full inline-block"
      style={{ background: colors[program] ?? '#6B7280' }}
    />
  )
}
