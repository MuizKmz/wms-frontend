<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
        @click.self="closeModal"
      >
        <transition name="slide-up">
          <div
            v-if="isOpen"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            @click.stop
          >
            <!-- Modal Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                Permissions for {{ userName }}
              </h3>
              <button
                type="button"
                @click="closeModal"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="p-6">
              <div v-if="permissions">
                <div class="alert alert-info mb-4">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Role: <strong>{{ permissions.roleName }}</strong></span>
                </div>

                <div class="space-y-4 max-h-[50vh] overflow-y-auto">
                  <div
                    v-for="module in permissions.modules"
                    :key="module.module"
                    class="card bg-gray-50 dark:bg-gray-700"
                  >
                    <div class="card-body p-4">
                      <h4 class="font-bold text-gray-900 dark:text-white mb-2">{{ module.module }}</h4>
                      <div class="flex flex-wrap gap-2">
                        <div
                          v-for="permission in module.permissions"
                          :key="permission"
                          class="badge badge-primary badge-lg capitalize"
                        >
                          {{ permission }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Modal Actions -->
              <div class="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="button" @click="closeModal" class="btn">
                  Close
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
import { ref } from 'vue'

interface PermissionModule {
  module: string
  permissions: string[]
}

interface UserPermissions {
  roleName: string
  modules: PermissionModule[]
}

const emit = defineEmits<{
  close: []
}>()

const isOpen = ref(false)
const userName = ref('')
const permissions = ref<UserPermissions | null>(null)

const openModal = (data: { userName: string; permissions: UserPermissions }) => {
  userName.value = data.userName
  permissions.value = data.permissions
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
  userName.value = ''
  permissions.value = null
  emit('close')
}

defineExpose({
  openModal,
  closeModal
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
