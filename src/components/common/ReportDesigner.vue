<template>
  <div class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" @click.self="$emit('close')">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Report Designer</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Customize company info and add signature/stamp overlays</p>
          <p class="text-xs text-blue-600 dark:text-blue-400 mt-1">💡 Drag components onto the preview to position them</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="resetToDefault"
            class="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Reset to Default
          </button>
          <button
            @click="saveDesign"
            class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Design
          </button>
          <button
            @click="$emit('close')"
            class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-auto p-6">
        <div class="grid grid-cols-12 gap-6">
          <!-- Component Palette -->
          <div class="col-span-3 space-y-4">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">Report Settings</h3>
            
            <!-- Logo Upload -->
            <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Company Logo</label>
              <div v-if="currentLogoUrl" class="mb-2">
                <img :src="currentLogoUrl" alt="Logo" class="w-16 h-16 object-contain" />
              </div>
              <button
                @click="uploadLogo"
                class="w-full px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {{ currentLogoUrl ? 'Change Logo' : 'Upload Logo' }}
              </button>
            </div>

            <!-- Company Info -->
            <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
                <input
                  v-model="companyName"
                  type="text"
                  class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Company Address</label>
                <input
                  v-model="companyAddress"
                  type="text"
                  class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <!-- Display Options -->
            <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
              <h4 class="text-xs font-bold text-gray-900 dark:text-white mb-2">Report Elements</h4>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="showSummaryCards"
                  type="checkbox"
                  class="rounded border-gray-300"
                />
                <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Show Summary Cards</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="showTable"
                  type="checkbox"
                  class="rounded border-gray-300"
                />
                <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Show Data Table</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="showHeader"
                  type="checkbox"
                  class="rounded border-gray-300"
                />
                <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Show Header</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="showFooter"
                  type="checkbox"
                  class="rounded border-gray-300"
                />
                <span class="text-xs font-medium text-gray-700 dark:text-gray-300">Show Footer</span>
              </label>
            </div>

            <hr class="border-gray-300 dark:border-gray-600 my-4" />

            <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">Components</h3>
            
            <div
              v-for="component in availableComponents"
              :key="component.type"
              draggable="true"
              @dragstart="handleDragStart($event, component)"
              class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-move hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <div class="flex items-center gap-2">
                <component :is="component.icon" class="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ component.name }}</span>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ component.description }}</p>
            </div>
          </div>

          <!-- Canvas Area -->
          <div class="col-span-9">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">Design Canvas - Drag components onto the preview</h3>
            
            <div
              ref="canvas"
              @drop="handleDrop"
              @dragover.prevent
              class="bg-white border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-auto relative"
              style="width: 210mm; height: 297mm; margin: 0 auto;"
            >
              <!-- Actual Report Preview -->
              <div v-if="previewHtml" v-html="previewHtml" class="pointer-events-none"></div>
              
              <!-- Empty State if no preview -->
              <div v-else class="flex items-center justify-center h-full">
                <div class="text-center">
                  <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p class="mt-4 text-gray-500 dark:text-gray-400">Generate report first to see preview</p>
                </div>
              </div>

              <!-- Overlay for Dropped Components -->
              <div class="absolute inset-0 pointer-events-none">
                <div
                  v-for="(item, index) in designComponents"
                  :key="index"
                  :style="{
                    position: 'absolute',
                    left: item.x + 'px',
                    top: item.y + 'px',
                    width: item.width + 'px'
                  }"
                  class="group pointer-events-auto"
                >
                  <div class="relative p-3 bg-white/95 dark:bg-gray-800/95 border-2 border-blue-500 rounded-lg backdrop-blur-sm">
                    <!-- Component Actions -->
                    <div class="absolute -top-8 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        @click="editComponent(index)"
                        class="p-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        title="Edit"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        @click="removeComponent(index)"
                        class="p-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                        title="Remove"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <!-- Signature Component -->
                    <div v-if="item.type === 'signature'" class="text-center">
                      <p class="text-xs text-gray-600 mb-2">{{ item.data.label }}</p>
                      <img v-if="item.data.image" :src="item.data.image" alt="Signature" class="max-w-full h-16 mx-auto" />
                      <div v-else class="border-b-2 border-gray-800 h-8"></div>
                      <p class="text-xs text-gray-500 mt-1">Signature</p>
                    </div>

                    <!-- Stamp Component -->
                    <div v-else-if="item.type === 'stamp'" class="flex justify-center">
                      <img v-if="item.data.image" :src="item.data.image" alt="Stamp" class="w-20 h-20 object-contain" />
                      <div v-else class="border-2 border-gray-600 rounded-full w-20 h-20 flex items-center justify-center">
                        <p class="text-xs text-gray-700 text-center font-semibold">{{ item.data.label }}</p>
                      </div>
                    </div>

                    <!-- Text Component -->
                    <div v-else-if="item.type === 'text'">
                      <p class="text-sm text-gray-800">{{ item.data.content }}</p>
                    </div>

                    <!-- Other Components -->
                    <div v-else class="flex items-center gap-2">
                      <span class="text-sm font-medium text-gray-900">{{ item.name }}</span>
                    </div>
                    
                    <!-- Drag Handle -->
                    <div
                      @mousedown="startDrag($event, index)"
                      class="absolute inset-0 cursor-move opacity-0 group-hover:opacity-10 bg-blue-500 rounded-lg"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import Swal from 'sweetalert2'

interface DesignComponent {
  type: string
  name: string
  description: string
  icon: string
  data: any
  x?: number
  y?: number
  width?: number
}

const props = defineProps({
  reportType: {
    type: String,
    required: true
  },
  previewHtml: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'save'])

const availableComponents = ref([
  {
    type: 'signature',
    name: 'Signature',
    description: 'Signature line for authorization',
    icon: 'edit',
    data: { label: 'Authorized Signature' }
  },
  {
    type: 'stamp',
    name: 'Company Stamp',
    description: 'Official company stamp',
    icon: 'shield',
    data: { label: 'Official Stamp' }
  },
  {
    type: 'text',
    name: 'Text Block',
    description: 'Custom text annotation',
    icon: 'type',
    data: { content: 'Your text here' }
  }
])

const designComponents = ref<DesignComponent[]>([])
const draggedComponent = ref<DesignComponent | null>(null)
const draggedIndex = ref<number | null>(null)
const companyName = ref('Warehouse Management System')
const companyAddress = ref('Inventory Management Division')
const showSummaryCards = ref(true)
const showTable = ref(true)
const showHeader = ref(true)
const showFooter = ref(true)
const currentLogoUrl = ref(localStorage.getItem('reportLogoUrl') || '')

const handleDragStart = (event: DragEvent, component: DesignComponent) => {
  draggedComponent.value = component
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy'
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  
  if (!draggedComponent.value) return

  const canvas = event.currentTarget as HTMLElement
  if (!canvas) return
  
  const rect = canvas.getBoundingClientRect()
  
  // Calculate position with bounds checking (A4: 210mm = ~793px, 297mm = ~1122px at 96dpi)
  const componentWidth = 400
  const componentHeight = 100 // Estimated component height
  
  let x = event.clientX - rect.left - 100 // Offset for centering
  let y = event.clientY - rect.top - 20
  
  // Keep within A4 bounds
  x = Math.max(0, Math.min(x, rect.width - componentWidth))
  y = Math.max(0, Math.min(y, rect.height - componentHeight))

  if (draggedComponent.value) {
    designComponents.value.push({
      ...draggedComponent.value,
      x,
      y,
      width: componentWidth
    })
  }

  draggedComponent.value = null
}

const startDrag = (event: MouseEvent, index: number) => {
  draggedIndex.value = index
  const startX = event.clientX
  const startY = event.clientY
  const component = designComponents.value[index]
  const initialX = component.x || 0
  const initialY = component.y || 0
  
  // Get canvas bounds (A4 size)
  const canvas = document.querySelector('[style*="210mm"]') as HTMLElement
  const canvasWidth = canvas?.offsetWidth || 793
  const canvasHeight = canvas?.offsetHeight || 1122
  const componentWidth = component.width || 400
  const componentHeight = 150 // Estimated height

  const onMouseMove = (e: MouseEvent) => {
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    
    // Calculate new position with bounds checking
    let newX = initialX + dx
    let newY = initialY + dy
    
    // Keep within canvas bounds
    newX = Math.max(0, Math.min(newX, canvasWidth - componentWidth))
    newY = Math.max(0, Math.min(newY, canvasHeight - componentHeight))
    
    component.x = newX
    component.y = newY
  }

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    draggedIndex.value = null
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

const removeComponent = (index: number) => {
  designComponents.value.splice(index, 1)
}

const editComponent = async (index: number) => {
  const component = designComponents.value[index]
  
  if (component.type === 'signature') {
    const { value: formValues } = await Swal.fire({
      title: 'Edit Signature',
      html: `
        <div style="text-align: left;">
          <label style="display: block; margin-bottom: 8px; font-weight: bold;">Label:</label>
          <input id="sig-label" class="swal2-input" value="${component.data.label}" style="margin: 0 0 16px 0; width: 90%;">
          
          <label style="display: block; margin-bottom: 8px; font-weight: bold;">Upload Signature Image (optional):</label>
          <input id="sig-image" type="file" accept="image/*" class="swal2-file" style="width: 90%;">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const label = (document.getElementById('sig-label') as HTMLInputElement).value
        const fileInput = document.getElementById('sig-image') as HTMLInputElement
        const file = fileInput.files?.[0]
        
        if (file) {
          return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = (e) => {
              resolve({ label, image: e.target?.result })
            }
            reader.readAsDataURL(file)
          })
        }
        return { label, image: component.data.image }
      }
    })

    if (formValues) {
      component.data.label = formValues.label
      if (formValues.image) {
        component.data.image = formValues.image
      }
    }
  } else if (component.type === 'stamp') {
    const { value: formValues } = await Swal.fire({
      title: 'Edit Stamp',
      html: `
        <div style="text-align: left;">
          <label style="display: block; margin-bottom: 8px; font-weight: bold;">Label:</label>
          <input id="stamp-label" class="swal2-input" value="${component.data.label}" style="margin: 0 0 16px 0; width: 90%;">
          
          <label style="display: block; margin-bottom: 8px; font-weight: bold;">Upload Stamp Image (optional):</label>
          <input id="stamp-image" type="file" accept="image/*" class="swal2-file" style="width: 90%;">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const label = (document.getElementById('stamp-label') as HTMLInputElement).value
        const fileInput = document.getElementById('stamp-image') as HTMLInputElement
        const file = fileInput.files?.[0]
        
        if (file) {
          return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = (e) => {
              resolve({ label, image: e.target?.result })
            }
            reader.readAsDataURL(file)
          })
        }
        return { label, image: component.data.image }
      }
    })

    if (formValues) {
      component.data.label = formValues.label
      if (formValues.image) {
        component.data.image = formValues.image
      }
    }
  } else if (component.type === 'text') {
    const { value: text } = await Swal.fire({
      title: 'Edit Text',
      input: 'textarea',
      inputValue: component.data.content,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'Please enter some text'
        }
      }
    })

    if (text) {
      component.data.content = text
    }
  }
}

const uploadLogo = async () => {
  const { value: file } = await Swal.fire({
    title: 'Upload Company Logo',
    input: 'file',
    inputAttributes: {
      accept: 'image/*',
      'aria-label': 'Upload your company logo'
    },
    showCancelButton: true,
    confirmButtonText: 'Upload',
    confirmButtonColor: '#2563eb'
  })

  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire('Error', 'File size must be less than 2MB', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const result = e.target?.result as string
      currentLogoUrl.value = result
      localStorage.setItem('reportLogoUrl', result)
      Swal.fire({
        icon: 'success',
        title: 'Logo Uploaded',
        timer: 1500,
        showConfirmButton: false
      })
    }
    reader.readAsDataURL(file)
  }
}

const saveDesign = () => {
  // Update logo in localStorage
  if (currentLogoUrl.value) {
    localStorage.setItem('reportLogoUrl', currentLogoUrl.value)
  }

  const designData = {
    reportType: props.reportType,
    components: designComponents.value,
    logoUrl: currentLogoUrl.value,
    companyName: companyName.value,
    companyAddress: companyAddress.value,
    showSummaryCards: showSummaryCards.value,
    showTable: showTable.value,
    showHeader: showHeader.value,
    showFooter: showFooter.value,
    savedAt: new Date().toISOString()
  }

  // Save to localStorage
  localStorage.setItem(`report-design-${props.reportType}`, JSON.stringify(designData))

  Swal.fire({
    title: 'Saved!',
    text: 'Your report design has been saved and will be applied to the preview.',
    icon: 'success',
    timer: 2000,
    showConfirmButton: false
  })

  emit('save', designData)
  emit('close')
}

const resetToDefault = async () => {
  const result = await Swal.fire({
    title: 'Reset to Default?',
    text: 'This will remove all custom components and restore the default layout.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, reset it!'
  })

  if (result.isConfirmed) {
    // Clear all custom components
    designComponents.value = []
    
    // Reset settings to defaults
    companyName.value = 'Warehouse Management System'
    companyAddress.value = 'Inventory Management Division'
    showSummaryCards.value = true
    showTable.value = true
    showHeader.value = true
    showFooter.value = true
    
    // Remove saved design from localStorage
    localStorage.removeItem(`report-design-${props.reportType}`)
    localStorage.removeItem('reportLogoUrl')
    currentLogoUrl.value = ''
    
    Swal.fire({
      title: 'Reset!',
      text: 'Design has been reset to default.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    })
    
    // Emit save with reset data to refresh preview immediately
    emit('save', {
      reportType: props.reportType,
      components: [],
      logoUrl: '',
      companyName: 'Warehouse Management System',
      companyAddress: 'Inventory Management Division',
      showSummaryCards: true,
      showTable: true,
      showHeader: true,
      showFooter: true
    })
    
    // Close designer after reset
    emit('close')
  }
}

// Load saved design on mount
const loadSavedDesign = () => {
  // Load logo from localStorage
  const savedLogo = localStorage.getItem('reportLogoUrl')
  if (savedLogo) {
    currentLogoUrl.value = savedLogo
  }

  // Load design settings
  const saved = localStorage.getItem(`report-design-${props.reportType}`)
  if (saved) {
    try {
      const data = JSON.parse(saved)
      designComponents.value = data.components || []
      companyName.value = data.companyName || ''
      companyAddress.value = data.companyAddress || ''
      showSummaryCards.value = data.showSummaryCards ?? true
      showTable.value = data.showTable ?? true
      showHeader.value = data.showHeader ?? true
      showFooter.value = data.showFooter ?? true
      if (data.logoUrl) {
        currentLogoUrl.value = data.logoUrl
      }
    } catch (e) {
      console.error('Error loading saved design:', e)
    }
  }
}

loadSavedDesign()
</script>
