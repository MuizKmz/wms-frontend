<template>
  <div ref="chartContainer" class="w-full h-full relative overflow-auto">
    <!-- Loading State -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg">
      <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <div class="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <span class="text-sm">Loading shipments...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="absolute inset-0 flex items-center justify-center">
      <div class="text-center text-red-500">
        <svg class="mx-auto h-8 w-8 text-red-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="text-sm font-medium">Error loading shipments</p>
        <p class="text-xs mt-1">{{ error }}</p>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="w-full h-full overflow-auto">
      <table class="min-w-full">
        <thead class="sticky top-0 bg-white dark:bg-gray-900 z-10">
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th class="px-4 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Tracking Code
              </p>
            </th>
            <th class="px-4 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Order Number
              </p>
            </th>
            <th class="px-4 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Carrier
              </p>
            </th>
            <th class="px-4 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Destination
              </p>
            </th>
            <th class="px-4 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Status
              </p>
            </th>
            <th class="px-4 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Shipping Date
              </p>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="item in displayData"
            :key="item.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <!-- Tracking Code -->
            <td class="px-4 py-3">
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ item.trackingCode || '-' }}
              </span>
            </td>

            <!-- Order No -->
            <td class="px-4 py-3">
              <span class="text-sm text-gray-900 dark:text-white">
                {{ item.order || '-' }}
              </span>
            </td>

            <!-- Carrier -->
            <td class="px-4 py-3">
              <span class="text-sm text-gray-900 dark:text-white">
                {{ item.carrier || '-' }}
              </span>
            </td>

            <!-- Destination -->
            <td class="px-4 py-3">
              <span class="text-sm text-gray-900 dark:text-white truncate max-w-[150px] block" :title="item.destination">
                {{ item.destination || '-' }}
              </span>
            </td>

            <!-- Status -->
            <td class="px-4 py-3">
              <span 
                class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                :class="getStatusColor(item.state)"
              >
                {{ item.state || '-' }}
              </span>
            </td>

            <!-- Shipping Date -->
            <td class="px-4 py-3">
              <span class="text-sm text-gray-900 dark:text-white">
                {{ formatDate(item.shippingDate) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="displayData.length === 0" class="py-8 text-center text-gray-500">
        <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No recent shipments
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const chartContainer = ref(null)
const data = ref([])
const loading = ref(true)
const error = ref(null)
const resizeObserver = ref(null)

// API endpoint for shipments
const API_URL = '/api/shipping'

// Fetch recent shipments from API
const fetchShipments = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(API_URL)

    if (!response.ok) throw new Error("Failed to fetch shipments")

    const json = await response.json()
    
    // Normalize server shipment objects
    data.value = (json || []).map((p) => ({
      id: p.id,
      trackingCode: p.code || p.trackingCode || '',
      order: p.order ? (p.order.name || p.order.orderNo) : (p.order || ''),
      carrier: p.carrier || '',
      destination: p.destination || '',
      state: p.state || '',
      shippingDate: p.shippingDate || '',
      estimatedDeliveryDate: p.estimatedDeliveryDate || '',
      remark: p.remarks || p.remark || '',
    }))
  } catch (e) {
    error.value = e.message
    console.error('Error fetching shipments:', e)
  } finally {
    loading.value = false
  }
}

// Display only the 10 most recent shipments
const displayData = computed(() => {
  return data.value
    .sort((a, b) => new Date(b.shippingDate) - new Date(a.shippingDate))
    .slice(0, 10)
})

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Get status color based on state
const getStatusColor = (state) => {
  if (!state) return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  
  const stateLower = state.toLowerCase()
  if (stateLower.includes('delivered') || stateLower.includes('completed')) {
    return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  } else if (stateLower.includes('transit') || stateLower.includes('progress')) {
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  } else if (stateLower.includes('pending') || stateLower.includes('planned')) {
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
  } else if (stateLower.includes('cancelled') || stateLower.includes('failed')) {
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }
  
  return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
}

onMounted(async () => {
  await fetchShipments()

  // Setup resize observer for responsive handling
  if (chartContainer.value) {
    resizeObserver.value = new ResizeObserver(() => {
      // Table is naturally responsive, but observer kept for future enhancements
    })
    resizeObserver.value.observe(chartContainer.value)
  }
})

onUnmounted(() => {
  if (resizeObserver.value) resizeObserver.value.disconnect()
})
</script>

<style scoped>
/* Custom scrollbar for the table */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Dark mode scrollbar */
.dark ::-webkit-scrollbar-track {
  background: #374151;
}

.dark ::-webkit-scrollbar-thumb {
  background: #6b7280;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>