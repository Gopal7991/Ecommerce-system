
<template>
  <div class="p-6 min-h-screen">
    
    <div class="bg-indigo-100 rounded-xl p-6 mb-6">
      <h1 class="text-2xl font-semibold text-indigo-900">Coupons</h1>
       <p class="text-indigo-700 mt-1">
            <router-link to="/dashboard" class="font-medium hover:underline">Dashboard</router-link> . Coupons
        </p>
      <!-- <p class="text-gray-500 mt-1"> <a href="/dashboard" class="text-black">Dashboard</a> . Products</p> -->
      <!-- <p class="text-gray-500 mt-1">{{ products.length }} products Available</p> -->
    </div>

    <div class="bg-white rounded-xl shadow p-6">
      <div v-if="successMessage" class="mb-4 p-3 bg-green-100 text-green-700 rounded" >
        {{ successMessage }}
      </div>
      <div class="flex justify-between items-center mb-6">
        <input
          v-model="search"
          type="text"
          placeholder="Search coupon"
          class="border rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        <div class="flex gap-4 items-center">
          <Button>
            <router-link 
              to="/add-coupon" 
              class="px-6 py-2.5 !bg-indigo-300 hover:!bg-indigo-400 !rounded-md !transition-all !shadow-md !border-none text-white no-underline inline-flex items-center"
            >
              + Add Coupon
            </router-link>
          </Button>
        </div>
      </div>

      <div class="overflow-x-auto">
        
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { toast } from 'vue3-toastify';
import 'primeicons/primeicons.css'

</script>