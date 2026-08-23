# Guardian Net

**A Web3 resilience layer for any IPFS-distributed site.**

Gamified IPFS pinning, Bitcoin timestamping, a Nostr chatroom, and a Dead Man's Switch relay chain — all in static HTML/CSS/JS, no build step, works on any web server or IPFS gateway.

## What It Does

Turn passive visitors into active guardians of your content:

| Feature | File | What It Does |
|---------|------|--------------|
| **Mission Control** | `index.html` | Entry point — live stats, active archive missions, tools grid |
| **Guardian Quests** | `onboard.html` | Gamified onboarding that teaches web3/P2P concepts through real actions |
| **Guardian Globe** | `guardian-globe.html` | D3 globe showing live IPFS + LoRa mesh nodes worldwide |
| **Witness Chamber** | `witness.html` | Bitcoin OpenTimestamps ceremony — seal content to the blockchain |
| **Chatroom** | `chat.html` | Nostr P2P chatroom with an AOL retro skin |
| **Dead Man's Chain** | `chain.html` | Relay chain — if a node goes dark, a successor auto-promotes |
| **Circuit Lab** | `circuit.html` | Browser-based schematic designer for off-grid mesh hardware |
| **Operation: First Pin** | `pin.html` | Guided IPFS pinning wizard (method selector, pinset menu, XP registry) |
| **Admin Panel** | `manage.html` | Registry, CID vault, broadcast console, quest editor |

## Architecture

**No backend required.** Everything runs client-side with GUN.js for P2P state and can be served entirely from IPFS. `server.py` is an optional convenience layer (static file server + OpenTimestamps/Pinata proxy) — nothing in the app depends on it existing.

Key decisions:
- **GUN.js as the state backbone** — chain heartbeats, chat, quest XP, presence, live ops all sync P2P
- **IPFS + Bitcoin OpenTimestamps** — evidence is addressed by content hash and timestamped to Bitcoin, so integrity doesn't depend on trusting a server
- **LoRa/Meshtastic** — off-grid resilience layer; hardware quests walk through it in Circuit Lab
- **Honest threat modeling** — every tool's weaknesses are documented alongside its strengths; see the Security/Threat Model notes baked into `onboard.html`

### GUN.js namespaces

```
guardian-chain-v1/nodes/{nodeId}              chain heartbeats + succession
guardian-chat-v1/rooms/{roomId}/msgs          P2P chat messages
guardian-chat-v1/presence/{name}              online status
guardian-quests-v1/{userId}/completed         quest completion state
guardian-quests-v1/{userId}/xp                XP total
guardian-quests-v1/leaderboard/{userId}       public rank display
guardian-pins-v1/pins/{autoId}                pin claims {name, cid, method, pinsetId, xp, ts}
guardian-pins-v1/recent/{autoId}               recent pins feed (pin.html live ticker)
guardian-circuit-lab-v1/{sessionId}/circuit   circuit JSON for collaborative sync
guardian-circuit-lab-v1/{sessionId}/peers/{peerId}  peer presence heartbeats
```

Default GUN.js relay peers: `https://gun-manhattan.herokuapp.com/gun`, `wss://relay.peer.ooo/gun` — both optional accelerators, not sources of truth.

### Node types in `data/guardian_registry.json`

```json
{ "type": "ipfs",     ... }    // Standard pinner (green)
{ "type": "sentinel", ... }    // Full Kubo node (cyan)
{ "type": "lora",     ...,     // LoRa mesh (magenta)
  "lora": { "freq_mhz": 915, "spreading_factor": 10, "range_km": 40 } }
```

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

See `SETUP.md` for a full step-by-step guide, including syncing shared pages from a template repo and pushing to your own GitHub remote.

## Stack

- Vanilla HTML/CSS/JS only — no npm, no build step
- D3.js v7 from CDN (globe)
- Nostr-tools from CDN (chat + Dead Man's Chain)
- GUN.js from CDN (P2P state)
- SubtleCrypto API (witness hashing)
- Canvas API (receipt generation)
- `server.py` (optional) — Python static server + OpenTimestamps/Pinata proxy

## Guardian Tiers

| Tier | Action | Web3 Concept Learned |
|------|--------|---------------------|
| Reader | Browse evidence | Content addressing |
| Courier | Share CID/link | Gateways are just doors |
| Guardian | Pin via Fleek/Pinata | Distributed hosting |
| Witness | Bitcoin OTS timestamp | Blockchain as notary |
| Sentinel | Run IPFS node | You ARE the network |
| LoRa Node | Deploy mesh radio | Off-grid resilience |

## LoRa Mesh (Planned)

Future: LoRa/Meshtastic nodes relay alert payloads when an internet takedown is detected. Nodes appear in magenta on the globe. Field operators run Meshtastic devices (RAK4631, Heltec LoRa32, etc.). See `EVOLUTION.md` for the longer-range federation roadmap and `ARCHITECTURE.md` for open implementation questions.

## License

Public domain — fork freely. This pattern works for any censorship-resistant publishing.
