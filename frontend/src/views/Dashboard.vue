<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-1">Projects</h1>
        <p class="text-slate-500 dark:text-slate-400">Quản lý các dự án và theo dõi quá trình báo cáo.</p>
      </div>
      <button @click="showModal = true" class="bg-gradient-to-r from-[#FD94B4] to-[#F34455] hover:from-[#F34455] hover:to-[#EC1D3C] text-white px-5 py-2.5 rounded-xl font-medium shadow-[0_0_15px_rgba(243,68,85,0.4)] hover:shadow-[0_0_20px_rgba(243,68,85,0.6)] hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2">
        <Plus class="w-5 h-5" />
        Tạo dự án mới
      </button>
    </div>

    <!-- Stats summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="glass-card p-6 bg-white dark:bg-[#131d1a] border-black/5 dark:border-[#FD94B4]/10 rounded-2xl shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-[#F34455]/10 flex items-center justify-center text-[#FD94B4]">
            <LayoutGrid class="w-6 h-6" />
          </div>
          <div>
            <p class="text-sm text-slate-500 dark:text-slate-400 font-medium tracking-tight">Tổng dự án</p>
            <p class="text-2xl font-black text-slate-800 dark:text-white leading-none">{{ projectStore.projects.length }}</p>
          </div>
        </div>
      </div>
      
      <div class="glass-card p-6 bg-white dark:bg-[#131d1a] border-black/5 dark:border-[#FD94B4]/10 rounded-2xl shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-[#FFDAE9]/10 flex items-center justify-center text-[#FFDAE9]">
            <Mic class="w-6 h-6" />
          </div>
          <div>
            <p class="text-sm text-slate-500 dark:text-slate-400 font-medium tracking-tight">Voice chờ phân tích</p>
            <p class="text-2xl font-black text-slate-800 dark:text-white leading-none">0</p>
          </div>
        </div>
      </div>

      <div class="glass-card p-6 bg-white dark:bg-[#131d1a] border-black/5 dark:border-[#FD94B4]/10 rounded-2xl shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-[#FD94B4]/10 flex items-center justify-center text-[#FD94B4]">
            <FileText class="w-6 h-6" />
          </div>
          <div>
            <p class="text-sm text-slate-500 dark:text-slate-400 font-medium tracking-tight">Báo cáo tuần</p>
            <p class="text-2xl font-black text-slate-800 dark:text-white leading-none">0</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Project List -->
    <div class="mt-8">
      <div v-if="projectStore.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="glass-card h-48 animate-pulse bg-white/40 dark:bg-white/5 border-black/5 dark:border-[#FD94B4]/10 rounded-2xl"></div>
      </div>
      
      <div v-else-if="projectStore.projects.length === 0" class="glass-card p-12 text-center flex flex-col items-center bg-white dark:bg-[#131d1a] border-black/5 dark:border-[#FD94B4]/10 rounded-3xl shadow-xl">
        <div class="w-16 h-16 bg-slate-50 dark:bg-[#0c1210] rounded-2xl flex items-center justify-center text-[#FD94B4] mb-6 border border-black/5 dark:border-[#FD94B4]/10 shadow-inner">
          <FolderOpen class="w-8 h-8" />
        </div>
        <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">Chưa có dự án nào</h3>
        <p class="text-slate-500 dark:text-slate-400 max-w-sm mb-8 leading-relaxed">Tạo dự án đầu tiên của bạn để bắt đầu thu thập báo cáo qua giọng nói.</p>
        <button @click="showModal = true" class="px-8 py-3 bg-[#F34455]/10 hover:bg-[#F34455]/20 text-[#F34455] dark:text-[#FD94B4] rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-[#F34455]/20">Bắt đầu ngay</button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="project in projectStore.projects" :key="project.id" 
             @click="project.is_member !== false ? $router.push(`/projects/${project.id}`) : null" 
             :class="['glass-card glass-card-hover p-0 cursor-pointer group bg-white dark:bg-[#131d1a] border-black/5 dark:border-[#FD94B4]/10 rounded-[2rem] overflow-hidden relative shadow-md transition-all',
                      project.is_member === false ? 'opacity-70 grayscale-[0.5] !cursor-not-allowed' : '']">
          <div class="absolute inset-0 bg-gradient-to-br from-[#FD94B4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div class="p-6">
            <div class="flex items-start justify-between mb-4 relative">
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#F34455]/10 text-[#FD94B4] group-hover:scale-110 transition-transform duration-500 shadow-sm">
                <Folders class="w-6 h-6" />
              </div>
              <div class="flex items-center gap-2">
                <span v-if="project.is_member === false" class="px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/10 flex items-center gap-1">
                  <Lock class="w-2.5 h-2.5" /> No Access
                </span>
                <span v-else class="px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10">
                  Active
                </span>
                <div v-if="project.is_member !== false" class="relative group-menu">
                  <button @click.stop="toggleMenu(project.id)" class="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
                    <MoreVertical class="w-4 h-4" />
                  </button>
                  <!-- Project Menu Dropdown -->
                  <div v-if="activeMenuId === project.id" class="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-[#131d1a] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl z-20 py-2 overflow-hidden animate-fade-in">
                    <button @click.stop="renameProject(project)" class="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 transition-colors">
                      <Edit2 class="w-3.5 h-3.5 text-[#FD94B4]" /> Đổi tên
                    </button>
                    <button @click.stop="deleteProject(project)" class="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 flex items-center gap-2 transition-colors border-t border-black/5 dark:border-white/5">
                      <Trash2 class="w-3.5 h-3.5" /> Xóa Dự Án
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <h3 class="text-xl font-black text-slate-800 dark:text-white mb-2 group-hover:text-[#F34455] dark:group-hover:text-[#FD94B4] transition-colors relative truncate tracking-tight">{{ project.name }}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-8 relative leading-relaxed">{{ project.description || 'Hệ thống AI ghi âm và tóm tắt cuộc họp thông minh.' }}</p>
            
            <div class="flex items-center justify-between pt-5 border-t border-black/5 dark:border-white/5 relative">
              <div class="flex -space-x-2.5">
                <div v-for="(member, idx) in (project.members || []).slice(0, 3)" :key="member.id" 
                     :style="{ zIndex: 10 - idx }"
                     class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-[#131d1a] flex items-center justify-center text-[10px] font-black text-slate-600 dark:text-slate-300 shadow-sm">
                  {{ member.name.charAt(0).toUpperCase() }}
                </div>
                <div v-if="(project.members || []).length > 3" class="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 border-2 border-white dark:border-[#131d1a] flex items-center justify-center text-[10px] font-black text-slate-500 dark:text-slate-400 shadow-sm">
                  +{{ project.members.length - 3 }}
                </div>
              </div>
              <div class="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
                0 TUẦN
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Project Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
      <div class="glass-card w-full max-w-md p-8 bg-white dark:bg-[#131d1a] border-black/10 dark:border-[#FD94B4]/20 rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-scale-in">
        <div class="absolute -top-10 -right-10 w-32 h-32 bg-[#F34455]/10 rounded-full blur-3xl"></div>
        
        <div class="flex items-center gap-4 mb-8">
          <div class="w-12 h-12 rounded-2xl bg-[#F34455]/10 flex items-center justify-center text-[#F34455] dark:text-[#FD94B4]">
            <Plus class="w-6 h-6" />
          </div>
          <h3 class="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Tạo dự án mới</h3>
        </div>

        <div class="space-y-6">
          <div>
            <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">Tên dự án</label>
            <input v-model="newProject.name" type="text" class="w-full bg-slate-50 dark:bg-[#0c1210] border border-black/5 dark:border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-[#F34455]/50 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 transition-all font-bold shadow-inner" placeholder="VD: Chiến dịch Marketing Q2" />
          </div>
          
          <div>
            <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 ml-1">Nhân viên tham gia</label>
            <div class="max-h-52 overflow-y-auto border border-black/5 dark:border-white/5 rounded-2xl bg-slate-50 dark:bg-[#0c1210] p-3 custom-scrollbar shadow-inner">
              <div v-if="userStore.loading" class="p-8 text-center flex flex-col items-center gap-3">
                <div class="w-6 h-6 border-2 border-[#FD94B4]/20 border-t-[#FD94B4] rounded-full animate-spin"></div>
                <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Đang tải...</p>
              </div>
              <div v-else-if="userStore.users.length === 0" class="p-8 text-center text-xs text-slate-500 italic">
                Chưa có nhân viên nào.
              </div>
              <div v-else v-for="user in userStore.users" :key="user.id" 
                   @click="toggleUserSelection(user.id)"
                   :class="['flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all mb-2 group', 
                            newProject.user_ids.includes(user.id) ? 'bg-[#F34455]/10 border border-[#F34455]/20' : 'hover:bg-white/50 dark:hover:bg-white/5 border border-transparent']">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FD94B4] to-[#F34455] flex items-center justify-center text-white text-[10px] font-black shadow-md transition-transform group-hover:scale-110">
                    {{ user.name.charAt(0).toUpperCase() }}
                  </div>
                  <span class="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">{{ user.name }}</span>
                </div>
                <div :class="['w-5 h-5 rounded-md border flex items-center justify-center transition-all', 
                           newProject.user_ids.includes(user.id) ? 'bg-[#F34455] border-[#F34455]' : 'border-slate-300 dark:border-slate-700 bg-transparent']">
                  <Check v-if="newProject.user_ids.includes(user.id)" class="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-4 mt-10">
          <button @click="showModal = false" class="px-6 py-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all font-black uppercase tracking-widest text-[10px]">Hủy bỏ</button>
          <button @click="createProject" 
                  class="px-8 py-3 bg-gradient-to-r from-[#FD94B4] to-[#F34455] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-[0_10px_20px_rgba(243,68,85,0.3)] hover:shadow-[0_15px_30px_rgba(243,68,85,0.5)] transition-all active:scale-95 disabled:opacity-50" 
                  :disabled="!newProject.name || isCreating">
            {{ isCreating ? 'Đang tạo...' : 'Lưu Dự Án' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Plus, LayoutGrid, Mic, FileText, FolderOpen, Folders, MoreVertical, Edit2, Trash2, Check, Lock } from 'lucide-vue-next';
import { useProjectStore } from '../stores/projectStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useUserStore } from '../stores/userStore';

const projectStore = useProjectStore();
const userStore = useUserStore();
const notificationStore = useNotificationStore();

const showModal = ref(false);
const isCreating = ref(false);
const newProject = ref({
  name: '',
  description: '',
  color: 'teal',
  user_ids: []
});

const toggleUserSelection = (userId) => {
  const index = newProject.value.user_ids.indexOf(userId);
  if (index === -1) {
    newProject.value.user_ids.push(userId);
  } else {
    newProject.value.user_ids.splice(index, 1);
  }
};

const createProject = async () => {
  if (!newProject.value.name) return;
  isCreating.value = true;
  try {
    await projectStore.createProject(newProject.value);
    showModal.value = false;
    newProject.value = { name: '', description: '', color: 'teal', user_ids: [] };
  } catch (err) {
    alert("Có lỗi khi tạo dự án!");
  } finally {
    isCreating.value = false;
  }
};

onMounted(() => {
  projectStore.fetchProjects();
  userStore.fetchUsers();
  window.addEventListener('click', handleOutsideClick);
});

onUnmounted(() => {
  window.removeEventListener('click', handleOutsideClick);
});

const activeMenuId = ref(null);
const toggleMenu = (id) => {
  activeMenuId.value = activeMenuId.value === id ? null : id;
};

const handleOutsideClick = (e) => {
  if (activeMenuId.value && !e.target.closest('.group-menu')) {
    activeMenuId.value = null;
  }
};

const renameProject = async (project) => {
  const newName = prompt('Nhập tên mới cho dự án:', project.name);
  if (!newName || newName === project.name) return;
  try {
    await projectStore.updateProject(project.id, { name: newName });
    notificationStore.addNotification('Đổi tên dự án thành công!');
  } catch (err) {
    notificationStore.addNotification('Lỗi khi đổi tên dự án', 'error');
  }
  activeMenuId.value = null;
};

const deleteProject = async (project) => {
  if (!confirm(`Bạn có chắc muốn xóa dự án "${project.name}"? Hành động này không thể hoàn tác.`)) return;
  try {
    await projectStore.deleteProject(project.id);
    notificationStore.addNotification('Xóa dự án thành công!');
  } catch (err) {
    const message = err.response?.data?.message || 'Lỗi khi xóa dự án';
    notificationStore.addNotification(message, 'error', 5000);
  }
  activeMenuId.value = null;
};
</script>
