import { reactive } from 'vue'
// Only the top dialog owns keyboard focus, including a confirmation above an editor.
export const dialogStack = reactive<{ id: symbol; dismiss: () => void; suspend: () => void }[]>([])
let savedOverflow = ''
function hasOpenOverlayChild() {
  // Vuetify teleports select/menu/autocomplete overlays to an overlay container.
  // A visible menu overlay (not a dialog) means a dropdown is expanded and should
  // consume Escape itself, so the surrounding dialog must not close.
  const menus = document.querySelectorAll<HTMLElement>(
    '.v-overlay--active .v-list, .v-menu > .v-overlay__content, .v-overlay--active .v-select__content'
  )
  for (const el of menus) {
    const overlay = el.closest('.v-overlay')
    if (overlay && !overlay.classList.contains('ui-modal') && (el.offsetParent !== null || el.getClientRects().length > 0)) {
      return true
    }
  }
  return false
}

function escape(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !dialogStack.length) return
  // Let an expanded Vuetify select/menu close itself first.
  if (hasOpenOverlayChild()) return
  event.preventDefault()
  event.stopImmediatePropagation()
  dialogStack[dialogStack.length - 1].dismiss()
}
export function addDialog(id: symbol, dismiss: () => void, suspend: () => void) {
  dialogStack[dialogStack.length - 1]?.suspend()
  if (!dialogStack.length) {
    savedOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', escape, true)
  }
  dialogStack.push({ id, dismiss, suspend })
}
export function removeDialog(id: symbol) {
  const index = dialogStack.findIndex((dialog) => dialog.id === id)
  if (index !== -1) dialogStack.splice(index, 1)
  if (!dialogStack.length) {
    document.body.style.overflow = savedOverflow
    document.removeEventListener('keydown', escape, true)
  }
}
