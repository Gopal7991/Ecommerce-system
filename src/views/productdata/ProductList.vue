
<template> 
<div class="p-6 min-h-screen">
    
    <!-- <div class="bg-indigo-100 rounded-xl p-3 mb-6">
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
    </div> -->

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
            <div class="flex gap-4 items-center">
                <select v-model="selectedBrand" class="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 ml-180">
                  <option value="" disabled>Select a brand</option>
                  <option 
                    v-for="brand in brands" 
                    :key="brand.id" 
                    :value="brand.id">
                    {{ brand.name }}
                  </option>
                </select>
            </div>
            <div class="flex gap-4 items-center">
            <select 
                v-model="sortOption" 
                class="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
                <option value="">Sort By</option>
                <option value="name_asc">Product Name: A → Z</option>
                <option value="name_desc">Product Name: Z → A</option>
                <option value="price_low_high">Price: Low → High</option>
                <option value="price_high_low">Price: High → Low</option>
            </select>
            </div>
        </div>
        <div class="min-h-screen bg-gray-100 py-7 px-4">
            <div class="flex flex-wrap -mx-3">
                <div v-for="product in filteredProducts" :key="product.id" class="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-3 mb-6">
                    <div class="bg-white rounded-md shadow-lg hover:shadow-xl transition duration-300 overflow-hidden flex flex-col">
                        <div class="relative w-full h-64">
                            <img
                                v-if="product.images.length"
                                :src="product.images[0].url"
                                alt="product image"
                                class="object-cover w-full h-full"
                            />
                        </div>
                        <!-- <div class="p-4 flex flex-col flex-1 justify-between">
                            <span class="text-xs font-medium text-gray-500 mb-2">{{ product.category.name }}</span>
                            <h2 class="text-lg font-semibold mb-2">{{ product.name }}</h2>
                            <p class="text-indigo-600 font-bold mb-2">${{ product.price }}</p>

                            <div class="flex justify-between items-center mt-3">
                                <span
                                :class="[
                                    'px-3 py-1 text-xs rounded-full',
                                    product.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                ]"
                                >
                                    {{ product.is_active ? 'Active' : 'Inactive' }}
                                </span>

                                <div class="flex space-x-3 text-gray-500 text-xs">
                                    <div class="flex items-center space-x-1">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 10l4.553-2.276A2 2 0 0122 9.618v4.764a2 2 0 01-2.447 1.894L15 14m-6 0l-4.553 2.276A2 2 0 012 14.382V9.618a2 2 0 012.447-1.894L9 10m6 0V4m-6 0v6">
                                        </path>
                                        </svg>
                                        <span>1883</span>
                                    </div>
                                    <div class="flex items-center space-x-1">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M8 10h8M8 14h6M9 18h-3a3 3 0 01-3-3v-8a3 3 0 013-3h12a3 3 0 013 3v8a3 3 0 01-3 3h-3l-3 3-3-3z">
                                        </path>
                                        </svg>
                                        <span>3</span>
                                    </div>
                                </div>
                            </div>
                        </div> -->
                    
                        <div class="p-4 flex flex-col flex-1 justify-between">
                            <span class="text-xs font-medium text-gray-500 mb-2">{{ product.category.name }}</span>
                            <span class="text-xs font-medium text-gray-500 mb-2"> brand :{{ product.brand.name }}</span>
                            <h2 class="text-lg font-semibold mb-2">{{ product.name }}</h2>
                            <p class="text-indigo-600 font-bold mb-2">₹{{ product.price }}</p>

                            <div class="flex justify-between items-center mt-3">
                                <span
                                :class="[
                                    'px-3 py-1 text-xs rounded-full',
                                    product.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                ]"
                                >
                                {{ product.is_active ? 'Active' : 'Inactive' }}
                                </span>

                                <div class="flex space-x-3 text-gray-500 text-xs">
                                <div class="flex items-center space-x-1">
                                    <!-- <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 10l4.553-2.276A2 2 0 0122 9.618v4.764a2 2 0 01-2.447 1.894L15 14m-6 0l-4.553 2.276A2 2 0 012 14.382V9.618a2 2 0 012.447-1.894L9 10m6 0V4m-6 0v6">
                                    </path>
                                    </svg>
                                    <span>1883</span> -->
                                </div>
                                <div class="flex items-center space-x-1">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M8 10h8M8 14h6M9 18h-3a3 3 0 01-3-3v-8a3 3 0 013-3h12a3 3 0 013 3v8a3 3 0 01-3 3h-3l-3 3-3-3z">
                                    </path>
                                    </svg>
                                    <!-- <span>3</span> -->
                                </div>
                                </div>
                            </div>
                            <div class="mt-4">
                                <router-link
                                :to="`/product/${product.id}`"
                                class="w-full inline-block text-center !bg-indigo-300 hover:!bg-indigo-400 text-white px-4 py-2 rounded transition"
                                >
                                View Details
                                </router-link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { toast } from 'vue3-toastify';
import 'primeicons/primeicons.css'
//import Carousel from 'primevue/carousel';
import Button from 'primevue/button';
import axios from 'axios'; 
import vueFilePond from "vue-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginImageCrop from "filepond-plugin-image-crop";
import FilePondPluginImageEdit from "filepond-plugin-image-edit";

import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import FilePondPluginImageTransform from "filepond-plugin-image-transform";
import { openDefaultEditor } from "@pqina/pintura";
import "@pqina/pintura/pintura.css";
const selectedBrand = ref('');
import { useRoute } from 'vue-router';
const route = useRoute();
const productId = route.query.sub_category_id;

const FilePond = vueFilePond(
  FilePondPluginImagePreview,
  FilePondPluginImageCrop,
  FilePondPluginImageEdit,
  FilePondPluginImageTransform
);
const search = ref('');

const products = ref([]);
const loading = ref(true);

const sortOption = ref('');
const filteredProducts = computed(() => {
  if (!search.value) return products.value;

  return products.value.filter(p => 
    p.name.toLowerCase().includes(search.value.toLowerCase()) ||
    p.category.name.toLowerCase().includes(search.value.toLowerCase())
  );
});

function useBrands() {
  const brands = ref([])
  const fetchBrands = async () => {
    try {
      const token = localStorage.getItem('api_token')
      const response = await axios.get('/api/products/brands', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      })
      brands.value = response.data
      // console.log(brands.value)
    } catch (error) {
      console.error('Error fetching brands:', error)
    }
  }
  return { brands, fetchBrands }
}
// const selectBrandValue = () => {
//   // alert('Selected: ' + selectedBrand.value);
// };

const { brands, fetchBrands } = useBrands()

const fetchProducts = async () => {

  try {
    loading.value = true;
    const token = localStorage.getItem('api_token');

    let sort_by = '';
    let sort_order = 'asc';
    switch (sortOption.value) {
      case 'name_asc': sort_by = 'name'; sort_order = 'asc'; break;
      case 'name_desc': sort_by = 'name'; sort_order = 'desc'; break;
      case 'price_low_high': sort_by = 'price'; sort_order = 'asc'; break;
      case 'price_high_low': sort_by = 'price'; sort_order = 'desc'; break;
      default: sort_by = 'id'; sort_order = 'asc';
    }

    const response = await axios.get('/api/products', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      params: {
        sort_by,
        sort_order,
        search: search.value,
        brand_id: selectedBrand.value,
        sub_category_id: route.query.sub_category_id 
        
      }
    });

    //products.value = response.data.data;
    products.value = response.data.data.map(product => {
      product.images = product.images.map(img => ({
        ...img,
        url: `http://localhost:8000/storage/${img.image}`
      }));
      return product;
    });
    
  } catch (err) {
    toast.error('Failed to fetch products: ' + err.message);
  } finally {
    loading.value = false;
  }
};

watch([sortOption, search, selectedBrand], () => {
  fetchProducts();
});

watch(
  () => route.query.sub_category_id,
  () => {
    fetchProducts();
  }
);
onMounted(() => {
  fetchProducts();
  fetchBrands();
  
});
</script>



<style scoped>
@reference "tailwindcss";

:deep(.filepond--list) {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 12px !important; /* space between images */
  padding: 8px !important; /* inner padding */
}

/* Two images per row with 10% bigger squares (~145px) */
:deep(.filepond--item) {
  width: calc(50% - 6px) !important; /* two per row minus half gap */
  height: 160px !important;           /* 10% bigger than 132px */
  position: relative !important;
  transform: none !important;
  margin: 0 !important;
}

/* Panel background */
:deep(.filepond--panel-root) {
  @apply bg-gray-200/50 rounded-xl;
}

/* Remove dark preview background */
:deep(.filepond--image-preview-wrapper),
:deep(.filepond--file) {
  background-color: transparent !important;
}

/* Make inner preview fill the square */
:deep(.filepond--image-preview-wrapper) {
  width: 100% !important;
  height: 100% !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Image fill container and crop */
:deep(.filepond--image-preview img) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important; /* crop to fill square */
}

/* Force square crop overlay */
:deep(.filepond--image-clip) {
  aspect-ratio: 1 / 1;
}

/* Responsive: single column on very small screens */
@media (max-width: 480px) {
  :deep(.filepond--item) {
    width: 100% !important;
    height: 120px !important; /* scale smaller for tiny screens */
  }
}
</style>



// // Watch for changes in the URL query strings
// watch(() => route.query, () => {
//     fetchProducts();
// }, { deep: true });

// const fetchProducts = async () => {
//     const params = {
//         search: route.query.search || '',
//         brand_id: route.query.brand_id || '',
//         category_id: route.query.category_id || '',
//         sub_category_id: route.query.sub_category_id || '',
//         // ... your other params
//     };
    
//     const response = await axios.get('/api/products', { params });
//     products.value = response.data.data;
// };

// // Run once on mount
// onMounted(() => {
//     fetchProducts();
// });
