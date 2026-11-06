# Toronto TD — Godot rebuild: build ticket for Codex (Astra)

## Why this exists
The Three.js web build (stage2.html, in `codebase/source/`) plays, but its
character work is hand-stuck: the rifle is chest-mounted and does not aim
with the character, collision is a grid hack, ground height is sampled.
Anand's ruling: rebuild it in a real engine with real physics. The factory
engine ruling (Nov 3) already named Godot 4 primary for exactly this
reason — plain-text scenes/scripts, headless-verifiable.

## What to port, what to leave
NOTE: the old r128 build (game.html) is not in codebase/source/ — GitHub's
secret scanner false-positives on its 1 MB of baked base64 sector data.
It lives at the repo root (published, playable) and its design numbers are
transcribed below and inside stage2.html. The Godot data/ JSONs supersede
its baked data anyway.

PORT the design and the numbers from stage2.html (they are play-tested):
- Waves: game.html's 10-wave table (in stage2.html), walker 38 HP /
  runner 34 / tank 260, chew DPS 4/3/11, Yonge Gate HP 255 at z = +18.
- Towers: barricade (hull 90), marksman (52 dmg / 1.08 s, 38 m),
  siren (14 m aura, 55% speed). Costs 30/60/40, start salvage 130,
  kills +2/+3/+25, wave bonus 10 + 2xwave, death = -10% salvage.
- The hero corner: Eaton Centre, Dundas Square, the jack-knifed TTC
  streetcar at (-1, 0.5) rot 0.85, build pads ringing the intersection.
LEAVE the web hacks: no grid collision, no ground-height sampler, no
chest-mounted props, no drag-only camera.

## Physics law (the point of the rebuild)
- Survivor = CharacterBody3D + move_and_slide. Real collision shapes
  generated from the footprint data (below) — buildings are StaticBody3D.
- The rifle attaches to the hand bone via BoneAttachment3D on the
  survivor's Skeleton3D. Aim comes from the camera: the upper body
  pitches/yaws to the aim, the muzzle is the ray origin for shots.
  If the rifle does not point where the camera points, the build fails.
- Zombies = CharacterBody3D (or NavigationAgent3D on a navmesh baked
  over the road network). They route around the streetcar and buildings,
  never through them.
- Mouse-look via pointer lock; eagle = a real RTS camera (wheel zoom,
  pan) with click-to-drop into street level at any map point.

## Data (in `data/`, metres)
Frame: origin = Yonge & Dundas, x east, z SOUTH (so godot z = data z,
godot's -z view axis points north — mind the compass in labels only).
- city-buildings.json: ~5,975 footprints {h, pts[[x,z],...]} in a 2 km box.
- city-roads.json: 1,777 roads {w, pts} — navmesh/lane source.
- assets/: survivor.glb, zombie.glb (Meshy, rigged), ttc.glb (streetcar).

## Look (locked — do not re-litigate)
Painterly dusk, per the shop's palette law: ONE warm source (the low
sun + local practicals). Fog is the sun's complement (cool slate),
hemisphere bounce neutral-cool, shade sides keep their own hue shifted
cool, final grade has a cool reserve in the shadows. The failure mode to
avoid is warm stacking — amber light x warm bounce x tan fog = the brown
flood that sank three web builds. Grey test: concrete in shade must read
grey-blue at street level and from the eagle.

## Milestone 1 (this ticket)
1. Godot project loads headless; the corner + a sector of the city stands
   from the footprint data with collision.
2. Survivor walks with physics, is blocked by a building and by the
   streetcar, aims the bone-attached rifle with mouse-look.
3. One zombie type paths around the streetcar to the gate line.
4. Proof: headless screenshots (street aim frame; zombie detour frame)
   + a physics assertion log (blocked positions), committed to the repo.

Later milestones: M2 towers/economy/gate, M3 eagle + drop-anywhere,
M4 waves/HUD/win-lose, M5 web export tuning.

## House rules
- Verify before you claim: run it headless, read the screenshots, then
  report. Anand's screen is the final judge of look; numbers and physics
  are proven by the run, not by assertion.
- Commit in small, named steps. Do not delete the web build.
