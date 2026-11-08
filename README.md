# LinkHub

A premium link-in-bio page with a mini digital store — for **Abdul Rahman Dogar**.

One page, zero build step, zero backend. Open `index.html` and it works.

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
- **Click tracking** — total, link and store clicks are counted in `localStorage` (`linkhub_clicks_v1`) and shown in the stats strip. Counted in the visitor's browser only; nothing is sent to any server.
- **Premium dark design** — mobile-first, responsive (products go 2-up on wider screens), accessible (keyboard-focusable cards, `aria-label`s, Escape closes the modal, reduced-motion support), and fully self-contained — no external fonts, images or CDN requests.

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

**Edit only `config.js`.** Everything on the page is rendered from it — you never need to touch `index.html`, `styles.css` or `app.js`.

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
├── config.js     # ← Edit this file to customise everything
├── app.js        # Rendering, click tracking (localStorage), demo checkout modal
├── README.md     # This file
├── LICENSE       # MIT
└── .gitignore
```

## Privacy

Click counts live only in the visitor's own browser (`localStorage`). LinkHub makes no network requests, sets no cookies and sends no analytics anywhere.

## License

MIT — see [LICENSE](LICENSE). Copyright © 2026 Mr. Abdul Rahman Dogar.
