/*
 * data/site.js — who you are, in one place.
 *
 * Everything shown on the site comes from the files in /data. Edit the text here and refresh.
 * Rules this file follows:
 *  - Only facts you supplied are filled in.
 *  - Empty strings ('') and empty lists ([]) are hidden on the public site.
 *  - Open the site with ?draft at the end of the address (e.g. ruibinray.github.io/?draft)
 *    to see every empty field as a marked placeholder, so you know what is left to fill in.
 */
window.SITE = window.SITE || {};

SITE.profile = {
  name: 'Ruibin Jin Yao',
  legalName: 'Edwin Ruibin Jin Yao',
  goesBy: 'Ray',
  heroName: ['RUIBIN', 'JIN YAO'],          // the two lines of the name on the homepage
  tagline: 'Building my own constellation.',
  intro: 'Exploring the intersection of finance, business, analytics, and technology.',
  basedIn: 'Boston, MA',
  bornIn: 'Costa Rica',
  roots: 'Costa Rica and China',
  graduation: 'December 2026',
  focus: 'Energy and international business development, finance, and analytics',
  relocation: 'Open to relocating anywhere.',
  languages: [
    { name: 'English', native: 'English', note: '' },
    { name: 'Spanish', native: 'Español', note: '' },
    { name: 'Mandarin', native: '中文', note: 'HSK Level 7–9' }
  ]
};

SITE.links = {
  email: 'ruibinjinyao@gmail.com',
  phones: [                                    // shown beside the email; leave a number empty to hide it
    { number: '+1 617 256 4136', label: 'United States' },
    { number: '+506 7297 1174', label: 'Costa Rica' }
  ],
  // The five stars in the contact sky (on the painted stars on desktop, drawn under the text on phones)
  instagram: 'https://www.instagram.com/ruibin.jin/',
  x: 'https://x.com/RuibinJin',
  facebook: 'https://www.facebook.com/ruibin.jin.9',
  github: 'https://github.com/RuibinRay',
  linkedin: 'https://www.linkedin.com/in/edwin-ruibin-jin-yao-a6b050239',
  resume: '',                                  // e.g. 'assets/docs/resume.pdf' after you add the file
  other: [                                     // more profiles: { label: 'Medium', url: 'https://…' }
  ]
};

SITE.meta = {
  siteUrl: 'https://ruibinray.github.io/',
  repo: 'RuibinRay/RuibinRay.github.io',      // where photos uploaded to assets/photos/ are found
  branch: 'main',
  year: 2026,
  paintingCredit: ''                           // who painted the homepage artwork, e.g. 'Painting by …' — leave empty to hide
};

SITE.about = {
  lead: 'Born in Costa Rica, with roots in China, finishing my degree in Boston. My work sits where finance, data and international markets meet.',
  blocks: [
    {
      title: 'Where I’m from',
      text: 'I’m Ray — Edwin Ruibin Jin Yao. I was born in Costa Rica, my roots are in both Costa Rica and China, and I’m based in Boston, where I’m finishing a BBA in Finance & Business Analytics at Hult International Business School.'
    },
    {
      title: 'Three languages at work',
      text: 'I speak English, Spanish and Mandarin, and I’ve used all three on the job: coordinating Chinese and Costa Rican partners at CCECC Costa Rica, translating official documents, and writing partnership proposals in all three languages during my 2026 internship in Shenyang.'
    },
    {
      title: 'What I care about',
      text: 'Connecting business strategy with data-driven decision-making, and finding opportunities across international markets. I’m interested in finance, business strategy, analytics, technology, entrepreneurship and international business.'
    },
    {
      title: 'What I’m looking for',
      text: 'Roles in energy and international business development, finance, and analytics. I’m open to relocating anywhere.'
    },
    {
      title: 'Problems I enjoy solving',
      text: ''   // your words — e.g. what kind of question you like to be handed
    },
    {
      title: 'What I hope to build',
      text: ''   // your words
    }
  ],
  photo: { src: '', alt: '' },                  // e.g. { src: 'assets/img/ray.jpg', alt: 'Ray in Boston' }
  offTheClock: ['Basketball', 'Video games', 'Music production', 'Songwriting', 'Cooking', 'Movies']
};

SITE.education = [
  {
    id: 'hult',
    school: 'Hult International Business School',
    place: 'Boston, MA',
    degree: 'BBA, Finance & Business Analytics',
    when: 'Graduating December 2026',
    notes: ['Dean’s List, Fall 2024']
  },
  {
    id: 'lincoln',
    school: 'Lincoln School',
    place: 'Heredia, Costa Rica',
    degree: 'International Baccalaureate Diploma',
    when: 'June 2023',
    notes: []
  }
];

SITE.awards = [
  {
    id: 'hflc',
    title: 'Hult Future Leaders Challenge',
    year: '2022',
    text: 'My team placed third globally among 115 teams.',
    evidence: ''      // link to a certificate, article or announcement
  },
  {
    id: 'deans-list',
    title: 'Dean’s List',
    year: 'Fall 2024',
    text: 'Hult International Business School.',
    evidence: ''
  }
];

SITE.certifications = [
  { title: 'HSK Level 7–9', issuer: 'Chinese Proficiency Test', year: '2022', url: '' },
  { title: 'International Baccalaureate Diploma', issuer: 'Lincoln School, Costa Rica', year: '2023', url: '' },
  { title: 'Accounting Job Simulation', issuer: 'Koch Industries via Forage', year: '2024', url: '' },
  { title: 'Foundations of Digital Marketing & E-commerce', issuer: 'Google', year: '2025', url: '' },
  { title: 'Introduction to Financial Accounting', issuer: 'University of Pennsylvania', year: '2026', url: '' },
  { title: 'Corporate Governance in US & UK', issuer: 'EDUCBA', year: '2026', url: '' },
  { title: 'AI Fundamentals', issuer: 'Google', year: '2026', url: '' }
];

SITE.coursework = [
  {
    group: 'Finance',
    courses: ['Corporate Finance', 'Financial Reporting', 'Corporate Governance (BCCI and Madoff cases)', 'Financial Markets & Institutions', 'Derivatives & Risk Management', 'Finance 1']
  },
  {
    group: 'Analytics & data',
    courses: ['Supervised Machine Learning (Breast Cancer Wisconsin case)', 'Unsupervised Machine Learning (K-Means, PCA)', 'Managing Structured Data with SQL', 'Digital Marketing Analytics', 'Quantitative Decision Making', 'Advanced Excel: Data Modeling & Automation', 'Fundamentals of Business Analytics']
  },
  {
    group: 'Strategy & operations',
    courses: ['Hult Business Challenge (semi-finals, CambridgeSide mall)', 'Operations & Supply Chain Management (Boston Duck Tours project)', 'Business Strategy', 'Marketing']
  }
];
