import { PrismaClient, Program, ProductStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱  Seeding database...')

  // ── Users ────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin@1234', 12)
  const viewerHash = await bcrypt.hash('Viewer@1234', 12)

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      name: 'Administrator',
      email: 'admin@product-master.local',
      passwordHash: adminHash,
      role: 'admin',
    },
  })

  const viewer = await prisma.user.upsert({
    where: { username: 'viewer' },
    update: {},
    create: {
      username: 'viewer',
      name: 'View Only User',
      email: 'viewer@product-master.local',
      passwordHash: viewerHash,
      role: 'viewer',
    },
  })

  console.log(`✅  Users: ${admin.username} (admin), ${viewer.username} (viewer)`)

  // ── Products ─────────────────────────────────────────────────
  const products = [
    {
      productCode: 'GHSC-MAL0005J',
      productNameFull: 'AA1-Arte/Amo 25/ctn 25x3tabs[Fosun]',
      productNameShort: 'Arte/Amo 25mg',
      program: Program.GF_MAL,
      qtyPerCarton: 120,
      unitLengthCm: 13.4,
      unitBreadthCm: 9.0,
      unitHeightCm: 5.0,
      cartonLengthCm: 56.4,
      cartonBreadthCm: 47.3,
      cartonHeightCm: 32.8,
      price: 16.0,
      currency: 'USD',
      palletCoefficient: 720,
      unitVolumeCarton: 729.1768,
      unitVolumeM3: 0.000602,
      cartonVolumeM3: 0.000874,
      status: ProductStatus.Active,
    },
    {
      productCode: 'GHSC-HIV0021A',
      productNameFull: 'Tenofovir/Lamivudine/Dolutegravir 300/300/50mg tabs x 30',
      productNameShort: 'TLD 30s',
      program: Program.GF_HIV,
      qtyPerCarton: 60,
      unitLengthCm: 11.5,
      unitBreadthCm: 6.0,
      unitHeightCm: 4.2,
      cartonLengthCm: 48.0,
      cartonBreadthCm: 36.5,
      cartonHeightCm: 27.0,
      price: 8.5,
      currency: 'USD',
      palletCoefficient: 960,
      unitVolumeCarton: 289.8,
      unitVolumeM3: 0.000242,
      cartonVolumeM3: 0.004731,
      status: ProductStatus.Active,
    },
    {
      productCode: 'GHSC-NAC0007B',
      productNameFull: 'HIV Self-Test Oral Fluid Kit (OraQuick)',
      productNameShort: 'HIVST OraQuick',
      program: Program.GF_NACA,
      qtyPerCarton: 25,
      unitLengthCm: 20.0,
      unitBreadthCm: 12.0,
      unitHeightCm: 5.5,
      cartonLengthCm: 62.0,
      cartonBreadthCm: 44.0,
      cartonHeightCm: 35.0,
      price: 2.2,
      currency: 'USD',
      palletCoefficient: 480,
      unitVolumeCarton: 1320.0,
      unitVolumeM3: 0.001320,
      cartonVolumeM3: 0.009548,
      status: ProductStatus.Active,
    },
  ]

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { productCode: p.productCode },
      update: {},
      create: p,
    })
    console.log(`✅  Product: ${product.productCode} (${product.program})`)
  }

  console.log('\n🎉  Seed complete!')
  console.log('   Admin login  →  username: admin   password: Admin@1234')
  console.log('   Viewer login →  username: viewer  password: Viewer@1234')
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
