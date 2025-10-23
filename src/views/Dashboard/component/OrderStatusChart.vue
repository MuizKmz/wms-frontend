<template>
  <div ref="chartContainer" class="w-full h-full relative flex flex-col">
    <!-- Date Range Filter -->
    <div class="flex justify-end mb-3 flex-shrink-0">
      <select 
        v-model="selectedRange"
        @change="fetchData"
        class="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="7">Last 7 Days</option>
        <option value="30">Last 30 Days</option>
        <option value="90">Last 90 Days</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <div class="w-5 h-5 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
        <span class="text-sm">Loading order data...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <div class="text-center text-red-500">
        <svg class="mx-auto h-8 w-8 text-red-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="text-sm font-medium">Error loading orders</p>
        <p class="text-xs mt-1">{{ error }}</p>
      </div>
    </div>

    <!-- Chart -->
    <div v-else class="flex-1 min-h-0">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js'

Chart.register(ArcElement, Tooltip, Legend)

const chartContainer = ref(null)
const chartCanvas = ref(null)
const chartInstance = ref(null)
const loading = ref(true)
const error = ref(null)
const resizeObserver = ref(null)
const selectedRange = ref('30')

const API_URL = '/api/orders'

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(API_URL)
    if (!response.ok) throw new Error('Failed to fetch orders')
    
    const orders = await response.json()
    
    // Count orders by status
    const statusCounts = {}
    orders.forEach(order => {
      const status = order.status || 'Unknown'
      statusCounts[status] = (statusCounts[status] || 0) + 1
    })

    createChart(statusCounts)
  } catch (e) {
    error.value = e.message
    console.error('Error fetching orders:', e)
  } finally {
    loading.value = false
  }
}

const createChart = (statusCounts) => {
  const ctx = chartCanvas.value?.getContext('2d')
  if (!ctx) return
  if (chartInstance.value) chartInstance.value.destroy()

  const labels = Object.keys(statusCounts)
  const data = Object.values(statusCounts)
  const colors = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6']

  chartInstance.value = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            font: { size: 12 },
            color: '#6b7280',
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(31, 41, 55, 0.9)',
          padding: 12,
          cornerRadius: 8,
          titleColor: '#fff',
          bodyColor: '#f9fafb'
        }
      }
    }
  })
}

onMounted(async () => {
  await fetchData()

  if (chartContainer.value) {
    resizeObserver.value = new ResizeObserver(() => {
      if (chartInstance.value) {
        chartInstance.value.resize()
      }
    })
    resizeObserver.value.observe(chartContainer.value)
  }
})

onUnmounted(() => {
  if (chartInstance.value) chartInstance.value.destroy()
  if (resizeObserver.value) resizeObserver.value.disconnect()
})
</script>
