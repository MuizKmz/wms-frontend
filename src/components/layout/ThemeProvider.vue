<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { ref, provide, onMounted, watch, computed } from 'vue'

type Theme = 'light' | 'dark'

const theme = ref<Theme>('light')
const isInitialized = ref(false)

const isDarkMode = computed(() => theme.value === 'dark')

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

// Helper function to calculate luminance
const getLuminance = (hexColor: string): number => {
  const rgb = parseInt(hexColor.slice(1), 16)
  const r = (rgb >> 16) & 0xff
  const g = (rgb >> 8) & 0xff
  const b = (rgb >> 0) & 0xff

  const a = [r, g, b].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })

  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

// Helper function to get text color
const getTextColor = (bgColor: string): string => {
  const luminance = getLuminance(bgColor)
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

// Apply theme customization from settings
const applyThemeCustomization = () => {
  const saved = localStorage.getItem('themeCustomization')
  if (!saved) return

  try {
    const settings = JSON.parse(saved)
    const root = document.documentElement
    const isDark = root.classList.contains('dark')

    // Calculate text colors
    const sidebarTextColor = getTextColor(settings.sidebarColor || '#0f172a')
    const headerTextColor = getTextColor(settings.headerColor || '#0f172a')
    const footerTextColor = getTextColor(settings.footerColor || '#f9fafb')

    // In dark mode, override with dark variants
    if (isDark) {
      root.style.setProperty('--sidebar-color', '#1e293b')
      root.style.setProperty('--sidebar-text-color', '#ffffff')
      root.style.setProperty('--header-color', '#1e293b')
      root.style.setProperty('--header-text-color', '#ffffff')
      root.style.setProperty('--footer-color', '#1e293b')
      root.style.setProperty('--footer-text-color', '#ffffff')
    } else {
      root.style.setProperty('--sidebar-color', settings.sidebarColor || '#0f172a')
      root.style.setProperty('--sidebar-text-color', sidebarTextColor)
      root.style.setProperty('--header-color', settings.headerColor || '#ffffff')
      root.style.setProperty('--header-text-color', headerTextColor)
      root.style.setProperty('--footer-color', settings.footerColor || '#ffffff')
      root.style.setProperty('--footer-text-color', footerTextColor)
    }
    
    // Background settings
    if (settings.backgroundType === 'solid') {
      root.style.setProperty('--bg-color-light', settings.backgroundColor)
      root.style.setProperty('--bg-color-dark', settings.backgroundColorDark)
      root.style.removeProperty('--bg-image-url')
      root.style.removeProperty('--bg-image-url-dark')
    } else {
      root.style.setProperty('--bg-image-url', settings.backgroundImageUrl)
      root.style.setProperty('--bg-image-url-dark', settings.backgroundImageUrlDark || settings.backgroundImageUrl)
      root.style.setProperty('--bg-size', settings.backgroundSize)
      root.style.setProperty('--bg-position', settings.backgroundPosition)
      root.style.setProperty('--bg-repeat', settings.backgroundRepeat)
      root.style.setProperty('--bg-opacity', (settings.backgroundOpacity / 100).toString())
    }

    root.style.setProperty('--bg-type', settings.backgroundType)
  } catch (e) {
    console.error('Failed to apply theme customization:', e)
  }
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme') as Theme | null
  const initialTheme = savedTheme || 'light' // Default to light theme

  theme.value = initialTheme
  isInitialized.value = true
  
  // Apply theme customization
  applyThemeCustomization()
})

watch([theme, isInitialized], ([newTheme, newIsInitialized]) => {
  if (newIsInitialized) {
    localStorage.setItem('theme', newTheme)
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    // Reapply theme customization when dark mode changes
    applyThemeCustomization()
  }
})

provide('theme', {
  isDarkMode,
  toggleTheme,
})
</script>

<script lang="ts">
import { inject } from 'vue'

export function useTheme() {
  const theme = inject('theme')
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return theme
}
</script>
