# Map image sources (research)

Summary of where Albion map/cluster images can come from.

## Official sources

### 1. **render.albiononline.com** (official render API)
- **URL:** `https://render.albiononline.com/v1/{type}/{identifier}.png`
- **Supported types:** `item`, `spell`, `wardrobe`, `destiny`, `guild/logo`
- **Cluster/maps:** No. `https://render.albiononline.com/v1/cluster/3343.png` returns **404**. There is no documented cluster/map image endpoint.

### 2. **Wiki map tiles** (Albion Online Wiki)
- **URL pattern:** `https://wiki.albiononline.com/resources/assets/maptiles/2/map_X_Y.png`
- **Format:** World map is split into a grid (e.g. `map_0_0.png`, `map_1_1.png`). Coordinates are tile (X, Y), not cluster index.
- **Problem:** No public mapping from cluster Index (e.g. `3343`) to tile (X, Y). Wiki may block hotlinking (403 in tests).
- **Use case:** If you obtain a cluster Index → (X,Y) mapping (e.g. from game data or community), you could build tile URLs.

### 3. **assets.albiononline.com**
- Used for launcher, wallpapers, and other official assets.
- No documented path for cluster/map images found.

## Community / third‑party

### 4. **cdn.albiononline2d.com** (Albion Online 2D Database)
- **URL pattern:** `https://cdn.albiononline2d.com/game-images/{filename}.png`
- **Example:** `0204_WRL_SW_AUTO_T4_UND_ROY.png` (filename is not the cluster index).
- **Issue:** Returns a placeholder SVG (“Map image unavailable”) for many requests (hotlink/referrer protection or missing resource). Our proxy can forward the request with `Referer: albiononline2d.com`; if the CDN still returns the SVG, we reject it and show our own placeholder.

## Conclusion

- There is **no official, public API or URL** that gives a cluster image by cluster Index (e.g. 3343 for Razorrock Chasm).
- **Options:**
  1. **Keep current approach:** Proxy `cdn.albiononline2d.com` with Referer/User-Agent; use our placeholder when the CDN returns SVG or errors.
  2. **Wiki tiles:** If you find or build a mapping from cluster Index → tile (X,Y), use `https://wiki.albiononline.com/resources/assets/maptiles/2/map_X_Y.png` (and check wiki hotlink policy).
  3. **Host your own:** Download or generate map images and serve them from our backend (e.g. `server/public/maps/` or a static bucket).
  4. **Ask Sandbox Interactive:** For an official cluster image API or asset pack (e.g. via support or dev relations).

**Current approach:** Embed the Albion 2D map page in an iframe; if the site blocks embedding, a fallback link is shown. Other options: link-only, self-hosted images, wiki tiles (with mapping), or official API. If you tell me which option you prefer (e.g. “try wiki tiles” or “host our own”), we can adjust the plan and code accordingly.
