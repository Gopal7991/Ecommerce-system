
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
          <Button asChild>
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
        <table class="w-full text-left">
          <thead>
            <tr class="text-gray-500 border-b">
              <th class="py-3">ID</th>
              <th class="py-3">Coupon Name</th>
              <th class="py-3">Coupon Code</th>
              <th class="py-3">Coupon Type</th>
              <th class="py-3">Coupon Expire Date</th>
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
                    <span class="text-gray-500 text-sm">Fetching Coupons...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="coupons.length === 0">
                <td colspan="6" class="py-10 text-center text-gray-500">
                  No coupons found.
                </td>
              </tr>
              <!-- v-for="category in paginatedCategories" -->
              <tr
                v-else
                v-for="coupon in paginatedCoupons"
                :key="coupon.id"
                class="border-b hover:bg-gray-50"
              >
                <td class="py-3">{{ coupon.id }}</td>
                <td class="py-3 font-medium">{{ coupon.name }}</td>
                <td class="py-3">{{ coupon.code }}</td>
                <td class="py-3">{{ coupon.coupon_type }}</td>
                <td class="py-3">{{ coupon.end_date }}</td>
                <td class="py-3">
                  <span :class="['px-3 py-1 text-xs rounded-full', coupon.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600']">
                    {{ coupon.is_active ? 'Active': 'Inactive' }}
                  </span>
                </td>
                <td class="py-3 text-center space-x-3">
                  <Button v-if="coupon.used_count <=0">
                    <router-link :to="'/edit-coupon/' + coupon.id"><span class="pi pi-pencil"></span></router-link>
                  </button>
                  
                  <button v-else disabled class="btn-disabled" title="Cannot edit used coupon">
                    <span class="pi pi-lock text-gray-400"></span>
                  </button>

                   <Button 
                      icon="pi pi-trash" 
                      severity="danger" 
                      @click="openDeleteDialog(coupon.id, coupon.name)" 
                    />
                </td>
              </tr>
            </tbody>
        </table>
          <div class="mt-4 float-end">
              <Paginator 
                v-model:first="first" 
                v-model:rows="rows" 
                :totalRecords="coupons.length" 
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
    header="Delete Coupon" 
    :style="{ width: '50rem' }" 
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
      <div>
          <p>Are you sure you want to delete this category: {{ selectedName }}?</p>
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
import { ref, onMounted, computed, watch } from 'vue';
import { toast } from 'vue3-toastify';
import 'primeicons/primeicons.css'
import axios from 'axios'; 
import ProgressSpinner from 'primevue/progressspinner';
import Paginator from 'primevue/paginator';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import { useDialog } from 'primevue/usedialog';

const coupons = ref([]);
const loading = ref(true);
const error = ref(null);
const successMessage = ref('')
const visible = ref(false);
const selectedId = ref(null);
const selectedName = ref('');

const first = ref(0); 
const rows = ref(5); 

const fetchCoupons = async () => {
  try {
    const token = localStorage.getItem('api_token')

      const response = await axios.get('/api/coupons', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      })
    coupons.value = response.data.data; 
    console.log('response data',response.data)
  } catch (err) {
    error.value = 'Failed to fetch coupons: ' + err.message;
  } finally {
    loading.value = false;
  }
};
const paginatedCoupons = computed(() => {
  return coupons.value.slice(first.value, first.value + rows.value);
});
const onPage = (event) => {
    first.value = event.first;
    rows.value = event.rows;
};
const openDeleteDialog = (id, couponname) => {
  selectedId.value = id;
    selectedName.value = couponname;
  visible.value = true;
};
const handleDelete = async (couponId) => {
    try {
        const token = localStorage.getItem('api_token');
        const response = await axios.delete(`/api/coupons/delete/${couponId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json'
            }
        });

        if (response) {
            visible.value = false;
            loading.value = true;
            await fetchCoupons();
            loading.value = false;
        }
        toast.success('Coupon deleted successfully!'); 
        
    } catch (error) { 
        if (error.response && error.response.data.status === 'error') {
            toast.error(error.response.data.message);
        } else {
            toast.error('An unexpected error occurred.');
        }
    } 
}; 
onMounted(() => {
  fetchCoupons();
  const successMsg = sessionStorage.getItem('toastMsg');
  if (successMsg) {
    toast.success(successMsg, {
      position: 'top-right',
    });
    sessionStorage.removeItem('toastMsg');
  }
  
});
</script>


  // FIXED100
  // BRDNK10