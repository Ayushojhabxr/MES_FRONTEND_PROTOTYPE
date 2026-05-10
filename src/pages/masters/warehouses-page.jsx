import { useEffect, useMemo, useState } from 'react'
import { Boxes, Building2, MapPin, Plus, Search, Warehouse } from 'lucide-react'
import { StatusBadge } from '../../components/badges/status-badge'

const warehouseTypes = [
  { type: 'Raw Material Store', purpose: 'Stores purchased raw material', count: 2, tone: 'sky' },
  { type: 'Packaging Store', purpose: 'Stores packing material', count: 1, tone: 'violet' },
  { type: 'Production Floor / WIP', purpose: 'Material issued to production', count: 2, tone: 'indigo' },
  { type: 'QC Hold Area', purpose: 'Produced goods pending QC', count: 1, tone: 'amber' },
  { type: 'Rejected Store', purpose: 'Rejected production', count: 1, tone: 'rose' },
  { type: 'Scrap Store', purpose: 'Scrap/waste material', count: 1, tone: 'zinc' },
  { type: 'Finished Goods Store', purpose: 'Saleable goods', count: 2, tone: 'emerald' },
  { type: 'Dispatch Area', purpose: 'Goods ready to ship', count: 1, tone: 'cyan' },
]

const warehouseKey = 'aasa_warehouses'

const initialWarehouses = [
  {
    code: 'WH-RM-01',
    name: 'Raw Material Main Store',
    type: 'Raw Material Store',
    location: 'Plant 1 - North Bay',
    bin: 'R1-B01 to R1-B18',
    owner: 'Ravi Patel',
    defaultItems: 'MS Sheet, ABS Granules',
    stockValue: 1280440,
    status: 'Active',
  },
  {
    code: 'WH-PKG-01',
    name: 'Packaging Store',
    type: 'Packaging Store',
    location: 'Plant 1 - Packing Block',
    bin: 'P2-B01 to P2-B10',
    owner: 'Priya Menon',
    defaultItems: 'Cartons, Labels',
    stockValue: 435200,
    status: 'Active',
  },
  {
    code: 'WH-WIP-01',
    name: 'Line 1 WIP Floor',
    type: 'Production Floor / WIP',
    location: 'Shop Floor - Line 1',
    bin: 'WIP-L1',
    owner: 'Manoj Das',
    defaultItems: 'Issued RM, Semi-finished lots',
    stockValue: 612850,
    status: 'Active',
  },
  {
    code: 'WH-QC-01',
    name: 'QC Hold Cage',
    type: 'QC Hold Area',
    location: 'Quality Lab Entry',
    bin: 'QC-H01 to QC-H06',
    owner: 'Nisha Rao',
    defaultItems: 'Pending inspection batches',
    stockValue: 274500,
    status: 'Blocked',
  },
  {
    code: 'WH-REJ-01',
    name: 'Rejected Material Store',
    type: 'Rejected Store',
    location: 'Rear Yard - Secured',
    bin: 'RJ-B01 to RJ-B04',
    owner: 'Aditi Sharma',
    defaultItems: 'Rejected FG, failed QC lots',
    stockValue: 90500,
    status: 'Active',
  },
  {
    code: 'WH-FG-01',
    name: 'Finished Goods Main Store',
    type: 'Finished Goods Store',
    location: 'Plant 1 - South Bay',
    bin: 'FG-A01 to FG-D20',
    owner: 'Karan Singh',
    defaultItems: 'Saleable finished goods',
    stockValue: 1898800,
    status: 'Active',
  },
  {
    code: 'WH-DIS-01',
    name: 'Dispatch Staging Area',
    type: 'Dispatch Area',
    location: 'Gate 2 Loading Dock',
    bin: 'DCK-01 to DCK-08',
    owner: 'Vivek Joshi',
    defaultItems: 'Picked orders, loaded pallets',
    stockValue: 756300,
    status: 'Active',
  },
]

const readWarehouses = () => {
  try {
    const raw = localStorage.getItem(warehouseKey)
    return raw ? JSON.parse(raw) : initialWarehouses
  } catch {
    return initialWarehouses
  }
}

const moduleOutputs = [
  { label: 'Inventory Ledger', detail: 'Uses warehouse from/to for every movement.' },
  { label: 'Material Issue', detail: 'Moves stock from raw store to WIP.' },
  { label: 'QC Movement', detail: 'Routes produced goods to QC hold or rejected store.' },
  { label: 'Packaging / FG', detail: 'Moves packed goods to finished goods and dispatch.' },
]

const toneClasses = {
  sky: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200',
  violet: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-200',
  indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200',
  amber: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
  rose: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200',
  zinc: 'border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
  cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-200',
}

function CreateWarehouseModal({ open, onClose, onCreate }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const fd = new FormData(event.currentTarget)
          onCreate({
            code: fd.get('code'),
            name: fd.get('name'),
            type: fd.get('type'),
            location: fd.get('location'),
            bin: fd.get('bin'),
            owner: fd.get('owner'),
            defaultItems: fd.get('defaultItems'),
            stockValue: Number(fd.get('stockValue') || 0),
            status: fd.get('status'),
          })
        }}
        className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Create Warehouse</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Add warehouse master data, physical bin range, owner, and default item mapping.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:text-slate-100">
            Cancel
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <input name="code" required placeholder="Warehouse Code" className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          <input name="name" required placeholder="Warehouse Name" className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          <select name="type" className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            {warehouseTypes.map((item) => <option key={item.type}>{item.type}</option>)}
          </select>
          <input name="location" required placeholder="Physical Location" className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          <input name="bin" placeholder="Rack / Bin Location" className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          <input name="owner" required placeholder="Responsible Person" className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          <input name="defaultItems" required placeholder="Default Items" className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          <input name="stockValue" type="number" min="0" required placeholder="Stock Value" className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          <select name="status" className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            <option>Active</option>
            <option>Blocked</option>
            <option>Inactive</option>
          </select>
        </div>

        <div className="mt-5 flex justify-end">
          <button className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white dark:bg-sky-600">
            <Plus size={16} />
            Create Warehouse
          </button>
        </div>
      </form>
    </div>
  )
}

export default function WarehousesPage() {
  const [query, setQuery] = useState('')
  const [warehouses, setWarehouses] = useState(readWarehouses)
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(warehouseKey, JSON.stringify(warehouses))
  }, [warehouses])

  const filteredWarehouses = useMemo(
    () => warehouses.filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase())),
    [warehouses, query],
  )

  const totals = useMemo(() => ({
    active: warehouses.filter((item) => item.status === 'Active').length,
    blocked: warehouses.filter((item) => item.status === 'Blocked').length,
    bins: warehouses.reduce((sum, item) => sum + (item.bin.includes(' to ') ? 8 : 1), 0),
    value: warehouses.reduce((sum, item) => sum + item.stockValue, 0),
  }), [warehouses])

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 via-indigo-50 to-cyan-50 p-4 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-300">Home / Warehouse & Location Management</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Warehouses</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-600 dark:text-slate-300">Controls where stock is physically stored, blocked, issued, inspected, packed, and dispatched.</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-sky-600 to-indigo-700 px-3 py-2 text-sm font-medium text-white">
          <Plus size={16} />
          Create Warehouse
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-300">Warehouses</p>
          <p className="text-2xl font-semibold text-sky-700 dark:text-sky-300">{warehouses.length}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-300">Active</p>
          <p className="text-2xl font-semibold text-emerald-700 dark:text-emerald-300">{totals.active}</p>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-300">Blocked</p>
          <p className="text-2xl font-semibold text-rose-700 dark:text-rose-300">{totals.blocked}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-300">Stock Value</p>
          <p className="text-2xl font-semibold text-amber-700 dark:text-amber-300">INR {totals.value.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.9fr]">
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search warehouse code, type, location, bin, owner, or item mapping..."
                className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-sky-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <tr>
                  <th className="px-4 py-3">Warehouse Code</th>
                  <th className="px-4 py-3">Warehouse Name</th>
                  <th className="px-4 py-3">Warehouse Type</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Rack / Bin</th>
                  <th className="px-4 py-3">Responsible Person</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredWarehouses.map((warehouse) => (
                  <tr key={warehouse.code} className="border-t border-slate-100 dark:border-slate-800 dark:text-slate-200">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">{warehouse.code}</td>
                    <td className="px-4 py-3">{warehouse.name}</td>
                    <td className="px-4 py-3">{warehouse.type}</td>
                    <td className="px-4 py-3">{warehouse.location}</td>
                    <td className="px-4 py-3">{warehouse.bin || 'Optional'}</td>
                    <td className="px-4 py-3">{warehouse.owner}</td>
                    <td className="px-4 py-3"><StatusBadge status={warehouse.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
              <Boxes size={17} />
              Default Item Mapping
            </div>
            <div className="space-y-2">
              {warehouses.slice(0, 5).map((warehouse) => (
                <div key={warehouse.code} className="rounded-md border border-slate-200 p-2 text-sm dark:border-slate-700">
                  <p className="font-medium text-slate-800 dark:text-slate-100">{warehouse.code} - {warehouse.name}</p>
                  <p className="text-slate-500 dark:text-slate-400">{warehouse.defaultItems}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
            <Warehouse size={17} />
            Warehouse Types
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {warehouseTypes.map((item) => (
              <div key={item.type} className={`rounded-md border p-3 ${toneClasses[item.tone]}`}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold">{item.type}</p>
                  <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold dark:bg-slate-950/40">{item.count}</span>
                </div>
                <p className="mt-1 text-xs opacity-90">{item.purpose}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
            <Building2 size={17} />
            Output To Next Modules
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {moduleOutputs.map((item) => (
              <div key={item.label} className="rounded-md border border-slate-200 p-3 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-sky-600 dark:text-sky-300" />
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{item.label}</p>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CreateWarehouseModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(payload) => {
          setWarehouses((prev) => [payload, ...prev])
          setCreateOpen(false)
        }}
      />
    </section>
  )
}
