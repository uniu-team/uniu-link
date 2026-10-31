<template>
  <div ref="containerRef" class="echart-host" :style="{ height: resolvedHeight }" />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DataZoomComponent,
} from 'echarts/components'
import type { EChartsOption } from 'echarts'

echarts.use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DataZoomComponent,
])

const props = withDefaults(
  defineProps<{
    option: EChartsOption
    height?: number | string
  }>(),
  { height: 280 }
)

const containerRef = ref<HTMLElement | null>(null)
const chartInstance = shallowRef<echarts.ECharts | null>(null)
let resizeObserver: ResizeObserver | null = null

const resolvedHeight = computed(() =>
  typeof props.height === 'number' ? `${props.height}px` : props.height
)

function renderChart() {
  if (!containerRef.value) return
  if (!chartInstance.value) {
    chartInstance.value = echarts.init(containerRef.value)
  }
  chartInstance.value.setOption(props.option, { notMerge: true, lazyUpdate: false })
}

onMounted(() => {
  renderChart()
  if (typeof ResizeObserver !== 'undefined' && containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      chartInstance.value?.resize()
    })
    resizeObserver.observe(containerRef.value)
  }
})

watch(
  () => props.option,
  () => {
    renderChart()
  },
  { deep: true }
)

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  chartInstance.value?.dispose()
  chartInstance.value = null
})
</script>

<style scoped>
.echart-host {
  width: 100%;
  min-width: 0;
}
</style>
