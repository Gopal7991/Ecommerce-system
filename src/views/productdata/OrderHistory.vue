
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
  	                <<!-- a 
                      :href="`/api/orders/${order.id}/invoice`" 
                      target="_blank"
                      class="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline flex items-center gap-1"
                    >
                      <i class="pi pi-file-pdf"></i> Receipt
                    </a> -->
                    <button 
                      @click="downloadReceipt(order.id)" 
                      class="bg-blue-500 text-white px-4 py-2 rounded mt-4"
                    >
                      Receipt
                    </button>
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

    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios'; 
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const orderData = ref({
  orderId: "#PO-9921",
  date: "2024-03-30",
  customer: "John Doe",
  items: [
    { name: "Wireless Mouse", price: 25.00, qty: 2 },
    { name: "Mechanical Keyboard", price: 75.00, qty: 1 },
    { name: "USB-C Cable", price: 10.00, qty: 3 }
  ]
});

// const generateReceipt = () => {
//   const doc = new jsPDF();

//   // 1. Add Header Info
//   doc.setFontSize(20);
//   doc.text("PURCHASE RECEIPT", 14, 22);
  
//   doc.setFontSize(10);
//   doc.text(`Order ID: ${orderData.value.orderId}`, 14, 32);
//   doc.text(`Date: ${orderData.value.date}`, 14, 38);
//   doc.text(`Customer: ${orderData.value.customer}`, 14, 44);

//   // 2. Add the Items Table
//   const tableRows = orderData.value.items.map(item => [
//     item.name,
//     `$${item.price.toFixed(2)}`,
//     item.qty,
//     `$${(item.price * item.qty).toFixed(2)}`
//   ]);

//   autoTable(doc, {
//     startY: 50,
//     head: [['Item Name', 'Price', 'Quantity', 'Total']],
//     body: tableRows,
//   });

//   // 3. Add Grand Total
//   const finalY = doc.lastAutoTable.finalY + 10;
//   const total = orderData.value.items.reduce((sum, i) => sum + (i.price * i.qty), 0);
//   doc.setFontSize(12);
//   doc.text(`Grand Total: $${total.toFixed(2)}`, 14, finalY);

//   // 4. Trigger Download
//   doc.save(`Receipt_${orderData.value.orderId}.pdf`);
// };

const downloadReceipt = async (orderId) => {
  try {
    alert(orderId)
    const token = localStorage.getItem('api_token');
    const response = await axios.get(`/api/orders/${orderId}/receipt`, {
      responseType: 'blob', // MANDATORY for PDF files
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/pdf'
      }
    });

    // 2. Process the Blob
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    // 3. Create a hidden link and click it
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Order_${orderId}.pdf`);
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
    
  } catch (error) {
    // If you get "Network Error", check CORS on your backend
    console.error("Error downloading PDF:", error);
    
    // Note: If responseType is 'blob', the error message is also a blob. 
    // You must use FileReader to read it if the server sent a JSON error.
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
