// Shared palette helpers and output paths for all ports.
import * as ayu from 'ayu'
import { Color as AyuColor } from 'ayu/color'

export type Scheme = typeof ayu.dark
export type Color = Scheme['editor']['bg']
export type Variant = 'dark' | 'mirage' | 'light'

// Display name (theme pickers) and slug (ids, file names). The Zed extension id
// and the Firefox add-on id derive from SLUG and must not change once published.
export const NAME = 'ayu Vivid'
export const SLUG = 'ayu-vivid'
export const AUTHOR = 'Marcel (tofulupo)'
export const VERSION = '1.0.0'
export const REPOSITORY = 'https://github.com/tofulupo/ayu-vivid'

// Repo root; each port writes into its own folder below it.
const root = new URL('..', import.meta.url).pathname
export const out = (path: string) => root + path

export const writeText = (path: string, text: string) => {
  Deno.mkdirSync(out(path).replace(/\/[^/]*$/, ''), { recursive: true })
  Deno.writeTextFileSync(out(path), text)
}

export const writeJson = (path: string, data: unknown) => writeText(path, JSON.stringify(data, null, 2) + '\n')

// Empties a folder that only holds generated files.
export const cleanDir = (dir: string) => {
  try {
    Deno.removeSync(out(dir), { recursive: true })
  } catch (e) {
    if (!(e instanceof Deno.errors.NotFound)) throw e
  }
  Deno.mkdirSync(out(dir), { recursive: true })
}

// Extra OKLCH chroma for syntax colors, so highlights pop like they do in
// Sublime. 1 = palette as-is. Override with `--vivid=1.3` etc.
export const VIVID = Number(Deno.args.find((a) => a.startsWith('--vivid='))?.split('=')[1] ?? 1.2)

export const srgbToOklab = ([r, g, b]: number[]) => {
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const [R, G, B] = [r, g, b].map(lin)
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B)
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B)
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  ]
}

export const oklabToSrgb = ([L, a, b]: number[]) => {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const gam = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.sign(c) * Math.abs(c) ** (1 / 2.4) - 0.055)
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  ].map(gam)
}

// Scales chroma, then backs off until the color fits in the sRGB gamut so the
// hue never shifts from clipping.
export const vivid = (c: Color, factor = VIVID): Color => {
  if (factor === 1) return c
  const [r, g, b, alpha] = c.rgba()
  const [L, A, B] = srgbToOklab([r, g, b].map((v) => v / 255))
  const inGamut = (rgb: number[]) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4)
  let lo = 1, hi = factor
  if (!inGamut(oklabToSrgb([L, A * hi, B * hi]))) {
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2
      if (inGamut(oklabToSrgb([L, A * mid, B * mid]))) lo = mid
      else hi = mid
    }
  } else lo = hi
  const byte = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0')
  const out = new AyuColor('#' + oklabToSrgb([L, A * lo, B * lo]).map(byte).join(''))
  return alpha < 1 ? out.alpha(alpha) : out
}

export const hex = (c: Color) => c.hex()

export const toHex = (rgb: number[]) =>
  '#' + rgb.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0')).join('')

export const channels = (hexColor: string) =>
  [1, 3, 5, 7].map((i) => (hexColor.length > i ? parseInt(hexColor.slice(i, i + 2), 16) / 255 : 1))

// Vim has no alpha, so translucent Zed colors are composited onto a base.
export const solid = (hexColor: string, base: string) => {
  const [r, g, b, a] = channels(hexColor)
  const [R, G, B] = channels(base)
  return toHex([r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a)])
}
