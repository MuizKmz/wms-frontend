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
            <div class="dropdown relative" ref="exportDropdownRef">
              <button
                type="button"
                class="dropdown-toggle inline-flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                aria-haspopup="menu"
                :aria-expanded="showExportMenu"
                aria-label="Export inventory"
                @click="showExportMenu = !showExportMenu"
              >
                <!-- Export icon (download) -->
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Export Inventory</span>
                <span class="icon-[tabler--chevron-down] size-4 transition-transform ml-2 text-white" :class="{ 'rotate-180': showExportMenu }"></span>
              </button>

              <ul
                class="dropdown-menu w-40 transition-opacity duration-200 absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white text-sm"
                :class="{
                  'opacity-100': showExportMenu,
                  'opacity-0 pointer-events-none': !showExportMenu,
                }"
                role="menu"
                aria-orientation="vertical"
              >
                <li>
                  <a class="block px-4 py-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="handleExport('pdf')">Export as PDF</a>
                </li>
                <li>
                  <a class="block px-4 py-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="handleExport('excel')">Export as Excel</a>
                </li>
                <li>
                  <a class="block px-4 py-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="handleExport('csv')">Export as CSV</a>
                </li>
              </ul>
            </div>
            <button
              class="p-2 text-gray-600 dark:text-gray-300 rounded-lg transition-colors bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              @click="spinThenRefresh"
              :disabled="refreshLoading"
              title="Refresh"
            >
              <template v-if="refreshLoading">
                <svg class="w-5 h-5 transform-gpu origin-center spin-360" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </template>
              <template v-else>
                <svg ref="refreshIconRef" class="w-5 h-5 transform-gpu origin-center" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </template>
            </button>

            <!-- Bulk Status Update Controls -->
            <div class="flex items-center gap-2 ml-auto" v-if="epcList.length > 0">
                <div class="flex items-center gap-2 dropdown relative">
                  <label class="hidden md:inline-block text-xs font-medium text-gray-600 dark:text-gray-400 mr-1"> Bulk Status Update</label>
                  <button
                    ref="bulkStatusDropdownRef"
                    type="button"
                    class="dropdown-toggle btn btn-outline px-3 justify-between dark:bg-gray-700 dark:text-gray-400 text-xs w-40 truncate text-left"
                    aria-haspopup="menu"
                    :aria-expanded="openDropdowns.bulkStatus"
                    aria-label="Select bulk status"
                    @click="toggleDropdown('bulkStatus')"
                  >
                    <span class="truncate">{{ statusOptions.find((opt) => opt.value === bulkStatus)?.label || 'Select status' }}</span>
                    <span
                      class="icon-[tabler--chevron-down] size-4 transition-transform ml-2"
                      :class="{ 'rotate-180': openDropdowns.bulkStatus }"
                    ></span>
                  </button>
                  <ul
                    class="dropdown-menu w-40 transition-opacity duration-200 absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white text-sm"
                    :class="{
                      'opacity-100': openDropdowns.bulkStatus,
                      'opacity-0 pointer-events-none': !openDropdowns.bulkStatus,
                    }"
                    role="menu"
                    aria-orientation="vertical"
                  >
                    <li>
                      <a
                        class="block px-4 py-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
                        @click="selectOption('bulkStatus', '')"
                      >Select status</a>
                    </li>
                    <li>
                      <a
                        class="block px-4 py-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
                        @click="selectOption('bulkStatus', 'GENERATED')"
                      >Generated</a>
                    </li>
                    <li>
                      <a
                        class="block px-4 py-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
                        @click="selectOption('bulkStatus', 'INBOUND')"
                      >Inbound</a>
                    </li>
                    <li>
                      <a
                        class="block px-4 py-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
                        @click="selectOption('bulkStatus', 'OUTBOUND')"
                      >Outbound</a>
                    </li>
                  </ul>
                </div>
              <button
                @click="applyBulkStatus"
                :disabled="selectedEpcs.length === 0 || !bulkStatus || loadingBulk"
                class="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ml-4 shrink-0
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
                    SKU Code
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Warehouse Code
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Location Code
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Inbound Date
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quality
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Available
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Reserved
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
                  <td class="px-4 py-4">
                    <button
                      v-if="epc.epcCode"
                      type="button"
                      class="text-left font-bold text-sm font-mono text-blue-600 dark:text-blue-400 hover:underline break-all focus:outline-none"
                      @click.stop="handleViewEPC(epc)"
                      :title="`View code images for ${epc.epcCode}`"
                    >
                      {{ epc.epcCode }}
                    </button>
                    <span v-else class="text-sm font-mono text-gray-900 dark:text-white">--</span>
                  </td>
                  <td class="px-4 py-4 text-sm text-gray-900 dark:text-white">
                    EPC
                  </td>
                  <td class="px-4 py-4 text-sm text-gray-900 dark:text-white">
                    Excel
                  </td>
                  <td class="px-4 py-4 text-sm font-mono text-gray-900 dark:text-white">
                    {{ inventoryData?.product?.skuCode || '--' }}
                  </td>
                  <td class="px-4 py-4 text-sm font-mono text-gray-900 dark:text-white">
                    {{ epc.warehouse?.warehouseCode || '--' }}
                  </td>
                  <td class="px-4 py-4 text-sm font-mono text-gray-900 dark:text-white">
                    {{ epc.location?.locationCode || '--' }}
                  </td>
                  <td class="px-4 py-4 text-sm text-gray-900 dark:text-white">
                    {{ formatDate(epc.inboundDate) }}
                  </td>
                  <td class="px-4 py-4">
                    <span :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getStatusClass(epc.status)
                    ]">
                      {{ String(formatStatus(epc.status) ?? '--').toUpperCase() }}
                    </span>
                  </td>
                  <td class="px-4 py-4">
                    <span :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      epc.qualityStatus === 'GOOD' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' :
                      epc.qualityStatus === 'DEFECTIVE' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' :
                      epc.qualityStatus === 'DAMAGED' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    ]">
                      {{ epc.qualityStatus || 'N/A' }}
                    </span>
                  </td>
                  <td class="px-4 py-4">
                    <span :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      epc.isAvailableForSale
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
                    ]">
                      {{ epc.isAvailableForSale ? 'YES' : 'NO' }}
                    </span>
                  </td>
                  <td class="px-4 py-4">
                    <span :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      epc.isReserved
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
                    ]">
                      {{ epc.isReserved ? 'YES' : 'NO' }}
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

    <!-- ViewEPC Modal -->
    <ViewEPC
      ref="viewEPCModalRef"
      :show="showViewEPCModal"
      :initial-epc-code="selectedEpcCode"
      @close="closeViewEPCModal"
    />
  </teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { authenticatedFetch } from '@/utils/authenticatedFetch'
import ViewEPC from '@/views/EPC/component/ViewEPC.vue'
import * as XLSX from 'xlsx'

const emit = defineEmits(['close'])

/* State */
const isOpen = ref(false)
const inventoryData = ref(null)
const selectedEpcs = ref([])
const bulkStatus = ref('')
const loadingBulk = ref(false)
const viewEPCModalRef = ref(null)
const showViewEPCModal = ref(false)
const selectedEpcCode = ref(null)

// Bulk status dropdown state (styled like WarehouseFilters)
const statusOptions = ref([
  { label: 'Generated', value: 'GENERATED' },
  { label: 'Inbound', value: 'INBOUND' },
  { label: 'Outbound', value: 'OUTBOUND' },
])

const openDropdowns = ref({
  bulkStatus: false,
})

const bulkStatusDropdownRef = ref(null)
const exportDropdownRef = ref(null)
const showExportMenu = ref(false)
const refreshLoading = ref(false)
const refreshIconRef = ref(null)

const toggleDropdown = (dropdownName) => {
  Object.keys(openDropdowns.value).forEach((key) => {
    if (key !== dropdownName) {
      openDropdowns.value[key] = false
    }
  })
  openDropdowns.value[dropdownName] = !openDropdowns.value[dropdownName]
}

const selectOption = (key, value) => {
  if (key === 'bulkStatus') bulkStatus.value = value
  openDropdowns.value[key] = false
}

const closeAllDropdowns = () => {
  Object.keys(openDropdowns.value).forEach((key) => {
    openDropdowns.value[key] = false
  })
}

const handleClickOutside = (event) => {
  const refEl = bulkStatusDropdownRef.value
  const exportRefEl = exportDropdownRef.value

  // Close bulk dropdowns
  if (refEl) {
    const dropdownContainer = refEl.closest && refEl.closest('.dropdown') ? refEl.closest('.dropdown') : null
    if (dropdownContainer && !dropdownContainer.contains(event.target)) {
      closeAllDropdowns()
    } else if (!dropdownContainer && !refEl.contains(event.target)) {
      closeAllDropdowns()
    }
  } else {
    // if no bulk dropdown ref, still ensure dropdowns closed
    closeAllDropdowns()
  }

  // Close export dropdown if click outside
  if (exportRefEl && !exportRefEl.contains(event.target)) {
    showExportMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

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
  console.debug('InventoryDetails.openModal called with:', data)
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
  const s = String(status || '').toUpperCase()
  const statusMap = {
    GENERATED: 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300',
    INBOUND: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    OUTBOUND: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  }
  return statusMap[s] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
}

const formatStatus = (status) => {
  if (!status) return '--'
  // Capitalize first letter and make rest lowercase
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
}

const formatDate = (dateString) => {
  if (!dateString) return '--'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const refreshData = () => {
  // Fetch latest inventory details (EPC list) for the current inventory item
  console.log('Refreshing inventory data...')
  const productId = inventoryData.value?.product?.id || inventoryData.value?.productId || null
  if (!productId) {
    console.warn('No product id available to refresh')
    return
  }

  // Show a small loading indicator
  // animate refresh icon while fetching
  refreshLoading.value = true
  console.debug('refreshData: productId=', productId, 'current inventoryData=', inventoryData.value)
  const processResponse = async (res) => {
    if (!res.ok) throw new Error(`Failed to load inventory (${res.status})`)
    const data = await res.json()
    console.debug('Inventory refresh response shape:', data)

    // Accept multiple possible response shapes from backend
    if (data?.product?.epcs) {
      inventoryData.value = data
      return true
    }

    if (Array.isArray(data)) {
      const found = data.find(item => Number(item.product?.id || item.productId) === Number(productId))
      if (found) {
        if (found.product?.epcs) {
          inventoryData.value = found
          return true
        }
        if (found.epcs) {
          inventoryData.value = { product: { ...(inventoryData.value?.product || {}), epcs: found.epcs } }
          return true
        }
      }
      return false
    }

    if (data?.epcs) {
      inventoryData.value = { product: { ...(inventoryData.value?.product || {}), epcs: data.epcs } }
      return true
    }

    if (data?.data?.product?.epcs) {
      inventoryData.value = data.data
      return true
    }

    if (data?.result?.product?.epcs) {
      inventoryData.value = data.result
      return true
    }

    if (data?.product) {
      inventoryData.value = { ...(inventoryData.value || {}), product: { ...(inventoryData.value?.product || {}), ...data.product } }
      return !!inventoryData.value.product.epcs
    }

    return false
  }

  authenticatedFetch(`/api/inventory/${productId}`)
    .then(processResponse)
    .catch((err) => {
      console.error('Error refreshing inventory (primary endpoint):', err)
      // try fallback to the available-epcs list endpoint used elsewhere
      authenticatedFetch('/api/inventory/available-epcs/list')
        .then(async (res2) => {
          try {
            const ok = await processResponse(res2)
            if (!ok) console.warn('Fallback endpoint responded but no EPCs found for product')
          } catch (e) {
            console.error('Error processing fallback response', e)
          }
        })
        .catch((e2) => console.error('Fallback endpoint failed:', e2))
    })
    .finally(() => {
      refreshLoading.value = false
    })
}

// spin the icon 360deg then call refreshData; prevents automatic refresh
const spinThenRefresh = async () => {
  if (refreshLoading.value) return
  // add a short spin animation before calling the network refresh
  refreshLoading.value = true
  try {
    // ensure DOM updated so we can add animation-class if needed
    await nextTick()
    const el = refreshIconRef.value
    if (el) {
      // add the spin-360 class to trigger CSS animation
      el.classList.add('spin-360')
      // wait for animation duration (400ms) then perform refresh
      await new Promise((res) => setTimeout(res, 400))
      el.classList.remove('spin-360')
    } else {
      // fallback short delay
      await new Promise((res) => setTimeout(res, 200))
    }

    // call actual refresh
    await (async () => {
      // reuse existing refreshData implementation but wrap as promise
      return new Promise((resolve) => {
        // call refreshData which toggles refreshLoading; here we want it to run
        // but we must not change refreshLoading prematurely. We'll set a local flag.
        // We'll call refreshData and when it finishes, resolve.
        // To detect finish, observe refreshLoading transitions — simpler: call the logic directly.
        const productId = inventoryData.value?.product?.id || inventoryData.value?.productId || null
        if (!productId) {
          resolve()
          return
        }

        // Perform the same fetch steps as refreshData but without toggling loading twice
        const processResponse = async (res) => {
          if (!res.ok) throw new Error(`Failed to load inventory (${res.status})`)
          const data = await res.json()

          if (data?.product?.epcs) {
            inventoryData.value = data
            return true
          }

          if (Array.isArray(data)) {
            const found = data.find(item => Number(item.product?.id || item.productId) === Number(productId))
            if (found) {
              if (found.product?.epcs) {
                inventoryData.value = found
                return true
              }
              if (found.epcs) {
                inventoryData.value = { product: { ...(inventoryData.value?.product || {}), epcs: found.epcs } }
                return true
              }
            }
            return false
          }

          if (data?.epcs) {
            inventoryData.value = { product: { ...(inventoryData.value?.product || {}), epcs: data.epcs } }
            return true
          }

          if (data?.data?.product?.epcs) {
            inventoryData.value = data.data
            return true
          }

          if (data?.result?.product?.epcs) {
            inventoryData.value = data.result
            return true
          }

          if (data?.product) {
            inventoryData.value = { ...(inventoryData.value || {}), product: { ...(inventoryData.value?.product || {}), ...data.product } }
            return !!inventoryData.value.product.epcs
          }

          return false
        }

        authenticatedFetch(`/api/inventory/${productId}`)
          .then(processResponse)
          .catch(() => {
            authenticatedFetch('/api/inventory/available-epcs/list')
              .then(async (res2) => {
                try {
                  await processResponse(res2)
                } catch (e) {
                  console.error('Error processing fallback response', e)
                }
              })
              .catch((e2) => console.error('Fallback endpoint failed:', e2))
          })
          .finally(() => {
            resolve()
          })
      })
    })()
  } catch (e) {
    console.error('spinThenRefresh error', e)
  } finally {
    refreshLoading.value = false
  }
}

const handleExport = (format) => {
  showExportMenu.value = false
  // reuse existing exportInventory logic by delegating
  if (format === 'pdf') {
    exportInventoryAsPDF()
  } else if (format === 'excel') {
    exportInventoryAsExcel()
  } else if (format === 'csv') {
    exportInventoryAsCSV()
  }
}

const exportInventory = () => {
  // kept for compatibility; open export dropdown
  showExportMenu.value = !showExportMenu.value
}

const exportInventoryAsPDF = () => {
  const header = `<h1 style="font-size:18px;margin-bottom:8px">Inventory EPCs - ${inventoryData.value?.product?.name || ''}</h1>`
  let table = `<table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr><th style="border:1px solid #ddd;padding:6px">EPC Code</th><th style="border:1px solid #ddd;padding:6px">Warehouse</th><th style="border:1px solid #ddd;padding:6px">Location</th><th style="border:1px solid #ddd;padding:6px">Inbound Date</th><th style="border:1px solid #ddd;padding:6px">Status</th></tr></thead><tbody>`
  const dataToExport = selectedEpcs.value.length > 0 ? epcList.value.filter(epc => selectedEpcs.value.includes(epc.id)) : epcList.value
  dataToExport.forEach(epc => {
    table += `<tr><td style="border:1px solid #ddd;padding:6px">${epc.epcCode || ''}</td><td style="border:1px solid #ddd;padding:6px">${epc.warehouse?.warehouseCode || ''}</td><td style="border:1px solid #ddd;padding:6px">${epc.location?.locationCode || ''}</td><td style="border:1px solid #ddd;padding:6px">${formatDate(epc.inboundDate)}</td><td style="border:1px solid #ddd;padding:6px">${formatStatus(epc.status)}</td></tr>`
  })
  table += '</tbody></table>'

  const stylesheets = Array.from(document.styleSheets)
    .map(sheet => {
      try {
        if (sheet.href) return `<link rel="stylesheet" href="${sheet.href}">`
        if (sheet.ownerNode && sheet.ownerNode.outerHTML) return sheet.ownerNode.outerHTML
      } catch (e) {
        if (sheet.href) return `<link rel="stylesheet" href="${sheet.href}">`
      }
      return ''
    })
    .join('\n')

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    // popup blocked; show a simple alert
    alert('Please allow popups to export PDF')
    return
  }

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Inventory EPCs</title>${stylesheets}<style>body{padding:16px;font-family:Arial,Helvetica,sans-serif}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:6px;text-align:left}</style><script>window.onload=function(){setTimeout(function(){window.print();setTimeout(function(){if(window.opener)window.opener.postMessage('pdf-exported','*')},500)},500)}<\/script></head><body>${header}${table}</body></html>`
  printWindow.document.write(html)
  printWindow.document.close()

  const handler = (e) => {
    if (e.data === 'pdf-exported') {
      // noop - silent success
      window.removeEventListener('message', handler)
    }
  }
  window.addEventListener('message', handler)
}

const exportInventoryAsExcel = () => {
  const data = (selectedEpcs.value.length > 0 ? epcList.value.filter(epc => selectedEpcs.value.includes(epc.id)) : epcList.value).map(epc => ({
    'EPC Code': epc.epcCode || '',
    'Warehouse': epc.warehouse?.warehouseCode || '',
    'Location': epc.location?.locationCode || '',
    'Inbound Date': formatDate(epc.inboundDate),
    'Status': formatStatus(epc.status)
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Inventory EPCs')
  ws['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }]
  XLSX.writeFile(wb, `inventory-epcs-${Date.now()}.xlsx`)
}

const exportInventoryAsCSV = () => {
  const headers = ['EPC Code', 'Warehouse', 'Location', 'Inbound Date', 'Status']
  const rows = (selectedEpcs.value.length > 0 ? epcList.value.filter(epc => selectedEpcs.value.includes(epc.id)) : epcList.value).map(epc => [
    epc.epcCode || '',
    epc.warehouse?.warehouseCode || '',
    epc.location?.locationCode || '',
    formatDate(epc.inboundDate),
    formatStatus(epc.status)
  ])

  let csvContent = headers.join(',') + '\n'
  rows.forEach(row => {
    csvContent += row.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',') + '\n'
  })

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `inventory-epcs-${Date.now()}.csv`
  link.click()
}

const clearSelection = () => {
  selectedEpcs.value = []
}

const applyBulkStatus = async () => {
  if (!bulkStatus.value || selectedEpcs.value.length === 0) return
  loadingBulk.value = true
  try {
    const response = await authenticatedFetch('/api/epc/bulk-update-status', {
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

const handleViewEPC = (epc) => {
  const epcCode = epc.epcCode || null
  console.log('Opening ViewEPC modal for:', epcCode)

  if (viewEPCModalRef.value && epcCode) {
    viewEPCModalRef.value.openModal(epcCode)
  } else {
    selectedEpcCode.value = epcCode
    showViewEPCModal.value = true
  }
}

const closeViewEPCModal = () => {
  showViewEPCModal.value = false
  setTimeout(() => {
    selectedEpcCode.value = null
  }, 300)
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

/* spin-360 animation used for refresh icon */
.spin-360 {
  animation: spin-360 400ms linear;
}

@keyframes spin-360 {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
