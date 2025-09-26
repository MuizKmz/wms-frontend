<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <PageTitle title="Quality Control"/>
    <ToolListFilters @filter-change="handleFilterChange" />
    
    <div class="space-y-5 sm:space-y-6">
      <ComponentCard title="All OQC List" desc="Overview of all OQC List">
        <!-- Button in header slot -->
        <template #headerAction>
          <button class="px-4 py-2  btn btn-accent text-white text-sm font-medium rounded-lg transition-colors duration-200">
            New OQC Entry
          </button>
        </template>
        
        <!-- Table in main slot -->
        <OQCTable :filters="activeFilters" />
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
// import ToolListFilters from "@/components/common/ToolListFilters.vue"; // Add this import
import OQCTable from "./component/OQCTable.vue";
const currentPageTitle = ref("Quality Control");
const activeFilters = ref({});

const handleFilterChange = (filters) => {
  activeFilters.value = filters;
  console.log('Filters applied:', filters); // For debugging
};
</script>