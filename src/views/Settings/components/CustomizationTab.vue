<template>
  <div>
    <div class="space-y-6">
      <!-- Theme Colors Section -->
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Theme Colors
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Primary Color -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Primary Color
            </label>
            <div class="flex items-center gap-3">
              <input
                type="color"
                v-model="themeSettings.primaryColor"
                class="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                v-model="themeSettings.primaryColor"
                class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="#3B82F6"
              />
            </div>
          </div>

          <!-- Accent Color -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Accent Color
            </label>
            <div class="flex items-center gap-3">
              <input
                type="color"
                v-model="themeSettings.accentColor"
                class="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                v-model="themeSettings.accentColor"
                class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="#10B981"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Background Section -->
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Background
        </h3>
        
        <!-- Background Type -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Background Type
          </label>
          <div class="flex gap-4">
            <button
              @click="themeSettings.backgroundType = 'solid'"
              :class="[
                'px-4 py-2 rounded-md border transition-all',
                themeSettings.backgroundType === 'solid'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              ]"
            >
              Solid Color
            </button>
            <button
              @click="themeSettings.backgroundType = 'gradient'"
              :class="[
                'px-4 py-2 rounded-md border transition-all',
                themeSettings.backgroundType === 'gradient'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              ]"
            >
              Gradient
            </button>
          </div>
        </div>

        <!-- Solid Background Color -->
        <div v-if="themeSettings.backgroundType === 'solid'" class="mt-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Background Color (Light Mode)
          </label>
          <div class="flex items-center gap-3 mb-4">
            <input
              type="color"
              v-model="themeSettings.backgroundColor"
              class="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <input
              type="text"
              v-model="themeSettings.backgroundColor"
              class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="#F9FAFB"
            />
          </div>

          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Background Color (Dark Mode)
          </label>
          <div class="flex items-center gap-3">
            <input
              type="color"
              v-model="themeSettings.backgroundColorDark"
              class="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <input
              type="text"
              v-model="themeSettings.backgroundColorDark"
              class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="#111827"
            />
          </div>
        </div>

        <!-- Gradient Settings -->
        <div v-if="themeSettings.backgroundType === 'gradient'" class="space-y-4 mt-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gradient Start Color
            </label>
            <div class="flex items-center gap-3">
              <input
                type="color"
                v-model="themeSettings.gradientStart"
                class="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                v-model="themeSettings.gradientStart"
                class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="#3B82F6"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gradient End Color
            </label>
            <div class="flex items-center gap-3">
              <input
                type="color"
                v-model="themeSettings.gradientEnd"
                class="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                v-model="themeSettings.gradientEnd"
                class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="#8B5CF6"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gradient Direction
            </label>
            <select
              v-model="themeSettings.gradientDirection"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="to-r">Left to Right</option>
              <option value="to-l">Right to Left</option>
              <option value="to-b">Top to Bottom</option>
              <option value="to-t">Bottom to Top</option>
              <option value="to-br">Top Left to Bottom Right</option>
              <option value="to-bl">Top Right to Bottom Left</option>
              <option value="to-tr">Bottom Left to Top Right</option>
              <option value="to-tl">Bottom Right to Top Left</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Preview Section -->
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Preview
        </h3>
        <div
          class="h-32 rounded-lg border-2 border-gray-300 dark:border-gray-600 p-4 flex items-center justify-center"
          :style="previewStyle"
        >
          <div
            class="px-6 py-3 rounded-md shadow-md font-medium text-white"
            :style="{ backgroundColor: themeSettings.primaryColor }"
          >
            Primary Button
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          @click="resetToDefault"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Reset to Default
        </button>
        <button
          @click="applyChanges"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Apply Changes
        </button>
      </div>
    </div>

    <!-- Toast Notification -->
    <Teleport to="body">
      <div
        v-if="showToast"
        class="fixed top-4 right-4 z-[10000] transition-all duration-300"
        :class="toastType === 'success' ? 'bg-green-500' : 'bg-red-500'"
      >
        <div class="px-6 py-3 text-white rounded-lg shadow-lg">
          {{ toastMessage }}
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface ThemeSettings {
  primaryColor: string
  accentColor: string
  backgroundType: 'solid' | 'gradient'
  backgroundColor: string
  backgroundColorDark: string
  gradientStart: string
  gradientEnd: string
  gradientDirection: string
}

const defaultSettings: ThemeSettings = {
  primaryColor: '#3B82F6',
  accentColor: '#10B981',
  backgroundType: 'solid',
  backgroundColor: '#F9FAFB',
  backgroundColorDark: '#111827',
  gradientStart: '#3B82F6',
  gradientEnd: '#8B5CF6',
  gradientDirection: 'to-br'
}

const themeSettings = ref<ThemeSettings>({ ...defaultSettings })

// Toast notification
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

// Preview style
const previewStyle = computed(() => {
  if (themeSettings.value.backgroundType === 'solid') {
    const isDark = document.documentElement.classList.contains('dark')
    return {
      backgroundColor: isDark 
        ? themeSettings.value.backgroundColorDark 
        : themeSettings.value.backgroundColor
    }
  } else {
    return {
      background: `linear-gradient(${themeSettings.value.gradientDirection}, ${themeSettings.value.gradientStart}, ${themeSettings.value.gradientEnd})`
    }
  }
})

// Load saved settings
const loadSettings = () => {
  const saved = localStorage.getItem('themeCustomization')
  if (saved) {
    try {
      themeSettings.value = { ...defaultSettings, ...JSON.parse(saved) }
      applyTheme(themeSettings.value)
    } catch (e) {
      console.error('Failed to load theme settings:', e)
    }
  }
}

// Apply theme to document
const applyTheme = (settings: ThemeSettings) => {
  const root = document.documentElement

  // Apply CSS custom properties
  root.style.setProperty('--primary-color', settings.primaryColor)
  root.style.setProperty('--accent-color', settings.accentColor)
  
  if (settings.backgroundType === 'solid') {
    root.style.setProperty('--bg-color-light', settings.backgroundColor)
    root.style.setProperty('--bg-color-dark', settings.backgroundColorDark)
    root.style.removeProperty('--bg-gradient')
  } else {
    const gradient = `linear-gradient(${settings.gradientDirection}, ${settings.gradientStart}, ${settings.gradientEnd})`
    root.style.setProperty('--bg-gradient', gradient)
  }

  root.style.setProperty('--bg-type', settings.backgroundType)
}

// Apply changes
const applyChanges = () => {
  try {
    localStorage.setItem('themeCustomization', JSON.stringify(themeSettings.value))
    applyTheme(themeSettings.value)
    showToastMessage('Theme settings applied successfully!', 'success')
  } catch (e) {
    showToastMessage('Failed to apply theme settings', 'error')
    console.error('Failed to apply theme settings:', e)
  }
}

// Reset to default
const resetToDefault = () => {
  themeSettings.value = { ...defaultSettings }
  localStorage.removeItem('themeCustomization')
  applyTheme(defaultSettings)
  showToastMessage('Theme reset to default', 'success')
}

onMounted(() => {
  loadSettings()
})
</script>
