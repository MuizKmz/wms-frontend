<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <!-- Filter by Job Order ID -->
      <div>
        <input v-model="filters.jobOrderId" type="text" placeholder="Filter by Job Order ID"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" />
      </div>

      <!-- Filter by Product Name -->
      <div>
        <input v-model="filters.productName" type="text" placeholder="Filter by Product Name"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" />
      </div>

      <!-- Filter by Process Flow -->
      <div class="dropdown relative inline-flex w-full">
        <button ref="processFlowDropdownRef" type="button"
          class="dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400"
          aria-haspopup="menu" :aria-expanded="openDropdowns.processFlow" aria-label="Filter by Process Flow"
          @click="toggleDropdown('processFlow')">
          {{ filters.processFlow || 'Filter by Process Flow' }}
          <span class="icon-[tabler--chevron-down] size-4 transition-transform"
            :class="{ 'rotate-180': openDropdowns.processFlow }"></span>
        </button>
        <ul class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 
                 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white"
          :class="{ 'opacity-100': openDropdowns.processFlow, 'opacity-0 pointer-events-none': !openDropdowns.processFlow }"
          role="menu" aria-orientation="vertical">
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
              @click="selectOption('processFlow', '')">Filter by Process Flow</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
              @click="selectOption('processFlow', 'mixing')">Mixing</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
              @click="selectOption('processFlow', 'compounding')">Compounding</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
              @click="selectOption('processFlow', 'molding')">Molding</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
              @click="selectOption('processFlow', 'packaging')">Packaging</a></li>
        </ul>
      </div>

      <!-- Filter by Machine Name -->
      <div>
        <input v-model="filters.machineName" type="text" placeholder="Filter by Machine Name"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Filter by Shift -->
      <div class="dropdown relative inline-flex w-full">
        <button ref="shiftDropdownRef" type="button"
          class="dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400"
          aria-haspopup="menu" :aria-expanded="openDropdowns.shift" aria-label="Filter by Shift"
          @click="toggleDropdown('shift')">
          {{ filters.shift || 'Filter by Shift' }}
          <span class="icon-[tabler--chevron-down] size-4 transition-transform"
            :class="{ 'rotate-180': openDropdowns.shift }"></span>
        </button>
        <ul class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 
                 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white"
          :class="{ 'opacity-100': openDropdowns.shift, 'opacity-0 pointer-events-none': !openDropdowns.shift }"
          role="menu" aria-orientation="vertical">
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
              @click="selectOption('shift', '')">Filter by Shift</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
              @click="selectOption('shift', 'morning')">Morning</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
              @click="selectOption('shift', 'afternoon')">Afternoon</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
              @click="selectOption('shift', 'night')">Night</a></li>
        </ul>
      </div>

      <!-- Filter by Production Date -->
      <div class="relative">
        <input ref="datePickerRef" v-model="filters.productionDate" type="text" placeholder="Filter by Production Date"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 pl-10"
          readonly />
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
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
  jobOrderId: '',
  productName: '',
  processFlow: '',
  machineName: '',
  shift: '',
  productionDate: ''
})

const openDropdowns = ref({
  processFlow: false,
  shift: false
})

const processFlowDropdownRef = ref(null)
const shiftDropdownRef = ref(null)
const datePickerRef = ref(null)
let flatpickrInstance = null

const applyFilters = () => {
  emit('filter-change', filters.value)
}

const clearFilters = () => {
  filters.value = {
    jobOrderId: '',
    productName: '',
    processFlow: '',
    machineName: '',
    shift: '',
    productionDate: ''
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
  const dropdownRefs = [processFlowDropdownRef.value, shiftDropdownRef.value]
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
        filters.value.productionDate = dateStr
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