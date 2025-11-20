<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="closeModal">
        <div class="absolute inset-0 bg-black/50"></div>

        <div ref="panelRef" class="relative z-10 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
            <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Receiving Details</h2>
              <button class="text-gray-400 hover:text-gray-600" @click="closeModal">✕</button>
            </div>

            <div class="p-6 space-y-4">
              <!-- PO Information Header -->
              <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">PO Number</p>
                    <p class="font-bold text-lg text-gray-900 dark:text-white">{{ getPONumber() }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Supplier</p>
                    <p class="font-medium text-gray-900 dark:text-white">{{ getSupplierName() }}</p>
                  </div>
                </div>
              </div>

              <!-- PO Group View - Multiple Receivings -->
              <template v-if="isPOGroup">
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <h3 class="text-md font-semibold text-gray-900 dark:text-white">Receiving Records ({{ receivingData.receivings.length }})</h3>
                  </div>

                  <!-- List each receiving record -->
                  <div v-for="(rec, idx) in receivingData.receivings" :key="rec.id" class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                    <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                      <h4 class="font-semibold text-gray-900 dark:text-white">{{ rec.receivingCode }}</h4>
                      <div class="flex items-center gap-2">
                        <span :class="getStatusClass(rec.status)" class="px-2 py-1 rounded text-xs font-medium">{{ rec.status || 'PENDING' }}</span>
                        <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(rec.receivingDate) }}</span>
                      </div>
                    </div>

                    <!-- Receiving Items Table -->
                    <div>
                      <p class="text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">Items</p>
                      <div class="overflow-x-auto">
                        <table class="min-w-full text-xs border border-gray-200 dark:border-gray-700 rounded">
                          <thead class="bg-gray-50 dark:bg-gray-900/30">
                            <tr class="text-left text-gray-500 dark:text-gray-400">
                              <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">Product</th>
                              <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">Expected</th>
                              <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">Received</th>
                              <th class="px-3 py-2 border-b border-gray-200 dark:border-gray-700">Unit</th>
                            </tr>
                          </thead>
                          <tbody>
                            <template v-if="rec.receivingItems && rec.receivingItems.length">
                              <tr v-for="item in rec.receivingItems" :key="item.id" class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td class="px-3 py-2 text-gray-900 dark:text-white font-medium">{{ item.product?.name || item.productName || '-' }}</td>
                                <td class="px-3 py-2 text-gray-600 dark:text-gray-400">{{ item.expectedQuantity ?? '-' }}</td>
                                <td class="px-3 py-2 font-semibold text-gray-900 dark:text-white">{{ item.quantity ?? '-' }}</td>
                                <td class="px-3 py-2 text-gray-600 dark:text-gray-400">{{ item.unit || 'pcs' }}</td>
                              </tr>
                            </template>
                            <tr v-else>
                              <td colspan="4" class="px-3 py-2 text-center text-gray-500 dark:text-gray-400">No items</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <!-- Additional Details -->
                    <div class="grid grid-cols-3 gap-3 pt-2">
                      <div>
                        <p class="text-xs text-gray-500 dark:text-gray-400">DO Number</p>
                        <p class="text-xs font-medium text-gray-900 dark:text-white">{{ rec.doNumber || '-' }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Received By</p>
                        <p class="text-xs font-medium text-gray-900 dark:text-white">{{ rec.receivedBy || '-' }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Warehouse</p>
                        <p class="text-xs font-medium text-gray-900 dark:text-white">{{ rec.warehouse?.name || '-' }}</p>
                      </div>
                    </div>

                    <div v-if="rec.remarks" class="pt-2 border-t border-gray-100 dark:border-gray-800">
                      <p class="text-xs text-gray-500 dark:text-gray-400">Remarks</p>
                      <p class="text-xs font-medium text-gray-900 dark:text-white">{{ rec.remarks }}</p>
                    </div>
                  </div>

                  <!-- Overall Summary for PO -->
                  <div class="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p class="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Overall Summary</p>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Total Expected</p>
                        <p class="font-bold text-xl text-gray-900 dark:text-white">{{ calculateOverallExpected() }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Total Received</p>
                        <p class="font-bold text-xl" :class="calculateOverallReceived() >= calculateOverallExpected() ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'">{{ calculateOverallReceived() }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Single Receiving View -->
              <template v-else>
                <!-- Receiving Items Table -->
                <div>
                  <p class="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Receiving Items</p>
                  <div class="overflow-x-auto">
                    <table class="min-w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg">
                      <thead class="bg-gray-50 dark:bg-gray-900/30">
                        <tr class="text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Product</th>
                          <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Expected Qty</th>
                          <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Received Qty</th>
                          <th class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        <template v-if="receivingData.receivingItems && receivingData.receivingItems.length">
                          <tr v-for="(item, idx) in receivingData.receivingItems" :key="item.id" class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td class="px-4 py-3 align-top text-gray-900 dark:text-white font-medium">{{ item.product?.name || item.productName || item.productId || '-' }}</td>
                            <td class="px-4 py-3 align-top text-gray-600 dark:text-gray-400">{{ item.expectedQuantity ?? '-' }}</td>
                            <td class="px-4 py-3 align-top font-semibold text-gray-900 dark:text-white">{{ item.quantity ?? '-' }}</td>
                            <td class="px-4 py-3 align-top text-gray-600 dark:text-gray-400">{{ item.unit || 'pcs' }}</td>
                          </tr>
                        </template>
                        <tr v-else>
                          <td colspan="4" class="px-4 py-4 text-center text-gray-500 dark:text-gray-400">No receiving items found</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Receiving Details -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Receiving Code</p>
                    <p class="font-medium text-gray-900 dark:text-white">{{ receivingData.receivingCode || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">DO Number</p>
                    <p class="font-mono text-sm text-gray-900 dark:text-white">{{ receivingData.doNumber || '-' }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Status</p>
                    <span :class="getStatusClass(receivingData.status)" class="inline-block px-2 py-1 rounded text-xs font-medium">{{ receivingData.status || 'PENDING' }}</span>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Date Received</p>
                    <p class="font-medium text-gray-900 dark:text-white">{{ formatDate(receivingData.receivingDate) }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Received By</p>
                    <p class="font-medium text-gray-900 dark:text-white">{{ receivingData.receivedBy || '-' }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Warehouse</p>
                    <p class="font-medium text-gray-900 dark:text-white">{{ receivingData.warehouse?.name || '-' }}</p>
                  </div>
                </div>

                <div v-if="receivingData.remarks">
                  <p class="text-xs text-gray-500 dark:text-gray-400">Remarks</p>
                  <p class="font-medium text-gray-900 dark:text-white">{{ receivingData.remarks }}</p>
                </div>
              </template>

              <!-- Summary Section at Bottom (for single receiving) -->
              <div v-if="!isPOGroup" class="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <p class="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Summary</p>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Total Expected Quantity</p>
                    <p class="font-bold text-xl text-gray-900 dark:text-white">{{ totalExpectedQuantity }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Total Received Quantity</p>
                    <p class="font-bold text-xl" :class="totalReceivedQuantity >= totalExpectedQuantity ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'">{{ totalReceivedQuantity }}</p>
                  </div>
                </div>
                <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600 dark:text-gray-400">Fulfillment Status:</span>
                    <span class="font-semibold" :class="totalReceivedQuantity >= totalExpectedQuantity ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'">
                      {{ totalReceivedQuantity >= totalExpectedQuantity ? 'Complete' : 'Partial' }}
                      ({{ totalExpectedQuantity > 0 ? Math.round((totalReceivedQuantity / totalExpectedQuantity) * 100) : 0 }}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
              <button class="btn btn-outline" @click="closeModal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const isOpen = ref(false)
const receivingData = ref<any>({})
const panelRef = ref<HTMLElement | null>(null)

const isPOGroup = computed(() => {
  return receivingData.value.isPOGroup && Array.isArray(receivingData.value.receivings)
})

const getPONumber = () => {
  if (isPOGroup.value) {
    return receivingData.value.order?.orderNo || '-'
  }
  return receivingData.value.order?.orderNo || '-'
}

const getSupplierName = () => {
  if (isPOGroup.value && receivingData.value.receivings?.length > 0) {
    return receivingData.value.receivings[0].supplier?.supplierName || '-'
  }
  return receivingData.value.supplier?.supplierName || '-'
}

const calculateOverallExpected = () => {
  if (!isPOGroup.value) return 0
  // Expected quantity is the same across all receivings (from PO), so take it from the first receiving only
  const firstReceiving = receivingData.value.receivings[0]
  if (!firstReceiving || !firstReceiving.receivingItems) return 0
  return firstReceiving.receivingItems.reduce((sum: number, item: any) => sum + (item.expectedQuantity || 0), 0)
}

const calculateOverallReceived = () => {
  if (!isPOGroup.value) return 0
  // Sum all received quantities across all receivings
  return receivingData.value.receivings.reduce((sum: number, rec: any) => {
    const recTotal = (rec.receivingItems || []).reduce((s: number, item: any) => s + (item.quantity || 0), 0)
    return sum + recTotal
  }, 0)
}

const totalExpectedQuantity = computed(() => {
  if (isPOGroup.value) return 0
  if (!receivingData.value.receivingItems || receivingData.value.receivingItems.length === 0) {
    return 0
  }
  return receivingData.value.receivingItems.reduce((sum: number, item: any) => {
    return sum + (item.expectedQuantity || 0)
  }, 0)
})

const totalReceivedQuantity = computed(() => {
  if (isPOGroup.value) return 0
  if (!receivingData.value.receivingItems || receivingData.value.receivingItems.length === 0) {
    return 0
  }
  return receivingData.value.receivingItems.reduce((sum: number, item: any) => {
    return sum + (item.quantity || 0)
  }, 0)
})

let _scrollY = 0
let _scrollbarWidth = 0
const getScrollbarWidth = () => window.innerWidth - document.documentElement.clientWidth

const lockScroll = () => {
  // prevent double lock
  if (document.body.dataset.modalLocked === 'true') return

  _scrollY = window.scrollY || window.pageYOffset || 0
  _scrollbarWidth = getScrollbarWidth()

  if (_scrollbarWidth > 0) {
    document.body.style.paddingRight = `${_scrollbarWidth}px`
  }

  document.body.style.position = 'fixed'
  document.body.style.top = `-${_scrollY}px`
  document.body.style.left = '0'
  document.body.style.right = '0'
  document.body.dataset.modalLocked = 'true'
}

const unlockScroll = () => {
  if (document.body.dataset.modalLocked !== 'true') return
  document.body.dataset.modalLocked = 'false'
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.left = ''
  document.body.style.right = ''
  document.body.style.paddingRight = ''

  // restore scroll
  requestAnimationFrame(() => {
    window.scrollTo(0, _scrollY || 0)
  })
}

const openModal = async (data: any) => {
  receivingData.value = data || {}
  isOpen.value = true
  lockScroll()
}

const closeModal = async () => {
  isOpen.value = false
  unlockScroll()
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  try {
    const d = new Date(dateString)
    return d.toLocaleDateString('en-GB')
  } catch {
    return dateString
  }
}

const getStatusClass = (status: string) => {
  const statusMap: Record<string, string> = {
    'PENDING': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    'IN_PROGRESS': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'COMPLETED': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'CLOSED': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
  return statusMap[status] || statusMap['PENDING']
}

defineExpose({ openModal, closeModal })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
