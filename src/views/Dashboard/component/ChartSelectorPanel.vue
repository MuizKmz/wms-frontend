<template>
  <!-- Backdrop -->
  <Transition name="backdrop">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/30 z-40 transition-opacity"
      @click="$emit('close')"
    ></div>
  </Transition>

  <!-- Side Panel -->
  <Transition name="slide">
    <div
      v-if="isOpen"
      class="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
    >
      <!-- Panel Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Add Chart
        </h2>
        <button
          type="button"
          @click="$emit('close')"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
          title="Close"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Panel Body - Chart Options -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- No Charts Available Message -->
        <div v-if="availableCharts.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
          <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 class="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
            All Charts Added
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
            You've added all available charts to your dashboard. Remove a chart to add it again.
          </p>
        </div>

        <!-- Chart Options List -->
        <div v-else class="space-y-3">
          <button
            v-for="chart in availableCharts"
            :key="chart.id"
            type="button"
            @click="$emit('add-chart', chart)"
            class="w-full text-left p-4 rounded-xl border-2 border-gray-200 dark:border-gray-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
          >
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/60 transition-colors">
                <component :is="chart.icon" class="w-5 h-5" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  {{ chart.title }}
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {{ chart.description }}
                </p>
              </div>
              <div class="flex-shrink-0">
                <PlusIcon class="w-5 h-5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { BarChartIcon, PieChartIcon, TableIcon, PlusIcon } from '@/icons'

interface ChartOption {
  id: string
  title: string
  description: string
  icon: any
  component: string
}

interface Props {
  isOpen: boolean
  availableCharts: ChartOption[]
}

defineProps<Props>()

defineEmits<{
  (e: 'close'): void
  (e: 'add-chart', chart: ChartOption): void
}>()
</script>

<style scoped>
/* Backdrop transitions */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* Slide transitions */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
