<template>
  <div class="overflow-hidden">
    <!-- Header with Select Columns Button -->
    <div class="flex justify-between items-center mb-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Showing {{ filteredData.length }} shipment items
      </p>

      <!-- Select Columns Button -->
      <div class="relative z-50">
        <SelectTable
          :apiUrl="API_URL"
          :storageKey="`shipment-columns`"
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
              <!-- Tracking Code with bold and clickable -->
              <button
                v-if="col === 'trackingCode'"
                @click="viewShipment(item)"
                class="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer text-left"
              >
                {{ getCellValue(item, col) }}
              </button>

              <!-- Order Number with monospace and formatted for multiple orders -->
              <span
                v-else-if="col === 'orderNumber'"
                class="font-mono text-sm text-gray-900 dark:text-white"
              >
                {{ formatOrderNumbers(getCellValue(item, col)) }}
              </span>

              <!-- Status with badge styling (if applicable) -->
              <span v-else-if="col === 'status'" :class="['px-3 py-1 text-xs rounded-full font-medium', shipmentStatusClass(item.state)]">
                {{ formatShipmentStatus(item.state) }}
              </span>

              <!-- Date fields -->
              <span
                v-else-if="['shippingDate', 'estimatedDeliveryDate'].includes(col)"
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
                <!-- <button
                  @click="generateEPC(item)"
                  class="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Generate EPC"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </button> -->
                <button
                  @click="editShipment(item)"
                  class="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  aria-label="Edit"
                  title="Edit Shipment"
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
                  @click="deleteShipment(item)"
                  class="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  aria-label="Delete"
                  title="Delete Shipment"
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

      <!-- Loading -->
      <div v-if="loading" class="p-8 text-center text-gray-500 text-sm">
        <div
          class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"
        ></div>
        <p>Loading shipments...</p>
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
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No shipments found</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your filters or add a new shipment.
        </p>
      </div>

      <!-- Error -->
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
        <p class="font-medium">Error loading shipments</p>
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
const emit = defineEmits(['generate-epc', 'edit-shipment', 'delete-shipment', 'view-shipment'])

const data = ref([])
const loading = ref(false)
const error = ref(null)
const selectedItems = ref([])
const selectAll = ref(false)
const selectedColumns = ref([])

// API endpoint for shipments
const API_URL = '/api/shipping'

const allowedColumns = [
  'trackingCode',
  'orderNumber',
  // 'doNumber',
  'shippingCarrier',
  'destination',
  'status',
  'shippingDate',
  'estimatedDeliveryDate',
  'remarks',
]

const fieldAliases = {
  trackingCode: ['trackingCode', 'tracking'],
  orderNumber: ['orderNumber', 'order', 'orderNo'],
  doNumber: ['doNumber', 'do'],
  shippingCarrier: ['shippingCarrier', 'carrier'],
  destination: ['destination', 'dest'],
  status: ['status', 'state'],
  shippingDate: ['shippingDate', 'shipDate'],
  estimatedDeliveryDate: ['estimatedDeliveryDate', 'estimatedDelivery', 'deliveryDate'],
  remark: ['remark', 'remarks', 'note'],
  // support plural key used in allowedColumns
  remarks: ['remarks', 'remark', 'note'],
}

// Format column name for display
const formatColumnName = (name) => {
  const nameMap = {
    trackingCode: 'Tracking Code',
    orderNumber: 'Sales Order Number',
    doNumber: 'DO Number',
    shippingCarrier: 'Shipping Carrier',
    destination: 'Destination',
    status: 'Status',
    shippingDate: 'Shipping Date',
    estimatedDeliveryDate: 'Estimated Delivery Date',
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
const getCellValue = (item, col) => {
  const aliases = fieldAliases[col]
  if (aliases) {
    for (const alias of aliases) {
      if (item[alias] != null && item[alias] !== '') {
        return item[alias]
      }
    }
  }

  return item[col] != null ? item[col] : '-'
}

// Format order numbers - show first order and "..." if multiple
const formatOrderNumbers = (orderValue) => {
  if (!orderValue) return '-'

  // If it's already a string, check if it contains commas (multiple orders)
  if (typeof orderValue === 'string') {
    const orders = orderValue.split(',').map(o => o.trim()).filter(Boolean)
    if (orders.length === 0) return '-'
    if (orders.length === 1) return orders[0]
    return `${orders[0]}, ...`
  }

  // If it's an array
  if (Array.isArray(orderValue)) {
    if (orderValue.length === 0) return '-'
    if (orderValue.length === 1) return orderValue[0]
    return `${orderValue[0]}, ...`
  }

  return orderValue
}

// Format shipment status for display (UI only). Returns uppercase labels to match `OrderTable`.
const formatShipmentStatus = (status: string | undefined): string => {
  const s = (status || '').toString().toUpperCase()
  return s || '-'
}

// Map shipment status to badge classes (match `OrderTable.vue` mapping for consistent UI)
const shipmentStatusClass = (status: string | undefined): string => {
  if (!status) return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  const s = status.toString().toUpperCase()
  const map: Record<string, string> = {
    PENDING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
    PROCESSING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    SHIPPED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
    RECEIVED: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200',
    DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
    CLOSED: 'bg-green-200 text-green-900 dark:bg-green-900/60 dark:text-green-100',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  }
  return map[s] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
}

// View shipment details
const viewShipment = (shipment) => {
  emit('view-shipment', shipment)
}

// Handle columns update from SelectTable component
const handleColumnsUpdate = (columns) => {
  selectedColumns.value = columns
}

// Function to fetch shipments from the API
const fetchShipments = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await authenticatedFetch(API_URL)

    if (!response.ok) throw new Error('Failed to fetch shipments')

    const json = await response.json()
    // Normalize server shipment objects to the shape used by the table
    const mapped = (json || []).map((p) => {
      const normalizedRemark = p.remarks || p.remark || p.note || '-'

      return {
        id: p.id,
        trackingCode: p.code || p.trackingCode || '',
        order: p.order ? p.order.name || p.order.orderNo : p.order || '',
        doNumber: p.doNumber || p.do || '-',
        carrier: p.carrier || p.carrier || '',
        destination: p.destination || p.destination || '',
        state: p.state || p.state || '',
        shippingDate: p.shippingDate || p.shippingDate || '',
        estimatedDeliveryDate: p.estimatedDeliveryDate || p.estimatedDeliveryDate || '',
        // expose both singular and plural keys so aliases/resolution always find the value
        remark: normalizedRemark,
        remarks: normalizedRemark,
        raw: p,
      }
    })

    data.value = mapped

    // Ensure default columns are set if user hasn't selected any
    if (selectedColumns.value.length === 0) {
      selectedColumns.value = [...allowedColumns]
    }
  } catch (e) {
    error.value = e.message
    console.error('Error fetching shipments:', e)
  } finally {
    loading.value = false
  }
}

// Fetch data on component mount
onMounted(() => {
  fetchShipments()
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

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// --- Actions ---

// Edit shipment
const editShipment = (shipment) => {
  emit('edit-shipment', shipment)
}

// Delete shipment with SweetAlert2
const deleteShipment = async (shipment) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `You are about to delete shipment: ${shipment.trackingCode}. This action cannot be undone.`,
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
    const shipmentId = shipment.id
    if (!shipmentId) {
      throw new Error('Shipment identifier not found.')
    }

    const response = await authenticatedFetch(`${API_URL}/${shipmentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to delete shipment')
    }

    Swal.fire({
      title: 'Deleted!',
      text: `Shipment ${shipment.trackingCode} has been deleted.`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    })

    emit('delete-shipment', {
      success: true,
      data: { trackingCode: shipment.trackingCode, id: shipment.id },
    })

    const index = selectedItems.value.indexOf(shipment.id)
    if (index > -1) {
      selectedItems.value.splice(index, 1)
    }

    await fetchShipments()

    adjustPageAfterDeletion()
  } catch (error) {
    console.error('Error deleting shipment:', error)
    emit('delete-shipment', { success: false, error: error.message })
    Swal.fire('Error', `Failed to delete shipment: ${error.message}`, 'error')
  }
}

// Bulk delete selected shipments
const bulkDelete = async () => {
  if (!selectedItems.value || selectedItems.value.length === 0) {
    Swal.fire('No Selection', 'Please select at least one shipment to delete.', 'info')
    return { success: false, error: 'No shipments selected' }
  }

  const confirmResult = await Swal.fire({
    title: 'Confirm Bulk Deletion',
    text: `Are you sure you want to delete ${selectedItems.value.length} selected shipment(s)? This cannot be undone.`,
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
      throw new Error(err || 'Failed to bulk delete shipments')
    }

    const result = await response.json()

    const deletedCount = Array.isArray(result.deletedIds) ? result.deletedIds.length : 0
    const blocked = result.blocked || []

    selectedItems.value = []
    selectAll.value = false
    await fetchShipments()

    adjustPageAfterDeletion()

    if (deletedCount > 0 && blocked.length === 0) {
      emit('delete-shipment', { success: true, data: { count: deletedCount } })
      Swal.fire('Success', `${deletedCount} shipments deleted successfully.`, 'success')
      return { success: true, data: result }
    } else if (deletedCount > 0 && blocked.length > 0) {
      const message = `${deletedCount} deleted, ${blocked.length} blocked due to existing relations`
      emit('delete-shipment', { success: false, error: message, data: { deletedCount, blocked } })
      Swal.fire('Partial Success', message, 'warning')
      return { success: false, error: message, data: result }
    } else {
      const message =
        blocked.length > 0
          ? `${blocked.length} shipments were blocked from deletion due to existing relations.`
          : 'No shipments were deleted.'
      emit('delete-shipment', { success: false, error: message, data: result })
      Swal.fire('Deletion Failed', message, 'error')
      return { success: false, error: message }
    }
  } catch (error) {
    console.error('Error bulk deleting shipments:', error)
    emit('delete-shipment', { success: false, error: error.message })
    Swal.fire('Error', `Failed to bulk delete shipments: ${error.message}`, 'error')
    return { success: false, error: error.message }
  }
}

// Computed property for filtered data
const filteredData = computed(() => {
  if (!props.filters) return data.value

  return data.value.filter((item) => {
    const filters = props.filters

    if (
      filters.trackingCode &&
      !item.trackingCode?.toLowerCase().includes(filters.trackingCode.toLowerCase())
    ) {
      return false
    }
    if (filters.carrier && !item.carrier?.toLowerCase().includes(filters.carrier.toLowerCase())) {
      return false
    }
    if (filters.order && !item.order?.toLowerCase().includes(filters.order.toLowerCase())) {
      return false
    }
    if (
      filters.destination &&
      !item.destination?.toLowerCase().includes(filters.destination.toLowerCase())
    ) {
      return false
    }
    // Status filter (table uses item.state for the status column)
    if (filters.status && item.state !== filters.status) {
      return false
    }
    if (filters.date && item.shippingDate) {
      const filterDate = new Date(filters.date)
      const itemDate = new Date(item.shippingDate)
      // Compare year, month, and day only
      if (
        filterDate.getFullYear() !== itemDate.getFullYear() ||
        filterDate.getMonth() !== itemDate.getMonth() ||
        filterDate.getDate() !== itemDate.getDate()
      ) {
        return false
      }
    }

    return true
  })
})

// Pagination configuration
const currentPage = ref(1)
const itemsPerPage = ref(5)

const paginatedData = computed(() => {
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

// Helper function to adjust page after deletion
const adjustPageAfterDeletion = () => {
  const totalItems = filteredData.value.length
  const maxPage = Math.ceil(totalItems / itemsPerPage.value) || 1

  if (currentPage.value > maxPage) {
    currentPage.value = maxPage
  }
}

// Watch for filter changes and pagination changes to update 'select all' state
watch(
  [() => props.filters, currentPage],
  () => {
    setTimeout(updateSelectAllState, 0)
  },
  { deep: true },
)

// Expose refresh method for parent component
const refreshData = () => {
  fetchShipments()
  selectedItems.value = []
  selectAll.value = false
}

defineExpose({ refreshData, selectedItems, bulkDelete })

// Watch for filter changes
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
