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
            class="relative z-10 w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col"
            @click.stop
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col min-h-[600px] max-h-[90vh]">
              <div class="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 id="modal-title" class="text-lg font-semibold text-gray-900 dark:text-white">
                  Edit Order
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

                <!-- Order Number -->
                <div class="relative">
                  <label class="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                    <span class="text-red-500">*</span> Order Number
                  </label>
                  <input
                    v-model="form.orderNo"
                    type="text"
                    placeholder="Enter Order Number"
                    maxlength="50"
                    :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.orderNo }]"
                  />
                  <transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="errors.orderNo" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.orderNo }}</p>
                    </div>
                  </transition>
                </div>

                <!-- Order Type & Customer ID Row -->
                <div class="grid grid-cols-2 gap-4">
                  <!-- Order Type -->
                  <div class="relative">
                    <label class="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                      <span class="text-red-500">*</span> Order Type
                    </label>
                    <div class="dropdown relative inline-flex w-full" ref="orderTypeDropdownRef">
                      <button
                        type="button"
                        :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400', { 'btn-error': errors.orderType }]"
                        :aria-expanded="openDropdowns.orderType"
                        @click.stop="toggleDropdown('orderType')"
                      >
                        {{ form.orderType || 'Select Type' }}
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
                          <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('orderType', type)">
                            {{ type }}
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
                      <div v-if="errors.orderType" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                        <p class="text-xs text-red-600 dark:text-red-400">{{ errors.orderType }}</p>
                      </div>
                    </transition>
                  </div>

                  <!-- Customer ID -->
                  <div class="relative">
                    <label class="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                      <span class="text-red-500">*</span> Customer ID
                    </label>
                    <div class="dropdown relative inline-flex w-full" ref="customerDropdownRef">
                      <button
                        type="button"
                        :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400', { 'btn-error': errors.customerId }]"
                        :aria-expanded="openDropdowns.customer"
                        @click.stop="toggleDropdown('customer')"
                        :disabled="loadingCustomers"
                      >
                        {{ selectedCustomerLabel || 'Select Customer' }}
                        <span
                          class="icon-[tabler--chevron-down] size-4 transition-transform"
                          :class="{ 'rotate-180': openDropdowns.customer }"
                        ></span>
                      </button>

                      <ul
                        class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white max-h-60 overflow-y-auto"
                        :class="{ 'opacity-100 pointer-events-auto': openDropdowns.customer, 'opacity-0 pointer-events-none': !openDropdowns.customer }"
                        role="menu"
                      >
                        <li v-for="customer in customers" :key="customer.id">
                          <a
                            class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
                            @click="selectOption('customerId', customer.id.toString())"
                            :class="{ 'bg-blue-100 dark:bg-blue-900/40': form.customerId === customer.id.toString() }"
                          >
                            {{ customer.customerName }}
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <!-- Order Status -->
                <div class="relative">
                  <label class="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                    <span class="text-red-500">*</span> Order Status
                  </label>
                  <div class="dropdown relative inline-flex w-full" ref="orderStatusDropdownRef">
                    <button
                      type="button"
                      :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400', { 'btn-error': errors.orderStatus }]"
                      :aria-expanded="openDropdowns.orderStatus"
                      @click.stop="toggleDropdown('orderStatus')"
                    >
                      {{ form.status || 'Select Status' }}
                      <span class="icon-[tabler--chevron-down] size-4 transition-transform" :class="{ 'rotate-180': openDropdowns.orderStatus }"></span>
                    </button>
                    <ul
                      class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white"
                      :class="{ 'opacity-100 pointer-events-auto': openDropdowns.orderStatus, 'opacity-0 pointer-events-none': !openDropdowns.orderStatus }"
                      role="menu"
                    >
                      <li v-for="stat in orderStatuses" :key="stat">
                        <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('orderStatus', stat)">
                          {{ stat }}
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
                    <div v-if="errors.orderStatus" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.orderStatus }}</p>
                    </div>
                  </transition>
                </div>

                <!-- PIC Name -->
                <div class="relative">
                  <label class="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                    <span class="text-red-500">*</span> PIC's Name
                  </label>
                  <input
                    v-model="form.picName"
                    type="text"
                    placeholder="Enter PIC Name"
                    maxlength="100"
                    :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.picName }]"
                  />
                  <transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="errors.picName" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.picName }}</p>
                    </div>
                  </transition>
                </div>

                <!-- Order Items Section -->
                <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">Order Items</h3>

                  <!-- Unified Item Status -->
                  <div class="mb-4 relative">
                    <label class="block text-sm mb-2 text-gray-700 dark:text-gray-300">Order Item Status</label>
                    <div class="dropdown relative inline-flex w-full" ref="itemStatusDropdownRef">
                      <button
                        type="button"
                        class="dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400"
                        :aria-expanded="openDropdowns.itemStatus"
                        @click.stop="toggleDropdown('itemStatus')"
                      >
                        {{ form.itemStatus || 'Select Item Status' }}
                        <span class="icon-[tabler--chevron-down] size-4 transition-transform" :class="{ 'rotate-180': openDropdowns.itemStatus }"></span>
                      </button>
                      <ul
                        class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white"
                        :class="{ 'opacity-100 pointer-events-auto': openDropdowns.itemStatus, 'opacity-0 pointer-events-none': !openDropdowns.itemStatus }"
                        role="menu"
                      >
                        <li v-for="st in itemStatuses" :key="st">
                          <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('itemStatus', st)">
                            {{ st }}
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div v-for="(item, index) in form.orderItems" :key="index" class="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex justify-between items-center mb-2">
                      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Product {{ index + 1 }}</span>
                      <button
                        v-if="form.orderItems.length > 1"
                        type="button"
                        @click="removeOrderItem(index)"
                        class="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    <!-- Product Selection -->
                    <div class="mb-3 relative">
                      <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                        <span class="text-red-500">*</span> Product
                      </label>
                      <div class="dropdown relative inline-flex w-full" :ref="`productDropdown${index}`">
                        <button
                          type="button"
                          :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400', { 'btn-error': errors[`item${index}Product`] }]"
                          :aria-expanded="openDropdowns[`product${index}`]"
                          @click.stop="toggleDropdown(`product${index}`)"
                          :disabled="loadingProducts"
                        >
                          {{ getProductLabel(item.productId) || 'Select Product' }}
                          <span
                            class="icon-[tabler--chevron-down] size-4 transition-transform"
                            :class="{ 'rotate-180': openDropdowns[`product${index}`] }"
                          ></span>
                        </button>

                        <ul
                          class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white max-h-60 overflow-y-auto"
                          :class="{ 'opacity-100 pointer-events-auto': openDropdowns[`product${index}`], 'opacity-0 pointer-events-none': !openDropdowns[`product${index}`] }"
                          role="menu"
                        >
                          <li v-for="product in products" :key="product.id">
                            <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="updateOrderItem(index, 'productId', product.id.toString())">
                              {{ product.skuCode }} - {{ product.name }}
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <!-- Quantity Row -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <!-- Quantity -->
                      <div class="relative">
                        <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                          <span class="text-red-500">*</span> Quantity
                        </label>
                        <div class="flex items-center gap-2">
                          <button
                            type="button"
                            @click="updateOrderItem(index, 'quantity', Math.max(1, item.quantity - 1))"
                            class="btn btn-sm btn-outline"
                          >
                            −
                          </button>
                          <input
                            :value="item.quantity"
                            type="number"
                            min="1"
                            class="input input-bordered w-full text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            @input="updateOrderItem(index, 'quantity', parseInt(($event.target as HTMLInputElement).value) || 1)"
                          />
                          <button
                            type="button"
                            @click="updateOrderItem(index, 'quantity', item.quantity + 1)"
                            class="btn btn-sm btn-primary"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Add Another Product Button -->
                  <button
                    type="button"
                    @click="addOrderItem"
                    class="btn btn-primary btn-sm w-full"
                  >
                    <span class="text-lg">+</span> Add Another Product
                  </button>
                </div>

                <!-- Estimated Delivery Time -->
                <div class="relative">
                  <label class="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                    <span class="text-red-500">*</span> Estimated Delivery Time
                  </label>
                  <input
                    ref="deliveryDateInput"
                    v-model="form.estimatedDeliveryTime"
                    type="text"
                    placeholder="Pick Date"
                    :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.estimatedDeliveryTime }]"
                    readonly
                  />
                  <transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="errors.estimatedDeliveryTime" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.estimatedDeliveryTime }}</p>
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
                  {{ isSubmitting ? 'Updating...' : 'Update' }}
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
import { ref, reactive, nextTick, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import authenticatedFetch from '@/utils/authenticatedFetch'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.css'

interface Customer {
  id: number
  customerName: string
  customerCode?: string
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

interface OrderForm {
  id: number | null
  orderNo: string
  orderType: string
  customerId: string | null
  picName: string
  estimatedDeliveryTime: string
  status: string
  itemStatus: string
  orderItems: OrderItem[]
}

const emit = defineEmits(['order-updated'])

/* State */
const isOpen = ref(false)
const isSubmitting = ref(false)
const panelRef = ref<HTMLElement | null>(null)
const loadingCustomers = ref(false)
const loadingProducts = ref(false)
const deliveryDateInput = ref(null)
let flatpickrInstance: any = null

const form = reactive<OrderForm>({
  id: null,
  orderNo: '',
  orderType: '',
  customerId: null,
  picName: '',
  estimatedDeliveryTime: '',
  status: '',
  itemStatus: 'Pending',
  orderItems: [{ productId: '', quantity: 1, status: 'Pending' }]
})

const errors = reactive<Record<string, string>>({
  submit: '',
  orderNo: '',
  orderType: '',
  customerId: '',
  picName: '',
  estimatedDeliveryTime: '',
  orderStatus: ''
})

const orderTypes = ['PO', 'SO', 'RMA']
const orderStatuses = ['Created', 'Processing', 'Confirmed', 'Shipped', 'Completed', 'Cancelled']
const itemStatuses = ['Pending', 'Allocated', 'Picked', 'Packed', 'Shipped', 'Delivered', 'Backordered', 'Rejected', 'Cancelled']
const customers = ref<Customer[]>([])
const products = ref<Product[]>([])
const openDropdowns = reactive<Record<string, boolean>>({
  orderType: false,
  customer: false,
  orderStatus: false,
  itemStatus: false
})

// Fallback label if the customer isn't in the fetched list (e.g. soft-deleted or filtered out)
const prefilledCustomerName = ref<string | null>(null)

const selectedCustomerLabel = computed(() => {
  if (!form.customerId) return prefilledCustomerName.value
  const customer = customers.value.find(c => c.id.toString() === form.customerId)
  // If customer not found yet (maybe filtered or not loaded), show the raw ID as fallback
  return customer ? customer.customerName : `Customer #${form.customerId}`
})

/* Scroll Lock */
let scrollY = 0
let scrollbarWidth = 0

const getScrollbarWidth = () => window.innerWidth - document.documentElement.clientWidth

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
  requestAnimationFrame(() => window.scrollTo(0, scrollY))
}

/* Fetch Data */
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
    errors.submit = 'Failed to load customers and products'
  } finally {
    loadingCustomers.value = false
    loadingProducts.value = false
  }
}

/* Validation */
const validateForm = () => {
  Object.keys(errors).forEach(key => errors[key] = '')
  let isValid = true

  if (!form.orderNo.trim()) {
    errors.orderNo = 'Order Number is required'
    isValid = false
  }

  if (!form.orderType) {
    errors.orderType = 'Order Type is required'
    isValid = false
  }

  if (!form.picName.trim()) {
    errors.picName = 'PIC Name is required'
    isValid = false
  }

  if (!form.status) {
    errors.orderStatus = 'Order Status is required'
    isValid = false
  }

  if (!form.estimatedDeliveryTime) {
    errors.estimatedDeliveryTime = 'Estimated Delivery Time is required'
    isValid = false
  }

  form.orderItems.forEach((item, idx) => {
    if (!item.productId) {
      errors[`item${idx}Product`] = 'Product is required'
      isValid = false
    }
    if (!item.quantity || item.quantity < 1) {
      errors[`item${idx}Quantity`] = 'Valid quantity is required'
      isValid = false
    }
  })

  return isValid
}

/* Clear errors on input */
watch(() => form.orderNo, () => { if (errors.orderNo) errors.orderNo = '' })
watch(() => form.orderType, () => { if (errors.orderType) errors.orderType = '' })
watch(() => form.picName, () => { if (errors.picName) errors.picName = '' })
watch(() => form.status, () => { if (errors.orderStatus) errors.orderStatus = '' })

/* Helpers */
const toggleDropdown = (name: string) => {
  Object.keys(openDropdowns).forEach(k => {
    if (k !== name) openDropdowns[k] = false
  })
  openDropdowns[name] = !openDropdowns[name]
}

const selectOption = (key: string, value: string) => {
  switch (key) {
    case 'orderType':
      form.orderType = value
      openDropdowns.orderType = false
      break
    case 'customerId':
      form.customerId = value
      openDropdowns.customer = false
      break
    case 'orderStatus':
      form.status = value
      openDropdowns.orderStatus = false
      break
    case 'itemStatus':
      form.itemStatus = value
      openDropdowns.itemStatus = false
      form.orderItems.forEach(oi => { oi.status = value })
      break
  }
}

const getProductLabel = (productId: string | number) => {
  const product = products.value.find(p => p.id.toString() === productId.toString())
  return product ? `${product.skuCode} - ${product.name}` : null
}

const addOrderItem = () => {
  form.orderItems.push({ productId: '', quantity: 1, status: form.itemStatus || 'Pending' })
}

const removeOrderItem = (index: number) => {
  form.orderItems.splice(index, 1)
}

const updateOrderItem = (index: number, key: string, value: any) => {
  form.orderItems[index][key as keyof OrderItem] = value
  openDropdowns[`product${index}`] = false
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node
  if (!panelRef.value?.contains(target)) {
    Object.keys(openDropdowns).forEach(k => openDropdowns[k] = false)
  }
}

/* Prefill existing order */
const prefillOrder = (order: any) => {
  console.log('Prefilling order:', order)
  form.id = order.id || null
  form.orderNo = order.orderNo || ''
  form.orderType = order.orderType || ''
  form.picName = order.picName || ''
  form.status = order.status || ''
  form.estimatedDeliveryTime = order.estimatedDeliveryTime ? order.estimatedDeliveryTime.split('T')[0] : ''

  // Try to determine customerId via multiple fallbacks
  let derivedCustomerId: string | null = null
  
  console.log('Checking customer data...')
  console.log('order.customer:', order.customer)
  console.log('order.customerId:', order.customerId)
  
  if (order.customer?.id) {
    derivedCustomerId = order.customer.id.toString()
    prefilledCustomerName.value = order.customer.customerName || null
    console.log('Using order.customer.id:', derivedCustomerId)
    // Verify this customer exists in our fetched list
    const exists = customers.value.find(c => c.id.toString() === derivedCustomerId)
    console.log('Customer exists in list:', exists)
    if (!exists) {
      console.warn(`Customer ID ${derivedCustomerId} not found in fetched customers list`)
    }
  } else if (order.customerId) {
    derivedCustomerId = order.customerId.toString()
    console.log('Using order.customerId:', derivedCustomerId)
    // Try to find the customer name from our fetched list
    const customer = customers.value.find(c => c.id.toString() === derivedCustomerId)
    console.log('Found customer in list:', customer)
    prefilledCustomerName.value = customer?.customerName || null
  } else if (order.customerCode || order.customerName) {
    console.log('Trying to match by code/name')
    // Attempt to match against fetched customers by code or name
    const match = customers.value.find(c =>
      (order.customerCode && c.customerCode === order.customerCode) ||
      (order.customerName && c.customerName === order.customerName)
    )
    if (match) {
      derivedCustomerId = match.id.toString()
      prefilledCustomerName.value = match.customerName
      console.log('Matched customer:', match)
    } else {
      // store provided display name even if not found
      prefilledCustomerName.value = order.customerName || order.customerCode || null
      console.log('No match found, using name:', prefilledCustomerName.value)
    }
  } else {
    prefilledCustomerName.value = null
    console.log('No customer data found')
  }
  
  form.customerId = derivedCustomerId
  console.log('Final form.customerId:', form.customerId)
  console.log('Final prefilledCustomerName:', prefilledCustomerName.value)

  // Determine unified item status (if all same)
  if (order.orderItems && order.orderItems.length) {
    const statuses = order.orderItems.map((i: any) => i.status || 'Pending')
    const first = statuses[0] || 'Pending'
    const allSame = statuses.every(s => s === first)
    form.itemStatus = allSame ? first : first // Could extend to show mixed state later
    form.orderItems = order.orderItems.map((i: any) => ({
      productId: i.product?.id ? i.product.id.toString() : (i.productId ? i.productId.toString() : ''),
      quantity: i.quantity || 1,
      status: i.status || form.itemStatus
    }))
  } else {
    form.itemStatus = 'Pending'
    form.orderItems = [{ productId: '', quantity: 1, status: 'Pending' }]
  }
}

/* Modal Control */
const openModal = async (order: any) => {
  console.log('Opening modal with order:', order)
  await fetchData()
  await nextTick() // Wait for Vue to update reactive data
  console.log('Customers loaded:', customers.value)
  console.log('Customer from order:', order.customer, 'CustomerId:', order.customerId)
  prefillOrder(order)
  console.log('Form customerId after prefill:', form.customerId)
  Object.keys(errors).forEach(key => errors[key] = '')

  isOpen.value = true
  lockScroll()
  await nextTick()

  if (deliveryDateInput.value && !flatpickrInstance) {
    flatpickrInstance = flatpickr(deliveryDateInput.value, {
      dateFormat: 'Y-m-d',
      defaultDate: form.estimatedDeliveryTime ? new Date(form.estimatedDeliveryTime) : new Date(),
      onChange: (dates: Date[]) => {
        if (dates[0]) {
          const year = dates[0].getFullYear()
          const month = String(dates[0].getMonth() + 1).padStart(2, '0')
          const day = String(dates[0].getDate()).padStart(2, '0')
          form.estimatedDeliveryTime = `${year}-${month}-${day}`
        }
      }
    })
  }
}

const closeModal = async () => {
  Object.keys(openDropdowns).forEach(k => openDropdowns[k] = false)

  if (flatpickrInstance) {
    flatpickrInstance.destroy()
    flatpickrInstance = null
  }

  isOpen.value = false
  await nextTick()
}

/* Submit (PATCH existing order) */
const submitForm = async () => {
  if (!validateForm()) return
  if (!form.id) {
    errors.submit = 'Order ID missing'
    return
  }

  isSubmitting.value = true
  errors.submit = ''

  try {
    form.orderItems.forEach(oi => { oi.status = form.itemStatus })

    const submissionData = {
      orderNo: form.orderNo,
      orderType: form.orderType,
      customerId: form.customerId ? parseInt(form.customerId) : null,
      picName: form.picName,
      status: form.status,
      estimatedDeliveryTime: form.estimatedDeliveryTime,
      orderItems: form.orderItems.map(item => ({
        productId: parseInt(item.productId.toString()),
        quantity: item.quantity,
        status: item.status
      }))
    }

    const response = await authenticatedFetch(`/api/order/${form.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionData)
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || 'Failed to update order')
    }

    const data = await response.json()
    await closeModal()
    emit('order-updated', { success: true, data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update order'
    errors.submit = message
    emit('order-updated', { success: false, error: message })
  } finally {
    isSubmitting.value = false
  }
}

/* Lifecycle */
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  if (flatpickrInstance) flatpickrInstance.destroy()
  if (isOpen.value) unlockScroll()
})

defineExpose({ openModal, closeModal })
</script>

<style scoped>
[role="dialog"] > .bg-white {
  transform-origin: center;
}
</style>