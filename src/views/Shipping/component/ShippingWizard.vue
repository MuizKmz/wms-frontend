<template>
  <teleport to="body">
    <transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-200"
      @after-leave="unlockScroll"
    >
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" @click.self="() => closeModal()"></div>
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
                  <h2 class="text-xl font-bold text-gray-900 dark:text-white">Create New Shipment</h2>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Step {{ currentStep }} of {{ totalSteps }}</p>
                </div>
                <button
                  @click="() => closeModal()"
                  :disabled="isSubmitting"
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              <!-- Step Indicator -->
              <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900/30">
                <div class="flex items-center justify-between">
                  <div
                    v-for="(step, index) in steps"
                    :key="step.id"
                    class="flex items-center flex-1"
                  >
                    <div class="flex items-center">
                      <div
                        :class="[
                          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                          currentStep > step.id
                            ? 'bg-green-500 text-white'
                            : currentStep === step.id
                            ? 'bg-brand-500 text-white'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400',
                        ]"
                      >
                        <span v-if="currentStep > step.id">✓</span>
                        <span v-else>{{ step.id }}</span>
                      </div>
                      <span
                        :class="[
                          'ml-2 text-sm font-medium hidden sm:inline',
                          currentStep === step.id
                            ? 'text-brand-600 dark:text-brand-400'
                            : currentStep > step.id
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-500 dark:text-gray-400',
                        ]"
                      >
                        {{ step.name }}
                      </span>
                    </div>
                    <div
                      v-if="index < steps.length - 1"
                      :class="[
                        'flex-1 h-0.5 mx-3',
                        currentStep > step.id ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600',
                      ]"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Form Content -->
              <div class="p-6 min-h-[400px]">
                <!-- Step 1: Order -->
                <div v-if="currentStep === 1">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Information</h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Order Number <span class="text-red-500">*</span>
                      </label>
                      <div class="dropdown relative inline-flex w-full" ref="orderDropdownRef">
                        <button
                          type="button"
                          :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400 text-left', { 'btn-error': errors.order }]"
                          :aria-expanded="openDropdowns.order"
                          @click.stop="toggleDropdown('order')"
                          :disabled="loadingOrders"
                        >
                          <span class="truncate pr-2">{{ formData.order || 'Select Order' }}</span>
                          <span
                            class="icon-[tabler--chevron-down] size-4 transition-transform flex-shrink-0"
                            :class="{ 'rotate-180': openDropdowns.order }"
                          ></span>
                        </button>

                        <ul
                          class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white max-h-60 overflow-y-auto"
                          :class="{ 'opacity-100 pointer-events-auto': openDropdowns.order, 'opacity-0 pointer-events-none': !openDropdowns.order }"
                          role="menu"
                        >
                          <li v-for="order in orders" :key="order.id">
                            <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOrder(order.orderNo)">
                              {{ order.orderNo }}
                            </a>
                          </li>
                        </ul>
                      </div>
                      <span v-if="errors.order" class="text-xs text-red-500 mt-1">{{ errors.order }}</span>
                    </div>
                  </div>
                </div>

                <!-- Step 2: Shipping Details -->
                <div v-if="currentStep === 2">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Shipping Details</h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tracking Code <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="formData.trackingCode"
                        type="text"
                        class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter tracking code"
                        maxlength="50"
                      />
                      <span v-if="errors.trackingCode" class="text-xs text-red-500 mt-1">{{ errors.trackingCode }}</span>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Shipping Carrier <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="formData.carrier"
                        type="text"
                        class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter carrier name"
                        maxlength="50"
                      />
                      <span v-if="errors.carrier" class="text-xs text-red-500 mt-1">{{ errors.carrier }}</span>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Destination <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="formData.destination"
                        type="text"
                        class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter destination"
                        maxlength="50"
                      />
                      <span v-if="errors.destination" class="text-xs text-red-500 mt-1">{{ errors.destination }}</span>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Shipping Date
                      </label>
                      <input
                        v-model="formData.shippingDate"
                        type="date"
                        class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Estimated Delivery Date
                      </label>
                      <input
                        v-model="formData.estimatedDeliveryDate"
                        type="date"
                        class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status <span class="text-red-500">*</span>
                      </label>
                      <div class="dropdown relative inline-flex w-full" ref="statusDropdownRef">
                        <button
                          type="button"
                          :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400', { 'btn-error': errors.status }]"
                          :aria-expanded="openDropdowns.status"
                          @click.stop="toggleDropdown('status')"
                        >
                          {{ formData.status || 'Select Status' }}
                          <span
                            class="icon-[tabler--chevron-down] size-4 transition-transform"
                            :class="{ 'rotate-180': openDropdowns.status }"
                          ></span>
                        </button>

                        <ul
                          class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white max-h-60 overflow-y-auto"
                          :class="{ 'opacity-100 pointer-events-auto': openDropdowns.status, 'opacity-0 pointer-events-none': !openDropdowns.status }"
                          role="menu"
                        >
                          <li v-for="status in statusOptions" :key="status">
                            <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectStatus(status)">
                              {{ status }}
                            </a>
                          </li>
                        </ul>
                      </div>
                      <span v-if="errors.status" class="text-xs text-red-500 mt-1">{{ errors.status }}</span>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Remarks
                      </label>
                      <textarea
                        v-model="formData.remark"
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
                    @click="() => closeModal()"
                    :disabled="isSubmitting"
                    class="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    v-if="currentStep < totalSteps"
                    @click="nextStep"
                    class="btn bg-brand-500 hover:bg-brand-600 text-white"
                  >
                    Next →
                  </button>
                  <button
                    v-else
                    @click="submitForm"
                    :disabled="isSubmitting"
                    class="btn bg-brand-500 hover:bg-brand-600 text-white"
                  >
                    <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
                    {{ isSubmitting ? 'Submitting...' : 'Submit' }}
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
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import authenticatedFetch from '@/utils/authenticatedFetch'

interface Order {
  id: number
  orderNo: string
}

const emit = defineEmits(['shipment-created', 'close'])

const isOpen = ref(false)
const isSubmitting = ref(false)
const currentStep = ref(1)
const totalSteps = 2

const steps = [
  { id: 1, name: 'Order' },
  { id: 2, name: 'Shipping' },
]

const formData = reactive({
  // Step 1: Order
  order: '',
  // Step 2: Shipping Details
  trackingCode: '',
  carrier: '',
  destination: '',
  shippingDate: new Date().toISOString().split('T')[0],
  estimatedDeliveryDate: new Date().toISOString().split('T')[0],
  status: '',
  remark: '',
})

const errors = reactive<Record<string, string>>({})

const loadingOrders = ref(false)
const orders = ref<Order[]>([])

const statusOptions = [
  'Pending',
  'Preparing',
  'Ready for Dispatch',
  'In Transit',
  'Out for Delivery',
  'Delivered',
  'Failed Delivery',
  'Returned',
  'Cancelled'
]

const openDropdowns = reactive<Record<string, boolean>>({})

const lockScroll = () => {
  document.body.style.overflow = 'hidden'
}

const unlockScroll = () => {
  document.body.style.overflow = ''
}

const fetchOrders = async () => {
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

const openModal = async () => {
  await fetchOrders()
  isOpen.value = true
  currentStep.value = 1
  resetForm()
  lockScroll()
}

const closeModal = async (force = false) => {
  if (isSubmitting.value && !force) return
  isOpen.value = false
  unlockScroll()
  await nextTick()
  emit('close')
}

const resetForm = () => {
  formData.order = ''
  formData.trackingCode = ''
  formData.carrier = ''
  formData.destination = ''
  formData.shippingDate = new Date().toISOString().split('T')[0]
  formData.estimatedDeliveryDate = new Date().toISOString().split('T')[0]
  formData.status = ''
  formData.remark = ''
  Object.keys(errors).forEach((key) => delete errors[key])
  Object.keys(openDropdowns).forEach((key) => delete openDropdowns[key])
}

const validateStep = (step: number): boolean => {
  Object.keys(errors).forEach((key) => delete errors[key])

  if (step === 1) {
    if (!formData.order) errors.order = 'Order is required'
  } else if (step === 2) {
    if (!formData.trackingCode.trim()) errors.trackingCode = 'Tracking code is required'
    if (!formData.carrier.trim()) errors.carrier = 'Shipping carrier is required'
    if (!formData.destination.trim()) errors.destination = 'Destination is required'
    if (!formData.status) errors.status = 'Status is required'
  }

  return Object.keys(errors).length === 0
}

const nextStep = () => {
  if (!validateStep(currentStep.value)) return
  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const toggleDropdown = (name: string) => {
  Object.keys(openDropdowns).forEach(k => {
    if (k !== name) openDropdowns[k] = false
  })
  openDropdowns[name] = !openDropdowns[name]
}

const selectOrder = (orderNo: string) => {
  formData.order = orderNo
  openDropdowns.order = false
}

const selectStatus = (status: string) => {
  formData.status = status
  openDropdowns.status = false
}

const submitForm = async () => {
  if (!validateStep(currentStep.value)) return

  isSubmitting.value = true

  try {
    // Map selected orderNo to orderId for backend
    const selectedOrder = orders.value.find((o: Order) => o.orderNo === formData.order)
    const orderId = selectedOrder ? selectedOrder.id : null

    if (!orderId) {
      errors.order = 'Selected order not found. Please select a valid order.'
      isSubmitting.value = false
      return
    }

    // Format the data to match the backend schema for Shipment
    const submissionData = {
      trackingCode: formData.trackingCode.toUpperCase(),
      orderId: orderId,
      carrier: formData.carrier ? formData.carrier.toUpperCase() : null,
      destination: formData.destination || null,
      shippingDate: formData.shippingDate || null,
      estimatedDeliveryDate: formData.estimatedDeliveryDate || null,
      state: formData.status,
      remark: formData.remark || null,
    }

    const response = await authenticatedFetch('/api/shipping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to create shipment')
    }

    const data = await response.json()
    
    // Emit success event first so parent can show toast
    emit('shipment-created', { success: true, data })
    
    // Small delay to let toast appear before closing modal
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Then close modal (force=true to bypass isSubmitting check)
    await closeModal(true)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create shipment'
    emit('shipment-created', { success: false, error: message })
  } finally {
    isSubmitting.value = false
  }
}

const handleClickOutside = () => {
  Object.keys(openDropdowns).forEach(k => openDropdowns[k] = false)
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  if (isOpen.value) unlockScroll()
})

defineExpose({
  openModal,
  closeModal,
})
</script>
