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

    <div class="space-y-5 sm:space-y-6">
      <ComponentCard 
        title="All Customer List" 
        desc="Overview of all Customer List"
      >
        <div>
          <div class="border-b border-gray-200 dark:border-gray-700 -mx-6 px-6 -mt-14">
            <CustomerListFilters @filter-change="handleFilterChange" />
            <div class="flex gap-1">
              <button
                @click="handleTabChange('overview')"
                :class="[
                  'px-4 py-3 font-medium text-sm transition-all relative',
                  activeTab === 'overview'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                ]"
              >
                Customer List Overview
                <div
                  v-if="activeTab === 'overview'"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t"
                />
              </button>
              <button
                @click="handleTabChange('orders')"
                :class="[
                  'px-4 py-3 font-medium text-sm transition-all relative',
                  activeTab === 'orders'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                ]"
              >
                Order List
                <div
                  v-if="activeTab === 'orders'"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t"
                />
              </button>
            </div>
          </div>

          <div  v-if="activeTab === 'overview'" class="flex gap-2 my-6">
            <button @click="openAddCustomerModal"
              class="px-4 py-2 btn btn-accent text-white text-sm font-medium rounded-lg transition-colors duration-200">
              Add New Customer
            </button>
            <button @click="handleBulkDelete"
              class="px-4 py-2 btn btn-error text-white text-sm font-medium rounded-lg transition-colors duration-200">
              Delete
            </button>
            <button @click="handleImportCustomer"
              class="px-4 py-2 btn btn-secondary text-white text-sm font-medium rounded-lg transition-colors duration-200">
              Import Customer
            </button>
          </div>

          <component 
            :is="currentComponent" 
            v-if="currentComponent"
            ref="customerTableRef"
            :filters="activeFilters"
            @edit-customer="openEditCustomerModal"
            @view-customer="handleViewCustomer" 
            @delete-customer="handleDeleteCustomer" 
          />
        </div>
      </ComponentCard>
    </div>

    <AddNewCustomer ref="addCustomerModalRef" @customer-created="handleCustomerCreated" />

    <EditCustomer ref="editCustomerModalRef" @customer-updated="handleCustomerUpdated" />
    
    <ImportCustomer 
        ref="importCustomerModalRef" 
        @file-uploaded="handleImportCustomerUploaded" 
    />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import CustomerListOverview from "./component/CustomerListOverview.vue";
import OrderList from "./component/OrderList.vue";
import AddNewCustomer from "./component/AddNewCustomer.vue";
import EditCustomer from "./component/EditCustomer.vue";
import CustomerListFilters from "./component/CustomerListFilters.vue";
import ImportCustomer from "./component/ImportCustomer.vue"; 

// Interface definitions
interface Customer {
  id?: number;
  customerCode?: string;
  customerName: string;
}

interface Result {
  success: boolean;
  error?: string;
  data?: {
    customerName?: string;
    count?: number; // for bulk delete
    deletedCount?: number; // for bulk delete
  };
}

interface Filters {
  [key: string]: string | number | boolean | undefined;
}

// State and Refs
const currentPageTitle = ref("Customer Management");
const activeFilters = ref<Filters>({});
const addCustomerModalRef = ref<InstanceType<typeof AddNewCustomer> | null>(null);
const editCustomerModalRef = ref<InstanceType<typeof EditCustomer> | null>(null);
const customerTableRef = ref<InstanceType<typeof CustomerListOverview | typeof OrderList> | null>(null);
const activeTab = ref('overview'); 

// Ref for the ImportCustomer modal
const importCustomerModalRef = ref<InstanceType<typeof ImportCustomer> | null>(null);

// --- Tab Logic ---
// Define the tabs with their components
const customerTabs = [
  {
    id: 'overview',
    label: 'Customer List Overview',
    component: CustomerListOverview
  },
  {
    id: 'orders',
    label: 'Order List',
    component: OrderList
  }
];

// Computed property to dynamically select the component
const currentComponent = computed(() => {
  return customerTabs.find(tab => tab.id === activeTab.value)?.component;
});

// Handler for tab switch
const handleTabChange = (tabId: string) => {
  activeTab.value = tabId;
};
// --- End Tab Logic ---

// Toast state
const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref<'success' | 'error'>('success');

// Function to show toast
const showToastMessage = (message: string, type: 'success' | 'error' = 'success', duration: number = 2000) => {
  toastMessage.value = message;
  toastType.value = type;
  showToast.value = true;

  // Hide toast after a duration
  setTimeout(() => {
    showToast.value = false;
  }, duration);
};

// Handle customer creation response
const handleCustomerCreated = async (result: Result) => {
  if (result.success) {
    showToastMessage('Customer has been successfully added', 'success');
    if (customerTableRef.value && 'refreshData' in customerTableRef.value) {
      await (customerTableRef.value as any).refreshData(); 
    }
  } else {
    showToastMessage(result.error || 'Failed to create customer', 'error');
  }
};

// Handle customer update response
const handleCustomerUpdated = async (result: Result) => {
  if (result.success) {
    showToastMessage('Customer has been successfully updated', 'success');
    if (customerTableRef.value && 'refreshData' in customerTableRef.value) {
      await (customerTableRef.value as any).refreshData();
    }
  } else {
    showToastMessage(result.error || 'Failed to update customer', 'error');
  }
};

const handleFilterChange = (filters: Filters) => {
  activeFilters.value = filters;
  console.log('Filters applied:', filters);
};

const openAddCustomerModal = () => {
  if (addCustomerModalRef.value) {
    addCustomerModalRef.value.openModal();
  }
};

const openEditCustomerModal = (customer: Customer) => {
  if (editCustomerModalRef.value) {
    (editCustomerModalRef.value as any).openModal(customer);
  }
};

const handleViewCustomer = (customer: Customer) => {
  console.log('View customer:', customer);
  showToastMessage(`Viewing details for ${customer.customerName}`, 'success');
  // Implement view modal or navigate to detail page
};

const handleDeleteCustomer = async (result: Result) => {
  if (result.success) {
    showToastMessage('Customer deleted successfully', 'success');
    if (customerTableRef.value && 'refreshData' in customerTableRef.value) {
      await (customerTableRef.value as any).refreshData();
    }
    return
  }
  
  // Handling for bulk/partial delete response structure
  if (result.data && (result.data.count || result.data.deletedCount)) {
    const deletedCount = result.data.count || result.data.deletedCount;
    showToastMessage(`${deletedCount} customer(s) deleted.`, 'success');
    if (customerTableRef.value && 'refreshData' in customerTableRef.value) {
      await (customerTableRef.value as any).refreshData();
    }
    return
  }

  showToastMessage(result.error || 'Failed to delete customer', 'error');
  console.error(result.error || 'Failed to delete customer');
};

const handleBulkDelete = async () => {
  // if (!customerTableRef.value || !('bulkDelete' in customerTableRef.value)) {
  //   showToastMessage('Bulk delete feature not available or not implemented on table.', 'error');
  //   return;
  // }

  const result: Result = await (customerTableRef.value as any).bulkDelete();

  if (result.success) {
    handleDeleteCustomer(result);
  }
};

/**
 * Handler for 'Import Customer' button click
 * Opens the ImportCustomer modal
 */
const handleImportCustomer = () => {
    if (importCustomerModalRef.value) {
        importCustomerModalRef.value.openModal();
    }
};

/**
 * Handler for the @file-uploaded event from the ImportCustomer modal
 */
const handleImportCustomerUploaded = (event: { success: boolean, data?: any, error?: string }) => {
    if (event.success) {
        showToastMessage('Customers imported successfully!', 'success');
        // Refresh the customer list table data
        if (customerTableRef.value && 'refreshData' in customerTableRef.value) {
            (customerTableRef.value as any).refreshData(); 
        }
    } else {
        showToastMessage(event.error || 'Customer import failed. Please check the file format.', 'error', 3500);
    }
}
</script>