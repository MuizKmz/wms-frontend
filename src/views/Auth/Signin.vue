<template>
  <FullScreenLayout>
    <div class="min-h-screen bg-white flex flex-col">
      <!-- Navigation Header -->
      <div class="w-full z-50 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <router-link
          to="/"
          class="flex items-center cursor-pointer hover:opacity-80 transition transform hover:scale-105 duration-200"
        >
          <h2 class="text-4xl font-bold text-gray-900">WMS</h2>
        </router-link>

        <router-link
          to="/"
          class="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-all duration-200 rounded-lg hover:bg-blue-50 transform hover:scale-105"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          <span>Home</span>
        </router-link>
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex">
        <!-- Left Side - Sign In Form -->
        <div class="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div class="w-full max-w-md">
            <!-- Sign In Box -->
            <div class="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <div class="mb-8">
                <h1 class="text-4xl font-bold text-gray-900 mb-2">Sign In</h1>
                <p class="text-gray-600">Enter your email and password to sign in!</p>
              </div>

              <!-- Error Message -->
              <div
                v-if="errorMessage"
                class="p-4 mb-6 text-sm text-red-800 bg-red-100 border border-red-200 rounded-lg"
              >
                {{ errorMessage }}
              </div>

              <form @submit.prevent="handleSubmit">
                <div class="space-y-5">
                  <!-- Email -->
                  <div>
                    <label
                      for="email"
                      class="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Email<span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="email"
                      type="email"
                      id="email"
                      name="email"
                      placeholder="info@gmail.com"
                      required
                      :disabled="isLoading"
                      class="h-12 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    />
                  </div>

                  <!-- Password -->
                  <div>
                    <label
                      for="password"
                      class="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Password<span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                      <input
                        v-model="password"
                        :type="showPassword ? 'text' : 'password'"
                        id="password"
                        placeholder="Enter your password"
                        required
                        :disabled="isLoading"
                        class="h-12 w-full rounded-lg border border-gray-300 bg-white py-3 pl-4 pr-12 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      />
                      <button
                        type="button"
                        @click="togglePasswordVisibility"
                        :disabled="isLoading"
                        class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg
                          v-if="!showPassword"
                          class="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M10.0002 13.8619C7.23361 13.8619 4.86803 12.1372 3.92328 9.70241C4.86804 7.26761 7.23361 5.54297 10.0002 5.54297C12.7667 5.54297 15.1323 7.26762 16.0771 9.70243C15.1323 12.1372 12.7667 13.8619 10.0002 13.8619ZM10.0002 4.04297C6.48191 4.04297 3.49489 6.30917 2.4155 9.4593C2.3615 9.61687 2.3615 9.78794 2.41549 9.94552C3.49488 13.0957 6.48191 15.3619 10.0002 15.3619C13.5184 15.3619 16.5055 13.0957 17.5849 9.94555C17.6389 9.78797 17.6389 9.6169 17.5849 9.45932C16.5055 6.30919 13.5184 4.04297 10.0002 4.04297ZM9.99151 7.84413C8.96527 7.84413 8.13333 8.67606 8.13333 9.70231C8.13333 10.7286 8.96527 11.5605 9.99151 11.5605H10.0064C11.0326 11.5605 11.8646 10.7286 11.8646 9.70231C11.8646 8.67606 11.0326 7.84413 10.0064 7.84413H9.99151Z"
                            clip-rule="evenodd"
                          />
                        </svg>
                        <svg
                          v-else
                          class="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M4.63803 3.57709C4.34513 3.2842 3.87026 3.2842 3.57737 3.57709C3.28447 3.86999 3.28447 4.34486 3.57737 4.63775L4.85323 5.91362C3.74609 6.84199 2.89363 8.06395 2.4155 9.45936C2.3615 9.61694 2.3615 9.78801 2.41549 9.94558C3.49488 13.0957 6.48191 15.3619 10.0002 15.3619C11.255 15.3619 12.4422 15.0737 13.4994 14.5598L15.3625 16.4229C15.6554 16.7158 16.1302 16.7158 16.4231 16.4229C16.716 16.13 16.716 15.6551 16.4231 15.3622L4.63803 3.57709ZM12.3608 13.4212L10.4475 11.5079C10.3061 11.5423 10.1584 11.5606 10.0064 11.5606H9.99151C8.96527 11.5606 8.13333 10.7286 8.13333 9.70237C8.13333 9.5461 8.15262 9.39434 8.18895 9.24933L5.91885 6.97923C5.03505 7.69015 4.34057 8.62704 3.92328 9.70247C4.86803 12.1373 7.23361 13.8619 10.0002 13.8619C10.8326 13.8619 11.6287 13.7058 12.3608 13.4212ZM16.0771 9.70249C15.7843 10.4569 15.3552 11.1432 14.8199 11.7311L15.8813 12.7925C16.6329 11.9813 17.2187 11.0143 17.5849 9.94561C17.6389 9.78803 17.6389 9.61696 17.5849 9.45938C16.5055 6.30925 13.5184 4.04303 10.0002 4.04303C9.13525 4.04303 8.30244 4.17999 7.52218 4.43338L8.75139 5.66259C9.1556 5.58413 9.57311 5.54303 10.0002 5.54303C12.7667 5.54303 15.1323 7.26768 16.0771 9.70249Z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- Checkbox and Forgot Password -->
                  <div class="flex items-center justify-between">
                    <label
                      for="keepLoggedIn"
                      class="flex items-center text-sm text-gray-700 cursor-pointer select-none"
                    >
                      <input
                        v-model="keepLoggedIn"
                        type="checkbox"
                        id="keepLoggedIn"
                        :disabled="isLoading"
                        class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span class="ml-2">Keep me logged in</span>
                    </label>

                    <router-link
                      to="/reset-password"
                      class="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Forgot password?
                    </router-link>
                  </div>

                  <!-- Submit Button -->
                  <div>
                    <button
                      type="submit"
                      :disabled="isLoading"
                      class="flex items-center justify-center w-full h-12 px-6 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <svg
                        v-if="isLoading"
                        class="w-5 h-5 mr-2 text-white animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                        ></circle>
                        <path
                          class="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {{ isLoading ? 'Signing in...' : 'Sign In' }}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Right Side - Logo Panel with Hemisphere Background -->
        <div class="hidden lg:flex w-1/2 relative bg-gradient-to-br from-blue-600 to-indigo-700 items-center justify-center overflow-hidden">
          <!-- Decorative Background Elements -->
          <div class="absolute inset-0 overflow-hidden">
            <!-- Large semi-circle top right -->
            <div class="absolute -top-48 -right-48 w-96 h-96 bg-white/10 rounded-full"></div>
            <!-- Large semi-circle bottom left -->
            <div class="absolute -bottom-32 -left-32 w-80 h-80 bg-white/10 rounded-full"></div>
            <!-- Medium circle -->
            <div class="absolute top-1/4 left-1/4 w-32 h-32 bg-white/5 rounded-full"></div>
            <!-- Small circle -->
            <div class="absolute bottom-1/3 right-1/4 w-24 h-24 bg-white/5 rounded-full"></div>
          </div>

          <!-- Content Container with Semi-Sphere Shape -->
          <div class="relative z-10 flex flex-col items-center justify-center">
            <!-- Semi-Sphere Container -->
            <div class="relative flex flex-col items-center justify-center px-16 py-20 bg-white/10 backdrop-blur-sm border-2 border-white/20 shadow-2xl overflow-hidden" style="border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;">
              <!-- Logo -->
              <div class="mb-6">
                <svg class="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>

              <!-- Text -->
              <div class="text-center max-w-sm">
                <h2 class="text-3xl font-bold text-white mb-3">WMS</h2>
                <p class="text-white/90 text-lg font-medium leading-relaxed">
                  Warehouse Management System Dashboard
                </p>
              </div>
            </div>

            <!-- Additional Decorative Elements -->
            <div class="absolute top-8 right-8 w-16 h-16 border-2 border-white/30 rounded-full animate-pulse"></div>
            <div class="absolute bottom-12 left-12 w-12 h-12 border-2 border-white/30 rounded-full animate-pulse" style="animation-delay: 1s;"></div>
          </div>
        </div>
      </div>
    </div>
  </FullScreenLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FullScreenLayout from '@/components/layout/FullScreenLayout.vue'
import router from '@/router'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const keepLoggedIn = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

// Logo path
const logoPath = 'public/images/logo/logo-icon.svg'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

const togglePasswordVisibility = () => {
  if (!isLoading.value) {
    showPassword.value = !showPassword.value
  }
}

const handleSubmit = async () => {
  errorMessage.value = ''
  isLoading.value = true

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
        keepLoggedIn: keepLoggedIn.value,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Backend error:', data)
      throw new Error(data.message || 'Login failed. Please check your credentials.')
    }

    console.log('✅ Login successful! Response:', data)

    const preservedKeys = ['themeCustomization', 'dashboard-charts-layout', 'theme']
    const preservedData: Record<string, string> = {}

    preservedKeys.forEach(key => {
      const value = localStorage.getItem(key)
      if (value) {
        preservedData[key] = value
      }
    })

    localStorage.clear()
    console.log('🧹 [Signin] Cleared old authentication data')

    Object.keys(preservedData).forEach(key => {
      localStorage.setItem(key, preservedData[key])
    })
    console.log('✅ [Signin] Restored theme and dashboard settings')

    if (data.token) {
      localStorage.setItem('token', data.token)
      console.log('✅ Token stored in localStorage')
    }

    if (data.user) {
      const userWithToken = { ...data.user, token: data.token }
      localStorage.setItem('user', JSON.stringify(userWithToken))
      console.log('✅ User stored in localStorage (with token):', userWithToken)
    }

    console.log('🚀 Redirecting to dashboard...')
    router.push({ name: 'Dashboard' })
  } catch (error) {
    if (error instanceof TypeError) {
      errorMessage.value = 'Network or CORS error. Verify server is running and this origin is allowed.'
      console.error('CORS/network error:', error)
    } else {
      console.error('Login error:', error)
      errorMessage.value = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Interactive circles - can receive hover but not clickable */
.interactive-circle {
  pointer-events: auto;
  cursor: default;
}

@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
