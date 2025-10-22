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
            class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            @click.stop
          >
            <!-- Modal Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                Assign Role to {{ userName }}
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
              <form @submit.prevent="handleSubmit" class="space-y-4">
                <div class="form-control">
                  <label class="label">
                    <span class="label-text dark:text-gray-300">Select Role</span>
                  </label>
                  <select
                    v-model="selectedRoleId"
                    class="select select-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Choose a role...</option>
                    <option v-for="role in roles" :key="role.id" :value="role.id">
                      {{ role.name }}
                    </option>
                  </select>
                </div>

                <!-- Modal Actions -->
                <div class="flex justify-end gap-2 pt-4">
                  <button type="button" @click="closeModal" class="btn btn-ghost">
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary">
                    Assign Role
                  </button>
                </div>
              </form>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Role {
  id: number
  name: string
  description: string
}

interface Props {
  roles: Role[]
}

defineProps<Props>()

const emit = defineEmits<{
  assigned: [{ userId: number; roleId: number }]
  close: []
}>()

const isOpen = ref(false)
const selectedRoleId = ref('')
const userName = ref('')
const currentUserId = ref<number | null>(null)

const openModal = (user: any) => {
  currentUserId.value = user.id
  userName.value = user.fullName
  selectedRoleId.value = user.role?.id?.toString() || ''
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
  selectedRoleId.value = ''
  userName.value = ''
  currentUserId.value = null
  emit('close')
}

const handleSubmit = () => {
  if (currentUserId.value && selectedRoleId.value) {
    emit('assigned', {
      userId: currentUserId.value,
      roleId: parseInt(selectedRoleId.value)
    })
    closeModal()
  }
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
