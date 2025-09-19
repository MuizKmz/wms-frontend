<template>
  <div class="flex">
    <!-- Black Sidebar (Always 70px width) -->
    <aside
      class="fixed mt-16 lg:mt-0 top-0 left-0 
             bg-gray-900 text-white 
             dark:bg-gray-950 dark:text-gray-200
             h-screen z-40 w-[70px] flex flex-col"
    >
      <!-- Logo Section -->
      <div class="py-4 mt-1 flex justify-center px-4 border-b border-gray-700 dark:border-gray-800">
        <router-link to="/" class="relative" @mouseenter="showTooltip = 'logo'" @mouseleave="showTooltip = null">
          <img
            src="/images/logo/logo-icon.svg"
            alt="Logo"
            width="32"
            height="32"
            class="text-white"
          />
          <!-- Logo Tooltip -->
          <div 
            v-show="showTooltip === 'logo'"
            class="fixed bg-gray-800 text-white text-sm px-3 py-2 rounded-md shadow-lg whitespace-nowrap z-50
                   dark:bg-gray-900 dark:text-gray-100"
            :style="{ left: '80px', top: '50%', transform: 'translateY(-50%)' }"
          >
            Dashboard
          </div>
        </router-link>
      </div>

      <!-- Navigation Section -->
      <div class="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar flex-1">
        <nav class="py-4">
          <ul class="flex flex-col">
            <li v-for="(item, index) in menuGroups[0].items" :key="item.name" class="relative">
              <!-- Main Menu Item with Tooltip -->
              <button
                v-if="item.subItems"
                @click="handleItemClick(0, index, item)"
                @mouseenter="showTooltip = `item-${index}`" 
                @mouseleave="showTooltip = null"
                :class="[ 
                  'w-full flex items-center justify-center py-3 px-4 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200 relative',
                  'dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800',
                  {
                    'text-white bg-gray-800 dark:bg-gray-800': isSubmenuOpen(0, index),
                  }
                ]"
              >
                <span class="flex items-center justify-center w-6 h-6">
                  <component :is="item.icon" class="w-5 h-5" />
                </span>
                <!-- Tooltip -->
                <div 
                  v-show="showTooltip === `item-${index}`"
                  class="fixed bg-gray-800 text-white text-sm px-3 py-2 rounded-md shadow-lg whitespace-nowrap z-50
                         dark:bg-gray-900 dark:text-gray-100"
                  :style="{ left: '80px', top: getTooltipPosition(index) }"
                >
                  {{ item.name }}
                </div>
              </button>
               
              <router-link
                v-else-if="item.path"
                :to="item.path"
                @click="handleDirectNavigation()"
                @mouseenter="showTooltip = `item-${index}`" 
                @mouseleave="showTooltip = null"
                :class="[ 
                  'w-full flex items-center justify-center py-3 px-4 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200 relative',
                  'dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800',
                  {
                    'text-white bg-gray-800 dark:bg-gray-800': isActive(item.path),
                  }
                ]"
              >
                <span class="flex items-center justify-center w-6 h-6">
                  <component :is="item.icon" class="w-5 h-5" />
                </span>
                <!-- Tooltip -->
                <div 
                  v-show="showTooltip === `item-${index}`"
                  class="fixed bg-gray-800 text-white text-sm px-3 py-2 rounded-md shadow-lg whitespace-nowrap z-50
                         dark:bg-gray-900 dark:text-gray-100"
                  :style="{ left: '80px', top: getTooltipPosition(index) }"
                >
                  {{ item.name }}
                </div>
              </router-link>
            </li>
          </ul>
        </nav>
      </div>

      <!-- User Footer -->
      <div class="px-2 py-3 border-t border-gray-800 flex flex-col items-center sticky bottom-0 
                  bg-gray-900 dark:bg-gray-950 dark:border-gray-800">
        <!-- Settings -->
        <router-link
          to="/settings"
          class="w-full flex items-center justify-center mb-2 py-2 rounded-lg 
                 text-gray-300 hover:text-white hover:bg-gray-800 
                 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
          @mouseenter="showTooltip = 'settings'"
          @mouseleave="showTooltip = null"
        >
          <SettingsIcon class="w-5 h-5" />
        </router-link>

        <!-- Logout -->
        <button
          @click="signOut"
          class="w-full flex items-center justify-center py-2 rounded-lg 
                 text-gray-300 hover:text-white hover:bg-gray-800
                 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
          @mouseenter="showTooltip = 'logout'"
          @mouseleave="showTooltip = null"
        >
          <LogoutIcon class="w-5 h-5" />
        </button>

        <!-- Tooltips -->
        <div
          v-show="showTooltip === 'settings'"
          class="fixed bg-gray-800 text-white text-sm px-3 py-2 rounded-md shadow-lg whitespace-nowrap z-50
                 dark:bg-gray-900 dark:text-gray-100"
          :style="{ left: '80px', bottom: '60px' }"
        >
          Settings
        </div>

        <div
          v-show="showTooltip === 'logout'"
          class="fixed bg-gray-800 text-white text-sm px-3 py-2 rounded-md shadow-lg whitespace-nowrap z-50
                 dark:bg-gray-900 dark:text-gray-100"
          :style="{ left: '80px', bottom: '20px' }"
        >
          Sign out
        </div>
      </div>
    </aside>

    <!-- White Expanded Submenu Panel -->
    <aside
      v-if="hasOpenSubmenu"
      class="fixed mt-16 lg:mt-0 top-0 left-[70px] 
             bg-white text-gray-900 
             dark:bg-gray-900 dark:text-gray-100
             h-screen z-30 w-[220px] shadow-xl border-r border-gray-200 dark:border-gray-700"
    >
      <!-- Panel Header -->
      <div class="py-4 mt-2 px-6 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {{ activeSubmenuTitle }}
        </h3>
      </div>

      <!-- Panel Navigation -->
      <div class="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar flex-1">
        <nav class="py-4">
          <ul class="flex flex-col space-y-1">
            <li v-for="subItem in activeSubmenuItems" :key="subItem.name">
              <router-link
                :to="subItem.path"
                :class="[ 
                  'flex items-center justify-between px-6 py-3 text-sm transition-colors duration-150 group',
                  'hover:bg-gray-50 dark:hover:bg-gray-800',
                  {
                    'bg-blue-50 text-blue-700 border-r-4 border-blue-500 dark:bg-blue-900 dark:text-blue-300': isActive(subItem.path),
                    'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100': !isActive(subItem.path),
                  }
                ]"
              >
                <span class="flex items-center">
                  <span class="w-2 h-2 rounded-full bg-gray-400 mr-3 group-hover:bg-gray-600 dark:bg-gray-500 dark:group-hover:bg-gray-300"></span>
                  {{ subItem.name }}
                </span>
                <div class="flex items-center gap-1">
                  <span
                    v-if="subItem.new"
                    class="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full 
                           dark:bg-green-900 dark:text-green-300"
                  >
                    new
                  </span>
                  <span
                    v-if="subItem.pro"
                    class="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full 
                           dark:bg-purple-900 dark:text-purple-300"
                  >
                    pro
                  </span>
                </div>
              </router-link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  </div>
</template>


<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import {
  GridIcon,
  CalenderIcon,
  UserCircleIcon,
  PageIcon,
  TableIcon,
  ListIcon,
  LogoutIcon,
  SettingsIcon,
  BagIcon,
  MenuIcon,
  HomeIcon,
  WIPIcon,
} from "../../icons";
import SidebarWidget from "./SidebarWidget.vue";
import BoxCubeIcon from "@/icons/BoxCubeIcon.vue";
import { useSidebar } from "@/composables/useSidebar";

const route = useRoute();
const router = useRouter();

const { isExpanded, isMobileOpen, openSubmenu } = useSidebar();

// Local state for tooltips
const showTooltip = ref(null);

const menuGroups = [
  {
    title: "Menu",
    items: [
      {
        icon: HomeIcon,
        name: "Dashboard",
        subItems: [{ name: "Ecommerce", path: "/", pro: false }],
      },
      {
        icon: BagIcon,
        name: "Work Order Management",
        path: "/workorder",
      },
      {
        icon: MenuIcon,
        name: "Bill of Material Management",
        subItems: [
          { name: "BOM List", path: "/bom", pro: false },
          { name: "Compounding List", path: "/compoundinglist", pro: false },
        ],
      },
      {
        icon: WIPIcon,
        name: "WIP Management",
        path: "/wip",
      },
      {
        icon: CalenderIcon,
        name: "Calendar",
        path: "/calendar",
      },
      // {
      //   icon: UserCircleIcon,
      //   name: "User Profile",
      //   path: "/profile",
      // },
      {
        name: "Forms",
        icon: ListIcon,
        subItems: [
          { name: "Form Elements", path: "/form-elements", pro: false },
        ],
      },
      {
        name: "Tables",
        icon: TableIcon,
        subItems: [{ name: "Basic Tables", path: "/basic-tables", pro: false }],
      },
      {
        name: "Pages",
        icon: PageIcon,
        subItems: [
          { name: "Blank Page", path: "/blank", pro: false },
          { name: "404 Page", path: "/error-404", pro: false },
        ],
      },
    ],
  },
];

const isActive = (path) => route.path === path;

const handleItemClick = (groupIndex, itemIndex, item) => {
  if (item.subItems) {
    const key = `${groupIndex}-${itemIndex}`;
    openSubmenu.value = key;
    
    // Auto navigate to first submenu item
    if (item.subItems.length > 0) {
      const firstSubItem = item.subItems[0];
      router.push(firstSubItem.path);
    }
  }
};

const handleDirectNavigation = () => {
  // Close white panel when clicking items without subitems
  openSubmenu.value = null;
};

const isSubmenuOpen = (groupIndex, itemIndex) => {
  const key = `${groupIndex}-${itemIndex}`;
  return openSubmenu.value === key;
};

const hasOpenSubmenu = computed(() => {
  return openSubmenu.value !== null;
});

const activeSubmenuTitle = computed(() => {
  if (!openSubmenu.value) return '';
  const [groupIndex, itemIndex] = openSubmenu.value.split('-').map(Number);
  return menuGroups[groupIndex]?.items[itemIndex]?.name || '';
});

const activeSubmenuItems = computed(() => {
  if (!openSubmenu.value) return [];
  const [groupIndex, itemIndex] = openSubmenu.value.split('-').map(Number);
  return menuGroups[groupIndex]?.items[itemIndex]?.subItems || [];
});

const getTooltipPosition = (index) => {
  // Calculate tooltip position based on item index
  const baseTop = 90; // Starting position after logo
  const itemHeight = 48; // Height of each menu item
  return `${baseTop + (index * itemHeight)}px`;
};

const signOut = () => {
  console.log('Signing out...');
  router.push('/signin');
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
</style>
