
<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify';
import { Form, Field, ErrorMessage } from 'vee-validate';
import Button from 'primevue/button';


const router = useRouter()
const goBack = () => {
    if (window.history.length > 1) {
        router.back();
    } else {
        router.push('/categories'); 
    }
};




const formData = ref({
  name: '',
  parent_id: null,
  is_active: true
})

const submitCategory = async (values, { setErrors }) => {
  try {
    loading.value = true;
    const token = localStorage.getItem('api_token')

    const response = await axios.post(
      '/api/categories/add',
      formData.value,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      }
    )
    sessionStorage.setItem('toastMsg', 'Category added successfully!');
    router.push('/categories'); 
    formData.value = {
      name: '',
      parent_id: null,
      is_active: true
    }

    fetchCategories()

  } catch (error) {
    loading.value = false;
    console.error(error.response?.data)
    if (error.response && error.response.status === 422) {
      setErrors(error.response.data.errors); 
    } else {
      console.error(error.response?.data);
      toast.error('Something went wrong!');
    }
  }
}

onMounted(() => {
 
})
</script>

<template>
  <div class="p-6 min-h-screen">
    
    <!-- Header -->
    <div class="bg-indigo-100 rounded-xl p-6 mb-6">
      <h1 class="text-2xl font-semibold text-indigo-900">Add Coupon</h1>
      <p class="text-indigo-700 mt-1">
        <router-link to="/coupons" class="font-medium hover:underline">Coupons</router-link> . Add Coupon
      </p>
    </div>

    <!-- Card -->
    <div class="bg-white rounded-xl shadow p-6">
      
      <Form :validation-schema="Schema" @submit="submitCategory" v-slot="{ errors  }">

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700"> Coupon Code </label>
          <Field name="code" type="text" v-model="formData.code" 
                 class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border" 
                 placeholder="Enter Coupon Code" />
          <ErrorMessage name="code" class="text-red-500 text-sm mt-1 block" />
        </div>

        <!-- Category Name Input -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700"> Coupon Name </label>
          <Field name="name" type="text" v-model="formData.name" 
                 class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border" 
                 placeholder="Enter Name" />
          <ErrorMessage name="name" class="text-red-500 text-sm mt-1 block" />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700"> Coupon StartDate </label>
          <Field name="start_date" type="date" v-model="formData.start_date" 
                 class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border" />
          <ErrorMessage name="start_date" class="text-red-500 text-sm mt-1 block" />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700"> Coupon EndDate </label>
          <Field name="end_date" type="date" v-model="formData.end_date" 
                 class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border"  />
          <ErrorMessage name="name" class="text-red-500 text-sm mt-1 block" />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700"> Maximum Attempt </label>
          <Field name="max_attach" type="number" v-model="formData.max_attach" 
                 class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border"  />
          <ErrorMessage name="max_attach" class="text-red-500 text-sm mt-1 block" />
        </div>
        
        <!-- Checkbox -->
        <div class="mb-6">
          <label class="flex items-center gap-2">
            <Field name="is_active" type="checkbox" :value="true" v-model="formData.is_active"
                   class="h-5 w-5 text-blue-600" />
            Is Active ?
          </label>
        </div>

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
              class="px-6 py-2.5 !bg-indigo-300 hover:!bg-indigo-400 !rounded-md !transition-all !shadow-md !border-none"
              :label="loading ? 'Saving...' : 'Save'" 
            />
        </div>
      </Form>
    </div>
  </div>
</template>



