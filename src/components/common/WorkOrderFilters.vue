<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
      <!-- Filter by Work Order -->
      <div>
        <input
          v-model="filters.workOrder"
          type="text"
          placeholder="Filter by Work Order"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                 placeholder-gray-500 dark:placeholder-gray-400
                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                 dark:focus:ring-blue-400 dark:focus:border-blue-400"
        />
      </div>

      <!-- Filter by Compounding Lot No. -->
      <div>
        <input
          v-model="filters.compoundingLot"
          type="text"
          placeholder="Filter by Compounding Lot No."
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                 placeholder-gray-500 dark:placeholder-gray-400
                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                 dark:focus:ring-blue-400 dark:focus:border-blue-400"
        />
      </div>

      <!-- Filter by Status -->
      <div>
        <select
          v-model="filters.status"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                 dark:focus:ring-blue-400 dark:focus:border-blue-400"
        >
          <option value="">Filter by Status</option>
          <option value="issued">Issued</option>
          <option value="draft">Draft</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <!-- Filter by Priority -->
      <div>
        <select
          v-model="filters.priority"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                 dark:focus:ring-blue-400 dark:focus:border-blue-400"
        >
          <option value="">Filter by Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Filter by Acknowledgement -->
      <div>
        <select
          v-model="filters.acknowledgement"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                 dark:focus:ring-blue-400 dark:focus:border-blue-400"
        >
          <option value="">Filter by Acknowledgement</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="not-yet-acknowledge">Not yet acknowledge</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <!-- Filter by Created Date -->
      <div>
        <input
          v-model="filters.createdDate"
          type="date"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                 dark:focus:ring-blue-400 dark:focus:border-blue-400"
        />
      </div>

      <!-- Apply Filters Button -->
      <div class="flex justify-end">
        <button
          @click="applyFilters"
          class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md 
                 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                 dark:focus:ring-offset-gray-800 transition-colors duration-200
                 flex items-center gap-2"
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
import { ref, defineEmits } from 'vue'

const emit = defineEmits(['filter-change'])

const filters = ref({
  workOrder: '',
  compoundingLot: '',
  status: '',
  priority: '',
  acknowledgement: '',
  createdDate: ''
})

const applyFilters = () => {
  emit('filter-change', filters.value)
}
</script>