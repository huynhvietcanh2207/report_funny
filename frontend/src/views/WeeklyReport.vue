<template>
  <div class="h-full flex flex-col space-y-8 pb-10">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center gap-5">
          <button @click="$router.back()" class="p-3 bg-white dark:bg-[#131d1a] rounded-2xl border border-black/5 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm group">
            <ArrowLeft class="w-5 h-5 text-slate-400 group-hover:text-[#F34455] transition-colors" />
          </button>
          <div>
            <div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-1.5">
              <span>Analytics</span> <ChevronRight class="w-3.5 h-3.5 opacity-30" /> <span>Weekly Intelligence</span>
            </div>
            <h1 class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Báo cáo Tổng hợp Tuần</h1>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <button @click="generateReport" class="flex items-center gap-2.5 px-6 py-3 bg-white dark:bg-[#131d1a] text-slate-600 dark:text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-all border border-black/5 dark:border-white/10 shadow-sm">
            <RefreshCcw class="w-4 h-4" :class="{ 'animate-spin': isGenerating }" />
            {{ isGenerating ? 'Đang tổng hợp...' : 'Làm mới báo cáo' }}
          </button>
          <button class="flex items-center gap-2.5 px-8 py-3 bg-gradient-to-tr from-[#FD94B4] to-[#F34455] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-[0_10px_20px_rgba(243,68,85,0.3)] transition-all active:scale-95">
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

    <div v-else-if="!report" class="flex-1 glass-card bg-white dark:bg-[#131d1a] border-black/5 dark:border-white/5 flex flex-col items-center justify-center text-slate-500 p-12 rounded-[3rem] shadow-xl">
      <div class="w-24 h-24 rounded-[2.5rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-8 border border-black/5 dark:border-white/5">
        <FileText class="w-10 h-10 text-slate-300 dark:text-slate-700" />
      </div>
      <h3 class="text-2xl font-black text-slate-800 dark:text-white mb-3">Chưa có kết quả tổng hợp</h3>
      <p class="mb-10 text-slate-500 dark:text-slate-400 text-center max-w-sm font-medium leading-relaxed">Hệ thống cần 1-2 phút để phân tích tất cả các voice entry của nhóm trong tuần này.</p>
      <button @click="generateReport" class="bg-gradient-to-br from-[#FD94B4] to-[#F34455] text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-[0_15px_30px_rgba(243,68,85,0.4)] hover:shadow-[0_20px_40px_rgba(243,68,85,0.6)] hover:-translate-y-1 transition-all active:scale-95">
        Bắt đầu phân tích AI
      </button>
    </div>

    <div v-else class="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-y-auto pb-20 custom-scrollbar pr-2">
      <!-- Left Column: Overall & Progress -->
      <div class="lg:col-span-1 space-y-8">
        <div class="glass-card p-10 bg-white dark:bg-[#131d1a] border-black/5 dark:border-teal-500/20 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
          <div class="absolute -top-10 -right-10 w-40 h-40 bg-teal-500/5 rounded-full blur-3xl group-hover:bg-teal-500/10 transition-colors"></div>
          <h3 class="text-[10px] font-black uppercase tracking-[0.25em] text-teal-600 dark:text-teal-400 mb-6 flex items-center gap-3">
            <div class="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500">
              <Zap class="w-4 h-4" />
            </div>
            Team Executive Summary
          </h3>
          <p class="text-slate-600 dark:text-slate-300 leading-[1.8] font-bold text-base transition-colors group-hover:text-slate-900 dark:group-hover:text-white">{{ report.overall_summary }}</p>
        </div>

        <div class="glass-card p-10 bg-white dark:bg-[#131d1a] border-black/5 dark:border-white/5 rounded-[2.5rem] shadow-xl flex flex-col items-center">
          <h3 class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 mb-8 w-full text-center">Tiến độ tuần cuối</h3>
          <div class="relative w-48 h-48 mx-auto">
             <svg class="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_10px_rgba(243,68,85,0.2)]" viewBox="0 0 100 100">
               <circle class="text-slate-100 dark:text-white/5 stroke-current" stroke-width="10" cx="50" cy="50" r="40" fill="transparent"></circle>
               <circle class="text-[#F34455] stroke-current transition-all duration-[2000ms] ease-out" stroke-width="10" stroke-linecap="round" cx="50" cy="50" r="40" fill="transparent" :stroke-dasharray="251.2" :stroke-dashoffset="251.2 - (251.2 * (report.team_progress || 0)) / 100"></circle>
             </svg>
             <div class="absolute inset-0 flex flex-col items-center justify-center">
               <span class="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">{{ report.team_progress }}%</span>
             </div>
          </div>
          <div class="mt-8 flex gap-4 w-full">
            <div class="flex-1 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 text-center">
              <div class="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</div>
              <div class="text-xs font-black text-[#F34455]">On Track</div>
            </div>
            <div class="flex-1 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 text-center">
              <div class="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Health</div>
              <div class="text-xs font-black text-emerald-500">Strong</div>
            </div>
          </div>
        </div>

        <div class="glass-card p-10 bg-white dark:bg-amber-500/5 border-amber-500/20 rounded-[2.5rem] shadow-xl border-dashed">
          <h3 class="text-[10px] font-black uppercase tracking-[0.25em] text-amber-600 mb-6 flex items-center gap-3">
            <div class="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Lightbulb class="w-4 h-4" />
            </div>
            Next Phase Strategies
          </h3>
          <ul class="space-y-4">
             <li v-for="(sug, i) in report.next_week_suggestions" :key="i" class="flex gap-4 text-sm text-slate-600 dark:text-slate-300 group">
               <div class="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.5)] group-hover:scale-150 transition-transform"></div>
               <span class="font-bold leading-relaxed">{{ sug }}</span>
             </li>
          </ul>
        </div>
      </div>

      <!-- Right Column: Member Details -->
      <div class="lg:col-span-2 space-y-6">
        <div class="flex items-center gap-4 mb-2">
          <h3 class="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm">Báo cáo theo thành viên</h3>
          <div class="flex-1 h-px bg-gradient-to-r from-black/5 to-transparent dark:from-white/10"></div>
        </div>
        
        <div v-for="member in report.member_summaries" :key="member.user_id" class="glass-card p-8 bg-white dark:bg-[#131d1a] border-black/5 dark:border-white/5 rounded-[2.5rem] shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
           <div class="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-150 transition-transform duration-1000">
              <User class="w-32 h-32 text-[#FD94B4]" />
           </div>
           
           <div class="flex items-center gap-5 mb-8 border-b border-black/5 dark:border-white/5 pb-8 relative z-10">
             <div class="w-16 h-16 rounded-[1.5rem] bg-gradient-to-tr from-[#FD94B4] to-[#F34455] shadow-lg shadow-[#F34455]/20 flex items-center justify-center font-black text-2xl text-white group-hover:rotate-6 transition-transform">
               {{ member.user_name?.charAt(0).toUpperCase() || 'M' }}
             </div>
             <div>
               <h4 class="font-black text-slate-800 dark:text-white text-xl tracking-tight">{{ member.user_name || 'Member Unit #' + member.user_id }}</h4>
               <div class="flex items-center gap-2 mt-1">
                 <span class="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/10">Verified Sync</span>
                 <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Team Consultant</span>
               </div>
             </div>
           </div>

           <div class="grid grid-cols-1 md:grid-cols-2 gap-10 mt-4 relative z-10">
              <div class="space-y-4">
                <h5 class="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <CheckSquare class="w-3.5 h-3.5" /> Accomplishments
                </h5>
                <ul class="text-sm space-y-4 text-slate-600 dark:text-slate-300 font-bold">
                  <li v-for="(acc, i) in member.accomplishments" :key="i" class="flex gap-3 leading-relaxed">
                    <span class="text-emerald-500 shrink-0">✓</span> {{ acc }}
                  </li>
                </ul>
              </div>
              <div class="space-y-4">
                <h5 class="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Clock class="w-3.5 h-3.5" /> Pending Initiatives
                </h5>
                <ul class="text-sm space-y-4 text-slate-600 dark:text-slate-300 font-bold">
                  <li v-for="(pend, i) in member.pending_items" :key="i" class="flex gap-3 leading-relaxed">
                    <span class="text-orange-500 shrink-0">⏳</span> {{ pend }}
                  </li>
                </ul>
              </div>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowLeft, ChevronRight, Download, RefreshCcw, FileText, Lightbulb, CheckSquare, Clock } from 'lucide-vue-next';
import api from '../lib/axios';

const route = useRoute();
const report = ref(null);
const loading = ref(true);
const isGenerating = ref(false);

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
  try {
    const res = await api.post(`/weekly-voices/${route.params.weekId}/generate-report`);
    report.value = res.data;
  } catch (err) {
    alert("Có lỗi khi phân tích: " + err.message);
  } finally {
    isGenerating.value = false;
    loading.value = false;
  }
};

onMounted(() => {
  fetchReport();
});
</script>
