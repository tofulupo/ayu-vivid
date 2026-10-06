# ayu Vivid

> **A personal note:** all credit goes to [Ike Ku](https://github.com/dempfi), who created
> [ayu](https://github.com/dempfi/ayu), to me the most beautiful theme there is. This repository only carries his colors
> into a few more apps.

The ayu color theme for several apps, all generated from the [`ayu`](https://www.npmjs.com/package/ayu) palette package
so they stay in sync. Syntax colors are tuned in the Zed theme, and the other ports take their colors from it.

```text
src/        generators, one module per port (shared.ts has the color helpers)
zed/theme/  Zed extension "ayu Vivid": Dark / Mirage / Light color themes
zed/icons/  Zed extension "ayu Vivid Icons": file icon theme
cosmic/     COSMIC desktop theme + COSMIC Terminal colors (ayu Vivid Dark)
vim/        Vim / Neovim colorscheme (ayu Vivid Dark)
firefox/    Firefox / LibreWolf theme (ayu Vivid Dark + animated stars)
```

Files in the port folders are generated. Don't edit them by hand; change `src/` and rebuild.

## Build

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

### Adding a port

Create `src/<port>.ts` with a `build()` function that writes into `<port>/` (use `writeText` / `writeJson` from
`shared.ts`) and returns a one-line summary. Then add it to the list in `src/build.ts` and to `--allow-write` in the
`build` task in `deno.json`. To reuse the tuned colors, take them from the Zed theme: `theme(ayu.dark, 'dark')` from
`zed.ts`.

## Zed

The color themes and the icons are two separate extensions, as Zed's registry requires. Install either or both:

1. In Zed, open the command palette and run `zed: install dev extension`.
2. Select `zed/theme/` (color themes) or `zed/icons/` (icons). Repeat for the other one.
3. Pick the theme with `theme selector: toggle` and the icons with `icon theme selector: toggle`.

After rebuilding, run `zed: rebuild dev extension` (or reinstall it) to pick up changes.

> **About the icons:** 85 of the 136 ayu file icons only exist as small PNGs, and Zed icon themes need SVG. 83 of them
> are replaced with SVGs from open icon collections (gilbarbara/logos, Simple Icons, vscode-icons, Material Icon Theme),
> so some logos look different from ayu in VS Code. Only `tern` (Tern.js) is still a PNG inside an SVG and looks a bit
> soft.
>
> To use a different icon, save an SVG as `src/icons/<name>.svg`, using the same name as the file it replaces (e.g.
> `lua.svg`, `R.svg`), add a row to `src/icons/SOURCES.md` and rebuild. `deno task icons-fetch` fills in missing icons
> without touching existing ones (needs ImageMagick), and `deno task icons-compare` opens a page comparing the upstream
> ayu icons with the Zed ones.

Notes:

- Zed uses tree-sitter captures instead of TextMate scopes, so the syntax mapping in `src/zed.ts` approximates the
  original ayu Sublime color scheme rather than copying it rule for rule.

## COSMIC

`cosmic/` has a desktop theme and a terminal color scheme, both from **ayu Vivid Dark**.

- **Desktop:** open Settings → Desktop → Appearance, switch to Dark, click **Import** and pick
  `cosmic/ayu-vivid-dark.ron`.
- **Terminal:** in COSMIC Terminal, open Settings → Color schemes, click **Import** and pick
  `cosmic/ayu-vivid-dark-terminal.ron`, then select **ayu Vivid Dark**.

The terminal colors are the same values the Zed theme uses.

## Vim / Neovim

Copy `vim/ayu-vivid-dark.vim` to `~/.vim/colors/` (Vim) or `~/.config/nvim/colors/` (Neovim), then run
`:colorscheme ayu-vivid-dark`. It uses truecolor and falls back to the nearest 256 colors.

## Firefox / LibreWolf

ayu Vivid Dark colors over animated stars. The animation is made from
[Animation Of Stars](https://vimeo.com/379631605) by Play (CC BY 3.0), see [`firefox/CREDITS.md`](firefox/CREDITS.md).
The source video is in `firefox/source/` and the finished `firefox/img/background.gif` is committed. To remake it, e.g.
after changing the background color (needs ffmpeg):

```sh
deno task firefox-background
```

**Permanent install, without an add-on (recommended):** the theme is generated as `firefox/chrome/userChrome.css` +
`userContent.css`, so add-on signature checking can stay on.

1. `deno task firefox-chrome` copies the files and the GIF into LibreWolf's default profile (`chrome/` folder). For
   another profile or Firefox, pass the profile directory: `deno task firefox-chrome "<profile dir>"`. It won't
   overwrite a `userChrome.css` it didn't create.
2. In `about:config`, set `toolkit.legacyUserProfileCustomizations.stylesheets` to `true`. This only lets the browser
   load CSS from your own profile folder.
3. In `about:addons` → Themes, enable the built-in **Dark** theme. The CSS overrides its colors.
4. Restart the browser.

After `deno task build`, run `deno task firefox-chrome` again and restart.

**On another computer:** `deno task firefox-export` creates `firefox/ayu-vivid-space.zip` with the CSS, the GIF,
`CREDITS.md` and `install.sh`. Copy it over, unzip, run `sh ayu-vivid-space/install.sh` (or pass a profile
directory), then do steps 2-4. Only needs `sh`. If you share the zip, keep `CREDITS.md` in it; the animation's license
requires the attribution.

**As an add-on:** `about:debugging` → This Firefox → **Load Temporary Add-on** → `firefox/manifest.json` works until
restart. A permanent install needs the add-on signed by Mozilla (`deno task firefox-pack` builds the `.xpi`).

## License

BSD-3-Clause, see [`LICENSE`](LICENSE). Third-party parts keep their own licenses, listed in
[`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md) and [`firefox/CREDITS.md`](firefox/CREDITS.md).

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
- Firefox background animation: [Animation Of Stars](https://vimeo.com/379631605) by Play,
  [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). Details in [`firefox/CREDITS.md`](firefox/CREDITS.md).
- Inspiration for the animated Firefox theme: [Dark space](https://github.com/nicoth-in/Dark-Space-Theme) by Nicothin.
  No files from it are used.
