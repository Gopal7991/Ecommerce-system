<script setup>
import { useRouter } from 'vue-router'
import axios from 'axios'
axios.defaults.withCredentials = true;
const router = useRouter()

const logout = async () => {
    await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie');
  const token = localStorage.getItem('api_token');
 
  try {
    await axios.post('/api/logout', {}, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
  } catch (error) {
    console.error('Logout failed (backend):', error)
  } finally {
     localStorage.removeItem('api_token'); 
    router.push('/')
  }
}
</script>

<template>

  <div
  class="relative flex h-full  max-w-[20rem] flex-col bg-white bg-clip-border p-4 text-gray-700 shadow-xl shadow-blue-gray-900/5">
  <div class="p-4 mb-2">
    <h5 class="block font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">
      E-Commerce
    </h5>
  </div>
  <nav class="flex min-w-[240px] flex-col gap-1 p-2 font-sans text-base font-normal text-blue-gray-700">
    <div role="button"
      class="flex items-center w-full p-3 leading-tight transition-all rounded-lg has-[.router-link-active]:bg-indigo-300 outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900 hover:bg-indigo-100">
      <div class="grid mr-4 place-items-center">
        <span class="pi pi-server"></span>
      </div>
      <router-link to="/dashboard"> Dashboard </router-link>
      
    </div>
   
    <div role="button"
      class="flex items-center w-full p-3 leading-tight transition-all rounded-lg has-[.router-link-active]:bg-indigo-300 outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900 hover:bg-indigo-100">
      <div class="grid mr-4 place-items-center">
       <span class="pi pi-th-large"></span>
      </div>
      <router-link to="/categories"> Categories </router-link>
    </div>

    <div role="button"
      class="flex items-center w-full p-3 leading-tight transition-all rounded-lg has-[.router-link-active]:bg-indigo-300 outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900 hover:bg-indigo-100">
      <div class="grid mr-4 place-items-center">
       <span class="pi pi-box"></span>
      </div>
      <router-link to="/products"> Products </router-link>
    </div>
    <div role="button"
      class="flex items-center w-full p-3 leading-tight transition-all rounded-lg has-[.router-link-active]:bg-indigo-300 outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900 hover:bg-indigo-100">
      <div class="grid mr-4 place-items-center">
       <span class="pi pi-clone"></span>
      </div>
      <router-link to="/coupons"> Coupons </router-link>
    </div>
     <div role="button"
      class="flex items-center w-full p-3 leading-tight transition-all rounded-lg outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900 hover:bg-indigo-100">
      <div class="grid mr-4 place-items-center">
       <span class="pi pi-sign-out"></span>
      </div>
        <button class="logout-btn" @click="logout">
         Logout
        </button>
    </div>
  </nav>
</div>
</template>
