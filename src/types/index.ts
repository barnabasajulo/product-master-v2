// ── Shared TypeScript types & constants ──────────────────────────

export type UserRole = 'admin' | 'viewer'

export interface AuthUser {
  id: number
  username: string
  name: string
  role: UserRole
}

export type ProductStatus = 'Active' | 'Inactive' | 'Retired'

// Prisma enum values (underscored) — these are what's stored in the DB
export const PROGRAMS = ['GF_MAL', 'GF_HIV', 'GF_NACA'] as const
export type ProgramKey = (typeof PROGRAMS)[number]

// Human-readable display labels (with hyphens)
export const PROGRAM_LABELS: Record<ProgramKey, string> = {
  GF_MAL:  'GF-MAL',
  GF_HIV:  'GF-HIV',
  GF_NACA: 'GF-NACA',
}

export interface Product {
  id: number
  productCode: string
  productNameFull: string
  productNameShort: string | null
  program: ProgramKey
  unitLengthCm: number | null
  unitBreadthCm: number | null
  unitHeightCm: number | null
  qtyPerCarton: number | null
  cartonLengthCm: number | null
  cartonBreadthCm: number | null
  cartonHeightCm: number | null
  unitVolumeCarton: number | null
  unitVolumeM3: number | null
  cartonVolumeM3: number | null
  palletCoefficient: number | null
  price: number | null
  currency: string
  status: ProductStatus
  createdAt: string
  updatedAt: string
}

export interface ChangeLogEntry {
  id: string
  productId: number | null
  productCode: string | null
  fieldChanged: string
  oldValue: string | null
  newValue: string | null
  changedBy: string
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  changedAt: string
}

export interface ProductFilters {
  search?: string
  status?: ProductStatus | ''
  program?: ProgramKey | ''
  currency?: string
}

export interface PaginatedProducts {
  products: Product[]
  total: number
  page: number
  pageSize: number
}
