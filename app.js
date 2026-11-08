/* ============================================================
   LinkHub — app logic
   Renders everything from config.js. No edits needed here.
   Click tracking is stored locally in the browser only
   (localStorage key: "linkhub_clicks_v1") — nothing is sent
   to any server.
   ============================================================ */
(function () {
  "use strict";

  var config = window.LINKHUB_CONFIG;
  if (!config) {
    document.body.innerHTML =
      "<p style='padding:40px;text-align:center;font-family:sans-serif'>" +
      "LinkHub could not load: config.js is missing or failed to load." +
      "</p>";
    return;
  }

  /* ---------- Icons (inline SVG, no external requests) ---------- */
  var ICONS = {
    github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41Z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16ZM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.7 21.31.27 16.95.07 15.67.01 15.26 0 12 0Zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84Zm0 10.15A3.99 3.99 0 1 1 16 12a3.99 3.99 0 0 1-4 4.01Zm6.41-11.85a1.44 1.44 0 1 0 1.43 1.44 1.44 1.44 0 0 0-1.43-1.44Z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 2.06-2.06 2.06 2.06 0 0 1-2.06 2.06ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0Z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z"/></svg>',
    telegram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11.94 0A12 12 0 1 0 24 12 12 12 0 0 0 11.94 0Zm4.89 8.17-1.97 9.3c-.15.65-.54.8-1.09.5l-3.02-2.22-1.45 1.39c-.16.16-.3.3-.6.3l.21-3.05 5.55-5.01c.24-.21-.05-.33-.37-.12L7.23 13.2l-2.95-.92c-.64-.2-.65-.64.13-.95l11.54-4.45c.53-.2 1 .13.88 1.29Z"/></svg>',
    globe: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm7.93 8h-3.1a15.6 15.6 0 0 0-1.18-3.7A10 10 0 0 1 19.93 8ZM12 2.07c.83 1.1 1.63 2.95 1.9 5.93H10.1C10.37 5.02 11.17 3.17 12 2.07ZM8.35 4.3A15.6 15.6 0 0 0 7.17 8H4.07a10 10 0 0 1 4.28-3.7ZM4.07 16h3.1c.25 1.45.65 2.72 1.18 3.7A10 10 0 0 1 4.07 16ZM12 21.93c-.83-1.1-1.63-2.95-1.9-5.93h3.8c-.27 2.98-1.07 4.83-1.9 5.93Zm3.65-2.23c.53-.98.93-2.25 1.18-3.7h3.1a10 10 0 0 1-4.28 3.7ZM2.05 10h4.36c-.05.66-.08 1.32-.08 2s.03 1.34.08 2H2.05a10 10 0 0 1 0-4Zm6.18 2c0-.68.03-1.34.08-2h7.38c.05.66.08 1.32.08 2s-.03 1.34-.08 2H8.31c-.05-.66-.08-1.32-.08-2Zm9.36 4h4.36a10 10 0 0 1 0-4h-4.36c.05.66.08 1.32.08 2s-.03 1.34-.08 2Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 13.5 1.5 5.4v13.1c0 .83.67 1.5 1.5 1.5h18c.83 0 1.5-.67 1.5-1.5V5.4L12 13.5ZM12 11.6 21.3 4H2.7L12 11.6Z"/></svg>',
    chart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3v18h18v-2H5V3H3Zm4 14V9h2v8H7Zm5 0V5h2v12h-2Zm5 0v-6h2v6h-2Z"/></svg>',
    journal: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 1.5h12A2.5 2.5 0 0 1 20.5 4v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V3.5A2 2 0 0 1 6 1.5ZM6 3.5v17h11.5a.5.5 0 0 0 .5-.5V4A.5.5 0 0 0 17.5 3.5H6Zm3 4h6v2H9V7.5Zm0 4h6v2H9v-2Zm0 4h4v2H9v-2Z"/></svg>',
    store: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 6.5 19.6 3.6A1 1 0 0 0 18.7 3H5.3a1 1 0 0 0-.9.6L3 6.5H1v2h2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-11h2v-2h-2ZM5.9 5h12.2l.7 1.5H5.2l.7-1.5ZM19 19.5H5v-11h14v11ZM10 10v6H8v-6h2Zm6 0v6h-2v-6h2Z"/></svg>'
  };

  function icon(name) { return ICONS[name] || ICONS.globe; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function money(n) { return "$" + Number(n).toFixed(2).replace(/\.00$/, ""); }

  /* ---------- Click tracking (localStorage only) ---------- */
  var STORE_KEY = "linkhub_clicks_v1";
  var clicks = { total: 0, links: {}, products: {} };
  try {
    var saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (saved && typeof saved.total === "number") clicks = saved;
  } catch (e) { /* corrupted storage: start fresh */ }

  function saveClicks() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(clicks)); } catch (e) { /* storage full/blocked */ }
  }
  function track(kind, id) {
    clicks.total += 1;
    clicks[kind] = clicks[kind] || {};
    clicks[kind][id] = (clicks[kind][id] || 0) + 1;
    saveClicks();
    renderStats();
  }

  /* ---------- Render: profile ---------- */
  var p = config.profile;
  document.getElementById("avatar").innerHTML = p.avatarImage
    ? '<img src="' + esc(p.avatarImage) + '" alt="' + esc(p.name) + '">'
    : esc(p.initials || p.name.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase());
  document.getElementById("profile-name").textContent = p.name;
  document.getElementById("profile-username").textContent = p.username || "";
  document.getElementById("profile-bio").textContent = p.bio;
  document.getElementById("profile-tagline").textContent = p.tagline || "";
  document.getElementById("profile-location").textContent = p.location ? "📍 " + p.location : "";
  var avail = document.getElementById("availability");
  if (p.availableForWork) {
    avail.style.display = "inline-flex";
    avail.querySelector("span:last-child").textContent = p.availableText || "Available for work";
  } else {
    avail.style.display = "none";
  }
  document.title = p.name + " — Links & Digital Store";

  /* ---------- Render: socials ---------- */
  document.getElementById("socials").innerHTML = config.socials.map(function (s) {
    return '<a class="social-btn" href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer" ' +
      'aria-label="' + esc(s.label) + " — " + esc(s.handle || s.url) + '" title="' + esc(s.label) + '" ' +
      'data-track="social" data-id="' + esc(s.label) + '">' + icon(s.icon) + "</a>";
  }).join("");

  /* ---------- Render: featured links ---------- */
  document.getElementById("links").innerHTML = config.links.map(function (l) {
    var badge = l.badge ? '<span class="link-badge">' + esc(l.badge) + "</span>" : "";
    var external = /^https?:/.test(l.url);
    return '<a class="link-card" href="' + esc(l.url) + '"' +
      (external ? ' target="_blank" rel="noopener noreferrer"' : "") +
      ' data-track="link" data-id="' + esc(l.title) + '">' +
      '<span class="link-icon">' + icon(l.icon) + "</span>" +
      '<span class="link-text"><strong>' + esc(l.title) + "</strong>" +
      (l.subtitle ? "<small>" + esc(l.subtitle) + "</small>" : "") + "</span>" +
      badge + '<span class="link-arrow" aria-hidden="true">›</span></a>';
  }).join("");

  /* ---------- Render: store ---------- */
  document.getElementById("store-heading").textContent = config.store.heading;
  document.getElementById("store-subheading").textContent = config.store.subheading;
  document.getElementById("secure-note").textContent =
    "🔒 " + config.store.checkoutNote;
  document.getElementById("products").innerHTML = config.store.products.map(function (prod) {
    var was = prod.originalPrice && prod.originalPrice > prod.price
      ? "<s>" + money(prod.originalPrice) + "</s>" : "";
    var tag = prod.tag ? '<span class="product-tag">' + esc(prod.tag) + "</span>" : "";
    var includes = (prod.includes || []).map(function (item) {
      return "<li>" + esc(item) + "</li>";
    }).join("");
    return '<article class="product">' +
      '<div class="product-top"><span class="product-emoji" aria-hidden="true">' + esc(prod.emoji || "📦") + "</span>" + tag + "</div>" +
      "<h3>" + esc(prod.name) + "</h3>" +
      '<p class="desc">' + esc(prod.description) + "</p>" +
      "<ul>" + includes + "</ul>" +
      '<p class="product-format">' + esc(prod.format || "") + "</p>" +
      '<div class="product-buy"><span class="price">' + money(prod.price) + was + "</span>" +
      '<button class="btn" type="button" data-buy="' + esc(prod.id) + '">Buy now</button></div>' +
      "</article>";
  }).join("");

  /* ---------- Render: footer ---------- */
  document.getElementById("footer").innerHTML =
    "© " + esc(config.footer.year) + " " + esc(config.footer.copyrightName) +
    " · " + esc(config.footer.text) +
    ' · <a href="https://github.com/abdulrahman-dogar-web" target="_blank" rel="noopener noreferrer">GitHub</a>';

  /* ---------- Stats strip ---------- */
  function renderStats() {
    var totalEl = document.getElementById("stat-total");
    var linkEl = document.getElementById("stat-links");
    var storeEl = document.getElementById("stat-store");
    if (totalEl) totalEl.textContent = clicks.total;
    if (linkEl) {
      linkEl.textContent = Object.keys(clicks.links || {}).reduce(function (a, k) { return a + clicks.links[k]; }, 0) +
        Object.keys(clicks.socials || {}).reduce(function (a, k) { return a + clicks.socials[k]; }, 0);
    }
    if (storeEl) {
      storeEl.textContent = Object.keys(clicks.products || {}).reduce(function (a, k) { return a + clicks.products[k]; }, 0);
    }
  }
  renderStats();

  /* ---------- Click tracking: delegate on the whole page ---------- */
  document.addEventListener("click", function (e) {
    var tracked = e.target.closest("[data-track]");
    if (tracked) {
      var kind = tracked.getAttribute("data-track") === "social" ? "socials" : "links";
      track(kind, tracked.getAttribute("data-id"));
      return;
    }
    var buyBtn = e.target.closest("[data-buy]");
    if (buyBtn) {
      var id = buyBtn.getAttribute("data-buy");
      var prod = config.store.products.find(function (x) { return x.id === id; });
      if (prod) { track("products", prod.name); openCheckout(prod); }
    }
  });

  /* ---------- Demo checkout modal ---------- */
  var backdrop = document.getElementById("modal-backdrop");
  var modalProduct = document.getElementById("modal-product");
  var modalPrice = document.getElementById("modal-price");
  var modalNote = document.getElementById("modal-note");
  var toast = document.getElementById("toast");
  var toastTimer = null;

  function openCheckout(prod) {
    modalProduct.textContent = prod.name + " — " + (prod.format || "Instant download");
    modalPrice.textContent = money(prod.price) + " " + (config.store.currency || "USD");
    modalNote.innerHTML = "<strong>Demo checkout.</strong> " + esc(config.store.checkoutNote) +
      "<br><br>No card details are asked for, no payment is taken, and no order is placed.";
    backdrop.classList.add("open");
    backdrop.setAttribute("aria-hidden", "false");
    document.getElementById("modal-close").focus();
  }
  function closeCheckout() {
    backdrop.classList.remove("open");
    backdrop.setAttribute("aria-hidden", "true");
  }
  document.getElementById("modal-close").addEventListener("click", closeCheckout);
  document.getElementById("modal-gotit").addEventListener("click", function () {
    closeCheckout();
    showToast("Demo only — no order was placed.");
  });
  backdrop.addEventListener("click", function (e) { if (e.target === backdrop) closeCheckout(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeCheckout(); });

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 3200);
  }
})();
