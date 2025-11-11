<template>
  <teleport to="body">
    <transition enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-200" @after-leave="unlockScroll">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" @click.self="closeModal"></div>
        <transition enter-active-class="transition-all duration-300" enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100" appear>
          <div v-if="isOpen" class="relative z-10 w-full max-w-3xl mx-4">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
              <!-- Header -->
              <div class="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 class="text-xl font-bold text-gray-900 dark:text-white">Create New Order</h2>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Step {{ currentStep }} of {{ totalSteps }}
                  </p>
                </div>
                <button @click="closeModal" :disabled="isSubmitting"
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Close modal">
                  ✕
                </button>
              </div>

              <!-- Step Indicator -->
              <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900/30">
                <div class="flex items-center justify-center">
                  <div class="flex items-center max-w-2xl w-full">
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
                <!-- Step 1: Customer -->
                <div v-if="currentStep === 1">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Information</h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Customer <span class="text-red-500">*</span>
                      </label>
                      <div class="relative" ref="customerDropdownRef">
                        <button
                          type="button"
                          @click="toggleDropdown('customer')"
                          class="input input-bordered w-full text-left flex items-center justify-between"
                        >
                          <span>{{ selectedCustomerLabel || 'Select Customer' }}</span>
                          <span class="icon-[tabler--chevron-down] size-4"></span>
                        </button>
                        <ul
                          v-if="openDropdowns.customer"
                          class="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                        >
                          <li
                            v-for="customer in customers"
                            :key="customer.id"
                            @click="selectCustomer(customer.id)"
                            class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                          >
                            {{ customer.customerName }}
                          </li>
                          <li v-if="customers.length === 0" class="px-4 py-2 text-sm text-gray-500">
                            No customers found
                          </li>
                        </ul>
                      </div>
                      <span v-if="errors.customerId" class="text-xs text-red-500 mt-1">{{ errors.customerId }}</span>

                      <!-- Add New Customer Button -->
                      <button
                        type="button"
                        @click="openAddCustomerModal"
                        class="mt-4 btn bg-brand-500 border-none btn-sm"
                      >
                        <span class="text-lg">+</span>
                        Add New Customer
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Step 2: Order Details -->
                <div v-if="currentStep === 2">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Details</h3>
                  <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Order Type <span class="text-red-500">*</span>
                        </label>
                        <div class="dropdown relative inline-flex w-full" ref="orderTypeDropdownRef">
                          <button type="button"
                            :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400', { 'btn-error': errors.orderType }]"
                            :aria-expanded="openDropdowns.orderType" @click.stop="toggleDropdown('orderType')">
                            {{ formData.orderType || 'Select Type' }}
                            <span class="icon-[tabler--chevron-down] size-4 transition-transform"
                              :class="{ 'rotate-180': openDropdowns.orderType }"></span>
                          </button>

                          <ul
                            class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white"
                            :class="{ 'opacity-100 pointer-events-auto': openDropdowns.orderType, 'opacity-0 pointer-events-none': !openDropdowns.orderType }"
                            role="menu">
                            <li v-for="type in orderTypes" :key="type">
                              <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
                                @click="selectOrderType(type)">
                                {{ type }}
                              </a>
                            </li>
                          </ul>
                        </div>
                        <span v-if="errors.orderType" class="text-xs text-red-500 mt-1">{{ errors.orderType }}</span>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Order Number <span class="text-red-500">*</span>
                        </label>
                        <input v-model="formData.orderNo" type="text"
                          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter order number" maxlength="50" />
                        <span v-if="errors.orderNo" class="text-xs text-red-500 mt-1">{{ errors.orderNo }}</span>
                      </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          PIC Name <span class="text-red-500">*</span>
                        </label>
                        <input v-model="formData.picName" type="text"
                          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter PIC name" maxlength="100" />
                        <span v-if="errors.picName" class="text-xs text-red-500 mt-1">{{ errors.picName }}</span>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Estimated Delivery Time <span class="text-red-500">*</span>
                        </label>
                        <input ref="estimatedDeliveryTimeInput" v-model="formData.estimatedDeliveryTime" type="text"
                          placeholder="Select Date"
                          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          readonly />
                        <span v-if="errors.estimatedDeliveryTime" class="text-xs text-red-500 mt-1">{{
                          errors.estimatedDeliveryTime }}</span>
                      </div>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Order Status <span class="text-red-500">*</span>
                      </label>
                      <div class="dropdown relative inline-flex w-full" ref="orderStatusDropdownRef">
                        <button type="button"
                          :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400', { 'btn-error': errors.status }]"
                          :aria-expanded="openDropdowns.orderStatus" @click.stop="toggleDropdown('orderStatus')">
                          {{ formData.status || 'Select Status' }}
                          <span class="icon-[tabler--chevron-down] size-4 transition-transform"
                            :class="{ 'rotate-180': openDropdowns.orderStatus }"></span>
                        </button>
                        <ul
                          class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white"
                          :class="{ 'opacity-100 pointer-events-auto': openDropdowns.orderStatus, 'opacity-0 pointer-events-none': !openDropdowns.orderStatus }"
                          role="menu">
                          <li v-for="stat in orderStatuses" :key="stat">
                            <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
                              @click="selectOrderStatus(stat)">
                              {{ stat }}
                            </a>
                          </li>
                        </ul>
                      </div>
                      <span v-if="errors.status" class="text-xs text-red-500 mt-1">{{ errors.status }}</span>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Order Remarks
                      </label>
                      <textarea v-model="formData.orderRemarks" rows="3"
                        class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter any order remarks"></textarea>
                    </div>
                  </div>
                </div>

                <!-- Step 3: Products -->
                <div v-if="currentStep === 3">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product Items</h3>
                  <div class="space-y-4">
                    <!-- Order Items -->
                    <div class="space-y-4 max-h-96 overflow-y-auto" style="padding-right: 8px;">
                      <div v-for="(item, index) in formData.orderItems" :key="index" class="p-4 rounded-lg">
                        <div class="space-y-3">
                          <div class="grid grid-cols-12 gap-4 items-start">
                            <!-- Product Dropdown -->
                            <div class="col-span-7 relative">
                              <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                                <span class="text-red-500">*</span> Product {{ index + 1 }}
                              </label>
                              <div class="dropdown relative inline-flex w-full" :ref="el => productDropdownRefs[index] = el">
                                <button
                                  type="button"
                                  class="dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400"
                                  :aria-expanded="openDropdowns[`product${index}`]"
                                  @click.stop="toggleDropdown(`product${index}`)"
                                  :disabled="loadingProducts"
                                >
                                  <span class="truncate pr-2">{{ getProductLabel(item.productId) || 'Select Product' }}</span>
                                  <span
                                    class="icon-[tabler--chevron-down] size-4 transition-transform"
                                    :class="{ 'rotate-180': openDropdowns[`product${index}`] }"
                                  ></span>
                                </button>

                                <ul
                                  class="dropdown-menu transition-opacity duration-200 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white max-h-60 overflow-y-auto"
                                  :style="openDropdowns[`product${index}`] ? (productMenuStyles[index] || { position: 'fixed', top: '-9999px', left: '0px', width: 'auto' }) : { display: 'none' }"
                                  :class="{ 'opacity-100 pointer-events-auto': openDropdowns[`product${index}`], 'opacity-0 pointer-events-none': !openDropdowns[`product${index}`] }"
                                  role="menu"
                                >
                                  <li v-for="product in availableProducts(index)" :key="product.id">
                                    <a class="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-lg" @click="selectProduct(index, product.id)">
                                      {{ product.skuCode }} - {{ product.name }}
                                    </a>
                                  </li>
                                </ul>
                              </div>
                              <span v-if="errors[`item${index}Product`]" class="text-xs text-red-500 mt-1">{{
                                errors[`item${index}Product`] }}</span>
                            </div>

                            <!-- Product Quantity -->
                            <div class="col-span-4 relative">
                              <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                                <span class="text-red-500">*</span> Quantity
                                <span v-if="formData.orderType === 'SO' && item.productId && item.availableStock !== undefined" class="text-xs text-gray-500 ml-1">
                                  (Available: {{ item.availableStock }})
                                </span>
                              </label>
                              <div class="flex items-center gap-1">
                                <button
                                  type="button"
                                  @click="decreaseQuantity(index)"
                                  class="btn btn-outline btn-sm w-8 h-8 p-0 flex items-center justify-center dark:bg-gray-700 dark:text-gray-400"
                                >
                                  −
                                </button>
                                <input
                                  v-model.number="item.quantity"
                                  type="number"
                                  min="1"
                                  :max="formData.orderType === 'SO' && item.availableStock !== undefined ? item.availableStock : undefined"
                                  :class="[
                                    'input input-bordered text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
                                    { 'input-error': errors[`item${index}Quantity`] }
                                  ]"
                                  style="width: 4rem"
                                  @input="validateQuantity(index)"
                                />
                                <button
                                  type="button"
                                  @click="increaseQuantity(index)"
                                  :disabled="formData.orderType === 'SO' && item.availableStock !== undefined && item.quantity >= item.availableStock"
                                  class="btn bg-brand-500 border-none btn-sm w-8 h-8 p-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  +
                                </button>
                              </div>
                              <span v-if="errors[`item${index}Quantity`]" class="text-xs text-red-500 mt-1">{{
                                errors[`item${index}Quantity`] }}</span>
                              <span v-if="formData.orderType === 'SO' && item.productId && item.availableStock !== undefined && item.quantity > item.availableStock" class="text-xs text-orange-600 dark:text-orange-400 mt-1 block">
                                ⚠️ Quantity exceeds available stock ({{ item.availableStock }})
                              </span>
                            </div>

                            <!-- Remove Button -->
                            <div class="col-span-1">
                              <button
                                type="button"
                                @click="removeOrderItem(index)"
                                v-if="formData.orderItems.length > 1"
                                class="btn btn-outline btn-error btn-sm w-10 h-10 p-0 flex items-center justify-center mt-6"
                                title="Remove Product"
                              >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          <!-- Product Remarks -->
                          <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Product Remarks
                            </label>
                            <textarea
                              v-model="item.remarks"
                              rows="2"
                              class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="Enter product remarks"
                            ></textarea>
                          </div>

                          <!-- Product Allocation Table for SO Orders (FIFO Auto-Assignment) -->
                          <div v-if="formData.orderType === 'SO' && item.productId" class="mt-3">
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
                      Add Another Product
                    </button>
                  </div>
                </div>
              </div>

              <!-- Footer with Navigation -->
              <div class="flex items-center justify-between p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button v-if="currentStep > 1" @click="previousStep" :disabled="isSubmitting" class="btn btn-outline">
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
                  <button v-if="currentStep < totalSteps" @click="nextStep"
                    class="btn bg-brand-500 hover:bg-brand-600 text-white border-none">
                    Next →
                  </button>
                  <button v-else @click="submitForm" :disabled="isSubmitting"
                    class="btn bg-brand-500 hover:bg-brand-600 text-white border-none">
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

  <!-- AddNewCustomer Modal -->
  <AddNewCustomer ref="addCustomerModalRef" @customer-created="handleCustomerCreated" />
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import authenticatedFetch from '@/utils/authenticatedFetch'
import AddNewCustomer from '@/views/Customer/component/AddNewCustomer.vue'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.css'

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
  remarks?: string
  availableStock?: number
  allocatedEpcs?: Array<{
    epcCode: string
    warehouseCode: string
    locationCode: string
    inboundDate: string
  }>
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
  orderRemarks: '',
  // Step 3: Products
  itemStatus: 'Pending',
  orderItems: [{ productId: '', quantity: 1, status: 'Pending', remarks: '', availableStock: undefined, allocatedEpcs: [] }] as OrderItem[]
})

const errors = reactive<Record<string, string>>({})

const loadingCustomers = ref(false)
const loadingProducts = ref(false)
const loadingInventory = ref<Record<number, boolean>>({})
const customers = ref<Customer[]>([])
const products = ref<Product[]>([])
const addCustomerModalRef = ref<any>(null)
const productDropdownRefs = ref<any[]>([])
const customerDropdownRef = ref<any>(null)
const orderTypeDropdownRef = ref<any>(null)
const orderStatusDropdownRef = ref<any>(null)
const itemStatusDropdownRef = ref<any>(null)

const orderTypes = ['PO', 'SO']
const orderStatuses = ['Created', 'Processing', 'Confirmed', 'Shipped', 'Completed', 'Cancelled']
const itemStatuses = ['Pending', 'Allocated', 'Picked', 'Packed', 'Shipped', 'Delivered', 'Backordered', 'Rejected', 'Cancelled']

const openDropdowns = reactive<Record<string, boolean>>({})

const estimatedDeliveryTimeInput = ref(null)
let flatpickrInstance: any = null

// Product dropdown overlay styles per product index (reactive array)
const productMenuStyles = reactive<any[]>([])

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
  formData.orderRemarks = ''
  formData.itemStatus = 'Pending'
  formData.orderItems = [{ productId: '', quantity: 1, status: 'Pending', remarks: '', availableStock: undefined, allocatedEpcs: [] }]

  // Reset product menu styles
  productMenuStyles.length = 0
  formData.orderItems.forEach(() => productMenuStyles.push({}))

  // Reset loading inventory
  loadingInventory.value = {}

  Object.keys(errors).forEach((key) => delete errors[key])
  Object.keys(openDropdowns).forEach((key) => delete openDropdowns[key])
}

const validateStep = (step: number): boolean => {
  Object.keys(errors).forEach((key) => delete errors[key])

  if (step === 1) {
    if (!formData.customerId) errors.customerId = 'Customer is required'
  } else if (step === 2) {
    if (!formData.orderNo || !formData.orderNo.trim()) errors.orderNo = 'Order number is required'
    if (!formData.orderType) errors.orderType = 'Order type is required'
    if (!formData.picName || !formData.picName.trim()) errors.picName = 'PIC name is required'
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
      // Check if quantity exceeds available stock for SO orders
      if (formData.orderType === 'SO' && item.availableStock !== undefined && item.quantity > item.availableStock) {
        errors[`item${idx}Quantity`] = `Quantity exceeds available stock (${item.availableStock})`
      }
    })
  }

  return Object.keys(errors).length === 0
}

const nextStep = () => {
  if (!validateStep(currentStep.value)) return
  if (currentStep.value < totalSteps) {
    currentStep.value++

    // Initialize Flatpickr when entering step 2
    if (currentStep.value === 2) {
      nextTick(() => {
        if (estimatedDeliveryTimeInput.value && !flatpickrInstance) {
          flatpickrInstance = flatpickr(estimatedDeliveryTimeInput.value, {
            dateFormat: 'Y-m-d',
            defaultDate: new Date(),
            onChange: (selectedDates: Date[], dateStr: string) => {
              formData.estimatedDeliveryTime = dateStr
            }
          })
        }
      })
    }
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

  // If opening a product dropdown, compute its fixed-position style
  if (openDropdowns[name] && name.startsWith('product')) {
    const idx = parseInt(name.replace('product', ''), 10)
    await positionProductMenu(idx)
  }
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

const selectProduct = async (index: number, productId: number) => {
  // prevent selecting the same product in more than one row
  const takenIndex = formData.orderItems.findIndex((p, i) => i !== index && p.productId === productId)
  if (takenIndex !== -1) {
    console.warn(`Product ${productId} is already selected in row ${takenIndex}`)
    openDropdowns[`product${index}`] = false
    return
  }

  formData.orderItems[index].productId = productId
  openDropdowns[`product${index}`] = false

  // Fetch inventory if order type is SO
  if (formData.orderType === 'SO') {
    await fetchProductInventory(index)
  }
}

const getProductLabel = (productId: string | number) => {
  if (!productId) return null
  const product = products.value.find(p => p.id.toString() === productId.toString())
  return product ? `${product.skuCode} - ${product.name}` : null
}

// Return products that are not selected in other rows (available for this index)
const availableProducts = (index: number) => {
  const takenIds = formData.orderItems
    .map((p, i) => i !== index ? p.productId : null)
    .filter(Boolean)

  return products.value.filter(p => !takenIds.includes(p.id))
}

const addOrderItem = () => {
  formData.orderItems.push({ productId: '', quantity: 1, status: formData.itemStatus || 'Pending', remarks: '', availableStock: undefined, allocatedEpcs: [] })
  // keep style slot for new product dropdown
  productMenuStyles.push({})
}

const removeOrderItem = (index: number) => {
  formData.orderItems.splice(index, 1)
  // remove the style slot for removed product
  productMenuStyles.splice(index, 1)
  // close product dropdowns to avoid index shift issues
  Object.keys(openDropdowns).forEach(k => { if (k.startsWith('product')) openDropdowns[k] = false })
}

/* Fetch product inventory for SO orders and auto-assign EPCs using FIFO */
const fetchProductInventory = async (index: number) => {
  const item = formData.orderItems[index]
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
        const isAlreadyUsed = formData.orderItems.some((otherItem, idx) => {
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

const increaseQuantity = (index: number) => {
  const item = formData.orderItems[index]

  // Check available stock limit for SO orders
  if (formData.orderType === 'SO' && item.availableStock !== undefined) {
    if (item.quantity >= item.availableStock) {
      return // Don't increase beyond available stock
    }
  }

  formData.orderItems[index].quantity++
  // Re-allocate EPCs if SO order
  if (formData.orderType === 'SO' && formData.orderItems[index].productId) {
    fetchProductInventory(index)
  }
}

const decreaseQuantity = (index: number) => {
  if (formData.orderItems[index].quantity > 1) {
    formData.orderItems[index].quantity--
    // Re-allocate EPCs if SO order
    if (formData.orderType === 'SO' && formData.orderItems[index].productId) {
      fetchProductInventory(index)
    }
  }
}

const validateQuantity = (index: number) => {
  const item = formData.orderItems[index]

  if (item.quantity < 1) {
    item.quantity = 1
  }

  // Enforce available stock limit for SO orders
  if (formData.orderType === 'SO' && item.availableStock !== undefined) {
    if (item.quantity > item.availableStock) {
      item.quantity = item.availableStock || 1
    }
  }

  // Re-allocate EPCs if SO order
  if (formData.orderType === 'SO' && formData.orderItems[index].productId) {
    fetchProductInventory(index)
  }
}

/* Position product dropdown menu */
const positionProductMenu = async (index: number) => {
  await nextTick()
  const container = productDropdownRefs.value[index]
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

  productMenuStyles[index] = style
}

const repositionOpenProductMenus = () => {
  Object.keys(openDropdowns).forEach(key => {
    if (key.startsWith('product') && openDropdowns[key]) {
      const idx = parseInt(key.replace('product', ''), 10)
      positionProductMenu(idx)
    }
  })
}

/* Open Add Customer Modal */
const openAddCustomerModal = () => {
  if (addCustomerModalRef.value && addCustomerModalRef.value.openModal) {
    addCustomerModalRef.value.openModal()
  }
}

/* Handle Customer Created */
const handleCustomerCreated = async (result: any) => {
  if (result.success) {
    // Refresh customer list
    await fetchData()

    // Auto-select the newly created customer
    if (result.data && result.data.id) {
      formData.customerId = result.data.id
    }
  }
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
      orderRemarks: formData.orderRemarks || null,
      orderItems: formData.orderItems.map(item => ({
        productId: parseInt(item.productId.toString()),
        quantity: item.quantity,
        status: item.status,
        remarks: item.remarks || null,
        allocatedEpcs: item.allocatedEpcs || [] // Include allocated EPCs for SO orders
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
  const refs = [
    customerDropdownRef.value,
    orderTypeDropdownRef.value,
    orderStatusDropdownRef.value,
    itemStatusDropdownRef.value,
    ...productDropdownRefs.value
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
  window.addEventListener('resize', repositionOpenProductMenus)
  window.addEventListener('scroll', repositionOpenProductMenus, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', repositionOpenProductMenus)
  window.removeEventListener('scroll', repositionOpenProductMenus, true)
  if (isOpen.value) unlockScroll()

  // Clean up Flatpickr
  if (flatpickrInstance) {
    flatpickrInstance.destroy()
    flatpickrInstance = null
  }
})

defineExpose({
  openModal,
  closeModal,
})
</script>
