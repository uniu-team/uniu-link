<template>
  <v-select
    v-bind="selectAttrs"
    :model-value="modelValue"
    :items="options"
    item-title="label"
    item-value="value"
    :placeholder="placeholderText"
    :aria-label="accessibleName"
    :label="undefined"
    :disabled="disabled || formBusy || !options.length"
    variant="outlined"
    density="comfortable"
    hide-details="auto"
    color="primary"
    class="ui-select w-full"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #selection="{ item }">
      <div class="d-flex align-center ga-2 ui-select-selection">
        <span
          v-if="item.raw.model || item.raw.icon"
          class="d-inline-flex align-center"
          aria-hidden="true"
        >
          <ModelIcon
            :model="item.raw.model"
            :icon="item.raw.icon"
            :upstream-models="item.raw.upstreamModels"
            :size="16"
          />
        </span>
        <span>{{ item.raw.label }}</span>
      </div>
    </template>
    <template #item="{ item, props: itemProps }">
      <v-list-item v-bind="itemProps" role="option" :title="undefined" :disabled="item.raw.disabled">
        <template #title>
          <div class="d-flex align-center ga-2">
            <span
              v-if="item.raw.model || item.raw.icon"
              class="d-inline-flex align-center"
              aria-hidden="true"
            >
              <ModelIcon
                :model="item.raw.model"
                :icon="item.raw.icon"
                :upstream-models="item.raw.upstreamModels"
                :size="16"
              />
            </span>
            <span>{{ item.raw.label }}</span>
          </div>
        </template>
      </v-list-item>
    </template>
  </v-select>
</template>

<script setup lang="ts">
import { computed, inject, useAttrs } from 'vue'
import { fieldLabelKey, formBusyKey } from '@/composables/useField'
import ModelIcon from '@/components/ModelIcon.vue'

defineOptions({ inheritAttrs: false })

export interface UiSelectOption {
  label: string
  value: string
  disabled?: boolean
  model?: string
  icon?: string
  upstreamModels?: string[]
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    options: UiSelectOption[]
    placeholder?: string
    disabled?: boolean
  }>(),
  { placeholder: '请选择' }
)

const emit = defineEmits<{ 'update:modelValue': [value: any] }>()
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
  () => String(attrs['aria-label'] || label.value || props.placeholder || '')
)
const placeholderText = computed(() => String(attrs.placeholder || props.placeholder || ''))
const selectAttrs = computed(() => {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(attrs)) {
    if (key !== 'aria-label' && key !== 'placeholder') result[key] = value
  }
  return result
})
</script>

<style scoped>
.ui-select :deep(.v-field) {
  border-radius: 6px;
}
.ui-select-selection {
  overflow: hidden;
}
</style>
