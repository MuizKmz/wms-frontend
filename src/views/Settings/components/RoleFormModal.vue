<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="closeModal">
        <div class="absolute inset-0 bg-black/50"></div>

        <div class="relative z-10 w-full max-w-md mx-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
            <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ editingRole ? 'Edit Role' : 'Create Role' }}
              </h2>
              <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" @click="closeModal">✕</button>
            </div>

            <form @submit.prevent="saveRole" class="p-6 space-y-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text dark:text-gray-300">Role Name</span>
                </label>
                <input
                  v-model="roleForm.name"
                  type="text"
                  placeholder="e.g., Warehouse Manager"
                  class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text dark:text-gray-300">Description</span>
                </label>
                <textarea
                  v-model="roleForm.description"
                  placeholder="Role description"
                  class="textarea textarea-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                ></textarea>
              </div>

              <div class="form-control">
                <label class="label cursor-pointer justify-start gap-3">
                  <input
                    v-model="roleForm.isActive"
                    type="checkbox"
                    class="checkbox checkbox-primary"
                  />
                  <span class="label-text dark:text-gray-300">Active</span>
                </label>
              </div>

              <div class="flex justify-end gap-2 pt-4">
                <button type="button" @click="closeModal" class="btn btn-ghost">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['saved'])

const isOpen = ref(false)
const editingRole = ref<any>(null)
const roleForm = ref({
  name: '',
  description: '',
  isActive: true,
})

const openModal = (role?: any) => {
  if (role) {
    editingRole.value = role
    roleForm.value = {
      name: role.name,
      description: role.description || '',
      isActive: role.isActive,
    }
  } else {
    editingRole.value = null
    roleForm.value = {
      name: '',
      description: '',
      isActive: true,
    }
  }
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
}

const saveRole = () => {
  emit('saved', {
    data: roleForm.value,
    isEdit: !!editingRole.value,
    roleId: editingRole.value?.id
  })
  closeModal()
}

defineExpose({ openModal, closeModal })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
