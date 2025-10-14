<template>
  <div class="overflow-hidden">

    <div class="mb-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Showing {{ filteredData.length }} inventory items
      </p>
    </div>

    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="min-w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th class="px-6 py-3 text-left w-12">
              <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" aria-label="select all"
                :checked="selectAll" @change="toggleSelectAll" />
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Product Name
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Product Code
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                SKU Code
              </p>
            </th>
            <th class="px-6 py-3 text-center" colspan="3">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400 py-2 mb-2 border-b">
                Status
              </p>
              <div class="flex justify-around gap-2">
                <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400 flex-1 border-r px-2">
                  Received
                </p>
                <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400 flex-1 border-r px-2">
                  Delivered
                </p>
                <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400 flex-1 whitespace-nowrap">
                  In Stock
                </p>
              </div>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Return
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Latest Update
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Supplier Code
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Supplier Name
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Warehouse Code
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Rack Code
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Section Code
              </p>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="item in paginatedData" :key="item.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <td class="px-6 py-4">
              <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" aria-label="select item"
                :checked="isSelected(item.id)" @change="toggleItemSelection(item.id)" />
            </td>

            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.product?.name }}
              </p>
            </td>

            <td class="px-6 py-4">
              <span class="font-mono text-sm text-gray-900 dark:text-white">
                {{ item.product?.productCode }}
              </span>
            </td>

            <td class="px-6 py-4">
              <span class="font-mono text-sm text-gray-900 dark:text-white">
                {{ item.product?.skuCode }}
              </span>
            </td>

            <td class="px-6 py-4 text-center">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.received || 0 }}
              </p>
            </td>

            <td class="px-6 py-4 text-center">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.delivered || 0 }}
              </p>
            </td>

            <td class="px-6 py-4 text-center">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.inStock || 0 }}
              </p>
            </td>

            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.return || 0 }}
              </p>
            </td>

            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ formatDate(item.lastUpdatedAt || item.updatedAt) }}
              </p>
            </td>

            <td class="px-6 py-4">
              <span class="font-mono text-sm text-gray-900 dark:text-white">
                {{ item.supplierCode || '-' }}
              </span>
            </td>

            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.supplierName || '-' }}
              </p>
            </td>

            <td class="px-6 py-4">
              <span class="font-mono text-sm text-gray-900 dark:text-white">
                {{ item.warehouse?.warehouseCode || '-' }}
              </span>
            </td>

            <td class="px-6 py-4">
              <span class="font-mono text-sm text-gray-900 dark:text-white">
                {{ item.rack?.rackCode || '-' }}
              </span>
            </td>

            <td class="px-6 py-4">
              <span class="font-mono text-sm text-gray-900 dark:text-white">
                {{ item.section?.sectionCode || '-' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPages > 1" class="mt-6 flex justify-center">
        <nav class="flex items-center gap-x-1">
          <button type="button" class="btn btn-text dark:text-gray-300" :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)">
            Previous
          </button>

          <div class="flex items-center gap-x-1">
            <button v-for="page in totalPages" :key="page" type="button"
              class="btn btn-text btn-square aria-[current='page']:text-bg-primary dark:text-gray-300"
              :class="{ 'text-bg-primary': page === currentPage }" :aria-current="page === currentPage ? 'page' : null"
              @click="changePage(page)">
              {{ page }}
            </button>
          </div>

          <button type="button" class="btn btn-text dark:text-gray-300" :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)">
            Next
          </button>
        </nav>
      </div>

      <div v-if="loading" class="p-8 text-center text-gray-500 text-sm">
        <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
        <p>Loading inventory...</p>
      </div>

      <div v-if="!loading && filteredData.length === 0" class="p-8 text-center text-gray-500">
        <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No inventory items found
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your filters or add new inventory items.
        </p>
      </div>

      <div v-if="error" class="p-8 text-center text-red-500 text-sm">
        <svg class="mx-auto h-12 w-12 text-red-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="font-medium">Error loading inventory</p>
        <p class="text-xs mt-1">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue"

// Props for receiving filters
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
})

// State for data and UI
const data = ref([])
const loading = ref(false)
const error = ref(null)
const selectedItems = ref([])
const selectAll = ref(false)

// API endpoint for inventory
const API_URL = '/api/inventory'

// Function to fetch inventory from the API
const fetchInventory = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(API_URL)

    if (!response.ok) throw new Error("Failed to fetch inventory")

    const json = await response.json()
    data.value = json || []
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
  return paginatedData.value.map(item => item.id)
})

// Update select all checkbox state
const updateSelectAllState = () => {
  const visibleIds = visibleItemIds.value
  if (visibleIds.length === 0) {
    selectAll.value = false
    return
  }
  selectAll.value = visibleIds.every(id => selectedItems.value.includes(id))
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
    selectedItems.value = selectedItems.value.filter(id => !visibleItemIds.value.includes(id))
    selectAll.value = false
  } else {
    const visibleIds = visibleItemIds.value
    visibleIds.forEach(id => {
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
      !item.productName
        .toLowerCase()
        .includes(filters.productName.toLowerCase())
    ) {
      return false
    }
    if (
      filters.skuCode &&
      !item.skuCode
        .toLowerCase()
        .includes(filters.skuCode.toLowerCase())
    ) {
      return false
    }
    if (filters.status && item.status !== filters.status) {
      return false
    }
    if (filters.date && item.latestUpdate) {
      const itemDate = new Date(item.latestUpdate).toISOString().split('T')[0]
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

const totalPages = computed(() =>
  Math.ceil(filteredData.value.length / itemsPerPage.value)
)
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredData.value.slice(start, end)
})
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// --- Utility Functions ---

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

// Watch for filter changes and pagination changes to update 'select all' state
watch([() => props.filters, currentPage], () => {
  setTimeout(updateSelectAllState, 0)
}, { deep: true })

const refreshData = () => {
  fetchInventory()
  selectedItems.value = []
  selectAll.value = false
}

defineExpose({ refreshData, selectedItems })

watch(
  () => props.filters,
  (newFilters) => {
    console.log("Filters updated:", newFilters)
    currentPage.value = 1
  },
  { deep: true }
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