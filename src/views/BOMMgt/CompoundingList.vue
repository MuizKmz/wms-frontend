<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <PageTitle title="Bill of Material Management"/>
    <CompoundingListFilters @filter-change="handleFilterChange" />
    
    <div class="space-y-5 sm:space-y-6">
      <ComponentCard title="All Compounding List" desc="Overview of all created compounding list">
        <!-- Button in header slot -->
        <template #headerAction>
          <button class="px-4 py-2 btn btn-accent text-white text-sm font-medium rounded-lg transition-colors duration-200">
            New Compounding Form
          </button>
        </template>
        
        <!-- Table in main slot -->
        <CompoundingListTable :filters="activeFilters" />
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
import CompoundingListFilters from "@/components/common/CompoundingListFilters.vue";
import CompoundingListTable from "@/components/tables/basic-tables/CompoundingListTable.vue";

const currentPageTitle = ref("Bill of Material Management");
const activeFilters = ref({});

const handleFilterChange = (filters) => {
  activeFilters.value = filters;
  console.log('Filters applied:', filters); // For debugging
};
</script>