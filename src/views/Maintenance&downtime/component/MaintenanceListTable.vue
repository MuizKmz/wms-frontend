<template>
  <div class="overflow-hidden">
    <!-- Results count -->
    <div class="mb-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Showing {{ filteredData.length }} maintenance records
      </p>
    </div>

    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="min-w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th>
              <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" aria-label="select all" />
            </th>
            <th class="px-6 py-3 text-left"><p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Maintenance ID</p></th>
            <th class="px-6 py-3 text-left"><p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Scheduled Date</p></th>
            <th class="px-6 py-3 text-left"><p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Machine Name</p></th>
            <th class="px-6 py-3 text-left"><p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Department</p></th>
            <th class="px-6 py-3 text-left"><p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Maintenance Type</p></th>
            <th class="px-6 py-3 text-left"><p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Assigned Technician</p></th>
            <th class="px-6 py-3 text-left"><p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Status</p></th>
            <th class="px-6 py-3 text-left"><p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Remarks</p></th>
            <th class="px-6 py-3 text-left"><p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Action</p></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="(item, index) in paginatedData" :key="index"
            class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <th><input type="checkbox" class="checkbox checkbox-primary checkbox-sm" aria-label="select row" /></th>

            <!-- Maintenance ID -->
            <td class="px-6 py-4">
              <span class="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                {{ item.maintenanceId || 'N/A' }}
              </span>
            </td>

            <!-- Scheduled Date -->
            <td class="px-6 py-4"><span class="text-sm text-gray-900 dark:text-white">{{ item.scheduledDate || 'N/A' }}</span></td>

            <!-- Machine Name -->
            <td class="px-6 py-4"><span class="text-sm font-medium text-gray-900 dark:text-white">{{ item.machineName || 'N/A' }}</span></td>

            <!-- Department -->
            <td class="px-6 py-4"><span class="text-sm text-gray-900 dark:text-white">{{ item.department || 'N/A' }}</span></td>

            <!-- Maintenance Type -->
            <td class="px-6 py-4"><span class="text-sm text-gray-900 dark:text-white">{{ item.maintenanceType || 'N/A' }}</span></td>

            <!-- Assigned Technician -->
            <td class="px-6 py-4"><span class="text-sm text-gray-900 dark:text-white">{{ item.assignedTechnician || 'N/A' }}</span></td>

            <!-- Status -->
            <td class="px-6 py-4">
              <span :class="getStatusClass(item.status)" class="inline-flex items-center text-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ item.status || 'N/A' }}
              </span>
            </td>

            <!-- Remarks -->
            <td class="px-6 py-4"><span class="text-sm text-gray-900 dark:text-white">{{ item.remarks || 'N/A' }}</span></td>

            <!-- Actions -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <!-- same actions as before -->
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

      <!-- pagination / loading / empty / error are unchanged -->
      <!-- ... same as your code ... -->
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

// Mock data (from your table)
const mockData = [
  { maintenanceId: "MNT-0001", scheduledDate: "2025-06-20", machineName: "Press Molder 01", department: "Molding", maintenanceType: "Preventive", assignedTechnician: "John Tan", status: "Scheduled", remarks: "Monthly check-up" },
  { maintenanceId: "MNT-0002", scheduledDate: "2025-06-21", machineName: "Extruder 03", department: "Compounding", maintenanceType: "Corrective", assignedTechnician: "A. Rahman", status: "In Progress", remarks: "Motor temperature abnormal" },
  { maintenanceId: "MNT-0003", scheduledDate: "2025-06-17", machineName: "Trimming Unit 05", department: "Finishing", maintenanceType: "Preventive", assignedTechnician: "Lim Wei Jie", status: "Completed", remarks: "All parts functioning well" },
  { maintenanceId: "MNT-0004", scheduledDate: "2025-06-25", machineName: "Injection Mid 02", department: "Injection", maintenanceType: "Calibration", assignedTechnician: "Noraini Zulkifli", status: "Scheduled", remarks: "Calibration due for Q2" },
  { maintenanceId: "MNT-0005", scheduledDate: "2025-06-15", machineName: "Cooling Tank 01", department: "Utility", maintenanceType: "Emergency", assignedTechnician: "Siva Kumar", status: "Delayed", remarks: "Spare part pending" },
  { maintenanceId: "MNT-0006", scheduledDate: "2025-06-19", machineName: "Conveyor Line B", department: "Packing", maintenanceType: "Preventive", assignedTechnician: "Cheng Wai Keong", status: "In Progress", remarks: "Belt tension needs adjustment" },
  { maintenanceId: "MNT-0007", scheduledDate: "2025-06-22", machineName: "Mixer 02", department: "Compounding", maintenanceType: "Corrective", assignedTechnician: "Nurul Aida", status: "Scheduled", remarks: "Noise from gear system" }
]

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await fetch("/api/maintenance")
    if (!res.ok) throw new Error("Failed to fetch maintenance data")
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
    if (filters.maintenanceId && !item.maintenanceId.toLowerCase().includes(filters.maintenanceId.toLowerCase())) return false
    if (filters.machineName && !item.machineName.toLowerCase().includes(filters.machineName.toLowerCase())) return false
    if (filters.department && !item.department.toLowerCase().includes(filters.department.toLowerCase())) return false
    if (filters.maintenanceType && !item.maintenanceType.toLowerCase().includes(filters.maintenanceType.toLowerCase())) return false
    if (filters.assignedTechnician && !item.assignedTechnician.toLowerCase().includes(filters.assignedTechnician.toLowerCase())) return false
    if (filters.status && !item.status.toLowerCase().includes(filters.status.toLowerCase())) return false
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
    case "Scheduled": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    case "In Progress": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case "Completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "Delayed": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }
}

watch(() => props.filters, () => { currentPage.value = 1 }, { deep: true })
onMounted(fetchData)
</script>
