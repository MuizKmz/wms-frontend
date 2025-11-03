<template>
  <div class="text-center max-w-4xl mx-auto">
    <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
      {{ hero.title }}
    </h1>
    <p class="text-xl text-gray-600 mb-8">
      {{ hero.subtitle }}
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <button
        class="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition"
      >
        {{ hero.getStarted }}
      </button>
      <button
        class="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-50 transition border-2 border-blue-600"
      >
        {{ hero.learnMore }}
      </button>
    </div>
  </div>
</template>

<script setup>
const hero = {
  title: 'Warehouse Management System Dashboard',
  subtitle: 'Discover amazing features and services designed to make your experience exceptional',
  getStarted: 'Get Started',
  learnMore: 'Learn More',
}
</script>