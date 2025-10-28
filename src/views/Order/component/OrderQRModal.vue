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
        class="fixed inset-0 z-[9999] flex items-center justify-center"
        aria-hidden="false"
        @click.self="closeModal"
      >
        <div class="absolute inset-0 bg-black/50"></div>

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
            class="relative z-10 w-full max-w-lg mx-4 max-h-[90vh] flex flex-col"
            @click.stop
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col">

              <div class="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 id="modal-title" class="text-lg font-semibold text-gray-900 dark:text-white">
                  Order QR Code
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

              <div class="space-y-6 overflow-y-auto p-6 flex-1 text-center">

                <div class="flex items-center justify-center pt-2">
                    <span :class="{'font-bold text-gray-900 dark:text-white': !isQRCode, 'text-gray-500 dark:text-gray-400': isQRCode}">Bar Code</span>
                    <label class="relative inline-flex items-center cursor-pointer mx-4">
                        <input type="checkbox" v-model="isQRCode" class="sr-only peer" @change="fetchCodeImage">
                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                    <span :class="{'font-bold text-gray-900 dark:text-white': isQRCode, 'text-gray-500 dark:text-gray-400': !isQRCode}">QR Code</span>
                </div>

                <div v-if="loading" class="p-8">
                    <span class="loading loading-spinner loading-lg text-blue-500"></span>
                    <p class="text-gray-500 dark:text-gray-400 mt-2">Loading code image...</p>
                </div>

                <div v-else-if="imageError" class="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                    <strong class="font-bold">Error:</strong>
                    <p class="text-sm mt-1">{{ imageError }}</p>
                </div>

                <div v-else-if="codeImageUrl" class="flex justify-center items-center py-4">
                    <img :src="codeImageUrl" :alt="isQRCode ? 'QR Code' : 'Bar Code'" class="max-w-[80%] w-full h-auto object-contain">
                </div>

                <div v-else class="p-8 text-gray-500 dark:text-gray-400">
                    <p>Select an order to display its tracking code.</p>
                </div>

                <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    Order Number: <span class="text-gray-900 dark:text-white font-normal break-all">{{ displayedOrderNo || 'N/A' }}</span>
                </p>

              </div>

              <div class="flex justify-end gap-2 p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    @click="printCode"
                    class="btn btn-outline"
                    :disabled="loading || !codeImageUrl"
                >
                    Print
                </button>
                <button
                    @click="downloadCode"
                    class="btn bg-brand-500 hover:bg-brand-600 border-none"
                    :disabled="loading || !codeImageUrl"
                >
                    Download
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount } from "vue";
import authenticatedFetch from '@/utils/authenticatedFetch'

// Define Props and Emits
const props = defineProps<{
  show: boolean;
  initialOrderNo: string | null;
}>();

const emit = defineEmits(['close']);

// --- Internal State Variables ---
const isOpen = ref(props.show);
const displayedOrderNo = ref(props.initialOrderNo || '');
const isQRCode = ref(true); // true for QR Code, false for Bar Code
const codeImageUrl = ref<string | null>(null);
const loading = ref(false);
const imageError = ref<string | null>(null);
const panelRef = ref<HTMLElement | null>(null);

// ------------------------------------------------
// --- API Call Logic ---
// ------------------------------------------------

const fetchCodeImage = async () => {
    const orderNo = displayedOrderNo.value;
    if (!orderNo) {
        imageError.value = "No order number provided.";
        codeImageUrl.value = null;
        return;
    }

    loading.value = true;
    imageError.value = null;
    codeImageUrl.value = null;

    // Determine the API endpoint based on the toggle state
    const codeType = isQRCode.value ? 'qr' : 'bar';

    // Update this to your actual API endpoint
    const API_URL = `/api/order/code/image?orderNo=${encodeURIComponent(orderNo)}&type=${codeType}`;

    try {
        const response = await authenticatedFetch(API_URL);

        if (!response.ok) {
            const errorText = await response.text();
            let message = `Server responded with status ${response.status}.`;
            try {
                const errorJson = JSON.parse(errorText);
                message = errorJson.message || errorJson.error || message;
            } catch {
                if (errorText.length > 0 && errorText.length < 100) message = errorText;
            }
            throw new Error(message);
        }

        const data = await response.json();

        if (!data.imageUrl) {
            throw new Error("API response is missing the image URL.");
        }

        const imgUrl: string = data.imageUrl;
        if (imgUrl.startsWith('/')) {
            const backendBase = import.meta.env.VITE_BACKEND_URL || `${window.location.protocol}//${window.location.hostname}:3000`;
            codeImageUrl.value = backendBase.replace(/\/$/, '') + imgUrl;
        } else {
            codeImageUrl.value = imgUrl;
        }

    } catch (e) {
        const err = e as Error;
        console.error("Error fetching code image:", err);
        imageError.value = err.message || "An unknown error occurred while fetching the code image.";
        codeImageUrl.value = null;
    } finally {
        loading.value = false;
    }
};

// ------------------------------------------------
// --- Scroll Lock Utilities ---
// ------------------------------------------------
let scrollY = 0;
let scrollbarWidth = 0;
const getScrollbarWidth = () => window.innerWidth - document.documentElement.clientWidth;

const lockScroll = () => {
    scrollY = window.scrollY;
    scrollbarWidth = getScrollbarWidth();

    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
};

const unlockScroll = () => {
    document.body.style.paddingRight = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';

    requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
    });
};

// ------------------------------------------------
// --- Modal Open/Close Logic ---
// ------------------------------------------------

const openModal = async (orderNo: string | null) => {
    displayedOrderNo.value = orderNo || '';
    codeImageUrl.value = null;
    imageError.value = null;
    loading.value = false;

    isOpen.value = true;
    lockScroll();

    await nextTick();

    if (orderNo) {
        await fetchCodeImage();
    }
};

const closeModal = () => {
    isOpen.value = false;
    emit('close');
};

// ------------------------------------------------
// --- Action Button Implementations ---
// ------------------------------------------------

const downloadCode = () => {
    if (!codeImageUrl.value) return;
    const link = document.createElement('a');
    link.href = codeImageUrl.value;
    link.download = `${displayedOrderNo.value}-${isQRCode.value ? 'QR' : 'BAR'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const printCode = () => {
    if (!codeImageUrl.value) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        const type = isQRCode.value ? 'QR Code' : 'Bar Code';
        printWindow.document.write(`<html><head><title>Print ${type}</title><style>
            @media print {
                body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; flex-direction: column; }
                img { max-width: 90%; height: auto; margin-bottom: 20px; }
            }
        </style></head><body>`);
        printWindow.document.write(`<div style="display: flex; flex-direction: column; align-items: center; padding: 20px;">`);
        printWindow.document.write(`<img src="${codeImageUrl.value}" style="max-width: 300px; height: auto; margin-bottom: 20px;" onload="window.print();window.close()"/>`);
        printWindow.document.write(`<p style="font-family: Arial, sans-serif; font-size: 14px; text-align: center;">Order Number: ${displayedOrderNo.value}</p>`);
        printWindow.document.write(`</div></body></html>`);
        printWindow.document.close();
    }
};

// ------------------------------------------------
// --- Watchers & Lifecycle ---
// ------------------------------------------------

watch(() => props.show, (newVal) => {
    if (newVal) {
        openModal(props.initialOrderNo);
    } else {
        isOpen.value = false;
    }
});

watch(() => props.initialOrderNo, (newOrderNo) => {
    if (isOpen.value) {
        displayedOrderNo.value = newOrderNo || '';
        fetchCodeImage();
    }
});

onBeforeUnmount(() => {
    if (isOpen.value) {
        unlockScroll();
    }
});

defineExpose({ openModal, closeModal });
</script>

<style scoped>
[role="dialog"] > .bg-white, [role="dialog"] > .dark\:bg-gray-800 {
  transform-origin: center;
}
</style>
