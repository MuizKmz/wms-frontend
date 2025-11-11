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
                  <h2 class="text-xl font-bold text-gray-900 dark:text-white">Create New Order</h2>
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
                <!-- Step 1: Customer -->
                <div v-if="currentStep === 1">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Information</h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Customer <span class="text-red-500">*</span>
                      </label>
                      <div class="dropdown relative inline-flex w-full" ref="customerDropdownRef">
                        <button
                          type="button"
                          :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400', { 'btn-error': errors.customerId }]"
                          :aria-expanded="openDropdowns.customer"
                          @click.stop="toggleDropdown('customer')"
                          :disabled="loadingCustomers"
                        >
                          <span class="truncate pr-2">{{ selectedCustomerLabel || 'Select Customer' }}</span>
                          <span
                            class="icon-[tabler--chevron-down] size-4 transition-transform flex-shrink-0"
                            :class="{ 'rotate-180': openDropdowns.customer }"
                          ></span>
                        </button>

                        <ul
                          class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white max-h-60 overflow-y-auto"
                          :class="{ 'opacity-100 pointer-events-auto': openDropdowns.customer, 'opacity-0 pointer-events-none': !openDropdowns.customer }"
                          role="menu"
                        >
                          <li v-for="customer in customers" :key="customer.id">
                            <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectCustomer(customer.id)">
                              {{ customer.customerName }}
                            </a>
                          </li>
                        </ul>
                      </div>
                      <span v-if="errors.customerId" class="text-xs text-red-500 mt-1">{{ errors.customerId }}</span>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        PIC Name <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="formData.picName"
                        type="text"
                        class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter PIC name"
                        maxlength="100"
                      />
                      <span v-if="errors.picName" class="text-xs text-red-500 mt-1">{{ errors.picName }}</span>
                    </div>
                  </div>
                </div>

                <!-- Step 2: Order Details -->
                <div v-if="currentStep === 2">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Details</h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Order Number <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="formData.orderNo"
                        type="text"
                        class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter order number"
                        maxlength="50"
                      />
                      <span v-if="errors.orderNo" class="text-xs text-red-500 mt-1">{{ errors.orderNo }}</span>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Order Type <span class="text-red-500">*</span>
                      </label>
                      <div class="dropdown relative inline-flex w-full" ref="orderTypeDropdownRef">
                        <button
                          type="button"
                          :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400', { 'btn-error': errors.orderType }]"
                          :aria-expanded="openDropdowns.orderType"
                          @click.stop="toggleDropdown('orderType')"
                        >
                          {{ formData.orderType || 'Select Type' }}
                          <span
                            class="icon-[tabler--chevron-down] size-4 transition-transform"
                            :class="{ 'rotate-180': openDropdowns.orderType }"
                          ></span>
                        </button>

                        <ul
                          class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white"
                          :class="{ 'opacity-100 pointer-events-auto': openDropdowns.orderType, 'opacity-0 pointer-events-none': !openDropdowns.orderType }"
                          role="menu"
                        >
                          <li v-for="type in orderTypes" :key="type">
                            <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOrderType(type)">
                              {{ type }}
                            </a>
                          </li>
                        </ul>
                      </div>
                      <span v-if="errors.orderType" class="text-xs text-red-500 mt-1">{{ errors.orderType }}</span>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Order Status <span class="text-red-500">*</span>
                      </label>
                      <div class="dropdown relative inline-flex w-full" ref="orderStatusDropdownRef">
                        <button
                          type="button"
                          :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400', { 'btn-error': errors.status }]"
                          :aria-expanded="openDropdowns.orderStatus"
                          @click.stop="toggleDropdown('orderStatus')"
                        >
                          {{ formData.status || 'Select Status' }}
                          <span class="icon-[tabler--chevron-down] size-4 transition-transform" :class="{ 'rotate-180': openDropdowns.orderStatus }"></span>
                        </button>
                        <ul
                          class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white"
                          :class="{ 'opacity-100 pointer-events-auto': openDropdowns.orderStatus, 'opacity-0 pointer-events-none': !openDropdowns.orderStatus }"
                          role="menu"
                        >
                          <li v-for="stat in orderStatuses" :key="stat">
                            <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOrderStatus(stat)">
                              {{ stat }}
                            </a>
                          </li>
                        </ul>
                      </div>
                      <span v-if="errors.status" class="text-xs text-red-500 mt-1">{{ errors.status }}</span>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Estimated Delivery Time <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="formData.estimatedDeliveryTime"
                        type="date"
                        class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <span v-if="errors.estimatedDeliveryTime" class="text-xs text-red-500 mt-1">{{ errors.estimatedDeliveryTime }}</span>
                    </div>
                  </div>
                </div>

                <!-- Step 3: Products -->
                <div v-if="currentStep === 3">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product Items</h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Item Status <span class="text-red-500">*</span>
                      </label>
                      <div class="dropdown relative inline-flex w-full" ref="itemStatusDropdownRef">
                        <button
                          type="button"
                          :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400']"
                          :aria-expanded="openDropdowns.itemStatus"
                          @click.stop="toggleDropdown('itemStatus')"
                        >
                          {{ formData.itemStatus || 'Select Item Status' }}
                          <span class="icon-[tabler--chevron-down] size-4 transition-transform" :class="{ 'rotate-180': openDropdowns.itemStatus }"></span>
                        </button>
                        <ul
                          class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white max-h-60 overflow-y-auto"
                          :class="{ 'opacity-100 pointer-events-auto': openDropdowns.itemStatus, 'opacity-0 pointer-events-none': !openDropdowns.itemStatus }"
                          role="menu"
                        >
                          <li v-for="stat in itemStatuses" :key="stat">
                            <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectItemStatus(stat)">
                              {{ stat }}
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <!-- Order Items -->
                    <div class="space-y-3">
                      <div
                        v-for="(item, index) in formData.orderItems"
                        :key="index"
                        class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div class="flex items-start gap-4">
                          <div class="flex-1 space-y-3">
                            <div>
                              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Product <span class="text-red-500">*</span>
                              </label>
                              <div class="dropdown relative inline-flex w-full" :ref="`productDropdown${index}`">
                                <button
                                  type="button"
                                  :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400 text-left', { 'btn-error': errors[`item${index}Product`] }]"
                                  :aria-expanded="openDropdowns[`product${index}`]"
                                  @click.stop="toggleDropdown(`product${index}`)"
                                  :disabled="loadingProducts"
                                >
                                  <span class="truncate pr-2">{{ getProductLabel(item.productId) || 'Select Product' }}</span>
                                  <span
                                    class="icon-[tabler--chevron-down] size-4 transition-transform flex-shrink-0"
                                    :class="{ 'rotate-180': openDropdowns[`product${index}`] }"
                                  ></span>
                                </button>

                                <ul
                                  class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white max-h-60 overflow-y-auto"
                                  :class="{ 'opacity-100 pointer-events-auto': openDropdowns[`product${index}`], 'opacity-0 pointer-events-none': !openDropdowns[`product${index}`] }"
                                  role="menu"
                                >
                                  <li v-for="product in products" :key="product.id">
                                    <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectProduct(index, product.id)">
                                      {{ product.skuCode }} - {{ product.name }}
                                    </a>
                                  </li>
                                </ul>
                              </div>
                              <span v-if="errors[`item${index}Product`]" class="text-xs text-red-500 mt-1">{{ errors[`item${index}Product`] }}</span>
                            </div>
                            <div>
                              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Quantity <span class="text-red-500">*</span>
                              </label>
                              <input
                                v-model.number="item.quantity"
                                type="number"
                                min="1"
                                class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Enter quantity"
                              />
                              <span v-if="errors[`item${index}Quantity`]" class="text-xs text-red-500 mt-1">{{ errors[`item${index}Quantity`] }}</span>
                            </div>
                          </div>
                          <button
                            v-if="formData.orderItems.length > 1"
                            @click="removeOrderItem(index)"
                            class="mt-6 p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                            aria-label="Remove item"
                          >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      @click="addOrderItem"
                      class="btn btn-outline w-full"
                    >
                      + Add Another Product
                    </button>
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
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import authenticatedFetch from '@/utils/authenticatedFetch'

interface Customer {
  id: number
  customerName: string
}

interface Product {
  id: number
  skuCode: string
  name: string
}

interface OrderItem {
  productId: string | number
  quantity: number
  status: string
}

const emit = defineEmits(['order-created', 'close'])

const isOpen = ref(false)
const isSubmitting = ref(false)
const currentStep = ref(1)
const totalSteps = 3

const steps = [
  { id: 1, name: 'Customer' },
  { id: 2, name: 'Order' },
  { id: 3, name: 'Products' },
]

const formData = reactive({
  // Step 1: Customer
  customerId: null as number | null,
  picName: '',
  // Step 2: Order
  orderNo: '',
  orderType: '',
  status: '',
  estimatedDeliveryTime: '',
  // Step 3: Products
  itemStatus: 'Pending',
  orderItems: [{ productId: '', quantity: 1, status: 'Pending' }] as OrderItem[]
})

const errors = reactive<Record<string, string>>({})

const loadingCustomers = ref(false)
const loadingProducts = ref(false)
const customers = ref<Customer[]>([])
const products = ref<Product[]>([])

const orderTypes = ['PO', 'SO']
const orderStatuses = ['Created', 'Processing', 'Confirmed', 'Shipped', 'Completed', 'Cancelled']
const itemStatuses = ['Pending', 'Allocated', 'Picked', 'Packed', 'Shipped', 'Delivered', 'Backordered', 'Rejected', 'Cancelled']

const openDropdowns = reactive<Record<string, boolean>>({})

const selectedCustomerLabel = computed(() => {
  if (!formData.customerId) return null
  const customer = customers.value.find(c => c.id === formData.customerId)
  return customer ? customer.customerName : null
})

const lockScroll = () => {
  document.body.style.overflow = 'hidden'
}

const unlockScroll = () => {
  document.body.style.overflow = ''
}

const fetchData = async () => {
  loadingCustomers.value = true
  loadingProducts.value = true
  try {
    const [customersRes, productsRes] = await Promise.all([
      authenticatedFetch('/api/customer'),
      authenticatedFetch('/api/product')
    ])

    if (customersRes.ok) customers.value = await customersRes.json()
    if (productsRes.ok) products.value = await productsRes.json()
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loadingCustomers.value = false
    loadingProducts.value = false
  }
}

const openModal = async () => {
  await fetchData()
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
  formData.customerId = null
  formData.picName = ''
  formData.orderNo = ''
  formData.orderType = ''
  formData.status = ''
  formData.estimatedDeliveryTime = ''
  formData.itemStatus = 'Pending'
  formData.orderItems = [{ productId: '', quantity: 1, status: 'Pending' }]
  Object.keys(errors).forEach((key) => delete errors[key])
  Object.keys(openDropdowns).forEach((key) => delete openDropdowns[key])
}

const validateStep = (step: number): boolean => {
  Object.keys(errors).forEach((key) => delete errors[key])

  if (step === 1) {
    if (!formData.customerId) errors.customerId = 'Customer is required'
    if (!formData.picName.trim()) errors.picName = 'PIC name is required'
  } else if (step === 2) {
    if (!formData.orderNo.trim()) errors.orderNo = 'Order number is required'
    if (!formData.orderType) errors.orderType = 'Order type is required'
    if (!formData.status) errors.status = 'Order status is required'
    if (!formData.estimatedDeliveryTime) errors.estimatedDeliveryTime = 'Estimated delivery time is required'
  } else if (step === 3) {
    formData.orderItems.forEach((item, idx) => {
      if (!item.productId) {
        errors[`item${idx}Product`] = 'Product is required'
      }
      if (!item.quantity || item.quantity < 1) {
        errors[`item${idx}Quantity`] = 'Valid quantity is required'
      }
    })
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

const selectCustomer = (customerId: number) => {
  formData.customerId = customerId
  openDropdowns.customer = false
}

const selectOrderType = (type: string) => {
  formData.orderType = type
  openDropdowns.orderType = false
}

const selectOrderStatus = (status: string) => {
  formData.status = status
  openDropdowns.orderStatus = false
}

const selectItemStatus = (status: string) => {
  formData.itemStatus = status
  openDropdowns.itemStatus = false
  formData.orderItems.forEach(item => { item.status = status })
}

const selectProduct = (index: number, productId: number) => {
  formData.orderItems[index].productId = productId
  openDropdowns[`product${index}`] = false
}

const getProductLabel = (productId: string | number) => {
  if (!productId) return null
  const product = products.value.find(p => p.id.toString() === productId.toString())
  return product ? `${product.skuCode} - ${product.name}` : null
}

const addOrderItem = () => {
  formData.orderItems.push({ productId: '', quantity: 1, status: formData.itemStatus || 'Pending' })
}

const removeOrderItem = (index: number) => {
  formData.orderItems.splice(index, 1)
}

const submitForm = async () => {
  if (!validateStep(currentStep.value)) return

  isSubmitting.value = true

  try {
    // Ensure all item statuses reflect the unified itemStatus selection
    formData.orderItems.forEach(item => { item.status = formData.itemStatus })

    const submissionData = {
      orderNo: formData.orderNo,
      orderType: formData.orderType,
      customerId: formData.customerId,
      picName: formData.picName,
      status: formData.status,
      estimatedDeliveryTime: formData.estimatedDeliveryTime,
      orderItems: formData.orderItems.map(item => ({
        productId: parseInt(item.productId.toString()),
        quantity: item.quantity,
        status: item.status
      }))
    }

    const response = await authenticatedFetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionData)
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || 'Failed to create order')
    }

    const data = await response.json()
    
    // Emit success event first so parent can show toast
    emit('order-created', { success: true, data })
    
    // Small delay to let toast appear before closing modal
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Then close modal (force=true to bypass isSubmitting check)
    await closeModal(true)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create order'
    emit('order-created', { success: false, error: message })
  } finally {
    isSubmitting.value = false
  }
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node
  const dropdownRefs = Object.keys(openDropdowns)
  let clickedOutside = true

  dropdownRefs.forEach(key => {
    const refName = key === 'customer' ? 'customerDropdownRef' :
                    key === 'orderType' ? 'orderTypeDropdownRef' :
                    key === 'orderStatus' ? 'orderStatusDropdownRef' :
                    key === 'itemStatus' ? 'itemStatusDropdownRef' :
                    key.startsWith('product') ? `productDropdown${key.replace('product', '')}` : null

    // Since we can't access refs directly in this context, we'll close all dropdowns on outside click
    // This is a simplified approach
  })

  // Close all dropdowns when clicking outside
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
