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
      <ComponentCard
        title="Inventory Location Management"
        desc="Overview of all Warehouses, Racks, and Sections"
      >
        <div>
          <div class="border-b border-gray-200 dark:border-gray-700 -mx-6 px-6 -mt-14">
            <WarehouseFilters
              v-if="activeTab === 'warehouse'"
              @filter-change="handleFilterChange"
            />
            <div class="flex gap-1">
              <button
                v-for="tab in inventoryTabs"
                :key="tab.id"
                @click="handleTabChange(tab.id)"
                :class="[
                  'px-4 py-3 font-medium text-sm transition-all relative',
                  activeTab === tab.id
                    ? 'text-brand-500 dark:text-brand-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200',
                ]"
              >
                {{ tab.label }}
                <div
                  v-if="activeTab === tab.id"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 dark:bg-brand-400 rounded-t"
                />
              </button>
            </div>
          </div>

          <div v-if="activeTab === 'warehouse'" class="flex gap-2 my-6">
            <button
              v-if="canCreate('Warehouse')"
              @click="openAddWarehouseModal"
              class="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Add New Warehouse
            </button>
          </div>
          <div v-if="activeTab === 'location'" class="flex gap-2 my-6">
            <button
              v-if="canCreate('Location')"
              @click="openAddLocationModal"
              class="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Add New Location
            </button>
            <button
              v-if="canDelete('Location')"
              @click="handleBulkDelete"
              class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Delete Selected
            </button>
          </div>

          <component
            :is="currentComponent"
            v-if="currentComponent"
            ref="activeComponentRef"
            :filters="activeFilters"
            @delete-item="handleDeleteItem"
            @edit-item="handleEditItem"
          />
        </div>
      </ComponentCard>
    </div>

    <AddNewWarehouse
      v-if="canCreate('Warehouse')"
      ref="addWarehouseModalRef"
      @item-created="handleItemCreated"
    />
    <AddNewLocation
      v-if="canCreate('Location')"
      ref="addLocationModalRef"
      @item-created="handleItemCreated"
    />
    <AddNewRack v-if="canCreate('Rack')" ref="addRackModalRef" @item-created="handleItemCreated" />
    <AddNewSection
      v-if="canCreate('Section')"
      ref="addSectionModalRef"
      @item-created="handleItemCreated"
      @open-add-rack="handleOpenAddRack"
    />
    <EditWarehouse
      v-if="canUpdate('Warehouse')"
      ref="editWarehouseModalRef"
      @item-updated="handleItemUpdated"
    />
    <EditWarehouse
      ref="editWarehouseModalRef"
      @item-updated="handleItemUpdated"
    />
    <EditLocation
      v-if="canUpdate('Location')"
      ref="editLocationModalRef"
      :locationId="editingLocation.id"
      @item-updated="handleItemUpdated"
    />
    <EditLocation
      ref="editLocationModalRef"
      :locationId="editingLocation.id"
      @item-updated="handleItemUpdated"
    />
    <EditRack
      v-if="canUpdate('Rack')"
      ref="editRackModalRef"
      :rackId="editingRack.id"
      @item-updated="handleItemUpdated"
    />
    <EditSection
      v-if="canUpdate('Section')"
      ref="editSectionModalRef"
      :sectionId="editingSection.id"
      @item-updated="handleItemUpdated"
    />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useAuth } from '@/composables/useAuth'

// Assuming you have renamed/created these components
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import ComponentCard from '@/components/common/ComponentCard.vue'
// Tab Components
import WarehouseListOverview from './component/WarehouseListOverview.vue' // Table/List for Warehouse
import LocationListOverview from './component/LocationListOverview.vue' // Table/List for Location
import RackListOverview from './component/RackListOverview.vue' // Table/List for Rack
import SectionListOverview from './component/SectionListOverview.vue' // Table/List for Section
// Modal Component
import AddNewWarehouse from './component/AddNewWarehouse.vue'
import AddNewLocation from './component/AddNewLocation.vue'
import AddNewRack from './component/AddNewRack.vue'
import AddNewSection from './component/AddNewSection.vue'
import WarehouseFilters from './component/WarehouseFilters.vue'
import EditWarehouse from './component/EditWarehouse.vue'
import EditLocation from './component/EditLocation.vue'
import EditRack from './component/EditRack.vue'
import EditSection from './component/EditSection.vue'

// Get permission checking functions
const { canCreate, canUpdate, canDelete, canExport } = useAuth()

// Interfaces (simplified for the new domain)
interface Result {
  success: boolean
  error?: string
  data?: {
    itemName: string
  }
}

interface Filters {
  [key: string]: string | number | boolean | undefined
}

const currentPageTitle = ref('Warehouse')
const activeFilters = ref<Filters>({})
const addWarehouseModalRef = ref<InstanceType<typeof AddNewWarehouse> | null>(null)
const addLocationModalRef = ref<InstanceType<typeof AddNewLocation> | null>(null)
const addRackModalRef = ref<InstanceType<typeof AddNewRack> | null>(null)
const addSectionModalRef = ref<InstanceType<typeof AddNewSection> | null>(null)
const editWarehouseModalRef = ref<InstanceType<typeof EditWarehouse> | null>(null)
const editLocationModalRef = ref<InstanceType<typeof EditLocation> | null>(null)
const editRackModalRef = ref<InstanceType<typeof EditRack> | null>(null)
const editSectionModalRef = ref<InstanceType<typeof EditSection> | null>(null)
// Reactive holder for the rack being edited so we can pass it as a prop to EditRack
const editingRack = ref<any>({})
// Reactive holder for the section being edited
const editingSection = ref<any>({})
// Reactive holder for the location being edited
const editingLocation = ref<any>({})
// Generic ref for the currently active component (Table/Overview)
const activeComponentRef = ref<any | null>(null)
const activeTab = ref('warehouse') // Default to warehouse

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

// Handle item creation response (e.g., Warehouse created) - TOAST REMAINS HERE
const handleItemCreated = async (result: Result) => {
  if (result.success) {
    showToastMessage('Item has been successfully added', 'success')
    // Refresh the data on the active component
    if (activeComponentRef.value && activeComponentRef.value.refreshData) {
      await activeComponentRef.value.refreshData()
    }
  } else {
    showToastMessage(result.error || 'Failed to create item', 'error')
  }
}

// Handle item deletion response - TOAST IS REMOVED HERE
const handleDeleteItem = async (result: Result) => {
  // The success/error toast logic is removed from this function.
  if (result.success) {
    // Only refresh table on successful deletion
    if (activeComponentRef.value && activeComponentRef.value.refreshData) {
      await activeComponentRef.value.refreshData()
    }
  } else {
    // Only log error on failure. No toast shown.
    console.error('Failed to delete item:', result.error)
  }
}

// Handle edit action coming from child list component
// Handle edit action coming from child list components
// The child components emit a typed payload: { type: 'warehouse'|'rack'|'section'|'location', item }
const handleEditItem = async (payload: any) => {
  if (!payload) return

  // Backwards-compatible: if parent receives raw item (no type), assume warehouse
  const type = payload.type || 'warehouse'
  const item = payload.item || payload

  if (type === 'warehouse') {
    if (editWarehouseModalRef.value && editWarehouseModalRef.value.openModal) {
      editWarehouseModalRef.value.openModal(item)
    } else {
      console.warn('EditWarehouse modal ref not available')
    }
    return
  }

  if (type === 'location') {
    editingLocation.value = item
    await nextTick()
    if (editLocationModalRef.value && editLocationModalRef.value.openModal) {
      editLocationModalRef.value.openModal()
    } else {
      console.warn('EditLocation modal ref not available - check if canUpdate("Location") permission is granted')
    }
    return
  }

  if (type === 'rack') {
    // Ensure the EditRack component receives the rack data via prop before opening
    editingRack.value = item
    // Wait for the prop to propagate to the child component
    await nextTick()
    if (editRackModalRef.value && editRackModalRef.value.openModal) {
      editRackModalRef.value.openModal()
    } else {
      console.warn('EditRack modal ref not available')
    }
    return
  }

  if (type === 'section') {
    // Ensure the EditSection component receives the section id before opening
    editingSection.value = item
    await nextTick()
    if (editSectionModalRef.value && editSectionModalRef.value.openModal) {
      editSectionModalRef.value.openModal()
    } else {
      console.warn('EditSection modal ref not available')
    }
    return
  }

  // For sections and other types, fall back to warehouse editor for now
  if (editWarehouseModalRef.value && editWarehouseModalRef.value.openModal) {
    editWarehouseModalRef.value.openModal(item)
  }
}

// Handle update emitted by EditWarehouse modal
const handleItemUpdated = async (result: Result) => {
  if (result.success) {
    showToastMessage('Item has been successfully updated', 'success')
    if (activeComponentRef.value && activeComponentRef.value.refreshData) {
      await activeComponentRef.value.refreshData()
    }
  } else {
    showToastMessage(result.error || 'Failed to update item', 'error')
  }
}

// FIXED: Handle opening Add Rack modal from Section modal
const handleOpenAddRack = ({ warehouseId }: { warehouseId: number }) => {
  console.log('Opening Add Rack modal with warehouseId:', warehouseId)

  if (addRackModalRef.value && addRackModalRef.value.openModal) {
    // Pass the warehouseId to pre-select the warehouse in the rack modal
    addRackModalRef.value.openModal(warehouseId)
  } else {
    console.warn('AddRack modal ref not available')
  }
}

// Define tabs with components
const inventoryTabs = [
  {
    id: 'warehouse',
    label: 'Warehouse List Overview',
    component: WarehouseListOverview,
  },
  {
    id: 'location',
    label: 'Location Overview',
    component: LocationListOverview,
  },
]

// Computed property to determine which component to render
const currentComponent = computed(() => {
  return inventoryTabs.find((tab) => tab.id === activeTab.value)?.component
})

const handleFilterChange = (filters: Filters) => {
  activeFilters.value = filters
  console.log('Filters applied:', filters)
}

const handleTabChange = (tabId: string) => {
  activeTab.value = tabId
}

// Function specific to the "Add New Warehouse" button
const openAddWarehouseModal = () => {
  if (addWarehouseModalRef.value) {
    addWarehouseModalRef.value.openModal()
  }
}

const openAddLocationModal = () => {
  if (addLocationModalRef.value) {
    addLocationModalRef.value.openModal()
  }
}

const openAddRackModal = () => {
  if (addRackModalRef.value) {
    addRackModalRef.value.openModal()
  }
}

const openAddSectionModal = () => {
  if (addSectionModalRef.value) {
    addSectionModalRef.value.openModal()
  }
}

const handleBulkDelete = () => {
  console.log(`Bulk delete clicked for ${activeTab.value}`)
  // Implement bulk delete functionality specific to the active tab's component
}
</script>
