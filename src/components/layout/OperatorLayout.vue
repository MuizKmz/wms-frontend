<template>
  <div class="h-screen flex flex-col bg-gray-800 overflow-hidden">
    <OperatorModuleHeader />

    <main class="flex-1 p-4 mx-auto w-full md:p-6 pt-20">
      <slot></slot>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import AppFooter from './AppFooter.vue'
import OperatorModuleHeader from './OperatorModuleHeader.vue'
</script>
