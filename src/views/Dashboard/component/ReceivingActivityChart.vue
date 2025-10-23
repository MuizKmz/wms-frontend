<template>
  <div ref="chartContainer" class="w-full h-full relative flex flex-col">
    <!-- Date Range Filter -->
    <div class="flex justify-end mb-3 flex-shrink-0">
      <select 
        v-model="selectedRange"
        @change="fetchData"
        class="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        <option value="7">Last 7 Days</option>
        <option value="30">Last 30 Days</option>
        <option value="90">Last 90 Days</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <div class="w-5 h-5 border-2 border-gray-300 border-t-teal-600 rounded-full animate-spin"></div>
        <span class="text-sm">Loading receiving data...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <div class="text-center text-red-500">
        <svg class="mx-auto h-8 w-8 text-red-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="text-sm font-medium">Error loading receiving data</p>
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
import { ref, onMounted, onUnmounted, defineExpose } from 'vue'
import {
  Chart,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

Chart.register(
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
)

const chartContainer = ref(null)
const chartCanvas = ref(null)
const chartInstance = ref(null)
const loading = ref(true)
const error = ref(null)
const resizeObserver = ref(null)
const selectedRange = ref('30')

const API_URL = '/api/receiving/activity'

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(`${API_URL}?days=${selectedRange.value}`)
    if (!response.ok) throw new Error('Failed to fetch receiving activity')
    
    const activity = await response.json()
    
    const labels = activity.map(a => {
      const date = new Date(a.date)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })
    const quantities = activity.map(a => a.totalQuantity || 0)
    const counts = activity.map(a => a.receivingCount || 0)

    createChart(labels, quantities, counts)
  } catch (e) {
    error.value = e.message
    console.error('Error fetching receiving activity:', e)
  } finally {
    loading.value = false
  }
}

const createChart = (labels, quantities, counts) => {
  const ctx = chartCanvas.value?.getContext('2d')
  if (!ctx) return
  if (chartInstance.value) chartInstance.value.destroy()

  const isDark = document.documentElement.classList.contains('dark')

  chartInstance.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Quantity Received',
          data: quantities,
          borderColor: '#14B8A6',
          backgroundColor: 'rgba(20, 184, 166, 0.1)',
          pointBackgroundColor: '#14B8A6',
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2.5,
          tension: 0.4,
          fill: true,
          yAxisID: 'y'
        },
        {
          label: 'Receiving Count',
          data: counts,
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          pointBackgroundColor: '#F59E0B',
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2.5,
          tension: 0.4,
          fill: true,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            font: { size: 12 },
            color: isDark ? '#e5e7eb' : '#374151',
            padding: 15
          }
        },
        tooltip: {
          backgroundColor: 'rgba(31, 41, 55, 0.9)',
          titleColor: '#fff',
          bodyColor: '#f9fafb',
          padding: 10,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: isDark ? '#9ca3af' : '#6b7280' }
        },
        y: {
          type: 'linear',
          position: 'left',
          beginAtZero: true,
          grid: { display: false },
          border: { display: false },
          ticks: { color: isDark ? '#9ca3af' : '#6b7280' },
          title: {
            display: true,
            text: 'Quantity',
            color: isDark ? '#e5e7eb' : '#374151',
            font: { size: 12, weight: 'bold' }
          }
        },
        y1: {
          type: 'linear',
          position: 'right',
          beginAtZero: true,
          grid: { display: false },
          border: { display: false },
          ticks: { color: isDark ? '#9ca3af' : '#6b7280' },
          title: {
            display: true,
            text: 'Count',
            color: isDark ? '#e5e7eb' : '#374151',
            font: { size: 12, weight: 'bold' }
          }
        }
      }
    }
  })

  // Watch for theme changes
  const observer = new MutationObserver(() => {
    const isDarkNow = document.documentElement.classList.contains('dark')
    if (chartInstance.value) {
      const textColor = isDarkNow ? '#e5e7eb' : '#374151'
      const tickColor = isDarkNow ? '#9ca3af' : '#6b7280'
      
      chartInstance.value.options.plugins.legend.labels.color = textColor
      chartInstance.value.options.scales.x.ticks.color = tickColor
      chartInstance.value.options.scales.y.ticks.color = tickColor
      chartInstance.value.options.scales.y.title.color = textColor
      chartInstance.value.options.scales.y1.ticks.color = tickColor
      chartInstance.value.options.scales.y1.title.color = textColor
      chartInstance.value.update()
    }
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
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

defineExpose({ refresh: fetchData })
</script>
