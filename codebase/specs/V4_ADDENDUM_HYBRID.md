# V4 Addendum — Hybrid street renderer (Director's ruling, Nov 4, 2026)

## Hosting (permanent, Nov 4, 2026)
The game lives in Anand's GitHub repo **anandin/toronto-td** (public). The
Vercel edge function streams `game.html` from the repo's raw URL — the old
expiring Muse-storage links are retired. New build = re-run
`~/workspace/repos/push_toronto_td.py` (one commit via the Git Data API);
no Vercel redeploy needed. The stored build carries a
`__MAPBOX_PUBLIC_TOKEN__` placeholder instead of the public pk token
(GitHub's scanner can't tell pk from sk and blocks the raw file);
`api/play.js` swaps the real public token back in at serve time, and the
publisher REFUSES to run if an sk.* pattern ever appears in a build.

## Decision
Eagle/strategy layer stays on Mapbox (live, verified across re-reviews #3 and #4).
Street mode (dive/TPS) moves to the LOCAL street renderer — the World Builder's
pre-authorized fallback in V4_SPEC ("if required TPS poses fail those constraints,
use a separate street renderer with authored geometry").

## Evidence (why Mapbox TPS is abandoned)
- Fix build #2: dive in Mapbox mode fell back to jumpTo (pitch 72, zoom 17.4) — a
  tilted aerial, no survivor. Tester re-review #3: B-DIVE FAIL.
- Fix build #3: free-camera path genuinely engaged — dev panel reads
  "TPS CAMERA: free", LAST MAP ERROR: none — yet the rendered street view is STILL
  a high tilted aerial with no survivor visible (re-review #4, B-DIVE FAIL).
  Diagnosis: the free camera drives the custom-layer matrix, but the Mapbox
  basemap camera never reaches eye level (Mapbox's camera model has no true
  2 m eye-height pose), so the dominant visual stays aerial and the true-scale
  survivor is invisible inside it. Two builds, two mechanisms, same wall.
- The local renderer's TPS is proven: fix build #2's probe produced a real
  ground-level over-shoulder street screenshot with the survivor visible.

## Hybrid contract
- Dive: camera sweep down from Mapbox eagle, brief fade, street fight renders on
  the local street renderer geo-anchored at the dive point (same sector streets/
  footprints/routes data — the fight happens on the streets you dived into).
- Ascend: returns to Mapbox eagle (one-click ascend already passes; keep it).
- Mode honesty extended: the status line must say which renderer is on screen
  (e.g. "MAP: MAPBOX LIVE" at eagle; street HUD names the street renderer).
- Do not regress: Mapbox engagement/gate, placement, ascend, wall-clock sim.

## Review arc (Game Design Tester, unsoftened)
#1 11/35 step back · #2 16/35 narrow forward · #3 18/35 (Mapbox LIVE first seen)
· #4 18/35 step sideways (clock + ascend fixed; street camera + spawn visibility
still critical; waves became too lethal once the clock ran true).
· #5 16/35 STEP BACK (hybrid handoff works + honest labels + instant ascend, but
the street renderer shows NO walkers, survivor spawns facing a wall, rifle
feedback invisible, CONTACT flash only in the radio log, Union still dies on
wave 3 with three towers). Fix brief #5 therefore carries PROOF gates: builder
must produce a street screenshot with a walker in frame and a selfPlay balance
transcript (station HP per wave) — code claims alone no longer ship.
· #6 20/35 STEP FORWARD — best score yet. All blockers pass live: street combat
real (walker in frame, one-shot kill proven by ammo/score/salvage deltas), WASD
moves, CONTACT banner on-map, street HUD clean, Union survives (100/78/78 live
with the canonical trio). BUT the builder's selfPlay claim of 100/100/100 was
NOT reproduced — wave 2's King West armoured leader leaks. Lesson recorded:
selfPlay must test plausible player placements and report worst case, not a
tuned best case. Remaining: leader leak, live-dive orientation (staged proof
faces correctly, live dives can still face a building), highlight≠valid lots,
feedback still not visible at tester frame rates (move hit feedback to DOM),
eagle fight readability.
· #7 21/35 step forward, narrowly (best yet; Grounding 4, HUD 4; placement
validity + all regressions pass). BUT the wave-2 claim failed live a THIRD
time: claimed worst-case leak 8, live leak 30 (Union 100→70). Working
hypothesis for the systematic selfPlay-vs-live gap: the tester's browser
runs at ~2 FPS / ~500 ms frames; if tower attacks resolve per render frame
instead of inside the fixed-timestep sim, live tower DPS collapses while
headless selfPlay runs at full rate. Brief #7 therefore gates on selfPlay
run at a DEGRADED 500 ms cadence as well as standard, and orders tower
combat fully inside the sim tick. Also: dive orientation still inconsistent
near Union (one dive faced a wall, one was perfect) — heading must be chosen
by longest-clear-ray scoring; hit feed STILL never seen (third claim) — hold
1.2 s + persistent LAST HIT readout + z-index above street canvas; eagle
tower fire invisible and close-zoom walkers shrink to dots — move eagle
combat feedback to the proven DOM overlay pattern.
· #8 16/35 STEP BACK (from 21). Mode gate PASS (MAPBOX LIVE). Genuinely
improved: hit feed + LAST HIT finally seen live ("LAST HIT ✕54 · HIT"), DOM
tower bolts visible in eagle, occupied-lot message, CONTACT/ascend clean.
BUT the headline failed a FOURTH time: build #7's selfPlay claimed wave-2
leak 4 at both cadences; live leak = 32, reproduced twice by the tester
(Union 100→68 wave 2; wave 3 ended 12% in run 1, 56% run 2). Dive facing
still broken differently: scorer reports "axis · clear 60 m" while the
screenshot faces a wall — the scored ray and the applied facing disagree,
and identical 60 m at two spots smells like a cap/default. Eagle walkers
still ~3 px dots at 35 m (canvas size floor never materialized). Draft bar
persists in street + after picks; dive click is intercepted by a selected
tower; camera drag fires the rifle; walkers invisible in street for most
of waves 3–4. DIRECTOR'S RULE CHANGE (brief #8): builder self-verification
is no longer evidence. Brief #8 leads with INSTRUMENTATION (live dev-panel
counters: sim-seconds vs wall-seconds, shots fired, damage dealt, gate
damage, per-route leaks — mirrored in selfPlay) to find the harness-vs-live
divergence before any retune; balance proof = degraded-cadence runs at
player-plausible placements only; dive proof = builder must LOOK at two
real-dive screenshots; eagle walkers move to DOM glyphs; V5 street visuals
wait for this truth build, because the skin must not paint over a broken
balance/facing base.
· V5 STREET VISUALS (Anand's order, Nov 4 14:19): "up the game — Division 2
rich environment — focus first on street level (maybe Atlas/Marble helps),
then eagle; story writer after; 1 at a time." Consults ran (consults-v5/:
Look/World/Perf); Director's spec = V5_STREET_SPEC.md (atlas facades not
shader, real lights capped 1 dir + flashlight + 2 pooled, Marble =
art-target only, budgets ≤150 draws/≤300k tris, ladder T3→T0 with
SwiftShader→T0 at start). Split into V5a "City skin" then V5b "Life".
Marble hero-street world generated (id 63c43220-5e9d-4aa1-bacb-d357956e8340),
4 stills + notes in consults-v5/hero-street/; Anand reacted ❤️ to the
reference stills (Nov 4, 14:59).
· #9 16/35 STEP SIDEWAYS (flat score, different composition). BREAKTHROUGH:
wave-2 balance PASSED LIVE, twice — leak 32 → 0, Union 100/100/60, dev
counters quoted verbatim (sim = wall every wave). The D1 instrumentation +
five-placement harness (build #8) is the first builder verification method
that live play confirmed. NEW CRITICAL REGRESSION from build #8's drag-fire
change: street UI clicks fire the rifle — ASCEND button shoots instead of
ascending (ammo 14→11 across clicks), SEND WAVE likewise; player trapped
without the M key. STILL FAILING (all "verified" by hooks/inspection, all
broken in pixels): dive orientation (both dives wall-facing under ">60 m"
claims — third round), eagle DOM glyphs never seen at 24–40 m in 4 waves,
street walkers absent for entire street stays (hit feed untestable).
Yonge wave 3 = systematic: gate 170 dmg, breach, exactly 40 leaked with a
Yonge-thin trio, both runs; Union fell wave 5. Mapbox flaky: 1 of 3 loads
latched fallback with no retry. DIRECTOR'S READ: the builder is now
trustworthy where it verifies with instruments/numbers, untrustworthy
where it verifies by inspection/hooks instead of rendered pixels — and its
sandbox cannot render the real (Mapbox) game. Brief #9 therefore changes
DESIGNS structurally: fire only from canvas-target pointer events (UI
physically cannot shoot); dive = road-centreline-anchored spawn with yaw
from road geometry (ray-scoring demoted to a log line); glyphs rebuilt on
the bolts' proven projection path; the fight routes to the dive street
during waves; Yonge-thin sixth placement gates waves 1–3; Mapbox gets one
auto-retry before fallback latches. Standing condition told to Anand: if
#10 fails on the same pixels-vs-promises pattern, the code-writing route
switches (Claude Code harness on the repo file).
· #10 15/35 STEP BACK (from 16). PASSED: click-routing regression genuinely
fixed (ASCEND/SEND WAVE/drag all clean, ammo unchanged), Mapbox live on
every load, Run A balance (wave-2 leak 0, Union 88% after wave 3), CONTACT/
occupied/placement/dive-auto-deselect/street draft chip. FAILED AGAIN on
the same pixels-vs-promises pattern: (1) NEW dive soft-lock — a
building-block click arms "SNAPPED LANDING NEARBY" and then ALL dives fail
until page reload; dive 1 also landed side-on with a slab intruding.
(2) Street fight: radio announces the routed column ("inbound on BAY ST.")
but no walker ever appears in the street frame — third round of street
combat not happening. (3) Eagle glyphs: still tiny white dots at 42 m;
bolts also unseen this round. (4) Run B (Yonge-thin) collapsed: wave-2 King
leak 28, wave-3 total 48, Union 24% — the builder's Python replica claimed
leak 4/4 and 92%; the replica does not reproduce live placements again.
(5) Eagle draft bar stopped dismissing after picks (flaky regression).
DIRECTOR'S DECISION — the condition set with Anand in advance is met:
the artifact builder is RETIRED for this game. Source of truth moved to
~/workspace/game-dev-factory/projects/toronto-td/game.html (git baseline
7e7b74b = build #9 as published); code now written by Claude Code under
Eve's direction per the claude_code_harness skill (Eve writes the ticket,
reads the full diff, verifies, publishes via push_toronto_td.py with
TORONTO_TD_GAME_SRC pointing at the project file). One fix per build,
tester verdict between builds. Ticket order: 01 street-fight arrival,
02 dive state machine + landing camera, 03 eagle glyphs, 04 run-B balance
+ draft-bar dismiss. V5 visuals follow on the same route once gameplay is
trustworthy.
· TICKET-01 (new route, first build): Claude Code's subscription login
had expired, so Eve implemented directly (standing fallback). Eve built a
headless harness (real game, own hooks + live sim sampling) and PROVED
the street-fight root cause: stepSim's chase block returned before the
march code, freezing detouring walkers at the 4.2 wu (56 m) chase radius;
moveChase's building rejection then pinned them inside footprints.
Harness before: party froze at 54-56 m, inside buildings, full HP, 25+ s.
Fix = one line (detouring walkers fall through to the march). After:
party reaches 6-9 m and attacks (survivor HP 100 -> 52), survivors
rejoin route, wave outcome unchanged. Project commit 18e356f, published
dc7f3ba, live verified. Tester re-review #11 fired on the street-fight
gate + regression spot-checks.
· #11 16/35 STEP BACK. The ticket-01 fix FAILED LIVE on the Mapbox build:
tester dived early in wave 3, waited 34 s of active wave — no walker
appeared, operator 100, rifle 12/12, panel claimed "routed R1 BAY ST."
ASCEND passed; counters near-clean (wave 2 sim 57 vs wall 59). New
evidence: BOTH dives (King click, Yonge click) snapped to the SAME
University Ave PATH spot near Union, and the spawn faced a wall — the
landing funnel + camera (ticket-02 family) are live in Mapbox mode.
Desk check: play.js serves no-store (tester WAS on the fixed build —
marker verified); the main loop is shared across modes (updateZombieMesh
unconditional, one scene) — so the divergence is in dive inputs/geometry
or party attrition in the Union kill zone, not the render loop. Next: a
live hook-driven diagnostic on the Mapbox build (diveAt mid-route,
hybrid() sampling) to bisect before any further patch.
· DIAGNOSTIC (manual, live Mapbox, one barricade, wave 1, dive on Bay):
operator HP 52 at landing, 40 at sim 16 s, regen to 100 — the ticket-01
party ARRIVES AND ATTACKS on the live build. Its HP bars were seen only
"beyond a wall/building at frame centre": the fight was off-camera.
· TICKET-02 (Eve, commit a1543a0, published 5527c57, served verified):
D1 'centre'-fallback dives now REFUSE ("No clear road near your click")
instead of silently landing near map centre. D2 after routing, survivor
+ camera face the nearest routed walker's bearing (harness FACING dot
1.000 vs party leader). D3 corridor-waypoint detour TESTED + REVERTED:
~1,700 m leg doubled time-to-contact, party died to route towers ~380 m
out, zero contact; chord restored. Ticket-01 scenario re-verified
(party to 6-10 m, HP 100->40). Tester #12 fired: fight-in-view, landing
honesty, regressions.
· RE-REVIEW #12 (ticket-02 build, live): 16/35 STEP BACK. Gate A FAIL —
wave-2 dive (King W click) landed Wellington W facing a wall, no party
in view, HP 100 throughout; wave-3 dive (Yonge click) landed Bay St,
same wall view, no fight. Gate B FAIL — dives 3 AND 4 (Yonge click;
building-block refusal test) BOTH landed "BAY STREET · NEAR HOTEL
VICTORIA" with NO refusal message; reticle still said "SNAPPED LANDING
NEARBY". So resolveLanding is NOT returning 'centre' for these clicks —
it returns snapped/direct AT the funnel spot, i.e. the click point
itself is already wrong on the Mapbox path (or findLanding's ok() only
passes near Union). D2 facing unverifiable live (nothing to face).
Also new: lock-aim click fired the rifle (ammo 11->10, LAST SHOT MISS);
HUD phase contradictions (WAVE ACTIVE + BUILD PHASE simultaneously).
· TICKET-03 (instrumentation, commits 2ea33c9 + bdf5a6b, served
verified): PTD witness line on the health chip — raw unproject lng/lat
+ world metres per pointer event, dive click point + resolveLanding
kind/result, final streetPos + yaw. Diagnostic run fired (3 scripted
dives: Yonge, King West, NE block) to discriminate pointer vs resolver
vs anchor from numbers, not theories.
· PTD DIAGNOSTIC (live): three intended targets (Yonge&King w330,55;
King&Spadina w-450,90; NE block w400,600) arrived as clicks w 1,-185 /
-61,-226 / 26,-143 — all near Union. res/land faithful (<=40 m / <=20 m
steps, kinds sane). VERDICT: the resolver was never the funnel — at the
low eagle elevations testers play at, the visible ground is a ~200 m
patch and clicks land near the view centre; the game showed nothing
about WHERE a dive would land. Bearing-facing (D2) also indicted: a
distant party's bearing cuts diagonally across intersections -> the
wall frames (3 landings, 3 walls).
· TICKET-04 (Eve, commit 733ef04, served verified): landing marker ON
the resolved point + street name, reticle chip names the landing street
(centre case now reads as the refusal it is); D2 reverted to
roadFacingYaw; street PARTY indicator (relative arrow + distance to
routed party/nearest contact, HUD cadence); first street click grabs
aim and never fires. Harness regression clean. Tester #13 fired with a
marker-based protocol: pan/zoom to the street first, screenshot the
marker promise, then compare the landing.
· RE-REVIEW #13 (ticket-04 build): 14/35 STEP BACK — PARTIALLY VOID.
The tester quoted PRE-T04 chip text ("LANDING CLEAR — CLICK TO DIVE")
and reported the marker, party chip and first-click rule "not found",
while the served build verifiably contains all three (curl byte-check
before AND after the run: 2,209,828 B, new strings present). The
review browser played/read a stale build. Same-point landing variance
across runs is real but explained: findLanding's ok() rejects
candidates within 17 m of a walker, so the snap target wanders with
wave traffic. Gate C caught real leakPts (12/28/0) in an undefended
run — expected, not a regression. Street-view wall/void + no visible
party in the automated browser remains UNRESOLVED and untestable
through this judge (4 FPS, synthetic drags).
· TICKET-04b: BUILD tag (T04-733ef04) stamped on the health chip —
every future review screenshot proves its build. Commits 05474c4 /
44da9a2. Fork put to Anand: play 3 min himself vs one more tester
round under build-tag + hard-reload protocol.
· TICKET-05 (Eve, commit aa09b39, served verified): eagle glyphs
13->18 px (22 tank/leader), shape language (walker circle, runner
diamond, tank square), type-coloured glow (was universal red — why
every glyph read as a "red dot"), white halo, bigger bars.
· TICKET-06 (Eve, commit 712ce3e): VERIFIED, NO CHANGES. selfPlay
gate 9 run in the harness (new `selfplay` mode): 12 runs, 6 placements
x both cadences — worst wave-2 leak 10 (bar 10), worst wave-3 Union
80% (bar 50), YONGE-THIN wave-3 leak 4 (bar 20). Draft-dismiss, phase
chip (single writer), send-wave disabled state all sound in code.
The #10-#13 balance/HUD complaints trace to the stale-build/review-
environment family. Street-mode live proof now waits on Anand's call:
play it himself vs one more tester round under the build-tag protocol.
· ANAND'S CALL (20:19): he tests it himself — on his PHONE. "Make it a
mobile playable version... it's easy for me to test using my mobile
rather than logging into my computer every time."
· TICKET-07 (Eve, commit 67b781f, served verified, BUILD_TAG=T07):
audit found viewport meta, FIRE button, ASCEND button and tap/pinch
already in; added the missing pieces — virtual joystick feeding the
WASD axes (updateStreetMove + doRoll), ROLL and RELOAD buttons
(coarse-pointer, street mode), and a TWO-TAP touch dive (first tap
previews the named landing + marker, second tap on the same spot
commits; centre taps refuse with the reason). Desktop flow unchanged.
The tester loop is retired for street mode — Anand's phone verdict
is the gate now. V5 follows his verdict.
· TICKET-08 VISUAL CHECK (BUILD T08 proven in the strip): EAGLE —
"unmistakably dark/night", routes the most legible element; buildings
still read flat from high altitude (Standard 3D objects are subtle at
range). STREET — facades CONFIRMED live: "clear grid of windows, many
lit warm-yellow / pale-blue, some towers much more lit than others —
no longer plain flat grey boxes." Lamp glows NOT seen (checker's
camera again angled over rooftops, ground out of frame; or points too
small at that distance — unresolved). Checker-only defect: canvas
went black after its aim-lock click (pointer lock in the automated
browser; the phone path uses drag-look, no pointer lock — deprioritised).
Anand's phone verdict is now the gate for V5b (Life: characters/props).
· TICKET-09 (commit 85d2f30, served verified, BUILD_TAG=T09): lamp
glow .55/.5 -> .95/.68; road ribbons roughness .96 -> .5 + colours
lifted; ground plane roughness -> .7. SPOT CHECK (BUILD T09 proven):
road surface NOW READS (lighter plane, distinguishable by tone; no
sheen visible from the checker's high angle). Lamp glows STILL not
seen — but the checker has never once framed street level at eye
height (always an angled rooftop view, camera tens of units out,
where a ~1-unit glow sprite is a few pixels). Code inspection says
the points exist (same function/group as the confirmed facades; a
throw would kill the buildings too). UNRESOLVED at checker's range;
Anand's phone at eye level decides. Also: canvas blacked out ~15 s
into street view in the automated browser (no aim click this time) —
suspected context loss in the checker environment (3 WebGL contexts);
not observed on the phone path; watch, don't chase.
· ANAND'S SCREENSHOTS (22:06): opens in the 3D canyon (EAGLE 180 M)
then "when i move mouse drops to the flat terrain view with bunch of
boxes moving." ROOT CAUSE (code-proven): applyQuality shed
show3dObjects at Q5; qualityTick stepped down after ~1.2 s <24 FPS —
tile streaming trips that on any real machine, so the first mouse
move flattened the city (his shot 2: mauve flat + pale slabs = the
Standard style's footprints with 3D off).
· TICKET-10 (commit bbd2025, served verified 2,218,209 B, TAG=T10):
show3dObjects + lampGlowMesh removed from the ladder (always on);
~10 s grace after style load (qGrace=16 ticks); step-down needs
~2.4 s sustained; eagle zoom capped 900 -> 700 m.
REGRESSION CHECK (BUILD T10, checker at 4 FPS, Q5 reached): after
~25 s of hard pan/zoom the buildings were "STILL extruded 3D towers
with visible height and sides." The exact bug conditions, survived.
· TICKET-11 (commit 4dad0d5/35090ba, TAG=T11): zombie body re-profiled
(hunch .4, arms, heading-from-movement), car cabins, survivor stripe
+ hood. VISUAL CHECK (T11 proven): NONE of it read — "still upright
pegs", "cars still plain boxes". Lesson: geometrically real != visible
at gameplay range.
· TICKET-11b (commit 2fb2173, served verified, TAG=T11b): exaggeration
pass — hunch bend .78 + .3 drop, arms .98 long/thicker, head r .27
low-forward, shoulders at 1.16, cabin taller + lighter glass.
STREET CHECK (T11b proven, hands-off landing frame): survivor detail
CONFIRMED — pale reflective band and hood roll both visible, rifle
visible. Zombie close-up UNTESTED: checker landed Wellington W and
wave 1 cleared elsewhere; no walker reached it in 60 s. The figure
read at fight range is Anand's phone test now (dive onto Bay/King/
Yonge mid-wave, where the columns actually march).
· ANAND'S RULING (Nov 4, 23:53, phone screenshot of the flat canyon):
"Nope — don't waste my time. I want AAA graphics — realistic like
Division 2, use proper assets, atlas, marble whatever." Primitive
polish is CLOSED. New route: street environment = Marble.
· MARBLE STREET PROOF (live Nov 5, ~00:10): proof.html + street.spz
(500k splat, 7.8 MB) + proof-fallback.jpg pushed to the toronto-td
repo (commit 9a66bb7; publisher FILES extended — the tree rebuild
deletes unlisted files). Git pushes do NOT auto-deploy this project:
a manual create_deployment (dpl_2Xw3GLqvQSzBFZ8Ux5JX5KhQ32mf) put the
statics live; /play unaffected (edge function reads the repo live).
Orientation MEASURED from the collider GLB: Marble space is Y-DOWN,
ground slab at y=+0.65 (dense max), towers to y=-18; proof flips
rot.x=PI, scales by metric factor 3.2466, ground -> y=0; a FLIP VIEW
button covers a wrong call. Spark + three via jsdelivr importmap;
14 s no-render watchdog falls back to the hero still. NOT
screenshot-verified (VM WebGL capture stalls) — Anand's phone is
the judge, per his doctrine.
· GOOGLE TILES PROOF (live Nov 5, ~07:35): Anand proposed Google
Maps tiles himself; key connected via vault (custom.google-maps-
platform), VERIFIED live (root.json + child .glb 200 through
gmaps3d.py). Sector mirrored server-side: fetch-sector (ge cap 20)
= 392 files / 38.6 MB for the 2x2 km Union sector, self-hosted
under gtiles/ (Google URIs carry ?session= from the referencing
tileset — helper appends it; external .json sub-tilesets nested).
gproof.html = three 0.180 + 3d-tiles-renderer 0.4.10, ENU frame at
sector centre, dusk grade (textures are baked daylight — honest
chip on the page). Push commit f5d256d. Vercel create_deployment
now 403s (team scope anand-inbasekarans-projects needs Anand's
re-auth) — proof served instead via GitHub Pages on the same repo:
https://anandin.github.io/toronto-td/gproof.html (verified 200s:
page, tileset.json 199,730 B, sample tiles; /play untouched).
Split stands: Google = city/eagle, Marble = street/night.
· SHOP CONSULT — DIVISION 2 (Nov 5, morning): Anand rejected the
bubble compromise ("I want division 2 level experience — talk to
your game dev shop"). Three seats consulted (Designer Astra,
Engineer Sol, Architect Fable; full texts in consults-v5/
shop-division2/). UNANIMOUS: the renderer was never the problem —
Division 2's look is AUTHORED GEOMETRY; boxes/splats/Google mesh
each fail at eye level for physical reasons. Route C: stay
Three.js/web (Godot web = Compatibility renderer, no gain;
pixel streaming = demo-only economics), build ONE real block
(Front St W, Union, ~150 m) from purchased modular kits fitted
in Blender to the real footprints, baked night lightmaps, real
rigged characters, 30 fps phone contract. Honest ceiling: one
directed night street can feel close; citywide AAA breadth can't.
Dive contract revised: street dives only in built hero sectors
(marked on the eagle map) until blocks expand. Architect first-
milestone full freight $5–8k incl. contract artist; asset-only
envelope US$500–2,000. Awaiting Anand's call on the asset budget;
listings itemized BEFORE any purchase.
· ANAND'S CORRECTION (Nov 5, 13:01): the Route C consult framed a
decade-old pipeline (buy kits, hire Blender artist, 6-8 weeks).
His ruling: with Atlas / Marble / Meshy-class AI generation,
assets and worlds are made in minutes — AI GENERATION FIRST is
the shop's doctrine now. Generated MESHES (Meshy/TRELLIS class)
are real geometry (no splat melt); the kit-buying plan is
superseded. Meshy API key requested via vault (Nov 5); open-
source generators on the RunPod GPU box are the backup route.
· SHOP AUDIT (Nov 5, afternoon): at Anand's direction the full
factory prompt pack went to two reasoning models (Fable, Astra —
consults-v5/shop-audit/). Convergent verdict: the shop's defect
was missing INTEGRATION ownership + an asset ladder that made
generation the last resort. Rebuilt: POSITIONS.md + CAPABILITIES.md
now govern pivots; new roles World Stitcher, Asset Generation
Lead, Character Pipeline, GPU Ops; Godot parked for Toronto TD.
THE STITCH (adopted): L1 Google tiles (night-graded) / L2
generated meshes 35-120 m / L3 one Marble splat 0-35 m inside its
measured radius / L4 skinned GLB actors via a Presenter layer on
the untouched sim / collision from merged proxies (three-mesh-bvh)
/ ShadowMaterial floor for actor grounding. Atlas demoted to
registration + seeds until proven. SINGLE SCENE = "Hold the
Square", Yonge & Dundas. Reskin verdict: Anand right on leverage —
the swap is a presenter layer (~40% of scene effort), not a
texture change, and only lands inside the stitched environment.
· GOOGLE-STREET PIVOT (Nov 5, ~15:38, Anand's direct call: "Use
Google's real streets at street level too"): L3 is no longer the
Marble splat. The walkable street base is Google Photorealistic 3D
Tiles at finest LOD — real geometry, no melt at any range — with
generated dressing (streetcar, storefront shells, props) covering
the near field where aerial textures run soft. Marble Dundas world
demoted to night-mood reference/backdrop. Atlas bridge spike parked
(its job was rescuing the splat; no splat core remains). Why the
prior position was wrong, per POSITIONS.md discipline: Anand's
melt eye-test on the proof + the real-geometry law + this direct
instruction supersede the stitch's L3.
· MIRROR GOTCHA (measured Nov 5): fetch-sector flattens the Google
tileset — root transform dropped, globe-sized bounds, and tile GLB
node matrices land in a permuted frame W = (ecef_x, ecef_z, -ecef_y).
TilesRenderer on the flattened mirror CANNOT place tiles (this
likely affects the unverified gproof.html too). Working route:
offline merge (merge_tiles.py) — decode GLBs in float64, permute to
ECEF, convert to ENU at the anchor, re-emit chunked GLBs in the
scene frame (x east, y up from measured ground band 54.041 raw,
z south). Result: 31 tiles within 130 m, ge<=6 -> 18 chunks, 45,222
tris, 2.7 MB total in hero-tiles/. Runtime = plain GLTFLoader +
MeshBasicMaterial night grade (pre-lit rule) + ShadowMaterial floor.
· MESHY WEBSITE GRAB = DEAD ROUTE (Nov 5, evening): two browser
passes failed (login agent stall; Anand's own takeover hit a
vanishing-window UI fight; his call: "not working - you figure out
a different path"). Replacement: generate the 11 library-slot props
via the Meshy API (gen_props.py, text-to-3D preview+refine, 15
credits each) — the route already proven by the characters. The
CC0 library picks remain catalogued in assets-gen/meshy-free/
manifest.json if ever needed.
· CHARACTER MEASUREMENTS (Nov 5): Meshy rigged GLBs are NOT in
metres — survivor bounds 24.6 x 104.7 x 19.0 units (height ~104.7
units for the 1.75 m rig) and feet sit ~9 units below origin.
Presenter normalisation must measure skinned height, scale to
1.75 m, re-floor to y=0. 1 material + 3 images per character;
24 joints; anim GLBs carry named clips (walking_man,
Shot_and_Fall_Forward, ...) on the same skeleton. Prepped props
verified true-metre, feet at 0: streetcar length along Z (28 m),
barrier length along Z (3 m), storefront 10 m wide on X,
streetlight 9 m with arm along Z.

## T12/T13 — Hero scene integrated + presenter layer (Nov 5, evening)
- **T12**: Yonge & Dundas hero scene (Google photorealistic mesh chunks +
  authored dressing) loads lazily and swaps in when a dive lands within
  120 m of the anchor (-1.21, -46.44 world). Non-hero dives untouched.
- **Scale truth (found the hard way)**: the sim lives in sector units
  (1 unit = 13.3 m) but street actors/camera are authored at ~1 unit =
  1 m. The hero environment therefore renders in TRUE metres via a
  presentation expansion about the anchor (K = 1/WORLD = 13.33):
  survivor/camera/zombies/towers/fires/tracers/hp-bars transform x/z
  about the anchor when hero is active; pairwise vectors are preserved
  so sim hit math stays exact. Fog swaps .013 -> .0042 in hero mode.
  Gates hide in hero mode (their sim positions are ~1 km out).
- **Chunk culls 6-9** in merge_tiles.py: drape (floating sheets over
  road bands), webbing (huge gap-spanning triangles over the open
  intersection), grounding (edge-connected components must touch the
  ground), occupancy (measured street grid: triangles floating over
  empty cells or >3 m above their cell's tallest surface are smear).
  Remaining known artifact: facades' own melted skirts at the
  frontages (inseparable from the facade mesh) — the L2 authored
  podium-shell occlusion row is the planned fix (T14 candidate).
- **T13 presenter**: vendored three r128 GLTFLoader + SkeletonUtils
  (lib/), Meshy survivor + zombie combined into single GLBs with six
  clips each (idle/walk/run/attack/hit/death) at chars/*.glb (~2 MB).
  Survivor swaps for the primitive figure in hybrid street/diving;
  nearest 16 zombies get skinned clones (instanced stand-ins zero-
  scaled), kills spawn a death-clip corpse that sinks after 2.8 s.
  Clip timeScale is driven by MEASURED visual velocity, so it stays
  correct in both actor space and hero space.
- **Meshy armature trap**: the armature node carries scale 0.01 which
  the bind matrices already compensate — the file renders true-size at
  group scale 1. Normalizing by hierarchy Box3 measures the 0.01 and
  builds a ~100x giant. Scale from GEOMETRY bbox height instead.
- **Zombie third arm removed**: weld + loose-parts in Blender isolated
  a 656-vert duplicate forearm island behind the left arm; deleted,
  clips intact (6 clips, 72 channels after Blender re-export).

## T14 — Warp button + the local-mode hybrid fix (Nov 5, late evening)

Anand's phone test of T13 exposed a structural miss: on the GitHub Pages build (local renderer), a REAL dive never entered hybrid street — `enterHybridStreet()` was gated on `mapMode` (Brief #4 era). The hero scene and the skinned presenter are both hybrid-only, so on that build neither could EVER appear outside the QA hooks. His Bay St screenshot showed the primitive survivor and the plain sector street, correctly. Fixes:
- `beginDiveAt` now calls `enterHybridStreet()` in both modes (the mapMode-only camera reframe stays mapMode-only). Local street = hybrid street, same as the staging hooks always exercised. Verified: streetProof regression green; warp probe reaches hero active in street mode.
- Eagle panning on a phone is miserable (his words), so navigation to the hero is now one tap: gold **★ YONGE & DUNDAS — DROP ME THERE** button (top-centre; hidden while already inside the hero scene) — ascends first if in street mode, then dives at the anchor via `beginDiveAt({kind:'direct'})`.
- Correction owed and given: the T13 message's "the survivor swaps in a few seconds after you enter street mode" was false for the Pages build. True from T14 on, for every dive.

---

## STYLE LOCK — NEON NOIR (Anand's pick, Nov 5, 2026, Game Dev Shop chat) — ⚠️ SUPERSEDED Nov 6, 2026: rejected on Anand's phone test ("way far from what the final outcome should be"). See the PAINTERLY final lock below. Kept for the record.

Anand chose **Neon Noir** from three pictured concepts (Comic Ink / Neon Noir / Painterly; concepts in `~/workspace/game-dev-factory/research/toronto-style/`). This is the game's locked art direction, same status as Elveswhere's Fairy Miniature lock.

**The look:** perpetual rainy night on Yonge Street. Wet streets mirror-reflecting neon (red / cyan / magenta, anchored on real signage — Shoppers, Eaton Centre, the Square's boards). Fog and deep shadow swallow distance. The CN Tower is a lit landmark (pink/red), never a grey silhouette. Zombies read as dark shapes moving through neon pools and fog; the survivor and muzzle flashes are the brightest things on screen.

**How it is built (engine-agnostic on purpose):** the noir is a full-screen treatment — night grade, neon bloom, wet-ground sheen, fog, grain — poured over whatever city geometry the engine route lands on. It does NOT require photoreal street mesh; darkness + reflections + fog carry the look and forgive lumpy geometry. This lands directly on the Nov 5 engine-route debate: the style no longer argues for the Google photogrammetry street route (whose pre-lit daylight mesh already failed on Anand's phone); it argues for the route that gives clean night lighting control.

**Eagle-view safeguard (Eve's flagged risk, accepted with mitigation):** full noir is a street-level treatment. The eagle/command view gets a readability variant — fog lifted, building masses edge-lit by neon spill, attack routes stay attack-red and the most legible element (already proven in the Ticket-08 night check). Strategy readability outranks mood at altitude.

**Discipline:** never day (already V4 law — dusk is now only a brief transitional grade at most; night is the game's home). Neon palette is locked: red / cyan / magenta on near-black blue-grey. No other accent colours except gameplay signals (attack red routes, objective gold).

## T15 — Neon Noir look slice SHIPPED (Nov 5, late evening)
Anand locked Neon Noir (Game Dev Shop chat, from pictured concepts) and ordered the build. Slice live at https://anandin.github.io/toronto-td/noir.html (separate page, game untouched): modern Three.js r170 (vendored lib3/), the intersection's REAL footprints extruded with procedural lit facades + emissive windows, authored shopfront band, neon signs (EATON/DUNDAS SQ/YONGE/RAMEN/PHARMACY/CINEMA), wet-street planar mirrors under an asphalt skin, rain, fog, bloom + ACES + grain/vignette grade, Meshy survivor under a streetlight, two zombies drifting through the neon pools, STREET/EAGLE toggle (eagle = lifted fog, dim constellation city). No photogrammetry anywhere. Lessons banked: (1) r155+ physical lights — point pools need decay 2 and modest intensities or pale props clip white; (2) the Hunyuan storefront prop has a near-white baked texture — dropped, replaced by authored shopfronts; (3) sector footprints include underground/square structures spanning the road corridors — filtered by centroid-in-corridor rule; (4) SwiftShader eagle-transition "failure" was a probe artifact (verified via camPos state + snapped frame). Gate: Anand judges the direction on his phone; yes → generalize the kit across all 6,056 buildings + reconnect the sim (est. 2–3 wks).

## T16 — Direction flip: Neon Noir → Pencil Sketch (Nov 6)
Anand judged the noir slice overnight: "way far from what the final outcome should be — flip to the pencil sketch styling." Reversal recorded in POSITIONS.md (the crew optimized for his stated AAA references; his gut wants a drawn world; the gate did its job cheaply). Sketch slice shipped same morning: https://anandin.github.io/toronto-td/sketch.html — same Dundas scene/data, paper-bright render + one post pass (hatch bands by luminance, Sobel drawn edges, paper grain, hand wobble), graphite signage, no bloom/mirrors. Street frame reads as a hand-drawn intersection; eagle frame reads as an architectural sketch. Publisher repaired en route: repo outgrew single-shot Git Data tree creation (422 timeouts) — push_toronto_td.py is now incremental (local blob hashing vs tip tree, base_tree commits; 471 files skipped, push takes ~10 s; files dropped from FILES are no longer auto-deleted).

## T17 — Pencil Sketch rejected too; Comic Ink + Painterly slices shipped (Nov 6)
Anand on the sketch slice: "Not it — how about comic ink version and another painting version like in pic you created." Both built on the Dundas scene (+horde staging in the intersection): ink.html — Comic Ink (cel posterize, thick Sobel ink lines, desaturated with red/orange protected, halftone shadows, cracked-window facades, storm-grey overcast); paint.html — Painterly (dusk amber sun + teal ambient, Kuwahara oil pass radius ~2.4px, warm grade + canvas grain, amber-lit windows/signage). Game Dev Shop's standing advice aligns: they ranked Comic Ink #1 for this game (most forgiving of lumpy geometry; ink-silhouette horde = best sniper readability) and Painterly fastest (Ridge storybook pass exists). Their Sumiro lesson governs the endgame: whichever he picks gets locked with zero exceptions. Awaiting Anand's phone verdict.

## T18 — STYLE LOCKED: PAINTERLY (Nov 6)
Anand's verdict: Painterly beats Comic Ink ("comic ink is very dark" — on his phone the ink grade reads darker than check frames showed). PAINTERLY IS THE FINAL LOOK for Toronto TD, superseding the Nov 5 Neon Noir lock. Definition of the lock (zero exceptions, Sumiro rule): perpetual dusk — low amber sun (0xffa257) + teal ambient (0x5d7f88), warm-brown/teal-grey procedural facades with amber-lit windows, Kuwahara oil-paint post pass + warm grade + canvas grain + brush blotches, CN Tower as a dusk silhouette. Slices of record: paint.html (the winning test), ink.html, sketch.html, noir.html — all stay live. Production: step 1 = full-sector painterly city (paint-city.html); step 2 = port treatment into game.html on Three r170 + reconnect sim; step 3 = phone acceptance (7 tests, SCENE_HOLD_THE_SQUARE).


---

## FINAL STYLE LOCK — PAINTERLY (Anand's verdict, Nov 6, 2026, Toronto thread)

**PAINTERLY IS THE LOOK. Final.** Chosen by Anand's eye on real, playable slices on his own phone — not concepts, not checker frames.

**The road here (all Nov 5–6):** Neon Noir locked Nov 5 evening → rejected on his phone test ("way far from what the final outcome should be") → Pencil Sketch slice built, rejected within a minute ("Not it") → Comic Ink and Painterly slices built on the same Yonge & Dundas scene, horde staged in the intersection (playable: https://anandin.github.io/toronto-td/ink.html and https://anandin.github.io/toronto-td/paint.html) → **Painterly wins.** Anand, verbatim: "I like painterly, comic ink is very dark." On his phone the ink grade reads darker than check frames suggested — the owner's phone is the judge for grade/brightness, always.

**The look:** dusk, amber-and-teal palette (the Nov 5 concept painting is the target picture, kept beside the work per the Sumiro method). A Kuwahara oil-paint pass turns every surface into visible brushwork; canvas grain over the whole frame. Warm, painterly, alive — the opposite pole from the rejected night grades. **Zero exceptions** (the Sumiro lesson): the treatment covers city, characters, effects, everything, or the clash comes back.

**For the record:** the crew ranked Comic Ink first on readability grounds (ink silhouettes = spot, judge, shoot). The owner's eye overruled on brightness and mood on a real device. Both facts stay in the file — readability mitigations (silhouette discipline, rim light, signal colours) are to be carried INTO the painterly treatment rather than relitigating the style.

**Production:** step 1 — full-sector painterly city — underway in the Toronto thread (Nov 6).

## T19 — Painterly production step 1: the full painted city (Nov 6)
paint-city.html live: all 5,975 sector buildings (2000 m box; CN Tower record excluded and authored separately at its real position −555/+1493) chunk-merged into 584 meshes, real road network as ribbons (1,777 roads), Dundas hero dressing/actors/signage intact, Kuwahara pass over everything. Eagle reframed for command view (target −60/430, r≈700, h≈1060, fog 0.00022) and brightened for city scale (hemi ~2, sun 2.6, lighter roofs/facades). Publisher lesson of the day: Pages lag hit ~15 min on this push (raw GitHub had it immediately) — verify raw before concluding a push failed. Next: step 2 = port the treatment into game.html (r170) + reconnect the sim; step 3 = phone acceptance. Perf on phone unmeasured — adaptive resolution (Sumiro trick) is a step-2 task.

## T20 — Painterly v2: crisp + Toronto identity (Nov 6)
Anand's phone feedback on the city: "very hazy cloudy" and "in eagle I can't differentiate this city from any other city — Google Maps did a good job of that." Fixes shipped (paint-city.html v2 + crisp ported to paint.html): CRISP — eagle fog 0.00022→0.00007, street fog 0.0085→0.0068, Kuwahara step 0.8→0.62px, a whisper Sobel edge (×0.16) inside the paint pass, contrast curve + less black-lift, pixelRatio back to 2. IDENTITY — the real towers carry their real colours, matched by height+location in the extractor: First Canadian Place white (292m), Scotia red-brown, TD towers black, Royal Bank Plaza gold, Aura dark glass; Union Station pale roof; Lake Ontario shoreline polygon + Toronto Islands strip; Rogers Centre dome authored beside the CN Tower (footprints within 115m skipped); low-rise (<15m) moved to a calm low-contrast facade so the core pops; eagle re-framed as a postcard orbit (r1150/h1250) that keeps lake+tower+dome+core in one frame. Verified in check frames: landmark cluster + dome + lake all read; street slice visibly crisper.

### T21 — Hybrid ruling + blend proof shipped (Nov 6, ~10:50 EST)
- Game Dev Shop ruling (full text: consults-v7-hybrid/shop-ruling.md): YES to the
  hybrid, three conditions — (1) the dive is a SWAP not a blend: tiles own >~150 m,
  authored city below, crossing hidden inside a ~1 s PAINT-WASH (paint spikes, world
  swaps under it — "the world gets painted as you descend"); dives land only where
  authored city exists. (2) Eagle "mild" = grade-led: one shared amber/teal LUT +
  grain, Kuwahara at LOW mix (0.2–0.3) with a SMALL kernel — the paint-city haze was
  a wide kernel smearing detail; at eagle, detail IS the identity. Mix altitude-
  driven, rising toward the swap band. (3) Eagle dusk = golden late afternoon,
  never night (night over daylight tiles reads as a filter on a photo).
- WARNING (ToS): altitude changes nothing — the exposure is the offline tile
  MIRROR in the repo, not the display layer. Proof on the mirror is fine;
  production must stream via the official API so the compliant path is a swap,
  not a rebuild. Published build = mirror goes, terms get a real read. Anand's
  risk call. Insurance if tiles ever come out (ranked): satellite ground drape,
  ~15 true-shape hero landmarks, road hierarchy as lit web, labels last — 1–3
  worth building regardless.
- PROOF SHIPPED: blend.html (commit cf943d2). Google fine tiles (gtiles-dundas
  mirror, ge≤6) merged at r=1000 → blend-tiles/ 178 chunks, 25 MB (merge_tiles.py;
  NOTE the staging gtiles tileset bottoms out at ge 16.05 — only the dundas
  mirror has the fine tree). Architecture per ruling: tilesG vs authored groups
  swap at eagleT 0.5 under a wash (uWash veil + paint spike to full), uMix
  altitude-driven 1.0 street → 0.26 eagle, golden grade, authored roads + lake
  stay always-on as the ground web. Eagle framing tightened to r540/h500 on the
  core (mirror fine coverage is only ±~450 m — the 2 km postcard framing dwarfed
  it; full-sector eagle awaits the streaming path).
- Checker frames: street = the known painterly block ✓; eagle = the REAL core
  (bank towers, Aura, real rooftops/street web, CN Tower in haze) under the
  golden grade ✓ — verdict is Anand's phone, per the shop's two questions:
  (a) eagle unmistakably Toronto AND same game as paint.html? (b) one dive
  through the wash — does the swap disappear?

### T22 — Vista addendum to the hybrid ruling (Nov 6, shop)
- Vista applies in exactly TWO places — the frames every player always sees:
  (1) THE LANDING VISTA: Yonge & Dundas built to match the target painting, not
  the procedural average — wreckage dressing, jack-knifed streetcar, dramatic
  sky backdrop, horde staging. (This is the production pass that closes the
  "street foreground flatter than the concept picture" gap.) (2) THE DIVE
  FRAME: the paint-wash is a composed vista — one target frame (eagle Toronto
  dissolving into painted street), wash tuned to match it.
- Vista does NOT apply to the eagle layer (geography is its truth — grade it,
  don't art-direct it) or the full sector. Rule: the treatment covers the
  world; vistas compose the moments.
- Build consequence: production step 2 gains a vista pass at the Dundas corner
  (streetcar + wreckage + sky + horde staging, tuned against the original
  amber/teal concept painting) and a composed dive-frame target for the wash.

### T23 — Anand's phone verdict on the blend + details rounds 1–3 (Nov 6, ~11:10 EST)
- VERDICT (10:55, with phone screenshot): "A lot lot better — we are getting in
  the right direction." Hybrid CONFIRMED by the owner. His one callout: "check
  the street which is just brown paint — need to change it etc" (the eagle
  ground/roads reading as flat brown).
- Details rounds on blend.html: (1) ground disc got a real urban canvas texture
  (block tones, grain, seams) instead of flat 0x5a4c3c; roads lifted to y .14 in
  cool asphalt so the web survives over tile ground; street texture rebuilt
  layered (stains, repair patches, jagged cracks, aggregate speckle, worn
  dashes). (2) Counter-tinted the ground COOLER (#54575a) so the warm rig lands
  it neutral; texture contrast raised to survive the light pool; heroSpot
  210→125, angle .62→.5 (the giant amber pool was the street-level "brown
  paint" all along). (3) Block-variation alpha softened (quilt effect), roads
  lightened to 0x43484e = the lit-web read. Published (see repo tip).
- Still open at eagle: mirror coverage ±~450 m (production = API streaming);
  the tiles' own shadowed ground in the core is real Google ground — fine.

### T24 — Move 1 shipped: we own the ground (Nov 6, ~11:30 EST)
- Anand's annotated verdict on the blend eagle (11:14): blue-circled street =
  "ok" (Google's real street texture); green-circled west/southwest = "still
  the same" brown — Google's baked ground is inconsistent (detailed asphalt in
  one block, red murk in the next). Street level: "we need true to real
  painterly — the building slaps 'Eaton' but its not Eaton Center looking."
- MOVE 1 (Eve's proposal, Anand "ok"): ground-skin.jpg — city-roads.json
  (1,777 roads) rasterized at 2048² over 3×3 km (make_ground_skin.py): sidewalk
  edges, asphalt tiers by width, lit centre thread on majors, blotched block
  base. blend.html lays it at y 0.25 over ALL Google ground; the ribbons mesh
  is gone; lake raised above it. Checker eagle: one consistent ground system
  core-to-surround, roads thread the correct canyons — patchwork gone. The
  surround reads map-like where no buildings stand (mirror coverage) — that
  fills in with production streaming.
- MOVE 2 queued (vista): model the REAL corner — Eaton Centre galleria vault +
  Yonge face, 10 Dundas East, Square media towers — painterly materials,
  replacing the sign slabs.

### T25 — Move 2 shipped: the real corner, hero-modeled (Nov 6, ~11:45 EST)
- City loader now SKIPS the Eaton block (x −100..−11, z 8..310) and the Square/
  10 Dundas block (x 12..130, z 8..100); hero models stand there instead.
  EATON + DUNDAS SQ text signs DELETED (they were also on the wrong corners).
- Eaton Centre: 288 m Yonge facade (stone panels, window bands, lit storefront
  texture), glass entrance pavilion at the corner, the GALLERIA VAULT behind
  (extruded half-disc r12.5, teal glass + 9 steel ribs) over a back slab. Note:
  the vault is hidden from Yonge street level by the facade itself (true in
  real life too) — it earns its keep in the dive frames.
- SE: plaza slab, media pillar at the corner (screen-wrapped, emissive), 10
  Dundas East mass with a full screen north face + screen tower.
- Dusk-glow fix: Eaton faces were a black void on the shade side — face
  materials now carry emissiveMap (the texture itself) at .38–.45, so the
  storefronts/windows glow regardless of sun side. Checker SW frame: glowing
  pavilion + lit bands — reads as the mall, not a slab.
- Still open in the vista: streetcar + wreckage + horde staging (T22 list),
  and a black hoarding-like band under the north-side buildings (pre-existing
  facade bases) for the next detail round.

### T26 — Brown flood fixed (Nov 6, ~12:35 EST)
- Anand on the vista build: "nope — the street is flooded with brown."
  ROOT CAUSE (mine): the ground skin (an eagle-altitude texture, 1.5 m/px)
  lay at y 0.25 ABOVE the authored street sheet (y 0.02) — at street level
  you were standing on a smeared map, not the asphalt. Compounded by the
  amber light pool + warm sun/bounce.
- Fix: skin is now a ShapeGeometry with a 224×224 m HOLE over the authored
  core (UVs via repeat 1/3000 + offset .5), so street level shows the real
  street sheet again (cracks, worn dashes, patches all back). Light rig
  cooled: sun 2.2→1.85, hemi ground bounce 0x3a2c20→0x2e2a26, heroSpot
  125→95 with a tighter, paler cone. Eagle verified intact (hole invisible
  from altitude; Google ground fills the core). Published.
- Lesson pinned: every ground layer must declare its altitude band; a layer
  built for one band silently poisons the other.

### T27 — Eve's judgment on Anand's two frames + fixes (Nov 6, ~12:50 EST)
- Anand sent phone frames (Eaton pavilion street view + eagle) and delegated
  the call: "you be the judge."
- VERDICT delivered: hybrid thesis PROVEN by his eagle (unmistakably Toronto,
  same grade as street). Two style breaks in his street frame: (1) the Meshy
  dressing props render as unpainted pale CLAY (bus/tram blob, white car,
  sandbags) — worst offender; (2) crosswalk stripes oversized/saturated tan
  planks. Eagle surround = the skin reads as an empty city PLAN around the
  island (coverage stopgap showing).
- Fixes shipped same turn: per-prop palette tints at load (streetcar TTC red,
  sedan steel, wrecked-car rust, barriers khaki, steel for gantry/lights —
  wrecked-car verified rusty in checker frame); dressing moved into the
  authored group where it belongs; crosswalks narrowed (13px), alpha
  .09–.16 with worn gaps; skin v2 darker blocks (73,71,67) + dimmer thread +
  eagle fog .00016→.00019 (checker eagle: surround recedes, island pops).
- Still honestly open: the streetcar is a tinted blob, not a streetcar — the
  purpose-built jack-knifed streetcar is the vista's next piece; the surround
  is a stopgap until production streaming; Eaton pavilion texture repeats
  mechanically up close.

### T28 — The streetcar, settled with the full toolkit (Nov 6, ~13:05 EST)
- Anand on the tinted blob: "i still see ttc as a blue patch" — diagnosed:
  the LIVE Pages file already carried the red tint (grep-verified) and the
  material reads #a8342a locally — his phone held the cached pre-fix page.
  But the deeper truth stood: a tinted blob is still a blob.
- Anand: "do whatever you got as skills — check dev shop too." Shop's
  GrokBot teardown learnings applied: (1) hand-built quality where the
  action is (kill-zone doctrine), (2) perf surgery — decoration does NOT
  cast shadows (applied: all dressing props castShadow=false), (3) Google
  fails only inside the ground-level melt — our street fight confirmed.
- Ran the factory both ways: hand-built a procedural CLRV (livery canvas,
  roof arc, pantograph — read honestly as a streetcar) AND generated a
  Meshy text-to-3D TTC streetcar (preview 01a1b1ff + refine 01a1b201,
  579-credit balance, GLB 5 MB → hero-tiles/dressing/ttc.glb).
- VERDICT on frames: Meshy wins outright — true CLRV nose, destination
  blind, wipers, mirrors, TTC nose lettering, proper window pillars; in
  the paint pass it sits IN the painting. Wired as primary at the
  jack-knife pose (-1, 0.5) rotY 0.85, bbox-normalized to 15 m; the
  procedural car remains as automatic fallback if the GLB fails to load.

### T29 — Shop's GrokBuild learnings, adopted for step 2 (Nov 6, ~13:00 EST)
From the Game Dev Shop (Anand: "take your learning and apply"; full doc
~/workspace/game-dev-factory/research/GROKBUILD-SNIPER-TEARDOWN.md):
1. CLIP-AND-REPLACE for dive/hero zones: shader clip box in the Google
   city, authored courtyard seated inside it — upgrades the landing-vista
   plan; the paint-wash swap still covers the transition. (Blend proof
   already rhymes: skin hole over the authored core + layer swap.)
2. OPTIC-AWARE STREET SCOPE: AO/blur radii track FOV, bloom/fog ease while
   scoped, grade sharpens only while scoped, adaptive ladder NEVER changes
   render scale while scoped.
3. __game-style test hooks are factory law — fixed-step advance, scene
   stats, view explainer — ship with step 2. (Blend already carries
   __noir + __dbg.)
4. Perf discipline WITH RECEIPTS: props off shadow/reflection passes
   (applied to blend dressing in T28), simplification at load, before/after
   tri + draw counts in the step-2 handoff.
5. Streamed tiles at runtime with attribution is the compliant path;
   GrokBuild's repo is a working reference (3d-tiles-renderer + build-time
   key injection).
Shop's closing note matches our plan: the clip technique is proven, the
DRESSING is the hard part — the landing vista is built to the painting.

### T30 — Street View: REFERENCE ONLY (Anand's decision, Nov 6, ~13:19 EST)
- Anand asked whether richer Google APIs (Street View) could carry the
  street layer. Eve's assessment: pano photos shear under movement (no
  geometry), the license is viewer-only, and streamed Photorealistic 3D
  Tiles are the rich compliant path for the air. Anand's call: REFERENCE
  ONLY — Street View art-directs the authored corner (storefront rhythm,
  sign heights, glass placement); nothing of it ships in the game.

### T31 — Shade-side round: what was ACTUALLY wrong (Nov 6, ~13:25 EST)
- Anand's screenshot + "nothing changed significantly in the last 3 rounds"
  — fair. Diagnosis from HIS angle (looking SW): every prop's SHADE side
  crushed to silhouette under a SW sun, and six dressing types were never
  tinted at all — pure white clay (sandbag-stack, barricade-fence,
  concrete-barrier-wall, construction-barrel, fire-hydrant, rubble-pile),
  glowing under the hero spot. Tints alone couldn't fix shade crush.
- The material fix (not knobs): every textured material carries its own
  map as warm emissive (0.38; car 0.42; barrier 0.1; wrecked 0.22) so the
  shade side holds its colour — the same dusk-glow trick that saved the
  Eaton facade in T25; mapless clay gets full palette coverage + 0.12
  self-emissive. Hero pool softened (78, penumbra 1.0, no visible edge),
  hemi bounce neutralized (0x35322e, 1.42), crosswalks faded to 0.04–0.085
  alpha (painting level).
- Verified from HIS viewpoint (yaw 2.5, looking SW): streetcar flank reads
  cream/red, sandbags sit muted in-scene, fences read as red construction
  markers, no white blowouts. Lesson pinned: verify from the angle the
  player actually stands at — Eve's checker kept choosing the sunlit side.

### T32 — Phase B: Anand's seven defects fixed (Nov 6, ~15:32 EST)
Play-test fixes, all verified headlessly, published d832578: (1) collision
— 2 m footprint grid + explicit colliders; Eaton wall stops him exactly,
streetcar OBB blocks; collision exposed 2 real bugs (shop-band colliders
walled the roadways; remote gate-chewing) + a respawn death-loop (53
deaths/80 s AFK → 8 after peel-off 4 m + grace + shove). (2) groundHeight
sampler kills the sinking (two ground planes: street 0.02 / skin 0.25) +
contact-shadow discs. (3) pointer-lock mouse-look (engaged headlessly;
deltas untestable synthetically — his first click settles it). (4) rifle
built + chest-mounted, muzzle-origin tracers. (5) eagle = real command
camera: wheel zoom 120–1400 m, drag pan. (6) drop anywhere: eagle click
sets the target; detail patch + dressing ring + ambient horde follow;
GATE EXPOSED warning + E to return. (7) zombies present: wave-1 build
8 s, spawns 48 m, 4 ambient shamblers maintained everywhere.
Shop palette law applied: fog cooled tan→slate 0x7d8489, hemi bounce
neutral-cool, LUT cool shadow reserve, ground skin slate-tinted. Checks:
grey test PASS, thumbnail PASS (eagle warm share 45.8%→3.8%), wave-peak
PARTIAL (mechanics verified, composed frame thinner than the standard).
