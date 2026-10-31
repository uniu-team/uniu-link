<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import NavIcon from './NavIcon.vue'
import type { MessageType } from '@/composables/useFeedback'

const props = withDefaults(
  defineProps<{ message: string; type?: MessageType; duration?: number }>(),
  { type: 'success' }
)
const emit = defineEmits<{ close: [] }>()
let remaining = props.duration ?? (props.type === 'success' ? 3500 : 8000)
let timer: ReturnType<typeof setTimeout> | undefined
let started = 0
let hovered = false
let focused = false

function resume() {
  if (hovered || focused || timer !== undefined || props.duration === 0) return
  started = performance.now()
  timer = setTimeout(() => {
    timer = undefined
    emit('close')
  }, remaining)
}
function pause() {
  if (timer === undefined) return
  clearTimeout(timer)
  timer = undefined
  remaining = Math.max(0, remaining - (performance.now() - started))
}
function mouseEnter() {
  hovered = true
  pause()
}
function mouseLeave() {
  hovered = false
  resume()
}
function focusIn() {
  focused = true
  pause()
}
function focusOut(event: FocusEvent) {
  if (
    event.relatedTarget instanceof Node &&
    (event.currentTarget as HTMLElement).contains(event.relatedTarget)
  )
    return
  focused = false
  resume()
}
onMounted(resume)
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div
    class="message-item md3-snackbar"
    @mouseenter="mouseEnter"
    @mouseleave="mouseLeave"
    @focusin="focusIn"
    @focusout="focusOut"
  >
    <div class="message-content md3-snackbar-content">
      <span class="message-symbol" :class="`message-symbol-${type}`">
        <NavIcon :name="type" :size="18" />
      </span>
      <span
        class="message-text"
        :role="type === 'error' ? 'alert' : 'status'"
        aria-atomic="true"
      >
        {{ message }}
      </span>
      <v-btn
        variant="text"
        icon
        size="x-small"
        aria-label="关闭消息"
        title="关闭消息"
        class="ml-auto"
        @click="emit('close')"
      >
        <NavIcon name="close" :size="16" />
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.md3-snackbar {
  background-color: var(--color-surface-container-highest, #e9e0e3);
  border: 1px solid var(--color-outline-variant, #d5c2c8);
  border-radius: var(--md-shape-lg, 16px);
  box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
  overflow: hidden;
  transition: all 0.2s ease;
}

:root[data-theme='dark'] .md3-snackbar {
  background-color: var(--color-surface-container-highest, #36343b);
  border-color: var(--color-outline-variant, #4f4348);
  box-shadow: 0 12px 32px -4px rgba(0, 0, 0, 0.45);
}

.md3-snackbar-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  min-width: 280px;
  max-width: 480px;
}
</style>
