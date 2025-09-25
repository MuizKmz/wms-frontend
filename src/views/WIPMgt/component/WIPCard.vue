<template>
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
    <!-- Jobs In Progress Card -->
    <div class="card bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div class="card-body p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="flex-shrink-0">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
            </div>
            <div>
              <div class="text-3xl font-bold">{{ jobsInProgress }}</div>
              <div class="text-purple-100 text-sm font-medium">Jobs In Progress</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Completed Jobs Today Card -->
    <div class="card bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div class="card-body p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="flex-shrink-0">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div>
              <div class="text-3xl font-bold">{{ completedJobsToday }}</div>
              <div class="text-green-100 text-sm font-medium">Completed Jobs Today</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delayed Jobs Card -->
    <div class="card bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div class="card-body p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="flex-shrink-0">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <div class="text-3xl font-bold text-red-200">{{ delayedJobs }}</div>
              <div class="text-orange-100 text-sm font-medium">Delayed Jobs</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Total Quantity in WIP Card -->
    <div class="card bg-gradient-to-br from-pink-400 to-pink-600 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div class="card-body p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="flex-shrink-0">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <div>
              <div class="text-3xl font-bold">{{ totalQuantityWIP.toLocaleString() }}</div>
              <div class="text-pink-100 text-sm font-medium">Total Quantity in WIP</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Sample data - replace with your actual data source
const jobsInProgress = ref(200)
const completedJobsToday = ref(30)
const delayedJobs = ref(3)
const totalQuantityWIP = ref(4985)

// You can add props or methods to update these values
defineProps({
  // Add props here if you want to pass data from parent component
})
</script>