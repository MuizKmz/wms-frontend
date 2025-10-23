<template>
  <div ref="chartContainer" class="w-full h-full relative flex flex-col">
    <!-- Loading State -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <div class="w-5 h-5 border-2 border-gray-300 border-t-cyan-600 rounded-full animate-spin"></div>
        <span class="text-sm">Loading warehouse data...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <div class="text-center text-red-500">
        <svg class="mx-auto h-8 w-8 text-red-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="text-sm font-medium">Error loading warehouses</p>
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
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js'

Chart.register(ArcElement, Tooltip, Legend)

const chartContainer = ref(null)
const chartCanvas = ref(null)
const chartInstance = ref(null)
const loading = ref(true)
const error = ref(null)
const resizeObserver = ref(null)

const API_URL = '/api/warehouse/utilization'

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(API_URL)
    if (!response.ok) throw new Error('Failed to fetch warehouse utilization')
    
    const warehouses = await response.json()
    
    const labels = warehouses.map(w => w.name || w.warehouseName || 'Unknown')
    const occupied = warehouses.map(w => w.occupiedCapacity || 0)
    const available = warehouses.map(w => w.availableCapacity || 0)

    createChart(labels, occupied, available)
  } catch (e) {
    error.value = e.message
    console.error('Error fetching warehouse utilization:', e)
  } finally {
    loading.value = false
  }
}

const createChart = (labels, occupied, available) => {
  const ctx = chartCanvas.value?.getContext('2d')
  if (!ctx) return
  if (chartInstance.value) chartInstance.value.destroy()

  const isDark = document.documentElement.classList.contains('dark')
  
  // Calculate total capacity and occupied percentage
  const totalOccupied = occupied.reduce((a, b) => a + b, 0)
  const totalAvailable = available.reduce((a, b) => a + b, 0)
  const totalCapacity = totalOccupied + totalAvailable

  chartInstance.value = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Occupied', 'Available'],
      datasets: [{
        data: [totalOccupied, totalAvailable],
        backgroundColor: ['#EF4444', '#10B981'],
        borderWidth: 2,
        borderColor: isDark ? '#1f2937' : '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            font: { size: 12 },
            color: isDark ? '#e5e7eb' : '#6b7280',
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(31, 41, 55, 0.9)',
          padding: 12,
          cornerRadius: 8,
          titleColor: '#fff',
          bodyColor: '#f9fafb',
          callbacks: {
            label: function(context) {
              const label = context.label || ''
              const value = context.parsed
              const percentage = totalCapacity > 0 ? ((value / totalCapacity) * 100).toFixed(1) : 0
              return `${label}: ${value.toLocaleString()} (${percentage}%)`
            }
          }
        }
      }
    },
    plugins: [{
      id: 'centerText',
      afterDraw: (chart) => {
        const ctx = chart.ctx
        const centerX = (chart.chartArea.left + chart.chartArea.right) / 2
        const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2
        
        ctx.save()
        ctx.font = 'bold 20px sans-serif'
        ctx.fillStyle = isDark ? '#e5e7eb' : '#111827'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        const percentage = totalCapacity > 0 ? ((totalOccupied / totalCapacity) * 100).toFixed(1) : 0
        ctx.fillText(`${percentage}%`, centerX, centerY - 10)
        
        ctx.font = '12px sans-serif'
        ctx.fillStyle = isDark ? '#9ca3af' : '#6b7280'
        ctx.fillText('Utilized', centerX, centerY + 15)
        ctx.restore()
      }
    }]
  })

  // Watch for theme changes
  const observer = new MutationObserver(() => {
    const isDarkNow = document.documentElement.classList.contains('dark')
    if (chartInstance.value) {
      chartInstance.value.options.plugins.legend.labels.color = isDarkNow ? '#e5e7eb' : '#6b7280'
      chartInstance.value.data.datasets[0].borderColor = isDarkNow ? '#1f2937' : '#fff'
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
