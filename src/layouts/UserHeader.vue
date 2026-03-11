<template>
  <header class="bg-white shadow-md h-16 flex items-center justify-between px-6 sticky top-0 z-50">
    <!-- Navigation Tabs -->
    <nav class="flex h-full items-center space-x-1" role="tablist">
      <button 
        v-for="tab in navigationTabs" 
        :key="tab.name"
        @click="handleTabClick(tab)"
        :class="[
          'px-4 h-full flex items-center text-sm font-medium transition-all border-b-2 mt-0.5 outline-none',
          activeTab === tab.name 
            ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' 
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        ]"
      >
        <span v-if="tab.icon" :class="[tab.icon, 'mr-2']"></span>
        {{ tab.label }}
      </button>

      <!-- Logout Tab (Styled as a Tab) -->
      <button 
        @click="logout"
        class="px-4 h-full flex items-center text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50/30 border-b-2 border-transparent transition-all"
      >
        <span class="pi pi-sign-out mr-2"></span>
        Logout
      </button>
    </nav>

    <div class="relative flex items-center">
      <button 
        @click.stop="toggleDropdown" 
        class="flex items-center space-x-2 focus:outline-none group p-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        <div class="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-indigo-500 transition-all shadow-sm">
          <img 
            :src="currentImageSrc" 
            alt="Profile" 
            class="h-full w-full object-cover" 
          />
        </div>
        <i class="pi pi-chevron-down text-xs text-gray-400 group-hover:text-gray-600 transition-transform" :class="{'rotate-180': isDropdownOpen}"></i>
      </button>

      <!-- <transition 
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div v-if="isDropdownOpen" class="absolute right-0 top-full mt-2 py-2 w-48 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-50">
          <div class="px-4 py-2 border-b border-gray-50 text-xs font-semibold text-gray-400 uppercase">Manage Account</div>
          <button @click="logout" class="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 space-x-3">
            <span class="pi pi-sign-out"></span>
            <span>Logout</span>
          </button>
        </div>
      </transition> -->
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import emitter from '@/eventBus';
import defaultImgUrl from '@/assets/images/user_logo.png';
import 'primeicons/primeicons.css';

const router = useRouter();
const route = useRoute();

const navigationTabs = [
  { name: 'home', label: 'Home', path: '/home', icon: 'pi pi-home' },
  { name: 'about', label: 'About', path: '/about', icon: 'pi pi-info-circle' },
  { name: 'products', label: 'All Product', path: '/products-all', icon: 'pi pi-list' },
];

const activeTab = computed(() => {
  const current = navigationTabs.find(t => route.path.startsWith(t.path));
  return current ? current.name : '';
});

const handleTabClick = (tab) => {
  router.push(tab.path);
};

// --- Profile Image & Reactivity Fix ---
const dynamicUrl = ref('');
const imageVersion = ref(Date.now()); // Used to force image refresh

const currentImageSrc = computed(() => {
  if (!dynamicUrl.value) return defaultImgUrl;
  // Appending a unique query param (cache-buster) ensures the image reloads
  return `${dynamicUrl.value}?v=${imageVersion.value}`;
});

const fetchUserImage = async () => {
  try {
    const token = localStorage.getItem('api_token');
    if (!token) return;
    const { data } = await axios.get('/api/user', {
      headers: { Authorization: `Bearer ${token}` }
    });
    dynamicUrl.value = data.profile_image;
  } catch (err) {
    console.error("Failed to load image", err);
  }
};

const isDropdownOpen = ref(false);
const toggleDropdown = () => (isDropdownOpen.value = !isDropdownOpen.value);
const closeDropdown = () => (isDropdownOpen.value = false);

const logout = async () => {
  const token = localStorage.getItem('api_token');
  try {
    await axios.post('/api/logout', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (e) {
    console.warn("Logout request failed, clearing local session anyway.");
  } finally {
    localStorage.removeItem('api_token');
    router.push('/');
  }
};

onMounted(() => {
  fetchUserImage();
  window.addEventListener('click', closeDropdown);
  
  // Update image and version when the 'image-updated' event fires
  emitter.on('image-updated', (newUrl) => {
    dynamicUrl.value = newUrl;
    imageVersion.value = Date.now(); // Triggers re-render of currentImageSrc
  });
});

onUnmounted(() => {
  window.removeEventListener('click', closeDropdown);
  emitter.off('image-updated');
});
</script>
