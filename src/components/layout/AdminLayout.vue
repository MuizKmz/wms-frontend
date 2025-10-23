<template>
  <div class="min-h-screen xl:flex" :style="mainBackgroundStyle">
    <app-sidebar />
    
    <!-- Main Wrapper -->
    <div
      class="flex-1 transition-all duration-300 ease-in-out lg:ml-64"
    >
      <!-- Header -->
      <app-header />
      
      <!-- Page Content -->
      <div class="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 mb-20">
        <slot></slot>
      </div>
      
      <!-- Footer -->
      <app-footer />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import Backdrop from './Backdrop.vue'

const mainBackgroundStyle = ref({})

// Compute background style based on theme settings
const updateBackgroundStyle = () => {
  const root = document.documentElement
  const bgType = getComputedStyle(root).getPropertyValue('--bg-type').trim()
  const isDark = root.classList.contains('dark')
  
  if (bgType === 'image') {
    const imageUrl = isDark 
      ? getComputedStyle(root).getPropertyValue('--bg-image-url-dark').trim() || getComputedStyle(root).getPropertyValue('--bg-image-url').trim()
      : getComputedStyle(root).getPropertyValue('--bg-image-url').trim()
    
    if (imageUrl) {
      const bgSize = getComputedStyle(root).getPropertyValue('--bg-size').trim() || 'cover'
      const bgPosition = getComputedStyle(root).getPropertyValue('--bg-position').trim() || 'center'
      const bgRepeat = getComputedStyle(root).getPropertyValue('--bg-repeat').trim() || 'no-repeat'
      const bgOpacity = getComputedStyle(root).getPropertyValue('--bg-opacity').trim() || '1'
      
      mainBackgroundStyle.value = {
        backgroundImage: `linear-gradient(rgba(255, 255, 255, ${1 - parseFloat(bgOpacity)}), rgba(255, 255, 255, ${1 - parseFloat(bgOpacity)})), url(${imageUrl})`,
        backgroundSize: bgSize,
        backgroundPosition: bgPosition,
        backgroundRepeat: bgRepeat,
        backgroundAttachment: 'fixed'
      }
      return
    }
  }
  
  // Default solid background
  const bgColor = isDark 
    ? getComputedStyle(root).getPropertyValue('--bg-color-dark').trim() || '#111827'
    : getComputedStyle(root).getPropertyValue('--bg-color-light').trim() || '#F9FAFB'
  
  mainBackgroundStyle.value = {
    backgroundColor: bgColor
  }
}

let observer = null

onMounted(() => {
  // Initial update
  setTimeout(() => updateBackgroundStyle(), 100)
  
  // Listen for theme changes
  window.addEventListener('themeChanged', updateBackgroundStyle)
  
  // Watch for dark mode toggle
  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        setTimeout(() => updateBackgroundStyle(), 50)
      }
    })
  })
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})

onUnmounted(() => {
  window.removeEventListener('themeChanged', updateBackgroundStyle)
  if (observer) {
    observer.disconnect()
  }
})
</script>