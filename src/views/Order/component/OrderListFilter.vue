<template>
  <div class="p-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <!-- Order Number -->
      <div>
        <input
          v-model="filters.orderNumber"
          type="text"
          placeholder="Filter by Order Number"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <!-- Customer ID -->
      <div>
        <input
          v-model="filters.customerCode"
          type="text"
          placeholder="Filter by Customer ID"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <!-- Status Dropdown -->
      <div class="dropdown relative inline-flex w-full">
        <button
          ref="statusDropdownRef"
          type="button"
          class="dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400"
          aria-haspopup="menu"
          :aria-expanded="openDropdowns.status"
          aria-label="Filter by Status"
          @click="toggleDropdown('status')"
        >
          {{ statuses.find(opt => opt.value === filters.status)?.label || 'Filter by Status' }}
          <span class="icon-[tabler--chevron-down] size-4 transition-transform" :class="{ 'rotate-180': openDropdowns.status }"></span>
        </button>
        <ul
          class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1
                 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white max-h-60 overflow-y-auto"
          :class="{ 'opacity-100': openDropdowns.status, 'opacity-0 pointer-events-none': !openDropdowns.status }"
          role="menu"
          aria-orientation="vertical"
        >
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-lg" @click="selectOption('status', '')">All Statuses</a></li>
          <li v-for="status in statuses" :key="status.value">
            <a class="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-lg" @click="selectOption('status', status.value)">
              {{ status.label }}
            </a>
          </li>
        </ul>
      </div>

      <div>
        <input
          ref="datePickerRef"
          type="text"
          placeholder="Filter by Date"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <div class="flex justify-end gap-2 xl:col-span-4 lg:col-span-3 md:col-span-2 sm:col-span-1">
        <div class="flex justify-end w-full space-x-2">
          <button
            @click="clearFilters"
            class="btn btn-outline btn-error flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Clear
          </button>

          <button
            @click="applyFilters"
            class="btn btn-primary flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"/>
            </svg>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, defineEmits, onMounted, onUnmounted } from 'vue'
import flatpickr from 'flatpickr' // Flatpickr import

const emit = defineEmits(['filter-change'])

// --- State Definitions ---

const filters = ref({
  orderNumber: '',
  customerCode: '',
  status: '',
  date: '', // Stores the selected date string
})

// Fixed status options (adjust as needed)
const statuses = ref([
  { label: 'Processing', value: 'Processing' },
  { label: 'Preparing', value: 'Preparing' },
  { label: 'Confirmed', value: 'Confirmed' },
  { label: 'Shipped', value: 'Shipped' },
])

const openDropdowns = reactive({
  status: false,
})

const statusDropdownRef = ref(null)
const datePickerRef = ref(null)
let flatpickrInstance = null

// --- Filter Logic ---

const applyFilters = () => {
  // Ensure the date filter is updated from flatpickr before applying
  if (flatpickrInstance) {
    filters.value.date = flatpickrInstance.selectedDates.length > 0
      ? flatpickrInstance.formatDate(flatpickrInstance.selectedDates[0], 'Y-m-d')
      : ''
  }
  emit('filter-change', filters.value)
}

const clearFilters = () => {
  filters.value = {
    orderNumber: '',
    customerCode: '',
    status: '',
    date: '', // Clear the internal date state
  }

  // Clear the flatpickr input visually and internally
  if (flatpickrInstance) {
    flatpickrInstance.clear()
  }

  emit('filter-change', filters.value)
}

// --- Dropdown Helpers ---

const toggleDropdown = (dropdownName) => {
  // Close all other dropdowns
  Object.keys(openDropdowns).forEach(key => {
    if (key !== dropdownName) {
      openDropdowns[key] = false
    }
  })
  openDropdowns[dropdownName] = !openDropdowns[dropdownName]
}

const selectOption = (key, value) => {
  filters.value[key] = value
  openDropdowns[key] = false
  // Apply filters automatically after selection if preferred, or rely on the Apply button
  // applyFilters()
}

const closeAllDropdowns = () => {
  Object.keys(openDropdowns).forEach(key => {
    openDropdowns[key] = false
  })
}

const handleClickOutside = (event) => {
  const dropdownRefs = [statusDropdownRef.value]

  // Check if click is inside any dropdown, ignoring flatpickr's own elements
  const isClickInsideDropdown = dropdownRefs.some(ref => ref && ref.closest('.dropdown') && ref.closest('.dropdown').contains(event.target))

  // If the flatpickr calendar is open, don't close the dropdowns
  if (!isClickInsideDropdown && !event.target.closest('.flatpickr-calendar')) {
    closeAllDropdowns()
  }
}

// --- Lifecycle Hooks ---

onMounted(() => {
  // 1. Initialize flatpickr
  if (datePickerRef.value) {
    flatpickrInstance = flatpickr(datePickerRef.value, {
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'M j, Y',
      clearButton: true,
      onChange: (selectedDates, dateStr) => {
        // Update the filter state when a date is selected/changed
        filters.value.date = dateStr
        // applyFilters() // Auto-apply on date change
      }
    })
  }

  // 2. Setup global click handler
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  // 1. Destroy flatpickr instance
  if (flatpickrInstance) {
    flatpickrInstance.destroy()
  }
  // 2. Cleanup global click handler
  document.removeEventListener('click', handleClickOutside)
})
</script>
