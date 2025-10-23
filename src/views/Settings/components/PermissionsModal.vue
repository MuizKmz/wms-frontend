<template>
  <!-- Toast Notification -->
  <div v-if="showToast" class="fixed inset-0 flex items-center justify-center z-[10000] pointer-events-none">
    <div :class="[
      'rounded-lg px-6 py-4 shadow-lg flex items-center transform transition-all duration-300',
      toastType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    ]">
      <span v-if="toastType === 'success'" class="mr-2">✓</span>
      <span v-else class="mr-2">⚠</span>
      {{ toastMessage }}
    </div>
  </div>

  <teleport to="body">
    <transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
        @click.self="closeModal"
      >
        <transition name="slide-up">
          <div
            v-if="show"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            @click.stop
          >
            <!-- Modal Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                Manage Permissions for "{{ role.name }}"
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
              <div v-if="loading" class="flex justify-center py-8">
                <div class="loading loading-spinner loading-lg"></div>
              </div>

              <div v-else class="space-y-4 max-h-[60vh] overflow-y-auto">
                <!-- Module Groups -->
                <div
                  v-for="module in permissionModules"
                  :key="module.module"
                  class="card bg-gray-50 dark:bg-gray-700 shadow-sm"
                >
                  <div class="card-body p-4">
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center gap-3">
                        <div class="badge badge-primary badge-lg">{{ module.module }}</div>
                        <span class="text-sm text-gray-600 dark:text-gray-400">
                          {{ selectedPermissions.filter(p => module.permissions.some(mp => mp.id === p)).length }} / {{ module.permissions.length }} selected
                        </span>
                      </div>
                      <button
                        @click="toggleModule(module)"
                        class="btn btn-sm btn-outline"
                      >
                        {{ isModuleFullySelected(module) ? 'Deselect All' : 'Select All' }}
                      </button>
                    </div>

                    <!-- Permissions Grid -->
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      <label
                        v-for="permission in module.permissions"
                        :key="permission.id"
                        class="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-600 cursor-pointer transition-colors"
                        :class="{
                          'bg-primary/10 border-primary': selectedPermissions.includes(permission.id)
                        }"
                      >
                        <input
                          type="checkbox"
                          :checked="selectedPermissions.includes(permission.id)"
                          @change="togglePermission(permission.id)"
                          class="checkbox checkbox-primary checkbox-sm"
                        />
                        <div class="flex-1">
                          <div class="font-medium text-sm text-gray-900 dark:text-white capitalize">
                            {{ permission.action }}
                          </div>
                          <div class="text-xs text-gray-500 dark:text-gray-400" v-if="permission.description">
                            {{ permission.description }}
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal Actions -->
            <div class="flex justify-end gap-2 p-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
              <button @click="closeModal" class="btn btn-ghost">Cancel</button>
              <button @click="savePermissions" class="btn btn-primary" :disabled="loading || saving">
                <svg v-if="saving" class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ saving ? 'Saving...' : 'Save Permissions' }}
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  role: {
    type: Object,
    required: true,
  },
  show: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'saved'])

const API_URL = 'api'

const loading = ref(false)
const saving = ref(false)
const permissionModules = ref([])
const selectedPermissions = ref<number[]>([])

// Toast state
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

// Toast function
const showToastMessage = (message: string, type: 'success' | 'error' = 'success', duration: number = 2000) => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true

  setTimeout(() => {
    showToast.value = false
  }, duration)
}

const fetchPermissions = async () => {
  loading.value = true
  try {
    const [permissionsResponse, rolePermissionsResponse] = await Promise.all([
      axios.get(`${API_URL}/permissions`),
      axios.get(`${API_URL}/roles/${props.role.id}/permissions`),
    ])

    permissionModules.value = permissionsResponse.data

    console.log('📦 Permissions response:', permissionsResponse.data)
    console.log('👤 Role permissions response:', rolePermissionsResponse.data)

    // Role permissions endpoint returns flat array of permissions
    const rolePerms = rolePermissionsResponse.data || []
    selectedPermissions.value = rolePerms.map((p: any) => p.id)

    console.log('✅ Selected permission IDs:', selectedPermissions.value)
  } catch (error) {
    console.error('Error fetching permissions:', error)
    showToastMessage('Failed to load permissions', 'error')
  } finally {
    loading.value = false
  }
}

const togglePermission = (permissionId: number) => {
  const index = selectedPermissions.value.indexOf(permissionId)
  if (index > -1) {
    selectedPermissions.value.splice(index, 1)
  } else {
    selectedPermissions.value.push(permissionId)
  }
}

const isModuleFullySelected = (module: any) => {
  return module.permissions.every((p: any) => selectedPermissions.value.includes(p.id))
}

const toggleModule = (module: any) => {
  const isFullySelected = isModuleFullySelected(module)
  if (isFullySelected) {
    // Deselect all permissions in this module
    module.permissions.forEach((p: any) => {
      const index = selectedPermissions.value.indexOf(p.id)
      if (index > -1) {
        selectedPermissions.value.splice(index, 1)
      }
    })
  } else {
    // Select all permissions in this module
    module.permissions.forEach((p: any) => {
      if (!selectedPermissions.value.includes(p.id)) {
        selectedPermissions.value.push(p.id)
      }
    })
  }
}

const savePermissions = async () => {
  saving.value = true
  try {
    console.log('💾 Saving permissions:', selectedPermissions.value)

    await axios.post(`${API_URL}/roles/${props.role.id}/permissions`, {
      permissionIds: selectedPermissions.value,
    })

    console.log('✅ Permissions saved successfully')
    showToastMessage('Permissions updated successfully!', 'success')
    emit('saved')
    closeModal()
  } catch (error) {
    console.error('Error saving permissions:', error)
    showToastMessage('Failed to save permissions', 'error')
  } finally {
    saving.value = false
  }
}

const closeModal = () => {
  emit('close')
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    fetchPermissions()
  }
})

onMounted(() => {
  if (props.show) {
    fetchPermissions()
  }
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
