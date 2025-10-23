<template>
  <div ref="chartContainer" class="w-full h-full relative flex flex-col">
    <!-- Loading State -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <div class="w-5 h-5 border-2 border-gray-300 border-t-orange-600 rounded-full animate-spin"></div>
        <span class="text-sm">Loading category data...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <div class="text-center text-red-500">
        <svg class="mx-auto h-8 w-8 text-red-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="text-sm font-medium">Error loading categories</p>
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

const API_URL = '/api/product/category-distribution'

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(API_URL)
    if (!response.ok) throw new Error('Failed to fetch category distribution')
    
    const categories = await response.json()
    
    const labels = categories.map(c => c.categoryName || c.name || 'Uncategorized')
    const counts = categories.map(c => c.productCount || 0)

    createChart(labels, counts)
  } catch (e) {
    error.value = e.message
    console.error('Error fetching category distribution:', e)
  } finally {
    loading.value = false
  }
}

const createChart = (labels, counts) => {
  const ctx = chartCanvas.value?.getContext('2d')
  if (!ctx) return
  if (chartInstance.value) chartInstance.value.destroy()

  const isDark = document.documentElement.classList.contains('dark')
  
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
  ]

  chartInstance.value = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: counts,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: isDark ? '#1f2937' : '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            padding: 12,
            font: { size: 11 },
            color: isDark ? '#e5e7eb' : '#6b7280',
            usePointStyle: true,
            pointStyle: 'circle',
            generateLabels: function(chart) {
              const data = chart.data
              if (data.labels.length && data.datasets.length) {
                return data.labels.map((label, i) => {
                  const value = data.datasets[0].data[i]
                  const total = data.datasets[0].data.reduce((a, b) => a + b, 0)
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                  return {
                    text: `${label} (${percentage}%)`,
                    fillStyle: data.datasets[0].backgroundColor[i],
                    hidden: false,
                    index: i
                  }
                })
              }
              return []
            }
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
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
              return `${label}: ${value} products (${percentage}%)`
            }
          }
        }
      }
    }
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
