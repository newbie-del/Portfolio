# Portfolio

Personal portfolio for **Abhishek Ghatekar** — Full-Stack Developer, AI Enthusiast, Problem Solver.

A seven-page site built as an instrument panel rather than a brochure: every project ships
with a live **X-Ray teardown** that separates its architecture into layers you can inspect
in 3D, and the playground runs six real-time simulations in the browser.

**Live:** _not yet deployed_

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript 5.9 |
| Styling | Tailwind CSS v4 (CSS-first `@theme`) |
| 3D | React Three Fiber, drei, three.js |
| Motion | Framer Motion, GSAP |
| Icons | lucide-react |

## Routes

| Route | What it is |
|---|---|
| `/` | Live 3D workspace hero |
| `/about` | Portrait point-cloud, principles, education |
| `/work` | Project archive — 7 projects |
| `/work/[slug]` | Case study + X-Ray teardown |
| `/stack` | Interactive ecosystem graph |
| `/journey` | Scroll-driven timeline |
| `/playground` | Six live canvas experiments |
| `/contact` | Direct lines, build status, simulated build log |

## Architecture

```
src/
  app/          routes, per-segment metadata, sitemap + robots
  components/
    three/      R3F scenes (all lazy-loaded, client-only)
    ui/         design-system primitives
    layout/     nav, shell, transitions
    work/ stack/ journey/ playground/ contact/
  data/         all content — projects, skills, journey, about, contact
  lib/motion.ts shared easing, duration and variant tokens
```

Two rules the codebase holds to:

- **Content lives in `src/data`, never in components.** Pages render data; they don't own it.
- **Every 3D element has a reason.** R3F owns environments, spatial interaction and camera
  work. HTML/CSS owns typography, navigation and anything that must stay readable.

## Accessibility & performance

- `prefers-reduced-motion` is honoured globally — every animation and transition is nulled.
- All heavy 3D is `next/dynamic({ ssr: false })` with loading states and CSS fallbacks.
- 3D scenes are disabled on mobile in favour of static equivalents.
- Static export across all 19 routes; ~103 kB shared First Load JS.

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Contact

- **Email** — ghatekarabhishek0@gmail.com
- **GitHub** — [github.com/newbie-del](https://github.com/newbie-del)
- **X** — [x.com/AbhishekGhatekr](https://x.com/AbhishekGhatekr)
