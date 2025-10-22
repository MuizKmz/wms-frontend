<template>
  <div ref="chartContainer" class="w-full h-full relative flex flex-col">
    <!-- Date Range Filter -->
    <div class="flex justify-end mb-3 flex-shrink-0">
      <select 
        v-model="selectedRange"
        @change="fetchData"
        class="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="all">All Time</option>
        <option value="7">Last 7 Days</option>
        <option value="30">Last 30 Days</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <div class="w-5 h-5 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
        <span class="text-sm">Loading inventory data...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <div class="text-center text-red-500">
        <p class="text-sm font-medium">Error loading data</p>
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
const selectedRange = ref('all')

const API_URL = '/api/inventory'

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(API_URL)
    if (!response.ok) throw new Error('Failed to fetch inventory')
    
    const inventory = await response.json()
    
    // Group by product and sum quantities
    const productStock = {}
    inventory.forEach(item => {
      const productName = item.product?.name || item.productName || 'Unknown'
      const quantity = item.quantity || 0
      
      if (productStock[productName]) {
        productStock[productName] += quantity
      } else {
        productStock[productName] = quantity
      }
    })

    // Get top 10 products by stock
    const sorted = Object.entries(productStock)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    const labels = sorted.map(([name]) => name)
    const data = sorted.map(([, qty]) => qty)

    createChart(labels, data)
  } catch (e) {
    error.value = e.message
    console.error('Error fetching inventory:', e)
  } finally {
    loading.value = false
  }
}

const createChart = (labels, data) => {
  const ctx = chartCanvas.value?.getContext('2d')
  if (!ctx) return
  if (chartInstance.value) chartInstance.value.destroy()

  chartInstance.value = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Stock Quantity',
        data: data,
        backgroundColor: '#10B981',
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
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
            color: '#6b7280',
            maxRotation: 45,
            minRotation: 45
          }
        },
        y: {
          beginAtZero: true,
          grid: { display: false },
          border: { display: false },
          ticks: { color: '#6b7280' },
          title: {
            display: true,
            text: 'Quantity',
            color: '#374151',
            font: { size: 12, weight: 'bold' }
          }
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
