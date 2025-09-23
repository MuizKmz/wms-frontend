<template>
<svg :width="20" :height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Top-left short line (corner edge) -->
  <line x1="4" y1="6" x2="6" y2="4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  
  <!-- Inner diagonals with bigger spacing -->
  <line x1="4" y1="11" x2="11" y2="4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="4" y1="16" x2="16" y2="4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  
  <!-- Bottom-right short line (corner edge) -->
  <line x1="9" y1="16" x2="16" y2="9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="14" y1="16" x2="16" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>
</template>
