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
 *              photos   optional: list of { src, w, h, caption, date } — or simply upload the files (below);
 *                       tools/prepare_media.py makes the three sizes and prints the line to paste
 *              folder   optional: the photo folder's name, if it isn't the place name (see PHOTOS)
 *   headline, story, learned, companions — your own words ('' hides them)
 *   highlights list of { kind, text } — kind is anything: 'Food', 'Culture', 'Architecture', 'Nature', …
 *   photos   photos of the country as a whole: list of { src, alt, caption, date } (or upload them, below)
 *   cover    a photo shown across the top of the country's chapter (optional; otherwise its first photo)
 *            Photos in assets/media/ were prepared in three sizes (name.webp, name-1080.webp, name-480.webp);
 *            the site picks the right size for each screen. w and h are the full size, for the layout.
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
      cover: 'assets/media/travel/cri/guanacaste/guanacaste-01.webp',
      years: [],
      places: [
        { name: 'San José', region: 'San José', note: 'Where I was born', photos: [
            { src: 'assets/media/travel/cri/san-jose/san-jose-01.webp', w: 2048, h: 1536, caption: 'San José' },
            { src: 'assets/media/travel/cri/san-jose/san-jose-02.webp', w: 2048, h: 1536, caption: 'San José' },
            { src: 'assets/media/travel/cri/san-jose/san-jose-03.webp', w: 2048, h: 1536, caption: 'San José by night' }
          ] },
        { name: 'Heredia', region: 'Heredia', note: 'Lincoln School — IB Diploma, June 2023', photos: [
            { src: 'assets/media/travel/cri/heredia/heredia-01.webp', w: 2048, h: 1155, caption: 'Graduation, Lincoln School' }
          ] },
        { name: 'Arenal', region: 'Alajuela', coords: [10.47, -84.68], note: 'Kayaking, ziplining and the Tabacón hot springs', photos: [
            { src: 'assets/media/travel/cri/arenal/arenal-01.webp', w: 2048, h: 1536, caption: 'Kayaking in Arenal' },
            { src: 'assets/media/travel/cri/arenal/arenal-02.webp', w: 2048, h: 1536, caption: 'Ziplining in Arenal' },
            { src: 'assets/media/travel/cri/arenal/arenal-03.webp', w: 2048, h: 1536, caption: 'Tabacón' },
            { src: 'assets/media/travel/cri/arenal/arenal-04.webp', w: 2048, h: 1152, caption: 'Tabacón hot springs' },
            { src: 'assets/media/travel/cri/arenal/arenal-05.webp', w: 2048, h: 1152, caption: 'Tabacón hot springs' },
            { src: 'assets/media/travel/cri/arenal/arenal-06.webp', w: 2048, h: 1152, caption: 'Tabacón hot springs' }
          ] },
        { name: 'Guanacaste', type: 'region', note: 'The Riu, Playa Flamingo and the Westin', photos: [
            { src: 'assets/media/travel/cri/guanacaste/guanacaste-01.webp', w: 2048, h: 1536, caption: 'Riu, Guanacaste' },
            { src: 'assets/media/travel/cri/guanacaste/guanacaste-02.webp', w: 2048, h: 1536, caption: 'Riu, Guanacaste' },
            { src: 'assets/media/travel/cri/guanacaste/guanacaste-03.webp', w: 2048, h: 1536, caption: 'Riu, Guanacaste' },
            { src: 'assets/media/travel/cri/guanacaste/guanacaste-04.webp', w: 2048, h: 1536, caption: 'Riu, Guanacaste' },
            { src: 'assets/media/travel/cri/guanacaste/guanacaste-05.webp', w: 2048, h: 1534, caption: 'Riu, Guanacaste' },
            { src: 'assets/media/travel/cri/guanacaste/guanacaste-06.webp', w: 2048, h: 1536, caption: 'Riu, Guanacaste' },
            { src: 'assets/media/travel/cri/guanacaste/guanacaste-07.webp', w: 2048, h: 1152, caption: 'Playa Flamingo' },
            { src: 'assets/media/travel/cri/guanacaste/guanacaste-08.webp', w: 2048, h: 1152, caption: 'Riu, Guanacaste' },
            { src: 'assets/media/travel/cri/guanacaste/guanacaste-09.webp', w: 2048, h: 1152, caption: 'The Westin, Guanacaste' }
          ] },
        { name: 'Puntarenas', region: 'Puntarenas', photos: [
            { src: 'assets/media/travel/cri/puntarenas/puntarenas-01.webp', w: 2048, h: 1155, caption: 'Puntarenas' },
            { src: 'assets/media/travel/cri/puntarenas/puntarenas-02.webp', w: 2048, h: 1152, caption: 'Puntarenas' },
            { src: 'assets/media/travel/cri/puntarenas/puntarenas-03.webp', w: 2048, h: 1152, caption: 'Puntarenas' },
            { src: 'assets/media/travel/cri/puntarenas/puntarenas-04.webp', w: 2048, h: 1536, caption: 'Puntarenas' },
            { src: 'assets/media/travel/cri/puntarenas/puntarenas-05.webp', w: 2048, h: 1536, caption: 'Puntarenas' },
            { src: 'assets/media/travel/cri/puntarenas/puntarenas-06.webp', w: 2048, h: 1536, caption: 'Puntarenas' }
          ] }
      ],
      story: '',
      highlights: [],
      learned: '',
      companions: '',
      photos: [
        { src: 'assets/media/travel/cri/cri-01.webp', w: 2048, h: 1536, caption: 'A Costa Rican view' },
        { src: 'assets/media/travel/cri/cri-02.webp', w: 2048, h: 1152, caption: 'Costa Rica' },
        { src: 'assets/media/travel/cri/cri-03.webp', w: 2048, h: 1152, caption: 'Costa Rica' },
        { src: 'assets/media/travel/cri/cri-04.webp', w: 2048, h: 1152, caption: 'Costa Rica' },
        { src: 'assets/media/travel/cri/cri-05.webp', w: 2048, h: 1152, caption: 'Costa Rica' },
        { src: 'assets/media/travel/cri/cri-06.webp', w: 2048, h: 1535, caption: 'Friends in Costa Rica' },
        { src: 'assets/media/travel/cri/cri-07.webp', w: 2048, h: 857, caption: 'Costa Rica' }
      ],
      videos: [],
      related: ['j:ib', 'j:ccecc', 'j:mandarin-host', 'j:translator', 'j:mundo', 'w:mundo-bonito']
    },
    {
      code: 'CHN', status: 'visited',
      headline: 'My roots, and a summer of work in Shenyang',
      years: [2026],
      places: [
        { name: 'Shenyang', region: 'Liaoning', note: 'Overseas Sales / Business Development Intern at HJAT, Jun – Aug 2026', photos: [
            { src: 'assets/media/journey/hjat/vrfb-knowledge-competition.webp', w: 1706, h: 1279, caption: '1st place in the VRFB knowledge competition at HJAT' }
          ] },
        { name: 'Shanghai' },
        { name: 'Changchun', region: 'Jilin' },
        { name: 'Kunming', region: 'Yunnan' },
        { name: 'Dali', region: 'Yunnan' }
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
      cover: 'assets/media/travel/usa/boston/boston-02.webp',
      years: [],
      places: [
        { name: 'Boston', region: 'Massachusetts', note: 'BBA at Hult International Business School — graduating December 2026', photos: [
            { src: 'assets/media/travel/usa/boston/boston-01.webp', w: 2048, h: 1536, caption: 'Revere Beach' },
            { src: 'assets/media/travel/usa/boston/boston-02.webp', w: 2048, h: 1536, caption: 'The view from my school’s study room' },
            { src: 'assets/media/travel/usa/boston/boston-03.webp', w: 2048, h: 1536, caption: 'Museum of Science' },
            { src: 'assets/media/travel/usa/boston/boston-04.webp', w: 2048, h: 1536, caption: 'Boston Public Library' },
            { src: 'assets/media/travel/usa/boston/boston-05.webp', w: 2048, h: 1536, caption: 'Boston Public Library' },
            { src: 'assets/media/travel/usa/boston/boston-06.webp', w: 1536, h: 2048, caption: 'Museum of WNDR' },
            { src: 'assets/media/travel/usa/boston/boston-07.webp', w: 1536, h: 2048, caption: 'Museum of WNDR' },
            { src: 'assets/media/travel/usa/boston/boston-08.webp', w: 1536, h: 2048, caption: 'Museum of WNDR' },
            { src: 'assets/media/travel/usa/boston/boston-09.webp', w: 2048, h: 1536, caption: 'Museum of WNDR' },
            { src: 'assets/media/travel/usa/boston/boston-10.webp', w: 2048, h: 1536, caption: 'Friends in Boston' },
            { src: 'assets/media/travel/usa/boston/boston-11.webp', w: 2048, h: 1536, caption: 'Revere Beach' },
            { src: 'assets/media/travel/usa/boston/boston-12.webp', w: 1152, h: 2048, caption: 'School picture: Hult’s Winter Masquerade' },
            { src: 'assets/media/travel/usa/boston/boston-13.webp', w: 2048, h: 1152, caption: 'Boston' },
            { src: 'assets/media/travel/usa/boston/boston-14.webp', w: 2048, h: 1152, caption: 'Isabella Stewart Gardner Museum' },
            { src: 'assets/media/travel/usa/boston/boston-15.webp', w: 2048, h: 1152, caption: 'The Red Sox at Fenway Park' },
            { src: 'assets/media/travel/usa/boston/boston-16.webp', w: 2048, h: 1152, caption: 'Boston' }
          ] },
        { name: 'Newport', region: 'Rhode Island', coords: [41.47, -71.30], note: 'The Breakers', photos: [
            { src: 'assets/media/travel/usa/newport/newport-01.webp', w: 1536, h: 2048, caption: 'The Breakers' },
            { src: 'assets/media/travel/usa/newport/newport-02.webp', w: 2048, h: 1536, caption: 'The Breakers' },
            { src: 'assets/media/travel/usa/newport/newport-03.webp', w: 2048, h: 1536, caption: 'The Breakers' }
          ] },
        { name: 'Minnesota', type: 'region', photos: [
            { src: 'assets/media/travel/usa/minnesota/minnesota-01.webp', w: 2048, h: 1152, caption: 'Minnesota' },
            { src: 'assets/media/travel/usa/minnesota/minnesota-02.webp', w: 2048, h: 1152, caption: 'Minnesota' }
          ] },
        { name: 'Las Vegas', region: 'Nevada', photos: [
            { src: 'assets/media/travel/usa/las-vegas/las-vegas-01.webp', w: 2048, h: 1536, caption: 'Afterlife: Anyma' },
            { src: 'assets/media/travel/usa/las-vegas/las-vegas-02.webp', w: 2048, h: 1536, caption: 'Las Vegas' },
            { src: 'assets/media/travel/usa/las-vegas/las-vegas-03.webp', w: 2048, h: 1536, caption: 'Las Vegas' },
            { src: 'assets/media/travel/usa/las-vegas/las-vegas-04.webp', w: 1536, h: 2048, caption: 'Las Vegas' },
            { src: 'assets/media/travel/usa/las-vegas/las-vegas-05.webp', w: 2048, h: 1536, caption: 'Las Vegas' },
            { src: 'assets/media/travel/usa/las-vegas/las-vegas-06.webp', w: 2048, h: 1536, caption: 'Las Vegas' },
            { src: 'assets/media/travel/usa/las-vegas/las-vegas-07.webp', w: 2048, h: 1536, caption: 'Las Vegas' },
            { src: 'assets/media/travel/usa/las-vegas/las-vegas-08.webp', w: 1536, h: 2048, caption: 'Las Vegas' },
            { src: 'assets/media/travel/usa/las-vegas/las-vegas-09.webp', w: 1536, h: 2048, caption: 'Las Vegas' }
          ] },
        { name: 'Los Angeles', region: 'California', photos: [
            { src: 'assets/media/travel/usa/los-angeles/los-angeles-01.webp', w: 1536, h: 2048, caption: 'At the chef’s counter' },
            { src: 'assets/media/travel/usa/los-angeles/los-angeles-02.webp', w: 1536, h: 2048, caption: 'Food in Los Angeles' },
            { src: 'assets/media/travel/usa/los-angeles/los-angeles-03.webp', w: 1536, h: 2048, caption: 'Food in Los Angeles' },
            { src: 'assets/media/travel/usa/los-angeles/los-angeles-04.webp', w: 1536, h: 2048, caption: 'Food in Los Angeles' }
          ] }
      ],
      story: '',
      highlights: [],
      learned: '',
      companions: '',
      photos: [
        { src: 'assets/media/travel/usa/usa-01.webp', w: 1536, h: 2048, caption: 'Museum of Ice Cream' }
      ],
      videos: [],
      related: ['j:deans-list', 'j:graduation', 'w:cambridgeside', 'w:duck-tours']
    },
    {
      code: 'CAN', status: 'visited',
      headline: '',
      years: [],
      cover: 'assets/media/travel/can/toronto/toronto-01.webp',
      places: [
        { name: 'Toronto', region: 'Ontario', photos: [
            { src: 'assets/media/travel/can/toronto/toronto-01.webp', w: 1536, h: 2048, caption: 'Market' },
            { src: 'assets/media/travel/can/toronto/toronto-02.webp', w: 1536, h: 2048, caption: 'Museum' },
            { src: 'assets/media/travel/can/toronto/toronto-03.webp', w: 1536, h: 2048, caption: 'Museum' },
            { src: 'assets/media/travel/can/toronto/toronto-04.webp', w: 1536, h: 2048, caption: 'Museum' },
            { src: 'assets/media/travel/can/toronto/toronto-05.webp', w: 2048, h: 1536, caption: 'Museum' }
          ] }
      ],
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
      places: [
        { name: 'Seoul' }
      ],
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
