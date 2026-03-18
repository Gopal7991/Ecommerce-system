<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick  } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import emitter from '@/eventBus';
import defaultImgUrl from '@/assets/images/user_logo.png';
import ecommerce from '@/assets/images/ecommerce.jpg';
import 'primeicons/primeicons.css';
import Button from 'primevue/button';
import Badge from 'primevue/badge'
import Dialog from 'primevue/dialog';
const router = useRouter();
const route = useRoute();
const categories = ref([]);
const loading = ref(false);
const error = ref('');
const cartCount = ref(0);
const cartDatas = ref([]);
const visible = ref(false);
const selectedImage = ref('')
import { toast } from 'vue3-toastify';
import { loadStripe } from '@stripe/stripe-js';
const stripe = ref(null);
const elements = ref(null);
const stripeLoaded = ref(false);
const errorMessage = ref(null);
const navigationTabs = [
  { name: 'products', label: 'All Product', path: '/products-all', icon: 'pi pi-list',  color: 'green' },
];
// onMounted(async () => {
//   stripe.value = await loadStripe('pk_test_51TBb04CTl65zLd920GCAmNHJ0OQdoZJ1W6qfck9XlyQOZ4KVDLckeQv56hW5CrGMoMxhvLUozld2ajUn5fIR6phj00LwrUyTnV');
//     try {        
//         if (!stripe.value) throw new Error("Stripe SDK failed to load");

//         const token = localStorage.getItem('api_token');
//         const { data } = await axios.post('/api/create-payment-intent', {}, {
//             headers: { Authorization: `Bearer ${token}` }
//         });

//         if (!data.clientSecret) throw new Error("Missing client secret from server.");

//         await nextTick(); 

//         elements.value = stripe.value.elements({ clientSecret: data.clientSecret });
        
//         const paymentElement = elements.value.create('payment');
//         paymentElement.mount('#payment-element');
        
//         stripeLoaded.value = true;
//     } catch (e) {
//         console.error("Stripe Error:", e);
//         errorMessage.value = e.message || "Failed to load payment system.";
//     }
// });

// const handlePayment = async () => {
//   if (!stripe.value || !elements.value) return;

//   loading.value = true;
//   errorMessage.value = null;

//   const { error } = await stripe.value.confirmPayment({
//     elements: elements.value,
//     confirmParams: {
//       return_url: window.location.origin + '/payment-success',
//     },
//   });

//   if (error) {
//     errorMessage.value = error.message;
//     loading.value = false;
//   }
// };
const activeTab = computed(() => {
  const current = navigationTabs.find(t => route.path.startsWith(t.path));
  return current ? current.name : '';
});

const handleTabClick = (tab) => {
  router.push(tab.path);
};
const dynamicUrl = ref('');
const imageVersion = ref(Date.now()); // Used to force image refresh

const fetchUserImage = async () => {
  try {
    const token = localStorage.getItem('api_token');
    if (!token) return;
    const { data } = await axios.get('/api/user', {
      headers: { Authorization: `Bearer ${token}` }
    });
    dynamicUrl.value = data.profile_image;
  } catch (err) {
    console.error("Failed to load image", err);
  }
};
const fetchCategories = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem('api_token');

    const response = await axios.get('/api/categories', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });

    categories.value = response.data.data;
  } catch (err) {
    error.value = 'Failed to fetch categories';
  } finally {
    loading.value = false;
  }
};

const parentCategories = computed(() => {
  return categories.value.filter(cat => cat.parent_id === 1);
});
const selectedCategory = ref(null);

const childCategories = computed(() => {
  if (!selectedCategory.value) return [];
  return categories.value.filter(
    cat => cat.parent_id === selectedCategory.value.id
  );
});

const openCategory = (cat) => {
  selectedCategory.value = cat;
};
const isDropdownOpen = ref(false);
const toggleDropdown = () => (isDropdownOpen.value = !isDropdownOpen.value);
const closeDropdown = () => (isDropdownOpen.value = false);

const fetchCartCount = async () => {
  try {
    const token = localStorage.getItem('api_token')

    const res = await axios.get('/api/cart-count', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    // console.log(res.data.cartData)

    cartCount.value = res.data.count
    cartDatas.value = res.data.cartData
       
  } catch (error) {
    console.log('Cart count error')
  }
}
const updateQtyApi = async (item) => {
    try {
        const token = localStorage.getItem('api_token'); 
        await axios.put(`/api/cart-items/updatequantity/${item.id}`, 
        {
            quantity: item.quantity
        }, 
        {
            headers: {
                Authorization: `Bearer ${token}` // This fixes the 401 error
            }
        });
        fetchCartCount(); 
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.error("Session expired. Please login again.");
        }
    }
};

const increaseQty = (item) => {
    item.quantity++;
    updateQtyApi(item);
};

const decreaseQty = (item) => {
    if (item.quantity > 1) {
        item.quantity--;
        updateQtyApi(item);
    }
};

const logout = async () => {
  const token = localStorage.getItem('api_token');
  try {
    await axios.post('/api/logout', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (e) {
    console.warn("Logout request failed, clearing local session anyway.");
  } finally {
    localStorage.removeItem('api_token');
    router.push('/');
  }
};
const removeProductItem = async (id) => {
    try {
        const token = localStorage.getItem('api_token');
        const response = await axios.delete(`/api/cart-items/delete/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json'
            }
        });

        if (response.data.status) {
            toast.success('Item removed from cart!');

            cartDatas.value = cartDatas.value.filter(item => item.id !== id);

            if (cartCount.value > 0) {
                cartCount.value--;
            }
        }
    } catch (error) {
    }
};


const withoutDiscountTotal = computed(() => {
    return cartDatas.value.reduce((acc, item) => {
        return acc + (item.product.price * item.quantity);
    }, 0);
});

const totalDiscount = computed(() => {
    return cartDatas.value.reduce((acc, item) => {
        const discount = item.product.discount_price || 0;
        return acc + (discount * item.quantity);
    }, 0);
});

const finalTotal = computed(() => {
    return withoutDiscountTotal.value - totalDiscount.value;
});

const proceedToCheckout = () => {
    visible.value = false;
    router.push('/checkout'); 
};

onMounted(() => {
  fetchUserImage();
  fetchCategories();
  fetchCartCount();
  
  window.addEventListener('click', closeDropdown);
  emitter.on('cart-updated', fetchCartCount)
//   emitter.on('image-updated', (newUrl) => {
//     dynamicUrl.value = newUrl;
//     imageVersion.value = Date.now();
//   });
});

onUnmounted(() => {
  window.removeEventListener('click', closeDropdown);
  emitter.off('image-updated');
});
</script>
<template>
    <div class="flex bg-gray-100 grid grid-cols-10 gap-4">
        <div class="col-span-7 bg-gray-200 p-4 rounded-lg">
           <div class="col-span-7 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h2 class="text-xl font-semibold mb-6 text-slate-800">Shipping Details</h2>
                <form class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input type="text" placeholder="Full name" class="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
                        <input type="text" placeholder="123 Main St" class="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    </div>

                    <div class="grid grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">City</label>
                            <input type="text" placeholder="Ahmedabad" class="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">State</label>
                            <input type="text" placeholder="Gujarat" class="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">ZIP Code</label>
                            <input type="text" placeholder="10001" class="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input type="email" placeholder="test@example.com" class="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                            <input type="tel" placeholder="(555) 000-0000" class="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none">
                        </div>
                    </div>

                    <!-- <button type="submit" class="w-full mt-4 bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors">
                        Continue to Payment
                    </button> -->
                </form>
            </div>
        </div>
        
        <div class="col-span-3 bg-gray-200 p-4">
            <div class="col-span-3 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div class="col-span-3 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h2 class="text-xl font-semibold mb-6 text-slate-800">Order Summary</h2>
                    <div v-for="(data, index) in cartDatas" :key="index">
                        <div class="space-y-4 mb-6 border-b border-slate-100 pb-6">
                            <div class="flex justify-between items-center text-sm">
                                <div class="flex items-center gap-3">
                                    <div class="w-12 h-12 bg-slate-100 rounded-md">
                                        <img
                                            v-if="data.product && data.product.images && data.product.images.length > 0"
                                            :src="`http://127.0.0.1:8000/storage/${data.product.images[0].image}`"
                                            class="mx-auto rounded-lg object-cover mb-4"
                                        />
                                    </div> 
                                    <div>
                                        <p class="font-medium text-slate-800">{{ data.product.name }}</p>
                                        <p class="text-slate-500 text-xs">Qty:{{ data.quantity }}</p>
                                    </div>
                                </div>
                                <span class="font-medium text-slate-700">₹{{ (data.product.price - (data.product.discount_price || 0)) * data.quantity }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="space-y-3 text-sm border-b border-slate-100 pb-6">
                        <div class="flex justify-between">
                            <span class="text-slate-500">Subtotal</span>
                            <span class="font-medium text-slate-700">₹{{ withoutDiscountTotal }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-500">Shipping</span>
                            <span class="font-medium text-green-600">Free</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-500">Estimated Tax</span>
                            <span class="font-medium text-slate-700">₹12.00</span>
                        </div>
                    </div>

                    <!-- <div class="mt-4 mb-6">
                        <div class="flex gap-2">
                            <input type="text" placeholder="Promo Code" class="w-full p-2 text-sm border border-slate-300 rounded-md focus:outline-none">
                            <button class="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-200">Apply</button>
                        </div>
                    </div> -->

                    <div class="flex justify-between items-center pt-2">
                        <span class="text-lg font-bold text-slate-800">Total</span>
                        <span class="text-2xl font-bold text-blue-600">₹{{ finalTotal }}</span>
                    </div>
                    <div class="mt-4 mb-6">
                         <!-- 1. The placeholder where Stripe will inject the Card Input -->
                        <div id="payment-element" class="mb-4"></div>
                        <div class="flex gap-2">
                            <button 
                                type="button" 
                                @click="handlePayment"
                                class="w-full mt-4 bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span v-if="loading">Processing...</span>
                                <span v-else>Continue to Payment</span>
                            </button>
                        </div>
                         <p v-if="errorMessage" class="text-red-500 text-sm mt-2 text-center">{{ errorMessage }}</p>
                    </div>
                    <!-- <p class="text-xs text-slate-400 mt-4 text-center">Includes GST/ITC compliance</p> -->
                </div>
            </div>
            
        </div>
    </div>
</template>