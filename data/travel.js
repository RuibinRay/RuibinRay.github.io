/*
 * data/travel.js — the atlas. Edit this file to light up the map.
 *
 * COUNTRIES — one entry per country you want to mark. Anything not listed stays "undiscovered".
 *   code     ISO 3166-1 alpha-3 code: CRI Costa Rica · CHN China · USA United States · CAN Canada ·
 *            KOR South Korea · JPN Japan · MEX Mexico · ESP Spain · FRA France · GBR United Kingdom …
 *            (full list: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3)
 *   status   'home'     — where you're from (drawn like a visited country, marked Home)
 *            'visited'  — you have been there
 *            'current'  — where you are now (animated highlight)
 *            'wishlist' — you want to go
 *   years    list of years you were there, e.g. [2019, 2026] — only years you actually know
 *   places   the provinces/states and cities you've been to. Each one is { name, … }:
 *              name     'Shenyang', 'Boston', 'Seoul', 'Vancouver', 'Gyeonggi', 'British Columbia' …
 *                       (English or local spelling; a city is put on the map in the right province/state)
 *              region   optional: its province/state, to tell apart places with the same name
 *              type     optional: 'region' when the place is a whole province/state rather than a city
 *              coords   optional: [latitude, longitude] for a place the map doesn't know (a beach, a park)
 *              note     one line about it;   story: a few sentences (optional)
 *              photos   optional: list of { src, alt, caption, date } — or simply upload the files (below)
 *              folder   optional: the photo folder's name, if it isn't the place name (see PHOTOS)
 *   headline, story, learned, companions — your own words ('' hides them)
 *   highlights list of { kind, text } — kind is anything: 'Food', 'Culture', 'Architecture', 'Nature', …
 *   photos   photos of the country as a whole: list of { src, alt, caption, date } (or upload them, below)
 *   videos   list of { src, poster, caption } — short .mp4 clips in assets/video/
 *   related  connected stars: 'j:<journey id>', 'w:<project id>', 's:<skill id>'
 *   For 'wishlist' countries, use: reasons, hopeToSee (list), activities (list), notes.
 *
 * PHOTOS — upload them to the repository; no code to edit:
 *   assets/photos/<CODE>/<place>/<photo>.jpg   e.g. assets/photos/CHN/shenyang/great-wall.jpg
 *   assets/photos/<CODE>/<photo>.jpg           photos of the country in general ("Around China")
 *   <CODE> is the code above; <place> is the city or province in lowercase with dashes (shenyang, boston,
 *   seoul, british-columbia). A folder for a place that isn't listed here adds it to the map by itself.
 *   A file name becomes the caption: "2024-07-15 Great Wall at sunrise.jpg" → "Great Wall at sunrise",
 *   15 July 2024. Use .jpg, .png or .webp (export iPhone .heic photos as JPEG), ideally under ~500 KB.
 *   The site finds new photos by asking GitHub for the list of files — see README → "Adding photos".
 *
 * TRIPS — dated journeys, used by the year filter and the replay. A country can have many trips.
 *
 * Changes made in the browser with ?draft (the "edit" buttons) are saved only in that browser.
 * They do NOT appear on the public site until you download the file from the editor and replace
 * this one in your repository. See README → "Updating the atlas".
 */
window.SITE = window.SITE || {};

SITE.travel = {
  countries: [
    {
      code: 'CRI', status: 'home',
      headline: 'Where I was born',
      years: [],
      places: [
        { name: 'San José', region: 'San José', note: 'Where I was born' },
        { name: 'Heredia', region: 'Heredia', note: 'Lincoln School — IB Diploma, June 2023' }
      ],
      story: '',
      highlights: [],
      learned: '',
      companions: '',
      photos: [],
      videos: [],
      related: ['j:ib', 'j:ccecc', 'j:mandarin-host', 'j:translator', 'j:mundo', 'w:mundo-bonito']
    },
    {
      code: 'CHN', status: 'visited',
      headline: 'My roots, and a summer of work in Shenyang',
      years: [2026],
      places: [
        { name: 'Shenyang', region: 'Liaoning', note: 'Overseas Sales / Business Development Intern at HJAT, Jun – Aug 2026' }
      ],
      story: '',
      highlights: [],
      learned: '',
      companions: '',
      photos: [],
      videos: [],
      related: ['j:hjat', 'w:market-maps', 'w:study-guides', 'w:outreach']
    },
    {
      code: 'USA', status: 'current',
      headline: 'Where I study and live now',
      years: [],
      places: [
        { name: 'Boston', region: 'Massachusetts', note: 'BBA at Hult International Business School — graduating December 2026' }
      ],
      story: '',
      highlights: [],
      learned: '',
      companions: '',
      photos: [],
      videos: [],
      related: ['j:deans-list', 'j:graduation', 'w:cambridgeside', 'w:duck-tours']
    },
    {
      code: 'CAN', status: 'visited',
      headline: '',
      years: [],
      places: [],          // the provinces and cities you visited, e.g. { name: 'Toronto' }
      story: '',
      highlights: [],
      learned: '',
      companions: '',
      photos: [],
      videos: [],
      related: []
    },
    {
      code: 'KOR', status: 'visited',  // South Korea
      headline: '',
      years: [],
      places: [],          // e.g. { name: 'Seoul' }
      story: '',
      highlights: [],
      learned: '',
      companions: '',
      photos: [],
      videos: [],
      related: []
    }
    // Example of a wishlist entry (copy, remove the // and fill in):
    // { code: 'JPN', status: 'wishlist', reasons: '…', hopeToSee: ['…'], activities: ['…'], notes: '' },
  ],

  trips: [
    {
      id: 'shenyang-2026', country: 'CHN', title: 'Summer in Shenyang',
      start: '2026-06', end: '2026-08',
      cities: ['Shenyang'],
      story: '',
      photos: [],
      related: ['j:hjat']
    }
    // { id: 'tokyo-2027', country: 'JPN', title: '…', start: '2027-03', end: '2027-03', cities: ['Tokyo'], story: '', photos: [] },
  ]
};
