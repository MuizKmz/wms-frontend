<template>
  <OperatorLayout>
    <div class="h-screen p-8 bg-gray-800 flex flex-col justify-start items-center overflow-hidden">
      <router-link to="/wip" class="self-start mb-12 flex items-center bg-gray-700 text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-600 transition-colors duration-200 z-10">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Back to MES
      </router-link>

      <div class="w-full max-w-6xl grid grid-cols-3 gap-8">
        <OperatorCard
          cardTitle="Production"
          cardIconPath="M17 10H7m10 0a2 2 0 11-4 0M7 10a2 2 0 100 4h10a2 2 0 000-4m-6 4a2 2 0 11-4 0"
          cardRoute="/production"
        />
        <OperatorCard
          cardTitle="Quality Check"
          cardIconPath="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          cardRoute="/quality-check"
        />
        <OperatorCard
          cardTitle="Work Order List"
          cardIconPath="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          cardRoute="/work-order-list"
        />

        <div class="col-span-3 flex justify-center gap-8 mt-8">
          <OperatorCard
            class="w-1/3"
            cardTitle="Tool/Mould Change"
            cardIconPath="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 00-1 1v1a2 2 0 11-4 0v-1a1 1 0 00-1-1H7a1 1 0 01-1-1v-3a1 1 0 011-1h3a1 1 0 001-1V9a1 1 0 00-1-1H7a1 1 0 01-1-1V5a1 1 0 011-1h3a1 1 0 001-1z"
            cardRoute="/tool-mould-change"
          />
          <OperatorCard
            class="w-1/3"
            cardTitle="Machine Downtime"
            cardIconPath="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            cardRoute="/machine-downtime"
          />
        </div>
      </div>
    </div>
  </OperatorLayout>
</template>

<script setup>
import OperatorLayout from "@/components/layout/OperatorLayout.vue";
import OperatorCard from "@/views/OperatorModule/component/OperatorCard.vue"; 
</script>