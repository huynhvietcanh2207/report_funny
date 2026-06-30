<template>
  <div class="relative w-full h-full bg-slate-50 dark:bg-[#0c1210] rounded-3xl overflow-hidden border border-slate-200/50 dark:border-white/5 box-border">
    <!-- SVG for Markmap -->
    <svg ref="svgRef" class="w-full h-full"></svg>
    
    <!-- Loading overlay if data is missing -->
    <div v-if="!treeData" class="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-black/20 backdrop-blur-sm z-10">
       <div class="flex flex-col items-center gap-4">
         <div class="w-10 h-10 border-4 border-[#F34455] dark:border-[#FD94B4] border-t-transparent rounded-full animate-spin"></div>
         <p class="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Đang tải sơ đồ...</p>
       </div>
    </div>

    <!-- Markmap Controls (Custom styled) -->
    <div class="absolute bottom-6 left-6 p-2 bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 flex items-center gap-2 z-20 shadow-md dark:shadow-none">
       <button @click="handleZoomIn" class="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all" title="Phóng to">
         <Plus class="w-4 h-4" />
       </button>
       <button @click="handleZoomOut" class="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all" title="Thu nhỏ">
         <Minus class="w-4 h-4" />
       </button>
       <button @click="handleFit" class="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all" title="Căn chỉnh">
         <Maximize class="w-4 h-4" />
       </button>
       <div class="w-[1px] h-4 bg-slate-200 dark:bg-white/10 mx-1"></div>
       <button @click="handleDownloadSVG" class="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-slate-500 dark:text-slate-400 hover:text-[#F34455] dark:hover:text-[#FD94B4] transition-all" title="Tải xuống sơ đồ (SVG)">
         <Download class="w-4 h-4" />
       </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { Plus, Minus, Maximize, Download } from 'lucide-vue-next';
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

const handleDownloadSVG = () => {
  if (!svgRef.value) return;
  try {
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgRef.value);

    if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/)) {
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    source = '<?xml version="1.0" encoding="utf-8"?>\n' + source;

    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `${props.treeData?.center || props.treeData?.label || 'mindmap'}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  } catch (err) {
    console.error('Lỗi khi tải xuống sơ đồ:', err);
    alert('Không thể tải xuống sơ đồ tư duy này.');
  }
};

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
/* Style cho Markmap linh hoạt cho cả light/dark theme */
.markmap {
  font-family: inherit;
}

.markmap-node {
  cursor: pointer;
}

/* MẶC ĐỊNH (LIGHT MODE) */
.markmap-node text {
  fill: #1e293b !important; /* text-slate-800 */
  font-weight: 600;
  font-size: 14px;
}

.markmap-node-circle {
  fill: #ffffff !important;
  stroke: #F34455 !important;
  stroke-width: 2px;
}

.markmap-link {
  fill: none;
  stroke: rgba(243, 68, 85, 0.3) !important;
  stroke-width: 2px;
}

/* Cấp 0 (Center) - Light Mode */
.markmap-node[data-depth="0"] text {
  font-size: 18px;
  font-weight: 900;
  fill: #0f172a !important; /* slate-900 */
}

.markmap-node[data-depth="0"] .markmap-node-circle {
  stroke: #b91c1c !important; /* red-700 */
  stroke-width: 3px;
}

/* Cấp 1 (Branches) - Light Mode */
.markmap-node[data-depth="1"] text {
  fill: #b91c1c !important; /* red-700 */
  font-weight: 700;
}

/* DARK MODE OVERRIDES */
.dark .markmap-node text {
  fill: #e2e8f0 !important; /* text-slate-200 */
}

.dark .markmap-node-circle {
  fill: #131d1a !important;
  stroke: #FD94B4 !important;
}

.dark .markmap-link {
  stroke: rgba(253, 148, 180, 0.4) !important;
}

.dark .markmap-node[data-depth="0"] text {
  fill: #ffffff !important;
}

.dark .markmap-node[data-depth="0"] .markmap-node-circle {
  stroke: #F34455 !important;
}

.dark .markmap-node[data-depth="1"] text {
  fill: #FD94B4 !important;
}
</style>
