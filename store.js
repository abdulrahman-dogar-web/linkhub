/* ============================================================
   KVStore — shared key-value data layer
   ------------------------------------------------------------
   One store for KVdb (hosted, CORS open) and for the self-hosted
   backend (same semantics, /v1/kv/:key). The app picks the backend
   with one config value: when `apiBase` is empty it talks to KVdb
   directly; when set, it talks to that base URL instead.

   Usage (plain <script>, no modules):
     KVStore.configure({ bucket: "...", prefix: "lh:", apiBase: "" });
     await KVStore.put("profile", { ... });   // -> true/false
     await KVStore.get("profile");            // -> value or null
     await KVStore.del("profile");            // -> true/false

   Rules: PUT uses Content-Type "text/plain" against KVdb (avoids a
   CORS preflight); body is always a JSON string. GET 200 -> parsed
   JSON, 404 -> null. put/del never throw on 4xx — they return false.
   Keys are encodeURIComponent'd; the prefix is prepended raw.
   © 2026 Mr. Abdul Rahman Dogar
   ============================================================ */
(function (root) {
  "use strict";

  var cfg = { bucket: "", prefix: "", apiBase: "" };

  function configure(opts) {
    opts = opts || {};
    if (typeof opts.bucket === "string") cfg.bucket = opts.bucket;
    if (typeof opts.prefix === "string") cfg.prefix = opts.prefix;
    if (typeof opts.apiBase === "string") cfg.apiBase = opts.apiBase;
    return { bucket: cfg.bucket, prefix: cfg.prefix, apiBase: cfg.apiBase };
  }

  function urlFor(key) {
    var k = cfg.prefix + encodeURIComponent(String(key));
    if (cfg.apiBase) return cfg.apiBase.replace(/\/+$/, "") + "/v1/kv/" + k;
    return "https://kvdb.io/" + cfg.bucket + "/" + k;
  }

  async function put(key, value) {
    try {
      var isApi = !!cfg.apiBase;
      var res = await fetch(urlFor(key), {
        method: "PUT",
        headers: { "Content-Type": isApi ? "application/json" : "text/plain" },
        body: JSON.stringify(value)
      });
      return !!res.ok;
    } catch (e) {
      return false;
    }
  }

  async function get(key) {
    try {
      var res = await fetch(urlFor(key), { method: "GET" });
      if (res.status === 404) return null;
      if (!res.ok) return null;
      var text = await res.text();
      if (text === "" || text === null) return null;
      try { return JSON.parse(text); } catch (e) { return text; }
    } catch (e) {
      return null;
    }
  }

  async function del(key) {
    try {
      var res = await fetch(urlFor(key), { method: "DELETE" });
      return !!res.ok;
    } catch (e) {
      return false;
    }
  }

  var KVStore = { configure: configure, put: put, get: get, del: del, _urlFor: urlFor };

  root.KVStore = KVStore;
  if (typeof module !== "undefined" && module.exports) module.exports = KVStore;
})(typeof window !== "undefined" ? window : globalThis);
