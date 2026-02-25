<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    
    <!-- Header -->
    <div class="bg-indigo-100 rounded-xl p-6 mb-6">
      <h1 class="text-2xl font-semibold">Categories</h1>
      <p class="text-gray-500 mt-1"> <a href="/dashboard" class="text-black">Dashboard</a> . Categories</p>
      <!-- <p class="text-gray-500 mt-1">{{ categories.length }} Categories Available</p> -->
    </div>

    <!-- Card -->
    <div class="bg-white rounded-xl shadow p-6">
      <div v-if="successMessage" class="mb-4 p-3 bg-green-100 text-green-700 rounded" >
        {{ successMessage }}
      </div>
      <!-- Top Bar -->
      <div class="flex justify-between items-center mb-6">
        <input
          v-model="search"
          type="text"
          placeholder="Search Category"
          class="border rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        <router-link to="/add-category"><button class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg">
          + Add Category
        </button> </router-link>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="text-gray-500 border-b">
              <th class="py-3">ID</th>
              <th class="py-3">Category Name</th>

              <th class="py-3">Parent Name</th>
              
              <th class="py-3">Fullpath</th>
              <th class="py-3">Is Active ?</th>
              <th class="py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="category in categories"
              :key="category.id"
              class="border-b hover:bg-gray-50"
            >
              <td class="py-3">{{ category.id }}</td>
              <td class="py-3 font-medium">{{ category.name }}</td>
              <td class="py-3 font-medium">{{ category.parent ? category.parent.name : '-' }}</td>
              <td class="py-3 font-medium">{{ category.full_name }}</td>
  
              <td class="py-3">
                <span
                  :class="[
                    'px-3 py-1 text-xs rounded-full',
                    category.is_active
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  ]"
                >
                  {{ category.is_active ? 'Active': 'Inactive' }}
                </span>
              </td>
              <td class="py-3 text-center space-x-3">
                <button class="add-btn">
                  <span class="pi pi-pencil"></span>
                </button>
                <button class="delete-btn">
                 <span class="pi pi-trash"></span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { toast } from 'vue3-toastify';
import 'primeicons/primeicons.css'
import axios from 'axios'; 

const categories = ref([]);
const loading = ref(true);
const error = ref(null);
const successMessage = ref('')

const fetchCategories = async () => {
  try {
    const token = localStorage.getItem('api_token')

      const response = await axios.get('/api/categories', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      })
    categories.value = response.data.data; // Assign the response data to the reactive ref
    console.log(response.data)
  } catch (err) {
    error.value = 'Failed to fetch categories: ' + err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCategories();
  const successMsg = sessionStorage.getItem('toastMsg');
  if (successMsg) {
    toast.success(successMsg, {
      position: 'top-right',
    });
    sessionStorage.removeItem('toastMsg');
  }
  
});
</script>