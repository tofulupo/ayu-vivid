// Vim / Neovim colorscheme in vim/.
import * as ayu from 'ayu'
import { channels, type Scheme, SLUG, solid, srgbToOklab, writeText } from './shared.ts'
import { theme, type ZedTheme } from './zed.ts'

// Nearest xterm-256 color (16-255; 0-15 depend on the terminal's palette).
const xterm256 = (() => {
  const levels = [0, 95, 135, 175, 215, 255]
  const list: [number, number[]][] = []
  for (let i = 0; i < 216; i++) {
    list.push([16 + i, [levels[Math.floor(i / 36)], levels[Math.floor(i / 6) % 6], levels[i % 6]]])
  }
  for (let i = 0; i < 24; i++) list.push([232 + i, [8 + i * 10, 8 + i * 10, 8 + i * 10]])
  return list.map(([n, rgb]) => [n, srgbToOklab(rgb.map((v) => v / 255))] as const)
})()
const cterm = (hexColor: string) => {
  const [L, A, B] = srgbToOklab(channels(hexColor).slice(0, 3))
  let best = 16, bestDist = Infinity
  for (const [n, [l, a, b]] of xterm256) {
    const d = (L - l) ** 2 + (A - a) ** 2 + (B - b) ** 2
    if (d < bestDist) [best, bestDist] = [n, d]
  }
  return best
}

type Hl = { fg?: string; bg?: string; sp?: string; attr?: string[] }

const vimHi = (group: string, h: Hl) => {
  const attr = h.attr?.length ? h.attr.join(',') : 'NONE'
  return [
    `hi ${group}`,
    `guifg=${h.fg ?? 'NONE'}`,
    `guibg=${h.bg ?? 'NONE'}`,
    `guisp=${h.sp ?? 'NONE'}`,
    `gui=${attr}`,
    `cterm=${attr}`,
    `ctermfg=${h.fg ? cterm(h.fg) : 'NONE'}`,
    `ctermbg=${h.bg ? cterm(h.bg) : 'NONE'}`
  ].join(' ')
}

const vimTheme = (s: Scheme, z: ZedTheme) => {
  type Syn = { color: string; font_style: string | null; font_weight: number | null; background_color?: string }
  const st = z.style as unknown as Record<string, string>
  const sx = z.style.syntax as unknown as Record<string, Syn>
  const bg = st['editor.background']
  const c = (key: string, base = bg) => solid(st[key], base)
  const float = s.editor.fg.alpha(0.06).blend(s.ui.panel.bg).hex()
  const fg = c('text')
  const muted = c('text.muted')
  const accent = c('text.accent')
  const border = c('border')

  // Syntax colors come from the Zed theme's syntax keys, styles included.
  const sy = (key: string, extra: string[] = []): Hl => {
    const h = sx[key]
    const attr = [...extra]
    if (h.font_style === 'italic') attr.push('italic')
    if ((h.font_weight ?? 0) >= 700) attr.push('bold')
    return { fg: solid(h.color, bg), bg: h.background_color && solid(h.background_color, bg), attr }
  }
  const status = (key: string) => ({ fg: c(key), bg: c(`${key}.background`) })
  const curl = (key: string): Hl => ({ sp: c(key), attr: ['undercurl'] })

  const groups: [string, Hl][] = [
    // Base
    ['Normal', { fg, bg }],
    ['NormalFloat', { fg, bg: float }],
    ['FloatBorder', { fg: border, bg: float }],
    ['FloatTitle', { fg, bg: float, attr: ['bold'] }],
    ['NonText', { fg: c('editor.invisible') }],
    ['SpecialKey', { fg: c('editor.invisible') }],
    ['Whitespace', { fg: c('editor.invisible') }],
    ['EndOfBuffer', { fg: bg }],
    ['Conceal', { fg: muted }],

    // Syntax
    ['Comment', sy('comment')],
    ['Constant', sy('constant')],
    ['String', sy('string')],
    ['Character', sy('string')],
    ['Number', sy('number')],
    ['Boolean', sy('boolean')],
    ['Float', sy('number')],
    ['Identifier', sy('variable')],
    ['Function', sy('function')],
    ['Statement', sy('keyword')],
    ['Conditional', sy('keyword')],
    ['Repeat', sy('keyword')],
    ['Label', sy('label')],
    ['Operator', sy('operator')],
    ['Keyword', sy('keyword')],
    ['Exception', sy('keyword')],
    ['PreProc', sy('preproc')],
    ['Include', sy('keyword')],
    ['Define', sy('keyword')],
    ['Macro', sy('function.special')],
    ['PreCondit', sy('preproc')],
    ['Type', sy('type')],
    ['StorageClass', sy('keyword')],
    ['Structure', sy('type')],
    ['Typedef', sy('type')],
    ['Special', sy('punctuation.special')],
    ['SpecialChar', sy('string.escape')],
    ['Tag', sy('tag')],
    ['Delimiter', sy('punctuation')],
    ['SpecialComment', sy('comment.doc')],
    ['Debug', sy('function')],
    ['Underlined', { ...sy('link_uri'), attr: ['underline'] }],
    ['Ignore', { fg: bg }],
    ['Error', { fg: c('error'), attr: ['bold'] }],
    ['Todo', { fg: accent, attr: ['bold'] }],

    // Cursor / gutter
    ['Cursor', { fg: bg, bg: accent }],
    ['lCursor', { fg: bg, bg: accent }],
    ['CursorIM', { fg: bg, bg: accent }],
    ['CursorLine', { bg: c('editor.active_line.background') }],
    ['CursorColumn', { bg: c('editor.active_line.background') }],
    ['ColorColumn', { bg: c('editor.active_line.background') }],
    ['CursorLineNr', { fg: c('editor.active_line_number') }],
    ['LineNr', { fg: c('editor.line_number') }],
    ['SignColumn', { fg: c('editor.line_number'), bg }],
    ['FoldColumn', { fg: c('editor.line_number'), bg }],
    ['Folded', { fg: muted, bg: c('editor.active_line.background') }],

    // Selection / search
    ['Visual', { bg: solid(z.style.players[0].selection, bg) }],
    ['VisualNOS', { bg: solid(z.style.players[0].selection, bg) }],
    ['Search', { bg: c('search.match_background') }],
    ['IncSearch', { fg: bg, bg: accent }],
    ['CurSearch', { fg: bg, bg: accent }],
    ['Substitute', { fg: bg, bg: accent }],
    ['MatchParen', { bg: c('editor.document_highlight.bracket_background'), attr: ['bold'] }],
    ['QuickFixLine', { bg: solid(z.style.players[0].selection, bg) }],

    // Chrome
    ['StatusLine', { fg, bg: float }],
    ['StatusLineNC', { fg: muted, bg: c('status_bar.background') }],
    ['TabLine', { fg: muted, bg: c('tab.inactive_background') }],
    ['TabLineSel', { fg, bg: c('tab.active_background'), attr: ['bold'] }],
    ['TabLineFill', { bg: c('tab_bar.background') }],
    ['VertSplit', { fg: border, bg }],
    ['WinSeparator', { fg: border, bg }],
    ['WinBar', { fg, bg }],
    ['WinBarNC', { fg: muted, bg }],
    ['Pmenu', { fg, bg: float }],
    ['PmenuSel', { fg, bg: solid(st['element.selected'], float), attr: ['bold'] }],
    ['PmenuSbar', { bg: float }],
    ['PmenuThumb', { bg: solid(st['scrollbar.thumb.background'], float) }],
    ['PmenuMatch', { fg: accent, bg: float, attr: ['bold'] }],
    ['PmenuMatchSel', { fg: accent, bg: solid(st['element.selected'], float), attr: ['bold'] }],
    ['WildMenu', { fg, bg: solid(st['element.selected'], float), attr: ['bold'] }],
    ['Directory', sy('type')],
    ['Title', sy('title')],

    // Diff / VCS
    ['DiffAdd', { bg: solid(s.vcs.added.alpha(0.15).hex(), bg) }],
    ['DiffChange', { bg: solid(s.vcs.modified.alpha(0.1).hex(), bg) }],
    ['DiffText', { bg: solid(s.vcs.modified.alpha(0.25).hex(), bg), attr: ['bold'] }],
    ['DiffDelete', { fg: c('version_control.deleted'), bg: solid(s.vcs.removed.alpha(0.1).hex(), bg) }],
    ['diffAdded', sy('diff.plus')],
    ['diffRemoved', sy('diff.minus')],
    ['diffChanged', { fg: c('modified') }],
    ['diffFile', sy('keyword')],
    ['diffLine', sy('type')],
    ['Added', { fg: c('version_control.added') }],
    ['Changed', { fg: c('version_control.modified') }],
    ['Removed', { fg: c('version_control.deleted') }],
    ['GitGutterAdd', { fg: c('version_control.added') }],
    ['GitGutterChange', { fg: c('version_control.modified') }],
    ['GitGutterDelete', { fg: c('version_control.deleted') }],
    ['GitSignsAdd', { fg: c('version_control.added') }],
    ['GitSignsChange', { fg: c('version_control.modified') }],
    ['GitSignsDelete', { fg: c('version_control.deleted') }],

    // Spelling
    ['SpellBad', curl('error')],
    ['SpellCap', curl('info')],
    ['SpellRare', curl('hint')],
    ['SpellLocal', curl('hint')],

    // Messages
    ['ErrorMsg', { fg: c('error') }],
    ['WarningMsg', { fg: c('warning') }],
    ['MoreMsg', { fg: c('info') }],
    ['Question', { fg: c('success') }],
    ['ModeMsg', { fg: c('success') }],

    // Jinja2 / ansible-vim: {{ }} vars get the template-interpolation color,
    // {% %} tags and the {{ }} braces read as keywords.
    ['jinjaVarBlock', sy('punctuation.special')],
    ['jinjaVariable', sy('punctuation.special')],
    ['jinjaAttribute', sy('punctuation.special')],
    ['jinjaVarDelim', sy('keyword')],
    ['jinjaFilter', sy('function')],
    ['jinjaTagBlock', sy('keyword')],
    ['jinjaTagDelim', sy('keyword')],
    ['jinjaStatement', sy('keyword')],
    ['jinjaOperator', sy('operator')],
    ['jinjaComment', sy('comment')],
    ['jinjaString', sy('string')],
    ['jinjaNumber', sy('number')],
    ['ansibleModule', sy('string')],
    ['ansibleArgument', sy('string')],
    ['ansibleVariable', sy('string')],
    ['ansibleOption', sy('string')],

    // YAML
    ['yamlString', sy('string')],
    ['yamlFlowString', sy('string')],
    ['yamlSingleQuoted', sy('string')],
    ['yamlDoubleQuoted', sy('string')],
    ['yamlPlainScalar', sy('string')],
    ['yamlBlockString', sy('string')],
    ['yamlBlockScalarHeader', sy('type', ['italic'])],
    ['yamlAnchorName', sy('type')],
    ['yamlAlias', sy('type')],
    ['yamlComment', sy('comment')]
  ]

  // Neovim tree-sitter captures, matched to the Zed capture of the same
  // meaning. Old capture names are included for Neovim < 0.10.
  const ts: [string, string, string[]?][] = [
    ['@comment', 'comment'],
    ['@comment.documentation', 'comment.doc'],
    ['@string', 'string'],
    ['@string.escape', 'string.escape'],
    ['@string.regexp', 'string.regex'],
    ['@string.regex', 'string.regex'],
    ['@string.special', 'string.special'],
    ['@string.special.symbol', 'string.special.symbol'],
    ['@string.special.url', 'link_uri', ['underline']],
    ['@character', 'string'],
    ['@character.special', 'string.escape'],
    ['@number', 'number'],
    ['@number.float', 'number'],
    ['@float', 'number'],
    ['@boolean', 'boolean'],
    ['@constant', 'constant'],
    ['@constant.builtin', 'constant.builtin'],
    ['@constant.macro', 'constant'],
    ['@function', 'function'],
    ['@function.call', 'function'],
    ['@function.method', 'function'],
    ['@function.method.call', 'function'],
    ['@method', 'function'],
    ['@method.call', 'function'],
    ['@function.builtin', 'function.builtin'],
    ['@function.macro', 'function.special'],
    ['@constructor', 'constructor'],
    ['@keyword', 'keyword'],
    ['@keyword.function', 'keyword'],
    ['@keyword.return', 'keyword'],
    ['@keyword.conditional', 'keyword'],
    ['@keyword.repeat', 'keyword'],
    ['@keyword.exception', 'keyword'],
    ['@keyword.import', 'keyword'],
    ['@keyword.operator', 'keyword.operator'],
    ['@keyword.directive', 'preproc'],
    ['@conditional', 'keyword'],
    ['@repeat', 'keyword'],
    ['@include', 'keyword'],
    ['@exception', 'keyword'],
    ['@operator', 'operator'],
    ['@type', 'type'],
    ['@type.builtin', 'type.builtin'],
    ['@type.definition', 'type'],
    ['@variable', 'variable'],
    ['@variable.builtin', 'variable.special'],
    ['@variable.parameter', 'variable.parameter'],
    ['@variable.member', 'property'],
    ['@parameter', 'variable.parameter'],
    ['@field', 'property'],
    ['@property', 'property'],
    ['@module', 'namespace'],
    ['@namespace', 'namespace'],
    ['@label', 'label'],
    ['@attribute', 'attribute'],
    ['@punctuation', 'punctuation'],
    ['@punctuation.bracket', 'punctuation.bracket'],
    ['@punctuation.delimiter', 'punctuation.delimiter'],
    ['@punctuation.special', 'punctuation.special'],
    ['@tag', 'tag'],
    ['@tag.attribute', 'attribute.jsx'],
    ['@tag.delimiter', 'punctuation'],
    ['@markup.heading', 'title'],
    ['@markup.italic', 'emphasis'],
    ['@markup.strong', 'emphasis.strong'],
    ['@markup.strikethrough', 'comment', ['strikethrough']],
    ['@markup.raw', 'text.literal'],
    ['@markup.link', 'link_text'],
    ['@markup.link.url', 'link_uri', ['underline']],
    ['@markup.list', 'punctuation.list_marker'],
    ['@markup.quote', 'string.regex', ['italic']],
    ['@text.title', 'title'],
    ['@text.literal', 'text.literal'],
    ['@text.uri', 'link_uri', ['underline']],
    ['@diff.plus', 'diff.plus'],
    ['@diff.minus', 'diff.minus']
  ]

  const nvim: [string, Hl][] = [
    ...ts.map(([group, key, extra]): [string, Hl] => [group, sy(key, extra)]),
    ['TermCursor', { fg: bg, bg: accent }],
    ['DiagnosticError', { fg: c('error') }],
    ['DiagnosticWarn', { fg: c('warning') }],
    ['DiagnosticInfo', { fg: c('info') }],
    ['DiagnosticHint', { fg: c('hint') }],
    ['DiagnosticOk', { fg: c('success') }],
    ['DiagnosticVirtualTextError', status('error')],
    ['DiagnosticVirtualTextWarn', status('warning')],
    ['DiagnosticVirtualTextInfo', status('info')],
    ['DiagnosticVirtualTextHint', status('hint')],
    ['DiagnosticUnderlineError', curl('error')],
    ['DiagnosticUnderlineWarn', curl('warning')],
    ['DiagnosticUnderlineInfo', curl('info')],
    ['DiagnosticUnderlineHint', curl('hint')],
    ['LspReferenceText', { bg: c('editor.document_highlight.read_background') }],
    ['LspReferenceRead', { bg: c('editor.document_highlight.read_background') }],
    ['LspReferenceWrite', { bg: c('editor.document_highlight.write_background') }],
    ['LspInlayHint', { fg: c('text.placeholder') }],
    ['LspSignatureActiveParameter', { attr: ['bold', 'underline'] }]
  ]

  const ansi = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']
  const terminal = [...ansi.map((n) => `terminal.ansi.${n}`), ...ansi.map((n) => `terminal.ansi.bright_${n}`)]
    .map((key) => `'${c(key)}'`)

  return `" ${z.name} for Vim and Neovim (truecolor, with 256-color fallback).
" Generated by build.ts from the ${z.name} Zed theme. Don't edit by hand.

hi clear
if exists('syntax_on')
  syntax reset
endif
let g:colors_name = '${SLUG}-dark'
set background=dark
if has('termguicolors')
  set termguicolors
endif

${groups.map(([g, h]) => vimHi(g, h)).join('\n')}

" Let Jinja highlight inside YAML block strings (ansible-vim). This only
" affects the buffer that is current when the colorscheme loads.
syn clear yamlBlockString
syn region yamlBlockString start=/^\\z(\\s\\+\\)/ skip=/^$/ end=/^\\%(\\z1\\)\\@!/ contained contains=@jinja

if has('nvim')
${nvim.map(([g, h]) => '  ' + vimHi(g, h)).join('\n')}

  let s:ansi = [${terminal.join(', ')}]
  for s:i in range(16)
    let g:terminal_color_{s:i} = s:ansi[s:i]
  endfor
else
  let g:terminal_ansi_colors = [${terminal.join(', ')}]
endif
`
}


export const build = () => {
  writeText(`vim/${SLUG}-dark.vim`, vimTheme(ayu.dark, theme(ayu.dark, 'dark')))
  return 'vim: colorscheme'
}
