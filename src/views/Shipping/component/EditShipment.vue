<template>
  <teleport to="body">
    <transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-200"
      @after-leave="unlockScroll"
    >
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" @click.self="closeModal"></div>
        <transition
          enter-active-class="transition-all duration-300"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          appear
        >
          <div v-if="isOpen" class="relative z-10 w-full max-w-3xl mx-4">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
              <!-- Header -->
              <div class="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 class="text-xl font-bold text-gray-900 dark:text-white">Edit Shipment</h2>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Step {{ currentStep }} of {{ totalSteps }}</p>
                </div>
                <button
                  @click="closeModal"
                  :disabled="isSubmitting"
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              <!-- Step Indicator -->
              <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900/30">
                <div class="flex items-center justify-center">
                  <div class="flex items-center max-w-2xl w-full pl-20 pr-20">
                    <div v-for="(step, index) in steps" :key="step.id" class="flex items-center" :class="index < steps.length - 1 ? 'flex-1' : ''">
                      <div class="flex items-center justify-center flex-col flex-shrink-0">
                        <div :class="[
                          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                          currentStep > step.id
                            ? 'bg-green-500 text-white'
                            : currentStep === step.id
                            ? 'bg-brand-500 text-white'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400',
                        ]">
                          <span v-if="currentStep > step.id">✓</span>
                          <span v-else>{{ step.id }}</span>
                        </div>
                        <span :class="[
                          'mt-2 text-xs font-medium text-center whitespace-nowrap',
                          currentStep === step.id
                            ? 'text-brand-500 dark:text-brand-400'
                            : currentStep > step.id
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-500 dark:text-gray-400',
                        ]">
                          {{ step.name }}
                        </span>
                      </div>
                      <div v-if="index < steps.length - 1" :class="[
                        'flex-1 h-0.5 mx-3 self-start mt-4',
                        currentStep > step.id ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                      ]"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Form Content -->
              <div class="p-6 min-h-[400px]">
                <div v-if="errors.submit" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p class="text-sm text-red-600 dark:text-red-400">{{ errors.submit }}</p>
                </div>

                <!-- Step 1: Order Information -->
                <div v-if="currentStep === 1">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Information</h3>
                  <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                      <!-- Tracking Code (Read-only) -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Tracking Code <span class="text-red-500">*</span>
                        </label>
                        <input
                          v-model="form.trackingCode"
                          type="text"
                          class="input input-bordered w-full bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          readonly
                          disabled
                        />
                      </div>

                      <!-- Sales Order Number (Read-only) -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Sales Order Number <span class="text-red-500">*</span>
                        </label>
                        <input
                          v-model="form.order"
                          type="text"
                          class="input input-bordered w-full bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          readonly
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Step 2: Shipping Details -->
                <div v-if="currentStep === 2">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Shipping Details</h3>
                  <div class="space-y-4">

                  <div class="grid grid-cols-2 gap-4">
                    <!-- Shipping Carrier -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Shipping Carrier <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="form.carrier"
                        type="text"
                        class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        :class="{ 'border-red-500': errors.carrier }"
                        placeholder="Enter carrier name"
                        maxlength="50"
                      />
                      <span v-if="errors.carrier" class="text-xs text-red-500 mt-1">{{ errors.carrier }}</span>
                    </div>

                    <!-- Destination -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Destination <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="form.destination"
                        type="text"
                        class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        :class="{ 'border-red-500': errors.destination }"
                        placeholder="Enter destination"
                        maxlength="50"
                      />
                      <span v-if="errors.destination" class="text-xs text-red-500 mt-1">{{ errors.destination }}</span>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <!-- Shipping Date -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Shipping Date
                      </label>
                      <input
                        ref="shippingDateInput"
                        v-model="form.shippingDate"
                        type="text"
                        class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Select date"
                        readonly
                      />
                    </div>

                    <!-- Estimated Delivery Date -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Estimated Delivery Date
                      </label>
                      <input
                        ref="estimatedDeliveryDateInput"
                        v-model="form.estimatedDeliveryDate"
                        type="text"
                        class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Select date"
                        readonly
                      />
                    </div>
                  </div>

                  <!-- Status -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status <span class="text-red-500">*</span>
                    </label>
                    <div class="dropdown relative inline-flex w-full" ref="statusDropdownRef">
                      <button
                        type="button"
                        :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400 text-left', { 'btn-error': errors.status }]"
                        :aria-expanded="openDropdowns.status"
                        @click.stop="toggleDropdown('status')"
                      >
                        <span class="truncate pr-2">{{ displayStatus }}</span>
                        <span
                          class="icon-[tabler--chevron-down] size-4 transition-transform flex-shrink-0"
                          :class="{ 'rotate-180': openDropdowns.status }"
                        ></span>
                      </button>
                    </div>
                    <span v-if="errors.status" class="text-xs text-red-500 mt-1">{{ errors.status }}</span>
                  </div>

                  <!-- Status dropdown menu - rendered outside normal flow -->
                  <teleport to="body">
                    <ul
                      v-if="openDropdowns.status"
                      class="dropdown-menu transition-opacity duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-gray-900 dark:text-white opacity-100"
                      :style="statusMenuStyle"
                      role="menu"
                    >
                      <li v-for="status in statusOptions" :key="status">
                        <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectStatus(status)">
                          {{ formatStatus(status) }}
                        </a>
                      </li>
                    </ul>
                  </teleport>

                  <!-- Remarks -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Remarks
                    </label>
                    <textarea
                      v-model="form.remark"
                      rows="3"
                      class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter any remarks"
                      maxlength="200"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer with Navigation -->
              <div class="flex items-center justify-between p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  v-if="currentStep > 1"
                  @click="previousStep"
                  :disabled="isSubmitting"
                  class="btn btn-outline"
                >
                  ← Previous
                </button>
                <div v-else></div>

                <div class="flex gap-2">
                  <button
                    @click="closeModal"
                    :disabled="isSubmitting"
                    class="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    v-if="currentStep < totalSteps"
                    @click="nextStep"
                    class="btn bg-brand-500 hover:bg-brand-600 text-white border-none"
                  >
                    Next →
                  </button>
                  <button
                    v-else
                    @click="submitForm"
                    :disabled="isSubmitting"
                    class="btn bg-brand-500 hover:bg-brand-600 text-white border-none"
                  >
                    <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
                    {{ isSubmitting ? 'Updating...' : 'Update' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import authenticatedFetch from '@/utils/authenticatedFetch'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.css'


interface Order {
  id: number
  orderNo: string
}

interface Shipment {
  id: number
  trackingCode: string
  carrier: string
  orderId: number
  orderNo?: string
  doNumber?: string
  destination: string
  shippingDate: string
  estimatedDeliveryDate: string
  state: string
  remark: string
}


const emit = defineEmits(['shipment-updated'])

/* state */
const isOpen = ref(false)
const isSubmitting = ref(false)
const currentStep = ref(1)
const totalSteps = 2

const steps = [
  { id: 1, name: 'Order Info' },
  { id: 2, name: 'Shipping' },
]

const statusDropdownRef = ref<HTMLElement | null>(null)
const shippingDateInput = ref(null)
const estimatedDeliveryDateInput = ref(null)
let flatpickrInstance: any = null
let flatpickrInstanceEstimated: any = null

const currentShipmentId = ref<number | null>(null)
const shipmentData = ref<Shipment | null>(null)
const statusMenuStyle = ref<any>({})

const form = reactive({
  trackingCode: '',
  carrier: '',
  order: '',
  destination: '',
  shippingDate: new Date().toISOString().split('T')[0],
  estimatedDeliveryDate: new Date().toISOString().split('T')[0],
  status: '',
  remark: ''
})

const errors = reactive({
  carrier: '',
  destination: '',
  shippingDate: '',
  estimatedDeliveryDate: '',
  status: '',
  remark: '',
  submit: ''
})

const statusOptions = [
  'PENDING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED'
]

const openDropdowns = reactive({ status: false })

// Format status for UI display
const formatStatus = (status: string) => {
  const s = (status || '').toString().toUpperCase()
  if (s === 'PENDING') return 'Pending'
  if (s === 'SHIPPED') return 'Shipped'
  if (s === 'DELIVERED') return 'Delivered'
  if (s === 'CANCELLED') return 'Cancelled'
  return s ? (s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()) : 'Select Status'
}

const displayStatus = computed(() => {
  return form.status ? formatStatus(form.status) : 'Select Status'
})

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
  Object.keys(errors).forEach(key => errors[key as keyof typeof errors] = '')

  let isValid = true

  // Shipping Carrier validation
  if (!form.carrier.trim()) {
    errors.carrier = 'Shipping Carrier is required'
    isValid = false
  }

  // Destination validation
  if (!form.destination.trim()) {
    errors.destination = 'Destination is required'
    isValid = false
  }

  // Status validation
  if (!form.status) {
    errors.status = 'Status is required'
    isValid = false
  }

  return isValid
}

// Clear error when user types
watch(() => form.carrier, () => { if (errors.carrier) errors.carrier = '' })
watch(() => form.destination, () => { if (errors.destination) errors.destination = '' })
watch(() => form.status, () => { if (errors.status) errors.status = '' })
watch(() => form.remark, () => { if (errors.remark) errors.remark = '' })
watch(() => form.shippingDate, () => { if (errors.shippingDate) errors.shippingDate = '' })
watch(() => form.estimatedDeliveryDate, () => { if (errors.estimatedDeliveryDate) errors.estimatedDeliveryDate = '' })

/* helpers */
const positionStatusMenu = async () => {
  await nextTick()
  const container = statusDropdownRef.value
  if (!container) return

  const btn = container.querySelector('button')
  if (!btn) return

  const rect = btn.getBoundingClientRect()
  const maxMenuHeight = 300
  const gap = 8
  const belowSpace = window.innerHeight - rect.bottom - gap
  const aboveSpace = rect.top - gap

  const style: any = {
    position: 'fixed',
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: '9999',
    overflowY: 'auto',
    overflowX: 'hidden'
  }

  if (belowSpace >= 150) {
    style.top = `${rect.bottom + gap}px`
    style.maxHeight = `${Math.min(maxMenuHeight, belowSpace)}px`
  } else {
    const usedHeight = Math.min(maxMenuHeight, aboveSpace)
    style.top = `${rect.top - usedHeight - gap}px`
    style.maxHeight = `${usedHeight}px`
  }

  statusMenuStyle.value = style
}

const toggleDropdown = async (name: 'status') => {
  openDropdowns.status = !openDropdowns.status

  if (name === 'status' && openDropdowns.status) {
    await positionStatusMenu()
  }
}

const selectStatus = (status: string) => {
  form.status = status
  openDropdowns.status = false
}

/* close dropdowns when clicking outside */
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node
  const statusDd = statusDropdownRef.value

  // Check if click is on status dropdown menu items
  const statusMenu = document.querySelector('.dropdown-menu[role="menu"]')
  if (statusMenu && statusMenu.contains(target)) {
    return // Don't close if clicking inside the menu
  }

  if (statusDd && !statusDd.contains(target)) {
    openDropdowns.status = false
  }
}

const repositionStatusMenu = () => {
  if (openDropdowns.status) {
    positionStatusMenu()
  }
}

const nextStep = () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++

    // Initialize Flatpickr when entering step 2
    if (currentStep.value === 2) {
      initializeFlatpickr()
    }
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

/* Initialize Flatpickr for date inputs */
const initializeFlatpickr = async () => {
  await nextTick()

  // Destroy existing instances if any
  if (flatpickrInstance) {
    flatpickrInstance.destroy()
    flatpickrInstance = null
  }
  if (flatpickrInstanceEstimated) {
    flatpickrInstanceEstimated.destroy()
    flatpickrInstanceEstimated = null
  }

  // Initialize shipping date picker
  if (shippingDateInput.value) {
    flatpickrInstance = flatpickr(shippingDateInput.value, {
      dateFormat: 'Y-m-d',
      defaultDate: form.shippingDate || new Date(),
      onChange: (selectedDates: Date[]) => {
        if (selectedDates && selectedDates[0]) {
          form.shippingDate = selectedDates[0].toISOString().split('T')[0]
        }
      }
    })
  }

  // Initialize estimated delivery date picker
  if (estimatedDeliveryDateInput.value) {
    flatpickrInstanceEstimated = flatpickr(estimatedDeliveryDateInput.value, {
      dateFormat: 'Y-m-d',
      defaultDate: form.estimatedDeliveryDate || new Date(),
      onChange: (selectedDates: Date[]) => {
        if (selectedDates && selectedDates[0]) {
          form.estimatedDeliveryDate = selectedDates[0].toISOString().split('T')[0]
        }
      }
    })
  }
}

/* Prefill form with shipment data */
const prefillForm = (shipment: Shipment) => {
  console.log('Prefilling form with shipment:', shipment)
  currentShipmentId.value = shipment.id
  shipmentData.value = shipment
  form.trackingCode = shipment.trackingCode || ''
  form.carrier = shipment.carrier || ''
  // shipment may come in different shapes: sometimes it's the raw server object
  // mapped table item (which uses `order`), or the original payload with `orderNo`.
  // Try several fallbacks so the order field is prefilled correctly.
  const anyShipment: any = shipment as any
  form.order = shipment.orderNo || anyShipment.order || (anyShipment.raw && (anyShipment.raw.order?.orderNo || anyShipment.raw.order?.name)) || ''
  form.destination = shipment.destination || ''

  // Format dates to YYYY-MM-DD
  form.shippingDate = shipment.shippingDate ? shipment.shippingDate.split('T')[0] : new Date().toISOString().split('T')[0]
  form.estimatedDeliveryDate = shipment.estimatedDeliveryDate ? shipment.estimatedDeliveryDate.split('T')[0] : new Date().toISOString().split('T')[0]

  form.status = shipment.state || ''
  form.remark = shipment.remark || ''
  
  console.log('Stored shipmentData with orderId:', shipmentData.value?.orderId)
}

/* open/close modal */
const openModal = async (shipment: Shipment) => {
  // Prefill form with shipment data
  prefillForm(shipment)

  // Reset errors and step
  Object.keys(errors).forEach(key => errors[key as keyof typeof errors] = '')
  currentStep.value = 1

  isOpen.value = true
  lockScroll()
}

const closeModal = async () => {
  openDropdowns.status = false

  // Destroy Flatpickr instance
  if (flatpickrInstance) {
    flatpickrInstance.destroy()
    flatpickrInstance = null
  }
  if (flatpickrInstanceEstimated) {
    flatpickrInstanceEstimated.destroy()
    flatpickrInstanceEstimated = null
  }

  isOpen.value = false

  // Reset form after modal is closed
  await nextTick()
  currentShipmentId.value = null
  currentStep.value = 1
  form.trackingCode = ''
  form.order = ''
  form.carrier = ''
  form.destination = ''
  form.shippingDate = new Date().toISOString().split('T')[0]
  form.estimatedDeliveryDate = new Date().toISOString().split('T')[0]
  form.status = ''
  form.remark = ''

  // Reset errors
  Object.keys(errors).forEach(key => errors[key as keyof typeof errors] = '')
}

/* submit */
const submitForm = async () => {
  if (!validateForm()) {
    return
  }

  if (!currentShipmentId.value) {
    errors.submit = 'No shipment selected for update'
    return
  }

  isSubmitting.value = true
  errors.submit = ''

  try {
    // Get orderId from the prefilled shipment
    // Try multiple possible locations for orderId
    const anyShipment: any = shipmentData.value as any
    const orderId = shipmentData.value?.orderId 
      || anyShipment?.order?.id 
      || anyShipment?.raw?.orderId
      || anyShipment?.raw?.order?.id

    console.log('Looking for orderId in shipmentData:', shipmentData.value)
    console.log('Found orderId:', orderId)

    if (!orderId) {
      errors.submit = 'Order ID not found in shipment data. Please check the shipment details.'
      isSubmitting.value = false
      return
    }

    // Format the data to match the backend schema for Shipment
    const submissionData = {
      trackingCode: form.trackingCode.toUpperCase(),
      orderId: orderId,
      carrier: form.carrier ? form.carrier.toUpperCase() : null,
      destination: form.destination || null,
      shippingDate: form.shippingDate || null,
      estimatedDeliveryDate: form.estimatedDeliveryDate || null,
      state: form.status,
      remark: form.remark || null,
    }

    // PATCH to shipments endpoint
    const response = await authenticatedFetch(`/api/shipping/${currentShipmentId.value}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to update shipment')
    }

    const data = await response.json()
    console.log('Server response:', data)

    // Only close and reset after successful API call
    await closeModal()

    // Emit event to parent component with success status
    emit('shipment-updated', { success: true, data })

  } catch (error) {
    console.error('Error updating shipment:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update shipment'
    errors.submit = errorMessage
    // Emit event to parent component with error status
    emit('shipment-updated', { success: false, error: errorMessage })
  } finally {
    isSubmitting.value = false
  }
}

/* lifecycle */
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', repositionStatusMenu)
  window.addEventListener('scroll', repositionStatusMenu, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', repositionStatusMenu)
  window.removeEventListener('scroll', repositionStatusMenu, true)

  // Clean up Flatpickr
  if (flatpickrInstance) {
    flatpickrInstance.destroy()
    flatpickrInstance = null
  }
  if (flatpickrInstanceEstimated) {
    flatpickrInstanceEstimated.destroy()
    flatpickrInstanceEstimated = null
  }

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
