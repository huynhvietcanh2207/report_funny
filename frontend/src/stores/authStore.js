import { defineStore } from 'pinia';
import api from '../lib/axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.token
  },

  actions: {
    async register(userData) {
      this.loading = true;
      try {
        const response = await api.post('/register', userData);
        this.token = response.data.access_token;
        this.user = response.data.user;
        
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      } finally {
        this.loading = false;
      }
    },

    async login(credentials) {
      this.loading = true;
      try {
        const response = await api.post('/login', credentials);
        this.token = response.data.access_token;
        this.user = response.data.user;
        
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        await api.post('/logout');
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    },

    async fetchUser() {
      if (!this.token) return;
      try {
        const response = await api.get('/me');
        this.user = response.data;
        localStorage.setItem('user', JSON.stringify(this.user));
      } catch (error) {
        if (error.response?.status === 401) {
          this.logout();
        }
      }
    }
  }
});
