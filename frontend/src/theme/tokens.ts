// Kimolo Mail theme: change the look here. Colours are the kimolo.dev purple palette
// (converted from oklch, since Naive UI derives hover/pressed shades from hex).
import type { GlobalThemeOverrides } from 'naive-ui'

export const palette = {
  dark: {
    bg: '#110c1d',
    surface: '#1b132a',
    raised: '#221934',
    field: '#0d0816',
    line: '#3c3153',
    lineSoft: '#29213c',
    text: '#f0ecf7',
    muted: '#aea6c1',
    faint: '#847b95',
    accent: '#c6a0ff',
    accentHover: '#d3b5ff',
    accentPressed: '#b688fe',
    accentSoft: 'rgba(198, 160, 255, 0.12)',
    onAccent: '#1a1029',
    error: '#fd7277',
    warning: '#f9b64f',
    success: '#6ed889',
    info: '#a6a3f7',
    glow: 'rgba(150, 70, 255, 0.22)',
    grid: 'rgba(205, 170, 255, 0.06)',
    segment: '#3c3153',
    switchOn: '#7a4cc0',
    switchOff: '#3c3153',
    secondary: 'rgba(205, 170, 255, 0.08)',
    secondaryHover: 'rgba(205, 170, 255, 0.14)',
  },
  light: {
    bg: '#fbf9fe',
    surface: '#ffffff',
    raised: '#f6f4fb',
    field: '#ffffff',
    line: '#e0dbea',
    lineSoft: '#ece9f2',
    text: '#1d162a',
    muted: '#615971',
    faint: '#898296',
    accent: '#8044cb',
    accentHover: '#935edf',
    accentPressed: '#6e34b3',
    accentSoft: 'rgba(128, 68, 203, 0.09)',
    onAccent: '#ffffff',
    error: '#d02b31',
    warning: '#be7100',
    success: '#1c8742',
    info: '#6358ba',
    glow: 'rgba(150, 90, 230, 0.10)',
    grid: 'rgba(110, 60, 180, 0.05)',
    segment: '#ffffff',
    switchOn: '#8044cb',
    switchOff: '#8d86a0',
    secondary: 'rgba(128, 68, 203, 0.07)',
    secondaryHover: 'rgba(128, 68, 203, 0.12)',
  },
} as const

export type Mode = keyof typeof palette

export const radius = { sm: '8px', md: '12px', lg: '16px', pill: '999px' }
export const space = { 1: '4px', 2: '8px', 3: '12px', 4: '16px', 5: '24px', 6: '32px', 7: '48px' }
export const font = {
  display: "'Bricolage Grotesque', system-ui, sans-serif",
  body: "'Albert Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",
  mono: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
  // type scale
  sm: '13px', md: '15px', lg: '17px', xl: '22px', xxl: '30px',
}
export const layout = { maxWidth: '1240px', control: '40px', controlLarge: '46px' }

export const themeOverrides = (mode: Mode): GlobalThemeOverrides => {
  const c = palette[mode]
  const set = (name: string, base: string, hover: string, pressed: string) => ({
    [`${name}Color`]: base, [`${name}ColorHover`]: hover, [`${name}ColorPressed`]: pressed, [`${name}ColorSuppl`]: hover,
  })
  return {
    common: {
      ...set('primary', c.accent, c.accentHover, c.accentPressed),
      ...set('info', c.info, c.info, c.info),
      ...set('success', c.success, c.success, c.success),
      ...set('warning', c.warning, c.warning, c.warning),
      ...set('error', c.error, c.error, c.error),
      bodyColor: c.bg,
      cardColor: c.surface,
      modalColor: c.raised,
      popoverColor: c.raised,
      tableColor: c.surface,
      tableColorStriped: c.raised,
      tableHeaderColor: c.raised,
      inputColor: c.field,
      actionColor: c.raised,
      hoverColor: c.accentSoft,
      borderColor: c.line,
      dividerColor: c.lineSoft,
      textColorBase: c.text,
      textColor1: c.text,
      textColor2: c.text,
      textColor3: c.muted,
      placeholderColor: c.faint,
      fontFamily: font.body,
      fontFamilyMono: font.mono,
      fontSize: font.md,
      fontSizeMedium: font.md,
      fontSizeLarge: font.lg,
      borderRadius: radius.md,
      borderRadiusSmall: radius.sm,
      heightMedium: layout.control,
      heightLarge: layout.controlLarge,
    },
    Button: { fontWeight: '600', colorSecondary: c.secondary, colorSecondaryHover: c.secondaryHover, colorSecondaryPressed: c.secondaryHover, textColorPrimary: c.onAccent, textColorHoverPrimary: c.onAccent, textColorPressedPrimary: c.onAccent, textColorFocusPrimary: c.onAccent },
    Card: { color: c.surface, colorEmbedded: c.surface, colorModal: c.raised, borderColor: c.lineSoft, borderRadius: radius.lg, titleFontWeight: '700', titleFontSizeMedium: font.lg },
    Layout: { color: 'transparent', headerColor: 'transparent' },
    List: { color: 'transparent', colorHover: c.accentSoft, borderColor: c.lineSoft },
    Tabs: { tabFontWeightActive: '700', tabTextColorActiveCard: c.accent, tabColor: 'transparent', tabBorderColor: c.lineSoft, colorSegment: c.raised, tabColorSegment: c.segment, tabBorderRadius: radius.md },
    Tag: { borderRadius: radius.sm },
    Switch: { railColor: c.switchOff, railColorActive: c.switchOn },
    Alert: { borderRadius: radius.md },
    Dialog: { borderRadius: radius.lg },
    Drawer: { color: c.surface },
    Menu: { itemTextColorActiveHorizontal: c.accent, itemTextColorHoverHorizontal: c.accent },
  }
}

// The same tokens as CSS variables, for hand-written styles (set on <html>).
export const cssVars = (mode: Mode): Record<string, string> => {
  const c = palette[mode]
  const vars: Record<string, string> = {}
  for (const [k, v] of Object.entries(c)) vars[`--km-${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}`] = v
  for (const [k, v] of Object.entries(radius)) vars[`--km-radius-${k}`] = v
  for (const [k, v] of Object.entries(space)) vars[`--km-space-${k}`] = v
  vars['--km-font-display'] = font.display
  vars['--km-font-body'] = font.body
  vars['--km-font-mono'] = font.mono
  vars['--km-max-width'] = layout.maxWidth
  return vars
}
