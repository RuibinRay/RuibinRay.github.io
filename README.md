# ruibinray.github.io

The personal website of **Ruibin (Ray) Jin Yao**, built around a living Starry Night ocean painting.

**Live site:** https://ruibinray.github.io

Plain HTML, CSS and JavaScript. No build step, no framework, no backend, no trackers. Everything you'll want to change lives in the `data/` folder.

---

## What's on the site

| Section | What it is | Edit it in |
|---|---|---|
| Home | The painting, animated in WebGL. The sky flows along its own brushstrokes, the ocean rolls on its own, and the figure and driftwood stay still. Seven painted stars are doorways: point at one and it swells, swirls and glows; click it to fly through it into a section. | `data/site.js` (name, tagline); the doorways are `hotspots` in `assets/js/main.js` |
| About: *Beyond the Horizon* | Your story, the at-a-glance facts, education, the Hult Future Leaders Challenge result and hobbies | `data/site.js` |
| Experience: *The Journey So Far* | Education, work, milestones and certifications as one constellation timeline, with filters by kind and year | `data/journey.js` |
| World: *A world still waiting to be discovered* | An interactive world map (real borders) with visited, current, wishlist and undiscovered countries, statistics, a year filter, a replay and milestones. Each country opens its chapter: a map of its provinces/states with the cities you've been to, and the photos from each place. On phones the map keeps its full width and is swiped sideways. | `data/travel.js`, photos in `assets/photos/` |
| Memories | Every photo on the site in one gallery. **It stays hidden until there's at least one photo.** | `assets/photos/`, `data/gallery.js`, `data/travel.js` |
| Projects: *My Constellations* | Your work as constellations, each star opening a full case study | `data/work.js` |
| Skills: *My Palette* | Skills as bands of paint. Point at a colour (or tap it on a phone, or Tab to it) and it widens to show the skill, its tools and the work where it shows, while the others dim. Also languages, certifications and coursework. | `data/palette.js` (the chips are each skill's `tools`), `data/site.js` |
| *How it all connects* | Every place, milestone, project and skill as one star chart (plain SVG, no chart library). The stars drift gently and the lines follow them. The lines come from the `related` links in your data. On phones the chart keeps its size and is swiped sideways. | the `related` fields |
| Contact: *Under the Same Sky* | Back to the full painting. Your email and phone numbers sit beside the text (each with a Copy button), with a "Save my contact card" button that downloads a contact card (.vcf) for a phone's address book. Instagram, X, Facebook, LinkedIn and GitHub are five painted stars joined by a gold line (on phones the constellation is drawn under the text). | `data/site.js` → `links` |

Everything links to everything: a project opens the country where it happened, a country opens the jobs you did there, a skill opens the projects that used it. That's the constellation.

---

## Editing your content

Open any file in `data/`, change the text, save, refresh. The files are commented.

Three rules the site follows:

1. **Empty means hidden.** Any `''` or `[]` is left off the public site, so nothing half-finished shows.
2. **Draft view shows what's missing.** Add `?draft` to the address, e.g. `https://ruibinray.github.io/?draft`. Every empty field appears as a gold dashed "To add:" note, along with the atlas editor.
3. **Nothing is invented.** Every fact on the site came from you. Fields with no information stay empty.

### Things still worth adding (open `?draft` to see them all)

- [ ] **The cities and provinces/states you visited** in Canada, South Korea, China and the US: `places` in `data/travel.js`, or simply upload photos into a folder for each place (see *Adding photos*).
- [ ] **Photos** from each country: see *Adding photos*.
- [ ] **A résumé PDF**: put it at `assets/docs/resume.pdf`, then set `links.resume: 'assets/docs/resume.pdf'`.
- [ ] **A portrait**: `assets/img/ray.jpg`, then `about.photo` in `data/site.js`.
- [ ] **"Problems I enjoy solving"** and **"What I hope to build"**: `data/site.js` → `about.blocks`.
- [ ] **Case-study details**: objective, approach, insights, results, images and links for each project in `data/work.js`.
- [ ] **Evidence for the Hult Future Leaders Challenge**: `awards[0].evidence` in `data/site.js`.
- [ ] **Your wishlist and travel stories**: see *Updating the atlas* below.
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
{ code: 'KOR', status: 'visited', years: [2024],
  places: [
    { name: 'Seoul', note: 'One line about it' },
    { name: 'Busan' },
    { name: 'Jeju', type: 'region' }              // a whole province/state rather than a city
  ],
  story: 'Your words…', highlights: [ { kind: 'Food', text: '…' } ], learned: '…',
  related: [] }
```

- `status`: `home`, `visited`, `current` (an animated highlight) or `wishlist`.
- `places`: cities and provinces/states, in English or the local spelling. The country's chapter maps them: the province/state lights up gold and each city gets a star. Add `region: 'Liaoning'` to tell apart places with the same name, or `coords: [lat, lon]` for a spot the map doesn't know (a beach, a park).
- Photos for a place go in `assets/photos/<CODE>/<place>/`. They appear under that place without editing this file (see *Adding photos*).
- Wishlist countries use `reasons`, `hopeToSee`, `activities` and `notes` instead.
- Codes are ISO 3166-1 alpha-3: `CRI` Costa Rica, `CHN` China, `USA`, `CAN` Canada, `KOR` South Korea, `JPN`, `MEX`, `ESP`, `FRA`, `GBR`… ([full list](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3)).

**`trips`** are dated journeys. They drive the year filter and the replay, and a country can have many of them.

The statistics (countries, % of the world, continents, places, trips, photos, wishlist) and the milestones ("First country", "Two continents", "Five countries"…) are **calculated from this file**. Nothing is typed in by hand.

### The in-browser editor (draft view)

1. Open `https://ruibinray.github.io/?draft` and scroll to the map.
2. Click a country and choose **Visited / Currently here / Wishlist / Home / Undiscovered**.
3. Click **Download travel.js** under the map.
4. Replace `data/travel.js` in your repository with the downloaded file and commit it.

Edits made in the browser are saved **only in that browser** (localStorage). They are not public, they don't sync to your phone or other computers, and clearing site data erases them. They only go live once you commit the downloaded file. GitHub Pages is static hosting: it has no database or backend.

> If you later want to edit the site from your phone without touching files, a free headless CMS (for example Decap CMS with GitHub login) can sit on top of these same data files. That's optional and needs separate setup.

---

## Adding photos

Upload them to the repository; no code to edit.

```
assets/photos/<COUNTRY>/<place>/<photo>.jpg     e.g. assets/photos/CHN/shenyang/2026-07-12 Zhongjie at night.jpg
assets/photos/<COUNTRY>/<photo>.jpg             the country in general ("Around China")
```

- On github.com, open `assets/photos`, click into the country (or place) folder, then **Add file → Upload files**. For a new place, drag in a whole folder named after it, like `seoul`.
- A photo shows under its city or province/state in the country's chapter on the World map **and** in the Memories gallery. A new place folder also lights up that place on the country's map.
- The file name becomes the caption (`2026-07-12 Zhongjie at night.jpg` → "Zhongjie at night", Jul 2026).
- Use JPG, PNG or WebP around 2000 px and under ~500 KB (export iPhone HEIC photos as JPEG first). Remove the GPS location from photos you don't want to reveal it: the repository is public.

[`assets/photos/README.md`](assets/photos/README.md) has the details. The site finds new photos by asking GitHub's API for the list of files (GitHub Pages can't list folders by itself). If GitHub doesn't answer, it shows the photos it already knows about.

Photos can also be listed by hand, with a longer caption or a story: in `data/gallery.js` (category, place, date, story) or under a place in `data/travel.js`. Set `public: false` on a listed photo to keep it off the site. The Memories section and its menu link only appear once there's at least one public photo.

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
| `?lite` | Starts with the lighter painting that slower devices switch to |
| `?why` | Shows a line at the bottom of the screen saying how the painting is being drawn on this device (living or still, full or lighter, resolution, frames per second, graphics chip) and, if it is still, why |
| `#projects/market-maps` | Opens a case study directly; also `#world/CHN`, `#experience/hjat`, `#skills/finance` |

---

## Publishing and updating on GitHub Pages

The site is published from the `main` branch of the repository **`RuibinRay/RuibinRay.github.io`**. Any change pushed to `main` is live at https://ruibinray.github.io within a minute or two.

**Quick edits on github.com:** open the file (e.g. `data/site.js`), click the pencil icon, edit, then click **Commit changes**.

**After changing code (CSS or the files in `assets/js/`):** change the `?v=` number on the `<link>` and `<script>` lines at the bottom of `index.html` (e.g. `?v=20261020` → `?v=20261105`), so visitors' browsers fetch the new files instead of using copies they saved earlier. Edits to `data/` files show up within about ten minutes either way.

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
- **Stars and the moon** stay exactly where they are painted. Each pulses at its own pace and now and then shimmers. A doorway star senses the pointer: it swells about 12%, its strokes swirl, a golden halo opens and the sky around it bends toward it. Clicking it flies the camera through the star into its section in about a second. The opening differs by section: the strokes part for World, a star-scattered iris for Experience and Projects, a softer dissolve for About.
- Moving the mouse shifts the sky a few pixels against the foreground for depth.
- **Scrolling moves a camera through the painting while it keeps moving.** Each section has its own framing and colour mood, and the camera glides between them as you scroll (the zoom deepens section by section; About is warmer, Experience cooler with faster currents, World sea-green, Memories sepia, Projects violet, My Palette richer in colour, *How it all connects* deep blue with brighter stars), then pulls back to the whole painting for Contact. The settings are `CAMS` in `assets/js/main.js`: `z` zoom, `cx`/`cy` where to look (0–1 across the painting), `dim` darkening, `tint` (red, green, blue), `sat` saturation, `flow` paint speed, `glow` star brightness. The veils behind the text thin out where two sections meet, so the change shows while you scroll.
- This is plain JavaScript in the painting's own render loop: the scroll position sets a target and the camera eases toward it every frame. GSAP with ScrollTrigger would do the same job but adds about 115 KB and a second animation loop.
- **It moves on its own.** The round ❚❚ button in the navigation pauses and resumes it (remembered in that browser), as accessibility guidelines ask for anything that moves by itself. Paused, the painting also stops zooming with the scroll and holds its opening framing.
- **Reduce motion:** with *Reduce motion* turned on in the device's settings, the painting keeps moving, but calmly: the paint flows at under half the speed, the spirals hold still, no stars flare, and star doorways fade instead of flying. Scrolling still glides the camera and changes the colours; the pause button stops all of it.
- **Slower devices:** the resolution adapts first; if that isn't enough, the site switches to a lighter painting (the same flowing sky and sea and glowing stars, without the stars' swell and swirl); only if even that can't keep up does it show the still image with soft CSS star glows. Without WebGL (for example with the browser's graphics acceleration turned off) or with software-only graphics, the still image is shown. If the graphics context is lost (a driver reset, waking from sleep), the painting comes back by itself. Open the site with `?why` to see which of these applies on a device.

To tune the motion, change `this.params` in `painting.js`: `[sky flow, sea flow, swell, star glow]`.

The motion maps are tailored to this painting. If you replace the artwork, regenerate them with `tools/build_flow_maps.py` (its header explains how), update the star list at the top of `painting.js`, and run `python3 tools/make_embedded.py` to refresh the local-preview bundle.

The artwork was upscaled 4× with Real-ESRGAN, so it stays sharp on large screens.

---

## Accessibility and performance

- Full keyboard navigation with visible focus outlines and a skip link. The homepage star doorways are links: Tab to one and press Enter to travel; Back returns you to where you were. Timeline stars work with arrow keys. The star chart is a single tab stop, moved with the arrow keys and opened with Enter. Every country can be reached through the map search.
- Respects *Reduce motion*: calmer movement (see above) and a star doorway becomes a short fade. The pause button stops all movement, including the zoom with the scroll. Dialogs trap focus and close with Esc.
- Type: Fraunces for headings and Instrument Sans for text, on one fluid scale (`--t-2xs` to `--t-4xl` at the top of `assets/css/site.css`) that grows smoothly from a phone to a wide screen instead of jumping at breakpoints.
- A first visit loads about 1.5 MB on desktop and about 1.1 MB on phones. The world map (~320 KB) loads only as you approach it, and a country's provinces/states (8–95 KB) only when that country is opened.
- Fonts, map data and libraries are all self-hosted. The one outside request goes to GitHub's API for the list of uploaded photos, at most once every 10 minutes per visitor (GitHub already hosts the site). No trackers, no cookies.

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
  travel.js               the atlas: countries, places, trips
  gallery.js              hand-listed photos (optional)
  world.js                country borders (generated, don't edit)
  regions/                provinces/states and cities of each country (generated, don't edit)
assets/
  photos/                 ← your photos: <COUNTRY>/<place>/  (see its README)
  css/site.css            all styles
  js/                     painting.js · main.js · ui.js · places.js · sections.js · journey.js · work.js · atlas.js · constellation.js · gallery.js
  painting/               the artwork in three sizes, motion maps, embedded.js (local preview)
  fonts/ flags/ img/ vendor/
tools/                  build_flow_maps.py, make_embedded.py, build_regions.mjs, source/painting-original.jpg
site.webmanifest, robots.txt, sitemap.xml, .nojekyll
```

## Credits

- Fonts: [Fraunces](https://github.com/undercasetype/Fraunces) and [Instrument Sans](https://github.com/Instrument/instrument-sans), SIL Open Font License (licences in `assets/fonts/`)
- Country borders: [Natural Earth](https://www.naturalearthdata.com/) (public domain) via [world-atlas](https://github.com/topojson/world-atlas); provinces/states and cities: Natural Earth 1:10m admin-1 and populated places (public domain)
- Map code: [d3-geo, d3-zoom](https://d3js.org/) and [topojson-client](https://github.com/topojson/topojson-client), ISC licence (`assets/vendor/LICENSES.txt`)
- Flags: [flag-icons](https://github.com/lipis/flag-icons), MIT licence
- Homepage painting: a Starry Night ocean scene after Vincent van Gogh
