<template>
  <div class="space-y-6">
    <!-- Header with Create Button -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">Users Management</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage users and assign roles</p>
      </div>
      <button
        @click="openCreateModal"
        class="btn bg-brand-500 border-none flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Create User
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="flex gap-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search users..."
        class="input input-bordered flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
      <div class="dropdown relative inline-flex">
        <button
          ref="roleDropdownRef"
          type="button"
          class="dropdown-toggle btn btn-outline w-48 justify-between dark:bg-gray-700 dark:text-gray-400 text-sm"
          aria-haspopup="menu"
          :aria-expanded="openDropdowns.roles"
          @click="toggleDropdown('roles')"
        >
          {{ roles.find(r => r.id === filterRole)?.name || 'All Roles' }}
          <span class="icon-[tabler--chevron-down] size-4 transition-transform" :class="{ 'rotate-180': openDropdowns.roles }"></span>
        </button>
        <ul
          class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white text-sm"
          :class="{ 'opacity-100': openDropdowns.roles, 'opacity-0 pointer-events-none': !openDropdowns.roles }"
          role="menu"
        >
          <li>
            <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('roles', '')">All Roles</a>
          </li>
          <li v-for="role in roles" :key="role.id">
            <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('roles', role.id)">{{ role.name }}</a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="loading loading-spinner loading-lg"></div>
    </div>

    <!-- Users Table -->
    <div v-else class="card bg-white dark:bg-gray-800 shadow-md">
      <div class="overflow-x-auto">
        <table class="table table-zebra mb-3">
          <thead>
            <tr class="text-gray-900 dark:text-white">
              <th>User</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id" class="hover">
              <td>
                <div class="flex items-center gap-3">
                  <div class="avatar placeholder">
                    <div class="bg-primary text-primary-content rounded-full w-10 h-10 relative">
                      <span class="absolute inset-0 flex items-center justify-center text-sm leading-none text-center">{{ getUserInitials(user.fullName) }}</span>
                    </div>
                  </div>
                  <div>
                    <div class="font-bold text-gray-900 dark:text-white">{{ user.fullName }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">@{{ user.username }}</div>
                  </div>
                </div>
              </td>
              <td class="text-gray-900 dark:text-white">{{ user.email }}</td>
              <td class="text-gray-900 dark:text-white">{{ user.phone || 'N/A' }}</td>
              <td>
                <div class="badge badge-primary badge-lg">{{ user.role?.name }}</div>
              </td>
              <td class="text-gray-900 dark:text-white">
                {{ new Date(user.createdAt).toLocaleDateString() }}
              </td>
              <td>
                <div class="flex gap-2">
                  <button
                    @click="openRoleModal(user)"
                    class="btn btn-sm btn-outline btn-info"
                    title="Assign Role"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </button>
                  <button
                    @click="viewPermissions(user)"
                    class="btn btn-sm btn-outline btn-secondary"
                    title="View Permissions"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    @click="openEditModal(user)"
                    class="btn btn-sm btn-outline btn-warning"
                    title="Edit User"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="deleteUser(user)"
                    class="btn btn-sm btn-outline btn-error"
                    title="Delete User"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- User Form Modal -->
    <UserFormModal ref="userFormModalRef" :roles="roles" @saved="handleUserSaved" />

    <!-- Assign Role Modal -->
    <AssignRoleModal ref="assignRoleModalRef" :roles="roles" @assigned="handleRoleAssigned" />

    <!-- Permissions Modal (View Only) -->
    <PermissionsViewModal ref="permissionsViewModalRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from '@/utils/axios'
import UserFormModal from './UserFormModal.vue'
import AssignRoleModal from './AssignRoleModal.vue'
import PermissionsViewModal from './PermissionsViewModal.vue'

const API_URL = '' // Empty because axios baseURL is already '/api'

const users = ref<any[]>([])
const roles = ref<any[]>([])
const loading = ref(false)
const searchQuery = ref('')
const filterRole = ref('')

// Dropdown state for role filter (Warehouse-style)
const openDropdowns = ref<Record<string, boolean>>({ roles: false })
const roleDropdownRef = ref<HTMLElement | null>(null)

const toggleDropdown = (name: string) => {
  Object.keys(openDropdowns.value).forEach((k) => {
    if (k !== name) (openDropdowns.value as Record<string, boolean>)[k] = false
  })
  ;(openDropdowns.value as Record<string, boolean>)[name] = !(openDropdowns.value as Record<string, boolean>)[name]
}

const selectOption = (key: string, value: any) => {
  if (key === 'roles') filterRole.value = value
  ;(openDropdowns.value as Record<string, boolean>)[key] = false
}

const handleClickOutside = (e: MouseEvent) => {
  const el = roleDropdownRef.value
  if (!el) return
  const container = el.closest('.dropdown') ? (el.closest('.dropdown') as HTMLElement) : null
  if (container && !container.contains(e.target as Node)) {
    Object.keys(openDropdowns.value).forEach((k) => (openDropdowns.value as Record<string, boolean>)[k] = false)
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Modal refs using the new pattern
const userFormModalRef = ref<any>(null)
const assignRoleModalRef = ref<any>(null)
const permissionsViewModalRef = ref<any>(null)

const filteredUsers = computed(() => {
  let filtered = users.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (user: any) =>
        user.fullName.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    )
  }

  if (filterRole.value) {
    filtered = filtered.filter((user: any) => user.role?.id === filterRole.value)
  }

  return filtered
})

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await axios.get(`${API_URL}/auth/users`)
    users.value = response.data
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    loading.value = false
  }
}

const fetchRoles = async () => {
  try {
    const response = await axios.get(`${API_URL}/roles`)
    roles.value = response.data
  } catch (error) {
    console.error('Error fetching roles:', error)
  }
}

const getUserInitials = (fullName: string) => {
  return fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// User CRUD operations using new modal pattern
const openCreateModal = () => {
  userFormModalRef.value?.openModal()
}

const openEditModal = (user: any) => {
  userFormModalRef.value?.openModal(user)
}

const handleUserSaved = async (event: any) => {
  try {
    if (event.isEdit) {
      await axios.put(`${API_URL}/auth/users/${event.userId}`, event.data)
    } else {
      await axios.post(`${API_URL}/auth/users`, event.data)
    }
    await fetchUsers()
  } catch (error: any) {
    console.error('Error saving user:', error)
    alert(error.response?.data?.message || 'Failed to save user')
  }
}

// Role assignment using new modal pattern
const openRoleModal = (user: any) => {
  assignRoleModalRef.value?.openModal(user)
}

const handleRoleAssigned = async (event: { userId: number; roleId: number }) => {
  try {
    await axios.post(
      `${API_URL}/auth/users/${event.userId}/assign-role`,
      { roleId: event.roleId }
    )
    await fetchUsers()
  } catch (error) {
    console.error('Error assigning role:', error)
    alert('Failed to assign role')
  }
}

// View permissions using new modal pattern
const viewPermissions = async (user: any) => {
  try {
    const response = await axios.get(`${API_URL}/auth/users/${user.id}/permissions`)
    permissionsViewModalRef.value?.openModal({
      userName: user.fullName,
      permissions: response.data
    })
  } catch (error) {
    console.error('Error fetching user permissions:', error)
    alert('Failed to fetch permissions')
  }
}

// Delete user
const deleteUser = async (user: any) => {
  if (!confirm(`Are you sure you want to delete user "${user.fullName}"?`)) return

  try {
    await axios.delete(`${API_URL}/auth/users/${user.id}`)
    await fetchUsers()
  } catch (error: any) {
    console.error('Error deleting user:', error)
    alert(error.response?.data?.message || 'Failed to delete user')
  }
}

onMounted(() => {
  fetchUsers()
  fetchRoles()
})
</script>
