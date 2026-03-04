# [redacted project name] (GN)

## Overview
Standalone browser-based Web3 resilience layer and mission control dashboard. Open-source tools for communities resisting surveillance and censorship. Built with vanilla HTML/CSS/JS (no build step). Tagline: "THE FUTURE IS DISTRIBUTED"

## Stack
- **Languages**: HTML, CSS, JavaScript (vanilla only — no npm, no webpack)
- **Libraries (CDN)**: D3.js v7, Gun.js (P2P), OpenTimestamps (via server proxy)
- **Fonts**: Open Sans (body/UI), Special Elite (logo only), Courier Prime (hash/code displays)
- **Server**: `python3 server.py` (static files + OTS API proxy)

## Project Layout
```
index.html               - Mission Control landing page, network stats, tool cards
guardian-globe.html      - D3 globe, IPFS + LoRa mesh node visualization
witness.html             - Bitcoin OTS timestamping ceremony (LIVE)
chat.html                - P2P chatroom, AOL retro skin, Gun.js mesh
chain.html               - Dead Man's Chain succession relay
circuit.html             - LoRa/mesh hardware schematic designer
onboard.html             - GN Quests (gamified onboarding with threat models)
manage.html              - Admin panel, registry, quest editor
pin.html                 - IPFS pinning operation
roadmap.html             - Project roadmap
server.py                - Python HTTP server with OTS proxy endpoints
js/gameplay.js           - GN_GAME module (XP, ranks, achievements, profile export/import)
styles.css               - Shared CSS (gn- class prefix)
config.json              - Site configuration
data/missions.json       - Archive mission data
data/guardian_registry.json - Node registry
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
- 6 ranks: RECRUIT → WATCHER → OPERATOR → SENTINEL → COMMANDER → VANGUARD
- 17 achievements including Vault Keeper (export) and Phoenix (import)
- Profile stored in localStorage — privacy-first, no server collection
- Export/import gamified with XP rewards to encourage backups
- Public leaderboard synced via Gun.js namespace `gn-gameplay-v1`

## Protocol Status
- Gun.js: LIVE (P2P sync)
- IPFS: HYBRID (real CIDs, gateway verification, no live pinning API)
- OpenTimestamps: LIVE (via server proxy at /api/ots/stamp, /api/ots/verify)
- Nostr: INACTIVE (config only)
- LoRa: EDUCATIONAL (design tools, no hardware connected)

## Running the Project
- Workflow: `python3 -m http.server 5000 --bind 0.0.0.0`
- For OTS proxy: `python3 server.py`

## Deployment
- Configured as a static site (publicDir: ".")
- No build step needed
