# Design

<!-- impeccable:design-schema 1 -->

## World

Permanent light **Newsprint** app chrome: warm paper, ink structure, sharp geometry, restrained editorial red. Botanical Ease Health is the anti-reference. ResumeRenderer / A4 print is a separate surface (ADR-0006) and must not inherit Newsprint.

## Palette

| Role | Token | Value |
|------|--------|--------|
| Paper | `--color-newsprint` | `#F9F9F7` |
| Ink | `--color-ink` | `#111111` |
| Rule | `--color-rule` | `#E5E5E0` |
| Accent | `--color-editorial` | `#CC0000` |
| Muted text | `--color-ink-muted` | `#4A4A45` |
| Faint text | `--color-ink-faint` | `#8A8A82` |
| Raised | `--color-paper-raised` | `#FFFFFF` |
| Sunken | `--color-paper-sunken` | `#F0F0EB` |

No dark mode. Editorial red is semantic only (emphasis, error, sparse accent).

## Typography

| Role | Face | CSS |
|------|------|-----|
| Display | Playfair Display | `--font-display` / `--font-playfair` |
| Body | Lora | `--font-body` / `--font-lora` |
| UI | Inter | `--font-ui` / `--font-inter` |
| Meta / data | JetBrains Mono | `--font-mono` / `--font-jetbrains` |

Deliberate fallbacks declared in `app/styles/newsprint-theme.css`. Loaded via `next/font` in `app/layout.tsx`.

## Geometry & depth

- Border radius: `0` everywhere in app UI
- Depth via 1px rules and paper raised/sunken fills — not soft shadows
- Optional hard offset only for deliberate interactive treatment; default is flat inversion on button hover

## Components

Shared primitives under `components/ui/`:

- `Button` — filled / outline / editorial / ghost / link; min 44px targets
- `Input`, `Label`
- `Card` (+ header/title/content)
- `IconBox` — bordered icon container with accessible name
- `Dialog` — sharp modal shell
- `Status` — mono status chip (neutral / success / error / pending)

Clerk auth appearance: `lib/clerk-appearance.ts` (Newsprint colors, `borderRadius: 0px`).

## Surfaces in this slice

- Landing (`LandingHero`)
- Sign in / Sign up shells
- App header / Brand (authenticated shell)
- Token foundation + globals

Later tickets restyle editor, documents, import, and remaining states on these primitives.

## Focus & motion

- `:focus-visible` editorial outline, 2px + offset
- `prefers-reduced-motion` collapses transitions/animations
- Fast mechanical hover (color invert), not soft bounce

## Token source

`app/styles/newsprint-theme.css` imported from `app/globals.css`. Legacy botanical class names may alias to Newsprint values until remaining routes are migrated.
