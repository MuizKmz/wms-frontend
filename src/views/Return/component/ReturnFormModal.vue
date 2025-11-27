<template>
  <teleport to="body">
    <transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-200"
      @after-leave="unlockScroll"
    >
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" @click.self="closeModal"></div>
        <transition
          enter-active-class="transition-all duration-300"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          appear
        >
          <div v-if="isOpen" class="relative z-10 w-full max-w-3xl mx-4">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
              <!-- Header -->
              <div class="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 class="text-xl font-bold text-gray-900 dark:text-white">Add Return Information</h2>
                </div>
                <button
                  @click="closeModal"
                  :disabled="isSubmitting"
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              <!-- Step Indicator -->
              <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900/30">
                <div class="flex items-center justify-center">
                  <div class="flex items-center max-w-md w-full">
                    <div v-for="(step, index) in steps" :key="step.id" class="flex items-center" :class="index < steps.length - 1 ? 'flex-1' : ''">
                      <div class="flex items-center justify-center flex-col flex-shrink-0">
                        <div :class="[
                          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                          currentStep > step.id
                            ? 'bg-green-500 text-white'
                            : currentStep === step.id
                            ? 'bg-brand-500 text-white'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400',
                        ]">
                          <span v-if="currentStep > step.id">✓</span>
                          <span v-else>{{ step.id }}</span>
                        </div>
                        <span :class="[
                          'mt-2 text-xs font-medium text-center whitespace-nowrap',
                          currentStep === step.id
                            ? 'text-brand-500 dark:text-blue-400'
                            : currentStep > step.id
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-500 dark:text-gray-400',
                        ]">
                          {{ step.name }}
                        </span>
                      </div>
                      <div v-if="index < steps.length - 1" :class="[
                        'flex-1 h-0.5 mx-3 self-start mt-4',
                        currentStep > step.id ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                      ]"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Form Content -->
              <div class="p-6 min-h-[400px] max-h-[500px] overflow-y-auto">
                <!-- Step 1: Return Information -->
                <div v-if="currentStep === 1">
                  <div class="space-y-4">
                    <!-- Return Number -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Return Number
                      </label>
                      <input
                        v-model="formData.returnNumber"
                        type="text"
                        class="input input-bordered w-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        placeholder="Auto Generated for tracking return - RTNYYMM0001"
                        disabled
                      />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <!-- Return Type -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Return Type <span class="text-red-500">*</span>
                        </label>
                        <div class="dropdown relative inline-flex w-full" ref="returnTypeDropdownRef">
                          <button
                            type="button"
                            :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400 text-left', { 'btn-error': errors.returnType }]"
                            :aria-expanded="openDropdowns.returnType"
                            @click.stop="toggleDropdown('returnType')"
                          >
                            <span class="truncate pr-2">{{ formData.returnType || 'Choose Return Type' }}</span>
                            <span
                              class="icon-[tabler--chevron-down] size-4 transition-transform flex-shrink-0"
                              :class="{ 'rotate-180': openDropdowns.returnType }"
                            ></span>
                          </button>
                        </div>
                        <span v-if="errors.returnType" class="text-xs text-red-500 mt-1">{{ errors.returnType }}</span>
                      </div>

                      <!-- Return Type dropdown menu - rendered outside normal flow -->
                      <teleport to="body">
                        <ul
                          v-if="openDropdowns.returnType"
                          class="dropdown-menu transition-opacity duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-gray-900 dark:text-white opacity-100"
                          :style="returnTypeMenuStyle"
                          role="menu"
                        >
                          <li>
                            <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectReturnType('Customer Return')">
                              <div class="font-medium">Customer Return</div>
                              <div class="text-xs text-gray-500">Items returning from customer</div>
                            </a>
                          </li>
                          <li>
                            <a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="selectReturnType('Supplier Return')">
                              <div class="font-medium">Supplier Return</div>
                              <div class="text-xs text-gray-500">Returning items to supplier</div>
                            </a>
                          </li>
                        </ul>
                      </teleport>

                      <!-- Reference Number -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Reference Number <span class="text-red-500">*</span>
                        </label>
                        <div class="relative" ref="referenceDropdownRef">
                          <input
                            v-model="formData.referenceNumber"
                            type="text"
                            class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
                            :class="{ 'border-red-500': errors.referenceNumber }"
                            placeholder="Search or enter reference number"
                            @input="handleReferenceSearch"
                            @focus="showReferenceDropdown = true"
                          />
                          <button
                            type="button"
                            @click="toggleReferenceDropdown"
                            class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                          >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </button>
                          <!-- Dropdown for search results -->
                          <ul
                            v-if="showReferenceDropdown && (filteredOrders.length > 0 || loadingOrders)"
                            class="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                          >
                            <li v-if="loadingOrders" class="px-4 py-2 text-sm text-gray-500">
                              Loading orders...
                            </li>
                            <li v-else-if="filteredOrders.length === 0 && formData.referenceNumber" class="px-4 py-2 text-sm text-gray-500">
                              No matching orders found
                            </li>
                            <li
                              v-else
                              v-for="order in filteredOrders"
                              :key="order.id"
                              @click="selectReferenceOrder(order)"
                              class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                            >
                              <div class="flex items-center justify-between">
                                <div class="flex-1">
                                  <div class="font-medium text-gray-900 dark:text-white">{{ order.orderNo }}</div>
                                  <div class="text-xs text-gray-500 dark:text-gray-400">
                                    <span class="font-semibold">{{ order.orderType }}</span> •
                                    {{ order.customer?.customerName || order.supplier?.supplierName || 'N/A' }} •
                                    <span class="text-green-600 dark:text-green-400">{{ order.status }}</span>
                                  </div>
                                </div>
                                <div class="text-xs text-gray-400 ml-2">
                                  {{ order.orderItems?.length || 0 }} items
                                </div>
                              </div>
                            </li>
                          </ul>
                        </div>
                        <span v-if="errors.referenceNumber" class="text-xs text-red-500 mt-1">{{ errors.referenceNumber }}</span>
                        <p class="text-xs text-gray-500 mt-1">
                          {{ formData.returnType === 'Customer' || formData.returnType === 'Customer Return'
                            ? 'Search for shipped/delivered Sales Orders (SO)'
                            : formData.returnType === 'Supplier' || formData.returnType === 'Supplier Return'
                            ? 'Search for received Purchase Orders (PO)'
                            : 'Select return type first to see available orders' }}
                        </p>
                      </div>
                    </div>

                    <div class="grid grid-cols-3 gap-4">
                      <!-- Return Date -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Return Date
                        </label>
                        <input
                          ref="returnDateInput"
                          v-model="formData.returnDate"
                          type="text"
                          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Pick Date"
                          readonly
                        />
                      </div>

                      <!-- From -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          From
                        </label>
                        <input
                          v-model="formData.from"
                          type="text"
                          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Depends on Return Type"
                          disabled
                        />
                      </div>

                      <!-- To -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          To
                        </label>
                        <input
                          v-model="formData.to"
                          type="text"
                          class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Depends on Return Type"
                          disabled
                        />
                      </div>
                    </div>

                    <!-- Created By -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Created By
                      </label>
                      <input
                        v-model="formData.personInCharge"
                        type="text"
                        class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter Creator's Name"
                      />
                    </div>

                    <!-- Remarks -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Remarks
                      </label>
                      <textarea
                        v-model="formData.remarks"
                        rows="3"
                        class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                        placeholder="Enter PIC's Name"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <!-- Step 2: Product Information -->
                <div v-if="currentStep === 2">
                  <div class="space-y-4">
                    <div v-for="(product, pIndex) in formData.products" :key="pIndex" class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div class="flex items-center justify-between mb-3">
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Product {{ pIndex + 1 }}</span>
                        <button
                          v-if="formData.products.length > 1"
                          type="button"
                          @click="removeProduct(pIndex)"
                          class="text-red-500 hover:text-red-700"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <!-- Product Name Dropdown -->
                      <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Product Name <span class="text-red-500">*</span>
                        </label>
                        <div class="dropdown relative inline-flex w-full" :ref="el => { if (el) productDropdownRefs[pIndex] = el }">
                          <button
                            type="button"
                            :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400 text-left', { 'btn-error': errors[`product${pIndex}Name`] }]"
                            :aria-expanded="openDropdowns[`product${pIndex}`]"
                            @click.stop="toggleProductDropdown(pIndex)"
                            :disabled="product.productId > 0"
                          >
                            <span class="truncate pr-2">{{ product.productName || 'Choose Product' }}</span>
                            <span
                              v-if="product.productId === 0"
                              class="icon-[tabler--chevron-down] size-4 transition-transform flex-shrink-0"
                              :class="{ 'rotate-180': openDropdowns[`product${pIndex}`] }"
                            ></span>
                          </button>
                        </div>
                        <span v-if="errors[`product${pIndex}Name`]" class="text-xs text-red-500 mt-1">{{ errors[`product${pIndex}Name`] }}</span>
                      </div>

                      <!-- Product dropdown menu - rendered outside normal flow -->
                      <teleport to="body">
                        <ul
                          v-if="openDropdowns[`product${pIndex}`]"
                          class="dropdown-menu transition-opacity duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-gray-900 dark:text-white opacity-100"
                          :style="productMenuStyles[pIndex] || { position: 'fixed', zIndex: 9999 }"
                          role="menu"
                        >
                          <li v-if="availableProducts.length === 0" class="px-4 py-2 text-sm text-gray-500">
                            No products available
                          </li>
                          <li v-for="availProduct in availableProducts" :key="availProduct.id">
                            <a
                              class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer"
                              @click="selectProduct(pIndex, availProduct)"
                            >
                              <div class="font-medium">{{ availProduct.name }}</div>
                              <div class="text-xs text-gray-500">SKU: {{ availProduct.skuCode }} • Max: {{ availProduct.maxQuantity }}</div>
                            </a>
                          </li>
                        </ul>
                      </teleport>

                      <!-- Reasons Section -->
                      <div class="space-y-3">
                        <div v-for="(reason, rIndex) in product.reasons" :key="rIndex" class="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
                          <div class="flex items-center justify-between mb-2">
                            <span class="text-xs font-semibold text-gray-600 dark:text-gray-400">Reason {{ rIndex + 1 }}</span>
                            <button
                              v-if="product.reasons.length > 1"
                              type="button"
                              @click="removeReason(pIndex, rIndex)"
                              class="text-red-500 hover:text-red-700 text-xs"
                            >
                              Remove
                            </button>
                          </div>
                          <div class="grid grid-cols-3 gap-3">
                            <!-- Quantity -->
                            <div>
                              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Quantity <span class="text-red-500">*</span>
                              </label>
                              <input
                                v-model.number="reason.quantity"
                                type="number"
                                min="1"
                                :max="product.maxQuantity || 999"
                                class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                :class="{ 'border-red-500': errors[`product${pIndex}Reason${rIndex}Quantity`] }"
                                @input="validateQuantity(pIndex, rIndex)"
                              />
                              <p v-if="product.maxQuantity" class="text-xs text-gray-500 mt-1">
                                Max available: {{ product.maxQuantity }}
                              </p>
                              <span v-if="errors[`product${pIndex}Reason${rIndex}Quantity`]" class="text-xs text-red-500 mt-1">{{ errors[`product${pIndex}Reason${rIndex}Quantity`] }}</span>
                            </div>

                            <!-- Reason of Return Dropdown -->
                            <div>
                              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Reason of return <span class="text-red-500">*</span>
                              </label>
                              <div class="dropdown relative inline-flex w-full">
                                <button
                                  type="button"
                                  :class="['dropdown-toggle btn btn-outline w-full justify-between dark:bg-gray-700 dark:text-gray-400 text-left text-sm', { 'btn-error': errors[`product${pIndex}Reason${rIndex}Type`] }]"
                                  :aria-expanded="openDropdowns[`reason${pIndex}_${rIndex}`]"
                                  @click.stop="toggleDropdown(`reason${pIndex}_${rIndex}`)"
                                >
                                  <span class="truncate pr-2">{{ reason.reasonOfReturn || 'Choose Reason' }}</span>
                                  <span
                                    class="icon-[tabler--chevron-down] size-4 transition-transform flex-shrink-0"
                                    :class="{ 'rotate-180': openDropdowns[`reason${pIndex}_${rIndex}`] }"
                                  ></span>
                                </button>
                              </div>
                              <span v-if="errors[`product${pIndex}Reason${rIndex}Type`]" class="text-xs text-red-500 mt-1">{{ errors[`product${pIndex}Reason${rIndex}Type`] }}</span>
                            </div>

                            <!-- Reason dropdown menu -->
                            <teleport to="body">
                              <ul
                                v-if="openDropdowns[`reason${pIndex}_${rIndex}`]"
                                class="dropdown-menu transition-opacity duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-gray-900 dark:text-white opacity-100"
                                :style="reasonMenuStyles[`reason${pIndex}_${rIndex}`] || { position: 'fixed', zIndex: 9999 }"
                                role="menu"
                              >
                                <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="reason.reasonOfReturn = 'Defective'; openDropdowns[`reason${pIndex}_${rIndex}`] = false">Defective</a></li>
                                <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="reason.reasonOfReturn = 'Wrong Item'; openDropdowns[`reason${pIndex}_${rIndex}`] = false">Wrong Item</a></li>
                                <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="reason.reasonOfReturn = 'Damaged'; openDropdowns[`reason${pIndex}_${rIndex}`] = false">Damaged</a></li>
                                <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="reason.reasonOfReturn = 'Expired'; openDropdowns[`reason${pIndex}_${rIndex}`] = false">Expired</a></li>
                                <li><a class="block px-4 py-2 text-sm hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 cursor-pointer" @click="reason.reasonOfReturn = 'Other'; openDropdowns[`reason${pIndex}_${rIndex}`] = false">Other</a></li>
                              </ul>
                            </teleport>

                            <!-- Other -->
                            <div>
                              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Other
                              </label>
                              <input
                                v-model="reason.other"
                                type="text"
                                class="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Specify if needed"
                              />
                            </div>
                          </div>
                        </div>

                        <!-- Add Reason Button -->
                        <button
                          type="button"
                          @click="addReasonOfReturn(pIndex)"
                          class="btn bg-brand-500 hover:bg-brand-600 text-white border-none btn-sm w-full"
                        >
                          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Add Reason of Return
                        </button>
                      </div>

                      <!-- EPC for Return (Multiple EPCs) -->
                      <div class="mt-3">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          EPCs for Return
                          <span v-if="product.availableEpcs && product.availableEpcs.length > 0" class="text-xs text-gray-500">
                            ({{ product.availableEpcs.length }} available from order)
                          </span>
                        </label>

                        <!-- Show available EPCs from order (for SO - customer returns) -->
                        <div v-if="product.availableEpcs && product.availableEpcs.length > 0" class="mb-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p class="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">
                            Available EPCs from shipped order:
                            <span class="ml-2 text-blue-600 dark:text-blue-400">
                              ✓ Only OUTBOUND EPCs (shipped to customer) can be returned
                            </span>
                          </p>
                          <div class="flex flex-wrap gap-2">
                            <button
                              v-for="epc in product.availableEpcs"
                              :key="epc.epcCode"
                              type="button"
                              @click="toggleEpcSelection(pIndex, epc.epcCode)"
                              :class="[
                                'px-2 py-1 text-xs rounded border transition-colors',
                                product.epcCodes.includes(epc.epcCode)
                                  ? 'bg-brand-500 text-white border-brand-600'
                                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-brand-500'
                              ]"
                            >
                              {{ epc.epcCode }}
                            </button>
                          </div>
                          <p class="text-xs text-gray-500 mt-2">
                            Selected: {{ product.epcCodes.length }} / {{ product.availableEpcs.length }}
                          </p>
                        </div>

                        <!-- Manual EPC input (for PO - supplier returns or if no EPCs available) -->
                        <div>
                          <p v-if="formData.returnType === 'Supplier Return' || formData.returnType === 'Supplier'" class="text-xs text-blue-500 mb-2">
                            ✓ Only INBOUND EPCs (in warehouse) can be returned to supplier
                          </p>
                          <div class="flex gap-2">
                            <input
                              v-model="newEpcInput[pIndex]"
                              type="text"
                              class="input input-bordered flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              placeholder="Enter or scan EPC manually"
                              @keyup.enter="addManualEpc(pIndex)"
                            />
                            <button
                              type="button"
                              @click="addManualEpc(pIndex)"
                              class="btn bg-brand-500 hover:bg-brand-600 text-white border-none btn-sm"
                            >
                              Add
                            </button>
                          </div>

                          <!-- Display manually added EPCs -->
                          <div v-if="product.epcCodes.length > 0 && (!product.availableEpcs || product.availableEpcs.length === 0)" class="mt-2 flex flex-wrap gap-2">
                            <span
                              v-for="(epc, eIdx) in product.epcCodes"
                              :key="eIdx"
                              class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded"
                            >
                              {{ epc }}
                              <button
                                type="button"
                                @click="removeEpc(pIndex, eIdx)"
                                class="text-red-500 hover:text-red-700"
                              >
                                ✕
                              </button>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Add Product Button -->
                    <button
                      type="button"
                      @click="addProduct"
                      :disabled="availableProducts.length === 0"
                      class="btn bg-brand-500 hover:bg-brand-600 text-white border-none btn-sm w-full"
                      :class="{ 'opacity-50 cursor-not-allowed': availableProducts.length === 0 }"
                    >
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Add Product
                    </button>
                  </div>
                </div>
              </div>

              <!-- Footer with Navigation -->
              <div class="flex items-center justify-between p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  v-if="currentStep > 1"
                  @click="previousStep"
                  :disabled="isSubmitting"
                  class="btn btn-outline"
                >
                  Back
                </button>
                <div v-else></div>

                <div class="flex gap-2">
                  <button
                    @click="closeModal"
                    :disabled="isSubmitting"
                    class="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    v-if="currentStep < totalSteps"
                    @click="nextStep"
                    class="btn bg-brand-500 hover:bg-brand-600 text-white border-none"
                  >
                    Next
                  </button>
                  <button
                    v-else
                    @click="submitForm"
                    :disabled="isSubmitting"
                    class="btn bg-brand-500 hover:bg-blue-600 text-white border-none"
                  >
                    <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
                    {{ isSubmitting ? 'Saving...' : 'Save' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onBeforeUnmount, computed, watch } from 'vue'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.css'
import authenticatedFetch from '@/utils/authenticatedFetch'

interface Product {
  productId: number
  productName: string
  skuCode: string
  maxQuantity: number
  reasons: Array<{
    quantity: number
    reasonOfReturn: string
    other: string
  }>
  epcCodes: string[]  // Array of EPCs instead of single string
  availableEpcs?: Array<{
    epcCode: string
    warehouseCode: string
    locationCode: string
  }>
}

interface Order {
  id: number
  orderType: string
  orderNo: string
  status: string
  customer: {
    id: number
    customerName: string
  } | null
  supplier: {
    id: number
    supplierName: string
  } | null
  orderItems: Array<{
    id: number
    productId: number
    quantity: number
    product: {
      id: number
      name: string
      skuCode: string
    }
    allocatedEpcs?: Array<{
      epcCode: string
      warehouseCode: string
      locationCode: string
    }>
    orderItemEpcs?: Array<{
      epcCode: string
    }>
  }>
  receivings?: Array<{
    id: number
    receivingCode: string
    warehouse?: {
      id: number
      name?: string
      warehouseCode?: string
    }
  }>
}

const emit = defineEmits(['return-created', 'close'])

const isOpen = ref(false)
const isSubmitting = ref(false)
const currentStep = ref(1)
const totalSteps = 2

// Order search state
const loadingOrders = ref(false)
const allOrders = ref<Order[]>([])
const showReferenceDropdown = ref(false)
const referenceDropdownRef = ref<HTMLElement | null>(null)

const steps = [
  { id: 1, name: 'Return' },
  { id: 2, name: 'Product' },
]

// Computed filtered orders - filter based on search term only (status already filtered in fetchOrders)
const filteredOrders = computed(() => {
  if (!formData.referenceNumber) return allOrders.value

  const searchTerm = formData.referenceNumber.toLowerCase()
  return allOrders.value.filter(order =>
    order.orderNo.toLowerCase().includes(searchTerm) ||
    order.customer?.customerName?.toLowerCase().includes(searchTerm) ||
    order.supplier?.supplierName?.toLowerCase().includes(searchTerm)
  )
})

// Get selected order
const selectedOrder = computed(() => {
  return allOrders.value.find(order => order.orderNo === formData.referenceNumber)
})

// Get available products from selected order (excluding already selected)
const availableProducts = computed(() => {
  if (!selectedOrder.value) return []

  const selectedProductIds = formData.products.map(p => p.productId)
  return selectedOrder.value.orderItems
    .filter(item => !selectedProductIds.includes(item.productId))
    .map(item => {
      // For SO (Customer Return): Get EPCs from orderItemEpcs (allocated EPCs)
      // For PO (Supplier Return): Get EPCs from receiving items
      let epcs: Array<{ epcCode: string; warehouseCode?: string; locationCode?: string }> = []

      if (selectedOrder.value?.orderType === 'SO' && item.orderItemEpcs) {
        // Customer return - EPCs were allocated to this SO
        epcs = item.orderItemEpcs.map(e => ({
          epcCode: e.epcCode,
          warehouseCode: '',
          locationCode: ''
        }))
      } else if (selectedOrder.value?.orderType === 'PO' && item.allocatedEpcs) {
        // Supplier return - EPCs from receiving
        epcs = item.allocatedEpcs
      }

      return {
        id: item.product.id,
        name: item.product.name,
        skuCode: item.product.skuCode,
        maxQuantity: item.quantity,
        allocatedEpcs: epcs
      }
    })
})

const formData = reactive({
  returnNumber: '',
  returnType: '',
  referenceNumber: '',
  returnDate: new Date().toISOString().split('T')[0],
  from: '',
  to: '',
  personInCharge: '',
  remarks: '',
  products: [
    {
      productId: 0,
      productName: '',
      skuCode: '',
      maxQuantity: 0,
      reasons: [{ quantity: 1, reasonOfReturn: '', other: '' }],
      epcCodes: [],
      availableEpcs: []
    }
  ] as Product[]
})

const errors = reactive<Record<string, string>>({})
const returnDateInput = ref<HTMLInputElement | null>(null)
const returnTypeDropdownRef = ref<any>(null)
const productDropdownRefs = ref<any>({})
let flatpickrReturnDate: any = null

const openDropdowns = reactive<Record<string, boolean>>({})
const returnTypeMenuStyle = ref<any>({})
const productMenuStyles = ref<Record<number, any>>({})
const reasonMenuStyles = ref<Record<string, any>>({})

// EPC input tracking
const newEpcInput = ref<Record<number, string>>({})

const lockScroll = () => {
  document.body.style.overflow = 'hidden'
}

const unlockScroll = () => {
  document.body.style.overflow = ''
}

const openModal = () => {
  isOpen.value = true
  currentStep.value = 1
  resetForm()
  lockScroll()
  initializeFlatpickr()
  fetchOrders() // Fetch orders when modal opens

  // Add event listeners
  nextTick(() => {
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('resize', repositionOpenMenus)
    window.addEventListener('scroll', repositionOpenMenus, true)
  })
}

const closeModal = () => {
  if (isSubmitting.value) return

  // Destroy Flatpickr instance
  if (flatpickrReturnDate) {
    flatpickrReturnDate.destroy()
    flatpickrReturnDate = null
  }

  // Remove event listeners
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', repositionOpenMenus)
  window.removeEventListener('scroll', repositionOpenMenus, true)

  isOpen.value = false
  showReferenceDropdown.value = false
  unlockScroll()
  emit('close')
}

const resetForm = () => {
  formData.returnNumber = ''
  formData.returnType = ''
  formData.referenceNumber = ''
  formData.returnDate = new Date().toISOString().split('T')[0]
  formData.from = ''
  formData.to = ''
  formData.personInCharge = ''
  formData.remarks = ''
  formData.products = [
    { productId: 0, productName: '', skuCode: '', maxQuantity: 0, reasons: [{ quantity: 1, reasonOfReturn: '', other: '' }], epcCodes: [] }
  ]

  Object.keys(errors).forEach((key) => delete errors[key])
  Object.keys(openDropdowns).forEach((key) => delete openDropdowns[key])
  showReferenceDropdown.value = false
  newEpcInput.value = {}
}

// Fetch orders from API with full details
const fetchOrders = async () => {
  loadingOrders.value = true
  try {
    const response = await authenticatedFetch('/api/order')
    if (response.ok) {
      const data = await response.json()

      console.log('🔍 All orders from API:', data)
      console.log('🔍 Return Type:', formData.returnType)

      // Filter orders based on return type:
      // - Customer Return: SO orders that are Shipped/Delivered
      // - Supplier Return: PO orders that have receivings (PROCESSING, RECEIVED, or CLOSED)
      allOrders.value = data.filter((order: Order) => {
        if (formData.returnType === 'Customer' || formData.returnType === 'Customer Return') {
          // Show SO orders that have been shipped
          return order.orderType === 'SO' &&
                 (order.status === 'SHIPPED' || order.status === 'DELIVERED')
        } else if (formData.returnType === 'Supplier' || formData.returnType === 'Supplier Return') {
          // Show PO orders that have receivings (items were received into warehouse)
          // Include PROCESSING (receiving in progress), RECEIVED (fully received), or CLOSED
          const isValidPO = order.orderType === 'PO' &&
                 (order.status === 'PROCESSING' || order.status === 'RECEIVED' || order.status === 'CLOSED') &&
                 order.receivings && order.receivings.length > 0

          // Debug each PO order
          if (order.orderType === 'PO') {
            console.log(`📦 PO Order: ${order.orderNo}`, {
              status: order.status,
              hasReceivings: !!order.receivings,
              receivingsCount: order.receivings?.length || 0,
              receivings: order.receivings,
              isValidPO
            })
          }

          return isValidPO
        }
        // If no return type selected yet, show all completed orders
        return (order.orderType === 'SO' && (order.status === 'SHIPPED' || order.status === 'DELIVERED')) ||
               (order.orderType === 'PO' && (order.status === 'PROCESSING' || order.status === 'RECEIVED' || order.status === 'CLOSED'))
      })

      console.log('✅ Filtered orders:', allOrders.value)
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
  } finally {
    loadingOrders.value = false
  }
}

// Fetch detailed order data with EPCs when order is selected
const fetchOrderDetails = async (orderId: number) => {
  try {
    const response = await authenticatedFetch(`/api/order/${orderId}`)
    if (response.ok) {
      const orderDetails = await response.json()
      // Update the selected order in allOrders with full details
      const index = allOrders.value.findIndex(o => o.id === orderId)
      if (index !== -1) {
        allOrders.value[index] = orderDetails
      }
    }
  } catch (error) {
    console.error('Error fetching order details:', error)
  }
}

// Handle reference number search
const handleReferenceSearch = () => {
  showReferenceDropdown.value = true
}

// Toggle reference dropdown
const toggleReferenceDropdown = () => {
  showReferenceDropdown.value = !showReferenceDropdown.value
  if (showReferenceDropdown.value && allOrders.value.length === 0) {
    fetchOrders()
  }
}

// Select order from dropdown
const selectReferenceOrder = async (order: Order) => {
  formData.referenceNumber = order.orderNo
  showReferenceDropdown.value = false

  // Fetch full order details with EPCs
  await fetchOrderDetails(order.id)

  // For SUPPLIER returns: fetch INBOUND EPCs from receiving
  if ((formData.returnType === 'Supplier' || formData.returnType === 'Supplier Return') &&
      order.receivings && order.receivings.length > 0) {
    const receiving = order.receivings[0]
    console.log('🔍 Fetching INBOUND EPCs for receiving:', receiving.id)

    try {
      const epcResponse = await authenticatedFetch(`/api/epc/by-receiving/${receiving.id}?status=INBOUND`)
      if (epcResponse.ok) {
        const epcs = await epcResponse.json()
        console.log('✅ INBOUND EPCs:', epcs)

        // Group EPCs by product and update order items
        const index = allOrders.value.findIndex(o => o.id === order.id)
        if (index !== -1) {
          allOrders.value[index].orderItems.forEach((item: any) => {
            const productEpcs = epcs.filter((epc: any) => epc.productId === item.product.id)
            item.allocatedEpcs = productEpcs.map((epc: any) => ({
              epcCode: epc.epcCode,
              warehouseCode: epc.warehouse?.warehouseCode || '',
              locationCode: epc.location?.locationCode || ''
            }))
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch INBOUND EPCs:', error)
    }
  }

  // Auto-fill from and to based on order type
  if (order.orderType === 'PO' && order.supplier) {
    // For Purchase Order (Supplier return): From Warehouse -> To Supplier
    // Get warehouse name from receivings if available
    let warehouseName = 'Warehouse'
    if (order.receivings && order.receivings.length > 0) {
      const receiving = order.receivings[0]
      if (receiving.warehouse) {
        warehouseName = receiving.warehouse.name || receiving.warehouse.warehouseCode || 'Warehouse'
      }
    }
    formData.from = warehouseName
    formData.to = `Supplier - ${order.supplier.supplierName}`
    formData.returnType = 'Supplier'
  } else if (order.orderType === 'SO' && order.customer) {
    // For Sales Order (Customer return): From Customer -> To Warehouse
    formData.from = `Customer - ${order.customer.customerName}`
    formData.to = 'Warehouse'
    formData.returnType = 'Customer'
  }

  // Reset products when changing order
  formData.products = [
    { productId: 0, productName: '', skuCode: '', maxQuantity: 0, reasons: [{ quantity: 1, reasonOfReturn: '', other: '' }], epcCodes: [], availableEpcs: [] }
  ]
}

const validateStep = (step: number): boolean => {
  Object.keys(errors).forEach((key) => delete errors[key])

  console.log('🔍 Validating step:', step)
  console.log('📋 Form data:', formData)

  if (step === 1) {
    if (!formData.returnType) errors.returnType = 'Return type is required'
    if (!formData.referenceNumber.trim()) errors.referenceNumber = 'Reference number is required'
  } else if (step === 2) {
    formData.products.forEach((product, idx) => {
      console.log(`Checking product ${idx}:`, product)

      if (!product.productName) {
        errors[`product${idx}Name`] = 'Product name is required'
      }

      product.reasons.forEach((reason, rIdx) => {
        console.log(`  Reason ${rIdx}:`, reason)

        if (!reason.quantity || reason.quantity < 1) {
          errors[`product${idx}Reason${rIdx}Quantity`] = 'Quantity must be at least 1'
        }

        // Check if reasonOfReturn is set and not empty
        if (!reason.reasonOfReturn || reason.reasonOfReturn.trim() === '') {
          errors[`product${idx}Reason${rIdx}Type`] = 'Reason is required'
        }
      })
    })
  }

  const isValid = Object.keys(errors).length === 0
  console.log('✅ Validation result:', isValid)
  if (!isValid) {
    console.log('❌ Validation errors:', errors)
  }

  return isValid
}

const nextStep = () => {
  if (!validateStep(currentStep.value)) return
  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const addProduct = () => {
  if (availableProducts.value.length > 0) {
    formData.products.push({
      productId: 0,
      productName: '',
      skuCode: '',
      maxQuantity: 0,
      reasons: [{ quantity: 1, reasonOfReturn: '', other: '' }],
      epcCodes: []
    })
  }
}

const removeProduct = (index: number) => {
  if (formData.products.length > 1) {
    formData.products.splice(index, 1)
  }
}

const addReasonOfReturn = (productIndex: number) => {
  formData.products[productIndex].reasons.push({
    quantity: 1,
    reasonOfReturn: '',
    other: ''
  })
}

const removeReason = (productIndex: number, reasonIndex: number) => {
  if (formData.products[productIndex].reasons.length > 1) {
    formData.products[productIndex].reasons.splice(reasonIndex, 1)
  }
}

const selectProduct = (productIndex: number, product: any) => {
  formData.products[productIndex].productId = product.id
  formData.products[productIndex].productName = product.name
  formData.products[productIndex].skuCode = product.skuCode || ''
  formData.products[productIndex].maxQuantity = product.maxQuantity || 0
  formData.products[productIndex].availableEpcs = product.allocatedEpcs || []

  openDropdowns[`product${productIndex}`] = false
}

const toggleProductDropdown = async (productIndex: number) => {
  const key = `product${productIndex}`
  Object.keys(openDropdowns).forEach(k => {
    if (k !== key) openDropdowns[k] = false
  })
  openDropdowns[key] = !openDropdowns[key]

  if (openDropdowns[key]) {
    await positionProductMenu(productIndex)
  }
}

/* Initialize Flatpickr for date input */
const initializeFlatpickr = async () => {
  await nextTick()

  // Destroy existing instance if any
  if (flatpickrReturnDate) {
    flatpickrReturnDate.destroy()
    flatpickrReturnDate = null
  }

  // Initialize return date picker
  if (returnDateInput.value) {
    flatpickrReturnDate = flatpickr(returnDateInput.value, {
      dateFormat: 'Y-m-d',
      defaultDate: formData.returnDate || new Date(),
      onChange: (selectedDates: Date[]) => {
        if (selectedDates && selectedDates[0]) {
          formData.returnDate = selectedDates[0].toISOString().split('T')[0]
        }
      }
    })
  }
}

const toggleDropdown = async (name: string) => {
  Object.keys(openDropdowns).forEach(k => {
    if (k !== name) openDropdowns[k] = false
  })
  openDropdowns[name] = !openDropdowns[name]

  // If opening return type dropdown, compute its fixed-position style
  if (name === 'returnType' && openDropdowns[name]) {
    await positionReturnTypeMenu()
  }

  // If opening reason dropdown, compute its position
  if (name.startsWith('reason') && openDropdowns[name]) {
    await positionReasonMenu(name)
  }
}

const selectReturnType = (type: string) => {
  formData.returnType = type
  openDropdowns.returnType = false
}

/* Position return type dropdown menu */
const positionReturnTypeMenu = async () => {
  await nextTick()
  const container = returnTypeDropdownRef.value
  if (!container) return

  const btn = container.querySelector('button')
  if (!btn) return

  const rect = btn.getBoundingClientRect()
  const maxMenuHeight = 300
  const gap = 8
  const belowSpace = window.innerHeight - rect.bottom - gap
  const aboveSpace = rect.top - gap

  const style: any = {
    position: 'fixed',
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: '9999',
    overflowY: 'auto',
    overflowX: 'hidden'
  }

  if (belowSpace >= 150) {
    style.top = `${rect.bottom + gap}px`
    style.maxHeight = `${Math.min(maxMenuHeight, belowSpace)}px`
  } else {
    const usedHeight = Math.min(maxMenuHeight, aboveSpace)
    style.top = `${rect.top - usedHeight - gap}px`
    style.maxHeight = `${usedHeight}px`
  }

  returnTypeMenuStyle.value = style
}

/* Position product dropdown menu */
const positionProductMenu = async (productIndex: number) => {
  await nextTick()
  const container = productDropdownRefs.value[productIndex]
  if (!container) return

  const btn = container.querySelector('button')
  if (!btn) return

  const rect = btn.getBoundingClientRect()
  const maxMenuHeight = 300
  const gap = 8
  const belowSpace = window.innerHeight - rect.bottom - gap
  const aboveSpace = rect.top - gap

  const style: any = {
    position: 'fixed',
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: '9999',
    overflowY: 'auto',
    overflowX: 'hidden'
  }

  if (belowSpace >= 150) {
    style.top = `${rect.bottom + gap}px`
    style.maxHeight = `${Math.min(maxMenuHeight, belowSpace)}px`
  } else {
    const usedHeight = Math.min(maxMenuHeight, aboveSpace)
    style.top = `${rect.top - usedHeight - gap}px`
    style.maxHeight = `${usedHeight}px`
  }

  productMenuStyles.value[productIndex] = style
}

/* Position reason dropdown menu */
const positionReasonMenu = async (key: string) => {
  await nextTick()
  // Find the button by searching for the dropdown with the matching key
  const buttons = document.querySelectorAll('.dropdown button')
  let targetBtn: Element | null = null

  for (const btn of buttons) {
    if (btn.getAttribute('aria-expanded') === 'true') {
      const parent = btn.closest('.dropdown')
      if (parent) {
        targetBtn = btn
        break
      }
    }
  }

  if (!targetBtn) return

  const rect = targetBtn.getBoundingClientRect()
  const maxMenuHeight = 250
  const gap = 8
  const belowSpace = window.innerHeight - rect.bottom - gap
  const aboveSpace = rect.top - gap

  const style: any = {
    position: 'fixed',
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: '9999',
    overflowY: 'auto',
    overflowX: 'hidden'
  }

  if (belowSpace >= 100) {
    style.top = `${rect.bottom + gap}px`
    style.maxHeight = `${Math.min(maxMenuHeight, belowSpace)}px`
  } else {
    const usedHeight = Math.min(maxMenuHeight, aboveSpace)
    style.top = `${rect.top - usedHeight - gap}px`
    style.maxHeight = `${usedHeight}px`
  }

  reasonMenuStyles.value[key] = style
}

const repositionOpenMenus = () => {
  if (openDropdowns.returnType) {
    positionReturnTypeMenu()
  }
  // Reposition product dropdowns
  Object.keys(openDropdowns).forEach(key => {
    if (key.startsWith('product') && openDropdowns[key]) {
      const index = parseInt(key.replace('product', ''))
      positionProductMenu(index)
    }
    if (key.startsWith('reason') && openDropdowns[key]) {
      positionReasonMenu(key)
    }
  })
}

// EPC Selection Handlers
const toggleEpcSelection = (productIndex: number, epcCode: string) => {
  const product = formData.products[productIndex]
  const index = product.epcCodes.indexOf(epcCode)

  if (index > -1) {
    product.epcCodes.splice(index, 1) // Remove if already selected
  } else {
    product.epcCodes.push(epcCode) // Add if not selected
  }

  // Auto-update quantity to match number of selected EPCs
  if (product.reasons && product.reasons[0]) {
    product.reasons[0].quantity = product.epcCodes.length || 1
  }
}

const addManualEpc = (productIndex: number) => {
  const epcCode = newEpcInput.value[productIndex]?.trim()
  if (!epcCode) return

  const product = formData.products[productIndex]
  if (!product.epcCodes.includes(epcCode)) {
    product.epcCodes.push(epcCode)

    // Auto-update quantity to match number of selected EPCs
    if (product.reasons && product.reasons[0]) {
      product.reasons[0].quantity = product.epcCodes.length
    }
  }

  newEpcInput.value[productIndex] = '' // Clear input
}

const removeEpc = (productIndex: number, epcIndex: number) => {
  formData.products[productIndex].epcCodes.splice(epcIndex, 1)

  // Auto-update quantity to match number of selected EPCs
  const product = formData.products[productIndex]
  if (product.reasons && product.reasons[0]) {
    product.reasons[0].quantity = product.epcCodes.length || 1
  }
}

// Validate quantity doesn't exceed max available
const validateQuantity = (productIndex: number, reasonIndex: number) => {
  const product = formData.products[productIndex]
  const reason = product.reasons[reasonIndex]

  if (product.maxQuantity && reason.quantity > product.maxQuantity) {
    reason.quantity = product.maxQuantity
    errors[`product${productIndex}Reason${reasonIndex}Quantity`] = `Cannot exceed ${product.maxQuantity}`

    setTimeout(() => {
      delete errors[`product${productIndex}Reason${reasonIndex}Quantity`]
    }, 3000)
  }
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node

  // Check if click is on any dropdown menu items (teleported)
  const dropdownMenus = document.querySelectorAll('.dropdown-menu')
  for (const menu of dropdownMenus) {
    if (menu.contains(target)) {
      return // Don't close if clicking inside any menu
    }
  }

  // Check if click is on reference dropdown
  if (referenceDropdownRef.value && referenceDropdownRef.value.contains(target)) {
    return // Don't close if clicking inside reference dropdown
  }

  // Check if click is on return type dropdown
  if (returnTypeDropdownRef.value && returnTypeDropdownRef.value.contains(target)) {
    return
  }

  // Check if click is on any product dropdown
  for (const key in productDropdownRefs.value) {
    if (productDropdownRefs.value[key] && productDropdownRefs.value[key].contains(target)) {
      return
    }
  }

  // Close all dropdowns if clicked outside
  Object.keys(openDropdowns).forEach(key => {
    openDropdowns[key] = false
  })
  showReferenceDropdown.value = false
}

const submitForm = async () => {
  if (!validateStep(currentStep.value)) return

  isSubmitting.value = true

  try {
    // Map form data to backend API structure
    const returnType = formData.returnType === 'Customer' ? 'CUSTOMER_RETURN' : 'SUPPLIER_RETURN'

    // Find the selected order to get IDs
    const selectedOrderData = allOrders.value.find(o => o.orderNo === formData.referenceNumber)
    if (!selectedOrderData) {
      throw new Error('Selected order not found')
    }

    // For CUSTOMER_RETURN: Must have orderId and customerId
    // For SUPPLIER_RETURN: Must have orderId, receivingId, and supplierId
    let receivingId = null
    if (returnType === 'SUPPLIER_RETURN') {
      if (!selectedOrderData.receivings || selectedOrderData.receivings.length === 0) {
        throw new Error('No receiving record found for this PO. Cannot create supplier return.')
      }
      // Take the first receiving record (or you could let user select if multiple)
      receivingId = selectedOrderData.receivings[0].id
    }

    // Map products and reasons to returnItems
    // Each product can have multiple reasons with different quantities
    const returnItems: Array<{
      productId: number
      epcCode: string | null
      quantity: number
      condition: string
      conditionNotes: string
    }> = []

    formData.products.forEach(product => {
      // If EPCs are specified, create one item per EPC
      if (product.epcCodes && product.epcCodes.length > 0) {
        product.epcCodes.forEach(epcCode => {
          returnItems.push({
            productId: product.productId,
            epcCode: epcCode,
            quantity: 1,  // Each EPC represents 1 item
            condition: mapReasonToCondition(product.reasons[0]?.reasonOfReturn || 'Good'),
            conditionNotes: product.reasons[0]?.other || product.reasons[0]?.reasonOfReturn || ''
          })
        })
      } else {
        // No EPCs specified, use reason quantities (for non-serialized items)
        product.reasons.forEach(reason => {
          returnItems.push({
            productId: product.productId,
            epcCode: null,
            quantity: reason.quantity,
            condition: mapReasonToCondition(reason.reasonOfReturn),
            conditionNotes: reason.other || reason.reasonOfReturn
          })
        })
      }
    })

    // Validate returnItems
    if (returnItems.length === 0) {
      throw new Error('Please add at least one product to return')
    }

    const payload = {
      returnType,
      orderId: selectedOrderData.id, // Always include orderId (for both SO and PO)
      receivingId: receivingId,      // Only for PO (supplier return)
      customerId: returnType === 'CUSTOMER_RETURN' ? selectedOrderData.customer?.id : null,
      supplierId: returnType === 'SUPPLIER_RETURN' ? selectedOrderData.supplier?.id : null,
      warehouseId: null,             // Optional - can be set during return receiving
      locationId: null,              // Optional
      requestedDate: formData.returnDate,
      reason: formData.remarks || 'Return request',
      notes: formData.personInCharge ? `Created by: ${formData.personInCharge}. ${formData.remarks || ''}` : formData.remarks,
      status: 'PENDING_APPROVAL',
      returnItems
    }

    console.log('Submitting return payload:', payload)

    const response = await authenticatedFetch('/api/return', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to create return')
    }

    const result = await response.json()

    emit('return-created', {
      success: true,
      data: { returnNo: result.returnCode, ...result }
    })

    // Allow programmatic close even if isSubmitting was true
    isSubmitting.value = false
    closeModal()
    return
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create return'
    console.error('Return creation error:', error)
    emit('return-created', {
      success: false,
      error: message
    })
  } finally {
    isSubmitting.value = false
  }
}

// Helper function to map reason to condition enum
const mapReasonToCondition = (reason: string): string => {
  const mapping: Record<string, string> = {
    'Defective': 'DEFECTIVE',
    'Damaged': 'DAMAGED',
    'Wrong Item': 'WRONG_ITEM',
    'Expired': 'DEFECTIVE',
    'Other': 'GOOD'
  }
  return mapping[reason] || 'GOOD'
}

// Watch for return type changes to refetch appropriate orders
watch(() => formData.returnType, (newType) => {
  if (newType && allOrders.value.length > 0) {
    // Refetch orders when return type changes to filter correctly
    fetchOrders()
  }
})

defineExpose({
  openModal,
  closeModal,
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', repositionOpenMenus)
  window.removeEventListener('scroll', repositionOpenMenus, true)

  // Clean up Flatpickr instance
  if (flatpickrReturnDate) {
    flatpickrReturnDate.destroy()
    flatpickrReturnDate = null
  }

  if (isOpen.value) unlockScroll()
})
</script>

