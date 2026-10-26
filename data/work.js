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
 *   images      list of { src, w, h, alt, caption } — WebP in assets/media/work/<project>/ (tools/prepare_media.py)
 *   links       list of { label, url } — live demo, repository, deck, write-up
 *   background  list of { text, sources: [{ label, url }] } — context researched from public sources
 *               (the market, the company, the method). Shown under "Background", always with its sources;
 *               never use it for claims about your own results.
 *   documents   list of { title, kind, url?, note? } — related documents. With a url the row opens it;
 *               without one it becomes an "Ask for it" email to you, for work you share on request.
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
    featured: true, status: 'live', glyph: 'ripple', tags: ['analytics'],
    title: 'Costa Rica — Pura Vida: The Living Country',
    tagline: 'A field journal of Costa Rica in three languages: a painted walk, a 3D map and a wildlife trail',
    when: 'Oct 2026', org: 'Personal project',
    cover: { src: 'assets/media/work/pura-vida/home.webp', w: 2048, h: 1280 },
    context: 'An interactive field journal of Costa Rica, the country I come from, in English, Spanish and Simplified Chinese: its wildlife, plants, seven provinces, history, food and culture. It is a static site that runs in the browser, with no backend, no accounts and no trackers.',
    objective: 'Make one place where anyone can walk through Costa Rica province by province and learn what lives there, with every fact traced back to a source.',
    role: 'Designed and built the whole site: the research and writing, the illustrated plates, the asset pipelines, the 3D map and the code.',
    approach: [
      'The walk: the homepage is a walk of 13 stops through all seven provinces, each an illustrated plate with animals moving in short loops',
      'Explore: a 3D relief model of the country with search, filters, wildlife and food layers, a guided tour of 15 stops, and 113 places, each with its own drawn postcard',
      'The wildlife trail: nine habitats from the lowland canopy to the sea, with 31 animal stickers placed where their sources say they live; tap one for its scientific name, Red List status and sources',
      'Research first: every chapter is generated from sourced research files, and claims that could not be checked are kept apart rather than published',
      'Built for every device: full, lite, still and text-only versions, chosen to fit the device, and a diagnostics panel that shows which one a visitor got and why',
      'Three languages throughout: English, Spanish and Simplified Chinese'
    ],
    tools: ['TypeScript', 'React', 'Vite', 'React Three Fiber & Three.js', 'Vitest', 'axe-core', 'Python (Pillow, OpenCV, U²-Net) asset pipelines', 'Natural Earth map data', 'GitHub Actions & Pages'],
    insights: [],
    results: [
      'Live in three languages',
      '32 species, 113 places and 548 cited sources in the content',
      '66 automated tests in 6 files, all passing; an accessibility sweep with axe found no violations across the site',
      'No backend, no accounts and no trackers'
    ],
    images: [
      { src: 'assets/media/work/pura-vida/monteverde.webp', w: 2048, h: 1280, alt: 'A resplendent quetzal and a hummingbird in the Monteverde cloud forest, with the stop’s text panel', caption: 'A stop on the walk: Monteverde Cloud Forest Reserve, in Puntarenas' },
      { src: 'assets/media/work/pura-vida/irazu.webp', w: 2048, h: 1280, alt: 'The crater lake of Irazú volcano behind birds and orchids', caption: 'Irazú Volcano National Park, Cartago, with a “what if it erupted?” scenario' },
      { src: 'assets/media/work/pura-vida/guanacaste.webp', w: 2048, h: 1280, alt: 'A white-tailed deer and an oxcart in Guanacaste’s dry forest at sunset', caption: 'Guanacaste’s dry forest and savanna' },
      { src: 'assets/media/work/pura-vida/flavors.webp', w: 2048, h: 1280, alt: 'Five Costa Rican dishes drawn on a wooden table', caption: 'The flavors of Costa Rica: five dishes from the everyday table' },
      { src: 'assets/media/work/pura-vida/map.webp', w: 2048, h: 1280, alt: 'A 3D relief map of Costa Rica coloured by province, with filters and place markers', caption: 'Explore: the 3D relief map, its filters and the guided tour' },
      { src: 'assets/media/work/pura-vida/wildlife.webp', w: 2048, h: 1280, alt: 'The wildlife trail: a volcano above the rainforest canopy at sunrise', caption: 'The wildlife trail begins in the lowland canopy' }
    ],
    links: [
      { label: 'Open the site', url: 'https://ruibinray.github.io/Pura-Vida/' },
      { label: 'View the code', url: 'https://github.com/RuibinRay/pura-vida' }
    ],
    documents: [
      { title: 'Research sources', kind: 'Sources', url: 'https://github.com/RuibinRay/pura-vida/blob/main/docs/RESEARCH_SOURCES.md', note: 'Every source behind the content' },
      { title: 'Feature progress', kind: 'Log', url: 'https://github.com/RuibinRay/pura-vida/blob/main/docs/FEATURE_PROGRESS.md', note: 'What is built, and how' },
      { title: 'Test results', kind: 'Report', url: 'https://github.com/RuibinRay/pura-vida/blob/main/docs/TEST_RESULTS.md', note: 'Automated tests and accessibility checks' },
      { title: 'Design system', kind: 'Design', url: 'https://github.com/RuibinRay/pura-vida/blob/main/docs/DESIGN_SYSTEM.md', note: 'Type, colour and layout rules' },
      { title: 'Art style', kind: 'Design', url: 'https://github.com/RuibinRay/pura-vida/blob/main/docs/ART_STYLE.md', note: 'How the plates and postcards are drawn' }
    ],
    related: ['c:CRI', 's:ai', 's:data-science', 's:communication', 'w:sunflower-intelligence', 'w:mundo-bonito']
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
    approach: [
      'Mapped 50+ potential clients and partners across Australia and Saudi Arabia',
      'Co-authored an industry report profiling 17 Chinese VRFB companies',
      'Wrote a global market intelligence report on long-duration storage and flow batteries, in nine sections'
    ],
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
    background: [
      { text: 'Vanadium redox flow batteries store energy in liquid electrolyte held in tanks, so the energy they hold (the tanks) and the power they deliver (the cell stacks) can be sized separately. They offer long cycle and calendar life, but are less commercially mature than lithium-ion.',
        sources: [{ label: 'PNNL, Energy Storage Cost and Performance', url: 'https://www.pnnl.gov/projects/esgc-cost-performance/vanadium-redox-flow-battery' }] },
      { text: 'Projects are getting larger: in December 2024 Rongke Power announced the completion of a 175 MW / 700 MWh vanadium flow battery in Ushi, China, described as the largest in the world.',
        sources: [{ label: 'Energy-Storage.news', url: 'https://energy-storage.news/rongke-power-completes-grid-forming-175mw-700mwh-vanadium-flow-battery-in-China-worlds-largest' }] }
    ],
    documents: [
      { title: 'Market map: Australia (34 companies)', kind: 'Spreadsheet', note: 'Internal to HJAT — I can share a summary where the company allows' },
      { title: 'Market map: Saudi Arabia (18 entities)', kind: 'Spreadsheet', note: 'Internal to HJAT — I can share a summary where the company allows' },
      { title: 'Industry report: 17 Chinese VRFB companies', kind: 'Report', note: 'Internal to HJAT — I can share a summary where the company allows' },
      { title: 'Global long-duration storage market report', kind: 'Report', note: 'Internal to HJAT — I can share a summary where the company allows' }
    ],
    images: [], links: [],
    related: ['j:hjat', 'c:CHN', 's:market-research', 's:intl-bd', 'w:tenders', 'w:lifecycle']
  },
  {
    id: 'tenders', short: 'Tender evaluation', constellation: 'storage', star: [0.42, 0.30], magnitude: 0.85,
    title: 'Evaluating tenders in Australia and Papua New Guinea',
    when: 'Jun – Aug 2026', org: 'HJAT (恒久安泰), Shenyang',
    context: 'Tender evaluation for two projects: the Kalgoorlie VBESS in Western Australia and the Kainantu solar + battery storage microgrid in Papua New Guinea.',
    objective: 'Read each tender against what HJAT’s flow batteries can offer, and decide where and how the company should take part.',
    role: 'Overseas Sales / Business Development Intern',
    approach: [
      'Kalgoorlie: assessed how HJAT could take part as the technology partner in an Australian-led consortium',
      'Kainantu: read the specification for a 16 MWp solar plant with at least 10 MW / 10 MWh of battery storage, and flagged that a one-hour duration favours lithium-ion over flow batteries'
    ],
    tools: [], insights: [],
    results: ['Evaluated the Kalgoorlie VBESS tender (Western Australia)', 'Evaluated the PNG Kainantu solar + BESS microgrid tender'],
    background: [
      { text: 'The Kalgoorlie Vanadium Battery Energy Storage System is a 50 MW / 500 MWh (10-hour) project backed by AU$150 million from the Western Australian government. Its stage-one expression of interest opened in November 2025 and asks for vanadium flow-battery technology made in Western Australia, with locally sourced and processed vanadium; completion is targeted for 2029.',
        sources: [
          { label: 'Energy-Storage.news', url: 'https://www.energy-storage.news/?p=91083' },
          { label: 'Government of Western Australia', url: 'https://stateofenergy.wa.gov.au/news/stage-one-expression-of-interest-open-for-landmark-kalgoorlie-vanadium-battery-project' }
        ] }
    ],
    documents: [
      { title: 'Tender evaluation: Kalgoorlie VBESS', kind: 'Memo', note: 'Internal to HJAT — I can share a summary where the company allows' },
      { title: 'Tender evaluation: PNG Kainantu microgrid', kind: 'Memo', note: 'Internal to HJAT — I can share a summary where the company allows' }
    ],
    images: [], links: [],
    related: ['j:hjat', 'w:market-maps', 'w:lifecycle', 's:intl-bd']
  },
  {
    id: 'lifecycle', short: 'VRFB vs. LFP cost', constellation: 'storage', star: [0.66, 0.20], magnitude: 0.9,
    title: 'VRFB vs. lithium (LFP): lifecycle cost',
    when: 'Jun – Aug 2026', org: 'HJAT (恒久安泰), Shenyang',
    context: 'A lifecycle cost comparison between vanadium redox flow batteries and lithium iron phosphate (LFP) batteries.',
    objective: 'Show customers when a flow battery costs less over its life than lithium, and when it does not.',
    role: 'Overseas Sales / Business Development Intern',
    approach: [
      'Compared the levelized cost of storage (LCOS) of the two technologies across storage durations',
      'Wrote a 24-page bilingual study guide on VRFB and LCOS'
    ],
    tools: [],
    insights: ['Duration decides it: in the comparison, the flow battery came out ahead at 8 hours of storage and LFP at 4 hours'],
    results: ['VRFB vs. LFP lifecycle cost comparison', 'A 24-page bilingual VRFB and LCOS study guide'],
    background: [
      { text: 'Because a flow battery’s energy and power scale independently, adding hours of storage mostly means adding electrolyte and tanks — one reason flow batteries are usually pitched for long durations, while lithium-ion dominates shorter ones.',
        sources: [{ label: 'PNNL, Energy Storage Cost and Performance', url: 'https://www.pnnl.gov/projects/esgc-cost-performance/vanadium-redox-flow-battery' }] }
    ],
    documents: [
      { title: 'VRFB and LCOS study guide (24 pages, bilingual)', kind: 'Guide', note: 'Internal to HJAT — I can share a summary where the company allows' },
      { title: 'VRFB vs. LFP lifecycle cost comparison', kind: 'Model', note: 'Internal to HJAT — I can share a summary where the company allows' }
    ],
    images: [], links: [],
    related: ['j:hjat', 'w:tenders', 's:finance', 's:analytics']
  },
  {
    id: 'proposals', short: 'Trilingual proposals', constellation: 'storage', star: [0.84, 0.48], magnitude: 0.8,
    title: 'Partnership proposals in three languages',
    when: 'Jun – Aug 2026', org: 'HJAT (恒久安泰), Shenyang',
    context: 'Partnership proposals for overseas contacts, in English, Spanish and Mandarin.',
    objective: 'Give the sales team proposals they could send in the reader’s own language, and a template to make the next one faster.',
    role: 'Overseas Sales / Business Development Intern',
    approach: ['A business plan for Australia', 'A market proposal for Belgium', 'A bilingual proposal for Saudi Arabia', 'A global partnership template to adapt for any market'],
    tools: [], insights: [],
    results: ['Partnership proposals in English, Spanish and Mandarin', 'A reusable proposal template'],
    documents: [
      { title: 'Global partnership proposal template', kind: 'Template', note: 'Internal to HJAT — I can share a summary where the company allows' },
      { title: 'Australia business plan', kind: 'Proposal', note: 'Internal to HJAT — I can share a summary where the company allows' }
    ],
    images: [], links: [],
    related: ['j:hjat', 's:intl-bd', 's:communication']
  },
  {
    id: 'study-guides', short: '30 study guides', constellation: 'storage', star: [0.62, 0.78], magnitude: 0.85,
    title: '30 study guides from one pipeline',
    when: 'Jun – Aug 2026', org: 'HJAT (恒久安泰), Shenyang',
    context: 'Energy storage study guides covering 10 technologies in 3 languages.',
    objective: 'Help the team explain every storage technology a customer might compare HJAT’s flow batteries with.',
    role: 'Overseas Sales / Business Development Intern',
    approach: [
      'Ten technologies: lithium-ion, sodium-ion, flow batteries, sodium-sulfur, iron-air, zinc-based, pumped hydro, compressed air (CAES), hydrogen and thermal storage',
      'Built an automated Node.js pipeline that writes each guide as a Word document in all three languages'
    ],
    tools: ['Node.js', 'docx (Word generation)'],
    insights: [],
    results: ['30 guides: 10 technologies × 3 languages'],
    documents: [
      { title: 'A sample study guide', kind: 'Guide', note: 'I can send one on request' }
    ],
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
    documents: [
      { title: 'A guide to AI tools (in Mandarin)', kind: 'Guide', note: 'Written for colleagues — I can send it on request' }
    ],
    images: [], links: [],
    related: ['j:hjat', 's:intl-bd', 's:ai', 's:communication']
  },

  // ── Finance ────────────────────────────────────────────────────────────────────────────────
  {
    id: 'ma-model', short: 'Adobe × Shutterstock M&A', constellation: 'finance', star: [0.28, 0.38], magnitude: 0.9,
    title: 'M&A model: an Adobe × Shutterstock scenario',
    when: '', org: '',
    context: 'An M&A financial model for an Adobe / Shutterstock acquisition scenario. The deal is hypothetical: Adobe has not bid for Shutterstock.',
    objective: '', role: '', approach: [], tools: [], insights: [], results: [],
    background: [
      { text: 'In January 2025 Shutterstock agreed to merge with Getty Images, a deal valued at about $3.7 billion that would have given Getty shareholders about 54.7% of the combined company.',
        sources: [{ label: 'PetaPixel', url: 'https://petapixel.com/2025/01/07/getty-images-and-shutterstock-announce-merger-in-3-7-billion-deal' }] },
      { text: 'That deal did not close. The UK Competition and Markets Authority said in May 2026 that it could go ahead only if Shutterstock’s whole editorial business were sold; Getty’s board chose not to, and Getty terminated the merger agreement on 7 July 2026.',
        sources: [{ label: 'Getty Images 10-Q, Q2 2026 (SEC)', url: 'https://www.sec.gov/Archives/edgar/data/0001898496/000162828026055246/gety-20260630.htm' }] }
    ],
    documents: [
      { title: 'The M&A model', kind: 'Model' }
    ],
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
    background: [
      { text: 'Bed Bath & Beyond filed for Chapter 11 bankruptcy on 23 April 2023 and began winding down its 360 Bed Bath & Beyond and 120 buybuy BABY stores.',
        sources: [{ label: 'Bed Bath & Beyond press release (SEC)', url: 'https://www.sec.gov/Archives/edgar/data/886158/000119312523111754/d465247dex991.htm' }] },
      { text: 'The three models come from academic research: Edward Altman’s Z-score from a 1968 Journal of Finance paper on predicting bankruptcy; Messod Beneish’s M-score from a 1999 Financial Analysts Journal paper, which reported that it flagged about half of the manipulators before the manipulation was made public; and Richard Sloan’s 1996 Accounting Review paper on accruals, which found that earnings driven by accruals tend to persist less than earnings backed by cash.',
        sources: [
          { label: 'Journal of Finance, Sep 1968', url: 'https://afajof.org/issue/volume-23-issue-4/' },
          { label: 'Financial Analysts Journal, 1999', url: 'https://rpc.cfainstitute.org/research/financial-analysts-journal/1999/the-detection-of-earnings-manipulation' },
          { label: 'UC Berkeley Haas on Sloan (1996)', url: 'https://newsroom.haas.berkeley.edu/prof-richard-sloan-honored-top-accounting-award/' }
        ] }
    ],
    documents: [
      { title: 'The forensic accounting analysis', kind: 'Report' }
    ],
    images: [], links: [],
    related: ['s:finance', 'w:ma-model']
  },

  // ── Analytics & AI ─────────────────────────────────────────────────────────────────────────
  {
    id: 'layers', short: 'Layers analytics', constellation: 'analytics', star: [0.20, 0.30], magnitude: 0.9,
    title: 'AI-driven marketing analytics with Layers App',
    when: 'Sep – Dec 2025', org: '',
    context: 'A marketing analytics project built around the Layers app.',
    objective: 'Use AI tools to improve digital marketing funnels and understand where customers come from.',
    role: '', approach: ['Used AI tools to optimize the digital marketing funnel', 'Drew customer-acquisition insights from the data'],
    tools: ['Layers App'], insights: [], results: [],
    documents: [
      { title: 'Project materials', kind: 'Files' }
    ],
    images: [], links: [],
    related: ['j:layers', 's:marketing', 's:ai', 's:analytics']
  },
  {
    id: 'ml-cases', short: 'ML case studies', constellation: 'analytics', star: [0.52, 0.66], magnitude: 0.85,
    title: 'Machine learning case studies',
    when: '', org: 'Hult International Business School',
    context: 'Case studies in supervised and unsupervised machine learning.',
    objective: '', role: '',
    approach: ['Supervised learning: the Breast Cancer Wisconsin case', 'Unsupervised learning: K-Means clustering and PCA, with silhouette scores to choose the number of clusters'],
    tools: ['Python', 'Pandas', 'Seaborn', 'Google Colab'],   // from your skills list — confirm these were used here
    insights: [], results: [],
    background: [
      { text: 'The Breast Cancer Wisconsin (Diagnostic) dataset has 569 cases and 30 features computed from digitized images of fine-needle aspirates of breast masses — measures of the cell nuclei such as radius, texture, smoothness and concavity — each labelled malignant or benign. It was donated to the UCI Machine Learning Repository in 1995.',
        sources: [{ label: 'UCI Machine Learning Repository', url: 'https://archive.ics.uci.edu/dataset/17/breast-cancer-wisconsin-diagnostic' }] }
    ],
    documents: [
      { title: 'The notebooks', kind: 'Code' }
    ],
    images: [], links: [],
    related: ['s:data-science', 's:analytics', 'w:sunflower-intelligence']
  },
  {
    id: 'ledger-lift', short: 'Ledger & Lift', constellation: 'analytics', star: [0.80, 0.34], magnitude: 0.8,
    title: 'Ledger & Lift',
    when: '', org: '',
    context: 'A personal finance web app.',
    objective: '', role: '',
    approach: ['Built it in Lovable', 'Built a second version as a Claude artifact, with Gmail integration, email login and automated calculations'],
    tools: ['Lovable', 'Claude'], insights: [], results: [],
    images: [], links: [],      // add a live link: { label: 'Open the app', url: 'https://…' }
    related: ['s:ai', 's:finance']
  },

  // ── Strategy & consulting ──────────────────────────────────────────────────────────────────
  {
    id: 'mundo-bonito', short: 'Mundo Bonito', constellation: 'strategy', star: [0.22, 0.56], magnitude: 0.9,
    title: 'Mundo Bonito: strategy for an online store',
    when: 'Dec 2024 – Jun 2025', org: 'Mundo Bonito E-Commerce Store, Costa Rica',
    context: 'Consulting for Mundo Bonito, an e-commerce store in Costa Rica.',
    objective: 'Set a go-to-market and pricing strategy for the store, and improve how its storefront converts visitors into buyers.',
    role: 'Business Consultant',
    approach: ['Go-to-market and pricing strategy', 'Customer segmentation', 'Competitor price analysis', 'Storefront redesign', 'Promotional testing to improve conversion'],
    tools: [], insights: [], results: [],
    documents: [
      { title: 'Strategy and pricing work', kind: 'Files' }
    ],
    images: [], links: [],
    related: ['j:mundo', 'c:CRI', 's:strategy', 's:marketing']
  },
  {
    id: 'cambridgeside', short: 'CambridgeSide', constellation: 'strategy', star: [0.56, 0.24], magnitude: 0.9,
    title: 'CambridgeSide: Hult Business Challenge',
    when: 'Fall 2026', org: 'Hult International Business School',
    context: 'The Hult Business Challenge semi-finals, built around CambridgeSide, a shopping center in Cambridge, MA. The challenge: events and promotions.',
    objective: '', role: '', approach: [], tools: [], insights: [], results: [],
    background: [
      { text: 'CambridgeSide opened in 1990 on the Lechmere Canal, just off the Charles River, and is run by New England Development. It has more than 80 stores in about a million square feet; several of its department-store anchors — Sears in 2018, Macy’s in 2020 — have closed, and since 2024 it has hosted Harry Potter: The Exhibition.',
        sources: [{ label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/CambridgeSide' }] }
    ],
    documents: [
      { title: 'The team’s pitch deck', kind: 'Deck' }
    ],
    images: [], links: [],
    related: ['c:USA', 's:strategy']
  },
  {
    id: 'duck-tours', short: 'Boston Duck Tours', constellation: 'strategy', star: [0.80, 0.72], magnitude: 0.75,
    title: 'Boston Duck Tours: operations & supply chain',
    when: '', org: 'Hult International Business School',
    context: 'Course project for Operations & Supply Chain Management, built around Boston Duck Tours.',
    objective: '', role: '',
    approach: ['Mystery shopping', 'A customer journey map'],
    tools: [], insights: [], results: [],
    background: [
      { text: 'Boston Duck Tours was founded in 1994 by Andrew Wilson. Its tours of Boston run in replicas of World War II DUKW amphibious vehicles; the fleet numbers 28 “Ducks”, carrying about 600,000 passengers a year.',
        sources: [{ label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Boston_Duck_Tours' }] }
    ],
    documents: [
      { title: 'The customer journey map', kind: 'Map' }
    ],
    images: [], links: [],
    related: ['c:USA', 's:strategy']
  }
];
