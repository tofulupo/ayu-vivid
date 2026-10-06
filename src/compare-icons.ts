// Writes .compare/icons.html: the upstream ayu icons (what the Sublime theme
// shows, rendered from the same `ayu` package images) next to the icons the
// Zed build now uses. Run `deno task build` first.
import { getIconFile, icons } from 'ayu/icons'
import { encodeBase64 } from '@std/encoding/base64'
import { NAME, out, SLUG } from './shared.ts'

const ayuDir = new URL('../icons/', import.meta.resolve('ayu/icons')).pathname
const ayuFiles = [...Deno.readDirSync(ayuDir)].map((e) => e.name)
const baseName = (file: string) => file.replace(/@[23]x/, '').replace(/\.(png|svg)$/, '')

const dataUri = (path: string) =>
  `data:${path.endsWith('.svg') ? 'image/svg+xml' : 'image/png'};base64,${encodeBase64(Deno.readFileSync(path))}`

// Largest PNG variant, like the Sublime build used.
const upstream = (id: string) => {
  const file = id === 'default' ? icons.default : getIconFile(id, 'dark')!
  if (file.endsWith('.svg')) return { uri: dataUri(ayuDir + file), png: false }
  const png = ayuFiles.filter((f) => f.endsWith('.png') && baseName(f) === baseName(file)).sort((a, b) => b.length - a.length)[0]
  return { uri: dataUri(ayuDir + png), png: true }
}

const theme = JSON.parse(Deno.readTextFileSync(out(`zed/icon_themes/${SLUG}.json`))).themes[0]
const ours = (id: string) => dataUri(out(`zed/${theme.file_icons[id].path.replace(/^\.\//, '')}`))

const uses = (id: string) =>
  [
    ...Object.entries(icons.filenames).filter(([, v]) => v === id).map(([k]) => k),
    ...Object.entries(icons.extensions).filter(([, v]) => v === id).map(([k]) => '.' + k)
  ]

const sources = new Map<string, string>()
for (const line of Deno.readTextFileSync(out('src/icons/SOURCES.md')).split('\n')) {
  const m = line.match(/^\| `([^`]+)\.svg` \| \[([^\]]+)\]/)
  if (m) sources.set(m[1], m[2])
}

const ids = Object.keys(icons.files).filter((id) => theme.file_icons[id] && uses(id).length)
const card = (id: string) => {
  const up = upstream(id)
  const now = ours(id)
  const changed = sources.has(id)
  const files = uses(id).slice(0, 5).join(' ') + (uses(id).length > 5 ? ' …' : '')
  return `<div class="card${changed ? ' changed' : ''}">
  <div class="name">${id}</div>
  <div class="row"><span>Sublime${up.png ? ' (PNG)' : ''}</span><img src="${up.uri}" class="s16"><img src="${up.uri}" class="s32"><img src="${up.uri}" class="s64"></div>
  <div class="row"><span>Zed now</span><img src="${now}" class="s16"><img src="${now}" class="s32"><img src="${now}" class="s64"></div>
  <div class="meta">${files}${changed ? `<br>from ${sources.get(id)}` : ''}</div>
</div>`
}

const changed = ids.filter((id) => sources.has(id))
const same = ids.filter((id) => !sources.has(id))
const html = `<!doctype html>
<meta charset="utf-8">
<title>${NAME} icons: Sublime vs. Zed</title>
<style>
  body { margin: 0; padding: 24px; font: 13px ui-monospace, Menlo, monospace; background: #0d1017; color: #bfbdb6 }
  body.light { background: #f8f9fa; color: #5c6166 }
  h1, h2 { font-weight: 600 } h2 { margin-top: 40px }
  button { font: inherit; padding: 4px 10px; margin-left: 12px }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px }
  .card { border: 1px solid #1b1f29; border-radius: 6px; padding: 10px 12px }
  body.light .card { border-color: #e1e4e8 }
  .card.changed { border-color: #e6b45066 }
  .name { color: #e6b450; font-weight: 600; margin-bottom: 6px }
  .row { display: flex; align-items: center; gap: 14px; height: 70px }
  .row span { width: 96px; opacity: .6 }
  .s16 { width: 16px; height: 16px } .s32 { width: 32px; height: 32px } .s64 { width: 64px; height: 64px }
  img { object-fit: contain }
  .meta { opacity: .5; font-size: 11px; margin-top: 4px; word-break: break-all }
</style>
<h1>${NAME} icons: Sublime vs. Zed <button onclick="document.body.classList.toggle('light')">dark / light</button></h1>
<p>16, 32 and 64 px. Zed shows file icons at about 16 px (32 device pixels on Retina).</p>
<h2>Replaced (${changed.length})</h2>
<div class="grid">${changed.map(card).join('\n')}</div>
<h2>Unchanged, from ayu (${same.length})</h2>
<div class="grid">${same.map(card).join('\n')}</div>
`

Deno.mkdirSync(out('.compare'), { recursive: true })
Deno.writeTextFileSync(out('.compare/icons.html'), html)
console.log(`Wrote .compare/icons.html (${changed.length} replaced, ${same.length} unchanged)`)
