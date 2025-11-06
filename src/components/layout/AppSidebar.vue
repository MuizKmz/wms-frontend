<template>
  <div>
    <!-- Modern Expanded Sidebar -->
    <aside
      :class="[
        'fixed top-0 left-0 h-screen z-[60] w-64 flex flex-col shadow-xl transition-all duration-300',
        {
          '-translate-x-full lg:translate-x-0': !isMobileOpen,
          'translate-x-0': isMobileOpen
        }
      ]"
      :style="{ backgroundColor: 'var(--sidebar-color, #0f172a)', color: 'var(--sidebar-text-color, #ffffff)' }">

      <!-- Sidebar Toggle Button (Mobile Only) - Sticks out from sidebar edge -->
      <button
        @click="toggleMobileSidebar"
        class="absolute -right-10 top-20 p-2 rounded-r-lg shadow-lg lg:hidden z-[70]"
        :style="{ backgroundColor: 'var(--sidebar-color, #0f172a)', color: 'var(--sidebar-text-color, #ffffff)' }"
      >
        <MenuIcon v-if="!isMobileOpen" class="w-5 h-5" />
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Logo Section -->
      <div class="p-6 border-b" style="border-color: rgba(255, 255, 255, 0.1)">
        <!-- Skeleton Loader - Exact same dimensions -->
        <div v-if="!brandingLoaded" class="block">
          <div class="animate-pulse bg-white/20 rounded-lg p-3 mb-3 w-fit">
            <div class="w-8 h-8 bg-white/30 rounded"></div>
          </div>
          <div class="animate-pulse space-y-1">
            <div class="h-[27px] bg-white/20 rounded w-32"></div>
          </div>
        </div>

        <!-- Actual Logo -->
        <router-link 
          v-else 
          :to="{ name: 'Dashboard' }" 
          class="block cursor-pointer hover:opacity-80 transition-opacity duration-200" 
          @click="closeMobileSidebar"
        >
          <div v-if="logoUrl" class="bg-white rounded-lg p-3 mb-3 w-fit">
            <img :src="logoUrl" alt="Logo" class="w-8 h-8 object-contain" />
          </div>
          <div v-else class="bg-white rounded-lg p-3 mb-3 w-fit">
            <img src="/images/logo/logo-icon.svg" alt="Logo" width="32" height="32" />
          </div>
          <div class="space-y-1">
            <h1 class="text-lg font-bold text-white">{{ companyName }}</h1>
          </div>
        </router-link>
      </div>

      <!-- Navigation Section -->
      <div class="flex-1 overflow-y-auto no-scrollbar">
        <!-- Menu Items (hide loading state to avoid glitch) -->
        <div v-if="menuGroups.length > 0" v-for="(group, groupIndex) in menuGroups" :key="groupIndex">
          <!-- Group Title (Collapsible if it has a title) -->
          <button
            v-if="group.title"
            @click.stop="toggleGroup(group.title)"
            class="w-full flex items-center justify-between px-6 py-3 text-xs font-semibold text-slate-400 tracking-wider hover:text-slate-300 transition-colors"
          >
            <span>{{ group.title }}</span>
            <svg
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-180': isGroupOpen(group.title) }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-else class="px-6 py-3 text-xs font-semibold text-slate-400 tracking-wider">
            {{ group.title }}
          </div>

          <!-- Menu Items (only show if group is open or no title) -->
          <nav v-if="!group.title || isGroupOpen(group.title)" class="px-3">
            <ul class="space-y-1 mb-2">
              <li v-for="(item, itemIndex) in group.items" :key="item.name">
                <!-- Main Menu Item -->
                <button
                  v-if="item.subItems"
                  @click="handleItemClick(groupIndex, itemIndex, item)"
                  :class="[
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200'
                  ]"
                  :style="isSubmenuActive(item) ? activeMenuStyle : (isSubmenuOpen(groupIndex, itemIndex, item) ? openMenuStyle : hoverMenuStyle)">
                  <div class="flex items-center gap-3">
                    <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
                    <span class="text-sm font-medium text-left">{{ item.name }}</span>
                  </div>
                  <component
                    :is="isSubmenuOpen(groupIndex, itemIndex, item) ? 'ChevronDownIcon' : 'ChevronRightIcon'"
                    class="w-4 h-4 flex-shrink-0"
                  />
                </button>

                <router-link
                  v-else-if="item.path"
                  :to="item.path"
                  @click.stop="handleDirectNavigation()"
                  :class="[
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200'
                  ]"
                  :style="isActive(item.path) ? activeMenuStyle : hoverMenuStyle">
                  <div class="flex items-center gap-3">
                    <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
                    <span class="text-sm font-medium">{{ item.name }}</span>
                  </div>
                </router-link>

                <!-- Submenu Items -->
                <div
                  v-if="item.subItems && isSubmenuOpen(groupIndex, itemIndex, item)"
                  class="ml-8 mt-1 mb-2 space-y-1">
                  <router-link
                    v-for="subItem in item.subItems"
                    :key="subItem.name"
                    :to="subItem.path"
                    @click.stop="closeMobileSidebar"
                    :class="[
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200'
                    ]"
                    :style="isActive(subItem.path) ? activeMenuStyle : subMenuStyle">
                    <div class="w-1.5 h-1.5 rounded-full flex-shrink-0" :style="{ backgroundColor: isActive(subItem.path) ? 'currentColor' : 'rgba(255,255,255,0.3)' }"></div>
                    <span :class="{ 'font-medium': isActive(subItem.path) }">{{ subItem.name }}</span>
                    <div class="flex items-center gap-1 ml-auto">
                      <span v-if="subItem.new" class="px-2 py-0.5 text-[10px] font-medium text-green-300 bg-green-900/50 rounded-full">
                        new
                      </span>
                      <span v-if="subItem.pro" class="px-2 py-0.5 text-[10px] font-medium text-purple-300 bg-purple-900/50 rounded-full">
                        pro
                      </span>
                    </div>
                  </router-link>
                </div>
              </li>
            </ul>
          </nav>
        </div>

        <!-- No Permissions State -->
        <div v-else class="flex items-center justify-center py-12 px-6">
          <div class="text-center">
            <svg class="w-16 h-16 mx-auto text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p class="text-slate-400 text-sm">No access permissions</p>
            <p class="text-slate-500 text-xs mt-1">Contact administrator</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-3 border-t" style="border-color: rgba(255, 255, 255, 0.1)">
        <router-link
         v-if="hasModuleAccess('Settings')"
          to="/settings"
          @click.stop="closeMobileSidebar"
          :class="[
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 mb-2'
          ]"
          :style="isActive('/settings') ? activeMenuStyle : hoverMenuStyle">
          <SettingsIcon class="w-5 h-5" />
          <span class="text-sm font-medium">Settings</span>
        </router-link>

        <button
          @click="signOut"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200"
          :style="hoverMenuStyle">
          <LogoutIcon class="w-5 h-5" />
          <span class="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSidebar } from "@/composables/useSidebar";
import { useAuth } from "@/composables/useAuth";

import {
  LogoutIcon,
  SettingsIcon,
  MenuIcon,
  HomeIcon,
  ReportsIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  BoxIcon,
  BarChartIcon,
  FolderIcon,
  WarehouseIcon,
  SupplierIcon,
  CategoryIcon,
  ProductIcon,
  EPCIcon,
  InventoryIcon,
  OrderIcon,
  ShippingIcon,
  CustomerIcon,
  LabelIcon,
} from "../../icons";

const route = useRoute();
const router = useRouter();

// Get mobile sidebar state from composable
const { isMobileOpen, toggleMobileSidebar } = useSidebar();

// Get auth composable for permission checking
const { hasModuleAccess, loadUserPermissions, userPermissions, loading } = useAuth();

const openSubmenu = ref(null);
const openGroups = ref(new Set(['STOCK', 'REPORTS'])); // Track which groups are open (default open)
const logoUrl = ref('')
const companyName = ref('WMS Console')
const brandingLoaded = ref(false)

// Update logo and company name from localStorage directly
const updateBranding = () => {
  try {
    const saved = localStorage.getItem('themeCustomization')
    if (saved) {
      const settings = JSON.parse(saved)
      console.log('🎨 [AppSidebar] updateBranding from localStorage:', {
        hasLogo: !!settings.logoUrl,
        companyName: settings.companyName,
        logoLength: settings.logoUrl?.length
      })

      if (settings.logoUrl) {
        logoUrl.value = settings.logoUrl
      }
      if (settings.companyName) {
        companyName.value = settings.companyName
      }
    }
    // Mark as loaded immediately now that we have skeleton
    brandingLoaded.value = true
  } catch (e) {
    console.error('❌ [AppSidebar] Error loading branding:', e)
    brandingLoaded.value = true
  }
}

// Computed styles for active menu items that adapt to theme
const activeMenuStyle = computed(() => {
  const sidebarColor = getComputedStyle(document.documentElement).getPropertyValue('--sidebar-color').trim() || '#0f172a'
  const isDark = document.documentElement.classList.contains('dark')

  // Calculate a lighter/accent color based on sidebar color
  const rgb = parseInt(sidebarColor.slice(1), 16)
  const r = Math.min(255, ((rgb >> 16) & 0xff) + 60)
  const g = Math.min(255, ((rgb >> 8) & 0xff) + 60)
  const b = Math.min(255, (rgb & 0xff) + 60)
  const accentColor = `rgb(${r}, ${g}, ${b})`

  return {
    backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : accentColor,
    color: isDark ? '#60a5fa' : '#ffffff'
  }
})

const openMenuStyle = computed(() => ({
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  color: 'rgba(255, 255, 255, 0.9)'
}))

const hoverMenuStyle = computed(() => ({
  color: 'rgba(255, 255, 255, 0.7)'
}))

const subMenuStyle = computed(() => ({
  color: 'rgba(255, 255, 255, 0.6)'
}))

// Load permissions on mount
onMounted(async () => {
  console.log('🚀 [AppSidebar] Component mounted, loading permissions...');
  await loadUserPermissions();
  console.log('✅ [AppSidebar] Permissions loaded, count:', userPermissions.value.length);

  // Update branding
  setTimeout(() => updateBranding(), 100)

  // Listen for theme changes
  window.addEventListener('themeChanged', updateBranding)
});

// Toggle group open/close
const toggleGroup = (groupTitle) => {
  if (openGroups.value.has(groupTitle)) {
    openGroups.value.delete(groupTitle);
  } else {
    openGroups.value.add(groupTitle);
  }
};

const isGroupOpen = (groupTitle) => {
  return openGroups.value.has(groupTitle);
};

// Original menu structure with module mappings
const allMenuGroups = [
  {
    items: [
      {
        icon: HomeIcon,
        name: "Dashboard",
        path: "/Dashboard",
        module: "Dashboard"
      },
    ]
  },
  {
    title: "STOCK",
    items: [
      {
        icon: WarehouseIcon,
        name: "Warehouse",
        path: "/warehouse",
        module: "Warehouse"
      },
      {
        icon: SupplierIcon,
        name: "Supplier",
        path: "/supplier",
        module: "Supplier"
      },
      {
        icon: BoxIcon,
        name: "Receiving",
        path: "/receiving",
        module: "Receiving"
      },
      {
        icon: CategoryIcon,
        name: "Category",
        path: "/category",
        module: "Category"
      },
      {
        icon: ProductIcon,
        name: "Product",
        path: "/product",
        module: "Product"
      },
      {
        icon: EPCIcon,
        name: "EPC",
        path: "/epc",
        module: "EPC"
      },
      {
        icon: InventoryIcon,
        name: "Inventory",
        path: "/inventory",
        module: "Inventory"
      },
      {
        icon: OrderIcon,
        name: "Order",
        path: "/order",
        module: "Order"
      },
      {
        icon: ShippingIcon,
        name: "Shipping",
        path: "/shipping",
        module: "Shipping"
      },
      {
        icon: CustomerIcon,
        name: "Customer",
        path: "/customer",
        module: "Customer"
      },
    ],
  },
  {
    title: "REPORTS",
    items: [
      {
        icon: BoxIcon,
        name: "Receiving",
        path: "/receivingreport",
        module: "Reports"
      },
      {
        icon: LabelIcon,
        name: "Label Generation",
        path: "/labelreport",
        module: "Reports"
      },
      {
        icon: InventoryIcon,
        name: "Inventory",
        path: "/inventoryreport",
        module: "Reports"
      },
      {
        icon: FolderIcon,
        name: "Order",
        path: "/orderreport",
        module: "Reports"
      },
    ],
  },
];

// Filter menu based on permissions
const menuGroups = computed(() => {
  // IMPORTANT: Only show modules user has permission for
  // If no permissions loaded yet, show empty (secure by default)
  const permissionsLoaded = userPermissions.value.length > 0;

  if (!permissionsLoaded) {
    console.log('⚠️ Permissions not loaded yet, showing empty menu for security');
    return [];
  }

  console.log('✅ Filtering menu with', userPermissions.value.length, 'permissions');

  return allMenuGroups.map(group => ({
    ...group,
    items: group.items.filter(item => {
      // If module is defined, check permission
      if (item.module) {
        const hasAccess = hasModuleAccess(item.module);
        console.log(`Module ${item.module}: ${hasAccess ? 'ALLOW' : 'DENY'}`);
        return hasAccess;
      }
      // If no module specified, show by default (like Dashboard)
      return true;
    })
  })).filter(group => group.items.length > 0); // Remove empty groups
});

const isActive = (path) => route.path === path;

const isSubmenuActive = (item) => {
  if (!item.subItems) return false;
  return item.subItems.some(subItem => route.path === subItem.path);
};

const handleItemClick = (groupIndex, itemIndex, item) => {
  if (item.subItems) {
    const key = `${groupIndex}-${itemIndex}`;
    const isCurrentlyOpen = openSubmenu.value === key || isSubmenuActive(item);

    if (isCurrentlyOpen) {
      // If already open, toggle closed
      openSubmenu.value = null;
    } else {
      // If closed, open it and navigate to first submenu item
      openSubmenu.value = key;
      if (item.subItems.length > 0) {
        router.push(item.subItems[0].path);
      }
    }
  }
};

const handleDirectNavigation = () => {
  // Close mobile sidebar on mobile when navigating
  closeMobileSidebar();
};

const closeMobileSidebar = () => {
  if (window.innerWidth < 1024 && isMobileOpen.value) {
    toggleMobileSidebar();
  }
};

const isSubmenuOpen = (groupIndex, itemIndex, item) => {
  const key = `${groupIndex}-${itemIndex}`;
  // Keep submenu open if manually opened OR if one of its children is active
  return openSubmenu.value === key || isSubmenuActive(item);
};

const signOut = () => {
  console.log('🚪 Signing out and clearing user data...');
  // Clear all user data from localStorage
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  // Reset permissions in composable
  userPermissions.value = [];
  // Navigate to signin
  router.push('/signin');
  closeMobileSidebar();
};
</script>

<style scoped>
/* Custom scrollbar for the sidebar */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Hover effects for menu items */
nav a:hover,
nav button:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

nav a:active,
nav button:active {
  transform: scale(0.98);
}
</style>
