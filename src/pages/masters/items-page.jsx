import { useEffect, useMemo, useState } from 'react'
import { Boxes, Edit, PackagePlus, Search, X } from 'lucide-react'
import { StatusBadge } from '../../components/badges/status-badge'

const itemKey = 'aasa_bom_items'
const inr = (value) => `INR ${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

const seedItems = [
  { id: 'IT-GL-100', itemCode: 'RM-GL-100', name: 'Glass bottle body 100 ml', itemType: 'Raw Material', category: 'Bottle Body', uom: 'Each', alternateUnits: 'Box = 120 Each', hsn: '7010', purchaseRate: 38, saleRate: 0, price: 38, warehouse: 'RM Store A', minStock: 6000, reorderLevel: 9000, stock: 18640, batchTracking: true, qcRequired: true, isPurchased: true, isManufactured: false, isSaleable: false, status: 'Active' },
  { id: 'IT-CAP-M24', itemCode: 'RM-CAP-M24', name: 'Metal cap 24 mm', itemType: 'Raw Material', category: 'Cap', uom: 'Each', alternateUnits: 'Tray = 500 Each', hsn: '8309', purchaseRate: 14, saleRate: 0, price: 14, warehouse: 'RM Store B', minStock: 5000, reorderLevel: 8000, stock: 2240, batchTracking: true, qcRequired: true, isPurchased: true, isManufactured: false, isSaleable: false, status: 'Active' },
  { id: 'IT-PUMP-01', itemCode: 'RM-PUMP-01', name: 'Spray pump', itemType: 'Raw Material', category: 'Pump', uom: 'Each', alternateUnits: 'Bag = 1000 Each', hsn: '9616', purchaseRate: 11, saleRate: 0, price: 11, warehouse: 'RM Store B', minStock: 8000, reorderLevel: 12000, stock: 9420, batchTracking: true, qcRequired: true, isPurchased: true, isManufactured: false, isSaleable: false, status: 'Active' },
  { id: 'IT-PP-GRN', itemCode: 'RM-PP-GRN', name: 'PP granules', itemType: 'Raw Material', category: 'Plastic Granules', uom: 'Gram', alternateUnits: 'Kg = 1000 Gram', hsn: '3902', purchaseRate: 0.28, saleRate: 0, price: 0.28, warehouse: 'RM Store C', minStock: 90000, reorderLevel: 120000, stock: 18400, batchTracking: true, qcRequired: true, isPurchased: true, isManufactured: false, isSaleable: false, status: 'Active' },
  { id: 'FG-PB-100', itemCode: 'FG-PB-100', name: '100 ml Premium Perfume Bottle', itemType: 'Finished Goods', category: 'Perfume Bottle', uom: 'Each', alternateUnits: 'Carton = 48 Each', hsn: '7010', purchaseRate: 0, saleRate: 145, price: 92, warehouse: 'FG Store', minStock: 1200, reorderLevel: 2200, stock: 740, batchTracking: true, qcRequired: true, isPurchased: false, isManufactured: true, isSaleable: true, status: 'Active' },
  { id: 'SCR-PL-01', itemCode: 'SCR-PL-01', name: 'Rejected plastic scrap', itemType: 'Scrap / Waste', category: 'Reusable Scrap', uom: 'Kg', alternateUnits: 'Gram = 0.001 Kg', hsn: '3915', purchaseRate: 0, saleRate: 18, price: 8, warehouse: 'Scrap Yard', minStock: 0, reorderLevel: 0, stock: 210, batchTracking: false, qcRequired: false, isPurchased: false, isManufactured: false, isSaleable: true, status: 'Active' },
]

const readStored = () => {
  try {
    const raw = localStorage.getItem(itemKey)
    return raw ? JSON.parse(raw).map((item) => ({
      ...item,
      itemCode: item.itemCode || item.id,
      itemType: item.itemType || (item.category === 'Resource' ? 'Service' : 'Raw Material'),
      category: item.category === 'Item' ? 'General Material' : item.category,
      purchaseRate: Number(item.purchaseRate ?? item.price ?? 0),
      saleRate: Number(item.saleRate ?? 0),
      price: Number(item.price ?? item.purchaseRate ?? 0),
      warehouse: item.warehouse || '04',
      minStock: Number(item.minStock || 0),
      reorderLevel: Number(item.reorderLevel || 0),
      stock: Number(item.stock || 0),
      batchTracking: Boolean(item.batchTracking),
      qcRequired: Boolean(item.qcRequired),
      isPurchased: item.isPurchased ?? true,
      isManufactured: item.isManufactured ?? false,
      isSaleable: item.isSaleable ?? false,
      status: item.status || 'Active',
      weight: item.weight || '-',
    })) : seedItems
  } catch {
    return seedItems
  }
}

function toBomItem(item) {
  return {
    ...item,
    id: item.id || item.itemCode,
    category: item.itemType === 'Service' ? 'Resource' : 'Item',
    uom: item.uom,
    warehouse: item.warehouse,
    price: Number(item.price || item.purchaseRate || item.standardCost || 0),
    stock: Number(item.stock || 0),
  }
}

function ItemModal({ open, item, onClose, onSave }) {
  const [draft, setDraft] = useState(item || {})
  useEffect(() => {
    if (open) setDraft(item || { itemType: 'Raw Material', uom: 'Each', status: 'Draft', batchTracking: true, qcRequired: true, isPurchased: true, isManufactured: false, isSaleable: false })
  }, [open, item])
  if (!open) return null

  const update = (patch) => setDraft((prev) => ({ ...prev, ...patch }))
  const fieldInputClass = 'w-full rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
  const rowClass = 'grid grid-cols-[220px_minmax(0,1fr)] items-center border-b border-slate-100 py-2 dark:border-slate-800'
  const labelClass = 'text-sm font-medium text-slate-700 dark:text-slate-200'

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Item Master</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{item ? 'Edit Item' : 'Create Item'}</h2>
          </div>
          <button onClick={onClose} className="rounded border border-slate-300 p-2 dark:border-slate-700 dark:text-slate-100"><X size={16} /></button>
        </div>

        <div className="rounded-xl border border-slate-200 px-4 dark:border-slate-700">
          <div className={rowClass}><label className={labelClass}>Item Code</label><input value={draft.itemCode || ''} onChange={(e) => update({ itemCode: e.target.value, id: e.target.value })} className={fieldInputClass} /></div>
          <div className={rowClass}><label className={labelClass}>Item Name</label><input value={draft.name || ''} onChange={(e) => update({ name: e.target.value })} className={fieldInputClass} /></div>
          <div className={rowClass}><label className={labelClass}>Item Type</label><select value={draft.itemType || 'Raw Material'} onChange={(e) => update({ itemType: e.target.value })} className={fieldInputClass}><option>Raw Material</option><option>Packing Material</option><option>Semi-Finished Goods</option><option>Finished Goods</option><option>Scrap / Waste</option><option>Consumable</option><option>Service</option></select></div>
          <div className={rowClass}><label className={labelClass}>Category</label><input value={draft.category || ''} onChange={(e) => update({ category: e.target.value })} className={fieldInputClass} /></div>
          <div className={rowClass}><label className={labelClass}>Primary Unit</label><input value={draft.uom || ''} onChange={(e) => update({ uom: e.target.value })} className={fieldInputClass} /></div>
          <div className={rowClass}><label className={labelClass}>Alternate Units</label><input value={draft.alternateUnits || ''} onChange={(e) => update({ alternateUnits: e.target.value })} className={fieldInputClass} /></div>
          <div className={rowClass}><label className={labelClass}>HSN/Tax Code</label><input value={draft.hsn || ''} onChange={(e) => update({ hsn: e.target.value })} className={fieldInputClass} /></div>
          <div className={rowClass}><label className={labelClass}>Purchase Rate</label><input value={draft.purchaseRate || 0} onChange={(e) => update({ purchaseRate: Number(e.target.value || 0), price: Number(e.target.value || 0) })} type="number" min="0" step="0.01" className={fieldInputClass} /></div>
          <div className={rowClass}><label className={labelClass}>Sale Rate</label><input value={draft.saleRate || 0} onChange={(e) => update({ saleRate: Number(e.target.value || 0) })} type="number" min="0" step="0.01" className={fieldInputClass} /></div>
          <div className={rowClass}><label className={labelClass}>Standard Cost</label><input value={draft.price || 0} onChange={(e) => update({ price: Number(e.target.value || 0) })} type="number" min="0" step="0.01" className={fieldInputClass} /></div>
          <div className={rowClass}><label className={labelClass}>Default Warehouse</label><input value={draft.warehouse || ''} onChange={(e) => update({ warehouse: e.target.value })} className={fieldInputClass} /></div>
          <div className={rowClass}><label className={labelClass}>Min Stock Level</label><input value={draft.minStock || 0} onChange={(e) => update({ minStock: Number(e.target.value || 0) })} type="number" min="0" step="0.01" className={fieldInputClass} /></div>
          <div className={rowClass}><label className={labelClass}>Reorder Level</label><input value={draft.reorderLevel || 0} onChange={(e) => update({ reorderLevel: Number(e.target.value || 0) })} type="number" min="0" step="0.01" className={fieldInputClass} /></div>
          <div className={rowClass}><label className={labelClass}>Batch Tracking</label><select value={draft.batchTracking ? 'Yes' : 'No'} onChange={(e) => update({ batchTracking: e.target.value === 'Yes' })} className={fieldInputClass}><option>Yes</option><option>No</option></select></div>
          <div className={rowClass}><label className={labelClass}>QC Required</label><select value={draft.qcRequired ? 'Yes' : 'No'} onChange={(e) => update({ qcRequired: e.target.value === 'Yes' })} className={fieldInputClass}><option>Yes</option><option>No</option></select></div>
          <div className={rowClass}><label className={labelClass}>Is Purchased</label><select value={draft.isPurchased ? 'Yes' : 'No'} onChange={(e) => update({ isPurchased: e.target.value === 'Yes' })} className={fieldInputClass}><option>Yes</option><option>No</option></select></div>
          <div className={rowClass}><label className={labelClass}>Is Manufactured</label><select value={draft.isManufactured ? 'Yes' : 'No'} onChange={(e) => update({ isManufactured: e.target.value === 'Yes' })} className={fieldInputClass}><option>Yes</option><option>No</option></select></div>
          <div className={rowClass}><label className={labelClass}>Is Saleable</label><select value={draft.isSaleable ? 'Yes' : 'No'} onChange={(e) => update({ isSaleable: e.target.value === 'Yes' })} className={fieldInputClass}><option>Yes</option><option>No</option></select></div>
          <div className="grid grid-cols-[220px_minmax(0,1fr)] items-center py-2"><label className={labelClass}>Status</label><select value={draft.status || 'Draft'} onChange={(e) => update({ status: e.target.value })} className={fieldInputClass}><option>Draft</option><option>Active</option><option>Inactive</option></select></div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:text-slate-100">Cancel</button>
          <button disabled={!draft.itemCode || !draft.name} onClick={() => onSave({ ...draft, id: draft.itemCode })} className="rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-sky-600">Save Item</button>
        </div>
      </div>
    </div>
  )
}

export default function ItemsPage() {
  const [items, setItems] = useState(readStored)
  const [query, setQuery] = useState('')
  const [type, setType] = useState('All')
  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(itemKey, JSON.stringify(items.map(toBomItem)))
  }, [items])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return items.filter((item) => {
      const typeMatch = type === 'All' || item.itemType === type
      const queryMatch = !needle || JSON.stringify(item).toLowerCase().includes(needle)
      return typeMatch && queryMatch
    })
  }, [items, query, type])

  const counts = {
    total: items.length,
    rm: items.filter((item) => item.itemType === 'Raw Material').length,
    fg: items.filter((item) => item.itemType === 'Finished Goods').length,
    low: items.filter((item) => Number(item.stock) <= Number(item.reorderLevel)).length,
  }

  const saveItem = (payload) => {
    setItems((prev) => prev.some((item) => item.id === payload.id) ? prev.map((item) => item.id === payload.id ? payload : item) : [payload, ...prev])
    setModalOpen(false)
    setEditing(null)
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Home / Item Master</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Item Master</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Defines every raw material, packing item, semi-finished good, finished good, scrap, consumable, and service used across BOM, purchase, inventory, production, QC, packaging, dispatch, billing, and costing.</p>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true) }} className="flex items-center gap-2 rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white dark:bg-sky-600"><PackagePlus size={16} /> Create Item</button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"><p className="text-sm text-slate-500">Items</p><p className="mt-2 text-2xl font-semibold">{counts.total}</p><p className="text-xs text-slate-500">All item types</p></div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/30"><p className="text-sm text-slate-500">Raw Materials</p><p className="mt-2 text-2xl font-semibold">{counts.rm}</p><p className="text-xs text-slate-500">Available for BOM</p></div>
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 shadow-sm dark:border-sky-800 dark:bg-sky-950/30"><p className="text-sm text-slate-500">Finished Goods</p><p className="mt-2 text-2xl font-semibold">{counts.fg}</p><p className="text-xs text-slate-500">Available for sales</p></div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-800 dark:bg-amber-950/30"><p className="text-sm text-slate-500">Low Stock</p><p className="mt-2 text-2xl font-semibold">{counts.low}</p><p className="text-xs text-slate-500">At or below reorder level</p></div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search item code, name, type, category, HSN, warehouse..." className="w-full rounded border border-slate-300 py-2 pl-10 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          </div>
          <select value={type} onChange={(e) => setType(e.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            <option>All</option><option>Raw Material</option><option>Packing Material</option><option>Semi-Finished Goods</option><option>Finished Goods</option><option>Scrap / Waste</option><option>Consumable</option><option>Service</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-[1500px] table-fixed text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <tr><th className="w-[140px] px-4 py-3">Item Code</th><th className="w-[260px]">Item Name</th><th className="w-[170px]">Item Type</th><th className="w-[160px]">Category</th><th className="w-[110px]">Primary Unit</th><th className="w-[170px]">Alternate Units</th><th className="w-[120px]">HSN/Tax</th><th className="w-[120px]">Purchase Rate</th><th className="w-[120px]">Sale Rate</th><th className="w-[120px]">Standard Cost</th><th className="w-[150px]">Default Warehouse</th><th className="w-[120px]">Min Stock</th><th className="w-[120px]">Reorder</th><th className="w-[150px]">Flags</th><th className="w-[110px]">Status</th><th className="w-[90px]">Action</th></tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-t border-slate-100 dark:border-slate-800 dark:text-slate-200">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">{item.itemCode}</td>
                  <td><p className="font-medium">{item.name}</p></td>
                  <td>{item.itemType}</td>
                  <td>{item.category}</td>
                  <td>{item.uom}</td>
                  <td>{item.alternateUnits || '-'}</td>
                  <td>{item.hsn || '-'}</td>
                  <td>{inr(item.purchaseRate)}</td>
                  <td>{inr(item.saleRate)}</td>
                  <td>{inr(item.price)}</td>
                  <td>{item.warehouse}</td>
                  <td>{Number(item.minStock).toLocaleString('en-IN')}</td>
                  <td>{Number(item.reorderLevel).toLocaleString('en-IN')}</td>
                  <td className="text-xs">{item.isPurchased ? 'P ' : ''}{item.isManufactured ? 'M ' : ''}{item.isSaleable ? 'S ' : ''}{item.qcRequired ? 'QC ' : ''}{item.batchTracking ? 'Batch' : ''}</td>
                  <td><StatusBadge status={item.status === 'Active' ? 'Approved' : item.status === 'Inactive' ? 'Blocked' : 'Draft'} /></td>
                  <td><button onClick={() => { setEditing(item); setModalOpen(true) }} className="flex items-center gap-1 rounded bg-slate-900 px-2 py-1 text-xs font-semibold text-white dark:bg-sky-600"><Edit size={13} /> Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ItemModal open={modalOpen} item={editing} onClose={() => { setModalOpen(false); setEditing(null) }} onSave={saveItem} />
    </section>
  )
}
