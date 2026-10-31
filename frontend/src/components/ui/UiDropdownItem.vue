<template>
  <v-list-item
    role="menuitem"
    :disabled="disabled || loading"
    class="ui-dropdown-item"
    :class="{ 'ui-dropdown-item--danger': variant === 'danger' }"
    @click="handleClick"
  >
    <template v-if="icon || loading" #prepend>
      <v-progress-circular v-if="loading" indeterminate size="16" width="2" />
      <component
        :is="icon"
        v-else-if="icon"
        :size="18"
        :stroke-width="1.75"
        class="ui-dropdown-item__icon"
        aria-hidden="true"
      />
    </template>
    <v-list-item-title><slot /></v-list-item-title>
  </v-list-item>
</template>

<script setup lang="ts">
import { inject, type Component } from 'vue'

const props = defineProps<{
  icon?: Component
  variant?: 'default' | 'danger'
  loading?: boolean
  disabled?: boolean
  onClick?: () => void | Promise<void>
}>()

const close = inject<() => void>('close-action-menu', () => {})

function handleClick() {
  if (props.loading || props.disabled) return
  close()
  props.onClick?.()
}
</script>

<style scoped>
.ui-dropdown-item {
  cursor: pointer;
  border-radius: 6px;
  min-height: 40px;
  color: var(--color-text, currentColor);
}
.ui-dropdown-item :deep(.v-list-item-title),
.ui-dropdown-item :deep(.v-list-item__prepend) {
  color: inherit;
  opacity: 1;
}
.ui-dropdown-item--danger {
  color: var(--message-error, #d32f2f);
}
.ui-dropdown-item__icon {
  margin-right: 8px;
  color: currentColor;
}
</style>
