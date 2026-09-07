# Turntable Negative

A quieter Spotify. Dark Catppuccin Mocha base, a soft mauve accent, cover art rendered
as an inverted duotone, and a handful of extensions that take out the things which kept
pulling my eye around: video shelves, browse artwork, and the colour noise of the
category grid.

![preview](screenshots/preview.png)

Built on [Turntable](https://github.com/grasonchan/spotify-spice) by Grason Chan.

## What "negative" means

The duotone filter maps each cover's brightness onto two colours. Here the defaults map
light to black and dark to grey, which is the inverse of how you would normally do it.
Covers end up looking like photographic negatives. Hover one and the original comes
back, so you can still find things by their artwork.

That inversion is the whole point of the theme, and it takes one line to undo if you
want a conventional duotone instead. See [Tuning the duotone](#tuning-the-duotone).

## What it does not do

It does not stop everything from moving. The turntable still spins while a track plays,
and Spotify's scroll linked carousel animations still run. What is gone is video
content, artwork that carries no information, and the twenty seven background colours of
the browse grid.

## Before you start

You will need:

* [Spicetify](https://spicetify.app/) v2.2.0 or newer, because Turntable's rotation
  needs it
* [`fullAppDisplay.js`](https://github.com/spicetify/cli/blob/main/Extensions/fullAppDisplay.js),
  which Turntable requires. It ships with Spicetify, so it is not bundled here.
* `overwrite_assets = 1` in your `config-xpui.ini`, for the recoloured equaliser icons

## Installing

### From the Marketplace

Look for **Turntable Negative** under Themes. The extensions and the rotation script
come along automatically through the theme's `include` field.

There is one thing the Marketplace cannot do for you: the recoloured equaliser icons.
A Marketplace theme install injects the colour scheme, `user.css` and whatever scripts
are listed in `include`, but it does not copy asset files. So the little "now playing"
equaliser animation stays Spotify green. Everything else is identical. If that bothers
you, install by hand instead.

### By hand

```bash
git clone https://github.com/Lourixes/turntable-negative
cd turntable-negative

# theme
cp -r theme ~/.config/spicetify/Themes/TurntableNegative

# extensions
cp extensions/*.js ~/.config/spicetify/Extensions/

spicetify config current_theme TurntableNegative color_scheme mocha
spicetify config overwrite_assets 1 inject_theme_js 1
spicetify config extensions accent-fixups.js
spicetify config extensions duotone-covers.js
spicetify config extensions hide-videos.js
spicetify config extensions npv-collapse.js
spicetify config extensions playbar-track-options.js
spicetify config extensions home-lazy-shelves.js
spicetify config extensions browse-calm-cards.js
spicetify config extensions fullAppDisplay.js
spicetify apply
```

## The extensions

Each one stands on its own. If you do not like one, switch it off with
`spicetify config extensions <name>.js-` and run `spicetify apply`. Nothing else
breaks.

| Extension | What it does |
|---|---|
| `duotone-covers.js` | Cover art as a two colour duotone, original on hover |
| `accent-fixups.js` | Clears the leftover Spotify green out of button states, pins the home header colour, straightens a couple of icons |
| `hide-videos.js` | Hides video episodes, video only shelves, and "Similar music videos" |
| `npv-collapse.js` | Hides the right sidebar while it is only showing Now Playing |
| `playbar-track-options.js` | Puts the track's context menu button in the player bar. Right click toggles Now Playing. |
| `home-lazy-shelves.js` | Holds back off screen home shelves until you scroll near them |
| `browse-calm-cards.js` | Calms down the "Browse all" tiles. No colours, no artwork. |

### About the two performance ones

These came out of actually measuring, not guessing, so here is what the numbers said.

**`home-lazy-shelves.js`.** Spotify's home page keeps all twelve shelves laid out at
once, roughly 375 elements each and about 6,500 in total, while only four or so fit on
screen. Holding the rest back cut a full style recalculation plus layout from 60 to
66 ms down to 32 to 40 ms, so a bit under half the work per recalculation.

It uses `content-visibility: hidden` rather than `display: none`, because the latter
also takes away the shelf's height. The scrollbar would jump and you could not reach the
bottom of the page. With `content-visibility` the boxes keep their size and the scroll
height stays exactly where it was.

One honest caveat: the CPU spike when home first renders did not measurably improve.
Averaged over three rounds it was 94.5% against 102.7%, which is well inside the noise.
The win shows up while you are using the page, not while it loads.

**`hide-videos.js`** turned out to help performance too, which I did not expect. With it
switched off, long frame time on home went from 471 ms to 1,254 ms per 3.3 seconds of
mouse movement, because Spotify then really does render all that video content.

## Tuning the duotone

The two colours sit at the top of `duotone-covers.js`:

```js
const FALLBACK_DARK  = "#837f95";  // shadows
const FALLBACK_LIGHT = "#000000";  // highlights
```

Swap them and you get a normal duotone instead of a negative. If you would rather set it
from CSS, a custom property on `:root` wins over both:

```css
:root { --ct-duotone-light: #d9c8d3; --ct-duotone-dark: #11111b; }
```

There is also a small helper in `extras/` that edits those values, applies and restarts
for you:

```bash
spotify-duotone '#d9c8d3' --dark '#11111b'
spotify-duotone                              # show what is set right now
```

## The palette

`theme/color.ini` starts from [Catppuccin Mocha](https://github.com/catppuccin/catppuccin)
for the greys: `main #1e1e2e`, `card #313244`, `shadow #11111b`. The accent
(`button #bc8ead`) and the slightly warm text tone (`text #ede3ea`) are mine, not part
of the Catppuccin palette, in case you were about to look them up.

## The extras folder

None of this is part of the Marketplace package and all of it is Arch Linux specific.
Take what is useful.

* **`spotify-duotone`** sets the duotone colours. Put it somewhere on your `PATH`.
* **`spotify-flags.conf`** belongs in `~/.config/spotify-flags.conf`. The
  `--force-device-scale-factor=1` flag is there to counteract `GDK_SCALE=2` on HiDPI
  setups. Worth knowing: `/usr/bin/spotify` is a wrapper that reads this file, and a
  `.desktop` override gets ignored, so this is where persistent flags go.
* **`99-spicetify.hook`** is a pacman hook that re applies Spicetify after Spotify
  updates. Replace `%USER%` with your own username before copying it into
  `/etc/pacman.d/hooks/`.

## Thanks

* [Turntable](https://github.com/grasonchan/spotify-spice) by Grason Chan, the theme all
  of this is built on, MIT licensed
* [Catppuccin](https://github.com/catppuccin/catppuccin) for the Mocha palette
* [Spicetify](https://spicetify.app/), which makes any of this possible

## Licence

MIT. See [LICENSE](LICENSE), where Turntable's original copyright is kept intact.
