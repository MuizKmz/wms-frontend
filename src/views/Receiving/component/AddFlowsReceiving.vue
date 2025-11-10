<template>
  <teleport to="body">
    <transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-200"
      @after-leave="unlockScroll"
    >
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" @click.self="closeModal"></div>
        <transition
          enter-active-class="transition-all duration-300"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          appear
        >
          <div v-if="isOpen" class="relative z-10 w-full max-w-3xl mx-4">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
              <!-- Header -->
              <div class="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 class="text-xl font-bold text-gray-900 dark:text-white">Add Receiving Information</h2>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Step {{ currentStep }} of {{ totalSteps }}</p>
                </div>
                <button
                  @click="closeModal"
                  :disabled="isSubmitting"
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              <!-- Step Indicator -->
              <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900/30">
                <div class="flex items-center justify-between">
                  <div
                    v-for="(step, index) in steps"
                    :key="step.id"
                    class="flex items-center flex-1"
                  >
                    <div class="flex items-center">
                      <div
                        :class="[
                          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                          currentStep > step.id
                            ? 'bg-green-500 text-white'
                            : currentStep === step.id
                            ? 'bg-brand-500 text-white'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400',
                        ]"
                      >
                        <span v-if="currentStep > step.id">✓</span>
                        <span v-else>{{ step.id }}</span>
                      </div>
                      <span
                        :class="[
                          'ml-2 text-sm font-medium hidden sm:inline',
                          currentStep === step.id
                            ? 'text-brand-600 dark:text-brand-400'
                            : currentStep > step.id
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-500 dark:text-gray-400',
                        ]"
                      >
                        {{ step.name }}
                      </span>
                    </div>
                    <div
                      v-if="index < steps.length - 1"
                      :class="[
                        'flex-1 h-0.5 mx-3',
                        currentStep > step.id ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600',
                      ]"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Form Content -->
              <div class="p-6 min-h-[400px]">
                <!-- Step 1: Supplier -->
                <div v-if="currentStep === 1">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Supplier Information</h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Supplier Name <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="formData.supplierName"
                        type="text"
                        class="input input-bordered w-full"
                        placeholder="Enter supplier name"
                      />
                      <span v-if="errors.supplierName" class="text-xs text-red-500 mt-1">{{ errors.supplierName }}</span>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Supplier Code
                      </label>
                      <input
                        v-model="formData.supplierCode"
                        type="text"
                        class="input input-bordered w-full"
                        placeholder="Enter supplier code"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Contact Person
                      </label>
                      <input
                        v-model="formData.contactPerson"
                        type="text"
                        class="input input-bordered w-full"
                        placeholder="Enter contact person"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number
                      </label>
                      <input
                        v-model="formData.phoneNumber"
                        type="text"
                        class="input input-bordered w-full"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                </div>

                <!-- Step 2: Receiving -->
                <div v-if="currentStep === 2">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Receiving Details</h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Receiving Code <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="formData.receivingCode"
                        type="text"
                        class="input input-bordered w-full"
                        placeholder="Enter receiving code"
                      />
                      <span v-if="errors.receivingCode" class="text-xs text-red-500 mt-1">{{ errors.receivingCode }}</span>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Order No <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="formData.orderNo"
                        type="text"
                        class="input input-bordered w-full"
                        placeholder="Enter order number"
                      />
                      <span v-if="errors.orderNo" class="text-xs text-red-500 mt-1">{{ errors.orderNo }}</span>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Receiving Date <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="formData.receivingDate"
                        type="date"
                        class="input input-bordered w-full"
                      />
                      <span v-if="errors.receivingDate" class="text-xs text-red-500 mt-1">{{ errors.receivingDate }}</span>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Remarks
                      </label>
                      <textarea
                        v-model="formData.remarks"
                        rows="3"
                        class="input input-bordered w-full"
                        placeholder="Enter any remarks"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <!-- Step 3: Product -->
                <div v-if="currentStep === 3">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product Information</h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        SKU Code <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="formData.skuCode"
                        type="text"
                        class="input input-bordered w-full"
                        placeholder="Enter SKU code"
                      />
                      <span v-if="errors.skuCode" class="text-xs text-red-500 mt-1">{{ errors.skuCode }}</span>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tag Code <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="formData.tagCode"
                        type="text"
                        class="input input-bordered w-full"
                        placeholder="Enter tag code"
                      />
                      <span v-if="errors.tagCode" class="text-xs text-red-500 mt-1">{{ errors.tagCode }}</span>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tag Flow
                      </label>
                      <input
                        v-model="formData.tagFlow"
                        type="text"
                        class="input input-bordered w-full"
                        placeholder="Enter tag flow"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tag Type
                      </label>
                      <input
                        v-model="formData.tagType"
                        type="text"
                        class="input input-bordered w-full"
                        placeholder="Enter tag type"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Quantity <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model.number="formData.quantity"
                        type="number"
                        min="1"
                        class="input input-bordered w-full"
                        placeholder="Enter quantity"
                      />
                      <span v-if="errors.quantity" class="text-xs text-red-500 mt-1">{{ errors.quantity }}</span>
                    </div>
                  </div>
                </div>

                <!-- Step 4: Location -->
                <div v-if="currentStep === 4">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Location & Status</h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Warehouse Code <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="formData.warehouseCode"
                        type="text"
                        class="input input-bordered w-full"
                        placeholder="Enter warehouse code"
                      />
                      <span v-if="errors.warehouseCode" class="text-xs text-red-500 mt-1">{{ errors.warehouseCode }}</span>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Rack Code
                      </label>
                      <input
                        v-model="formData.rackCode"
                        type="text"
                        class="input input-bordered w-full"
                        placeholder="Enter rack code"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Section Code
                      </label>
                      <input
                        v-model="formData.sectionCode"
                        type="text"
                        class="input input-bordered w-full"
                        placeholder="Enter section code"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status <span class="text-red-500">*</span>
                      </label>
                      <select v-model="formData.status" class="input input-bordered w-full">
                        <option value="">Select status</option>
                        <option value="RECEIVED">RECEIVED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="INBOUND">INBOUND</option>
                        <option value="GENERATED">GENERATED</option>
                      </select>
                      <span v-if="errors.status" class="text-xs text-red-500 mt-1">{{ errors.status }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer with Navigation -->
              <div class="flex items-center justify-between p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  v-if="currentStep > 1"
                  @click="previousStep"
                  :disabled="isSubmitting"
                  class="btn btn-outline"
                >
                  ← Previous
                </button>
                <div v-else></div>

                <div class="flex gap-2">
                  <button
                    @click="closeModal"
                    :disabled="isSubmitting"
                    class="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    v-if="currentStep < totalSteps"
                    @click="nextStep"
                    class="btn btn-primary"
                  >
                    Next →
                  </button>
                  <button
                    v-else
                    @click="submitForm"
                    :disabled="isSubmitting"
                    class="btn btn-primary"
                  >
                    <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
                    {{ isSubmitting ? 'Submitting...' : 'Submit' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const emit = defineEmits(['flow-created', 'close'])

const isOpen = ref(false)
const isSubmitting = ref(false)
const currentStep = ref(1)
const totalSteps = 4

const steps = [
  { id: 1, name: 'Supplier' },
  { id: 2, name: 'Receiving' },
  { id: 3, name: 'Product' },
  { id: 4, name: 'Location' },
]

const formData = reactive({
  // Step 1: Supplier
  supplierName: '',
  supplierCode: '',
  contactPerson: '',
  phoneNumber: '',
  // Step 2: Receiving
  receivingCode: '',
  orderNo: '',
  receivingDate: '',
  remarks: '',
  // Step 3: Product
  skuCode: '',
  tagCode: '',
  tagFlow: '',
  tagType: '',
  quantity: 1,
  // Step 4: Location
  warehouseCode: '',
  rackCode: '',
  sectionCode: '',
  status: '',
})

const errors = reactive<Record<string, string>>({})

const lockScroll = () => {
  document.body.style.overflow = 'hidden'
}

const unlockScroll = () => {
  document.body.style.overflow = ''
}

const openModal = () => {
  isOpen.value = true
  currentStep.value = 1
  resetForm()
  lockScroll()
}

const closeModal = () => {
  if (isSubmitting.value) return
  isOpen.value = false
  emit('close')
}

const resetForm = () => {
  (Object.keys(formData) as Array<keyof typeof formData>).forEach((key) => {
    if (key === 'quantity') {
      formData[key] = 1
    } else {
      formData[key] = ''
    }
  })
  Object.keys(errors).forEach((key) => delete errors[key])
}

const validateStep = (step: number): boolean => {
  Object.keys(errors).forEach((key) => delete errors[key])

  if (step === 1) {
    if (!formData.supplierName) errors.supplierName = 'Supplier name is required'
  } else if (step === 2) {
    if (!formData.receivingCode) errors.receivingCode = 'Receiving code is required'
    if (!formData.orderNo) errors.orderNo = 'Order number is required'
    if (!formData.receivingDate) errors.receivingDate = 'Receiving date is required'
  } else if (step === 3) {
    if (!formData.skuCode) errors.skuCode = 'SKU code is required'
    if (!formData.tagCode) errors.tagCode = 'Tag code is required'
    if (!formData.quantity || formData.quantity < 1) errors.quantity = 'Quantity must be at least 1'
  } else if (step === 4) {
    if (!formData.warehouseCode) errors.warehouseCode = 'Warehouse code is required'
    if (!formData.status) errors.status = 'Status is required'
  }

  return Object.keys(errors).length === 0
}

const nextStep = () => {
  if (!validateStep(currentStep.value)) return
  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const submitForm = async () => {
  if (!validateStep(currentStep.value)) return

  isSubmitting.value = true

  // Placeholder: Call your API here
  // Example: await api.post('/api/receiving/add-flow', formData)

  setTimeout(() => {
    isSubmitting.value = false
    emit('flow-created', {
      success: true,
      message: 'Receiving flow created successfully',
      data: { ...formData },
    })
    closeModal()
  }, 1000)
}

defineExpose({
  openModal,
  closeModal,
})
</script>
