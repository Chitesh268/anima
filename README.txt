ARISE — React Player System

The app now starts in a React-powered animated control room. It shows player level, XP, streak, and daily quest count from the existing solo-system-v2 local save. Use the React module bar to navigate the original tracker in the embedded system frame. Existing quests, attributes, skill trees, boss room, achievements, journal, settings, sounds, backups, and local saves are preserved in public/legacy.html.

To run locally:
1. Install Node.js 20 or newer.
2. Run npm install.
3. Run npm run dev and open the local address shown by Vite.
4. Run npm run build to create the production app in dist/.

Do not open index.html directly from the filesystem. Vite is required to load the React modules.

For GitHub Pages deployment, use the included .github/workflows/deploy-pages.yml workflow. In the repository settings, choose Pages -> Build and deployment -> GitHub Actions. Data remains stored locally in the current browser/device and is not uploaded to a server.
