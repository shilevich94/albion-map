# Server data

## MongoDB (Atlas or local)

The server uses `MONGODB_URI` from the environment. Copy `server/.env.example` to `server/.env` and set your connection string.

**MongoDB Atlas:** use your cluster URL and add the **database name** before `?` (e.g. `albion-map`):

```bash
# In server/.env
MONGODB_URI=mongodb+srv://USER:PASSWORD@albion-map-cluster.xxxxx.mongodb.net/albion-map?retryWrites=true&w=majority&appName=albion-map-cluster
```

Copy to `server/.env` and replace with your real URI (do not commit `.env`). The server and seed script load `.env` when run from the server directory.

---

## Game maps (MongoDB seed)

Map search uses the **game maps** collection in MongoDB. To populate it from `client/src/shared/maps.json` (open-world black zone entries only), set `MONGODB_URI` (e.g. in `server/.env`) and run from the **server** directory:

```bash
cd server && npm run seed:game-maps
```

With Rush (from repo root):

```bash
rushx --project albion-map-server seed:game-maps
```

Or with env in the same line:

```bash
cd server && MONGODB_URI='mongodb+srv://...' npm run seed:game-maps
```

The script looks for `maps.json` at:

- `../../client/src/shared/maps.json` (when run from server/)
- `server/data/maps.json`
- `data/maps.json` (relative to cwd)

So you can copy `client/src/shared/maps.json` to `server/data/maps.json` if the client path is not available.

---

# Map image filename mapping

The API returns direct image URLs for maps. Two CDN sources are supported; AFM is preferred when a mapping exists.

## Albion Free Market (preferred)

- **map-image-filenames-afm.json** – maps cluster **Index** to the **AFM CDN filename** (e.g. `2347_WRL_ST_AUTO_T7_UND_OUT_Q4.webp`).
- Base URL: `https://cdn.albionfreemarket.com/AlbionWorld/map/images/`
- Add entries as you discover them (e.g. from albionfreemarket.com/albion-map network tab).

Example:

```json
{
  "2347": "2347_WRL_ST_AUTO_T7_UND_OUT_Q4.webp"
}
```

## Albion Online 2D (fallback)

- **map-image-filenames.json** – maps cluster **Index** to the **albiononline2d CDN filename** (e.g. `0204_WRL_SW_AUTO_T4_UND_ROY.png`).
- Base URL: `https://cdn.albiononline2d.com/game-images/`
- If an index has no mapping in either file, no image URL is returned (placeholder is shown on the frontend).
