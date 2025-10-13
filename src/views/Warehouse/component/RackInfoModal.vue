<template>
  <teleport to="body">
    <transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-250 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[60] flex items-center justify-center"
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
            class="relative z-10 w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl"
            @click.stop
          >
            <div class="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Rack Information</h3>
              <button
                type="button"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                @click="closeModal"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div class="p-6">
              <p class="text-sm text-gray-700 dark:text-gray-300">
                A rack is a storage unit within a warehouse that holds multiple sections. Each rack is identified by a unique rack code and belongs to a specific warehouse.
              </p>
              <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p class="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Tip:</strong> Make sure to select a warehouse first before choosing or creating a rack.
                </p>
              </div>
            </div>
            <div class="flex justify-end p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button @click="closeModal" class="btn btn-primary">
                Got it
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref } from 'vue'

const isOpen = ref(false)

const openModal = () => {
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
}

defineExpose({ openModal, closeModal })
</script>