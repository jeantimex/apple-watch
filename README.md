# Apple Watch UI (Vite + Vanilla JS)

## Features
- Hexagonal app layout projected onto a faux sphere to mimic Apple’s depth effect.
- Pointer/touch drag with inertia and snap-to-center behaviour.
- Uses the original icon and watch assets bundled under `public/assets`.

## Getting Started
```bash
npm install
npm run dev
```

- Open the logged local URL to see the watch face.
- Drag inside the screen to scroll; release to trigger inertia.

## Commands
- `npm run dev` – start the Vite dev server with hot reload.
- `npm run build` – build production assets into `dist/`.
- `npm run preview` – preview the production build locally.

## Project Structure
- `src/main.js` – mounts the watch, renders icons, and wires up interactions.
- `src/utils/` – hex coordinate generator, easing curves, transforms, and pointer helpers.
- `src/data/apps.js` – icon metadata mirroring the reference JSON.
- `public/assets/` – watch art and app icons.

## Notes
- All easing utilities are lightweight ports of the jQuery easing functions used in the legacy build.
- Pointer events are used for unified mouse/touch handling; make sure your browser supports them (modern evergreen browsers do).
- Assets remain identical to the original project; replace or expand `src/data/apps.js` to add more icons.
