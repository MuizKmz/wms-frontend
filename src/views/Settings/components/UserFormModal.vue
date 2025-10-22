<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="closeModal">
        <div class="absolute inset-0 bg-black/50"></div>

        <div class="relative z-10 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
            <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ editingUser ? 'Edit User' : 'Create User' }}
              </h2>
              <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" @click="closeModal">✕</button>
            </div>

            <form @submit.prevent="saveUser" class="p-6 space-y-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text dark:text-gray-300">Username</span>
                </label>
                <input
                  v-model="userForm.username"
                  type="text"
                  placeholder="john_doe"
                  class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text dark:text-gray-300">Full Name</span>
                </label>
                <input
                  v-model="userForm.fullName"
                  type="text"
                  placeholder="John Doe"
                  class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text dark:text-gray-300">Email</span>
                </label>
                <input
                  v-model="userForm.email"
                  type="email"
                  placeholder="john@example.com"
                  class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text dark:text-gray-300">Phone</span>
                </label>
                <input
                  v-model="userForm.phone"
                  type="tel"
                  placeholder="+60123456789"
                  class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text dark:text-gray-300">Role</span>
                </label>
                <select
                  v-model="userForm.roleId"
                  class="select select-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select a role</option>
                  <option v-for="role in roles" :key="role.id" :value="role.id">
                    {{ role.name }}
                  </option>
                </select>
              </div>

              <div v-if="!editingUser" class="form-control">
                <label class="label">
                  <span class="label-text dark:text-gray-300">Password</span>
                </label>
                <input
                  v-model="userForm.password"
                  type="password"
                  placeholder="••••••••"
                  class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  :required="!editingUser"
                />
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

const props = defineProps<{
  roles: any[]
}>()

const emit = defineEmits(['saved'])

const isOpen = ref(false)
const editingUser = ref<any>(null)
const userForm = ref({
  username: '',
  fullName: '',
  email: '',
  phone: '',
  roleId: '',
  password: '',
  language: 'en'
})

const openModal = (user?: any) => {
  if (user) {
    editingUser.value = user
    userForm.value = {
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      roleId: user.role?.id || '',
      password: '',
      language: user.language || 'en'
    }
  } else {
    editingUser.value = null
    userForm.value = {
      username: '',
      fullName: '',
      email: '',
      phone: '',
      roleId: '',
      password: '',
      language: 'en'
    }
  }
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
}

const saveUser = () => {
  const dataToSend = editingUser.value
    ? { ...userForm.value, password: undefined } // Don't send password on edit
    : userForm.value

  emit('saved', {
    data: dataToSend,
    isEdit: !!editingUser.value,
    userId: editingUser.value?.id
  })
  closeModal()
}

defineExpose({ openModal, closeModal })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
