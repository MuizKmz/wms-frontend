<template>
  <AdminLayout>
    <div class="flex justify-end mb-4 px-6">
      <DateRangeDropdown @range-select="handleDateRangeChange" />
    </div>

    <!-- Restored static layout with spacing -->
    <div class="px-6 grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
      <ChartCard
        title="Work Order"
        fullscreenable
        refreshable
        className="h-full"
      >
        <WorkOrderBarChart />
      </ChartCard>
      <ChartCard
        title="Material Usage"
        fullscreenable
        refreshable
        className="h-full"
      >
        <MaterialUsageLineChart />
      </ChartCard>
      <ChartCard
        title="Material Usage"
        fullscreenable
        refreshable
        className="h-full"
      >
        <MaterialUsageLineChart />
      </ChartCard>
      <ChartCard
        title="Recent Shipments"
        fullscreenable
        refreshable
        className="h-full"
      >
        <RecentShipment />
      </ChartCard>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref } from "vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import WorkOrderBarChart from "./component/WorkOrderBarChart.vue";
import MaterialUsageLineChart from "./component/MaterialUsageLineChart.vue";
import ChartCard from "./component/ChartCard.vue";
import RecentShipment from "./component/RecentShipment.vue";
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