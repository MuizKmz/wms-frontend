<template>
  <router-link
    v-if="cardRoute"
    :to="cardRoute"
    class="card bg-purple-600 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105 cursor-pointer flex flex-col items-start p-8"
  >
    <div class="flex items-center gap-6 mb-6">
      <div class="flex-shrink-0 p-4 rounded-full bg-white bg-opacity-20 shadow-lg">
        <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="cardIconPath" />
        </svg>
      </div>
      <div v-if="cardValue" class="text-4xl font-bold">
        {{ cardValue }}
      </div>
    </div>
    <div class="text-2xl font-semibold">
      {{ cardTitle }}
    </div>
  </router-link>

  <div
    v-else
    class="card bg-purple-600 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col items-start p-8"
  >
    <div class="flex items-center gap-6 mb-6">
      <div class="flex-shrink-0 p-4 rounded-full bg-white bg-opacity-20 shadow-lg">
        <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="cardIconPath" />
        </svg>
      </div>
      <div v-if="cardValue" class="text-4xl font-bold">
        {{ cardValue }}
      </div>
    </div>
    <div class="text-2xl font-semibold">
      {{ cardTitle }}
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import { RouterLink } from 'vue-router';

defineProps({
  cardTitle: {
    type: String,
    required: true,
  },
  cardIconPath: {
    type: String,
    required: true,
  },
  cardValue: {
    type: [String, Number],
    required: false,
    default: null,
  },
  cardRoute: {
    type: [String, Object],
    required: false,
    default: null,
  }
});
</script>

<style scoped>
.card {
  background-image: linear-gradient(135deg, #a78bfa, #8b5cf6);
  height: 100%;
  justify-content: space-between;
}
</style>