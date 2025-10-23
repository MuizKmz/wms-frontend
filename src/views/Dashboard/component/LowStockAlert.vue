<template>
  <div ref="chartContainer" class="w-full h-full relative flex flex-col">
    <!-- Loading State -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <div class="w-5 h-5 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
        <span class="text-sm">Loading inventory...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <div class="text-center text-red-500">
        <svg class="mx-auto h-8 w-8 text-red-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="text-sm font-medium">Error loading inventory</p>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
const data = ref([])
const loading = ref(true)
const error = ref(null)
const resizeObserver = ref(null)

const API_URL = '/api/inventory'

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(API_URL)
    if (!response.ok) throw new Error('Failed to fetch inventory')
    
    const inventory = await response.json()
    
    data.value = inventory.map(item => ({
      id: item.id,
      productName: item.product?.name || item.productName || 'Unknown',
      sku: item.product?.sku || item.sku || '-',
      warehouseName: item.warehouse?.name || item.warehouseName || 'Unknown',
      quantity: item.quantity || 0,
      minStock: item.minStock || item.product?.minStock || 10
    }))

    createChart()
  } catch (e) {
    error.value = e.message
    console.error('Error fetching inventory:', e)
  } finally {
    loading.value = false
  }
}

// Filter to show only low stock items
const lowStockItems = computed(() => {
  return data.value
    .filter(item => item.quantity <= item.minStock * 1.2)
    .sort((a, b) => {
      const aRatio = a.quantity / a.minStock
      const bRatio = b.quantity / b.minStock
      return aRatio - bRatio
    })
    .slice(0, 10)
})

const getStockColor = (current, min) => {
  if (current === 0) return '#EF4444' // Red
  if (current <= min) return '#F97316' // Orange
  if (current <= min * 1.2) return '#EAB308' // Yellow
  return '#10B981' // Green
}

const createChart = () => {
  const ctx = chartCanvas.value?.getContext('2d')
  if (!ctx) return
  if (chartInstance.value) chartInstance.value.destroy()

  const items = lowStockItems.value
  
  if (items.length === 0) {
    // Show empty state message
    return
  }

  const labels = items.map(item => item.productName.length > 20 ? item.productName.substring(0, 20) + '...' : item.productName)
  const quantities = items.map(item => item.quantity)
  const minStocks = items.map(item => item.minStock)
  const colors = items.map(item => getStockColor(item.quantity, item.minStock))

  chartInstance.value = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Current Stock',
          data: quantities,
          backgroundColor: colors,
          borderRadius: 6,
          borderSkipped: false
        },
        {
          label: 'Min Stock',
          data: minStocks,
          backgroundColor: '#D1D5DB',
          borderRadius: 6,
          borderSkipped: false
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            padding: 12,
            font: { size: 11 },
            color: '#6b7280',
            usePointStyle: true,
            pointStyle: 'rectRounded'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(31, 41, 55, 0.9)',
          padding: 10,
          cornerRadius: 8,
          titleColor: '#fff',
          bodyColor: '#f9fafb',
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.x}`
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { display: false },
          border: { display: false },
          ticks: { color: '#6b7280' },
          title: {
            display: true,
            text: 'Quantity',
            color: '#374151',
            font: { size: 11, weight: 'bold' }
          }
        },
        y: {
          grid: { display: false },
          border: { display: false },
          ticks: { 
            color: '#6b7280',
            font: { size: 11 }
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
