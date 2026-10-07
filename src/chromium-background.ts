// Makes the Chromium theme images from a still frame of
// firefox/img/background.gif (run `deno task firefox-background` first after
// changing the animation). Chromium themes don't animate images.
//   chromium/img/frame.png:   tab strip, the frame as is
//   chromium/img/toolbar.png: toolbar and selected tab, the frame under the
//                             ayu editor background at TOOLBAR_TINT opacity
//                             (Firefox uses a translucent toolbar the same way)
//   chromium/img/icon.png:    128px store icon, a circle of stars with an ayu
//                             yellow ring (112px circle, 8px transparent padding)
//   chromium/store/promo-small.png: 440x280 Chrome Web Store promo tile, stars
//                             with a tab strip hint and the icon's ring, no text
//                             (no yellow tab line: Chromium themes can't draw one)
import * as ayu from 'ayu'

const TOOLBAR_TINT = 0.5

const root = new URL('../', import.meta.url).pathname
const source = `${root}firefox/img/background.gif[0]`
const img = `${root}chromium/img`
const store = `${root}chromium/store`
const accent = ayu.dark.common.accent.tint.hex()
const line = ayu.dark.ui.line.hex()

// Store images are shown small, so the stars are brightened: each channel moves
// STAR_BOOST times further away from the ayu background (which stays as it is).
const STAR_BOOST = 2.5
const boost = ayu.dark.ui.bg.rgb().flatMap((c, i) => [
  '-channel', 'RGB'[i], '-fx', `u*${STAR_BOOST}-${((c / 255) * (STAR_BOOST - 1)).toFixed(4)}`
]).concat('+channel')

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

// Icon: stars cut to a circle, yellow ring on its edge.
await magick([
  '-size', '128x128', 'xc:none',
  '(', `${img}/frame.png`, '-crop', '112x112+264+124', '+repage', ...boost,
  '(', '-size', '112x112', 'xc:none', '-fill', 'white', '-draw', 'circle 56,56 56,1', ')',
  '-compose', 'DstIn', '-composite', ')',
  '-compose', 'over', '-geometry', '+8+8', '-composite',
  '-fill', 'none', '-stroke', accent, '-strokewidth', '4', '-draw', 'circle 64,64 64,10',
  '-depth', '8', '-strip', `${img}/icon.png`
])

// Promo tile: stars in a 48px "tab strip", dimmed stars in the selected tab and
// below (like the theme), the tab outlined, and the icon ring.
Deno.mkdirSync(store, { recursive: true })
const crop = ['-crop', '440x280+100+40', '+repage']
await magick([
  `${img}/frame.png`, ...crop,
  '(', `${img}/toolbar.png`, ...crop, ')',
  '(', '-size', '440x280', 'xc:black', '-fill', 'white',
  '-draw', 'rectangle 0,48 440,280', '-draw', 'roundrectangle 28,12 188,60 8,8', ')',
  '-composite', ...boost,
  '-fill', 'none', '-stroke', line, '-strokewidth', '1',
  '-draw', 'polyline 0,48.5 28.5,48.5 28.5,20 36,12.5 180,12.5 188.5,20 188.5,48.5 440,48.5',
  '-stroke', accent, '-strokewidth', '5', '-draw', 'circle 220,164 220,100',
  '-alpha', 'off', '-strip', `${store}/promo-small.png`
])

console.log(`Wrote ${img}/frame.png, toolbar.png, icon.png and ${store}/promo-small.png`)
