/*
 * data/travel.js — the atlas. Edit this file to light up the map.
 *
 * COUNTRIES — one entry per country you want to mark. Anything not listed stays "undiscovered".
 *   code     ISO 3166-1 alpha-3 code: CRI Costa Rica · CHN China · USA United States · JPN Japan ·
 *            MEX Mexico · ESP Spain · FRA France · GBR United Kingdom · SAU Saudi Arabia · AUS Australia …
 *            (full list: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3)
 *   status   'home'     — where you're from (drawn like a visited country, marked Home)
 *            'visited'  — you have been there
 *            'current'  — where you are now (animated highlight)
 *            'wishlist' — you want to go
 *   years    list of years you were there, e.g. [2019, 2026] — only years you actually know
 *   cities   list of { name, note }
 *   story    your own words about the country ('' hides it)
 *   highlights list of { kind, text } — kind is anything: 'Food', 'Culture', 'Architecture', 'Nature', …
 *   learned  what you took away;  companions: who you travelled with (optional)
 *   photos   list of { src, alt, caption, date, place } — put image files in assets/img/travel/
 *   videos   list of { src, poster, caption } — short .mp4 clips in assets/video/
 *   related  connected stars: 'j:<journey id>', 'w:<project id>', 's:<skill id>'
 *   For 'wishlist' countries, use: reasons, places (list), activities (list), notes.
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
      cities: [
        { name: 'Heredia', note: 'Lincoln School — IB Diploma, June 2023' }
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
      cities: [
        { name: 'Shenyang', note: 'Overseas Sales / Business Development Intern at HJAT, Jun – Aug 2026' }
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
      cities: [
        { name: 'Boston, MA', note: 'BBA at Hult International Business School — graduating December 2026' }
      ],
      story: '',
      highlights: [],
      learned: '',
      companions: '',
      photos: [],
      videos: [],
      related: ['j:deans-list', 'j:graduation', 'w:cambridgeside', 'w:duck-tours']
    }
    // Example of a wishlist entry (copy, remove the // and fill in):
    // { code: 'JPN', status: 'wishlist', reasons: '…', places: ['…'], activities: ['…'], notes: '' },
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
