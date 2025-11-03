import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home_page/home.vue'),
      meta: {
        title: 'Home-WMS',
      },
    },

    {
      path: '/signin',
      name: 'Sign In',
      component: () => import('../views/Auth/Signin.vue'),
      meta: {
        title: 'Sign In',
      },
    },

    {
      path: '/reset-password',
      name: 'ResetPassword',
      component: () => import('../views/Auth/ResetPass.vue'),
      meta: {
        title: 'Reset Password',
      },
    },

    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/Dashboard/Dashboard.vue'),
      meta: {
        title: 'Dashboard',
      },
    },
    {
      path: '/warehouse',
      name: 'Warehouse Management',
      component: () => import('../views/Warehouse/Warehouse.vue'),
      meta: {
        title: 'Warehouse',
      },
    },
    {
      path: '/supplier',
      name: 'Supplier Management',
      component: () => import('../views/Supplier/SupplierList.vue'),
      meta: {
        title: 'Supplier',
      },
    },
    {
      path: '/receiving',
      name: 'Receiving Management',
      component: () => import('../views/Receiving/Receiving.vue'),
      meta: {
        title: 'Receiving',
      },
    },
    {
      path: '/category',
      name: 'Category Management',
      component: () => import('../views/Category/Category.vue'),
      meta: {
        title: 'Category',
      },
    },
    {
      path: '/product',
      name: 'Product Management',
      component: () => import('../views/Product/Product.vue'),
      meta: {
        title: 'Product',
      },
    },
    {
      path: '/epc',
      name: 'EPC Management',
      component: () => import('../views/EPC/EPC.vue'),
      meta: {
        title: 'EPC',
      },
    },
    {
      path: '/inventory',
      name: 'Inventory Management',
      component: () => import('../views/Inventory/Inventory.vue'),
      meta: {
        title: 'Inventory',
      },
    },
    {
      path: '/order',
      name: 'Order Management',
      component: () => import('../views/Order/Order.vue'),
      meta: {
        title: 'Order',
      },
    },
    {
      path: '/shipping',
      name: 'Shipping Management',
      component: () => import('../views/Shipping/Shipping.vue'),
      meta: {
        title: 'Shipping',
      },
    },
    {
      path: '/customer',
      name: 'Customer Management',
      component: () => import('../views/Customer/Customer.vue'),
      meta: {
        title: 'Customer',
      },
    },
    {
      path: '/receivingreport',
      name: 'Receiving Report',
      component: () => import('../views/Reports/Receiving/ReportReceiving.vue'),
      meta: {
        title: 'Receiving Report',
      },
    },
    {
      path: '/labelreport',
      name: 'Label Generation Report',
      component: () => import('../views/Reports/Label/LabelReport.vue'),
      meta: {
        title: 'Label Generation Report',
      },
    },
    {
      path: '/inventoryreport',
      name: 'Inventory Report',
      component: () => import('../views/Reports/Inventory/InventoryReport.vue'),
      meta: {
        title: 'Inventory Report',
      },
    },
    {
      path: '/orderreport',
      name: 'Order Report',
      component: () => import('../views/Reports/Order/OrderReport.vue'),
      meta: {
        title: 'Order Report',
      },
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('../views/Settings/Settings.vue'),
      meta: {
        title: 'Settings',
      },
    },
  ],
})



export default router

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} | WMS`

  // Check if user is logged in
  const userStr = localStorage.getItem('user')
  const isAuthenticated = !!userStr
  
  // Public routes that don't require authentication (UPDATED: added /reset-password)
  const publicRoutes = ['/', '/signin', '/reset-password']
  
  // If trying to access a public route
  if (publicRoutes.includes(to.path)) {
    // If on signin page and already logged in, redirect to dashboard
    if (to.path === '/signin' && isAuthenticated) {
      next('/dashboard')
    } else {
      next()
    }
  } else {
    // For all protected routes, require authentication
    if (!isAuthenticated) {
      // Redirect to home page if not authenticated
      next('/')
    } else {
      next()
    }
  }
})