<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="closeModal">
        <div class="absolute inset-0 bg-black/50"></div>

        <div ref="panelRef" class="relative z-10 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
            <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Product Details</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Order: {{ orderNo }}</p>
              </div>
              <button class="text-gray-400 hover:text-gray-600" @click="closeModal">✕</button>
            </div>

            <div class="p-6 space-y-4">
              <!-- Product Info -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Product Name</p>
                  <p class="font-medium text-gray-900 dark:text-white">{{ productData.productName || '-' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Quantity</p>
                  <p class="font-medium text-gray-900 dark:text-white">{{ productData.quantity || 0 }}</p>
                </div>
              </div>

              <!-- EPC Table -->
              <div v-if="productData.allocatedEpcs && productData.allocatedEpcs.length > 0">
                <p class="text-sm font-medium mb-2 text-gray-900 dark:text-white">Allocated EPCs</p>
                <div class="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          #
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          EPC Code
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Warehouse
                        </th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Location
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      <tr v-for="(epc, idx) in productData.allocatedEpcs" :key="idx" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {{ idx + 1 }}
                        </td>
                        <td class="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">
                          {{ epc.epcCode || '-' }}
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {{ epc.warehouseCode || '-' }}
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {{ epc.locationCode || '-' }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div v-else class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No EPC allocation data available
              </div>

              <!-- Product Remarks if exists -->
              <div v-if="productData.remarks">
                <p class="text-xs text-gray-500 dark:text-gray-400">Remarks</p>
                <p class="text-sm text-gray-900 dark:text-white">{{ productData.remarks }}</p>
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
const orderNo = ref('')
const productData = ref<any>({})
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

const openModal = (order: string, product: any) => {
  orderNo.value = order
  productData.value = product || {}
  isOpen.value = true
  lockScroll()
}

const closeModal = () => {
  isOpen.value = false
  unlockScroll()
}

defineExpose({ openModal, closeModal })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
