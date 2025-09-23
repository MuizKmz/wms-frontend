<template>
  <div class="space-y-4">
    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="card bg-white dark:bg-gray-800 shadow-lg animate-pulse">
        <div class="card-body p-6">
          <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-4 w-2/3"></div>
          <div class="space-y-2 mb-4">
            <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
          <div class="h-2 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
          <div class="grid grid-cols-2 gap-4">
            <div class="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div class="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <!-- <div v-else-if="error" class="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
      <div class="card-body p-6 text-center">
        <div class="text-red-600 dark:text-red-400 mb-2">
          <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Error Loading Data</h3>
        <p class="text-red-600 dark:text-red-400 mb-4">{{ error }}</p>
        <button @click="fetchWorkOrders" class="btn btn-outline btn-error">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Retry
        </button>
      </div>
    </div> -->

    <!-- Work Orders Grid -->
    <div v-else-if="workOrders.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="order in workOrders"
        :key="order.id"
        class="card bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
      >
        <div class="card-body p-6">
          <!-- Header with Job ID and Status -->
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ order.jobId }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ order.productName }}</p>
            </div>
            <div class="flex-shrink-0">
              <span
                :class="getStatusBadgeClass(order.status)"
                class="badge text-xs font-medium px-3 py-1 rounded-full"
              >
                {{ order.status }}
              </span>
            </div>
          </div>

          <!-- Process Steps -->
          <div class="space-y-2 mb-4">
            <div
              v-for="(step, index) in order.processSteps"
              :key="index"
              class="flex items-center text-sm"
            >
              <div class="flex items-center mr-2">
                <svg
                  v-if="step.completed"
                  class="w-4 h-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <svg
                  v-else-if="step.inProgress"
                  class="w-4 h-4 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 9.293 8.207a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L11 9.586l2.293-2.293z" clip-rule="evenodd"/>
                </svg>
                <svg
                  v-else
                  class="w-4 h-4 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clip-rule="evenodd"/>
                </svg>
              </div>
              <span
                :class="{
                  'text-green-600 dark:text-green-400': step.completed,
                  'text-blue-600 dark:text-blue-400': step.inProgress,
                  'text-gray-500 dark:text-gray-400': !step.completed && !step.inProgress
                }"
              >
                {{ step.name }}
              </span>
              <svg class="w-3 h-3 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mb-4">
            <div class="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{{ Math.round(order.progress) }}%</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-300"
                :class="getProgressBarClass(order.status)"
                :style="{ width: order.progress + '%' }"
              ></div>
            </div>
          </div>

          <!-- Footer Information -->
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div class="text-gray-600 dark:text-gray-400 mb-1">Quantity</div>
              <div class="font-semibold text-gray-900 dark:text-white">
                {{ order.completedQuantity }}/ {{ order.totalQuantity }}
              </div>
            </div>
            <div>
              <div class="text-gray-600 dark:text-gray-400 mb-1">Operator</div>
              <div class="font-semibold text-gray-900 dark:text-white">{{ order.operator }}</div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 text-sm mt-3">
            <div>
              <div class="text-gray-600 dark:text-gray-400 mb-1">Start Time</div>
              <div class="font-semibold text-gray-900 dark:text-white">{{ formatTime(order.startTime) }}</div>
            </div>
            <div>
              <div class="text-gray-600 dark:text-gray-400 mb-1">Est. Completion</div>
              <div class="font-semibold text-gray-900 dark:text-white">{{ formatTime(order.estimatedCompletion) }}</div>
            </div>
          </div>

          <!-- Action Button -->
          <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              @click="viewDetails(order)"
              class="btn btn-outline btn-primary btn-sm w-full"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="card bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-600">
      <div class="card-body p-12 text-center">
        <div class="text-gray-400 dark:text-gray-500 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No Work Orders Found</h3>
        <p class="text-gray-500 dark:text-gray-400">No work orders match the current filters.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
})

const workOrders = ref([])
const loading = ref(true)
const error = ref(null)

const fetchWorkOrders = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Replace with your actual API endpoint
    const response = await fetch('/api/work-orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(props.filters)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    workOrders.value = data.workOrders || []
  } catch (err) {
    error.value = err.message || 'Failed to fetch work orders'
    console.error('Error fetching work orders:', err)
  } finally {
    loading.value = false
  }
}

const getStatusBadgeClass = (status) => {
  const statusClasses = {
    'Completed': 'badge-success text-white',
    'On Track': 'badge-info text-white',
    'Delayed': 'badge-error text-white',
    'Draft': 'badge-warning text-white',
    'Cancelled': 'badge-neutral text-white'
  }
  return statusClasses[status] || 'badge-neutral text-white'
}

const getProgressBarClass = (status) => {
  const progressClasses = {
    'Completed': 'bg-green-500',
    'On Track': 'bg-blue-500',
    'Delayed': 'bg-red-500',
    'Draft': 'bg-yellow-500',
    'Cancelled': 'bg-gray-500'
  }
  return progressClasses[status] || 'bg-blue-500'
}

const formatTime = (timeString) => {
  if (!timeString) return '--:--'
  return timeString
}

const viewDetails = (order) => {
  // Implement view details functionality
  console.log('View details for:', order)
  // You can emit an event or navigate to details page
}

// Watch for filter changes
watch(() => props.filters, () => {
  fetchWorkOrders()
}, { deep: true })

// Initial data load
onMounted(() => {
  fetchWorkOrders()
})

// Mock data for development - remove when connecting to real API
const mockData = () => {
  workOrders.value = [
    {
      id: 1,
      jobId: 'JO-2024-0001',
      productName: 'Precision Gear Set #10',
      status: 'Completed',
      progress: 100,
      processSteps: [
        { name: 'Cutting', completed: true, inProgress: false },
        { name: 'Milling', completed: true, inProgress: false },
        { name: 'Heat Treat', completed: true, inProgress: false },
        { name: 'Grinding', completed: true, inProgress: false },
        { name: 'QC', completed: true, inProgress: false },
        { name: 'Packaging', completed: true, inProgress: false }
      ],
      completedQuantity: 1000,
      totalQuantity: 1000,
      operator: 'Alice Johnson',
      startTime: '07:00',
      estimatedCompletion: '16:00'
    },
    {
      id: 2,
      jobId: 'JO-2024-0002',
      productName: 'Housing Casing Alpha',
      status: 'On Track',
      progress: 65,
      processSteps: [
        { name: 'Stamping', completed: true, inProgress: false },
        { name: 'Welding', completed: true, inProgress: false },
        { name: 'Painting', completed: false, inProgress: true },
        { name: 'Assembly', completed: false, inProgress: false },
        { name: 'QC', completed: false, inProgress: false }
      ],
      completedQuantity: 500,
      totalQuantity: 750,
      operator: 'Bob Williams',
      startTime: '08:30',
      estimatedCompletion: '18:00'
    },
    {
      id: 3,
      jobId: 'JO-2024-0003',
      productName: 'Control Panel Assembly V2',
      status: 'Delayed',
      progress: 45,
      processSteps: [
        { name: 'PCB Mount', completed: true, inProgress: false },
        { name: 'Wiring', completed: false, inProgress: true },
        { name: 'Testing', completed: false, inProgress: false },
        { name: 'Enclosure', completed: false, inProgress: false }
      ],
      completedQuantity: 150,
      totalQuantity: 200,
      operator: 'Charlie Brown',
      startTime: '09:00',
      estimatedCompletion: '17:30'
    }
  ]
  loading.value = false
}

// Use mock data for development
onMounted(() => {
  // Comment out this line when connecting to real API
  setTimeout(mockData, 1000)
  
  // Uncomment this line when connecting to real API
  // fetchWorkOrders()
})
</script>