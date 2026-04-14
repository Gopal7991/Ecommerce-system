<!-- <template>
  <div
    ref="invoiceContent"
    class="bg-white mx-auto p-6"
    style="width:190mm; max-width:190mm; overflow:hidden;"
  >
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <h1 style="font-size:24px; font-weight:bold; color:#1e293b;">Invoice #{{ order.id }}</h1>
      <span style="font-size:18px; font-weight:bold; color:#2563eb;">₹{{ order.amount }}</span>
    </div>

    <div style="margin-bottom:16px;">
      <p style="color:#1e293b;"><strong>Customer:</strong> {{ order.customer_name || 'N/A' }}</p>
      <p style="color:#1e293b;"><strong>Address:</strong> {{ order.city }}, {{ order.state }}</p>
    </div>

    <table class="w-full table-fixed border-collapse text-sm">
      <thead>
        <tr style="background-color:#f3f4f6;">
          <th style="border:1px solid #cbd5e1; padding:8px; color:#1e293b;">Product</th>
          <th style="border:1px solid #cbd5e1; padding:8px; color:#1e293b;">Qty</th>
          <th style="border:1px solid #cbd5e1; padding:8px; color:#1e293b;">Price</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in order.order_products" :key="index">
          <td style="border:1px solid #cbd5e1; padding:8px; color:#1e293b;">{{ item.product?.name }}</td>
          <td style="border:1px solid #cbd5e1; padding:8px; color:#1e293b;">{{ item.quantity }}</td>
          <td style="border:1px solid #cbd5e1; padding:8px; color:#1e293b;">₹{{ item.price - item.discount_price }}</td>
        </tr>
      </tbody>
    </table>

    <div style="display:flex; justify-content:flex-end; margin-top:16px;">
      <p style="font-weight:bold; font-size:18px; color:#2563eb;">Total: ₹{{ order.amount }}</p>
    </div>
  </div>
</template> -->


<template>
  <div ref="invoiceContent" style="width: 190mm; background:#fff; color:#1e293b; font-family:Arial,sans-serif; padding:20px;">
    
    <h2 style="font-size:24px; font-weight:bold; margin-bottom:10px;">Order Summary</h2>
    <p style="margin-bottom:20px; color:#4b5563;">Your purchase was successful. Here's a summary of your order.</p>

    <div style="display:flex; gap:10px; margin-bottom:20px;">
      <div style="flex:1; border:1px solid #d1d5db; padding:10px;">
        <strong>Billing</strong>
        <p>{{ order.customer_name }}</p>
        <p>{{ order.city }}, {{ order.state }}</p>
      </div>
      <!-- <div style="flex:1; border:1px solid #d1d5db; padding:10px;">
        <strong>Shipping</strong>
        <p>{{ order.customer_name }}</p>
        <p>{{ order.city }}, {{ order.state }}</p>
      </div> -->
      <div style="flex:1; border:1px solid #d1d5db; padding:10px;">
        <strong>Payment</strong>
        <p>Online</p>
        <p>Total: ₹{{ order.amount }}</p>
      </div>
    </div>
    <div style="display:flex; gap:10px; margin-bottom:20px;">
      <div style="flex:1; border:1px solid #d1d5db; padding:10px;">
        <strong>Date : {{ formatDate(order.created_at) }}</strong>
        <strong v-if="order.coupon" style="float:right" >Applied Coupon: {{ order.coupon.code }}</strong>
      </div>
    </div>
    <div style="width: 100%; font-family: sans-serif; border-top: 1px solid #e5e7eb; padding-top: 20px;">
      <div 
        v-for="(item, index) in order.order_products" 
        :key="index" 
        style="display: flex; align-items: center; padding: 16px 0; border-bottom: 1px solid #f3f4f6;"
      >
        <div style="width: 80px; height: 80px; background: #f9fafb; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0;">
          <!-- <img 
            :src="item.product?.image_url || 'https://placeholder.com'" 
            style="max-width: 100%; max-height: 100%; object-fit: contain;"
          /> -->
          <!-- <img 
            v-if="item.product?.images?.length > 0"
            ::src="`http://127.0.0.1:8000/storage/${item.product.images[0].image}`" 
            alt="Product Image"
            style="max-width: 100%; max-height: 100%; object-fit: cover;"
            @error="(e) => e.target.src = 'https://placehold.co'"
          /> -->
<img 
  v-if="item.product?.images?.length && item.product.images[0].base64"
  :src="item.product.images[0].base64"
  style="max-width:100%; max-height:100%;"
/>
<img 
  v-else 
  src="https://placehold.co"
  style="max-width:100%; max-height:100%;"
/>
        </div>

        <div style="flex: 1; margin-left: 20px;">
          <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #1f2937; line-height: 1.4;">
            {{ item.product?.name }}
          </h4>
          <p style="margin: 4px 0 0; font-size: 12px; color: #6b7280;">
            SKU: {{ item.product?.sku || 'N/A' }}
          </p>
        </div>

        <div style="padding: 0 20px; font-size: 14px; color: #4b5563; font-weight: 500;">
          x {{ item.quantity }}
        </div>

        <div style="width: 180px; text-align: right; font-size: 14px; color: #111827;">

          <div style="display: flex; justify-content: space-between; white-space: nowrap;">
            <span>Actual Price:</span>
            <span>₹{{ Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 }) }}</span>
          </div>

          <div style="display: flex; justify-content: space-between; white-space: nowrap;">
            <span>Coupon Discount:</span>
            <span>₹{{ Number(item.discount_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }) }}</span>
          </div>

          <div style="display: flex; justify-content: space-between; font-weight: 700; white-space: nowrap;">
            <span>Final Price:</span>
            <span>₹{{ (item.price - (item.discount_price || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 }) }}</span>
          </div>

        </div>
      </div>
    </div>
    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    <!-- <div style="display:flex; justify-content:flex-end; font-weight:bold;">
      <p>Total: ₹{{ order.amount }}</p>
    </div> -->
    <div style="margin-top: 20px; text-align: right; font-weight:bold;">
    <p>Total Original Price: ₹{{ totalOriginalPrice.toLocaleString() }}</p>
    <p>Total Discount: ₹{{ totalDiscount.toLocaleString() }}</p>
    <p>Price: ₹{{ totalFinalPrice.toLocaleString() }}</p>
  </div>

  </div>
</template>

<script setup>
import { ref, defineExpose ,computed,onMounted } from 'vue';
import { format } from 'date-fns';
const formatDate = (date) => {
  return date ? format(new Date(date), 'd MMM, yyyy h:mm a') : 'N/A';
};
const props = defineProps({
  order: { type: Object, required: true },
});
const totalOriginalPrice = computed(() => {
  return props.order.order_products.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
});
const totalDiscount = computed(() => {
  return props.order.order_products.reduce((sum, item) => {
    return sum + ((item.discount_price || 0) * item.quantity);
  }, 0);
});

const totalFinalPrice = computed(() => {
  return totalOriginalPrice.value - totalDiscount.value;
});
const invoiceContent = ref(null);

defineExpose({ invoiceContent });
</script>

