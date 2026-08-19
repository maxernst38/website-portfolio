/**
 * Inline SVG icons — ~13 of them, so a dependency like lucide-react would cost
 * more than it saves. All are 24×24, stroke-based, and inherit `currentColor`,
 * so they take their colour from whatever text colour surrounds them.
 *
 * Every icon is aria-hidden: they are decorative. If an icon is the ONLY
 * content of a control, put an aria-label on the control itself.
 */

function Icon({ children, className = 'h-5 w-5', ...rest }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const ArrowRight = (p) => (
  <Icon {...p}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></Icon>
)

export const ArrowUpRight = (p) => (
  <Icon {...p}><path d="M7 17 17 7" /><path d="M7 7h10v10" /></Icon>
)

export const ChevronDown = (p) => (
  <Icon {...p}><path d="m6 9 6 6 6-6" /></Icon>
)

export const Menu = (p) => (
  <Icon {...p}><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></Icon>
)

export const X = (p) => (
  <Icon {...p}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></Icon>
)

export const Mail = (p) => (
  <Icon {...p}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </Icon>
)

export const Github = (p) => (
  <Icon {...p}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </Icon>
)

export const Linkedin = (p) => (
  <Icon {...p}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </Icon>
)

export const Copy = (p) => (
  <Icon {...p}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </Icon>
)

export const Check = (p) => (
  <Icon {...p}><path d="M20 6 9 17l-5-5" /></Icon>
)

export const Download = (p) => (
  <Icon {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="m7 10 5 5 5-5" />
    <path d="M12 15V3" />
  </Icon>
)

export const ExternalLink = (p) => (
  <Icon {...p}>
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6" />
  </Icon>
)

export const Pause = (p) => (
  <Icon {...p}>
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </Icon>
)

export const Play = (p) => (
  <Icon {...p}><path d="M6 3.5 20 12 6 20.5V3.5z" /></Icon>
)

export const ImageIcon = (p) => (
  <Icon {...p}>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21" />
  </Icon>
)

/** Maps the `icon` strings used in src/content/site.js to components. */
export const iconMap = {
  github: Github,
  linkedin: Linkedin,
  mail: Mail,
  external: ExternalLink,
  download: Download,
}
