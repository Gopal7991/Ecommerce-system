<script setup>
import { ref } from "vue";
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import axios from 'axios'
import { toast } from 'vue3-toastify';
import Button from 'primevue/button';

const loading = ref(false);
const errors = ref({});

// Validation Schema
const ChangePasswordSchema = yup.object({
  current_password: yup.string().required('Current password is required'),
  new_password: yup.string().required('New password is required').min(8),
  password_confirmation: yup.string()
    .oneOf([yup.ref('new_password')], 'Passwords must match')
    .required('Confirm password is required'),
});

const handleChangePassword = async (values, { setErrors, resetForm }) => {
  try {
    loading.value = true;
    const token = localStorage.getItem('api_token');
    
    await axios.post('/api/change-password', values, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });

    toast.success('Password updated successfully!');
    resetForm();
  } catch (error) {
    if (error.response && error.response.status === 422) {
      setErrors(error.response.data.errors);
    } else {
      toast.error('Something went wrong!');
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="p-6 min-h-screen">
    
    <div class="bg-indigo-100 rounded-xl p-6 mb-6">
      <h1 class="text-2xl font-semibold">Change Password</h1>
      <p class="text-gray-500 mt-1"> 
        <a href="/dashboard" class="text-black">Dashboard</a> . Change Password
      </p>
    </div>

    <!-- Card -->
    <div class="bg-white rounded-xl shadow p-6">
      
      <Form @submit="handleChangePassword" :validation-schema="ChangePasswordSchema" v-slot="{ errors }">
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700"> Current Password </label>
          <Field name="current_password" type="password" 
                 class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border focus:ring-2 focus:ring-indigo-400 focus:outline-none" 
                 placeholder="Current" />
          <ErrorMessage name="current_password" class="text-red-500 text-sm mt-1 block" />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700"> New Password </label>
          <Field name="new_password" type="password" 
                 class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border focus:ring-2 focus:ring-indigo-400 focus:outline-none" 
                 placeholder="Enter new password" />
          <ErrorMessage name="new_password" class="text-red-500 text-sm mt-1 block" />
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700"> Confirm Password </label>
          <Field name="password_confirmation" type="password" 
                 class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border focus:ring-2 focus:ring-indigo-400 focus:outline-none" 
                 placeholder="Confirm new password" />
          <ErrorMessage name="password_confirmation" class="text-red-500 text-sm mt-1 block" />
        </div>

        <div class="flex justify-end mt-6">
          <Button 
            type="submit"
            :loading="loading" 
            class="px-6 py-2.5 !bg-indigo-300 hover:!bg-indigo-400 !rounded-md !transition-all !shadow-md !border-none text-white font-medium"
            :label="loading ? 'Updating...' : 'Update Password'" 
          />
        </div>

      </Form>
    </div>
  </div>
</template>
