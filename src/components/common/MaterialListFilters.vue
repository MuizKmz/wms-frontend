<template>
  <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
      <!-- Filter by Material Name -->
      <div>
        <input
          v-model="filters.materialName"
          type="text"
          placeholder="Filter by Material Name"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <!-- Filter by Material Type -->
      <div class="dropdown relative inline-flex w-full">
        <button 
          ref="materialTypeDropdownRef"
          type="button" 
          class="dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400" 
          aria-haspopup="menu" 
          :aria-expanded="openDropdowns.materialType"
          aria-label="Filter by Material Type"
          @click="toggleDropdown('materialType')"
        >
          {{ filters.materialType || 'Filter by Material Type' }}
          <span class="icon-[tabler--chevron-down] size-4 transition-transform" :class="{ 'rotate-180': openDropdowns.materialType }"></span>
        </button>
        <ul 
          class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 
                 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white" 
          :class="{ 'opacity-100': openDropdowns.materialType, 'opacity-0 pointer-events-none': !openDropdowns.materialType }"
          role="menu" 
          aria-orientation="vertical"
        >
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('materialType', '')">Filter by Material Type</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('materialType', 'raw material')">Raw Material</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('materialType', 'consumable')">Consumable</a></li>
          <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('materialType', 'spare part')">Spare Part</a></li>
        </ul>
      </div>

      <!-- Filter by Location -->
      <div>
        <input
          v-model="filters.location"
          type="text"
          placeholder="Filter by Location"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Filter by Supplier -->
      <div>
        <input
          v-model="filters.supplier"
          type="text"
          placeholder="Filter by Supplier"
          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <!-- Filter by Batch Number -->
      <div>
        <input
          v-model="filters.batchNumber"
          type="text"
          placeholder="Filter by Batch Number"
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
import { ref, defineEmits, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['filter-change'])

const filters = ref({
  materialName: '',
  materialType: '',
  location: '',
  supplier: '',
  batchNumber: ''
})

const openDropdowns = ref({
  materialType: false
})

const materialTypeDropdownRef = ref(null)

const applyFilters = () => {
  emit('filter-change', filters.value)
}

const clearFilters = () => {
  filters.value = {
    materialName: '',
    materialType: '',
    location: '',
    supplier: '',
    batchNumber: ''
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
  const dropdownRefs = [materialTypeDropdownRef.value]
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