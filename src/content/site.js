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

// import portrait1     from '../assets/images/portrait-1.jpg'        // 880×1100 (4/5)
// import portrait2     from '../assets/images/portrait-2.jpg'        // 880×1100 (4/5)
// import portrait3     from '../assets/images/portrait-3.jpg'        // 880×1100 (4/5)
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
const GITHUB_USER = 'Max-Ernst'

const repo = (name, owner = GITHUB_USER) => `https://github.com/${owner}/${name}`

/* ── Identity ──────────────────────────────────────────────────────────── */
export const profile = {
  // Drives the hero <h1>, every page <title>, the footer copyright and the OG
  // tags. Change it once here and it updates everywhere.
  name: 'Max Ernst',
  shortName: 'Max',                    // navbar wordmark + footer mark
  role: 'Robotics Engineer',
  location: 'Seattle, WA',
  availability: 'Open to new roles',   // hero status pill; set null to hide
  tagline: 'Robotics engineer building perception and control systems that hold up outside the lab.',
  bio:
    'I build robots that have to work in the real world — telerobotic surgery arms, ' +
    'autonomous ground vehicles, and the perception pipelines that let them understand ' +
    'what they are looking at. Dual B.S.E. in Computer Science and Robotics from the ' +
    'University of Michigan, with work spanning DARPA-funded research, medical-grade ' +
    'robotic control, and computer vision at dataset scale.',
  // Hero slideshow. Add as many as you like — they crossfade automatically.
  // With one photo (or none yet) it renders as a plain image with no controls,
  // so this works at any count. Same 4/5 crop for all of them.
  photos: [
    { src: null, alt: 'TODO: describe photo 1, e.g. "Max beside a robotic arm"' },
    { src: null, alt: 'TODO: describe photo 2, e.g. "Max at the fabrication lab"' },
    { src: null, alt: 'TODO: describe photo 3, e.g. "Max with a competition team"' },
  ],
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

/* ── Home page navigation buttons (the "splash → hub" section) ─────────── */
export const homeCards = [
  { to: '/resume', label: 'Resume' },
  { to: '/projects', label: 'Projects' },
  { to: '/contact', label: 'Contact' },
]

/* ── Projects ────────────────────────────────────────────────────────────
   Each project gets its own page at /projects/<slug>, where `description`
   is shown in full. Order here is the order they appear on the page.

   `demo` attaches a live, interactive app to that page. Set it to a key from
   src/demos/registry.js, or null for a write-up only. Demos are lazy-loaded,
   so a heavy one costs the rest of the site nothing until someone opens it. */
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
    tags: ['Python', 'Streamlit', 'CLIP', 'PyTorch', 'Plotly'],
    image: { src: null, alt: 'TODO: screenshot of the 3D embedding view with class centroids' },
    links: [
      { label: 'Source', href: repo('Latent-Space-3D-Explorer'), icon: 'github' },
    ],
    demo: null,   // ← the browser port would attach here
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
    image: { src: null, alt: 'TODO: photo of the arm mid-move over the chessboard' },
    links: [
      // Already on maxernst38; drop the override once everything else moves there.
      { label: 'Source', href: repo('Kasparobot', 'maxernst38'), icon: 'github' },
    ],
    demo: null,
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
    image: { src: null, alt: 'TODO: the robot in the maze, or the generated occupancy map' },
    links: [],   // TODO: add a repo or demo video link if you have one
    demo: null,
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
    image: { src: null, alt: 'TODO: grid of generated Pokémon designs' },
    links: [
      { label: 'Source', href: repo('Pokemon-Design-Synthesis'), icon: 'github' },
    ],
    demo: null,
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
    image: { src: null, alt: 'TODO: sample generations with their text prompts' },
    links: [],   // TODO: add a repo link if this is published
    demo: null,
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
    '/contact': {
      title: `Contact — ${profile.name}`,
      description: 'Get in touch with Max Ernst — robotics engineer based in Seattle, WA.',
    },
  },
}
