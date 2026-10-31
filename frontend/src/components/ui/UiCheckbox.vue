<template>
  <v-checkbox
    v-bind="$attrs"
    :model-value="checked"
    :label="label"
    :disabled="disabled || formBusy"
    density="comfortable"
    hide-details="auto"
    color="primary"
    class="ui-checkbox"
    @update:model-value="update"
  >
    <template v-if="$slots.default" #label><slot /></template>
  </v-checkbox>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { formBusyKey } from '@/composables/useField'

const props = defineProps<{
  modelValue: boolean | string[]
  value?: string
  label?: string
  disabled?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [value: any] }>()

const formBusy = inject(
  formBusyKey,
  computed(() => false)
)

const checked = computed(() =>
  Array.isArray(props.modelValue) ? props.modelValue.includes(props.value || '') : Boolean(props.modelValue)
)

function update(val: boolean | null) {
  const next = Boolean(val)
  emit(
    'update:modelValue',
    Array.isArray(props.modelValue)
      ? next
        ? [...new Set([...props.modelValue, props.value || ''])]
        : props.modelValue.filter((v) => v !== props.value)
      : next
  )
}
</script>
