<template>
  <div v-if="show" class="md3-loading-state loading-state" role="status" aria-live="polite">
    <v-progress-circular indeterminate size="22" width="2.5" color="primary" :aria-label="label" />
    <span class="md3-loading-label">{{ label }}</span>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
withDefaults(defineProps<{ show?: boolean; label?: string }>(), { label: '加载中…' })
</script>

<style scoped>
.md3-loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 16px;
  color: var(--sidebar-muted, #837379);
  font-size: 14px;
}
.md3-loading-label {
  user-select: none;
}
</style>
