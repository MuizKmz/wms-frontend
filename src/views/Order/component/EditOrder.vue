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
                    disabled
                    :class="['input input-bordered w-full bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed', { 'input-error': errors.orderNo }]"
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
                    <div class="dropdown relative inline-flex w-full">
                      <button
                        type="button"
                        disabled
                        class="dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-600 dark:text-gray-400 cursor-not-allowed opacity-60 bg-gray-100"
                      >
                        {{ form.orderType || 'Select Type' }}
                        <span class="icon-[tabler--chevron-down] size-4"></span>
                      </button>
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
                      <span class="text-red-500">*</span> Customer Code
                    </label>
                    <div class="dropdown relative inline-flex w-full">
                      <button
                        type="button"
                        disabled
                        class="dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-600 dark:text-gray-400 cursor-not-allowed opacity-60 bg-gray-100"
                      >
                        {{ selectedCustomerLabel || 'Select Customer' }}
                        <span class="icon-[tabler--chevron-down] size-4"></span>
                      </button>
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
                          <li v-for="product in getAvailableProducts(index)" :key="product.id">
                            <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="updateOrderItem(index, 'productId', product.id.toString())">
                              {{ product.skuCode }} - {{ product.name }}
                            </a>
                          </li>
                          <li v-if="getAvailableProducts(index).length === 0" class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                            All products already selected
                          </li>
                        </ul>
                      </div>
                    </div>

                    <!-- Quantity and Status Row -->
                    <div class="grid grid-cols-1 gap-3">
                      <!-- Quantity -->
                      <div class="relative">
                        <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                          <span class="text-red-500">*</span> Quantity
                          <span v-if="form.orderType === 'SO' && item.productId && item.availableStock !== undefined" class="text-xs text-gray-500 ml-1">
                            (Available: {{ item.availableStock }})
                          </span>
                        </label>
                        <div class="flex items-center gap-2">
                          <button
                            type="button"
                            @click="decreaseQuantity(index)"
                            class="btn btn-sm btn-outline"
                          >
                            −
                          </button>
                          <input
                            :value="item.quantity"
                            type="number"
                            min="1"
                            :max="form.orderType === 'SO' && item.availableStock !== undefined ? item.availableStock : undefined"
                            class="input input-bordered w-full text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            @input="validateQuantityInput(index, ($event.target as HTMLInputElement).value)"
                          />
                          <button
                            type="button"
                            @click="increaseQuantity(index)"
                            :disabled="form.orderType === 'SO' && item.availableStock !== undefined && item.quantity >= item.availableStock"
                            class="btn btn-sm bg-brand-500 border-none disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>
                        <span v-if="form.orderType === 'SO' && item.productId && item.availableStock !== undefined && item.quantity > item.availableStock" class="text-xs text-orange-600 dark:text-orange-400 mt-1 block">
                          ⚠️ Quantity exceeds available stock ({{ item.availableStock }})
                        </span>
                      </div>
                    </div>

                    <!-- Remarks -->
                    <div class="mt-3">
                      <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Remarks</label>
                      <textarea
                        v-model="item.remarks"
                        rows="2"
                        placeholder="Enter product remarks (optional)"
                        class="textarea textarea-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                      ></textarea>
                    </div>

                    <!-- Product Allocation Table for SO Orders -->
                    <div v-if="form.orderType === 'SO' && item.productId" class="mt-3">
                      <div class="flex items-center justify-between mb-2">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Product Allocation (FIFO)
                        </label>
                        <button
                          type="button"
                          @click="fetchProductInventory(index)"
                          class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          :disabled="loadingInventory[index]"
                        >
                          {{ loadingInventory[index] ? 'Loading...' : 'Refresh' }}
                        </button>
                      </div>
                      <div class="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead class="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                EPC Code
                              </th>
                              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Warehouse
                              </th>
                              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Location
                              </th>
                              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Last Updated
                              </th>
                            </tr>
                          </thead>
                          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            <tr v-if="loadingInventory[index]">
                              <td colspan="4" class="px-3 py-4 text-center text-sm text-gray-500">
                                <div class="flex items-center justify-center gap-2">
                                  <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                  </svg>
                                  Loading allocation...
                                </div>
                              </td>
                            </tr>
                            <tr v-else-if="!item.allocatedEpcs || item.allocatedEpcs.length === 0">
                              <td colspan="4" class="px-3 py-4 text-center text-sm text-gray-500">
                                {{ item.quantity > 0 ? 'Insufficient inventory - no INBOUND EPCs available' : 'Set quantity to view allocation' }}
                              </td>
                            </tr>
                            <tr v-else v-for="(allocation, allocIdx) in item.allocatedEpcs" :key="allocIdx" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td class="px-3 py-2 text-sm font-mono text-gray-900 dark:text-white">
                                {{ allocation.epcCode }}
                              </td>
                              <td class="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                {{ allocation.warehouseCode || '-' }}
                              </td>
                              <td class="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                {{ allocation.locationCode || '-' }}
                              </td>
                              <td class="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                {{ formatDate(allocation.inboundDate) }}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <!-- Add Another Product Button -->
                  <button
                    type="button"
                    @click="addOrderItem"
                    class="btn bg-brand-500 border-none btn-sm w-full"
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
                <button @click="submitForm" class="btn bg-brand-500 border-none" :disabled="isSubmitting">
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
  remarks: string
  availableStock?: number
  allocatedEpcs: Array<{
    id?: number
    epcCode: string
    warehouseCode: string
    locationCode: string
    inboundDate: string
  }>
}

interface OrderForm {
  id: number | null
  orderNo: string
  orderType: string
  customerId: string | null
  picName: string
  estimatedDeliveryTime: string
  status: string
  orderItems: OrderItem[]
}

const emit = defineEmits(['order-updated'])

/* State */
const isOpen = ref(false)
const isSubmitting = ref(false)
const panelRef = ref<HTMLElement | null>(null)
const loadingCustomers = ref(false)
const loadingProducts = ref(false)
const loadingInventory = ref<Record<number, boolean>>({})
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
  orderItems: [{ productId: '', quantity: 1, status: 'Pending', remarks: '', availableStock: undefined, allocatedEpcs: [] }]
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
  }
}

const getProductLabel = (productId: string | number) => {
  const product = products.value.find(p => p.id.toString() === productId.toString())
  return product ? `${product.skuCode} - ${product.name}` : null
}

const addOrderItem = () => {
  form.orderItems.push({ productId: '', quantity: 1, status: 'Pending', remarks: '', availableStock: undefined, allocatedEpcs: [] })
}

const removeOrderItem = (index: number) => {
  form.orderItems.splice(index, 1)
}

const getAvailableProducts = (currentIndex: number) => {
  // Get list of product IDs already selected in other rows
  const selectedProductIds = form.orderItems
    .map((item, idx) => idx !== currentIndex ? item.productId : null)
    .filter(Boolean)
  
  // Return products that are not selected in other rows
  return products.value.filter(product => 
    !selectedProductIds.includes(product.id.toString()) && 
    !selectedProductIds.includes(product.id)
  )
}

const updateOrderItem = async (index: number, key: string, value: any) => {
  if (key === 'productId') {
    // Check if product is already selected in another row
    const isAlreadySelected = form.orderItems.some((item, idx) => 
      idx !== index && (item.productId === value || item.productId.toString() === value.toString())
    )
    
    if (isAlreadySelected) {
      console.warn('Product already selected in another row')
      openDropdowns[`product${index}`] = false
      return
    }
    
    form.orderItems[index].productId = value
    openDropdowns[`product${index}`] = false
    
    // Clear product error
    if (errors[`item${index}Product`]) {
      delete errors[`item${index}Product`]
    }
    
    // Fetch inventory if order type is SO
    if (form.orderType === 'SO') {
      await fetchProductInventory(index)
    }
  } else if (key === 'quantity') {
    form.orderItems[index].quantity = value
  }
}

const increaseQuantity = (index: number) => {
  const item = form.orderItems[index]

  // Check available stock limit for SO orders
  if (form.orderType === 'SO' && item.availableStock !== undefined) {
    if (item.quantity >= item.availableStock) {
      return // Don't increase beyond available stock
    }
  }

  form.orderItems[index].quantity++
  // Re-allocate EPCs if SO order
  if (form.orderType === 'SO' && form.orderItems[index].productId) {
    fetchProductInventory(index)
  }
}

const decreaseQuantity = (index: number) => {
  if (form.orderItems[index].quantity > 1) {
    form.orderItems[index].quantity--
    // Re-allocate EPCs if SO order
    if (form.orderType === 'SO' && form.orderItems[index].productId) {
      fetchProductInventory(index)
    }
  }
}

const validateQuantityInput = (index: number, value: string) => {
  const item = form.orderItems[index]
  let newQuantity = parseInt(value) || 1

  if (newQuantity < 1) {
    newQuantity = 1
  }

  // Enforce available stock limit for SO orders
  if (form.orderType === 'SO' && item.availableStock !== undefined) {
    if (newQuantity > item.availableStock) {
      newQuantity = item.availableStock || 1
    }
  }

  form.orderItems[index].quantity = newQuantity

  // Re-allocate EPCs if SO order
  if (form.orderType === 'SO' && form.orderItems[index].productId) {
    fetchProductInventory(index)
  }
}

/* Fetch product inventory for SO orders and auto-assign EPCs using FIFO */
const fetchProductInventory = async (index: number) => {
  const item = form.orderItems[index]
  if (!item.productId) return

  loadingInventory.value[index] = true
  try {
    // Use available-epcs endpoint that excludes already-allocated EPCs
    const response = await authenticatedFetch('/api/inventory/available-epcs/list')
    if (response.ok) {
      const allInventory = await response.json()

      // Collect all INBOUND EPCs for this product with their location info
      const allEpcs: any[] = []

      allInventory.forEach((inv: any) => {
        const productId = inv.product?.id
        if (productId?.toString() === item.productId.toString()) {
          const inboundEpcs = inv.product?.epcs?.filter((epc: any) => epc.status === 'INBOUND') || []
          inboundEpcs.forEach((epc: any) => {
            allEpcs.push({
              epcCode: epc.epcCode,
              warehouseCode: epc.warehouse?.warehouseCode || '-',
              locationCode: epc.location?.locationCode || '-',
              inboundDate: epc.inboundDate || inv.lastUpdatedAt
            })
          })
        }
      })

      // Sort by inbound date ascending (FIFO - First In First Out)
      allEpcs.sort((a, b) => {
        return new Date(a.inboundDate).getTime() - new Date(b.inboundDate).getTime()
      })

      // Filter out EPCs already allocated to other order items (prevent duplicates)
      const availableEpcs = allEpcs.filter(epc => {
        const isAlreadyUsed = form.orderItems.some((otherItem, idx) => {
          if (idx === index) return false // Don't check against self
          return otherItem.allocatedEpcs?.some(allocated => allocated.epcCode === epc.epcCode)
        })
        return !isAlreadyUsed
      })

      // Set available stock (after filtering duplicates)
      item.availableStock = availableEpcs.length

      // Enforce quantity limit
      if (item.quantity > availableEpcs.length) {
        item.quantity = availableEpcs.length || 1
      }

      // Allocate EPCs based on quantity (FIFO)
      const allocatedEpcs = availableEpcs.slice(0, item.quantity)
      item.allocatedEpcs = allocatedEpcs
    }
  } catch (error) {
    console.error('Error fetching inventory:', error)
    item.allocatedEpcs = []
    item.availableStock = 0
  } finally {
    loadingInventory.value[index] = false
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
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
      console.warn(`Customer Code ${derivedCustomerId} not found in fetched customers list`)
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

  // Map order items with existing data (including allocated EPCs from the order)
  if (order.orderItems && order.orderItems.length) {
    form.orderItems = order.orderItems.map((i: any) => ({
      productId: i.product?.id ? i.product.id.toString() : (i.productId ? i.productId.toString() : ''),
      quantity: i.quantity || 1,
      status: i.status || 'Pending',
      remarks: i.remarks || '',
      availableStock: undefined,
      allocatedEpcs: i.allocatedEpcs || [] // Use existing allocated EPCs from order
    }))
    
    // For SO orders, load existing allocations - don't fetch new ones unless user changes quantity
    if (form.orderType === 'SO') {
      form.orderItems.forEach((item, index) => {
        if (item.productId && item.allocatedEpcs.length === 0) {
          // Only fetch if no allocations exist
          fetchProductInventory(index)
        } else if (item.allocatedEpcs.length > 0) {
          // Set available stock based on existing allocations
          item.availableStock = item.allocatedEpcs.length
        }
      })
    }
  } else {
    form.orderItems = [{ productId: '', quantity: 1, status: 'Pending', remarks: '', availableStock: undefined, allocatedEpcs: [] }]
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
        status: item.status,
        remarks: item.remarks || null,
        allocatedEpcs: item.allocatedEpcs || []
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