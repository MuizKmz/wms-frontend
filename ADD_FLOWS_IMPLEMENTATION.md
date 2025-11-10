# Add Flows Feature - Multi-Step Wizard Implementation

## Overview
Implemented a professional multi-step wizard for adding receiving flows in the Receiving module. The wizard guides users through 4 logical steps for data entry.

## Component Structure

### New Component: `AddFlowsReceiving.vue`
**Location:** `src/views/Receiving/component/AddFlowsReceiving.vue`

**Features:**
- ✅ Multi-step wizard with 4 steps
- ✅ Visual step indicators (breadcrumb style)
- ✅ Progressive form validation
- ✅ Next/Previous navigation
- ✅ Responsive design with TailwindCSS
- ✅ Dark mode support
- ✅ Scroll lock when modal is open

### 4-Step Workflow

#### Step 1: Supplier Information
- **Required:** Supplier Name
- **Optional:** Supplier Code, Contact Person, Phone Number

#### Step 2: Receiving Details
- **Required:** Receiving Code, Order No, Receiving Date
- **Optional:** Remarks (textarea)

#### Step 3: Product Information
- **Required:** SKU Code, Tag Code, Quantity
- **Optional:** Tag Flow, Tag Type

#### Step 4: Location & Status
- **Required:** Warehouse Code, Status (dropdown)
- **Optional:** Rack Code, Section Code

**Status Options:**
- RECEIVED
- DELIVERED
- INBOUND
- GENERATED

## Integration

### Updated Files

**`Receiving.vue`** - Main receiving page
- ✅ Imported `AddFlowsReceiving` component
- ✅ Added ref: `addFlowsModalRef`
- ✅ Added handler: `openAddFlowsModal()`
- ✅ Added event handler: `handleFlowCreated()`
- ✅ Removed ~140 lines of inline modal code
- ✅ Component tag: `<AddFlowsReceiving ref="addFlowsModalRef" @flow-created="handleFlowCreated" />`

### Usage

```typescript
// Open modal
addFlowsModalRef.value?.openModal()

// Handle success
const handleFlowCreated = async (result: Result) => {
  if (result.success) {
    showToastMessage('Flow created successfully', 'success')
    await receivingTableRef.value?.refreshData()
  }
}
```

## Features

### Visual Step Indicator
- **Active step:** Blue/brand color with white text
- **Completed steps:** Green with checkmark (✓)
- **Upcoming steps:** Gray
- **Responsive:** Step names hidden on mobile (sm:inline)

### Form Validation
Per-step validation prevents users from proceeding with incomplete data:
- Step 1: Supplier Name required
- Step 2: Receiving Code, Order No, Receiving Date required
- Step 3: SKU Code, Tag Code, Quantity (≥1) required
- Step 4: Warehouse Code, Status required

### Navigation Controls
- **Previous:** Enabled on Steps 2-4
- **Next:** Enabled on Steps 1-3 (validates before proceeding)
- **Submit:** Only visible on Step 4
- **Cancel:** Available at all steps
- **Close (X):** Top-right corner

### User Experience
- ✅ Teleport to body for proper z-index stacking
- ✅ Click outside to close (on backdrop)
- ✅ Smooth transitions (fade & scale)
- ✅ Loading spinner during submission
- ✅ Button disabled states during submission
- ✅ Error messages below invalid fields
- ✅ Form auto-reset on open

## Backend Integration

### Current State
The component currently uses a **placeholder setTimeout** for submission simulation.

### To Wire to Backend

Replace the placeholder in `submitForm()`:

```typescript
async function submitForm() {
  if (!validateStep(4)) return
  
  isSubmitting.value = true
  
  try {
    // Replace this placeholder:
    // setTimeout(() => { ... }, 1000)
    
    // With actual API call:
    const response = await axios.post('/api/receiving/add-flow', formData)
    
    emit('flow-created', {
      success: true,
      message: 'Receiving flow created successfully',
      data: response.data,
    })
    
    closeModal()
  } catch (error) {
    // Handle error
    emit('flow-created', {
      success: false,
      error: error.message || 'Failed to create flow',
    })
  } finally {
    isSubmitting.value = false
  }
}
```

### Expected API Endpoint
**POST** `/api/receiving/add-flow`

**Request Body:**
```json
{
  "supplierName": "Supplier ABC",
  "supplierCode": "SUP-001",
  "contactPerson": "John Doe",
  "phoneNumber": "123-456-7890",
  "receivingCode": "RCV-2025-001",
  "orderNo": "ORD-001",
  "receivingDate": "2025-01-10",
  "remarks": "Urgent delivery",
  "skuCode": "SKU-123",
  "tagCode": "TAG-001",
  "tagFlow": "INBOUND",
  "tagType": "TYPE-A",
  "quantity": 100,
  "warehouseCode": "WH-001",
  "rackCode": "R-A1",
  "sectionCode": "S-001",
  "status": "RECEIVED"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Flow created successfully",
  "data": {
    "id": 123,
    "receivingCode": "RCV-2025-001",
    ...
  }
}
```

## Code Quality

### TypeScript
- ✅ Full type safety with TypeScript
- ✅ Proper reactive types with `ref()` and `reactive()`
- ✅ Type-safe emit events
- ✅ defineExpose for parent access

### Best Practices
- ✅ Composition API
- ✅ Component reusability (separate file)
- ✅ Clean separation of concerns
- ✅ Consistent naming conventions
- ✅ Proper error handling
- ✅ Loading states
- ✅ Accessibility (aria-label on close button)

## Testing Checklist

- [ ] Open modal from "Add Flows" button
- [ ] Step 1: Fill supplier info, click Next
- [ ] Step 2: Fill receiving details, click Next
- [ ] Step 3: Fill product info, test quantity validation (must be ≥1)
- [ ] Step 4: Fill location, select status
- [ ] Click Previous to go back through steps
- [ ] Click Cancel to close modal
- [ ] Click backdrop to close modal
- [ ] Try submitting without required fields (should show errors)
- [ ] Test responsive design (mobile/tablet/desktop)
- [ ] Test dark mode appearance
- [ ] Wire to backend and test actual data submission
- [ ] Verify table refresh after successful submission

## Next Steps

1. **Create Backend Endpoint** (Optional - currently using placeholder)
   - Create POST `/api/receiving/add-flow` endpoint
   - Validate request body
   - Create flow record in database
   - Return success/error response

2. **Wire Frontend to Backend**
   - Replace setTimeout with axios.post call
   - Handle API errors properly
   - Add proper error messages

3. **Enhanced Features** (Future improvements)
   - Add autocomplete for supplier selection (Step 1)
   - Add warehouse/rack/section dropdowns from database (Step 4)
   - Add SKU validation against product database (Step 3)
   - Add order number validation (Step 2)
   - Save draft progress (localStorage)
   - Add confirmation dialog before cancel if form has data

## Summary

Successfully implemented a professional multi-step wizard component for adding receiving flows:
- ✅ Separate component file (`AddFlowsReceiving.vue`)
- ✅ 4 logical steps with visual indicators
- ✅ Progressive form validation
- ✅ Clean integration into `Receiving.vue`
- ✅ Removed ~140 lines of inline code
- ✅ Ready for backend integration

The implementation improves UX by guiding users through complex data entry step-by-step, with clear visual feedback and validation.
