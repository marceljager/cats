Tools for the hand-drawing templates (drawing-templates/).

  templates.mjs  exports an SVG and a PNG template for every numbered piece on
                 drawings.html, and writes src/drawings/boxes.json (where each drawing sits)
  swatches.mjs   writes the colour palettes (.ase and Procreate .swatches)

Both drive Chrome through puppeteer-core against the running dev server (npm run dev, port 5179):

  npm i -D puppeteer-core
  node tools/templates.mjs .
  node tools/swatches.mjs drawing-templates

Re-run templates.mjs whenever a piece changes shape, or the drawings will no longer line up.
