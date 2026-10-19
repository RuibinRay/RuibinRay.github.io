/*
 * data/gallery.js — "Memories": a photo gallery that only appears once it has photos.
 *
 * Travel photos you add in data/travel.js (countries[].photos and trips[].photos) are included
 * automatically under "Travel". Add any other photos here.
 *
 * Each photo:
 *   src       path to the image, e.g. 'assets/img/gallery/boston-snow.jpg' (put files in assets/img/gallery/)
 *   alt       what the photo shows, for screen readers
 *   caption   one line shown under the photo
 *   category  one of the categories below (or a new one — it becomes a filter automatically)
 *   country   ISO alpha-3 code (optional, links to the map), e.g. 'USA'
 *   place     city or place name (optional)
 *   date      'YYYY' or 'YYYY-MM' (optional)
 *   story     a longer note shown when the photo is opened (optional)
 *   public    set to false to keep a photo in the file but off the site
 *
 * Keep images around 1600px on the long side and under ~400 KB (JPG or WebP) so the page stays fast.
 */
window.SITE = window.SITE || {};

SITE.gallery = {
  categories: ['Travel', 'Friends & memories', 'University life', 'Cities & architecture', 'Nature & landscapes', 'Personal projects', 'Behind the scenes'],
  photos: [
    // { src: 'assets/img/gallery/example.jpg', alt: '…', caption: '…', category: 'University life', country: 'USA', place: 'Boston', date: '2025-10', story: '', public: true },
  ]
};
