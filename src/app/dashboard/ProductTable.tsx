'use client'

import { useState, useEffect, useCallback } from 'react'
import { StatusBadge, ProgramBadge } from '@/components/ui/Badges'
import { PROGRAMS, PROGRAM_LABELS, type Product, type ProductFilters, type ProgramKey } from '@/types'

export default function ProductTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [filters, setFilters]   = useState<ProductFilters>({
    search: '', status: '', program: '', currency: '',
  })
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 50

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.search)   params.set('search',   filters.search)
    if (filters.status)   params.set('status',   filters.status)
    if (filters.program)  params.set('program',  filters.program)
    if (filters.currency) params.set('currency', filters.currency)
    params.set('page',     String(page))
    params.set('pageSize', String(PAGE_SIZE))

    try {
      const res  = await fetch(`/api/products?${params}`)
      const data = await res.json()
      setProducts(data.products)
      setTotal(data.total)
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  function handleFilter(key: keyof ProductFilters, value: string) {
    setFilters((f) => ({ ...f, [key]: value }))
    setPage(1)
  }

  function buildExportParams() {
    const params = new URLSearchParams()
    if (filters.search)   params.set('search',   filters.search)
    if (filters.status)   params.set('status',   filters.status)
    if (filters.program)  params.set('program',  filters.program)
    if (filters.currency) params.set('currency', filters.currency)
    return params
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-4">
      {/* ── Filter bar ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search code or name…"
          value={filters.search}
          onChange={(e) => handleFilter('search', e.target.value)}
          className="flex-1 min-w-[180px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={filters.program}
          onChange={(e) => handleFilter('program', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Programs</option>
          {PROGRAMS.map((p) => (
            <option key={p} value={p}>{PROGRAM_LABELS[p]}</option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => handleFilter('status', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Retired">Retired</option>
        </select>

        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => window.location.href = `/api/export?${buildExportParams()}&format=xlsx`}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-green-600 text-green-700 hover:bg-green-50 transition-colors"
          >
            ⬇ Excel
          </button>
          <button
            onClick={() => window.location.href = `/api/export?${buildExportParams()}&format=csv`}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ⬇ CSV
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {[
                  'Code', 'Product Name', 'Program', 'Status',
                  'L (cm)', 'B (cm)', 'H (cm)', 'Qty/Ctn',
                  'Ctn L', 'Ctn B', 'Ctn H',
                  'Vol (Ctn)', 'Vol m³', 'Ctn Vol m³',
                  'Pallet Coeff', 'Price', 'CCY',
                ].map((h) => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={17} className="text-center py-10 text-gray-400">
                    Loading…
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={17} className="text-center py-10 text-gray-400">
                    No products found
                  </td>
                </tr>
              ) : products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">{p.productCode}</td>
                  <td className="px-3 py-2 max-w-[240px]">
                    <div className="font-medium text-gray-900 truncate">{p.productNameFull}</div>
                    {p.productNameShort && (
                      <div className="text-gray-400 text-xs truncate">{p.productNameShort}</div>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap"><ProgramBadge program={p.program} /></td>
                  <td className="px-3 py-2 whitespace-nowrap"><StatusBadge status={p.status} /></td>
                  <td className="px-3 py-2 text-right tabular-nums">{p.unitLengthCm ?? '—'}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{p.unitBreadthCm ?? '—'}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{p.unitHeightCm ?? '—'}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{p.qtyPerCarton ?? '—'}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{p.cartonLengthCm ?? '—'}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{p.cartonBreadthCm ?? '—'}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{p.cartonHeightCm ?? '—'}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{p.unitVolumeCarton ?? '—'}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{p.unitVolumeM3 ?? '—'}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{p.cartonVolumeM3 ?? '—'}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{p.palletCoefficient ?? '—'}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {p.price != null ? p.price.toFixed(4) : '—'}
                  </td>
                  <td className="px-3 py-2 text-gray-500">{p.currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-sm text-gray-600">
            <span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded-lg disabled:opacity-40"
              >
                ‹ Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded-lg disabled:opacity-40"
              >
                Next ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
