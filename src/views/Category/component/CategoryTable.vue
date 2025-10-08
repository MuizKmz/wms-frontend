<template>
  <div class="overflow-hidden">

    <div class="mb-4">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Showing {{ filteredData.length }} top-level categories
      </p>
    </div>

    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="min-w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th class="px-6 py-3 text-left w-12">
              <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" aria-label="select all"
                :checked="selectAll" @change="toggleSelectAll" />
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Category Name
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Category Code
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Status
              </p>
            </th>
            <th class="px-6 py-3 text-left">
              <p class="font-medium text-gray-500 text-xs uppercase tracking-wider dark:text-gray-400">
                Storage Requirements
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
          <tr v-for="row in visibleCategoryRows" :key="row.id" :class="{
              'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors': true,
              // Apply background/style based on depth
              'bg-gray-25 dark:bg-gray-900/30': row.depth > 0,
          }">
            <td class="px-6 py-4">
              <input type="checkbox" class="checkbox checkbox-primary checkbox-sm" aria-label="select item"
                :checked="isSelected(row.id)" @change="toggleItemSelection(row.id)" />
            </td>

            <td class="px-6 py-4">
              <div class="flex items-center gap-2" :style="{ 'padding-left': (row.depth * 2) + 'rem' }">
                <button v-if="row.hasChildren" @click="toggleExpand(row.id)"
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg class="w-4 h-4 transition-transform"
                    :class="{ 'rotate-90': row.isExpanded }" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div v-else class="w-4 h-4" :class="{ 'ml-6': row.depth > 0 }"></div>

                <span class="text-sm" :class="{
                    // Text color based on depth
                    'text-gray-900 dark:text-white': row.depth === 0,
                    'text-gray-700 dark:text-gray-300': row.depth > 0,
                    // BOLD ONLY PARENT CATEGORIES
                    'font-medium': row.depth === 0,
                    'font-normal': row.depth > 0
                }">
                  {{ row.name }}
                </span>
              </div>
            </td>

            <td class="px-6 py-4">
              <span class="font-mono text-sm text-gray-900 dark:text-white">
                {{ row.categoryCode }}
              </span>
            </td>

            <td class="px-6 py-4">
              <span :class="{
                'px-3 py-1 text-xs rounded-full font-medium': true,
                'bg-green-100 text-green-600': row.status === 'Active',
                'bg-blue-100 text-blue-600': row.status === 'Inactive',
                'bg-yellow-100 text-yellow-600': row.status === 'Pending'
              }">
                {{ row.status }}
              </span>
            </td>

            <td class="px-6 py-4">
              <p class="text-sm text-gray-900 dark:text-white">
                {{ row.storageRequirements || '-' }}
              </p>
            </td>

            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <button @click="editCategory(row)"
                  class="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  aria-label="Edit" title="Edit Category">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="deleteCategory(row)"
                  class="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  aria-label="Delete" title="Delete Category">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
        <p>Loading categories...</p>
      </div>

      <div v-if="!loading && filteredData.length === 0" class="p-8 text-center text-gray-500">
        <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No categories found
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your filters or create a new category.
        </p>
      </div>

      <div v-if="error" class="p-8 text-center text-red-500 text-sm">
        <svg class="mx-auto h-12 w-12 text-red-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="font-medium">Error loading categories</p>
        <p class="text-xs mt-1">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue"
import Swal from 'sweetalert2'

// Props for receiving filters
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
})

// Emits for parent component
const emit = defineEmits(['edit-category', 'delete-category'])

const data = ref([])
const loading = ref(false)
const error = ref(null)
const expandedCategories = ref([])
const selectedItems = ref([])
const selectAll = ref(false)

// API endpoint for categories
const API_URL = '/api/category'

// Function to fetch categories from the API
const fetchCategories = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(API_URL)

    if (!response.ok) throw new Error("Failed to fetch categories")

    const json = await response.json()
    data.value = json || []
  } catch (e) {
    error.value = e.message
    console.error('Error fetching categories:', e)
  } finally {
    loading.value = false
  }
}

// Fetch data on component mount
onMounted(() => {
  fetchCategories()
})

// ------------------------------------------------
// --- Category Structure & Recursion Logic ---
// ------------------------------------------------

// Check if category has subcategories (looks across all fetched data)
const hasSubcategories = (categoryId) => {
  return data.value.some(cat => cat.parentCategoryId === categoryId)
}

// Get subcategories for a parent category (looks across all fetched data)
const getSubcategories = (parentId) => {
  return data.value.filter(cat => cat.parentCategoryId === parentId)
        .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Recursively generates a flat array of categories, including nested children
 * that are currently marked as expanded.
 */
const getNestedCategories = (categories, depth = 0) => {
    const rows = [];
    categories.forEach(category => {
      // 1. Add the current category with its metadata (depth, expanded state)
      rows.push({
          ...category,
          depth: depth,
          isExpanded: expandedCategories.value.includes(category.id),
          hasChildren: hasSubcategories(category.id)
      });

      // 2. If expanded, recursively get and add its children
      if (expandedCategories.value.includes(category.id)) {
          const subcategories = getSubcategories(category.id);
          if (subcategories.length) {
              // Merge the result of the recursive call
              rows.push(...getNestedCategories(subcategories, depth + 1));
          }
      }
    });
    return rows;
};

// Toggle expand/collapse for categories with subcategories
const toggleExpand = (categoryId) => {
  const index = expandedCategories.value.indexOf(categoryId)
  if (index > -1) {
    expandedCategories.value.splice(index, 1)
  } else {
    expandedCategories.value.push(categoryId)
  }
  // Recalculate selectAll state immediately after expansion change
  setTimeout(updateSelectAllState, 0)
}

// ------------------------------------------------
// --- Filtering & Pagination Logic ---
// ------------------------------------------------

// Helper function to check if any filters are active
const areFiltersActive = computed(() => {
    const filters = props.filters;
    return filters.categoryName || filters.categoryCode || filters.status;
});

// Helper function to get the root ID of any category
const getRootId = (categoryId) => {
    let current = data.value.find(cat => cat.id === categoryId);
    while (current && current.parentCategoryId !== null) {
        current = data.value.find(cat => cat.id === current.parentCategoryId);
    }
    return current ? current.id : null;
};

// 1. Filtered data (results in a list of top-level categories that contain a match)
const filteredData = computed(() => {
  // If no filters are active, return ALL top-level categories for default view
  if (!areFiltersActive.value) {
    return data.value.filter(cat => cat.parentCategoryId === null)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  const filters = props.filters;

  // 1. Find ALL categories (including subcategories) that match the filter criteria
  const matchingCategories = data.value.filter((item) => {
    if (
      filters.categoryName &&
      !item.name.toLowerCase().includes(filters.categoryName.toLowerCase())
    ) return false
    if (
      filters.categoryCode &&
      !item.categoryCode.toLowerCase().includes(filters.categoryCode.toLowerCase())
    ) return false
    if (filters.status && item.status !== filters.status) return false
    return true
  })

  // 2. Identify the unique root-level parents for all matching categories
  const parentIdsToDisplay = new Set();
  matchingCategories.forEach(item => {
      const rootId = getRootId(item.id);
      if (rootId) {
          parentIdsToDisplay.add(rootId);
      }
  });

  // 3. The final result is the list of top-level categories whose children contained a match
  return data.value
    .filter(cat => cat.parentCategoryId === null)
    .filter(cat => parentIdsToDisplay.has(cat.id))
    .sort((a, b) => a.name.localeCompare(b.name));
});

const currentPage = ref(1)
const itemsPerPage = ref(5)

// 2. Paginated top-level data
const paginatedTopLevelData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredData.value.slice(start, end)
})

// 3. The final list of visible rows (parents + all expanded children)
const visibleCategoryRows = computed(() => {
    // Start the recursion with the paginated top-level data
    const rows = getNestedCategories(paginatedTopLevelData.value);

    // If filters are active, filter the rows to only show the path to the match
    if (areFiltersActive.value) {
        const matchingIds = new Set(data.value.filter(item => {
             // Re-evaluate the filter match for visibility
             const filters = props.filters;
             if (filters.categoryName && !item.name.toLowerCase().includes(filters.categoryName.toLowerCase())) return false
             if (filters.categoryCode && !item.categoryCode.toLowerCase().includes(filters.categoryCode.toLowerCase())) return false
             if (filters.status && item.status !== filters.status) return false
             return true;
        }).map(item => item.id));

        // In a filter mode, we only want to show the path *down* to the matching row.
        // We iterate backward to ensure the parent is included before the child.
        const visibleRows = [];
        let i = rows.length - 1;
        while (i >= 0) {
            const row = rows[i];

            // Check if the row itself or any descendant we've already added is a match
            const shouldShow = matchingIds.has(row.id) ||
                              visibleRows.some(vr => vr.parentCategoryId === row.id);

            if (shouldShow) {
                visibleRows.unshift(row);
            }
            i--;
        }
        return visibleRows;
    }

    return rows;
});


const totalPages = computed(() =>
  // Pagination logic remains based on the count of filtered top-level items
  Math.ceil(filteredData.value.length / itemsPerPage.value)
)

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Watch filters to automatically expand matching branches
watch(() => props.filters, (newFilters) => {
    currentPage.value = 1 // reset to first page on filter change

    // Auto-expand logic (only when filters are active)
    if (areFiltersActive.value) {
        const filters = newFilters;
        const matchingIds = data.value.filter(item => {
            if (filters.categoryName && !item.name.toLowerCase().includes(filters.categoryName.toLowerCase())) return false
            if (filters.categoryCode && !item.categoryCode.toLowerCase().includes(filters.categoryCode.toLowerCase())) return false
            if (filters.status && item.status !== filters.status) return false
            return true;
        }).map(item => item.id);

        const newExpanded = new Set();

        // For every matching item, add all its ancestors to the expandedCategories list
        matchingIds.forEach(id => {
            let current = data.value.find(cat => cat.id === id);
            while (current && current.parentCategoryId !== null) {
                newExpanded.add(current.parentCategoryId);
                current = data.value.find(cat => cat.id === current.parentCategoryId);
            }
        });

        // Set the new expanded list
        expandedCategories.value = Array.from(newExpanded);
    } else {
        // Clear expansion when filters are cleared
        expandedCategories.value = [];
    }
}, { deep: true, immediate: true });


// ------------------------------------------------
// --- Checkbox/Selection Logic ---
// ------------------------------------------------

// Get all currently visible item IDs (including expanded children)
const allVisibleItemIds = computed(() => {
  // Simple lookup of the flat list generated by the recursive computed property
  return visibleCategoryRows.value.map(row => row.id)
})

// Toggle select all
const toggleSelectAll = () => {
  const visibleIds = allVisibleItemIds.value
  if (selectAll.value) {
    // Deselect all visible items
    selectedItems.value = selectedItems.value.filter(id => !visibleIds.includes(id))
    selectAll.value = false
  } else {
    // Select all visible items
    visibleIds.forEach(id => {
      if (!selectedItems.value.includes(id)) {
        selectedItems.value.push(id)
      }
    })
    selectAll.value = true
  }
}

// Toggle individual item selection
const toggleItemSelection = (itemId) => {
  const index = selectedItems.value.indexOf(itemId)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(itemId)
  }
  updateSelectAllState()
}

// Check if item is selected
const isSelected = (itemId) => {
  return selectedItems.value.includes(itemId)
}

// Update select all checkbox state
const updateSelectAllState = () => {
  const visibleIds = allVisibleItemIds.value
  if (visibleIds.length === 0) {
      selectAll.value = false;
      return;
  }
  // Check if every visible item ID is present in selectedItems
  selectAll.value = visibleIds.every(id => selectedItems.value.includes(id))
}

// Watch for changes in paginated data or expanded categories to update 'select all'
watch([paginatedTopLevelData, expandedCategories], updateSelectAllState, { deep: true, immediate: true })


// ------------------------------------------------
// --- Actions & Exposed Methods ---
// ------------------------------------------------

const editCategory = (category) => {
  emit('edit-category', category)
}

const deleteCategory = async (item) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `You are about to delete category: ${item.name}. This will also delete its nested subcategories. This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33', // Red color for delete
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  })

  if (!result.isConfirmed) {
    return // User cancelled the operation
  }

  // --- Deletion Logic (only runs if confirmed) ---
  try {
    const response = await fetch(`${API_URL}/${item.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })

    // Try to parse JSON body if present
    let body = null
    try {
      body = await response.json()
    } catch (e) {
      // ignore parse errors
    }

    if (!response.ok) {
      const msg = (body && (body.message || body.error)) ? (body.message || body.error) : 'Failed to delete category'
      console.error('Delete failed:', msg, body)
      emit('delete-category', { success: false, error: msg, details: body })
      Swal.fire('Error', `Failed to delete category: ${msg}`, 'error')
      return
    }

    // If backend reports blocked categories (due to products), surface that to parent
    if (body && Array.isArray(body.blocked) && body.blocked.length > 0) {
      // Remove any successfully deleted ids from selection
      const deletedIds = Array.isArray(body.deletedIds) ? body.deletedIds : []
      if (deletedIds.length) {
        selectedItems.value = selectedItems.value.filter(id => !deletedIds.includes(id))
      }

      const message = deletedIds.length > 0
        ? `${deletedIds.length} categories deleted, but ${body.blocked.length} categories were blocked due to existing products.`
        : `${body.blocked.length} categories were blocked from deletion due to existing products.`

      emit('delete-category', { success: false, blocked: body.blocked, deletedIds: deletedIds })
      Swal.fire('Partial Success', message, 'warning')

      // Refresh to reflect any deletions that did occur
      await fetchCategories()

      // Adjust page if current page is now empty
      adjustPageAfterDeletion()
      return
    }

    // Success: either body.deletedIds or assume the requested id deleted
    const deletedIds = body && Array.isArray(body.deletedIds) && body.deletedIds.length ? body.deletedIds : [item.id]

    // Clear selection for deleted ids
    selectedItems.value = selectedItems.value.filter(id => !deletedIds.includes(id))

    // Show success notification
    Swal.fire({
      title: 'Deleted!',
      text: `Category ${item.name} has been deleted.`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    })

    emit('delete-category', { success: true, deletedIds, data: { name: item.name, id: item.id } })

    // Refresh the table
    await fetchCategories()

    // Adjust page if current page is now empty
    adjustPageAfterDeletion()
  } catch (error) {
    console.error('Error deleting category:', error)
    emit('delete-category', { success: false, error: error.message })
    Swal.fire('Error', `Failed to delete category: ${error.message}`, 'error')
  }
}

// Bulk delete selected categories
const bulkDelete = async () => {
  if (!selectedItems.value || selectedItems.value.length === 0) {
    Swal.fire('No Selection', 'Please select at least one category to delete.', 'info');
    return { success: false, error: 'No categories selected' }
  }

  // SweetAlert2 Confirmation for bulk delete
  const confirmResult = await Swal.fire({
    title: 'Confirm Bulk Deletion',
    text: `Are you sure you want to delete ${selectedItems.value.length} selected categor${selectedItems.value.length > 1 ? 'ies' : 'y'}? This will also delete nested subcategories and cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33', // Red color for delete
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, proceed with bulk delete'
  })

  if (!confirmResult.isConfirmed) {
    return { success: false, error: 'Cancelled by user' }
  }

  // --- Bulk Deletion Logic (only runs if confirmed) ---
  try {
    const response = await fetch(`${API_URL}/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedItems.value })
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(err || 'Failed to bulk delete categories')
    }

    const result = await response.json()

    // Clear selection and refresh
    const deletedCount = Array.isArray(result.deletedIds) ? result.deletedIds.length : 0
    const blocked = result.blocked || []

    // Map blocked ids to names where possible for better messaging
    const blockedNames = blocked.map(b => {
      const found = data.value.find(d => d.id === b.id)
      return found ? `${found.name} (${b.productsCount})` : `${b.id} (${b.productsCount})`
    })

    selectedItems.value = []
    selectAll.value = false
    await fetchCategories()

    // Adjust page if current page is now empty
    adjustPageAfterDeletion()

    // Handle success/partial success/failure with SweetAlert2
    if (deletedCount > 0 && blocked.length === 0) {
      emit('delete-category', { success: true, data: { count: deletedCount } })
      Swal.fire('Success', `${deletedCount} categories deleted successfully.`, 'success')
      return { success: true, data: result }
    } else if (deletedCount > 0 && blocked.length > 0) {
      const message = `${deletedCount} deleted, ${blocked.length} blocked due to existing products`;
      emit('delete-category', { success: false, error: message, data: { deletedCount, blocked } })
      Swal.fire({
        title: 'Partial Success',
        html: `${message}<br/><br/><strong>Blocked categories:</strong><br/>${blockedNames.join('<br/>')}`,
        icon: 'warning'
      })
      return { success: false, error: message, data: result }
    } else {
        const message = blocked.length > 0 ? `${blocked.length} categories were blocked from deletion due to existing products.` : 'No categories were deleted.';
        emit('delete-category', { success: false, error: message, data: result })
        Swal.fire('Deletion Failed', message, 'error')
        return { success: false, error: message }
    }

  } catch (error) {
    console.error('Error bulk deleting categories:', error)
    emit('delete-category', { success: false, error: error.message })
    Swal.fire('Error', `Failed to bulk delete categories: ${error.message}`, 'error')
    return { success: false, error: error.message }
  }
}

// Helper function to adjust page after deletion
const adjustPageAfterDeletion = () => {
  // Calculate if current page will be empty after refresh
  const totalItems = filteredData.value.length
  const maxPage = Math.ceil(totalItems / itemsPerPage.value) || 1

  // If current page exceeds max pages, adjust to the last valid page
  if (currentPage.value > maxPage) {
    currentPage.value = maxPage
  }
}

// Expose refresh method for parent component
const refreshData = () => {
  fetchCategories()
  selectedItems.value = []
  selectAll.value = false
}

defineExpose({ refreshData, selectedItems, bulkDelete })
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
