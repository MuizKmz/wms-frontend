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
            class="relative z-10 w-full max-w-lg mx-4"
            @click.stop
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
              <!-- header -->
              <div class="flex items-center justify-between mb-4">
                <h2 id="modal-title" class="text-lg font-semibold text-gray-900 dark:text-white">
                  Add New Machine
                </h2>
                <button
                  type="button"
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  @click="closeModal"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              <!-- body -->
              <div class="space-y-4">
                <div>
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    Machine Name
                  </label>
                  <input
                    v-model="form.machineName"
                    type="text"
                    placeholder="Enter machine name"
                    class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <!-- date (flatpickr) -->
                <div>
                  <label class="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                    Installation Date
                  </label>
                  <input
                    ref="dateInput"
                    type="text"
                    placeholder="Select date"
                    class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <!-- dropdown (container has ref) -->
                <div class="dropdown relative inline-flex w-full" ref="typeDropdownRef">
                  <button
                    type="button"
                    class="dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400"
                    :aria-expanded="openDropdowns.type"
                    @click.stop="toggleDropdown('type')"
                  >
                    {{ form.type || 'Select Machine Type' }}
                    <span
                      class="icon-[tabler--chevron-down] size-4 transition-transform"
                      :class="{ 'rotate-180': openDropdowns.type }"
                    ></span>
                  </button>

                  <ul
                    class="dropdown-menu min-w-full w-full transition-opacity duration-200 absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 text-gray-900 dark:text-white"
                    :class="{ 'opacity-100 pointer-events-auto': openDropdowns.type, 'opacity-0 pointer-events-none': !openDropdowns.type }"
                    role="menu"
                  >
                    <li>
                      <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('type','Lathe')">
                        Lathe
                      </a>
                    </li>
                    <li>
                      <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('type','Milling')">
                        Milling
                      </a>
                    </li>
                    <li>
                      <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectOption('type','Drill')">
                        Drill
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- footer -->
              <div class="flex justify-end gap-2 mt-6">
                <button @click="closeModal" class="btn btn-outline btn-error">Cancel</button>
                <button @click="submitForm" class="btn btn-primary">Save</button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, onBeforeUnmount } from 'vue'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.css'

/* state */
const isOpen = ref(false)
const panelRef = ref(null)
const dateInput = ref(null)
const typeDropdownRef = ref(null)
const fpInstance = ref(null)

const form = reactive({
  machineName: '',
  installationDate: '',
  type: ''
})

const openDropdowns = reactive({ type: false })

/* Modal scroll lock utilities */
let scrollY = 0
let scrollbarWidth = 0

const getScrollbarWidth = () => {
  return window.innerWidth - document.documentElement.clientWidth
}

const lockScroll = () => {
  scrollY = window.scrollY
  scrollbarWidth = getScrollbarWidth()
  
  // Prevent layout shift by compensating for scrollbar width
  document.body.style.paddingRight = `${scrollbarWidth}px`
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollY}px`
  document.body.style.width = '100%'
  document.body.style.overflow = 'hidden'
}

const unlockScroll = () => {
  document.body.style.paddingRight = ''
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''
  document.body.style.overflow = ''
  
  // Use requestAnimationFrame to avoid flickering
  requestAnimationFrame(() => {
    window.scrollTo(0, scrollY)
  })
}

/* helpers */
const toggleDropdown = (name) => {
  // only one dropdown here; close others if present
  Object.keys(openDropdowns).forEach(k => { if (k !== name) openDropdowns[k] = false })
  openDropdowns[name] = !openDropdowns[name]
}

const selectOption = (key, value) => {
  form[key] = value
  openDropdowns[key] = false
}

/* close dropdowns when clicking outside */
const handleClickOutside = (event) => {
  const dd = typeDropdownRef.value
  if (dd && !dd.contains(event.target)) {
    openDropdowns.type = false
  }
}

/* flatpickr init/destroy — init after modal is shown so the input exists */
const initFlatpickr = () => {
  if (!dateInput.value) return
  if (fpInstance.value) return // already initialized
  fpInstance.value = flatpickr(dateInput.value, {
    dateFormat: 'Y-m-d',
    allowInput: true,
    onChange: (selectedDates, dateStr) => {
      form.installationDate = dateStr
    }
  })
}

const destroyFlatpickr = () => {
  if (fpInstance.value) {
    try { fpInstance.value.destroy() } catch (e) { /* ignore */ }
    fpInstance.value = null
  }
}

/* open/close modal */
const openModal = async () => {
  isOpen.value = true
  // lock scroll
  lockScroll()
  await nextTick()
  initFlatpickr()
  // focus first input
  panelRef.value?.querySelector('input,select,textarea,button')?.focus()
}

const closeModal = () => {
  openDropdowns.type = false
  destroyFlatpickr()
  isOpen.value = false
  // Don't unlock scroll here - let the transition hook handle it
}

/* submit */
const submitForm = () => {
  // basic validation (example)
  if (!form.machineName || !form.installationDate || !form.type) {
    alert('Please fill required fields: name, date, type')
    return
  }
  // emit or handle the form here
  console.log('Form submitted:', { ...form })
  closeModal()
}

/* lifecycle */
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  destroyFlatpickr()
  // Ensure scroll is unlocked if component is destroyed while modal is open
  if (isOpen.value) {
    unlockScroll()
  }
})

/* expose to parent */
defineExpose({ openModal, closeModal })
</script>

<style scoped>
/* optional: small tweak for smoother initial transform */
[role="dialog"] > .bg-white {
  transform-origin: center;
}
</style>