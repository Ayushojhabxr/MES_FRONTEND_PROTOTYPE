import { useEffect, useMemo, useState } from 'react'
import {
  Calculator,
  Copy,
  FilePlus2,
  FolderOpen,
  PackagePlus,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react'

const itemKey = 'aasa_bom_items'
const productKey = 'aasa_bom_products'
const inr = (value) => `INR ${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

const seedItems = [
  { id: 'IT-GL-100', name: 'Glass bottle body 100 ml', category: 'Item', uom: 'Each', warehouse: '04', stock: 18640, price: 38, weight: '120g' },
  { id: 'IT-CAP-M24', name: 'Metal cap 24 mm', category: 'Item', uom: 'Each', warehouse: '04', stock: 2240, price: 14, weight: '8g' },
  { id: 'IT-PUMP-01', name: 'Spray pump', category: 'Item', uom: 'Each', warehouse: '04', stock: 9420, price: 11, weight: '6g' },
  { id: 'IT-COLLAR', name: 'Plastic collar', category: 'Item', uom: 'Each', warehouse: '04', stock: 1280, price: 5, weight: '3g' },
  { id: 'IT-LABEL-FB', name: 'Front + back label', category: 'Item', uom: 'Each', warehouse: '04', stock: 6800, price: 3, weight: '1g' },
  { id: 'IT-BOX-100', name: 'Inner mono carton', category: 'Item', uom: 'Each', warehouse: '04', stock: 960, price: 3, weight: '18g' },
  { id: 'IT-PP-GRN', name: 'PP granules', category: 'Item', uom: 'Gram', warehouse: '04', stock: 18400, price: 0.28, weight: '1g' },
  { id: 'RES-LAB-01', name: 'Labour - Production Staff', category: 'Resource', uom: 'Hr', warehouse: '04', stock: 80, price: 100, weight: '-' },
]

const seedProducts = [
  {
    id: 'BOM-PB-100',
    productNo: 'FG-PB-100',
    description: '100 ml Premium Perfume Bottle',
    parentQty: 1,
    bomType: 'Production',
    warehouse: '04',
    priceList: 'MSRP',
    distrRule: '',
    project: '',
    plannedAverageProductionSize: 1,
    productPrice: 145,
    status: 'Approved',
    stages: ['Preparation', 'Assembly', 'Packing'],
    lines: [
      { stage: 'Preparation', type: 'Item', itemId: 'IT-GL-100', quantity: 1, warehouse: '04', issueMethod: 'Backflush', priceList: 'MSRP', comments: 'Bottle body' },
      { stage: 'Assembly', type: 'Item', itemId: 'IT-CAP-M24', quantity: 1, warehouse: '04', issueMethod: 'Backflush', priceList: 'MSRP', comments: 'Cap fitment' },
      { stage: 'Assembly', type: 'Item', itemId: 'IT-PUMP-01', quantity: 1, warehouse: '04', issueMethod: 'Backflush', priceList: 'MSRP', comments: 'Spray pump' },
      { stage: 'Packing', type: 'Item', itemId: 'IT-LABEL-FB', quantity: 2, warehouse: '04', issueMethod: 'Manual', priceList: 'MSRP', comments: 'Front and back labels' },
      { stage: 'Assembly', type: 'Resource', itemId: 'RES-LAB-01', quantity: 0.08, warehouse: '04', issueMethod: 'Manual', priceList: 'MSRP', comments: 'Assembly labour' },
    ],
  },
  {
    id: 'BOM-CAP-24',
    productNo: 'FG-CAP-24',
    description: '24 mm Perfume Bottle Cap',
    parentQty: 1,
    bomType: 'Production',
    warehouse: '04',
    priceList: 'MSRP',
    distrRule: '',
    project: '',
    plannedAverageProductionSize: 1,
    productPrice: 18,
    status: 'On Hold',
    stages: ['Moulding', 'Sleeve Fitment'],
    lines: [
      { stage: 'Moulding', type: 'Item', itemId: 'IT-PP-GRN', quantity: 18, warehouse: '04', issueMethod: 'Backflush', priceList: 'MSRP', comments: 'Plastic consumption in grams' },
      { stage: 'Moulding', type: 'Resource', itemId: 'RES-LAB-01', quantity: 0.02, warehouse: '04', issueMethod: 'Manual', priceList: 'MSRP', comments: 'Moulding labour' },
    ],
  },
]

const readStored = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const blankBom = (items) => ({
  id: `BOM-${Date.now()}`,
  productNo: '',
  description: '',
  parentQty: 1,
  bomType: 'Production',
  warehouse: '04',
  priceList: 'MSRP',
  distrRule: '',
  project: '',
  plannedAverageProductionSize: 1,
  productPrice: 0,
  status: 'Draft',
  stages: ['Stage 1'],
  lines: [{ stage: 'Stage 1', type: 'Item', itemId: items[0]?.id || '', quantity: 1, warehouse: '04', issueMethod: 'Backflush', priceList: 'MSRP', comments: '' }],
})

const normalizeBom = (bom, items) => {
  const fallback = blankBom(items)
  if (!bom || typeof bom !== 'object') return fallback
  const legacyRecipe = Array.isArray(bom.recipe) ? bom.recipe : []
  const sourceLines = Array.isArray(bom.lines) ? bom.lines : legacyRecipe.map((line) => ({
    type: 'Item',
    itemId: line.itemId || items[0]?.id || '',
    quantity: Number(line.qty || line.quantity || 1),
    warehouse: bom.warehouse || '04',
    issueMethod: 'Backflush',
      priceList: bom.priceList || 'MSRP',
      stage: bom.stages?.[0] || 'Stage 1',
      comments: '',
  }))
  return {
    ...fallback,
    ...bom,
    productNo: bom.productNo || bom.code || fallback.productNo,
    description: bom.description || bom.name || fallback.description,
    parentQty: Number(bom.parentQty || 1),
    productPrice: Number(bom.productPrice || bom.sellingPrice || 0),
    stages: Array.isArray(bom.stages) && bom.stages.length ? bom.stages : ['Stage 1'],
    lines: sourceLines.length ? sourceLines.map((line) => ({
      stage: line.stage || bom.stages?.[0] || 'Stage 1',
      type: line.type || 'Item',
      itemId: line.itemId || items[0]?.id || '',
      quantity: Number(line.quantity || line.qty || 0),
      warehouse: line.warehouse || bom.warehouse || '04',
      issueMethod: line.issueMethod || 'Backflush',
      priceList: line.priceList || bom.priceList || 'MSRP',
      comments: line.comments || '',
    })) : fallback.lines,
  }
}

const normalizeBoms = (products, items) => {
  const list = Array.isArray(products) && products.length ? products : seedProducts
  return list.map((product) => normalizeBom(product, items))
}

const findItem = (items, itemId) => items.find((item) => item.id === itemId) || items[0]

const lineCost = (line, items) => Number(line?.quantity || 0) * Number(findItem(items, line?.itemId)?.price || 0)

const bomCost = (bom, items) => (Array.isArray(bom?.lines) ? bom.lines : []).reduce((sum, line) => sum + lineCost(line, items), 0)

const canMake = (bom, items) => {
  const itemLines = (Array.isArray(bom?.lines) ? bom.lines : []).filter((line) => line.type === 'Item' && Number(line.quantity) > 0)
  if (!itemLines.length) return 0
  return Math.min(...itemLines.map((line) => Math.floor(Number(findItem(items, line.itemId)?.stock || 0) / Number(line.quantity || 1))))
}

function AddItemModal({ open, onClose, onCreate }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const form = new FormData(event.currentTarget)
          onCreate({
            id: `IT-${Date.now()}`,
            name: form.get('name'),
            category: form.get('category'),
            uom: form.get('uom'),
            warehouse: form.get('warehouse') || '04',
            stock: Number(form.get('stock') || 0),
            price: Number(form.get('price') || 0),
            weight: form.get('weight') || '-',
          })
        }}
        className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Add Item / Resource</h2>
          <button type="button" onClick={onClose} className="rounded border p-2 dark:border-slate-700 dark:text-slate-100"><X size={16} /></button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <input name="name" required placeholder="Description" className="rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          <select name="category" className="rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            <option>Item</option>
            <option>Resource</option>
            <option>Text</option>
          </select>
          <input name="uom" required placeholder="UoM Name, e.g. Each, Gram, Hr" className="rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          <input name="warehouse" defaultValue="04" placeholder="Warehouse" className="rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          <input name="stock" type="number" min="0" step="0.01" required placeholder="Available stock / capacity" className="rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          <input name="price" type="number" min="0" step="0.01" required placeholder="Unit price / standard cost" className="rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          <input name="weight" placeholder="Weight, optional" className="rounded border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 md:col-span-2" />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded border px-3 py-2 text-sm dark:border-slate-700 dark:text-slate-100">Cancel</button>
          <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white dark:bg-sky-600">Save</button>
        </div>
      </form>
    </div>
  )
}

function BomSummaryCard({ label, value, note }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{note}</p>
    </div>
  )
}

export default function BomPage() {
  const [items, setItems] = useState(() => readStored(itemKey, seedItems))
  const [products, setProducts] = useState(() => normalizeBoms(readStored(productKey, seedProducts), readStored(itemKey, seedItems)))
  const [selectedId, setSelectedId] = useState(() => normalizeBoms(readStored(productKey, seedProducts), readStored(itemKey, seedItems))[0]?.id)
  const [draft, setDraft] = useState(() => normalizeBoms(readStored(productKey, seedProducts), readStored(itemKey, seedItems))[0] || blankBom(seedItems))
  const [query, setQuery] = useState('')
  const [itemOpen, setItemOpen] = useState(false)
  const [viewMode, setViewMode] = useState('list')
  const [newStageName, setNewStageName] = useState('')

  useEffect(() => { localStorage.setItem(itemKey, JSON.stringify(items)) }, [items])
  useEffect(() => { localStorage.setItem(productKey, JSON.stringify(products)) }, [products])

  useEffect(() => {
    const syncFromStorage = () => {
      const storedItems = readStored(itemKey, seedItems)
      const storedProducts = normalizeBoms(readStored(productKey, seedProducts), storedItems)
      setItems(storedItems)
      setProducts(storedProducts)
      const selected = storedProducts.find((product) => product.id === selectedId)
      if (selected && viewMode === 'editor') setDraft(JSON.parse(JSON.stringify(normalizeBom(selected, storedItems))))
    }
    window.addEventListener('focus', syncFromStorage)
    window.addEventListener('storage', syncFromStorage)
    return () => {
      window.removeEventListener('focus', syncFromStorage)
      window.removeEventListener('storage', syncFromStorage)
    }
  }, [selectedId, viewMode])

  useEffect(() => {
    const selected = products.find((product) => product.id === selectedId)
    if (selected) setDraft(JSON.parse(JSON.stringify(normalizeBom(selected, items))))
  }, [selectedId, products, items])

  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return products
    return products.filter((product) => JSON.stringify(product).toLowerCase().includes(needle))
  }, [products, query])

  const productCost = bomCost(draft, items)
  const margin = Number(draft.productPrice || 0) - productCost

  const updateLine = (index, patch) => {
    setDraft((prev) => ({
      ...prev,
      lines: (Array.isArray(prev.lines) ? prev.lines : []).map((line, lineIndex) => lineIndex === index ? { ...line, ...patch } : line),
    }))
  }

  const saveBom = () => {
    const payload = normalizeBom({ ...draft, id: draft.id || `BOM-${Date.now()}` }, items)
    setProducts((prev) => prev.some((product) => product.id === payload.id) ? prev.map((product) => product.id === payload.id ? payload : product) : [payload, ...prev])
    setSelectedId(payload.id)
  }

  const counts = {
    total: products.length,
    draft: products.filter((product) => product.status === 'Draft').length,
    approved: products.filter((product) => product.status === 'Approved').length,
    onHold: products.filter((product) => product.status === 'On Hold').length,
  }

  if (viewMode === 'list') {
    return (
      <section className="max-w-full space-y-4 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Production / Bill of Materials</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">BOM Register</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">Review all BOMs, open existing recipes, or create a new SAP-style BOM.</p>
          </div>
          <button
            onClick={() => {
              const next = blankBom(items)
              setDraft(next)
              setSelectedId(next.id)
              setViewMode('editor')
            }}
            className="flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm text-white dark:bg-sky-600"
          >
            <FilePlus2 size={16} /> Create New BOM
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <BomSummaryCard label="Total BOMs" value={counts.total} note="All product recipes" />
          <BomSummaryCard label="Draft" value={counts.draft} note="Still being prepared" />
          <BomSummaryCard label="Approved" value={counts.approved} note="Ready for production" />
          <BomSummaryCard label="On Hold" value={counts.onHold} note="Blocked or pending review" />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search BOM, product, stage, item..." className="w-full rounded border border-slate-300 py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3">BOM</th>
                  <th>Type</th>
                  <th>Stages</th>
                  <th>Components</th>
                  <th>Can Make</th>
                  <th>Std Cost</th>
                  <th>Product Price</th>
                  <th>Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-t border-slate-100 dark:border-slate-800 dark:text-slate-200">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{product.productNo || 'New Product'}</p>
                      <p className="text-xs text-slate-500">{product.description || 'No description'}</p>
                    </td>
                    <td>{product.bomType}</td>
                    <td>{(product.stages || []).length}</td>
                    <td>{(product.lines || []).length}</td>
                    <td>{canMake(product, items).toLocaleString('en-IN')}</td>
                    <td>{inr(bomCost(product, items))}</td>
                    <td>{inr(product.productPrice)}</td>
                    <td><span className={`rounded-full px-2 py-1 text-xs font-semibold ${product.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : product.status === 'On Hold' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>{product.status}</span></td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelectedId(product.id)
                          setDraft(JSON.parse(JSON.stringify(normalizeBom(product, items))))
                          setViewMode('editor')
                        }}
                        className="flex items-center gap-1 rounded bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-sky-600"
                      >
                        <FolderOpen size={14} /> Open BOM
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="max-w-full space-y-4 overflow-hidden">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Production / Bill of Materials</p>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Bill of Materials</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setViewMode('list')} className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:text-slate-100">Back to BOM List</button>
            <button onClick={() => setItemOpen(true)} className="flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:text-slate-100"><PackagePlus size={16} /> Add Item</button>
            <button onClick={() => { const next = blankBom(items); setDraft(next); setSelectedId(next.id) }} className="flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:text-slate-100"><FilePlus2 size={16} /> New BOM</button>
            <button onClick={() => setDraft((prev) => ({ ...prev, id: `BOM-${Date.now()}`, productNo: `${prev.productNo}-COPY` }))} className="flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:text-slate-100"><Copy size={16} /> Duplicate</button>
            <button onClick={saveBom} className="flex items-center gap-2 rounded bg-slate-900 px-3 py-2 text-sm text-white dark:bg-sky-600"><Save size={16} /> Save</button>
          </div>
        </div>

        <div className="grid gap-5 p-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid items-center gap-3 md:grid-cols-[180px_minmax(0,1fr)_110px]">
            <label className="text-sm text-slate-600 dark:text-slate-300">Product No.</label>
            <input value={draft.productNo} onChange={(e) => setDraft({ ...draft, productNo: e.target.value })} className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
            <input value={draft.parentQty} onChange={(e) => setDraft({ ...draft, parentQty: Number(e.target.value || 0) })} type="number" min="0" step="0.01" className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" title="Quantity" />

            <label className="text-sm text-slate-600 dark:text-slate-300">Product Description</label>
            <input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 md:col-span-2" />

            <label className="text-sm text-slate-600 dark:text-slate-300">BOM Type</label>
            <select value={draft.bomType} onChange={(e) => setDraft({ ...draft, bomType: e.target.value })} className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 md:col-span-2">
              <option>Production</option>
              <option>Sales</option>
              <option>Assembly</option>
              <option>Template</option>
            </select>

            <label className="text-sm text-slate-600 dark:text-slate-300">Production Std Cost</label>
            <input value={inr(productCost)} readOnly className="rounded border border-slate-300 bg-slate-50 px-3 py-2 text-right text-sm font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 md:col-span-2" />

            <label className="text-sm text-slate-600 dark:text-slate-300">Planned Average Production Size</label>
            <input value={draft.plannedAverageProductionSize} onChange={(e) => setDraft({ ...draft, plannedAverageProductionSize: Number(e.target.value || 0) })} type="number" min="0" step="0.01" className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 md:col-span-2" />

            <label className="text-sm text-slate-600 dark:text-slate-300">Status</label>
            <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 md:col-span-2">
              <option>Draft</option>
              <option>Approved</option>
              <option>On Hold</option>
            </select>
          </div>

          <div className="grid content-start items-center gap-3 md:grid-cols-[100px_minmax(0,1fr)]">
            <label className="text-sm text-slate-600 dark:text-slate-300">Warehouse</label>
            <input value={draft.warehouse} onChange={(e) => setDraft({ ...draft, warehouse: e.target.value })} className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
            <label className="text-sm text-slate-600 dark:text-slate-300">Price List</label>
            <select value={draft.priceList} onChange={(e) => setDraft({ ...draft, priceList: e.target.value })} className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              <option>MSRP</option>
              <option>Purchase</option>
              <option>Standard</option>
            </select>
            <label className="text-sm text-slate-600 dark:text-slate-300">Distr. Rule</label>
            <input value={draft.distrRule} onChange={(e) => setDraft({ ...draft, distrRule: e.target.value })} className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
            <label className="text-sm text-slate-600 dark:text-slate-300">Project</label>
            <input value={draft.project} onChange={(e) => setDraft({ ...draft, project: e.target.value })} className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search BOM..." className="w-full rounded border border-slate-300 py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          </div>
          <div className="mt-3 max-h-[620px] space-y-2 overflow-y-auto">
            {filteredProducts.map((product) => (
              <button key={product.id} onClick={() => setSelectedId(product.id)} className={`w-full rounded-lg border p-3 text-left text-sm ${draft.id === product.id ? 'border-sky-300 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/30' : 'border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800'}`}>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{product.productNo || 'New Product'}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{product.description || 'No description'}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{inr(bomCost(product, items))} cost</p>
              </button>
            ))}
          </div>
        </aside>

        <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-3 dark:border-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Production Stages</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Each stage can contain its own item and resource lines.</p>
              </div>
              <div className="flex gap-2">
                <input value={newStageName} onChange={(e) => setNewStageName(e.target.value)} placeholder="Stage name" className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
                <button
                  onClick={() => {
                    const name = newStageName.trim()
                    if (!name || (draft.stages || []).includes(name)) return
                    setDraft((prev) => ({ ...prev, stages: [...(prev.stages || []), name] }))
                    setNewStageName('')
                  }}
                  className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:text-slate-100"
                >
                  Add Stage
                </button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(draft.stages || []).map((stage) => (
                <span key={stage} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">{stage}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-3 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Calculator size={16} />
              <span>Component grid with SAP-style issue method and cost rollup</span>
            </div>
            <button onClick={() => setDraft((prev) => ({ ...prev, lines: [...(Array.isArray(prev.lines) ? prev.lines : []), { stage: prev.stages?.[0] || 'Stage 1', type: 'Item', itemId: items[0]?.id || '', quantity: 1, warehouse: prev.warehouse || '04', issueMethod: 'Backflush', priceList: prev.priceList || 'MSRP', comments: '' }] }))} className="flex items-center gap-1 rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:text-slate-100">
              <Plus size={15} /> Add Row
            </button>
          </div>
          <div className="max-w-full overflow-x-auto">
            <table className="min-w-[2020px] table-fixed text-left text-sm">
              <thead className="bg-slate-100 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="w-10 px-3 py-2">#</th>
                  <th className="w-[140px]">Stage</th>
                  <th className="w-[130px]">Type</th>
                  <th className="w-[180px]">No.</th>
                  <th className="w-[300px]">Description</th>
                  <th className="w-[120px]">Quantity</th>
                  <th className="w-[100px]">UoM Name</th>
                  <th className="w-[110px]">Warehouse</th>
                  <th className="w-[140px]">Issue Method</th>
                  <th className="w-[150px]">Production Std Cost</th>
                  <th className="w-[170px]">Total Production Std Cost</th>
                  <th className="w-[120px]">Price List</th>
                  <th className="w-[120px]">Unit Price</th>
                  <th className="w-[120px]">Total</th>
                  <th className="w-[90px]">Weight</th>
                  <th className="w-[220px]">Comments</th>
                  <th className="w-[60px]"></th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(draft.lines) ? draft.lines : []).map((line, index) => {
                  const item = findItem(items, line.itemId)
                  const total = lineCost(line, items)
                  return (
                    <tr key={`${line.itemId}-${index}`} className="border-t border-slate-100 dark:border-slate-800 dark:text-slate-200">
                      <td className="px-3 py-2 text-slate-500">{index + 1}</td>
                      <td className="pr-2">
                        <select value={line.stage || draft.stages?.[0] || 'Stage 1'} onChange={(e) => updateLine(index, { stage: e.target.value })} className="w-full rounded border border-slate-300 px-2 py-1.5 dark:border-slate-700 dark:bg-slate-800">
                          {(draft.stages || ['Stage 1']).map((stage) => <option key={stage}>{stage}</option>)}
                        </select>
                      </td>
                      <td className="pr-2">
                        <select value={line.type} onChange={(e) => updateLine(index, { type: e.target.value })} className="w-full rounded border border-slate-300 px-2 py-1.5 dark:border-slate-700 dark:bg-slate-800">
                          <option>Item</option>
                          <option>Resource</option>
                          <option>Text</option>
                        </select>
                      </td>
                      <td className="pr-2">
                        <select value={line.itemId} onChange={(e) => updateLine(index, { itemId: e.target.value })} className="w-full rounded border border-slate-300 px-2 py-1.5 dark:border-slate-700 dark:bg-slate-800">
                          {items.filter((candidate) => line.type === 'Text' || candidate.category === line.type).map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.id}</option>)}
                        </select>
                      </td>
                      <td className="truncate pr-3" title={item?.name}>{item?.name}</td>
                      <td className="pr-2"><input value={line.quantity} onChange={(e) => updateLine(index, { quantity: Number(e.target.value || 0) })} type="number" min="0" step="0.01" className="w-full rounded border border-slate-300 px-2 py-1.5 text-right dark:border-slate-700 dark:bg-slate-800" /></td>
                      <td>{item?.uom}</td>
                      <td className="pr-2"><input value={line.warehouse} onChange={(e) => updateLine(index, { warehouse: e.target.value })} className="w-full rounded border border-slate-300 px-2 py-1.5 dark:border-slate-700 dark:bg-slate-800" /></td>
                      <td className="pr-2">
                        <select value={line.issueMethod} onChange={(e) => updateLine(index, { issueMethod: e.target.value })} className="w-full rounded border border-slate-300 px-2 py-1.5 dark:border-slate-700 dark:bg-slate-800">
                          <option>Backflush</option>
                          <option>Manual</option>
                        </select>
                      </td>
                      <td>{inr(item?.price)}</td>
                      <td>{inr(total)}</td>
                      <td className="pr-2">
                        <select value={line.priceList} onChange={(e) => updateLine(index, { priceList: e.target.value })} className="w-full rounded border border-slate-300 px-2 py-1.5 dark:border-slate-700 dark:bg-slate-800">
                          <option>MSRP</option>
                          <option>Purchase</option>
                          <option>Standard</option>
                        </select>
                      </td>
                      <td>{inr(item?.price)}</td>
                      <td className="font-semibold">{inr(total)}</td>
                      <td>{item?.weight}</td>
                      <td className="pr-2"><input value={line.comments} onChange={(e) => updateLine(index, { comments: e.target.value })} className="w-full rounded border border-slate-300 px-2 py-1.5 dark:border-slate-700 dark:bg-slate-800" /></td>
                      <td><button onClick={() => setDraft((prev) => ({ ...prev, lines: (Array.isArray(prev.lines) ? prev.lines : []).filter((_, lineIndex) => lineIndex !== index) }))} className="rounded border p-1.5 text-rose-600 dark:border-slate-700"><Trash2 size={15} /></button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 p-4 dark:border-slate-700">
            <div className="grid gap-1 text-sm">
              <span>Can make from stock: <b>{canMake(draft, items).toLocaleString('en-IN')}</b> parent units</span>
              <span>Margin per parent unit: <b className={margin >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}>{inr(margin)}</b></span>
            </div>
            <div className="grid gap-2 text-sm">
              <label className="flex items-center gap-3">Product Price <input value={draft.productPrice} onChange={(e) => setDraft({ ...draft, productPrice: Number(e.target.value || 0) })} type="number" min="0" step="0.01" className="w-36 rounded border border-slate-300 px-3 py-2 text-right dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" /></label>
              <p className="text-right font-semibold text-slate-900 dark:text-slate-100">BOM Cost {inr(productCost)}</p>
            </div>
          </div>
        </div>
      </div>

      <AddItemModal
        open={itemOpen}
        onClose={() => setItemOpen(false)}
        onCreate={(item) => {
          setItems((prev) => [item, ...prev])
          setItemOpen(false)
        }}
      />
    </section>
  )
}
