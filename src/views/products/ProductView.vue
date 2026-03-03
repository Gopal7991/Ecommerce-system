
<template>
  <div class="p-6  min-h-screen">
    
    <div class="bg-indigo-100 rounded-xl p-6 mb-6">
      <h1 class="text-2xl font-semibold text-indigo-900">Products</h1>
       <p class="text-indigo-700 mt-1">
            <router-link to="/dashboard" class="font-medium hover:underline">Dashboard</router-link> . Products
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
          placeholder="Search Product"
          class="border rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <Button asChild>
            <router-link 
            to="/add-product" 
            class="px-6 py-2.5 !bg-indigo-300 hover:!bg-indigo-400 !rounded-md !transition-all !shadow-md !border-none text-white no-underline inline-flex items-center"
            >
                + Add Product
            </router-link>
        </Button>
      </div>

      <div class="overflow-x-auto">
         <table class="w-full text-left">
            <thead>
              <tr class="text-gray-500 border-b">
                <th class="py-3">ID</th>
                <th class="py-3">Product Name</th>
                <th class="py-3">Description</th>
                <th class="py-3">Category</th>
                <th class="py-3">Price</th>
                <th class="py-3">Size</th>
                <th class="py-3">Colors</th>
                <th class="py-3">Is Active ?</th>
                <th class="py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="loading">
                <td colspan="6" class="py-20 text-center">
                  <div class="flex flex-col items-center justify-center gap-3">
                    <!-- <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" /> -->
                    <ProgressSpinner 
                      class="w-[50px] h-[50px] animate-spin" 
                      strokeWidth="4" 
                      fill="transparent"
                    />
                    <span class="text-gray-500 text-sm">Fetching products...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="products.length === 0">
                <td colspan="6" class="py-10 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
              <tr
                v-else
                v-for="product in paginatedProducts"
                :key="product.id"
                class="border-b hover:bg-gray-50"
              >
                <td class="py-3">{{ product.id }}</td>
                <td class="py-3 font-medium">{{ product.name }}</td>
                <td class="py-3">{{ product.description ? product.description : '-' }}</td>
                <td class="py-3">{{ product.category.name }}</td>
                <td class="py-3">{{ product.price }}</td>
                <td class="py-3"> {{ [...new Set(product.variants.map(s => s.size))].join(', ') }}</td>
                <td class="py-3"> {{ [...new Set(product.variants.map(v => v.color))].join(', ') }}</td>
                <td class="py-3">
                  <span :class="['px-3 py-1 text-xs rounded-full', product.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600']">
                    {{ product.is_active ? 'Active': 'Inactive' }}
                  </span>
                </td>
                <td class="py-3 text-center space-x-3">
                  <Button>
                    <router-link :to="'/edit-product/' + product.id"><span class="pi pi-pencil"></span></router-link>
                  </button>
                  <!-- <Button icon="pi pi-trash" severity="danger" @click="visible = true" /> -->
                   <Button 
                      icon="pi pi-trash" 
                      severity="danger" 
                      @click="openDeleteDialog(product.id)" 
                    />
                </td>
              </tr>
            </tbody>
          </table>
          <div class="mt-4 float-end">
              <Paginator 
                v-model:first="first" 
                v-model:rows="rows" 
                :totalRecords="products.length" 
                :rowsPerPageOptions="[5, 10, 20, 50]"
                template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                @page="onPage($event)"
              />
          </div>
      </div>
    </div>
  </div>
  <Dialog 
    v-model:visible="visible" 
    modal 
    header="Delete Product" 
    :style="{ width: '50rem' }" 
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
      <div>
        <p>Are You Sure Delete a Product</p>
          <!-- <ul >
            <li 
              v-for="(item, index) in selectedName" 
              :key="index"
              
            >
              <span v-if="index === 0" class="text-sm text-yellow-700 text-3xl"> Are you sure you want to delete this category: {{ item }}</span>
              <span v-else>{{ item }}</span>
            </li>
          </ul> -->
      </div> 
      
      <template #footer>
          <div class="flex justify-content-end gap-2">
              <Button label="No" icon="pi pi-times" @click="visible = false" class="p-button-text" />
              <Button label="Confirm" icon="pi pi-check" unstyled
                class="px-6 py-2.5 bg-indigo-300 hover:bg-indigo-300 rounded" @click="handleDelete(selectedId)" autofocus />
          </div>
      </template>
  </Dialog>

</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { toast } from 'vue3-toastify';
import 'primeicons/primeicons.css'
import ProgressSpinner from 'primevue/progressspinner';
import Paginator from 'primevue/paginator';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import axios from 'axios'; 
import { useDialog } from 'primevue/usedialog';

const products = ref([]);
const loading = ref(true);
const error = ref(null);
const successMessage = ref('')

const first = ref(0); 
const rows = ref(5); 

const visible = ref(false);
const selectedId = ref(null);
const selectedName = ref('');

const openDeleteDialog = (id) => {
  selectedId.value = id;
  visible.value = true;
};
const paginatedProducts = computed(() => {
  return products.value.slice(first.value, first.value + rows.value);
});
const onPage = (event) => {
    first.value = event.first;
    rows.value = event.rows;
};
const fetchProducts = async () => {
  try {
    const token = localStorage.getItem('api_token')

      const response = await axios.get('/api/products', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      })
    products.value = response.data.data; // Assign the response data to the reactive ref
    console.log(response.data)
  } catch (err) {
    error.value = 'Failed to fetch products: ' + err.message;
  } finally {
    loading.value = false;
  }
};
const handleDelete = async (productId) => {
    try {
        const token = localStorage.getItem('api_token');
        const response = await axios.delete(`/api/products/delete/${productId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json'
            }
        });

        if (response) {
            visible.value = false;
            loading.value = true;
            await fetchProducts();
            loading.value = false;
        }
        toast.success('Category deleted successfully!'); 
        
    } catch (error) { 
        if (error.response && error.response.data.status === 'error') {
            toast.error(error.response.data.message);
        } else {
            toast.error('An unexpected error occurred.');
        }
    } 
}; 
onMounted(() => {
  fetchProducts();
  const successMsg = sessionStorage.getItem('toastMsg');
  if (successMsg) {
    toast.success(successMsg, {
      position: 'top-right',
    });
    sessionStorage.removeItem('toastMsg');
  }
  
});
</script>