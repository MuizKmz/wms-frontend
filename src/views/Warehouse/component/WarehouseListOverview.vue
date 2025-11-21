<template>
  <div class="overflow-hidden">
    <!-- Header with button and count -->
    <div class="flex justify-between items-center mb-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Showing {{ filteredData.length }} warehouse items
      </p>

      <!-- Select Columns Button -->
      <div class="relative z-50">
        <SelectTable
          :apiUrl="API_URL"
          :storageKey="`warehouse-columns`"
          :excludeColumns="excludedColumns"
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
            <td class="px-6 py-4">
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
              <!-- Status Column with Badge -->
              <span
                v-if="col === 'status'"
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  item.status === 'Active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : item.status === 'Inactive'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : item.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
                ]"
              >
                {{ String(item[col] ?? '').toUpperCase() }}
              </span>

              <!-- Warehouse Code with Monospace Font -->
              <span
                v-else-if="col === 'warehouseCode'"
                class="font-mono text-sm text-gray-900 dark:text-white"
              >
                {{ item[col] }}
              </span>

              <!-- Regular Columns -->
              <p v-else class="text-sm text-gray-900 dark:text-white">
                {{ getCellValue(item, col) }}
              </p>
            </td>

            <!-- Action Buttons -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <button
                  @click="editItem(item)"
                  class="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  aria-label="Edit"
                  title="Edit Warehouse"
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
                  @click="deleteItem(item)"
                  class="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  aria-label="Delete"
                  title="Delete Warehouse"
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
        <p>Loading warehouses...</p>
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
        <p class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No warehouses found</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your filters or create a new warehouse.
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
        <p class="font-medium">Error loading warehouses</p>
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
const emit = defineEmits(['edit-item', 'delete-item'])

// State for data and UI
const data = ref([])
const loading = ref(false)
const error = ref(null)
const selectedItems = ref([])
const selectAll = ref(false)
const selectedColumns = ref([])

// API endpoint for Warehouses
const API_URL = '/api/warehouse'

// Columns to exclude
const excludedColumns = ['id', 'createdAt', 'updatedAt', 'racks', 'sections', 'receivings']

// Format column name for display (camelCase -> Title Case)
const formatColumnName = (name) => {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

// Get cell value with fallback for alternate field names
const getCellValue = (item, col) => {
  // Handle alternate field names based on your backend
  if (col === 'address') return item.address || item.location || '-'
  if (col === 'managerName') return item.managerName || item.manager || '-'
  if (col === 'contactPhone') return item.contactPhone || item.contact || '-'
  if (col === 'email') return item.email || item.managerEmail || '-'
  if (col === 'remark') return item.remark || item.remarks || '-'

  return item[col] ?? '-'
}

// Handle column selection update from SelectTable component
const handleColumnsUpdate = (columns) => {
  selectedColumns.value = columns
  console.log('Selected columns updated:', columns)
}

// Function to fetch warehouses from the API
const fetchItems = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await authenticatedFetch(API_URL)

    if (!response.ok) throw new Error('Failed to fetch warehouses')

    const json = await response.json()
    data.value = json || []

    // Auto-initialize columns from API data if not already set
    if (selectedColumns.value.length === 0 && json && json.length > 0) {
      const allColumns = Object.keys(json[0]).filter(
        (col) => !excludedColumns.map((c) => c.toLowerCase()).includes(col.toLowerCase()),
      )
      selectedColumns.value = allColumns
      console.log('Auto-loaded columns from API:', allColumns)
    }
  } catch (e) {
    error.value = e.message
    console.error('Error fetching warehouses:', e)
  } finally {
    loading.value = false
  }
}

// Fetch data on component mount
onMounted(() => {
  fetchItems()
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
  // Check if every visible item ID is present in selectedItems
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
    selectedItems.value.splice(index, 1) // Deselect
  } else {
    selectedItems.value.push(itemId) // Select
  }
  updateSelectAllState()
}

// Toggle select all
const toggleSelectAll = () => {
  if (selectAll.value) {
    // Deselect all visible items
    selectedItems.value = selectedItems.value.filter((id) => !visibleItemIds.value.includes(id))
    selectAll.value = false
  } else {
    // Select all visible items
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

    // Warehouse Code filter
    if (
      filters.warehouseCode &&
      !item.warehouseCode?.toLowerCase().includes(filters.warehouseCode.toLowerCase())
    ) {
      return false
    }
    // Warehouse Name filter
    if (filters.name && !item.name?.toLowerCase().includes(filters.name.toLowerCase())) {
      return false
    }
    // Manager Name filter
    const managerName = item.managerName || item.manager || ''
    if (
      filters.managerName &&
      !managerName.toLowerCase().includes(filters.managerName.toLowerCase())
    ) {
      return false
    }
    // Email filter
    const email = item.email || item.managerEmail || ''
    if (filters.email && !email.toLowerCase().includes(filters.email.toLowerCase())) {
      return false
    }
    // Status filter
    if (filters.status && item.status !== filters.status) {
      return false
    }
    // Address filter
    const itemAddress = item.address || item.location || ''
    if (filters.address && !itemAddress.toLowerCase().includes(filters.address.toLowerCase())) {
      return false
    }

    return true
  })
})

// --- Pagination ---
const currentPage = ref(1)
const itemsPerPage = ref(5)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredData.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / itemsPerPage.value))

// Calculate page numbers to display
const displayPages = computed(() => {
  const total = totalPages.value
  if (total <= 0) return []

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

// Watch for filter changes and pagination changes to update 'select all' state
watch(
  [() => props.filters, currentPage],
  () => {
    // Use a timeout to ensure paginatedData is updated before running logic
    setTimeout(updateSelectAllState, 0)
  },
  { deep: true },
)

// --- Actions ---

const editItem = (item) => {
  emit('edit-item', item)
}

const deleteItem = async (item) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `You are about to delete warehouse: ${item.name}. This action cannot be undone.`,
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
    const itemId = item.id || item.warehouseCode
    if (!itemId) {
      throw new Error('Warehouse identifier not found.')
    }

    const response = await authenticatedFetch(`${API_URL}/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to delete warehouse')
    }

    Swal.fire({
      title: 'Deleted!',
      text: `Warehouse ${item.name} has been deleted.`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    })

    emit('delete-item', { success: true, data: { itemName: item.name, id: item.id } })

    const index = selectedItems.value.indexOf(item.id)
    if (index > -1) {
      selectedItems.value.splice(index, 1)
    }

    await fetchItems()
  } catch (error) {
    console.error('Error deleting warehouse:', error)
    emit('delete-item', { success: false, error: error.message })
    Swal.fire(
      'Error',
      `Failed to delete warehouse: This warehouse has racks or sections or products`,
      'error',
    )
  }
}

// Bulk delete selected items
const bulkDelete = async () => {
  if (!selectedItems.value || selectedItems.value.length === 0) {
    Swal.fire('No Selection', 'Please select at least one warehouse to delete.', 'info')
    return { success: false, error: 'No items selected' }
  }

  const confirmResult = await Swal.fire({
    title: 'Confirm Bulk Deletion',
    text: `Are you sure you want to delete ${selectedItems.value.length} selected warehouse(s)? This cannot be undone.`,
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
    const response = await authenticatedFetch(`${API_URL}/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedItems.value }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(err || 'Failed to bulk delete warehouses')
    }

    const result = await response.json()

    const deletedCount = Array.isArray(result.deletedIds) ? result.deletedIds.length : 0
    const blocked = result.blocked || []

    selectedItems.value = []
    selectAll.value = false
    await fetchItems()

    if (deletedCount > 0 && blocked.length === 0) {
      emit('delete-item', { success: true, data: { count: deletedCount, itemName: 'Warehouse' } })
      Swal.fire('Success', `${deletedCount} warehouses deleted successfully.`, 'success')
      return { success: true, data: result }
    } else if (deletedCount > 0 && blocked.length > 0) {
      const message = `${deletedCount} deleted, ${blocked.length} blocked due to existing relations`
      emit('delete-item', { success: false, error: message, data: { deletedCount, blocked } })
      Swal.fire('Partial Success', message, 'warning')
      return { success: false, error: message, data: result }
    } else {
      const message =
        blocked.length > 0
          ? `${blocked.length} warehouses were blocked from deletion due to existing relations.`
          : 'No warehouses were deleted.'
      emit('delete-item', { success: false, error: message, data: result })
      Swal.fire('Deletion Failed', message, 'error')
      return { success: false, error: message }
    }
  } catch (error) {
    console.error('Error bulk deleting warehouses:', error)
    emit('delete-item', { success: false, error: error.message })
    Swal.fire('Error', `Failed to bulk delete warehouses: ${error.message}`, 'error')
    return { success: false, error: error.message }
  }
}

// Expose methods/state for parent component
const refreshData = () => {
  fetchItems()
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
