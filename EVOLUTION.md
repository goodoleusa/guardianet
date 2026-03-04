# GuardianNet — Platform Evolution
## Democracy OS: Federated Resistance Infrastructure

> *"The censors are centralised. We should not be."*
> — Inspired by Gene Sharp, *From Dictatorship to Democracy*

---

## The Big Picture

GuardianNet today is an **application**. The evolution makes it an **operating system for democratic organizing** — a federated stack of open-source tools, cheap hardware, and community protocols that works when the internet is up, works better when it's unreliable, and still works when it's gone.

The design principle: **every layer must function without the layer above it.**

```
LAYER 5 — INTERNET PRESENT
  GuardianNet web app + GUN.js + IPFS + Matrix + Nostr

LAYER 4 — INTERNET DEGRADED / THROTTLED
  Tor circumvention + SSB offline sync + IPFS local node + Briar over WiFi

LAYER 3 — INTERNET CUT
  Meshtastic LoRa mesh + tinySSB + WiFi ad-hoc (LibreMesh)

LAYER 2 — POWER GRID DOWN
  Solar-powered mesh beacons + battery-backed Democracy Box servers

LAYER 1 — ALL DIGITAL COMMS BLOCKED
  Analog protocols, printed mission cards, QR-coded dead drops
```

Each layer is a feature, not a fallback. Real communities have used every one of these.

---

## Seven Pillars of the Evolution

---

### PILLAR 1: FEDERATION — EVERY CHAPTER IS A NODE

**The Problem:** GuardianNet currently depends on a few GUN.js relay servers and a domain name. A sufficiently motivated adversary can target both.

**The Solution:** Turn every local chapter into a self-hosted node in a federated network. No single point of failure because there is no center.

**The Democracy Box** (see Hardware section) runs:
- **Matrix homeserver** (Element/Synapse or Conduit for low-power hardware)
- **IPFS node** participating in the Guardian cluster
- **SSB node** for offline-first community content
- **GUN.js relay** peer for real-time state
- **Meshtastic gateway** bridging LoRa mesh to internet when available

Each Democracy Box is indistinguishable from any other at the network level.
Seizing one affects only that chapter. The network routes around it.

**New module: `chapter.html`**
- Step-by-step YunoHost setup guide
- Democracy Box hardware checklist
- Matrix room federation setup
- IPFS cluster join instructions
- Mesh channel key generation and QR export
- "Chapter readiness score" (how many layers are operational)

**New module: `keys.html`**
- Nostr keypair generation (public key = pseudonymous identity)
- Chapter vs. individual key structure
- QR code export for offline key exchange
- Key backup protocol (split across 3 trusted guardians, Shamir's Secret Sharing)
- "Dead key" protocol — what happens to operational keys if a key holder is arrested

---

### PILLAR 2: OPEN-SOURCE HARDWARE MISSION

**Core Mission:** Design cheap, mass-producible hardware that helps democracy activists stay safe. Not everything needs a smartphone. Not everything needs an app store. Not everything needs a corporation in the middle.

**Design principles for all hardware:**
- BOM under $50 (most under $30)
- Assembleable in a kitchen with basic tools
- Flashable from a browser (no IDE required)
- CERN Open Hardware License v2
- PCB files designed for JLCPCB/PCBWay batch production (~$5 for 5 boards)
- Documented for replication workshops in communities with limited resources

---

#### H1: GUARDIAN NODE v2 — THE MESH BRICK
**BOM: ~$35 | Build time: ~2 hours**

```
ESP32-S3 (dual-core, WiFi+BT)        ~$5
SX1276/SX1278 LoRa module             ~$8
NEO-6M GPS module                     ~$8
TP4056 solar charge controller        ~$3
18650 LiPo battery                    ~$6
Small solar panel (0.5W)              ~$5
3D-printed weatherproof enclosure     ~$3 (filament cost)
──────────────────────────────────────────
Total:                                ~$38
```

**Capabilities:**
- Meshtastic firmware (browser-flashable via espterminator.com)
- GPS position broadcasting (toggleable for OPSEC)
- 10–40km LoRa range (line of sight)
- Solar + battery: indefinite runtime
- AES-256 encryption on Meshtastic channel
- Relays for all peers in range (mesh extends automatically)

**IRL Application:** Deploy on rooftops, trees, or lamp posts around a protest area before the event. When police jam cell signals or cut mobile data, the mesh stays up. 50 nodes in a mid-sized city = city-wide encrypted comms.

**Threat Model Honesty:** LoRa transmission is detectable by direction-finding equipment. Do not transmit from fixed known locations if operating in a high-repression environment. Use brief transmit windows. Consider directional antennas.

---

#### H2: PROOF WITNESS DEVICE — PRESS-BUTTON EVIDENCE
**BOM: ~$45 | Build time: ~3 hours**

```
Raspberry Pi Zero 2W                  ~$15
OV5647 camera module                  ~$10
Secp256k1 hardware key (ATECC608A)    ~$5
MicroSD (32GB)                        ~$8
Push button + LED                     ~$2
3D-printed grip/housing               ~$5
──────────────────────────────────────────
Total:                                ~$45
```

**Capabilities:**
- Press button → photo/video captured with hardware-signed metadata
- ATECC608A crypto chip signs the hash at capture time (unforgeable)
- GPS coordinates and timestamp embedded in cryptographic proof
- Output: ProofMode-compatible JSON + image + .sig file
- On WiFi: auto-pins to IPFS and triggers OpenTimestamps
- Offline: stores locally, syncs when connectivity returns
- No cloud account. No app store. No corporate intermediary.

**IRL Application:** A journalist or witness at a politically significant event presses one button. The resulting file is immediately cryptographically signed by hardware that never connected to the internet. Courts accept hardware-signed evidence. Authoritarian governments cannot retroactively forge the timestamp.

**Design Philosophy:** Most ProofMode users have smartphones. This device is for activists in environments where smartphones are confiscated, surveilled, or absent. A $45 device that looks like a USB battery pack, captures evidence with a single button, and requires no software setup.

---

#### H3: MESH RELAY BEACON — THE PERMANENT NODE
**BOM: ~$25 | No assembly required (flash + mount)**

```
Heltec LoRa32 V3 (ESP32 + SX1276 + OLED built-in)  ~$18
Waterproof project box                               ~$5
USB-C cable + weatherproof gland                     ~$2
──────────────────────────────────────────────────────
Total:                                               ~$25
```

**Capabilities:**
- Flash Meshtastic from browser (2 minutes)
- Configure channel key via QR code
- Mount anywhere with a power outlet or USB power bank
- OLED shows mesh status: active peers, messages relayed, uptime
- No configuration needed after initial flash
- Acts as always-on relay node, extending range for mobile nodes

**IRL Application:** A chapter coordinator pre-deploys 5–10 of these in a city before an expected confrontation. Mobile activists carry Guardian Node v2. When comms go down, the pre-deployed beacons already form the backbone of the mesh.

---

#### H4: DEMOCRACY BOX — THE CHAPTER SERVER
**BOM: ~$80 | Setup time: ~2 hours (guided)**

```
Raspberry Pi 4 (4GB)                  ~$55
MicroSD (64GB, high-endurance)        ~$12
Pi case with fan                      ~$8
USB-C power supply                    ~$5
──────────────────────────────────────────
Total:                                ~$80
```

**Software stack (YunoHost one-click installs):**
- **Matrix/Conduit** — chapter chatroom, federated with other chapters
- **IPFS** — participates in Guardian cluster, pins mission files
- **Gitea** — version-controlled organizing documents, meeting notes
- **Nextcloud** — shared files for chapter (E2E encrypted)
- **SSB pub server** — offline-first community content relay
- **GUN.js relay** — contributes to GuardianNet real-time network

**`chapter.html`** walks a non-technical organizer through setup in under 2 hours. The result: a chapter that owns its infrastructure, federation-connected to the network, and resilient to platform bans.

---

#### H5: FEATURE PHONE BRIDGE — NO SMARTPHONE REQUIRED
**BOM: ~$20 | Target: activists with no smartphone**

```
ESP32 WROOM                           ~$5
SIM800L GSM module                    ~$8
Power supply circuit                  ~$4
PCB + enclosure                       ~$3
──────────────────────────────────────────
Total:                                ~$20
```

**Capabilities:**
- Accepts inbound SMS from any feature phone
- Bridges to GuardianNet P2P network (GUN.js over WiFi)
- Auto-routes to correct mesh channel
- Outbound: delivers mesh messages as SMS
- Based on Openclaw SMS-Gate architecture (already documented in CIVHUB vault)

**IRL Application:** A rural organizer with a $10 Nokia can send and receive messages in the GuardianNet mesh via SMS. The Bridge device (run by a trusted chapter member with internet/WiFi access) translates between SMS and P2P. The network extends to feature phones.

---

#### HARDWARE COORDINATION MODULE: `hardware.html`

New page that serves as:
1. **Open hardware library** — browsable catalog of all designs, with IPFS-hosted schematics
2. **Interactive BOM calculator** — "I have $50 to spend, what can I build?"
3. **Community build log** — guardians post photos of completed builds via GUN.js
4. **Workshop toolkit** — printable assembly guides, QR codes to firmware flash pages
5. **Regional node map** — which hardware types exist in which areas (for mesh coverage planning)
6. **Contribution portal** — submit a new hardware design via Gitea; gets reviewed and pinned to IPFS

All hardware designs live as IPFS CIDs. The BOM, schematic, and firmware config are permanently addressable. No GitHub dependency.

---

### PILLAR 3: EVIDENCE ARCHITECTURE — COMPLETE CHAIN OF CUSTODY

**The Problem:** Right now, witnessing and archiving are separate actions. Most users won't do both.

**The Solution:** `evidence.html` — a guided end-to-end pipeline.

```
CAPTURE (ProofMode or Proof Witness Device)
    ↓
VERIFY (check hash integrity, GPS, hardware signature)
    ↓
BUNDLE (group related evidence: photo + video + text + metadata)
    ↓
IPFS PIN (add bundle to IPFS, get CID for the bundle)
    ↓
TIMESTAMP (OpenTimestamps → Bitcoin, ~1 hour ceremony)
    ↓
BROADCAST (Nostr signed event with CID → 20+ relays)
    ↓
CHAIN ENTRY (post CID to guardian-chain-v1 evidence log)
    ↓
DOWNLOAD RECEIPT (PDF with CID, Bitcoin block, Nostr event ID, hardware sig)
```

Each step is a button click. The pipeline auto-advances. The final receipt is a single document that a lawyer, journalist, or court can verify without trusting GuardianNet at all — just IPFS, Bitcoin, and Nostr math.

**Evidence Bundle Format:**
```json
{
  "bundle_cid": "bafybeiabc...",
  "items": [
    { "type": "image", "cid": "bafybei...", "proofmode_sig": "...", "hardware_key": "..." },
    { "type": "video", "cid": "bafybei...", "proofmode_sig": "..." },
    { "type": "metadata", "cid": "bafybei...", "content": "incident description" }
  ],
  "chain_hash": "sha256 of all item CIDs ordered",
  "timestamp_ots": "base64 .ots file",
  "bitcoin_block": "#891247",
  "nostr_event_id": "...",
  "guardian_signatures": ["nostr_pubkey_1", "nostr_pubkey_2"]
}
```

**IRL Application:** A witness at a rights violation captures on ProofMode or the Proof Witness Device. Opens `evidence.html`, uploads files, clicks Next four times, downloads the receipt. 15 minutes later, the evidence is mathematically anchored in Bitcoin, distributed across 20+ IPFS nodes, broadcast to Nostr relays, and signed by the local chapter's key. No lawyer needed for the technical steps.

---

### PILLAR 4: MULTI-PROTOCOL RESILIENCE

Every critical GuardianNet function should publish to **at least three protocols** simultaneously.

| Function | Protocol 1 | Protocol 2 | Protocol 3 |
|---|---|---|---|
| Dead man's switch | GUN.js | Nostr event | SMS (Bridge) |
| Evidence broadcast | IPFS CID | Nostr event | SSB message |
| Chapter comms | Matrix room | Briar group | Meshtastic channel |
| Chain heartbeat | GUN.js | Nostr + kind:30078 | HTTP fallback |
| Platform access | Domain | .onion service | IPFS CID |

**Nostr Integration:**
Nostr (Notes and Other Stuff Transmitted by Relays) is a censorship-resistant signed event protocol. A Nostr event is just JSON signed by a private key, broadcast to 20+ independent relays. No single relay controls distribution.

GuardianNet publishes to Nostr:
- Chain heartbeats (kind 30078 — parameterized replaceable events)
- Evidence CIDs with metadata (kind 1 — standard notes)
- Dead man's switch triggers (kind 1 with special tag)
- Chapter updates (kind 30023 — long-form content)

Any Nostr client can subscribe to the GuardianNet organization pubkey and receive all events, independent of the GuardianNet domain or GUN.js relays.

**SSB (Secure Scuttlebutt) Integration:**
SSB is an append-only log that syncs between peers over any transport (LAN, USB, internet, LoRa via tinySSB). Content is cryptographically signed and offline-first.

GuardianNet publishes to SSB:
- Evidence CIDs (so chapters with SSB pubs can access without internet)
- Hardware design updates
- Mission files (Gene Sharp, etc.) — accessible offline via SSB

**tinySSB + LoRa:** Evidence CIDs and chain heartbeats relay across the mesh even when the internet is down.

---

### PILLAR 5: COMMUNITY INTELLIGENCE MODULE

**New module: `intel.html`**

A censorship and disinformation radar for local chapters.

**Features:**
1. **Censorship Detector** — enter a URL, check OONI data for whether it's blocked in selected countries
2. **Auto-Archive Trigger** — if a URL is newly censored, automatically pin it to IPFS
3. **Disinformation Radar** — Information Laundromat API check on shared URLs
4. **Hamilton Dashboard Feed** — embedded Russian state disinfo tracker
5. **Protect Democracy Threat Level** — live embed with historical chart
6. **"Your Region" Dashboard** — aggregate censorship incidents in user's country (OONI data)
7. **Alert Subscriptions** — GUN.js alerts when a mission file URL goes offline

**OONI Probe Integration:**
Running OONI Probe from `intel.html` contributes censorship measurements to the global database while also giving local data. The measurements go into the OONI Explorer and help map internet freedom in real time.

**Auto-Archive Protocol:**
```
OONI detects censorship of monitored URL
    → GuardianNet checks if URL is already in IPFS
    → If not: fetch + pin + add to missions.json
    → Broadcast new mission to GUN guardian-ops-v1
    → Notify all online guardians via chat broadcast
    → OpenTimestamps the censorship event itself
```

This turns every censorship event into an automatic archiving trigger. The adversary's censorship action becomes the evidence of their censorship.

---

### PILLAR 6: IDENTITY WITHOUT EXPOSURE

**The Problem:** High-trust operations (handling sensitive evidence, chapter leadership) require verified identity. But verification usually means doxxing.

**The Solution:** Layered pseudonymous identity using Nostr keypairs + zkMe zero-knowledge proofs.

**Identity Tiers:**

```
TIER 0: OBSERVER
  No identity. Just a browser visitor.
  Can: read evidence, learn, complete quests

TIER 1: GUARDIAN (pseudonymous)
  Nostr keypair (no personal info required)
  Proof of Work: completed 3+ quests, 100+ XP
  Can: post evidence, join chain, participate in GUN network
  GUN namespace: guardian-identity-v1/{npub}/profile

TIER 2: VERIFIED GUARDIAN (pseudonymous + zk-verified)
  Nostr keypair + zkMe ZK proof of "real human" (no identity revealed)
  Can: vote on community proposals, mint "Witness" receipts with org signature
  Required for: chapter key custody, hardware design contributions

TIER 3: CHAPTER ANCHOR (trusted, semi-public)
  Known to other anchors in the network but not to the public
  Holds chapter Matrix room key, IPFS cluster node credentials
  Required for: running a Democracy Box, hosting a local chapter
```

**Why Nostr as identity backbone:**
- A Nostr keypair is just 32 bytes of entropy, generated in-browser
- Public key is your identity. Private key never leaves your device.
- Events signed by your key are verifiable by anyone, forever
- Lost key = lost identity (educate guardians on backup protocols)
- No signup, no email, no phone number

**zkMe Integration:**
For Tier 2, zkMe lets guardians prove they're a unique human (Sybil resistance) without revealing who they are. The proof is mathematically valid without trusting zkMe itself — the ZK proof can be verified independently.

---

### PILLAR 7: OFFLINE-FIRST AND ANALOG PROTOCOLS

**The full stack must degrade gracefully to paper.**

**Offline Operation Checklist (per chapter):**

| Resource | Online tool | Offline equivalent |
|---|---|---|
| Communications | Matrix/Signal/GUN chat | Meshtastic mesh, then Briar over WiFi |
| Evidence archive | IPFS + cloud pins | Local IPFS node + USB hard drives |
| Organizing docs | Gitea + Nextcloud | SSB local node, printed binders |
| Maps | Mapeo online sync | Mapeo offline (SQLite, no server needed) |
| Key exchange | IPFS + Matrix | QR codes on paper, in-person |
| Chain heartbeat | GUN.js + Nostr | Physical check-in protocol, SMS Bridge |
| Verification | OpenTimestamps | Printed SHA-256 receipts + notary |

**Printable Mission Cards:**
Each guardian should have a physical card (laminated, wallet-sized) with:
- Their Nostr public key (QR)
- Their local Meshtastic channel key (QR)
- The IPFS CIDs of 3 key documents
- Emergency contact tree (offline succession)
- The URL of the nearest chapter anchor

These cards are generated by `keys.html` and printed locally. No database stores them.

**"When Everything Fails" Protocol:**
1. All digital comms cut → switch to Meshtastic (pre-coordinated channel key)
2. LoRa jammed or confiscated → Briar over WiFi/BT (no internet)
3. All devices confiscated → physical dead drop locations (pre-agreed)
4. Complete isolation → activate succession document (pre-timestamped, held by 3 separate trustees)

---

## New Platform Modules — Specs

| Module | File | Core Tech | Status |
|---|---|---|---|
| Evidence Pipeline | `evidence.html` | ProofMode + IPFS + OTS + Nostr | Design |
| Hardware Library | `hardware.html` | IPFS (schematics) + GUN (builds log) | Design |
| Chapter Setup | `chapter.html` | YunoHost guide + Meshtastic keygen | Design |
| Identity/Keys | `keys.html` | Nostr keypairs + zkMe + QR export | Design |
| Intelligence Radar | `intel.html` | OONI API + Hamilton feed + Protect Democracy | Design |
| Mesh Coordinator | `mesh.html` | Meshtastic channels + GUN coverage map | Design |
| Toolkit Wizard | `toolkit.html` | Decision tree → recommended stack | Design |
| Nostr Bridge | (integrated) | Nostr-tools JS library | Design |

---

## Gamification Evolution

**Current:** Individual XP, quest completion, rank badges

**Evolved:**

### Individual Tracks (keep existing)
- Archivist Path → Communicator Path → Hardware Path → Explorer Path

### Chapter/Cell Collective XP
- Chapter earns XP collectively for: nodes online, documents pinned, chain uptime, OONI probes run
- Globe shows chapter XP as node size/brightness
- Leaderboard by region (anonymous — just chapter codenames)

### New Badges
- **ANCHOR** — 30 consecutive days of chain heartbeat
- **MIRROR** — 100 unique retrievals of files you pinned
- **ARCHITECT** — submitted a hardware design that 5+ others built
- **TRAINER** — helped 5 new guardians reach 100 XP (tracked via Nostr)
- **MESH PIONEER** — first Meshtastic node in your region (GPS-based)
- **PROOF GUARDIAN** — 10 pieces of evidence submitted with complete chain of custody
- **CHAPTER BUILDER** — running a Democracy Box for 60+ days

### Community Milestones (network-wide)
- "CRITICAL MASS" — 500 total guardians
- "IRON ARCHIVE" — 10,000 unique IPFS pins across the network
- "DARK PROOF" — evidence survived a documented takedown attempt
- "MESH CITY" — any metropolitan area with 10+ nodes

---

## The Hardware Workshops

**Community Assembly Events:**
Chapters host workshops where participants build hardware together. Format:
- 3-hour session
- Kits pre-assembled with components (BOM sourced from JLCPCB/AliExpress)
- Facilitator follows `hardware.html` build guide
- By end: every participant leaves with a flashed Guardian Node v2
- Designs pinned to IPFS → shared globally → any chapter can run the same workshop
- Workshop notes/photos added to community build log via GUN.js

**Open Hardware Library (IPFS-hosted):**
All hardware designs under CERN OHL-S v2:
- Schematic (KiCad)
- PCB layout (Gerber files for JLCPCB)
- BOM with supplier links
- 3D models (STL for enclosures)
- Firmware (platformio/arduino, flashable via browser)
- Assembly guide (PDF + IPFS)
- Test protocol

Anyone in the world can download the full package from IPFS, manufacture locally, and contribute improvements back. No GitHub account required. No corporate gatekeeping.

---

---

### PILLAR 8: CRYPTOGRAPHIC GOVERNANCE — VOTE WITHOUT BEING SEEN

**The Problem:** Democratic governance of GuardianNet requires votes. But votes are coercible. If an adversary can see how you voted (or even *that* you voted), activists in high-risk environments face retaliation.

**The Solution:** Zero-knowledge voting using the **Semaphore Protocol** — the math of anonymous democracy.

#### How Semaphore Works (Plain Language)

1. You generate an identity: a private key (stays on your device) + a public commitment (a hash of your key)
2. Your commitment gets added to the chapter's Merkle tree (the "who can vote" list)
3. When a vote opens, you prove — with ZK math — that:
   - Your commitment is in the tree (you're a member)
   - You haven't voted on this proposal before (nullifier system)
4. Your vote is recorded. No one knows it was *you*. No one can link it to your other votes.

**This is not theoretical.** Semaphore runs in-browser using WebAssembly. No blockchain gas fees required. The Merkle tree lives in IPFS.

#### Governance Layers

**Layer 1: SIGNAL (no identity required)**
- Thumbs up/down on proposals via GUN.js
- Not Sybil-resistant — just temperature-checking
- Public (shows support level)
- Tor-safe: no identity attached

**Layer 2: GUARDIAN VOTE (pseudonymous, Sybil-resistant)**
- Requires Tier 1 Nostr identity + XP threshold (100+)
- Semaphore-based: ZK proof of membership, one vote per identity per proposal
- Coercion-resistant: your vote cannot be proven to a third party
- Stored: nullifiers in IPFS (Merkle tree), votes in GUN.js
- Weight: 1 vote per identity (no plutocracy)

**Layer 3: CHAPTER ANCHOR VOTE (federated, high-trust)**
- Chapter anchors can propose hard forks, platform direction changes
- Multi-sig: requires 2/3 chapter anchors to pass
- Implemented via MACI (Minimal Anti-Collusion Infrastructure)
- MACI prevents bribery: you can prove you voted *a way* before the vote, but after the vote closes, only the coordinator knows the result — preventing vote selling

#### Forking Protocol

When the community irreversibly disagrees:

```
FORK PROPOSAL
  → Layer 2 Semaphore vote (anonymized, coercion-resistant)
  → If >2/3 vote yes: fork proceeds

FORK EXECUTION
  → Both branches inherit full IPFS archive (same CIDs)
  → Both branches get the Nostr event history
  → Democracy Box operators choose which branch to federate with
  → Chain splits: both branches start new chains with divergent state
  → Neither branch can claim the original — the archive is the common inheritance
```

Forking is not catastrophic — it's healthy. Both branches carry the truth forward.

#### Staking (Reputation, Not Money)

No financial staking. Reputation staking:
- Proposing requires 250+ XP
- Failed proposals (< 20% support) cost 50 XP
- Successful proposals earn 200 XP + ARCHITECT badge
- This prevents spam proposals without requiring cryptocurrency or identity exposure

#### Implementation: `vote.html`

New module integrating:
- **Semaphore.js** (browser-native ZK proof generation via WASM)
- **IPFS** (Merkle tree storage — membership commitments)
- **GUN.js** (real-time vote tallying, nullifier checks)
- **Nostr** (proposal broadcast, vote announcements)
- **No Ethereum required** — all off-chain, but verifiable

Vote flow:
```
READ PROPOSAL (IPFS CID)
    ↓
GENERATE ZK PROOF (local, ~2s via WASM)
    ↓
SUBMIT NULLIFIER + VOTE (GUN.js relay)
    ↓
VERIFY PROOF (any node can verify against IPFS Merkle tree)
    ↓
RESULT TALLIED (publicly verifiable, individually anonymous)
```

#### Related Protocols Worth Evaluating

| Protocol | Use Case | Notes |
|---|---|---|
| **Semaphore** | Anonymous membership voting | Best fit for Guardian votes |
| **MACI** | Anti-coercion election | Best for chapter anchor votes |
| **Clr.fund** | Quadratic funding (translation bounties) | Requires some ETH setup |
| **Snapshot** | Off-chain Nostr-signed votes | Simpler but linkable to identity |
| **NIP-69** (Nostr) | Poll events | Lightweight, less Sybil-resistant |

---

## Governance and Sustainability

**Proposal System:**
- Community proposals posted as Nostr long-form events (kind 30023)
- Signed by proposer's Nostr key
- Semaphore anonymous vote (Guardian tier, 100+ XP)
- MACI vote for fork/anchor decisions (chapter anchors only)
- Passed proposals pinned to IPFS, CID referenced in ARCHITECTURE.md
- No DAO tokens. No financial staking. Reputation-based governance.

**Translation Bounties:**
- Key documents (From Dictatorship to Democracy, Guardian onboarding) need translation
- Post translation bounty as GUN + Nostr event
- Translator submits translated document to IPFS
- Chapter anchors verify + vouch via Nostr reactions
- Verified translations added to missions.json as archive targets

**The Long-Term Vision:**
GuardianNet doesn't "win" by getting big. It wins by making itself unnecessary — by building the infrastructure layer that lets local communities run their own nodes, hold their own data, flash their own hardware, and organize independently. The platform's success metric is not DAU. It's: **how many chapters could operate indefinitely if guardianet.com disappeared tomorrow?**

That's the answer to censorship. Not a better app. A protocol.

---

## Implementation Phases

### Phase 2 (Current — Q1 2026)
- ✅ Mission control dashboard
- ✅ Gamified quest system with real actions and honest threat models
- ✅ Tools library with threat notes
- ✅ Active archive missions
- 🔄 Hardware v2 schematics in Circuit Lab
- 🔄 Nostr integration for heartbeat broadcast

### Phase 3 (Q2 2026)
- `evidence.html` — complete chain of custody pipeline
- `hardware.html` — open hardware library + community build log
- Guardian Node v2 PCB design finalized, Gerbers on IPFS
- Proof Witness Device first prototype
- YunoHost Democracy Box setup guide

### Phase 4 (Q3 2026)
- `chapter.html` + `keys.html`
- Nostr identity integration
- zkMe Tier 2 verification
- SSB bridge for offline content
- First hardware workshops

### Phase 5 (Q4 2026)
- `intel.html` — OONI + disinformation intelligence
- tinySSB LoRa content relay
- `mesh.html` — regional coverage coordination
- Feature Phone Bridge v1
- Succession protocol generator

---

*All specs in this document should be treated as living proposals. Community input via Nostr + Guardian Chat is the governance layer.*

*Hardware designs under CERN OHL-S v2. Software under GPL-3.0. Content under CC-BY-SA 4.0.*
