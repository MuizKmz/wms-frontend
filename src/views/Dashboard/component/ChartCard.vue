<template>
  <div
    :class="[
      'rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] relative transition-all flex flex-col',
      isFullscreen ? 'fixed inset-0 z-50 m-0 max-w-none w-screen h-screen overflow-auto' : '',
      className,
    ]"
  >
    <!-- Card Header -->
  <div class="px-4 sm:px-6 py-4 flex items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
      <!-- Card Title: prefer slot, fallback to prop -->
      <div class="min-w-0">
        <template v-if="$slots.title">
          <slot name="title"></slot>
        </template>
        <template v-else>
          <h3
            v-if="title"
            class="text-base font-semibold leading-tight text-gray-800 dark:text-gray-200 truncate"
            :title="title"
          >
            {{ title }}
          </h3>
          <p
            v-if="desc"
            class="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2"
          >
            {{ desc }}
          </p>
        </template>
      </div>
      <!-- Header Actions -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <slot name="headerAction"></slot>
        <button
          v-if="fullscreenable"
          type="button"
          @click="toggleFullscreen"
          class="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
          :title="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'"
        >
          <component :is="isFullscreen ? 'CollapseIcon' : 'ExpandIcon'" />
        </button>
        <button
          v-if="refreshable"
          type="button"
          @click="$emit('refresh')"
          class="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
          title="Refresh"
        >
          <RefreshIcon />
        </button>
      </div>
    </div>

    <!-- Card Body -->
    <div class="p-4 dark:border-gray-800 sm:p-6 flex-1 min-h-0 overflow-hidden">
      <div class="h-full">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue'
import { ExpandIcon, CollapseIcon, RefreshIcon } from '@/icons'

interface Props {
  title: string
  className?: string
  desc?: string
  fullscreenable?: boolean
  refreshable?: boolean
}

const props = defineProps<Props>()
const isFullscreen = ref(false)

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
}
</script>