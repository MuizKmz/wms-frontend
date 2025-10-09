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
                    v-model="form.name"
                    type="text"
                    placeholder="Enter Product Name"
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
                      :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400', { 'btn-error': errors.supplier }]"
                      :aria-expanded="openDropdowns.supplier"
                      @click.stop="toggleDropdown('supplier')"
                      :disabled="loadingSuppliers"
                    >
                      {{ form.supplier || 'Select Supplier' }}
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
                        <a
                          class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
                          @click="selectOption('supplier', supplier.name)"
                        >
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
                    <div v-if="errors.supplier" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.supplier }}</p>
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
                    v-model="form.remarks"
                    type="text"
                    placeholder="Enter Remarks"
                    maxlength="200"
                    :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.remarks }]"
                  />
                  <transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="errors.remarks" class="absolute left-0 right-0 mt-1 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg z-10">
                      <p class="text-xs text-red-600 dark:text-red-400">{{ errors.remarks }}</p>
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
  id: number
  skuCode: string
  productCode: string
  name: string
  categoryId: number
  supplierId: number
  status: string
  remarks?: string
  createdAt?: string
  updatedAt?: string
  supplier?: {
    id: number
    supplierCode: string
    supplierName: string
    manager: string
    contactPhone: string
    email: string
    status: string
    remark: string
  }
  category?: {
    id: number
    categoryCode: string
    name: string
    parentCategoryId: number | null
    level: number
    storageRequirements: string
    status: string
  }
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
const productId = ref<number | null>(null)

const form = reactive({
  skuCode: '',
  name: '',
  productCode: '',
  category: '',
  supplier: '',
  status: '',
  remarks: ''
})

const errors = reactive({
  skuCode: '',
  name: '',
  productCode: '',
  category: '',
  supplier: '',
  status: '',
  remarks: '',
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
  Object.keys(errors).forEach(key => errors[key as keyof typeof errors] = '')

  let isValid = true

  if (!form.skuCode.trim()) {
    errors.skuCode = 'SKU Code is required'
    isValid = false
  }

  if (!form.name.trim()) {
    errors.name = 'Product Name is required'
    isValid = false
  }

  if (!form.productCode.trim()) {
    errors.productCode = 'Product Code is required'
    isValid = false
  }

  if (!form.category) {
    errors.category = 'Category is required'
    isValid = false
  }

  if (!form.supplier) {
    errors.supplier = 'Supplier Name is required'
    isValid = false
  }

  if (!form.status) {
    errors.status = 'Status is required'
    isValid = false
  }

  return isValid
}

// Clear error when user types
watch(() => form.skuCode, () => { if (errors.skuCode) errors.skuCode = '' })
watch(() => form.name, () => { if (errors.name) errors.name = '' })
watch(() => form.productCode, () => { if (errors.productCode) errors.productCode = '' })
watch(() => form.category, () => { if (errors.category) errors.category = '' })
watch(() => form.supplier, () => { if (errors.supplier) errors.supplier = '' })
watch(() => form.status, () => { if (errors.status) errors.status = '' })
watch(() => form.remarks, () => { if (errors.remarks) errors.remarks = '' })

/* helpers */
const toggleDropdown = (name: 'status' | 'category' | 'supplier') => {
  Object.keys(openDropdowns).forEach(k => {
    if (k !== name) openDropdowns[k as keyof typeof openDropdowns] = false
  })
  openDropdowns[name] = !openDropdowns[name]
}

const selectOption = (key: keyof typeof form, value: string) => {
  form[key] = value as never

  let dropdownKey: keyof typeof openDropdowns | null = null
  if (key === 'supplier') {
    dropdownKey = 'supplier'
  } else if (key === 'category') {
    dropdownKey = 'category'
  } else if (key === 'status') {
    dropdownKey = 'status'
  }

  if (dropdownKey) {
    openDropdowns[dropdownKey] = false
  }
}

/* close dropdowns when clicking outside */
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
const openModal = async (product: any) => {
  console.log('=== OPENING EDIT MODAL ===')
  console.log('1. Product received:', product)
  
  // Fetch categories and suppliers when modal opens
  await Promise.all([fetchCategories(), fetchSuppliers()])

  console.log('2. Categories loaded:', categories.value)
  console.log('3. Suppliers loaded:', suppliers.value)

  // Use raw data if available (your table is transforming the data)
  const actualProduct = product.raw || product
  
  console.log('3.5. Using data from:', actualProduct)

  // Store product ID for update
  productId.value = actualProduct.id

  // Prefill form with product data
  form.skuCode = actualProduct.skuCode || ''
  form.name = actualProduct.name || ''
  form.productCode = actualProduct.productCode || ''
  form.status = actualProduct.status || ''
  form.remarks = actualProduct.remarks || ''

  console.log('4. Form basic fields:', {
    skuCode: form.skuCode,
    name: form.name,
    productCode: form.productCode,
    status: form.status,
    remarks: form.remarks
  })

  // Find category name by ID
  if (actualProduct.categoryId) {
    const category = categories.value.find(c => c.id === actualProduct.categoryId)
    form.category = category ? category.name : ''
    console.log('5. Category ID:', actualProduct.categoryId, 'Category found:', category, 'Form category:', form.category)
  } else {
    form.category = ''
    console.log('5. No categoryId in product')
  }

  // Find supplier name by ID
  if (actualProduct.supplierId) {
    const supplier = suppliers.value.find(s => s.id === actualProduct.supplierId)
    form.supplier = supplier ? supplier.name : ''
    console.log('6. Supplier ID:', actualProduct.supplierId, 'Supplier found:', supplier, 'Form supplier:', form.supplier)
  } else {
    form.supplier = ''
    console.log('6. No supplierId in product')
  }

  console.log('7. Final form state:', form)

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
  productId.value = null
  form.skuCode = ''
  form.name = ''
  form.productCode = ''
  form.category = ''
  form.supplier = ''
  form.status = ''
  form.remarks = ''

  // Reset errors
  Object.keys(errors).forEach(key => errors[key as keyof typeof errors] = '')
}

/* submit */
const submitForm = async () => {
  if (!validateForm()) {
    return
  }

  if (!productId.value) {
    errors.submit = 'Product ID is missing'
    return
  }

  isSubmitting.value = true
  errors.submit = ''

  try {
    // Find category and supplier IDs by name
    const category = categories.value.find(c => c.name === form.category)
    const supplier = suppliers.value.find(s => s.name === form.supplier)

    if (!category) {
      errors.category = 'Invalid category selected'
      return
    }

    if (!supplier) {
      errors.supplier = 'Invalid supplier selected'
      return
    }

    const submissionData = {
      skuCode: form.skuCode.toUpperCase(),
      name: form.name,
      productCode: form.productCode.toUpperCase(),
      categoryId: category.id,
      supplierId: supplier.id,
      status: form.status,
      remarks: form.remarks || null
    }

    // Use PATCH method to update the product
    const response = await fetch(`/api/product/${productId.value}`, {
      method: 'PATCH',
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

    // Close modal after successful update
    await closeModal()

    // Emit event to parent component with success status
    emit('product-updated', { success: true, data })

  } catch (error) {
    console.error('Error updating product:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update product'
    errors.submit = errorMessage
    // Emit event to parent component with error status
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