
<script setup>
import { ref, onMounted,nextTick, reactive } from 'vue';
import axios from 'axios'; 
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import { format } from 'date-fns';



const orders = ref([]); 
const successMessage = ref(null);
const defaultImgUrl = ref('https://via.placeholder.com');

const fetchOrders = async () => {
  try {
    const token = localStorage.getItem('api_token');
    const res = await axios.get('/api/orders', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    orders.value = res.data.orders;
    console.log("Orders found:", orders.value);
       
  } catch (error) {
    console.error('Error fetching order history:', error);
  }
}
const formatDate = (date) => {
  return date ? format(new Date(date), 'd MMM, yyyy h:mm a') : 'N/A';
};

// const exportToCSV = () => {
//   const headers = [
//     "Order ID", "Customer", "Mobile", "Date", "Status", "Total Amount", "Items"
//   ];

//   const rows = orders.value.map(order => [
//     order.id,
//     `${order.user.firstname} ${order.user.lastname}`,
//     order.user.mobile,
//     new Date(order.created_at).toLocaleDateString(),
//     order.status,
//     order.amount,
//     order.order_products.map(p => `${p.product?.name} (x${p.quantity})`).join('; ')
//   ]);

//   const csvContent = [
//     headers.join(","), 
//     ...rows.map(row => row.join(","))
//   ].join("\n");

//   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//   const link = document.createElement("a");
//   const url = URL.createObjectURL(blob);
  
//   link.setAttribute("href", url);
//   link.setAttribute("download", `orders_export_${new Date().getTime()}.csv`);
//   link.style.visibility = 'hidden';
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// };

		const exportToCSV = () => {
      const headers = Object.keys(orders.value[0]).join(',')
      const rows = orders.value.map(row =>
        Object.values(row).join(',')
      ).join('\n')
      const csv = `${headers}\n${rows}`
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = 'export.csv'
      link.click()

      window.URL.revokeObjectURL(url)
    }
onMounted(() => {
  fetchOrders();
});
</script>


<template>
  	<div class="p-6 min-h-screen">
    
	    <div class="bg-indigo-100 rounded-xl p-6 mb-6">
	      <h1 class="text-2xl font-semibold text-indigo-900">Orders</h1>
	       <p class="text-indigo-700 mt-1">
	            <router-link to="/dashboard" class="font-medium hover:underline">Dashboard</router-link> . Orders
	        </p>
	        <div class="flex justify-end">
					  <button @click="exportToCSV" class="bg-blue-500 text-white px-4 py-2 rounded">
					    Export Orders CSV
					  </button>
					</div>
	        
	    </div>

	    <div class="bg-white rounded-xl shadow p-6">
	      	<div v-if="successMessage" class="mb-4 p-3 bg-green-100 text-green-700 rounded" >
	        	{{ successMessage }}
	      	</div>
	      	<div class="flex justify-between items-center mb-6">
	        	<input
		          v-model="search"
		          type="text"
		          placeholder="Search order"
		          class="border rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-400"
		        />
	      	</div>

	      	<div class="mx-auto space-y-6">
	      	
		    	<div v-for="order in orders" :key="order.id" v-if="orders.length > 0" 
	          	class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
	          		<div class="bg-gray-200 border-b border-slate-100 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
	            		<div class="flex gap-8">
	              			<div>
	              				<div>
		                			<p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Customer Name</p>
		                			<p class="text-sm font-medium text-emerald-600">{{ order.user.firstname }} {{ order.user.lastname }}</p>
		              			</div>
	                			<p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Order Date</p>
	                			<p class="text-sm font-semibold text-slate-800">{{ formatDate(order.created_at) }}</p>
	              			</div>
	              			<div>
	                			<p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Customer Mobile Number</p>
	                			<p class="text-sm font-medium text-emerald-600">{{ order.user.mobile }}</p>
	              			</div>
	              			<div v-if="order.coupon">
	                			<p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Coupon Used</p>
	                			<p class="text-sm font-medium text-emerald-600">{{ order.coupon.code }}</p>
	              			</div>
	              			<div>
	                			<p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Transaction Id</p>
	                			<p class="text-sm font-medium text-emerald-600">{{ order.transaction_id }}</p>
	              			</div>
	            		</div>
			            <div class="flex items-center gap-3">
			              <span :class="order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'" 
			                     class="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-tight">
			                  {{ order.status }}
			              </span>
			            </div>  
	            		<div class="flex items-center gap-3">
	              			<p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Amount</p>
	                		<p class="text-sm font-bold text-blue-600">₹{{ order.amount }} </p>
	            		</div>
	          		</div>

	          		<div class="px-6 py-4 divide-y divide-slate-50">
	            		<div v-for="(item, index) in order.order_products" :key="index" 
	                 	class="py-4 flex justify-between items-center group">
	              			<div class="flex items-center gap-4">
	                			<div class="w-20 h-20 bg-slate-50 rounded-xl flex-shrink-0 overflow-hidden border border-slate-100 group-hover:border-blue-200 transition-colors">
			                  		<img
					                    v-if="item.product?.images?.[0]"
					                    :src="`http://127.0.0.1:8000/storage/${item.product.images[0].image}`"
					                    class="w-full h-full object-cover"
					                 />
				                  	<div v-else class="flex items-center justify-center h-full text-slate-300">
				                    	<i class="pi pi-image text-2xl"></i>
				                  	</div>
	                			</div> 
	                
	                			<div>
	                  				<p class="font-bold text-slate-800 hover:text-blue-600 cursor-pointer transition-colors">{{ item.product?.name }}</p>
	                  				<div class="flex items-center gap-3 mt-1">
	                    				<p class="text-slate-500 text-xs font-medium">Qty: <span class="text-slate-800">{{ item.quantity }}</span></p>
	                    				<span v-if="item.variant" class="h-3 w-[1px] bg-slate-200"></span>
					                    <p v-if="item.variant" class="text-slate-500 text-xs">
					                      {{ item.variant.size }} / {{ item.variant.color }}
					                    </p>
	                  				</div>
	                			</div>
	              			</div>

	              			<div class="text-right">
	                			<div class="flex flex-col">
	                  				<span class="text-lg font-bold text-slate-900">₹{{ item.price - item.discount_price }}</span>
	                  				<span v-if="item.discount_price > 0" class="line-through text-slate-400 text-xs">₹{{ item.price }}</span>
	                  				<span v-if="item.discount_price > 0" class="text-slate-400 text-xs"> Coupon Discount :₹{{ item.discount_price }}</span>
	                			</div>
	              			</div>
	            		</div>
	          		</div>
	        	</div>
	        	<div v-if="orders.length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
	          		<div class="bg-slate-50 p-6 rounded-full mb-4">
	            		<i class="pi pi-shopping-bag text-5xl text-slate-300"></i>
	          		</div>
	        	</div>
		    </div>
	    </div>
  	</div>
</template>