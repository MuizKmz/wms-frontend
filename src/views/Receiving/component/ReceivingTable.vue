<template>
  <div class="overflow-hidden">
    <div class="mb-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Showing {{ filteredData.length }} receiving records
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
                Receiving Code
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p
                class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400"
              >
                DO Number
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
                Received Quantity
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p
                class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400"
              >
                Receiving Source
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p
                class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400"
              >
                Receiving Purpose
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p
                class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400"
              >
                Received By
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p
                class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400"
              >
                Date Received
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

            <!-- Receiving ID with expand/collapse -->
            <td class="px-6 py-4">
              <div
                class="flex items-center gap-2"
                :style="{ 'padding-left': row.depth * 2 + 'rem' }"
              >
                <div class="w-4 h-4"></div>

                <button
                  @click="viewReceiving(row)"
                  class="text-left font-bold text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {{ row.receivingCode || '-' }}
                </button>
              </div>
            </td>

            <!-- DO Number -->
            <td class="px-6 py-4">
              <span class="font-mono text-sm text-gray-900 dark:text-white">
                {{ row.doNumber || '-' }}
              </span>
            </td>

            <!-- Product Name -->
            <td class="px-6 py-4">
              <span
                class="text-sm text-gray-900 dark:text-white"
                :title="
                  row.isReceiving && row.aggregatedProducts ? row.aggregatedProducts.full : ''
                "
              >
                {{
                  row.isReceiving
                    ? row.aggregatedProducts?.display || '-'
                    : row.product?.name || '-'
                }}
              </span>
            </td>

            <!-- Expected Quantity -->
            <td class="px-6 py-4">
              <span class="text-sm text-gray-900 dark:text-white">
                {{
                  row.isReceiving ? row.totalExpectedQuantity || '-' : row.expectedQuantity || '-'
                }}
              </span>
            </td>

            <!-- Received Quantity -->
            <td class="px-6 py-4">
              <span class="text-sm text-gray-900 dark:text-white">
                {{ row.isReceiving ? row.totalReceivedQuantity || '-' : row.quantity || '-' }}
              </span>
            </td>

            <!-- Receiving Source -->
            <td class="px-6 py-4">
              <span
                class="text-sm text-gray-900 dark:text-white"
                :title="row.isReceiving && row.aggregatedSources ? row.aggregatedSources.full : ''"
              >
                {{ row.isReceiving ? row.aggregatedSources?.display || '-' : '-' }}
              </span>
            </td>

            <!-- Receiving Purpose -->
            <td class="px-6 py-4">
              <span class="text-sm text-gray-900 dark:text-white" :title="row.isReceiving && row.aggregatedPurposes ? row.aggregatedPurposes.full : ''">
                {{ row.isReceiving ? (row.aggregatedPurposes?.display || '-') : (row.receivingPurpose || '') }}
              </span>
            </td>

            <!-- Received By -->
            <td class="px-6 py-4">
              <span class="text-sm text-gray-900 dark:text-white">
                {{ row.isReceiving ? row.receivedBy || '-' : '-' }}
              </span>
            </td>

            <!-- Date Received -->
            <td class="px-6 py-4">
              <span class="text-sm text-gray-900 dark:text-white">
                {{ row.isReceiving ? formatDate(row.receivingDate) : '-' }}
              </span>
            </td>

            <!-- Remarks -->
            <td class="px-6 py-4">
              <span class="text-sm text-gray-900 dark:text-white">
                {{ row.isReceiving ? row.remarks || '-' : '-' }}
              </span>
            </td>

            <!-- Action -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
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

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-6 flex justify-center">
        <nav class="flex items-center gap-x-1">
          <button
            type="button"
            class="btn btn-text dark:text-gray-300"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            Previous
          </button>

          <div class="flex items-center gap-x-1">
            <button
              v-for="page in totalPages"
              :key="page"
              type="button"
              class="btn btn-text btn-square aria-[current='page']:text-bg-primary dark:text-gray-300"
              :class="{ 'text-bg-primary': page === currentPage }"
              :aria-current="page === currentPage ? 'page' : null"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
          </div>

          <button
            type="button"
            class="btn btn-text dark:text-gray-300"
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import Swal from 'sweetalert2'
import { authenticatedFetch } from '@/utils/authenticatedFetch'

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

// API endpoint for receivings
const API_URL = '/api/receiving'

// Function to fetch receivings from the API
const fetchReceivings = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await authenticatedFetch(API_URL)

    if (!response.ok) throw new Error('Failed to fetch receiving records')

    const json = await response.json()
    data.value = json || []
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
    return { display: fallback, full: fallback }
  }

  // Prefer item-level purposes when present
  const itemPurposes = receiving.receivingItems
    .map(item => item.purpose)
    .filter(Boolean)

  const purposesList = itemPurposes.length > 0
    ? itemPurposes
    : [receiving.receivingPurpose || '']

  const uniquePurposes = [...new Set(purposesList)]
  const maxDisplay = 2
  const displayPurposes = uniquePurposes.slice(0, maxDisplay)
  const remaining = uniquePurposes.length - maxDisplay

  if (remaining > 0) {
    return {
      display: displayPurposes.join(', ') + `, +${remaining} more`,
      full: uniquePurposes.join(', '),
    }
  }

  return {
    display: displayPurposes.join(', '),
    full: displayPurposes.join(', '),
  }
}

// Function to calculate total expected quantity
const calculateTotalExpectedQuantity = (receiving) => {
  // Try receivingItems.expectedQuantity first if present
  if (receiving.receivingItems && receiving.receivingItems.length > 0) {
    const itemHasExpected = receiving.receivingItems.some((it) => it.expectedQuantity !== undefined && it.expectedQuantity !== null)
    if (itemHasExpected) {
      const total = receiving.receivingItems.reduce((sum, item) => {
        return sum + (item.expectedQuantity || 0)
      }, 0)
      return total > 0 ? total : '-'
    }
  }

  // Fallback: if this receiving is linked to an order, sum matching orderItems quantities
  if (receiving.order && Array.isArray(receiving.order.orderItems) && receiving.order.orderItems.length > 0) {
    // Sum quantities from order items that correspond to products in receivingItems
    const productIdsInReceiving = (receiving.receivingItems || []).map((it) => it.productId)
    if (productIdsInReceiving.length === 0) return '-'

    const total = receiving.order.orderItems.reduce((sum, oi) => {
      if (productIdsInReceiving.includes(oi.productId)) {
        return sum + (oi.quantity || 0)
      }
      return sum
    }, 0)

    return total > 0 ? total : '-'
  }

  return '-'
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

const currentPage = ref(1)
const itemsPerPage = ref(5)

// Paginated data
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredData.value.slice(start, end)
})

// Generate visible rows (parent + expanded children)
const visibleRows = computed(() => {
  const rows = []

  paginatedData.value.forEach((receiving) => {
    const hasItems = receiving.receivingItems && receiving.receivingItems.length > 0
    const isExpanded = expandedRows.value.includes(receiving.id)

    // Add parent receiving row with aggregated data
    rows.push({
      ...receiving,
      isReceiving: true,
      depth: 0,
      hasItems: hasItems,
      isExpanded: isExpanded,
      uniqueId: `R-${receiving.id}`,
      aggregatedProducts: aggregateProducts(receiving),
      aggregatedSources: aggregateSources(receiving),
      aggregatedPurposes: aggregatePurposes(receiving),
      totalExpectedQuantity: calculateTotalExpectedQuantity(receiving),
      totalReceivedQuantity: calculateTotalReceivedQuantity(receiving),
    })

    // NOTE: Subitems removed — only parent receiving rows are shown in the table
  })

  return rows
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / itemsPerPage.value))

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Toggle expand/collapse for receivings with items
const toggleExpand = (receivingId) => {
  const index = expandedRows.value.indexOf(receivingId)
  if (index > -1) {
    expandedRows.value.splice(index, 1)
  } else {
    expandedRows.value.push(receivingId)
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

const editReceiving = (row) => {
  emit('edit-receiving', row)
}

const viewReceiving = (row) => {
  emit('view-receiving', row)
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

    // Use authenticatedFetch so the auth token is attached and backend authorizes the request
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
