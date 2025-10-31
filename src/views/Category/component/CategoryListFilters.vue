<template>
  <div class="p-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
        <input
          v-model="filters.categoryName"
          type="text"
          placeholder="Filter by Category Name"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <div>
        <input
          v-model="filters.categoryCode"
          type="text"
          placeholder="Filter by Category Code"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <div class="dropdown relative inline-flex w-full">
        <button
          ref="statusDropdownRef"
          type="button"
          class="dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400"
          aria-haspopup="menu"
          :aria-expanded="openDropdowns.status"
          aria-label="Filter by Status"
          @click="toggleDropdown('status')"
        >
          {{
            statusOptions.find((opt) => opt.value === filters.status)?.label || 'Filter by Status'
          }}
          <span
            class="icon-[tabler--chevron-down] size-4 transition-transform"
            :class="{ 'rotate-180': openDropdowns.status }"
          ></span>
        </button>
        <ul
          class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white"
          :class="{
            'opacity-100': openDropdowns.status,
            'opacity-0 pointer-events-none': !openDropdowns.status,
          }"
          role="menu"
          aria-orientation="vertical"
        >
          <li>
            <a
              class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
              @click="selectOption('status', '')"
              >Select Status</a
            >
          </li>
          <li>
            <a
              class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
              @click="selectOption('status', 'Active')"
              >Active</a
            >
          </li>
          <li>
            <a
              class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
              @click="selectOption('status', 'Inactive')"
              >Inactive</a
            >
          </li>
        </ul>
      </div>

      <div class="flex justify-end gap-2 lg:col-span-3 md:col-span-2 sm:col-span-1">
        <button @click="clearFilters" class="btn btn-outline btn-error flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Clear
        </button>

        <button
          @click="applyFilters"
          class="btn bg-brand-500 hover:bg-brand-600 flex items-center gap-2 border-none"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
            />
          </svg>
          Apply Filters
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, onMounted, onUnmounted } from 'vue'
// Removed flatpickr import since Created Date is not included
// import flatpickr from 'flatpickr'

const emit = defineEmits(['filter-change'])

// Updated filters state to match requested fields
const filters = ref({
  // MODIFIED: 'supplierName' to 'categoryName'
  categoryName: '',
  // MODIFIED: 'supplierCode' to 'categoryCode'
  categoryCode: '',
  status: '',
  // Removed: workOrder, compoundingLot, priority, acknowledgement, createdDate
})

// Custom status options to reflect typical supplier states (kept as is)
const statusOptions = ref([
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
])

// Updated openDropdowns to only include 'status' (kept as is)
const openDropdowns = ref({
  status: false,
})

const statusDropdownRef = ref(null)
// Removed: priorityDropdownRef, acknowledgementDropdownRef, datePickerRef
// let flatpickrInstance = null

const applyFilters = () => {
  emit('filter-change', filters.value)
}

const clearFilters = () => {
  // Clear only the existing filter fields, updated for category
  filters.value = {
    // MODIFIED: 'supplierName' to 'categoryName'
    categoryName: '',
    // MODIFIED: 'supplierCode' to 'categoryCode'
    categoryCode: '',
    status: '',
  }

  // No flatpickr to clear

  emit('filter-change', filters.value)
}

const toggleDropdown = (dropdownName) => {
  // Logic simplified as only 'status' exists, but kept general structure
  Object.keys(openDropdowns.value).forEach((key) => {
    if (key !== dropdownName) {
      openDropdowns.value[key] = false
    }
  })
  openDropdowns.value[dropdownName] = !openDropdowns.value[dropdownName]
}

const selectOption = (key, value) => {
  filters.value[key] = value
  openDropdowns.value[key] = false
}

const closeAllDropdowns = () => {
  Object.keys(openDropdowns.value).forEach((key) => {
    openDropdowns.value[key] = false
  })
}

const handleClickOutside = (event) => {
  // Only check the status dropdown ref
  const dropdownRefs = [statusDropdownRef.value]
  const isClickInside = dropdownRefs.some(
    (ref) => ref && ref.closest('.dropdown') && ref.closest('.dropdown').contains(event.target),
  )
  if (!isClickInside) {
    closeAllDropdowns()
  }
}

onMounted(() => {
  // flatpickr initialization removed
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  // flatpickr destruction removed
  document.removeEventListener('click', handleClickOutside)
})
</script>
