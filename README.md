# HarizX — harizx.com

An experimental, editorial one-page site for an AI / automation / web
studio. Built with Next.js 15, React 19, TypeScript, Tailwind CSS 4,
GSAP (ScrollTrigger), and Lenis smooth scroll.

## Before going live

1. **Point `siteConfig.url`** at the production domain if it ever moves
   off `harizx.com` — it drives canonical, OG, sitemap, and robots.
2. **Connect inquiry delivery.** Set `CONTACT_WEBHOOK_URL` (see
   [`.env.example`](.env.example)) or swap in an email provider inside
   [`deliverInquiry.ts`](src/lib/deliverInquiry.ts). Until then the form
   validates and logs server-side rather than reporting a false success.
3. **Confirm the social handles** in `siteConfig.social` — they are
   guessed from the brand name, not verified.
4. **Swap the demo projects** in [`data.ts`](src/lib/data.ts) for real
   case studies as engagements close (`demo: false`, update `status`).
5. **Rate limiting is per-instance and in-memory.** On multi-instance or
   serverless hosting, move it to a shared store (Upstash/Redis).
6. **The integrations strip lists tools, not clients.** It appears under
   the hero and in the footer, labelled "Built on / connected to". Trim
   `integrations` in [`data.ts`](src/lib/data.ts) to platforms HarizX
   genuinely uses. Do not relabel it "Trusted by" or "Our clients"
   without real, substantiable relationships — those are third-party
   trademarks and the claim would be false.

## Type system

Three roles, defined once as CSS variables in
[`globals.css`](src/styles/globals.css) and loaded in
[`layout.tsx`](src/app/layout.tsx) with `font-display: swap`:

| Variable | Family | Role | Helper classes |
| --- | --- | --- | --- |
| `--font-display` | Sora 600/700/800 | Headlines, service names, wordmark, big numbers | `.display`, `.display-light` |
| `--font-body` | Inter 400/500/600 | Paragraphs, form fields, buttons, nav | `.lead`, `.ui-label` |
| `--font-mono` | IBM Plex Mono 400 | Section numbers, ids, tiny metadata **only** | `.mono-label` |

Monospace is capped as an accent: nothing above 13px and no run of
body copy uses it. Change a family in one place and the whole site
follows — components never name a font directly.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

## Opening ident

[`BrandIdent.tsx`](src/components/layout/BrandIdent.tsx) — a ~3s
cinematic opening (≈1.9s on phones, via `timeScale`): black → a red
core ignites → light rays emit → an abstract H/X mark draws itself →
the camera pushes through it → `HARIZX` → tagline → dissolve into the
hero. Pure SVG geometry plus GSAP transforms; no video, no canvas, no
extra dependency.

It is an **enhancement, never a dependency**:

- Plays once per session (`sessionStorage`), skipped on repeat visits
  and under `prefers-reduced-motion`. The check runs in a layout
  effect, so a returning visitor never sees a frame of it.
- A 6s watchdog and a `try/catch` reveal the site if the sequence ever
  fails to complete — the ident cannot trap anyone behind a black
  screen.
- Discreet `Skip →` control, Escape also skips, and page scroll is
  held (and restored) while it covers the page.
- Sound is wired but **off**: `IDENT_SOUND_SRC` in
  [`identSound.ts`](src/lib/identSound.ts) is `null` so no request is
  made. Drop in an audio file and set that constant to enable it;
  playback failures under autoplay policy stay silent by design.

In development only, `?ident=hold` pauses the sequence at frame 0 so
it can be scrubbed with `window.__ident.time(seconds)`. Both aids are
compiled out of production builds.

## Navigation

A floating glass pill ([`Navbar.tsx`](src/components/layout/Navbar.tsx),
styles under `@layer components` in
[`globals.css`](src/styles/globals.css)):

- **≥1024px** — centered capsule: wordmark, five links, white CTA.
- **768–1023px** — capsule shrinks to wordmark + menu button.
- **<768px** — full-width capsule, wordmark + menu button, opening a
  full-screen overlay with numbered items and the CTA last.

It condenses past 80px of scroll (66px→58px tall, darker, deeper blur
and shadow). The active link is driven by
[`useActiveSection`](src/hooks/useActiveSection.ts), an
IntersectionObserver scroll-spy — no scroll listener, no per-frame
layout reads — and shows as full-strength text plus a red hairline.

Menu items come from `siteConfig.nav`; every `href` must match a
section `id` on the page. The pill styles live in `@layer components`
so Tailwind's responsive `display` utilities still override them.

## Rebrand in one file

All brand details live in [`src/lib/config.ts`](src/lib/config.ts):
name, wordmark, tagline, intro, email, socials, nav, CTA, production
URL. Components never hardcode brand strings, so changing that file
rebrands the whole site — including metadata, OG image, sitemap, and
structured data.

Content (services, process steps, projects, timeline options) lives in
[`src/lib/data.ts`](src/lib/data.ts). The four showcase projects are
**in-house demo builds, labelled as such in the UI** (`demo: true`) —
they are not presented as client work. No invented clients,
testimonials, statistics, awards, or partnerships appear anywhere.

## Contact form delivery

The form posts to `POST /api/contact`
([`src/app/api/contact/route.ts`](src/app/api/contact/route.ts)),
which validates input (plus a honeypot spam trap) and currently logs
inquiries server-side. Wire your email provider / CRM / Slack webhook
at the `TODO` marker in that file. The client-side call is isolated in
[`src/lib/submitInquiry.ts`](src/lib/submitInquiry.ts).

## Structure

```
src/
  app/            layout (fonts, SEO), page, api/contact, sitemap, robots
  components/
    layout/       Preloader, Navbar (fullscreen mobile menu), Footer
    animations/   SmoothScroll (Lenis), CustomCursor
    hero/         Hero
    sections/     Marquee, Problem, SystemProcess, WhyUs, Technology, FinalCTA
    services/     Services (expanding rows), ServiceVisual
    work/         WorkShowcase
    about/        About
    contact/      ContactForm
    ui/           VideoLoop (lazy background video)
  hooks/          useGsap (scoped GSAP with cleanup + reduced-motion flag)
  lib/            config, data, gsap setup, ready (preloader handoff)
  styles/         globals.css (design tokens, grain, buttons, cursor)
```

## Media

`public/media/system-loop.mp4` is an AI-generated (Higgsfield / Kling)
abstract 3D loop used in the work showcase. It lazy-loads near the
viewport, plays only while visible, and never plays for
reduced-motion users.

## Accessibility & motion

- Full `prefers-reduced-motion` support: preloader skipped, Lenis
  disabled, GSAP animations skipped, marquee stilled.
- Semantic landmarks, labeled sections, keyboard-operable accordions
  (`aria-expanded`/`aria-controls`), visible focus states, honeypot
  instead of CAPTCHA.
- Custom cursor is decorative only (fine pointers, `aria-hidden`).
