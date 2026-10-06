// Fills src/icons/ with SVG replacements for ayu's PNG-only icons, taken from
// open icon collections on GitHub. Never overwrites a file that is already
// there, so hand-picked icons always win; delete a file to fetch it again.
// Writes src/icons/SOURCES.md with origin and license of every icon.
//
// Needs ImageMagick (to check that a logo is visible on ayu Dark).
import * as ayu from 'ayu'
import { icons } from 'ayu/icons'
import { out } from './shared.ts'

type Source = 'logos' | 'simple' | 'vscode' | 'material'

const SOURCES: Record<Source, { repo: string; branch: string; dir: string; prefix: string; license: string }> = {
  logos: { repo: 'gilbarbara/logos', branch: 'main', dir: 'logos', prefix: '', license: 'CC0 1.0' },
  simple: { repo: 'simple-icons/simple-icons', branch: 'develop', dir: 'icons', prefix: '', license: 'CC0 1.0' },
  vscode: { repo: 'vscode-icons/vscode-icons', branch: 'master', dir: 'icons', prefix: 'file_type_', license: 'MIT' },
  material: {
    repo: 'material-extensions/vscode-material-icon-theme',
    branch: 'main',
    dir: 'icons',
    prefix: '',
    license: 'MIT'
  }
}

// Candidates per ayu icon id, best first. The first one that is visible on a
// dark background and roughly square wins.
const CANDIDATES: Record<string, [Source, string][]> = {
  actionscript: [['vscode', 'actionscript'], ['material', 'actionscript']],
  applescript: [['vscode', 'applescript'], ['material', 'applescript']],
  cf: [['vscode', 'cf'], ['material', 'coldfusion']],
  circleci: [['material', 'circleci'], ['simple', 'circleci'], ['vscode', 'circleci']],
  eslint: [['logos', 'eslint'], ['material', 'eslint'], ['vscode', 'eslint']],
  julia: [['material', 'julia'], ['vscode', 'julia'], ['logos', 'julia']],
  ocaml: [['material', 'ocaml'], ['vscode', 'ocaml'], ['logos', 'ocaml']],
  R: [['logos', 'r-lang'], ['material', 'r'], ['vscode', 'r']],
  scala: [['material', 'scala'], ['vscode', 'scala'], ['simple', 'scala']],
  ai: [['material', 'adobe-illustrator'], ['logos', 'adobe-illustrator']],
  psd: [['material', 'adobe-photoshop'], ['logos', 'adobe-photoshop']],
  clojure: [['logos', 'clojure']],
  coffeescript: [['logos', 'coffeescript'], ['vscode', 'coffeescript']],
  dlang: [['vscode', 'dlang'], ['simple', 'd']],
  dotnet: [['logos', 'dotnet']],
  elm: [['logos', 'elm']],
  erlang: [['logos', 'erlang']],
  ex: [['logos', 'elixir'], ['material', 'elixir'], ['simple', 'elixir']],

  lisp: [['vscode', 'lisp'], ['material', 'lisp'], ['simple', 'commonlisp']],
  lsl: [['vscode', 'lsl']],
  lua: [['logos', 'lua'], ['material', 'lua'], ['simple', 'lua']],
  matlab: [['material', 'matlab'], ['vscode', 'matlab']],
  nsis: [['vscode', 'nsi'], ['simple', 'nsis']],

  powershell: [['logos', 'powershell'], ['material', 'powershell']],
  puppet: [['logos', 'puppet-icon'], ['logos', 'puppet']],

  reasonml: [['logos', 'reasonml-icon'], ['logos', 'reasonml']],
  riot: [['logos', 'riot']],

  stata: [['vscode', 'stata']],
  tcl: [['vscode', 'tcl'], ['material', 'tcl']],
  vim: [['logos', 'vim']],
  html: [['logos', 'html-5']],
  jsp: [['logos', 'java']],
  jsx: [['logos', 'react']],
  less: [['material', 'less'], ['logos', 'less'], ['vscode', 'less']],
  postcss: [['logos', 'postcss']],
  stylus: [['logos', 'stylus'], ['vscode', 'stylus']],
  blade: [['logos', 'laravel']],
  haml: [['logos', 'haml']],
  mustache: [['vscode', 'mustache']],
  pug: [['logos', 'pug']],
  slim: [['vscode', 'slim'], ['material', 'slim']],
  twig: [['vscode', 'twig'], ['material', 'twig']],
  plist: [['material', 'xml'], ['vscode', 'xml']],
  sql: [['material', 'database'], ['vscode', 'sql']],
  apache: [['vscode', 'apache'], ['simple', 'apache']],
  babel: [['logos', 'babel']],
  bower: [['logos', 'bower']],

  composer: [['logos', 'composer']],
  docker: [['logos', 'docker-icon'], ['logos', 'docker']],
  editorconfig: [['logos', 'editorconfig'], ['vscode', 'editorconfig']],

  gradle: [['logos', 'gradle'], ['vscode', 'gradle']],
  gulpfile: [['logos', 'gulp']],
  jest: [['logos', 'jest']],
  nginx: [['logos', 'nginx']],
  nodejs: [['logos', 'nodejs-icon'], ['logos', 'nodejs']],
  rails: [['logos', 'rails'], ['vscode', 'rails']],
  stylelint: [['logos', 'stylelint'], ['vscode', 'stylelint']],
  sublime: [['logos', 'sublimetext-icon'], ['logos', 'sublimetext']],
  webpack: [['logos', 'webpack']],
  yarn: [['logos', 'yarn']],
  ae: [['logos', 'adobe-after-effects']],

  audio: [['material', 'audio']],
  indesign: [['logos', 'adobe-indesign']],
  maya: [['simple', 'autodeskmaya']],
  pdf: [['material', 'pdf'], ['vscode', 'pdf']],
  premiere: [['logos', 'adobe-premiere']],

  video: [['material', 'video']],
  excel: [['vscode', 'excel']],
  log: [['material', 'log']],
  markup: [['material', 'xml']],
  onenote: [['vscode', 'onenote']],
  powerpoint: [['vscode', 'powerpoint'], ['material', 'powerpoint']],
  tex: [['material', 'tex'], ['simple', 'latex']],
  text: [['material', 'document']],
  textile: [['vscode', 'textile']],
  todo: [['material', 'todo']],
  word: [['vscode', 'word'], ['material', 'word']],
  accdb: [['vscode', 'access']],
  archive: [['material', 'zip']],
  lock: [['material', 'lock']],
  preferences: [['material', 'tune']],
  settings: [['material', 'settings']],
  windows: [['logos', 'microsoft-windows-icon'], ['logos', 'microsoft-windows']]
}

const dir = out('src/icons/')
const exists = (path: string) => {
  try {
    Deno.statSync(path)
    return true
  } catch {
    return false
  }
}

const getJson = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.json()
}

// File lists of all sources, to skip candidates that don't exist.
const available = new Map<Source, Set<string>>()
for (const [name, s] of Object.entries(SOURCES) as [Source, (typeof SOURCES)[Source]][]) {
  const tree = await getJson(`https://api.github.com/repos/${s.repo}/git/trees/${s.branch}?recursive=1`)
  const re = new RegExp(`^${s.dir}/${s.prefix}([^/]+)\\.svg$`)
  available.set(name, new Set(tree.tree.map((t: { path: string }) => t.path.match(re)?.[1]).filter(Boolean)))
}

// Simple Icons are one-color; paint them in their brand color.
const slug = (title: string) =>
  title.toLowerCase().replace(/\+/g, 'plus').replace(/\./g, 'dot').replace(/&/g, 'and').replace(/[^a-z0-9]/g, '')
const brand = new Map<string, string>()
for (const icon of await getJson(`https://raw.githubusercontent.com/simple-icons/simple-icons/develop/data/simple-icons.json`)) {
  brand.set(icon.slug ?? slug(icon.title), icon.hex)
}

const luminance = (r: number, g: number, b: number) => {
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * lin(r / 255) + 0.7152 * lin(g / 255) + 0.0722 * lin(b / 255)
}

// Lightens a dark brand color until it reads on ayu Dark.
const brightEnough = (hex: string) => {
  let [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16))
  while (luminance(r, g, b) < 0.2) [r, g, b] = [r, g, b].map((c) => Math.round(c + (255 - c) * 0.1))
  return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')
}

const download = async (source: Source, name: string) => {
  const s = SOURCES[source]
  const url = `https://raw.githubusercontent.com/${s.repo}/${s.branch}/${s.dir}/${s.prefix}${name}.svg`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  let svg = await res.text()
  if (source === 'simple') svg = svg.replace('<svg ', `<svg fill="${brightEnough(brand.get(name) ?? 'bfbdb6')}" `)
  return { svg, url: `https://github.com/${s.repo}/blob/${s.branch}/${s.dir}/${s.prefix}${name}.svg` }
}

// Renders the SVG on ayu Dark and checks it can be seen and isn't too wide.
const SIZE = 64
const inspect = async (svg: string) => {
  const child = new Deno.Command('magick', {
    args: ['-background', 'none', '-density', '300', 'svg:-', '-resize', `${SIZE}x${SIZE}`, '-gravity', 'center',
      '-extent', `${SIZE}x${SIZE}`, '-depth', '8', 'rgba:-'],
    stdin: 'piped',
    stdout: 'piped',
    stderr: 'null'
  }).spawn()
  const writer = child.stdin.getWriter()
  await writer.write(new TextEncoder().encode(svg))
  await writer.close()
  const { success, stdout } = await child.output()
  if (!success || stdout.length !== SIZE * SIZE * 4) return { visible: false, square: false }
  const [bgR, bgG, bgB] = ayu.dark.ui.bg.rgb()
  let opaque = 0, bright = 0, minX = SIZE, maxX = 0, minY = SIZE, maxY = 0
  for (let i = 0; i < SIZE * SIZE; i++) {
    const a = stdout[i * 4 + 3] / 255
    if (a < 0.5) continue
    const [r, g, b] = [0, 1, 2].map((c) => stdout[i * 4 + c] * a + [bgR, bgG, bgB][c] * (1 - a))
    opaque++
    if (luminance(r, g, b) > 0.05) bright++
    const x = i % SIZE, y = Math.floor(i / SIZE)
    ;[minX, maxX, minY, maxY] = [Math.min(minX, x), Math.max(maxX, x), Math.min(minY, y), Math.max(maxY, y)]
  }
  const ratio = (maxX - minX + 1) / (maxY - minY + 1)
  // Mostly bright, or a dark badge with enough bright detail (e.g. Adobe's squares).
  const visible = opaque > 60 && (bright / opaque >= 0.4 || bright >= 400)
  return { visible, square: ratio <= 1.8 && ratio >= 0.55 }
}

// Keeps rows for icons added by hand.
const sourcesFile = `${dir}SOURCES.md`
const rows = new Map<string, string>()
if (exists(sourcesFile)) {
  for (const line of Deno.readTextFileSync(sourcesFile).split('\n')) {
    const name = line.match(/^\| `([^`]+)\.svg` \|/)?.[1]
    if (name) rows.set(name, line)
  }
}

const pngOnly = Object.keys(icons.files).filter((id) =>
  JSON.stringify(icons.files[id as keyof typeof icons.files]).includes('.png')
)
const fetched: string[] = [], kept: string[] = [], missing: string[] = []

for (const id of pngOnly) {
  if (exists(`${dir}${id}.svg`)) {
    kept.push(id)
    if (!rows.has(id)) rows.set(id, `| \`${id}.svg\` | added by hand (source unknown) | ? |`)
    continue
  }
  let chosen: { svg: string; url: string; source: Source } | undefined
  let fallback: typeof chosen
  for (const [source, name] of CANDIDATES[id] ?? []) {
    if (!available.get(source)!.has(name)) continue
    const { svg, url } = await download(source, name)
    const { visible, square } = await inspect(svg)
    if (!visible) continue
    if (square) {
      chosen = { svg, url, source }
      break
    }
    fallback ??= { svg, url, source }
  }
  chosen ??= fallback
  if (!chosen) {
    missing.push(id)
    continue
  }
  Deno.writeTextFileSync(`${dir}${id}.svg`, chosen.svg)
  const s = SOURCES[chosen.source]
  rows.set(id, `| \`${id}.svg\` | [${s.repo}](${chosen.url}) | ${s.license} |`)
  fetched.push(id)
}

Deno.writeTextFileSync(
  sourcesFile,
  `# Icon sources

Where each SVG in this folder comes from. Brand logos remain trademarks of their owners.

| File | Source | License |
| --- | --- | --- |
${[...rows.keys()].sort((a, b) => a.localeCompare(b)).map((k) => rows.get(k)).join('\n')}
`
)

console.log(`fetched ${fetched.length}, kept ${kept.length} existing, none found for ${missing.length}`)
if (missing.length) console.log(`still PNG: ${missing.join(', ')}`)
