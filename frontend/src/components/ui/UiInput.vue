<template>
  <v-text-field
    ref="fieldRef"
    v-bind="varAttrs"
    :model-value="modelValue == null ? '' : String(modelValue)"
    :type="type"
    :placeholder="String($attrs.placeholder || '')"
    :aria-label="accessibleName"
    :disabled="disabled || formBusy"
    variant="outlined"
    density="comfortable"
    hide-details="auto"
    class="ui-input w-full"
    @update:model-value="update"
  />
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref, useAttrs, watch } from 'vue'
import { fieldLabelKey, formBusyKey } from '@/composables/useField'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null
    type?: string
    disabled?: boolean
    modelModifiers?: { number?: boolean; trim?: boolean }
  }>(),
  { type: 'text' }
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
  () => String(attrs['aria-label'] || label.value || attrs.placeholder || '')
)

// Native constraints forwarded to the real <input> after mount.
const NATIVE_ATTRS = ['min', 'max', 'step', 'required', 'maxlength', 'minlength', 'inputmode', 'pattern', 'autocomplete']
const varAttrs = computed(() => {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(attrs)) {
    if (!NATIVE_ATTRS.includes(key) && key !== 'aria-label') result[key] = value
  }
  return result
})

const fieldRef = ref<any>()

function nativeInput(): HTMLInputElement | null {
  return (fieldRef.value?.$el?.querySelector('input') as HTMLInputElement) || null
}

function syncNativeAttrs() {
  const input = nativeInput()
  if (!input) return
  for (const name of NATIVE_ATTRS) {
    const value = attrs[name]
    if (value === undefined || value === null || value === false) {
      input.removeAttribute(name)
    } else {
      input.setAttribute(name, value === true ? '' : String(value))
    }
  }
}

onMounted(syncNativeAttrs)
watch(() => [props.type, attrs], syncNativeAttrs, { deep: true })

function clampNumber(value: number): number {
  const min = attrs.min !== undefined ? Number(attrs.min) : undefined
  const max = attrs.max !== undefined ? Number(attrs.max) : undefined
  let next = value
  if (min !== undefined && Number.isFinite(min) && next < min) next = min
  if (max !== undefined && Number.isFinite(max) && next > max) next = max
  return next
}

function update(val: string) {
  let value: string | number = val
  if (props.modelModifiers?.trim) value = (value as string).trim()
  if (props.modelModifiers?.number || props.type === 'number') {
    if (val === '' || val === null) {
      emit('update:modelValue', props.type === 'number' ? null : '')
      return
    }
    const number = parseFloat(val)
    if (!Number.isNaN(number)) value = clampNumber(number)
  }
  emit('update:modelValue', value)
}
</script>

<style scoped>
.ui-input :deep(.v-field) {
  border-radius: 6px;
}
</style>
