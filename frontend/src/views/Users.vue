<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Quản lý Nhân viên</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">Danh sách tất cả nhân viên trong hệ thống TeamVoice AI</p>
      </div>
      <button v-if="authStore.user?.role === 'admin'" @click="openModal()" class="bg-gradient-to-r from-[#FD94B4] to-[#F34455] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(243,68,85,0.4)] hover:shadow-[0_0_20px_rgba(243,68,85,0.6)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 active:scale-95 w-auto self-start sm:self-auto">
        <UserPlus class="w-4 h-4 sm:w-5 sm:h-5" />
        Thêm Nhân viên
      </button>
    </div>

    <!-- User Table (Desktop) -->
    <div class="hidden sm:block glass-card bg-white dark:bg-[#131d1a] border-black/5 dark:border-[#FD94B4]/10 rounded-3xl overflow-hidden shadow-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-black/5 dark:border-white/5 bg-slate-50 dark:bg-white/5">
              <th class="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Nhân viên</th>
              <th class="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Email</th>
              <th class="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Ngày tham gia</th>
              <th class="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-black/5 dark:divide-white/5">
            <tr v-for="user in userStore.users" :key="user.id" class="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center gap-4 cursor-pointer" @click="viewDetails(user)">
                  <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FD94B4] to-[#F34455] flex items-center justify-center text-white text-lg font-black shadow-lg shadow-[#F34455]/20 group-hover:scale-110 transition-transform duration-500">
                    {{ user.name.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="font-black text-slate-800 dark:text-white group-hover:text-[#F34455] dark:group-hover:text-[#FD94B4] transition-colors tracking-tight">{{ user.name }}</div>
                    <div class="text-[9px] font-black uppercase tracking-widest text-slate-400">ID: #{{ user.id }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">{{ user.email }}</td>
              <td class="px-6 py-4 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">
                {{ new Date(user.created_at).toLocaleDateString() }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button @click="viewDetails(user)" class="p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-[#F34455]/10 text-slate-500 hover:text-[#F34455] dark:hover:text-[#FD94B4] rounded-xl transition-all border border-transparent hover:border-[#F34455]/20" title="Xem chi tiết">
                    <Eye class="w-4 h-4" />
                  </button>
                  <button v-if="authStore.user?.role === 'admin'" @click="openModal(user)" class="p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-[#F34455]/10 text-slate-500 hover:text-[#F34455] dark:hover:text-[#FD94B4] rounded-xl transition-all border border-transparent hover:border-[#F34455]/20" title="Chỉnh sửa">
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button v-if="authStore.user?.role === 'admin'" @click="openDeleteModal(user)" class="p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 rounded-xl transition-all border border-transparent hover:border-rose-500/20" title="Xóa">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="userStore.loading" class="p-12 flex flex-col items-center justify-center gap-4 text-slate-500">
        <div class="w-10 h-10 border-4 border-[#FD94B4]/20 border-t-[#FD94B4] rounded-full animate-spin"></div>
        <p class="text-xs font-black uppercase tracking-widest animate-pulse">Đang tải danh sách...</p>
      </div>
      <div v-else-if="userStore.users.length === 0" class="p-20 text-center flex flex-col items-center gap-4">
        <div class="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-300">
          <UsersIcon class="w-8 h-8" />
        </div>
        <p class="text-slate-500 font-medium italic">Chưa có nhân viên nào trong hệ thống.</p>
      </div>
    </div>

    <!-- User Cards (Mobile) -->
    <div class="sm:hidden space-y-3">
      <div v-if="userStore.loading" class="flex flex-col items-center justify-center gap-4 text-slate-500 py-12">
        <div class="w-10 h-10 border-4 border-[#FD94B4]/20 border-t-[#FD94B4] rounded-full animate-spin"></div>
        <p class="text-xs font-black uppercase tracking-widest animate-pulse">Đang tải...</p>
      </div>
      <div v-else-if="userStore.users.length === 0" class="glass-card p-12 text-center flex flex-col items-center gap-4 bg-white dark:bg-[#131d1a] rounded-2xl">
        <div class="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-300">
          <UsersIcon class="w-8 h-8" />
        </div>
        <p class="text-slate-500 font-medium italic text-sm">Chưa có nhân viên nào.</p>
      </div>
      <div v-else v-for="user in userStore.users" :key="'m-'+user.id" 
           class="glass-card bg-white dark:bg-[#131d1a] border-black/5 dark:border-[#FD94B4]/10 rounded-2xl p-4 shadow-md active:scale-[0.98] transition-transform">
        <div class="flex items-center gap-3" @click="viewDetails(user)">
          <div class="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#FD94B4] to-[#F34455] flex items-center justify-center text-white font-black shadow-lg shadow-[#F34455]/20 shrink-0">
            {{ user.name.charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-black text-slate-800 dark:text-white tracking-tight text-sm truncate">{{ user.name }}</div>
            <div class="text-[10px] text-slate-400 dark:text-slate-500 truncate">{{ user.email }}</div>
          </div>
          <div v-if="authStore.user?.role === 'admin'" class="flex items-center gap-1.5 shrink-0">
            <button @click.stop="openModal(user)" class="p-2 bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-[#F34455] rounded-lg transition-colors">
              <Edit2 class="w-3.5 h-3.5" />
            </button>
            <button @click.stop="openDeleteModal(user)" class="p-2.5 bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors">
               <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- User Detail Modal -->
    <div v-if="showDetailModal" class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in">
       <div class="glass-card bg-white dark:bg-[#131d1a] border-black/10 dark:border-white/10 w-full sm:max-w-2xl rounded-t-[2rem] sm:rounded-[3rem] p-0 overflow-hidden relative shadow-2xl animate-scale-in max-h-[90vh]">
          <!-- Header Image/Banner -->
          <div class="h-32 bg-gradient-to-r from-[#FD94B4]/20 to-[#F34455]/20 relative">
             <button @click="showDetailModal = false" class="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-xl text-white transition-all z-10">
               <X class="w-5 h-5" />
             </button>
          </div>

          <div class="px-5 sm:px-8 pb-6 sm:pb-8 -mt-12 relative overflow-y-auto">
             <div class="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-8">
                <div class="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#FD94B4] to-[#F34455] border-4 border-white dark:border-[#131d1a] flex items-center justify-center text-white text-3xl font-black shadow-2xl transition-transform hover:rotate-3">
                  {{ selectedUser?.name.charAt(0).toUpperCase() }}
                </div>
                <div class="text-center sm:text-left flex-1">
                    <h2 class="text-xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-none mb-1">{{ selectedUser?.name }}</h2>
                   <p class="text-slate-500 font-bold">{{ selectedUser?.email }}</p>
                </div>
                <button v-if="authStore.user?.role === 'admin'" @click="openModal(selectedUser); showDetailModal = false" class="px-5 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-[#F34455]/10 text-slate-600 dark:text-white rounded-2xl text-sm font-black uppercase tracking-widest border border-black/5 dark:border-white/10 transition-all flex items-center gap-2">
                  <Edit2 class="w-4 h-4 text-[#F34455] dark:text-[#FD94B4]" /> Chỉnh sửa
                </button>
             </div>

             <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Info Section -->
                <div class="space-y-6">
                   <div>
                      <h3 class="text-[10px] font-black uppercase tracking-widest text-[#F34455] dark:text-[#FD94B4] mb-4 ml-1">Thông tin cơ bản</h3>
                      <div class="space-y-4 bg-slate-50 dark:bg-white/5 rounded-3xl p-5 border border-black/5 dark:border-white/5 shadow-inner">
                         <div class="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-300">
                            <Mail class="w-4 h-4 text-slate-400" /> {{ selectedUser?.email }}
                         </div>
                         <div class="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-300">
                            <Calendar class="w-4 h-4 text-slate-400" /> Tham gia: {{ new Date(selectedUser?.created_at).toLocaleDateString() }}
                         </div>
                         <div class="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-300">
                            <Shield class="w-4 h-4 text-slate-400" /> Vai trò: Thành viên hệ thống
                         </div>
                      </div>
                   </div>
                </div>

                <!-- Projects Section -->
                <div>
                   <h3 class="text-[10px] font-black uppercase tracking-widest text-[#F34455] dark:text-[#FD94B4] mb-4 ml-1">Dự án tham gia</h3>
                   <div class="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-2">
                      <div v-if="loadingDetails" class="p-8 text-center flex flex-col items-center gap-3">
                        <div class="w-6 h-6 border-2 border-[#FD94B4]/20 border-t-[#FD94B4] rounded-full animate-spin"></div>
                      </div>
                      <div v-else-if="userDetails?.projects?.length === 0" class="text-slate-500 text-xs font-bold uppercase tracking-widest py-8 text-center bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-black/10 dark:border-white/10">
                         Chưa tham gia dự án nào
                      </div>
                      <router-link v-else v-for="proj in userDetails?.projects" :key="proj.id" :to="`/projects/${proj.id}`" 
                         class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 rounded-2xl border border-black/5 dark:border-white/5 transition-all group/proj shadow-sm hover:shadow-md">
                         <div class="w-10 h-10 rounded-xl bg-[#F34455]/10 flex items-center justify-center text-[#F34455] dark:text-[#FD94B4] group-hover/proj:scale-110 transition-transform">
                            <LayoutGrid class="w-5 h-5" />
                         </div>
                         <div class="flex-1 min-w-0">
                            <div class="text-sm font-black text-slate-800 dark:text-white truncate group-hover/proj:text-[#F34455] transition-colors">{{ proj.name }}</div>
                            <div class="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">{{ proj.pivot?.role || 'member' }}</div>
                         </div>
                         <ChevronRight class="w-4 h-4 text-slate-300 group-hover/proj:text-[#F34455] transition-colors" />
                      </router-link>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in">
       <div class="glass-card bg-white dark:bg-[#131d1a] border-black/10 dark:border-[#FD94B4]/20 w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[3rem] p-6 sm:p-8 relative shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
          <button @click="showModal = false" class="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all">
            <X class="w-5 h-5" />
          </button>

          <div class="mb-10 flex flex-col items-center">
            <div class="w-14 h-14 rounded-2xl bg-[#F34455]/10 text-[#F34455] dark:text-[#FD94B4] flex items-center justify-center mb-4 shadow-inner">
              <UserPlus v-if="!editingUser" class="w-6 h-6" />
              <Edit2 v-else class="w-6 h-6" />
            </div>
            <h2 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{{ editingUser ? 'Sửa thông tin' : 'Thêm Nhân viên' }}</h2>
            <p class="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">{{ editingUser ? 'Cập nhật tài khoản' : 'Tạo tài khoản mới' }}</p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div>
              <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">Tên nhân viên</label>
              <input v-model="form.name" type="text" required
                     class="w-full bg-slate-50 dark:bg-[#0c1210] border border-black/5 dark:border-white/5 rounded-2xl px-5 py-4 text-slate-800 dark:text-white outline-none focus:border-[#F34455]/50 transition-all font-bold placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner" 
                     placeholder="Nguyễn Văn A" />
            </div>
            <div>
              <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">Email liên hệ</label>
              <input v-model="form.email" type="email" required
                     class="w-full bg-slate-50 dark:bg-[#0c1210] border border-black/5 dark:border-white/5 rounded-2xl px-5 py-4 text-slate-800 dark:text-white outline-none focus:border-[#F34455]/50 transition-all font-bold placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner" 
                     placeholder="email@company.com" />
            </div>
            <div>
              <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">
                {{ editingUser ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu' }}
              </label>
              <input v-model="form.password" type="password" :required="!editingUser"
                     class="w-full bg-slate-50 dark:bg-[#0c1210] border border-black/5 dark:border-white/5 rounded-2xl px-5 py-4 text-slate-800 dark:text-white outline-none focus:border-[#F34455]/50 transition-all font-bold placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner" 
                     placeholder="••••••••" />
            </div>

            <div v-if="error" class="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-[10px] font-black uppercase tracking-widest text-center">
              {{ error }}
            </div>

            <button type="submit" :disabled="loading"
                    class="w-full py-4 bg-gradient-to-r from-[#FD94B4] to-[#F34455] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-[0_10px_20px_rgba(243,68,85,0.3)] hover:shadow-[0_15px_30px_rgba(243,68,85,0.5)] hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 mt-4">
              {{ editingUser ? 'Cập nhật hệ thống' : 'Thêm nhân viên ngay' }}
            </button>
          </form>
       </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in" @click.stop>
       <div class="glass-card w-full sm:max-w-md bg-white dark:bg-[#131d1a] border-rose-500/20 rounded-t-[2rem] sm:rounded-3xl p-6 sm:p-8 relative shadow-2xl animate-scale-in" @click.stop>
          <div class="flex flex-col items-center text-center mb-8">
            <div class="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mb-4 shadow-inner">
               <AlertTriangle class="w-8 h-8 flex-shrink-0" />
            </div>
            <h3 class="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">Xóa nhân viên?</h3>
            <p class="text-xs font-black uppercase tracking-widest text-slate-400 mt-1">Hành động này không thể hoàn tác</p>
          </div>
          
          <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8 font-medium text-center">
            Bạn có chắc muốn xóa <strong class="text-rose-500 dark:text-rose-400 border-b border-rose-500/30">"{{ userToDelete?.name }}"</strong> khỏi hệ thống? Nhân viên này sẽ mất toàn bộ quyền truy cập vào các dự án.
          </p>
          
          <div class="flex gap-3">
             <button @click.stop="showDeleteConfirm = false" class="flex-1 py-4.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs transition-colors">Hủy</button>
             <button @click.stop="confirmDelete" class="flex-1 py-4.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-md hover:shadow-[0_10px_20px_rgba(244,63,94,0.3)] hover:-translate-y-0.5 transition-all active:scale-95">Xác nhận xóa</button>
          </div>
       </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserManagement'
}
</script>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { UserPlus, Edit2, Trash2, X, Search, Filter, Eye, Mail, Calendar, Shield, LayoutGrid, ChevronRight, AlertTriangle, Users as UsersIcon } from 'lucide-vue-next';
import { useUserStore } from '../stores/userStore';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import api from '../lib/axios';

const userStore = useUserStore();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const showModal = ref(false);
const showDetailModal = ref(false);
const showDeleteConfirm = ref(false);
const selectedUser = ref(null);
const userToDelete = ref(null);
const userDetails = ref(null);
const loadingDetails = ref(false);
const editingUser = ref(null);
const loading = ref(false);
const error = ref(null);

const form = reactive({
  name: '',
  email: '',
  password: ''
});

onMounted(() => {
  userStore.fetchUsers();
});

const openModal = (user = null) => {
  editingUser.value = user;
  error.value = null;
  if (user) {
    form.name = user.name;
    form.email = user.email;
    form.password = '';
  } else {
    form.name = '';
    form.email = '';
    form.password = '';
  }
  showModal.value = true;
};

const viewDetails = async (user) => {
    selectedUser.value = user;
    showDetailModal.value = true;
    loadingDetails.value = true;
    userDetails.value = null;
    try {
        const response = await api.get(`/users/${user.id}`);
        userDetails.value = response.data;
    } catch (err) {
        notificationStore.addNotification('Không thể tải thông tin chi tiết.', 'error');
    } finally {
        loadingDetails.value = false;
    }
};

const handleSubmit = async () => {
    loading.value = true;
    error.value = null;
    
    // Clean form data: don't send empty password on update
    const submitData = { ...form };
    if (editingUser.value && !submitData.password) {
        delete submitData.password;
    }

    try {
        if (editingUser.value) {
            await userStore.updateUser(editingUser.value.id, submitData);
            notificationStore.addNotification('Cập nhật nhân viên thành công!');
        } else {
            await userStore.createUser(submitData);
            notificationStore.addNotification('Thêm nhân viên mới thành công!');
        }
        showModal.value = false;
    } catch (err) {
        error.value = err.message || 'Có lỗi xảy ra.';
    } finally {
        loading.value = false;
    }
};

const openDeleteModal = (user) => {
    userToDelete.value = user;
    showDeleteConfirm.value = true;
};

const confirmDelete = async () => {
    if (!userToDelete.value) return;
    try {
        await userStore.deleteUser(userToDelete.value.id);
        notificationStore.addNotification('Đã xóa nhân viên thành công!');
        showDeleteConfirm.value = false;
    } catch (err) {
        notificationStore.addNotification(err.message || 'Lỗi khi xóa nhân viên.', 'error');
    }
};
</script>
