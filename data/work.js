/*
 * data/work.js — "My Constellations": projects and case studies.
 *
 * Each project is a star; projects with the same `constellation` are drawn together.
 * Case-study fields (leave '' or [] where you have nothing documented — they stay hidden):
 *   context     the problem or opportunity
 *   objective   what the work set out to do
 *   role        your role / contribution
 *   approach    list: methods and steps
 *   tools       list: tools and technologies you actually used
 *   insights    list: what you found
 *   results     list: documented outcomes and deliverables (no invented numbers)
 *   images      list of { src, alt, caption } — put the files in assets/img/work/
 *   links       list of { label, url } — live demo, repository, deck, write-up
 *   related     connected stars: 'w:<project>', 'j:<journey entry>', 'c:<country code>', 's:<skill>'
 * `short` = label drawn next to the star;  `star` = its position in the constellation drawing (0–1 each way);
 * `magnitude` = brightness (0.6–1).
 *
 * Featured projects (the websites) carry a few more fields:
 *   featured    true — shown in "Featured projects" at the top of the section and on the homepage
 *   status      'live' or 'in-progress' (an "In progress" badge, no live link until it is ready)
 *   tagline     one line under the title on the card
 *   tags        other constellations the work belongs to as well, e.g. ['finance', 'analytics']
 *   cover       { src, w, h } — a screenshot of the site (assets/media/work/), used on the card and the case study
 *   glyph       how its star behaves when pointed at: 'sun' (rays), 'ripple' (rings), 'orbit' (a small moon)
 */
window.SITE = window.SITE || {};

SITE.constellations = [
  { id: 'storage', name: 'Long-duration storage', note: 'Overseas business development for a vanadium flow-battery company, summer 2026', hue: 'gold' },
  { id: 'finance', name: 'Finance', note: 'Valuation, accounting and risk', hue: 'ember' },
  { id: 'analytics', name: 'Analytics & AI', note: 'Data, machine learning and automation', hue: 'foam' },
  { id: 'strategy', name: 'Strategy & consulting', note: 'Markets, customers and operations', hue: 'periwinkle' },
  { id: 'digital', name: 'Digital Creations', note: 'Websites and interactive worlds I build myself', hue: 'teal' }
];

SITE.work = [
  // ── Digital Creations (websites) ──────────────────────────────────────────────────────────────
  {
    id: 'sunflower-intelligence', short: 'Sunflower Intelligence', constellation: 'digital', star: [0.22, 0.42], magnitude: 1,
    featured: true, status: 'live', glyph: 'sun', tags: ['finance', 'analytics'],
    title: 'Sunflower Intelligence',
    tagline: 'Finance, analytics and marketing tools inside a living sunflower painting',
    when: 'Oct 2026', org: 'Personal project',
    cover: { src: 'assets/media/work/sunflower-intelligence/home.webp', w: 2048, h: 1280 },
    context: 'A website of working finance, business analytics and marketing tools, set inside an animated sunflower painting after Van Gogh. The homepage is the painting: six flowers open six rooms, and every tool runs in the visitor’s browser, so uploaded data never leaves their device.',
    objective: 'Put working finance, business analytics and marketing tools in one place, for anyone to use, and give people a place to learn them.',
    role: 'Designed and built the whole site: the WebGL painting, the tools, the course platform and the content.',
    approach: [
      'Finance: cost of capital (CAPM, WACC) feeding a DCF with sensitivity tables; NPV, IRR, MIRR, payback and capital rationing for up to three projects; stock analysis with CAPM beta, Sharpe, drawdown and the efficient frontier; Value at Risk and Expected Shortfall three ways with Kupiec and Christoffersen backtests; bonds and Black–Scholes–Merton options with Greeks',
      'Business analytics: a data-quality audit, descriptive statistics, correlations and OLS with diagnostics; logistic regression, decision trees, k-nearest neighbours and random forests compared by 5-fold cross-validation; k-means, Ward clustering and PCA; Holt-Winters forecasting checked on a held-back season',
      'Marketing: survey-based market segmentation and RFM customer value; a world map of market attractiveness built on World Bank data; price elasticity and the profit-maximising price; unit economics and A/B tests with a sample-size planner',
      'Learn: a free course platform in three schools (finance and accounting, business analytics, marketing), with three complete courses of 32 lessons, labs, a glossary, a formula library and spaced review; an adaptive skills check places visitors and tracks mastery with Bayesian knowledge tracing',
      'How I build the models: the six-stage model life cycle, and an overfitting lab that shows why data is held back',
      'The painting: one WebGL shader moves the paint along its own brushstrokes and walks a raking light across the impasto; each flower is a doorway that dives into its room. Slower devices step down to a lighter shader or a still painting; reduced motion gets a calm version'
    ],
    tools: ['JavaScript (ES modules)', 'WebGL (GLSL)', 'HTML & CSS', 'SVG charts', 'Web Workers', 'GitHub Pages', 'Python & Node.js (asset and content pipelines)', 'SciPy & statsmodels (tests)'],
    insights: [],
    results: [
      'Six rooms: Finance, Business analytics, Marketing, How I build the models, Contact and Learn',
      'Every result updates as you type, and nothing a visitor pastes or uploads leaves their browser',
      'A course platform with 3 complete courses, 32 lessons, 340 glossary terms and 121 formulas; 30 more courses planned',
      'Statistics checked against SciPy and statsmodels'
    ],
    images: [
      { src: 'assets/media/work/sunflower-intelligence/finance.webp', w: 2048, h: 1280, alt: 'The Finance room: five pages from valuation to bonds and options', caption: 'The Finance room: valuation, investment decisions, stock analysis, risk management, bonds and options' },
      { src: 'assets/media/work/sunflower-intelligence/analytics.webp', w: 2048, h: 1280, alt: 'The Business analytics room: explore, supervised and unsupervised learning, forecasting', caption: 'Business analytics: explore a table, compare four machine-learning models, cluster, forecast' },
      { src: 'assets/media/work/sunflower-intelligence/marketing.webp', w: 2048, h: 1280, alt: 'The Marketing room: segmentation, market map, pricing, growth and experiments', caption: 'Marketing: segmentation, a world market map, pricing, growth and experiments' },
      { src: 'assets/media/work/sunflower-intelligence/learn.webp', w: 2048, h: 1280, alt: 'The Learn room: three schools of free courses', caption: 'Learn: free courses in three schools, with labs, a glossary and spaced review' }
    ],
    links: [
      { label: 'Open the site', url: 'https://ruibinray.github.io/sunflower-intelligence/' },
      { label: 'View the code', url: 'https://github.com/RuibinRay/sunflower-intelligence' }
    ],
    related: ['s:finance', 's:analytics', 's:data-science', 's:marketing', 's:ai', 'w:ml-cases', 'w:ledger-lift']
  },
  {
    id: 'pura-vida', short: 'Pura Vida', constellation: 'digital', star: [0.54, 0.72], magnitude: 0.9,
    featured: true, status: 'in-progress', glyph: 'ripple',
    title: 'Costa Rica — Pura Vida: The Living Country',
    tagline: 'An immersive 3D journey through the wildlife, plants, provinces and culture of Costa Rica',
    when: '2026 — in progress', org: 'Personal project',
    cover: null,
    context: 'An immersive 3D educational experience exploring Costa Rica: its wildlife, plants, seven provinces, history, culture and biodiversity.',
    objective: '', role: '',
    approach: [], tools: [], insights: [], results: [],
    images: [], links: [],
    related: ['c:CRI', 's:ai']
  },
  {
    id: '545-days', short: '545 Days', constellation: 'digital', star: [0.82, 0.30], magnitude: 0.9,
    featured: true, status: 'in-progress', glyph: 'orbit',
    title: '545 Days',
    tagline: 'A civilization sandbox: create a world, shape its societies, and see which of 30 endings it reaches',
    when: '2026 — in progress', org: 'Personal project',
    cover: null,
    context: 'An AI-inspired civilization simulator in which players create worlds, influence societies and witness unpredictable events over a main run of 545 in-game days, leading to 30 possible endings.',
    objective: '', role: '',
    approach: ['Sandbox mode: a free world with no fixed goal', 'Story mode: the 545-day run with its 30 endings', 'Continuation mode: keep a world going after its ending'],
    tools: [], insights: [], results: [],
    images: [], links: [],
    related: ['s:ai', 's:strategy']
  },

  // ── Long-duration storage (HJAT internship, Shenyang, Jun – Aug 2026) ──────────────────────
  {
    id: 'market-maps', short: 'Market maps', constellation: 'storage', star: [0.18, 0.62], magnitude: 1,
    title: 'Mapping overseas markets for flow batteries',
    when: 'Jun – Aug 2026', org: 'HJAT (恒久安泰), Shenyang',
    context: 'HJAT makes vanadium redox flow batteries (VRFB) for long-duration energy storage and was building its overseas business.',
    objective: 'Map the companies and organizations relevant to HJAT in priority markets, and the wider long-duration storage landscape.',
    role: 'Overseas Sales / Business Development Intern',
    approach: [],
    tools: [],
    insights: [],
    results: [
      'Market map of 34 companies in Australia',
      'Market map of 18 entities in Saudi Arabia',
      'Industry report on 17 Chinese VRFB companies',
      'Global long-duration energy storage market report',
      'Coverage across the Middle East, Australia, Europe, Southeast Asia and Latin America',
      'Caught a misattributed product and inflated market data before they went into deliverables'
    ],
    images: [], links: [],
    related: ['j:hjat', 'c:CHN', 's:market-research', 's:intl-bd', 'w:tenders', 'w:lifecycle']
  },
  {
    id: 'tenders', short: 'Tender evaluation', constellation: 'storage', star: [0.42, 0.30], magnitude: 0.85,
    title: 'Evaluating tenders in Australia and Papua New Guinea',
    when: 'Jun – Aug 2026', org: 'HJAT (恒久安泰), Shenyang',
    context: 'Tender evaluation for two projects: the Kalgoorlie VBESS in Western Australia and the Kainantu solar + battery storage microgrid in Papua New Guinea.',
    objective: '',
    role: 'Overseas Sales / Business Development Intern',
    approach: [], tools: [], insights: [],
    results: ['Evaluated the Kalgoorlie VBESS tender (Western Australia)', 'Evaluated the PNG Kainantu solar + BESS microgrid tender'],
    images: [], links: [],
    related: ['j:hjat', 'w:market-maps', 'w:lifecycle', 's:intl-bd']
  },
  {
    id: 'lifecycle', short: 'VRFB vs. LFP cost', constellation: 'storage', star: [0.66, 0.20], magnitude: 0.9,
    title: 'VRFB vs. lithium (LFP): lifecycle cost',
    when: 'Jun – Aug 2026', org: 'HJAT (恒久安泰), Shenyang',
    context: 'A lifecycle cost comparison between vanadium redox flow batteries and lithium iron phosphate (LFP) batteries.',
    objective: '',
    role: 'Overseas Sales / Business Development Intern',
    approach: [], tools: [], insights: [],
    results: ['VRFB vs. LFP lifecycle cost comparison'],
    images: [], links: [],
    related: ['j:hjat', 'w:tenders', 's:finance', 's:analytics']
  },
  {
    id: 'proposals', short: 'Trilingual proposals', constellation: 'storage', star: [0.84, 0.48], magnitude: 0.8,
    title: 'Partnership proposals in three languages',
    when: 'Jun – Aug 2026', org: 'HJAT (恒久安泰), Shenyang',
    context: 'Partnership proposals for overseas contacts, in English, Spanish and Mandarin.',
    objective: '',
    role: 'Overseas Sales / Business Development Intern',
    approach: [], tools: [], insights: [],
    results: ['Partnership proposals in English, Spanish and Mandarin', 'A reusable proposal template'],
    images: [], links: [],
    related: ['j:hjat', 's:intl-bd', 's:communication']
  },
  {
    id: 'study-guides', short: '30 study guides', constellation: 'storage', star: [0.62, 0.78], magnitude: 0.85,
    title: '30 study guides from one pipeline',
    when: 'Jun – Aug 2026', org: 'HJAT (恒久安泰), Shenyang',
    context: 'Energy storage study guides covering 10 technologies in 3 languages.',
    objective: '',
    role: 'Overseas Sales / Business Development Intern',
    approach: ['Built an automated Node.js pipeline to produce the guides'],
    tools: ['Node.js'],
    insights: [],
    results: ['30 guides: 10 technologies × 3 languages'],
    images: [], links: [],
    related: ['j:hjat', 's:ai', 's:communication']
  },
  {
    id: 'outreach', short: 'Outreach & training', constellation: 'storage', star: [0.36, 0.86], magnitude: 0.75,
    title: 'LinkedIn outreach and AI training',
    when: 'Jun – Aug 2026', org: 'HJAT (恒久安泰), Shenyang',
    context: 'Building the department’s overseas network, and helping colleagues adopt new tools.',
    objective: '',
    role: 'Overseas Sales / Business Development Intern',
    approach: [], tools: ['LinkedIn'], insights: [],
    results: [
      'Ranked 1st in the department for LinkedIn outreach, with 200+ connections across 6+ countries',
      'Taught colleagues to use LinkedIn, VPN and AI tools',
      'Wrote a Mandarin guide to AI tools'
    ],
    images: [], links: [],
    related: ['j:hjat', 's:intl-bd', 's:ai', 's:communication']
  },

  // ── Finance ────────────────────────────────────────────────────────────────────────────────
  {
    id: 'ma-model', short: 'Adobe × Shutterstock M&A', constellation: 'finance', star: [0.28, 0.38], magnitude: 0.9,
    title: 'M&A model: an Adobe × Shutterstock scenario',
    when: '', org: '',
    context: 'An M&A financial model for an Adobe / Shutterstock acquisition scenario.',
    objective: '', role: '', approach: [], tools: [], insights: [], results: [],
    images: [], links: [],
    related: ['s:finance', 'w:bbby']
  },
  {
    id: 'bbby', short: 'Bed Bath & Beyond forensics', constellation: 'finance', star: [0.72, 0.64], magnitude: 0.85,
    title: 'Bed Bath & Beyond: a forensic accounting analysis',
    when: '', org: '',
    context: 'A forensic accounting analysis of Bed Bath & Beyond.',
    objective: '', role: '',
    approach: [
      'Altman Z-score — a measure of bankruptcy risk',
      'Beneish M-score — a screen for earnings manipulation',
      'Sloan accrual ratio — a check on earnings quality'
    ],
    tools: [], insights: [], results: [],
    images: [], links: [],
    related: ['s:finance', 'w:ma-model']
  },

  // ── Analytics & AI ─────────────────────────────────────────────────────────────────────────
  {
    id: 'layers', short: 'Layers analytics', constellation: 'analytics', star: [0.20, 0.30], magnitude: 0.9,
    title: 'AI-driven marketing analytics with Layers App',
    when: 'Sep – Dec 2025', org: '',
    context: 'A marketing analytics project built around the Layers app.',
    objective: '', role: '', approach: [], tools: ['Layers App'], insights: [], results: [],
    images: [], links: [],
    related: ['j:layers', 's:marketing', 's:ai', 's:analytics']
  },
  {
    id: 'ml-cases', short: 'ML case studies', constellation: 'analytics', star: [0.52, 0.66], magnitude: 0.85,
    title: 'Machine learning case studies',
    when: '', org: 'Hult International Business School',
    context: 'Case studies in supervised and unsupervised machine learning.',
    objective: '', role: '',
    approach: ['Supervised learning: the Breast Cancer Wisconsin case', 'Unsupervised learning: K-Means clustering and PCA'],
    tools: ['Python', 'Pandas', 'Seaborn', 'Google Colab'],   // from your skills list — confirm these were used here
    insights: [], results: [],
    images: [], links: [],
    related: ['s:data-science', 's:analytics']
  },
  {
    id: 'ledger-lift', short: 'Ledger & Lift', constellation: 'analytics', star: [0.80, 0.34], magnitude: 0.8,
    title: 'Ledger & Lift',
    when: '', org: '',
    context: 'A personal finance web app.',
    objective: '', role: '', approach: [], tools: ['Lovable'], insights: [], results: [],
    images: [], links: [],      // add a live link: { label: 'Open the app', url: 'https://…' }
    related: ['s:ai', 's:finance']
  },

  // ── Strategy & consulting ──────────────────────────────────────────────────────────────────
  {
    id: 'mundo-bonito', short: 'Mundo Bonito', constellation: 'strategy', star: [0.22, 0.56], magnitude: 0.9,
    title: 'Mundo Bonito: strategy for an online store',
    when: 'Dec 2024 – Jun 2025', org: 'Mundo Bonito E-Commerce Store, Costa Rica',
    context: 'Consulting for Mundo Bonito, an e-commerce store in Costa Rica.',
    objective: '', role: 'Business Consultant',
    approach: ['Go-to-market and pricing strategy', 'Customer segmentation', 'Storefront redesign', 'Promotional testing'],
    tools: [], insights: [], results: [],
    images: [], links: [],
    related: ['j:mundo', 'c:CRI', 's:strategy', 's:marketing']
  },
  {
    id: 'cambridgeside', short: 'CambridgeSide', constellation: 'strategy', star: [0.56, 0.24], magnitude: 0.9,
    title: 'CambridgeSide: Hult Business Challenge',
    when: '', org: 'Hult International Business School',
    context: 'The Hult Business Challenge semi-finals, built around CambridgeSide, a shopping center in Cambridge, MA.',
    objective: '', role: '', approach: [], tools: [], insights: [], results: [],
    images: [], links: [],
    related: ['c:USA', 's:strategy']
  },
  {
    id: 'duck-tours', short: 'Boston Duck Tours', constellation: 'strategy', star: [0.80, 0.72], magnitude: 0.75,
    title: 'Boston Duck Tours: operations & supply chain',
    when: '', org: 'Hult International Business School',
    context: 'Course project for Operations & Supply Chain Management, built around Boston Duck Tours.',
    objective: '', role: '', approach: [], tools: [], insights: [], results: [],
    images: [], links: [],
    related: ['c:USA']
  }
];
