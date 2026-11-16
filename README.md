# Suggestor - Rise of Nations Tools

A specialized web application for the [Rise of Nations (Roblox)](https://www.roblox.com/games/2569453732/Rise-of-Nations) community. Generate game suggestion code, formables, dynamic flags, city coordinates, releasables, and resource allocations with automatic sync to the latest Fandom wiki data.

Hosted live on Cloudflare Pages: [https://ronroblox-suggestor.pages.dev](https://ronroblox-suggestor.pages.dev)

---

## Features

- **Formabler**: Generate complete Lua code configurations for formable nations and missions with autofill.
- **Dyn-Flagger**: Design dynamic national flags with ideology and law requirements.
- **Cityer**: Click on an interactive world map to capture precise city coordinates.
- **Releasabler**: Create releasable nation configurations based on game tiles.
- **Resourcer**: Allocate resources across nation tiles with autocomplete.
- **Live Wiki Sync**: Automatically syncs and parses Lua modules from the official Rise of Nations Fandom wiki.

---

## Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set the following variables:
- `MAPTILER_API_KEY`: Required for the interactive MapTiler map on the Cityer page. Get a free key at [maptiler.com](https://cloud.maptiler.com/).
- `ROBLOX_API_KEY`: Optional Roblox Open Cloud API key for decal asset resolution.

---

## Development

```bash
# Install dependencies
npm install

# Sync wiki data and run dev server (default port: 6767)
npm run dev
```

Development server runs at `http://localhost:6767`.

---

## Scripts

- `npm run dev`: Start local development server on port 6767.
- `npm run sync:fandom`: Fetch and parse the latest Lua modules from the RoN Fandom Wiki into JSON.
- `npm run build`: Sync wiki data and build the production application.
- `npm run preview`: Build and preview the Cloudflare Pages output with Wrangler.
- `npm run deploy`: Build and deploy to Cloudflare Pages.
