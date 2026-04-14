<script setup>
import { ref, onMounted,nextTick, reactive, computed } from 'vue';
import axios from 'axios';
import { toast } from 'vue3-toastify';
import Menubar from 'primevue/menubar';
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import Paginator from 'primevue/paginator';
import { format } from 'date-fns';

const orders = ref([]);
const orderscount = ref([]);
const users = ref([]);
const first = ref(0);   
const rows = ref(5); 
const ordersamount = ref([]);
const products = ref([]);
import SelectButton from 'primevue/selectbutton';
const paginatedOrders = computed(() => {
  return orders.value.slice(0, 5);
});
const fetchOrders = async () => {
  try {
    const token = localStorage.getItem('api_token');
    const res = await axios.get('/api/orders', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    orders.value = res.data.data;
    console.log("Orders found:", orders.value);
       
  } catch (error) {
    console.error('Error fetching order history:', error);
  }
}
const formatDate = (date) => {
  return date ? format(new Date(date), 'd MMM, yyyy h:mm a') : 'N/A';
};
const value = ref('Today'); 
const options = ref(['Today', 'Week', 'Month', 'Year']);
const successMessage = ref(null);
const startDate = ref('');
const endDate = ref('');
const dateOptionChange = async (event) => {
    const optionValue = event.value;
    
    if (optionValue) {
        console.log('Fetching data for:', optionValue);
        try {
            startDate.value = '';
            endDate.value = '';
            fetchDashboardData(optionValue);
        } catch (error) {
            console.error('API call failed:', error);
        }
    }
};
const applyManualFilter = () => {
    if (startDate.value && endDate.value) {
        value.value = null; 
        console.log(`Filtering from ${startDate.value} to ${endDate.value}`);
        fetchDashboardData('custom', startDate.value, endDate.value);
    } else {
        alert("Please select both start and end dates");
    }
};
const fetchDashboardData = async (optionvalue = '', start = '', end = '') => {
  try {
    const token = localStorage.getItem('api_token');
    const res = await axios.get('/api/dashboard-data', {
        params: { 
            range: optionvalue,
            start_date: start,
            end_date: end
        },
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    const dashboardData = res.data.original; 
    orderscount.value = dashboardData.ordercount;
    users.value = dashboardData.users;
    products.value = dashboardData.productcount;
    ordersamount.value = dashboardData.ordersamount;
       
  } catch (error) {
    console.error('Error fetching order:', error);
  }
}
onMounted(() => {
  fetchDashboardData();
fetchOrders();
  const successMsg = sessionStorage.getItem('toastMsg');
  if (successMsg) {
    toast.success(successMsg, {
      position: 'top-right',
    });
    sessionStorage.removeItem('toastMsg');
  }
  
});
</script>
<template>
    <div class="p-6 min-h-screen">
        <div class="rounded-xl p-6 mb-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
                <!-- Revenue Card -->
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div class="flex items-center">
                        <div class="flex items-center justify-center w-10 h-10 rounded bg-green-600 text-white">
                            <i class="pi pi-indian-rupee"></i>
                        </div>
                        <div class="ml-3 truncate">
                            <div class="text-sm font-semibold text-green-900 uppercase tracking-wide">Revenue</div>
                            <span class="text-lg font-bold text-green-700">₹ {{ ordersamount }}</span>
                        </div>
                    </div>
                </div>

                <!-- Expense Card -->
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div class="flex items-center">
                        <div class="flex items-center justify-center w-10 h-10 rounded bg-red-600 text-white">
                            <i class="pi pi-credit-card text-6xl"></i>
                        </div>
                        <div class="ml-3 truncate">
                            <div class="text-sm font-semibold text-red-900 uppercase tracking-wide">Expense</div>
                            <span class="text-lg font-bold text-red-700">₹ </span>
                        </div>
                    </div>
                </div>

                <!-- Happy Clients Card -->
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div class="flex items-center">
                        <div class="flex items-center justify-center w-10 h-10 rounded bg-yellow-500 text-white">
                            <i class="pi pi-user-plus"></i>
                        </div>
                        <div class="ml-3 truncate">
                            <div class="text-sm font-semibold text-yellow-900 uppercase tracking-wide">Happy Clients</div>
                            <span class="text-lg font-bold text-yellow-700">0</span>
                        </div>
                    </div>
                </div>

                <!-- New Store Card -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div class="flex items-center">
                        <div class="flex items-center justify-center w-10 h-10 rounded bg-blue-500 text-white">
                            <i class="pi pi-shop" aria-hidden="true"></i>
                        </div>
                        <div class="ml-3 truncate">
                            <div class="text-sm font-semibold text-blue-900 uppercase tracking-wide">New Store Open</div>
                            <span class="text-lg font-bold text-blue-700">0</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class=" grid grid-cols-3 gap-4">
                
                <div class="bg-white border-1 border-blue-500  rounded-xl">  
                    <SelectButton 
                        v-model="value" 
                        :options="options" 
                        @change="dateOptionChange" 
                    />
                </div>
                <div class=""></div>
                <div class="bg-white border-1 border-blue-500 rounded-xl">
                    <div class="date-filter flex items-center justify-end mt-2 mr-1 gap-2">
                        <input 
                            type="date" 
                            v-model="startDate" 
                            class="form-control" 
                            placeholder="Start"
                        >
                        <!-- End Date -->
                        <input 
                            type="date" 
                            v-model="endDate" 
                            class="form-control" 
                            placeholder="End"
                        >
                        <button 
                            @click="applyManualFilter" 
                            class="btn btn-primary" 
                            type="button"
                        >
                            <i class="pi pi-filter"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <div class="bg-white border rounded-xl p-4 shadow-sm flex items-center justify-between">
                    <div>
                        <span class="text-gray-500 text-sm">Customers</span>
                        <div class="text-xl font-bold">{{ users }}</div>
                    </div>
                    <i class="pi pi-users text-2xl text-orange-400"></i>
                </div>

                <div class="bg-white border rounded-xl p-4 shadow-sm flex items-center justify-between">
                    <div>
                        <span class="text-gray-500 text-sm">Order</span>
                        <div class="text-xl font-bold">{{ orderscount }}</div>
                    </div>
                    <i class="pi pi-shopping-cart text-2xl text-purple-400"></i>
                </div>

                <div class="bg-white border rounded-xl p-4 shadow-sm flex items-center justify-between">
                    <div>
                        <span class="text-gray-500 text-sm">Avg Sale</span>
                        <div class="text-xl font-bold">₹</div>
                    </div>
                    <i class="pi pi-percentage text-2xl text-orange-500"></i>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <div class="bg-white border rounded-xl p-4 shadow-sm flex items-center justify-between">
                    <div>
                        <span class="text-gray-500 text-sm">Avg Item Sales</span>
                        <div class="text-xl font-bold">{{ users }}</div>
                    </div>
                    <i class="pi pi-calculator text-2xl text-purple-300"></i>
                </div>

                <div class="bg-white border rounded-xl p-4 shadow-sm flex items-center justify-between">
                    <div>
                        <span class="text-gray-500 text-sm">Total Sale</span>
                        <div class="text-xl font-bold">₹ {{ ordersamount }}</div>
                    </div>
                    <i class="pi pi-th-large text-2xl text-blue-400"></i>
                </div>

                <div class="bg-white border rounded-xl p-4 shadow-sm flex items-center justify-between">
                    <div>
                        <span class="text-gray-500 text-sm">Visitors</span>
                        <div class="text-xl font-bold">₹</div>
                    </div>
                    <i class="pi pi-users text-2xl text-green-400"></i>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <div class="bg-white border rounded-xl p-4 shadow-sm flex items-center justify-between">
                    <div>
                        <span class="text-gray-500 text-sm">Total Products</span>
                        <div class="text-xl font-bold">{{ products }}</div>
                    </div>
                    <i class="pi pi-box text-2xl text-orange-300"></i>
                </div>

                <div class="bg-white border rounded-xl p-4 shadow-sm flex items-center justify-between">
                    <div>
                        <span class="text-gray-500 text-sm">Top Selling Item</span>
                        <div class="text-xl font-bold">₹ {{ ordersamount }}</div>
                    </div>
                    <i class="pi pi-truck text-2xl text-yellow-600"></i>
                </div>

                <div class="bg-white border rounded-xl p-4 shadow-sm flex items-center justify-between">
                    <div>
                        <span class="text-gray-500 text-sm">Dealership</span>
                        <div class="text-xl font-bold">₹</div>
                    </div>
                    <i class="pi pi-chart-bar text-2xl text-purple-800"></i>
                </div>
            </div>
            <div class="card-header py-3 d-flex justify-content-between align-items-center bg-transparent border-bottom-0 mt-6">
                <h6 class="m-0 fw-bold"><b>Recent Transactions</b></h6>
            </div>

            <div class=" space-y-6">
                <div v-for="order in paginatedOrders" :key="order.id" v-if="paginatedOrders.length > 0" 
                    class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                    <div class="bg-gray-200 border-b border-slate-100 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
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
                </div>
            </div>
        </div>  
    </div>
</template>

