import { redirect } from 'next/navigation'
import { getAuthFromCookie } from '@/lib/auth'
import AdminClient from './AdminClient'
import TopNav from '@/components/ui/TopNav'

export default async function AdminPage() {
  const auth = await getAuthFromCookie()
  if (!auth || auth.role !== 'admin') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav user={auth} />

      <main className="max-w-screen-2xl mx-auto px-6 py-7">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage products and users</p>
          </div>
          <a
            href="/dashboard"
            className="text-sm text-[#1A56DB] hover:underline"
          >
            ← Back to Dashboard
          </a>
        </div>
        <AdminClient />
      </main>
    </div>
  )
}
