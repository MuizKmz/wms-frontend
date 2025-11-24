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
                  <h2 class="text-xl font-bold text-gray-900 dark:text-white">Edit Return Information</h2>
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
                    <!-- Return Number (Read-only) -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Return Number
                      </label>
                                          <input
                                            v-model="formData.returnNumber"
                                            type="text"
                                            class="input input-bordered w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white"
                                            disabled
                                            readonly
                                          />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <!-- Return Type (Disabled) -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Return Type <span class="text-red-500">*</span>
                        </label>
                        <div class="dropdown relative inline-flex w-full">
                          <button
                            type="button"
                            class="dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 text-gray-900 dark:text-white text-left cursor-not-allowed opacity-60"
                            disabled
                          >
                            <span class="truncate pr-2">{{ formData.returnType || 'Choose Return Type' }}</span>
                            <span class="icon-[tabler--chevron-down] size-4 flex-shrink-0"></span>
                          </button>
                        </div>
                      </div>

                      <!-- Reference Number (Disabled) -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Reference Number <span class="text-red-500">*</span>
                        </label>
                        <div class="relative">
                          <input
                            v-model="formData.referenceNumber"
                            type="text"
                            class="input input-bordered w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white"
                            disabled
                            readonly
                          />
                          
                        </div>
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

                      <!-- From (Disabled) -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          From
                        </label>
                        <input
                          v-model="formData.from"
                          type="text"
                          class="input input-bordered w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white"
                          disabled
                          readonly
                        />
                        
                      </div>

                      <!-- To (Disabled) -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          To
                        </label>
                        <input
                          v-model="formData.to"
                          type="text"
                          class="input input-bordered w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white"
                          disabled
                          readonly
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
                        placeholder="Enter remarks"
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

                      <!-- Product dropdown menu -->
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
                                :max="product.maxQuantity || 999"
                                class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                :class="{ 'border-red-500': errors[`product${pIndex}Reason${rIndex}Quantity`] }"
                                @input="validateQuantity(pIndex, rIndex)"
                              />
                              <p v-if="product.maxQuantity" class="text-xs text-gray-500 mt-1">
                                Max available: {{ product.maxQuantity }}
                              </p>
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
                          EPCs for Return
                          <span v-if="product.availableEpcs && product.availableEpcs.length > 0" class="text-xs text-gray-500">
                            ({{ product.availableEpcs.length }} available from order)
                          </span>
                        </label>

                        <!-- Show available EPCs from order -->
                        <div v-if="product.availableEpcs && product.availableEpcs.length > 0" class="mb-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p class="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">Available EPCs from shipped order:</p>
                          <div class="flex flex-wrap gap-2">
                            <button
                              v-for="epc in product.availableEpcs"
                              :key="epc.epcCode"
                              type="button"
                              @click="toggleEpcSelection(pIndex, epc.epcCode)"
                              :class="[
                                'px-2 py-1 text-xs rounded border transition-colors',
                                product.epcCodes.includes(epc.epcCode)
                                  ? 'bg-brand-500 text-white border-brand-600'
                                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-brand-500'
                              ]"
                            >
                              {{ epc.epcCode }}
                            </button>
                          </div>
                          <p class="text-xs text-gray-500 mt-2">
                            Selected: {{ product.epcCodes.length }} / {{ product.availableEpcs.length }}
                          </p>
                        </div>

                        <!-- Manual EPC input -->
                        <div>
                          <div class="flex gap-2">
                            <input
                              v-model="newEpcInput[pIndex]"
                              type="text"
                              class="input input-bordered flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="Enter or scan EPC manually"
                              @keyup.enter="addManualEpc(pIndex)"
                            />
                            <button
                              type="button"
                              @click="addManualEpc(pIndex)"
                              class="btn bg-brand-500 hover:bg-brand-600 text-white border-none btn-sm"
                            >
                              Add
                            </button>
                          </div>

                          <!-- Display manually added EPCs -->
                          <div v-if="product.epcCodes.length > 0 && (!product.availableEpcs || product.availableEpcs.length === 0)" class="mt-2 flex flex-wrap gap-2">
                            <span
                              v-for="(epc, eIdx) in product.epcCodes"
                              :key="eIdx"
                              class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded"
                            >
                              {{ epc }}
                              <button
                                type="button"
                                @click="removeEpc(pIndex, eIdx)"
                                class="text-red-500 hover:text-red-700"
                              >
                                ✕
                              </button>
                            </span>
                          </div>
                        </div>
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
import { ref, reactive, nextTick, onBeforeUnmount, computed } from 'vue'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.css'
import authenticatedFetch from '@/utils/authenticatedFetch'

interface Product {
  productId: number
  productName: string
  skuCode: string
  maxQuantity: number
  reasons: Array<{
    quantity: number
    reasonOfReturn: string
    other: string
  }>
  epcCodes: string[]
  availableEpcs?: Array<{
    epcCode: string
    warehouseCode: string
    locationCode: string
  }>
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
    allocatedEpcs?: Array<{
      epcCode: string
      warehouseCode: string
      locationCode: string
    }>
  }>
}

const emit = defineEmits(['return-updated', 'close'])

const isOpen = ref(false)
const isSubmitting = ref(false)
const currentStep = ref(1)
const totalSteps = 2

const allOrders = ref<Order[]>([])
const selectedOrder = ref<Order | null>(null)

const steps = [
  { id: 1, name: 'Return' },
  { id: 2, name: 'Product' }
]

const availableProducts = computed(() => {
  if (!selectedOrder.value) return []

  const selectedProductIds = formData.products.map(p => p.productId)
  return selectedOrder.value.orderItems
    .filter(item => !selectedProductIds.includes(item.productId))
    .map(item => ({
      id: item.product.id,
      name: item.product.name,
      skuCode: item.product.skuCode,
      maxQuantity: item.quantity,
      allocatedEpcs: item.allocatedEpcs || []
    }))
})

const formData = reactive({
  id: null as number | null,
  returnNumber: '',
  returnType: '',
  referenceNumber: '',
  returnDate: new Date().toISOString().split('T')[0],
  from: '',
  to: '',
  personInCharge: '',
  remarks: '',
  products: [
    {
      productId: 0,
      productName: '',
      skuCode: '',
      maxQuantity: 0,
      reasons: [{ quantity: 1, reasonOfReturn: '', other: '' }],
      epcCodes: [],
      availableEpcs: []
    }
  ] as Product[]
})

const errors = reactive<Record<string, string>>({})
const returnDateInput = ref<HTMLInputElement | null>(null)
const productDropdownRefs = ref<any>({})
let flatpickrReturnDate: any = null

const openDropdowns = reactive<Record<string, boolean>>({})
const productMenuStyles = ref<Record<number, any>>({})
const reasonMenuStyles = ref<Record<string, any>>({})

const newEpcInput = ref<Record<number, string>>({})

const lockScroll = () => {
  document.body.style.overflow = 'hidden'
}

const unlockScroll = () => {
  document.body.style.overflow = ''
}

const prefillReturn = async (returnData: any) => {
  // Prefer the original backend payload if available via _raw (ReturnTable passes transformed row)
  const raw = returnData?._raw ?? returnData

  // Set return ID for PATCH request
  formData.id = (raw?.id ?? returnData?.id ?? returnData?.returnId) ?? null

  // Basic return information (use multiple fallback keys)
  formData.returnNumber = returnData?.returnNo || raw?.returnCode || raw?.returnNo || raw?.returnNumber || ''

  const rtRaw = (returnData?.returnType || raw?.returnType || returnData?.type || raw?.type || '').toString()
  // Accept 'CUSTOMER_RETURN', 'SUPPLIER_RETURN', 'CUSTOMER', 'SUPPLIER', 'Customer', 'Supplier'
  const rt = rtRaw.toUpperCase()
  if (rt.includes('CUSTOMER')) formData.returnType = 'Customer'
  else if (rt.includes('SUPPLIER')) formData.returnType = 'Supplier'
  else formData.returnType = returnData?.returnType || raw?.returnType || ''

  formData.returnDate = (raw?.requestedDate || raw?.returnDate || raw?.createdAt || returnData?.requestedDate || returnData?.returnDate) ? String((raw?.requestedDate || raw?.returnDate || raw?.createdAt || returnData?.requestedDate || returnData?.returnDate)).split('T')[0] : new Date().toISOString().split('T')[0]
  formData.personInCharge = raw?.createdBy || raw?.requester?.fullName || raw?.requester || returnData?.createdBy || ''
  formData.remarks = raw?.notes || raw?.reason || returnData?.notes || returnData?.reason || ''

  // Reference number: check transformed fields first, then raw order/receiving
  formData.referenceNumber = returnData?.referenceNo || returnData?.referenceNumber || raw?.order?.orderNo || raw?.order?.orderNumber || raw?.receiving?.receivingCode || raw?.receiving?.receivingNo || raw?.referenceNumber || ''
  if (raw?.order) selectedOrder.value = raw.order

  // From/To: prefer transformed values (returnData.from/to), else derive from raw
  formData.from = returnData?.from || raw?.from || (raw?.returnType === 'CUSTOMER_RETURN' || (String(raw?.returnType).toUpperCase().includes('CUSTOMER')) ? (raw?.customer?.customerName || raw?.customer?.name ? `Customer - ${raw.customer.customerName || raw.customer.name}` : 'Customer') : (raw?.warehouse?.name || raw?.warehouseName || 'Warehouse'))
  formData.to = returnData?.to || raw?.to || (raw?.returnType === 'CUSTOMER_RETURN' || (String(raw?.returnType).toUpperCase().includes('CUSTOMER')) ? (raw?.warehouse?.name || raw?.warehouseName || 'Warehouse') : (raw?.supplier?.supplierName || raw?.supplier?.name ? `Supplier - ${raw.supplier.supplierName || raw.supplier.name}` : 'Supplier'))

  // Map return items to products — prefer returnData.returnItems but fall back to raw.returnItems
  const returnedItems = (returnData.returnItems && returnData.returnItems.length > 0) ? returnData.returnItems : (raw.returnItems || [])
  if (returnedItems && returnedItems.length > 0) {
    // Group return items by product
    const productMap = new Map<number, any>()

    returnedItems.forEach((item: any) => {
      const productId = item.product?.id || item.productId

      if (!productMap.has(productId)) {
        productMap.set(productId, {
          productId: productId,
          productName: item.product?.name || item.productName || '',
          skuCode: item.product?.skuCode || item.sku || '',
          maxQuantity: 0,
          reasons: [],
          epcCodes: [],
          availableEpcs: []
        })
      }

      const product = productMap.get(productId)

      // Add EPC if exists
      if (item.epcCode) {
        product.epcCodes.push(item.epcCode)
      }

      // Add reason
      const reasonText = mapConditionToReason(item.condition || 'GOOD')
      product.reasons.push({
        quantity: item.quantity || 1,
        reasonOfReturn: reasonText,
        other: item.conditionNotes || item.other || ''
      })
    })

    formData.products = Array.from(productMap.values())

    // If we have order info (from returnData or raw), get available EPCs for each product
    const orderSource = returnData.order || raw.order
    if (orderSource && orderSource.orderItems) {
      formData.products.forEach(product => {
        const orderItem = orderSource.orderItems.find((oi: any) => oi.product.id === product.productId)
        if (orderItem) {
          product.maxQuantity = orderItem.quantity
          product.availableEpcs = orderItem.allocatedEpcs || []
        }
      })
    }
  } else {
    formData.products = [{
      productId: 0,
      productName: '',
      skuCode: '',
      maxQuantity: 0,
      reasons: [{ quantity: 1, reasonOfReturn: '', other: '' }],
      epcCodes: [],
      availableEpcs: []
    }]
  }
}

const openModal = async (returnData: any) => {
  await prefillReturn(returnData)
  isOpen.value = true
  currentStep.value = 1
  lockScroll()
  initializeFlatpickr()

  nextTick(() => {
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('resize', repositionOpenMenus)
    window.addEventListener('scroll', repositionOpenMenus, true)
  })
}

const closeModal = () => {
  if (isSubmitting.value) return

  if (flatpickrReturnDate) {
    flatpickrReturnDate.destroy()
    flatpickrReturnDate = null
  }

  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', repositionOpenMenus)
  window.removeEventListener('scroll', repositionOpenMenus, true)

  isOpen.value = false
  unlockScroll()
  emit('close')
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
      skuCode: '',
      maxQuantity: 0,
      reasons: [{ quantity: 1, reasonOfReturn: '', other: '' }],
      epcCodes: [],
      availableEpcs: []
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
  formData.products[productIndex].skuCode = product.skuCode || ''
  formData.products[productIndex].maxQuantity = product.maxQuantity || 0
  formData.products[productIndex].availableEpcs = product.allocatedEpcs || []

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

const initializeFlatpickr = async () => {
  await nextTick()

  if (flatpickrReturnDate) {
    flatpickrReturnDate.destroy()
    flatpickrReturnDate = null
  }

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

  if (name.startsWith('reason') && openDropdowns[name]) {
    await positionReasonMenu(name)
  }
}

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

const positionReasonMenu = async (key: string) => {
  await nextTick()
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

const toggleEpcSelection = (productIndex: number, epcCode: string) => {
  const product = formData.products[productIndex]
  const index = product.epcCodes.indexOf(epcCode)

  if (index > -1) {
    product.epcCodes.splice(index, 1)
  } else {
    product.epcCodes.push(epcCode)
  }
}

const addManualEpc = (productIndex: number) => {
  const epcCode = newEpcInput.value[productIndex]?.trim()
  if (!epcCode) return

  const product = formData.products[productIndex]
  if (!product.epcCodes.includes(epcCode)) {
    product.epcCodes.push(epcCode)
  }

  newEpcInput.value[productIndex] = ''
}

const removeEpc = (productIndex: number, epcIndex: number) => {
  formData.products[productIndex].epcCodes.splice(epcIndex, 1)
}

const validateQuantity = (productIndex: number, reasonIndex: number) => {
  const product = formData.products[productIndex]
  const reason = product.reasons[reasonIndex]

  if (product.maxQuantity && reason.quantity > product.maxQuantity) {
    reason.quantity = product.maxQuantity
    errors[`product${productIndex}Reason${reasonIndex}Quantity`] = `Cannot exceed ${product.maxQuantity}`

    setTimeout(() => {
      delete errors[`product${productIndex}Reason${reasonIndex}Quantity`]
    }, 3000)
  }
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node

  const dropdownMenus = document.querySelectorAll('.dropdown-menu')
  for (const menu of dropdownMenus) {
    if (menu.contains(target)) {
      return
    }
  }

  for (const key in productDropdownRefs.value) {
    if (productDropdownRefs.value[key] && productDropdownRefs.value[key].contains(target)) {
      return
    }
  }

  Object.keys(openDropdowns).forEach(key => {
    openDropdowns[key] = false
  })
}

const submitForm = async () => {
  if (!validateStep(currentStep.value)) return
  
  if (!formData.id) {
    console.error('Return ID is missing')
    return
  }

  isSubmitting.value = true

  try {
    const returnType = formData.returnType === 'Customer' ? 'CUSTOMER_RETURN' : 'SUPPLIER_RETURN'

    // Build returnItems manually to avoid TS typing issues (epcCode can be string or null)
    const returnItems: any[] = []
    formData.products.forEach(product => {
      if (product.epcCodes && product.epcCodes.length > 0) {
        product.epcCodes.forEach((epcCode: string) => {
          returnItems.push({
            productId: product.productId,
            epcCode: epcCode,
            quantity: 1,
            condition: mapReasonToCondition(product.reasons[0]?.reasonOfReturn || 'Good'),
            conditionNotes: product.reasons[0]?.other || product.reasons[0]?.reasonOfReturn || ''
          })
        })
      } else {
        product.reasons.forEach(reason => {
          returnItems.push({
            productId: product.productId,
            epcCode: null,
            quantity: reason.quantity,
            condition: mapReasonToCondition(reason.reasonOfReturn),
            conditionNotes: reason.other || reason.reasonOfReturn
          })
        })
      }
    })

    const payload = {
      returnType,
      requestedDate: formData.returnDate,
      reason: formData.remarks,
      notes: formData.remarks,
      returnItems
    }

    const response = await authenticatedFetch(`/api/return/${formData.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to update return')
    }

    const result = await response.json()

    emit('return-updated', {
      success: true,
      data: result
    })

    await new Promise(resolve => setTimeout(resolve, 100))
    closeModal()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update return'
    emit('return-updated', {
      success: false,
      error: message
    })
  } finally {
    isSubmitting.value = false
  }
}

const mapReasonToCondition = (reason: string): string => {
  const mapping: Record<string, string> = {
    'Defective': 'DEFECTIVE',
    'Damaged': 'DAMAGED',
    'Wrong Item': 'WRONG_ITEM',
    'Expired': 'DEFECTIVE',
    'Other': 'GOOD'
  }
  return mapping[reason] || 'GOOD'
}

const mapConditionToReason = (condition: string): string => {
  const mapping: Record<string, string> = {
    'DEFECTIVE': 'Defective',
    'DAMAGED': 'Damaged',
    'WRONG_ITEM': 'Wrong Item',
    'GOOD': 'Other'
  }
  return mapping[condition] || 'Other'
}

const productTotalQuantity = (product: any): number => {
  if (!product) return 0
  if (product.epcCodes && product.epcCodes.length) return product.epcCodes.length
  if (product.reasons && product.reasons.length) return product.reasons.reduce((sum: number, r: any) => sum + (Number(r.quantity) || 0), 0)
  return 0
}

defineExpose({
  openModal,
  closeModal,
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', repositionOpenMenus)
  window.removeEventListener('scroll', repositionOpenMenus, true)

  if (flatpickrReturnDate) {
    flatpickrReturnDate.destroy()
    flatpickrReturnDate = null
  }

  if (isOpen.value) unlockScroll()
})
</script>