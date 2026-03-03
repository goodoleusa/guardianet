# Guardian Net — Setup Guide

## Quick Start (5 minutes)

### 1. Copy core HTML files from cybertemplate (or download from releases)
```bash
# If you have the cybertemplate repo:
cp ../cybertemplate/guardian-globe.html .
cp ../cybertemplate/witness.html .

# Or download from GitHub releases:
# https://github.com/goodoleusa/cybertemplate/releases/latest
```

### 2. Configure for your site
Edit `config.json`:
```json
{
  "site_name": "Your Site Name",
  "site_cid":  "bafybei...",        ← your IPFS CID
  "site_url":  "https://your-site.com"
}
```

### 3. Add your guardians
Edit `data/guardian_registry.json` — add nodes as guardians join.
Or use the admin panel when it's available.

### 4. Serve or deploy
```bash
# Local dev:
python -m http.server 5000

# Pin to IPFS (makes it self-hosting):
ipfs add -r .
# → CID: bafybei...

# Or deploy to Fleek.xyz for auto-IPFS
```

## Push to GitHub

```bash
cd d:\0LOCAL\gitrepos\guardian-net

git init
git add .
git commit -m "Initial guardian-net scaffold"

# Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/guardian-net.git
git push -u origin main
```

## Sync Files From cybertemplate

When guardian-globe.html or witness.html are updated in cybertemplate:
```bash
cp ../cybertemplate/guardian-globe.html .
cp ../cybertemplate/witness.html .
git add -A && git commit -m "sync: guardian files from cybertemplate"
```

## What's Live vs Planned

| File | Status |
|------|--------|
| `index.html` | ✅ Live |
| `guardian-globe.html` | ✅ Live (copy from cybertemplate) |
| `witness.html` | ✅ Live (copy from cybertemplate) |
| `chat.html` | ✅ Live |
| `chain.html` | ✅ Live |
| `manage.html` | ⬜ Planned (admin UI) |
