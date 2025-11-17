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
                  <h2 class="text-xl font-bold text-gray-900 dark:text-white">Add Return Information</h2>
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
                  <div class="flex items-center max-w-md w-full">
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
                            ? 'text-brand-500 dark:text-blue-400'
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
              <div class="p-6 min-h-[400px] max-h-[500px] overflow-y-auto">
                <!-- Step 1: Return Information -->
                <div v-if="currentStep === 1">
                  <div class="space-y-4">
                    <!-- Return Number -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Return Number
                      </label>
                      <input
                        v-model="formData.returnNumber"
                        type="text"
                        class="input input-bordered w-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        placeholder="Auto Generated for tracking return - RTNYYMM0001"
                        disabled
                      />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <!-- Return Type -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Return Type <span class="text-red-500">*</span>
                        </label>
                        <div class="dropdown relative inline-flex w-full" ref="returnTypeDropdownRef">
                          <button
                            type="button"
                            :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400 text-left', { 'btn-error': errors.returnType }]"
                            :aria-expanded="openDropdowns.returnType"
                            @click.stop="toggleDropdown('returnType')"
                          >
                            <span class="truncate pr-2">{{ formData.returnType || 'Choose Return Type' }}</span>
                            <span
                              class="icon-[tabler--chevron-down] size-4 transition-transform flex-shrink-0"
                              :class="{ 'rotate-180': openDropdowns.returnType }"
                            ></span>
                          </button>
                        </div>
                        <span v-if="errors.returnType" class="text-xs text-red-500 mt-1">{{ errors.returnType }}</span>
                      </div>

                      <!-- Return Type dropdown menu - rendered outside normal flow -->
                      <teleport to="body">
                        <ul
                          v-if="openDropdowns.returnType"
                          class="dropdown-menu transition-opacity duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-gray-900 dark:text-white opacity-100"
                          :style="returnTypeMenuStyle"
                          role="menu"
                        >
                          <li>
                            <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectReturnType('Customer')">
                              Customer
                            </a>
                          </li>
                          <li>
                            <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectReturnType('Supplier')">
                              Supplier
                            </a>
                          </li>
                          <li>
                            <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectReturnType('Internal')">
                              Internal
                            </a>
                          </li>
                          <li>
                            <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectReturnType('Failed Delivery')">
                              Failed Delivery
                            </a>
                          </li>
                        </ul>
                      </teleport>

                      <!-- Reference Number -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Reference Number <span class="text-red-500">*</span>
                        </label>
                        <div class="relative" ref="referenceDropdownRef">
                          <input
                            v-model="formData.referenceNumber"
                            type="text"
                            class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
                            :class="{ 'border-red-500': errors.referenceNumber }"
                            placeholder="Search or enter reference number"
                            @input="handleReferenceSearch"
                            @focus="showReferenceDropdown = true"
                          />
                          <button 
                            type="button" 
                            @click="toggleReferenceDropdown"
                            class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                          >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </button>
                          <!-- Dropdown for search results -->
                          <ul
                            v-if="showReferenceDropdown && (filteredOrders.length > 0 || loadingOrders)"
                            class="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                          >
                            <li v-if="loadingOrders" class="px-4 py-2 text-sm text-gray-500">
                              Loading orders...
                            </li>
                            <li v-else-if="filteredOrders.length === 0 && formData.referenceNumber" class="px-4 py-2 text-sm text-gray-500">
                              No matching orders found
                            </li>
                            <li
                              v-else
                              v-for="order in filteredOrders"
                              :key="order.id"
                              @click="selectReferenceOrder(order)"
                              class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                            >
                              <div class="flex items-center justify-between">
                                <div class="flex-1">
                                  <div class="font-medium text-gray-900 dark:text-white">{{ order.orderNo }}</div>
                                  <div class="text-xs text-gray-500 dark:text-gray-400">
                                    <span class="font-semibold">{{ order.orderType }}</span> • 
                                    {{ order.customer?.customerName || order.supplier?.supplierName || 'N/A' }} • 
                                    <span class="text-green-600 dark:text-green-400">{{ order.status }}</span>
                                  </div>
                                </div>
                                <div class="text-xs text-gray-400 ml-2">
                                  {{ order.orderItems?.length || 0 }} items
                                </div>
                              </div>
                            </li>
                          </ul>
                        </div>
                        <span v-if="errors.referenceNumber" class="text-xs text-red-500 mt-1">{{ errors.referenceNumber }}</span>
                        <p class="text-xs text-gray-500 mt-1">
                          Search for received orders only
                        </p>
                      </div>
                    </div>

                    <div class="grid grid-cols-3 gap-4">
                      <!-- Return Date -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Return Date
                        </label>
                        <input
                          ref="returnDateInput"
                          v-model="formData.returnDate"
                          type="text"
                          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Pick Date"
                          readonly
                        />
                      </div>

                      <!-- From -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          From
                        </label>
                        <input
                          v-model="formData.from"
                          type="text"
                          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Depends on Return Type"
                          disabled
                        />
                      </div>

                      <!-- To -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          To
                        </label>
                        <input
                          v-model="formData.to"
                          type="text"
                          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Depends on Return Type"
                          disabled
                        />
                      </div>
                    </div>

                    <!-- Created By -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Created By
                      </label>
                      <input
                        v-model="formData.personInCharge"
                        type="text"
                        class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter Creator's Name"
                      />
                    </div>

                    <!-- Remarks -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Remarks
                      </label>
                      <textarea
                        v-model="formData.remarks"
                        rows="3"
                        class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                        placeholder="Enter PIC's Name"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <!-- Step 2: Product Information -->
                <div v-if="currentStep === 2">
                  <div class="space-y-4">
                    <div v-for="(product, pIndex) in formData.products" :key="pIndex" class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div class="flex items-center justify-between mb-3">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Product {{ pIndex + 1 }}</span>
                        <button
                          v-if="formData.products.length > 1"
                          type="button"
                          @click="removeProduct(pIndex)"
                          class="text-red-500 hover:text-red-700"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <!-- Product Name Dropdown -->
                      <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Product Name <span class="text-red-500">*</span>
                        </label>
                        <div class="dropdown relative inline-flex w-full" :ref="el => { if (el) productDropdownRefs[pIndex] = el }">
                          <button
                            type="button"
                            :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400 text-left', { 'btn-error': errors[`product${pIndex}Name`] }]"
                            :aria-expanded="openDropdowns[`product${pIndex}`]"
                            @click.stop="toggleProductDropdown(pIndex)"
                            :disabled="product.productId > 0"
                          >
                            <span class="truncate pr-2">{{ product.productName || 'Choose Product' }}</span>
                            <span
                              v-if="product.productId === 0"
                              class="icon-[tabler--chevron-down] size-4 transition-transform flex-shrink-0"
                              :class="{ 'rotate-180': openDropdowns[`product${pIndex}`] }"
                            ></span>
                          </button>
                        </div>
                        <span v-if="errors[`product${pIndex}Name`]" class="text-xs text-red-500 mt-1">{{ errors[`product${pIndex}Name`] }}</span>
                      </div>

                      <!-- Product dropdown menu - rendered outside normal flow -->
                      <teleport to="body">
                        <ul
                          v-if="openDropdowns[`product${pIndex}`]"
                          class="dropdown-menu transition-opacity duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-gray-900 dark:text-white opacity-100"
                          :style="productMenuStyles[pIndex] || { position: 'fixed', zIndex: 9999 }"
                          role="menu"
                        >
                          <li v-if="availableProducts.length === 0" class="px-4 py-2 text-sm text-gray-500">
                            No products available
                          </li>
                          <li v-for="availProduct in availableProducts" :key="availProduct.id">
                            <a 
                              class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" 
                              @click="selectProduct(pIndex, availProduct)"
                            >
                              <div class="font-medium">{{ availProduct.name }}</div>
                              <div class="text-xs text-gray-500">SKU: {{ availProduct.skuCode }} • Max: {{ availProduct.maxQuantity }}</div>
                            </a>
                          </li>
                        </ul>
                      </teleport>

                      <!-- Reasons Section -->
                      <div class="space-y-3">
                        <div v-for="(reason, rIndex) in product.reasons" :key="rIndex" class="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
                          <div class="flex items-center justify-between mb-2">
                            <span class="text-xs font-semibold text-gray-600 dark:text-gray-400">Reason {{ rIndex + 1 }}</span>
                            <button
                              v-if="product.reasons.length > 1"
                              type="button"
                              @click="removeReason(pIndex, rIndex)"
                              class="text-red-500 hover:text-red-700 text-xs"
                            >
                              Remove
                            </button>
                          </div>
                          <div class="grid grid-cols-3 gap-3">
                            <!-- Quantity -->
                            <div>
                              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Quantity <span class="text-red-500">*</span>
                              </label>
                              <input
                                v-model.number="reason.quantity"
                                type="number"
                                min="1"
                                class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                :class="{ 'border-red-500': errors[`product${pIndex}Reason${rIndex}Quantity`] }"
                              />
                              <span v-if="errors[`product${pIndex}Reason${rIndex}Quantity`]" class="text-xs text-red-500 mt-1">{{ errors[`product${pIndex}Reason${rIndex}Quantity`] }}</span>
                            </div>

                            <!-- Reason of Return Dropdown -->
                            <div>
                              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Reason of return <span class="text-red-500">*</span>
                              </label>
                              <div class="dropdown relative inline-flex w-full">
                                <button
                                  type="button"
                                  :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400 text-left text-sm', { 'btn-error': errors[`product${pIndex}Reason${rIndex}Type`] }]"
                                  :aria-expanded="openDropdowns[`reason${pIndex}_${rIndex}`]"
                                  @click.stop="toggleDropdown(`reason${pIndex}_${rIndex}`)"
                                >
                                  <span class="truncate pr-2">{{ reason.reasonOfReturn || 'Choose Reason' }}</span>
                                  <span
                                    class="icon-[tabler--chevron-down] size-4 transition-transform flex-shrink-0"
                                    :class="{ 'rotate-180': openDropdowns[`reason${pIndex}_${rIndex}`] }"
                                  ></span>
                                </button>
                              </div>
                              <span v-if="errors[`product${pIndex}Reason${rIndex}Type`]" class="text-xs text-red-500 mt-1">{{ errors[`product${pIndex}Reason${rIndex}Type`] }}</span>
                            </div>

                            <!-- Reason dropdown menu -->
                            <teleport to="body">
                              <ul
                                v-if="openDropdowns[`reason${pIndex}_${rIndex}`]"
                                class="dropdown-menu transition-opacity duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-gray-900 dark:text-white opacity-100"
                                :style="reasonMenuStyles[`reason${pIndex}_${rIndex}`] || { position: 'fixed', zIndex: 9999 }"
                                role="menu"
                              >
                                <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="reason.reasonOfReturn = 'Defective'; openDropdowns[`reason${pIndex}_${rIndex}`] = false">Defective</a></li>
                                <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="reason.reasonOfReturn = 'Wrong Item'; openDropdowns[`reason${pIndex}_${rIndex}`] = false">Wrong Item</a></li>
                                <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="reason.reasonOfReturn = 'Damaged'; openDropdowns[`reason${pIndex}_${rIndex}`] = false">Damaged</a></li>
                                <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="reason.reasonOfReturn = 'Expired'; openDropdowns[`reason${pIndex}_${rIndex}`] = false">Expired</a></li>
                                <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="reason.reasonOfReturn = 'Other'; openDropdowns[`reason${pIndex}_${rIndex}`] = false">Other</a></li>
                              </ul>
                            </teleport>

                            <!-- Other -->
                            <div>
                              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Other
                              </label>
                              <input
                                v-model="reason.other"
                                type="text"
                                class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Specify if needed"
                              />
                            </div>
                          </div>
                        </div>

                        <!-- Add Reason Button -->
                        <button
                          type="button"
                          @click="addReasonOfReturn(pIndex)"
                          class="btn bg-brand-500 hover:bg-brand-600 text-white border-none btn-sm w-full"
                        >
                          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Add Reason of Return
                        </button>
                      </div>

                      <!-- EPC for Return -->
                      <div class="mt-3">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          EPC for Return
                        </label>
                        <input
                          v-model="product.epcForReturn"
                          type="text"
                          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter or scan EPC"
                        />
                      </div>
                    </div>

                    <!-- Add Product Button -->
                    <button
                      type="button"
                      @click="addProduct"
                      :disabled="availableProducts.length === 0"
                      class="btn bg-brand-500 hover:bg-brand-600 text-white border-none btn-sm w-full"
                      :class="{ 'opacity-50 cursor-not-allowed': availableProducts.length === 0 }"
                    >
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Add Product
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
                  Back
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
                    Next
                  </button>
                  <button
                    v-else
                    @click="submitForm"
                    :disabled="isSubmitting"
                    class="btn bg-brand-500 hover:bg-blue-600 text-white border-none"
                  >
                    <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
                    {{ isSubmitting ? 'Saving...' : 'Save' }}
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
import { ref, reactive, nextTick, onBeforeUnmount, computed } from 'vue'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.css'
import authenticatedFetch from '@/utils/authenticatedFetch'

interface Product {
  productId: number
  productName: string
  reasons: Array<{
    quantity: number
    reasonOfReturn: string
    other: string
  }>
  epcForReturn: string
}

interface Order {
  id: number
  orderType: string
  orderNo: string
  status: string
  customer: { 
    id: number
    customerName: string 
  } | null
  supplier: { 
    id: number
    supplierName: string 
  } | null
  orderItems: Array<{
    id: number
    productId: number
    quantity: number
    product: {
      id: number
      name: string
      skuCode: string
    }
  }>
}

const emit = defineEmits(['return-created', 'close'])

const isOpen = ref(false)
const isSubmitting = ref(false)
const currentStep = ref(1)
const totalSteps = 2

// Order search state
const loadingOrders = ref(false)
const allOrders = ref<Order[]>([])
const showReferenceDropdown = ref(false)
const referenceDropdownRef = ref<HTMLElement | null>(null)

const steps = [
  { id: 1, name: 'Return' },
  { id: 2, name: 'Product' },
]

// Computed filtered orders - only show received orders
const filteredOrders = computed(() => {
  if (!formData.referenceNumber) return allOrders.value

  const searchTerm = formData.referenceNumber.toLowerCase()
  return allOrders.value.filter(order => 
    // Only show orders with 'Received' status (received orders)
    order.status === 'Received' &&
    (order.orderNo.toLowerCase().includes(searchTerm) ||
    order.customer?.customerName?.toLowerCase().includes(searchTerm) ||
    order.supplier?.supplierName?.toLowerCase().includes(searchTerm))
  )
})

// Get selected order
const selectedOrder = computed(() => {
  return allOrders.value.find(order => order.orderNo === formData.referenceNumber)
})

// Get available products from selected order (excluding already selected)
const availableProducts = computed(() => {
  if (!selectedOrder.value) return []
  
  const selectedProductIds = formData.products.map(p => p.productId)
  return selectedOrder.value.orderItems
    .filter(item => !selectedProductIds.includes(item.productId))
    .map(item => ({
      id: item.product.id,
      name: item.product.name,
      skuCode: item.product.skuCode,
      maxQuantity: item.quantity
    }))
})

const formData = reactive({
  returnNumber: '',
  returnType: '',
  referenceNumber: '',
  returnDate: new Date().toISOString().split('T')[0],
  from: '',
  to: '',
  personInCharge: '',
  remarks: '',
  products: [
    { productId: 0, productName: '', reasons: [{ quantity: 1, reasonOfReturn: '', other: '' }], epcForReturn: '' }
  ] as Product[]
})

const errors = reactive<Record<string, string>>({})
const returnDateInput = ref<HTMLInputElement | null>(null)
const returnTypeDropdownRef = ref<any>(null)
const productDropdownRefs = ref<any>({})
let flatpickrReturnDate: any = null

const openDropdowns = reactive<Record<string, boolean>>({})
const returnTypeMenuStyle = ref<any>({})
const productMenuStyles = ref<Record<number, any>>({})
const reasonMenuStyles = ref<Record<string, any>>({})

const lockScroll = () => {
  document.body.style.overflow = 'hidden'
}

const unlockScroll = () => {
  document.body.style.overflow = ''
}

const openModal = () => {
  isOpen.value = true
  currentStep.value = 1
  resetForm()
  lockScroll()
  initializeFlatpickr()
  fetchOrders() // Fetch orders when modal opens
  
  // Add event listeners
  nextTick(() => {
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('resize', repositionOpenMenus)
    window.addEventListener('scroll', repositionOpenMenus, true)
  })
}

const closeModal = () => {
  if (isSubmitting.value) return
  
  // Destroy Flatpickr instance
  if (flatpickrReturnDate) {
    flatpickrReturnDate.destroy()
    flatpickrReturnDate = null
  }
  
  // Remove event listeners
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', repositionOpenMenus)
  window.removeEventListener('scroll', repositionOpenMenus, true)
  
  isOpen.value = false
  showReferenceDropdown.value = false
  unlockScroll()
  emit('close')
}

const resetForm = () => {
  formData.returnNumber = ''
  formData.returnType = ''
  formData.referenceNumber = ''
  formData.returnDate = new Date().toISOString().split('T')[0]
  formData.from = ''
  formData.to = ''
  formData.personInCharge = ''
  formData.remarks = ''
  formData.products = [
    { productId: 0, productName: '', reasons: [{ quantity: 1, reasonOfReturn: '', other: '' }], epcForReturn: '' }
  ]

  Object.keys(errors).forEach((key) => delete errors[key])
  Object.keys(openDropdowns).forEach((key) => delete openDropdowns[key])
  showReferenceDropdown.value = false
}

// Fetch orders from API
const fetchOrders = async () => {
  loadingOrders.value = true
  try {
    const response = await authenticatedFetch('/api/order')
    if (response.ok) {
      const data = await response.json()
      // Only include received orders
      allOrders.value = data.filter((order: Order) => 
        order.status === 'Received'
      )
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
  } finally {
    loadingOrders.value = false
  }
}

// Handle reference number search
const handleReferenceSearch = () => {
  showReferenceDropdown.value = true
}

// Toggle reference dropdown
const toggleReferenceDropdown = () => {
  showReferenceDropdown.value = !showReferenceDropdown.value
  if (showReferenceDropdown.value && allOrders.value.length === 0) {
    fetchOrders()
  }
}

// Select order from dropdown
const selectReferenceOrder = (order: Order) => {
  formData.referenceNumber = order.orderNo
  showReferenceDropdown.value = false
  
  // Auto-fill from and to based on order type
  if (order.orderType === 'PO' && order.supplier) {
    // For Purchase Order (Supplier return): From Warehouse -> To Supplier
    formData.from = 'Warehouse'
    formData.to = `Supplier - ${order.supplier.supplierName}`
    formData.returnType = 'Supplier'
  } else if (order.orderType === 'SO' && order.customer) {
    // For Sales Order (Customer return): From Customer -> To Warehouse
    formData.from = `Customer - ${order.customer.customerName}`
    formData.to = 'Warehouse'
    formData.returnType = 'Customer'
  }
}

const validateStep = (step: number): boolean => {
  Object.keys(errors).forEach((key) => delete errors[key])

  if (step === 1) {
    if (!formData.returnType) errors.returnType = 'Return type is required'
    if (!formData.referenceNumber.trim()) errors.referenceNumber = 'Reference number is required'
  } else if (step === 2) {
    formData.products.forEach((product, idx) => {
      if (!product.productName) {
        errors[`product${idx}Name`] = 'Product name is required'
      }
      product.reasons.forEach((reason, rIdx) => {
        if (!reason.quantity || reason.quantity < 1) {
          errors[`product${idx}Reason${rIdx}Quantity`] = 'Quantity must be at least 1'
        }
        if (!reason.reasonOfReturn) {
          errors[`product${idx}Reason${rIdx}Type`] = 'Reason is required'
        }
      })
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

const addProduct = () => {
  if (availableProducts.value.length > 0) {
    formData.products.push({
      productId: 0,
      productName: '',
      reasons: [{ quantity: 1, reasonOfReturn: '', other: '' }],
      epcForReturn: ''
    })
  }
}

const removeProduct = (index: number) => {
  if (formData.products.length > 1) {
    formData.products.splice(index, 1)
  }
}

const addReasonOfReturn = (productIndex: number) => {
  formData.products[productIndex].reasons.push({
    quantity: 1,
    reasonOfReturn: '',
    other: ''
  })
}

const removeReason = (productIndex: number, reasonIndex: number) => {
  if (formData.products[productIndex].reasons.length > 1) {
    formData.products[productIndex].reasons.splice(reasonIndex, 1)
  }
}

const selectProduct = (productIndex: number, product: any) => {
  formData.products[productIndex].productId = product.id
  formData.products[productIndex].productName = product.name
  openDropdowns[`product${productIndex}`] = false
}

const toggleProductDropdown = async (productIndex: number) => {
  const key = `product${productIndex}`
  Object.keys(openDropdowns).forEach(k => {
    if (k !== key) openDropdowns[k] = false
  })
  openDropdowns[key] = !openDropdowns[key]
  
  if (openDropdowns[key]) {
    await positionProductMenu(productIndex)
  }
}

/* Initialize Flatpickr for date input */
const initializeFlatpickr = async () => {
  await nextTick()

  // Destroy existing instance if any
  if (flatpickrReturnDate) {
    flatpickrReturnDate.destroy()
    flatpickrReturnDate = null
  }

  // Initialize return date picker
  if (returnDateInput.value) {
    flatpickrReturnDate = flatpickr(returnDateInput.value, {
      dateFormat: 'Y-m-d',
      defaultDate: formData.returnDate || new Date(),
      onChange: (selectedDates: Date[]) => {
        if (selectedDates && selectedDates[0]) {
          formData.returnDate = selectedDates[0].toISOString().split('T')[0]
        }
      }
    })
  }
}

const toggleDropdown = async (name: string) => {
  Object.keys(openDropdowns).forEach(k => {
    if (k !== name) openDropdowns[k] = false
  })
  openDropdowns[name] = !openDropdowns[name]

  // If opening return type dropdown, compute its fixed-position style
  if (name === 'returnType' && openDropdowns[name]) {
    await positionReturnTypeMenu()
  }
  
  // If opening reason dropdown, compute its position
  if (name.startsWith('reason') && openDropdowns[name]) {
    await positionReasonMenu(name)
  }
}

const selectReturnType = (type: string) => {
  formData.returnType = type
  openDropdowns.returnType = false
}

/* Position return type dropdown menu */
const positionReturnTypeMenu = async () => {
  await nextTick()
  const container = returnTypeDropdownRef.value
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

  returnTypeMenuStyle.value = style
}

/* Position product dropdown menu */
const positionProductMenu = async (productIndex: number) => {
  await nextTick()
  const container = productDropdownRefs.value[productIndex]
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

  productMenuStyles.value[productIndex] = style
}

/* Position reason dropdown menu */
const positionReasonMenu = async (key: string) => {
  await nextTick()
  // Find the button by searching for the dropdown with the matching key
  const buttons = document.querySelectorAll('.dropdown button')
  let targetBtn: Element | null = null
  
  for (const btn of buttons) {
    if (btn.getAttribute('aria-expanded') === 'true') {
      const parent = btn.closest('.dropdown')
      if (parent) {
        targetBtn = btn
        break
      }
    }
  }
  
  if (!targetBtn) return

  const rect = targetBtn.getBoundingClientRect()
  const maxMenuHeight = 250
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

  if (belowSpace >= 100) {
    style.top = `${rect.bottom + gap}px`
    style.maxHeight = `${Math.min(maxMenuHeight, belowSpace)}px`
  } else {
    const usedHeight = Math.min(maxMenuHeight, aboveSpace)
    style.top = `${rect.top - usedHeight - gap}px`
    style.maxHeight = `${usedHeight}px`
  }

  reasonMenuStyles.value[key] = style
}

const repositionOpenMenus = () => {
  if (openDropdowns.returnType) {
    positionReturnTypeMenu()
  }
  // Reposition product dropdowns
  Object.keys(openDropdowns).forEach(key => {
    if (key.startsWith('product') && openDropdowns[key]) {
      const index = parseInt(key.replace('product', ''))
      positionProductMenu(index)
    }
    if (key.startsWith('reason') && openDropdowns[key]) {
      positionReasonMenu(key)
    }
  })
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node

  // Check if click is on any dropdown menu items (teleported)
  const dropdownMenus = document.querySelectorAll('.dropdown-menu')
  for (const menu of dropdownMenus) {
    if (menu.contains(target)) {
      return // Don't close if clicking inside any menu
    }
  }

  // Check if click is on reference dropdown
  if (referenceDropdownRef.value && referenceDropdownRef.value.contains(target)) {
    return // Don't close if clicking inside reference dropdown
  }

  // Check if click is on return type dropdown
  if (returnTypeDropdownRef.value && returnTypeDropdownRef.value.contains(target)) {
    return
  }

  // Check if click is on any product dropdown
  for (const key in productDropdownRefs.value) {
    if (productDropdownRefs.value[key] && productDropdownRefs.value[key].contains(target)) {
      return
    }
  }

  // Close all dropdowns if clicked outside
  Object.keys(openDropdowns).forEach(key => {
    openDropdowns[key] = false
  })
  showReferenceDropdown.value = false
}

const submitForm = async () => {
  if (!validateStep(currentStep.value)) return

  isSubmitting.value = true

  try {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    emit('return-created', {
      success: true,
      data: { ...formData }
    })

    closeModal()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create return'
    emit('return-created', {
      success: false,
      error: message
    })
  } finally {
    isSubmitting.value = false
  }
}

defineExpose({
  openModal,
  closeModal,
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', repositionOpenMenus)
  window.removeEventListener('scroll', repositionOpenMenus, true)

  // Clean up Flatpickr instance
  if (flatpickrReturnDate) {
    flatpickrReturnDate.destroy()
    flatpickrReturnDate = null
  }

  if (isOpen.value) unlockScroll()
})
</script>

