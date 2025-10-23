<template>
  <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
    <!-- <h2 class="text-xl font-semibold text-gray-800 dark:text-white/90" x-text="pageTitle">
      {{ pageTitle }}
    </h2> -->
    <nav>
      <ol class="flex items-center gap-1.5">
        <li>
          <router-link
            :style="breadcrumbLinkStyle"
            class="inline-flex items-center gap-1.5 text-sm"
            to="/"
          >
            Home
            <svg
              class="stroke-current"
              width="17"
              height="16"
              viewBox="0 0 17 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                stroke=""
                stroke-width="1.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </router-link>
        </li>
        <li :style="breadcrumbTextStyle" class="text-sm font-medium">
          {{ pageTitle }}
        </li>
      </ol>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, onMounted, computed } from 'vue'

interface BreadcrumbProps {
  pageTitle: string
}

defineProps<BreadcrumbProps>()

const hasCustomBackground = ref(false)

// Check if custom background is set
const checkBackgroundSettings = () => {
  try {
    const saved = localStorage.getItem('themeCustomization')
    if (saved) {
      const settings = JSON.parse(saved)
      
      // Only show white bold text if background image is set
      if (settings.backgroundType === 'image' && settings.backgroundImageUrl) {
        hasCustomBackground.value = true
      } else {
        hasCustomBackground.value = false
      }
    } else {
      hasCustomBackground.value = false
    }
  } catch (e) {
    console.error('Error checking background settings:', e)
    hasCustomBackground.value = false
  }
}

// Breadcrumb styles that adapt to background
const breadcrumbLinkStyle = computed(() => {
  if (hasCustomBackground.value) {
    return {
      color: '#ffffff',
      fontWeight: '600',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
    }
  }
  return {}
})

const breadcrumbTextStyle = computed(() => {
  if (hasCustomBackground.value) {
    return {
      color: '#ffffff',
      fontWeight: '700',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
    }
  }
  return {}
})

onMounted(() => {
  checkBackgroundSettings()
  
  // Listen for theme changes
  window.addEventListener('themeChanged', checkBackgroundSettings)
  
  // Watch for dark mode toggle
  const observer = new MutationObserver(() => {
    checkBackgroundSettings()
  })
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})
</script>
