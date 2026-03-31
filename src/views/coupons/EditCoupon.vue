
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
        router.push('/coupons'); 
    }
};

const couponId = route.params.id

const couponOptions = [
  { value: 'percentage', label: 'Percentage (%)' },
  { value: 'fixed', label: 'Fixed Price (₹)' }
];
function useBrands() {
  const brands = ref([])
  const fetchBrands = async () => {
    try {
      const token = localStorage.getItem('api_token')
      const response = await axios.get('/api/products/brands', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      })
      brands.value = response.data
      console.log(brands.value)
    } catch (error) {
      console.error('Error fetching brands:', error)
    }
  }
  return { brands, fetchBrands }
}
const { brands, fetchBrands } = useBrands()

const coupons = ref([])
const loading = ref(false)

const formData = ref({
  name: '',
  code: '',
  coupon_type: null,
  brand_id: null,
  discount_percentage: null,
  start_date: null,
  end_date: null,
  min_order_amount:null,
  max_discount: null,
  max_attach: null,
  used_count: null,
  is_active: true
})


const fetchCoupon = async () => {
  try {
    loading.value = true
    const token = localStorage.getItem('api_token')

    const response = await axios.get(
      `/api/coupons/edit/${couponId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      }
    )

    const coupon = response.data

    formData.value = {
      name: coupon.name,
      code: coupon.code,
      coupon_type: coupon.coupon_type,
      discount_percentage: coupon.discount_percentage,
      start_date: coupon.start_date,
      end_date: coupon.end_date,
      min_order_amount: coupon.min_order_amount,
      max_discount: coupon.max_discount,
      max_attach: coupon.max_attach,
      brand_id: coupon.brand_id,
      is_active: coupon.is_active
    }

  } catch (error) {
    console.error(error)
    toast.error('Failed to load category')
  } finally {
    loading.value = false
  }
}


const updateCoupon = async (values, { setErrors }) => {
  try {
    loading.value = true
    const token = localStorage.getItem('api_token')

    const payload = { ...formData.value };
    if (payload.coupon_type === 'fixed') {
       payload.discount_percentage = null;
    }
    await axios.put(
      `/api/coupons/update/${couponId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      }
    )

    sessionStorage.setItem('toastMsg', 'Coupon updated successfully!')
    router.push('/coupons')

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
  fetchCoupon();
  fetchBrands();
})
</script>


<template>
  <div class="p-6 min-h-screen">
    
    <!-- Header -->
    <div class="bg-indigo-100 rounded-xl p-6 mb-6">
      <h1 class="text-2xl font-semibold text-indigo-900">Edit Coupon</h1>
      <p class="text-indigo-700 mt-1">
        <router-link to="/coupons" class="font-medium hover:underline">Coupons</router-link> . Edit Coupon
      </p>
    </div>

    <!-- Card -->
    <div class="bg-white rounded-xl shadow p-6">

      <Form :validation-schema="Schema" @submit="updateCoupon">


        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700"> Coupon Name <span class="text-red-500">*</span> </label>

          <Field name="name"
                 type="text"
                 v-model="formData.name"
                 class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border"
                 placeholder="e.g. Electronics" />

          <ErrorMessage name="name"
                        class="text-red-500 text-sm mt-1 block" />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700"> Coupon Code <span class="text-red-500">*</span> </label>
          <Field name="code" type="text" v-model="formData.code" 
                 class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border" 
                 placeholder="Enter Coupon Code" />
          <ErrorMessage name="code" class="text-red-500 text-sm mt-1 block" />
        </div>
         <div class="flex gap-4 mb-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700"> Coupon Type <span class="text-red-500">*</span> </label>
            <Field name="coupon_type" as="select" v-model="formData.coupon_type" 
                   class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border">
              <option :value="null" disabled>Select a Type</option>
              <option v-for="type in couponOptions" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </Field>
            <ErrorMessage name="coupon_type" class="text-red-500 text-sm mt-1 block" />
          </div>

          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700">Brand</label>
            <Field name="brand_id" as="select" v-model="formData.brand_id" class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border">
                    <option v-for="brand in brands" :key="brand.id" :value="brand.id">{{ brand.name }}</option>
                </Field>
                <ErrorMessage name="brand_id" class="text-red-500 text-sm mt-1 block" />
          </div>
        </div>
        <div v-if="formData.coupon_type === 'percentage'" class="mt-4">
          <label class="block text-sm font-medium text-gray-700">Discount Percentage (%)</label>
          <Field 
            name="discount_percentage" 
            type="number" 
            v-model="formData.discount_percentage"
            placeholder="Enter percentage"
            class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border"
          />
          <ErrorMessage name="discount_percentage" class="text-red-500 text-sm mt-1 block" />
        </div>

        <div class=" flex mb-4 gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700"> Coupon StartDate<span class="text-red-500">*</span> </label>
            <Field name="start_date" type="date" v-model="formData.start_date" 
                     class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border" />
            <ErrorMessage name="start_date" class="text-red-500 text-sm mt-1 block" />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700"> Coupon EndDate <span class="text-red-500">*</span> </label>
            <Field name="end_date" type="date" v-model="formData.end_date" 
                   class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border"  />
            <ErrorMessage name="end_date" class="text-red-500 text-sm mt-1 block" />
          </div>
        </div>

        <div class=" flex mb-4 gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700"> Minimum Order Amount (For Apply)  <span class="text-red-500">*</span> </label>
          <Field name="min_order_amount" type="number" v-model="formData.min_order_amount" 
                 class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border"  />
          <ErrorMessage name="min_order_amount" class="text-red-500 text-sm mt-1 block" />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700"> Maximum Discount Price <span class="text-red-500">*</span> </label>
            <Field name="max_discount" type="number" v-model="formData.max_discount" 
                   class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border"  />
            <ErrorMessage name="max_discount" class="text-red-500 text-sm mt-1 block" />
          </div>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700"> Maximum Attempt <span class="text-red-500">*</span> </label>
          <Field name="max_attach" type="number" v-model="formData.max_attach" 
                 class="mt-1 block w-full rounded-md border-gray-300 p-2.5 border"  />
          <ErrorMessage name="max_attach" class="text-red-500 text-sm mt-1 block" />
        </div>

        <div class="mb-6">
          <label class="flex items-center gap-2">
            <Field 
              name="is_active"
              type="checkbox"
              :value="1"
              :unchecked-value="0"
              v-model="formData.is_active"
              class="h-5 w-5 text-blue-600" 
            />
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
              :label="loading ? 'Updating...' : 'Update'"
            />
        </div>

      </Form>
    </div>
  </div>
</template>
