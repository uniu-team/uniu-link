<template>
  <div class="theme-color-picker">
    <v-menu v-model="menuOpen" location="top" :close-on-content-click="false">
      <template #activator="{ props: activator }">
        <v-btn
          v-bind="activator"
          variant="text"
          icon
          size="small"
          :aria-label="'自定义主题色，当前：' + currentColorName"
          :title="'主题配色：' + currentColorName"
          class="color-picker-trigger"
        >
          <span class="color-indicator" :style="{ backgroundColor: currentThemeColor }" />
        </v-btn>
      </template>

      <div class="color-picker-panel">
        <div class="color-picker-header">
          <span class="color-picker-title">主题配色</span>
          <span class="color-picker-current">{{ currentColorName }}</span>
        </div>

        <div class="color-grid">
          <button
            v-for="preset in colorPresets"
            :key="preset.value"
            type="button"
            class="color-circle-btn"
            :class="{
              'color-circle-btn--active': currentThemeColor.toLowerCase() === preset.value.toLowerCase(),
            }"
            :style="{ backgroundColor: preset.value }"
            :title="preset.name"
            @click="selectColor(preset.value)"
          >
            <svg
              v-if="currentThemeColor.toLowerCase() === preset.value.toLowerCase()"
              class="check-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        </div>

        <div class="custom-color-row">
          <label class="custom-color-label">
            <span>自定义取色</span>
            <input
              type="color"
              :value="currentThemeColor"
              class="custom-color-input"
              @input="onCustomColorInput"
            />
          </label>
          <span class="custom-color-hex">{{ currentThemeColor.toUpperCase() }}</span>
        </div>
      </div>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { colorPresets, currentThemeColor, setThemeColor } from '@/composables/useTheme'

const menuOpen = ref(false)

const currentColorName = computed(() => {
  const match = colorPresets.find(
    (p) => p.value.toLowerCase() === currentThemeColor.value.toLowerCase()
  )
  return match ? match.name : '自定义'
})

function selectColor(color: string) {
  setThemeColor(color)
  menuOpen.value = false
}

function onCustomColorInput(event: Event) {
  const color = (event.target as HTMLInputElement).value
  if (color) setThemeColor(color)
}
</script>

<style scoped>
.theme-color-picker {
  display: inline-flex;
  align-items: center;
}
.color-indicator {
  display: block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}
.color-picker-trigger:hover .color-indicator {
  transform: scale(1.15);
}
.color-picker-panel {
  padding: 14px;
  min-width: 220px;
  border-radius: 10px;
  background-color: var(--color-surface-container-highest, #ffffff);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  box-sizing: border-box;
}
.color-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
}
.color-picker-title {
  font-weight: 600;
  color: var(--color-text);
}
.color-picker-current {
  color: var(--color-primary);
  font-size: 12px;
}
.color-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 14px;
}
.color-circle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  outline: none;
  padding: 0;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
.color-circle-btn:hover {
  transform: scale(1.12);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
}
.color-circle-btn--active {
  box-shadow: 0 0 0 3px var(--color-body), 0 0 0 5px var(--color-primary);
}
.check-icon {
  width: 16px;
  height: 16px;
  color: #ffffff;
}
.custom-color-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid var(--color-outline-variant, rgba(0, 0, 0, 0.1));
}
.custom-color-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-text);
  cursor: pointer;
}
.custom-color-input {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background: transparent;
}
.custom-color-hex {
  font-family: monospace;
  font-size: 11px;
  color: var(--sidebar-muted, #888888);
}
</style>
