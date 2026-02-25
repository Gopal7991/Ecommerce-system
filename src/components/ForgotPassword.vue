<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="flex w-full max-w bg-white shadow-lg rounded-lg overflow-hidden">
      
      <div class="hidden md:block w-1/1 bg-gray-300 p-5">
        <img 
          src="https://modernize-vuejs.adminmart.com/assets/login-bg-XDR-nqA4.svg"
          alt="Login"
          class="object-cover w-full h-full rounded-lg"
        />
      </div>

      <!-- Right Side Form -->
      <div class="w-full md:w-1/2 p-9">
        <h2 class="text-3xl font-bold mb-6 text-gray-800">Forgot Password</h2>

        <Form @submit="handleForgotPassword" :validation-schema="schema">
          <div class="mb-4">
            <label for="email" class="block text-gray-700">Email Address</label>
            <Field name="email" type="email" id="email" class="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" />
            <ErrorMessage name="email" class="text-red-500 text-sm mt-1" />
          </div>
          <!-- Server response message (success or error) -->
          <p v-if="serverMessage" :class="['mb-4', isSuccess ? 'text-green-600' : 'text-red-600']">
            {{ serverMessage }}
          </p>

          <button
            type="submit"
            class="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Send Reset Link
          </button>
        </Form>

        <p class="mt-4 text-sm text-gray-600">
          Don't have an account?
          <router-link to="/register" class="text-blue-600">Register</router-link>
          <router-link to="/" class="text-sm text-indigo-600 hover:text-indigo-500 float-right"> Login ? </router-link>

        </p>

      </div>
    </div>
  </div>
</template>

<script setup>
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import axios from 'axios'
import { ref } from 'vue'
import { useRouter } from 'vue-router'


const serverError = ref('')
const router = useRouter()

const schema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Must be a valid email'),
  password: yup
    .string()
    .required('Password is required')
    .min(5, 'Password must be at least 5 characters')
})

const handleLogin = async (values) => {
  serverError.value = ''

  try {
    const response = await axios.post(
      'http://127.0.0.1:8000/api/login',
      values
    )

    localStorage.setItem('token', response.data.token)
    console.log(response.data.user.role)
    
    if(response.data.user.role === 1)
    {
       router.push('/admin-dashboard')
    }

  } catch (error) {
    serverError.value =
      error.response?.data?.message || 'Login failed'
  }
}
</script>