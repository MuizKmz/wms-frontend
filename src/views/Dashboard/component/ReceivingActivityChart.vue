<template>
  <div ref="chartContainer" class="w-full h-full relative flex flex-col">
    <!-- Header with Responsive Dropdown -->
    <div class="flex justify-end mb-3 flex-shrink-0">
      <div class="relative">
        <button
          @click="toggleDropdown"
          :class="[
            'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg',
            'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
            'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all',
            isCardSmall ? 'w-[50px] justify-center' : 'min-w-[140px]'
          ]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span v-if="!isCardSmall" class="font-medium">{{ selectedRangeLabel }}</span>
          <span v-else class="font-medium">...</span>
          <svg v-if="!isCardSmall" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Dropdown Menu (Fixed Position) -->
        <div
          v-if="dropdownOpen"
          ref="dropdownMenu"
          class="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[160px] z-[9999]"
        >
          <button
            v-for="option in dateOptions"
            :key="option.value"
            @click="selectRange(option.value)"
            :class="[
              'w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
              selectedRange === option.value ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-700 dark:text-gray-300'
            ]"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <div class="w-5 h-5 border-2 border-gray-300 border-t-teal-600 rounded-full animate-spin"></div>
        <span class="text-sm">Loading receiving data...</span>
      </div>
    </div>

    <!-- Error Overlay -->
    <div v-if="error" class="absolute inset-0 flex items-center justify-center z-10 bg-white/50 dark:bg-gray-800/50">
      <div class="text-center text-orange-500">
        <svg class="mx-auto h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="text-xs font-medium">API Error - Using Mock Data</p>
      </div>
    </div>

    <!-- Chart -->
    <div v-show="!loading" class="flex-1 min-h-0">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineExpose, nextTick, computed } from 'vue'
import authenticatedFetch from '@/utils/authenticatedFetch'
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
const cardWidthObserver = ref(null)
const selectedRange = ref('30')
const dropdownOpen = ref(false)
const dropdownMenu = ref(null)
const isCardSmall = ref(false)

const API_URL = '/api/receiving/activity'

const dateOptions = [
  { value: '7', label: 'Last 7 Days' },
  { value: '30', label: 'Last 30 Days' },
  { value: '90', label: 'Last 90 Days' }
]

const selectedRangeLabel = computed(() => {
  return dateOptions.find(opt => opt.value === selectedRange.value)?.label || 'Last 30 Days'
})

const toggleDropdown = async () => {
  dropdownOpen.value = !dropdownOpen.value
  if (dropdownOpen.value) {
    await nextTick()
    positionDropdown()
  }
}

const positionDropdown = () => {
  if (!dropdownMenu.value || !chartContainer.value) return
  const button = chartContainer.value.querySelector('button')
  if (!button) return
  
  const buttonRect = button.getBoundingClientRect()
  dropdownMenu.value.style.top = `${buttonRect.bottom + 4}px`
  dropdownMenu.value.style.left = `${buttonRect.left}px`
}

const selectRange = (value) => {
  selectedRange.value = value
  dropdownOpen.value = false
  fetchData()
}

const closeDropdown = (event) => {
  if (dropdownMenu.value && !dropdownMenu.value.contains(event.target) && 
      !event.target.closest('button')?.contains(chartContainer.value?.querySelector('button > svg'))) {
    dropdownOpen.value = false
  }
}

// Mock data generator
const getMockData = (days) => {
  const labels = []
  const quantities = []
  const counts = []
  const today = new Date()
  
  for (let i = parseInt(days) - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    quantities.push(Math.floor(Math.random() * 500) + 100)
    counts.push(Math.floor(Math.random() * 20) + 5)
  }
  
  return { labels, quantities, counts }
}

const fetchData = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await authenticatedFetch(`${API_URL}?days=${selectedRange.value}`)
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
    
    // Use mock data on error
    const mockData = getMockData(selectedRange.value)
    createChart(mockData.labels, mockData.quantities, mockData.counts)
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

  // Chart resize observer
  if (chartContainer.value) {
    resizeObserver.value = new ResizeObserver(() => {
      if (chartInstance.value) {
        chartInstance.value.resize()
      }
    })
    resizeObserver.value.observe(chartContainer.value)
  }

  // Card width observer for responsive dropdown
  if (chartContainer.value) {
    cardWidthObserver.value = new ResizeObserver((entries) => {
      for (let entry of entries) {
        isCardSmall.value = entry.contentRect.width < 400
      }
    })
    cardWidthObserver.value.observe(chartContainer.value)
  }

  // Theme observer for dark mode
  const themeObserver = new MutationObserver(() => {
    if (chartInstance.value) {
      const isDarkNow = document.documentElement.classList.contains('dark')
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
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  if (chartInstance.value) chartInstance.value.destroy()
  if (resizeObserver.value) resizeObserver.value.disconnect()
  if (cardWidthObserver.value) cardWidthObserver.value.disconnect()
  document.removeEventListener('click', closeDropdown)
})

defineExpose({ refresh: fetchData })
</script>
