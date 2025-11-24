<template>
  <AdminLayout>
    <ReportLayout
      title="Purchase Return Summary Report"
      description="Record of all goods returned to suppliers."
      :reportGenerated="reportGenerated"
      :generating="generating"
      :has-data="filteredData.length > 0"
      @generate="generateReport"
      @print="printReport"
      @export="exportReport"
      @toggle-designer="showDesigner = !showDesigner"
    >
      <!-- Filters Slot -->
      <template #filters>
        <!-- Warehouse Dropdown -->
        <div class="relative">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Warehouse</label>
          <div class="dropdown relative inline-flex w-full" ref="warehouseDropdownRef">
            <button
              type="button"
              class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex items-center justify-between"
              @click.stop="toggleDropdown('warehouse')"
              :disabled="loadingWarehouses"
            >
              <span :class="{ 'text-gray-400': !filters.warehouse }">
                {{ filters.warehouse || 'All Warehouses' }}
              </span>
              <span class="icon-[tabler--chevron-down] w-4 h-4 transition-transform" :class="{ 'rotate-180': openDropdowns.warehouse }"></span>
            </button>

            <ul
              v-show="openDropdowns.warehouse"
              class="absolute z-50 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto"
              role="menu"
            >
              <li>
                <button
                  type="button"
                  class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm text-gray-900 dark:text-white"
                  @click="selectOption('warehouse', '')"
                >
                  All Warehouses
                </button>
              </li>
              <li v-for="warehouse in warehouses" :key="warehouse.id">
                <button
                  type="button"
                  class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm text-gray-900 dark:text-white"
                  @click="selectOption('warehouse', warehouse.name)"
                >
                  {{ warehouse.name }}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <!-- Period Dropdown -->
        <div class="relative">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Period</label>
          <div class="dropdown relative inline-flex w-full" ref="periodDropdownRef">
            <button
              type="button"
              class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex items-center justify-between"
              @click.stop="toggleDropdown('period')"
            >
              <span :class="{ 'text-gray-400': !filters.period }">
                {{ filters.period || 'Select Period' }}
              </span>
              <span class="icon-[tabler--chevron-down] w-4 h-4 transition-transform" :class="{ 'rotate-180': openDropdowns.period }"></span>
            </button>

            <ul
              v-show="openDropdowns.period"
              class="absolute z-50 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto"
              role="menu"
            >
              <li v-for="option in periodOptions" :key="option">
                <button
                  type="button"
                  class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm text-gray-900 dark:text-white"
                  @click="selectOption('period', option)"
                >
                  {{ option }}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <!-- Month Dropdown (shown when Monthly is selected) -->
        <div v-if="filters.period === 'Monthly'" class="relative">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Month</label>
          <div class="dropdown relative inline-flex w-full" ref="monthDropdownRef">
            <button
              type="button"
              class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex items-center justify-between"
              @click.stop="toggleDropdown('month')"
            >
              <span :class="{ 'text-gray-400': !filters.month }">
                {{ filters.month || 'Select Month' }}
              </span>
              <span class="icon-[tabler--chevron-down] w-4 h-4 transition-transform" :class="{ 'rotate-180': openDropdowns.month }"></span>
            </button>

            <ul
              v-show="openDropdowns.month"
              class="absolute z-50 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto"
              role="menu"
            >
              <li v-for="month in monthOptions" :key="month">
                <button
                  type="button"
                  class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm text-gray-900 dark:text-white"
                  @click="selectOption('month', month)"
                >
                  {{ month }}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <!-- Year Dropdown (shown when Yearly or Monthly is selected) -->
        <div v-if="filters.period === 'Yearly' || filters.period === 'Monthly'" class="relative">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year</label>
          <div class="dropdown relative inline-flex w-full" ref="yearDropdownRef">
            <button
              type="button"
              class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex items-center justify-between"
              @click.stop="toggleDropdown('year')"
            >
              <span :class="{ 'text-gray-400': !filters.year }">
                {{ filters.year || 'Select Year' }}
              </span>
              <span class="icon-[tabler--chevron-down] w-4 h-4 transition-transform" :class="{ 'rotate-180': openDropdowns.year }"></span>
            </button>

            <ul
              v-show="openDropdowns.year"
              class="absolute z-50 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto"
              role="menu"
            >
              <li v-for="year in yearOptions" :key="year">
                <button
                  type="button"
                  class="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm text-gray-900 dark:text-white"
                  @click="selectOption('year', year.toString())"
                >
                  {{ year }}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </template>

      <!-- Main Content -->
      <div v-if="!reportGenerated" class="flex justify-center py-20">
        <div class="text-center">
          <svg class="w-32 h-32 mx-auto text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-gray-500 dark:text-gray-400 text-lg">Configure filters and click "Generate Report"</p>
        </div>
      </div>

      <A4Preview v-if="reportGenerated" v-model:activeTab="activeTab" v-model:orientation="a4Orientation" :pages="numberOfPages" ref="a4PreviewRef">
        <!-- A4 Content -->
        <template #a4-content="{ pageIndex }">
          <div id="printable-report">
            <ReportTemplate
              :title="getReportTitle()"
              :subtitle="getReportSubtitle()"
              :generated-date="reportDate"
              :applied-filters="[]"
              :summary-cards="showSummaryCards ? getSummaryCards() : []"
              :logo-url="logoUrl"
              :company-name="companyName"
              :company-address="companyAddress"
              :show-header="showHeader"
              :show-table="showTable"
              :show-footer="showFooter"
              :reference-no="reportReferenceNo"
              :has-data="filteredData.length > 0"
              :page-index="pageIndex || 0"
              :total-pages="numberOfPages"
              :orientation="a4Orientation"
              generated-by="Admin User"
              @upload-logo="handleLogoUpload"
            >
              <table class="compact-table w-full">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>PRN Number</th>
                    <th>Supplier Name</th>
                    <th>Reference No</th>
                    <th>Return Date</th>
                    <th>SKU Code(s)</th>
                    <th>Product Name(s)</th>
                    <th>Qty(s)</th>
                    <th>UOM(s)</th>
                    <th>Reason(s)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(prn, index) in paginatedData[pageIndex]?.data || []" :key="prn.id">
                    <td class="text-center">{{ (paginatedData[pageIndex]?.startRow || 0) + index }}</td>
                      <td>{{ prn.prnNumber || 'N/A' }}</td>
                      <td>{{ prn.supplierName }}</td>
                      <td class="font-mono text-xs">{{ prn.referenceNo || 'N/A' }}</td>
                      <td class="text-xs">{{ prn.returnDate || 'N/A' }}</td>
                      <td class="font-mono text-xs">
                        <div v-for="(it, iIdx) in prn.items" :key="iIdx" class="break-words">{{ it.skuCode }}</div>
                      </td>
                      <td class="font-mono text-xs">
                        <div v-for="(it, iIdx) in prn.items" :key="iIdx" class="text-gray-800">{{ it.product }}</div>
                      </td>
                      <td class="text-center font-semibold">
                        <div v-for="(it, iIdx) in prn.items" :key="iIdx">{{ it.qty }}</div>
                      </td>
                      <td class="text-center">
                        <div v-for="(it, iIdx) in prn.items" :key="iIdx">{{ it.uom }}</div>
                      </td>
                      <td class="text-xs">
                        <div v-for="(it, iIdx) in prn.items" :key="iIdx">{{ it.reason || 'N/A' }}</div>
                      </td>
                  </tr>
                </tbody>
              </table>

              <template #summary>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Total PO Issued:</span>
                    <span class="font-semibold text-gray-900">{{ getTotalPOIssued() }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Total Qty Ordered:</span>
                    <span class="font-semibold text-gray-900">{{ getTotalQtyOrdered() }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Total Qty Received:</span>
                    <span class="font-semibold text-gray-900">{{ getTotalReceived() }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Overall Completion:</span>
                    <span class="font-semibold text-gray-900">{{ getOverallCompletion() }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">EPC Tracking Applied:</span>
                    <span class="font-semibold text-gray-900">{{ getEPCTrackingApplied() }}</span>
                  </div>
                </div>
              </template>
            </ReportTemplate>

            <!-- Overlay Components from Designer -->
            <div v-if="savedDesign?.components && savedDesign.components.length > 0" class="absolute inset-0 pointer-events-none">
              <div
                v-for="(component, index) in savedDesign.components"
                :key="index"
                :style="{
                  position: 'absolute',
                  left: component.x + 'px',
                  top: component.y + 'px',
                  width: component.width + 'px',
                  height: component.height ? component.height + 'px' : 'auto'
                }"
                class="pointer-events-auto"
              >
                <!-- Signature Component -->
                <div v-if="component.type === 'signature'" class="text-center bg-white p-2 h-full flex flex-col justify-center">
                  <p class="text-xs text-gray-600 mb-2">{{ component.data.label }}</p>
                  <img v-if="component.data.image" :src="component.data.image" alt="Signature" class="max-w-full max-h-full mx-auto object-contain" />
                  <div v-else class="border-b-2 border-gray-800 h-8"></div>
                  <p class="text-xs text-gray-500 mt-1">Signature</p>
                </div>

                <!-- Stamp Component -->
                <div v-else-if="component.type === 'stamp'" class="flex justify-center items-center bg-white p-2 h-full">
                  <img v-if="component.data.image" :src="component.data.image" alt="Stamp" class="max-w-full max-h-full object-contain" />
                  <div v-else class="border-2 border-gray-600 rounded-full aspect-square max-w-full max-h-full flex items-center justify-center p-2">
                    <p class="text-xs text-gray-700 text-center font-semibold">{{ component.data.label }}</p>
                  </div>
                </div>

                <!-- Text Component -->
                <div v-else-if="component.type === 'text'" class="bg-white p-2 h-full flex items-center">
                  <p class="text-sm text-gray-800">{{ component.data.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </template>
      </A4Preview>
    </ReportLayout>

    <!-- Report Designer Modal -->
    <ReportDesigner
      v-if="showDesigner"
      reportType="stock-level"
      :preview-html="getPreviewHTML()"
      @close="showDesigner = false"
      @save="handleDesignSave"
    />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, reactive, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import ReportLayout from '@/components/common/ReportLayout.vue'
import A4Preview from '@/components/common/A4Preview.vue'
import ReportDesigner from '@/components/common/ReportDesigner.vue'
import ReportTemplate from '@/components/common/ReportTemplate.vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import Swal from 'sweetalert2'
import { authenticatedFetch } from '@/utils/authenticatedFetch'
import { useReportPagination } from '@/composables/useReportPagination'

interface Warehouse {
  id: number
  name: string
  warehouseCode?: string
}

const route = useRoute()

const reportGenerated = ref(false)
const generating = ref(false)
const activeTab = ref('table')
const showDesigner = ref(false)
const reportDate = ref(new Date())
const logoUrl = ref(localStorage.getItem('reportLogoUrl') || '')
const reportReferenceNo = ref('')
const a4Orientation = ref<'portrait' | 'landscape'>('portrait')

// Generate random reference number
const generateReferenceNo = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `RPT-${year}${month}${day}-${random}`
}

// Check if report has data
const hasReportData = computed(() => {
  return reportGenerated.value && filteredData.value.length > 0
})

// Load saved design settings
const savedDesign = ref<any>(null)
const companyName = ref('Warehouse Management System')
const companyAddress = ref('Inventory Management Division')
const showSummaryCards = ref(true)
const showTable = ref(true)
const showHeader = ref(true)
const showFooter = ref(true)

const loadDesignSettings = () => {
  const saved = localStorage.getItem('report-design-stock-level')
  if (saved) {
    try {
      const data = JSON.parse(saved)
      savedDesign.value = data
      
      if (data.logoUrl) {
        logoUrl.value = data.logoUrl
      }
      if (data.companyName) {
        companyName.value = data.companyName
      }
      if (data.companyAddress) {
        companyAddress.value = data.companyAddress
      }
      if (data.showSummaryCards !== undefined) {
        showSummaryCards.value = data.showSummaryCards
      }
      if (data.showTable !== undefined) {
        showTable.value = data.showTable
      }
      if (data.showHeader !== undefined) {
        showHeader.value = data.showHeader
      }
      if (data.showFooter !== undefined) {
        showFooter.value = data.showFooter
      }
      
      console.log('Loaded design with', data.components?.length || 0, 'overlay components')
    } catch (e) {
      console.error('Error loading design settings:', e)
    }
  }
}

// Dropdown refs and state
const warehouseDropdownRef = ref<HTMLElement | null>(null)
const periodDropdownRef = ref<HTMLElement | null>(null)
const monthDropdownRef = ref<HTMLElement | null>(null)
const yearDropdownRef = ref<HTMLElement | null>(null)
const openDropdowns = reactive({ warehouse: false, period: false, month: false, year: false })
const loadingWarehouses = ref(false)
const warehouses = ref<Warehouse[]>([])

const periodOptions = ['Daily', 'Weekly', 'Monthly', 'Yearly']
const monthOptions = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const yearOptions = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)

const filters = ref({
  warehouse: '',
  period: '',
  month: '',
  year: ''
})

// Fetch warehouses from API
const fetchWarehouses = async () => {
  loadingWarehouses.value = true
  try {
    const response = await authenticatedFetch('/api/warehouse')
    if (!response.ok) throw new Error('Failed to fetch warehouses')
    const data = await response.json()
    warehouses.value = data || []
  } catch (error) {
    console.error('Error fetching warehouses:', error)
    Swal.fire('Error', 'Failed to load warehouses', 'error')
  } finally {
    loadingWarehouses.value = false
  }
}

// Dropdown helpers
const toggleDropdown = (name: 'warehouse' | 'period' | 'month' | 'year') => {
  Object.keys(openDropdowns).forEach(k => {
    if (k !== name) openDropdowns[k as keyof typeof openDropdowns] = false
  })
  openDropdowns[name] = !openDropdowns[name]
}

const selectOption = (key: keyof typeof filters.value, value: string) => {
  filters.value[key] = value as never
  
  // Close the corresponding dropdown
  if (key === 'warehouse') {
    openDropdowns.warehouse = false
  } else if (key === 'period') {
    openDropdowns.period = false
    // Reset month and year when period changes
    if (value !== 'Monthly' && value !== 'Yearly') {
      filters.value.month = ''
      filters.value.year = ''
    }
  } else if (key === 'month') {
    openDropdowns.month = false
  } else if (key === 'year') {
    openDropdowns.year = false
  }
}

// Close dropdowns when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const warehouseDd = warehouseDropdownRef.value
  const periodDd = periodDropdownRef.value
  const monthDd = monthDropdownRef.value
  const yearDd = yearDropdownRef.value

  if (warehouseDd && !warehouseDd.contains(event.target as Node)) {
    openDropdowns.warehouse = false
  }

  if (periodDd && !periodDd.contains(event.target as Node)) {
    openDropdowns.period = false
  }

  if (monthDd && !monthDd.contains(event.target as Node)) {
    openDropdowns.month = false
  }

  if (yearDd && !yearDd.contains(event.target as Node)) {
    openDropdowns.year = false
  }
}

  // Each PRN (purchase return) contains multiple returned items
  const stockData = ref([
  {
    id: 1,
    prnNumber: 'PRN-2001',
    referenceNo: 'REF-9001',
    supplierName: 'Supplier A',
    returnDate: '2025-11-18',
    warehouse: 'Main Warehouse',
    items: [
      { skuCode: 'SKU-101-A', product: 'Laptop HP Elite - Model A', qty: 10, uom: 'PCS', reason: 'Damaged', epcTags: ['AA0012345678121125000001'] },
      { skuCode: 'SKU-101-B', product: 'Laptop HP Elite - Model B', qty: 5, uom: 'PCS', reason: 'Wrong Specs', epcTags: ['AA0012345678121125000002'] }
    ]
  },
  {
    id: 2,
    prnNumber: 'PRN-2002',
    referenceNo: 'REF-9002',
    supplierName: 'Supplier B',
    returnDate: '2025-11-18',
    warehouse: 'Main Warehouse',
    items: [
      { skuCode: 'SKU-102', product: 'Mouse Logitech', qty: 3, uom: 'PCS', reason: 'Defective', epcTags: ['BB0012345678121125000001'] }
    ]
  },
  {
    id: 3,
    prnNumber: 'PRN-2003',
    referenceNo: 'REF-9003',
    supplierName: 'Supplier C',
    returnDate: '2025-11-18',
    warehouse: 'South Branch',
    items: [
      { skuCode: 'SKU-103', product: 'Keyboard Mechanical', qty: 2, uom: 'PCS', reason: 'Customer Return', epcTags: [] }
    ]
  }
])

const filteredData = computed(() => {
  return stockData.value.filter(item => {
    if (filters.value.warehouse && item.warehouse !== filters.value.warehouse) return false
    return true
  })
})

const getTotalReceived = () => {
  return filteredData.value.reduce((total, prn) => {
    const sum = prn.items.reduce((s, it) => s + (it.qty || 0), 0)
    return total + sum
  }, 0)
}

const getTotalPOIssued = () => {
  const set = new Set(filteredData.value.map(i => i.prnNumber).filter(Boolean))
  return set.size
}

const getTotalQtyOrdered = () => {
  return filteredData.value.reduce((total, prn) => {
    const sum = prn.items.reduce((s, it) => s + (it.qty || 0), 0)
    return total + sum
  }, 0)
}

const getOverallCompletion = () => {
  const ordered = getTotalQtyOrdered()
  const received = getTotalReceived()
  if (ordered === 0) return '0.0%'
  const percent = (received / ordered) * 100
  return `${percent.toFixed(1)}%`
}

const getEPCTrackingApplied = () => {
  const suppliers = new Set(filteredData.value.map(i => i.supplierName).filter(Boolean))
  const suppliersWithEPC = new Set(filteredData.value.filter(po => po.items.some(it => (it.epcTags?.length || 0) > 0)).map(po => po.supplierName))
  const total = suppliers.size
  const applied = suppliersWithEPC.size
  const percent = total > 0 ? Math.round((applied / total) * 100) : 0
  return `${applied}/${total} (${percent}%)`
}

// Use pagination composable
const pagination = useReportPagination({
  data: filteredData,
  itemsPerPage: 15,
  headerHeight: 220,
  footerHeight: 60,
  rowHeight: 50,
  orientation: a4Orientation
})

const { totalPages, paginatedData } = pagination

const numberOfPages = totalPages

const getEPCCompliance = () => {
  const totalQty = filteredData.value.reduce((sumPrn, prn) => sumPrn + prn.items.reduce((s, it) => s + (it.qty || 0), 0), 0)
  const epcQty = filteredData.value.reduce((sumPrn, prn) => sumPrn + prn.items.reduce((s, it) => s + (it.epcTags?.length || 0), 0), 0)
  const percentage = totalQty > 0 ? Math.round((epcQty / totalQty) * 100) : 0
  return `${epcQty}/${totalQty} (${percentage}%)`
}

const getReportTitle = () => {
  let title = ''
  if (filters.value.period) {
    title = `${filters.value.period} Purchase Return Summary`
  } else {
    title = 'Purchase Return Summary'
  }
  
  if (filters.value.warehouse) {
    title += ` - ${filters.value.warehouse}`
  }
  
  return title
}

const getReportSubtitle = () => {
  const parts = []
  
  if (filters.value.period === 'Monthly' && filters.value.month) {
    parts.push(filters.value.month)
  }
  
  if ((filters.value.period === 'Monthly' || filters.value.period === 'Yearly') && filters.value.year) {
    parts.push(filters.value.year)
  }
  
  if (parts.length > 0) {
    return parts.join(' ')
  }
  
  return 'Record of all goods returned to suppliers.'
}

const getTotalQuantity = () => {
  return filteredData.value.reduce((total, prn) => {
    return total + prn.items.reduce((s, it) => s + (it.qty || 0), 0)
  }, 0)
}

const getAppliedFilters = () => {
  return []
}

const getSummaryCards = () => {
  return [
    { label: 'Total PO Issued', value: getTotalPOIssued().toString(), subtitle: 'Distinct POs' },
    { label: 'Total Qty Ordered', value: getTotalQtyOrdered().toString(), subtitle: 'Items ordered' },
    { label: 'Total Qty Received', value: getTotalReceived().toString(), subtitle: 'Items received' },
    { label: 'Overall Completion', value: getOverallCompletion(), subtitle: 'Received / Ordered' },
    { label: 'EPC Tracking Applied', value: getEPCTrackingApplied(), subtitle: 'Suppliers using EPC' }
  ]
}

const generateReport = () => {
  generating.value = true
  reportDate.value = new Date()
  reportReferenceNo.value = generateReferenceNo()
  setTimeout(() => {
    generating.value = false
    reportGenerated.value = true
    nextTick(() => {
      console.log('Pagination debug', {
        pages: numberOfPages.value,
        itemsPerPage: pagination.itemsPerPage.value,
        availableContentHeight: pagination.availableContentHeight.value
      })
    })
  }, 1500)
}

const printReport = () => {
  // Show instructions dialog first
  Swal.fire({
    title: 'Print Settings',
    html: `
      <div class="text-left text-sm space-y-3">
        <p class="font-semibold text-gray-900">Please configure your print settings:</p>
        <ol class="list-decimal list-inside space-y-2 text-gray-700">
          <li>Set margins to <strong>Custom</strong></li>
          <li>Set all margins (Top, Bottom, Left, Right) to <strong>5mm</strong></li>
          <li><strong>Uncheck</strong> "Headers and footers" option</li>
          <li>Click <strong>Print</strong> or <strong>Save as PDF</strong></li>
        </ol>
        <p class="text-xs text-gray-500 mt-3">The print preview will open in a new window</p>
      </div>
    `,
    icon: 'info',
    confirmButtonText: 'Open Print Preview',
    confirmButtonColor: '#2563eb',
    showCancelButton: true,
    cancelButtonText: 'Cancel',
    width: '500px'
  }).then((result) => {
    if (result.isConfirmed) {
      openPrintWindow()
    }
  })
}

const openPrintWindow = () => {
  const printContent = document.getElementById('printable-report')
  if (!printContent) return

  let rawHtml = printContent.outerHTML
  const pageWidth = a4Orientation?.value === 'landscape' ? '297mm' : '210mm'
  const pageHeight = a4Orientation?.value === 'landscape' ? '210mm' : '297mm'
  rawHtml = rawHtml.replace(/transform:\s*scale\([^)]*\);?/g, '')
  rawHtml = rawHtml.replace(/width:\s*\d+mm;?/g, `width: ${pageWidth};`)
  rawHtml = rawHtml.replace(/min-height:\s*\d+mm;?/g, `min-height: ${pageHeight};`)

  // Get all stylesheets from the current page
  const stylesheets = Array.from(document.styleSheets)
    .map(sheet => {
      try {
        // Try to get inline styles
        if (sheet.href) {
          return `<link rel="stylesheet" href="${sheet.href}">`
        } else if (sheet.ownerNode && (sheet.ownerNode as HTMLElement).outerHTML) {
          return (sheet.ownerNode as HTMLElement).outerHTML
        }
      } catch (e) {
        // Cross-origin stylesheets
        if (sheet.href) {
          return `<link rel="stylesheet" href="${sheet.href}">`
        }
      }
      return ''
    })
    .join('\n')

  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Purchase Return Report</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${stylesheets}
  <style>
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    @page {
      size: A4 ${a4Orientation?.value || 'portrait'};
      margin: 0;
    }
    
    html {
      margin: 0;
      padding: 0;
    }
    
    body {
      margin: 0;
      padding: 0;
      background: white;
      overflow: hidden;
    }
    
    /* Prevent table scrolling */
    table {
      table-layout: fixed;
      width: 100%;
    }
    
    td, th {
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    #printable-report {
      width: 100%;
    }
    
    /* Ensure footer appears on each page */
    .report-template {
      position: relative;
      min-height: ${pageHeight};
      height: ${pageHeight};
    }
    
    .report-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 0.75rem 1rem;
      background: white;
      border-top: 1px solid rgb(209, 213, 219);
      margin: 0 1rem;
    }
    
    /* Instructions banner - only visible on screen */
    .print-instructions {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #2563eb;
      color: white;
      padding: 1rem;
      text-align: center;
      z-index: 1000;
      font-size: 14px;
    }
    
    .print-instructions strong {
      font-weight: 700;
    }
    
    /* Print button for the preview */
    .print-button {
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      padding: 0.75rem 1.5rem;
      background: rgb(37, 99, 235);
      color: white;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      font-weight: 600;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      font-size: 14px;
    }
    
    .print-button:hover {
      background: rgb(29, 78, 216);
    }
    
    @media print {
      .print-button,
      .print-instructions {
        display: none !important;
      }
      
      body {
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
      }
      
      /* Prevent table scrolling */
      table {
        table-layout: fixed !important;
        width: 100% !important;
      }
      
      td, th {
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }
      
      .report-footer {
        position: fixed;
        bottom: 0;
      }
      
      /* Ensure content doesn't overlap footer */
      .report-content {
        padding-bottom: 40px;
      }
    }
  </style>
  <script>
    window.onload = function() {
      // Auto-open print dialog
      setTimeout(function() {
        window.print();
      }, 500);
      
      // Also add click handler for manual print
      document.getElementById('printBtn').addEventListener('click', function() {
        window.print();
      });
    };
  <\/script>
</head>
<body>
  <div class="print-instructions">
    <strong>Print Settings:</strong> Set margins to Custom <strong>5mm</strong> on all sides • Uncheck "Headers and footers"
  </div>
  <button id="printBtn" class="print-button">🖨️ Print / Save as PDF</button>
  ${rawHtml}
</body>
</html>`
  
  printWindow.document.write(htmlContent)
  printWindow.document.close()
}

const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
  if (format === 'pdf') {
    exportToPDF()
  } else if (format === 'excel') {
    exportToExcel()
  } else if (format === 'csv') {
    exportToCSV()
  }
}

const exportToPDF = async () => {
  // Show instructions dialog first
  const result = await Swal.fire({
    title: 'Export to PDF',
    html: `
      <div class="text-left text-sm space-y-3">
        <p class="font-semibold text-gray-900">Print dialog will open. Please configure:</p>
        <ol class="list-decimal list-inside space-y-2 text-gray-700">
          <li>Destination: <strong>Save as PDF</strong></li>
          <li>Set margins to <strong>Custom: 5mm</strong> on all sides</li>
          <li><strong>Uncheck</strong> "Headers and footers" option</li>
          <li>Click <strong>Save</strong></li>
        </ol>
        <p class="text-xs text-gray-500 mt-3">The print preview will open in a new window</p>
      </div>
    `,
    icon: 'info',
    confirmButtonText: 'Continue',
    confirmButtonColor: '#2563eb',
    showCancelButton: true,
    cancelButtonText: 'Cancel',
    width: '500px'
  })

  if (!result.isConfirmed) return

  try {
    // Use the print approach - open in new tab with print-ready HTML
    const printContent = document.getElementById('printable-report')
    if (!printContent) {
      throw new Error('Report content not found')
    }

    // Get all stylesheets
    const stylesheets = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          if (sheet.href) {
            return `<link rel="stylesheet" href="${sheet.href}">`
          } else if (sheet.ownerNode && (sheet.ownerNode as HTMLElement).outerHTML) {
            return (sheet.ownerNode as HTMLElement).outerHTML
          }
        } catch (e) {
          if (sheet.href) {
            return `<link rel="stylesheet" href="${sheet.href}">`
          }
        }
        return ''
      })
      .join('\n')

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      throw new Error('Please allow popups to export PDF')
    }

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Purchase Return Report</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${stylesheets}
  <style>
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    @page {
      size: A4 ${a4Orientation?.value || 'portrait'};
      margin: 0;
    }
    
    html {
      margin: 0;
      padding: 0;
    }
    
    body {
      margin: 0;
      padding: 0;
      background: white;
    }
    
    #printable-report {
      width: 100%;
      background: white;
    }
    
    .report-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 0.5rem 0;
      background: white;
    }
    
    .print-instructions {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #16a34a;
      color: white;
      padding: 1rem;
      text-align: center;
      z-index: 1000;
      font-size: 14px;
    }
    
    .print-instructions strong {
      font-weight: 700;
    }
    
    @media print {
      .print-instructions {
        display: none !important;
      }
      
      body {
        margin: 0 !important;
      }
      
      .report-footer {
        position: fixed;
        bottom: 0;
      }
      
      .report-content {
        padding-bottom: 40px;
      }
    }
  </style>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  <\/script>
</head>
<body>
  <div class="print-instructions">
    <strong>PDF Export:</strong> Select "Save as PDF" • Set margins to <strong>5mm</strong> • Uncheck "Headers and footers"
  </div>
  ${printContent.outerHTML}
</body>
</html>`
    
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: error instanceof Error ? error.message : 'Failed to generate PDF',
      icon: 'error'
    })
  }
}

const exportToExcel = () => {
  const data = filteredData.value.map((prn, index) => {
    const skuCodes = prn.items.map(it => it.skuCode).join('; ')
    const qtyList = prn.items.map(it => it.qty).join('; ')
    const products = prn.items.map(it => it.product).join('; ')
    const uoms = prn.items.map(it => it.uom).join('; ')
    const reasons = prn.items.map(it => it.reason || 'N/A').join('; ')
    return {
      'No': index + 1,
      'PRN Number': prn.prnNumber || 'N/A',
      'Supplier Name': prn.supplierName,
      'Reference No': prn.referenceNo || 'N/A',
      'Return Date': prn.returnDate || '',
      'SKU Code(s)': skuCodes,
      'Product Name(s)': products,
      'Qty(s)': qtyList,
      'UOM(s)': uoms,
      'Reason(s)': reasons
    }
  })
  
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Stock Received Report')
  
  // Add column widths
  ws['!cols'] = [
    { wch: 5 },  // No
    { wch: 18 }, // PRN Number
    { wch: 25 }, // Supplier Name
    { wch: 20 }, // Reference No
    { wch: 12 }, // Return Date
    { wch: 25 }, // SKU Code(s)
    { wch: 30 }, // Product Name(s)
    { wch: 12 }, // Qty(s)
    { wch: 12 }, // UOM(s)
    { wch: 30 }  // Reason(s)
  ]
  
  XLSX.writeFile(wb, `stock-received-report-${new Date().getTime()}.xlsx`)
}

const exportToCSV = () => {
  const headers = ['No', 'PRN Number', 'Supplier Name', 'Reference No', 'Return Date', 'SKU Code(s)', 'Product Name(s)', 'Qty(s)', 'UOM(s)', 'Reason(s)']
  const rows = filteredData.value.map((prn, index) => [
    index + 1,
    prn.prnNumber || 'N/A',
    prn.supplierName,
    prn.referenceNo || 'N/A',
    prn.returnDate || '',
    prn.items.map(it => it.skuCode).join('; '),
    prn.items.map(it => it.product).join('; '),
    prn.items.map(it => it.qty).join('; '),
    prn.items.map(it => it.uom).join('; '),
    prn.items.map(it => it.reason || 'N/A').join('; ')
  ])
  
  let csvContent = headers.join(',') + '\n'
  rows.forEach(row => {
    csvContent += row.map(cell => `"${cell}"`).join(',') + '\n'
  })
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `stock-received-report-${new Date().getTime()}.csv`
  link.click()
}

const handleDesignSave = (designData: any) => {
  console.log('Design saved:', designData)
  // Reload design settings to apply changes
  loadDesignSettings()
}

const getPreviewHTML = () => {
  const element = document.getElementById('printable-report')
  return element ? element.innerHTML : ''
}

// Check if opened in design mode
onMounted(() => {
  // Load design settings first
  loadDesignSettings()
  
  // Fetch warehouses
  fetchWarehouses()
  
  // Add click outside listener
  document.addEventListener('click', handleClickOutside)
  
  if (route.query.design === 'true') {
    // Generate report first, then open designer
    generateReport()
    setTimeout(() => {
      showDesigner.value = true
    }, 2000)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleLogoUpload = async () => {
  const { value: file } = await Swal.fire({
    title: 'Upload Company Logo',
    input: 'file',
    inputAttributes: {
      accept: 'image/*',
      'aria-label': 'Upload your company logo'
    },
    showCancelButton: true,
    confirmButtonText: 'Upload',
    confirmButtonColor: '#2563eb',
    preConfirm: (file) => {
      if (!file) {
        Swal.showValidationMessage('Please select an image file')
        return false
      }
      
      if (file.size > 2 * 1024 * 1024) {
        Swal.showValidationMessage('File size must be less than 2MB')
        return false
      }
      
      if (!file.type.startsWith('image/')) {
        Swal.showValidationMessage('Please select a valid image file')
        return false
      }
      
      return file
    }
  })

  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      logoUrl.value = result
      localStorage.setItem('reportLogoUrl', result)
      
      Swal.fire({
        title: 'Success!',
        text: 'Logo uploaded successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      })
    }
    reader.readAsDataURL(file)
  }
}
</script>

<style>
/* CRITICAL: Force all colors to hex/rgb for html2canvas compatibility */
#printable-report,
#printable-report * {
  color-scheme: light !important;
}

/* Override ALL Tailwind color classes */
#printable-report .bg-white { background-color: rgb(255, 255, 255) !important; }
#printable-report .bg-gray-50 { background-color: rgb(249, 250, 251) !important; }
#printable-report .bg-gray-100 { background-color: rgb(243, 244, 246) !important; }
#printable-report .bg-gray-200 { background-color: rgb(229, 231, 235) !important; }
#printable-report .bg-gray-800 { background-color: rgb(31, 41, 55) !important; }
#printable-report .bg-gray-900 { background-color: rgb(17, 24, 39) !important; }
#printable-report .bg-blue-50 { background-color: rgb(239, 246, 255) !important; }
#printable-report .bg-blue-600 { background-color: rgb(37, 99, 235) !important; }
#printable-report .bg-green-100 { background-color: rgb(220, 252, 231) !important; }
#printable-report .bg-yellow-100 { background-color: rgb(254, 243, 199) !important; }
#printable-report .bg-red-100 { background-color: rgb(254, 226, 226) !important; }

#printable-report .text-white { color: rgb(255, 255, 255) !important; }
#printable-report .text-gray-500 { color: rgb(107, 114, 128) !important; }
#printable-report .text-gray-600 { color: rgb(75, 85, 99) !important; }
#printable-report .text-gray-700 { color: rgb(55, 65, 81) !important; }
#printable-report .text-gray-800 { color: rgb(31, 41, 55) !important; }
#printable-report .text-gray-900 { color: rgb(17, 24, 39) !important; }
#printable-report .text-blue-600 { color: rgb(37, 99, 235) !important; }
#printable-report .text-green-700 { color: rgb(21, 128, 61) !important; }
#printable-report .text-yellow-700 { color: rgb(161, 98, 7) !important; }
#printable-report .text-red-700 { color: rgb(185, 28, 28) !important; }

#printable-report .border-gray-200 { border-color: rgb(229, 231, 235) !important; }
#printable-report .border-gray-300 { border-color: rgb(209, 213, 219) !important; }
#printable-report .border-gray-800 { border-color: rgb(31, 41, 55) !important; }
#printable-report .border-b-2 { border-bottom-width: 2px !important; border-bottom-color: rgb(31, 41, 55) !important; }

/* Remove shadows from overlay components for clean printing */
#printable-report .absolute .bg-white\/95,
#printable-report .absolute .shadow {
  box-shadow: none !important;
  background-color: rgb(255, 255, 255) !important;
}

</style>

<style scoped>
/* Compact table styling for denser display */
.compact-table {
  /* Keep table spacing larger, but inner text will be smaller */
  font-size: 12px; /* table layout base */
  border-collapse: collapse;
  font-family: inherit;
}
.compact-table th, .compact-table td {
  padding: 8px 10px !important; /* restore larger table spacing */
  vertical-align: top;
  border-bottom: 1px solid rgba(0,0,0,0.06);
}
.compact-table th { font-size: 11px !important; font-weight: 600 }
.compact-table td.text-center { text-align: center }
.compact-table .break-words { max-width: 360px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-block }

/* Reduce only the inner text size so rows remain larger */
.compact-table td,
.compact-table td div,
.compact-table td span {
  font-size: 10px !important; /* smaller text inside larger cells */
  line-height: 1.1 !important;
}

@media (max-width: 900px) {
  .compact-table { font-size: 11px }
  .compact-table th { font-size: 10px !important }
  .compact-table td,
  .compact-table td div,
  .compact-table td span {
    font-size: 9px !important;
  }
  .compact-table .break-words { max-width: 160px }
}
</style>