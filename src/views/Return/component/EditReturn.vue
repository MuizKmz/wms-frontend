<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="closeModal">
        <div class="absolute inset-0 bg-black/50"></div>

        <div ref="panelRef" class="relative z-10 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
            <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Edit Return</h2>
              <button class="text-gray-400 hover:text-gray-600" @click="closeModal">✕</button>
            </div>

            <div class="p-6">
              <form @submit.prevent="submitForm" class="space-y-6">
                <!-- Return Information -->
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Return Information</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Return Number
                      </label>
                      <input
                        v-model="formData.returnNo"
                        type="text"
                        disabled
                        class="input input-bordered w-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Return Type <span class="text-red-500">*</span>
                      </label>
                      <div class="dropdown relative inline-flex w-full" ref="returnTypeDropdownRef">
                        <button
                          type="button"
                          class="dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400 text-left"
                          :aria-expanded="openDropdowns.returnType"
                          @click.stop="toggleDropdown('returnType')"
                        >
                          <span class="truncate pr-2">{{ formData.returnType || 'Choose Return Type' }}</span>
                          <span
                            class="icon-[tabler--chevron-down] size-4 transition-transform flex-shrink-0"
                            :class="{ 'rotate-180': openDropdowns.returnType }"
                          ></span>
                        </button>
                        <teleport to="body">
                          <ul
                            v-if="openDropdowns.returnType"
                            class="dropdown-menu transition-opacity duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-gray-900 dark:text-white opacity-100"
                            :style="returnTypeMenuStyle"
                            role="menu"
                          >
                            <li>
                              <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectReturnType('Customer')">
                                Customer
                              </a>
                            </li>
                            <li>
                              <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectReturnType('Supplier')">
                                Supplier
                              </a>
                            </li>
                            <li>
                              <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectReturnType('Internal')">
                                Internal
                              </a>
                            </li>
                            <li>
                              <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectReturnType('Failed Delivery')">
                                Failed Delivery
                              </a>
                            </li>
                          </ul>
                        </teleport>
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Reference Number
                      </label>
                      <input
                        v-model="formData.referenceNo"
                        type="text"
                        disabled
                        class="input input-bordered w-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Return Date <span class="text-red-500">*</span>
                      </label>
                      <input
                        ref="returnDateInput"
                        v-model="formData.returnDate"
                        type="text"
                        required
                        placeholder="Select date"
                        class="input input-bordered w-full dark:bg-gray-700 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        From
                      </label>
                      <input
                        v-model="formData.from"
                        type="text"
                        disabled
                        placeholder="Depends on Return Type"
                        class="input input-bordered w-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        To
                      </label>
                      <input
                        v-model="formData.to"
                        type="text"
                        disabled
                        placeholder="Depends on Return Type"
                        class="input input-bordered w-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Created By
                      </label>
                      <input
                        v-model="formData.createdBy"
                        type="text"
                        placeholder="Created by"
                        class="input input-bordered w-full dark:bg-gray-700 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>

                <!-- Products Section -->
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Products</h3>
                  <div v-for="(product, productIndex) in formData.products" :key="productIndex" class="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div class="flex items-center justify-between mb-4">
                      <h4 class="text-md font-medium text-gray-900 dark:text-white">Product {{ productIndex + 1 }}</h4>
                      <button
                        v-if="formData.products.length > 1"
                        type="button"
                        @click="removeProduct(productIndex)"
                        class="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div class="mb-4">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Product Name <span class="text-red-500">*</span>
                      </label>
                      <div class="dropdown relative inline-flex w-full" :ref="el => { if (el) productDropdownRefs[productIndex] = el }">
                        <button
                          type="button"
                          class="dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400 text-left"
                          :aria-expanded="openDropdowns[`product${productIndex}`]"
                          @click.stop="toggleProductDropdown(productIndex)"
                          :disabled="product.productId > 0"
                        >
                          <span class="truncate pr-2">{{ product.productName || 'Choose Product' }}</span>
                          <span
                            v-if="product.productId === 0"
                            class="icon-[tabler--chevron-down] size-4 transition-transform flex-shrink-0"
                            :class="{ 'rotate-180': openDropdowns[`product${productIndex}`] }"
                          ></span>
                        </button>
                      </div>
                      <teleport to="body">
                        <ul
                          v-if="openDropdowns[`product${productIndex}`]"
                          class="dropdown-menu transition-opacity duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-gray-900 dark:text-white opacity-100"
                          :style="productMenuStyles[productIndex] || { position: 'fixed', zIndex: 9999 }"
                          role="menu"
                        >
                          <li v-if="availableProducts.length === 0" class="px-4 py-2 text-sm text-gray-500">
                            No products available
                          </li>
                          <li v-for="availProduct in availableProducts" :key="availProduct.id">
                            <a 
                              class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" 
                              @click="selectProduct(productIndex, availProduct)"
                            >
                              <div class="font-medium">{{ availProduct.name }}</div>
                              <div class="text-xs text-gray-500">SKU: {{ availProduct.skuCode }} • Max: {{ availProduct.maxQuantity }}</div>
                            </a>
                          </li>
                        </ul>
                      </teleport>
                    </div>

                    <!-- Reasons -->
                    <div class="space-y-3">
                      <div v-for="(reason, reasonIndex) in product.reasons" :key="reasonIndex" class="grid grid-cols-12 gap-2 items-start">
                        <div class="col-span-2">
                          <label v-if="reasonIndex === 0" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Quantity <span class="text-red-500">*</span>
                          </label>
                          <input
                            v-model.number="reason.quantity"
                            type="number"
                            required
                            min="1"
                            class="input input-bordered w-full dark:bg-gray-700 dark:text-gray-100"
                          />
                        </div>

                        <div class="col-span-4">
                          <label v-if="reasonIndex === 0" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Reason of Return <span class="text-red-500">*</span>
                          </label>
                          <div class="dropdown relative inline-flex w-full">
                            <button
                              type="button"
                              class="dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400 text-left text-sm"
                              :aria-expanded="openDropdowns[`reason${productIndex}_${reasonIndex}`]"
                              @click.stop="toggleDropdown(`reason${productIndex}_${reasonIndex}`)"
                            >
                              <span class="truncate pr-2">{{ reason.reasonOfReturn || 'Choose Reason' }}</span>
                              <span
                                class="icon-[tabler--chevron-down] size-4 transition-transform flex-shrink-0"
                                :class="{ 'rotate-180': openDropdowns[`reason${productIndex}_${reasonIndex}`] }"
                              ></span>
                            </button>
                          </div>
                          <teleport to="body">
                            <ul
                              v-if="openDropdowns[`reason${productIndex}_${reasonIndex}`]"
                              class="dropdown-menu transition-opacity duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-gray-900 dark:text-white opacity-100"
                              :style="reasonMenuStyles[`reason${productIndex}_${reasonIndex}`] || { position: 'fixed', zIndex: 9999 }"
                              role="menu"
                            >
                              <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="reason.reasonOfReturn = 'Defective'; openDropdowns[`reason${productIndex}_${reasonIndex}`] = false">Defective</a></li>
                              <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="reason.reasonOfReturn = 'Wrong Item'; openDropdowns[`reason${productIndex}_${reasonIndex}`] = false">Wrong Item</a></li>
                              <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="reason.reasonOfReturn = 'Damaged'; openDropdowns[`reason${productIndex}_${reasonIndex}`] = false">Damaged</a></li>
                              <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="reason.reasonOfReturn = 'Expired'; openDropdowns[`reason${productIndex}_${reasonIndex}`] = false">Expired</a></li>
                              <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="reason.reasonOfReturn = 'Other'; openDropdowns[`reason${productIndex}_${reasonIndex}`] = false">Other</a></li>
                            </ul>
                          </teleport>
                        </div>

                        <div class="col-span-5">
                          <label v-if="reasonIndex === 0" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Other
                          </label>
                          <input
                            v-model="reason.other"
                            type="text"
                            placeholder="Specify other reason"
                            :disabled="reason.reasonOfReturn !== 'Other'"
                            class="input input-bordered w-full dark:bg-gray-700 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                          />
                        </div>

                        <div class="col-span-1 flex items-end">
                          <button
                            v-if="product.reasons.length > 1"
                            type="button"
                            @click="removeReason(productIndex, reasonIndex)"
                            class="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      @click="addReasonOfReturn(productIndex)"
                      class="mt-3 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      + Add Reason of Return
                    </button>

                    <div class="mt-4">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        EPC for Return
                      </label>
                      <textarea
                        v-model="product.epcForReturn"
                        rows="2"
                        placeholder="Enter EPC codes"
                        class="textarea textarea-bordered w-full dark:bg-gray-700 dark:text-gray-100"
                      ></textarea>
                    </div>
                  </div>

                  <button
                    type="button"
                    @click="addProduct"
                    class="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors"
                  >
                    + Add Product
                  </button>
                </div>

                <!-- Remarks -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Remarks
                  </label>
                  <textarea
                    v-model="formData.remarks"
                    rows="3"
                    placeholder="Additional remarks or comments..."
                    class="textarea textarea-bordered w-full dark:bg-gray-700 dark:text-gray-100"
                  ></textarea>
                </div>
              </form>
            </div>

            <div class="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button class="btn btn-outline" @click="closeModal">Cancel</button>
              <button class="btn bg-brand-500" @click="submitForm">Update Return</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onBeforeUnmount, computed } from 'vue'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.css'

interface Product {
  productId: number
  productName: string
  reasons: Array<{
    quantity: number
    reasonOfReturn: string
    other: string
  }>
  epcForReturn: string
}

interface Order {
  id: number
  orderType: string
  orderNo: string
  status: string
  customer: { 
    id: number
    customerName: string 
  } | null
  supplier: { 
    id: number
    supplierName: string 
  } | null
  orderItems: Array<{
    id: number
    productId: number
    quantity: number
    product: {
      id: number
      name: string
      skuCode: string
    }
  }>
}

interface ReturnData {
  id?: number
  returnNo?: string
  returnType: string
  referenceNo: string
  returnDate: string
  from: string
  to: string
  createdBy?: string
  remarks?: string
  products: Product[]
}

const emit = defineEmits<{
  'return-updated': [result: any]
}>()

const isOpen = ref(false)
const panelRef = ref<HTMLElement | null>(null)

// Order state
const allOrders = ref<Order[]>([])

// Get selected order based on reference number
const selectedOrder = computed(() => {
  return allOrders.value.find(order => order.orderNo === formData.referenceNo)
})

// Get available products from selected order (excluding already selected)
const availableProducts = computed(() => {
  if (!selectedOrder.value) return []
  
  const selectedProductIds = formData.products.map(p => p.productId)
  return selectedOrder.value.orderItems
    .filter(item => !selectedProductIds.includes(item.productId))
    .map(item => ({
      id: item.product.id,
      name: item.product.name,
      skuCode: item.product.skuCode,
      maxQuantity: item.quantity
    }))
})

const formData = reactive<ReturnData>({
  returnType: '',
  referenceNo: '',
  returnDate: new Date().toISOString().split('T')[0],
  from: '',
  to: '',
  createdBy: '',
  remarks: '',
  products: [
    { productId: 0, productName: '', reasons: [{ quantity: 1, reasonOfReturn: '', other: '' }], epcForReturn: '' }
  ]
})

// Dropdown state
const openDropdowns = reactive<Record<string, boolean>>({})
const returnTypeDropdownRef = ref<any>(null)
const productDropdownRefs = ref<any>({})
const returnTypeMenuStyle = ref<any>({})
const productMenuStyles = ref<Record<number, any>>({})
const reasonMenuStyles = ref<Record<string, any>>({})

// Flatpickr instance
const returnDateInput = ref<HTMLInputElement | null>(null)
let flatpickrReturnDate: any = null

const lockScroll = () => {
  document.body.style.overflow = 'hidden'
}

const unlockScroll = () => {
  document.body.style.overflow = ''
}

const openModal = (data: ReturnData & { order?: Order }) => {
  Object.assign(formData, data)
  
  // If order data is provided, populate allOrders so availableProducts works
  if (data.order) {
    allOrders.value = [data.order]
  }
  
  isOpen.value = true
  lockScroll()
  initializeFlatpickr()
  
  // Add event listeners
  nextTick(() => {
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('resize', repositionOpenMenus)
    window.addEventListener('scroll', repositionOpenMenus, true)
  })
}

const closeModal = () => {
  // Destroy Flatpickr instance
  if (flatpickrReturnDate) {
    flatpickrReturnDate.destroy()
    flatpickrReturnDate = null
  }
  
  // Remove event listeners
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', repositionOpenMenus)
  window.removeEventListener('scroll', repositionOpenMenus, true)
  
  isOpen.value = false
  unlockScroll()
}

const initializeFlatpickr = async () => {
  await nextTick()

  // Destroy existing instance if any
  if (flatpickrReturnDate) {
    flatpickrReturnDate.destroy()
    flatpickrReturnDate = null
  }

  // Initialize return date picker
  if (returnDateInput.value) {
    flatpickrReturnDate = flatpickr(returnDateInput.value, {
      dateFormat: 'Y-m-d',
      defaultDate: formData.returnDate
    })
  }
}

const toggleDropdown = async (name: string) => {
  Object.keys(openDropdowns).forEach(k => {
    if (k !== name) openDropdowns[k] = false
  })
  openDropdowns[name] = !openDropdowns[name]

  if (openDropdowns[name]) {
    await nextTick()
    if (name === 'returnType') {
      await positionReturnTypeMenu()
    } else if (name.startsWith('reason')) {
      await positionReasonMenu(name)
    }
  }
}

const selectReturnType = (type: string) => {
  formData.returnType = type
  openDropdowns.returnType = false
}

const positionReturnTypeMenu = async () => {
  await nextTick()
  const container = returnTypeDropdownRef.value
  if (!container) return

  const btn = container.querySelector('button')
  if (!btn) return

  const rect = btn.getBoundingClientRect()
  const maxMenuHeight = 300
  const gap = 8
  const belowSpace = window.innerHeight - rect.bottom - gap
  const aboveSpace = rect.top - gap

  const style: any = {
    position: 'fixed',
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: '9999',
    overflowY: 'auto',
    overflowX: 'hidden'
  }

  if (belowSpace >= 150) {
    style.top = `${rect.bottom + gap}px`
    style.maxHeight = `${Math.min(maxMenuHeight, belowSpace)}px`
  } else {
    const usedHeight = Math.min(maxMenuHeight, aboveSpace)
    style.top = `${rect.top - usedHeight - gap}px`
    style.maxHeight = `${usedHeight}px`
  }

  returnTypeMenuStyle.value = style
}

const positionReasonMenu = async (key: string) => {
  await nextTick()
  
  // Find the specific dropdown button for this reason using the key
  const allDropdowns = document.querySelectorAll('.dropdown button[aria-expanded="true"]')
  let targetBtn: Element | null = null
  
  // Find the button that matches our key
  for (const btn of allDropdowns) {
    const expanded = btn.getAttribute('aria-expanded')
    if (expanded === 'true') {
      targetBtn = btn
    }
  }
  
  if (!targetBtn) return

  const rect = targetBtn.getBoundingClientRect()
  const maxMenuHeight = 250
  const gap = 8
  const belowSpace = window.innerHeight - rect.bottom - gap
  const aboveSpace = rect.top - gap

  const style: any = {
    position: 'fixed',
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: '9999',
    overflowY: 'auto',
    overflowX: 'hidden'
  }

  if (belowSpace >= 100) {
    style.top = `${rect.bottom + gap}px`
    style.maxHeight = `${Math.min(maxMenuHeight, belowSpace)}px`
  } else {
    const usedHeight = Math.min(maxMenuHeight, aboveSpace)
    style.top = `${rect.top - usedHeight - gap}px`
    style.maxHeight = `${usedHeight}px`
  }

  reasonMenuStyles.value[key] = style
}

const repositionOpenMenus = () => {
  if (openDropdowns.returnType) {
    positionReturnTypeMenu()
  }
  Object.keys(openDropdowns).forEach(key => {
    if (key.startsWith('product') && openDropdowns[key]) {
      const productIndex = parseInt(key.replace('product', ''))
      positionProductMenu(productIndex)
    }
    if (key.startsWith('reason') && openDropdowns[key]) {
      positionReasonMenu(key)
    }
  })
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node

  const dropdownMenus = document.querySelectorAll('.dropdown-menu')
  for (const menu of dropdownMenus) {
    if (menu.contains(target)) {
      return
    }
  }

  if (returnTypeDropdownRef.value && returnTypeDropdownRef.value.contains(target)) {
    return
  }

  Object.keys(openDropdowns).forEach(key => {
    openDropdowns[key] = false
  })
}

const addProduct = () => {
  formData.products.push({
    productId: 0,
    productName: '',
    reasons: [{ quantity: 1, reasonOfReturn: '', other: '' }],
    epcForReturn: ''
  })
}

const removeProduct = (index: number) => {
  if (formData.products.length > 1) {
    formData.products.splice(index, 1)
  }
}

const addReasonOfReturn = (productIndex: number) => {
  formData.products[productIndex].reasons.push({
    quantity: 1,
    reasonOfReturn: '',
    other: ''
  })
}

const removeReason = (productIndex: number, reasonIndex: number) => {
  if (formData.products[productIndex].reasons.length > 1) {
    formData.products[productIndex].reasons.splice(reasonIndex, 1)
  }
}

const selectProduct = (productIndex: number, product: any) => {
  formData.products[productIndex].productId = product.id
  formData.products[productIndex].productName = product.name
  openDropdowns[`product${productIndex}`] = false
}

const toggleProductDropdown = async (productIndex: number) => {
  const key = `product${productIndex}`
  Object.keys(openDropdowns).forEach(k => {
    if (k !== key) openDropdowns[k] = false
  })
  openDropdowns[key] = !openDropdowns[key]
  
  if (openDropdowns[key]) {
    await positionProductMenu(productIndex)
  }
}

const positionProductMenu = async (productIndex: number) => {
  await nextTick()
  const container = productDropdownRefs.value[productIndex]
  if (!container) return

  const btn = container.querySelector('button')
  if (!btn) return

  const rect = btn.getBoundingClientRect()
  const maxMenuHeight = 300
  const gap = 8
  const belowSpace = window.innerHeight - rect.bottom - gap
  const aboveSpace = rect.top - gap

  const style: any = {
    position: 'fixed',
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: '9999',
    overflowY: 'auto',
    overflowX: 'hidden'
  }

  if (belowSpace >= 150) {
    style.top = `${rect.bottom + gap}px`
    style.maxHeight = `${Math.min(maxMenuHeight, belowSpace)}px`
  } else {
    const usedHeight = Math.min(maxMenuHeight, aboveSpace)
    style.top = `${rect.top - usedHeight - gap}px`
    style.maxHeight = `${usedHeight}px`
  }

  productMenuStyles.value[productIndex] = style
}

const submitForm = async () => {
  try {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    emit('return-updated', {
      success: true,
      data: { ...formData }
    })
    closeModal()
  } catch (error) {
    console.error('Error updating return:', error)
    emit('return-updated', {
      success: false,
      error: 'Failed to update return'
    })
  }
}

defineExpose({ openModal, closeModal })

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', repositionOpenMenus)
  window.removeEventListener('scroll', repositionOpenMenus, true)

  if (flatpickrReturnDate) {
    flatpickrReturnDate.destroy()
    flatpickrReturnDate = null
  }

  if (isOpen.value) unlockScroll()
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
