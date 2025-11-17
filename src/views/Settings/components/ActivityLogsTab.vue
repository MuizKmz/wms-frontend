<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">Activity Logs</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Monitor all system activities, user actions, and sign-in events
        </p>
      </div>
      <button
        @click="exportLogs"
        class="btn btn-outline btn-primary flex items-center gap-2"
        :disabled="loading"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export Logs
      </button>
    </div>

    <!-- Statistics Cards -->
    <div v-if="summary" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm opacity-90">Total Activities</p>
              <p class="text-3xl font-bold">{{ summary.totalLogs.toLocaleString() }}</p>
            </div>
            <svg class="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="card bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm opacity-90">Sign-ins</p>
              <p class="text-3xl font-bold">{{ summary.loginCount.toLocaleString() }}</p>
            </div>
            <svg class="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
        </div>
      </div>

      <div class="card bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm opacity-90">Admin Actions</p>
              <p class="text-3xl font-bold">{{ getSourceCount('admin') }}</p>
            </div>
            <svg class="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="card bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm opacity-90">Handheld Actions</p>
              <p class="text-3xl font-bold">{{ getSourceCount('handheld') }}</p>
            </div>
            <svg class="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card bg-white dark:bg-gray-800 shadow-xl">
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <!-- Search -->
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search description..."
            class="input input-bordered bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />

          <!-- Module Filter -->
          <select
            v-model="filters.module"
            class="select select-bordered bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Modules</option>
            <option v-for="module in modules" :key="module" :value="module">
              {{ module }}
            </option>
          </select>

          <!-- Action Filter -->
          <select
            v-model="filters.action"
            class="select select-bordered bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Actions</option>
            <option v-for="action in actions" :key="action" :value="action">
              {{ action }}
            </option>
          </select>

          <!-- Source Filter -->
          <select
            v-model="filters.source"
            class="select select-bordered bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Sources</option>
            <option value="admin">Admin Portal</option>
            <option value="handheld">Handheld Device</option>
            <option value="system">System</option>
          </select>

          <!-- Date Range -->
          <input
            v-model="filters.date"
            type="date"
            class="input input-bordered bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div class="flex justify-between items-center mt-4">
          <button
            @click="clearFilters"
            class="btn btn-sm btn-ghost"
          >
            Clear Filters
          </button>
          <button
            @click="applyFilters"
            class="btn btn-sm btn-primary"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="loading loading-spinner loading-lg"></div>
    </div>

    <!-- Activity Logs Table -->
    <div v-else class="card bg-white dark:bg-gray-800 shadow-xl">
      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr class="text-gray-900 dark:text-white">
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Module</th>
              <th>Description</th>
              <th>Source</th>
              <th>IP Address</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id" class="hover">
              <td class="text-gray-900 dark:text-white">
                <div class="text-sm">{{ formatDate(log.createdAt) }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ formatTime(log.createdAt) }}</div>
              </td>
              <td>
                <div v-if="log.user" class="flex items-center gap-2">
                  <div class="avatar placeholder">
                    <div class="bg-primary text-primary-content rounded-full w-8">
                      <span class="text-xs">{{ getUserInitials(log.user.fullName) }}</span>
                    </div>
                  </div>
                  <div>
                    <div class="font-medium text-gray-900 dark:text-white">{{ log.user.fullName }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">@{{ log.user.username }}</div>
                  </div>
                </div>
                <div v-else class="text-gray-500 dark:text-gray-400">
                  {{ log.username || 'System' }}
                </div>
              </td>
              <td>
                <span :class="getActionBadgeClass(log.action)" class="badge badge-sm">
                  {{ log.action }}
                </span>
              </td>
              <td>
                <span class="badge badge-outline badge-sm text-gray-900 dark:text-white">
                  {{ log.module }}
                </span>
              </td>
              <td class="text-gray-900 dark:text-white max-w-md truncate">
                {{ log.description }}
              </td>
              <td>
                <span :class="getSourceBadgeClass(log.source)" class="badge badge-sm">
                  {{ getSourceLabel(log.source) }}
                </span>
              </td>
              <td class="text-gray-900 dark:text-white text-xs">
                {{ log.ipAddress || 'N/A' }}
              </td>
              <td>
                <button
                  v-if="log.metadata"
                  @click="viewDetails(log)"
                  class="btn btn-xs btn-ghost"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="meta" class="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Showing {{ ((meta.page - 1) * meta.limit) + 1 }} to {{ Math.min(meta.page * meta.limit, meta.total) }} of {{ meta.total }} entries
        </div>
        <div class="join">
          <button
            @click="changePage(meta.page - 1)"
            :disabled="meta.page === 1"
            class="join-item btn btn-sm"
          >
            «
          </button>
          <button class="join-item btn btn-sm">
            Page {{ meta.page }} of {{ meta.totalPages }}
          </button>
          <button
            @click="changePage(meta.page + 1)"
            :disabled="meta.page === meta.totalPages"
            class="join-item btn btn-sm"
          >
            »
          </button>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <dialog ref="detailsModal" class="modal">
      <div class="modal-box max-w-2xl bg-white dark:bg-gray-800">
        <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-4">Activity Details</h3>
        
        <div v-if="selectedLog" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Timestamp</p>
              <p class="font-medium text-gray-900 dark:text-white">{{ formatDateTime(selectedLog.createdAt) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">User</p>
              <p class="font-medium text-gray-900 dark:text-white">{{ selectedLog.username || 'System' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Action</p>
              <p class="font-medium text-gray-900 dark:text-white">{{ selectedLog.action }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Module</p>
              <p class="font-medium text-gray-900 dark:text-white">{{ selectedLog.module }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Source</p>
              <p class="font-medium text-gray-900 dark:text-white">{{ getSourceLabel(selectedLog.source) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">IP Address</p>
              <p class="font-medium text-gray-900 dark:text-white">{{ selectedLog.ipAddress || 'N/A' }}</p>
            </div>
          </div>

          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Description</p>
            <p class="font-medium text-gray-900 dark:text-white">{{ selectedLog.description }}</p>
          </div>

          <div v-if="selectedLog.userAgent">
            <p class="text-sm text-gray-500 dark:text-gray-400">User Agent</p>
            <p class="text-xs font-mono text-gray-900 dark:text-white break-all">{{ selectedLog.userAgent }}</p>
          </div>

          <div v-if="selectedLog.metadata">
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">Metadata</p>
            <pre class="bg-gray-100 dark:bg-gray-900 p-4 rounded text-xs overflow-auto text-gray-900 dark:text-white">{{ JSON.stringify(selectedLog.metadata, null, 2) }}</pre>
          </div>
        </div>

        <div class="modal-action">
          <button @click="closeDetailsModal" class="btn">Close</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from '@/utils/axios'

const API_URL = '/activity-log'

const logs = ref<any[]>([])
const summary = ref<any>(null)
const meta = ref<any>(null)
const loading = ref(false)
const selectedLog = ref<any>(null)
const detailsModal = ref<HTMLDialogElement | null>(null)

const filters = ref({
  search: '',
  module: '',
  action: '',
  source: '',
  date: '',
})

const modules = ref<string[]>([
  'Auth', 'Order', 'EPC', 'Inventory', 'Stock', 'Shipping', 'Receiving',
  'Product', 'Customer', 'Supplier', 'User', 'Role', 'Permission', 'Settings'
])

const actions = ref<string[]>([
  'LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'SCAN', 'EXPORT',
  'IMPORT', 'APPROVE', 'REJECT', 'SHIP', 'RECEIVE', 'STOCK_IN', 'STOCK_OUT'
])

const currentPage = ref(1)
const pageSize = ref(50)

onMounted(() => {
  fetchLogs()
  fetchSummary()
})

const fetchLogs = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      limit: pageSize.value,
    }

    if (filters.value.module) params.module = filters.value.module
    if (filters.value.action) params.action = filters.value.action
    if (filters.value.source) params.source = filters.value.source
    if (filters.value.date) params.startDate = filters.value.date

    const response = await axios.get(API_URL, { params })
    logs.value = response.data.data
    meta.value = response.data.meta
  } catch (error) {
    console.error('Error fetching activity logs:', error)
  } finally {
    loading.value = false
  }
}

const fetchSummary = async () => {
  try {
    const response = await axios.get(`${API_URL}/summary`)
    summary.value = response.data
  } catch (error) {
    console.error('Error fetching summary:', error)
  }
}

const applyFilters = () => {
  currentPage.value = 1
  fetchLogs()
}

const clearFilters = () => {
  filters.value = {
    search: '',
    module: '',
    action: '',
    source: '',
    date: '',
  }
  applyFilters()
}

const changePage = (page: number) => {
  currentPage.value = page
  fetchLogs()
}

const viewDetails = (log: any) => {
  selectedLog.value = log
  detailsModal.value?.showModal()
}

const closeDetailsModal = () => {
  detailsModal.value?.close()
}

const exportLogs = async () => {
  try {
    const params: any = {}
    if (filters.value.module) params.module = filters.value.module
    if (filters.value.action) params.action = filters.value.action
    if (filters.value.source) params.source = filters.value.source
    if (filters.value.date) params.startDate = filters.value.date

    const response = await axios.get(API_URL, {
      params: { ...params, limit: 10000 },
    })

    const csvContent = convertToCSV(response.data.data)
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `activity-logs-${new Date().toISOString()}.csv`
    a.click()
  } catch (error) {
    console.error('Error exporting logs:', error)
  }
}

const convertToCSV = (data: any[]) => {
  const headers = ['Timestamp', 'User', 'Action', 'Module', 'Description', 'Source', 'IP Address']
  const rows = data.map(log => [
    new Date(log.createdAt).toISOString(),
    log.username || 'System',
    log.action,
    log.module,
    log.description,
    log.source,
    log.ipAddress || 'N/A',
  ])

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')
}

const getUserInitials = (name: string) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString()
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

const getActionBadgeClass = (action: string) => {
  const classes: any = {
    LOGIN: 'badge-success',
    LOGOUT: 'badge-warning',
    CREATE: 'badge-info',
    UPDATE: 'badge-primary',
    DELETE: 'badge-error',
    SCAN: 'badge-accent',
    EXPORT: 'badge-secondary',
  }
  return classes[action] || 'badge-ghost'
}

const getSourceBadgeClass = (source: string) => {
  const classes: any = {
    admin: 'badge-primary',
    handheld: 'badge-warning',
    system: 'badge-secondary',
  }
  return classes[source] || 'badge-ghost'
}

const getSourceLabel = (source: string) => {
  const labels: any = {
    admin: 'Admin Portal',
    handheld: 'Handheld',
    system: 'System',
  }
  return labels[source] || source
}

const getSourceCount = (source: string) => {
  if (!summary.value?.actionsBySource) return 0
  const item = summary.value.actionsBySource.find((s: any) => s.source === source)
  return item?._count || 0
}
</script>
