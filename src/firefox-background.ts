// Makes firefox/img/background.gif from the "Animation Of Stars" video
// (firefox/source/animation-of-stars.mp4, CC BY, see firefox/CREDITS.md).
// Black is lifted to ayu Vivid Dark's UI background so the animation blends into
// the window frame; the stars and motion stay as they are.
import * as ayu from 'ayu'

const dir = new URL('../firefox/', import.meta.url).pathname
const source = `${dir}source/animation-of-stars.mp4`
const target = `${dir}img/background.gif`

// Toolbars only show the top ~100 px; 640x360 at 15 fps keeps the file small.
const WIDTH = 640
const FPS = 15

// Maps 0..255 onto bg..255 per channel, i.e. black becomes the ayu background.
const [r, g, b] = ayu.dark.ui.bg.rgb()
const lift = (c: number) => `${c}+val*${255 - c}/255`
const filter = `fps=${FPS},scale=${WIDTH}:-2:flags=lanczos,` +
  `lutrgb=r='${lift(r)}':g='${lift(g)}':b='${lift(b)}',split[a][b];` +
  `[a]palettegen=stats_mode=full[p];[b][p]paletteuse=dither=none`

Deno.mkdirSync(`${dir}img`, { recursive: true })
const { success, stderr } = await new Deno.Command('ffmpeg', {
  args: ['-v', 'error', '-y', '-i', source, '-filter_complex', filter, '-loop', '0', target],
  stderr: 'piped'
}).output()
if (!success) throw new Error(new TextDecoder().decode(stderr))

console.log(`Wrote ${target}`)
