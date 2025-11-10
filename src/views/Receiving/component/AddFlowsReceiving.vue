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
                  <h2 class="text-xl font-bold text-gray-900 dark:text-white">Add Receiving Information</h2>
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
                            ? 'text-brand-500 dark:text-brand-400'
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
                <!-- Step 1: Supplier -->
                <div v-if="currentStep === 1">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Supplier Information</h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Supplier <span class="text-red-500">*</span>
                      </label>
                      <div class="relative" ref="supplierDropdownRef">
                        <button
                          type="button"
                          @click="toggleDropdown('supplier')"
                          class="input input-bordered w-full text-left flex items-center justify-between"
                        >
                          <span>{{ getSupplierName(formData.supplierId) || 'Select Supplier' }}</span>
                          <span class="icon-[tabler--chevron-down] size-4"></span>
                        </button>
                        <ul
                          v-if="openDropdowns.supplier"
                          class="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                        >
                          <li
                            v-for="supplier in suppliers"
                            :key="supplier.id"
                            @click="selectSupplier(supplier.id)"
                            class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                          >
                            {{ supplier.supplierName }}
                          </li>
                          <li v-if="suppliers.length === 0" class="px-4 py-2 text-sm text-gray-500">
                            No suppliers found
                          </li>
                        </ul>
                      </div>
                      <span v-if="errors.supplierId" class="text-xs text-red-500 mt-1">{{ errors.supplierId }}</span>

                      <!-- Add New Supplier Button -->
                      <button
                        type="button"
                        @click="openAddSupplierModal"
                        class="mt-4 btn bg-brand-500 border-none btn-sm"
                      >
                        <span class="text-lg">+</span>
                        Add New Supplier
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Step 2: Receiving -->
                <div v-if="currentStep === 2">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Receiving Details</h3>
                  <div class="space-y-4">
                    <!-- Row 1: Receiving Code & DO Number -->
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Receiving Code <span class="text-red-500">*</span>
                        </label>
                        <input
                          v-model="formData.receivingCode"
                          type="text"
                          class="input input-bordered w-full"
                          placeholder="Enter receiving code"
                        />
                        <span v-if="errors.receivingCode" class="text-xs text-red-500 mt-1">{{ errors.receivingCode }}</span>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          DO Number
                        </label>
                        <input
                          v-model="formData.doNumber"
                          type="text"
                          class="input input-bordered w-full"
                          placeholder="Enter DO number"
                        />
                      </div>
                    </div>

                    <!-- Row 2: Receiving Type & Received By -->
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Receiving Type <span class="text-red-500">*</span>
                        </label>
                        <div class="relative" ref="receivingTypeDropdownRef">
                          <button
                            type="button"
                            @click="toggleDropdown('receivingType')"
                            class="input input-bordered w-full text-left flex items-center justify-between"
                          >
                            <span>{{ formData.receivingType || 'Select Receiving Type' }}</span>
                            <span class="icon-[tabler--chevron-down] size-4"></span>
                          </button>
                          <ul
                            v-if="openDropdowns.receivingType"
                            class="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                          >
                            <li
                              v-for="type in receivingTypeOptions"
                              :key="type"
                              @click="selectReceivingType(type)"
                              class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                            >
                              {{ type }}
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
                        />
                        <span v-if="errors.receivedBy" class="text-xs text-red-500 mt-1">{{ errors.receivedBy }}</span>
                      </div>
                    </div>

                    <!-- Row 3: Receiving Date & Remarks -->
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
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Step 3: Product -->
                <div v-if="currentStep === 3">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product Information</h3>
                  
                  <!-- Product Rows -->
                  <div class="space-y-3 max-h-96 overflow-y-auto" style="padding-right: 8px;">
                    <div v-for="(product, index) in formData.products" :key="index" class="grid grid-cols-12 gap-4 items-start">
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
                          >
                            {{ getProductName(product.productId) || 'Select Product' }}
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
                            <li v-for="prod in availableProducts(index)" :key="prod.id">
                              <a class="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-lg" @click="selectProduct(index, prod.id)">
                                {{ prod.name }}
                              </a>
                            </li>
                          </ul>
                        </div>
                        <span v-if="errors[`product${index}`]" class="text-xs text-red-500 mt-1">{{ errors[`product${index}`] }}</span>
                      </div>

                      <!-- Product Quantity -->
                      <div class="col-span-4 relative">
                        <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                          <span class="text-red-500">*</span> Quantity
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
                            v-model.number="product.quantity"
                            type="number"
                            min="1"
                            :class="['input input-bordered text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors[`quantity${index}`] }]"
                            style="width: 4rem"
                            @input="validateQuantity(index)"
                          />
                          <button
                            type="button"
                            @click="increaseQuantity(index)"
                            class="btn bg-brand-500 border-none btn-sm w-8 h-8 p-0 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                        <span v-if="errors[`quantity${index}`]" class="text-xs text-red-500 mt-1">{{ errors[`quantity${index}`] }}</span>
                      </div>

                      <!-- Remove Button -->
                      <div class="col-span-1 flex items-end">
                        <button
                          v-if="formData.products.length > 1"
                          type="button"
                          @click="removeProduct(index)"
                          class="btn btn-outline btn-error btn-sm w-10 h-10 p-0 flex items-center justify-center mt-6"
                          title="Remove Product"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Add Another Product Button -->
                  <button
                    type="button"
                    @click="addProduct"
                    class="btn bg-brand-500 border-none btn-sm mt-4"
                  >
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Another Product
                  </button>
                </div>

                <!-- Step 4: Location -->
                <div v-if="currentStep === 4">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Location Assignment</h3>
                  
                  <!-- Skip Location Assignment Checkbox -->
                  <div class="mb-4">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="formData.skipLocationAssignment"
                        type="checkbox"
                        class="checkbox checkbox-primary"
                      />
                      <span class="text-sm text-gray-700 dark:text-gray-300">Skip location assignment</span>
                    </label>
                  </div>

                  <div v-if="!formData.skipLocationAssignment" class="space-y-4">
                    <!-- Warehouse Dropdown -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Warehouse <span class="text-red-500">*</span>
                      </label>
                      <div class="relative" ref="warehouseDropdownRef">
                        <button
                          type="button"
                          @click="toggleDropdown('warehouse')"
                          class="input input-bordered w-full text-left flex items-center justify-between"
                          :disabled="loadingWarehouses"
                        >
                          <span>{{ getWarehouseName(formData.warehouseId) || 'Select Warehouse' }}</span>
                          <span class="icon-[tabler--chevron-down] size-4"></span>
                        </button>
                        <ul
                          v-if="openDropdowns.warehouse"
                          class="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                        >
                          <li
                            v-for="warehouse in warehouses"
                            :key="warehouse.id"
                            @click="selectWarehouse(warehouse.id)"
                            class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                          >
                            {{ warehouse.warehouseCode }} - {{ warehouse.name }}
                          </li>
                          <li v-if="warehouses.length === 0" class="px-4 py-2 text-sm text-gray-500">
                            No warehouses found
                          </li>
                        </ul>
                      </div>
                      <span v-if="errors.warehouseId" class="text-xs text-red-500 mt-1">{{ errors.warehouseId }}</span>
                    </div>

                    <!-- Location Hierarchy Dropdown -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Location (Optional)
                      </label>
                      <div class="relative" ref="locationDropdownRef">
                        <button
                          type="button"
                          @click="toggleDropdown('location')"
                          class="input input-bordered w-full text-left flex items-center justify-between"
                          :disabled="!formData.warehouseId || loadingLocations"
                        >
                          <span>{{ getLocationName(formData.locationId) || 'Select Location' }}</span>
                          <span class="icon-[tabler--chevron-down] size-4"></span>
                        </button>
                        <ul
                          v-if="openDropdowns.location"
                          class="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                        >
                          <li
                            v-for="location in hierarchicalLocations"
                            :key="location.id"
                            @click="selectLocation(location.id)"
                            class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                            :style="{ paddingLeft: (location.depth * 1.5 + 1) + 'rem' }"
                          >
                            <div class="flex items-center gap-2">
                              <span v-if="location.hasChildren" class="text-xs">{{ location.isExpanded ? '▼' : '▶' }}</span>
                              <span v-else class="w-3"></span>
                              <span>{{ location.locationCode }} - {{ location.locationName }}</span>
                            </div>
                          </li>
                          <li v-if="hierarchicalLocations.length === 0" class="px-4 py-2 text-sm text-gray-500">
                            {{ formData.warehouseId ? 'No locations found' : 'Please select a warehouse first' }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <!-- Message when skipped -->
                  <div v-else class="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      Location assignment will be skipped. You can assign a location later.
                    </p>
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
                    class="btn bg-brand-500 border-none"
                  >
                    Next →
                  </button>
                  <button
                    v-else
                    @click="submitForm"
                    :disabled="isSubmitting"
                    class="btn btn-primary"
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
  
  <!-- AddNewSupplier Modal -->
  <AddNewSupplier ref="addSupplierModalRef" @supplier-created="handleSupplierCreated" />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import { authenticatedFetch } from '@/utils/authenticatedFetch'
import AddNewSupplier from '@/views/Supplier/component/AddNewSupplier.vue'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.css'

const emit = defineEmits(['flow-created', 'close'])

const isOpen = ref(false)
const isSubmitting = ref(false)
const currentStep = ref(1)
const totalSteps = 4

const steps = [
  { id: 1, name: 'Supplier' },
  { id: 2, name: 'Receiving' },
  { id: 3, name: 'Product' },
  { id: 4, name: 'Location' },
]

const formData = reactive({
  // Step 1: Supplier
  supplierId: null as number | null,
  // Step 2: Receiving
  receivingCode: '',
  doNumber: '',
  receivingType: '',
  receivedBy: '',
  receivingDate: new Date().toISOString().split('T')[0],
  remarks: '',
  // Step 3: Product (now array)
  products: [
    { productId: null as number | null, quantity: 1 }
  ],
  // Step 4: Location
  skipLocationAssignment: false,
  warehouseId: null as number | null,
  locationId: null as number | null,
})

const errors = reactive<Record<string, string>>({})

// Supplier dropdown state
const suppliers = ref<any[]>([])
const products = ref<any[]>([])
const warehouses = ref<any[]>([])
const locations = ref<any[]>([])
const expandedLocationIds = ref<number[]>([])
const loadingWarehouses = ref(false)
const loadingLocations = ref(false)
const addSupplierModalRef = ref<any>(null)
const supplierDropdownRef = ref<any>(null)
const receivingTypeDropdownRef = ref<any>(null)
const receivingDateInput = ref(null)
const productDropdownRefs = ref<any[]>([])
const warehouseDropdownRef = ref<any>(null)
const locationDropdownRef = ref<any>(null)
let flatpickrInstance: any = null

const openDropdowns = reactive<Record<string, boolean>>({
  supplier: false,
  receivingType: false,
  warehouse: false,
  location: false,
})

// Product dropdown overlay styles per product index (reactive array)
const productMenuStyles = reactive<any[]>([])

// Receiving Type options (same as purpose options in AddNewReceiving)
const receivingTypeOptions = ['Raw Material', 'Finished Goods', 'Packaging', 'Consumables', 'Equipment', 'Returns']

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
      const data = await response.json()
      suppliers.value = data || []
    }
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    suppliers.value = []
  }
}

/* Fetch Products */
const fetchProducts = async () => {
  try {
    const response = await authenticatedFetch('/api/product')
    if (response.ok) {
      const data = await response.json()
      products.value = data || []
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    products.value = []
  }
}

/* Fetch Warehouses */
const fetchWarehouses = async () => {
  loadingWarehouses.value = true
  try {
    const response = await authenticatedFetch('/api/warehouse')
    if (response.ok) {
      const data = await response.json()
      warehouses.value = data || []
    }
  } catch (error) {
    console.error('Error fetching warehouses:', error)
    warehouses.value = []
  } finally {
    loadingWarehouses.value = false
  }
}

/* Fetch Locations by Warehouse */
const fetchLocations = async (warehouseId: number) => {
  if (!warehouseId) {
    locations.value = []
    return
  }
  
  loadingLocations.value = true
  try {
    const response = await authenticatedFetch(`/api/location?warehouseId=${warehouseId}`)
    if (response.ok) {
      const data = await response.json()
      locations.value = (data || []).map((location: any) => ({
        id: location.id,
        locationCode: location.locationCode || '-',
        locationName: location.locationName || location.name || '-',
        warehouseId: location.warehouse?.id || location.warehouseId || null,
        type: location.type || location.locationType || 'Other',
        hierarchy: location.hierarchy || 'Level 0',
        parentLocationId: location.parentLocationId || null,
        child1LocationId: location.child1LocationId || null,
      }))
    }
  } catch (error) {
    console.error('Error fetching locations:', error)
    locations.value = []
  } finally {
    loadingLocations.value = false
  }
}

/* Dropdown handlers */
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

const selectSupplier = (id: number) => {
  formData.supplierId = id
  openDropdowns.supplier = false
}

const selectReceivingType = (type: string) => {
  formData.receivingType = type
  openDropdowns.receivingType = false
}

const selectWarehouse = async (id: number) => {
  formData.warehouseId = id
  formData.locationId = null // Reset location when warehouse changes
  openDropdowns.warehouse = false
  
  // Fetch locations for the selected warehouse
  await fetchLocations(id)
}

const selectLocation = (id: number) => {
  // Check if this location has children
  const location = locations.value.find(l => l.id === id)
  if (location) {
    const hasChildren = locations.value.some(loc => 
      (loc.hierarchy === 'Level 1' && loc.parentLocationId === id) ||
      (loc.hierarchy === 'Level 2' && loc.child1LocationId === id)
    )
    
    if (hasChildren) {
      // Toggle expansion
      const index = expandedLocationIds.value.indexOf(id)
      if (index > -1) {
        expandedLocationIds.value.splice(index, 1)
      } else {
        expandedLocationIds.value.push(id)
      }
      return // Don't select, just toggle expansion
    }
  }
  
  // If no children, select the location
  formData.locationId = id
  openDropdowns.location = false
}

const selectProduct = (index: number, productId: number) => {
  // prevent selecting the same product in more than one row
  const takenIndex = formData.products.findIndex((p, i) => i !== index && p.productId === productId)
  if (takenIndex !== -1) {
    console.warn(`Product ${productId} is already selected in row ${takenIndex}`)
    openDropdowns[`product${index}`] = false
    return
  }

  formData.products[index].productId = productId
  openDropdowns[`product${index}`] = false
}

/* Product management */
const addProduct = () => {
  formData.products.push({ productId: null, quantity: 1 })
  // keep style slot for new product dropdown
  productMenuStyles.push({})
}

const removeProduct = (index: number) => {
  formData.products.splice(index, 1)
  // remove the style slot for removed product
  productMenuStyles.splice(index, 1)
  // close product dropdowns to avoid index shift issues
  Object.keys(openDropdowns).forEach(k => { if (k.startsWith('product')) openDropdowns[k] = false })
}

const increaseQuantity = (index: number) => {
  formData.products[index].quantity++
}

const decreaseQuantity = (index: number) => {
  if (formData.products[index].quantity > 1) {
    formData.products[index].quantity--
  }
}

const validateQuantity = (index: number) => {
  if (formData.products[index].quantity < 1) {
    formData.products[index].quantity = 1
  }
}

const getSupplierName = (id: number | null) => {
  if (!id) return ''
  const supplier = suppliers.value.find(s => s.id === id)
  return supplier ? supplier.supplierName : ''
}

const getProductName = (id: number | null) => {
  if (!id) return ''
  const product = products.value.find(p => p.id === id)
  return product ? product.name : ''
}

const getWarehouseName = (id: number | null) => {
  if (!id) return ''
  const warehouse = warehouses.value.find(w => w.id === id)
  return warehouse ? `${warehouse.warehouseCode} - ${warehouse.name}` : ''
}

const getLocationName = (id: number | null) => {
  if (!id) return ''
  const location = locations.value.find(l => l.id === id)
  return location ? `${location.locationCode} - ${location.locationName}` : ''
}

// Build hierarchical structure for locations
const buildLocationHierarchy = (locs: any[], parentId: number | null = null, depth = 0): any[] => {
  const result: any[] = []
  const children = locs.filter(loc => {
    if (depth === 0) {
      // Level 0: Top level locations with no parent
      return loc.hierarchy === 'Level 0' && loc.parentLocationId === null
    } else if (depth === 1) {
      // Level 1: Locations where parentLocationId matches the Level 0 parent
      return loc.hierarchy === 'Level 1' && loc.parentLocationId === parentId
    } else if (depth === 2) {
      // Level 2: Locations where child1LocationId matches the Level 1 parent
      return loc.hierarchy === 'Level 2' && loc.child1LocationId === parentId
    }
    return false
  })

  children.forEach(location => {
    // Check if this location has children
    let hasChildren = false
    if (location.hierarchy === 'Level 0') {
      // Level 0 has children if any Level 1 locations have it as parent
      hasChildren = locs.some(loc =>
        loc.hierarchy === 'Level 1' && loc.parentLocationId === location.id
      )
    } else if (location.hierarchy === 'Level 1') {
      // Level 1 has children if any Level 2 locations have it as child1Location
      hasChildren = locs.some(loc =>
        loc.hierarchy === 'Level 2' && loc.child1LocationId === location.id
      )
    }
    
    result.push({
      ...location,
      depth,
      hasChildren,
      isExpanded: expandedLocationIds.value.includes(location.id)
    })

    if (expandedLocationIds.value.includes(location.id)) {
      const childLocs = buildLocationHierarchy(locs, location.id, depth + 1)
      result.push(...childLocs)
    }
  })

  return result
}

const hierarchicalLocations = computed(() => {
  return buildLocationHierarchy(locations.value)
})

// Return products that are not selected in other rows (available for this index)
const availableProducts = (index: number) => {
  const takenIds = formData.products
    .map((p, i) => i !== index ? p.productId : null)
    .filter(Boolean)

  return products.value.filter(p => !takenIds.includes(p.id))
}

/* Handle clicks outside dropdown */
const handleClickOutside = (event: any) => {
  const refs = [
    supplierDropdownRef.value,
    receivingTypeDropdownRef.value,
    warehouseDropdownRef.value,
    locationDropdownRef.value,
    ...productDropdownRefs.value
  ]

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

/* Open Add Supplier Modal */
const openAddSupplierModal = () => {
  if (addSupplierModalRef.value && addSupplierModalRef.value.openModal) {
    addSupplierModalRef.value.openModal()
  }
}

/* Handle Supplier Created */
const handleSupplierCreated = async (result: any) => {
  if (result.success) {
    // Refresh supplier list
    await fetchSuppliers()
    
    // Auto-select the newly created supplier
    if (result.data && result.data.id) {
      formData.supplierId = result.data.id
    }
  }
}

const openModal = async () => {
  // Fetch suppliers, products, and warehouses when modal opens
  await Promise.all([
    fetchSuppliers(),
    fetchProducts(),
    fetchWarehouses()
  ])
  
  // Reset form
  resetForm()
  
  isOpen.value = true
  currentStep.value = 1
  lockScroll()
}

const closeModal = async () => {
  if (isSubmitting.value) return
  
  // Close all dropdowns
  Object.keys(openDropdowns).forEach(key => openDropdowns[key] = false)
  
  // Destroy Flatpickr instance
  if (flatpickrInstance) {
    flatpickrInstance.destroy()
    flatpickrInstance = null
  }
  
  isOpen.value = false
  
  await nextTick()
  
  emit('close')
}

const resetForm = () => {
  formData.supplierId = null
  formData.receivingCode = ''
  formData.doNumber = ''
  formData.receivingType = ''
  formData.receivedBy = ''
  formData.receivingDate = new Date().toISOString().split('T')[0]
  formData.remarks = ''
  formData.products = [{ productId: null, quantity: 1 }]
  formData.skipLocationAssignment = false
  formData.warehouseId = null
  formData.locationId = null
  
  // Reset product menu styles
  productMenuStyles.length = 0
  formData.products.forEach(() => productMenuStyles.push({}))
  
  // Reset locations
  locations.value = []
  expandedLocationIds.value = []
  
  Object.keys(errors).forEach((key) => delete errors[key])
}

const validateStep = (step: number): boolean => {
  Object.keys(errors).forEach((key) => delete errors[key])

  if (step === 1) {
    if (!formData.supplierId) errors.supplierId = 'Supplier is required'
  } else if (step === 2) {
    if (!formData.receivingCode) errors.receivingCode = 'Receiving code is required'
    if (!formData.receivingType) errors.receivingType = 'Receiving type is required'
    if (!formData.receivedBy) errors.receivedBy = 'Received by is required'
    if (!formData.receivingDate) errors.receivingDate = 'Receiving date is required'
  } else if (step === 3) {
    // Validate products
    formData.products.forEach((product, index) => {
      if (!product.productId) {
        errors[`product${index}`] = 'Product is required'
      }
      if (!product.quantity || product.quantity < 1) {
        errors[`quantity${index}`] = 'Quantity must be at least 1'
      }
    })
  } else if (step === 4) {
    // Only validate warehouse if location assignment is not skipped
    if (!formData.skipLocationAssignment) {
      if (!formData.warehouseId) errors.warehouseId = 'Warehouse is required'
    }
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
        if (receivingDateInput.value && !flatpickrInstance) {
          flatpickrInstance = flatpickr(receivingDateInput.value, {
            dateFormat: 'Y-m-d',
            defaultDate: new Date(),
            onChange: (selectedDates: Date[], dateStr: string) => {
              formData.receivingDate = dateStr
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

const submitForm = async () => {
  if (!validateStep(currentStep.value)) return

  isSubmitting.value = true

  // Placeholder: Call your API here
  // Example: await api.post('/api/receiving/add-flow', formData)

  setTimeout(() => {
    isSubmitting.value = false
    emit('flow-created', {
      success: true,
      message: 'Receiving created successfully',
      data: { ...formData },
    })
    closeModal()
  }, 1000)
}

defineExpose({
  openModal,
  closeModal,
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', repositionOpenProductMenus)
  window.addEventListener('scroll', repositionOpenProductMenus, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', repositionOpenProductMenus)
  window.removeEventListener('scroll', repositionOpenProductMenus, true)
  
  // Clean up Flatpickr
  if (flatpickrInstance) {
    flatpickrInstance.destroy()
    flatpickrInstance = null
  }
})
</script>
