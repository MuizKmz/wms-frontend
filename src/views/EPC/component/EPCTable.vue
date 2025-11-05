<template>
  <div class="overflow-hidden">
    <!-- Header with Select Columns Button -->
    <div class="flex justify-between items-center mb-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Showing {{ filteredData.length }} EPC records
      </p>

      <!-- Select Columns Button -->
      <div class="relative z-50">
        <SelectTable
          :apiUrl="API_URL"
          :storageKey="`epc-columns`"
          :availableColumns="allowedColumns"
          @update:selected="handleColumnsUpdate"
        />
      </div>
    </div>

    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="min-w-full table-auto">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <!-- Checkbox Column (Always Visible) -->
            <th class="px-6 py-3 text-left w-12">
              <input
                type="checkbox"
                class="checkbox checkbox-primary checkbox-sm"
                aria-label="select all"
                :checked="selectAll"
                @change="toggleSelectAll"
              />
            </th>

            <!-- Dynamic Columns -->
            <th
              v-for="col in selectedColumns"
              :key="col"
              class="px-6 py-3 text-left"
              :class="getColumnWidthClass(col)"
            >
              <p
                class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400"
              >
                {{ formatColumnName(col) }}
              </p>
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="epc in visibleRows"
            :key="epc.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
            @click="viewEPC(epc)"
          >
            <!-- Checkbox -->
            <td class="px-6 py-4" @click.stop>
              <input
                type="checkbox"
                class="checkbox checkbox-primary checkbox-sm"
                aria-label="select item"
                :checked="isSelected(epc.uniqueId)"
                @change="toggleItemSelection(epc.uniqueId)"
              />
            </td>

            <!-- Dynamic Data Columns -->
            <td v-for="col in selectedColumns" :key="col" class="px-6 py-4">
              <!-- EPC Code with clickable button -->
              <span v-if="col === 'epcCode'">
                <button
                  type="button"
                  class="text-left font-bold text-sm text-blue-600 dark:text-blue-400 hover:underline break-all focus:outline-none"
                  @click.stop="viewEPC(epc)"
                  :title="`View code images for ${getCellValue(epc, col)}`"
                >
                  {{ getCellValue(epc, col) }}
                </button>
              </span>

              <!-- Corp Code with monospace and label -->
              <span
                v-else-if="col === 'corpCode'"
                class="font-mono text-sm text-gray-900 dark:text-white"
              >
                {{ getCellValue(epc, col) }}
                <span
                  v-if="epc.corpCode?.label"
                  class="block text-[11px] text-gray-500 dark:text-gray-400"
                >
                  {{ epc.corpCode.label }}
                </span>
              </span>

              <!-- SKU Code with monospace -->
              <span
                v-else-if="col === 'skuCode'"
                class="font-mono text-sm text-gray-900 dark:text-white"
              >
                {{ getCellValue(epc, col) }}
              </span>

              <!-- Product Code with monospace -->
              <span
                v-else-if="col === 'productCode'"
                class="font-mono text-sm text-gray-900 dark:text-white"
              >
                {{ getCellValue(epc, col) }}
              </span>

              <!-- Serial Number with special styling -->
              <span
                v-else-if="col === 'serialNumber'"
                class="font-mono text-sm font-semibold text-green-600 dark:text-green-400"
              >
                {{ getCellValue(epc, col) }}
              </span>

              <!-- Status with badge -->
              <span
                v-else-if="col === 'status'"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getStatusClass(getCellValue(epc, col))"
              >
                {{ getCellValue(epc, col) || 'GENERATED' }}
              </span>

              <!-- Created Time with date formatting -->
              <span v-else-if="col === 'createdTime'" class="text-sm text-gray-900 dark:text-white">
                {{ formatDateTime(getCellValue(epc, col)) }}
              </span>

              <!-- Default display -->
              <span v-else class="text-sm text-gray-900 dark:text-white">
                {{ getCellValue(epc, col) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Loading State -->
      <div v-if="loading" class="p-8 text-center text-gray-500 text-sm">
        <div
          class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"
        ></div>
        <p>Loading EPC records...</p>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && filteredData.length === 0" class="p-8 text-center text-gray-500">
        <svg
          class="mx-auto h-12 w-12 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No EPC records found</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your filters or generate a new EPC batch.
        </p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="p-8 text-center text-red-500 text-sm">
        <svg
          class="mx-auto h-12 w-12 text-red-300 mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <p class="font-medium">Error loading EPC records</p>
        <p class="text-xs mt-1">{{ error }}</p>
      </div>

      <!-- Pagination -->
      <div class="mt-6 flex justify-center">
        <nav class="flex items-center gap-x-2">
          <button
            type="button"
            class="btn btn-sm btn-outline dark:text-gray-300"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            Previous
          </button>

          <div class="flex items-center gap-x-1">
            <!-- Page numbers and ellipsis -->
            <template v-for="page in displayPages" :key="page">
              <span v-if="page === -1" class="px-2" aria-hidden="true">...</span>
              <button
                v-else
                type="button"
                class="btn btn-sm btn-outline min-w-[40px]"
                :class="
                  page === currentPage
                    ? '!bg-blue-100 !text-blue-600 !border-blue-300 !border'
                    : 'text-gray-700 border-gray-300 hover:bg-blue-50 hover:text-blue-600'
                "
                @click="changePage(page)"
              >
                {{ page }}
              </button>
            </template>
          </div>

          <button
            type="button"
            class="btn btn-sm btn-outline dark:text-gray-300"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            Next
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import Swal from 'sweetalert2'
import { authenticatedFetch } from '@/utils/authenticatedFetch'
import SelectTable from '@/components/common/SelectTable.vue'

// --- Type Definitions ---
interface Product {
  id: number
  skuCode: string
  productCode: string
  name: string
  categoryId: number
  supplierId: number
  status: string
  remarks: string | null
  createdAt: string
  updatedAt: string
}

interface CorpCode {
  id: number
  code: string
  label: string
  createdAt: string
}

interface EPCRecord {
  id: number
  epcCode: string
  productId: number
  corpCodeId: number
  batchName: string
  batchNumber: number
  status: string
  createdAt: string
  qrCodeImageUrl: string
  barcodeImageUrl: string
  product?: Product
  corpCode?: CorpCode
  uniqueId: string
}

interface Filters {
  corpCode?: string
  skuCode?: string
  date?: string // YYYY-MM-DD
}

const props = defineProps<{
  filters: Filters
}>()

const emit = defineEmits(['view-epc', 'bulk-delete-epc'])

const data = ref<EPCRecord[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const selectedItems = ref<string[]>([])
const selectAll = ref(false)
const selectedColumns = ref<string[]>([])

const API_URL = '/api/epc'

const allowedColumns = [
  'epcCode',
  'corpCode',
  'skuCode',
  'productCode',
  'productName',
  'serialNumber',
  'batchNumber',
  'batchName',
  'status',
  'createdTime',
]

const fieldAliases = {
  epcCode: ['epcCode'],
  corpCode: ['code'],
  skuCode: ['skuCode'],
  productCode: ['productCode'],
  productName: ['productName'],
  serialNumber: ['serialNumber'],
  batchNumber: ['batchNumber', 'batchNo'],
  batchName: ['batchName'],
  status: ['status'],
  createdTime: ['createdTime', 'createdAt'],
}

//Format column name for display
const formatColumnName = (name: string) => {
  const nameMap: Record<string, string> = {
    epcCode: 'EPC Code',
    corpCode: 'Corp Code',
    skuCode: 'SKU Code',
    productCode: 'Product Code',
    productName: 'Product Name',
    serialNumber: 'Serial Number',
    batchNumber: 'Batch No.',
    batchName: 'Batch Name',
    status: 'Status',
    createdTime: 'Created Time',
  }

  return (
    nameMap[name] ||
    name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  )
}

// Get column width class based on column name
const getColumnWidthClass = (col: string) => {
  const widthMap: Record<string, string> = {
    epcCode: 'min-w-[200px]',
    corpCode: 'min-w-[100px]',
    skuCode: 'min-w-[120px]',
    productCode: 'min-w-[140px]',
    productName: 'min-w-[180px]',
    serialNumber: 'min-w-[120px]',
    batchNumber: 'min-w-[100px]',
    batchName: 'min-w-[150px]',
    status: 'min-w-[100px]',
    createdTime: 'min-w-[150px]',
  }

  return widthMap[col] || ''
}

// Get cell value with proper fallbacks and field aliases
const getCellValue = (epc: EPCRecord, col: string): string => {
  const aliases = fieldAliases[col as keyof typeof fieldAliases]
  if (aliases) {
    for (const alias of aliases) {
      if (epc[alias as keyof EPCRecord] != null && epc[alias as keyof EPCRecord] !== '') {
        return String(epc[alias as keyof EPCRecord])
      }
    }
  }

  switch (col) {
    case 'corpCode':
      return epc.corpCode?.code || parseEPCCode(epc.epcCode).code || '-'

    case 'skuCode':
      return epc.product?.skuCode || parseEPCCode(epc.epcCode).skuCode || '-'

    case 'productCode':
      return epc.product?.productCode || '-'

    case 'productName':
      return epc.product?.name || '-'

    case 'serialNumber':
      return parseEPCCode(epc.epcCode).serialNumber || '-'

    case 'batchNumber':
      return epc.batchNumber ? String(epc.batchNumber) : '-'

    case 'batchName':
      return epc.batchName || '-'

    case 'status':
      return epc.status || 'GENERATED'

    case 'createdTime':
      return epc.createdAt || '-'

    default:
      return epc[col as keyof EPCRecord] != null ? String(epc[col as keyof EPCRecord]) : '-'
  }
}

// Handle column selection update from SelectTable component
const handleColumnsUpdate = (columns: string[]) => {
  selectedColumns.value = columns
  console.log('Selected columns updated:', columns)
}

// --- Data Fetching ---
const fetchEPCs = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await authenticatedFetch(API_URL)

    if (!response.ok) throw new Error('Failed to fetch EPC records')

    const json: EPCRecord[] = await response.json()
    data.value = (json || []).map((epc) => ({
      ...epc,
      uniqueId: `E-${epc.id || Math.random()}`,
    }))
  } catch (e) {
    error.value = (e as Error).message
    console.error('Error fetching EPCs:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchEPCs()
})

// --- EPC Code Parser ---
/**
 * Parse EPC code format: corpCode(4) + skuCode(8) + date(6) + serialNumber(6) = 24 chars
 * Example: AA0012345678151025000001
 * - Corp Code: AA00 (4 chars)
 * - SKU Code: 12345678 (8 chars)
 * - Date: 151025 (DDMMYY - 6 chars)
 * - Serial Number: 000001 (6 chars)
 */
const parseEPCCode = (epcCode: string | null | undefined) => {
  if (!epcCode || epcCode.length < 24) {
    return {
      corpCode: null,
      skuCode: null,
      date: null,
      serialNumber: null,
    }
  }

  return {
    corpCode: epcCode.substring(0, 4), // Characters 0-3
    skuCode: epcCode.substring(4, 12), // Characters 4-11
    date: epcCode.substring(12, 18), // Characters 12-17
    serialNumber: epcCode.substring(18, 24), // Characters 18-23 (last 6 digits)
  }
}

// --- Status Badge Styling ---
const getStatusClass = (status: string) => {
  const statusMap = {
    GENERATED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    RECEIVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    DELIVERED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    INBOUND: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  }
  return (
    (statusMap as Record<string, string>)[status] ||
    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  )
}

// --- Filtering & Pagination Logic ---
const filteredData = computed<EPCRecord[]>(() => {
  return data.value.filter((item: EPCRecord) => {
    const parsed = parseEPCCode(item.epcCode || '')

    // --- Corp Code filter ---
    if (
      props.filters.corpCode &&
      !(
        parsed.corpCode?.toLowerCase().includes(props.filters.corpCode.toLowerCase()) ||
        item.corpCode?.code?.toLowerCase().includes(props.filters.corpCode.toLowerCase())
      )
    ) {
      return false
    }

    // --- SKU Code filter ---
    if (
      props.filters.skuCode &&
      !(
        parsed.skuCode?.toLowerCase().includes(props.filters.skuCode.toLowerCase()) ||
        item.product?.skuCode?.toLowerCase().includes(props.filters.skuCode.toLowerCase())
      )
    ) {
      return false
    }

    // --- Date filter ---
    if (props.filters.date) {
      const formattedFilterDate = props.filters.date.replace(/-/g, '') // from 'YYYY-MM-DD' → 'YYYYMMDD'
      const itemDate = item.createdAt ? item.createdAt.split('T')[0].replace(/-/g, '') : null
      if (itemDate !== formattedFilterDate) {
        return false
      }
    }

    return true
  })
})

const currentPage = ref(1)
const itemsPerPage = ref(5)

const paginatedData = computed<EPCRecord[]>(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredData.value.slice(start, end)
})

const visibleRows = computed(() => paginatedData.value)

const totalPages = computed(() => Math.ceil(filteredData.value.length / itemsPerPage.value))

// Calculate page numbers to display
const displayPages = computed(() => {
  const total = totalPages.value
  if (total <= 0) return [] // Return empty array if only one page

  const current = currentPage.value
  const range = []

  if (total === 1) {
    return [1]
  }
  // Always show first page
  if (current > 2) {
    range.push(1)
    // Only show ellipsis if there's a gap
    if (current > 3) {
      range.push(-1)
    }
  }

  // Show previous page if not at start
  if (current > 1) {
    range.push(current - 1)
  }

  // Show current page
  range.push(current)

  // Show next page if not at end
  if (current < total) {
    range.push(current + 1)
  }

  // Show last page with ellipsis if needed
  if (current < total - 1) {
    // Only show ellipsis if there's a gap
    if (current < total - 2) {
      range.push(-1)
    }
    range.push(total)
  }

  return range
})

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

watch(
  () => props.filters,
  () => {
    currentPage.value = 1
  },
  { deep: true },
)

// --- Checkbox/Selection Logic ---
const allVisibleItemIds = computed<string[]>(() => {
  return visibleRows.value.map((row: EPCRecord) => row.uniqueId)
})

const toggleSelectAll = () => {
  const visibleIds = allVisibleItemIds.value
  if (selectAll.value) {
    selectedItems.value = selectedItems.value.filter((id) => !visibleIds.includes(id))
    selectAll.value = false
  } else {
    visibleIds.forEach((id) => {
      if (!selectedItems.value.includes(id)) {
        selectedItems.value.push(id)
      }
    })
    selectAll.value = true
  }
}

const toggleItemSelection = (itemId: string) => {
  const index = selectedItems.value.indexOf(itemId)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(itemId)
  }
  updateSelectAllState()
}

const isSelected = (itemId: string) => {
  return selectedItems.value.includes(itemId)
}

const updateSelectAllState = () => {
  const visibleIds = allVisibleItemIds.value
  if (visibleIds.length === 0) {
    selectAll.value = false
    return
  }
  selectAll.value = visibleIds.every((id) => selectedItems.value.includes(id))
}

watch(paginatedData, updateSelectAllState, { deep: true, immediate: true })

// --- Utility Functions ---
const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    const pad = (num: number) => String(num).padStart(2, '0')

    const year = date.getFullYear()
    const month = pad(date.getMonth() + 1)
    const day = pad(date.getDate())
    const hour = pad(date.getHours())
    const minute = pad(date.getMinutes())

    return `${day}/${month}/${year} ${hour}:${minute}`
  } catch {
    return dateString
  }
}

// --- Actions & Exposed Methods ---
const viewEPC = (epc: EPCRecord) => {
  emit('view-epc', epc)
}

// Bulk delete selected EPCs
const bulkDelete = async () => {
  if (!selectedItems.value || selectedItems.value.length === 0) {
    return { success: false, error: 'No items selected', data: { deletedCount: 0 } }
  }

  const confirmResult = await Swal.fire({
    title: 'Confirm Bulk Deletion',
    text: `Are you sure you want to delete ${selectedItems.value.length} selected EPC record(s)? This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, proceed with bulk delete',
  })

  if (!confirmResult.isConfirmed) {
    return { success: false, error: 'Cancelled by user', data: { deletedCount: 0 } }
  }

  try {
    const epcIds = selectedItems.value
      .filter((id) => id.startsWith('E-'))
      .map((id) => parseInt(id.replace('E-', '')))

    const response = await authenticatedFetch(`${API_URL}/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: epcIds }), // Changed from 'epcIds' to 'ids'
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(err || 'Failed to bulk delete EPCs')
    }

    const result = await response.json()

    selectedItems.value = []
    selectAll.value = false
    await fetchEPCs()
    adjustPageAfterDeletion()

    return { success: true, data: result }
  } catch (err) {
    console.error('Error bulk deleting EPCs:', err)
    return { success: false, error: (err as Error).message, data: { deletedCount: 0 } }
  }
}

const adjustPageAfterDeletion = () => {
  const totalItems = filteredData.value.length
  const maxPage = Math.ceil(totalItems / itemsPerPage.value) || 1

  if (currentPage.value > maxPage) {
    currentPage.value = maxPage
  }
}

const refreshData = () => {
  fetchEPCs()
  selectedItems.value = []
  selectAll.value = false
}

defineExpose({ refreshData, selectedItems, bulkDelete })
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

tbody tr {
  cursor: pointer;
}
</style>
