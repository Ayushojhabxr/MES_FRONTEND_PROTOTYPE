import { useMemo, useState } from 'react'
import { Activity, Factory, Gauge, Plus, Search, Users, Wrench } from 'lucide-react'
import { StatusBadge } from '../../components/badges/status-badge'

const initialLabours = [
  {
    code: 'LAB-001',
    name: 'Ramesh Yadav',
    position: 'Injection Machine Operator',
    workType: 'Operates injection moulding machines',
    department: 'Production',
    shift: 'Morning',
    shiftStart: '09:00',
    shiftEnd: '18:00',
    availableDays: 'Mon to Sat',
    availability: 'Available',
    costMode: 'Per Hour',
    costRate: 180,
    costPerHour: 180,
    costPerMinute: 3,
    assignedMachine: 'IM-450T-01',
    skillLevel: 'Senior',
    designation: 'Operator',
    reportingManager: 'Manoj Das',
    todayStatus: 'Working',
    assignedProduct: 'Cap mould',
    assignedBom: 'BOM-CAP-001',
    status: 'Active',
  },
  {
    code: 'LAB-002',
    name: 'Sunita Rao',
    position: 'Packaging Associate',
    workType: 'Manual packing, labelling, carton sealing',
    department: 'Packing',
    shift: 'General',
    shiftStart: '09:30',
    shiftEnd: '18:30',
    availableDays: 'Mon to Fri',
    availability: 'Available',
    costMode: 'Per Hour',
    costRate: 140,
    costPerHour: 140,
    costPerMinute: 2.33,
    assignedMachine: 'PKG-LINE-02',
    skillLevel: 'Skilled',
    designation: 'Operator',
    reportingManager: 'Priya Menon',
    todayStatus: 'Working',
    assignedProduct: 'Retail pack carton',
    assignedBom: 'BOM-PKG-014',
    status: 'Active',
  },
  {
    code: 'LAB-003',
    name: 'Iqbal Khan',
    position: 'UV Section Operator',
    workType: 'Runs UV curing and inspection line',
    department: 'Production',
    shift: 'Night',
    shiftStart: '21:00',
    shiftEnd: '06:00',
    availableDays: 'Tue to Sun',
    availability: 'On Shift',
    costMode: 'Per Minute',
    costRate: 3.5,
    costPerHour: 210,
    costPerMinute: 3.5,
    assignedMachine: 'UV-COAT-01',
    skillLevel: 'Senior',
    designation: 'Operator',
    reportingManager: 'Manoj Das',
    todayStatus: 'Working',
    assignedProduct: 'Coated plastic panel',
    assignedBom: 'BOM-UV-008',
    status: 'Active',
  },
  {
    code: 'LAB-004',
    name: 'Meena Sharma',
    position: 'Manual Work Helper',
    workType: 'Material movement, sorting, cleaning, manual assist',
    department: 'Production',
    shift: 'Morning',
    shiftStart: '09:00',
    shiftEnd: '18:00',
    availableDays: 'Mon to Sat',
    availability: 'Not Available',
    costMode: 'Per Hour',
    costRate: 110,
    costPerHour: 110,
    costPerMinute: 1.83,
    assignedMachine: 'Not assigned',
    skillLevel: 'Helper',
    designation: 'Helper',
    reportingManager: 'Ravi Patel',
    todayStatus: 'Idle',
    assignedProduct: 'Not assigned',
    assignedBom: 'Not assigned',
    status: 'Inactive',
  },
]

const initialMachines = [
  {
    code: 'IM-450T-01',
    name: 'Injection Moulding 450T',
    type: 'Injection',
    description: 'High tonnage injection moulding machine for cap and moulded component production.',
    department: 'Production',
    workCenter: 'Moulding Bay',
    capacityPerHour: 120,
    capacityPerDay: 2400,
    powerConsumption: '38 kWh',
    costPerHour: 1250,
    costPerMinute: 20.83,
    defaultOperator: 'Ramesh Yadav',
    allowedProducts: 'Cap mould, plastic housing, connector body',
    maintenanceSchedule: 'Every 30 days',
    currentStatus: 'Running',
    health: 'Good',
    efficiency: 91,
    todayStatus: 'Working',
    assignedProduct: 'Cap mould',
    assignedBom: 'BOM-CAP-001',
  },
  {
    code: 'UV-COAT-01',
    name: 'UV Coating Line',
    type: 'UV',
    description: 'UV coating and curing section used for surface finishing operations.',
    department: 'Production',
    workCenter: 'UV Section',
    capacityPerHour: 340,
    capacityPerDay: 6800,
    powerConsumption: '24 kWh',
    costPerHour: 780,
    costPerMinute: 13,
    defaultOperator: 'Iqbal Khan',
    allowedProducts: 'Printed panels, coated plastic parts',
    maintenanceSchedule: 'Every 21 days',
    currentStatus: 'Available',
    health: 'Excellent',
    efficiency: 96,
    todayStatus: 'Idle',
    assignedProduct: 'Not assigned',
    assignedBom: 'Not assigned',
  },
  {
    code: 'PKG-LINE-02',
    name: 'Automatic Packing Line 2',
    type: 'Packing',
    description: 'Carton forming, sealing, label application, and batch coding line.',
    department: 'Packing',
    workCenter: 'Packing Section',
    capacityPerHour: 520,
    capacityPerDay: 10400,
    powerConsumption: '12 kWh',
    costPerHour: 420,
    costPerMinute: 7,
    defaultOperator: 'Sunita Rao',
    allowedProducts: 'Finished goods cartons, retail packs',
    maintenanceSchedule: 'Every 45 days',
    currentStatus: 'Available',
    health: 'Good',
    efficiency: 88,
    todayStatus: 'Working',
    assignedProduct: 'Retail pack carton',
    assignedBom: 'BOM-PKG-014',
  },
  {
    code: 'MIX-RAW-01',
    name: 'Raw Material Mixer',
    type: 'Mixing',
    description: 'Pre-production material mixing for colour and additive preparation.',
    department: 'Production',
    workCenter: 'Raw Prep',
    capacityPerHour: 700,
    capacityPerDay: 5600,
    powerConsumption: '18 kWh',
    costPerHour: 520,
    costPerMinute: 8.67,
    defaultOperator: 'Not assigned',
    allowedProducts: 'ABS granule blends, masterbatch mixes',
    maintenanceSchedule: 'Every 15 days',
    currentStatus: 'Under Maintenance',
    health: 'Needs Service',
    efficiency: 62,
    todayStatus: 'Idle',
    assignedProduct: 'ABS granule blend',
    assignedBom: 'BOM-MIX-003',
  },
]

const maintenanceHistory = [
  {
    id: 'MNT-9001',
    machineCode: 'MIX-RAW-01',
    machineName: 'Raw Material Mixer',
    startDate: '2026-05-03',
    endDate: '2026-05-05',
    reason: 'Bearing noise and abnormal vibration during batch mixing.',
    actionTaken: 'Replaced bearing set, realigned shaft, tested motor load.',
    cost: 18500,
    status: 'Completed',
  },
  {
    id: 'MNT-9002',
    machineCode: 'IM-450T-01',
    machineName: 'Injection Moulding 450T',
    startDate: '2026-04-18',
    endDate: '2026-04-18',
    reason: 'Preventive maintenance as per 30-day schedule.',
    actionTaken: 'Hydraulic oil check, clamp calibration, nozzle cleaning.',
    cost: 9200,
    status: 'Completed',
  },
  {
    id: 'MNT-9003',
    machineCode: 'PKG-LINE-02',
    machineName: 'Automatic Packing Line 2',
    startDate: '2026-04-12',
    endDate: '2026-04-13',
    reason: 'Label applicator misalignment and sensor delay.',
    actionTaken: 'Sensor replacement, label head calibration, trial run approval.',
    cost: 12800,
    status: 'Completed',
  },
]

const resourceTypes = [
  { label: 'Machine', example: 'Injection moulding machine' },
  { label: 'Work Center', example: 'UV section, paint house, packing section' },
  { label: 'Human Resource', example: 'Operator, supervisor, helper' },
  { label: 'Tool / Mould', example: 'Cap mould, fixture, die' },
  { label: 'Shift', example: 'Morning, general, night' },
]

const moduleOutputs = [
  'BOM operation lines use work centers and machines.',
  'Production plan assigns machines and labour.',
  'Production execution tracks actual runtime and labour time.',
  'Costing uses machine runtime and labour rate.',
  'Maintenance uses machine status and history.',
  'Utilization reports use health, efficiency, and downtime.',
]

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const shiftTimes = Array.from({ length: 48 }, (_, index) => {
  const hours = String(Math.floor(index / 2)).padStart(2, '0')
  const minutes = index % 2 === 0 ? '00' : '30'
  return `${hours}:${minutes}`
})

function CreateLabourModal({ open, machines, labours, onClose, onCreate }) {
  if (!open) return null

  const fieldClass = 'rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
  const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'
  const sectionClass = 'rounded-lg border border-slate-200 p-4 dark:border-slate-700'
  const pairedClass = 'grid grid-cols-[minmax(0,1fr)_7.25rem] gap-2'

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const fd = new FormData(event.currentTarget)
          const submitMode = event.nativeEvent.submitter?.value
          const costRate = Number(fd.get('costRate') || 0)
          const costMode = fd.get('costMode')
          const costPerHour = costMode === 'Per Minute' ? costRate * 60 : costRate
          const costPerMinute = costMode === 'Per Minute' ? costRate : costRate / 60
          onCreate({
            resourceType: 'Labour',
            code: fd.get('code'),
            name: fd.get('name'),
            position: fd.get('designation'),
            designation: fd.get('designation'),
            workType: fd.get('workType'),
            department: fd.get('department'),
            shift: fd.get('shift'),
            shiftStart: fd.get('shiftStart'),
            shiftEnd: fd.get('shiftEnd'),
            availableDays: fd.getAll('availableDays').join(', '),
            availability: fd.get('availability'),
            costMode,
            costRate,
            costPerHour,
            costPerMinute,
            assignedMachine: fd.get('assignedMachine'),
            skillLevel: fd.get('skillLevel'),
            reportingManager: fd.get('reportingManager'),
            todayStatus: 'Idle',
            assignedProduct: 'Not assigned',
            assignedBom: 'Not assigned',
            status: submitMode === 'draft' ? 'Draft' : fd.get('status'),
          })
        }}
        className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Add Labour Resource</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Capture employee identity, 24-hour shift timing, skills, assignment, approval manager, and labour cost.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:text-slate-100">Cancel</button>
        </div>

        <div className="space-y-4">
          <div className={sectionClass}>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Employee Identity</h4>
            <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">Core employee master fields used for planning, assignment, and approvals.</p>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="min-w-0">
                <span className={labelClass}>Employee / Labour Code</span>
                <input name="code" required placeholder="Example: LAB-005" className={`${fieldClass} w-full`} />
              </label>
              <label className="min-w-0">
                <span className={labelClass}>Employee Name</span>
                <input name="name" required placeholder="Full name" className={`${fieldClass} w-full`} />
              </label>
              <label className="min-w-0">
                <span className={labelClass}>Department</span>
                <select name="department" className={`${fieldClass} w-full`}>
                  <option>Production</option>
                  <option>QC</option>
                  <option>Packing</option>
                  <option>Stores</option>
                  <option>Maintenance</option>
                </select>
              </label>
              <label className="min-w-0">
                <span className={labelClass}>Designation</span>
                <select name="designation" className={`${fieldClass} w-full`}>
                  <option>Operator</option>
                  <option>Supervisor</option>
                  <option>Manager</option>
                  <option>QC Inspector</option>
                  <option>Packaging Associate</option>
                  <option>Helper</option>
                </select>
              </label>
              <label className="min-w-0">
                <span className={labelClass}>Reporting Manager</span>
                <select name="reportingManager" className={`${fieldClass} w-full`}>
                  <option>Not assigned</option>
                  {labours.map((labour) => <option key={labour.code}>{labour.name}</option>)}
                </select>
              </label>
              <label className="min-w-0">
                <span className={labelClass}>Employee Status</span>
                <select name="status" defaultValue="Active" className={`${fieldClass} w-full`}>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </label>
            </div>
          </div>

          <div className={sectionClass}>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Shift & Availability</h4>
            <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">Use 24-hour time so production scheduling can calculate availability precisely.</p>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="min-w-0">
                <span className={labelClass}>Shift Type</span>
                <select name="shift" className={`${fieldClass} w-full`}>
                  <option>Morning</option>
                  <option>Evening</option>
                  <option>Night</option>
                  <option>General</option>
                </select>
              </label>
              <label className="min-w-0">
                <span className={labelClass}>Shift Start</span>
                <select name="shiftStart" defaultValue="09:00" className={`${fieldClass} w-full`}>
                  {shiftTimes.map((time) => <option key={`start-${time}`}>{time}</option>)}
                </select>
              </label>
              <label className="min-w-0">
                <span className={labelClass}>Shift End</span>
                <select name="shiftEnd" defaultValue="18:00" className={`${fieldClass} w-full`}>
                  {shiftTimes.map((time) => <option key={`end-${time}`}>{time}</option>)}
                </select>
              </label>
              <label className="min-w-0">
                <span className={labelClass}>Availability</span>
                <select name="availability" className={`${fieldClass} w-full`}>
                  <option>Available</option>
                  <option>On Shift</option>
                  <option>Not Available</option>
                </select>
              </label>
              <div className="min-w-0 md:col-span-3">
                <span className={labelClass}>Available Days</span>
                <div className="grid gap-2 sm:grid-cols-4 lg:grid-cols-7">
                  {weekDays.map((day) => (
                    <label key={day} className="flex items-center justify-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">
                      <input name="availableDays" type="checkbox" value={day} defaultChecked={day !== 'Sun'} className="h-4 w-4 rounded border-slate-300" />
                      {day}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Skill, Assignment & Costing</h4>
            <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">Map the labour to machine/manual work and maintain costing in hour or minute units.</p>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="min-w-0">
                <span className={labelClass}>Skill Type</span>
                <select name="workType" className={`${fieldClass} w-full`}>
                  <option>Machine Operator</option>
                  <option>QC Inspector</option>
                  <option>Packaging</option>
                  <option>Manual Work</option>
                  <option>Material Handling</option>
                  <option>Maintenance Support</option>
                </select>
              </label>
              <label className="min-w-0">
                <span className={labelClass}>Skill Level</span>
                <select name="skillLevel" className={`${fieldClass} w-full`}>
                  <option>Helper</option>
                  <option>Skilled</option>
                  <option>Senior</option>
                  <option>Supervisor</option>
                </select>
              </label>
              <label className="min-w-0">
                <span className={labelClass}>Assigned Machine / Work</span>
                <select name="assignedMachine" className={`${fieldClass} w-full`}>
                  <option>Manual Work</option>
                  <option>Not assigned</option>
                  {machines.map((machine) => <option key={machine.code}>{machine.code}</option>)}
                </select>
              </label>
              <label className="min-w-0">
                <span className={labelClass}>Labour Cost Rate</span>
                <div className={pairedClass}>
                  <input name="costRate" type="number" min="0" step="0.01" required placeholder="180" className={`${fieldClass} min-w-0 w-full`} />
                  <select name="costMode" className={`${fieldClass} min-w-0 w-full px-2`}>
                    <option>Per Hour</option>
                    <option>Per Minute</option>
                  </select>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button name="submitMode" value="draft" className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            <Plus size={16} />
            Save Labour Draft
          </button>
          <button name="submitMode" value="save" className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white dark:bg-sky-600">
            <Plus size={16} />
            Save Resource
          </button>
        </div>
      </form>
    </div>
  )
}

function CreateMachineModal({ open, labours, onClose, onCreate }) {
  if (!open) return null

  const fieldClass = 'rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
  const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'
  const sectionClass = 'rounded-lg border border-slate-200 p-4 dark:border-slate-700'
  const pairedClass = 'grid grid-cols-[minmax(0,1fr)_7.25rem] gap-2'

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const fd = new FormData(event.currentTarget)
          const submitMode = event.nativeEvent.submitter?.value
          const costRate = Number(fd.get('costRate') || 0)
          const costUnit = fd.get('costUnit')
          const costPerHour = costUnit === 'Per Minute' ? costRate * 60 : costRate
          const costPerMinute = costUnit === 'Per Minute' ? costRate : costRate / 60
          const powerValue = Number(fd.get('powerValue') || 0)
          const powerUnit = fd.get('powerUnit')
          onCreate({
            resourceType: 'Machine',
            code: fd.get('code'),
            name: fd.get('name'),
            type: fd.get('type'),
            description: fd.get('description'),
            department: fd.get('department'),
            workCenter: fd.get('workCenter'),
            capacityPerHour: Number(fd.get('capacityPerHour') || 0),
            capacityPerHourUnit: fd.get('capacityPerHourUnit'),
            capacityPerDay: Number(fd.get('capacityPerDay') || 0),
            capacityPerDayUnit: fd.get('capacityPerDayUnit'),
            powerConsumption: `${powerValue} ${powerUnit}`,
            powerValue,
            powerUnit,
            costRate,
            costUnit,
            costPerHour,
            costPerMinute,
            defaultOperator: fd.get('defaultOperator'),
            allowedProducts: fd.get('allowedProducts'),
            maintenanceSchedule: fd.get('maintenanceSchedule'),
            currentStatus: submitMode === 'draft' ? 'Draft' : fd.get('currentStatus'),
            health: fd.get('health'),
            efficiency: Number(fd.get('efficiency') || 0),
            todayStatus: 'Idle',
            assignedProduct: 'Not assigned',
            assignedBom: 'Not assigned',
          })
        }}
        className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Add Machine Resource</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Save as draft first. Capacity, power, and cost fields are grouped with their units.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:text-slate-100">Cancel</button>
        </div>

        <div className="space-y-4">
          <div className={sectionClass}>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Basic Identity</h4>
            <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">Name the machine and classify where it belongs.</p>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="min-w-0">
                <span className={labelClass}>Machine Code</span>
                <input name="code" required placeholder="Example: IM-450T-02" className={`${fieldClass} w-full`} />
              </label>
              <label className="min-w-0">
                <span className={labelClass}>Machine Name</span>
                <input name="name" required placeholder="Injection Moulding 450T" className={`${fieldClass} w-full`} />
              </label>
              <label className="min-w-0">
                <span className={labelClass}>Machine Type</span>
                <select name="type" className={`${fieldClass} w-full`}>
                  <option>Injection</option>
                  <option>UV</option>
                  <option>Packing</option>
                  <option>Mixing</option>
                  <option>Manual Support</option>
                </select>
              </label>
              <label className="min-w-0">
                <span className={labelClass}>Department</span>
                <select name="department" className={`${fieldClass} w-full`}>
                  <option>Production</option>
                  <option>QC</option>
                  <option>Packing</option>
                  <option>Maintenance</option>
                </select>
              </label>
              <label className="min-w-0">
                <span className={labelClass}>Work Center</span>
                <select name="workCenter" className={`${fieldClass} w-full`}>
                  <option>Moulding Bay</option>
                  <option>UV Section</option>
                  <option>Packing Section</option>
                  <option>Raw Prep</option>
                  <option>Paint House</option>
                </select>
              </label>
              <label className="min-w-0">
                <span className={labelClass}>Default Operator</span>
                <select name="defaultOperator" className={`${fieldClass} w-full`}>
                  <option>Not assigned</option>
                  {labours.map((labour) => <option key={labour.code}>{labour.name}</option>)}
                </select>
              </label>
            </div>
          </div>

          <div className={sectionClass}>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Capacity & Consumption</h4>
            <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">Each value is paired with a unit so planning and costing read the number correctly.</p>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="min-w-0">
                <span className={labelClass}>Hourly Capacity</span>
                <div className={pairedClass}>
                  <input name="capacityPerHour" type="number" min="0" required placeholder="120" className={`${fieldClass} min-w-0 w-full`} />
                  <select name="capacityPerHourUnit" className={`${fieldClass} min-w-0 w-full px-2`}>
                    <option>pcs/hr</option>
                    <option>kg/hr</option>
                    <option>batches/hr</option>
                    <option>cycles/hr</option>
                  </select>
                </div>
              </label>
              <label className="min-w-0">
                <span className={labelClass}>Daily Capacity</span>
                <div className={pairedClass}>
                  <input name="capacityPerDay" type="number" min="0" required placeholder="2400" className={`${fieldClass} min-w-0 w-full`} />
                  <select name="capacityPerDayUnit" className={`${fieldClass} min-w-0 w-full px-2`}>
                    <option>pcs/day</option>
                    <option>kg/day</option>
                    <option>batches/day</option>
                    <option>cycles/day</option>
                  </select>
                </div>
              </label>
              <label className="min-w-0">
                <span className={labelClass}>Power Consumption</span>
                <div className={pairedClass}>
                  <input name="powerValue" type="number" min="0" step="0.01" required placeholder="38" className={`${fieldClass} min-w-0 w-full`} />
                  <select name="powerUnit" className={`${fieldClass} min-w-0 w-full px-2`}>
                    <option>kWh/hr</option>
                    <option>kW</option>
                    <option>HP</option>
                  </select>
                </div>
              </label>
            </div>
          </div>

          <div className={sectionClass}>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Costing & Availability</h4>
            <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">Cost rate can be entered per hour or per minute; the system keeps both for reporting.</p>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="min-w-0">
                <span className={labelClass}>Machine Cost Rate</span>
                <div className={pairedClass}>
                  <input name="costRate" type="number" min="0" step="0.01" required placeholder="1250" className={`${fieldClass} min-w-0 w-full`} />
                  <select name="costUnit" className={`${fieldClass} min-w-0 w-full px-2`}>
                    <option>Per Hour</option>
                    <option>Per Minute</option>
                  </select>
                </div>
              </label>
              <label className="min-w-0">
                <span className={labelClass}>Current Status</span>
                <select name="currentStatus" defaultValue="Available" className={`${fieldClass} w-full`}>
                  <option>Available</option>
                  <option>Running</option>
                  <option>Idle</option>
                  <option>Under Maintenance</option>
                  <option>Breakdown</option>
                  <option>Inactive</option>
                </select>
              </label>
              <label className="min-w-0">
                <span className={labelClass}>Machine Health</span>
                <select name="health" className={`${fieldClass} w-full`}>
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Needs Service</option>
                  <option>Critical</option>
                </select>
              </label>
              <label className="min-w-0">
                <span className={labelClass}>Efficiency %</span>
                <input name="efficiency" type="number" min="0" max="100" required placeholder="91" className={`${fieldClass} w-full`} />
              </label>
              <label className="min-w-0">
                <span className={labelClass}>Maintenance Schedule</span>
                <select name="maintenanceSchedule" className={`${fieldClass} w-full`}>
                  <option>Every 15 days</option>
                  <option>Every 21 days</option>
                  <option>Every 30 days</option>
                  <option>Every 45 days</option>
                  <option>Every 60 days</option>
                </select>
              </label>
              <label className="min-w-0">
                <span className={labelClass}>Allowed Products</span>
                <input name="allowedProducts" required placeholder="Cap mould, plastic housing" className={`${fieldClass} w-full`} />
              </label>
            </div>
          </div>

          <div className={sectionClass}>
            <label>
              <span className={labelClass}>Machine Description</span>
              <textarea name="description" required placeholder="Describe where this machine is used, what it can manufacture, and any operating constraints." className={`${fieldClass} min-h-24 w-full`} />
            </label>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button name="submitMode" value="draft" className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            <Plus size={16} />
            Save Machine Draft
          </button>
          <button name="submitMode" value="save" className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white dark:bg-sky-600">
            <Plus size={16} />
            Save Resource
          </button>
        </div>
      </form>
    </div>
  )
}

const resourceFields = {
  Labour: [
    ['code', 'Labour Code'],
    ['name', 'Labour Name'],
    ['designation', 'Designation'],
    ['workType', 'Skill / Work Type'],
    ['department', 'Department'],
    ['shift', 'Shift'],
    ['shiftStart', 'Shift Start'],
    ['shiftEnd', 'Shift End'],
    ['availableDays', 'Available Days'],
    ['todayStatus', 'Today Status'],
    ['assignedMachine', 'Assigned Machine / Work'],
    ['assignedProduct', 'Assigned Product'],
    ['assignedBom', 'Assigned BOM'],
    ['reportingManager', 'Reporting Manager'],
    ['availability', 'Availability'],
    ['status', 'Employee Status'],
  ],
  Machine: [
    ['code', 'Machine Code'],
    ['name', 'Machine Name'],
    ['type', 'Machine Type'],
    ['department', 'Department'],
    ['workCenter', 'Work Center'],
    ['defaultOperator', 'Operator'],
    ['todayStatus', 'Today Status'],
    ['assignedProduct', 'Assigned Product'],
    ['assignedBom', 'Assigned BOM'],
    ['capacityPerHour', 'Capacity / Hour'],
    ['capacityPerDay', 'Capacity / Day'],
    ['costPerHour', 'Cost / Hour'],
    ['health', 'Health'],
    ['efficiency', 'Efficiency %'],
    ['currentStatus', 'Current Status'],
  ],
}

function ResourceDetailModal({ open, mode, resourceType, record, onClose, onModeChange, onSave }) {
  const [draft, setDraft] = useState(record || {})

  if (!open || !record) return null

  const fields = resourceFields[resourceType]
  const isEdit = mode === 'edit'
  const title = `${resourceType} Resource`

  const setValue = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSave(draft)
        }}
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{record.code} / {record.name}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:text-slate-100">Close</button>
        </div>

        <div className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Today</p>
            <StatusBadge status={draft.todayStatus || 'Idle'} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Product</p>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{draft.assignedProduct || 'Not assigned'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">BOM</p>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{draft.assignedBom || 'Not assigned'}</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {fields.map(([key, label]) => (
            <label key={key} className="min-w-0 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
              {isEdit ? (
                <input
                  value={draft[key] ?? ''}
                  onChange={(event) => setValue(key, event.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              ) : (
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{String(draft[key] ?? '-')}</p>
              )}
            </label>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {!isEdit && <button type="button" onClick={() => onModeChange('edit')} className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white dark:bg-sky-600">Edit Resource</button>}
          {isEdit && <button className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white dark:bg-sky-600">Save Changes</button>}
        </div>
      </form>
    </div>
  )
}

export default function MachinesPage() {
  const [activeView, setActiveView] = useState('Labour')
  const [query, setQuery] = useState('')
  const [labours, setLabours] = useState(initialLabours)
  const [machines, setMachines] = useState(initialMachines)
  const [createLabourOpen, setCreateLabourOpen] = useState(false)
  const [createMachineOpen, setCreateMachineOpen] = useState(false)
  const [selectedResource, setSelectedResource] = useState(null)
  const [resourceModalMode, setResourceModalMode] = useState('view')

  const filteredLabours = useMemo(
    () => labours.filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase())),
    [labours, query],
  )

  const filteredMachines = useMemo(
    () => machines.filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase())),
    [machines, query],
  )

  const filteredMaintenance = useMemo(
    () => maintenanceHistory.filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase())),
    [query],
  )

  const machineCost = machines.reduce((sum, item) => sum + item.costPerHour, 0)
  const averageEfficiency = machines.length ? Math.round(machines.reduce((sum, item) => sum + item.efficiency, 0) / machines.length) : 0

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 via-indigo-50 to-cyan-50 p-4 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-300">Home / Resource Management</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Resources</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-600 dark:text-slate-300">Defines production capacity, labour availability, machine capability, runtime cost, and maintenance readiness.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setCreateLabourOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-sky-600 to-indigo-700 px-3 py-2 text-sm font-medium text-white">
            <Plus size={16} />
            Add Labour Resource
          </button>
          <button onClick={() => setCreateMachineOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            <Plus size={16} />
            Add Machine Resource
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><Users size={16} /> Labour Resources</div>
          <p className="text-2xl font-semibold text-sky-700 dark:text-sky-300">{labours.length}</p>
        </div>
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><Factory size={16} /> Machines</div>
          <p className="text-2xl font-semibold text-indigo-700 dark:text-indigo-300">{machines.length}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><Gauge size={16} /> Avg Efficiency</div>
          <p className="text-2xl font-semibold text-emerald-700 dark:text-emerald-300">{averageEfficiency}%</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><Activity size={16} /> Machine Cost / Hr</div>
          <p className="text-2xl font-semibold text-amber-700 dark:text-amber-300">INR {machineCost.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_0.85fr]">
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                {['Labour', 'Machines', 'Maintenance History'].map((view) => (
                  <button
                    key={view}
                    onClick={() => setActiveView(view)}
                    className={`rounded-md px-3 py-2 text-sm font-medium ${activeView === view ? 'bg-slate-900 text-white dark:bg-sky-600' : 'border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200'}`}
                  >
                    {view}
                  </button>
                ))}
              </div>
              <div className="relative min-w-0 md:w-96">
                <Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search resource code, name, status, shift, department..."
                  className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {activeView === 'Labour' && (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <table className="min-w-[1320px] text-left text-sm">
                <thead className="bg-sky-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <tr>
                    <th className="px-4 py-3">Labour Code</th>
                    <th className="px-4 py-3">Labour Name</th>
                    <th className="px-4 py-3">Position / Work</th>
                    <th className="px-4 py-3">Shift / Days</th>
                    <th className="px-4 py-3">Cost</th>
                    <th className="px-4 py-3">Machine / Work Area</th>
                    <th className="px-4 py-3">Product / BOM</th>
                    <th className="px-4 py-3">Availability / Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLabours.map((labour) => (
                    <tr key={labour.code} className="border-t border-slate-100 dark:border-slate-800 dark:text-slate-200">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">{labour.code}</td>
                      <td className="px-4 py-3">{labour.name}<p className="text-xs text-slate-500">{labour.skillLevel}</p></td>
                      <td className="px-4 py-3">{labour.designation || labour.position}<p className="text-xs text-slate-500">{labour.workType}</p></td>
                      <td className="px-4 py-3">{labour.shift}<p className="text-xs text-slate-500">{labour.shiftStart || '09:00'} to {labour.shiftEnd || '18:00'} / {labour.availableDays}</p></td>
                      <td className="px-4 py-3">INR {labour.costRate || labour.costPerHour}/{labour.costMode === 'Per Minute' ? 'min' : 'hr'}<p className="text-xs text-slate-500">INR {Number(labour.costPerHour).toFixed(2)}/hr</p></td>
                      <td className="px-4 py-3">{labour.assignedMachine}<p className="text-xs text-slate-500">Mgr: {labour.reportingManager || 'Not assigned'}</p></td>
                      <td className="px-4 py-3">{labour.assignedProduct || 'Not assigned'}<p className="text-xs text-slate-500">{labour.assignedBom || 'Not assigned'}</p></td>
                      <td className="px-4 py-3"><div className="flex flex-wrap gap-2"><StatusBadge status={labour.todayStatus || 'Idle'} /><StatusBadge status={labour.availability} /><StatusBadge status={labour.status} /></div></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => { setSelectedResource({ type: 'Labour', record: labour }); setResourceModalMode('view') }} className="rounded bg-slate-900 px-2 py-1 text-xs text-white dark:bg-sky-600">View</button>
                          <button onClick={() => { setSelectedResource({ type: 'Labour', record: labour }); setResourceModalMode('edit') }} className="rounded border px-2 py-1 text-xs dark:border-slate-600 dark:text-slate-100">Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeView === 'Machines' && (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <table className="min-w-[1320px] text-left text-sm">
                <thead className="bg-sky-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <tr>
                    <th className="px-4 py-3">Machine Code</th>
                    <th className="px-4 py-3">Machine Details</th>
                    <th className="px-4 py-3">Work Center</th>
                    <th className="px-4 py-3">Capacity</th>
                    <th className="px-4 py-3">Cost</th>
                    <th className="px-4 py-3">Operator / Health</th>
                    <th className="px-4 py-3">Product / BOM</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMachines.map((machine) => (
                    <tr key={machine.code} className="border-t border-slate-100 dark:border-slate-800 dark:text-slate-200">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">{machine.code}</td>
                      <td className="px-4 py-3">{machine.name}<p className="max-w-sm text-xs text-slate-500">{machine.description}</p></td>
                      <td className="px-4 py-3">{machine.workCenter}<p className="text-xs text-slate-500">{machine.department} / {machine.type}</p></td>
                      <td className="px-4 py-3">{machine.capacityPerHour} {machine.capacityPerHourUnit || 'pcs/hr'}<p className="text-xs text-slate-500">{machine.capacityPerDay} {machine.capacityPerDayUnit || 'pcs/day'}</p></td>
                      <td className="px-4 py-3">INR {machine.costRate || machine.costPerHour}/{machine.costUnit === 'Per Minute' ? 'min' : 'hr'}<p className="text-xs text-slate-500">INR {Number(machine.costPerHour).toFixed(2)}/hr</p></td>
                      <td className="px-4 py-3">{machine.defaultOperator}<p className="text-xs text-slate-500">{machine.health} / {machine.efficiency}% efficiency</p></td>
                      <td className="px-4 py-3">{machine.assignedProduct || 'Not assigned'}<p className="text-xs text-slate-500">{machine.assignedBom || 'Not assigned'}</p></td>
                      <td className="px-4 py-3"><div className="flex flex-wrap gap-2"><StatusBadge status={machine.todayStatus || 'Idle'} /><StatusBadge status={machine.currentStatus} /></div></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => { setSelectedResource({ type: 'Machine', record: machine }); setResourceModalMode('view') }} className="rounded bg-slate-900 px-2 py-1 text-xs text-white dark:bg-sky-600">View</button>
                          <button onClick={() => { setSelectedResource({ type: 'Machine', record: machine }); setResourceModalMode('edit') }} className="rounded border px-2 py-1 text-xs dark:border-slate-600 dark:text-slate-100">Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeView === 'Maintenance History' && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-sky-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <tr>
                    <th className="px-4 py-3">Maintenance ID</th>
                    <th className="px-4 py-3">Machine</th>
                    <th className="px-4 py-3">Dates</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Action Taken</th>
                    <th className="px-4 py-3">Cost</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaintenance.map((record) => (
                    <tr key={record.id} className="border-t border-slate-100 dark:border-slate-800 dark:text-slate-200">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">{record.id}</td>
                      <td className="px-4 py-3">{record.machineCode}<p className="text-xs text-slate-500">{record.machineName}</p></td>
                      <td className="px-4 py-3">{record.startDate}<p className="text-xs text-slate-500">to {record.endDate}</p></td>
                      <td className="px-4 py-3 max-w-xs">{record.reason}</td>
                      <td className="px-4 py-3 max-w-xs">{record.actionTaken}</td>
                      <td className="px-4 py-3">INR {record.cost.toLocaleString()}</td>
                      <td className="px-4 py-3"><StatusBadge status={record.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
              <Factory size={17} />
              Resource Types
            </div>
            <div className="space-y-2">
              {resourceTypes.map((item) => (
                <div key={item.label} className="rounded-md border border-slate-200 p-3 dark:border-slate-700">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{item.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.example}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
              <Wrench size={17} />
              Machine Status Flow
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex flex-wrap items-center gap-2"><StatusBadge status="Available" /><span className="text-slate-400">to</span><StatusBadge status="Running" /><span className="text-slate-400">to</span><StatusBadge status="Idle" /></div>
              <div className="flex flex-wrap items-center gap-2"><StatusBadge status="Available" /><span className="text-slate-400">to</span><StatusBadge status="Under Maintenance" /><span className="text-slate-400">to</span><StatusBadge status="Available" /></div>
              <div className="flex flex-wrap items-center gap-2"><StatusBadge status="Running" /><span className="text-slate-400">to</span><StatusBadge status="Breakdown" /><span className="text-slate-400">to</span><StatusBadge status="Under Maintenance" /></div>
              <StatusBadge status="Inactive" />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
              <Activity size={17} />
              Output To Next Modules
            </div>
            <div className="space-y-2">
              {moduleOutputs.map((item) => (
                <div key={item} className="rounded-md border border-slate-200 p-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">{item}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CreateLabourModal
        open={createLabourOpen}
        machines={machines}
        labours={labours}
        onClose={() => setCreateLabourOpen(false)}
        onCreate={(payload) => {
          setLabours((prev) => [payload, ...prev])
          setActiveView('Labour')
          setCreateLabourOpen(false)
        }}
      />
      <CreateMachineModal
        open={createMachineOpen}
        labours={labours}
        onClose={() => setCreateMachineOpen(false)}
        onCreate={(payload) => {
          setMachines((prev) => [payload, ...prev])
          setActiveView('Machines')
          setCreateMachineOpen(false)
        }}
      />
      <ResourceDetailModal
        open={!!selectedResource}
        mode={resourceModalMode}
        resourceType={selectedResource?.type}
        record={selectedResource?.record}
        onClose={() => setSelectedResource(null)}
        onModeChange={setResourceModalMode}
        onSave={(payload) => {
          if (selectedResource?.type === 'Labour') {
            setLabours((prev) => prev.map((item) => (item.code === selectedResource.record.code ? payload : item)))
          } else {
            setMachines((prev) => prev.map((item) => (item.code === selectedResource.record.code ? payload : item)))
          }
          setSelectedResource(null)
        }}
      />
    </section>
  )
}
