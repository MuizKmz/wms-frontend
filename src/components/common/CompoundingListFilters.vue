<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
      <!-- Filter by Compounding Order ID -->
      <div>
        <input
          v-model="filters.compoundingOrderId"
          type="text"
          placeholder="Filter by Compounding Order ID"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <!-- Filter by Material Code -->
      <div>
        <input
          v-model="filters.materialCode"
          type="text"
          placeholder="Filter by Material Code"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <!-- Filter by Issued By -->
      <div>
        <input
          v-model="filters.issuedBy"
          type="text"
          placeholder="Filter by Issued By"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <!-- Filter by Date Issued -->
      <div>
        <input
          ref="datePickerRef"
          v-model="filters.dateIssued"
          type="text"
          placeholder="Filter by Date Issued"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          readonly
        />
      </div>
    </div>

    <div class="flex justify-end gap-2">
      <!-- Clear Button -->
      <button
        @click="clearFilters"
        class="btn btn-outline btn-error flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
        Clear
      </button>
      
      <!-- Apply Filters Button -->
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
</template>

<script setup>
import { ref, defineEmits, onMounted, onUnmounted } from 'vue'
import flatpickr from 'flatpickr'

const emit = defineEmits(['filter-change'])

const filters = ref({
  compoundingOrderId: '',
  materialCode: '',
  issuedBy: '',
  dateIssued: ''
})

const openDropdowns = ref({})

const datePickerRef = ref(null)
let flatpickrInstance = null

const applyFilters = () => {
  emit('filter-change', filters.value)
}

const clearFilters = () => {
  filters.value = {
    compoundingOrderId: '',
    materialCode: '',
    issuedBy: '',
    dateIssued: ''
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
  // No dropdowns to handle click outside for now
}

onMounted(() => {
  if (datePickerRef.value) {
    flatpickrInstance = flatpickr(datePickerRef.value, {
      dateFormat: 'Y-m-d',
      allowInput: true,
      clickOpens: true,
      onChange: (selectedDates, dateStr) => {
        filters.value.dateIssued = dateStr
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