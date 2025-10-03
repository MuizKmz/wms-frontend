<template>
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
    <AddNewSupplier ref="addSupplierModalRef" />
    
    <!-- Edit Supplier Modal -->
    <EditSupplier ref="editSupplierModalRef" />
  </AdminLayout>
</template>

<script setup>
import { ref } from "vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import SupplierListTable from "./component/SupplierListTable.vue";
import AddNewSupplier from "./component/AddNewSupplier.vue";
import EditSupplier from "./component/EditSupplier.vue";

const currentPageTitle = ref("Supplier Management");
const activeFilters = ref({});
const addSupplierModalRef = ref(null);
const editSupplierModalRef = ref(null);
const supplierTableRef = ref(null);

const handleFilterChange = (filters) => {
  activeFilters.value = filters;
  console.log('Filters applied:', filters);
};

const openAddSupplierModal = () => {
  if (addSupplierModalRef.value) {
    addSupplierModalRef.value.openModal();
  }
};

const openEditSupplierModal = (supplier) => {
  if (editSupplierModalRef.value) {
    editSupplierModalRef.value.openModal(supplier);
  }
};

const handleViewSupplier = (supplier) => {
  console.log('View supplier:', supplier);
  // Implement view modal or navigate to detail page
};

const handleDeleteSupplier = async (supplier) => {
  if (!confirm(`Are you sure you want to delete supplier "${supplier.supplierName}"?`)) {
    return;
  }

  try {
    const response = await fetch(`/api/suppliers/${supplier.id || supplier.supplierCode}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete supplier');
    }

    console.log('Supplier deleted successfully');
    
    // Refresh the table
    if (supplierTableRef.value) {
      supplierTableRef.value.refreshData();
    }
  } catch (error) {
    console.error('Error deleting supplier:', error);
    alert('Failed to delete supplier. Please try again.');
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
</script>