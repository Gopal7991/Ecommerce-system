<template>
  <header class="bg-indigo-100 shadow-md h-16 flex items-center justify-between px-6 sticky top-0 z-50">
    <button @click="emit('toggle-sidebar')" class="text-gray-500 hover:text-gray-700">
        <img :src="ecommerce" class="h-15 w-auto object-contain" />
    </button>
    <nav class="flex h-full items-center space-x-1">
        <button
            v-for="tab in navigationTabs"
            :key="tab.name"
            @click="handleTabClick(tab)"
            :class="[
                'px-4 h-full flex items-center text-sm font-medium transition-all border-b-2',
                activeTab === tab.name
                ? `border-${tab.color}-600 text-${tab.color}-600`
                : 'border-transparent text-gray-500 hover:text-gray-700'
            ]"
            >
            <span v-if="tab.icon" :class="[tab.icon, 'mr-2']"></span>
            {{ tab.label }}
        </button>
        <div class="flex">
            <div
                v-for="cat in parentCategories"
                :key="cat.id"
                class="relative"
            >
                <button
                @click="openCategory(cat)"
                class="px-4 h-full flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600"
                >
                {{ cat.name }}
                </button>

                <div
                v-if="selectedCategory && selectedCategory.id === cat.id"
                class="absolute top-9 left-0 mt-1 bg-white shadow-lg rounded-md w-48 z-50"
                >
                <!-- <button
                    v-for="child in childCategories"
                    :key="child.id"
                    @click="router.push(`/category/${child.id}`)"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-indigo-50"
                >
                    {{ child.name }}
                </button> -->
                <button
                    v-for="child in childCategories"
                    :key="child.id"
                    @click="router.push({ path: '/products-all', query: { sub_category_id: child.id } })"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-indigo-50"
                >
                    {{ child.name }}
                </button>
                </div>

            </div>
        </div>
        <!-- <button 
            @click="logout"
            class="px-4 h-full flex items-center text-sm font-medium text-red-500 hover:text-red-700"
        >
            <span class="pi pi-sign-out mr-2"></span>
            Logout
        </button> -->
    </nav>

    <div class="relative flex items-center space-x-4">
        <Button
            icon="pi pi-shopping-cart"
            class="p-button-rounded p-button-text w-14 h-14 [--p-icon-size:1.5rem]"
            @click="visible = true"
            
        />
        <Badge
            v-if="cartCount > 0"
            :value="cartCount"
            severity="success"
            class="absolute -top-1 "
        />
        <router-link to="/order-history" class="no-underline">
          <Button 
            icon="pi pi-history" 
            class="p-button-rounded p-button-text w-14 h-14 [--p-icon-size:1.25rem]" 
            v-tooltip.bottom="'View History'"
          />
        </router-link>
        <div class="relative">
            <button 
                @click.stop="toggleDropdown" 
                class="flex items-center space-x-2 focus:outline-none group p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
                <div class="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-indigo-500 transition-all shadow-sm">
                    <img :src="defaultImgUrl" class="h-full w-full object-cover"/>
                </div>
            </button>
            <div v-if="isDropdownOpen" class="absolute right-0 mt-2  w-25 bg-white border rounded-lg shadow-lg z-50">
                <button
                    @click="logout"
                    class="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg flex items-center"
                >
                    <i class="pi pi-sign-out mr-2"></i>
                    Logout
                </button>
            </div>
        </div>
    </div>
  </header>
    <!-- <Dialog v-model:visible="visible" modal header="Cart Items" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"> -->
    <Dialog 
        v-model:visible="visible" 
        modal 
        header="Cart Items" 
        :style="{ width: '50rem' }" 
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
        :contentStyle="{ padding: '0' }" 
    >
    <div v-if="msgValue" class="sticky top-0 z-50 w-full p-2 bg-white border-b">
        <Message v-if="msgValue === 'sold_out'" severity="error" @close="msgValue = ''">
            <!-- Using Tailwind text-red-600 -->
            <span class="font-bold text-red-600">Remove sold-out items first</span>
        </Message>
    </div>


        <div class="p-6  min-h-screen">
             <div v-for="(data, index) in cartDatas" :key="index">
                <div class="bg-gray-100 rounded-xl p-6 mb-6">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div>
                            <img
                                v-if="data.product && data.product.images && data.product.images.length > 0"
                                :src="`http://127.0.0.1:8000/storage/${data.product.images[0].image}`"
                                class="mx-auto rounded-lg object-cover mb-4"
                            />
                            <img 
                                v-else 
                                :src="defaultImgUrl" 
                                class="w-[40%] mx-auto rounded-lg object-cover mb-4 opacity-50" 
                            />
                            </div>
                        
                        <div>
                            <h5 class="text-2xl font-semibold mb-3">
                                {{ data.product.name }}
                            </h5>
                            <p class="font-semibold mb-3">
                                Size - {{ data.variant.size }}
                            </p>
                            <p class="font-semibold mb-3">
                                Color - {{ data.variant.color }}
                            </p>

                            <div class="flex items-center gap-4 mb-6">
                                <span class="font-medium">Quantity</span>

                                <div class="flex border rounded">
                                    <button class="px-3 py-1" @click="decreaseQty(data)"> - </button>
                                    <span class="px-4 py-1">
                                        {{ data.quantity }}
                                    </span>
                                    <button class="px-3 py-1" @click="increaseQty(data)"> + </button>
                                </div>
                            </div>
                            <div v-if="data.variant.quantity === 0" class="text-red-500 text-sm font-bold">
                                Out of Stock
                            </div>
                            <span class="text-2xl font-bold">₹{{ (data.product.price - (data.product.discount_price || 0)) * data.quantity }}</span>
                            <div class="flex items-center gap-4 mb-6">
                                <p>
                                    <Button
                                        label="Remove Item"
                                        icon="pi pi-trash"
                                        class="!bg-red-400 hover:!bg-red-500 text-white mt-5 px-4 py-2 rounded-lg"
                                        @click="removeProductItem(data.id)"
                                    />
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow p-6">
                <div v-if="cartDatas.length > 0" class="mt-6 border-t pt-4">
                    <div class="flex justify-between mb-2">
                        <span class="text-gray-600">Subtotal</span>
                        <span class="font-medium">₹{{ withoutDiscountTotal }}</span>
                    </div>
                    
                    <div v-if="totalDiscount > 0" class="flex justify-between mb-2 text-green-600">
                        <span>Total Discount</span>
                        <span>- ₹{{ totalDiscount }}</span>
                    </div>
                    
                    <div class="flex justify-between items-center mt-4 p-4 bg-indigo-50 rounded-lg">
                        <span class="text-lg font-bold">Total Amount</span>
                        <span class="text-2xl font-black text-indigo-700">₹{{ finalTotal }}</span>
                    </div>

                    <Button 
                        label="Checkout" 
                        class="w-full mt-4 p-button-success h-12 text-lg" 
                        @click="proceedToCheckout"
                    />
                </div>

                <div v-else class="text-center py-10">
                    <i class="pi pi-shopping-cart text-4xl text-gray-300 mb-3"></i>
                    <p class="text-gray-500">Your cart is empty</p>
                </div>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
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
const products = ref([]);
const loading = ref(false);
const error = ref('');
const cartCount = ref(0);
const cartDatas = ref([]);
const visible = ref(false);
const selectedImage = ref('')
import { toast } from 'vue3-toastify';
import { useCategoryStore } from '../stores/categoryStore' 
import { storeToRefs } from 'pinia'
const categoryStore = useCategoryStore()
const { categoriesData, loading1 } = storeToRefs(categoryStore)
const msgValue = ref('');
const navigationTabs = [
  { name: 'products', label: 'All Product', path: '/products-all', icon: 'pi pi-list',  color: 'green' },
];

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

    // categories.value = response.data.data;
    categories.value = '';
  } catch (err) {
    error.value = 'Failed to fetch categories';
  } finally {
    loading.value = false;
  }
};

const parentCategories = computed(() => {
  return categoriesData.value.filter(cat => cat.parent_id === 1);
});
const selectedCategory = ref(null);

const childCategories = computed(() => {
  if (!selectedCategory.value) return [];
  return categoriesData.value.filter(
    cat => cat.parent_id === selectedCategory.value.id
  );
});

// const openCategory = (cat) => {
//   selectedCategory.value = cat;
// };
const openCategory = async (cat) => {
  if (selectedCategory.value?.id === cat.id) {
    selectedCategory.value = null; // Toggle off if clicked again
  } else {
    selectedCategory.value = cat;
    // Optional: Fetch children from API if not already in 'cat' object
    // const res = await axios.get(`/api/categories/${cat.id}/children`);
    // childCategories.value = res.data;
  }
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
    console.log('cart item is', res.data.cartData)

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

const hasSoldOutItems = computed(() => {
  return cartDatas.value.some(item => item.variant.quantity === 0);
});
const proceedToCheckout = () => {
    if(hasSoldOutItems)
    {
        msgValue.value = 'sold_out';
        setTimeout(() => {
            msgValue.value = '';
        }, 3000); 
        // toast.error("Remove sold-out items first");
        return;
    }
    
    visible.value = false;
    router.push('/checkout'); 
};
onMounted(async () => {
  await categoryStore.fetchCategoriesData()
  // console.log('Data is now loaded:', categoriesData.value)
})
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
const fetchProducts = async () => {
    const params = {
        category_id: route.query.category_id,
        sub_category_id: route.query.sub_category_id,
        search: route.query.search,
        // ... other params
    };
    const token = localStorage.getItem('api_token'); 
    const response = await axios.get('/api/products', { 
        params: params, // Pass your params object here
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    });
    products.value = response.data.data;
};

// watch(() => route.params.id, (newId) => {
//    fetchProducts(newId);
// });
watch(() => route.query, () => {
    fetchProducts();
})
</script>



