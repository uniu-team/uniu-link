<template>
  <div class="md3-empty-state">
    <div class="md3-empty-icon" aria-hidden="true">
      <slot name="icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.29 7 12 12 20.71 7" />
          <line x1="12" y1="22" x2="12" y2="12" />
        </svg>
      </slot>
    </div>
    <p class="md3-empty-title">{{ title }}</p>
    <p v-if="description" class="md3-empty-desc">{{ description }}</p>
    <div v-if="$slots.default" class="md3-empty-extra">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ title?: string; description?: string }>(), { title: '暂无数据' })
</script>

<style scoped>
.md3-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  box-sizing: border-box;
}

.md3-empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background-color: var(--color-surface-container-high, #efe5e9);
  color: var(--sidebar-muted, #837379);
  margin-bottom: 16px;
}

:root[data-theme='dark'] .md3-empty-icon {
  background-color: var(--color-surface-container-high, #2e282b);
  color: var(--sidebar-muted, #9d8c92);
}

.md3-empty-title {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--sidebar-strong);
}

.md3-empty-desc {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--sidebar-muted, #837379);
}

.md3-empty-extra {
  margin-top: 16px;
}
</style>
