'use client'

import { useState } from 'react'
import { PROGRAMS, PROGRAM_LABELS, type Product } from '@/types'

type FormMode = 'create' | 'edit'

interface Props {
  mode: FormMode
  initial?: Partial<Product>
  onSuccess: (p: Product) => void
}

const EMPTY: Partial<Product> = {
  productCode: '', productNameFull: '', productNameShort: '',
  program: 'GF_MAL', currency: 'USD', status: 'Active',
}

export default function ProductForm({ mode, initial = EMPTY, onSuccess }: Props) {
  const [form, setForm] = useState<Partial<Product>>({ ...EMPTY, ...initial })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  function set<K extends keyof Product>(key: K, value: Product[K] | '') {
    setForm((f) => ({ ...f, [key]: value === '' ? null : value }))
  }

  function numInput(key: keyof Product, label: string, step = '0.0001') {
    return (
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
        <input
          type="number"
          step={step}
          value={(form[key] as number | null | undefined) ?? ''}
          onChange={(e) => set(key, e.target.value === '' ? null as any : Number(e.target.value) as any)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const url    = mode === 'create' ? '/api/products' : `/api/products/${form.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        const product = await res.json()
        setSuccess(`Product ${mode === 'create' ? 'created' : 'updated'} successfully!`)
        onSuccess(product)
        if (mode === 'create') setForm({ ...EMPTY })
      } else {
        const data = await res.json()
        setError(data.error ?? 'Request failed')
      }
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Identity ── */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 pb-1 border-b border-gray-200">
          Identity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Product Code *</label>
            <input
              type="text"
              required
              value={form.productCode ?? ''}
              onChange={(e) => set('productCode', e.target.value)}
              disabled={mode === 'edit'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Programme *</label>
            <select
              required
              value={form.program ?? 'GF_MAL'}
              onChange={(e) => set('program', e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PROGRAMS.map((p) => (
                <option key={p} value={p}>{PROGRAM_LABELS[p]}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Product Name (Full) *</label>
            <input
              type="text"
              required
              value={form.productNameFull ?? ''}
              onChange={(e) => set('productNameFull', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Product Name (Short)</label>
            <input
              type="text"
              value={form.productNameShort ?? ''}
              onChange={(e) => set('productNameShort', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {mode === 'edit' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                value={form.status ?? 'Active'}
                onChange={(e) => set('status', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          )}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 pb-1 border-b border-gray-200">
          Pricing
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {numInput('price', 'Unit Price', '0.0001')}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
            <input
              type="text"
              maxLength={3}
              value={form.currency ?? 'USD'}
              onChange={(e) => set('currency', e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* ── Unit Dimensions ── */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 pb-1 border-b border-gray-200">
          Unit Dimensions
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {numInput('unitLengthCm',  'Length (cm)')}
          {numInput('unitBreadthCm', 'Breadth (cm)')}
          {numInput('unitHeightCm',  'Height (cm)')}
        </div>
      </section>

      {/* ── Carton ── */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 pb-1 border-b border-gray-200">
          Carton / Secondary Packaging
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {numInput('qtyPerCarton',   'Qty per Carton', '1')}
          {numInput('cartonLengthCm', 'Carton Length (cm)')}
          {numInput('cartonBreadthCm','Carton Breadth (cm)')}
          {numInput('cartonHeightCm', 'Carton Height (cm)')}
        </div>
      </section>

      {/* ── Volumetrics & Pallet ── */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 pb-1 border-b border-gray-200">
          Volumetrics &amp; Pallet
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {numInput('unitVolumeCarton', 'Unit Vol (Carton) cm³')}
          {numInput('unitVolumeM3',     'Unit Vol m³', '0.000001')}
          {numInput('cartonVolumeM3',   'Carton Vol m³', '0.000001')}
          {numInput('palletCoefficient','Pallet Coefficient', '1')}
        </div>
      </section>

      {/* ── Submit ── */}
      {error   && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">{success}</div>}

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
      >
        {loading ? 'Saving…' : mode === 'create' ? 'Create Product' : 'Save Changes'}
      </button>
    </form>
  )
}
