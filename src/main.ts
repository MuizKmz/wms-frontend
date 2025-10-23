import './assets/main.css'
import './assets/theme.css'
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
import { initializeTheme } from './utils/themeLoader'

const app = createApp(App)

app.use(router)
app.use(VueApexCharts)

app.mount('#app')

// Initialize theme after app is mounted
// This will load theme from API if user is authenticated
router.isReady().then(() => {
  const token = localStorage.getItem('token')
  if (token) {
    // User is authenticated, load theme from API
    initializeTheme()
  } else {
    // User not authenticated, just load from localStorage if available
    console.log('ℹ️ [Main] User not authenticated, skipping API theme load')
  }
})
