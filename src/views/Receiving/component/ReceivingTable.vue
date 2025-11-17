<template>
  <div class="overflow-hidden">
    <!-- Header with Select Columns Button -->
    <div class="flex justify-between items-center mb-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Showing {{ filteredData.length }} receiving records
      </p>

      <!-- Select Columns Button -->
      <div class="relative z-50">
        <SelectTable
          :apiUrl="API_URL"
          :storageKey="`receiving-columns`"
          :availableColumns="allowedColumns"
          @update:selected="handleColumnsUpdate"
        />
      </div>
    </div>

    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="min-w-full">
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
            <th v-for="col in selectedColumns" :key="col" class="px-6 py-3 text-left">
              <p
                class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400"
              >
                {{ formatColumnName(col) }}
              </p>
            </th>

            <!-- Action Column (Always Visible) -->
            <th class="px-6 py-3 text-left">
              <p
                class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400"
              >
                Action
              </p>
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="row in visibleRows"
            :key="row.uniqueId"
            :class="{
              'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors': true,
              'bg-gray-25 dark:bg-gray-900/30': row.depth > 0,
            }"
          >
            <!-- Checkbox -->
            <td class="px-6 py-4">
              <input
                type="checkbox"
                class="checkbox checkbox-primary checkbox-sm"
                aria-label="select item"
                :checked="isSelected(row.uniqueId)"
                @change="toggleItemSelection(row.uniqueId)"
              />
            </td>

            <!-- Dynamic Data Columns -->
            <td v-for="col in selectedColumns" :key="col" class="px-6 py-4">
              <!-- PO Number with expand/collapse -->
              <div
                v-if="col === 'poNumber'"
                :style="{ 'padding-left': row.depth * 2 + 'rem' }"
              >
                <div class="flex items-center gap-2">
                  <button
                    v-if="row.hasItems"
                    @click="toggleExpand(row.id)"
                    class="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg
                      class="w-4 h-4 transition-transform"
                      :class="{ 'rotate-90': row.isExpanded }"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div v-else class="w-4 h-4"></div>
                  <button
                    @click="viewReceiving(row)"
                    class="text-left font-bold text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {{ getCellValue(row, col) }}
                  </button>
                </div>
              </div>

              <!-- Receiving Code -->
              <span
                v-else-if="col === 'receivingCode'"
                class="text-sm text-gray-900 dark:text-white font-medium"
              >
                {{ getCellValue(row, col) }}
              </span>

              <!-- DO Number with monospace -->
              <span
                v-else-if="col === 'doNumber'"
                class="font-mono text-sm text-gray-900 dark:text-white"
              >
                {{ getCellValue(row, col) }}
              </span>

              <!-- Date fields -->
              <span
                v-else-if="col === 'dateReceived'"
                class="text-sm text-gray-900 dark:text-white"
              >
                {{ formatDate(getCellValue(row, col)) }}
              </span>

              <!-- Receiving Purpose - Format enum values -->
              <span
                v-else-if="col === 'receivingPurpose'"
                class="text-sm text-gray-900 dark:text-white font-medium"
                :title="'DEBUG: ' + getCellValue(row, col)"
              >
                 {{ getCellValue(row, col) }}
              </span>

              <!-- Default display -->
              <span v-else class="text-sm text-gray-900 dark:text-white">
                {{ getCellValue(row, col) }}
              </span>
            </td>

            <!-- Action Buttons (Always Visible) -->
            <td class="px-6 py-4">
              <!-- Show action buttons for: 1) Single receiving (depth 0, isReceiving true) OR 2) Child receiving items (depth > 0) -->
              <!-- Hide for: PO group headers (depth 0, isPOGroup true with hasItems) -->
              <div v-if="(row.depth === 0 && row.isReceiving && !row.hasItems) || row.depth > 0" class="flex items-center gap-2">
                <button
                  @click="editReceiving(row)"
                  class="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  aria-label="Edit"
                  title="Edit"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  @click="deleteReceiving(row)"
                  class="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  aria-label="Delete"
                  title="Delete"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Loading State -->
      <div v-if="loading" class="p-8 text-center text-gray-500 text-sm">
        <div
          class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"
        ></div>
        <p>Loading receiving records...</p>
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
        <p class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No receiving records found
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your filters or create a new receiving record.
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
        <p class="font-medium">Error loading receiving records</p>
        <p class="text-xs mt-1">{{ error }}</p>
      </div>

      <!-- Pagination -->
      <div class="mt-6 flex justify-center">
        <nav class="flex items-center gap-x-2">
          <!-- Previous Button -->
          <button
            type="button"
            class="btn btn-sm btn-outline dark:text-gray-300"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            Previous
          </button>

          <!-- Page Numbers -->
          <div class="flex items-center gap-x-1">
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

          <!-- Next Button -->
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

// Props for receiving filters
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({}),
  },
})

// Emits for parent component
const emit = defineEmits(['edit-receiving', 'delete-receiving', 'view-receiving'])

const data = ref([])
const loading = ref(false)
const error = ref(null)
const expandedRows = ref([])
const selectedItems = ref([])
const selectAll = ref(false)
const selectedColumns = ref([])

// API endpoint for receivings
const API_URL = '/api/receiving'

const allowedColumns = [
  'poNumber',
  'receivingCode',
  'doNumber',
  'productName',
  'expectedQuantity',
  'receivedQuantity',
  'receivingPurpose',
  'receivedBy',
  'dateReceived',
  'remarks',
]

const fieldAliases = {
  poNumber: ['poNumber', 'orderNumber', 'purchaseOrderNumber'],
  receivingCode: ['receivingCode', 'code'],
  doNumber: ['doNumber', 'deliveryOrderNumber'],
  productName: ['productName'],
  expectedQuantity: ['expectedQuantity'],
  receivedQuantity: ['receivedQuantity'],
  receivingPurpose: ['receivingPurpose', 'purpose'],
  receivedBy: ['receivedBy', 'receiver'],
  dateReceived: ['dateReceived', 'receivingDate'],
  remarks: ['remarks', 'note', 'notes'],
}

// Format column name for display
const formatColumnName = (name) => {
  const nameMap = {
    poNumber: 'PO Number',
    receivingCode: 'Receiving Code',
    doNumber: 'DO Number',
    productName: 'Product Name',
    expectedQuantity: 'Expected Quantity',
    receivedQuantity: 'Received Quantity',
    receivingPurpose: 'Receiving Purpose',
    receivedBy: 'Received By',
    dateReceived: 'Date Received',
    remarks: 'Remarks',
  }

  return (
    nameMap[name] ||
    name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  )
}

// Get cell value with fallback for alternate field names
const getCellValue = (row, col) => {
  // Skip alias check for receivingPurpose - needs special formatting
  if (col !== 'receivingPurpose') {
    const aliases = fieldAliases[col]
    if (aliases) {
      for (const alias of aliases) {
        if (row[alias] != null && row[alias] !== '') {
          return row[alias]
        }
      }
    }
  }

  if (col === 'poNumber') {
    return row.isPOGroup ? (row.order?.orderNo || '-') : ''
  } else if (col === 'receivingCode') {
    // For PO groups, show the aggregated text
    if (row.isPOGroup && row.hasItems && !row.isReceiving) {
      return row.receivingCode || '-'
    }
    return row.receivingCode || '-'
  } else if (col === 'doNumber') {
    // PO groups don't have DO number
    if (row.isPOGroup && row.hasItems && !row.isReceiving) {
      return '-'
    }
    return row.doNumber || '-'
  } else if (col === 'productName') {
    if (row.isReceiving) {
      return row.aggregatedProducts?.display || '-'
    } else {
      return row.product?.name || '-'
    }
  } else if (col === 'expectedQuantity') {
    if (row.isReceiving) {
      return row.totalExpectedQuantity || '-'
    } else {
      return row.expectedQuantity || '-'
    }
  } else if (col === 'receivedQuantity') {
    if (row.isReceiving) {
      return row.totalReceivedQuantity || '-'
    } else {
      return row.quantity || '-'
    }
  } else if (col === 'receivingPurpose') {
    // PO groups show aggregated purposes
    if (row.isPOGroup && row.hasItems && !row.isReceiving) {
      return row.aggregatedPurposes?.display || '-'
    }
    if (row.isReceiving) {
      const displayValue = row.aggregatedPurposes?.display || '-'
      console.log('getCellValue - receivingPurpose (isReceiving=true) display:', displayValue)
      return displayValue
    } else {
      const formatted = formatSinglePurpose(row.receivingPurpose || '-')
      console.log('getCellValue - receivingPurpose (isReceiving=false) formatted:', formatted)
      return formatted
    }
  } else if (col === 'receivedBy') {
    // PO groups don't have receivedBy
    if (row.isPOGroup && row.hasItems && !row.isReceiving) {
      return '-'
    }
    return row.isReceiving ? row.receivedBy || '-' : '-'
  } else if (col === 'dateReceived') {
    // For PO groups, don't show date
    if (row.isPOGroup && row.hasItems && !row.isReceiving) {
      return '-'
    }
    return row.isReceiving ? row.receivingDate : '-'
  } else if (col === 'remarks') {
    // PO groups don't have remarks
    if (row.isPOGroup && row.hasItems && !row.isReceiving) {
      return '-'
    }
    return row.isReceiving ? row.remarks || '-' : '-'
  }
  return row[col] != null ? row[col] : '-'
}

// Handle column selection update from SelectTable component
const handleColumnsUpdate = (columns) => {
  console.log('Parent: handleColumnsUpdate called with:', columns)
  selectedColumns.value = columns
  console.log('Selected columns updated:', columns)
}

// Function to fetch receivings from the API
const fetchReceivings = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await authenticatedFetch(API_URL)

    if (!response.ok) throw new Error('Failed to fetch receiving records')

    const json = await response.json()
    data.value = json || []

    if (selectedColumns.value.length === 0) {
      selectedColumns.value = [...allowedColumns]
      console.log('Set default columns (all):', selectedColumns.value)
    }
  } catch (e) {
    error.value = e.message
    console.error('Error fetching receivings:', e)
  } finally {
    loading.value = false
  }
}

// Fetch data on component mount
onMounted(() => {
  fetchReceivings()
})

// ------------------------------------------------
// --- Helper Functions for Aggregation ---
// ------------------------------------------------

// Format a single purpose value
const formatSinglePurpose = (value: string) => {
  const purposeMap: { [key: string]: string } = {
    'RAW_MATERIAL': 'Raw Material',
    'FINISHED_GOODS': 'Finished Goods'
  }

  const formatted = purposeMap[value] || value
  console.log('formatSinglePurpose:', value, '->', formatted)
  return formatted
}

// Function to aggregate products from receiving items
const aggregateProducts = (receiving) => {
  if (!receiving.receivingItems || receiving.receivingItems.length === 0) {
    return { display: '-', full: '' }
  }

  const products = receiving.receivingItems.map((item) => item.product?.name || 'Unknown')
  const uniqueProducts = [...new Set(products)]
  const maxDisplay = 2
  const displayProducts = uniqueProducts.slice(0, maxDisplay)
  const remaining = uniqueProducts.length - maxDisplay

  if (remaining > 0) {
    return {
      display: displayProducts.join(', ') + `, +${remaining} more`,
      full: uniqueProducts.join(', '),
    }
  }

  return {
    display: displayProducts.join(', '),
    full: displayProducts.join(', '),
  }
}

// Function to aggregate sources from receiving items
const aggregateSources = (receiving) => {
  if (!receiving.receivingItems || receiving.receivingItems.length === 0) {
    return { display: '-', full: '' }
  }

  const sources = receiving.receivingItems
    .map((item) => item.source || 'Unknown')
    .filter((s) => s !== 'Unknown')
  const uniqueSources = [...new Set(sources)]
  const maxDisplay = 2
  const displaySources = uniqueSources.slice(0, maxDisplay)
  const remaining = uniqueSources.length - maxDisplay

  if (uniqueSources.length === 0) {
    return { display: '-', full: '' }
  }

  if (remaining > 0) {
    return {
      display: displaySources.join(', ') + `, +${remaining} more`,
      full: uniqueSources.join(', '),
    }
  }

  return {
    display: displaySources.join(', '),
    full: displaySources.join(', '),
  }
}

// Function to aggregate purposes from receiving items or fall back to the receiving's purpose
const aggregatePurposes = (receiving) => {
  // If no items, fall back to parent receiving purpose (or Raw Material)
  if (!receiving.receivingItems || receiving.receivingItems.length === 0) {
    const fallback = receiving.receivingPurpose || ''
    console.log('aggregatePurposes - fallback raw:', fallback)
    const formattedFallback = formatSinglePurpose(fallback)
    console.log('aggregatePurposes - fallback formatted:', formattedFallback)
    return { display: formattedFallback, full: formattedFallback }
  }

  // Prefer item-level purposes when present
  const itemPurposes = receiving.receivingItems.map((item) => item.purpose).filter(Boolean)

  const purposesList = itemPurposes.length > 0 ? itemPurposes : [receiving.receivingPurpose || '']
  const uniquePurposes = [...new Set(purposesList)]
  console.log('aggregatePurposes - uniquePurposes:', uniquePurposes)
  const maxDisplay = 2
  const displayPurposes = uniquePurposes.slice(0, maxDisplay).map(p => formatSinglePurpose(p))
  console.log('aggregatePurposes - displayPurposes formatted:', displayPurposes)
  const remaining = uniquePurposes.length - maxDisplay

  if (remaining > 0) {
    return {
      display: displayPurposes.join(', ') + `, +${remaining} more`,
      full: uniquePurposes.map(p => formatSinglePurpose(p)).join(', '),
    }
  }

  return {
    display: displayPurposes.join(', '),
    full: displayPurposes.join(', '),
  }
}

// Function to calculate total expected quantity
const calculateTotalExpectedQuantity = (receiving) => {
  if (!receiving.receivingItems || receiving.receivingItems.length === 0) {
    return '-'
  }

  const total = receiving.receivingItems.reduce((sum, item) => {
    return sum + (item.expectedQuantity || 0)
  }, 0)

  return total > 0 ? total : '-'
}

// Function to calculate total received quantity
const calculateTotalReceivedQuantity = (receiving) => {
  if (!receiving.receivingItems || receiving.receivingItems.length === 0) {
    return '-'
  }

  const total = receiving.receivingItems.reduce((sum, item) => {
    return sum + (item.quantity || 0)
  }, 0)

  return total > 0 ? total : '-'
}

// ------------------------------------------------
// --- Filtering & Pagination Logic ---
// ------------------------------------------------

// Filtered data based on props.filters
const filteredData = computed(() => {
  if (!props.filters) return data.value

  return data.value.filter((item) => {
    const filters = props.filters

    // Receiving Code filter
    if (
      filters.receivingCode &&
      !item.receivingCode?.toLowerCase().includes(filters.receivingCode.toLowerCase())
    ) {
      return false
    }

    // Product Name filter - check in receiving items
    if (filters.name && item.receivingItems) {
      const hasMatchingProduct = item.receivingItems.some((ri) =>
        ri.product?.name?.toLowerCase().includes(filters.name.toLowerCase()),
      )
      if (!hasMatchingProduct) {
        return false
      }
    }

    // Date filter
    if (filters.date && item.receivingDate) {
      const filterDate = new Date(filters.date).toISOString().split('T')[0]
      const itemDate = new Date(item.receivingDate).toISOString().split('T')[0]
      if (filterDate !== itemDate) {
        return false
      }
    }

    return true
  })
})

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(5)

// Paginated data
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredData.value.slice(start, end)
})

// Generate visible rows - Group by PO, collapse shows different receiving records
const visibleRows = computed(() => {
  const rows = []
  
  // Group receivings by PO number
  const groupedByPO = new Map()
  paginatedData.value.forEach((receiving) => {
    const poKey = receiving.order?.orderNo || 'NO_PO'
    if (!groupedByPO.has(poKey)) {
      groupedByPO.set(poKey, [])
    }
    groupedByPO.get(poKey).push(receiving)
  })

  // Build rows with PO groups and receiving children
  groupedByPO.forEach((receivings, poNumber) => {
    const hasMultiple = receivings.length > 1
    const poId = `PO-${poNumber}`
    const isExpanded = expandedRows.value.includes(poId)

    if (hasMultiple) {
      // Add PO group row (collapsible)
      const allProducts = receivings.flatMap(r => r.receivingItems || []).map(item => item.product?.name || 'Unknown')
      const uniqueProducts = [...new Set(allProducts)]
      const totalExpected = receivings.reduce((sum, r) => sum + (calculateTotalExpectedQuantity(r) === '-' ? 0 : calculateTotalExpectedQuantity(r)), 0)
      const totalReceived = receivings.reduce((sum, r) => sum + (calculateTotalReceivedQuantity(r) === '-' ? 0 : calculateTotalReceivedQuantity(r)), 0)

      rows.push({
        id: poId,
        isPOGroup: true,
        isReceiving: false,
        depth: 0,
        hasItems: true,
        isExpanded: isExpanded,
        uniqueId: poId,
        order: receivings[0].order,
        aggregatedProducts: {
          display: uniqueProducts.length > 2 ? `${uniqueProducts.slice(0, 2).join(', ')}, +${uniqueProducts.length - 2} more` : uniqueProducts.join(', '),
          full: uniqueProducts.join(', ')
        },
        totalExpectedQuantity: totalExpected,
        totalReceivedQuantity: totalReceived,
        receivingCode: `${receivings.length} receiving records`,
      })

      // Add child receiving records if expanded
      if (isExpanded) {
        receivings.forEach((receiving) => {
          rows.push({
            ...receiving,
            isReceiving: true,
            isPOGroup: false,
            depth: 1,
            hasItems: false,
            isExpanded: false,
            uniqueId: `R-${receiving.id}`,
            aggregatedProducts: aggregateProducts(receiving),
            aggregatedSources: aggregateSources(receiving),
            aggregatedPurposes: aggregatePurposes(receiving),
            totalExpectedQuantity: calculateTotalExpectedQuantity(receiving),
            totalReceivedQuantity: calculateTotalReceivedQuantity(receiving),
          })
        })
      }
    } else {
      // Single receiving - show directly without grouping
      const receiving = receivings[0]
      rows.push({
        ...receiving,
        isReceiving: true,
        isPOGroup: true,
        depth: 0,
        hasItems: false,
        isExpanded: false,
        uniqueId: `R-${receiving.id}`,
        aggregatedProducts: aggregateProducts(receiving),
        aggregatedSources: aggregateSources(receiving),
        aggregatedPurposes: aggregatePurposes(receiving),
        totalExpectedQuantity: calculateTotalExpectedQuantity(receiving),
        totalReceivedQuantity: calculateTotalReceivedQuantity(receiving),
      })
    }
  })

  return rows
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / itemsPerPage.value))

// Calculate page numbers to display
const displayPages = computed(() => {
  const total = totalPages.value
  if (total <= 0) return [] // Return empty array if no data

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

// Toggle expand/collapse for PO groups
const toggleExpand = (id) => {
  const index = expandedRows.value.indexOf(id)
  if (index > -1) {
    expandedRows.value.splice(index, 1)
  } else {
    expandedRows.value.push(id)
  }
  setTimeout(updateSelectAllState, 0)
}

// Watch filters to reset page
watch(
  () => props.filters,
  () => {
    currentPage.value = 1
  },
  { deep: true },
)

// ------------------------------------------------
// --- Checkbox/Selection Logic ---
// ------------------------------------------------

// Get all currently visible item IDs
const allVisibleItemIds = computed(() => {
  return visibleRows.value.map((row) => row.uniqueId)
})

// Toggle select all
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

// Toggle individual item selection
const toggleItemSelection = (itemId) => {
  const index = selectedItems.value.indexOf(itemId)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(itemId)
  }
  updateSelectAllState()
}

// Check if item is selected
const isSelected = (itemId) => {
  return selectedItems.value.includes(itemId)
}

// Update select all checkbox state
const updateSelectAllState = () => {
  const visibleIds = allVisibleItemIds.value
  if (visibleIds.length === 0) {
    selectAll.value = false
    return
  }
  selectAll.value = visibleIds.every((id) => selectedItems.value.includes(id))
}

// Watch for changes in paginated data or expanded rows
watch([paginatedData, expandedRows], updateSelectAllState, { deep: true, immediate: true })

// ------------------------------------------------
// --- Utility Functions ---
// ------------------------------------------------

// Format date
const formatDate = (dateString) => {
  if (!dateString || dateString === '-') return '-'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Format purpose value for display
const formatPurposeValue = (value: string) => {
  if (!value || value === '-') return '-'

  // Handle multiple values separated by comma (for aggregated purposes)
  if (value.includes(',')) {
    const parts = value.split(',').map(part => {
      const trimmed = part.trim()
      // Check if it ends with "more" (e.g., "+2 more")
      if (trimmed.startsWith('+') && trimmed.includes('more')) {
        return trimmed
      }
      return formatSinglePurpose(trimmed)
    })
    return parts.join(', ')
  }

  return formatSinglePurpose(value)
}

// ------------------------------------------------
// --- Actions & Exposed Methods ---
// ------------------------------------------------

const editReceiving = (row) => {
  emit('edit-receiving', row)
}

const viewReceiving = (row) => {
  // If this is a PO group with multiple receivings, find all receivings for this PO
  if (row.isPOGroup && row.hasItems && !row.isReceiving) {
    const poNumber = row.order?.orderNo
    const allReceivings = paginatedData.value.filter(r => r.order?.orderNo === poNumber)
    emit('view-receiving', { isPOGroup: true, receivings: allReceivings, order: row.order })
  } else {
    // Single receiving
    emit('view-receiving', row)
  }
}

const deleteReceiving = async (item) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `You are about to delete ${item.isReceiving ? 'receiving record' : 'receiving item'}: ${item.receivingCode}. This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
  })

  if (!result.isConfirmed) {
    return
  }

  try {
    const endpoint = item.isReceiving ? `${API_URL}/${item.id}` : `${API_URL}/items/${item.id}`

    const response = await authenticatedFetch(endpoint, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })

    let body = null
    try {
      body = await response.json()
    } catch (e) {
      // ignore parse errors
    }

    if (!response.ok) {
      const msg =
        body && (body.message || body.error) ? body.message || body.error : 'Failed to delete'
      console.error('Delete failed:', msg, body)
      emit('delete-receiving', { success: false, error: msg, details: body })
      Swal.fire('Error', `Failed to delete: ${msg}`, 'error')
      return
    }

    // Clear selection for deleted item
    selectedItems.value = selectedItems.value.filter((id) => id !== item.uniqueId)

    Swal.fire({
      title: 'Deleted!',
      text: `${item.isReceiving ? 'Receiving record' : 'Item'} has been deleted.`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    })

    emit('delete-receiving', { success: true, data: item })

    // Refresh the table
    await fetchReceivings()

    // Adjust page if current page is now empty
    adjustPageAfterDeletion()
  } catch (error) {
    console.error('Error deleting:', error)
    emit('delete-receiving', { success: false, error: error.message })
    Swal.fire('Error', `Failed to delete: ${error.message}`, 'error')
  }
}

// Bulk delete selected items
const bulkDelete = async () => {
  if (!selectedItems.value || selectedItems.value.length === 0) {
    Swal.fire('No Selection', 'Please select at least one item to delete.', 'info')
    return { success: false, error: 'No items selected' }
  }

  const confirmResult = await Swal.fire({
    title: 'Confirm Bulk Deletion',
    text: `Are you sure you want to delete ${selectedItems.value.length} selected item(s)? This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, proceed with bulk delete',
  })

  if (!confirmResult.isConfirmed) {
    return { success: false, error: 'Cancelled by user' }
  }

  try {
    const receivingIds = selectedItems.value
      .filter((id) => id.startsWith('R-'))
      .map((id) => parseInt(id.replace('R-', '')))

    const itemIds = selectedItems.value
      .filter((id) => id.startsWith('I-'))
      .map((id) => parseInt(id.replace('I-', '')))

    const response = await authenticatedFetch(`${API_URL}/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receivingIds, itemIds }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(err || 'Failed to bulk delete')
    }

    const result = await response.json()

    selectedItems.value = []
    selectAll.value = false
    await fetchReceivings()
    adjustPageAfterDeletion()

    emit('delete-receiving', { success: true, data: result })
    Swal.fire(
      'Success',
      `${result.deletedCount || selectedItems.value.length} items deleted successfully.`,
      'success',
    )
    return { success: true, data: result }
  } catch (error) {
    console.error('Error bulk deleting:', error)
    emit('delete-receiving', { success: false, error: error.message })
    Swal.fire('Error', `Failed to bulk delete: ${error.message}`, 'error')
    return { success: false, error: error.message }
  }
}

// Helper function to adjust page after deletion
const adjustPageAfterDeletion = () => {
  const totalItems = filteredData.value.length
  const maxPage = Math.ceil(totalItems / itemsPerPage.value) || 1

  if (currentPage.value > maxPage) {
    currentPage.value = maxPage
  }
}

// Expose refresh method for parent component
const refreshData = () => {
  fetchReceivings()
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
</style>
