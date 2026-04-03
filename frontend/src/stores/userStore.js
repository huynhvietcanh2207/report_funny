import { defineStore } from 'pinia';
import api from '../lib/axios';

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    loading: false
  }),
  actions: {
    async fetchUsers() {
      this.loading = true;
      try {
        const response = await api.get('/users');
        this.users = response.data;
      } catch (error) {
        console.error('Fetch users error:', error);
      } finally {
        this.loading = false;
      }
    },
    async createUser(userData) {
      try {
        const response = await api.post('/users', userData);
        this.users.push(response.data);
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },
    async updateUser(id, userData) {
      try {
        const response = await api.put(`/users/${id}`, userData);
        const index = this.users.findIndex(u => u.id === id);
        if (index !== -1) this.users[index] = response.data;
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },
    async deleteUser(id) {
      try {
        await api.delete(`/users/${id}`);
        this.users = this.users.filter(u => u.id !== id);
      } catch (error) {
        throw error.response?.data || error.message;
      }
    }
  }
});
