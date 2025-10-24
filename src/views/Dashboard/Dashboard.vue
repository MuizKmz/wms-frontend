<template>
  <AdminLayout>
    <div class="flex justify-between items-center mb-4 px-6">
      <div class="flex gap-2">
        <button
          type="button"
          @click="openChartSelector"
          class="flex items-center gap-2 px-4 py-2 lg:ml-[-20px] bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors shadow-sm"
        >
          <PlusIcon class="w-5 h-5" />
          <span class="font-medium">Add Chart</span>
        </button>
        
        <!-- Layout Presets Dropdown -->
        <div class="dropdown relative inline-flex">
          <button
            ref="layoutDropdownRef"
            type="button"
            class="dropdown-toggle btn btn-outline justify-between dark:bg-gray-700 dark:text-gray-400 min-w-[160px]"
            aria-haspopup="menu"
            :aria-expanded="isLayoutDropdownOpen"
            aria-label="Select Layout Preset"
            @click="toggleLayoutDropdown"
          >
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
              </svg>
              Layout Presets
            </span>
            <span class="icon-[tabler--chevron-down] size-4 transition-transform ml-2" :class="{ 'rotate-180': isLayoutDropdownOpen }"></span>
          </button>
          <ul
            class="dropdown-menu min-w-full transition-opacity duration-200 absolute top-full left-0 mt-1
                   bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                   rounded-lg shadow-lg z-50 text-gray-900 dark:text-white"
            :class="{ 'opacity-100': isLayoutDropdownOpen, 'opacity-0 pointer-events-none': !isLayoutDropdownOpen }"
            role="menu"
            aria-orientation="vertical"
          >
            <li v-for="preset in layoutPresets" :key="preset.id">
              <a 
                class="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-lg" 
                @click="applyLayoutPreset(preset.id)"
              >
                <div class="font-medium">{{ preset.name }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ preset.description }}</div>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Draggable/Resizable Chart Canvas - Desktop -->
    <div v-if="!isSmallScreen" :key="canvasKey" class="relative px-6 pb-6" :style="{ minHeight: containerMinHeight }">
      <DraggableResizableCard
        v-for="chart in activeCharts"
        :key="chart.id"
        :id="chart.id"
        :title="chart.title"
        :initial-x="chart.x"
        :initial-y="chart.y"
        :initial-width="chart.width"
        :initial-height="chart.height"
        :draggable="true"
        :resizable="true"
        :fullscreenable="true"
        :refreshable="true"
        @update:position="updateChartPosition"
        @update:size="updateChartSize"
        @refresh="refreshChart(chart.id)"
      >
        <template #headerAction>
          <button
            type="button"
            @click="removeChart(chart.id)"
            class="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition"
            title="Remove"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </template>
        <component :is="getChartComponent(chart.componentName)" :ref="el => setChartRef(chart.id, el)" />
      </DraggableResizableCard>
    </div>

    <!-- Responsive Stack Layout - Mobile/Small Screens -->
    <div v-else class="px-6 pb-6 space-y-6">
      <div 
        v-for="chart in activeCharts" 
        :key="chart.id"
        class="w-full"
      >
        <ChartCard 
          :title="chart.title"
          :fullscreenable="true"
          :refreshable="true"
          class-name="w-full"
          @refresh="refreshChart(chart.id)"
        >
          <template #headerAction>
            <button
              type="button"
              @click="removeChart(chart.id)"
              class="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition"
              title="Remove"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </template>
          <div class="h-[400px]">
            <component :is="getChartComponent(chart.componentName)" :ref="el => setChartRef(chart.id, el)" />
          </div>
        </ChartCard>
      </div>
    </div>

    <!-- Chart Selector Panel -->
    <ChartSelectorPanel
      :is-open="isChartSelectorOpen"
      :available-charts="filteredAvailableCharts"
      @close="closeChartSelector"
      @add-chart="addChart"
    />
  </AdminLayout>
</template>

<script setup>
import { ref, shallowRef, markRaw, computed, onMounted, onUnmounted } from "vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import WorkOrderBarChart from "./component/WorkOrderBarChart.vue";
import MaterialUsageLineChart from "./component/MaterialUsageLineChart.vue";
import RecentShipment from "./component/RecentShipment.vue";
import OrderStatusChart from "./component/OrderStatusChart.vue";
import InventoryStockChart from "./component/InventoryStockChart.vue";
import LowStockAlert from "./component/LowStockAlert.vue";
import SupplierPerformanceChart from "./component/SupplierPerformanceChart.vue";
import WarehouseUtilizationChart from "./component/WarehouseUtilizationChart.vue";
import ProductCategoryDistribution from "./component/ProductCategoryDistribution.vue";
import ReceivingActivityChart from "./component/ReceivingActivityChart.vue";
import CustomerMetricsCard from "./component/CustomerMetricsCard.vue";
import DraggableResizableCard from '@/components/common/DraggableResizableCard.vue';
import ChartSelectorPanel from './component/ChartSelectorPanel.vue';
import ChartCard from './component/ChartCard.vue';
import { PlusIcon, BarChartIcon, PieChartIcon, TableIcon, BoxIcon } from '@/icons';

const isChartSelectorOpen = ref(false);
const isLayoutDropdownOpen = ref(false);
const layoutDropdownRef = ref(null);
const nextChartId = ref(7);
const cascadeOffset = ref(0);
const isSmallScreen = ref(false);
const canvasKey = ref(0); // Force re-render
const containerMinHeight = ref('100vh');

const STORAGE_KEY = 'dashboard-charts-layout';

// Define available chart types
const availableCharts = ref([
  {
    id: 'work-order',
    title: 'Work Order',
    description: 'Bar chart showing work order statistics and trends',
    icon: BarChartIcon,
    component: 'WorkOrderBarChart'
  },
  {
    id: 'material-usage',
    title: 'Material Usage',
    description: 'Line chart displaying material consumption over time',
    icon: PieChartIcon,
    component: 'MaterialUsageLineChart'
  },
  {
    id: 'recent-shipments',
    title: 'Recent Shipments',
    description: 'Table view of recent shipment activities',
    icon: TableIcon,
    component: 'RecentShipment'
  },
  {
    id: 'order-status',
    title: 'Order Status Distribution',
    description: 'Pie chart showing order status breakdown',
    icon: PieChartIcon,
    component: 'OrderStatusChart'
  },
  {
    id: 'inventory-stock',
    title: 'Top Inventory Stock Levels',
    description: 'Bar chart showing top 10 products by stock quantity',
    icon: BarChartIcon,
    component: 'InventoryStockChart'
  },
  {
    id: 'low-stock',
    title: 'Low Stock Alert',
    description: 'Table showing products with low or critical stock levels',
    icon: BoxIcon,
    component: 'LowStockAlert'
  },
  {
    id: 'supplier-performance',
    title: 'Supplier Performance',
    description: 'Dual-axis chart showing supplier orders and on-time delivery rates',
    icon: BarChartIcon,
    component: 'SupplierPerformanceChart'
  },
  {
    id: 'warehouse-utilization',
    title: 'Warehouse Utilization',
    description: 'Doughnut chart displaying warehouse capacity usage',
    icon: PieChartIcon,
    component: 'WarehouseUtilizationChart'
  },
  {
    id: 'product-categories',
    title: 'Product Category Distribution',
    description: 'Pie chart showing product distribution across categories',
    icon: PieChartIcon,
    component: 'ProductCategoryDistribution'
  },
  {
    id: 'receiving-activity',
    title: 'Receiving Activity',
    description: 'Line chart tracking receiving operations over time',
    icon: BarChartIcon,
    component: 'ReceivingActivityChart'
  },
  {
    id: 'customer-metrics',
    title: 'Customer Metrics',
    description: 'Metric cards showing customer and order statistics',
    icon: TableIcon,
    component: 'CustomerMetricsCard'
  }
]);

// Layout presets
const layoutPresets = [
  {
    id: 'default',
    name: 'Default Layout',
    description: '2x2 grid with mixed sizes',
    charts: [
      { id: 1, title: 'Order Status Distribution', componentName: 'OrderStatusChart', x: 0, y: 0, width: 500, height: 400 },
      { id: 2, title: 'Top Inventory Stock Levels', componentName: 'InventoryStockChart', x: 520, y: 0, width: 700, height: 400 },
      { id: 3, title: 'Recent Shipments', componentName: 'RecentShipment', x: 0, y: 420, width: 600, height: 400 },
      { id: 4, title: 'Low Stock Alert', componentName: 'LowStockAlert', x: 620, y: 420, width: 600, height: 400 }
    ]
  },
  {
    id: 'grid',
    name: 'Grid 2x2',
    description: 'Uniform 2x2 grid layout',
    charts: [
      { id: 1, title: 'Order Status Distribution', componentName: 'OrderStatusChart', x: 0, y: 0, width: 600, height: 400 },
      { id: 2, title: 'Top Inventory Stock Levels', componentName: 'InventoryStockChart', x: 620, y: 0, width: 600, height: 400 },
      { id: 3, title: 'Recent Shipments', componentName: 'RecentShipment', x: 0, y: 420, width: 600, height: 400 },
      { id: 4, title: 'Low Stock Alert', componentName: 'LowStockAlert', x: 620, y: 420, width: 600, height: 400 }
    ]
  },
  {
    id: 'single-column',
    name: 'Single Column',
    description: 'Stacked vertical layout',
    charts: [
      { id: 1, title: 'Order Status Distribution', componentName: 'OrderStatusChart', x: 0, y: 0, width: 1200, height: 400 },
      { id: 2, title: 'Top Inventory Stock Levels', componentName: 'InventoryStockChart', x: 0, y: 420, width: 1200, height: 400 },
      { id: 3, title: 'Recent Shipments', componentName: 'RecentShipment', x: 0, y: 840, width: 1200, height: 400 },
      { id: 4, title: 'Low Stock Alert', componentName: 'LowStockAlert', x: 0, y: 1260, width: 1200, height: 400 }
    ]
  },
  {
    id: 'focus',
    name: 'Focus Mode',
    description: 'One large + three small charts',
    charts: [
      { id: 1, title: 'Order Status Distribution', componentName: 'OrderStatusChart', x: 0, y: 0, width: 800, height: 500 },
      { id: 2, title: 'Top Inventory Stock Levels', componentName: 'InventoryStockChart', x: 820, y: 0, width: 400, height: 240 },
      { id: 3, title: 'Recent Shipments', componentName: 'RecentShipment', x: 820, y: 260, width: 400, height: 240 },
      { id: 4, title: 'Low Stock Alert', componentName: 'LowStockAlert', x: 0, y: 520, width: 600, height: 350 }
    ]
  }
];

// Load saved layout or start empty
function loadSavedLayout() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        charts: parsed.charts || [],
        nextId: parsed.nextId || 1,
        currentPreset: parsed.currentPreset || null
      };
    }
  } catch (error) {
    console.error('Failed to load saved layout:', error);
  }
  return {
    charts: [],
    nextId: 1,
    currentPreset: null
  };
}

// Initialize with saved layout (empty by default)
const savedLayout = loadSavedLayout();
const activeCharts = ref(savedLayout.charts);
nextChartId.value = savedLayout.nextId;

// Track current layout preset (null means no preset selected, just user-added charts)
const currentLayoutPreset = ref(savedLayout.currentPreset);

// Store chart component refs
const chartRefs = ref({});

// Save layout to localStorage
function saveLayout() {
  try {
    const layout = {
      charts: activeCharts.value,
      nextId: nextChartId.value,
      currentPreset: currentLayoutPreset.value
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  } catch (error) {
    console.error('Failed to save layout:', error);
  }
}

// Component map for dynamic rendering
const componentMap = {
  WorkOrderBarChart: markRaw(WorkOrderBarChart),
  MaterialUsageLineChart: markRaw(MaterialUsageLineChart),
  RecentShipment: markRaw(RecentShipment),
  OrderStatusChart: markRaw(OrderStatusChart),
  InventoryStockChart: markRaw(InventoryStockChart),
  LowStockAlert: markRaw(LowStockAlert),
  SupplierPerformanceChart: markRaw(SupplierPerformanceChart),
  WarehouseUtilizationChart: markRaw(WarehouseUtilizationChart),
  ProductCategoryDistribution: markRaw(ProductCategoryDistribution),
  ReceivingActivityChart: markRaw(ReceivingActivityChart),
  CustomerMetricsCard: markRaw(CustomerMetricsCard)
};

function getChartComponent(componentName) {
  return componentMap[componentName];
}

// Filter available charts to exclude already active ones
const filteredAvailableCharts = computed(() => {
  const activeComponentNames = activeCharts.value.map(chart => chart.componentName);
  return availableCharts.value.filter(chart => !activeComponentNames.includes(chart.component));
});

function openChartSelector() {
  isChartSelectorOpen.value = true;
}

function closeChartSelector() {
  isChartSelectorOpen.value = false;
}

function addChart(chartOption) {
  console.log('Dashboard: addChart called, currentLayoutPreset:', currentLayoutPreset.value);
  console.log('Dashboard: activeCharts.length:', activeCharts.value.length);
  
  // If a layout preset is selected, use its positioning
  if (currentLayoutPreset.value) {
    const preset = layoutPresets.find(p => p.id === currentLayoutPreset.value);
    console.log('Dashboard: Found preset:', preset?.name);
    
    if (preset) {
      const chartIndex = activeCharts.value.length;
      console.log('Dashboard: chartIndex:', chartIndex, 'preset has', preset.charts.length, 'positions');
      
      if (chartIndex < preset.charts.length) {
        // Use preset position directly
        const presetChart = preset.charts[chartIndex];
        console.log('Dashboard: Using preset position:', presetChart.x, presetChart.y);
        const newChart = {
          id: nextChartId.value++,
          title: chartOption.title,
          componentName: chartOption.component,
          x: presetChart.x,
          y: presetChart.y,
          width: presetChart.width,
          height: presetChart.height
        };
        activeCharts.value.push(newChart);
      } else {
        // After using all preset positions, continue the pattern
        // Determine which column/position pattern to follow
        const excessIndex = chartIndex - preset.charts.length;
        const patternIndex = excessIndex % preset.charts.length;
        const patternChart = preset.charts[patternIndex];
        
        // Find all charts that share the same X position (same column)
        const chartsInSameColumn = activeCharts.value.filter(c => c.x === patternChart.x);
        
        // Stack below the last chart in this column
        const yPosition = chartsInSameColumn.length > 0
          ? Math.max(...chartsInSameColumn.map(c => c.y + c.height)) + 20
          : patternChart.y;
        
        console.log('Dashboard: Extra chart', chartIndex + 1, '- using pattern of position', patternIndex + 1, 'at x:', patternChart.x, 'y:', yPosition);
        
        const newChart = {
          id: nextChartId.value++,
          title: chartOption.title,
          componentName: chartOption.component,
          x: patternChart.x,
          y: yPosition,
          width: patternChart.width,
          height: patternChart.height
        };
        activeCharts.value.push(newChart);
      }
    } else {
      console.log('Dashboard: Preset not found, using cascade');
      // Preset not found, use cascade
      const offset = cascadeOffset.value * 30;
      cascadeOffset.value = (cascadeOffset.value + 1) % 10;
      activeCharts.value.push({
        id: nextChartId.value++,
        title: chartOption.title,
        componentName: chartOption.component,
        x: 50 + offset,
        y: 50 + offset,
        width: 600,
        height: 400
      });
    }
  } else {
    console.log('Dashboard: No layout preset, using cascade');
    // No layout preset, use cascade positioning
    const offset = cascadeOffset.value * 30;
    cascadeOffset.value = (cascadeOffset.value + 1) % 10;
    activeCharts.value.push({
      id: nextChartId.value++,
      title: chartOption.title,
      componentName: chartOption.component,
      x: 50 + offset,
      y: 50 + offset,
      width: 600,
      height: 400
    });
  }
  
  console.log('Dashboard: New activeCharts:', activeCharts.value);
  updateContainerHeight();
  saveLayout();
  closeChartSelector();
}

function removeChart(chartId) {
  const index = activeCharts.value.findIndex(c => c.id === chartId);
  if (index !== -1) {
    activeCharts.value.splice(index, 1);
    delete chartRefs.value[chartId];
    updateContainerHeight();
    saveLayout();
  }
}

// Set chart component ref
function setChartRef(chartId, el) {
  if (el) {
    chartRefs.value[chartId] = el;
  }
}

// Refresh chart by calling its refresh method
function refreshChart(chartId) {
  const chartRef = chartRefs.value[chartId];
  if (chartRef && typeof chartRef.refresh === 'function') {
    chartRef.refresh();
  } else {
    console.warn(`Chart ${chartId} does not have a refresh method`);
  }
}

function updateChartPosition({ id, x, y }) {
  const chart = activeCharts.value.find(c => c.id === id);
  if (chart) {
    chart.x = x;
    chart.y = y;
    updateContainerHeight();
    saveLayout();
  }
}

function updateChartSize({ id, width, height }) {
  const chart = activeCharts.value.find(c => c.id === id);
  if (chart) {
    chart.width = width;
    chart.height = height;
    updateContainerHeight();
    saveLayout();
  }
}

// Layout preset functions
function toggleLayoutDropdown() {
  isLayoutDropdownOpen.value = !isLayoutDropdownOpen.value;
}

function applyLayoutPreset(presetId) {
  console.log('Dashboard: applyLayoutPreset called with:', presetId);
  const preset = layoutPresets.find(p => p.id === presetId);
  if (preset) {
    console.log('Dashboard: Setting currentLayoutPreset to:', presetId);
    // Set current layout preset
    currentLayoutPreset.value = presetId;
    
    // Force re-render by incrementing key
    canvasKey.value++;
    
    // Get current active component names to preserve user selections
    const currentComponentNames = activeCharts.value.map(c => c.componentName);
    
    // Clear and set new charts
    activeCharts.value = [];
    
    // Use nextTick to ensure DOM updates
    setTimeout(() => {
      // If user has charts, apply preset positioning to them
      if (currentComponentNames.length > 0) {
        const newCharts = [];
        let chartId = 1;
        
        currentComponentNames.forEach((componentName, index) => {
          if (index < preset.charts.length) {
            // Use preset position
            const presetChart = preset.charts[index];
            newCharts.push({
              id: chartId++,
              title: availableCharts.value.find(c => c.component === componentName)?.title || componentName,
              componentName: componentName,
              x: presetChart.x,
              y: presetChart.y,
              width: presetChart.width,
              height: presetChart.height
            });
          } else {
            // Stack below when exceeding preset positions
            const maxBottom = Math.max(...newCharts.map(c => c.y + c.height), 0);
            newCharts.push({
              id: chartId++,
              title: availableCharts.value.find(c => c.component === componentName)?.title || componentName,
              componentName: componentName,
              x: 0,
              y: maxBottom + 20,
              width: 600,
              height: 400
            });
          }
        });
        
        activeCharts.value = newCharts;
        nextChartId.value = chartId;
      }
      // If no charts, leave empty - user will add charts which will follow preset pattern
      
      // Calculate min height needed for the layout
      updateContainerHeight();
      
      saveLayout();
    }, 10);
    
    isLayoutDropdownOpen.value = false;
  }
}

// Update container height based on chart positions
function updateContainerHeight() {
  if (activeCharts.value.length === 0) {
    containerMinHeight.value = '100vh';
    return;
  }
  
  // Find the maximum y + height value
  const maxBottom = Math.max(...activeCharts.value.map(chart => chart.y + chart.height));
  // Add padding
  containerMinHeight.value = `${maxBottom + 100}px`;
}

function handleClickOutside(event) {
  if (layoutDropdownRef.value && !layoutDropdownRef.value.closest('.dropdown').contains(event.target)) {
    isLayoutDropdownOpen.value = false;
  }
}

// Check screen size for responsive layout
function checkScreenSize() {
  isSmallScreen.value = window.innerWidth < 1024; // lg breakpoint
}

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  
  // Check screen size initially and on resize
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
  
  // Set initial container height
  updateContainerHeight();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', checkScreenSize);
});
</script>