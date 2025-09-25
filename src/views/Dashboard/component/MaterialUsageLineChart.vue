<template>
  <div class="space-y-4 w-[650px]">
    <!-- ✅ Dropdown filters -->
    <div class="flex gap-3">
      <select
        v-model="selectedRange"
        class="border rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200
               focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option>Last 7 Days</option>
        <option>Last 30 Days</option>
        <option>This Year</option>
      </select>

      <select
        v-model="selectedMaterial"
        class="border rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200
               focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option>Rubber</option>
        <option>Plastic</option>
        <option>Metal</option>
      </select>
    </div>

    <!-- ✅ Line Chart -->
    <div class="w-[600px] h-[300px]">
      <canvas ref="lineChartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import {
  Chart,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js'

Chart.register(
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  Legend
)

const lineChartCanvas = ref(null)
const lineChartInstance = ref(null)

// Dropdown state
const selectedRange = ref('Last 7 Days')
const selectedMaterial = ref('Rubber')

// ✅ Mock Data
const mockLineData = {
  labels: ['Sep 01', 'Sep 02', 'Sep 03', 'Sep 04', 'Sep 05', 'Sep 06', 'Sep 07'],
  datasets: [
    {
      label: 'Qty Used',
      data: [120, 150, 100, 130, 170, 140, 160],
      borderColor: '#6366F1',       // Indigo-500
      backgroundColor: '#6366F1',
      pointBackgroundColor: '#6366F1',
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBorderWidth: 0,
      borderWidth: 2.5,
      tension: 0.45,                // ✅ smooth & wavy
      fill: false
    }
  ]
}

const fetchMaterialUsageData = async () => {
  try {
    const response = await fetch('/api/material-usage/chart-data')
    if (!response.ok) throw new Error(`API Error: ${response.status}`)
    const data = await response.json()
    if (!data || !data.labels || !data.datasets) throw new Error('Invalid API format')
    return data
  } catch (err) {
    console.error('Fetch failed, using mock data:', err)
    return mockLineData
  }
}

const createLineChart = (data) => {
  const ctx = lineChartCanvas.value?.getContext('2d')
  if (!ctx) return
  if (lineChartInstance.value) lineChartInstance.value.destroy()

  lineChartInstance.value = new Chart(ctx, {
    type: 'line',
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 600,
        easing: 'easeInOutCubic'
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            pointStyle: 'line',
            font: { size: 13 },
            color: '#374151'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(31, 41, 55, 0.9)',
          titleColor: '#fff',
          bodyColor: '#f9fafb',
          padding: 10,
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          title: {
            display: true,
            text: 'Date',
            font: { weight: 'bold', size: 14 },
            color: '#111827'
          },
          ticks: { color: '#6b7280', font: { weight: '600' } }
        },
        y: {
          beginAtZero: true,
          grid: { display: false },
          border: { display: false },
          title: {
            display: true,
            text: 'Qty Used',
            font: { weight: 'bold', size: 14 },
            color: '#111827'
          },
          ticks: { color: '#6b7280', font: { weight: '600' } }
        }
      }
    }
  })
}

onMounted(async () => {
  await nextTick()
  const data = await fetchMaterialUsageData()
  createLineChart(data)
})

onUnmounted(() => {
  if (lineChartInstance.value) lineChartInstance.value.destroy()
})
</script>
