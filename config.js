/* ============================================================
   LinkHub — Configuration
   ------------------------------------------------------------
   Edit ONLY this file to customise your page.
   No need to touch index.html, styles.css or app.js.
   ============================================================ */

const LINKHUB_CONFIG = {
  // ---------- Profile ----------
  profile: {
    name: "Abdul Rahman Dogar",
    username: "@abdulrahman_dogar",
    initials: "AD",
    // Short, real bio — edit to taste. Keep it to 1–2 lines.
    bio: "Builder • Trader • Digital creator. I build useful tools, templates and trading resources — and share what I learn along the way.",
    location: "Pakistan",
    // Shown under the bio. Leave empty ("") to hide it.
    tagline: "Templates, tools & trading resources — all in one place.",
    // Set to a real image URL to use a photo instead of initials,
    // e.g. avatarImage: "avatar.jpg". Leave "" to use initials.
    avatarImage: "",
    // "Available for work" badge. Set to false to hide it.
    availableForWork: true,
    availableText: "Available for collaborations"
  },

  // ---------- Social links ----------
  // Add, remove or reorder entries. Each entry needs:
  //   label, url, icon (an SVG key from app.js: github, x, instagram,
  //   linkedin, youtube, telegram, globe, mail) and handle (shown below label).
  // The GitHub URL below is verified. Replace the other handles with
  // your real ones — they are the editable defaults for this template.
  socials: [
    { label: "GitHub",    handle: "@abdulrahman-dogar-web", url: "https://github.com/abdulrahman-dogar-web", icon: "github" },
    { label: "X / Twitter", handle: "@abdulrahman_dogar",   url: "https://x.com/abdulrahman_dogar",          icon: "x" },
    { label: "Instagram", handle: "@abdulrahman.dogar",     url: "https://instagram.com/abdulrahman.dogar",  icon: "instagram" },
    { label: "LinkedIn",  handle: "Abdul Rahman Dogar",     url: "https://linkedin.com/in/abdul-rahman-dogar", icon: "linkedin" },
    { label: "YouTube",   handle: "@abdulrahmandogar",      url: "https://youtube.com/@abdulrahmandogar",    icon: "youtube" },
    { label: "Telegram",  handle: "@abdulrahmandogar",      url: "https://t.me/abdulrahmandogar",           icon: "telegram" }
  ],

  // ---------- Featured / quick links ----------
  // The big buttons under the profile. `badge` is optional.
  links: [
    {
      title: "TradeNest Capital",
      subtitle: "Funded trading — Ignite, Ascent & Instant Funding",
      url: "https://github.com/abdulrahman-dogar-web",
      badge: "Featured",
      icon: "chart"
    },
    {
      title: "My GitHub Projects",
      subtitle: "Open-source tools & templates I build in public",
      url: "https://github.com/abdulrahman-dogar-web?tab=repositories",
      badge: "",
      icon: "github"
    },
    {
      title: "Free Trading Journal (Notion)",
      subtitle: "The exact journal template I use every day",
      url: "#store",
      badge: "Popular",
      icon: "journal"
    },
    {
      title: "Browse the Digital Store",
      subtitle: "Templates, icon packs & checklists — instant download",
      url: "#store",
      badge: "",
      icon: "store"
    }
  ],

  // ---------- Mini digital store ----------
  store: {
    heading: "Digital Store",
    subheading: "Instant-download templates & resources. Pay once, keep forever.",
    // Demo checkout: no real payment is processed. The Buy button opens
    // a modal that explains this clearly — see app.js.
    checkoutNote: "Demo checkout — no payment is taken and no order is placed. Connect your real payment provider (Gumroad, Lemon Squeezy or Stripe) to sell for real.",
    currency: "USD",
    products: [
      {
        id: "notion-trading-journal",
        name: "Ultimate Notion Trading Journal",
        price: 19,
        originalPrice: 29,
        tag: "Best seller",
        emoji: "📈",
        description: "A complete Notion system to log trades, track win rate, review mistakes and spot your edge — with dashboards, filters and a weekly review page.",
        includes: ["Trade log & dashboard", "Weekly review template", "Risk calculator", "Lifetime updates"],
        format: "Notion template • Instant download"
      },
      {
        id: "trading-checklist-pack",
        name: "Trading Checklist & Risk Pack",
        price: 15,
        originalPrice: 0,
        tag: "New",
        emoji: "✅",
        description: "Pre-trade checklists, position-size calculator and risk rules in a clean printable pack. Stop revenge trading, start trading with a plan.",
        includes: ["Pre-trade checklist", "Position-size calculator (Excel + Sheets)", "Risk rules one-pager"],
        format: "PDF + Excel / Google Sheets"
      },
      {
        id: "minimal-icon-pack",
        name: "Minimal Icon Pack — 500 Icons",
        price: 12,
        originalPrice: 24,
        tag: "",
        emoji: "🎨",
        description: "500 crisp, minimal line icons in SVG + PNG, made for websites, apps and Notion. Consistent 24px grid, dark & light versions included.",
        includes: ["500 SVG icons", "500 PNG icons (1x / 2x)", "Dark & light variants", "Commercial licence"],
        format: "SVG + PNG • ZIP download"
      },
      {
        id: "digital-launch-checklist",
        name: "Digital Product Launch Checklist",
        price: 9,
        originalPrice: 0,
        tag: "",
        emoji: "🚀",
        description: "The step-by-step checklist for launching a digital product: pricing, landing page, payment, delivery and launch-day promotion — nothing forgotten.",
        includes: ["42-step launch checklist", "Pricing worksheet", "Launch email templates"],
        format: "PDF + Notion checklist"
      }
    ]
  },

  // ---------- Footer ----------
  footer: {
    text: "Built with LinkHub",
    copyrightName: "Abdul Rahman Dogar",
    year: 2026
  }
};

// Expose for app.js (and for anyone inspecting in the console).
window.LINKHUB_CONFIG = LINKHUB_CONFIG;

/* ---------- Server store (live backend) ----------
   The page loads its profile from the live backend at apiBase
   (Vercel + Vercel Blob, durable storage), so edits made on one
   device show up on every device. Set apiBase to "" to fall back
   to KVdb directly. The bucket id is a random identifier, not a secret. */
window.APP_CONFIG = {
  bucket: "E1Ca9VeHqAZoPyRb54aTTv",
  prefix: "lh:",
  apiBase: "https://apps-backend-tahqeeq.vercel.app"
};
