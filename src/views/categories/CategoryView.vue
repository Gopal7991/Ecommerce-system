
<template>
  <div class="p-6  min-h-screen">
    
    <div class="bg-indigo-100 rounded-xl p-6 mb-6">
      <h1 class="text-2xl font-semibold">Categories</h1>
      <p class="text-gray-500 mt-1"> <a href="/dashboard" class="text-black">Dashboard</a> . Categories</p>
      <!-- <p class="text-gray-500 mt-1">{{ categories.length }} Categories Available</p> -->
    </div>

    <div class="bg-white rounded-xl shadow p-6">
      <div v-if="successMessage" class="mb-4 p-3 bg-green-100 text-green-700 rounded" >
        {{ successMessage }}
      </div>
      <div class="flex justify-between items-center mb-6">
        <input
          v-model="search"
          type="text"
          placeholder="Search Category"
          class="border rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        <router-link to="/add-category"><button class="bg-indigo-300 hover:bg-indigo-300 px-4 py-2 rounded-lg ">
          + Add Category
        </button> </router-link>
      </div>

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
              <tr v-if="loading">
                <td colspan="6" class="py-20 text-center">
                  <div class="flex flex-col items-center justify-center gap-3">
                    <!-- <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" /> -->
                    <ProgressSpinner 
                      class="w-[50px] h-[50px] animate-spin" 
                      strokeWidth="4" 
                      fill="transparent"
                    />
                    <span class="text-gray-500 text-sm">Fetching categories...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="categories.length === 0">
                <td colspan="6" class="py-10 text-center text-gray-500">
                  No categories found.
                </td>
              </tr>
              <tr
                v-else
                v-for="category in paginatedCategories"
                :key="category.id"
                class="border-b hover:bg-gray-50"
              >
                <td class="py-3">{{ category.id }}</td>
                <td class="py-3 font-medium">{{ category.name }}</td>
                <td class="py-3">{{ category.parent ? category.parent.name : '-' }}</td>
                <td class="py-3">{{ category.full_name }}</td>
                <td class="py-3">
                  <span :class="['px-3 py-1 text-xs rounded-full', category.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600']">
                    {{ category.is_active ? 'Active': 'Inactive' }}
                  </span>
                </td>
                <td class="py-3 text-center space-x-3">
                  <Button>
                    <router-link :to="'/edit-category/' + category.id"><span class="pi pi-pencil"></span></router-link>
                  </button>
                  <!-- <Button icon="pi pi-trash" severity="danger" @click="visible = true" /> -->
                   <Button 
                      icon="pi pi-trash" 
                      severity="danger" 
                      @click="openDeleteDialog(category.id, category.full_child_name)" 
                    />
                   <!-- <button @click="confirmDelete(category.id, category.name)"><span class="pi pi-trash"></span></button> -->
                  <!-- <button class="delete-btn" @click="deleteCategory(category.id)">
                    <span class="pi pi-trash"></span>
                  </button> -->
                </td>
              </tr>
            </tbody>
          </table>
          <div class="mt-4 float-end">
              <Paginator 
                v-model:first="first" 
                v-model:rows="rows" 
                :totalRecords="categories.length" 
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
    header="Delete Category" 
    :style="{ width: '50rem' }" 
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
      <div>
          <!-- <p>Are you sure you want to delete this category: {{ selectedName }}?</p> -->
          <ul >
            <li 
              v-for="(item, index) in selectedName" 
              :key="index"
              
            >
              <span v-if="index === 0" class="text-sm text-yellow-700 text-3xl"> Are you sure you want to delete this category: {{ item }}</span>
              <span v-else>{{ item }}</span>
            </li>
          </ul>
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
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal.vue";

const categories = ref([]);
const loading = ref(true);
const error = ref(null);
const successMessage = ref('')

const first = ref(0); 
const rows = ref(5); 

const visible = ref(false);
const selectedId = ref(null);
const selectedName = ref('');

// Combined function to manage state
const openDeleteDialog = (id, childrenArray) => {
  selectedId.value = id;
    selectedName.value = Array.isArray(childrenArray) 
      ? childrenArray 
      : childrenArray.split(' ->');
  visible.value = true;
};
const paginatedCategories = computed(() => {
  return categories.value.slice(first.value, first.value + rows.value);
});
const onPage = (event) => {
    first.value = event.first;
    rows.value = event.rows;
};
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
// const handleDelete = async (categoryId) => {
//     try {
//       const token = localStorage.getItem('api_token')
//         const response = await axios.delete(`/api/categories/delete/${categoryId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               Accept: 'application/json'
//             }
//           }
//         );
//         console.log(response)
       
//         if(response)
//         {
//           loading.value = true;
//           fetchCategories();
//           visible = false;
//         }
//         toast.success('Category Delete successfully!'); 
//     } catch (error) {
//         // Handle error response from Laravel
//         if (error.response && error.response.data.status === 'error') {
//             toast.error(error.response.data.message);
//         } else {
//             toast.error('An unexpected error occurred.');
//         }
//     }
// };
const handleDelete = async (categoryId) => {
    try {
        const token = localStorage.getItem('api_token');
        const response = await axios.delete(`/api/categories/delete/${categoryId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json'
            }
        });

        if (response) {
            visible.value = false;
            loading.value = true;
            await fetchCategories();
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