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
    orders.value = res.data.count;
    users.value = res.data.users
    ordersamount.value = res.data.ordersamount
       
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

