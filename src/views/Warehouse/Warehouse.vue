<template>
  <div v-if="showToast" class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
    <div :class="[
      'rounded-lg px-6 py-4 shadow-lg flex items-center transform transition-all duration-300',
      toastType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    ]">
      <span v-if="toastType === 'success'" class="mr-2">✓</span>
      <span v-else class="mr-2">⚠</span>
      {{ toastMessage }}
    </div>
  </div>

  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <ToolListFilters @filter-change="handleFilterChange" />
    
    <div class="space-y-5 sm:space-y-6">
      <ComponentCard 
        title="Inventory Location Management" 
        desc="Overview of all Warehouses, Racks, and Sections"
      >
        <div>
          <div class="border-b border-gray-200 dark:border-gray-700 -mx-6 px-6 -mt-14">
            <div class="flex gap-1">
              <button
                v-for="tab in inventoryTabs"
                :key="tab.id"
                @click="handleTabChange(tab.id)"
                :class="[
                  'px-4 py-3 font-medium text-sm transition-all relative',
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                ]"
              >
                {{ tab.label }}
                <div
                  v-if="activeTab === tab.id"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t"
                />
              </button>
            </div>
          </div>

          <div v-if="activeTab === 'warehouse'" class="flex gap-2 my-6">
            <button 
              @click="openAddWarehouseModal"
        class="px-4 py-2 btn btn-accent text-white text-sm font-medium rounded-lg transition-colors duration-200">
              Add New Warehouse
            </button>
          </div>

          <component 
            :is="currentComponent" 
            v-if="currentComponent"
            ref="activeComponentRef"
            :filters="activeFilters"
            @delete-item="handleDeleteItem"
          />
        </div>
      </ComponentCard>
    </div>

    <AddNewWarehouse 
      ref="addWarehouseModalRef"
      @item-created="handleItemCreated"
    />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
// Assuming you have renamed/created these components
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
// Tab Components
import WarehouseListOverview from "./component/WarehouseListOverview.vue"; // Table/List for Warehouse
import RackListOverview from "./component/RackListOverview.vue";         // Table/List for Rack
import SectionListOverview from "./component/SectionListOverview.vue";   // Table/List for Section
// Modal Component
import AddNewWarehouse from "./component/AddNewWarehouse.vue";

// Interfaces (simplified for the new domain)
interface Result {
  success: boolean;
  error?: string;
  data?: {
    itemName: string;
  };
}

interface Filters {
  [key: string]: string | number | boolean | undefined;
}

const currentPageTitle = ref("Warehouse");
const activeFilters = ref<Filters>({});
const addWarehouseModalRef = ref<InstanceType<typeof AddNewWarehouse> | null>(null);
// Generic ref for the currently active component (Table/Overview)
const activeComponentRef = ref<any | null>(null); 
const activeTab = ref('warehouse'); // Default to warehouse

// Toast state
const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref<'success' | 'error'>('success');

// Function to show toast
const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = message;
  toastType.value = type;
  showToast.value = true;

  // Hide toast after 2 seconds
  setTimeout(() => {
    showToast.value = false;
  }, 2000);
};

// Handle item creation response (e.g., Warehouse created)
const handleItemCreated = async (result: Result) => {
  if (result.success) {
    showToastMessage('Item has been successfully added', 'success');
    // Refresh the data on the active component
    if (activeComponentRef.value && activeComponentRef.value.refreshData) {
      await activeComponentRef.value.refreshData();
    }
  } else {
    showToastMessage(result.error || 'Failed to create item', 'error');
  }
};

// Handle item deletion response
const handleDeleteItem = async (result: Result) => {
  const itemName = result.data?.itemName || 'unknown item';
  if (result.success) {
    showToastMessage(`${itemName} has been deleted successfully`, 'success');
    // Refresh table to show updated data
    if (activeComponentRef.value && activeComponentRef.value.refreshData) {
      await activeComponentRef.value.refreshData();
    }
  } else {
    showToastMessage(result.error || `Failed to delete ${itemName}`, 'error');
  }
};

// Define tabs with components based on the image
const inventoryTabs = [
  {
    id: 'warehouse',
    label: 'Warehouse List Overview',
    component: WarehouseListOverview
  },
  {
    id: 'rack',
    label: 'Rack List Overview',
    component: RackListOverview
  },
  {
    id: 'section',
    label: 'Section List Overview',
    component: SectionListOverview
  }
];

// Computed property to determine which component to render
const currentComponent = computed(() => {
  return inventoryTabs.find(tab => tab.id === activeTab.value)?.component;
});

const handleFilterChange = (filters: Filters) => {
  activeFilters.value = filters;
  console.log('Filters applied:', filters);
};

const handleTabChange = (tabId: string) => {
  activeTab.value = tabId;
};

// Function specific to the "Add New Warehouse" button
const openAddWarehouseModal = () => {
  if (addWarehouseModalRef.value) {
    addWarehouseModalRef.value.openModal();
  }
};

const handleBulkDelete = () => {
  console.log(`Bulk delete clicked for ${activeTab.value}`);
  // Implement bulk delete functionality specific to the active tab's component
};
</script>