<template>
  <div ref="chartContainer" class="w-full h-full relative">
    <!-- Loading State -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg">
      <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <div class="w-5 h-5 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
        <span class="text-sm">Loading chart data...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="absolute inset-0 flex items-center justify-center">
      <div class="text-center text-red-500">
        <svg class="mx-auto h-8 w-8 text-red-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="text-sm font-medium">Error loading material usage</p>
        <p class="text-xs mt-1">{{ error }}</p>
      </div>
    </div>

    <!-- Actual Chart -->
    <canvas 
      v-show="!loading && !error" 
      ref="lineChartCanvas"
      class="transition-opacity duration-300"
      :class="{ 'opacity-0': loading, 'opacity-100': !loading }"
    ></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import authenticatedFetch from '@/utils/authenticatedFetch'
import {
  Chart,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js'

Chart.register(
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  Legend
)

const chartContainer = ref(null)
const lineChartCanvas = ref(null)
const lineChartInstance = ref(null)
const loading = ref(true)
const error = ref(null)
const resizeObserver = ref(null)

// Dropdown state
const selectedRange = ref('Last 7 Days')
const selectedMaterial = ref('Rubber')

// ✅ Mock Data
const mockLineData = {
  labels: ['Sep 01', 'Sep 02', 'Sep 03', 'Sep 04', 'Sep 05', 'Sep 06', 'Sep 07'],
  datasets: [
    {
      label: 'Quantity Used',
      data: [120, 150, 100, 130, 170, 140, 160],
      borderColor: '#6366F1',       // Indigo-500
      backgroundColor: '#6366F1',
      pointBackgroundColor: '#6366F1',
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBorderWidth: 0,
      borderWidth: 2.5,
      tension: 0.45,               
      fill: false
    }
  ]
}

const fetchMaterialUsageData = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await authenticatedFetch('/api/material-usage/chart-data')
    if (!response.ok) throw new Error('Failed to fetch material usage')
    const data = await response.json()
    if (!data || !data.labels || !data.datasets) throw new Error('Invalid API format')
    return data
  } catch (err) {
    error.value = err.message
    console.error('Error fetching material usage:', err)
    return mockLineData
  } finally {
    loading.value = false
  }
}

const createLineChart = (data) => {
  const ctx = lineChartCanvas.value?.getContext('2d')
  if (!ctx) return
  if (lineChartInstance.value) lineChartInstance.value.destroy()

  lineChartInstance.value = new Chart(ctx, {
    type: 'line',
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 600,
        easing: 'easeInOutCubic'
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            font: { size: 13 },
            color: '#374151',
            generateLabels: function(chart) {
              const original = Chart.defaults.plugins.legend.labels.generateLabels;
              const labels = original.call(this, chart);
              
              labels.forEach((label) => {
                label.fillStyle = chart.data.datasets[label.datasetIndex].borderColor;
                label.strokeStyle = chart.data.datasets[label.datasetIndex].borderColor;
              });
              
              return labels;
            }
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
          title: {
            display: false,
            text: 'Date',
            font: { weight: 'bold', size: 14 },
            color: '#111827'
          },
          ticks: { color: '#6b7280' }
        },
        y: {
          beginAtZero: true,
          grid: { display: false },
          border: { display: false },
          title: {
            display: true,
            text: 'Quantity Used',
            font: { weight: 'bold', size: 14 },
            color: '#111827'
          },
          ticks: { color: '#6b7280'}
        }
      }
    }
  })
}

onMounted(async () => {
  await nextTick()
  
  const data = await fetchMaterialUsageData()
  if (!error.value) {
    createLineChart(data)
  }

  // Setup resize observer
  if (chartContainer.value) {
    resizeObserver.value = new ResizeObserver(() => {
      if (lineChartInstance.value) {
        lineChartInstance.value.resize()
      }
    })
    resizeObserver.value.observe(chartContainer.value)
  }
})

onUnmounted(() => {
  if (lineChartInstance.value) lineChartInstance.value.destroy()
  if (resizeObserver.value) resizeObserver.value.disconnect()
})
</script>