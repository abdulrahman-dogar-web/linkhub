# LinkHub — TEST-LOG

Date: 2026-11-08. Tester: node test scripts only (no browser in this session).
Method: `node --check` on every JS file, then `node test-store.js`.
The tests run against a local mock KVdb server (`/tmp/mock-kvdb.js`, Node http,
in-memory, same PUT/GET/DELETE paths as KVdb and as the self-hosted backend
`GET/PUT/DELETE /v1/kv/:key`). The mock runs as a separate process so the
"fresh process" check is a genuinely separate `node` invocation. Live KVdb
was NOT tested — the KVdb account still needs email verification (parent
handles that); the mock verifies the exact URL shapes, headers and
read-modify-write flows the live code will use.

## Syntax
- `node --check store.js` — PASS
- `node --check app.js` — PASS
- `node --check config.js` — PASS

## `node test-store.js` — 20/20 PASS
| # | Check | Result |
|---|---|---|
| 1 | Profile doc built from config (ownerName/bio/links/store/clicks/pinHash) | PASS |
| 2 | GET missing key returns null | PASS |
| 3 | KVdb PUT returns true | PASS |
| 4 | KVdb PUT uses Content-Type text/plain | PASS |
| 5 | KVdb PUT path is /{bucket}/{prefix}{key} (`/E1Ca9VeHqAZoPyRb54aTTv/lh:profile`) | PASS |
| 6 | KVdb GET round-trips the profile doc (incl. verified GitHub URL) | PASS |
| 7 | sha256Hex matches node crypto SHA-256 | PASS |
| 8 | Profile doc stores only the hash, never the PIN (no `1234` in the doc) | PASS |
| 9 | PUT profile with PIN returns true | PASS |
| 10 | Fresh process loads the saved profile (ownerName + bio + pinHash) | PASS |
| 11 | Correct PIN verifies | PASS |
| 12 | Wrong PIN does not verify | PASS |
| 13 | Wrong-PIN edit sends no PUT, stored doc unchanged (PUTs 2/2) | PASS |
| 14 | Click increments to 1 (total + per-link) | PASS |
| 15 | Second click increments to 2, store click counted separately (total 3) | PASS |
| 16 | apiBase PUT returns true | PASS |
| 17 | apiBase PUT uses Content-Type application/json and /v1/kv/ path | PASS |
| 18 | apiBase GET sees the same doc as the KVdb path | PASS |
| 19 | PUT then DELETE round-trip | PASS |
| 20 | DELETE missing key returns false (no throw) | PASS |

## Not tested here (needs a browser / live KVdb)
- The Edit modal UI, PIN entry fields and status line rendering in a real
  browser (DOM ids referenced by app.js were verified to exist in
  index.html: 42 ids, 0 missing).
- Live KVdb PUT/GET (blocked on the account's email verification).
- Two visitors clicking at the same instant (read-modify-write race is
  documented as acceptable in app.js and README.md).

© 2026 Mr. Abdul Rahman Dogar
