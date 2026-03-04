# [redacted project name] (GN)

## Overview
Standalone browser-based Web3 resilience layer and mission control dashboard. Open-source tools for communities resisting surveillance and censorship. Built with vanilla HTML/CSS/JS (no build step). Tagline: "THE FUTURE IS DISTRIBUTED"

## Stack
- **Languages**: HTML, CSS, JavaScript (vanilla only — no npm, no webpack)
- **Libraries (CDN)**: D3.js v7, Gun.js (P2P), OpenTimestamps (via server proxy)
- **Fonts**: Open Sans (body/UI), Special Elite (logo only), Courier Prime (hash/code displays)
- **Server**: `python3 server.py` (static files + OTS/IPFS API proxy)

## Project Layout
```
index.html               - Mission Control landing page, network stats, tool cards
guardian-globe.html      - D3 globe, IPFS + LoRa mesh node visualization (live via Gun.js)
witness.html             - Bitcoin OTS timestamping ceremony (LIVE)
chat.html                - P2P chatroom, AOL retro skin, Gun.js mesh
chain.html               - Dead Man's Chain succession relay (LIVE P2P)
circuit.html             - LoRa/mesh hardware schematic designer
onboard.html             - GN Quests (gamified onboarding with threat models)
manage.html              - Admin panel, registry, quest editor
pin.html                 - IPFS pinning operation (LIVE via Pinata)
roadmap.html             - Project roadmap
server.py                - Python HTTP server with OTS proxy + Pinata pin proxy
js/gameplay.js           - GN_GAME module (XP, ranks, achievements, profile export/import)
js/particles.js          - GN_FX canvas particle effects (xp, achievement, mission, seal, levelUp, export)
js/nav.js                - mddNav.open()/close(), swipe-to-close, backdrop click handler
js/nostr.js              - GN_NOSTR module (relay connections, keypair mgmt, event pub/sub)
styles.css               - Shared CSS (gn- class prefix)
config.json              - Site configuration
data/missions.json       - Archive mission data
data/guardian_registry.json - Node registry (static, merged with live Gun.js data on globe)
```

## Branding Rules
- CSS class prefix: `gn-` (not `gn-`)
- All body text: Open Sans font
- Logo text only: Special Elite font (class `font-logo`)
- Hash/code displays: Courier Prime
- No "Guardian Net" or "GuardianNet" in user-facing text — use "GN" or "[redacted project name]"
- External site: https://[redacted-private-deployment-url]/mission-control

## Gameplay System
- Module: `GN_GAME` in `js/gameplay.js`
- Init: `GN_GAME.init(gunInstance)` — pass Gun instance or null
- 6 ranks: RECRUIT → WATCHER → OPERATOR → SENTINEL → COMMANDER → VANGUARD (gameplay.js)
- Onboard ranks: OBSERVER → ARCHIVIST → DEFENDER → SENTINEL → NODE OPERATOR → MESH PIONEER (onboard.html)
- 17 achievements including Vault Keeper (export) and Phoenix (import)
- Profile stored in localStorage — privacy-first, no server collection
- Export/import gamified with XP rewards to encourage backups
- Public leaderboard synced via Gun.js namespace `gn-gameplay-v1`

## Protocol Status
- Gun.js: LIVE (P2P sync via relay servers)
- IPFS: LIVE (real CIDs, gateway verification, Pinata pinning via /api/ipfs/pin)
- OpenTimestamps: LIVE (via server proxy at /api/ots/stamp, /api/ots/verify)
- Nostr: LIVE (relay connections via js/nostr.js, keypair in localStorage, #gn-v2 channel)
- LoRa: EDUCATIONAL (design tools, no hardware connected)

## Registry Data
- File: `data/guardian_registry.json`
- Tier values: "sentinel" (3 nodes) and "member" (10 nodes) — no "guardian" tier
- Metadata keys: `total_members`, `active_members`, `away_members`, `dark_members`
- Manage page tier display: `String(n.tier).toUpperCase()` — shows "SENTINEL" or "MEMBER"
- Add member form uses dropdown with "member"/"sentinel" options

## Server API Endpoints
- `POST /api/ots/stamp` — Submit hash to OTS calendars
- `GET /api/ots/stamp/<hash>` — Retrieve timestamp
- `POST /api/ots/verify` — Verify hash against calendars
- `GET /api/ipfs/check?cid=` — Check CID availability across gateways
- `POST /api/ipfs/pin` — Pin CID via Pinata API (requires PINATA_API_KEY env var)
- `GET /api/ipfs/pin-status?cid=` — Check Pinata pin job status

## Environment Variables
- `PINATA_API_KEY` — Pinata API key for IPFS pinning (stored as shared env var)

## Running the Project
- Workflow: `python3 server.py`
- Server runs on port 5000

## Deployment
- Configured as a static site (publicDir: ".")
- No build step needed
