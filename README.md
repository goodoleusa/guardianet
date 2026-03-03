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
