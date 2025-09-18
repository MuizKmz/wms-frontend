<template>
  <div class="min-h-screen xl:flex">
    <app-sidebar />
    <Backdrop />

    <!-- Main Wrapper -->
    <div
      class="flex-1 transition-all duration-300 ease-in-out"
      :class="[hasOpenSubmenu ? 'lg:ml-[290px]' : 'lg:ml-[70px]']"
    >
      <!-- Header -->
      <app-header />

      <!-- Page Content -->
      <div class="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import { useSidebar } from '@/composables/useSidebar'
import Backdrop from './Backdrop.vue'
import { computed } from 'vue'

const { openSubmenu } = useSidebar()

// Detect if white submenu is open
const hasOpenSubmenu = computed(() => openSubmenu.value !== null)
</script>
