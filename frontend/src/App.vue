<template>
  <div class="flex h-screen w-full bg-slate-50 dark:bg-[#0c1210] overflow-hidden">
    <!-- Desktop Sidebar (Hidden on Login/Register) -->
    <aside v-if="!$route.meta.guest" class="hidden lg:flex flex-col w-64 border-r border-black/5 dark:border-[#FD94B4]/10 bg-white dark:bg-[#131d1a] px-4 py-6 shrink-0 transition-colors duration-300">
      <div class="flex items-center gap-3 px-3 mb-10 shrink-0">
        <div class="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#FD94B4] to-[#F34455] flex items-center justify-center shadow-lg shadow-[#F34455]/20">
          <Mic class="w-5 h-5 text-white" />
        </div>
        <h1 class="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#FD94B4] to-[#F34455] tracking-tight">
          TeamVoice AI
        </h1>
      </div>
      
      <nav class="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
        <router-link to="/" exact-active-class="bg-[#F34455]/10 text-[#F34455] dark:text-[#FD94B4] border border-[#F34455]/20 shadow-sm" class="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all border border-transparent group">
          <LayoutDashboard class="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span class="font-bold text-sm tracking-tight">Dashboard</span>
        </router-link>
        
        <div class="pt-6 pb-2">
           <p class="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Các Dự Án</p>
           <div class="space-y-1">
             <div v-if="projectStore.loading" class="animate-pulse space-y-2 px-4">
               <div class="h-8 bg-slate-100 dark:bg-white/5 rounded-lg w-full"></div>
             </div>
             <router-link v-else v-for="proj in projectStore.projects" :key="proj.id" :to="`/projects/${proj.id}`" active-class="bg-[#F34455]/10 text-[#F34455] dark:text-[#FD94B4] border border-[#F34455]/20" class="flex items-center gap-3 px-4 py-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 transition-all border border-transparent text-sm group">
               <span class="w-1.5 h-1.5 rounded-full bg-[#FD94B4] group-hover:scale-150 transition-transform"></span>
               <span class="font-bold truncate tracking-tight">{{ proj.name }}</span>
             </router-link>
           </div>
        </div>

        <router-link to="/users" active-class="bg-[#F34455]/10 text-[#F34455] dark:text-[#FD94B4] border border-[#F34455]/20" class="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all border border-transparent mt-2 group">
          <Users class="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span class="font-bold text-sm tracking-tight">Nhân viên</span>
        </router-link>

        <router-link to="/settings" active-class="bg-[#F34455]/10 text-[#F34455] dark:text-[#FD94B4] border border-[#F34455]/20" class="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all border border-transparent mt-2 group">
          <Settings class="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span class="font-bold text-sm tracking-tight">Settings</span>
        </router-link>
      </nav>

      <!-- User Profile at bottom of Sidebar -->
      <div v-if="authStore.user" class="mt-auto pt-6 border-t border-black/5 dark:border-white/5">
        <div class="flex items-center gap-2 group">
          <router-link to="/profile" class="flex-1 p-2 rounded-[1.25rem] bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center gap-3 transition-all hover:border-[#FD94B4]/50 overflow-hidden">
             <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FD94B4] to-[#F34444] flex items-center justify-center text-white font-black shrink-0 shadow-lg group-hover:rotate-12 transition-transform">
               {{ authStore.user.name?.charAt(0).toUpperCase() }}
             </div>
             <div class="flex-1 min-w-0">
               <p class="text-sm font-black text-slate-800 dark:text-white truncate transition-colors">{{ authStore.user.name }}</p>
               <p class="text-[9px] text-slate-400 dark:text-slate-500 truncate uppercase tracking-widest font-black">Quản trị viên</p>
             </div>
          </router-link>
          <button @click="authStore.logout()" class="p-3 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-2xl transition-all border border-transparent hover:border-rose-500/10" title="Đăng xuất">
             <LogOut class="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col h-full relative overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-[#0c1210]">
      <header v-if="!$route.meta.guest" class="h-16 shrink-0 flex items-center px-6 lg:px-8 bg-white/50 dark:bg-[#0c1210]/80 backdrop-blur-xl sticky top-0 z-10 border-b border-black/5 dark:border-[#FD94B4]/10">
        <h2 class="text-lg font-semibold">{{ $route.name }}</h2>
      </header>
      
      <div :class="['flex-1 w-full', !$route.meta.guest ? 'p-6 lg:p-8 max-w-7xl mx-auto' : '']">
        <router-view :key="$route.path" />
      </div>

      <!-- Global Notifications -->
      <Toast />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { Mic, LayoutDashboard, Settings, LogOut, Users } from 'lucide-vue-next';
import { useProjectStore } from './stores/projectStore';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';
import { useConfigStore } from './stores/configStore';
import Toast from './components/common/Toast.vue';

const projectStore = useProjectStore();
const authStore = useAuthStore();
const themeStore = useThemeStore();
const configStore = useConfigStore();

onMounted(() => {
  themeStore.applyTheme();
  if (authStore.isAuthenticated) {
    authStore.fetchUser();
    projectStore.fetchProjects();
    configStore.fetchConfig();
  }
});
</script>

<style>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(253, 148, 180, 0.2);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(253, 148, 180, 0.4);
}
</style>
