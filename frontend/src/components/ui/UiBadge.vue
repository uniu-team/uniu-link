<template>
  <v-chip size="small" :color="chipColor" variant="tonal" label class="ui-badge">
    <NavIcon v-if="semantic" :name="semantic" :size="13" class="badge-icon mr-1" />
    <slot />
  </v-chip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import NavIcon from '@/components/NavIcon.vue'

const props = defineProps<{ variant?: 'default' | 'success' | 'danger' | 'warning' | 'info' }>()

const chipColor = computed(() => {
  if (props.variant === 'danger') return 'error'
  if (props.variant === 'success') return 'success'
  if (props.variant === 'warning') return 'warning'
  if (props.variant === 'info') return 'info'
  return undefined
})

const semantic = computed(() =>
  props.variant === 'danger'
    ? 'error'
    : props.variant === 'success' || props.variant === 'warning'
      ? props.variant
      : ''
)
</script>

<style scoped>
.ui-badge {
  font-weight: 600;
}
.badge-icon {
  color: currentColor;
}
</style>
