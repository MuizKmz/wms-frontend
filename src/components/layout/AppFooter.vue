<template>
  <footer 
    class="fixed bottom-0 left-0 right-0 border-t z-10 transition-all duration-300"
    :style="{ 
      backgroundColor: 'var(--footer-color, #f9fafb)', 
      borderColor: 'rgba(0, 0, 0, 0.1)',
      color: 'var(--footer-text-color, #6b7280)'
    }"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="py-4">
        <p class="text-sm text-center" :style="{ color: 'var(--footer-text-color, #6b7280)' }">
          © 2025 WMS CLB Groups., All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>
