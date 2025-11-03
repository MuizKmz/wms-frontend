<template>
  <section id="contact" class="mt-32 mb-20 scroll-mt-20">
    <h2 class="text-4xl font-bold text-center text-gray-900 mb-12">
      Contact Us
    </h2>
    
    <div class="grid md:grid-cols-2 gap-20 max-w-6xl mx-auto">
      <!-- Left Side - Map and Address -->
      <div class="space-y-6">
        <!-- Map -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden h-80">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.654084394285!2d103.7891!3d1.5347!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwMzInMDQuOSJOIDEwM8KwNDcnMjAuOCJF!5e0!3m2!1sen!2smy!4v1234567890"
            width="100%"
            height="100%"
            style="border:0;"
            allowfullscreen=""
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
        
        <!-- Address -->
        <div class="bg-white p-6 rounded-xl shadow-lg">
          <h3 class="text-xl font-bold text-gray-900 mb-4">Malaysia Head Office:</h3>
          <div class="text-gray-700 leading-relaxed">
            <p class="font-semibold mb-2">Chooxpress Label Sdn Bhd</p>
            <p>Lot 4041 & 4054, Jalan Riang 21</p>
            <p>Kawasan Perindustrian Gembira,</p>
            <p>Mukim Tebrau, 81200 Johor Bahru,</p>
            <p class="mb-4">Johor Malaysia.</p>

            <!-- Factory Plant Address -->
            <div class="mt-4">
              <p class="font-semibold mb-1">Factory Plant</p>
              <p>39, 41, 43&45, JLN Mutiara Emas 5/6,</p>
              <p>Taman Mount Austin, 81100</p>
              <p>Johor Bahru, Johor, Malaysia.</p>
            </div>

            <div class="pt-4 border-t border-gray-200 space-y-2">
              <div class="flex items-center">
                <i class="fas fa-envelope text-blue-600 w-5"></i>
                <span class="ml-2">Email: tl.choo@chooexpress.com</span>
              </div>
              <div class="flex items-start">
                <i class="fas fa-phone text-blue-600 w-5 mt-1"></i>
                <span class="ml-2">Tel: +6 07 353 2052 / +6019-779 6306</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side - Inquiries Form -->
      <div class="bg-white p-8 rounded-xl shadow-lg">
        <h3 class="text-2xl font-bold text-gray-900 mb-6">Do you have any Inquiries?</h3>
        <p class="text-gray-600 mb-6">
          Please feel free to contact us to discuss what innovative labels printing solutions we can offer to you.
        </p>
        
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <input
              v-model="formData.companyName"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Your Company Name"
              required
            />
          </div>
          <div>
            <input
              v-model="formData.name"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Your Name"
              required
            />
          </div>
          <div>
            <input
              v-model="formData.email"
              type="email"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Your Email"
              required
            />
          </div>
          <div>
            <input
              v-model="formData.phone"
              type="tel"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Your Phone Number"
              required
            />
          </div>
          <div>
            <textarea
              v-model="formData.message"
              rows="4"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Your Message"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            class="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition w-auto"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive } from 'vue'

const formData = reactive({ 
  companyName: '', 
  name: '', 
  email: '', 
  phone: '', 
  message: '' 
})

const handleSubmit = () => {
  console.log('Form submitted:', formData)
  alert('Message sent successfully!')
  formData.companyName = ''
  formData.name = ''
  formData.email = ''
  formData.phone = ''
  formData.message = ''
}
</script>