<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="closeModal">
        <div class="absolute inset-0 bg-black/50"></div>

        <div ref="panelRef" class="relative z-10 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
            <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Order Details</h2>
              <button class="text-gray-400 hover:text-gray-600" @click="closeModal">✕</button>
            </div>

            <div class="p-6 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-gray-500">Order Number</p>
                  <div class="flex items-center gap-2">
                    <p class="font-medium text-gray-900 dark:text-white">{{ order.orderNo || '-' }}</p>
                    <button
                      v-if="order.orderNo"
                      @click="showQRCode"
                      class="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400 transition-colors"
                      title="Show QR Code"
                    >
                      <QRCodeIcon class="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Customer / Supplier</p>
                  <p class="font-medium text-gray-900 dark:text-white">{{ order.customer?.customerName || order.supplier?.supplierName || '-' }}</p>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div>
                  <p class="text-xs text-gray-500">PIC</p>
                  <p class="font-medium text-gray-900 dark:text-white">{{ order.picName || '-' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Status</p>
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                    :class="statusClass(order.status)"
                  >
                    {{ order.status || '-' }}
                  </span>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Estimated Delivery</p>
                  <p class="font-medium text-gray-900 dark:text-white">{{ formatDate(order.estimatedDeliveryTime) }}</p>
                </div>
              </div>

              <div>
                <p class="text-xs text-gray-500">Remarks</p>
                <p class="font-medium text-gray-900 dark:text-white">{{ order.remarks || '-' }}</p>
              </div>

              <div>
                <p class="text-sm font-medium mb-2">Order Items</p>
                <div v-if="order.orderItems && order.orderItems.length">
                  <table class="min-w-full text-sm">
                    <thead>
                      <tr class="text-left text-xs text-gray-500 uppercase tracking-wider">
                        <th class="px-3 py-2">#</th>
                        <th class="px-3 py-2">Product</th>
                        <th class="px-3 py-2">Quantity</th>
                        <th class="px-3 py-2">Stock Out Qty</th>
                        <th class="px-3 py-2">Unit</th>
                        <th class="px-3 py-2">Item Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, idx) in order.orderItems" :key="item.id || idx" class="border-t border-gray-100">
                        <td class="px-3 py-2 align-top">{{ idx + 1 }}</td>
                        <td class="px-3 py-2 align-top">{{ item.product?.name || item.productName || item.productId || '-' }}</td>
                        <td class="px-3 py-2 align-top">{{ item.quantity ?? '-' }}</td>
                        <td class="px-3 py-2 align-top">{{ item.stockOutQuantity ?? '-' }}</td>
                        <td class="px-3 py-2 align-top">{{ item.unit || 'pcs' }}</td>
                        <td class="px-3 py-2 align-top">
                          <span
                            class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                            :class="statusClass(item.status)"
                          >
                            {{ item.status || '-' }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-else class="text-sm text-gray-500">No items on this order.</div>
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

  <!-- QR Code Modal -->
  <OrderQRModal ref="qrModalRef" :show="false" :initialOrderNo="null" @close="closeQRModal" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import QRCodeIcon from '@/icons/QRCodeIcon.vue'
import OrderQRModal from './OrderQRModal.vue'

const isOpen = ref(false)
const order = ref<any>({})
const panelRef = ref<HTMLElement | null>(null)
const qrModalRef = ref<InstanceType<typeof OrderQRModal> | null>(null)

// Reuse similar status color mapping as table
const statusClass = (status: string) => {
  if (!status) return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  const map: Record<string, string> = {
    Created: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
    Processing: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    Preparing: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    Confirmed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200',
    Allocated: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
    Picked: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200',
    Packed: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200',
    Shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
    Delivered: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
    Completed: 'bg-green-200 text-green-900 dark:bg-green-900/60 dark:text-green-100',
    Backordered: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
    Rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
    Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
  }
  return map[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
}

let _scrollY = 0
let _scrollbarWidth = 0
const getScrollbarWidth = () => window.innerWidth - document.documentElement.clientWidth

const lockScroll = () => {
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

  requestAnimationFrame(() => {
    window.scrollTo(0, _scrollY || 0)
  })
}

const openModal = async (data: any) => {
  order.value = data || {}
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

const showQRCode = () => {
  if (qrModalRef.value && order.value.orderNo) {
    qrModalRef.value.openModal(order.value.orderNo)
  }
}

const closeQRModal = () => {
  // Handler for when QR modal closes
}

defineExpose({ openModal, closeModal })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
