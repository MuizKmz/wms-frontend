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
                        Return Type <span class="text-red-500">*</span>
                      </label>
                      <select
                        v-model="formData.returnType"
                        required
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select Type</option>
                        <option value="Customer Return">Customer Return</option>
                        <option value="Supplier Return">Supplier Return</option>
                        <option value="Damage Return">Damage Return</option>
                        <option value="Quality Return">Quality Return</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Reference No <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="formData.referenceNo"
                        type="text"
                        required
                        placeholder="e.g., ORD-2024-001"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Return Date <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="formData.returnDate"
                        type="date"
                        required
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        From <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="formData.from"
                        type="text"
                        required
                        placeholder="e.g., Customer - ABC Corp"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        To <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model="formData.to"
                        type="text"
                        required
                        placeholder="e.g., Warehouse A"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        SKU Quantity <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model.number="formData.skuQuantity"
                        type="number"
                        required
                        min="1"
                        placeholder="Number of SKUs"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Total Quantity <span class="text-red-500">*</span>
                      </label>
                      <input
                        v-model.number="formData.totalQuantity"
                        type="number"
                        required
                        min="1"
                        placeholder="Total items"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <!-- Notes -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    v-model="formData.notes"
                    rows="3"
                    placeholder="Additional notes or comments..."
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  ></textarea>
                </div>
              </form>
            </div>

            <div class="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button class="btn btn-outline" @click="closeModal">Cancel</button>
              <button class="btn btn-primary" @click="submitForm">Update Return</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

interface ReturnData {
  id?: number
  returnNo?: string
  returnType: string
  referenceNo: string
  returnDate: string
  from: string
  to: string
  skuQuantity: number
  totalQuantity: number
  notes?: string
}

const emit = defineEmits<{
  'return-updated': [result: any]
}>()

const isOpen = ref(false)
const panelRef = ref<HTMLElement | null>(null)

const formData = reactive<ReturnData>({
  returnType: '',
  referenceNo: '',
  returnDate: new Date().toISOString().split('T')[0],
  from: '',
  to: '',
  skuQuantity: 1,
  totalQuantity: 1,
  notes: ''
})

const openModal = (data: ReturnData) => {
  Object.assign(formData, data)
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
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
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
