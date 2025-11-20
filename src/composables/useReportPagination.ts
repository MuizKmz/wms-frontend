import { computed, type Ref } from 'vue'

interface PaginationOptions {
  data: Ref<any[]>
  itemsPerPage?: number
  headerHeight?: number
  footerHeight?: number
  rowHeight?: number
  orientation?: Ref<'portrait' | 'landscape'>
}

/**
 * Composable for handling report pagination
 * Automatically calculates pages needed and splits data across pages
 */
export function useReportPagination(options: PaginationOptions) {
  const {
    data,
    itemsPerPage = 20, // Conservative default for A4 with header/footer
    headerHeight = 200, // Approximate header height in pixels
    footerHeight = 60,  // Approximate footer height in pixels
    rowHeight = 45,     // Approximate row height in pixels
    orientation
  } = options

  // Calculate A4 page height in pixels (297mm ≈ 1122px at 96dpi, 210mm ≈ 793px)
  const A4_PORTRAIT_HEIGHT_PX = 1122
  const A4_LANDSCAPE_HEIGHT_PX = 793

  // Calculate available content height based on orientation
  const availableContentHeight = computed(() => {
    const pageHeight = orientation?.value === 'landscape' 
      ? A4_LANDSCAPE_HEIGHT_PX 
      : A4_PORTRAIT_HEIGHT_PX
    return pageHeight - headerHeight - footerHeight
  })

  // Calculate items that can fit per page
  const calculatedItemsPerPage = computed(() => {
    return Math.floor(availableContentHeight.value / rowHeight)
  })

  // Use provided itemsPerPage or calculated value
  const effectiveItemsPerPage = computed(() => {
    return itemsPerPage || calculatedItemsPerPage.value
  })

  // Calculate total number of pages needed
  const totalPages = computed(() => {
    if (!data.value || data.value.length === 0) return 1
    return Math.ceil(data.value.length / effectiveItemsPerPage.value)
  })

  // Get data for a specific page
  const getPageData = (pageIndex: number) => {
    if (!data.value || data.value.length === 0) return []
    
    const startIndex = pageIndex * effectiveItemsPerPage.value
    const endIndex = startIndex + effectiveItemsPerPage.value
    
    return data.value.slice(startIndex, endIndex)
  }

  // Get all pages with their data
  const paginatedData = computed(() => {
    const pages = []
    for (let i = 0; i < totalPages.value; i++) {
      pages.push({
        pageIndex: i,
        data: getPageData(i),
        pageNumber: i + 1,
        totalPages: totalPages.value,
        startRow: i * effectiveItemsPerPage.value + 1,
        endRow: Math.min((i + 1) * effectiveItemsPerPage.value, data.value.length)
      })
    }
    return pages
  })

  return {
    totalPages,
    getPageData,
    paginatedData,
    itemsPerPage: effectiveItemsPerPage,
    availableContentHeight
  }
}
