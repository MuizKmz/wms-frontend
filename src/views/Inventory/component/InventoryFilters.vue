<template>
  <div class="p-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <div>
        <input
          v-model="filters.productName"
          type="text"
          placeholder="Filter by Product Name"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <div>
        <input
          v-model="filters.skuCode"
          type="text"
          placeholder="Filter by SKU Code"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

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

      <div class="flex justify-end gap-2 lg:col-span-4 md:col-span-2 sm:col-span-1">
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
import flatpickr from 'flatpickr'

const emit = defineEmits(['filter-change'])

// --- State Definitions ---

const filters = ref({
  productName: '',
  skuCode: '',
  status: '',
  date: '',
})

// Static status options - no API call needed
const statuses = ref([
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' }
])

const openDropdowns = reactive({
  status: false,
})

const statusDropdownRef = ref(null)
const datePickerRef = ref(null)
let flatpickrInstance = null

// --- Filter Logic ---

const applyFilters = () => {
  if (flatpickrInstance) {
    filters.value.date = flatpickrInstance.selectedDates.length > 0
      ? flatpickrInstance.formatDate(flatpickrInstance.selectedDates[0], 'Y-m-d')
      : ''
  }
  emit('filter-change', filters.value)
}

const clearFilters = () => {
  filters.value = {
    productName: '',
    skuCode: '',
    status: '',
    date: '',
  }
  
  if (flatpickrInstance) {
    flatpickrInstance.clear()
  }
  
  emit('filter-change', filters.value)
}

// --- Dropdown Helpers ---

const toggleDropdown = (dropdownName) => {
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
}

const closeAllDropdowns = () => {
  Object.keys(openDropdowns).forEach(key => {
    openDropdowns[key] = false
  })
}

const handleClickOutside = (event) => {
  const dropdownRefs = [statusDropdownRef.value]
  
  const isClickInsideDropdown = dropdownRefs.some(ref => ref && ref.closest('.dropdown') && ref.closest('.dropdown').contains(event.target))
  
  if (!isClickInsideDropdown && !event.target.closest('.flatpickr-calendar')) {
    closeAllDropdowns()
  }
}

// --- Lifecycle Hooks ---

onMounted(() => {
  // Initialize flatpickr
  if (datePickerRef.value) {
    flatpickrInstance = flatpickr(datePickerRef.value, {
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'M j, Y',
      clearButton: true,
      onChange: (selectedDates, dateStr) => {
        filters.value.date = dateStr
      }
    })
  }

  // Setup global click handler
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (flatpickrInstance) {
    flatpickrInstance.destroy()
  }
  document.removeEventListener('click', handleClickOutside)
})
</script>