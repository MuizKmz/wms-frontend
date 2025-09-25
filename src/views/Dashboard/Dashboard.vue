<template>
  <AdminLayout>
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

</script>