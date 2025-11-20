<template>
  <div class="relative inline-block text-left" ref="containerRef">
    <!-- ⚙️ Settings Button -->
    <button
      @click="toggleDropdown1"
      class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
      title="Select columns to display"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
        />
      </svg>
      <span>Select Columns</span>
    </button>

    <!-- Dropdown Menu - Fixed positioning -->
    <div
      v-if="open"
      class="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[9999] w-72"
      :style="dropdownStyle"
      @click.stop
    >
      <div class="p-4 max-h-80 overflow-hidden flex flex-col">
        <!-- Header -->
        <div
          class="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0"
        >
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Select Columns to Display
          </h3>
          <button
            @click="toggleAll"
            class="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            {{ isAllSelected ? 'Deselect All' : 'Select All' }}
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-sm text-gray-400 text-center py-6 flex-shrink-0">
          <div
            class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"
          ></div>
          <p>Loading columns...</p>
        </div>

        <!-- Column List -->
        <div v-else class="flex-1 overflow-y-auto custom-scrollbar space-y-1">
          <label
            v-for="col in availableColumns"
            :key="col"
            class="flex items-center space-x-3 py-2.5 px-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <input
              type="checkbox"
              v-model="selectedColumns"
              :value="col"
              class="checkbox checkbox-sm checkbox-primary"
            />
            <span class="text-sm text-gray-700 dark:text-gray-200 flex-1">
              {{ col === 'name' ? 'Category Name' : col === 'categoryCode' ? 'Category Code' : col === 'rack' ? 'Location Code' : formatColumnName(col) }}
            </span>
          </label>
        </div>

        <!-- Footer Actions -->
        <div
          class="flex justify-between items-center mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0"
        >
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ selectedColumns.length }} of {{ availableColumns.length }} selected
          </span>
          <div class="flex gap-2">
            <button
              @click="cancel"
              class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              @click="applySelection"
              class="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="selectedColumns.length === 0"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Overlay to close dropdown when clicking outside -->
    <div v-if="open" class="fixed inset-0 z-40" @click="open = false"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { authenticatedFetch } from '@/utils/authenticatedFetch'

const props = defineProps({
  apiUrl: {
    type: String,
    required: true,
  },
  storageKey: {
    type: String,
    default: null,
  },
  excludeColumns: {
    type: Array,
    default: () => ['racks', 'sections', 'receivings'],
  },
  availableColumns: {
    type: Array,
    default: null,
  },
})

const emit = defineEmits(['update:selected'])

const open = ref(false)
const loading = ref(false)
const availableColumns = ref([])
const selectedColumns = ref([])
const initialSelection = ref([])
const containerRef = ref(null)
const dropdownStyle = ref({})

const calculatePosition = () => {
  if (!containerRef.value) return

  nextTick(() => {
    const rect = containerRef.value.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth

    const dropdownWidth = 288
    const dropdownHeight = 400

    let top = rect.bottom + window.scrollY
    let left = rect.right - dropdownWidth + window.scrollX

    // Adjust if goes beyond bottom
    if (rect.bottom + dropdownHeight > viewportHeight && rect.top > dropdownHeight) {
      top = rect.top + window.scrollY - dropdownHeight - 8
    }

    // Adjust if goes beyond right
    if (left + dropdownWidth > viewportWidth) {
      left = viewportWidth - dropdownWidth - 8
    }

    // Adjust if goes beyond left
    if (left < 8) {
      left = 8
    }

    dropdownStyle.value = {
      top: `${top}px`,
      left: `${left}px`,
      width: `${dropdownWidth}px`,
      maxHeight: `${Math.min(dropdownHeight, viewportHeight - 40)}px`,
    }
  })
}

/**
 * Format column name for display
 */
const formatColumnName = (name) => {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

/**
 * Check if all columns are selected
 */
const isAllSelected = computed(() => {
  return selectedColumns.value.length === availableColumns.value.length
})

/**
 * Fetch columns from API
 */
const fetchColumns = async () => {
  loading.value = true
  try {
    if (props.availableColumns && props.availableColumns.length > 0) {
      availableColumns.value = props.availableColumns

      if (props.storageKey) {
        const saved = localStorage.getItem(props.storageKey)
        if (saved) {
          try {
            const savedCols = JSON.parse(saved)
              // Apply saved columns but ensure preferred ordering for name and categoryCode
              const filtered = savedCols.filter((col) => props.availableColumns.includes(col))
              // Reorder if necessary
              const ordered = [...filtered]
              const nameIdxS = ordered.findIndex((c) => c === 'name')
              if (nameIdxS > -1) ordered.splice(0, 0, ...ordered.splice(nameIdxS, 1))
              const codeIdxS = ordered.findIndex((c) => c === 'categoryCode')
              const desiredIdxS = ordered.findIndex((c) => c === 'name')
              if (codeIdxS > -1 && desiredIdxS > -1) {
                const removedS = ordered.splice(codeIdxS, 1)[0]
                ordered.splice(desiredIdxS + 1, 0, removedS)
              }
              selectedColumns.value = ordered
          } catch (e) {
            console.error('Failed to parse saved columns:', e)
          }
        }
      }

      if (selectedColumns.value.length === 0) {
        // Ensure 'name' is first and 'categoryCode' second when available
        const ordered = [...props.availableColumns]
        const nameIdx = ordered.findIndex((c) => c === 'name')
        if (nameIdx > -1) ordered.splice(0, 0, ...ordered.splice(nameIdx, 1))
        const codeIdx = ordered.findIndex((c) => c === 'categoryCode')
        const desiredIdx = ordered.findIndex((c) => c === 'name')
        if (codeIdx > -1 && desiredIdx > -1) {
          const removed = ordered.splice(codeIdx, 1)[0]
          ordered.splice(desiredIdx + 1, 0, removed)
        }
        selectedColumns.value = ordered
      }

      initialSelection.value = [...selectedColumns.value]
      emit('update:selected', selectedColumns.value)
    }

    const res = await authenticatedFetch(props.apiUrl)

    if (!res.ok) throw new Error('Failed to fetch data')

    const data = await res.json()

    if (!props.availableColumns && Array.isArray(data) && data.length > 0) {
      const cols = Object.keys(data[0]).filter(
        (col) => !props.excludeColumns.map((c) => c.toLowerCase()).includes(col.toLowerCase()),
      )
      availableColumns.value = cols

      if (props.storageKey) {
        const saved = localStorage.getItem(props.storageKey)
        if (saved) {
          try {
            const savedCols = JSON.parse(saved)
              const filtered = savedCols.filter((col) => cols.includes(col))
              // Reorder saved selection to prefer 'name' and 'categoryCode'
              const ordered = [...filtered]
              const nameIdxS = ordered.findIndex((c) => c === 'name')
              if (nameIdxS > -1) ordered.splice(0, 0, ...ordered.splice(nameIdxS, 1))
              const codeIdxS = ordered.findIndex((c) => c === 'categoryCode')
              const desiredIdxS = ordered.findIndex((c) => c === 'name')
              if (codeIdxS > -1 && desiredIdxS > -1) {
                const removedS = ordered.splice(codeIdxS, 1)[0]
                ordered.splice(desiredIdxS + 1, 0, removedS)
              }
              selectedColumns.value = ordered
          } catch (e) {
            console.error('Failed to parse saved columns:', e)
          }
        }
      }

      if (selectedColumns.value.length === 0) {
        // Ensure 'name' is first and 'categoryCode' is second when present
        const ordered = [...cols]
        const nameIdx = ordered.findIndex((c) => c === 'name')
        if (nameIdx > -1) ordered.splice(0, 0, ...ordered.splice(nameIdx, 1))
        const codeIdx = ordered.findIndex((c) => c === 'categoryCode')
        const desiredIdx = ordered.findIndex((c) => c === 'name')
        if (codeIdx > -1 && desiredIdx > -1) {
          const removed = ordered.splice(codeIdx, 1)[0]
          ordered.splice(desiredIdx + 1, 0, removed)
        }
        selectedColumns.value = ordered
      }

      initialSelection.value = [...selectedColumns.value]
      emit('update:selected', selectedColumns.value)
    }
  } catch (err) {
    console.error('Failed to fetch columns:', err)
  } finally {
    loading.value = false
  }
}

/**
 * Initialize component - fetch columns on mount
 */
const initialize = async () => {
  if (props.apiUrl && availableColumns.value.length === 0) {
    await fetchColumns()
  }
}

/**
 * Toggle dropdown
 */
const toggleDropdown = () => {
  open.value = !open.value
  if (open.value && availableColumns.value.length === 0) {
    fetchColumns()
  }
}

/**
 * Toggle all columns
 */
const toggleAll = () => {
  if (isAllSelected.value) {
    selectedColumns.value = []
  } else {
    selectedColumns.value = [...availableColumns.value]
  }
}

/**
 * Cancel selection
 */
const cancel = () => {
  selectedColumns.value = [...initialSelection.value]
  open.value = false
}

/**
 * Apply selected columns
 */
const applySelection = () => {
  if (selectedColumns.value.length === 0) {
    return
  }

  console.log('应用选择并保存到localStorage:', selectedColumns.value)
  console.log('storageKey:', props.storageKey)

  // Save to localStorage
  if (props.storageKey) {
    const dataToSave = JSON.stringify(selectedColumns.value)
    console.log('保存的数据字符串:', dataToSave)
    localStorage.setItem(props.storageKey, dataToSave)
    // 立即读取以验证保存是否成功
    const readBack = localStorage.getItem(props.storageKey)
    console.log('读取回的数据:', readBack)
  } else {
    console.warn('没有提供storageKey，无法保存到localStorage')
  }

  initialSelection.value = [...selectedColumns.value]
  emit('update:selected', selectedColumns.value)
  open.value = false
}
const toggleDropdown1 = () => {
  open.value = !open.value
  if (open.value) {
    if (availableColumns.value.length === 0) {
      fetchColumns()
    }
    calculatePosition()
  }
}
// Initialize on component mount
onMounted(() => {
  initialize()
})

// Watch for API URL changes
watch(
  () => props.apiUrl,
  () => {
    availableColumns.value = []
    selectedColumns.value = []
    initialize()
  },
)
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
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

.dark .custom-scrollbar::-webkit-scrollbar-track {
  background: #374151;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #6b7280;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
