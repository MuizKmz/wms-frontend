<template>
  <teleport to="body">
    <transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-250 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      @after-leave="unlockScroll"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center"
        aria-hidden="false"
        @click.self="closeModal"
      >
        <!-- overlay -->
        <div class="absolute inset-0 bg-black/50"></div>

        <!-- modal panel -->
        <transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-250 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
          appear
        >
          <div
            v-if="isOpen"
            ref="panelRef"
            class="relative z-10 w-full max-w-xl mx-4 max-h-[90vh] flex flex-col"
            @click.stop
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col min-h-0 max-h-[90vh]">
              <!-- header -->
              <div class="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 id="modal-title" class="text-lg font-semibold text-gray-900 dark:text-white">
                  Add New Customer
                </h2>
                <button
                  type="button"
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  @click="closeModal"
                  :disabled="isSubmitting"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              <!-- body -->
              <div class="space-y-4 overflow-y-auto p-6 flex-1">
                <!-- Submit Error -->
                <div v-if="errors.submit" class="alert alert-error">
                  <span>{{ errors.submit }}</span>
                </div>

                <!-- Customer ID and Customer Name in a row -->
                <div class="grid grid-cols-2 gap-4">
                  <!-- Customer ID -->
                  <div class="relative">
                    <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                      <span class="text-red-500">*</span> Customer ID
                    </label>
                    <input
                      v-model="form.customerId"
                      type="text"
                      placeholder="Enter Customer ID"
                      maxlength="20"
                      :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.customerId }]"
                    />
                    <transition
                      enter-active-class="transition-all duration-200 ease-out"
                      enter-from-class="opacity-0 -translate-y-1"
                      enter-to-class="opacity-100 translate-y-0"
                      leave-active-class="transition-all duration-150 ease-in"
                      leave-from-class="opacity-100 translate-y-0"
                      leave-to-class="opacity-0 -translate-y-1"
                    >
                      <div v-if="errors.customerId" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                        <p class="text-xs text-red-600 dark:text-red-400">{{ errors.customerId }}</p>
                      </div>
                    </transition>
                  </div>

                  <!-- Customer Name -->
                  <div class="relative">
                    <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                      <span class="text-red-500">*</span> Customer Name
                    </label>
                    <input
                      v-model="form.customerName"
                      type="text"
                      placeholder="Enter Customer Name"
                      maxlength="100"
                      :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.customerName }]"
                    />
                    <transition
                      enter-active-class="transition-all duration-200 ease-out"
                      enter-from-class="opacity-0 -translate-y-1"
                      enter-to-class="opacity-100 translate-y-0"
                      leave-active-class="transition-all duration-150 ease-in"
                      leave-from-class="opacity-100 translate-y-0"
                      leave-to-class="opacity-0 -translate-y-1"
                    >
                      <div v-if="errors.customerName" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                        <p class="text-xs text-red-600 dark:text-red-400">{{ errors.customerName }}</p>
                      </div>
                    </transition>
                  </div>
                </div>

                <!-- Contact Person -->
                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    <span class="text-red-500">*</span> Contact Person
                  </label>
                  <input
                    v-model="form.contactPerson"
                    type="text"
                    placeholder="Enter Contact Person"
                    maxlength="50"
                    :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.contactPerson }]"
                  />
                  <transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="errors.contactPerson" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.contactPerson }}</p>
                    </div>
                  </transition>
                </div>

                <!-- Phone Number -->
                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    <span class="text-red-500">*</span> Phone Number
                  </label>
                  <div class="flex gap-2">
                    <!-- Country Code Dropdown -->
                    <div class="dropdown relative inline-flex w-32" ref="countryDropdownRef">
                      <button
                        type="button"
                        :class="['dropdown-toggle btn btn-outline justify-between dark:bg-gray-700 dark:text-gray-400 w-full', { 'btn-error': errors.phoneNumber }]"
                        :aria-expanded="openDropdowns.country"
                        @click.stop="toggleDropdown('country')"
                      >
                        <span class="flex items-center gap-1">
                          <span>{{ form.countryCode }}</span>
                        </span>
                        <span
                          class="icon-[tabler--chevron-down] size-4 transition-transform"
                          :class="{ 'rotate-180': openDropdowns.country }"
                        ></span>
                      </button>

                      <ul
                        class="dropdown-menu min-w-full w-64 transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white max-h-60 overflow-y-auto"
                        :class="{ 'opacity-100 pointer-events-auto': openDropdowns.country, 'opacity-0 pointer-events-none': !openDropdowns.country }"
                        role="menu"
                      >
                        <li v-for="country in countries" :key="country.code">
                          <a class="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" @click="selectCountry(country)">
                            <span class="mr-2">{{ country.flag }}</span>
                            <span>{{ country.name }} ({{ country.dialCode }})</span>
                          </a>
                        </li>
                      </ul>
                    </div>

                    <!-- Phone Number Input -->
                    <input
                      v-model="form.phoneNumber"
                      type="tel"
                      placeholder="Enter Phone Number"
                      maxlength="10"
                      @input="formatPhoneNumber"
                      @keypress="onlyNumbers"
                      :class="['input input-bordered flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.phoneNumber }]"
                    />
                  </div>
                  <transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="errors.phoneNumber" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.phoneNumber }}</p>
                    </div>
                  </transition>
                </div>

                <!-- Email Address -->
                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    <span class="text-red-500">*</span> Email Address
                  </label>
                  <input
                    v-model="form.emailAddress"
                    type="email"
                    placeholder="Enter Email Address"
                    maxlength="100"
                    :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.emailAddress }]"
                  />
                  <transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="errors.emailAddress" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.emailAddress }}</p>
                    </div>
                  </transition>
                </div>

                <!-- Address and City in a row -->
                <div class="grid grid-cols-2 gap-4">
                  <!-- Address -->
                  <div class="relative">
                    <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                      <span class="text-red-500">*</span> Address
                    </label>
                    <input
                      v-model="form.address"
                      type="text"
                      placeholder="Enter Address"
                      maxlength="200"
                      :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.address }]"
                    />
                    <transition
                      enter-active-class="transition-all duration-200 ease-out"
                      enter-from-class="opacity-0 -translate-y-1"
                      enter-to-class="opacity-100 translate-y-0"
                      leave-active-class="transition-all duration-150 ease-in"
                      leave-from-class="opacity-100 translate-y-0"
                      leave-to-class="opacity-0 -translate-y-1"
                    >
                      <div v-if="errors.address" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                        <p class="text-xs text-red-600 dark:text-red-400">{{ errors.address }}</p>
                      </div>
                    </transition>
                  </div>

                  <!-- City -->
                  <div class="relative">
                    <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                      <span class="text-red-500">*</span> City
                    </label>
                    <input
                      v-model="form.city"
                      type="text"
                      placeholder="Enter City"
                      maxlength="50"
                      :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.city }]"
                    />
                    <transition
                      enter-active-class="transition-all duration-200 ease-out"
                      enter-from-class="opacity-0 -translate-y-1"
                      enter-to-class="opacity-100 translate-y-0"
                      leave-active-class="transition-all duration-150 ease-in"
                      leave-from-class="opacity-100 translate-y-0"
                      leave-to-class="opacity-0 -translate-y-1"
                    >
                      <div v-if="errors.city" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                        <p class="text-xs text-red-600 dark:text-red-400">{{ errors.city }}</p>
                      </div>
                    </transition>
                  </div>
                </div>

                <!-- Status dropdown -->
                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <div class="dropdown relative inline-flex w-full" ref="statusDropdownRef">
                    <button
                      type="button"
                      :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400', { 'btn-error': errors.status }]"
                      :aria-expanded="openDropdowns.status"
                      @click.stop="toggleDropdown('status')"
                    >
                      {{ form.status || 'Select Status' }}
                      <span
                        class="icon-[tabler--chevron-down] size-4 transition-transform"
                        :class="{ 'rotate-180': openDropdowns.status }"
                      ></span>
                    </button>

                    <ul
                      class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white"
                      :class="{ 'opacity-100 pointer-events-auto': openDropdowns.status, 'opacity-0 pointer-events-none': !openDropdowns.status }"
                      role="menu"
                    >
                      <li v-for="status in statusOptions" :key="status">
                        <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('status', status)">
                          {{ status }}
                        </a>
                      </li>
                    </ul>
                  </div>
                  <transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="errors.status" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.status }}</p>
                    </div>
                  </transition>
                </div>

                <!-- Remarks -->
                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    Remarks
                  </label>
                  <textarea
                    v-model="form.remarks"
                    placeholder="Enter Remarks"
                    maxlength="500"
                    rows="3"
                    :class="['textarea textarea-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none', { 'textarea-error': errors.remarks }]"
                  ></textarea>
                  <div class="flex justify-between items-center mt-1">
                    <span class="text-xs text-gray-500">{{ form.remarks.length }}/500 characters</span>
                  </div>
                  <transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="errors.remarks" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.remarks }}</p>
                    </div>
                  </transition>
                </div>
              </div>

              <!-- footer -->
              <div class="flex justify-end gap-2 p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button @click="closeModal" class="btn btn-outline btn-error" :disabled="isSubmitting">
                  Cancel
                </button>
                <button @click="submitForm" class="btn btn-primary" :disabled="isSubmitting">
                  <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
                  {{ isSubmitting ? 'Saving...' : 'Save' }}
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { authenticatedFetch } from '@/utils/authenticatedFetch'

const emit = defineEmits(['customer-created'])

/* state */
const isOpen = ref(false)
const isSubmitting = ref(false)
const panelRef = ref(null)
const statusDropdownRef = ref(null)
const countryDropdownRef = ref(null)

const form = reactive({
  customerId: '',
  customerName: '',
  contactPerson: '',
  countryCode: '+60',
  phoneNumber: '',
  emailAddress: '',
  address: '',
  city: '',
  status: 'Active', // Default to Active
  remarks: ''
})

const errors = reactive({
  customerId: '',
  customerName: '',
  contactPerson: '',
  phoneNumber: '',
  emailAddress: '',
  address: '',
  city: '',
  status: '',
  remarks: '',
  submit: ''
})

const statusOptions = ['Active', 'Inactive']
const openDropdowns = reactive({ status: false, country: false })

// Popular countries for phone numbers
const countries = [
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩' },
  { code: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭' },
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭' },
  { code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'AE', name: 'UAE', dialCode: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' }
]

/* Modal scroll lock utilities */
let scrollY = 0
let scrollbarWidth = 0

const getScrollbarWidth = () => {
  return window.innerWidth - document.documentElement.clientWidth
}

const lockScroll = () => {
  scrollY = window.scrollY
  scrollbarWidth = getScrollbarWidth()

  document.body.style.paddingRight = `${scrollbarWidth}px`
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollY}px`
  document.body.style.width = '100%'
  document.body.style.overflow = 'hidden'
}

const unlockScroll = () => {
  document.body.style.paddingRight = ''
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''
  document.body.style.overflow = ''

  requestAnimationFrame(() => {
    window.scrollTo(0, scrollY)
  })
}

/* Validation */
const validateForm = () => {
  // Reset errors
  Object.keys(errors).forEach(key => errors[key] = '')

  let isValid = true

  // Customer ID validation
  if (!form.customerId.trim()) {
    errors.customerId = 'Customer ID is required'
    isValid = false
  } else if (form.customerId.length < 3) {
    errors.customerId = 'Customer ID must be at least 3 characters'
    isValid = false
  }

  // Customer Name validation
  if (!form.customerName.trim()) {
    errors.customerName = 'Customer Name is required'
    isValid = false
  } else if (form.customerName.length < 3) {
    errors.customerName = 'Customer Name must be at least 3 characters'
    isValid = false
  } else if (form.customerName.length > 100) {
    errors.customerName = 'Customer Name cannot exceed 100 characters'
    isValid = false
  }

  // Contact Person validation
  if (!form.contactPerson.trim()) {
    errors.contactPerson = 'Contact Person is required'
    isValid = false
  } else if (form.contactPerson.length < 2) {
    errors.contactPerson = 'Contact Person must be at least 2 characters'
    isValid = false
  } else if (form.contactPerson.length > 50) {
    errors.contactPerson = 'Contact Person cannot exceed 50 characters'
    isValid = false
  }

  // Phone Number validation
  if (!form.phoneNumber.trim()) {
    errors.phoneNumber = 'Phone Number is required'
    isValid = false
  } else if (!/^\d+$/.test(form.phoneNumber)) {
    errors.phoneNumber = 'Phone Number must contain only numbers'
    isValid = false
  } else if (form.phoneNumber.length < 8) {
    errors.phoneNumber = 'Phone Number must have at least 8 digits'
    isValid = false
  } else if (form.phoneNumber.length > 10) {
    errors.phoneNumber = 'Phone Number cannot exceed 10 digits'
    isValid = false
  }

  // Email validation
  if (!form.emailAddress.trim()) {
    errors.emailAddress = 'Email Address is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailAddress)) {
    errors.emailAddress = 'Please enter a valid email address'
    isValid = false
  } else if (form.emailAddress.length > 100) {
    errors.emailAddress = 'Email Address cannot exceed 100 characters'
    isValid = false
  }

  // Address validation
  if (!form.address.trim()) {
    errors.address = 'Address is required'
    isValid = false
  } else if (form.address.length < 5) {
    errors.address = 'Address must be at least 5 characters'
    isValid = false
  } else if (form.address.length > 200) {
    errors.address = 'Address cannot exceed 200 characters'
    isValid = false
  }

  // City validation
  if (!form.city.trim()) {
    errors.city = 'City is required'
    isValid = false
  } else if (form.city.length < 2) {
    errors.city = 'City must be at least 2 characters'
    isValid = false
  } else if (form.city.length > 50) {
    errors.city = 'City cannot exceed 50 characters'
    isValid = false
  }

  // Remarks validation (optional but with limit)
  if (form.remarks.length > 500) {
    errors.remarks = 'Remarks cannot exceed 500 characters'
    isValid = false
  }

  return isValid
}

// Clear error when user types
watch(() => form.customerId, () => { if (errors.customerId) errors.customerId = '' })
watch(() => form.customerName, () => { if (errors.customerName) errors.customerName = '' })
watch(() => form.contactPerson, () => { if (errors.contactPerson) errors.contactPerson = '' })
watch(() => form.phoneNumber, () => { if (errors.phoneNumber) errors.phoneNumber = '' })
watch(() => form.countryCode, () => { if (errors.phoneNumber) errors.phoneNumber = '' })
watch(() => form.emailAddress, () => { if (errors.emailAddress) errors.emailAddress = '' })
watch(() => form.address, () => { if (errors.address) errors.address = '' })
watch(() => form.city, () => { if (errors.city) errors.city = '' })
watch(() => form.status, () => { if (errors.status) errors.status = '' })
watch(() => form.remarks, () => { if (errors.remarks) errors.remarks = '' })

/* helpers */
const toggleDropdown = (name) => {
  Object.keys(openDropdowns).forEach(k => { if (k !== name) openDropdowns[k] = false })
  openDropdowns[name] = !openDropdowns[name]
}

const selectOption = (key, value) => {
  form[key] = value
  openDropdowns[key] = false
}

const selectCountry = (country) => {
  form.countryCode = country.dialCode
  openDropdowns.country = false
}

// Only allow numbers in phone input
const onlyNumbers = (event) => {
  const charCode = event.which ? event.which : event.keyCode
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    event.preventDefault()
  }
}

// Format phone number as user types
const formatPhoneNumber = (event) => {
  // Remove all non-numeric characters
  let value = event.target.value.replace(/\D/g, '')

  // Limit to 15 digits
  if (value.length > 15) {
    value = value.slice(0, 15)
  }

  form.phoneNumber = value
}

/* close dropdowns when clicking outside */
const handleClickOutside = (event) => {
  const statusDd = statusDropdownRef.value
  const countryDd = countryDropdownRef.value

  if (statusDd && !statusDd.contains(event.target)) {
    openDropdowns.status = false
  }

  if (countryDd && !countryDd.contains(event.target)) {
    openDropdowns.country = false
  }
}

/* open/close modal */
const openModal = async () => {
  // Reset form
  form.customerId = ''
  form.customerName = ''
  form.contactPerson = ''
  form.countryCode = '+60'
  form.phoneNumber = ''
  form.emailAddress = ''
  form.address = ''
  form.city = ''
  form.status = 'Active'
  form.remarks = ''

  // Reset errors
  Object.keys(errors).forEach(key => errors[key] = '')

  isOpen.value = true
  lockScroll()
  await nextTick()
  panelRef.value?.querySelector('input,select,textarea,button')?.focus()
}

const closeModal = async () => {
  openDropdowns.status = false
  openDropdowns.country = false
  isOpen.value = false

  // Reset form after modal is closed
  await nextTick()
  form.customerId = ''
  form.customerName = ''
  form.contactPerson = ''
  form.countryCode = '+60'
  form.phoneNumber = ''
  form.emailAddress = ''
  form.address = ''
  form.city = ''
  form.status = 'Active'
  form.remarks = ''

  // Reset errors
  Object.keys(errors).forEach(key => errors[key] = '')
}

/* submit */
const submitForm = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  errors.submit = ''

  try {
    // Format the data to match the backend schema
    const submissionData = {
      customerCode: form.customerId.toUpperCase(),
      customerName: form.customerName,
      contactPerson: form.contactPerson,
      phone: `${form.countryCode}${form.phoneNumber}`,
      email: form.emailAddress,
      address: form.address,
      city: form.city,
      status: form.status === 'Active' ? 'Active' : 'Inactive',
      remark: form.remarks || null
    }

    // Make the API call to the correct endpoint
    const response = await authenticatedFetch('api/customer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to create customer')
    }

    const data = await response.json()
    console.log('Server response:', data) // Debug log

    // Only close and reset after successful API call
    await closeModal()

    // Emit event to parent component with success status
    emit('customer-created', { success: true, data })

  } catch (error) {
    console.error('Error creating customer:', error)
    errors.submit = error.message || 'Failed to create customer. Please try again.'
    // Emit event to parent component with error status
    emit('customer-created', { success: false, error: error.message || 'Failed to create customer' })
  } finally {
    isSubmitting.value = false
  }
}

/* lifecycle */
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  if (isOpen.value) {
    unlockScroll()
  }
})

/* expose to parent */
defineExpose({ openModal, closeModal })
</script>

<style scoped>
[role="dialog"] > .bg-white {
  transform-origin: center;
}
</style>