import { computed, readonly, ref } from 'vue'
import vuetify from '@/plugins/vuetify'

export type ThemePreference = 'system' | 'light' | 'dark'

export interface ColorPreset {
  name: string
  value: string
}

// MDUI 2 / Material Design 2 classic preset palette.
export const colorPresets: ColorPreset[] = [
  { name: '经典科技蓝', value: '#1976d2' },
  { name: '极客青绿', value: '#009688' },
  { name: '罗兰紫韵', value: '#6200ee' },
  { name: '深海青', value: '#0288d1' },
  { name: '琥珀金', value: '#ffa000' },
  { name: '极简钛灰', value: '#455a64' },
  { name: '翡翠生机', value: '#2e7d32' },
  { name: '珊瑚绯红', value: '#d32f2f' },
]

export const defaultBrandColor = '#1976d2'
export const brandBlue = defaultBrandColor
// 兼容历史引用
export const brandPink = defaultBrandColor

const storageKey = 'uniulink-admin-theme'
const colorStorageKey = 'uniulink-theme-color'

const preference = ref<ThemePreference>('system')
const systemDark = ref(false)
const themeColor = ref<string>(defaultBrandColor)

export const themePreference = readonly(preference)
export const currentThemeColor = readonly(themeColor)

export const resolvedTheme = computed(() =>
  preference.value === 'system' ? (systemDark.value ? 'dark' : 'light') : preference.value
)

function clampHex(hex: string): string {
  const value = hex.trim()
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : defaultBrandColor
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = clampHex(hex).replace('#', '')
  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16),
  ]
}

function rgbToHex(r: number, g: number, b: number): string {
  const to = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}

// Lighten/darken a hex color by mixing with white/black. amount in [-1, 1].
function shade(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex)
  if (amount >= 0) {
    return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount)
  }
  const k = 1 + amount
  return rgbToHex(r * k, g * k, b * k)
}

function readableOn(hex: string): string {
  const [r, g, b] = hexToRgb(hex)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#0a1929' : '#ffffff'
}

const SHADE_LIGHTNESS: Record<string, number> = {
  '50': 0.9,
  '100': 0.78,
  '200': 0.6,
  '300': 0.42,
  '400': 0.22,
  '500': 0,
  '600': -0.12,
  '700': -0.24,
  '800': -0.36,
  '900': -0.48,
}

function emitBrandScale(hex: string) {
  const root = document.documentElement
  for (const [shadeKey, amount] of Object.entries(SHADE_LIGHTNESS)) {
    const [r, g, b] = hexToRgb(shade(hex, amount))
    root.style.setProperty(`--brand-rgb-${shadeKey}`, `${r} ${g} ${b}`)
  }
}

function applyVuetifyColors(dark: boolean) {
  const primary = dark ? shade(themeColor.value, 0.28) : themeColor.value
  const themeName = dark ? 'md2Dark' : 'md2Light'
  const target = vuetify.theme.themes.value[themeName]
  if (target) {
    target.colors.primary = primary
    target.colors['primary-darken-1'] = shade(primary, -0.1)
    target.colors['on-primary'] = readableOn(primary)
  }
  const themeApi = vuetify.theme as unknown as { change?: (name: string) => void; global: { name: { value: string } } }
  if (typeof themeApi.change === 'function') {
    themeApi.change(themeName)
  } else {
    themeApi.global.name.value = themeName
  }
}

function updateTheme(): void {
  const dark = resolvedTheme.value === 'dark'
  applyVuetifyColors(dark)
  emitBrandScale(themeColor.value)

  const root = document.documentElement
  root.classList.toggle('dark', dark)
  root.dataset.theme = resolvedTheme.value
  root.style.colorScheme = resolvedTheme.value

  const primary = dark ? shade(themeColor.value, 0.28) : themeColor.value
  // Native layout CSS variables tracked by the shell/layout styles.
  root.style.setProperty('--color-primary', primary)
  root.style.setProperty('--brand-primary', primary)
  root.style.setProperty('--brand-pink', primary)
  root.style.setProperty('--color-on-primary', readableOn(primary))
  root.style.setProperty('--v-primary-base', primary)

  if (dark) {
    root.style.setProperty('--page-background', '#121417')
    root.style.setProperty('--surface-subtle', '#1b1e23')
    root.style.setProperty('--color-body', '#121417')
    root.style.setProperty('--color-surface', '#1b1e23')
    root.style.setProperty('--color-surface-container-low', '#1b1e23')
    root.style.setProperty('--color-surface-container', '#20242a')
    root.style.setProperty('--color-surface-container-high', '#262a30')
    root.style.setProperty('--color-surface-container-highest', '#2c3138')
    root.style.setProperty('--color-surface-container-lowest', '#15181c')
    root.style.setProperty('--color-text', '#e6e7e9')
    root.style.setProperty('--color-outline', '#6c7177')
    root.style.setProperty('--color-outline-variant', 'rgba(255,255,255,0.12)')
    root.style.setProperty('--sidebar-background', '#171a1f')
    root.style.setProperty('--sidebar-border', 'rgba(255,255,255,0.09)')
    root.style.setProperty('--sidebar-text', '#c7c9cc')
    root.style.setProperty('--sidebar-strong', '#f3f4f6')
    root.style.setProperty('--sidebar-muted', '#8a9096')
    root.style.setProperty('--sidebar-hover', 'rgba(255,255,255,0.06)')
    root.style.setProperty('--sidebar-selected', shade(themeColor.value, -0.35))
    root.style.setProperty('--sidebar-account', '#20242a')
    root.style.setProperty('--accent-subtle', shade(themeColor.value, -0.4))
    root.style.setProperty('--message-success', '#81c784')
    root.style.setProperty('--message-error', '#e57373')
    root.style.setProperty('--message-warning', '#ffb74d')
  } else {
    root.style.setProperty('--page-background', '#f4f5f7')
    root.style.setProperty('--surface-subtle', '#f4f5f7')
    root.style.setProperty('--color-body', '#f4f5f7')
    root.style.setProperty('--color-surface', '#ffffff')
    root.style.setProperty('--color-surface-container-low', '#fbfbfc')
    root.style.setProperty('--color-surface-container', '#f4f5f7')
    root.style.setProperty('--color-surface-container-high', '#eceef1')
    root.style.setProperty('--color-surface-container-highest', '#e4e7eb')
    root.style.setProperty('--color-surface-container-lowest', '#ffffff')
    root.style.setProperty('--color-text', '#1d1d1f')
    root.style.setProperty('--color-outline', '#737880')
    root.style.setProperty('--color-outline-variant', 'rgba(0,0,0,0.08)')
    root.style.setProperty('--sidebar-background', '#ffffff')
    root.style.setProperty('--sidebar-border', 'rgba(0,0,0,0.08)')
    root.style.setProperty('--sidebar-text', '#43474e')
    root.style.setProperty('--sidebar-strong', '#1d1d1f')
    root.style.setProperty('--sidebar-muted', '#71757c')
    root.style.setProperty('--sidebar-hover', 'rgba(0,0,0,0.04)')
    root.style.setProperty('--sidebar-selected', shade(themeColor.value, 0.84))
    root.style.setProperty('--sidebar-account', '#f4f5f7')
    root.style.setProperty('--accent-subtle', shade(themeColor.value, 0.86))
    root.style.setProperty('--message-success', '#2e7d32')
    root.style.setProperty('--message-error', '#d32f2f')
    root.style.setProperty('--message-warning', '#f57c00')
  }
  root.style.setProperty('--color-on-primary-container', dark ? '#e6e7e9' : '#102a43')
}

export function setThemeColor(color: string): void {
  themeColor.value = clampHex(color)
  try {
    localStorage.setItem(colorStorageKey, themeColor.value)
  } catch {
    /* Storage fallback */
  }
  updateTheme()
}

export function setThemePreference(value: ThemePreference): void {
  preference.value = value
  try {
    localStorage.setItem(storageKey, value)
  } catch {
    /* Theme still works when storage is unavailable. */
  }
  updateTheme()
}

export function applyTheme(): void {
  const system = window.matchMedia('(prefers-color-scheme: dark)')
  systemDark.value = system.matches

  try {
    const savedTheme = localStorage.getItem(storageKey) || localStorage.getItem('theme')
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
      preference.value = savedTheme
    }
  } catch {
    /* Follow the system when storage is unavailable. */
  }

  try {
    const savedColor = localStorage.getItem(colorStorageKey)
    if (savedColor && savedColor.startsWith('#')) {
      themeColor.value = clampHex(savedColor)
    }
  } catch {
    /* Fallback */
  }

  const changed = (event: MediaQueryListEvent) => {
    systemDark.value = event.matches
    if (preference.value === 'system') updateTheme()
  }
  system.addEventListener('change', changed)
  if (import.meta.hot) import.meta.hot.dispose(() => system.removeEventListener('change', changed))
  updateTheme()
}

export function useTheme() {
  return {
    isDark: computed(() => resolvedTheme.value === 'dark'),
    themePreference,
    currentThemeColor,
    colorPresets,
    setThemePreference,
    setThemeColor,
  }
}
