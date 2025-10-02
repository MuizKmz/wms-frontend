import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: () => import('../views/Dashboard/Dashboard.vue'),
      meta: {
        title: 'Dashboard',
      },
    },
    {
      path: '/supplier',
      name: 'Supplier Management',
      component: () => import('../views/Supplier/SupplierList.vue'),
      meta: {
        title: 'Supplier Management',
      },
    },
    {
      path: '/workorder',
      name: 'Work Order Management',
      component: () => import('../views/WorkOrderMgt/WorkOrder.vue'),
      meta: {
        title: 'Work Order Management',
      },
    },
    {
      path: '/bom',
      name: 'Bill of Material Management',
      component: () => import('../views/BOMMgt/BOM.vue'),
      meta: {
        title: 'Bill Of Material Management',
      },
    },
    {
      path: '/compoundinglist',
      name: 'Compounding List',
      component: () => import('../views/BOMMgt/CompoundingList.vue'),
      meta: {
        title: 'Compounding List',
      },
    },
    {
      path: '/wip',
      name: 'Work-in-Progress Management',
      component: () => import('../views/WIPMgt/WIP.vue'),
      meta: {
        title: 'Work-in-Progress',
      },
    },
    {
      path: '/materialmgt/materialList',
      name: 'Material List',
      component: () => import('../views/MaterialMgt/Materiallist.vue'),
      meta: {
        title: 'Material List',
      },
    },
    {
      path: '/materialmgt/materialRequisition',
      name: 'Material Requisition',
      component: () => import('../views/MaterialMgt/Materialrequisition.vue'),
      meta: {
        title: 'Material Requisition',
      },
    },
    {
      path: '/machinemgt/machineList',
      name: 'Machine List',
      component: () => import('../views/Machine,tool&mould/MachineList.vue'),
      meta: {
        title: 'Machine List',
      },
    },
    {
      path: '/machinemgt/mouldList',
      name: 'Mould List',
      component: () => import('../views/Machine,tool&mould/MouldList.vue'),
      meta: {
        title: 'Mould List',
      },
    },
    {
      path: '/machinemgt/toolList',
      name: 'Tool List',
      component: () => import('../views/Machine,tool&mould/ToolsList.vue'),
      meta: {
        title: 'Tool List',
      },
    },
    {
      path: '/maintenancemgt/maintenanceList',
      name: 'Maintenance List',
      component: () => import('../views/Maintenance&downtime/MaintenanceList.vue'),
      meta: {
        title: 'Maintenance List',
      },
    },
    {
      path: '/maintenancemgt/downtimeList',
      name: 'Downtime List',
      component: () => import('../views/Maintenance&downtime/DowntimeList.vue'),
      meta: {
        title: 'Downtime List',
      },
    },
    {
      path: '/qualitycontrol/ipqc',
      name: 'In Progress Quality Control',
      component: () => import('../views/QualityControl/InProgressQC.vue'),
      meta: {
        title: 'In Progress Quality Control',
      },
    },
    {
      path: '/qualitycontrol/oqc',
      name: 'OutGoing Quality Control',
      component: () => import('../views/QualityControl/OutGoingQC.vue'),
      meta: {
        title: 'OutGoing Quality Control',
      },
    },
    {
      path: '/packingmgt/packingList',
      name: 'Packing Management',
      component: () => import('../views/PackingMgt/PackingList.vue'),
      meta: {
        title: 'Packing Management',
      },
    },
    {
      path: '/reject&scrap/rejectList',
      name: 'Reject Product List',
      component: () => import('../views/Reject&scrap/RejectProductList.vue'),
      meta: {
        title: 'Reject Product List',
      },
    },
    {
      path: '/reject&scrap/scrapList',
      name: 'Scrap Product List',
      component: () => import('../views/Reject&scrap/ScrapProductList.vue'),
      meta: {
        title: 'Scrap Product List',
      },
    },
    {
      path: '/operator/index',
      name: 'Operator Dashboard',
      component: () => import('../views/OperatorModule/index.vue'),
      meta: {
        title: 'Operator Dashboard',
      },
    },
    {
      path: '/calendar',
      name: 'Calendar',
      component: () => import('../views/Others/Calendar.vue'),
      meta: {
        title: 'Calendar',
      },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/Others/UserProfile.vue'),
      meta: {
        title: 'Profile',
      },
    },
    {
      path: '/form-elements',
      name: 'Form Elements',
      component: () => import('../views/Forms/FormElements.vue'),
      meta: {
        title: 'Form Elements',
      },
    },
    {
      path: '/basic-tables',
      name: 'Basic Tables',
      component: () => import('../views/Tables/BasicTables.vue'),
      meta: {
        title: 'Basic Tables',
      },
    },
    {
      path: '/line-chart',
      name: 'Line Chart',
      component: () => import('../views/Chart/LineChart/LineChart.vue'),
    },
    {
      path: '/bar-chart',
      name: 'Bar Chart',
      component: () => import('../views/Chart/BarChart/BarChart.vue'),
    },
    {
      path: '/alerts',
      name: 'Alerts',
      component: () => import('../views/UiElements/Alerts.vue'),
      meta: {
        title: 'Alerts',
      },
    },
    {
      path: '/avatars',
      name: 'Avatars',
      component: () => import('../views/UiElements/Avatars.vue'),
      meta: {
        title: 'Avatars',
      },
    },
    {
      path: '/badge',
      name: 'Badge',
      component: () => import('../views/UiElements/Badges.vue'),
      meta: {
        title: 'Badge',
      },
    },

    {
      path: '/buttons',
      name: 'Buttons',
      component: () => import('../views/UiElements/Buttons.vue'),
      meta: {
        title: 'Buttons',
      },
    },

    {
      path: '/images',
      name: 'Images',
      component: () => import('../views/UiElements/Images.vue'),
      meta: {
        title: 'Images',
      },
    },
    {
      path: '/videos',
      name: 'Videos',
      component: () => import('../views/UiElements/Videos.vue'),
      meta: {
        title: 'Videos',
      },
    },
    {
      path: '/blank',
      name: 'Blank',
      component: () => import('../views/Pages/BlankPage.vue'),
      meta: {
        title: 'Blank',
      },
    },

    {
      path: '/error-404',
      name: '404 Error',
      component: () => import('../views/Errors/FourZeroFour.vue'),
      meta: {
        title: '404 Error',
      },
    },

    {
      path: '/signin',
      name: 'Signin',
      component: () => import('../views/Auth/Signin.vue'),
      meta: {
        title: 'Signin',
      },
    },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('../views/Auth/Signup.vue'),
      meta: {
        title: 'Signup',
      },
    },
  ],
})

export default router

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} | MES`
  next()
})
