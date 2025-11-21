<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="closeModal">
        <div class="absolute inset-0 bg-black/50"></div>

        <div ref="panelRef" class="relative z-10 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
            <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Shipment Details</h2>
              <button class="text-gray-400 hover:text-gray-600" @click="closeModal">✕</button>
            </div>

            <div class="p-6 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-gray-500">Tracking Code</p>
                  <p class="font-medium text-gray-900 dark:text-white">{{ shipment.trackingCode || '-' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Status</p>
                  <p>
                    <span :class="['px-3 py-1 text-xs rounded-full font-medium', shipStatusClass(shipment.state || shipment.status)]">
                      {{ formatShipStatus(shipment.state || shipment.status) }}
                    </span>
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-gray-500">Shipping Carrier</p>
                  <p class="font-medium text-gray-900 dark:text-white">{{ shipment.carrier || '-' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Destination</p>
                  <p class="font-medium text-gray-900 dark:text-white">{{ shipment.destination || '-' }}</p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-gray-500">Shipping Date</p>
                  <p class="font-medium text-gray-900 dark:text-white">{{ formatDate(shipment.shippingDate) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Estimated Delivery Date</p>
                  <p class="font-medium text-gray-900 dark:text-white">{{ formatDate(shipment.estimatedDeliveryDate) }}</p>
                </div>
              </div>

              <div>
                <p class="text-xs text-gray-500">Sales Order Number</p>
                <p class="font-medium text-gray-900 dark:text-white">{{ getOrderNumber() }}</p>
              </div>

              <div>
                <p class="text-xs text-gray-500">Remarks</p>
                <p class="font-medium text-gray-900 dark:text-white">{{ shipment.remark || shipment.remarks || '-' }}</p>
              </div>
            </div>

            <div class="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button class="btn btn-outline" @click="closeModal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)
const shipment = ref<any>({})
const panelRef = ref<HTMLElement | null>(null)

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
  shipment.value = data || {}
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

// Format and class helpers for shipment status (uppercase label + badge classes)
const formatShipStatus = (status: string | undefined) => {
  const s = (status || '').toString().toUpperCase()
  return s || '-'
}

const shipStatusClass = (status: string | undefined) => {
  if (!status) return 'bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-300'
  const s = status.toString().toUpperCase()
  const map: Record<string, string> = {
    PENDING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
    PROCESSING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    SHIPPED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
    RECEIVED: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200',
    DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
    CLOSED: 'bg-green-200 text-green-900 dark:bg-green-900/60 dark:text-green-100',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  }
  return map[s] || 'bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-300'
}

const getOrderNumber = () => {
  // Handle different data structures
  if (shipment.value.order) {
    if (typeof shipment.value.order === 'string') {
      return shipment.value.order
    }
    if (shipment.value.order.orderNo) {
      return shipment.value.order.orderNo
    }
    if (shipment.value.order.name) {
      return shipment.value.order.name
    }
  }
  
  // Fallback to raw data
  if (shipment.value.raw?.order) {
    if (typeof shipment.value.raw.order === 'string') {
      return shipment.value.raw.order
    }
    if (shipment.value.raw.order.orderNo) {
      return shipment.value.raw.order.orderNo
    }
  }
  
  return '-'
}

defineExpose({ openModal, closeModal })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
