<template>
  <div class="overflow-hidden">
    <!-- Header with Select Columns Button -->
    <div class="flex justify-between items-center mb-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Showing {{ filteredData.length }} inventory items
      </p>

      <!-- Select Columns Button -->
      <div class="relative z-50">
        <SelectTable
          :apiUrl="API_URL"
          :storageKey="`inventory-columns`"
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
            v-for="item in paginatedData"
            :key="item.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <!-- Checkbox -->
            <td class="px-6 py-4" @click.stop>
              <input
                type="checkbox"
                class="checkbox checkbox-primary checkbox-sm"
                aria-label="select item"
                :checked="isSelected(item.id)"
                @change="toggleItemSelection(item.id)"
              />
            </td>

            <!-- Dynamic Data Columns -->
            <td v-for="col in selectedColumns" :key="col" class="px-6 py-4">
              <!-- Product Name with clickable button -->
              <span v-if="col === 'productName'">
                <button
                  type="button"
                  class="text-left font-bold text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
                  @click="viewInventory(item)"
                  :title="`View details for ${getCellValue(item, col)}`"
                >
                  {{ getCellValue(item, col) }}
                </button>
              </span>

              <!-- Code fields with monospace -->
              <span
                v-else-if="
                  [
                    'productCode',
                    'skuCode',
                    'corpCode',
                    'supplierCode',
                    'warehouseCode',
                    'rackCode',
                    'sectionCode',
                  ].includes(col)
                "
                class="font-mono text-sm text-gray-900 dark:text-white"
              >
                {{ getCellValue(item, col) }}
              </span>

              <!-- Quantity columns with centered text -->
              <span
                v-else-if="['received', 'delivered', 'inStock', 'return'].includes(col)"
                class="text-sm text-gray-900 dark:text-white text-center block"
              >
                {{ getCellValue(item, col) }}
              </span>

              <!-- Latest Update with date formatting -->
              <span
                v-else-if="col === 'latestUpdate'"
                class="text-sm text-gray-900 dark:text-white"
              >
                {{ formatDate(getCellValue(item, col)) }}
              </span>

              <!-- Default display -->
              <span v-else class="text-sm text-gray-900 dark:text-white">
                {{ getCellValue(item, col) }}
              </span>
            </td>

            <!-- Action Buttons (Always Visible) -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <button
                  @click="viewInventory(item)"
                  class="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  aria-label="View"
                  title="View Details"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
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
        <p>Loading inventory...</p>
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
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <p class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No inventory items found
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your filters or add new inventory items.
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
        <p class="font-medium">Error loading inventory</p>
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
import { authenticatedFetch } from '@/utils/authenticatedFetch'
import SelectTable from '@/components/common/SelectTable.vue'
import Swal from 'sweetalert2'

// Props for receiving filters
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({}),
  },
})

// Emits for parent component
const emit = defineEmits(['view-inventory'])

// State for data and UI
const data = ref([])
const loading = ref(false)
const error = ref(null)
const selectedItems = ref([])
const selectAll = ref(false)
const selectedColumns = ref([])

// API endpoint for inventory
const API_URL = '/api/inventory'

const allowedColumns = [
  'productName',
  'productCode',
  'skuCode',
  'corpCode',
  'received',
  'delivered',
  'inStock',
  'return',
  'latestUpdate',
  'supplierCode',
  'warehouseCode',
  'rackCode',
  'sectionCode',
]

const fieldAliases = {
  productName: ['productName', 'name'],
  productCode: ['productCode'],
  skuCode: ['skuCode'],
  corpCode: ['corpCode'],
  received: ['received', 'receivedQuantity'],
  delivered: ['delivered', 'deliveredQuantity'],
  inStock: ['inStock', 'quantity'],
  return: ['return', 'returnedQuantity'],
  latestUpdate: ['latestUpdate', 'lastUpdatedAt', 'updatedAt'],
  supplierCode: ['supplierCode'],
  warehouseCode: ['warehouseCode'],
  rackCode: ['rackCode'],
  sectionCode: ['sectionCode'],
}

// Format column name for display
const formatColumnName = (name) => {
  const nameMap = {
    productName: 'Product Name',
    productCode: 'Product Code',
    skuCode: 'SKU Code',
    corpCode: 'Corp Code',
    received: 'Received',
    delivered: 'Delivered',
    inStock: 'In Stock',
    return: 'Return',
    latestUpdate: 'Latest Update',
    supplierCode: 'Supplier Code',
    warehouseCode: 'Warehouse Code',
    rackCode: 'Rack Code',
    sectionCode: 'Section Code',
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
const getCellValue = (item, col) => {
  const aliases = fieldAliases[col]
  if (aliases) {
    for (const alias of aliases) {
      if (item[alias] != null && item[alias] !== '') {
        return item[alias]
      }
    }
  }

  // Handle nested object properties
  if (col === 'productName') {
    return item.product?.name || '-'
  } else if (col === 'productCode') {
    return item.product?.productCode || '-'
  } else if (col === 'skuCode') {
    return item.product?.skuCode || '-'
  } else if (col === 'corpCode') {
    return item.product?.corpCode?.code || '-'
  } else if (col === 'supplierCode') {
    return item.product?.supplier?.supplierCode || '-'
  } else if (col === 'warehouseCode') {
    return item.warehouse?.warehouseCode || '-'
  } else if (col === 'rackCode') {
    return item.rack?.rackCode || '-'
  } else if (col === 'sectionCode') {
    return item.section?.sectionCode || '-'
  } else if (col === 'latestUpdate') {
    return formatDate(item.lastUpdatedAt || item.createdAt)
  }

  return item[col] != null ? item[col] : '-'
}

// Handle column selection update from SelectTable component
const handleColumnsUpdate = (columns) => {
  selectedColumns.value = columns
}

// Function to fetch inventory from the API
const fetchInventory = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await authenticatedFetch(API_URL)

    if (!response.ok) throw new Error('Failed to fetch inventory')

    const json = await response.json()
    data.value = json || []

    if (selectedColumns.value.length === 0) {
      selectedColumns.value = [...allowedColumns]
      console.log('Set default columns (all):', selectedColumns.value)
    }
  } catch (e) {
    error.value = e.message
    console.error('Error fetching inventory:', e)
  } finally {
    loading.value = false
  }
}

// Fetch data on component mount
onMounted(() => {
  fetchInventory()
})

// --- Checkbox/Selection Logic ---

// Computed list of IDs for currently visible (paginated) data
const visibleItemIds = computed(() => {
  return paginatedData.value.map((item) => item.id)
})

// Update select all checkbox state
const updateSelectAllState = () => {
  const visibleIds = visibleItemIds.value
  if (visibleIds.length === 0) {
    selectAll.value = false
    return
  }
  selectAll.value = visibleIds.every((id) => selectedItems.value.includes(id))
}

// Check if item is selected
const isSelected = (itemId) => {
  return selectedItems.value.includes(itemId)
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

// Toggle select all
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = selectedItems.value.filter((id) => !visibleItemIds.value.includes(id))
    selectAll.value = false
  } else {
    const visibleIds = visibleItemIds.value
    visibleIds.forEach((id) => {
      if (!selectedItems.value.includes(id)) {
        selectedItems.value.push(id)
      }
    })
    selectAll.value = true
  }
}

// --- Data and Filtering ---

// Computed property for filtered data
const filteredData = computed(() => {
  if (!props.filters) return data.value

  return data.value.filter((item) => {
    const filters = props.filters

    if (
      filters.productName &&
      !item.product?.name.toLowerCase().includes(filters.productName.toLowerCase())
    ) {
      return false
    }
    if (
      filters.skuCode &&
      !item.product?.skuCode.toLowerCase().includes(filters.skuCode.toLowerCase())
    ) {
      return false
    }
    if (
      filters.productCode &&
      !item.product?.productCode.toLowerCase().includes(filters.productCode.toLowerCase())
    ) {
      return false
    }
    if (
      filters.supplierCode &&
      !item.product?.supplier?.supplierCode
        ?.toLowerCase()
        .includes(filters.supplierCode.toLowerCase())
    ) {
      return false
    }

    if (filters.date && item.lastUpdatedAt) {
      const itemDate = new Date(item.lastUpdatedAt).toISOString().split('T')[0]
      if (itemDate !== filters.date) {
        return false
      }
    }

    return true
  })
})

// --- Pagination ---
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

// --- Utility Functions ---

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Calculate received quantity from EPCs with RECEIVED status
const calculateReceived = (item) => {
  if (!item.product?.epcs) return 0
  return item.product.epcs.filter((epc) => epc.status === 'RECEIVED').length
}

// Calculate delivered quantity from EPCs with DELIVERED status
const calculateDelivered = (item) => {
  if (!item.product?.epcs) return 0
  return item.product.epcs.filter((epc) => epc.status === 'DELIVERED').length
}

// Calculate in stock quantity from EPCs with INBOUND status
const calculateInStock = (item) => {
  if (!item.product?.epcs) return 0
  return item.product.epcs.filter((epc) => epc.status === 'INBOUND').length
}

// Calculate return quantity from EPCs with RETURNED status
const calculateReturn = (item) => {
  if (!item.product?.epcs) return 0
  return item.product.epcs.filter((epc) => epc.status === 'RETURNED').length
}

// --- Actions ---

const viewInventory = (item) => {
  emit('view-inventory', item)
}

// Watch for filter changes and pagination changes to update 'select all' state
watch(
  [() => props.filters, currentPage],
  () => {
    setTimeout(updateSelectAllState, 0)
  },
  { deep: true },
)

const refreshData = () => {
  fetchInventory()
  selectedItems.value = []
  selectAll.value = false
}

defineExpose({ refreshData, selectedItems })

watch(
  () => props.filters,
  (newFilters) => {
    console.log('Filters updated:', newFilters)
    currentPage.value = 1
  },
  { deep: true },
)
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
