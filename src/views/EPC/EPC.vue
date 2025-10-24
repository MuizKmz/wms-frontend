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
        title="All EPC List"
        desc="Overview of all EPC Projects"
      >
        <div>
          <div class="border-b border-gray-200 dark:border-gray-700 -mx-6 px-6 -mt-14">
            <EPCListFilters @filter-change="handleFilterChange" />
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
                List of EPCs
                <div
                  v-if="activeTab === 'table'"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 dark:bg-brand-400 rounded-t"
                />
              </button>
            </div>
          </div>

          <div class="flex gap-2 my-6">
            <button
              @click="openGenerateEPCModal" 
              class="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors duration-200">
              Generate EPC
            </button>
            <button
              @click="handleBulkDelete"
              class="px-4 py-2 btn btn-error text-white text-sm font-medium rounded-lg transition-colors duration-200">
              Delete
            </button>
            <button
              @click="handleExportEPC" 
              class="px-4 py-2 btn btn-secondary text-white text-sm font-medium rounded-lg transition-colors duration-200">
              Export EPC List
            </button>
          </div>

          <component
            :is="currentComponent"
            v-if="currentComponent"
            ref="epcTableRef"
            :filters="activeFilters"
            @view-epc="handleViewEPC"
            @delete-epc="handleDeleteEPC"
            @edit-epc="handleEditEPC"
          />
        </div>
      </ComponentCard>
    </div>

    <ViewEPC
      ref="viewEPCModalRef"
      :show="showViewEPCModal"
      :initial-epc-code="selectedEpcCode"
      @close="closeViewEPCModal"
    />

    <GenerateEPC
      ref="generateEPCModalRef"
      @epc-generated="handleEPCGenerated"
    />

  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import ComponentCard from "@/components/common/ComponentCard.vue";

// Component Imports (Ensure these paths are correct)
import EPCTable from "./component/EPCTable.vue";
import EPCListFilters from "./component/EPCListFilters.vue";
import GenerateEPC from "./component/GenerateEPC.vue";
import ViewEPC from "./component/ViewEPC.vue";

// Interface definitions (Kept for type safety)
interface EPC {
  id?: number;
  epcCode?: string;
  epcName?: string;
}

interface Result {
  success: boolean;
  error?: string;
  data?: {
    epcName?: string;
    count?: number;
    deletedCount?: number;
  };
}

interface Filters {
  [key: string]: string | number | boolean | undefined;
}

// State variables
const currentPageTitle = ref("EPC Management");
const activeFilters = ref<Filters>({});
const generateEPCModalRef = ref<InstanceType<typeof GenerateEPC> | null>(null); 
const viewEPCModalRef = ref<InstanceType<typeof ViewEPC> | null>(null);
const epcTableRef = ref<InstanceType<typeof EPCTable> | null>(null);
const activeTab = ref('table');

// State for ViewEPC modal
const showViewEPCModal = ref(false);
const selectedEpcCode = ref<string | null>(null);

// Toast state
const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref<'success' | 'error'>('success');

// Function to show toast
const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = message;
  toastType.value = type;
  showToast.value = true;

  setTimeout(() => {
    showToast.value = false;
  }, 2000);
};

// --- EPC Generation Logic ---
const openGenerateEPCModal = () => {
  if (generateEPCModalRef.value) {
    // Assuming openModal is defined and exposed in GenerateEPC.vue
    (generateEPCModalRef.value as any).openModal(); 
  } else {
    showToastMessage('Generate EPC modal component not loaded.', 'error');
  }
};

const handleEPCGenerated = async (result: Result) => {
  if (result.success) {
    showToastMessage('EPC project(s) successfully generated!', 'success');
    if (epcTableRef.value) {
      (epcTableRef.value as any).refreshData(); 
    }
  } else {
    showToastMessage(result.error || 'Failed to generate EPC project(s)', 'error');
  }
};

// New Way (Using defineExpose methods)
const handleViewEPC = (epc: EPC) => {
  const epcCode = epc.epcCode || null;
  console.log('Opening ViewEPC modal for:', epcCode);
  
  if (viewEPCModalRef.value && epcCode) {
    // Call the exposed openModal method with the EPC code
    (viewEPCModalRef.value as any).openModal(epcCode);
  } else {
    // If you stick to the prop-based control:
    selectedEpcCode.value = epcCode;
    showViewEPCModal.value = true;
  }
};

// New Way (Prop-based close is still valid if you use the v-if control, 
// but the component now emits 'close' after the animation, so this is cleaner):
const closeViewEPCModal = () => {
  // If the component calls closeModal() internally, it emits 'close', 
  // which runs this function to reset the parent's state.
  showViewEPCModal.value = false;
  setTimeout(() => { 
      selectedEpcCode.value = null; 
  }, 300); 
};

// --- Core Table & Filter Logic ---

const handleDeleteEPC = async (result: Result) => {
  console.log('Single delete result:', result);
};

const epcTabs = [
  {
    id: 'table',
    label: 'List of EPC Projects',
    component: EPCTable
  },
];

const currentComponent = computed(() => {
  return epcTabs.find(tab => tab.id === activeTab.value)?.component;
});

const handleFilterChange = (filters: Filters) => {
  activeFilters.value = filters;
  console.log('Filters applied:', filters);
};

const handleTabChange = (tabId: string) => {
  activeTab.value = tabId;
};

// --- Action Button Handlers ---

const handleExportEPC = () => {
  console.log('Export EPC List clicked - implementation needed');
  showToastMessage('Export EPC List feature is not yet implemented', 'error');
};

const handleBulkDelete = async () => {
  if (!epcTableRef.value) {
    showToastMessage('Table component not loaded. Please try again.', 'error');
    return;
  }

  // Assuming bulkDelete is defined and exposed in EPCTable.vue
  const result = await (epcTableRef.value as any).bulkDelete();
  
  if (result.success) {
      showToastMessage(`${result.data?.deletedCount || 'Selected'} EPC(s) deleted.`, 'success');
  } else if (result.error !== 'Cancelled by user' && result.error !== 'No items selected') {
      showToastMessage(result.error || 'Bulk delete failed.', 'error');
  } else if (result.error === 'No items selected') {
      showToastMessage('Please select at least one EPC record to delete.', 'error');
  }
};

// Dummy handler for edit (Kept for EPCTable compatibility)
const handleEditEPC = (epc: EPC) => {
  console.log('Edit requested for EPC:', epc, ' - No action taken.'); 
};
</script>