<template>
  <!-- Rack Info Modal Component -->
  <RackInfoModal ref="rackInfoModalRef" />
  
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
            class="relative z-10 w-full max-w-xl mx-4 max-h-[90vh] flex flex-col"
            @click.stop
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col min-h-0 max-h-[90vh]">
              <div class="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 id="modal-title" class="text-lg font-semibold text-gray-900 dark:text-white">
                  Add New Section
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

                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    <span class="text-red-500">*</span> Warehouse Code
                  </label>
                  <div class="dropdown relative inline-flex w-full" ref="warehouseDropdownRef">
                    <button
                      type="button"
                      :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400', { 'btn-error': errors.warehouseId }]"
                      :aria-expanded="openDropdowns.warehouse"
                      @click.stop="toggleDropdown('warehouse')"
                    >
                      {{ selectedWarehouseName || 'Select Warehouse' }}
                      <span
                        class="icon-[tabler--chevron-down] size-4 transition-transform"
                        :class="{ 'rotate-180': openDropdowns.warehouse }"
                      ></span>
                    </button>

                    <ul
                      class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white max-h-60 overflow-y-auto"
                      :class="{ 'opacity-100 pointer-events-auto': openDropdowns.warehouse, 'opacity-0 pointer-events-none': !openDropdowns.warehouse }"
                      role="menu"
                    >
                      <li v-for="warehouse in warehouses" :key="warehouse.id">
                        <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectWarehouse(warehouse)">
                          {{ warehouse.warehouseCode }}
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
                    <div v-if="errors.warehouseId" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.warehouseId }}</p>
                    </div>
                  </transition>
                </div>

                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span><span class="text-red-500">*</span> Rack Code</span>
                    <button
                      type="button"
                      @click="showRackInfo"
                      class="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                      aria-label="Show rack information"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                    </button>
                  </label>
                  <div class="dropdown relative inline-flex w-full" ref="rackDropdownRef">
                    <button
                      type="button"
                      :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400', { 'btn-error': errors.rackId }]"
                      :aria-expanded="openDropdowns.rack"
                      @click.stop="toggleDropdown('rack')"
                      :disabled="!form.warehouseId || loadingRacks"
                    >
                      <span :class="{ 'text-green-600 dark:text-green-400 font-medium': racks.length === 0 && form.warehouseId }">
                        {{ getRackButtonText() }}
                      </span>
                      <span v-if="racks.length > 0 || !form.warehouseId"
                        class="icon-[tabler--chevron-down] size-4 transition-transform"
                        :class="{ 'rotate-180': openDropdowns.rack }"
                      ></span>
                      <span v-else class="text-xl">+</span>
                    </button>

                    <ul
                      v-if="racks.length > 0"
                      class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white max-h-60 overflow-y-auto"
                      :class="{ 'opacity-100 pointer-events-auto': openDropdowns.rack, 'opacity-0 pointer-events-none': !openDropdowns.rack }"
                      role="menu"
                    >
                      <li v-for="rack in racks" :key="rack.id">
                        <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectRack(rack)">
                          {{ rack.rackCode }}
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
                    <div v-if="errors.rackId" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.rackId }}</p>
                    </div>
                  </transition>
                </div>

                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    <span class="text-red-500">*</span> Section Code
                  </label>
                  <input
                    v-model="form.sectionCode"
                    type="text"
                    placeholder="Enter Section Code"
                    maxlength="20"
                    :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.sectionCode }]"
                  />
                  <transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="errors.sectionCode" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.sectionCode }}</p>
                    </div>
                  </transition>
                </div>

                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    <span class="text-red-500">*</span> Section Name
                  </label>
                  <input
                    v-model="form.sectionName"
                    type="text"
                    placeholder="Enter Section Name"
                    maxlength="100"
                    :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.sectionName }]"
                  />
                  <transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="errors.sectionName" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.sectionName }}</p>
                    </div>
                  </transition>
                </div>

                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    <span class="text-red-500">*</span> Capacity
                  </label>
                  <input
                    v-model.number="form.capacity"
                    type="number"
                    placeholder="1"
                    min="1"
                    :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.capacity }]"
                  />
                  <transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="errors.capacity" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.capacity }}</p>
                    </div>
                  </transition>
                </div>

                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    <span class="text-red-500">*</span> Status
                  </label>
                  <div class="dropdown relative inline-flex w-full" ref="statusDropdownRef">
                    <button
                      type="button"
                      :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400', { 'btn-error': errors.status }]"
                      :aria-expanded="openDropdowns.status"
                      @click.stop="toggleDropdown('status')"
                    >
                      {{ form.status || 'Select Status' }}
                      <span
                        class="icon-[tabler--chevron-down] size-4 transition-transform"
                        :class="{ 'rotate-180': openDropdowns.status }"
                      ></span>
                    </button>

                    <ul
                      class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white"
                      :class="{ 'opacity-100 pointer-events-auto': openDropdowns.status, 'opacity-0 pointer-events-none': !openDropdowns.status }"
                      role="menu"
                    >
                      <li v-for="status in statusOptions" :key="status">
                        <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('status', status)">
                          {{ status }}
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
                    <div v-if="errors.status" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.status }}</p>
                    </div>
                  </transition>
                </div>

                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    Remarks
                  </label>
                  <textarea
                    v-model="form.remarks"
                    placeholder="Enter Remarks"
                    maxlength="500"
                    rows="3"
                    :class="['textarea textarea-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none', { 'textarea-error': errors.remarks }]"
                  ></textarea>
                  <div class="flex justify-between items-center mt-1">
                    <span class="text-xs text-gray-500">{{ form.remarks.length }}/500 characters</span>
                  </div>
                  <transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="errors.remarks" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.remarks }}</p>
                    </div>
                  </transition>
                </div>
              </div>

              <div class="flex justify-end gap-2 p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button @click="closeModal" class="btn btn-outline btn-error" :disabled="isSubmitting">
                  Cancel
                </button>
                <button @click="submitForm" class="btn btn-primary" :disabled="isSubmitting">
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
import { ref, reactive, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import RackInfoModal from './RackInfoModal.vue'

const emit = defineEmits(['item-created', 'open-add-rack'])

/* state */
const isOpen = ref(false)
const isSubmitting = ref(false)
const panelRef = ref(null)
const statusDropdownRef = ref(null)
const warehouseDropdownRef = ref(null)
const rackDropdownRef = ref(null)
const rackInfoModalRef = ref(null)

const warehouses = ref([])
const racks = ref([])
const loadingRacks = ref(false)
const selectedWarehouseName = ref('')
const selectedRackName = ref('')

const form = reactive({
  warehouseId: null,
  rackId: null,
  sectionCode: '',
  sectionName: '',
  capacity: 1,
  status: 'Active',
  remarks: ''
})

const errors = reactive({
  warehouseId: '',
  rackId: '',
  sectionCode: '',
  sectionName: '',
  capacity: '',
  status: '',
  remarks: '',
  submit: ''
})

const statusOptions = ['Active', 'Inactive']
const openDropdowns = reactive({ status: false, warehouse: false, rack: false })

/* Rack info modal */
const showRackInfo = () => {
  rackInfoModalRef.value?.openModal()
}

/* Get rack button text */
const getRackButtonText = () => {
  if (!form.warehouseId) return 'Select Rack'
  if (loadingRacks.value) return 'Loading...'
  if (racks.value.length === 0) return '+ Add Rack'
  return selectedRackName.value || 'Select Rack'
}

/* Fetch warehouses */
const fetchWarehouses = async () => {
  try {
    const response = await fetch('/api/warehouse')
    if (!response.ok) throw new Error('Failed to fetch warehouses')
    const json = await response.json()
    warehouses.value = json || []
  } catch (e) {
    console.error('Error fetching warehouses:', e)
  }
}

/* Fetch racks based on selected warehouse */
const fetchRacks = async () => {
  if (!form.warehouseId) {
    racks.value = []
    return
  }
  
  loadingRacks.value = true
  try {
    const response = await fetch(`/api/rack?warehouseId=${form.warehouseId}`)
    if (!response.ok) throw new Error('Failed to fetch racks')
    const json = await response.json()
    // Filter to ensure only racks for selected warehouse are shown
    racks.value = (json || []).filter(rack => rack.warehouseId === form.warehouseId)
  } catch (e) {
    console.error('Error fetching racks:', e)
    racks.value = []
  } finally {
    loadingRacks.value = false
  }
}

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

/* Validation */
const validateForm = () => {
  Object.keys(errors).forEach(key => errors[key] = '')

  let isValid = true

  if (!form.warehouseId) {
    errors.warehouseId = 'Warehouse is required'
    isValid = false
  }

  if (!form.rackId) {
    errors.rackId = 'Rack is required'
    isValid = false
  }

  if (!form.sectionCode.trim()) {
    errors.sectionCode = 'Section Code is required'
    isValid = false
  } else if (form.sectionCode.length > 20) {
    errors.sectionCode = 'Section Code cannot exceed 20 characters'
    isValid = false
  }

  if (!form.sectionName.trim()) {
    errors.sectionName = 'Section Name is required'
    isValid = false
  } else if (form.sectionName.length < 3) {
    errors.sectionName = 'Section Name must be at least 3 characters'
    isValid = false
  } else if (form.sectionName.length > 100) {
    errors.sectionName = 'Section Name cannot exceed 100 characters'
    isValid = false
  }

  if (!form.capacity || form.capacity < 1) {
    errors.capacity = 'Capacity must be at least 1'
    isValid = false
  }

  if (!form.status) {
    errors.status = 'Status is required'
    isValid = false
  }

  if (form.remarks.length > 500) {
    errors.remarks = 'Remarks cannot exceed 500 characters'
    isValid = false
  }

  return isValid
}

// Clear error when user types
watch(() => form.warehouseId, () => { if (errors.warehouseId) errors.warehouseId = '' })
watch(() => form.rackId, () => { if (errors.rackId) errors.rackId = '' })
watch(() => form.sectionCode, () => { if (errors.sectionCode) errors.sectionCode = '' })
watch(() => form.sectionName, () => { if (errors.sectionName) errors.sectionName = '' })
watch(() => form.capacity, () => { if (errors.capacity) errors.capacity = '' })
watch(() => form.status, () => { if (errors.status) errors.status = '' })
watch(() => form.remarks, () => { if (errors.remarks) errors.remarks = '' })

/* helpers */
const toggleDropdown = (name) => {
  // If clicking rack dropdown and no racks available, open add rack modal
  if (name === 'rack' && form.warehouseId && racks.value.length === 0) {
    handleAddRack()
    return
  }
  
  Object.keys(openDropdowns).forEach(k => { if (k !== name) openDropdowns[k] = false })
  openDropdowns[name] = !openDropdowns[name]
}

const selectOption = (key, value) => {
  form[key] = value
  openDropdowns[key] = false
}

const selectWarehouse = (warehouse) => {
  form.warehouseId = warehouse.id
  selectedWarehouseName.value = warehouse.warehouseCode
  openDropdowns.warehouse = false
  
  // Reset rack selection when warehouse changes
  form.rackId = null
  selectedRackName.value = ''
  
  // Fetch racks for the selected warehouse
  fetchRacks()
}

const selectRack = (rack) => {
  form.rackId = rack.id
  selectedRackName.value = rack.rackCode
  openDropdowns.rack = false
}

const handleAddRack = () => {
  // Close this modal first
  closeModal()
  // Emit event to parent to open add rack modal
  emit('open-add-rack', { warehouseId: form.warehouseId })
}

/* close dropdowns when clicking outside */
const handleClickOutside = (event) => {
  const statusDd = statusDropdownRef.value
  const warehouseDd = warehouseDropdownRef.value
  const rackDd = rackDropdownRef.value

  if (statusDd && !statusDd.contains(event.target)) {
    openDropdowns.status = false
  }

  if (warehouseDd && !warehouseDd.contains(event.target)) {
    openDropdowns.warehouse = false
  }

  if (rackDd && !rackDd.contains(event.target)) {
    openDropdowns.rack = false
  }
}

/* open/close modal */
const openModal = async () => {
  // Reset form
  form.warehouseId = null
  form.rackId = null
  form.sectionCode = ''
  form.sectionName = ''
  form.capacity = 1
  form.status = 'Active'
  form.remarks = ''
  selectedWarehouseName.value = ''
  selectedRackName.value = ''

  // Reset errors
  Object.keys(errors).forEach(key => errors[key] = '')

  // Fetch warehouses
  await fetchWarehouses()

  isOpen.value = true
  lockScroll()
  await nextTick()
  panelRef.value?.querySelector('input,select,textarea,button')?.focus()
}

const closeModal = async () => {
  openDropdowns.status = false
  openDropdowns.warehouse = false
  openDropdowns.rack = false
  isOpen.value = false

  // Reset form after modal is closed
  await nextTick()
  form.warehouseId = null
  form.rackId = null
  form.sectionCode = ''
  form.sectionName = ''
  form.capacity = 1
  form.status = 'Active'
  form.remarks = ''
  selectedWarehouseName.value = ''
  selectedRackName.value = ''

  // Reset errors
  Object.keys(errors).forEach(key => errors[key] = '')
}

/* submit */
const submitForm = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  errors.submit = ''

  try {
    const submissionData = {
      warehouseId: form.warehouseId,
      rackId: form.rackId,
      sectionCode: form.sectionCode.toUpperCase(),
      sectionName: form.sectionName,
      capacity: form.capacity,
      status: form.status,
      remark: form.remarks || null
    }

    const response = await fetch('/api/section', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to create section')
    }

    const data = await response.json()
    console.log('Server response:', data)

    await closeModal()

    emit('item-created', { success: true, data })

  } catch (error) {
    console.error('Error creating section:', error)
    errors.submit = error.message || 'Failed to create section. Please try again.'
    emit('item-created', { success: false, error: error.message || 'Failed to create section' })
  } finally {
    isSubmitting.value = false
  }
}

/* lifecycle */
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  if (isOpen.value) {
    unlockScroll()
  }
})

/* expose to parent */
defineExpose({ openModal, closeModal })
</script>

<style scoped>
[role="dialog"] > .bg-white {
  transform-origin: center;
}
</style>