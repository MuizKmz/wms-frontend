<template>
  <teleport to="body">
    <transition enter-active-class="transition-opacity duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-250 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0" @after-leave="unlockScroll">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center" aria-hidden="false" @click.self="closeModal" @keydown.esc="closeModal" @keydown.tab.prevent="handleTabKey">
        <div class="absolute inset-0 bg-black/50"></div>
        <transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 scale-95 translate-y-4" enter-to-class="opacity-100 scale-100 translate-y-0" leave-active-class="transition-all duration-250 ease-in" leave-from-class="opacity-100 scale-100 translate-y-0" leave-to-class="opacity-0 scale-95 translate-y-4" appear>
          <div v-if="isOpen" ref="panelRef" class="relative z-10 w-full max-w-xl mx-4 max-h-[90vh] flex flex-col" @click.stop role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col min-h-0 max-h-[90vh]">
              <div class="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 id="modal-title" class="text-lg font-semibold text-gray-900 dark:text-white">Edit Location</h2>
                <button type="button" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" @click="closeModal" :disabled="isSubmitting" aria-label="Close modal">✕</button>
              </div>
              <div class="space-y-4 overflow-y-auto p-6 flex-1">
                <div v-if="errors.submit" class="alert alert-error bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"><span class="block sm:inline">{{ errors.submit }}</span></div>
                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300"><span class="text-red-500">*</span> Warehouse Code</label>
                  <div class="dropdown relative inline-flex w-full" ref="warehouseDropdownRef">
                    <button type="button" :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400', { 'btn-error': errors.warehouseId, 'border-red-500': errors.warehouseId }]" :aria-expanded="openDropdowns.warehouse" @click.stop="toggleDropdown('warehouse')" @keydown.enter.space.prevent="toggleDropdown('warehouse')">{{ selectedWarehouseName || 'Select Warehouse' }}<span class="icon-[tabler--chevron-down] size-4 transition-transform" :class="{ 'rotate-180': openDropdowns.warehouse }"></span></button>
                    <ul class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white max-h-60 overflow-y-auto" :class="{ 'opacity-100 pointer-events-auto': openDropdowns.warehouse, 'opacity-0 pointer-events-none': !openDropdowns.warehouse }" role="menu" tabindex="-1">
                      <li v-for="(warehouse, index) in warehouses" :key="warehouse.id"><a role="menuitem" class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectWarehouse(warehouse)" @keydown.enter.space.prevent="selectWarehouse(warehouse)" :tabindex="openDropdowns.warehouse ? 0 : -1" :data-index="index">{{ warehouse.warehouseCode }} ({{ warehouse.name }})</a></li>
                    </ul>
                  </div>
                  <transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-1"><div v-if="errors.warehouseId" class="absolute left-0 right-0 mt-1 z-10"><p class="text-xs text-red-600 dark:text-red-400">{{ errors.warehouseId }}</p></div></transition>
                </div>
                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300"><span class="text-red-500">*</span> Location Hierarchy</label>
                  <div class="dropdown relative inline-flex w-full" ref="hierarchyDropdownRef">
                    <button type="button" :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400', { 'btn-error border-red-500': errors.hierarchy }]" :aria-expanded="openDropdowns.hierarchy" @click.stop="toggleDropdown('hierarchy')" @keydown.enter.space.prevent="toggleDropdown('hierarchy')">{{ form.hierarchy || 'Select Location Hierarchy' }}<span class="icon-[tabler--chevron-down] size-4 transition-transform" :class="{ 'rotate-180': openDropdowns.hierarchy }"></span></button>
                    <ul class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white" :class="{ 'opacity-100 pointer-events-auto': openDropdowns.hierarchy, 'opacity-0 pointer-events-none': !openDropdowns.hierarchy }" role="menu" tabindex="-1">
                      <li v-for="(hierarchy, index) in hierarchyOptions" :key="hierarchy"><a role="menuitem" class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectHierarchy(hierarchy)" @keydown.enter.space.prevent="selectHierarchy(hierarchy)" :tabindex="openDropdowns.hierarchy ? 0 : -1" :data-index="index">{{ hierarchy }}</a></li>
                    </ul>
                  </div>
                  <transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-1"><div v-if="errors.hierarchy" class="absolute left-0 right-0 mt-1 z-10"><p class="text-xs text-red-600 dark:text-red-400">{{ errors.hierarchy }}</p></div></transition>
                </div>
                <div v-if="form.hierarchy === 'Level 1'" class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300"><span class="text-red-500">*</span> Parent Location</label>
                  <div class="dropdown relative inline-flex w-full" ref="parentLocationDropdownRef">
                    <button type="button" :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400', { 'btn-error border-red-500': errors.parentLocationId }]" :aria-expanded="openDropdowns.parentLocation" @click.stop="toggleDropdown('parentLocation')" @keydown.enter.space.prevent="toggleDropdown('parentLocation')">{{ selectedParentLocationName || 'Select Parent Location' }}<span class="icon-[tabler--chevron-down] size-4 transition-transform" :class="{ 'rotate-180': openDropdowns.parentLocation }"></span></button>
                    <ul class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white max-h-60 overflow-y-auto" :class="{ 'opacity-100 pointer-events-auto': openDropdowns.parentLocation, 'opacity-0 pointer-events-none': !openDropdowns.parentLocation }" role="menu" tabindex="-1">
                      <li v-for="(location, index) in parentLocations" :key="location.id"><a role="menuitem" class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectParentLocation(location)" @keydown.enter.space.prevent="selectParentLocation(location)" :tabindex="openDropdowns.parentLocation ? 0 : -1" :data-index="index">{{ location.locationCode }} - {{ location.locationName }}</a></li>
                    </ul>
                  </div>
                  <transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-1"><div v-if="errors.parentLocationId" class="absolute left-0 right-0 mt-1 z-10"><p class="text-xs text-red-600 dark:text-red-400">{{ errors.parentLocationId }}</p></div></transition>
                </div>
                <div v-if="form.hierarchy === 'Level 2'" class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300"><span class="text-red-500">*</span> Parent Location</label>
                  <div class="dropdown relative inline-flex w-full" ref="parentLocationDropdownRef">
                    <button type="button" :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400', { 'btn-error border-red-500': errors.parentLocationId }]" :aria-expanded="openDropdowns.parentLocation" @click.stop="toggleDropdown('parentLocation')" @keydown.enter.space.prevent="toggleDropdown('parentLocation')">{{ selectedParentLocationName || 'Select Parent Location' }}<span class="icon-[tabler--chevron-down] size-4 transition-transform" :class="{ 'rotate-180': openDropdowns.parentLocation }"></span></button>
                    <ul class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white max-h-60 overflow-y-auto" :class="{ 'opacity-100 pointer-events-auto': openDropdowns.parentLocation, 'opacity-0 pointer-events-none': !openDropdowns.parentLocation }" role="menu" tabindex="-1">
                      <li v-for="(location, index) in parentLocations" :key="location.id"><a role="menuitem" class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectParentLocation(location)" @keydown.enter.space.prevent="selectParentLocation(location)" :tabindex="openDropdowns.parentLocation ? 0 : -1" :data-index="index">{{ location.locationCode }} - {{ location.locationName }}</a></li>
                    </ul>
                  </div>
                  <transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-1"><div v-if="errors.parentLocationId" class="absolute left-0 right-0 mt-1 z-10"><p class="text-xs text-red-600 dark:text-red-400">{{ errors.parentLocationId }}</p></div></transition>
                </div>
                <div v-if="form.hierarchy === 'Level 2'" class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300"><span class="text-red-500">*</span> Level 1 Location</label>
                  <div class="dropdown relative inline-flex w-full" ref="child1LocationDropdownRef">
                    <button type="button" :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400', { 'btn-error border-red-500': errors.child1LocationId }]" :aria-expanded="openDropdowns.child1Location" @click.stop="toggleDropdown('child1Location')" @keydown.enter.space.prevent="toggleDropdown('child1Location')" :disabled="!form.parentLocationId">{{ selectedChild1LocationName || 'Select Level 1 Location' }}<span class="icon-[tabler--chevron-down] size-4 transition-transform" :class="{ 'rotate-180': openDropdowns.child1Location }"></span></button>
                    <ul class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white max-h-60 overflow-y-auto" :class="{ 'opacity-100 pointer-events-auto': openDropdowns.child1Location, 'opacity-0 pointer-events-none': !openDropdowns.child1Location }" role="menu" tabindex="-1">
                      <li v-for="(location, index) in child1Locations" :key="location.id"><a role="menuitem" class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectChild1Location(location)" @keydown.enter.space.prevent="selectChild1Location(location)" :tabindex="openDropdowns.child1Location ? 0 : -1" :data-index="index">{{ location.locationCode }} - {{ location.locationName }}</a></li>
                    </ul>
                  </div>
                  <transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-1"><div v-if="errors.child1LocationId" class="absolute left-0 right-0 mt-1 z-10"><p class="text-xs text-red-600 dark:text-red-400">{{ errors.child1LocationId }}</p></div></transition>
                </div>
                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300"><span class="text-red-500">*</span> Location Code</label>
                  <input v-model="form.locationCode" type="text" placeholder="Enter Location Code" maxlength="20" :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error border-red-500': errors.locationCode }]" />
                  <transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-1"><div v-if="errors.locationCode" class="absolute left-0 right-0 mt-1 z-10"><p class="text-xs text-red-600 dark:text-red-400">{{ errors.locationCode }}</p></div></transition>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div class="relative">
                    <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300"><span class="text-red-500">*</span> Location Name</label>
                    <input v-model="form.locationName" type="text" placeholder="Enter Location Name" maxlength="100" :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error border-red-500': errors.locationName }]" />
                    <transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-1"><div v-if="errors.locationName" class="absolute left-0 right-0 mt-1 z-10"><p class="text-xs text-red-600 dark:text-red-400">{{ errors.locationName }}</p></div></transition>
                  </div>
                  <div class="relative">
                    <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300"><span class="text-red-500">*</span> Location Capacity</label>
                    <div class="flex gap-2">
                      <input v-model.number="form.locationCapacity" type="number" placeholder="10" min="0" :class="['input input-bordered flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error border-red-500': errors.locationCapacity }]" />
                      <div class="dropdown relative inline-flex" ref="unitDropdownRef">
                        <button type="button" :class="['dropdown-toggle btn btn-outline justify-between dark:bg-gray-700 dark:text-gray-400 min-w-[100px]', { 'btn-error border-red-500': errors.unit }]" :aria-expanded="openDropdowns.unit" @click.stop="toggleDropdown('unit')" @keydown.enter.space.prevent="toggleDropdown('unit')">{{ form.unit || 'UoM' }}<span class="icon-[tabler--chevron-down] size-4 transition-transform" :class="{ 'rotate-180': openDropdowns.unit }"></span></button>
                        <ul class="dropdown-menu min-w-full transition-opacity duration-200 absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white" :class="{ 'opacity-100 pointer-events-auto': openDropdowns.unit, 'opacity-0 pointer-events-none': !openDropdowns.unit }" role="menu" tabindex="-1">
                          <li v-for="(unit, index) in unitOptions" :key="unit"><a role="menuitem" class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer whitespace-nowrap" @click="selectOption('unit', unit)" @keydown.enter.space.prevent="selectOption('unit', unit)" :tabindex="openDropdowns.unit ? 0 : -1" :data-index="index">{{ unit }}</a></li>
                        </ul>
                      </div>
                    </div>
                    <transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-1"><div v-if="errors.locationCapacity || errors.unit" class="absolute left-0 right-0 mt-1 z-10"><p class="text-xs text-red-600 dark:text-red-400">{{ errors.locationCapacity || errors.unit }}</p></div></transition>
                  </div>
                </div>
                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300"><span class="text-red-500">*</span> Storage Type</label>
                  <input 
                    v-model="form.type" 
                    type="text" 
                    placeholder="Enter Storage Type" 
                    maxlength="50" 
                    :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error border-red-500': errors.type }]"
                    @input="handleTypeInput"
                    @focus="showTypeSuggestions = true"
                  />
                  <!-- Suggestions dropdown -->
                  <ul 
                    v-if="showTypeSuggestions && filteredTypeSuggestions.length > 0"
                    class="absolute top-full left-0 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto"
                  >
                    <li 
                      v-for="(suggestion, index) in filteredTypeSuggestions" 
                      :key="index"
                      class="px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      @click="selectTypeSuggestion(suggestion)"
                    >
                      {{ suggestion }}
                    </li>
                  </ul>
                  <transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-1"><div v-if="errors.type" class="absolute left-0 right-0 mt-1 z-10"><p class="text-xs text-red-600 dark:text-red-400">{{ errors.type }}</p></div></transition>
                </div>
                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300"><span class="text-red-500">*</span> Status</label>
                  <div class="dropdown relative inline-flex w-full" ref="statusDropdownRef">
                    <button type="button" :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400', { 'btn-error border-red-500': errors.status }]" :aria-expanded="openDropdowns.status" @click.stop="toggleDropdown('status')" @keydown.enter.space.prevent="toggleDropdown('status')">{{ form.status || 'Select Location Status' }}<span class="icon-[tabler--chevron-down] size-4 transition-transform" :class="{ 'rotate-180': openDropdowns.status }"></span></button>
                    <ul class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white" :class="{ 'opacity-100 pointer-events-auto': openDropdowns.status, 'opacity-0 pointer-events-none': !openDropdowns.status }" role="menu" tabindex="-1">
                      <li v-for="(status, index) in statusOptions" :key="status"><a role="menuitem" class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('status', status)" @keydown.enter.space.prevent="selectOption('status', status)" :tabindex="openDropdowns.status ? 0 : -1" :data-index="index">{{ status }}</a></li>
                    </ul>
                  </div>
                  <transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-1"><div v-if="errors.status" class="absolute left-0 right-0 mt-1 z-10"><p class="text-xs text-red-600 dark:text-red-400">{{ errors.status }}</p></div></transition>
                </div>
                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">Remarks</label>
                  <textarea v-model="form.remarks" placeholder="Remarks ..." maxlength="500" rows="3" :class="['textarea textarea-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none', { 'textarea-error border-red-500': errors.remarks }]"></textarea>
                  <transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-1"><div v-if="errors.remarks" class="absolute left-0 right-0 mt-1 z-10"><p class="text-xs text-red-600 dark:text-red-400">{{ errors.remarks }}</p></div></transition>
                </div>
              </div>
              <div class="flex justify-end gap-2 p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button @click="closeModal" class="btn btn-outline btn-error" :disabled="isSubmitting">Cancel</button>
                <button @click="submitForm" class="btn btn-primary" :disabled="isSubmitting"><span v-if="isSubmitting" class="loading loading-spinner loading-sm mr-2"></span>{{ isSubmitting ? 'Updating...' : 'Update' }}</button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { authenticatedFetch } from '@/utils/authenticatedFetch'

const props = defineProps({
  locationId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['item-updated'])

const isOpen = ref(false)
const isSubmitting = ref(false)
const panelRef = ref(null)
const statusDropdownRef = ref(null)
const warehouseDropdownRef = ref(null)
const hierarchyDropdownRef = ref(null)
const parentLocationDropdownRef = ref(null)
const child1LocationDropdownRef = ref(null)
const unitDropdownRef = ref(null)

const warehouses = ref([])
const selectedWarehouseName = ref('')
const parentLocations = ref([])
const selectedParentLocationName = ref('')
const child1Locations = ref([])
const selectedChild1LocationName = ref('')
const currentLocationId = ref(null)

const form = reactive({
  warehouseId: null,
  hierarchy: '',
  parentLocationId: null,
  child1LocationId: null,
  locationCode: '',
  locationName: '',
  locationCapacity: null,
  unit: '',
  type: '',
  status: 'Active',
  remarks: ''
})

const errors = reactive({
  warehouseId: '',
  hierarchy: '',
  parentLocationId: '',
  child1LocationId: '',
  locationCode: '',
  locationName: '',
  locationCapacity: '',
  unit: '',
  type: '',
  status: '',
  remarks: '',
  submit: ''
})

const statusOptions = ['Active', 'Inactive']
const typeSuggestions = ref(['Storage', 'Picking', 'Staging', 'Quarantine', 'Dispatch'])
const showTypeSuggestions = ref(false)
const hierarchyOptions = ['Level 0', 'Level 1', 'Level 2']
const unitOptions = ['Pallet', 'Box', 'Piece', 'Kg', 'Ton', 'M³', 'Container']
const openDropdowns = reactive({ 
  status: false, 
  warehouse: false, 
  hierarchy: false, 
  parentLocation: false, 
  child1Location: false,
  unit: false 
})

// Computed property for filtered type suggestions
const filteredTypeSuggestions = computed(() => {
  if (!form.type) return typeSuggestions.value
  return typeSuggestions.value.filter(suggestion => 
    suggestion.toLowerCase().includes(form.type.toLowerCase())
  )
})

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

const fetchParentLocations = async () => {
  if (!form.warehouseId) return
  
  try {
    let hierarchyFilter = ''
    if (form.hierarchy === 'Level 1') {
      hierarchyFilter = '?hierarchy=Level 0'
    } else if (form.hierarchy === 'Level 2') {
      hierarchyFilter = '?hierarchy=Level 0'
    }
    
    const response = await authenticatedFetch(`/api/location${hierarchyFilter}&warehouseId=${form.warehouseId}`)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(errorData.message || `Failed to fetch parent locations with status: ${response.status}`)
    }
    const json = await response.json()
    parentLocations.value = json || []
  } catch (e) {
    console.error('Error fetching parent locations:', e)
    errors.submit = e.message || 'Failed to load parent locations.'
  }
}

const fetchChild1Locations = async () => {
  if (!form.parentLocationId) return
  
  try {
    const response = await authenticatedFetch(`/api/location?hierarchy=Level 1&parentId=${form.parentLocationId}`)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(errorData.message || `Failed to fetch child locations with status: ${response.status}`)
    }
    const json = await response.json()
    child1Locations.value = json || []
  } catch (e) {
    console.error('Error fetching level 1 locations:', e)
    errors.submit = e.message || 'Failed to load level 1 locations.'
  }
}

const fetchLocationDetails = async (locationId) => {
  if (!locationId) return
  
  try {
    const response = await authenticatedFetch(`/api/location/${locationId}`)
    if (!response.ok) throw new Error('Failed to fetch location details')
    const location = await response.json()

    // Populate form with fetched data
    form.warehouseId = location.warehouse?.id || location.warehouseId
    form.hierarchy = location.hierarchy || ''
    form.parentLocationId = location.parentLocationId || location.parentLocation?.id || null
    form.child1LocationId = location.child1LocationId || location.child1Location?.id || null
    form.locationCode = location.locationCode || ''
    form.locationName = location.locationName || location.name || ''
    form.locationCapacity = location.locationCapacity || location.capacity || null
    form.unit = location.unit || ''
    form.type = location.type || location.locationType || ''
    form.status = location.status || 'Active'
    form.remarks = location.remarks || location.description || ''

    // Set warehouse name for display
    if (form.warehouseId && warehouses.value.length > 0) {
      const warehouse = warehouses.value.find((w) => w.id === form.warehouseId)
      if (warehouse) {
        selectedWarehouseName.value = warehouse.warehouseCode
      }
    }

    // Fetch parent locations if Level 1 or 2
    if (form.hierarchy === 'Level 1' || form.hierarchy === 'Level 2') {
      await fetchParentLocations()
      
      // Set parent location name for display
      if (form.parentLocationId && parentLocations.value.length > 0) {
        const parentLoc = parentLocations.value.find((loc) => loc.id === form.parentLocationId)
        if (parentLoc) {
          selectedParentLocationName.value = `${parentLoc.locationCode} - ${parentLoc.locationName}`
        }
      }
    }

    // Fetch child1 locations if Level 2
    if (form.hierarchy === 'Level 2' && form.parentLocationId) {
      await fetchChild1Locations()
      
      // Set child1 location name for display
      if (form.child1LocationId && child1Locations.value.length > 0) {
        const child1Loc = child1Locations.value.find((loc) => loc.id === form.child1LocationId)
        if (child1Loc) {
          selectedChild1LocationName.value = `${child1Loc.locationCode} - ${child1Loc.locationName}`
        }
      }
    }
  } catch (error) {
    console.error('Error fetching location details:', error)
    errors.submit = 'Failed to load location details'
  }
}

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

  if (!form.hierarchy) {
    errors.hierarchy = 'Location Hierarchy is required'
    isValid = false
  }

  if ((form.hierarchy === 'Level 1' || form.hierarchy === 'Level 2') && !form.parentLocationId) {
    errors.parentLocationId = 'Parent Location is required'
    isValid = false
  }

  if (form.hierarchy === 'Level 2' && !form.child1LocationId) {
    errors.child1LocationId = 'Level 1 Location is required'
    isValid = false
  }

  if (!form.locationCode.trim()) {
    errors.locationCode = 'Location Code is required'
    isValid = false
  } else if (form.locationCode.length > 20) {
    errors.locationCode = 'Location Code cannot exceed 20 characters'
    isValid = false
  }

  if (!form.locationName.trim()) {
    errors.locationName = 'Location Name is required'
    isValid = false
  } else if (form.locationName.length < 3) {
    errors.locationName = 'Location Name must be at least 3 characters'
    isValid = false
  } else if (form.locationName.length > 100) {
    errors.locationName = 'Location Name cannot exceed 100 characters'
    isValid = false
  }

  if (!form.locationCapacity || form.locationCapacity <= 0) {
    errors.locationCapacity = 'Location Capacity must be greater than 0'
    isValid = false
  }

  if (!form.unit) {
    errors.unit = 'Unit of Measure is required'
    isValid = false
  }

  if (!form.type) {
    errors.type = 'Storage Type is required'
    isValid = false
  }

  if (!form.status) {
    errors.status = 'Status is required'
    isValid = false
  }

  if (form.remarks && form.remarks.length > 500) {
    errors.remarks = 'Remarks cannot exceed 500 characters'
    isValid = false
  }

  return isValid
}

// Clear error when user interacts with field
watch(() => form.warehouseId, () => { if (errors.warehouseId) errors.warehouseId = '' })
watch(() => form.hierarchy, () => { if (errors.hierarchy) errors.hierarchy = '' })
watch(() => form.parentLocationId, () => { if (errors.parentLocationId) errors.parentLocationId = '' })
watch(() => form.child1LocationId, () => { if (errors.child1LocationId) errors.child1LocationId = '' })
watch(() => form.locationCode, () => { if (errors.locationCode) errors.locationCode = '' })
watch(() => form.locationName, () => { if (errors.locationName) errors.locationName = '' })
watch(() => form.locationCapacity, () => { if (errors.locationCapacity) errors.locationCapacity = '' })
watch(() => form.unit, () => { if (errors.unit) errors.unit = '' })
watch(() => form.type, () => { if (errors.type) errors.type = '' })
watch(() => form.status, () => { if (errors.status) errors.status = '' })
watch(() => form.remarks, () => { if (errors.remarks) errors.remarks = '' })

// Watch for hierarchy changes
watch(() => form.hierarchy, (newVal) => {
  if (newVal === 'Level 0') {
    form.parentLocationId = null
    form.child1LocationId = null
    selectedParentLocationName.value = ''
    selectedChild1LocationName.value = ''
  } else if (newVal === 'Level 1') {
    form.child1LocationId = null
    selectedChild1LocationName.value = ''
    fetchParentLocations()
  } else if (newVal === 'Level 2') {
    fetchParentLocations()
  }
})

// Watch for parent location changes
watch(() => form.parentLocationId, (newVal) => {
  if (form.hierarchy === 'Level 2' && newVal) {
    fetchChild1Locations()
  }
})

// Watch for warehouse changes
watch(() => form.warehouseId, () => {
  if (form.hierarchy === 'Level 1' || form.hierarchy === 'Level 2') {
    fetchParentLocations()
  }
})

/* Type autocomplete handlers */
const handleTypeInput = () => {
  // Show suggestions when typing
  showTypeSuggestions.value = true
}

const selectTypeSuggestion = (suggestion) => {
  form.type = suggestion
  showTypeSuggestions.value = false
  
  // Add to suggestions if not already present
  if (!typeSuggestions.value.includes(suggestion)) {
    typeSuggestions.value.push(suggestion)
  }
}

/* helpers */
const toggleDropdown = (name) => {
  Object.keys(openDropdowns).forEach(k => { if (k !== name) openDropdowns[k] = false })
  openDropdowns[name] = !openDropdowns[name]

  if (openDropdowns[name]) {
    nextTick(() => {
      const dropdownRef = 
        name === 'warehouse' ? warehouseDropdownRef : 
        name === 'status' ? statusDropdownRef :
        name === 'hierarchy' ? hierarchyDropdownRef :
        name === 'parentLocation' ? parentLocationDropdownRef :
        name === 'child1Location' ? child1LocationDropdownRef :
        unitDropdownRef
      dropdownRef.value?.querySelector('a[role="menuitem"]')?.focus()
    })
  } else {
    const dropdownRef = 
      name === 'warehouse' ? warehouseDropdownRef : 
      name === 'status' ? statusDropdownRef :
      name === 'hierarchy' ? hierarchyDropdownRef :
      name === 'parentLocation' ? parentLocationDropdownRef :
      name === 'child1Location' ? child1LocationDropdownRef :
      unitDropdownRef
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

const selectHierarchy = (hierarchy) => {
  form.hierarchy = hierarchy
  openDropdowns.hierarchy = false
}

const selectParentLocation = (location) => {
  form.parentLocationId = location.id
  selectedParentLocationName.value = `${location.locationCode} - ${location.locationName}`
  openDropdowns.parentLocation = false
}

const selectChild1Location = (location) => {
  form.child1LocationId = location.id
  selectedChild1LocationName.value = `${location.locationCode} - ${location.locationName}`
  openDropdowns.child1Location = false
}

/* close dropdowns when clicking outside */
const handleClickOutside = (event) => {
  // Don't handle clicks if modal is not open
  if (!isOpen.value) return
  
  const dropdowns = {
    status: statusDropdownRef.value,
    warehouse: warehouseDropdownRef.value,
    hierarchy: hierarchyDropdownRef.value,
    parentLocation: parentLocationDropdownRef.value,
    child1Location: child1LocationDropdownRef.value,
    unit: unitDropdownRef.value
  }

  Object.keys(openDropdowns).forEach(k => {
    if (openDropdowns[k] && dropdowns[k] && !dropdowns[k].contains(event.target)) {
      openDropdowns[k] = false
    }
  })
  
  // Close type suggestions when clicking outside
  if (showTypeSuggestions.value && panelRef.value) {
    const typeInput = panelRef.value.querySelector('input[placeholder="Enter Storage Type"]')
    const suggestionList = panelRef.value.querySelector('ul.absolute.top-full')
    
    if (typeInput && !typeInput.contains(event.target) && 
        (!suggestionList || !suggestionList.contains(event.target))) {
      showTypeSuggestions.value = false
    }
  }
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
const openModal = async () => {
  // Reset errors
  Object.keys(errors).forEach(key => errors[key] = '')

  // Fetch warehouses first
  await fetchWarehouses()

  // Use locationId from prop if available
  if (props.locationId) {
    currentLocationId.value = props.locationId
    await fetchLocationDetails(props.locationId)
  }

  isOpen.value = true
  lockScroll()
  await nextTick()
  panelRef.value?.querySelector('button[aria-label="Close modal"]')?.focus()
}

const closeModal = async () => {
  openDropdowns.status = false
  openDropdowns.warehouse = false
  openDropdowns.hierarchy = false
  openDropdowns.parentLocation = false
  openDropdowns.child1Location = false
  openDropdowns.unit = false
  showTypeSuggestions.value = false

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
      hierarchy: form.hierarchy,
      parentLocationId: form.parentLocationId,
      child1LocationId: form.child1LocationId,
      locationCode: form.locationCode.toUpperCase(),
      locationName: form.locationName,
      locationCapacity: form.locationCapacity,
      unit: form.unit,
      type: form.type,
      status: form.status,
      remarks: form.remarks || null
    }

    console.log('Submitting data:', submissionData)

    const response = await authenticatedFetch(`/api/location/${currentLocationId.value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData)
    })

    if (!response.ok) {
      let errorMessage = `Failed to update location (HTTP ${response.status}).`
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

    // Save the type to suggestions if not already present
    if (form.type && !typeSuggestions.value.includes(form.type)) {
      typeSuggestions.value.push(form.type)
      // Optionally save to localStorage for persistence
      localStorage.setItem('locationTypeSuggestions', JSON.stringify(typeSuggestions.value))
    }

    await closeModal()

    emit('item-updated', { success: true, data })

  } catch (error) {
    console.error('Error updating location:', error)
    errors.submit = error.message || 'An unknown error occurred. Failed to update location.'
    emit('item-updated', { success: false, error: error.message || 'Failed to update location' })
  } finally {
    isSubmitting.value = false
  }
}

/* lifecycle */
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  // Load saved type suggestions from localStorage
  const savedSuggestions = localStorage.getItem('locationTypeSuggestions')
  if (savedSuggestions) {
    try {
      const parsed = JSON.parse(savedSuggestions)
      if (Array.isArray(parsed)) {
        typeSuggestions.value = [...new Set([...typeSuggestions.value, ...parsed])]
      }
    } catch (e) {
      console.error('Error loading type suggestions:', e)
    }
  }
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