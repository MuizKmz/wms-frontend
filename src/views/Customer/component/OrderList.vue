<template>
  <div class="overflow-visible">
    <!-- Customer Dropdown Filter -->
    <div class="mb-4 flex items-center gap-2 mt-5">
      <label class="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
        Customer :
      </label>
      <div class="dropdown relative inline-flex w-64" ref="customerDropdownRef">
        <button
          type="button"
          class="dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400 text-left"
          :aria-expanded="isCustomerDropdownOpen"
          @click.stop="toggleCustomerDropdown"
          :disabled="loadingCustomers"
        >
          <span class="truncate pr-2">{{ selectedCustomerName || 'Select Customer' }}</span>
          <span
            class="icon-[tabler--chevron-down] size-4 transition-transform flex-shrink-0"
            :class="{ 'rotate-180': isCustomerDropdownOpen }"
          ></span>
        </button>

        <ul
          class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[9999] text-gray-900 dark:text-white max-h-60 overflow-y-auto"
          :class="{
            'opacity-100 pointer-events-auto': isCustomerDropdownOpen,
            'opacity-0 pointer-events-none': !isCustomerDropdownOpen,
          }"
          role="menu"
        >
          <li>
            <a
              class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
              @click="selectCustomer(null, 'All Customers')"
            >
              All Customers
            </a>
          </li>
          <li v-for="customer in customers" :key="customer.id">
            <a
              class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
              @click="selectCustomer(customer.id, customer.customerName || customer.name)"
              :title="customer.customerName || customer.name"
            >
              <div class="truncate">
                {{ customer.customerName || customer.name }}
              </div>
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div class="max-w-full overflow-x-auto custom-scrollbar mt-5">
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
                Product Name
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p
                class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400"
              >
                Quantity
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p
                class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400"
              >
                Order Status
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
            <td class="px-6 py-4">
              <input
                type="checkbox"
                class="checkbox checkbox-primary checkbox-sm"
                aria-label="select item"
                :checked="isSelected(item.id)"
                @change="toggleItemSelection(item.id)"
              />
            </td>

            <!-- Order ID -->
            <td class="px-6 py-4">
              <span class="font-mono text-sm text-gray-900 dark:text-white">
                {{ item.orderId }}
              </span>
            </td>

            <!-- Product Name -->
            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.productName }}
              </p>
            </td>

            <!-- Quantity -->
            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.quantity }}
              </p>
            </td>

            <!-- Order Status -->
            <td class="px-6 py-4">
              <span
                :class="{
                  'px-3 py-1 text-xs rounded-full font-medium': true,
                  'bg-green-100 text-green-600':
                    item.orderStatus === 'Completed' || item.orderStatus === 'Confirmed',
                  'bg-yellow-100 text-yellow-600': item.orderStatus === 'Shipped',
                  'bg-blue-100 text-blue-600':
                    item.orderStatus === 'PROCESSING' || item.orderStatus === 'PENDING',
                  'bg-red-100 text-red-600': item.orderStatus === 'Cancelled',
                  'bg-gray-100 text-gray-600': item.orderStatus === 'Draft',
                }"
              >
                {{ item.orderStatus }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- FlyonUI Pagination -->
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

      <!-- Loading -->
      <div v-if="loading" class="p-8 text-center text-gray-500 text-sm">
        <div
          class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"
        ></div>
        <p>Loading orders...</p>
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
        <p class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No orders found</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your filters or select a different customer.
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
        <p class="font-medium">Error loading orders</p>
        <p class="text-xs mt-1">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue'
import { authenticatedFetch } from '@/utils/authenticatedFetch'

// Props for receiving filters
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({}),
  },
})

// Emits for parent component
const emit = defineEmits(['edit-order', 'delete-order'])

const data = ref([])
const loading = ref(false)
const error = ref(null)
const customers = ref([])
const loadingCustomers = ref(false)
const selectedCustomerId = ref(null)
const selectedCustomerName = ref('All Customers')
const isCustomerDropdownOpen = ref(false)
const customerDropdownRef = ref(null)
const selectedItems = ref([])
const selectAll = ref(false)

// API endpoints
const API_URL = '/api/order'
const CUSTOMER_API_URL = '/api/customer'

// Function to fetch customers
const fetchCustomers = async () => {
  loadingCustomers.value = true
  try {
    const response = await authenticatedFetch(CUSTOMER_API_URL)
    if (!response.ok) throw new Error('Failed to fetch customers')
    const json = await response.json()
    customers.value = json || []
  } catch (e) {
    console.error('Error fetching customers:', e)
  } finally {
    loadingCustomers.value = false
  }
}

// Function to fetch orders from the API
const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    // Append customer filter if selected
    const url = selectedCustomerId.value
      ? `${API_URL}?customerId=${selectedCustomerId.value}`
      : API_URL
    const response = await authenticatedFetch(url)

    if (!response.ok) throw new Error('Failed to fetch orders')

    const json = await response.json()

    // Flatten orderItems into individual rows
    const flattenedData = []
    json.forEach((order) => {
      if (order.orderItems && order.orderItems.length > 0) {
        order.orderItems.forEach((item) => {
          flattenedData.push({
            id: `${order.id}-${item.id}`, // Unique composite ID
            orderId: order.orderNo || order.id,
            productName: item.product?.name || item.product?.productCode || '-',
            quantity: item.quantity || 0,
            orderStatus: order.status || 'Pending',
            customerId: order.customerId,
            supplierId: order.supplierId,
            customer: order.customer,
            supplier: order.supplier,
            orderType: order.orderType,
            estimatedDeliveryTime: order.estimatedDeliveryTime,
            rawOrder: order,
            rawItem: item,
          })
        })
      } else {
        // If no order items, show order without product details
        flattenedData.push({
          id: order.id,
          orderId: order.orderNo || order.id,
          productName: '-',
          quantity: 0,
          orderStatus: order.status || 'Pending',
          customerId: order.customerId,
          supplierId: order.supplierId,
          customer: order.customer,
          supplier: order.supplier,
          orderType: order.orderType,
          estimatedDeliveryTime: order.estimatedDeliveryTime,
          rawOrder: order,
        })
      }
    })

    data.value = flattenedData
  } catch (e) {
    error.value = e.message
    console.error('Error fetching orders:', e)
  } finally {
    loading.value = false
  }
}

// Fetch data on component mount
onMounted(() => {
  fetchCustomers()
  fetchData()
  document.addEventListener('click', handleClickOutside)
})

// Remove event listener on unmount
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
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

// Computed property for filtered data
const filteredData = computed(() => {
  let filtered = data.value

  // Filter by selected customer
  if (selectedCustomerId.value !== null) {
    filtered = filtered.filter(
      (item) =>
        item.customerId === selectedCustomerId.value ||
        item.customer?.id === selectedCustomerId.value,
    )
  }

  // Apply other filters
  if (!props.filters || Object.keys(props.filters).length === 0) return filtered

  return filtered.filter((item) => {
    const filters = props.filters

    if (
      filters.orderId &&
      !(item.orderId || '').toLowerCase().includes(filters.orderId.toLowerCase())
    ) {
      return false
    }
    if (
      filters.productName &&
      !(item.productName || '').toLowerCase().includes(filters.productName.toLowerCase())
    ) {
      return false
    }
    if (filters.orderStatus && item.orderStatus !== filters.orderStatus) {
      return false
    }

    return true
  })
})

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(5)

const totalPages = computed(() => Math.ceil(filteredData.value.length / itemsPerPage.value))

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredData.value.slice(start, end)
})

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

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Customer dropdown functions
const toggleCustomerDropdown = () => {
  isCustomerDropdownOpen.value = !isCustomerDropdownOpen.value
}

const selectCustomer = (id, name) => {
  selectedCustomerId.value = id
  selectedCustomerName.value = name
  isCustomerDropdownOpen.value = false
  currentPage.value = 1 // Reset to first page when customer changes
  // Fetch orders filtered by customer immediately
  fetchData()
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (customerDropdownRef.value && !customerDropdownRef.value.contains(event.target)) {
    isCustomerDropdownOpen.value = false
  }
}

// Expose refresh method for parent component
const refreshData = () => {
  fetchData()
  selectedItems.value = []
  selectAll.value = false
}

defineExpose({ refreshData, selectedItems })

// Watch for filter changes and pagination changes to update 'select all' state
watch(
  [() => props.filters, currentPage],
  () => {
    setTimeout(updateSelectAllState, 0)
  },
  { deep: true },
)

// Watch for filter changes
watch(
  () => props.filters,
  (newFilters) => {
    console.log('Filters updated:', newFilters)
    currentPage.value = 1 // reset to first page on filter change
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
