<template>
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
                  Edit Section </h2>
                <button
                  type="button"
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  @click="closeModal"
                  :disabled="isSubmitting || isLoading"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              <div class="space-y-4 overflow-y-auto p-6 flex-1">
                <div v-if="errors.submit" class="alert alert-error bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  <span class="block sm:inline">{{ errors.submit }}</span>
                </div>

                <div v-if="isLoading" class="flex justify-center items-center h-40">
                  <span class="loading loading-spinner loading-lg text-primary"></span>
                  <p class="text-gray-500 ml-3">Loading Section Data...</p>
                </div>

                <div v-else class="space-y-4">
                  <div class="relative">
                    <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                      <span class="text-red-500">*</span> Warehouse Code
                    </label>
                    <div class="input input-bordered w-full bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed py-1">
                      {{ selectedWarehouseName || 'Loading...' }}
                    </div>
                    <input type="hidden" v-model="form.warehouseId">
                  </div>

                  <div class="relative">
                    <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <span><span class="text-red-500">*</span> Rack Code</span>
                      <button
                        type="button"
                        @click="showRackInfo"
                        class="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                        aria-label="Show rack information"
                        :disabled="!form.rackId"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      </button>
                    </label>
                    <div class="input input-bordered w-full bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed py-1">
                      {{ selectedRackName || 'Loading...' }}
                    </div>
                    <input type="hidden" v-model="form.rackId">
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
                      <div v-if="errors.sectionCode" class="absolute left-0 right-0 mt-1 z-10">
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
                      <div v-if="errors.sectionName" class="absolute left-0 right-0 mt-1 z-10">
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
                      <div v-if="errors.remarks" class="absolute left-0 right-0 mt-1 z-10">
                        <p class="text-xs text-red-600 dark:text-red-400">{{ errors.remarks }}</p>
                      </div>
                    </transition>
                  </div>
                </div>
              </div>

              <div class="flex justify-end gap-2 p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button @click="closeModal" class="btn btn-outline btn-error" :disabled="isSubmitting || isLoading">
                  Cancel
                </button>
                <button @click="submitForm" class="btn btn-primary" :disabled="isSubmitting || isLoading">
                  <span v-if="isSubmitting" class="loading loading-spinner loading-sm mr-2"></span>
                  {{ isSubmitting ? 'Updating...' : 'Update' }} </button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

---

<script setup>
import { ref, reactive, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import RackInfoModal from './RackInfoModal.vue'
import { authenticatedFetch } from '@/utils/authenticatedFetch'

// Change emit for update and remove 'open-add-rack' as it's not relevant for editing
const emit = defineEmits(['item-updated'])

/* state */
const isOpen = ref(false)
const isLoading = ref(false) // NEW: for loading section data
const isSubmitting = ref(false)
const panelRef = ref(null)
const statusDropdownRef = ref(null)
const rackInfoModalRef = ref(null)

// Removed unused refs: warehouseDropdownRef, rackDropdownRef

// The following are no longer needed for editing a section, but kept the variables for pre-filling:
const warehouses = ref([]) // Kept for data structure consistency, but not used for dropdown
const racks = ref([])      // Kept for data structure consistency, but not used for dropdown
const loadingRacks = ref(false) // No longer needed
const selectedWarehouseName = ref('')
const selectedRackName = ref('')

// Add 'id' to the form to hold the section being edited
const form = reactive({
  id: null, // NEW: Section ID
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
// Only need 'status' dropdown for editing
const openDropdowns = reactive({ status: false })


// --- NEW PROPS DEFINITION ---
const props = defineProps({
  // Only expect the ID of the section to be edited
  sectionId: {
    type: [Number, String],
    required: true,
  }
})
// ----------------------------


/* Data Fetching and Setup */
const fetchSectionData = async () => {
    if (!props.sectionId) {
        errors.submit = 'Error: No Section ID provided for editing.'
        return false
    }

    isLoading.value = true
    errors.submit = ''

    // Reset form before fetching new data
    Object.keys(form).forEach(key => form[key] = (key === 'capacity') ? 1 : null)

    try {
        const url = `/api/section/${props.sectionId}` // API call to get single section data
        console.log('Fetching section data from:', url)
        const response = await authenticatedFetch(url)

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }))
            throw new Error(errorData.message || `Failed to fetch section data with status: ${response.status}`)
        }

        const sectionData = await response.json()
        console.log('Fetched section data:', sectionData)

        // Pre-fill the form using the fetched data
        form.id = sectionData.id
        form.warehouseId = sectionData.warehouseId
        form.rackId = sectionData.rackId
        form.sectionCode = sectionData.sectionCode
        form.sectionName = sectionData.sectionName
        form.capacity = sectionData.capacity
        form.status = sectionData.status
        form.remarks = sectionData.remark || '' // Note: use 'remark' from API

    // Set the selected warehouse/rack display names (use nested objects if present)
    if (sectionData.warehouse && sectionData.warehouse.warehouseCode) {
      selectedWarehouseName.value = sectionData.warehouse.warehouseCode
    } else if (sectionData.warehouseId) {
      // fetch warehouse by id to get the code
      try {
        const wResp = await authenticatedFetch(`/api/warehouse/${sectionData.warehouseId}`)
        if (wResp.ok) {
          const wJson = await wResp.json()
          selectedWarehouseName.value = wJson.warehouseCode || `WH ID: ${sectionData.warehouseId}`
        } else {
          selectedWarehouseName.value = `WH ID: ${sectionData.warehouseId}`
        }
      } catch (e) {
        console.error('Error fetching warehouse for section display:', e)
        selectedWarehouseName.value = `WH ID: ${sectionData.warehouseId}`
      }
    } else {
      selectedWarehouseName.value = 'N/A'
    }

    if (sectionData.rack && sectionData.rack.rackCode) {
      selectedRackName.value = sectionData.rack.rackCode
    } else if (sectionData.rackId) {
      try {
        const rResp = await authenticatedFetch(`/api/rack/${sectionData.rackId}`)
        if (rResp.ok) {
          const rJson = await rResp.json()
          selectedRackName.value = rJson.rackCode || `RACK ID: ${sectionData.rackId}`
        } else {
          selectedRackName.value = `RACK ID: ${sectionData.rackId}`
        }
      } catch (e) {
        console.error('Error fetching rack for section display:', e)
        selectedRackName.value = `RACK ID: ${sectionData.rackId}`
      }
    } else {
      selectedRackName.value = 'N/A'
    }

        return true

    } catch (e) {
        console.error('Error fetching section data:', e)
        errors.submit = e.message || 'Failed to load section data for editing.'
        return false
    } finally {
        isLoading.value = false
    }
}


/* Rack info modal (only useful if rackId is set) */
const showRackInfo = () => {
  if (form.rackId) {
    // Assuming the RackInfoModal can take a rackId prop to fetch its own data
    rackInfoModalRef.value?.openModal(form.rackId)
  }
}

// Removed: getRackButtonText, fetchWarehouses, fetchRacks, selectWarehouse, selectRack, handleAddRack

/* Modal scroll lock utilities (omitted for brevity - remains the same) */
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

/* Validation (Minimal changes) */
const validateForm = () => {
  Object.keys(errors).forEach(key => errors[key] = '')

  let isValid = true

  // Location fields are assumed valid since they are loaded from existing data,
  // but we validate for existence just in case the fetch failed partially.
  if (!form.warehouseId) {
    errors.warehouseId = 'Warehouse ID is missing'
    isValid = false
  }

  if (!form.rackId) {
    errors.rackId = 'Rack ID is missing'
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

// Clear error when user interacts with field (same as original)
watch(() => form.sectionCode, () => { if (errors.sectionCode) errors.sectionCode = '' })
watch(() => form.sectionName, () => { if (errors.sectionName) errors.sectionName = '' })
watch(() => form.capacity, () => { if (errors.capacity) errors.capacity = '' })
watch(() => form.status, () => { if (errors.status) errors.status = '' })
watch(() => form.remarks, () => { if (errors.remarks) errors.remarks = '' })

/* helpers */
const toggleDropdown = (name) => {
  // Only status dropdown remains
  Object.keys(openDropdowns).forEach(k => { if (k !== name) openDropdowns[k] = false })
  openDropdowns[name] = !openDropdowns[name]
}

const selectOption = (key, value) => {
  form[key] = value
  openDropdowns[key] = false
}

// Removed handleClickOutside since only one dropdown remains (status)
// Re-implementing simplified handleClickOutside
const handleClickOutside = (event) => {
  const statusDd = statusDropdownRef.value
  if (openDropdowns.status && statusDd && !statusDd.contains(event.target)) {
    openDropdowns.status = false
  }
}

/* open/close modal */
const openModal = async () => {
    // We rely on the `sectionId` prop now.
    const success = await fetchSectionData()
    if (!success) return

    isOpen.value = true
    lockScroll()
    await nextTick()
    panelRef.value?.querySelector('button[aria-label="Close modal"]')?.focus()
}

const closeModal = async () => {
  openDropdowns.status = false
  isOpen.value = false

  // Reset errors only
  Object.keys(errors).forEach(key => errors[key] = '')

  await nextTick()
  // No need to reset form completely, as the next openModal will fetch and overwrite based on the new prop.
}

/* submit (Uses PATCH) */
const submitForm = async () => {
  if (!validateForm() || !form.id) {
    errors.submit = form.id ? errors.submit : 'Internal Error: Missing section ID for update.'
    return
  }

  isSubmitting.value = true
  errors.submit = ''

  try {
    const sectionId = form.id;
    const url = `/api/section/${sectionId}`; // PATCH URL
    const submissionData = {
      // Send all fields for update, even if location fields are unchanged
      warehouseId: form.warehouseId,
      rackId: form.rackId,
      sectionCode: form.sectionCode.toUpperCase(),
      sectionName: form.sectionName,
      capacity: Number(form.capacity),
      status: form.status,
      remark: form.remarks || null // Send as 'remark' to match API structure
    }

    console.log(`Submitting update data (Method: PATCH, URL: ${url}):`, submissionData)

    const response = await authenticatedFetch(url, {
      method: 'PATCH', // Changed from POST to PATCH
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData)
    })

    if (!response.ok) {
      let errorMessage = `Failed to update section (HTTP ${response.status}).`
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
    emit('item-updated', { success: true, data }) // Changed emit event

  } catch (error) {
    console.error('Error updating section:', error)
    errors.submit = error.message || 'An unknown error occurred. Failed to update section.'
    emit('item-updated', { success: false, error: error.message || 'Update failed' }) // Changed emit event
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

// Expose to parent
defineExpose({ openModal, closeModal })
</script>

<style scoped>
/* Scoped styles remain the same */
[role="dialog"] > .bg-white {
  transform-origin: center;
}

/* Style for read-only location fields */
.input-bordered.cursor-not-allowed {
  border-color: #e5e7eb; /* Gray-200 */
}
.dark .input-bordered.cursor-not-allowed {
  border-color: #374151; /* Gray-700 */
}
</style>
