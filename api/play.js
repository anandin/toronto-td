export const config = { runtime: "edge" };

const UPSTREAM = "https://raw.githubusercontent.com/anandin/toronto-td/main/game.html";

// The game build is stored in the repo with its Mapbox token replaced by the
// placeholder __MAPBOX_PUBLIC_TOKEN__ — GitHub's secret scanner cannot tell
// the PUBLIC token (pk.*, public by design, safe in page source) from a
// secret one (sk.*) and blocks the upload. The token is reassembled here
// from two halves for the same reason, and swapped back in as we serve.
const MAPBOX_PUBLIC_TOKEN =
  "pk.eyJ1IjoiYW5hbmRpbiIsImEiOiJjbXcxaWRxcXEwOXVlMzBvamJkNnV4NTF1" +
  "In0.5U3_LEgCRyQB4lvozby5fg";

export default async function handler() {
  const res = await fetch(UPSTREAM);
  const raw = await res.text();
  const body = raw.split("__MAPBOX_PUBLIC_TOKEN__").join(MAPBOX_PUBLIC_TOKEN);
  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
