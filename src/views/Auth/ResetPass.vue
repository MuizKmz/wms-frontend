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
          to="/signin"
          class="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-all duration-200 rounded-lg hover:bg-blue-50 transform hover:scale-105"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
          </svg>
          <span>Back to Sign In</span>
        </router-link>
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex">
        <!-- Left Side - Reset Password Form -->
        <div class="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div class="w-full max-w-md">
            <!-- Reset Password Box -->
            <div class="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              
              <!-- Step 1: Request Reset -->
              <div v-if="currentStep === 'request'" key="request">
                <div class="mb-8">
                  <h1 class="text-4xl font-bold text-gray-900 mb-2">Reset Password</h1>
                  <p class="text-gray-600">Enter your email address and we'll send you a verification code to reset your password.</p>
                </div>

                <!-- Error Message -->
                <div
                  v-if="errorMessage"
                  class="p-4 mb-6 text-sm text-red-800 bg-red-100 border border-red-200 rounded-lg flex items-start"
                >
                  <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                  </svg>
                  <span>{{ errorMessage }}</span>
                </div>

                <form @submit.prevent="handleRequestReset">
                  <div class="space-y-5">
                    <!-- Email -->
                    <div>
                      <label
                        for="email"
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Email Address<span class="text-red-500">*</span>
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
                        {{ isLoading ? 'Sending...' : 'Send Verification Code' }}
                      </button>
                    </div>

                    <!-- Back to Sign In Link -->
                    <div class="text-center">
                      <router-link
                        to="/signin"
                        class="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
                      >
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        Back to Sign In
                      </router-link>
                    </div>
                  </div>
                </form>
              </div>

              <!-- Step 2: Verify Code -->
              <div v-else-if="currentStep === 'verify'" key="verify">
                <div class="mb-8">
                  <h1 class="text-4xl font-bold text-gray-900 mb-2">Verify Code</h1>
                  <p class="text-gray-600">We've sent a verification code to <strong>{{ email }}</strong>. Please enter it below.</p>
                </div>

                <!-- Error Message -->
                <div
                  v-if="errorMessage"
                  class="p-4 mb-6 text-sm text-red-800 bg-red-100 border border-red-200 rounded-lg flex items-start"
                >
                  <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                  </svg>
                  <span>{{ errorMessage }}</span>
                </div>

                <form @submit.prevent="handleVerifyCode">
                  <div class="space-y-5">
                    <!-- Verification Code -->
                    <div>
                      <label
                        for="code"
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Verification Code<span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="verificationCode"
                        type="text"
                        id="code"
                        name="code"
                        placeholder="Enter 6-digit code"
                        required
                        maxlength="6"
                        :disabled="isLoading"
                        class="h-12 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition text-center text-2xl tracking-widest"
                      />
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
                        {{ isLoading ? 'Verifying...' : 'Verify Code' }}
                      </button>
                    </div>

                    <!-- Resend Code -->
                    <div class="text-center">
                      <button
                        type="button"
                        @click="handleResendCode"
                        :disabled="isLoading || resendCooldown > 0"
                        class="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {{ resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code' }}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <!-- Step 3: Reset Password -->
              <div v-else-if="currentStep === 'reset'" key="reset">
                <div class="mb-8">
                  <h1 class="text-4xl font-bold text-gray-900 mb-2">Create New Password</h1>
                  <p class="text-gray-600">Please enter your new password below.</p>
                </div>

                <!-- Error Message -->
                <div
                  v-if="errorMessage"
                  class="p-4 mb-6 text-sm text-red-800 bg-red-100 border border-red-200 rounded-lg flex items-start"
                >
                  <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                  </svg>
                  <span>{{ errorMessage }}</span>
                </div>

                <form @submit.prevent="handleResetPassword">
                  <div class="space-y-5">
                    <!-- New Password -->
                    <div>
                      <label
                        for="newPassword"
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >
                        New Password<span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <input
                          v-model="newPassword"
                          :type="showNewPassword ? 'text' : 'password'"
                          id="newPassword"
                          name="newPassword"
                          placeholder="Enter new password"
                          required
                          :disabled="isLoading"
                          class="h-12 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        />
                        <button
                          type="button"
                          @click="showNewPassword = !showNewPassword"
                          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <svg v-if="!showNewPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                          </svg>
                        </button>
                      </div>
                      <!-- Password Strength Indicator -->
                      <div class="mt-2">
                        <div class="flex gap-1 mb-1">
                          <div v-for="i in 4" :key="i" class="h-1 flex-1 rounded-full transition-colors"
                            :class="passwordStrength >= i ? getStrengthColor(passwordStrength) : 'bg-gray-200'">
                          </div>
                        </div>
                        <p class="text-xs" :class="getStrengthTextColor(passwordStrength)">
                          {{ getStrengthText(passwordStrength) }}
                        </p>
                      </div>
                    </div>

                    <!-- Confirm Password -->
                    <div>
                      <label
                        for="confirmPassword"
                        class="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Confirm Password<span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <input
                          v-model="confirmPassword"
                          :type="showConfirmPassword ? 'text' : 'password'"
                          id="confirmPassword"
                          name="confirmPassword"
                          placeholder="Confirm new password"
                          required
                          :disabled="isLoading"
                          class="h-12 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        />
                        <button
                          type="button"
                          @click="showConfirmPassword = !showConfirmPassword"
                          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <svg v-if="!showConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                          </svg>
                        </button>
                      </div>
                      <p v-if="confirmPassword && newPassword !== confirmPassword" class="mt-1 text-xs text-red-600">
                        Passwords do not match
                      </p>
                    </div>

                    <!-- Password Requirements -->
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p class="text-xs font-medium text-blue-900 mb-2">Password must contain:</p>
                      <ul class="space-y-1 text-xs text-blue-800">
                        <li class="flex items-center" :class="newPassword.length >= 8 ? 'text-green-600' : ''">
                          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                          </svg>
                          At least 8 characters
                        </li>
                        <li class="flex items-center" :class="/[A-Z]/.test(newPassword) ? 'text-green-600' : ''">
                          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                          </svg>
                          One uppercase letter
                        </li>
                        <li class="flex items-center" :class="/[a-z]/.test(newPassword) ? 'text-green-600' : ''">
                          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                          </svg>
                          One lowercase letter
                        </li>
                        <li class="flex items-center" :class="/[0-9]/.test(newPassword) ? 'text-green-600' : ''">
                          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                          </svg>
                          One number
                        </li>
                        <li class="flex items-center" :class="/[!@#$%^&*]/.test(newPassword) ? 'text-green-600' : ''">
                          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                          </svg>
                          One special character (!@#$%^&*)
                        </li>
                      </ul>
                    </div>

                    <!-- Submit Button -->
                    <div>
                      <button
                        type="submit"
                        :disabled="isLoading || !isPasswordValid"
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
                        {{ isLoading ? 'Resetting...' : 'Reset Password' }}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <!-- Step 4: Confirmation -->
              <div v-else-if="currentStep === 'confirm'" key="confirm">
                <div class="text-center">
                  <!-- Success Icon -->
                  <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                    <svg class="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>

                  <h1 class="text-4xl font-bold text-gray-900 mb-4">Password Reset Successfully!</h1>
                  <p class="text-gray-600 mb-8">
                    Your password has been successfully reset. A confirmation email has been sent to <strong>{{ email }}</strong>.
                  </p>

                  <router-link
                    to="/signin"
                    class="inline-flex items-center justify-center w-full h-12 px-6 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                    </svg>
                    Sign In Now
                  </router-link>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Right Side - Logo Panel with Hemisphere Background -->
        <div class="hidden lg:flex w-1/2 relative bg-gradient-to-br from-blue-600 to-indigo-700 items-center justify-center overflow-hidden">
          <!-- Decorative Background Elements -->
          <div class="absolute inset-0 overflow-hidden">
            <div class="absolute -top-48 -right-48 w-96 h-96 bg-white/10 rounded-full"></div>
            <div class="absolute -bottom-32 -left-32 w-80 h-80 bg-white/10 rounded-full"></div>
            <div class="absolute top-1/4 left-1/4 w-32 h-32 bg-white/5 rounded-full"></div>
            <div class="absolute bottom-1/3 right-1/4 w-24 h-24 bg-white/5 rounded-full"></div>
          </div>

          <!-- Content Container -->
          <div class="relative z-10 flex flex-col items-center justify-center">
            <div class="relative flex flex-col items-center justify-center px-16 py-20 bg-white/10 backdrop-blur-sm border-2 border-white/20 shadow-2xl overflow-hidden" style="border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;">
              <!-- Logo -->
              <div class="mb-6">
                <svg class="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                </svg>
              </div>
              
              <!-- Text -->
              <div class="text-center max-w-sm">
                <h2 class="text-3xl font-bold text-white mb-3">Password Reset</h2>
                <p class="text-white/90 text-lg font-medium leading-relaxed">
                  Secure your account with a new password
                </p>
              </div>
            </div>

            <div class="absolute top-8 right-8 w-16 h-16 border-2 border-white/30 rounded-full animate-pulse"></div>
            <div class="absolute bottom-12 left-12 w-12 h-12 border-2 border-white/30 rounded-full animate-pulse" style="animation-delay: 1s;"></div>
          </div>
        </div>
      </div>
    </div>
  </FullScreenLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import FullScreenLayout from '@/components/layout/FullScreenLayout.vue'

// State management
const currentStep = ref<'request' | 'verify' | 'reset' | 'confirm'>('request')
const email = ref('')
const verificationCode = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const resendCooldown = ref(0)
const resetToken = ref('')

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

// Password strength calculation
const passwordStrength = computed(() => {
  const password = newPassword.value
  let strength = 0
  
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[!@#$%^&*]/.test(password)) strength++
  
  return Math.min(strength, 4)
})

// Password validation
const isPasswordValid = computed(() => {
  return (
    newPassword.value.length >= 8 &&
    /[A-Z]/.test(newPassword.value) &&
    /[a-z]/.test(newPassword.value) &&
    /[0-9]/.test(newPassword.value) &&
    /[!@#$%^&*]/.test(newPassword.value) &&
    newPassword.value === confirmPassword.value
  )
})

// Helper functions for password strength display
const getStrengthColor = (strength: number) => {
  if (strength <= 1) return 'bg-red-500'
  if (strength === 2) return 'bg-yellow-500'
  if (strength === 3) return 'bg-blue-500'
  return 'bg-green-500'
}

const getStrengthTextColor = (strength: number) => {
  if (strength <= 1) return 'text-red-600'
  if (strength === 2) return 'text-yellow-600'
  if (strength === 3) return 'text-blue-600'
  return 'text-green-600'
}

const getStrengthText = (strength: number) => {
  if (strength === 0) return 'Enter a password'
  if (strength <= 1) return 'Weak password'
  if (strength === 2) return 'Fair password'
  if (strength === 3) return 'Good password'
  return 'Strong password'
}

// Step 1: Request password reset
const handleRequestReset = async () => {
  errorMessage.value = ''
  isLoading.value = true

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send verification code. Please try again.')
    }

    console.log('✅ Verification code sent successfully!')
    currentStep.value = 'verify'
    startResendCooldown()
  } catch (error) {
    console.error('Request reset error:', error)
    errorMessage.value = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// Step 2: Verify code
const handleVerifyCode = async () => {
  errorMessage.value = ''
  isLoading.value = true

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-reset-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        code: verificationCode.value,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Invalid verification code. Please try again.')
    }

    console.log('✅ Code verified successfully!')
    resetToken.value = data.resetToken || ''
    currentStep.value = 'reset'
  } catch (error) {
    console.error('Verify code error:', error)
    errorMessage.value = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// Resend verification code
const handleResendCode = async () => {
  if (resendCooldown.value > 0) return
  
  errorMessage.value = ''
  isLoading.value = true

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to resend verification code.')
    }

    console.log('✅ Verification code resent!')
    startResendCooldown()
  } catch (error) {
    console.error('Resend code error:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to resend code.'
  } finally {
    isLoading.value = false
  }
}

// Cooldown timer for resend
const startResendCooldown = () => {
  resendCooldown.value = 60
  const interval = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(interval)
    }
  }, 1000)
}

// Step 3: Reset password
const handleResetPassword = async () => {
  if (!isPasswordValid.value) {
    errorMessage.value = 'Please ensure your password meets all requirements and matches the confirmation.'
    return
  }

  errorMessage.value = ''
  isLoading.value = true

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        code: verificationCode.value,
        resetToken: resetToken.value,
        newPassword: newPassword.value,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to reset password. Please try again.')
    }

    console.log('✅ Password reset successfully!')
    currentStep.value = 'confirm'
  } catch (error) {
    console.error('Reset password error:', error)
    errorMessage.value = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
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