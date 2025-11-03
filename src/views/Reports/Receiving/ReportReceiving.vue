<template>
  <div
    v-if="showToast"
    class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
  >
    <div
      :class="[
        'rounded-lg px-6 py-4 shadow-lg flex items-center transform transition-all duration-300',
        toastType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white',
      ]"
    >
      <span v-if="toastType === 'success'" class="mr-2">✓</span>
      <span v-else class="mr-2">⚠</span>
      {{ toastMessage }}
    </div>
  </div>

  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <ToolListFilters @filter-change="handleFilterChange" />

    <div class="space-y-5 sm:space-y-6">
      <ComponentCard title="All Receiving List" desc="Overview of all Receiving List">
        <div>
          <div class="border-b border-gray-200 dark:border-gray-700 -mx-6 px-6 -mt-14">
            <ReportReceivingFilters @filter-change="handleFilterChange" />
            <div class="flex gap-1">
              <button
                @click="handleTabChange('table')"
                :class="[
                  'px-4 py-3 font-medium text-sm transition-all relative',
                  activeTab === 'table'
                    ? 'text-brand-500 dark:text-brand-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200',
                ]"
              >
                List of Report Receivings
                <div
                  v-if="activeTab === 'table'"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 dark:bg-brand-400 rounded-t"
                />
              </button>
            </div>
          </div>

          <div class="flex gap-2 my-6">
            <button
              @click="handleExportTable"
              class="px-4 py-2 btn btn-secondary text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Export Table
            </button>
            <button
              @click="handleExportAll"
              class="px-4 py-2 btn btn-secondary text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Export All
            </button>
          </div>

          <component
            :is="currentComponent"
            v-if="currentComponent"
            ref="reportreceivingTableRef"
            :filters="activeFilters"
          />
        </div>
      </ComponentCard>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import ComponentCard from '@/components/common/ComponentCard.vue'
import ReportReceivingTable from './component/ReportReceivingTable.vue'

// Get permission checking functions
const { canCreate, canUpdate, canDelete } = useAuth()
import ReportReceivingView from './component/ReportReceivingView.vue'
import ReportReceivingFilters from './component/ReportReceivingFilters.vue'

// Interface definitions
interface Receiving {
  id?: number
  receivingCode?: string
  receivingDate: string
}

interface Result {
  success: boolean
  error?: string
  data?: {
    receivingCode?: string
    count?: number
    deletedCount?: number
  }
}

interface Filters {
  [key: string]: string | number | boolean | undefined
}

const currentPageTitle = ref('Receiving Management')
const activeFilters = ref<Filters>({})
const reportreceivingViewModalRef = ref<InstanceType<typeof ReportReceivingView> | null>(null)
const reportreceivingTableRef = ref<InstanceType<typeof ReportReceivingTable> | null>(null)
const activeTab = ref('table')

// Toast state
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

// Function to show toast
const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true

  // Hide toast after 2 seconds
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

// Define the single tab with its component
const ReportReceivingTabs = [
  {
    id: 'table',
    label: 'List of Report Receiving',
    component: ReportReceivingTable,
  },
]

const currentComponent = computed(() => {
  return ReportReceivingTabs.find((tab) => tab.id === activeTab.value)?.component
})

const handleFilterChange = (filters: Filters) => {
  activeFilters.value = filters
}
const handleExportTable = () => {
  showToastMessage('Export Table clicked', 'success')
}

const handleExportAll = () => {
  showToastMessage('Export All clicked', 'success')
}
</script>
