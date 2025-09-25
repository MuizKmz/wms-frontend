<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <PageTitle title="Bill of Material Management"/>
    <BOMListFilters @filter-change="handleFilterChange" />
    
    <div class="space-y-5 sm:space-y-6">
      <ComponentCard title="All BOM Lists" desc="Overview of all created BOM lists">
        <!-- Button in header slot -->
        <template #headerAction>
          <button class="px-4 py-2 mr-2 btn btn-error text-white text-sm font-medium rounded-lg transition-colors duration-200">
            Delete
          </button>
          <button class="px-4 py-2 btn btn-accent text-white text-sm font-medium rounded-lg transition-colors duration-200">
            New BOM Form
          </button>
        </template>
        
        <!-- Table in main slot -->
        <BOMListTable :filters="activeFilters" />
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
import BOMListFilters from "@/views/BOMMgt/component/BOMListFilters.vue"; // Add this import
import BOMListTable from "@/views/BOMMgt/component/BOMListTable.vue";

const currentPageTitle = ref("Bill of Material Management");
const activeFilters = ref({});

const handleFilterChange = (filters) => {
  activeFilters.value = filters;
  console.log('Filters applied:', filters); // For debugging
};
</script>