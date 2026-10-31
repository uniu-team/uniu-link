<template>
  <div class="dashboard-redesign">
    <!-- 顶部总览横幅 (Command Banner) -->
    <v-card class="dash-hero" elevation="1">
      <div class="dash-hero-top">
        <div class="dash-hero-title-group">
          <div class="dash-hero-heading">
            <h1>仪表盘</h1>
            <v-chip
              size="small"
              :color="
                (kpi.today_error_rate || 0) > 5
                  ? 'error'
                  : channelPool.healthy > 0
                    ? 'success'
                    : 'primary'
              "
              variant="tonal"
              label
            >
              {{
                (kpi.today_error_rate || 0) > 5
                  ? '异常率偏高'
                  : channelPool.total > 0
                    ? `在线渠道 ${channelPool.healthy}/${channelPool.total}`
                    : '网关就绪'
              }}
            </v-chip>
          </div>
          <p class="dash-hero-subtitle">
            查看网关运行状况、请求趋势和资源用量。
          </p>
        </div>

        <div class="dash-hero-controls">
          <div class="dash-segmented" role="group" aria-label="时间粒度切换">
            <button
              type="button"
              class="dash-segment-btn"
              :class="{ 'dash-segment-btn--active': chartGranularity === 'hourly' }"
              @click="setGranularity('hourly')"
            >
              按小时 (24h)
            </button>
            <button
              type="button"
              class="dash-segment-btn"
              :class="{ 'dash-segment-btn--active': chartGranularity === 'daily' }"
              @click="setGranularity('daily')"
            >
              按天 (7d)
            </button>
          </div>
          <UiButton :loading="loading" variant="primary" @click="load">
            <NavIcon name="refresh" />刷新
          </UiButton>
        </div>
      </div>

      <v-divider class="my-4" />

      <!-- 嵌入式核心指标矩阵 -->
      <div class="dash-metric-strip">
        <div class="dash-metric-cell">
          <div class="dash-metric-head">
            <span class="dash-metric-label">今日请求数</span>
            <span
              v-if="kpi.requests_growth !== undefined && kpi.requests_growth !== null"
              class="dash-trend-pill"
              :class="kpi.requests_growth >= 0 ? 'dash-trend-pill--up' : 'dash-trend-pill--down'"
            >
              {{ kpi.requests_growth >= 0 ? '▲' : '▼' }} {{ Math.abs(kpi.requests_growth) }}%
            </span>
          </div>
          <div class="dash-metric-val">{{ formatNumber(kpi.today_requests || 0) }}</div>
          <div class="dash-metric-foot">
            近 1 小时 <strong>{{ formatNumber(stats.total_requests || 0) }}</strong> 次 · 昨日
            {{ formatNumber(kpi.yesterday_requests || 0) }}
          </div>
        </div>

        <div class="dash-metric-cell">
          <div class="dash-metric-head">
            <span class="dash-metric-label">今日 Tokens</span>
            <span
              v-if="kpi.tokens_growth !== undefined && kpi.tokens_growth !== null"
              class="dash-trend-pill"
              :class="kpi.tokens_growth >= 0 ? 'dash-trend-pill--up' : 'dash-trend-pill--down'"
            >
              {{ kpi.tokens_growth >= 0 ? '▲' : '▼' }} {{ Math.abs(kpi.tokens_growth) }}%
            </span>
          </div>
          <div class="dash-metric-val">{{ formatTokens(kpi.today_total_tokens || 0) }}</div>
          <div class="dash-metric-foot">
            输入 {{ formatTokens(kpi.today_prompt_tokens || 0) }} / 输出
            {{ formatTokens(kpi.today_completion_tokens || 0) }}
          </div>
        </div>

        <div class="dash-metric-cell">
          <div class="dash-metric-head">
            <span class="dash-metric-label">近 1 小时 Tokens</span>
            <Activity :size="15" class="dash-metric-mini-icon" />
          </div>
          <div class="dash-metric-val">
            {{ formatTokens(kpi.total_tokens_last_hour ?? tokenStats.total_tokens_last_hour ?? 0) }}
          </div>
          <div class="dash-metric-foot">
            输入 {{ formatTokens(tokenStats.prompt_tokens_last_hour || 0) }} / 输出
            {{ formatTokens(tokenStats.completion_tokens_last_hour || 0) }}
          </div>
        </div>

        <div class="dash-metric-cell">
          <div class="dash-metric-head">
            <span class="dash-metric-label">今日错误</span>
            <span
              class="dash-trend-pill"
              :class="(kpi.today_error_rate || 0) > 5 ? 'dash-trend-pill--down' : 'dash-trend-pill--up'"
            >
              错误率 {{ kpi.today_error_rate || 0 }}%
            </span>
          </div>
          <div
            class="dash-metric-val"
            :class="(kpi.today_error_rate || 0) > 5 ? 'message-symbol-error' : ''"
          >
            {{ formatNumber(kpi.today_errors || 0) }}
          </div>
          <div class="dash-metric-foot">
            近 1 小时错误率 <strong>{{ stats.error_rate || 0 }}%</strong>
          </div>
        </div>

        <div class="dash-metric-cell">
          <div class="dash-metric-head">
            <span class="dash-metric-label">活跃密钥 (24h)</span>
            <Key :size="15" class="dash-metric-mini-icon" />
          </div>
          <div class="dash-metric-val">
            {{ formatNumber(kpi.active_api_keys_24h ?? apiKeyStats.length) }}
          </div>
          <div class="dash-metric-foot">
            累计消费 <strong>{{ formatTokens(tokenStats.total_tokens_all || 0) }}</strong> Tokens
          </div>
        </div>

        <div class="dash-metric-cell">
          <div class="dash-metric-head">
            <span class="dash-metric-label">渠道池健康率</span>
            <Zap :size="15" class="dash-metric-mini-icon" />
          </div>
          <div class="dash-metric-val">{{ healthyRate }}%</div>
          <div class="dash-metric-foot">
            渠道池 {{ channelPool.healthy }}/{{ channelPool.total }} 健康 · 熔断
            {{ channelPool.open_circuits }}
          </div>
        </div>
      </div>
    </v-card>

    <ListState :error="loadError" @retry="load" />

    <UiSpinner v-if="!loadError" :show="loading">
      <div class="dash-body-stack">
        <!-- 全宽时序工作台：标签切换式图表视图 + 右侧周期汇总栏 -->
        <v-card class="dash-workbench" elevation="1">
          <div class="dash-workbench-header">
            <div>
              <h2 class="dash-section-title">吞吐趋势</h2>
              <p class="secondary-text">
                {{ chartGranularity === 'hourly' ? '近 24 小时' : '近 7 天' }}网关吞吐、错误与活跃渠道趋势
              </p>
            </div>
            <v-tabs v-model="activeChartTab" color="primary" density="compact" class="dash-chart-tabs">
              <v-tab value="tokens">Token 吞吐量</v-tab>
              <v-tab value="requests">请求量 / 错误</v-tab>
              <v-tab value="channels">活跃渠道趋势</v-tab>
            </v-tabs>
          </div>

          <v-divider />

          <div class="dash-workbench-body">
            <div class="dash-workbench-stage">
              <template v-if="selectedChartData.length">
                <EChart
                  v-if="activeChartTab === 'tokens'"
                  key="tokens-chart"
                  :option="tokenChartOption"
                  :height="310"
                />
                <EChart
                  v-else-if="activeChartTab === 'requests'"
                  key="requests-chart"
                  :option="requestChartOption"
                  :height="310"
                />
                <EChart
                  v-else
                  key="channels-chart"
                  :option="healthyChannelChartOption"
                  :height="310"
                />
              </template>
              <UiEmpty v-else title="暂无趋势数据" description="当前统计窗口内尚未产生请求记录。" />
            </div>

            <aside class="dash-workbench-aside" aria-label="周期吞吐汇总">
              <div class="dash-aside-block">
                <span class="dash-aside-title">Token 用量汇总</span>
                <div class="dash-aside-kv">
                  <span>今日总计</span>
                  <strong>{{ formatTokens(kpi.today_total_tokens || 0) }}</strong>
                </div>
                <div class="dash-aside-kv">
                  <span>近 1h 缓存命中</span>
                  <strong>{{ formatTokens(tokenStats.cache_tokens_last_hour || 0) }}</strong>
                </div>
                <div class="dash-aside-kv">
                  <span>近 1h 总计</span>
                  <strong>{{ formatTokens(tokenStats.total_tokens_last_hour || 0) }}</strong>
                </div>
                <div class="dash-aside-kv">
                  <span>历史累计总计</span>
                  <strong>{{ formatTokens(tokenStats.total_tokens_all || 0) }}</strong>
                </div>
              </div>

              <v-divider class="my-3" />

              <div class="dash-aside-block">
                <div class="dash-aside-kv">
                  <span class="secondary-text">今日输入占比</span>
                  <strong>{{ promptRatio }}%</strong>
                </div>
                <v-progress-linear
                  :model-value="promptRatio"
                  color="primary"
                  height="6"
                  class="my-2"
                />
                <p class="secondary-text">
                  输入 {{ formatTokens(kpi.today_prompt_tokens || 0) }} · 输出
                  {{ formatTokens(kpi.today_completion_tokens || 0) }}
                </p>
              </div>
            </aside>
          </div>
        </v-card>

        <!-- 中部双栏分布洞察：模型分布环形图 + 榜单 (左) & 渠道健康拓扑矩阵 (右) -->
        <div class="dash-bento-row">
          <v-card class="dash-panel" elevation="1">
            <div class="dash-panel-header">
              <div>
                <h2 class="dash-section-title">模型调用占比</h2>
                <p class="secondary-text">按请求次数统计热门公开模型分布</p>
              </div>
              <v-chip size="small" variant="tonal" color="primary" label>
                Top {{ topModels.length }}
              </v-chip>
            </div>
            <v-divider />
            <div v-if="topModels.length" class="dash-model-split">
              <div class="dash-model-chart">
                <EChart :option="modelDonutOption" :height="250" />
              </div>
              <div class="dash-model-ranks">
                <div
                  v-for="(m, idx) in topModels"
                  :key="m.model"
                  class="dash-model-rank-item"
                >
                  <div class="dash-model-rank-head">
                    <span
                      class="dash-rank-dot"
                      :style="{ backgroundColor: donutPalette[idx % donutPalette.length] }"
                    />
                    <ModelIcon :model="m.model" :size="16" />
                    <span class="dash-model-rank-name" :title="m.model">{{ m.model }}</span>
                    <strong class="dash-model-rank-count">{{ formatNumber(m.request_count || 0) }}</strong>
                  </div>
                  <v-progress-linear
                    :model-value="modelSharePct(m.request_count || 0)"
                    :color="donutPalette[idx % donutPalette.length]"
                    height="5"
                  />
                </div>
              </div>
            </div>
            <div v-else class="dash-panel-body">
              <UiEmpty title="暂无模型数据" description="发起模型请求后将在此展示调用占比。" />
            </div>
          </v-card>

          <v-card class="dash-panel" elevation="1">
            <div class="dash-panel-header">
              <div>
                <h2 class="dash-section-title">渠道实时健康</h2>
                <p class="secondary-text">渠道池状态与上游熔断器实时监控</p>
              </div>
              <RouterLink to="/channels" class="dash-link">管理渠道 →</RouterLink>
            </div>
            <v-divider />
            <div class="dash-panel-body">
              <div class="dash-pool-pills">
                <div class="dash-pool-pill">
                  <span class="secondary-text">总渠道</span>
                  <strong>{{ channelPool.total }}</strong>
                </div>
                <div class="dash-pool-pill dash-pool-pill--ok">
                  <span class="secondary-text">健康</span>
                  <strong class="message-symbol-success">{{ channelPool.healthy }}</strong>
                </div>
                <div class="dash-pool-pill dash-pool-pill--err">
                  <span class="secondary-text">异常</span>
                  <strong class="message-symbol-error">{{ channelPool.unhealthy }}</strong>
                </div>
                <div class="dash-pool-pill">
                  <span class="secondary-text">半开 / 熔断</span>
                  <strong>{{ channelPool.half_open_circuits }} / {{ channelPool.open_circuits }}</strong>
                </div>
              </div>

              <div v-if="stats.channel_health?.length" class="dash-channel-matrix">
                <div
                  v-for="ch in stats.channel_health"
                  :key="ch.id"
                  class="dash-channel-tile"
                >
                  <div class="channel-health-identity">
                    <ModelIcon :provider="ch.provider" :size="20" />
                    <div class="min-w-0">
                      <p class="truncate text-sm font-medium">{{ ch.name }}</p>
                      <p class="secondary-text">{{ ch.provider }}</p>
                    </div>
                  </div>
                  <div class="channel-health-meta">
                    <UiBadge
                      v-if="ch.circuit_state && ch.circuit_state !== 'closed'"
                      :variant="ch.circuit_state === 'open' ? 'danger' : 'warning'"
                    >
                      {{ ch.circuit_state === 'open' ? '熔断' : '半开' }}
                    </UiBadge>
                    <UiBadge
                      :variant="
                        ch.health_status === 'healthy'
                          ? 'success'
                          : ch.health_status === 'unhealthy'
                            ? 'danger'
                            : 'default'
                      "
                    >
                      {{
                        ch.health_status === 'healthy'
                          ? '健康'
                          : ch.health_status === 'unhealthy'
                            ? '异常'
                            : '未知'
                      }}
                    </UiBadge>
                  </div>
                </div>
              </div>
              <UiEmpty v-else title="暂无渠道数据" />
            </div>
          </v-card>
        </div>

        <!-- 底部全宽客户端密钥消费排行 -->
        <v-card class="dash-panel" elevation="1">
          <div class="dash-panel-header">
            <div>
              <h2 class="dash-section-title">近 24 小时 API Key 调用 Top</h2>
              <p class="secondary-text">按近 24 小时请求频次与 Token 用量排序的活跃客户端密钥</p>
            </div>
            <RouterLink to="/api-keys" class="dash-link">密钥管理 →</RouterLink>
          </div>
          <v-divider />
          <div class="dash-table-flush">
            <UiDataTable :columns="keyColumns" :data="apiKeyStats" label="API Key 调用统计" />
          </div>
        </v-card>
      </div>
    </UiSpinner>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import type { EChartsOption } from 'echarts'
import { Activity, Zap, Key } from 'lucide-vue-next'
import { getDashboardStats } from '@/api/stats'
import { useTheme } from '@/composables/useTheme'
import ListState from '@/components/ListState.vue'
import NavIcon from '@/components/NavIcon.vue'
import ModelIcon from '@/components/ModelIcon.vue'
import EChart from '@/components/EChart.vue'
import { useMediaQuery } from '@vueuse/core'
import UiDataTable from '@/components/ui/UiDataTable.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiEmpty from '@/components/ui/UiEmpty.vue'
import UiSpinner from '@/components/ui/UiSpinner.vue'

const stats = ref<any>({})
const loading = ref(true)
const loadError = ref('')
const chartGranularity = ref<'hourly' | 'daily'>('hourly')
const activeChartTab = ref<'tokens' | 'requests' | 'channels'>('tokens')

const { isDark, currentThemeColor } = useTheme()
const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

const kpi = computed(() => stats.value.kpi || {})
const tokenStats = computed(() => stats.value.token_stats || {})
const channelPool = computed(
  () =>
    stats.value.channel_pool || {
      total: (stats.value.channel_health || []).length,
      healthy: (stats.value.channel_health || []).filter((c: any) => c.health_status === 'healthy').length,
      unhealthy: 0,
      open_circuits: 0,
      half_open_circuits: 0,
    }
)
const apiKeyStats = computed(() => stats.value.api_key_stats || [])
const topModels = computed(() => stats.value.top_models || [])

const healthyRate = computed(() => {
  const total = channelPool.value.total || 0
  if (!total) return 100
  return Math.round(((channelPool.value.healthy || 0) / total) * 100)
})

const promptRatio = computed(() => {
  const total = kpi.value.today_total_tokens || 0
  if (!total) return 0
  return Math.round(((kpi.value.today_prompt_tokens || 0) / total) * 100)
})

const totalModelCalls = computed(() =>
  topModels.value.reduce((acc: number, item: any) => acc + (item.request_count || 0), 0)
)

function modelSharePct(count: number) {
  if (!totalModelCalls.value) return 0
  return Math.round((count / totalModelCalls.value) * 100)
}

const keyColumns = [
  {
    title: 'API Key',
    key: 'from_apikey',
    render: (row: any) =>
      h('div', null, [
        h('p', { class: 'font-medium' }, row.from_apikey_name || row.from_apikey || '—'),
        row.from_apikey ? h('code', { class: 'secondary-text' }, shortId(row.from_apikey)) : null,
      ]),
  },
  { title: '请求数', key: 'request_count', render: (row: any) => formatNumber(row.request_count) },
  {
    title: '错误数',
    key: 'error_count',
    render: (row: any) =>
      h(
        'span',
        { class: (row.error_count || 0) > 0 ? 'message-symbol-error font-medium' : '' },
        formatNumber(row.error_count)
      ),
  },
  { title: '输入 / 输出 Tokens', key: 'io_tokens', render: (row: any) => `${formatTokens(row.prompt_tokens || 0)} / ${formatTokens(row.completion_tokens || 0)}` },
  { title: '总 Tokens', key: 'total_tokens', render: (row: any) => formatNumber(row.total_tokens) },
  {
    title: '负载占比',
    key: 'share',
    render: (row: any) => {
      const max = apiKeyStats.value[0]?.request_count || 1
      const pct = Math.round(((row.request_count || 0) / max) * 100)
      return h('div', { class: 'usage-bar-wrap' }, [
        h('div', { class: 'usage-bar' }, [
          h('div', { class: 'usage-bar-fill', style: { width: `${pct}%` } }),
        ]),
        h('span', { class: 'usage-bar-label' }, `${pct}%`),
      ])
    },
  },
]

const tokenFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 2,
})

function formatTokens(value: number) {
  return tokenFormatter.format(value || 0)
}
function formatNumber(value: number) {
  return new Intl.NumberFormat('zh-CN').format(value || 0)
}
function shortId(value: string) {
  if (!value) return ''
  return value.length > 12 ? `${value.slice(0, 8)}...` : value
}
function formatHour(value: string) {
  if (!value) return ''
  return new Date(value).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  })
}
function formatDay(value: string) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

const axisLabelColor = computed(() => (isDark.value ? '#9aa0a6' : '#656b76'))
const gridLineColor = computed(() => (isDark.value ? '#2e3238' : '#e6e8eb'))
const animate = computed(() => !reducedMotion.value)

const selectedChartData = computed(() => stats.value.stats_charts?.[chartGranularity.value] || [])
const chartCategories = computed(() =>
  selectedChartData.value.map((item: any) =>
    chartGranularity.value === 'hourly' ? formatHour(item.time) : formatDay(item.time)
  )
)

function baseGrid(): EChartsOption {
  return {
    animation: animate.value,
    animationDuration: 300,
    textStyle: { fontFamily: "'Roboto', system-ui, sans-serif" },
    grid: { left: 10, right: 18, top: 38, bottom: 10, containLabel: true },
    legend: {
      top: 2,
      left: 0,
      icon: 'roundRect',
      itemWidth: 12,
      itemHeight: 8,
      textStyle: { color: axisLabelColor.value },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark.value ? '#262a30' : '#ffffff',
      borderColor: gridLineColor.value,
      textStyle: { color: isDark.value ? '#e6e7e9' : '#1d1d1f' },
    },
    xAxis: {
      type: 'category',
      data: chartCategories.value,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: axisLabelColor.value },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: gridLineColor.value, type: 'dashed' } },
      axisLabel: { color: axisLabelColor.value, formatter: (v: number) => formatNumber(Math.round(v)) },
    },
  }
}

const tokenChartOption = computed<EChartsOption>(() => ({
  ...baseGrid(),
  color: [currentThemeColor.value, '#009688'],
  tooltip: {
    ...(baseGrid().tooltip as object),
    valueFormatter: (v: any) => `${formatNumber(Number(v) || 0)} tokens`,
  },
  series: [
    {
      name: '输入 Tokens',
      type: 'line',
      stack: 'tokens',
      smooth: true,
      showSymbol: false,
      areaStyle: { opacity: 0.25 },
      lineStyle: { width: 2.2 },
      data: selectedChartData.value.map((i: any) => i.prompt_tokens || 0),
    },
    {
      name: '输出 Tokens',
      type: 'line',
      stack: 'tokens',
      smooth: true,
      showSymbol: false,
      areaStyle: { opacity: 0.25 },
      lineStyle: { width: 2.2 },
      data: selectedChartData.value.map((i: any) => i.completion_tokens || 0),
    },
  ],
}))

const requestChartOption = computed<EChartsOption>(() => ({
  ...baseGrid(),
  color: [currentThemeColor.value, isDark.value ? '#e57373' : '#d32f2f'],
  series: [
    {
      name: '请求数',
      type: 'bar',
      barMaxWidth: 24,
      itemStyle: { borderRadius: [3, 3, 0, 0] },
      data: selectedChartData.value.map((i: any) => i.request_count || 0),
    },
    {
      name: '错误数',
      type: 'bar',
      barMaxWidth: 24,
      itemStyle: { borderRadius: [3, 3, 0, 0] },
      data: selectedChartData.value.map((i: any) => i.error_count || 0),
    },
  ],
}))

const healthyChannelChartOption = computed<EChartsOption>(() => ({
  ...baseGrid(),
  color: [isDark.value ? '#81c784' : '#2e7d32'],
  tooltip: {
    ...(baseGrid().tooltip as object),
    valueFormatter: (v: any) => `${formatNumber(Number(v) || 0)} 个渠道`,
  },
  series: [
    {
      name: '活跃渠道数',
      type: 'line',
      smooth: true,
      showSymbol: false,
      areaStyle: { opacity: 0.2 },
      lineStyle: { width: 2.2 },
      data: selectedChartData.value.map((i: any) => i.healthy_channels || 0),
    },
  ],
}))

const donutPalette = ['#1976d2', '#009688', '#6200ee', '#f57c00', '#d32f2f', '#0288d1', '#455a64', '#7cb342']
const modelDonutOption = computed<EChartsOption>(() => ({
  animation: animate.value,
  color: donutPalette,
  textStyle: { fontFamily: "'Roboto', system-ui, sans-serif" },
  tooltip: {
    trigger: 'item',
    backgroundColor: isDark.value ? '#262a30' : '#ffffff',
    borderColor: gridLineColor.value,
    textStyle: { color: isDark.value ? '#e6e7e9' : '#1d1d1f' },
    valueFormatter: (v: any) => `${formatNumber(Number(v) || 0)} 次`,
  },
  series: [
    {
      name: '模型调用',
      type: 'pie',
      radius: ['54%', '78%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderColor: isDark.value ? '#1b1e23' : '#ffffff', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 13, fontWeight: 'bold' } },
      data: topModels.value.map((m: any) => ({ name: m.model, value: m.request_count || 0 })),
    },
  ],
}))

function setGranularity(value: 'hourly' | 'daily') {
  chartGranularity.value = value
}

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    stats.value = await getDashboardStats(chartGranularity.value)
  } catch (e) {
    loadError.value = '统计数据加载失败，请检查网络后重试'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.dashboard-redesign {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.dash-hero {
  padding: 22px 24px;
}

.dash-hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.dash-hero-title-group {
  min-width: 0;
}

.dash-hero-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.dash-hero-heading h1 {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
}

.dash-hero-subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: var(--sidebar-muted);
}

.dash-hero-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.dash-segmented {
  display: inline-flex;
  padding: 3px;
  border-radius: 4px;
  background: var(--color-surface-container-high, rgba(0, 0, 0, 0.06));
  border: 1px solid var(--color-outline-variant, rgba(0, 0, 0, 0.08));
}

.dash-segment-btn {
  padding: 5px 12px;
  font-size: 12.5px;
  font-weight: 600;
  border-radius: 3px;
  border: none;
  background: transparent;
  color: var(--sidebar-muted);
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease;
}

.dash-segment-btn--active {
  background: var(--color-primary, #1976d2);
  color: var(--color-on-primary, #ffffff);
}

.dash-metric-strip {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  border: 1px solid var(--color-outline-variant, rgba(0, 0, 0, 0.08));
  border-radius: 4px;
  background: var(--color-surface-container-low, rgba(0, 0, 0, 0.015));
  overflow: hidden;
}

.dash-metric-cell {
  padding: 14px 16px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 6px;
  border-right: 1px solid var(--color-outline-variant, rgba(0, 0, 0, 0.08));
}

.dash-metric-cell:last-child {
  border-right: none;
}

.dash-metric-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.dash-metric-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--sidebar-muted);
}

.dash-metric-mini-icon {
  color: var(--color-primary, #1976d2);
  opacity: 0.85;
  flex-shrink: 0;
}

.dash-metric-val {
  font-size: 24px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.dash-metric-foot {
  font-size: 11.5px;
  color: var(--sidebar-muted);
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}

.dash-trend-pill {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.dash-trend-pill--up {
  color: var(--message-success, #2e7d32);
  background: color-mix(in srgb, var(--message-success, #2e7d32) 14%, transparent);
}

.dash-trend-pill--down {
  color: var(--message-error, #d32f2f);
  background: color-mix(in srgb, var(--message-error, #d32f2f) 14%, transparent);
}

.dash-body-stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.dash-workbench-header,
.dash-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 22px;
}

.dash-section-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
}

.dash-workbench-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  min-width: 0;
}

.dash-workbench-stage {
  padding: 18px 22px;
  min-width: 0;
}

.dash-workbench-aside {
  padding: 18px 20px;
  border-left: 1px solid var(--color-outline-variant, rgba(0, 0, 0, 0.08));
  background: var(--color-surface-container-low, rgba(0, 0, 0, 0.015));
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.dash-aside-block {
  display: grid;
  gap: 10px;
}

.dash-aside-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--sidebar-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.dash-aside-kv {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.dash-bento-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  align-items: stretch;
}

.dash-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.dash-panel-body {
  padding: 18px 22px;
  flex: 1;
}

.dash-link {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary, #1976d2);
  text-decoration: none;
}

.dash-link:hover {
  text-decoration: underline;
}

.dash-model-split {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 16px;
  align-items: center;
  padding: 16px 22px;
}

.dash-model-ranks {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.dash-model-rank-item {
  display: grid;
  gap: 5px;
  min-width: 0;
}

.dash-model-rank-head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-size: 13px;
}

.dash-rank-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

.dash-model-rank-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dash-model-rank-count {
  font-variant-numeric: tabular-nums;
  font-size: 12.5px;
}

.dash-pool-pills {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.dash-pool-pill {
  padding: 10px 12px;
  border-radius: 4px;
  border: 1px solid var(--color-outline-variant, rgba(0, 0, 0, 0.08));
  background: var(--color-surface-container-low, rgba(0, 0, 0, 0.015));
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dash-pool-pill strong {
  font-size: 18px;
  font-variant-numeric: tabular-nums;
}

.dash-channel-matrix {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
  max-height: 230px;
  overflow-y: auto;
}

.dash-channel-tile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 4px;
  border: 1px solid var(--color-outline-variant, rgba(0, 0, 0, 0.08));
}

.dash-table-flush :deep(.ui-table-container) {
  border: none;
  box-shadow: none;
  border-radius: 0;
}

@media (max-width: 1280px) {
  .dash-metric-strip {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .dash-metric-cell:nth-child(3) {
    border-right: none;
  }
  .dash-metric-cell:nth-child(-n + 3) {
    border-bottom: 1px solid var(--color-outline-variant, rgba(0, 0, 0, 0.08));
  }
}

@media (max-width: 1060px) {
  .dash-workbench-body,
  .dash-bento-row {
    grid-template-columns: minmax(0, 1fr);
  }
  .dash-workbench-aside {
    border-left: none;
    border-top: 1px solid var(--color-outline-variant, rgba(0, 0, 0, 0.08));
  }
}

@media (max-width: 720px) {
  .dash-metric-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .dash-model-split {
    grid-template-columns: minmax(0, 1fr);
  }
  .dash-pool-pills {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
