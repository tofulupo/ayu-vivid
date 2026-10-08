# ayu Vivid

> **A personal note:** all credit goes to [Ike Ku](https://github.com/dempfi), who created
> [ayu](https://github.com/dempfi/ayu), to me the most beautiful theme there is. This repository only carries his colors
> into a few more apps.

![ayu Vivid Space in Firefox, showing Kagi with the ayu Vivid CSS](docs/screenshots/hero.webp)

The ayu color theme for several apps, all generated from the [`ayu`](https://www.npmjs.com/package/ayu) palette package
so they stay in sync, with slightly punchier syntax colors.

| App | Theme | Get it |
| --- | --- | --- |
| [Firefox / LibreWolf](#firefox--librewolf) | ayu Vivid Space (animated stars) | [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/ayu-vivid-space/) |
| [Helium / Chromium](#helium--chromium) | ayu Vivid Space (still stars) | [Chrome Web Store](https://chromewebstore.google.com/detail/aoioalpfpelgihdmabkkgiladebahaef) |
| [Kagi](#kagi) | ayu Vivid Light + Dark | [openkagi.com](https://openkagi.com/themes/ayu-vivid) |
| [COSMIC](#cosmic) | ayu Vivid Dark, desktop + terminal | [cosmic-themes.org](https://cosmic-themes.org/376/) |
| [iTerm2 / Ghostty](#iterm2--ghostty) | ayu Vivid Dark + Light | [`terminal/`](terminal/) in this repository |
| [Vim / Neovim](#vim--neovim) | ayu Vivid Dark | [release](https://github.com/tofulupo/ayu-vivid/releases) |
| [Zed](#zed) | ayu Vivid Dark / Mirage / Light, each also Frosted, + icons | this repository (dev extension) |

## Firefox / LibreWolf

**ayu Vivid Space**: ayu Vivid Dark colors over animated stars, for Firefox 140+ and LibreWolf.

![ayu Vivid Space in LibreWolf, with Kagi in ayu Vivid Dark](docs/screenshots/firefox-kagi.webp)

**Recommended:** install it from
[addons.mozilla.org](https://addons.mozilla.org/firefox/addon/ayu-vivid-space/). One click, and it updates
automatically.

For offline installs or other machines, each [release](https://github.com/tofulupo/ayu-vivid/releases) also has the
signed `ayu-vivid-space-<version>.xpi`, the same file Mozilla serves. Drag it into a browser window, or use
`about:addons` → gear menu → **Install Add-on From File**. It's signed by Mozilla, so it installs with signature
checking on.

**Orion** (Kagi's browser) installs the theme but ignores it: no colors and no animation. The [Kagi](#kagi) CSS works
there as usual.

### Alternative: userChrome.css

This installs the theme as CSS in your browser profile instead of as an add-on. It's handy for testing changes from
this repository.

1. Install the files into your profile, either from this repository or from the `ayu-vivid-space.zip` of a
   [release](https://github.com/tofulupo/ayu-vivid/releases) (only needs `sh`):

   ```sh
   deno task firefox-chrome                  # from this repository
   sh ayu-vivid-space/install.sh             # from the unzipped release
   ```

   Without arguments it uses LibreWolf's default profile (macOS, Linux, Flatpak). For Firefox or another profile, add
   the folder from `about:support` → **Profile Folder** (on Linux: **Profile Directory**), e.g.
   `deno task firefox-chrome "<profile dir>"`. It never overwrites a `userChrome.css` or `userContent.css` it didn't
   create.
2. In `about:config`, set `toolkit.legacyUserProfileCustomizations.stylesheets` to `true`. This only lets the browser
   load CSS from your own profile folder.
3. In `about:addons` → Themes, enable the built-in **Dark** theme. The CSS overrides its colors.
4. Restart the browser.

## Helium / Chromium

**ayu Vivid Space** for Chromium browsers (Helium, Chrome, Brave, Vivaldi, Edge): the same colors as the Firefox theme,
with stars behind the tab strip and, dimmed, behind the toolbar.

![ayu Vivid Space in Helium, on Helium's sponsor page](docs/screenshots/helium.webp)

Tested in Helium on macOS and in Chrome on Debian 13. Brave, Vivaldi and Edge use the same theme format and should work
too, but I can't test them; if you use one of them, feedback (screenshots or problems) is welcome in the
[issues](https://github.com/tofulupo/ayu-vivid/issues).

Chromium themes only allow still images and fixed colors, so compared to Firefox:

- the stars don't move;
- the address bar's focus ring stays Chromium's blue, because themes can't change it.

On Linux, the theme only shows when Settings → Appearance is set to **GTK** or **Classic**. In **Qt** mode, Chrome
doesn't apply it.

**Recommended:** install it from the
[Chrome Web Store](https://chromewebstore.google.com/detail/aoioalpfpelgihdmabkkgiladebahaef). One click, and it
updates automatically.

Without the store, e.g. for testing changes from this repository:

1. Download `ayu-vivid-space-chromium.zip` from a [release](https://github.com/tofulupo/ayu-vivid/releases) and unzip
   it, or use the `chromium/` folder of this repository.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and select the folder. Keep the folder; the browser loads the theme from there.

## Kagi

`kagi/ayu-vivid.css` styles the [Kagi](https://kagi.com) search engine, light and dark in one file. It's also listed on
[openkagi.com](https://openkagi.com/themes/ayu-vivid). Paste its contents into Settings → Appearance → **Custom CSS**
and turn on **Enable Custom CSS**. It follows Kagi's theme setting: ayu Vivid Light with Kagi's light themes, ayu Vivid
Dark with **Dark** or **Moon Dark**.

For the theme color (used for the browser toolbar on mobile), enter **`#fcfcfc`** for light and **`#10141c`** for dark,
the ayu page backgrounds. They're also noted at the top of the CSS file.

Result titles are blue (ayu's link color in dark), visited titles purple, and hover and active states use the ayu
yellow accent. Titles are only underlined on hover. In the light version, colors are darkened just enough to stay
readable on white (contrast of at least 4.5:1 for text, 3:1 for the large titles); hue and saturation are kept.

## COSMIC

`cosmic/` has a desktop theme and a terminal color scheme, both from **ayu Vivid Dark**. The desktop theme is also on
[cosmic-themes.org](https://cosmic-themes.org/376/).

![COSMIC desktop with ayu Vivid Dark: Files, Settings and the tiling menu](docs/screenshots/cosmic-desktop.webp)

![COSMIC Terminal with ayu Vivid Dark, showing eza output](docs/screenshots/cosmic-terminal.webp)

- **Desktop:** open Settings → Desktop → Appearance, switch to Dark, click **Import** and pick
  `cosmic/ayu-vivid-dark.ron`.
- **Terminal:** in COSMIC Terminal, open Settings → Color schemes, click **Import** and pick
  `cosmic/ayu-vivid-dark-terminal.ron`, then select **ayu Vivid Dark**.

The terminal colors are the same values the Zed theme uses.

## iTerm2 / Ghostty

`terminal/` has color schemes for ayu Vivid Dark and Light, based on the terminal colors of COSMIC Terminal and Zed's
terminal. Dark has two refinements that will follow there with the next version: normal white is ayu's text color
instead of pure white, and the two greens are lighter and easier to tell apart.

- **iTerm2:** Settings → Profiles → Colors → **Color Presets…** → **Import…** and pick both files from
  `terminal/iterm2/`, then choose **ayu Vivid Dark** from the same menu. To follow the system appearance, tick **Use
  separate colors for light and dark mode** there and pick a preset for each.
- **Ghostty:** copy both files from `terminal/ghostty/` to `~/.config/ghostty/themes/` and add to Ghostty's config:

  ```text
  theme = light:ayu Vivid Light,dark:ayu Vivid Dark
  ```

  Or `theme = ayu Vivid Dark` to always use Dark.

## Vim / Neovim

Copy `vim/ayu-vivid-dark.vim` to `~/.vim/colors/` (Vim) or `~/.config/nvim/colors/` (Neovim), then run
`:colorscheme ayu-vivid-dark`. It uses truecolor and falls back to the nearest 256 colors.

![Vim with ayu Vivid Dark in COSMIC Terminal, editing Rust](docs/screenshots/vim.webp)

## Zed

![Zed with ayu Vivid Dark and the ayu Vivid Icons](docs/screenshots/zed-dark.webp)

Not in Zed's extension registry yet. The color themes and the icons are two separate extensions, as Zed's registry
requires. Install either or both from this repository:

1. In Zed, open the command palette and run `zed: install dev extension`.
2. Select `zed/theme/` (color themes) or `zed/icons/` (icons). Repeat for the other one.
3. Pick the theme with `theme selector: toggle` and the icons with `icon theme selector: toggle`.

Each variant also comes as **Frosted** (e.g. ayu Vivid Dark Frosted): a see-through, blurred window, so the wallpaper
shines through like frosted glass. The editor stays more solid than the panels so code is easy to read; Light Frosted
is more solid than Dark and Mirage.

![Zed with ayu Vivid Dark Frosted on macOS](docs/screenshots/zed-dark-frosted.webp)

The blur works on macOS and on KDE Plasma. On Linux, Zed asks for blur through KDE's protocol, which other desktops
don't support yet:

- **COSMIC** blurs through the newer `ext-background-effect` protocol instead. Zed has open pull requests to switch to
  it ([#59842](https://github.com/zed-industries/zed/pull/59842),
  [#53746](https://github.com/zed-industries/zed/pull/53746)); until one is merged, COSMIC shows the Frosted themes
  see-through but without blur, and lighter than on macOS.
- **GNOME** and others have no blur at all.

Without blur, you can make a Frosted theme more solid on that machine only, without changing the theme: add this to
Zed's `settings.json` (shown for ayu Vivid Dark Frosted; the window becomes 80% solid, the editor 90%):

```json
{
  "theme_overrides": {
    "ayu Vivid Dark Frosted": {
      "background": "#0d1017cc",
      "editor.background": "#10141c4b",
      "editor.gutter.background": "#10141c4b",
      "toolbar.background": "#10141c4b",
      "tab_bar.background": "#10141c4b",
      "terminal.background": "#10141c4b",
      "terminal.ansi.background": "#10141c4b",
      "status_bar.background": "#10141ca6",
      "elevated_surface.background": "#0f131af2"
    }
  }
}
```

The last two hex digits are the opacity (`cc` = 80%, `ff` = solid). Remove the override once your desktop blurs the
window.

> **About the icons:** 85 of the 136 ayu file icons only exist as small PNGs, and Zed icon themes need SVG. 83 of them
> are replaced with SVGs from open icon collections (gilbarbara/logos, Simple Icons, vscode-icons, Material Icon Theme),
> so some logos look different from ayu in VS Code. Only `tern` (Tern.js) is still a PNG inside an SVG and looks a bit
> soft.

## Uninstall

- **Firefox add-on:** `about:addons` → Themes → ayu Vivid Space → **Remove**.
- **Firefox userChrome.css:**

  ```sh
  deno task firefox-chrome-uninstall        # from this repository
  sh ayu-vivid-space/install.sh --uninstall # from the unzipped release
  ```

  Pass a profile folder the same way as when installing. It only removes the files it installed; your own
  `userChrome.css`/`userContent.css` and anything else in `chrome/` stay. Then restart the browser. Optionally set
  `toolkit.legacyUserProfileCustomizations.stylesheets` back to `false` and pick another theme in `about:addons`.

  Before switching to the add-on from addons.mozilla.org, uninstall the CSS version; otherwise it overrides the add-on's
  colors.
- **Helium / Chromium:** Settings → Appearance → **Reset to default**.
- **Kagi:** clear the field in Settings → Appearance → **Custom CSS**, or turn off **Enable Custom CSS**. If a broken
  stylesheet makes the page unusable, add `&no_css` to a search URL to load Kagi without it.
- **iTerm2:** choose another preset in Settings → Profiles → Colors → **Color Presets…**; **Delete Preset…** in the
  same menu removes it.
- **Ghostty:** remove the `theme` line from the config and the files from `~/.config/ghostty/themes/`.
- **Vim / Neovim:** delete `ayu-vivid-dark.vim` from your `colors/` folder.
- **Zed:** open the extensions page (`zed: extensions`) and uninstall the dev extension.

## Development

```text
src/        generators, one module per port (shared.ts has the color helpers)
zed/theme/  Zed extension "ayu Vivid": Dark / Mirage / Light color themes
zed/icons/  Zed extension "ayu Vivid Icons": file icon theme
cosmic/     COSMIC desktop theme + COSMIC Terminal colors (ayu Vivid Dark)
terminal/   iTerm2 + Ghostty color schemes (ayu Vivid Dark + Light)
vim/        Vim / Neovim colorscheme (ayu Vivid Dark)
firefox/    Firefox / LibreWolf theme (ayu Vivid Dark + animated stars)
chromium/   Helium / Chrome / Brave / Vivaldi theme (ayu Vivid Dark + still stars)
kagi/       Custom CSS for the Kagi search engine (ayu Vivid Light + Dark)
```

Files in the port folders are generated. Don't edit them by hand; change `src/` and rebuild. Syntax colors are tuned in
the Zed theme, and the other ports take their colors from it.

### Build

Requires [Deno](https://deno.com) 2.

```sh
deno task build
```

`build` first lints the Markdown files with [rumdl](https://github.com/rvben/rumdl) (`deno task md`) and stops if it
finds issues. `deno task md-fix` fixes them, including wrapping long lines.

Options, passed after the task name:

- `--vivid=<factor>`: syntax saturation boost in OKLCH (lightness and hue stay the same). Default `1.2`; `1` is the
  plain palette. Example: `deno task build --vivid=1.1`.
- `--p3`: Zed only. Zed on macOS doesn't color-manage theme colors, so on P3 screens (most Macs) the palette looks more
  saturated than in color-managed apps. That vivid look is the default; `--p3` re-encodes colors to show the exact,
  calmer sRGB values.

### Firefox

- **Testing changes:** after `deno task build`, run `deno task firefox-chrome` again and restart the browser.
- **Animation:** made from [Animation Of Stars](https://vimeo.com/379631605) by Play (CC BY 3.0), see
  [`firefox/CREDITS.md`](firefox/CREDITS.md). The source video is in `firefox/source/`, the finished
  `firefox/img/background.gif` is committed. To remake it, e.g. after changing the background color (needs ffmpeg):
  `deno task firefox-background`.
- **Release zip:** `deno task firefox-export` creates `firefox/ayu-vivid-space.zip` with the CSS, the GIF, `CREDITS.md`
  and `install.sh`. Keep `CREDITS.md` in it when sharing; the animation's license requires the attribution.
- **Add-on package:** `deno task firefox-pack` builds `firefox/ayu-vivid-space.xpi` for addons.mozilla.org. To test it
  unsigned until the next restart: `about:debugging` → This Firefox → **Load Temporary Add-on** →
  `firefox/manifest.json`.

### Chromium

- **Images:** `chromium/img/frame.png` (tab strip) and `chromium/img/toolbar.png` (toolbar) are a still frame of the
  Firefox animation; `chromium/img/icon.png` and `chromium/store/promo-small.png` are made from it too. Remake them
  with `deno task chromium-background` after `deno task firefox-background`. The toolbar dimming is `TOOLBAR_TINT` in
  `src/chromium-background.ts`.
- **Chrome Web Store:** `chromium/store/` has the promo tile and the screenshot for the listing; they're not part of the
  zip.
- **Release zip:** `deno task chromium-pack` creates `chromium/ayu-vivid-space-chromium.zip` with the manifest, images
  and `CREDITS.md`.

### Zed

- **Testing changes:** after rebuilding, run `zed: rebuild dev extension` (or reinstall it).
- **Frosted themes:** made from the regular ones by `frosted()` in `src/zed.ts`. The visible opacity of panels, editor
  and popups per variant is in `FROSTED`; since Zed draws panels and the editor on top of the window background, the
  code works out each layer's own alpha so the stack reaches those values.
- **Syntax mapping:** Zed uses tree-sitter captures instead of TextMate scopes, so the mapping in `src/zed.ts`
  approximates the original ayu Sublime color scheme rather than copying it rule for rule.
- **Icons:** to use a different icon, save an SVG as `src/icons/<name>.svg`, using the same name as the file it replaces
  (e.g. `lua.svg`, `R.svg`), add a row to `src/icons/SOURCES.md` and rebuild. `deno task icons-fetch` fills in missing
  icons without touching existing ones (needs ImageMagick), and `deno task icons-compare` opens a page comparing the
  upstream ayu icons with the Zed ones.

### Adding a port

Create `src/<port>.ts` with a `build()` function that writes into `<port>/` (use `writeText` / `writeJson` from
`shared.ts`) and returns a one-line summary. Then add it to the list in `src/build.ts` and to `--allow-write` in the
`build` task in `deno.json`. To reuse the tuned colors, take them from the Zed theme: `theme(ayu.dark, 'dark')` from
`zed.ts`.

## License

BSD-3-Clause, see [`LICENSE`](LICENSE). Third-party parts keep their own licenses, listed in
[`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md), [`firefox/CREDITS.md`](firefox/CREDITS.md) and
[`chromium/CREDITS.md`](chromium/CREDITS.md).

## Credits

- Colors: [ayu](https://github.com/dempfi/ayu) by Ike Ku (MIT). Its license is included in
  [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md).
- File icons: from the [`ayu`](https://www.npmjs.com/package/ayu) package. Replacements for its PNG-only icons come from
  [gilbarbara/logos](https://github.com/gilbarbara/logos) (CC0),
  [Simple Icons](https://github.com/simple-icons/simple-icons) (CC0),
  [vscode-icons](https://github.com/vscode-icons/vscode-icons) (MIT) and
  [Material Icon Theme](https://github.com/material-extensions/vscode-material-icon-theme) (MIT); per-icon list in
  [`src/icons/SOURCES.md`](src/icons/SOURCES.md), licenses in [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md). Brand
  logos remain trademarks of their owners.
- Firefox and Chromium star background: [Animation Of Stars](https://vimeo.com/379631605) by Play,
  [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). Details in [`firefox/CREDITS.md`](firefox/CREDITS.md) and
  [`chromium/CREDITS.md`](chromium/CREDITS.md).
- Inspiration for the star themes: [Dark space](https://github.com/nicoth-in/Dark-Space-Theme) by Nicothin.
  No files from it are used.
- Inspiration for the Zed Frosted themes: [Ayu Glass](https://github.com/jansol/zed-ayu-glass) by jansol. No files
  from it are used.
