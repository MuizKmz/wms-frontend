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
            class="relative z-10 w-full max-w-lg mx-4 max-h-[90vh] flex flex-col"
            @click.stop
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col">
              <div class="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 id="modal-title" class="text-lg font-semibold text-gray-900 dark:text-white">
                  Generate EPC
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

              <div class="space-y-6 overflow-y-auto p-6 flex-1">
                <div v-if="errors.submit" class="alert alert-error">
                  <span>{{ errors.submit }}</span>
                </div>

                <div class="relative">
                  <label class="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                    Corp Code
                  </label>
                  <input
                    v-model="form.corpCode"
                    type="text"
                    readonly
                    :class="['input input-bordered w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white pointer-events-none']"
                  />
                </div>

                <div class="relative">
                  <label class="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                    <span class="text-red-500">*</span> Product Name
                  </label>
                  <div class="dropdown relative inline-flex w-full" ref="productDropdownRef">
                    <button
                      type="button"
                      :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400', { 'btn-error': errors.productName }]"
                      :aria-expanded="openDropdowns.product"
                      @click.stop="toggleDropdown('product')"
                      :disabled="loadingProducts"
                    >
                      {{ selectedProductLabel || 'Select Product' }}
                      <span
                        class="icon-[tabler--chevron-down] size-4 transition-transform"
                        :class="{ 'rotate-180': openDropdowns.product }"
                      ></span>
                    </button>

                    <ul
                      class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white max-h-60 overflow-y-auto"
                      :class="{ 'opacity-100 pointer-events-auto': openDropdowns.product, 'opacity-0 pointer-events-none': !openDropdowns.product }"
                      role="menu"
                    >
                      <li v-for="product in products" :key="product.id">
                        <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectProduct(product)">
                          {{ product.name }}
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div v-if="errors.productName" class="text-xs text-red-600 dark:text-red-400 mt-1">{{ errors.productName }}</div>
                </div>
                
                <div class="relative">
                  <label class="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                    Batch Name
                  </label>
                  <input
                    v-model="form.batchName"
                    type="text"
                    placeholder="Enter Batch Name"
                    maxlength="50"
                    :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.batchName }]"
                  />
                  <div v-if="errors.batchName" class="text-xs text-red-600 dark:text-red-400 mt-1">{{ errors.batchName }}</div>
                </div>

                <div class="relative">
                  <label class="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                    Batch Quantity
                  </label>
                  <div class="flex items-center gap-0">
                    <button
                      type="button"
                      @click="updateQuantity(-1)"
                      :disabled="form.batchQuantity <= 1"
                      class="btn btn-outline border-r-0 rounded-r-none h-12 w-12"
                    >
                      −
                    </button>
                    <input
                      :value="form.batchQuantity"
                      type="number"
                      min="1"
                      class="input input-bordered w-full text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-12 border-x-0 !outline-none focus:border-x-gray-300"
                      @input="form.batchQuantity = Math.max(1, parseInt($event.target.value) || 1)"
                    />
                    <button
                      type="button"
                      @click="updateQuantity(1)"
                      class="btn btn-primary border-l-0 rounded-l-none h-12 w-12"
                    >
                      +
                    </button>
                  </div>
                  <div v-if="errors.batchQuantity" class="text-xs text-red-600 dark:text-red-400 mt-1">{{ errors.batchQuantity }}</div>
                </div>
                
                <div class="relative">
                  <label class="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                    Remarks
                  </label>
                  <input
                    v-model="form.remarks"
                    type="text"
                    placeholder="Enter Remarks"
                    maxlength="255"
                    :class="['input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white', { 'input-error': errors.remarks }]"
                  />
                </div>

              </div>
              <div class="flex justify-end gap-2 p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button @click="closeModal" class="btn btn-outline" :disabled="isSubmitting">
                  Cancel
                </button>
                <button @click="submitForm" class="btn btn-primary" :disabled="isSubmitting">
                  <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
                  {{ isSubmitting ? 'Generating...' : 'Generate' }}
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
import { ref, reactive, nextTick, onMounted, onBeforeUnmount, watch, computed } from 'vue'

// Simplified Product Interface for this modal
interface Product {
  id: number
  name: string
  // Assuming the API returns a 'name' field, adjust if necessary (e.g., 'productName', 'sku')
}

// Updated Form Structure
interface EPCForm {
  corpCode: string
  productName: string | null
  batchName: string
  batchQuantity: number
  remarks: string
}

const emit = defineEmits(['epc-generated'])

/* State */
const isOpen = ref(false)
const isSubmitting = ref(false)
const loadingProducts = ref(false)
const panelRef = ref<HTMLElement | null>(null)

const form = reactive<EPCForm>({
  corpCode: 'AA00', // Hardcoded as per image
  productName: null,
  batchName: '',
  batchQuantity: 1,
  remarks: ''
})

const errors = reactive({
  submit: '',
  productName: '',
  batchName: '',
  batchQuantity: '',
  remarks: '',
})

// Simplified product list
const products = ref<Product[]>([]) 
const openDropdowns = reactive<Record<string, boolean>>({
  product: false
})

const selectedProductLabel = computed(() => {
  if (!form.productName) return null
  return form.productName
})

/* Scroll Lock (Keeping existing logic) */
let scrollY = 0
let scrollbarWidth = 0

const getScrollbarWidth = () => window.innerWidth - document.documentElement.clientWidth

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
  requestAnimationFrame(() => window.scrollTo(0, scrollY))
}

/* Fetch Data */
const fetchData = async () => {
  loadingProducts.value = true
  try {
    // CORRECTED: Using the specified endpoint /api/product
    const productsRes = await fetch('/api/product') 

    if (productsRes.ok) {
        // ASSUMPTION: The /api/product response is an array of objects
        // that contain 'id' and 'name' properties. Adjust Product interface if needed.
        products.value = await productsRes.json()
    } else {
        // Fallback mock data if API fails 
        products.value = [
            { id: 1, name: 'Product Alpha' },
            { id: 2, name: 'Product Beta' },
            { id: 3, name: 'Product Gamma' },
        ]
        console.warn('Failed to fetch products from /api/product. Using mock data.')
    }
  } catch (error) {
    console.error('Error fetching product data:', error)
    errors.submit = 'Failed to load products'
  } finally {
    loadingProducts.value = false
  }
}

/* Validation */
const validateForm = () => {
  Object.keys(errors).forEach(key => (errors[key as keyof typeof errors] = ''))
  let isValid = true

  if (!form.productName) {
    errors.productName = 'Product Name is required'
    isValid = false
  }

  if (form.batchQuantity < 1) {
    errors.batchQuantity = 'Quantity must be at least 1'
    isValid = false
  }
  
  return isValid
}

/* Clear errors on input */
watch(() => form.productName, () => { if (errors.productName) errors.productName = '' })

/* Helpers */
const toggleDropdown = (name: string) => {
  Object.keys(openDropdowns).forEach(k => {
    if (k !== name) openDropdowns[k] = false
  })
  openDropdowns[name] = !openDropdowns[name]
}

const selectProduct = (product: Product) => {
  form.productName = product.name
  openDropdowns.product = false
}

const updateQuantity = (change: number) => {
  form.batchQuantity = Math.max(1, form.batchQuantity + change);
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node
  if (!panelRef.value?.contains(target)) {
    Object.keys(openDropdowns).forEach(k => openDropdowns[k] = false)
  }
}

/* Modal Control */
const openModal = async () => {
  await fetchData()

  // Reset form
  form.corpCode = 'AA00'
  form.productName = null
  form.batchName = ''
  form.batchQuantity = 1
  form.remarks = ''
  Object.keys(errors).forEach(key => (errors[key as keyof typeof errors] = ''))

  isOpen.value = true
  lockScroll()
  await nextTick()
}

const closeModal = async () => {
  Object.keys(openDropdowns).forEach(k => openDropdowns[k] = false)
  isOpen.value = false
}

/* Submit */
const submitForm = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  errors.submit = ''

  try {
    const submissionData = {
      corpCode: form.corpCode,
      productName: form.productName,
      batchName: form.batchName || null,
      batchQuantity: form.batchQuantity,
      remarks: form.remarks || null,
    }

    const response = await fetch('/api/epc/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionData)
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || 'Failed to generate EPC batch.')
    }

    const data = await response.json()
    await closeModal()
    emit('epc-generated', { success: true, data }) 

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate EPC batch.'
    errors.submit = message
    emit('epc-generated', { success: false, error: message }) 
  } finally {
    isSubmitting.value = false
  }
}

/* Lifecycle */
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  if (isOpen.value) unlockScroll()
})

// CRUCIAL: Expose methods for parent component interaction
defineExpose({ openModal, closeModal })
</script>

<style scoped>
[role="dialog"] > .bg-white {
  transform-origin: center;
}

/* Style to make input look seamless with buttons */
.input-bordered.border-x-0 {
  border-left-width: 0px !important;
  border-right-width: 0px !important;
  border-radius: 0 !important;
}
</style>