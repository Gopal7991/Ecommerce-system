
<template>
  <div class="p-6 min-h-screen">
    
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

          <Button asChild>
            <router-link 
              to="/add-product" 
              class="px-6 py-2.5 !bg-indigo-300 hover:!bg-indigo-400 !rounded-md !transition-all !shadow-md !border-none text-white no-underline inline-flex items-center"
            >
              + Add Product
            </router-link>
          </Button>
        </div>
      </div>

      <div class="overflow-x-auto">
         <table class="w-full text-left">
            <thead>
              <tr class="text-gray-500 border-b">
                <th class="py-3">ID</th>
                <th class="py-3">Product Name</th>
                <!-- <th class="py-3">Description</th> -->
                <th class="py-3">Category</th>
                <th class="py-3">Price</th>
                <th class="py-3">Images</th>
                <!-- <th class="py-3">Size</th> -->
                <!-- <th class="py-3">Colors</th> -->
                <th class="py-3">Is Active ?</th>
                <th class="py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="loading">
                <td colspan="6" class="py-20 text-center">
                  <div class="flex flex-col items-center justify-center gap-3">
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
                <!-- <td class="py-3">{{ product.description ? product.description : '-' }}</td> -->
                <td class="py-3">{{ product.category.name }}</td>
                <td class="py-3">{{ product.price }}</td>
                <td class="py-3">
                  <Button 
                    icon="pi pi-images" 
                    label="Manage" 
                    class="p-button-sm p-button-outlined" 
                    @click="openImagePopup(product)" 
                  />
                  </td>
                <!-- <td class="py-3"> {{ [...new Set(product.variants.map(s => s.size))].join(', ') }}</td> -->
                <!-- <td class="py-3"> {{ [...new Set(product.variants.map(v => v.color))].join(', ') }}</td> -->
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
      </div> 
      
      <template #footer>
          <div class="flex justify-content-end gap-2">
              <Button label="No" icon="pi pi-times" @click="visible = false" class="p-button-text" />
              <Button label="Confirm" icon="pi pi-check" unstyled
                class="px-6 py-2.5 bg-indigo-300 hover:bg-indigo-300 rounded" @click="handleDelete(selectedId)" autofocus />
          </div>
      </template>
  </Dialog>

  <Dialog 
    v-model:visible="imageDialogVisible" 
    modal 
    :header="'Manage Images: ' + (activeProduct?.name || '')" 
    :style="{ width: '45rem' }"
  >
   
    <div class="p-4">
     <FilePond
        ref="pond"
        name="product_images"
        label-idle="Drop images here or <span class='filepond--label-action'>Browse</span>"
        :allow-multiple="true"
        :allow-image-preview="true"
        :allow-image-crop="true"
        :allow-image-edit="true"
        :image-edit-editor="imageEditEditor"
        image-crop-aspect-ratio="1:1"
        :files="tempFiles"
        :credits="false"
         @removefile="removeImage"
        
      />

    </div>
    <template #footer>
      <Button label="Close" icon="pi pi-times" @click="imageDialogVisible = false" text />
      <Button 
        label="Update Images"
        icon="pi pi-check"
        unstyled
        class="bg-indigo-300 hover:bg-indigo-300 rounded px-4"
        @click="updateImages"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { toast } from 'vue3-toastify';
import 'primeicons/primeicons.css'
import ProgressSpinner from 'primevue/progressspinner';
import Paginator from 'primevue/paginator';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import axios from 'axios'; 
import { useDialog } from 'primevue/usedialog';

import vueFilePond from "vue-filepond";

import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginImageCrop from "filepond-plugin-image-crop";
import FilePondPluginImageEdit from "filepond-plugin-image-edit";

import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import FilePondPluginImageTransform from "filepond-plugin-image-transform";
import { openDefaultEditor } from "@pqina/pintura";
import "@pqina/pintura/pintura.css";

const FilePond = vueFilePond(
  FilePondPluginImagePreview,
  FilePondPluginImageCrop,
  FilePondPluginImageEdit,
  FilePondPluginImageTransform
);
const search = ref('');
const imageEditEditor = {
  open: async (file, instructions) => {
    console.log("Opening Pintura editor with file:", file);

    let fileToEdit = file;

    if (typeof file === 'string') {
      const res = await fetch(file);
      const blob = await res.blob();
      fileToEdit = new File([blob], 'image.jpg', { type: blob.type });
    }

    const editor = openDefaultEditor({
      src: fileToEdit,
      imageCropAspectRatio: 1,
      imageTransformOutputQuality: 1, 
    });

   editor.on("process", async (result) => {

    const editedBlob = result.dest;

    const editedFile = new File(
      [editedBlob],
      fileToEdit.name,
      { type: editedBlob.type }
    );

    const files = pond.value.getFiles();

    // find the file being edited
    const fileIndex = files.findIndex(f => f.file.name === fileToEdit.name);

    if (fileIndex !== -1) {
      pond.value.removeFile(files[fileIndex].id);
      pond.value.addFile(editedFile, { index: fileIndex });
    }

    instructions.onconfirm({ file: editedFile });

    editor.close();
  });

    editor.on("close", () => {
      instructions.oncancel();
    });
  }
};
const pond = ref(null);
const products = ref([]);
const loading = ref(true);
const error = ref(null);
const successMessage = ref('')
const first = ref(0); 
const rows = ref(5); 
const visible = ref(false);
const selectedId = ref(null);
const selectedName = ref('');
const deletedImages = ref([]);
const imageDialogVisible = ref(false);
const activeProduct = ref(null);
const tempFiles = ref([]);
const sortOption = ref('');
const filteredProducts = computed(() => {
  if (!search.value) return products.value;

  return products.value.filter(p => 
    p.name.toLowerCase().includes(search.value.toLowerCase()) ||
    p.category.name.toLowerCase().includes(search.value.toLowerCase())
  );
});
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
        search: search.value
      }
    });

    products.value = response.data.data;
  } catch (err) {
    toast.error('Failed to fetch products: ' + err.message);
  } finally {
    loading.value = false;
  }
};

watch([sortOption, search], () => {
  fetchProducts();
});

const openImagePopup = async (product) => {
  try {

    activeProduct.value = product;

    const token = localStorage.getItem("api_token");

    const response = await axios.get(`/api/products/${product.id}/images`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      }
    });

    const images = response.data.images;

    tempFiles.value = images.map(img => ({
    source: img.url,
    options: {
      type: "local",
      file: {
        name: img.url.split('/').pop(),
        size: 123456,
        type: "image/jpeg"
      },
      metadata: {
        id: img.id,
        poster: img.url
      }
    }
  }));

    imageDialogVisible.value = true;

  } catch (error) {
    toast.error("Failed to load product images");
  }
};


const updateImages = async () => {
  try {
    if (!pond.value) return toast.error("FilePond not ready");

    const newFiles = pond.value.getFiles().filter(f => f.file instanceof File);

    if (!newFiles.length) {
      return toast.error("Please upload at least one new image");
    }

    const formData = new FormData();
    newFiles.forEach(fileItem => formData.append("images[]", fileItem.file));
    formData.append("product_id", activeProduct.value.id);

    const token = localStorage.getItem("api_token");

    await axios.post("/api/products/upload-images", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      }
    });

    toast.success("Images uploaded successfully");

    await openImagePopup(activeProduct.value);

  } catch (error) {
    console.error(error);
    toast.error(
      error.response?.data?.message || "Image upload failed"
    );
  }
};

const removeImage = async (error, file) => {

  const imageId = file.getMetadata("id");

  // If it is newly uploaded image (not in DB)
  if (!imageId) return;

  try {

    const token = localStorage.getItem("api_token");

    await axios.delete(`/api/products/delete-image/${imageId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    toast.success("Image deleted successfully");

  } catch (error) {

    toast.error("Image delete failed");

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

<!-- <style scoped>
@reference "tailwindcss";

/* 1. Remove the black background from the preview images */
:deep(.filepond--image-preview-wrapper),
:deep(.filepond--image-preview),
:deep(.filepond--file) {
  background-color: transparent !important;
}

/* 2. Add padding on all 4 sides so images don't touch the gray border */
:deep(.filepond--list) {
  @apply flex flex-wrap !p-10; /* Increased to p-10 for more breathing room */
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 20px !important; /* Space between the images */
}

/* 3. Adjust item width for the 2-column layout with the new gap */
:deep(.filepond--item) {
  width: calc(50% - 10px) !important;
  @apply !m-0;
}

/* 4. Fix for the inner 'clip' area that can sometimes stay black */
:deep(.filepond--image-clip) {
  background-color: transparent !important;
}
</style> -->



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

