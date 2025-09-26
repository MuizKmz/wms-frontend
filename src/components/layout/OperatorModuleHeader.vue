<template>
  <header
    class="sticky top-0 bg-gray-800 z-50"
  >
    <div class="flex items-center justify-between px-4 py-5 lg:px-8">
      <!-- LEFT: Date -->
      <div class="text-lg text-white">
        {{ currentDate }}
      </div>

      <!-- CENTER: Logo + Title -->
      <div class="flex items-center gap-2 mt-1">
        <!-- <HeaderLogo /> -->
        <h1 class="text-2xl font-bold text-white">
          Manufacturing Execution System
        </h1>
      </div>

      <!-- RIGHT: Clock + Theme/Notifications -->
      <div class="flex items-center gap-4">
        <div class="text-lg font-mono text-white">
          {{ currentTime }}
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

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
