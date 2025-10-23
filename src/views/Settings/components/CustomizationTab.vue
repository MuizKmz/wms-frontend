<template>
  <div>
    <div class="space-y-6">
      <!-- Theme Colors Section -->
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Theme Color
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Select a theme color. The sidebar, header, and footer colors will automatically adapt with appropriate text colors for optimal readability.
        </p>
        
        <!-- Predefined Theme Colors -->
        <div class="flex flex-wrap gap-3 mb-4">
          <button
            v-for="theme in predefinedThemes"
            :key="theme.name"
            @click="selectTheme(theme)"
            :title="theme.name"
            :class="[
              'w-10 h-10 rounded-full border-2 transition-all hover:scale-110',
              themeSettings.primaryColor === theme.color
                ? 'border-gray-900 dark:border-white ring-2 ring-offset-2 ring-blue-500'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            ]"
            :style="{ backgroundColor: theme.color }"
          />
        </div>

        <!-- Individual Component Colors -->
        <div class="space-y-4 mt-6">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white">
            Component Colors (Light Mode)
          </h4>
          
          <!-- Sidebar Color -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sidebar Color
            </label>
            <div class="flex items-center gap-3">
              <input
                type="color"
                v-model="themeSettings.sidebarColor"
                @input="onColorChange"
                class="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                v-model="themeSettings.sidebarColor"
                @input="onColorChange"
                class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="#0f172a"
              />
            </div>
          </div>

          <!-- Header Color -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Header Color
            </label>
            <div class="flex items-center gap-3">
              <input
                type="color"
                v-model="themeSettings.headerColor"
                @input="onColorChange"
                class="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                v-model="themeSettings.headerColor"
                @input="onColorChange"
                class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="#0f172a"
              />
            </div>
          </div>

          <!-- Footer Color -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Footer Color
            </label>
            <div class="flex items-center gap-3">
              <input
                type="color"
                v-model="themeSettings.footerColor"
                @input="onColorChange"
                class="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                v-model="themeSettings.footerColor"
                @input="onColorChange"
                class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="#f9fafb"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Logo & Branding Section -->
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Logo & Branding
        </h3>
        
        <div class="space-y-4">
          <!-- Company Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Name
            </label>
            <input
              type="text"
              v-model="themeSettings.companyName"
              @input="onColorChange"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="WMS Console"
            />
          </div>

          <!-- Logo Upload -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Logo
            </label>
            <div class="space-y-3">
              <!-- Logo Preview -->
              <div v-if="themeSettings.logoUrl" class="relative w-32 h-32 rounded-lg border-2 border-gray-300 dark:border-gray-600 overflow-hidden bg-white p-2">
                <img :src="themeSettings.logoUrl" alt="Logo preview" class="w-full h-full object-contain" />
                <button
                  @click="removeLogo"
                  class="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <!-- File Upload -->
              <div class="flex items-center gap-3">
                <label class="flex-1 cursor-pointer">
                  <div class="px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-center">
                    <span class="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload logo
                    </span>
                  </div>
                  <input
                    type="file"
                    @change="handleLogoUpload"
                    accept="image/*"
                    class="hidden"
                  />
                </label>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Recommended: Square image, max 2MB (PNG, JPG, SVG)
              </p>
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
              @click="themeSettings.backgroundType = 'image'"
              :class="[
                'px-4 py-2 rounded-md border transition-all',
                themeSettings.backgroundType === 'image'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              ]"
            >
              Background Image
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

        <!-- Background Image Settings -->
        <div v-if="themeSettings.backgroundType === 'image'" class="space-y-4 mt-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Background Image (Light Mode)
            </label>
            <div class="space-y-3">
              <!-- Image Preview -->
              <div v-if="themeSettings.backgroundImageUrl" class="relative w-full h-32 rounded-lg border-2 border-gray-300 dark:border-gray-600 overflow-hidden">
                <img :src="themeSettings.backgroundImageUrl" alt="Background preview" class="w-full h-full object-cover" />
                <button
                  @click="removeBackgroundImage('light')"
                  class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <!-- File Upload -->
              <div class="flex items-center gap-3">
                <label class="flex-1 cursor-pointer">
                  <div class="px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-center">
                    <span class="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload or drag and drop
                    </span>
                  </div>
                  <input
                    type="file"
                    @change="handleImageUpload($event, 'light')"
                    accept="image/*"
                    class="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Background Image (Dark Mode)
            </label>
            <div class="space-y-3">
              <!-- Image Preview -->
              <div v-if="themeSettings.backgroundImageUrlDark" class="relative w-full h-32 rounded-lg border-2 border-gray-300 dark:border-gray-600 overflow-hidden">
                <img :src="themeSettings.backgroundImageUrlDark" alt="Background preview dark" class="w-full h-full object-cover" />
                <button
                  @click="removeBackgroundImage('dark')"
                  class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <!-- File Upload -->
              <div class="flex items-center gap-3">
                <label class="flex-1 cursor-pointer">
                  <div class="px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-center">
                    <span class="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload or drag and drop
                    </span>
                  </div>
                  <input
                    type="file"
                    @change="handleImageUpload($event, 'dark')"
                    accept="image/*"
                    class="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Background Size
            </label>
            <select
              v-model="themeSettings.backgroundSize"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="cover">Cover (Fill entire area)</option>
              <option value="contain">Contain (Fit within area)</option>
              <option value="auto">Auto (Original size)</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Background Position
            </label>
            <select
              v-model="themeSettings.backgroundPosition"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="center">Center</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="top left">Top Left</option>
              <option value="top right">Top Right</option>
              <option value="bottom left">Bottom Left</option>
              <option value="bottom right">Bottom Right</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Background Repeat
            </label>
            <select
              v-model="themeSettings.backgroundRepeat"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="no-repeat">No Repeat</option>
              <option value="repeat">Repeat</option>
              <option value="repeat-x">Repeat Horizontally</option>
              <option value="repeat-y">Repeat Vertically</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Background Opacity (0-100)
            </label>
            <div class="flex items-center gap-3">
              <input
                type="range"
                v-model.number="themeSettings.backgroundOpacity"
                min="0"
                max="100"
                class="flex-1"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300 w-12 text-right">
                {{ themeSettings.backgroundOpacity }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview Section -->
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Preview
        </h3>
        <div
          class="rounded-lg border-2 border-gray-300 dark:border-gray-600 overflow-hidden"
        >
          <!-- Header Preview -->
          <div
            class="h-16 px-6 flex items-center justify-between"
            :style="{ backgroundColor: themeSettings.headerColor, color: getTextColor(themeSettings.headerColor) }"
          >
            <span class="font-semibold">Header</span>
            <div class="flex gap-4">
              <span>Menu 1</span>
              <span>Menu 2</span>
            </div>
          </div>

          <!-- Content Preview -->
          <div
            class="h-48 p-6 flex items-center justify-center relative"
            :style="previewStyle"
          >
            <!-- Sidebar Preview -->
            <div
              class="absolute left-0 top-0 bottom-0 w-20"
              :style="{ backgroundColor: themeSettings.sidebarColor, color: getTextColor(themeSettings.sidebarColor) }"
            >
              <div class="p-2 text-xs text-center mt-4">Sidebar</div>
            </div>

            <!-- Main Content -->
            <div class="ml-20 flex-1 flex items-center justify-center">
              <div class="text-gray-600 dark:text-gray-300">
                Main Content Area
              </div>
            </div>
          </div>

          <!-- Footer Preview -->
          <div
            class="h-12 px-6 flex items-center justify-center"
            :style="{ backgroundColor: themeSettings.footerColor, color: getTextColor(themeSettings.footerColor) }"
          >
            <span class="text-sm">Footer © 2025</span>
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
import { saveThemeSettings, uploadLogo, uploadBackgroundImage, deleteImage } from '@/services/themeService'

interface ThemeSettings {
  primaryColor: string
  sidebarColor: string
  headerColor: string
  footerColor: string
  backgroundType: 'solid' | 'image'
  backgroundColor: string
  backgroundColorDark: string
  backgroundImageUrl: string
  backgroundImageUrlDark: string
  backgroundSize: string
  backgroundPosition: string
  backgroundRepeat: string
  backgroundOpacity: number
  logoUrl: string
  companyName: string
}

interface PredefinedTheme {
  name: string
  color: string
  textColor: string
}

const predefinedThemes: PredefinedTheme[] = [
  { name: 'Blue', color: '#3B82F6', textColor: '#FFFFFF' },
  { name: 'Indigo', color: '#6366F1', textColor: '#FFFFFF' },
  { name: 'Purple', color: '#8B5CF6', textColor: '#FFFFFF' },
  { name: 'Pink', color: '#EC4899', textColor: '#FFFFFF' },
  { name: 'Red', color: '#EF4444', textColor: '#FFFFFF' },
  { name: 'Orange', color: '#F97316', textColor: '#FFFFFF' },
  { name: 'Amber', color: '#F59E0B', textColor: '#000000' },
  { name: 'Yellow', color: '#EAB308', textColor: '#000000' },
  { name: 'Lime', color: '#84CC16', textColor: '#000000' },
  { name: 'Green', color: '#10B981', textColor: '#FFFFFF' },
  { name: 'Emerald', color: '#059669', textColor: '#FFFFFF' },
  { name: 'Teal', color: '#14B8A6', textColor: '#FFFFFF' },
  { name: 'Cyan', color: '#06B6D4', textColor: '#000000' },
  { name: 'Sky', color: '#0EA5E9', textColor: '#FFFFFF' },
  { name: 'Slate', color: '#64748B', textColor: '#FFFFFF' },
  { name: 'Gray', color: '#6B7280', textColor: '#FFFFFF' },
  { name: 'Zinc', color: '#71717A', textColor: '#FFFFFF' },
  { name: 'Stone', color: '#78716C', textColor: '#FFFFFF' }
]

const defaultSettings: ThemeSettings = {
  primaryColor: '#0f172a',
  sidebarColor: '#0f172a',
  headerColor: '#ffffff',
  footerColor: '#ffffff',
  backgroundType: 'solid',
  backgroundColor: '#F9FAFB',
  backgroundColorDark: '#111827',
  backgroundImageUrl: '',
  backgroundImageUrlDark: '',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundOpacity: 100,
  logoUrl: '',
  companyName: 'WMS Console'
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

// Helper function to get text color for any background
const getTextColor = (bgColor: string): string => {
  const luminance = getLuminance(bgColor)
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

// Preview style
const previewStyle = computed(() => {
  const isDark = document.documentElement.classList.contains('dark')
  
  if (themeSettings.value.backgroundType === 'solid') {
    return {
      backgroundColor: isDark 
        ? themeSettings.value.backgroundColorDark 
        : themeSettings.value.backgroundColor
    }
  } else {
    const imageUrl = isDark 
      ? themeSettings.value.backgroundImageUrlDark || themeSettings.value.backgroundImageUrl
      : themeSettings.value.backgroundImageUrl
    
    if (!imageUrl) {
      return {
        backgroundColor: isDark ? '#111827' : '#F9FAFB'
      }
    }

    const opacity = themeSettings.value.backgroundOpacity / 100
    return {
      backgroundImage: `linear-gradient(rgba(255, 255, 255, ${1 - opacity}), rgba(255, 255, 255, ${1 - opacity})), url(${imageUrl})`,
      backgroundSize: themeSettings.value.backgroundSize,
      backgroundPosition: themeSettings.value.backgroundPosition,
      backgroundRepeat: themeSettings.value.backgroundRepeat
    }
  }
})

// Select predefined theme
const selectTheme = (theme: PredefinedTheme) => {
  themeSettings.value.sidebarColor = theme.color
  themeSettings.value.headerColor = theme.color
  // Keep footer light for contrast
  const luminance = getLuminance(theme.color)
  if (luminance < 0.5) {
    themeSettings.value.footerColor = '#f9fafb'
  } else {
    themeSettings.value.footerColor = theme.color
  }
}

// Handle color change - auto refresh
const onColorChange = () => {
  applyTheme(themeSettings.value)
}

// Handle image upload
const handleImageUpload = (event: Event, mode: 'light' | 'dark') => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    showToastMessage('Please upload an image file', 'error')
    return
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToastMessage('Image size should be less than 5MB', 'error')
    return
  }

  // Read file as data URL
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    if (mode === 'light') {
      themeSettings.value.backgroundImageUrl = result
    } else {
      themeSettings.value.backgroundImageUrlDark = result
    }
  }
  reader.readAsDataURL(file)
}

// Remove background image
const removeBackgroundImage = (mode: 'light' | 'dark') => {
  if (mode === 'light') {
    themeSettings.value.backgroundImageUrl = ''
  } else {
    themeSettings.value.backgroundImageUrlDark = ''
  }
}

// Handle logo upload
const handleLogoUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    showToastMessage('Please upload an image file', 'error')
    return
  }

  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    showToastMessage('Logo size should be less than 2MB', 'error')
    return
  }

  // Read file as data URL
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    themeSettings.value.logoUrl = result
    onColorChange()
  }
  reader.readAsDataURL(file)
}

// Remove logo
const removeLogo = () => {
  themeSettings.value.logoUrl = ''
  onColorChange()
}

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
  const isDark = root.classList.contains('dark')

  // Calculate text colors for each component
  const sidebarTextColor = getTextColor(settings.sidebarColor)
  const headerTextColor = getTextColor(settings.headerColor)
  const footerTextColor = getTextColor(settings.footerColor)

  // In dark mode, use dark variants for sidebar, header, footer
  if (isDark) {
    root.style.setProperty('--sidebar-color', '#1e293b')
    root.style.setProperty('--sidebar-text-color', '#ffffff')
    root.style.setProperty('--header-color', '#1e293b')
    root.style.setProperty('--header-text-color', '#ffffff')
    root.style.setProperty('--footer-color', '#1e293b')
    root.style.setProperty('--footer-text-color', '#ffffff')
  } else {
    // Light mode - use user selected colors
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
  
  // Logo and branding
  root.style.setProperty('--logo-url', settings.logoUrl || '')
  root.style.setProperty('--company-name', settings.companyName || 'WMS Console')
  
  // Trigger a custom event to notify components
  window.dispatchEvent(new CustomEvent('themeChanged'))
}

// Apply changes
const applyChanges = async () => {
  try {
    // First save locally
    localStorage.setItem('themeCustomization', JSON.stringify(themeSettings.value))
    applyTheme(themeSettings.value)
    
    // Then save to API (company-wide settings)
    try {
      await saveThemeSettings(themeSettings.value)
      showToastMessage('Theme settings applied successfully for all users!', 'success')
    } catch (apiError) {
      console.error('Failed to save to API:', apiError)
      showToastMessage('Theme applied locally, but failed to save to server. Changes may not persist for other users.', 'error')
    }
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

// Watch for theme changes to update preview
const updatePreview = () => {
  // Force reactivity update
  const temp = { ...themeSettings.value }
  themeSettings.value = temp
}

onMounted(() => {
  loadSettings()
  
  // Watch for dark mode toggle
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        updatePreview()
      }
    })
  })
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})
</script>
