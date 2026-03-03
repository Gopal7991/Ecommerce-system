
<template>
  <header class="bg-white shadow-md h-16 flex items-center justify-between px-4 sticky top-0 z-10">
    <button @click="emit('toggle-sidebar')" class="text-gray-500 hover:text-gray-700">
      <svg class="w-6 h-6"  fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
    </button>
    <h1 class="text-xl font-semibold"></h1>
    <div>
        <!-- <span class="text-gray-600">Welcome, User</span> -->
        <button @click.stop="toggleDropdown" class="flex items-center focus:outline-none">
            <img :src="currentImageSrc" alt="Content" class="h-10 w-10 rounded-full border-2 border-gray-300" />
        </button>
        <div v-if="isDropdownOpen" class="absolute right-0 mt-2 py-2 w-48 bg-white rounded-lg shadow-xl z-50">
            <a href="/profile" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 space-x-2" @click="isDropdownOpen = false">
                <span class="pi pi-user"></span>
                <span>My Profile</span>
            </a>
             <a href="/chnage-password" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 space-x-2" @click="isDropdownOpen = false">
                <span class="pi pi-eye"></span>
                <span>Change Password</span>
            </a>
            <a href="#" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 space-x-2"   @click="logout" >
               
                <span class="pi pi-sign-out"></span>
                <span class="text-sm">Logout</span>
            </a>
            

            <!-- Other Links Remain Unchanged -->
            <!-- <a href="" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Chnage Password</a> -->
            <!-- <router-link class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" to="/chnage-password" @click="isDropdownOpen = false">Change Password</router-link> -->
            <!-- <a href="#" class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100" @click="logout">Logout</a> -->
        </div>
    </div>
  </header>
</template>

<script setup>
const emit = defineEmits(['toggle-sidebar']);
import axios from 'axios'
import { useRouter } from 'vue-router'
import { computed, ref, onMounted, onUnmounted  } from 'vue';
import 'primeicons/primeicons.css'
import emitter from '@/eventBus';
const dynamicUrl = ref('');
import defaultImgUrl from '@/assets/images/user_logo.png';

const currentImageSrc = computed(() => {
  return dynamicUrl.value || defaultImgUrl; // If dynamicUrl is falsy, use defaultImgUrl
});


const fetchUserImage = async () => {
  try {
    const { data } = await axios.get('/api/user', {
      headers: { Authorization: `Bearer ${localStorage.getItem('api_token')}` }
    });
    dynamicUrl.value = data.profile_image; 
  } catch (err) {
    console.error("Could not load user image", err);
  }
};

// onMounted(fetchUserImage);
onMounted(() => {
  fetchUserImage(); // Initial load
  
  emitter.on('image-updated', (newUrl) => {
    dynamicUrl.value = newUrl; // Update header image instantly!
  });
});

// Clean up listener when component is destroyed
onUnmounted(() => {
  emitter.off('image-updated');
});
const serverError = ref('')


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

const isDropdownOpen = ref(false);
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};
</script>
