import { computed, ref, type Ref } from 'vue'

interface PaginationOptions {
  data: Ref<any[]>
  itemsPerPage?: number
  headerHeight?: number
  footerHeight?: number
  summaryReserve?: number // pixels to reserve for summary on last page
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
    summaryReserve = 0,
    rowHeight = 45,     // Approximate row height in pixels
    orientation
  } = options

  // Calculate A4 page height in pixels (297mm ≈ 1122px at 96dpi, 210mm ≈ 793px)
  // We'll compute px-per-mm dynamically to account for browser zoom / DPI
  const pxPerMmRef = ref<number | null>(null)

  const computePxPerMm = () => {
    try {
      if (typeof document === 'undefined') return 3.78 // fallback
      const el = document.createElement('div')
      el.style.width = '100mm'
      el.style.position = 'absolute'
      el.style.left = '-9999px'
      document.body.appendChild(el)
      const px = el.getBoundingClientRect().width / 100
      document.body.removeChild(el)
      return px || 3.78
    } catch (e) {
      return 3.78
    }
  }

  // Calculate available content height based on orientation
  // Make measurements reactive so they can be adjusted at runtime if we measure the DOM
  const headerHeightRef = ref(headerHeight)
  const footerHeightRef = ref(footerHeight)
  const rowHeightRef = ref(rowHeight)

  const availableContentHeight = computed(() => {
    const pxPerMm = pxPerMmRef.value ?? computePxPerMm()
    // cache pxPerMm
    if (!pxPerMmRef.value) pxPerMmRef.value = pxPerMm

    const pageHeightMm = orientation?.value === 'landscape' ? 210 : 297
    const pageHeightPx = Math.round(pageHeightMm * pxPerMm)
    // Reserve space for summary on the last page if configured
    return pageHeightPx - headerHeightRef.value - footerHeightRef.value - summaryReserve
  })

  // Recreate totalPages and getPageData based on the built pages
  const totalPages = computed(() => {
    return paginatedData.value.length || 1
  })

  const getPageData = (pageIndex: number) => {
    return paginatedData.value[pageIndex]?.data || []
  }

  // Calculate items that can fit per page
  const calculatedItemsPerPage = computed(() => {
    return Math.floor(availableContentHeight.value / rowHeightRef.value)
  })

  const pageHeightPx = computed(() => {
    const pxPerMm = pxPerMmRef.value ?? computePxPerMm()
    const pageHeightMm = orientation?.value === 'landscape' ? 210 : 297
    return Math.round(pageHeightMm * pxPerMm)
  })

  // DOM-driven pages override (when we measure real DOM rows)
  const domPagesRef = ref<null | Array<any>>(null)

  /**
   * Paginate by measuring the real DOM rows inside a cloned container.
   * This produces page splits that exactly match rendered heights.
   */
  const paginateFromDom = (container: HTMLElement | null) => {
    if (!container) return null

    try {
      // Clone the container to avoid changing layout; remove transforms
      const clone = container.cloneNode(true) as HTMLElement
      clone.style.position = 'absolute'
      clone.style.left = '-9999px'
      clone.style.top = '0'
      clone.style.transform = 'none'
      clone.style.width = orientation?.value === 'landscape' ? '297mm' : '210mm'
      clone.style.boxSizing = 'border-box'
      clone.style.visibility = 'hidden'
      document.body.appendChild(clone)

      // Strip inline transforms on descendants (preview pages use CSS scale)
      try {
        const all = Array.from(clone.querySelectorAll('*')) as HTMLElement[]
        all.forEach(el => {
          if (el.style && el.style.transform) {
            el.style.transform = 'none'
            el.style.transformOrigin = 'top left'
          }
        })
      } catch (e) {}

      const headerEl = clone.querySelector('.report-header') as HTMLElement | null
      const footerEl = clone.querySelector('.report-footer') as HTMLElement | null
      const summaryEl = clone.querySelector('[data-summary]') as HTMLElement | null
      const tbodyRows = Array.from(clone.querySelectorAll('tbody tr')) as HTMLElement[]

      const headerH = headerEl ? Math.round(headerEl.getBoundingClientRect().height) : headerHeightRef.value
      const footerH = footerEl ? Math.round(footerEl.getBoundingClientRect().height) : footerHeightRef.value
      const summaryH = summaryEl ? Math.round(summaryEl.getBoundingClientRect().height) : summaryReserve

      // Measure a real page height inside the clone to avoid mismatches
      const pageHeightMm = orientation?.value === 'landscape' ? 210 : 297
      let pagePx = pageHeightPx.value
      try {
        const measureEl = document.createElement('div')
        measureEl.style.height = pageHeightMm + 'mm'
        measureEl.style.width = '1px'
        measureEl.style.position = 'absolute'
        measureEl.style.left = '0'
        measureEl.style.top = '0'
        measureEl.style.visibility = 'hidden'
        clone.appendChild(measureEl)
        const measured = Math.round(measureEl.getBoundingClientRect().height)
        clone.removeChild(measureEl)
        if (measured > 0) pagePx = measured
      } catch (e) {
        // fallback to computed pageHeightPx
      }

      const normalAvail = Math.max(0, pagePx - headerH - footerH)
      const lastAvail = Math.max(0, pagePx - headerH - footerH - summaryH)

      // Debugging help: log measured sizes so callers can tune summaryReserve/rowHeight
      try {
        // eslint-disable-next-line no-console
        console.debug('[paginateFromDom] measured', {
          orientation: orientation?.value,
          pagePx,
          headerH,
          footerH,
          summaryH,
          tbodyRows: tbodyRows.length
        })
      } catch (e) {}

      const pages: Array<any> = []
      let currentPageRows: any[] = []
      let currentHeight = 0
      let rowIndex = 0

      // Helper to push a page; map measured row descriptors back to original data items
      const pushPage = (rows: any[]) => {
        const mapped = rows.map(r => data.value[typeof r === 'number' ? r : r.__rowIndex])
        const startRow = pages.reduce((acc, p) => acc + p.data.length, 0) + 1
        pages.push({ pageIndex: pages.length, data: mapped, pageNumber: pages.length + 1, startRow, endRow: startRow + mapped.length - 1 })
      }

      // Iterate rows and pack into pages, reserving last page space
      while (rowIndex < tbodyRows.length) {
        const rowEl = tbodyRows[rowIndex]
        const h = Math.max(1, Math.round(rowEl.getBoundingClientRect().height))

        // If adding this row exceeds normalAvail and currentPageRows not empty, push page
        if (currentHeight + h > normalAvail && currentPageRows.length > 0) {
          pushPage(currentPageRows)
          currentPageRows = []
          currentHeight = 0
          continue
        }

        // Tentatively add row
        currentPageRows.push({ __rowIndex: rowIndex, elHeight: h })
        currentHeight += h
        rowIndex++
      }

      // At this point we have packed all rows; ensure last page respects lastAvail
      if (currentPageRows.length > 0) {
        // If last page height exceeds lastAvail, move overflowing rows to new page
        const totalLastHeight = currentPageRows.reduce((s, r) => s + r.elHeight, 0)
        if (totalLastHeight > lastAvail) {
          // Move rows from end until it fits
          let moving: any[] = []
          while (currentPageRows.length && currentPageRows.reduce((s, r) => s + r.elHeight, 0) > lastAvail) {
            moving.unshift(currentPageRows.pop()!)
          }
          pushPage(currentPageRows)
          // moving becomes next page rows
          if (moving.length > 0) pushPage(moving)
        } else {
          pushPage(currentPageRows)
        }
      }

      // Cleanup clone
      document.body.removeChild(clone)

      // Attach totalPages
      const total = pages.length || 1
      for (const p of pages) p.totalPages = total

      domPagesRef.value = pages
      // Debug summary of produced pages
      try {
        // eslint-disable-next-line no-console
        console.debug('[paginateFromDom] produced pages', pages.map(p => ({ page: p.pageNumber, rows: p.data.length, range: `${p.startRow}-${p.endRow}` })))
      } catch (e) {}

      return pages
    } catch (e) {
      return null
    }
  }

  // Use provided itemsPerPage or calculated value
  const effectiveItemsPerPage = computed(() => {
    // If a specific itemsPerPage was provided and it's reasonable, use the smaller
    // of the provided value and the calculated capacity to avoid overflowing the page.
    const calc = Math.max(1, calculatedItemsPerPage.value)
    if (itemsPerPage && itemsPerPage > 0) {
      return Math.min(itemsPerPage, calc)
    }
    return calc
  })

  // Build pages using normal capacity and a smaller last-page capacity
  const paginatedData = computed(() => {
    const pages: Array<any> = []
    if (!data.value || data.value.length === 0) return [{ pageIndex: 0, data: [], pageNumber: 1, totalPages: 1, startRow: 1, endRow: 0 }]

    // Compute pixel-based page height and capacities
    const pagePx = pageHeightPx.value
    const headerPx = headerHeightRef.value
    const footerPx = footerHeightRef.value
    const rowPx = rowHeightRef.value

    const normalAvailable = Math.max(0, pagePx - headerPx - footerPx)
    const lastAvailable = Math.max(0, pagePx - headerPx - footerPx - summaryReserve)

    let normalCapacity = Math.max(1, Math.floor(normalAvailable / rowPx))
    let lastCapacity = Math.max(1, Math.floor(lastAvailable / rowPx))

    // Respect provided itemsPerPage as a maximum per page
    if (itemsPerPage && itemsPerPage > 0) {
      normalCapacity = Math.min(normalCapacity, itemsPerPage)
      lastCapacity = Math.min(lastCapacity, itemsPerPage)
    }

    let remaining = data.value.slice()
    let pageIndex = 0

    while (remaining.length > 0) {
      if (remaining.length <= lastCapacity) {
        // Put all remaining items on the last page
        const pageData = remaining.slice(0)
        const startRow = data.value.length - remaining.length + 1
        pages.push({
          pageIndex,
          data: pageData,
          pageNumber: pages.length + 1,
          startRow,
          endRow: startRow + pageData.length - 1
        })
        remaining = []
        pageIndex++
        break
      }

      // Otherwise take a normal page
      const pageData = remaining.slice(0, normalCapacity)
      const startRow = data.value.length - remaining.length + 1
      pages.push({
        pageIndex,
        data: pageData,
        pageNumber: pages.length + 1,
        startRow,
        endRow: startRow + pageData.length - 1
      })
      remaining = remaining.slice(normalCapacity)
      pageIndex++
    }

    // Update totalPages on each page object
    const total = pages.length || 1
    for (const p of pages) p.totalPages = total

    // If DOM-derived pages are present, prefer them (they match rendered layout)
    if (domPagesRef.value && Array.isArray(domPagesRef.value) && domPagesRef.value.length > 0) {
      return domPagesRef.value
    }

    return pages
  })

  /**
   * Update measurements programmatically (in pixels)
   * header, footer, row are optional numbers
   */
  const updateMeasurements = (m: { header?: number; footer?: number; row?: number }) => {
    if (typeof m.header === 'number') headerHeightRef.value = m.header
    if (typeof m.footer === 'number') footerHeightRef.value = m.footer
    if (typeof m.row === 'number') rowHeightRef.value = m.row
  }

  /**
   * Try to measure header/footer/row heights from a container element.
   * This attempts common selectors and falls back gracefully.
   */
  const measureFromContainer = (container: HTMLElement | null) => {
    if (!container) return null

    try {
      const headerEl = container.querySelector('.report-header') as HTMLElement | null
      const footerEl = container.querySelector('.report-footer') as HTMLElement | null

      // Find first table row as representative row height
      const firstRow = container.querySelector('tbody tr') as HTMLElement | null

      const measuredHeader = headerEl ? Math.round(headerEl.getBoundingClientRect().height) : undefined
      const measuredFooter = footerEl ? Math.round(footerEl.getBoundingClientRect().height) : undefined
      const measuredRow = firstRow ? Math.max(1, Math.round(firstRow.getBoundingClientRect().height)) : undefined

      updateMeasurements({ header: measuredHeader, footer: measuredFooter, row: measuredRow })

      return {
        header: measuredHeader,
        footer: measuredFooter,
        row: measuredRow
      }
    } catch (e) {
      return null
    }
  }

  return {
    totalPages,
    getPageData,
    paginatedData,
    itemsPerPage: effectiveItemsPerPage,
    availableContentHeight,
    updateMeasurements,
    measureFromContainer,
    paginateFromDom,
    domPages: domPagesRef,
    // Expose measured refs for debugging
    measured: {
      header: headerHeightRef,
      footer: footerHeightRef,
      row: rowHeightRef,
      pxPerMm: pxPerMmRef
    }
    ,
    // Additional debug values
    pageHeightPx,
    calculatedItemsPerPage
  }
}

