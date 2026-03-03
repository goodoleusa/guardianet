# Guardian Net

## Overview
Standalone Web3 resilience layer — a decentralized censorship-resistant evidence network. Works with any IPFS-pinned site. No build step required. Pure vanilla HTML/CSS/JS.

## Stack
- **Languages**: HTML, CSS, JavaScript (vanilla only — no npm, no webpack)
- **Libraries (CDN)**: D3.js v7, Nostr-tools, Gun.js
- **Fonts**: Share Tech Mono (Google Fonts)
- **No backend** — everything runs in the browser

## Project Layout
```
index.html               - Landing page, network stats
guardian-globe.html      - D3 globe, IPFS + LoRa nodes (planned)
witness.html             - Bitcoin OTS ceremony
chat.html                - P2P chatroom, AOL skin, Gun.js
chain.html               - Dead Man's Switch relay UI (planned)
config.json              - Site configuration
data/guardian_registry.json - Node registry
```

## Running the Project
- Served with Python's built-in HTTP server on port 5000
- Workflow: `python3 -m http.server 5000 --bind 0.0.0.0`

## Deployment
- Configured as a static site (publicDir: ".")
- No build step needed
