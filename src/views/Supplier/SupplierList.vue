<template>
  <!-- Toast Notification -->
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
      <ComponentCard title="All Supplier List" desc="Overview of all Supplier List">
        <!-- Button in header slot -->
        <template #headerAction>
          <button
            @click="handleBulkDelete"
            class="px-4 py-2 mr-2 btn btn-error text-white text-sm font-medium rounded-lg transition-colors duration-200">
            Delete
          </button>
          <button
            @click="openAddSupplierModal"
            class="px-4 py-2 mr-2 btn btn-accent text-white text-sm font-medium rounded-lg transition-colors duration-200">
            Add New Supplier
          </button>
          <button
            @click="handleImportSupplier"
            class="px-4 py-2 btn btn-secondary text-white text-sm font-medium rounded-lg transition-colors duration-200">
            Import Supplier
          </button>
        </template>

        <!-- Table in main slot -->
        <SupplierListTable
          ref="supplierTableRef"
          :filters="activeFilters"
          @edit-supplier="openEditSupplierModal"
          @view-supplier="handleViewSupplier"
          @delete-supplier="handleDeleteSupplier"
        />
      </ComponentCard>
    </div>

    <!-- Add New Supplier Modal -->
    <AddNewSupplier
      ref="addSupplierModalRef"
      @supplier-created="handleSupplierCreated"
    />

  <!-- Edit Supplier Modal -->
  <EditSupplier ref="editSupplierModalRef" @supplier-updated="handleSupplierUpdated" />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";

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
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import SupplierListTable from "./component/SupplierListTable.vue";
import AddNewSupplier from "./component/AddNewSupplier.vue";
import EditSupplier from "./component/EditSupplier.vue";

// Toast state
const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref('success');

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
    // Refresh the supplier list if needed
    if (supplierTableRef.value) {
      await supplierTableRef.value.refreshData();
    }
  } else {
    showToastMessage(result.error || 'Failed to create supplier', 'error');
  }
};

// Handle supplier deletion response
const currentPageTitle = ref("Supplier Management");
const activeFilters = ref<Filters>({});
const addSupplierModalRef = ref<InstanceType<typeof AddNewSupplier> | null>(null);
const editSupplierModalRef = ref<InstanceType<typeof EditSupplier> | null>(null);
const supplierTableRef = ref<InstanceType<typeof SupplierListTable> | null>(null);

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
    editSupplierModalRef.value.openModal(supplier);
  }
};

const handleViewSupplier = (supplier: Supplier) => {
  console.log('View supplier:', supplier);
  // Implement view modal or navigate to detail page
};

const handleDeleteSupplier = async (result: Result) => {
  if (result.success) {
    showToastMessage(`Supplier ${result.data?.supplierName || 'unknown'} has been deleted successfully`, 'success');
    // Refresh table to show updated data
    if (supplierTableRef.value) {
      await supplierTableRef.value.refreshData();
    }
  } else {
    showToastMessage(result.error || 'Failed to delete supplier', 'error');
  }
};

const handleBulkDelete = () => {
  console.log('Bulk delete clicked');
  // Implement bulk delete functionality
};

const handleImportSupplier = () => {
  console.log('Import supplier clicked');
  // Implement import functionality
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
</script>
