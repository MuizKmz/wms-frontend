<template>
  <!-- Toast Notification -->
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
        title="All Category List"
        desc="Overview of all Category List"
      >
        <!-- Tab Switcher with action buttons -->
        <div>
          <!-- Tab Navigation -->
          <div class="border-b border-gray-200 dark:border-gray-700 -mx-6 px-6 -mt-14">
            <CategoryListFilters @filter-change="handleFilterChange" />
            <div class="flex gap-1">
              <button
                @click="handleTabChange('table')"
                :class="[
                  'px-4 py-3 font-medium text-sm transition-all relative',
                  activeTab === 'table'
                    ? 'text-brand-500 dark:text-brand-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                ]"
              >
                List of Categories
                <div
                  v-if="activeTab === 'table'"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 dark:bg-brand-400 rounded-t"
                />
              </button>
            </div>
          </div>

          <!-- Edit Category Modal -->
          <EditCategory
            v-if="canUpdate('Category')"
            ref="editCategoryModalRef"
            @category-updated="handleCategoryUpdated"
          />

          <!-- Action Buttons below tabs -->
          <div v-if="activeTab === 'table'" class="flex gap-2 my-6">
            <button
              v-if="canCreate('Category')"
              @click="openAddCategoryModal"
              class="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors duration-200">
              Add New Category
            </button>
            <button
              v-if="canDelete('Category')"
              @click="handleBulkDelete"
              class="px-4 py-2 btn btn-error text-white text-sm font-medium rounded-lg transition-colors duration-200">
              Delete
            </button>
          </div>

          <!-- Tab Content -->
          <component
            :is="currentComponent"
            v-if="currentComponent"
            ref="categoryTableRef"
            :filters="activeFilters"
            @delete-category="handleDeleteCategory"
            @edit-category="handleEditCategory"
          />
        </div>
      </ComponentCard>
    </div>

    <!-- Add New Category Modal -->
    <AddNewCategory
      v-if="canCreate('Category')"
      ref="addCategoryModalRef"
      @category-created="handleCategoryCreated"
    />

    <!-- Edit Category Modal -->
    <EditCategory
      v-if="canUpdate('Category')"
      ref="editCategoryModalRef"
      @category-updated="handleCategoryUpdated"
    />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuth } from "@/composables/useAuth";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";

// Get permission checking functions
const { canCreate, canUpdate, canDelete } = useAuth();
import CategoryTable from "./component/CategoryTable.vue";
import CategoryListOverview from "./component/CategoryListOverview.vue";
import AddNewCategory from "./component/AddNewCategory.vue";
import EditCategory from "./component/EditCategory.vue";
import CategoryListFilters from "./component/CategoryListFilters.vue";

interface Category {
  id?: number;
  categoryCode?: string;
  categoryName: string;
}

interface Result {
  success: boolean;
  error?: string;
  data?: {
    categoryName: string;
  };
}

interface Filters {
  [key: string]: string | number | boolean | undefined;
}

const currentPageTitle = ref("Category");
const activeFilters = ref<Filters>({});
const addCategoryModalRef = ref<InstanceType<typeof AddNewCategory> | null>(null);
const editCategoryModalRef = ref<InstanceType<typeof EditCategory> | null>(null);
const categoryTableRef = ref<InstanceType<typeof CategoryTable> | null>(null);
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

// Handle category creation response
const handleCategoryCreated = async (result: Result) => {
  if (result.success) {
    showToastMessage('Category has been successfully added', 'success');
    // Refresh the category list if needed
    if (categoryTableRef.value) {
      await categoryTableRef.value.refreshData();
    }
  } else {
    showToastMessage(result.error || 'Failed to create category', 'error');
  }
};

// Handle category deletion response
const handleDeleteCategory = async (result: Result) => {
  if (result.success && categoryTableRef.value) {
    await categoryTableRef.value.refreshData();
  }
};

// Define tabs with components
const categoryTabs = [
  {
    id: 'table',
    label: 'Category Table',
    component: CategoryTable
  },
  {
    id: 'overview',
    label: 'Category List Overview',
    component: CategoryListOverview
  }
];

const currentComponent = computed(() => {
  return categoryTabs.find(tab => tab.id === activeTab.value)?.component;
});

const handleFilterChange = (filters: Filters) => {
  activeFilters.value = filters;
  console.log('Filters applied:', filters);
};

const handleTabChange = (tabId: string) => {
  activeTab.value = tabId;
};

const openAddCategoryModal = () => {
  if (addCategoryModalRef.value) {
    addCategoryModalRef.value.openModal();
  }
};

const handleBulkDelete = async () => {
  if (!categoryTableRef.value || !categoryTableRef.value.bulkDelete) {
    return;
  }
  await categoryTableRef.value.bulkDelete();
};

// Handle edit category action
const handleEditCategory = (category: any) => {
  if (editCategoryModalRef.value) {
    editCategoryModalRef.value.openModal(category);
  }
};

// Handle category update response
const handleCategoryUpdated = async (result: Result) => {
  if (result.success) {
    showToastMessage('Category has been successfully updated', 'success');
    if (categoryTableRef.value) {
      await categoryTableRef.value.refreshData();
    }
  } else {
    showToastMessage(result.error || 'Failed to update category', 'error');
  }
};
</script>
