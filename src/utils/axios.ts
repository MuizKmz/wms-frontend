import axios from 'axios'

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add JWT token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user.token) {
          // Add token to Authorization header
          config.headers.Authorization = `Bearer ${user.token}`
          console.log('🔐 [Axios] Added JWT token to request:', config.url)
          console.log('🔐 [Axios] Token preview:', user.token.substring(0, 30) + '...')
        } else {
          console.error('❌ [Axios] User object exists but NO TOKEN!')
        }
      } catch (error) {
        console.error('❌ [Axios] Error parsing user from localStorage:', error)
      }
    } else {
      console.warn('⚠️ [Axios] No user token found in localStorage')
    }
    return config
  },
  (error) => {
    console.error('❌ [Axios] Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      const status = error.response.status

      // Handle 401 Unauthorized
      if (status === 401) {
        console.error('🚨 [Axios] 401 Unauthorized - Token invalid or expired')
        console.error('Clearing localStorage and redirecting to signin...')

        // Clear user data and redirect to login
        localStorage.clear()
        window.location.href = '/signin'
      }

      // Handle 403 Forbidden (no permission)
      if (status === 403) {
        console.error('🚫 [Axios] 403 Forbidden - Insufficient permissions')
        console.error('Response:', error.response.data)
      }

      // Handle 404 Not Found
      if (status === 404) {
        console.error('❌ [Axios] 404 Not Found:', error.config?.url)
      }

      // Handle 500 Server Error
      if (status === 500) {
        console.error('💥 [Axios] 500 Server Error:', error.response.data)
      }
    } else if (error.request) {
      console.error('📡 [Axios] No response received from server:', error.request)
    } else {
      console.error('❌ [Axios] Error setting up request:', error.message)
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
