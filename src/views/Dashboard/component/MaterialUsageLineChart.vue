<template>
  <div class="w-full h-full relative flex flex-col overflow-visible" ref="cardContainer">
    <!-- Date Range Filter -->
    <div class="flex justify-end mb-3 flex-shrink-0">
      <div class="dropdown relative inline-flex">
        <button
          ref="rangeDropdownRef"
          type="button"
          class="dropdown-toggle btn btn-outline btn-sm dark:bg-gray-700 dark:text-gray-400 flex items-center"
          :class="isCardSmall ? 'w-[50px] justify-center px-2' : 'min-w-[140px] justify-between'"
          aria-haspopup="menu"
          :aria-expanded="isDropdownOpen"
          aria-label="Select Date Range"
          @click="toggleDropdown"
        >
          <span v-if="!isCardSmall" class="flex-1 text-left">
            {{ rangeOptions.find(opt => opt.value === selectedRange)?.label || 'Select Range' }}
          </span>
          <span v-else class="text-center font-bold">...</span>
          <span v-if="!isCardSmall" class="icon-[tabler--chevron-down] size-4 transition-transform ml-2" :class="{ 'rotate-180': isDropdownOpen }"></span>
        </button>
        <ul
          class="dropdown-menu w-[160px] transition-opacity duration-200 absolute top-full right-0 mt-1
                 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                 rounded-lg shadow-lg text-gray-900 dark:text-white"
          :class="{ 'opacity-100 visible z-[9999]': isDropdownOpen, 'opacity-0 invisible': !isDropdownOpen }"
          style="position: fixed;"
          role="menu"
          aria-orientation="vertical"
        >
          <li v-for="option in rangeOptions" :key="option.value">
            <a 
              class="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-lg whitespace-nowrap" 
              @click="selectRange(option.value)"
            >
              {{ option.label }}
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Chart Container -->
    <div class="w-full flex-1 relative min-h-0">
      <!-- Loading State -->
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg">
        <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <div class="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          <span class="text-sm">Loading chart data...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="absolute inset-0 flex items-center justify-center z-10 bg-white/50 dark:bg-gray-800/50">
        <div class="text-center text-orange-500">
          <svg class="mx-auto h-6 w-6 text-orange-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p class="text-xs font-medium">API Error - Using Mock Data</p>
        </div>
      </div>

      <!-- Actual Chart -->
      <canvas 
        v-show="!loading" 
        ref="chartCanvas"
        class="transition-opacity duration-300 w-full h-full"
        :class="{ 'opacity-0': loading, 'opacity-100': !loading }"
      ></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, defineExpose } from 'vue'
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

const chartCanvas = ref(null)
const chartInstance = ref(null)
const loading = ref(true)
const error = ref(null)
const selectedRange = ref('7')
const isDropdownOpen = ref(false)
const rangeDropdownRef = ref(null)
const cardContainer = ref(null)
const isCardSmall = ref(false)

const API_URL = '/api/material-usage'

// Dropdown options
const rangeOptions = [
  { label: 'Today', value: '1' },
  { label: 'Last 7 Days', value: '7' },
  { label: 'Last 30 Days', value: '30' }
]

// Mock data
const getMockData = () => {
  const days = parseInt(selectedRange.value)
  const labels = []
  const data = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    labels.push(`${date.getMonth() + 1}/${date.getDate()}`)
    data.push(Math.floor(Math.random() * 150) + 50)
  }
  
  return {
    labels,
    datasets: [{
      label: 'Material Used',
      data,
      borderColor: '#6366F1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointRadius: 3,
      pointHoverRadius: 5
    }]
  }
}

// Dropdown functions
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
  if (isDropdownOpen.value && rangeDropdownRef.value) {
    const rect = rangeDropdownRef.value.getBoundingClientRect()
    const dropdownMenu = rangeDropdownRef.value.nextElementSibling
    if (dropdownMenu) {
      dropdownMenu.style.top = `${rect.bottom + 4}px`
      dropdownMenu.style.left = `${rect.right - 160}px`
    }
  }
}

const selectRange = (value) => {
  selectedRange.value = value
  isDropdownOpen.value = false
  fetchData()
}

const handleClickOutside = (event) => {
  if (rangeDropdownRef.value && !rangeDropdownRef.value.closest('.dropdown').contains(event.target)) {
    isDropdownOpen.value = false
  }
}

const fetchData = async () => {
  console.log('MaterialUsageLineChart: fetchData called')
  loading.value = true
  error.value = null
  
  try {
    const response = await authenticatedFetch(API_URL)
    if (!response.ok) throw new Error('Failed to fetch material usage')
    
    const materials = await response.json()
    console.log('MaterialUsageLineChart: Received materials:', materials.length)
    
    // Process data based on selected range
    const days = parseInt(selectedRange.value)
    const dateMap = {}
    const now = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const key = date.toISOString().split('T')[0]
      dateMap[key] = 0
    }
    
    // Sum material quantities by date
    materials.forEach(material => {
      const dateField = material.usedDate || material.createdAt || material.date
      if (dateField) {
        const materialDate = new Date(dateField)
        const key = materialDate.toISOString().split('T')[0]
        if (dateMap[key] !== undefined) {
          dateMap[key] += material.quantity || material.usedQuantity || 1
        }
      }
    })
    
    const labels = Object.keys(dateMap).map(key => {
      const d = new Date(key)
      return `${d.getMonth() + 1}/${d.getDate()}`
    })
    
    const chartData = {
      labels,
      datasets: [{
        label: 'Material Used',
        data: Object.values(dateMap),
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5
      }]
    }
    
    await nextTick()
    createChart(chartData)
  } catch (e) {
    error.value = e.message
    console.error('MaterialUsageLineChart: Error, using mock data:', e)
    // Use mock data on error
    await nextTick()
    createChart(getMockData())
  } finally {
    loading.value = false
  }
}

const createChart = (data) => {
  const ctx = chartCanvas.value?.getContext('2d')
  if (!ctx) return
  
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }

  const isDarkMode = document.documentElement.classList.contains('dark')
  const textColor = isDarkMode ? '#ffffff' : '#1f2937'
  const tickColor = isDarkMode ? '#e5e7eb' : '#374151'

  chartInstance.value = new Chart(ctx, {
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
            color: textColor
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
          ticks: { color: tickColor }
        },
        y: {
          beginAtZero: true,
          grid: { display: false },
          border: { display: false },
          ticks: { color: tickColor }
        }
      }
    }
  })
}

function checkCardWidth() {
  if (cardContainer.value) {
    const width = cardContainer.value.offsetWidth
    isCardSmall.value = width < 400
  }
}

let themeObserver = null
let resizeObserver = null

onMounted(async () => {
  await fetchData()
  document.addEventListener('click', handleClickOutside)
  
  if (cardContainer.value) {
    checkCardWidth()
    resizeObserver = new ResizeObserver(() => {
      checkCardWidth()
    })
    resizeObserver.observe(cardContainer.value)
  }
  
  themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        if (chartInstance.value && chartCanvas.value) {
          const currentData = chartInstance.value.data
          createChart(currentData)
        }
      }
    })
  })
  
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})

onUnmounted(() => {
  if (chartInstance.value) chartInstance.value.destroy()
  document.removeEventListener('click', handleClickOutside)
  if (themeObserver) themeObserver.disconnect()
  if (resizeObserver && cardContainer.value) {
    resizeObserver.unobserve(cardContainer.value)
    resizeObserver.disconnect()
  }
})

defineExpose({
  refresh: fetchData
})
</script>