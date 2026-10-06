// COSMIC desktop theme and COSMIC Terminal color scheme in cosmic/.
import * as ayu from 'ayu'
import { channels, type Color, hex, oklabToSrgb, type Scheme, SLUG, srgbToOklab, toHex, vivid, writeText } from './shared.ts'
import { theme, type ZedTheme } from './zed.ts'

const ronFloat = (v: number) => v.toFixed(4).replace(/0+$/, '').replace(/\.$/, '.0')

// The struct form is understood by every COSMIC release; hex strings only by newer ones.
const ronSrgba = (hexColor: string) => {
  const [r, g, b, a] = channels(hexColor).map(ronFloat)
  return `(red: ${r}, green: ${g}, blue: ${b}, alpha: ${a})`
}
const ronSrgb = (hexColor: string) => {
  const [r, g, b] = channels(hexColor).map(ronFloat)
  return `(red: ${r}, green: ${g}, blue: ${b})`
}

// COSMIC's neutral_0..10 run from black to white; these follow the default
// palette's lightness steps, tinted with ayu's blue-gray.
const neutralRamp = (tint: Color) => {
  const [, a, b] = srgbToOklab(tint.rgb().map((v) => v / 255))
  const chroma = Math.min(Math.hypot(a, b), 0.02)
  const hue = Math.atan2(b, a)
  return [0, 0.06, 0.19, 0.29, 0.39, 0.49, 0.6, 0.7, 0.8, 0.9, 1].map((L, i) => {
    const c = i === 0 || i === 10 ? 0 : chroma
    return toHex(oklabToSrgb([L, c * Math.cos(hue), c * Math.sin(hue)]))
  })
}

const cosmicTheme = (s: Scheme) => {
  const { ui, editor, common, palette } = s
  const accent = hex(common.accent.tint)
  const red = hex(vivid(s.syntax.markup))
  const green = hex(vivid(s.syntax.string))
  const orange = hex(vivid(s.syntax.keyword))
  const secondary = editor.fg.alpha(0.06).blend(ui.panel.bg).hex()
  const neutrals = neutralRamp(ui.fg)

  const paletteColors: [string, string][] = [
    ['bright_red', red],
    ['bright_green', green],
    ['bright_orange', orange],
    ['gray_1', hex(ui.bg)],
    ['gray_2', hex(ui.panel.bg)],
    ...neutrals.map((c, i): [string, string] => [`neutral_${i}`, c]),
    ['accent_blue', hex(vivid(s.syntax.entity))],
    ['accent_indigo', hex(vivid(s.syntax.tag))],
    ['accent_purple', hex(vivid(s.syntax.constant))],
    ['accent_pink', hex(palette.red.l3)],
    ['accent_red', red],
    ['accent_orange', orange],
    ['accent_yellow', accent],
    ['accent_green', green],
    ['accent_warm_grey', hex(editor.fg)],
    ['ext_warm_grey', hex(s.syntax.special)],
    ['ext_orange', hex(vivid(s.syntax.func))],
    ['ext_yellow', hex(palette.yellow.l5)],
    ['ext_blue', hex(vivid(s.syntax.regexp))],
    ['ext_purple', hex(palette.purple.l2)],
    ['ext_pink', hex(vivid(s.syntax.operator))],
    ['ext_indigo', hex(palette.blue.l2)]
  ]

  return `(
    palette: Dark((
        name: "${SLUG}-dark",
${paletteColors.map(([k, c]) => `        ${k}: ${ronSrgba(c)},`).join('\n')}
    )),
    spacing: (
        space_none: 0,
        space_xxxs: 4,
        space_xxs: 8,
        space_xs: 12,
        space_s: 16,
        space_m: 24,
        space_l: 32,
        space_xl: 48,
        space_xxl: 64,
        space_xxxl: 128,
    ),
    corner_radii: (
        radius_0: (0.0, 0.0, 0.0, 0.0),
        radius_xs: (4.0, 4.0, 4.0, 4.0),
        radius_s: (8.0, 8.0, 8.0, 8.0),
        radius_m: (16.0, 16.0, 16.0, 16.0),
        radius_l: (32.0, 32.0, 32.0, 32.0),
        radius_xl: (160.0, 160.0, 160.0, 160.0),
    ),
    neutral_tint: Some(${ronSrgb(hex(ui.fg))}),
    bg_color: Some(${ronSrgba(hex(ui.bg))}),
    primary_container_bg: Some(${ronSrgba(hex(ui.panel.bg))}),
    secondary_container_bg: Some(${ronSrgba(secondary)}),
    text_tint: Some(${ronSrgb(hex(editor.fg))}),
    accent: Some(${ronSrgb(accent)}),
    success: Some(${ronSrgb(green)}),
    warning: Some(${ronSrgb(orange)}),
    destructive: Some(${ronSrgb(hex(common.error))}),
    is_frosted: false,
    gaps: (0, 8),
    active_hint: 3,
    window_hint: Some(${ronSrgb(accent)}),
)
`
}

// Reads the terminal colors straight from the generated Zed theme so both match.
const cosmicTerminal = (zedTheme: ZedTheme) => {
  const z = zedTheme.style as unknown as Record<string, string>
  const c = (key: string) => `"${z[key].slice(0, 7).toUpperCase()}"`
  const ansi = (prefix: string) =>
    ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']
      .map((name) => `        ${name}: ${c(`terminal.ansi.${prefix}${name}`)},`)
      .join('\n')
  return `(
    name: "${zedTheme.name}",
    foreground: ${c('terminal.foreground')},
    background: ${c('terminal.background')},
    cursor: "${zedTheme.style.players[0].cursor.slice(0, 7).toUpperCase()}",
    bright_foreground: ${c('terminal.bright_foreground')},
    dim_foreground: ${c('terminal.dim_foreground')},
    normal: (
${ansi('')}
    ),
    bright: (
${ansi('bright_')}
    ),
    dim: (
${ansi('dim_')}
    ),
)
`
}

export const build = () => {
  writeText(`cosmic/${SLUG}-dark.ron`, cosmicTheme(ayu.dark))
  writeText(`cosmic/${SLUG}-dark-terminal.ron`, cosmicTerminal(theme(ayu.dark, 'dark')))
  return 'cosmic: desktop theme, terminal scheme'
}
