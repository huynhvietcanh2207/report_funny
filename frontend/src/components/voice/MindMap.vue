<template>
  <div class="relative w-full h-full bg-[#0c1210] rounded-3xl overflow-hidden border border-white/5 box-border">
    <!-- SVG for Markmap -->
    <svg ref="svgRef" class="w-full h-full"></svg>
    
    <!-- Loading overlay if data is missing -->
    <div v-if="!treeData" class="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-10">
       <div class="flex flex-col items-center gap-4">
         <div class="w-10 h-10 border-4 border-[#FD94B4] border-t-transparent rounded-full animate-spin"></div>
         <p class="text-slate-400 text-xs font-bold uppercase tracking-widest">Đang tải sơ đồ...</p>
       </div>
    </div>

    <!-- Markmap Controls (Custom styled) -->
    <div class="absolute bottom-6 left-6 p-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-2 z-20">
       <button @click="handleZoomIn" class="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all">
         <Plus class="w-4 h-4" />
       </button>
       <button @click="handleZoomOut" class="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all">
         <Minus class="w-4 h-4" />
       </button>
       <button @click="handleFit" class="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all">
         <Maximize class="w-4 h-4" />
       </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { Plus, Minus, Maximize } from 'lucide-vue-next';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';

const props = defineProps({
  treeData: {
    type: Object,
    default: null
  }
});

const svgRef = ref(null);
const mm = ref(null);
const transformer = new Transformer();

/**
 * Chuyển đổi cấu trúc JSON (center/branches) sang Markdown theo yêu cầu
 */
function buildMarkdown(data) {
  if (!data) return '# Chưa có dữ liệu';
  
  // Hỗ trợ cả cấu trúc cũ (label/children) nếu cần, nhưng ưu tiên center/branches
  const center = data.center || data.label || 'Chủ đề chính';
  const branches = data.branches || data.children || [];
  
  let md = `# ${center}\n\n`;
  
  branches.forEach(branch => {
    const label = branch.label || (typeof branch === 'string' ? branch : 'Nhánh');
    md += `## ${label}\n\n`;
    
    if (branch.children && Array.isArray(branch.children)) {
      branch.children.forEach(child => {
        const childLabel = typeof child === 'string' ? child : (child.label || '');
        if (childLabel) md += `- ${childLabel}\n`;
      });
    }
    md += '\n';
  });
  
  return md;
}

const renderMarkmap = async () => {
  if (!svgRef.value || !props.treeData) return;

  await nextTick();
  
  const markdown = buildMarkdown(props.treeData);
  const { root } = transformer.transform(markdown);
  
  if (!mm.value) {
    mm.value = Markmap.create(svgRef.value, {
      autoFit: true,
      duration: 500,
      nodeMinHeight: 16,
      spacingHorizontal: 80,
      spacingVertical: 10,
      paddingX: 16,
      // Custom styling via options if needed
    }, root);
  } else {
    mm.value.setData(root);
    mm.value.fit();
  }
};

const handleZoomIn = () => mm.value?.rescale(1.25);
const handleZoomOut = () => mm.value?.rescale(0.8);
const handleFit = () => mm.value?.fit();

watch(() => props.treeData, () => {
  renderMarkmap();
}, { deep: true });

onMounted(() => {
  renderMarkmap();
  
  // Handle resize
  window.addEventListener('resize', () => {
    mm.value?.fit();
  });
});

</script>

<style>
/* Style cho Markmap để khớp với giao diện tối của app */
.markmap {
  font-family: inherit;
}

.markmap-node {
  cursor: pointer;
}

.markmap-node text {
  fill: #e2e8f0 !important; /* text-slate-200 */
  font-weight: 500;
  font-size: 14px;
}

.markmap-node-circle {
  fill: #131d1a !important;
  stroke: #FD94B4 !important;
  stroke-width: 2px;
}

.markmap-link {
  fill: none;
  stroke: rgba(253, 148, 180, 0.4) !important;
  stroke-width: 2px;
}

/* Cấp 0 (Center) */
.markmap-node[data-depth="0"] text {
  font-size: 18px;
  font-weight: 900;
  fill: #ffffff !important;
}

.markmap-node[data-depth="0"] .markmap-node-circle {
  stroke: #F34455 !important;
  stroke-width: 3px;
}

/* Cấp 1 (Branches) */
.markmap-node[data-depth="1"] text {
  fill: #FD94B4 !important;
  font-weight: 700;
}
</style>
