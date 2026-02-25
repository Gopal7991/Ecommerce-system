<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="flex w-full max-w bg-white shadow-lg rounded-lg overflow-hidden min-h-screen">
      
      <!-- Left Side Image -->
      <div class="hidden md:flex w-full bg-gray-300 p-5 flex items-center justify-center">
        <img 
          src="https://modernize-vuejs.adminmart.com/assets/login-bg-XDR-nqA4.svg"
          alt="Login"
          class="object-cover w-[70%] h-[70%] rounded-lg"
        />
      </div>

      <!-- Right Side Form -->
      <div v-if="activeModal == 'Login'" class="w-full md:w-1/2 p-9">
        <h2 class="text-3xl font-bold mb-6 text-gray-800">Login</h2>

        <Form @submit="handleLogin" :validation-schema="loginSchema">
          <div class="mb-4">
            <label class="block text-gray-700">Email</label>
            <Field name="email" type="email" class="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"/>
            <ErrorMessage name="email" class="text-red-500 text-sm mt-1" />
          </div>

          <div class="mb-6">
            <label class="block text-gray-700">Password</label>
            <Field name="password" type="password" class="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" />
            <ErrorMessage name="password" class="text-red-500 text-sm mt-1" />
          </div>

          <p v-if="serverError" class="text-red-600 mb-4">
            {{ serverError }}
          </p>

          <button type="submit" class="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">Login</button>
        </Form>

        <p class="mt-4 text-sm text-gray-600">
          Don't have an account?
          <button type="button" @click="handleRegisterClick" class="text-blue-600">Register</button>
          <button type="button" @click="handleForgotPasswordClick" class="text-sm text-indigo-600 hover:text-indigo-500 float-right">Forgot Password ?</button>
        </p>

      </div>

      <div v-else-if="activeModal == 'Register'" class="w-full md:w-1/2 p-9">
        <h2 class="text-3xl font-bold mb-6 text-gray-800">Register</h2>

        <Form @submit="handleRegister" :validation-schema="registerSchema">

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
          <button type="button" @click="handleLoginClick" class="text-blue-600">Login</button>
        </p>

      </div>

      <div v-else class="w-full md:w-1/2 p-9">
        <h2 class="text-3xl font-bold mb-6 text-gray-800">Forgot Password</h2>

        <Form @submit="handleForgotPassword" :validation-schema="ForgotPasswordSchema">
          <div class="mb-4">
            <label for="email" class="block text-gray-700">Email Address</label>
            <Field name="email" type="email" id="email" class="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600" />
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

          <!-- Server response message (success or error) -->
          <!-- <p v-if="message">{{ message }}</p>
          <p v-if="serverMessage" :class="['mb-4', isSuccess ? 'text-green-600' : 'text-red-600']">
            {{ serverMessage }}
          </p> -->

          <button type="submit" class="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Submit
          </button>
          <p v-if="message" style="color: green;">{{ message }}</p>
        </Form>
        <p class="mt-4 text-sm text-gray-600">
          Don't have an account?
          <button type="button" @click="handleRegisterClick" class="text-blue-600">Register</button>
          <button type="button" @click="handleLoginClick" class="text-sm text-indigo-600 hover:text-indigo-500 float-right">Login ?</button>

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
const activeModal = ref('Login');

const handleRegisterClick = () => {
  activeModal.value = 'Register';
  console.log('Active model is now:', activeModal.value);
};
const handleLoginClick = () => {
  activeModal.value = 'Login';
  console.log('Active model is now:', activeModal.value);
};
const handleForgotPasswordClick = () => {
  activeModal.value = 'ForgotPassword';
  console.log('Active model is now:', activeModal.value);
};

const loginSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Must be a valid email'),
  password: yup
    .string()
    .required('Password is required')
    .min(5, 'Password must be at least 5 characters')
})


const ForgotPasswordSchema = yup.object({
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

const registerSchema = yup.object({
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

const handleLogin = async (values) => {
  serverError.value = ''

  try {
    const response = await axios.post(
      'http://127.0.0.1:8000/api/login',
      values
    )
   localStorage.setItem('api_token', response.data.token);
console.log("Saved:", localStorage.getItem('api_token'));

    console.log(response.data.user.role)
    
    if(response.data.user.role === 1)
    {
       router.push('/admin-dashboard')
    }
    else {
       router.push('/dashboard')
    }

  } catch (error) {
    serverError.value =
      error.response?.data?.message || 'Login failed'
  }
}

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

const handleForgotPassword = async (values) => {
  serverError.value = ''
  try {
    const response = await axios.post(
      'http://127.0.0.1:8000/api/forgot-password',
      values
    )
    console.log(response.data.message)
    message.value = response.data.message;
   

  } catch (error) {
    serverError.value =
      error.response?.data?.message || 'Registration failed'
  }
}
</script>