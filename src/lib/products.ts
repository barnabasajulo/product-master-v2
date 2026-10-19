import { Decimal } from '@prisma/client/runtime/library'
import { prisma } from './db'
import type { Product, ProductFilters, ChangeLogEntry, ProgramKey } from '@/types'

// ── Decimal serialisation ────────────────────────────────────────
// Prisma returns Decimal objects; we convert to plain numbers for JSON.
function toNum(d: Decimal | null | undefined): number | null {
  if (d == null) return null
  return Number(d.toString())
}

function serialize(p: any): Product {
  return {
    id: p.id,
    productCode: p.productCode,
    productNameFull: p.productNameFull,
    productNameShort: p.productNameShort ?? null,
    program: p.program as ProgramKey,
    unitLengthCm: toNum(p.unitLengthCm),
    unitBreadthCm: toNum(p.unitBreadthCm),
    unitHeightCm: toNum(p.unitHeightCm),
    qtyPerCarton: p.qtyPerCarton ?? null,
    cartonLengthCm: toNum(p.cartonLengthCm),
    cartonBreadthCm: toNum(p.cartonBreadthCm),
    cartonHeightCm: toNum(p.cartonHeightCm),
    unitVolumeCarton: toNum(p.unitVolumeCarton),
    unitVolumeM3: toNum(p.unitVolumeM3),
    cartonVolumeM3: toNum(p.cartonVolumeM3),
    palletCoefficient: p.palletCoefficient ?? null,
    price: toNum(p.price),
    currency: p.currency,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }
}

// ── List / filter ────────────────────────────────────────────────
export async function getProducts(
  filters: ProductFilters = {},
  page = 1,
  pageSize = 50
) {
  const where: any = {}

  if (filters.search) {
    where.OR = [
      { productCode: { contains: filters.search } },
      { productNameFull: { contains: filters.search } },
      { productNameShort: { contains: filters.search } },
    ]
  }
  if (filters.status) where.status = filters.status
  if (filters.program) where.program = filters.program
  if (filters.currency) where.currency = filters.currency

  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { productCode: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  return { products: rows.map(serialize), total, page, pageSize }
}

// ── Single product ───────────────────────────────────────────────
export async function getProductById(id: number): Promise<Product | null> {
  const p = await prisma.product.findUnique({ where: { id } })
  return p ? serialize(p) : null
}

// ── Stats for dashboard ──────────────────────────────────────────
export async function getProductStats() {
  const [total, byStatus, byProgram] = await Promise.all([
    prisma.product.count(),
    prisma.product.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.product.groupBy({ by: ['program'], _count: { id: true } }),
  ])
  return { total, byStatus, byProgram }
}

// ── Distinct programs present in DB ─────────────────────────────
export async function getPrograms(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    select: { program: true },
    distinct: ['program'],
    orderBy: { program: 'asc' },
  })
  return rows.map((r) => r.program)
}

// ── Create ───────────────────────────────────────────────────────
export async function createProduct(
  data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  changedBy: string
): Promise<Product> {
  const product = await prisma.product.create({ data: data as any })

  await prisma.changeLog.create({
    data: {
      productId: product.id,
      productCode: product.productCode,
      fieldChanged: 'ALL',
      oldValue: null,
      newValue: JSON.stringify(serialize(product)),
      changedBy,
      action: 'INSERT',
    },
  })

  return serialize(product)
}

// ── Update (field-level audit) ───────────────────────────────────
export async function updateProduct(
  id: number,
  updates: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>,
  changedBy: string
): Promise<Product> {
  const existing = await prisma.product.findUniqueOrThrow({ where: { id } })
  const existingSerialized = serialize(existing)

  const updated = await prisma.product.update({ where: { id }, data: updates as any })
  const updatedSerialized = serialize(updated)

  // Log each changed field
  const logs: any[] = []
  for (const key of Object.keys(updates) as (keyof typeof updates)[]) {
    const oldVal = String(existingSerialized[key as keyof Product] ?? '')
    const newVal = String(updatedSerialized[key as keyof Product] ?? '')
    if (oldVal !== newVal) {
      logs.push({
        productId: id,
        productCode: updated.productCode,
        fieldChanged: key,
        oldValue: oldVal,
        newValue: newVal,
        changedBy,
        action: 'UPDATE',
      })
    }
  }

  if (logs.length > 0) {
    await prisma.changeLog.createMany({ data: logs })
  }

  return updatedSerialized
}

// ── Soft-delete (retire) ─────────────────────────────────────────
export async function retireProduct(id: number, changedBy: string): Promise<Product> {
  const product = await prisma.product.update({
    where: { id },
    data: { status: 'Retired' },
  })

  await prisma.changeLog.create({
    data: {
      productId: id,
      productCode: product.productCode,
      fieldChanged: 'status',
      oldValue: 'Active',
      newValue: 'Retired',
      changedBy,
      action: 'UPDATE',
    },
  })

  return serialize(product)
}

// ── Audit log ────────────────────────────────────────────────────
export async function getChangeLog(productId?: number): Promise<ChangeLogEntry[]> {
  const rows = await prisma.changeLog.findMany({
    where: productId ? { productId } : undefined,
    orderBy: { changedAt: 'desc' },
    take: 200,
  })

  return rows.map((r) => ({
    id: r.id.toString(),
    productId: r.productId,
    productCode: r.productCode,
    fieldChanged: r.fieldChanged,
    oldValue: r.oldValue,
    newValue: r.newValue,
    changedBy: r.changedBy,
    action: r.action,
    changedAt: r.changedAt.toISOString(),
  }))
}
