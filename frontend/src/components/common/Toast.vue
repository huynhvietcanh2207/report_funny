<template>
  <div class="fixed top-4 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:top-auto sm:bottom-6 sm:right-6 z-[100] flex flex-col gap-3 pointer-events-none w-[calc(100%-2rem)] sm:w-auto max-w-md">
    <transition-group name="notification">
      <div v-for="notification in store.notifications" :key="notification.id"
           class="pointer-events-auto w-full sm:min-w-[280px] sm:max-w-md p-4 rounded-2xl bg-[#131d1a]/90 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center gap-4 relative group overflow-hidden">
        
        <!-- Progress bar background -->
        <div class="absolute bottom-0 left-0 h-0.5 bg-[#FD94B4]/20 w-full"></div>
        <!-- Progress bar timer animation -->
        <div class="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#FD94B4] to-[#F34455] w-full origin-left animate-progress" :style="`animation-duration: ${notification.duration}ms`"></div>
        
        <div :class="[
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg',
          notification.type === 'success' ? 'bg-[#FD94B4]/10 text-[#FD94B4]' : 'bg-rose-500/10 text-rose-400'
        ]">
          <CheckCircle2 v-if="notification.type === 'success'" class="w-6 h-6" />
          <AlertCircle v-else class="w-6 h-6" />
        </div>
        
        <div class="flex-1 pr-4">
          <p class="text-sm font-bold text-white mb-0.5">
            {{ notification.type === 'success' ? 'Thành công' : 'Lỗi' }}
          </p>
          <p class="text-xs text-slate-400 font-medium leading-relaxed">
            {{ notification.message }}
          </p>
        </div>
        
        <button @click="store.removeNotification(notification.id)" class="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors">
          <X class="w-4 h-4" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { CheckCircle2, AlertCircle, X } from 'lucide-vue-next';
import { useNotificationStore } from '../../stores/notificationStore';

const store = useNotificationStore();
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
}

.notification-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.notification-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

@media (min-width: 640px) {
  .notification-enter-from {
    opacity: 0;
    transform: translateX(30px) scale(0.9);
  }
  .notification-leave-to {
    opacity: 0;
    transform: translateX(30px) translateY(-10px) scale(0.9);
  }
}

@keyframes progress {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

.animate-progress {
  animation: progress linear forwards;
}
</style>
