
<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'
import { toast } from 'vue3-toastify'
import { Form, Field, ErrorMessage } from 'vee-validate'
import Button from 'primevue/button';

const router = useRouter()
const route = useRoute()
const goBack = () => {
    if (window.history.length > 1) {
        router.back();
    } else {
        router.push('/categories'); 
    }
};

const categoryId = route.params.id

const categories = ref([])
const loading = ref(false)

const formData = ref({
  name: '',
  parent_id: null,
  is_active: true
})


const fetchCategories = async () => {
  try {
    const token = localStorage.getItem('api_token')

    const response = await axios.get(
      '/api/categories/category-with-child',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      }
    )
    // console.log('dsfsdf',response.data.original);
    // categories.value = response.data
    categories.value = response.data.original || []
    
  } catch (error) {
    console.error(error)
  }
}

const fetchCategory = async () => {
  try {
    loading.value = true
    const token = localStorage.getItem('api_token')

    const response = await axios.get(
      `/api/categories/edit/${categoryId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      }
    )

    const category = response.data
    formData.value = {
      name: category.name,
      parent_id: category.parent_id,
      is_active: category.is_active
    }

  } catch (error) {
    console.error(error)
    toast.error('Failed to load category')
  } finally {
    loading.value = false
  }
}


const updateCategory = async (values, { setErrors }) => {
  try {
    loading.value = true
    const token = localStorage.getItem('api_token')

    await axios.put(
      `/api/categories/update/${categoryId}`,
      formData.value,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      }
    )

    sessionStorage.setItem('toastMsg', 'Category updated successfully!')
    router.push('/categories')

  } catch (error) {
    if (error.response && error.response.status === 422) {
      setErrors(error.response.data.errors)
    } else {
      toast.error('Something went wrong!')
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCategories()
  fetchCategory()
})
</script>


<template>
  <div class="p-6 min-h-screen">
    
    <!-- Header -->
    <div class="bg-indigo-100 rounded-xl p-6 mb-6">
      <h1 class="text-2xl font-semibold text-indigo-900">Edit Category</h1>
      <p class="text-indigo-700 mt-1">
        <router-link to="/categories" class="font-medium hover:underline">Categories</router-link> . Edit Category
      </p>
    </div>

    <!-- Card -->
    <div class="bg-white rounded-xl shadow p-6">

      <Form :validation-schema="Schema" @submit="updateCategory">

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700">
            Parent Category
          </label>

          <Field name="parent_id"
                 as="select"
                 v-model="formData.parent_id"
                 class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border text-xs focus:border-gray-500 focus:outline-none">
            <option :value="null">-- Select Parent --</option>
            <option v-for="cat in categories"
                    :key="cat.id"
                    :value="cat.id">
              {{ cat.full_name }}
            </option>
          </Field>

          <ErrorMessage name="parent_id"
                        class="text-red-500 text-sm mt-1 block" />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">
            Category Name <span class="text-red-500">*</span>
          </label>

          <Field name="name"
                 type="text"
                 v-model="formData.name"
                 class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border text-xs focus:border-gray-500 focus:outline-none"
                 placeholder="e.g. Electronics" />

          <ErrorMessage name="name"
                        class="text-red-500 text-sm mt-1 block" />
        </div>

        <div class="mb-6">
          <label class="flex items-center gap-2">
            <Field name="is_active"
                   type="checkbox"
                   :value="true"
                   v-model="formData.is_active"
                   class="h-5 w-5 text-blue-600" />
            Is Active ?
          </label>
        </div>

        <div class="flex justify-end mt-6">
          <button 
                type="button" 
                @click="goBack" 
                class="px-4 py-2 mr-3 bg-gray-400 text-gray-700 text-white rounded">
                Back
            </button>
            <Button 
              type="submit"
              :loading="loading" 
              @click="saveForm"
              class="px-6 py-2.5 !bg-indigo-400 !rounded-md !transition-all !shadow-md !border-none"
              :label="loading ? 'Updating...' : 'Update'"
            />
        </div>

      </Form>

    </div>
  </div>
</template>
