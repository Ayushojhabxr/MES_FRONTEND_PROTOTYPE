import { Fragment, useMemo, useState } from 'react'
import { CalendarDays, Clock3, Factory, ListChecks, Package, Plus, Search, UserRoundCheck } from 'lucide-react'
import { StatusBadge } from '../../components/badges/status-badge'

const storageKey = 'aasa_production_plans'
const labourKey = 'aasa_labour_resources'
const machineKey = 'aasa_machine_resources'
const itemKey = 'aasa_bom_items'
const bomKey = 'aasa_bom_products'

const stages = ['Can Prep', 'Filling', 'Valve Crimping', 'Leak Test', 'Customer Labelling', 'Packing', 'QC Release']
const shifts = [
  { name: 'Morning', time: '09:00-18:00' },
  { name: 'General', time: '10:00-19:00' },
  { name: 'Night', time: '21:00-06:00' },
]
const facilities = ['Plant 1 / Filling Line 1', 'Plant 1 / Filling Line 2', 'Plant 1 / Labelling Line', 'Plant 2 / Heavy Fill Line', 'Plant 2 / Packing Hall']
const products = [
  { code: 'AERO-200-NOVA', name: '200 ml Aerosol Can - NovaCare Label', bom: 'BOM-AERO-200-NOVA', size: '200 ml' },
  { code: 'AERO-300-FRESH', name: '300 ml Aerosol Can - FreshMist Label', bom: 'BOM-AERO-300-FRESH', size: '300 ml' },
  { code: 'AERO-500-IND', name: '500 ml Aerosol Can - IndustrialPro Label', bom: 'BOM-AERO-500-IND', size: '500 ml' },
  { code: 'AERO-200-LUXE', name: '200 ml Perfume Can - LuxeAura Brand', bom: 'BOM-AERO-200-LUXE', size: '200 ml' },
  { code: 'AERO-300-ELYS', name: '300 ml Perfume Can - Elysian Scents', bom: 'BOM-AERO-300-ELYS', size: '300 ml' },
]
const customers = ['NovaCare Industries', 'FreshMist Hygiene Pvt Ltd', 'AeroChem Solutions', 'LuxeAura Perfumes', 'Elysian Scents Pvt Ltd', 'PrimeShield Consumer Products']

const demoMachines = [
  { code: 'AIR-BLOW-01', name: 'Can Cleaning / Air Blow Station', workCenter: 'Can Prep', currentStatus: 'Available' },
  { code: 'FILL-L1', name: 'Aerosol Filling Line 1', workCenter: 'Filling Hall', currentStatus: 'Running' },
  { code: 'FILL-L2', name: 'Aerosol Filling Line 2', workCenter: 'Filling Hall', currentStatus: 'Available' },
  { code: 'FILL-H1', name: 'Heavy Fill Line 500 ml', workCenter: 'Plant 2 Heavy Fill', currentStatus: 'Available' },
  { code: 'CRIMP-01', name: 'Valve Crimping Machine 1', workCenter: 'Crimping', currentStatus: 'Available' },
  { code: 'CRIMP-02', name: 'Valve Crimping Machine 2', workCenter: 'Crimping', currentStatus: 'Available' },
  { code: 'LEAK-CHK-01', name: 'Leak Testing Station 1', workCenter: 'QC Inline', currentStatus: 'Available' },
  { code: 'LBL-01', name: 'Customer Label Applicator', workCenter: 'Labelling', currentStatus: 'Available' },
  { code: 'LBL-PERF-01', name: 'Perfume Label Applicator 1', workCenter: 'Perfume Labelling', currentStatus: 'Available' },
  { code: 'PKG-LINE-01', name: 'Carton Packing Line 1', workCenter: 'Packing', currentStatus: 'Available' },
  { code: 'QC-BENCH-01', name: 'QC Release Bench', workCenter: 'Quality', currentStatus: 'Available' },
]

const demoLabours = [
  { code: 'LAB-CP-01', name: 'Meena Sharma', designation: 'Can Prep Helper', availability: 'Available' },
  { code: 'LAB-FILL-01', name: 'Ramesh Yadav', designation: 'Filling Operator', availability: 'Available' },
  { code: 'LAB-CRIMP-01', name: 'Iqbal Khan', designation: 'Crimping Operator', availability: 'On Shift' },
  { code: 'LAB-QC-01', name: 'Nisha Rao', designation: 'QC Inspector', availability: 'Available' },
  { code: 'LAB-LBL-01', name: 'Sunita Rao', designation: 'Labelling Operator', availability: 'Available' },
  { code: 'TEAM-PACK-A', name: 'Packing Team A', designation: 'Packing Team', availability: 'Available' },
  { code: 'TEAM-PACK-B', name: 'Packing Team B', designation: 'Packing Team', availability: 'Available' },
]

const demoItems = [
  { id: 'CAN-200-RAW', name: 'Raw aerosol can body 200 ml', uom: 'pcs' },
  { id: 'CAN-300-RAW', name: 'Raw aerosol can body 300 ml', uom: 'pcs' },
  { id: 'CAN-500-RAW', name: 'Raw aerosol can body 500 ml', uom: 'pcs' },
  { id: 'VALVE-STD', name: 'Standard aerosol valve', uom: 'pcs' },
  { id: 'ACTUATOR-STD', name: 'Spray actuator button', uom: 'pcs' },
  { id: 'CAP-STD', name: 'Aerosol over cap', uom: 'pcs' },
  { id: 'PROP-LPG', name: 'Aerosol propellant', uom: 'kg' },
  { id: 'LBL-CUST', name: 'Customer printed label', uom: 'pcs' },
  { id: 'CTN-MASTER', name: 'Master shipper carton', uom: 'pcs' },
]

const readResourceStore = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    const stored = raw ? JSON.parse(raw) : []
    const merged = [...fallback, ...(Array.isArray(stored) ? stored : [])]
    return Array.from(new Map(merged.map((item) => [item.code || item.name, item])).values())
  } catch {
    return fallback
  }
}

const readItemStore = () => {
  try {
    const raw = localStorage.getItem(itemKey)
    const stored = raw ? JSON.parse(raw) : []
    const mapped = (Array.isArray(stored) ? stored : []).map((item) => ({
      id: item.id || item.code || item.itemCode,
      name: item.name || item.itemName || item.description,
      uom: item.uom || item.primaryUnit || 'pcs',
    })).filter((item) => item.id)
    return Array.from(new Map([...demoItems, ...mapped].map((item) => [item.id, item])).values())
  } catch {
    return demoItems
  }
}

const bomStageTemplates = {
  'AERO-200-NOVA': [
    ['Can Prep', 'AIR-BLOW-01', 'Meena Sharma', 45],
    ['Filling', 'FILL-L1', 'Ramesh Yadav', 95],
    ['Valve Crimping', 'CRIMP-01', 'Iqbal Khan', 55],
    ['Leak Test', 'LEAK-CHK-01', 'Nisha Rao', 40],
    ['Customer Labelling', 'LBL-01', 'Sunita Rao', 70],
    ['Packing', 'PKG-LINE-01', 'Packing Team A', 65],
    ['QC Release', 'QC-BENCH-01', 'Nisha Rao', 35],
  ],
  'AERO-300-FRESH': [
    ['Can Prep', 'AIR-BLOW-01', 'Meena Sharma', 50],
    ['Filling', 'FILL-L2', 'Ramesh Yadav', 120],
    ['Valve Crimping', 'CRIMP-01', 'Iqbal Khan', 65],
    ['Leak Test', 'LEAK-CHK-01', 'Nisha Rao', 45],
    ['Customer Labelling', 'LBL-01', 'Sunita Rao', 85],
    ['Packing', 'PKG-LINE-01', 'Packing Team A', 75],
    ['QC Release', 'QC-BENCH-01', 'Nisha Rao', 40],
  ],
  'AERO-500-IND': [
    ['Can Prep', 'AIR-BLOW-02', 'Meena Sharma', 55],
    ['Filling', 'FILL-H1', 'Ramesh Yadav', 150],
    ['Valve Crimping', 'CRIMP-02', 'Iqbal Khan', 80],
    ['Leak Test', 'LEAK-CHK-02', 'Nisha Rao', 55],
    ['Customer Labelling', 'LBL-02', 'Sunita Rao', 75],
    ['Packing', 'PKG-LINE-02', 'Packing Team B', 90],
    ['QC Release', 'QC-BENCH-02', 'Nisha Rao', 45],
  ],
  'AERO-200-LUXE': [
    ['Can Prep', 'AIR-BLOW-01', 'Meena Sharma', 45],
    ['Filling', 'FILL-L1', 'Ramesh Yadav', 100],
    ['Valve Crimping', 'CRIMP-01', 'Iqbal Khan', 60],
    ['Leak Test', 'LEAK-CHK-01', 'Nisha Rao', 45],
    ['Customer Labelling', 'LBL-PERF-01', 'Sunita Rao', 95],
    ['Packing', 'PKG-LINE-01', 'Packing Team A', 80],
    ['QC Release', 'QC-BENCH-01', 'Nisha Rao', 40],
  ],
  'AERO-300-ELYS': [
    ['Can Prep', 'AIR-BLOW-01', 'Meena Sharma', 50],
    ['Filling', 'FILL-L2', 'Ramesh Yadav', 130],
    ['Valve Crimping', 'CRIMP-01', 'Iqbal Khan', 70],
    ['Leak Test', 'LEAK-CHK-01', 'Nisha Rao', 50],
    ['Customer Labelling', 'LBL-PERF-02', 'Sunita Rao', 105],
    ['Packing', 'PKG-LINE-01', 'Packing Team A', 85],
    ['QC Release', 'QC-BENCH-01', 'Nisha Rao', 45],
  ],
}

const demoBoms = products.map((product) => ({
  id: product.bom,
  productNo: product.code,
  description: product.name,
  demoProductCode: product.code,
  stages: stagesFromBom(product.code, 'Can Prep', []),
}))

const manualStages = () => [{
  name: 'Manual Stage 1',
  machine: demoMachines[0]?.code || '',
  labour: demoLabours[0]?.name || '',
  plannedMinutes: 0,
  actualMinutes: 0,
  status: 'Pending',
  extraLines: [],
}]

const readBomStore = () => {
  try {
    const raw = localStorage.getItem(bomKey)
    const stored = raw ? JSON.parse(raw) : []
    const mapped = (Array.isArray(stored) ? stored : []).map((bom) => ({
      id: bom.id || bom.bom || bom.productNo,
      productNo: bom.productNo || bom.code || '',
      description: bom.description || bom.name || '',
      stages: bom.stages || [],
      lines: bom.lines || [],
    })).filter((bom) => bom.id)
    return Array.from(new Map([...demoBoms, ...mapped].map((bom) => [bom.id, bom])).values())
  } catch {
    return demoBoms
  }
}

const seedPlans = [
  {
    id: 'PLAN-260512-001',
    date: '2026-05-12',
    shift: 'Morning',
    shiftTime: '09:00-18:00',
    customer: 'LuxeAura Perfumes',
    salesOrder: 'SO-LUXE-1142',
    batchNo: 'BATCH-LUXE-260512-M1',
    purpose: 'Customer Order',
    productCode: 'AERO-200-LUXE',
    productName: '200 ml Perfume Can - LuxeAura Brand',
    bom: 'BOM-AERO-200-LUXE',
    plannedQty: 24000,
    actualQty: 11200,
    rejectedQty: 210,
    facility: 'Plant 1 / Filling Line 1',
    supervisor: 'Manoj Das',
    priority: 'Urgent',
    status: 'In Progress',
    currentStage: 'Filling',
    outputWarehouse: 'Finished Goods Store',
    materialWarehouse: 'Raw Material Store',
    startTime: '09:00',
    endTime: '18:00',
    stages: stageRows('Filling', ['Can Prep']),
  },
  {
    id: 'PLAN-260512-002',
    date: '2026-05-12',
    shift: 'General',
    shiftTime: '10:00-19:00',
    customer: 'FreshMist Hygiene Pvt Ltd',
    salesOrder: 'SO-FRESH-778',
    batchNo: 'BATCH-FRESH-260512-G1',
    purpose: 'Customer Order',
    productCode: 'AERO-300-FRESH',
    productName: '300 ml Aerosol Can - FreshMist Label',
    bom: 'BOM-AERO-300-FRESH',
    plannedQty: 18000,
    actualQty: 14300,
    rejectedQty: 120,
    facility: 'Plant 1 / Labelling Line',
    supervisor: 'Priya Menon',
    priority: 'Normal',
    status: 'In Progress',
    currentStage: 'Customer Labelling',
    outputWarehouse: 'Dispatch Area',
    materialWarehouse: 'Packaging Store',
    startTime: '10:00',
    endTime: '19:00',
    stages: stageRows('Customer Labelling', ['Can Prep', 'Filling', 'Valve Crimping', 'Leak Test']),
  },
  {
    id: 'PLAN-260512-003',
    date: '2026-05-12',
    shift: 'Night',
    shiftTime: '21:00-06:00',
    customer: 'AeroChem Solutions',
    salesOrder: 'SO-AERO-221',
    batchNo: 'BATCH-AERO-260512-N1',
    purpose: 'Customer Order',
    productCode: 'AERO-500-IND',
    productName: '500 ml Aerosol Can - IndustrialPro Label',
    bom: 'BOM-AERO-500-IND',
    plannedQty: 9600,
    actualQty: 0,
    rejectedQty: 0,
    facility: 'Plant 2 / Heavy Fill Line',
    supervisor: 'Ravi Patel',
    priority: 'Normal',
    status: 'Scheduled',
    currentStage: 'Can Prep',
    outputWarehouse: 'Finished Goods Store',
    materialWarehouse: 'Raw Material Store',
    startTime: '21:00',
    endTime: '06:00',
    stages: stageRows('Can Prep', []),
  },
  {
    id: 'PLAN-260513-001',
    date: '2026-05-13',
    shift: 'Morning',
    shiftTime: '09:00-18:00',
    customer: 'Elysian Scents Pvt Ltd',
    salesOrder: 'SO-ELYS-410',
    batchNo: 'BATCH-ELYS-260513-M1',
    purpose: 'Customer Order',
    productCode: 'AERO-300-ELYS',
    productName: '300 ml Perfume Can - Elysian Scents',
    bom: 'BOM-AERO-300-ELYS',
    plannedQty: 16000,
    actualQty: 0,
    rejectedQty: 0,
    facility: 'Plant 1 / Filling Line 2',
    supervisor: 'Manoj Das',
    priority: 'Export',
    status: 'Approved',
    currentStage: 'Can Prep',
    outputWarehouse: 'Finished Goods Store',
    materialWarehouse: 'Raw Material Store',
    startTime: '09:00',
    endTime: '18:00',
    stages: stageRows('Can Prep', []),
  },
  {
    id: 'PLAN-260510-004',
    date: '2026-05-10',
    shift: 'General',
    shiftTime: '10:00-19:00',
    customer: 'NovaCare Industries',
    salesOrder: 'SO-NOVA-1042',
    batchNo: 'BATCH-NOVA-260510-G1',
    purpose: 'Customer Order',
    productCode: 'AERO-200-NOVA',
    productName: '200 ml Aerosol Can - NovaCare Label',
    bom: 'BOM-AERO-200-NOVA',
    plannedQty: 30000,
    actualQty: 29420,
    rejectedQty: 410,
    facility: 'Plant 1 / Filling Line 1',
    supervisor: 'Priya Menon',
    priority: 'Normal',
    status: 'Completed',
    currentStage: 'QC Release',
    outputWarehouse: 'Finished Goods Store',
    materialWarehouse: 'Raw Material Store',
    startTime: '10:00',
    endTime: '19:20',
    stages: stages.map((name) => ({ name, status: 'Completed', machine: machineForStage(name), labour: labourForStage(name), plannedMinutes: 70, actualMinutes: name === 'Customer Labelling' ? 94 : 72 })),
  },
  {
    id: 'PLAN-260514-001',
    date: '2026-05-14',
    shift: 'Morning',
    shiftTime: '09:00-18:00',
    customer: 'PrimeShield Consumer Products',
    salesOrder: 'SO-PRIME-620',
    batchNo: 'BATCH-PRIME-260514-M1',
    purpose: 'Make to Stock',
    productCode: 'AERO-300-FRESH',
    productName: '300 ml Aerosol Can - FreshMist Label',
    bom: 'BOM-AERO-300-FRESH',
    plannedQty: 22000,
    actualQty: 0,
    rejectedQty: 0,
    facility: 'Plant 1 / Filling Line 2',
    supervisor: 'Ravi Patel',
    priority: 'Normal',
    status: 'Approved',
    currentStage: 'Can Prep',
    outputWarehouse: 'Finished Goods Store',
    materialWarehouse: 'Raw Material Store',
    startTime: '09:00',
    endTime: '18:00',
    stages: stagesFromBom('AERO-300-FRESH', 'Can Prep', []),
  },
  {
    id: 'PLAN-260515-001',
    date: '2026-05-15',
    shift: 'General',
    shiftTime: '10:00-19:00',
    customer: 'LuxeAura Perfumes',
    salesOrder: 'SO-LUXE-1175',
    batchNo: 'BATCH-LUXE-260515-G1',
    purpose: 'Customer Order',
    productCode: 'AERO-200-LUXE',
    productName: '200 ml Perfume Can - LuxeAura Brand',
    bom: 'BOM-AERO-200-LUXE',
    plannedQty: 28000,
    actualQty: 0,
    rejectedQty: 0,
    facility: 'Plant 1 / Labelling Line',
    supervisor: 'Priya Menon',
    priority: 'Urgent',
    status: 'Pending Approval',
    currentStage: 'Can Prep',
    outputWarehouse: 'Finished Goods Store',
    materialWarehouse: 'Packaging Store',
    startTime: '10:00',
    endTime: '19:00',
    stages: stagesFromBom('AERO-200-LUXE', 'Can Prep', []),
  },
  {
    id: 'PLAN-260518-001',
    date: '2026-05-18',
    shift: 'Night',
    shiftTime: '21:00-06:00',
    customer: 'AeroChem Solutions',
    salesOrder: 'SO-AERO-240',
    batchNo: 'BATCH-AERO-260518-N1',
    purpose: 'Customer Order',
    productCode: 'AERO-500-IND',
    productName: '500 ml Aerosol Can - IndustrialPro Label',
    bom: 'BOM-AERO-500-IND',
    plannedQty: 12000,
    actualQty: 0,
    rejectedQty: 0,
    facility: 'Plant 2 / Heavy Fill Line',
    supervisor: 'Manoj Das',
    priority: 'Export',
    status: 'Draft',
    currentStage: 'Can Prep',
    outputWarehouse: 'Finished Goods Store',
    materialWarehouse: 'Raw Material Store',
    startTime: '21:00',
    endTime: '06:00',
    stages: stagesFromBom('AERO-500-IND', 'Can Prep', []),
  },
]

function stageRows(currentStage, completedStages) {
  return stages.map((name) => ({
    name,
    status: completedStages.includes(name) ? 'Completed' : name === currentStage ? 'Running' : 'Pending',
    machine: machineForStage(name),
    labour: labourForStage(name),
    plannedMinutes: name === 'Filling' ? 120 : 75,
    extraLines: [],
    actualMinutes: completedStages.includes(name) ? 70 : name === currentStage ? 38 : 0,
  }))
}

function stagesFromBom(productCode, currentStage = 'Can Prep', completedStages = []) {
  const template = bomStageTemplates[productCode] || bomStageTemplates['AERO-200-NOVA']
  return template.map(([name, machine, labour, plannedMinutes]) => ({
    name,
    machine,
    labour,
    plannedMinutes,
    extraLines: [],
    actualMinutes: completedStages.includes(name) ? plannedMinutes : 0,
    status: completedStages.includes(name) ? 'Completed' : name === currentStage ? 'Running' : 'Pending',
  }))
}

function stagesFromSelectedBom(bom, productCode) {
  if (!bom) return manualStages()
  if (bom.demoProductCode) return stagesFromBom(bom.demoProductCode, 'Can Prep', [])
  const stageNames = Array.isArray(bom.stages) && bom.stages.length
    ? bom.stages
    : Array.from(new Set((bom.lines || []).map((line) => line.stage).filter(Boolean)))
  const names = stageNames.length ? stageNames : ['Manual Stage 1']
  return names.map((name) => {
    const resourceLines = (bom.lines || []).filter((line) => line.stage === name && line.type === 'Resource')
    const machineLine = resourceLines.find((line) => line.resourceType === 'Machine')
    const labourLine = resourceLines.find((line) => line.resourceType !== 'Machine')
    const plannedMinutes = resourceLines.reduce((sum, line) => {
      const qty = Number(line.quantity || 0)
      return sum + (line.resourceUnit === 'Min' ? qty : qty * 60)
    }, 0)
    return {
      name,
      machine: machineLine?.resourceCode || machineForStage(name) || demoMachines[0]?.code || '',
      labour: labourLine?.resourceCode || labourForStage(name) || demoLabours[0]?.name || '',
      plannedMinutes: Math.round(plannedMinutes || 60),
      actualMinutes: 0,
      status: 'Pending',
      extraLines: [],
    }
  })
}

function machineForStage(stage) {
  return {
    'Can Prep': 'AIR-BLOW-01',
    Filling: 'FILL-L1',
    'Valve Crimping': 'CRIMP-01',
    'Leak Test': 'LEAK-CHK-01',
    'Customer Labelling': 'LBL-01',
    Packing: 'PKG-LINE-01',
    'QC Release': 'QC-BENCH-01',
  }[stage]
}

function labourForStage(stage) {
  return {
    'Can Prep': 'Meena Sharma',
    Filling: 'Ramesh Yadav',
    'Valve Crimping': 'Iqbal Khan',
    'Leak Test': 'QC Inspector',
    'Customer Labelling': 'Sunita Rao',
    Packing: 'Packing Team A',
    'QC Release': 'Nisha Rao',
  }[stage]
}

const readStored = () => {
  try {
    const raw = localStorage.getItem(storageKey)
    const stored = raw ? JSON.parse(raw) : []
    const merged = [...seedPlans, ...(Array.isArray(stored) ? stored : [])]
    return Array.from(new Map(merged.map((plan) => [plan.id, plan])).values())
  } catch {
    return seedPlans
  }
}

const inr = (value) => `INR ${Math.round(value || 0).toLocaleString('en-IN')}`
const num = (value) => Number(value || 0).toLocaleString('en-IN')
const progress = (plan) => Math.min(100, Math.round((Number(plan.actualQty || 0) / Math.max(Number(plan.plannedQty || 1), 1)) * 100))
const toDate = (value) => {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}
const toIso = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const addDays = (date, days) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}
const addMonths = (date, months) => {
  const next = new Date(date)
  next.setMonth(next.getMonth() + months)
  return next
}
const startOfWeek = (date) => addDays(date, -((date.getDay() + 6) % 7))
const startOfMonthGrid = (date) => startOfWeek(new Date(date.getFullYear(), date.getMonth(), 1))
const formatShortDate = (date) => date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
const formatLongDate = (date) => date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
const getPeriodRange = (mode, selectedDate) => {
  const date = toDate(selectedDate)
  if (mode === 'Day') return { start: date, end: date, label: formatLongDate(date) }
  if (mode === 'Week') {
    const start = startOfWeek(date)
    const end = addDays(start, 6)
    return { start, end, label: `${formatShortDate(start)} - ${formatLongDate(end)}` }
  }
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return { start, end, label: date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) }
}
const isWithin = (dateText, range) => {
  const date = toDate(dateText)
  return date >= range.start && date <= range.end
}
const statusTone = (status) => ({
  Completed: 'bg-emerald-500',
  'In Progress': 'bg-indigo-500',
  Running: 'bg-indigo-500',
  Approved: 'bg-emerald-500',
  'Pending Approval': 'bg-amber-500',
  Rejected: 'bg-rose-500',
  Draft: 'bg-slate-400',
}[status] || 'bg-slate-400')

function Kpi({ icon: Icon, label, value, note, tone = 'sky' }) {
  const tones = {
    sky: 'border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/30',
    green: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30',
    amber: 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30',
    indigo: 'border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/30',
    rose: 'border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30',
  }
  return (
    <div className={`rounded-lg border px-3 py-2 ${tones[tone]}`}>
      <p className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300"><Icon size={14} />{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-slate-100">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{note}</p>
    </div>
  )
}

function StageRail({ plan }) {
  return (
    <div className="grid min-w-[620px] grid-cols-7 gap-1.5">
      {plan.stages.map((stage) => {
        const classes = stage.status === 'Completed'
          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500/70 dark:bg-emerald-950/40 dark:text-emerald-300'
          : stage.status === 'Running'
            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-500/70 dark:bg-indigo-950/40 dark:text-indigo-300'
            : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
        return (
          <div key={stage.name} title={`${stage.name} / ${stage.machine} / ${stage.labour}`} className={`min-h-12 rounded-md border px-2 py-1.5 ${classes}`}>
            <div className={`mb-1 h-1.5 rounded-full ${stage.status === 'Completed' ? 'bg-emerald-500' : stage.status === 'Running' ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
            <p className="truncate text-center text-[11px] font-semibold leading-tight">{stage.name}</p>
          </div>
        )
      })}
    </div>
  )
}

function PlanModal({ record, machines, labours, items, boms, onClose, onSave }) {
  const defaultProduct = products[0]
  const defaultBom = boms.find((bom) => bom.id === defaultProduct.bom) || boms[0]
  const [draft, setDraft] = useState(record || {
    id: `PLAN-${Date.now().toString().slice(-8)}`,
    date: '2026-05-12',
    shift: 'Morning',
    shiftTime: '09:00-18:00',
    customer: customers[0],
    salesOrder: '',
    batchNo: `BATCH-${Date.now().toString().slice(-6)}`,
    purpose: 'Customer Order',
    productCode: defaultProduct.code,
    productName: defaultProduct.name,
    bom: defaultBom?.id || '',
    plannedQty: 0,
    actualQty: 0,
    rejectedQty: 0,
    facility: facilities[0],
    supervisor: 'Manoj Das',
    priority: 'Normal',
    status: 'Draft',
    currentStage: 'Can Prep',
    outputWarehouse: 'Finished Goods Store',
    materialWarehouse: 'Raw Material Store',
    startTime: '09:00',
    endTime: '18:00',
    stages: stagesFromSelectedBom(defaultBom, defaultProduct.code),
  })

  const update = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }))
  const selectProduct = (code) => {
    const product = products.find((item) => item.code === code) || products[0]
    const bom = boms.find((item) => item.id === product.bom || item.productNo === product.code)
    setDraft((prev) => ({ ...prev, productCode: product.code, productName: product.name, bom: bom?.id || '', currentStage: 'Can Prep', stages: stagesFromSelectedBom(bom, product.code) }))
  }
  const selectBom = (id) => {
    if (!id) {
      setDraft((prev) => ({ ...prev, bom: '', stages: manualStages() }))
      return
    }
    const bom = boms.find((item) => item.id === id)
    const product = products.find((item) => item.code === bom?.productNo) || products.find((item) => item.bom === id)
    setDraft((prev) => ({
      ...prev,
      bom: id,
      productCode: product?.code || prev.productCode,
      productName: product?.name || bom?.description || prev.productName,
      stages: stagesFromSelectedBom(bom, product?.code || prev.productCode),
    }))
  }
  const selectShift = (name) => {
    const shift = shifts.find((item) => item.name === name) || shifts[0]
    setDraft((prev) => ({ ...prev, shift: shift.name, shiftTime: shift.time, startTime: shift.time.split('-')[0], endTime: shift.time.split('-')[1] }))
  }
  const updateStage = (stageName, patch) => {
    setDraft((prev) => ({
      ...prev,
      stages: prev.stages.map((stage) => stage.name === stageName ? { ...stage, ...patch } : stage),
    }))
  }
  const updateStageWith = (stageName, updater) => {
    setDraft((prev) => ({
      ...prev,
      stages: prev.stages.map((stage) => stage.name === stageName ? updater(stage) : stage),
    }))
  }
  const addStageLine = (stageName, type) => {
    const defaults = {
      Item: { ref: items[0]?.id || '', qty: 1, uom: items[0]?.uom || 'pcs', minutes: 0 },
      Labour: { ref: labours[0]?.name || '', qty: 1, uom: 'person', minutes: 30 },
      Machine: { ref: machines[0]?.code || '', qty: 1, uom: 'machine', minutes: 30 },
    }[type]
    updateStageWith(stageName, (stage) => ({
      ...stage,
      extraLines: [
        ...(stage.extraLines || []),
        { id: `${type}-${Date.now()}`, type, comments: '', ...defaults },
      ],
    }))
  }
  const updateStageLine = (stageName, lineId, patch) => {
    updateStageWith(stageName, (stage) => ({
      ...stage,
      extraLines: (stage.extraLines || []).map((line) => line.id === lineId ? { ...line, ...patch } : line),
    }))
  }
  const removeStageLine = (stageName, lineId) => {
    updateStageWith(stageName, (stage) => ({
      ...stage,
      extraLines: (stage.extraLines || []).filter((line) => line.id !== lineId),
    }))
  }
  const addManualStage = () => {
    setDraft((prev) => ({
      ...prev,
      stages: [
        ...prev.stages,
        {
          name: `Manual Stage ${prev.stages.length + 1}`,
          machine: machines[0]?.code || '',
          labour: labours[0]?.name || '',
          plannedMinutes: 0,
          actualMinutes: 0,
          status: 'Pending',
          extraLines: [],
        },
      ],
    }))
  }
  const save = (status) => {
    const next = { ...draft, status, plannedQty: Number(draft.plannedQty || 0), actualQty: Number(draft.actualQty || 0), rejectedQty: Number(draft.rejectedQty || 0) }
    onSave(next)
  }
  const machineOptions = machines.map((machine) => ({ value: machine.code, label: `${machine.code} / ${machine.name || machine.workCenter || 'Machine'}` }))
  const labourOptions = labours.map((labour) => ({ value: labour.name, label: `${labour.name} / ${labour.designation || labour.position || labour.skillLevel || 'Labour'}` }))
  const itemOptions = items.map((item) => ({ value: item.id, label: `${item.id} / ${item.name}` }))
  const bomOptions = [{ value: '', label: 'No BOM / Manual Plan' }, ...boms.map((bom) => ({ value: bom.id, label: `${bom.id} / ${bom.description || bom.productNo || 'BOM'}` }))]
  const isLocked = ['Pending Approval', 'Approved', 'Scheduled', 'In Progress', 'Completed', 'Short Closed', 'Cancelled'].includes(draft.status)

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/40 px-4 py-6">
      <div className="w-full max-w-6xl rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100">{record ? 'Edit Production Plan' : 'Create Production Plan'}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Plan customer, facility, shift, product, BOM, quantity, stages, resources, and current status.</p>
          </div>
          <button onClick={onClose} className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:text-slate-100">Cancel</button>
        </div>

        <div className="grid gap-3 p-4 xl:grid-cols-[1.05fr_1.05fr_0.9fr]">
          <section className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <h3 className="text-sm font-semibold dark:text-slate-100">Demand & Customer</h3>
            <div className="mt-2 grid gap-2">
              <Field label="Plan No." value={draft.id} disabled={isLocked} onChange={(v) => update('id', v)} />
              <Select label="Customer" value={draft.customer} disabled={isLocked} onChange={(v) => update('customer', v)} options={customers} />
              <Field label="Sales Order" value={draft.salesOrder} disabled={isLocked} onChange={(v) => update('salesOrder', v)} />
              <Field label="Batch No." value={draft.batchNo} disabled={isLocked} onChange={(v) => update('batchNo', v)} />
              <Select label="Purpose" value={draft.purpose} disabled={isLocked} onChange={(v) => update('purpose', v)} options={['Customer Order', 'Make to Stock', 'Trial Production', 'Sample', 'Rework']} />
              <Select label="Priority" value={draft.priority} disabled={isLocked} onChange={(v) => update('priority', v)} options={['Normal', 'Urgent', 'Export', 'Trial']} />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <h3 className="text-sm font-semibold dark:text-slate-100">Product, BOM & Facility</h3>
            <div className="mt-2 grid gap-2">
              <Select label="Product" value={draft.productCode} disabled={isLocked} onChange={selectProduct} options={products.map((item) => item.code)} />
              <Field label="Product Name" value={draft.productName} disabled={isLocked} onChange={(v) => update('productName', v)} />
              <Select label="BOM" value={draft.bom} disabled={isLocked} onChange={selectBom} options={bomOptions} />
              <Select label="Manufacturing Facility" value={draft.facility} disabled={isLocked} onChange={(v) => update('facility', v)} options={facilities} />
              <Field label="Supervisor" value={draft.supervisor} disabled={isLocked} onChange={(v) => update('supervisor', v)} />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <h3 className="text-sm font-semibold dark:text-slate-100">Schedule & Output</h3>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <Field label="Plan Date" type="date" value={draft.date} disabled={isLocked} onChange={(v) => update('date', v)} />
              <Select label="Shift" value={draft.shift} disabled={isLocked} onChange={selectShift} options={shifts.map((item) => item.name)} />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Start" type="time" value={draft.startTime} disabled={isLocked} onChange={(v) => update('startTime', v)} />
                <Field label="End" type="time" value={draft.endTime} disabled={isLocked} onChange={(v) => update('endTime', v)} />
              </div>
              <Field label="Planned Qty" type="number" value={draft.plannedQty} disabled={isLocked} onChange={(v) => update('plannedQty', v)} />
              <div>
                <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">Approval Status</span>
                <div className="mt-1 flex h-9 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-800"><StatusBadge status={draft.status} /></div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 p-3 dark:border-slate-700 xl:col-span-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold dark:text-slate-100">Stage-wise Schedule Lines</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{draft.bom ? 'Loaded from selected BOM. Add extra item, labour, or machine lines only when this batch needs more than the BOM default.' : 'No BOM selected. Build this batch schedule manually by adding stages and item/resource lines.'}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {!draft.bom && <button disabled={isLocked} onClick={addManualStage} className="rounded border border-slate-300 px-3 py-2 text-xs font-semibold disabled:opacity-40 dark:border-slate-700 dark:text-slate-100">+ Add Stage</button>}
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Execution starts from <strong>{draft.stages[0]?.name || 'first stage'}</strong>. Current stage updates during execution.
                </div>
              </div>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-[1260px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="px-3 py-2">BOM Operation</th>
                    <th className="px-3 py-2">Line Type</th>
                    <th className="px-3 py-2">Item / Resource</th>
                    <th className="px-3 py-2">Qty</th>
                    <th className="px-3 py-2">Allotted Time</th>
                    <th className="px-3 py-2">Notes</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {draft.stages.map((stage) => (
                    <Fragment key={stage.name}>
                      <tr className="border-t border-slate-100 bg-sky-50/50 dark:border-slate-800 dark:bg-sky-950/20">
                        <td className="px-3 py-2 font-semibold">{stage.name}</td>
                        <td className="px-3 py-2">Primary machine + labour</td>
                        <td className="px-3 py-2">
                          <div className="grid grid-cols-2 gap-2">
                            <SelectInline value={stage.machine} disabled={isLocked} onChange={(value) => updateStage(stage.name, { machine: value })} options={machineOptions} />
                            <SelectInline value={stage.labour} disabled={isLocked} onChange={(value) => updateStage(stage.name, { labour: value })} options={labourOptions} />
                          </div>
                        </td>
                        <td className="px-3 py-2">1 set</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <input value={stage.plannedMinutes} disabled={isLocked} onChange={(event) => updateStage(stage.name, { plannedMinutes: Number(event.target.value || 0) })} type="number" className="h-8 w-20 rounded border border-slate-300 px-2 text-right text-sm text-slate-900 disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:disabled:bg-slate-900 dark:disabled:text-slate-500" />
                          <span className="text-xs text-slate-500 dark:text-slate-400">min</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">Default from BOM operation</td>
                        <td className="px-3 py-2"><StatusBadge status={stage.status} /></td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            <button disabled={isLocked} onClick={() => addStageLine(stage.name, 'Item')} className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200">+ Item</button>
                            <button disabled={isLocked} onClick={() => addStageLine(stage.name, 'Labour')} className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200">+ Labour</button>
                            <button disabled={isLocked} onClick={() => addStageLine(stage.name, 'Machine')} className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200">+ Machine</button>
                          </div>
                        </td>
                      </tr>
                      {(stage.extraLines || []).map((line) => {
                        const options = line.type === 'Item' ? itemOptions : line.type === 'Machine' ? machineOptions : labourOptions
                        const selectedItem = items.find((item) => item.id === line.ref)
                        return (
                          <tr key={line.id} className="border-t border-slate-100 dark:border-slate-800">
                            <td className="px-3 py-2 pl-8 text-xs text-slate-500 dark:text-slate-400">Additional line</td>
                            <td className="px-3 py-2"><SelectInline value={line.type} disabled={isLocked} onChange={(value) => updateStageLine(stage.name, line.id, { type: value, ref: value === 'Item' ? items[0]?.id || '' : value === 'Machine' ? machines[0]?.code || '' : labours[0]?.name || '', uom: value === 'Item' ? items[0]?.uom || 'pcs' : value === 'Machine' ? 'machine' : 'person' })} options={['Item', 'Labour', 'Machine']} /></td>
                            <td className="px-3 py-2"><SelectInline value={line.ref} disabled={isLocked} onChange={(value) => updateStageLine(stage.name, line.id, { ref: value, uom: line.type === 'Item' ? items.find((item) => item.id === value)?.uom || line.uom : line.uom })} options={options} /></td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <input value={line.qty} disabled={isLocked} onChange={(event) => updateStageLine(stage.name, line.id, { qty: Number(event.target.value || 0) })} type="number" className="h-8 w-20 rounded border border-slate-300 px-2 text-right text-sm text-slate-900 disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:disabled:bg-slate-900 dark:disabled:text-slate-500" />
                                <span className="text-xs text-slate-500 dark:text-slate-400">{line.type === 'Item' ? selectedItem?.uom || line.uom : line.uom}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <input value={line.minutes} disabled={isLocked || line.type === 'Item'} onChange={(event) => updateStageLine(stage.name, line.id, { minutes: Number(event.target.value || 0) })} type="number" className="h-8 w-20 rounded border border-slate-300 px-2 text-right text-sm text-slate-900 disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:disabled:bg-slate-900 dark:disabled:text-slate-500" />
                                <span className="text-xs text-slate-500 dark:text-slate-400">min</span>
                              </div>
                            </td>
                            <td className="px-3 py-2"><input value={line.comments} disabled={isLocked} onChange={(event) => updateStageLine(stage.name, line.id, { comments: event.target.value })} className="h-8 w-full rounded border border-slate-300 px-2 text-sm text-slate-900 disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-900 dark:disabled:text-slate-500" placeholder="Why needed for this batch" /></td>
                            <td className="px-3 py-2"><span className="text-xs text-slate-400 dark:text-slate-500">Planned</span></td>
                            <td className="px-3 py-2"><button disabled={isLocked} onClick={() => removeStageLine(stage.name, line.id)} className="rounded border border-rose-200 px-2 py-1 text-xs text-rose-600 disabled:opacity-40 dark:border-rose-900/70 dark:text-rose-300">Remove</button></td>
                          </tr>
                        )
                      })}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 px-4 py-3 dark:border-slate-700">
          {isLocked && <span className="mr-auto text-sm text-slate-500 dark:text-slate-400">This plan is locked. It can be edited only while Draft or Rejected.</span>}
          {!isLocked && <button onClick={() => save('Draft')} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-100">Save Draft</button>}
          {!isLocked && <button onClick={() => save('Pending Approval')} className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Submit for Approval</button>}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', disabled = false }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">{label}</span>
      <input type={type} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-sky-400 disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:disabled:bg-slate-900 dark:disabled:text-slate-500" />
    </label>
  )
}

function Select({ label, value, onChange, options, disabled = false }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">{label}</span>
      <select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-sky-400 disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:disabled:bg-slate-900 dark:disabled:text-slate-500">
        {options.map((option) => <option key={option.value || option} value={option.value || option}>{option.label || option}</option>)}
      </select>
    </label>
  )
}

function SelectInline({ value, onChange, options, disabled = false }) {
  return (
    <select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="h-8 w-full rounded border border-slate-300 px-2 text-sm outline-none focus:border-sky-400 disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:disabled:bg-slate-900 dark:disabled:text-slate-500">
      {options.map((option) => <option key={option.value || option} value={option.value || option}>{option.label || option}</option>)}
    </select>
  )
}

export default function ProductionPlanningPage() {
  const [plans, setPlans] = useState(readStored)
  const [machines] = useState(() => readResourceStore(machineKey, demoMachines))
  const [labours] = useState(() => readResourceStore(labourKey, demoLabours))
  const [items] = useState(readItemStore)
  const [boms] = useState(readBomStore)
  const [activeTab, setActiveTab] = useState('Plans')
  const [planView, setPlanView] = useState('List')
  const [calendarMode, setCalendarMode] = useState('Week')
  const [selectedDate, setSelectedDate] = useState('2026-05-12')
  const [fromDate, setFromDate] = useState('2026-05-12')
  const [toDateFilter, setToDateFilter] = useState('2026-05-12')
  const [shift, setShift] = useState('All')
  const [approvalStatus, setApprovalStatus] = useState('All')
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState(null)

  const savePlan = (plan) => {
    const next = plans.some((item) => item.id === plan.id) ? plans.map((item) => item.id === plan.id ? plan : item) : [plan, ...plans]
    setPlans(next)
    localStorage.setItem(storageKey, JSON.stringify(next))
    setModal(null)
  }

  const setPlanStatus = (id, status) => {
    const next = plans.map((plan) => plan.id === id ? { ...plan, status } : plan)
    setPlans(next)
    localStorage.setItem(storageKey, JSON.stringify(next))
  }

  const visiblePlans = useMemo(() => {
    const q = query.trim().toLowerCase()
    const range = { start: toDate(fromDate), end: toDate(toDateFilter), label: `${formatLongDate(toDate(fromDate))} - ${formatLongDate(toDate(toDateFilter))}` }
    return plans.filter((plan) => {
      const matchDate = isWithin(plan.date, range)
      const matchShift = shift === 'All' || plan.shift === shift
      const matchQuery = !q || [plan.id, plan.batchNo, plan.customer, plan.salesOrder, plan.productCode, plan.productName, plan.bom, plan.facility, plan.status].join(' ').toLowerCase().includes(q)
      return matchDate && matchShift && matchQuery
    })
  }, [plans, fromDate, toDateFilter, shift, query])

  const totals = useMemo(() => visiblePlans.reduce((acc, plan) => {
    acc.planned += Number(plan.plannedQty || 0)
    acc.actual += Number(plan.actualQty || 0)
    acc.rejected += Number(plan.rejectedQty || 0)
    if (['In Progress', 'Running'].includes(plan.status)) acc.running += 1
    if (plan.status === 'Scheduled' || plan.status === 'Approved') acc.future += 1
    if (plan.status === 'Completed') acc.completed += 1
    return acc
  }, { planned: 0, actual: 0, rejected: 0, running: 0, future: 0, completed: 0 }), [visiblePlans])

  const periodRange = { start: toDate(fromDate), end: toDate(toDateFilter), label: `${formatLongDate(toDate(fromDate))} - ${formatLongDate(toDate(toDateFilter))}` }
  const periodPlans = plans.filter((plan) => isWithin(plan.date, periodRange))
  const groupedVisiblePlans = Object.entries(visiblePlans.reduce((acc, plan) => {
    acc[plan.date] = [...(acc[plan.date] || []), plan]
    return acc
  }, {})).sort(([a], [b]) => a.localeCompare(b))
  const calendarStart = calendarMode === 'Month' ? startOfMonthGrid(toDate(selectedDate)) : startOfWeek(toDate(selectedDate))
  const calendarDays = Array.from({ length: calendarMode === 'Month' ? 35 : 7 }, (_, index) => toIso(addDays(calendarStart, index)))
  const calendarTitle = calendarMode === 'Month'
    ? toDate(selectedDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : `${formatShortDate(calendarStart)} - ${formatLongDate(addDays(calendarStart, 6))}`
  const history = plans.filter((plan) => ['Completed', 'Short Closed', 'Cancelled'].includes(plan.status))
  const approvalPlans = plans.filter((plan) => ['Draft', 'Pending Approval', 'Approved', 'Rejected', 'Scheduled'].includes(plan.status) && (approvalStatus === 'All' || plan.status === approvalStatus))
  const moveCalendar = (direction) => {
    const anchor = toDate(selectedDate)
    const next = calendarMode === 'Month' ? addMonths(anchor, direction) : addDays(anchor, 7 * direction)
    setSelectedDate(toIso(next))
  }

  return (
    <div className="space-y-3 text-slate-900 dark:text-slate-100">
      <section className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 dark:border-sky-900 dark:bg-sky-950/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Production / Planning</p>
            <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">Production Planning Board</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">Plan aerosol and perfume-can production by customer, facility, shift, BOM stages, resources, and live progress.</p>
          </div>
          <button onClick={() => setModal({ mode: 'create' })} className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-950"><Plus size={16} /> Create Plan</button>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi icon={Package} label="Planned Qty" value={num(totals.planned)} note="Cans in selected view" />
        <Kpi icon={ListChecks} label="Actual Output" value={num(totals.actual)} note={`${Math.round((totals.actual / Math.max(totals.planned, 1)) * 100)}% achieved`} tone="green" />
        <Kpi icon={Factory} label="Running Plans" value={totals.running} note="Currently on shop floor" tone="indigo" />
        <Kpi icon={Clock3} label="Approved / Scheduled" value={totals.future} note="Ready for production" tone="amber" />
        <Kpi icon={UserRoundCheck} label="Rejected Qty" value={num(totals.rejected)} note="Linked to waste/QC" tone="rose" />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-200 p-3 dark:border-slate-700">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{activeTab === 'Plans' ? 'Production plans period' : 'Plan approval workspace'}</p>
              <p className="text-base font-semibold text-slate-950 dark:text-slate-100">{activeTab === 'Plans' ? `Showing ${periodRange.label}` : `Showing ${approvalStatus} approval status`}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{periodPlans.length ? `${periodPlans.length} plan(s), ${num(periodPlans.reduce((sum, plan) => sum + Number(plan.plannedQty || 0), 0))} cans planned` : 'No production plans in this period'}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => { setFromDate('2026-05-12'); setToDateFilter('2026-05-12') }} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">Today</button>
              <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">From <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="ml-1 h-10 rounded-md border border-slate-300 px-3 text-sm font-normal normal-case text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" /></label>
              <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">To <input type="date" value={toDateFilter} onChange={(event) => setToDateFilter(event.target.value)} className="ml-1 h-10 rounded-md border border-slate-300 px-3 text-sm font-normal normal-case text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" /></label>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
          {['Plans', 'Plan Approvals'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-md px-3 py-2 text-sm font-semibold ${activeTab === tab ? 'bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950' : 'border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-200'}`}>{tab}</button>
          ))}
          {activeTab === 'Plans' && (
            <div className="flex rounded-md border border-slate-300 p-1 dark:border-slate-700">
              {['List', 'Calendar'].map((view) => (
                <button key={view} onClick={() => setPlanView(view)} className={`rounded px-3 py-1.5 text-sm font-semibold ${planView === view ? 'bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950' : 'text-slate-700 dark:text-slate-300'}`}>{view}</button>
              ))}
            </div>
          )}
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customer, SO, product, facility, status..." className="h-10 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-sky-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500" />
          </div>
          <select value={shift} onChange={(event) => setShift(event.target.value)} className="h-10 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            {['All', ...shifts.map((item) => item.name)].map((item) => <option key={item}>{item}</option>)}
          </select>
          {activeTab === 'Plan Approvals' && (
            <select value={approvalStatus} onChange={(event) => setApprovalStatus(event.target.value)} className="h-10 rounded-md border border-slate-300 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              {['All', 'Draft', 'Pending Approval', 'Approved', 'Rejected', 'Scheduled'].map((item) => <option key={item}>{item}</option>)}
            </select>
          )}
          </div>
          {activeTab === 'Plans' && planView === 'Calendar' && (
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-300">
              {[
                ['In Progress', 'bg-indigo-500'],
                ['Approved / Scheduled', 'bg-emerald-500'],
                ['Pending Approval', 'bg-amber-500'],
                ['Draft', 'bg-slate-400'],
                ['Rejected', 'bg-rose-500'],
                ['Completed', 'bg-emerald-700'],
              ].map(([label, color]) => (
                <span key={label} className="inline-flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-full ${color}`} />{label}</span>
              ))}
            </div>
          )}
        </div>

        {activeTab === 'Plans' && planView === 'List' && (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {!visiblePlans.length && (
              <div className="p-8 text-center">
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">No production planned for this selection</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Change the period, shift, or search filter, or create a new plan for this period.</p>
                <button onClick={() => setModal({ mode: 'create' })} className="mt-4 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-950">Create Plan</button>
              </div>
            )}
            {groupedVisiblePlans.map(([date, dayPlans]) => {
              const dayQty = dayPlans.reduce((sum, plan) => sum + Number(plan.plannedQty || 0), 0)
              const dayValue = dayPlans.reduce((sum, plan) => sum + Number(plan.plannedQty || 0) * 25, 0)
              const dayShifts = Array.from(new Set(dayPlans.map((plan) => plan.shift))).join(', ')
              return (
                <div key={date} className="border-t border-slate-200 dark:border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 px-4 py-1.5 dark:bg-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-slate-950 dark:bg-slate-100" />
                      <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{toDate(date).toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                      <span className="text-sm font-semibold text-slate-950 dark:text-slate-100">{formatLongDate(toDate(date))}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded bg-white px-2 py-1 font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">{dayPlans.length} plan(s)</span>
                      <span className="rounded bg-slate-100 px-2 py-1 font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">{num(dayQty)} cans</span>
                      <span className="rounded bg-slate-100 px-2 py-1 font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">{dayShifts || 'No shift'}</span>
                      <span className="rounded bg-slate-100 px-2 py-1 font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">Est. INR {num(dayValue)}</span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute bottom-4 left-3 top-4 w-0.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  {dayPlans.map((plan, planIndex) => (
                    <div key={plan.id} className="relative grid gap-4 border-t border-slate-100 py-4 pl-6 pr-4 first:border-t-0 hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-800/35 xl:grid-cols-[320px_minmax(0,1fr)_240px]">
                      <span className="absolute left-[8px] top-6 h-2.5 w-2.5 rounded-full border-2 border-white bg-slate-400 shadow-sm dark:border-slate-900 dark:bg-slate-500" title={`Plan ${planIndex + 1} for ${formatLongDate(toDate(date))}`} />
                <div>
                  <div className="flex items-center gap-2"><span className="font-semibold text-slate-950 dark:text-slate-100">{plan.productCode}</span><StatusBadge status={plan.status} /></div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{plan.productName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{plan.batchNo || 'No batch'} · {plan.bom}</p>
                </div>
                <div className="min-w-0 overflow-x-auto pb-1">
                  <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">{plan.customer} · {plan.salesOrder} · {plan.facility} · {plan.shift} {plan.shiftTime}</p>
                  <StageRail plan={plan} />
                </div>
                <div className="grid content-center gap-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Planned Qty</span><strong className="text-slate-950 dark:text-slate-100">{num(plan.actualQty)} / {num(plan.plannedQty)}</strong></div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${progress(plan)}%` }} /></div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400"><span>{plan.currentStage}</span><button onClick={() => setModal({ mode: 'edit', record: plan })} className="rounded bg-slate-950 px-2 py-1 font-semibold text-white dark:bg-slate-100 dark:text-slate-950">View / Edit</button></div>
                </div>
              </div>
                  ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'Plans' && planView === 'Calendar' && (
          <div className="p-3">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{calendarMode} calendar</p>
                <p className="text-base font-semibold text-slate-950 dark:text-slate-100">{calendarTitle}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => moveCalendar(-1)} className="rounded border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">Previous {calendarMode}</button>
                {['Week', 'Month'].map((mode) => (
                  <button key={mode} onClick={() => setCalendarMode(mode)} className={`rounded px-3 py-2 text-sm font-semibold ${calendarMode === mode ? 'bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950' : 'border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-200'}`}>{mode}</button>
                ))}
                <button onClick={() => moveCalendar(1)} className="rounded border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">Next {calendarMode}</button>
              </div>
            </div>
            <div className="mb-2 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <div key={day}>{day}</div>)}
            </div>
            <div className="grid gap-2 lg:grid-cols-7">
            {calendarDays.map((date) => {
              const dayPlans = plans.filter((plan) => plan.date === date)
              const dayDate = toDate(date)
              const isSelected = date === selectedDate
                const isOutsideMonth = calendarMode === 'Month' && dayDate.getMonth() !== toDate(selectedDate).getMonth()
              const plannedQty = dayPlans.reduce((sum, plan) => sum + Number(plan.plannedQty || 0), 0)
              return (
                <div key={date} className={`min-h-[230px] rounded-lg border p-2 transition ${isSelected ? 'border-sky-400 bg-sky-50 shadow-sm dark:border-sky-500 dark:bg-sky-950/30' : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'} ${isOutsideMonth ? 'opacity-45' : ''}`}>
                  <button onClick={() => { setFromDate(date); setToDateFilter(date); setPlanView('List') }} className="mb-2 flex w-full items-start justify-between text-left">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{formatShortDate(dayDate)}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{dayPlans.length ? `${dayPlans.length} plan(s)` : 'No plan'}</p>
                    </div>
                    <div className={`rounded-full px-2 py-1 text-xs font-semibold ${dayPlans.length ? 'bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'}`}>{num(plannedQty)}</div>
                  </button>
                  <div className="mb-2 flex gap-1">
                    {dayPlans.slice(0, 5).map((plan) => <span key={plan.id} className={`h-1.5 flex-1 rounded-full ${statusTone(plan.status)}`} />)}
                    {!dayPlans.length && <span className="h-1.5 flex-1 rounded-full bg-slate-100 dark:bg-slate-800" />}
                  </div>
                  <div className="space-y-1.5">
                    {dayPlans.map((plan) => (
                      <button key={plan.id} onClick={() => { setFromDate(date); setToDateFilter(date); setPlanView('List') }} className="w-full rounded-md border border-slate-200 bg-white p-2 text-left text-xs shadow-sm hover:border-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-sky-600">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <p className="truncate font-semibold text-slate-950 dark:text-slate-100">{plan.productCode}</p>
                          <span className={`h-2 w-2 shrink-0 rounded-full ${statusTone(plan.status)}`} />
                        </div>
                        <p className="truncate text-slate-500 dark:text-slate-400">{plan.customer}</p>
                        <p className="text-slate-500 dark:text-slate-400">{plan.shift} · {num(plan.plannedQty)}</p>
                        <div className="mt-1 text-slate-500 dark:text-slate-400">{plan.status}</div>
                      </button>
                    ))}
                    {!dayPlans.length && <div className="rounded-md border border-dashed border-slate-200 p-3 text-center text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">Empty</div>}
                  </div>
                </div>
              )
            })}
            </div>
          </div>
        )}

        {activeTab === 'Plan Approvals' && (
          <div className="overflow-x-auto">
            <table className="min-w-[1220px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-3 py-2">Plan</th>
                  <th className="px-3 py-2">Customer / SO</th>
                  <th className="px-3 py-2">Product / BOM</th>
                  <th className="px-3 py-2">Date / Shift</th>
                  <th className="px-3 py-2">Facility</th>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Created By</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvalPlans.map((plan) => (
                  <tr key={plan.id} className="border-t border-slate-100 align-top dark:border-slate-800">
                    <td className="px-3 py-2 font-semibold">{plan.id}<div className="text-xs font-normal text-slate-500 dark:text-slate-400">{plan.batchNo || 'No batch'}</div></td>
                    <td className="px-3 py-2">{plan.customer}<div className="text-xs text-slate-500 dark:text-slate-400">{plan.salesOrder || 'No SO'}</div></td>
                    <td className="px-3 py-2">{plan.productCode}<div className="text-xs text-slate-500 dark:text-slate-400">{plan.bom}</div></td>
                    <td className="px-3 py-2">{plan.date}<div className="text-xs text-slate-500 dark:text-slate-400">{plan.shift} {plan.shiftTime}</div></td>
                    <td className="px-3 py-2">{plan.facility}</td>
                    <td className="px-3 py-2">{num(plan.plannedQty)}</td>
                    <td className="px-3 py-2"><StatusBadge status={plan.status} /></td>
                    <td className="px-3 py-2">{plan.createdBy || plan.supervisor || 'Production Planner'}<div className="text-xs text-slate-500 dark:text-slate-400">Created {plan.date}</div></td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setModal({ mode: 'edit', record: plan })} className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">View / Edit</button>
                        {plan.status === 'Pending Approval' && <button onClick={() => setPlanStatus(plan.id, 'Approved')} className="rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">Approve</button>}
                        {plan.status === 'Pending Approval' && <button onClick={() => setPlanStatus(plan.id, 'Rejected')} className="rounded bg-rose-600 px-2 py-1 text-xs font-semibold text-white">Reject</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {false && (
          <div className="overflow-x-auto">
            <table className="min-w-[1180px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Plan</th>
                  <th className="px-3 py-2">Customer / SO</th>
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2">Facility</th>
                  <th className="px-3 py-2">Planned</th>
                  <th className="px-3 py-2">Actual</th>
                  <th className="px-3 py-2">Rejected</th>
                  <th className="px-3 py-2">Achievement</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((plan) => (
                  <tr key={plan.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-semibold">{plan.id}<div className="text-xs font-normal text-slate-500">{plan.batchNo || 'No batch'} · {plan.date} · {plan.shift}</div></td>
                    <td className="px-3 py-2">{plan.customer}<div className="text-xs text-slate-500">{plan.salesOrder}</div></td>
                    <td className="px-3 py-2">{plan.productCode}<div className="text-xs text-slate-500">{plan.productName}</div></td>
                    <td className="px-3 py-2">{plan.facility}</td>
                    <td className="px-3 py-2">{num(plan.plannedQty)}</td>
                    <td className="px-3 py-2 font-semibold text-emerald-700">{num(plan.actualQty)}</td>
                    <td className="px-3 py-2 text-rose-700">{num(plan.rejectedQty)}</td>
                    <td className="px-3 py-2">{progress(plan)}%</td>
                    <td className="px-3 py-2"><StatusBadge status={plan.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modal ? <PlanModal record={modal.record} machines={machines} labours={labours} items={items} boms={boms} onClose={() => setModal(null)} onSave={savePlan} /> : null}
    </div>
  )
}
