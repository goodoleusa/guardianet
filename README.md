# GuardianNet × [redacted project name] — Technical Stack & Architecture Wiki

> Living document. Updated as the project evolves.
> Last updated: 2026-03-04

---

## Why This Exists

Political infrastructure decays before it's destroyed. Links die. Pages redirect. Archives get
"reorganized." The goal of this stack is to make critical information **mathematically permanent**
rather than depending on any server, company, or government staying cooperative.

The answer to "what if they turn it off?" should always be: **it doesn't matter. The math already ran.**

---

## The Three Problems This Stack Solves

### Problem 1: Single Points of Failure

Every centralized service is one subpoena, one shutdown, one 403 error away from disappearing.

**Solution: IPFS (InterPlanetary File System)**

IPFS replaces location-based addressing (`https://example.com/file.pdf`) with
content-based addressing (`ipfs://bafybei...`). The address is a cryptographic hash of the
file's contents — not of where the file lives.

This means:
- The same file has the **same address everywhere, forever**
- You cannot redirect the address to different content
- You cannot delete the content by taking down a server — as long as one node hosts it
- 200 people pinning the same CID = 200 independent mirrors, often across jurisdictions

**How CIDs work:**
```
File → SHA-256 hash → encoded as Base58/Base32 → CID
bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq

The CID IS the file. If one bit changes, the CID changes.
You cannot lie about what content a CID points to.
```

**Pinning hierarchy:**
```
Browser (temporary)          — views content, doesn't host
Pinning service (Pinata etc) — hosted by company, DMCA-able
Your IPFS node               — you control, your IP visible in DHT
IPFS Cluster                 — coordinated multi-node pinning
```

### Problem 2: Real-Time Censored Communication

Cell networks and internet infrastructure can be cut, throttled, or monitored at the ISP level.

**Solution: GUN.js (P2P Database) + LoRa Mesh (Physical Layer)**

**GUN.js** is a distributed, real-time, conflict-free replicated database (CRDT). Key properties:

- **No central server required** — peers sync directly; relay servers are optional accelerators
- **Every peer holds a full copy** — no single node to subpoena
- **CRDT (Conflict-free Replicated Data Type)** — uses HAM (Hypothetical Amnesia Machine) to resolve conflicts without coordination
- **Works offline** — syncs when peers reconnect
- **Sub-second convergence** — changes propagate across the network in milliseconds

```
Traditional DB:          GUN.js:
Client → Server         Peer ←→ Peer ←→ Peer
(one throat to choke)   (no center to attack)
```

**HAM (GUN's conflict resolution):**
```
Each update has: { soul, key, state, value }
When two peers have conflicting values:
  - Compare lexicographic state (vector clock equivalent)
  - Higher state wins
  - Ties broken deterministically
Result: all peers converge to identical state without coordination
```

**LoRa (Long Range Radio)** solves the physical layer problem — what to do when internet itself
is cut:
- 915 MHz (US) / 868 MHz (EU) unlicensed frequencies
- 10–40km range at low power
- $20–30 chip (SX1276/SX1278 + ESP32 microcontroller)
- **Meshtastic** firmware: open-source, encrypts content, auto-meshes
- Each node relays for every other node → coverage = sum of all nodes in range

**Why not just use Signal?**
Signal requires: internet, cell network, phone number, Apple/Google distribution. Any one of those
can be cut. LoRa + Meshtastic requires: radio spectrum (unlicensable at low power), a $30 device.

### Problem 3: Evidence Can Be Fabricated or Denied

"That document is fake." "We never published that." "The timestamp is wrong."

**Solution: Bitcoin OpenTimestamps (Cryptographic Proof of Prior Existence)**

**How OpenTimestamps works:**
```
1. You have a document: report.pdf
2. SHA-256 hash computed: 8a9b3c... (the document's fingerprint)
3. OpenTimestamps bundles thousands of hashes into a Merkle tree
4. The Merkle root is embedded in a Bitcoin transaction
5. Bitcoin mines a new block every ~10 minutes
6. The block is now part of an immutable, globally-replicated ledger
7. You receive a .ots receipt proving your hash existed before that block

Verification:
  receipt + original file → prove the file existed before block #X
  Block #X is in Bitcoin's chain = proven by cumulative computational work
  Cannot be faked without outspending all of Bitcoin's mining power
```

**Why Bitcoin specifically?**
- Longest-running, most-decentralized proof-of-work chain
- Block sequence cannot be reordered (would require >51% of global hashrate)
- Public, auditable, not controlled by any government
- The timestamp is only as strong as the chain's immutability — Bitcoin's is the strongest

**Cost:** Near-zero. OpenTimestamps aggregates thousands of hashes into one Bitcoin transaction,
sharing the ~$2–5 fee across all documents in the batch.

---

## The Application Stack

### guardian-net (Current: Vanilla HTML Tools)

**Philosophy:** Zero build step. Open directly in browser. Works on IPFS. No framework dependency.

```
guardian-net/
├── index.html          Landing / mission operations hub
├── onboard.html        Gamified quest system (localStorage XP + GUN leaderboard)
├── chat.html           P2P chat (GUN.js, AOL Instant Messenger aesthetic)
├── chain.html          Dead Man's Switch relay (GUN.js, 48h heartbeat)
├── witness.html        Bitcoin OpenTimestamps ceremony UI
├── circuit.html        Hardware circuit design lab (D3 drag-to-place + BOM)
├── pin.html            IPFS pinning wizard (free services + GUN pin registry)
├── manage.html         Admin panel (registry, CID vault, broadcast, quest editor)
├── guardian-globe.html D3 globe — IPFS/LoRa node visualization
├── roadmap.html        Project roadmap
└── data/
    ├── guardian_registry.json   Guardians registry
    └── guardian-pinset.json     IPFS cluster-compatible pinset config
```

**State management:** All localStorage. No server required. GUN.js syncs pseudonymous
leaderboard data to P2P network optionally.

**Why vanilla HTML?**
1. Can be hosted on IPFS (static files, no server)
2. No build step = lower attack surface, easier to audit
3. Works in any browser including Tor Browser
4. Zero dependency on npm supply chain

### [redacted-project-name] (React App on main)

**Philosophy:** Full-featured civic engagement dashboard. Deployable on Replit. Connects to
PostgreSQL for mission tracking. Rich UI with animations.

```
client/src/
├── App.tsx             Router + providers
├── pages/
│   ├── Landing.tsx         Typewriter intro, accept/reject mission
│   ├── MissionControl.tsx  6-category civic action dashboard
│   ├── DemocracyInDanger.tsx  Roman temple threat visualization
│   └── HowToDefendDemocracy.tsx  Defense action temple
├── components/
│   ├── MissionCard.tsx         Active/completed mission display
│   ├── CreateMissionDialog.tsx  Personal mission creation
│   ├── RomanTemple.tsx          SVG interactive temple
│   ├── CrtOverlay.tsx           Retro CRT effect
│   └── Typewriter.tsx           Animated typewriter text
├── hooks/
│   ├── use-missions.ts  TanStack Query API hooks
│   └── use-mobile.tsx   Responsive breakpoint hook
└── data/
    └── pillars/         Threat + defense pillar data
```

**Dependencies:** React 18, Tailwind CSS, Framer Motion, Radix UI, wouter, TanStack Query,
Express backend, Drizzle ORM (PostgreSQL optional).

---

## The Merge: Why We're Combining These

The two projects are philosophically identical but technically separate. Merging them:

1. **Single entry point** — MissionControl becomes the hub for both civic action (GN) and
   technical resistance tools (guardian-net)
2. **Shared infrastructure** — GUN.js as a React hook, used by Chat, Chain, Quests, Pin
3. **IPFS deployable** — with hash routing, the entire app can be pinned and served from IPFS
4. **Replit compatible** — Express server stays; GUN.js is client-side only

### Post-Merge Tech Stack

```
Layer           Technology              Purpose
─────────────────────────────────────────────────────────────────
Frontend        React 18 + Vite         SPA, fast builds
Routing         wouter (hash mode)      IPFS-compatible deep links
Styling         Tailwind + CSS vars     GN components + GN tools
Animation       Framer Motion           Intro sequences, transitions
State (server)  TanStack React Query    Mission tracking, API calls
State (P2P)     GUN.js CRDT             Chat, chain, quest sync
State (local)   localStorage            XP, codename, completed quests
P2P DB          GUN.js                  Decentralized real-time sync
IPFS            ipfs.io gateway + API   File pinning, CID verification
Bitcoin         OpenTimestamps          Document timestamping
Radio           LoRa/Meshtastic         Off-grid mesh (hardware layer)
Backend         Express 5               API, session, optional DB
Database        PostgreSQL (optional)   Mission persistence (Replit)
Deploy          Replit OR IPFS          Both work simultaneously
```

### IPFS Hosting Path

```bash
# Build static output
npm run build

# Optional: switch to hash routing for IPFS
# (already done if useHashLocation is configured in App.tsx)

# Add to IPFS
ipfs add -r dist/public/
# → outputs CID: bafybei...

# Pin with free services
# Storacha/web3.storage: 5GB free, Filecoin-backed
# nft.storage: Protocol Labs, free forever
# Pinata: 1GB free
# 4EVERLAND: free tier

# Anyone with the CID gets the full app
ipfs://bafybei.../  → full React app, no server needed
```

---

## GUN.js Deep Dive

### What Problem It Solves

Traditional databases require a server. If the server goes down, the data is unavailable.
If the server is seized, the data can be accessed by adversaries. If the server is located in
a hostile jurisdiction, it can be legally compelled to log user activity.

GUN.js distributes the database across every peer. There is no "the server" — there's just
a network of peers who each hold a copy of the relevant data.

### How It Works

**Data model:** Everything in GUN is a graph. Nodes have keys and values.

```javascript
gun.get('namespace').get('key').put({ value: 'hello' })
gun.get('namespace').get('key').on(data => console.log(data))
```

**Relay servers** (like `gun-manhattan.herokuapp.com`): Optional. They accelerate initial peer
discovery and act as always-on nodes. But they don't "own" the data — they're just peers that
happen to be always online. You can add your own relay or none at all.

**CRDT (HAM):** When two peers update the same key simultaneously:
```
Peer A: { key: 'status', value: 'online',  state: 1704067200 }
Peer B: { key: 'status', value: 'offline', state: 1704067201 }
Result: 'offline' wins (higher state number)
```
This is deterministic — both peers reach the same conclusion without coordination.

**Use cases in this stack:**
```
guardian-chat-v1/rooms/{room}/msgs     → P2P chat messages
guardian-chain-v1/nodes                → Dead man's switch heartbeats
guardian-quests-v1/leaderboard         → Pseudonymous XP leaderboard
guardian-circuit-lab-v1/{session}      → Collaborative circuit design
guardian-pins-v1/pins                  → IPFS pin registry
```

### Security Model

**What GUN is NOT:**
- Not end-to-end encrypted by default (use SEA — Security, Encryption, Authorization — add-on)
- Not anonymous — your IP is visible to relay peers and other peers you connect to
- Not a replacement for Signal for sensitive 1:1 communication

**What GUN IS:**
- Censorship-resistant — no single node can be "taken down" to remove data
- Resilient — works partially offline, syncs when reconnected
- Fast — sub-second propagation in normal conditions
- Energy-efficient — no consensus mechanism, no blockchain (near-zero energy)

**Energy comparison:**
```
Bitcoin PoW:         ~150 TWh/year
Ethereum PoS:        ~2.6 TWh/year
GUN.js relay network: ~0.001 TWh/year (estimated)
IPFS network:        ~0.01 TWh/year (estimated, no consensus)
```

### GUN vs. Alternatives

| Technology    | Type              | Consensus     | Energy  | Use case |
|---|---|---|---|---|
| GUN.js        | CRDT graph DB     | HAM (local)   | ~0      | Real-time P2P apps |
| IPFS          | Content addressing| None          | Low     | File storage, static hosting |
| OrbitDB       | IPFS + libp2p     | Append-only   | Low     | Event logs on IPFS |
| Hypercore     | Signed log        | None (single) | Low     | Append-only personal feeds |
| Nostr         | Signed events     | None          | Low     | Social media, messaging |
| Ceramic       | DID streams       | Optimistic    | Low     | Identity, mutable records |
| Ethereum      | Smart contracts   | PoS           | 2.6 TWh | Programmable money |
| Bitcoin       | Immutable ledger  | PoW           | 150 TWh | Value transfer, timestamping |

**Rule of thumb:**
- Need real-time sync → GUN.js
- Need permanent file → IPFS
- Need proof of prior existence → Bitcoin (OpenTimestamps)
- Need programmable logic → Ethereum (but consider the energy cost)

---

## Dead Man's Switch — How It Works

A dead man's switch is a mechanism that activates when someone *stops* doing something.
Originally: a train operator who must hold a lever — if they release it (die or become
incapacitated), the train stops automatically.

**In the context of information protection:**

```
Normal state:                         If guardian goes dark:
Guardian sends heartbeat q48h         No heartbeat for 48h
  → Chain stays intact                → Successor notified
  → Data stays private                → Succession event logged
                                      → Chain heals itself
```

**Why this matters:**
1. **Journalist protection:** Pre-publish evidence that releases automatically if the journalist
   is detained. The threat of release is itself protection.
2. **Succession planning:** Organizational knowledge and access doesn't die with one person.
3. **Network resilience:** The chain continues even if individual nodes are compromised.

**Implementation (GUN.js):**
```javascript
// Register in chain
gun.get('guardian-chain-v1').get('nodes').get(nodeId).put({
  name: codename, position: N, last_beat: Date.now()
})

// Send heartbeat
gun.get('guardian-chain-v1').get('nodes').get(nodeId)
  .get('last_beat').put(Date.now())

// Monitor chain (all subscribers watch for dark nodes)
gun.get('guardian-chain-v1').get('nodes').map().on((data, id) => {
  if (Date.now() - data.last_beat > 48 * 3600 * 1000) {
    triggerSuccession(id)
  }
})
```

---

## Circuit Lab — Hardware Design for Resistance

The Circuit Lab is a browser-based schematic designer for off-grid communication hardware.
Designs are exported as JSON and can be pinned to IPFS — giving hardware designs the same
permanence as documents.

**Key components in the Guardian Node design:**
```
ESP32        — Microcontroller. WiFi + BT. $5. Runs Meshtastic or custom firmware.
SX1276/78    — LoRa radio module. 915MHz (US). 10–40km range at 20dBm.
NEO-6M       — GPS module. Provides location for mesh routing.
TP4056       — Solar charge controller. Manages LiPo battery charging.
18650 LiPo   — Battery. ~3000mAh. Runs node for 24–72h without solar.
Solar panel  — 5V/1W minimum. Indefinite operation in daylight.
```

**Total BOM (Bill of Materials):**
```
Guardian Node (basic): ~$25–35
Guardian Node (solar): ~$50–70
Enclosure (Altoids/Hammond): $5–20
Total deployed solar node: ~$55–90
```

**IPFS for hardware:**
Hardware designs shared via IPFS have the same properties as documents:
- Immutable reference (CID = the exact schematic)
- Anyone can build from a CID
- Cannot be taken down by taking down a website
- A community of builders creates a distributed hardware library

---

## Deployment Targets

### Replit (Primary — always-on)
- Express server handles API routes + static file serving
- PostgreSQL available via Replit Database or external
- GUN.js relay can be self-hosted as an Express route: `gun.wsp(app)` (10 lines)
- Build: `npm run build` → `dist/public/` → served by Express

### IPFS (Resilient fallback)
- `npm run build` + hash routing enabled
- `ipfs add -r dist/public/` → CID
- Pin via Storacha (5GB free), nft.storage (free), Pinata (1GB free)
- App fully functional without any server — GUN.js connects to public relay peers
- No login, no sessions, no database (uses localStorage + GUN)

### Local (Development / air-gapped)
- `npm run dev` → Vite dev server on localhost:5000
- Can run completely offline after initial `npm install`
- guardian-net HTML files work by simply opening in browser

---

## Security & Privacy Considerations

### What is logged / visible
```
IPFS:       Which CIDs you request (your IP → gateway)
            Which CIDs your node hosts (your IP in DHT)
GUN.js:     Your IP to relay peers
            All messages/data you publish (public by default)
Bitcoin:    That a timestamp occurred (not the content)
LoRa:       That your device is transmitting (detectable by SDR)
            Your approximate location (triangulatable)
```

### Recommended layering for sensitive use
```
Highest risk (journalist, dissident):
  → Tor Browser + VPN + Signal for 1:1
  → IPFS through Tor for fetching sensitive content
  → LoRa with short transmit windows + location changes

Normal risk (activist, researcher):
  → GUN.js for community coordination
  → Signal for sensitive 1:1
  → IPFS for document permanence

Low risk (educator, archivist):
  → This entire stack as-is
  → Primary benefit: resilience, not anonymity
```

### What this stack does NOT protect against
- **Traffic analysis** at ISP level (use Tor)
- **Device seizure** (use full disk encryption)
- **Social engineering** (no technical solution)
- **Metadata analysis** (who you talk to, when) in GUN.js
- **Nation-state adversary with majority Bitcoin hashrate** (theoretical, extremely unlikely)

---

## Contributing / Extending

### Adding a new guardian-net tool
1. Create `toolname.html` in guardian-net/
2. Import GUN from CDN: `<script src="https://cdn.jsdelivr.net/npm/gun/gun.js"></script>`
3. Use namespace pattern: `gun.get('guardian-toolname-v1').get('...')`
4. Add to navigation in index.html header
5. Add route in manage.html if admin features needed

### Adding a new React page to GN
1. Create `client/src/pages/NewPage.tsx`
2. Add `<Route path="/new-page" component={NewPage} />` in App.tsx
3. Import and use `useGun()` hook for any P2P features
4. Add navigation tile in MissionControl.tsx guardian tools section

### Adding a new quest
1. Open `manage.html#quests` in admin panel
2. Click "+ New Quest", fill in all fields
3. Click "Export JS" → copy the generated `const QUESTS = ...` block
4. Paste into `onboard.html` (or `client/src/data/quests.ts` in React version)

---

## Glossary

| Term | Definition |
|---|---|
| CID | Content Identifier — the IPFS address (hash) of a file |
| CRDT | Conflict-free Replicated Data Type — a data structure that resolves concurrent edits without coordination |
| DHT | Distributed Hash Table — the peer discovery mechanism IPFS uses to find who hosts a CID |
| HAM | Hypothetical Amnesia Machine — GUN.js's CRDT conflict resolution algorithm |
| LoRa | Long Range — a radio modulation technique optimized for long range at low power |
| Meshtastic | Open-source mesh networking firmware for LoRa hardware |
| OpenTimestamps | Protocol for anchoring document hashes in Bitcoin blocks |
| Pinning | IPFS term for committing to host a specific CID on your node |
| Relay peer | GUN.js term for an always-on peer that accelerates network synchronization |
| SEA | Security, Encryption, Authorization — GUN.js's optional E2E encryption add-on |
| .ots | OpenTimestamps receipt file (proof that a hash was witnessed before a Bitcoin block) |




# Guardian Net

**A Web3 resilience layer for any IPFS-distributed site.**

Gamified IPFS pinning, Bitcoin timestamping, Nostr chatroom, and a Dead Man's Switch relay chain — all in static HTML/CSS/JS, no build step, works on any web server or IPFS gateway.

## What It Does

Turn passive visitors into active guardians of your evidence/content:

| Feature | File | What It Does |
|---------|------|--------------|
| **Guardian Globe** | `guardian-globe.html` | D3 globe showing live IPFS + LoRa mesh nodes worldwide |
| **Witness Chamber** | `witness.html` | Bitcoin timestamp ceremony — seal content to blockchain |
| **Chatroom** | `chat.html` | Nostr P2P chatroom with AOL retro skin |
| **Dead Man's Chain** | `chain.html` | Relay chain — if a node goes dark, successor auto-promotes |

## Use With Any IPFS Site

1. Edit `config.json` — point it at your site's CID and domain
2. Serve these files alongside your site (or as a separate deployment)
3. Update `data/guardian_registry.json` as guardians join

```bash
# Serve locally
python -m http.server 5000

# Pin to IPFS (include in your site's IPFS add)
ipfs add -r .
```

## Stack

- Vanilla HTML/CSS/JS only — no npm, no build step
- D3.js v7 from CDN (globe)
- Nostr-tools from CDN (chat + Dead Man's Chain)
- SubtleCrypto API (witness hashing)
- Canvas API (receipt generation)

## Guardian Tiers

| Tier | Action | Web3 Concept Learned |
|------|--------|---------------------|
| Reader | Browse evidence | Content addressing |
| Courier | Share CID/link | Gateways are just doors |
| Guardian | Pin via Fleek/Pinata | Distributed hosting |
| Witness | Bitcoin OTS timestamp | Blockchain as notary |
| Sentinel | Run IPFS node | You ARE the network |
| LoRa Node | Deploy mesh radio | Off-grid resilience |

## Node Types in Registry

```json
{ "type": "ipfs",     ... }    // Standard pinner (green)
{ "type": "sentinel", ... }    // Full Kubo node (cyan)
{ "type": "lora",     ...,     // LoRa mesh (magenta)
  "lora": { "freq_mhz": 915, "spreading_factor": 10, "range_km": 40 } }
```

## LoRa Mesh (Planned)

Future: LoRa/Meshtastic nodes relay alert payloads when internet takedown is detected.
Nodes appear in magenta on the globe. Field operators run Meshtastic devices (RAK4631, Heltec LoRa32, etc.).

## License

Public domain — fork freely. This pattern works for any censorship-resistant publishing.
