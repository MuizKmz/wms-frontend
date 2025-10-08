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
        <div class="absolute inset-0 bg-black/50"></div>

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
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col min-h-[600px] max-h-[90vh]">
              <div class="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 id="modal-title" class="text-lg font-semibold text-gray-900 dark:text-white">
                  Edit Product
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

              <div class="space-y-4 overflow-y-auto p-6 flex-1">
                <div v-if="errors.submit" class="alert alert-error">
                  <span>{{ errors.submit }}</span>
                </div>

                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    <span class="text-red-500">*</span> SKU Code
                  </label>
                  <input
                    v-model="form.skuCode"
                    type="text"
                    placeholder="Enter SKU Code"
                    maxlength="50"
                    :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.skuCode }]"
                  />
                  <transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="errors.skuCode" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.skuCode }}</p>
                    </div>
                  </transition>
                </div>

                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    <span class="text-red-500">*</span> Product Name
                  </label>
                  <input
                    v-model="form.productName"
                    type="text"
                    placeholder="Enter Product Name"
                    maxlength="100"
                    :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.productName }]"
                  />
                  <transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="errors.productName" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.productName }}</p>
                    </div>
                  </transition>
                </div>

                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    <span class="text-red-500">*</span> Product Code
                  </label>
                  <input
                    v-model="form.productCode"
                    type="text"
                    placeholder="Enter Product Code"
                    maxlength="50"
                    :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.productCode }]"
                  />
                  <transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="errors.productCode" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.productCode }}</p>
                    </div>
                  </transition>
                </div>

                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    <span class="text-red-500">*</span> Category
                  </label>
                  <div class="dropdown relative inline-flex w-full" ref="categoryDropdownRef">
                    <button
                      type="button"
                      :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400', { 'btn-error': errors.category }]"
                      :aria-expanded="openDropdowns.category"
                      @click.stop="toggleDropdown('category')"
                      :disabled="loadingCategories"
                    >
                      {{ form.category || 'Select Category' }}
                      <span
                        class="icon-[tabler--chevron-down] size-4 transition-transform"
                        :class="{ 'rotate-180': openDropdowns.category }"
                      ></span>
                    </button>

                    <ul
                      class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white max-h-60 overflow-y-auto"
                      :class="{ 'opacity-100 pointer-events-auto': openDropdowns.category, 'opacity-0 pointer-events-none': !openDropdowns.category }"
                      role="menu"
                    >
                      <li v-for="category in categories" :key="category.id">
                        <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('category', category.name)">
                          {{ category.name }}
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
                    <div v-if="errors.category" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.category }}</p>
                    </div>
                  </transition>
                </div>

                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    <span class="text-red-500">*</span> Supplier Name
                  </label>
                  <div class="dropdown relative inline-flex w-full" ref="supplierDropdownRef">
                    <button
                      type="button"
                      :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400', { 'btn-error': errors.supplierName }]"
                      :aria-expanded="openDropdowns.supplier"
                      @click.stop="toggleDropdown('supplier')"
                      :disabled="loadingSuppliers"
                    >
                      {{ form.supplierName || 'Select Supplier' }}
                      <span
                        class="icon-[tabler--chevron-down] size-4 transition-transform"
                        :class="{ 'rotate-180': openDropdowns.supplier }"
                      ></span>
                    </button>

                    <ul
                      class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white max-h-60 overflow-y-auto"
                      :class="{ 'opacity-100 pointer-events-auto': openDropdowns.supplier, 'opacity-0 pointer-events-none': !openDropdowns.supplier }"
                      role="menu"
                    >
                      <li v-if="loadingSuppliers" class="px-4 py-2 text-sm text-gray-500">Loading...</li>
                      <li v-else-if="suppliersError" class="px-4 py-2 text-sm text-red-500">Error: {{ suppliersError }}</li>
                      <li v-else-if="suppliers.length === 0" class="px-4 py-2 text-sm text-gray-500">No suppliers found</li>
                      <li v-else v-for="supplier in suppliers" :key="supplier.id">
                        <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('supplierName', supplier.name)">
                          {{ supplier.name }}
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
                    <div v-if="errors.supplierName" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.supplierName }}</p>
                    </div>
                  </transition>
                </div>

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

                <div class="relative">
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    Remarks
                  </label>
                  <input
                    v-model="form.remark"
                    type="text"
                    placeholder="Enter Remarks"
                    maxlength="200"
                    :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.remark }]"
                  />
                  <transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="errors.remark" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.remark }}</p>
                    </div>
                  </transition>
                </div>
              </div>

              <div class="flex justify-end gap-2 p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button @click="closeModal" class="btn btn-outline" :disabled="isSubmitting">
                  Cancel
                </button>
                <button @click="submitForm" class="btn btn-primary" :disabled="isSubmitting">
                  <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
                  {{ isSubmitting ? 'Updating...' : 'Update' }}
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
import { ref, reactive, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'

interface Category {
  id: number
  name: string
}

interface Supplier {
  id: number
  name: string
}

interface Product {
  id: number;
  skuCode: string;
  productName: string;
  productCode: string;
  category: string;
  supplierName: string;
  status: string;
  remark: string | null;
  quantity: number;
  createdTime: string;
}

const emit = defineEmits(['product-updated'])

/* state */
const isOpen = ref(false)
const isSubmitting = ref(false)
const loadingCategories = ref(false)
const loadingSuppliers = ref(false)
const suppliersError = ref<string | null>(null)
const panelRef = ref<HTMLElement | null>(null)
const statusDropdownRef = ref<HTMLElement | null>(null)
const categoryDropdownRef = ref<HTMLElement | null>(null)
const supplierDropdownRef = ref<HTMLElement | null>(null)

const originalProduct = ref<Product | null>(null);

const form = reactive({
  skuCode: '',
  productName: '',
  productCode: '',
  category: '',
  supplierName: '',
  status: '',
  remark: ''
})

const errors = reactive({
  skuCode: '',
  productName: '',
  productCode: '',
  category: '',
  supplierName: '',
  status: '',
  remark: '',
  submit: ''
})

const statusOptions = ['Active', 'Inactive']
const categories = ref<Category[]>([])
const suppliers = ref<Supplier[]>([])
const openDropdowns = reactive({ status: false, category: false, supplier: false })

/* Fetch categories and suppliers */
const fetchCategories = async () => {
  loadingCategories.value = true
  try {
    const response = await fetch('/api/category')
    if (!response.ok) throw new Error('Failed to fetch categories')
    const data = await response.json()
    categories.value = data
  } catch (error) {
    console.error('Error fetching categories:', error)
  } finally {
    loadingCategories.value = false
  }
}

const fetchSuppliers = async () => {
  loadingSuppliers.value = true
  try {
    suppliersError.value = null
    const response = await fetch('/api/supplier')
    if (!response.ok) throw new Error('Failed to fetch suppliers')
    const data = await response.json()
    suppliers.value = (data || []).map((s: any) => ({
      id: s.id,
      name: s.supplierName || s.supplier_name || s.name || ''
    }))
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    suppliersError.value = error instanceof Error ? error.message : String(error)
  } finally {
    loadingSuppliers.value = false
  }
}

/* Modal scroll lock utilities (omitted for brevity, assume they are correct) */
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


/* Validation (omitted for brevity, assume they are correct) */
const validateForm = () => {
  // Reset errors
  Object.keys(errors).forEach(key => errors[key as keyof typeof errors] = '')

  let isValid = true

  if (!form.skuCode.trim()) { errors.skuCode = 'SKU Code is required'; isValid = false }
  if (!form.productName.trim()) { errors.productName = 'Product Name is required'; isValid = false }
  if (!form.productCode.trim()) { errors.productCode = 'Product Code is required'; isValid = false }
  if (!form.category) { errors.category = 'Category is required'; isValid = false }
  if (!form.supplierName) { errors.supplierName = 'Supplier Name is required'; isValid = false }
  if (!form.status) { errors.status = 'Status is required'; isValid = false }

  return isValid
}

// Clear error when user types (omitted for brevity)
watch(() => form.skuCode, () => { if (errors.skuCode) errors.skuCode = '' })
watch(() => form.productName, () => { if (errors.productName) errors.productName = '' })
watch(() => form.productCode, () => { if (errors.productCode) errors.productCode = '' })
watch(() => form.category, () => { if (errors.category) errors.category = '' })
watch(() => form.supplierName, () => { if (errors.supplierName) errors.supplierName = '' })
watch(() => form.status, () => { if (errors.status) errors.status = '' })
watch(() => form.remark, () => { if (errors.remark) errors.remark = '' })

/* helpers */
const toggleDropdown = (name: 'status' | 'category' | 'supplier') => {
  Object.keys(openDropdowns).forEach(k => {
    if (k !== name) openDropdowns[k as keyof typeof openDropdowns] = false
  })
  openDropdowns[name] = !openDropdowns[name]
}

/**
 * 💡 FIX APPLIED HERE:
 * Correctly asserts the type of the value being assigned to the form field 
 * to resolve potential TypeScript errors.
 */
const selectOption = (key: keyof typeof form, value: string) => {
  // The correct type assertion for a dynamic key in a reactive object
  form[key] = value as (typeof form)[typeof key]
  
  let dropdownKey: keyof typeof openDropdowns | null = null;
  if (key === 'supplierName') {
    dropdownKey = 'supplier';
  } else if (key === 'category') {
    dropdownKey = 'category';
  } else if (key === 'status') {
    dropdownKey = 'status';
  }

  if (dropdownKey) {
    openDropdowns[dropdownKey] = false
  }
}

/* close dropdowns when clicking outside (omitted for brevity) */
const handleClickOutside = (event: MouseEvent) => {
  const statusDd = statusDropdownRef.value
  const categoryDd = categoryDropdownRef.value
  const supplierDd = supplierDropdownRef.value

  if (statusDd && !statusDd.contains(event.target as Node)) {
    openDropdowns.status = false
  }

  if (categoryDd && !categoryDd.contains(event.target as Node)) {
    openDropdowns.category = false
  }

  if (supplierDd && !supplierDd.contains(event.target as Node)) {
    openDropdowns.supplier = false
  }
}

/* open/close modal */
const openModal = async (product: Product) => {
  await Promise.all([fetchCategories(), fetchSuppliers()])

  // Prefill the form with the provided product data
  originalProduct.value = product;
  form.skuCode = product.skuCode
  form.productName = product.productName
  form.productCode = product.productCode
  form.category = product.category
  form.supplierName = product.supplierName
  form.status = product.status
  form.remark = product.remark || ''

  // Reset errors
  Object.keys(errors).forEach(key => errors[key as keyof typeof errors] = '')

  isOpen.value = true
  lockScroll()
  await nextTick()
  panelRef.value?.querySelector('input,select,textarea,button')?.focus()
}

const closeModal = async () => {
  openDropdowns.status = false
  openDropdowns.category = false
  openDropdowns.supplier = false
  isOpen.value = false

  // Reset form after modal is closed
  await nextTick()
  originalProduct.value = null;
  form.skuCode = ''
  form.productName = ''
  form.productCode = ''
  form.category = ''
  form.supplierName = ''
  form.status = ''
  form.remark = ''

  // Reset errors
  Object.keys(errors).forEach(key => errors[key as keyof typeof errors] = '')
}

/* submit */
const submitForm = async () => {
  if (!validateForm() || !originalProduct.value) {
    if (!originalProduct.value) errors.submit = 'No product data provided for editing.';
    return
  }

  isSubmitting.value = true
  errors.submit = ''

  const productId = originalProduct.value.id;

  try {
    const submissionData = {
      skuCode: form.skuCode.toUpperCase(),
      productName: form.productName,
      productCode: form.productCode.toUpperCase(),
      category: form.category,
      supplierName: form.supplierName,
      status: form.status,
      remark: form.remark || null,
      quantity: originalProduct.value.quantity,
      createdTime: originalProduct.value.createdTime,
      updatedTime: new Date().toISOString()
    }

    const response = await fetch(`/api/product/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to update product')
    }

    const data = await response.json()
    console.log('Server response:', data)

    await closeModal()

    emit('product-updated', { success: true, data })

  } catch (error) {
    console.error('Error updating product:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update product'
    errors.submit = errorMessage
    emit('product-updated', { success: false, error: errorMessage })
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