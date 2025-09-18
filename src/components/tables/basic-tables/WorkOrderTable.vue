<template>
  <div class="overflow-hidden">
    <!-- Results count -->
    <div class="mb-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">Showing {{ filteredData.length }} work orders</p>
    </div>

    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="min-w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Work Order ID</p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Compounding Lot No.</p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Status</p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Priority</p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Acknowledgment</p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Created By</p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Created Date</p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">Action</p>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="(item, index) in filteredData"
            :key="index"
            class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <!-- Work Order ID -->
            <td class="px-6 py-4">
              <span class="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                {{ item.workOrderId }}
              </span>
            </td>
            
            <!-- Compounding Lot No. -->
            <td class="px-6 py-4">
              <span class="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                {{ item.compoundingLot }}
              </span>
            </td>
            
            <!-- Status -->
            <td class="px-6 py-4">
              <span :class="getStatusClass(item.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ item.status }}
              </span>
            </td>
            
            <!-- Priority -->
            <td class="px-6 py-4">
              <span :class="getPriorityClass(item.priority)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ item.priority }}
              </span>
            </td>
            
            <!-- Acknowledgment -->
            <td class="px-6 py-4">
              <span :class="getAcknowledgmentClass(item.acknowledgment)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ item.acknowledgment }}
              </span>
            </td>
            
            <!-- Created By -->
            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">{{ item.createdBy }}</p>
            </td>
            
            <!-- Created Date -->
            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">{{ item.createdDate }}</p>
            </td>
            
            <!-- Actions -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <button class="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" aria-label="View">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
                <button class="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors" aria-label="Edit">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="More">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Loading -->
      <div v-if="loading" class="p-8 text-center text-gray-500 text-sm">
        <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
        <p>Loading work orders...</p>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && filteredData.length === 0" class="p-8 text-center text-gray-500">
        <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <p class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No work orders found</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">Try adjusting your filters or create a new work order.</p>
      </div>

      <!-- Error -->
      <div v-if="error" class="p-8 text-center text-red-500 text-sm">
        <svg class="mx-auto h-12 w-12 text-red-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <p class="font-medium">Error loading work orders</p>
        <p class="text-xs mt-1">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'

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

// Mock data for work orders
const mockData = [
  {
    workOrderId: 'JO-2024-0510-0001',
    compoundingLot: 'CLOT-2024-A-001',
    status: 'Issued',
    priority: 'High',
    acknowledgment: 'Acknowledged',
    createdBy: 'Alice Smith',
    createdDate: '2024-05-10'
  },
  {
    workOrderId: 'PRD-2024-0511-0002',
    compoundingLot: 'CLOT-2024-W-002',
    status: 'Draft',
    priority: 'Medium',
    acknowledgment: 'Rejected',
    createdBy: 'Bob Johnson',
    createdDate: '2024-05-11'
  },
  {
    workOrderId: 'RE-2024-0512-0003',
    compoundingLot: 'CLOT-2024-Q-003',
    status: 'Completed',
    priority: 'Low',
    acknowledgment: 'Not yet acknowledge',
    createdBy: 'Charlie Brown',
    createdDate: '2024-05-12'
  },
  {
    workOrderId: 'JO-2024-0513-0004',
    compoundingLot: 'CLOT-2024-A-004',
    status: 'Issued',
    priority: 'Medium',
    acknowledgment: 'Acknowledged',
    createdBy: 'Alice Smith',
    createdDate: '2024-05-13'
  },
  {
    workOrderId: 'PRD-2024-0514-0005',
    compoundingLot: 'CLOT-2024-P-005',
    status: 'Draft',
    priority: 'Low',
    acknowledgment: 'Rejected',
    createdBy: 'Bob Johnson',
    createdDate: '2024-05-14'
  },
  {
    workOrderId: 'JO-2024-0515-0006',
    compoundingLot: 'CLOT-2024-W-006',
    status: 'Cancelled',
    priority: 'High',
    acknowledgment: 'Not yet acknowledge',
    createdBy: 'Charlie Brown',
    createdDate: '2024-05-15'
  }
]

const fetchData = async (filters = {}) => {
  loading.value = true
  error.value = null
  
  try {
    // Try to fetch from API first
    const res = await fetch('/api/work-orders')
    if (!res.ok) throw new Error('Failed to fetch work orders')
    
    const apiData = await res.json()
    data.value = apiData
  } catch (err) {
    // If API fails, use mock data
    console.warn('API Error, using mock data:', err.message)
    data.value = mockData
    error.value = null // Don't show error if we have mock data
  } finally {
    loading.value = false
  }
}

// Computed property for filtered data
const filteredData = computed(() => {
  if (!props.filters) return data.value
  
  return data.value.filter(item => {
    const filters = props.filters
    
    if (filters.workOrder && !item.workOrderId.toLowerCase().includes(filters.workOrder.toLowerCase())) {
      return false
    }
    if (filters.compoundingLot && !item.compoundingLot.toLowerCase().includes(filters.compoundingLot.toLowerCase())) {
      return false
    }
    if (filters.status && item.status.toLowerCase() !== filters.status.toLowerCase()) {
      return false
    }
    if (filters.priority && item.priority.toLowerCase() !== filters.priority.toLowerCase()) {
      return false
    }
    if (filters.acknowledgement && item.acknowledgment.toLowerCase() !== filters.acknowledgement.toLowerCase()) {
      return false
    }
    if (filters.createdDate && item.createdDate !== filters.createdDate) {
      return false
    }
    
    return true
  })
})

// Status styling
const getStatusClass = (status) => {
  switch (status.toLowerCase()) {
    case 'issued':
      return 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900 dark:text-green-300'
    case 'draft':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300'
    case 'completed':
      return 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900 dark:text-blue-300'
    case 'cancelled':
      return 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900 dark:text-red-300'
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-300'
  }
}

// Priority styling
const getPriorityClass = (priority) => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900 dark:text-red-300'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300'
    case 'low':
      return 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900 dark:text-blue-300'
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-300'
  }
}

// Acknowledgment styling
const getAcknowledgmentClass = (acknowledgment) => {
  switch (acknowledgment.toLowerCase()) {
    case 'acknowledged':
      return 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900 dark:text-green-300'
    case 'rejected':
      return 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900 dark:text-red-300'
    case 'not yet acknowledge':
      return 'bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900 dark:text-orange-300'
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-300'
  }
}

// Watch for filter changes
watch(() => props.filters, (newFilters) => {
  console.log('Filters updated:', newFilters)
}, { deep: true })

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