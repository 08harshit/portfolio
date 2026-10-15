# Featured Projects section — design

## Goal

Add a new "Featured Projects" section to showcase Master Acres, a complete
real estate marketplace platform built and deployed solo (backend,
infra, CI/CD). It must land within seconds for two audiences: freelance
clients judging "can this person ship a whole product unsupervised" and
hiring managers judging scope/ownership/judgment.

## Conceptual split

- **Featured Projects** (new): complete, shipped products built end-to-end.
  Currently just Master Acres; modeled as an array so future projects
  (e.g. the hyperlocal e-commerce app) slot in without a rewrite.
- **Case Studies** (existing, unchanged): deep technical dives into a
  specific problem (real-time collab, query optimization, BigQuery
  pipeline). Stays as-is.

## Page flow

`home.component.ts`: insert `<app-projects id="projects">` between
`<app-impact>` and `<app-about>` — i.e. right after Hero/Impact, before
About and Case Studies. Rationale: lead with the biggest, most complete
proof point before the narrower technical dives.

## Component

New file: `src/app/sections/projects.component.ts`, standalone, following
the conventions already used by `case-studies.component.ts`:
`SectionHeadingComponent`, `BadgeComponent`, `CardComponent`,
`ScrollRevealDirective`. No new WebGL scene — static Tailwind diagram
only (content density matters more here than a visual centerpiece, and
it avoids adding another GL component to maintain).

### Data shape

```ts
interface FeaturedProject {
  title: string;
  tagline: string;
  stack: string[];           // badge chips
  pitch: string;              // 2-3 sentence paragraph
  factBadges: string[];       // "4 apps, 1 monorepo", "Solo-built, end-to-end", etc.
  highlights: string[];       // bullets shown when expanded
  infraNotes: string[];       // bullets shown when expanded
  githubUrl?: string;         // placeholder, undefined for now
  liveUrl?: string;           // placeholder, undefined for now
}

projects: FeaturedProject[] = [ /* Master Acres entry */ ];
```

Rendered via `*ngFor` so adding a second project later is a data change,
not a template rewrite.

### Card layout (per project)

1. Title + tagline + stack badges.
2. Pitch paragraph (adapted from the "What it does" intro).
3. Static architecture diagram (Tailwind boxes): `api` / `website` /
   `admin` / `mobile` converging into shared `packages/`, then into an
   infra row (EC2 + Docker Compose + Caddy, S3/CloudFront, Lambda).
   Mirrors the fallback-diagram style already used in the WebGL scene
   cards in `case-studies.component.ts`.
4. Row of fact badges (4 short, high-signal claims).
5. Collapsible "View full breakdown" (plain component state, no new
   directive) revealing engineering highlights + infra/cost trade-offs
   bullets, trimmed from the source write-up for scannability.
6. Link row: GitHub / Live demo — rendered now as disabled/greyed
   placeholders (no real links yet; user will wire these up later).

## Other changes

- `experience.component.ts`: the "Real estate platform" entry under the
  Freelance role currently shows an "In Progress" badge — flip it to a
  completed state since Master Acres has shipped.
- No nav/hero link changes beyond what's already in place; Hero's
  existing "View Case Studies" button is untouched.

## Out of scope

- No new WebGL scene.
- No new routing/sub-page — everything lives on the one card with an
  inline expand/collapse.
- No real GitHub/live-demo URLs yet (explicit placeholders).
