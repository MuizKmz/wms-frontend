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
        title="All Product List"
        desc="Overview of all Product List"
      >
        <div>
          <div class="border-b border-gray-200 dark:border-gray-700 -mx-6 px-6 -mt-14">
            <ProductListFilters @filter-change="handleFilterChange" />
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
                List of Products
                <div
                  v-if="activeTab === 'table'"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t"
                />
              </button>
            </div>
          </div>

          <div class="flex gap-2 my-6">
            <button
              @click="openAddProductModal"
              class="px-4 py-2 btn btn-accent text-white text-sm font-medium rounded-lg transition-colors duration-200">
              Add New Product
            </button>
            <button
              @click="handleBulkDelete"
              class="px-4 py-2 btn btn-error text-white text-sm font-medium rounded-lg transition-colors duration-200">
              Delete
            </button>
            <button
              @click="handleImportProduct"
              class="px-4 py-2 btn btn-secondary text-white text-sm font-medium rounded-lg transition-colors duration-200">
              Import Product
            </button>
          </div>

          <component
            :is="currentComponent"
            v-if="currentComponent"
            ref="productTableRef"
            :filters="activeFilters"
            @delete-product="handleDeleteProduct"
            @edit-product="handleEditProduct"
          />
        </div>
      </ComponentCard>
    </div>

    <AddNewProduct
      ref="addProductModalRef"
      @product-created="handleProductCreated"
    />

    <EditProduct
      ref="editProductModalRef"
      @product-updated="handleProductUpdated"
    />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";
import ProductTable from "./component/ProductTable.vue";
import AddNewProduct from "./component/AddNewProduct.vue";
import EditProduct from "./component/EditProduct.vue";
import ProductListFilters from "./component/ProductListFilters.vue";

// Interface definitions
interface Product {
  id?: number;
  productCode?: string;
  productName: string;
}

interface Result {
  success: boolean;
  error?: string;
  data?: {
    productName?: string;
    count?: number;
    deletedCount?: number;
  };
}

interface Filters {
  [key: string]: string | number | boolean | undefined;
}

const currentPageTitle = ref("Product Management");
const activeFilters = ref<Filters>({});
const addProductModalRef = ref<InstanceType<typeof AddNewProduct> | null>(null);
const editProductModalRef = ref<InstanceType<typeof EditProduct> | null>(null);
const productTableRef = ref<InstanceType<typeof ProductTable> | null>(null);
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

// Handle product creation response
const handleProductCreated = async (result: Result) => {
  if (result.success) {
    showToastMessage('Product has been successfully added', 'success');
    // Refresh the product list
    if (productTableRef.value) {
      await productTableRef.value.refreshData();
    }
  } else {
    showToastMessage(result.error || 'Failed to create product', 'error');
  }
};

// Handle product deletion response (No toast here - SweetAlert handles it)
const handleDeleteProduct = async (result: Result) => {
  // SweetAlert already shows the success/error message
  // Just refresh if needed (already done in the table component)
  // This handler can be used for additional logic if needed
  console.log('Delete result:', result);
};

// Define the single tab with its component
const productTabs = [
  {
    id: 'table',
    label: 'List of Products',
    component: ProductTable
  },
];

const currentComponent = computed(() => {
  return productTabs.find(tab => tab.id === activeTab.value)?.component;
});

const handleFilterChange = (filters: Filters) => {
  activeFilters.value = filters;
  console.log('Filters applied:', filters);
};

const handleTabChange = (tabId: string) => {
  activeTab.value = tabId;
};

const openAddProductModal = () => {
  if (addProductModalRef.value) {
    addProductModalRef.value.openModal();
  }
};

// Handle bulk delete
const handleBulkDelete = async () => {
  if (!productTableRef.value) {
    console.error('Product table ref not available');
    return;
  }

  // Check if there are selected items
  const selectedItems = productTableRef.value.selectedItems || [];

  if (selectedItems.length === 0) {
    // SweetAlert will show the "No Selection" message from bulkDelete function
    await productTableRef.value.bulkDelete();
    return;
  }

  // Call the bulkDelete method exposed by the ProductTable component
  const result = await productTableRef.value.bulkDelete();

  // SweetAlert already handles all notifications in the table component
  // No need for additional toast here
  console.log('Bulk delete result:', result);
};

const handleImportProduct = () => {
  console.log('Import Product clicked - implementation needed');
  showToastMessage('Product import feature is not yet implemented', 'error');
};

// Handle opening the edit modal
const handleEditProduct = (product: Product) => {
  if (editProductModalRef.value) {
    editProductModalRef.value.openModal(product);
  }
};

// Handle product update response
const handleProductUpdated = async (result: Result) => {
  if (result.success) {
    showToastMessage('Product has been successfully updated', 'success');
    // Refresh the product list
    if (productTableRef.value) {
      await productTableRef.value.refreshData();
    }
  } else {
    showToastMessage(result.error || 'Failed to update product', 'error');
  }
};
</script>
