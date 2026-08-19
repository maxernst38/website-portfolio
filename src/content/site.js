// ─────────────────────────────────────────────────────────────────────────────
//  ALL SITE CONTENT LIVES HERE. Editing this file changes the whole site.
//
//  Replacing text  : search for "TODO:" — every one is a placeholder.
//                      grep -rn "TODO:" src/content/site.js
//  Replacing photos: 1. drop the file into src/assets/images/
//                    2. uncomment its import below
//                    3. change the matching `src: null` to `src: <importName>`
//                    (Imported assets are content-hashed by Vite, so they cache
//                     forever and a typo'd filename is a BUILD ERROR, not a
//                     silent 404. Never put photos in public/.)
//  Sizes to export : see src/assets/images/README.md
//
//  ⚠ Do NOT put Tailwind class fragments in this file. Tailwind v4 cannot see
//    class names assembled at runtime, so `text-${tone}-600` silently produces
//    no CSS. Keep styling decisions in the components.
// ─────────────────────────────────────────────────────────────────────────────

// import portrait     from '../assets/images/portrait.jpg'         // 880×1100 (4/5)
// import cardResume   from '../assets/images/card-resume.jpg'      // 736×552  (4/3)
// import cardProjects from '../assets/images/card-projects.jpg'    // 736×552  (4/3)
// import cardContact  from '../assets/images/card-contact.jpg'     // 736×552  (4/3)
// import shotRobosync from '../assets/images/project-robosync.png' // 1120×630 (16/9)

/* ── Identity ──────────────────────────────────────────────────────────── */
export const profile = {
  // Drives the hero <h1>, every page <title>, the footer copyright and the OG
  // tags. Change it once here and it updates everywhere.
  name: 'Max Ernst',
  shortName: 'Max',                    // navbar wordmark + footer mark
  role: 'TODO: Software Engineer',
  location: 'TODO: City, Country',
  availability: 'TODO: Open to new roles',  // hero status pill; set null to hide
  tagline: 'TODO: One line, ~12 words, what you build and who for.',
  bio:
    'TODO: Two or three sentences. What you work on, what you are good at, and ' +
    'what you are looking for next. Written for a recruiter skimming for eight seconds.',
  portrait: {
    src: null,
    alt: 'TODO: describe the portrait, e.g. "Max, smiling, outdoors"',
  },
  resumePdf: null,   // set to '/resume.pdf' after dropping the file into public/
}

/* ── Navigation (drives navbar, mobile menu, footer) ───────────────────── */
export const nav = [
  { label: 'Home', to: '/' },
  { label: 'Resume', to: '/resume' },
  { label: 'Projects', to: '/projects' },
  { label: 'Contact', to: '/contact' },
]

/* ── Hero call-to-action buttons ───────────────────────────────────────── */
export const heroCtas = [
  { label: 'View my work', to: '/projects', variant: 'primary' },
  { label: 'Get in touch', to: '/contact', variant: 'secondary' },
]

/* ── Home page navigation-card grid (the "splash → hub" section) ───────── */
export const homeCards = [
  {
    to: '/resume',
    title: 'Resume',
    description: 'TODO: one line — where I have worked and what I can do.',
    cta: 'View resume',
    image: { src: null, alt: 'TODO: e.g. "Desk with notebook and laptop"' },
  },
  {
    to: '/projects',
    title: 'Projects',
    description: 'TODO: one line — things I have designed, built and shipped.',
    cta: 'Browse projects',
    image: { src: null, alt: 'TODO: e.g. "Screenshot collage of shipped apps"' },
  },
  {
    to: '/contact',
    title: 'Contact',
    description: 'TODO: one line — the fastest way to reach me.',
    cta: 'Say hello',
    image: { src: null, alt: 'TODO: e.g. "Coffee cup beside a phone"' },
  },
]

/* ── Projects ──────────────────────────────────────────────────────────── */
export const projects = [
  {
    slug: 'robosync',
    title: 'TODO: RoboSync',
    year: '2026',
    role: 'TODO: Solo build',
    blurb: 'TODO: one sentence a recruiter can read in three seconds.',
    description:
      'TODO: two or three sentences. The problem, what you built, the interesting ' +
      'technical decision, and the outcome.',
    tags: ['React', 'Vite', 'Tailwind', 'TODO: add/remove'],
    image: { src: null, alt: 'TODO: describe the screenshot' },
    links: [
      { label: 'Live demo', href: 'TODO: https://…', icon: 'external' },
      { label: 'Source', href: 'https://github.com/maxernst38/robosync', icon: 'github' },
    ],
    featured: true,
  },
  {
    slug: 'project-two',
    title: 'TODO: Project Two',
    year: 'TODO: 2025',
    role: 'TODO: Team of 3 — frontend lead',
    blurb: 'TODO: one sentence.',
    description: 'TODO: two or three sentences.',
    tags: ['TODO: Tech', 'TODO: Tech'],
    image: { src: null, alt: 'TODO: describe the screenshot' },
    links: [{ label: 'Source', href: 'TODO: https://github.com/…', icon: 'github' }],
    featured: true,
  },
  {
    slug: 'project-three',
    title: 'TODO: Project Three',
    year: 'TODO: 2025',
    role: 'TODO: Coursework',
    blurb: 'TODO: one sentence.',
    description: 'TODO: two or three sentences.',
    tags: ['TODO: Tech'],
    image: { src: null, alt: 'TODO: describe the screenshot' },
    links: [],
    featured: false,
  },
]

/* ── Resume ────────────────────────────────────────────────────────────── */
// NOTE: `experience` and `education` share one shape on purpose — both render
// through the same <TimelineItem/>. Keep them structurally identical.
export const resume = {
  summary: 'TODO: three or four lines. The paragraph at the top of your CV.',

  experience: [
    {
      title: 'TODO: Job Title',
      org: 'TODO: Company',
      orgUrl: null,               // a string turns the org name into a link
      location: 'TODO: City / Remote',
      start: 'TODO: Jan 2025',
      end: 'Present',             // 'Present' renders an indigo "current" dot
      bullets: [
        'TODO: impact-first bullet. Verb, thing, measurable result.',
        'TODO: second bullet.',
        'TODO: third bullet.',
      ],
      tags: ['TODO: Tech', 'TODO: Tech'],
    },
    {
      title: 'TODO: Previous Title',
      org: 'TODO: Company',
      orgUrl: null,
      location: 'TODO: City',
      start: 'TODO: Jun 2024',
      end: 'TODO: Dec 2024',
      bullets: ['TODO: bullet.', 'TODO: bullet.'],
      tags: [],
    },
  ],

  education: [
    {
      title: 'TODO: BSc Computer Science',
      org: 'TODO: University',
      orgUrl: null,
      location: 'TODO: City',
      start: 'TODO: 2022',
      end: 'TODO: 2026',
      bullets: ['TODO: honours / GPA / relevant coursework / thesis.'],
      tags: [],
    },
  ],

  skills: [
    { group: 'Languages', items: ['TODO: JavaScript', 'TODO: Python', 'TODO: SQL'] },
    { group: 'Frontend', items: ['TODO: React', 'TODO: Tailwind CSS', 'TODO: Vite'] },
    { group: 'Backend', items: ['TODO: Node.js', 'TODO: PostgreSQL'] },
    { group: 'Tools', items: ['TODO: Git', 'TODO: Docker', 'TODO: Figma'] },
  ],

  facts: [
    { label: 'Based in', value: 'TODO: City, Country' },
    { label: 'Availability', value: 'TODO: From June 2026' },
  ],
}

/* ── Contact ───────────────────────────────────────────────────────────── */
export const contact = {
  headline: 'TODO: Let’s build something.',
  blurb: 'TODO: two sentences — what you want to hear about and how fast you reply.',
  email: 'maxernst38@gmail.com',
  emailSubject: 'Hello from your portfolio',   // prefilled mailto subject
  socials: [
    {
      label: 'GitHub',
      handle: '@maxernst38',
      href: 'https://github.com/maxernst38',
      icon: 'github',
    },
    {
      label: 'LinkedIn',
      handle: 'TODO: /in/…',
      href: 'TODO: https://linkedin.com/in/…',
      icon: 'linkedin',
    },
    {
      label: 'Email',
      handle: 'maxernst38@gmail.com',
      href: 'mailto:maxernst38@gmail.com',
      icon: 'mail',
    },
  ],
}

/* ── SEO / per-route meta ──────────────────────────────────────────────── */
export const seo = {
  siteUrl: 'https://maxernst.org',
  pages: {
    '/': {
      title: `${profile.name} — Portfolio`,
      description: profile.tagline,
    },
    '/resume': {
      title: `Resume — ${profile.name}`,
      description: 'TODO: resume page description.',
    },
    '/projects': {
      title: `Projects — ${profile.name}`,
      description: 'TODO: projects page description.',
    },
    '/contact': {
      title: `Contact — ${profile.name}`,
      description: 'TODO: contact page description.',
    },
  },
}
