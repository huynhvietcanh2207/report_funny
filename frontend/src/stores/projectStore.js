import { defineStore } from 'pinia';
import api from '../lib/axios';

export const useProjectStore = defineStore('project', {
    state: () => ({
        projects: [],
        loading: false,
        error: null
    }),
    actions: {
        async fetchProjects(force = false) {
            if (this.loading) return; // Prevent concurrent calls
            if (this.projects.length > 0 && !force) return; // Use cache unless forced

            this.loading = true;
            try {
                const response = await api.get('/projects');
                this.projects = response.data;
            } catch (err) {
                this.error = err.message || 'Error fetching projects';
            } finally {
                this.loading = false;
            }
        },
        async createProject(data) {
            try {
                const response = await api.post('/projects', data);
                this.projects.unshift(response.data);
                return response.data;
            } catch (err) {
                throw err;
            }
        },
        async updateProject(id, data) {
            try {
                const response = await api.put(`/projects/${id}`, data);
                const index = this.projects.findIndex(p => p.id === id);
                if (index !== -1) {
                    this.projects[index] = { ...this.projects[index], ...response.data };
                }
                return response.data;
            } catch (err) {
                throw err;
            }
        },
        async deleteProject(id) {
            try {
                await api.delete(`/projects/${id}`);
                this.projects = this.projects.filter(p => p.id !== id);
            } catch (err) {
                throw err;
            }
        }
    }
});
