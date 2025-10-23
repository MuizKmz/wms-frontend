<template>
  <div class="space-y-6">
    <!-- Header with Create Button -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">Roles Management</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Create and manage user roles</p>
      </div>
      <button
        @click="openCreateModal"
        class="btn btn-primary flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Create Role
      </button>
    </div>

    <!-- Roles Grid -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="loading loading-spinner loading-lg"></div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="role in roles"
        :key="role.id"
        class="card bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-200"
      >
        <div class="card-body">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="card-title text-gray-900 dark:text-white">{{ role.name }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ role.description || 'No description' }}</p>
            </div>
            <div class="badge" :class="role.isActive ? 'badge-success' : 'badge-error'">
              {{ role.isActive ? 'Active' : 'Inactive' }}
            </div>
          </div>

          <div class="stats stats-vertical shadow bg-gray-50 dark:bg-gray-700 mb-4">
            <div class="stat py-3">
              <div class="stat-title text-xs dark:text-gray-400">Users</div>
              <div class="stat-value text-2xl text-primary">{{ role._count?.users || 0 }}</div>
            </div>
            <div class="stat py-3">
              <div class="stat-title text-xs dark:text-gray-400">Permissions</div>
              <div class="stat-value text-2xl text-secondary">{{ role.rolePermissions?.length || 0 }}</div>
            </div>
          </div>

          <div class="card-actions justify-end gap-2">
            <button
              @click="openPermissionsModal(role)"
              class="btn btn-sm btn-outline btn-info"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Permissions
            </button>
            <button
              @click="openEditModal(role)"
              class="btn btn-sm btn-outline btn-warning"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              @click="deleteRole(role)"
              class="btn btn-sm btn-outline btn-error"
              :disabled="(role._count?.users || 0) > 0"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Role Form Modal -->
    <RoleFormModal ref="roleFormModalRef" @saved="handleRoleSaved" />

    <!-- Permissions Modal -->
    <PermissionsModal
      v-if="selectedRole"
      :role="selectedRole"
      :show="showPermissionsModal"
      @close="showPermissionsModal = false"
      @saved="fetchRoles"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import PermissionsModal from './PermissionsModal.vue';
import RoleFormModal from './RoleFormModal.vue';

const API_URL = 'api';

const roles = ref([]);
const loading = ref(false);
const selectedRole = ref(null);
const showPermissionsModal = ref(false);
const roleFormModalRef = ref(null);

const fetchRoles = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`${API_URL}/roles`);
    roles.value = response.data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    alert('Failed to fetch roles');
  } finally {
    loading.value = false;
  }
}

const openCreateModal = () => {
  roleFormModalRef.value?.openModal();
}

const openEditModal = (role: any) => {
  roleFormModalRef.value?.openModal(role);
}

const handleRoleSaved = async (event: any) => {
  try {
    if (event.isEdit) {
      await axios.put(`${API_URL}/roles/${event.roleId}`, event.data);
    } else {
      await axios.post(`${API_URL}/roles`, event.data);
    }
    await fetchRoles();
  } catch (error: any) {
    console.error('Error saving role:', error);
    alert(error.response?.data?.message || 'Failed to save role');
  }
}

const deleteRole = async (role: any) => {
  if (!confirm(`Are you sure you want to delete "${role.name}"?`)) return;

  try {
    await axios.delete(`${API_URL}/roles/${role.id}`);
    await fetchRoles();
  } catch (error: any) {
    console.error('Error deleting role:', error);
    alert(error.response?.data?.message || 'Failed to delete role');
  }
}

const openPermissionsModal = (role: any) => {
  selectedRole.value = role;
  showPermissionsModal.value = true;
}

onMounted(() => {
  fetchRoles();
})
</script>
