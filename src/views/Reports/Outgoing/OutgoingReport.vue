<template>
  <AdminLayout>
    <div class="p-6">
      <!-- Page Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Outgoing Reports</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
          View and analyze orders, deliveries, shipments, and sales transactions across all locations.        </p>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <ReportCard
          title="Today's Shipments"
          :value="loadingStats ? '-' : todaysShipments"
          subtitle="Total outgoing shipments completed today."
          :icon="ShippingIcon"
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <ReportCard
          title="Outstanding Sales Orders"
          :value="loadingStats ? '-' : outstandingSalesOrders"
          subtitle="Orders pending picking, packing, or dispatch."
          :icon="OrderIcon"
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
        <ReportCard
          title="Outstanding Deliveries"
          :value="loadingStats ? '-' : outstandingDeliveries"
          subtitle="DOs not yet delivered or confirmed by customer."
          :icon="BoxIcon"
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
        <ReportCard
          title="Avg Fulfillment Time"
          :value="loadingStats ? '-' : `${averageFulfillmentTime} days`"
          subtitle="Avg duration from order creation → shipment completed."
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
import ShippingIcon from "@/icons/ShippingIcon.vue";
import OrderIcon from "@/icons/OrderIcon.vue";
import BarChartIcon from "@/icons/BarChartIcon.vue";
import { authenticatedFetch } from "@/utils/authenticatedFetch";

// Stats data
const todaysShipments = ref(0);
const outstandingSalesOrders = ref(0);
const outstandingDeliveries = ref(0);
const averageFulfillmentTime = ref(0);
const loadingStats = ref(true);

// Fetch statistics from API
const fetchStats = async () => {
  loadingStats.value = true;
  
  try {
    // Fetch today's shipments count
    const today = new Date().toISOString().split('T')[0];
    const shipmentsResponse = await authenticatedFetch(`/api/shipping?shippingDate=${today}`);
    if (shipmentsResponse.ok) {
      const shipmentsData = await shipmentsResponse.json();
      todaysShipments.value = Array.isArray(shipmentsData) ? shipmentsData.length : 0;
    }

    // Fetch outstanding sales orders (status = 'PENDING' or 'APPROVED')
    const ordersResponse = await authenticatedFetch('/api/order?status=PENDING,APPROVED');
    if (ordersResponse.ok) {
      const ordersData = await ordersResponse.json();
      outstandingSalesOrders.value = Array.isArray(ordersData) ? ordersData.length : 0;
    }

    // Fetch outstanding deliveries (shipments with status 'In Transit', 'Out for Delivery', etc.)
    const deliveriesResponse = await authenticatedFetch('/api/shipping?state=In Transit,Out for Delivery,Preparing,Ready for Dispatch');
    if (deliveriesResponse.ok) {
      const deliveriesData = await deliveriesResponse.json();
      outstandingDeliveries.value = Array.isArray(deliveriesData) ? deliveriesData.length : 0;
    }

    // Fetch average fulfillment time (if API provides this metric)
    const fulfillmentResponse = await authenticatedFetch('/api/order/stats/average-fulfillment-time');
    if (fulfillmentResponse.ok) {
      const fulfillmentData = await fulfillmentResponse.json();
      averageFulfillmentTime.value = fulfillmentData.averageFulfillmentTime || 0;
    }
  } catch (error) {
    console.error('Error fetching outgoing report stats:', error);
  } finally {
    loadingStats.value = false;
  }
};

onMounted(() => {
  fetchStats();
});
</script>