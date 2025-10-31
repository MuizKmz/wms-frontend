<template>
  <div class="overflow-hidden">
    <!-- Category Dropdown Filter -->
    <div class="mb-4 flex items-center gap-2 mt-5">
      <label class="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
        Category :
      </label>
      <div class="dropdown relative inline-flex w-64" ref="categoryDropdownRef">
        <button
          type="button"
          class="dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400 text-left"
          :aria-expanded="isCategoryDropdownOpen"
          @click.stop="toggleCategoryDropdown"
          :disabled="loadingCategories"
        >
          <span class="truncate pr-2">{{ selectedCategoryName || 'Select Category' }}</span>
          <span
            class="icon-[tabler--chevron-down] size-4 transition-transform flex-shrink-0"
            :class="{ 'rotate-180': isCategoryDropdownOpen }"
          ></span>
        </button>

        <ul
          class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white max-h-60 overflow-y-auto"
          :class="{
            'opacity-100 pointer-events-auto': isCategoryDropdownOpen,
            'opacity-0 pointer-events-none': !isCategoryDropdownOpen,
          }"
          role="menu"
        >
          <li>
            <a
              class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
              @click="selectCategory(null, 'All Categories')"
            >
              All Categories
            </a>
          </li>
          <li v-for="category in categories" :key="category.id">
            <a
              class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
              @click="selectCategory(category.id, `${category.categoryCode} - ${category.name}`)"
              :title="`${category.categoryCode} - ${category.name}`"
            >
              <div class="truncate">{{ category.categoryCode }} - {{ category.name }}</div>
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div class="max-w-full overflow-x-auto custom-scrollbar mt-5">
      <table class="min-w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th class="px-6 py-3 text-left">
              <p
                class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400"
              >
                Product
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
                Status
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p
                class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400"
              >
                Rack
              </p>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="(item, index) in paginatedData"
            :key="index"
            class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <!-- Product -->
            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.product || item.productName || '-' }}
              </p>
            </td>

            <!-- Quantity -->
            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.quantity || 0 }}
              </p>
            </td>

            <!-- Status -->
            <td class="px-6 py-4">
              <span
                :class="{
                  'px-3 py-1 text-xs rounded-full font-medium': true,
                  'bg-green-100 text-green-600':
                    item.status === 'Active' || item.status === 'In Stock',
                  'bg-blue-100 text-blue-600': item.status === 'Inactive',
                  'bg-yellow-100 text-yellow-600':
                    item.status === 'Pending' || item.status === 'Low Stock',
                  'bg-red-100 text-red-600': item.status === 'Out of Stock',
                }"
              >
                {{ item.status || '-' }}
              </span>
            </td>

            <!-- Rack -->
            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.rack || item.rackLocation || '-' }}
              </p>
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
                :class="{ 'btn-active': page === currentPage }"
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
        <p>Loading data...</p>
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
        <p class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No data found</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">Try adjusting your filters.</p>
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
        <p class="font-medium">Error loading data</p>
        <p class="text-xs mt-1">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue'

// Props for receiving filters
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({}),
  },
})

const data = ref([])
const loading = ref(false)
const error = ref(null)
const categories = ref([])
const loadingCategories = ref(false)
const selectedCategoryId = ref(null)
const selectedCategoryName = ref('All Categories')
const isCategoryDropdownOpen = ref(false)
const categoryDropdownRef = ref(null)

// API endpoint - use inventory endpoint which includes product and rack relations
const API_URL = '/api/inventory'
const CATEGORY_API_URL = '/api/category'

// Function to fetch categories
const fetchCategories = async () => {
  loadingCategories.value = true
  try {
    const response = await fetch(CATEGORY_API_URL)
    if (!response.ok) throw new Error('Failed to fetch categories')
    const json = await response.json()
    categories.value = json || []
  } catch (e) {
    console.error('Error fetching categories:', e)
  } finally {
    loadingCategories.value = false
  }
}

// Function to fetch data from the API
const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    // Append category filter if selected
    const url = selectedCategoryId.value
      ? `${API_URL}?categoryId=${selectedCategoryId.value}`
      : API_URL
    const response = await fetch(url)

    if (!response.ok) throw new Error('Failed to fetch data')

    const json = await response.json()
    // Normalize inventory items for the UI
    data.value = (json || []).map((inv) => ({
      id: inv.id,
      product: inv.product ? inv.product.name || inv.product.productCode : inv.productName || null,
      productId: inv.product?.id || inv.productId,
      categoryId: inv.product?.category?.id || inv.product?.categoryId || null,
      quantity: inv.quantity || 0,
      status: inv.product?.status || inv.status || (inv.quantity > 0 ? 'In Stock' : 'Out of Stock'),
      rack: inv.rack ? inv.rack.rackName || inv.rack.rackCode : inv.rackLocation || null,
      warehouse: inv.warehouse,
      raw: inv,
    }))
  } catch (e) {
    error.value = e.message
    console.error('Error fetching data:', e)
  } finally {
    loading.value = false
  }
}

// Fetch data on component mount
onMounted(() => {
  fetchCategories()
  fetchData()
})

// Computed property for filtered data
const filteredData = computed(() => {
  let filtered = data.value

  // Filter by selected category
  if (selectedCategoryId.value !== null) {
    filtered = filtered.filter(
      (item) =>
        item.categoryId === selectedCategoryId.value ||
        item.category?.id === selectedCategoryId.value,
    )
  }

  // Apply other filters
  if (!props.filters || Object.keys(props.filters).length === 0) return filtered

  return filtered.filter((item) => {
    const filters = props.filters

    if (
      filters.product &&
      !(item.product || item.productName || '')
        .toLowerCase()
        .includes(filters.product.toLowerCase())
    ) {
      return false
    }
    if (filters.quantity && item.quantity !== parseInt(filters.quantity)) {
      return false
    }
    if (filters.status && item.status !== filters.status) {
      return false
    }
    if (
      filters.rack &&
      !(item.rack || item.rackLocation || '').toLowerCase().includes(filters.rack.toLowerCase())
    ) {
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

// Category dropdown functions
const toggleCategoryDropdown = () => {
  isCategoryDropdownOpen.value = !isCategoryDropdownOpen.value
}

const selectCategory = (id, name) => {
  selectedCategoryId.value = id
  selectedCategoryName.value = name
  isCategoryDropdownOpen.value = false
  currentPage.value = 1 // Reset to first page when category changes
  // Fetch inventory filtered by category immediately
  fetchData()
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (categoryDropdownRef.value && !categoryDropdownRef.value.contains(event.target)) {
    isCategoryDropdownOpen.value = false
  }
}

// Add event listener for clicking outside
onMounted(() => {
  fetchCategories()
  fetchData()
  document.addEventListener('click', handleClickOutside)
})

// Remove event listener on unmount
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Expose refresh method for parent component
const refreshData = () => {
  fetchData()
}

defineExpose({ refreshData })

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
