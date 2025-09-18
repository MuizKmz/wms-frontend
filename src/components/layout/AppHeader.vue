<template>
  <header
    class="sticky top-0 bg-white border-b border-gray-200 z-50 dark:border-gray-800 dark:bg-gray-900"
  >
    <div class="flex items-center justify-between px-4 py-3 lg:px-6">
      <!-- LEFT: Date -->
      <div class="text-sm text-gray-700 dark:text-gray-300">
        {{ currentDate }}
      </div>

      <!-- CENTER: Logo + Title -->
      <div class="flex items-center gap-2">
        <!-- <HeaderLogo /> -->
        <h1 class="text-base font-semibold text-gray-900 dark:text-white">
          Manufacturing Execution System
        </h1>
      </div>

      <!-- RIGHT: Clock + Theme/Notifications -->
      <div class="flex items-center gap-4">
        <div class="text-sm font-mono text-gray-700 dark:text-gray-300">
          {{ currentTime }}
        </div>
        <ThemeToggler />
        <NotificationMenu />
      </div>
    </div>
  </header>
</template>


<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import ThemeToggler from '../common/ThemeToggler.vue'
import HeaderLogo from './header/HeaderLogo.vue'
import NotificationMenu from './header/NotificationMenu.vue'

const currentDate = ref('')
const currentTime = ref('')

function updateDateTime() {
  const now = new Date()
  currentDate.value = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

let intervalId: number

onMounted(() => {
  updateDateTime()
  intervalId = window.setInterval(updateDateTime, 1000)
})

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>
