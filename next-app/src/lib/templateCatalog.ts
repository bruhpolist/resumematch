export interface TemplateCatalogItem {
  id: string;
  name: string;
  preview: string;
  premium: boolean;
  accentColor: string;
  family: "classic" | "modern" | "premium";
}

export const templateCatalog: TemplateCatalogItem[] = [
  {
    id: "classic",
    name: "Classic",
    preview: "A clean, traditional resume format.",
    premium: false,
    accentColor: "#0f766e",
    family: "classic",
  },
  {
    id: "modern",
    name: "Modern",
    preview: "Sleek design with strategic use of color.",
    premium: false,
    accentColor: "#0ea5e9",
    family: "modern",
  },
  {
    id: "minimal-image",
    name: "Minimal Image",
    preview: "Minimal design with profile image.",
    premium: false,
    accentColor: "#7c3aed",
    family: "modern",
  },
  {
    id: "minimal",
    name: "Minimal",
    preview: "Ultra-clean design that focuses on content.",
    premium: false,
    accentColor: "#16a34a",
    family: "classic",
  },
  {
    id: "executive",
    name: "Executive",
    preview: "Poster layout with left information rail, circular photo, pill headers, and bold skill bars.",
    premium: true,
    accentColor: "#1d4ed8",
    family: "premium",
  },
  {
    id: "corporate",
    name: "Corporate",
    preview: "Magazine-inspired layout with giant circles, centered portrait, and airy editorial sections.",
    premium: true,
    accentColor: "#7c2d12",
    family: "premium",
  },
  {
    id: "elegant",
    name: "Elegant",
    preview: "Minimal gray editorial board with strong header band, timeline, and achievement blocks.",
    premium: true,
    accentColor: "#334155",
    family: "premium",
  },
  {
    id: "sidebar-pro",
    name: "Sidebar Pro",
    preview: "Dark poster card with glowing circular frame, stacked panels, and neon-style skill chart.",
    premium: true,
    accentColor: "#0f172a",
    family: "premium",
  },
  {
    id: "compact-pro",
    name: "Compact Pro",
    preview: "Soft infographic resume with central axis, rounded gradient labels, and node-based sections.",
    premium: true,
    accentColor: "#db2777",
    family: "premium",
  },
  {
    id: "golden-arc",
    name: "Golden Arc",
    preview: "Golden left rail with rounded portrait crop, pill headers, and editorial experience blocks.",
    premium: true,
    accentColor: "#d97706",
    family: "premium",
  },
  {
    id: "aqua-orbit",
    name: "Aqua Orbit",
    preview: "Aqua poster with floating circles, deep side panel, portrait card, and structured two-column body.",
    premium: true,
    accentColor: "#0891b2",
    family: "premium",
  },
  {
    id: "soft-taupe",
    name: "Soft Taupe",
    preview: "Taupe minimal resume board with circular CV badge, mono lines, soft dividers, and calm hierarchy.",
    premium: true,
    accentColor: "#78716c",
    family: "premium",
  },
  {
    id: "teal-stripe",
    name: "Teal Stripe",
    preview: "Dark teal sidebar with angled top motif, compact data modules, and crisp right-column sections.",
    premium: true,
    accentColor: "#0f766e",
    family: "premium",
  },
  {
    id: "navy-beam",
    name: "Navy Beam",
    preview: "Navy hero header with diagonal beams, giant circular portrait, contact rail, and timeline body.",
    premium: true,
    accentColor: "#1e3a8a",
    family: "premium",
  },
  {
    id: "futuristic-neon",
    name: "Futuristic Neon",
    preview: "Cyberpunk-inspired neon HUD layout with glowing panels, sci-fi overlays, matrix cards, and rich futuristic elements.",
    premium: true,
    accentColor: "#22c55e",
    family: "premium",
  },
];
