<template>
  <div class="overflow-hidden">
    <!-- Search Bar -->
    <div class="mb-4">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search reports..."
          class="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          class="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>

    <!-- Report Count -->
    <div class="flex justify-between items-center mb-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Showing {{ paginatedReports.length }} of {{ filteredReports.length }} reports
      </p>
    </div>

    <!-- Reports Table -->
    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="min-w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Report Name
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Description
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Category
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Last Updated
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Action
              </p>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="report in paginatedReports"
            :key="report.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <td class="px-6 py-4 cursor-pointer" @click="handleReportClick(report)">
              <div class="flex items-center">
                <component :is="report.icon" class="w-5 h-5 mr-3 text-blue-600" />
                <p class="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 transition-colors">
                  {{ report.name }}
                </p>
              </div>
            </td>
            <td class="px-6 py-4 cursor-pointer" @click="handleReportClick(report)">
              <p class="text-sm text-gray-600 dark:text-gray-300">
                {{ report.description }}
              </p>
            </td>
            <td class="px-6 py-4 cursor-pointer" @click="handleReportClick(report)">
              <span
                :class="{
                  'px-3 py-1 text-xs rounded-full font-medium': true,
                  'bg-green-100 text-green-600': report.category === 'Stock',
                  'bg-blue-100 text-blue-600': report.category === 'Movement',
                  'bg-yellow-100 text-yellow-600': report.category === 'Quality',
                }"
              >
                {{ report.category }}
              </span>
            </td>
            <td class="px-6 py-4 cursor-pointer" @click="handleReportClick(report)">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ report.lastUpdated }}
              </p>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <button
                  @click.stop="handleReportClick(report)"
                  class="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  aria-label="View Report"
                  title="View Report"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  @click.stop="editReport(report)"
                  class="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  aria-label="Edit Report"
                  title="Edit Report"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="filteredReports.length === 0" class="p-8 text-center text-gray-500">
        <svg
          class="mx-auto h-12 w-12 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No reports found</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your search query.
        </p>
      </div>

      <!-- Pagination -->
      <div v-if="filteredReports.length > 0" class="mt-6 flex justify-center">
        <nav class="flex items-center gap-x-2">
          <!-- Previous Button -->
          <button
            type="button"
            class="btn btn-sm btn-outline dark:text-gray-300"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            Previous
          </button>

          <!-- Page Numbers -->
          <div class="flex items-center gap-x-1">
            <template v-for="page in displayPages" :key="page">
              <span v-if="page === -1" class="px-2" aria-hidden="true">...</span>
              <button
                v-else
                type="button"
                class="btn btn-sm btn-outline min-w-[40px]"
                :class="
                  page === currentPage
                    ? '!bg-blue-100 !text-blue-600 !border-blue-300 !border'
                    : 'text-gray-700 border-gray-300 hover:bg-blue-50 hover:text-blue-600'
                "
                @click="changePage(page)"
              >
                {{ page }}
              </button>
            </template>
          </div>

          <!-- Next Button -->
          <button
            type="button"
            class="btn btn-sm btn-outline dark:text-gray-300"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            Next
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import BarChartIcon from '@/icons/BarChartIcon.vue'
import ReportsIcon from '@/icons/ReportsIcon.vue'
import QualityIcon from '@/icons/QualityIcon.vue'

const router = useRouter()
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(5)

// Hardcoded reports data
const reports = ref([
  {
    id: 1,
    name: 'Stock Received Summary Report',
    description: 'View current stock levels across all warehouses',
    category: 'Stock',
    lastUpdated: 'Nov 5, 2025',
    icon: BarChartIcon,
    route: '/reports/incoming/stock-received'
  },
])

// Filter reports based on search query
const filteredReports = computed(() => {
  if (!searchQuery.value) return reports.value

  const query = searchQuery.value.toLowerCase()
  return reports.value.filter(
    (report) =>
      report.name.toLowerCase().includes(query) ||
      report.description.toLowerCase().includes(query) ||
      report.category.toLowerCase().includes(query)
  )
})

// Pagination
const paginatedReports = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredReports.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredReports.value.length / itemsPerPage.value))

const displayPages = computed(() => {
  const total = totalPages.value
  if (total <= 0) return []

  const current = currentPage.value
  const range = []

  if (total === 1) return [1]

  if (current > 2) {
    range.push(1)
    if (current > 3) range.push(-1)
  }

  if (current > 1) range.push(current - 1)
  range.push(current)
  if (current < total) range.push(current + 1)

  if (current < total - 1) {
    if (current < total - 2) range.push(-1)
    range.push(total)
  }

  return range
})

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Reset to first page when search changes
watch(searchQuery, () => {
  currentPage.value = 1
})

// Handle report click
const handleReportClick = (report) => {
  console.log('Navigating to:', report.route)
  router.push(report.route)
}

// Handle edit report
const editReport = (report) => {
  console.log('Editing report:', report.name)
  // Navigate to the report with designer mode enabled
  router.push({ 
    path: report.route, 
    query: { design: 'true' } 
  })
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
