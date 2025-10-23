<template>
  <header
    class="sticky top-0 border-b z-50 transition-all duration-300"
    :style="{ 
      backgroundColor: headerBgColor, 
      color: headerTextColor,
      borderColor: 'rgba(0, 0, 0, 0.1)'
    }"
  >
    <div class="flex items-center justify-between px-4 py-3 lg:px-6">
      <!-- LEFT: Hamburger + Date -->
      <div class="flex items-center gap-3">
        <div class="text-sm sm:block" :style="{ color: 'var(--header-text-color, inherit)' }">
          {{ currentDate }}
        </div>
      </div>

      <!-- CENTER: Logo + Title -->
      <div class="flex items-center gap-2">
        <!-- <HeaderLogo /> -->
        <h1 class="text-base font-semibold hidden md:block" :style="{ color: 'var(--header-text-color, inherit)' }">
          Warehouse Management System
        </h1>
        <h1 class="text-sm font-semibold md:hidden" :style="{ color: 'var(--header-text-color, inherit)' }">
          WMS
        </h1>
      </div>

      <!-- RIGHT: Clock + Theme + User Email -->
      <div class="flex items-center gap-2 sm:gap-4">
        <div class="text-sm font-mono hidden sm:block" :style="{ color: 'var(--header-text-color, inherit)' }">
          {{ currentTime }}
        </div>
        <ThemeToggler />
        <!-- <NotificationMenu /> -->
        
        <!-- User Email with Tooltip -->
        <div class="relative group">
          <div class="flex items-center gap-2 px-3 py-2 rounded-lg hover:opacity-80 transition-colors cursor-pointer">
            <svg class="w-5 h-5" :style="{ color: 'var(--header-text-color, inherit)' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span class="text-sm hidden md:block" :style="{ color: 'var(--header-text-color, inherit)' }">{{ userEmail }}</span>
          </div>
          <!-- Tooltip -->
          <div class="absolute right-0 top-full mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
            {{ userEmail }}
            <div class="absolute -top-1 right-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import ThemeToggler from '../common/ThemeToggler.vue'
import HeaderLogo from './header/HeaderLogo.vue'
import NotificationMenu from './header/NotificationMenu.vue'
import { useSidebar } from '@/composables/useSidebar'

const { isMobileOpen, toggleMobileSidebar } = useSidebar()

const currentDate = ref('')
const currentTime = ref('')
const userEmail = ref('')
const headerBgColor = ref('var(--header-color, #ffffff)')
const headerTextColor = ref('var(--header-text-color, #000000)')

const updateHeaderColors = () => {
  const root = document.documentElement
  headerBgColor.value = getComputedStyle(root).getPropertyValue('--header-color').trim() || '#ffffff'
  headerTextColor.value = getComputedStyle(root).getPropertyValue('--header-text-color').trim() || '#000000'
}

// Get user email from localStorage
onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      userEmail.value = user.email || 'No email'
    } catch (e) {
      console.error('Failed to parse user data:', e)
      userEmail.value = 'Unknown'
    }
  } else {
    userEmail.value = 'Not logged in'
  }
})

function updateDateTime() {
  const now = new Date()
  currentDate.value = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

let intervalId: number
let observer: MutationObserver | null = null

onMounted(() => {
  updateDateTime()
  intervalId = window.setInterval(updateDateTime, 1000)
  
  // Update colors initially
  setTimeout(() => updateHeaderColors(), 100)
  
  // Listen for theme changes
  window.addEventListener('themeChanged', updateHeaderColors)
  
  // Watch for dark mode toggle
  observer = new MutationObserver(() => {
    setTimeout(() => updateHeaderColors(), 50)
  })
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})

onUnmounted(() => {
  clearInterval(intervalId)
  window.removeEventListener('themeChanged', updateHeaderColors)
  if (observer) {
    observer.disconnect()
  }
})
</script>