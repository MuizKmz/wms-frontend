<template>
  <div class="w-full h-full relative flex flex-col">
    <!-- Date Range Filter -->
    <div class="flex justify-end mb-3 flex-shrink-0">
      <div class="dropdown relative inline-flex">
        <button
          ref="rangeDropdownRef"
          type="button"
          class="dropdown-toggle btn btn-outline btn-sm justify-between dark:bg-gray-700 dark:text-gray-400 min-w-[140px]"
          aria-haspopup="menu"
          :aria-expanded="isDropdownOpen"
          aria-label="Select Date Range"
          @click="toggleDropdown"
        >
          {{ rangeOptions.find(opt => opt.value === selectedRange)?.label || 'Select Range' }}
          <span class="icon-[tabler--chevron-down] size-4 transition-transform ml-2" :class="{ 'rotate-180': isDropdownOpen }"></span>
        </button>
        <ul
          class="dropdown-menu min-w-full transition-opacity duration-200 absolute top-full left-0 mt-1
                 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white"
          :class="{ 'opacity-100': isDropdownOpen, 'opacity-0 pointer-events-none': !isDropdownOpen }"
          role="menu"
          aria-orientation="vertical"
        >
          <li v-for="option in rangeOptions" :key="option.value">
            <a 
              class="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-lg" 
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
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
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
    const response = await fetch(API_URL)
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
          const status = order.orderStatus || order.status || 'Created'
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
  console.log('WorkOrderBarChart: createChart called with data:', data)
  
  const ctx = chartCanvas.value?.getContext('2d')
  if (!ctx) {
    console.error('WorkOrderBarChart: Canvas context not available!')
    return
  }
  
  console.log('WorkOrderBarChart: Canvas context obtained')
  if (chartInstance.value) {
    console.log('WorkOrderBarChart: Destroying previous chart instance')
    chartInstance.value.destroy()
  }

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
            color: '#374151'
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
          ticks: { color: '#6b7280' }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          grid: { display: false },
          border: { display: false },
          ticks: { color: '#6b7280' }
        }
      }
    }
  })
  
  console.log('WorkOrderBarChart: Chart instance created successfully')
  loading.value = false
}

onMounted(async () => {
  console.log('WorkOrderBarChart: Component mounted')
  await fetchData()
  
  // Setup click outside handler for dropdown
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (chartInstance.value) chartInstance.value.destroy()
  document.removeEventListener('click', handleClickOutside)
})
</script>