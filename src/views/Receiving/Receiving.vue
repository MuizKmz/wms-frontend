<template>
  <div
    v-if="showToast"
    class="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none"
  >
    <div
      :class="[
        'rounded-lg px-6 py-4 shadow-lg flex items-center transform transition-all duration-300 pointer-events-auto',
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
    <ToolListFilters @filter-change="handleFilterChange" />

    <div class="space-y-5 sm:space-y-6">
      <ComponentCard title="All Receiving List" desc="Overview of all Receiving List">
        <div>
          <div class="border-b border-gray-200 dark:border-gray-700 -mx-6 px-6 -mt-14">
            <ReceivingListFilters @filter-change="handleFilterChange" />
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
                List of Receivings
                <div
                  v-if="activeTab === 'table'"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 dark:bg-brand-400 rounded-t"
                />
              </button>
            </div>
          </div>

          <div class="flex gap-2 my-6">
            <!-- <button
              v-if="canCreate('Receiving')"
              @click="openAddReceivingModal"
              class="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Add New Receiving old
            </button> -->
            <button
              v-if="canCreate('Receiving')"
              @click="openAddFlowsModal"
              class="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Add New Receiving
            </button>
            <button
              v-if="canDelete('Receiving')"
              @click="handleBulkDelete"
              class="px-4 py-2 btn btn-error text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Delete
            </button>
            <button
              v-if="canCreate('Receiving')"
              @click="handleImportReceiving"
              class="px-4 py-2 btn btn-secondary text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Import from PO
            </button>
          </div>

          <component
            :is="currentComponent"
            v-if="currentComponent"
            ref="receivingTableRef"
            :filters="activeFilters"
            @delete-receiving="handleDeleteReceiving"
            @edit-receiving="handleEditReceiving"
            @view-receiving="handleViewReceiving"
          />
        </div>
      </ComponentCard>
    </div>

    <AddNewReceiving
      v-if="canCreate('Receiving')"
      ref="addReceivingModalRef"
      @receiving-created="handleReceivingCreated"
    />

    <EditReceiving
      v-if="canUpdate('Receiving')"
      ref="editReceivingModalRef"
      @receiving-updated="handleReceivingUpdated"
    />

    <ReceivingView ref="receivingViewModalRef" />
    <ImportfromPO
      v-if="canCreate('Receiving')"
      ref="importFromPoModalRef"
      @file-uploaded="handleImportResult"
    />

    <AddFlowsReceiving
      v-if="canCreate('Receiving')"
      ref="addFlowsModalRef"
      @flow-created="handleFlowCreated"
    />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import ComponentCard from '@/components/common/ComponentCard.vue'
import ReceivingTable from './component/ReceivingTable.vue'

// Get permission checking functions
const { canCreate, canUpdate, canDelete } = useAuth()
import AddNewReceiving from './component/AddNewReceiving.vue'
import EditReceiving from './component/EditReceiving.vue'
import ReceivingView from './component/ReceivingView.vue'
import ImportfromPO from './component/ImportfromPO.vue'
import AddFlowsReceiving from './component/AddFlowsReceiving.vue'
import ReceivingListFilters from './component/ReceivingListFilters.vue'

// Interface definitions
interface Receiving {
  id?: number
  receivingCode?: string
  receivingDate: string
}

interface Result {
  success: boolean
  error?: string
  data?: {
    receivingCode?: string
    count?: number
    deletedCount?: number
  }
}

interface Filters {
  [key: string]: string | number | boolean | undefined
}

const currentPageTitle = ref('Receiving Management')
const activeFilters = ref<Filters>({})
const addReceivingModalRef = ref<InstanceType<typeof AddNewReceiving> | null>(null)
const editReceivingModalRef = ref<InstanceType<typeof EditReceiving> | null>(null)
const receivingViewModalRef = ref<InstanceType<typeof ReceivingView> | null>(null)
const importFromPoModalRef = ref<InstanceType<typeof ImportfromPO> | null>(null)
const addFlowsModalRef = ref<InstanceType<typeof AddFlowsReceiving> | null>(null)
const receivingTableRef = ref<InstanceType<typeof ReceivingTable> | null>(null)
const activeTab = ref('table')

// Toast state
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

// Function to show toast
const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true

  // Hide toast after 2 seconds
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

// Handle receiving creation response
const handleReceivingCreated = async (result: Result) => {
  if (result.success) {
    showToastMessage('Receiving has been successfully added', 'success')
    // Refresh the receiving list
    if (receivingTableRef.value) {
      await receivingTableRef.value.refreshData()
    }
  } else {
    showToastMessage(result.error || 'Failed to create receiving', 'error')
  }
}

// Handle receiving deletion response (No toast here - SweetAlert handles it)
const handleDeleteReceiving = async (result: Result) => {
  console.log('Delete result:', result)
}

// Handle receiving update response
const handleReceivingUpdated = async (result: Result) => {
  if (result.success) {
    showToastMessage('Receiving has been successfully updated', 'success')
    if (receivingTableRef.value) {
      await receivingTableRef.value.refreshData()
    }
  } else {
    showToastMessage(result.error || 'Failed to update receiving', 'error')
  }
}

// Define the single tab with its component
const receivingTabs = [
  {
    id: 'table',
    label: 'List of Receiving',
    component: ReceivingTable,
  },
]

const currentComponent = computed(() => {
  return receivingTabs.find((tab) => tab.id === activeTab.value)?.component
})

const handleFilterChange = (filters: Filters) => {
  activeFilters.value = filters
}

const handleTabChange = (tabId: string) => {
  activeTab.value = tabId
}

const openAddReceivingModal = () => {
  if (addReceivingModalRef.value) {
    addReceivingModalRef.value.openModal()
  }
}

const handleEditReceiving = (receiving: Receiving) => {
  if (editReceivingModalRef.value) {
    editReceivingModalRef.value.openModal(receiving)
  }
}

const handleViewReceiving = (receiving: Receiving) => {
  if (receivingViewModalRef.value) {
    receivingViewModalRef.value.openModal(receiving)
  }
}

// Handle bulk delete
const handleBulkDelete = async () => {
  if (!receivingTableRef.value) {
    console.error('Receiving table ref not available')
    return
  }

  // Check if there are selected items
  const selectedItems = receivingTableRef.value.selectedItems || []

  if (selectedItems.length === 0) {
    // SweetAlert will show the "No Selection" message from bulkDelete function
    await receivingTableRef.value.bulkDelete()
    return
  }

  // Call the bulkDelete method exposed by the ReceivingTable component
  const result = await receivingTableRef.value.bulkDelete()

  // SweetAlert already handles all notifications in the table component
  // No need for additional toast here
  console.log('Bulk delete result:', result)
}

// Handle import receiving
const handleImportReceiving = () => {
  if (importFromPoModalRef.value) {
    importFromPoModalRef.value.openModal()
  }
}

const handleImportResult = async (result: Result) => {
  if (result && result.success) {
    showToastMessage('Import completed successfully', 'success')
    if (receivingTableRef.value) {
      await receivingTableRef.value.refreshData()
    }
  } else {
    showToastMessage(result?.error || 'Import failed', 'error')
  }
}

// Handle add flows
const openAddFlowsModal = () => {
  if (addFlowsModalRef.value) {
    addFlowsModalRef.value.openModal()
  }
}

const handleFlowCreated = async (result: Result) => {
  if (result.success) {
    showToastMessage('Flow created successfully', 'success')
    if (receivingTableRef.value) {
      await receivingTableRef.value.refreshData()
    }
  } else {
    showToastMessage(result.error || 'Failed to create flow', 'error')
  }
}
</script>
