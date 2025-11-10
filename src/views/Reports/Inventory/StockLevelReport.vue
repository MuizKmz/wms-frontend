<template>
  <AdminLayout>
    <ReportLayout
      title="Stock Level Report"
      description="View current stock levels across all warehouses"
      :reportGenerated="reportGenerated"
      :generating="generating"
      @generate="generateReport"
      @print="printReport"
      @export="exportReport"
      @toggle-designer="showDesigner = !showDesigner"
    >
      <!-- Filters Slot -->
      <template #filters>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Warehouse</label>
          <select v-model="filters.warehouse" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
            <option value="">All Warehouses</option>
            <option value="Main Warehouse">Main Warehouse</option>
            <option value="North Branch">North Branch</option>
            <option value="South Branch">South Branch</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stock Status</label>
          <select v-model="filters.status" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
            <option value="">All Status</option>
            <option value="Good">Good</option>
            <option value="Low">Low</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Name</label>
          <input v-model="filters.product" type="text" placeholder="Search product..." class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
        </div>
      </template>

      <!-- Main Content -->
      <div v-if="!reportGenerated" class="flex justify-center py-20">
        <div class="text-center">
          <svg class="w-32 h-32 mx-auto text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-gray-500 dark:text-gray-400 text-lg">Configure filters and click "Generate Report"</p>
        </div>
      </div>

      <A4Preview v-if="reportGenerated" v-model:activeTab="activeTab" ref="a4PreviewRef">
        <!-- A4 Content -->
        <template #a4-content>
          <div id="printable-report">
            <ReportTemplate
              title="Stock Level Report"
              subtitle="Inventory Status Across All Locations"
              :generated-date="reportDate"
              :applied-filters="getAppliedFilters()"
              :summary-cards="showSummaryCards ? getSummaryCards() : []"
              :logo-url="logoUrl"
              :company-name="companyName"
              :company-address="companyAddress"
              :show-header="showHeader"
              :show-table="showTable"
              :show-footer="showFooter"
              generated-by="Admin User"
              @upload-logo="handleLogoUpload"
            >
              <table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Warehouse Location</th>
                    <th>Current Stock</th>
                    <th>Min Level</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in filteredData" :key="item.id">
                    <td>{{ item.product }}</td>
                    <td>{{ item.warehouse }}</td>
                    <td class="font-semibold">{{ item.currentStock }}</td>
                    <td>{{ item.minLevel }}</td>
                    <td>
                      <span 
                        class="status-badge"
                        :class="{
                          'bg-green-100 text-green-700': item.status === 'Good',
                          'bg-yellow-100 text-yellow-700': item.status === 'Low',
                          'bg-red-100 text-red-700': item.status === 'Critical'
                        }"
                      >
                        {{ item.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </ReportTemplate>

            <!-- Overlay Components from Designer -->
            <div v-if="savedDesign?.components && savedDesign.components.length > 0" class="absolute inset-0 pointer-events-none">
              <div
                v-for="(component, index) in savedDesign.components"
                :key="index"
                :style="{
                  position: 'absolute',
                  left: component.x + 'px',
                  top: component.y + 'px',
                  width: component.width + 'px',
                  height: component.height ? component.height + 'px' : 'auto'
                }"
                class="pointer-events-auto"
              >
                <!-- Signature Component -->
                <div v-if="component.type === 'signature'" class="text-center bg-white p-2 h-full flex flex-col justify-center">
                  <p class="text-xs text-gray-600 mb-2">{{ component.data.label }}</p>
                  <img v-if="component.data.image" :src="component.data.image" alt="Signature" class="max-w-full max-h-full mx-auto object-contain" />
                  <div v-else class="border-b-2 border-gray-800 h-8"></div>
                  <p class="text-xs text-gray-500 mt-1">Signature</p>
                </div>

                <!-- Stamp Component -->
                <div v-else-if="component.type === 'stamp'" class="flex justify-center items-center bg-white p-2 h-full">
                  <img v-if="component.data.image" :src="component.data.image" alt="Stamp" class="max-w-full max-h-full object-contain" />
                  <div v-else class="border-2 border-gray-600 rounded-full aspect-square max-w-full max-h-full flex items-center justify-center p-2">
                    <p class="text-xs text-gray-700 text-center font-semibold">{{ component.data.label }}</p>
                  </div>
                </div>

                <!-- Text Component -->
                <div v-else-if="component.type === 'text'" class="bg-white p-2 h-full flex items-center">
                  <p class="text-sm text-gray-800">{{ component.data.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </template>
      </A4Preview>
    </ReportLayout>

    <!-- Report Designer Modal -->
    <ReportDesigner
      v-if="showDesigner"
      reportType="stock-level"
      :preview-html="getPreviewHTML()"
      @close="showDesigner = false"
      @save="handleDesignSave"
    />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import ReportLayout from '@/components/common/ReportLayout.vue'
import A4Preview from '@/components/common/A4Preview.vue'
import ReportDesigner from '@/components/common/ReportDesigner.vue'
import ReportTemplate from '@/components/common/ReportTemplate.vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import Swal from 'sweetalert2'

const route = useRoute()

const reportGenerated = ref(false)
const generating = ref(false)
const activeTab = ref('table')
const showDesigner = ref(false)
const reportDate = ref(new Date())
const logoUrl = ref(localStorage.getItem('reportLogoUrl') || '')

// Load saved design settings
const savedDesign = ref<any>(null)
const companyName = ref('Warehouse Management System')
const companyAddress = ref('Inventory Management Division')
const showSummaryCards = ref(true)
const showTable = ref(true)
const showHeader = ref(true)
const showFooter = ref(true)

const loadDesignSettings = () => {
  const saved = localStorage.getItem('report-design-stock-level')
  if (saved) {
    try {
      const data = JSON.parse(saved)
      savedDesign.value = data
      
      if (data.logoUrl) {
        logoUrl.value = data.logoUrl
      }
      if (data.companyName) {
        companyName.value = data.companyName
      }
      if (data.companyAddress) {
        companyAddress.value = data.companyAddress
      }
      if (data.showSummaryCards !== undefined) {
        showSummaryCards.value = data.showSummaryCards
      }
      if (data.showTable !== undefined) {
        showTable.value = data.showTable
      }
      if (data.showHeader !== undefined) {
        showHeader.value = data.showHeader
      }
      if (data.showFooter !== undefined) {
        showFooter.value = data.showFooter
      }
      
      console.log('Loaded design with', data.components?.length || 0, 'overlay components')
    } catch (e) {
      console.error('Error loading design settings:', e)
    }
  }
}

const filters = ref({
  warehouse: '',
  status: '',
  product: ''
})

const stockData = ref([
  { id: 1, product: 'Laptop HP Elite', warehouse: 'Main Warehouse', currentStock: 45, minLevel: 20, status: 'Good' },
  { id: 2, product: 'Mouse Logitech', warehouse: 'Main Warehouse', currentStock: 15, minLevel: 30, status: 'Low' },
  { id: 3, product: 'Keyboard Mechanical', warehouse: 'South Branch', currentStock: 5, minLevel: 10, status: 'Critical' },
  { id: 4, product: 'Monitor Dell 24"', warehouse: 'North Branch', currentStock: 60, minLevel: 25, status: 'Good' },
  { id: 5, product: 'USB Cable', warehouse: 'Main Warehouse', currentStock: 100, minLevel: 50, status: 'Good' },
  { id: 6, product: 'Webcam HD', warehouse: 'North Branch', currentStock: 8, minLevel: 15, status: 'Low' },
  { id: 7, product: 'Headset Wireless', warehouse: 'South Branch', currentStock: 3, minLevel: 10, status: 'Critical' }
])

const filteredData = computed(() => {
  return stockData.value.filter(item => {
    if (filters.value.warehouse && item.warehouse !== filters.value.warehouse) return false
    if (filters.value.status && item.status !== filters.value.status) return false
    if (filters.value.product && !item.product.toLowerCase().includes(filters.value.product.toLowerCase())) return false
    return true
  })
})

const lowStockCount = computed(() => filteredData.value.filter(item => item.status === 'Low').length)
const criticalCount = computed(() => filteredData.value.filter(item => item.status === 'Critical').length)

const getAppliedFilters = () => {
  const appliedFilters: { label: string; value: string }[] = []
  if (filters.value.warehouse) appliedFilters.push({ label: 'Warehouse', value: filters.value.warehouse })
  if (filters.value.status) appliedFilters.push({ label: 'Status', value: filters.value.status })
  if (filters.value.product) appliedFilters.push({ label: 'Product Search', value: filters.value.product })
  return appliedFilters
}

const getSummaryCards = () => {
  return [
    { label: 'Total Items', value: filteredData.value.length.toString(), subtitle: 'Products in inventory' },
    { label: 'Low Stock', value: lowStockCount.value.toString(), subtitle: 'Needs restocking' },
    { label: 'Critical', value: criticalCount.value.toString(), subtitle: 'Immediate attention' }
  ]
}

const generateReport = () => {
  generating.value = true
  reportDate.value = new Date()
  setTimeout(() => {
    generating.value = false
    reportGenerated.value = true
  }, 1500)
}

const printReport = () => {
  // Create a new tab with the full app styling
  const printContent = document.getElementById('printable-report')
  if (!printContent) return

  // Get all stylesheets from the current page
  const stylesheets = Array.from(document.styleSheets)
    .map(sheet => {
      try {
        // Try to get inline styles
        if (sheet.href) {
          return `<link rel="stylesheet" href="${sheet.href}">`
        } else if (sheet.ownerNode && (sheet.ownerNode as HTMLElement).outerHTML) {
          return (sheet.ownerNode as HTMLElement).outerHTML
        }
      } catch (e) {
        // Cross-origin stylesheets
        if (sheet.href) {
          return `<link rel="stylesheet" href="${sheet.href}">`
        }
      }
      return ''
    })
    .join('\n')

  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Stock Level Report - Print Preview</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${stylesheets}
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    
    body {
      margin: 0;
      padding: 2rem;
      background: white;
    }
    
    #printable-report {
      max-width: 210mm;
      margin: 0 auto;
    }
    
    /* Hide elements that shouldn't print */
    @media print {
      body {
        padding: 0;
      }
      
      @page {
        margin: 15mm 20mm;
      }
    }
    
    /* Print button for the preview */
    .print-button {
      position: fixed;
      top: 1rem;
      right: 1rem;
      padding: 0.75rem 1.5rem;
      background: rgb(37, 99, 235);
      color: white;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      font-weight: 600;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 1000;
    }
    
    .print-button:hover {
      background: rgb(29, 78, 216);
    }
    
    @media print {
      .print-button {
        display: none;
      }
    }
  </style>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  <\/script>
</head>
<body>
  <button class="print-button" onclick="window.print()">🖨️ Print</button>
  ${printContent.outerHTML}
</body>
</html>`
  
  printWindow.document.write(htmlContent)
  printWindow.document.close()
}

const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
  if (format === 'pdf') {
    exportToPDF()
  } else if (format === 'excel') {
    exportToExcel()
  } else if (format === 'csv') {
    exportToCSV()
  }
}

const exportToPDF = async () => {
  // Show loading
  Swal.fire({
    title: 'Generating PDF...',
    text: 'Please wait',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
    }
  })

  try {
    // Use the print approach - open in new tab with print-ready HTML
    const printContent = document.getElementById('printable-report')
    if (!printContent) {
      throw new Error('Report content not found')
    }

    // Get all stylesheets
    const stylesheets = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          if (sheet.href) {
            return `<link rel="stylesheet" href="${sheet.href}">`
          } else if (sheet.ownerNode && (sheet.ownerNode as HTMLElement).outerHTML) {
            return (sheet.ownerNode as HTMLElement).outerHTML
          }
        } catch (e) {
          if (sheet.href) {
            return `<link rel="stylesheet" href="${sheet.href}">`
          }
        }
        return ''
      })
      .join('\n')

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      throw new Error('Please allow popups to export PDF')
    }

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Stock Level Report</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${stylesheets}
  <style>
    @page {
      size: A4;
      margin: 15mm 20mm;
    }
    
    body {
      margin: 0;
      padding: 0;
      background: white;
    }
    
    #printable-report {
      width: 210mm;
      margin: 0 auto;
      background: white;
    }
    
    @media print {
      body {
        width: 210mm;
      }
    }
  </style>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        // Show success message before closing
        setTimeout(function() {
          if (window.opener) {
            window.opener.postMessage('pdf-exported', '*');
          }
        }, 500);
      }, 500);
    };
  <\/script>
</head>
<body>
  ${printContent.outerHTML}
</body>
</html>`
    
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    
    // Listen for message from print window
    const messageHandler = (event: MessageEvent) => {
      if (event.data === 'pdf-exported') {
        Swal.fire({
          title: 'Success!',
          text: 'Use your browser\'s "Save as PDF" option in the print dialog',
          icon: 'success',
          timer: 3000,
          showConfirmButton: false
        })
        window.removeEventListener('message', messageHandler)
      }
    }
    window.addEventListener('message', messageHandler)
    
    // Close loading after a delay
    setTimeout(() => {
      if (Swal.isLoading()) {
        Swal.close()
      }
    }, 2000)
    
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: error instanceof Error ? error.message : 'Failed to generate PDF',
      icon: 'error'
    })
  }
}

const exportToExcel = () => {
  const data = filteredData.value.map(item => ({
    'Product Name': item.product,
    'Warehouse': item.warehouse,
    'Current Stock': item.currentStock,
    'Min Level': item.minLevel,
    'Status': item.status
  }))
  
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Stock Level Report')
  
  // Add column widths
  ws['!cols'] = [
    { wch: 25 }, // Product Name
    { wch: 20 }, // Warehouse
    { wch: 15 }, // Current Stock
    { wch: 12 }, // Min Level
    { wch: 12 }  // Status
  ]
  
  XLSX.writeFile(wb, `stock-level-report-${new Date().getTime()}.xlsx`)
}

const exportToCSV = () => {
  const headers = ['Product Name', 'Warehouse', 'Current Stock', 'Min Level', 'Status']
  const rows = filteredData.value.map(item => [
    item.product,
    item.warehouse,
    item.currentStock,
    item.minLevel,
    item.status
  ])
  
  let csvContent = headers.join(',') + '\n'
  rows.forEach(row => {
    csvContent += row.map(cell => `"${cell}"`).join(',') + '\n'
  })
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `stock-level-report-${new Date().getTime()}.csv`
  link.click()
}

const handleDesignSave = (designData: any) => {
  console.log('Design saved:', designData)
  // Reload design settings to apply changes
  loadDesignSettings()
}

const getPreviewHTML = () => {
  const element = document.getElementById('printable-report')
  return element ? element.innerHTML : ''
}

// Check if opened in design mode
onMounted(() => {
  // Load design settings first
  loadDesignSettings()
  
  if (route.query.design === 'true') {
    // Generate report first, then open designer
    generateReport()
    setTimeout(() => {
      showDesigner.value = true
    }, 2000)
  }
})

const handleLogoUpload = async () => {
  const { value: file } = await Swal.fire({
    title: 'Upload Company Logo',
    input: 'file',
    inputAttributes: {
      accept: 'image/*',
      'aria-label': 'Upload your company logo'
    },
    showCancelButton: true,
    confirmButtonText: 'Upload',
    confirmButtonColor: '#2563eb',
    preConfirm: (file) => {
      if (!file) {
        Swal.showValidationMessage('Please select an image file')
        return false
      }
      
      if (file.size > 2 * 1024 * 1024) {
        Swal.showValidationMessage('File size must be less than 2MB')
        return false
      }
      
      if (!file.type.startsWith('image/')) {
        Swal.showValidationMessage('Please select a valid image file')
        return false
      }
      
      return file
    }
  })

  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      logoUrl.value = result
      localStorage.setItem('reportLogoUrl', result)
      
      Swal.fire({
        title: 'Success!',
        text: 'Logo uploaded successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      })
    }
    reader.readAsDataURL(file)
  }
}
</script>

<!-- <style>
/* CRITICAL: Force all colors to hex/rgb for html2canvas compatibility */
#printable-report,
#printable-report * {
  color-scheme: light !important;
}

/* Override ALL Tailwind color classes */
#printable-report .bg-white { background-color: rgb(255, 255, 255) !important; }
#printable-report .bg-gray-50 { background-color: rgb(249, 250, 251) !important; }
#printable-report .bg-gray-100 { background-color: rgb(243, 244, 246) !important; }
#printable-report .bg-gray-200 { background-color: rgb(229, 231, 235) !important; }
#printable-report .bg-gray-800 { background-color: rgb(31, 41, 55) !important; }
#printable-report .bg-gray-900 { background-color: rgb(17, 24, 39) !important; }
#printable-report .bg-blue-50 { background-color: rgb(239, 246, 255) !important; }
#printable-report .bg-blue-600 { background-color: rgb(37, 99, 235) !important; }
#printable-report .bg-green-100 { background-color: rgb(220, 252, 231) !important; }
#printable-report .bg-yellow-100 { background-color: rgb(254, 243, 199) !important; }
#printable-report .bg-red-100 { background-color: rgb(254, 226, 226) !important; }

#printable-report .text-white { color: rgb(255, 255, 255) !important; }
#printable-report .text-gray-500 { color: rgb(107, 114, 128) !important; }
#printable-report .text-gray-600 { color: rgb(75, 85, 99) !important; }
#printable-report .text-gray-700 { color: rgb(55, 65, 81) !important; }
#printable-report .text-gray-800 { color: rgb(31, 41, 55) !important; }
#printable-report .text-gray-900 { color: rgb(17, 24, 39) !important; }
#printable-report .text-blue-600 { color: rgb(37, 99, 235) !important; }
#printable-report .text-green-700 { color: rgb(21, 128, 61) !important; }
#printable-report .text-yellow-700 { color: rgb(161, 98, 7) !important; }
#printable-report .text-red-700 { color: rgb(185, 28, 28) !important; }

#printable-report .border-gray-200 { border-color: rgb(229, 231, 235) !important; }
#printable-report .border-gray-300 { border-color: rgb(209, 213, 219) !important; }
#printable-report .border-gray-800 { border-color: rgb(31, 41, 55) !important; }
#printable-report .border-b-2 { border-bottom-width: 2px !important; border-bottom-color: rgb(31, 41, 55) !important; }

/* Remove shadows from overlay components for clean printing */
#printable-report .absolute .bg-white\/95,
#printable-report .absolute .shadow {
  box-shadow: none !important;
  background-color: rgb(255, 255, 255) !important;
}

</style> -->