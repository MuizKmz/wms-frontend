<template>
  <div ref="chartContainer" class="w-full h-full relative flex flex-col">
    <!-- Loading State -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <div
          class="w-5 h-5 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin"
        ></div>
        <span class="text-sm">Loading inventory...</span>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!error && lowStockItems.length === 0"
      class="flex-1 flex items-center justify-center"
    >
      <div class="text-center text-green-600 dark:text-green-400">
        <svg class="mx-auto h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p class="text-base font-medium">All Stock Levels Good!</p>
        <p class="text-sm mt-1 text-gray-600 dark:text-gray-400">
          No low stock alerts at this time
        </p>
      </div>
    </div>

    <!-- Chart + Table -->
    <div v-else class="flex-1 min-h-0 relative flex flex-col">
      <!-- Error Overlay -->
      <div
        v-if="error"
        class="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
      >
        <div
          class="text-center text-orange-500 bg-white/95 dark:bg-gray-800/95 p-3 rounded-lg shadow-lg border-2 border-orange-400 pointer-events-auto"
        >
          <svg
            class="mx-auto h-6 w-6 text-orange-400 mb-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <p class="text-xs font-medium">API Error - Using Mock Data</p>
        </div>
      </div>

      <!-- Chart -->
      <div class="flex-1 min-h-[250px]">
        <canvas
          v-show="!loading"
          ref="chartCanvas"
          class="transition-opacity duration-300 w-full h-full"
          :class="{ 'opacity-0': loading, 'opacity-100': !loading }"
        ></canvas>
      </div>

      <!-- 📊 Table with Product Info -->
      <div class="mt-4 overflow-x-auto">
        <table class="w-full text-sm border-t border-gray-200 dark:border-gray-700">
          <thead class="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <tr>
              <th class="py-2 px-3 text-left">Product</th>
              <th class="py-2 px-3 text-left">Warehouse</th>
              <th class="py-2 px-3 text-right">Quantity</th>
              <th class="py-2 px-3 text-right">Min Stock</th>
              <th class="py-2 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in lowStockItems"
              :key="item.id"
              class="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
            >
              <td class="py-2 px-3 font-medium text-gray-900 dark:text-gray-100">
                {{ item.productName }}
              </td>
              <td class="py-2 px-3">{{ item.warehouseName }}</td>
              <td class="py-2 px-3 text-right">{{ item.quantity }}</td>
              <td class="py-2 px-3 text-right">{{ item.minStock }}</td>
              <td class="py-2 px-3 text-right">
                <span
                  class="inline-block px-2 py-0.5 rounded text-xs font-semibold"
                  :class="{
                    'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400':
                      item.quantity <= item.minStock,
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400':
                      item.quantity <= item.minStock * 1.2 && item.quantity > item.minStock,
                    'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400':
                      item.quantity > item.minStock * 1.2,
                  }"
                >
                  {{ getStockStatus(item) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import authenticatedFetch from '@/utils/authenticatedFetch'
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  Tooltip,
  Legend,
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

const getMockData = () => [
  {
    id: 'm1',
    productName: 'Product A',
    sku: 'SKU-A001',
    quantity: 5,
    minStock: 20,
    warehouseName: 'Warehouse 1',
  },
  {
    id: 'm2',
    productName: 'Product B',
    sku: 'SKU-B002',
    quantity: 8,
    minStock: 15,
    warehouseName: 'Warehouse 2',
  },
  {
    id: 'm3',
    productName: 'Product C',
    sku: 'SKU-C003',
    quantity: 12,
    minStock: 25,
    warehouseName: 'Warehouse 1',
  },
  {
    id: 'm4',
    productName: 'Product D',
    sku: 'SKU-D004',
    quantity: 3,
    minStock: 18,
    warehouseName: 'Warehouse 3',
  },
  {
    id: 'm5',
    productName: 'Product E',
    sku: 'SKU-E005',
    quantity: 15,
    minStock: 30,
    warehouseName: 'Warehouse 1',
  },
  {
    id: 'm6',
    productName: 'Product F',
    sku: 'SKU-F006',
    quantity: 0,
    minStock: 12,
    warehouseName: 'Warehouse 2',
  },
  {
    id: 'm7',
    productName: 'Product G',
    sku: 'SKU-G007',
    quantity: 7,
    minStock: 20,
    warehouseName: 'Warehouse 1',
  },
  {
    id: 'm8',
    productName: 'Product H',
    sku: 'SKU-H008',
    quantity: 18,
    minStock: 35,
    warehouseName: 'Warehouse 3',
  },
  {
    id: 'm9',
    productName: 'Product I',
    sku: 'SKU-I009',
    quantity: 2,
    minStock: 15,
    warehouseName: 'Warehouse 1',
  },
  {
    id: 'm10',
    productName: 'Product J',
    sku: 'SKU-J010',
    quantity: 10,
    minStock: 22,
    warehouseName: 'Warehouse 2',
  },
]

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await authenticatedFetch(API_URL)
    if (!response.ok) throw new Error('Failed to fetch inventory')

    const inventory = await response.json()

    data.value = inventory.map((item) => ({
      id: item.id,
      productName: item.product?.name || item.productName || 'Unknown',
      sku: item.product?.sku || item.sku || '-',
      warehouseName: item.warehouse?.name || item.warehouseName || 'Unknown',
      quantity: item.quantity || 0,
      minStock: item.minStock || item.product?.minStock || 10,
    }))

    createChart()
  } catch (e) {
    error.value = e.message
    console.error('Error fetching inventory:', e)
    // Use mock data on error
    data.value = getMockData()
    createChart()
  } finally {
    loading.value = false
  }
}

// Filter to show only low stock items
const lowStockItems = computed(() => {
  return data.value
    .filter((item) => item.quantity <= item.minStock * 1.2)
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

const createChart = async () => {
  await nextTick()
  const ctx = chartCanvas.value?.getContext('2d')
  if (!ctx) return
  if (chartInstance.value) chartInstance.value.destroy()

  const items = lowStockItems.value

  if (items.length === 0) {
    // Show empty state message
    return
  }

  const isDarkMode = document.documentElement.classList.contains('dark')
  const textColor = isDarkMode ? '#e5e7eb' : '#374151'
  const labels = items.map((item) =>
    item.productName.length > 20 ? item.productName.substring(0, 20) + '...' : item.productName,
  )
  const quantities = items.map((item) => item.quantity)
  const minStocks = items.map((item) => item.minStock)
  const colors = items.map((item) => getStockColor(item.quantity, item.minStock))

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
          borderSkipped: false,
          barThickness: 'flex',
          maxBarThickness: 28,
        },
        {
          label: 'Min Stock',
          data: minStocks,
          backgroundColor: '#D1D5DB',
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
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
            pointStyle: 'rectRounded',
          },
        },
        tooltip: {
          backgroundColor: 'rgba(31, 41, 55, 0.9)',
          padding: 10,
          cornerRadius: 8,
          titleColor: '#fff',
          bodyColor: '#f9fafb',
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.parsed.x}`
            },
          },
        },
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
            font: { size: 11, weight: 'bold' },
          },
        },
        y: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            color: '#6b7280',
            font: { size: 11 },
          },
        },
      },
    },
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
