# ARISE — React Player System

ARISE now opens in a React-powered control room with a visible animated aura frame, ember glow, electric border flicker, level/XP status cards, and animated module navigation. The original tracker is kept as `public/legacy.html` and runs in a same-origin frame, so its quests, skills, boss room, journal, settings, sounds, backups, and existing `solo-system-v2` local save remain available.

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Run `npm run dev` and open the local URL printed by Vite.
4. Run `npm run build` to create a production build in `dist/`.

Do not open the React `index.html` directly from the filesystem; Vite serves the React modules during development.

## Publish with GitHub Pages

A workflow is included at `.github/workflows/deploy-pages.yml`. Push this repository to GitHub, then in the repository settings choose **Pages → Build and deployment → GitHub Actions**. The workflow builds the Vite app and deploys `dist/`; relative asset paths support a repository project URL such as `https://<owner>.github.io/final/`.

## Existing data and original tracker

The previous standalone tracker is preserved in `public/legacy.html`. The React shell reads the existing `solo-system-v2` local-storage record for its XP, level, rank, streak, and daily quest summary, then opens the original tracker for full module interaction. Data remains local to the same browser and device; it is not uploaded to a server.
