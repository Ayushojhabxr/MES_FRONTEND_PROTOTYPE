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
const labourKey = 'aasa_labour_resources'
const machineKey = 'aasa_machine_resources'
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
      { stage: 'Assembly', type: 'Resource', resourceType: 'Labour', resourceCode: 'LAB-001', resourceUnit: 'Hr', quantity: 0.08, warehouse: '04', issueMethod: 'Manual', priceList: 'MSRP', comments: 'Assembly labour' },
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
      { stage: 'Moulding', type: 'Resource', resourceType: 'Machine', resourceCode: 'IM-450T-01', resourceUnit: 'Hr', quantity: 0.02, warehouse: '04', issueMethod: 'Manual', priceList: 'MSRP', comments: 'Moulding machine runtime' },
    ],
  },
]

const seedLabours = [
  { code: 'LAB-001', name: 'Ramesh Yadav', designation: 'Operator', workType: 'Operates injection moulding machines', costPerHour: 180, costPerMinute: 3, availability: 'Available', assignedMachine: 'IM-450T-01' },
  { code: 'LAB-002', name: 'Sunita Rao', designation: 'Operator', workType: 'Manual packing, labelling, carton sealing', costPerHour: 140, costPerMinute: 2.33, availability: 'Available', assignedMachine: 'PKG-LINE-02' },
  { code: 'LAB-003', name: 'Iqbal Khan', designation: 'Operator', workType: 'Runs UV curing and inspection line', costPerHour: 210, costPerMinute: 3.5, availability: 'On Shift', assignedMachine: 'UV-COAT-01' },
]

const seedMachines = [
  { code: 'IM-450T-01', name: 'Injection Moulding 450T', type: 'Injection', workCenter: 'Moulding Bay', costPerHour: 1250, costPerMinute: 20.83, capacityPerHour: 120, currentStatus: 'Running', efficiency: 91 },
  { code: 'UV-COAT-01', name: 'UV Coating Line', type: 'UV', workCenter: 'UV Section', costPerHour: 780, costPerMinute: 13, capacityPerHour: 340, currentStatus: 'Available', efficiency: 96 },
  { code: 'PKG-LINE-02', name: 'Automatic Packing Line 2', type: 'Packing', workCenter: 'Packing Section', costPerHour: 420, costPerMinute: 7, capacityPerHour: 520, currentStatus: 'Available', efficiency: 88 },
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
      resourceType: line.resourceType || undefined,
      resourceCode: line.resourceCode || undefined,
      resourceUnit: line.resourceUnit || undefined,
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

const normalizeResourceLine = (line, labours, machines) => {
  if (line?.type !== 'Resource') return line
  const inferredLabour = labours.find((labour) => labour.code === line.resourceCode || labour.code === line.itemId)
  const inferredMachine = machines.find((machine) => machine.code === line.resourceCode || machine.code === line.itemId)
  const resourceType = line.resourceType || (inferredMachine ? 'Machine' : 'Labour')
  const fallback = resourceType === 'Machine' ? machines[0] : labours[0]
  const selected = resourceType === 'Machine' ? inferredMachine : inferredLabour
  return {
    ...line,
    resourceType,
    resourceCode: line.resourceCode || selected?.code || fallback?.code || '',
    resourceUnit: line.resourceUnit || 'Hr',
  }
}

const findResource = (line, labours, machines) => {
  if (line?.type !== 'Resource') return null
  return line.resourceType === 'Machine'
    ? machines.find((machine) => machine.code === line.resourceCode) || machines[0]
    : labours.find((labour) => labour.code === line.resourceCode) || labours[0]
}

const resourceRate = (line, labours, machines) => {
  const resource = findResource(line, labours, machines)
  if (!resource) return 0
  return line.resourceUnit === 'Min' ? Number(resource.costPerMinute || 0) : Number(resource.costPerHour || 0)
}

const lineCost = (line, items, labours = seedLabours, machines = seedMachines) => {
  if (['Route Stage', 'Text'].includes(line?.type)) return 0
  if (line?.type === 'Resource') return Number(line?.quantity || 0) * resourceRate(line, labours, machines)
  return Number(line?.quantity || 0) * Number(findItem(items, line?.itemId)?.price || 0)
}

const bomCost = (bom, items, labours = seedLabours, machines = seedMachines) => (Array.isArray(bom?.lines) ? bom.lines : []).reduce((sum, line) => sum + lineCost(line, items, labours, machines), 0)

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
  const [labours, setLabours] = useState(() => readStored(labourKey, seedLabours))
  const [machines, setMachines] = useState(() => readStored(machineKey, seedMachines))
  const [products, setProducts] = useState(() => normalizeBoms(readStored(productKey, seedProducts), readStored(itemKey, seedItems)))
  const [selectedId, setSelectedId] = useState(() => normalizeBoms(readStored(productKey, seedProducts), readStored(itemKey, seedItems))[0]?.id)
  const [draft, setDraft] = useState(() => normalizeBoms(readStored(productKey, seedProducts), readStored(itemKey, seedItems))[0] || blankBom(seedItems))
  const [query, setQuery] = useState('')
  const [itemOpen, setItemOpen] = useState(false)
  const [viewMode, setViewMode] = useState('list')
  const [showThumbnails, setShowThumbnails] = useState(false)

  useEffect(() => { localStorage.setItem(itemKey, JSON.stringify(items)) }, [items])
  useEffect(() => { localStorage.setItem(productKey, JSON.stringify(products)) }, [products])

  useEffect(() => {
    const syncFromStorage = () => {
      const storedItems = readStored(itemKey, seedItems)
      const storedLabours = readStored(labourKey, seedLabours)
      const storedMachines = readStored(machineKey, seedMachines)
      const storedProducts = normalizeBoms(readStored(productKey, seedProducts), storedItems)
      setItems(storedItems)
      setLabours(storedLabours)
      setMachines(storedMachines)
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

  const lines = Array.isArray(draft.lines) ? draft.lines : []
  const normalizedLines = useMemo(() => lines.map((line) => normalizeResourceLine(line, labours, machines)), [lines, labours, machines])
  const productCost = bomCost({ ...draft, lines: normalizedLines }, items, labours, machines)
  const margin = Number(draft.productPrice || 0) - productCost
  const stageCount = Math.max((draft.stages || []).length, lines.filter((line) => line.type === 'Route Stage').length)
  const itemCount = lines.filter((line) => line.type === 'Item').length
  const resourceLines = lines.filter((line) => line.type === 'Resource')
  const labourResourceCount = resourceLines.filter((line) => normalizeResourceLine(line, labours, machines).resourceType !== 'Machine').length
  const machineResourceCount = resourceLines.filter((line) => normalizeResourceLine(line, labours, machines).resourceType === 'Machine').length

  const updateLine = (index, patch) => {
    setDraft((prev) => ({
      ...prev,
      lines: (Array.isArray(prev.lines) ? prev.lines : []).map((line, lineIndex) => lineIndex === index ? { ...line, ...patch } : line),
    }))
  }

  const addLineToStage = (stage, type = 'Item') => {
    const firstMatch = type === 'Route Stage' || type === 'Resource' ? null : items.find((item) => type === 'Text' || item.category === type) || items[0]
    const defaultLabour = labours[0]
    setDraft((prev) => ({
      ...prev,
      lines: [
        ...(Array.isArray(prev.lines) ? prev.lines : []),
        {
          stage,
          type,
          itemId: firstMatch?.id || '',
          resourceType: type === 'Resource' ? 'Labour' : undefined,
          resourceCode: type === 'Resource' ? defaultLabour?.code || '' : undefined,
          resourceUnit: type === 'Resource' ? 'Hr' : undefined,
          quantity: type === 'Route Stage' ? 0 : 1,
          warehouse: firstMatch?.warehouse || prev.warehouse || '04',
          issueMethod: type === 'Resource' || type === 'Route Stage' ? 'Manual' : 'Backflush',
          priceList: prev.priceList || 'MSRP',
          comments: type === 'Route Stage' ? stage : '',
        },
      ],
    }))
  }

  const removeStage = (stage) => {
    setDraft((prev) => {
      const stages = (prev.stages || []).filter((item) => item !== stage)
      return {
        ...prev,
        stages: stages.length ? stages : ['Stage 1'],
        lines: (Array.isArray(prev.lines) ? prev.lines : []).filter((line) => line.stage !== stage),
      }
    })
  }

  const saveBom = () => {
    const payload = normalizeBom({ ...draft, id: draft.id || `BOM-${Date.now()}`, lines: normalizedLines }, items)
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
                    <td>{inr(bomCost(product, items, labours, machines))}</td>
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
    <section className="w-full min-w-0 max-w-full space-y-4 overflow-hidden">
      <div className="w-full min-w-0 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-2 dark:border-slate-700 lg:flex-row lg:items-center lg:justify-between">
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

        <div className="grid min-w-0 gap-3 p-3 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Product Identity</h2>
            <div className="mt-2 grid gap-2 md:grid-cols-[1fr_6rem]">
              <label className="min-w-0">
                <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Product No.</span>
                <input value={draft.productNo} onChange={(e) => setDraft({ ...draft, productNo: e.target.value })} placeholder="FG-PB-100" className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Parent Qty</span>
                <input value={draft.parentQty} onChange={(e) => setDraft({ ...draft, parentQty: Number(e.target.value || 0) })} type="number" min="0" step="0.01" className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
              </label>
              <label className="md:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Description</span>
                <input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Finished product description" className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Planning</h2>
            <div className="mt-2 grid gap-2">
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">BOM Type</span>
                <select value={draft.bomType} onChange={(e) => setDraft({ ...draft, bomType: e.target.value })} className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                  <option>Production</option>
                  <option>Sales</option>
                  <option>Assembly</option>
                  <option>Template</option>
                </select>
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Warehouse</span>
                <input value={draft.warehouse} onChange={(e) => setDraft({ ...draft, warehouse: e.target.value })} className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Avg Production Size</span>
                <input value={draft.plannedAverageProductionSize} onChange={(e) => setDraft({ ...draft, plannedAverageProductionSize: Number(e.target.value || 0) })} type="number" min="0" step="0.01" className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Commercial</h2>
            <div className="mt-2 grid gap-2">
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Status</span>
                <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                  <option>Draft</option>
                  <option>Approved</option>
                  <option>On Hold</option>
                </select>
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Price List</span>
                <select value={draft.priceList} onChange={(e) => setDraft({ ...draft, priceList: e.target.value })} className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                  <option>MSRP</option>
                  <option>Purchase</option>
                  <option>Standard</option>
                </select>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md bg-slate-50 p-2 dark:bg-slate-800">
                  <p className="text-xs text-slate-500">BOM Cost</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{inr(productCost)}</p>
                </div>
                <div className="rounded-md bg-slate-50 p-2 dark:bg-slate-800">
                  <p className="text-xs text-slate-500">Margin</p>
                  <p className={`font-semibold ${margin >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>{inr(margin)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-200 p-3 dark:border-slate-700">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Production Stages</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Use Type = Route Stage for stage marker rows. Add item and resource rows below each stage.</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"><p className="text-xs text-slate-500">Stages</p><p className="text-sm font-semibold">{stageCount}</p></div>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"><p className="text-xs text-slate-500">Items</p><p className="text-sm font-semibold">{itemCount}</p></div>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"><p className="text-xs text-slate-500">Labour</p><p className="text-sm font-semibold">{labourResourceCount}</p></div>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"><p className="text-xs text-slate-500">Machines</p><p className="text-sm font-semibold">{machineResourceCount}</p></div>
              <label className="flex items-center justify-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">
                <input type="checkbox" checked={showThumbnails} onChange={(e) => setShowThumbnails(e.target.checked)} />
                Thumbnails
              </label>
            </div>
          </div>
        </div>
          <div className="w-full min-w-0 space-y-3 p-3">
            {(draft.stages || ['Stage 1']).map((stage) => {
              const stageLines = (Array.isArray(draft.lines) ? draft.lines : []).map((line, index) => ({ line, index })).filter(({ line }) => line.stage === stage)
              return (
                <div key={stage} className="w-full min-w-0 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{stage}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{stageLines.length} item/resource lines in this stage</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => addLineToStage(stage, 'Route Stage')} className="flex items-center gap-1 rounded border border-sky-200 bg-sky-50 px-2 py-1.5 text-xs text-sky-700 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-300"><Plus size={14} /> Stage Row</button>
                      <button onClick={() => addLineToStage(stage, 'Item')} className="flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"><Plus size={14} /> Add Item</button>
                      <button onClick={() => addLineToStage(stage, 'Resource')} className="flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"><Plus size={14} /> Add Resource</button>
                    </div>
                  </div>
                  <div className="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain">
                    <table className={`${showThumbnails ? 'min-w-[1780px]' : 'min-w-[1700px]'} table-fixed text-left text-sm`}>
                      <thead className="bg-slate-100 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <tr>
                          <th className="w-10 px-3 py-2">#</th>
                          {showThumbnails && <th className="w-[84px]">Image</th>}
                          <th className="w-[115px]">Type</th>
                          <th className="w-[120px]">Resource</th>
                          <th className="w-[155px]">No.</th>
                          <th className="w-[280px]">Description</th>
                          <th className="w-[100px]">Quantity</th>
                          <th className="w-[80px]">UoM</th>
                          <th className="w-[95px]">Warehouse</th>
                          <th className="w-[120px]">Issue Method</th>
                          <th className="w-[120px]">Std Cost</th>
                          <th className="w-[140px]">Total Std Cost</th>
                          <th className="w-[105px]">Price List</th>
                          <th className="w-[105px]">Unit Price</th>
                          <th className="w-[105px]">Total</th>
                          <th className="w-[70px]">Weight</th>
                          <th className="w-[180px]">Comments</th>
                          <th className="w-[60px]"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {stageLines.map(({ line: rawLine, index }, rowIndex) => {
                          const line = normalizeResourceLine(rawLine, labours, machines)
                          const isRouteStage = line.type === 'Route Stage'
                          const isResource = line.type === 'Resource'
                          const item = isRouteStage || isResource ? null : findItem(items, line.itemId)
                          const resource = isResource ? findResource(line, labours, machines) : null
                          const resourceOptions = line.resourceType === 'Machine' ? machines : labours
                          const total = lineCost(line, items, labours, machines)
                          const unitCost = isResource ? resourceRate(line, labours, machines) : item?.price
                          const description = isResource
                            ? line.resourceType === 'Machine'
                              ? `${resource?.name || ''}${resource?.workCenter ? ` / ${resource.workCenter}` : ''}`
                              : `${resource?.name || ''}${resource?.designation ? ` / ${resource.designation}` : ''}`
                            : item?.name
                          return (
                            <tr key={`${line.itemId}-${index}`} className={`border-t border-slate-100 dark:border-slate-800 dark:text-slate-200 ${isRouteStage ? 'bg-sky-50/70 dark:bg-sky-950/20' : ''}`}>
                              <td className="px-3 py-1 text-slate-500">{rowIndex + 1}</td>
                              {showThumbnails && (
                                <td>
                                  {!isRouteStage && item?.image ? <img src={item.image} alt={item.name} className="h-10 w-10 rounded border border-slate-200 object-cover dark:border-slate-700" /> : <span className="text-xs text-slate-400">-</span>}
                                </td>
                              )}
                              <td className="pr-2">
                                <select value={line.type} title="Change type. Route Stage makes this row a stage marker." onChange={(e) => {
                                  const nextType = e.target.value
                                  const firstMatch = nextType === 'Resource' || nextType === 'Route Stage' ? null : items.find((candidate) => nextType === 'Text' || candidate.category === nextType) || items[0]
                                  const defaultLabour = labours[0]
                                  updateLine(index, {
                                    type: nextType,
                                    itemId: nextType === 'Route Stage' ? '' : firstMatch?.id || line.itemId,
                                    resourceType: nextType === 'Resource' ? line.resourceType || 'Labour' : undefined,
                                    resourceCode: nextType === 'Resource' ? line.resourceCode || defaultLabour?.code || '' : undefined,
                                    resourceUnit: nextType === 'Resource' ? line.resourceUnit || 'Hr' : undefined,
                                    quantity: nextType === 'Route Stage' ? 0 : line.quantity || 1,
                                    issueMethod: nextType === 'Resource' || nextType === 'Route Stage' ? 'Manual' : 'Backflush',
                                  })
                                }} className="w-full rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800">
                                  <option>Route Stage</option>
                                  <option>Item</option>
                                  <option>Resource</option>
                                  <option>Text</option>
                                </select>
                              </td>
                              <td className="pr-2">
                                {isResource ? (
                                  <select
                                    value={line.resourceType}
                                    onChange={(e) => {
                                      const nextResourceType = e.target.value
                                      const nextList = nextResourceType === 'Machine' ? machines : labours
                                      updateLine(index, {
                                        resourceType: nextResourceType,
                                        resourceCode: nextList[0]?.code || '',
                                        resourceUnit: 'Hr',
                                      })
                                    }}
                                    className="w-full rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
                                  >
                                    <option>Labour</option>
                                    <option>Machine</option>
                                  </select>
                                ) : (
                                  <span className="text-xs text-slate-400">-</span>
                                )}
                              </td>
                              <td className="pr-2">
                                {isRouteStage ? (
                                  <span className="text-xs font-semibold text-sky-700 dark:text-sky-300">Stage Marker</span>
                                ) : isResource ? (
                                  <select value={line.resourceCode} onChange={(e) => updateLine(index, { resourceCode: e.target.value })} className="w-full rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800">
                                    {resourceOptions.map((candidate) => <option key={candidate.code} value={candidate.code}>{candidate.code}</option>)}
                                  </select>
                                ) : (
                                  <select value={line.itemId} onChange={(e) => updateLine(index, { itemId: e.target.value })} className="w-full rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800">
                                    {items.filter((candidate) => line.type === 'Text' || candidate.category === line.type).map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.id}</option>)}
                                  </select>
                                )}
                              </td>
                              <td className="truncate pr-3" title={isRouteStage ? (line.comments || stage) : description}>
                                {isRouteStage ? <input value={line.comments || stage} onChange={(e) => updateLine(index, { comments: e.target.value })} className="w-full rounded border border-sky-200 px-2 py-1 font-semibold dark:border-sky-800 dark:bg-slate-800" /> : description}
                              </td>
                              <td className="pr-2"><input value={line.quantity} disabled={isRouteStage} onChange={(e) => updateLine(index, { quantity: Number(e.target.value || 0) })} type="number" min="0" step="0.01" className="w-full rounded border border-slate-300 px-2 py-1 text-right disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:disabled:bg-slate-900" /></td>
                              <td>
                                {isResource ? (
                                  <select value={line.resourceUnit} onChange={(e) => updateLine(index, { resourceUnit: e.target.value })} className="w-full rounded border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800">
                                    <option>Hr</option>
                                    <option>Min</option>
                                  </select>
                                ) : isRouteStage ? '-' : item?.uom}
                              </td>
                              <td className="pr-2"><input value={line.warehouse} disabled={isRouteStage} onChange={(e) => updateLine(index, { warehouse: e.target.value })} className="w-full rounded border border-slate-300 px-2 py-1 disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:disabled:bg-slate-900" /></td>
                              <td className="pr-2">
                                <select value={line.issueMethod} disabled={isRouteStage} onChange={(e) => updateLine(index, { issueMethod: e.target.value })} className="w-full rounded border border-slate-300 px-2 py-1 disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:disabled:bg-slate-900">
                                  <option>Backflush</option>
                                  <option>Manual</option>
                                </select>
                              </td>
                              <td>{isRouteStage ? '-' : inr(unitCost)}</td>
                              <td>{inr(total)}</td>
                              <td className="pr-2">
                                <select value={line.priceList} disabled={isRouteStage} onChange={(e) => updateLine(index, { priceList: e.target.value })} className="w-full rounded border border-slate-300 px-2 py-1 disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:disabled:bg-slate-900">
                                  <option>MSRP</option>
                                  <option>Purchase</option>
                                  <option>Standard</option>
                                </select>
                              </td>
                              <td>{isRouteStage ? '-' : inr(unitCost)}</td>
                              <td className="font-semibold">{inr(total)}</td>
                              <td>{isResource ? (line.resourceType === 'Machine' ? `${resource?.efficiency || 0}%` : resource?.availability || '-') : isRouteStage ? '-' : item?.weight}</td>
                              <td className="pr-2"><input value={isRouteStage ? '' : line.comments} disabled={isRouteStage} onChange={(e) => updateLine(index, { comments: e.target.value })} className="w-full rounded border border-slate-300 px-2 py-1 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:disabled:bg-slate-900" /></td>
                              <td><button onClick={() => setDraft((prev) => ({ ...prev, lines: (Array.isArray(prev.lines) ? prev.lines : []).filter((_, lineIndex) => lineIndex !== index) }))} className="rounded border p-1.5 text-rose-600 dark:border-slate-700"><Trash2 size={15} /></button></td>
                            </tr>
                          )
                        })}
                        {!stageLines.length && (
                          <tr className="border-t border-slate-100 dark:border-slate-800">
                            <td colSpan={showThumbnails ? 19 : 18} className="px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-400">No lines in this stage yet. Use Stage Row, Add Item, or Add Resource.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
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
