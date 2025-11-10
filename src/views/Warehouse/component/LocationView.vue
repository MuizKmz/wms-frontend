<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @click.self="closeModal"
      >
        <div class="absolute inset-0 bg-black/50"></div>

        <div
          ref="panelRef"
          class="relative z-10 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto"
        >
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
            <div
              class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
            >
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                Location Details
              </h2>
              <button class="text-gray-400 hover:text-gray-600" @click="closeModal">✕</button>
            </div>

            <div class="p-6 space-y-6">
              <!-- Location Hierarchy Visual -->
              <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Location Hierarchy
                </h3>
                <div class="flex items-center gap-2 flex-wrap">
                  <!-- Warehouse -->
                  <div
                    class="px-4 py-3 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg font-medium"
                  >
                    <div class="text-xs opacity-75">Warehouse</div>
                    <div class="text-sm">{{ location.warehouseCode || '-' }}</div>
                    <div class="text-xs opacity-75 mt-1">{{ location.warehouseName || '' }}</div>
                  </div>

                  <!-- Arrow (always show after warehouse if there are levels) -->
                  <svg
                    v-if="location.hierarchy === 'Level 0' || location.hierarchy === 'Level 1' || location.hierarchy === 'Level 2'"
                    class="w-5 h-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>

                  <!-- Parent Location (Level 0) - Show for Level 1 and Level 2 -->
                  <div
                    v-if="location.hierarchy === 'Level 1' || location.hierarchy === 'Level 2'"
                    class="px-4 py-3 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-lg font-medium"
                  >
                    <div class="text-xs opacity-75">Level 0 (Parent)</div>
                    <div class="text-sm">{{ location.parentLocationCode || '-' }}</div>
                    <div class="text-xs opacity-75 mt-1">{{ location.parentLocationName || '' }}</div>
                  </div>

                  <!-- Arrow (show between Level 0 and Level 1 for Level 2) -->
                  <svg
                    v-if="location.hierarchy === 'Level 2'"
                    class="w-5 h-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>

                  <!-- Level 1 Location - Show only for Level 2 -->
                  <div
                    v-if="location.hierarchy === 'Level 2'"
                    class="px-4 py-3 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-lg font-medium"
                  >
                    <div class="text-xs opacity-75">Level 1</div>
                    <div class="text-sm">{{ location.child1LocationCode || '-' }}</div>
                    <div class="text-xs opacity-75 mt-1">{{ location.child1LocationName || '' }}</div>
                  </div>

                  <!-- Arrow (always show before current location if not Level 0) -->
                  <svg
                    v-if="location.hierarchy === 'Level 1' || location.hierarchy === 'Level 2'"
                    class="w-5 h-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>

                  <!-- Current Location -->
                  <div
                    class="px-4 py-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg font-medium border-2 border-green-400 dark:border-green-600"
                  >
                    <div class="text-xs opacity-75">{{ location.hierarchy }} (Current)</div>
                    <div class="text-sm font-semibold">{{ location.locationCode || '-' }}</div>
                    <div class="text-xs opacity-75 mt-1">{{ location.locationName || '' }}</div>
                  </div>
                </div>
              </div>

              <!-- Basic Information Grid -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Location Code</p>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ location.locationCode || '-' }}
                  </p>
                </div>

                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Location Name</p>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ location.locationName || '-' }}
                  </p>
                </div>
              </div>

              <!-- Additional Details Grid -->
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Storage Type</p>
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      location.type === 'Storage'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : location.type === 'Picking'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : location.type === 'Staging'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
                    ]"
                  >
                    {{ location.type || '-' }}
                  </span>
                </div>

                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Capacity</p>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ location.capacity || '-' }}
                  </p>
                </div>

                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Status</p>
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      location.status === 'Active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                    ]"
                  >
                    {{ location.status || '-' }}
                  </span>
                </div>
              </div>

              <!-- Hierarchy Level -->
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">Hierarchy Level</p>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ location.hierarchy || 'Level 0' }}
                </p>
              </div>

              <!-- Remarks -->
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">Remarks</p>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ location.remarks || '-' }}
                </p>
              </div>
            </div>

            <div
              class="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700"
            >
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
const location = ref<any>({})
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
  location.value = data || {}
  isOpen.value = true
  lockScroll()
}

const closeModal = async () => {
  isOpen.value = false
  unlockScroll()
}

defineExpose({ openModal, closeModal })
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
