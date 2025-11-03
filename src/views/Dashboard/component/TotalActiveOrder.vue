<template>
  <div class="w-full h-full relative flex flex-col p-6 overflow-visible" ref="cardContainer">
    <!-- Header with Dropdown -->
    <div class="flex justify-between items-center mb-6 flex-shrink-0">
      
      <div class="dropdown relative inline-flex ml-auto">
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

    <!-- Total Number Display -->
    <div class="flex-1 flex items-center justify-center">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <div class="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <span class="text-sm">Loading...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center text-red-500">
        <svg class="mx-auto h-8 w-8 text-red-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="text-sm font-medium">Error loading orders</p>
        <p class="text-xs mt-1">{{ error }}</p>
      </div>

      <!-- Total Count -->
      <div v-else class="text-center">
        <div class="text-6xl font-bold text-blue-600 dark:text-blue-400 transition-all duration-300">
          {{ totalActiveOrders }}
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Active Orders</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineExpose } from 'vue'
import authenticatedFetch from '@/utils/authenticatedFetch'

const loading = ref(true)
const error = ref(null)
const selectedRange = ref('7')
const isDropdownOpen = ref(false)
const rangeDropdownRef = ref(null)
const totalActiveOrders = ref(0)
const cardContainer = ref(null)
const isCardSmall = ref(false)
const dropdownPosition = ref({ top: 0, left: 0 })

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
  console.log('TotalActiveOrder: fetchData called')
  loading.value = true
  error.value = null
  try {
    console.log('TotalActiveOrder: Fetching from', API_URL)
    const response = await authenticatedFetch(API_URL)
    console.log('TotalActiveOrder: Response status:', response.status)
    if (!response.ok) throw new Error('Failed to fetch orders')
    
    const orders = await response.json()
    console.log('TotalActiveOrder: Received orders:', orders.length)
    
    // Calculate date range
    const days = parseInt(selectedRange.value)
    const now = new Date()
    const startDate = new Date(now)
    
    if (days === 1) {
      // Today: from start of today
      startDate.setHours(0, 0, 0, 0)
    } else {
      // Last N days
      startDate.setDate(startDate.getDate() - days)
      startDate.setHours(0, 0, 0, 0)
    }
    
    // Filter active orders within date range
    // Active orders are those NOT in 'Completed' or 'Cancelled' status
    const activeStatuses = ['Created', 'Processing', 'Confirmed', 'Shipped']
    const filteredOrders = orders.filter(order => {
      const dateField = order.orderDate || order.createdAt || order.date || order.created_at
      const status = order.orderStatus || order.status || 'Created'
      
      if (!dateField) return false
      
      const orderDate = new Date(dateField)
      return orderDate >= startDate && orderDate <= now && activeStatuses.includes(status)
    })
    
    totalActiveOrders.value = filteredOrders.length
    console.log('TotalActiveOrder: Total active orders:', totalActiveOrders.value)
    
    loading.value = false
  } catch (e) {
    error.value = e.message
    console.error('TotalActiveOrder: Error fetching orders:', e)
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

// ResizeObserver to watch card size changes
let resizeObserver = null

onMounted(async () => {
  console.log('TotalActiveOrder: Component mounted')
  
  try {
    await fetchData()
  } catch (e) {
    console.error('TotalActiveOrder: Error in onMounted:', e)
    error.value = e.message || 'Failed to load data'
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
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
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
