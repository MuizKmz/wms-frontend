# Backend API Requirements for Theme Customization

## Overview
Theme customization is company-wide. Only users with Admin access to Settings can modify theme settings. Once saved, the theme applies to all users in the company.

## Database Schema Suggestion

```sql
CREATE TABLE company_theme_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    primary_color VARCHAR(7) DEFAULT '#3B82F6',
    sidebar_color VARCHAR(7) DEFAULT '#0f172a',
    header_color VARCHAR(7) DEFAULT '#ffffff',
    footer_color VARCHAR(7) DEFAULT '#ffffff',
    background_type ENUM('solid', 'image') DEFAULT 'solid',
    background_color VARCHAR(7) DEFAULT '#F9FAFB',
    background_color_dark VARCHAR(7) DEFAULT '#111827',
    background_image_url VARCHAR(500),
    background_image_url_dark VARCHAR(500),
    background_size VARCHAR(20) DEFAULT 'cover',
    background_position VARCHAR(20) DEFAULT 'center',
    background_repeat VARCHAR(20) DEFAULT 'no-repeat',
    background_opacity INT DEFAULT 100,
    logo_url VARCHAR(500),
    company_name VARCHAR(100) DEFAULT 'WMS Console',
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

## Required API Endpoints

### 1. Upload Logo
**Endpoint:** `POST /api/theme/upload-logo`

**Auth:** Required (Bearer Token)

**Authorization:** Only users with Admin permission to Settings

**Request:**
- Content-Type: `multipart/form-data`
- Body: `logo` (file) - Max 2MB, formats: PNG, JPG, SVG

**Response:**
```json
{
  "url": "https://your-domain.com/uploads/logos/company-123-logo.png",
  "message": "Logo uploaded successfully"
}
```

**Notes:**
- Store in `/uploads/logos/` or cloud storage (S3, Azure Blob, etc.)
- Filename should include company ID to avoid conflicts
- Delete old logo file when new one is uploaded

---

### 2. Upload Background Image
**Endpoint:** `POST /api/theme/upload-background`

**Auth:** Required (Bearer Token)

**Authorization:** Only users with Admin permission to Settings

**Request:**
- Content-Type: `multipart/form-data`
- Body: 
  - `background` (file) - Max 5MB, formats: PNG, JPG
  - `isDark` (boolean) - true for dark mode background

**Response:**
```json
{
  "url": "https://your-domain.com/uploads/backgrounds/company-123-bg-light.jpg",
  "message": "Background image uploaded successfully"
}
```

**Notes:**
- Store in `/uploads/backgrounds/` or cloud storage
- Support separate images for light and dark modes
- Delete old background when new one is uploaded

---

### 3. Save Theme Settings
**Endpoint:** `POST /api/theme/settings`

**Auth:** Required (Bearer Token)

**Authorization:** Only users with Admin permission to Settings

**Request:**
```json
{
  "primaryColor": "#3B82F6",
  "sidebarColor": "#0f172a",
  "headerColor": "#ffffff",
  "footerColor": "#ffffff",
  "backgroundType": "image",
  "backgroundColor": "#F9FAFB",
  "backgroundColorDark": "#111827",
  "backgroundImageUrl": "https://your-domain.com/uploads/backgrounds/bg.jpg",
  "backgroundImageUrlDark": "https://your-domain.com/uploads/backgrounds/bg-dark.jpg",
  "backgroundSize": "cover",
  "backgroundPosition": "center",
  "backgroundRepeat": "no-repeat",
  "backgroundOpacity": 100,
  "logoUrl": "https://your-domain.com/uploads/logos/logo.png",
  "companyName": "My Company"
}
```

**Response:**
```json
{
  "message": "Theme settings saved successfully"
}
```

**Notes:**
- Determine company_id from authenticated user's company
- Update existing record or create new one (upsert)
- Log who made the change (updated_by = user_id)

---

### 4. Load Theme Settings
**Endpoint:** `GET /api/theme/settings`

**Auth:** Required (Bearer Token)

**Authorization:** Any authenticated user can load (read-only)

**Response:**
```json
{
  "primaryColor": "#3B82F6",
  "sidebarColor": "#0f172a",
  "headerColor": "#ffffff",
  "footerColor": "#ffffff",
  "backgroundType": "image",
  "backgroundColor": "#F9FAFB",
  "backgroundColorDark": "#111827",
  "backgroundImageUrl": "https://your-domain.com/uploads/backgrounds/bg.jpg",
  "backgroundImageUrlDark": "https://your-domain.com/uploads/backgrounds/bg-dark.jpg",
  "backgroundSize": "cover",
  "backgroundPosition": "center",
  "backgroundRepeat": "no-repeat",
  "backgroundOpacity": 100,
  "logoUrl": "https://your-domain.com/uploads/logos/logo.png",
  "companyName": "My Company"
}
```

**Error Response (No settings found):**
- Status: 404
- Body: `{ "message": "No theme settings found" }`

**Notes:**
- Load based on user's company_id
- Return 404 if no settings exist (frontend will use defaults)

---

### 5. Delete Image
**Endpoint:** `DELETE /api/theme/delete-image`

**Auth:** Required (Bearer Token)

**Authorization:** Only users with Admin permission to Settings

**Request:**
```json
{
  "imageUrl": "https://your-domain.com/uploads/backgrounds/old-bg.jpg"
}
```

**Response:**
```json
{
  "message": "Image deleted successfully"
}
```

**Notes:**
- Validate that imageUrl belongs to the user's company
- Remove file from storage
- Remove reference from database

---

## Frontend Flow

1. **App Startup (main.ts)**
   - Check if user is authenticated (has token)
   - If yes, call `GET /api/theme/settings` to load company theme
   - Apply theme to all components
   - Cache in localStorage for quick access

2. **User Opens Settings (Admin only)**
   - Settings tab loads current theme from localStorage
   - Admin can upload logo, background images
   - Admin can change colors
   - When "Apply" is clicked:
     - Save to localStorage (immediate effect)
     - Call `POST /api/theme/settings` (persist for all users)

3. **User Logs In (Signin.vue)**
   - Preserve theme settings in localStorage (don't clear)
   - After successful login, theme loads from API
   - Apply to current user

4. **User Logs Out**
   - Only clear `user` and `token`
   - Keep theme settings so next user sees company theme

---

## Security Considerations

1. **File Upload Security:**
   - Validate file types (only images)
   - Validate file sizes (logo: 2MB, background: 5MB)
   - Sanitize filenames
   - Use unique names to prevent overwriting

2. **Authorization:**
   - Verify user has Admin access to Settings module
   - Check user belongs to the company before loading/saving

3. **Storage:**
   - Use cloud storage (S3, Azure Blob) for scalability
   - Set proper CORS headers for image access
   - Consider CDN for better performance

4. **Rate Limiting:**
   - Limit upload frequency to prevent abuse
   - Limit number of theme changes per hour

---

## Testing Checklist

- [ ] Admin can upload logo
- [ ] Admin can upload background images (light & dark)
- [ ] Admin can save theme settings
- [ ] Non-admin users cannot modify theme
- [ ] All users can load theme settings
- [ ] Theme persists across login/logout
- [ ] Old images are deleted when new ones uploaded
- [ ] File size limits are enforced
- [ ] Invalid file types are rejected
- [ ] Theme applies immediately after saving
