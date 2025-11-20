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
                  <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                    {{ isViewMode ? 'View Receiving' : 'Edit Receiving Information' }}
                  </h2>
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
                <!-- Error Message Banner -->
                <div v-if="submitError" class="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div class="flex items-start">
                    <svg class="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                    <div class="ml-3 flex-1">
                      <h3 class="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                      <p class="mt-1 text-sm text-red-700 dark:text-red-300">{{ submitError }}</p>
                    </div>
                    <button @click="submitError = ''" class="ml-3 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200">
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Step 1: Status & Receiving Details -->
                <div v-if="currentStep === 1">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status & Receiving Details</h3>
                  <div class="space-y-4">

                    <!-- Status Selection (Prominent) -->
                    <div class="bg-brand-50 dark:bg-brand-900/20 p-4 rounded-lg border border-brand-200 dark:border-brand-800">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Receiving Status <span class="text-red-500">*</span>
                      </label>
                      <div class="grid grid-cols-2 gap-3">
                        <label
                          v-for="status in statusOptions"
                          :key="status"
                          class="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all"
                          :class="[
                            formData.status === status
                              ? getStatusBorderClass(status)
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          ]"
                        >
                          <input
                            v-model="formData.status"
                            type="radio"
                            :value="status"
                            class="radio radio-primary"
                            :disabled="isViewMode"
                          />
                          <span class="flex-1">
                            <span :class="['badge text-white font-medium', getStatusBadgeClass(status)]">
                              {{ status }}
                            </span>
                          </span>
                        </label>
                      </div>
                      <p class="text-xs text-gray-500 mt-2">
                        ℹ️ Update the receiving status. Mark as COMPLETED when all items are received.
                      </p>
                    </div>

                    <!-- Row 1: Receiving Code & PO Number (Read-only) -->
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Receiving Code
                        </label>
                        <input
                          v-model="formData.receivingCode"
                          type="text"
                          class="input input-bordered w-full bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                          readonly
                          disabled
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          PO Number
                        </label>
                        <input
                          :value="formData.poNumber || 'N/A'"
                          type="text"
                          class="input input-bordered w-full bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                          readonly
                          disabled
                        />
                      </div>
                    </div>

                    <!-- Row 2: DO Number (Editable) -->
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          DO Number <span class="text-red-500">*</span>
                        </label>
                        <input
                          v-model="formData.doNumber"
                          type="text"
                          class="input input-bordered w-full"
                          placeholder="Enter DO number"
                          :readonly="isViewMode"
                          :disabled="isViewMode"
                        />
                        <span v-if="errors.doNumber" class="text-xs text-red-500 mt-1">{{ errors.doNumber }}</span>
                      </div>
                    </div>

                    <!-- Row 3: Receiving Type & Received By -->
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Receiving Type <span class="text-red-500">*</span>
                        </label>
                        <div class="relative" ref="receivingTypeDropdownRef">
                          <button
                            type="button"
                            @click="!isViewMode && toggleDropdown('receivingType')"
                            class="input input-bordered w-full text-left flex items-center justify-between"
                            :disabled="isViewMode"
                          >
                            <span>{{ formatPurposeDisplay(formData.receivingPurpose) || 'Select Receiving Type' }}</span>
                            <span v-if="!isViewMode" class="icon-[tabler--chevron-down] size-4"></span>
                          </button>
                          <ul
                            v-if="openDropdowns.receivingType && !isViewMode"
                            class="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                          >
                            <li
                              v-for="option in receivingTypeOptions"
                              :key="option.value"
                              @click="selectReceivingType(option.value)"
                              class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                            >
                              {{ option.label }}
                            </li>
                          </ul>
                        </div>
                        <span v-if="errors.receivingType" class="text-xs text-red-500 mt-1">{{ errors.receivingType }}</span>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Received By <span class="text-red-500">*</span>
                        </label>
                        <input
                          v-model="formData.receivedBy"
                          type="text"
                          class="input input-bordered w-full"
                          placeholder="Enter received by"
                          :readonly="isViewMode"
                          :disabled="isViewMode"
                        />
                        <span v-if="errors.receivedBy" class="text-xs text-red-500 mt-1">{{ errors.receivedBy }}</span>
                      </div>
                    </div>

                    <!-- Row 4: Receiving Date & Remarks -->
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Receiving Date <span class="text-red-500">*</span>
                        </label>
                        <input
                          ref="receivingDateInput"
                          v-model="formData.receivingDate"
                          type="text"
                          placeholder="Select Date"
                          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          readonly
                          :disabled="isViewMode"
                        />
                        <span v-if="errors.receivingDate" class="text-xs text-red-500 mt-1">{{ errors.receivingDate }}</span>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Remarks
                        </label>
                        <textarea
                          v-model="formData.remarks"
                          rows="3"
                          class="input input-bordered w-full"
                          placeholder="Enter any remarks"
                          :readonly="isViewMode"
                          :disabled="isViewMode"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Step 2: Supplier (Read-only) -->
                <div v-if="currentStep === 2">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Supplier Information</h3>
                  <div class="space-y-4">
                    <!-- Info banner -->
                    <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p class="text-sm text-blue-800 dark:text-blue-200">
                        ℹ️ Supplier cannot be changed after receiving is created.
                      </p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Supplier
                      </label>
                      <input
                        :value="getSupplierName(formData.supplierId)"
                        type="text"
                        class="input input-bordered w-full bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                        readonly
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <!-- Step 3: Products (Quantities Editable) -->
                <div v-if="currentStep === 3">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product Information</h3>

                  <!-- Info banner -->
                  <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                    <p class="text-sm text-blue-800 dark:text-blue-200">
                      ℹ️ Products cannot be changed. You can only update the received quantities.
                    </p>
                  </div>

                  <!-- Product Rows -->
                  <div class="space-y-3 max-h-96 overflow-y-auto" style="padding-right: 8px;">
                    <div v-for="(product, index) in formData.products" :key="index" class="grid grid-cols-12 gap-4 items-start">
                      <!-- Product Name (Read-only) -->
                      <div class="col-span-7 relative">
                        <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                          Product {{ index + 1 }}
                        </label>
                        <input
                          :value="getProductName(product.productId)"
                          type="text"
                          class="input input-bordered w-full bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                          readonly
                          disabled
                        />
                      </div>

                      <!-- Product Quantity (Editable) -->
                      <div class="col-span-4 relative">
                        <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                          <span class="text-red-500">*</span> Actual Quantity
                        </label>
                        <div class="flex items-center gap-1">
                          <button
                            type="button"
                            @click="!isViewMode && decreaseQuantity(index)"
                            class="btn btn-outline btn-sm w-8 h-8 p-0 flex items-center justify-center dark:bg-gray-700 dark:text-gray-400"
                            :disabled="isViewMode"
                          >
                            −
                          </button>
                          <input
                            v-model.number="product.quantity"
                            type="number"
                            min="1"
                            class="input input-bordered text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            style="width: 5rem"
                            :readonly="isViewMode"
                            :disabled="isViewMode"
                          />
                          <button
                            type="button"
                            @click="!isViewMode && increaseQuantity(index)"
                            class="btn bg-brand-500 border-none btn-sm w-8 h-8 p-0 flex items-center justify-center"
                            :disabled="isViewMode"
                          >
                            +
                          </button>
                        </div>
                        <span v-if="errors[`quantity${index}`]" class="text-xs text-red-500 mt-1">{{ errors[`quantity${index}`] }}</span>
                      </div>

                      <div class="col-span-1"></div>
                    </div>
                  </div>
                </div>

                <!-- Step 4: Location (Read-only) -->
                <div v-if="currentStep === 4">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Location Information</h3>

                  <!-- Info banner -->
                  <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                    <p class="text-sm text-blue-800 dark:text-blue-200">
                      ℹ️ Warehouse and location cannot be changed after receiving is created.
                    </p>
                  </div>

                  <div class="space-y-4">
                    <!-- Warehouse (Read-only) -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Warehouse
                      </label>
                      <input
                        :value="getWarehouseName(formData.warehouseId) || 'Not Assigned'"
                        type="text"
                        class="input input-bordered w-full bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                        readonly
                        disabled
                      />
                    </div>

                    <!-- Location (Read-only) -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Location
                      </label>
                      <input
                        :value="getLocationName(formData.locationId) || 'Not Assigned'"
                        type="text"
                        class="input input-bordered w-full bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                        readonly
                        disabled
                      />
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
                    v-if="currentStep < totalSteps && !isViewMode"
                    @click="nextStep"
                    class="btn bg-brand-500 border-none"
                  >
                    Next →
                  </button>
                  <button
                    v-if="currentStep === totalSteps && !isViewMode"
                    @click="submitForm"
                    :disabled="isSubmitting"
                    class="btn btn-primary"
                  >
                    <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
                    {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
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
import { authenticatedFetch } from '@/utils/authenticatedFetch'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.css'

const emit = defineEmits(['receiving-updated', 'close'])

const isOpen = ref(false)
const isViewMode = ref(false)
const isSubmitting = ref(false)
const currentStep = ref(1)
const totalSteps = 4
const receivingId = ref<number | null>(null)

const steps = [
  { id: 1, name: 'Status & Details' },
  { id: 2, name: 'Supplier' },
  { id: 3, name: 'Products' },
  { id: 4, name: 'Location' },
]

const statusOptions = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CLOSED']

const formData = reactive({
  receivingCode: '',
  poNumber: '',
  doNumber: '',
  receivingPurpose: '',
  receivedBy: '',
  receivingDate: '',
  remarks: '',
  status: 'PENDING',
  supplierId: null as number | null,
  products: [] as { productId: number | null; quantity: number }[],
  warehouseId: null as number | null,
  locationId: null as number | null,
})

const errors = reactive<Record<string, string>>({})
const submitError = ref<string>('')

// API Data
const suppliers = ref<any[]>([])
const products = ref<any[]>([])
const warehouses = ref<any[]>([])
const locations = ref<any[]>([])

const receivingTypeDropdownRef = ref<any>(null)
const receivingDateInput = ref(null)
let flatpickrInstance: any = null

const openDropdowns = reactive<Record<string, boolean>>({
  receivingType: false,
})

// Receiving Type options
const receivingTypeOptions = [
  { label: 'Raw Material', value: 'RAW_MATERIAL' },
  { label: 'Finished Goods', value: 'FINISHED_GOODS' }
]

const lockScroll = () => {
  document.body.style.overflow = 'hidden'
}

const unlockScroll = () => {
  document.body.style.overflow = ''
}

/* Fetch Suppliers */
const fetchSuppliers = async () => {
  try {
    const response = await authenticatedFetch('/api/supplier')
    if (response.ok) {
      suppliers.value = await response.json()
    }
  } catch (error) {
    console.error('Error fetching suppliers:', error)
  }
}

/* Fetch Products */
const fetchProducts = async () => {
  try {
    const response = await authenticatedFetch('/api/product')
    if (response.ok) {
      products.value = await response.json()
    }
  } catch (error) {
    console.error('Error fetching products:', error)
  }
}

/* Fetch Warehouses */
const fetchWarehouses = async () => {
  try {
    const response = await authenticatedFetch('/api/warehouse')
    if (response.ok) {
      warehouses.value = await response.json()
    }
  } catch (error) {
    console.error('Error fetching warehouses:', error)
  }
}

/* Fetch Locations */
const fetchLocations = async () => {
  try {
    const response = await authenticatedFetch('/api/location')
    if (response.ok) {
      locations.value = await response.json()
    }
  } catch (error) {
    console.error('Error fetching locations:', error)
  }
}

/* Helper functions */
const getSupplierName = (id: number | null) => {
  if (!id) return 'N/A'
  const supplier = suppliers.value.find(s => s.id === id)
  return supplier ? supplier.supplierName : 'N/A'
}

const getProductName = (id: number | null) => {
  if (!id) return 'N/A'
  const product = products.value.find(p => p.id === id)
  return product ? product.name : 'N/A'
}

const getWarehouseName = (id: number | null) => {
  if (!id) return ''
  const warehouse = warehouses.value.find(w => w.id === id)
  return warehouse ? `${warehouse.warehouseCode} - ${warehouse.name}` : ''
}

const getLocationName = (id: number | null) => {
  if (!id) return ''
  const location = locations.value.find(l => l.id === id)
  return location ? `${location.locationCode} - ${location.locationName || location.name}` : ''
}

const formatPurposeDisplay = (value: string) => {
  const option = receivingTypeOptions.find(opt => opt.value === value)
  return option ? option.label : value
}

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    'PENDING': 'bg-yellow-500',
    'IN_PROGRESS': 'bg-blue-500',
    'COMPLETED': 'bg-green-500',
    'CLOSED': 'bg-gray-500',
  }
  return classes[status] || 'bg-gray-500'
}

const getStatusBorderClass = (status: string) => {
  const classes: Record<string, string> = {
    'PENDING': 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
    'IN_PROGRESS': 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
    'COMPLETED': 'border-green-500 bg-green-50 dark:bg-green-900/20',
    'CLOSED': 'border-gray-500 bg-gray-50 dark:bg-gray-900/20',
  }
  return classes[status] || 'border-gray-500'
}

/* Dropdown handlers */
const toggleDropdown = (name: string) => {
  if (isViewMode.value) return
  Object.keys(openDropdowns).forEach(k => {
    if (k !== name) openDropdowns[k] = false
  })
  openDropdowns[name] = !openDropdowns[name]
}

const selectReceivingType = (value: string) => {
  formData.receivingPurpose = value
  openDropdowns.receivingType = false
}

/* Product quantity management */
const increaseQuantity = (index: number) => {
  formData.products[index].quantity++
}

const decreaseQuantity = (index: number) => {
  if (formData.products[index].quantity > 1) {
    formData.products[index].quantity--
  }
}

/* Handle clicks outside dropdown */
const handleClickOutside = (event: any) => {
  const refs = [receivingTypeDropdownRef.value]
  
  let clickedInside = false
  for (const ref of refs) {
    if (ref && ref.contains(event.target)) {
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

const openModal = async (receiving: any = null, viewOnly = false) => {
  // Fetch required data
  await Promise.all([
    fetchSuppliers(),
    fetchProducts(),
    fetchWarehouses(),
    fetchLocations()
  ])

  isViewMode.value = viewOnly
  currentStep.value = 1

  if (receiving && receiving.id) {
    receivingId.value = receiving.id

    // Populate form with receiving data
    formData.receivingCode = receiving.receivingCode || ''
    formData.poNumber = receiving.order?.orderNo || ''
    formData.doNumber = receiving.doNumber || ''
    formData.receivingPurpose = receiving.receivingPurpose || ''
    formData.receivedBy = receiving.receivedBy || ''
    formData.receivingDate = receiving.receivingDate ? receiving.receivingDate.split('T')[0] : ''
    formData.remarks = receiving.remarks || ''
    formData.status = receiving.status || 'PENDING'
    formData.supplierId = receiving.supplierId || null
    formData.warehouseId = receiving.warehouseId || null
    formData.locationId = receiving.locationId || null

    // Populate products
    if (receiving.receivingItems && receiving.receivingItems.length > 0) {
      formData.products = receiving.receivingItems.map((item: any) => ({
        productId: item.productId || item.product?.id,
        quantity: item.quantity || 1
      }))
    }
  }

  isOpen.value = true
  lockScroll()

  // Initialize Flatpickr
  await nextTick()
  if (receivingDateInput.value && !flatpickrInstance && !isViewMode.value) {
    flatpickrInstance = flatpickr(receivingDateInput.value, {
      dateFormat: 'Y-m-d',
      defaultDate: formData.receivingDate || new Date(),
      onChange: (selectedDates: Date[], dateStr: string) => {
        formData.receivingDate = dateStr
      }
    })
  }
}

const closeModal = async (force = false) => {
  if (isSubmitting.value && !force) return

  // Close all dropdowns
  Object.keys(openDropdowns).forEach(key => openDropdowns[key] = false)

  // Destroy Flatpickr
  if (flatpickrInstance) {
    flatpickrInstance.destroy()
    flatpickrInstance = null
  }

  isOpen.value = false
  unlockScroll()

  await nextTick()
  emit('close')
}

const validateStep = (step: number): boolean => {
  Object.keys(errors).forEach((key) => delete errors[key])

  if (step === 1) {
    if (!formData.status) errors.status = 'Status is required'
    if (!formData.doNumber || !formData.doNumber.trim()) errors.doNumber = 'DO Number is required'
    if (!formData.receivingPurpose) errors.receivingType = 'Receiving type is required'
    if (!formData.receivedBy || !formData.receivedBy.trim()) errors.receivedBy = 'Received by is required'
    if (!formData.receivingDate) errors.receivingDate = 'Receiving date is required'
  } else if (step === 3) {
    formData.products.forEach((product, index) => {
      if (!product.quantity || product.quantity < 1) {
        errors[`quantity${index}`] = 'Quantity must be at least 1'
      }
    })
  }

  return Object.keys(errors).length === 0
}

const nextStep = () => {
  if (!validateStep(currentStep.value)) return
  submitError.value = ''
  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const submitForm = async () => {
  if (!validateStep(currentStep.value)) return

  submitError.value = ''
  isSubmitting.value = true

  try {
    const updateData = {
      doNumber: formData.doNumber,
      receivingPurpose: formData.receivingPurpose,
      receivedBy: formData.receivedBy,
      receivingDate: formData.receivingDate,
      remarks: formData.remarks || null,
      status: formData.status,
      receivingItems: formData.products.map(product => ({
        productId: product.productId,
        quantity: product.quantity,
      }))
    }

    const response = await authenticatedFetch(`/api/receiving/${receivingId.value}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to update receiving')
    }

    const responseData = await response.json()

    emit('receiving-updated', {
      success: true,
      message: 'Successfully updated receiving',
      data: responseData,
    })

    await new Promise(resolve => setTimeout(resolve, 100))
    await closeModal(true)

  } catch (error) {
    console.error('Error updating receiving:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update receiving'
    submitError.value = errorMessage

    emit('receiving-updated', {
      success: false,
      error: errorMessage,
    })
  } finally {
    isSubmitting.value = false
  }
}

defineExpose({
  openModal,
  closeModal,
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)

  if (flatpickrInstance) {
    flatpickrInstance.destroy()
    flatpickrInstance = null
  }
})
</script>
