<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Permission Debug</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          View your current user information and active permissions
        </p>
      </div>
      <button @click="refreshPermissions" class="btn btn-sm btn-outline">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </button>
    </div>

    <!-- Current User Info -->
    <div class="card bg-white dark:bg-gray-800 shadow-sm">
      <div class="card-body">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Current User</h3>
        <div v-if="currentUser" class="grid grid-cols-2 gap-4">
          <div>
            <span class="text-sm text-gray-500 dark:text-gray-400">Username</span>
            <p class="font-semibold text-gray-900 dark:text-white">{{ currentUser.username }}</p>
          </div>
          <div>
            <span class="text-sm text-gray-500 dark:text-gray-400">Email</span>
            <p class="font-semibold text-gray-900 dark:text-white">{{ currentUser.email }}</p>
          </div>
          <div>
            <span class="text-sm text-gray-500 dark:text-gray-400">Full Name</span>
            <p class="font-semibold text-gray-900 dark:text-white">{{ currentUser.fullName }}</p>
          </div>
          <div>
            <span class="text-sm text-gray-500 dark:text-gray-400">Role</span>
            <p class="font-semibold text-gray-900 dark:text-white">
              <span class="badge badge-primary">{{ currentUser.role }}</span>
            </p>
          </div>
          <div>
            <span class="text-sm text-gray-500 dark:text-gray-400">User ID</span>
            <p class="font-mono text-sm text-gray-900 dark:text-white">{{ currentUser.id }}</p>
          </div>
        </div>
        <div v-else class="text-center py-8">
          <p class="text-gray-500 dark:text-gray-400">No user logged in</p>
        </div>
      </div>
    </div>

    <!-- Active Permissions -->
    <div class="card bg-white dark:bg-gray-800 shadow-sm">
      <div class="card-body">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Active Permissions</h3>
          <span class="badge badge-lg badge-primary">
            {{ userPermissions.length }} total permissions
          </span>
        </div>

        <div v-if="loading" class="flex justify-center py-8">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>

        <div v-else-if="groupedPermissions.length > 0" class="space-y-3">
          <div
            v-for="group in groupedPermissions"
            :key="group.module"
            class="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-bold text-gray-900 dark:text-white">{{ group.module }}</h4>
              <span class="badge badge-sm">{{ group.actions.length }} permissions</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="action in group.actions"
                :key="action"
                class="badge badge-outline capitalize"
              >
                {{ action }}
              </span>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p class="text-gray-500 dark:text-gray-400 font-semibold">No permissions loaded</p>
          <p class="text-sm text-gray-400 mt-1">This means you won't see any modules in the sidebar</p>
        </div>
      </div>
    </div>

    <!-- Module Access Test -->
    <div class="card bg-white dark:bg-gray-800 shadow-sm">
      <div class="card-body">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Module Access Test</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <div
            v-for="module in testModules"
            :key="module"
            :class="[
              'p-3 rounded-lg border-2 text-center font-medium',
              hasModuleAccess(module)
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            ]"
          >
            <div class="text-sm mb-1">{{ module }}</div>
            <div class="text-xs font-bold">
              {{ hasModuleAccess(module) ? '✓ ALLOWED' : '✗ DENIED' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Debug Info -->
    <div class="card bg-gray-900 dark:bg-gray-950 shadow-sm">
      <div class="card-body">
        <h3 class="text-lg font-bold text-white mb-4">Raw Debug Data</h3>
        <div class="bg-black rounded-lg p-4 overflow-x-auto">
          <pre class="text-green-400 text-xs">{{ debugData }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { userPermissions, loading, loadUserPermissions, hasModuleAccess } = useAuth()

const currentUser = ref<any>(null)

const testModules = [
  'Dashboard',
  'Warehouse',
  'Supplier',
  'Receiving',
  'Category',
  'Product',
  'EPC',
  'Inventory',
  'Order',
  'Shipping',
  'Customer',
  'Reports',
  'Settings'
]

const groupedPermissions = computed(() => {
  const groups: { [key: string]: { module: string; actions: string[] } } = {}

  userPermissions.value.forEach((permission) => {
    if (!groups[permission.module]) {
      groups[permission.module] = {
        module: permission.module,
        actions: []
      }
    }
    groups[permission.module].actions.push(permission.action)
  })

  return Object.values(groups)
})

const debugData = computed(() => {
  return JSON.stringify(
    {
      user: currentUser.value,
      permissionsCount: userPermissions.value.length,
      permissions: userPermissions.value,
      localStorage: {
        hasUser: !!localStorage.getItem('user'),
        hasToken: !!localStorage.getItem('token')
      }
    },
    null,
    2
  )
})

const refreshPermissions = async () => {
  await loadUserPermissions()
  loadCurrentUser()
}

const loadCurrentUser = () => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    currentUser.value = JSON.parse(userStr)
  }
}

onMounted(() => {
  loadCurrentUser()
  if (userPermissions.value.length === 0) {
    loadUserPermissions()
  }
})
</script>
