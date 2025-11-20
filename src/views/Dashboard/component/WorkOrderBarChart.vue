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

    <!-- Chart Container - flex-1 to fill remaining space -->
    <div class="w-full flex-1 relative min-h-0">
      <!-- Loading State -->
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg">
        <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <div class="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
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
          <p class="text-sm font-medium">Error loading work orders</p>
          <p class="text-xs mt-1">{{ error }}</p>
        </div>
      </div>

      <!-- Actual Chart -->
      <canvas 
        v-show="!loading && !error" 
        ref="chartCanvas"
        class="transition-opacity duration-300 w-full h-full"
        :class="{ 'opacity-0': loading, 'opacity-100': !loading && !error }"
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
  BarController,
  BarElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

Chart.register(
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
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

const API_URL = '/api/order'

// Dropdown options
const rangeOptions = [
  { label: 'Today', value: '1' },
  { label: 'Last 7 Days', value: '7' },
  { label: 'Last 30 Days', value: '30' }
]

// Dropdown functions
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
  if (isDropdownOpen.value && rangeDropdownRef.value) {
    // Calculate dropdown position relative to viewport
    const rect = rangeDropdownRef.value.getBoundingClientRect()
    const dropdownMenu = rangeDropdownRef.value.nextElementSibling
    if (dropdownMenu) {
      dropdownMenu.style.top = `${rect.bottom + 4}px`
      dropdownMenu.style.left = `${rect.right - 160}px` // Align right edge
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
  console.log('WorkOrderBarChart: fetchData called')
  loading.value = true
  error.value = null
  try {
    console.log('WorkOrderBarChart: Fetching from', API_URL)
    const response = await authenticatedFetch(API_URL)
    console.log('WorkOrderBarChart: Response status:', response.status)
    if (!response.ok) throw new Error('Failed to fetch orders')
    
    const orders = await response.json()
    console.log('WorkOrderBarChart: Received orders:', orders.length, orders)
    
    // Group orders by date and status
    const days = parseInt(selectedRange.value)
    console.log('WorkOrderBarChart: Selected range days:', days)
    const dateMap = {}
    const now = new Date()
    
    if (days === 1) {
      // Initialize 24 hours for today
      for (let hour = 0; hour < 24; hour++) {
        const key = `${hour}:00`
        dateMap[key] = { Created: 0, Processing: 0, Confirmed: 0, Shipped: 0, Completed: 0, Cancelled: 0 }
      }
    } else {
      // Initialize last N days with all possible statuses
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        const key = date.toISOString().split('T')[0]
        dateMap[key] = { Created: 0, Processing: 0, Confirmed: 0, Shipped: 0, Completed: 0, Cancelled: 0 }
      }
    }
    
    // Count orders by date/hour and status
    orders.forEach(order => {
      const dateField = order.orderDate || order.createdAt || order.date || order.created_at
      if (dateField) {
        const orderDate = new Date(dateField)
        
        let key
        if (days === 1) {
          // Group by hour for today
          const todayStart = new Date()
          todayStart.setHours(0, 0, 0, 0)
          const todayEnd = new Date()
          todayEnd.setHours(23, 59, 59, 999)
          
          if (orderDate >= todayStart && orderDate <= todayEnd) {
            const hour = orderDate.getHours()
            key = `${hour}:00`
          }
        } else {
          // Group by date
          key = orderDate.toISOString().split('T')[0]
        }
        
        if (key && dateMap[key]) {
          const status = order.orderStatus || order.status || 'PENDING'
          if (dateMap[key][status] !== undefined) {
            dateMap[key][status]++
          }
        }
      }
    })
    
    // Prepare chart data
    const labels = Object.keys(dateMap).map(key => {
      if (days === 1) {
        // For today, show hour format
        return key
      } else {
        // For other days, show date format
        const d = new Date(key)
        return `${d.getMonth() + 1}/${d.getDate()}`
      }
    })
    
    const datasets = [
      {
        label: 'Created',
        data: Object.values(dateMap).map(d => d.Created),
        backgroundColor: '#FF74C7',
        borderSkipped: false
      },
      {
        label: 'Processing',
        data: Object.values(dateMap).map(d => d.Processing),
        backgroundColor: '#FF5F5F',
        borderSkipped: false
      },
      {
        label: 'Confirmed',
        data: Object.values(dateMap).map(d => d.Confirmed),
        backgroundColor: '#FF0097',
        borderSkipped: false
      },
      {
        label: 'Shipped',
        data: Object.values(dateMap).map(d => d.Shipped),
        backgroundColor: '#8B5CF6',
        borderSkipped: false
      },
      {
        label: 'Completed',
        data: Object.values(dateMap).map(d => d.Completed),
        backgroundColor: '#10B981',
        borderSkipped: false
      },
      {
        label: 'Cancelled',
        data: Object.values(dateMap).map(d => d.Cancelled),
        backgroundColor: '#EF4444',
        borderSkipped: false
      }
    ]
    
    console.log('WorkOrderBarChart: Chart data prepared:', { labels, datasets })
    
    // Wait for DOM update before creating chart
    await nextTick()
    console.log('WorkOrderBarChart: After nextTick, canvas ref:', chartCanvas.value)
    
    createChart({ labels, datasets })
  } catch (e) {
    error.value = e.message
    console.error('WorkOrderBarChart: Error fetching orders:', e)
    loading.value = false
  }
}

const createChart = (data) => {
  try {
    console.log('WorkOrderBarChart: createChart called with data:', data)
    
    const ctx = chartCanvas.value?.getContext('2d')
    if (!ctx) {
      console.error('WorkOrderBarChart: Canvas context not available!')
      error.value = 'Canvas not available'
      loading.value = false
      return
    }
    
    console.log('WorkOrderBarChart: Canvas context obtained')
    if (chartInstance.value) {
      console.log('WorkOrderBarChart: Destroying previous chart instance')
      chartInstance.value.destroy()
    }

    // Check if dark mode is active
    const isDarkMode = document.documentElement.classList.contains('dark')
    const textColor = isDarkMode ? '#ffffff' : '#1f2937'
    const tickColor = isDarkMode ? '#e5e7eb' : '#374151'

    chartInstance.value = new Chart(ctx, {
      type: 'bar',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 600,
          easing: 'easeInOutCubic'
        },
        datasets: {
          bar: {
            barPercentage: 0.7,
            categoryPercentage: 0.85
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              pointStyle: 'rectRounded',
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
            stacked: true,
            grid: { display: false },
            border: { display: false },
            ticks: { color: tickColor }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            grid: { display: false },
            border: { display: false },
            ticks: { color: tickColor }
          }
        }
      }
    })
    
    console.log('WorkOrderBarChart: Chart instance created successfully')
    loading.value = false
  } catch (e) {
    console.error('WorkOrderBarChart: Error creating chart:', e)
    error.value = 'Failed to create chart'
    loading.value = false
  }
}

// Check card width to determine if dropdown should be compact
function checkCardWidth() {
  if (cardContainer.value) {
    const width = cardContainer.value.offsetWidth
    isCardSmall.value = width < 400 // If card is less than 400px wide, show "..."
  }
}

// Observer for theme changes
let themeObserver = null
let resizeObserver = null

onMounted(async () => {
  console.log('WorkOrderBarChart: Component mounted')
  
  try {
    await fetchData()
  } catch (e) {
    console.error('WorkOrderBarChart: Error in onMounted:', e)
    error.value = e.message || 'Failed to initialize chart'
    loading.value = false
  }
  
  // Setup click outside handler for dropdown
  document.addEventListener('click', handleClickOutside)
  
  // Watch for card resize
  if (cardContainer.value) {
    checkCardWidth()
    resizeObserver = new ResizeObserver(() => {
      checkCardWidth()
    })
    resizeObserver.observe(cardContainer.value)
  }
  
  // Watch for theme changes
  themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        // Theme changed, recreate chart if it exists
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

// Expose refresh method to parent
defineExpose({
  refresh: fetchData
})
</script>