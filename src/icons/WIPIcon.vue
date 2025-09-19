<template>
  <svg 
    :width="20" 
    :height="20" 
    viewBox="0 0 20 20" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Upside-down triangle -->
    <path 
      d="M10 10L13.5 5H6.5L10 10Z" 
      stroke="currentColor" 
      stroke-width="1.5" 
      stroke-linejoin="round" 
      fill="none"
    />

    <!-- Rounded rectangle (base) -->
    <rect 
      x="3" 
      y="11" 
      width="14" 
      height="6" 
      rx="2" 
      stroke="currentColor" 
      stroke-width="1.5" 
      fill="none"
    />

    <!-- Two small inner blocks -->
    <rect 
      x="6" 
      y="13" 
      width="3" 
      height="2" 
      rx="0.5" 
      fill="currentColor"
    />
    <rect 
      x="11" 
      y="13" 
      width="3" 
      height="2" 
      rx="0.5" 
      fill="currentColor"
    />
  </svg>
</template>
