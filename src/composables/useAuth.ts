import { ref, computed } from 'vue'
import axios from 'axios'

const API_URL = 'api'

interface Permission {
  id: number
  module: string
  action: string
  resource: string
  description: string
}

interface UserPermissions {
  roleName: string
  modules: {
    module: string
    permissions: string[]
  }[]
}

// Global state for user permissions
const userPermissions = ref<Permission[]>([])
const loading = ref(false)

export function useAuth() {
  const loadUserPermissions = async () => {
    const userStr = localStorage.getItem('user')
    console.log('🔍 [useAuth] localStorage user:', userStr)

    if (!userStr) {
      console.warn('⚠️ [useAuth] No user found in localStorage')
      return
    }

    const user = JSON.parse(userStr)
    console.log('👤 [useAuth] Parsed user object:', user)

    if (!user.id) {
      console.error('❌ [useAuth] User ID not found in user object:', user)
      return
    }

    console.log(`📡 [useAuth] Fetching permissions for user ID: ${user.id}`)
    loading.value = true

    try {
      const url = `${API_URL}/auth/users/${user.id}/permissions`
      console.log(`🌐 [useAuth] Request URL: ${url}`)

      const response = await axios.get(url)
      const permissionsData: UserPermissions = response.data

      console.log('✅ [useAuth] API Response:', permissionsData)

      // Flatten permissions for easier checking
      const flatPermissions: Permission[] = []
      permissionsData.modules.forEach((module) => {
        module.permissions.forEach((action) => {
          flatPermissions.push({
            id: 0, // Not needed for checking
            module: module.module,
            action,
            resource: '',
            description: ''
          })
        })
      })

      userPermissions.value = flatPermissions
      console.log(`🎯 [useAuth] Loaded ${flatPermissions.length} permissions:`, flatPermissions)
    } catch (error) {
      console.error('❌ [useAuth] Error loading permissions:', error)
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status)
        console.error('Response data:', error.response?.data)

        // If user not found (404), likely because seed was run and user ID changed
        if (error.response?.status === 404) {
          console.error('🚨 USER NOT FOUND! This usually means:')
          console.error('   1. Database was reseeded and user IDs changed')
          console.error('   2. You need to LOGOUT and LOGIN again')
          console.error('   3. Or clear browser localStorage and refresh')

          // Optionally clear localStorage and redirect to login
          alert('⚠️ Your session is invalid. Please login again.\n\nThis happens when the database is reset.\n\nClick OK to logout.')
          localStorage.clear()
          window.location.href = '/signin'
        }
      }
      // Set empty array on error so menu doesn't break
      userPermissions.value = []
    } finally {
      loading.value = false
    }
  }

  const hasPermission = (module: string, action: string = 'read'): boolean => {
    if (userPermissions.value.length === 0) return false

    return userPermissions.value.some(
      (p) => p.module === module && p.action === action
    )
  }

  const hasModuleAccess = (module: string): boolean => {
    if (userPermissions.value.length === 0) return false

    // Check if user has ANY permission for this module (any action)
    return userPermissions.value.some((p) => p.module === module)
  }

  const canCreate = (module: string) => hasPermission(module, 'create')
  const canRead = (module: string) => hasPermission(module, 'read')
  const canUpdate = (module: string) => hasPermission(module, 'update')
  const canDelete = (module: string) => hasPermission(module, 'delete')
  const canExport = (module: string) => hasPermission(module, 'export')

  const logout = () => {
    console.log('🚪 [useAuth] Logging out...')
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    userPermissions.value = []
    window.location.href = '/signin'
  }

  const isAuthenticated = computed(() => {
    return !!localStorage.getItem('user')
  })

  return {
    userPermissions: computed(() => userPermissions.value),
    loading: computed(() => loading.value),
    isAuthenticated,
    loadUserPermissions,
    hasPermission,
    hasModuleAccess,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canExport,
    logout,
  }
}
