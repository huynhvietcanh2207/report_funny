import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../lib/axios';

export const useConfigStore = defineStore('config', () => {
    const apiKeys = ref([]);
    const activeModel = ref('gemini-3.5-flash');
    const loading = ref(false);

    const activeKeyIndex = ref(0);

    const fetchConfig = async () => {
        loading.value = true;
        try {
            const response = await api.get('/ai-config');
            apiKeys.value = response.data.gemini_api_keys || [];
            activeModel.value = response.data.gemini_model || 'gemini-3.5-flash';
            // Reset index on fetch
            activeKeyIndex.value = 0;
        } catch (error) {
            console.error('Failed to fetch AI configuration:', error);
        } finally {
            loading.value = false;
        }
    };

    const getActiveKey = () => {
        if (apiKeys.value.length === 0) return null;
        return apiKeys.value[activeKeyIndex.value];
    };

    const rotateKey = () => {
        if (apiKeys.value.length > 1) {
            activeKeyIndex.value = (activeKeyIndex.value + 1) % apiKeys.value.length;
            return true;
        }
        return false;
    };

    return {
        apiKeys,
        activeModel,
        activeKeyIndex,
        loading,
        fetchConfig,
        getActiveKey,
        rotateKey
    };
});
