# GuardianNet — Architecture

## Goal
Transform GuardianNet into the mission control dashboard for Mission Defend Democracy.
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
- `onboard.html` — NEW: Guardian Quest/XP system (gamified onboarding, real actions)
- `chain.html` — Dead Man's Chain (48h succession relay)
- `chat.html` — P2P chatroom (GUN.js, AOL skin)
- `guardian-globe.html` — D3 orthographic globe, node positions
- `circuit.html` — Hardware schematic editor (D3 force-graph, LoRa catalog)
- `witness.html` — Bitcoin timestamping ceremony (OpenTimestamps)
- `manage.html` — Admin registry, CID vault, broadcast console
- `data/guardian_registry.json` — 13 live nodes (sentinel/guardian/lora tiers)
- `data/tools.json` — NEW: Curated censorship-resistant tools (from Raindrop collection)
- `data/missions.json` — NEW: Active archive missions (files that need pinning NOW)

## GUN.js Namespaces
- `guardian-chain-v1/nodes/{nodeId}` — chain heartbeats + succession
- `guardian-chat-v1/rooms/{roomId}/msgs` — p2p messages
- `guardian-chat-v1/presence/{name}` — online status
- `guardian-quests-v1/{userId}/completed` — quest completion state
- `guardian-quests-v1/{userId}/xp` — XP total
- `guardian-quests-v1/leaderboard/{userId}` — public rank display

## GUN.js Peers
- `https://gun-manhattan.herokuapp.com/gun`
- `wss://relay.peer.ooo/gun`

## Remotes
- `origin`: github.com/goodoleusa/guardianet.git
- `mdd`: github.com/Defenders-of-Democracy/mission-defend-democracy (push as `master:dev`)

## Security/Threat Model Principles (baked into onboard.html)
- Decentralization ≠ always safer; match tool to threat model
- Tor: powerful for censorship circumvention, vulnerable to nation-state traffic correlation
  (Russia operates significant % of exit nodes; correlation attacks documented)
- Matrix: great for community organizing; metadata exposed to homeserver operators,
  federation leaks contact graphs; not equivalent to Signal for sensitive 1:1 comms
- IPFS: content-addressed ≠ anonymous; your node reveals what you're fetching
- GUN.js: public by default; data on relay servers is not private
- LoRa: signal is detectable/triangulatable; mesh ≠ encrypted by default (Meshtastic adds crypto)

## Open Questions
- Active missions: static missions.json or GUN-dynamic (admin pushes via manage.html)?
- onboard.html XP: anonymous (localStorage only) vs. pseudonymous (GUN public)?
- Mobile optimization priority?
