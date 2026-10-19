import { NextRequest, NextResponse } from 'next/server'
import { getAuthFromCookie } from '@/lib/auth'
import { getProducts } from '@/lib/products'
import type { Product, ProductFilters } from '@/types'
import { PROGRAM_LABELS } from '@/types'
import ExcelJS from 'exceljs'

// ── Column definitions ───────────────────────────────────────────
const COLUMNS: { header: string; key: keyof Product | 'programLabel'; width: number }[] = [
  { header: 'Product Code',           key: 'productCode',       width: 20 },
  { header: 'Product Name (Full)',     key: 'productNameFull',   width: 44 },
  { header: 'Product Name (Short)',    key: 'productNameShort',  width: 22 },
  { header: 'Program',              key: 'programLabel',      width: 12 },
  { header: 'Unit Length (cm)',        key: 'unitLengthCm',      width: 16 },
  { header: 'Unit Breadth (cm)',       key: 'unitBreadthCm',     width: 16 },
  { header: 'Unit Height (cm)',        key: 'unitHeightCm',      width: 15 },
  { header: 'Qty per Carton',          key: 'qtyPerCarton',      width: 14 },
  { header: 'Carton Length (cm)',      key: 'cartonLengthCm',    width: 16 },
  { header: 'Carton Breadth (cm)',     key: 'cartonBreadthCm',   width: 17 },
  { header: 'Carton Height (cm)',      key: 'cartonHeightCm',    width: 16 },
  { header: 'Unit Vol (Carton) cm3',   key: 'unitVolumeCarton',  width: 18 },
  { header: 'Unit Volume m3',          key: 'unitVolumeM3',      width: 14 },
  { header: 'Carton Volume m3',        key: 'cartonVolumeM3',    width: 15 },
  { header: 'Pallet Coefficient',      key: 'palletCoefficient', width: 17 },
  { header: 'Price(USD)',                   key: 'price',             width: 12 },
  { header: 'Currency',               key: 'currency',          width: 10 },
  { header: 'Status',                 key: 'status',            width: 10 },
]

function productValue(p: Product, key: string): string | number | null {
  if (key === 'programLabel') return PROGRAM_LABELS[p.program] ?? p.program
  return (p as any)[key] ?? null
}

// ── Programme tab colour ─────────────────────────────────────────
function programColor(prog: string): string {
  return { GF_MAL: 'FFD6E4FF', GF_HIV: 'FFE9D5FF', GF_NACA: 'FFD1FAE5' }[prog] ?? 'FFFFFFFF'
}

// ── Build XLSX buffer ────────────────────────────────────────────
async function buildXlsx(products: Product[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'MEBS 4PL Product Data Portal'
  wb.created = new Date()

  const ws = wb.addWorksheet('Product Master', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })

  // Columns
  ws.columns = COLUMNS.map((c) => ({ header: c.header, key: c.key, width: c.width }))

  // ── Header row styling ───────────────────────────────────────
  const headerRow = ws.getRow(1)
  headerRow.height = 22
  headerRow.eachCell((cell) => {
    cell.font  = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10, name: 'Calibri' }
    cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F2044' } }
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false }
    cell.border = {
      top:    { style: 'thin', color: { argb: 'FF334155' } },
      bottom: { style: 'thin', color: { argb: 'FF334155' } },
      left:   { style: 'thin', color: { argb: 'FF334155' } },
      right:  { style: 'thin', color: { argb: 'FF334155' } },
    }
  })

  // ── Data rows ───────────────────────────────────────────────
  const thinBorder: Partial<ExcelJS.Borders> = {
    top:    { style: 'thin', color: { argb: 'FFD1D5DB' } },
    bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    left:   { style: 'thin', color: { argb: 'FFD1D5DB' } },
    right:  { style: 'thin', color: { argb: 'FFD1D5DB' } },
  }

  products.forEach((product, idx) => {
    const rowValues: (string | number | null)[] = COLUMNS.map((c) =>
      productValue(product, c.key)
    )
    const row = ws.addRow(rowValues)
    row.height = 18

    const isEven = idx % 2 === 1
    const bgColor = isEven ? 'FFF8FAFF' : 'FFFFFFFF'

    row.eachCell({ includeEmpty: true }, (cell, colNum) => {
      const colKey = COLUMNS[colNum - 1]?.key
      // Programme column gets coloured background
      const fillColor = colKey === 'programLabel' ? programColor(product.program) : bgColor

      cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } }
      cell.border = thinBorder
      cell.font   = { size: 10, name: 'Calibri' }

      // Numeric columns → right-align
      const isNum = typeof productValue(product, colKey as string) === 'number'
      cell.alignment = { vertical: 'middle', horizontal: isNum ? 'right' : 'left' }

      // Price format
      if (colKey === 'price' && cell.value != null) {
        cell.numFmt = '#,##0.0000'
      }
    })
  })

  // ── Auto-filter on header row ────────────────────────────────
  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to:   { row: 1, column: COLUMNS.length },
  }

  // ── Metadata sheet ───────────────────────────────────────────
  const meta = wb.addWorksheet('Export Info')
  meta.getColumn(1).width = 22
  meta.getColumn(2).width = 32
  const metaRows = [
    ['Exported by',   'MEBS 4PL Product Data Portal'],
    ['Export date',   new Date().toLocaleString('en-GB')],
    ['Total records', products.length],
  ]
  metaRows.forEach(([k, v]) => {
    const r = meta.addRow([k, v])
    r.getCell(1).font = { bold: true, size: 10 }
  })

  return wb.xlsx.writeBuffer() as unknown as Promise<Buffer>
}

// ── Route handler ────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const auth = await getAuthFromCookie()
  if (!auth) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const format = searchParams.get('format') ?? 'xlsx'
  const filters: ProductFilters = {
    search:   searchParams.get('search')   ?? undefined,
    status:   (searchParams.get('status')  ?? '') as any,
    program:  (searchParams.get('program') ?? '') as any,
    currency: searchParams.get('currency') ?? undefined,
  }

  const { products } = await getProducts(filters, 1, 10_000)
  const dateStr = new Date().toISOString().slice(0, 10)

  // ── XLSX (default) ───────────────────────────────────────────
  if (format !== 'csv') {
    const buffer   = await buildXlsx(products)
    const filename = `MEBS-4PL-Product-Master-${dateStr}.xlsx`
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  }

  // ── CSV fallback ──────────────────────────────────────────────
  function esc(v: string) {
    return v.includes(',') || v.includes('"') || v.includes('\n')
      ? `"${v.replace(/"/g, '""')}"`
      : v
  }
  const csvRows = [
    COLUMNS.map((c) => c.header).join(','),
    ...products.map((p) =>
      COLUMNS.map((c) => esc(String(productValue(p, c.key) ?? ''))).join(',')
    ),
  ]
  return new NextResponse(csvRows.join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="MEBS-4PL-Product-Master-${dateStr}.csv"`,
    },
  })
}
