import { defineStore } from 'pinia';
import axios from 'axios';

export const useCategoryStore = defineStore('categoryStore', {
  state: () => ({
    categoriesData: [],
    loading1: false,
    total: 0,
    error: null,
  }),

  getters: {
    categoryCount: (state) => state.categoriesData.length,
  },

  actions: {
      async fetchCategoriesData(filters = {}) {
        this.loading1 = true;
        this.error = null;
        try {
        	const token = localStorage.getItem('api_token')
          const response = await axios.get('/api/categories', {
  	        headers: {
  	          Authorization: `Bearer ${token}`,
  	          Accept: 'application/json'
  	        },
            params: filters, 
  	    })
          this.categoriesData = response.data.data;
          this.total = response.data.total;
          // console.log(this.categoriesData)
        } catch (err) {
          this.error = 'Failed to load categories';
          console.error(err);
        } finally {
          this.loading1 = false;
        }
      }
    }
});

