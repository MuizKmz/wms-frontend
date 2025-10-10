<template>
  <div class="overflow-visible">

    <div class="mb-4 flex items-center gap-4 mt-5">
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
          Warehouse :
        </label>
        <div class="dropdown relative inline-flex w-64" ref="warehouseDropdownRef">
          <button
            type="button"
            class="dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400 text-left"
            :aria-expanded="isWarehouseDropdownOpen"
            @click.stop="toggleWarehouseDropdown"
            :disabled="loadingWarehouses"
          >
            <span class="truncate pr-2">{{ selectedWarehouseName || 'Select Warehouse' }}</span>
            <span
              class="icon-[tabler--chevron-down] size-4 transition-transform flex-shrink-0"
              :class="{ 'rotate-180': isWarehouseDropdownOpen }"
            ></span>
          </button>

          <ul
            class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white max-h-60 overflow-y-auto"
            :class="{ 'opacity-100 pointer-events-auto': isWarehouseDropdownOpen, 'opacity-0 pointer-events-none': !isWarehouseDropdownOpen }"
            role="menu"
          >
            <li>
              <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectWarehouse(null, 'All Warehouses')">
                All Warehouses
              </a>
            </li>
            <li v-for="warehouse in warehouses" :key="warehouse.id">
              <a
                class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
                @click="selectWarehouse(warehouse.id, warehouse.warehouseCode || warehouse.name)"
                :title="warehouse.warehouseCode || warehouse.name"
              >
                <div class="truncate">
                  {{ warehouse.warehouseCode || warehouse.name }}
                </div>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
          Rack :
        </label>
        <div class="dropdown relative inline-flex w-64" ref="rackDropdownRef">
          <button
            type="button"
            class="dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400 text-left"
            :aria-expanded="isRackDropdownOpen"
            @click.stop="toggleRackDropdown"
            :disabled="loadingRacks || !selectedWarehouseId"
          >
            <span class="truncate pr-2">{{ selectedRackName || 'Select Rack' }}</span>
            <span
              class="icon-[tabler--chevron-down] size-4 transition-transform flex-shrink-0"
              :class="{ 'rotate-180': isRackDropdownOpen }"
            ></span>
          </button>

          <ul
            class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white max-h-60 overflow-y-auto"
            :class="{ 'opacity-100 pointer-events-auto': isRackDropdownOpen, 'opacity-0 pointer-events-none': !isRackDropdownOpen }"
            role="menu"
          >
            <li>
              <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectRack(null, 'All Racks')">
                All Racks
              </a>
            </li>
            <li v-for="rack in displayRacks" :key="rack.id">
              <a
                class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
                @click="selectRack(rack.id, rack.rackCode || rack.rackName)"
                :title="rack.rackCode || rack.rackName"
              >
                <div class="truncate">
                  {{ rack.rackCode || rack.rackName }}
                </div>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="max-w-full overflow-x-auto custom-scrollbar mt-5">
      <table class="min-w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Section
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Product
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Action
              </p>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="(item, index) in paginatedData" :key="index"
            class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">

            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.section || '-' }}
              </p>
            </td>

            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ item.inventory?.map(i => i.product?.name).join(', ') || '-' }}
              </p>
            </td>

            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <button
                  @click="editItem(item)"
                  class="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  aria-label="Edit"
                  title="Edit Warehouse"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button> 
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPages > 1" class="mt-6 flex justify-center">
        <nav class="flex items-center gap-x-1">
          <button type="button" class="btn btn-text dark:text-gray-300" :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)">
            Previous
          </button>

          <div class="flex items-center gap-x-1">
            <button v-for="page in totalPages" :key="page" type="button"
              class="btn btn-text btn-square aria-[current='page']:text-bg-primary dark:text-gray-300"
              :class="{ 'text-bg-primary': page === currentPage }" :aria-current="page === currentPage ? 'page' : null"
              @click="changePage(page)">
              {{ page }}
            </button>
          </div>

          <button type="button" class="btn btn-text dark:text-gray-300" :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)">
            Next
          </button>
        </nav>
      </div>

      <div v-if="loading" class="p-8 text-center text-gray-500 text-sm">
        <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
        <p>Loading data...</p>
      </div>

      <div v-if="!loading && filteredData.length === 0" class="p-8 text-center text-gray-500">
        <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No data found
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your filters.
        </p>
      </div>

      <div v-if="error" class="p-8 text-center text-red-500 text-sm">
        <svg class="mx-auto h-12 w-12 text-red-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="font-medium">Error loading data</p>
        <p class="text-xs mt-1">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onBeforeUnmount } from "vue"

// Props for receiving filters
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
})

const data = ref([])
const loading = ref(false)
const error = ref(null)
const warehouses = ref([])
const loadingWarehouses = ref(false)
const selectedWarehouseId = ref(null)
const selectedWarehouseName = ref('All Warehouses')
const isWarehouseDropdownOpen = ref(false)
const warehouseDropdownRef = ref(null)

const racks = ref([])
const loadingRacks = ref(false)
const selectedRackId = ref(null)
const selectedRackName = ref('All Racks')
const isRackDropdownOpen = ref(false)
const rackDropdownRef = ref(null)

// API endpoints
const API_URL = '/api/section'
const WAREHOUSE_API_URL = '/api/warehouse'
const RACK_API_URL = '/api/rack'

// Function to fetch warehouses
const fetchWarehouses = async () => {
  loadingWarehouses.value = true
  try {
    const response = await fetch(WAREHOUSE_API_URL)
    if (!response.ok) throw new Error('Failed to fetch warehouses')
    const json = await response.json()
    warehouses.value = json || []
  } catch (e) {
    console.error('Error fetching warehouses:', e)
  } finally {
    loadingWarehouses.value = false
  }
}

// Function to fetch racks based on selected warehouse
// This function is still needed to fetch data, but the UI filtering is guaranteed by displayRacks
const fetchRacks = async () => {
  // If no warehouse is selected, we clear the list of racks
  if (!selectedWarehouseId.value) {
    racks.value = [] 
    return
  }

  loadingRacks.value = true
  try {
    // Attempt to fetch filtered racks from the API
    const response = await fetch(`${RACK_API_URL}?warehouseId=${selectedWarehouseId.value}`)
    if (!response.ok) throw new Error('Failed to fetch racks')
    const json = await response.json()
    
    // **Assumption**: We assume the backend returns an array of rack objects, 
    // and each rack object has a 'warehouseId' property for client-side filtering below.
    racks.value = json || []
  } catch (e) {
    console.error('Error fetching racks:', e)
    racks.value = []
  } finally {
    loadingRacks.value = false
  }
}

// **CRITICAL FIX: Computed property to display only racks for the selected warehouse**
const displayRacks = computed(() => {
  if (!selectedWarehouseId.value) {
    return [] // Show no racks if 'All Warehouses' is selected (you only want racks for a specific warehouse)
  }
  
  // Apply a client-side filter to guarantee only the racks associated 
  // with the selected warehouse are shown.
  return racks.value.filter(rack => rack.warehouseId === selectedWarehouseId.value);
});


// Function to fetch data from the API
const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    // Build URL with filters
    let url = API_URL
    const params = new URLSearchParams()

    if (selectedWarehouseId.value) {
      params.append('warehouseId', selectedWarehouseId.value)
    }
    if (selectedRackId.value) {
      params.append('rackId', selectedRackId.value)
    }

    if (params.toString()) {
      url += '?' + params.toString()
    }

    const response = await fetch(url)

    if (!response.ok) throw new Error("Failed to fetch data")

    const json = await response.json()
    // Normalize section items for the UI
    data.value = (json || []).map(section => ({
      id: section.id,
      section: section.sectionName || section.sectionCode || '-',
      inventory: section.inventory || [],
      rackId: section.rack?.id || section.rackId || null,
      warehouseId: section.rack?.warehouse?.id || section.rack?.warehouseId || section.warehouseId || null,
      raw: section
    }))
  } catch (e) {
    error.value = e.message
    console.error('Error fetching data:', e)
  } finally {
    loading.value = false
  }
}

// Fetch data on component mount
onMounted(() => {
  fetchWarehouses()
  fetchData()
})

// Computed property for filtered data (for the table)
const filteredData = computed(() => {
  let filtered = data.value

  // Filter by selected warehouse (client-side backup filter)
  if (selectedWarehouseId.value !== null) {
    filtered = filtered.filter(item =>
      item.warehouseId === selectedWarehouseId.value
    )
  }

  // Filter by selected rack (client-side backup filter)
  if (selectedRackId.value !== null) {
    filtered = filtered.filter(item =>
      item.rackId === selectedRackId.value
    )
  }

  // Apply other filters
  if (!props.filters || Object.keys(props.filters).length === 0) return filtered

  return filtered.filter((item) => {
    const filters = props.filters

    if (
      filters.section &&
      !(item.section || '')
        .toLowerCase()
        .includes(filters.section.toLowerCase())
    ) {
      return false
    }
    // Added filtering for product as well (using inventory check)
    if (
        filters.product &&
        !item.inventory.some(i => 
          (i.product?.name || '').toLowerCase().includes(filters.product.toLowerCase()) || 
          (i.product?.productCode || '').toLowerCase().includes(filters.product.toLowerCase())
        )
    ) {
        return false;
    }


    return true
  })
})

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(5)
const totalPages = computed(() =>
  Math.ceil(filteredData.value.length / itemsPerPage.value)
)
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredData.value.slice(start, end)
})
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Warehouse dropdown functions
const toggleWarehouseDropdown = () => {
  isWarehouseDropdownOpen.value = !isWarehouseDropdownOpen.value
}

const selectWarehouse = (id, name) => {
  selectedWarehouseId.value = id
  selectedWarehouseName.value = name
  isWarehouseDropdownOpen.value = false

  // Reset rack selection when warehouse changes
  selectedRackId.value = null
  selectedRackName.value = 'All Racks'

  currentPage.value = 1 // Reset to first page when warehouse changes

  // Fetch racks for the newly selected warehouse
  fetchRacks()

  // Fetch sections filtered by warehouse
  fetchData()
}

// Rack dropdown functions
const toggleRackDropdown = () => {
  // Prevent opening the rack dropdown if no warehouse is selected
  if (!selectedWarehouseId.value) return
  isRackDropdownOpen.value = !isRackDropdownOpen.value
}

const selectRack = (id, name) => {
  selectedRackId.value = id
  selectedRackName.value = name
  isRackDropdownOpen.value = false
  currentPage.value = 1 // Reset to first page when rack changes

  // Fetch sections filtered by rack
  fetchData()
}

// Close dropdowns when clicking outside
const handleClickOutside = (event) => {
  if (warehouseDropdownRef.value && !warehouseDropdownRef.value.contains(event.target)) {
    isWarehouseDropdownOpen.value = false
  }
  if (rackDropdownRef.value && !rackDropdownRef.value.contains(event.target)) {
    isRackDropdownOpen.value = false
  }
}

// Add event listener for clicking outside
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

// Remove event listener on unmount
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Expose refresh method for parent component
const refreshData = () => {
  fetchData()
}

defineExpose({ refreshData })

// Watch for filter changes
watch(
  () => props.filters,
  (newFilters) => {
    console.log("Filters updated:", newFilters)
    currentPage.value = 1 // reset to first page on filter change
  },
  { deep: true }
)
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>