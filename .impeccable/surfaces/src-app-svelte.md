---
version: 1
slug: "src-app-svelte"
primary_target: "src/App.svelte"
related_targets: []
---

# Surface: story landing page (src/App.svelte)

Mode: Persuade. Czech visitors on phones, mostly from Instagram, deciding whether to adopt two kittens. Action: write an email or Instagram DM. Proof: the cats' own story, vet-checked/dewormed/deflead facts (no vaccination claims, see PRODUCT.md), placeholder photos to be replaced. Constraints: Czech only, mobile-first, journey stops in data, Svelte static build.

Memorable moment: a placeholder car card drives along a marker-drawn route on cardboard as you scroll, from Velebit through Poljana to Prague, stamping each stop as it passes.

Unresolved: real photos, real email and Instagram handle, the cats' personality lines (drafted, to be confirmed by the user).

## Direction contract

THESIS: Velík and Polly narrate their own road trip as a cartoon adventure map: a red dashed route with loop-de-loops that the car drives as you scroll, and stories that pop open at each stop. Ends in the cardboard box they're ready to travel in. Refuses the pastel shelter page (photo hero, paw icons, row of equal cards). (User steer, 2026-10-29: "ditch the box theme a bit, travel should feel like adventure, bigger car, loops like cartoon map lines; cardboard only for the final CTA, email instead of a form, no backend.")

OWN-WORLD: The ground is pale map-green land with contour lines and map folds between sections. Scenery is top-down, like a topographic map: contour-ring mountains and hills with hypsometric tints, tree-crown forest patches, lakes, rivers, white roads, hatched fields and house-footprint villages. There are dashed border lines with country names and a red dashed route revealed behind the car. The route starts with hairpins down through Velebit and makes rounded detours out to labelled spots (lookout, rest stop). (User steer: start in the mountains, not the sea; top-down like contour lines; gentler loops.) Story labels are white paper with tape and red ink stamps. The closing CTA and footer are corrugated kraft cardboard with box-handling marks. Type: rounded Nunito for display and narration, condensed Archivo for printed field captions (src/fonts.css, --f-marker and --f-label in app.css).

STORY: Meet two kittens in their own voice → drive the map from Velebit through Poljana and Austria to Prague, with each story appearing as the car arrives → understand why they can't stay (two dogs, allergy) → meet the passengers and their health record → write an email (pre-filled mailto, copy address) or an Instagram DM. No backend.

FIRST VIEWPORT: At 390 wide, the marker headline "Ahoj, jsme dvě koťata z lesa." over the map ground, then a tilted travel-ticket label (Odkud / Cestující / Kam) with the doodled cats peeking over its top edge. The primary action is the red "K vám domů? →" button in the Kam row. Two taped photo labels sit at the corner, and the "POZOR, ŽIVÉ!" stamp is set at an angle.

FORM: The Kitten Box, candidate 7 of 7, seed:80f5626e31878b00, re-steered by the user toward a cartoon adventure map for everything but the close. Signature interaction: the car card follows a winding route (switchbacks and rounded detours) mapped piecewise to scroll, with tilt and bump wobble, parking at each pin while its story pops open. Stops change state by mark: upcoming = faded with a dashed outline, current = taped and popped, passed = stamped.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
