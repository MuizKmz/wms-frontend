<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header Component -->
    <HomeHeader
      ref="headerComponentRef"
      :scroll-position="scrollPosition"
    />

    <!-- Main Content -->
    <main
      class="container mx-auto px-6 py-20"
      id="home"
      :style="{ paddingTop: scrollPosition > 50 ? '5.5rem' : '6.5rem' }"
    >
      <!-- Hero Section -->
      <HomeHero />

      <!-- About Section -->
      <HomeAbout />

      <!-- Feature Section -->
      <HomeFeature />

      <!-- Contact Section -->
      <HomeContact />
    </main>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import HomeHeader from './component/HomeHeader.vue'
import HomeHero from './component/HomeHero.vue'
import HomeAbout from './component/HomeAbout.vue'
import HomeFeature from './component/HomeFeature.vue'
import HomeContact from './component/HomeContact.vue'

const headerComponentRef = ref(null)
const scrollPosition = ref(0)
let lastHeaderHeight = 0

const updateHeaderOffset = () => {
  const headerEl = headerComponentRef.value?.headerRef
  const h = headerEl ? headerEl.getBoundingClientRect().height : 0
  const offset = Math.round(h + 4)
  if (offset !== lastHeaderHeight) {
    document.documentElement.style.setProperty('--header-offset', `${offset}px`)
    lastHeaderHeight = offset
  }
}

const handleScroll = () => {
  scrollPosition.value = window.scrollY
  updateHeaderOffset()
}

onMounted(() => {
  updateHeaderOffset()
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', updateHeaderOffset)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', updateHeaderOffset)
})
</script>

<style scoped>
:root {
  --header-offset: 88px;
}

section, #home {
  scroll-margin-top: var(--header-offset);
}

html {
  scroll-behavior: smooth;
}
</style>
