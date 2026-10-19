'use client'

import { useState, useEffect } from 'react'
import ProductForm from './ProductForm'
import { StatusBadge, ProgramBadge } from '@/components/ui/Badges'
import type { Product, ChangeLogEntry } from '@/types'

type Tab = 'add' | 'edit' | 'retire' | 'users' | 'log'

interface AppUser {
  id: number
  username: string
  name: string
  email: string
  role: 'admin' | 'viewer'
  createdAt: string
}

export default function AdminClient() {
  const [tab, setTab]               = useState<Tab>('add')
  const [products, setProducts]     = useState<Product[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [log, setLog]               = useState<ChangeLogEntry[]>([])
  const [loadingLog, setLoadingLog] = useState(false)
  const [users, setUsers]           = useState<AppUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    fetch('/api/products?pageSize=500')
      .then((r) => r.json())
      .then((d) => setProducts(d.products))
  }, [])

  useEffect(() => {
    if (tab === 'log') {
      setLoadingLog(true)
      fetch('/api/changelog')
        .then((r) => r.json())
        .then((d) => { setLog(d); setLoadingLog(false) })
    }
    if (tab === 'users') {
      setLoadingUsers(true)
      fetch('/api/users')
        .then((r) => r.json())
        .then((d) => { setUsers(d); setLoadingUsers(false) })
    }
  }, [tab])

  const selected = products.find((p) => p.id === selectedId)

  async function retireSelected() {
    if (!selected) return
    if (!confirm(`Retire "${selected.productCode}"? This sets the status to Retired and cannot be undone.`)) return
    const res = await fetch(`/api/products/${selected.id}`, { method: 'DELETE' })
    if (res.ok) {
      const updated = await res.json()
      setProducts((ps) => ps.map((p) => p.id === updated.id ? updated : p))
      setSelectedId(null)
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'add',    label: 'Add Product'   },
    { key: 'edit',   label: 'Edit Product'  },
    { key: 'retire', label: 'Retire Product' },
    { key: 'users',  label: 'Users'         },
    { key: 'log',    label: 'Audit Log'     },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.key
                ? 'border-[#1A56DB] text-[#1A56DB]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* ── Add ── */}
        {tab === 'add' && (
          <ProductForm
            mode="create"
            onSuccess={(p) => setProducts((ps) => [p, ...ps])}
          />
        )}

        {/* ── Edit ── */}
        {tab === 'edit' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Select product</label>
              <select
                value={selectedId ?? ''}
                onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : null)}
                className="w-full md:w-[480px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
              >
                <option value="">— choose a product —</option>
                {products.filter((p) => p.status !== 'Retired').map((p) => (
                  <option key={p.id} value={p.id}>{p.productCode} — {p.productNameFull}</option>
                ))}
              </select>
            </div>
            {selected && (
              <ProductForm
                key={selected.id}
                mode="edit"
                initial={selected}
                onSuccess={(updated) =>
                  setProducts((ps) => ps.map((p) => p.id === updated.id ? updated : p))
                }
              />
            )}
          </div>
        )}

        {/* ── Retire ── */}
        {tab === 'retire' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Select product to retire</label>
              <select
                value={selectedId ?? ''}
                onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : null)}
                className="w-full md:w-[480px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
              >
                <option value="">— choose a product —</option>
                {products.filter((p) => p.status !== 'Retired').map((p) => (
                  <option key={p.id} value={p.id}>{p.productCode} — {p.productNameFull}</option>
                ))}
              </select>
            </div>
            {selected && (
              <div className="max-w-lg border border-gray-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <ProgramBadge program={selected.program} />
                  <StatusBadge status={selected.status} />
                </div>
                <div>
                  <p className="font-mono text-xs text-gray-400">{selected.productCode}</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{selected.productNameFull}</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
                  Retiring a product is a soft-delete. The record is kept for audit purposes and will no longer show as Active.
                </div>
                <button
                  onClick={retireSelected}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Retire Product
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Users ── */}
        {tab === 'users' && (
          <UsersTab
            users={users}
            loading={loadingUsers}
            onUsersChange={setUsers}
          />
        )}

        {/* ── Audit Log ── */}
        {tab === 'log' && (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            {loadingLog ? (
              <p className="text-center py-10 text-sm text-gray-400">Loading…</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['When', 'Product', 'Action', 'Field', 'Old Value', 'New Value', 'By'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {log.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-10 text-gray-400">No audit entries yet</td></tr>
                  ) : log.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(entry.changedAt).toLocaleString('en-GB')}
                      </td>
                      <td className="px-4 py-2 font-mono text-xs">{entry.productCode}</td>
                      <td className="px-4 py-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          entry.action === 'INSERT' ? 'bg-green-100 text-green-700'
                          : entry.action === 'DELETE' ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                        }`}>
                          {entry.action}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-600">{entry.fieldChanged}</td>
                      <td className="px-4 py-2 text-gray-400 max-w-[140px] truncate">{entry.oldValue ?? '—'}</td>
                      <td className="px-4 py-2 max-w-[140px] truncate">{entry.newValue ?? '—'}</td>
                      <td className="px-4 py-2 text-gray-600">{entry.changedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Users Tab ────────────────────────────────────────────────────
function UsersTab({
  users, loading, onUsersChange,
}: {
  users: AppUser[]
  loading: boolean
  onUsersChange: (u: AppUser[]) => void
}) {
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState({ username: '', name: '', email: '', password: '', role: 'viewer' as 'admin' | 'viewer' })
  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState('')
  const [resetId, setResetId]     = useState<number | null>(null)
  const [newPw, setNewPw]         = useState('')
  const [resetErr, setResetErr]   = useState('')

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      setShowForm(false)
      setForm({ username: '', name: '', email: '', password: '', role: 'viewer' })
      const refreshed = await fetch('/api/users').then((r) => r.json())
      onUsersChange(refreshed)
    } else {
      const d = await res.json()
      setFormError(d.error ?? 'Failed to create user')
    }
  }

  async function deleteUser(id: number, name: string) {
    if (!confirm(`Remove user "${name}"? They will no longer be able to log in.`)) return
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
    if (res.ok) onUsersChange(users.filter((u) => u.id !== id))
  }

  async function resetPassword(id: number) {
    setResetErr('')
    if (newPw.length < 8) { setResetErr('Password must be at least 8 characters'); return }
    const res = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPw }),
    })
    if (res.ok) { setResetId(null); setNewPw('') }
    else { const d = await res.json(); setResetErr(d.error ?? 'Failed') }
  }

  if (loading) return <p className="text-center py-10 text-sm text-gray-400">Loading…</p>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{users.length} user{users.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 bg-[#0F2044] hover:bg-[#1A3568] text-white text-sm font-medium rounded-lg transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={createUser} className="border border-gray-200 rounded-xl p-5 space-y-4 bg-gray-50">
          <h3 className="font-semibold text-gray-800">New user</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {([
              ['username', 'Username'],
              ['name',     'Full Name'],
              ['email',    'Email'],
              ['password', 'Password'],
            ] as const).map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input
                  type={key === 'password' ? 'password' : key === 'email' ? 'email' : 'text'}
                  required
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB] bg-white"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB] bg-white"
              >
                <option value="viewer">Viewer — can view and export</option>
                <option value="admin">Admin — can edit products and manage users</option>
              </select>
            </div>
          </div>
          {formError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{formError}</p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-[#1A56DB] hover:bg-[#1547BF] disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {saving ? 'Creating…' : 'Create User'}
          </button>
        </form>
      )}

      {/* Users table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Username', 'Full Name', 'Email', 'Role', 'Created', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{u.username}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    u.role === 'admin'
                      ? 'bg-[#E8F0FE] text-[#1A56DB]'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {new Date(u.createdAt).toLocaleDateString('en-GB')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setResetId(u.id); setNewPw(''); setResetErr('') }}
                      className="text-xs text-[#1A56DB] hover:underline"
                    >
                      Reset PW
                    </button>
                    <button
                      onClick={() => deleteUser(u.id, u.name)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  {/* Inline password reset */}
                  {resetId === u.id && (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="password"
                        placeholder="New password"
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-xs w-36 focus:outline-none focus:ring-1 focus:ring-[#1A56DB]"
                      />
                      <button
                        onClick={() => resetPassword(u.id)}
                        className="text-xs px-2 py-1 bg-[#1A56DB] text-white rounded hover:bg-[#1547BF]"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setResetId(null)}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        Cancel
                      </button>
                      {resetErr && <span className="text-xs text-red-500">{resetErr}</span>}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
