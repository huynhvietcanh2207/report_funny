<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-[#0c1210] p-6 relative overflow-hidden transition-colors duration-500">
    <!-- Animated backgrounds -->
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#F34455]/5 dark:bg-[#F34455]/10 blur-[120px] animate-pulse"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#FD94B4]/5 dark:bg-[#FD94B4]/10 blur-[120px] animate-pulse [animation-delay:2s]"></div>

    <div class="w-full max-w-md relative z-10">
      <div class="flex flex-col items-center mb-10">
        <div class="w-20 h-20 rounded-[2.25rem] bg-gradient-to-tr from-[#FD94B4] to-[#F34455] flex items-center justify-center shadow-[0_20px_40px_rgba(243,68,85,0.3)] mb-6 group hover:rotate-12 transition-transform duration-500">
          <Mic class="w-10 h-10 text-white" />
        </div>
        <h1 class="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Chào mừng trở lại!</h1>
        <p class="text-slate-400 dark:text-slate-500 mt-3 font-bold uppercase tracking-widest text-[10px]">Đăng nhập để tiếp tục công việc</p>
      </div>

      <div class="glass-card p-10 bg-white/80 dark:bg-[#131d1a]/50 border border-black/5 dark:border-white/5 rounded-[3rem] shadow-2xl backdrop-blur-2xl transition-all">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2.5 ml-1">Email của bạn</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 dark:text-slate-600 group-focus-within:text-[#F34455] transition-colors">
                <Mail class="w-5 h-5" />
              </div>
              <input v-model="form.email" type="email" required
                     class="w-full bg-slate-50 dark:bg-[#0c1210] border border-black/5 dark:border-white/5 rounded-2xl pl-14 pr-5 py-4.5 text-slate-800 dark:text-white outline-none focus:border-[#F34455]/50 transition-all font-bold shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-700" 
                     placeholder="name@company.com" />
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2.5 ml-1">Mật khẩu bảo mật</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 dark:text-slate-600 group-focus-within:text-[#F34455] transition-colors">
                <Lock class="w-5 h-5" />
              </div>
              <input v-model="form.password" type="password" required
                     class="w-full bg-slate-50 dark:bg-[#0c1210] border border-black/5 dark:border-white/5 rounded-2xl pl-14 pr-5 py-4.5 text-slate-800 dark:text-white outline-none focus:border-[#F34455]/50 transition-all font-bold shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-700" 
                     placeholder="••••••••" />
            </div>
          </div>

          <div v-if="error" class="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
            {{ error }}
          </div>

          <button type="submit" :disabled="authStore.loading"
                  class="w-full py-5 bg-gradient-to-r from-[#FD94B4] to-[#F34455] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-[0_15px_30px_rgba(243,68,85,0.3)] hover:shadow-[0_20px_40px_rgba(243,68,85,0.6)] hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50">
            <span v-if="!authStore.loading" class="flex items-center justify-center gap-3">
              Xác nhận Đăng Nhập
              <ChevronRight class="w-4 h-4" />
            </span>
            <span v-else class="flex items-center justify-center gap-2">
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Hệ thống đang xử lý...
            </span>
          </button>
        </form>

        <div class="mt-10 text-center border-t border-black/5 dark:border-white/5 pt-8">
          <p class="text-xs font-bold text-slate-400 dark:text-slate-500">
            Bạn là thành viên mới? 
            <router-link to="/register" class="text-[#F34455] dark:text-[#FD94B4] font-black hover:underline transition-all uppercase tracking-widest ml-1">Đăng ký ngay</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Mic, Mail, Lock } from 'lucide-vue-next';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const authStore = useAuthStore();
const error = ref(null);

const form = reactive({
  email: '',
  password: ''
});

const handleLogin = async () => {
  error.value = null;
  try {
    await authStore.login(form);
    router.push('/');
  } catch (err) {
    error.value = err.message || 'Lỗi đăng nhập. Vui lòng thử lại.';
  }
};
</script>

<style scoped>
.glass-card {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
.animate-shake {
  animation: shake 0.2s ease-in-out 0s 2;
}
</style>
