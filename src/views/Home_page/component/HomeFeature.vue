<template>
  <section id="feature" class="mt-32 scroll-mt-20">
    <h2 class="text-4xl font-bold text-center text-gray-900 mb-12">
      {{ features.title }}
    </h2>
    <div class="grid md:grid-cols-3 gap-8">
      <div
        v-for="(feature, index) in features.items"
        :key="index"
        class="bg-white p-8 rounded-3xl shadow-md hover:shadow-xl transition"
      >
        <div class="w-full h-48 bg-gray-200 rounded-2xl mb-6 overflow-hidden flex items-center justify-center">
          <div class="text-6xl">{{ feature.icon }}</div>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-3 text-center">
          {{ feature.title }}
        </h3>
        <p class="text-gray-600 text-center">
          {{ feature.description }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
const features = {
  title: 'Our Features',
  items: [
    {
      icon: '📦',
      title: 'RFID-Powered Tracking',
      description: 'Real-time monitoring of inventory movement.',
    },
    {
      icon: '🔧',
      title: 'Seamless IoT Integration',
      description: 'Automatic data flow across devices and systems.',
    },
    {
      icon: '📱',
      title: 'NFC Enabled',
      description: 'Quick and accurate stocktaking with mobile compatibility.',
    },
  ],
}
</script>
