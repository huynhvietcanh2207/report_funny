<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0c1210]/60 backdrop-blur-sm" @click="close">
    <div @click.stop class="w-full sm:max-w-xl bg-[#0c1210] border border-[#FD94B4]/20 sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden transition-all animate-slide-up relative flex flex-col">
      <div class="absolute -top-10 -right-10 w-32 h-32 bg-[#F34455]/10 rounded-full blur-3xl"></div>
      
      <!-- Modal Header -->
      <div class="p-6 border-b border-white/5 relative z-10 flex items-center justify-between">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <Mic v-if="activeTab === 'mic'" class="text-[#FD94B4] w-5 h-5" />
          <Upload v-if="activeTab === 'upload'" class="text-[#FD94B4] w-5 h-5" />
          <FileText v-if="activeTab === 'note'" class="text-[#FD94B4] w-5 h-5" />
          {{ modalTitle }}
        </h3>
        <button @click="close" class="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Tab Navigation -->
      <div v-if="!isUploading" class="flex p-1 bg-white/5 mx-6 mt-4 rounded-xl relative z-10">
        <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
          :class="[
            'flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all',
            activeTab === tab.id ? 'bg-[#F34455] text-white shadow-lg' : 'text-slate-400 hover:text-white'
          ]">
          <component :is="tab.icon" class="w-3.5 h-3.5" />
          {{ tab.label }}
        </button>
      </div>

      <div class="p-6 relative z-10 flex-1 overflow-y-auto max-h-[70vh]">
        <!-- Analysis/Saving State -->
        <div v-if="isUploading" class="flex flex-col items-center justify-center py-10">
          <div class="relative w-20 h-20 mb-6 flex items-center justify-center">
            <div class="absolute inset-0 rounded-full border-4 border-[#0c1210]"></div>
            <div class="absolute inset-0 rounded-full border-4 border-t-[#F34455] border-r-[#FD94B4] border-b-[#FFDAE9] border-l-transparent animate-spin"></div>
            <div class="absolute inset-0 flex items-center justify-center bg-[#131d1a] rounded-full scale-90 shadow-[0_0_15px_rgba(253,148,180,0.3)]">
              <Sparkles class="w-8 h-8 text-[#FD94B4] animate-pulse" />
            </div>
          </div>
          
          <h4 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FD94B4] to-[#F34455] mb-2">
            {{ activeTab === 'note' ? 'Đang lưu ghi chú...' : 'Đang phân tích dữ liệu' }}
          </h4>
          
          <div v-if="activeTab !== 'note'" class="flex flex-col gap-2 w-full max-w-sm mt-4">
            <div v-for="(step, idx) in currentSteps" :key="idx" class="flex items-center gap-3 text-sm">
              <div :class="[
                'w-5 h-5 rounded-full flex items-center justify-center text-xs transition-colors duration-500',
                currentStep > idx ? 'bg-emerald-500 text-white' : (currentStep === idx ? 'bg-[#FD94B4] text-white animate-pulse' : 'bg-white/10 text-slate-400')
              ]">
                <Check v-if="currentStep > idx" class="w-3 h-3" />
                <span v-else>{{ idx + 1 }}</span>
              </div>
              <span :class="currentStep >= idx ? 'text-slate-200 font-medium' : 'text-slate-400'">{{ step }}</span>
            </div>
          </div>
        </div>

        <!-- Tab Content: Microphone -->
        <div v-else-if="activeTab === 'mic'" class="flex flex-col items-center">
          <div class="w-full h-32 mb-8 bg-[#131d1a] rounded-2xl flex items-center justify-center overflow-hidden border border-[#FD94B4]/10 relative">
             <canvas ref="canvasRef" class="w-full h-full"></canvas>
             <div v-if="!isRecording" class="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-medium">
               Nhấn vào nút bên dưới để bắt đầu
             </div>
          </div>
          
          <div class="text-3xl font-mono tracking-wider font-bold text-white mb-8">
            {{ formattedTime }}
          </div>

          <div class="flex items-center gap-6 w-full px-8 justify-center">
            <button v-if="isRecording" @click="stopRecording" class="w-14 h-14 flex items-center justify-center rounded-full bg-white/10 text-slate-200 hover:bg-white/20 transition-all">
              <Square class="w-5 h-5" fill="currentColor" />
            </button>
            <div class="relative">
              <div v-if="isRecording" class="absolute -inset-2 rounded-full bg-rose-500/30 animate-ping"></div>
              <button @click="toggleRecording" :class="[
                'w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 relative z-10',
                isRecording ? 'bg-gradient-to-tr from-rose-500 to-red-600' : 'bg-gradient-to-tr from-[#FD94B4] to-[#F34455]'
              ]">
                <Mic v-if="!isRecording" class="w-8 h-8 text-white" />
                <Pause v-else class="w-8 h-8 text-white" fill="currentColor" />
              </button>
            </div>
            <button v-if="isRecording" @click="submitRecording" class="w-14 h-14 flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all">
              <Check class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Tab Content: Upload -->
        <div v-else-if="activeTab === 'upload'" class="space-y-6">
          <div @click="$refs.fileInput.click()" 
               class="w-full aspect-video bg-[#131d1a] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-[#FD94B4]/50 transition-all">
            <div v-if="!selectedFile" class="flex flex-col items-center text-center p-6">
              <div class="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-[#FD94B4] transition-colors mb-4">
                <Upload class="w-8 h-8" />
              </div>
              <p class="text-white font-bold mb-1">Chọn hoặc kéo tệp âm thanh</p>
              <p class="text-xs text-slate-500">Hỗ trợ MP3, WAV, M4A, WEBM lên đến 100MB</p>
            </div>
            <div v-else class="flex flex-col items-center text-center p-6">
              <div class="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
                <Music class="w-8 h-8" />
              </div>
              <p class="text-white font-bold mb-1 truncate max-w-[200px]">{{ selectedFile.name }}</p>
              <p class="text-xs text-slate-500">{{ (selectedFile.size / (1024 * 1024)).toFixed(2) }} MB</p>
            </div>
            <input type="file" ref="fileInput" class="hidden" accept="audio/*" @change="handleFileChange" />
          </div>

          <button v-if="selectedFile" @click="submitFileUpload" 
                  class="w-full py-4 bg-gradient-to-r from-[#FD94B4] to-[#F34455] text-white rounded-2xl font-black shadow-xl hover:shadow-[0_0_20px_rgba(243,68,85,0.4)] transition-all">
            PHÂN TÍCH FILE NÀY
          </button>
        </div>

        <!-- Tab Content: Note -->
        <div v-else-if="activeTab === 'note'" class="space-y-4">
          <div class="space-y-2">
            <label class="text-xs font-black uppercase tracking-widest text-slate-500">Nội dung ghi chú</label>
            <textarea v-model="noteContent" rows="8" 
                      class="w-full bg-[#131d1a] border border-white/10 rounded-2xl p-4 text-white placeholder-slate-600 outline-none focus:border-[#FD94B4]/50 transition-all resize-none font-medium"
                      placeholder="Nhập nội dung ghi chú công việc tại đây..."></textarea>
          </div>

          <div class="bg-teal-500/5 border border-teal-500/10 p-4 rounded-2xl flex gap-3">
             <div class="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                <FileText class="w-5 h-5" />
             </div>
             <div>
                <p class="text-sm font-bold text-teal-100">Ghi chú văn bản</p>
                <p class="text-xs text-teal-300 opacity-80 leading-relaxed">Nội dung này sẽ được lưu trực tiếp vào dự án.</p>
             </div>
          </div>

          <button @click="submitNote" 
                  class="w-full py-4 bg-gradient-to-r from-[#FD94B4] to-[#F34455] text-white rounded-2xl font-black shadow-xl hover:shadow-[0_0_20px_rgba(243,68,85,0.4)] transition-all disabled:opacity-50"
                  :disabled="!noteContent.trim()">
            LƯU GHI CHÚ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { Mic, X, Square, Pause, Check, Upload, FileText, Music, Sparkles, Zap } from 'lucide-vue-next'
import api from '../../lib/axios'
import { analyzeMeeting, getMimeType } from '../../lib/gemini'
import { useConfigStore } from '../../stores/configStore'

const configStore = useConfigStore()

const props = defineProps({
  projectId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['success'])

const isOpen = ref(false)
const activeTab = ref('mic')
const isRecording = ref(false)
const isUploading = ref(false)
const time = ref(0)
const canvasRef = ref(null)
const selectedFile = ref(null)
const fileInput = ref(null)
const noteContent = ref('')

const tabs = [
  { id: 'mic', label: 'Ghi âm', icon: Mic },
  { id: 'upload', label: 'Tải file', icon: Upload },
  { id: 'note', label: 'Ghi chú', icon: FileText }
]

const modalTitle = computed(() => {
  if (activeTab.value === 'mic') return 'Ghi âm báo cáo mới'
  if (activeTab.value === 'upload') return 'Tải tệp ghi âm lên'
  return 'Thêm ghi chú công việc'
})

const audioSteps = [
  'Đang khởi tạo AI...',
  'Đang xử lý dữ liệu âm thanh...',
  'Đang phân tích nội dung...',
  'Hoàn tất dữ liệu & Trích xuất'
]

const currentSteps = computed(() => audioSteps)
const currentStep = ref(0)

let mediaRecorder = null
let audioChunks = []
let audioContext = null
let analyser = null
let dataArray = null
let animationId = null
let timerInterval = null

const formattedTime = computed(() => {
  const mins = Math.floor(time.value / 60)
  const secs = time.value % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})

const open = () => {
  isOpen.value = true
  activeTab.value = 'mic'
  selectedFile.value = null
  noteContent.value = ''
}

const close = () => {
  if (isRecording.value) stopRecording()
  isOpen.value = false
}

const toggleRecording = async () => {
  if (isRecording.value) stopRecording()
  else await startRecording()
}

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaStreamSource(stream)
    source.connect(analyser)
    analyser.fftSize = 256
    dataArray = new Uint8Array(analyser.frequencyBinCount)
    mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data)
    mediaRecorder.start(100)
    isRecording.value = true
    time.value = 0
    timerInterval = setInterval(() => time.value++, 1000)
    drawWaveform()
  } catch (err) {
    alert("Vui lòng cấp quyền Microphone để ghi âm.")
  }
}

const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
    mediaRecorder.stream.getTracks().forEach(track => track.stop())
  }
  isRecording.value = false
  clearInterval(timerInterval)
  cancelAnimationFrame(animationId)
  if (audioContext && audioContext.state !== 'closed') audioContext.close()
}


const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    const mime = getMimeType(file)
    if (mime.startsWith('audio/') || mime === 'audio/mp4') {
        selectedFile.value = file
    } else {
        alert('Hệ thống chỉ hỗ trợ các tệp âm thanh (MP3, WAV, M4A...).')
    }
  }
}

const getApiConfig = () => {
  return {
    apiKey: configStore.getActiveKey(),
    modelName: configStore.activeModel || 'gemini-2.5-flash'
  }
}

const submitRecording = async () => {
  await sharedSubmitAudio(new Blob(audioChunks, { type: 'audio/webm' }), 'microphone')
}

const submitFileUpload = async () => {
  if (!selectedFile.value) return
  await sharedSubmitAudio(selectedFile.value, 'upload')
}

const sharedSubmitAudio = async (blob, source) => {
  stopRecording()
  isUploading.value = true
  currentStep.value = 0
  
  try {
    const { apiKey, modelName } = getApiConfig()
    if (!apiKey) throw new Error('Vui lòng cấu hình API Key trong Settings.')

    const aiResult = await analyzeMeeting(blob, apiKey, modelName, (progress) => {
      if (progress < 30) currentStep.value = 0
      else if (progress < 60) currentStep.value = 1
      else if (progress < 90) currentStep.value = 2
      else currentStep.value = 3
    })

    const formData = new FormData()
    const mimeType = getMimeType(blob)
    
    // Đảm bảo gửi kèm Project ID và Source
    formData.append('audio', blob, blob.name || `voice_${Date.now()}.webm`)
    formData.append('project_id', Number(props.projectId))
    formData.append('source', source)
    formData.append('ai_result', JSON.stringify(aiResult))

    // Log check
    console.log('Sending data:', {
        projectId: props.projectId,
        source: source,
        mimeType: mimeType
    })

    const response = await api.post('/voices', formData)
    
    currentStep.value = 4
    setTimeout(() => {
      emit('success', response.data)
      isUploading.value = false
      close()
    }, 1000)
  } catch (err) {
    console.error('Upload error detail:', err.response?.data || err.message)
    alert('Lỗi: ' + (err.response?.data?.message || err.message || 'Lỗi không xác định'))
    isUploading.value = false
  }
}

const submitNote = async () => {
  if (!noteContent.value.trim()) return
  isUploading.value = true

  try {
    const formData = new FormData()
    formData.append('project_id', Number(props.projectId))
    formData.append('source', 'manual')
    formData.append('transcript', noteContent.value)
    formData.append('title', 'Ghi chú: ' + noteContent.value.substring(0, 30) + '...')

    const response = await api.post('/voices', formData)
    
    setTimeout(() => {
      emit('success', response.data)
      isUploading.value = false
      close()
    }, 500)
  } catch (err) {
    console.error('Note error detail:', err.response?.data || err.message)
    alert('Lỗi khi lưu ghi chú: ' + (err.response?.data?.message || err.message || 'Lỗi không xác định'))
    isUploading.value = false
  }
}

const drawWaveform = () => {
  if (!canvasRef.value || !isRecording.value) return
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  const width = canvas.width = canvas.offsetWidth
  const height = canvas.height = canvas.offsetHeight
  animationId = requestAnimationFrame(drawWaveform)
  analyser.getByteFrequencyData(dataArray)
  ctx.clearRect(0, 0, width, height)
  const gradient = ctx.createLinearGradient(0, height, 0, 0)
  gradient.addColorStop(0, '#F34455')
  gradient.addColorStop(1, '#FD94B4')
  ctx.fillStyle = gradient
  const barWidth = 4
  const gap = 2
  const bars = Math.floor(width / (barWidth + gap))
  const step = Math.floor(dataArray.length / bars) || 1
  for (let i = 0; i < bars; i++) {
    const value = dataArray[i * step] || 0
    let barHeight = height * (value / 255) * 0.8
    ctx.beginPath()
    ctx.roundRect(i * (barWidth + gap), height / 2 - barHeight / 2, barWidth, Math.max(2, barHeight), 4)
    ctx.fill()
  }
}

onUnmounted(() => stopRecording())
defineExpose({ open, close })
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
