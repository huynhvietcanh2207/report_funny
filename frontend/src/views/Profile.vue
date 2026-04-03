<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <!-- Profile Header Card -->
    <div class="glass-card bg-white dark:bg-[#131d1a] border-black/5 dark:border-[#FD94B4]/10 rounded-[3rem] p-8 sm:p-12 relative overflow-hidden shadow-2xl">
      <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#FD94B4]/10 to-transparent blur-3xl rounded-full -mr-20 -mt-20"></div>
      
      <div class="flex flex-col md:flex-row items-center gap-8 relative z-10">
        <div class="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-[#FD94B4] to-[#F34455] flex items-center justify-center text-white text-5xl font-black shadow-[0_0_40px_rgba(243,68,85,0.4)] animate-pulse-slow">
          {{ authStore.user?.name.charAt(0).toUpperCase() }}
        </div>
        
        <div class="text-center md:text-left flex-1">
          <div class="flex flex-col md:flex-row md:items-center gap-3 mb-2">
            <h1 class="text-4xl font-black text-slate-800 dark:text-white tracking-tight">{{ authStore.user?.name }}</h1>
            <span class="px-3 py-1 bg-[#F34455]/10 text-[#F34455] dark:text-[#FD94B4] text-[10px] font-black uppercase tracking-widest rounded-full border border-[#F34455]/20 self-center">
              Administrator
            </span>
          </div>
          <p class="text-slate-500 dark:text-slate-400 text-lg mb-6 font-medium">{{ authStore.user?.email }}</p>
          
          <div class="flex flex-wrap justify-center md:justify-start gap-4">
            <div class="px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 flex items-center gap-2">
              <Calendar class="w-4 h-4 text-slate-400" />
              <span class="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Tham gia: {{ new Date(authStore.user?.created_at).toLocaleDateString() }}</span>
            </div>
            <div class="px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 flex items-center gap-2">
              <ShieldCheck class="w-4 h-4 text-slate-400" />
              <span class="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Tài khoản đã xác thực</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
      <!-- Edit Profile -->
      <div class="glass-card bg-white dark:bg-[#131d1a] border-black/5 dark:border-[#FD94B4]/10 rounded-[2.5rem] p-8 shadow-xl">
        <h2 class="text-xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-[#F34455]/10 flex items-center justify-center text-[#F34455]">
            <User class="w-5 h-5" />
          </div>
          Cập nhật hồ sơ
        </h2>
        
        <form @submit.prevent="handleUpdate" class="space-y-6">
          <div>
            <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">Họ và tên</label>
            <input v-model="form.name" type="text" required
                   class="w-full bg-slate-50 dark:bg-[#0c1210] border border-black/5 dark:border-white/5 rounded-2xl px-5 py-4 text-slate-800 dark:text-white outline-none focus:border-[#F34455]/50 transition-all font-bold shadow-inner" />
          </div>
          <div>
            <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">Email liên kết</label>
            <input v-model="form.email" type="email" required
                   class="w-full bg-slate-50 dark:bg-[#0c1210] border border-black/5 dark:border-white/5 rounded-2xl px-5 py-4 text-slate-800 dark:text-white outline-none focus:border-[#F34455]/50 transition-all font-bold shadow-inner" />
          </div>
          <div>
            <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">Mật khẩu mới (để trống nếu không đổi)</label>
            <input v-model="form.password" type="password"
                   class="w-full bg-slate-50 dark:bg-[#0c1210] border border-black/5 dark:border-white/5 rounded-2xl px-5 py-4 text-slate-800 dark:text-white outline-none focus:border-[#F34455]/50 transition-all font-bold placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner" 
                   placeholder="••••••••" />
          </div>

          <div v-if="error" class="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-[10px] font-black uppercase tracking-widest text-center">
            {{ error }}
          </div>

          <button type="submit" :disabled="loading"
                  class="w-full py-4 bg-gradient-to-r from-[#FD94B4] to-[#F34455] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-[0_10px_20px_rgba(243,68,85,0.3)] hover:shadow-[0_15px_30px_rgba(243,68,85,0.5)] hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 mt-4">
            {{ loading ? 'Đang xử lý...' : 'Lưu thay đổi hồ sơ' }}
          </button>
        </form>
      </div>

      <!-- Quick Stats / Settings -->
      <div class="space-y-8">
         <div class="glass-card bg-white dark:bg-[#131d1a] border-black/5 dark:border-[#FD94B4]/10 rounded-[2.5rem] p-8 shadow-xl">
            <h2 class="text-xl font-black text-slate-800 dark:text-white mb-8">Thống kê hoạt động</h2>
            <div class="grid grid-cols-2 gap-4">
               <div class="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-black/5 dark:border-white/5 text-center group hover:border-[#FD94B4]/30 transition-all">
                  <div class="text-3xl font-black text-slate-800 dark:text-white mb-1 group-hover:text-[#F34455] transition-colors">0</div>
                  <div class="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Dự án tham gia</div>
               </div>
               <div class="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-black/5 dark:border-white/5 text-center group hover:border-[#FD94B4]/30 transition-all">
                  <div class="text-3xl font-black text-slate-800 dark:text-white mb-1 group-hover:text-[#F34455] transition-colors">0</div>
                  <div class="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Bản ghi âm</div>
               </div>
            </div>
         </div>

         <div class="glass-card bg-white dark:bg-[#131d1a] border-rose-500/20 rounded-[2.5rem] p-8 shadow-xl border-dashed">
            <h2 class="text-xl font-black text-rose-500 mb-2">Vùng nguy hiểm</h2>
            <p class="text-slate-500 dark:text-slate-400 text-sm mb-8 font-medium leading-relaxed">Đăng xuất khỏi thiết bị hiện tại và xóa mọi phiên làm việc đang hoạt động.</p>
            <button @click="authStore.logout()" class="w-full py-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-500/20 transition-all hover:-translate-y-1 active:scale-95">
              Đăng xuất ngay
            </button>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { User, Calendar, ShieldCheck, Mail, Lock } from 'lucide-vue-next';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import api from '../lib/axios';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const loading = ref(false);
const error = ref(null);

const form = reactive({
  name: authStore.user?.name || '',
  email: authStore.user?.email || '',
  password: ''
});

const handleUpdate = async () => {
    loading.value = true;
    error.value = null;
    
    // Clean data
    const submitData = { ...form };
    if (!submitData.password) delete submitData.password;

    try {
        await api.put(`/users/${authStore.user.id}`, submitData);
        await authStore.fetchUser(); // Refresh local user data
        notificationStore.addNotification('Cập nhật hồ sơ thành công!');
        form.password = '';
    } catch (err) {
        error.value = err.response?.data?.message || 'Có lỗi xảy ra.';
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
@keyframes pulse-slow {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.9; transform: scale(0.98); }
}
.animate-pulse-slow {
  animation: pulse-slow 4s ease-in-out infinite;
}
</style>
