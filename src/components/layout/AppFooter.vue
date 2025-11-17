<template>
  <footer 
    class="border-t transition-all duration-300"
    :style="{ 
      backgroundColor: footerBgColor, 
      borderColor: 'rgba(0, 0, 0, 0.1)',
      color: footerTextColor
    }"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="py-4">
        <p class="text-sm text-center" :style="{ color: footerTextColor }">
          © 2025 WMS CLB Groups., All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const footerBgColor = ref('var(--footer-color, #ffffff)')
const footerTextColor = ref('var(--footer-text-color, #000000)')

const updateFooterColors = () => {
  const root = document.documentElement
  footerBgColor.value = getComputedStyle(root).getPropertyValue('--footer-color').trim() || '#ffffff'
  footerTextColor.value = getComputedStyle(root).getPropertyValue('--footer-text-color').trim() || '#000000'
}

let observer: MutationObserver | null = null

onMounted(() => {
  // Update colors initially
  setTimeout(() => updateFooterColors(), 100)
  
  // Listen for theme changes
  window.addEventListener('themeChanged', updateFooterColors)
  
  // Watch for dark mode toggle
  observer = new MutationObserver(() => {
    setTimeout(() => updateFooterColors(), 50)
  })
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})

onUnmounted(() => {
  window.removeEventListener('themeChanged', updateFooterColors)
  if (observer) {
    observer.disconnect()
  }
})
</script>
