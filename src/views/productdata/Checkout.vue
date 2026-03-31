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
const showInput = ref(false) 
const couponCode = ref('')
const message = ref('')
const CartDiscountamount = ref(0);
const DiscountProductApplied = ref([]);
const isApplied = ref(false);
const applyCoupon = async () => {
  try {
    const token = localStorage.getItem('api_token')

    const response = await axios.post('/api/coupons/apply-coupon', 
      { code: couponCode.value }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );

    CartDiscountamount.value = response.data.discount || 0;
    DiscountProductApplied.value = response.data.appliedItemIds || [];
    message.value = response.data.message || '';

    isApplied.value = true;

  } catch (error) {
    message.value = 'Invalid or expired coupon.';
    isApplied.value = false;
  }
};
const discountSet = computed(() => {
  return new Set((DiscountProductApplied.value || []).map(Number));
});
const itemDiscountMap = computed(() => {
  const appliedIds = new Set((DiscountProductApplied.value || []).map(Number));

  const appliedItems = cartDatas.value.filter(item =>
    appliedIds.has(Number(item.id)) 

  );

  const total = appliedItems.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity);
  }, 0);

  const map = {};

  appliedItems.forEach(item => {
    const itemTotal = item.product.price * item.quantity;

    const ratioDiscount = total > 0
      ? (itemTotal / total) * CartDiscountamount.value
      : 0;

    map[item.id] = Math.round(ratioDiscount);
  });

  return map;
});
const removeCoupon = () => {
    isApplied.value = false;
    couponCode.value = '';
    CartDiscountamount.value = 0;
    DiscountProductApplied.value = [];
    message.value = 'Coupon removed.';
};
const handlePayment = async () => {
  try {
    if (!validateForm()) return;

    loading.value = true;
    const token = localStorage.getItem('api_token');

    const payload = {
      amount: finalTotal.value,
      shipping: form.value,
      items: formattedCart.value,
      couponcode:couponCode.value,
      discount:CartDiscountamount.value,
      discountproduct:DiscountProductApplied.value
    };

    const { data } = await axios.post('/api/checkout', payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (data.url) {
      window.location.href = data.url;
    } else if (data.id && stripe.value) {
      const { error } = await stripe.value.redirectToCheckout({
        sessionId: data.id
      });
      if (error) throw error;
    }

  } catch (err) {
    console.error("Checkout Error:", err);
    toast.error(err.response?.data?.message || "Checkout failed");
  } finally {
    loading.value = false;
  }
};
const form = ref({
  name: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  email: '',
  phone: ''
});

const formattedCart = computed(() => {
  return cartDatas.value.map(item => ({
    product_id: item.product.id,
    product_variant_id: item.product_variant_id,
    name: item.product.name,
    price: item.product.price,
    discount_price: item.product.discount_price || 0,
    quantity: item.quantity,
    total: (item.product.price - (item.product.discount_price || 0)) * item.quantity
  }));
});
const validateForm = () => {
  const f = form.value;

  if (!f.name || !f.address || !f.city || !f.state || !f.zip || !f.email || !f.phone) {
    toast.error("Please fill all fields");
    return false;
  }

  return true;
};

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
    // console.log(cartDatas.value);
       
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
    return withoutDiscountTotal.value - CartDiscountamount.value;
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
                        <input type="text" v-model="form.name" placeholder="Enter Full Name" class="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
                        <input type="text" v-model="form.address" placeholder="Enter Address" class="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    </div>

                    <div class="grid grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">City</label>
                            <input type="text" v-model="form.city" placeholder="Enter City" class="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">State</label>
                            <input type="text" v-model="form.state"  placeholder="Enter State" class="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">ZIP Code</label>
                            <input type="text" v-model="form.zip" placeholder="Enter Zip Code" class="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input type="email" v-model="form.email" placeholder="Enter Email" class="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                            <input type="tel" v-model="form.phone" placeholder="Enter Phone Number" class="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none">
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
                                <div class="flex items-center gap-3 mb-4">
                                    <span class="line-through text-gray-400 text-lg">₹{{data.product.price}}</span>
                                    <span class="text-2xl font-bold">₹{{ (data.product.price - (itemDiscountMap[data.id]?.toFixed(2) || 0)) * data.quantity }} </span> 
                                </div>
                            </div>
                            <span v-if="discountSet.has(Number(data.id))" class="text-green-600 text-sm font-bold ml-45"> Discount: ₹{{ itemDiscountMap[data.id]?.toFixed(2) }}</span>
                        </div>
                    </div>
                    <div class="coupon-container">
                        <div class="coupon-container">
                            <label 
                                @click="showInput = true" 
                                class="block text-sm font-medium text-blue-600 mb-1 cursor-pointer hover:underline"
                            > Have a coupon? </label>
                        <!--    <div v-if="showInput" class="flex gap-2 mt-2">
                                <input 
                                    v-model="couponCode" 
                                    placeholder="Enter Coupon" 
                                    class="border rounded px-2 py-1"
                                />
                                <button 
                                  v-if="!isApplied"
                                  @click="applyCoupon" 
                                  class="bg-black text-white px-4 py-1 rounded"
                                >
                                  Apply
                                </button>
                                <div v-else class="text-green-600 font-bold">
                                  ✓ Coupon Applied
                                </div>
                            </div>  -->
                            <div v-if="!isApplied" class="flex gap-2 mt-2">
                                <input 
                                    v-model="couponCode" 
                                    placeholder="Enter Coupon" 
                                    class="border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-black"
                                />
                                <button 
                                    @click="applyCoupon" 
                                    class="bg-black text-white px-4 py-1 rounded hover:bg-gray-800 transition"
                                >
                                    Apply
                                </button>
                            </div>

                            <div v-else class="mt-2 p-2 bg-green-50 border border-green-200 rounded flex justify-between items-center">
                                <div class="text-green-700 font-medium">
                                    <span class="font-bold">✓ {{ couponCode }}</span> Applied
                                    <p class="text-sm text-green-600">Saved: ₹{{ CartDiscountamount }}</p>
                                </div>
                                
                                <!-- Optional: Add a button to remove/change the coupon -->
                                <button @click="removeCoupon" class="text-xs text-red-500 underline">
                                    Remove
                                </button>
                            </div>
                        </div>

                        
                        <p class="text-red-500">{{ message }}</p>
                        <!-- <div>
                          Original: ₹{{ originalPrice }} | Final: ₹{{ finalPrice }}
                        </div> -->
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
                            <span class="font-medium text-slate-700">₹00.00</span>
                        </div>
                        <div  v-if="CartDiscountamount > 0" class="flex justify-between text-green-600">
                            <span>Total Discount</span>
                        <span>- ₹{{ CartDiscountamount }}</span>
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