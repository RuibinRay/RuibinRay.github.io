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
 */
window.SITE = window.SITE || {};

SITE.constellations = [
  { id: 'storage', name: 'Long-duration storage', note: 'Overseas business development for a vanadium flow-battery company, summer 2026', hue: 'gold' },
  { id: 'finance', name: 'Finance', note: 'Valuation, accounting and risk', hue: 'ember' },
  { id: 'analytics', name: 'Analytics & AI', note: 'Data, machine learning and automation', hue: 'foam' },
  { id: 'strategy', name: 'Strategy & consulting', note: 'Markets, customers and operations', hue: 'periwinkle' }
];

SITE.work = [
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
