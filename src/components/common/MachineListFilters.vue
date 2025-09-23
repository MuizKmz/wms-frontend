<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
      <!-- Filter by Machine Code -->
      <div>
        <input
          v-model="filters.machineCode"
          type="text"
          placeholder="Filter by Machine Code"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <!-- Filter by Machine Name -->
      <div>
        <input
          v-model="filters.machineName"
          type="text"
          placeholder="Filter by Machine Name"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <!-- Filter by Type -->
      <div class="dropdown relative inline-flex w-full">
        <button 
          ref="typeDropdownRef"
          type="button" 
          class="dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400" 
          aria-haspopup="menu" 
          :aria-expanded="openDropdowns.type"
          aria-label="Filter by Type"
          @click="toggleDropdown('type')"
        >
          {{ filters.type || 'Filter by Type' }}
          <span class="icon-[tabler--chevron-down] size-4 transition-transform" :class="{ 'rotate-180': openDropdowns.type }"></span>
        </button>
        <ul 
          class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 
                 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white" 
          :class="{ 'opacity-100': openDropdowns.type, 'opacity-0 pointer-events-none': !openDropdowns.type }"
          role="menu" 
          aria-orientation="vertical"
        >
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('type', '')">Filter by Type</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('type', 'mixer')">Mixer</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('type', 'vulcanizing press')">Vulcanizing Press</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('type', 'cutter')">Cutter</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('type', 'injection moulder')">Injection Moulder</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('type', 'conveyor belt')">Conveyor Belt</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('type', 'grinder')">Grinder</a></li>
        </ul>
      </div>

      <!-- Filter by Department -->
      <div class="dropdown relative inline-flex w-full">
        <button 
          ref="departmentDropdownRef"
          type="button" 
          class="dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400" 
          aria-haspopup="menu" 
          :aria-expanded="openDropdowns.department"
          aria-label="Filter by Department"
          @click="toggleDropdown('department')"
        >
          {{ filters.department || 'Filter by Department' }}
          <span class="icon-[tabler--chevron-down] size-4 transition-transform" :class="{ 'rotate-180': openDropdowns.department }"></span>
        </button>
        <ul 
          class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 
                 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white" 
          :class="{ 'opacity-100': openDropdowns.department, 'opacity-0 pointer-events-none': !openDropdowns.department }"
          role="menu" 
          aria-orientation="vertical"
        >
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('department', '')">Filter by Department</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('department', 'compounding')">Compounding</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('department', 'production')">Production</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('department', 'finishing')">Finishing</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('department', 'molding')">Molding</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('department', 'packing')">Packing</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('department', 'tool room')">Tool Room</a></li>
        </ul>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Filter by Status -->
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
          {{ filters.status || 'Filter by Status' }}
          <span class="icon-[tabler--chevron-down] size-4 transition-transform" 
                :class="{ 'rotate-180': openDropdowns.status }"></span>
        </button>
        <ul 
          class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 
                 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white" 
          :class="{ 'opacity-100': openDropdowns.status, 'opacity-0 pointer-events-none': !openDropdowns.status }"
          role="menu" 
          aria-orientation="vertical"
        >
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('status', '')">Filter by Status</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('status', 'active')">Active</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('status', 'out of service')">Out of Service</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('status', 'under maintenance')">Under Maintenance</a></li>
        </ul>
      </div>

      <!-- Filter by Machine Location -->
      <div>
        <input
          v-model="filters.location"
          type="text"
          placeholder="Filter by Machine Location"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <!-- Action Buttons -->
      <div class="md:col-span-2 flex justify-end gap-2">
        <button
          @click="clearFilters"
          class="btn btn-outline btn-error flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          Clear
        </button>
        
        <button
          @click="applyFilters"
          class="btn btn-primary flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"/>
          </svg>
          Apply Filters
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits,onUnmounted,onMounted} from 'vue'

const emit = defineEmits(['filter-change'])

const filters = ref({
  machineCode: '',
  machineName: '',
  type: '',
  department: '',
  status: '',
  location: ''
})

const openDropdowns = ref({
  type: false,
  department: false,
  status: false
})

const typeDropdownRef = ref(null)
const departmentDropdownRef = ref(null)
const statusDropdownRef = ref(null)

const applyFilters = () => {
  emit('filter-change', filters.value)
}

const clearFilters = () => {
  filters.value = {
    machineCode: '',
    machineName: '',
    type: '',
    department: '',
    status: '',
    location: ''
  }
  
  emit('filter-change', filters.value)
}

const toggleDropdown = (dropdownName) => {
  Object.keys(openDropdowns.value).forEach(key => {
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
  Object.keys(openDropdowns.value).forEach(key => {
    openDropdowns.value[key] = false
  })
}

const handleClickOutside = (event) => {
  const dropdownRefs = [typeDropdownRef.value, departmentDropdownRef.value, statusDropdownRef.value]
  const isClickInside = dropdownRefs.some(ref => ref && ref.closest('.dropdown') && ref.closest('.dropdown').contains(event.target))
  if (!isClickInside) {
    closeAllDropdowns()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>