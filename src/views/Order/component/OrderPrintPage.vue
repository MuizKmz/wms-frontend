<template>
    <div class="min-h-screen bg-gray-50 p-8">
        <div class="max-w-5xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
            <!-- Header Section -->
            <div class="border-b border-gray-200 p-6 bg-white">
                <div class="grid grid-cols-3 gap-6">
                    <!-- Left Column -->
                    <div class="space-y-4">
                        <div>
                            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Customer Name</p>
                            <p class="text-sm font-semibold text-gray-900">
                                {{ orderData.customer?.customerName || orderData.supplier?.supplierName || '-' }}
                            </p>
                        </div>
                        <div>
                            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Person-in-Charge</p>
                            <p class="text-sm font-semibold text-gray-900">{{ orderData.picName || '-' }}</p>
                        </div>
                    </div>

                    <!-- Center Column -->
                    <div class="flex items-start">
                        <div>
                            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Estimated Delivery</p>
                            <p class="text-sm font-semibold text-gray-900">{{ formatDate(orderData.estimatedDeliveryTime) }}</p>
                        </div>
                    </div>

                    <!-- Right Column - QR Code -->
                    <div class="flex justify-end">
                        <div v-if="qrCodeUrl" class="flex flex-col items-center space-y-2">
                            <img :src="qrCodeUrl" alt="QR Code" class="w-24 h-24 border-2 border-gray-300 rounded-lg p-1 bg-white" />
                            <p class="text-xs font-medium text-gray-700">{{ orderData.orderNo || '' }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Products Section for SO Orders -->
            <div v-if="orderData.orderType === 'SO'" class="p-6 space-y-6">
                <div v-for="(item, itemIdx) in orderData.orderItems" :key="itemIdx"
                     class="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
                    <!-- Product Header -->
                    <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <div class="flex justify-between items-center">
                            <div>
                                <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Product Name</span>
                                <p class="text-sm font-semibold text-gray-900 mt-1">
                                    {{ item.product?.name || item.productName || '-' }}
                                </p>
                            </div>
                            <div class="text-right">
                                <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Quantity</span>
                                <p class="text-sm font-semibold text-gray-900 mt-1">{{ item.quantity }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- EPC Table -->
                    <div>
                        <table class="w-full divide-y divide-gray-200 border border-gray-200">
                            <thead class="bg-gray-100">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                        EPC Code
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                        Warehouse
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Location
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <tr v-if="item.allocatedEpcs && item.allocatedEpcs.length > 0"
                                    v-for="(epc, epcIdx) in item.allocatedEpcs" :key="epcIdx"
                                    class="hover:bg-gray-50 transition-colors border-b border-gray-200">
                                    <td class="px-6 py-4 text-sm font-mono text-gray-900 border-r border-gray-200">
                                        {{ epc.epcCode || '-' }}
                                    </td>
                                    <td class="px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                                        {{ epc.warehouseCode || '-' }}
                                    </td>
                                    <td class="px-6 py-4 text-sm text-gray-900">
                                        {{ epc.locationCode || '-' }}
                                    </td>
                                </tr>
                                <tr v-else>
                                    <td colspan="3" class="px-6 py-8 text-center text-sm text-gray-500 italic">
                                        No EPC allocation data
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Table for PO Orders -->
            <div v-else class="p-6">
                <table class="w-full divide-y divide-gray-200 border border-gray-200">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12 border-r border-gray-200">#</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">Product Name</th>
                            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 border-r border-gray-200">Quantity</th>
                            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16 border-r border-gray-200">Unit</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 border-r border-gray-200">Location Code</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="(item, idx) in orderData.orderItems" :key="idx" class="hover:bg-gray-50 transition-colors border-b border-gray-200">
                            <td class="px-3 py-4 text-sm text-gray-900 border-r border-gray-200">{{ idx + 1 }}</td>
                            <td class="px-4 py-4 text-sm text-gray-900 border-r border-gray-200">
                                {{ item.product?.name || item.productName || item.productId || '-' }}
                            </td>
                            <td class="px-3 py-4 text-sm text-gray-900 border-r border-gray-200">{{ item.quantity ?? '-' }}</td>
                            <td class="px-3 py-4 text-sm text-gray-900 border-r border-gray-200">{{ item.unit || 'pcs' }}</td>
                            <td class="px-4 py-4 text-sm text-gray-900 border-r border-gray-200">{{ item.locationCode ?? '-' }}</td>
                            <td class="px-4 py-4 text-sm text-gray-900">{{ item.remarks || '-' }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import authenticatedFetch from '@/utils/authenticatedFetch'

const route = useRoute()
const orderData = ref<any>({})
const qrCodeUrl = ref<string>('')

const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    try {
        const d = new Date(dateString)
        return d.toLocaleDateString('en-GB')
    } catch {
        return dateString
    }
}

const fetchQRCode = async (orderNo: string) => {
    if (!orderNo) return

    try {
        const API_URL = `/api/order/code/image?orderNo=${encodeURIComponent(orderNo)}&type=qr`
        const response = await authenticatedFetch(API_URL)

        if (response.ok) {
            const data = await response.json()
            if (data.imageUrl) {
                const imgUrl: string = data.imageUrl
                if (imgUrl.startsWith('/')) {
                    const backendBase = import.meta.env.VITE_BACKEND_URL || `${window.location.protocol}//${window.location.hostname}:3000`
                    qrCodeUrl.value = backendBase.replace(/\/$/, '') + imgUrl
                } else {
                    qrCodeUrl.value = imgUrl
                }
            }
        }
    } catch (error) {
        console.error('Error fetching QR code:', error)
    }
}

onMounted(async () => {
    const storedData = sessionStorage.getItem('orderPrintData')
    if (storedData) {
        orderData.value = JSON.parse(storedData)
        sessionStorage.removeItem('orderPrintData')

        if (orderData.value.orderNo) {
            // fetch the QR code and wait for it to appear before printing
            // but don't hang forever — use a max wait timeout
            await fetchQRCode(orderData.value.orderNo)

            // wait until qrCodeUrl is populated or max 2s timeout
            await new Promise((resolve) => {
                const maxWait = setTimeout(() => {
                    stopWatcher && stopWatcher()
                    resolve(undefined)
                }, 2000)

                let stopWatcher: (() => void) | null = null
                if (qrCodeUrl.value) {
                    clearTimeout(maxWait)
                    resolve(undefined)
                    return
                }
                stopWatcher = watch(qrCodeUrl, (val) => {
                    if (val) {
                        clearTimeout(maxWait)
                        stopWatcher && stopWatcher()
                        resolve(undefined)
                    }
                })
            })
        }

        // small delay to ensure DOM paints
        setTimeout(() => {
            window.print()
        }, 300)
    }
})
</script>

<style scoped>
/* Print Styles */
@media print {
    * {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
    }

    body {
        margin: 0;
        padding: 0;
        background: white !important;
    }

    .min-h-screen {
        min-height: auto;
        background: white !important;
    }

    .bg-gray-50 {
        background: white !important;
    }

    .p-8 {
        padding: 0 !important;
    }

    .max-w-5xl {
        max-width: 100%;
        margin: 0;
    }

    .shadow-lg {
        box-shadow: none !important;
    }

    .rounded-lg {
        border-radius: 0 !important;
    }

    .border-gray-200 {
        border-color: #e5e7eb !important;
    }

    .border {
        border-width: 1px !important;
        border-color: #e5e7eb !important;
    }

    .border-r {
        border-right-width: 1px !important;
        border-right-color: #e5e7eb !important;
    }

    .border-b {
        border-bottom-width: 1px !important;
        border-bottom-color: #e5e7eb !important;
    }

    .bg-gray-100,
    .bg-gray-50 {
        background-color: #f3f4f6 !important;
    }

    /* Remove hover effects in print */
    .hover\:bg-gray-50,
    .hover\:border-gray-300,
    .transition-colors {
        transition: none !important;
    }

    /* Ensure tables fit properly */
    table {
        width: 100% !important;
        table-layout: auto;
        border-collapse: collapse;
    }

    td, th {
        word-wrap: break-word;
        overflow-wrap: break-word;
    }

    /* Column width constraints for print */
    th.w-12, td:nth-child(1) {
        width: 40px !important;
    }

    th.w-20, td:nth-child(3) {
        width: 80px !important;
    }

    th.w-16, td:nth-child(4) {
        width: 60px !important;
    }

    th.w-32, td:nth-child(5) {
        width: 120px !important;
    }

    /* Page break controls */
    .space-y-6 > * {
        page-break-inside: avoid;
    }

    /* Hide any scrollbars */
    * {
        overflow: visible !important;
    }

    @page {
        margin: 15mm;
        size: A4;
    }
}
</style>
