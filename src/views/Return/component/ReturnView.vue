<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" @click.self="closeModal">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Return Details</h2>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ returnData.returnNo }}</p>
            </div>
            <button @click="closeModal" class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto p-6">
            <div class="space-y-6">
              <!-- Return Information -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Return Information</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Return No</label>
                    <p class="text-gray-900 dark:text-white font-medium">{{ returnData.returnNo }}</p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Return Type</label>
                    <span :class="getReturnTypeClass(returnData.returnType)" class="inline-block px-3 py-1 text-sm font-medium rounded-full">
                      {{ returnData.returnType }}
                    </span>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Reference No</label>
                    <p class="text-gray-900 dark:text-white">{{ returnData.referenceNo }}</p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Return Date</label>
                    <p class="text-gray-900 dark:text-white">{{ formatDate(returnData.returnDate) }}</p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">From</label>
                    <p class="text-gray-900 dark:text-white">{{ returnData.from }}</p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">To</label>
                    <p class="text-gray-900 dark:text-white">{{ returnData.to }}</p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">SKU Quantity</label>
                    <p class="text-gray-900 dark:text-white font-medium">{{ returnData.skuQuantity }}</p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Quantity</label>
                    <p class="text-gray-900 dark:text-white font-medium">{{ returnData.totalQuantity }}</p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Created By</label>
                    <p class="text-gray-900 dark:text-white">{{ returnData.createdBy }}</p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Last Updated</label>
                    <p class="text-gray-900 dark:text-white">{{ formatDate(returnData.lastUpdated || '') }}</p>
                  </div>
                </div>
              </div>

              <!-- Remarks -->
              <div v-if="returnData.remarks">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Remarks</h3>
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p class="text-gray-900 dark:text-white whitespace-pre-line">{{ returnData.remarks }}</p>
                </div>
              </div>

              <!-- Return Items Table -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Return Items</h3>
                <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div class="overflow-x-auto">
                    <table class="w-full">
                      <thead class="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">No</th>
                          <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">Product</th>
                          <th class="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">Quantity</th>
                          <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">Reason of return</th>
                          <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">EPC for Return</th>
                        </tr>
                      </thead>
                      <tbody class="bg-white dark:bg-gray-800">
                        <template v-if="returnData.items && returnData.items.length > 0">
                          <template v-for="(item, index) in returnData.items" :key="index">
                            <tr v-for="(reason, reasonIndex) in item.reasons" :key="`${index}-${reasonIndex}`" class="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                              <td v-if="reasonIndex === 0" :rowspan="item.reasons.length" class="px-4 py-3 text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 align-top">
                                {{ index + 1 }}
                              </td>
                              <td v-if="reasonIndex === 0" :rowspan="item.reasons.length" class="px-4 py-3 text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 align-top">
                                <span class="text-blue-600 dark:text-blue-400 underline cursor-pointer hover:text-blue-700 dark:hover:text-blue-300">
                                  {{ item.product }}
                                </span>
                              </td>
                              <td class="px-4 py-3 text-sm text-center text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                                {{ reason.quantity }}
                              </td>
                              <td class="px-4 py-3 text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                                {{ reason.reason }}
                              </td>
                              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                <div class="space-y-1">
                                  <div v-for="epc in reason.epcs" :key="epc" class="font-mono text-xs">
                                    {{ epc }}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </template>
                        </template>
                        <tr v-else>
                          <td colspan="5" class="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                            No return items found
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              @click="closeModal"
              type="button"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

interface ReturnReason {
  quantity: number
  reason: string
  epcs: string[]
}

interface ReturnItem {
  product: string
  reasons: ReturnReason[]
}

interface ReturnData {
  id?: number
  returnNo?: string
  returnType: string
  referenceNo: string
  returnDate: string
  from: string
  to: string
  skuQuantity: number
  totalQuantity: number
  createdBy?: string
  lastUpdated?: string
  remarks?: string
  items?: ReturnItem[]
}

const isOpen = ref(false)

const returnData = reactive<ReturnData>({
  returnType: '',
  referenceNo: '',
  returnDate: '',
  from: '',
  to: '',
  skuQuantity: 0,
  totalQuantity: 0,
  items: []
})

const openModal = (data: ReturnData) => {
  Object.assign(returnData, data)
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getReturnTypeClass = (type: string) => {
  const classes = {
    'Customer': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Supplier': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'Internal': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'Failed Delivery': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
  }
  return classes[type as keyof typeof classes] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

defineExpose({ openModal, closeModal })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>