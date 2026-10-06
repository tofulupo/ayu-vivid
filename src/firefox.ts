// Firefox / LibreWolf theme in firefox/: add-on manifest plus userChrome.css.
import * as ayu from 'ayu'
import { AUTHOR, type Scheme, SLUG, solid, VERSION, writeJson, writeText } from './shared.ts'
import { theme, type ZedTheme } from './zed.ts'

// Static theme over the animated stars background (see
// src/firefox-background.ts). Toolbar and selected tab stay translucent so the
// animation shows through.
const firefoxManifest = (s: Scheme, z: ZedTheme) => {
  const st = z.style as unknown as Record<string, string>
  const text = st['text']
  const accent = st['text.accent']
  const border = st['border']
  const toolbar = s.editor.bg.alpha(0.8).hex()
  return {
    manifest_version: 2,
    name: `${z.name} Space`,
    version: VERSION,
    description:
      `${z.name} colors over animated stars. Based on ayu by Ike Ku. Animation: "Animation Of Stars" by Play ` +
      '(vimeo.com/379631605), CC BY 3.0.',
    author: AUTHOR,
    browser_specific_settings: {
      gecko: { id: `${SLUG}-dark-space@tofulupo`, strict_min_version: '106.0' }
    },
    theme: {
      images: { additional_backgrounds: ['img/background.gif'] },
      properties: {
        additional_backgrounds_tiling: ['repeat-x'],
        color_scheme: 'dark',
        content_color_scheme: 'dark'
      },
      colors: {
        frame: st['background'],
        frame_inactive: st['background'],
        button_background_hover: st['element.hover'],
        button_background_active: st['element.active'],
        bookmark_text: text,
        icons: text,
        icons_attention: accent,
        ntp_background: st['editor.background'],
        ntp_text: text,
        popup: st['elevated_surface.background'],
        popup_border: border,
        popup_highlight: solid(st['element.selected'], st['elevated_surface.background']),
        popup_highlight_text: text,
        popup_text: text,
        sidebar: st['panel.background'],
        sidebar_border: border,
        sidebar_highlight: solid(st['element.selected'], st['panel.background']),
        sidebar_highlight_text: text,
        sidebar_text: text,
        tab_background_separator: 'transparent',
        tab_background_text: s.editor.fg.alpha(0.6).hex(),
        tab_loading: accent,
        tab_selected: toolbar,
        tab_text: text,
        tab_line: accent,
        toolbar,
        toolbar_bottom_separator: border,
        toolbar_field: st['background'],
        toolbar_field_focus: s.ui.panel.bg.hex(),
        toolbar_field_border: 'transparent',
        toolbar_field_border_focus: st['border.focused'],
        toolbar_field_highlight: st['element.selection_background'],
        toolbar_field_highlight_text: text,

        toolbar_field_text: text,
        toolbar_field_text_focus: text,
        toolbar_top_separator: 'transparent',
        toolbar_vertical_separator: border
      }
    }
  }
}

// Same theme as userChrome.css, for use without an (unsigned) add-on. Firefox
// applies theme colors by setting these CSS variables on :root, so overriding
// them reproduces the add-on. Names from ThemeVariableMap.sys.mjs and
// LightweightThemeConsumer.sys.mjs; older names follow for earlier versions.
const firefoxCssVars: Record<string, string[]> = {
  frame: ['--lwt-accent-color'],
  frame_inactive: ['--lwt-accent-color-inactive'],
  tab_background_text: ['--lwt-text-color'],
  tab_loading: ['--tab-icon-fill-loading', '--tab-loading-fill'],
  tab_selected: ['--tab-background-color-selected', '--tab-selected-bgcolor'],
  tab_text: ['--tab-text-color-selected', '--tab-selected-textcolor'],
  tab_line: ['--lwt-tab-line-color'],
  tab_background_separator: ['--lwt-background-tab-separator-color'],
  toolbar: ['--toolbar-background-color', '--toolbar-bgcolor'],
  bookmark_text: ['--toolbar-text-color', '--toolbar-color'],
  toolbar_top_separator: ['--tabs-navbar-separator-color'],
  toolbar_vertical_separator: ['--toolbarseparator-color'],
  toolbar_bottom_separator: ['--chrome-content-separator-color'],
  button_background_hover: ['--toolbarbutton-background-color-hover', '--toolbarbutton-hover-background'],
  button_background_active: ['--toolbarbutton-background-color-active', '--toolbarbutton-active-background'],
  icons: ['--toolbarbutton-icon-fill', '--lwt-toolbarbutton-icon-fill'],
  icons_attention: ['--toolbarbutton-icon-fill-attention', '--lwt-toolbarbutton-icon-fill-attention'],
  popup: ['--panel-background-color', '--arrowpanel-background'],
  popup_text: ['--panel-text-color', '--arrowpanel-color'],
  popup_border: ['--panel-border-color', '--arrowpanel-border-color'],
  popup_highlight: ['--urlbarview-background-color-selected', '--urlbarView-highlight-background'],
  popup_highlight_text: ['--urlbarview-text-color-selected', '--urlbarView-highlight-color'],
  sidebar: ['--sidebar-background-color'],
  sidebar_text: ['--sidebar-text-color'],
  sidebar_border: ['--sidebar-border-color'],
  ntp_background: ['--tabpanel-background-color'],
  toolbar_field: ['--toolbar-field-background-color'],
  toolbar_field_text: ['--toolbar-field-text-color', '--toolbar-field-color'],
  toolbar_field_border: ['--toolbar-field-border-color'],
  toolbar_field_focus: ['--toolbar-field-background-color-focus', '--toolbar-field-focus-background-color'],
  toolbar_field_text_focus: ['--toolbar-field-text-color-focus', '--toolbar-field-focus-color'],
  toolbar_field_border_focus: ['--toolbar-field-border-color-focus', '--toolbar-field-focus-border-color'],
  toolbar_field_highlight: ['--lwt-toolbar-field-highlight'],
  toolbar_field_highlight_text: ['--lwt-toolbar-field-highlight-text']
}

const firefoxUserChrome = (manifest: ReturnType<typeof firefoxManifest>) => {
  const colors = manifest.theme.colors as Record<string, string>
  const decl = (name: string, value: string) => `  ${name}: ${value} !important;`
  const vars = Object.entries(firefoxCssVars).flatMap(([key, names]) => names.map((n) => decl(n, colors[key])))
  const background = [
    decl('--lwt-additional-images', 'url("img/background.gif")'),
    decl('--lwt-background-tiling', 'repeat-x'),
    decl('--lwt-background-alignment', 'right top'),
    decl('--toolbox-background-image', 'url("img/background.gif")'),
    decl('--toolbox-background-repeat', 'repeat-x'),
    decl('--toolbox-background-position', 'right top'),
    decl('--toolbox-background-size', 'auto'),
    decl('--tabs-navbar-separator-style', 'none')
  ]
  return `/* ${manifest.name} for Firefox / LibreWolf, as userChrome.css (no add-on needed).
 * Generated by build.ts from the ayu Vivid Dark Zed theme. Don't edit by hand.
 *
 * Needs toolkit.legacyUserProfileCustomizations.stylesheets = true and the
 * built-in "Dark" theme selected (it enables Firefox's theme styling, which
 * these variables then override). */

:root {
${vars.join('\n')}

${background.join('\n')}
}
`
}

const firefoxUserContent = (manifest: ReturnType<typeof firefoxManifest>) => {
  const colors = manifest.theme.colors as Record<string, string>
  return `/* ${manifest.name}: new tab page colors. Generated by build.ts. */

@-moz-document url("about:newtab"), url("about:home"), url("about:privatebrowsing") {
  :root {
    --newtab-background-color: ${colors.ntp_background} !important;
    --newtab-background-color-secondary: ${colors.popup} !important;
    --newtab-text-primary-color: ${colors.ntp_text} !important;
  }
}
`
}


export const build = () => {
  const manifest = firefoxManifest(ayu.dark, theme(ayu.dark, 'dark'))
  writeJson('firefox/manifest.json', manifest)
  writeText('firefox/chrome/userChrome.css', firefoxUserChrome(manifest))
  writeText('firefox/chrome/userContent.css', firefoxUserContent(manifest))
  return 'firefox: manifest, userChrome.css, userContent.css'
}
