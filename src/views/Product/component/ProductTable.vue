<template>
  <div class="overflow-hidden">

    <!-- Results count -->
    <div class="mb-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Showing {{ filteredData.length }} category items
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
                Category Name
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Category Code
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Status
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Remarks
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
          <template v-for="(item, index) in paginatedData" :key="item.id">
            <!-- Parent/Main Category Row -->
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td class="px-6 py-4">
                <input 
                  type="checkbox" 
                  class="checkbox checkbox-primary checkbox-sm" 
                  aria-label="select item"
                  :checked="isSelected(item.id)"
                  @change="toggleItemSelection(item.id)"
                />
              </td>

              <!-- Category Name with expand/collapse -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <button
                    v-if="hasSubcategories(item.id)"
                    @click="toggleExpand(item.id)"
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg 
                      class="w-4 h-4 transition-transform"
                      :class="{ 'rotate-90': expandedCategories.includes(item.id) }"
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ item.name }}
                  </span>
                </div>
              </td>

              <!-- Category Code -->
              <td class="px-6 py-4">
                <span class="font-mono text-sm text-gray-900 dark:text-white">
                  {{ item.categoryCode }}
                </span>
              </td>

              <!-- Status -->
              <td class="px-6 py-4">
                <span :class="{
                  'px-3 py-1 text-xs rounded-full font-medium': true,
                  'bg-green-100 text-green-600': item.status === 'Active',
                  'bg-blue-100 text-blue-600': item.status === 'Inactive',
                  'bg-yellow-100 text-yellow-600': item.status === 'Pending'
                }">
                  {{ item.status }}
                </span>
              </td>

              <!-- Remarks -->
              <td class="px-6 py-4">
                <p class="text-sm text-gray-900 dark:text-white">
                  {{ item.storageRequirements || '-' }}
                </p>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <button
                    @click="editCategory(item)"
                    class="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    aria-label="Edit"
                    title="Edit Category"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>

            <!-- Subcategories (shown when expanded) -->
            <template v-if="expandedCategories.includes(item.id)">
              <tr 
                v-for="sub in getSubcategories(item.id)" 
                :key="sub.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors bg-gray-25 dark:bg-gray-900/30"
              >
                <td class="px-6 py-4">
                  <input 
                    type="checkbox" 
                    class="checkbox checkbox-primary checkbox-sm" 
                    aria-label="select item"
                    :checked="isSelected(sub.id)"
                    @change="toggleItemSelection(sub.id)"
                  />
                </td>

                <!-- Subcategory Name (indented) -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2 ml-8">
                    <span class="text-sm text-gray-700 dark:text-gray-300">
                      {{ sub.name }}
                    </span>
                  </div>
                </td>

                <!-- Subcategory Code -->
                <td class="px-6 py-4">
                  <span class="font-mono text-sm text-gray-900 dark:text-white">
                    {{ sub.categoryCode }}
                  </span>
                </td>

                <!-- Status -->
                <td class="px-6 py-4">
                  <span :class="{
                    'px-3 py-1 text-xs rounded-full font-medium': true,
                    'bg-green-100 text-green-600': sub.status === 'Active',
                    'bg-blue-100 text-blue-600': sub.status === 'Inactive',
                    'bg-yellow-100 text-yellow-600': sub.status === 'Pending'
                  }">
                    {{ sub.status }}
                  </span>
                </td>

                <!-- Remarks -->
                <td class="px-6 py-4">
                  <p class="text-sm text-gray-700 dark:text-gray-300">
                    {{ sub.storageRequirements || '-' }}
                  </p>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <button
                      @click="editCategory(sub)"
                      class="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      aria-label="Edit"
                      title="Edit Category"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </template>
        </tbody>
      </table>

      <!-- FlyonUI Pagination -->
      <div v-if="totalPages > 1" class="mt-6 flex justify-center">
        <nav class="flex items-center gap-x-1">
          <!-- Previous -->
          <button type="button" class="btn btn-text dark:text-gray-300" :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)">
            Previous
          </button>

          <!-- Pages -->
          <div class="flex items-center gap-x-1">
            <button v-for="page in totalPages" :key="page" type="button"
              class="btn btn-text btn-square aria-[current='page']:text-bg-primary dark:text-gray-300"
              :class="{ 'text-bg-primary': page === currentPage }" :aria-current="page === currentPage ? 'page' : null"
              @click="changePage(page)">
              {{ page }}
            </button>
          </div>

          <!-- Next -->
          <button type="button" class="btn btn-text dark:text-gray-300" :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)">
            Next
          </button>
        </nav>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="p-8 text-center text-gray-500 text-sm">
        <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
        <p>Loading categories...</p>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && filteredData.length === 0" class="p-8 text-center text-gray-500">
        <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No categories found
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your filters or create a new category.
        </p>
      </div>

      <!-- Error -->
      <div v-if="error" class="p-8 text-center text-red-500 text-sm">
        <svg class="mx-auto h-12 w-12 text-red-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="font-medium">Error loading categories</p>
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
const emit = defineEmits(['edit-category', 'delete-category'])

const data = ref([])
const loading = ref(false)
const error = ref(null)
const expandedCategories = ref([])
const selectedItems = ref([])
const selectAll = ref(false)

// API endpoint for categories
const API_URL = '/api/category'

// Function to fetch categories from the API
const fetchCategories = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(API_URL)

    if (!response.ok) throw new Error("Failed to fetch categories")

    const json = await response.json()
    data.value = json || []
  } catch (e) {
    error.value = e.message
    console.error('Error fetching categories:', e)
  } finally {
    loading.value = false
  }
}

// Fetch data on component mount
onMounted(() => {
  fetchCategories()
})

// Toggle select all
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = []
    selectAll.value = false
  } else {
    // Select all visible items (including subcategories if expanded)
    const allIds = []
    paginatedData.value.forEach(item => {
      allIds.push(item.id)
      if (expandedCategories.value.includes(item.id)) {
        getSubcategories(item.id).forEach(sub => {
          allIds.push(sub.id)
        })
      }
    })
    selectedItems.value = allIds
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
  const allVisibleIds = []
  paginatedData.value.forEach(item => {
    allVisibleIds.push(item.id)
    if (expandedCategories.value.includes(item.id)) {
      getSubcategories(item.id).forEach(sub => {
        allVisibleIds.push(sub.id)
      })
    }
  })
  selectAll.value = allVisibleIds.length > 0 && allVisibleIds.every(id => selectedItems.value.includes(id))
}

// Check if category has subcategories
const hasSubcategories = (categoryId) => {
  return data.value.some(cat => cat.parentCategoryId === categoryId)
}

// Get subcategories for a parent category
const getSubcategories = (parentId) => {
  return data.value.filter(cat => cat.parentCategoryId === parentId)
}

// Toggle expand/collapse for categories with subcategories
const toggleExpand = (categoryId) => {
  const index = expandedCategories.value.indexOf(categoryId)
  if (index > -1) {
    expandedCategories.value.splice(index, 1)
  } else {
    expandedCategories.value.push(categoryId)
  }
}

// Computed property for filtered data (only top-level categories)
const filteredData = computed(() => {
  let categories = data.value.filter(cat => cat.parentCategoryId === null)
  
  if (!props.filters) return categories

  return categories.filter((item) => {
    const filters = props.filters

    if (
      filters.categoryName &&
      !item.name
        .toLowerCase()
        .includes(filters.categoryName.toLowerCase())
    ) {
      return false
    }
    if (
      filters.categoryCode &&
      !item.categoryCode
        .toLowerCase()
        .includes(filters.categoryCode.toLowerCase())
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

const editCategory = (category) => {
  emit('edit-category', category)
}

// Expose refresh method for parent component
const refreshData = () => {
  fetchCategories()
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