<template>
  <div class="w-[600px] h-[300px]">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

Chart.register(
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  Tooltip,
  Legend,
  Filler
)

const chartCanvas = ref(null)
const chartInstance = ref(null)

// ✅ Your fixed colors
const mockData = {
  labels: ['Sep 01', 'Sep 02', 'Sep 03', 'Sep 04', 'Sep 05'],
  datasets: [
    {
      label: 'Planned',
      data: [5, 3, 2, 7, 4],
      backgroundColor: '#FF74C7',
      borderSkipped: false
    },
    {
      label: 'In Progress',
      data: [2, 4, 3, 1, 2],
      backgroundColor: '#FF5F5F',
      borderSkipped: false
    },
    {
      label: 'Completed',
      data: [1, 2, 5, 2, 6],
      backgroundColor: '#FF0097',
      borderSkipped: false
    }
  ]
}

// Plugin → auto-round top dataset
const topRoundedPlugin = {
  id: 'topRounded',
  beforeDatasetsDraw(chart) {
    const metaSets = chart.getSortedVisibleDatasetMetas()
    if (!metaSets.length) return
    const topMeta = metaSets[metaSets.length - 1]
    const radius = 12

    // Rounded only top bars
    topMeta.data.forEach(bar => {
      bar.options.borderRadius = {
        topLeft: radius,
        topRight: radius,
        bottomLeft: 0,
        bottomRight: 0
      }
    })

    // Lower bars reset
    metaSets.slice(0, -1).forEach(meta => {
      meta.data.forEach(bar => {
        bar.options.borderRadius = 0
      })
    })
  }
}

const fetchWorkOrderData = async () => {
  try {
    const response = await fetch('/api/work-orders/chart-data')
    if (!response.ok) throw new Error(`API Error: ${response.status}`)
    const data = await response.json()
    if (!data || !data.labels || !data.datasets) throw new Error('Invalid API format')
    return data
  } catch (err) {
    console.error('Fetch failed, using mock data:', err)
    return mockData
  }
}

const createChart = (data) => {
  const ctx = chartCanvas.value?.getContext('2d')
  if (!ctx) return
  if (chartInstance.value) chartInstance.value.destroy()

  chartInstance.value = new Chart(ctx, {
    type: 'bar',
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 600,
        easing: 'easeInOutCubic'
      },
      datasets: {
        bar: {
          barPercentage: 0.7,
          categoryPercentage: 0.85
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            pointStyle: 'rectRounded',
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
          stacked: true,
          grid: { display: false },
          border: { display: false }, // 🚀 remove X axis line
          ticks: { color: '#6b7280' }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          grid: { display: false },
          border: { display: false }, // 🚀 remove Y axis line
          ticks: { color: '#6b7280' }
        }
      }
    },
    plugins: [topRoundedPlugin]
  })
}

onMounted(async () => {
  await nextTick()
  const data = await fetchWorkOrderData()
  createChart(data)
})

onUnmounted(() => {
  if (chartInstance.value) chartInstance.value.destroy()
})
</script>
