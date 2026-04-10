<template>
  <div class="h-full flex flex-col space-y-8 pb-10">
    <div class="flex flex-col gap-4 sm:gap-6">
        <div class="flex items-center gap-3 sm:gap-5">
          <button @click="$router.back()" class="p-2.5 sm:p-3 bg-white dark:bg-[#131d1a] rounded-2xl border border-black/5 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm group shrink-0">
            <ArrowLeft class="w-5 h-5 text-slate-400 group-hover:text-[#F34455] transition-colors" />
          </button>
          <div class="min-w-0">
            <div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-1.5">
              <span>Analytics</span> <ChevronRight class="w-3.5 h-3.5 opacity-30" /> <span>Weekly Intelligence</span>
            </div>
            <h1 class="text-xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight truncate">Báo cáo Tổng hợp Tuần</h1>
          </div>
        </div>
        
        <div class="flex items-center gap-2 sm:gap-3">
          <button @click="generateReport" class="flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-2.5 px-4 sm:px-6 py-3 bg-white dark:bg-[#131d1a] text-slate-600 dark:text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-all border border-black/5 dark:border-white/10 shadow-sm">
            <RefreshCcw class="w-4 h-4" :class="{ 'animate-spin': isGenerating }" />
            <span class="hidden sm:inline">{{ isGenerating ? 'Đang tổng hợp...' : 'Làm mới báo cáo' }}</span>
            <span class="sm:hidden">{{ isGenerating ? 'Đang...' : 'Làm mới' }}</span>
          </button>
          <button class="flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-2.5 px-4 sm:px-8 py-3 bg-gradient-to-tr from-[#FD94B4] to-[#F34455] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-[0_10px_20px_rgba(243,68,85,0.3)] transition-all active:scale-95">
            <Download class="w-4 h-4" /> Xuất PDF
          </button>
        </div>
    </div>

    <div v-if="loading" class="flex-1 flex flex-col items-center justify-center text-slate-400 py-20">
      <div class="w-16 h-16 rounded-[2rem] bg-white dark:bg-[#131d1a] border border-black/5 dark:border-white/5 flex items-center justify-center mb-6 shadow-xl relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-transparent animate-pulse"></div>
        <RefreshCcw class="w-6 h-6 text-[#F34455] animate-spin" />
      </div>
      <p class="text-[10px] font-black uppercase tracking-widest animate-pulse text-slate-500">Đang đồng bộ dữ liệu AI...</p>
    </div>

    <div v-else-if="!report && !errorMessage" class="flex-1 glass-card bg-white dark:bg-[#131d1a] border-black/5 dark:border-white/5 flex flex-col items-center justify-center text-slate-500 p-12 rounded-[3rem] shadow-xl">
      <div class="w-24 h-24 rounded-[2.5rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-8 border border-black/5 dark:border-white/5">
        <FileText class="w-10 h-10 text-slate-300 dark:text-slate-700" />
      </div>
      <h3 class="text-2xl font-black text-slate-800 dark:text-white mb-3">Chưa có kết quả tổng hợp</h3>
      <p class="mb-10 text-slate-500 dark:text-slate-400 text-center max-w-sm font-medium leading-relaxed">Hệ thống cần 1-2 phút để phân tích tất cả các voice entry của nhóm trong tuần này.</p>
      <button @click="generateReport" class="bg-gradient-to-br from-[#FD94B4] to-[#F34455] text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-[0_15px_30px_rgba(243,68,85,0.4)] hover:shadow-[0_20px_40px_rgba(243,68,85,0.6)] hover:-translate-y-1 transition-all active:scale-95">
        Bắt đầu phân tích AI
      </button>
    </div>

    <div v-else-if="errorMessage" class="flex-1 glass-card bg-rose-500/5 border-rose-500/20 flex flex-col items-center justify-center text-slate-500 p-8 sm:p-12 rounded-[2rem] sm:rounded-[3rem] shadow-xl animate-fade-in relative overflow-hidden">
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl"></div>
      <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-[2rem] sm:rounded-[2.5rem] bg-white dark:bg-rose-500/10 flex items-center justify-center mb-6 sm:mb-8 border border-rose-500/20 shadow-lg shadow-rose-500/10">
        <ServerCrash class="w-8 h-8 sm:w-10 sm:h-10 text-rose-500" />
      </div>
      <h3 class="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mb-3 text-center">Lỗi hệ thống AI</h3>
      <p class="mb-8 sm:mb-10 text-rose-500/80 dark:text-rose-400/80 text-center max-w-md font-bold leading-relaxed text-sm whitespace-pre-wrap">{{ errorMessage }}</p>
      <button @click="generateReport" class="bg-gradient-to-br from-rose-500 to-[#F34455] text-white px-8 sm:px-10 py-3 sm:py-4 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-[0_15px_30px_rgba(243,68,85,0.4)] hover:shadow-[0_20px_40px_rgba(243,68,85,0.6)] hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-2">
        <RefreshCcw class="w-4 h-4" /> THỬ LẠI NGAY
      </button>
    </div>

    <div v-else class="flex-1 flex flex-col h-full overflow-hidden">
      <!-- Tabs Area -->
      <div class="flex items-center gap-2 mb-4 sm:mb-6 border-b border-black/5 dark:border-white/5 pb-2 sm:pb-4 shrink-0 overflow-x-auto no-scrollbar">
        <button @click="activeTab = 'overview'" 
          :class="[
            'px-4 sm:px-6 py-2 sm:py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 whitespace-nowrap flex items-center gap-2',
            activeTab === 'overview' 
              ? 'bg-white dark:bg-[#F34455] text-[#F34455] dark:text-white shadow-lg dark:shadow-[#F34455]/20 border border-[#F34455]/20 dark:border-transparent' 
              : 'text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 border border-transparent'
          ]">
          <FileText class="w-4 h-4" /> Báo Cáo Thành Viên
        </button>
        <button @click="activeTab = 'mindmap'" 
          :class="[
            'px-4 sm:px-6 py-2 sm:py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 whitespace-nowrap flex items-center gap-2',
            activeTab === 'mindmap' 
              ? 'bg-white dark:bg-[#F34455] text-[#F34455] dark:text-white shadow-lg dark:shadow-[#F34455]/20 border border-[#F34455]/20 dark:border-transparent' 
              : 'text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 border border-transparent'
          ]">
          <Network class="w-4 h-4" /> MindMap Tuần
        </button>
      </div>

      <!-- Tab Content: Overview -->
      <div v-if="activeTab === 'overview'" class="flex-1 overflow-y-auto pb-20 custom-scrollbar sm:pr-2 animate-fade-in">
        <div class="space-y-6 sm:space-y-8">
          <!-- Top Row: Team Summary (3 columns) -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
            <div class="glass-card p-5 sm:p-8 bg-white dark:bg-[#131d1a] border-black/5 dark:border-teal-500/20 rounded-2xl sm:rounded-[2rem] shadow-xl relative overflow-hidden group">
              <div class="absolute -top-10 -right-10 w-40 h-40 bg-teal-500/5 rounded-full blur-3xl group-hover:bg-teal-500/10 transition-colors"></div>
              <h3 class="text-[10px] font-black uppercase tracking-[0.25em] text-teal-600 dark:text-teal-400 mb-4 sm:mb-6 flex items-center gap-3">
                <div class="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500">
                  <Zap class="w-4 h-4" />
                </div>
                Team Executive Summary
              </h3>
              <p class="text-slate-600 dark:text-slate-300 leading-[1.8] font-bold text-sm sm:text-base transition-colors group-hover:text-slate-900 dark:group-hover:text-white">{{ report.overall_summary }}</p>
            </div>

            <div class="glass-card p-5 sm:p-8 bg-white dark:bg-[#131d1a] border-black/5 dark:border-white/5 rounded-2xl sm:rounded-[2rem] shadow-xl flex flex-col items-center">
              <h3 class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 mb-6 sm:mb-8 w-full text-center">Tiến độ tuần cuối</h3>
              <div class="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto">
                <svg class="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_10px_rgba(243,68,85,0.2)]" viewBox="0 0 100 100">
                  <circle class="text-slate-100 dark:text-white/5 stroke-current" stroke-width="10" cx="50" cy="50" r="40" fill="transparent"></circle>
                  <circle class="text-[#F34455] stroke-current transition-all duration-[2000ms] ease-out" stroke-width="10" stroke-linecap="round" cx="50" cy="50" r="40" fill="transparent" :stroke-dasharray="251.2" :stroke-dashoffset="251.2 - (251.2 * (report.team_progress || 0)) / 100"></circle>
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white tracking-tighter">{{ report.team_progress }}%</span>
                </div>
              </div>
              <div class="mt-6 sm:mt-8 flex gap-3 sm:gap-4 w-full">
                <div class="flex-1 p-3 sm:p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 text-center">
                  <div class="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</div>
                  <div class="text-xs font-black text-[#F34455]">On Track</div>
                </div>
                <div class="flex-1 p-3 sm:p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 text-center">
                  <div class="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Health</div>
                  <div class="text-xs font-black text-emerald-500">Strong</div>
                </div>
              </div>
            </div>

            <div class="glass-card p-5 sm:p-8 bg-white dark:bg-amber-500/5 border-amber-500/20 rounded-2xl sm:rounded-[2rem] shadow-xl border-dashed">
              <h3 class="text-[10px] font-black uppercase tracking-[0.25em] text-amber-600 mb-4 sm:mb-6 flex items-center gap-3">
                <div class="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Lightbulb class="w-4 h-4" />
                </div>
                Next Phase Strategies
              </h3>
              <ul class="space-y-3 sm:space-y-4">
                <li v-for="(sug, i) in report.next_week_suggestions" :key="i" class="flex gap-3 sm:gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 group">
                  <div class="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.5)] group-hover:scale-150 transition-transform"></div>
                  <span class="font-bold leading-relaxed">{{ sug }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Bottom Row: Members Grid -->
          <div class="space-y-4 sm:space-y-6">
            <div class="flex items-center gap-4 mb-2">
              <h3 class="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm">Báo cáo theo thành viên</h3>
              <div class="flex-1 h-px bg-gradient-to-r from-black/5 to-transparent dark:from-white/10"></div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div v-for="member in report.member_summaries" :key="member.user_id" class="glass-card p-5 sm:p-6 bg-white dark:bg-[#131d1a] border-black/5 dark:border-white/5 rounded-2xl sm:rounded-[2rem] shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
                 <div class="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-150 transition-transform duration-1000">
                    <User class="w-24 h-24 text-[#FD94B4]" />
                 </div>
                 
                 <div class="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6 border-b border-black/5 dark:border-white/5 pb-4 sm:pb-6 relative z-10">
                   <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-[#FD94B4] to-[#F34455] shadow-lg shadow-[#F34455]/20 flex items-center justify-center font-black text-lg sm:text-xl text-white group-hover:rotate-6 transition-transform">
                     {{ member.user_name?.charAt(0).toUpperCase() || 'M' }}
                   </div>
                   <div class="min-w-0">
                     <h4 class="font-black text-slate-800 dark:text-white text-sm sm:text-base tracking-tight truncate">{{ member.user_name || 'Member Unit #' + member.user_id }}</h4>
                     <div class="flex items-center gap-2 mt-1">
                       <span class="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest border border-emerald-500/10 whitespace-nowrap">Verified Sync</span>
                     </div>
                   </div>
                 </div>

                 <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 relative z-10">
                    <div class="space-y-3">
                      <h5 class="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2 sm:mb-3 flex items-center gap-2">
                        <CheckSquare class="w-3 h-3" /> Accomplishments
                      </h5>
                      <ul class="text-xs sm:text-sm space-y-2 sm:space-y-3 text-slate-600 dark:text-slate-300 font-bold">
                        <li v-for="(acc, i) in member.accomplishments" :key="i" class="flex gap-2 leading-relaxed">
                          <span class="text-emerald-500 shrink-0">✓</span> <span>{{ acc }}</span>
                        </li>
                      </ul>
                    </div>
                    <div class="space-y-3">
                      <h5 class="text-[9px] font-black text-orange-500 uppercase tracking-[0.2em] mb-2 sm:mb-3 flex items-center gap-2">
                        <Clock class="w-3 h-3" /> Pending Initiatives
                      </h5>
                      <ul class="text-xs sm:text-sm space-y-2 sm:space-y-3 text-slate-600 dark:text-slate-300 font-bold">
                        <li v-for="(pend, i) in member.pending_items" :key="i" class="flex gap-2 leading-relaxed">
                          <span class="text-orange-500 shrink-0">⏳</span> <span>{{ pend }}</span>
                        </li>
                      </ul>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Content: Mindmap -->
      <div v-else-if="activeTab === 'mindmap'" class="flex-1 h-full min-h-[500px] flex flex-col p-2 overflow-hidden bg-slate-50 dark:bg-[#131d1a] rounded-2xl lg:rounded-[3rem] border border-black/5 dark:border-white/5 shadow-inner relative animate-fade-in">
        <MindMap v-if="report.mindmap" :treeData="report.mindmap" />
        <div v-else class="flex-1 flex flex-col items-center justify-center text-slate-400">
           <Network class="w-16 h-16 opacity-30 mb-4" />
           <p class="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500">Chưa có dữ liệu Mindmap cho báo cáo này.</p>
        </div>

        <div v-if="report.mindmap" class="mt-auto p-4 lg:p-5 bg-white dark:bg-[#0c1210]/50 rounded-b-2xl lg:rounded-b-[3rem] border-t border-black/5 dark:border-white/5 flex items-center justify-center gap-4 text-[9px] text-slate-400 dark:text-slate-600 font-black uppercase tracking-[0.25em]">
          <Zap class="w-4 h-4 text-[#FD94B4]" />
          <span class="hidden sm:inline">Use Mouse to drag & Scroll to Zoom</span>
          <span class="sm:hidden">Pinch & Drag to navigate</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowLeft, ChevronRight, Download, RefreshCcw, FileText, Lightbulb, CheckSquare, Clock, Zap, Network, User, ServerCrash } from 'lucide-vue-next';
import MindMap from '../components/voice/MindMap.vue';
import api from '../lib/axios';

const route = useRoute();
const report = ref(null);
const loading = ref(true);
const isGenerating = ref(false);
const activeTab = ref('overview');
const errorMessage = ref('');

const fetchReport = async () => {
  try {
    // In actual implementation we might fetch using weekId or project report relation
    // We'll mimic fetching by trying to fetch report for this week
    const res = await api.get(`/weekly-voices/${route.params.weekId}`);
    if (res.data.weekly_report) {
      report.value = res.data.weekly_report;
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const generateReport = async () => {
  if (isGenerating.value) return;
  isGenerating.value = true;
  loading.value = true;
  errorMessage.value = '';
  try {
    const res = await api.post(`/weekly-voices/${route.params.weekId}/generate-report`);
    report.value = res.data;
  } catch (err) {
    const backendError = err.response?.data?.error || err.message;
    if (backendError.includes('503') || backendError.includes('demand') || backendError.includes('UNAVAILABLE')) {
       errorMessage.value = 'Hệ thống AI của Google hiện đang quá tải (Lỗi 503). Server đã tự động thử tất cả các Key dự phòng nhưng đều bị từ chối.\n\nVui lòng đợi 1-2 phút rồi thử lại.';
    } else if (backendError.includes('429') || backendError.includes('hết hạn mức') || backendError.includes('quota')) {
       errorMessage.value = 'Tất cả API Key hiện tại đã hết hạn mức sử dụng (Lỗi 429).\n\nVui lòng thêm Key mới trong phần Cài đặt hệ thống, hoặc đợi Google reset quota.';
    } else {
       errorMessage.value = 'Lỗi không xác định từ hệ thống phân tích: ' + backendError;
    }
  } finally {
    isGenerating.value = false;
    loading.value = false;
  }
};

onMounted(() => {
  fetchReport();
});
</script>
