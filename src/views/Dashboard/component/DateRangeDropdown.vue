<template>
  <div class="dropdown relative inline-flex w-40">
    <button 
      ref="dateRangeDropdownRef"
      type="button" 
      class="dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400" 
      aria-haspopup="menu" 
      :aria-expanded="isOpen"
      aria-label="Select Date Range"
      @click="toggleDropdown"
    >
      {{ selectedRange || 'Select Date Range' }}
      <span class="icon-[tabler--chevron-down] size-4 transition-transform ml-2" :class="{ 'rotate-180': isOpen }"></span>
    </button>
    
    <ul 
      class="dropdown-menu **min-w-max** w-auto transition-opacity duration-200 absolute top-full right-0 mt-1 
             bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
             rounded-lg shadow-lg z-50 text-gray-900 dark:text-white" 
      :class="{ 'opacity-100': isOpen, 'opacity-0 pointer-events-none': !isOpen }"
      role="menu" 
      aria-orientation="vertical"
    >
      <li v-for="range in dateRanges" :key="range">
        <a 
          class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" 
          @click="selectRange(range)"
        >
          {{ range }}
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineEmits } from 'vue';

const emit = defineEmits(['range-select']);

const dateRanges = [
  'Last 3 Days', 
  'Last 7 Days', 
  'Last 30 Days', 
  'Last 90 Days',
  'Last Year'
];

const selectedRange = ref('Last 7 Days'); // Set a default selection
const isOpen = ref(false);
const dateRangeDropdownRef = ref(null);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectRange = (range) => {
  selectedRange.value = range;
  emit('range-select', range); // Emit the selection to the parent
  isOpen.value = false;
};

// Logic to close the dropdown when clicking outside
const handleClickOutside = (event) => {
  if (dateRangeDropdownRef.value && !dateRangeDropdownRef.value.closest('.dropdown').contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>