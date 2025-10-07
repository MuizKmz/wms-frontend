<template>
  <div class="overflow-hidden">

    <!-- Results count -->
    <div class="mb-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Showing {{ filteredData.length }} product items
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
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Product Name
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                SKU Code
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Category
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Supplier Name
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Quantity
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Status
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Remark
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Created Time
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
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
            <td class="px-6 py-4">
              <input
                type="checkbox"
                class="checkbox checkbox-primary checkbox-sm"
                aria-label="select item"
                :checked="isSelected(item.id)"
                @change="toggleItemSelection(item.id)"
              />
            </td>

            <!-- Product Name -->
            <td class="px-6 py-4">
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ item.productName || '-' }}
              </span>
            </td>

            <!-- SKU Code -->
            <td class="px-6 py-4">
              <span class="font-mono text-sm text-gray-900 dark:text-white">
                {{ item.skuCode || '-' }}
              </span>
            </td>

            <!-- Category -->
            <td class="px-6 py-4">
              <span class="text-sm text-gray-900 dark:text-white">
                {{ item.category || '-' }}
              </span>
            </td>

            <!-- Supplier Name -->
            <td class="px-6 py-4">
              <span class="text-sm text-gray-900 dark:text-white">
                {{ item.supplierName || '-' }}
              </span>
            </td>

            <!-- Quantity -->
            <td class="px-6 py-4">
              <span class="text-sm text-gray-900 dark:text-white">
                {{ item.quantity || 0 }}
              </span>
            </td>

            <!-- Status -->
            <td class="px-6 py-4">
              <span :class="{
                'px-3 py-1 text-xs rounded-full font-medium': true,
                'bg-green-100 text-green-600': item.status === 'Active',
                'bg-gray-100 text-gray-600': item.status === 'Inactive',
                'bg-yellow-100 text-yellow-600': item.status === 'Pending'
              }">
                {{ item.status || 'Unknown' }}
              </span>
            </td>

            <!-- Remark -->
            <td class="px-6 py-4">
              <span class="text-sm text-gray-900 dark:text-white">
                {{ item.remark || '-' }}
              </span>
            </td>

            <!-- Created Time -->
            <td class="px-6 py-4">
              <span class="text-sm text-gray-900 dark:text-white">
                {{ formatDate(item.createdTime) }}
              </span>
            </td>

            <!-- Actions -->
            <td class="px-6 py-4">
              <button
                @click="generateEPC(item)"
                class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1 transition-colors"
                title="Generate EPC"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate EPC
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-6 flex justify-center">
        <nav class="flex items-center gap-x-1">
          <!-- Previous -->
          <button
            type="button"
            class="btn btn-text dark:text-gray-300"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            Previous
          </button>

          <!-- Pages -->
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

          <!-- Next -->
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

      <!-- Loading -->
      <div v-if="loading" class="p-8 text-center text-gray-500 text-sm">
        <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
        <p>Loading products...</p>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && filteredData.length === 0" class="p-8 text-center text-gray-500">
        <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No products found
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your filters or add a new product.
        </p>
      </div>

      <!-- Error -->
      <div v-if="error" class="p-8 text-center text-red-500 text-sm">
        <svg class="mx-auto h-12 w-12 text-red-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="font-medium">Error loading products</p>
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

// Emits for parent component
const emit = defineEmits(['generate-epc', 'edit-product'])

const data = ref([])
const loading = ref(false)
const error = ref(null)
const selectedItems = ref([])
const selectAll = ref(false)

// API endpoint for products
const API_URL = '/api/product'

// Function to fetch products from the API
const fetchProducts = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(API_URL)

    if (!response.ok) throw new Error("Failed to fetch products")

    const json = await response.json()
    // Normalize server product objects to the shape used by the table
    data.value = (json || []).map((p) => {
      // compute quantity if inventory relation is included
      let quantity = 0
      if (Array.isArray(p.inventory)) {
        quantity = p.inventory.reduce((sum, it) => sum + (it.quantity || 0), 0)
      }

      return {
        id: p.id,
        productName: p.name || p.productName || '',
        skuCode: p.skuCode || p.sku || '',
        category: p.category ? (p.category.name || p.category.categoryCode) : (p.category || ''),
        supplierName: p.supplier ? (p.supplier.supplierName || p.supplier.supplierCode || p.supplier.name) : (p.supplierName || ''),
        quantity,
        status: p.status,
        remark: p.remarks || p.remark || p.remark || '',
        createdTime: p.createdAt || p.createdTime,
        raw: p,
      }
    })
  } catch (e) {
    error.value = e.message
    console.error('Error fetching products:', e)
  } finally {
    loading.value = false
  }
}

// Fetch data on component mount
onMounted(() => {
  fetchProducts()
})

// Toggle select all
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = []
    selectAll.value = false
  } else {
    selectedItems.value = paginatedData.value.map(item => item.id)
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
  const allVisibleIds = paginatedData.value.map(item => item.id)
  selectAll.value = allVisibleIds.length > 0 && allVisibleIds.every(id => selectedItems.value.includes(id))
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

// Generate PO action
const generateEPC = (product) => {
  emit('generate-epc', product)
}

// Computed property for filtered data
const filteredData = computed(() => {
  if (!props.filters) return data.value

  return data.value.filter((item) => {
    const filters = props.filters

    if (
      filters.productName &&
      !item.productName?.toLowerCase().includes(filters.productName.toLowerCase())
    ) {
      return false
    }
    if (
      filters.skuCode &&
      !item.skuCode?.toLowerCase().includes(filters.skuCode.toLowerCase())
    ) {
      return false
    }
    if (
      filters.category &&
      !item.category?.toLowerCase().includes(filters.category.toLowerCase())
    ) {
      return false
    }
    if (
      filters.supplierName &&
      !item.supplierName?.toLowerCase().includes(filters.supplierName.toLowerCase())
    ) {
      return false
    }
    if (filters.status && item.status !== filters.status) {
      return false
    }

    return true
  })
})

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)
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

// Expose refresh method for parent component
const refreshData = () => {
  fetchProducts()
  selectedItems.value = []
  selectAll.value = false
}

defineExpose({ refreshData, selectedItems })

// Watch for filter changes
watch(
  () => props.filters,
  (newFilters) => {
    console.log("Filters updated:", newFilters)
    currentPage.value = 1 // reset to first page on filter change
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
