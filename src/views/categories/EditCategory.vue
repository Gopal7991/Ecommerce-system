
<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'
import { toast } from 'vue3-toastify'
import { Form, Field, ErrorMessage } from 'vee-validate'
import Button from 'primevue/button';

const router = useRouter()
const route = useRoute()

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
      '/api/categories/categories-with-child',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      }
    )

    categories.value = response.data
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
    router.push('/category')

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
      <h1 class="text-2xl font-semibold">Edit Category</h1>
      <p class="text-gray-500 mt-1">
        <a href="/category" class="text-black">Categories</a> . Edit Category
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
                 class="mt-1 block w-full pl-3 pr-[20px] py-2 border-gray-300 rounded-md p-2.5 border">
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
            Category Name
          </label>

          <Field name="name"
                 type="text"
                 v-model="formData.name"
                 class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border"
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
          <!-- <button type="submit"
                  class="px-6 py-2.5 bg-indigo-300 hover:bg-indigo-300 rounded"
                  :disabled="loading">
            {{ loading ? 'Updating...' : 'Update Category' }}
          </button> -->
            <!-- <Button 
                    :label="loading ? 'Updating...' : 'Update'"
                    type="submit"  
                    unstyled
                    class="px-6 py-2.5 bg-indigo-300 hover:bg-indigo-300 rounded"
                    :loading="loading"
                    :disabled="loading"
            /> -->
            <Button 
              type="submit"
              :loading="loading" 
              @click="saveForm"
              class="px-6 py-2.5 !bg-indigo-300 hover:!bg-indigo-400 !rounded-md !transition-all !shadow-md !border-none"
              :label="loading ? 'Updating...' : 'Update'"
            />
        </div>

      </Form>

    </div>
  </div>
</template>
