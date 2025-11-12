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
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-gray-500">Receiving Code</p>
                  <p class="font-medium text-gray-900 dark:text-white">{{ receiving.receivingCode || '-' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">PO Number</p>
                  <p class="font-medium text-gray-900 dark:text-white">{{ receiving.order?.orderNo || '-' }}</p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-gray-500">DO Number</p>
                  <p class="font-medium text-gray-900 dark:text-white">{{ receiving.doNumber || '-' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Receiving Date</p>
                  <p class="font-medium text-gray-900 dark:text-white">{{ formatDate(receiving.receivingDate) }}</p>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div>
                  <p class="text-xs text-gray-500">Warehouse</p>
                  <p class="font-medium text-gray-900 dark:text-white">{{ receiving.warehouse?.name || receiving.warehouseId || '-' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Received By</p>
                  <p class="font-medium text-gray-900 dark:text-white">{{ receiving.receivedBy || '-' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Supplier</p>
                  <p class="font-medium text-gray-900 dark:text-white">{{ receiving.supplier?.supplierName || '-' }}</p>
                </div>
              </div>

              <div>
                <p class="text-xs text-gray-500">Remarks</p>
                <p class="font-medium text-gray-900 dark:text-white">{{ receiving.remarks || '-' }}</p>
              </div>

              <div>
                <p class="text-sm font-medium mb-2">Receiving Items</p>
                <div v-if="receiving.receivingItems && receiving.receivingItems.length">
                  <table class="min-w-full text-sm">
                    <thead>
                      <tr class="text-left text-xs text-gray-500 uppercase tracking-wider">
                        <th class="px-3 py-2">#</th>
                        <th class="px-3 py-2">Product</th>
                        <th class="px-3 py-2">Expected Qty</th>
                        <th class="px-3 py-2">Received Qty</th>
                        <th class="px-3 py-2">Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, idx) in receiving.receivingItems" :key="item.id" class="border-t border-gray-100">
                        <td class="px-3 py-2 align-top">{{ idx + 1 }}</td>
                        <td class="px-3 py-2 align-top">{{ item.product?.name || item.productName || item.productId || '-' }}</td>
                        <td class="px-3 py-2 align-top">{{ item.expectedQuantity ?? '-' }}</td>
                        <td class="px-3 py-2 align-top">{{ item.quantity ?? '-' }}</td>
                        <td class="px-3 py-2 align-top">{{ item.unit || '-' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-else class="text-sm text-gray-500">No items on this receiving.</div>
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
import { ref } from 'vue'

const isOpen = ref(false)
const receiving = ref<any>({})
const panelRef = ref<HTMLElement | null>(null)

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
  receiving.value = data || {}
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

defineExpose({ openModal, closeModal })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
