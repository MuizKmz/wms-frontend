<template>
  <div class="overflow-hidden">
    <!-- Results count -->
    <div class="mb-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Showing {{ filteredData.length }} OQC inspection items
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
                OQC ID
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Date
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Product Code
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Work Order ID
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Inspector
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                QC Parameters Checked
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Results
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
          <!-- Use paginatedData instead of filteredData -->
          <tr v-for="(item, index) in paginatedData" :key="index"
            class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <th>
              <label>
                <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" aria-label="select item" />
              </label>
            </th>
            
            <!-- OQC ID -->
            <td class="px-6 py-4">
              <span
                class="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                {{ item.oqcId }}
              </span>
            </td>

            <!-- Date -->
            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.date }}
              </p>
            </td>

            <!-- Product Code -->
            <td class="px-6 py-4">
              <span
                class="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                {{ item.productCode }}
              </span>
            </td>

            <!-- Work Order ID -->
            <td class="px-6 py-4">
              <span
                class="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                {{ item.workOrderId }}
              </span>
            </td>

            <!-- Inspector -->
            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.inspector }}
              </p>
            </td>

            <!-- QC Parameters Checked -->
            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.qcParametersChecked }}
              </p>
            </td>

            <!-- Results -->
            <td class="px-6 py-4">
              <span :class="getResultStatusClass(item.results)"
                class="inline-flex items-center text-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ item.results }}
              </span>
            </td>

            <!-- Remarks -->
            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.remarks }}
              </p>
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
        <p>Loading OQC items...</p>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && filteredData.length === 0" class="p-8 text-center text-gray-500">
        <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No OQC inspection items found
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your filters or create a new OQC inspection item.
        </p>
      </div>

      <!-- Error -->
      <div v-if="error" class="p-8 text-center text-red-500 text-sm">
        <svg class="mx-auto h-12 w-12 text-red-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="font-medium">Error loading OQC inspection items</p>
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

// Mock data for OQC inspection items based on the image
const mockData = [
  {
    oqcId: "OQC-0001",
    date: "2025-06-15",
    productCode: "PRD-1001",
    workOrderId: "JO-240601",
    inspector: "Aiman Syahmi",
    qcParametersChecked: "Dimension, Appearance",
    results: "Pass",
    remarks: "Meets packaging & spec size"
  },
  {
    oqcId: "OQC-0002",
    date: "2025-06-15",
    productCode: "PRD-1002",
    workOrderId: "JO-240602",
    inspector: "Tan Mei Ling",
    qcParametersChecked: "Weight, Surface finish",
    results: "Fail",
    remarks: "Rough texture found"
  },
  {
    oqcId: "OQC-0003",
    date: "2025-06-16",
    productCode: "PRD-1003",
    workOrderId: "JO-240603",
    inspector: "Wong Jin",
    qcParametersChecked: "Hardness, Color",
    results: "Pass",
    remarks: "Within acceptable range"
  },
  {
    oqcId: "OQC-0004",
    date: "2025-06-16",
    productCode: "PRD-1004",
    workOrderId: "JO-240604",
    inspector: "Siti Aisyah",
    qcParametersChecked: "Visual, Dimension, Packaging",
    results: "Pass",
    remarks: "Clean and properly labeled"
  },
  {
    oqcId: "OQC-0005",
    date: "2025-06-17",
    productCode: "PRD-1005",
    workOrderId: "JO-240605",
    inspector: "Karthik Rao",
    qcParametersChecked: "Functionality, Labeling",
    results: "Fail",
    remarks: "Missing barcode label"
  },
  {
    oqcId: "OQC-0006",
    date: "2025-06-17",
    productCode: "PRD-1006",
    workOrderId: "JO-240606",
    inspector: "Nurul Amirah",
    qcParametersChecked: "Dimension, Color, Surface Finish",
    results: "Pass",
    remarks: "No issues found"
  },
  {
    oqcId: "OQC-0007",
    date: "2025-06-18",
    productCode: "PRD-1007",
    workOrderId: "JO-240607",
    inspector: "Ahmad Zaki",
    qcParametersChecked: "Packaging Integrity, Appearance",
    results: "Pass",
    remarks: "Good packaging"
  }
]

const fetchData = async (filters = {}) => {
  loading.value = true
  error.value = null

  try {
    // Try to fetch from API first
    const res = await fetch("/api/oqc-inspection-items")
    if (!res.ok) throw new Error("Failed to fetch OQC inspection items")

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
      filters.oqcId &&
      !item.oqcId
        .toLowerCase()
        .includes(filters.oqcId.toLowerCase())
    ) {
      return false
    }
    if (
      filters.productCode &&
      !item.productCode
        .toLowerCase()
        .includes(filters.productCode.toLowerCase())
    ) {
      return false
    }
    if (
      filters.workOrderId &&
      !item.workOrderId
        .toLowerCase()
        .includes(filters.workOrderId.toLowerCase())
    ) {
      return false
    }
    if (
      filters.inspector &&
      !item.inspector
        .toLowerCase()
        .includes(filters.inspector.toLowerCase())
    ) {
      return false
    }
    if (filters.date && item.date !== filters.date) {
      return false
    }
    if (
      filters.results &&
      !item.results
        .toLowerCase()
        .includes(filters.results.toLowerCase())
    ) {
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

// Result Status styling
const getResultStatusClass = (result) => {
  if (result.toLowerCase() === 'pass') {
    return "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900 dark:text-green-300"
  } else if (result.toLowerCase() === 'fail') {
    return "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900 dark:text-red-300"
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