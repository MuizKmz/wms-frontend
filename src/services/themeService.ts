/**
 * Theme Service - Handle theme customization API calls
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

interface ThemeSettings {
  primaryColor: string
  sidebarColor: string
  headerColor: string
  footerColor: string
  backgroundType: 'solid' | 'image'
  backgroundColor: string
  backgroundColorDark: string
  backgroundImageUrl?: string
  backgroundImageUrlDark?: string
  backgroundSize: string
  backgroundPosition: string
  backgroundRepeat: string
  backgroundOpacity: number
  logoUrl?: string
  companyName: string
}

interface UploadImageResponse {
  url: string
  message: string
}

/**
 * Upload logo image to backend
 * @param file - The logo image file
 * @returns Promise with the uploaded image URL
 */
export async function uploadLogo(file: File): Promise<UploadImageResponse> {
  const formData = new FormData()
  formData.append('logo', file)
  
  const token = localStorage.getItem('token')
  
  const response = await fetch(`${API_BASE_URL}/api/theme/upload-logo`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  })
  
  if (!response.ok) {
    throw new Error('Failed to upload logo')
  }
  
  return response.json()
}

/**
 * Upload background image to backend
 * @param file - The background image file
 * @param isDark - Whether this is for dark mode
 * @returns Promise with the uploaded image URL
 */
export async function uploadBackgroundImage(file: File, isDark: boolean = false): Promise<UploadImageResponse> {
  const formData = new FormData()
  formData.append('background', file)
  formData.append('isDark', isDark.toString())
  
  const token = localStorage.getItem('token')
  
  const response = await fetch(`${API_BASE_URL}/api/theme/upload-background`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  })
  
  if (!response.ok) {
    throw new Error('Failed to upload background image')
  }
  
  return response.json()
}

/**
 * Save theme settings to backend
 * @param settings - Theme settings object
 * @returns Promise with success response
 */
export async function saveThemeSettings(settings: ThemeSettings): Promise<{ message: string }> {
  const token = localStorage.getItem('token')
  
  const response = await fetch(`${API_BASE_URL}/api/theme/settings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(settings)
  })
  
  if (!response.ok) {
    throw new Error('Failed to save theme settings')
  }
  
  return response.json()
}

/**
 * Load theme settings from backend
 * @returns Promise with theme settings
 */
export async function loadThemeSettings(): Promise<ThemeSettings | null> {
  const token = localStorage.getItem('token')
  
  const response = await fetch(`${API_BASE_URL}/api/theme/settings`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  if (!response.ok) {
    if (response.status === 404) {
      // No theme settings found, return null
      return null
    }
    throw new Error('Failed to load theme settings')
  }
  
  return response.json()
}

/**
 * Delete uploaded image from backend
 * @param imageUrl - The URL of the image to delete
 * @returns Promise with success response
 */
export async function deleteImage(imageUrl: string): Promise<{ message: string }> {
  const token = localStorage.getItem('token')
  
  const response = await fetch(`${API_BASE_URL}/api/theme/delete-image`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ imageUrl })
  })
  
  if (!response.ok) {
    throw new Error('Failed to delete image')
  }
  
  return response.json()
}
