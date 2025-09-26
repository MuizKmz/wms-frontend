<template>
  <AdminLayout>
    <div class="flex justify-end mb-4 px-6">
      <DateRangeDropdown @range-select="handleDateRangeChange" />
    </div>

    <ComponentCard title="Work Order">
      <WorkOrderBarChart />
    </ComponentCard>
    <ComponentCard title="Material Usage" class="mt-6">
      <MaterialUsageLineChart />
    </ComponentCard>
  </AdminLayout>
</template>

<script setup>
import { ref } from "vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import WorkOrderBarChart from "./component/WorkOrderBarChart.vue";
import MaterialUsageLineChart from "./component/MaterialUsageLineChart.vue";
// Import the new dropdown component
import DateRangeDropdown from './component/DateRangeDropdown.vue'; 

const selectedDateRange = ref('Last 7 Days'); // Default value

const handleDateRangeChange = (range) => {
  selectedDateRange.value = range;
  // In a real application, you would now use this 'range' 
  // to fetch new data for your charts (WorkOrderBarChart, etc.)
  console.log('New Date Range Selected:', range); 
};
</script>