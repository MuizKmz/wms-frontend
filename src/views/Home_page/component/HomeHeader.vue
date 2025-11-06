<template>
  <header
    ref="headerRef"
    class="fixed top-0 left-0 w-full z-50 transition-all duration-300"
    :class="[
      scrollPosition > 50
        ? 'bg-white/90 backdrop-blur-sm shadow-lg py-2'
        : 'bg-white py-4'
    ]"
  >
    <div class="relative">
      <div
        class="absolute bottom-0 left-0 right-0 h-8 bg-white/90"
        :class="{ 'opacity-0': scrollPosition > 50 }"
        :style="{
          borderBottomLeftRadius: '50% 120%',
          borderBottomRightRadius: '50% 120%',
          transform: 'translateY(80%)',
          transition: 'opacity 0.3s ease',
        }"
      ></div>

      <nav class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <!-- Left Side - Title -->
          <div class="flex items-center">
            <a
              href="#home"
              class="flex items-center cursor-pointer hover:opacity-80 transition transform hover:scale-105 duration-200"
            >
              <h2 class="text-4xl font-bold text-gray-900">WMS</h2>
            </a>
          </div>

          <!-- Right Side -->
          <div class="hidden md:flex items-center space-x-6">
            <a
              v-for="link in navLinks"
              :key="link.href"
              :href="link.href"
              class="nav-link text-gray-700 hover:text-blue-600 transition-all duration-200 text-base font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transform hover:scale-110"
            >
              {{ link.text }}
            </a>

            <a
              href="/signin"
              class="flex items-center space-x-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 text-base font-medium transform hover:scale-105 hover:shadow-lg active:scale-95"
            >
              <i class="fas fa-sign-in-alt text-lg"></i>
              <span>Log in</span>
            </a>
          </div>

          <!-- Mobile Menu Button -->
          <button
            class="md:hidden text-gray-700 transform hover:scale-110 transition-all duration-200"
            @click="toggleMenu"
          >
            <i :class="['fas', isMenuOpen ? 'fa-times' : 'fa-bars', 'text-2xl']"></i>
          </button>
        </div>

        <!-- Mobile Menu -->
        <div
          v-if="isMenuOpen"
          class="md:hidden mt-4 pb-4 space-y-2 absolute left-0 right-0 bg-white px-6 shadow-lg z-50 transform origin-top"
          :class="{ 'animate-slideDown': isMenuOpen }"
        >
          <a
            v-for="link in navLinks"
            :key="link.href"
            :href="link.href"
            @click="isMenuOpen = false"
            class="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 text-base font-medium py-2 px-4 rounded-lg transform hover:scale-105"
          >
            {{ link.text }}
          </a>
          <div class="pt-3 border-t">
            <a
              href="/signin"
              @click="isMenuOpen = false"
              class="flex items-center space-x-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 text-base font-medium w-full justify-center transform hover:scale-105 hover:shadow-lg active:scale-95"
            >
              <i class="fas fa-sign-in-alt text-lg"></i>
              <span>Log in</span>
            </a>
          </div>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  scrollPosition: {
    type: Number,
    required: true
  }
})

defineExpose({
  headerRef: ref(null)
})

const headerRef = ref(null)
const isMenuOpen = ref(false)

const navLinks = [
  { href: '#home', text: 'Home' },
  { href: '#about', text: 'About' },
  { href: '#feature', text: 'Feature' },
  { href: '#contact', text: 'Contact' },
]

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}
</script>

<style scoped>
.nav-link {
  position: relative;
  overflow: hidden;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background-color: #2563eb;
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.nav-link:hover::after {
  width: 100%;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slideDown {
  animation: slideDown 0.3s ease forwards;
}
</style>
