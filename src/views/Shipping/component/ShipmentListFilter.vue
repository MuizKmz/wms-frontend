<template>
  <div class="p-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <!-- Tracking Code -->
      <div>
        <input
          v-model="filters.trackingCode"
          type="text"
          placeholder="Filter by Tracking Code"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <!-- Shipping Carrier -->
      <div>
        <input
          v-model="filters.carrier"
          type="text"
          placeholder="Filter by Shipping Carrier"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <!-- Destination -->
      <div>
        <input
          v-model="filters.destination"
          type="text"
          placeholder="Filter by Destination"
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
          :disabled="loadingStatuses"
        >
          {{ statuses.find((opt) => opt.value === filters.status)?.label || 'Filter by Status' }}
          <span
            class="icon-[tabler--chevron-down] size-4 transition-transform"
            :class="{ 'rotate-180': openDropdowns.status }"
          ></span>
        </button>
        <ul
          class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white max-h-60 overflow-y-auto"
          :class="{
            'opacity-100': openDropdowns.status,
            'opacity-0 pointer-events-none': !openDropdowns.status,
          }"
          role="menu"
          aria-orientation="vertical"
        >
          <li v-if="loadingStatuses" class="px-4 py-2 text-sm text-gray-500">
            Loading statuses...
          </li>
          <li>
            <a
              class="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-lg"
              @click="selectOption('status', '')"
              >All Statuses</a
            >
          </li>
          <li v-for="st in statuses" :key="st.value">
            <a
              class="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-lg"
              @click="selectOption('status', st.value)"
            >
              {{ st.label }}
            </a>
          </li>
        </ul>
      </div>

      <div>
        <input
          ref="datePickerRef"
          type="text"
          placeholder="Filter by Shipping Date"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <div class="flex justify-end gap-2 xl:col-span-4 lg:col-span-3 md:col-span-2 sm:col-span-1">
        <div class="flex justify-end w-full space-x-2">
          <button @click="clearFilters" class="btn btn-outline btn-error flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Clear
          </button>

          <button
            @click="applyFilters"
            class="btn bg-brand-500 hover:bg-brand-600 border-none flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
              />
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
import flatpickr from 'flatpickr'
import authenticatedFetch from '@/utils/authenticatedFetch'

const emit = defineEmits(['filter-change'])

// --- State Definitions ---

const filters = ref({
  trackingCode: '',
  carrier: '',
  destination: '',
  status: '',
  date: '', // Selected date YYYY-MM-DD
})

const statuses = ref([])
const loadingStatuses = ref(false)

const openDropdowns = reactive({
  status: false,
})

const statusDropdownRef = ref(null)
const datePickerRef = ref(null)
let flatpickrInstance = null

// --- Data Fetching ---

const fetchStatuses = async () => {
  loadingStatuses.value = true
  try {
    const statusList = [
      'Pending',
      'Preparing',
      'Ready for Dispatch',
      'In Transit',
      'Out for Delivery',
      'Delivered',
      'Failed Delivery',
      'Returned',
      'Cancelled',
    ]
    statuses.value = statusList.map((status) => ({
      label: status,
      value: status,
    }))
  } finally {
    loadingStatuses.value = false
  }
}

// --- Filter Logic ---

const applyFilters = () => {
  // Ensure the date filter is updated from flatpickr before applying
  if (flatpickrInstance) {
    filters.value.date =
      flatpickrInstance.selectedDates.length > 0
        ? flatpickrInstance.formatDate(flatpickrInstance.selectedDates[0], 'Y-m-d')
        : ''
  }
  emit('filter-change', filters.value)
}

const clearFilters = () => {
  filters.value = {
    trackingCode: '',
    carrier: '',
    destination: '',
    status: '',
    date: '',
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
  Object.keys(openDropdowns).forEach((key) => {
    if (key !== dropdownName) {
      openDropdowns[key] = false
    }
  })
  openDropdowns[dropdownName] = !openDropdowns[dropdownName]
}

const selectOption = (key, value) => {
  filters.value[key] = value
  openDropdowns[key] = false
  // Automatically apply filters when an option is selected
  applyFilters()
}

const closeAllDropdowns = () => {
  Object.keys(openDropdowns).forEach((key) => {
    openDropdowns[key] = false
  })
}

const handleClickOutside = (event) => {
  const dropdownRefs = [statusDropdownRef.value]

  // Check if click is inside any dropdown, ignoring flatpickr's own elements
  const isClickInsideDropdown = dropdownRefs.some(
    (ref) => ref && ref.closest('.dropdown') && ref.closest('.dropdown').contains(event.target),
  )

  // If the flatpickr calendar is open, don't close the dropdowns
  if (!isClickInsideDropdown && !event.target.closest('.flatpickr-calendar')) {
    closeAllDropdowns()
  }
}

// --- Lifecycle Hooks ---

onMounted(() => {
  // 1. Fetch shipment statuses
  fetchStatuses()

  // 2. Initialize flatpickr
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
      },
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
