import './assets/main.css'
// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'jsvectormap/dist/jsvectormap.css'
import 'flatpickr/dist/flatpickr.css'
//import 'iconify-icon'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueApexCharts from 'vue3-apexcharts'

// Load theme customization on startup
const loadThemeCustomization = () => {
  const saved = localStorage.getItem('themeCustomization')
  if (saved) {
    try {
      const settings = JSON.parse(saved)
      const root = document.documentElement

      root.style.setProperty('--primary-color', settings.primaryColor || '#3B82F6')
      root.style.setProperty('--accent-color', settings.accentColor || '#10B981')
      
      if (settings.backgroundType === 'solid') {
        root.style.setProperty('--bg-color-light', settings.backgroundColor || '#F9FAFB')
        root.style.setProperty('--bg-color-dark', settings.backgroundColorDark || '#111827')
        root.style.removeProperty('--bg-gradient')
      } else if (settings.backgroundType === 'gradient') {
        const gradient = `linear-gradient(${settings.gradientDirection || 'to-br'}, ${settings.gradientStart || '#3B82F6'}, ${settings.gradientEnd || '#8B5CF6'})`
        root.style.setProperty('--bg-gradient', gradient)
      }

      root.style.setProperty('--bg-type', settings.backgroundType || 'solid')
    } catch (e) {
      console.error('Failed to load theme customization:', e)
    }
  }
}

loadThemeCustomization()

const app = createApp(App)

app.use(router)
app.use(VueApexCharts)

app.mount('#app')
