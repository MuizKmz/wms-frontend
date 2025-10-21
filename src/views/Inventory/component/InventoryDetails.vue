<template>
  <teleport to="body">
    <transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-250 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="isOpen"
        class="fixed inset-y-0 right-0 z-50 w-full max-w-7xl bg-white dark:bg-gray-800 shadow-2xl flex flex-col"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Inventory Detail
          </h2>
          <button
            type="button"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
            @click="closeModal"
            aria-label="Close panel"
          >
            ✕
          </button>
        </div>

        <!-- Product Info Section -->
        <div class="p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-4">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Product</span>
            <span class="text-base font-semibold text-gray-900 dark:text-white">
              {{ inventoryData?.product?.name || 'No Product Selected' }}
            </span>
          </div>
        </div>

        <!-- Action Bar -->
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex flex-wrap items-center gap-3">
            <button
              @click="exportInventory"
              class="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Inventory
            </button>
            <button
              class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              @click="refreshData"
              title="Refresh"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <!-- Bulk Status Update Controls -->
            <div class="flex items-center gap-2 ml-auto" v-if="epcList.length > 0">
              <div class="flex items-center gap-2">
                <label class="text-xs font-medium text-gray-600 dark:text-gray-400">Bulk Status</label>
                <select v-model="bulkStatus" class="select select-bordered select-xs w-40">
                  <option disabled value="">Select status</option>
                  <option value="RECEIVED">Received</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="INBOUND">Inbound</option>
                </select>
              </div>
              <button
                @click="applyBulkStatus"
                :disabled="selectedEpcs.length === 0 || !bulkStatus || loadingBulk"
                class="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                  bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <span v-if="!loadingBulk">Update ({{ selectedEpcs.length }})</span>
                <span v-else class="flex items-center gap-1">
                  <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Updating...
                </span>
              </button>
              <button
                @click="clearSelection"
                :disabled="selectedEpcs.length === 0"
                class="px-3 py-2 text-xs font-medium rounded-lg transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                  bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <!-- EPC Table -->
        <div class="flex-1 overflow-y-auto p-6">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th class="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      class="checkbox checkbox-primary checkbox-sm"
                      @change="toggleSelectAll"
                      :checked="allSelected"
                      aria-label="Select all"
                    />
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tag Code
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tag Flow
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tag Type
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Receiving Code
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    SKU Code
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Order Code
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Warehouse Code
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rack Code
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Section Code
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr
                  v-for="epc in epcList"
                  :key="epc.id"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td class="px-4 py-4">
                    <input
                      type="checkbox"
                      class="checkbox checkbox-primary checkbox-sm"
                      :checked="selectedEpcs.includes(epc.id)"
                      @change="toggleEpcSelection(epc.id)"
                      aria-label="Select EPC"
                    />
                  </td>
                  <td class="px-4 py-4 text-sm font-mono text-gray-900 dark:text-white">
                    {{ epc.epcCode || '--' }}
                  </td>
                  <td class="px-4 py-4 text-sm text-gray-900 dark:text-white">
                    EPC
                  </td>
                  <td class="px-4 py-4 text-sm text-gray-900 dark:text-white">
                    Excel
                  </td>
                  <td class="px-4 py-4 text-sm font-mono text-gray-900 dark:text-white">
                    {{ epc.receivingCode || '--' }}
                  </td>
                  <td class="px-4 py-4 text-sm font-mono text-gray-900 dark:text-white">
                    {{ inventoryData?.product?.skuCode || '--' }}
                  </td>
                  <td class="px-4 py-4 text-sm font-mono text-gray-900 dark:text-white">
                    {{ epc.orderCode || '--' }}
                  </td>
                  <td class="px-4 py-4 text-sm font-mono text-gray-900 dark:text-white">
                    {{ inventoryData?.warehouse?.warehouseCode || '--' }}
                  </td>
                  <td class="px-4 py-4 text-sm font-mono text-gray-900 dark:text-white">
                    {{ inventoryData?.rack?.rackCode || '--' }}
                  </td>
                  <td class="px-4 py-4 text-sm font-mono text-gray-900 dark:text-white">
                    {{ inventoryData?.section?.sectionCode || '--' }}
                  </td>
                  <td class="px-4 py-4">
                    <span :class="[
                      'px-2 py-1 text-xs font-medium rounded-full',
                      getStatusClass(epc.status)
                    ]">
                      {{ formatStatus(epc.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Empty State -->
            <div v-if="epcList.length === 0" class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No EPC records found</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">This inventory item has no associated EPCs</p>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Overlay -->
    <transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-250 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/50 z-40"
        @click="closeModal"
      ></div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['close'])

/* State */
const isOpen = ref(false)
const inventoryData = ref(null)
const selectedEpcs = ref([])
const bulkStatus = ref('')
const loadingBulk = ref(false)

/* Computed */
const epcList = computed(() => {
  if (!inventoryData.value?.product?.epcs) return []
  return inventoryData.value.product.epcs
})

const allSelected = computed(() => {
  return epcList.value.length > 0 && selectedEpcs.value.length === epcList.value.length
})

/* Methods */
const openModal = (data) => {
  inventoryData.value = data
  selectedEpcs.value = []
  isOpen.value = true

  // Lock body scroll
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  isOpen.value = false

  // Unlock body scroll
  document.body.style.overflow = ''

  // Emit close event
  emit('close')

  // Reset data after animation
  setTimeout(() => {
    inventoryData.value = null
    selectedEpcs.value = []
  }, 300)
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedEpcs.value = []
  } else {
    selectedEpcs.value = epcList.value.map(epc => epc.id)
  }
}

const toggleEpcSelection = (epcId) => {
  const index = selectedEpcs.value.indexOf(epcId)
  if (index > -1) {
    selectedEpcs.value.splice(index, 1)
  } else {
    selectedEpcs.value.push(epcId)
  }
}

const getStatusClass = (status) => {
  const statusMap = {
    'RECEIVED': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'INBOUND': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'DELIVERED': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    'RETURNED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    'GENERATED': 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300',
  }
  return statusMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
}

const formatStatus = (status) => {
  if (!status) return '--'
  // Capitalize first letter and make rest lowercase
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
}

const refreshData = () => {
  // Emit event to parent to refresh data
  console.log('Refreshing inventory data...')
  // You can add API call here if needed
}

const exportInventory = () => {
  // Export functionality
  console.log('Exporting inventory for:', inventoryData.value?.product?.name)
  console.log('Selected EPCs:', selectedEpcs.value)

  // You can implement CSV export here
  if (selectedEpcs.value.length > 0) {
    const selectedData = epcList.value.filter(epc => selectedEpcs.value.includes(epc.id))
    console.log('Exporting selected EPCs:', selectedData)
    // Add export logic here
  } else {
    console.log('Exporting all EPCs:', epcList.value)
    // Add export logic here
  }
}

const clearSelection = () => {
  selectedEpcs.value = []
}

const applyBulkStatus = async () => {
  if (!bulkStatus.value || selectedEpcs.value.length === 0) return
  loadingBulk.value = true
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/epc/bulk-update-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedEpcs.value, status: bulkStatus.value })
    })
    if (!response.ok) {
      throw new Error('Failed to update statuses')
    }
    const result = await response.json()
    // Update local epc statuses
    const updatedMap = new Map(result.records.map(r => [r.id, r.status]))
    inventoryData.value.product.epcs = inventoryData.value.product.epcs.map(epc => {
      if (updatedMap.has(epc.id)) {
        return { ...epc, status: updatedMap.get(epc.id) }
      }
      return epc
    })
    // Clear selection but keep chosen status for further operations
    selectedEpcs.value = []
  } catch (err) {
    console.error(err)
  } finally {
    loadingBulk.value = false
  }
}

/* Expose to parent */
defineExpose({ openModal, closeModal })
</script>

<style scoped>
/* Custom scrollbar for the table area */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Dark mode scrollbar */
.dark .overflow-y-auto::-webkit-scrollbar-track {
  background: #1f2937;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: #4b5563;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
