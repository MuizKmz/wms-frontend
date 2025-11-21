<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" @click.self="closeModal">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Return Details</h2>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ returnData.returnCode }}</p>
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
                    <p class="text-gray-900 dark:text-white font-medium">{{ returnData.returnCode }}</p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Return Type</label>
                    <span :class="getReturnTypeClass(displayReturnType)" class="inline-block px-3 py-1 text-sm font-medium rounded-full">
                      {{ displayReturnType }}
                    </span>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Reference No</label>
                    <p class="text-gray-900 dark:text-white">{{ displayReferenceNo }}</p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
                    <span class="inline-block px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      {{ returnData.status }}
                    </span>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">From</label>
                    <p class="text-gray-900 dark:text-white">{{ displayFrom }}</p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">To</label>
                    <p class="text-gray-900 dark:text-white">{{ displayTo }}</p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Items</label>
                    <p class="text-gray-900 dark:text-white font-medium">{{ skuQuantity }}</p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Quantity</label>
                    <p class="text-gray-900 dark:text-white font-medium">{{ totalQuantity }}</p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Requested By</label>
                    <p class="text-gray-900 dark:text-white">{{ returnData.requester?.fullName || returnData.requester?.username || '-' }}</p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Requested Date</label>
                    <p class="text-gray-900 dark:text-white">{{ formatDate(returnData.requestedDate) }}</p>
                  </div>
                </div>
              </div>

              <!-- Reason & Notes -->
              <div v-if="returnData.reason || returnData.notes">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Reason & Notes</h3>
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                  <div v-if="returnData.reason">
                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Reason:</p>
                    <p class="text-gray-900 dark:text-white">{{ returnData.reason }}</p>
                  </div>
                  <div v-if="returnData.notes">
                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Notes:</p>
                    <p class="text-gray-900 dark:text-white whitespace-pre-line">{{ returnData.notes }}</p>
                  </div>
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
                          <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">SKU Code</th>
                          <th class="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">Quantity</th>
                          <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">Condition</th>
                          <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">EPC Code</th>
                          <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">Notes</th>
                        </tr>
                      </thead>
                      <tbody class="bg-white dark:bg-gray-800">
                        <template v-if="returnData.returnItems && returnData.returnItems.length > 0">
                          <tr v-for="(item, index) in returnData.returnItems" :key="item.id" class="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                            <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              {{ index + 1 }}
                            </td>
                            <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              <span class="text-black-600 dark:text-blue-400 font-medium">
                                {{ item.product?.name || '-' }}
                              </span>
                            </td>
                            <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 font-mono">
                              {{ item.product?.skuCode || '-' }}
                            </td>
                            <td class="px-4 py-3 text-sm text-center text-gray-900 dark:text-white font-medium">
                              {{ item.quantity }}
                            </td>
                            <td class="px-4 py-3 text-sm">
                              <span :class="getConditionBadge(item.condition)" class="inline-block px-2 py-1 text-xs font-medium rounded-full">
                                {{ getConditionLabel(item.condition) }}
                              </span>
                            </td>
                            <td class="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 font-mono">
                              {{ item.epcCode || '-' }}
                            </td>
                            <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                              {{ item.conditionNotes || '-' }}
                            </td>
                          </tr>
                        </template>
                        <tr v-else>
                          <td colspan="7" class="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
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

          <!-- Footer with Action Buttons -->
          <div class="flex items-center justify-between gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <!-- Action Buttons (Status-based) -->
            <div class="flex items-center gap-3">
              <!-- Approve Button (PENDING_APPROVAL only) -->
              <button
                v-if="returnData.status === 'PENDING_APPROVAL'"
                @click="handleApprove"
                :disabled="isProcessing"
                type="button"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <svg v-if="isProcessing" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Approve
              </button>

              <!-- Reject Button (PENDING_APPROVAL only) -->
              <button
                v-if="returnData.status === 'PENDING_APPROVAL'"
                @click="handleReject"
                :disabled="isProcessing"
                type="button"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <svg v-if="isProcessing" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject
              </button>

              <!-- Mark as Received Button (APPROVED only, Customer Return) -->
              <button
                v-if="returnData.status === 'APPROVED' && returnData.returnType === 'CUSTOMER_RETURN'"
                @click="handleReceive"
                :disabled="isProcessing"
                type="button"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <svg v-if="isProcessing" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Mark as Received
              </button>

              <!-- Complete Return Button (RECEIVED for Customer, APPROVED for Supplier) -->
              <button
                v-if="(returnData.status === 'RECEIVED' && returnData.returnType === 'CUSTOMER_RETURN') || (returnData.status === 'APPROVED' && returnData.returnType === 'SUPPLIER_RETURN')"
                @click="handleComplete"
                :disabled="isProcessing"
                type="button"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <svg v-if="isProcessing" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Complete Return
              </button>
            </div>

            <!-- Close Button -->
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
import { ref, reactive, computed } from 'vue'
import { authenticatedFetch } from '@/utils/authenticatedFetch'

interface Product {
  id: number
  name: string
  skuCode?: string
}

interface ReturnItem {
  id: number
  productId: number
  epcCode: string | null
  quantity: number
  condition: string
  conditionNotes: string
  product?: Product
}

interface Customer {
  id: number
  customerName: string
}

interface Supplier {
  id: number
  supplierName: string
}

interface Order {
  id: number
  orderNo: string
  orderType: string
}

interface Receiving {
  id: number
  receivingCode: string
}

interface Requester {
  id: number
  username: string
  fullName: string
}

interface ReturnData {
  id: number
  returnCode: string
  returnType: 'CUSTOMER_RETURN' | 'SUPPLIER_RETURN'
  status: string
  orderId?: number
  receivingId?: number
  customerId?: number
  supplierId?: number
  returnDate?: string
  requestedDate: string
  authorizedDate?: string
  completedDate?: string
  warehouseId?: number
  locationId?: number
  requestedBy: number
  authorizedBy?: number
  receivedBy?: string
  reason?: string
  notes?: string
  source?: string
  createdAt: string
  updatedAt: string
  order?: Order
  receiving?: Receiving
  customer?: Customer
  supplier?: Supplier
  requester?: Requester
  returnItems?: ReturnItem[]
}

const isOpen = ref(false)
const isProcessing = ref(false)

const returnData = reactive<ReturnData>({
  id: 0,
  returnCode: '',
  returnType: 'CUSTOMER_RETURN',
  status: '',
  requestedDate: '',
  requestedBy: 0,
  reason: '',
  notes: '',
  source: 'admin',
  createdAt: '',
  updatedAt: '',
  returnItems: []
})

// Computed properties for display
const displayReturnType = computed(() => {
  return returnData.returnType === 'CUSTOMER_RETURN' ? 'CUSTOMER' : 'SUPPLIER'
})

const displayReferenceNo = computed(() => {
  if (returnData.order) {
    return returnData.order.orderNo
  }
  if (returnData.receiving) {
    return returnData.receiving.receivingCode
  }
  return '-'
})

const displayFrom = computed(() => {
  if (returnData.returnType === 'CUSTOMER_RETURN' && returnData.customer) {
    return returnData.customer.customerName
  }
  if (returnData.returnType === 'SUPPLIER_RETURN') {
    return 'Warehouse'
  }
  return '-'
})

const displayTo = computed(() => {
  if (returnData.returnType === 'CUSTOMER_RETURN') {
    return 'Warehouse'
  }
  if (returnData.returnType === 'SUPPLIER_RETURN' && returnData.supplier) {
    return returnData.supplier.supplierName
  }
  return '-'
})

const totalQuantity = computed(() => {
  return returnData.returnItems?.reduce((sum, item) => sum + item.quantity, 0) || 0
})

const skuQuantity = computed(() => {
  return returnData.returnItems?.length || 0
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
    'CUSTOMER': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'SUPPLIER': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  }
  return classes[type as keyof typeof classes] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

const getConditionBadge = (condition: string) => {
  const classes = {
    'GOOD': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'DEFECTIVE': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'DAMAGED': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'WRONG_ITEM': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  }
  return classes[condition as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const getConditionLabel = (condition: string) => {
  // Return uppercase labels to match requested UI
  const labels = {
    'GOOD': 'GOOD',
    'DEFECTIVE': 'DEFECTIVE',
    'DAMAGED': 'DAMAGED',
    'WRONG_ITEM': 'WRONG_ITEM'
  }
  return labels[condition as keyof typeof labels] || (condition ? condition.toString().toUpperCase() : condition)
}

// Action Handlers
const emit = defineEmits(['refresh', 'show-toast'])

const handleApprove = async () => {
  if (isProcessing.value) return

  try {
    isProcessing.value = true
    const response = await authenticatedFetch(`/api/return/${returnData.id}/approve`, {
      method: 'POST'
    })

    if (response.ok) {
      const result = await response.json()
      emit('show-toast', 'Return approved successfully', 'success')
      Object.assign(returnData, result) // Update local data
      emit('refresh') // Refresh parent list
    } else {
      const error = await response.json()
      emit('show-toast', error.message || 'Failed to approve return', 'error')
    }
  } catch (error: any) {
    console.error('Error approving return:', error)
    emit('show-toast', error.message || 'An error occurred while approving the return', 'error')
  } finally {
    isProcessing.value = false
  }
}

const handleReject = async () => {
  if (isProcessing.value) return

  const reason = prompt('Please enter rejection reason:')
  if (!reason || reason.trim() === '') {
    emit('show-toast', 'Rejection reason is required', 'error')
    return
  }

  try {
    isProcessing.value = true
    const response = await authenticatedFetch(`/api/return/${returnData.id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason: reason.trim() })
    })

    if (response.ok) {
      const result = await response.json()
      emit('show-toast', 'Return rejected', 'success')
      Object.assign(returnData, result)
      emit('refresh')
    } else {
      const error = await response.json()
      emit('show-toast', error.message || 'Failed to reject return', 'error')
    }
  } catch (error: any) {
    console.error('Error rejecting return:', error)
    emit('show-toast', error.message || 'An error occurred while rejecting the return', 'error')
  } finally {
    isProcessing.value = false
  }
}

const handleReceive = async () => {
  if (isProcessing.value) return

  if (!confirm('Mark this return as received?')) {
    return
  }

  try {
    isProcessing.value = true
    const response = await authenticatedFetch(`/api/return/${returnData.id}/receive`, {
      method: 'POST'
    })

    if (response.ok) {
      const result = await response.json()
      emit('show-toast', 'Return marked as received', 'success')
      Object.assign(returnData, result)
      emit('refresh')
    } else {
      const error = await response.json()
      emit('show-toast', error.message || 'Failed to mark return as received', 'error')
    }
  } catch (error: any) {
    console.error('Error receiving return:', error)
    emit('show-toast', error.message || 'An error occurred while receiving the return', 'error')
  } finally {
    isProcessing.value = false
  }
}

const handleComplete = async () => {
  if (isProcessing.value) return

  if (!confirm('Complete this return? EPCs will be processed based on their condition.')) {
    return
  }

  try {
    isProcessing.value = true
    const response = await authenticatedFetch(`/api/return/${returnData.id}/complete`, {
      method: 'POST'
    })

    if (response.ok) {
      const result = await response.json()
      emit('show-toast', 'Return completed successfully. EPCs have been processed.', 'success')
      Object.assign(returnData, result)
      emit('refresh')
    } else {
      const error = await response.json()
      emit('show-toast', error.message || 'Failed to complete return', 'error')
    }
  } catch (error: any) {
    console.error('Error completing return:', error)
    emit('show-toast', error.message || 'An error occurred while completing the return', 'error')
  } finally {
    isProcessing.value = false
  }
}

defineExpose({ openModal, closeModal })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
