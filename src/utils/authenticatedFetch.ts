/**
 * Authenticated Fetch Wrapper
 *
 * This wrapper automatically adds JWT token to all fetch requests.
 * Use this instead of native fetch() for authenticated API calls.
 */

export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Get token from localStorage
  const userStr = localStorage.getItem('user')
  let token = null

  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      token = user.token
      console.log('🔍 [AuthFetch] User found in localStorage:', user.email || user.username)
      console.log('🔍 [AuthFetch] Token exists:', !!token)
      if (token) {
        console.log('🔍 [AuthFetch] Token preview:', token.substring(0, 30) + '...')
        console.log('🔍 [AuthFetch] Token length:', token.length)
      }
    } catch (error) {
      console.error('❌ [AuthFetch] Error parsing user from localStorage:', error)
    }
  } else {
    console.warn('⚠️ [AuthFetch] No user in localStorage')
  }

  // Merge headers with Authorization token
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
    console.log('🔐 [AuthFetch] Added JWT token to request:', url)
  } else {
    console.error('⚠️ [AuthFetch] NO TOKEN! Request will fail:', url)
  }

  // Make the fetch request with token
  console.log('📡 [AuthFetch] Making request to:', url)
  const response = await fetch(url, {
    ...options,
    headers,
  })

  console.log('📥 [AuthFetch] Response status:', response.status, url)

  // Handle 401 Unauthorized globally
  if (response.status === 401) {
    console.error('🚨 [AuthFetch] 401 Unauthorized - Token was rejected by backend!')
    console.error('🚨 [AuthFetch] Clearing local authentication and redirecting to /signin')

    // Try to read response text for debugging (do not await in production paths without need)
    try {
      const body = await response.text()
      console.error('🚨 [AuthFetch] Response body:', body)
    } catch (e) {
      // ignore
    }

    // Clear authentication from localStorage/sessionStorage
    try {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    } catch (e) {
      console.error('⚠️ [AuthFetch] Error clearing storage during logout:', e)
    }

    // Redirect to sign-in page. Use location.replace to avoid leaving a back entry.
    try {
      window.location.replace('/signin')
    } catch (e) {
      console.error('⚠️ [AuthFetch] Redirect failed:', e)
    }

    // Throw to allow callers to handle if needed
    throw new Error('Unauthorized - user logged out')
  }

  return response
}

// Export as default for easy import
export default authenticatedFetch
