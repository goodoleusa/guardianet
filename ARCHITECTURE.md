# GuardianNet — Architecture

## Goal
Transform GuardianNet into the mission control dashboard for [redacted project name].
Gamify decentralized resistance: teach non-technical users web3/p2p/censorship concepts
through real actions, make it easy to join IPFS hosting, bridge digital tools to IRL organizing.

## Current Phase
**Phase 2: Mission Control Expansion**
- ✅ Phase 1: Core P2P infrastructure (GUN chat, dead man's chain, globe, circuit lab, witness)
- 🔄 Phase 2: Mission control dashboard + gamified onboarding + tools library + threat model education
- 📋 Phase 3: Community XP leaderboard, mobile-first, active missions push system

## Key Architectural Decisions
1. **No backend** — pure client-side + GUN.js P2P. Serves from IPFS.
2. **GUN.js as state backbone** — chain, chat, quest XP, presence, ops alerts
3. **IPFS + Bitcoin OTS** — evidence by content hash, timestamped to Bitcoin
4. **LoRa/Meshtastic** — off-grid resilience; hardware quests via circuit lab
5. **Honest threat model** — tools have weaknesses; teach OPSEC alongside tooling

## Files Map
- `index.html` — Mission Control (entry point, live stats, active ops, tools grid)
- `onboard.html` — Guardian Quest/XP system (gamified onboarding, real actions)
- `pin.html` — NEW: Operation First Pin — guided IPFS wizard (method selector, pinset menu, GUN XP registry)
- `chain.html` — Dead Man's Chain (48h succession relay, demo mode, P2P DB educational guide)
- `chat.html` — P2P chatroom (GUN.js, AOL skin)
- `guardian-globe.html` — D3 orthographic globe, node positions
- `circuit.html` — Hardware schematic editor (static layout, BOM+fit estimator, GUN collab, wiki)
- `witness.html` — Bitcoin timestamping ceremony (OpenTimestamps)
- `manage.html` — Admin registry, CID vault, broadcast console
- `data/guardian_registry.json` — 13 live nodes (sentinel/guardian/lora tiers)
- `data/tools.json` — Curated censorship-resistant tools (from Raindrop collection)
- `data/missions.json` — Active archive missions (files that need pinning NOW)
- `data/guardian-pinset.json` — NEW: ipfs-cluster compatible pinset config (bulk-pin all missions)

## GUN.js Namespaces
- `guardian-chain-v1/nodes/{nodeId}` — chain heartbeats + succession
- `guardian-chat-v1/rooms/{roomId}/msgs` — p2p messages
- `guardian-chat-v1/presence/{name}` — online status
- `guardian-quests-v1/{userId}/completed` — quest completion state
- `guardian-quests-v1/{userId}/xp` — XP total
- `guardian-quests-v1/leaderboard/{userId}` — public rank display
- `guardian-pins-v1/pins/{autoId}` — NEW: pin claims {name, cid, method, pinsetId, xp, ts}
- `guardian-pins-v1/recent/{autoId}` — NEW: recent pins feed for pin.html live ticker
- `guardian-circuit-lab-v1/{sessionId}/circuit` — circuit JSON for collab sync (circuit.html)
- `guardian-circuit-lab-v1/{sessionId}/peers/{peerId}` — peer heartbeats for presence count

## GUN.js Peers
- `https://gun-manhattan.herokuapp.com/gun`
- `wss://relay.peer.ooo/gun`

## Remotes
- `origin`: github.com/goodoleusa/guardianet.git
- `gn`: github.com/[redacted-private-org]/[redacted-private-repo] (push as `master:dev`)

## Security/Threat Model Principles (baked into onboard.html)
- Decentralization ≠ always safer; match tool to threat model
- Tor: powerful for censorship circumvention, vulnerable to nation-state traffic correlation
  (Russia operates significant % of exit nodes; correlation attacks documented)
- Matrix: great for community organizing; metadata exposed to homeserver operators,
  federation leaks contact graphs; not equivalent to Signal for sensitive 1:1 comms
- IPFS: content-addressed ≠ anonymous; your node reveals what you're fetching
- GUN.js: public by default; data on relay servers is not private
- LoRa: signal is detectable/triangulatable; mesh ≠ encrypted by default (Meshtastic adds crypto)

## IPFS Hosting Scaffold (3 tiers)
1. **Browser** — IPFS Companion extension (mentioned in onboard.html)
2. **Desktop** — IPFS Desktop or Kubo CLI (linked in pin.html + onboard.html)
3. **Cluster** — ipfs-cluster with guardian-pinset.json (pin.html cluster tab + guardian-pinset.json)
Workflow gap closed: pin.html connects "learn about IPFS" → "pick a free service" → "pin a CID" → "claim XP" in one flow.

## Open Questions
- Active missions: static missions.json or GUN-dynamic (admin pushes via manage.html)?
- onboard.html XP: anonymous (localStorage only) vs. pseudonymous (GUN public)?
- pin.html copy counts: currently static from PINSETS array — should pull live from guardian-pins-v1 per CID
- Mobile optimization priority?
- node-setup.html: step-by-step IPFS node wizard (Kubo install → verify → pin guardian CID → live)
