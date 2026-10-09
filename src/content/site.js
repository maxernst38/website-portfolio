// ─────────────────────────────────────────────────────────────────────────────
//  ALL SITE CONTENT LIVES HERE. Editing this file changes the whole site.
//
//  Remaining placeholders are marked "TODO:" — grep -rn "TODO:" src/content/site.js
//
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

import portrait1     from '../assets/images/me_niagara.jpg'        // 880×1100 (4/5)
import portrait2     from '../assets/images/me_hike_mountain.jpg'        // 880×1100 (4/5)
import portrait3     from '../assets/images/me_in_woods.jpg'        // 880×1100 (4/5)
// import shotExplorer  from '../assets/images/project-explorer.png'  // 1120×630 (16/9)
// import shotKasparo   from '../assets/images/project-kasparobot.png'// 1120×630 (16/9)
// import shotSlam      from '../assets/images/project-slam.png'      // 1120×630 (16/9)
// import shotPokemon   from '../assets/images/project-pokemon.png'   // 1120×630 (16/9)
// import shotDiffusion from '../assets/images/project-diffusion.png' // 1120×630 (16/9)

/* ── GitHub ────────────────────────────────────────────────────────────────
   Every GitHub link on the site is built from this. Projects are currently
   split across two accounts and are being consolidated onto `maxernst38`.

   When the migration is done: set GITHUB_USER to 'maxernst38' and delete the
   one owner override on Kasparobot below. That is the whole change.

   Note: if you move repos with GitHub's "Transfer ownership" rather than
   deleting and re-pushing, GitHub keeps redirects from the old URLs, so links
   out in the world (and this site) keep working through the switch. */
const GITHUB_USER = 'maxernst38'

const repo = (name, owner = GITHUB_USER) => `https://github.com/${owner}/${name}`

/* ── Identity ──────────────────────────────────────────────────────────── */
export const profile = {
  // Drives the hero <h1>, every page <title>, the footer copyright and the OG
  // tags. Change it once here and it updates everywhere.
  name: 'Max Ernst',
  shortName: 'Max',                    // navbar wordmark + footer mark
  role: 'Robotics and Software Engineer',
  location: 'Seattle, WA',
  availability: 'Open to new roles',   // hero status pill; set null to hide
  tagline: 'Robotics engineer building perception and control systems that hold up outside the lab.',
  bio:
    'Dual B.S.E. in Computer Science and Robotics from the ' +
    'University of Michigan, with work spanning DARPA-funded research, medical-grade ' +
    'robotic control, and computer vision datasets.' +
    'I split my time outside of work between hiking, camping, skiing, playing volleyball, and' +
    ' playing bass and drums.',
  // Hero slideshow. Add as many as you like — they crossfade automatically.
  // With one photo (or none yet) it renders as a plain image with no controls,
  // so this works at any count. Same 4/5 crop for all of them.
  photos: [
    { src: portrait1, alt: '' },
    { src: portrait2, alt: '' },
    { src: portrait3, alt: '' },
  ],
  resumePdf: '/resume.pdf',   // set to '/resume.pdf' after dropping the file into public/
}

/* ── Navigation (drives navbar, mobile menu, footer) ───────────────────── */
export const nav = [
  { label: 'Home', to: '/' },
  { label: 'Resume', to: '/resume' },
  { label: 'Projects', to: '/projects' },
  { label: 'Tutoring', to: '/tutoring' },
  { label: 'Contact', to: '/contact' },
]

/* ── Hero call-to-action buttons ───────────────────────────────────────── */
export const heroCtas = [
  { label: 'View my work', to: '/projects', variant: 'primary' },
  { label: 'Get in touch', to: '/contact', variant: 'secondary' },
]

/* ── Home page navigation buttons (the "splash → hub" section) ─────────── */
export const homeCards = [
  { to: '/resume', label: 'Resume' },
  { to: '/projects', label: 'Projects' },
  { to: '/tutoring', label: 'Tutoring' },
  { to: '/contact', label: 'Contact' },
]

/* ── Projects ────────────────────────────────────────────────────────────
   Each project gets its own page at /projects/<slug>, where `description`
   is shown in full. Order here is the order they appear on the page.

   `media` is the gallery on that page, in display order. Its first entry is
   also the thumbnail on the /projects grid, so lead with the best shot.

   Two kinds of entry:

     { kind: 'image', src: shotKasparo, alt: 'Arm lifting a piece' }
     { kind: 'video', provider: 'youtube', id: 'dQw4w9WgXcQ',
       poster: shotKasparo, alt: 'One full move, start to finish' }

   `kind` defaults to 'image', so a bare { src, alt } is a photo. A video
   renders as its poster plus a play button and pulls the YouTube iframe in
   only once clicked — so a project page costs a visitor nothing until they
   press play, and no third-party frame loads for anyone who never does.
   `poster` is optional; without one the facade is a plain dark frame.

   Entries with `src: null` render as correctly-sized placeholders, so this
   list doubles as a shooting list — the alt text says what to capture.

   There are deliberately no live demos on this site. Code and usage belong
   on GitHub, which is what `links` is for; the gallery shows it working. */
export const projects = [
  {
    slug: 'encoding-explorer',
    title: '3D Encoding Explorer',
    year: '2025',
    role: 'Solo project',
    blurb:
      'Squashes CLIP embeddings into an explorable 3D space, so visual similarity becomes physical distance.',
    description:
      'Encodes image datasets with CLIP and projects the high-dimensional embeddings down ' +
      'to three dimensions you can fly through. It goes past plotting points: it computes ' +
      'per-class centroids, measures how far any individual image sits from where its label ' +
      'says it belongs, and surfaces "eigen-images" — the images lying along a class’s ' +
      'direction of maximum variance. The point is to make dataset problems visible, so ' +
      'mislabelled samples and blurred class boundaries show up as spatial outliers rather ' +
      'than as a number in an evaluation table.',
    tags: ['Python', 'CLIP', 'PyTorch', 'three.js', 'WebGL'],
    media: [
      { src: null, alt: 'The 3D embedding cloud, coloured by class, with centroids marked' },
      { src: null, alt: 'Eigen-images along a class’s direction of maximum variance' },
      { src: null, alt: 'A mislabelled sample sitting far from its class centroid' },
    ],
    links: [
      { label: 'Source', href: repo('Latent-Space-3D-Explorer'), icon: 'github' },
    ],
  },
  {
    slug: 'kasparobot',
    title: 'Kasparobot',
    year: '2026',
    role: 'Solo build',
    blurb:
      'An autonomous chess robot that sees the board, decides on a move, and physically plays it.',
    description:
      'Closes the loop between computer vision, a chess engine, and robotic manipulation. ' +
      'A YOLO-based detector locates the pieces, and Hough-line homography calibration ' +
      'rectifies the camera’s oblique view of the board into a machine-readable FEN game ' +
      'state. Stockfish selects the move, and a ROS control interface translates that ' +
      'decision into arm trajectories precise enough to actually pick up and place a piece.',
    tags: ['Python', 'YOLO', 'OpenCV', 'ROS', 'Stockfish'],
    media: [
      { src: null, alt: 'The arm mid-move, lifting a piece clear of the board' },
      { src: null, alt: 'The camera’s oblique view beside the rectified board and its FEN' },
      { src: null, alt: 'YOLO piece detections overlaid on a live frame' },
    ],
    links: [
      // Already on maxernst38; drop the override once everything else moves there.
      { label: 'Source', href: repo('Kasparobot', 'maxernst38'), icon: 'github' },
    ],
  },
  {
    slug: 'slam-navigation-robot',
    title: 'Autonomous SLAM Navigation Robot',
    year: '2024',
    role: 'University of Michigan',
    blurb:
      'A ground robot that maps an unknown maze and drives itself to colour-coded goals.',
    description:
      'Fuses LiDAR and camera data to localise and map simultaneously, with no prior ' +
      'knowledge of the environment. Camera-based colour detection is registered against ' +
      'the SLAM map so the robot can recognise targets as it discovers them, and path ' +
      'planning runs over the generated occupancy grid to get from start to goal with no ' +
      'human intervention.',
    tags: ['C++', 'ROS', 'SLAM', 'LiDAR', 'Computer Vision'],
    media: [
      { src: null, alt: 'The robot partway through the maze' },
      { src: null, alt: 'The generated occupancy grid with the planned path drawn on it' },
      { src: null, alt: 'A colour-coded goal marker as the camera sees it' },
    ],
    links: [],   // TODO: add a repo or demo video link if you have one
  },
  {
    slug: 'pokemon-gan',
    title: 'Pokémon Design Generator',
    year: '2023',
    role: 'Solo project',
    blurb:
      'A GAN trained on every Pokémon design up to 2020, generating plausible new ones.',
    description:
      'Built and trained a generative adversarial network in PyTorch on the University of ' +
      'Michigan HPC cluster, scheduling jobs with SLURM. The interesting constraint was ' +
      'dataset size — under a thousand designs — so getting a stable generator meant heavy ' +
      'augmentation pipelines to expand diversity and stop training from collapsing.',
    tags: ['Python', 'PyTorch', 'GAN', 'SLURM'],
    media: [
      { src: null, alt: 'Grid of generated designs' },
      { src: null, alt: 'Training progression from noise to recognisable designs' },
    ],
    links: [
      { label: 'Source', href: repo('Pokemon-Design-Synthesis'), icon: 'github' },
    ],
  },
  {
    slug: 'diffusion-image-generator',
    title: 'Stable Diffusion Image Generator',
    year: '2024',
    role: 'Solo project',
    blurb:
      'A text-to-image diffusion pipeline built from the components up, not fine-tuned.',
    description:
      'Implemented training and inference for text-conditioned image generation from the ' +
      'parts — U-Net backbone, text encoder, and latent image decoder — rather than ' +
      'fine-tuning an off-the-shelf checkpoint. Trained on Flickr8k in PyTorch with CUDA ' +
      'acceleration on a local NVIDIA GPU.',
    tags: ['Python', 'PyTorch', 'Diffusion', 'CUDA'],
    media: [
      { src: null, alt: 'Sample generations captioned with the prompts that produced them' },
      { src: null, alt: 'One prompt denoised across timesteps' },
    ],
    links: [],   // TODO: add a repo link if this is published
  },
]

/* ── Resume ────────────────────────────────────────────────────────────── */
// NOTE: `experience` and `education` share one shape on purpose — both render
// through the same <TimelineItem/>. Keep them structurally identical.
export const resume = {
  summary:
    'Robotics engineer with dual degrees in Computer Science and Robotics from the ' +
    'University of Michigan, specialising in computer vision, autonomous systems, and ' +
    'human-robot interaction. Experienced across the full stack of robotics work, from ' +
    'low-level hardware integration to AI-powered perception pipelines, with applied ' +
    'work spanning remote robotic control, DARPA-funded research, and autonomous ' +
    'navigation.',

  experience: [
    {
      title: 'Robotics Program Director',
      org: 'StemSci',
      orgUrl: null,
      location: 'Bellevue, WA',
      start: 'Jun 2026',
      end: 'Present',
      bullets: [
        'Head multiple robotics programs across StemSci and Steamoji, spanning a nonprofit high school research initiative and competitive VEX V5/IQ teams.',
        'Lead student research projects from research design through to conference presentation and publication.',
        'Recruit, train and delegate mentors across teams, managing curriculum and coaching quality while running the fabrication lab and facility.',
        'Building a parent/student app and a data-driven system to track team performance and surface trends for coaching strategy.',
      ],
      tags: ['Program leadership', 'VEX V5/IQ', 'Mentorship'],
    },
    {
      title: 'Robotics Engineer (Contract)',
      org: 'Dopl Technologies',
      orgUrl: null,
      location: 'Bothell, WA',
      start: 'Jan 2026',
      end: 'May 2026',
      bullets: [
        'Hired on a fixed-term contract to bring a medical-grade Kuka robotic arm to Alpha completion.',
        'Designed and deployed a 1:1 telerobotic control pipeline for a Kuka LBR Med 800, with intelligent nullspace navigation, IEC 80601 and ISO 14971 compliant safety controls, haptic feedback via Haply Inverse3, and 3D patient surface capture using RealSense RGBD cameras.',
        'Integrated 3-DOF force sensing to enable patient-compliant contact control and safe body interaction during ultrasound exams.',
        'Delivered a customer-facing interface streaming robot state in real time — joint positions, tool pose, force/torque data and controller state — for downstream visualisation and cloud-based recording.',
      ],
      tags: ['Kuka LBR Med', 'Teleoperation', 'RealSense', 'Haptics', 'IEC 80601'],
    },
    {
      title: 'Research Associate, Corso Group',
      org: 'University of Michigan, College of Engineering',
      orgUrl: null,
      location: 'Ann Arbor, MI',
      start: 'Jun 2024',
      end: 'Aug 2025',
      bullets: [
        'Researched computer vision and AI with a focus on dataset curation, measurement and evaluation for object detection and segmentation systems.',
        'Developed a methodology to assess dataset completeness and quality by evaluating CLIP-encoding patterns and cross-referencing batch-trained detectors to surface unlabelled items.',
        'Collaborated on a DARPA-funded project deploying a mobile robot that fused LiDAR-based SLAM with a camera-driven vision-language model and tree graph architecture to semantically evaluate and navigate real environments.',
        'Partnered with defence contractor Third Insight on an RGB/IR YOLO-based object detection and rangefinding system for multi-modal sensing.',
        'Designed data curation pipelines to balance class distributions and surface underrepresented samples, directly improving downstream model quality.',
      ],
      tags: ['CLIP', 'YOLO', 'SLAM', 'VLMs', 'DARPA'],
    },
    {
      title: 'Vulcan Autonomous Wheelchair',
      org: 'University of Michigan, College of Engineering',
      orgUrl: null,
      location: 'Ann Arbor, MI',
      start: 'Jun 2023',
      end: 'Sep 2023',
      bullets: [
        'Rebuilt core hardware systems, repairing and soldering damaged electronics and reconstructing structural components of the autonomous wheelchair platform.',
        'Revived the software stack by improving YOLO-based topological and LiDAR-based metrical mapping, increasing reliability and enabling better socially-aware navigation in hospital environments.',
      ],
      tags: ['YOLO', 'LiDAR', 'Hardware', 'Navigation'],
    },
    {
      title: 'Software Engineering Intern',
      org: 'Robotire',
      orgUrl: null,
      location: 'Plymouth, MI',
      start: 'May 2022',
      end: 'Aug 2022',
      bullets: [
        'Refactored and extended RGBD wheel-well depth analysis using Zivid 3D cameras to accurately locate lugnuts for automated tire-changing robots.',
        'Built a VIN-based vehicle identification database and lookup system to retrieve specifications and support automated service workflows, backed by AWS S3.',
        'Implemented a utilities testing framework reaching 98% code coverage, identifying performance inefficiencies and improving system reliability.',
      ],
      tags: ['Python', 'RGBD', 'AWS S3', 'Testing'],
    },
  ],

  education: [
    {
      title: 'B.S.E. Computer Science and B.S.E. Robotics',
      org: 'University of Michigan',
      orgUrl: 'https://umich.edu',
      location: 'Ann Arbor, MI',
      start: 'Sep 2020',   // TODO: confirm your start date
      end: 'May 2024',
      bullets: [
        'Dual Bachelor of Science in Engineering degrees, awarded May 2024.',
        'Relevant coursework: 3D Robot Perception, Computer Vision, SLAM and Navigation, Autonomous Vehicles, Robot Operating Systems, Machine Learning, Linear Algebra.',
      ],
      tags: [],
    },
  ],

  skills: [
    {
      group: 'Languages',
      items: ['Python', 'C++', 'C', 'JavaScript', 'TypeScript', 'Java', 'SQL', 'MATLAB', 'R'],
    },
    {
      group: 'Perception & ML',
      items: ['PyTorch', 'TensorFlow', 'OpenCV', 'YOLO', 'CLIP', 'GroundingDINO', 'Segment Anything', 'scikit-learn', 'CUDA'],
    },
    {
      group: 'Robotics & Hardware',
      items: ['ROS', 'SLAM', 'Kuka robots', 'LiDAR', 'RGBD cameras', 'IMUs', 'Pressure sensors', 'Soldering'],
    },
    {
      group: 'Tools',
      items: ['Git', 'Jira', 'FiftyOne', 'AWS S3', 'SLURM', 'Agile / SCRUM'],
    },
  ],

  facts: [
    { label: 'Based in', value: 'Seattle, WA' },
    { label: 'Focus', value: 'Perception, autonomy, human-robot interaction' },
  ],
}

/* ── Tutoring ──────────────────────────────────────────────────────────
   Drives /tutoring. `rate: null` renders as "Rates on request", so the page
   is publishable before pricing is decided. */
export const tutoring = {
  headline: 'One-on-one tutoring in code, math and robotics.',
  blurb:
    'I tutor high school and university students in the subjects I use every day as ' +
    'an engineer. Sessions are built around your coursework, project or competition, ' +
    'and the goal is always the same: you understand it well enough to do it without me.',

  subjects: [
    {
      title: 'Programming',
      description:
        'From a first language to confident, readable code. Debugging, project structure, ' +
        'and the habits that make assignments stop fighting back.',
      tags: ['Python', 'C++', 'Java', 'JavaScript'],
    },
    {
      title: 'Computer Science',
      description:
        'Core university coursework: data structures, algorithms, complexity, and the ' +
        'problem-solving patterns behind technical interviews.',
      tags: ['Data structures', 'Algorithms', 'AP CS A'],
    },
    {
      title: 'Math',
      description:
        'Algebra through calculus and linear algebra, taught with an eye on where each ' +
        'idea actually gets used.',
      tags: ['Algebra', 'Precalculus', 'Calculus', 'Linear algebra'],
    },
    {
      title: 'Robotics',
      description:
        'Competition prep and personal builds: robot design, sensors, control, and ' +
        'programming, from VEX to ROS.',
      tags: ['VEX V5/IQ', 'ROS', 'Arduino', 'Sensors'],
    },
    {
      title: 'Machine Learning & Vision',
      description:
        'The maths and code behind modern ML, for students taking a course or building ' +
        'their first model.',
      tags: ['PyTorch', 'OpenCV', 'Neural networks'],
    },
    {
      title: 'Research Mentoring',
      description:
        'For students starting an independent project: scoping a question, running ' +
        'experiments, and writing it up for a science fair or conference.',
      tags: ['Project design', 'Technical writing'],
    },
  ],

  // Shown as offer cards. `rate` is a display string, e.g. '$80 / hour'.
  formats: [
    {
      title: 'Online',
      description: 'Video call with a shared screen and whiteboard. Available anywhere.',
      rate: null,   // TODO: e.g. '$70 / hour'
    },
    {
      title: 'In person',
      description: 'Around Seattle and the Eastside, at a library or your home.',
      rate: null,   // TODO: e.g. '$85 / hour'
    },
  ],

  steps: [
    {
      title: 'Get in touch',
      description: 'Email me with the subject, level, and what you are working towards.',
    },
    {
      title: 'Free intro call',
      description: 'A short call to see where you are and whether I am the right fit.',
    },
    {
      title: 'Regular sessions',
      description: 'Weekly or as needed, each one planned around what is coming up next.',
    },
  ],

  faqs: [
    {
      q: 'Who do you tutor?',
      a: 'Mostly high school and university students, plus adults learning to code. If you are not sure your subject is covered, ask.',
    },
    {
      q: 'How long is a session?',
      a: 'Usually an hour. Ninety minutes works well for project help or exam prep.',
    },
    {
      q: 'Do you help with homework?',
      a: 'Yes, by working through it with you rather than doing it for you. You will leave able to solve the next one yourself.',
    },
  ],

  emailSubject: 'Tutoring inquiry',   // prefilled mailto subject
}

/* ── Contact ───────────────────────────────────────────────────────────── */
export const contact = {
  headline: 'Let’s build something that works.',
  blurb:
    'Open to robotics and perception roles, and always happy to talk about autonomy, ' +
    'computer vision, or a robot that is misbehaving. I reply to everything.',
  email: 'maxernst38@gmail.com',
  emailSubject: 'Hello from your portfolio',   // prefilled mailto subject
  socials: [
    {
      label: 'GitHub',
      handle: `@${GITHUB_USER}`,
      href: `https://github.com/${GITHUB_USER}`,
      icon: 'github',
    },
    {
      label: 'LinkedIn',
      handle: '/in/maxaernst',
      href: 'https://linkedin.com/in/maxaernst',
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
      description:
        'Robotics engineer with experience in telerobotics, computer vision and autonomous navigation, across Dopl Technologies, the University of Michigan and Robotire.',
    },
    '/projects': {
      title: `Projects — ${profile.name}`,
      description:
        'Robotics and machine learning projects: a 3D CLIP embedding explorer, an autonomous chess robot, a SLAM navigation robot, and generative image models.',
    },
    '/tutoring': {
      title: `Tutoring — ${profile.name}`,
      description:
        'One-on-one tutoring in programming, computer science, math, robotics and machine learning, online or in person around Seattle.',
    },
    '/contact': {
      title: `Contact — ${profile.name}`,
      description: 'Get in touch with Max Ernst — robotics engineer based in Seattle, WA.',
    },
  },
}
