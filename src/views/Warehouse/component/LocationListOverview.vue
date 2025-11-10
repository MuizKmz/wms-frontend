<template>
  <div class="overflow-visible">
    <!-- Warehouse Dropdown Filter -->
    <div class="mb-4 flex items-center gap-2 mt-5">
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
          class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[9999] text-gray-900 dark:text-white max-h-60 overflow-y-auto"
          :class="{
            'opacity-100 pointer-events-auto': isWarehouseDropdownOpen,
            'opacity-0 pointer-events-none': !isWarehouseDropdownOpen,
          }"
          role="menu"
        >
          <li>
            <a
              class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
              @click="selectWarehouse(null, 'All Warehouses')"
            >
              All Warehouses
            </a>
          </li>
          <li v-for="warehouse in warehouses" :key="warehouse.id">
            <a
              class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
              @click="
                selectWarehouse(warehouse.id, `${warehouse.warehouseCode} - ${warehouse.name}`)
              "
              :title="`${warehouse.warehouseCode} - ${warehouse.name}`"
            >
              <div class="truncate">{{ warehouse.warehouseCode }} - {{ warehouse.name }}</div>
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div class="max-w-full overflow-x-auto custom-scrollbar mt-5">
      <table class="min-w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th class="px-6 py-3 text-left">
              <p
                class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400"
              >
                Location Name
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p
                class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400"
              >
                Location Code
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p
                class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400"
              >
                Storage Type
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p
                class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400"
              >
                Capacity
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p
                class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400"
              >
                Status
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p
                class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400"
              >
                Action
              </p>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="(row, index) in hierarchicalData"
            :key="row.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <!-- Location Name with expand/collapse -->
            <td class="px-6 py-4">
              <div
                class="flex items-center gap-2"
                :style="{ 'padding-left': row.depth * 2 + 'rem' }"
              >
                <button
                  v-if="row.hasChildren"
                  @click="toggleExpand(row.id)"
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg
                    class="w-4 h-4 transition-transform"
                    :class="{ 'rotate-90': row.isExpanded }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
                <div v-else class="w-4 h-4"></div>

                <button
                  @click="viewLocationDetails(row)"
                  class="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer text-left"
                  :class="{
                    'font-semibold': row.depth === 0,
                    'font-normal': row.depth > 0,
                  }"
                >
                  {{ row.locationName || '-' }}
                </button>
              </div>
            </td>

            <!-- Location Code -->
            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white font-mono">
                {{ row.locationCode || '-' }}
              </p>
            </td>

            <!-- Storage Type -->
            <td class="px-6 py-4">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  row.type === 'Storage'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : row.type === 'Picking'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : row.type === 'Staging'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
                ]"
              >
                {{ row.type || 'Other' }}
              </span>
            </td>

            <!-- Capacity -->
            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ row.capacity || '-' }}
              </p>
            </td>

            <!-- Status -->
            <td class="px-6 py-4">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  row.status === 'Active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : row.status === 'Inactive'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
                ]"
              >
                {{ row.status || 'Unknown' }}
              </span>
            </td>

            <!-- Action -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <button
                  @click="editItem(row)"
                  class="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  aria-label="Edit"
                  title="Edit Location"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  @click="deleteItem(row)"
                  class="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  aria-label="Delete"
                  title="Delete Location"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Loading -->
      <div v-if="loading" class="p-8 text-center text-gray-500 text-sm">
        <div
          class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"
        ></div>
        <p>Loading data...</p>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && filteredData.length === 0" class="p-8 text-center text-gray-500">
        <svg
          class="mx-auto h-12 w-12 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No data found</p>
        <p class="text-sm text-gray-500 dark:text-gray-400">Try adjusting your filters.</p>
      </div>

      <!-- Error -->
      <div v-if="error" class="p-8 text-center text-red-500 text-sm">
        <svg
          class="mx-auto h-12 w-12 text-red-300 mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <p class="font-medium">Error loading data</p>
        <p class="text-xs mt-1">{{ error }}</p>
      </div>

      <!-- FlyonUI Pagination -->
      <div class="mt-6 flex justify-center">
        <nav class="flex items-center gap-x-2">
          <!-- Previous Button -->
          <button
            type="button"
            class="btn btn-sm btn-outline dark:text-gray-300"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            Previous
          </button>

          <!-- Page Numbers -->
          <div class="flex items-center gap-x-1">
            <template v-for="page in displayPages" :key="page">
              <span v-if="page === -1" class="px-2" aria-hidden="true">...</span>
              <button
                v-else
                type="button"
                class="btn btn-sm btn-outline min-w-[40px]"
                :class="
                  page === currentPage
                    ? '!bg-blue-100 !text-blue-600 !border-blue-300 !border'
                    : 'text-gray-700 border-gray-300 hover:bg-blue-50 hover:text-blue-600'
                "
                @click="changePage(page)"
              >
                {{ page }}
              </button>
            </template>
          </div>

          <!-- Next Button -->
          <button
            type="button"
            class="btn btn-sm btn-outline dark:text-gray-300"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            Next
          </button>
        </nav>
      </div>
    </div>

    <!-- Location View Modal -->
    <LocationView ref="locationViewRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue'
import Swal from 'sweetalert2'
import { authenticatedFetch } from '@/utils/authenticatedFetch'
import LocationView from './LocationView.vue'

// Props for receiving filters
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({}),
  },
})

// Emit typed events
const emit = defineEmits(['edit-item', 'delete-item'])

const data = ref([])
const loading = ref(false)
const error = ref(null)
const warehouses = ref([])
const loadingWarehouses = ref(false)
const selectedWarehouseId = ref(null)
const selectedWarehouseName = ref('All Warehouses')
const isWarehouseDropdownOpen = ref(false)
const warehouseDropdownRef = ref(null)
const locationViewRef = ref(null)
const expandedLocations = ref([])

// API endpoint
const API_URL = '/api/location'
const WAREHOUSE_API_URL = '/api/warehouse'

// Mock data for when API fails - Comprehensive test data
const getMockData = () => [
  // ========== WAREHOUSE 1 (WH-001) - Main Warehouse ==========
  
  // Level 0 - Main Storage A1 (has 2 Level 1 children)
  {
    id: 1,
    locationCode: 'LOC-A-001',
    locationName: 'Main Storage A1',
    warehouseId: 1,
    warehouseName: 'Main Warehouse',
    warehouseCode: 'WH-001',
    type: 'Storage',
    capacity: '1000 Pallet',
    status: 'Active',
    hierarchy: 'Level 0',
    parentLocationId: null,
    child1LocationId: null,
    parentLocationCode: null,
    parentLocationName: null,
    child1LocationCode: null,
    child1LocationName: null,
    remarks: 'High capacity storage area',
  },
  // Level 1 - Aisle A1 (child of Main Storage A1, has 3 Level 2 children)
  {
    id: 2,
    locationCode: 'LOC-A-001-01',
    locationName: 'Aisle A1',
    warehouseId: 1,
    warehouseName: 'Main Warehouse',
    warehouseCode: 'WH-001',
    type: 'Picking',
    capacity: '500 Box',
    status: 'Active',
    hierarchy: 'Level 1',
    parentLocationId: 1,
    child1LocationId: null,
    parentLocationCode: 'LOC-A-001',
    parentLocationName: 'Main Storage A1',
    child1LocationCode: null,
    child1LocationName: null,
    remarks: 'Fast-moving items',
  },
  // Level 2 - Shelf A1-A (child of Aisle A1)
  {
    id: 3,
    locationCode: 'LOC-A-001-01-A',
    locationName: 'Shelf A1-A (Top)',
    warehouseId: 1,
    warehouseName: 'Main Warehouse',
    warehouseCode: 'WH-001',
    type: 'Storage',
    capacity: '100 Box',
    status: 'Active',
    hierarchy: 'Level 2',
    parentLocationId: 1,
    child1LocationId: 2,
    parentLocationCode: 'LOC-A-001',
    parentLocationName: 'Main Storage A1',
    child1LocationCode: 'LOC-A-001-01',
    child1LocationName: 'Aisle A1',
    remarks: 'Top shelf - fragile items',
  },
  // Level 2 - Shelf A1-B (child of Aisle A1)
  {
    id: 4,
    locationCode: 'LOC-A-001-01-B',
    locationName: 'Shelf A1-B (Middle)',
    warehouseId: 1,
    warehouseName: 'Main Warehouse',
    warehouseCode: 'WH-001',
    type: 'Storage',
    capacity: '150 Box',
    status: 'Active',
    hierarchy: 'Level 2',
    parentLocationId: 1,
    child1LocationId: 2,
    parentLocationCode: 'LOC-A-001',
    parentLocationName: 'Main Storage A1',
    child1LocationCode: 'LOC-A-001-01',
    child1LocationName: 'Aisle A1',
    remarks: 'Middle shelf - general storage',
  },
  // Level 2 - Shelf A1-C (child of Aisle A1)
  {
    id: 5,
    locationCode: 'LOC-A-001-01-C',
    locationName: 'Shelf A1-C (Bottom)',
    warehouseId: 1,
    warehouseName: 'Main Warehouse',
    warehouseCode: 'WH-001',
    type: 'Storage',
    capacity: '200 Box',
    status: 'Active',
    hierarchy: 'Level 2',
    parentLocationId: 1,
    child1LocationId: 2,
    parentLocationCode: 'LOC-A-001',
    parentLocationName: 'Main Storage A1',
    child1LocationCode: 'LOC-A-001-01',
    child1LocationName: 'Aisle A1',
    remarks: 'Bottom shelf - heavy items',
  },
  // Level 1 - Aisle A2 (child of Main Storage A1, has 2 Level 2 children)
  {
    id: 6,
    locationCode: 'LOC-A-001-02',
    locationName: 'Aisle A2',
    warehouseId: 1,
    warehouseName: 'Main Warehouse',
    warehouseCode: 'WH-001',
    type: 'Picking',
    capacity: '450 Box',
    status: 'Active',
    hierarchy: 'Level 1',
    parentLocationId: 1,
    child1LocationId: null,
    parentLocationCode: 'LOC-A-001',
    parentLocationName: 'Main Storage A1',
    child1LocationCode: null,
    child1LocationName: null,
    remarks: 'Secondary picking area',
  },
  // Level 2 - Shelf A2-A (child of Aisle A2)
  {
    id: 7,
    locationCode: 'LOC-A-001-02-A',
    locationName: 'Shelf A2-A',
    warehouseId: 1,
    warehouseName: 'Main Warehouse',
    warehouseCode: 'WH-001',
    type: 'Storage',
    capacity: '120 Box',
    status: 'Active',
    hierarchy: 'Level 2',
    parentLocationId: 1,
    child1LocationId: 6,
    parentLocationCode: 'LOC-A-001',
    parentLocationName: 'Main Storage A1',
    child1LocationCode: 'LOC-A-001-02',
    child1LocationName: 'Aisle A2',
    remarks: 'Electronics section',
  },
  // Level 2 - Shelf A2-B (child of Aisle A2)
  {
    id: 8,
    locationCode: 'LOC-A-001-02-B',
    locationName: 'Shelf A2-B',
    warehouseId: 1,
    warehouseName: 'Main Warehouse',
    warehouseCode: 'WH-001',
    type: 'Storage',
    capacity: '130 Box',
    status: 'Active',
    hierarchy: 'Level 2',
    parentLocationId: 1,
    child1LocationId: 6,
    parentLocationCode: 'LOC-A-001',
    parentLocationName: 'Main Storage A1',
    child1LocationCode: 'LOC-A-001-02',
    child1LocationName: 'Aisle A2',
    remarks: 'Tools section',
  },

  // Level 0 - Quarantine Zone C (standalone, no children)
  {
    id: 9,
    locationCode: 'LOC-C-001',
    locationName: 'Quarantine Zone C',
    warehouseId: 1,
    warehouseName: 'Main Warehouse',
    warehouseCode: 'WH-001',
    type: 'Quarantine',
    capacity: '200 Pallet',
    status: 'Inactive',
    hierarchy: 'Level 0',
    parentLocationId: null,
    child1LocationId: null,
    parentLocationCode: null,
    parentLocationName: null,
    child1LocationCode: null,
    child1LocationName: null,
    remarks: 'Quality control area',
  },

  // Level 0 - Shipping Dock D (has 1 Level 1 child)
  {
    id: 10,
    locationCode: 'LOC-D-001',
    locationName: 'Shipping Dock D',
    warehouseId: 1,
    warehouseName: 'Main Warehouse',
    warehouseCode: 'WH-001',
    type: 'Staging',
    capacity: '500 Pallet',
    status: 'Active',
    hierarchy: 'Level 0',
    parentLocationId: null,
    child1LocationId: null,
    parentLocationCode: null,
    parentLocationName: null,
    child1LocationCode: null,
    child1LocationName: null,
    remarks: 'Outbound shipping area',
  },
  // Level 1 - Dock D Lane 1 (child of Shipping Dock D, no Level 2 children)
  {
    id: 11,
    locationCode: 'LOC-D-001-01',
    locationName: 'Dock D Lane 1',
    warehouseId: 1,
    warehouseName: 'Main Warehouse',
    warehouseCode: 'WH-001',
    type: 'Staging',
    capacity: '100 Pallet',
    status: 'Active',
    hierarchy: 'Level 1',
    parentLocationId: 10,
    child1LocationId: null,
    parentLocationCode: 'LOC-D-001',
    parentLocationName: 'Shipping Dock D',
    child1LocationCode: null,
    child1LocationName: null,
    remarks: 'Express shipping lane',
  },

  // ========== WAREHOUSE 2 (WH-002) - North Warehouse ==========
  
  // Level 0 - Cold Storage B1 (has 2 Level 1 children)
  {
    id: 12,
    locationCode: 'LOC-B-001',
    locationName: 'Cold Storage B1',
    warehouseId: 2,
    warehouseName: 'North Warehouse',
    warehouseCode: 'WH-002',
    type: 'Storage',
    capacity: '750 Pallet',
    status: 'Active',
    hierarchy: 'Level 0',
    parentLocationId: null,
    child1LocationId: null,
    parentLocationCode: null,
    parentLocationName: null,
    child1LocationCode: null,
    child1LocationName: null,
    remarks: 'Temperature controlled -5°C',
  },
  // Level 1 - Cold Aisle B1 (child of Cold Storage B1, has 1 Level 2 child)
  {
    id: 13,
    locationCode: 'LOC-B-001-01',
    locationName: 'Cold Aisle B1',
    warehouseId: 2,
    warehouseName: 'North Warehouse',
    warehouseCode: 'WH-002',
    type: 'Storage',
    capacity: '300 Box',
    status: 'Active',
    hierarchy: 'Level 1',
    parentLocationId: 12,
    child1LocationId: null,
    parentLocationCode: 'LOC-B-001',
    parentLocationName: 'Cold Storage B1',
    child1LocationCode: null,
    child1LocationName: null,
    remarks: 'Frozen foods section',
  },
  // Level 2 - Cold Shelf B1-A (child of Cold Aisle B1)
  {
    id: 14,
    locationCode: 'LOC-B-001-01-A',
    locationName: 'Cold Shelf B1-A',
    warehouseId: 2,
    warehouseName: 'North Warehouse',
    warehouseCode: 'WH-002',
    type: 'Storage',
    capacity: '80 Box',
    status: 'Active',
    hierarchy: 'Level 2',
    parentLocationId: 12,
    child1LocationId: 13,
    parentLocationCode: 'LOC-B-001',
    parentLocationName: 'Cold Storage B1',
    child1LocationCode: 'LOC-B-001-01',
    child1LocationName: 'Cold Aisle B1',
    remarks: 'Ice cream storage',
  },
  // Level 1 - Cold Aisle B2 (child of Cold Storage B1, no Level 2 children)
  {
    id: 15,
    locationCode: 'LOC-B-001-02',
    locationName: 'Cold Aisle B2',
    warehouseId: 2,
    warehouseName: 'North Warehouse',
    warehouseCode: 'WH-002',
    type: 'Staging',
    capacity: '250 Box',
    status: 'Active',
    hierarchy: 'Level 1',
    parentLocationId: 12,
    child1LocationId: null,
    parentLocationCode: 'LOC-B-001',
    parentLocationName: 'Cold Storage B1',
    child1LocationCode: null,
    child1LocationName: null,
    remarks: 'Cold staging area',
  },
]

// Function to fetch warehouses
const fetchWarehouses = async () => {
  loadingWarehouses.value = true
  try {
    const response = await authenticatedFetch(WAREHOUSE_API_URL)
    if (!response.ok) throw new Error('Failed to fetch warehouses')
    const json = await response.json()
    warehouses.value = json || []
  } catch (e) {
    console.error('Error fetching warehouses:', e)
  } finally {
    loadingWarehouses.value = false
  }
}

// Function to fetch data from the API
const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    // Append warehouse filter if selected
    const url = selectedWarehouseId.value
      ? `${API_URL}?warehouseId=${selectedWarehouseId.value}`
      : API_URL
    const response = await authenticatedFetch(url)

    if (!response.ok) throw new Error('Failed to fetch data')

    const json = await response.json()
    // Normalize location items for the UI
    data.value = (json || []).map((location) => ({
      id: location.id,
      locationCode: location.locationCode || '-',
      locationName: location.locationName || location.name || '-',
      warehouseId: location.warehouse?.id || location.warehouseId || null,
      warehouseName: location.warehouse?.name || location.warehouseName || '-',
      warehouseCode: location.warehouse?.warehouseCode || location.warehouseCode || '-',
      type: location.type || location.locationType || 'Other',
      capacity: location.locationCapacity 
        ? `${location.locationCapacity} ${location.unit || ''}` 
        : location.capacity || '-',
      status: location.status || 'Active',
      hierarchy: location.hierarchy || 'Level 0',
      parentLocationId: location.parentLocationId || null,
      child1LocationId: location.child1LocationId || null,
      parentLocationCode: location.parentLocation?.locationCode || location.parentLocationCode || null,
      parentLocationName: location.parentLocation?.locationName || location.parentLocationName || null,
      child1LocationCode: location.child1Location?.locationCode || location.child1LocationCode || null,
      child1LocationName: location.child1Location?.locationName || location.child1LocationName || null,
      remarks: location.remarks || '-',
      raw: location,
    }))
  } catch (e) {
    error.value = e.message
    console.error('Error fetching data:', e)
    console.log('Using mock data due to API error')
    // Use mock data when API fails
    data.value = getMockData()
  } finally {
    loading.value = false
  }
}

// Fetch data on component mount
onMounted(() => {
  fetchWarehouses()
  fetchData()
  document.addEventListener('click', handleClickOutside)
})

// Remove event listener on unmount
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Computed property for filtered data
const filteredData = computed(() => {
  let filtered = data.value

  // Filter by selected warehouse
  if (selectedWarehouseId.value !== null) {
    filtered = filtered.filter((item) => item.warehouseId === selectedWarehouseId.value)
  }

  // Apply other filters
  if (!props.filters || Object.keys(props.filters).length === 0) return filtered

  return filtered.filter((item) => {
    const filters = props.filters

    if (
      filters.locationCode &&
      !(item.locationCode || '').toLowerCase().includes(filters.locationCode.toLowerCase())
    ) {
      return false
    }
    if (
      filters.locationName &&
      !(item.locationName || '').toLowerCase().includes(filters.locationName.toLowerCase())
    ) {
      return false
    }
    if (
      filters.type &&
      !(item.type || '').toLowerCase().includes(filters.type.toLowerCase())
    ) {
      return false
    }
    if (
      filters.status &&
      !(item.status || '').toLowerCase().includes(filters.status.toLowerCase())
    ) {
      return false
    }

    return true
  })
})

// Build hierarchical structure with expand/collapse
const buildHierarchy = (locations, parentId = null, depth = 0) => {
  const result = []
  const children = locations.filter(loc => {
    if (depth === 0) {
      // Level 0: Top level locations with no parent
      return loc.hierarchy === 'Level 0' && loc.parentLocationId === null
    } else if (depth === 1) {
      // Level 1: Locations where parentLocationId matches the Level 0 parent
      return loc.hierarchy === 'Level 1' && loc.parentLocationId === parentId
    } else if (depth === 2) {
      // Level 2: Locations where child1LocationId matches the Level 1 parent
      return loc.hierarchy === 'Level 2' && loc.child1LocationId === parentId
    }
    return false
  })

  children.forEach(location => {
    // Check if this location has children
    let hasChildren = false
    if (location.hierarchy === 'Level 0') {
      // Level 0 has children if any Level 1 locations have it as parent
      hasChildren = locations.some(loc => 
        loc.hierarchy === 'Level 1' && loc.parentLocationId === location.id
      )
    } else if (location.hierarchy === 'Level 1') {
      // Level 1 has children if any Level 2 locations have it as child1Location
      hasChildren = locations.some(loc => 
        loc.hierarchy === 'Level 2' && loc.child1LocationId === location.id
      )
    }
    
    result.push({
      ...location,
      depth,
      hasChildren,
      isExpanded: expandedLocations.value.includes(location.id)
    })

    if (expandedLocations.value.includes(location.id)) {
      const childLocations = buildHierarchy(locations, location.id, depth + 1)
      result.push(...childLocations)
    }
  })

  return result
}

const hierarchicalData = computed(() => {
  return buildHierarchy(filteredData.value)
})

// Toggle expand/collapse
const toggleExpand = (locationId) => {
  const index = expandedLocations.value.indexOf(locationId)
  if (index > -1) {
    expandedLocations.value.splice(index, 1)
  } else {
    expandedLocations.value.push(locationId)
  }
}

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(5)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return hierarchicalData.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(hierarchicalData.value.length / itemsPerPage.value))

// Calculate page numbers to display
const displayPages = computed(() => {
  const total = totalPages.value
  if (total <= 0) return []

  const current = currentPage.value
  const range = []

  if (total === 1) {
    return [1]
  }

  if (current > 2) {
    range.push(1)
    if (current > 3) {
      range.push(-1)
    }
  }

  if (current > 1) {
    range.push(current - 1)
  }

  range.push(current)

  if (current < total) {
    range.push(current + 1)
  }

  if (current < total - 1) {
    if (current < total - 2) {
      range.push(-1)
    }
    range.push(total)
  }

  return range
})

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

watch(
  () => props.filters,
  () => {
    currentPage.value = 1
  },
  { deep: true },
)

// Warehouse dropdown functions
const toggleWarehouseDropdown = () => {
  isWarehouseDropdownOpen.value = !isWarehouseDropdownOpen.value
}

const selectWarehouse = (id, name) => {
  selectedWarehouseId.value = id
  selectedWarehouseName.value = name
  isWarehouseDropdownOpen.value = false
  currentPage.value = 1
  fetchData()
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (warehouseDropdownRef.value && !warehouseDropdownRef.value.contains(event.target)) {
    isWarehouseDropdownOpen.value = false
  }
}

// Action handlers
const editItem = (item) => {
  emit('edit-item', { type: 'location', item })
}

// View location details in modal
const viewLocationDetails = (item) => {
  if (!locationViewRef.value) return
  locationViewRef.value.openModal(item)
}

// Delete handler
const deleteItem = async (item) => {
  if (!item || !item.id) return

  // Confirmation dialog
  const confirmResult = await Swal.fire({
    title: 'Are you sure?',
    text: `You are about to delete location: ${item.locationName || item.locationCode || item.id}. This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
  })

  if (!confirmResult.isConfirmed) {
    emit('delete-item', { success: false, error: 'Cancelled by user' })
    return
  }

  const result = { success: false, error: undefined }
  try {
    const resp = await authenticatedFetch(`${API_URL}/${item.id}`, { method: 'DELETE' })
    if (!resp.ok) {
      const body = await resp.text()
      throw new Error(body || 'Failed to delete location')
    }
    result.success = true

    // Show success notification
    Swal.fire({
      title: 'Deleted!',
      text: `Location ${item.locationName || item.locationCode || item.id} has been deleted.`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    })

    // Refresh local data
    await fetchData()
  } catch (e) {
    console.error('Error deleting location:', e)
    result.error = e.message || String(e)
    Swal.fire('Error', `Failed to delete location: ${result.error}`, 'error')
  }

  emit('delete-item', result)
}

// Expose refresh method for parent component
const refreshData = () => {
  fetchData()
}

defineExpose({ refreshData })

// Watch for filter changes
watch(
  () => props.filters,
  (newFilters) => {
    console.log('Filters updated:', newFilters)
    currentPage.value = 1
  },
  { deep: true },
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
