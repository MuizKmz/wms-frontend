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
        <div class="absolute inset-0 bg-black/50"></div>

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
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col min-h-[600px] max-h-[90vh]">
              <div class="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 id="modal-title" class="text-lg font-semibold text-gray-900 dark:text-white">
                  Add New Shipment
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

              <div class="space-y-4 overflow-y-auto p-6 flex-1">
                <div v-if="errors.submit" class="alert alert-error">
                  <span>{{ errors.submit }}</span>
                </div>

                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    Tracking Code <span class="text-xs text-gray-500">(Auto-generated if empty)</span>
                  </label>
                  <input
                    v-model="form.trackingCode"
                    type="text"
                    placeholder="Leave empty for auto-generation"
                    maxlength="50"
                    :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.trackingCode }]"
                  />
                  <transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="errors.trackingCode" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.trackingCode }}</p>
                    </div>
                  </transition>
                </div>

                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    <span class="text-red-500">*</span> Shipping Carier
                  </label>
                  <input
                    v-model="form.carrier"
                    type="text"
                    placeholder="Enter Product Code"
                    maxlength="50"
                    :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.carrier }]"
                  />
                  <transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="errors.carrier" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.carrier }}</p>
                    </div>
                  </transition>
                </div>

                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    <span class="text-red-500">*</span> Order Number
                  </label>
                  <div class="dropdown relative inline-flex w-full" ref="orderDropdownRef">
                    <button
                      type="button"
                      :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400', { 'btn-error': errors.order }]"
                      :aria-expanded="openDropdowns.order"
                      @click.stop="toggleDropdown('order')"
                      :disabled="loadingOrders"
                    >
                      {{ form.order || 'Select Order' }}
                      <span
                        class="icon-[tabler--chevron-down] size-4 transition-transform"
                        :class="{ 'rotate-180': openDropdowns.order }"
                      ></span>
                    </button>

                    <ul
                      class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white max-h-60 overflow-y-auto"
                      :class="{ 'opacity-100 pointer-events-auto': openDropdowns.order, 'opacity-0 pointer-events-none': !openDropdowns.order }"
                      role="menu"
                    >
                      <li v-for="order in orders" :key="order.id">
                        <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('order', order.orderNo)">
                          {{ order.orderNo }}
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
                    <div v-if="errors.order" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.order }}</p>
                    </div>
                  </transition>
                </div>

                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    <span class="text-red-500">*</span> Destination
                  </label>
                  <input
                    v-model="form.destination"
                    type="text"
                    placeholder="Enter Shipping Destination"
                    maxlength="50"
                    :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.destination }]"
                  />
                  <transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="errors.destination" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.destination }}</p>
                    </div>
                  </transition>
                </div>

                  <div class="relative">
                    <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                      Shipping Date
                    </label>
                    <input
                      ref="shippingDateInput"
                      v-model="form.shippingDate"
                      type="text"
                      placeholder="Select Date"
                      :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.shippingDate }]"
                      readonly
                    />
                  </div>

                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    Estimated Delivery Date
                  </label>
                  <input
                    ref="estimatedDeliveryDateInput"
                    v-model="form.estimatedDeliveryDate"
                    type="text"
                    placeholder="Select Date"
                    :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.estimatedDeliveryDate }]"
                    readonly
                  />
                </div>

                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    <span class="text-red-500">*</span> Status
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

                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    Remarks
                  </label>
                  <input
                    v-model="form.remark"
                    type="text"
                    placeholder="Enter Remarks"
                    maxlength="200"
                    :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.remark }]"
                  />
                  <transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="errors.remark" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.remark }}</p>
                    </div>
                  </transition>
                </div>
              </div>

              <div class="flex justify-end gap-2 p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button @click="closeModal" class="btn btn-outline" :disabled="isSubmitting">
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

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import authenticatedFetch from '@/utils/authenticatedFetch'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.css'


interface Order {
  id: number
  orderNo: string
}


const emit = defineEmits(['shipment-created'])

/* state */
const isOpen = ref(false)
const isSubmitting = ref(false)
const loadingOrders = ref(false)
const panelRef = ref<HTMLElement | null>(null)
const statusDropdownRef = ref<HTMLElement | null>(null)
const orderDropdownRef = ref<HTMLElement | null>(null)
const shippingDateInput = ref(null)
const estimatedDeliveryDateInput = ref(null)
let flatpickrInstance: any = null
let flatpickrInstanceEstimated: any = null

const form = reactive({
  trackingCode: '',
  name: '',
  carrier: '',
  order: '',
  destination: '',
  shippingDate: new Date().toISOString().split('T')[0],
  estimatedDeliveryDate: new Date().toISOString().split('T')[0],
  status: '',
  remark: ''
})

const errors = reactive({
  trackingCode: '',
  name: '',
  carrier: '',
  order: '',
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

const orders = ref<Order[]>([])
// The keys here ('status', 'order') must match the keys passed to toggleDropdown
const openDropdowns = reactive({ status: false, order: false })

/* Fetch orders  */
const fetchOrder = async () => {
  loadingOrders.value = true
  try {
    const response = await authenticatedFetch('/api/order')
    if (!response.ok) throw new Error('Failed to fetch orders')
    const data = await response.json()
    orders.value = data
  } catch (error) {
    console.error('Error fetching orders:', error)
  } finally {
    loadingOrders.value = false
  }
}


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

    // Flatpickr initialization moved to openModal

  // Tracking Code validation - optional, will be auto-generated if empty

  // Order No validation
  if (!form.order) {
    errors.order = 'Order is required'
    isValid = false
  }

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
watch(() => form.trackingCode, () => { if (errors.trackingCode) errors.trackingCode = '' })
watch(() => form.order, () => { if (errors.order) errors.order = '' })
watch(() => form.carrier, () => { if (errors.carrier) errors.carrier = '' })
watch(() => form.destination, () => { if (errors.destination) errors.destination = '' })
watch(() => form.status, () => { if (errors.status) errors.status = '' })
watch(() => form.remark, () => { if (errors.remark) errors.remark = '' })
watch(() => form.shippingDate, () => { if (errors.shippingDate) errors.shippingDate = '' })
watch(() => form.estimatedDeliveryDate, () => { if (errors.estimatedDeliveryDate) errors.estimatedDeliveryDate = '' })

/* helpers */
const toggleDropdown = (name: 'status' | 'order' ) => {
  Object.keys(openDropdowns).forEach(k => {
    if (k !== name) openDropdowns[k as keyof typeof openDropdowns] = false
  })
  openDropdowns[name] = !openDropdowns[name]
}

/**
 * FIX APPLIED HERE:
 * The selectOption function now correctly maps the `form` key ('order')
 * to the `openDropdowns` key ('order') to ensure the dropdown closes.
 */
const selectOption = (key: keyof typeof form, value: string) => {
  form[key] = value as never

  // Determine which dropdown state key to close
  let dropdownKey: keyof typeof openDropdowns | null = null;
  if (key === 'order') {
    dropdownKey = 'order';
  } else if (key === 'status') {
    dropdownKey = 'status';
  }

  if (dropdownKey) {
    openDropdowns[dropdownKey] = false
  }
}

/* close dropdowns when clicking outside */
const handleClickOutside = (event: MouseEvent) => {
  const statusDd = statusDropdownRef.value
  const orderDd = orderDropdownRef.value

  if (statusDd && !statusDd.contains(event.target as Node)) {
    openDropdowns.status = false
  }

  if (orderDd && !orderDd.contains(event.target as Node)) {
    openDropdowns.order = false
  }

}

/* open/close modal */
const openModal = async () => {
  // Fetch orders  when modal opens
  await Promise.all([fetchOrder()])

  // Reset form
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

  isOpen.value = true
  lockScroll()
  await nextTick()
  const firstEl = panelRef.value?.querySelector('input,select,textarea,button') as HTMLElement | null
  firstEl?.focus()

  // Initialize Flatpickr instances for date inputs
  if (shippingDateInput.value && !flatpickrInstance) {
    flatpickrInstance = flatpickr(shippingDateInput.value, {
      dateFormat: 'Y-m-d',
      defaultDate: form.shippingDate ? new Date(form.shippingDate) : new Date(),
      onChange: (selectedDates: Date[]) => {
        if (selectedDates && selectedDates[0]) form.shippingDate = selectedDates[0].toISOString().split('T')[0]
      }
    })
  }

  if (estimatedDeliveryDateInput.value && !flatpickrInstanceEstimated) {
    flatpickrInstanceEstimated = flatpickr(estimatedDeliveryDateInput.value, {
      dateFormat: 'Y-m-d',
      defaultDate: form.estimatedDeliveryDate ? new Date(form.estimatedDeliveryDate) : new Date(),
      onChange: (selectedDates: Date[]) => {
        if (selectedDates && selectedDates[0]) form.estimatedDeliveryDate = selectedDates[0].toISOString().split('T')[0]
      }
    })
  }
}

const closeModal = async () => {
  openDropdowns.status = false
  openDropdowns.order = false

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

  isSubmitting.value = true
  errors.submit = ''

  try {
    // Map selected orderNo to orderId for backend
  const selectedOrder = orders.value.find((o: Order) => o.orderNo === form.order)
    const orderId = selectedOrder ? selectedOrder.id : null

    if (!orderId) {
      errors.submit = 'Selected order not found. Please select a valid order.'
      isSubmitting.value = false
      return
    }

    // Format the data to match the backend schema for Shipment
    const submissionData = {
      trackingCode: form.trackingCode ? form.trackingCode.toUpperCase() : '', // Empty string will trigger auto-generation
      orderId: orderId,
      carrier: form.carrier ? form.carrier.toUpperCase() : null,
      destination: form.destination || null,
      shippingDate: form.shippingDate || null,
      estimatedDeliveryDate: form.estimatedDeliveryDate || null,
      state: form.status,
      remark: form.remark || null,
    }

    // POST to shipments endpoint
  const response = await authenticatedFetch('/api/shipping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to create product')
    }

    const data = await response.json()
    console.log('Server response:', data)

    // Only close and reset after successful API call
    await closeModal()

    // Emit event to parent component with success status
    emit('shipment-created', { success: true, data })

  } catch (error) {
    console.error('Error creating product:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create product'
    errors.submit = errorMessage
    // Emit event to parent component with error status
    emit('shipment-created', { success: false, error: errorMessage })
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
