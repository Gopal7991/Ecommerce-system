import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    cartDatas: [],
    isCartVisible: false,
    isCheckoutAllowed: false 
  }),
  actions: {
    toggleCart(status) {
      this.isCartVisible = status;
    },
    allowCheckout() {
      this.isCheckoutAllowed = true;
    },
    disallowCheckout() {
      this.isCheckoutAllowed = false;
    }
  }
})
