<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify';
import { Form, Field, ErrorMessage } from 'vee-validate';
import * as yup from 'yup';
import Button from 'primevue/button';
import MultiSelect from 'primevue/multiselect';
const hasVariants = ref(false);
const router = useRouter()

const goBack = () => {
    if (window.history.length > 1) {
        router.back();
    } else {
        router.push('/products'); 
    }
};

const selectedSizes = ref([]);
const selectedColors = ref([]);
const productVariants = ref([]);
const sizeSearchQuery = ref('');
const colorSearchQuery = ref('');

const onSizeFilter = (event) => {
    sizeSearchQuery.value = event.value; 
};

const oncolorFilter = (event) => {
    colorSearchQuery.value = event.value; 
};
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
    sizes.value.push(newSize);
    if (!selectedSizes.value) selectedSizes.value = [];
    selectedSizes.value.push(newSize);
};


const addNewColor = () => {
    const newColorLabel = colorSearchQuery.value
     if (!newColorLabel || newColorLabel.trim() === "") return;
    if (!newColorLabel) return;
    const newColorValue = newColorLabel.toLowerCase().replace(/\s/g, '');
    const newColor = { label: newColorLabel, value: newColorValue };
    colors.value.push(newColor);
    if (!selectedColors.value) selectedColors.value = [];
    selectedColors.value.push(newColor);
};

const generateVariants = () => {
   if (selectedSizes.value.length === 0 || selectedColors.value.length === 0) {
        toast.warn("Please select both Sizes and Colors first!");
        return;
    }
    const combinations = [];
    selectedSizes.value.value.forEach(s => {
        selectedColors.value.value.forEach(c => {
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
  price: yup.number().typeError('Price must be a number').required('Price is required'),
  discount_price: yup.number().nullable(),
  gender: yup.string().nullable(),
  quantity: yup.number().nullable(),
  sku: yup.string().required('SKU is required'),
});

function useCategories() {
  const categories = ref([])
  const loading = ref(false)
  const buttonLabel = ref('Save');
  
  const fetchCategories = async () => {
    loading.value = true
    buttonLabel.value = 'Saving...'
    try {
      const token = localStorage.getItem('api_token')
      const response = await axios.get('/api/categories/categories-with-child', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      })
      categories.value = response.data
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      loading.value = false
      buttonLabel.value = 'Save'
    }
  }

  return { categories, loading, fetchCategories }
}

const { categories, loading, fetchCategories } = useCategories()

const formData = ref({
  name: '',
  description: '',
  category_id: null,
  price: null,
  discount_price: null,
  sku: '',
  quantity: 0,
  gender: '',
  is_active: true
})

const submitProduct = async (values, { setErrors }) => {
  try {
    loading.value = true;
    const token = localStorage.getItem('api_token')

    const payload = {
        ...formData.value,
        variants: productVariants.value,  
    };
console.log(payload)
    const response = await axios.post(
      '/api/products/add',
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      }
    )
    
    sessionStorage.setItem('toastMsg', 'Product added successfully!')
    router.push('/products'); 

  } catch (error) {
    loading.value = false;
    if (error.response && error.response.status === 422) {
      setErrors(error.response.data.errors); 
    } else {
      toast.error('Something went wrong!');
    }
  } finally {
      loading.value = false;
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <div class="p-6 min-h-screen">
        <div class="bg-indigo-100 rounded-xl p-6 mb-6">
            <h1 class="text-2xl font-semibold text-indigo-900">Add Product</h1>
            <p class="text-indigo-700 mt-1">
                <router-link to="/products" class="font-medium hover:underline">Products</router-link> . Add Product
            </p>
        </div>

    <div class="bg-white rounded-xl shadow p-6">
      <Form :validation-schema="Schema" @submit="submitProduct" v-slot="{ errors }">
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700"> Product Name </label>
          <Field name="name" type="text" v-model="formData.name" 
                 class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border focus:ring-indigo-500 focus:border-indigo-500" 
                 placeholder="e.g. TV" />
          <ErrorMessage name="name" class="text-red-500 text-sm mt-1 block" />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700"> Description </label>
            <Field 
                name="description" 
                as="textarea" 
                v-model="formData.description"
                rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Product description"
            />
            <ErrorMessage name="description" class="text-red-500 text-sm mt-1 block" />
        </div>

        <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Category</label>
            <Field name="category_id" as="select" v-model="formData.category_id" class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border focus:ring-indigo-500 focus:border-indigo-500">
                <option :value="null" disabled>Select a category</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
                </option>
            </Field>
            <ErrorMessage name="category_id" class="text-red-500 text-sm mt-1 block" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">Price</label>
                <Field name="price" type="number" v-model="formData.price" class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border" placeholder="0.00" />
                <ErrorMessage name="price" class="text-red-500 text-sm mt-1 block" />
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700">Discount</label>
                <Field name="discount_price" type="number" v-model="formData.discount_price" class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border" placeholder="0" />
                <ErrorMessage name="discount_price" class="text-red-500 text-sm mt-1 block" />
            </div>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">SKU</label>
            <Field name="sku" type="text" v-model="formData.sku" class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border" placeholder="e.g. ELEC-001" />
            <ErrorMessage name="sku" class="text-red-500 text-sm mt-1 block" />
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
            <Field 
                name="quantity" 
                type="number" 
                v-model="formData.quantity" 
                class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border" 
                placeholder="0" 
            />
            <ErrorMessage name="quantity" class="text-red-500 text-sm mt-1 block" />
        </div>

        <div class="mb-6">
          <label class="flex items-center gap-2 cursor-pointer">
            <Field name="is_active" type="checkbox" :value="true" v-model="formData.is_active"
                   class="h-5 w-5 text-indigo-600 rounded border-gray-300" />
            <span class="text-sm font-medium text-gray-700">Is Active ?</span>
          </label>
        </div>
            <div class="flex items-center gap-2 mb-6 p-4 bg-gray-50 rounded-lg border">
                <input 
                    type="checkbox" 
                    id="hasVariants" 
                    v-model="hasVariants" 
                    class="h-5 w-5 text-indigo-600 rounded"
                />
                <label for="hasVariants" class="font-semibold text-gray-700">
                    This product has variants (Sizes/Colors)
                </label>
            </div>
            <div v-if="hasVariants">
                <hr class="my-6 border-gray-200" />
                <h3 class="text-lg font-medium text-gray-900 mb-4">Product Variants</h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 font-semibold">Sizes</label>
                        <Field name="sizes" v-model="selectedSizes" v-slot="{ field, errorMessage }">
                            <MultiSelect 
                                v-bind="field"
                                :options="sizes" 
                                optionLabel="label" 
                                filter 
                                @filter="onSizeFilter" 
                                placeholder="Select Sizes" 
                                display="chip" 
                                class="w-full mt-1 border "
                                :class="errorMessage ? 'border-red-500' : 'border-gray-300'"
                            >
                                <template #header><div class="font-medium px-3 py-2 border-b">Available Sizes</div></template>
                                <template #dropdownicon><i class="pi pi-tag" /></template>
                                <template #footer>
                                    <div class="p-2 flex justify-between bg-gray-50 border-t">
                                        <Button label="Add New" icon="pi pi-plus" text size="small" @click="addNewSize" />
                                        <Button label="Clear" severity="danger" text size="small" icon="pi pi-trash" @click="selectedSizes = []" />
                                    </div>
                                </template>
                            </MultiSelect>
                            <small class="text-red-500 block mt-1" v-if="errorMessage">{{ errorMessage }}</small>
                        </Field>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 font-semibold">Colors</label>
                        <Field name="colors" v-model="selectedColors" v-slot="{ field, errorMessage }">
                            <MultiSelect 
                                v-bind="field"
                                :options="colors" 
                                optionLabel="label" 
                                filter 
                                @filter="oncolorFilter" 
                                placeholder="Select Colors" 
                                display="chip" 
                                class="w-full mt-1 border"
                                :class="errorMessage ? 'border-red-500' : 'border-gray-300'"
                            >
                                <template #option="slotProps">
                                    <div class="flex items-center gap-2">
                                        <span>{{ slotProps.option.label }}</span>
                                    </div>
                                </template>
                                <template #header><div class="font-medium px-3 py-2 border-b">Available Colors</div></template>
                                <template #footer>
                                    <div class="p-2 flex justify-between bg-gray-50 border-t">
                                        <Button label="Add New" icon="pi pi-plus" text size="small" @click="addNewColor" />
                                        <Button label="Clear" severity="danger" text size="small" icon="pi pi-trash" @click="selectedColors = []" />
                                    </div>
                                </template>
                            </MultiSelect>
                            <small class="text-red-500 block mt-1" v-if="errorMessage">{{ errorMessage }}</small>
                        </Field>
                    </div>
                </div>
                <span v-if="errors.variants" class="text-red-500 text-sm mt-1 block">{{ errors.variants }}</span>
                <div class="mb-12 flex justify-end">
                    <Button 
                        label="Generate Variant Table" 
                        icon="pi pi-cog" 
                        @click="generateVariants" 
                        class="p-button-outlined p-button-sm"
                        
                    />
                    <!-- :disabled="!selectedSizes.length || !selectedColors.length" -->
                </div>
                <div v-if="productVariants.length > 0" class="overflow-x-auto border rounded-lg mb-6">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Size</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Color</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Is Active</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-for="(variant, index) in productVariants" :key="index">
                                <td class="px-4 py-3 text-sm text-gray-900">
                                    {{ variant.size }} 
                                </td>
                                <td class="px-4 py-3 text-sm text-gray-900">
                                {{ variant.color }}
                                </td>
                                <td class="px-4 py-3">
                                    <input 
                                        type="number" 
                                        v-model="variant.quantity" 
                                        class="w-24 border rounded p-1 text-sm focus:ring-indigo-500"
                                        placeholder="0"
                                    />
                                </td>
                                <td class="px-4 py-3">
                                    <input 
                                        type="checkbox" 
                                        v-model="variant.is_active" 
                                        class="h-4 w-4 text-indigo-600"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>


        <!-- Submit Button -->
        <div class="flex justify-end mt-6">
            <button 
                type="button" 
                @click="goBack" 
                class="px-4 py-2 mr-3 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition">
                Back
            </button>
            <Button 
              type="submit"
              :loading="loading" 
              @click="saveForm"
              class="px-6 py-2.5 !bg-indigo-300 hover:!bg-indigo-400 !text-white !rounded-md !transition-all !shadow-md !border-none"
              :label="loading ? 'Saving...' : 'Save Product'" 
            />
        </div>
      </Form>
    </div>
  </div>
</template>
