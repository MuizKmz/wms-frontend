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
      <ComponentCard title="All Supplier List" desc="Overview of all Supplier List">
        <div>
          <div class="border-b border-gray-200 dark:border-gray-700 -mx-6 px-6 -mt-14">
            <SupplierListFilters @filter-change="handleFilterChange" />
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
                List of Suppliers
                <div
                  v-if="activeTab === 'table'"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 dark:bg-brand-400 rounded-t"
                />
              </button>
            </div>
          </div>

          <div class="flex gap-2 my-6">
            <button
              v-if="canCreate('Supplier')"
              @click="openAddSupplierModal"
              class="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Add New Supplier
            </button>
            <button
              v-if="canDelete('Supplier')"
              @click="handleBulkDelete"
              class="px-4 py-2 btn btn-error text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Delete
            </button>
            <button
              v-if="canCreate('Supplier')"
              @click="handleImportSupplier"
              class="px-4 py-2 btn btn-secondary text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Import Supplier
            </button>
          </div>

          <component
            :is="currentComponent"
            v-if="currentComponent"
            ref="supplierTableRef"
            :filters="activeFilters"
            @edit-supplier="openEditSupplierModal"
            @view-supplier="handleViewSupplier"
            @delete-supplier="handleDeleteSupplier"
          />
        </div>
      </ComponentCard>
    </div>

    <AddNewSupplier
      v-if="canCreate('Supplier')"
      ref="addSupplierModalRef"
      @supplier-created="handleSupplierCreated"
    />

    <EditSupplier
      v-if="canUpdate('Supplier')"
      ref="editSupplierModalRef"
      @supplier-updated="handleSupplierUpdated"
    />

    <ImportSupplier
      v-if="canCreate('Supplier')"
      ref="importSupplierModalRef"
      @file-uploaded="handleImportSupplierUploaded"
    />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import ComponentCard from '@/components/common/ComponentCard.vue'
import SupplierListTable from './component/SupplierListTable.vue'
import AddNewSupplier from './component/AddNewSupplier.vue'
import EditSupplier from './component/EditSupplier.vue'
import SupplierListFilters from './component/SupplierListFilters.vue'
// New: Import the ImportSupplier modal component
import ImportSupplier from './component/ImportSupplier.vue'

// Get permission checking functions
const { canCreate, canUpdate, canDelete } = useAuth()

// Interface definitions
interface Supplier {
  id?: number
  supplierCode?: string
  supplierName: string
}

interface Result {
  success: boolean
  error?: string
  data?: {
    supplierName?: string
    count?: number // for bulk delete
    deletedCount?: number // for bulk delete
    // Add any specific data properties expected from the import modal if needed
  }
}

interface Filters {
  [key: string]: string | number | boolean | undefined
}

// State and Refs
const currentPageTitle = ref('Supplier Management')
const activeFilters = ref<Filters>({})
const addSupplierModalRef = ref<InstanceType<typeof AddNewSupplier> | null>(null)
const editSupplierModalRef = ref<InstanceType<typeof EditSupplier> | null>(null)
const supplierTableRef = ref<InstanceType<typeof SupplierListTable> | null>(null)
const activeTab = ref('table')

// New: Ref for the ImportSupplier modal
const importSupplierModalRef = ref<InstanceType<typeof ImportSupplier> | null>(null)

// --- Tab Logic ---
// Define the single tab with its component
const supplierTabs = [
  {
    id: 'table',
    label: 'List of Suppliers',
    component: SupplierListTable, // Use the SupplierListTable component
  },
  // Future tabs can be added here
]

// Computed property to dynamically select the component
const currentComponent = computed(() => {
  return supplierTabs.find((tab) => tab.id === activeTab.value)?.component
})

// Handler for tab switch
const handleTabChange = (tabId: string) => {
  activeTab.value = tabId
}
// --- End Tab Logic ---

// Toast state
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success') // Ensure type is explicitly defined

// Function to show toast
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

// Handle supplier creation response
const handleSupplierCreated = async (result: Result) => {
  if (result.success) {
    showToastMessage('Supplier has been successfully added', 'success')
    if (supplierTableRef.value && 'refreshData' in supplierTableRef.value) {
      // Assuming SupplierListTable has a refreshData method
      await (supplierTableRef.value as any).refreshData()
    }
  } else {
    showToastMessage(result.error || 'Failed to create supplier', 'error')
  }
}

// Handle supplier update response
const handleSupplierUpdated = async (result: Result) => {
  if (result.success) {
    showToastMessage('Supplier has been successfully updated', 'success')
    if (supplierTableRef.value && 'refreshData' in supplierTableRef.value) {
      await (supplierTableRef.value as any).refreshData()
    }
  } else {
    showToastMessage(result.error || 'Failed to update supplier', 'error')
  }
}

const handleFilterChange = (filters: Filters) => {
  activeFilters.value = filters
  console.log('Filters applied:', filters)
}

const openAddSupplierModal = () => {
  if (addSupplierModalRef.value) {
    addSupplierModalRef.value.openModal()
  }
}

const openEditSupplierModal = (supplier: Supplier) => {
  if (editSupplierModalRef.value) {
    // Assuming EditSupplier component has an openModal method that takes supplier data
    ;(editSupplierModalRef.value as any).openModal(supplier)
  }
}

const handleViewSupplier = (supplier: Supplier) => {
  console.log('View supplier:', supplier)
  showToastMessage(`Viewing details for ${supplier.supplierName}`, 'success')
  // Implement view modal or navigate to detail page
}

const handleDeleteSupplier = async (result: Result) => {
  if (result.success) {
    showToastMessage('Supplier deleted successfully', 'success')
    if (supplierTableRef.value && 'refreshData' in supplierTableRef.value) {
      await (supplierTableRef.value as any).refreshData()
    }
    return
  }

  // Handling for bulk/partial delete response structure
  if (result.data && (result.data.count || result.data.deletedCount)) {
    const deletedCount = result.data.count || result.data.deletedCount
    showToastMessage(`${deletedCount} supplier(s) deleted.`, 'success')
    if (supplierTableRef.value && 'refreshData' in supplierTableRef.value) {
      await (supplierTableRef.value as any).refreshData()
    }
    return
  }

  showToastMessage(result.error || 'Failed to delete supplier', 'error')
  console.error(result.error || 'Failed to delete supplier')
}

const handleBulkDelete = async () => {
  if (!supplierTableRef.value || !('bulkDelete' in supplierTableRef.value)) {
    showToastMessage('Bulk delete feature not available or not implemented on table.', 'error')
    return
  }

  // Assuming bulkDelete method returns a promise with a Result object
  const result: Result = await (supplierTableRef.value as any).bulkDelete()

  if (result.success) {
    handleDeleteSupplier(result) // Use the same handler to show toast and refresh
  } else {
    showToastMessage(result.error || 'Failed to delete selected suppliers', 'error')
  }
}

/**
 * Handler for 'Import Supplier' button click
 * Opens the ImportSupplier modal
 */
const handleImportSupplier = () => {
  if (importSupplierModalRef.value) {
    importSupplierModalRef.value.openModal()
  }
}

/**
 * Handler for the @file-uploaded event from the ImportSupplier modal
 */
const handleImportSupplierUploaded = (event: { success: boolean; data?: any; error?: string }) => {
  if (event.success) {
    showToastMessage('Suppliers imported successfully!', 'success')
    // Refresh the supplier list table data
    if (supplierTableRef.value && 'refreshData' in supplierTableRef.value) {
      ;(supplierTableRef.value as any).refreshData()
    }
  } else {
    showToastMessage(
      event.error || 'Supplier import failed. Please check the file format.',
      'error',
      3500,
    )
  }
}
</script>
