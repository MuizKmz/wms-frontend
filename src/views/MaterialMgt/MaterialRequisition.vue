<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <PageTitle title="Material Management"/>
    <MaterialRequisitionFilters @filter-change="handleFilterChange" />
    
    <div class="space-y-5 sm:space-y-6">
      <ComponentCard title="All Material Requisition Lists" desc="Overview of all Material Requisition Lists">
        <!-- Button in header slot -->
        <template #headerAction>
          <button class="px-4 py-2 btn btn-accent text-white text-sm font-medium rounded-lg transition-colors duration-200">
            Add New Material Requisition
          </button>
        </template>
        
        <!-- Table in main slot -->
        <MaterialRequisitionTable :filters="activeFilters" />
      </ComponentCard>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref } from "vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import PageTitle from "@/components/common/PageTitle.vue"; 
import MaterialRequisitionFilters from "@//views/MaterialMgt/component/MaterialRequisitionFilters.vue"; // Add this import
import MaterialRequisitionTable from "@/views/MaterialMgt/component/MaterialRequisitionTable.vue";

const currentPageTitle = ref("Material Management");
const activeFilters = ref({});

const handleFilterChange = (filters) => {
  activeFilters.value = filters;
  console.log('Filters applied:', filters); // For debugging
};
</script>