<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="flex w-full max-w bg-white shadow-lg rounded-lg overflow-hidden min-h-screen">

      <!-- Left Side Image -->
      <div class="hidden md:flex w-full bg-gray-300 p-5 flex items-center justify-center">
        <img src="https://modernize-vuejs.adminmart.com/assets/login-bg-XDR-nqA4.svg" alt="Register" class="object-cover w-[70%] h-[70%] rounded-lg" />
      </div>

      <!-- Right Side Form -->
      <div class="w-full md:w-1/2 p-9">
        <h2 class="text-3xl font-bold mb-6 text-gray-800">Register</h2>

        <Form @submit="handleRegister" :validation-schema="schema">

          <div class="mb-4">
            <label class="block text-gray-700">Name</label>
            <Field name="name"  type="text" class="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" />
            <ErrorMessage  name="name" class="text-red-500 text-sm mt-1" />
          </div>

          <div class="mb-4">
            <label class="block text-gray-700">Email</label>
            <Field name="email" type="email" class="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" />
            <ErrorMessage name="email" class="text-red-500 text-sm mt-1" />
          </div>

          <div class="mb-4">
            <label class="block text-gray-700">Password</label>
            <Field name="password" type="password" class="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" />
            <ErrorMessage name="password" class="text-red-500 text-sm mt-1" />
          </div>

          <div class="mb-6">
            <label class="block text-gray-700">Confirm Password</label>
            <Field name="password_confirmation" type="password" class="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" />
            <ErrorMessage name="password_confirmation" class="text-red-500 text-sm mt-1" />
          </div>

          <p v-if="serverError" class="text-red-600 mb-4">
            {{ serverError }}
          </p>

          <button type="submit" class="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"> Register </button>
        </Form>

        <p class="mt-4 text-sm text-gray-600">
          Already have an account?
          <router-link to="/" class="text-blue-600">Login</router-link>
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

const serverError = ref('')

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup
    .string()
    .required('Email is required')
    .email('Must be a valid email'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  password_confirmation: yup
    .string()
    .required('Confirm password is required')
    .oneOf([yup.ref('password')], 'Passwords must match')
})

const handleRegister = async (values) => {
  serverError.value = ''

  try {
    const response = await axios.post(
      'http://127.0.0.1:8000/api/register',
      values
    )

    // Store token if returned from API
    localStorage.setItem('token', response.data.token)

    // Redirect to dashboard
    window.location.href = '/dashboard'

  } catch (error) {
    serverError.value =
      error.response?.data?.message || 'Registration failed'
  }
}
</script>