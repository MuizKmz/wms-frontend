<template>
  <AdminLayout>
    <div class="p-6">
      <!-- Page Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Incoming Reports</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
          View and analyze incoming data across all warehouses
        </p>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ReportCard
          title="Total Products"
          :value="1234"
          subtitle="Across all warehouses"
          :icon="BoxIcon"
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <ReportCard
          title="Low Stock Alerts"
          :value="45"
          subtitle="Items below minimum level"
          :icon="WarningIcon"
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
        />
        <ReportCard
          title="Total Value"
          value="$245,678"
          subtitle="Current inventory value"
          :icon="BarChartIcon"
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
      </div>

      <!-- Reports List -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Available Reports</h2>
        <ReportList />
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref } from "vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ReportCard from "@/components/common/ReportCard.vue";
import ReportList from "./components/ReportList.vue";
import BoxIcon from "@/icons/BoxIcon.vue";
import WarningIcon from "@/icons/WarningIcon.vue";
import BarChartIcon from "@/icons/BarChartIcon.vue";
</script>