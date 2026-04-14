<script setup>
import { onMounted, ref, computed } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'
import { toast } from 'vue3-toastify'
import Button from 'primevue/button'
import emitter from '@/eventBus'
const route = useRoute()
const productId = route.params.id
const product = ref([])
const hasVariants = ref(false)
const productVariants = ref([])
const sizes = ref([])
const colors = ref([])
const selectedSizes = ref([])
const selectedColors = ref([])
const quantity = ref(1)
const selectedImage = ref('')
const selecteduserColor = ref('')
const selecteduserSize = ref('')
const increaseQty = () => {
  quantity.value++
}

const decreaseQty = () => {
  if (quantity.value > 0) {
    quantity.value--
  }
}

const fetchProductData = async () => {
  try {
    const token = localStorage.getItem('api_token')

    const response = await axios.get(`/api/products/edit/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    })

    product.value = response.data.data
    console.log('check variant id',product.value)
    if (product.value.images && product.value.images.length > 0) {
        selectedImage.value = product.value.images[0].image
    }
    if (product.value.variants && product.value.variants.length > 0) {

        hasVariants.value = true
        productVariants.value = product.value.variants
        product.value.variants.forEach(v => {

            if (!sizes.value.some(s => s.label === v.size)) {
            sizes.value.push({
                label: v.size,
                value: v.size.toLowerCase()
            })
            }

            if (!colors.value.some(c => c.label === v.color)) {
            colors.value.push({
                label: v.color,
                value: v.color.toLowerCase()
            })
            }

        })

        const dbSizes = [...new Set(product.value.variants.map(v => v.size))]
        selectedSizes.value = sizes.value.filter(s => dbSizes.includes(s.label))

        const dbColors = [...new Set(product.value.variants.map(v => v.color))]
        selectedColors.value = colors.value.filter(c => dbColors.includes(c.label))
    }

  } catch (error) {
    toast.error("Error loading data")
  }
}
const currentVariant = computed(() => {
  if (!selecteduserColor.value || !selecteduserSize.value) return null;
  
  return product.value.variants.find(v => 
    v.color.toLowerCase() === selecteduserColor.value.toLowerCase() && 
    v.size.toLowerCase() === selecteduserSize.value.toLowerCase()
  );
});

const isOutOfStock = computed(() => {
  if (!selecteduserColor.value || !selecteduserSize.value) return false;
    return currentVariant.value ? currentVariant.value.quantity <= 0 : true;
});

const finalPrice = computed(() => {
  if (!product.value.price) return 0
  return product.value.price - (product.value.discount_price || 0)
})
const handleColorSelection  = async (selectcolor) => {
  try {
    selecteduserColor.value =  selectcolor
  } catch (error) {
    toast.error("Please Select Color")
  }
}
const handleSizeSelection = async (selectsize) => {
    try {
    selecteduserSize.value =  selectsize
  } catch (error) {
    toast.error("Please Select Size")
  }
}
const addToCart = async () => {
    try {
        if (isOutOfStock.value) {
            toast.error("This variant is currently out of stock");
            return;
        }
        const token = localStorage.getItem('api_token')
  
        const payload = {
        product_id: product.value.id,
        color: selecteduserColor.value,
        size: selecteduserSize.value,
        quantity: quantity.value
        }

        const response =  await axios.post('/api/cart-items', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          }
        })
        if (response.data.status == false) {
          toast.error(response.data.message)
        } else {
          emitter.emit('cart-updated')
          toast.success("Product added to cart")
        }
    
    } catch (error) {
        if (error.response && error.response.status === 422) {
            const validationErrors = error.response.data.errors;
            const firstError = Object.values(validationErrors)[0][0];

            toast.error(firstError); 
        } else {
            toast.error("Something went wrong. Please try again.");
        }
    }
}
onMounted(() => {
  fetchProductData()
})
</script>

<template>
    <div class="p-6  min-h-screen">
        <!-- <div class="bg-indigo-100 rounded-xl p-6 mb-6">
            <h1 class="text-2xl font-semibold text-indigo-900">Categories</h1>
        <p class="text-indigo-700 mt-1">
                <router-link to="/dashboard" class="font-medium hover:underline">Dashboard</router-link> . Categories
            </p>
        </div> -->

        <div class="bg-white rounded-xl shadow p-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div>
                    <img
                        v-if="selectedImage"
                        :src="`http://127.0.0.1:8000/storage/${selectedImage}`"
                        class="w-[40%] ml-[160px] rounded-lg object-cover mb-4"
                    />

                    <div class="flex gap-3">
                        <img
                        v-for="img in product.images"
                        :key="img.id"
                        :src="`http://127.0.0.1:8000/storage/${img.image}`"
                        class="w-20 h-20 object-cover rounded border cursor-pointer"
                        @click="selectedImage = img.image"
                        />
                    </div>
                </div>
                <div>
                    <div class="flex items-center gap-3 mb-3">
                        <!-- <span class="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                        In Stock
                        </span> -->
                        <!-- <span class="text-gray-500 text-sm">kids</span> -->
                    </div>

                    <h2 class="text-3xl font-semibold mb-3">
                        {{product.name}}
                    </h2>

                    <p class="text-gray-500 mb-4">
                        {{ product.description }}
                    </p>

                    <div class="flex items-center gap-3 mb-4">
                        <span class="line-through text-gray-400 text-lg">₹{{product.price}}</span>
                        <span class="text-2xl font-bold">₹{{finalPrice}}</span>
                    </div>

                    <!-- <div class="flex items-center gap-2 mb-6 text-yellow-500">
                        ★★★★☆
                        <span class="text-gray-500 text-sm">(236 reviews)</span>
                    </div> -->

                    <hr class="mb-6">

                    <div class="flex items-center gap-4 mb-6">
                        <span class="font-medium">Colors*</span>

                        <div class="flex gap-2">
                            <div
                                v-for="color in selectedColors"
                                :key="color.value"
                                class="w-8 h-8 rounded-full border-2 cursor-pointer transition-all"
                                :class="selecteduserColor === color.value ? 'border-indigo-600 scale-110' : 'border-transparent'"
                                :style="{ background: color.label }"
                                @click="handleColorSelection(color.value)" 
                            ></div>
                        </div>
                    </div>
                    <div class="flex items-center gap-4 mb-6">
                        <span class="font-medium">Sizes*</span>
                            <!-- @click="selectedSize = size.value" -->

                        <div class="flex gap-2">
                            <div
                                v-for="size in selectedSizes"
                                :key="size.value"
                                @click="handleSizeSelection(size.value)"
                                class="px-3 py-1 border rounded cursor-pointer"
                                :class="selecteduserSize === size.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700'"
                            >
                            {{ size.label }}
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-4 mb-6">
                        <span class="font-medium">Quantity</span>

                        <div class="flex border rounded">
                            <button class="px-3 py-1" @click="decreaseQty"> - </button>
                            <span class="px-4 py-1">
                                {{ quantity }}
                            </span>
                            <button class="px-3 py-1" @click="increaseQty"> + </button>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 mb-3">
                        <span v-if="selecteduserColor && selecteduserSize">
                            <span v-if="isOutOfStock" class="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                                Out of Stock
                            </span>
                            <span v-else class="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                                In Stock ({{ currentVariant.quantity }} left)
                            </span>
                        </span>
                        <span v-else class="text-gray-500 text-sm italic">
                            Please select color and size to check availability
                        </span>
                    </div>

                    <hr class="mb-6">
                    <div class="flex gap-4 mb-6">
                        <Button
                            label="Buy Now"
                            class="!bg-indigo-300 hover:!bg-indigo-400 text-white px-6 py-3 rounded-lg"
                        />
                        <Button
                            label="Add To Cart"
                            icon="pi pi-shopping-cart"
                            class="!bg-orange-400 hover:!bg-orange-500 text-white px-6 py-3 rounded-lg"
                            @click="addToCart"
                        />

                    </div>
                    <div class="text-gray-500">
                        <p>Dispatched in 2–3 weeks</p>
                        <a class="text-blue-600 cursor-pointer">
                        Why the longer time for delivery?
                        </a>
                    </div>

                </div>
            </div>
        </div>
  </div>
</template>
