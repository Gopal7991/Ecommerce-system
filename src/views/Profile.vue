<template>
  <div class="p-6 min-h-screen">
    <div class="bg-indigo-100 rounded-xl p-6 mb-6">
      <h1 class="text-2xl font-semibold text-indigo-900">My Profile</h1>
        <p class="text-indigo-700 mt-1">
            <router-link to="/dashboard" class="font-medium hover:underline">Dashboard</router-link> . Profile
        </p>
    </div>

    <!-- Card -->
    <div class="flex bg-white rounded-xl shadow p-6 gap-6">
        <div class="  w-1/2 p-5 bg-gray-300 shadow-lg rounded-lg">
            <div class="h-[90%] flex items-center justify-center">
                 <!-- <img :src="user.image_url" alt="User Image" /> -->
                <img :src="currentImageSrc" alt="Content" class="w-100 h-100 rounded-full object-cover" />
            </div>
            <div class="h-[10%] flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <FileUpload 
                        ref="fileInput" 
                        mode="basic" 
                        name="profile_image" 
                        accept="image/*" 
                        :maxFileSize="1000000"
                        @select="onFileSelect" 
                        chooseLabel="Browse"
                        class="px-6 py-2 !bg-gray-400 hover:!bg-gray-500 !text-black !rounded-md !transition-all !shadow-md !border-none ml-auto"
                    />

                    <span 
                        v-if="errors.profile_image" 
                        class="text-red-500 text-sm whitespace-nowrap"
                    >
                        {{ errors.profile_image[0] }}
                    </span>
                </div>

                <Button 
                    type="button"
                    :loading="loading1" 
                    @click="updateImage"
                    class="px-6 py-2 !bg-indigo-300 hover:!bg-indigo-400 !rounded-md !transition-all !shadow-md !border-none"
                    :label="loading1 ? 'Updating...' : 'Update'" 
                />

            </div>
        </div>
        
        <div class="w-1/2 p-5 bg-white shadow-lg rounded-lg overflow-hidden">
            <Form 
                v-if="initialValues.firstname" 
                @submit="handleUpdate" 
                :initial-values="initialValues"
                :validation-schema="profileSchema" 
                class="space-y-6"
            >
                <div class="flex flex-col">
                    <label class="text-sm font-semibold text-gray-600 mb-1">First Name</label>
                    <Field name="firstname" type="text" class="block w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-md text-gray-900 bg-white" />
                    <ErrorMessage name="firstname" class="text-red-500 text-xs mt-1" />
                </div>

                <div class="flex flex-col">
                    <label class="text-sm font-semibold text-gray-600 mb-1">Last Name</label>
                    <Field name="lastname" type="text" class="block w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-md text-gray-900 bg-white" />
                    <ErrorMessage name="lastname" class="text-red-500 text-xs mt-1" />
                </div>

                <div class="flex flex-col">
                    <label class="text-sm font-semibold text-gray-600 mb-1">Email Address</label>
                    <Field name="email" type="email" class="block w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-md text-gray-900 bg-white" />
                    <ErrorMessage name="email" class="text-red-500 text-xs mt-1" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col">
                        <label class="text-sm font-semibold text-gray-600 mb-1">Mobile Number</label>
                        <Field name="mobile" type="tel" class="block w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-md text-gray-900 bg-white" />
                        <ErrorMessage name="mobile" class="text-red-500 text-xs mt-1" />
                    </div>

                    <div class="flex flex-col">
                        <label class="text-sm font-semibold text-gray-600 mb-1">Birth Date</label>
                        <Field name="birthdate" type="date" class="block w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-md text-gray-900 bg-white" />
                        <ErrorMessage name="birthdate" class="text-red-500 text-xs mt-1" />
                    </div>
                </div>

                <div class="flex flex-col">
                    <label class="text-sm font-semibold text-gray-600 mb-1">Gender</label>
                    <Field name="gender" as="select" class="mt-1 block w-full px-4 py-2 mt-2 border-2 border-gray-300 rounded-md">
                        <option value="" disabled>Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        
                    </Field>
                    <ErrorMessage name="gender" class="text-red-500 text-xs mt-1" />
                </div>

                <Button 
                    type="submit"
                    :loading="loading" 
                    @click="saveForm"
                    class="w-full h-11 !bg-indigo-300 hover:!bg-indigo-400 !rounded-md !transition-all !shadow-md !border-none"
                    :label="loading ? 'Saving...' : 'Save'" 
                />
            </Form>
            
            <!-- Loading State Placeholder -->
            <div v-else class="text-center py-10">Loading Profile...</div>
        </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted,computed } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import { Form, Field, ErrorMessage } from 'vee-validate';
import { toast } from 'vue3-toastify';
import Button from 'primevue/button';
const dynamicUrl = ref('');
import defaultImgUrl from '@/assets/images/user_logo.png';
const errors = ref({});
import * as yup from 'yup';
import axios from 'axios';
const fileInput = ref(null); 
import emitter from '@/eventBus';
import FileUpload from 'primevue/fileupload';

const currentImageSrc = computed(() => {
  return dynamicUrl.value || defaultImgUrl; // If dynamicUrl is falsy, use defaultImgUrl
});
const onFileSelect = (event) => {
    // PrimeVue returns an array of files. Take the first one.
    const file = event.files[0]; 
    imageFile.value = file;

    // Instant Preview (Optional)
    dynamicUrl.value = URL.createObjectURL(file);

    // Clear validation error if it exists
    if (errors.value.profile_image) {
        delete errors.value.profile_image;
    }
};
const imageFile = ref(null);
// const handleProfileChange = (e) => { imageFile.value = e.target.files[0]; };

const updateImage = async () => {
    // Check if file exists
    if (!imageFile.value) {
        errors.value = { profile_image: ["Please choose an image first"] };
        return;
    }

    errors.value = {};
    loading1.value = true;
    
    const formData = new FormData();
    formData.append('profile_image', imageFile.value);

    try {
        const response = await axios.post('/api/update-image', formData, {
            headers: { 
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${localStorage.getItem('api_token')}`
            }
        });

        // Update URLs
        dynamicUrl.value = response.data.image_url;
        emitter.emit('image-updated', response.data.image_url); 

        // IMPORTANT: Reset the PrimeVue Component
        imageFile.value = null;
        if (fileInput.value) {
            fileInput.value.clear(); // This clears the filename from the UI
        }

        toast.success("Profile updated!");
    } catch (err) {
        if (err.response && err.response.status === 422) {
            errors.value = err.response.data.errors;
        }
    } finally {
        loading1.value = false;
    }
};

const loading1 = ref(false);
const loading = ref(false);
const initialValues = ref({}); 
const router = useRouter()

const profileSchema = yup.object({
    firstname: yup.string().required('First name is required'),
    lastname: yup.string().required('Last name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    mobile: yup.string().required('Mobile is required'),
    birthdate: yup.string().required('Birth date is required'), // Change to string for simple date input
    gender: yup.string().required('Please select a gender'),
});

const fetchProfile = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem('api_token');

    const { data } = await axios.get(`/api/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });

    initialValues.value = {
        firstname: data.firstname || '',
        lastname: data.lastname || '',
        email: data.email || '',
        mobile: data.mobile || '',
        birthdate: data.birthdate || '',
        gender: data.gender || ''
    };
    dynamicUrl.value =data.profile_image; 
    // console.log(data.profile_image)
    // alert(dynamicUrl.value)

  } catch (error) {
    console.error(error);
    toast.error('Failed to load profile');
  } finally {
    loading.value = false;
  }
};

const handleUpdate = async (values) => {
    loading.value = true;
    try {
        const token = localStorage.getItem('api_token');
        const response = await axios.put('/api/profile/update', values, {
            headers: { Authorization: `Bearer ${token}` }
        });
        // toast.success(response.data.message || 'Profile Updated!');
        sessionStorage.setItem('toastMsg', response.data.message || 'Profile Updated!')
        router.push('/dashboard')
    } catch (err) {
        toast.error(err.response?.data?.message || "An error occurred.");
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchProfile();
});
</script>
