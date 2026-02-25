<script setup>
import Sidebar from '../layouts/Sidebar.vue'
import Header from './Header.vue';

</script>

<!-- <template>
    <div class="flex h-screen bg-gray-100">
        <Sidebar />
        <div class="flex-1 flex flex-col">
            <Header />
            <main class="flex-1 p-6 overflow-y-auto">
                <router-view />
            </main>
        </div>
        
    </div>
  
</template> -->

<template>
    <div class="flex min-h-screen">
  <!-- Sidebar -->
  <aside class="w-64 text-white min-h-screen shadow-xl shadow-blue-gray-900/5">
    <Sidebar />
  </aside>

  <!-- Main Content Area -->
  <div class="flex-1 flex flex-col">
    <!-- Header -->
    <header class="bg-white shadow">
      <Header />
    </header>

    <!-- Content -->
    <main class="flex-1 p-4">
      <router-view />
    </main>
  </div>
</div>

</template>