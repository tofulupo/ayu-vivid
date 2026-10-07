// Chromium theme in chromium/ (Helium, Chrome, Brave, Vivaldi, Edge): the
// Firefox theme's colors with a still frame of the stars behind the tab strip
// and, dimmed, behind the toolbar. Chromium themes only take static images and
// opaque RGB colors, so there is no animation; the dimmed toolbar image (see
// chromium-background.ts) stands in for Firefox's translucent toolbar.
import * as ayu from 'ayu'
import { channels, NAME, type Scheme, solid, VERSION, writeJson, writeText } from './shared.ts'
import { theme, type ZedTheme } from './zed.ts'

const rgb = (hexColor: string) => channels(hexColor).slice(0, 3).map((c) => Math.round(c * 255))

const chromiumManifest = (s: Scheme, z: ZedTheme) => {
  const st = z.style as unknown as Record<string, string>
  const frame = st['background']
  const text = st['text']
  // Selected tab and toolbar share one color in Chromium: the editor background,
  // like the selected tab in the Firefox theme.
  const toolbar = s.editor.bg.hex()
  return {
    manifest_version: 3,
    name: `${NAME} Space`,
    version: VERSION,
    description: `${z.name} colors over stars. Based on ayu by Ike Ku. Stars: "Animation Of Stars" by Play, CC BY 3.0.`,
    icons: { '128': 'img/icon.png' },
    theme: {
      images: { theme_frame: 'img/frame.png', theme_toolbar: 'img/toolbar.png' },
      colors: {
        frame: rgb(frame),
        frame_inactive: rgb(frame),
        frame_incognito: rgb(frame),
        frame_incognito_inactive: rgb(frame),
        toolbar: rgb(toolbar),
        toolbar_text: rgb(text),
        toolbar_button_icon: rgb(text),
        tab_text: rgb(text),
        tab_background_text: rgb(solid(s.editor.fg.alpha(0.6).hex(), frame)),
        tab_background_text_inactive: rgb(solid(s.editor.fg.alpha(0.4).hex(), frame)),
        bookmark_text: rgb(text),
        omnibox_background: rgb(frame),
        omnibox_text: rgb(text),
        ntp_background: rgb(st['editor.background']),
        ntp_text: rgb(text),
        ntp_link: rgb(st['text.accent'])
      },
      properties: { ntp_logo_alternate: 1 }
    }
  }
}

const credits = `# Credits

## Star background

\`img/frame.png\`, \`img/toolbar.png\` and \`img/icon.png\` are made from a still frame of
[**Animation Of Stars**](https://vimeo.com/379631605) by [Play](https://vimeo.com/playsf), licensed under
[Creative Commons Attribution 3.0 Unported (CC BY 3.0)](https://creativecommons.org/licenses/by/3.0/).

Changes: scaled to 640\u00d7360, a single frame taken, and black lifted to ayu Vivid Dark's background color
(\`${ayu.dark.ui.bg.hex()}\`). \`toolbar.png\` is additionally dimmed with the editor background color; \`icon.png\` is a
brightened circular crop with a ring added.

## Colors

Based on [ayu](https://github.com/dempfi/ayu) by Ike Ku (MIT License).

## Inspiration

The idea of a star background comes from the [Dark space](https://github.com/nicoth-in/Dark-Space-Theme) Firefox
theme by Nicothin. No files from it are used.
`

export const build = () => {
  writeJson('chromium/manifest.json', chromiumManifest(ayu.dark, theme(ayu.dark, 'dark')))
  writeText('chromium/CREDITS.md', credits)
  return 'chromium: manifest, CREDITS.md'
}
