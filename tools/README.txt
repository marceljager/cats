Tools that make files for the repo by hand, when their source changes (unlike scripts/, which
runs on every build). Each says at its top what it writes.

  npm run templates   drawing-templates/: an SVG and a PNG template for every numbered piece on
                      drawings.html, and src/drawings/boxes.json (where each drawing sits)
  npm run swatches    drawing-templates/: the colour palettes (.ase and Procreate .swatches)
  npm run og          public/og.png, the picture a shared link shows
  npm run icons       public/apple-touch-icon.png, from public/favicon.svg

templates and swatches read drawings.html from the running dev server (npm run dev), through
headless Chrome (puppeteer-core); og drives the same Chrome directly. Two variables point them
elsewhere (chrome.js):

  DEV_URL   the dev server, by default http://localhost:5173
  CHROME    the Chrome executable, by default the one in /Applications

Re-run templates whenever a piece changes shape, or the drawings will no longer line up. It
replaces only the templates; drawing-templates/README.txt and the palettes stay, so the two can
run in either order.
