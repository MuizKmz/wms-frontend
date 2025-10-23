<template>
  <!-- Ghost placeholder while dragging/resizing -->
  <div
    v-if="showGhost"
    class="absolute z-40 pointer-events-none border-2 border-dashed border-indigo-400 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/30"
    :style="ghostStyle"
  ></div>

  <!-- Actual Card Wrapper -->
  <div
    ref="wrapper"
    class="absolute select-none"
    :style="wrapperStyle"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    :class="dragging || resizing ? 'opacity-70' : 'opacity-100'"
  >
    <ChartCard :title="title" :className="'w-full h-full'" :fullscreenable="fullscreenable" :refreshable="refreshable" @refresh="emit('refresh')">
      <template #title>
        <div
          class="flex items-center justify-between cursor-move pr-2"
          @mousedown.prevent="startDrag"
        >
          <span class="text-base font-semibold text-gray-800 dark:text-gray-200 truncate" :title="title">{{ title }}</span>
          <div class="flex items-center gap-2">
            <slot name="headerAction" />
            <!-- Resize handle visual in header for narrow cards -->
            <div
              v-if="resizable"
              class="w-3 h-3 rounded bg-gray-300 dark:bg-gray-600 cursor-se-resize"
              @mousedown.stop.prevent="startResize"
              title="Resize"
            ></div>
          </div>
        </div>
      </template>
      <slot />
      <!-- Bottom-right resize handle (appears on hover) -->
      <div
        v-if="resizable"
        class="absolute bottom-1 right-1 w-4 h-4 cursor-se-resize"
        @mousedown.stop.prevent="startResize"
        :class="hovered ? 'opacity-80' : 'opacity-0'"
      >
        <div class="w-full h-full border-r-2 border-b-2 border-gray-400 dark:border-gray-500"></div>
      </div>
    </ChartCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import ChartCard from '@/views/Dashboard/component/ChartCard.vue'

interface Props {
  title: string
  id?: string | number
  initialX?: number
  initialY?: number
  initialWidth?: number
  initialHeight?: number
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  draggable?: boolean
  resizable?: boolean
  fullscreenable?: boolean
  refreshable?: boolean
}

const props = defineProps<Props>()

const x = ref(props.initialX ?? 0)
const y = ref(props.initialY ?? 0)
const width = ref(props.initialWidth ?? 600)
const height = ref(props.initialHeight ?? 320)
const dragging = ref(false)
const resizing = ref(false)
const showGhost = ref(false)
const dragOffsetX = ref(0)
const dragOffsetY = ref(0)
const startWidth = ref(0)
const startPointerX = ref(0)
const startPointerY = ref(0)
const startHeight = ref(0)
const hovered = ref(false)
const wrapper = ref<HTMLElement | null>(null)
const resizeObserver = ref<ResizeObserver | null>(null)

const wrapperStyle = computed(() => ({
  left: x.value + 'px',
  top: y.value + 'px',
  width: width.value + 'px',
  height: height.value + 'px'
}))

const ghostX = ref(x.value)
const ghostY = ref(y.value)
const ghostWidth = ref(width.value)
const ghostHeight = ref(height.value)

const ghostStyle = computed(() => ({
  left: ghostX.value + 'px',
  top: ghostY.value + 'px',
  width: ghostWidth.value + 'px',
  height: ghostHeight.value + 'px'
}))

const emit = defineEmits<{
  (e: 'update:position', payload: { id?: string | number; x: number; y: number }): void
  (e: 'update:size', payload: { id?: string | number; width: number; height: number }): void
  (e: 'refresh'): void
}>()

function startDrag(e: MouseEvent) {
  if (props.draggable === false) return
  dragging.value = true
  showGhost.value = true
  dragOffsetX.value = e.clientX - x.value
  dragOffsetY.value = e.clientY - y.value
  attachListeners()
}

function startResize(e: MouseEvent) {
  if (props.resizable === false) return
  resizing.value = true
  showGhost.value = true
  startWidth.value = width.value
  startHeight.value = height.value
  startPointerX.value = e.clientX
  startPointerY.value = e.clientY
  attachListeners()
}

function onPointerMove(e: MouseEvent) {
  if (dragging.value) {
    // Get the parent container bounds (dashboard canvas)
    const parent = wrapper.value?.parentElement
    if (!parent) return
    
    const parentRect = parent.getBoundingClientRect()
    const parentWidth = parent.scrollWidth
    const parentHeight = parent.scrollHeight
    
    // Calculate new position relative to parent
    let newX = e.clientX - parentRect.left - dragOffsetX.value
    let newY = e.clientY - parentRect.top - dragOffsetY.value
    
    // Constrain to parent container bounds
    newX = Math.max(0, Math.min(newX, parentWidth - width.value))
    newY = Math.max(0, Math.min(newY, parentHeight - height.value))
    
    ghostX.value = newX
    ghostY.value = newY
  } else if (resizing.value) {
    // Get the parent container bounds
    const parent = wrapper.value?.parentElement
    if (!parent) return
    
    const parentWidth = parent.scrollWidth
    const parentHeight = parent.scrollHeight
    
    const deltaX = e.clientX - startPointerX.value
    const deltaY = e.clientY - startPointerY.value
    const minW = props.minWidth ?? 320
    const maxW = props.maxWidth ?? 1200
    const minH = props.minHeight ?? 240
    const maxH = props.maxHeight ?? 1000
    
    // Calculate max allowed dimensions based on current position and parent bounds
    const maxAllowedWidth = parentWidth - x.value
    const maxAllowedHeight = parentHeight - y.value
    
    // Apply constraints: respect min/max props AND parent container bounds
    const newWidth = startWidth.value + deltaX
    const newHeight = startHeight.value + deltaY
    
    ghostWidth.value = Math.max(minW, Math.min(newWidth, maxW, maxAllowedWidth))
    ghostHeight.value = Math.max(minH, Math.min(newHeight, maxH, maxAllowedHeight))
  }
}

function onPointerUp() {
  if (dragging.value) {
    x.value = ghostX.value
    y.value = ghostY.value
    emit('update:position', { id: props.id, x: x.value, y: y.value })
  }
  if (resizing.value) {
    width.value = ghostWidth.value
    height.value = ghostHeight.value
    emit('update:size', { id: props.id, width: width.value, height: height.value })
  }
  if (dragging.value || resizing.value) {
    dragging.value = false
    resizing.value = false
    showGhost.value = false
    detachListeners()
  }
}

function attachListeners() {
  window.addEventListener('mousemove', onPointerMove)
  window.addEventListener('mouseup', onPointerUp)
}
function detachListeners() {
  window.removeEventListener('mousemove', onPointerMove)
  window.removeEventListener('mouseup', onPointerUp)
}

onMounted(() => {
  // Setup resize observer for responsive behavior
  if (wrapper.value) {
    resizeObserver.value = new ResizeObserver(() => {
      // Trigger a custom event that child components can listen to
      wrapper.value?.dispatchEvent(new CustomEvent('card-resize'))
    })
    resizeObserver.value.observe(wrapper.value)
  }
})

onBeforeUnmount(() => {
  detachListeners()
  if (resizeObserver.value) {
    resizeObserver.value.disconnect()
  }
})
</script>

<style scoped>
/* Avoid text selection while dragging */
.cursor-move, .cursor-se-resize {
  user-select: none;
}
</style>
