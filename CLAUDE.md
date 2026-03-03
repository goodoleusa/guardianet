# Guardian Net — Agent Rules

## What This Repo Is
Standalone Web3 resilience layer — works with any IPFS-pinned site.
Configure via `config.json`. No build step. Vanilla HTML/CSS/JS only.

## Read First
`README.md` for overview. `config.json` for site-specific settings.

## Stack Rules
- Vanilla HTML/CSS/JS only — NO npm, NO webpack, NO build tools
- D3.js v7, Nostr-tools — CDN only
- Fonts: Share Tech Mono from Google Fonts
- No backend required (everything runs in browser)

## Files
| File | Status | Purpose |
|------|--------|---------|
| `index.html` | ✅ Live | Landing page, network stats |
| `guardian-globe.html` | ✅ Live | D3 globe, IPFS + LoRa nodes |
| `witness.html` | ✅ Live | Bitcoin OTS ceremony |
| `chat.html` | ✅ Live | P2P chatroom, AOL skin, Gun.js |
| `chain.html` | ⬜ Planned | Dead Man's Switch relay UI |
| `config.json` | ✅ Live | Site configuration |
| `data/guardian_registry.json` | ✅ Live | Node registry |

## Admin Rule (SAME AS CYBERTEMPLATE)
Any new feature → must be configurable via `config.json` AND have
a management UI (even if just a JSON editor page `manage.html`).

## Relationship to CyberTemplate
This repo is the Guardian Network layer extracted as standalone.
CyberTemplate repo links to it. Changes here may need to sync to
cybertemplate/guardian-globe.html etc. Keep in sync manually
or use git subtree.

## Subagents
Use same `.claude/agents/` as cybertemplate (copy or symlink).
`guardian-net-builder` agent is the primary agent for this repo.
