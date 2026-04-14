
<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <div class="bg-grey-600 rounded-xl p-6 mb-6 shadow-md">
      <h1 class="text-2xl font-bold text-black">My Order History</h1>
    </div>

    <div class="max-w-4xl mx-auto space-y-6">
      
   	<Accordion v-if="histories.length > 0" multiple>
  	    <AccordionPanel v-for="order in histories" :key="order.id" :value="order.id.toString()">
  	        <AccordionHeader>
  	          <div class="flex justify-between items-center w-full pr-4">
  	            <div class="flex gap-4 items-center text-left">
  	              <div>
  	                <p class="font-bold text-slate-800">Order #{{ order.id }}</p>
  	                <!-- a 
                      :href="`/api/orders/${order.id}/invoice`" 
                      target="_blank"
                      class="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline flex items-center gap-1"
                    >
                      <i class="pi pi-file-pdf"></i> Receipt
                    </a> -->
                    <!-- <button
                      @click="downloadInvoicePDF(order.id)"
                      class="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      Download Invoice
                    </button> -->
                    <div class="flex gap-3 items-center">
                      <button
                        @click="downloadInvoice(order.id)"
                        class="p-button p-component p-button-rounded p-button-text"
                        v-tooltip="'Download Invoice'"
                      >
                        <i class="pi pi-download text-blue-600 text-xl"></i>
                      </button>
                      
                      <!-- Send Invoice -->
                      <button
                        @click="sendInvoice(order.id)"
                        class="p-button p-component p-button-rounded p-button-text"
                        v-tooltip="'Send Invoice'"
                      >
                        <i class="pi pi-envelope text-green-600 text-xl"></i>
                      </button>
                    </div>
  	              </div>
  	            </div>
                <div class="flex gap-4 items-center text-left">
                  <div>
                    <p v-if="order.coupon" class="text-xs text-slate-500">
                      Applied Coupon: {{ order.coupon.code }}
                  </p>
                  </div>
                </div>
  	            <div class="flex items-center gap-6">
  	              <span class="font-bold text-blue-600 text-lg">₹{{ order.amount }}</span>
  	              <span :class="order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'" 
  	                    class="px-3 py-1 rounded-full text-[10px] font-bold uppercase">
  	                {{ order.status }}
  	              </span>
  	            </div>

  	          </div>
  	        </AccordionHeader>
  	        <AccordionContent>
  	       <div v-for="(item, index) in order.order_products" :key="index" class="space-y-4 mb-4">
            <div class="flex justify-between items-center text-sm">
              <div class="flex items-center gap-3">
                <div class="w-16 h-16 bg-slate-100 rounded-md flex-shrink-0 overflow-hidden border border-slate-100">
                  <img
                    v-if="item.product && item.product.images && item.product.images.length > 0"
                    :src="`http://127.0.0.1:8000/storage/${item.product.images[0].image}`"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="flex items-center justify-center h-full text-slate-300">
                     <i class="pi pi-image text-xl"></i>
                  </div>
                </div> 
                
                <div>
                  <p class="font-medium text-slate-800">{{ item.product?.name }}</p>
                  <p class="text-slate-500 text-xs">Qty: {{ item.quantity }}</p>
                  <p v-if="item.variant" class="text-slate-400 text-[10px]">
                    {{ item.variant.size }} / {{ item.variant.color }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3 mb-4">
                        <span class="line-through text-gray-400 text-lg">₹{{item.price}}</span>
                        <span class="text-slate-700 font-bold">₹{{item.price - item.discount_price}}</span>
                    </div>
              <!-- <span class="font-semibold text-slate-700">₹{{ item.price * item.quantity }}</span> -->
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-100">
            <div class="flex justify-between items-center">
              <div>
                 <p class="text-xs text-slate-500 uppercase tracking-wider">Address</p>
                 <p class="text-sm text-slate-700">{{ order.city }}, {{ order.state }}</p>
              </div>
              <div class="text-right">
                <span class="text-sm text-slate-500 block">Total Amount</span>
                <span class="text-xl font-bold text-blue-600">₹{{ order.amount }}</span>
              </div>
            </div>
          </div>
  	        </AccordionContent>
  	    </AccordionPanel>
  	</Accordion>
      <div v-if="histories.length === 0" class="text-center py-20 bg-white rounded-lg border border-dashed border-slate-300">
          <i class="pi pi-box text-5xl text-slate-200 mb-4"></i>
          <p class="text-slate-500">No orders found yet.</p>
      </div>
        <div class="pdf-offscreen">
          <InvoiceTemplate
            v-for="order in histories"
            :key="'invoice-'+order.id"
            :order="order"
            :ref="el => invoiceRefs[order.id] = el"
          />
        </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted,nextTick, reactive } from 'vue';
import axios from 'axios'; 
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import html2pdf from 'html2pdf.js';
import InvoiceTemplate from '@/components/InvoiceData.vue';
import ReceiptService from '@/services/ReceiptService.js';
import Tooltip from 'primevue/tooltip';
const invoiceRef = ref(null); 

const invoiceRefs = reactive({});

// const downloadInvoicePDF = async (orderId) => {
//   await nextTick();
//   await new Promise(resolve => setTimeout(resolve, 100));

//   const invoiceComponent = invoiceRefs[orderId];
//   if (!invoiceComponent || !invoiceComponent.invoiceContent) return;

//   const el = invoiceComponent.invoiceContent;

//   const options = {
//     margin: 10,
//     filename: `Invoice_${orderId}.pdf`,
//     image: { type: 'jpeg', quality: 0.98 },
//     html2canvas: { scale: 2, useCORS: true },
//     jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
//   };

//   try {
//     const pdfBlob = await html2pdf().set(options).from(el).outputPdf('blob');

//     const formData = new FormData();
//     formData.append('receipt', pdfBlob, `Invoice_${orderId}.pdf`);
//     formData.append('order_id', orderId);
//     const token = localStorage.getItem('api_token');
//     const response = await axios.post('/api/send-order-receipt', formData, {
//       headers: { 
//         'Content-Type': 'multipart/form-data',
//         'Authorization': `Bearer ${token}`
//       }
//     });

//   } catch (error) {
//     console.error('Error processing receipt:', error);
//   }
// };
const downloadInvoice = async (orderId) => {
  const invoiceComponent = invoiceRefs[orderId];
  if (!invoiceComponent || !invoiceComponent.invoiceContent) return;

  try {
    await ReceiptService.download(orderId, invoiceComponent.invoiceContent);
  } catch (error) {
    console.error('Error downloading invoice:', error);
  }
};

const sendInvoice = async (orderId) => {
  const invoiceComponent = invoiceRefs[orderId];
  if (!invoiceComponent || !invoiceComponent.invoiceContent) return;

  try {
    await ReceiptService.send(orderId, invoiceComponent.invoiceContent);
    alert(`Invoice for order #${orderId} sent successfully.`);
  } catch (error) {
    console.error('Error sending invoice:', error);
  }
};
const histories = ref([]); 
const successMessage = ref(null);
const defaultImgUrl = ref('https://via.placeholder.com');

const fetchOrderHistory = async () => {
  try {
    const token = localStorage.getItem('api_token');
    const res = await axios.get('/api/order-history', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    histories.value = res.data.histories;
    console.log("Orders found:", histories.value);
       
  } catch (error) {
    console.error('Error fetching order history:', error);
  }
}

onMounted(() => {
  fetchOrderHistory();
});
</script>
<style scoped>
.pdf-offscreen {
  position: absolute;
  left: -9999px;
  top: 0;
  width: 210mm; /* Force A4 width so the layout is correct for PDF */
  background: white;
}
</style>