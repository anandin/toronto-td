# Toronto TD — Tower Defense: Downtown Toronto

A tower-defense / third-person-shooter hybrid set in a real 2×2 km slice of
downtown Toronto (Union Station is the stronghold). Eagle-view strategy runs
on a live Mapbox 3D city; diving drops you into a street-level third-person
fight on the streets you picked.

**Play it:** https://toronto-td-anand-inbasekarans-projects.vercel.app/play

## How hosting works

- This repo is the permanent home of the game build. `game.html` is the
  current self-contained build (single file, everything inlined).
- The Vercel project `toronto-td` serves a tiny landing page plus an edge
  function (`api/play.js`, routed via `vercel.json`) that streams
  `game.html` from this repo's raw URL as `text/html`. No expiring links.
- Shipping a new build = push a new `game.html` to `main`
  (`~/workspace/repos/push_toronto_td.py` does it in one commit via the
  GitHub Git Data API). The live page picks it up within a few minutes.

## Notes

- The Mapbox token in the build is a *public* token (`pk.…`) — public by
  design, safe in page source. No secret token exists or is needed.
- Map data © OpenStreetMap contributors; maps © Mapbox.
- The scenario is fictional.
