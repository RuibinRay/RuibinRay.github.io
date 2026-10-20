/*
 * data/gallery.js — "Memories": a photo gallery that only appears once it has photos.
 *
 * Travel photos you add in data/travel.js (countries[].photos and trips[].photos) are included
 * automatically under "Travel". Add any other photos here.
 *
 * Each photo:
 *   src       path to the image, e.g. 'assets/media/life/friends/friends-01.webp'. Photos prepared with
 *             tools/prepare_media.py (README → "Prepared photos and certificates") come in three sizes and
 *             the site picks the one each screen needs; any other JPG/PNG/WebP is used as it is
 *   w, h      the width and height of that file in pixels (printed by the tool), so the page can lay it out
 *   alt       what the photo shows, for screen readers
 *   caption   one line shown under the photo
 *   category  one of the categories below (or a new one — it becomes a filter automatically)
 *   country   ISO alpha-3 code (optional, links to the map), e.g. 'USA'
 *   place     city or place name (optional)
 *   date      'YYYY' or 'YYYY-MM' (optional)
 *   story     a longer note shown when the photo is opened (optional)
 *   public    set to false to keep a photo in the file but off the site
 *
 * Other images: keep them around 1600–2000 px on the long side and under ~500 KB so the page stays fast.
 */
window.SITE = window.SITE || {};

SITE.gallery = {
  categories: ['Travel', 'Friends & memories', 'University life', 'Cities & architecture', 'Nature & landscapes', 'Personal projects', 'Behind the scenes'],
  photos: [
    { src: 'assets/media/life/friends/friends-01.webp', w: 1536, h: 2048, caption: 'Friends', category: 'Friends & memories' },
    { src: 'assets/media/life/friends/friends-02.webp', w: 1536, h: 2048, caption: 'Friends', category: 'Friends & memories' },
    { src: 'assets/media/life/friends/friends-03.webp', w: 1536, h: 2048, caption: 'Friends', category: 'Friends & memories' },
    { src: 'assets/media/life/friends/friends-04.webp', w: 1536, h: 2048, caption: 'Friends', category: 'Friends & memories' },
    { src: 'assets/media/life/koko/koko-01.webp', w: 2048, h: 1152, caption: 'My dog Koko', category: 'Friends & memories' },
    { src: 'assets/media/life/koko/koko-02.webp', w: 2048, h: 1152, caption: 'My dog Koko', category: 'Friends & memories' }
    // { src: 'assets/img/gallery/example.jpg', alt: '…', caption: '…', category: 'University life', country: 'USA', place: 'Boston', date: '2025-10', story: '', public: true },
  ]
};
