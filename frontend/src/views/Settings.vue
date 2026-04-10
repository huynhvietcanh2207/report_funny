<template>
  <div class="max-w-3xl mx-auto space-y-8 animate-fade-in pb-12 pt-6">
    <div>
      <h1 class="text-2xl sm:text-4xl font-black text-slate-800 dark:text-white mb-2 tracking-tight uppercase">Cấu hình hệ thống</h1>
      <p class="text-slate-500 dark:text-slate-400 font-bold tracking-widest text-xs uppercase">Thiết lập AI & Giao diện</p>
    </div>

    <!-- Personalization Section: Always Visible -->
    <div class="space-y-4">
      <h2 class="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Tùy chỉnh cá nhân</h2>
      <div class="glass-card p-4 sm:p-6 bg-white dark:bg-[#131d1a] border-black/5 dark:border-[#FD94B4]/10 rounded-2xl sm:rounded-3xl shadow-xl">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-[#F34455]/10 flex items-center justify-center text-[#F34455] dark:text-[#FD94B4]">
              <Sun v-if="themeStore.theme === 'light'" class="w-6 h-6" />
              <Moon v-else-if="themeStore.theme === 'dark'" class="w-6 h-6" />
              <Monitor v-else class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-800 dark:text-white">Giao diện</h3>
              <p class="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {{ themeStore.theme === 'light' ? 'SÁNG' : themeStore.theme === 'dark' ? 'TỐI' : 'MÁY' }}
              </p>
            </div>
          </div>

          <!-- Segmented Toggle -->
          <div class="flex p-1 bg-slate-100 dark:bg-black/20 rounded-2xl border border-black/5 dark:border-white/5 self-start sm:self-center">
            <button 
              v-for="opt in themeOptions" :key="opt.id"
              @click="themeStore.setTheme(opt.id)"
              :class="['px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300', 
                       themeStore.theme === opt.id 
                       ? 'bg-[#F34455] text-white shadow-lg shadow-[#F34455]/30' 
                       : 'text-slate-500 hover:text-slate-800 dark:hover:text-white']"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin Section (Controlled by server access) -->
    <div v-if="authStore.user?.role === 'admin'" class="space-y-8 animate-fade-in">
        <!-- API Key Section -->
        <div class="glass-card p-5 sm:p-8 bg-white dark:bg-[#131d1a] border-black/5 dark:border-[#FD94B4]/10 relative overflow-hidden group rounded-2xl sm:rounded-[2.5rem] shadow-xl">
          <div class="flex items-center gap-4 mb-6 shrink-0 relative z-10">
            <div class="w-10 h-10 rounded-xl bg-[#F34455]/10 flex items-center justify-center text-[#F34455] dark:text-[#FD94B4]">
              <Key class="w-5 h-5 transform -rotate-45" />
            </div>
            <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight leading-none pt-1">Google Gemini API Cluster</h3>
          </div>
          
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-6 relative z-10 leading-relaxed font-medium">
            Hệ thống hỗ trợ xoay vòng nhiều API Key. Dữ liệu này được lưu trữ an toàn tại máy chủ. Lấy key tại: <a href="https://aistudio.google.com" target="_blank" class="text-[#F34455] dark:text-[#FD94B4] hover:underline font-bold transition-all">AI Studio</a>
          </p>

          <div class="relative mb-6 z-10">
            <textarea 
              v-model="inputKeys" 
              placeholder="Nhập API key (mỗi dòng 1 key)..." 
              class="w-full bg-slate-50 dark:bg-[#0c1210] border border-black/5 dark:border-white/5 rounded-2xl p-5 text-slate-800 dark:text-white font-mono text-sm outline-none focus:border-[#F34455]/50 transition-all min-h-[140px] resize-y placeholder:text-slate-400 shadow-inner font-bold"
            ></textarea>
          </div>

          <div class="mb-8 flex flex-col gap-2">
            <div class="flex items-center gap-2 text-emerald-500 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Hệ thống có {{ savedKeysArray.length }} keys trong Database
            </div>
            
            <div v-if="savedKeysArray.length > 0" class="flex items-center gap-2 text-[#FD94B4] text-[10px] font-black uppercase tracking-widest">
              <Zap class="w-3 h-3" />
              Đang sử dụng: Key #{{ configStore.activeKeyIndex + 1 }} 
              <span class="opacity-50 font-mono ml-1">({{ maskApiKey(configStore.getActiveKey()) }})</span>
            </div>
          </div>

          <div class="flex items-center gap-4 relative z-10">
            <button @click="saveSettings" 
                    :disabled="isSaving"
                    class="px-8 py-3.5 bg-gradient-to-r from-[#FD94B4] to-[#F34455] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-[0_10px_20px_rgba(243,68,85,0.3)] hover:shadow-[0_15px_30px_rgba(243,68,85,0.5)] hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50">
              {{ isSaving ? 'ĐANG LƯU...' : 'Lưu cấu hình hệ thống' }}
            </button>
          </div>
        </div>

        <!-- Model AI Section -->
        <div class="glass-card p-5 sm:p-8 bg-white dark:bg-[#131d1a] border-black/5 dark:border-[#FD94B4]/10 rounded-2xl sm:rounded-[2.5rem] shadow-xl">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-10 h-10 rounded-xl bg-[#F34455]/10 flex items-center justify-center text-[#F34455] dark:text-[#FD94B4]">
               <Beaker class="w-5 h-5" />
            </div>
            <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight leading-none pt-1">AI Version Model</h3>
          </div>
          
          <div class="relative mb-6">
            <select 
              v-model="selectedModel" 
              class="w-full appearance-none bg-slate-50 dark:bg-[#0c1210] border border-black/5 dark:border-white/5 rounded-2xl px-6 py-4 text-slate-800 dark:text-white font-bold outline-none focus:border-[#F34455]/50 transition-all cursor-pointer shadow-inner pr-12"
            >
              <option v-for="m in availableModels" :key="m.id" :value="m.id">
                {{ m.label }}
              </option>
            </select>
            <ChevronDown class="w-5 h-5 text-slate-400 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium italic">Lưu ý: <span class="font-bold text-[#F34455] dark:text-[#FD94B4]">Flash Models</span> sẽ nhanh hơn và chi phí thấp hơn phù hợp cho xử lý đa nhiệm.</p>
        </div>
    </div>

    <!-- Info Section: Always Visible but themed darker -->
    <div class="glass-card p-4 sm:p-6 bg-[#131d1a] border-[#FD94B4]/10 rounded-2xl shadow-xl">
      <div class="flex items-center gap-3 mb-4">
        <Info class="w-5 h-5 text-[#FD94B4]" />
        <h3 class="text-lg font-bold text-white leading-none pt-1">Hệ thống TeamVoice AI</h3>
      </div>
      <ul class="space-y-3 text-sm text-slate-400 font-medium">
        <li>• Sử dụng Gemini AI để phân tích báo cáo trực tiếp từ Backend</li>
        <li>• API Key được tập trung quản lý bởi Quản trị viên hệ thống</li>
        <li>• Bảo mật hoàn toàn theo quy trình nội bộ của doanh nghiệp</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Key, Beaker, Info, ChevronDown, Sun, Moon, Monitor, Zap } from 'lucide-vue-next';
import { useThemeStore } from '../stores/themeStore';
import { useAuthStore } from '../stores/authStore';
import { useConfigStore } from '../stores/configStore';
import { useNotificationStore } from '../stores/notificationStore';
import api from '../lib/axios';

const themeStore = useThemeStore();
const authStore = useAuthStore();
const configStore = useConfigStore();
const notificationStore = useNotificationStore();

const themeOptions = [
  { id: 'light', label: 'Sáng' },
  { id: 'dark', label: 'Tối' },
  { id: 'system', label: 'Máy' }
];

const inputKeys = ref('');
const savedKeysArray = ref([]);
const selectedModel = ref('gemini-2.5-flash');
const isSaving = ref(false);

const availableModels = [
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Recommended)' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Legacy)' },
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Legacy)' },
  { id: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Experimental)' }
];

const fetchSettings = async () => {
  if (authStore.user?.role !== 'admin') return;
  
  try {
    const response = await api.get('/settings');
    const keys = response.data.gemini_api_keys || [];
    savedKeysArray.value = keys;
    inputKeys.value = keys.join('\n');
    selectedModel.value = response.data.gemini_model || 'gemini-2.5-flash';
  } catch (err) {
    console.error('Failed to fetch settings:', err);
    notificationStore.addNotification('Lỗi tải cấu hình API', 'error');
  }
};

onMounted(() => {
  fetchSettings();
});

const saveSettings = async () => {
  if (isSaving.value) return;
  
  const keysArray = inputKeys.value
    .split('\n')
    .map(k => k.trim())
    .filter(k => k.length > 10);
  
  if (keysArray.length === 0) {
    notificationStore.addNotification('Vui lòng nhập API key hợp lệ', 'error');
    return;
  }

  isSaving.value = true;
  try {
    await api.post('/settings', {
      gemini_api_keys: keysArray,
      gemini_model: selectedModel.value
    });
    savedKeysArray.value = keysArray;
    await configStore.fetchConfig();
    notificationStore.addNotification('Đã lưu cấu hình AI thành công!', 'success');
  } catch (err) {
    notificationStore.addNotification('Lỗi khi lưu cấu hình', 'error');
  } finally {
    isSaving.value = false;
  }
};

const maskApiKey = (key) => {
  if (!key) return '...';
  if (key.length <= 8) return '****';
  return key.substring(0, 4) + '...' + key.substring(key.length - 4);
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
