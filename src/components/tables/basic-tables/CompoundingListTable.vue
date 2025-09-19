<template>
  <div class="overflow-hidden">
    <!-- Results count -->
    <div class="mb-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Showing {{ filteredData.length }} material items
      </p>
    </div>

    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="min-w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th>
              <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" aria-label="select all" />
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Material Code
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Compound Lot Number
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Quantity Required (kg)
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Issued By
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Date Issued
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Material Name
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Preparation Status
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Verification Status
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Approval Status
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
          <!-- Use paginatedData instead of filteredData -->
          <tr v-for="(item, index) in paginatedData" :key="index"
            class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <th>
              <label>
                <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" aria-label="select item" />
              </label>
            </th>
            
            <!-- Material Code -->
            <td class="px-6 py-4">
              <span
                class="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                {{ item.materialCode }}
              </span>
            </td>

            <!-- Compound Lot Number -->
            <td class="px-6 py-4">
              <span
                class="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                {{ item.compoundLotNumber }}
              </span>
            </td>

            <!-- Quantity Required -->
            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.quantityRequired }}
              </p>
            </td>

            <!-- Issued By -->
            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.issuedBy }}
              </p>
            </td>

            <!-- Date Issued -->
            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.dateIssued }}
              </p>
            </td>

            <!-- Material Name -->
            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.materialName }}
              </p>
            </td>

            <!-- Preparation Status -->
            <td class="px-6 py-4">
              <span :class="getPreparationStatusClass(item.preparationStatus)"
                class="inline-flex items-center text-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ item.preparationStatus }}
              </span>
            </td>

            <!-- Verification Status -->
            <td class="px-6 py-4">
              <span :class="getVerificationStatusClass(item.verificationStatus)"
                class="inline-flex items-center text-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ item.verificationStatus }}
              </span>
            </td>

            <!-- Approval Status -->
            <td class="px-6 py-4">
              <span :class="getApprovalStatusClass(item.approvalStatus)"
                class="inline-flex items-center text-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ item.approvalStatus }}
              </span>
            </td>

            <!-- Actions -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <button class="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  aria-label="View">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button class="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  aria-label="Edit">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button class="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  aria-label="Delete">
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
        <p>Loading material items...</p>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && filteredData.length === 0" class="p-8 text-center text-gray-500">
        <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No material items found
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your filters or create a new material item.
        </p>
      </div>

      <!-- Error -->
      <div v-if="error" class="p-8 text-center text-red-500 text-sm">
        <svg class="mx-auto h-12 w-12 text-red-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="font-medium">Error loading material items</p>
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

const data = ref([])
const loading = ref(false)
const error = ref(null)

// Mock data for material items based on the image
const mockData = [
  {
    materialCode: "SWRM-SIL-60BK8",
    compoundLotNumber: "MYCP250814001",
    quantityRequired: "1.20",
    issuedBy: "Alice Smith",
    dateIssued: "2024-05-20",
    materialName: "MCD0100 MHB564",
    preparationStatus: "Material Preparation Done",
    verificationStatus: "Verified Material Preparation",
    approvalStatus: "Approved"
  },
  {
    materialCode: "SWRM-SIL-07BK",
    compoundLotNumber: "MYCP250814002",
    quantityRequired: "2.48",
    issuedBy: "Jane Doe",
    dateIssued: "2024-05-21",
    materialName: "MKL9600 CHN2400 CKL24",
    preparationStatus: "Material Preparation Done",
    verificationStatus: "Reject Material Preparation",
    approvalStatus: "Reject"
  },
  {
    materialCode: "SWRM-6BK8",
    compoundLotNumber: "MYCP250814003",
    quantityRequired: "5.44",
    issuedBy: "John Smith",
    dateIssued: "2024-05-22",
    materialName: "MCD0100 MHB564",
    preparationStatus: "Material Preparation in process",
    verificationStatus: "Material Preparation in QC",
    approvalStatus: "Waiting for Approval"
  },
  {
    materialCode: "SWRM-SIL-12BK",
    compoundLotNumber: "MYCP250814004",
    quantityRequired: "3.75",
    issuedBy: "Alice Smith",
    dateIssued: "2024-05-23",
    materialName: "MKL9600 CHN2400",
    preparationStatus: "Material Preparation Done",
    verificationStatus: "Verified Material Preparation",
    approvalStatus: "Approved"
  },
  {
    materialCode: "SWRM-SIL-08BK",
    compoundLotNumber: "MYCP250814005",
    quantityRequired: "1.85",
    issuedBy: "Bob Johnson",
    dateIssued: "2024-05-24",
    materialName: "MCD0100 ABC123",
    preparationStatus: "Material Preparation in process",
    verificationStatus: "Material Preparation in QC",
    approvalStatus: "Waiting for Approval"
  },
  {
    materialCode: "SWRM-SIL-15BK",
    compoundLotNumber: "MYCP250814006",
    quantityRequired: "4.20",
    issuedBy: "Charlie Brown",
    dateIssued: "2024-05-25",
    materialName: "MKL9600 XYZ789",
    preparationStatus: "Material Preparation Done",
    verificationStatus: "Reject Material Preparation",
    approvalStatus: "Reject"
  }
]

const fetchData = async (filters = {}) => {
  loading.value = true
  error.value = null

  try {
    // Try to fetch from API first
    const res = await fetch("/api/material-items")
    if (!res.ok) throw new Error("Failed to fetch material items")

    const apiData = await res.json()
    data.value = apiData
  } catch (err) {
    // If API fails, use mock data
    console.warn("API Error, using mock data:", err.message)
    data.value = mockData
    error.value = null // Don't show error if we have mock data
  } finally {
    loading.value = false
  }
}

// Computed property for filtered data
const filteredData = computed(() => {
  if (!props.filters) return data.value

  return data.value.filter((item) => {
    const filters = props.filters

    if (
      filters.compoundingOrderId &&
      !item.compoundLotNumber
        .toLowerCase()
        .includes(filters.compoundingOrderId.toLowerCase())
    ) {
      return false
    }
    if (
      filters.materialCode &&
      !item.materialCode
        .toLowerCase()
        .includes(filters.materialCode.toLowerCase())
    ) {
      return false
    }
    if (
      filters.issuedBy &&
      !item.issuedBy
        .toLowerCase()
        .includes(filters.issuedBy.toLowerCase())
    ) {
      return false
    }
    if (filters.dateIssued && item.dateIssued !== filters.dateIssued) {
      return false
    }

    return true
  })
})

// Pagination
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

// Preparation Status styling
const getPreparationStatusClass = (status) => {
  if (status.toLowerCase().includes('done')) {
    return "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900 dark:text-green-300"
  } else if (status.toLowerCase().includes('process')) {
    return "bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300"
  }
  return "bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-300"
}

// Verification Status styling
const getVerificationStatusClass = (status) => {
  if (status.toLowerCase().includes('verified')) {
    return "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900 dark:text-green-300"
  } else if (status.toLowerCase().includes('reject')) {
    return "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900 dark:text-red-300"
  } else if (status.toLowerCase().includes('qc')) {
    return "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900 dark:text-blue-300"
  }
  return "bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-300"
}

// Approval Status styling
const getApprovalStatusClass = (status) => {
  if (status.toLowerCase() === 'approved') {
    return "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900 dark:text-green-300"
  } else if (status.toLowerCase() === 'reject') {
    return "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900 dark:text-red-300"
  } else if (status.toLowerCase().includes('waiting')) {
    return "bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300"
  }
  return "bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-300"
}

// Watch for filter changes
watch(
  () => props.filters,
  (newFilters) => {
    console.log("Filters updated:", newFilters)
    currentPage.value = 1 // reset to first page on filter change
  },
  { deep: true }
)

onMounted(() => {
  fetchData()
})
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