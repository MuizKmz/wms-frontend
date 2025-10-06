<template>
  <div>
    <!-- Tab Navigation -->
    <div class="border-b border-gray-200 dark:border-gray-700 -mx-6 px-6 -mt-5 mb-6">
      <div class="flex gap-1">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="changeTab(tab.id)"
          :class="[
            'px-4 py-3 font-medium text-sm transition-all relative',
            activeTab === tab.id
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          ]"
        >
          {{ tab.label }}
          <div
            v-if="activeTab === tab.id"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t"
          />
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div>
      <component 
        :is="currentComponent" 
        v-if="currentComponent"
        v-bind="componentProps"
      />
      <router-view v-else-if="currentRoute" :name="currentRoute" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

interface Tab {
  id: string
  label: string
  component?: any
  route?: string
}

interface Props {
  tabs: Tab[]
  defaultTab?: string
  useRouter?: boolean
  componentProps?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  defaultTab: '',
  useRouter: false,
  componentProps: () => ({})
})

const emit = defineEmits<{
  (e: 'tab-change', tabId: string): void
}>()

const router = props.useRouter ? useRouter() : null
const activeTab = ref(props.defaultTab || props.tabs[0]?.id)

const currentTab = computed(() => 
  props.tabs.find(tab => tab.id === activeTab.value)
)

const currentComponent = computed(() => 
  currentTab.value?.component
)

const currentRoute = computed(() => 
  currentTab.value?.route
)

const changeTab = (tabId: string) => {
  activeTab.value = tabId
  emit('tab-change', tabId)
}

// Navigate to route if useRouter is enabled
watch(activeTab, (newTab) => {
  if (props.useRouter && router && currentTab.value?.route) {
    router.push(currentTab.value.route)
  }
})
</script>