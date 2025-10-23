<template>
  <div ref="chartContainer" class="w-full h-full relative flex flex-col">
    <!-- Loading State -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <div class="w-5 h-5 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
        <span class="text-sm">Loading supplier data...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <div class="text-center text-red-500">
        <svg class="mx-auto h-8 w-8 text-red-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="text-sm font-medium">Error loading suppliers</p>
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
  BarController,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js'

Chart.register(CategoryScale, LinearScale, BarController, BarElement, Tooltip, Legend)

const chartContainer = ref(null)
const chartCanvas = ref(null)
const chartInstance = ref(null)
const loading = ref(true)
const error = ref(null)
const resizeObserver = ref(null)

const API_URL = '/api/supplier/performance'

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(API_URL)
    if (!response.ok) throw new Error('Failed to fetch supplier performance')
    
    const suppliers = await response.json()
    
    // Get top 10 suppliers by order count
    const sorted = suppliers
      .sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0))
      .slice(0, 10)

    const labels = sorted.map(s => s.name || s.supplierName || 'Unknown')
    const orderCounts = sorted.map(s => s.orderCount || 0)
    const onTimeDelivery = sorted.map(s => s.onTimeDeliveryRate || 0)

    createChart(labels, orderCounts, onTimeDelivery)
  } catch (e) {
    error.value = e.message
    console.error('Error fetching supplier performance:', e)
  } finally {
    loading.value = false
  }
}

const createChart = (labels, orderCounts, onTimeDelivery) => {
  const ctx = chartCanvas.value?.getContext('2d')
  if (!ctx) return
  if (chartInstance.value) chartInstance.value.destroy()

  const isDark = document.documentElement.classList.contains('dark')

  chartInstance.value = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Total Orders',
          data: orderCounts,
          backgroundColor: '#8B5CF6',
          borderRadius: 6,
          borderSkipped: false,
          yAxisID: 'y'
        },
        {
          label: 'On-Time Rate (%)',
          data: onTimeDelivery,
          backgroundColor: '#10B981',
          borderRadius: 6,
          borderSkipped: false,
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
            color: isDark ? '#e5e7eb' : '#374151',
            usePointStyle: true,
            pointStyle: 'rectRounded',
            padding: 15
          }
        },
        tooltip: {
          backgroundColor: 'rgba(31, 41, 55, 0.9)',
          padding: 10,
          cornerRadius: 8,
          titleColor: '#fff',
          bodyColor: '#f9fafb'
        }
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { 
            color: isDark ? '#9ca3af' : '#6b7280',
            maxRotation: 45,
            minRotation: 45
          }
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
            text: 'Orders',
            color: isDark ? '#e5e7eb' : '#374151',
            font: { size: 12, weight: 'bold' }
          }
        },
        y1: {
          type: 'linear',
          position: 'right',
          beginAtZero: true,
          max: 100,
          grid: { display: false },
          border: { display: false },
          ticks: { 
            color: isDark ? '#9ca3af' : '#6b7280',
            callback: function(value) {
              return value + '%'
            }
          },
          title: {
            display: true,
            text: 'On-Time %',
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
