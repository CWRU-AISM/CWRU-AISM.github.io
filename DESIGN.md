# Design

## Intent

An academic lab site for an engineering lab that works on manufacturing and robots. It is read by prospective students, collaborators, industry partners, and reviewers. It should feel rigorous, industrial, current, and plain-spoken. The lab's own footage provides the color and character, and the rest of the page stays out of its way.

## Signature

The home page grid is a contact sheet of the lab's work: a 4×3 mosaic of equal 16:9 tiles with no gaps and no captions, modeled on Chong Zhang's homepage. It mixes looping clips with still photos from the lab. A tile's title appears on hover and is read by screen readers, and most tiles link to a project. Several runs from one project can share a tile as a single sped-up reel. Videos play only while on screen and stay paused when reduced motion is on.

Further down the page, a three.js globe draws the land as a dot matrix in the theme's ink, with arcs from Cleveland to each partner. It can be dragged, rotates slowly when reduced motion is off, and reads its colors from the CSS tokens so it follows the light and dark themes.

## Type

There is no web font. The page uses the platform UI stack (`ui-sans-serif, system-ui, -apple-system, "Segoe UI", ...`): SF Pro on Apple devices, Segoe UI on Windows. This follows Seokhyun Hwang's site, which the brief named, so it's a deliberate choice rather than a default. Headings are 700 weight at normal width and tracking. Body text is 16px with a 1.25 scale (14, 16, 20, 25, 31, 39 px). Sentence case everywhere, with no all-caps labels and no italic accent words.

## Color

Neutral grays with no hue tint. Links are ink-colored with an underline and turn CWRU blue on hover. The blue also marks the current nav item and the globe pins.

| Role | Light | Dark |
|---|---|---|
| bg | `#ffffff` | `#000000` |
| surface | `#f5f5f5` | `#121212` |
| fg (headings, links) | `#171717` | `#ededed` |
| text (body) | `#404040` | `#c7c7c7` |
| muted | `#737373` | `#8f8f8f` |
| border | `#e5e5e5` | `#262626` |
| accent | `#0a3a7a` | `#8db4ea` |
| focus | `#d97706` | `#f59e0b` |

Dark mode follows the system setting, and a text toggle in the nav overrides it (stored in `localStorage`). It is true black, not a tinted navy.

## Rules

- Radius is 2px on photos and 0 on video tiles. No shadows. No bordered cards. Lists are separated by single rules.
- Spacing is built on an 8px unit, tight within groups and generous between sections. The side gutter is `clamp(16px, 4vw, 48px)`.
- Text measure is at most about 68ch.
- Motion comes only from the videos and the globe. There are no entrance animations.
- Accessibility: a visible focus outline, a skip link, an `aria-label` on every grid tile, and a reduced-motion mode that pauses the videos and the globe.

## Slop audit (2026-11-02)

The scanner found no P0 tells. Its K7 finding is a false positive, because the `:focus-visible` rule lives in `site.css`. A rendered check at 1440px and 390px found no horizontal overflow and no console errors. Nothing here uses purple gradients, Inter, cream with terracotta, eyebrow labels, numbered sections, or bordered cards.
