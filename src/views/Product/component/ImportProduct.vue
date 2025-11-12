<template>
  <teleport to="body">
    <transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-250 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      @after-leave="unlockScroll"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center"
        aria-hidden="false"
        @click.self="closeModal"
      >
        <!-- overlay -->
        <div class="absolute inset-0 bg-black/50"></div>

        <!-- modal panel -->
        <transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-250 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
          appear
        >
          <div
            v-if="isOpen"
            ref="panelRef"
            class="relative z-10 w-full max-w-xl mx-4 max-h-[90vh] flex flex-col"
            @click.stop
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col min-h-0">
              <!-- header -->
              <div class="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 id="modal-title" class="text-lg font-semibold text-gray-900 dark:text-white">
                  Import Product
                </h2>
                <button
                  type="button"
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  @click="closeModal"
                  :disabled="isUploading"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              <!-- body -->
              <div class="p-6 flex-1">
                <!-- Submit Error -->
                <div v-if="errors.submit" class="alert alert-error mb-4">
                  <span>{{ errors.submit }}</span>
                </div>

                <!-- Success Message -->
                <div v-if="uploadSuccess" class="alert alert-success mb-4">
                  <span>{{ uploadSuccess }}</span>
                </div>

                <!-- Drop Zone -->
                <div
                  @drop.prevent="handleDrop"
                  @dragover.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  :class="[
                    'border-2 border-dashed rounded-lg p-12 text-center transition-colors',
                    isDragging
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50',
                    errors.file ? 'border-red-500' : ''
                  ]"
                >
                  <!-- Upload Icon -->
                  <div class="flex justify-center mb-4">
                    <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>

                  <!-- File Name Display -->
                  <div v-if="selectedFile" class="mb-4">
                    <div class="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span class="text-sm font-medium text-gray-900 dark:text-white">{{ selectedFile.name }}</span>
                      <button
                        @click.stop="removeFile"
                        class="text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                        :disabled="isUploading"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- Drop Text -->
                  <p class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {{ selectedFile ? 'File selected' : 'Drop files here' }}
                  </p>

                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Supported format: .xls, .xlsx
                  </p>

                  <!-- OR divider -->
                  <div class="flex items-center justify-center gap-4 mb-4">
                    <div class="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
                    <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">OR</span>
                    <div class="h-px bg-gray-300 dark:bg-gray-600 flex-1"></div>
                  </div>

                  <!-- Browse Files Button -->
                  <div>
                    <input
                      ref="fileInputRef"
                      type="file"
                      accept=".xls,.xlsx"
                      @change="handleFileSelect"
                      class="hidden"
                      :disabled="isUploading"
                    />
                    <button
                      @click="triggerFileInput"
                      type="button"
                      class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                      :disabled="isUploading"
                    >
                      Browse files
                    </button>
                  </div>
                </div>

                <!-- File Error -->
                <transition
                  enter-active-class="transition-all duration-200 ease-out"
                  enter-from-class="opacity-0 -translate-y-1"
                  enter-to-class="opacity-100 translate-y-0"
                  leave-active-class="transition-all duration-150 ease-in"
                  leave-from-class="opacity-100 translate-y-0"
                  leave-to-class="opacity-0 -translate-y-1"
                >
                  <div v-if="errors.file" class="mt-3 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p class="text-xs text-red-600 dark:text-red-400">{{ errors.file }}</p>
                  </div>
                </transition>
              </div>

              <!-- footer -->
              <div class="flex items-center justify-between p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  @click="downloadTemplate"
                  class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                  :disabled="isUploading"
                >
                  Download Template
                </button>

                <div class="flex gap-2">
                  <button
                    @click="closeModal"
                    class="btn btn-outline"
                    :disabled="isUploading"
                  >
                    Cancel
                  </button>
                  <button
                    @click="uploadFile"
                    class="btn bg-brand-500 border-none"
                    :disabled="!selectedFile || isUploading"
                  >
                    <span v-if="isUploading" class="loading loading-spinner loading-sm"></span>
                    {{ isUploading ? 'Uploading...' : 'Upload' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted, onBeforeUnmount } from 'vue'

const emit = defineEmits(['file-uploaded'])

/* state */
const isOpen = ref(false)
const isUploading = ref(false)
const isDragging = ref(false)
const selectedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const panelRef = ref<HTMLDivElement | null>(null)
const uploadSuccess = ref('')

const errors = reactive({
  file: '',
  submit: ''
})

/* Modal scroll lock utilities */
let scrollY = 0
let scrollbarWidth = 0

const getScrollbarWidth = () => {
  return window.innerWidth - document.documentElement.clientWidth
}

const lockScroll = () => {
  scrollY = window.scrollY
  scrollbarWidth = getScrollbarWidth()

  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollY}px`
  document.body.style.left = '0'
  document.body.style.right = '0'
  document.body.style.paddingRight = `${scrollbarWidth}px`
  document.body.style.overflow = 'hidden'
}

const unlockScroll = () => {
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.left = ''
  document.body.style.right = ''
  document.body.style.paddingRight = ''
  document.body.style.overflow = ''

  window.scrollTo(0, scrollY)
}

/* Modal methods */
const openModal = async () => {
  isOpen.value = true
  lockScroll()

  await nextTick()

  if (panelRef.value) {
    panelRef.value.focus()
  }
}

const closeModal = async () => {
  if (isUploading.value) return

  isOpen.value = false

  await nextTick()

  selectedFile.value = null
  errors.file = ''
  errors.submit = ''
  uploadSuccess.value = ''

  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

/* File handling */
const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

const validateFile = (file: File | null): boolean => {
  if (!file) {
    errors.file = 'Please select a file'
    return false
  }

  const validExtensions = ['xls', 'xlsx']
  const fileExtension = file.name.split('.').pop()?.toLowerCase()

  if (!fileExtension || !validExtensions.includes(fileExtension)) {
    errors.file = 'Invalid file type. Please upload .xls or .xlsx file'
    return false
  }

  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    errors.file = 'File size exceeds 10MB limit'
    return false
  }

  errors.file = ''
  return true
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file && validateFile(file)) {
    selectedFile.value = file
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file && validateFile(file)) {
    selectedFile.value = file
  }
}

const removeFile = () => {
  selectedFile.value = null
  errors.file = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

/* Download template */
const downloadTemplate = async () => {
  try {
    const response = await fetch('/api/product/download-template', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to download template')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'product_import_template.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading template:', error)
    errors.submit = 'Failed to download template. Please try again.'
  }
}

/* Upload file */
const uploadFile = async () => {
  if (!selectedFile.value || !validateFile(selectedFile.value)) {
    return
  }

  isUploading.value = true
  errors.submit = ''
  uploadSuccess.value = ''

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    // Get auth token
    const token = localStorage.getItem('token')

    // Make the API call
    const response = await fetch('/api/product/bulk-import', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to upload file')
    }

    const data = await response.json()
    console.log('Upload response:', data)

    // Show detailed results
    if (data.success) {
      uploadSuccess.value = `Successfully imported ${data.successCount} product(s)!`
    } else {
      const errorMessage = []
      if (data.errorCount > 0) {
        errorMessage.push(`${data.errorCount} error(s)`)
      }
      if (data.skipped && data.skipped.length > 0) {
        errorMessage.push(`${data.skipped.length} skipped (duplicates)`)
      }

      if (data.successCount > 0) {
        uploadSuccess.value = `Partially completed: ${data.successCount} created, ${errorMessage.join(', ')}`
      } else {
        throw new Error(`Import failed: ${errorMessage.join(', ')}. Check console for details.`)
      }
    }    // Log detailed errors for debugging
    if (data.errors && data.errors.length > 0) {
      console.error('Import errors:', data.errors)
    }

    // Wait a moment to show success message
    setTimeout(async () => {
      await closeModal()
      // Emit event to parent component with success status
      emit('file-uploaded', { success: true, data })
    }, 2000)

  } catch (error) {
    console.error('Error uploading file:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload file. Please try again.'
    errors.submit = errorMessage
    // Emit event to parent component with error status
    emit('file-uploaded', { success: false, error: errorMessage })
  } finally {
    isUploading.value = false
  }
}

/* Keyboard handling */
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value && !isUploading.value) {
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape)
  unlockScroll()
})

defineExpose({
  openModal,
  closeModal
})
</script>
