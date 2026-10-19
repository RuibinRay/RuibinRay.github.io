# ruibinray.github.io

The personal website of **Ruibin (Ray) Jin Yao**, built around a living Starry Night ocean painting.

**Live site:** https://ruibinray.github.io

Plain HTML, CSS and JavaScript. No build step, no framework, no backend, no trackers. Everything you'll want to change lives in the `data/` folder.

---

## What's on the site

| Section | What it is | Edit it in |
|---|---|---|
| Home | The painting, animated in WebGL. The sky flows along its own brushstrokes, the ocean rolls on its own, and the figure and driftwood stay still. Stars in the sky are shortcuts to each section. | `data/site.js` (name, tagline) |
| About: *Beyond the Horizon* | Your story, the at-a-glance facts, education, the Hult Future Leaders Challenge result and hobbies | `data/site.js` |
| Experience: *The Journey So Far* | Education, work, milestones and certifications as one constellation timeline, with filters by kind and year | `data/journey.js` |
| World: *A world still waiting to be discovered* | An interactive world map (real borders) with visited, current, wishlist and undiscovered countries, country chapters, statistics, a year filter, a replay and milestones | `data/travel.js` |
| Memories | A photo gallery. **It stays hidden until you add photos.** | `data/gallery.js` and photos in `data/travel.js` |
| Projects: *My Constellations* | Your work as constellations, each star opening a full case study | `data/work.js` |
| Skills: *My Palette* | Skills as paint colours, each linked to the work where it shows. Also languages, certifications and coursework. | `data/palette.js`, `data/site.js` |
| *How it all connects* | Every place, milestone, project and skill as one star chart. The lines come from the `related` links in your data. | the `related` fields |
| Contact: *Under the Same Sky* | Back to the full painting. On desktop your links are pinned to painted stars. | `data/site.js` → `links` |

Everything links to everything: a project opens the country where it happened, a country opens the jobs you did there, a skill opens the projects that used it. That's the constellation.

---

## Editing your content

Open any file in `data/`, change the text, save, refresh. The files are commented.

Three rules the site follows:

1. **Empty means hidden.** Any `''` or `[]` is left off the public site, so nothing half-finished shows.
2. **Draft view shows what's missing.** Add `?draft` to the address, e.g. `https://ruibinray.github.io/?draft`. Every empty field appears as a gold dashed "To add:" note, along with the atlas editor.
3. **Nothing is invented.** Every fact on the site came from you. Fields with no information stay empty.

### Things still worth adding (open `?draft` to see them all)

- [ ] **Your email**: `data/site.js` → `links.email`. It becomes a star in the contact sky.
- [ ] **A résumé PDF**: put it at `assets/docs/resume.pdf`, then set `links.resume: 'assets/docs/resume.pdf'`.
- [ ] **A portrait**: `assets/img/ray.jpg`, then `about.photo` in `data/site.js`.
- [ ] **"Problems I enjoy solving"** and **"What I hope to build"**: `data/site.js` → `about.blocks`.
- [ ] **Case-study details**: objective, approach, insights, results, images and links for each project in `data/work.js`.
- [ ] **Evidence for the Hult Future Leaders Challenge**: `awards[0].evidence` in `data/site.js`.
- [ ] **Countries you've visited, your wishlist and your travel stories**: see *Updating the atlas* below.
- [ ] **Credit for the painting**: `meta.paintingCredit` in `data/site.js`.

### Linking things together

Projects, journey entries, countries and skills point at each other with short references in their `related` (or `seenIn`) lists:

| Reference | Points to | Example |
|---|---|---|
| `'j:<id>'` | a journey entry in `data/journey.js` | `'j:hjat'` |
| `'w:<id>'` | a project in `data/work.js` | `'w:market-maps'` |
| `'c:<CODE>'` | a country (ISO alpha-3 code) | `'c:CHN'` |
| `'s:<id>'` | a skill in `data/palette.js` | `'s:finance'` |

Add a reference and the link appears in both places' "Connected stars", plus a line in *How it all connects*.

### Adding a project

Copy one of the entries in `data/work.js` and change it:

```js
{
  id: 'my-new-project',            // lowercase, no spaces — used in links like #projects/my-new-project
  short: 'New project',            // label next to the star
  constellation: 'finance',        // storage | finance | analytics | strategy (or add one to SITE.constellations)
  star: [0.5, 0.4],                // where the star sits in its constellation (0–1 across, 0–1 down)
  magnitude: 0.9,                  // brightness, 0.6–1
  title: 'The full title',
  when: 'Jan – Mar 2027', org: 'Who it was for',
  context: '', objective: '', role: '',
  approach: [], tools: [], insights: [], results: [],
  images: [ { src: 'assets/img/work/chart.png', alt: 'What the chart shows', caption: '' } ],
  links: [ { label: 'Read the deck', url: 'https://…' } ],
  related: ['s:finance', 'j:some-entry']
}
```

### Adding a journey entry

Copy an entry in `data/journey.js`. `at: 'YYYY-MM'` places the star; `when` is the date as it's displayed; `type` is one of `work`, `education`, `achievement`, `certification`, `project` or `milestone`. Set `upcoming: true` for something that hasn't happened yet. It's drawn as an unlit star.

---

## Updating the atlas

`data/travel.js` has two lists.

**`countries`** is one entry per country you want to mark. Anything not listed stays undiscovered.

```js
{ code: 'JPN', status: 'visited', years: [2027],
  cities: [ { name: 'Kyoto', note: 'Temples at dawn' } ],
  story: 'Your words…', highlights: [ { kind: 'Food', text: '…' } ], learned: '…',
  photos: [ { src: 'assets/img/travel/kyoto.jpg', alt: '…', caption: '…', date: '2027-04', place: 'Kyoto' } ],
  related: [] }
```

- `status`: `home`, `visited`, `current` (an animated highlight) or `wishlist`.
- Wishlist countries use `reasons`, `places`, `activities` and `notes` instead.
- Codes are ISO 3166-1 alpha-3: `CRI` Costa Rica, `CHN` China, `USA`, `JPN`, `MEX`, `ESP`, `FRA`, `GBR`, `SAU`, `AUS`… ([full list](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3)).

**`trips`** are dated journeys. They drive the year filter and the replay, and a country can have many of them.

The statistics (countries, % of the world, continents, cities, trips, photos, wishlist) and the milestones ("First country", "Two continents", "Five countries"…) are **calculated from this file**. Nothing is typed in by hand.

### The in-browser editor (draft view)

1. Open `https://ruibinray.github.io/?draft` and scroll to the map.
2. Click a country and choose **Visited / Currently here / Wishlist / Home / Undiscovered**.
3. Click **Download travel.js** under the map.
4. Replace `data/travel.js` in your repository with the downloaded file and commit it.

Edits made in the browser are saved **only in that browser** (localStorage). They are not public, they don't sync to your phone or other computers, and clearing site data erases them. They only go live once you commit the downloaded file. GitHub Pages is static hosting: it has no database or backend.

> If you later want to edit the site from your phone without touching files, a free headless CMS (for example Decap CMS with GitHub login) can sit on top of these same data files. That's optional and needs separate setup.

---

## Photos (Memories)

- Gallery photos go in `assets/img/gallery/`, listed in `data/gallery.js` with a category, place, date and optional story.
- Travel photos listed in `data/travel.js` appear in the country's chapter **and** in the gallery automatically.
- Set `public: false` on a photo to keep it in the file but off the site.
- Keep images around 1600 px on the long side and under ~400 KB (JPG or WebP). [Squoosh](https://squoosh.app) does this in the browser.

The Memories section and its menu link only appear once there's at least one public photo.

---

## Previewing on your computer

- **Easiest:** double-click `index.html`. The living painting, fonts and map all work from the file, thanks to `assets/painting/embedded.js`. The browser console will list a few blocked font requests; those are expected and harmless.
- **Closest to the real thing:** in this folder run `python3 -m http.server 8000` and open http://localhost:8000.

Useful address options:

| Add to the URL | Effect |
|---|---|
| `?draft` | Shows placeholders for missing information, plus the atlas editor |
| `?still` | Shows the still painting instead of the animated one |
| `?gl` | Forces the animated painting even on software graphics (for testing) |
| `#projects/market-maps` | Opens a case study directly; also `#world/CHN`, `#experience/hjat`, `#skills/finance` |

---

## Publishing and updating on GitHub Pages

The site is published from the `main` branch of the repository **`RuibinRay/RuibinRay.github.io`**. Any change pushed to `main` is live at https://ruibinray.github.io within a minute or two.

**Quick edits on github.com:** open the file (e.g. `data/site.js`), click the pencil icon, edit, then click **Commit changes**.

**With git:**

```bash
git clone https://github.com/RuibinRay/RuibinRay.github.io.git
cd RuibinRay.github.io
# …edit files…
git add -A
git commit -m "Add Japan to the atlas"
git push
```

**Setting it up from scratch** (only if the repository doesn't exist yet):

1. On GitHub, create a **public** repository named exactly `RuibinRay.github.io`.
2. Upload everything in this folder, keeping the folder structure (including the empty `.nojekyll` file).
3. Go to **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, then **main** and **/(root)**, and click **Save**.
4. After a minute or two the site is live at https://ruibinray.github.io.

All paths are relative, so the site also works from a project repository (e.g. `username.github.io/website/`). Only the 404 page assumes the site sits at the root of the domain.

Never commit passwords, API keys or anything private. Everything in this repository is public.

---

## How the living painting works

`assets/js/painting.js` draws the painting with one WebGL fragment shader:

- **Sky:** a *flow map* (`assets/painting/flow-sky.png`) stores, for every pixel, the direction of the painted brushstrokes. It was measured from the artwork with a colour structure tensor and then oriented to follow the two great spirals, the halos around each star and the moon, and the flowing bands. The shader slides the paint along those directions in two overlapping phases, so strokes stream past each other continuously. A contrast-preserving blend keeps the impasto texture crisp. The central spiral moves slowest and the outer currents faster, each region slightly out of step with the others. The two spirals also breathe: they wind and unwind very slowly.
- **Ocean:** its own flow map follows the foam and wave strokes, plus swells that roll toward you and golden glints under the bright star and the moon.
- **Still things:** the figure, driftwood, rocks, headland and horizon are masked out and never move. Only a faint moonlight shimmer touches the wood.
- **Stars and the moon** stay exactly where they are painted and pulse, each at its own pace.
- Moving the mouse shifts the sky a few pixels against the foreground for depth. Scrolling glides a "camera" through the painting behind each section.
- **Fallbacks:** with *Reduce motion* turned on, the painting is shown as a single still frame. Without WebGL, or with software-only graphics, or if the device can't keep up even at reduced resolution, the still image is shown with soft CSS star glows. The resolution adapts automatically to keep the animation smooth.

To tune the motion, change `this.params` in `painting.js`: `[sky flow, sea flow, swell, star glow]`.

The motion maps are tailored to this painting. If you replace the artwork, regenerate them with `tools/build_flow_maps.py` (its header explains how), update the star list at the top of `painting.js`, and run `python3 tools/make_embedded.py` to refresh the local-preview bundle.

The artwork was upscaled 4× with Real-ESRGAN, so it stays sharp on large screens.

---

## Accessibility and performance

- Full keyboard navigation with visible focus outlines and a skip link. Timeline stars work with arrow keys. The star chart is a single tab stop, moved with the arrow keys and opened with Enter. Every country can be reached through the map search.
- Respects *Reduce motion*. Dialogs trap focus and close with Esc.
- A first visit loads about 1.5 MB on desktop and about 1.1 MB on phones. The map (~320 KB) loads only as you approach it.
- No external requests at all: fonts, map data and libraries are all self-hosted.

---

## Folder map

```
index.html              the page
404.html                "Lost among the stars"
data/                   ← your content
  site.js                 profile, links, about, education, awards, certifications, coursework
  journey.js              The Journey So Far
  work.js                 projects and case studies
  palette.js              skills and tools
  travel.js               the atlas
  gallery.js              photos (optional)
  world.js                country borders (generated, don't edit)
assets/
  css/site.css            all styles
  js/                     painting.js · main.js · ui.js · sections.js · journey.js · work.js · atlas.js · constellation.js · gallery.js
  painting/               the artwork in three sizes, motion maps, embedded.js (local preview)
  fonts/ flags/ img/ vendor/
tools/                  build_flow_maps.py, make_embedded.py, source/painting-original.jpg
site.webmanifest, robots.txt, sitemap.xml, .nojekyll
```

## Credits

- Fonts: [Fraunces](https://github.com/undercasetype/Fraunces) and [Instrument Sans](https://github.com/Instrument/instrument-sans), SIL Open Font License (licences in `assets/fonts/`)
- Country borders: [Natural Earth](https://www.naturalearthdata.com/) (public domain) via [world-atlas](https://github.com/topojson/world-atlas)
- Map code: [d3-geo, d3-zoom](https://d3js.org/) and [topojson-client](https://github.com/topojson/topojson-client), ISC licence (`assets/vendor/LICENSES.txt`)
- Flags: [flag-icons](https://github.com/lipis/flag-icons), MIT licence
- Homepage painting: a Starry Night ocean scene after Vincent van Gogh
