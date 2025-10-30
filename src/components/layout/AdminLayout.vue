<template>
  <div class="flex flex-col h-screen overflow-hidden" :style="mainBackgroundStyle">
    <app-sidebar />

    <!-- Main Wrapper -->
    <div class="flex-1 flex flex-col overflow-hidden lg:ml-64">
      <!-- Header -->
      <app-header class="flex-shrink-0" />

      <!-- Page Content -->
      <div class="flex-1 bg-gray-50 dark:bg-gray-900 pb-12 overflow-auto">
        <div class="p-4 mx-auto max-w-7xl md:p-6">
          <slot></slot>
        </div>
      </div>

      <!-- Footer -->
      <app-footer class="flex-shrink-0" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'

const mainBackgroundStyle = ref({})

// Compute background style from localStorage directly
const updateBackgroundStyle = () => {
  try {
    const saved = localStorage.getItem('themeCustomization')
    const isDark = document.documentElement.classList.contains('dark')

    if (!saved) {
      console.log('🎨 [AdminLayout] No theme customization found, using defaults')
      mainBackgroundStyle.value = {
        backgroundColor: isDark ? '#111827' : '#F9FAFB',
      }
      return
    }

    const settings = JSON.parse(saved)
    console.log('🎨 [AdminLayout] updateBackgroundStyle from localStorage:', {
      backgroundType: settings.backgroundType,
      isDark,
      hasBackgroundImage: !!settings.backgroundImageUrl,
    })

    if (settings.backgroundType === 'image') {
      const imageUrl = isDark
        ? settings.backgroundImageUrlDark || settings.backgroundImageUrl
        : settings.backgroundImageUrl

      if (imageUrl) {
        const bgSize = settings.backgroundSize || 'cover'
        const bgPosition = settings.backgroundPosition || 'center'
        const bgRepeat = settings.backgroundRepeat || 'no-repeat'
        const bgOpacity = (settings.backgroundOpacity || 100) / 100

        mainBackgroundStyle.value = {
          backgroundImage: `linear-gradient(rgba(255, 255, 255, ${1 - bgOpacity}), rgba(255, 255, 255, ${1 - bgOpacity})), url(${imageUrl})`,
          backgroundSize: bgSize,
          backgroundPosition: bgPosition,
          backgroundRepeat: bgRepeat,
          backgroundAttachment: 'fixed',
        }
        console.log('✅ [AdminLayout] Background image applied, URL length:', imageUrl.length)
        return
      }
    }

    // Solid background
    const bgColor = isDark
      ? settings.backgroundColorDark || '#111827'
      : settings.backgroundColor || '#F9FAFB'

    mainBackgroundStyle.value = {
      backgroundColor: bgColor,
    }
    console.log('✅ [AdminLayout] Solid background applied:', bgColor)
  } catch (e) {
    console.error('❌ [AdminLayout] Error loading background:', e)
    mainBackgroundStyle.value = {
      backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#F9FAFB',
    }
  }
}

let observer = null

onMounted(() => {
  // Initial update immediately - no delay to prevent blink
  updateBackgroundStyle()

  // Listen for theme changes
  window.addEventListener('themeChanged', updateBackgroundStyle)

  // Watch for dark mode toggle
  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        updateBackgroundStyle()
      }
    })
  })

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
})

onUnmounted(() => {
  window.removeEventListener('themeChanged', updateBackgroundStyle)
  if (observer) {
    observer.disconnect()
  }
})
</script>
