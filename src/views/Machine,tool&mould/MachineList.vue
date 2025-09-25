<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <PageTitle title="Machine Management"/>
    <MachineListFilters @filter-change="handleFilterChange" />
    
    <div class="space-y-5 sm:space-y-6">
      <ComponentCard title="All Machine List" desc="Overview of all Machine List">
        <!-- Button in header slot -->
        <template #headerAction>
          <button 
            @click="openAddMachineModal"
            class="px-4 py-2 btn btn-accent text-white text-sm font-medium rounded-lg transition-colors duration-200"
          >
            Add New Machine
          </button>
        </template>
        
        <!-- Table in main slot -->
        <MachineListTable :filters="activeFilters" />
      </ComponentCard>
    </div>
    
    <!-- Add Machine Modal -->
<AddNewMachine ref="addMachineModalRef" />

  </AdminLayout>
</template>

<script setup>
import { ref } from "vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import PageTitle from "@/components/common/PageTitle.vue"; 
import MachineListTable from "@/views/Machine,tool&mould/component/MachineListTable.vue";
import MachineListFilters from "@/views/Machine,tool&mould/component/MachineListFilters.vue";
import AddNewMachine from "@/views/Machine,tool&mould/component/AddNewMachine.vue"; 

const currentPageTitle = ref("Machine Management");
const activeFilters = ref({});
const addMachineModalRef = ref(null);

const handleFilterChange = (filters) => {
  activeFilters.value = filters;
  console.log('Filters applied:', filters);
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
const handleMachineAdded = (machineData) => {
  console.log('New machine added:', machineData);
  // Handle the new machine data here
};
</script>