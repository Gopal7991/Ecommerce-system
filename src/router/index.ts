// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import AboutView from '../views/AboutView.vue';
import Main from '../components/Main.vue';
import ForgotPassword from '../components/ForgotPassword.vue';
import AdminDashboard from '@/views/AdminDashboard.vue';
import AdminLayout from '@/layouts/AdminLayout.vue';
import CategoryView from '@/views/categories/CategoryView.vue';
import Profile from '@/views/Profile.vue';
import Setting from '@/views/Setting.vue';
import ChangePassword from '@/views/ChangePassword.vue';
import AddCategory from '@/views/categories/AddCategory.vue';
import EditCategory from '@/views/categories/EditCategory.vue';

const routes = [
  { path: '/', name: 'main', component: Main,meta: { guestOnly: true } },
  { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPassword, },
  { path: '/admin-dashboard',name: 'AdminDashboard', component: AdminLayout, meta: { requiresAuth: true }},
  { path: '/home', name: 'Home', component: HomeView },
  { path: '/about', name: 'About', component: AboutView },
  {
    path: '/',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: AdminDashboard,
       meta: { requiresAuth: true }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile,
       meta: { requiresAuth: true }
      },
      {
        path: 'chnage-password',
        name: 'ChangePassword',
        component: ChangePassword,
        meta: { requiresAuth: true }
      },
      {
        path: 'setting',
        name: 'Setting',
        meta: { requiresAuth: true }
      },
      {
        path: 'category',
        component: CategoryView,
        meta: { requiresAuth: true }
      },
      {
        path: 'add-category',
        name: 'AddCategory',
        component: AddCategory,
        meta: { requiresAuth: true }
        
      },
      {
        path: '/edit-category/:id',
        name: 'EditCategory',
        component: EditCategory,
        meta: { requiresAuth: true }
        
      }
    ],
  },
  {
    // path: '/',
    // component: DashboardLayout,
    // meta: { requiresAuth: true },
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  linkExactActiveClass: 'Active'
});

// router.beforeEach((to, from, next) => {
//   const isAuthenticated = localStorage.getItem('api_token')

//   if (to.meta.requiresAuth && !isAuthenticated) {
//     next('/')
//   } else {
//     next()
//   }
// })

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('api_token')

  // Case 1: Trying to access Login page ('/') while already logged in
  if (to.path === '/' && isAuthenticated) {
    next('/dashboard') // Redirect to the actual dashboard path
  } 
  // Case 2: Trying to access Protected page without a token
  else if (to.meta.requiresAuth && !isAuthenticated) {
    next('/')
  } 
  // Case 3: Proceed as normal
  else {
    next()
  }
})

export default router;




