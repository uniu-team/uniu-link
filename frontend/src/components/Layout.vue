<template>
  <a class="skip-link" href="#main">跳转到主要内容</a>

  <v-navigation-drawer
    v-model="drawer"
    :rail="rail && !isNarrow"
    :permanent="!isNarrow"
    :temporary="isNarrow"
    :width="256"
    :rail-width="72"
    color="surface"
    class="app-drawer"
    aria-label="管理侧边栏"
  >
    <div class="drawer-brand" :class="{ 'drawer-brand-rail': rail && !isNarrow }">
      <span class="brand-mark"><NavIcon name="gateway" :size="26" /></span>
      <span v-if="!(rail && !isNarrow)" class="drawer-brand-copy">
        <strong>UniuLink</strong>
        <span>AI 网关管理后台</span>
      </span>
    </div>

    <v-divider />

    <v-list
      id="admin-navigation"
      class="nav-list"
      density="comfortable"
      nav
      aria-label="管理导航"
    >
      <v-list-item
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :active="selected(item.path)"
        :aria-current="selected(item.path) ? 'page' : undefined"
        color="primary"
        class="nav-item navigation-item"
        :class="{ 'navigation-item-selected': selected(item.path) }"
        :title="item.label"
        @click="navigated"
      >
        <template #prepend>
          <NavIcon :name="item.icon" :size="20" />
        </template>
      </v-list-item>
    </v-list>

    <template #append>
      <v-divider />
      <div class="drawer-footer">
        <v-btn
          variant="text"
          block
          :disabled="signingOut"
          class="logout-btn"
          aria-label="退出登录"
          title="退出登录"
          @click="logout"
        >
          <template #prepend><NavIcon name="logout" :size="18" /></template>
          <span v-if="!(rail && !isNarrow)">退出登录</span>
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>

  <v-app-bar flat density="comfortable" class="app-bar" border="b">
    <v-app-bar-nav-icon
      id="sidebar-toggle"
      :aria-label="railOrDrawerLabel"
      :title="railOrDrawerLabel"
      :aria-expanded="isNarrow ? drawer : !rail"
      aria-controls="admin-navigation"
      @click="toggleNav"
    />
    <v-app-bar-title class="app-bar-title">
      <span class="app-bar-page">{{ currentTitle || 'UniuLink' }}</span>
    </v-app-bar-title>
    <v-spacer />
    <div class="app-bar-actions">
      <ThemeToggle compact />
    </div>
  </v-app-bar>

  <v-main class="app-main">
    <div id="main" class="main-content" tabindex="-1"><slot /></div>
  </v-main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { approveNextNavigation, confirmUnsavedChanges } from '@/composables/useUnsavedChanges'
import NavIcon from './NavIcon.vue'
import ThemeToggle from './ThemeToggle.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const screen = window.matchMedia('(max-width: 960px)')
const isNarrow = ref(screen.matches)
const drawer = ref(!screen.matches)
const rail = ref(false)
const signingOut = ref(false)

const currentTitle = computed(() => (route.meta.title as string | undefined) || '')
const railOrDrawerLabel = computed(() =>
  isNarrow.value
    ? drawer.value
      ? '收起侧边栏'
      : '展开侧边栏'
    : rail.value
      ? '展开侧边栏'
      : '收起侧边栏'
)

// 平铺单层无分类侧边栏导航
const navItems = [
  { path: '/', label: '仪表盘', icon: 'dashboard' },
  { path: '/playground', label: '演练场', icon: 'comment' },
  { path: '/channels', label: '渠道管理', icon: 'server' },
  { path: '/accounts', label: '账号管理', icon: 'key' },
  { path: '/models', label: '模型管理', icon: 'model' },
  { path: '/api-keys', label: 'API 密钥', icon: 'tag' },
  { path: '/logs', label: '请求日志', icon: 'document' },
  { path: '/plugins', label: '插件管理', icon: 'plugin' },
  { path: '/config', label: '系统配置', icon: 'settings' },
]

function selected(path: string) {
  return path === '/'
    ? route.path === '/'
    : route.path === path || route.path.startsWith(path + '/')
}

function navigated() {
  if (isNarrow.value) drawer.value = false
}

function toggleNav() {
  if (isNarrow.value) drawer.value = !drawer.value
  else rail.value = !rail.value
}

function resized(event: MediaQueryListEvent) {
  isNarrow.value = event.matches
  drawer.value = !event.matches
  rail.value = false
}

function escaped(event: KeyboardEvent) {
  if (event.key === 'Escape' && isNarrow.value && drawer.value) {
    drawer.value = false
    document.getElementById('sidebar-toggle')?.focus()
  }
}

screen.addEventListener('change', resized)
window.addEventListener('keydown', escaped)

onBeforeUnmount(() => {
  screen.removeEventListener('change', resized)
  window.removeEventListener('keydown', escaped)
})

async function logout() {
  if (signingOut.value) return
  signingOut.value = true
  try {
    if (!(await confirmUnsavedChanges())) return
    approveNextNavigation()
    auth.logout()
    await router.push('/login')
  } finally {
    signingOut.value = false
  }
}
</script>

<style scoped>
.app-drawer {
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.drawer-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 64px;
  padding: 0 20px;
  min-width: 0;
}
.drawer-brand-rail {
  justify-content: center;
  padding: 0;
}
.brand-mark {
  display: inline-flex;
  color: rgb(var(--v-theme-primary));
  flex-shrink: 0;
}
.drawer-brand-copy {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  min-width: 0;
}
.drawer-brand-copy strong {
  font-size: 16px;
  font-weight: 700;
}
.drawer-brand-copy > span {
  font-size: 11px;
  color: rgb(var(--v-theme-on-surface-variant));
  white-space: nowrap;
}
.nav-list {
  padding: 10px 8px;
}
.nav-item {
  min-height: 44px;
  padding-inline: 14px;
}
.nav-item :deep(.v-list-item__prepend) {
  width: 28px;
  min-width: 28px;
  margin-inline-end: 12px;
}
.nav-item :deep(.v-list-item-title) {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.01em;
}
.drawer-footer {
  display: grid;
  gap: 4px;
  padding: 10px 12px 14px;
}
.logout-btn {
  justify-content: flex-start;
}
.app-bar-page {
  font-size: 16px;
  font-weight: 600;
}
.app-bar-actions {
  display: flex;
  align-items: center;
  padding-right: 12px;
}
.skip-link {
  position: fixed;
  top: -80px;
  left: 16px;
  z-index: 20020;
  padding: 12px 20px;
  border-radius: 4px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
}
.skip-link:focus {
  top: 12px;
}
.main-content {
  padding: 24px clamp(16px, 2.4vw, 36px) 48px;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
}
@media (max-width: 700px) {
  .main-content {
    padding: 16px;
  }
}
</style>
