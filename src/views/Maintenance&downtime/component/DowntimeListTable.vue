<template>
  <div class="overflow-hidden">
    <!-- Results count -->
    <div class="mb-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Showing {{ filteredData.length }} downtime records
      </p>
    </div>

    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="min-w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th>
              <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" aria-label="select all" />
            </th>
            <th class="px-6 py-3 text-left"><p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Downtime ID</p></th>
            <th class="px-6 py-3 text-left"><p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Start Time</p></th>
            <th class="px-6 py-3 text-left"><p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">End Time</p></th>
            <th class="px-6 py-3 text-left"><p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Machine Name</p></th>
            <th class="px-6 py-3 text-left"><p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Department</p></th>
            <th class="px-6 py-3 text-left"><p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Category</p></th>
            <th class="px-6 py-3 text-left"><p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Cause Description</p></th>
            <th class="px-6 py-3 text-left"><p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Status</p></th>
            <th class="px-6 py-3 text-left"><p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Action Taken</p></th>
            <th class="px-6 py-3 text-left"><p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Action</p></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="(item, index) in paginatedData" :key="index"
            class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <th><input type="checkbox" class="checkbox checkbox-primary checkbox-sm" aria-label="select row" /></th>

            <!-- Downtime ID -->
            <td class="px-6 py-4">
              <span class="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                {{ item.downtimeId || 'N/A' }}
              </span>
            </td>

            <!-- Start Time -->
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900 dark:text-white">
                <div>{{ item.startDate || 'N/A' }}</div>
                <div class="text-xs text-gray-500">{{ item.startTime || '' }}</div>
              </div>
            </td>

            <!-- End Time -->
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900 dark:text-white">
                <div>{{ item.endDate || '—' }}</div>
                <div class="text-xs text-gray-500">{{ item.endTime || '' }}</div>
              </div>
            </td>

            <!-- Machine Name -->
            <td class="px-6 py-4"><span class="text-sm font-medium text-gray-900 dark:text-white">{{ item.machineName || 'N/A' }}</span></td>

            <!-- Department -->
            <td class="px-6 py-4"><span class="text-sm text-gray-900 dark:text-white">{{ item.department || 'N/A' }}</span></td>

            <!-- Category -->
            <td class="px-6 py-4"><span class="text-sm text-gray-900 dark:text-white">{{ item.category || 'N/A' }}</span></td>

            <!-- Cause Description -->
            <td class="px-6 py-4"><span class="text-sm text-gray-900 dark:text-white">{{ item.causeDescription || 'N/A' }}</span></td>

            <!-- Status -->
            <td class="px-6 py-4">
              <span :class="getStatusClass(item.status)" class="inline-flex items-center text-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ item.status || 'N/A' }}
              </span>
            </td>

            <!-- Action Taken -->
            <td class="px-6 py-4"><span class="text-sm text-gray-900 dark:text-white">{{ item.actionTaken || 'N/A' }}</span></td>

            <!-- Actions -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <button class="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" aria-label="View">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button class="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors" aria-label="Edit">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button class="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" aria-label="Delete">
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
        <p>Loading downtime records...</p>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && filteredData.length === 0" class="p-8 text-center text-gray-500">
        <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No downtime records found
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your filters or check back later.
        </p>
      </div>

      <!-- Error -->
      <div v-if="error" class="p-8 text-center text-red-500 text-sm">
        <svg class="mx-auto h-12 w-12 text-red-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="font-medium">Error loading downtime records</p>
        <p class="text-xs mt-1">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue"

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
})

const data = ref([])
const loading = ref(false)
const error = ref(null)

// Mock data based on the image
const mockData = [
  { 
    downtimeId: "DT-0001", 
    startDate: "2025-06-15", 
    startTime: "08:15",
    endDate: "2025-06-15", 
    endTime: "09:00",
    machineName: "Press Molder 01", 
    department: "Molding", 
    category: "Mechanical", 
    causeDescription: "Gearbox malfunction", 
    status: "Resolved", 
    actionTaken: "Replaced faulty gearbox"
  },
  { 
    downtimeId: "DT-0002", 
    startDate: "2025-06-16", 
    startTime: "13:00",
    endDate: "2025-06-16", 
    endTime: "13:45",
    machineName: "Extruder 03", 
    department: "Compounding", 
    category: "Electrical", 
    causeDescription: "Power trip", 
    status: "Resolved", 
    actionTaken: "Reset breaker, checked circuit"
  },
  { 
    downtimeId: "DT-0003", 
    startDate: "2025-06-17", 
    startTime: "10:20",
    endDate: "2025-06-17", 
    endTime: "11:50",
    machineName: "Conveyor Line B", 
    department: "Packing", 
    category: "Operational", 
    causeDescription: "Material jammed in conveyor", 
    status: "Resolved", 
    actionTaken: "Cleared blockage, tested flow"
  },
  { 
    downtimeId: "DT-0004", 
    startDate: "2025-06-17", 
    startTime: "15:30",
    endDate: "—", 
    endTime: "",
    machineName: "Injection Mld 02", 
    department: "Injection", 
    category: "Mechanical", 
    causeDescription: "Hydraulic pressure drop", 
    status: "Ongoing", 
    actionTaken: "Technician dispatched"
  },
  { 
    downtimeId: "DT-0005", 
    startDate: "2025-06-18", 
    startTime: "07:00",
    endDate: "2025-06-18", 
    endTime: "08:30",
    machineName: "Dryer Unit 01", 
    department: "Finishing", 
    category: "Utility", 
    causeDescription: "No hot air generated", 
    status: "Resolved", 
    actionTaken: "Fixed heating element"
  },
  { 
    downtimeId: "DT-0006", 
    startDate: "2025-06-19", 
    startTime: "09:10",
    endDate: "2025-06-19", 
    endTime: "10:00",
    machineName: "Mixer 02", 
    department: "Compounding", 
    category: "Mechanical", 
    causeDescription: "Blade misalignment", 
    status: "Resolved", 
    actionTaken: "Realigned blades"
  }
]

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await fetch("/api/downtime")
    if (!res.ok) throw new Error("Failed to fetch downtime data")
    const apiData = await res.json()
    data.value = apiData
  } catch (err) {
    console.warn("API Error, using mock data:", err.message)
    data.value = [...mockData]
    error.value = null
  } finally {
    loading.value = false
  }
}

// Filtering
const filteredData = computed(() => {
  if (!props.filters) return data.value
  return data.value.filter((item) => {
    const filters = props.filters
    if (filters.downtimeId && !item.downtimeId.toLowerCase().includes(filters.downtimeId.toLowerCase())) return false
    if (filters.machineName && !item.machineName.toLowerCase().includes(filters.machineName.toLowerCase())) return false
    if (filters.department && !item.department.toLowerCase().includes(filters.department.toLowerCase())) return false
    if (filters.category && !item.category.toLowerCase().includes(filters.category.toLowerCase())) return false
    if (filters.status && !item.status.toLowerCase().includes(filters.status.toLowerCase())) return false
    if (filters.causeDescription && !item.causeDescription.toLowerCase().includes(filters.causeDescription.toLowerCase())) return false
    return true
  })
})

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(5)
const totalPages = computed(() => Math.ceil(filteredData.value.length / itemsPerPage.value))
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredData.value.slice(start, start + itemsPerPage.value)
})
const changePage = (page) => { if (page >= 1 && page <= totalPages.value) currentPage.value = page }

// Status badge styling
const getStatusClass = (status) => {
  switch (status) {
    case "Resolved": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "Ongoing": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case "Pending": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    case "Scheduled": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }
}

watch(() => props.filters, () => { currentPage.value = 1 }, { deep: true })
onMounted(fetchData)
</script>