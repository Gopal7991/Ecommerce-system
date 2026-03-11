<script setup>
import UserHeader from './UserHeader.vue';

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
      <router-view />
    </main>
  </div>
</div>

</template>