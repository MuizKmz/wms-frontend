<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <PageTitle title="Material Management"/>
    <MaterialListFilters @filter-change="handleFilterChange" />
    
    <div class="space-y-5 sm:space-y-6">
      <ComponentCard title="All Material List" desc="Overview of all Material List">
        <!-- Button in header slot -->
        <template #headerAction>
          <button class="px-4 py-2 mr-2 btn btn-accent text-white text-sm font-medium rounded-lg transition-colors duration-200">
            Add New Material
          </button>
          <button class="px-4 py-2 mr-2 btn btn-accent text-white text-sm font-medium rounded-lg transition-colors duration-200">
            Add Existing Material
          </button>
          <button class="px-4 py-2 btn btn-accent text-white text-sm font-medium rounded-lg transition-colors duration-200">
            Import Bulk Material
          </button>
        </template>
        
        <!-- Table in main slot -->
        <MaterialListTable :filters="activeFilters" />
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
import MaterialListFilters from "@/components/common/MaterialListFilters.vue"; // Add this import
import MaterialListTable from "@/components/tables/basic-tables/MaterialListTable.vue";

const currentPageTitle = ref("Material Management");
const activeFilters = ref({});

const handleFilterChange = (filters) => {
  activeFilters.value = filters;
  console.log('Filters applied:', filters); // For debugging
};
</script>