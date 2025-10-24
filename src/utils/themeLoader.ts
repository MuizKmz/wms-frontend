/**
 * Theme Loader - Load and apply company-wide theme settings from API
 * This runs once on app startup to fetch theme settings from backend
 */

import { loadThemeSettings } from '@/services/themeService'

/**
 * Load theme settings from API and apply them
 */
export async function initializeTheme() {
  try {
    console.log('🎨 [ThemeLoader] Loading theme settings from API...')
    
    // Try to load from API
    const settings = await loadThemeSettings()
    
    if (settings) {
      console.log('✅ [ThemeLoader] Theme settings loaded from API:', {
        hasLogo: !!settings.logoUrl,
        hasBackground: !!settings.backgroundImageUrl,
        companyName: settings.companyName
      })
      
      // Save to localStorage for quick access
      localStorage.setItem('themeCustomization', JSON.stringify(settings))
      
      // Apply theme settings
      applyThemeSettings(settings)
      
      // Trigger theme changed event
      window.dispatchEvent(new CustomEvent('themeChanged'))
      
      console.log('✅ [ThemeLoader] Theme settings applied successfully')
    } else {
      console.log('ℹ️ [ThemeLoader] No theme settings found in API, using defaults or localStorage')
      
      // Try to load from localStorage as fallback
      const savedSettings = localStorage.getItem('themeCustomization')
      if (savedSettings) {
        const localSettings = JSON.parse(savedSettings)
        applyThemeSettings(localSettings)
      }
    }
  } catch (error) {
    console.error('❌ [ThemeLoader] Failed to load theme settings from API:', error)
    
    // Fallback to localStorage
    try {
      const savedSettings = localStorage.getItem('themeCustomization')
      if (savedSettings) {
        console.log('ℹ️ [ThemeLoader] Using theme settings from localStorage')
        const localSettings = JSON.parse(savedSettings)
        applyThemeSettings(localSettings)
      }
    } catch (e) {
      console.error('❌ [ThemeLoader] Failed to load theme from localStorage:', e)
    }
  }
}

/**
 * Apply theme settings to the document
 */
function applyThemeSettings(settings: any) {
  const root = document.documentElement
  const isDark = root.classList.contains('dark')

  // Calculate text colors
  const sidebarTextColor = getTextColor(settings.sidebarColor || '#0f172a')
  const headerTextColor = getTextColor(settings.headerColor || '#ffffff')
  const footerTextColor = getTextColor(settings.footerColor || '#ffffff')

  // Set primary color for buttons, tabs, and other brand elements
  root.style.setProperty('--primary-color', settings.sidebarColor || '#0f172a')

  // Apply colors (dark mode overrides)
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
  root.style.setProperty('--bg-type', settings.backgroundType || 'solid')
  
  if (settings.backgroundType === 'image') {
    root.style.setProperty('--bg-image-url', settings.backgroundImageUrl || '')
    root.style.setProperty('--bg-image-url-dark', settings.backgroundImageUrlDark || settings.backgroundImageUrl || '')
    root.style.setProperty('--bg-size', settings.backgroundSize || 'cover')
    root.style.setProperty('--bg-position', settings.backgroundPosition || 'center')
    root.style.setProperty('--bg-repeat', settings.backgroundRepeat || 'no-repeat')
    root.style.setProperty('--bg-opacity', ((settings.backgroundOpacity || 100) / 100).toString())
  } else {
    root.style.setProperty('--bg-color-light', settings.backgroundColor || '#F9FAFB')
    root.style.setProperty('--bg-color-dark', settings.backgroundColorDark || '#111827')
  }

  // Logo and branding
  root.style.setProperty('--logo-url', settings.logoUrl || '')
  root.style.setProperty('--company-name', settings.companyName || 'WMS Console')
}

/**
 * Calculate text color based on background luminance
 */
function getTextColor(bgColor: string): string {
  const luminance = getLuminance(bgColor)
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

/**
 * Calculate luminance of a hex color
 */
function getLuminance(hexColor: string): number {
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
