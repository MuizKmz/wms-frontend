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
    <ToolListFilters @filter-change="handleFilterChange" />

    <div class="space-y-5 sm:space-y-6">
      <ComponentCard title="All Shippment List" desc="Overview of all Shipment List">
        <div>
          <div class="border-b border-gray-200 dark:border-gray-700 -mx-6 px-6 -mt-14">
            <ShipmentListFilter @filter-change="handleFilterChange" />
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
                List of Shipments
                <div
                  v-if="activeTab === 'table'"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 dark:bg-brand-400 rounded-t"
                />
              </button>
            </div>
          </div>

          <div class="flex gap-2 my-6">
            <button
              v-if="canCreate('Shipping')"
              @click="openAddShipmentModal"
              class="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Add New Shipment
            </button>
            <button
              v-if="canDelete('Shipping')"
              @click="handleBulkDelete"
              class="px-4 py-2 btn btn-error text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Delete
            </button>
            <button
              v-if="canCreate('Shipping')"
              @click="handleImportShipment"
              class="px-4 py-2 btn btn-secondary text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Import Shipment
            </button>
          </div>

          <component
            :is="currentComponent"
            v-if="currentComponent"
            ref="shipmentTableRef"
            :filters="activeFilters"
            @delete-shipment="handleDeleteShipment"
            @edit-shipment="handleEditShipment"
          />
        </div>
      </ComponentCard>
    </div>

    <AddNewShipment
      v-if="canCreate('Shipping')"
      ref="addShipmentModalRef"
      @shipment-created="handleShipmentCreated"
    />

    <EditShipment
      v-if="canUpdate('Shipping')"
      ref="editShipmentModalRef"
      @shipment-updated="handleShipmentUpdated"
    />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import ComponentCard from '@/components/common/ComponentCard.vue'
import ShipmentTable from './component/ShipmentTable.vue'
import AddNewShipment from './component/AddNewShipment.vue'
import EditShipment from './component/EditShipment.vue'
import ShipmentListFilter from './component/ShipmentListFilter.vue'

// Get permission checking functions
const { canCreate, canUpdate, canDelete } = useAuth()

// Interface definitions
interface Shipment {
  id?: number
  shipmentCode?: string
  shipmentName: string
}

interface Result {
  success: boolean
  error?: string
  data?: {
    shipmentName?: string
    count?: number
    deletedCount?: number
  }
}

interface Filters {
  [key: string]: string | number | boolean | undefined
}

const currentPageTitle = ref('Shipment Management')
const activeFilters = ref<Filters>({})
const addShipmentModalRef = ref<InstanceType<typeof AddNewShipment> | null>(null)
const editShipmentModalRef = ref<InstanceType<typeof EditShipment> | null>(null)
const shipmentTableRef = ref<InstanceType<typeof ShipmentTable> | null>(null)
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

// Handle shipment creation response
const handleShipmentCreated = async (result: Result) => {
  if (result.success) {
    showToastMessage('Shipment has been successfully added', 'success')
    // Refresh the shipment list
    if (shipmentTableRef.value) {
      await shipmentTableRef.value.refreshData()
    }
  } else {
    showToastMessage(result.error || 'Failed to create shipment', 'error')
  }
}

// Handle shipment deletion response (No toast here - SweetAlert handles it)
const handleDeleteShipment = async (result: Result) => {
  // SweetAlert already shows the success/error message
  // Just refresh if needed (already done in the table component)
  // This handler can be used for additional logic if needed
  console.log('Delete result:', result)
}

// Define the single tab with its component
const shipmentTabs = [
  {
    id: 'table',
    label: 'List of Shipments',
    component: ShipmentTable,
  },
]

const currentComponent = computed(() => {
  return shipmentTabs.find((tab) => tab.id === activeTab.value)?.component
})

const handleFilterChange = (filters: Filters) => {
  activeFilters.value = filters
  console.log('Filters applied:', filters)
}

const handleTabChange = (tabId: string) => {
  activeTab.value = tabId
}

const openAddShipmentModal = () => {
  if (addShipmentModalRef.value) {
    addShipmentModalRef.value.openModal()
  }
}

// Handle bulk delete
const handleBulkDelete = async () => {
  if (!shipmentTableRef.value) {
    console.error('Shipment table ref not available')
    return
  }

  // Check if there are selected items
  const selectedItems = shipmentTableRef.value.selectedItems || []

  if (selectedItems.length === 0) {
    // SweetAlert will show the "No Selection" message from bulkDelete function
    await shipmentTableRef.value.bulkDelete()
    return
  }

  // Call the bulkDelete method exposed by the ShipmentTable component
  const result = await shipmentTableRef.value.bulkDelete()

  // SweetAlert already handles all notifications in the table component
  // No need for additional toast here
  console.log('Bulk delete result:', result)
}

const handleImportShipment = () => {
  console.log('Import Shipment clicked - implementation needed')
  showToastMessage('Shipment import feature is not yet implemented', 'error')
}

// Handle opening the edit modal
const handleEditShipment = (shipment: Shipment) => {
  if (editShipmentModalRef.value) {
    editShipmentModalRef.value.openModal(shipment)
  }
}

// Handle shipment update response
const handleShipmentUpdated = async (result: Result) => {
  if (result.success) {
    showToastMessage('Shipment has been successfully updated', 'success')
    // Refresh the shipment list
    if (shipmentTableRef.value) {
      await shipmentTableRef.value.refreshData()
    }
  } else {
    showToastMessage(result.error || 'Failed to update shipment', 'error')
  }
}
</script>
