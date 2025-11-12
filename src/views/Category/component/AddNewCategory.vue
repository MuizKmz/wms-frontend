<template>
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
        <!-- overlay -->
        <div class="absolute inset-0 bg-black/50"></div>

        <!-- modal panel -->
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
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col min-h-[650px] max-h-[90vh]">
              <!-- header -->
              <div class="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 id="modal-title" class="text-lg font-semibold text-gray-900 dark:text-white">
                  Add Category
                </h2>
                <button
                  type="button"
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  @click="closeModal"
                  :disabled="isSubmitting"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              <!-- body -->
              <div class="space-y-4 overflow-y-auto p-6 flex-1">
                <!-- Submit Error -->
                <div v-if="errors.submit" class="alert alert-error">
                  <span>{{ errors.submit }}</span>
                </div>

                <!-- Parent Category -->
                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    Parent Category
                  </label>
                  <div class="dropdown relative inline-flex w-full" ref="parentCategoryDropdownRef">
                    <button
                      type="button"
                      :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400', { 'btn-error': errors.parentCategoryId }]"
                      :aria-expanded="openDropdowns.parentCategory"
                      @click.stop="toggleDropdown('parentCategory')"
                      :disabled="loadingCategories"
                    >
                      {{ selectedParentCategoryName || 'Select Parent Category (Optional)' }}
                      <span
                        class="icon-[tabler--chevron-down] size-4 transition-transform"
                        :class="{ 'rotate-180': openDropdowns.parentCategory }"
                      ></span>
                    </button>

                    <ul
                      class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white max-h-60 overflow-y-auto"
                      :class="{ 'opacity-100 pointer-events-auto': openDropdowns.parentCategory, 'opacity-0 pointer-events-none': !openDropdowns.parentCategory }"
                      role="menu"
                    >
                      <li>
                        <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectParentCategory(null, 'None (Top Level)')">
                          None (Top Level)
                        </a>
                      </li>
                      <li v-for="category in parentCategories" :key="category.id">
                        <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectParentCategory(category.id, category.name)">
                          {{ category.name }} ({{ category.categoryCode }})
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
                    <div v-if="errors.parentCategoryId" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.parentCategoryId }}</p>
                    </div>
                  </transition>
                </div>

                <!-- Category Code -->
                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    <span class="text-red-500">*</span> Category Code
                  </label>
                  <input
                    v-model="form.categoryCode"
                    type="text"
                    placeholder="Enter Category Code (e.g., CAT-COMP)"
                    maxlength="50"
                    :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.categoryCode }]"
                  />
                  <transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="errors.categoryCode" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.categoryCode }}</p>
                    </div>
                  </transition>
                </div>

                <!-- Category Name -->
                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    <span class="text-red-500">*</span> Category Name
                  </label>
                  <input
                    v-model="form.name"
                    type="text"
                    placeholder="Enter Category Name"
                    maxlength="100"
                    :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.name }]"
                  />
                  <transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="errors.name" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.name }}</p>
                    </div>
                  </transition>
                </div>

                <!-- Storage Requirements -->
                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    Storage Requirements
                  </label>
                  <input
                    v-model="form.storageRequirements"
                    type="text"
                    placeholder="e.g., Climate controlled, humidity < 60%"
                    maxlength="200"
                    :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.storageRequirements }]"
                  />
                  <transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="errors.storageRequirements" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.storageRequirements }}</p>
                    </div>
                  </transition>
                </div>

                <!-- Status dropdown -->
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
                    <div v-if="errors.status" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.status }}</p>
                    </div>
                  </transition>
                </div>
              </div>

              <!-- footer -->
              <div class="flex justify-end gap-2 p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button @click="closeModal" class="btn btn-outline btn-error" :disabled="isSubmitting">
                  Cancel
                </button>
                <button @click="submitForm" class="btn bg-brand-500 border-none" :disabled="isSubmitting">
                  <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
                  {{ isSubmitting ? 'Saving...' : 'Save' }}
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import authenticatedFetch from '@/utils/authenticatedFetch'
import { ref, reactive, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'

interface Category {
  id: number
  categoryCode: string
  name: string
  parentCategoryId: number | null
  level: number
  storageRequirements: string | null
  status: string
}

const emit = defineEmits(['category-created'])

/* state */
const isOpen = ref(false)
const isSubmitting = ref(false)
const loadingCategories = ref(false)
const panelRef = ref<HTMLElement | null>(null)
const statusDropdownRef = ref<HTMLElement | null>(null)
const parentCategoryDropdownRef = ref<HTMLElement | null>(null)

const form = reactive({
  parentCategoryId: null as number | null,
  categoryCode: '',
  name: '',
  storageRequirements: '',
  status: ''
})

const errors = reactive({
  parentCategoryId: '',
  categoryCode: '',
  name: '',
  storageRequirements: '',
  status: '',
  submit: ''
})

const statusOptions = ['Active', 'Inactive']
const parentCategories = ref<Category[]>([])
const selectedParentCategoryName = ref<string>('')
const openDropdowns = reactive({ status: false, parentCategory: false })

/* Fetch parent categories */
const fetchParentCategories = async () => {
  loadingCategories.value = true
  try {
    const response = await authenticatedFetch('/api/category')
    if (!response.ok) throw new Error('Failed to fetch categories')
    const data = await response.json()
    parentCategories.value = data
  } catch (error) {
    console.error('Error fetching categories:', error)
  } finally {
    loadingCategories.value = false
  }
}

/* Modal scroll lock utilities */
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
  // Reset errors
  Object.keys(errors).forEach(key => errors[key as keyof typeof errors] = '')

  let isValid = true

  // Category Code validation
  if (!form.categoryCode.trim()) {
    errors.categoryCode = 'Category Code is required'
    isValid = false
  } else if (form.categoryCode.length < 2) {
    errors.categoryCode = 'Category Code must be at least 2 characters'
    isValid = false
  } else if (form.categoryCode.length > 50) {
    errors.categoryCode = 'Category Code cannot exceed 50 characters'
    isValid = false
  }

  // Category Name validation
  if (!form.name.trim()) {
    errors.name = 'Category Name is required'
    isValid = false
  } else if (form.name.length < 2) {
    errors.name = 'Category Name must be at least 2 characters'
    isValid = false
  } else if (form.name.length > 100) {
    errors.name = 'Category Name cannot exceed 100 characters'
    isValid = false
  }

  // Storage Requirements validation (optional but with limit)
  if (form.storageRequirements && form.storageRequirements.length > 200) {
    errors.storageRequirements = 'Storage Requirements cannot exceed 200 characters'
    isValid = false
  }

  // Status validation
  if (!form.status) {
    errors.status = 'Status is required'
    isValid = false
  }

  return isValid
}

// Clear error when user types
watch(() => form.parentCategoryId, () => { if (errors.parentCategoryId) errors.parentCategoryId = '' })
watch(() => form.categoryCode, () => { if (errors.categoryCode) errors.categoryCode = '' })
watch(() => form.name, () => { if (errors.name) errors.name = '' })
watch(() => form.storageRequirements, () => { if (errors.storageRequirements) errors.storageRequirements = '' })
watch(() => form.status, () => { if (errors.status) errors.status = '' })

/* helpers */
const toggleDropdown = (name: 'status' | 'parentCategory') => {
  Object.keys(openDropdowns).forEach(k => {
    if (k !== name) openDropdowns[k as keyof typeof openDropdowns] = false
  })
  openDropdowns[name] = !openDropdowns[name]
}

const selectOption = (key: keyof typeof form, value: string) => {
  form[key] = value as never
  openDropdowns[key as keyof typeof openDropdowns] = false
}

const selectParentCategory = (id: number | null, name: string) => {
  form.parentCategoryId = id
  selectedParentCategoryName.value = name
  openDropdowns.parentCategory = false
}

/* close dropdowns when clicking outside */
const handleClickOutside = (event: MouseEvent) => {
  const statusDd = statusDropdownRef.value
  const parentCategoryDd = parentCategoryDropdownRef.value

  if (statusDd && !statusDd.contains(event.target as Node)) {
    openDropdowns.status = false
  }

  if (parentCategoryDd && !parentCategoryDd.contains(event.target as Node)) {
    openDropdowns.parentCategory = false
  }
}

/* open/close modal */
const openModal = async () => {
  // Fetch parent categories when modal opens
  await fetchParentCategories()

  // Reset form
  form.parentCategoryId = null
  form.categoryCode = ''
  form.name = ''
  form.storageRequirements = ''
  form.status = ''
  selectedParentCategoryName.value = ''

  // Reset errors
  Object.keys(errors).forEach(key => errors[key as keyof typeof errors] = '')

  isOpen.value = true
  lockScroll()
  await nextTick()
  panelRef.value?.querySelector('input,select,textarea,button')?.focus()
}

const closeModal = async () => {
  openDropdowns.status = false
  openDropdowns.parentCategory = false
  isOpen.value = false

  // Reset form after modal is closed
  await nextTick()
  form.parentCategoryId = null
  form.categoryCode = ''
  form.name = ''
  form.storageRequirements = ''
  form.status = ''
  selectedParentCategoryName.value = ''

  // Reset errors
  Object.keys(errors).forEach(key => errors[key as keyof typeof errors] = '')
}

/* submit */
const submitForm = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  errors.submit = ''

  try {
    // Format the data to match the backend schema
      const submissionData = {
        categoryCode: form.categoryCode.toUpperCase(),
        name: form.name,
        parentCategoryId: form.parentCategoryId,
        level: form.parentCategoryId ? 2 : 1, // Add this line
        storageRequirements: form.storageRequirements || null,
        status: form.status
      }

    // Make the API call to the correct endpoint
    const response = await authenticatedFetch('/api/category', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to create category')
    }

    const data = await response.json()
    console.log('Server response:', data)

    // Only close and reset after successful API call
    await closeModal()

    // Emit event to parent component with success status
    emit('category-created', { success: true, data })

  } catch (error) {
    console.error('Error creating category:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create category'
    errors.submit = errorMessage
    // Emit event to parent component with error status
    emit('category-created', { success: false, error: errorMessage })
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

/* expose to parent */
defineExpose({ openModal, closeModal })
</script>

<style scoped>
[role="dialog"] > .bg-white {
  transform-origin: center;
}
</style>
