<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <ToolListFilters @filter-change="handleFilterChange" />
    <div class="space-y-5 sm:space-y-6">
      <ComponentCard title="All Receiving List" desc="Overview of all Receiving List">
        <!-- Button in header slot -->
        <template #headerAction>
          <button
            class="px-4 py-2 mr-2 btn btn-error text-white text-sm font-medium rounded-lg transition-colors duration-200">
            Delete
          </button>
          <button @click="openAddMachineModal"
            class="px-4 py-2 btn btn-accent text-white text-sm font-medium rounded-lg transition-colors duration-200">
            Add New Receiving
          </button>
        </template>

        <!-- Table in main slot
        <SupplierListTable :filters="activeFilters" /> -->
      </ComponentCard>
    </div>

    <!-- <AddNewSupplier ref="addMachineModalRef" /> -->
  </AdminLayout>
</template>

<script setup>
import { ref } from "vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import PageTitle from "@/components/common/PageTitle.vue";
// import ToolListFilters from "@/components/common/ToolListFilters.vue"; // Add this import
// import SupplierListTable from "./component/SupplierListTable.vue";
// import AddNewSupplier from "./component/AddNewSupplier.vue";

const currentPageTitle = ref("Receiving Management");
const activeFilters = ref({});
const addMachineModalRef = ref(null);

const handleFilterChange = (filters) => {
  activeFilters.value = filters;
  console.log('Filters applied:', filters); // For debugging
};

const openAddMachineModal = () => {
  console.log('Button clicked'); // Add this
  console.log('Modal ref:', addMachineModalRef.value); // Add this

  if (addMachineModalRef.value) {
    console.log('Calling openModal'); // Add this
    addMachineModalRef.value.openModal();
  } else {
    console.log('Modal ref is null'); // Add this
  }
};
</script>