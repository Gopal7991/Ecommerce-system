<script setup>
import { onMounted } from 'vue';
import { toast } from 'vue3-toastify';

onMounted(() => {
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
        <!-- <p>25</p> -->
      </div>

      <div class="flex-1 bg-white p-5 rounded-lg text-center shadow-sm">
        <h4 class="font-semibold">Total Users</h4>
        <!-- <p>120</p> -->
      </div>

      <div class="flex-1 bg-white p-5 rounded-lg text-center shadow-sm">
        <h4 class="font-semibold">Revenue</h4>
        <!-- <p>$1,500</p> -->
      </div>
      
    </div>
  </div>
</template>
