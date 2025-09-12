<template>
  <div class="card w-full">
    <div class="w-full overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <!-- Rows -->
          <tr v-for="(user, index) in users" :key="index">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span class="badge badge-soft text-xs" :class="{
                'badge-success': user.status === 'Professional' || user.status === 'Active',
                'badge-error': user.status === 'Rejected' || user.status === 'Cancel',
                'badge-info': user.status === 'Applied' || user.status === 'Pending',
                'badge-primary': user.status === 'Current',
              }">
                {{ user.status }}
              </span>
            </td>
            <td>{{ user.date }}</td>
            <td>
              <button class="btn btn-circle btn-text btn-sm" aria-label="Edit">
                <iconify-icon icon="tabler:pencil" class="size-4"></iconify-icon>
              </button>

              <button class="btn btn-circle btn-text btn-sm btn-error" aria-label="Delete">
                <iconify-icon icon="tabler:trash" class="size-4"></iconify-icon>
              </button>

              <button class="btn btn-circle btn-text btn-sm" aria-label="More">
                <iconify-icon icon="tabler:dots-vertical" class="size-4"></iconify-icon>
              </button>

            </td>
          </tr>
        </tbody>
      </table>

      <!-- Loading -->
      <div v-if="loading" class="p-4 text-center text-gray-500 text-sm">
        Loading users...
      </div>

      <!-- Error (still show table with mock data) -->
      <div v-if="error" class="p-2 text-center text-red-500 text-xs">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const users = ref([])
const loading = ref(false)
const error = ref(null)

const mockUsers = [
  {
    name: "John Doe",
    email: "johndoe@example.com",
    status: "Professional",
    date: "March 1, 2024",
  },
  {
    name: "Jane Smith",
    email: "janesmith@example.com",
    status: "Rejected",
    date: "March 2, 2024",
  },
  {
    name: "Alice Johnson",
    email: "alicejohnson@example.com",
    status: "Applied",
    date: "March 3, 2024",
  },
  {
    name: "Bob Brown",
    email: "bobrown@example.com",
    status: "Current",
    date: "March 4, 2024",
  },
]

const fetchUsers = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await fetch('/api/users')
    if (!res.ok) throw new Error('Failed to fetch users')
    users.value = await res.json()
  } catch (err) {
    error.value = "API Error: " + err.message + " → showing mock data"
    users.value = mockUsers
  } finally {
    loading.value = false
  }
}

onMounted(fetchUsers)
</script>
