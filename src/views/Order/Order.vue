<template>
  <div v-if="showToast" class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
    <div :class="[
      'rounded-lg px-6 py-4 shadow-lg flex items-center transform transition-all duration-300',
      toastType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    ]">
      <span v-if="toastType === 'success'" class="mr-2">✓</span>
      <span v-else class="mr-2">⚠</span>
      {{ toastMessage }}
    </div>
  </div>

  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <ToolListFilters @filter-change="handleFilterChange" />

    <div class="space-y-5 sm:space-y-6">
      <ComponentCard
        title="All Shippment List"
        desc="Overview of all Order List"
      >
        <div>
          <div class="border-b border-gray-200 dark:border-gray-700 -mx-6 px-6 -mt-14">
            <OrderListFilter @filter-change="handleFilterChange" />
            <div class="flex gap-1">
              <button
                @click="handleTabChange('table')"
                :class="[
                  'px-4 py-3 font-medium text-sm transition-all relative',
                  activeTab === 'table'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                ]"
              >
                List of Orders
                <div
                  v-if="activeTab === 'table'"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t"
                />
              </button>
            </div>
          </div>

          <div class="flex gap-2 my-6">
            <button
              @click="openAddOrderModal"
              class="px-4 py-2 btn btn-accent text-white text-sm font-medium rounded-lg transition-colors duration-200">
              Add New Order
            </button>
            <button
              @click="handleBulkDelete"
              class="px-4 py-2 btn btn-error text-white text-sm font-medium rounded-lg transition-colors duration-200">
              Delete
            </button>
            <button
              @click="handleImportOrder"
              class="px-4 py-2 btn btn-secondary text-white text-sm font-medium rounded-lg transition-colors duration-200">
              Import Order
            </button>
          </div>

          <component
            :is="currentComponent"
            v-if="currentComponent"
            ref="orderTableRef"
            :filters="activeFilters"
            @delete-order="handleDeleteOrder"
            @edit-order="handleEditOrder"
          />
        </div>
      </ComponentCard>
    </div>

    <AddNewOrder
      ref="addOrderModalRef"
      @order-created="handleOrderCreated"
    />

    <EditOrder
      ref="editOrderModalRef"
      @order-updated="handleOrderUpdated"
    />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import OrderTable from "./component/OrderTable.vue";
import AddNewOrder from "./component/AddNewOrder.vue";
import EditOrder from "./component/EditOrder.vue";
import OrderListFilter from "./component/OrderListFilter.vue";


// Interface definitions
interface Order {
  id?: number;
  orderCode?: string;
  orderName: string;
}

interface Result {
  success: boolean;
  error?: string;
  data?: {
    orderName?: string;
    count?: number;
    deletedCount?: number;
  };
}

interface Filters {
  [key: string]: string | number | boolean | undefined;
}

const currentPageTitle = ref("Order Management");
const activeFilters = ref<Filters>({});
const addOrderModalRef = ref<InstanceType<typeof AddNewOrder> | null>(null);
const editOrderModalRef = ref<InstanceType<typeof EditOrder> | null>(null);
const orderTableRef = ref<InstanceType<typeof OrderTable> | null>(null);
const activeTab = ref('table');

// Toast state
const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref<'success' | 'error'>('success');

// Function to show toast
const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = message;
  toastType.value = type;
  showToast.value = true;

  // Hide toast after 2 seconds
  setTimeout(() => {
    showToast.value = false;
  }, 2000);
};

// Handle order creation response
const handleOrderCreated = async (result: Result) => {
  if (result.success) {
    showToastMessage('Order has been successfully added', 'success');
    // Refresh the order list
    if (orderTableRef.value) {
      await orderTableRef.value.refreshData();
    }
  } else {
    showToastMessage(result.error || 'Failed to create order', 'error');
  }
};

// Handle order deletion response (No toast here - SweetAlert handles it)
const handleDeleteOrder = async (result: Result) => {
  // SweetAlert already shows the success/error message
  // Just refresh if needed (already done in the table component)
  // This handler can be used for additional logic if needed
  console.log('Delete result:', result);
};

// Define the single tab with its component
const orderTabs = [
  {
    id: 'table',
    label: 'List of Orders',
    component: OrderTable
  },
];

const currentComponent = computed(() => {
  return orderTabs.find(tab => tab.id === activeTab.value)?.component;
});

const handleFilterChange = (filters: Filters) => {
  activeFilters.value = filters;
  console.log('Filters applied:', filters);
};

const handleTabChange = (tabId: string) => {
  activeTab.value = tabId;
};

const openAddOrderModal = () => {
  if (addOrderModalRef.value) {
    addOrderModalRef.value.openModal();
  }
};

// Handle bulk delete
const handleBulkDelete = async () => {
  if (!orderTableRef.value) {
    console.error('Order table ref not available');
    return;
  }

  // Check if there are selected items
  const selectedItems = orderTableRef.value.selectedItems || [];

  if (selectedItems.length === 0) {
    // SweetAlert will show the "No Selection" message from bulkDelete function
    await orderTableRef.value.bulkDelete();
    return;
  }

  // Call the bulkDelete method exposed by the OrderTable component
  const result = await orderTableRef.value.bulkDelete();

  // SweetAlert already handles all notifications in the table component
  // No need for additional toast here
  console.log('Bulk delete result:', result);
};

const handleImportOrder = () => {
  console.log('Import Order clicked - implementation needed');
  showToastMessage('Order import feature is not yet implemented', 'error');
};

// Handle opening the edit modal
const handleEditOrder = (order: Order) => {
  if (editOrderModalRef.value) {
    editOrderModalRef.value.openModal(order);
  }
};

// Handle order update response
const handleOrderUpdated = async (result: Result) => {
  if (result.success) {
    showToastMessage('Order has been successfully updated', 'success');
    // Refresh the order list
    if (orderTableRef.value) {
      await orderTableRef.value.refreshData();
    }
  } else {
    showToastMessage(result.error || 'Failed to update order', 'error');
  }
};
</script>
