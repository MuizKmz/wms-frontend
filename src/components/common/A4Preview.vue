<template>
  <div class="relative">
    <!-- Tab Navigation -->
    <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
      <nav class="flex gap-4">
        <button
          @click="$emit('update:activeTab', 'table')"
          :class="[
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'table'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          ]"
        >
          A4 Preview
        </button>
        <button
          @click="$emit('update:activeTab', 'chart')"
          :class="[
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'chart'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          ]"
        >
          Graph View
        </button>
      </nav>
    </div>

    <!-- A4 Preview Controls -->
    <div v-if="activeTab === 'table'" class="flex justify-end gap-2 mb-4">
      <button
        @click="zoomOut"
        :disabled="zoomLevel <= 50"
        class="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Zoom Out"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
        </svg>
      </button>
      <button
        @click="resetZoom"
        class="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium"
        title="Reset Zoom"
      >
        {{ zoomLevel }}%
      </button>
      <button
        @click="zoomIn"
        :disabled="zoomLevel >= 150"
        class="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Zoom In"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      </button>
      <button
        @click="toggleFullscreen"
        class="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
        :title="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'"
      >
        <svg v-if="!isFullscreen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- A4 Preview Container -->
    <div
      v-if="activeTab === 'table' && !isFullscreen"
      ref="previewContainer"
      class="overflow-auto max-h-[calc(100vh-300px)]"
    >
      <div class="flex justify-center py-8">
        <!-- A4 Paper: Exact dimensions 210mm x 297mm -->
        <div
          class="bg-white shadow-2xl mx-auto transition-transform duration-300"
          :style="{
            width: '210mm',
            minHeight: '297mm',
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center'
          }"
        >
          <div class="p-8">
            <slot name="a4-content"></slot>
          </div>
        </div>
      </div>
    </div>

    <!-- Fullscreen Modal -->
    <teleport to="body">
      <transition
        enter-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-300"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isFullscreen && activeTab === 'table'"
          class="fixed inset-0 z-[9999] bg-gray-900 bg-opacity-95 flex flex-col"
        >
          <!-- Fullscreen Header -->
          <div class="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
            <div class="flex items-center gap-4">
              <h3 class="text-white font-semibold">A4 Preview - Fullscreen</h3>
              <div class="flex gap-2">
                <button
                  @click="zoomOut"
                  :disabled="zoomLevel <= 50"
                  class="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Zoom Out"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                  </svg>
                </button>
                <button
                  @click="resetZoom"
                  class="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm font-medium"
                  title="Reset Zoom"
                >
                  {{ zoomLevel }}%
                </button>
                <button
                  @click="zoomIn"
                  :disabled="zoomLevel >= 150"
                  class="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Zoom In"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </button>
              </div>
            </div>
            <button
              @click="toggleFullscreen"
              class="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close
            </button>
          </div>

          <!-- Fullscreen Content -->
          <div class="flex-1 overflow-auto p-8">
            <div class="flex justify-center">
              <div
                class="bg-white shadow-2xl transition-transform duration-300"
                :style="{
                  width: '210mm',
                  minHeight: '297mm',
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top center'
                }"
              >
                <div class="p-8">
                  <slot name="a4-content"></slot>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Graph View -->
    <div v-if="activeTab === 'chart'" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
      <slot name="chart-content">
        <div class="flex items-center justify-center h-96">
          <div class="text-center">
            <svg class="w-32 h-32 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p class="mt-4 text-gray-500 dark:text-gray-400">Graph visualization coming soon...</p>
            <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">Integrate with Chart.js or similar library</p>
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  activeTab: {
    type: String,
    default: 'table'
  }
})

const emit = defineEmits(['update:activeTab'])

const zoomLevel = ref(100)
const isFullscreen = ref(false)
const previewContainer = ref(null)

const zoomIn = () => {
  if (zoomLevel.value < 150) {
    zoomLevel.value += 10
  }
}

const zoomOut = () => {
  if (zoomLevel.value > 50) {
    zoomLevel.value -= 10
  }
}

const resetZoom = () => {
  zoomLevel.value = 100
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isFullscreen.value) {
    toggleFullscreen()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})
</script>

<style scoped>
@media print {
  .bg-white {
    box-shadow: none !important;
  }
}
</style>
