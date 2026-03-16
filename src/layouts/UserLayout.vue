<script setup>
import UserHeader from './UserHeader.vue';
import Carousel from 'primevue/carousel';
import { ref } from 'vue';
const images = ref([
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
  "https://images.unsplash.com/photo-1541099649105-f69ad21f3246",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80"
]);

const responsiveOptions = ref([
  { breakpoint: "1400px", numVisible: 3, numScroll: 1 },
  { breakpoint: "992px", numVisible: 2, numScroll: 1 },
  { breakpoint: "576px", numVisible: 1, numScroll: 1 }
]);

</script>

<template>
    <div class="flex min-h-screen">
  <!-- Sidebar -->
  <!-- <aside class="w-64 text-white min-h-screen shadow-xl shadow-blue-gray-900/5">
    <Sidebar />
  </aside> -->

  <!-- Main Content Area -->
  <div class="flex-1 flex flex-col">
    <!-- Header -->
    <header class="bg-white shadow">
      <UserHeader />
    </header>
    
    <!-- Content -->
    <main class="flex-1 p-4">
        <div class="bg-indigo-100 rounded-xl p-3 mb-6">
        <Carousel
            :value="images"
            :numVisible="3"
            :numScroll="1"
            :responsiveOptions="responsiveOptions"
            circular
            :autoplayInterval="3000"
        >
            <template #item="slotProps">
                <div class="p-2">
                <img
                    :src="slotProps.data"
                    class="w-full h-48 object-cover rounded"
                    alt="Product"
                />
                </div>
            </template>
        </Carousel>
    </div>
      <router-view />
    </main>
  </div>
</div>

</template>
