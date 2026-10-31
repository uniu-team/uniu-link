<template>
  <v-dialog
    :model-value="open"
    :width="modalWidth"
    scrollable
    :persistent="busy"
    :retain-focus="false"
    :scrim="true"
    :aria-label="title"
    class="ui-modal"
    @update:model-value="handleShowUpdate"
    @keydown="handleKeydown"
    @after-leave="handleClosed"
  >
    <v-card class="ui-modal-card" :aria-label="title">
      <div v-if="title" class="ui-modal-header">
        <h2 class="ui-modal-title">{{ title }}</h2>
        <UiButton
          variant="ghost"
          size="icon"
          :disabled="busy"
          aria-label="关闭对话框"
          title="关闭"
          @click="requestClose"
        >
          <NavIcon name="close" :size="16" />
        </UiButton>
      </div>
      <div class="ui-modal-content" :data-modal-id="modalId">
        <slot />
      </div>
      <div v-if="$slots.footer" class="ui-modal-footer">
        <slot name="footer" />
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, provide, watch } from 'vue'
import NavIcon from '@/components/NavIcon.vue'
import UiButton from './UiButton.vue'
import { addDialog, dialogStack, removeDialog } from '@/composables/useDialogStack'
import { formBusyKey } from '@/composables/useField'

const props = withDefaults(
  defineProps<{
    open: boolean
    title?: string
    width?: string
    busy?: boolean
    beforeClose?: () => Promise<boolean>
  }>(),
  { width: '640px' }
)

const emit = defineEmits<{ 'update:open': [value: boolean]; save: [] }>()

const id = Symbol('dialog')
const modalId = `modal-${Math.random().toString(36).slice(2, 9)}`
const topmost = computed(() => dialogStack[dialogStack.length - 1]?.id === id)
const modalWidth = computed(() => `min(${props.width || '640px'}, calc(100vw - 32px))`)

provide(
  formBusyKey,
  computed(() => !!props.busy)
)

let closing = false
let previousFocus: HTMLElement | null = null

function dialogEl(): HTMLElement | null {
  return document.querySelector(`[data-modal-id="${modalId}"]`)?.closest('.v-overlay__content') as HTMLElement | null
}

function handleKeydown(event: KeyboardEvent) {
  saveShortcut(event)
  if (event.key === 'Tab') {
    const el = dialogEl()
    if (!el) return
    const focusable = el.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"], a[href]'
    )
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      last.focus()
      event.preventDefault()
    } else if (!event.shiftKey && document.activeElement === last) {
      first.focus()
      event.preventDefault()
    } else if (!el.contains(document.activeElement)) {
      first.focus()
      event.preventDefault()
    }
  }
}

function saveShortcut(event: KeyboardEvent) {
  if (event.key.toLowerCase() === 's' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault()
    if (!props.busy) emit('save')
  }
}

async function requestClose() {
  if (props.busy || closing) return
  closing = true
  try {
    if (!props.beforeClose || (await props.beforeClose())) emit('update:open', false)
  } finally {
    closing = false
  }
}

function handleShowUpdate(val: boolean) {
  if (!val) void requestClose()
}

function handleClosed() {
  if (previousFocus?.isConnected) previousFocus.focus()
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      previousFocus = document.activeElement as HTMLElement | null
      addDialog(
        id,
        () => {
          void requestClose()
        },
        () => {}
      )
      await nextTick()
      const el = dialogEl()
      if (el && !el.contains(document.activeElement)) {
        const focusable = el.querySelector<HTMLElement>(
          'input:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]'
        )
        focusable?.focus()
      }
    } else {
      removeDialog(id)
      await nextTick()
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  },
  { immediate: true, flush: 'post' }
)

onBeforeUnmount(() => {
  removeDialog(id)
  if (previousFocus?.isConnected) previousFocus.focus()
})
</script>

<style scoped>
.ui-modal-card {
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 48px);
}
.ui-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--color-outline-variant, rgba(0, 0, 0, 0.08));
}
.ui-modal-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}
.ui-modal-content {
  padding: 18px 20px;
  overflow-y: auto;
  line-height: 1.5;
}
.ui-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px 16px;
  border-top: 1px solid var(--color-outline-variant, rgba(0, 0, 0, 0.08));
}
</style>
