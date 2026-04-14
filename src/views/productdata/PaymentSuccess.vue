<template>
  <div class="min-h-screen bg-slate-50 p-4 flex flex-col items-center">
  <div v-if="order" class="bg-white rounded-3xl shadow-xl w-full max-w-3xl p-8 md:p-12 text-center border border-slate-100">
    <!-- Success Icon -->
    <div class="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full mb-6 mx-auto">
      <i class="pi pi-check text-2xl font-bold"></i>
    </div>

    <h1 class="text-3xl font-bold text-slate-800 mb-2">Thank you for your purchase</h1>
    <p class="text-slate-500 mb-1">We've received your order and it will ship in 5-7 business days.</p>
    <p class="text-slate-600 font-medium mb-8">Your Transaction id is <span class="text-indigo-600">#{{ transactionId }}</span></p>

    <!-- Order Summary -->
    <div class="bg-slate-50 rounded-2xl p-6 text-left mb-8 border border-slate-100 w-full">
      <h2 class="text-lg font-bold text-slate-800 mb-4">Order Summary</h2>
      
      <div class="space-y-4 max-h-60 overflow-y-auto pr-2">
        <div v-for="item in order.order_products" :key="item.id" class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-white rounded-lg border border-slate-200 overflow-hidden flex-shrink-0">
              <img 
                :src="`http://127.0.0.1:8000/storage/${item.product.images[0].image}`" 
                class="w-full h-full object-cover" 
              />
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-700 truncate w-48 md:w-64">{{ item.product.name }}</p>
              <p class="text-xs text-slate-400 italic">Qty: {{ item.quantity }}</p>
            </div>
          </div>
          <span class="text-sm font-bold text-slate-700">₹{{ item.price }}</span>
        </div>
      </div>

      <div class="border-t border-slate-200 mt-4 pt-4 flex justify-between items-center">
        <span class="text-slate-800 font-bold">Total</span>
        <span class="text-xl font-black text-slate-900">₹{{ order.amount }}</span>
      </div>
    </div>

    <router-link to="/products-all" class="inline-block bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800">
      Back to Home
    </router-link>

    <InvoiceTemplate v-if="order" :order="order" ref="invoiceContent" />
  </div>

  <div v-else class="text-center mt-20">
    <i class="pi pi-spin pi-spinner text-4xl text-indigo-500 mb-4"></i>
    <p class="text-slate-500 font-medium">Verifying your payment...</p>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import InvoiceTemplate from '@/components/InvoiceData.vue';
import ReceiptService from '@/services/ReceiptService.js';

const route = useRoute();
const order = ref(null);
const transactionId = ref(null);
const invoiceContent = ref(null);

onMounted(async () => {
  const sessionId = route.query.session_id;
  if (!sessionId) return;

  try {
    const response = await axios.get(`http://localhost:8000/api/success?session_id=${sessionId}`);
    console.log('API response', response.data);

    if (response.data.order) {
      order.value = response.data.order;
      transactionId.value = response.data.transaction_id;

      await nextTick();
      const invoiceEl = invoiceContent.value?.$el; // get the DOM element
      if (!invoiceEl) {
        console.warn('Invoice DOM element not found');
        return;
      }
      const images = invoiceEl.querySelectorAll('img');
      await Promise.all(Array.from(images).map(img => new Promise(resolve => {
        if (img.complete) resolve();
        else img.onload = img.onerror = resolve;
      })));
      await ReceiptService.download(order.value.id, invoiceEl);
      if (invoiceEl) {
        console.log('Sending PDF for order', order.value.id);
        await ReceiptService.send(order.value.id, invoiceEl);
      } else {
        console.warn('Invoice content not found');
      }
    }
  } catch (error) {
    console.error('Verification failed', error);
  }
});
</script>