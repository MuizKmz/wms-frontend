<template>
  <div class="text-center py-6 mb-6">
    <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
      {{ title }}
    </h1>
    <p v-if="subtitle" class="mt-2 text-lg text-gray-600 dark:text-gray-400">
      {{ subtitle }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: false,
    default: ''
  }
})
</script>