<template>
  <div
    v-if="showToast"
    class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
  >
    <div
      :class="[
        'rounded-lg px-6 py-4 shadow-lg flex items-center transform transition-all duration-300',
        toastType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white',
      ]"
    >
      <span v-if="toastType === 'success'" class="mr-2">✓</span>
      <span v-else class="mr-2">⚠</span>
      {{ toastMessage }}
    </div>
  </div>

  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div class="space-y-5 sm:space-y-6">
      <ComponentCard title="All Inventory List" desc="Overview of all Inventory List">
        <div>
          <div class="border-b border-gray-200 dark:border-gray-700 -mx-6 px-6 -mt-14">
            <InventoryFilters @filter-change="handleFilterChange" />
            <div class="flex gap-1">
              <button
                @click="handleTabChange('table')"
                :class="[
                  'px-4 py-3 font-medium text-sm transition-all relative',
                  activeTab === 'table'
                    ? 'text-brand-500 dark:text-brand-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200',
                ]"
              >
                List of Inventory
                <div
                  v-if="activeTab === 'table'"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 dark:bg-brand-400 rounded-t"
                />
              </button>
            </div>
          </div>

          <div class="flex gap-2 my-6">
            <button
              @click="handleImportUpdateStatus"
              class="px-4 py-2 btn btn-secondary text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Import Update Status
            </button>
            <button
              @click="handleImportUpdateInventory"
              class="px-4 py-2 btn btn-secondary text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Import Update Inventory
            </button>
          </div>

          <component
            :is="currentComponent"
            v-if="currentComponent"
            ref="inventoryTableRef"
            :filters="activeFilters"
            @view-inventory="handleViewInventory"
          />
        </div>
      </ComponentCard>
    </div>
  </AdminLayout>

  <ImportUpdateInventory ref="inventoryModalRef" @file-uploaded="handleFileUploaded" />

  <ImportUpdateStatus ref="statusModalRef" @file-uploaded="handleStatusFileUploaded" />

  <InventoryDetails ref="inventoryDetailsModalRef" @close="handleCloseInventoryDetails" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import ComponentCard from '@/components/common/ComponentCard.vue'
import InventoryTable from './component/InventoryTable.vue'
import InventoryFilters from './component/InventoryFilters.vue'
import ImportUpdateInventory from './component/ImportUpdateInventory.vue'
import ImportUpdateStatus from './component/ImportUpdateStatus.vue'
import InventoryDetails from './component/InventoryDetails.vue'

// Interface definitions
interface Filters {
  [key: string]: string | number | boolean | undefined
}

interface InventoryItem {
  id: number
  productId: number
  quantity: number
  lastUpdatedAt: string
  product: any
}

// State and Refs
const currentPageTitle = ref('Inventory Management')
const activeFilters = ref<Filters>({})
const inventoryTableRef = ref<InstanceType<typeof InventoryTable> | null>(null)
const activeTab = ref('table')

// Refs for the modal components
const inventoryModalRef = ref<InstanceType<typeof ImportUpdateInventory> | null>(null)
const statusModalRef = ref<InstanceType<typeof ImportUpdateStatus> | null>(null)
const inventoryDetailsModalRef = ref<InstanceType<typeof InventoryDetails> | null>(null)

// --- Tab Logic ---
const inventoryTabs = [
  {
    id: 'table',
    label: 'List of Inventory',
    component: InventoryTable,
  },
]

const currentComponent = computed(() => {
  return inventoryTabs.find((tab) => tab.id === activeTab.value)?.component
})

const handleTabChange = (tabId: string) => {
  activeTab.value = tabId
}
// --- End Tab Logic ---

// Toast state
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

/**
 * Function to show toast notification
 */
const showToastMessage = (
  message: string,
  type: 'success' | 'error' = 'success',
  duration: number = 2000,
) => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true

  // Hide toast after a duration
  setTimeout(() => {
    showToast.value = false
  }, duration)
}

const handleFilterChange = (filters: Filters) => {
  activeFilters.value = filters
  console.log('Filters applied:', filters)
}

/**
 * Handler for 'Import Update Status' button click
 * Opens the ImportUpdateStatus modal
 */
const handleImportUpdateStatus = () => {
  if (statusModalRef.value) {
    statusModalRef.value.openModal()
  }
}

/**
 * Handler for 'Import Update Inventory' button click
 * Opens the ImportUpdateInventory modal
 */
const handleImportUpdateInventory = () => {
  if (inventoryModalRef.value) {
    inventoryModalRef.value.openModal()
  }
}

/**
 * Handler for the @file-uploaded event from the ImportUpdateInventory modal
 */
const handleFileUploaded = (event: { success: boolean; data?: any; error?: string }) => {
  if (event.success) {
    showToastMessage('Inventory stock updated successfully!', 'success')
    // Refresh the inventory table data
    inventoryTableRef.value?.refreshData()
  } else {
    showToastMessage(
      event.error || 'Inventory stock upload failed. Please check the file.',
      'error',
      3500,
    )
  }
}

/**
 * Handler for the @file-uploaded event from the ImportUpdateStatus modal
 */
const handleStatusFileUploaded = (event: { success: boolean; data?: any; error?: string }) => {
  if (event.success) {
    showToastMessage('Inventory status updated successfully!', 'success')
    // Refresh the inventory table data
    inventoryTableRef.value?.refreshData()
  } else {
    showToastMessage(
      event.error || 'Inventory status upload failed. Please check the file.',
      'error',
      3500,
    )
  }
}

/**
 * Handler for viewing inventory details
 * Opens the InventoryDetails modal with the selected item
 */
const handleViewInventory = (item: InventoryItem) => {
  console.log('Viewing inventory:', item)
  if (inventoryDetailsModalRef.value) {
    inventoryDetailsModalRef.value.openModal(item)
  }
}

/**
 * Handler for closing the inventory details modal
 */
const handleCloseInventoryDetails = () => {
  // Optionally refresh the table after closing the modal
  // inventoryTableRef.value?.refreshData();
}
</script>
