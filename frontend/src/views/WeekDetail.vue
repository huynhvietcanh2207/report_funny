<template>
  <div class="h-[calc(100vh-8rem)] lg:flex gap-6 overflow-hidden">
    <!-- Panel 1: List of Voices in this Week -->
    <div v-show="!isMobile || !showDetail" :class="[
      'flex flex-col bg-white dark:bg-[#131d1a] border border-black/5 dark:border-[#FD94B4]/10 rounded-3xl overflow-hidden shadow-xl transition-colors',
      isMobile ? 'w-full h-full' : 'w-1/3'
    ]">
      <div class="p-4 lg:p-6 border-b border-black/5 dark:border-white/5 flex flex-col gap-3 lg:gap-4 bg-white dark:bg-[#131d1a]">
        <div class="flex flex-col gap-3">
          <button @click="$router.push(`/projects/${$route.params.id}`)" class="group flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 shadow-sm hover:shadow active:scale-95 w-fit">
            <div class="w-5 h-5 rounded-full bg-white dark:bg-[#131d1a] shadow-sm flex items-center justify-center group-hover:-translate-x-0.5 transition-transform">
              <ArrowLeft class="w-3 h-3 text-[#F34455] dark:text-[#FD94B4]" />
            </div>
            Về dự án
          </button>
          <div class="flex items-center justify-between gap-2">
            <h2 class="font-black text-base lg:text-xl text-slate-800 dark:text-white tracking-tight">Voices tuần này</h2>
            <span class="text-[10px] px-3 py-1 bg-[#F34455]/10 text-[#F34455] dark:text-[#FD94B4] rounded-full font-black uppercase tracking-widest border border-[#F34455]/10 shrink-0">{{ week?.voice_entries?.length || 0 }} bản</span>
          </div>
        </div>
        <button @click="$router.push(`/projects/${$route.params.id}/weeks/${$route.params.weekId}/report`)" class="w-full py-3 lg:py-3.5 bg-gradient-to-r from-[#FD94B4] to-[#F34455] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-[0_10px_20px_rgba(243,68,85,0.3)] hover:shadow-[0_15px_30px_rgba(243,68,85,0.5)] transition-all active:scale-95">
          Xem Báo Cáo Tuần (AI)
        </button>
      </div>
      
      <div class="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3 custom-scrollbar bg-slate-50 dark:bg-[#0c1210]/30 mr-1 mt-1 rounded-tr-3xl">
        <div v-if="loading" class="animate-pulse space-y-3">
           <div v-for="i in 3" :key="i" class="h-24 bg-white dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5"></div>
        </div>
        <div v-else-if="!week?.voice_entries?.length" class="text-center py-20">
           <div class="w-12 h-12 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-700 mx-auto mb-4 border border-black/5">
             <Mic class="w-6 h-6" />
           </div>
           <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Chưa có bản ghi nào</p>
        </div>
        <div v-else v-for="entry in week.voice_entries" :key="entry.id" 
              @click="selectEntry(entry)"
              :class="[
                'p-4 lg:p-5 rounded-2xl cursor-pointer transition-all border group relative',
                activeEntry?.id === entry.id 
                  ? 'bg-white dark:bg-[#F34455]/10 border-[#F34455]/30 shadow-lg scale-[1.02] z-1' 
                  : 'bg-white dark:bg-[#0c1210] border-black/5 dark:border-white/5 hover:border-[#F34455]/20 hover:bg-slate-50/50 dark:hover:bg-white/5'
              ]">
          <div v-if="activeEntry?.id === entry.id" class="absolute inset-0 bg-gradient-to-br from-[#FD94B4]/5 to-transparent opacity-50 rounded-2xl"></div>
          
          <div class="flex items-center gap-3 lg:gap-4 relative">
            <div :class="['w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500', 
                          activeEntry?.id === entry.id ? 'bg-[#F34455] text-white shadow-[0_10px_20px_rgba(243,68,85,0.3)]' : 'bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-600 group-hover:scale-110']">
              <Mic v-if="entry.source === 'microphone'" class="w-5 h-5 ml-0.5" />
              <Music v-else-if="entry.source === 'upload'" class="w-5 h-5" />
              <FileText v-else class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2 mb-1.5">
                <h4 :class="['font-black text-sm line-clamp-1 flex-1 tracking-tight transition-colors', activeEntry?.id === entry.id ? 'text-[#F34455] dark:text-[#FD94B4]' : 'text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-white']">{{ entry.title }}</h4>
                <div class="relative group-menu">
                  <button @click.stop="toggleMenu(entry.id)" class="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl text-slate-300 dark:text-slate-700 hover:text-slate-600 dark:hover:text-white transition-colors">
                    <MoreVertical class="w-4 h-4" />
                  </button>
                  <div v-if="activeMenuId === entry.id" class="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#131d1a] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl z-[100] py-2 overflow-hidden animate-fade-in text-left">
                    <button @click.stop="openRenameModal(entry)" class="w-full text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 transition-colors">
                      <Edit2 class="w-4 h-4 text-[#FD94B4]" /> Đổi tên
                    </button>
                    <button @click.stop="openDeleteModal(entry)" class="w-full text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-3 transition-colors border-t border-black/5 dark:border-white/5">
                      <Trash2 class="w-4 h-4" /> Xóa bản ghi
                    </button>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-600">
                 <span>{{ new Date(entry.created_at).toLocaleDateString() }}</span>
                 <span v-if="entry.summary" class="flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400/80">
                   <div class="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                   Đã phân tích
                 </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel 2: Analysis Detail Tabs -->
    <div v-show="isMobile ? showDetail : !!activeEntry" :class="[
      'flex flex-col bg-white dark:bg-[#131d1a] border border-black/5 dark:border-[#FD94B4]/10 rounded-3xl overflow-hidden relative transition-colors shadow-xl',
      isMobile ? 'w-full h-full absolute inset-0 z-20' : 'flex-1'
    ]">
      <div v-if="!activeEntry" class="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-700 bg-slate-50/50 dark:bg-transparent">
        <div class="w-20 h-20 bg-white dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-sm border border-black/5 dark:border-white/5">
          <Sparkles class="w-10 h-10 opacity-30" />
        </div>
        <p class="text-xs font-black uppercase tracking-widest animate-pulse">Chọn một bản ghi để bắt đầu</p>
      </div>

      <template v-else>
        <!-- Mobile back button + condensed header -->
        <div class="p-4 lg:p-8 border-b border-black/5 dark:border-white/5 shrink-0 bg-white dark:bg-[#131d1a] relative overflow-hidden group">
          <div class="absolute -top-24 -right-24 w-64 h-64 bg-[#F34455]/5 rounded-full blur-3xl group-hover:bg-[#F34455]/10 transition-colors duration-1000"></div>
          
          <div class="relative z-10">
            <!-- Mobile back button -->
            <button v-if="isMobile" @click="goBackToList" class="group flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 shadow-sm hover:shadow active:scale-95 mb-4 w-fit">
              <div class="w-5 h-5 rounded-full bg-white dark:bg-[#131d1a] shadow-sm flex items-center justify-center group-hover:-translate-x-0.5 transition-transform">
                <ArrowLeft class="w-3 h-3 text-[#F34455] dark:text-[#FD94B4]" />
              </div>
              Về danh sách
            </button>

            <div class="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#F34455] dark:text-[#FD94B4] mb-2 lg:mb-3">
              <Sparkles class="w-3.5 h-3.5 animate-pulse" />
              AI Insight Analysis
            </div>
            <h2 class="text-xl lg:text-3xl font-black text-slate-800 dark:text-white mb-3 lg:mb-4 tracking-tight line-clamp-2">{{ activeEntry.title }}</h2>
            <div class="flex flex-wrap gap-2 mb-4 lg:mb-8">
              <span v-for="tag in (activeEntry.tags || ['General', 'Meeting'])" :key="tag" class="px-3 lg:px-4 py-1 lg:py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-black/5 dark:border-white/5 hover:border-[#FD94B4]/30 transition-colors cursor-default">
                #{{ tag }}
              </span>
            </div>
            
            <!-- Custom Audio Player -->
            <div v-if="activeEntry.audio_path" class="w-full h-14 lg:h-16 bg-slate-50 dark:bg-[#0c1210] rounded-[1.25rem] flex items-center px-4 lg:px-6 border border-black/5 dark:border-white/5 shadow-inner">
               <button class="w-9 h-9 lg:w-10 lg:h-10 rounded-2xl bg-[#F34455] flex items-center justify-center text-white hover:bg-[#EC1D3C] transition-all shadow-[0_10px_20px_rgba(243,68,85,0.3)] active:scale-90 shrink-0">
                 <Play class="w-4 h-4 lg:w-5 lg:h-5 ml-0.5" fill="currentColor" />
               </button>
               <div class="flex-1 mx-3 lg:mx-6 flex items-center gap-1 lg:gap-1.5 h-8">
                 <div v-for="i in (isMobile ? 30 : 50)" :key="i" class="flex-1 bg-slate-200 dark:bg-white/10 rounded-full h-full min-w-[2px]" :style="`transform: scaleY(${Math.max(0.15, Math.random())})`"></div>
               </div>
               <div class="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 font-mono shrink-0">
                 00:00 / 02:45
               </div>
            </div>
            <div v-else class="w-full p-4 lg:p-5 bg-slate-50 dark:bg-white/5 rounded-3xl flex items-center gap-3 lg:gap-4 border border-dashed border-black/10 dark:border-white/10">
               <div class="w-9 h-9 lg:w-10 lg:h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <FileText class="w-5 h-5" />
               </div>
               <div class="flex-1 min-w-0">
                 <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-0.5">Note Entry</span>
                 <span class="text-xs lg:text-sm font-bold text-slate-600 dark:text-slate-400 truncate block">Bản ghi chú văn bản không kèm âm thanh</span>
               </div>
            </div>
          </div>
        </div>

        <div class="flex items-center px-3 lg:px-6 py-3 gap-1.5 lg:gap-2 border-b border-black/5 dark:border-white/5 shrink-0 overflow-x-auto no-scrollbar bg-slate-50/30 dark:bg-[#0c1210]/50">
          <button v-for="tab in analysisTabs" :key="tab.id" @click="activeAnalysisTab = tab.id"
            :class="[
              'px-4 lg:px-6 py-2 lg:py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 whitespace-nowrap',
              activeAnalysisTab === tab.id 
                ? 'bg-white dark:bg-[#F34455] text-[#F34455] dark:text-white shadow-xl dark:shadow-[#F34455]/20 border border-[#F34455]/20 dark:border-transparent scale-105' 
                : 'text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'
            ]">
            {{ tab.label }}
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 lg:space-y-8 custom-scrollbar bg-white dark:bg-[#0c1210]">
          <!-- Tab 1: Tóm tắt (Summary + Key Points) -->
          <div v-if="activeAnalysisTab === 'summary'" class="space-y-6 lg:space-y-8 animate-fade-in pb-10">
             <div class="p-5 lg:p-8 rounded-2xl lg:rounded-[2.5rem] bg-slate-50 dark:bg-[#131d1a] border border-black/5 dark:border-white/5 relative overflow-hidden group shadow-sm transition-all hover:shadow-md">
               <div class="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity hidden lg:block">
                  <Sparkles class="w-24 h-24 text-[#FD94B4]" />
               </div>
               <h3 class="font-black text-[10px] uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 mb-4 lg:mb-6 flex items-center gap-3">
                 <div class="w-7 h-7 lg:w-8 lg:h-8 rounded-xl bg-[#F34455]/10 flex items-center justify-center text-[#F34455]">
                   <FileText class="w-4 h-4" />
                 </div>
                 Executive Summary
               </h3>
               <p class="text-slate-600 dark:text-slate-200 leading-relaxed font-bold text-sm lg:text-base">{{ activeEntry.summary || 'Không có bản tóm tắt khả dụng.' }}</p>
               <button class="absolute top-4 lg:top-6 right-4 lg:right-6 p-2 lg:p-2.5 text-slate-300 hover:text-slate-600 dark:hover:text-white bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 transition-all"><Copy class="w-4 h-4" /></button>
             </div>

             <div class="p-5 lg:p-8 rounded-2xl lg:rounded-[2.5rem] bg-slate-50 dark:bg-[#131d1a] border border-black/5 dark:border-white/5 shadow-sm">
               <h3 class="font-black text-[10px] uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 mb-6 lg:mb-8 flex items-center gap-3">
                 <div class="w-7 h-7 lg:w-8 lg:h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                   <Zap class="w-4 h-4" />
                 </div>
                 Key Takeaways
               </h3>
               <div class="space-y-4 lg:space-y-5">
                 <div v-for="(kp, i) in (activeEntry.key_points || ['Nội dung báo cáo chi tiết chưa được trích xuất.'])" :key="i" class="flex items-start gap-3 lg:gap-4 group">
                    <div class="w-6 h-6 lg:w-7 lg:h-7 rounded-lg bg-gradient-to-tr from-[#FD94B4] to-[#F34455] text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 shadow-md shadow-[#F34455]/20 group-hover:scale-110 transition-transform">
                      {{ i + 1 }}
                    </div>
                    <span class="text-slate-600 dark:text-slate-300 font-bold text-sm group-hover:text-slate-900 dark:group-hover:text-white transition-colors leading-relaxed">{{ kp }}</span>
                 </div>
               </div>
             </div>

             <div class="p-5 lg:p-8 rounded-2xl lg:rounded-[2.5rem] bg-slate-50 dark:bg-[#131d1a] border border-black/5 dark:border-white/5 shadow-sm">
                <h3 class="font-black text-[10px] uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 mb-4 lg:mb-6 flex items-center gap-3">
                   <div class="w-7 h-7 lg:w-8 lg:h-8 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                     <BarChart3 class="w-4 h-4" />
                   </div>
                   Strategic Progress
                </h3>
                <div class="flex items-center gap-4 lg:gap-8">
                  <div class="flex-1 h-3 lg:h-4 bg-white dark:bg-[#0c1210] rounded-full overflow-hidden border border-black/5 dark:border-white/5 p-0.5 lg:p-1">
                    <div class="h-full bg-gradient-to-r from-teal-400 via-[#FD94B4] to-[#F34455] rounded-full shadow-[0_0_15px_rgba(243,68,85,0.4)] transition-all duration-1000 ease-out" :style="{ width: (activeEntry.progress || 45) + '%' }"></div>
                  </div>
                  <span class="font-black text-3xl lg:text-4xl italic text-slate-800 dark:text-white tracking-tighter">{{ activeEntry.progress || 45 }}%</span>
                </div>
             </div>
          </div>

          <!-- Tab 2: Nội dung (Transcript) -->
          <div v-else-if="activeAnalysisTab === 'transcript'" class="animate-fade-in space-y-6 pb-20">
            <div class="p-5 lg:p-8 rounded-2xl lg:rounded-[2.5rem] bg-slate-50 dark:bg-[#131d1a] border border-black/5 dark:border-white/5 relative shadow-inner">
               <h3 class="font-black text-[10px] uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 mb-6 lg:mb-8 flex items-center gap-3">
                 <div class="w-7 h-7 lg:w-8 lg:h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                   <Mic class="w-4 h-4" />
                 </div>
                 Full Smart Transcript
               </h3>
               <div class="font-bold text-slate-600 dark:text-slate-300 leading-[2] text-sm whitespace-pre-wrap selection:bg-[#F34455]/20 selection:text-[#F34455]">
                 {{ activeEntry.transcript || 'Không có dữ liệu âm thanh để chuyển đổi.' }}
               </div>
               <div class="mt-6 lg:mt-10 pt-6 lg:pt-8 border-t border-black/5 dark:border-white/5 flex justify-end">
                 <button class="px-5 lg:px-6 py-2.5 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-all border border-black/5 dark:border-white/5 flex items-center gap-2">
                   <Copy class="w-4 h-4" /> Copy Transcript
                 </button>
               </div>
            </div>
          </div>

          <!-- Tab 3: Việc cần làm (Action Items) -->
          <div v-else-if="activeAnalysisTab === 'actions'" class="space-y-6 lg:space-y-8 animate-fade-in pb-20">
             <div class="p-5 lg:p-8 rounded-2xl lg:rounded-[2.5rem] bg-slate-50 dark:bg-[#131d1a] border border-black/5 dark:border-white/5 relative shadow-sm">
                <h3 class="font-black text-[10px] uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 mb-6 lg:mb-8 flex items-center gap-3">
                  <div class="w-7 h-7 lg:w-8 lg:h-8 rounded-xl bg-[#00f2fe]/10 flex items-center justify-center text-[#00f2fe]">
                    <CheckSquare class="w-4 h-4" />
                  </div>
                  Systemized Action Items
                </h3>
                <div class="space-y-3 lg:space-y-4">
                  <div v-if="!activeEntry.action_items?.length" class="py-12 text-center text-slate-400 font-bold italic">Chưa xác định được việc cần làm.</div>
                  <div v-else v-for="(item, i) in activeEntry.action_items" :key="i" 
                       @click="toggleActionItem(i)"
                       class="p-4 lg:p-5 flex gap-4 lg:gap-5 bg-white dark:bg-[#0c1210] rounded-2xl lg:rounded-3xl border border-black/5 dark:border-white/5 hover:border-[#00f2fe]/40 hover:shadow-md transition-all shadow-sm group cursor-pointer active:scale-[0.99] select-none">
                    <div class="w-6 h-6 lg:w-7 lg:h-7 rounded-xl border-2 border-[#00f2fe]/30 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#00f2fe]/10 transition-colors">
                      <Check v-if="(typeof item === 'object' && item.status === 'completed') || (typeof item === 'string' && false)" class="w-4 h-4 text-[#00f2fe]" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p :class="['font-black text-sm mb-2 transition-all tracking-tight', (typeof item === 'object' && item.status === 'completed') ? 'text-slate-400 line-through opacity-70' : 'text-slate-800 dark:text-slate-100']">
                        {{ typeof item === 'string' ? item : item.task }}
                      </p>
                      <div class="flex flex-wrap items-center gap-2 lg:gap-4 text-[9px] uppercase font-black tracking-widest text-slate-400" v-if="typeof item !== 'string'">
                        <span class="flex items-center gap-2 bg-slate-50 dark:bg-white/5 px-3 py-1 rounded-full border border-black/5 dark:border-white/5"><User class="w-3 h-3 text-[#00f2fe]" /> {{ item.owner || 'Global' }}</span>
                        <span v-if="item.deadline" class="flex items-center gap-2 text-[#F34455] bg-rose-500/5 px-3 py-1 rounded-full border border-rose-500/10"><Clock class="w-3 h-3" /> {{ item.deadline }}</span>
                        <span :class="['px-2 py-0.5 rounded-full border text-[8px]', item.priority === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-500' : (item.priority === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500')]">
                          {{ item.priority || 'medium' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
             </div>

             <div class="p-5 lg:p-8 rounded-2xl lg:rounded-[2.5rem] bg-white dark:bg-rose-500/5 border border-rose-500/20 relative shadow-sm">
                <h3 class="font-black text-[10px] uppercase tracking-[0.25em] text-rose-500 mb-6 lg:mb-8 flex items-center gap-3">
                  <div class="w-7 h-7 lg:w-8 lg:h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                    <AlertTriangle class="w-4 h-4" />
                  </div>
                   Critical Risks & Bottlenecks
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                  <div v-if="!activeEntry.risks?.length" class="col-span-full py-8 text-center text-rose-300 italic font-bold">Không phát hiện rủi ro nghiêm trọng.</div>
                  <div v-else v-for="(risk, i) in activeEntry.risks" :key="i" class="p-4 lg:p-5 rounded-2xl bg-white dark:bg-rose-500/10 text-slate-700 dark:text-rose-400 text-sm font-bold border border-rose-500/20 flex items-start gap-3 lg:gap-4 shadow-sm">
                    <div class="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0 animate-pulse"></div>
                    {{ risk }}
                  </div>
                </div>
             </div>
          </div>

          <!-- Tab 4: Mindmap -->
          <div v-else-if="activeAnalysisTab === 'mindmap'" class="animate-fade-in h-[400px] lg:h-[600px] flex flex-col p-2 overflow-hidden bg-slate-50 dark:bg-[#131d1a] rounded-2xl lg:rounded-[3rem] border border-black/5 dark:border-white/5 shadow-inner">
             <MindMap :treeData="activeEntry.mindmap" />
             <div class="mt-auto p-4 lg:p-5 bg-white dark:bg-[#0c1210]/50 rounded-b-2xl lg:rounded-b-[3rem] border-t border-black/5 dark:border-white/5 flex items-center justify-center gap-4 text-[9px] text-slate-400 dark:text-slate-600 font-black uppercase tracking-[0.25em]">
               <Zap class="w-4 h-4 text-[#FD94B4]" />
               <span class="hidden sm:inline">Use Mouse to drag & Scroll to Zoom</span>
               <span class="sm:hidden">Pinch & Drag to navigate</span>
             </div>
          </div>

          <!-- Tab 5: Hỏi AI (Chat) -->
          <div v-else-if="activeAnalysisTab === 'chat'" class="animate-fade-in flex flex-col h-[calc(100vh-22rem)] lg:h-[600px] relative bg-slate-50 dark:bg-[#131d1a] rounded-2xl lg:rounded-[3rem] border border-black/5 dark:border-white/5 overflow-hidden shadow-inner">
             <!-- Welcome State -->
             <div v-if="chatMessages.length === 0" class="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 text-center animate-fade-in">
                <div class="w-16 h-16 lg:w-20 lg:h-20 rounded-[2rem] lg:rounded-[2.5rem] bg-gradient-to-tr from-[#FD94B4]/20 to-[#F34455]/20 border border-[#F34455]/20 flex items-center justify-center mb-6 lg:mb-8 shadow-xl shadow-[#F34455]/5">
                   <MessageSquare class="w-8 h-8 lg:w-10 lg:h-10 text-[#F34455] dark:text-[#FD94B4]" />
                </div>
                <h3 class="text-xl lg:text-2xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">Hỏi AI về cuộc họp</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400 mb-8 lg:mb-10 max-w-sm font-medium leading-relaxed">Em là AI support, em đã nắm rõ nội dung bản ghi này. Anh/Chị muốn biết thêm thông tin gì không ạ?</p>
                
                <div class="flex flex-wrap justify-center gap-2 lg:gap-3 max-w-lg">
                  <button v-for="q in suggestedQuestions" :key="q" @click="handleQuickQuestion(q)"
                          class="px-4 lg:px-6 py-2 lg:py-2.5 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-[#F34455] hover:border-[#F34455]/30 hover:bg-[#F34455]/5 transition-all shadow-sm">
                    {{ q }}
                  </button>
                </div>
             </div>

             <!-- Chat History -->
             <div v-else ref="chatContainerRef" class="flex-1 overflow-y-auto p-4 lg:p-8 space-y-4 lg:space-y-6 custom-scrollbar no-scrollbar scroll-smooth">
                <div v-for="(msg, idx) in chatMessages" :key="idx" 
                     :class="['flex gap-3 lg:gap-4', msg.role === 'user' ? 'flex-row-reverse' : '']">
                   <div :class="['w-8 h-8 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0 shadow-lg', 
                                 msg.role === 'user' ? 'bg-gradient-to-tr from-[#FD94B4] to-[#F34455] text-white' : 'bg-white dark:bg-[#0c1210] border border-black/10 dark:border-white/10 text-[#F34455] dark:text-[#FD94B4]']">
                     <User v-if="msg.role === 'user'" class="w-4 h-4 lg:w-5 lg:h-5" />
                     <Bot v-else class="w-4 h-4 lg:w-5 lg:h-5" />
                   </div>
                   <div :class="['max-w-[85%] lg:max-w-[80%] p-4 lg:p-5 rounded-2xl lg:rounded-[1.75rem] text-sm leading-relaxed whitespace-pre-wrap font-bold shadow-sm', 
                                 msg.role === 'user' ? 'bg-white dark:bg-[#F34455] text-slate-800 dark:text-white rounded-tr-none border border-black/5' : 'bg-white dark:bg-[#0c1210] border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-tl-none leading-[1.8] font-medium']">
                     {{ msg.content }}
                   </div>
                </div>
                
                <!-- Typing Indicator -->
                <div v-if="isChatLoading" class="flex gap-3 lg:gap-4">
                   <div class="w-8 h-8 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl bg-white dark:bg-[#0c1210] border border-black/10 dark:border-white/10 text-[#F34455] dark:text-[#FD94B4] flex items-center justify-center shadow-md">
                     <Bot class="w-4 h-4 lg:w-5 lg:h-5" />
                   </div>
                   <div class="bg-white dark:bg-[#0c1210] border border-black/10 dark:border-white/10 p-4 lg:p-5 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                     <div class="w-2 h-2 bg-[#F34455] rounded-full animate-bounce"></div>
                     <div class="w-2 h-2 bg-[#F34455] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                     <div class="w-2 h-2 bg-[#F34455] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                   </div>
                </div>
             </div>

             <!-- Input Area -->
             <div class="mt-auto p-4 lg:p-6 bg-white dark:bg-[#131d1a] border-t border-black/5 dark:border-white/5 relative z-10">
                <div class="relative flex items-center gap-2 lg:gap-3">
                   <button v-if="chatMessages.length > 0" 
                           @click="clearChatHistory"
                           class="w-12 h-12 lg:w-14 lg:h-14 bg-slate-100 dark:bg-white/5 hover:bg-rose-500/10 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-2xl flex items-center justify-center border border-black/5 dark:border-white/5 transition-all shrink-0 active:scale-95" 
                           title="Xoá lịch sử trò chuyện">
                     <Trash2 class="w-5 h-5 lg:w-6 lg:h-6" />
                   </button>
                   <div class="relative flex-1">
                      <input type="text" v-model="chatInput" @keyup.enter="handleSendMessage"
                             placeholder="Hỏi AI về cuộc họp này..." 
                             class="w-full bg-slate-50 dark:bg-[#0c1210] border border-black/5 dark:border-white/10 rounded-2xl px-4 lg:px-6 py-3.5 lg:py-4.5 text-slate-800 dark:text-white outline-none focus:border-[#F34455]/50 transition-all font-bold pr-12 lg:pr-16 shadow-inner italic text-sm" 
                             :disabled="isChatLoading" />
                      <div class="absolute right-3 top-3 text-[8px] font-black uppercase text-slate-300 dark:text-slate-700 bg-white dark:bg-white/5 px-2 lg:px-2.5 py-1.5 lg:py-2 rounded-xl border border-black/5 dark:border-white/5 pointer-events-none hidden sm:block">ENTER</div>
                   </div>
                   <button @click="handleSendMessage" 
                           :disabled="isChatLoading || !chatInput.trim()"
                           class="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-tr from-[#FD94B4] to-[#F34455] text-white rounded-2xl flex items-center justify-center shadow-[0_10px_20px_rgba(243,68,85,0.3)] hover:shadow-[0_15px_30px_rgba(243,68,85,0.5)] transition-all disabled:opacity-30 active:scale-90 shrink-0">
                     <Send class="w-5 h-5 lg:w-7 lg:h-7" />
                   </button>
                </div>
             </div>
          </div>
        </div>
      </template>
    </div>
    <!-- Rename Voice Modal -->
    <div v-if="showRenameModal" class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
       <div class="glass-card w-full sm:max-w-md bg-white dark:bg-[#131d1a] border-black/10 dark:border-white/10 rounded-t-[2rem] sm:rounded-3xl p-6 sm:p-8 relative shadow-2xl animate-scale-in">
          <h3 class="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-6 flex items-center gap-3">
             <Edit2 class="w-6 h-6 text-[#FD94B4]" /> Đổi tên bản ghi
          </h3>
          <input v-model="newEntryName" @keyup.enter="confirmRenameEntry" type="text"
                 class="w-full bg-slate-50 dark:bg-[#0c1210] border border-black/5 dark:border-white/5 rounded-2xl px-5 py-4 outline-none focus:border-[#F34455]/50 text-slate-800 dark:text-white transition-all font-bold shadow-inner mb-8" />
          <div class="flex gap-3">
             <button @click="showRenameModal = false" class="flex-1 py-4.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs transition-colors">Hủy</button>
             <button @click="confirmRenameEntry" class="flex-1 py-4.5 bg-gradient-to-r from-[#FD94B4] to-[#F34455] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-md hover:shadow-[0_10px_20px_rgba(243,68,85,0.3)] hover:-translate-y-0.5 transition-all active:scale-95">Lưu lại</button>
          </div>
       </div>
    </div>

    <!-- Delete Voice Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
       <div class="glass-card w-full sm:max-w-md bg-white dark:bg-[#131d1a] border-rose-500/20 rounded-t-[2rem] sm:rounded-3xl p-6 sm:p-8 relative shadow-2xl animate-scale-in">
          <h3 class="text-xl sm:text-2xl font-black text-rose-500 tracking-tight mb-4 flex items-center gap-3">
             <AlertTriangle class="w-6 h-6 flex-shrink-0" /> Xóa bản ghi?
          </h3>
          <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8 font-medium">
            Bạn có chắc muốn xóa bản ghi <strong class="text-rose-500 dark:text-rose-400 border-b border-rose-500/30">"{{ entryToDelete?.title }}"</strong>? Hành động này không thể hoàn tác.
          </p>
          <div class="flex gap-3">
             <button @click="showDeleteModal = false" class="flex-1 py-4.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs transition-colors">Hủy</button>
             <button @click="confirmDeleteEntry" class="flex-1 py-4.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-md hover:shadow-[0_10px_20px_rgba(244,63,94,0.3)] hover:-translate-y-0.5 transition-all active:scale-95">Xóa ngay</button>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { Music, Mic, CheckCircle2, Play, Sparkles, ListTodo, User, Clock, AlertTriangle, MoreVertical, Trash2, Edit2, FileText, Zap, BarChart3, Copy, CheckSquare, Check, Network, Send, MessageSquare, Bot, ArrowLeft } from 'lucide-vue-next';
import MindMap from '../components/voice/MindMap.vue';
import api from '../lib/axios';
import { chatWithAI } from '../lib/gemini';
import { useNotificationStore } from '../stores/notificationStore';
import { useConfigStore } from '../stores/configStore';

const route = useRoute();
const notificationStore = useNotificationStore();
const configStore = useConfigStore();
const week = ref(null);
const loading = ref(true);
const activeEntry = ref(null);

// Mobile responsive state
const isMobile = ref(false);
const showDetail = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024;
};

const selectEntry = (entry) => {
  activeEntry.value = entry;
  if (isMobile.value) {
    showDetail.value = true;
  }
};

const goBackToList = () => {
  showDetail.value = false;
};

const analysisTabs = [
  { id: 'summary', label: 'Tóm tắt' },
  { id: 'transcript', label: 'Nội dung' },
  { id: 'actions', label: 'Việc cần làm' },
  { id: 'mindmap', label: 'MindMap' },
  { id: 'chat', label: 'Hỏi AI' }
];
const activeAnalysisTab = ref('summary');

// AI Chat States
const chatMessages = ref([]);
const chatInput = ref('');
const isChatLoading = ref(false);
const chatContainerRef = ref(null);
const suggestedQuestions = [
  "Tóm tắt ngắn gọn cuộc họp?",
  "Ai phụ trách việc gì?",
  "Deadline quan trọng nhất?",
  "Có quyết định nào chưa rõ ràng?"
];

const saveChatHistory = () => {
  if (activeEntry.value && activeEntry.value.id) {
    localStorage.setItem(`voice_chat_${activeEntry.value.id}`, JSON.stringify(chatMessages.value));
  }
};

const clearChatHistory = () => {
  if (activeEntry.value && activeEntry.value.id) {
    localStorage.removeItem(`voice_chat_${activeEntry.value.id}`);
    chatMessages.value = [];
    notificationStore.addNotification('Đã xoá lịch sử trò chuyện.');
  }
};

const handleSendMessage = async () => {
  if (!chatInput.value.trim() || isChatLoading.value || !activeEntry.value) return;
  
  const userMsg = chatInput.value.trim();
  chatInput.value = '';
  chatMessages.value.push({ role: 'user', content: userMsg });
  saveChatHistory();
  
  isChatLoading.value = true;
  scrollToBottom();

  try {
    const apiKey = configStore.getActiveKey();
    const model = configStore.activeModel;
    
    if (!apiKey) throw new Error('Hệ thống chưa được cấu hình API Key. Vui lòng liên hệ Admin.');
    
    // Extract text context for AI
    const context = `Tiêu đề: ${activeEntry.value.title}\nTóm tắt: ${activeEntry.value.summary}\nNội dung chính: ${activeEntry.value.transcript}`;
    
    // Build context history format: [{role: "user"|"model", parts: [{text: "..."}]}]
    const history = chatMessages.value.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    
    const response = await chatWithAI(userMsg, context, history, apiKey, model);
    chatMessages.value.push({ role: 'assistant', content: response });
    saveChatHistory();
    scrollToBottom();
  } catch (err) {
    chatMessages.value.push({ role: 'assistant', content: 'Xin lỗi, em gặp lỗi khi kết nối với AI: ' + err.message });
    saveChatHistory();
  } finally {
    isChatLoading.value = false;
  }
};

const handleQuickQuestion = (q) => {
  chatInput.value = q;
  handleSendMessage();
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainerRef.value) {
      chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight;
    }
  });
};

watch(activeEntry, (newVal) => {
  chatInput.value = '';
  if (newVal && newVal.id) {
    const saved = localStorage.getItem(`voice_chat_${newVal.id}`);
    chatMessages.value = saved ? JSON.parse(saved) : [];
    scrollToBottom();
  } else {
    chatMessages.value = [];
  }
}, { immediate: true });

onMounted(async () => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  window.addEventListener('click', handleOutsideClick);
  try {
    const response = await api.get(`/weekly-voices/${route.params.weekId}`);
    week.value = response.data;
    if (week.value.voice_entries?.length > 0) {
      activeEntry.value = week.value.voice_entries[0];
      // Don't show detail automatically on mobile
      if (!isMobile.value) {
        showDetail.value = true;
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
  window.removeEventListener('click', handleOutsideClick);
});

const activeMenuId = ref(null);
const handleOutsideClick = (e) => {
  if (activeMenuId.value && !e.target.closest('.group')) {
    activeMenuId.value = null;
  }
};
const toggleMenu = (id) => {
  activeMenuId.value = activeMenuId.value === id ? null : id;
};

const showRenameModal = ref(false);
const showDeleteModal = ref(false);
const entryToRename = ref(null);
const entryToDelete = ref(null);
const newEntryName = ref('');

const openRenameModal = (entry) => {
  entryToRename.value = entry;
  newEntryName.value = entry.title;
  showRenameModal.value = true;
  activeMenuId.value = null;
};

const confirmRenameEntry = async () => {
  if (!newEntryName.value.trim() || newEntryName.value === entryToRename.value.title) {
    showRenameModal.value = false;
    return;
  }
  try {
    await api.put(`/voices/${entryToRename.value.id}`, { title: newEntryName.value.trim() });
    entryToRename.value.title = newEntryName.value.trim();
    notificationStore.addNotification('Đổi tên thành công!');
    showRenameModal.value = false;
  } catch (err) {
    notificationStore.addNotification('Lỗi khi đổi tên', 'error');
  }
};

const openDeleteModal = (entry) => {
  entryToDelete.value = entry;
  showDeleteModal.value = true;
  activeMenuId.value = null;
};

const confirmDeleteEntry = async () => {
  try {
    await api.delete(`/voices/${entryToDelete.value.id}`);
    week.value.voice_entries = week.value.voice_entries.filter(e => e.id !== entryToDelete.value.id);
    if (activeEntry.value?.id === entryToDelete.value.id) {
      activeEntry.value = week.value.voice_entries[0] || null;
      if (!activeEntry.value) showDetail.value = false;
    }
    notificationStore.addNotification('Xóa bản ghi thành công!');
    showDeleteModal.value = false;
  } catch (err) {
    notificationStore.addNotification('Lỗi khi xóa bản ghi', 'error');
  }
};
const toggleActionItem = async (index) => {
  if (!activeEntry.value || !activeEntry.value.action_items) return;

  const items = [...activeEntry.value.action_items];
  const item = items[index];

  // Convert string item to object if necessary
  if (typeof item === 'string') {
    items[index] = {
      task: item,
      priority: 'medium',
      owner: 'Global',
      deadline: '',
      status: 'completed'
    };
  } else {
    items[index] = {
      ...item,
      status: item.status === 'completed' ? 'pending' : 'completed'
    };
  }

  // Calculate new progress percentage: (completed items / total items) * 100
  const total = items.length;
  const completed = items.filter(x => x.status === 'completed').length;
  const newProgress = total > 0 ? Math.round((completed / total) * 100) : activeEntry.value.progress;

  // Optimistic UI updates
  activeEntry.value.action_items = items;
  activeEntry.value.progress = newProgress;

  try {
    // Save to server
    await api.put(`/voices/${activeEntry.value.id}`, {
      action_items: items,
      progress: newProgress
    });
    notificationStore.addNotification('Đã cập nhật tiến độ công việc!');
  } catch (err) {
    console.error('Failed to update action item status:', err);
    notificationStore.addNotification('Không thể lưu tiến độ công việc', 'error');
  }
};
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
