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
        @keydown.esc="closeModal"
        @keydown.tab.prevent="handleTabKey"
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
                  Add New Rack
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
                <div v-if="errors.submit" class="alert alert-error bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  <span class="block sm:inline">{{ errors.submit }}</span>
                </div>

                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    <span class="text-red-500">*</span> Warehouse Code
                  </label>
                  <div class="dropdown relative inline-flex w-full" ref="warehouseDropdownRef">
                    <button
                      type="button"
                      :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400', { 'btn-error': errors.warehouseId, 'border-red-500': errors.warehouseId }]"
                      :aria-expanded="openDropdowns.warehouse"
                      @click.stop="toggleDropdown('warehouse')"
                      @keydown.enter.space.prevent="toggleDropdown('warehouse')"
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
                      tabindex="-1"
                    >
                      <li v-for="(warehouse, index) in warehouses" :key="warehouse.id">
                        <a
                          role="menuitem"
                          class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
                          @click="selectWarehouse(warehouse)"
                          @keydown.enter.space.prevent="selectWarehouse(warehouse)"
                          :tabindex="openDropdowns.warehouse ? 0 : -1"
                          :data-index="index"
                        >
                          {{ warehouse.warehouseCode }} ({{ warehouse.name }})
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
                    <div v-if="errors.warehouseId" class="absolute left-0 right-0 mt-1 z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.warehouseId }}</p>
                    </div>
                  </transition>
                </div>

                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    <span class="text-red-500">*</span> Rack Code
                  </label>
                  <input
                    v-model="form.rackCode"
                    type="text"
                    placeholder="Enter Rack Code"
                    maxlength="20"
                    :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error border-red-500': errors.rackCode }]"
                  />
                  <transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="errors.rackCode" class="absolute left-0 right-0 mt-1 z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.rackCode }}</p>
                    </div>
                  </transition>
                </div>

                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    <span class="text-red-500">*</span> Rack Name
                  </label>
                  <input
                    v-model="form.rackName"
                    type="text"
                    placeholder="Enter Rack Name"
                    maxlength="100"
                    :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error border-red-500': errors.rackName }]"
                  />
                  <transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="errors.rackName" class="absolute left-0 right-0 mt-1 z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.rackName }}</p>
                    </div>
                  </transition>
                </div>

                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    <span class="text-red-500">*</span> Rack Type
                  </label>
                  <div class="dropdown relative inline-flex w-full" ref="rackTypeDropdownRef">
                    <button
                      type="button"
                      :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400', { 'btn-error border-red-500': errors.rackType }]"
                      :aria-expanded="openDropdowns.rackType"
                      @click.stop="toggleDropdown('rackType')"
                      @keydown.enter.space.prevent="toggleDropdown('rackType')"
                    >
                      {{ form.rackType || 'Select Rack Type' }}
                      <span
                        class="icon-[tabler--chevron-down] size-4 transition-transform"
                        :class="{ 'rotate-180': openDropdowns.rackType }"
                      ></span>
                    </button>

                    <ul
                      class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white max-h-60 overflow-y-auto"
                      :class="{ 'opacity-100 pointer-events-auto': openDropdowns.rackType, 'opacity-0 pointer-events-none': !openDropdowns.rackType }"
                      role="menu"
                      tabindex="-1"
                    >
                      <li v-for="(type, index) in rackTypeOptions" :key="type">
                        <a
                          role="menuitem"
                          class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
                          @click="selectOption('rackType', type)"
                          @keydown.enter.space.prevent="selectOption('rackType', type)"
                          :tabindex="openDropdowns.rackType ? 0 : -1"
                          :data-index="index"
                        >
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
                    <div v-if="errors.rackType" class="absolute left-0 right-0 mt-1 z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.rackType }}</p>
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
                    :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error border-red-500': errors.capacity }]"
                  />
                  <transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="errors.capacity" class="absolute left-0 right-0 mt-1 z-10">
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
                      :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400', { 'btn-error border-red-500': errors.status }]"
                      :aria-expanded="openDropdowns.status"
                      @click.stop="toggleDropdown('status')"
                      @keydown.enter.space.prevent="toggleDropdown('status')"
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
                      tabindex="-1"
                    >
                      <li v-for="(status, index) in statusOptions" :key="status">
                        <a
                          role="menuitem"
                          class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
                          @click="selectOption('status', status)"
                          @keydown.enter.space.prevent="selectOption('status', status)"
                          :tabindex="openDropdowns.status ? 0 : -1"
                          :data-index="index"
                        >
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
                    <div v-if="errors.status" class="absolute left-0 right-0 mt-1 z-10">
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
                    :class="['textarea textarea-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none', { 'textarea-error border-red-500': errors.remarks }]"
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
                    <div v-if="errors.remarks" class="absolute left-0 right-0 mt-1 z-10">
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
                  <span v-if="isSubmitting" class="loading loading-spinner loading-sm mr-2"></span>
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
import { authenticatedFetch } from '@/utils/authenticatedFetch'

const emit = defineEmits(['item-created'])

/* state */
const isOpen = ref(false)
const isSubmitting = ref(false)
const panelRef = ref(null)
const statusDropdownRef = ref(null)
const warehouseDropdownRef = ref(null)
const rackTypeDropdownRef = ref(null)

const warehouses = ref([])
const selectedWarehouseName = ref('')

const form = reactive({
  warehouseId: null,
  rackCode: '',
  rackName: '',
  rackType: '',
  capacity: 1,
  status: 'Active',
  remarks: ''
})

const errors = reactive({
  warehouseId: '',
  rackCode: '',
  rackName: '',
  rackType: '',
  capacity: '',
  status: '',
  remarks: '',
  submit: ''
})

const statusOptions = ['Active', 'Inactive']
const rackTypeOptions = ['Pallet Rack', 'Cantilever Rack', 'Selective Rack', 'Drive-In Rack', 'Push-Back Rack', 'Mobile Rack', 'Mezzanine Rack']
const openDropdowns = reactive({ status: false, warehouse: false, rackType: false })

/* Fetch warehouses */
const fetchWarehouses = async () => {
  try {
    const response = await authenticatedFetch('/api/warehouse')
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(errorData.message || `Failed to fetch warehouses with status: ${response.status}`)
    }
    const json = await response.json()
    warehouses.value = json || []
  } catch (e) {
    console.error('Error fetching warehouses:', e)
    errors.submit = e.message || 'Failed to load warehouses for selection.'
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

  if (!form.rackCode.trim()) {
    errors.rackCode = 'Rack Code is required'
    isValid = false
  } else if (form.rackCode.length > 20) {
    errors.rackCode = 'Rack Code cannot exceed 20 characters'
    isValid = false
  }

  if (!form.rackName.trim()) {
    errors.rackName = 'Rack Name is required'
    isValid = false
  } else if (form.rackName.length < 3) {
    errors.rackName = 'Rack Name must be at least 3 characters'
    isValid = false
  } else if (form.rackName.length > 100) {
    errors.rackName = 'Rack Name cannot exceed 100 characters'
    isValid = false
  }

  if (!form.rackType) {
    errors.rackType = 'Rack Type is required'
    isValid = false
  }

  const capacityNumber = Number(form.capacity)
  if (isNaN(capacityNumber) || capacityNumber < 1) {
    errors.capacity = 'Capacity must be a number greater than or equal to 1'
    isValid = false
  } else if (capacityNumber % 1 !== 0) {
    errors.capacity = 'Capacity must be a whole number'
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

// Clear error when user interacts with field
watch(() => form.warehouseId, () => { if (errors.warehouseId) errors.warehouseId = '' })
watch(() => form.rackCode, () => { if (errors.rackCode) errors.rackCode = '' })
watch(() => form.rackName, () => { if (errors.rackName) errors.rackName = '' })
watch(() => form.rackType, () => { if (errors.rackType) errors.rackType = '' })
watch(() => form.capacity, () => { if (errors.capacity) errors.capacity = '' })
watch(() => form.status, () => { if (errors.status) errors.status = '' })
watch(() => form.remarks, () => { if (errors.remarks) errors.remarks = '' })

/* helpers */
const toggleDropdown = (name) => {
  Object.keys(openDropdowns).forEach(k => { if (k !== name) openDropdowns[k] = false })
  openDropdowns[name] = !openDropdowns[name]

  if (openDropdowns[name]) {
    nextTick(() => {
      const dropdownRef = name === 'warehouse' ? warehouseDropdownRef : (name === 'rackType' ? rackTypeDropdownRef : statusDropdownRef)
      dropdownRef.value?.querySelector('a[role="menuitem"]')?.focus()
    })
  } else {
    const dropdownRef = name === 'warehouse' ? warehouseDropdownRef : (name === 'rackType' ? rackTypeDropdownRef : statusDropdownRef)
    dropdownRef.value?.querySelector('button')?.focus()
  }
}

const selectOption = (key, value) => {
  form[key] = value
  openDropdowns[key] = false
}

const selectWarehouse = (warehouse) => {
  form.warehouseId = warehouse.id
  selectedWarehouseName.value = warehouse.warehouseCode
  openDropdowns.warehouse = false
}

/* close dropdowns when clicking outside */
const handleClickOutside = (event) => {
  const dropdowns = {
    status: statusDropdownRef.value,
    warehouse: warehouseDropdownRef.value,
    rackType: rackTypeDropdownRef.value
  }

  Object.keys(openDropdowns).forEach(k => {
    if (openDropdowns[k] && dropdowns[k] && !dropdowns[k].contains(event.target)) {
      openDropdowns[k] = false
    }
  })
}

/* Tab key handler for focus trap */
const handleTabKey = (event) => {
  if (!panelRef.value) return

  const focusableElements = panelRef.value.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )
  if (focusableElements.length === 0) return

  const firstFocusable = focusableElements[0]
  const lastFocusable = focusableElements[focusableElements.length - 1]

  if (event.shiftKey) {
    if (document.activeElement === firstFocusable) {
      lastFocusable.focus()
      event.preventDefault()
    }
  } else {
    if (document.activeElement === lastFocusable) {
      firstFocusable.focus()
      event.preventDefault()
    }
  }
}

/* open/close modal */
const openModal = async (preSelectedWarehouseId = null) => {
  // Reset form with optional pre-selected warehouse
  form.warehouseId = preSelectedWarehouseId || null
  form.rackCode = ''
  form.rackName = ''
  form.rackType = ''
  form.capacity = 1
  form.status = 'Active'
  form.remarks = ''
  
  // Reset errors
  Object.keys(errors).forEach(key => errors[key] = '')

  // Fetch warehouses first
  await fetchWarehouses()

  // If warehouse is pre-selected, set the display name
  if (preSelectedWarehouseId && warehouses.value.length > 0) {
    const warehouse = warehouses.value.find(w => w.id === preSelectedWarehouseId)
    if (warehouse) {
      selectedWarehouseName.value = warehouse.warehouseCode
    }
  } else {
    selectedWarehouseName.value = ''
  }

  isOpen.value = true
  lockScroll()
  await nextTick()
  panelRef.value?.querySelector('button[aria-label="Close modal"]')?.focus()
}

const closeModal = async () => {
  openDropdowns.status = false
  openDropdowns.warehouse = false
  openDropdowns.rackType = false
  
  isOpen.value = false

  await nextTick()
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
      rackCode: form.rackCode.toUpperCase(),
      rackName: form.rackName,
      rackType: form.rackType,
      capacity: Number(form.capacity),
      status: form.status,
      remark: form.remarks || null
    }

    console.log('Submitting data:', submissionData)

    const response = await authenticatedFetch('/api/rack', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData)
    })

    if (!response.ok) {
      let errorMessage = `Failed to create rack (HTTP ${response.status}).`
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch (e) {
        console.error("Server returned non-JSON error response:", response.statusText)
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('Server response:', data)

    await closeModal()

    emit('item-created', { success: true, data })

  } catch (error) {
    console.error('Error creating rack:', error)
    errors.submit = error.message || 'An unknown error occurred. Failed to create rack.'
    emit('item-created', { success: false, error: error.message || 'Failed to create rack' })
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
/* Scoped styles, using Tailwind or DaisyUI utility classes for most styling */
.dropdown-menu {
  /* This prevents the dropdown from pushing content down */
  position: absolute;
}
</style>