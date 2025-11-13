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
        <!-- overlay -->
        <div class="absolute inset-0 bg-black/50"></div>

        <!-- modal panel -->
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
            class="relative z-10 w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col"
            @click.stop
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col min-h-0 max-h-[90vh]">
              <!-- header -->
              <div class="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 id="modal-title" class="text-lg font-semibold text-gray-900 dark:text-white">
                  Edit Receiving
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

              <!-- body -->
              <div class="space-y-4 overflow-y-auto p-6 flex-1">
                <!-- Submit Error -->
                <div v-if="errors.submit" class="alert alert-error">
                  <span>{{ errors.submit }}</span>
                </div>

                <!-- Row 1: Receiving Code & PO Number (Both Disabled) -->
                <div class="grid grid-cols-2 gap-4">
                  <!-- Receiving Code (Disabled) -->
                  <div class="relative">
                    <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                      <span class="text-red-500">*</span> Receiving Code
                    </label>
                    <input
                      v-model="form.receivingCode"
                      type="text"
                      placeholder="Enter Receiving Code"
                      maxlength="50"
                      class="input input-bordered w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white cursor-not-allowed"
                      disabled
                      readonly
                    />
                  </div>

                  <!-- PO Number (Disabled) -->
                  <div class="relative">
                    <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                      PO Number
                    </label>
                    <input
                      v-model="form.poNumber"
                      type="text"
                      placeholder="PO Number"
                      maxlength="50"
                      class="input input-bordered w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white cursor-not-allowed"
                      disabled
                      readonly
                    />
                  </div>
                </div>

                <!-- Row 2: DO Number & Supplier (DO editable, Supplier disabled) -->
                <div class="grid grid-cols-2 gap-4">
                  <!-- DO Number (Editable) -->
                  <div class="relative">
                    <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                      DO Number
                    </label>
                    <input
                      v-model="form.doNumber"
                      type="text"
                      placeholder="Enter DO Number"
                      maxlength="50"
                      :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.doNumber }]"
                      :readonly="isViewMode"
                      :disabled="isViewMode"
                    />
                  </div>

                  <!-- Supplier (Disabled) -->
                  <div class="relative">
                    <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                      <span class="text-red-500">*</span> Supplier
                    </label>
                    <input
                      :value="getSupplierName(form.supplierId)"
                      type="text"
                      placeholder="Supplier"
                      class="input input-bordered w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white cursor-not-allowed"
                      disabled
                      readonly
                    />
                  </div>
                </div>

                <!-- Row 3: Warehouse & Location (Both Editable with fixed positioning) -->
                <div class="grid grid-cols-2 gap-4">
                  <!-- Warehouse -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Warehouse
                    </label>
                    <div class="relative" ref="warehouseDropdownRef">
                      <button
                        type="button"
                        @click="!isViewMode && toggleDropdown('warehouse')"
                        class="input input-bordered w-full text-left flex items-center justify-between"
                        :disabled="isViewMode || loadingWarehouses"
                      >
                        <span>{{ getWarehouseName(form.warehouseId) || 'Select Warehouse' }}</span>
                        <span class="icon-[tabler--chevron-down] size-4"></span>
                      </button>
                      <ul
                        v-if="openDropdowns.warehouse"
                        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-y-auto"
                        :style="openDropdowns.warehouse ? warehouseMenuStyle : { display: 'none' }"
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
                  </div>

                  <!-- Location Hierarchy -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Location (Optional)
                    </label>
                    <div class="relative" ref="locationDropdownRef">
                      <button
                        type="button"
                        @click="!isViewMode && toggleDropdown('location')"
                        class="input input-bordered w-full text-left flex items-center justify-between"
                        :disabled="isViewMode || !form.warehouseId || loadingLocations"
                      >
                        <span>{{ getLocationName(form.locationId) || 'Select Location' }}</span>
                        <span class="icon-[tabler--chevron-down] size-4"></span>
                      </button>
                      <ul
                        v-if="openDropdowns.location"
                        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-y-auto"
                        :style="openDropdowns.location ? locationMenuStyle : { display: 'none' }"
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
                          {{ form.warehouseId ? 'No locations found' : 'Please select a warehouse first' }}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <!-- Row 4: Receiving Purpose & Received By (Both Editable) -->
                <div class="grid grid-cols-2 gap-4">
                  <!-- Receiving Purpose (Editable) -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <span class="text-red-500">*</span> Receiving Purpose
                    </label>
                    <div class="relative" ref="purposeDropdownRef">
                      <button
                        type="button"
                        @click="!isViewMode && toggleDropdown('receivingPurpose')"
                        class="input input-bordered w-full text-left flex items-center justify-between"
                        :class="{ 'input-error': errors.receivingPurpose }"
                        :disabled="isViewMode"
                      >
                        <span>{{ formatPurposeDisplay(form.receivingPurpose) || 'Select Receiving Purpose' }}</span>
                        <span class="icon-[tabler--chevron-down] size-4"></span>
                      </button>
                      <ul
                        v-if="openDropdowns.receivingPurpose"
                        class="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                      >
                        <li
                          v-for="option in receivingPurposeOptions"
                          :key="option.value"
                          @click="selectPurpose(option.value)"
                          class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                        >
                          {{ option.label }}
                        </li>
                      </ul>
                    </div>
                  </div>

                  <!-- Received By (Editable) -->
                  <div class="relative">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <span class="text-red-500">*</span> Received By
                    </label>
                    <input
                      v-model="form.receivedBy"
                      type="text"
                      placeholder="Enter Receiver Name"
                      maxlength="100"
                      :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.receivedBy }]"
                      :readonly="isViewMode"
                      :disabled="isViewMode"
                    />
                  </div>
                </div>

                <!-- Row 5: Receiving Date & Remarks (Both Editable) -->
                <div class="grid grid-cols-2 gap-4">
                  <!-- Receiving Date (Editable) -->
                  <div class="relative">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Receiving Date
                    </label>
                    <input
                      ref="receivingDateInput"
                      v-model="form.receivingDate"
                      type="text"
                      placeholder="Select Date"
                      :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.receivingDate }]"
                      readonly
                      :disabled="isViewMode"
                    />
                  </div>

                  <!-- Remarks (Editable) -->
                  <div class="relative">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Remarks
                    </label>
                    <input
                      v-model="form.remarks"
                      type="text"
                      placeholder="Enter Remarks"
                      maxlength="500"
                      :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.remarks }]"
                      :readonly="isViewMode"
                      :disabled="isViewMode"
                    />
                  </div>
                </div>

                <!-- Product Table (Products are disabled, only quantity is editable) -->
                <div class="mt-6">
                  <h4 class="text-md font-semibold text-gray-900 dark:text-white mb-3">Product Information</h4>

                <!-- Product Rows (Product names disabled, only quantity editable) -->
                <div class="space-y-3 max-h-60 overflow-y-auto" style="padding-right: 8px;">
                  <div v-for="(product, index) in form.products" :key="index" class="grid grid-cols-12 gap-4 items-start">
                    <!-- Product Name (Disabled) -->
                    <div class="col-span-7 relative">
                      <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                        <span class="text-red-500">*</span> Product {{ index + 1 }}
                      </label>
                      <input
                        :value="getProductName(product.productId)"
                        type="text"
                        placeholder="Product"
                        class="input input-bordered w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white cursor-not-allowed"
                        disabled
                        readonly
                      />
                    </div>

                    <!-- Product Quantity (Editable) -->
                    <div class="col-span-4 relative">
                      <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                        <span class="text-red-500">*</span> Actual Quantity
                      </label>
                      <div class="flex items-center gap-2">
                        <button
                          type="button"
                          @click="!isViewMode && decreaseQuantity(index)"
                          class="btn btn-outline btn-sm w-10 h-10 p-0 flex items-center justify-center"
                          :disabled="isViewMode"
                        >
                          −
                        </button>
                        <input
                          v-model.number="product.quantity"
                          type="number"
                          min="1"
                          :class="['input input-bordered text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors[`quantity${index}`] }]"
                          style="width: 5rem"
                          @input="!isViewMode && validateQuantity(index)"
                          :readonly="isViewMode"
                          :disabled="isViewMode"
                        />
                        <button
                          type="button"
                          @click="!isViewMode && increaseQuantity(index)"
                          class="btn btn-primary btn-sm w-10 h-10 p-0 flex items-center justify-center"
                          :disabled="isViewMode"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <!-- Spacer for alignment -->
                    <div class="col-span-1"></div>
                  </div>
                </div>
              </div>
              </div>

              <!-- footer -->
              <div class="flex justify-end gap-2 p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button @click="closeModal" class="btn btn-outline btn-error" :disabled="isSubmitting">
                  {{ isViewMode ? 'Close' : 'Cancel' }}
                </button>
                <button v-if="!isViewMode" @click="submitForm" class="btn btn-primary" :disabled="isSubmitting">
                  <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
                  {{ isSubmitting ? 'Saving...' : 'Save' }}
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.css'
import { authenticatedFetch } from '@/utils/authenticatedFetch'



const emit = defineEmits(['receiving-created', 'receiving-updated'])

// track edit mode and current receiving id
const isEditMode = ref(false)
const isViewMode = ref(false)
const currentReceivingId = ref(null)

/* state */
const isOpen = ref(false)
const isSubmitting = ref(false)
const panelRef = ref(null)
const warehouseDropdownRef = ref(null)
const locationDropdownRef = ref(null)
const rackDropdownRef = ref(null)
const sectionDropdownRef = ref(null)
const supplierDropdownRef = ref(null)
const purposeDropdownRef = ref(null)
const productDropdownRefs = ref([])
const unitDropdownRefs = ref([])
const receivingDateInput = ref(null)
let flatpickrInstance = null

// API Data
const warehouses = ref([])
const locations = ref([])
const expandedLocationIds = ref([])
const racks = ref([])
const sections = ref([])
const suppliers = ref([])
const products = ref([])
const loadingWarehouses = ref(false)
const loadingLocations = ref(false)

const form = reactive({
  receivingCode: '',
  poNumber: '',
  doNumber: '',
  warehouseId: null,
  locationId: null,
  rackId: null,
  sectionId: null,
  supplierId: null,
  source: '',
  receivingPurpose: '',
  receivedBy: '',
  receivingDate: new Date().toISOString().split('T')[0],
  remarks: '',
  products: [
    { productId: null, quantity: 1, unit: 'pcs' }
  ]
})

const errors = reactive({
  receivingCode: '',
  doNumber: '',
  warehouseId: '',
  rackId: '',
  sectionId: '',
  supplierId: '',
  source: '',
  receivingPurpose: '',
  receivedBy: '',
  receivingDate: '',
  remarks: '',
  submit: ''
})

const receivingPurposeOptions = [
  { label: 'Raw Material', value: 'RAW_MATERIAL' },
  { label: 'Finished Goods', value: 'FINISHED_GOODS' }
]
const openDropdowns = reactive({})

// Dropdown overlay styles
const productMenuStyles = reactive([])
const unitMenuStyles = reactive([])
const warehouseMenuStyle = ref({})
const locationMenuStyle = ref({})

// Units dropdown options for product unit
const unitsOptions = ['pcs',]

/* Modal scroll lock utilities */
let scrollY = 0
let scrollbarWidth = 0

const getScrollbarWidth = () => {
  return window.innerWidth - document.documentElement.clientWidth
}

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

  requestAnimationFrame(() => {
    window.scrollTo(0, scrollY)
  })
}

/* Fetch API Data */
const fetchWarehouses = async () => {
  loadingWarehouses.value = true
  try {
    const response = await authenticatedFetch('/api/warehouse')
    if (response.ok) {
      warehouses.value = await response.json()
    }
  } catch (error) {
    console.error('Error fetching warehouses:', error)
  } finally {
    loadingWarehouses.value = false
  }
}

const fetchLocations = async (warehouseId) => {
  if (!warehouseId) {
    locations.value = []
    return
  }

  loadingLocations.value = true
  try {
    const response = await authenticatedFetch(`/api/location?warehouseId=${warehouseId}`)
    if (response.ok) {
      const data = await response.json()
      locations.value = (data || []).map((location) => ({
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

const fetchRacks = async (warehouseId) => {
  if (!warehouseId) {
    racks.value = []
    return
  }
  try {
    const response = await authenticatedFetch(`/api/rack?warehouseId=${warehouseId}`)
    if (response.ok) {
      racks.value = await response.json()
      console.log(racks.value)
    }
  } catch (error) {
    console.error('Error fetching racks:', error)
  }
}

const fetchSections = async (rackId) => {
  if (!rackId) {
    sections.value = []
    return
  }
  try {
    const response = await authenticatedFetch(`/api/section?rackId=${rackId}`)
    if (response.ok) {
      sections.value = await response.json()
      console.log(sections.value)
    }
  } catch (error) {
    console.error('Error fetching sections:', error)
  }
}

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

/* Helper functions to get names */
const getWarehouseName = (id) => {
  const warehouse = warehouses.value.find(w => w.id === id)
  return warehouse ? warehouse.name : ''
}

const getRackName = (id) => {
  const rack = racks.value.find(r => r.id === id)
  if (!rack) return ''
  // API returns rackCode in the list, but older code expects name
  return rack.rackCode || rack.name || ''
}

const getSectionName = (id) => {
  const section = sections.value.find(s => s.id === id)
  if (!section) return ''
  // API returns sectionCode in the list, but older code expects name
  return section.sectionCode || section.name || ''
}

const getSupplierName = (id) => {
  const supplier = suppliers.value.find(s => s.id === id)
  return supplier ? supplier.supplierName : ''
}

const getProductName = (id) => {
  const product = products.value.find(p => p.id === id)
  return product ? product.name : ''
}

const getLocationName = (id) => {
  if (!id) return ''
  const location = locations.value.find(l => l.id === id)
  return location ? `${location.locationCode} - ${location.locationName}` : ''
}

const formatPurposeDisplay = (value) => {
  const option = receivingPurposeOptions.find(opt => opt.value === value)
  return option ? option.label : value
}

const buildLocationHierarchy = (locs, parentId = null, depth = 0) => {
  const result = []
  const children = locs.filter(loc => {
    if (depth === 0) {
      return loc.hierarchy === 'Level 0' && loc.parentLocationId === null
    } else if (depth === 1) {
      return loc.hierarchy === 'Level 1' && loc.parentLocationId === parentId
    } else if (depth === 2) {
      return loc.hierarchy === 'Level 2' && loc.child1LocationId === parentId
    }
    return false
  })

  children.forEach(location => {
    let hasChildren = false
    if (location.hierarchy === 'Level 0') {
      hasChildren = locs.some(loc =>
        loc.hierarchy === 'Level 1' && loc.parentLocationId === location.id
      )
    } else if (location.hierarchy === 'Level 1') {
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

/* Dropdown handlers */
const toggleDropdown = async (name) => {
  // Close other dropdowns
  Object.keys(openDropdowns).forEach(k => { if (k !== name) openDropdowns[k] = false })
  openDropdowns[name] = !openDropdowns[name]

  // If opening a product dropdown, compute its fixed-position style so it overlays instead of pushing modal height
  if (openDropdowns[name] && name.startsWith('product')) {
    const idx = parseInt(name.replace('product', ''), 10)
    await nextTick()
    positionProductMenu(idx)
  }
  
  // Position warehouse dropdown
  if (openDropdowns[name] && name === 'warehouse') {
    await positionWarehouseMenu()
  }
  
  // Position location dropdown
  if (openDropdowns[name] && name === 'location') {
    await positionLocationMenu()
  }
}

const positionProductMenu = (index) => {
  const container = productDropdownRefs.value[index]
  if (!container) return

  // find the button inside the container
  const btn = container.querySelector('button')
  if (!btn) return

  const rect = btn.getBoundingClientRect()

  // try to compute panel width so dropdown can expand to full modal content width
  const panelRect = panelRef.value ? panelRef.value.getBoundingClientRect() : null

  const maxMenuHeight = 300
  const gap = 8
  const belowSpace = window.innerHeight - rect.bottom - gap
  const aboveSpace = rect.top - gap

  const style = {
    position: 'fixed',
    // default to align with button
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: '9999',
    overflowY: 'auto',
    overflowX: 'hidden',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    boxSizing: 'border-box'
  }

  // Align overlay exactly with the button width to match other dropdowns visually
  // Use the button rect for left and width so the overlay matches the triggering button
  style.left = `${rect.left}px`
  style.width = `${rect.width}px`

  if (belowSpace >= 150) {
    style.top = `${rect.bottom}px`
    style.maxHeight = `${Math.min(maxMenuHeight, belowSpace)}px`
  } else {
    // show above if not enough space below
    const usedHeight = Math.min(maxMenuHeight, aboveSpace)
    style.top = `${rect.top - usedHeight}px`
    style.maxHeight = `${usedHeight}px`
  }

  // ensure reactive array has slot
  productMenuStyles[index] = style
}

const repositionOpenProductMenus = () => {
  Object.keys(openDropdowns).forEach(key => {
    if (key.startsWith('product') && openDropdowns[key]) {
      const idx = parseInt(key.replace('product', ''), 10)
      positionProductMenu(idx)
    }
    if (key.startsWith('unit') && openDropdowns[key]) {
      const idx = parseInt(key.replace('unit', ''), 10)
      positionUnitMenu(idx)
    }
    if (key === 'warehouse' && openDropdowns[key]) {
      positionWarehouseMenu()
    }
    if (key === 'location' && openDropdowns[key]) {
      positionLocationMenu()
    }
  })
}

const positionWarehouseMenu = async () => {
  await nextTick()
  if (!warehouseDropdownRef.value) return

  const btn = warehouseDropdownRef.value.querySelector('button')
  if (!btn) return

  const rect = btn.getBoundingClientRect()
  const maxMenuHeight = 300
  const gap = 8
  const belowSpace = window.innerHeight - rect.bottom - gap
  const aboveSpace = rect.top - gap

  const style = {
    position: 'fixed',
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: '9999',
    overflowY: 'auto',
    overflowX: 'hidden',
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

  warehouseMenuStyle.value = style
}

const positionLocationMenu = async () => {
  await nextTick()
  if (!locationDropdownRef.value) return

  const btn = locationDropdownRef.value.querySelector('button')
  if (!btn) return

  const rect = btn.getBoundingClientRect()
  const maxMenuHeight = 300
  const gap = 8
  const belowSpace = window.innerHeight - rect.bottom - gap
  const aboveSpace = rect.top - gap

  const style = {
    position: 'fixed',
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: '9999',
    overflowY: 'auto',
    overflowX: 'hidden',
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

  locationMenuStyle.value = style
}

const positionUnitMenu = (index) => {
  const container = unitDropdownRefs.value[index]
  if (!container) return

  const btn = container.querySelector('button')
  if (!btn) return

  const rect = btn.getBoundingClientRect()

  // try to compute panel width so dropdown can expand to full modal content width
  const panelRect = panelRef.value ? panelRef.value.getBoundingClientRect() : null

  const maxMenuHeight = 200
  const gap = 6
  const belowSpace = window.innerHeight - rect.bottom - gap
  const aboveSpace = rect.top - gap

  const style = {
    position: 'fixed',
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: '9999',
    boxSizing: 'border-box',
    overflowX: 'hidden',
    whiteSpace: 'normal',
    wordBreak: 'break-word'
  }

  // Align unit overlay with the button width so it matches the unit button
  style.left = `${rect.left}px`
  style.width = `${rect.width}px`

  if (belowSpace >= 120) {
    style.top = `${rect.bottom}px`
    style.maxHeight = `${Math.min(maxMenuHeight, belowSpace)}px`
  } else {
    const used = Math.min(maxMenuHeight, aboveSpace)
    style.top = `${rect.top - used}px`
    style.maxHeight = `${used}px`
  }

  unitMenuStyles[index] = style
}

const toggleUnitDropdown = async (index) => {
  // close other dropdowns
  Object.keys(openDropdowns).forEach(k => { if (!k.startsWith(`unit`) || k === `unit${index}`) return; openDropdowns[k] = false })
  const key = `unit${index}`
  openDropdowns[key] = !openDropdowns[key]
  if (openDropdowns[key]) {
    await nextTick()
    positionUnitMenu(index)
  }
}

const selectUnit = (index, unit) => {
  form.products[index].unit = unit
  openDropdowns[`unit${index}`] = false
}

const selectWarehouse = async (id) => {
  form.warehouseId = id
  form.locationId = null
  openDropdowns.warehouse = false
  await fetchLocations(id)
}

const selectLocation = (id) => {
  const location = locations.value.find(l => l.id === id)
  if (location) {
    const hasChildren = locations.value.some(loc =>
      (loc.hierarchy === 'Level 1' && loc.parentLocationId === id) ||
      (loc.hierarchy === 'Level 2' && loc.child1LocationId === id)
    )

    if (hasChildren) {
      const index = expandedLocationIds.value.indexOf(id)
      if (index > -1) {
        expandedLocationIds.value.splice(index, 1)
      } else {
        expandedLocationIds.value.push(id)
      }
      return
    }
  }

  form.locationId = id
  openDropdowns.location = false
}

const selectRack = async (id) => {
  form.rackId = id
  form.sectionId = null
  openDropdowns.rack = false
  await fetchSections(id)
}

const selectSection = (id) => {
  form.sectionId = id
  openDropdowns.section = false
}

const selectSupplier = (id) => {
  form.supplierId = id
  openDropdowns.supplier = false
}

const selectPurpose = (receivingPurpose) => {
  form.receivingPurpose = receivingPurpose
  openDropdowns.receivingPurpose = false
}

const selectProduct = (index, productId) => {
  form.products[index].productId = productId
  openDropdowns[`product${index}`] = false
}

// Return products that are not selected in other rows (available for this index)
const availableProducts = (index) => {
  const takenIds = form.products
    .map((p, i) => i !== index ? p.productId : null)
    .filter(Boolean)

  return products.value.filter(p => !takenIds.includes(p.id))
}

/* Product management */
const addProduct = () => {
  form.products.push({ productId: null, quantity: 1, unit: 'pcs' })
  // keep style slot for new product dropdown
  productMenuStyles.push({})
  unitMenuStyles.push({})
}

const removeProduct = (index) => {
  form.products.splice(index, 1)
  // remove the style slot for removed product
  productMenuStyles.splice(index, 1)
  unitMenuStyles.splice(index, 1)
  // close product dropdowns to avoid index shift issues
  Object.keys(openDropdowns).forEach(k => { if (k.startsWith('product') || k.startsWith('unit')) openDropdowns[k] = false })
}

const increaseQuantity = (index) => {
  form.products[index].quantity++
}

const decreaseQuantity = (index) => {
  if (form.products[index].quantity > 1) {
    form.products[index].quantity--
  }
}

const validateQuantity = (index) => {
  if (form.products[index].quantity < 1) {
    form.products[index].quantity = 1
  }
}

/* Validation */
const validateForm = () => {
  // Reset errors
  Object.keys(errors).forEach(key => errors[key] = '')

  let isValid = true

  // Receiving Code validation (disabled in edit, but still validate)
  if (!form.receivingCode.trim()) {
    errors.receivingCode = 'Receiving Code is required'
    isValid = false
  }

  // Supplier validation (disabled in edit, but still validate)
  if (!form.supplierId) {
    errors.supplierId = 'Supplier is required'
    isValid = false
  }

  // Purpose validation
  if (!form.receivingPurpose) {
    errors.receivingPurpose = 'Receiving Purpose is required'
    isValid = false
  }

  // Received By validation
  if (!form.receivedBy.trim()) {
    errors.receivedBy = 'Received By is required'
    isValid = false
  }

  // Product validation
  form.products.forEach((product, index) => {
    if (!product.productId) {
      errors[`product${index}`] = 'Product is required'
      isValid = false
    }
    if (!product.quantity || product.quantity < 1) {
      errors[`quantity${index}`] = 'Quantity must be at least 1'
      isValid = false
    }
  })

  return isValid
}

// Clear error when user types
watch(() => form.receivingCode, () => { if (errors.receivingCode) errors.receivingCode = '' })
watch(() => form.supplierId, () => { if (errors.supplierId) errors.supplierId = '' })
watch(() => form.receivingPurpose, () => { if (errors.receivingPurpose) errors.receivingPurpose = '' })
watch(() => form.receivedBy, () => { if (errors.receivedBy) errors.receivedBy = '' })

/* close dropdowns when clicking outside */
const handleClickOutside = (event) => {
  const refs = [
    warehouseDropdownRef.value,
    locationDropdownRef.value,
    rackDropdownRef.value,
    sectionDropdownRef.value,
    supplierDropdownRef.value,
    purposeDropdownRef.value,
    ...productDropdownRefs.value,
    ...unitDropdownRefs.value
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

/* open/close modal */
// openModal can accept an optional receiving object to prefill form for editing
// openModal can accept an optional receiving object to prefill form for editing
// The second optional argument `viewOnly` will open the modal in read-only view mode
const openModal = async (receiving = null, viewOnly = false) => {
  // Fetch all required data
  await Promise.all([
    fetchWarehouses(),
    fetchSuppliers(),
    fetchProducts()
  ])

  // Reset form
  form.receivingCode = ''
  form.doNumber = ''
  form.warehouseId = null
  form.rackId = null
  form.sectionId = null
  form.supplierId = null
  form.source = ''
  form.receivingPurpose = ''
  form.receivedBy = ''
  form.receivingDate = new Date().toISOString().split('T')[0]
  form.remarks = ''
  form.products = [{ productId: null, quantity: 1, unit: 'pcs' }]
  // ensure product menu styles slot matches products
  productMenuStyles.length = 0
  unitMenuStyles.length = 0
  form.products.forEach((_, i) => { productMenuStyles.push({}); unitMenuStyles.push({}) })

  // Reset errors
  Object.keys(errors).forEach(key => errors[key] = '')

  // If a receiving object is provided, populate the form for edit
  if (receiving) {
    isEditMode.value = !viewOnly
    isViewMode.value = !!viewOnly
    currentReceivingId.value = receiving.id
    currentReceivingId.value = receiving.id
    // Populate basic fields
    form.receivingCode = receiving.receivingCode || ''
    form.poNumber = receiving.order?.orderNo || ''
    form.doNumber = receiving.doNumber || ''
    form.warehouseId = receiving.warehouseId || null
    form.locationId = receiving.locationId || null
    // fetch locations for selected warehouse
    if (form.warehouseId) await fetchLocations(form.warehouseId)
    form.supplierId = receiving.supplierId || null
    form.source = receiving.source || ''
    form.receivingPurpose = receiving.receivingPurpose || ''
    form.receivedBy = receiving.receivedBy || ''
    form.receivingDate = receiving.receivingDate ? receiving.receivingDate.split('T')[0] : form.receivingDate
    form.remarks = receiving.remarks || ''
    // populate products from receiving.receivingItems if present
    if (receiving.receivingItems && Array.isArray(receiving.receivingItems) && receiving.receivingItems.length) {
      form.products = receiving.receivingItems.map(item => ({ productId: item.productId, quantity: item.quantity || 1, unit: item.unit || 'pcs' }))
    }
  } else {
    isEditMode.value = false
    isViewMode.value = false
    currentReceivingId.value = null
  }

  isOpen.value = true
  lockScroll()
  await nextTick()

  // Initialize Flatpickr and make sure it reflects form.receivingDate
  if (receivingDateInput.value) {
    // ensure the input shows the current form value immediately
    receivingDateInput.value.value = form.receivingDate || ''

    if (!flatpickrInstance) {
      flatpickrInstance = flatpickr(receivingDateInput.value, {
        dateFormat: 'Y-m-d',
        // use the form value (which may come from API) as the default date
        defaultDate: form.receivingDate || new Date(),
        onChange: (selectedDates, dateStr) => {
          form.receivingDate = dateStr
        }
      })
    } else {
      // if flatpickr already exists (rare), update its selected date
      try {
        flatpickrInstance.setDate(form.receivingDate, false, 'Y-m-d')
      } catch (e) {
        // ignore setDate errors
      }
    }
  }

  panelRef.value?.querySelector('input,select,textarea,button')?.focus()
}

const closeModal = async () => {
  Object.keys(openDropdowns).forEach(key => openDropdowns[key] = false)

  // Destroy Flatpickr instance
  if (flatpickrInstance) {
    flatpickrInstance.destroy()
    flatpickrInstance = null
  }

  isOpen.value = false

  // Reset form after modal is closed
  await nextTick()
  form.receivingCode = ''
  form.poNumber = ''
  form.doNumber = ''
  form.warehouseId = null
  form.locationId = null
  form.rackId = null
  form.sectionId = null
  form.supplierId = null
  form.source = ''
  form.receivingPurpose = ''
  form.receivedBy = ''
  form.receivingDate = new Date().toISOString().split('T')[0]
  form.remarks = ''
  form.products = [{ productId: null, quantity: 1, unit: 'pcs' }]
  productMenuStyles.length = 0
  unitMenuStyles.length = 0

  // Reset errors
  Object.keys(errors).forEach(key => errors[key] = '')

  // If view mode, make sure nothing is editable by disabling inputs via a CSS class or attribute

  // Reset edit mode state
  isEditMode.value = false
  currentReceivingId.value = null
}

/* submit */
const submitForm = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  errors.submit = ''

  try {
    // Format the data to match backend expectations
    // Backend expects each receiving item to have productId, quantity and unit (see API sample)
    const submissionData = {
      receivingCode: form.receivingCode,
      doNumber: form.doNumber || null,
      warehouseId: form.warehouseId,
      rackId: form.rackId || null,
      sectionId: form.sectionId || null,
      source: form.source || null,
      supplierId: form.supplierId,
      receivingDate: form.receivingDate,
      receivedBy: form.receivedBy,
      receivingPurpose: form.receivingPurpose || null,
      remarks: form.remarks || null,
      receivingItems: form.products.map(p => ({
        productId: p.productId,
        // use the simple `quantity` field which the table/other components expect
        quantity: p.quantity,
        // default unit to 'pcs' when user didn't provide one
        unit: p.unit || 'pcs',
      }))
    }

    console.debug('Submitting receiving:', submissionData)

    // Make the API call (POST for create, PUT for update in edit mode)
    let response
    if (isEditMode.value && currentReceivingId.value) {
      // For update: first update header, then update items
      response = await authenticatedFetch(`/api/receiving/${currentReceivingId.value}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receivingCode: submissionData.receivingCode,
          doNumber: submissionData.doNumber,
          warehouseId: submissionData.warehouseId,
          rackId: submissionData.rackId,
          sectionId: submissionData.sectionId,
          source: submissionData.source,
          supplierId: submissionData.supplierId,
          receivingDate: submissionData.receivingDate,
          receivedBy: submissionData.receivedBy,
          receivingPurpose: submissionData.receivingPurpose, // include purpose so backend persists changes
          remarks: submissionData.remarks
        })
      })

      // Then update items separately
      if (response.ok) {
        response = await authenticatedFetch(`/api/receiving/${currentReceivingId.value}/items`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ receivingItems: submissionData.receivingItems })
        })
      }
    } else {
      response = await authenticatedFetch('/api/receiving', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      })
    }

    if (!response.ok) {
      let errorMessage = isEditMode.value ? 'Failed to update receiving record' : 'Failed to create receiving record'
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || JSON.stringify(errorData)
      } catch {
        try {
          const text = await response.text()
          if (text) errorMessage = text
        } catch {}
      }
      console.error(errorMessage)
      throw new Error(errorMessage)
    }

    // Try to parse JSON body if present, otherwise fallback to empty object
    let data = {}
    try {
      // Some APIs return 204 No Content; guard against parsing errors
      if (response.status !== 204) {
        data = await response.json()
      }
    } catch (e) {
      console.warn('Response had no JSON body or failed to parse:', e)
      data = {}
    }

    console.log('Server response:', data)

    // Capture current mode before closing (closeModal resets isEditMode)
    const wasEditMode = isEditMode.value
    // Close modal and emit success
    await closeModal()
    if (wasEditMode) {
      emit('receiving-updated', { success: true, data })
    } else {
      emit('receiving-created', { success: true, data })
    }

  } catch (error) {
    console.error('Error creating receiving:', error)
    errors.submit = error.message || (isEditMode.value ? 'Failed to update receiving record. Please try again.' : 'Failed to create receiving record. Please try again.')
    // Emit failure event according to mode so parent can show toast or refresh accordingly
    if (isEditMode.value) {
      emit('receiving-updated', { success: false, error: error.message || 'Failed to update receiving record' })
    } else {
      emit('receiving-created', { success: false, error: error.message || 'Failed to create receiving record' })
    }
  } finally {
    isSubmitting.value = false
  }
}

/* lifecycle */
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', repositionOpenProductMenus)
  window.addEventListener('scroll', repositionOpenProductMenus, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)

  // Clean up Flatpickr
  if (flatpickrInstance) {
    flatpickrInstance.destroy()
    flatpickrInstance = null
  }

  if (isOpen.value) {
    unlockScroll()
  }
  window.removeEventListener('resize', repositionOpenProductMenus)
  window.removeEventListener('scroll', repositionOpenProductMenus, true)
})

/* expose to parent */
defineExpose({ openModal, closeModal })
</script>

<style scoped>
[role="dialog"] > .bg-white {
  transform-origin: center;
}
</style>
