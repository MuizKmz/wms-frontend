<template>
  <div class="p-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <!-- Return Number -->
      <div>
        <input
          v-model="filters.returnNo"
          type="text"
          placeholder="Filter by Return Number"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <!-- Reference No -->
      <div>
        <input
          v-model="filters.referenceNo"
          type="text"
          placeholder="Filter by Reference No"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <!-- Return Type Dropdown -->
      <div class="dropdown relative inline-flex w-full">
        <button
          ref="typeDropdownRef"
          type="button"
          class="dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400"
          aria-haspopup="menu"
          :aria-expanded="openDropdowns.returnType"
          aria-label="Filter by Return Type"
          @click="toggleDropdown('returnType')"
        >
          {{ returnTypes.find((opt) => opt.value === filters.returnType)?.label || 'Filter by Return Type' }}
          <span
            class="icon-[tabler--chevron-down] size-4 transition-transform"
            :class="{ 'rotate-180': openDropdowns.returnType }"
          ></span>
        </button>
        <ul
          class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white max-h-60 overflow-y-auto"
          :class="{
            'opacity-100': openDropdowns.returnType,
            'opacity-0 pointer-events-none': !openDropdowns.returnType,
          }"
          role="menu"
          aria-orientation="vertical"
        >
          <li>
            <a
              class="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-lg"
              @click="selectOption('returnType', '')"
              >All Types</a
            >
          </li>
          <li v-for="type in returnTypes" :key="type.value">
            <a
              class="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-lg"
              @click="selectOption('returnType', type.value)"
            >
              {{ type.label }}
            </a>
          </li>
        </ul>
      </div>

      <!-- Date Picker -->
      <div>
        <input
          ref="datePickerRef"
          type="text"
          placeholder="Filter by Date"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <!-- From Filter -->
      <div>
        <input
          v-model="filters.from"
          type="text"
          placeholder="Filter by From"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <!-- To Filter -->
      <div>
        <input
          v-model="filters.to"
          type="text"
          placeholder="Filter by To"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-2 xl:col-span-4 lg:col-span-3 md:col-span-2 sm:col-span-1">
        <div class="flex justify-end w-full space-x-2">
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
            class="btn bg-brand-500 hover:bg-brand-600 border-none flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 7V4z"
              />
            </svg>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.css'

const emit = defineEmits<{
  'filter-change': [filters: Record<string, any>]
}>()

const filters = reactive({
  returnNo: '',
  referenceNo: '',
  returnType: '',
  dateRange: '',
  from: '',
  to: ''
})

const openDropdowns = reactive({
  returnType: false
})

const returnTypes = [
  { value: 'Customer Return', label: 'Customer Return' },
  { value: 'Supplier Return', label: 'Supplier Return' },
  { value: 'Damage Return', label: 'Damage Return' },
  { value: 'Quality Return', label: 'Quality Return' }
]

const typeDropdownRef = ref<HTMLElement | null>(null)
const datePickerRef = ref<HTMLInputElement | null>(null)
let flatpickrInstance: any = null

const toggleDropdown = (dropdown: keyof typeof openDropdowns) => {
  openDropdowns[dropdown] = !openDropdowns[dropdown]
}

const selectOption = (dropdown: keyof typeof openDropdowns, value: string) => {
  if (dropdown === 'returnType') {
    filters.returnType = value
  }
  openDropdowns[dropdown] = false
}

const applyFilters = () => {
  emit('filter-change', { ...filters })
}

const clearFilters = () => {
  filters.returnNo = ''
  filters.referenceNo = ''
  filters.returnType = ''
  filters.dateRange = ''
  filters.from = ''
  filters.to = ''
  if (flatpickrInstance) {
    flatpickrInstance.clear()
  }
  emit('filter-change', {})
}

const handleClickOutside = (event: MouseEvent) => {
  if (typeDropdownRef.value && !typeDropdownRef.value.contains(event.target as Node)) {
    openDropdowns.returnType = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  if (datePickerRef.value) {
    flatpickrInstance = flatpickr(datePickerRef.value, {
      mode: 'range',
      dateFormat: 'Y-m-d',
      onChange: (selectedDates: Date[]) => {
        if (selectedDates.length === 2) {
          filters.dateRange = selectedDates.map(d => d.toISOString().split('T')[0]).join(' to ')
        }
      }
    })
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  if (flatpickrInstance) {
    flatpickrInstance.destroy()
  }
})
</script>
