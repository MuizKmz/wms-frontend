<template>
  <div
    ref="wrapper"
    class="absolute select-none"
    :style="wrapperStyle"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <ChartCard :title="title" :className="'w-full h-full'">
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
  initialX?: number
  initialY?: number
  initialWidth?: number
  minWidth?: number
  maxWidth?: number
  draggable?: boolean
  resizable?: boolean
}

const props = defineProps<Props>()

const x = ref(props.initialX ?? 0)
const y = ref(props.initialY ?? 0)
const width = ref(props.initialWidth ?? 600)
const dragging = ref(false)
const resizing = ref(false)
const dragOffsetX = ref(0)
const dragOffsetY = ref(0)
const startWidth = ref(0)
const startPointerX = ref(0)
const hovered = ref(false)
const wrapper = ref<HTMLElement | null>(null)

const wrapperStyle = computed(() => ({
  left: x.value + 'px',
  top: y.value + 'px',
  width: width.value + 'px'
}))

function startDrag(e: MouseEvent) {
  if (props.draggable === false) return
  dragging.value = true
  dragOffsetX.value = e.clientX - x.value
  dragOffsetY.value = e.clientY - y.value
  attachListeners()
}

function startResize(e: MouseEvent) {
  if (props.resizable === false) return
  resizing.value = true
  startWidth.value = width.value
  startPointerX.value = e.clientX
  attachListeners()
}

function onPointerMove(e: MouseEvent) {
  if (dragging.value) {
    x.value = Math.max(0, e.clientX - dragOffsetX.value)
    y.value = Math.max(0, e.clientY - dragOffsetY.value)
  } else if (resizing.value) {
    const delta = e.clientX - startPointerX.value
    const newW = startWidth.value + delta
    const minW = props.minWidth ?? 320
    const maxW = props.maxWidth ?? 1000
    width.value = Math.min(maxW, Math.max(minW, newW))
  }
}

function onPointerUp() {
  if (dragging.value || resizing.value) {
    dragging.value = false
    resizing.value = false
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

onMounted(() => {})

onBeforeUnmount(() => {
  detachListeners()
})
</script>

<style scoped>
/* Avoid text selection while dragging */
.cursor-move, .cursor-se-resize {
  user-select: none;
}
</style>
