<template>
  <div class="space-y-6">
    <!-- Header info -->
    <div class="glass-card p-6 sm:p-10 bg-white dark:bg-[#131d1a] border-black/5 dark:border-[#FD94B4]/10 rounded-[2.5rem] relative overflow-hidden group shadow-xl">
      <div class="absolute inset-0 bg-gradient-to-br from-[#FD94B4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative">
        <div v-if="loading" class="flex items-center gap-4 w-full animate-pulse">
          <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 shrink-0"></div>
          <div class="space-y-3 flex-1 max-w-xl">
             <div class="h-4 bg-slate-100 dark:bg-white/5 w-1/4 rounded"></div>
             <div class="h-7 bg-slate-100 dark:bg-white/5 w-2/3 rounded"></div>
             <div class="h-4 bg-slate-100 dark:bg-white/5 w-1/2 rounded"></div>
          </div>
        </div>
        
        <div v-else class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div class="w-20 h-20 rounded-3xl flex items-center justify-center bg-[#F34455]/10 text-[#FD94B4] shadow-[0_10px_30px_rgba(243,68,85,0.2)] shrink-0 group-hover:scale-110 transition-transform duration-500">
            <LayoutGrid class="w-10 h-10" />
          </div>
          <div class="text-center sm:text-left">
            <div class="flex items-center justify-center sm:justify-start gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
              <router-link to="/" class="hover:text-[#F34455] transition-colors">Trang chủ</router-link>
              <ChevronRight class="w-3 h-3" />
              <span class="text-slate-500">{{ project?.name }}</span>
            </div>
            <h1 class="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">{{ project?.name }}</h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">{{ project?.description || 'Hệ thống quản lý dự án tích hợp AI thông minh.' }}</p>
          </div>
        </div>
        
        <div class="flex items-center justify-center gap-3 mt-4 sm:mt-0 shrink-0">
          <button @click="openRecordSheet" class="bg-gradient-to-r from-[#FD94B4] to-[#F34455] text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-[0_10px_25px_rgba(243,68,85,0.4)] hover:shadow-[0_15px_30px_rgba(243,68,85,0.6)] hover:-translate-y-1 transition-all flex items-center gap-3 active:scale-95">
            <Mic class="w-4 h-4 animate-pulse" />
            Báo cáo giọng nói
          </button>
        </div>
      </div>
    </div>

    <!-- Tab navigation -->
    <div class="flex items-center space-x-2 border-b border-black/5 dark:border-white/10 mt-12 bg-white/5 dark:bg-black/10 p-1 rounded-2xl w-fit">
      <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
        :class="[
          'px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300',
          activeTab === tab.id 
            ? 'bg-[#F34455] text-white shadow-lg shadow-[#F34455]/30' 
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
        ]">
        {{ tab.label }}
      </button>
    </div>

    <!-- Content: Weeks -->
    <div v-if="activeTab === 'weeks'" class="pt-8">
      <div v-if="loading" class="animate-pulse space-y-4">
        <div v-for="i in 2" :key="i" class="h-32 bg-white dark:bg-white/5 rounded-3xl"></div>
      </div>
      
      <div v-else-if="!project.weekly_voices || project.weekly_voices.length === 0" class="glass-card p-16 text-center flex flex-col items-center bg-white dark:bg-[#131d1a] border-dashed border-black/10 dark:border-white/10 rounded-[3rem]">
        <div class="w-16 h-16 bg-slate-50 dark:bg-[#0c1210] rounded-2xl flex items-center justify-center text-[#FD94B4] mb-6 border border-black/5 dark:border-[#FD94B4]/10">
          <CalendarDays class="w-8 h-8" />
        </div>
        <h3 class="text-2xl font-black text-slate-800 dark:text-white mb-2">Chưa có bản ghi tuần nào</h3>
        <p class="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8 leading-relaxed">Hãy bắt đầu thu âm báo cáo đầu tiên cho tuần này bằng cách nhấn nút "Record" ở góc trên.</p>
        <button @click="openRecordSheet" class="px-8 py-3 bg-[#F34455]/10 hover:bg-[#F34455]/20 text-[#F34455] dark:text-[#FD94B4] rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-[#F34455]/20">
          Tạo bản ghi ngay
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        <div v-for="week in project.weekly_voices" :key="week.id" @click="$router.push(`/projects/${project.id}/weeks/${week.id}`)" 
             class="glass-card glass-card-hover p-6 cursor-pointer group bg-white dark:bg-[#131d1a] border-black/5 dark:border-[#FD94B4]/10 rounded-3xl relative shadow-md overflow-hidden transition-all duration-500">
          <div class="absolute inset-0 bg-gradient-to-br from-[#FD94B4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div class="flex items-start justify-between mb-6 relative z-10">
            <div class="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-[#0c1210] flex items-center justify-center text-[#FD94B4] group-hover:scale-110 transition-all duration-500 border border-black/5 dark:border-white/5 shadow-inner">
               <CalendarDays class="w-6 h-6" />
            </div>
            
            <div class="flex items-center gap-1">
              <button @click.stop="activeWeekMenuId = activeWeekMenuId === week.id ? null : week.id" 
                      class="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all">
                <MoreVertical class="w-4 h-4" />
              </button>
              <div v-if="activeWeekMenuId === week.id" 
                   class="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#131d1a] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl z-20 py-2 overflow-hidden animate-fade-in">
                <button @click.stop="renameWeek(week)" 
                        class="w-full text-left px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3 transition-colors">
                  <Edit2 class="w-4 h-4 text-[#FD94B4]" /> Đổi tên tuần
                </button>
                <button @click.stop="deleteWeek(week.id)" 
                        class="w-full text-left px-4 py-3 text-xs font-bold text-rose-500 hover:bg-rose-500/10 flex items-center gap-3 transition-colors border-t border-black/5 dark:border-white/5">
                  <Trash2 class="w-4 h-4" /> Xóa bản ghi
                </button>
              </div>
            </div>
          </div>

          <div class="relative z-10">
            <h3 class="text-xl font-black text-slate-800 dark:text-white mb-1 group-hover:text-[#F34455] dark:group-hover:text-[#FD94B4] transition-colors"> {{ week.week_label }} </h3>
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400"> BẮT ĐẦU: {{ week.start_date }} </p>
          </div>

          <div class="mt-6 flex items-center justify-between relative z-10">
            <div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#F34455] dark:text-[#FD94B4]">
              <div class="w-1.5 h-1.5 rounded-full bg-[#F34455] animate-pulse"></div>
              Bản ghi khả dụng
            </div>
            <ChevronRight class="w-5 h-5 text-slate-200 dark:text-slate-800 group-hover:text-[#F34455] dark:group-hover:text-[#FD94B4] transition-all transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Content: Members -->
    <div v-if="activeTab === 'members'" class="pt-8">
      <div class="flex items-center justify-between mb-8">
        <h3 class="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Thành viên Dự án</h3>
        <button @click="showAddMemberModal = true" class="px-6 py-2.5 bg-white dark:bg-white/5 hover:bg-[#F34455]/10 text-[#F34455] dark:text-[#FD94B4] border border-black/5 dark:border-[#FD94B4]/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm">
          <UserPlus class="w-4 h-4" /> Mời thành viên
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        <div v-for="member in project.members" :key="member.id" class="glass-card bg-white dark:bg-[#131d1a] border-black/5 dark:border-[#FD94B4]/10 p-5 rounded-[2rem] flex items-center justify-between group shadow-md hover:shadow-lg transition-all duration-500">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FD94B4] to-[#F34455] flex items-center justify-center text-white text-lg font-black shadow-lg shadow-[#F34455]/20 group-hover:scale-110 transition-transform duration-500">
              {{ member.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <div class="font-black text-slate-800 dark:text-white tracking-tight group-hover:text-[#F34455] transition-colors">{{ member.name }}</div>
              <p class="text-[9px] font-black uppercase tracking-widest text-[#F34455] dark:text-slate-500">{{ (member.pivot?.role || 'member') }}</p>
            </div>
          </div>
          <button v-if="member.pivot?.role !== 'admin'" @click="removeMember(member.id)" class="p-2.5 opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-xl transition-all border border-transparent hover:border-rose-500/10">
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Add Member Modal -->
    <div v-if="showAddMemberModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
       <div class="glass-card bg-white dark:bg-[#131d1a] border-black/10 dark:border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 relative shadow-2xl animate-scale-in">
          <button @click="showAddMemberModal = false" class="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all">
            <X class="w-5 h-5" />
          </button>
          
          <div class="flex items-center gap-3 mb-8">
            <div class="w-10 h-10 rounded-xl bg-[#F34455]/10 flex items-center justify-center text-[#F34455] dark:text-[#FD94B4]">
              <UserPlus class="w-5 h-5" />
            </div>
            <h2 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">Thêm thành viên</h2>
          </div>
          
          <div class="space-y-2 max-h-60 overflow-y-auto mb-8 custom-scrollbar pr-2">
            <div v-if="availableUsers.length === 0" class="text-slate-500 text-sm italic py-4 text-center">
              Không còn nhân viên nào để thêm.
            </div>
            <div v-else v-for="user in availableUsers" :key="user.id" 
                 @click="toggleNewMember(user.id)"
                 :class="['flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border', 
                          selectedUserIds.includes(user.id) ? 'bg-[#F34455]/10 border-[#F34455]/40' : 'bg-slate-50 dark:bg-white/5 border-transparent hover:bg-slate-100 dark:hover:bg-white/10']">
              <div class="flex items-center gap-3">
                <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FD94B4] to-[#F34455] flex items-center justify-center text-white text-[10px] font-black shadow-sm">
                  {{ user.name.charAt(0).toUpperCase() }}
                </div>
                <span class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ user.name }}</span>
              </div>
              <div :class="['w-5 h-5 rounded-md border flex items-center justify-center transition-all', 
                           selectedUserIds.includes(user.id) ? 'bg-[#F34455] border-[#F34455]' : 'border-slate-300 dark:border-slate-700 bg-transparent']">
                <Check v-if="selectedUserIds.includes(user.id)" class="w-3 h-3 text-white" />
              </div>
            </div>
          </div>

          <button @click="submitAddMembers" :disabled="selectedUserIds.length === 0 || isSubmitting"
                  class="w-full py-4 bg-gradient-to-r from-[#FD94B4] to-[#F34455] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-[0_10px_20px_rgba(243,68,85,0.3)] hover:shadow-[0_15px_30px_rgba(243,68,85,0.5)] transition-all active:scale-95 disabled:opacity-50">
            {{ isSubmitting ? 'Đang thêm...' : 'Xác nhận thêm' }}
          </button>
       </div>
    </div>
    
    <RecordSheet ref="recordSheet" :projectId="parseInt($route.params.id)" @success="onRecordSuccess" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { ChevronRight, Mic, CalendarDays, Check, Activity, LayoutGrid, MoreVertical, Trash2, Edit2, UserPlus, X } from 'lucide-vue-next';
import api from '../lib/axios';
import RecordSheet from '../components/record/RecordSheet.vue';
import { useNotificationStore } from '../stores/notificationStore';
import { useUserStore } from '../stores/userStore';
import { computed } from 'vue';

const route = useRoute();
const notificationStore = useNotificationStore();
const userStore = useUserStore();
const project = ref({});
const loading = ref(true);
const recordSheet = ref(null);
const activeWeekMenuId = ref(null);

const showAddMemberModal = ref(false);
const isSubmitting = ref(false);
const selectedUserIds = ref([]);

const tabs = [
  { id: 'weeks', label: 'Các tuần (Weeks)' },
  { id: 'members', label: 'Danh sách Thành viên' },
  { id: 'overview', label: 'Tổng quan (Overview)' }
];
const activeTab = ref('weeks');

const fetchProject = async () => {
  try {
    const response = await api.get(`/projects/${route.params.id}`);
    project.value = response.data;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  window.addEventListener('click', handleOutsideClick);
  await fetchProject();
  await userStore.fetchUsers();
});

const availableUsers = computed(() => {
  const currentMemberIds = project.value.members?.map(m => m.id) || [];
  return userStore.users.filter(u => !currentMemberIds.includes(u.id));
});

const toggleNewMember = (id) => {
  const index = selectedUserIds.value.indexOf(id);
  if (index === -1) selectedUserIds.value.push(id);
  else selectedUserIds.value.splice(index, 1);
};

const submitAddMembers = async () => {
  if (selectedUserIds.value.length === 0) return;
  isSubmitting.value = true;
  try {
    const response = await api.post(`/projects/${project.value.id}/members`, {
      user_ids: selectedUserIds.value
    });
    project.value.members = response.data.members;
    showAddMemberModal.value = false;
    selectedUserIds.value = [];
    notificationStore.addNotification('Đã thêm thành viên vào dự án!');
  } catch (error) {
    notificationStore.addNotification('Lỗi khi thêm thành viên.', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const removeMember = async (userId) => {
  if (!confirm('Bạn có chắc muốn xóa thành viên này khỏi dự án?')) return;
  try {
    await api.delete(`/projects/${project.value.id}/members/${userId}`);
    project.value.members = project.value.members.filter(m => m.id !== userId);
    notificationStore.addNotification('Đã xóa thành viên khỏi dự án.');
  } catch (error) {
    notificationStore.addNotification('Lỗi khi xóa thành viên.', 'error');
  }
};

onUnmounted(() => {
  window.removeEventListener('click', handleOutsideClick);
});

const handleOutsideClick = (e) => {
  if (activeWeekMenuId.value && !e.target.closest('.group\\/menu')) {
    activeWeekMenuId.value = null;
  }
};

const deleteWeek = async (id) => {
  if (!confirm('Bạn có chắc muốn xóa dữ liệu tuần này không?')) return;
  try {
    await api.delete(`/weekly-voices/${id}`);
    project.value.weekly_voices = project.value.weekly_voices.filter(w => w.id !== id);
    notificationStore.addNotification('Đã xóa dữ liệu tuần thành công!');
  } catch (error) {
    notificationStore.addNotification('Lỗi khi xóa dữ liệu tuần.', 'error');
  }
  activeWeekMenuId.value = null;
};

const renameWeek = async (week) => {
  const newName = prompt('Nhập tên mới cho tuần:', week.week_label);
  if (!newName || newName === week.week_label) return;
  try {
    await api.put(`/weekly-voices/${week.id}`, { week_label: newName });
    week.week_label = newName;
    notificationStore.addNotification('Đổi tên tuần thành công!');
  } catch (error) {
    notificationStore.addNotification('Lỗi khi đổi tên tuần.', 'error');
  }
  activeWeekMenuId.value = null;
};

const openRecordSheet = () => {
  recordSheet.value?.open();
};

const onRecordSuccess = (data) => {
  // refresh to see new week
  fetchProject();
};
</script>
