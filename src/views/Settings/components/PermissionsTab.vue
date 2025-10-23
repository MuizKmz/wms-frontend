<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Role Permissions</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Assign permissions to roles using checkboxes. Selected permissions control module visibility.
        </p>
      </div>
    </div>

    <!-- Role Selector -->
    <div class="card bg-white dark:bg-gray-800 shadow-sm">
      <div class="card-body">
        <div class="form-control w-full max-w-xs">
          <label class="label">
            <span class="label-text dark:text-gray-300 font-semibold">Select Role</span>
          </label>
          <select
            v-model="selectedRoleId"
            @change="loadRolePermissions"
            class="select select-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Choose a role...</option>
            <option v-for="role in roles" :key="role.id" :value="role.id">
              {{ role.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Permissions Grid -->
    <div v-if="selectedRoleId && !loading" class="space-y-4">
      <div
        v-for="module in groupedPermissions"
        :key="module.module"
        class="card bg-white dark:bg-gray-800 shadow-sm"
      >
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">
              {{ module.module }}
            </h3>
            <label class="label cursor-pointer gap-2">
              <span class="label-text dark:text-gray-300 text-sm">Select All</span>
              <input
                type="checkbox"
                :checked="isAllModulePermissionsChecked(module)"
                @change="toggleAllModulePermissions(module)"
                class="checkbox checkbox-primary"
              />
            </label>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <label
              v-for="permission in module.permissions"
              :key="permission.id"
              class="label cursor-pointer justify-start gap-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
            >
              <input
                type="checkbox"
                :checked="selectedPermissions.includes(permission.id)"
                @change="togglePermission(permission.id)"
                class="checkbox checkbox-sm checkbox-primary"
              />
              <span class="label-text dark:text-gray-300 capitalize text-sm font-medium">
                {{ permission.action }}
              </span>
            </label>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div class="flex justify-end gap-2">
        <button
          @click="savePermissions"
          :disabled="saving"
          class="btn btn-primary"
        >
          <svg
            v-if="saving"
            class="animate-spin h-5 w-5 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ saving ? 'Saving...' : 'Save Permissions' }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <!-- Empty State -->
    <div v-if="!selectedRoleId && !loading" class="card bg-white dark:bg-gray-800 shadow-sm">
      <div class="card-body text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p class="text-gray-600 dark:text-gray-400">
          Select a role to manage its permissions
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from '@/utils/axios'

const API_URL = '' // Empty because axios baseURL is already '/api'

interface Permission {
  id: number
  module: string
  action: string
  resource: string
  description: string
}

interface Role {
  id: number
  name: string
  description: string
}

const roles = ref<Role[]>([])
const allPermissions = ref<Permission[]>([])
const selectedRoleId = ref('')
const selectedPermissions = ref<number[]>([])
const loading = ref(false)
const saving = ref(false)

// Group permissions by module
const groupedPermissions = computed(() => {
  const groups: { [key: string]: { module: string; permissions: Permission[] } } = {}

  allPermissions.value.forEach((permission) => {
    if (!groups[permission.module]) {
      groups[permission.module] = {
        module: permission.module,
        permissions: []
      }
    }
    groups[permission.module].permissions.push(permission)
  })

  return Object.values(groups)
})

const fetchRoles = async () => {
  try {
    const response = await axios.get(`${API_URL}/roles`)
    roles.value = response.data
  } catch (error) {
    console.error('Error fetching roles:', error)
  }
}

const fetchAllPermissions = async () => {
  try {
    const response = await axios.get(`${API_URL}/permissions`)
    allPermissions.value = response.data
  } catch (error) {
    console.error('Error fetching permissions:', error)
  }
}

const loadRolePermissions = async () => {
  if (!selectedRoleId.value) {
    selectedPermissions.value = []
    return
  }

  loading.value = true
  try {
    const response = await axios.get(`${API_URL}/roles/${selectedRoleId.value}/permissions`)
    selectedPermissions.value = response.data.map((p: Permission) => p.id)
  } catch (error) {
    console.error('Error fetching role permissions:', error)
    alert('Failed to load role permissions')
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

const isAllModulePermissionsChecked = (module: { permissions: Permission[] }) => {
  return module.permissions.every((p) => selectedPermissions.value.includes(p.id))
}

const toggleAllModulePermissions = (module: { permissions: Permission[] }) => {
  const allChecked = isAllModulePermissionsChecked(module)
  const modulePermissionIds = module.permissions.map(p => p.id)

  if (allChecked) {
    // Uncheck all - create new array without these IDs
    selectedPermissions.value = selectedPermissions.value.filter(
      id => !modulePermissionIds.includes(id)
    )
  } else {
    // Check all - create new array with unique values
    const newPermissions = [...selectedPermissions.value]
    modulePermissionIds.forEach((id) => {
      if (!newPermissions.includes(id)) {
        newPermissions.push(id)
      }
    })
    selectedPermissions.value = newPermissions
  }
}

const savePermissions = async () => {
  if (!selectedRoleId.value) return

  saving.value = true
  try {
    await axios.put(`${API_URL}/roles/${selectedRoleId.value}/permissions`, {
      permissionIds: selectedPermissions.value
    })
    alert('Permissions updated successfully!')
  } catch (error: any) {
    console.error('Error saving permissions:', error)
    alert(error.response?.data?.message || 'Failed to save permissions')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchRoles()
  fetchAllPermissions()
})
</script>
