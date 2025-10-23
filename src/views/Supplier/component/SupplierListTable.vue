<template>
  <div class="overflow-hidden">

    <div class="mb-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Showing {{ filteredData.length }} supplier items
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
                PIC's Name
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Contact Number
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Email
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
                Action
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
              <span class="font-mono text-sm text-gray-900 dark:text-white">
                {{ item.supplierCode }}
              </span>
            </td>

            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.supplierName }}
              </p>
            </td>

            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.manager }}
              </p>
            </td>

            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.contactPhone || item.contact }}
              </p>
            </td>

            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.email || item.emailAddress }}
              </p>
            </td>

            <td class="px-6 py-4">
              <span :class="{
                'px-3 py-1 text-xs rounded-full font-medium': true,
                'bg-green-100 text-green-600': item.status === 'Active',
                'bg-blue-100 text-blue-600': item.status === 'Inactive',
              }">
                {{ item.status }}
              </span>
            </td>

            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.remark || item.remarks || '-' }}
              </p>
            </td>

            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <button
                  @click="editSupplier(item)"
                  class="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  aria-label="Edit"
                  title="Edit Supplier"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="deleteSupplier(item)"
                  class="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  aria-label="Delete"
                  title="Delete Supplier"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
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
        <p>Loading suppliers...</p>
      </div>

      <div v-if="!loading && filteredData.length === 0" class="p-8 text-center text-gray-500">
        <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No suppliers found
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your filters or create a new supplier.
        </p>
      </div>

      <div v-if="error" class="p-8 text-center text-red-500 text-sm">
        <svg class="mx-auto h-12 w-12 text-red-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="font-medium">Error loading suppliers</p>
        <p class="text-xs mt-1">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue"
import Swal from 'sweetalert2'
import { authenticatedFetch } from '@/utils/authenticatedFetch' 

// Props for receiving filters
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
})

// Emits for parent component
const emit = defineEmits(['edit-supplier', 'delete-supplier'])

// State for data and UI
const data = ref([])
const loading = ref(false)
const error = ref(null)
const selectedItems = ref([])
const selectAll = ref(false)

// API endpoint for suppliers
const API_URL = '/api/supplier'

// Function to fetch suppliers from the API
const fetchSuppliers = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await authenticatedFetch(API_URL)

    if (!response.ok) throw new Error("Failed to fetch suppliers")

    const json = await response.json()
    data.value = json || []
  } catch (e) {
    error.value = e.message
    console.error('Error fetching suppliers:', e)
  } finally {
    loading.value = false
  }
}

// Fetch data on component mount
onMounted(() => {
  fetchSuppliers()
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
      filters.supplierCode &&
      !item.supplierCode
        .toLowerCase()
        .includes(filters.supplierCode.toLowerCase())
    ) {
      return false
    }
    if (
      filters.supplierName &&
      !item.supplierName
        .toLowerCase()
        .includes(filters.supplierName.toLowerCase())
    ) {
      return false
    }
    const picName = item.manager || ''
    if (
      filters.picName &&
      !picName
        .toLowerCase()
        .includes(filters.picName.toLowerCase())
    ) {
      return false
    }
    const email = item.email || item.emailAddress || ''
    if (
      filters.email &&
      !email
        .toLowerCase()
        .includes(filters.email.toLowerCase())
    ) {
      return false
    }
    if (filters.status && item.status !== filters.status) {
      return false
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

// Helper function to adjust page after deletion
const adjustPageAfterDeletion = () => {
  // Calculate if current page will be empty after refresh
  const totalItems = filteredData.value.length
  const maxPage = Math.ceil(totalItems / itemsPerPage.value) || 1
  
  // If current page exceeds max pages, adjust to the last valid page
  if (currentPage.value > maxPage) {
    currentPage.value = maxPage
  }
}

// Watch for filter changes and pagination changes to update 'select all' state
watch([() => props.filters, currentPage], () => {
  setTimeout(updateSelectAllState, 0)
}, { deep: true })


// --- Actions ---

const editSupplier = (supplier) => {
  emit('edit-supplier', supplier)
}

const deleteSupplier = async (supplier) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `You are about to delete supplier: ${supplier.supplierName}. This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  })

  if (!result.isConfirmed) {
    return
  }

  try {
    const supplierId = supplier.id || supplier.supplierCode;
    if (!supplierId) {
        throw new Error('Supplier identifier not found.');
    }

    const response = await authenticatedFetch(`api/supplier/${supplierId}`, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to delete supplier')
    }

    Swal.fire({
      title: 'Deleted!',
      text: `Supplier ${supplier.supplierName} has been deleted.`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    })

    emit('delete-supplier', { success: true, data: { supplierName: supplier.supplierName, id: supplier.id } })

    const index = selectedItems.value.indexOf(supplier.id)
    if (index > -1) {
      selectedItems.value.splice(index, 1)
    }

    await fetchSuppliers()
    
    adjustPageAfterDeletion()
  } catch (error) {
    console.error('Error deleting supplier:', error)
    emit('delete-supplier', { success: false, error: error.message })
    Swal.fire('Error', `Failed to delete supplier: ${error.message}`, 'error')
  }
}

// Bulk delete selected suppliers
const bulkDelete = async () => {
  if (!selectedItems.value || selectedItems.value.length === 0) {
    Swal.fire('No Selection', 'Please select at least one supplier to delete.', 'info');
    return { success: false, error: 'No suppliers selected' }
  }

  const confirmResult = await Swal.fire({
    title: 'Confirm Bulk Deletion',
    text: `Are you sure you want to delete ${selectedItems.value.length} selected supplier(s)? This cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, proceed with bulk delete'
  })

  if (!confirmResult.isConfirmed) {
    return { success: false, error: 'Cancelled by user' }
  }

  try {
    const response = await authenticatedFetch(`${API_URL}/bulk-delete`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedItems.value })
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(err || 'Failed to bulk delete suppliers')
    }

    const result = await response.json()

    const deletedCount = Array.isArray(result.deletedIds) ? result.deletedIds.length : 0
    const blocked = result.blocked || []

    selectedItems.value = []
    selectAll.value = false
    await fetchSuppliers()
    
    adjustPageAfterDeletion()

    if (deletedCount > 0 && blocked.length === 0) {
      emit('delete-supplier', { success: true, data: { count: deletedCount } })
      Swal.fire('Success', `${deletedCount} suppliers deleted successfully.`, 'success')
      return { success: true, data: result }
    } else if (deletedCount > 0 && blocked.length > 0) {
      const message = `${deletedCount} deleted, ${blocked.length} blocked due to existing relations`;
      emit('delete-supplier', { success: false, error: message, data: { deletedCount, blocked } })
      Swal.fire('Partial Success', message, 'warning')
      return { success: false, error: message, data: result }
    } else {
        const message = blocked.length > 0 ? `${blocked.length} suppliers were blocked from deletion due to existing relations.` : 'No suppliers were deleted.';
        emit('delete-supplier', { success: false, error: message, data: result })
        Swal.fire('Deletion Failed', message, 'error')
        return { success: false, error: message }
    }

  } catch (error) {
    console.error('Error bulk deleting suppliers:', error)
    emit('delete-supplier', { success: false, error: error.message })
    Swal.fire('Error', `Failed to bulk delete suppliers: ${error.message}`, 'error')
    return { success: false, error: error.message }
  }
}

const refreshData = () => {
  fetchSuppliers()
  selectedItems.value = []
  selectAll.value = false
}

defineExpose({ refreshData, selectedItems, bulkDelete })

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