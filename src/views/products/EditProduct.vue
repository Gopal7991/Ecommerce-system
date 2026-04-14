<script setup>
import { onMounted, ref, watch } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'
import { toast } from 'vue3-toastify';
import { Form, Field, ErrorMessage } from 'vee-validate';
import * as yup from 'yup';
import Button from 'primevue/button';
import MultiSelect from 'primevue/multiselect';

const goBack = () => {
    if (window.history.length > 1) {
        router.back();
    } else {
        router.push('/products'); 
    }
};

const hasVariants = ref(false);
const router = useRouter()
const route = useRoute() 
const productId = route.params.id

const selectedSizes = ref([]);
const selectedColors = ref([]);
const productVariants = ref([]);
const sizeSearchQuery = ref('');
const colorSearchQuery = ref('');

const onSizeFilter = (event) => { sizeSearchQuery.value = event.value; };
const oncolorFilter = (event) => { colorSearchQuery.value = event.value; };

const sizes = ref([
    { label: 'S', value: 's' },
    { label: 'M', value: 'm' },
    { label: 'L', value: 'l' },
    { label: 'XL', value: 'xl' }
]);

const colors = ref([
    { label: 'Red', value: 'red' },
    { label: 'Blue', value: 'blue' },
    { label: 'Black', value: 'black' },
    { label: 'White', value: 'white' }
]);

const addNewSize = () => {
    let newLabel = sizeSearchQuery.value;
    if (!newLabel) return;
    const newValue = newLabel.toLowerCase().replace(/\s/g, '');
    const newSize = { label: newLabel, value: newValue };
    
    if (!sizes.value.some(s => s.label === newLabel)) sizes.value.push(newSize);
    selectedSizes.value.push(newSize);
    sizeSearchQuery.value = '';
};

const addNewColor = () => {
    let newColorLabel = colorSearchQuery.value;
    if (!newColorLabel) return;
    const newColorValue = newColorLabel.toLowerCase().replace(/\s/g, '');
    const newColor = { label: newColorLabel, value: newColorValue };
    
    if (!colors.value.some(c => c.label === newColorLabel)) colors.value.push(newColor);
    selectedColors.value.push(newColor);
    colorSearchQuery.value = '';
};

const generateVariants = () => {
    const sList = Array.isArray(selectedSizes.value) ? selectedSizes.value : [];
    const cList = Array.isArray(selectedColors.value) ? selectedColors.value : [];

    if (sList.length === 0 || cList.length === 0) {
        toast.warn("Please select both Sizes and Colors first!");
        return;
    }
    const combinations = [];
    sList.forEach(s => {
        cList.forEach(c => {
            combinations.push({
                size: s.label,
                color: c.label,
                quantity: 0,
                is_active: true
            });
        });
    });
    productVariants.value = combinations;
};

const Schema = yup.object({
  name: yup.string().required('Product name is required'),
  description: yup.string().required('Description is required'),
  category_id: yup.string().required('Please select a category'),
  brand_id: yup.string().required('Please select a brand'),
  price: yup.number().typeError('Price must be a number').required('Price is required'),
  sku: yup.string().required('SKU is required'),
});

const categories = ref([])
const brands = ref([])
const loading = ref(false)

const fetchCategories = async () => {
    try {
        const token = localStorage.getItem('api_token')
        const response = await axios.get('/api/categories/category-with-child', {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
        })

        categories.value = response.data.original || []
    } catch (error) { console.error(error) }
}

const fetchBrands = async () => {
    try {
      const token = localStorage.getItem('api_token')
      const response = await axios.get('/api/products/brands', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      })
      brands.value = response.data.data
      console.log(brands.value)
    } catch (error) {
      console.error('Error fetching brands:', error)
    }
}
const formData = ref({
  name: '', description: '', category_id: null, brand_id: null, price: null,
  discount_price: null, sku: '', quantity: 0, gender: '', is_active: true
})

const fetchProductData = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem('api_token')
    const response = await axios.get(`/api/products/edit/${productId}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
    })
    const product = response.data.data;
    formData.value = { ...product };
    
    if (product.variants && product.variants.length > 0) {
        hasVariants.value = true;
        productVariants.value = product.variants;

        product.variants.forEach(v => {
            if (!sizes.value.some(s => s.label === v.size)) {
                sizes.value.push({ label: v.size, value: v.size.toLowerCase() });
            }
            if (!colors.value.some(c => c.label === v.color)) {
                colors.value.push({ label: v.color, value: v.color.toLowerCase() });
            }
        });

        const dbSizes = [...new Set(product.variants.map(v => v.size))];
        selectedSizes.value = sizes.value.filter(s => dbSizes.includes(s.label));

        const dbColors = [...new Set(product.variants.map(v => v.color))];
        selectedColors.value = colors.value.filter(c => dbColors.includes(c.label));
    }
  } catch (error) { toast.error("Error loading data"); } 
  finally { loading.value = false; }
}

const submitProduct = async (values, { setErrors }) => {
    if (hasVariants.value) {
        const invalidVariant = productVariants.value.find(v => 
            v.is_active == 1 && (v.quantity === null || v.quantity === '' || v.quantity <= 0)
        );

        if (invalidVariant) {
            setErrors({ 
                variants: `Quantity is required for active variant: ${invalidVariant.size} - ${invalidVariant.color}` 
            });
            toast.error("Please fix variant quantities.");
            return;
        }
    }
  try {
    loading.value = true;
    const token = localStorage.getItem('api_token')
    const payload = {
        ...formData.value,
        quantity: hasVariants.value ? 0 : formData.value.quantity,
        variants: hasVariants.value ? productVariants.value : [],
        _method: 'PUT' 
    };
    await axios.post(`/api/products/update/${productId}`, payload, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
    })
    sessionStorage.setItem('toastMsg', 'Product updated successfully!')
    router.push('/products'); 
  } catch (error) {
    if (error.response?.status === 422) setErrors(error.response.data.errors); 
    else toast.error('Something went wrong!');
  } finally { loading.value = false; }
}

watch(hasVariants, (newVal) => { if (newVal) formData.value.quantity = 0; });

onMounted(async () => {
  await fetchCategories();
  await fetchProductData();
  await fetchBrands(); 
})
</script>

<template>
  <div class="p-6 min-h-screen">
    <div class="bg-indigo-100 rounded-xl p-6 mb-6">
        <h1 class="text-2xl font-semibold text-indigo-900">Edit Product</h1>
        <p class="text-indigo-700 mt-1">
            <router-link to="/products" class="font-medium hover:underline">Products</router-link> . Edit
        </p>
    </div>

    <div v-if="!loading" class="bg-white rounded-xl shadow p-6">
      <Form :validation-schema="Schema" :initial-values="formData" @submit="submitProduct">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">Product Name <span class="text-red-500">*</span></label>
          <Field name="name" v-model="formData.name" class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border text-xs focus:border-gray-500 focus:outline-none" />
          <ErrorMessage name="name" class="text-red-500 text-sm" />
        </div>

         <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">Product Description <span class="text-red-500">*</span></label>
          <Field 
                name="description" 
                as="textarea" 
                v-model="formData.description"
                rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border text-xs focus:border-gray-500 focus:outline-none"
                placeholder="Product description"
            />
            <ErrorMessage name="description" class="text-red-500 text-sm mt-1 block" />
          
        </div>

        <!-- <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Category <span class="text-red-500">*</span></label>
            <Field name="category_id" as="select" v-model="formData.category_id" class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border text-xs focus:border-gray-500 focus:outline-none">
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </Field>
        </div> -->
        <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">Category <span class="text-red-500">*</span></label>
                <Field name="category_id" as="select" v-model="formData.category_id" class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border text-xs focus:border-gray-500 focus:outline-none">
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </Field>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Brand <span class="text-red-500">*</span></label>
                <Field name="brand_id" as="select" v-model="formData.brand_id" class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border text-xs focus:border-gray-500 focus:outline-none">
                    <option v-for="brand in brands" :key="brand.id" :value="brand.id">{{ brand.name }}</option>
                </Field>
                <ErrorMessage name="brand_id" class="text-red-500 text-sm mt-1 block" />
            </div>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">Price <span class="text-red-500">*</span></label>
                <Field name="price" type="number" v-model="formData.price" class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border text-xs focus:border-gray-500 focus:outline-none" />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Discount</label>
                <Field name="discount_price" v-model="formData.discount_price" class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border text-xs focus:border-gray-500 focus:outline-none" />
            </div>
        </div>

        <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">SKU <span class="text-red-500">*</span></label>
            <Field name="sku" v-model="formData.sku" class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border text-xs focus:border-gray-500 focus:outline-none" />
        </div>
        <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 font-semibold mb-2">Gender</label>
            <div class="flex items-center gap-6 mt-2">
                <label class="flex items-center cursor-pointer">
                    <Field 
                        name="gender" 
                        type="radio" 
                        value="male" 
                        v-model="formData.gender" 
                        class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" 
                    />
                    <span class="ml-2 text-sm text-gray-700">Male</span>
                </label>

                <label class="flex items-center cursor-pointer">
                    <Field 
                        name="gender" 
                        type="radio" 
                        value="female" 
                        v-model="formData.gender" 
                        class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" 
                    />
                    <span class="ml-2 text-sm text-gray-700">Female</span>
                </label>

                <label class="flex items-center cursor-pointer">
                    <Field 
                        name="gender" 
                        type="radio" 
                        value="unisex" 
                        v-model="formData.gender" 
                        class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" 
                    />
                    <span class="ml-2 text-sm text-gray-700">Unisex</span>
                </label>

            </div>
            <ErrorMessage name="gender" class="text-red-500 text-sm mt-1 block" />
        </div>
        <div v-if="!hasVariants" class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Quantity</label>
            <Field name="quantity" type="number" v-model="formData.quantity" class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border text-xs focus:border-gray-500 focus:outline-none" />
        </div>

        <div class="flex items-center gap-2 mb-6 p-4 bg-gray-50 rounded-lg border">
            <input type="checkbox" id="hasVariants" v-model="hasVariants" class="h-5 w-5 text-indigo-600 rounded" />
            <label for="hasVariants" class="font-semibold text-gray-700">This product has variants</label>
        </div>

        <div v-if="hasVariants">
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Sizes</label>
                    <MultiSelect v-model="selectedSizes" :options="sizes" optionLabel="label" filter @filter="onSizeFilter" display="chip" class="w-full mt-1 border">
                        <template #footer>
                            <div class="p-2 flex justify-between bg-gray-50 border-t">
                                <Button label="Add New" icon="pi pi-plus" text size="small" @click="addNewSize" />
                                <Button label="Clear" severity="danger" text size="small" @click="selectedSizes = []" />
                            </div>
                        </template>
                    </MultiSelect>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Colors</label>
                    <MultiSelect v-model="selectedColors" :options="colors" optionLabel="label" filter @filter="oncolorFilter" display="chip" class="w-full mt-1 border">
                        <template #footer>
                            <div class="p-2 flex justify-between bg-gray-50 border-t">
                                <Button label="Add New" icon="pi pi-plus" text size="small" @click="addNewColor" />
                                <Button label="Clear" severity="danger" text size="small" @click="selectedColors = []" />
                            </div>
                        </template>
                    </MultiSelect>
                </div>
            </div>
            
            <div class="flex justify-end mb-4">
                <Button label="Generate New Table" icon="pi pi-cog" @click="generateVariants" class="p-button-outlined p-button-sm" />
            </div>

            <div v-if="productVariants.length > 0" class="overflow-x-auto border rounded-lg">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Size</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Color</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Is Active</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white">
                        <tr v-for="(v, i) in productVariants" :key="i" class="border-b">
                            <td class="px-4 py-3 text-sm">{{ v.size }}</td>
                            <td class="px-4 py-3 text-sm">{{ v.color }}</td>
                            <td class="px-4 py-3">
                                <input type="number" v-model="v.quantity" class="w-24 border rounded p-1" />
                            </td>
                            <td class="px-4 py-3">
                                <input 
                                    type="checkbox" 
                                    v-model="v.is_active" 
                                    :true-value="1" 
                                    :false-value="0"
                                    class="h-4 w-4 text-indigo-600"
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="mt-8 flex justify-end">
            <button 
                type="button" 
                @click="goBack" 
                class="px-4 py-2 bg-gray-400 text-gray-700 text-white rounded">
                Back
            </button>
            <button type="submit" :disabled="loading" class="px-6 ml-3 py-2.5 !bg-indigo-400 !text-white !rounded-md !transition-all !shadow-md !border-none">
                {{ loading ? 'Saving...' : 'Update Product' }}
            </button>
        </div>
      </Form>
    </div>
    <div v-else class="text-center py-20 text-gray-400 font-medium">Loading Product Details...</div>
  </div>
</template>
