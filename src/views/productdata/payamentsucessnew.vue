<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div v-if="order" class="bg-white rounded-3xl shadow-xl max-w-2xl w-full p-8 md:p-12 text-center border border-slate-100">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full mb-6">
        <i class="pi pi-check text-2xl font-bold"></i>
      </div>

      <h1 class="text-3xl font-bold text-slate-800 mb-2">Thank you for your purchase</h1>
      <p class="text-slate-500 mb-1">We've received your order and it will ship in 5-7 business days.</p>
      <p class="text-slate-600 font-medium mb-8">Your Transaction id is <span class="text-indigo-600">#{{ transactionId }}</span></p>

      <div class="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
        <h2 class="text-lg font-bold text-slate-800 mb-4">Order Summary</h2>
        <div v-for="item in order.order_products" :key="item.id" class="flex justify-between mb-2">
          <p>{{ item.product.name }} x {{ item.quantity }}</p>
          <p>₹{{ item.price - (item.discount_price || 0) }}</p>
        </div>
        <div class="mt-4 flex justify-between font-bold">
          <span>Total</span>
          <span>₹{{ order.amount }}</span>
        </div>
      </div>

      <router-link to="/products-all" class="inline-block bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800">
        Back to Home
      </router-link>

      <!-- Hidden invoice for PDF -->
      <InvoiceTemplate v-if="order" :order="order" ref="invoiceContent" />
    </div>

    <div v-else class="text-center">
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

      // Check if the invoice element is available
      if (invoiceContent.value?.$el) {
        console.log('Sending PDF for order', order.value.id);
        await ReceiptService.send(order.value.id, invoiceContent.value.$el);
      } else {
        console.warn('Invoice content not found');
      }
    }
  } catch (error) {
    console.error('Verification failed', error);
  }
});
</script>