<template>
  <v-btn
    :color="color"
    :variant="btnVariant"
    :size="btnSize"
    :icon="size === 'icon' ? true : undefined"
    :block="block"
    :loading="loading"
    :disabled="disabled || formBusy"
    :type="nativeType"
    class="ui-btn"
    :class="{ 'ui-btn-icon': size === 'icon' }"
  >
    <slot />
  </v-btn>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { formBusyKey } from '@/composables/useField'

const formBusy = inject(
  formBusyKey,
  computed(() => false)
)

const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'primary' | 'danger' | 'ghost' | 'link'
    size?: 'sm' | 'md' | 'lg' | 'icon'
    block?: boolean
    loading?: boolean
    disabled?: boolean
    nativeType?: 'button' | 'submit' | 'reset'
  }>(),
  { variant: 'default', size: 'md', nativeType: 'button' }
)

const color = computed(() => {
  if (props.variant === 'primary') return 'primary'
  if (props.variant === 'danger') return 'error'
  if (props.variant === 'link') return 'primary'
  return undefined
})

const btnVariant = computed(() => {
  if (props.variant === 'primary' || props.variant === 'danger') return 'flat'
  if (props.variant === 'link') return 'text'
  if (props.variant === 'ghost' || props.size === 'icon') return 'text'
  return 'tonal'
})

const btnSize = computed(() => {
  if (props.size === 'sm') return 'small'
  if (props.size === 'lg') return 'large'
  if (props.size === 'icon') return 'small'
  return 'default'
})
</script>

<style scoped>
.ui-btn {
  text-transform: none;
  letter-spacing: 0.01em;
  font-weight: 600;
}
.ui-btn-icon {
  min-width: 38px;
  width: 38px;
  height: 38px;
}
</style>
