<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ title }}</p>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-2">{{ value }}</h3>
        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">{{ subtitle }}</p>
      </div>
      <div :class="`p-3 rounded-full ${iconBgColor}`">
        <component :is="icon" :class="`w-6 h-6 ${iconColor}`" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: Object,
    required: true
  },
  iconColor: {
    type: String,
    default: 'text-blue-600'
  },
  iconBgColor: {
    type: String,
    default: 'bg-blue-100'
  }
})
</script>
