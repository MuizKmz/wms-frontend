<template>
  <div class="overflow-hidden">
    <!-- Results count -->
    <div class="mb-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Showing {{ filteredData.length }} moulds
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
                Machine Name
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Mould Name
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Mould Code
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Cavity Count
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Life Limit (Cycles)
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Total Cycles
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Status
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Remaining Life
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Last Used Date
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
          <tr v-for="(item, index) in paginatedData" :key="index"
            class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <th>
              <label>
                <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" aria-label="select mould" />
              </label>
            </th>

            <!-- Machine Name -->
            <td class="px-6 py-4">
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ item.machine?.name || 'N/A' }}
              </span>
            </td>

            <!-- Mould Name -->
            <td class="px-6 py-4">
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ item.name || 'N/A' }}
              </span>
            </td>

            <!-- Mould Code -->
            <td class="px-6 py-4">
              <span class="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                {{ item.code || 'N/A' }}
              </span>
            </td>

            <!-- Cavity Count -->
            <td class="px-6 py-4">
              <span class="text-sm text-gray-900 dark:text-white">
                {{ item.cavityCount || 'N/A' }}
              </span>
            </td>

            <!-- Life Limit (Cycles) -->
            <td class="px-6 py-4">
              <span class="text-sm text-gray-900 dark:text-white">
                {{ item.lifeLimit ? item.lifeLimit.toLocaleString() : 'N/A' }}
              </span>
            </td>

            <!-- Total Cycles -->
            <td class="px-6 py-4">
              <span class="text-sm text-gray-900 dark:text-white">
                {{ item.totalCycles ? item.totalCycles.toLocaleString() : 'N/A' }}
              </span>
            </td>

            <!-- Status -->
            <td class="px-6 py-4">
              <span :class="getStatusClass(item.status)"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ item.status || 'N/A' }}
              </span>
            </td>

            <!-- Remaining Life -->
            <td class="px-6 py-4">
              <span :class="getRemainingLifeClass(item.remainingLife, item.lifeLimit)"
                class="text-sm font-medium">
                {{ item.remainingLife ? item.remainingLife.toLocaleString() : '-' }}
              </span>
            </td>

            <!-- Last Used Date -->
            <td class="px-6 py-4">
              <span class="text-sm text-gray-900 dark:text-white">
                {{ item.lastUsedDate || 'N/A' }}
              </span>
            </td>

            <!-- Remarks -->
            <td class="px-6 py-4">
              <span class="text-sm text-gray-900 dark:text-white">
                {{ item.remarks || '-' }}
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

      <!-- 🔹 FlyonUI Pagination -->
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
        <p>Loading moulds...</p>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && filteredData.length === 0" class="p-8 text-center text-gray-500">
        <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No moulds found
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your filters or add new moulds.
        </p>
      </div>

      <!-- Error -->
      <div v-if="error" class="p-8 text-center text-red-500 text-sm">
        <svg class="mx-auto h-12 w-12 text-red-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="font-medium">Error loading moulds</p>
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

// Mock data for moulds based on the image
const mockData = [
  {
    machineName: "Injection Press 1",
    mouldName: "Valve Housing A",
    mouldCode: "VHA-22",
    cavityCount: 4,
    lifeLimit: 32000,
    totalCycles: 15200,
    status: "Active",
    remainingLife: 16800,
    lastUsedDate: "2025-06-14",
    remarks: "-"
  },
  {
    machineName: "Compression M2",
    mouldName: "Diaphragm Seal",
    mouldCode: "DSP-09",
    cavityCount: 2,
    lifeLimit: 20000,
    totalCycles: 5500,
    status: "Active",
    remainingLife: 14500,
    lastUsedDate: "2025-06-15",
    remarks: "-"
  },
  {
    machineName: "Injection Press 2",
    mouldName: "Rubber Boot B",
    mouldCode: "RBB-88",
    cavityCount: 1,
    lifeLimit: 10000,
    totalCycles: 18900,
    status: "Warning",
    remainingLife: null,
    lastUsedDate: "2025-06-13",
    remarks: "Replace soon"
  },
  {
    machineName: "Auto Press",
    mouldName: "Gasket Mould",
    mouldCode: "GST-45",
    cavityCount: 6,
    lifeLimit: 19000,
    totalCycles: 3200,
    status: "Active",
    remainingLife: 15800,
    lastUsedDate: "2025-06-14",
    remarks: "New mould"
  },
  {
    machineName: "Compression M3",
    mouldName: "O-Ring Set",
    mouldCode: "ORS-33",
    cavityCount: 8,
    lifeLimit: 25000,
    totalCycles: 12000,
    status: "Maintenance",
    remainingLife: 13000,
    lastUsedDate: "2025-06-12",
    remarks: "Sent for maintenance"
  }
]

const fetchData = async (filters = {}) => {
  loading.value = true
  error.value = null

  try {
    // Try to fetch from API first
    const res = await fetch("/api/moulds")
    if (!res.ok) throw new Error("Failed to fetch moulds")

    const apiData = await res.json()
    data.value = apiData
    console.log("API data loaded:", apiData)
  } catch (err) {
    // If API fails, use mock data
    console.warn("API Error, using mock data:", err.message)
    data.value = [...mockData] // Use spread operator to ensure reactivity
    console.log("Mock data assigned:", data.value)
    error.value = null // Don't show error if we have mock data
  } finally {
    loading.value = false
  }
}

// Computed property for filtered data
const filteredData = computed(() => {
  console.log("Computing filtered data, raw data:", data.value)
  console.log("Current filters:", props.filters)

  if (!props.filters) return data.value

  return data.value.filter((item) => {
    const filters = props.filters

    if (
      filters.machineName &&
      !item.machineName
        .toLowerCase()
        .includes(filters.machineName.toLowerCase())
    ) {
      return false
    }
    if (
      filters.mouldName &&
      !item.mouldName
        .toLowerCase()
        .includes(filters.mouldName.toLowerCase())
    ) {
      return false
    }
    if (
      filters.mouldCode &&
      !item.mouldCode
        .toLowerCase()
        .includes(filters.mouldCode.toLowerCase())
    ) {
      return false
    }
    if (
      filters.status &&
      item.status.toLowerCase() !== filters.status.toLowerCase()
    ) {
      return false
    }

    return true
  })
})

// 🔹 Pagination
const currentPage = ref(1)
const itemsPerPage = ref(5)
const totalPages = computed(() =>
  Math.ceil(filteredData.value.length / itemsPerPage.value)
)
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  const result = filteredData.value.slice(start, end)
  console.log("Paginated data:", result)
  return result
})
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Status styling
const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900 dark:text-green-300"
    case "warning":
      return "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900 dark:text-red-300"
    case "maintenance":
      return "bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300"
    default:
      return "bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-300"
  }
}

// Remaining life color coding
const getRemainingLifeClass = (remainingLife, lifeLimit) => {
  if (!remainingLife || !lifeLimit) {
    return "text-gray-500 dark:text-gray-400"
  }

  const percentage = (remainingLife / lifeLimit) * 100

  if (percentage <= 10) {
    return "text-red-600 dark:text-red-400 font-bold"
  } else if (percentage <= 25) {
    return "text-yellow-600 dark:text-yellow-400 font-medium"
  } else {
    return "text-gray-900 dark:text-white"
  }
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
  console.log("Component mounted, mock data:", mockData)
  fetchData()

  // Debug: Check data after a short delay
  setTimeout(() => {
    console.log("Data after fetchData:", data.value)
    console.log("Filtered data:", filteredData.value)
  }, 100)
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
