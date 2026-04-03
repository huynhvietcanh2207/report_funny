import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../lib/axios';

export const useConfigStore = defineStore('config', () => {
    const apiKeys = ref([]);
    const activeModel = ref('gemini-2.1-flash');
    const loading = ref(false);

    const fetchConfig = async () => {
        loading.value = true;
        try {
            const response = await api.get('/ai-config');
            apiKeys.value = response.data.gemini_api_keys || [];
            activeModel.value = response.data.gemini_model || 'gemini-2.1-flash';
        } catch (error) {
            console.error('Failed to fetch AI configuration:', error);
        } finally {
            loading.value = false;
        }
    };

    const getActiveKey = () => {
        if (apiKeys.value.length === 0) return null;
        // Simple rotation: random selection or just pick the first one
        return apiKeys.value[Math.floor(Math.random() * apiKeys.value.length)];
    };

    return {
        apiKeys,
        activeModel,
        loading,
        fetchConfig,
        getActiveKey
    };
});
