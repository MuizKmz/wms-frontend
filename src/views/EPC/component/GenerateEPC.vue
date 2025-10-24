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

                <!-- Corp Code: Select or Create -->
                <div class="relative">
                  <label class="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                    <span class="text-red-500">*</span> Corp Code
                  </label>
                  <div class="flex gap-2">
                    <div class="dropdown relative inline-flex w-full" ref="corpCodeDropdownRef">
                      <button
                        type="button"
                        :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400', { 'btn-error': errors.corpCode }]"
                        :aria-expanded="openDropdowns.corpCode"
                        @click.stop="toggleDropdown('corpCode')"
                        :disabled="loadingCorpCodes"
                      >
                        {{ selectedCorpCodeLabel || 'Select or Create' }}
                        <span
                          class="icon-[tabler--chevron-down] size-4 transition-transform"
                          :class="{ 'rotate-180': openDropdowns.corpCode }"
                        ></span>
                      </button>

                      <ul
                        class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white max-h-60 overflow-y-auto"
                        :class="{ 'opacity-100 pointer-events-auto': openDropdowns.corpCode, 'opacity-0 pointer-events-none': !openDropdowns.corpCode }"
                        role="menu"
                      >
                        <li v-for="code in corpCodes" :key="code.id" class="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                          <a
                            class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
                            @click="selectCorpCode(code)"
                          >
                            {{ code.code }} <span v-if="code.label" class="text-gray-500 dark:text-gray-400">- {{ code.label }}</span>
                          </a>
                        </li>
                        <li class="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
                          <button
                            type="button"
                            class="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                            @click="openCreateCorpCode"
                          >
                            + Create New Corp Code
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div v-if="errors.corpCode" class="text-xs text-red-600 dark:text-red-400 mt-1">{{ errors.corpCode }}</div>
                </div>

                <!-- Create New Corp Code Modal (Inline) -->
                <div v-if="showCreateCorpCode" class="p-4 border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 class="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Create New Corp Code</h3>
                  <div class="space-y-3">
                    <div>
                      <label class="block text-xs mb-1 text-gray-700 dark:text-gray-300">
                        Code (4 Hex Characters)
                      </label>
                      <input
                        v-model="newCorpCodeForm.code"
                        type="text"
                        placeholder="e.g., AA00"
                        maxlength="4"
                        class="input input-bordered w-full text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white uppercase"
                        @input="newCorpCodeForm.code = $event.target.value.toUpperCase()"
                      />
                      <div v-if="errors.newCorpCodeCode" class="text-xs text-red-600 dark:text-red-400 mt-1">{{ errors.newCorpCodeCode }}</div>
                    </div>
                    <div>
                      <label class="block text-xs mb-1 text-gray-700 dark:text-gray-300">
                        Label (Optional)
                      </label>
                      <input
                        v-model="newCorpCodeForm.label"
                        type="text"
                        placeholder="e.g., Main Office"
                        maxlength="100"
                        class="input input-bordered w-full text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div class="flex gap-2">
                      <button
                        type="button"
                        @click="createCorpCode"
                        class="btn btn-sm btn-primary"
                        :disabled="!newCorpCodeForm.code"
                      >
                        Create
                      </button>
                      <button
                        type="button"
                        @click="showCreateCorpCode = false"
                        class="btn btn-sm btn-outline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Product Name -->
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

                <!-- Batch Name -->
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

                <!-- Batch Quantity -->
                <div class="relative">
                  <label class="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                    Batch Quantity (Serial: 000001 - {{ String(form.batchQuantity).padStart(6, '0') }})
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

                <!-- Remarks -->
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
import authenticatedFetch from '@/utils/authenticatedFetch'

interface Product {
  id: number
  name: string
  skuCode?: string
}

interface CorpCode {
  id: number
  code: string
  label?: string
}

interface EPCForm {
  corpCodeId: number | null
  productId: number | null
  batchName: string
  batchQuantity: number
  remarks: string
}

const emit = defineEmits(['epc-generated'])

/* State */
const isOpen = ref(false)
const isSubmitting = ref(false)
const loadingProducts = ref(false)
const loadingCorpCodes = ref(false)
const showCreateCorpCode = ref(false)
const panelRef = ref<HTMLElement | null>(null)

const form = reactive<EPCForm>({
  corpCodeId: null,
  productId: null,
  batchName: '',
  batchQuantity: 1,
  remarks: ''
})

const newCorpCodeForm = reactive({
  code: '',
  label: ''
})

const errors = reactive({
  submit: '',
  corpCode: '',
  productName: '',
  batchName: '',
  batchQuantity: '',
  remarks: '',
  newCorpCodeCode: '',
})

const products = ref<Product[]>([])
const corpCodes = ref<CorpCode[]>([])
const openDropdowns = reactive<Record<string, boolean>>({
  corpCode: false,
  product: false
})

const selectedCorpCodeLabel = computed(() => {
  if (!form.corpCodeId) return null
  const code = corpCodes.value.find(c => c.id === form.corpCodeId)
  return code ? `${code.code}${code.label ? ` - ${code.label}` : ''}` : null
})

const selectedProductLabel = computed(() => {
  if (!form.productId) return null
  const product = products.value.find(p => p.id === form.productId)
  return product?.name || null
})

/* Scroll Lock */
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
  loadingCorpCodes.value = true
  loadingProducts.value = true
  try {
    const [corpCodesRes, productsRes] = await Promise.all([
      authenticatedFetch('/api/corp-code'),
      authenticatedFetch('/api/product')
    ])

    if (corpCodesRes.ok) {
      corpCodes.value = await corpCodesRes.json()
    } else {
      errors.submit = 'Failed to load corp codes'
    }

    if (productsRes.ok) {
      const list = await productsRes.json()
      products.value = (Array.isArray(list) ? list : []).map((p: any) => ({
        id: p.id,
        name: p.name || p.productCode || p.sku_code || String(p.id),
        skuCode: p.sku_code || p.skuCode || null,
      }))
    } else {
      errors.submit = 'Failed to load products'
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    errors.submit = 'Failed to load data'
  } finally {
    loadingCorpCodes.value = false
    loadingProducts.value = false
  }
}

/* Validation */
const validateForm = () => {
  Object.keys(errors).forEach(key => (errors[key as keyof typeof errors] = ''))
  let isValid = true

  if (!form.corpCodeId) {
    errors.corpCode = 'Corp Code selection is required'
    isValid = false
  }

  if (!form.productId) {
    errors.productName = 'Product selection is required'
    isValid = false
  }

  if (form.batchQuantity < 1) {
    errors.batchQuantity = 'Quantity must be at least 1'
    isValid = false
  }

  return isValid
}

/* Helpers */
const toggleDropdown = (name: string) => {
  Object.keys(openDropdowns).forEach(k => {
    if (k !== name) openDropdowns[k] = false
  })
  openDropdowns[name] = !openDropdowns[name]
}

const selectCorpCode = (code: CorpCode) => {
  form.corpCodeId = code.id
  openDropdowns.corpCode = false
  showCreateCorpCode.value = false
}

const selectProduct = (product: Product) => {
  form.productId = product.id
  openDropdowns.product = false
}

const updateQuantity = (change: number) => {
  form.batchQuantity = Math.max(1, form.batchQuantity + change)
}

const openCreateCorpCode = () => {
  showCreateCorpCode.value = true
  openDropdowns.corpCode = false
}

const createCorpCode = async () => {
  errors.newCorpCodeCode = ''
  if (!/^[0-9A-Fa-f]{4}$/.test(newCorpCodeForm.code)) {
    errors.newCorpCodeCode = 'Must be exactly 4 hexadecimal characters'
    return
  }

  try {
    const response = await fetch('/api/corp-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: newCorpCodeForm.code.toUpperCase(),
        label: newCorpCodeForm.label || null
      })
    })

    if (response.ok) {
      const newCode = await response.json()
      corpCodes.value.push(newCode)
      form.corpCodeId = newCode.id
      newCorpCodeForm.code = ''
      newCorpCodeForm.label = ''
      showCreateCorpCode.value = false
      openDropdowns.corpCode = false
    } else {
      errors.newCorpCodeCode = 'Failed to create corp code'
    }
  } catch (error) {
    errors.newCorpCodeCode = 'Error creating corp code'
  }
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

  form.corpCodeId = null
  form.productId = null
  form.batchName = ''
  form.batchQuantity = 1
  form.remarks = ''
  newCorpCodeForm.code = ''
  newCorpCodeForm.label = ''
  showCreateCorpCode.value = false
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
      corpCodeId: form.corpCodeId,
      productId: form.productId,
      batchName: form.batchName || null,
      batchQuantity: form.batchQuantity,
      remarks: form.remarks || null,
    }

    const response = await authenticatedFetch('/api/epc/generate', {
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

defineExpose({ openModal, closeModal })
</script>

<style scoped>
[role="dialog"] > .bg-white {
  transform-origin: center;
}

.input-bordered.border-x-0 {
  border-left-width: 0px !important;
  border-right-width: 0px !important;
  border-radius: 0 !important;
}
</style>
