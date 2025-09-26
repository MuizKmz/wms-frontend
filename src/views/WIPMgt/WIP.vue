<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <PageTitle title="Work-in-Progress Management"/>
    <WIPFilters @filter-change="handleFilterChange" />
    
    <!-- Dashboard Cards Section -->
    <div class="mb-6">
      <WIPCard />
    </div>
    
    <div class="space-y-5 sm:space-y-6">
      <ComponentCard title="All Work-in-Progress" desc="Overview of all created Work-in-Progress">
        <!-- Button in header slot -->
        <template #headerAction>
          <button 
            @click="goToOperatorModule"
            class="px-4 py-2 btn btn-accent text-white text-sm font-medium rounded-lg transition-colors duration-200"
          >
            Open Operator Module
          </button>
        </template>
        
        <WIPStatusCard :filters="activeFilters" />
      </ComponentCard>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import PageTitle from "@/components/common/PageTitle.vue"; 
import WIPFilters from "@/views/WIPMgt/component/WIPFilters.vue";
import WIPCard from "@/views/WIPMgt/component/WIPCard.vue";
import WIPStatusCard from "@/views/WIPMgt/component/WIPStatusCard.vue";

const currentPageTitle = ref("Work-in-Progress Management");
const activeFilters = ref({});
const router = useRouter();

const handleFilterChange = (filters) => {
  activeFilters.value = filters;
  console.log("Filters applied:", filters); // For debugging
};

// Navigate to Operator Module route
const goToOperatorModule = () => {
  router.push("/operator/index");
};
</script>
