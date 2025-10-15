<template>
  <div class="overflow-hidden">

    <div class="mb-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Showing {{ filteredData.length }} EPC records
      </p>
    </div>

    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="min-w-full table-auto">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th class="px-6 py-3 text-left w-12">
              <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" aria-label="select all"
                :checked="selectAll" @change="toggleSelectAll" />
            </th>

            <th class="px-6 py-3 text-left min-w-[200px]">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                EPC Code
              </p>
            </th>

            <th class="px-6 py-3 text-left min-w-[100px]">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Corp Code
              </p>
            </th>

            <th class="px-6 py-3 text-left min-w-[120px]">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                SKU Code
              </p>
            </th>

            <th class="px-6 py-3 text-left min-w-[120px]">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Serial Number
              </p>
            </th>

            <th class="px-6 py-3 text-left min-w-[100px]">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Batch No.
              </p>
            </th>

            <th class="px-6 py-3 text-left min-w-[150px]">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Batch Name
              </p>
            </th>

            <th class="px-6 py-3 text-left min-w-[100px]">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Status
              </p>
            </th>

            <th class="px-6 py-3 text-left min-w-[150px]">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Created Time
              </p>
            </th>

          </tr>
        </thead>

        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="epc in visibleRows" :key="epc.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
            @click="viewEPC(epc)">

            <td class="px-6 py-4" @click.stop>
              <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" aria-label="select item"
                :checked="isSelected(epc.uniqueId)" @change="toggleItemSelection(epc.uniqueId)" />
            </td>

            <td class="px-6 py-4">
              <span class="text-left font-mono text-xs text-blue-600 dark:text-blue-400 hover:underline break-all">
                {{ epc.epcCode || '-' }}
              </span>
            </td>

            <td class="px-6 py-4">
              <span class="font-mono text-sm text-gray-900 dark:text-white">
                {{ parseEPCCode(epc.epcCode).corpCode || epc.corpCode?.code || '-' }}
              </span>
            </td>

            <td class="px-6 py-4">
              <span class="font-mono text-sm text-gray-900 dark:text-white">
                {{ parseEPCCode(epc.epcCode).skuCode || epc.product?.skuCode || '-' }}
              </span>
            </td>

            <td class="px-6 py-4">
              <span class="font-mono text-sm font-semibold text-green-600 dark:text-green-400">
                {{ parseEPCCode(epc.epcCode).serialNumber || '-' }}
              </span>
            </td>

            <td class="px-6 py-4">
              <span class="text-sm text-gray-900 dark:text-white">
                {{ epc.batchNumber || '-' }}
              </span>
            </td>

            <td class="px-6 py-4">
              <span class="text-sm text-gray-900 dark:text-white">
                {{ epc.batchName || '-' }}
              </span>
            </td>

            <td class="px-6 py-4">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getStatusClass(epc.status)">
                {{ epc.status || 'GENERATED' }}
              </span>
            </td>

            <td class="px-6 py-4">
              <span class="text-sm text-gray-900 dark:text-white">
                {{ formatDateTime(epc.createdAt) || '-' }}
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
            <button v-for="page in visiblePages" :key="page" type="button"
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
        <p>Loading EPC records...</p>
      </div>

      <div v-if="!loading && filteredData.length === 0" class="p-8 text-center text-gray-500">
        <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No EPC records found
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your filters or generate a new EPC batch.
        </p>
      </div>

      <div v-if="error" class="p-8 text-center text-red-500 text-sm">
        <svg class="mx-auto h-12 w-12 text-red-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="font-medium">Error loading EPC records</p>
        <p class="text-xs mt-1">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue"
import Swal from 'sweetalert2'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['view-epc', 'bulk-delete-epc'])

const data = ref([])
const loading = ref(false)
const error = ref(null)
const selectedItems = ref([])
const selectAll = ref(false)

const API_URL = '/api/epc'

// --- Data Fetching ---
const fetchEPCs = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(API_URL)

    if (!response.ok) throw new Error("Failed to fetch EPC records")

    const json = await response.json()
    data.value = (json || []).map(epc => ({
      ...epc,
      uniqueId: `E-${epc.id || Math.random()}`,
    }))
  } catch (e) {
    error.value = e.message
    console.error('Error fetching EPCs:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchEPCs()
})

// --- EPC Code Parser ---
/**
 * Parse EPC code format: corpCode(4) + skuCode(8) + date(6) + serialNumber(6) = 24 chars
 * Example: AA0012345678151025000001
 * - Corp Code: AA00 (4 chars)
 * - SKU Code: 12345678 (8 chars)
 * - Date: 151025 (DDMMYY - 6 chars)
 * - Serial Number: 000001 (6 chars)
 */
const parseEPCCode = (epcCode) => {
  if (!epcCode || epcCode.length < 24) {
    return {
      corpCode: null,
      skuCode: null,
      date: null,
      serialNumber: null
    }
  }

  return {
    corpCode: epcCode.substring(0, 4),           // Characters 0-3
    skuCode: epcCode.substring(4, 12),          // Characters 4-11
    date: epcCode.substring(12, 18),            // Characters 12-17
    serialNumber: epcCode.substring(18, 24)     // Characters 18-23 (last 6 digits)
  }
}

// --- Status Badge Styling ---
const getStatusClass = (status) => {
  const statusMap = {
    GENERATED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    RECEIVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    DELIVERED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    INBOUND: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  }
  return statusMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
}

// --- Filtering & Pagination Logic ---
const filteredData = computed(() => {
  return data.value.filter((item) => {
    if (
      props.filters.epcCode &&
      !item.epcCode.toLowerCase().includes(props.filters.epcCode.toLowerCase())
    ) return false
    if (
      props.filters.batchNumber &&
      (!item.batchNumber || !String(item.batchNumber).toLowerCase().includes(props.filters.batchNumber.toLowerCase()))
    ) return false
    if (
      props.filters.skuCode &&
      (!item.product?.skuCode || !item.product.skuCode.toLowerCase().includes(props.filters.skuCode.toLowerCase()))
    ) return false
    if (
      props.filters.batchName &&
      (!item.batchName || !item.batchName.toLowerCase().includes(props.filters.batchName.toLowerCase()))
    ) return false

    return true
  })
})

const currentPage = ref(1)
const itemsPerPage = ref(10)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredData.value.slice(start, end)
})

const visibleRows = computed(() => paginatedData.value)

const totalPages = computed(() =>
  Math.ceil(filteredData.value.length / itemsPerPage.value)
)

const visiblePages = computed(() => {
  const maxPages = 5;
  const pages = [];
  const startPage = Math.max(1, currentPage.value - Math.floor(maxPages / 2));
  const endPage = Math.min(totalPages.value, startPage + maxPages - 1);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
});

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

watch(() => props.filters, () => {
  currentPage.value = 1
}, { deep: true })

// --- Checkbox/Selection Logic ---
const allVisibleItemIds = computed(() => {
  return visibleRows.value.map(row => row.uniqueId)
})

const toggleSelectAll = () => {
  const visibleIds = allVisibleItemIds.value
  if (selectAll.value) {
    selectedItems.value = selectedItems.value.filter(id => !visibleIds.includes(id))
    selectAll.value = false
  } else {
    visibleIds.forEach(id => {
      if (!selectedItems.value.includes(id)) {
        selectedItems.value.push(id)
      }
    })
    selectAll.value = true
  }
}

const toggleItemSelection = (itemId) => {
  const index = selectedItems.value.indexOf(itemId)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(itemId)
  }
  updateSelectAllState()
}

const isSelected = (itemId) => {
  return selectedItems.value.includes(itemId)
}

const updateSelectAllState = () => {
  const visibleIds = allVisibleItemIds.value
  if (visibleIds.length === 0) {
    selectAll.value = false
    return
  }
  selectAll.value = visibleIds.every(id => selectedItems.value.includes(id))
}

watch(paginatedData, updateSelectAllState, { deep: true, immediate: true })

// --- Utility Functions ---
const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    const pad = (num) => String(num).padStart(2, '0')

    const year = date.getFullYear()
    const month = pad(date.getMonth() + 1)
    const day = pad(date.getDate())
    const hour = pad(date.getHours())
    const minute = pad(date.getMinutes())

    return `${day}/${month}/${year} ${hour}:${minute}`
  } catch (e) {
    return dateString;
  }
}

// --- Actions & Exposed Methods ---
const viewEPC = (epc) => {
  emit('view-epc', epc)
}

// Bulk delete selected EPCs
const bulkDelete = async () => {
  if (!selectedItems.value || selectedItems.value.length === 0) {
    return { success: false, error: 'No items selected', data: { deletedCount: 0 } }
  }

  const confirmResult = await Swal.fire({
    title: 'Confirm Bulk Deletion',
    text: `Are you sure you want to delete ${selectedItems.value.length} selected EPC record(s)? This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, proceed with bulk delete'
  })

  if (!confirmResult.isConfirmed) {
    return { success: false, error: 'Cancelled by user', data: { deletedCount: 0 } }
  }

  try {
    const epcIds = selectedItems.value
      .filter(id => id.startsWith('E-'))
      .map(id => parseInt(id.replace('E-', '')))

    const response = await fetch(`${API_URL}/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: epcIds }) // Changed from 'epcIds' to 'ids'
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(err || 'Failed to bulk delete EPCs')
    }

    const result = await response.json()

    selectedItems.value = []
    selectAll.value = false
    await fetchEPCs()
    adjustPageAfterDeletion()

    return { success: true, data: result }

  } catch (error) {
    console.error('Error bulk deleting EPCs:', error)
    return { success: false, error: error.message, data: { deletedCount: 0 } }
  }
}

const adjustPageAfterDeletion = () => {
  const totalItems = filteredData.value.length
  const maxPage = Math.ceil(totalItems / itemsPerPage.value) || 1

  if (currentPage.value > maxPage) {
    currentPage.value = maxPage
  }
}

const refreshData = () => {
  fetchEPCs()
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

tbody tr {
  cursor: pointer;
}
</style>
