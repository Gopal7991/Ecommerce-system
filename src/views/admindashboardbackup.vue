<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { toast } from 'vue3-toastify';

const orders = ref([]);
const users = ref([]);
const ordersamount = ref([]);

const successMessage = ref(null);
const fetchDashboardData = async () => {
  try {
    const token = localStorage.getItem('api_token');
    const res = await axios.get('/api/dashboard-data', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const dashboardData = res.data.original; 
    orders.value = dashboardData.count;
    users.value = dashboardData.users
    ordersamount.value = dashboardData.ordersamount
       
  } catch (error) {
    console.error('Error fetching order:', error);
  }
}
onMounted(() => {
  fetchDashboardData();
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
  <div>
    <div class="flex gap-5">
      
      <div class="flex-1 bg-white p-5 rounded-lg text-center shadow-sm">
        <h4 class="font-semibold">Total Orders</h4>
        <p>{{ orders }}</p>
      </div>

      <div class="flex-1 bg-white p-5 rounded-lg text-center shadow-sm">
        <h4 class="font-semibold">Total Users</h4>
        <p>{{ users }}</p>
      </div>

      <div class="flex-1 bg-white p-5 rounded-lg text-center shadow-sm">
        <h4 class="font-semibold">Revenue</h4>
        <p>₹ {{ ordersamount }}</p>
      </div>
      
    </div>
  </div>
</template>

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
    
    <!-- Revenue Card -->
    <div class="bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex items-center">
            <div class="flex items-center justify-center w-10 h-10 rounded bg-green-600 text-white">
                <i class="fa fa-dollar fa-lg"></i>
            </div>
            <div class="ml-3 truncate">
                <div class="text-sm font-semibold text-green-900 uppercase tracking-wide">Revenue</div>
                <span class="text-lg font-bold text-green-700">$18,925</span>
            </div>
        </div>
    </div>

    <!-- Expense Card -->
    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center">
            <div class="flex items-center justify-center w-10 h-10 rounded bg-red-600 text-white">
                <i class="fa fa-credit-card fa-lg"></i>
            </div>
            <div class="ml-3 truncate">
                <div class="text-sm font-semibold text-red-900 uppercase tracking-wide">Expense</div>
                <span class="text-lg font-bold text-red-700">$11,024</span>
            </div>
        </div>
    </div>

    <!-- Happy Clients Card -->
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div class="flex items-center">
            <div class="flex items-center justify-center w-10 h-10 rounded bg-yellow-500 text-white">
                <i class="fa fa-smile-o fa-lg"></i>
            </div>
            <div class="ml-3 truncate">
                <div class="text-sm font-semibold text-yellow-900 uppercase tracking-wide">Happy Clients</div>
                <span class="text-lg font-bold text-yellow-700">8,925</span>
            </div>
        </div>
    </div>

    <!-- New Store Card -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-center">
            <div class="flex items-center justify-center w-10 h-10 rounded bg-blue-500 text-white">
                <i class="fa fa-shopping-bag" aria-hidden="true"></i>
            </div>
            <div class="ml-3 truncate">
                <div class="text-sm font-semibold text-blue-900 uppercase tracking-wide">New Store Open</div>
                <span class="text-lg font-bold text-blue-700">8,925</span>
            </div>
        </div>
    </div>

</div>
