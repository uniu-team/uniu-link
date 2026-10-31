<template>
  <div class="theme-toggle-container" :class="{ 'theme-toggle-compact': compact }">
    <v-btn
      :variant="compact ? 'text' : 'text'"
      :icon="compact"
      :aria-label="description"
      :title="description"
      class="theme-toggle-btn"
      @click="setThemePreference(next)"
    >
      <template v-if="compact">
        <NavIcon :name="icons[themePreference]" :size="20" />
      </template>
      <template v-else>
        <span class="toggle-inner">
          <NavIcon :name="icons[themePreference]" :size="18" />
          <span v-if="!collapsed" class="toggle-label">{{ labels[themePreference] }}</span>
        </span>
      </template>
    </v-btn>
    <ThemeColorPicker class="theme-color-slot" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { setThemePreference, themePreference, type ThemePreference } from '@/composables/useTheme'
import NavIcon from './NavIcon.vue'
import ThemeColorPicker from './ThemeColorPicker.vue'

defineProps<{ collapsed?: boolean; compact?: boolean }>()

const modes: ThemePreference[] = ['system', 'light', 'dark']
const labels = { system: '跟随系统', light: '浅色模式', dark: '深色模式' }
const icons = { system: 'monitor', light: 'sun', dark: 'moon' }
const next = computed(() => modes[(modes.indexOf(themePreference.value) + 1) % modes.length]!)
const description = computed(
  () => `当前主题：${labels[themePreference.value]}，点击切换为${labels[next.value]}`
)
</script>

<style scoped>
.theme-toggle-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 4px;
}
.theme-toggle-compact {
  width: auto;
}
.theme-toggle-btn {
  flex: 1;
  justify-content: flex-start;
}
.theme-toggle-compact .theme-toggle-btn {
  flex: 0 0 auto;
}
.toggle-inner {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}
.theme-color-slot {
  flex-shrink: 0;
}
</style>
