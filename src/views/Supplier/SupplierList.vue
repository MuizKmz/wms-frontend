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
        title="All Supplier List" 
        desc="Overview of all Supplier List"
      >
        <div>
          <div class="border-b border-gray-200 dark:border-gray-700 -mx-6 px-6 -mt-14">
            <div class="flex gap-1">
              <button
                @click="handleTabChange('table')"
                :class="[
                  'px-4 py-3 font-medium text-sm transition-all relative',
                  activeTab === 'table'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                ]"
              >
                List of Suppliers
                <div
                  v-if="activeTab === 'table'"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t"
                />
              </button>
              </div>
          </div>

          <div class="flex gap-2 my-6">
            <button @click="openAddSupplierModal"
              class="px-4 py-2 btn btn-accent text-white text-sm font-medium rounded-lg transition-colors duration-200">
              Add New Supplier
            </button>
            <button @click="handleBulkDelete"
              class="px-4 py-2 btn btn-error text-white text-sm font-medium rounded-lg transition-colors duration-200">
              Delete
            </button>
            <button @click="handleImportSupplier"
              class="px-4 py-2 btn btn-secondary text-white text-sm font-medium rounded-lg transition-colors duration-200">
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

    <AddNewSupplier ref="addSupplierModalRef" @supplier-created="handleSupplierCreated" />

    <EditSupplier ref="editSupplierModalRef" @supplier-updated="handleSupplierUpdated" />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"; // Import 'computed'
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import SupplierListTable from "./component/SupplierListTable.vue";
import AddNewSupplier from "./component/AddNewSupplier.vue";
import EditSupplier from "./component/EditSupplier.vue";

// Interface definitions
interface Supplier {
  id?: number;
  supplierCode?: string;
  supplierName: string;
}

interface Result {
  success: boolean;
  error?: string;
  data?: {
    supplierName: string;
  };
}

interface Filters {
  [key: string]: string | number | boolean | undefined;
}

// State and Refs
const currentPageTitle = ref("Supplier Management");
const activeFilters = ref<Filters>({});
const addSupplierModalRef = ref<InstanceType<typeof AddNewSupplier> | null>(null);
const editSupplierModalRef = ref<InstanceType<typeof EditSupplier> | null>(null);
const supplierTableRef = ref<InstanceType<typeof SupplierListTable> | null>(null);
const activeTab = ref('table'); // State for active tab

// --- Tab Logic ---
// Define the single tab with its component
const supplierTabs = [
  {
    id: 'table',
    label: 'List of Suppliers',
    component: SupplierListTable // Use the SupplierListTable component
  },
  // Future tabs can be added here, e.g., { id: 'summary', component: SupplierSummary }
];

// Computed property to dynamically select the component
const currentComponent = computed(() => {
  return supplierTabs.find(tab => tab.id === activeTab.value)?.component;
});

// Handler for tab switch
const handleTabChange = (tabId: string) => {
  activeTab.value = tabId;
};
// --- End Tab Logic ---

// Toast state
const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref<'success' | 'error'>('success'); // Ensure type is explicitly defined

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

// Handle supplier creation response
const handleSupplierCreated = async (result: Result) => {
  if (result.success) {
    showToastMessage('Supplier has been successfully added', 'success');
    if (supplierTableRef.value) {
      // Assuming SupplierListTable has a refreshData method
      await supplierTableRef.value.refreshData();
    }
  } else {
    showToastMessage(result.error || 'Failed to create supplier', 'error');
  }
};

// Handle supplier update response
const handleSupplierUpdated = async (result: Result) => {
  if (result.success) {
    showToastMessage('Supplier has been successfully updated', 'success');
    if (supplierTableRef.value) {
      await supplierTableRef.value.refreshData();
    }
  } else {
    showToastMessage(result.error || 'Failed to update supplier', 'error');
  }
};

const handleFilterChange = (filters: Filters) => {
  activeFilters.value = filters;
  console.log('Filters applied:', filters);
};

const openAddSupplierModal = () => {
  if (addSupplierModalRef.value) {
    addSupplierModalRef.value.openModal();
  }
};

const openEditSupplierModal = (supplier: Supplier) => {
  if (editSupplierModalRef.value) {
    // Assuming EditSupplier component has an openModal method that takes supplier data
    editSupplierModalRef.value.openModal(supplier);
  }
};

const handleViewSupplier = (supplier: Supplier) => {
  console.log('View supplier:', supplier);
  showToastMessage(`Viewing details for ${supplier.supplierName}`, 'success');
  // Implement view modal or navigate to detail page
};

const handleDeleteSupplier = async (result: any) => {
  // This function needs to be improved for better consistency, 
  // but it's kept close to the original for context.
  if (result.success) {
    showToastMessage('Supplier deleted successfully', 'success');
    if (supplierTableRef.value) {
      await supplierTableRef.value.refreshData();
    }
    return
  }
  
  // The original implementation had complex logic for bulk/partial delete.
  // For a clear implementation: If the table refresh is the goal,
  if (result.data && (result.data.count || result.data.deletedCount)) {
    const deletedCount = result.data.count || result.data.deletedCount;
    showToastMessage(`${deletedCount} supplier(s) deleted.`, 'success');
    if (supplierTableRef.value) {
      await supplierTableRef.value.refreshData();
    }
    return
  }

  showToastMessage(result.error || 'Failed to delete supplier', 'error');
  console.error(result.error || 'Failed to delete supplier');
};

const handleBulkDelete = async () => {
  if (!supplierTableRef.value || !supplierTableRef.value.bulkDelete) {
    showToastMessage('Bulk delete feature not available or not implemented on table.', 'error');
    return;
  }

  const result = await supplierTableRef.value.bulkDelete();

  if (result.success) {
    handleDeleteSupplier(result); // Use the same handler to show toast and refresh
  } else {
    showToastMessage(result.error || 'Failed to delete selected suppliers', 'error');
  }
};

const handleImportSupplier = () => {
  console.log('Import supplier clicked - implementation needed');
  showToastMessage('Supplier import feature is not yet implemented', 'error');
};
</script>