# LinkHub

A premium link-in-bio page with a mini digital store — for **Abdul Rahman Dogar**.

One page, zero build step. The live content (profile, links, store, clicks) is stored in KVdb so edits show up on every device — see "Editing the live page" below.

![Dark theme](https://img.shields.io/badge/theme-dark%20premium-7c5cff)
![Stack](https://img.shields.io/badge/stack-HTML%20%2B%20CSS%20%2B%20vanilla%20JS-00d4a6)
![License](https://img.shields.io/badge/license-MIT-blue)

## Features

- **Premium profile page** — gradient initials avatar (no broken image links; set a real photo in `config.js` if you want one), name, bio, tagline, location and an "Available for collaborations" badge.
- **Social links** — GitHub, X/Twitter, Instagram, LinkedIn, YouTube and Telegram, rendered from one config file.
- **Featured links** — big tap-friendly cards with icons, subtitles and optional badges (e.g. "Featured", "Popular").
- **Mini digital store** — 4 realistic instant-download products with USD prices, "what's included" lists, format notes and sale prices:
  1. Ultimate Notion Trading Journal — $19 (was $29)
  2. Trading Checklist & Risk Pack — $15
  3. Minimal Icon Pack — 500 Icons — $12 (was $24)
  4. Digital Product Launch Checklist — $9
- **Demo checkout** — the Buy button opens a modal that clearly states **no payment is taken and no order is placed**. No fake payment processing, no fake order numbers, no card fields. Connect a real provider (Gumroad, Lemon Squeezy or Stripe) to sell for real.
- **Click tracking** — total, link and store clicks are counted in the stats strip and stored on the server (in the profile document), so the same total shows on every device. Clicks are also kept in the visitor's browser (`localStorage`, `linkhub_clicks_v1`) as a fallback while no profile has been saved yet. Two visitors clicking at the exact same instant can lose one increment (read-modify-write) — acceptable for a stats counter.
- **Server-backed profile** — the live page (name, bio, socials, links, store, clicks) is one document (`profile`) in KVdb, loaded on every visit. If the server can't be reached, the page falls back to the defaults in `config.js` and says so in the status line under the stats.
- **Premium dark design** — mobile-first, responsive (products go 2-up on wider screens), accessible (keyboard-focusable cards, `aria-label`s, Escape closes the modal, reduced-motion support), and fully self-contained — no external fonts, images or CDN requests.

## Editing the live page (owner PIN)

The page visitors see comes from the server, not from `config.js` — so an edit on your phone shows up on every device. Click **✏️ Edit page** under the stats strip.

- **First save sets your owner PIN.** Enter a PIN of at least 4 characters (twice). Only the PIN's **SHA-256 hash** is stored in the profile document (`pinHash`) — the PIN itself is never stored or sent anywhere except to hash it in your browser. Keep it safe: if you forget it, the page can't be edited from the browser.
- **Later edits need the PIN.** Enter it in the edit form; a wrong PIN shows an error and **nothing is saved** (no request is sent).
- **What you can edit:** name, bio, tagline, location, social links (one per line: `Label | handle | URL`), featured links (`Title | subtitle | URL`) and store products (`Title | price | URL`). Product details that aren't in the form (description, "what's included", emoji, sale price) are kept from the existing product.
- **Status line:** under the stats strip the page honestly reports `Saved to server ✓`, `Loaded from server ✓`, or `Couldn't reach the server` — if the server can't be reached, edits are not saved and the page keeps showing the last good version.
- **First visit seeds nothing:** until the owner saves once, visitors see the defaults from `config.js` and no profile document is created on the server.

`config.js` is still the source of the defaults (and of the store heading, checkout note and footer). The server store is configured in `config.js` as `APP_CONFIG = { bucket, prefix: "lh:", apiBase: "" }`. When `apiBase` is empty the page talks to KVdb directly; set it to the self-hosted backend URL later and the same code talks to that instead — no other change needed.

## How to run / demo

No install, no build, no server required.

```bash
# Option 1 — just open it
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux

# Option 2 — serve it locally (optional, same result)
python3 -m http.server 8000
# then visit http://localhost:8000
```

Then:

1. Click a social icon or a featured link — the stats strip counts it.
2. Click **Buy now** on any product — the demo checkout modal explains that no payment is taken.
3. Reload the page — your click counts persist (localStorage).

## How to customise

**Edit `config.js` for the defaults** (what visitors see before the owner saves once, and the store heading/checkout wording). **Use ✏️ Edit page in the browser to change the live page** — that writes to the server.

| What | Where in `config.js` |
|---|---|
| Name, username, bio, tagline, location | `profile` |
| Avatar photo (leave `avatarImage: ""` for initials) | `profile.avatarImage` — e.g. `"avatar.jpg"` |
| "Available for work" badge | `profile.availableForWork` / `profile.availableText` |
| Social links (add / remove / reorder) | `socials` — each entry: `label`, `handle`, `url`, `icon` |
| Featured link cards | `links` — `title`, `subtitle`, `url`, `badge`, `icon` |
| Store heading, products & prices | `store.products` — `name`, `price`, `originalPrice`, `tag`, `emoji`, `description`, `includes`, `format` |
| Demo checkout wording | `store.checkoutNote` |
| Footer copyright | `footer` |

Available icon keys: `github`, `x`, `instagram`, `linkedin`, `youtube`, `telegram`, `globe`, `mail`, `chart`, `journal`, `store`. Unknown keys fall back to `globe`.

> **Note:** the GitHub URL in the default config is verified (`github.com/abdulrahman-dogar-web`). The other social handles are editable defaults — replace them with your real handles in `config.js` before sharing the page publicly.

## To sell for real

Replace the demo modal in `app.js` (`openCheckout`) with a link to your product on Gumroad, Lemon Squeezy or Stripe Payment Links — e.g. make each product's Buy button open its real checkout URL in a new tab. The product data (`id`, `name`, `price`) in `config.js` is already structured for that.

## Project structure

```text
linkhub/
├── index.html    # Page shell — all content is rendered by app.js
├── styles.css    # Premium dark theme, mobile-first, responsive
├── config.js     # ← Defaults + server store config (APP_CONFIG)
├── store.js      # KVStore: PUT/GET/DELETE against KVdb or apiBase
├── app.js        # Rendering, server profile load, PIN edit mode, click tracking, demo checkout modal
├── test-store.js # Node tests against a local mock KVdb server (see TEST-LOG.md)
├── TEST-LOG.md   # Test results
├── README.md     # This file
├── LICENSE       # MIT
└── .gitignore
```

## Privacy

Click counts are stored on the server (in the public profile document) so the total is the same on every device — that is the point of the page. No visitor is identified: no cookies, no analytics, no personal data is collected. The owner PIN is never stored — only its SHA-256 hash, inside the profile document. The bucket id in `config.js` is a random identifier, not a secret.

## License

MIT — see [LICENSE](LICENSE). Copyright © 2026 Mr. Abdul Rahman Dogar.
