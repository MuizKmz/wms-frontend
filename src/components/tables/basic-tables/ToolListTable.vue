<template>
  <div class="overflow-hidden">
    <!-- Results count -->
    <div class="mb-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Showing {{ filteredData.length }} tools
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
                Tool ID
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Tool Name
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Machine Name
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Tool Type
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Start Usage Date
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Total Cycle Used
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Cycle Limit
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Remaining Life
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Last Maintenance Date
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
          <!-- Use paginatedData instead of filteredData -->
          <tr v-for="(item, index) in paginatedData" :key="index"
            class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <th>
              <label>
                <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" aria-label="select item" />
              </label>
            </th>
            
            <!-- Tool ID -->
            <td class="px-6 py-4">
              <span
                class="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                {{ item.toolId }}
              </span>
            </td>

            <!-- Tool Name -->
            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white font-medium">
                {{ item.toolName }}
              </p>
            </td>

            <!-- Machine Name -->
            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.machineName }}
              </p>
            </td>

            <!-- Tool Type -->
            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.toolType }}
              </p>
            </td>

            <!-- Start Usage Date -->
            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.startUsageDate }}
              </p>
            </td>

            <!-- Total Cycle Used -->
            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white font-medium">
                {{ (item.totalCycleUsed || 0).toLocaleString() }}
              </p>
            </td>

            <!-- Cycle Limit -->
            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ (item.cycleLimit || 0).toLocaleString() }}
              </p>
            </td>

            <!-- Remaining Life -->
            <td class="px-6 py-4">
              <p class="text-sm font-medium" :class="getRemainingLifeClass(item.remainingLife || 0)">
                {{ (item.remainingLife || 0).toLocaleString() }}
              </p>
            </td>

            <!-- Last Maintenance Date -->
            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.lastMaintenanceDate }}
              </p>
            </td>

            <!-- Status -->
            <td class="px-6 py-4">
              <span :class="getStatusClass(item.status)"
                class="inline-flex items-center text-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ item.status }}
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
        <p>Loading tools...</p>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && filteredData.length === 0" class="p-8 text-center text-gray-500">
        <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No tools found
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your filters or add a new tool.
        </p>
      </div>

      <!-- Error -->
      <div v-if="error" class="p-8 text-center text-red-500 text-sm">
        <svg class="mx-auto h-12 w-12 text-red-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="font-medium">Error loading tools</p>
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

// Mock data for tool management based on the image
const mockData = [
  {
    toolId: "T-001",
    toolName: "Core Pin A1",
    machineName: "Injection Press 1",
    toolType: "Core Pin",
    startUsageDate: "2024-12-01",
    totalCycleUsed: 12500,
    cycleLimit: 20000,
    remainingLife: 7500,
    lastMaintenanceDate: "2025-06-01",
    status: "Normal"
  },
  {
    toolId: "T-002",
    toolName: "Curing Tool B2",
    machineName: "Curing Machine 2",
    toolType: "Curing Tool",
    startUsageDate: "2025-01-15",
    totalCycleUsed: 18200,
    cycleLimit: 20000,
    remainingLife: 1800,
    lastMaintenanceDate: "2025-05-28",
    status: "Replace Soon"
  },
  {
    toolId: "T-003",
    toolName: "Cutter Blade C3",
    machineName: "Trimming Station 1",
    toolType: "Cutter Blade",
    startUsageDate: "2025-02-10",
    totalCycleUsed: 9000,
    cycleLimit: 10000,
    remainingLife: 1000,
    lastMaintenanceDate: "2025-06-10",
    status: "Warning"
  },
  {
    toolId: "T-004",
    toolName: "Nozzle Insert D4",
    machineName: "Injection Press 2",
    toolType: "Nozzle Insert",
    startUsageDate: "2024-11-20",
    totalCycleUsed: 20000,
    cycleLimit: 20000,
    remainingLife: 0,
    lastMaintenanceDate: "2025-06-05",
    status: "Replace Soon"
  },
  {
    toolId: "T-005",
    toolName: "Spindle Clamp E5",
    machineName: "Compression M2",
    toolType: "Clamp",
    startUsageDate: "2025-03-01",
    totalCycleUsed: 2000,
    cycleLimit: 15000,
    remainingLife: 13000,
    lastMaintenanceDate: "2025-06-12",
    status: "Normal"
  },
  {
    toolId: "T-006",
    toolName: "Plate Spacer F6",
    machineName: "Auto Press",
    toolType: "Spacer",
    startUsageDate: "2025-01-01",
    totalCycleUsed: 14700,
    cycleLimit: 15000,
    remainingLife: 300,
    lastMaintenanceDate: "2025-06-14",
    status: "Warning"
  }
]

const fetchData = async (filters = {}) => {
  loading.value = true
  error.value = null

  try {
    // Try to fetch from API first
    const res = await fetch("/api/toolstry")
    if (!res.ok) throw new Error("Failed to fetch tools")

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
      filters.toolId &&
      !item.toolId
        .toLowerCase()
        .includes(filters.toolId.toLowerCase())
    ) {
      return false
    }
    if (
      filters.toolName &&
      !item.toolName
        .toLowerCase()
        .includes(filters.toolName.toLowerCase())
    ) {
      return false
    }
    if (
      filters.machineName &&
      !item.machineName
        .toLowerCase()
        .includes(filters.machineName.toLowerCase())
    ) {
      return false
    }
    if (
      filters.toolType &&
      item.toolType.toLowerCase() !== filters.toolType.toLowerCase()
    ) {
      return false
    }
    if (
      filters.status &&
      item.status.toLowerCase() !== filters.status.toLowerCase()
    ) {
      return false
    }
    if (filters.startUsageDate && item.startUsageDate !== filters.startUsageDate) {
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

// Status styling
const getStatusClass = (status) => {
  switch (status.toLowerCase()) {
    case "normal":
      return "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900 dark:text-green-300"
    case "replace soon":
      return "bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900 dark:text-orange-300"
    case "warning":
      return "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900 dark:text-red-300"
    default:
      return "bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-300"
  }
}

// Remaining life color styling
const getRemainingLifeClass = (remainingLife) => {
  const life = remainingLife || 0
  if (life === 0) {
    return "text-red-600 dark:text-red-400"
  } else if (life <= 1000) {
    return "text-orange-600 dark:text-orange-400"
  } else if (life <= 2000) {
    return "text-yellow-600 dark:text-yellow-400"
  }
  return "text-gray-900 dark:text-white"
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