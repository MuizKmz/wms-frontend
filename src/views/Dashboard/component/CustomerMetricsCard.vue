<template>
  <div ref="chartContainer" class="w-full h-full relative flex items-center justify-center p-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
      <div
        class="w-5 h-5 border-2 border-gray-300 border-t-pink-600 rounded-full animate-spin"
      ></div>
      <span class="text-sm">Loading customer data...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center text-red-500">
      <svg
        class="mx-auto h-8 w-8 text-red-300 mb-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
      <p class="text-sm font-medium">Error loading customer data</p>
      <p class="text-xs mt-1">{{ error }}</p>
    </div>

    <!-- Metrics Display -->
    <div v-else class="w-full grid grid-cols-2 gap-6">
      <!-- Total Customers -->
      <div
        class="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl border border-pink-200 dark:border-pink-800/50"
      >
        <div class="flex items-center gap-3 mb-2">
          <svg
            class="w-8 h-8 text-pink-600 dark:text-pink-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <div class="text-left">
            <p class="text-3xl font-bold text-pink-600 dark:text-pink-400">
              {{ totalCustomers.toLocaleString() }}
            </p>
            <p class="text-sm font-medium text-pink-700 dark:text-pink-300">Total Customers</p>
          </div>
        </div>
        <div
          class="mt-2 text-xs text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/40 px-3 py-1 rounded-full"
        >
          Active Accounts
        </div>
      </div>

      <!-- Total Orders -->
      <div
        class="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800/50"
      >
        <div class="flex items-center gap-3 mb-2">
          <svg
            class="w-8 h-8 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <div class="text-left">
            <p class="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {{ totalOrders.toLocaleString() }}
            </p>
            <p class="text-sm font-medium text-blue-700 dark:text-blue-300">Total Orders</p>
          </div>
        </div>
        <div
          class="mt-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-3 py-1 rounded-full"
        >
          {{ averageOrdersPerCustomer }} Avg per Customer
        </div>
      </div>

      <!-- Active This Month -->
      <div
        class="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800/50"
      >
        <div class="flex items-center gap-3 mb-2">
          <svg
            class="w-8 h-8 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div class="text-left">
            <p class="text-3xl font-bold text-green-600 dark:text-green-400">
              {{ activeThisMonth.toLocaleString() }}
            </p>
            <p class="text-sm font-medium text-green-700 dark:text-green-300">Active This Month</p>
          </div>
        </div>
        <div
          class="mt-2 text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-3 py-1 rounded-full"
        >
          {{ activePercentage }}% of Total
        </div>
      </div>

      <!-- New This Month -->
      <div
        class="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800/50"
      >
        <div class="flex items-center gap-3 mb-2">
          <svg
            class="w-8 h-8 text-purple-600 dark:text-purple-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <div class="text-left">
            <p class="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {{ newThisMonth.toLocaleString() }}
            </p>
            <p class="text-sm font-medium text-purple-700 dark:text-purple-300">New This Month</p>
          </div>
        </div>
        <div
          class="mt-2 text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 px-3 py-1 rounded-full"
        >
          Growth Rate
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineExpose } from 'vue'
import authenticatedFetch from '@/utils/authenticatedFetch'

const chartContainer = ref(null)
const loading = ref(true)
const error = ref(null)

const totalCustomers = ref(0)
const totalOrders = ref(0)
const activeThisMonth = ref(0)
const newThisMonth = ref(0)

const API_URL = '/api/customer/metrics'

const averageOrdersPerCustomer = computed(() => {
  if (totalCustomers.value === 0) return '0'
  return (totalOrders.value / totalCustomers.value).toFixed(1)
})

const activePercentage = computed(() => {
  if (totalCustomers.value === 0) return '0'
  return ((activeThisMonth.value / totalCustomers.value) * 100).toFixed(1)
})

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await authenticatedFetch(API_URL)
    if (!response.ok) throw new Error('Failed to fetch customer metrics')

    const data = await response.json()

    totalCustomers.value = data.totalCustomers || 0
    totalOrders.value = data.totalOrders || 0
    activeThisMonth.value = data.activeThisMonth || 0
    newThisMonth.value = data.newThisMonth || 0
  } catch (e) {
    error.value = e.message
    console.error('Error fetching customer metrics:', e)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchData()
})

defineExpose({ refresh: fetchData })
</script>
