// Makes the Chromium theme images from a still frame of
// firefox/img/background.gif (run `deno task firefox-background` first after
// changing the animation). Chromium themes don't animate images.
//   chromium/img/frame.png:   tab strip, the frame as is
//   chromium/img/toolbar.png: toolbar and selected tab, the frame under the
//                             ayu editor background at TOOLBAR_TINT opacity
//                             (Firefox uses a translucent toolbar the same way)
import * as ayu from 'ayu'

const TOOLBAR_TINT = 0.5

const root = new URL('../', import.meta.url).pathname
const source = `${root}firefox/img/background.gif[0]`
const img = `${root}chromium/img`

const magick = async (args: string[]) => {
  const { success, stderr } = await new Deno.Command('magick', { args, stderr: 'piped' }).output()
  if (!success) throw new Error(new TextDecoder().decode(stderr))
}

Deno.mkdirSync(img, { recursive: true })
await magick([source, '-strip', `${img}/frame.png`])
await magick([
  source,
  '(', '+clone', '-fill', ayu.dark.editor.bg.hex(), '-colorize', '100', ')',
  '-compose', 'blend', '-define', `compose:args=${TOOLBAR_TINT * 100}`, '-composite',
  '-strip',
  `${img}/toolbar.png`
])

console.log(`Wrote ${img}/frame.png and ${img}/toolbar.png`)
