<!-- <template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <div class="bg-grey-600 rounded-xl p-6 mb-6 shadow-md">
      <h1 class="text-2xl font-bold text-black">My Orders</h1>
    </div>

    <div class="max-w-4xl mx-auto space-y-6">
      
   	<Accordion v-if="orders.length > 0" multiple>
  	    <AccordionPanel v-for="order in orders" :key="order.id" :value="order.id.toString()">
  	        <AccordionHeader>
  	          <div class="flex justify-between items-center w-full pr-4">
  	            <div class="flex gap-4 items-center text-left">
  	              <div>
  	                <p class="font-bold text-slate-800">Order Date : {{ formatDate(order.created_at) }}</p>
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
      <div v-if="orders.length === 0" class="text-center py-20 bg-white rounded-lg border border-dashed border-slate-300">
          <i class="pi pi-box text-5xl text-slate-200 mb-4"></i>
          <p class="text-slate-500">No orders found yet.</p>
      </div>
    </div>
  </div>
</template>
 -->

 <template>
	<div class="p-6 bg-gray-50 min-h-screen">
	    <div class="max-w-4xl mx-auto mb-8 flex justify-between items-center">
	    	<h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">My Orders</h1>
		    <!-- <span class="bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-200 text-sm font-medium text-slate-600">
		    	{{ orders.length }} Orders Total
		    </span> -->
	    </div>

	    <div class="max-w-4xl mx-auto space-y-6">
	    	<div v-for="order in orders" :key="order.id" v-if="orders.length > 0" 
          class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
          <div class="bg-gray-200 border-b border-slate-100 px-6 py-4 flex justify-between items-center gap-4">
            <div class="flex gap-8">
              <div>
                <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Order Date</p>
                <p class="text-sm font-semibold text-slate-800">{{ formatDate(order.created_at) }}</p>
              </div>
              <div v-if="order.coupon">
                <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Coupon Used</p>
                <p class="text-sm font-medium text-emerald-600">{{ order.coupon.code }}</p>
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
          <p class="text-slate-800 font-bold text-xl">No orders yet</p>
          <p class="text-slate-500 mt-1">When you buy items, they will appear here.</p>
          <button @click="$router.push('/')" class="mt-6 bg-slate-900 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors">
            Start Shopping
          </button>
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
import { format } from 'date-fns';



const orders = ref([]); 
const successMessage = ref(null);
const defaultImgUrl = ref('https://via.placeholder.com');

const fetchOrders = async () => {
  try {
    const token = localStorage.getItem('api_token');
    const res = await axios.get('/api/my-orders', {
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
onMounted(() => {
  fetchOrders();
});
</script>
