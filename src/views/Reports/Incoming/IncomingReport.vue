<template>
  <AdminLayout>
    <div class="p-6">
      <!-- Page Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Incoming Reports</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
          View and analyze receiving, purchasing, stock adjustments, and pending incoming goods across all locations.
        </p>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <ReportCard
          title="Today's Receiving"
          :value="loadingStats ? '-' : todaysReceiving"
          subtitle="Total receiving transactions completed today"
          :icon="BoxIcon"
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <ReportCard
          title="Pending Receiving"
          :value="loadingStats ? '-' : pendingReceiving"
          subtitle="Goods received physically but pending system confirmation."
          :icon="CalenderIcon"
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
        <ReportCard
          title="Outstanding POs"
          :value="loadingStats ? '-' : outstandingPurchaseOrders"
          subtitle="Number of POs not yet received"
          :icon="OrderIcon"
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
        <ReportCard
          title="Avg Lead Time"
          :value="loadingStats ? '-' : `${averageLeadTime} days`"
          subtitle="Avg days between PO issued and goods received."
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
import { ref, onMounted } from "vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ReportCard from "@/components/common/ReportCard.vue";
import ReportList from "./components/ReportList.vue";
import BoxIcon from "@/icons/BoxIcon.vue";
import CalenderIcon from "@/icons/CalenderIcon.vue";
import OrderIcon from "@/icons/OrderIcon.vue";
import BarChartIcon from "@/icons/BarChartIcon.vue";
import { authenticatedFetch } from "@/utils/authenticatedFetch";

// Stats data
const todaysReceiving = ref(0);
const pendingReceiving = ref(0);
const outstandingPurchaseOrders = ref(0);
const averageLeadTime = ref(0);
const loadingStats = ref(true);

// Fetch statistics from API
const fetchStats = async () => {
  loadingStats.value = true;
  
  try {
    // Fetch today's receiving count
    const today = new Date().toISOString().split('T')[0];
    const receivingResponse = await authenticatedFetch(`/api/receiving?receivingDate=${today}`);
    if (receivingResponse.ok) {
      const receivingData = await receivingResponse.json();
      todaysReceiving.value = Array.isArray(receivingData) ? receivingData.length : 0;
    }

    // Fetch pending receiving (status = 'PENDING' or similar)
    const pendingResponse = await authenticatedFetch('/api/receiving?status=PENDING');
    if (pendingResponse.ok) {
      const pendingData = await pendingResponse.json();
      pendingReceiving.value = Array.isArray(pendingData) ? pendingData.length : 0;
    }

    // Fetch outstanding purchase orders (status = 'PENDING' or 'APPROVED')
    const poResponse = await authenticatedFetch('/api/order?status=PENDING,APPROVED');
    if (poResponse.ok) {
      const poData = await poResponse.json();
      outstandingPurchaseOrders.value = Array.isArray(poData) ? poData.length : 0;
    }

    // Fetch average lead time (if API provides this metric)
    const leadTimeResponse = await authenticatedFetch('/api/receiving/stats/average-lead-time');
    if (leadTimeResponse.ok) {
      const leadTimeData = await leadTimeResponse.json();
      averageLeadTime.value = leadTimeData.averageLeadTime || 0;
    }
  } catch (error) {
    console.error('Error fetching incoming report stats:', error);
  } finally {
    loadingStats.value = false;
  }
};

onMounted(() => {
  fetchStats();
});
</script>