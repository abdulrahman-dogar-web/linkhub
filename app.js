/* ============================================================
   LinkHub — app logic
   Renders from config.js by default, but the live page comes from
   the server: one profile document (key "profile") in KVdb (or the
   self-hosted backend — see store.js / APP_CONFIG in config.js).

   Profile document shape:
     { ownerName, username, bio, tagline, location, avatarImage,
       availableForWork, availableText,
       socials: [{ label, handle, url, icon }],
       links:   [{ label, title, subtitle, url, icon, badge }],
       store:   [{ id, title, price, originalPrice, url, tag, emoji,
                  description, includes, format }],
       clicks:  { total, links: {}, socials: {}, products: {} },
       pinHash, updatedAt }

   - First visit: if no profile exists on the server, the defaults
     from config.js are shown and NOTHING is seeded server-side
     until the owner saves once in Edit mode.
   - Edit mode: the first save sets an owner PIN — only its SHA-256
     hash is stored (pinHash), never the PIN itself. Later edits
     require the PIN; a wrong PIN cannot save (no PUT is sent).
   - Click tracking: clicks update the stats strip immediately and
     are also written to the server document (read-modify-write,
     fire-and-forget; two visitors clicking at the same instant can
     lose one increment — races are acceptable here).
   - If the server cannot be reached, the page keeps working from
     the config defaults and says so honestly in the status line.
   © 2026 Mr. Abdul Rahman Dogar
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Pure helpers (DOM-free; also exported for node tests) ---------- */
  async function sha256Hex(str) {
    var subtle = globalThis.crypto && globalThis.crypto.subtle;
    if (!subtle) throw new Error("PIN hashing needs a secure context (https or localhost).");
    var buf = await subtle.digest("SHA-256", new TextEncoder().encode(String(str)));
    return Array.from(new Uint8Array(buf)).map(function (b) {
      return b.toString(16).padStart(2, "0");
    }).join("");
  }
  async function verifyPin(pin, hash) {
    if (!hash) return false;
    try { return (await sha256Hex(pin)) === hash; } catch (e) { return false; }
  }
  function profileFromConfig(cfg) {
    var p = cfg.profile || {};
    return {
      ownerName: p.name || "",
      username: p.username || "",
      bio: p.bio || "",
      tagline: p.tagline || "",
      location: p.location || "",
      avatarImage: p.avatarImage || "",
      availableForWork: !!p.availableForWork,
      availableText: p.availableText || "",
      socials: (cfg.socials || []).map(function (s) {
        return { label: s.label, handle: s.handle || "", url: s.url, icon: s.icon || "globe" };
      }),
      links: (cfg.links || []).map(function (l) {
        return { label: l.title, title: l.title, subtitle: l.subtitle || "", url: l.url, icon: l.icon || "globe", badge: l.badge || "" };
      }),
      store: ((cfg.store && cfg.store.products) || []).map(function (pr) {
        return { id: pr.id, title: pr.name, price: pr.price, originalPrice: pr.originalPrice || 0, url: "", tag: pr.tag || "", emoji: pr.emoji || "", description: pr.description || "", includes: pr.includes || [], format: pr.format || "" };
      }),
      clicks: { total: 0, links: {}, socials: {}, products: {} },
      pinHash: "",
      updatedAt: ""
    };
  }
  function applyClickToProfile(doc, kind, id) {
    doc.clicks = doc.clicks || { total: 0, links: {}, socials: {}, products: {} };
    doc.clicks.total = (doc.clicks.total || 0) + 1;
    doc.clicks[kind] = doc.clicks[kind] || {};
    doc.clicks[kind][id] = (doc.clicks[kind][id] || 0) + 1;
    return doc;
  }
  // "Label | handle | url" lines -> [[...parts]] (empty lines skipped).
  function parsePipeLines(text) {
    return String(text || "").split(/\r?\n/).map(function (line) {
      return line.split("|").map(function (part) { return part.trim(); });
    }).filter(function (parts) { return parts.some(function (part) { return part !== ""; }); });
  }

  /* Node test entry-point: export the pure helpers and stop before
     any DOM work (there is no document in node). */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      sha256Hex: sha256Hex,
      verifyPin: verifyPin,
      profileFromConfig: profileFromConfig,
      applyClickToProfile: applyClickToProfile,
      parsePipeLines: parsePipeLines
    };
    return;
  }

  var config = window.LINKHUB_CONFIG;
  if (!config) {
    document.body.innerHTML =
      "<p style='padding:40px;text-align:center;font-family:sans-serif'>" +
      "LinkHub could not load: config.js is missing or failed to load." +
      "</p>";
    return;
  }

  var store = window.KVStore;
  if (store && window.APP_CONFIG) store.configure(window.APP_CONFIG);
  var PROFILE_KEY = "profile";

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
  function $(id) { return document.getElementById(id); }
  function iconForLabel(label) {
    var l = String(label || "").toLowerCase();
    if (l.indexOf("github") !== -1) return "github";
    if (l.indexOf("twitter") !== -1 || l === "x" || l.indexOf(" x ") !== -1) return "x";
    if (l.indexOf("instagram") !== -1) return "instagram";
    if (l.indexOf("linkedin") !== -1) return "linkedin";
    if (l.indexOf("youtube") !== -1) return "youtube";
    if (l.indexOf("telegram") !== -1) return "telegram";
    if (l.indexOf("mail") !== -1 || l.indexOf("email") !== -1) return "mail";
    return "globe";
  }

  /* ---------- State ---------- */
  var defaults = profileFromConfig(config);
  var current = JSON.parse(JSON.stringify(defaults)); // what is on screen
  var serverProfile = null;   // the document on the server, if any
  var unlocked = false;       // PIN verified this session only (never stored)

  /* Local click counts: fallback while no server profile exists, so the
     stats strip still works offline / before the first save. */
  var LOCAL_KEY = "linkhub_clicks_v1";
  var localClicks = { total: 0, links: {}, socials: {}, products: {} };
  try {
    var savedLocal = JSON.parse(localStorage.getItem(LOCAL_KEY) || "null");
    if (savedLocal && typeof savedLocal.total === "number") localClicks = savedLocal;
  } catch (e) { /* corrupted storage: start fresh */ }
  function saveLocalClicks() {
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(localClicks)); } catch (e) { /* storage full/blocked */ }
  }
  function effectiveClicks() {
    return (serverProfile && serverProfile.clicks) ? serverProfile.clicks : localClicks;
  }

  /* ---------- Status line ---------- */
  function setStatus(msg) {
    var el = $("server-status");
    if (el) el.textContent = msg;
  }

  /* ---------- Render ---------- */
  function renderProfile(doc) {
    var p = config.profile;
    var name = doc.ownerName || p.name;
    $("avatar").innerHTML = doc.avatarImage
      ? '<img src="' + esc(doc.avatarImage) + '" alt="' + esc(name) + '">'
      : esc((name || "").split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase() || "AD");
    $("profile-name").textContent = name;
    $("profile-username").textContent = doc.username || p.username || "";
    $("profile-bio").textContent = doc.bio || p.bio;
    $("profile-tagline").textContent = doc.tagline || p.tagline || "";
    $("profile-location").textContent = doc.location ? "📍 " + doc.location : (p.location ? "📍 " + p.location : "");
    var avail = $("availability");
    var showAvail = doc.availableForWork !== undefined ? doc.availableForWork : p.availableForWork;
    if (showAvail) {
      avail.style.display = "inline-flex";
      avail.querySelector("span:last-child").textContent = doc.availableText || p.availableText || "Available for work";
    } else {
      avail.style.display = "none";
    }
    document.title = name + " — Links & Digital Store";
  }
  function renderSocials(doc) {
    $("socials").innerHTML = (doc.socials || []).map(function (s) {
      return '<a class="social-btn" href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer" ' +
        'aria-label="' + esc(s.label) + " — " + esc(s.handle || s.url) + '" title="' + esc(s.label) + '" ' +
        'data-track="social" data-id="' + esc(s.label) + '">' + icon(s.icon) + "</a>";
    }).join("");
  }
  function renderLinks(doc) {
    $("links").innerHTML = (doc.links || []).map(function (l) {
      var badge = l.badge ? '<span class="link-badge">' + esc(l.badge) + "</span>" : "";
      var external = /^https?:/.test(l.url);
      return '<a class="link-card" href="' + esc(l.url) + '"' +
        (external ? ' target="_blank" rel="noopener noreferrer"' : "") +
        ' data-track="link" data-id="' + esc(l.label || l.title) + '">' +
        '<span class="link-icon">' + icon(l.icon) + "</span>" +
        '<span class="link-text"><strong>' + esc(l.label || l.title) + "</strong>" +
        (l.subtitle ? "<small>" + esc(l.subtitle) + "</small>" : "") + "</span>" +
        badge + '<span class="link-arrow" aria-hidden="true">›</span></a>';
    }).join("");
  }
  function renderStore(doc) {
    $("store-heading").textContent = config.store.heading;
    $("store-subheading").textContent = config.store.subheading;
    $("secure-note").textContent = "🔒 " + config.store.checkoutNote;
    $("products").innerHTML = (doc.store || []).map(function (prod) {
      var was = prod.originalPrice && prod.originalPrice > prod.price
        ? "<s>" + money(prod.originalPrice) + "</s>" : "";
      var tag = prod.tag ? '<span class="product-tag">' + esc(prod.tag) + "</span>" : "";
      var includes = (prod.includes || []).map(function (item) {
        return "<li>" + esc(item) + "</li>";
      }).join("");
      return '<article class="product">' +
        '<div class="product-top"><span class="product-emoji" aria-hidden="true">' + esc(prod.emoji || "📦") + "</span>" + tag + "</div>" +
        "<h3>" + esc(prod.title) + "</h3>" +
        '<p class="desc">' + esc(prod.description) + "</p>" +
        "<ul>" + includes + "</ul>" +
        '<p class="product-format">' + esc(prod.format || "") + "</p>" +
        '<div class="product-buy"><span class="price">' + money(prod.price) + was + "</span>" +
        '<button class="btn" type="button" data-buy="' + esc(prod.id) + '">Buy now</button></div>' +
        "</article>";
    }).join("");
  }
  function renderFooter() {
    $("footer").innerHTML =
      "© " + esc(config.footer.year) + " " + esc(config.footer.copyrightName) +
      " · " + esc(config.footer.text) +
      ' · <a href="https://github.com/abdulrahman-dogar-web" target="_blank" rel="noopener noreferrer">GitHub</a>';
  }
  function renderStats() {
    var clicks = effectiveClicks();
    var totalEl = $("stat-total"), linkEl = $("stat-links"), storeEl = $("stat-store");
    if (totalEl) totalEl.textContent = clicks.total || 0;
    if (linkEl) {
      linkEl.textContent =
        Object.keys(clicks.links || {}).reduce(function (a, k) { return a + clicks.links[k]; }, 0) +
        Object.keys(clicks.socials || {}).reduce(function (a, k) { return a + clicks.socials[k]; }, 0);
    }
    if (storeEl) {
      storeEl.textContent = Object.keys(clicks.products || {}).reduce(function (a, k) { return a + clicks.products[k]; }, 0);
    }
  }
  function renderAll() {
    renderProfile(current);
    renderSocials(current);
    renderLinks(current);
    renderStore(current);
    renderFooter();
    renderStats();
  }

  /* ---------- Load from the server ---------- */
  async function init() {
    renderAll();
    if (!store) { setStatus("Server store not loaded — showing defaults from this page."); return; }
    setStatus("Connecting to server…");
    var remote = await store.get(PROFILE_KEY);
    if (remote && remote.ownerName) {
      serverProfile = remote;
      current = remote;
      renderAll();
      setStatus("Loaded from server ✓" + (remote.updatedAt ? " · updated " + new Date(remote.updatedAt).toLocaleString() : "") + " · clicks are counted on the server.");
    } else {
      setStatus("Showing defaults — not saved to the server yet. Open ✏️ Edit page and save once to publish them.");
    }
  }

  /* ---------- Click tracking (local + server) ---------- */
  function track(kind, id) {
    applyClickToProfile(localClicks, kind, id);
    saveLocalClicks();
    if (serverProfile) applyClickToProfile(serverProfile, kind, id);
    renderStats();
    // Fire-and-forget server increment (read-modify-write; if two
    // visitors click at the same instant one increment can be lost).
    if (serverProfile && store) {
      store.get(PROFILE_KEY).then(function (latest) {
        if (!latest) return null;
        applyClickToProfile(latest, kind, id);
        return store.put(PROFILE_KEY, latest);
      }).then(function (ok) {
        if (ok === false) setStatus("Saved to server ✓ · click count could not be updated just now.");
      }).catch(function () { /* offline: local count already shown */ });
    }
  }

  /* ---------- Edit mode + owner PIN ---------- */
  var editBackdrop = $("edit-backdrop");
  function openEdit() {
    $("edit-name").value = current.ownerName || "";
    $("edit-bio").value = current.bio || "";
    $("edit-tagline").value = current.tagline || "";
    $("edit-location").value = current.location || "";
    $("edit-socials").value = (current.socials || []).map(function (s) {
      return [s.label, s.handle || "", s.url].join(" | ");
    }).join("\n");
    $("edit-links").value = (current.links || []).map(function (l) {
      return [l.label || l.title, l.subtitle || "", l.url].join(" | ");
    }).join("\n");
    $("edit-store").value = (current.store || []).map(function (pr) {
      return [pr.title, pr.price, pr.url || ""].join(" | ");
    }).join("\n");
    var hasPin = !!current.pinHash;
    $("edit-pin-row").style.display = (hasPin && !unlocked) ? "" : "none";
    $("edit-newpin-row").style.display = (!hasPin) ? "" : "none";
    $("edit-pin").value = "";
    $("edit-pin-new").value = "";
    $("edit-pin-confirm").value = "";
    setEditError("");
    editBackdrop.classList.add("open");
    editBackdrop.setAttribute("aria-hidden", "false");
    (hasPin && !unlocked ? $("edit-pin") : $("edit-name")).focus();
  }
  function closeEdit() {
    editBackdrop.classList.remove("open");
    editBackdrop.setAttribute("aria-hidden", "true");
  }
  function setEditError(msg) {
    var el = $("edit-error");
    if (el) el.textContent = msg || "";
  }
  function docFromForm() {
    var doc = JSON.parse(JSON.stringify(current));
    doc.ownerName = $("edit-name").value.trim();
    doc.bio = $("edit-bio").value.trim();
    doc.tagline = $("edit-tagline").value.trim();
    doc.location = $("edit-location").value.trim();
    doc.socials = parsePipeLines($("edit-socials").value).map(function (parts) {
      var prev = (current.socials || []).find(function (s) { return s.label === parts[0]; });
      return { label: parts[0] || "", handle: parts[1] || "", url: parts[2] || "", icon: prev ? prev.icon : iconForLabel(parts[0]) };
    });
    doc.links = parsePipeLines($("edit-links").value).map(function (parts) {
      var prev = (current.links || []).find(function (l) { return (l.label || l.title) === parts[0]; });
      return {
        label: parts[0] || "", title: parts[0] || "", subtitle: parts[1] || "", url: parts[2] || "",
        icon: prev ? prev.icon : "globe", badge: prev ? prev.badge : ""
      };
    });
    doc.store = parsePipeLines($("edit-store").value).map(function (parts) {
      var prev = (current.store || []).find(function (pr) { return pr.title === parts[0]; }) || {};
      return {
        id: prev.id || ("product-" + parts[0].toLowerCase().replace(/[^a-z0-9]+/g, "-")),
        title: parts[0] || "", price: Number(parts[1]) || prev.price || 0,
        originalPrice: prev.originalPrice || 0, url: parts[2] || prev.url || "",
        tag: prev.tag || "", emoji: prev.emoji || "📦",
        description: prev.description || "", includes: prev.includes || [], format: prev.format || ""
      };
    });
    return doc;
  }
  async function saveEdit() {
    setEditError("");
    if (!store) { setEditError("Server store not loaded — cannot save."); return; }
    var doc = docFromForm();
    if (!doc.ownerName) { setEditError("Please enter a name."); return; }
    try {
      if (current.pinHash) {
        if (!unlocked) {
          var pin = $("edit-pin").value;
          if (!pin) { setEditError("Enter the owner PIN to save changes."); return; }
          if (!(await verifyPin(pin, current.pinHash))) {
            setEditError("Wrong PIN — changes were not saved.");
            return; // no PUT is sent on a wrong PIN
          }
          unlocked = true;
        }
        doc.pinHash = current.pinHash;
      } else {
        var newPin = $("edit-pin-new").value;
        var confirmPin = $("edit-pin-confirm").value;
        if (!newPin || newPin.length < 4) { setEditError("Choose an owner PIN of at least 4 characters. Keep it safe — it is the only way to edit this page."); return; }
        if (newPin !== confirmPin) { setEditError("The two PINs do not match."); return; }
        doc.pinHash = await sha256Hex(newPin);
      }
    } catch (e) {
      setEditError("Could not check the PIN: " + e.message);
      return;
    }
    doc.updatedAt = new Date().toISOString();
    var ok = await store.put(PROFILE_KEY, doc);
    if (ok) {
      serverProfile = doc;
      current = doc;
      renderAll();
      setStatus("Saved to server ✓ · updated " + new Date(doc.updatedAt).toLocaleString());
      showToast("Saved to server ✓");
      closeEdit();
    } else {
      setStatus("Couldn't reach the server — changes were NOT saved.");
      setEditError("Couldn't reach the server — changes were NOT saved. Check your connection and try again.");
    }
  }

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
      var prod = current.store.find(function (x) { return x.id === id; })
        || config.store.products.find(function (x) { return x.id === id; });
      if (prod) { track("products", prod.title || prod.name); openCheckout(prod); }
    }
  });

  /* ---------- Demo checkout modal ---------- */
  var backdrop = $("modal-backdrop");
  var modalProduct = $("modal-product");
  var modalPrice = $("modal-price");
  var modalNote = $("modal-note");
  var toast = $("toast");
  var toastTimer = null;

  function openCheckout(prod) {
    var name = prod.title || prod.name;
    modalProduct.textContent = name + " — " + (prod.format || "Instant download");
    modalPrice.textContent = money(prod.price) + " " + (config.store.currency || "USD");
    modalNote.innerHTML = "<strong>Demo checkout.</strong> " + esc(config.store.checkoutNote) +
      "<br><br>No card details are asked for, no payment is taken, and no order is placed.";
    backdrop.classList.add("open");
    backdrop.setAttribute("aria-hidden", "false");
    $("modal-close").focus();
  }
  function closeCheckout() {
    backdrop.classList.remove("open");
    backdrop.setAttribute("aria-hidden", "true");
  }
  $("modal-close").addEventListener("click", closeCheckout);
  $("modal-gotit").addEventListener("click", function () {
    closeCheckout();
    showToast("Demo only — no order was placed.");
  });
  backdrop.addEventListener("click", function (e) { if (e.target === backdrop) closeCheckout(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeCheckout(); closeEdit(); } });

  /* ---------- Edit modal wiring ---------- */
  $("editBtn").addEventListener("click", openEdit);
  $("edit-cancel").addEventListener("click", closeEdit);
  $("edit-save").addEventListener("click", saveEdit);
  editBackdrop.addEventListener("click", function (e) { if (e.target === editBackdrop) closeEdit(); });

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 3200);
  }

  init();
})();
