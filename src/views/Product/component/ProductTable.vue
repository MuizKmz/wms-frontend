<template>
  <div class="overflow-hidden">
    <!-- Header with Select Columns Button -->
    <div class="flex justify-between items-center mb-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Showing {{ filteredData.length }} product items
      </p>

      <!-- Select Columns Button -->
      <div class="relative z-50">
        <SelectTable
          :apiUrl="API_URL"
          :storageKey="`product-columns`"
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
              <!-- SKU Code with monospace -->
              <span
                v-if="col === 'skuCode'"
                class="font-mono text-sm text-gray-900 dark:text-white"
              >
                {{ getCellValue(item, col) }}
              </span>

              <!-- Created Time with date formatting -->
              <span v-else-if="col === 'createdTime'" class="text-sm text-gray-900 dark:text-white">
                {{ formatDate(getCellValue(item, col)) }}
              </span>

              <!-- Status with badge styling -->
              <span v-else-if="col === 'status'" :class="statusBadgeClass(getCellValue(item, col))">
                {{ String(getCellValue(item, col) ?? 'Unknown').toUpperCase() }}
              </span>

              <!-- Default display -->
              <span v-else class="text-sm text-gray-900 dark:text-white">
                {{ getCellValue(item, col) }}
              </span>
            </td>

            <!-- Actions -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <button
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
                </button>
                <button
                  v-if="canUpdate('Product')"
                  @click="editProduct(item)"
                  class="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  aria-label="Edit"
                  title="Edit Product"
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
                  v-if="canDelete('Product')"
                  @click="deleteProduct(item)"
                  class="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  aria-label="Delete"
                  title="Delete Product"
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
        <p>Loading products...</p>
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
        <p class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No products found</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your filters or add a new product.
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
        <p class="font-medium">Error loading products</p>
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
import { useAuth } from '@/composables/useAuth'
import authenticatedFetch from '@/utils/authenticatedFetch'
import Swal from 'sweetalert2'
import SelectTable from '@/components/common/SelectTable.vue'

// Get permission checking functions
const { canUpdate, canDelete } = useAuth()

// Props for receiving filters
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({}),
  },
})

// Emits for parent component
const emit = defineEmits(['generate-epc', 'edit-product', 'delete-product'])

const data = ref([])
const loading = ref(false)
const error = ref(null)
const selectedItems = ref([])
const selectAll = ref(false)
const selectedColumns = ref([])

// API endpoint for products
const API_URL = '/api/product'

const allowedColumns = [
  'productName',
  'skuCode',
  'category',
  'supplierName',
  'status',
  'remark',
  'createdTime',
]

const fieldAliases = {
  productName: ['productName', 'name'],
  skuCode: ['skuCode', 'sku'],
  category: ['category'],
  supplierName: ['supplierName'],
  status: ['status'],
  remark: ['remark', 'remarks'],
  createdTime: ['createdTime', 'createdAt'],
}

//Format column name for display
const formatColumnName = (name) => {
  const nameMap = {
    productName: 'Product Name',
    skuCode: 'SKU Code',
    category: 'Category',
    supplierName: 'Supplier Name',
    status: 'Status',
    remark: 'Remark',
    createdTime: 'Created Time',
  }

  return (
    nameMap[name] ||
    name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  )
}

//Get cell value with proper fallbacks and field aliases
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

// Get status badge class
const statusBadgeClass = (status) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  switch (String(status || '').toLowerCase()) {
    case 'active':
      return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`
    case 'inactive':
      return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`
    case 'pending':
      return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`
    default:
      return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`
  }
}

//Handle column selection update from SelectTable component
const handleColumnsUpdate = (columns) => {
  selectedColumns.value = columns
  console.log('Selected columns updated:', columns)
}

// Function to fetch products from the API
const fetchProducts = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await authenticatedFetch(API_URL)

    if (!response.ok) throw new Error('Failed to fetch products')

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
        category: p.category ? p.category.name || p.category.categoryCode : p.category || '',
        supplierName: p.supplier
          ? p.supplier.supplierName || p.supplier.supplierCode || p.supplier.name
          : p.supplierName || '',
        status: p.status,
        remark: p.remarks || p.remark || p.remark || '',
        createdTime: p.createdAt || p.createdTime,
        raw: p,
      }
    })
    if (selectedColumns.value.length === 0) {
      selectedColumns.value = [...allowedColumns]
      console.log('Set default columns (all):', selectedColumns.value)
    }
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

// Generate EPC action
const generateEPC = (product) => {
  emit('generate-epc', product)
}

// Edit product
const editProduct = (product) => {
  emit('edit-product', product)
}

// Delete product with SweetAlert2
const deleteProduct = async (product) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `You are about to delete product: ${product.productName}. This action cannot be undone.`,
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
    const productId = product.id
    if (!productId) {
      throw new Error('Product identifier not found.')
    }

    const response = await authenticatedFetch(`${API_URL}/${productId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete product')
    }

    Swal.fire({
      title: 'Deleted!',
      text: `Product ${product.productName} has been deleted.`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    })

    emit('delete-product', {
      success: true,
      data: { productName: product.productName, id: product.id },
    })

    const index = selectedItems.value.indexOf(product.id)
    if (index > -1) {
      selectedItems.value.splice(index, 1)
    }

    await fetchProducts()

    adjustPageAfterDeletion()
  } catch (error) {
    console.error('Error deleting product:', error)
    emit('delete-product', { success: false, error: error.message })
    Swal.fire('Error', `Failed to delete product: ${error.message}`, 'error')
  }
}

// Bulk delete selected products
const bulkDelete = async () => {
  if (!selectedItems.value || selectedItems.value.length === 0) {
    Swal.fire('No Selection', 'Please select at least one product to delete.', 'info')
    return { success: false, error: 'No products selected' }
  }

  const confirmResult = await Swal.fire({
    title: 'Confirm Bulk Deletion',
    text: `Are you sure you want to delete ${selectedItems.value.length} selected product(s)? This cannot be undone.`,
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
      body: JSON.stringify({ ids: selectedItems.value }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(err || 'Failed to bulk delete products')
    }

    const result = await response.json()

    const deletedCount = Array.isArray(result.deletedIds) ? result.deletedIds.length : 0
    const blocked = result.blocked || []

    selectedItems.value = []
    selectAll.value = false
    await fetchProducts()

    adjustPageAfterDeletion()

    if (deletedCount > 0 && blocked.length === 0) {
      emit('delete-product', { success: true, data: { count: deletedCount } })
      Swal.fire('Success', `${deletedCount} products deleted successfully.`, 'success')
      return { success: true, data: result }
    } else if (deletedCount > 0 && blocked.length > 0) {
      const message = `${deletedCount} deleted, ${blocked.length} blocked due to existing relations`
      emit('delete-product', { success: false, error: message, data: { deletedCount, blocked } })
      Swal.fire('Partial Success', message, 'warning')
      return { success: false, error: message, data: result }
    } else {
      const message =
        blocked.length > 0
          ? `${blocked.length} products were blocked from deletion due to existing relations.`
          : 'No products were deleted.'
      emit('delete-product', { success: false, error: message, data: result })
      Swal.fire('Deletion Failed', message, 'error')
      return { success: false, error: message }
    }
  } catch (error) {
    console.error('Error bulk deleting products:', error)
    emit('delete-product', { success: false, error: error.message })
    Swal.fire('Error', `Failed to bulk delete products: ${error.message}`, 'error')
    return { success: false, error: error.message }
  }
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
    if (filters.skuCode && !item.skuCode?.toLowerCase().includes(filters.skuCode.toLowerCase())) {
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
    if (filters.date && item.createdTime) {
      const filterDate = new Date(filters.date)
      const itemDate = new Date(item.createdTime)
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

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(5)

// Calculate total number of pages
const totalPages = computed(() => Math.ceil(filteredData.value.length / itemsPerPage.value))

// Get paginated data for current page
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

// Handle page change with validation
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
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
  fetchProducts()
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
