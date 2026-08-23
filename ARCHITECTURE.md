# GuardianNet — Architecture Notes

See `README.md` for the feature overview, GUN.js namespace map, and node-type schema. This file covers what isn't there: current phase, per-tool threat-model notes, and open implementation questions.

## Current Phase
**Phase 2: Mission Control Expansion**
- Phase 1 (done): Core P2P infrastructure — GUN chat, dead man's chain, globe, circuit lab, witness
- Phase 2 (in progress): Mission control dashboard + gamified onboarding + tools library + threat model education
- Phase 3 (planned): Community XP leaderboard, mobile-first, active-missions push system

## Remotes
- `origin`: github.com/goodoleusa/guardianet.git

## Security / Threat Model Principles (baked into onboard.html)
- Decentralization ≠ always safer; match tool to threat model
- Tor: powerful for censorship circumvention, vulnerable to nation-state traffic correlation
- Matrix: great for community organizing; metadata is exposed to homeserver operators, federation leaks contact graphs; not equivalent to Signal for sensitive 1:1 comms
- IPFS: content-addressed ≠ anonymous; your node reveals what you're fetching
- GUN.js: public by default; data on relay servers is not private
- LoRa: signal is detectable/triangulatable; mesh ≠ encrypted by default (Meshtastic adds crypto)

## IPFS Hosting Scaffold (3 tiers)
1. **Browser** — IPFS Companion extension (mentioned in onboard.html)
2. **Desktop** — IPFS Desktop or Kubo CLI (linked in pin.html + onboard.html)
3. **Cluster** — ipfs-cluster with `guardian-pinset.json` (pin.html cluster tab)

`pin.html` chains these together: "learn about IPFS" → "pick a free service" → "pin a CID" → "claim XP", in one flow.

## Open Questions
- Active missions: static `missions.json` or GUN-dynamic (admin pushes via manage.html)?
- onboard.html XP: anonymous (localStorage only) vs. pseudonymous (GUN public)?
- pin.html copy counts: currently static from the `PINSETS` array — should pull live from `guardian-pins-v1` per CID
- Mobile optimization priority?
- `node-setup.html`: step-by-step IPFS node wizard (Kubo install → verify → pin guardian CID → live)
