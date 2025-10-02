<template>
  <div class="min-h-screen xl:flex">
    <app-sidebar />
    
    <!-- Main Wrapper -->
    <div
      class="flex-1 transition-all duration-300 ease-in-out lg:ml-64"
    >
      <!-- Header -->
      <app-header />
      
      <!-- Page Content -->
      <div class="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 mb-20">
        <slot></slot>
      </div>
      
      <!-- Footer -->
      <app-footer />
    </div>
  </div>
</template>

<script setup>
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import Backdrop from './Backdrop.vue'
</script>