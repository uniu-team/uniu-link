<template>
  <v-textarea
    v-bind="varAttrs"
    :model-value="modelValue ?? ''"
    :rows="Number(rows) || 4"
    :placeholder="String($attrs.placeholder || '')"
    :aria-label="accessibleName"
    :disabled="disabled || formBusy"
    variant="outlined"
    density="comfortable"
    hide-details="auto"
    auto-grow
    class="w-full"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import { computed, inject, useAttrs } from 'vue'
import { fieldLabelKey, formBusyKey } from '@/composables/useField'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{ modelValue?: string | null; disabled?: boolean; rows?: number | string }>(), {
  rows: 4,
})
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const attrs = useAttrs()

const label = inject(
  fieldLabelKey,
  computed(() => '')
)
const formBusy = inject(
  formBusyKey,
  computed(() => false)
)
const accessibleName = computed(
  () => String(attrs['aria-label'] || label.value || attrs.placeholder || '')
)
const varAttrs = computed(() => {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(attrs)) {
    if (key !== 'aria-label' && key !== 'rows') result[key] = value
  }
  return result
})
</script>
