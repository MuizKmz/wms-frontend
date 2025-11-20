// Status enum mapping for display purposes (SIMPLIFIED)
// Backend uses UPPER_CASE enums, frontend displays friendly text

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  RECEIVED: 'RECEIVED',
  DELIVERED: 'DELIVERED',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED',
} as const

export const SHIPMENT_STATUS = {
  PENDING: 'PENDING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const

export const RECEIVING_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CLOSED: 'CLOSED',
} as const

export const RETURN_STATUS = {
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  IN_TRANSIT: 'IN_TRANSIT',
  RECEIVED: 'RECEIVED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

// Display labels for UI (SIMPLIFIED)
export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  RECEIVED: 'Received',
  DELIVERED: 'Delivered',
  CLOSED: 'Completed',
  CANCELLED: 'Cancelled',
}

export const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

export const RECEIVING_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CLOSED: 'Closed',
}

export const RETURN_STATUS_LABELS: Record<string, string> = {
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  IN_TRANSIT: 'In Transit',
  RECEIVED: 'Received',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

// Helper function to get display label
export function getStatusLabel(status: string, type: 'order' | 'shipment' | 'receiving' | 'return'): string {
  switch (type) {
    case 'order':
      return ORDER_STATUS_LABELS[status] || status
    case 'shipment':
      return SHIPMENT_STATUS_LABELS[status] || status
    case 'receiving':
      return RECEIVING_STATUS_LABELS[status] || status
    case 'return':
      return RETURN_STATUS_LABELS[status] || status
    default:
      return status
  }
}

// Get all status options for dropdowns
export function getStatusOptions(type: 'order' | 'shipment' | 'receiving' | 'return') {
  switch (type) {
    case 'order':
      return Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label }))
    case 'shipment':
      return Object.entries(SHIPMENT_STATUS_LABELS).map(([value, label]) => ({ value, label }))
    case 'receiving':
      return Object.entries(RECEIVING_STATUS_LABELS).map(([value, label]) => ({ value, label }))
    case 'return':
      return Object.entries(RETURN_STATUS_LABELS).map(([value, label]) => ({ value, label }))
    default:
      return []
  }
}
