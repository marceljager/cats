---
version: 1
slug: "src-app-svelte"
primary_target: "src/App.svelte"
related_targets: []
---

# Surface: story landing page (src/App.svelte)

Mode: Persuade. Czech visitors on phones, mostly from Instagram, deciding whether to adopt two kittens. Action: write an email or Instagram DM. Proof: the cats' own story, vet-checked/dewormed/deflead facts (no vaccination claims, see PRODUCT.md), placeholder photos to be replaced. Constraints: Czech only, mobile-first, journey stops in data, Svelte static build.

Memorable moment: the car, the two big photo heads riding on top, drives the red dashed route across the cartoon map as you scroll, from Velebit through Poljana to Prague; each pin pops red and each story is taped down as the car reaches it.

Unresolved: real photos, real email and Instagram handle, the cats' personality lines (drafted, to be confirmed by the user).

## Direction contract

THESIS: Velík and Polly narrate their own road trip as a cartoon adventure map: a red dashed route with loop-de-loops that the car drives as you scroll, and stories that pop open at each stop. Ends in a warm living room with the back of a postcard to write on. Refuses the pastel shelter page (photo hero, paw icons, row of equal cards). (User steer, 2026-10-29: "ditch the box theme a bit, travel should feel like adventure, bigger car, loops like cartoon map lines; cardboard only for the final CTA, email instead of a form, no backend.")

OWN-WORLD: It opens at night in the forest under Velebit, the two of them looking at one warm window, and morning hills roll down into the map. The map ground is pale green, with its scenery drawn side-on like a cartoon: mountain ranges, forests, hills, lakes, the farm with its goats, fields, and Prague as one skyline over the Vltava. Rivers cross it, dashed border lines carry country names, and the red dashed route is revealed behind the car. The route starts in the mountains and makes rounded detours out to labelled spots (lookout, rest stop). (User steer: start in the mountains, not the sea; gentler loops.) Story cards are white paper with tape. The close is a living room lit by its fire: the back of a postcard to write on, a flyer with tear-off strips to send the page on, the two of them asleep in their bed. Type: rounded Nunito for display and narration, condensed Archivo for printed field captions (src/fonts.css, --f-marker and --f-label in app.css).

STORY: Meet two kittens in their own voice → drive the map from Velebit through Poljana and Austria to Prague, with each story appearing as the car arrives → understand why they can't stay (two dogs, allergy) → meet the passengers and their health record → write an email (pre-filled mailto, copy address) or an Instagram DM. No backend.

FIRST VIEWPORT: At 390 wide, the night forest with the headline "Ahoj, jsme Velík a Polly.", a short lede and fact chips (siblings, age, health, where they are). The primary action is the red "Chci je poznat →" button, beside a quieter "how we got here" link down to the map; the share button sits in the corner and the kittens huddle at the bottom of the scene.

FORM: The Kitten Box, candidate 7 of 7, seed:80f5626e31878b00, re-steered by the user toward a cartoon adventure map for everything but the close. Signature interaction: the car card follows a winding route (switchbacks and rounded detours) mapped piecewise to scroll, with tilt and bump wobble, parking at each pin while its story pops open. Stops have two states: upcoming = faded and lowered with a dashed outline, its pin cream and dashed; reached = popped up and taped, its pin red with a shine.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
