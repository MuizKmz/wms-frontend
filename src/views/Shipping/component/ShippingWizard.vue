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
                  <h2 class="text-xl font-bold text-gray-900 dark:text-white">Create New Shipment</h2>
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
                            ? 'text-brand-600 dark:text-brand-400'
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
                <!-- Step 1: Orders -->
                <div v-if="currentStep === 1">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Items</h3>
                  <div class="space-y-4">
                    <!-- Order Items -->
                    <div class="space-y-4 max-h-96 overflow-y-auto" style="padding-right: 8px;">
                      <div v-for="(item, index) in formData.orderItems" :key="index" class="p-4 rounded-lg">
                        <div class="space-y-3">
                          <!-- Order Selection and Remove Button -->
                          <div class="flex items-start gap-3">
                            <div class="flex-1">
                              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Order Number <span class="text-red-500">*</span>
                              </label>
                              <div class="relative" :ref="el => orderDropdownRefs[index] = el">
                                <button
                                  type="button"
                                  @click="toggleDropdown(`order${index}`)"
                                  class="input input-bordered w-full text-left flex items-center justify-between bg-white dark:bg-gray-700"
                                  :class="{ 'border-red-500': errors[`item${index}Order`] }"
                                >
                                  <span>{{ getOrderLabel(item.orderId) || 'Select Order' }}</span>
                                  <span class="icon-[tabler--chevron-down] size-4"></span>
                                </button>
                                <ul
                                  v-if="openDropdowns[`order${index}`]"
                                  :style="orderMenuStyles[index]"
                                  class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-gray-900 dark:text-white"
                                >
                                  <li
                                    v-for="order in availableOrders(index)"
                                    :key="order.id"
                                    @click="selectOrder(index, order.id)"
                                    class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                                  >
                                    {{ order.orderNo }}
                                  </li>
                                  <li v-if="availableOrders(index).length === 0" class="px-4 py-2 text-sm text-gray-500">
                                    No available orders
                                  </li>
                                </ul>
                              </div>
                              <span v-if="errors[`item${index}Order`]" class="text-xs text-red-500 mt-1">{{ errors[`item${index}Order`] }}</span>
                            </div>

                            <button
                              v-if="formData.orderItems.length > 1"
                              type="button"
                              @click="removeOrderItem(index)"
                              class="mt-7  bg-white border-none text-red-500 hover:bg-red-50 dark:bg-white dark:hover:bg-red-50"
                              aria-label="Remove order"
                            >
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>

                          <!-- Tracking Code -->
                          <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Tracking Code <span class="text-xs text-gray-500">(Auto-generated if empty)</span>
                            </label>
                            <input
                              v-model="item.trackingCode"
                              type="text"
                              class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              :class="{ 'border-red-500': errors[`item${index}TrackingCode`] }"
                              placeholder="Leave empty for auto-generation"
                              maxlength="50"
                            />
                            <span v-if="errors[`item${index}TrackingCode`]" class="text-xs text-red-500 mt-1">{{ errors[`item${index}TrackingCode`] }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      @click="addOrderItem"
                      class="btn bg-brand-500 border-none btn-sm mt-4"
                    >
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Add Another Order
                    </button>
                  </div>
                </div>

                <!-- Step 2: Shipping Details -->
                <div v-if="currentStep === 2">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Shipping Details</h3>
                  <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
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
                    </div>
                    <div class="grid grid-cols-2 gap-4">
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
                    </div>
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
                          <span class="truncate pr-2">{{ formData.status || 'Select Status' }}</span>
                          <span
                            class="icon-[tabler--chevron-down] size-4 transition-transform flex-shrink-0"
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
  status: string
}

interface OrderItem {
  orderId: string | number
  trackingCode: string
}

const emit = defineEmits(['shipment-created', 'close'])

const isOpen = ref(false)
const isSubmitting = ref(false)
const currentStep = ref(1)
const totalSteps = 2

const steps = [
  { id: 1, name: 'Orders' },
  { id: 2, name: 'Shipping' },
]

const formData = reactive({
  // Step 1: Orders
  orderItems: [{ orderId: '', trackingCode: '' }] as OrderItem[],
  // Step 2: Shipping Details
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
const orderDropdownRefs = ref<any[]>([])
const statusDropdownRef = ref<any>(null)
const existingShipments = ref<any[]>([]) // Store existing shipments to filter orders

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

// Order dropdown overlay styles per order index (reactive array)
const orderMenuStyles = reactive<any[]>([])

const lockScroll = () => {
  document.body.style.overflow = 'hidden'
}

const unlockScroll = () => {
  document.body.style.overflow = ''
}

const fetchOrders = async () => {
  loadingOrders.value = true
  try {
    // Fetch orders
    const orderResponse = await authenticatedFetch('/api/order')
    if (!orderResponse.ok) throw new Error('Failed to fetch orders')
    const orderData = await orderResponse.json()

    // Fetch existing shipments to check which orders already have shipments
    const shipmentResponse = await authenticatedFetch('/api/shipping')
    if (shipmentResponse.ok) {
      existingShipments.value = await shipmentResponse.json()
    }

    // Get order IDs that already have shipments
    const shippedOrderIds = new Set(
      existingShipments.value
        .map(shipment => shipment.orderId || shipment.order?.id)
        .filter(Boolean)
    )

    // Filter orders to only show those:
    // 1. Not yet shipped (status !== 'Shipped' and status !== 'Completed')
    // 2. Don't already have a shipment created
    orders.value = orderData.filter((order: Order) =>
      order.status !== 'Shipped' &&
      order.status !== 'Completed' &&
      !shippedOrderIds.has(order.id)
    )
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
  formData.orderItems = [{ orderId: '', trackingCode: '' }]
  formData.carrier = ''
  formData.destination = ''
  formData.shippingDate = new Date().toISOString().split('T')[0]
  formData.estimatedDeliveryDate = new Date().toISOString().split('T')[0]
  formData.status = ''
  formData.remark = ''

  // Reset order menu styles
  orderMenuStyles.length = 0
  formData.orderItems.forEach(() => orderMenuStyles.push({}))

  Object.keys(errors).forEach((key) => delete errors[key])
  Object.keys(openDropdowns).forEach((key) => delete openDropdowns[key])
}

const validateStep = (step: number): boolean => {
  Object.keys(errors).forEach((key) => delete errors[key])

  if (step === 1) {
    formData.orderItems.forEach((item, idx) => {
      if (!item.orderId) {
        errors[`item${idx}Order`] = 'Order is required'
      }
      // Tracking code is optional - will be auto-generated by backend if empty
    })
  } else if (step === 2) {
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

const toggleDropdown = async (name: string) => {
  Object.keys(openDropdowns).forEach(k => {
    if (k !== name) openDropdowns[k] = false
  })
  openDropdowns[name] = !openDropdowns[name]

  // If opening an order dropdown, compute its fixed-position style
  if (openDropdowns[name] && name.startsWith('order')) {
    const idx = parseInt(name.replace('order', ''), 10)
    await positionOrderMenu(idx)
  }
}

const selectOrder = async (index: number, orderId: number) => {
  // prevent selecting the same order in more than one row
  const takenIndex = formData.orderItems.findIndex((o, i) => i !== index && o.orderId === orderId)
  if (takenIndex !== -1) {
    console.warn(`Order ${orderId} is already selected in row ${takenIndex}`)
    openDropdowns[`order${index}`] = false
    return
  }

  formData.orderItems[index].orderId = orderId
  openDropdowns[`order${index}`] = false
}

const selectStatus = (status: string) => {
  formData.status = status
  openDropdowns.status = false
}

const getOrderLabel = (orderId: string | number) => {
  if (!orderId) return null
  const order = orders.value.find(o => o.id.toString() === orderId.toString())
  return order ? order.orderNo : null
}

// Return orders that are not selected in other rows (available for this index)
const availableOrders = (index: number) => {
  const takenIds = formData.orderItems
    .map((o, i) => i !== index ? o.orderId : null)
    .filter(Boolean)

  return orders.value.filter(o => !takenIds.includes(o.id))
}

const addOrderItem = () => {
  formData.orderItems.push({ orderId: '', trackingCode: '' })
  // keep style slot for new order dropdown
  orderMenuStyles.push({})
}

const removeOrderItem = (index: number) => {
  formData.orderItems.splice(index, 1)
  // remove the style slot for removed order
  orderMenuStyles.splice(index, 1)
  // close order dropdowns to avoid index shift issues
  Object.keys(openDropdowns).forEach(k => { if (k.startsWith('order')) openDropdowns[k] = false })
}

/* Position order dropdown menu */
const positionOrderMenu = async (index: number) => {
  await nextTick()
  const container = orderDropdownRefs.value[index]
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
    overflowX: 'hidden',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    boxSizing: 'border-box'
  }

  if (belowSpace >= 150) {
    style.top = `${rect.bottom}px`
    style.maxHeight = `${Math.min(maxMenuHeight, belowSpace)}px`
  } else {
    const usedHeight = Math.min(maxMenuHeight, aboveSpace)
    style.top = `${rect.top - usedHeight}px`
    style.maxHeight = `${usedHeight}px`
  }

  orderMenuStyles[index] = style
}

const repositionOpenOrderMenus = () => {
  Object.keys(openDropdowns).forEach(key => {
    if (key.startsWith('order') && openDropdowns[key]) {
      const idx = parseInt(key.replace('order', ''), 10)
      positionOrderMenu(idx)
    }
  })
}

const submitForm = async () => {
  if (!validateStep(currentStep.value)) return

  isSubmitting.value = true

  try {
    // Create shipments for each order
    const shipmentPromises = formData.orderItems.map(async (item) => {
      const selectedOrder = orders.value.find((o: Order) => o.id.toString() === item.orderId.toString())
      const orderId = selectedOrder ? selectedOrder.id : null

      if (!orderId) {
        throw new Error('Selected order not found. Please select a valid order.')
      }

      const submissionData = {
        trackingCode: item.trackingCode ? item.trackingCode.toUpperCase() : '', // Empty string triggers auto-generation
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

      return await response.json()
    })

    const results = await Promise.all(shipmentPromises)

    // Emit success event first so parent can show toast
    emit('shipment-created', { success: true, data: results })

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

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node
  const refs = [
    statusDropdownRef.value,
    ...orderDropdownRefs.value
  ]

  let clickedInside = false
  for (const ref of refs) {
    if (ref && ref.contains && ref.contains(target)) {
      clickedInside = true
      break
    }
  }

  if (!clickedInside) {
    Object.keys(openDropdowns).forEach(key => {
      openDropdowns[key] = false
    })
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', repositionOpenOrderMenus)
  window.addEventListener('scroll', repositionOpenOrderMenus, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', repositionOpenOrderMenus)
  window.removeEventListener('scroll', repositionOpenOrderMenus, true)
  if (isOpen.value) unlockScroll()
})

defineExpose({
  openModal,
  closeModal,
})
</script>
