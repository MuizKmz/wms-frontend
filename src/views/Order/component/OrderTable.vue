<template>
  <div class="overflow-hidden">
    <div class="mb-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Showing {{ filteredData.length }} order records
      </p>
    </div>

    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="min-w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th class="px-6 py-3 text-left w-12">
              <input
                type="checkbox"
                class="checkbox checkbox-primary checkbox-sm"
                aria-label="select all"
                :checked="selectAll"
                @change="toggleSelectAll"
              />
            </th>
            <th class="px-6 py-3 text-left">
              <p
                class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400"
              >
                Order Number
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p
                class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400"
              >
                Customer ID
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p
                class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400"
              >
                PIC
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p
                class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400"
              >
                Product Name
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p
                class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400"
              >
                Expected Quantity
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p
                class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400"
              >
                Stock Out Quantity
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p
                class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400"
              >
                Status
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p
                class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400"
              >
                Remarks
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p
                class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400"
              >
                Estimated Delivery
              </p>
            </th>
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
            <td class="px-6 py-4">
              <input
                type="checkbox"
                class="checkbox checkbox-primary checkbox-sm"
                aria-label="select item"
                :checked="isSelected(row.uniqueId)"
                @change="toggleItemSelection(row.uniqueId)"
              />
            </td>

            <!-- Order Number with expand/collapse -->
            <td class="px-6 py-4">
              <div
                class="flex items-center gap-2"
                :style="{ 'padding-left': row.depth * 2 + 'rem' }"
              >
                <div class="w-4 h-4"></div>

                <button
                  @click="viewOrder(row)"
                  class="text-left font-bold text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {{ row.orderNo || '-' }}
                </button>
              </div>
            </td>

            <!-- Customer ID -->
            <td class="px-6 py-4">
              <span class="font-mono text-sm text-gray-900 dark:text-white">
                {{
                  row.isOrder
                    ? row.customer?.customerCode || row.supplier?.supplierCode || '-'
                    : '-'
                }}
              </span>
            </td>

            <!-- PIC -->
            <td class="px-6 py-4">
              <span class="text-sm text-gray-900 dark:text-white">
                {{ row.isOrder ? row.picName || '-' : '-' }}
              </span>
            </td>

            <!-- Product Name -->
            <td class="px-6 py-4">
              <span
                class="text-sm text-gray-900 dark:text-white"
                :title="row.isOrder && row.aggregatedProducts ? row.aggregatedProducts.full : ''"
              >
                {{
                  row.isOrder ? row.aggregatedProducts?.display || '-' : row.product?.name || '-'
                }}
              </span>
            </td>

            <!-- Expected Quantity -->
            <td class="px-6 py-4">
              <span class="text-sm text-gray-900 dark:text-white">
                {{ row.isOrder ? row.totalExpectedQuantity || '-' : row.quantity || '-' }}
              </span>
            </td>

            <!-- Stock Out Quantity -->
            <td class="px-6 py-4">
              <span class="text-sm text-gray-900 dark:text-white">
                {{ row.isOrder ? row.totalStockOutQuantity || '0' : '-' }}
              </span>
            </td>

            <!-- Status -->
            <td class="px-6 py-4">
              <span
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide"
                :class="statusClass(row.status)"
              >
                {{ row.status || '-' }}
              </span>
            </td>

            <!-- Remarks -->
            <td class="px-6 py-4">
              <span class="text-sm text-gray-900 dark:text-white">
                {{ row.isOrder ? row.remarks || '-' : '-' }}
              </span>
            </td>

            <!-- Estimated Delivery -->
            <td class="px-6 py-4">
              <span class="text-sm text-gray-900 dark:text-white">
                {{ row.isOrder ? formatDate(row.estimatedDeliveryTime) : '-' }}
              </span>
            </td>

            <!-- Action -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <button
                  @click="editOrder(row)"
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
                  @click="deleteOrder(row)"
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

      <!-- Loading State -->
      <div v-if="loading" class="p-8 text-center text-gray-500 text-sm">
        <div
          class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"
        ></div>
        <p>Loading order records...</p>
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
        <p class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No order records found</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your filters or create a new order record.
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
        <p class="font-medium">Error loading order records</p>
        <p class="text-xs mt-1">{{ error }}</p>
      </div>
    </div>

    <OrderView ref="orderViewRef" />
    <OrderQRModal ref="qrModalRef" :show="false" :initialOrderNo="null" @close="closeQRModal" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import OrderView from './OrderView.vue'
import OrderQRModal from './OrderQRModal.vue'
import QRCodeIcon from '@/icons/QRCodeIcon.vue'
import Swal from 'sweetalert2'
import authenticatedFetch from '@/utils/authenticatedFetch'

// Props for order filters
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({}),
  },
})

// Emits for parent component
const emit = defineEmits(['edit-order', 'delete-order', 'view-order'])

const data = ref([])
const loading = ref(false)
const error = ref(null)
const expandedRows = ref([])
const selectedItems = ref([])
const selectAll = ref(false)

// Map order statuses to badge color classes
const statusClass = (status) => {
  if (!status) return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  const map = {
    Created: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
    Processing: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    Preparing: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    Confirmed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200',
    Allocated: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
    Picked: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200',
    Packed: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200',
    Shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
    Delivered: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
    Completed: 'bg-green-200 text-green-900 dark:bg-green-900/60 dark:text-green-100',
    Backordered: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
    Rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
    Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  }
  return map[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
}

// API endpoint for orders
const API_URL = '/api/order'

// Function to fetch orders from the API
const fetchOrders = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await authenticatedFetch(API_URL)

    if (!response.ok) throw new Error('Failed to fetch order records')

    const json = await response.json()
    data.value = json || []
  } catch (e) {
    error.value = e.message
    console.error('Error fetching orders:', e)
  } finally {
    loading.value = false
  }
}

// Fetch data on component mount
onMounted(() => {
  fetchOrders()
})

// ------------------------------------------------
// --- Helper Functions for Aggregation ---
// ------------------------------------------------

// Function to aggregate products from order items
const aggregateProducts = (order) => {
  if (!order.orderItems || order.orderItems.length === 0) {
    return { display: '-', full: '' }
  }

  const products = order.orderItems.map((item) => item.product?.name || 'Unknown')
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

// Function to calculate total expected quantity
const calculateTotalExpectedQuantity = (order) => {
  if (!order.orderItems || order.orderItems.length === 0) {
    return '-'
  }

  const total = order.orderItems.reduce((sum, item) => {
    return sum + (item.quantity || 0)
  }, 0)

  return total > 0 ? total : '-'
}

// Function to calculate total stock out quantity (default 0)
const calculateTotalStockOutQuantity = (order) => {
  if (!order.orderItems || order.orderItems.length === 0) {
    return 0
  }
  // This field may be added later, defaulting to 0 for now
  return 0
}

// ------------------------------------------------
// --- Filtering & Pagination Logic ---
// ------------------------------------------------

// Filtered data based on props.filters
const filteredData = computed(() => {
  return data.value.filter((item) => {
    if (
      props.filters.orderNumber &&
      !item.orderNo.toLowerCase().includes(props.filters.orderNumber.toLowerCase())
    )
      return false
    if (
      props.filters.customerCode &&
      ((!item.customer && !item.supplier) ||
        (item.customer &&
          !item.customer.customerCode
            ?.toLowerCase()
            .includes(props.filters.customerCode.toLowerCase())) ||
        (item.supplier &&
          !item.supplier.supplierCode
            ?.toLowerCase()
            .includes(props.filters.customerCode.toLowerCase())))
    )
      return false
    if (
      props.filters.pic &&
      (!item.picName || !item.picName.toLowerCase().includes(props.filters.pic.toLowerCase()))
    )
      return false
    if (props.filters.status && item.status !== props.filters.status) return false
    // Date filter (compare only the date part, assuming filters.date is 'YYYY-MM-DD')
    if (props.filters.date) {
      // Choose the field to filter by; using estimatedDeliveryTime here
      const rawDate = item.estimatedDeliveryTime || item.orderDate || null
      if (!rawDate) return false
      const itemDate = new Date(rawDate)
      if (isNaN(itemDate.getTime())) return false
      // Normalize to YYYY-MM-DD in local timezone
      const yyyy = itemDate.getFullYear()
      const mm = String(itemDate.getMonth() + 1).padStart(2, '0')
      const dd = String(itemDate.getDate()).padStart(2, '0')
      const normalized = `${yyyy}-${mm}-${dd}`
      if (normalized !== props.filters.date) return false
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

// Generate visible rows (simplified - just show paginated data)
const visibleRows = computed(() => {
  return paginatedData.value.map((order) => {
    const hasItems = order.orderItems && order.orderItems.length > 0
    const isExpanded = expandedRows.value.includes(order.id)

    return {
      ...order,
      isOrder: true,
      depth: 0,
      hasItems: hasItems,
      isExpanded: isExpanded,
      uniqueId: `O-${order.id}`,
      aggregatedProducts: aggregateProducts(order),
      totalExpectedQuantity: calculateTotalExpectedQuantity(order),
      totalStockOutQuantity: calculateTotalStockOutQuantity(order),
    }
  })
})

// Calculate total number of pages
const totalPages = computed(() => Math.ceil(filteredData.value.length / itemsPerPage.value))

// Calculate page numbers to display
const displayPages = computed(() => {
  const total = totalPages.value
  if (total <= 0) return [] // Return empty array if no pages

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

// Handle page change with validation
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Toggle expand/collapse for orders with items
const toggleExpand = (orderId) => {
  const index = expandedRows.value.indexOf(orderId)
  if (index > -1) {
    expandedRows.value.splice(index, 1)
  } else {
    expandedRows.value.push(orderId)
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

const editOrder = (row) => {
  emit('edit-order', row)
}

const deleteOrder = async (item) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `You are about to delete ${item.isOrder ? 'order record' : 'order item'}: ${item.orderNo}. This action cannot be undone.`,
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
    const endpoint = item.isOrder ? `${API_URL}/${item.id}` : `${API_URL}/items/${item.id}`

    const response = await authenticatedFetch(endpoint, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })

    let body = null
    try {
      body = await response.json()
      CONSOLE.log('Delete response body:', body)
    } catch (e) {
      // ignore parse errors
    }

    if (!response.ok) {
      const msg =
        body && (body.message || body.error) ? body.message || body.error : 'Failed to delete'
      console.error('Delete failed:', msg, body)
      emit('delete-order', { success: false, error: msg, details: body })
      Swal.fire('Error', `Failed to delete: ${msg}`, 'error')
      return
    }

    // Clear selection for deleted item
    selectedItems.value = selectedItems.value.filter((id) => id !== item.uniqueId)

    Swal.fire({
      title: 'Deleted!',
      text: `${item.isOrder ? 'Order record' : 'Item'} has been deleted.`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    })

    emit('delete-order', { success: true, data: item })

    // Refresh the table
    await fetchOrders()

    // Adjust page if current page is now empty
    adjustPageAfterDeletion()
  } catch (error) {
    console.error('Error deleting:', error)
    emit('delete-order', { success: false, error: error.message })
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
    const orderIds = selectedItems.value
      .filter((id) => id.startsWith('O-'))
      .map((id) => parseInt(id.replace('O-', '')))

    const itemIds = selectedItems.value
      .filter((id) => id.startsWith('I-'))
      .map((id) => parseInt(id.replace('I-', '')))

    const response = await authenticatedFetch(`${API_URL}/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderIds, itemIds }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(err || 'Failed to bulk delete')
    }

    const result = await response.json()

    selectedItems.value = []
    selectAll.value = false
    await fetchOrders()
    adjustPageAfterDeletion()

    emit('delete-order', { success: true, data: result })
    Swal.fire(
      'Success',
      `${result.deletedCount || selectedItems.value.length} items deleted successfully.`,
      'success',
    )
    return { success: true, data: result }
  } catch (error) {
    console.error('Error bulk deleting:', error)
    emit('delete-order', { success: false, error: error.message })
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

// Modal ref for viewing order
const orderViewRef = ref(null)
const qrModalRef = ref(null)

// Open order modal and emit event
const viewOrder = (row) => {
  if (!orderViewRef.value) return
  // only open for parent order rows
  const payload = row && row.isOrder ? row : null
  if (!payload) return
  orderViewRef.value.openModal(payload)
  emit('view-order', payload)
}

// Show QR Code modal
const showQRCode = (row) => {
  if (qrModalRef.value && row.orderNo) {
    qrModalRef.value.openModal(row.orderNo)
  }
}

// Close QR modal handler
const closeQRModal = () => {
  // Handler for when QR modal closes
}

// Expose refresh method for parent component
const refreshData = () => {
  fetchOrders()
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

<!-- Test -->
