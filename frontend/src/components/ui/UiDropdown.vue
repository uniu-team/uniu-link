<template>
  <span ref="trigger" class="dropdown-trigger">
    <v-menu v-model="open" location="bottom end" :offset="6" :close-on-content-click="true">
      <template #activator="{ props: activator }">
        <button
          v-bind="activator"
          type="button"
          class="dropdown-trigger-btn"
          :class="{ 'dropdown-trigger-btn--open': open }"
          aria-label="更多操作"
          title="更多操作"
          aria-haspopup="menu"
          :aria-expanded="open"
        >
          <NavIcon name="settings" :size="15" class="dropdown-trigger-icon" />
          <span class="dropdown-trigger-label">操作</span>
          <svg class="dropdown-trigger-caret" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </template>
      <v-list role="menu" density="compact" class="dropdown-menu" min-width="168">
        <slot />
      </v-list>
    </v-menu>
  </span>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'
import NavIcon from '@/components/NavIcon.vue'

const open = defineModel<boolean>('open', { default: false })
const trigger = ref<HTMLElement>()

function close(restore = false) {
  open.value = false
  if (restore) {
    const btn = trigger.value?.querySelector<HTMLElement>('button')
    btn?.focus()
  }
}

provide('close-action-menu', () => close(true))
</script>

<style scoped>
.dropdown-trigger {
  display: inline-flex;
}
.dropdown-trigger-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid var(--color-outline-variant, rgba(0, 0, 0, 0.14));
  background: var(--color-surface-container-high, rgba(0, 0, 0, 0.04));
  color: var(--sidebar-strong, #1d1d1f);
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  user-select: none;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease;
}
.dropdown-trigger-icon {
  opacity: 0.85;
}
.dropdown-trigger-caret {
  transition: transform 0.18s ease;
  opacity: 0.7;
}
.dropdown-trigger-btn:hover {
  border-color: var(--color-primary, #1976d2);
  color: var(--color-primary, #1976d2);
  background: color-mix(in srgb, var(--color-primary, #1976d2) 12%, transparent);
}
.dropdown-trigger-btn:focus-visible {
  outline: 2px solid var(--color-primary, #1976d2);
  outline-offset: 2px;
}
.dropdown-trigger-btn--open {
  border-color: var(--color-primary, #1976d2);
  color: var(--color-primary, #1976d2);
  background: color-mix(in srgb, var(--color-primary, #1976d2) 16%, transparent);
}
.dropdown-trigger-btn--open .dropdown-trigger-caret {
  transform: rotate(180deg);
}

/* Dark mode: brighter resting state so the button is clearly visible. */
:global(html[data-theme='dark']) .dropdown-trigger-btn {
  border-color: rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.06);
  color: #e6e7e9;
}
:global(html[data-theme='dark']) .dropdown-trigger-btn:hover,
:global(html[data-theme='dark']) .dropdown-trigger-btn--open {
  border-color: var(--color-primary, #64b5f6);
  color: var(--color-primary, #64b5f6);
  background: color-mix(in srgb, var(--color-primary, #64b5f6) 22%, transparent);
}

.dropdown-menu {
  border: 1px solid var(--color-outline-variant, rgba(0, 0, 0, 0.12));
  border-radius: 10px;
  padding: 6px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18);
}
:global(html[data-theme='dark']) .dropdown-menu {
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.5);
}
</style>
