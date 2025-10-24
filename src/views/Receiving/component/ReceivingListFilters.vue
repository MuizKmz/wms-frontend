<template>
  <div class="p-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      
      <div>
        <input
          v-model="filters.receivingCode"
          type="text"
          placeholder="Filter by Receiving Code"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

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
          ref="datePickerRef"
          type="text"
          placeholder="Filter by Date"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <div class="flex justify-end gap-2 lg:col-span-3 md:col-span-2 sm:col-span-1">
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
            class="btn bg-brand-500 hover:bg-brand-600 flex items-center gap-2 border-none"
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
import { ref, defineEmits, onMounted, onUnmounted } from 'vue'
import flatpickr from 'flatpickr' // 💡 Flatpickr import is essential!

const emit = defineEmits(['filter-change'])

// --- State Definitions ---

const filters = ref({
  receivingCode: '',
  productName: '',
  date: '', // Stores the selected date string
})

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
    receivingCode: '',
    productName: '',
    date: '', // Clear the internal date state
  }
  
  // Clear the flatpickr input visually and internally
  if (flatpickrInstance) {
    flatpickrInstance.clear()
  }
  
  emit('filter-change', filters.value)
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
        // Update the filter state when a date is selected/changed
        filters.value.date = dateStr
        // applyFilters() // Auto-apply on date change (optional)
      }
    })
  }
})

onUnmounted(() => {
  // Destroy flatpickr instance
  if (flatpickrInstance) {
    flatpickrInstance.destroy()
  }
})
</script>