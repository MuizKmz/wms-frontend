<template>
  <div class="overflow-hidden">
    <!-- Header with Select Columns Button -->
    <div class="flex justify-between items-center mb-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Showing {{ filteredData.length }} return records
      </p>

      <!-- Select Columns Button -->
      <div class="relative z-50">
        <SelectTable
          :apiUrl="API_URL"
          :storageKey="`return-columns`"
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
            v-for="row in paginatedData"
            :key="row.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <!-- Checkbox -->
            <td class="px-6 py-4">
              <input
                type="checkbox"
                class="checkbox checkbox-primary checkbox-sm"
                aria-label="select item"
                :checked="isSelected(row.id)"
                @change="toggleItemSelection(row.id)"
              />
            </td>

            <!-- Dynamic Data Columns -->
            <td v-for="col in selectedColumns" :key="col" class="px-6 py-4">
              <!-- Return Number with clickable button -->
              <div v-if="col === 'returnNo'">
                <button
                  @click="viewReturn(row)"
                  class="text-left font-bold text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {{ getCellValue(row, col) }}
                </button>
              </div>

              <!-- Return Type with badge styling -->
              <span
                v-else-if="col === 'returnType'"
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide"
                :class="getReturnTypeClass(row.returnType)"
              >
                {{ getCellValue(row, col) }}
              </span>

              <!-- Date fields -->
              <span
                v-else-if="col === 'returnDate' || col === 'lastUpdated'"
                class="text-sm text-gray-900 dark:text-white"
              >
                {{ formatDate(String(getCellValue(row, col))) }}
              </span>

              <!-- Default display -->
              <span v-else class="text-sm text-gray-900 dark:text-white">
                {{ getCellValue(row, col) }}
              </span>
            </td>

            <!-- Action Buttons (Always Visible) -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <button
                  @click="editReturn(row)"
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
                  @click="deleteReturn(row)"
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
        <p>Loading return records...</p>
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
        <p class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No return records found</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your filters or create a new return record.
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
        <p class="font-medium">Error loading return records</p>
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
import authenticatedFetch from '@/utils/authenticatedFetch'
import SelectTable from '@/components/common/SelectTable.vue'

interface ReturnItem {
  id: number
  returnNo: string
  returnType: string
  referenceNo: string
  returnDate: string
  from: string
  to: string
  skuQuantity: number
  totalQuantity: number
  createdBy: string
  lastUpdated: string
  notes?: string
}

// Props for return filters
const props = defineProps<{
  filters?: Record<string, any>
}>()

// Emits for parent component
const emit = defineEmits<{
  'delete-return': [result: any]
  'edit-return': [returnItem: ReturnItem]
  'view-return': [returnItem: ReturnItem]
}>()

const data = ref<ReturnItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const selectedItems = ref<number[]>([])
const selectAll = ref(false)
const selectedColumns = ref<string[]>([])

const allowedColumns = [
  'returnNo',
  'returnType',
  'referenceNo',
  'returnDate',
  'from',
  'to',
  'skuQuantity',
  'totalQuantity',
  'createdBy',
  'lastUpdated',
]

// Format column name for display
const formatColumnName = (name: string) => {
  const nameMap: Record<string, string> = {
    returnNo: 'Return No',
    returnType: 'Return Type',
    referenceNo: 'Reference No',
    returnDate: 'Return Date',
    from: 'From',
    to: 'To',
    skuQuantity: 'SKU Quantity',
    totalQuantity: 'Total Quantity',
    createdBy: 'Created By',
    lastUpdated: 'Last Updated',
  }

  return (
    nameMap[name] ||
    name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  )
}

// Get cell value
const getCellValue = (row: ReturnItem, col: string) => {
  const value = row[col as keyof ReturnItem]
  return value != null ? value : '-'
}

// Handle columns update from SelectTable component
const handleColumnsUpdate = (columns: string[]) => {
  selectedColumns.value = columns
}

// Map return types to badge color classes
const getReturnTypeClass = (type: string) => {
  const map: Record<string, string> = {
    'Customer': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
    'Supplier': 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
    'Internal': 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
    'Failed Delivery': 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
  }
  return map[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
}

// API endpoint for returns
const API_URL = '/api/return'

// Function to fetch returns from the API
const fetchReturns = async () => {
  loading.value = true
  error.value = null
  try {
    // TODO: Replace with actual API call
    // const response = await authenticatedFetch(API_URL)
    // if (!response.ok) throw new Error('Failed to fetch return records')
    // const json = await response.json()
    // data.value = json || []

    // Mock data for now
    await new Promise(resolve => setTimeout(resolve, 500))
    data.value = [
      {
        id: 1,
        returnNo: 'RET-2024-001',
        returnType: 'Customer',
        referenceNo: 'ORD-2024-123',
        returnDate: '2024-11-15',
        from: 'Customer - ABC Corp',
        to: 'Warehouse A',
        skuQuantity: 3,
        totalQuantity: 15,
        createdBy: 'John Doe',
        lastUpdated: '2024-11-15T10:30:00',
        notes: 'Defective items'
      },
      {
        id: 2,
        returnNo: 'RET-2024-002',
        returnType: 'Supplier',
        referenceNo: 'PO-2024-456',
        returnDate: '2024-11-14',
        from: 'Warehouse B',
        to: 'Supplier - XYZ Ltd',
        skuQuantity: 2,
        totalQuantity: 8,
        createdBy: 'Jane Smith',
        lastUpdated: '2024-11-14T14:20:00',
        notes: 'Wrong items received'
      },
    ]
  } catch (e: any) {
    error.value = e.message
    console.error('Error fetching returns:', e)
  } finally {
    loading.value = false
  }
}

// Fetch data on component mount
onMounted(() => {
  fetchReturns()
})

// ------------------------------------------------
// --- Filtering & Pagination Logic ---
// ------------------------------------------------

// Filtered data based on props.filters
const filteredData = computed(() => {
  if (!props.filters) return data.value

  return data.value.filter((item) => {
    if (
      props.filters?.returnNo &&
      !item.returnNo.toLowerCase().includes(props.filters.returnNo.toLowerCase())
    )
      return false
    if (
      props.filters?.referenceNo &&
      !item.referenceNo.toLowerCase().includes(props.filters.referenceNo.toLowerCase())
    )
      return false
    if (props.filters?.returnType && item.returnType !== props.filters.returnType) return false
    if (props.filters?.from && !item.from.toLowerCase().includes(props.filters.from.toLowerCase()))
      return false
    if (props.filters?.to && !item.to.toLowerCase().includes(props.filters.to.toLowerCase()))
      return false
    if (props.filters?.dateRange) {
      const [startDate, endDate] = props.filters.dateRange.split(' to ')
      const itemDate = new Date(item.returnDate)
      if (startDate && new Date(startDate) > itemDate) return false
      if (endDate && new Date(endDate) < itemDate) return false
    }
    return true
  })
})

const currentPage = ref(1)
const itemsPerPage = ref(5)

// Paginated data
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredData.value.slice(start, end)
})

// Calculate total number of pages
const totalPages = computed(() => Math.ceil(filteredData.value.length / itemsPerPage.value))

// Calculate page numbers to display
const displayPages = computed(() => {
  const total = totalPages.value
  if (total <= 0) return []

  const current = currentPage.value
  const range: number[] = []

  if (total === 1) {
    return [1]
  }

  // Always show first page
  if (current > 2) {
    range.push(1)
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
    if (current < total - 2) {
      range.push(-1)
    }
    range.push(total)
  }

  return range
})

// Handle page change with validation
const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Watch filters to reset page
watch(
  () => props.filters,
  () => {
    currentPage.value = 1
  },
  { deep: true }
)

// ------------------------------------------------
// --- Checkbox/Selection Logic ---
// ------------------------------------------------

// Get all currently visible item IDs
const allVisibleItemIds = computed(() => {
  return paginatedData.value.map((row) => row.id)
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
const toggleItemSelection = (itemId: number) => {
  const index = selectedItems.value.indexOf(itemId)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(itemId)
  }
  updateSelectAllState()
}

// Check if item is selected
const isSelected = (itemId: number) => {
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

// Watch for changes in paginated data
watch([paginatedData], updateSelectAllState, { deep: true, immediate: true })

// ------------------------------------------------
// --- Utility Functions ---
// ------------------------------------------------

// Format date
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// ------------------------------------------------
// --- Actions & Exposed Methods ---
// ------------------------------------------------

const editReturn = (row: ReturnItem) => {
  emit('edit-return', row)
}

const deleteReturn = async (item: ReturnItem) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `You are about to delete return: ${item.returnNo}. This action cannot be undone.`,
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
    // TODO: Replace with actual API call
    // const endpoint = `${API_URL}/${item.id}`
    // const response = await authenticatedFetch(endpoint, {
    //   method: 'DELETE',
    //   headers: { 'Content-Type': 'application/json' },
    // })
    // if (!response.ok) throw new Error('Failed to delete')

    // Mock deletion
    data.value = data.value.filter((r) => r.id !== item.id)
    selectedItems.value = selectedItems.value.filter((id) => id !== item.id)

    Swal.fire({
      title: 'Deleted!',
      text: 'Return has been deleted.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    })

    emit('delete-return', { success: true, data: item })

    // Adjust page if current page is now empty
    adjustPageAfterDeletion()
  } catch (error: any) {
    console.error('Error deleting:', error)
    emit('delete-return', { success: false, error: error.message })
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
    // TODO: Replace with actual API call
    // const response = await authenticatedFetch(`${API_URL}/bulk-delete`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ returnIds: selectedItems.value }),
    // })
    // if (!response.ok) throw new Error('Failed to bulk delete')

    // Mock bulk deletion
    data.value = data.value.filter((r) => !selectedItems.value.includes(r.id))
    const deletedCount = selectedItems.value.length

    selectedItems.value = []
    selectAll.value = false
    adjustPageAfterDeletion()

    emit('delete-return', { success: true, deletedCount })
    Swal.fire('Success', `${deletedCount} items deleted successfully.`, 'success')
    return { success: true, deletedCount }
  } catch (error: any) {
    console.error('Error bulk deleting:', error)
    emit('delete-return', { success: false, error: error.message })
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

// Open return modal and emit event
const viewReturn = (row: ReturnItem) => {
  emit('view-return', row)
}

// Expose refresh method for parent component
const refreshData = () => {
  fetchReturns()
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
