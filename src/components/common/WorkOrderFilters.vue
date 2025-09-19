<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
      <!-- Filter by Work Order -->
      <div>
        <input
          v-model="filters.workOrder"
          type="text"
          placeholder="Filter by Work Order"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <!-- Filter by Compounding Lot No. -->
      <div>
        <input
          v-model="filters.compoundingLot"
          type="text"
          placeholder="Filter by Compounding Lot No."
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <!-- Filter by Status -->
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
          {{ filters.status || 'Filter by Status' }}
          <span class="icon-[tabler--chevron-down] size-4 transition-transform" :class="{ 'rotate-180': openDropdowns.status }"></span>
        </button>
        <ul 
          class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 
                 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white" 
          :class="{ 'opacity-100': openDropdowns.status, 'opacity-0 pointer-events-none': !openDropdowns.status }"
          role="menu" 
          aria-orientation="vertical"
        >
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('status', '')">Filter by Status</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('status', 'issued')">Issued</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('status', 'draft')">Draft</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('status', 'completed')">Completed</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('status', 'cancelled')">Cancelled</a></li>
        </ul>
      </div>

      <!-- Filter by Priority -->
      <div class="dropdown relative inline-flex w-full">
        <button 
          ref="priorityDropdownRef"
          type="button" 
          class="dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400" 
          aria-haspopup="menu" 
          :aria-expanded="openDropdowns.priority"
          aria-label="Filter by Priority"
          @click="toggleDropdown('priority')"
        >
          {{ filters.priority || 'Filter by Priority' }}
          <span class="icon-[tabler--chevron-down] size-4 transition-transform" :class="{ 'rotate-180': openDropdowns.priority }"></span>
        </button>
        <ul 
          class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 
                 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white" 
          :class="{ 'opacity-100': openDropdowns.priority, 'opacity-0 pointer-events-none': !openDropdowns.priority }"
          role="menu" 
          aria-orientation="vertical"
        >
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('priority', '')">Filter by Priority</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('priority', 'high')">High</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('priority', 'medium')">Medium</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('priority', 'low')">Low</a></li>
        </ul>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Filter by Acknowledgement -->
      <div class="dropdown relative inline-flex w-full">
        <button 
          ref="acknowledgementDropdownRef"
          type="button" 
          class="dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400" 
          aria-haspopup="menu" 
          :aria-expanded="openDropdowns.acknowledgement"
          aria-label="Filter by Acknowledgement"
          @click="toggleDropdown('acknowledgement')"
        >
          {{ filters.acknowledgement || 'Filter by Acknowledgement' }}
          <span class="icon-[tabler--chevron-down] size-4 transition-transform" 
                :class="{ 'rotate-180': openDropdowns.acknowledgement }"></span>
        </button>
        <ul 
          class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 
                 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white" 
          :class="{ 'opacity-100': openDropdowns.acknowledgement, 'opacity-0 pointer-events-none': !openDropdowns.acknowledgement }"
          role="menu" 
          aria-orientation="vertical"
        >
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('acknowledgement', '')">Filter by Acknowledgement</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('acknowledgement', 'acknowledged')">Acknowledged</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('acknowledgement', 'not yet acknowledge')">Not yet acknowledge</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('acknowledgement', 'rejected')">Rejected</a></li>
        </ul>
      </div>

      <!-- Filter by Created Date -->
      <div>
        <input
          ref="datePickerRef"
          v-model="filters.createdDate"
          type="text"
          placeholder="Select Created Date"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          readonly
        />
      </div>

      <!-- Action Buttons -->
      <div class="md:col-span-2 flex justify-end gap-2">
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
</template>

<script setup>
import { ref, defineEmits, onMounted, onUnmounted } from 'vue'
import flatpickr from 'flatpickr'

const emit = defineEmits(['filter-change'])

const filters = ref({
  workOrder: '',
  compoundingLot: '',
  status: '',
  priority: '',
  acknowledgement: '',
  createdDate: ''
})

const openDropdowns = ref({
  status: false,
  priority: false,
  acknowledgement: false
})

const statusDropdownRef = ref(null)
const priorityDropdownRef = ref(null)
const acknowledgementDropdownRef = ref(null)
const datePickerRef = ref(null)
let flatpickrInstance = null

const applyFilters = () => {
  emit('filter-change', filters.value)
}

const clearFilters = () => {
  filters.value = {
    workOrder: '',
    compoundingLot: '',
    status: '',
    priority: '',
    acknowledgement: '',
    createdDate: ''
  }
  
  if (flatpickrInstance) {
    flatpickrInstance.clear()
  }
  
  emit('filter-change', filters.value)
}

const toggleDropdown = (dropdownName) => {
  Object.keys(openDropdowns.value).forEach(key => {
    if (key !== dropdownName) {
      openDropdowns.value[key] = false
    }
  })
  openDropdowns.value[dropdownName] = !openDropdowns.value[dropdownName]
}

const selectOption = (key, value) => {
  filters.value[key] = value
  openDropdowns.value[key] = false
}

const closeAllDropdowns = () => {
  Object.keys(openDropdowns.value).forEach(key => {
    openDropdowns.value[key] = false
  })
}

const handleClickOutside = (event) => {
  const dropdownRefs = [statusDropdownRef.value, priorityDropdownRef.value, acknowledgementDropdownRef.value]
  const isClickInside = dropdownRefs.some(ref => ref && ref.closest('.dropdown') && ref.closest('.dropdown').contains(event.target))
  if (!isClickInside) {
    closeAllDropdowns()
  }
}

onMounted(() => {
  if (datePickerRef.value) {
    flatpickrInstance = flatpickr(datePickerRef.value, {
      dateFormat: 'Y-m-d',
      allowInput: true,
      clickOpens: true,
      onChange: (selectedDates, dateStr) => {
        filters.value.createdDate = dateStr
      }
    })
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (flatpickrInstance) {
    flatpickrInstance.destroy()
  }
  document.removeEventListener('click', handleClickOutside)
})
</script>
