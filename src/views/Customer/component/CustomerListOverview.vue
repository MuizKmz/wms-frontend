<template>
  <div class="overflow-hidden">

    <div class="mb-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Showing {{ filteredData.length }} customers
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
                Customer ID
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Customer Name
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Contact Person
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Email Address
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Address
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                City
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Status
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
                {{ item.customerId || item.customerCode }}
              </span>
            </td>

            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.customerName || item.name }}
              </p>
            </td>

            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.contactPerson || item.contact }}
              </p>
            </td>

            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.emailAddress || item.email }}
              </p>
            </td>

            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.address || '-' }}
              </p>
            </td>

            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.city || '-' }}
              </p>
            </td>

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

            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <button
                  @click="editItem(item)"
                  class="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  aria-label="Edit"
                  title="Edit Customer"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="deleteItem(item)"
                  class="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  aria-label="Delete"
                  title="Delete Customer"
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
        <p>Loading customers...</p>
      </div>

      <div v-if="!loading && filteredData.length === 0" class="p-8 text-center text-gray-500">
        <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No customers found
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your filters or create a new customer.
        </p>
      </div>

      <div v-if="error" class="p-8 text-center text-red-500 text-sm">
        <svg class="mx-auto h-12 w-12 text-red-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="font-medium">Error loading customers</p>
        <p class="text-xs mt-1">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue"
import Swal from 'sweetalert2'

// Props for receiving filters
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
})

// Emits for parent component
const emit = defineEmits(['edit-customer', 'delete-customer'])

// State for data and UI
const data = ref([])
const loading = ref(false)
const error = ref(null)
const selectedItems = ref([])
const selectAll = ref(false)

// API endpoint for Customers
const API_URL = '/api/customer'

// Function to fetch customers from the API
const fetchItems = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(API_URL)

    if (!response.ok) throw new Error("Failed to fetch customers")

    const json = await response.json()
    data.value = json || []
  } catch (e) {
    error.value = e.message
    console.error('Error fetching customers:', e)
  } finally {
    loading.value = false
  }
}

// Fetch data on component mount
onMounted(() => {
  fetchItems()
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

// Function to safely normalize and lowercase strings for comparison
const normalize = (value) => (value || '').toString().toLowerCase()

// Computed property for filtered data (***FIXED LOGIC HERE***)
const filteredData = computed(() => {
  if (!props.filters) return data.value

  const filters = props.filters
  const normalize = (value) => (value || '').toString().toLowerCase()

  return data.value.filter((item) => {
    
    // 1. Customer ID filter (using 'customerId' key from the filter component)
    const itemCustomerId = normalize(item.customerId || item.customerCode)
    if (filters.customerId && !itemCustomerId.includes(normalize(filters.customerId))) {
      return false
    }
    
    // 2. Customer Name filter (using 'customerName' key from the filter component)
    const itemCustomerName = normalize(item.customerName || item.name)
    if (filters.customerName && !itemCustomerName.includes(normalize(filters.customerName))) {
      return false
    }

    // 3. Email Address filter (using 'email' key from the filter component)
    // Checks item.emailAddress or item.email against filters.email
    const itemEmail = normalize(item.emailAddress || item.email)
    if (filters.email && !itemEmail.includes(normalize(filters.email))) {
      return false
    }

    // 4. Status filter (using 'status' key from the filter component)
    // This must be an exact match (or case-insensitive exact match) if a status is selected
    if (filters.status && normalize(item.status) !== normalize(filters.status)) {
      return false
    }

    // Optional: If you had a Contact Person or City filter in your filter component, 
    // you would add them here. They were in the original list but not in your filter component's data.

    // If all checks pass, include the item
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

// Watch for filter changes and pagination changes to update 'select all' state
watch([() => props.filters, currentPage], () => {
  // Reset to page 1 on filter change
  currentPage.value = 1
  setTimeout(updateSelectAllState, 0)
}, { deep: true })

// --- Actions ---

const editItem = (item) => {
  emit('edit-customer', item)
}

const deleteItem = async (item) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `You are about to delete customer: ${item.customerName || item.name}. This action cannot be undone.`,
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
    const itemId = item.id || item.customerId
    if (!itemId) {
      throw new Error('Customer identifier not found.')
    }

    const response = await fetch(`${API_URL}/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to delete customer')
    }

    Swal.fire({
      title: 'Deleted!',
      text: `Customer ${item.customerName || item.name} has been deleted.`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    })

    emit('delete-customer', { success: true, data: { customerName: item.customerName || item.name, id: item.id } })

    const index = selectedItems.value.indexOf(item.id)
    if (index > -1) {
      selectedItems.value.splice(index, 1)
    }

    await fetchItems()
  } catch (error) {
    console.error('Error deleting customer:', error)
    emit('delete-customer', { success: false, error: error.message })
    Swal.fire('Error', `Failed to delete customer: ${error.message}`, 'error')
  }
}

// Bulk delete selected items
const bulkDelete = async () => {
  if (!selectedItems.value || selectedItems.value.length === 0) {
    Swal.fire('No Selection', 'Please select at least one customer to delete.', 'info')
    return { success: false, error: 'No items selected' }
  }

  const confirmResult = await Swal.fire({
    title: 'Confirm Bulk Deletion',
    text: `Are you sure you want to delete ${selectedItems.value.length} selected customer(s)? This cannot be undone.`,
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
    const response = await fetch(`${API_URL}/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedItems.value })
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(err || 'Failed to bulk delete customers')
    }

    const result = await response.json()

    const deletedCount = Array.isArray(result.deletedIds) ? result.deletedIds.length : 0
    const blocked = result.blocked || []

    selectedItems.value = []
    selectAll.value = false
    await fetchItems()

    if (deletedCount > 0 && blocked.length === 0) {
      emit('delete-customer', { success: true, data: { count: deletedCount, customerName: 'Customer' } })
      Swal.fire('Success', `${deletedCount} customers deleted successfully.`, 'success')
      return { success: true, data: result }
    } else if (deletedCount > 0 && blocked.length > 0) {
      const message = `${deletedCount} deleted, ${blocked.length} blocked due to existing relations`
      emit('delete-customer', { success: false, error: message, data: { deletedCount, blocked } })
      Swal.fire('Partial Success', message, 'warning')
      return { success: false, error: message, data: result }
    } else {
      const message = blocked.length > 0 ? `${blocked.length} customers were blocked from deletion due to existing relations.` : 'No customers were deleted.'
      emit('delete-customer', { success: false, error: message, data: result })
      Swal.fire('Deletion Failed', message, 'error')
      return { success: false, error: message }
    }

  } catch (error) {
    console.error('Error bulk deleting customers:', error)
    emit('delete-customer', { success: false, error: error.message })
    Swal.fire('Error', `Failed to bulk delete customers: ${error.message}`, 'error')
    return { success: false, error: error.message }
  }
}

// Expose methods/state for parent component
const refreshData = () => {
  fetchItems()
  selectedItems.value = []
  selectAll.value = false
}

defineExpose({ refreshData, selectedItems, bulkDelete })

// Watch for filter changes
watch(
  () => props.filters,
  (newFilters) => {
    console.log("Filters updated:", newFilters)
    currentPage.value = 1 // Crucial: Reset to first page on filter change
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