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
      <ComponentCard title="All Return List" desc="Overview of all Return List">
        <div>
          <div class="border-b border-gray-200 dark:border-gray-700 -mx-6 px-6 -mt-14">
            <ReturnListFilter @filter-change="handleFilterChange" />
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
                List of Returns
                <div
                  v-if="activeTab === 'table'"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 dark:bg-brand-400 rounded-t"
                />
              </button>
            </div>
          </div>

          <div class="flex gap-2 my-6">
            <button
              @click="openCreateModal"
              class="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Add New Return
            </button>
            <button
              @click="handleBulkDelete"
              class="px-4 py-2 btn btn-error text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Delete
            </button>
          </div>

          <component
            :is="currentComponent"
            v-if="currentComponent"
            ref="returnTableRef"
            :filters="activeFilters"
            @delete-return="handleDeleteReturn"
            @edit-return="handleEditReturn"
            @view-return="handleViewReturn"
            @approve-return="handleApproveReturn"
            @receive-return="handleReceiveReturn"
            @complete-return="handleCompleteReturn"
          />
        </div>
      </ComponentCard>
    </div>

    <ReturnFormModal
      ref="returnFormModalRef"
      @return-created="handleReturnCreated"
    />

    <EditReturn
      ref="editReturnModalRef"
      @return-updated="handleReturnUpdated"
    />

    <ReturnView
      ref="returnViewModalRef"
    />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import ComponentCard from '@/components/common/ComponentCard.vue'
import ReturnTable from './component/ReturnTable.vue'
import ReturnFormModal from './component/ReturnFormModal.vue'
import EditReturn from './component/EditReturn.vue'
import ReturnView from './component/ReturnView.vue'
import ReturnListFilter from './component/ReturnListFilter.vue'

interface ReturnItem {
  id: number
  returnCode: string
  returnType: 'CUSTOMER_RETURN' | 'SUPPLIER_RETURN'
  status: string
  orderId?: number
  receivingId?: number
  customerId?: number
  supplierId?: number
  requestedDate: string
  requestedBy: number
  reason?: string
  notes?: string
  source?: string
  createdAt?: string
  updatedAt?: string
  order?: any
  receiving?: any
  customer?: any
  supplier?: any
  requester?: any
  returnItems?: any[]
  warehouse?: any
  location?: any
  authorizer?: any
  [key: string]: any
}

interface Result {
  success: boolean
  error?: string
  data?: {
    returnNo?: string
    count?: number
    deletedCount?: number
  }
}

interface Filters {
  [key: string]: string | number | boolean | undefined
}

const currentPageTitle = ref('Return Management')
const activeFilters = ref<Filters>({})
const returnFormModalRef = ref<InstanceType<typeof ReturnFormModal> | null>(null)
const editReturnModalRef = ref<InstanceType<typeof EditReturn> | null>(null)
const returnViewModalRef = ref<InstanceType<typeof ReturnView> | null>(null)
const returnTableRef = ref<InstanceType<typeof ReturnTable> | null>(null)
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

// Handle return creation response
const handleReturnCreated = async (result: Result) => {
  if (result.success) {
    showToastMessage('Return has been successfully added', 'success')
    // Refresh the return list
    if (returnTableRef.value) {
      await returnTableRef.value.refreshData()
    }
  } else {
    showToastMessage(result.error || 'Failed to create return', 'error')
  }
}

// Handle return deletion response
const handleDeleteReturn = async (result: Result) => {
  console.log('Delete result:', result)
}

// Define the single tab with its component
const returnTabs = [
  {
    id: 'table',
    label: 'List of Returns',
    component: ReturnTable,
  },
]

const currentComponent = computed(() => {
  return returnTabs.find((tab) => tab.id === activeTab.value)?.component
})

const handleFilterChange = (filters: Filters) => {
  activeFilters.value = filters
  console.log('Filters applied:', filters)
}

const handleTabChange = (tabId: string) => {
  activeTab.value = tabId
}

const openCreateModal = () => {
  if (returnFormModalRef.value) {
    returnFormModalRef.value.openModal()
  }
}

// Handle bulk delete
const handleBulkDelete = async () => {
  if (!returnTableRef.value) {
    console.error('Return table ref not available')
    return
  }

  const result = await returnTableRef.value.bulkDelete()
  console.log('Bulk delete result:', result)
}

// Handle opening the edit modal
const handleEditReturn = (returnItem: ReturnItem) => {
  if (editReturnModalRef.value) {
    editReturnModalRef.value.openModal(returnItem as any)
  }
}

// Handle opening the view modal
const handleViewReturn = (returnItem: ReturnItem) => {
  if (returnViewModalRef.value) {
    // Ensure all required fields have default values
    const viewData = {
      ...returnItem,
      source: returnItem.source || 'admin',
      createdAt: returnItem.createdAt || new Date().toISOString(),
      updatedAt: returnItem.updatedAt || new Date().toISOString(),
      reason: returnItem.reason || '',
      notes: returnItem.notes || ''
    }
    returnViewModalRef.value.openModal(viewData as any)
  }
}

// Handle approve return
const handleApproveReturn = async (result: Result) => {
  if (result.success) {
    showToastMessage('Return has been successfully approved', 'success')
    // Refresh the return list
    if (returnTableRef.value) {
      returnTableRef.value.refreshData()
    }
  } else {
    showToastMessage(result.error || 'Failed to approve return', 'error')
  }
}

// Handle receive return
const handleReceiveReturn = async (result: Result) => {
  if (result.success) {
    showToastMessage('Return has been marked as received', 'success')
    if (returnTableRef.value) {
      returnTableRef.value.refreshData()
    }
  } else {
    showToastMessage(result.error || 'Failed to mark return as received', 'error')
  }
}

// Handle complete return
const handleCompleteReturn = async (result: Result) => {
  if (result.success) {
    showToastMessage('Return has been completed. EPCs and inventory updated.', 'success')
    if (returnTableRef.value) {
      returnTableRef.value.refreshData()
    }
  } else {
    showToastMessage(result.error || 'Failed to complete return', 'error')
  }
}

// Handle return update response
const handleReturnUpdated = async (result: Result) => {
  if (result.success) {
    showToastMessage('Return has been successfully updated', 'success')
    // Refresh the return list
    if (returnTableRef.value) {
      await returnTableRef.value.refreshData()
    }
  } else {
    showToastMessage(result.error || 'Failed to update return', 'error')
  }
}
</script>
