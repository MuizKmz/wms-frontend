<template>
  <div
    class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
  >
    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="min-w-full">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700">
            <th class="px-5 py-3 text-left w-2/11 sm:px-6">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Code</p>
            </th>
            <th class="px-5 py-3 text-left w-4/11 sm:px-6">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Name</p>
            </th>
            <th class="px-5 py-3 text-left w-2/11 sm:px-6">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">UOM</p>
            </th>
            <th class="px-5 py-3 text-left w-2/11 sm:px-6">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Qty</p>
            </th>
            <th class="px-5 py-3 text-left w-1/11 sm:px-6">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Actions</p>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="(item, index) in data"
            :key="index"
            class="border-t border-gray-100 dark:border-gray-800"
          >
            <td class="px-5 py-4 sm:px-6">
              <span class="font-mono text-sm font-medium text-gray-800 dark:text-white/90">
                {{ item.code }}
              </span>
            </td>
            <td class="px-5 py-4 sm:px-6">
              <p class="text-gray-800 text-theme-sm font-medium dark:text-white/90">{{ item.name }}</p>
            </td>
            <td class="px-5 py-4 sm:px-6">
              <span class="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {{ item.uom }}
              </span>
            </td>
            <td class="px-5 py-4 sm:px-6">
              <p class="text-gray-800 text-theme-sm font-semibold dark:text-white/90">{{ item.qty }}</p>
            </td>
            <td class="px-5 py-4 sm:px-6">
              <div class="flex items-center gap-1">
                <button class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="Edit">
                  <iconify-icon icon="tabler:pencil" class="size-4"></iconify-icon>
                </button>
                <button class="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" aria-label="Delete">
                  <iconify-icon icon="tabler:trash" class="size-4"></iconify-icon>
                </button>
                <button class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="More">
                  <iconify-icon icon="tabler:dots-vertical" class="size-4"></iconify-icon>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Loading -->
      <div v-if="loading" class="p-4 text-center text-gray-500 text-sm">
        Loading data...
      </div>

      <!-- Error -->
      <div v-if="error" class="p-4 text-center text-red-500 text-sm">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const data = ref([])
const loading = ref(false)
const error = ref(null)

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    // Use the proxied endpoint
    const res = await fetch('/api/materials')
    if (!res.ok) throw new Error('Failed to fetch data')
    data.value = await res.json()
  } catch (err) {
    error.value = "API Error: " + err.message
  } finally {
    loading.value = false
  }
}


onMounted(fetchData)
</script>


<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.text-theme-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.text-theme-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}
</style>
