<template>
  <div class="p-6 min-h-screen">
    
    <!-- Header -->
    <div class="bg-indigo-100 rounded-xl p-6 mb-6">
      <h1 class="text-2xl font-semibold">
        Change Password</h1>
      <p class="text-gray-500 mt-1"> <a href="/dashboard" class="text-black">Dashboard</a> . Change Password</p>
    </div>

    <!-- Card -->
    <div class="bg-white rounded-xl shadow p-6">
      
      <!-- Top Bar -->
        <Form @submit="handleChangePassword" :validation-schema="ChangePasswordSchema">
            <div class="flex justify-between items-start mb-6">
                <label class="block text-gray-700 pt-2">Current Password</label>
                <div class="w-[70%]">
                    <Field name="current_password" type="password" placeholder="Current Password" 
                        class="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    <ErrorMessage name="current_password" class="text-red-500 text-sm mt-1 block" />
                    <p v-if="errors.current_password" class="error text-red-500 text-sm mt-1 ml-200px">
                        {{ errors.value.current_password[0] }}
                    </p>
                </div>
            </div>
            <div class="flex justify-between items-start mb-6">
                <label class="block text-gray-700">New Password</label>
                <div class="w-[70%]">
                    <Field name="new_password" type="password" placeholder="New Password" 
                        class="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    <ErrorMessage name="new_password" class="text-red-500 text-sm mt-1 block" />
                    <p v-if="errors.new_password" class="error text-red-500 text-sm mt-1 ml-200px">
                        {{ errors.value.new_password[0] }}
                    </p>
                </div>
            </div>
            
            <div class="flex justify-between items-center mb-6">
                <label class="block text-gray-700">Confirm Password</label>
                <div class="w-[70%]">
                    <Field  type="text" name="password_confirmation" placeholder="Confirm Password" class="border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400 "/>
                    <ErrorMessage name="password_confirmation" class="text-red-500 text-sm mt-1 block" />
                    <p v-if="errors.password_confirmation" class="error">
                        {{ errors.password_confirmation[0] }}
                    </p>
                </div>
            </div>
            
            <!-- <div class="flex justify-between items-center mb-6"></div> -->
            
            <button type="submit" class="w-[10%] px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 float-end">
                Submit
            </button>
            <p v-if="message" style="color: green;">{{ message }}</p>
            <div class="flex justify-between items-center mb-12 w-[10%]">
            </div>
        </Form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import axios from 'axios'
const search = ref("");
const serverError = ref('')
const message = ref('');
const errors = ref({})
axios.defaults.withCredentials = true;

const ChangePasswordSchema = yup.object({
    current_password: yup
    .string()
    .required('Password is required')
    .min(5, 'Password must be at least 6 characters'),
    new_password: yup
        .string()
        .required('New Password is required')
        .min(5, 'Password must be at least 6 characters'),
    password_confirmation: yup
        .string()
        .required('Confirm password is required')
        .oneOf([yup.ref('new_password')], 'Passwords must match')
})

const handleChangePassword = async (values) => {
axios.defaults.withCredentials = true;

  serverError.value = '';
  errors.value = {};
  await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie');
  const token = localStorage.getItem('api_token');

    console.log(token)
  try {
    const response = await axios.post(
      'http://127.0.0.1:8000/api/change-password',
      values,
      {
        headers: {
          'Authorization': `Bearer ${token}`, // Ensure token is valid
          'Accept': 'application/json',
        'Content-Type': 'application/json'       // Critical for API responses
        }
      }
    );
    console.log(response)
    message.value = response.data.message;
  } catch (error) {
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors;
    } else if (error.response?.status === 401) {
      serverError.value = "Session expired. Please log in again.";
    }
  }
}
// const filteredCategories = computed(() =>
//   categories.value.filter((cat) =>
//     cat.name.toLowerCase().includes(search.value.toLowerCase())
//   )
// );
</script>