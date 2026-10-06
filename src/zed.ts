// Zed extension: color themes and icon theme in zed/.
import * as ayu from 'ayu'
import { getIconFile, icons } from 'ayu/icons'
import { encodeBase64 } from '@std/encoding/base64'
import {
  AUTHOR,
  cleanDir,
  type Color,
  hex,
  NAME,
  out,
  REPOSITORY,
  type Scheme,
  SLUG,
  type Variant,
  VERSION,
  vivid,
  writeJson,
  writeText
} from './shared.ts'

// Zed's terminal ignores alpha in ANSI colors, so dimmed variants are
// pre-composited onto the background instead of left translucent.
const dim = (c: Color, bg: Color) => c.alpha(0.7).blend(bg).hex()

const status = (key: string, c: Color) => ({
  [key]: hex(c),
  [`${key}.background`]: c.alpha(0.1).hex(),
  [`${key}.border`]: c.alpha(0.4).hex()
})

const style = (font_style: string | null = null, font_weight: number | null = null) => ({ font_style, font_weight })
const hl = (c: Color, font_style: string | null = null, font_weight: number | null = null) => ({
  color: hex(c),
  ...style(font_style, font_weight)
})

// Zed resolves a capture like `punctuation.embedded.markup` to the longest
// matching key prefix (`punctuation.embedded`, then `punctuation`), so the
// keys below are tuned to the capture names Zed's built-in queries emit.

const syntax = (s: Scheme) => {
  const fg = s.editor.fg
  // Comments stay muted; every other syntax color gets the vividness boost.
  const x = Object.fromEntries(
    Object.entries(s.syntax).map(([k, c]) => [k, k === 'comment' ? c : vivid(c)])
  ) as Scheme['syntax']
  const accent = vivid(s.common.accent.tint)
  const vcs = { added: vivid(s.vcs.added), removed: vivid(s.vcs.removed) }
  return {
    // Rust `#[...]`; Sublime colors these as `variable.annotation`.
    'attribute': hl(x.special),
    'attribute.jsx': hl(x.func),
    'boolean': hl(accent),
    'comment': hl(x.comment, 'italic'),
    'comment.doc': hl(x.comment, 'italic'),
    // Zed tags SCREAMING_CASE usages as `constant`, which Sublime scopes as
    // `constant.other`.
    'constant': hl(x.regexp),
    'constant.builtin': hl(accent),
    'constructor': hl(x.entity),
    'diff.minus': hl(vcs.removed),
    'diff.plus': hl(vcs.added),
    'embedded': hl(fg),
    'emphasis': hl(x.markup, 'italic'),
    'emphasis.strong': hl(x.markup, null, 700),
    'enum': hl(x.entity),
    'function': hl(x.func),
    'function.builtin': hl(x.markup),
    'function.special': hl(x.markup),
    'hint': hl(x.comment),
    'keyword': hl(x.keyword),
    'keyword.operator': hl(x.operator),
    'label': hl(x.keyword),
    'lifetime': hl(x.keyword),
    'link_text': hl(x.entity),
    'link_uri': hl(x.entity),
    'namespace': hl(fg),
    'number': hl(accent),
    'operator': hl(x.operator),
    'predictive': hl(s.ui.fg, 'italic'),
    'preproc': hl(x.keyword),
    'primary': hl(fg),
    'property': hl(fg),
    'property.json_key': hl(x.tag),
    'punctuation': hl(fg.alpha(0.7)),
    'punctuation.bracket': hl(fg),
    'punctuation.delimiter': hl(fg.alpha(0.7)),
    'punctuation.embedded': hl(x.regexp),
    'punctuation.list_marker': hl(x.func),
    'punctuation.markup': hl(x.comment),
    'punctuation.special': hl(x.special),
    'selector': hl(x.entity),
    'selector.pseudo': hl(x.func),
    'string': hl(x.string),
    'string.escape': hl(x.regexp),
    'string.regex': hl(x.regexp),
    'string.special': hl(x.regexp),
    'string.special.symbol': hl(x.string),
    'tag': hl(x.tag),
    'text.literal': { ...hl(x.operator), background_color: fg.alpha(0.06).hex() },
    'title': hl(x.string, null, 700),
    'type': hl(x.entity),
    'type.builtin': hl(x.tag),
    'variable': hl(fg),
    'variable.parameter': hl(x.constant),
    'variable.special': hl(x.tag, 'italic'),
    'variant': hl(x.constant)
  }
}

const terminal = (s: Scheme) => {
  const t = s.terminal
  const bg = s.editor.bg
  // Dark/mirage palettes define bright black identical to black, which would
  // make autosuggestions and dimmed CLI output invisible.
  const brightBlack = t.brightBlack.hex() === t.black.hex() ? s.ui.fg : t.brightBlack
  const ansi = {
    black: [t.black, brightBlack],
    red: [t.red, t.brightRed],
    green: [t.green, t.brightGreen],
    yellow: [t.yellow, t.brightYellow],
    blue: [t.blue, t.brightBlue],
    magenta: [t.magenta, t.brightMagenta],
    cyan: [t.cyan, t.brightCyan],
    white: [t.white, t.brightWhite]
  } as const

  const colors: Record<string, string> = {
    'terminal.background': hex(bg),
    'terminal.ansi.background': hex(bg),
    'terminal.foreground': hex(s.editor.fg),
    'terminal.bright_foreground': hex(s.editor.fg),
    'terminal.dim_foreground': dim(s.editor.fg, bg)
  }
  for (const [name, [normal, bright]] of Object.entries(ansi)) {
    colors[`terminal.ansi.${name}`] = hex(normal)
    colors[`terminal.ansi.bright_${name}`] = hex(bright)
    colors[`terminal.ansi.dim_${name}`] = dim(normal, bg)
  }
  return colors
}

export const theme = (s: Scheme, variant: Variant) => {
  const { ui, editor, vcs, common } = s
  const accent = common.accent.tint
  const transparent = '#00000000'
  const players = [
    { cursor: hex(accent), background: hex(accent), selection: hex(editor.selection.active) },
    ...[s.syntax.entity, s.syntax.constant, s.syntax.string, s.syntax.tag, s.syntax.keyword, s.syntax.markup, s.syntax.regexp]
      .map((c) => ({ cursor: hex(c), background: hex(c), selection: c.alpha(0.25).hex() }))
  ]

  return {
    name: `${NAME} ${variant[0].toUpperCase()}${variant.slice(1)}`,
    appearance: variant === 'light' ? 'light' : 'dark',
    style: {
      'background.appearance': 'opaque',
      'accents': [s.syntax.entity, s.syntax.func, s.syntax.constant, s.syntax.string, s.syntax.tag, s.syntax.keyword].map(hex),

      'border': hex(ui.line),
      'border.variant': hex(ui.line),
      'border.focused': accent.alpha(0.5).hex(),
      'border.selected': accent.alpha(0.5).hex(),
      'border.transparent': transparent,
      'border.disabled': hex(ui.line),

      'background': hex(ui.bg),
      'surface.background': hex(ui.bg),
      'elevated_surface.background': hex(ui.popup.bg),

      'element.background': hex(ui.panel.bg),
      'element.hover': hex(ui.selection.normal),
      'element.active': hex(ui.selection.active),
      'element.selected': hex(ui.selection.active),
      'element.disabled': hex(ui.panel.bg),
      'element.selection_background': hex(editor.selection.active),
      'ghost_element.background': transparent,
      'ghost_element.hover': hex(ui.selection.normal),
      'ghost_element.active': hex(ui.selection.active),
      'ghost_element.selected': hex(ui.selection.active),
      'ghost_element.disabled': transparent,
      'drop_target.background': accent.alpha(0.1).hex(),
      'drop_target.border': hex(accent),

      'text': hex(editor.fg),
      'text.muted': hex(ui.fg),
      'text.placeholder': ui.fg.alpha(0.6).hex(),
      'text.disabled': ui.fg.alpha(0.5).hex(),
      'text.accent': hex(accent),
      'icon': hex(ui.fg),
      'icon.muted': ui.fg.alpha(0.6).hex(),
      'icon.disabled': ui.fg.alpha(0.4).hex(),
      'icon.placeholder': ui.fg.alpha(0.6).hex(),
      'icon.accent': hex(accent),
      'link_text.hover': hex(s.syntax.entity),
      'debugger.accent': hex(common.error),

      'title_bar.background': hex(ui.bg),
      'title_bar.inactive_background': hex(ui.bg),
      'status_bar.background': hex(ui.bg),
      'toolbar.background': hex(editor.bg),
      'tab_bar.background': hex(ui.bg),
      'tab.inactive_background': hex(ui.bg),
      'tab.active_background': hex(editor.bg),
      'panel.background': hex(ui.bg),
      'panel.focused_border': null,
      'panel.indent_guide': hex(editor.indentGuide.normal),
      'panel.indent_guide_active': hex(editor.indentGuide.active),
      'panel.indent_guide_hover': hex(editor.indentGuide.active),
      'panel.overlay_background': hex(ui.popup.bg),
      'panel.overlay_hover': hex(ui.selection.normal),
      'pane.focused_border': null,
      'pane_group.border': hex(ui.line),

      'scrollbar.thumb.background': ui.fg.alpha(0.3).hex(),
      'scrollbar.thumb.hover_background': ui.fg.alpha(0.5).hex(),
      'scrollbar.thumb.active_background': ui.fg.alpha(0.6).hex(),
      'scrollbar.thumb.border': transparent,
      'scrollbar.track.background': transparent,
      'scrollbar.track.border': transparent,
      'minimap.thumb.background': ui.fg.alpha(0.15).hex(),
      'minimap.thumb.hover_background': ui.fg.alpha(0.25).hex(),
      'minimap.thumb.active_background': ui.fg.alpha(0.3).hex(),
      'minimap.thumb.border': transparent,

      'search.match_background': hex(editor.findMatch.inactive),
      'search.active_match_background': hex(editor.findMatch.active),

      'editor.foreground': hex(editor.fg),
      'editor.background': hex(editor.bg),
      'editor.gutter.background': hex(editor.bg),
      'editor.subheader.background': hex(ui.panel.bg),
      'editor.active_line.background': hex(editor.line),
      'editor.highlighted_line.background': hex(editor.line),
      'editor.debugger_active_line.background': s.syntax.func.alpha(0.1).hex(),
      'editor.line_number': hex(editor.lineNumber.normal),
      'editor.active_line_number': hex(editor.lineNumber.active),
      'editor.hover_line_number': hex(editor.lineNumber.active),
      'editor.invisible': editor.fg.alpha(0.3).hex(),
      'editor.wrap_guide': hex(editor.indentGuide.normal),
      'editor.active_wrap_guide': hex(editor.indentGuide.active),
      'editor.indent_guide': hex(editor.indentGuide.normal),
      'editor.indent_guide_active': hex(editor.indentGuide.active),
      'editor.document_highlight.read_background': hex(editor.selection.inactive),
      'editor.document_highlight.write_background': hex(editor.selection.inactive),
      'editor.document_highlight.bracket_background': editor.lineNumber.active.alpha(0.3).hex(),

      ...terminal(s),

      'version_control.added': vcs.added.alpha(0.7).hex(),
      'version_control.modified': vcs.modified.alpha(0.7).hex(),
      'version_control.deleted': vcs.removed.alpha(0.7).hex(),
      'version_control.renamed': hex(vcs.modified),
      'version_control.conflict': hex(s.syntax.keyword),
      'version_control.ignored': ui.fg.alpha(0.6).hex(),
      'version_control.word_added': vcs.added.alpha(0.25).hex(),
      'version_control.word_deleted': vcs.removed.alpha(0.25).hex(),
      'version_control.conflict_marker.ours': vcs.added.alpha(0.15).hex(),
      'version_control.conflict_marker.theirs': s.syntax.entity.alpha(0.15).hex(),

      ...status('conflict', s.syntax.keyword),
      ...status('created', vcs.added),
      ...status('deleted', vcs.removed),
      ...status('error', common.error),
      ...status('hidden', ui.fg.alpha(0.6)),
      ...status('hint', s.syntax.comment),
      ...status('ignored', ui.fg.alpha(0.6)),
      ...status('info', s.syntax.entity),
      ...status('modified', vcs.modified),
      ...status('predictive', ui.fg),
      ...status('renamed', s.syntax.entity),
      ...status('success', vcs.added),
      ...status('unreachable', ui.fg),
      ...status('warning', s.syntax.func),

      players,
      syntax: syntax(s)
    }
  }
}


// ---------- Icons ----------

const iconSourceDir = new URL('../icons/', import.meta.resolve('ayu/icons')).pathname
const sourceFiles = [...Deno.readDirSync(iconSourceDir)].map((e) => e.name)
const baseName = (file: string) => file.replace(/@[23]x/, '').replace(/\.(png|svg)$/, '')

// Raster-only icons are wrapped in an SVG; Zed's resvg build has `raster-images` enabled.
// Hand-picked SVGs that replace ayu's PNG-only icons: src/icons/<icon id>.svg.
const overrideDir = out('src/icons/')
const overrides = new Set(
  [...Deno.readDirSync(overrideDir)].map((e) => e.name).filter((f) => f.endsWith('.svg')).map((f) => f.slice(0, -4))
)
const usedOverrides = new Set<string>()

const toSvg = (file: string) => {
  if (file.startsWith(overrideDir)) return Deno.readTextFileSync(file)
  if (file.endsWith('.svg')) return Deno.readTextFileSync(iconSourceDir + file)
  const png = sourceFiles
    .filter((f) => f.endsWith('.png') && baseName(f) === baseName(file))
    .sort((a, b) => b.length - a.length)[0]
  const data = encodeBase64(Deno.readFileSync(iconSourceDir + png))
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><image width="32" height="32" href="data:image/png;base64,${data}"/></svg>`
}

const writeIcon = (name: string, file: string, written: Map<string, string>) => {
  const target = `icons/${name}.svg`
  if (!written.has(file)) {
    Deno.writeTextFileSync(out(`zed/${target}`), toSvg(file))
    written.set(file, target)
  }
  return `./${written.get(file)}`
}

const iconTheme = (appearance: 'dark' | 'light', written: Map<string, string>) => {
  const file_icons: Record<string, { path: string }> = {
    default: { path: writeIcon('default', icons.default, written) }
  }
  for (const id of Object.keys(icons.files)) {
    const ayuFile = getIconFile(id, appearance)
    if (!ayuFile) continue
    const name = baseName(ayuFile).replace(/^file_type_/, '')
    const override = ayuFile.endsWith('.png') && overrides.has(id)
    if (override) usedOverrides.add(id)
    file_icons[id] = { path: writeIcon(name, override ? `${overrideDir}${id}.svg` : ayuFile, written) }
  }
  const folder = icons.folder[appearance]
  return {
    name: appearance === 'dark' ? `${NAME} Icons` : `${NAME} Icons Light`,
    appearance,
    directory_icons: {
      collapsed: writeIcon(`folder_${appearance}`, folder.collapsed, written),
      expanded: writeIcon(`folder_open_${appearance}`, folder.expanded, written)
    },
    file_stems: icons.filenames,
    file_suffixes: icons.extensions,
    file_icons
  }
}

// Zed on macOS hands theme colors to the display without color management, so
// on Display P3 screens the hex values come out more saturated than in
// color-managed apps. That vivid look is the default; pass `--p3` to re-encode
// colors so Zed shows the exact (calmer) sRGB values instead.
const toDisplayP3 = (hexColor: string) => {
  const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)
  // Linear sRGB -> linear Display P3 (shared D65 white point).
  const m = [
    [0.8224621, 0.177538, 0.0000000],
    [0.0331941, 0.9668058, 0.0000000],
    [0.0170827, 0.0723974, 0.9105199]
  ]
  const [r, g, b] = [1, 3, 5].map((i) => toLinear(parseInt(hexColor.slice(i, i + 2), 16) / 255))
  const p3 = m.map(([x, y, z]) => toGamma(x * r + y * g + z * b))
  const byte = (c: number) => Math.round(Math.min(1, Math.max(0, c)) * 255).toString(16).padStart(2, '0')
  return '#' + p3.map(byte).join('') + hexColor.slice(7)
}

const convertColors = (value: unknown): unknown => {
  if (typeof value === 'string') return /^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(value) ? toDisplayP3(value) : value
  if (Array.isArray(value)) return value.map(convertColors)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, convertColors(v)]))
  }
  return value
}

export type ZedTheme = ReturnType<typeof theme>

export const build = () => {
  const colorSpace = Deno.args.includes('--p3') ? convertColors : (v: unknown) => v
  for (const dir of ['zed/themes', 'zed/icon_themes', 'zed/icons']) cleanDir(dir)
  // Ship the licenses with the extension (the MIT icons require their notice).
  writeText('zed/LICENSE', Deno.readTextFileSync(out('LICENSE')))
  writeText('zed/THIRD-PARTY-NOTICES.md', Deno.readTextFileSync(out('src/icons/NOTICES.md')))

  const variants: Variant[] = ['dark', 'mirage', 'light']
  writeText(
    'zed/extension.toml',
    `id = "${SLUG}"
name = "${NAME}"
version = "${VERSION}"
schema_version = 1
authors = ["${AUTHOR}"]
description = "ayu Dark, Mirage and Light with punchier syntax colors, plus ayu file icons. Based on ayu by Ike Ku."
repository = "${REPOSITORY}"
`
  )

  writeJson(`zed/themes/${SLUG}.json`, {
    $schema: 'https://zed.dev/schema/themes/v0.2.0.json',
    name: NAME,
    author: AUTHOR,
    themes: variants.map((v) => colorSpace(theme(ayu[v], v)))
  })

  const written = new Map<string, string>()
  writeJson(`zed/icon_themes/${SLUG}.json`, {
    $schema: 'https://zed.dev/schema/icon_themes/v0.3.0.json',
    name: `${NAME} Icons`,
    author: AUTHOR,
    themes: [iconTheme('dark', written), iconTheme('light', written)]
  })

  const unknown = [...overrides].filter((id) => !usedOverrides.has(id))
  if (unknown.length) console.warn(`src/icons: not a PNG-only ayu icon, ignored: ${unknown.join(', ')}`)
  return `zed: ${variants.length} themes (${colorSpace === convertColors ? 'P3-corrected' : 'vivid'}), ` +
    `${written.size} icons (${usedOverrides.size} from src/icons)`
}
