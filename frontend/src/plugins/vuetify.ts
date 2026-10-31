import { createVuetify, type ThemeDefinition } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import 'vuetify/styles'

// MDUI 2 / Material Design 2 (Classic) light & dark palettes. The primary color
// is overridden at runtime by useTheme.ts; these are the initial defaults.
const md2Light: ThemeDefinition = {
  dark: false,
  colors: {
    background: '#f4f5f7',
    surface: '#ffffff',
    'surface-bright': '#ffffff',
    'surface-variant': '#eceff1',
    'on-surface-variant': '#4a4a4a',
    primary: '#1976d2',
    'primary-darken-1': '#1565c0',
    secondary: '#455a64',
    success: '#2e7d32',
    info: '#0288d1',
    warning: '#f57c00',
    error: '#d32f2f',
    'on-primary': '#ffffff',
    'on-surface': '#1d1d1f',
    'on-background': '#1d1d1f',
  },
  variables: {
    'border-color': '#000000',
    'border-opacity': 0.08,
    'theme-on-surface': '#1d1d1f',
  },
}

const md2Dark: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#121417',
    surface: '#1b1e23',
    'surface-bright': '#262a30',
    'surface-variant': '#2a2e34',
    'on-surface-variant': '#c7c9cc',
    primary: '#64b5f6',
    'primary-darken-1': '#42a5f5',
    secondary: '#90a4ae',
    success: '#81c784',
    info: '#4fc3f7',
    warning: '#ffb74d',
    error: '#e57373',
    'on-primary': '#0a1929',
    'on-surface': '#e6e7e9',
    'on-background': '#e6e7e9',
  },
  variables: {
    'border-color': '#ffffff',
    'border-opacity': 0.08,
    'theme-on-surface': '#e6e7e9',
  },
}

export const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: 'md2Light',
    themes: {
      md2Light,
      md2Dark,
    },
  },
  defaults: {
    // Vuetify-default shape (border-radius root) with MD2 comfortable density.
    // Rounding is intentionally left at Vuetify's defaults per the design brief.
    global: {
      ripple: true,
    },
    VCard: {
      variant: 'elevated',
    },
    VBtn: {
      variant: 'flat',
      style: 'text-transform:none;font-weight:600;letter-spacing:0.01em;',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
      color: 'primary',
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
      color: 'primary',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
      color: 'primary',
    },
    VAutocomplete: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
      color: 'primary',
    },
    VCheckbox: {
      density: 'comfortable',
      hideDetails: 'auto',
      color: 'primary',
    },
    VList: {
      density: 'comfortable',
    },
    VNavigationDrawer: {
      color: 'surface',
    },
    VAppBar: {
      flat: true,
    },
  },
})

export default vuetify
