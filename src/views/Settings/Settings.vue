<template>
  <AdminLayout>
    <PageBreadcrumb pageTitle="Settings" />

    <div class="space-y-5 sm:space-y-6">
      <ComponentCard
        title="System Settings"
        desc="Manage roles, permissions, and user access"
      >
        <!-- Tab Navigation -->
        <div class="border-b border-gray-200 dark:border-gray-700 -mx-6 px-6 -mt-14">
          <div class="flex gap-1">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'px-4 py-3 font-medium text-sm transition-all relative',
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              ]"
            >
              {{ tab.label }}
              <div
                v-if="activeTab === tab.id"
                class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
              />
            </button>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="pt-6">
          <transition name="fade" mode="out-in">
            <component :is="currentTabComponent" :key="activeTab" />
          </transition>
        </div>
      </ComponentCard>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import ComponentCard from '@/components/common/ComponentCard.vue'
import RolesTab from './components/RolesTab.vue'
import PermissionsTab from './components/PermissionsTab.vue'
import UsersTab from './components/UsersTab.vue'
import DebugTab from './components/DebugTab.vue'

const activeTab = ref('roles')

const tabs = [
  { id: 'roles', label: 'Roles' },
  { id: 'permissions', label: 'Permissions' },
  { id: 'users', label: 'Users' },
  { id: 'debug', label: '🐛 Debug' },
]

const currentTabComponent = computed(() => {
  switch (activeTab.value) {
    case 'roles':
      return RolesTab
    case 'permissions':
      return PermissionsTab
    case 'users':
      return UsersTab
    case 'debug':
      return DebugTab
    default:
      return RolesTab
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
</style>
